import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { handleInstallationError, requireInstallationAdmin } from "@/lib/installations/with-installation-admin";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await ctx.commerce.applicationInstallationLifecycle.listByTenant(ctx.tenantId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const auth = await requireInstallationAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { ctx } = auth;

  const body = await request.json().catch(() => ({}));
  try {
    const data = await ctx!.commerce.applicationInstallationLifecycle.requestInstallation({
      tenantId: ctx!.tenantId,
      productId:
        body.productId ||
        (body.applicationKey === "project_intelligence" ||
        body.applicationKey === "inspection_intelligence"
          ? "c1000000-0000-4000-8000-000000000001"
          : undefined),
      applicationKey: body.applicationKey,
      workspaceId: body.workspaceId ?? ctx!.workspaceId,
      requestedVersion: body.requestedVersion,
      requestedBy: ctx!.userId,
      correlationId: request.headers.get("x-correlation-id") ?? undefined,
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    return handleInstallationError(err);
  }
}
