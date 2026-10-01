import { classifyWorkMateriality, SOURCE_EVENT_NORMALIZATION } from "./catalog";
import { evaluateCaptureEligibility } from "./eligibility";
import type {
  ConfirmationState,
  EngineeringWorkEvent,
  ManagedEngineeringRepository,
  SourceWorkflowSignal,
  WorkEventType,
} from "./types";

export type NormalizationResult =
  | { captured: false; decision: string; reason: string; event: null }
  | { captured: true; decision: "CAPTURED"; reason: string; event: Omit<EngineeringWorkEvent, "id" | "publishedToEventBus"> };

export function normalizeEngineeringWorkEvent(input: {
  tenantId: string;
  workspaceId: string;
  repositories: ManagedEngineeringRepository[];
  signal: SourceWorkflowSignal;
  recordedAt?: string;
  actorId?: string | null;
}): NormalizationResult {
  const eligibility = evaluateCaptureEligibility({ signal: input.signal, repositories: input.repositories });
  if (eligibility.decision !== "CAPTURED") {
    return { captured: false, decision: eligibility.decision, reason: eligibility.reason, event: null };
  }
  const mapped = SOURCE_EVENT_NORMALIZATION[input.signal.sourceEventType];
  const eventType: WorkEventType = mapped ?? (WORK_EVENT_FALLBACK[input.signal.sourceEventType] as WorkEventType | undefined) ?? "SOURCE_REVISED";
  if (!mapped && !WORK_EVENT_FALLBACK[input.signal.sourceEventType]) {
    return {
      captured: false,
      decision: "DENIED_DEFAULT",
      reason: `Source event ${input.signal.sourceEventType} is not a material engineering workflow event.`,
      event: null,
    };
  }
  const confirmationState: ConfirmationState = input.signal.extractedByAi ? "CANDIDATE" : "NOT_REQUIRED";
  const recordedAt = input.recordedAt ?? new Date().toISOString();
  return {
    captured: true,
    decision: "CAPTURED",
    reason: eligibility.reason,
    event: {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.signal.projectId,
      eventType,
      sourceSystem: input.signal.sourceSystem,
      sourceObjectType: input.signal.sourceObjectType,
      sourceObjectId: input.signal.sourceObjectId,
      sourceEventId: input.signal.sourceEventId,
      informationRefId: input.signal.informationRefId ?? null,
      disciplineId: input.signal.disciplineId ?? null,
      systemId: input.signal.systemId ?? null,
      assetId: input.signal.assetId ?? null,
      deliverableId: input.signal.deliverableId ?? null,
      lifecycleStage: input.signal.lifecycleStage ?? null,
      actorId: input.signal.actorId ?? input.actorId ?? null,
      occurredAt: input.signal.occurredAt,
      recordedAt,
      managedRepositoryId: eligibility.repository?.id ?? null,
      materiality: classifyWorkMateriality(eventType),
      confirmationState,
      captureReason: eligibility.reason,
      provenance: {
        sourceSystem: input.signal.sourceSystem,
        sourceEventType: input.signal.sourceEventType,
        sourceEventId: input.signal.sourceEventId,
        occurredAtPreserved: true,
        recordedAt,
        repositoryId: eligibility.repository?.id ?? null,
        extractedByAi: Boolean(input.signal.extractedByAi),
      },
    },
  };
}

const WORK_EVENT_FALLBACK: Record<string, WorkEventType> = {
  SOURCE_CREATED: "SOURCE_CREATED",
  SOURCE_REVISED: "SOURCE_REVISED",
  SOURCE_PUBLISHED: "SOURCE_PUBLISHED",
  DOCUMENT_REVIEW_REQUESTED: "DOCUMENT_REVIEW_REQUESTED",
  DOCUMENT_REVIEW_COMPLETED: "DOCUMENT_REVIEW_COMPLETED",
  CALCULATION_PUBLISHED: "CALCULATION_PUBLISHED",
  ANALYSIS_EXECUTED: "ANALYSIS_EXECUTED",
  DRAWING_ISSUED: "DRAWING_ISSUED",
  INTERFACE_INFORMATION_CHANGED: "INTERFACE_INFORMATION_CHANGED",
  RFI_CREATED: "RFI_CREATED",
  RFI_RESPONDED: "RFI_RESPONDED",
  RFI_CLOSED: "RFI_CLOSED",
  DECISION_RECORDED: "DECISION_RECORDED",
  ACTION_CREATED: "ACTION_CREATED",
  ACTION_COMPLETED: "ACTION_COMPLETED",
  DELIVERABLE_UPDATED: "DELIVERABLE_UPDATED",
  DELIVERABLE_ISSUED: "DELIVERABLE_ISSUED",
  CONFIGURATION_CHANGED: "CONFIGURATION_CHANGED",
  MEETING_ACTION_CONFIRMED: "MEETING_ACTION_CONFIRMED",
  MEETING_DECISION_CONFIRMED: "MEETING_DECISION_CONFIRMED",
  INFORMATION_REQUESTED: "INFORMATION_REQUESTED",
  INFORMATION_RECEIVED: "INFORMATION_RECEIVED",
  INFORMATION_ACCEPTED: "INFORMATION_ACCEPTED",
  HANDOVER_PUBLISHED: "HANDOVER_PUBLISHED",
  HANDOVER_ACCEPTED: "HANDOVER_ACCEPTED",
  HANDOVER_PACKAGE_READY: "HANDOVER_PACKAGE_READY",
  ENGINEERING_WORK_PLAN_CREATED: "ENGINEERING_WORK_PLAN_CREATED",
  ENGINEERING_WORK_STARTED: "ENGINEERING_WORK_STARTED",
  ENGINEERING_WORK_BLOCKED: "ENGINEERING_WORK_BLOCKED",
  ENGINEERING_WORK_CONTEXT_REFRESHED: "ENGINEERING_WORK_CONTEXT_REFRESHED",
  ENGINEERING_WORK_COMPLETED: "ENGINEERING_WORK_COMPLETED",
};
