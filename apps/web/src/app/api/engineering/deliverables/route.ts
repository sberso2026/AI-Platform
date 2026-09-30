import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApi } from "@/lib/commerce/engineering-api";

function statusFor(message: string): number {
  if (message.includes("denied") || message.includes("mismatch") || message === "unknown_maturity_profile") return 403;
  if (message === "caller_supplied_maturity_rejected") return 400;
  if (message === "workspace_required" || message === "rationale_required") return 400;
  return 400;
}

export const GET = withEngineeringApi("deliverables", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "catalog";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.deliverables.catalog() });
  }
  const projectId = url.searchParams.get("projectId") ?? "";
  if (action === "list" && projectId) {
    const data = await ctx.engineering.deliverables.list(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "detail") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.deliverables.getDetail(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data });
  }
  if (action === "lifecycle" && projectId) {
    const data = await ctx.engineering.deliverables.lifecycleSummary(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  return NextResponse.json({ data: ctx.engineering.deliverables.catalog() });
});

export const POST = withEngineeringApi("deliverables", async ({ ctx, commerce, correlationId }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const action = String(body.action ?? "");
  try {
    if (body.maturityClaims || body.contentComplete || body.reviewComplete || body.traceabilityComplete || body.coordinationComplete) {
      return NextResponse.json({ error: "caller_supplied_maturity_rejected" }, { status: 400 });
    }
    if (action === "instantiate") {
      const data = await ctx.engineering.deliverables.instantiate(commerce, ctx.tenantId, {
        projectId: String(body.projectId ?? ""),
        code: String(body.code ?? ""),
        scopeType: body.scopeType ? (String(body.scopeType) as "PROJECT" | "SYSTEM" | "ASSET") : undefined,
        scopeId: typeof body.scopeId === "string" ? body.scopeId : undefined,
        stage: typeof body.stage === "string" ? (body.stage as never) : undefined,
        purpose: typeof body.purpose === "string" ? (body.purpose as never) : undefined,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    if (action === "bind") {
      const data = await ctx.engineering.deliverables.bind(commerce, ctx.tenantId, {
        expectationId: String(body.expectationId ?? ""),
        artifactClass: String(body.artifactClass ?? "") as never,
        artifactId: String(body.artifactId ?? ""),
        artifactRole: String(body.artifactRole ?? "PRIMARY") as never,
        revisionRef: typeof body.revisionRef === "string" ? body.revisionRef : null,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    if (action === "evaluate") {
      const data = await ctx.engineering.deliverables.evaluate(commerce, ctx.tenantId, {
        expectationId: String(body.expectationId ?? ""),
      });
      return NextResponse.json({ data });
    }
    if (action === "waive") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "deliverable_authority_required" }, { status: 403 });
      }
      const data = await ctx.engineering.deliverables.waive(settingsCommerce, ctx.tenantId, {
        expectationId: String(body.expectationId ?? ""),
        assessmentId: String(body.assessmentId ?? ""),
        dimension: String(body.dimension ?? "") as never,
        rationale: String(body.rationale ?? ""),
        actorId: ctx.userId,
        supportingDecisionId: typeof body.supportingDecisionId === "string" ? body.supportingDecisionId : null,
      });
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "unsupported_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "deliverable_action_failed";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
});
