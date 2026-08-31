import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse, resolveRequestId } from "@/lib/lifecycle-api";
import { createHostedInspectionFromRequest, transitionAuthAction } from "@/lib/inspection-intelligence/hosted-service";
import type { InspectionSessionState } from "@rtb/inspection-intelligence";
import {
  GENERIC_NUMERIC_SCHEME_V1,
  II_GOVERNED_REPORT_TYPES,
  II_PDF_EXPORT_AVAILABLE,
  STRUCTURAL_ORDINAL_SCHEME_V1,
} from "@rtb/inspection-intelligence";

type HostedIntent =
  | "create_plan"
  | "update_plan"
  | "get_plan"
  | "start_session"
  | "resume_session"
  | "get_session"
  | "transition_session"
  | "record_observation"
  | "record_measurement"
  | "register_evidence"
  | "create_defect"
  | "transition_defect"
  | "link_recommendation"
  | "create_corrective_action"
  | "progress_corrective_action"
  | "record_assessment"
  | "persist_condition_rating"
  | "get_condition_rating"
  | "request_verification"
  | "complete_verification"
  | "close_out"
  | "compose_report"
  | "transition_report";

export const GET = withEngineeringApi("inspection-intelligence-hosted", async (context, request) => {
  const requestId = resolveRequestId(request) ?? context.correlationId;
  const url = new URL(request.url);
  const resource = url.searchParams.get("resource");
  const id = url.searchParams.get("id");
  if (!resource) {
    return lifecycleErrorResponse("invalid_hosted_read", "resource is required", 400, requestId);
  }
  try {
    const repo = createHostedInspectionFromRequest(
      context,
      url.searchParams.get("projectId") ?? undefined,
    );
    if (resource === "capabilities") {
      const payload = {
        data: {
          canWrite: context.ctx.roleSlug !== "viewer",
          action: transitionAuthAction(context),
        },
        requestId,
      };
      if (url.searchParams.get("profile") === "1") {
        return NextResponse.json({
          ...payload,
          profile: { security: context.securityProfile },
        });
      }
      return NextResponse.json(payload);
    }
    if (resource === "runtime_ping") {
      const pingStarted = Date.now();
      const { error, count } = await context.ctx.supabase
        .from("tenants")
        .select("id", { count: "exact", head: true })
        .eq("id", context.ctx.tenantId);
      return NextResponse.json({
        data: { ok: !error, count: count ?? 0 },
        requestId,
        profile: {
          security: context.securityProfile,
          domainMs: Date.now() - pingStarted,
          pingMs: Date.now() - pingStarted,
        },
      });
    }
    if (resource === "overview") {
      return NextResponse.json({
        data: {
          ...(await repo.getOverview()),
          canWrite: context.ctx.roleSlug !== "viewer",
        },
        requestId,
      });
    }
    if (resource === "plans") return NextResponse.json({ data: await repo.listPlans(), requestId });
    if (resource === "sessions") return NextResponse.json({ data: await repo.listSessions(), requestId });
    if (resource === "templates") return NextResponse.json({ data: await repo.listTemplates(), requestId });
    if (resource === "locations") {
      return NextResponse.json({ data: await repo.listSpatialLocations(), requestId });
    }
    if (resource === "intelligence") {
      return NextResponse.json({ data: await repo.getIntelligence(), requestId });
    }
    if (resource === "command_centre") {
      const domainStarted = Date.now();
      const view = await repo.getCommandCentre({ canWrite: context.ctx.roleSlug !== "viewer" });
      return NextResponse.json({
        data: view,
        requestId,
        profile: {
          security: context.securityProfile,
          domainMs: Date.now() - domainStarted,
          composition: view.profile,
        },
      });
    }
    if (resource === "defects") {
      return NextResponse.json({
        data: await repo.listDefects(url.searchParams.get("sessionId") ?? undefined),
        requestId,
      });
    }
    if (resource === "recommendations") {
      return NextResponse.json({
        data: await repo.listRecommendations(url.searchParams.get("sessionId") ?? undefined),
        requestId,
      });
    }
    if (resource === "corrective_actions") {
      return NextResponse.json({
        data: await repo.listCorrectiveActions(url.searchParams.get("sessionId") ?? undefined),
        requestId,
      });
    }
    if (resource === "assessments") {
      return NextResponse.json({
        data: await repo.listAssessments(url.searchParams.get("sessionId") ?? undefined),
        requestId,
      });
    }
    if (resource === "conditions") {
      return NextResponse.json({
        data: await repo.listConditionRatings(url.searchParams.get("sessionId") ?? undefined),
        requestId,
      });
    }
    if (resource === "verifications") {
      return NextResponse.json({
        data: await repo.listVerifications(url.searchParams.get("sessionId") ?? undefined),
        requestId,
      });
    }
    if (resource === "evidence") {
      return NextResponse.json({
        data: await repo.listEvidence(url.searchParams.get("sessionId") ?? undefined),
        requestId,
      });
    }
    if (resource === "history") {
      const domainStarted = Date.now();
      const data = await repo.listHistory({
        targetKind: url.searchParams.get("targetKind") ?? undefined,
        targetCanonicalId: url.searchParams.get("targetCanonicalId") ?? undefined,
        planId: url.searchParams.get("planId") ?? undefined,
        sessionId: url.searchParams.get("sessionId") ?? undefined,
        from: url.searchParams.get("from") ?? undefined,
        to: url.searchParams.get("to") ?? undefined,
        inspectionType: url.searchParams.get("inspectionType") ?? undefined,
      });
      return NextResponse.json({
        data,
        requestId,
        profile: {
          security: context.securityProfile,
          domainMs: Date.now() - domainStarted,
          composition: (data as { profile?: unknown }).profile,
        },
      });
    }
    if (resource === "history_intelligence") {
      return NextResponse.json({
        data: await repo.getHistoryIntelligence({
          targetKind: url.searchParams.get("targetKind") ?? undefined,
          targetCanonicalId: url.searchParams.get("targetCanonicalId") ?? undefined,
          planId: url.searchParams.get("planId") ?? undefined,
          from: url.searchParams.get("from") ?? undefined,
          to: url.searchParams.get("to") ?? undefined,
        }),
        requestId,
      });
    }
    if (resource === "target_history") {
      const kind = url.searchParams.get("kind");
      const canonicalId = url.searchParams.get("canonicalId") ?? id;
      if (!kind || !canonicalId) {
        return lifecycleErrorResponse("invalid_hosted_read", "kind and canonicalId are required", 400, requestId);
      }
      const domainStarted = Date.now();
      const data = await repo.getTargetHistory({ kind, canonicalId });
      return NextResponse.json({
        data,
        requestId,
        profile: {
          security: context.securityProfile,
          domainMs: Date.now() - domainStarted,
          composition: (data as { profile?: unknown }).profile,
        },
      });
    }
    if (resource === "reports") {
      return NextResponse.json({ data: await repo.listReports(), requestId });
    }
    if (resource === "report_types") {
      return NextResponse.json({
        data: { types: II_GOVERNED_REPORT_TYPES, pdfAvailable: II_PDF_EXPORT_AVAILABLE },
        requestId,
      });
    }
    if (!id) {
      return lifecycleErrorResponse("invalid_hosted_read", "id is required", 400, requestId);
    }
    if (resource === "plan") return NextResponse.json({ data: await repo.getPlan(id), requestId });
    if (resource === "session") return NextResponse.json({ data: await repo.getSession(id), requestId });
    if (resource === "execution") {
      const profile = url.searchParams.get("profile") === "1";
      return NextResponse.json({ data: await repo.getSessionWorkspace(id, { profile }), requestId });
    }
    if (resource === "defect") {
      return NextResponse.json({ data: await repo.getDefectWorkspace(id), requestId });
    }
    if (resource === "condition") {
      return NextResponse.json({ data: await repo.getConditionRating(id), requestId });
    }
    if (resource === "report") {
      const domainStarted = Date.now();
      const data = await repo.getReport(id);
      return NextResponse.json({
        data,
        requestId,
        profile: { security: context.securityProfile, domainMs: Date.now() - domainStarted },
      });
    }
    if (resource === "report_export") {
      const row = await repo.getReport(id);
      return NextResponse.json({ data: repo.exportReportMarkdown(row), requestId });
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
    const domainStarted = Date.now();
    const data = await dispatchIntent(intent, repo, body, transitionAuthAction(context), actorUserId);
    const wantProfile = body.profile === true || new URL(request.url).searchParams.get("profile") === "1";
    const domainProfile =
      data && typeof data === "object" && "profile" in (data as Record<string, unknown>)
        ? (data as { profile?: unknown }).profile
        : undefined;
    return NextResponse.json(
      wantProfile
        ? {
            data,
            requestId,
            profile: {
              security: context.securityProfile,
              domainMs: Date.now() - domainStarted,
              intent,
              domain: domainProfile,
            },
          }
        : { data, requestId },
      { status: 201 },
    );
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
        templateTitle: typeof body.templateTitle === "string" ? body.templateTitle : undefined,
        templateId: typeof body.templateId === "string" ? body.templateId : undefined,
        templateVersionId: typeof body.templateVersionId === "string" ? body.templateVersionId : undefined,
        nextDueAt: typeof body.nextDueAt === "string" ? body.nextDueAt : undefined,
        frequency: typeof body.frequency === "string" ? body.frequency : undefined,
      });
    case "update_plan":
      return repo.updatePlan(String(body.planId), {
        title: typeof body.title === "string" ? body.title : undefined,
        status: typeof body.status === "string" ? body.status : undefined,
        nextDueAt: typeof body.nextDueAt === "string" ? body.nextDueAt : undefined,
        frequency: typeof body.frequency === "string" ? body.frequency : undefined,
      });
    case "get_plan":
      return repo.getPlan(String(body.planId));
    case "start_session":
      return repo.startSession({
        planId: String(body.planId),
        tenantId: typeof body.tenantId === "string" ? body.tenantId : undefined,
      });
    case "resume_session":
      return repo.transitionSession(String(body.sessionId), "started", {
        action: authAction,
        actorUserId,
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
        unit: typeof body.unit === "string" ? body.unit : undefined,
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
    case "transition_defect":
      return repo.transitionDefectRecord(String(body.defectId), body.to as never);
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
        ownerPersonId:
          typeof body.ownerPersonId === "string" && body.ownerPersonId && body.ownerPersonId !== "self"
            ? body.ownerPersonId
            : actorUserId,
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
    case "persist_condition_rating": {
      const schemeId = typeof body.schemeId === "string" ? body.schemeId : undefined;
      const scheme =
        body.scheme && typeof body.scheme === "object"
          ? (body.scheme as never)
          : schemeId === STRUCTURAL_ORDINAL_SCHEME_V1.schemeId
            ? STRUCTURAL_ORDINAL_SCHEME_V1
            : GENERIC_NUMERIC_SCHEME_V1;
      return repo.persistConditionRating({
        sessionId: String(body.sessionId),
        componentScope: String(body.componentScope),
        inspectionScope: String(body.inspectionScope),
        observationIds: Array.isArray(body.observationIds) ? (body.observationIds as string[]) : [],
        scheme,
        ordinalCode: typeof body.ordinalCode === "string" ? body.ordinalCode : undefined,
        numericScore:
          typeof body.numericScore === "number"
            ? body.numericScore
            : typeof body.numericScore === "string" && body.numericScore.trim() !== ""
              ? Number(body.numericScore)
              : undefined,
        confidence: Number(body.confidence),
        uncertainty: Number(body.uncertainty),
        evidenceSufficiency: body.evidenceSufficiency as never,
        packId: String(body.packId ?? scheme.packId ?? "generic"),
      });
    }
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
    case "compose_report":
      return repo.composeReport({
        sessionId: String(body.sessionId),
        reportKey: String(body.reportKey),
      });
    case "transition_report": {
      const to = String(body.to);
      if (to === "approved" || to === "published") {
        if (authAction !== "inspection.approve") throw new Error("unauthorized_report_authority");
      }
      return repo.transitionReport(String(body.outputId), to as "draft" | "reviewed" | "approved" | "published");
    }
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
