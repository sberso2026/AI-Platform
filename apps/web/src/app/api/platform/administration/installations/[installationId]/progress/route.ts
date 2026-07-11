import { NextResponse } from "next/server";
import { mapInstallationProgress } from "@rtb/platform-core";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";
import { handleInstallationError } from "@/lib/installations/with-installation-admin";

type Params = { params: Promise<{ installationId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const denied = await requireCommerceAdmin(ctx);
  if (denied) return denied;

  const { installationId } = await params;

  try {
    const installation = await ctx.commerce.installations.getById(ctx.tenantId, installationId);
    if (!installation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const [{ steps }, health, product] = await Promise.all([
      ctx.commerce.installationLifecycle.getWorkflowProgress(ctx.tenantId, installationId),
      ctx.commerce.installationHealth.check(ctx.tenantId, installationId).catch(() => null),
      ctx.commerce.products.getById(installation.product_id),
    ]);

    const progress = mapInstallationProgress({
      installation: {
        id: installation.id,
        status: installation.status,
        product_id: installation.product_id,
        metadata: installation.metadata as Record<string, unknown>,
      },
      workflowSteps: steps.map((s) => ({
        step_key: s.step_key as string,
        step_order: s.step_order as number | undefined,
        status: s.status as string,
        started_at: s.started_at as string | null | undefined,
        completed_at: s.completed_at as string | null | undefined,
        error_code: s.error_code as string | null | undefined,
        error_message: s.error_message as string | null | undefined,
      })),
      productSlug: product?.slug,
      productName: product?.name,
      healthCheckStatus: (health as { status?: string } | null)?.status,
    });

    return NextResponse.json({ data: progress });
  } catch (err) {
    return handleInstallationError(err);
  }
}
