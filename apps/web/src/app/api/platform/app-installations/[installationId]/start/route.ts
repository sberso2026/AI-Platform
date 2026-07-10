import { NextResponse } from "next/server";
import { handleInstallationError, requireInstallationAdmin } from "@/lib/installations/with-installation-admin";

type Params = { params: Promise<{ installationId: string }> };

export async function POST(request: Request, { params }: Params) {
  const auth = await requireInstallationAdmin();
  if ("error" in auth && auth.error) return auth.error;
  const { ctx } = auth;
  const { installationId } = await params;

  try {
    const data = await ctx!.commerce.applicationInstallationLifecycle.start(
      ctx!.tenantId,
      installationId,
      ctx!.userId,
      request.headers.get("x-correlation-id") ?? undefined
    );
    return NextResponse.json({ data });
  } catch (err) {
    return handleInstallationError(err);
  }
}
