import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  auditStageAwareFoundations,
  buildStageGuidanceSnapshot,
  createAuthorizedDraftObject,
  ensurePilot001StageGuidance,
  explainWhyStageGuidance,
  homeDeepStageQueries,
  measureStageGuidancePerformance,
  queryCompletionRequirements,
  queryNextCheckpointBlockers,
  queryRequiredInformation,
  refreshStageGuidance,
} from "@/lib/engineering/eos3-stage-aware-guided-engineering";

export const GET = withEngineeringApi("actions", async ({ ctx }, request) => {
  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "guidance";
  const workspaceId = url.searchParams.get("workspaceId") ?? ctx.workspaceId ?? ctx.tenantId;
  const projectId = url.searchParams.get("projectId") ?? "PILOT-001";
  const wpId = url.searchParams.get("workPackageId") ?? "WP-STR-004";
  const userId = url.searchParams.get("userId") ?? ctx.userId ?? "engineer";
  const userDiscipline = url.searchParams.get("userDiscipline") ?? "Structural";

  if (view === "audit") {
    return NextResponse.json({ data: auditStageAwareFoundations() });
  }
  if (view === "performance") {
    return NextResponse.json({ data: measureStageGuidancePerformance() });
  }
  if (view === "homeDeep") {
    return NextResponse.json({ data: homeDeepStageQueries() });
  }

  const base = {
    tenantId: ctx.tenantId,
    workspaceId,
    userId,
    userDiscipline,
    projectId,
    workPackageStableId: wpId,
    authorizedWorkspaceIds: [workspaceId],
    capabilities: {
      canView: true,
      canEdit: true,
      canReview: url.searchParams.get("canReview") === "1",
      canDecide: url.searchParams.get("canDecide") === "1",
      canApprove: url.searchParams.get("canApprove") === "1",
    },
  };

  const snap = buildStageGuidanceSnapshot(base);

  if (view === "requiredInformation") {
    return NextResponse.json({ data: queryRequiredInformation(snap) });
  }
  if (view === "completion") {
    return NextResponse.json({ data: queryCompletionRequirements(snap) });
  }
  if (view === "blockers") {
    return NextResponse.json({ data: queryNextCheckpointBlockers(snap) });
  }
  if (view === "explain") {
    const item = snap.requiredNow[0];
    return NextResponse.json({
      data: item
        ? explainWhyStageGuidance(item)
        : { question: "Why is EOS asking for this now?", explanation: snap.emptyStates.requiredNow },
    });
  }

  return NextResponse.json({ data: snap });
});

export const POST = withEngineeringApi("actions", async ({ ctx, correlationId }, request) => {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");
  const workspaceId = String(body.workspaceId ?? ctx.workspaceId ?? ctx.tenantId);
  const projectId = String(body.projectId ?? "PILOT-001");
  const userId = String(body.userId ?? ctx.userId ?? "engineer");

  if (action === "ensurePilot") {
    return NextResponse.json({
      data: ensurePilot001StageGuidance({
        tenantId: ctx.tenantId,
        workspaceId,
        projectId,
      }),
    });
  }
  if (action === "refresh") {
    return NextResponse.json({
      data: refreshStageGuidance({
        tenantId: ctx.tenantId,
        workspaceId,
        userId,
        userDiscipline: body.userDiscipline ? String(body.userDiscipline) : "Structural",
        projectId,
        workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
        authorizedWorkspaceIds: [workspaceId],
      }),
    });
  }
  if (action === "createDraft") {
    try {
      const draft = createAuthorizedDraftObject({
        tenantId: ctx.tenantId,
        workspaceId,
        projectId,
        workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
        objectClass: String(body.objectClass ?? "Deliverable") as
          | "Calculation"
          | "Review"
          | "Deliverable"
          | "Decision"
          | "Assumption",
        expectationKey: String(body.expectationKey ?? "Deliverable"),
        displayName: body.displayName ? String(body.displayName) : undefined,
        actorId: userId,
        authorized: body.authorized !== false,
        trigger: String(body.trigger ?? "user_create_draft"),
      });
      return NextResponse.json({ data: draft });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "create_draft_failed";
      const status = msg.startsWith("unauthorized") ? 403 : 400;
      return lifecycleErrorResponse("bad_request", msg, status, correlationId);
    }
  }

  return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
});
