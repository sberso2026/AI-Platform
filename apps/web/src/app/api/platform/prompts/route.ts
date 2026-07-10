import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await ctx.kernel.intelligence.prompts.listPrompts(ctx.tenantId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = await ctx.kernel.intelligence.prompts.createPrompt({
    tenantId: ctx.tenantId,
    promptKey: body.promptKey,
    name: body.name,
    content: body.content,
    description: body.description,
    agentType: body.agentType,
    isSafetyCritical: body.isSafetyCritical,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
}
