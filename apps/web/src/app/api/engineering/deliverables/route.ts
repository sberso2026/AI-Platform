import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApi } from "@/lib/commerce/engineering-api";

function statusFor(message: string): number {
  if (message.includes("denied") || message.includes("mismatch") || message === "unknown_maturity_profile") return 403;
  if (message === "caller_supplied_maturity_rejected") return 400;
  if (message === "workspace_required" || message === "rationale_required") return 400;
  return 400;
}

export const GET = withEngineeringApi("deliverables", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "catalog";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.deliverables.catalog() });
  }
  const projectId = url.searchParams.get("projectId") ?? "";
  if (action === "list" && projectId) {
    const data = await ctx.engineering.deliverables.list(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "detail") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.deliverables.getDetail(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data });
  }
  if (action === "lifecycle" && projectId) {
    const data = await ctx.engineering.deliverables.lifecycleSummary(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "mappings") {
    const data = await ctx.engineering.deliverables.listStatusMappings(commerce, ctx.tenantId, projectId || null);
    return NextResponse.json({ data });
  }
  if (action === "status" && url.searchParams.get("rawStatusCode")) {
    const data = await ctx.engineering.deliverables.getEffectiveStatusMapping(commerce, ctx.tenantId, {
      projectId: projectId || null,
      rawStatusCode: String(url.searchParams.get("rawStatusCode")),
    });
    return NextResponse.json({ data });
  }
  if (action === "revision") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.deliverables.resolveRevision(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  return NextResponse.json({ data: ctx.engineering.deliverables.catalog() });
});

