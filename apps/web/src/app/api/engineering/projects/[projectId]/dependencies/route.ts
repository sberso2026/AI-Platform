import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  auditDependencyStakeholderFoundations,
  buildAffectedDisciplineInputDataContract,
  buildMyWorkDependencyDataContract,
  buildWorkPackageDependencyUiContract,
  createInformationDependency,
  deriveDependencyFromCanonicalRelationships,
  ensurePilot001DependencyStakeholderState,
  listWorkPackageDependencies,
  measureDependencyPerformanceBaseline,
  queryDisciplineOutputDependencies,
  queryDisciplineRequiredInformation,
  queryStakeholderDependencies,
  queryWhatAmIWaitingOn,
  queryWhoIsWaitingOnMe,
  queryWorkPackageBlocking,
  unauthorizedDependencyWriteBlocked,
  updateDependencyHandoffState,
  type EngineeringDependencyType,
  type InformationDependencyStatus,
  type StakeholderClass,
} from "@/lib/engineering/eos3-engineering-dependency-stakeholder";

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
    const view = url.searchParams.get("view") ?? "workPackage";
    const wpId = url.searchParams.get("workPackageId") ?? "WP-STR-004";
    const discipline = url.searchParams.get("discipline") ?? undefined;
    const stakeholderClass = url.searchParams.get("stakeholderClass") as StakeholderClass | null;

    if (view === "audit") {
      return NextResponse.json({ data: auditDependencyStakeholderFoundations() });
    }
    if (view === "performance") {
      return NextResponse.json({ data: measureDependencyPerformanceBaseline() });
    }
    if (view === "workPackage") {
      return NextResponse.json({
        data: listWorkPackageDependencies(workspaceId, projectId, wpId),
      });
    }
    if (view === "ui") {
      return NextResponse.json({
        data: buildWorkPackageDependencyUiContract({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "waitingOn") {
      return NextResponse.json({
        data: queryWhatAmIWaitingOn({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
          discipline,
          identityId: url.searchParams.get("identityId") ?? undefined,
        }),
      });
    }
    if (view === "waitingForMe") {
      return NextResponse.json({
        data: queryWhoIsWaitingOnMe({
          workspaceId,
          projectId,
          workPackageStableId: url.searchParams.get("producerWorkPackageId") ?? undefined,
          discipline,
          identityId: url.searchParams.get("identityId") ?? undefined,
        }),
      });
    }
    if (view === "blocking") {
      return NextResponse.json({
        data: queryWorkPackageBlocking({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "disciplineRequired" && discipline) {
      return NextResponse.json({
        data: queryDisciplineRequiredInformation({
          workspaceId,
          projectId,
          discipline,
        }),
      });
    }
    if (view === "disciplineOutput" && discipline) {
      return NextResponse.json({
        data: queryDisciplineOutputDependencies({
          workspaceId,
          projectId,
          producerDiscipline: discipline,
          consumerDiscipline: url.searchParams.get("consumerDiscipline") ?? undefined,
        }),
      });
    }
    if (view === "stakeholder" && stakeholderClass) {
      return NextResponse.json({
        data: queryStakeholderDependencies({
          workspaceId,
          projectId,
          stakeholderClass,
        }),
      });
    }
    if (view === "myWorkContract") {
      return NextResponse.json({
        data: buildMyWorkDependencyDataContract({
          workspaceId,
          projectId,
          identityId: url.searchParams.get("identityId") ?? undefined,
          discipline,
        }),
      });
    }
    if (view === "affectedDisciplineContract") {
      return NextResponse.json({
        data: buildAffectedDisciplineInputDataContract({ workspaceId, projectId }),
      });
    }
    return NextResponse.json({
      data: listWorkPackageDependencies(workspaceId, projectId, wpId),
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
      unauthorizedDependencyWriteBlocked({
        callerWorkspaceId: workspaceId,
        targetWorkspaceId: String(body.targetWorkspaceId ?? workspaceId),
      })
    ) {
      return lifecycleErrorResponse(
        "forbidden",
        "Cross-workspace dependency write blocked.",
        403,
        correlationId,
      );
    }

    if (action === "ensurePilot") {
      return NextResponse.json({
        data: ensurePilot001DependencyStakeholderState({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }

    if (action === "create") {
      try {
        return NextResponse.json({
          data: createInformationDependency({
            tenantId: ctx.tenantId,
            workspaceId,
            projectId,
            dependencyType: String(body.dependencyType) as EngineeringDependencyType,
            informationObjectStableId: String(body.informationObjectStableId ?? ""),
            informationObjectClass: String(body.informationObjectClass ?? "Document"),
            informationObjectRevision:
              body.informationObjectRevision != null
                ? String(body.informationObjectRevision)
                : null,
            interfaceStableId:
              body.interfaceStableId != null ? String(body.interfaceStableId) : null,
            upstreamWorkPackageStableId:
              body.upstreamWorkPackageStableId != null
                ? String(body.upstreamWorkPackageStableId)
                : null,
            downstreamWorkPackageStableId:
              body.downstreamWorkPackageStableId != null
                ? String(body.downstreamWorkPackageStableId)
                : null,
            producerDiscipline:
              body.producerDiscipline != null ? String(body.producerDiscipline) : null,
            consumerDiscipline:
              body.consumerDiscipline != null ? String(body.consumerDiscipline) : null,
            status: body.status as InformationDependencyStatus | undefined,
            blocking: Boolean(body.blocking),
            requiredByDate: body.requiredByDate != null ? String(body.requiredByDate) : null,
            authorized: Boolean(body.authorized),
            actorId: String(body.actorId ?? ctx.userId ?? "engineer"),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "create_failed",
          403,
          correlationId,
        );
      }
    }

    if (action === "handoff") {
      try {
        return NextResponse.json({
          data: updateDependencyHandoffState({
            workspaceId,
            dependencyId: String(body.dependencyId ?? ""),
            status: String(body.status) as InformationDependencyStatus,
            revision: body.revision != null ? String(body.revision) : null,
            actorId: String(body.actorId ?? ctx.userId ?? "engineer"),
            note: body.note != null ? String(body.note) : undefined,
            authorized: Boolean(body.authorized),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "handoff_failed",
          403,
          correlationId,
        );
      }
    }

    if (action === "derive") {
      try {
        return NextResponse.json({
          data: deriveDependencyFromCanonicalRelationships({
            tenantId: ctx.tenantId,
            workspaceId,
            projectId,
            workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
            authorized: Boolean(body.authorized),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "derive_failed",
          403,
          correlationId,
        );
      }
    }

    return lifecycleErrorResponse("bad_request", "Unknown dependency action", 400, correlationId);
  },
);
