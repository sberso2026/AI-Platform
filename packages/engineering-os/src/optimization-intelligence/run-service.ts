import type { Json, SupabaseClient } from "@rtb/database";
import type { PlatformKernel } from "@rtb/platform-kernel";
import type { CommerceExecutionContext } from "@rtb/types";
import { assertEngineeringService } from "../commerce/service-guard";
import { workspaceScopeId } from "../commerce/workspace-scope";
import { EngineeringObjectFramework } from "../services/object-framework";
import { computeParetoSet, evaluateConstraints, isFeasible, type ObjectiveSpec, type ParetoCandidate } from "./analysis";
import { isCertificationStubAdapter } from "./certification-adapter";
import { assertResultSourceKind, OPTIMIZATION_JOB_TYPE } from "./invariants";
import {
  buildRunInputManifest,
  CERTIFICATION_STUB_ADAPTER_ID,
  CERTIFICATION_STUB_ADAPTER_VERSION,
  fingerprintRunInputManifest,
  type RunInputManifestV1,
} from "./manifest";
import { OptimizationStudyService } from "./study-service";
import { ExternalToolAssignmentService } from "../external-tools/assignment-service";
import { assertExternalToolReadyForOptimization, OPTIMIZATION_EXECUTION_CAPABILITY } from "../external-tools/optimization-gate";
import { ExternalToolProfileService } from "../external-tools/profile-service";

type StudyRow = Record<string, unknown> & {
  id: string;
  tenant_id: string;
  workspace_id: string;
  project_id: string | null;
};

export class OptimizationRunService {
  private framework: EngineeringObjectFramework;
  private studies: OptimizationStudyService;

  constructor(
    private readonly supabase: SupabaseClient,
    private readonly kernel?: PlatformKernel,
  ) {
    this.framework = new EngineeringObjectFramework(supabase, kernel);
    this.studies = new OptimizationStudyService(supabase, kernel);
  }

  async list(commerce: CommerceExecutionContext, tenantId: string, studyId: string) {
    assertEngineeringService(commerce, "optimization.list", tenantId);
    const study = await this.requireStudy(commerce, tenantId, studyId);
    const { data, error } = await this.supabase
      .from("engineering_optimization_runs")
      .select("*")
      .eq("study_id", study.id)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", study.workspace_id)
      .order("created_at", { ascending: false });
    if (error) throw new Error(`Failed to list runs: ${error.message}`);
    return data ?? [];
  }

  async get(commerce: CommerceExecutionContext, tenantId: string, runId: string) {
    assertEngineeringService(commerce, "optimization.get", tenantId);
    const run = await this.requireRun(commerce, tenantId, runId);
    const [inputs, metrics, evaluations, manifests] = await Promise.all([
      this.supabase.from("engineering_optimization_run_inputs").select("*").eq("run_id", run.id),
      this.supabase.from("engineering_optimization_result_metrics").select("*").eq("run_id", run.id),
      this.supabase.from("engineering_optimization_constraint_evaluations").select("*").eq("run_id", run.id),
      this.supabase.from("engineering_optimization_run_manifests").select("*").eq("run_id", run.id),
    ]);
    for (const result of [inputs, metrics, evaluations, manifests]) {
      if (result.error) throw new Error(result.error.message);
    }
    return {
      run,
      inputs: inputs.data ?? [],
      metrics: metrics.data ?? [],
      evaluations: evaluations.data ?? [],
      manifest: manifests.data?.[0] ?? null,
    };
  }

  async getManifest(commerce: CommerceExecutionContext, tenantId: string, runId: string) {
    assertEngineeringService(commerce, "optimization.get", tenantId);
    const detail = await this.get(commerce, tenantId, runId);
    return {
      runId: detail.run.id,
      baselineFingerprint: detail.run.baseline_fingerprint,
      runInputFingerprint: detail.run.run_input_fingerprint,
      manifest: detail.manifest,
    };
  }

