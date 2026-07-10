import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [events, summary, budgets] = await Promise.all([
    ctx.kernel.intelligence.costs.listEvents(ctx.tenantId),
    ctx.kernel.intelligence.costs.getSummary(ctx.tenantId),
    ctx.kernel.intelligence.costs.listBudgets(ctx.tenantId),
  ]);
  return NextResponse.json({ data: { events, summary, budgets } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = await ctx.kernel.intelligence.costs.recordEvent({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    eventType: body.eventType ?? "model_call",
    amount: body.amount ?? 0,
    quantity: body.quantity,
    userId: ctx.userId,
    metadata: body.metadata,
  });
  return NextResponse.json({ data }, { status: 201 });
}
