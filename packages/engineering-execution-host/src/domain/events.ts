/**
 * Execution-host events — ids / status metadata only.
 */

export const EXECUTION_HOST_EVENT_TYPES = [
  "engineering.execution.host.registered",
  "engineering.execution.host.health_changed",
  "engineering.execution.job.queued",
  "engineering.execution.job.started",
  "engineering.execution.job.completed",
  "engineering.execution.job.failed",
  "engineering.execution.provider.unavailable",
] as const;

export type ExecutionHostEventType = (typeof EXECUTION_HOST_EVENT_TYPES)[number];

export type ExecutionHostOutboxEvent = {
  outboxId: string;
  tenantId: string;
  workspaceId: string;
  eventType: ExecutionHostEventType;
  payload: {
    hostId?: string;
    jobId?: string;
    providerId?: string;
    providerVersion?: string;
    status?: string;
    licenseState?: string;
    requestId?: string;
    correlationId?: string;
    durationMs?: number;
  };
  correlationId?: string;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
};

export function createExecutionHostOutboxEvent(input: {
  outboxId: string;
  tenantId: string;
  workspaceId: string;
  eventType: ExecutionHostEventType;
  payload: ExecutionHostOutboxEvent["payload"];
  correlationId?: string;
}): ExecutionHostOutboxEvent {
  return {
    outboxId: input.outboxId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    eventType: input.eventType,
    payload: input.payload,
    correlationId: input.correlationId,
    published: false,
    createdAt: new Date().toISOString(),
  };
}
