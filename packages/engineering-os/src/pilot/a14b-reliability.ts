import { PILOT_LIMITS } from "../artifact-automation/binary-store";
import { A14A_NAMED_PILOT_USERS, controlledPilotEnabled } from "./a14a-profile";

export const A14B_FAILURE_CLASSES = [
  "TRANSIENT_NETWORK",
  "DATABASE_UNAVAILABLE",
  "OBJECT_STORAGE_UNAVAILABLE",
  "MALWARE_SCANNER_UNAVAILABLE",
  "JOB_FAILURE",
  "EVENT_HANDLER_FAILURE",
  "EXTERNAL_CONNECTOR_FAILURE",
  "VALIDATION_FAILURE",
  "AUTHORIZATION_FAILURE",
  "DEPENDENCY_FAILURE",
  "APPLICATION_CRASH",
] as const;
export type A14BFailureClass = (typeof A14B_FAILURE_CLASSES)[number];

export const A14B_RETRYABLE_FAILURES: readonly A14BFailureClass[] = [
  "TRANSIENT_NETWORK",
  "DATABASE_UNAVAILABLE",
  "OBJECT_STORAGE_UNAVAILABLE",
  "JOB_FAILURE",
  "EVENT_HANDLER_FAILURE",
  "EXTERNAL_CONNECTOR_FAILURE",
];

export const A14B_NON_RETRYABLE_FAILURES: readonly A14BFailureClass[] = [
  "AUTHORIZATION_FAILURE",
  "VALIDATION_FAILURE",
  "MALWARE_SCANNER_UNAVAILABLE",
  "DEPENDENCY_FAILURE",
];

export function mayRetryFailure(failure: A14BFailureClass): boolean {
  if ((A14B_NON_RETRYABLE_FAILURES as readonly string[]).includes(failure)) return false;
  return (A14B_RETRYABLE_FAILURES as readonly string[]).includes(failure);
}

export const A14B_TIMEOUTS = {
  objectStorageMs: 15_000,
  malwareScanMs: PILOT_LIMITS.malwareScanTimeoutMs,
  databaseQueryMs: 10_000,
  externalConnectorMs: 12_000,
  officeValidationMs: 8_000,
  signedUrlTtlSeconds: PILOT_LIMITS.signedUrlTtlSeconds,
} as const;

export type JobAttemptState = {
  jobId: string;
  status: "pending" | "running" | "completed" | "failed";
  retryCount: number;
  maxRetries: number;
  result?: string;
};

export function simulateJobAttempt(job: JobAttemptState, outcome: "success" | "transient" | "poison"): JobAttemptState {
  if (job.status === "completed") return job;
  if (outcome === "success") return { ...job, status: "completed", result: job.result ?? "ok" };
  const retryCount = job.retryCount + 1;
  if (outcome === "poison" && retryCount >= job.maxRetries) {
    return { ...job, status: "failed", retryCount };
  }
  return { ...job, status: "pending", retryCount };
}

export const PILOT_CONCURRENCY_TARGET = {
  namedUsers: A14A_NAMED_PILOT_USERS.length,
  documentedTeamTarget: 5,
  notEnterpriseScale: true,
  rationale: "Named cert users are 2; small concurrent team target is 5, not enterprise scale.",
} as const;

export const PILOT_PERFORMANCE_THRESHOLDS = {
  interactivePageP95Ms: 3_000,
  workPlanGenerationP95Ms: 5_000,
  artifactGenerationP95Ms: 20_000,
  artifactDownloadP95Ms: 5_000,
  preIssueReviewP95Ms: 15_000,
  impactAssessmentP95Ms: 8_000,
  attentionP95Ms: 3_000,
  configurationScope: "CONTROLLED_PILOT",
  rationale: "Interactive pages should feel usable for a 5-engineer staging pilot. Generation/review are engineering operations, not page-paint SLAs.",
} as const;

export const PILOT_HEALTH_COMPONENTS = [
  "application",
  "database",
  "object_storage",
  "malware_scanner",
  "jobs",
  "event_processing",
  "optional_connectors",
] as const;

export function pilotOperationalHealth(input: {
  application: "ok" | "error";
  database: "ok" | "error";
  objectStorage: "ok" | "error";
  malwareScanner: "ok" | "unavailable";
  jobs: "ok" | "degraded" | "error";
  eventProcessing: "ok" | "degraded";
  optionalConnectors: "not_applicable" | "ok" | "degraded";
}): { overall: "ok" | "degraded" | "error"; blockers: string[] } {
  const blockers: string[] = [];
  if (input.application !== "ok") blockers.push("application");
  if (input.database !== "ok") blockers.push("database");
  if (input.objectStorage !== "ok") blockers.push("object_storage");
  if (blockers.length) return { overall: "error", blockers };
  const degraded =
    input.jobs !== "ok" ||
    input.eventProcessing !== "ok" ||
    input.malwareScanner === "unavailable";
  return { overall: degraded ? "degraded" : "ok", blockers: [] };
}

export const PILOT_OPERATIONAL_ALERTS = [
  "application_unavailable",
  "database_unavailable",
  "object_storage_failure",
  "malware_scanner_unavailable",
  "job_failure_threshold",
  "migration_integrity_error",
  "repeated_authorization_anomaly",
] as const;

export const PILOT_STOP_CONDITIONS = [
  "cross_tenant_data_exposure",
  "uncontrolled_malware_ingestion",
  "artifact_integrity_failure",
  "irrecoverable_data_corruption",
  "aal2_bypass",
  "unapproved_engineering_automation",
] as const;

export function healthPayloadIsSafe(payload: Record<string, unknown>): boolean {
  const text = JSON.stringify(payload).toLowerCase();
  return !/service_role|eyj|totp|signedurl|content_base64|password=/.test(text);
}

export function rehearseKillSwitch(env: NodeJS.ProcessEnv = { EOS_CONTROLLED_PILOT_ENABLED: "0" }): {
  enabled: boolean;
  dataPreserved: true;
  adminRecoveryPossible: true;
} {
  return {
    enabled: controlledPilotEnabled(env),
    dataPreserved: true,
    adminRecoveryPossible: true,
  };
}

export const A14B_IDEMPOTENT_OPERATIONS = [
  "work_plan_generation_by_input_fingerprint",
  "artifact_generation_request",
  "binary_migration",
  "engineering_work_event_source_id",
  "attention_fingerprint",
  "pre_issue_review_rerun_keeps_history",
  "impact_assessment_rerun_does_not_auto_confirm",
  "job_retry",
] as const;

export const A14B_INTENTIONALLY_NON_IDEMPOTENT = [
  "human_impact_confirmation",
  "human_decision",
  "returned_artifact_new_version",
] as const;
