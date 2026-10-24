/**
 * Phase 13D.1 — Execution job authorization (control plane).
 */
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  createAndAuthorizeExecutionJob,
  createDurableExecutionHostMemoryStore,
  createExecutionHostRepository,
} from "@rtb/engineering-execution-host";
import {
  EXEC_HOST_GOVERNANCE,
  parseExecHostJsonBody,
  rejectForbiddenExecHostPayload,
  requireScope,
} from "../_assurance";

const store = createDurableExecutionHostMemoryStore();
const repo = createExecutionHostRepository({
  adapter: "memory",
  memoryStore: store,
  nodeEnv: "development",
});

export async function POST(req: Request) {
  const parsed = await parseExecHostJsonBody(req);
  if (!parsed.ok) return parsed.response;
  const forbidden = rejectForbiddenExecHostPayload(parsed.body, parsed.requestId);
  if (forbidden) return forbidden;
  const scope = requireScope(parsed.body, parsed.requestId);
  if (scope instanceof NextResponse) return scope;

  const idempotencyKey =
    typeof parsed.body.idempotencyKey === "string"
      ? parsed.body.idempotencyKey
      : undefined;
  if (idempotencyKey) {
    const existing = await repo.getJobByIdempotencyKey(
      scope.tenantId,
      scope.workspaceId,
      idempotencyKey,
    );
    if (existing) {
      return NextResponse.json({
        accepted: existing.status === "accepted" || existing.status === "queued",
        requestId: parsed.requestId,
        job: existing,
        idempotentReplay: true,
        ...EXEC_HOST_GOVERNANCE,
      });
    }
  }

  const result = createAndAuthorizeExecutionJob({
    jobId:
      typeof parsed.body.jobId === "string"
        ? parsed.body.jobId
        : `job_${randomUUID().replace(/-/g, "").slice(0, 12)}`,
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
    providerId:
      typeof parsed.body.providerId === "string" ? parsed.body.providerId : "",
    providerVersion:
      typeof parsed.body.providerVersion === "string"
        ? parsed.body.providerVersion
        : undefined,
    toolRegistrationRef:
      typeof parsed.body.toolRegistrationRef === "string"
        ? parsed.body.toolRegistrationRef
        : "",
    methodQualificationRef:
      typeof parsed.body.methodQualificationRef === "string"
        ? parsed.body.methodQualificationRef
        : "",
    providerQualificationRef:
      typeof parsed.body.providerQualificationRef === "string"
        ? parsed.body.providerQualificationRef
        : "",
    applicationQualificationRef:
      typeof parsed.body.applicationQualificationRef === "string"
        ? parsed.body.applicationQualificationRef
        : "",
    sourceModelRef:
      typeof parsed.body.sourceModelRef === "string"
        ? parsed.body.sourceModelRef
        : "",
    inputArtifactRefs: Array.isArray(parsed.body.inputArtifactRefs)
      ? (parsed.body.inputArtifactRefs as string[])
      : [],
    requestedBy:
      typeof parsed.body.requestedBy === "string" ? parsed.body.requestedBy : "",
    idempotencyKey,
    correlationId: parsed.correlationId,
    requestId: parsed.requestId,
    hostRevoked: parsed.body.hostRevoked === true,
    hostCapacityExceeded: parsed.body.hostCapacityExceeded === true,
    providerAvailable: parsed.body.providerAvailable !== false,
    providerLicenseAvailable: parsed.body.providerLicenseAvailable !== false,
    providerRevoked: parsed.body.providerRevoked === true,
    actualProviderVersion:
      typeof parsed.body.actualProviderVersion === "string"
        ? parsed.body.actualProviderVersion
        : null,
    allowFallbackProvider: parsed.body.allowFallbackProvider === true,
  });

  await repo.saveJob(result.job);

  return NextResponse.json({
    accepted: result.ok,
    requestId: parsed.requestId,
    correlationId: parsed.correlationId,
    job: result.job,
    ...EXEC_HOST_GOVERNANCE,
  });
}
