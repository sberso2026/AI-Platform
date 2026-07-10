import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memories = await ctx.kernel.memory.list(ctx.tenantId);
  return NextResponse.json({ data: memories });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const memory = await ctx.kernel.memory.store({
    tenantId: ctx.tenantId,
    scopeKey: body.scopeKey ?? "workspace",
    scopeRefId: body.scopeRefId ?? ctx.workspaceId ?? ctx.tenantId,
    content: body.content,
    classification: body.classification,
    createdBy: ctx.userId,
  });

  return NextResponse.json({ data: memory }, { status: 201 });
}
