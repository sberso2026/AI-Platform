import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";
import { requireCommerceAdmin } from "@/lib/commerce/with-commerce-entitlement";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminDenied = await requireCommerceAdmin(ctx);
  if (adminDenied) return adminDenied;

  const body = await request.json().catch(() => ({}));

  const result = await ctx.commerce.entitlements.diagnose({
    tenantId: ctx.tenantId,
    workspaceId: body.workspaceId ?? ctx.workspaceId,
    userId: body.userId ?? ctx.userId,
    productKey: body.productKey,
    applicationKey: body.applicationKey,
    featureKey: body.featureKey,
    action: body.action ?? "access",
  });

  return NextResponse.json({ data: result });
}