export const POST = withEngineeringApi("deliverables", async ({ ctx, commerce, correlationId }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const action = String(body.action ?? "");
  try {
    if (body.maturityClaims || body.contentComplete || body.reviewComplete || body.traceabilityComplete || body.coordinationComplete) {
      return NextResponse.json({ error: "caller_supplied_maturity_rejected" }, { status: 400 });
    }
    if (action === "instantiate") {
      const data = await ctx.engineering.deliverables.instantiate(commerce, ctx.tenantId, {
        projectId: String(body.projectId ?? ""),
        code: String(body.code ?? ""),
        scopeType: body.scopeType ? (String(body.scopeType) as "PROJECT" | "SYSTEM" | "ASSET") : undefined,
        scopeId: typeof body.scopeId === "string" ? body.scopeId : undefined,
        stage: typeof body.stage === "string" ? (body.stage as never) : undefined,
        purpose: typeof body.purpose === "string" ? (body.purpose as never) : undefined,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    if (action === "adopt" || action === "markNotApplicable" || action === "bulkAdopt" || action === "createProject" || action === "configureMapping") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "deliverable_authority_required" }, { status: 403 });
      }
      if (action === "adopt") {
        const data = await ctx.engineering.deliverables.adoptTemplate(settingsCommerce, ctx.tenantId, {
          projectId: String(body.projectId ?? ""),
          code: String(body.code ?? ""),
          scopeType: body.scopeType ? (String(body.scopeType) as "PROJECT" | "SYSTEM" | "ASSET") : undefined,
          scopeId: typeof body.scopeId === "string" ? body.scopeId : undefined,
          stage: typeof body.stage === "string" ? (body.stage as never) : undefined,
          purpose: typeof body.purpose === "string" ? (body.purpose as never) : undefined,
          requirementState: typeof body.requirementState === "string" ? (body.requirementState as never) : undefined,
          actorId: ctx.userId,
        });
        return NextResponse.json({ data });
      }
      if (action === "markNotApplicable") {
        const data = await ctx.engineering.deliverables.markNotApplicable(settingsCommerce, ctx.tenantId, {
          projectId: String(body.projectId ?? ""),
          code: String(body.code ?? ""),
          actorId: ctx.userId,
        });
        return NextResponse.json({ data });
      }
      if (action === "bulkAdopt") {
        const data = await ctx.engineering.deliverables.bulkAdopt(settingsCommerce, ctx.tenantId, {
          projectId: String(body.projectId ?? ""),
          codes: Array.isArray(body.codes) ? body.codes.map(String) : [],
          confirmed: body.confirmed === true,
          actorId: ctx.userId,
        });
        return NextResponse.json({ data });
      }
      if (action === "createProject") {
        const definition = (body.definition ?? {}) as Record<string, unknown>;
        const data = await ctx.engineering.deliverables.createProjectExpectation(settingsCommerce, ctx.tenantId, {
          projectId: String(body.projectId ?? ""),
          definition: {
            definitionId: String(definition.definitionId ?? ""),
            definitionVersion: String(definition.definitionVersion ?? "v1"),
            code: String(definition.code ?? ""),
            name: String(definition.name ?? ""),
            purpose: String(definition.purpose ?? ""),
            artifactClasses: Array.isArray(definition.artifactClasses) ? (definition.artifactClasses as never) : ["document"],
            responsibleDiscipline: String(definition.responsibleDiscipline ?? "PROCESS"),
            contributingDisciplines: Array.isArray(definition.contributingDisciplines) ? definition.contributingDisciplines.map(String) : [],
            lifecycleStages: Array.isArray(definition.lifecycleStages) ? (definition.lifecycleStages as never) : ["FEED"],
            multidisciplinary: Boolean(definition.multidisciplinary),
            requiredRoles: Array.isArray(definition.requiredRoles) ? (definition.requiredRoles as never) : ["PRIMARY"],
            coordinationRequired: Boolean(definition.coordinationRequired),
            analysisRequired: Boolean(definition.analysisRequired),
            reviewRequired: Boolean(definition.reviewRequired),
            traceabilityRequired: Boolean(definition.traceabilityRequired),
            configurationRequired: Boolean(definition.configurationRequired),
            rationale: typeof definition.rationale === "string" ? definition.rationale : null,
          },
          purpose: typeof body.purpose === "string" ? (body.purpose as never) : undefined,
          actorId: ctx.userId,
        });
        return NextResponse.json({ data });
      }
      const data = await ctx.engineering.deliverables.configureStatusMapping(settingsCommerce, ctx.tenantId, {
        projectId: typeof body.projectId === "string" ? body.projectId : null,
        sourceSystem: String(body.sourceSystem ?? "project"),
        rawStatusCode: String(body.rawStatusCode ?? ""),
        semantic: String(body.semantic ?? "") as never,
        mappingVersion: String(body.mappingVersion ?? "v1"),
        enabled: body.enabled !== false,
        description: typeof body.description === "string" ? body.description : null,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    if (action === "bind") {
      const data = await ctx.engineering.deliverables.bind(commerce, ctx.tenantId, {
        expectationId: String(body.expectationId ?? ""),
        artifactClass: String(body.artifactClass ?? "") as never,
        artifactId: String(body.artifactId ?? ""),
        artifactRole: String(body.artifactRole ?? "PRIMARY") as never,
        revisionRef: typeof body.revisionRef === "string" ? body.revisionRef : null,
        revisionPolicy: typeof body.revisionPolicy === "string" ? (body.revisionPolicy as never) : undefined,
        actorId: ctx.userId,
      });
      return NextResponse.json({ data });
    }
    if (action === "evaluate") {
      const data = await ctx.engineering.deliverables.evaluate(commerce, ctx.tenantId, {
        expectationId: String(body.expectationId ?? ""),
      });
      return NextResponse.json({ data });
    }
    if (action === "waive") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "deliverable_authority_required" }, { status: 403 });
      }
      const data = await ctx.engineering.deliverables.waive(settingsCommerce, ctx.tenantId, {
        expectationId: String(body.expectationId ?? ""),
        assessmentId: String(body.assessmentId ?? ""),
        dimension: String(body.dimension ?? "") as never,
        rationale: String(body.rationale ?? ""),
        actorId: ctx.userId,
        supportingDecisionId: typeof body.supportingDecisionId === "string" ? body.supportingDecisionId : null,
      });
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "unsupported_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "deliverable_action_failed";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
});
