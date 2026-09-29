import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("analysis", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");
  if (id && action === "preflight") {
    const data = await ctx.engineering.analysisRequests.preflight(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  if (id && action === "result") {
    const data = await ctx.engineering.analysisRequests.getResult(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  if (id) {
    const data = await ctx.engineering.analysisRequests.get(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.analysisRequests.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("analysis", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const tenantId = ctx.tenantId;
  if (body.action === "preflight" && body.id) {
    const data = await ctx.engineering.analysisRequests.preflight(commerce, tenantId, body.id);
    return NextResponse.json({ data });
  }
  if (body.action === "plan" && body.id) {
    const data = await ctx.engineering.analysisRequests.createPlan(commerce, tenantId, body.id, ctx.userId);
    return NextResponse.json({ data });
  }
  if (body.action === "queue" && body.id) {
    const data = await ctx.engineering.analysisRequests.queue(commerce, tenantId, body.id, ctx.userId);
    return NextResponse.json({ data });
  }
  if (body.action === "cancel" && body.id) {
    const data = await ctx.engineering.analysisRequests.cancel(commerce, tenantId, body.id);
    return NextResponse.json({ data });
  }
  if (body.action === "review" && body.resultId && body.reviewPackageId) {
    const data = await ctx.engineering.analysisRequests.markForReview(
      commerce,
      tenantId,
      body.resultId,
      body.reviewPackageId,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "accept" && body.resultId) {
    const data = await ctx.engineering.analysisRequests.accept(commerce, tenantId, body.resultId, {
      id: ctx.userId,
      kind: "HUMAN",
      rationale: String(body.rationale ?? ""),
    });
    return NextResponse.json({ data });
  }
  if (body.action === "reject" && body.resultId) {
    const data = await ctx.engineering.analysisRequests.reject(commerce, tenantId, body.resultId, {
      id: ctx.userId,
      kind: "HUMAN",
      rationale: String(body.rationale ?? ""),
    });
    return NextResponse.json({ data });
  }
  if (body.action === "link_decision" && body.resultId && body.decisionId) {
    const data = await ctx.engineering.analysisRequests.linkDecision(
      commerce,
      tenantId,
      body.resultId,
      body.decisionId,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.analysisRequests.create(commerce, tenantId, {
    projectId: body.projectId,
    discipline: body.discipline,
    capability: body.capability,
    systemId: body.systemId,
    assetId: body.assetId,
    interfaceId: body.interfaceId,
    configurationBaselineId: body.configurationBaselineId,
    requirementIds: body.requirementIds,
    assumptionIds: body.assumptionIds,
    applicableStandardCodes: body.applicableStandardCodes,
    supportingDocumentIds: body.supportingDocumentIds,
    requestedExternalToolProfileId: body.requestedExternalToolProfileId,
    requestedOutputs: body.requestedOutputs,
    requestedBy: ctx.userId,
    actorKind: "HUMAN",
    syntheticCertification: false,
  });
  return NextResponse.json({ data });
});
