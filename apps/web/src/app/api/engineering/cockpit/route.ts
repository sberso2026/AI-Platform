import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  auditAdaptiveCockpitFoundations,
  batchResolveMyWorkCockpitContext,
  buildEngineeringDesignCockpitSlice,
  buildWorkPackageCockpitSnapshot,
  ensurePilot001AdaptiveCockpit,
  homeDeepCockpitQueries,
  measureCockpitIntegrationPerformance,
  readinessBlockerQuery,
  refreshCockpitDerivedState,
} from "@/lib/engineering/eos3-adaptive-engineering-cockpit";

export const GET = withEngineeringApi("actions", async ({ ctx }, request) => {
  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "snapshot";
  const workspaceId = url.searchParams.get("workspaceId") ?? ctx.workspaceId ?? ctx.tenantId;
  const projectId = url.searchParams.get("projectId") ?? "PILOT-001";
  const wpId = url.searchParams.get("workPackageId") ?? "WP-STR-004";
  const userId = url.searchParams.get("userId") ?? ctx.userId ?? "engineer";
  const userDiscipline = url.searchParams.get("userDiscipline") ?? "Structural";

  if (view === "audit") {
    return NextResponse.json({ data: auditAdaptiveCockpitFoundations() });
  }
  if (view === "performance") {
    return NextResponse.json({ data: measureCockpitIntegrationPerformance() });
  }
  if (view === "homeDeep") {
    return NextResponse.json({ data: homeDeepCockpitQueries() });
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

  if (view === "batchMyWork") {
    return NextResponse.json({
      data: batchResolveMyWorkCockpitContext({
        ...base,
        projectIds: [projectId],
      }),
    });
  }
  if (view === "ed") {
    return NextResponse.json({ data: buildEngineeringDesignCockpitSlice(base) });
  }
  if (view === "readiness") {
    const snap = buildWorkPackageCockpitSnapshot(base);
    return NextResponse.json({ data: readinessBlockerQuery(snap) });
  }

  const snap = buildWorkPackageCockpitSnapshot(base);
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
      data: ensurePilot001AdaptiveCockpit({
        tenantId: ctx.tenantId,
        workspaceId,
        projectId,
      }),
    });
  }
  if (action === "refresh") {
    return NextResponse.json({
      data: refreshCockpitDerivedState({
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

  return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
});
