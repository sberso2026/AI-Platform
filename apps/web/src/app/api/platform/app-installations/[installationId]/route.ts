import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { handleInstallationError, requireInstallationAdmin } from "@/lib/installations/with-installation-admin";

type Params = { params: Promise<{ installationId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { installationId } = await params;

  const data = await ctx.commerce.applicationInstallationLifecycle.getById(
    ctx.tenantId,
    installationId
  );
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data });
}
