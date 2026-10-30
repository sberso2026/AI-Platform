import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  acknowledgeImpactReview,
  auditExistingChangeImpactModels,
  buildMyWorkImpactAttentionItems,
  buildWorkPackageImpactUiHints,
  explainImpact,
  filterImpactsForAuthorization,
  getImpact,
  getImpactsForObject,
  listActiveImpacts,
  measureImpactPerformanceBaseline,
  processEngineeringChange,
  queryAssetConfigurationImpact,
  queryRequirementChangeImpact,
  resolveImpact,
  runPilot001MassImpactScenario,
  unauthorizedImpactWriteBlocked,
} from "@/lib/engineering/eos3-impact-propagation";

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
    const stableId = url.searchParams.get("stableId");
    const impactId = url.searchParams.get("impactId");
    const workPackageId = url.searchParams.get("workPackageId") ?? "WP-STR-004";

    if (view === "audit") {
      return NextResponse.json({ data: auditExistingChangeImpactModels() });
    }
    if (view === "performance") {
      return NextResponse.json({ data: measureImpactPerformanceBaseline() });
    }
    if (view === "my-work-contract") {
      return NextResponse.json({
        data: buildMyWorkImpactAttentionItems(workspaceId, projectId),
        meta: { riskPrioritizedMyWorkImplemented: false },
      });
    }
    if (view === "work-package-hints") {
      return NextResponse.json({
        data: buildWorkPackageImpactUiHints(workspaceId, projectId, workPackageId),
      });
    }
    if (view === "explain" && impactId) {
      return NextResponse.json({ data: explainImpact(workspaceId, impactId) });
    }
    if (view === "object" && stableId) {
      return NextResponse.json({ data: getImpactsForObject(workspaceId, stableId) });
    }
    if (view === "one" && impactId) {
      return NextResponse.json({ data: getImpact(workspaceId, impactId) });
    }
    return NextResponse.json({
      data: listActiveImpacts(workspaceId, projectId),
      meta: {
        processingBlocksHomeRender: false,
        requiresLiveLlm: false,
        automaticEngineeringApproval: false,
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
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const action = String(body.action ?? "");

    if (
      unauthorizedImpactWriteBlocked({
        callerWorkspaceId: workspaceId,
        impactWorkspaceId: String(body.targetWorkspaceId ?? workspaceId),
      })
    ) {
      return lifecycleErrorResponse(
        "forbidden",
        "Cross-workspace impact write blocked.",
        403,
        correlationId,
      );
    }

    if (action === "process_change") {
      const result = processEngineeringChange({
        tenantId: ctx.tenantId,
        workspaceId,
        projectId,
        triggerKind: String(body.triggerKind ?? "CHANGE_OBJECT") as never,
        triggerStableId: String(body.triggerStableId ?? ""),
        triggerObjectClass: String(body.triggerObjectClass ?? "Change"),
        previousRevision: (body.previousRevision as string | null) ?? null,
        newRevision: (body.newRevision as string | null) ?? null,
        changeSummary: String(body.changeSummary ?? "Engineering change"),
        actorId: ctx.userId ?? null,
        maxDepth: body.maxDepth != null ? Number(body.maxDepth) : undefined,
        eventKey: body.eventKey != null ? String(body.eventKey) : undefined,
      });
      return NextResponse.json({ data: result });
    }

    if (action === "pilot_mass_12_to_15") {
      const result = runPilot001MassImpactScenario({
        tenantId: ctx.tenantId,
        workspaceId,
        projectId,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data: result });
    }

    if (action === "asset_configuration_impact") {
      return NextResponse.json({
        data: queryAssetConfigurationImpact({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
          assetStableId: String(body.assetStableId ?? "AST-PLT-201"),
          changeSummary: body.changeSummary != null ? String(body.changeSummary) : undefined,
        }),
      });
    }

    if (action === "requirement_change_impact") {
      return NextResponse.json({
        data: queryRequirementChangeImpact({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
          requirementStableId: String(body.requirementStableId ?? "REQ-001"),
          changeSummary: body.changeSummary != null ? String(body.changeSummary) : undefined,
        }),
      });
    }

    if (action === "acknowledge") {
      const authorized = Boolean(body.authorized);
      try {
        const imp = acknowledgeImpactReview({
          workspaceId,
          impactId: String(body.impactId ?? ""),
          userId: String(body.userId ?? ctx.userId ?? "engineer"),
          role: String(body.role ?? "qualified_reviewer"),
          rationale: String(body.rationale ?? ""),
          conclusion: (body.conclusion as "NO_CHANGE_REQUIRED" | "ACCEPTED_FOR_REVISION") ??
            "NO_CHANGE_REQUIRED",
          authorized,
        });
        return NextResponse.json({ data: imp });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "acknowledge_failed";
        return lifecycleErrorResponse("forbidden", msg, 403, correlationId);
      }
    }

    if (action === "resolve") {
      const authorized = Boolean(body.authorized);
      try {
        const imp = resolveImpact({
          workspaceId,
          impactId: String(body.impactId ?? ""),
          userId: String(body.userId ?? ctx.userId ?? "engineer"),
          role: String(body.role ?? "qualified_reviewer"),
          rationale: String(body.rationale ?? ""),
          status: (body.status as "RESOLVED_NO_CHANGE" | "RESOLVED_REVISED") ?? "RESOLVED_NO_CHANGE",
          authorized,
        });
        return NextResponse.json({ data: imp });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "resolve_failed";
        return lifecycleErrorResponse("forbidden", msg, 403, correlationId);
      }
    }

    if (action === "filter_authorized") {
      const allowed = new Set((body.allowedStableIds as string[]) ?? []);
      return NextResponse.json({
        data: filterImpactsForAuthorization(listActiveImpacts(workspaceId, projectId), allowed),
      });
    }

    return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
  },
);
