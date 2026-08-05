import type { CommerceEventService } from "./commerce-event-service";

export interface LifecycleObservationInput {
  eventType: string;
  tenantId: string;
  workspaceId?: string;
  installationId?: string;
  actorUserId?: string;
  actorRole?: string;
  operation: string;
  result: "success" | "blocked" | "failed";
  errorCode?: string;
  correlationId?: string;
  aggregateType: string;
  aggregateId: string;
  payload?: Record<string, unknown>;
}

export async function emitLifecycleObservation(
  events: CommerceEventService,
  input: LifecycleObservationInput
): Promise<void> {
  const previousState = input.payload?.previousState ?? input.payload?.previous_state ?? null;
  const nextState = input.payload?.nextState ?? input.payload?.next_state ?? null;
  const durationMs = input.payload?.durationMs ?? input.payload?.duration_ms ?? null;
  const operatingSystemKey =
    input.payload?.operatingSystemKey ?? input.payload?.operating_system_key ?? null;
  const requestId = input.payload?.requestId ?? input.payload?.request_id ?? input.correlationId ?? null;

  await events.emit({
    eventType: input.eventType,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    actorUserId: input.actorUserId,
    aggregateType: input.aggregateType,
    aggregateId: input.aggregateId,
    correlationId: input.correlationId,
    payload: {
      ...input.payload,
      tenant_id: input.tenantId,
      workspace_id: input.workspaceId ?? null,
      installation_id: input.installationId ?? null,
      actor_id: input.actorUserId ?? null,
      actor_role: input.actorRole ?? null,
      operation: input.operation,
      action: input.operation,
      result: input.result,
      error_code: input.errorCode ?? null,
      timestamp: new Date().toISOString(),
      correlation_id: input.correlationId ?? null,
      request_id: requestId,
      operating_system_key: operatingSystemKey,
      previous_state: previousState,
      next_state: nextState,
      duration_ms: durationMs,
    },
  });
}
