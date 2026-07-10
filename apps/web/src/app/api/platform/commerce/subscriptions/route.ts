import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subscriptions = await ctx.commerce.subscriptions.listByTenant(ctx.tenantId);
  return NextResponse.json({ data: subscriptions });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const subscription = await ctx.commerce.subscriptions.create({
    tenantId: ctx.tenantId,
    productId: body.productId,
    planId: body.planId,
    workspaceId: body.workspaceId,
    status: body.status,
    quantity: body.quantity,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data: subscription }, { status: 201 });
}