  /**
   * Queue a reproducible evaluation. Pins configuration items, freezes the Run Input Manifest,
   * and records run_input_fingerprint separately from baseline_fingerprint.
   * Delegates execution to Kernel JobService (`background_jobs`). Does not create a second queue.
   */
  async create(
    commerce: CommerceExecutionContext,
    tenantId: string,
    input: {
      studyId: string;
      alternativeId: string;
      scenarioId?: string | null;
      analysisEngine?: string | null;
      adapterId?: string | null;
      adapterVersion?: string | null;
      algorithmId?: string | null;
      algorithmVersion?: string | null;
      randomSeed?: string | null;
      createdBy?: string;
      processImmediately?: boolean;
      externalToolProfileId?: string | null;
    },
  ) {
    assertEngineeringService(commerce, "optimization.create", tenantId);
    const study = await this.requireStudy(commerce, tenantId, input.studyId);
    if (!["ready", "running"].includes(String(study.status))) {
      throw new Error("Runs can only be created for READY or RUNNING studies.");
    }
    if (!study.configuration_baseline_id) throw new Error("READY study must have a frozen baseline.");
    const { data: alternative, error: altErr } = await this.supabase
      .from("engineering_optimization_alternatives")
      .select("*")
      .eq("id", input.alternativeId)
      .eq("study_id", study.id)
      .maybeSingle();
    if (altErr) throw new Error(altErr.message);
    if (!alternative || String(alternative.status) === "withdrawn") {
      throw new Error("Alternative is not available for evaluation.");
    }
    const captured = await this.studies.captureBaselineItemsForStudy(study);
    if (captured.baselineStatus !== "frozen") {
      throw new Error("Run requires a frozen Configuration Baseline.");
    }
    const adapterId = input.adapterId?.trim() || CERTIFICATION_STUB_ADAPTER_ID;
    const adapterVersion =
      input.adapterVersion ?? (isCertificationStubAdapter(adapterId) ? CERTIFICATION_STUB_ADAPTER_VERSION : null);
    let externalTool:
      | NonNullable<import("./manifest").RunInputManifestV1["execution"]["external_tool"]>
      | undefined;
    if (!isCertificationStubAdapter(adapterId)) {
      if (!input.externalToolProfileId) {
        throw new Error("external_tool_profile_required");
      }
      const profiles = new ExternalToolProfileService(this.supabase);
      const assignments = new ExternalToolAssignmentService(this.supabase);
      const profile = await profiles.get(commerce, tenantId, input.externalToolProfileId);
      const assignment = await assignments.getForWorkspace(tenantId, profile.id, String(study.workspace_id));
      assertExternalToolReadyForOptimization({
        profile,
        assignment,
        workspaceId: String(study.workspace_id),
        requiredCapability: OPTIMIZATION_EXECUTION_CAPABILITY,
      });
      externalTool = {
        external_tool_profile_id: profile.id,
        tool_id: profile.toolCode,
        tool_version: profile.installedVersion,
        adapter_id: profile.adapterId,
        adapter_version: profile.adapterVersion,
        execution_host_id: profile.executionHostId,
        capability: OPTIMIZATION_EXECUTION_CAPABILITY,
        validation_ref: profile.lastValidation.ranAt,
      };
    }
    const { data: run, error } = await this.supabase
      .from("engineering_optimization_runs")
      .insert({
        tenant_id: study.tenant_id,
        workspace_id: study.workspace_id,
        project_id: study.project_id,
        study_id: study.id,
        alternative_id: input.alternativeId,
        scenario_id: input.scenarioId ?? null,
        status: "queued",
        configuration_baseline_id: captured.baselineId,
        baseline_fingerprint: captured.fingerprint,
        analysis_engine: input.analysisEngine ?? "orchestration-contract",
        adapter_id: adapterId,
        adapter_version: adapterVersion,
        algorithm_id: input.algorithmId ?? null,
        algorithm_version: input.algorithmVersion ?? null,
        random_seed: input.randomSeed ?? null,
        created_by: input.createdBy ?? null,
      })
      .select()
      .single();
    if (error || !run) throw new Error(`Failed to create optimization run: ${error?.message}`);
    if (captured.items.length > 0) {
      const inputRows = captured.items.map((item) => ({
        tenant_id: study.tenant_id,
        workspace_id: study.workspace_id,
        project_id: study.project_id,
        study_id: study.id,
        run_id: run.id,
        configuration_item_id: item.configuration_item_id,
        object_type: item.object_type,
        object_id: item.object_id,
        revision_ref: item.revision_ref,
        object_code_snapshot: item.object_code_snapshot,
        object_title_snapshot: item.object_title_snapshot,
        effective_state: item.effective_state,
      }));
      const pinned = await this.supabase.from("engineering_optimization_run_inputs").insert(inputRows).select();
      if (pinned.error) throw new Error(`Failed to pin configuration items: ${pinned.error.message}`);
    }

    const manifest = await this.buildManifestForRun(
      study,
      run as Record<string, unknown>,
      captured.items,
      captured.fingerprint,
      alternative as Record<string, unknown>,
      externalTool,
    );
    const runInputFingerprint = fingerprintRunInputManifest(manifest);
    const frozen = await this.supabase
      .from("engineering_optimization_run_manifests")
      .insert({
        tenant_id: study.tenant_id,
        workspace_id: study.workspace_id,
        project_id: study.project_id,
        study_id: study.id,
        run_id: run.id,
        manifest_schema_version: 1,
        manifest,
        run_input_fingerprint: runInputFingerprint,
      })
      .select()
      .single();
    if (frozen.error) throw new Error(`Failed to freeze run input manifest: ${frozen.error.message}`);
    await this.supabase
      .from("engineering_optimization_runs")
      .update({ run_input_fingerprint: runInputFingerprint })
      .eq("id", String(run.id));
    await this.audit(tenantId, study, run.id as string, "optimization.manifest.frozen", "Optimization run input manifest frozen", input.createdBy);

    let executionRef: string | null = null;
    if (this.kernel?.jobs) {
      const job = await this.kernel.jobs.create({
        tenantId,
        workspaceId: study.workspace_id,
        jobType: OPTIMIZATION_JOB_TYPE,
        payload: {
          studyId: study.id,
          runId: run.id,
          alternativeId: input.alternativeId,
          baselineId: captured.baselineId,
          baselineFingerprint: captured.fingerprint,
          runInputFingerprint,
          externalToolProfileId: externalTool?.external_tool_profile_id ?? null,
        },
        createdBy: input.createdBy,
        maxRetries: 1,
      });
      executionRef = job.id;
      await this.supabase.from("engineering_optimization_runs").update({ execution_ref: executionRef }).eq("id", String(run.id));
      await this.audit(tenantId, study, run.id as string, "optimization.job.queued", "Optimization evaluation job queued on Kernel JobService", input.createdBy);
      const shouldProcess =
        input.processImmediately === true
          ? true
          : input.processImmediately === false
            ? false
            : isCertificationStubAdapter(adapterId);
      if (shouldProcess) {
        await this.kernel.jobs.process(executionRef);
        await this.audit(tenantId, study, run.id as string, "optimization.execution.delegated", "Optimization execution delegated through execution port", input.createdBy);
      }
    }
    if (String(study.status) === "ready") {
      await this.supabase.from("engineering_optimization_studies").update({ status: "running" }).eq("id", study.id);
    }
    await this.audit(tenantId, study, run.id as string, "optimization.run.queued", `Optimization run queued`, input.createdBy);
    const { data: refreshed } = await this.supabase.from("engineering_optimization_runs").select("*").eq("id", String(run.id)).maybeSingle();
    return {
      ...(refreshed ?? run),
      execution_ref: executionRef ?? (refreshed?.execution_ref as string | null) ?? run.execution_ref,
      baseline_fingerprint: captured.fingerprint,
      run_input_fingerprint: runInputFingerprint,
    };
  }

