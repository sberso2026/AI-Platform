/**
 * EOS-A9C Deliverable & Engineering Maturity Intelligence.
 * A Deliverable is a governed engineering expectation, not a Document.
 * Maturity is purpose-specific evidence. It is not approval, safety, or compliance.
 */

import type { LifecycleCompleteness, LifecycleScopeType, LifecycleStage } from "../lifecycle-intelligence/types";

export type { LifecycleCompleteness, LifecycleScopeType, LifecycleStage };

export const DELIVERABLE_JOB_TYPE = "engineering.deliverable.evaluate" as const;

export const DELIVERABLE_REQUIREMENT_STATES = ["REQUIRED", "OPTIONAL", "NOT_APPLICABLE"] as const;
export type DeliverableRequirementState = (typeof DELIVERABLE_REQUIREMENT_STATES)[number];

export const DELIVERABLE_ARTIFACT_ROLES = [
  "PRIMARY",
  "SUPPORTING",
  "EVIDENCE",
  "MODEL",
  "CALCULATION",
  "REVIEW",
  "DECISION",
  "CONFIGURATION",
] as const;
export type DeliverableArtifactRole = (typeof DELIVERABLE_ARTIFACT_ROLES)[number];

export const DELIVERABLE_ARTIFACT_CLASSES = [
  "document",
  "analysis_result",
  "review_package",
  "decision",
  "configuration_baseline",
  "interface",
  "requirement",
  "assumption",
  "model",
  "register",
  "dataset",
] as const;
export type DeliverableArtifactClass = (typeof DELIVERABLE_ARTIFACT_CLASSES)[number];

export const MATURITY_DIMENSIONS = [
  "CONTENT",
  "TRACEABILITY",
  "COORDINATION",
  "REVIEW",
  "CONFIGURATION",
  "SUPPORTING_EVIDENCE",
] as const;
export type MaturityDimension = (typeof MATURITY_DIMENSIONS)[number];

export const MATURITY_DIMENSION_STATES = [
  "NOT_EVALUATED",
  "SATISFIED",
  "PARTIAL",
  "NOT_SATISFIED",
  "NOT_APPLICABLE",
  "UNKNOWN",
] as const;
export type MaturityDimensionState = (typeof MATURITY_DIMENSION_STATES)[number];

export const MATURITY_PURPOSES = [
  "FOR_INTERNAL_COORDINATION",
  "FOR_ENGINEERING_REVIEW",
  "FOR_BASELINE",
  "FOR_CONSTRUCTION_USE",
  "FOR_COMMISSIONING",
  "FOR_OPERATIONS",
] as const;
export type MaturityPurpose = (typeof MATURITY_PURPOSES)[number];

export const DELIVERABLE_READINESS = [
  "NOT_EVALUATED",
  "INCOMPLETE",
  "PARTIAL",
  "READY_FOR_REVIEW",
  "READY_FOR_CONFIGURED_PURPOSE",
  "STALE",
  "FAILED",
] as const;
export type DeliverableReadiness = (typeof DELIVERABLE_READINESS)[number];

export const DELIVERABLE_EVIDENCE_MODES = ["CANONICAL", "TEST_FIXTURE"] as const;
export type DeliverableEvidenceMode = (typeof DELIVERABLE_EVIDENCE_MODES)[number];

export const DELIVERABLE_CATALOG_ORIGINS = ["TEMPLATE", "EXAMPLE", "PROJECT_CONFIGURED"] as const;
export type DeliverableCatalogOrigin = (typeof DELIVERABLE_CATALOG_ORIGINS)[number];

export const DOCUMENT_STATUS_SEMANTICS = [
  "WORK_IN_PROGRESS",
  "FOR_COORDINATION",
  "FOR_REVIEW",
  "FOR_APPROVAL",
  "AUTHORIZED_FOR_CONFIGURED_USE",
  "FOR_CONSTRUCTION_USE",
  "RECORD",
  "SUPERSEDED",
  "VOID",
  "UNMAPPED",
] as const;
export type DocumentStatusSemantic = (typeof DOCUMENT_STATUS_SEMANTICS)[number];

export const ARTIFACT_REVISION_POLICIES = [
  "EXACT_REVISION",
  "CURRENT_EFFECTIVE_REVISION",
  "BASELINE_PINNED_REVISION",
] as const;
export type ArtifactRevisionPolicy = (typeof ARTIFACT_REVISION_POLICIES)[number];

export const DELIVERABLE_AI_BOUNDARY = {
  mayEvaluateMaturity: true,
  mayExplainDimensions: true,
  mayApproveDeliverable: false,
  mayIssueIfc: false,
  maySetMatureTrue: false,
  mayCreateAuthoritativeExpectations: false,
} as const;

export type DeliverableDefinition = {
  definitionId: string;
  definitionVersion: string;
  code: string;
  name: string;
  purpose: string;
  origin: DeliverableCatalogOrigin;
  artifactClasses: readonly DeliverableArtifactClass[];
  responsibleDiscipline: string;
  contributingDisciplines: readonly string[];
  lifecycleStages: readonly LifecycleStage[];
  multidisciplinary: boolean;
  requiredRoles: readonly DeliverableArtifactRole[];
  coordinationRequired: boolean;
  analysisRequired: boolean;
  reviewRequired: boolean;
  traceabilityRequired: boolean;
  configurationRequired: boolean;
};

export type DeliverableMaturityProfile = {
  profileId: string;
  profileVersion: string;
  name: string;
  origin: DeliverableCatalogOrigin;
  dimensions: readonly MaturityDimension[];
  requiredDimensionsByPurpose: Partial<Record<MaturityPurpose, readonly MaturityDimension[]>>;
};

