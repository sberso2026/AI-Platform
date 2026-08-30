import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse, resolveRequestId } from "@/lib/lifecycle-api";
import { createHostedInspectionFromRequest, transitionAuthAction } from "@/lib/inspection-intelligence/hosted-service";
import type { InspectionSessionState } from "@rtb/inspection-intelligence";

type HostedIntent =
  | "create_plan"
  | "update_plan"
  | "get_plan"
  | "start_session"
  | "get_session"
  | "transition_session"
  | "record_observation"
  | "record_measurement"
  | "register_evidence"
  | "create_defect"
  | "link_recommendation"
  | "create_corrective_action"
  | "progress_corrective_action"
  | "record_assessment"
  | "persist_condition_rating"
  | "get_condition_rating"
  | "request_verification"
  | "complete_verification"
  | "close_out";

export const GET = withEngineeringApi("inspection-intelligence-hosted", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  const url = new URL(request.url);
  const resource = url.searchParams.get("resource");
  const id = url.searchParams.get("id");
  if (!resource || !id) {
    return lifecycleErrorResponse("invalid_hosted_read", "resource and id are required", 400, requestId);
  }
  try {
    const repo = createHostedInspectionFromRequest(
      context,
      url.searchParams.get("projectId") ?? undefined,
    );
    if (resource === "plan") return NextResponse.json({ data: await repo.getPlan(id), requestId });
    if (resource === "session") return NextResponse.json({ data: await repo.getSession(id), requestId });
    if (resource === "condition") {
      return NextResponse.json({ data: await repo.getConditionRating(id), requestId });
    }
    return lifecycleErrorResponse("unsupported_hosted_read", resource, 400, requestId);
  } catch (error) {
    return mapHostedError(error, requestId);
  }
});

export const POST = withEngineeringApi("inspection-intelligence-hosted", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const intent = String(body.intent ?? "") as HostedIntent;
    const repo = createHostedInspectionFromRequest(
      context,
      typeof body.projectId === "string" ? body.projectId : undefined,
    );
    const actorUserId = context.ctx.userId;
    const data = await dispatchIntent(intent, repo, body, transitionAuthAction(context), actorUserId);
    return NextResponse.json({ data, requestId }, { status: 201 });
  } catch (error) {
    return mapHostedError(error, requestId);
  }
});

