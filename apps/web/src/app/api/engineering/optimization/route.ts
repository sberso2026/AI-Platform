import { NextResponse } from "next/server";
import { withEngineeringApi } from "@/lib/commerce/engineering-api";

export const GET = withEngineeringApi("optimization", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const runId = url.searchParams.get("runId");
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");
  if (runId && action === "manifest") {
    const data = await ctx.engineering.optimizationRuns.getManifest(commerce, ctx.tenantId, runId);
    return NextResponse.json({ data });
  }
  if (runId && action === "feasibility") {
    const data = await ctx.engineering.optimizationRuns.evaluateFeasibility(commerce, ctx.tenantId, runId);
    return NextResponse.json({ data });
  }
  if (runId) {
    const data = await ctx.engineering.optimizationRuns.get(commerce, ctx.tenantId, runId);
    return NextResponse.json({ data });
  }
  if (id && action === "preflight") {
    const data = await ctx.engineering.optimizationStudies.preflight(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  if (id && action === "pareto") {
    const data = await ctx.engineering.optimizationRuns.computePareto(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  if (id && action === "staleness") {
    const data = await ctx.engineering.optimizationStudies.staleness(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  if (id) {
    const data = await ctx.engineering.optimizationStudies.get(commerce, ctx.tenantId, id);
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? undefined;
  const data = await ctx.engineering.optimizationStudies.list(commerce, ctx.tenantId, projectId);
  return NextResponse.json({ data });
});

export const POST = withEngineeringApi("optimization", async ({ ctx, commerce }, request) => {
  const body = await request.json();
  const tenantId = ctx.tenantId;
  if (body.action === "set_context" && body.id) {
    const data = await ctx.engineering.optimizationStudies.setContext(commerce, tenantId, body.id, {
      configurationBaselineId: body.configurationBaselineId,
      decisionId: body.decisionId,
      requirementsContext: body.requirementsContext,
      assumptionsContext: body.assumptionsContext,
      interfacesContext: body.interfacesContext,
    });
    return NextResponse.json({ data });
  }
  if (body.action === "set_scope" && body.id && Array.isArray(body.systemIds)) {
    const data = await ctx.engineering.optimizationStudies.setSystemScope(
      commerce,
      tenantId,
      body.id,
      body.systemIds,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "link_requirement" && body.id && body.requirementId) {
    const data = await ctx.engineering.optimizationStudies.linkRequirement(
      commerce,
      tenantId,
      body.id,
      body.requirementId,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "link_assumption" && body.id && body.assumptionId) {
    const data = await ctx.engineering.optimizationStudies.linkAssumption(
      commerce,
      tenantId,
      body.id,
      body.assumptionId,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "link_interface" && body.id && body.interfaceId) {
    const data = await ctx.engineering.optimizationStudies.linkInterface(
      commerce,
      tenantId,
      body.id,
      body.interfaceId,
      ctx.userId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "add_objective" && body.id) {
    const data = await ctx.engineering.optimizationStudies.addObjective(commerce, tenantId, body.id, {
      objectiveCode: body.objectiveCode,
      name: body.name,
      metricKey: body.metricKey,
      direction: body.direction,
      targetValue: body.targetValue,
      unit: body.unit,
      priority: body.priority,
      weight: body.weight,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "add_constraint" && body.id) {
    const data = await ctx.engineering.optimizationStudies.addConstraint(commerce, tenantId, body.id, {
      constraintCode: body.constraintCode,
      name: body.name,
      constraintKind: body.constraintKind,
      metricKey: body.metricKey,
      operator: body.operator,
      thresholdValue: body.thresholdValue,
      unit: body.unit,
      hardness: body.hardness,
      sourceObjectType: body.sourceObjectType,
      sourceObjectId: body.sourceObjectId,
      actorId: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "add_variable" && body.id) {
    const data = await ctx.engineering.optimizationStudies.addDesignVariable(commerce, tenantId, body.id, {
      variableCode: body.variableCode,
      name: body.name,
      variableType: body.variableType,
      unit: body.unit,
      lowerBound: body.lowerBound,
      upperBound: body.upperBound,
      allowedValues: body.allowedValues,
      defaultValue: body.defaultValue,
      description: body.description,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "add_scenario" && body.id) {
    const data = await ctx.engineering.optimizationStudies.addScenario(commerce, tenantId, body.id, {
      scenarioCode: body.scenarioCode,
      name: body.name,
      description: body.description,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "add_alternative" && body.id) {
    const data = await ctx.engineering.optimizationStudies.addAlternative(commerce, tenantId, body.id, {
      alternativeCode: body.alternativeCode,
      name: body.name,
      description: body.description,
      decisionAlternativeId: body.decisionAlternativeId,
      createdBy: ctx.userId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "set_alternative_values" && body.id && body.alternativeId) {
    const data = await ctx.engineering.optimizationStudies.setAlternativeValues(
      commerce,
      tenantId,
      body.id,
      body.alternativeId,
      body.values ?? [],
    );
    return NextResponse.json({ data });
  }
  if (body.action === "withdraw_alternative" && body.id && body.alternativeId) {
    const data = await ctx.engineering.optimizationStudies.withdrawAlternative(
      commerce,
      tenantId,
      body.id,
      body.alternativeId,
    );
    return NextResponse.json({ data });
  }
  if (body.action === "set_ready" && body.id) {
    const data = await ctx.engineering.optimizationStudies.setReady(commerce, tenantId, body.id, ctx.userId);
    return NextResponse.json({ data });
  }
  if (body.action === "close" && body.id) {
    const data = await ctx.engineering.optimizationStudies.close(commerce, tenantId, body.id, body.supersededById);
    return NextResponse.json({ data });
  }
  if (body.action === "queue_run" && body.id && body.alternativeId) {
    const data = await ctx.engineering.optimizationRuns.create(commerce, tenantId, {
      studyId: body.id,
      alternativeId: body.alternativeId,
      scenarioId: body.scenarioId,
      analysisEngine: body.analysisEngine,
      adapterId: body.adapterId,
      adapterVersion: body.adapterVersion,
      algorithmId: body.algorithmId,
      algorithmVersion: body.algorithmVersion,
      randomSeed: body.randomSeed,
      createdBy: ctx.userId,
      externalToolProfileId: body.externalToolProfileId,
    });
    return NextResponse.json({ data }, { status: 201 });
  }
  if (body.action === "ingest_results" && body.runId && Array.isArray(body.metrics)) {
    const data = await ctx.engineering.optimizationRuns.ingestResults(commerce, tenantId, body.runId, {
      sourceKind: "MANUAL",
      metrics: body.metrics,
      actorId: ctx.userId,
      markSucceeded: body.markSucceeded,
    });
    return NextResponse.json({ data });
  }
  if (body.action === "process_run" && body.runId) {
    const data = await ctx.engineering.optimizationRuns.processQueuedJob(commerce, tenantId, body.runId);
    return NextResponse.json({ data });
  }
  if (body.action === "cancel_run" && body.runId) {
    const data = await ctx.engineering.optimizationRuns.cancel(commerce, tenantId, body.runId, ctx.userId);
    return NextResponse.json({ data });
  }
  const data = await ctx.engineering.optimizationStudies.create(commerce, {
    tenantId,
    title: body.title,
    description: body.description,
    lifecycleStage: body.lifecycleStage,
    studyCode: body.studyCode,
    projectId: body.projectId,
    ownerId: body.ownerId,
    createdBy: ctx.userId,
  });
  return NextResponse.json({ data }, { status: 201 });
});
