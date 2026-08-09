/**
 * Generic EngineeringExecutionJob — authorization metadata required.
 * Host does NOT select alternate providers (no silent fallback).
 */

import { silentSolverFallbackAllowed } from "../version";
import type { VersionCompatibilityPolicy } from "./version-pinning";
import { checkProviderVersionPin } from "./version-pinning";

export const EXECUTION_JOB_STATUSES = [
  "queued",
  "accepted",
  "running",
  "completed",
  "completed_with_warnings",
  "failed",
  "timeout",
  "cancelled",
  "rejected",
  "provider_unavailable",
  "license_unavailable",
  "version_mismatch",
] as const;

export type ExecutionJobStatus = (typeof EXECUTION_JOB_STATUSES)[number];

export type EngineeringExecutionJob = {
  jobId: string;
  tenantId: string;
  workspaceId: string;
  hostId?: string;
  providerId: string;
  providerVersion?: string;
  versionPolicy: VersionCompatibilityPolicy;
  toolRegistrationRef: string;
  methodQualificationRef: string;
  providerQualificationRef: string;
  applicationQualificationRef: string;
  sourceModelRef: string;
  inputArtifactRefs: string[];
  executionPolicy: {
    timeoutMs: number;
    allowRerun: boolean;
    maxConcurrentOnHost: number;
  };
  timeoutMs: number;
  requestedBy: string;
  status: ExecutionJobStatus;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  correlationId?: string;
  requestId?: string;
};

export type JobAuthorizationInput = {
  jobId: string;
  tenantId: string;
  workspaceId: string;
  providerId: string;
  providerVersion?: string;
  versionPolicy?: VersionCompatibilityPolicy;
  toolRegistrationRef: string;
  methodQualificationRef: string;
  providerQualificationRef: string;
  applicationQualificationRef: string;
  sourceModelRef: string;
  inputArtifactRefs?: string[];
  timeoutMs?: number;
  requestedBy: string;
  idempotencyKey?: string;
  correlationId?: string;
  requestId?: string;
  hostRevoked?: boolean;
  hostCapacityExceeded?: boolean;
  providerAvailable?: boolean;
  providerLicenseAvailable?: boolean;
  providerRevoked?: boolean;
  actualProviderVersion?: string | null;
  allowFallbackProvider?: boolean;
};

export type JobAcceptanceResult =
  | { ok: true; job: EngineeringExecutionJob }
  | { ok: false; job: EngineeringExecutionJob; status: ExecutionJobStatus };

function reject(
  base: EngineeringExecutionJob,
  status: ExecutionJobStatus,
  reason: string,
): JobAcceptanceResult {
  const job = {
    ...base,
    status,
    rejectionReason: reason,
    updatedAt: new Date().toISOString(),
  };
  return { ok: false, job, status };
}

export function createAndAuthorizeExecutionJob(
  input: JobAuthorizationInput,
): JobAcceptanceResult {
  if (silentSolverFallbackAllowed) {
    throw new Error("silent_solver_fallback_must_be_false");
  }
  if (input.allowFallbackProvider) {
    throw new Error("provider_fallback_forbidden");
  }

  const now = new Date().toISOString();
  const versionPolicy: VersionCompatibilityPolicy =
    input.versionPolicy ??
    (input.providerVersion
      ? { mode: "exact", version: input.providerVersion }
      : { mode: "any_declared" });

  const base: EngineeringExecutionJob = {
    jobId: input.jobId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    providerId: input.providerId,
    providerVersion: input.providerVersion,
    versionPolicy,
    toolRegistrationRef: input.toolRegistrationRef,
    methodQualificationRef: input.methodQualificationRef,
    providerQualificationRef: input.providerQualificationRef,
    applicationQualificationRef: input.applicationQualificationRef,
    sourceModelRef: input.sourceModelRef,
    inputArtifactRefs: input.inputArtifactRefs ?? [],
    executionPolicy: {
      timeoutMs: input.timeoutMs ?? 300_000,
      allowRerun: false,
      maxConcurrentOnHost: 1,
    },
    timeoutMs: input.timeoutMs ?? 300_000,
    requestedBy: input.requestedBy,
    status: "queued",
    idempotencyKey: input.idempotencyKey,
    createdAt: now,
    updatedAt: now,
    correlationId: input.correlationId,
    requestId: input.requestId,
  };

  const required = [
    input.tenantId,
    input.workspaceId,
    input.providerId,
    input.toolRegistrationRef,
    input.methodQualificationRef,
    input.providerQualificationRef,
    input.applicationQualificationRef,
    input.sourceModelRef,
    input.requestedBy,
  ];
  if (required.some((v) => !v || !String(v).trim())) {
    return reject(base, "rejected", "missing_authorization_metadata");
  }
  if (input.hostRevoked) {
    return reject(base, "rejected", "host_revoked");
  }
  if (input.hostCapacityExceeded) {
    return reject(base, "rejected", "host_capacity_exceeded");
  }
  if (input.providerRevoked) {
    return reject(base, "provider_unavailable", "provider_revoked");
  }
  if (input.providerAvailable === false) {
    return reject(base, "provider_unavailable", "provider_unavailable");
  }
  if (input.providerLicenseAvailable === false) {
    return reject(base, "license_unavailable", "license_unavailable");
  }

  const pin = checkProviderVersionPin({
    policy: versionPolicy,
    actualVersion: input.actualProviderVersion,
  });
  if (!pin.ok && versionPolicy.mode !== "any_declared") {
    return reject(base, "version_mismatch", pin.reason);
  }

  return {
    ok: true,
    job: { ...base, status: "accepted", updatedAt: new Date().toISOString() },
  };
}
