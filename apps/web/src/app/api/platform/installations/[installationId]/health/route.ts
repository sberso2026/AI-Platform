import { NextResponse } from "next/server";
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
    const data = await ctx.commerce.installationHealth.check(ctx.tenantId, installationId);
    return NextResponse.json({ data });
  } catch (err) {
    return handleInstallationError(err);
  }
}
