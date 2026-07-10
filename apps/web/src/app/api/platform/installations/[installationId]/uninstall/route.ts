import { NextResponse } from "next/server";
import { handleInstallationError, requireInstallationAdmin } from "@/lib/installations/with-installation-admin";

type Params = { params: Promise<{ installationId: string }> };

export async function POST(_request: Request, { params }: Params) {
  const auth = await requireInstallationAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { ctx } = auth;
  const { installationId } = await params;

  try {
    await ctx!.commerce.installationLifecycle.requestUninstall(
      ctx!.tenantId,
      installationId,
      ctx!.userId
    );
    const data = await ctx!.commerce.installationLifecycle.uninstall(
      ctx!.tenantId,
      installationId,
      ctx!.userId
    );
    return NextResponse.json({ data });
  } catch (err) {
    return handleInstallationError(err);
  }
}
