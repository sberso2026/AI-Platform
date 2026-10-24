import type { SupabaseClient } from "@rtb/database";
import type { JobService } from "@rtb/platform-kernel";
import type { BackgroundJob, JobHandler } from "@rtb/types";
import { CertificationStubAdapter, isCertificationStubAdapter } from "./certification-adapter";
import type { OptimizationExecutionPort, OptimizationExecutionRequest, OptimizationExecutionResult } from "./execution-port";
import { ExecutionHostDelegatingAdapter } from "./host-adapter";
import { OPTIMIZATION_JOB_TYPE } from "./invariants";
import { validateRunInputManifest, type RunInputManifestV1 } from "./manifest";

export function createOptimizationExecutionPort(): OptimizationExecutionPort {
  const stub = new CertificationStubAdapter();
  const host = new ExecutionHostDelegatingAdapter();
  return {
    async execute(request: OptimizationExecutionRequest) {
      if (isCertificationStubAdapter(request.adapterId)) return stub.execute(request);
      return host.execute(request);
    },
  };
}

export function createOptimizationEvaluateHandler(
  supabase: SupabaseClient,
  port: OptimizationExecutionPort = createOptimizationExecutionPort(),
): JobHandler {
  return {
    jobType: OPTIMIZATION_JOB_TYPE,
    async handle(job: BackgroundJob) {
      return handleOptimizationEvaluate(supabase, port, job);
    },
  };
}

export function registerOptimizationEvaluateHandler(
  jobs: JobService,
  supabase: SupabaseClient,
  port?: OptimizationExecutionPort,
): void {
  jobs.registerHandler(createOptimizationEvaluateHandler(supabase, port ?? createOptimizationExecutionPort()));
}

