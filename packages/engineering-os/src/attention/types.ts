/**
 * EOS-A12B Engineering Attention is a projection of canonical domain state.
 * It is not a second source of engineering truth, an activity feed, or employee telemetry.
 */

export const ATTENTION_CATEGORIES = [
  "DO_NOW",
  "REVIEW_REQUIRED",
  "DECISION_REQUIRED",
  "WAITING_ON_OTHERS",
  "RECENTLY_READY",
  "FYI",
] as const;
export type AttentionCategory = (typeof ATTENTION_CATEGORIES)[number];

export const ATTENTION_PRIORITIES = ["ACTION_REQUIRED", "REVIEW_REQUIRED", "NORMAL", "FYI"] as const;
export type AttentionPriority = (typeof ATTENTION_PRIORITIES)[number];

export const ATTENTION_ACTION_CODES = [
  "ASSESS_IMPACT",
  "CONTINUE_WORK",
  "RUN_PRE_ISSUE_REVIEW",
  "OPEN_REVIEW",
  "DISPOSITION_REVIEW",
  "START_ENGINEERING_WORK",
  "REQUEST_INFORMATION",
  "REVIEW_INFORMATION",
  "PREPARE_RFI_RESPONSE",
  "REVIEW_RFI_RESPONSE",
  "CREATE_DECISION",
  "RECORD_DECISION",
  "OPEN_INTERFACE",
  "REFRESH_CONTEXT",
  "PREPARE_HANDOVER",
] as const;
export type AttentionActionCode = (typeof ATTENTION_ACTION_CODES)[number];

export const ATTENTION_CHANNELS = ["IN_APP", "EMAIL", "TEAMS"] as const;
export type AttentionChannel = (typeof ATTENTION_CHANNELS)[number];

export const ATTENTION_VIEWER_ROLES = [
  "DESIGN_ENGINEER",
  "PROJECT_ENGINEER",
  "DISCIPLINE_LEAD",
  "REVIEWER",
  "CONSTRUCTION_ENGINEER",
  "COMMISSIONING_ENGINEER",
] as const;
export type AttentionViewerRole = (typeof ATTENTION_VIEWER_ROLES)[number];

export const ATTENTION_AI_BOUNDARY = {
  maySummarizeActionableWork: true,
  mayExplainWhyVisible: true,
  mayInventAttentionItem: false,
  mayAssignResponsibility: false,
  mayInventUrgency: false,
  mayInventDueDates: false,
  mayResolveEngineeringConditions: false,
  mayMakeDecisions: false,
  mayApproveWork: false,
} as const;

export const ATTENTION_PRIVACY = {
  employeeProductivityScoring: "PROHIBITED" as const,
  employeeRanking: "PROHIBITED" as const,
  applicationUsageMonitoring: false,
  hoursWorked: false,
  clickCounts: false,
  timeInExcel: false,
  newEventBusCreated: false,
  newWorkflowEngineCreated: false,
  newContentBase64Usage: false,
  binaryDuplication: "NO" as const,
  personalFilesCaptured: false,
  externalChannels: "CONTRACT_ONLY" as const,
};

export const ATTENTION_RECON = {
  kernelNotifications: "REUSE",
  eventBus: "REUSE",
  engineeringWorkEvent: "REUSE",
  workPlans: "REUSE",
  informationRequirements: "REUSE",
  preIssueReview: "REUSE",
  changeImpact: "REUSE",
  rfiTq: "REUSE",
  decisionIntelligence: "REUSE",
  interfaceIntelligence: "REUSE",
  workGenerator: "REUSE",
  continueWork: "REUSE",
  startWork: "REUSE",
  duplicateNotificationPlatform: "NO",
  newEventBus: "NO",
} as const;

export const ATTENTION_SCALE = {
  maxProjects: 12,
  maxItemsPerSection: 25,
  eventLookbackDays: 14,
  maxEventsPerProject: 80,
  maxPlansPerProject: 20,
} as const;

export const CALLER_SUPPLIED_ATTENTION_KEYS = ["tenantId", "workspaceId", "aal", "userId", "recipientId", "authorizedProjectIds"] as const;

export type AttentionActionContract = {
  code: AttentionActionCode;
  label: string;
  href: string;
  next?: AttentionActionCode[];
};