  async processQueuedJob(commerce: CommerceExecutionContext, tenantId: string, runId: string) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const run = await this.requireRun(commerce, tenantId, runId);
    const executionRef = run.execution_ref as string | null;
    if (!executionRef) throw new Error("Run has no JobService execution_ref.");
    if (!this.kernel?.jobs) throw new Error("Kernel JobService is not available.");
    return this.kernel.jobs.process(executionRef);
  }

  /**
   * Trusted result path. Public clients must not post solver PASS without this service boundary.
   * MANUAL source_kind is allowed for early-stage studies and is distinct from adapter/host results.
   */
  async ingestResults(
    commerce: CommerceExecutionContext,
    tenantId: string,
    runId: string,
    input: {
      sourceKind: string;
      metrics: Array<{ metricKey: string; value: number; unit?: string | null; objectiveId?: string | null }>;
      actorId?: string;
      markSucceeded?: boolean;
    },
  ) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    if (input.sourceKind !== "MANUAL") {
      throw new Error("Untrusted callers may only record MANUAL results. EXECUTION_HOST and ADAPTER require the JobService handler.");
    }
    assertResultSourceKind(input.sourceKind);
    const run = await this.requireRun(commerce, tenantId, runId);
    if (String(run.status) === "succeeded") {
      throw new Error("Succeeded run evidence is immutable; create a new run.");
    }
    if (["failed", "cancelled"].includes(String(run.status))) {
      throw new Error(`Cannot ingest results into a ${String(run.status)} run.`);
    }
    const { data: constraints, error: cErr } = await this.supabase
      .from("engineering_optimization_constraints")
      .select("*")
      .eq("study_id", String(run.study_id));
    if (cErr) throw new Error(cErr.message);
    const metricRows = input.metrics.map((metric) => ({
      tenant_id: run.tenant_id,
      workspace_id: run.workspace_id,
      project_id: run.project_id,
      study_id: run.study_id,
      run_id: run.id,
      metric_key: metric.metricKey,
      value: metric.value,
      unit: metric.unit ?? null,
      objective_id: metric.objectiveId ?? null,
      source_kind: input.sourceKind,
      provenance: { actor_id: input.actorId ?? null, source_kind: input.sourceKind } as Json,
      created_by: input.actorId ?? null,
    }));
    if (metricRows.length > 0) {
      const inserted = await this.supabase.from("engineering_optimization_result_metrics").upsert(metricRows, { onConflict: "run_id,metric_key" }).select();
      if (inserted.error) throw new Error(`Failed to ingest metrics: ${inserted.error.message}`);
    }
    const evaluations = evaluateConstraints(
      (constraints ?? []).map((row) => ({
        id: String(row.id),
        metric_key: String(row.metric_key),
        operator: (row.operator as string | null) ?? null,
        threshold_value: row.threshold_value == null ? null : Number(row.threshold_value),
        hardness: (String(row.hardness) === "SOFT" ? "SOFT" : "HARD") as "HARD" | "SOFT",
        constraint_code: String(row.constraint_code ?? ""),
        name: String(row.name ?? ""),
        unit: (row.unit as string | null) ?? null,
      })),
      input.metrics.map((metric) => ({ metric_key: metric.metricKey, value: metric.value, unit: metric.unit ?? null })),
    );
    if (evaluations.length > 0) {
      const evalRows = evaluations.map((evaluation) => ({
        tenant_id: run.tenant_id,
        workspace_id: run.workspace_id,
        project_id: run.project_id,
        study_id: run.study_id,
        run_id: run.id,
        constraint_id: evaluation.constraint_id,
        evaluated_value: evaluation.evaluated_value,
        passed: evaluation.passed,
        margin: evaluation.margin,
        evidence: evaluation.passed ? "pass" : "hard/soft constraint failed",
      }));
      const evalInsert = await this.supabase
        .from("engineering_optimization_constraint_evaluations")
        .upsert(evalRows, { onConflict: "run_id,constraint_id" })
        .select();
      if (evalInsert.error) throw new Error(`Failed to ingest constraint evaluations: ${evalInsert.error.message}`);
    }
    const feasible = isFeasible(evaluations);
    if (input.markSucceeded !== false) {
      const { error } = await this.supabase
        .from("engineering_optimization_runs")
        .update({
          status: "succeeded",
          completed_at: new Date().toISOString(),
          started_at: run.started_at ?? new Date().toISOString(),
        })
        .eq("id", run.id)
        .eq("tenant_id", tenantId);
      if (error) throw new Error(`Failed to complete run: ${error.message}`);
      await this.audit(tenantId, run as StudyRow, run.id as string, "optimization.run.succeeded", "Optimization run succeeded", input.actorId);
    }
    await this.audit(tenantId, run as StudyRow, run.id as string, "optimization.result.recorded", "Optimization result recorded", input.actorId);
    return { runId: run.id, feasible, evaluations, sourceKind: input.sourceKind };
  }

  async evaluateFeasibility(commerce: CommerceExecutionContext, tenantId: string, runId: string) {
    assertEngineeringService(commerce, "optimization.get", tenantId);
    const detail = await this.get(commerce, tenantId, runId);
    const { data: constraints, error } = await this.supabase
      .from("engineering_optimization_constraints")
      .select("id, hardness, constraint_code, name, metric_key, operator, threshold_value, source_object_type, source_object_id")
      .eq("study_id", String(detail.run.study_id));
    if (error) throw new Error(error.message);
    const hardnessById = new Map((constraints ?? []).map((row) => [String(row.id), String(row.hardness ?? "HARD")]));
    const mapped = (detail.evaluations as Array<Record<string, unknown>>).map((row) => ({
      constraint_id: String(row.constraint_id),
      evaluated_value: row.evaluated_value == null ? null : Number(row.evaluated_value),
      passed: Boolean(row.passed),
      margin: row.margin == null ? null : Number(row.margin),
      hardness: (hardnessById.get(String(row.constraint_id)) === "SOFT" ? "SOFT" : "HARD") as "HARD" | "SOFT",
    }));
    const feasible = isFeasible(mapped);
    const failures = (detail.evaluations as Array<Record<string, unknown>>)
      .filter((row) => row.passed === false)
      .map((row) => {
        const spec = (constraints ?? []).find((c) => String(c.id) === String(row.constraint_id));
        return {
          constraint_id: row.constraint_id,
          constraint_code: spec?.constraint_code ?? null,
          name: spec?.name ?? null,
          metric_key: spec?.metric_key ?? null,
          operator: spec?.operator ?? null,
          threshold_value: spec?.threshold_value ?? null,
          evaluated_value: row.evaluated_value,
          source_object_type: spec?.source_object_type ?? null,
          source_object_id: spec?.source_object_id ?? null,
          hardness: hardnessById.get(String(row.constraint_id)) ?? "HARD",
        };
      });
    return { runId, feasible, failures };
  }

  async computePareto(commerce: CommerceExecutionContext, tenantId: string, studyId: string) {
    assertEngineeringService(commerce, "optimization.get", tenantId);
    const study = await this.requireStudy(commerce, tenantId, studyId);
    const children = await this.studies.loadChildren(study.id);
    const succeeded = (children.runs as Array<Record<string, unknown>>).filter((row) => String(row.status) === "succeeded");
    const candidates: ParetoCandidate[] = [];
    for (const run of succeeded) {
      const [metrics, evaluations] = await Promise.all([
        this.supabase.from("engineering_optimization_result_metrics").select("metric_key, value, unit").eq("run_id", String(run.id)),
        this.supabase.from("engineering_optimization_constraint_evaluations").select("passed, constraint_id").eq("run_id", String(run.id)),
      ]);
      const hardnessById = new Map(
        (children.constraints as Array<Record<string, unknown>>).map((row) => [String(row.id), String(row.hardness ?? "HARD")]),
      );
      const constraintRows = (evaluations.data ?? []) as Array<Record<string, unknown>>;
      const feasible = constraintRows
        .filter((row) => hardnessById.get(String(row.constraint_id)) !== "SOFT")
        .every((row) => row.passed === true);
      candidates.push({
        alternativeId: String(run.alternative_id),
        runId: String(run.id),
        metrics: (metrics.data ?? []).map((row) => ({
          metric_key: String(row.metric_key),
          value: Number(row.value),
          unit: (row.unit as string | null) ?? null,
        })),
        feasible,
      });
    }
    const objectives: ObjectiveSpec[] = (children.objectives as Array<Record<string, unknown>>).map((row) => ({
      id: String(row.id),
      metric_key: String(row.metric_key),
      direction: row.direction as ObjectiveSpec["direction"],
      target_value: row.target_value == null ? null : Number(row.target_value),
      unit: (row.unit as string | null) ?? null,
    }));
    return computeParetoSet(objectives, candidates);
  }

  async cancel(commerce: CommerceExecutionContext, tenantId: string, runId: string, actorId?: string) {
    assertEngineeringService(commerce, "optimization.update", tenantId);
    const run = await this.requireRun(commerce, tenantId, runId);
    if (String(run.status) === "succeeded") throw new Error("Succeeded run evidence cannot be cancelled.");
    const { data, error } = await this.supabase
      .from("engineering_optimization_runs")
      .update({ status: "cancelled", completed_at: new Date().toISOString() })
      .eq("id", run.id)
      .eq("tenant_id", tenantId)
      .select()
      .single();
    if (error || !data) throw new Error(`Failed to cancel run: ${error?.message}`);
    await this.audit(tenantId, run as StudyRow, run.id as string, "optimization.run.cancelled", "Optimization run cancelled", actorId);
    return data;
  }

  private async buildManifestForRun(
    study: StudyRow,
    run: Record<string, unknown>,
    pinnedItems: import("./fingerprint").FingerprintItem[],
    baselineFingerprint: string,
    alternative: Record<string, unknown>,
    externalTool?: NonNullable<RunInputManifestV1["execution"]["external_tool"]>,
  ): Promise<RunInputManifestV1> {
    const children = await this.studies.loadChildren(String(study.id));
    const snapshot = await this.studies.loadContextSnapshot(String(study.tenant_id), study);
    const { data: valueRows, error: valueErr } = await this.supabase
      .from("engineering_optimization_alternative_values")
      .select("*")
      .eq("alternative_id", String(alternative.id));
    if (valueErr) throw new Error(valueErr.message);
    let scenario: Record<string, unknown> | null = null;
    if (run.scenario_id) {
      const { data } = await this.supabase
        .from("engineering_optimization_scenarios")
        .select("*")
        .eq("id", String(run.scenario_id))
        .maybeSingle();
      scenario = (data as Record<string, unknown> | null) ?? null;
    }
    return buildRunInputManifest({
      studyId: String(study.id),
      lifecycleStage: (study.lifecycle_stage as string | null) ?? null,
      baselineId: String(run.configuration_baseline_id),
      baselineFingerprint,
      pinnedItems,
      systems: snapshot.systemRows,
      decisionId: (study.decision_id as string | null) ?? null,
      requirements: snapshot.requirementRows,
      assumptions: snapshot.assumptionRows,
      interfaces: snapshot.interfaceRows,
      objectives: children.objectives as Array<Record<string, unknown>>,
      constraints: children.constraints as Array<Record<string, unknown>>,
      variables: children.variables as Array<Record<string, unknown>>,
      scenario,
      alternative,
      alternativeValues: (valueRows ?? []) as Array<Record<string, unknown>>,
      adapterId: String(run.adapter_id ?? CERTIFICATION_STUB_ADAPTER_ID),
      adapterVersion: (run.adapter_version as string | null) ?? null,
      algorithmId: (run.algorithm_id as string | null) ?? null,
      algorithmVersion: (run.algorithm_version as string | null) ?? null,
      randomSeed: (run.random_seed as string | null) ?? null,
      toolId: externalTool?.tool_id ?? null,
      toolVersion: externalTool?.tool_version ?? null,
      externalTool,
    });
  }

  private async requireStudy(commerce: CommerceExecutionContext, tenantId: string, studyId: string): Promise<StudyRow> {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    const { data, error } = await this.supabase
      .from("engineering_optimization_studies")
      .select("*")
      .eq("id", studyId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Optimization study not found.");
    return data as StudyRow;
  }

  private async requireRun(commerce: CommerceExecutionContext, tenantId: string, runId: string) {
    const workspaceId = workspaceScopeId(commerce);
    if (!workspaceId) throw new Error("workspace required");
    const { data, error } = await this.supabase
      .from("engineering_optimization_runs")
      .select("*")
      .eq("id", runId)
      .eq("tenant_id", tenantId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error("Optimization run not found.");
    return data as Record<string, unknown> & StudyRow;
  }

  private async audit(tenantId: string, scope: StudyRow, objectId: string, eventType: string, title: string, actorId?: string | null) {
    try {
      await this.framework.recordTimeline({
        tenantId,
        workspaceId: scope.workspace_id,
        eventType,
        objectType: "optimization_run",
        objectId,
        projectId: scope.project_id ?? undefined,
        title,
        actorId: actorId ?? undefined,
      });
      await this.framework.recordActivity({
        tenantId,
        workspaceId: scope.workspace_id,
        activityType: eventType,
        objectType: "optimization_run",
        objectId,
        projectId: scope.project_id ?? undefined,
        title,
        actorId: actorId ?? undefined,
      });
    } catch {
      // best-effort
    }
  }
}
