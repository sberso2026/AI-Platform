import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const events = await ctx.kernel.eventBus.list(ctx.tenantId);
  return NextResponse.json({ data: events });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const event = await ctx.kernel.eventBus.publish({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    eventType: body.eventType,
    payload: body.payload ?? {},
    metadata: body.metadata ?? {},
  });

  return NextResponse.json({ data: event }, { status: 201 });
}
