/**
 * Phase 12C — Append-only twin timeline events.
 *
 * Follows platform timeline conventions (project_controls pattern): immutable append-only log.
 */

export const TWIN_TIMELINE_EVENT_TYPES = [
  "state_created",
  "state_reviewed",
  "state_published",
  "state_superseded",
  "representation_updated",
] as const;

export type TwinTimelineEventType = (typeof TWIN_TIMELINE_EVENT_TYPES)[number];

export type TwinTimelineEvent = {
  eventId: string;
  twinId: string;
  tenantId: string;
  workspaceId: string;
  eventType: TwinTimelineEventType;
  entityType: "twin_state" | "representation_version" | "twin_snapshot";
  entityId: string;
  recordedAt: string;
  actorId?: string;
  correlationId?: string;
  summary: string;
  /** Identifier refs only — no telemetry payloads */
  refs: Record<string, string>;
  appendOnly: true;
  overwritesPriorEvent: false;
};

export function createTwinTimelineEvent(
  input: Omit<TwinTimelineEvent, "appendOnly" | "overwritesPriorEvent">,
): TwinTimelineEvent {
  return {
    ...input,
    appendOnly: true,
    overwritesPriorEvent: false,
  };
}
