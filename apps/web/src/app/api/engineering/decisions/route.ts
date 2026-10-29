import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("decisions", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    const data = await ctx.engineering.decisions.get(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.decisions.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("decisions", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (body.action === "approve" && body.id) {
    const data = await ctx.engineering.decisions.approve(commerce, ctx.tenantId, body.id, ctx.userId);
    return NextResponse.json({ data });
  }
  if (body.action === "select_alternative" && body.id && body.alternativeId) {
    const data = await ctx.engineering.decisions.selectAlternative(
      commerce,
      ctx.tenantId,
      body.id,
      body.alternativeId,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "record_approval" && body.id && body.approvalAction) {
    const data = await ctx.engineering.decisions.recordApproval(commerce, ctx.tenantId, body.id, {
      action: body.approvalAction,
      actorId: ctx.userId,
      comments: body.comments,
      authorityRole: body.authorityRole,
      evidenceRef: body.evidenceRef,
    });
    return NextResponse.json({ data });
  }
  if (body.action === "supersede" && body.id && body.supersedesDecisionId) {
    const data = await ctx.engineering.decisions.supersede(
      commerce,
      ctx.tenantId,
      body.id,
      body.supersedesDecisionId,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "create_alternative" && body.id && body.name) {
    const data = await ctx.engineering.decisions.createAlternative(commerce, {
      tenantId: ctx.tenantId,
      decisionId: body.id,
      name: body.name,
      alternativeCode: body.alternativeCode,
      description: body.description,
      rationale: body.rationale,
      source: body.source,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "link" && body.fromType && body.fromId && body.toType && body.toId && body.relationship) {
    const data = await ctx.engineering.decisions.linkGoverned(commerce, ctx.tenantId, {
      fromType: body.fromType,
      fromId: body.fromId,
      toType: body.toType,
      toId: body.toId,
      relationship: body.relationship,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
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
    confidence: body.confidence ? Number(body.confidence) : undefined,
    decisionQuestion: body.decisionQuestion,
    authorityId: body.authorityId,
    effectiveAt: body.effectiveAt,
    supersedesDecisionId: body.supersedesDecisionId,
    priority: body.priority,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});

export const PATCH = withEngineeringApi("decisions", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 422 });
  if (body.alternativeId && (body.name || body.description || body.alternativeStatus)) {
    const data = await ctx.engineering.decisions.updateAlternative(commerce, ctx.tenantId, body.alternativeId, {
      name: body.name,
      description: body.description,
      status: body.alternativeStatus,
      rationale: body.rationale,
    });
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.decisions.updateDecision(
    commerce,
    ctx.tenantId,
    body.id,
    {
      title: body.title,
      description: body.description,
      rationale: body.rationale,
      decisionQuestion: body.decisionQuestion,
      authorityId: body.authorityId,
      confidence: body.confidence !== undefined ? Number(body.confidence) : undefined,
      recommendation: body.recommendation,
      effectiveAt: body.effectiveAt,
    },
    ctx.userId,
  );
  return NextResponse.json({ data });
});
