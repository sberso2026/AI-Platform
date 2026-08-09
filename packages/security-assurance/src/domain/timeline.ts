/**
 * Append-only Security & Assurance timeline (domain-scoped).
 * Not a competing global Platform timeline.
 */

export type SecurityAssuranceTimelineEvent = {
  eventId: string;
  tenantId: string;
  workspaceId: string;
  eventType: string;
  entityType: string;
  entityId: string;
  recordedAt: string;
  actorId?: string;
  summary: string;
  refs: Record<string, string>;
  appendOnly: true;
  overwritesPriorEvent: false;
  usesSharedKnowledgeGraph: true;
  dedicatedSecurityKg: false;
};

export function createSecurityAssuranceTimelineEvent(
  input: Omit<
    SecurityAssuranceTimelineEvent,
    "appendOnly" | "overwritesPriorEvent" | "usesSharedKnowledgeGraph" | "dedicatedSecurityKg"
  >,
): SecurityAssuranceTimelineEvent {
  return {
    ...input,
    appendOnly: true,
    overwritesPriorEvent: false,
    usesSharedKnowledgeGraph: true,
    dedicatedSecurityKg: false,
  };
}

export class SecurityAssuranceTimeline {
  readonly kind = "security_assurance_timeline" as const;
  private events: SecurityAssuranceTimelineEvent[] = [];

  append(event: SecurityAssuranceTimelineEvent): SecurityAssuranceTimelineEvent {
    if (!event.appendOnly || event.overwritesPriorEvent) {
      throw new Error("Timeline must be append-only");
    }
    if (event.dedicatedSecurityKg) {
      throw new Error("Dedicated Security KG is forbidden");
    }
    this.events.push(event);
    return event;
  }

  list(): SecurityAssuranceTimelineEvent[] {
    return [...this.events];
  }
}
