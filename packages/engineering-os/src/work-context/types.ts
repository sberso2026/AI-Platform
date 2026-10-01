/**
 * EOS-A10B Engineering Work Context & Information Flow.
 * Tracks material engineering work, not employee computer activity.
 */

export const WORK_CONTEXT_AI_BOUNDARY = {
  maySuggestCandidateEvents: true,
  mayExplainCapture: true,
  mayCreateGovernedDecisionFromTranscript: false,
  mayChangeRequirementFromEmail: false,
  mayScoreProductivity: false,
  mayMonitorIndependentAiSessions: false,
  mayCaptureKeystrokes: false,
} as const;

export const DEFAULT_CAPTURE_POLICY = "DENY" as const;
export const ALLOWLISTED_REPOSITORIES_ONLY = true;
export const LOCAL_DRIVE_RECURSIVE_SCAN = "PROHIBITED" as const;
export const UNMANAGED_FILE_INDEXING = "PROHIBITED" as const;
export const PERSONAL_ONEDRIVE_ACCESS = "PROHIBITED" as const;
export const PERSONAL_EMAIL_ACCESS = "PROHIBITED" as const;
export const BROWSER_HISTORY_CAPTURE = "PROHIBITED" as const;
export const KEYSTROKE_CAPTURE = "PROHIBITED" as const;

export const MANAGED_REPOSITORY_TYPES = [
  "SHAREPOINT_LIBRARY",
  "NETWORK_FOLDER",
  "CORPORATE_SYNCED_FOLDER",
  "ENGINEERING_EDMS",
  "ENGINEERING_APPLICATION",
  "PROJECT_MAILBOX",
  "PROJECT_TEAMS_CHANNEL",
  "OTHER_APPROVED_ENTERPRISE_SOURCE",
] as const;
export type ManagedRepositoryType = (typeof MANAGED_REPOSITORY_TYPES)[number];

export const REPOSITORY_SCOPES = ["TENANT", "WORKSPACE", "PROJECT"] as const;
export type RepositoryScope = (typeof REPOSITORY_SCOPES)[number];

export const CAPTURE_POLICIES = ["DENY", "MANAGED"] as const;
export type CapturePolicy = (typeof CAPTURE_POLICIES)[number];

export const WORK_EVENT_TYPES = [
  "SOURCE_CREATED",
  "SOURCE_REVISED",
  "SOURCE_PUBLISHED",
  "DOCUMENT_REVIEW_REQUESTED",
  "DOCUMENT_REVIEW_COMPLETED",
  "CALCULATION_PUBLISHED",
  "ANALYSIS_EXECUTED",
  "DRAWING_ISSUED",
  "INTERFACE_INFORMATION_CHANGED",
  "RFI_CREATED",
  "RFI_RESPONDED",
  "RFI_CLOSED",
  "DECISION_RECORDED",
  "ACTION_CREATED",
  "ACTION_COMPLETED",
  "DELIVERABLE_UPDATED",
  "DELIVERABLE_ISSUED",
  "CONFIGURATION_CHANGED",
  "MEETING_ACTION_CONFIRMED",
  "MEETING_DECISION_CONFIRMED",
  "INFORMATION_RECEIVED",
  "INFORMATION_OVERDUE",
  "INFORMATION_REQUESTED",
  "INFORMATION_ACCEPTED",
  "HANDOVER_PUBLISHED",
  "HANDOVER_ACCEPTED",
  "HANDOVER_PACKAGE_READY",
  "ENGINEERING_WORK_PLAN_CREATED",
  "ENGINEERING_WORK_STARTED",
  "ENGINEERING_WORK_BLOCKED",
  "ENGINEERING_WORK_CONTEXT_REFRESHED",
  "ENGINEERING_WORK_COMPLETED",
  "ARTIFACT_GENERATION_STARTED",
  "ARTIFACT_GENERATED",
  "ARTIFACT_GENERATION_FAILED",
  "ARTIFACT_REGENERATED",
  "TOOL_HANDOFF_PREPARED",
  "TOOL_HANDOFF_STARTED",
  "ARTIFACT_RETURNED",
  "ARTIFACT_PUBLISHED",
] as const;
export type WorkEventType = (typeof WORK_EVENT_TYPES)[number];

export const WORK_MATERIALITY = ["MATERIAL", "ROUTINE", "INFORMATIONAL"] as const;
export type WorkMateriality = (typeof WORK_MATERIALITY)[number];

export const CONFIRMATION_STATES = ["NOT_REQUIRED", "CANDIDATE", "CONFIRMED", "REJECTED"] as const;
export type ConfirmationState = (typeof CONFIRMATION_STATES)[number];

export const CAPTURE_DECISIONS = ["CAPTURED", "OUTSIDE_EOS_SCOPE", "DENIED_DEFAULT", "PROHIBITED"] as const;
export type CaptureDecision = (typeof CAPTURE_DECISIONS)[number];

export const PROHIBITED_CAPTURE_CLASSES = [
  "KEYSTROKE",
  "MOUSE_MOVEMENT",
  "APPLICATION_OPEN_DURATION",
  "BROWSER_HISTORY",
  "PERSONAL_FILE",
  "PERSONAL_EMAIL",
  "PERSONAL_ONEDRIVE",
  "PERSONAL_AI_CONVERSATION",
  "IDLE_TIME",
  "PRODUCTIVITY_SCORE",
  "LOCAL_RECURSIVE_SCAN",
  "UNMANAGED_FILE_INDEXING",
] as const;
export type ProhibitedCaptureClass = (typeof PROHIBITED_CAPTURE_CLASSES)[number];

export type ManagedEngineeringRepository = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  scope: RepositoryScope;
  repositoryType: ManagedRepositoryType;
  externalRepositoryId: string | null;
  displayName: string;
  approvedRoot: string | null;
  connectionId: string | null;
  enabled: boolean;
  capturePolicy: CapturePolicy;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type EngineeringWorkEvent = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  eventType: WorkEventType;
  sourceSystem: string;
  sourceObjectType: string;
  sourceObjectId: string;
  sourceEventId: string;
  informationRefId: string | null;
  disciplineId: string | null;
  systemId: string | null;
  assetId: string | null;
  deliverableId: string | null;
  lifecycleStage: string | null;
  actorId: string | null;
  occurredAt: string;
  recordedAt: string;
  managedRepositoryId: string | null;
  materiality: WorkMateriality;
  confirmationState: ConfirmationState;
  captureReason: string;
  provenance: Record<string, unknown>;
  publishedToEventBus: boolean;
};

export type SourceWorkflowSignal = {
  sourceSystem: string;
  sourceEventType: string;
  sourceEventId: string;
  sourceObjectType: string;
  sourceObjectId: string;
  projectId: string;
  occurredAt: string;
  actorId?: string | null;
  path?: string | null;
  managedRepositoryId?: string | null;
  informationRefId?: string | null;
  disciplineId?: string | null;
  systemId?: string | null;
  assetId?: string | null;
  deliverableId?: string | null;
  lifecycleStage?: string | null;
  extractedByAi?: boolean;
  publishedToEos?: boolean;
  prohibitedClass?: ProhibitedCaptureClass | null;
};

export const KERNEL_WORK_EVENT_TYPE = "engineering.work.event" as const;
export const KERNEL_EVENT_SOURCE = "engineering-os" as const;

export const FUTURE_ASSURANCE_CONDITIONS = [
  "MANAGED_SOURCE_REQUIRED_BUT_UNAVAILABLE",
  "UNMANAGED_SOURCE_REFERENCED",
  "WORKFLOW_EVENT_MISSING_PROVENANCE",
] as const;
