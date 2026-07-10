import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [traces, metrics] = await Promise.all([
    ctx.kernel.intelligence.observability.listTraces(ctx.tenantId),
    ctx.kernel.intelligence.observability.getMetricsSummary(ctx.tenantId),
  ]);
  return NextResponse.json({ data: { traces, metrics } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const data = await ctx.kernel.intelligence.observability.startTrace({
    tenantId: ctx.tenantId,
    name: body.name ?? "manual.trace",
    source: body.source ?? "api",
    metadata: body.metadata,
  });
  return NextResponse.json({ data }, { status: 201 });
}