export type AttentionItem = {
  fingerprint: string;
  category: AttentionCategory;
  priority: AttentionPriority;
  projectId: string;
  projectName: string;
  lifecycleStage: string | null;
  discipline: string | null;
  systemId: string | null;
  sourceDomain: string;
  sourceObjectType: string;
  sourceObjectId: string;
  sourceRevision: string | null;
  workPlanId: string | null;
  title: string;
  whatHappened: string;
  whyItMatters: string;
  waitingFor: string | null;
  provider: string | null;
  blocks: string | null;
  neededBy: string | null;
  overdue: boolean;
  action: AttentionActionContract | null;
  explanation: string;
  acknowledged: boolean;
  snoozedUntil: string | null;
  resolved: false;
  engineeringStateMutatedByAck: false;
};

export type EngineeringDay = {
  generatedAt: string;
  projection: "DERIVED";
  sourceOfTruth: "CANONICAL_DOMAIN";
  projectsConsidered: number;
  eventsInspected: number;
  durationMs: number;
  counts: Record<AttentionCategory, number> & { actionRequired: number };
  sections: Record<AttentionCategory, AttentionItem[]>;
  items: AttentionItem[];
  askEosSummary: string;
  filters: { projectId: string | null; category: AttentionCategory | "ALL"; discipline: string | null; lifecycle: string | null };
  inAppNotification: { reused: true; channel: "IN_APP"; external: "DEFERRED" };
  productivityScore: null;
  employeeRanking: null;
};

export type AttentionPreference = {
  userId: string;
  tenantId: string;
  workspaceId: string;
  fyiDisplay: boolean;
  digestMode: "IMMEDIATE" | "DIGEST";
  mutedFyi: boolean;
  updatedAt: string;
};

export type AttentionAcknowledgement = {
  id: string;
  tenantId: string;
  workspaceId: string;
  userId: string;
  fingerprint: string;
  acknowledgedAt: string;
  snoozedUntil: string | null;
};

export type AttentionRequirementSnap = {
  id: string;
  title: string;
  status: string;
  blocking: boolean;
  providerDiscipline: string | null;
  providerKind: string | null;
  providerRole: string | null;
  consumerDiscipline: string | null;
  neededBy: string | null;
  requiredForObjectId: string | null;
  workType: string | null;
};

export type AttentionPlanSnap = {
  id: string;
  workType: string;
  status: string;
  readiness: string;
  startAllowed: boolean;
  discipline: string | null;
  systemId: string | null;
  relatedObjectType: string | null;
  relatedObjectId: string | null;
  valueGaps?: Array<{ kind: "COST" | "CONSTRUCTABILITY" | "CARBON"; title: string }>;
};

export type AttentionReviewSnap = {
  id: string;
  workPlanId: string;
  resultState: string;
  openConditionCount: number;
  targetTitle: string | null;
};

export type AttentionImpactSnap = {
  id: string;
  status: string;
  workflow: string;
  workPlanId: string | null;
  optionStudyNeedsDecision: boolean;
  constructionQuery: { queryId: string; queryType: string; summary: string } | null;
  sourceObjectId: string;
};

export type AttentionDecisionSnap = {
  id: string;
  title: string;
  approvalStatus: string;
};

export type AttentionInterfaceSnap = {
  id: string;
  title: string;
  status: string;
  providerDiscipline: string | null;
  consumerDiscipline: string | null;
  awaitingConsumerConfirmation: boolean;
};

export type AttentionEventSnap = {
  id: string;
  eventType: string;
  sourceObjectType: string;
  sourceObjectId: string;
  materiality: string;
  occurredAt: string;
};

export type AttentionProjectSnapshot = {
  projectId: string;
  projectName: string;
  lifecycleStage: string | null;
  workPlans: AttentionPlanSnap[];
  requirements: AttentionRequirementSnap[];
  reviews: AttentionReviewSnap[];
  impacts: AttentionImpactSnap[];
  decisions: AttentionDecisionSnap[];
  interfaces: AttentionInterfaceSnap[];
  events: AttentionEventSnap[];
};

export type AttentionViewer = {
  userId: string;
  tenantId: string;
  workspaceId: string;
  authorizedProjectIds: string[];
  role?: AttentionViewerRole | null;
  discipline?: string | null;
};

export type ResolveAttentionInput = {
  viewer: AttentionViewer;
  projects: AttentionProjectSnapshot[];
  acknowledgements?: Array<{ fingerprint: string; acknowledgedAt: string; snoozedUntil?: string | null }>;
  preferences?: Pick<AttentionPreference, "fyiDisplay" | "digestMode" | "mutedFyi">;
  nowIso?: string;
  filter?: { projectId?: string | null; category?: AttentionCategory | "ALL"; discipline?: string | null; lifecycle?: string | null };
};
