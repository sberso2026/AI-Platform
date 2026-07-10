import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const decision = await ctx.commerce.entitlements.check({
    tenantId: ctx.tenantId,
    workspaceId: body.workspaceId ?? ctx.workspaceId,
    userId: body.userId ?? ctx.userId,
    productKey: body.productKey,
    applicationKey: body.applicationKey,
    featureKey: body.featureKey,
    action: body.action ?? "access",
    usageAmount: body.usageAmount,
  });

  return NextResponse.json({ data: decision });
}
