import type { Json, SupabaseClient } from "@rtb/database";
import type { JobService } from "@rtb/platform-kernel";
import type { BackgroundJob, JobHandler } from "@rtb/types";
import type { AnalysisExecutionPort } from "./execution-port";
import { isSyntheticCertificationAdapter } from "./execution-port";
import { SyntheticCertificationAnalysisAdapter } from "./synthetic-adapter";
import { ANALYSIS_JOB_TYPE, SYNTHETIC_CERTIFICATION_ADAPTER_ID } from "./types";
import { validateNormalizedAnalysisResult } from "./validation";
import type { AnalysisInputManifestV1 } from "./types";

function db(supabase: SupabaseClient): { from(name: string): any } {
  return supabase as unknown as { from(name: string): any };
}

export function createAnalysisExecutionPort(): AnalysisExecutionPort {
  const synthetic = new SyntheticCertificationAnalysisAdapter();
  return {
    async execute(request) {
      if (isSyntheticCertificationAdapter(request.adapterId)) {
        return synthetic.execute(request);
      }
      return {
        executionRef: request.executionRef,
        accepted: false,
        status: "rejected",
        executionSucceeded: false,
        resultValid: false,
        metrics: [],
        warnings: [],
        limitations: ["real_solver_not_dispatched"],
        resultArtifacts: [],
        errorClass: "TOOL_NOT_READY",
        errorMessage: "Real deterministic solver execution is not certified on this path. No fabricated result is produced.",
        provenance: {
          toolId: request.toolId,
          toolVersion: request.toolVersion,
          adapterId: request.adapterId,
          adapterVersion: request.adapterVersion,
          executionHostId: request.executionHostId,
          sourceKind: "ADAPTER",
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
        },
      };
    },
  };
}

export function createAnalysisExecuteHandler(
  supabase: SupabaseClient,
  port: AnalysisExecutionPort = createAnalysisExecutionPort(),
): JobHandler {
  return {
    jobType: ANALYSIS_JOB_TYPE,
    async handle(job: BackgroundJob) {
      return handleAnalysisExecute(supabase, port, job);
    },
  };
}

export function registerAnalysisExecuteHandler(
  jobs: JobService,
  supabase: SupabaseClient,
  port?: AnalysisExecutionPort,
): void {
  jobs.registerHandler(createAnalysisExecuteHandler(supabase, port ?? createAnalysisExecutionPort()));
}

export async function handleAnalysisExecute(
  supabase: SupabaseClient,
  port: AnalysisExecutionPort,
  job: BackgroundJob,
): Promise<Record<string, unknown>> {
  const payload = job.payload ?? {};
  const requestId = String(payload.analysisRequestId ?? "");
  const planId = String(payload.executionPlanId ?? "");
  if (!requestId || !planId) throw new Error("invalid_analysis_job_payload");

  const { data: request, error: reqErr } = await db(supabase)
    .from("engineering_analysis_requests")
    .select("*")
    .eq("id", requestId)
    .eq("tenant_id", job.tenant_id)
    .maybeSingle();
  if (reqErr) throw new Error(reqErr.message);
  if (!request) throw new Error("analysis_request_not_found");
  if (String(request.status) === "blocked") {
    return { analysisRequestId: requestId, status: "blocked", jobDispatched: false, fabricated: false };
  }

  const { data: plan, error: planErr } = await db(supabase).from("engineering_analysis_execution_plans")
    .select("*")
    .eq("id", planId)
    .maybeSingle();
  if (planErr) throw new Error(planErr.message);
  if (!plan || plan.frozen !== true) throw new Error("execution_plan_not_frozen");

  await db(supabase).from("engineering_analysis_requests")
    .update({ status: "executing" })
    .eq("id", requestId);
  await db(supabase).from("engineering_analysis_execution_plans")
    .update({ status: "executing" })
    .eq("id", planId);

  const manifest = plan.manifest as AnalysisInputManifestV1;
  const adapterId = String(plan.adapter_id ?? SYNTHETIC_CERTIFICATION_ADAPTER_ID);
  const executed = await port.execute({
    analysisRequestId: requestId,
    executionPlanId: planId,
    tenantId: job.tenant_id,
    workspaceId: String(request.workspace_id),
    projectId: String(request.project_id),
    discipline: String(request.discipline),
    capability: String(request.capability),
    adapterId,
    adapterVersion: (plan.adapter_version as string | null) ?? null,
    toolId: (plan.external_tool_profile_id as string | null) ?? null,
    toolVersion: (plan.tool_version as string | null) ?? null,
    executionHostId: (plan.execution_host_id as string | null) ?? null,
    inputManifest: manifest,
    analysisInputFingerprint: String(plan.analysis_input_fingerprint),
    requestedBy: String(request.requested_by),
    executionRef: job.id,
  });

  const required = Array.isArray(manifest.requested_outputs) ? manifest.requested_outputs : [];
  const validity = validateNormalizedAnalysisResult(
    { executionSucceeded: executed.executionSucceeded, metrics: executed.metrics, resultArtifacts: executed.resultArtifacts },
    required,
  );

  const resultRow = {
    tenant_id: job.tenant_id,
    workspace_id: request.workspace_id,
    project_id: request.project_id,
    analysis_request_id: requestId,
    execution_plan_id: planId,
    job_id: job.id,
    execution_ref: executed.executionRef,
    discipline: request.discipline,
    capability: request.capability,
    execution_succeeded: executed.executionSucceeded,
    result_valid: executed.resultValid && validity.resultValid,
    status: executed.executionSucceeded ? (validity.resultValid ? "SUCCEEDED" : "INCOMPLETE") : "FAILED",
    metrics: executed.metrics as unknown as Json,
    warnings: executed.warnings,
    limitations: executed.limitations,
    result_artifacts: executed.resultArtifacts as unknown as Json,
    provenance: executed.provenance as unknown as Json,
    review_state: "not_reviewed",
    acceptance_state: "UNREVIEWED",
    stale: false,
    stale_reasons: [],
  };

  const inserted = await db(supabase).from("engineering_analysis_results").insert(resultRow).select().single();
  if (inserted.error) throw new Error(inserted.error.message);

  await db(supabase).from("engineering_analysis_requests")
    .update({ status: executed.executionSucceeded ? "succeeded" : "failed" })
    .eq("id", requestId);
  await db(supabase).from("engineering_analysis_execution_plans")
    .update({ status: executed.executionSucceeded ? "completed" : "failed" })
    .eq("id", planId);

  return {
    analysisRequestId: requestId,
    resultId: inserted.data?.id,
    executionSucceeded: executed.executionSucceeded,
    resultValid: resultRow.result_valid,
    fabricated: false,
  };
}
