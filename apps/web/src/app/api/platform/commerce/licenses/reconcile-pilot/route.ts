import { NextResponse } from "next/server";
import {
  CommerceDomainError,
  InstallationConflictError,
  LicenseIssuanceService,
} from "@rtb/platform-commerce";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { assertPilotTenantScope } from "@/lib/commerce/pilot-tenant";
import { requireInstallationAdmin } from "@/lib/installations/with-installation-admin";

const ENGINEERING_OS_PRODUCT_ID = "c1000000-0000-4000-8000-000000000001";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDenied = await requireCommerceAdmin(ctx);
  if (adminDenied) return adminDenied;

  const installAuth = await requireInstallationAdmin(request);
  if ("error" in installAuth && installAuth.error) return installAuth.error;

  const tenantDenied = assertPilotTenantScope(ctx.tenantId);
  if (tenantDenied) return tenantDenied;

  const body = await request.json().catch(() => ({}));
  const productId = body.productId ?? ENGINEERING_OS_PRODUCT_ID;
  const subscriptions = await ctx.commerce.subscriptions.listByTenant(ctx.tenantId);
  const subscription =
    subscriptions.find((s) => s.id === body.subscriptionId) ??
    subscriptions.find((s) => s.product_id === productId && s.status === "active") ??
    subscriptions.find((s) => s.product_id === productId);

  if (!subscription) {
    return NextResponse.json(
      { error: "No Engineering OS subscription found to reconcile" },
      { status: 422 },
    );
  }

  try {
    const result = await ctx.commerce.licences.reconcilePilotProfile({
      tenantId: ctx.tenantId,
      productId,
      subscriptionId: subscription.id,
      issuedBy: ctx.userId,
    });

    const installed: string[] = [];
    const installSkipped: string[] = [];
    const installFailed: Array<{ applicationKey: string; error: string }> = [];

    for (const applicationKey of LicenseIssuanceService.PILOT_APPLICATION_KEYS) {
      try {
        await ctx.commerce.applicationInstallationLifecycle.requestInstallation({
          tenantId: ctx.tenantId,
          productId,
          applicationKey,
          workspaceId: ctx.workspaceId,
          requestedBy: ctx.userId,
          correlationId: request.headers.get("x-correlation-id") ?? undefined,
        });
        installed.push(applicationKey);
      } catch (err) {
        if (err instanceof InstallationConflictError || (err instanceof CommerceDomainError && err.code === "installation_conflict")) {
          installSkipped.push(applicationKey);
          continue;
        }
        installFailed.push({
          applicationKey,
          error: err instanceof Error ? err.message : "Installation failed",
        });
      }
    }

    return NextResponse.json({
      data: {
        profile: "engineering-os-pilot",
        subscriptionId: subscription.id,
        issued: result.issued,
        skipped: result.skipped,
        catalog: result.catalog,
        installed,
        installSkipped,
        installFailed,
      },
    });
  } catch (err) {
    if (err instanceof CommerceDomainError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.statusCode });
    }
    throw err;
  }
}
