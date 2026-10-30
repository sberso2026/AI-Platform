import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  auditMaturityFoundations,
  buildWorkPackageMaturityUiContract,
  ensurePilot001MaturityState,
  evaluateNextStageReadiness,
  getWorkPackageMaturityHistory,
  measureMaturityPerformanceBaseline,
  queryDeliverableMaturity,
  queryProjectMaturityProfile,
  queryWorkPackageMaturity,
  recordMaturityOverride,
  runMixedDeliverableMaturityScenario,
  runMixedProjectMaturityScenario,
  runMultiPatternMaturityScenario,
  setDeliverableMaturity,
  transitionWorkPackageMaturity,
  unauthorizedMaturityWriteBlocked,
} from "@/lib/engineering/eos3-multi-level-maturity";

async function requireProjectRead(
  ctx: CommerceHandlerContext["ctx"],
  correlationId: string,
  projectId: string,
) {
  const readCommerce = await authorizeEngineeringSegment(ctx, "projects", "GET", correlationId);
  if (!readCommerce) {
    return {
      error: lifecycleErrorResponse(
        "forbidden",
        "Not authorized to read this project.",
        403,
        correlationId,
        { expectedAction: "project.read" },
      ),
      project: null as null,
    };
  }
  const project = await ctx.engineering.projects.get(readCommerce, ctx.tenantId, projectId);
  if (!project) {
    return {
      error: lifecycleErrorResponse("not_found", "Project not found", 404, correlationId),
      project: null as null,
    };
  }
  return { error: null, project };
}

function workspaceIdOf(project: Record<string, unknown>, fallback: string): string {
  return String(project.workspace_id ?? project.workspaceId ?? fallback);
}

export const GET = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, request, { projectId }) => {
    const project = await ctx.engineering.projects.get(commerce, ctx.tenantId, projectId);
    if (!project) {
      return lifecycleErrorResponse("not_found", "Project not found", 404, correlationId);
    }
    const workspaceId = workspaceIdOf(project as Record<string, unknown>, ctx.tenantId);
    const url = new URL(request.url);
    const view = url.searchParams.get("view") ?? "project";
    const wpId = url.searchParams.get("workPackageId") ?? "WP-STR-004";
    const delId = url.searchParams.get("deliverableId") ?? "DEL-001";

    if (view === "audit") {
      return NextResponse.json({ data: auditMaturityFoundations() });
    }
    if (view === "performance") {
      return NextResponse.json({ data: measureMaturityPerformanceBaseline() });
    }
    if (view === "project") {
      return NextResponse.json({
        data: queryProjectMaturityProfile({ workspaceId, projectId }),
      });
    }
    if (view === "workPackage") {
      return NextResponse.json({
        data: queryWorkPackageMaturity({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "history") {
      return NextResponse.json({
        data: getWorkPackageMaturityHistory(workspaceId, projectId, wpId),
      });
    }
    if (view === "readiness") {
      return NextResponse.json({
        data: evaluateNextStageReadiness({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "deliverable") {
      return NextResponse.json({
        data: queryDeliverableMaturity({
          workspaceId,
          projectId,
          deliverableStableId: delId,
        }),
      });
    }
    if (view === "ui") {
      return NextResponse.json({
        data: buildWorkPackageMaturityUiContract({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    return NextResponse.json({
      data: queryProjectMaturityProfile({ workspaceId, projectId }),
    });
  },
);

export const POST = withEngineeringApiParams(
  "projects",
  async ({ ctx, correlationId }, request, { projectId }) => {
    const { error, project } = await requireProjectRead(ctx, correlationId, projectId);
    if (error || !project) return error!;
    const workspaceId = workspaceIdOf(project as Record<string, unknown>, ctx.tenantId);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (
      unauthorizedMaturityWriteBlocked({
        callerWorkspaceId: workspaceId,
        assignmentWorkspaceId: String(body.targetWorkspaceId ?? workspaceId),
      })
    ) {
      return lifecycleErrorResponse(
        "forbidden",
        "Cross-workspace maturity write blocked.",
        403,
        correlationId,
      );
    }

    if (action === "ensurePilot") {
      return NextResponse.json({
        data: ensurePilot001MaturityState({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }

    if (action === "transition") {
      try {
        return NextResponse.json({
          data: transitionWorkPackageMaturity({
            tenantId: ctx.tenantId,
            workspaceId,
            projectId,
            workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
            targetStageId: String(body.targetStageId ?? ""),
            actorId: String(body.actorId ?? ctx.userId ?? "engineer"),
            transitionAuthorized: Boolean(body.transitionAuthorized),
            rationale: String(body.rationale ?? ""),
            evidenceRefs: Array.isArray(body.evidenceRefs)
              ? body.evidenceRefs.map(String)
              : [],
            override: body.override
              ? {
                  reason: String((body.override as Record<string, unknown>).reason ?? ""),
                  authorityRole: String(
                    (body.override as Record<string, unknown>).authorityRole ?? "",
                  ),
                  authorityUserId: String(
                    (body.override as Record<string, unknown>).authorityUserId ?? "",
                  ),
                }
              : null,
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "transition_failed",
          403,
          correlationId,
        );
      }
    }

    if (action === "override") {
      try {
        return NextResponse.json({
          data: recordMaturityOverride({
            workspaceId,
            projectId,
            workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
            reason: String(body.reason ?? ""),
            authorityRole: String(body.authorityRole ?? ""),
            authorityUserId: String(body.authorityUserId ?? ctx.userId ?? ""),
            authorized: Boolean(body.authorized),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "override_failed",
          403,
          correlationId,
        );
      }
    }

    if (action === "setDeliverable") {
      try {
        return NextResponse.json({
          data: setDeliverableMaturity({
            workspaceId,
            projectId,
            deliverableStableId: String(body.deliverableStableId ?? "DEL-001"),
            workPackageStableId:
              body.workPackageStableId != null ? String(body.workPackageStableId) : null,
            maturity: body.maturity as never,
            revision: body.revision != null ? String(body.revision) : undefined,
            reviewStatus: body.reviewStatus as never,
            issuePurpose: body.issuePurpose as never,
            approvalState: body.approvalState as never,
            authorized: Boolean(body.authorized),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "deliverable_maturity_failed",
          403,
          correlationId,
        );
      }
    }

    if (action === "scenarioMixedProject") {
      return NextResponse.json({
        data: runMixedProjectMaturityScenario({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }
    if (action === "scenarioMultiPattern") {
      return NextResponse.json({
        data: runMultiPatternMaturityScenario({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }
    if (action === "scenarioMixedDeliverable") {
      return NextResponse.json({
        data: runMixedDeliverableMaturityScenario({
          workspaceId,
          projectId,
          workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
        }),
      });
    }

    return lifecycleErrorResponse("bad_request", "Unknown maturity action", 400, correlationId);
  },
);
