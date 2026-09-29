import type { SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { mapProfileRow } from "../external-tools/profile-service";
import { resolveAnalysisCapability } from "./capability-resolver";
import {
  composeChangeImpact,
  composeDecisionSupport,
  composeOptimizationRequest,
  composeReviewCitation,
  assertHumanAcceptance,
} from "./composition";
import { toGovernedAnalysisLink, type AnalysisDependency } from "./dependencies";
import { fingerprintAnalysisManifest } from "./fingerprint";
import { isSyntheticCertificationAdapter } from "./execution-port";
import { buildAnalysisInputManifest } from "./manifest";
import { preconditionsSatisfied, resolveAnalysisPreconditions } from "./preconditions";
import { ANALYSIS_JOB_TYPE, SYNTHETIC_CERTIFICATION_ADAPTER_ID, SYNTHETIC_CERTIFICATION_ADAPTER_VERSION } from "./types";
import type {
  AnalysisExplainability,
  AnalysisRequestState,
  EngineeringAnalysisRequest,
} from "./types";

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

export function mapAnalysisRequestRow(row: Record<string, unknown>): EngineeringAnalysisRequest {
  return {
    id: String(row.id),
    tenantId: String(row.tenant_id),
    workspaceId: String(row.workspace_id),
    projectId: String(row.project_id),
    discipline: row.discipline as EngineeringAnalysisRequest["discipline"],
    capability: String(row.capability),
    systemId: (row.system_id as string | null) ?? null,
    assetId: (row.asset_id as string | null) ?? null,
    interfaceId: (row.interface_id as string | null) ?? null,
    configurationBaselineId: (row.configuration_baseline_id as string | null) ?? null,
    requirementIds: asStringArray(row.requirement_ids),
    assumptionIds: asStringArray(row.assumption_ids),
    applicableStandardCodes: asStringArray(row.applicable_standard_codes),
    supportingDocumentIds: asStringArray(row.supporting_document_ids),
    requestedExternalToolProfileId: (row.requested_external_tool_profile_id as string | null) ?? null,
    requestedOutputs: asStringArray(row.requested_outputs),
    executionPriority: typeof row.execution_priority === "number" ? row.execution_priority : null,
    requestedBy: String(row.requested_by),
    requestedAt: String(row.requested_at ?? row.created_at),
    actorKind: row.actor_kind === "AI_AGENT" || row.actor_kind === "SYSTEM" ? row.actor_kind : "HUMAN",
    status: row.status as AnalysisRequestState,
    syntheticCertification: row.synthetic_certification === true,
    originalAnalysisRequestId: (row.original_analysis_request_id as string | null) ?? null,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
  };
}

export class AnalysisRequestService {
  private framework: EngineeringObjectFramework;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
  }

  private get db(): { from(name: string): any } {
    return this.supabase as unknown as { from(name: string): any };
  }

  async create(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      projectId: string;
      discipline: string;
      capability: string;
      systemId?: string | null;
      assetId?: string | null;
      interfaceId?: string | null;
      configurationBaselineId?: string | null;
      requirementIds?: string[];
      assumptionIds?: string[];
      applicableStandardCodes?: string[];
      supportingDocumentIds?: string[];
      requestedExternalToolProfileId?: string | null;
      requestedOutputs?: string[];
      requestedBy: string;
      actorKind?: "HUMAN" | "AI_AGENT" | "SYSTEM";
      syntheticCertification?: boolean;
      originalAnalysisRequestId?: string | null;
      dependencies?: AnalysisDependency[];
    },
  ) {
    assertEngineeringService(commerce, "analysis.create", tenantId);
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace_required");
    const inserted = await this.db.from("engineering_analysis_requests")
      .insert({
        tenant_id: tenantId,
        workspace_id: workspaceId,
        project_id: input.projectId,
        discipline: input.discipline,
        capability: input.capability,
        system_id: input.systemId ?? null,
        asset_id: input.assetId ?? null,
        interface_id: input.interfaceId ?? null,
        configuration_baseline_id: input.configurationBaselineId ?? null,
        requirement_ids: input.requirementIds ?? [],
        assumption_ids: input.assumptionIds ?? [],
        applicable_standard_codes: input.applicableStandardCodes ?? [],
        supporting_document_ids: input.supportingDocumentIds ?? [],
        requested_external_tool_profile_id: input.requestedExternalToolProfileId ?? null,
        requested_outputs: input.requestedOutputs ?? [],
        requested_by: input.requestedBy,
        actor_kind: input.actorKind ?? "HUMAN",
        status: "draft",
        synthetic_certification: input.syntheticCertification === true,
        original_analysis_request_id: input.originalAnalysisRequestId ?? null,
      })
      .select()
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    const request = mapAnalysisRequestRow(inserted.data as Record<string, unknown>);
    for (const dep of input.dependencies ?? []) {
      const link = toGovernedAnalysisLink({ ...dep, fromRequestId: request.id });
      await this.db.from("engineering_object_links").insert({
        tenant_id: tenantId,
        workspace_id: workspaceId,
        from_type: link.fromType,
        from_id: link.fromId,
        to_type: link.toType,
        to_id: link.toId,
        relationship: link.relationship,
        relationship_governed: true,
        created_by: input.requestedBy,
      });
    }
    await this.framework.recordActivity({
      tenantId,
      workspaceId,
      objectType: "analysis_request",
      objectId: request.id,
      projectId: request.projectId,
      activityType: "analysis.request.created",
      title: `Analysis request ${request.discipline}/${request.capability}`,
      actorId: input.requestedBy,
    });
    return request;
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "analysis.get", tenantId);
    return this.getInternal(tenantId, id);
  }

  private async getInternal(tenantId: string, id: string) {
    const { data, error } = await this.db
      .from("engineering_analysis_requests")
      .select("*")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data ? mapAnalysisRequestRow(data as Record<string, unknown>) : null;
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, projectId?: string) {
    assertEngineeringService(commerce, "analysis.list", tenantId);
    let q = this.db.from("engineering_analysis_requests").select("*").eq("tenant_id", tenantId);
    if (projectId) q = q.eq("project_id", projectId);
    const { data, error } = await q.order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((row: Record<string, unknown>) => mapAnalysisRequestRow(row));
  }

  async preflight(commerce: CommerceExecutionContext, tenantId: string, id: string): Promise<AnalysisExplainability & { request: EngineeringAnalysisRequest }> {
    assertEngineeringService(commerce, "analysis.get", tenantId);
    return this.preflightInternal(tenantId, id);
  }

  private async preflightInternal(tenantId: string, id: string): Promise<AnalysisExplainability & { request: EngineeringAnalysisRequest }> {
    const request = await this.getInternal(tenantId, id);
    if (!request) throw new Error("analysis_request_not_found");
    const ctx = await this.loadResolutionContext(tenantId, request);
    const readiness = resolveAnalysisCapability(ctx.resolveInput);
    const preconditions = resolveAnalysisPreconditions(ctx.preconditionInput);
    const blockingReasons = readiness.reasons;
    const nextStatus: AnalysisRequestState = readiness.executable && preconditionsSatisfied(preconditions) ? "ready" : "blocked";
    await this.db.from("engineering_analysis_requests").update({ status: nextStatus }).eq("id", id);
    return {
      request: { ...request, status: nextStatus },
      discipline: request.discipline,
      capability: request.capability,
      context: {
        systemId: request.systemId,
        assetId: request.assetId,
        interfaceId: request.interfaceId,
        projectId: request.projectId,
      },
      toolSelected: {
        profileId: readiness.selectedToolProfileId,
        toolCode: ctx.toolCode,
        why: readiness.explanation,
      },
      baseline: request.configurationBaselineId,
      standards: request.applicableStandardCodes,
      requirements: request.requirementIds,
      assumptions: request.assumptionIds,
      dependencies: ctx.dependencies.map((d) => ({ semantic: d.semantic, targetId: d.toRequestId })),
      preconditions,
      readiness,
      blockingReasons,
      requestedOutputs: request.requestedOutputs,
    };
  }

  async createPlan(commerce: CommerceExecutionContext, tenantId: string, id: string, createdBy: string) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    const explained = await this.preflightInternal(tenantId, id);
    const request = explained.request;
    if (!explained.readiness.executable && !request.syntheticCertification) {
      return { blocked: true as const, plan: null, reasons: explained.blockingReasons, explanation: explained };
    }
    const ctx = await this.loadResolutionContext(tenantId, request);
    const adapterId = request.syntheticCertification
      ? SYNTHETIC_CERTIFICATION_ADAPTER_ID
      : ctx.adapterId;
    const manifest = buildAnalysisInputManifest({
      request: {
        ...request,
        requestedExternalToolProfileId: explained.readiness.selectedToolProfileId,
      },
      baselineFrozen: ctx.preconditionInput.baselineFrozen === true,
      interfaceIds: request.interfaceId ? [request.interfaceId] : [],
      toolCode: ctx.toolCode,
      toolVersion: ctx.toolVersion,
      toolCapability: request.capability,
      adapterId,
      adapterVersion: request.syntheticCertification ? SYNTHETIC_CERTIFICATION_ADAPTER_VERSION : ctx.adapterVersion,
      executionHostId: ctx.executionHostId,
      unitContext: "SI",
      inputArtifactRefs: [],
      inputHashes: [],
      upstream: ctx.dependencies.map((d) => ({
        requestId: d.toRequestId,
        resultId: d.toResultId ?? null,
        semantic: d.semantic,
      })),
    });
    const fingerprint = fingerprintAnalysisManifest(manifest);
    const inserted = await this.db.from("engineering_analysis_execution_plans")
      .insert({
        tenant_id: tenantId,
        workspace_id: request.workspaceId,
        project_id: request.projectId,
        analysis_request_id: request.id,
        discipline: request.discipline,
        capability: request.capability,
        configuration_baseline_id: request.configurationBaselineId,
        requirement_ids: request.requirementIds,
        assumption_ids: request.assumptionIds,
        standard_codes: request.applicableStandardCodes,
        interface_ids: request.interfaceId ? [request.interfaceId] : [],
        upstream_analysis_ids: ctx.dependencies.map((d) => d.toRequestId),
        external_tool_profile_id: explained.readiness.selectedToolProfileId,
        adapter_id: adapterId,
        adapter_version: request.syntheticCertification ? SYNTHETIC_CERTIFICATION_ADAPTER_VERSION : ctx.adapterVersion,
        execution_host_id: ctx.executionHostId,
        tool_version: ctx.toolVersion,
        requested_result_channels: request.requestedOutputs,
        unit_context: "SI",
        execution_policy: { substitution: explained.readiness.selectionPolicy },
        manifest: manifest as unknown as Record<string, unknown>,
        analysis_input_fingerprint: fingerprint,
        frozen: true,
        frozen_at: new Date().toISOString(),
        status: "frozen",
        created_by: createdBy,
      })
      .select()
      .single();
    if (inserted.error) throw new Error(inserted.error.message);
    return { blocked: false as const, plan: inserted.data, reasons: [] as const, explanation: explained, fingerprint };
  }

  async queue(commerce: CommerceExecutionContext, tenantId: string, id: string, createdBy: string, processImmediately?: boolean) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    const planned = await this.createPlan(commerce, tenantId, id, createdBy);
    if (planned.blocked || !planned.plan) {
      return { queued: false, jobId: null, result: null, reasons: planned.reasons, fabricated: false };
    }
    const request = planned.explanation.request;
    const adapterId = String(planned.plan.adapter_id ?? "");
    if (!request.syntheticCertification && !isSyntheticCertificationAdapter(adapterId)) {
      if (!planned.explanation.readiness.executable) {
        return { queued: false, jobId: null, result: null, reasons: planned.explanation.blockingReasons, fabricated: false };
      }
    }
    let jobId: string | null = null;
    if (this.kernel?.jobs) {
      const job = await this.kernel.jobs.create({
        tenantId,
        workspaceId: request.workspaceId,
        jobType: ANALYSIS_JOB_TYPE,
        payload: {
          analysisRequestId: request.id,
          executionPlanId: planned.plan.id,
          analysisInputFingerprint: planned.fingerprint,
        },
        createdBy,
        maxRetries: request.syntheticCertification ? 1 : 0,
      });
      jobId = job.id;
      await this.db.from("engineering_analysis_requests").update({ status: "queued" }).eq("id", request.id);
      const shouldProcess =
        processImmediately === true || (processImmediately !== false && isSyntheticCertificationAdapter(adapterId));
      if (shouldProcess) {
        await this.kernel.jobs.process(jobId);
      }
    }
    const { data: result } = await this.db.from("engineering_analysis_results")
      .select("*")
      .eq("analysis_request_id", request.id)
      .maybeSingle();
    return { queued: Boolean(jobId), jobId, result: result ?? null, reasons: [], fabricated: false };
  }

  async cancel(commerce: CommerceExecutionContext, tenantId: string, id: string) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    const { data } = await this.db.from("engineering_analysis_requests").select("status").eq("id", id).maybeSingle();
    if (!data) throw new Error("analysis_request_not_found");
    if (["succeeded", "failed"].includes(String(data.status))) throw new Error("cannot_cancel_terminal_analysis");
    await this.db.from("engineering_analysis_requests").update({ status: "cancelled" }).eq("id", id);
    return { cancelled: true };
  }

  async getResult(commerce: CommerceExecutionContext, tenantId: string, requestId: string) {
    assertEngineeringService(commerce, "analysis.get", tenantId);
    const { data, error } = await this.db.from("engineering_analysis_results")
      .select("*")
      .eq("analysis_request_id", requestId)
      .eq("tenant_id", tenantId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  }

  async markForReview(commerce: CommerceExecutionContext, tenantId: string, resultId: string, reviewPackageId: string, actorId: string) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    const { data, error } = await this.db.from("engineering_analysis_results")
      .update({ review_state: "in_review", acceptance_state: "UNDER_REVIEW" })
      .eq("id", resultId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const citation = composeReviewCitation({
      analysisRequestId: String(data.analysis_request_id),
      analysisResultId: resultId,
      reviewPackageId,
    });
    await this.db.from("engineering_object_links").insert({
      tenant_id: tenantId,
      workspace_id: data.workspace_id,
      from_type: citation.fromType,
      from_id: citation.fromId,
      to_type: citation.toType,
      to_id: citation.toId,
      relationship: citation.relationship,
      relationship_governed: true,
      created_by: actorId,
    });
    return data;
  }

  async accept(commerce: CommerceExecutionContext, tenantId: string, resultId: string, actor: { id: string; kind: string; rationale: string }) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    assertHumanAcceptance(actor.kind);
    const { data, error } = await this.db.from("engineering_analysis_results")
      .update({
        acceptance_state: "ACCEPTED",
        review_state: "accepted",
        accepted_by: actor.id,
        accepted_at: new Date().toISOString(),
        acceptance_rationale: actor.rationale,
      })
      .eq("id", resultId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async reject(commerce: CommerceExecutionContext, tenantId: string, resultId: string, actor: { id: string; kind: string; rationale: string }) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    assertHumanAcceptance(actor.kind);
    const { data, error } = await this.db.from("engineering_analysis_results")
      .update({
        acceptance_state: "REJECTED",
        review_state: "rejected",
        accepted_by: actor.id,
        accepted_at: new Date().toISOString(),
        acceptance_rationale: actor.rationale,
      })
      .eq("id", resultId)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async linkDecision(commerce: CommerceExecutionContext, tenantId: string, resultId: string, decisionId: string, actorId: string) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    const link = composeDecisionSupport({ decisionId, analysisResultId: resultId });
    const { data: result } = await this.db.from("engineering_analysis_results").select("workspace_id").eq("id", resultId).maybeSingle();
    await this.db.from("engineering_object_links").insert({
      tenant_id: tenantId,
      workspace_id: result?.workspace_id,
      from_type: link.fromType,
      from_id: link.fromId,
      to_type: link.toType,
      to_id: link.toId,
      relationship: link.relationship,
      relationship_governed: true,
      created_by: actorId,
    });
    return link;
  }

  async linkChange(commerce: CommerceExecutionContext, tenantId: string, resultId: string, changeId: string, actorId: string) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    const link = composeChangeImpact({ changeId, analysisResultId: resultId });
    const { data: result } = await this.db.from("engineering_analysis_results").select("workspace_id").eq("id", resultId).maybeSingle();
    await this.db.from("engineering_object_links").insert({
      tenant_id: tenantId,
      workspace_id: result?.workspace_id,
      from_type: link.fromType,
      from_id: link.fromId,
      to_type: link.toType,
      to_id: link.toId,
      relationship: link.relationship,
      relationship_governed: true,
      created_by: actorId,
    });
    return link;
  }

  async linkOptimizationRun(commerce: CommerceExecutionContext, tenantId: string, requestId: string, optimizationRunId: string, actorId: string) {
    assertEngineeringService(commerce, "analysis.update", tenantId);
    const link = composeOptimizationRequest({ optimizationRunId, analysisRequestId: requestId });
    const { data: request } = await this.db.from("engineering_analysis_requests").select("workspace_id").eq("id", requestId).maybeSingle();
    await this.db.from("engineering_object_links").insert({
      tenant_id: tenantId,
      workspace_id: request?.workspace_id,
      from_type: link.fromType,
      from_id: link.fromId,
      to_type: link.toType,
      to_id: link.toId,
      relationship: link.relationship,
      relationship_governed: true,
      created_by: actorId,
    });
    return link;
  }

  private async loadResolutionContext(tenantId: string, request: EngineeringAnalysisRequest) {
    const { data: overlay } = await this.db.from("engineering_discipline_profiles")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("discipline_code", request.discipline)
      .maybeSingle();
    const { data: projectDisc } = await this.db.from("engineering_project_disciplines")
      .select("*")
      .eq("project_id", request.projectId)
      .eq("discipline_code", request.discipline)
      .maybeSingle();
    const { data: bindings } = await this.db.from("engineering_discipline_tool_bindings")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("discipline_code", request.discipline)
      .eq("capability_key", request.capability);
    const { data: profiles } = await this.db.from("engineering_external_tool_profiles").select("*").eq("tenant_id", tenantId);
    const { data: assignments } = await this.db.from("engineering_external_tool_assignments")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("workspace_id", request.workspaceId);
    const { data: baseline } = request.configurationBaselineId
      ? await this.db.from("engineering_configuration_baselines").select("*").eq("id", request.configurationBaselineId).maybeSingle()
      : { data: null };
    const { data: links } = await this.db.from("engineering_object_links")
      .select("*")
      .eq("from_id", request.id)
      .eq("from_type", "analysis_request");

    const mappedProfiles = (profiles ?? []).map((row: Record<string, unknown>) => mapProfileRow(row));
    const mappedBindings = (bindings ?? []).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      tenantId: String(row.tenant_id),
      workspaceId: (row.workspace_id as string | null) ?? null,
      disciplineCode: row.discipline_code as EngineeringAnalysisRequest["discipline"],
      capabilityKey: String(row.capability_key),
      toolCode: String(row.tool_code),
      externalToolProfileId: (row.external_tool_profile_id as string | null) ?? null,
      certificationStatus: String(row.certification_status),
      priority: Number(row.priority ?? 1),
    }));
    const selectedProfile = mappedProfiles.find(
      (p: { id: string }) => p.id === request.requestedExternalToolProfileId || mappedBindings.some((b: { externalToolProfileId: string | null }) => b.externalToolProfileId === p.id),
    );
    const capabilities = Array.isArray(overlay?.capabilities) ? (overlay.capabilities as Array<{ key: string; declaredStatus: string; effectiveStatus: string }>) : [];
    const dependencies: AnalysisDependency[] = (links ?? []).map((link: Record<string, unknown>) => ({
      fromRequestId: request.id,
      toRequestId: String(link.to_id),
      semantic:
        link.relationship === "USED_BY"
          ? "USES_RESULT_FROM"
          : link.relationship === "SUPERSEDES"
            ? "SUPERSEDES"
            : link.relationship === "VERIFIED_BY"
              ? "VALIDATES"
              : "REQUIRES_RESULT_FROM",
      requiredAcceptance: "ACCEPTED" as const,
    }));
    return {
      toolCode: selectedProfile?.toolCode ?? null,
      toolVersion: selectedProfile?.installedVersion ?? null,
      adapterId: selectedProfile?.adapterId ?? null,
      adapterVersion: selectedProfile?.adapterVersion ?? null,
      executionHostId: selectedProfile?.executionHostId ?? null,
      dependencies,
      resolveInput: {
        discipline: request.discipline,
        capability: request.capability,
        workspaceId: request.workspaceId,
        projectId: request.projectId,
        tenantId,
        requestedExternalToolProfileId: request.requestedExternalToolProfileId,
        syntheticCertification: request.syntheticCertification,
        disciplineEnabled: overlay ? overlay.enabled !== false : true,
        projectDisciplineEnabled: projectDisc ? projectDisc.enabled !== false : true,
        capabilities,
        bindings: mappedBindings,
        profiles: mappedProfiles,
        workspaceAssignments: (assignments ?? []).map((a: Record<string, unknown>) => ({
          profileId: String(a.profile_id ?? a.external_tool_profile_id ?? ""),
          workspaceId: String(a.workspace_id),
          enabled: a.allowed !== false && a.enabled !== false,
        })),
        baselineId: request.configurationBaselineId,
        requirementIds: request.requirementIds,
        assumptionIds: request.assumptionIds,
        standardCodes: request.applicableStandardCodes,
        standardsRequired: true,
      },
      preconditionInput: {
        baselineFrozen: baseline ? String(baseline.status) === "frozen" || baseline.frozen === true : request.configurationBaselineId ? true : null,
        requirementIds: request.requirementIds,
        assumptionIds: request.assumptionIds,
        standardCodes: request.applicableStandardCodes,
        standardsRequired: true,
        interfaceInformationStatus: request.interfaceId ? ("SATISFIED" as const) : ("NOT_APPLICABLE" as const),
        upstreamDependencies: [],
        externalToolReady: selectedProfile?.readiness === "READY",
        workspaceAllowed: true,
        executionHostAvailable: Boolean(selectedProfile?.executionHostId),
        syntheticCertification: request.syntheticCertification,
      },
    };
  }
}

export function assertPlanImmutable(existing: { frozen: boolean; analysis_input_fingerprint: string }, nextFingerprint: string): void {
  if (existing.frozen && existing.analysis_input_fingerprint !== nextFingerprint) {
    throw new Error("execution_plan_immutable");
  }
}

export function productionAnalysisCapabilities(keys: string[]): string[] {
  return keys.filter((k) => k !== "CERTIFICATION_ANALYSIS");
}
