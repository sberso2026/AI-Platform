import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApi } from "@/lib/commerce/engineering-api";

function statusFor(message: string): number {
  if (message.includes("denied") || message.includes("mismatch") || message === "unknown_lifecycle_profile") return 403;
  if (message === "caller_supplied_evidence_rejected") return 400;
  if (message === "workspace_required" || message === "rationale_required" || message === "human_actor_required") return 400;
  return 400;
}

export const GET = withEngineeringApi("lifecycle", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "catalog";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.lifecycle.catalog() });
  }
  if (action === "profile") {
    const data = await ctx.engineering.lifecycle.profile(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? "";
  if (action === "assignments" && projectId) {
    const data = await ctx.engineering.lifecycle.assignments(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "scoped" && projectId) {
    const data = await ctx.engineering.lifecycle.scopedStates(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "effective" && projectId) {
    const data = await ctx.engineering.lifecycle.effective(commerce, ctx.tenantId, {
      projectId,
      scopeType: (url.searchParams.get("scopeType") as "PROJECT" | "SYSTEM" | "ASSET") ?? "PROJECT",
      scopeId: url.searchParams.get("scopeId") ?? projectId,
      parentScopeType: (url.searchParams.get("parentScopeType") as "PROJECT" | "SYSTEM" | "ASSET" | null) ?? null,
      parentScopeId: url.searchParams.get("parentScopeId"),
    });
    return NextResponse.json({ data });
  }
  if (action === "evaluation") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.lifecycle.getEvaluation(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data });
  }
  if (action === "snapshot") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const evaluation = await ctx.engineering.lifecycle.getEvaluation(commerce, ctx.tenantId, id);
    if (!evaluation) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data: evaluation.evidenceSnapshot ?? null });
  }
  if (action === "history") {
    const assignmentId = url.searchParams.get("assignmentId");
    if (!assignmentId) return NextResponse.json({ error: "assignment_id_required" }, { status: 400 });
    const data = await ctx.engineering.lifecycle.history(commerce, ctx.tenantId, assignmentId);
    return NextResponse.json({ data });
  }
  if (action === "mappings" && projectId) {
    const data = await ctx.engineering.lifecycle.scheduleMappings(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "alignment" && projectId) {
    const data = await ctx.engineering.lifecycle.scheduleAlignment(commerce, ctx.tenantId, {
      projectId,
      scopeType: (url.searchParams.get("scopeType") as "PROJECT" | "SYSTEM" | "ASSET") ?? "PROJECT",
      scopeId: url.searchParams.get("scopeId") ?? projectId,
      legacyProjectPhase: url.searchParams.get("legacyProjectPhase"),
    });
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.lifecycle.profile(commerce, ctx.tenantId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("lifecycle", async ({ ctx, commerce, correlationId }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const action = String(body.action ?? "");
  try {
    if (action === "assign") {
      const data = await ctx.engineering.lifecycle.assign(commerce, ctx.tenantId, {
        projectId: String(body.projectId ?? ""),
        scopeType: String(body.scopeType ?? "PROJECT") as "PROJECT" | "SYSTEM" | "ASSET",
        scopeId: String(body.scopeId ?? ""),
        stage: String(body.stage ?? "FEED") as
          | "CONCEPT"
          | "PREFEASIBILITY"
          | "FEASIBILITY"
          | "FEED"
          | "DETAILED_DESIGN"
          | "CONSTRUCTION"
          | "COMMISSIONING"
          | "OPERATIONS"
          | "MODIFICATION",
        parentScopeType: body.parentScopeType
          ? (String(body.parentScopeType) as "PROJECT" | "SYSTEM" | "ASSET")
          : null,
        parentScopeId: typeof body.parentScopeId === "string" ? body.parentScopeId : null,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    if (action === "evaluate" || action === "refresh") {
      if (body.evidence) {
        return NextResponse.json({ error: "caller_supplied_evidence_rejected" }, { status: 400 });
      }
      if (action === "refresh" && typeof body.evaluationId === "string") {
        const data = await ctx.engineering.lifecycle.refreshStale(commerce, ctx.tenantId, body.evaluationId);
        return NextResponse.json({ data });
      }
      const data = await ctx.engineering.lifecycle.evaluateGate(commerce, ctx.tenantId, {
        assignmentId: String(body.assignmentId ?? ""),
        gateId: String(body.gateId ?? ""),
      });
      return NextResponse.json({ data });
    }
    if (action === "mapping") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "lifecycle_authority_required" }, { status: 403 });
      }
      const data = await ctx.engineering.lifecycle.saveScheduleMapping(settingsCommerce, ctx.tenantId, {
        projectId: String(body.projectId ?? ""),
        sourceSystem: body.sourceSystem === "LEGACY_PROJECT_PHASE" ? "LEGACY_PROJECT_PHASE" : "PROJECT_CONTROLS",
        scheduleObjectId: String(body.scheduleObjectId ?? ""),
        schedulePhaseCode: String(body.schedulePhaseCode ?? ""),
        expectedLifecycleStage: String(body.expectedLifecycleStage ?? "FEED") as
          | "CONCEPT"
          | "PREFEASIBILITY"
          | "FEASIBILITY"
          | "FEED"
          | "DETAILED_DESIGN"
          | "CONSTRUCTION"
          | "COMMISSIONING"
          | "OPERATIONS"
          | "MODIFICATION",
        mappingType: (typeof body.mappingType === "string" ? body.mappingType : "ALIGNS_WITH") as
          | "ALIGNS_WITH"
          | "EXPECTED_DURING"
          | "GATE_MILESTONE"
          | "TRANSITION_MILESTONE"
          | "REFERENCE_ONLY",
        scheduleStatus: (typeof body.scheduleStatus === "string" ? body.scheduleStatus : "planned") as
          | "planned"
          | "active"
          | "complete",
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    if (action === "decide" || action === "transition") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "lifecycle_authority_required" }, { status: 403 });
      }
      if (action === "decide") {
        const data = await ctx.engineering.lifecycle.recordGateDecision(settingsCommerce, ctx.tenantId, {
          evaluationId: String(body.evaluationId ?? ""),
          decision: body.decision as "APPROVED_TO_TRANSITION" | "APPROVED_WITH_CONDITIONS" | "NOT_APPROVED" | "DEFERRED" | "WAIVED",
          rationale: String(body.rationale ?? ""),
          actorId: ctx.userId,
          outstandingConditionIds: Array.isArray(body.outstandingConditionIds)
            ? body.outstandingConditionIds.map(String)
            : [],
        });
        return NextResponse.json({ data });
      }
      const data = await ctx.engineering.lifecycle.transition(settingsCommerce, ctx.tenantId, {
        assignmentId: String(body.assignmentId ?? ""),
        toStage: String(body.toStage ?? "") as
          | "CONCEPT"
          | "PREFEASIBILITY"
          | "FEASIBILITY"
          | "FEED"
          | "DETAILED_DESIGN"
          | "CONSTRUCTION"
          | "COMMISSIONING"
          | "OPERATIONS"
          | "MODIFICATION",
        evaluationId: typeof body.evaluationId === "string" ? body.evaluationId : undefined,
        actorId: ctx.userId,
        rationale: String(body.rationale ?? ""),
      });
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "unsupported_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "lifecycle_action_failed";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
});
