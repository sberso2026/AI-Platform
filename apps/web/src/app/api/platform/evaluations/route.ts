import { NextResponse } from "next/server";
import { getAuthContext } from "@/lib/kernel";

export async function GET() {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [datasets, runs] = await Promise.all([
    ctx.kernel.intelligence.evaluations.listDatasets(ctx.tenantId),
    ctx.kernel.intelligence.evaluations.listRuns(ctx.tenantId),
  ]);
  return NextResponse.json({ data: { datasets, runs } });
}

export async function POST(request: Request) {
  const ctx = await getAuthContext();
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  if (body.action === "execute" && body.runId) {
    const data = await ctx.kernel.intelligence.evaluations.executeRun(body.runId, ctx.tenantId);
    return NextResponse.json({ data }, { status: 201 });
  }
  const data = await ctx.kernel.intelligence.evaluations.createRun({
    tenantId: ctx.tenantId,
    datasetId: body.datasetId,
    name: body.name ?? `Eval Run ${new Date().toISOString()}`,
    agentId: body.agentId,
    promptVersionId: body.promptVersionId,
    modelId: body.modelId,
  });
  return NextResponse.json({ data }, { status: 201 });
}
