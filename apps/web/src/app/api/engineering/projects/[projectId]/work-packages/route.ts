import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  addDependency,
  associateObject,
  buildWorkPackageUiContract,
  createWorkPackage,
  deriveBlockers,
  deriveNextAction,
  deriveReadiness,
  getWorkPackage,
  listAssociations,
  listDependencies,
  listWorkPackages,
  seedPilot001SupportFrameWorkPackage,
  updateWorkPackage,
  type WorkPackageMaturity,
} from "@/lib/engineering/eos3-work-package-service";

async function requireProjectRead(
  ctx: CommerceHandlerContext["ctx"],
  correlationId: string,
  projectId: string,
) {
  const readCommerce = await authorizeEngineeringSegment(
    ctx,
    "projects",
    "GET",
    correlationId,
  );
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
  const project = await ctx.engineering.projects.get(
    readCommerce,
    ctx.tenantId,
    projectId,
  );
  if (!project) {
    return {
      error: lifecycleErrorResponse("not_found", "Project not found", 404, correlationId),
      project: null as null,
    };
  }
  return { error: null, project };
}

/**
 * Project-scoped Work Package API (DOMAIN-1).
 * Auth: projects segment (project.read / project.create). Workspace isolation via project.get.
 */
export const GET = withEngineeringApiParams(
  "projects",
  async ({ ctx, commerce, correlationId }, request, { projectId }) => {
    const project = await ctx.engineering.projects.get(commerce, ctx.tenantId, projectId);
    if (!project) {
      return lifecycleErrorResponse("not_found", "Project not found", 404, correlationId);
    }

    const url = new URL(request.url);
    const view = url.searchParams.get("view") ?? "list";
    const wpId = url.searchParams.get("id") ?? url.searchParams.get("stableId");

    // Safe pilot seed: creates WP-STR-004 without mutating project lifecycle
    const projectCode =
      String((project as Record<string, unknown>).code ?? "") ||
      String((project as Record<string, unknown>).project_code ?? "") ||
      projectId;
    if (
      projectId.toUpperCase().includes("PILOT") ||
      projectCode.toUpperCase().includes("PILOT-001") ||
      url.searchParams.get("seedPilot") === "1"
    ) {
      seedPilot001SupportFrameWorkPackage(projectId);
    }

    if (view === "list") {
      return NextResponse.json({
        data: listWorkPackages(projectId),
        meta: {
          projectPreserved: true,
          engineeringLanguage: true,
          ownerIsNotApprovalAuthority: true,
        },
      });
    }

    if (!wpId) {
      return lifecycleErrorResponse(
        "bad_request",
        "Work Package id or stableId required",
        400,
        correlationId,
      );
    }

    const wp = getWorkPackage(projectId, wpId);
    if (!wp) {
      return lifecycleErrorResponse("not_found", "Work Package not found", 404, correlationId);
    }

    if (view === "detail") {
      return NextResponse.json({ data: wp });
    }
    if (view === "associations") {
      return NextResponse.json({ data: listAssociations(projectId, wpId) });
    }
    if (view === "dependencies") {
      return NextResponse.json({ data: listDependencies(projectId, wpId) });
    }
    if (view === "blockers") {
      return NextResponse.json({ data: deriveBlockers(projectId, wpId) });
    }
    if (view === "readiness") {
      return NextResponse.json({ data: deriveReadiness(projectId, wpId) });
    }
    if (view === "next-action") {
      return NextResponse.json({
        data: {
          nextRecommendedAction: deriveNextAction(projectId, wpId),
          grantsAuthority: false,
        },
      });
    }
    if (view === "ui-contract") {
      return NextResponse.json({ data: buildWorkPackageUiContract(projectId, wpId) });
    }

    return NextResponse.json({
      data: {
        workPackage: wp,
        associations: listAssociations(projectId, wpId),
        dependencies: listDependencies(projectId, wpId),
        blockers: deriveBlockers(projectId, wpId),
        readiness: deriveReadiness(projectId, wpId),
        nextRecommendedAction: deriveNextAction(projectId, wpId),
        uiContract: buildWorkPackageUiContract(projectId, wpId),
      },
    });
  },
);

