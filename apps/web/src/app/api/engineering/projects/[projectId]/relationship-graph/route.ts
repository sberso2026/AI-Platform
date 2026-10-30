import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  boundedTraversal,
  buildDependencyUiContract,
  createGraphEdge,
  explainPath,
  filterEdgesForAuthorization,
  getDependents,
  getDependencies,
  getDownstream,
  getGraphEdge,
  getRelatedObjects,
  getSupportingEvidence,
  getUpstream,
  listEdgesForObject,
  seedPilot001RelationshipGraph,
  supersedeGraphEdge,
  unauthorizedRelationshipWriteBlocked,
  auditDigitalThreadCompatibility,
} from "@/lib/engineering/eos3-relationship-graph-core";
import { getRelationshipTypeDefinition } from "@/lib/engineering/eos3-relationship-type-registry";

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
    const view = url.searchParams.get("view") ?? "related";
    const stableId = url.searchParams.get("stableId") ?? "CALC-001";
    const depth = Number(url.searchParams.get("depth") ?? "2");
    const direction = (url.searchParams.get("direction") ?? "both") as
      | "upstream"
      | "downstream"
      | "both";
    const relationshipId = url.searchParams.get("relationshipId");

    if (url.searchParams.get("seedPilot") === "1" || projectId.toUpperCase().includes("PILOT")) {
      seedPilot001RelationshipGraph({
        tenantId: ctx.tenantId,
        workspaceId,
        projectId,
      });
    }

    if (view === "audit") {
      return NextResponse.json({ data: auditDigitalThreadCompatibility() });
    }
    if (view === "type" && url.searchParams.get("type")) {
      return NextResponse.json({
        data: getRelationshipTypeDefinition(String(url.searchParams.get("type"))),
      });
    }
    if (view === "edge" && relationshipId) {
      return NextResponse.json({ data: getGraphEdge(workspaceId, relationshipId) });
    }
    if (view === "upstream") {
      return NextResponse.json({ data: getUpstream(workspaceId, stableId, { projectId }) });
    }
    if (view === "downstream") {
      return NextResponse.json({ data: getDownstream(workspaceId, stableId, { projectId }) });
    }
    if (view === "dependencies") {
      return NextResponse.json({ data: getDependencies(workspaceId, stableId, projectId) });
    }
    if (view === "dependents") {
      return NextResponse.json({ data: getDependents(workspaceId, stableId, projectId) });
    }
    if (view === "evidence") {
      return NextResponse.json({ data: getSupportingEvidence(workspaceId, stableId) });
    }
    if (view === "related") {
      return NextResponse.json({ data: getRelatedObjects(workspaceId, stableId) });
    }
    if (view === "list") {
      return NextResponse.json({
        data: listEdgesForObject(workspaceId, stableId, { status: "ACTIVE", projectId }),
      });
    }
    if (view === "traverse") {
      const paths = boundedTraversal(workspaceId, stableId, {
        maxDepth: Number.isFinite(depth) ? depth : 2,
        direction,
        projectId,
      });
      return NextResponse.json({
        data: paths.map((p) => ({
          ...p,
          pathExplanation: explainPath(p),
          // Never auto-claim stale / invalid from path existence
          stalenessPropagated: false,
        })),
      });
    }
    if (view === "ui-contract") {
      return NextResponse.json({
        data: buildDependencyUiContract(workspaceId, stableId, projectId),
      });
    }
    if (view === "pilot") {
      return NextResponse.json({
        data: seedPilot001RelationshipGraph({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }

    return NextResponse.json({
      data: {
        related: getRelatedObjects(workspaceId, stableId),
        uiContract: buildDependencyUiContract(workspaceId, stableId, projectId),
      },
      meta: {
        engineeringLanguage: true,
        grantsAuthority: false,
        visualizationScope: "BOUNDED",
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
      unauthorizedRelationshipWriteBlocked({
        callerWorkspaceId: workspaceId,
        edgeWorkspaceId: body.workspaceId ? String(body.workspaceId) : workspaceId,
      })
    ) {
      return lifecycleErrorResponse(
        "forbidden",
        "Cross-workspace relationship write denied",
        403,
        correlationId,
      );
    }

    const action = String(body.action ?? "create");
    try {
      if (action === "seed-pilot") {
        return NextResponse.json({
          data: seedPilot001RelationshipGraph({
            tenantId: ctx.tenantId,
            workspaceId,
            projectId,
          }),
        });
      }
      if (action === "create") {
        const edge = createGraphEdge({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
          sourceClass: String(body.sourceClass),
          sourceStableId: String(body.sourceStableId),
          sourceRevisionId: body.sourceRevisionId != null ? String(body.sourceRevisionId) : null,
          sourceRevisionLabel:
            body.sourceRevisionLabel != null ? String(body.sourceRevisionLabel) : null,
          targetClass: String(body.targetClass),
          targetStableId: String(body.targetStableId),
          targetRevisionId: body.targetRevisionId != null ? String(body.targetRevisionId) : null,
          targetRevisionLabel:
            body.targetRevisionLabel != null ? String(body.targetRevisionLabel) : null,
          relationshipType: String(body.relationshipType),
          origin: (body.origin as never) ?? "HUMAN",
          inferenceBasis: body.inferenceBasis != null ? String(body.inferenceBasis) : null,
          confidence: typeof body.confidence === "number" ? body.confidence : null,
          evidenceRefs: Array.isArray(body.evidenceRefs)
            ? (body.evidenceRefs as string[])
            : undefined,
          createdBy: ctx.userId ?? null,
          material: typeof body.material === "boolean" ? body.material : undefined,
        });
        // Writing a relationship never escalates authority
        return NextResponse.json(
          { data: edge, meta: { grantsEngineeringAuthority: false } },
          { status: 201 },
        );
      }
      if (action === "supersede") {
        const result = supersedeGraphEdge({
          workspaceId,
          oldRelationshipId: String(body.oldRelationshipId),
          replacement: {
            tenantId: ctx.tenantId,
            workspaceId,
            projectId,
            sourceClass: String(body.sourceClass),
            sourceStableId: String(body.sourceStableId),
            sourceRevisionId:
              body.sourceRevisionId != null ? String(body.sourceRevisionId) : null,
            targetClass: String(body.targetClass),
            targetStableId: String(body.targetStableId),
            targetRevisionId:
              body.targetRevisionId != null ? String(body.targetRevisionId) : null,
            relationshipType: String(body.relationshipType),
            origin: "HUMAN",
            createdBy: ctx.userId ?? null,
          },
        });
        return NextResponse.json({ data: result });
      }
      if (action === "authorize-filter") {
        const allowed = new Set(
          Array.isArray(body.allowedStableIds)
            ? (body.allowedStableIds as string[])
            : [],
        );
        const edges = getRelatedObjects(workspaceId, String(body.stableId ?? ""));
        return NextResponse.json({ data: filterEdgesForAuthorization(edges, allowed) });
      }
      return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "relationship_graph_error";
      return lifecycleErrorResponse("bad_request", msg, 400, correlationId);
    }
  },
);
