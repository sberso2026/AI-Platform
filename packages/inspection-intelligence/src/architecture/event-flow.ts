/** Canonical inspection domain events for Asset Timeline / Twin / KG / dashboard flow. */

export type InspectionDomainEventType =
  | "inspection.template.created"
  | "inspection.template.revised"
  | "inspection.plan.created"
  | "inspection.plan.updated"
  | "inspection.session.started"
  | "inspection.session.completed"
  | "inspection.session.submitted"
  | "inspection.observation.recorded"
  | "inspection.measurement.recorded"
  | "inspection.evidence.appended"
  | "inspection.review.requested"
  | "inspection.review.completed";

export type InspectionDomainEvent = {
  type: InspectionDomainEventType;
  tenantId: string;
  workspaceId: string;
  occurredAt: string;
  entityId: string;
  targetIds?: string[];
  payload: Record<string, unknown>;
  /** Downstream consumers (not owned by II). */
  fanout: Array<"asset_timeline" | "digital_twin" | "knowledge_graph" | "executive_dashboard">;
};

export function createInspectionDomainEvent(
  partial: Omit<InspectionDomainEvent, "fanout" | "occurredAt"> & {
    occurredAt?: string;
    fanout?: InspectionDomainEvent["fanout"];
  },
): InspectionDomainEvent {
  return {
    ...partial,
    occurredAt: partial.occurredAt ?? new Date().toISOString(),
    fanout: partial.fanout ?? [
      "asset_timeline",
      "digital_twin",
      "knowledge_graph",
      "executive_dashboard",
    ],
  };
}
