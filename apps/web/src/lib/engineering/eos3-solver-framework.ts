/**
 * EOS 3.6 Solver Framework.
 * CONNECTOR_AVAILABLE != SOLVER_QUALIFIED
 * EXECUTION_SUCCESS != ENGINEERING_VALIDATION
 * EXTERNAL_RESULT != HUMAN_DECISION
 * IMPLEMENTED != VALIDATED != QUALIFIED
 */

import { createHash } from "node:crypto";
import { buildEos3Provenance } from "../commerce/eos3-provenance";
import type { Eos3Connector } from "./eos3-integration-connectors";
import { AI_SOLVER_QUALIFICATION_AUTHORITY } from "./eos3-integration-connectors";

export { AI_SOLVER_QUALIFICATION_AUTHORITY };

export const EOS3_EXTERNAL_SOLVER_GLOBAL_QUALIFICATION = false as const;
export const EOS3_D1_MIGRATION_STATE = "PRESERVE_COMPATIBLE" as const;
export const EOS3_NON_D1_CALCULATION_STATUS = "NOT_QUALIFIED" as const;

export type SolverExecutionMode =
  | "FILE_EXCHANGE"
  | "LOCAL_HOSTED"
  | "REMOTE_API"
  | "MANUAL_IMPORT"
  | "EOS_HOSTED";

export type SolverQualificationState =
  | "INTEGRATED_NOT_VALIDATED"
  | "VALIDATED_BOUNDED"
  | "QUALIFIED_BOUNDED"
  | "QUALIFIED";

export type SolverJobState =
  | "CREATED"
  | "VALIDATING"
  | "READY"
  | "SUBMITTED"
  | "RUNNING"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED"
  | "TIMED_OUT";

export type OptimizationSourceClass =
  | "deterministic_eos_calculation"
  | "external_solver"
  | "heuristic"
  | "ai_estimate";

export type Eos3Solver = {
  solverId: string;
  provider: string;
  product: string;
  version: string;
  executionMode: SolverExecutionMode;
  supportedAnalysisTypes: string[];
  inputContract: string;
  outputContract: string;
  connectorId: string;
  qualificationState: SolverQualificationState;
  validationState: "none" | "bounded_schema" | "bounded_replay";
  environment: "staging_synthetic" | "development" | "production_denied";
  provenance: Record<string, unknown>;
};

export type SolverInputManifest = {
  manifestId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  analysisType: string;
  governingObjectRevisions: Array<{ objectId: string; revisionId: string }>;
  engineeringBasisRef: string | null;
  assumptions: string[];
  parameters: Record<string, number | string>;
  units: Record<string, string>;
  axisConvention: string;
  solverId: string;
  solverVersion: string;
  inputFileHashes: string[];
  generatedAt: string;
  actorId: string;
  qualificationContext: SolverQualificationState;
  contentHash: string;
  provenance: Record<string, unknown>;
};

export type SolverJob = {
  jobId: string;
  solverId: string;
  connectorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  manifestId: string;
  state: SolverJobState;
  idempotencyKey: string;
  actorId: string;
  createdAt: string;
  updatedAt: string;
  timeoutMs: number;
  retryCount: number;
  maxRetries: number;
  failureReason: string | null;
  resultId: string | null;
  audit: Array<{ action: string; at: string; detail: Record<string, unknown> }>;
};

export type SolverResult = {
  resultId: string;
  solverId: string;
  solverVersion: string;
  jobId: string;
  manifestId: string;
  outputHash: string;
  timestamp: string;
  classification: "RESULT";
  validationState: "passed" | "failed" | "rejected";
  qualificationState: SolverQualificationState;
  units: Record<string, string>;
  payload: Record<string, unknown>;
  immutable: true;
  calculationObjectId: string | null;
  provenance: Record<string, unknown>;
};

export type ExecutionBounds = {
  maxJobsPerWorkspace: number;
  defaultTimeoutMs: number;
  maxRetries: number;
  maxConcurrency: number;
};

export const DEFAULT_EXECUTION_BOUNDS: ExecutionBounds = {
  maxJobsPerWorkspace: 20,
  defaultTimeoutMs: 30_000,
  maxRetries: 2,
  maxConcurrency: 4,
};

