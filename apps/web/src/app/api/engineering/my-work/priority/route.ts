import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  auditRiskPrioritizedMyWorkFoundations,
  buildPrioritizedMyWork,
  buildWorkPackagePriorityContextUi,
  ensurePilot001RiskPrioritizedMyWork,
  explainPriorityConsequence,
  explainWhyPriority,
  getItemPriority,
  homeLightweightMyWorkCounts,
  measureMyWorkPriorityPerformance,
  queryPrioritizedMyWork,
  recordPriorityOverride,
  recomputePriorityForObject,
  unauthorizedPriorityOverrideBlocked,
  type PriorityBand,
} from "@/lib/engineering/eos3-risk-prioritized-my-work-engine";
import type { MyWorkCategoryId } from "@/lib/engineering/eos3-my-work-ui";

export const GET = withEngineeringApi("actions", async ({ ctx, correlationId }, request) => {
  const url = new URL(request.url);
  const view = url.searchParams.get("view") ?? "list";
  const workspaceId = url.searchParams.get("workspaceId") ?? ctx.workspaceId ?? ctx.tenantId;
  const projectId = url.searchParams.get("projectId") ?? "PILOT-001";
  const userId = url.searchParams.get("userId") ?? ctx.userId ?? "engineer";
  const userDiscipline = url.searchParams.get("userDiscipline") ?? "Structural";
  const objectId = url.searchParams.get("objectId") ?? "CALC-001";
  const category = (url.searchParams.get("category") ?? "all") as MyWorkCategoryId | "all";
  const priorityBand = (url.searchParams.get("priority") ?? "all") as PriorityBand | "all";

  if (view === "audit") {
    return NextResponse.json({ data: auditRiskPrioritizedMyWorkFoundations() });
  }
  if (view === "performance") {
    return NextResponse.json({ data: measureMyWorkPriorityPerformance() });
  }
  if (view === "homeCounts") {
    return NextResponse.json({
      data: homeLightweightMyWorkCounts({ workspaceId, userId, projectId }),
    });
  }

  const base = {
    tenantId: ctx.tenantId,
    workspaceId,
    userId,
    userDiscipline,
    projectIds: [projectId],
    authorizedWorkspaceIds: [workspaceId],
    capabilities: {
      canView: true,
      canEdit: true,
      canReview: url.searchParams.get("canReview") === "1",
      canDecide: url.searchParams.get("canDecide") === "1",
      canApprove: url.searchParams.get("canApprove") === "1",
    },
  };

  if (view === "item") {
    return NextResponse.json({ data: getItemPriority({ ...base, objectStableId: objectId }) });
  }
  if (view === "why") {
    const item = getItemPriority({ ...base, objectStableId: objectId });
    return NextResponse.json({ data: item ? explainWhyPriority(item) : null });
  }
  if (view === "consequence") {
    const item = getItemPriority({ ...base, objectStableId: objectId });
    return NextResponse.json({ data: item ? explainPriorityConsequence(item) : null });
  }
  if (view === "wpContext") {
    return NextResponse.json({
      data: buildWorkPackagePriorityContextUi({
        ...base,
        projectId,
        workPackageStableId: url.searchParams.get("workPackageId") ?? "WP-STR-004",
      }),
    });
  }
  if (view === "critical") {
    return NextResponse.json({
      data: queryPrioritizedMyWork({ ...base, priorityBand: "CRITICAL" }),
    });
  }
  if (view === "waiting") {
    return NextResponse.json({
      data: queryPrioritizedMyWork({ ...base, category: "waiting-for-others" }),
    });
  }
  if (view === "blocking") {
    return NextResponse.json({
      data: buildPrioritizedMyWork(base).filter((i) => i.blockerStatus),
    });
  }

  void correlationId;
  return NextResponse.json({
    data: queryPrioritizedMyWork({
      ...base,
      category,
      priorityBand,
      actionableOnly: url.searchParams.get("actionable") === "1",
    }),
  });
});

export const POST = withEngineeringApi("actions", async ({ ctx, correlationId }, request) => {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "");
  const workspaceId = String(body.workspaceId ?? ctx.workspaceId ?? ctx.tenantId);
  const projectId = String(body.projectId ?? "PILOT-001");
  const userId = String(body.userId ?? ctx.userId ?? "engineer");
  const authorized = Boolean(body.authorized);

  if (action === "ensurePilot") {
    return NextResponse.json({
      data: ensurePilot001RiskPrioritizedMyWork({
        tenantId: ctx.tenantId,
        workspaceId,
        projectId,
      }),
    });
  }
  if (action === "recompute") {
    return NextResponse.json({
      data: recomputePriorityForObject({
        tenantId: ctx.tenantId,
        workspaceId,
        userId,
        projectId,
        objectStableId: String(body.objectStableId ?? "CALC-001"),
        userDiscipline: body.userDiscipline ? String(body.userDiscipline) : undefined,
      }),
    });
  }
  if (action === "override") {
    if (unauthorizedPriorityOverrideBlocked({ authorized })) {
      return lifecycleErrorResponse(
        "forbidden",
        "Unauthorized priority override blocked.",
        403,
        correlationId,
      );
    }
    const result = recordPriorityOverride({
      workspaceId,
      userId,
      objectStableId: String(body.objectStableId ?? ""),
      adjustedBand: String(body.adjustedBand ?? "MEDIUM") as PriorityBand,
      reason: String(body.reason ?? ""),
      actorId: String(body.actorId ?? userId),
      authorized,
    });
    if ("error" in result) {
      return lifecycleErrorResponse("forbidden", "Unauthorized", 403, correlationId);
    }
    return NextResponse.json({ data: result });
  }

  return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
});
