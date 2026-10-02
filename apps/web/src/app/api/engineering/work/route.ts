import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApi } from "@/lib/commerce/engineering-api";
import { assembleSnapshotFromRecords, assertCanonicalWorkPlanOwnership, inheritWorkPlanContext, lifecycleAskPrompts, lifecycleEmptyState, resolveNextLifecycleWork, sanitizeArtifactFileName, workbenchActionsForLifecycle, WORKBENCH_DEEP_MODULES, type EngineeringOS } from "@rtb/engineering-os";
import type { CommerceExecutionContext } from "@rtb/types";
import { forbiddenResponse } from "@/lib/lifecycle-api";

function statusFor(message: string): number {
  if (
    message.includes("denied") ||
    message.includes("DENIED") ||
    message.includes("mismatch") ||
    message.includes("MISMATCH") ||
    message.includes("UNAUTHORIZED") ||
    message.includes("OUTSIDE_EOS") ||
    message.includes("broadening") ||
    message.includes("CROSS_PROJECT") ||
    message.includes("CROSS_TENANT") ||
    message.includes("CROSS_WORKSPACE")
  ) return 403;
  if (message === "workspace_required" || message === "caller_supplied_authority_rejected" || message === "project_required") return 400;
  if (message === "work_plan_stale" || message === "unmanaged_file_outside_eos" || message === "verified_mto_immutable" || message === "snapshot_verification_blocked") return 409;
  if (message === "HANDOFF_EXPIRED" || message === "BRIDGE_UNAVAILABLE" || message === "CAPABILITY_NOT_CERTIFIED") return 409;
  return 400;
}

async function safeList<T>(load: () => Promise<T[]>, fallback: T[] = []): Promise<T[]> {
  try {
    return await load();
  } catch {
    return fallback;
  }
}

async function assemblePlanContext(
  ctx: { engineering: EngineeringOS; tenantId: string },
  requestCtx: { authorize: (segment: string) => Promise<CommerceExecutionContext | null> },
  projectId: string,
  workType: string,
) {
  const infoCommerce = await requestCtx.authorize("information");
  const irCommerce = await requestCtx.authorize("information-requirements");
  const reqCommerce = await requestCtx.authorize("requirements");
  const asmCommerce = await requestCtx.authorize("assumptions");
  const ifcCommerce = await requestCtx.authorize("interfaces");
  const decCommerce = await requestCtx.authorize("decisions");
  const anlCommerce = await requestCtx.authorize("analysis");
  const delCommerce = await requestCtx.authorize("deliverables");
  const requirements = reqCommerce
    ? await safeList(() => ctx.engineering.requirements.list(reqCommerce, ctx.tenantId, projectId) as Promise<Record<string, unknown>[]>)
    : [];
  const assumptions = asmCommerce
    ? await safeList(() => ctx.engineering.assumptions.list(asmCommerce, ctx.tenantId, projectId) as Promise<Record<string, unknown>[]>)
    : [];
  const interfaces = ifcCommerce
    ? await safeList(() => ctx.engineering.interfaces.list(ifcCommerce, ctx.tenantId, projectId) as Promise<Record<string, unknown>[]>)
    : [];
  const decisions = decCommerce
    ? await safeList(() => ctx.engineering.decisions.list(decCommerce, ctx.tenantId, projectId) as Promise<Record<string, unknown>[]>)
    : [];
  const analyses = anlCommerce
    ? await safeList(() => ctx.engineering.analysisRequests.list(anlCommerce, ctx.tenantId, projectId) as Promise<Record<string, unknown>[]>)
    : [];
  const deliverables = delCommerce
    ? await safeList(() => ctx.engineering.deliverables.list(delCommerce, ctx.tenantId, projectId) as Promise<Record<string, unknown>[]>)
    : [];
  let information: Array<Record<string, unknown>> = [];
  let gaps: Array<{ kind: "missing" | "stale" | "unaccepted"; title: string; explanation: string }> = [];
  let readiness = null;
  if (irCommerce && infoCommerce) {
    const refs = await safeList(() => ctx.engineering.information.list(infoCommerce, ctx.tenantId, projectId));
    const policies = await safeList(() => ctx.engineering.information.listPolicies(infoCommerce, ctx.tenantId, projectId));
    const template = ctx.engineering.workGenerator.catalog().templates.find((row: { workType: string }) => row.workType === workType);
    const informationWorkType = template?.informationWorkType;
    if (informationWorkType) {
      try {
        readiness = await ctx.engineering.informationRequirements.resolveWorkReadiness(irCommerce, ctx.tenantId, {
          projectId,
          workType: informationWorkType,
          refs,
          policies,
        });
        information = [
          ...(readiness.available ?? []).map((row: { requirementId: string; explanation: string; freshness: string | null; authorityOutcome: string | null }) => ({
            requirementId: row.requirementId,
            informationType: "DESIGN_INPUT",
            title: row.explanation,
            freshness: row.freshness,
            authorityOutcome: row.authorityOutcome,
            whyIncluded: "A10C required information accepted for purpose. Not engineering approval.",
          })),
        ];
        gaps = [
          ...(readiness.missing ?? []).map((row: { explanation: string }) => ({ kind: "missing" as const, title: row.explanation, explanation: row.explanation })),
          ...(readiness.stale ?? []).map((row: { explanation: string }) => ({ kind: "stale" as const, title: row.explanation, explanation: row.explanation })),
          ...(readiness.unaccepted ?? []).map((row: { explanation: string }) => ({ kind: "unaccepted" as const, title: row.explanation, explanation: row.explanation })),
        ];
      } catch {
        readiness = null;
      }
    }
  }
  const snapshot = assembleSnapshotFromRecords({
    requirements,
    assumptions,
    interfaces,
    decisions,
    analyses: analyses as Record<string, unknown>[],
    information: information as never,
    gaps,
    deliverable: deliverables[0]
      ? {
          objectType: "deliverable_expectation",
          objectId: String((deliverables[0] as Record<string, unknown>).id ?? "deliverable"),
          title: String((deliverables[0] as Record<string, unknown>).title ?? (deliverables[0] as Record<string, unknown>).name ?? "Deliverable"),
          whyIncluded: "Related Deliverable Expectation. Generating a Work Plan does not change maturity.",
        }
      : null,
  });
  return { snapshot, readiness };
}