export const POST = withEngineeringApiParams(
  "projects",
  async ({ ctx, correlationId }, request, { projectId }) => {
    const { error, project } = await requireProjectRead(ctx, correlationId, projectId);
    if (error || !project) return error!;

    // Write commerce already bound by withEngineeringApiParams projects → project.create
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return lifecycleErrorResponse("bad_request", "Invalid JSON", 400, correlationId);
    }

    const action = String(body.action ?? "create");

    try {
      if (action === "seed-pilot") {
        const seeded = seedPilot001SupportFrameWorkPackage(projectId);
        return NextResponse.json({ data: seeded });
      }

      if (action === "create") {
        const title = String(body.title ?? "").trim();
        if (!title) {
          return lifecycleErrorResponse(
            "bad_request",
            "What work needs to be done? (title required)",
            400,
            correlationId,
          );
        }
        const wp = createWorkPackage({
          tenantId: ctx.tenantId,
          workspaceId: String(
            (project as Record<string, unknown>).workspace_id ??
              (project as Record<string, unknown>).workspaceId ??
              "",
          ),
          projectId,
          title,
          description: body.description ? String(body.description) : undefined,
          affectedAssetHint: body.affectedAssetHint
            ? String(body.affectedAssetHint)
            : undefined,
          ownerId: body.ownerId != null ? String(body.ownerId) : ctx.userId ?? null,
          ownerName: body.ownerName != null ? String(body.ownerName) : undefined,
          maturity: body.maturity as WorkPackageMaturity | undefined,
          initiatingDiscipline: body.initiatingDiscipline
            ? String(body.initiatingDiscipline)
            : undefined,
          leadDiscipline: body.leadDiscipline ? String(body.leadDiscipline) : undefined,
          participatingDisciplines: Array.isArray(body.participatingDisciplines)
            ? (body.participatingDisciplines as string[])
            : undefined,
          stableId: body.stableId ? String(body.stableId) : undefined,
        });
        return NextResponse.json({ data: wp }, { status: 201 });
      }

      if (action === "update") {
        const id = String(body.id ?? body.stableId ?? "");
        const wp = updateWorkPackage(projectId, id, {
          title: body.title != null ? String(body.title) : undefined,
          description: body.description != null ? String(body.description) : undefined,
          maturity: body.maturity as WorkPackageMaturity | undefined,
          status: body.status as "ACTIVE" | "ON_HOLD" | "CLOSED" | undefined,
          priority: body.priority as "low" | "medium" | "high" | undefined,
          riskState: body.riskState as "UNKNOWN" | "LOW" | "MEDIUM" | "HIGH" | undefined,
          ownerName: body.ownerName != null ? String(body.ownerName) : undefined,
          ownerId: body.ownerId != null ? String(body.ownerId) : undefined,
          leadDiscipline: body.leadDiscipline != null ? String(body.leadDiscipline) : undefined,
          participatingDisciplines: Array.isArray(body.participatingDisciplines)
            ? (body.participatingDisciplines as string[])
            : undefined,
          reviewingDisciplines: Array.isArray(body.reviewingDisciplines)
            ? (body.reviewingDisciplines as string[])
            : undefined,
          active: typeof body.active === "boolean" ? body.active : undefined,
        });
        return NextResponse.json({ data: wp });
      }

      if (action === "associate") {
        const row = associateObject(projectId, String(body.workPackageId ?? body.stableId), {
          objectType: body.objectType as never,
          objectStableId: String(body.objectStableId),
          objectId: body.objectId != null ? String(body.objectId) : null,
          role: body.role as never,
          confirmationState: body.confirmationState as never,
        });
        return NextResponse.json({ data: row }, { status: 201 });
      }

      if (action === "add-dependency") {
        const row = addDependency(projectId, {
          sourceStableId: String(body.sourceStableId),
          targetStableId: String(body.targetStableId),
          dependencyType: body.dependencyType as "REQUIRES" | "DEPENDS_ON" | "AFFECTS",
        });
        return NextResponse.json({ data: row }, { status: 201 });
      }

      return lifecycleErrorResponse("bad_request", `Unknown action: ${action}`, 400, correlationId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "work_package_error";
      const status = msg.includes("not_found") ? 404 : 400;
      return lifecycleErrorResponse("bad_request", msg, status, correlationId);
    }
  },
);
