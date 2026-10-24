import type { InformationPurpose, InformationType } from "../information-intelligence/types";
import type { LifecycleStage } from "../lifecycle-intelligence/types";

export const INFORMATION_REQUIREMENT_AI_BOUNDARY = {
  mayExplainMissingInformation: true,
  maySuggestRequiredInformation: true,
  mayAcceptForPurpose: false,
  mayApproveEngineering: false,
  mayAcceptHandover: false,
  mayInferTechnicalCorrectness: false,
  mayMarkDeliverableMatureFromInformation: false,
} as const;

export const INFORMATION_REQUIREMENT_TYPES = [
  "DESIGN_INPUT",
  "INTERFACE_INPUT",
  "VENDOR_DATA",
  "SURVEY_DATA",
  "GEOTECHNICAL_DATA",
  "LOAD_DATA",
  "DESIGN_CRITERIA",
  "MODEL_INPUT",
  "ANALYSIS_INPUT",
  "CONSTRUCTION_INFORMATION",
  "COMMISSIONING_INFORMATION",
  "HANDOVER_INFORMATION",
] as const;
export type InformationRequirementType = (typeof INFORMATION_REQUIREMENT_TYPES)[number];

export const INFORMATION_REQUIREMENT_STATUSES = [
  "PLANNED",
  "REQUESTED",
  "AWAITING_INFORMATION",
  "RECEIVED",
  "UNDER_REVIEW",
  "ACCEPTED_FOR_PURPOSE",
  "REJECTED",
  "SUPERSEDED",
  "NOT_APPLICABLE",
] as const;
export type InformationRequirementStatus = (typeof INFORMATION_REQUIREMENT_STATUSES)[number];

export const PROVIDER_CONSUMER_KINDS = [
  "DISCIPLINE",
  "VENDOR",
  "CONTRACTOR",
  "ENGINEERING",
  "CONSTRUCTION",
  "COMMISSIONING",
  "OPERATIONS",
  "PROJECT",
  "OWNER",
] as const;
export type ProviderConsumerKind = (typeof PROVIDER_CONSUMER_KINDS)[number];

export const WORK_READINESS_STATES = [
  "READY",
  "READY_WITH_CONDITIONS",
  "BLOCKED_INFORMATION_MISSING",
  "BLOCKED_INFORMATION_UNACCEPTED",
  "BLOCKED_INFORMATION_STALE",
  "UNKNOWN",
] as const;
export type WorkReadinessState = (typeof WORK_READINESS_STATES)[number];

export const HANDOVER_PACKAGE_STATES = [
  "DRAFT",
  "ASSEMBLING",
  "READY_FOR_REVIEW",
  "UNDER_REVIEW",
  "ACCEPTED",
  "REJECTED",
  "SUPERSEDED",
] as const;
export type HandoverPackageState = (typeof HANDOVER_PACKAGE_STATES)[number];

export const HANDOVER_COMPLETENESS_STATES = ["COMPLETE", "PARTIAL", "INCOMPLETE", "STALE", "CONFLICTED"] as const;
export type HandoverCompletenessState = (typeof HANDOVER_COMPLETENESS_STATES)[number];

export const ENGINEERING_WORK_TYPES = [
  "FOUNDATION_CALCULATION",
  "STRUCTURAL_ANALYSIS",
  "CROSS_DISCIPLINE_INTERFACE",
  "CONSTRUCTION_CLARIFICATION",
  "SUBSYSTEM_HANDOVER",
] as const;
export type EngineeringWorkType = (typeof ENGINEERING_WORK_TYPES)[number];

export const FUTURE_ASSURANCE_CONDITIONS = [
  "REQUIRED_INFORMATION_MISSING",
  "REQUIRED_INFORMATION_STALE",
  "REQUIRED_INFORMATION_UNACCEPTED",
  "HANDOVER_INFORMATION_MISSING",
  "HANDOVER_SOURCE_SUPERSEDED",
] as const;

export type EngineeringInformationRequirement = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  requirementType: InformationRequirementType;
  informationType: InformationType;
  purpose: InformationPurpose;
  title: string;
  whyRequired: string;
  providerKind: ProviderConsumerKind;
  providerDiscipline: string | null;
  providerOrg: string | null;
  providerRole: string | null;
  consumerKind: ProviderConsumerKind;
  consumerDiscipline: string | null;
  consumerOrg: string | null;
  consumerRole: string | null;
  systemId: string | null;
  assetId: string | null;
  packageId: string | null;
  interfaceId: string | null;
  deliverableId: string | null;
  lifecycleStage: LifecycleStage | null;
  neededBy: string | null;
  requiredForObjectType: string | null;
  requiredForObjectId: string | null;
  workType: EngineeringWorkType | null;
  acceptanceCriteriaRef: string | null;
  blocking: boolean;
  requireAuthoritative: boolean;
  requireManagedSource: boolean;
  status: InformationRequirementStatus;
  constructionRequestId: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InformationRequirementSatisfaction = {
  id: string;
  tenantId: string;
  workspaceId: string;
  requirementId: string;
  informationRefId: string;
  managedRepositoryId: string | null;
  unmanagedRejected: boolean;
  acceptedForPurpose: boolean;
  rejected: boolean;
  engineeringApproved: false;
  createdAt: string;
};

export type EngineeringHandoverPackage = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  displayName: string;
  systemId: string | null;
  assetId: string | null;
  discipline: string | null;
  lifecycleStage: LifecycleStage | null;
  state: HandoverPackageState;
  acceptedBy: string | null;
  acceptedAt: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HandoverPackageItem = {
  id: string;
  packageId: string;
  requirementId: string;
};

export type InformationRequirementTemplate = {
  id: string;
  workType: EngineeringWorkType;
  lifecycleStage: LifecycleStage;
  requirementType: InformationRequirementType;
  informationType: InformationType;
  purpose: InformationPurpose;
  providerKind: ProviderConsumerKind;
  providerDiscipline: string | null;
  consumerKind: ProviderConsumerKind;
  consumerDiscipline: string | null;
  blocking: boolean;
  requireAuthoritative: boolean;
  title: string;
  whyRequired: string;
};
