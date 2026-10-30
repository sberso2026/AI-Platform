import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  addDecisionOption,
  associateDecisionSupport,
  auditExistingDecisionAssumptionModels,
  buildAssumptionUiContract,
  buildDecisionUiContract,
  createAssumption,
  createAssumptionFromNaturalStatement,
  createDecisionDraft,
  createDecisionFromNaturalQuestion,
  getAssumption,
  getDecision,
  invalidateAssumption,
  listAssumptions,
  listDecisions,
  markDecisionReassessmentRequired,
  queryAssumptionDependents,
  queryAssumptionEvidence,
  queryCalculationAssumptions,
  queryDecisionSupport,
  queryDecisionWhy,
  recordFinalDecision,
  reviseAssumption,
  seedPilot001DecisionAssumptionLineage,
  supersedeDecision,
  unauthorizedDecisionAssumptionWriteBlocked,
  verifyAssumption,
} from "@/lib/engineering/eos3-decision-assumption-lineage";

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
    const view = url.searchParams.get("view") ?? "list";
    const kind = url.searchParams.get("kind") ?? "both";
    const stableId = url.searchParams.get("stableId");

    if (url.searchParams.get("seedPilot") === "1" || projectId.toUpperCase().includes("PILOT")) {
      seedPilot001DecisionAssumptionLineage({
        tenantId: ctx.tenantId,
        workspaceId,
        projectId,
      });
    }

    if (view === "audit") {
      return NextResponse.json({ data: auditExistingDecisionAssumptionModels() });
    }
    if (view === "list") {
      return NextResponse.json({
        data: {
          decisions: kind === "assumptions" ? [] : listDecisions(workspaceId, projectId),
          assumptions: kind === "decisions" ? [] : listAssumptions(workspaceId, projectId),
        },
        meta: { engineeringLanguage: true, assumptionOrchestrationAnchor: false },
      });
    }
    if (view === "decision" && stableId) {
      return NextResponse.json({ data: getDecision(workspaceId, stableId) });
    }
    if (view === "assumption" && stableId) {
      return NextResponse.json({ data: getAssumption(workspaceId, stableId) });
    }
    if (view === "decision-ui" && stableId) {
      return NextResponse.json({ data: buildDecisionUiContract(workspaceId, stableId) });
    }
    if (view === "assumption-ui" && stableId) {
      return NextResponse.json({ data: buildAssumptionUiContract(workspaceId, stableId) });
    }
    if (view === "calc-assumptions") {
      return NextResponse.json({
        data: queryCalculationAssumptions(workspaceId, stableId ?? "CALC-001"),
      });
    }
    if (view === "assumption-evidence") {
      return NextResponse.json({
        data: queryAssumptionEvidence(workspaceId, stableId ?? "ASM-001"),
      });
    }
    if (view === "decision-support") {
      return NextResponse.json({
        data: queryDecisionSupport(workspaceId, stableId ?? "DEC-001"),
      });
    }
    if (view === "decision-why") {
      return NextResponse.json({
        data: queryDecisionWhy(workspaceId, stableId ?? "DEC-001"),
      });
    }
    if (view === "assumption-dependents") {
      return NextResponse.json({
        data: queryAssumptionDependents(workspaceId, stableId ?? "ASM-001"),
        meta: { stalenessPropagated: false },
      });
    }
    if (view === "pilot") {
      return NextResponse.json({
        data: seedPilot001DecisionAssumptionLineage({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }

    return NextResponse.json({
      data: {
        decisions: listDecisions(workspaceId, projectId),
        assumptions: listAssumptions(workspaceId, projectId),
      },
    });
  },
);

export const POST = withEngineeringApiParams(
  "projects",
  async ({ ctx, correlationId }, request, { projectId }) => {
    const { error, project } = await requireProjectRead(ctx, correlationId, projectId);
    if (error || !project) return error!;
    const workspaceId = workspaceIdOf(project as Record<string, unknown>, ctx.tenantId);

    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return lifecycleErrorResponse("bad_request", "Invalid JSON", 400, correlationId);
    }

    if (
      unauthorizedDecisionAssumptionWriteBlocked({
        callerWorkspaceId: workspaceId,
        recordWorkspaceId: body.workspaceId ? String(body.workspaceId) : workspaceId,
      })
    ) {
      return lifecycleErrorResponse("forbidden", "Cross-workspace write denied", 403, correlationId);
    }

    const action = String(body.action ?? "create-assumption");
    try {
      if (action === "seed-pilot") {
        return NextResponse.json({
          data: seedPilot001DecisionAssumptionLineage({
            tenantId: ctx.tenantId,
            workspaceId,
            projectId,
          }),
        });
      }
      if (action === "create-assumption") {
        const row = body.text
          ? createAssumptionFromNaturalStatement({
              tenantId: ctx.tenantId,
              workspaceId,
              projectId,
              text: String(body.text),
              workPackageStableId: body.workPackageStableId
                ? String(body.workPackageStableId)
                : null,
              assetSystemStableIds: Array.isArray(body.assetSystemStableIds)
                ? (body.assetSystemStableIds as string[])
                : undefined,
              actorId: ctx.userId ?? null,
            })
          : createAssumption({
              tenantId: ctx.tenantId,
              workspaceId,
              projectId,
              statement: String(body.statement ?? ""),
              stableId: body.stableId ? String(body.stableId) : undefined,
              workPackageStableId: body.workPackageStableId
                ? String(body.workPackageStableId)
                : null,
              value: body.value as string | number | null | undefined,
              units: body.units != null ? String(body.units) : null,
              basis: body.basis ? String(body.basis) : undefined,
              actorId: ctx.userId ?? null,
            });
        return NextResponse.json({ data: row }, { status: 201 });
      }
      if (action === "revise-assumption") {
        return NextResponse.json({
          data: reviseAssumption({
            workspaceId,
            assumptionIdOrStable: String(body.id ?? body.stableId),
            value: body.value as string | number | null | undefined,
            units: body.units != null ? String(body.units) : undefined,
            statement: body.statement ? String(body.statement) : undefined,
            actorId: ctx.userId ?? null,
          }),
        });
      }
      if (action === "verify-assumption") {
        return NextResponse.json({
          data: verifyAssumption({
            workspaceId,
            assumptionIdOrStable: String(body.id ?? body.stableId),
            actorId: String(body.actorId ?? ctx.userId ?? ""),
            authorityRole: String(body.authorityRole ?? ""),
          }),
        });
      }
      if (action === "invalidate-assumption") {
        return NextResponse.json({
          data: invalidateAssumption({
            workspaceId,
            assumptionIdOrStable: String(body.id ?? body.stableId),
            actorId: String(body.actorId ?? ctx.userId ?? ""),
            reason: String(body.reason ?? ""),
            authoritativeEvidenceStableId: body.authoritativeEvidenceStableId
              ? String(body.authoritativeEvidenceStableId)
              : undefined,
          }),
        });
      }
      if (action === "create-decision") {
        const row = body.text
          ? createDecisionFromNaturalQuestion({
              tenantId: ctx.tenantId,
              workspaceId,
              projectId,
              text: String(body.text),
              workPackageStableId: body.workPackageStableId
                ? String(body.workPackageStableId)
                : null,
              assetSystemStableIds: Array.isArray(body.assetSystemStableIds)
                ? (body.assetSystemStableIds as string[])
                : undefined,
              actorId: ctx.userId ?? null,
            })
          : createDecisionDraft({
              tenantId: ctx.tenantId,
              workspaceId,
              projectId,
              title: String(body.title ?? ""),
              question: String(body.question ?? ""),
              stableId: body.stableId ? String(body.stableId) : undefined,
              workPackageStableId: body.workPackageStableId
                ? String(body.workPackageStableId)
                : null,
              options: Array.isArray(body.options)
                ? (body.options as Array<{ label: string; description?: string }>)
                : undefined,
              actorId: ctx.userId ?? null,
            });
        return NextResponse.json({ data: row }, { status: 201 });
      }
      if (action === "add-option") {
        return NextResponse.json({
          data: addDecisionOption(workspaceId, String(body.id ?? body.stableId), {
            label: String(body.label ?? ""),
            description: body.description ? String(body.description) : undefined,
          }),
        });
      }
      if (action === "associate-support") {
        return NextResponse.json({
          data: associateDecisionSupport(workspaceId, String(body.id ?? body.stableId), {
            assumptionStableIds: body.assumptionStableIds as string[] | undefined,
            evidenceStableIds: body.evidenceStableIds as string[] | undefined,
            calculationStableIds: body.calculationStableIds as string[] | undefined,
            assetSystemStableIds: body.assetSystemStableIds as string[] | undefined,
          }),
        });
      }
      if (action === "finalize-decision") {
        return NextResponse.json({
          data: recordFinalDecision({
            workspaceId,
            decisionIdOrStable: String(body.id ?? body.stableId),
            selectedOptionId: String(body.selectedOptionId),
            rationale: String(body.rationale ?? ""),
            actorId: String(body.actorId ?? ctx.userId ?? ""),
            authorityBasis: String(body.authorityBasis ?? ""),
            authorityRole: String(body.authorityRole ?? ""),
            conditions: Array.isArray(body.conditions) ? (body.conditions as string[]) : undefined,
          }),
        });
      }
      if (action === "supersede-decision") {
        return NextResponse.json({
          data: supersedeDecision({
            workspaceId,
            oldDecisionIdOrStable: String(body.id ?? body.stableId),
            title: body.title ? String(body.title) : undefined,
            question: body.question ? String(body.question) : undefined,
            actorId: ctx.userId ?? null,
          }),
        });
      }
      if (action === "reassessment-required") {
        return NextResponse.json({
          data: markDecisionReassessmentRequired(
            workspaceId,
            String(body.id ?? body.stableId),
            String(body.reason ?? "Manual reassessment request"),
          ),
        });
      }
      return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "decision_assumption_error";
      const status =
        msg.includes("authority") || msg.includes("forbidden") ? 403 : 400;
      return lifecycleErrorResponse(
        status === 403 ? "forbidden" : "bad_request",
        msg,
        status,
        correlationId,
      );
    }
  },
);