const ALLOWED_FILE_TYPES = new Set([".json", ".txt", ".csv", ".xml", ".sgd"]);

function id(): string {
  return crypto.randomUUID();
}
function now(): string {
  return new Date().toISOString();
}
function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export function createSolver(input: {
  provider: string;
  product: string;
  version: string;
  executionMode: SolverExecutionMode;
  supportedAnalysisTypes: string[];
  connector: Eos3Connector;
  qualificationState?: SolverQualificationState;
}): Eos3Solver {
  return {
    solverId: id(),
    provider: input.provider,
    product: input.product,
    version: input.version,
    executionMode: input.executionMode,
    supportedAnalysisTypes: input.supportedAnalysisTypes,
    inputContract: "eos3.solver.input.v1",
    outputContract: "eos3.solver.output.v1",
    connectorId: input.connector.connectorId,
    qualificationState: input.qualificationState ?? "INTEGRATED_NOT_VALIDATED",
    validationState: "none",
    environment: "staging_synthetic",
    provenance: buildEos3Provenance({
      tenantId: input.connector.tenantId,
      workspaceId: input.connector.workspaceId,
      projectId: null,
      objectId: null,
      revisionId: null,
      source: "eos3.solver.framework",
      actorId: null,
      authority: null,
      method: "createSolver",
      toolOrModel: input.product,
      evidenceClassification: "FACT",
      qualificationState: input.qualificationState ?? "INTEGRATED_NOT_VALIDATED",
    }),
  };
}

/** Only explicit qualification governance may change solver qualification. AI denied. */
export function setSolverQualification(
  solver: Eos3Solver,
  next: SolverQualificationState,
  actor: { actorId: string; role: string; isAi?: boolean },
): Eos3Solver {
  if (actor.isAi || actor.role === "ai" || AI_SOLVER_QUALIFICATION_AUTHORITY) {
    throw new Error("ai_solver_qualification_denied");
  }
  if (actor.role !== "qualification_authority") {
    throw new Error("insufficient_solver_qualification_authority");
  }
  return { ...solver, qualificationState: next, validationState: next === "INTEGRATED_NOT_VALIDATED" ? "none" : "bounded_schema" };
}

export function checkUnitCompatibility(
  expected: Record<string, string>,
  actual: Record<string, string>,
): { ok: boolean; mismatches: string[] } {
  const mismatches: string[] = [];
  for (const [k, v] of Object.entries(expected)) {
    if (actual[k] && actual[k] !== v) mismatches.push(k);
  }
  return { ok: mismatches.length === 0, mismatches };
}

export function checkAxisCompatibility(expected: string, actual: string): { ok: boolean } {
  return { ok: expected === actual };
}

export function validateSolverFilePath(filePath: string): { ok: boolean; reason?: string } {
  if (!filePath || filePath.includes("\0")) return { ok: false, reason: "invalid_path" };
  if (/(^|[\\/])\.\.([\\/]|$)/.test(filePath)) return { ok: false, reason: "path_traversal" };
  if (/^[a-zA-Z]:\\|^\/|^\\\\/.test(filePath) && !filePath.startsWith("sandbox/")) {
    return { ok: false, reason: "absolute_path_denied" };
  }
  const ext = filePath.includes(".") ? `.${filePath.split(".").pop()!.toLowerCase()}` : "";
  if (ext && !ALLOWED_FILE_TYPES.has(ext)) return { ok: false, reason: "file_type_denied" };
  if (filePath.length > 240) return { ok: false, reason: "path_too_long" };
  return { ok: true };
}

/** Prefer argv array; reject shell-concatenated untrusted commands. */
export function buildSafeSolverArgv(binary: string, args: string[]): { ok: true; argv: string[] } | { ok: false; reason: string } {
  if (/[;&|`$<>]/.test(binary) || args.some((a) => /[;&|`$]/.test(a))) {
    return { ok: false, reason: "command_injection_rejected" };
  }
  if (binary.includes(" ") && !binary.startsWith("sandbox/")) {
    return { ok: false, reason: "unsafe_binary_path" };
  }
  return { ok: true, argv: [binary, ...args] };
}