export type DeliverableExpectation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  definitionId: string;
  definitionVersion: string;
  definitionCode: string;
  lifecycleProfileId: string;
  lifecycleProfileVersion: string;
  lifecycleStage: LifecycleStage;
  scopeType: LifecycleScopeType;
  scopeId: string;
  requirementState: DeliverableRequirementState;
  intendedPurpose: MaturityPurpose;
  maturityProfileId: string;
  maturityProfileVersion: string;
  responsibleDiscipline: string;
  contributingDisciplines: string[];
  scheduleObjectId?: string | null;
  scheduleStatus?: "planned" | "active" | "complete" | null;
  origin: "LIFECYCLE_PROFILE" | "PROJECT_CONFIGURATION" | "DISCIPLINE_CONFIGURATION" | "HUMAN_GOVERNED";
  adoptedFromTemplate?: boolean;
  createdBy: string;
  createdAt: string;
};

export type DeliverableArtifactBinding = {
  id: string;
  tenantId: string;
  workspaceId: string;
  expectationId: string;
  artifactClass: DeliverableArtifactClass;
  artifactId: string;
  artifactRole: DeliverableArtifactRole;
  revisionRef?: string | null;
  revisionPolicy?: ArtifactRevisionPolicy;
  resolvedRevision?: string | null;
  rawStatusCode?: string | null;
  mappedSemantic?: DocumentStatusSemantic | null;
  mappingVersion?: string | null;
  baselineId?: string | null;
  boundBy: string;
  boundAt: string;
};

export type MaturityDimensionResult = {
  dimension: MaturityDimension;
  state: MaturityDimensionState;
  expected: string;
  actual: string;
  explanation: string;
  evidenceRefs: Array<{ objectType: string; objectId: string; note?: string }>;
  sourceCompleteness: LifecycleCompleteness;
  waived?: boolean;
  waiverId?: string | null;
};

export type DeliverableAssuranceSignal = {
  conditionType:
    | "EXPECTED_DELIVERABLE_MISSING"
    | "DELIVERABLE_REQUIRED_REVIEW_MISSING"
    | "DELIVERABLE_REFERENCES_STALE_EVIDENCE"
    | "DELIVERABLE_CONFIGURATION_GAP"
    | "DELIVERABLE_INTERFACE_COORDINATION_GAP"
    | "UNMAPPED_REQUIRED_DOCUMENT_STATUS"
    | "BOUND_ARTIFACT_REVISION_SUPERSEDED"
    | "REQUIRED_BASELINE_REVISION_MISMATCH";
  explanation: string;
};

export type DeliverableAssessment = {
  id: string;
  tenantId: string;
  workspaceId: string;
  expectationId: string;
  maturityProfileId: string;
  maturityProfileVersion: string;
  intendedPurpose: MaturityPurpose;
  completeness: LifecycleCompleteness;
  readiness: DeliverableReadiness;
  truncated: boolean;
  stale: boolean;
  evidenceSource: DeliverableEvidenceMode;
  evidenceFingerprint: string;
  dimensions: MaturityDimensionResult[];
  artifactRefs: Array<{ artifactClass: string; artifactId: string; role: string }>;
  assuranceSignals: DeliverableAssuranceSignal[];
  digitalThread: string;
  waiverIds: string[];
  reason?: string | null;
  assessedAt: string;
  harvestedAt: string;
};

export type DeliverableWaiver = {
  id: string;
  tenantId: string;
  workspaceId: string;
  expectationId: string;
  assessmentId: string;
  dimension: MaturityDimension;
  rationale: string;
  actorId: string;
  supportingDecisionId?: string | null;
  supportingReviewId?: string | null;
  waivedAt: string;
};

export type DeliverableProfileSetting = {
  id?: string;
  tenantId: string;
  workspaceId: string;
  enabledDefinitionIds: string[] | null;
  maturityProfileId: string;
  maturityProfileVersion: string;
  configuredBy: string;
  configuredAt: string;
};

export type DeliverableCanonicalFacts = {
  truncated?: boolean;
  failed?: boolean;
  failureReason?: string | null;
  primaryPresent: boolean;
  boundCount: number;
  reviewPresent: boolean;
  reviewComplete: boolean;
  analysisPresent: boolean;
  analysisValid: boolean;
  analysisReviewed: boolean;
  analysisStale: boolean;
  baselineFrozen: boolean;
  requirementLinked: boolean;
  interfacesComplete: boolean;
  contributingIdentified: boolean;
  assumptionInvalidated: boolean;
  documentBound: boolean;
  resolvedRevision?: string | null;
  revisionPolicy?: ArtifactRevisionPolicy | null;
  rawStatusCode?: string | null;
  mappedSemantic?: DocumentStatusSemantic | null;
  mappingVersion?: string | null;
  revisionSuperseded?: boolean;
  revisionVoid?: boolean;
  revisionResolved?: boolean;
  baselineRevisionMatch?: boolean | null;
  artifactStates: Array<{ artifactClass: string; artifactId: string; state: string; revision?: string | null }>;
};

export type DocumentStatusMapping = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId?: string | null;
  sourceSystem: string;
  rawStatusCode: string;
  semantic: Exclude<DocumentStatusSemantic, "UNMAPPED">;
  mappingVersion: string;
  enabled: boolean;
  description?: string | null;
  configuredBy: string;
  configuredAt: string;
};

export type ProjectDeliverableDefinition = DeliverableDefinition & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  rationale?: string | null;
  createdBy: string;
  createdAt: string;
};

export type DeliverableLifecycleSummary = {
  composed: true;
  truncated?: boolean;
  failed?: boolean;
  required: Array<{
    expectationId: string;
    definitionCode: string;
    bound: boolean;
    readiness: DeliverableReadiness;
    completeness: LifecycleCompleteness;
    stale: boolean;
    waived: boolean;
  }>;
};
