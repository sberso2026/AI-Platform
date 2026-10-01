import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

function statusFor(message: string): number {
  if (message.includes("denied") || message.includes("mismatch") || message.includes("broadening")) return 403;
  if (message === "workspace_required" || message === "caller_supplied_authority_rejected" || message === "project_required") return 400;
  if (message === "handover_not_ready_for_acceptance") return 409;
  return 400;
}

async function informationContext(
  engineering: {
    information: {
      list: (commerce: never, tenantId: string, projectId: string) => Promise<unknown[]>;
      listPolicies: (commerce: never, tenantId: string, projectId: string | null) => Promise<unknown[]>;
    };
  },
  commerce: never,
  tenantId: string,
  projectId: string,
) {
  const refs = await engineering.information.list(commerce, tenantId, projectId);
  const policies = await engineering.information.listPolicies(commerce, tenantId, projectId);
  return { refs: refs as never[], policies: policies as never[] };
}

export const GET = withEngineeringApi("information-requirements", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "catalog";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.informationRequirements.catalog() });
  }
  const projectId = url.searchParams.get("projectId") ?? "";
  if (!projectId && ["list", "views", "readiness", "packages", "handover"].includes(action)) {
    return NextResponse.json({ error: "project_required" }, { status: 400 });
  }
  if (action === "list") {
    const data = await ctx.engineering.informationRequirements.list(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "views" || action === "readiness") {
    const { refs, policies } = await informationContext(ctx.engineering, commerce as never, ctx.tenantId, projectId);
    const evaluated = await ctx.engineering.informationRequirements.evaluateAll(
      commerce,
      ctx.tenantId,
      projectId,
      refs,
      policies,
    );
    const workType = (url.searchParams.get("workType") ?? "FOUNDATION_CALCULATION") as never;
    const readiness = await ctx.engineering.informationRequirements.resolveWorkReadiness(commerce, ctx.tenantId, {
      projectId,
      workType,
      refs,
      policies,
    });
    const views = ctx.engineering.informationRequirements.views(evaluated.requirements, evaluated.evaluations, url.searchParams.get("discipline") ?? undefined);
    return NextResponse.json({ data: { views, readiness, evaluations: evaluated.evaluations, durationMs: evaluated.durationMs } });
  }
  if (action === "packages") {
    const data = await ctx.engineering.informationRequirements.listPackages(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "handover") {
    const packageId = url.searchParams.get("packageId");
    if (!packageId) return NextResponse.json({ error: "package_required" }, { status: 400 });
    const { refs, policies } = await informationContext(ctx.engineering, commerce as never, ctx.tenantId, projectId);
    const data = await ctx.engineering.informationRequirements.evaluateHandover(
      commerce,
      ctx.tenantId,
      packageId,
      refs,
      policies,
    );
    return NextResponse.json({ data });
  }
  if (action === "required") {
    const workType = url.searchParams.get("workType") ?? "FOUNDATION_CALCULATION";
    const lifecycleStage = url.searchParams.get("lifecycleStage") ?? "FEED";
    const data = ctx.engineering.informationRequirements.getRequiredInformationForWork(workType as never, lifecycleStage as never);
    return NextResponse.json({ data });
  }
  return NextResponse.json({ data: ctx.engineering.informationRequirements.catalog() });
});

export const POST = withEngineeringApi("information-requirements", async ({ ctx, commerce }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const rejected = ctx.engineering.informationRequirements.rejectCallerClaims(body);
  if (rejected) {
    return NextResponse.json({ error: rejected }, { status: 400 });
  }
  const action = String(body.action ?? "");
  const projectId = String(body.projectId ?? "");
  try {
    if (action === "instantiate") {
      const data = await ctx.engineering.informationRequirements.instantiateWorkRequirements(commerce, ctx.tenantId, {
        projectId,
        workType: String(body.workType ?? "") as never,
        lifecycleStage: String(body.lifecycleStage ?? "") as never,
        systemId: typeof body.systemId === "string" ? body.systemId : null,
        interfaceId: typeof body.interfaceId === "string" ? body.interfaceId : null,
        deliverableId: typeof body.deliverableId === "string" ? body.deliverableId : null,
        constructionRequestId: typeof body.constructionRequestId === "string" ? body.constructionRequestId : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "applyAction") {
      const data = await ctx.engineering.informationRequirements.applyAction(commerce, ctx.tenantId, {
        requirementId: String(body.requirementId ?? ""),
        action: String(body.workflowAction ?? "") as never,
        informationRefId: typeof body.informationRefId === "string" ? body.informationRefId : null,
        managedRepositoryId: typeof body.managedRepositoryId === "string" ? body.managedRepositoryId : null,
        unmanaged: Boolean(body.unmanaged),
        providerDiscipline: typeof body.providerDiscipline === "string" ? body.providerDiscipline : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "resolveWorkReadiness" || action === "startWork") {
      const { refs, policies } = await informationContext(ctx.engineering, commerce as never, ctx.tenantId, projectId);
      const data =
        action === "startWork"
          ? await ctx.engineering.informationRequirements.startWork(commerce, ctx.tenantId, {
              projectId,
              workType: String(body.workType ?? "") as never,
              refs,
              policies,
            })
          : await ctx.engineering.informationRequirements.resolveWorkReadiness(commerce, ctx.tenantId, {
              projectId,
              workType: String(body.workType ?? "") as never,
              refs,
              policies,
            });
      return NextResponse.json({ data });
    }
    if (action === "assembleHandover") {
      const data = await ctx.engineering.informationRequirements.assembleHandoverPackage(commerce, ctx.tenantId, {
        projectId,
        displayName: String(body.displayName ?? "Handover package"),
        systemId: typeof body.systemId === "string" ? body.systemId : null,
        discipline: typeof body.discipline === "string" ? body.discipline : null,
        requirementIds: Array.isArray(body.requirementIds) ? body.requirementIds.map(String) : [],
      });
      return NextResponse.json({ data });
    }
    if (action === "acceptHandover") {
      const data = await ctx.engineering.informationRequirements.acceptHandover(
        commerce,
        ctx.tenantId,
        String(body.packageId ?? ""),
        ctx.userId,
      );
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "information_requirement_error";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
});
