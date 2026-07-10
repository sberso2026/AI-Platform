import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [models, providers] = await Promise.all([
    ctx.kernel.intelligence.models.listModels(ctx.tenantId),
    ctx.kernel.intelligence.models.listProviders(ctx.tenantId),
  ]);
  return NextResponse.json({ data: { models, providers } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = await ctx.kernel.intelligence.models.resolveRoute(ctx.tenantId, body.intent ?? "general");
  return NextResponse.json({ data }, { status: 201 });
}
