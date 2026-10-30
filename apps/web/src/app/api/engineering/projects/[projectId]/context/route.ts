import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  auditContextResolutionFoundations,
  buildEngineeringDesignContextUiContract,
  buildMyWorkContextDataContract,
  buildWorkPackageContextUiContract,
  clearContextOverride,
  explainWhyContext,
  ensurePilot001ContextState,
  homeLightweightContext,
  measureContextPerformanceBaseline,
  resolveContextFromChange,
  resolveContextFromDecision,
  resolveContextFromObject,
  resolveContextFromReview,
  resolveContextFromRoute,
  setContextOverride,
  unauthorizedContextOverrideBlocked,
} from "@/lib/engineering/eos3-context-resolution-engine";

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
    const view = url.searchParams.get("view") ?? "snapshot";
    const wpId = url.searchParams.get("workPackageId") ?? "WP-STR-004";
    const objectId = url.searchParams.get("objectId") ?? "CALC-001";
    const userId = url.searchParams.get("userId") ?? ctx.userId ?? "engineer";
    const userDiscipline = url.searchParams.get("userDiscipline") ?? "Structural";

    if (view === "audit") {
      return NextResponse.json({ data: auditContextResolutionFoundations() });
    }
    if (view === "performance") {
      return NextResponse.json({ data: measureContextPerformanceBaseline() });
    }
    if (view === "homeLightweight") {
      return NextResponse.json({
        data: homeLightweightContext({
          projectId,
          userId,
          workspaceId,
        }),
      });
    }
    if (view === "wpUi") {
      return NextResponse.json({
        data: buildWorkPackageContextUiContract({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
          userId,
          userDiscipline,
        }),
      });
    }
    if (view === "edUi") {
      return NextResponse.json({
        data: buildEngineeringDesignContextUiContract({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
          userId,
        }),
      });
    }
    if (view === "myWorkContract") {
      return NextResponse.json({
        data: buildMyWorkContextDataContract({
          workspaceId,
          projectId,
          userId,
          userDiscipline,
        }),
      });
    }

    const base = {
      tenantId: ctx.tenantId,
      workspaceId,
      userId,
      userDiscipline,
      projectId,
      authorizedWorkspaceIds: [workspaceId],
      authorizedProjectIds: [projectId],
      capabilities: {
        canView: true,
        canEdit: true,
        canApprove: false,
      },
    };

    let snapshot;
    if (view === "object") {
      snapshot = resolveContextFromObject({
        ...base,
        objectStableId: objectId,
        objectKind: "Calculation",
      });
    } else if (view === "review") {
      snapshot = resolveContextFromReview({
        ...base,
        objectStableId: url.searchParams.get("objectId") ?? "REV-001",
      });
    } else if (view === "decision") {
      snapshot = resolveContextFromDecision({
        ...base,
        objectStableId: url.searchParams.get("objectId") ?? "DEC-001",
      });
    } else if (view === "change") {
      snapshot = resolveContextFromChange({
        ...base,
        objectStableId: url.searchParams.get("objectId") ?? "CHG-001",
      });
    } else {
      snapshot = resolveContextFromRoute({
        ...base,
        workPackageStableId: wpId,
      });
    }

    if (view === "why") {
      return NextResponse.json({ data: explainWhyContext(snapshot) });
    }

    return NextResponse.json({ data: snapshot });
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
    const actorAuthorized = Boolean(body.authorized ?? false);
    const userId = String(body.userId ?? ctx.userId ?? "engineer");

    if (unauthorizedContextOverrideBlocked({ actorAuthorized }) && action !== "ensurePilot") {
      if (action === "setOverride" || action === "clearOverride") {
        return lifecycleErrorResponse(
          "forbidden",
          "Unauthorized context override blocked.",
          403,
          correlationId,
        );
      }
    }

    if (action === "ensurePilot") {
      return NextResponse.json({
        data: ensurePilot001ContextState({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }
    if (action === "setOverride") {
      const result = setContextOverride({
        workspaceId,
        userId,
        projectId: String(body.projectId ?? projectId),
        workPackageStableId: body.workPackageStableId
          ? String(body.workPackageStableId)
          : null,
        actorAuthorized,
      });
      if ("error" in result) {
        return lifecycleErrorResponse("forbidden", "Unauthorized context override", 403, correlationId);
      }
      return NextResponse.json({ data: result });
    }
    if (action === "clearOverride") {
      const result = clearContextOverride({
        workspaceId,
        userId,
        actorAuthorized,
      });
      if ("error" in result) {
        return lifecycleErrorResponse("forbidden", "Unauthorized context clear", 403, correlationId);
      }
      return NextResponse.json({ data: result });
    }

    return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
  },
);
