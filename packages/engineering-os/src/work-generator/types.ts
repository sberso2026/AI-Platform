import type { LifecycleStage } from "../lifecycle-intelligence/types";
import type { EngineeringWorkType, WorkReadinessState } from "../information-requirements/types";

export const WORK_GENERATOR_AI_BOUNDARY = {
  maySummarizeAvailableContext: true,
  mayExplainInformationGaps: true,
  maySuggestCandidateNextActions: true,
  mayDraftNonAuthoritativeNarrative: true,
  maySelectGoverningInformation: false,
  mayInventRequirements: false,
  mayInventEngineeringInputs: false,
  mayApproveWork: false,
  mayChooseTechnicalDesign: false,
  maySelectOptionStudyWinner: false,
  mayOverrideDeterministicReadiness: false,
} as const;

export const WORK_GENERATOR_PRIVACY = {
  personalFilesOutsideEos: true,
  unmanagedFilesCannotEnterPlan: true,
  employeeProductivityScoring: "PROHIBITED",
  timeAtDeskScoring: "PROHIBITED",
  workRateScoring: "PROHIBITED",
  newEventBusCreated: false,
  newGraphStoreCreated: false,
  actualXlsxGeneration: false,
  actualDocxGeneration: false,
  realSolverExecution: false,
} as const;

export const GENERATOR_WORK_TYPES = [
  "CONCEPT_STUDY",
  "OPTION_STUDY",
  "PRELIMINARY_SIZING",
  "DESIGN_CALCULATION",
  "ENGINEERING_ANALYSIS",
  "DESIGN_REPORT",
  "SPECIFICATION",
  "DESIGN_REVIEW",
  "CHANGE_ASSESSMENT",
  "RFI_TQ_RESPONSE",
  "COMMISSIONING_ENGINEERING",
  "HANDOVER_PREPARATION",
] as const;
export type GeneratorWorkType = (typeof GENERATOR_WORK_TYPES)[number];

export const WORK_PLAN_STATUSES = [
  "DRAFT",
  "READY",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
  "SUPERSEDED",
] as const;
export type WorkPlanStatus = (typeof WORK_PLAN_STATUSES)[number];

export const WORK_PLAN_STALENESS = ["CURRENT", "POTENTIALLY_STALE", "STALE", "REGENERATE_REQUIRED"] as const;
export type WorkPlanStaleness = (typeof WORK_PLAN_STALENESS)[number];

export const CONDITIONAL_START_POLICIES = ["REQUIRE_ACCEPTED_INPUTS", "ALLOW_WITH_ASSUMPTIONS"] as const;
export type ConditionalStartPolicy = (typeof CONDITIONAL_START_POLICIES)[number];

export const ACTION_AVAILABILITY = ["ENABLED", "AVAILABLE_CONTRACT", "DEFERRED_IMPLEMENTATION", "DISABLED"] as const;
export type ActionAvailability = (typeof ACTION_AVAILABILITY)[number];

export const EXPECTED_OUTPUT_TYPES = [
  "CALCULATION_WORKBOOK",
  "ANALYSIS_REQUEST",
  "DESIGN_REPORT",
  "SPECIFICATION",
  "DRAWING_INPUT",
  "OPTION_STUDY",
  "CONCEPT_STUDY",
  "REVIEW_PACKAGE",
  "RFI_RESPONSE",
  "TQ_RESPONSE",
  "HANDOVER_PACKAGE",
  "CHANGE_ASSESSMENT",
] as const;
export type ExpectedOutputType = (typeof EXPECTED_OUTPUT_TYPES)[number];

export const FUTURE_WORK_PLAN_ASSURANCE_CONDITIONS = [
  "WORK_PLAN_REQUIRED_INFORMATION_MISSING",
  "WORK_PLAN_GOVERNING_INFORMATION_STALE",
  "WORK_PLAN_CONTEXT_CHANGED",
] as const;

export type WorkReference = {
  objectType: string;
  objectId: string;
  code?: string | null;
  title: string;
  whyIncluded: string;
  stale?: boolean;
};

export type WorkActionContract = {
  code: string;
  label: string;
  availability: ActionAvailability;
  reason: string;
};

export type WorkPlanContext = {
  information: Array<{
    requirementId?: string | null;
    informationType: string;
    title: string;
    sourceObjectId?: string | null;
    purpose?: string | null;
    revision?: string | null;
    freshness?: string | null;
    authorityOutcome?: string | null;
    whyIncluded: string;
  }>;
  gaps: Array<{ kind: "missing" | "stale" | "unaccepted"; title: string; explanation: string }>;
  requirements: WorkReference[];
  assumptions: WorkReference[];
  interfaces: WorkReference[];
  decisions: WorkReference[];
  analyses: WorkReference[];
  deliverable?: WorkReference | null;
  handoverPackage?: WorkReference | null;
  expectedOutputs: Array<{ outputType: ExpectedOutputType; title: string; generated: false }>;
  actions: WorkActionContract[];
  conditions: string[];
};

export type WorkPlanContextSnapshot = {
  requirements: WorkReference[];
  assumptions: WorkReference[];
  interfaces: WorkReference[];
  decisions: WorkReference[];
  analyses: WorkReference[];
  information: WorkPlanContext["information"];
  gaps: WorkPlanContext["gaps"];
  deliverable?: WorkReference | null;
  handoverPackage?: WorkReference | null;
  threadRelationshipCount?: number;
};

export type EngineeringWorkTemplate = {
  id: string;
  code: string;
  name: string;
  version: string;
  workType: GeneratorWorkType;
  lifecycleStage: LifecycleStage;
  disciplines: string[];
  informationWorkType: EngineeringWorkType | null;
  requirementCategories: string[];
  expectedOutputs: ExpectedOutputType[];
  toolCapabilities: string[];
  reviewExpectation: string;
  conditionalStartPolicy: ConditionalStartPolicy;
  requireAcknowledgment: boolean;
  actionCodes: string[];
};

export type EngineeringWorkPlan = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workType: GeneratorWorkType;
  templateCode: string;
  templateVersion: string;
  discipline: string | null;
  systemId: string | null;
  assetId: string | null;
  lifecycleStage: LifecycleStage;
  relatedObjectType: string | null;
  relatedObjectId: string | null;
  relatedDeliverableId: string | null;
  relatedInterfaceId: string | null;
  relatedChangeId: string | null;
  status: WorkPlanStatus;
  readiness: WorkReadinessState | "BLOCKED";
  startAllowed: boolean;
  conditionsAcknowledged: boolean;
  staleness: WorkPlanStaleness;
  inputFingerprint: string;
  context: WorkPlanContext;
  explanations: {
    whyBlocked: string | null;
    whyConditional: string | null;
    templateProvenance: string;
    engineeringApproved: false;
    optionWinnerSelected: false;
  };
  generatedAt: string;
  generatedBy: string | null;
  supersedesPlanId: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metrics: {
    informationReferencesEvaluated: number;
    requirementsEvaluated: number;
    threadRelationshipsTraversed: number;
    readinessEvaluations: number;
    durationMs: number;
  };
};
