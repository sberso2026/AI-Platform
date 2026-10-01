import { NextResponse } from "next/server";
import { authorizeEngineeringSegment, withEngineeringApi } from "@/lib/commerce/engineering-api";
import { assembleSnapshotFromRecords, type EngineeringOS } from "@rtb/engineering-os";
import type { CommerceExecutionContext } from "@rtb/types";

function statusFor(message: string): number {
  if (
    message.includes("denied") ||
    message.includes("DENIED") ||
    message.includes("mismatch") ||
    message.includes("MISMATCH") ||
    message.includes("UNAUTHORIZED") ||
    message.includes("OUTSIDE_EOS") ||
    message.includes("broadening")
  ) return 403;
  if (message === "workspace_required" || message === "caller_supplied_authority_rejected" || message === "project_required") return 400;
  if (message === "work_plan_stale" || message === "unmanaged_file_outside_eos") return 409;
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

export const GET = withEngineeringApi("work", async ({ ctx, commerce }, request) => {
  const url = new URL(request.url);
  const action = url.searchParams.get("action") ?? "catalog";
  if (action === "catalog") {
    return NextResponse.json({ data: ctx.engineering.work.catalog() });
  }
  if (action === "generatorCatalog") {
    return NextResponse.json({ data: ctx.engineering.workGenerator.catalog() });
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
    return NextResponse.json({
      data,
      continueWork: ctx.engineering.workGenerator.continueWorkSummary(data),
      artifacts,
      handoffs,
      launcher,
      tools: ctx.engineering.toolOrchestration.catalog(),
    });
  }
  if (action === "artifactCatalog") {
    return NextResponse.json({ data: ctx.engineering.artifactAutomation.catalog() });
  }
  if (action === "toolCatalog") {
    return NextResponse.json({ data: ctx.engineering.toolOrchestration.catalog() });
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
    const row = await ctx.engineering.artifactAutomation.get(commerce, ctx.tenantId, id);
    if (!row) return NextResponse.json({ error: "not_found" }, { status: 404 });
    const buffer = Buffer.from(row.contentBase64, "base64");
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": row.mimeType,
        "Content-Disposition": `attachment; filename="${row.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  return NextResponse.json({ data: ctx.engineering.work.catalog() });
});

export const POST = withEngineeringApi("work", async ({ ctx, commerce, correlationId }, request) => {
  const body = (await request.json()) as Record<string, unknown>;
  const rejected = ctx.engineering.work.rejectCallerClaims(body) ?? ctx.engineering.workGenerator.rejectCallerClaims(body) ?? ctx.engineering.artifactAutomation.rejectCallerClaims(body) ?? ctx.engineering.toolOrchestration.rejectCallerClaims(body);
  if (rejected) {
    return NextResponse.json({ error: rejected }, { status: 400 });
  }
  const action = String(body.action ?? "");
  try {
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
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "work_error";
    return NextResponse.json({ error: message }, { status: statusFor(message) });
  }
});
