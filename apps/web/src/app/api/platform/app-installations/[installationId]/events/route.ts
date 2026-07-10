import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { handleInstallationError } from "@/lib/installations/with-installation-admin";

type Params = { params: Promise<{ installationId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { installationId } = await params;

  try {
    const data = await ctx.commerce.applicationInstallationLifecycle.listEvents(
      ctx.tenantId,
      installationId
    );
    return NextResponse.json({ data });
  } catch (err) {
    return handleInstallationError(err);
  }
}
