import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleOkResponse } from "@/lib/lifecycle-api";

export const GET = withEngineeringApi("decisions", async ({ ctx, commerce }, request) => {
  const projectId = new URL(request.url).searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.decisions.list(commerce, ctx.tenantId, projectId);
  return lifecycleOkResponse(data);
});

export const POST = withEngineeringApi("decisions", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "approve" && body.id) {
    const data = await ctx.engineering.decisions.approve(commerce, ctx.tenantId, body.id, ctx.userId);
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.decisions.create(commerce, {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId,
    title: body.title,
    description: body.description,
    decisionType: body.decisionType,
    category: body.category,
    projectId: body.projectId,
    assetId: body.assetId,
    disciplineId: body.disciplineId,
    recommendation: body.recommendation,
    rationale: body.rationale,
    alternatives: body.alternatives,
    consequences: body.consequences,
    confidence: body.confidence,
    priority: body.priority,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