export const GET = withEngineeringApi("work", async ({ ctx, commerce, correlationId }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "catalog";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.work.catalog() });
  }
  if (action === "generatorCatalog") {
    return NextResponse.json({ data: ctx.engineering.workGenerator.catalog() });
  }
  if (action === "engineeringDay") {
    const started = Date.now();
    const projectCommerce = await authorizeEngineeringSegment(ctx, "projects", "GET", correlationId);
    if (!projectCommerce) {
      return forbiddenResponse(
        correlationId,
        "Authorized project discovery requires project.read",
        "forbidden",
      );
    }
    const data = await ctx.engineering.attention.resolve(commerce, ctx.tenantId, {
      projectCommerce,
      viewProjectId: url.searchParams.get("filterProjectId") || (url.searchParams.get("scope") === "current" ? url.searchParams.get("projectId") : null),
      category: (url.searchParams.get("category") as never) || "ALL",
      discipline: url.searchParams.get("discipline") || null,
      lifecycle: url.searchParams.get("lifecycle") || null,
    });
    return NextResponse.json({
      data: {
        ...data,
        metrics: { initialMs: Date.now() - started, attentionMs: data.durationMs },
      },
    });
  }
  if (action === "attentionCatalog") {
    return NextResponse.json({ data: ctx.engineering.attention.catalog() });
  }
  if (action === "workbench") {
    const started = Date.now();
    const projectIdForView = url.searchParams.get("projectId") ?? "";
    if (!projectIdForView) return NextResponse.json({ error: "project_required" }, { status: 400 });
    const plansStarted = Date.now();
    const plans = await ctx.engineering.workGenerator.listPlans(commerce, ctx.tenantId, projectIdForView);
    const plansMs = Date.now() - plansStarted;
    let lifecycleStage: string = "UNKNOWN";
    let mixedScopes: Array<{ scopeType: string; scopeId: string; stage: string }> = [];
    try {
      const lifecycleCommerce = await authorizeEngineeringSegment(ctx, "lifecycle", "GET", correlationId);
      if (lifecycleCommerce) {
        const effective = await ctx.engineering.lifecycle.effective(lifecycleCommerce, ctx.tenantId, {
          projectId: projectIdForView,
          scopeType: "PROJECT",
          scopeId: projectIdForView,
        });
        lifecycleStage = effective?.stage ?? "UNKNOWN";
        mixedScopes = await ctx.engineering.lifecycle.scopedStates(lifecycleCommerce, ctx.tenantId, projectIdForView);
      }
    } catch {
      lifecycleStage = "UNKNOWN";
    }
    if (lifecycleStage === "UNKNOWN") {
      const fromPlan = plans.find((row) => row.status !== "SUPERSEDED" && row.status !== "CANCELLED");
      if (fromPlan?.lifecycleStage) lifecycleStage = fromPlan.lifecycleStage;
    }
    const actionsStarted = Date.now();
    const actions = workbenchActionsForLifecycle(lifecycleStage as never);
    const actionsMs = Date.now() - actionsStarted;
    const governingStarted = Date.now();
    const open = plans.find((row) => row.status !== "SUPERSEDED" && row.status !== "CANCELLED");
    const governingInformation = (open?.context.information ?? []).slice(0, 8).map((row) => ({
      title: row.title,
      revision: row.revision ?? null,
      purpose: row.purpose ?? row.whyIncluded ?? null,
    }));
    const governingMs = Date.now() - governingStarted;
    return NextResponse.json({
      data: {
        lifecycleStage,
        mixedScopes: mixedScopes.slice(0, 12),
        emptyState: lifecycleEmptyState(lifecycleStage as never),
        askQuestions: lifecycleAskPrompts(lifecycleStage as never),
        actions,
        governingInformation,
        deepModules: WORKBENCH_DEEP_MODULES,
        metrics: { initialMs: Date.now() - started, plansMs, actionsMs, governingMs },
      },
    });
  }
  if (action === "templatePolicies") {
    const data = await ctx.engineering.artifactAutomation.listTemplatePolicies(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  if (action === "resolveTemplate") {
    const workPlanId = url.searchParams.get("workPlanId") ?? url.searchParams.get("id") ?? "";
    if (!workPlanId) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.artifactAutomation.resolveTemplate(commerce, ctx.tenantId, {
      workPlanId,
      artifactType: (url.searchParams.get("artifactType") as never) ?? undefined,
    });
    return NextResponse.json({ data });
  }
  const projectId = url.searchParams.get("projectId") ?? "";
  if (action === "list" && projectId) {
    const data = await ctx.engineering.work.list(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "plans" && projectId) {
    const data = await ctx.engineering.workGenerator.listPlans(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "day" && projectId) {
    const since = url.searchParams.get("since") ?? new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const data = await ctx.engineering.work.dayView(commerce, ctx.tenantId, projectId, since, ctx.userId);
    return NextResponse.json({ data });
  }
  if (action === "repositories") {
    const data = await ctx.engineering.work.listRepositories(commerce, ctx.tenantId, projectId || null);
    return NextResponse.json({ data });
  }
  if (action === "m365Catalog") {
    return NextResponse.json({ data: ctx.engineering.m365Connector.catalog() });
  }
  if (action === "m365Connections") {
    const data = await ctx.engineering.m365Connector.listConnections(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  if (action === "m365Health") {
    const data = await ctx.engineering.m365Connector.health(commerce, ctx.tenantId, url.searchParams.get("repositoryId"));
    return NextResponse.json({ data });
  }
  if (action === "m365Sources") {
    if (!projectId) return NextResponse.json({ error: "project_required" }, { status: 400 });
    const data = await ctx.engineering.m365Connector.listSources(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "engineeringConnectorCatalog") {
    return NextResponse.json({ data: ctx.engineering.engineeringConnector.catalog() });
  }
  if (action === "connectorCoreCatalog") {
    const {
      CANONICAL_CONNECTOR_CERTIFICATION_MATRIX,
      CONNECTOR_RECONCILIATION,
      CONNECTION_OWNERSHIP,
      DEFAULT_CONNECTOR_WRITE_POLICY,
      OBJECT_STORAGE_BACKEND,
    } = await import("@rtb/engineering-os");
    return NextResponse.json({
      data: {
        matrix: CANONICAL_CONNECTOR_CERTIFICATION_MATRIX,
        reconciliation: CONNECTOR_RECONCILIATION,
        connectionOwnership: CONNECTION_OWNERSHIP,
        defaultWritePolicy: DEFAULT_CONNECTOR_WRITE_POLICY,
        objectStorageBackend: OBJECT_STORAGE_BACKEND,
        certificationIsNotHealth: true,
      },
    });
  }
  if (action === "engineeringConnectorConnections") {
    const data = await ctx.engineering.engineeringConnector.listConnections(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  if (action === "engineeringConnectorHealth") {
    const data = await ctx.engineering.engineeringConnector.health(commerce, ctx.tenantId);
    return NextResponse.json({ data });
  }
  if (action === "engineeringConnectorObjects") {
    if (!projectId) return NextResponse.json({ error: "project_required" }, { status: 400 });
    const data = await ctx.engineering.engineeringConnector.listObjects(commerce, ctx.tenantId, projectId);
    return NextResponse.json({ data });
  }
  if (action === "detail") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.work.get(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ data, explanation: ctx.engineering.work.explain(data) });
  }
  if (action === "plan") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.workGenerator.getPlan(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const artifacts = await ctx.engineering.artifactAutomation.list(commerce, ctx.tenantId, data.id);
    let handoffs: unknown[] = [];
    try {
      handoffs = await ctx.engineering.toolOrchestration.listHandoffs(commerce, ctx.tenantId, data.id);
    } catch {
      handoffs = [];
    }
    const selectedProjectId = url.searchParams.get("selectedProjectId");
    const launcher = ctx.engineering.toolOrchestration.launcher(data, artifacts, selectedProjectId);
    let preIssue: unknown = null;
    try {
      preIssue = await ctx.engineering.preIssueReview.latest(commerce, ctx.tenantId, data.id, selectedProjectId);
    } catch {
      preIssue = null;
    }
    let mto: unknown = null;
    try {
      const snapshots = await ctx.engineering.quantityMto.listSnapshots(commerce, ctx.tenantId, {
        projectId: data.projectId,
        workPlanId: data.id,
        selectedProjectId,
      });
      mto = snapshots.find((row) => row.status !== "SUPERSEDED") ?? snapshots[0] ?? null;
    } catch {
      mto = null;
    }
    let impact: unknown = null;
    try {
      const sourceType = data.relatedChangeId ? "change" : data.relatedObjectType ?? "engineering_work_plan";
      const sourceId = data.relatedChangeId ?? data.relatedObjectId ?? data.id;
      impact = await ctx.engineering.changeWorkbench.latest(commerce, ctx.tenantId, sourceType, sourceId);
    } catch {
      impact = null;
    }
    let templatePreview: unknown = null;
    try {
      const expected = data.context.expectedOutputs[0]?.outputType;
      const artifactType =
        expected === "HANDOVER_PACKAGE" || expected === "CHANGE_ASSESSMENT" || expected === "CONCEPT_STUDY" || expected === "REVIEW_PACKAGE"
          ? "TECHNICAL_MEMORANDUM"
          : expected === "OPTION_STUDY"
            ? "OPTION_STUDY"
            : expected;
      templatePreview = await ctx.engineering.artifactAutomation.resolveTemplate(commerce, ctx.tenantId, {
        workPlanId: data.id,
        artifactType: artifactType as never,
      });
    } catch {
      templatePreview = null;
    }
    let externalContext: unknown = [];
    try {
      externalContext = await ctx.engineering.engineeringConnector.listObjects(commerce, ctx.tenantId, data.projectId);
    } catch {
      externalContext = [];
    }
    return NextResponse.json({
      data,
      continueWork: ctx.engineering.workGenerator.continueWorkSummary(data),
      artifacts,
      handoffs,
      launcher,
      tools: ctx.engineering.toolOrchestration.catalog(),
      preIssue,
      impact,
      mto,
      templatePreview,
      externalContext,
    });
  }
  if (action === "lifecycleHandoff") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.workGenerator.getPlan(commerce, ctx.tenantId, id);
    if (!data) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const next = resolveNextLifecycleWork(data.lifecycleStage);
    const inherited = inheritWorkPlanContext({
      from: ctx.engineering.workGenerator.snapshotFrom(data),
      fromStage: data.lifecycleStage,
      toStage: next.toStage,
      fromPlanId: data.id,
      systemId: data.systemId,
    });
    return NextResponse.json({ data: inherited.handoff, nextWork: next, advancesLifecycleGate: false });
  }
  if (action === "artifactCatalog") {
    return NextResponse.json({ data: ctx.engineering.artifactAutomation.catalog() });
  }
  if (action === "toolCatalog") {
    return NextResponse.json({ data: ctx.engineering.toolOrchestration.catalog() });
  }
  if (action === "preIssueCatalog") {
    return NextResponse.json({ data: ctx.engineering.preIssueReview.catalog() });
  }
  if (action === "changeWorkbenchCatalog") {
    return NextResponse.json({ data: ctx.engineering.changeWorkbench.catalog() });
  }
  if (action === "impactAssessment") {
    const sourceObjectType = url.searchParams.get("sourceObjectType") ?? "";
    const sourceObjectId = url.searchParams.get("sourceObjectId") ?? "";
    if (!sourceObjectType || !sourceObjectId) return NextResponse.json({ error: "source_required" }, { status: 400 });
    const data = await ctx.engineering.changeWorkbench.latest(commerce, ctx.tenantId, sourceObjectType, sourceObjectId);
    return NextResponse.json({ data });
  }
  if (action === "preIssueReview") {
    const workPlanId = url.searchParams.get("workPlanId") ?? url.searchParams.get("id") ?? "";
    if (!workPlanId) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.preIssueReview.latest(
      commerce,
      ctx.tenantId,
      workPlanId,
      url.searchParams.get("selectedProjectId"),
    );
    return NextResponse.json({ data });
  }
  if (action === "openGoverningSource") {
    const workPlanId = url.searchParams.get("workPlanId") ?? url.searchParams.get("id") ?? "";
    if (!workPlanId) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.toolOrchestration.openGoverningSource(commerce, ctx.tenantId, {
      workPlanId,
      sourceTitle: url.searchParams.get("sourceTitle"),
    });
    return NextResponse.json({ data });
  }
  if (action === "artifacts") {
    const planId = url.searchParams.get("planId") ?? "";
    if (!planId) return NextResponse.json({ error: "planId_required" }, { status: 400 });
    const data = await ctx.engineering.artifactAutomation.list(commerce, ctx.tenantId, planId);
    return NextResponse.json({ data });
  }
  if (action === "downloadArtifact") {
    const id = url.searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const opened = await ctx.engineering.artifactAutomation.openBinary(commerce, ctx.tenantId, id);
    if (!opened) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return new NextResponse(Buffer.from(opened.bytes), {
      headers: {
        "Content-Type": opened.row.mimeType,
        "Content-Disposition": `attachment; filename="${sanitizeArtifactFileName(opened.row.fileName).replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  if (action === "mtoCatalog") {
    return NextResponse.json({ data: ctx.engineering.quantityMto.catalog() });
  }
  if (action === "mtoSnapshots") {
    const projectId = url.searchParams.get("projectId") ?? "";
    const workPlanId = url.searchParams.get("workPlanId") ?? url.searchParams.get("planId");
    const data = await ctx.engineering.quantityMto.listSnapshots(commerce, ctx.tenantId, {
      projectId,
      workPlanId,
      selectedProjectId: url.searchParams.get("selectedProjectId"),
    });
    return NextResponse.json({ data });
  }
  if (action === "mtoSnapshot") {
    const snapshotId = url.searchParams.get("id") ?? url.searchParams.get("snapshotId") ?? "";
    if (!snapshotId) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.quantityMto.getSnapshot(commerce, ctx.tenantId, {
      snapshotId,
      selectedProjectId: url.searchParams.get("selectedProjectId"),
      query: {
        offset: Number(url.searchParams.get("offset") ?? 0),
        limit: Number(url.searchParams.get("limit") ?? 50),
        discipline: url.searchParams.get("discipline"),
        verification: url.searchParams.get("verification"),
      },
    });
    return NextResponse.json({ data });
  }
  if (action === "mtoCompare") {
    const fromSnapshotId = url.searchParams.get("from") ?? "";
    const toSnapshotId = url.searchParams.get("to") ?? "";
    if (!fromSnapshotId || !toSnapshotId) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const data = await ctx.engineering.quantityMto.compare(commerce, ctx.tenantId, {
      fromSnapshotId,
      toSnapshotId,
      selectedProjectId: url.searchParams.get("selectedProjectId"),
      discipline: url.searchParams.get("discipline"),
      category: url.searchParams.get("category"),
    });
    return NextResponse.json({ data });
  }
  if (action === "exportMto") {
    const snapshotId = url.searchParams.get("id") ?? url.searchParams.get("snapshotId") ?? "";
    if (!snapshotId) return NextResponse.json({ error: "id_required" }, { status: 400 });
    const exported = await ctx.engineering.quantityMto.exportWorkbook(commerce, ctx.tenantId, {
      snapshotId,
      selectedProjectId: url.searchParams.get("selectedProjectId"),
    });
    return new NextResponse(new Uint8Array(exported.buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${exported.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
        "X-MTO-Disclaimer": exported.disclaimer,
      },
    });
  }
  return NextResponse.json({ data: ctx.engineering.work.catalog() });
});

export const POST = withEngineeringApi("work", async ({ ctx, commerce, correlationId }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const rejected = ctx.engineering.work.rejectCallerClaims(body) ?? ctx.engineering.m365Connector.rejectCallerClaims(body) ?? ctx.engineering.engineeringConnector.rejectCallerClaims(body) ?? ctx.engineering.workGenerator.rejectCallerClaims(body) ?? ctx.engineering.artifactAutomation.rejectCallerClaims(body) ?? ctx.engineering.toolOrchestration.rejectCallerClaims(body) ?? ctx.engineering.preIssueReview.rejectCallerClaims(body) ?? ctx.engineering.changeWorkbench.rejectCallerClaims(body) ?? ctx.engineering.attention.rejectCallerClaims(body) ?? ctx.engineering.quantityMto.rejectCallerClaims(body);
  if (rejected) {
    return NextResponse.json({ error: rejected }, { status: 400 });
  }
  const action = String(body.action ?? "");
  try {
    if (action === "acknowledgeAttention") {
      const data = await ctx.engineering.attention.acknowledge(
        commerce,
        ctx.tenantId,
        String(body.fingerprint ?? ""),
        typeof body.snoozedUntil === "string" ? body.snoozedUntil : null,
      );
      return NextResponse.json({ data, engineeringStateMutated: false });
    }
    if (action === "saveAttentionPreferences") {
      const data = await ctx.engineering.attention.savePreferences(commerce, ctx.tenantId, {
        fyiDisplay: typeof body.fyiDisplay === "boolean" ? body.fyiDisplay : undefined,
        digestMode: body.digestMode === "DIGEST" || body.digestMode === "IMMEDIATE" ? body.digestMode : undefined,
        mutedFyi: typeof body.mutedFyi === "boolean" ? body.mutedFyi : undefined,
      });
      return NextResponse.json({ data });
    }
    if (action === "ingest") {
      const data = await ctx.engineering.work.ingest(commerce, ctx.tenantId, body.signal as never);
      return NextResponse.json({ data });
    }
    if (action === "confirm") {
      const data = await ctx.engineering.work.confirmCandidate(
        commerce,
        ctx.tenantId,
        String(body.id ?? ""),
        String(body.state ?? "") as never,
      );
      return NextResponse.json({ data });
    }
    if (action === "rebindProject") {
      const data = await ctx.engineering.work.rebindProject(commerce, ctx.tenantId, String(body.id ?? ""), String(body.projectId ?? ""));
      return NextResponse.json({ data });
    }
    if (action === "saveRepository") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "identity_assurance_required" }, { status: 403 });
      }
      const incoming = (body.repository ?? {}) as Record<string, unknown>;
      const data = await ctx.engineering.work.saveRepository(
        settingsCommerce,
        ctx.tenantId,
        {
          ...incoming,
          tenantId: ctx.tenantId,
          workspaceId: settingsCommerce.workspaceId,
        } as never,
        { actorProjectId: typeof incoming.actorProjectId === "string" ? incoming.actorProjectId : null },
      );
      return NextResponse.json({ data });
    }
    if (action === "saveTemplatePolicy" || action === "saveTemplateFallback") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "identity_assurance_required" }, { status: 403 });
      }
      if (action === "saveTemplateFallback") {
        const data = await ctx.engineering.artifactAutomation.saveFallbackPolicy(settingsCommerce, ctx.tenantId, {
          ...(body.policy as object),
          tenantId: ctx.tenantId,
          workspaceId: settingsCommerce.workspaceId,
        } as never);
        return NextResponse.json({ data });
      }
      const data = await ctx.engineering.artifactAutomation.saveTemplatePolicy(settingsCommerce, ctx.tenantId, {
        ...(body.policy as object),
        tenantId: ctx.tenantId,
        workspaceId: settingsCommerce.workspaceId,
      } as never);
      return NextResponse.json({ data });
    }
    const authorize = async (segment: string) => authorizeEngineeringSegment(ctx, segment, "GET", correlationId);
    if (action === "generatePlan") {
      const projectId = String(body.projectId ?? "");
      const workType = String(body.workType ?? "");
      const assembled = await assemblePlanContext(ctx, { authorize }, projectId, workType);
      const data = await ctx.engineering.workGenerator.generatePlan(commerce, ctx.tenantId, {
        projectId,
        workType: workType as never,
        lifecycleStage: typeof body.lifecycleStage === "string" ? (body.lifecycleStage as never) : undefined,
        discipline: typeof body.discipline === "string" ? body.discipline : null,
        systemId: typeof body.systemId === "string" ? body.systemId : null,
        assetId: typeof body.assetId === "string" ? body.assetId : null,
        relatedObjectType: typeof body.relatedObjectType === "string" ? body.relatedObjectType : null,
        relatedObjectId: typeof body.relatedObjectId === "string" ? body.relatedObjectId : null,
        snapshot: assembled.snapshot,
        readiness: assembled.readiness,
        acknowledged: Boolean(body.acknowledged),
      });
      return NextResponse.json({ data });
    }
    if (action === "startPlan") {
      const data = await ctx.engineering.workGenerator.startWork(
        commerce,
        ctx.tenantId,
        String(body.id ?? ""),
        Boolean(body.acknowledged),
      );
      return NextResponse.json({ data });
    }
    if (action === "refreshPlan") {
      const readCommerce = await authorizeEngineeringSegment(ctx, "work", "GET", correlationId);
      if (!readCommerce) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const existing = await ctx.engineering.workGenerator.getPlan(readCommerce, ctx.tenantId, String(body.id ?? ""));
      if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const assembled = await assemblePlanContext(ctx, { authorize }, existing.projectId, existing.workType);
      const data = await ctx.engineering.workGenerator.refreshPlan(
        commerce,
        ctx.tenantId,
        existing.id,
        assembled.snapshot,
        assembled.readiness,
      );
      return NextResponse.json({ data });
    }
    if (action === "completePlan") {
      const data = await ctx.engineering.workGenerator.completeWork(commerce, ctx.tenantId, String(body.id ?? ""));
      return NextResponse.json({ data });
    }
    if (action === "continueNextStage") {
      const readCommerce = await authorizeEngineeringSegment(ctx, "work", "GET", correlationId);
      if (!readCommerce) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const fromPlanId = String(body.fromPlanId ?? body.id ?? "");
      const existing = await ctx.engineering.workGenerator.getPlan(readCommerce, ctx.tenantId, fromPlanId);
      if (!existing) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const nextWork = resolveNextLifecycleWork(
        existing.lifecycleStage,
        typeof body.lifecycleStage === "string" ? (body.lifecycleStage as never) : undefined,
        typeof body.workType === "string" ? (body.workType as never) : undefined,
      );
      const assembled = await assemblePlanContext(ctx, { authorize }, existing.projectId, nextWork.workType);
      const data = await ctx.engineering.workGenerator.continueIntoNextLifecycle(commerce, ctx.tenantId, {
        fromPlanId,
        toStage: nextWork.toStage,
        workType: nextWork.workType,
        snapshot: assembled.snapshot,
        readiness: assembled.readiness,
        acknowledged: Boolean(body.acknowledged),
      });
      return NextResponse.json({ data });
    }
    if (action === "generateArtifact") {
      const rejectedArtifact = ctx.engineering.artifactAutomation.rejectCallerClaims(body);
      if (rejectedArtifact) return NextResponse.json({ error: rejectedArtifact }, { status: 400 });
      const data = await ctx.engineering.artifactAutomation.generate(commerce, ctx.tenantId, {
        workPlanId: String(body.workPlanId ?? body.id ?? ""),
        artifactType: typeof body.artifactType === "string" ? (body.artifactType as never) : undefined,
        templateCode: typeof body.templateCode === "string" ? body.templateCode : undefined,
        templateVersion: typeof body.templateVersion === "string" ? body.templateVersion : undefined,
        projectCode: typeof body.projectCode === "string" ? body.projectCode : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "compareArtifact") {
      const artifact = await ctx.engineering.artifactAutomation.get(commerce, ctx.tenantId, String(body.artifactId ?? ""));
      const plan = await ctx.engineering.workGenerator.getPlan(commerce, ctx.tenantId, String(body.workPlanId ?? body.id ?? artifact?.workPlanId ?? ""));
      if (!artifact || !plan) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json({ data: ctx.engineering.artifactAutomation.compareContext(artifact.provenance.inputFingerprint, plan.inputFingerprint) });
    }
    if (action === "prepareHandoff") {
      const data = await ctx.engineering.toolOrchestration.prepareHandoff(commerce, ctx.tenantId, {
        workPlanId: String(body.workPlanId ?? body.id ?? ""),
        artifactId: typeof body.artifactId === "string" ? body.artifactId : null,
        mode: typeof body.mode === "string" ? (body.mode as never) : undefined,
        toolCode: typeof body.toolCode === "string" ? body.toolCode : undefined,
        capability: typeof body.capability === "string" ? (body.capability as never) : undefined,
        selectedProjectId: typeof body.selectedProjectId === "string" ? body.selectedProjectId : null,
        sourceTitle: typeof body.sourceTitle === "string" ? body.sourceTitle : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "redeemHandoff") {
      const data = await ctx.engineering.toolOrchestration.redeemHandoff(
        commerce,
        ctx.tenantId,
        String(body.handoffId ?? body.id ?? ""),
        String(body.token ?? ""),
      );
      return NextResponse.json({ data });
    }
    if (action === "publishUpdatedArtifact") {
      if ("controlledFixture" in body) {
        return NextResponse.json({ error: "caller_supplied_authority_rejected" }, { status: 400 });
      }
      const data = await ctx.engineering.toolOrchestration.publishUpdatedArtifact(commerce, ctx.tenantId, {
        originArtifactId: String(body.originArtifactId ?? body.artifactId ?? ""),
        fileName: String(body.fileName ?? ""),
        contentBase64: String(body.contentBase64 ?? ""),
        unmanagedPath: typeof body.unmanagedPath === "string" ? body.unmanagedPath : null,
        selectedProjectId: typeof body.selectedProjectId === "string" ? body.selectedProjectId : null,
        explicitProjectId: typeof body.explicitProjectId === "string" ? body.explicitProjectId : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "prepareAnalysisRequest") {
      const data = await ctx.engineering.toolOrchestration.prepareAnalysisRequest(
        commerce,
        ctx.tenantId,
        String(body.workPlanId ?? body.id ?? ""),
      );
      return NextResponse.json({ data });
    }
    if (action === "openGoverningSource") {
      const data = await ctx.engineering.toolOrchestration.openGoverningSource(commerce, ctx.tenantId, {
        workPlanId: String(body.workPlanId ?? body.id ?? ""),
        sourceTitle: typeof body.sourceTitle === "string" ? body.sourceTitle : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "runPreIssueReview") {
      const data = await ctx.engineering.preIssueReview.run(commerce, ctx.tenantId, {
        workPlanId: String(body.workPlanId ?? body.id ?? ""),
        artifactId: typeof body.artifactId === "string" ? body.artifactId : null,
        selectedProjectId: typeof body.selectedProjectId === "string" ? body.selectedProjectId : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "assessChange" || action === "prepareOptionStudy" || action === "assessFieldChange" || action === "prepareRfiResponse") {
      let projectId = typeof body.projectId === "string" ? body.projectId : "";
      let sourceObjectType = typeof body.sourceObjectType === "string" ? body.sourceObjectType : "";
      let sourceObjectId = typeof body.sourceObjectId === "string" ? body.sourceObjectId : "";
      const workPlanId = typeof body.workPlanId === "string" ? body.workPlanId : typeof body.id === "string" ? body.id : "";
      const selectedProjectId = typeof body.selectedProjectId === "string" ? body.selectedProjectId : null;
      if (workPlanId) {
        const readCommerce = await authorizeEngineeringSegment(ctx, "work", "GET", correlationId);
        if (!readCommerce) {
          return NextResponse.json({ error: "authorization_denied" }, { status: 403 });
        }
        const plan = await ctx.engineering.workGenerator.getPlan(readCommerce, ctx.tenantId, workPlanId);
        if (!plan) return NextResponse.json({ error: "not_found" }, { status: 404 });
        assertCanonicalWorkPlanOwnership(plan.projectId, selectedProjectId);
        projectId = plan.projectId;
        sourceObjectType = sourceObjectType || (plan.relatedChangeId ? "change" : plan.relatedObjectType ?? "engineering_work_plan");
        sourceObjectId = sourceObjectId || (plan.relatedChangeId ?? plan.relatedObjectId ?? plan.id);
      }
      const workflow =
        action === "prepareOptionStudy"
          ? "OPTION_STUDY"
          : action === "assessFieldChange"
            ? "FIELD_CHANGE"
            : action === "prepareRfiResponse"
              ? "CONSTRUCTION_RFI"
              : typeof body.workflow === "string"
                ? body.workflow
                : "CHANGE_IMPACT";
      const data = await ctx.engineering.changeWorkbench.assess(commerce, ctx.tenantId, {
        sourceObjectType,
        sourceObjectId,
        sourceChangeId: typeof body.sourceChangeId === "string" ? body.sourceChangeId : null,
        projectId,
        selectedProjectId: typeof body.selectedProjectId === "string" ? body.selectedProjectId : null,
        workflow: workflow as never,
        constructionQuery:
          action === "prepareRfiResponse" || action === "assessFieldChange"
            ? {
                id: sourceObjectId,
                type: action === "assessFieldChange" ? "FIELD_CHANGE" : "RFI",
                summary: typeof body.summary === "string" ? body.summary : "Construction engineering query",
              }
            : undefined,
        optionStudy:
          action === "prepareOptionStudy" && Array.isArray(body.options)
            ? { title: typeof body.title === "string" ? body.title : "Option study", options: body.options as never }
            : undefined,
      });
      return NextResponse.json({ data });
    }
    if (action === "disposeImpact") {
      const data = await ctx.engineering.changeWorkbench.dispose(commerce, ctx.tenantId, {
        assessmentId: String(body.assessmentId ?? body.id ?? ""),
        candidateIds: Array.isArray(body.candidateIds) ? body.candidateIds.map(String) : [String(body.candidateId ?? "")],
        disposition: String(body.disposition ?? "NEEDS_INVESTIGATION") as never,
        rationale: typeof body.rationale === "string" ? body.rationale : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "recordImpactDecision") {
      const data = await ctx.engineering.changeWorkbench.recordHumanDecision(
        commerce,
        ctx.tenantId,
        String(body.assessmentId ?? body.id ?? ""),
        String(body.optionId ?? ""),
        typeof body.decisionId === "string" ? body.decisionId : null,
      );
      return NextResponse.json({ data });
    }
    if (action === "disposePreIssueCondition") {
      const data = await ctx.engineering.preIssueReview.dispose(commerce, ctx.tenantId, {
        workPlanId: String(body.workPlanId ?? body.id ?? ""),
        findingId: String(body.findingId ?? ""),
        action: String(body.disposition ?? body.dispositionAction ?? "accept") as never,
        reason: typeof body.reason === "string" ? body.reason : undefined,
        assignedTo: typeof body.assignedTo === "string" ? body.assignedTo : undefined,
      });
      return NextResponse.json({ data });
    }
    if (action === "saveM365Connection" || action === "registerSharePointRepository" || action === "testM365Connection" || action === "syncSharePointRepository" || action === "disableSharePointRepository" || action === "registerTemplateSource" || action === "saveEngineeringConnection" || action === "bindEngineeringProject" || action === "setEngineeringConnectorWritePolicy" || action === "syncEngineeringConnector" || action === "disableEngineeringConnector") {
      const settingsCommerce = await authorizeEngineeringSegment(ctx, "settings", "POST", correlationId);
      if (!settingsCommerce) {
        return NextResponse.json({ error: "identity_assurance_required" }, { status: 403 });
      }
      if (action === "saveM365Connection") {
        const data = await ctx.engineering.m365Connector.saveConnection(settingsCommerce, ctx.tenantId, body.connection as never);
        return NextResponse.json({ data });
      }
      if (action === "registerSharePointRepository") {
        const data = await ctx.engineering.m365Connector.registerSharePointRepository(settingsCommerce, ctx.tenantId, body as never);
        return NextResponse.json({ data });
      }
      if (action === "testM365Connection") {
        const data = await ctx.engineering.m365Connector.testConnection(settingsCommerce, ctx.tenantId, String(body.connectionId ?? ""));
        return NextResponse.json({ data });
      }
      if (action === "syncSharePointRepository") {
        const data = await ctx.engineering.m365Connector.enqueueSync(
          settingsCommerce,
          ctx.tenantId,
          String(body.repositoryId ?? ""),
          body.mode === "initial" || body.mode === "resync" ? body.mode : "delta",
        );
        return NextResponse.json({ data });
      }
      if (action === "disableSharePointRepository") {
        const data = await ctx.engineering.m365Connector.disableRepository(settingsCommerce, ctx.tenantId, String(body.repositoryId ?? ""));
        return NextResponse.json({ data });
      }
      if (action === "saveEngineeringConnection") {
        const data = await ctx.engineering.engineeringConnector.saveConnection(settingsCommerce, ctx.tenantId, body.connection as never);
        return NextResponse.json({ data });
      }
      if (action === "bindEngineeringProject") {
        const data = await ctx.engineering.engineeringConnector.bindProject(settingsCommerce, ctx.tenantId, body as never);
        return NextResponse.json({ data });
      }
      if (action === "setEngineeringConnectorWritePolicy") {
        const data = await ctx.engineering.engineeringConnector.setWritePolicy(
          settingsCommerce,
          ctx.tenantId,
          String(body.connectionId ?? ""),
          String(body.writePolicy ?? "READ_ONLY") as never,
        );
        return NextResponse.json({ data });
      }
      if (action === "syncEngineeringConnector") {
        const data = await ctx.engineering.engineeringConnector.enqueueSync(settingsCommerce, ctx.tenantId, String(body.connectionId ?? ""));
        return NextResponse.json({ data });
      }
      if (action === "disableEngineeringConnector") {
        const data = await ctx.engineering.engineeringConnector.disableConnection(settingsCommerce, ctx.tenantId, String(body.connectionId ?? ""));
        return NextResponse.json({ data });
      }
      const data = await ctx.engineering.m365Connector.registerTemplateSource(settingsCommerce, ctx.tenantId, { sourceId: String(body.sourceId ?? "") });
      return NextResponse.json({ data });
    }
    if (action === "publishEngineeringResponse") {
      const data = await ctx.engineering.engineeringConnector.publishEngineeringResponse(commerce, ctx.tenantId, {
        objectRefId: String(body.objectRefId ?? ""),
        preparedEtag: typeof body.preparedEtag === "string" ? body.preparedEtag : null,
        humanConfirmed: body.humanConfirmed === true,
        writeAction: String(body.writeAction ?? "SUBMIT_DRAFT_RESPONSE") as never,
        aiIssued: body.aiIssued === true,
      });
      return NextResponse.json({ data, issued: false });
    }
    if (action === "openExternalEngineeringSource") {
      const data = await ctx.engineering.engineeringConnector.openExternalSource(
        commerce,
        ctx.tenantId,
        String(body.objectRefId ?? body.sourceId ?? ""),
        body.url ?? body.href,
      );
      return NextResponse.json({ data });
    }
    if (action === "publishToManagedRepository") {
      const opened = await ctx.engineering.artifactAutomation.openBinary(commerce, ctx.tenantId, String(body.artifactId ?? ""));
      if (!opened) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const data = await ctx.engineering.m365Connector.publishArtifact(commerce, ctx.tenantId, {
        repositoryId: String(body.repositoryId ?? ""),
        fileName: opened.row.fileName,
        content: Buffer.from(opened.bytes),
        contentType: opened.row.mimeType,
        artifactId: opened.row.id,
      });
      return NextResponse.json({ data, engineeringApproved: false });
    }
    if (action === "openManagedSource" || action === "openManagedSharePointSource") {
      if (typeof body.objectRefId === "string" && body.objectRefId) {
        const data = await ctx.engineering.engineeringConnector.openExternalSource(
          commerce,
          ctx.tenantId,
          body.objectRefId,
          body.url ?? body.href,
        );
        return NextResponse.json({ data });
      }
      const data = await ctx.engineering.m365Connector.openManagedSource(commerce, ctx.tenantId, {
        sourceId: typeof body.sourceId === "string" ? body.sourceId : null,
        informationRefId: typeof body.informationRefId === "string" ? body.informationRefId : null,
        projectId: typeof body.projectId === "string" ? body.projectId : null,
      });
      return NextResponse.json({ data });
    }
    if (action === "createMto" || action === "seedMtoDemonstrator" || action === "verifyMtoItem" || action === "verifyMtoSnapshot" || action === "createMtoRevision" || action === "refreshMtoFreshness" || action === "mtoChangeImpacts") {
      const selectedProjectId = typeof body.selectedProjectId === "string" ? body.selectedProjectId : null;
      if (action === "createMto") {
        const data = await ctx.engineering.quantityMto.createSnapshot(commerce, ctx.tenantId, {
          workPlanId: String(body.workPlanId ?? ""),
          selectedProjectId,
          revision: typeof body.revision === "string" ? body.revision : undefined,
        });
        return NextResponse.json({ data });
      }
      if (action === "seedMtoDemonstrator") {
        const data = await ctx.engineering.quantityMto.seedDemonstrator(commerce, ctx.tenantId, {
          workPlanId: String(body.workPlanId ?? ""),
          selectedProjectId,
        });
        return NextResponse.json({ data });
      }
      if (action === "verifyMtoItem") {
        const data = await ctx.engineering.quantityMto.verifyItem(commerce, ctx.tenantId, {
          snapshotId: String(body.snapshotId ?? ""),
          itemId: String(body.itemId ?? ""),
          status: String(body.status ?? "VERIFIED") as "UNVERIFIED" | "VERIFIED" | "REJECTED" | "NEEDS_INFORMATION",
          selectedProjectId,
          confirmBulk: body.confirmBulk === true,
          itemIds: Array.isArray(body.itemIds) ? body.itemIds.map(String) : undefined,
        });
        return NextResponse.json({ data });
      }
      if (action === "verifyMtoSnapshot") {
        const data = await ctx.engineering.quantityMto.verifySnapshot(commerce, ctx.tenantId, {
          snapshotId: String(body.snapshotId ?? ""),
          selectedProjectId,
        });
        return NextResponse.json({ data });
      }
      if (action === "createMtoRevision") {
        const data = await ctx.engineering.quantityMto.createRevision(commerce, ctx.tenantId, {
          snapshotId: String(body.snapshotId ?? ""),
          revision: typeof body.revision === "string" ? body.revision : undefined,
          selectedProjectId,
        });
        return NextResponse.json({ data });
      }
      if (action === "refreshMtoFreshness") {
        const data = await ctx.engineering.quantityMto.refreshFreshness(commerce, ctx.tenantId, {
          snapshotId: String(body.snapshotId ?? ""),
          selectedProjectId,
        });
        return NextResponse.json({ data });
      }
      const data = await ctx.engineering.quantityMto.changeImpacts(commerce, ctx.tenantId, {
        fromSnapshotId: String(body.fromSnapshotId ?? ""),
        toSnapshotId: String(body.toSnapshotId ?? ""),
        selectedProjectId,
      });
      return NextResponse.json({ data });
    }
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "work_error";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
});
