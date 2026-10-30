import { NextResponse } from "next/server";
import {
  authorizeEngineeringSegment,
  withEngineeringApiParams,
  type CommerceHandlerContext,
} from "@/lib/commerce/engineering-api";
import { lifecycleErrorResponse } from "@/lib/lifecycle-api";
import {
  auditDisciplineDiscoveryFoundations,
  buildContextResolutionDisciplineDataContract,
  buildMyWorkDisciplineContextDataContract,
  buildWorkPackageDisciplineContext,
  confirmDisciplineAssociation,
  discoverAffectedDisciplines,
  ensurePilot001DisciplineDiscovery,
  explainWhyDisciplineAffected,
  getDisciplineContextHistory,
  measureDisciplineDiscoveryPerformance,
  queryAffectedDisciplines,
  queryConsumerDisciplinesForObject,
  queryInformationProviderDisciplines,
  queryProjectDisciplineProfile,
  queryReviewingDisciplines,
  rejectDisciplineAssociation,
  unauthorizedDisciplineWriteBlocked,
} from "@/lib/engineering/eos3-dynamic-affected-discipline-discovery";

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
    const view = url.searchParams.get("view") ?? "affected";
    const wpId = url.searchParams.get("workPackageId") ?? "WP-STR-004";
    const discipline = url.searchParams.get("discipline") ?? "Mechanical";
    const objectId = url.searchParams.get("objectId") ?? "CALC-001";

    if (view === "audit") {
      return NextResponse.json({ data: auditDisciplineDiscoveryFoundations() });
    }
    if (view === "performance") {
      return NextResponse.json({ data: measureDisciplineDiscoveryPerformance() });
    }
    if (view === "affected") {
      return NextResponse.json({
        data: queryAffectedDisciplines({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "why") {
      return NextResponse.json({
        data: explainWhyDisciplineAffected({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
          discipline,
        }),
      });
    }
    if (view === "context") {
      return NextResponse.json({
        data: buildWorkPackageDisciplineContext({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "projectProfile") {
      return NextResponse.json({
        data: queryProjectDisciplineProfile({ workspaceId, projectId }),
      });
    }
    if (view === "reviewing") {
      return NextResponse.json({
        data: queryReviewingDisciplines({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "providers") {
      return NextResponse.json({
        data: queryInformationProviderDisciplines({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    if (view === "consumers") {
      return NextResponse.json({
        data: queryConsumerDisciplinesForObject({
          workspaceId,
          projectId,
          informationObjectStableId: objectId,
        }),
      });
    }
    if (view === "history") {
      return NextResponse.json({
        data: getDisciplineContextHistory(workspaceId, projectId, wpId),
      });
    }
    if (view === "myWorkContract") {
      return NextResponse.json({
        data: buildMyWorkDisciplineContextDataContract({
          workspaceId,
          projectId,
          userDiscipline: url.searchParams.get("userDiscipline") ?? undefined,
        }),
      });
    }
    if (view === "contextResolutionContract") {
      return NextResponse.json({
        data: buildContextResolutionDisciplineDataContract({
          workspaceId,
          projectId,
          workPackageStableId: wpId,
        }),
      });
    }
    return NextResponse.json({
      data: queryAffectedDisciplines({
        workspaceId,
        projectId,
        workPackageStableId: wpId,
      }),
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
      unauthorizedDisciplineWriteBlocked({
        callerWorkspaceId: workspaceId,
        targetWorkspaceId: String(body.targetWorkspaceId ?? workspaceId),
      })
    ) {
      return lifecycleErrorResponse(
        "forbidden",
        "Cross-workspace discipline write blocked.",
        403,
        correlationId,
      );
    }

    if (action === "ensurePilot") {
      return NextResponse.json({
        data: ensurePilot001DisciplineDiscovery({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
        }),
      });
    }
    if (action === "discover") {
      return NextResponse.json({
        data: discoverAffectedDisciplines({
          tenantId: ctx.tenantId,
          workspaceId,
          projectId,
          workPackageStableId: String(body.workPackageStableId ?? "WP-STR-004"),
        }),
      });
    }
    if (action === "confirm") {
      try {
        return NextResponse.json({
          data: confirmDisciplineAssociation({
            workspaceId,
            associationId: String(body.associationId ?? ""),
            actorId: String(body.actorId ?? ctx.userId ?? "engineer"),
            authorized: Boolean(body.authorized),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "confirm_failed",
          403,
          correlationId,
        );
      }
    }
    if (action === "reject") {
      try {
        return NextResponse.json({
          data: rejectDisciplineAssociation({
            workspaceId,
            associationId: String(body.associationId ?? ""),
            actorId: String(body.actorId ?? ctx.userId ?? "engineer"),
            reason: String(body.reason ?? ""),
            authorized: Boolean(body.authorized),
          }),
        });
      } catch (e) {
        return lifecycleErrorResponse(
          "forbidden",
          e instanceof Error ? e.message : "reject_failed",
          403,
          correlationId,
        );
      }
    }
    return lifecycleErrorResponse("bad_request", "Unknown discipline action", 400, correlationId);
  },
);
