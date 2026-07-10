import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const message = body.message as string;
  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const result = await ctx.kernel.aiDirector.run({
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    userId: ctx.userId,
    sessionId: body.sessionId,
    message: message.trim(),
    context: body.context,
  });

  return NextResponse.json({ data: result });
}

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [runs, agents] = await Promise.all([
    ctx.kernel.aiDirector.listRuns(ctx.tenantId),
    ctx.kernel.aiDirector.listAgents(ctx.tenantId),
  ]);

  return NextResponse.json({ data: { runs, agents } });
}
