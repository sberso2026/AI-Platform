/** Typed engineering events — modules never call each other directly. */

export type InspectionEngineeringEventType =
  | "InspectionCreated"
  | "InspectionStarted"
  | "InspectionCompleted"
  | "ReviewApproved"
  | "EvidenceUploaded"
  | "MeasurementRecorded"
  | "FindingCreated"
  | "RecommendationIssued"
  | "TemplateVersionCreated"
  | "PackRegistered"
  | "WorkflowStarted"
  | "WorkflowTransitioned"
  | "WorkflowCompleted"
  | "AssignmentCreated"
  | "VerificationCompleted"
  | "SlaBreached";

export type InspectionEngineeringEvent = {
  type: InspectionEngineeringEventType;
  tenantId: string;
  workspaceId: string;
  occurredAt: string;
  entityId: string;
  correlationId?: string;
  payload: Record<string, unknown>;
  subscribers: Array<
    | "asset_intelligence"
    | "project_controls"
    | "digital_twin"
    | "knowledge_graph"
    | "executive_dashboard"
    | "notifications"
    | "future_modules"
  >;
};

export function createEngineeringInspectionEvent(
  partial: Omit<InspectionEngineeringEvent, "occurredAt" | "subscribers"> & {
    occurredAt?: string;
    subscribers?: InspectionEngineeringEvent["subscribers"];
  },
): InspectionEngineeringEvent {
  return {
    ...partial,
    occurredAt: partial.occurredAt ?? new Date().toISOString(),
    subscribers: partial.subscribers ?? [
      "asset_intelligence",
      "project_controls",
      "digital_twin",
      "knowledge_graph",
      "executive_dashboard",
      "notifications",
      "future_modules",
    ],
  };
}

export type PlatformEventPipelineStage =
  | "inspection"
  | "platform_event_bus"
  | "asset_timeline"
  | "digital_twin"
  | "knowledge_graph"
  | "executive_dashboard";

export const PLATFORM_EVENT_PIPELINE: PlatformEventPipelineStage[] = [
  "inspection",
  "platform_event_bus",
  "asset_timeline",
  "digital_twin",
  "knowledge_graph",
  "executive_dashboard",
];

export type EventPublishPort = {
  publish(event: InspectionEngineeringEvent): Promise<void>;
};

/** In-process durable event log used until Platform EventBus is wired by host. */
export function createInProcessEventPipeline(): EventPublishPort & {
  events: InspectionEngineeringEvent[];
} {
  const events: InspectionEngineeringEvent[] = [];
  return {
    events,
    async publish(event) {
      events.push(event);
    },
  };
}
