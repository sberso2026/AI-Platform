import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  assignEngineeringPattern,
  auditPatternEngineFoundations,
  buildWorkPackagePatternUiContract,
  changeEngineeringPattern,
  ensurePilot001BrownfieldPattern,
  evaluatePatternGate,
  getPatternAssignment,
  getPatternDefinition,
  listActivePatterns,
  measurePatternPerformanceBaseline,
  recordPatternException,
  runPatternValidationScenario,
  suggestEngineeringPattern,
  unauthorizedPatternWriteBlocked,
} from "@/lib/engineering/eos3-engineering-pattern-engine";

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
    const patternId = url.searchParams.get("patternId");
    const version = url.searchParams.get("version") ?? undefined;
    const wpId = url.searchParams.get("workPackageId") ?? "WP-STR-004";
    const gateId = url.searchParams.get("gateId");

    if (view === "audit") {
      return NextResponse.json({ data: auditPatternEngineFoundations() });
    }
    if (view === "performance") {
      return NextResponse.json({ data: measurePatternPerformanceBaseline() });
    }
    if (view === "list") {
      return NextResponse.json({
        data: listActivePatterns().map((p) => ({
          patternId: p.patternId,
          name: p.name,
          workType: p.engineerFacingWorkType,
          version: p.version,
          status: p.status,
        })),
      });
    }
    if (view === "pattern" && patternId) {
      return NextResponse.json({ data: getPatternDefinition(patternId, version) });
    }
    if (view === "assignment") {
      return NextResponse.json({
        data: getPatternAssignment(workspaceId, projectId, wpId),
      });
    }
    if (view === "ui") {
      return NextResponse.json({
        data: buildWorkPackagePatternUiContract({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "gate" && gateId) {
      return NextResponse.json({
        data: evaluatePatternGate({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
          gateId,
        }),
      });
    }
    if (view === "suggest") {
      return NextResponse.json({
        data: suggestEngineeringPattern({
          title: url.searchParams.get("title") ?? undefined,
          description: url.searchParams.get("description") ?? undefined,
        }),
      });
    }
    return NextResponse.json({ data: listActivePatterns() });
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
      unauthorizedPatternWriteBlocked({
        callerWorkspaceId: workspaceId,
        assignmentWorkspaceId: String(body.targetWorkspaceId ?? workspaceId),
      })
    ) {
      return lifecycleErrorResponse(
        "forbidden",
        "Cross-workspace pattern write blocked.",
        403,
        correlationId,
      );
    }

    if (action === "suggest") {
      return NextResponse.json({
        data: suggestEngineeringPattern({
          title: body.title != null ? String(body.title) : undefined,
          description: body.description != null ? String(body.description) : undefined,
          objective: body.objective != null ? String(body.objective) : undefined,
          assetContext: body.assetContext != null ? String(body.assetContext) : undefined,
          changeContext: body.changeContext != null ? String(body.changeContext) : undefined,
        }),
      });
    }

    if (action === "assign") {
      const suggestion = suggestEngineeringPattern({
        title: body.title != null ? String(body.title) : undefined,
        description: body.description != null ? String(body.description) : undefined,
      });
      return NextResponse.json({
        data: assignEngineeringPattern({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
          workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
          patternId: String(body.patternId ?? suggestion.patternId),
          patternVersion: body.patternVersion != null ? String(body.patternVersion) : undefined,
          entryStageId: body.entryStageId != null ? String(body.entryStageId) : undefined,
          entryReason: String(body.entryReason ?? "Assigned via API"),
          actorId: ctx.userId ?? null,
          suggestion,
        }),
      });
    }

    if (action === "change") {
      try {
        return NextResponse.json({
          data: changeEngineeringPattern({
            tenantId: ctx.tenantId,
            workspaceId,
            projectId,
            workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
            newPatternId: String(body.newPatternId ?? ""),
            reason: String(body.reason ?? ""),
            userId: String(body.userId ?? ctx.userId ?? "engineer"),
            authorized: Boolean(body.authorized),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "change_failed",
          403,
          correlationId,
        );
      }
    }

    if (action === "exception") {
      try {
        return NextResponse.json({
          data: recordPatternException({
            workspaceId,
            projectId,
            workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
            requirement: String(body.requirement ?? ""),
            disposition: (body.disposition as "NOT_APPLICABLE" | "WAIVED" | "DEFERRED") ?? "WAIVED",
            reason: String(body.reason ?? ""),
            authorityRole: String(body.authorityRole ?? ""),
            authorityUserId: String(body.authorityUserId ?? ctx.userId ?? ""),
            evidenceRefs: (body.evidenceRefs as string[]) ?? [],
            authorized: Boolean(body.authorized),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "exception_failed",
          403,
          correlationId,
        );
      }
    }

    if (action === "evaluate_gate") {
      return NextResponse.json({
        data: evaluatePatternGate({
          workspaceId,
          projectId,
          workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
          gateId: String(body.gateId ?? "M3"),
        }),
      });
    }

    if (action === "pilot_brownfield") {
      return NextResponse.json({
        data: ensurePilot001BrownfieldPattern({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }

    if (action === "validation_scenario") {
      return NextResponse.json({
        data: runPatternValidationScenario({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
          patternId: String(body.patternId ?? ""),
          workPackageStableId: String(body.workPackageStableId ?? "WP-VAL-001"),
          title: String(body.title ?? "Validation"),
          description: String(body.description ?? ""),
          entryStageId: body.entryStageId != null ? String(body.entryStageId) : undefined,
        }),
      });
    }

    return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
  },
);
