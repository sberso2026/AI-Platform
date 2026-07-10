import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await ctx.kernel.intelligence.tools.listTools(ctx.tenantId);
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = await ctx.kernel.intelligence.tools.createTool({
    tenantId: ctx.tenantId,
    toolKey: body.toolKey,
    name: body.name,
    description: body.description,
    category: body.category ?? "external_api",
    riskLevel: body.riskLevel,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
}