async function dispatchIntent(
  intent: HostedIntent,
  repo: ReturnType<typeof createHostedInspectionFromRequest>,
  body: Record<string, unknown>,
  authAction: ReturnType<typeof transitionAuthAction>,
  actorUserId: string,
) {
  switch (intent) {
    case "create_plan":
      return repo.createPlan({
        tenantId: typeof body.tenantId === "string" ? body.tenantId : undefined,
        title: String(body.title ?? ""),
        targets: Array.isArray(body.targets) ? (body.targets as never) : [],
        checklistItemTypes: Array.isArray(body.checklistItemTypes)
          ? (body.checklistItemTypes as string[])
          : undefined,
      });
    case "update_plan":
      return repo.updatePlan(String(body.planId), {
        title: typeof body.title === "string" ? body.title : undefined,
        status: typeof body.status === "string" ? body.status : undefined,
      });
    case "get_plan":
      return repo.getPlan(String(body.planId));
    case "start_session":
      return repo.startSession({
        planId: String(body.planId),
        tenantId: typeof body.tenantId === "string" ? body.tenantId : undefined,
      });
    case "get_session":
      return repo.getSession(String(body.sessionId));
    case "transition_session":
      return repo.transitionSession(String(body.sessionId), body.to as InspectionSessionState, {
        action: authAction,
        actorUserId,
      });
    case "record_observation":
      return repo.recordObservation({
        sessionId: String(body.sessionId),
        checklistItemType: String(body.checklistItemType),
        body: String(body.body),
      });
    case "record_measurement":
      return repo.recordMeasurement({
        sessionId: String(body.sessionId),
        observationId: typeof body.observationId === "string" ? body.observationId : undefined,
        measurementType: String(body.measurementType),
        observedValue: body.observedValue as number | string | boolean,
        expectedValue: (body.expectedValue as number | string | boolean | null) ?? undefined,
        criteria: body.criteria as never,
      });
    case "register_evidence":
      return repo.registerEvidence({
        sessionId: String(body.sessionId),
        observationId: typeof body.observationId === "string" ? body.observationId : undefined,
        kind: body.kind as never,
        fileId: typeof body.fileId === "string" ? body.fileId : undefined,
        contentHash: typeof body.contentHash === "string" ? body.contentHash : undefined,
      });
    case "create_defect":
      return repo.createDefect({
        sessionId: String(body.sessionId),
        observationId: typeof body.observationId === "string" ? body.observationId : undefined,
        title: String(body.title),
        description: String(body.description),
        taxonomy: body.taxonomy as never,
      });
    case "link_recommendation":
      return repo.linkRecommendation({
        sessionId: String(body.sessionId),
        defectId: String(body.defectId),
        action: body.action as never,
        rationale: String(body.rationale),
      });
    case "create_corrective_action":
      return repo.createCorrectiveAction({
        sessionId: String(body.sessionId),
        defectId: String(body.defectId),
        recommendationId: typeof body.recommendationId === "string" ? body.recommendationId : undefined,
        ownerPersonId: String(body.ownerPersonId),
        dueAt: String(body.dueAt),
        description: String(body.description),
      });
    case "progress_corrective_action":
      return repo.progressCorrectiveAction(String(body.actionId), body.to as never);
    case "record_assessment":
      return repo.recordAssessment({
        sessionId: String(body.sessionId),
        defectId: typeof body.defectId === "string" ? body.defectId : undefined,
        title: String(body.title),
        body: String(body.body),
      });
    case "persist_condition_rating":
      return repo.persistConditionRating({
        sessionId: String(body.sessionId),
        componentScope: String(body.componentScope),
        inspectionScope: String(body.inspectionScope),
        observationIds: Array.isArray(body.observationIds) ? (body.observationIds as string[]) : [],
        scheme: body.scheme as never,
        ordinalCode: typeof body.ordinalCode === "string" ? body.ordinalCode : undefined,
        numericScore: typeof body.numericScore === "number" ? body.numericScore : undefined,
        confidence: Number(body.confidence),
        uncertainty: Number(body.uncertainty),
        evidenceSufficiency: body.evidenceSufficiency as never,
        packId: String(body.packId ?? "generic"),
      });
    case "get_condition_rating":
      return repo.getConditionRating(String(body.ratingId));
    case "request_verification":
      return repo.requestVerification({
        sessionId: String(body.sessionId),
        kind: body.kind as never,
        subjectId: String(body.subjectId),
      });
    case "complete_verification":
      return repo.completeVerificationRecord(String(body.verificationId), {
        status: body.status as "passed" | "failed",
        notes: typeof body.notes === "string" ? body.notes : undefined,
      });
    case "close_out":
      return repo.closeOut(String(body.sessionId));
    default:
      throw new Error("unsupported_hosted_intent");
  }
}

function mapHostedError(error: unknown, requestId: string): NextResponse {
  const message = error instanceof Error ? error.message : "hosted_inspection_failed";
  if (message.includes("not_found")) {
    return lifecycleErrorResponse("not_found", message, 404, requestId);
  }
  if (message.includes("unauthorized") || message.includes("access_denied") || message.includes("unauthenticated")) {
    return lifecycleErrorResponse("forbidden", message, 403, requestId);
  }
  if (message.includes("override_forbidden")) {
    return lifecycleErrorResponse("caller_tenant_override_forbidden", message, 403, requestId);
  }
  return lifecycleErrorResponse("hosted_inspection_failed", message, 400, requestId);
}
