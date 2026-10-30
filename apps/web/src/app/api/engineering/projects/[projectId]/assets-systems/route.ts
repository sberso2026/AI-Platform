import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  associateEngineeringObjectToContext,
  auditExistingModels,
  buildAssetSystemUiContract,
  createContextNode,
  deriveObjectContextFromWorkPackage,
  functionalContextView,
  linkWorkPackageToContext,
  listAreas,
  listAssets,
  listConfigurationHistory,
  listContextNodes,
  listContextRelationships,
  listFacilities,
  listSystems,
  listWorkPackageContextLinks,
  physicalContextView,
  relateContext,
  searchContextSelector,
  seedGreenfieldProposedPumpContext,
  seedPilot001AssetSystemContext,
  type AssetConfigurationState,
  type AssetSystemContextKind,
} from "@/lib/engineering/eos3-asset-system-context";

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
    const kind = url.searchParams.get("kind") as AssetSystemContextKind | null;
    const q = url.searchParams.get("q") ?? undefined;
    const stableId = url.searchParams.get("stableId");
    const wpId = url.searchParams.get("workPackageId") ?? "WP-STR-004";

    if (
      url.searchParams.get("seedPilot") === "1" ||
      projectId.toUpperCase().includes("PILOT")
    ) {
      seedPilot001AssetSystemContext({ workspaceId, projectId, tenantId: ctx.tenantId });
    }

    if (view === "audit") {
      return NextResponse.json({ data: auditExistingModels() });
    }
    if (view === "facilities") {
      return NextResponse.json({ data: listFacilities(workspaceId, projectId) });
    }
    if (view === "areas") {
      return NextResponse.json({ data: listAreas(workspaceId, projectId) });
    }
    if (view === "systems") {
      return NextResponse.json({ data: listSystems(workspaceId, projectId) });
    }
    if (view === "assets") {
      return NextResponse.json({ data: listAssets(workspaceId, projectId) });
    }
    if (view === "search" || view === "selector") {
      return NextResponse.json({
        data: searchContextSelector({
          workspaceId,
          projectId,
          q,
          kinds: kind ? [kind] : undefined,
        }),
      });
    }
    if (view === "list") {
      return NextResponse.json({
        data: listContextNodes(workspaceId, {
          projectId,
          contextKind: kind ?? undefined,
          q,
        }),
        meta: { engineeringLanguage: true, ontologyExposedToUsers: false },
      });
    }
    if (view === "relationships" && stableId) {
      return NextResponse.json({ data: listContextRelationships(workspaceId, stableId) });
    }
    if (view === "physical" && stableId) {
      return NextResponse.json({ data: physicalContextView(workspaceId, stableId) });
    }
    if (view === "functional" && stableId) {
      return NextResponse.json({ data: functionalContextView(workspaceId, stableId) });
    }
    if (view === "history" && stableId) {
      return NextResponse.json({ data: listConfigurationHistory(workspaceId, stableId) });
    }
    if (view === "work-package-links") {
      return NextResponse.json({ data: listWorkPackageContextLinks(workspaceId, wpId) });
    }
    if (view === "ui-contract") {
      return NextResponse.json({
        data: buildAssetSystemUiContract({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }

    return NextResponse.json({
      data: {
        facilities: listFacilities(workspaceId, projectId),
        areas: listAreas(workspaceId, projectId),
        systems: listSystems(workspaceId, projectId),
        assets: listAssets(workspaceId, projectId),
        audit: auditExistingModels(),
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

    const action = String(body.action ?? "create");
    try {
      if (action === "seed-pilot") {
        return NextResponse.json({
          data: seedPilot001AssetSystemContext({
            workspaceId,
            projectId,
            tenantId: ctx.tenantId,
          }),
        });
      }
      if (action === "seed-greenfield") {
        return NextResponse.json({
          data: seedGreenfieldProposedPumpContext({
            workspaceId,
            projectId,
            tenantId: ctx.tenantId,
          }),
        });
      }
      if (action === "create") {
        const displayName = String(body.displayName ?? body.name ?? "").trim();
        if (!displayName) {
          return lifecycleErrorResponse(
            "bad_request",
            "Name required only when context is not already known",
            400,
            correlationId,
          );
        }
        const node = createContextNode({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
          contextKind: (body.contextKind as AssetSystemContextKind) ?? "ASSET",
          displayName,
          tag: body.tag != null ? String(body.tag) : null,
          description: body.description ? String(body.description) : undefined,
          configurationState: body.configurationState as AssetConfigurationState | undefined,
          stableId: body.stableId ? String(body.stableId) : undefined,
          ownerName: body.ownerName != null ? String(body.ownerName) : null,
          ownerOrganization:
            body.ownerOrganization != null ? String(body.ownerOrganization) : null,
          primaryTechnicalDiscipline:
            body.primaryTechnicalDiscipline != null
              ? String(body.primaryTechnicalDiscipline)
              : null,
          supportingDisciplines: Array.isArray(body.supportingDisciplines)
            ? (body.supportingDisciplines as string[])
            : undefined,
          actorId: ctx.userId ?? "project-engineer",
        });
        return NextResponse.json({ data: node }, { status: 201 });
      }
      if (action === "relate") {
        const row = relateContext({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
          relationshipType: body.relationshipType as never,
          fromStableId: String(body.fromStableId),
          toStableId: String(body.toStableId),
          inferenceBasis: body.inferenceBasis ? String(body.inferenceBasis) : undefined,
          actorId: ctx.userId ?? null,
        });
        return NextResponse.json({ data: row }, { status: 201 });
      }
      if (action === "link-work-package") {
        const row = linkWorkPackageToContext({
          workspaceId,
          projectId,
          workPackageStableId: String(body.workPackageStableId),
          contextStableId: String(body.contextStableId),
          role: body.role as never,
          effect: body.effect as never,
        });
        return NextResponse.json({ data: row }, { status: 201 });
      }
      if (action === "associate-object") {
        const row = associateEngineeringObjectToContext({
          workspaceId,
          projectId,
          objectType: String(body.objectType),
          objectStableId: String(body.objectStableId),
          contextStableId: String(body.contextStableId),
          role: body.role as never,
        });
        return NextResponse.json({ data: row }, { status: 201 });
      }
      if (action === "derive-object-context") {
        const row = deriveObjectContextFromWorkPackage({
          workspaceId,
          projectId,
          objectType: String(body.objectType),
          objectStableId: String(body.objectStableId),
          workPackageStableId: String(body.workPackageStableId),
        });
        return NextResponse.json({ data: row });
      }
      return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "asset_system_error";
      return lifecycleErrorResponse("bad_request", msg, 400, correlationId);
    }
  },
);