export async function handleOptimizationEvaluate(
  supabase: SupabaseClient,
  port: OptimizationExecutionPort,
  job: BackgroundJob,
): Promise<Record<string, unknown>> {
  const payload = job.payload ?? {};
  const runId = String(payload.runId ?? "");
  const tenantId = job.tenant_id;
  if (!runId) throw new Error("invalid_manifest: missing runId");

  const { data: run, error: runErr } = await supabase
    .from("engineering_optimization_runs")
    .select("*")
    .eq("id", runId)
    .eq("tenant_id", tenantId)
    .maybeSingle();
  if (runErr) throw new Error(runErr.message);
  if (!run) throw new Error("optimization_run_not_found");
  if (job.workspace_id && String(run.workspace_id) !== String(job.workspace_id)) {
    throw new Error("workspace_ownership_mismatch");
  }

  const status = String(run.status);
  if (status === "succeeded") {
    return { runId, status: "succeeded", idempotent: true };
  }
  if (status === "cancelled") {
    throw new Error("job_cancelled");
  }
  if (!["queued", "running", "failed"].includes(status)) {
    throw new Error(`run_not_startable:${status}`);
  }

  const { data: manifestRow, error: manErr } = await supabase
    .from("engineering_optimization_run_manifests")
    .select("*")
    .eq("run_id", runId)
    .maybeSingle();
  if (manErr) throw new Error(manErr.message);
  if (!manifestRow) throw new Error("invalid_manifest");
  let manifest: RunInputManifestV1;
  try {
    manifest = validateRunInputManifest(manifestRow.manifest);
  } catch (error) {
    await failRun(supabase, runId, tenantId, "invalid_manifest", error instanceof Error ? error.message : String(error));
    throw error;
  }

  await supabase
    .from("engineering_optimization_runs")
    .update({ status: "running", started_at: new Date().toISOString(), execution_ref: run.execution_ref ?? job.id })
    .eq("id", runId)
    .eq("tenant_id", tenantId);

  const request: OptimizationExecutionRequest = {
    studyId: String(run.study_id),
    runId,
    alternativeId: String(run.alternative_id),
    scenarioId: (run.scenario_id as string | null) ?? null,
    baselineId: String(run.configuration_baseline_id),
    tenantId,
    workspaceId: String(run.workspace_id),
    runInputManifest: manifest,
    adapterId: manifest.execution.adapter_id,
    adapterVersion: manifest.execution.adapter_version,
    toolId: manifest.execution.tool_id,
    toolVersion: manifest.execution.tool_version,
    requestedBy: job.created_by ?? "system",
    executionRef: String(run.execution_ref ?? job.id),
  };

  let result: OptimizationExecutionResult;
  try {
    result = await port.execute(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await failRun(supabase, runId, tenantId, "execution_failed", message, String(run.execution_ref ?? job.id));
    throw error;
  }

  if (result.status !== "succeeded") {
    await failRun(
      supabase,
      runId,
      tenantId,
      result.errorCode ?? result.status,
      result.errorMessage ?? result.status,
      result.executionRef,
    );
    throw new Error(result.errorMessage ?? result.status);
  }

  await ingestTrustedFromHandler(supabase, {
    tenantId,
    run,
    result,
  });

  return {
    runId,
    status: "succeeded",
    executionRef: result.executionRef,
    sourceKind: result.sourceKind,
    metricCount: result.metrics.length,
    selected: false,
    approved: false,
  };
}

async function ingestTrustedFromHandler(
  supabase: SupabaseClient,
  input: {
    tenantId: string;
    run: Record<string, unknown>;
    result: OptimizationExecutionResult;
  },
) {
  const { evaluateConstraints } = await import("./analysis");
  const run = input.run;
  const { data: constraints, error: cErr } = await supabase
    .from("engineering_optimization_constraints")
    .select("*")
    .eq("study_id", String(run.study_id));
  if (cErr) throw new Error(cErr.message);

  const metricRows = input.result.metrics.map((metric) => ({
    tenant_id: run.tenant_id,
    workspace_id: run.workspace_id,
    project_id: run.project_id,
    study_id: run.study_id,
    run_id: run.id,
    metric_key: metric.metricKey,
    value: metric.value,
    unit: metric.unit ?? null,
    objective_id: metric.objectiveId ?? null,
    source_kind: input.result.sourceKind,
    provenance: {
      source_kind: input.result.sourceKind,
      execution_ref: input.result.executionRef,
      adapter: input.result.adapterProvenance,
      tool: input.result.toolProvenance,
    },
    created_by: null,
  }));
  if (metricRows.length > 0) {
    const inserted = await supabase
      .from("engineering_optimization_result_metrics")
      .upsert(metricRows, { onConflict: "run_id,metric_key" })
      .select();
    if (inserted.error) throw new Error(`malformed_result: ${inserted.error.message}`);
  }

  const evaluations = evaluateConstraints(
    (constraints ?? []).map((row) => ({
      id: String(row.id),
      metric_key: String(row.metric_key),
      operator: (row.operator as string | null) ?? null,
      threshold_value: row.threshold_value == null ? null : Number(row.threshold_value),
      hardness: (String(row.hardness) === "SOFT" ? "SOFT" : "HARD") as "HARD" | "SOFT",
      unit: (row.unit as string | null) ?? null,
    })),
    input.result.metrics.map((metric) => ({
      metric_key: metric.metricKey,
      value: metric.value,
      unit: metric.unit ?? null,
    })),
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
      evidence: evaluation.unitMismatch
        ? "unit_mismatch"
        : evaluation.passed
          ? "pass"
          : "hard/soft constraint failed",
    }));
    const evalInsert = await supabase
      .from("engineering_optimization_constraint_evaluations")
      .upsert(evalRows, { onConflict: "run_id,constraint_id" })
      .select();
    if (evalInsert.error) throw new Error(`constraint_evaluation_failure: ${evalInsert.error.message}`);
  }

  const { error } = await supabase
    .from("engineering_optimization_runs")
    .update({
      status: "succeeded",
      completed_at: new Date().toISOString(),
      started_at: run.started_at ?? new Date().toISOString(),
      failure_reason: null,
    })
    .eq("id", String(run.id))
    .eq("tenant_id", input.tenantId);
  if (error) throw new Error(`Failed to complete run: ${error.message}`);
}

async function failRun(
  supabase: SupabaseClient,
  runId: string,
  tenantId: string,
  code: string,
  message: string,
  executionRef?: string,
) {
  await supabase
    .from("engineering_optimization_runs")
    .update({
      status: "failed",
      completed_at: new Date().toISOString(),
      failure_reason: `${code}: ${message}`.slice(0, 2000),
      ...(executionRef ? { execution_ref: executionRef } : {}),
    })
    .eq("id", runId)
    .eq("tenant_id", tenantId);
}
