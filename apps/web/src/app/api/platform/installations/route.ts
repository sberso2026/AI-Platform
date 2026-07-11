import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { handleInstallationError, requireInstallationAdmin } from "@/lib/installations/with-installation-admin";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await ctx.commerce.installations.listByTenant(ctx.tenantId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireInstallationAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { ctx } = auth;

  const body = await request.json().catch(() => ({}));
  try {
    const data = await ctx!.commerce.installationLifecycle.requestInstallation({
      tenantId: ctx!.tenantId,
      productId: body.productId,
      productSlug: body.productSlug,
      workspaceId: body.workspaceId ?? ctx!.workspaceId,
      requestedVersion: body.requestedVersion,
      requestedBy: ctx!.userId,
      correlationId: request.headers.get("x-correlation-id") ?? undefined,
      workspaceIds: body.workspaceIds,
    });
    const correlationId = request.headers.get("x-correlation-id") ?? data.id;
    const { notifyTenantAdmins, AdminNotificationTypes } = await import(
      "@/lib/administration/customer-admin-notifications"
    );
    await notifyTenantAdmins(ctx!, {
      type: AdminNotificationTypes.installationRequested,
      title: "Product installation requested",
      body: `Installation workflow started for ${body.productSlug ?? "product"}.`,
      linkTarget: `/system/installations/${data.id}`,
      correlationId,
      metadata: { installationId: data.id },
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return handleInstallationError(err);
  }
}