export function createInputManifest(input: {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  analysisType: string;
  governingObjectRevisions: Array<{ objectId: string; revisionId: string }>;
  engineeringBasisRef?: string | null;
  assumptions?: string[];
  parameters: Record<string, number | string>;
  units: Record<string, string>;
  axisConvention: string;
  solver: Eos3Solver;
  actorId: string;
  inputFiles?: string[];
}): SolverInputManifest {
  for (const f of input.inputFiles ?? []) {
    const v = validateSolverFilePath(f);
    if (!v.ok) throw new Error(v.reason ?? "file_safety_failed");
  }
  const body = JSON.stringify({
    analysisType: input.analysisType,
    parameters: input.parameters,
    units: input.units,
    axis: input.axisConvention,
    revs: input.governingObjectRevisions,
  });
  return {
    manifestId: id(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    analysisType: input.analysisType,
    governingObjectRevisions: input.governingObjectRevisions,
    engineeringBasisRef: input.engineeringBasisRef ?? null,
    assumptions: input.assumptions ?? [],
    parameters: input.parameters,
    units: input.units,
    axisConvention: input.axisConvention,
    solverId: input.solver.solverId,
    solverVersion: input.solver.version,
    inputFileHashes: (input.inputFiles ?? []).map((f) => hash(f)),
    generatedAt: now(),
    actorId: input.actorId,
    qualificationContext: input.solver.qualificationState,
    contentHash: hash(body),
    provenance: buildEos3Provenance({
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectId: null,
      revisionId: null,
      source: "eos3.solver.manifest",
      actorId: input.actorId,
      authority: "engineer",
      method: "createInputManifest",
      toolOrModel: input.solver.product,
      evidenceClassification: "FACT",
      qualificationState: input.solver.qualificationState,
    }),
  };
}

export class Eos3SolverRuntime {
  solvers: Eos3Solver[] = [];
  jobs: SolverJob[] = [];
  results: SolverResult[] = [];
  manifests: SolverInputManifest[] = [];
  jobKeys = new Map<string, string>();
  bounds: ExecutionBounds;
  observability = {
    submissions: 0,
    failures: 0,
    timeouts: 0,
    validationRejections: 0,
    durationMsTotal: 0,
  };

  constructor(bounds: ExecutionBounds = DEFAULT_EXECUTION_BOUNDS) {
    this.bounds = bounds;
  }

  register(solver: Eos3Solver): void {
    this.solvers.push(solver);
  }

  authorizeSubmission(
    caller: {
      authenticated: boolean;
      tenantId: string | null;
      workspaceId: string | null;
      eos3Entitled: boolean;
      eos3Enrolled: boolean;
      productionEnvironment?: boolean;
      role: string;
    },
    target: { tenantId: string; workspaceId: string },
  ): { allowed: boolean; reason?: string } {
    if (!caller.authenticated) return { allowed: false, reason: "unauthenticated" };
    if (caller.productionEnvironment) return { allowed: false, reason: "production_denied" };
    if (!caller.eos3Entitled || !caller.eos3Enrolled) return { allowed: false, reason: "not_entitled" };
    if (caller.tenantId !== target.tenantId || caller.workspaceId !== target.workspaceId) {
      return { allowed: false, reason: "workspace_mismatch" };
    }
    if (caller.role === "ai") return { allowed: false, reason: "ai_cannot_submit_high_impact" };
    if (!["engineer", "operator", "solver_operator"].includes(caller.role)) {
      return { allowed: false, reason: "insufficient_submission_role" };
    }
    return { allowed: true };
  }

  submitJob(input: {
    solver: Eos3Solver;
    connector: Eos3Connector;
    manifest: SolverInputManifest;
    actorId: string;
    idempotencyKey: string;
    timeoutMs?: number;
  }): SolverJob {
    if (!input.connector.enabledExecution) throw new Error("connector_not_enabled");
    if (input.manifest.solverId !== input.solver.solverId) throw new Error("manifest_solver_mismatch");
    if (input.manifest.tenantId !== input.connector.tenantId || input.manifest.workspaceId !== input.connector.workspaceId) {
      throw new Error("workspace_mismatch");
    }
    const existing = this.jobKeys.get(input.idempotencyKey);
    if (existing) {
      return this.jobs.find((j) => j.jobId === existing)!;
    }
    const wsJobs = this.jobs.filter((j) => j.workspaceId === input.manifest.workspaceId && !["COMPLETED", "FAILED", "CANCELLED", "TIMED_OUT"].includes(j.state));
    if (wsJobs.length >= this.bounds.maxJobsPerWorkspace) throw new Error("execution_budget_exceeded");

    const job: SolverJob = {
      jobId: id(),
      solverId: input.solver.solverId,
      connectorId: input.connector.connectorId,
      tenantId: input.manifest.tenantId,
      workspaceId: input.manifest.workspaceId,
      projectId: input.manifest.projectId,
      manifestId: input.manifest.manifestId,
      state: "CREATED",
      idempotencyKey: input.idempotencyKey,
      actorId: input.actorId,
      createdAt: now(),
      updatedAt: now(),
      timeoutMs: input.timeoutMs ?? this.bounds.defaultTimeoutMs,
      retryCount: 0,
      maxRetries: this.bounds.maxRetries,
      failureReason: null,
      resultId: null,
      audit: [{ action: "created", at: now(), detail: {} }],
    };
    this.jobs.push(job);
    this.manifests.push(input.manifest);
    this.jobKeys.set(input.idempotencyKey, job.jobId);
    this.observability.submissions += 1;
    return job;
  }

  transitionJob(job: SolverJob, to: SolverJobState, detail: Record<string, unknown> = {}): SolverJob {
    const allowed: Record<SolverJobState, SolverJobState[]> = {
      CREATED: ["VALIDATING", "CANCELLED"],
      VALIDATING: ["READY", "FAILED", "CANCELLED"],
      READY: ["SUBMITTED", "CANCELLED"],
      SUBMITTED: ["RUNNING", "FAILED", "CANCELLED", "TIMED_OUT"],
      RUNNING: ["COMPLETED", "FAILED", "CANCELLED", "TIMED_OUT"],
      COMPLETED: [],
      FAILED: [],
      CANCELLED: [],
      TIMED_OUT: [],
    };
    if (!allowed[job.state].includes(to)) throw new Error("invalid_job_transition");
    job.state = to;
    job.updatedAt = now();
    job.audit.push({ action: "transition", at: now(), detail: { to, ...detail } });
    return job;
  }

  retryJob(job: SolverJob): SolverJob {
    if (!["FAILED", "TIMED_OUT"].includes(job.state)) throw new Error("retry_not_allowed");
    if (job.retryCount >= job.maxRetries) throw new Error("retry_limit_exceeded");
    job.retryCount += 1;
    job.failureReason = null;
    job.resultId = null;
    job.state = "CREATED";
    job.updatedAt = now();
    job.audit.push({ action: "retry", at: now(), detail: { retryCount: job.retryCount } });
    return job;
  }

  ingestResult(input: {
    job: SolverJob;
    solver: Eos3Solver;
    manifest: SolverInputManifest;
    payload: Record<string, unknown>;
    units: Record<string, string>;
    axisConvention: string;
    expectedSolverVersion?: string;
    calculationObjectId?: string | null;
  }): SolverResult {
    if (input.job.state !== "RUNNING" && input.job.state !== "COMPLETED") {
      // allow ingest only when running (completion) — failed jobs cannot produce success
      if (["FAILED", "TIMED_OUT", "CANCELLED"].includes(input.job.state)) {
        throw new Error("failed_job_cannot_produce_result");
      }
    }
    if (input.job.manifestId !== input.manifest.manifestId) throw new Error("result_manifest_tamper");
    if (input.job.solverId !== input.solver.solverId) throw new Error("result_solver_mismatch");
    if (input.manifest.solverId !== input.solver.solverId) throw new Error("result_job_tamper");

    if (input.expectedSolverVersion && input.expectedSolverVersion !== input.solver.version) {
      this.observability.validationRejections += 1;
      throw new Error("solver_version_mismatch");
    }

    const units = checkUnitCompatibility(input.manifest.units, input.units);
    if (!units.ok) {
      this.observability.validationRejections += 1;
      throw new Error(`unit_mismatch:${units.mismatches.join(",")}`);
    }
    const axis = checkAxisCompatibility(input.manifest.axisConvention, input.axisConvention);
    if (!axis.ok) {
      this.observability.validationRejections += 1;
      throw new Error("axis_mismatch");
    }

    // schema / finite checks
    for (const [k, v] of Object.entries(input.payload)) {
      if (typeof v === "number" && !Number.isFinite(v)) {
        this.observability.validationRejections += 1;
        throw new Error(`non_finite:${k}`);
      }
    }
    if (input.payload.analysisType && input.payload.analysisType !== input.manifest.analysisType) {
      this.observability.validationRejections += 1;
      throw new Error("analysis_type_mismatch");
    }

    // Immutability: new result instance always; never overwrite prior by same id
    const result: SolverResult = {
      resultId: id(),
      solverId: input.solver.solverId,
      solverVersion: input.solver.version,
      jobId: input.job.jobId,
      manifestId: input.manifest.manifestId,
      outputHash: hash(JSON.stringify(input.payload)),
      timestamp: now(),
      classification: "RESULT",
      validationState: "passed",
      qualificationState: input.solver.qualificationState,
      units: input.units,
      payload: { ...input.payload, analysisType: input.manifest.analysisType },
      immutable: true,
      calculationObjectId: input.calculationObjectId ?? null,
      provenance: buildEos3Provenance({
        tenantId: input.job.tenantId,
        workspaceId: input.job.workspaceId,
        projectId: input.job.projectId,
        objectId: input.calculationObjectId ?? null,
        revisionId: null,
        source: "eos3.solver.result",
        actorId: input.job.actorId,
        authority: null,
        method: "ingestResult",
        toolOrModel: input.solver.product,
        evidenceClassification: "RESULT",
        qualificationState: input.solver.qualificationState,
      }),
    };
    this.results.push(result);
    input.job.resultId = result.resultId;
    this.transitionJob(input.job, "COMPLETED", { resultId: result.resultId });
    return result;
  }

  /** Replay of completion must not duplicate authoritative result. */
  protectDuplicateResult(jobId: string, outputHash: string): { duplicate: boolean } {
    const existing = this.results.find((r) => r.jobId === jobId && r.outputHash === outputHash);
    return { duplicate: Boolean(existing) };
  }

  markFailed(job: SolverJob, reason: string): SolverJob {
    job.failureReason = reason;
    job.resultId = null;
    this.observability.failures += 1;
    return this.transitionJob(job, "FAILED", { reason });
  }

  markTimedOut(job: SolverJob): SolverJob {
    job.failureReason = "timeout";
    job.resultId = null;
    this.observability.timeouts += 1;
    return this.transitionJob(job, "TIMED_OUT", {});
  }
}

/** Deterministic synthetic solver — framework validation only; not commercial qualification. */
export function runSyntheticSolver(
  manifest: SolverInputManifest,
  mode: "success" | "failure" | "timeout" = "success",
): { ok: true; payload: Record<string, unknown>; units: Record<string, string>; axisConvention: string } | { ok: false; reason: string } {
  if (mode === "failure") return { ok: false, reason: "synthetic_forced_failure" };
  if (mode === "timeout") return { ok: false, reason: "synthetic_timeout" };
  const seed = hash(manifest.contentHash + manifest.solverVersion);
  const n = parseInt(seed.slice(0, 8), 16);
  const mass = typeof manifest.parameters.massKg === "number" ? manifest.parameters.massKg : 1000;
  return {
    ok: true,
    payload: {
      analysisType: manifest.analysisType,
      maxUtilisation: Number(((n % 1000) / 1000 + mass / 10000).toFixed(6)),
      reactionFx: Number(((n % 500) / 10).toFixed(3)),
      seed: seed.slice(0, 16),
    },
    units: { ...manifest.units },
    axisConvention: manifest.axisConvention,
  };
}

export function classifyOptimizationSource(source: OptimizationSourceClass): OptimizationSourceClass {
  return source;
}

/** D1 qualified-bounded metadata must not transfer to unrelated external solvers. */
export function inheritD1QualificationToExternalSolver(): false {
  return false;
}

export const SPACE_GASS_GLOBAL_QUALIFICATION = false as const;
export const SPACE_GASS_CONNECTOR_STATUS =
  "EXISTING_D1G_READ_ONLY_CONNECTOR_BOUNDED_LIMITATION_NOT_EXECUTION_CERTIFIED" as const;
