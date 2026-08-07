/**
 * Phase 10E — Failure Intelligence domain states.
 * Concepts remain distinct: mode / mechanism / cause / effect / consequence / detection / mitigation.
 */

import type { Provenance } from "../architecture/identity-state";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";

export type FailureLifecycleStatus =
  | "draft"
  | "calculated"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "superseded"
  | "archived";

export type CauseClassification =
  | "suspectedCause"
  | "contributingCause"
  | "confirmedCause"
  | "rootCause";

export type AssetFailureModeState = {
  kind: "failure_mode";
  stateId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  failureModeCode: string;
  failureModeLabel: string;
  taxonomyVersion: string;
  status: FailureLifecycleStatus;
  confidence?: number;
  method?: string;
  evidenceConfidenceRef?: string;
  evidenceRefs?: string[];
  sourceRefs?: string[];
  detectionMethodCode?: string;
  assessmentType: "qualitative" | "semi_quantitative";
  reviewStatus: FailureLifecycleStatus;
  reviewInstanceId?: string;
  detectedAt?: string;
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  limitations: string[];
  supersedesId?: string;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  probabilityOfFailureCertified: false;
  accuracyClaimsCertified: false;
  rulClaimsCertified: false;
  aiMayPublishForbidden: true;
};

export type AssetFailureMechanismState = {
  kind: "failure_mechanism";
  stateId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  mechanismCode: string;
  mechanismLabel: string;
  mechanismCategory?: string;
  taxonomyVersion: string;
  relatedFailureModeCodes: string[];
  confidence?: number;
  method?: string;
  evidenceRefs?: string[];
  evidenceConfidenceRef?: string;
  sourceRefs?: string[];
  reviewStatus: FailureLifecycleStatus;
  limitations: string[];
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  probabilityOfFailureCertified: false;
};

export type AssetFailureCauseState = {
  kind: "failure_cause";
  stateId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  causeCode: string;
  causeLabel: string;
  classification: CauseClassification;
  taxonomyVersion: string;
  relatedFailureModeCodes: string[];
  relatedMechanismCodes: string[];
  confidence?: number;
  method?: string;
  evidenceRefs?: string[];
  evidenceConfidenceRef?: string;
  alternativeCauses: string[];
  rootCauseConfidence?: number;
  rootCauseMethod?: string;
  supportingEvidence?: string[];
  reviewStatus: FailureLifecycleStatus;
  limitations: string[];
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  /** Root cause requires governed human approval. */
  rootCauseRequiresHumanApproval: true;
  aiAutonomousRootCauseForbidden: true;
  probabilityOfFailureCertified: false;
};

export type AssetFailureEffectState = {
  kind: "failure_effect";
  stateId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  effectCode: string;
  effectLabel: string;
  effectKind: "localEffect" | "systemEffect" | "functionalEffect" | "operationalEffect";
  taxonomyVersion: string;
  relatedFailureModeCodes: string[];
  reviewStatus: FailureLifecycleStatus;
  limitations: string[];
  assessedAt: string;
};

export type AssetFailureConsequenceState = {
  kind: "failure_consequence";
  stateId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  consequenceCode: string;
  consequenceLabel: string;
  dimensions: Array<
    "safety" | "production" | "environment" | "financial" | "operational" | "regulatory" | "mission"
  >;
  taxonomyVersion: string;
  relatedFailureModeCodes: string[];
  /** Signal only — not Engineering Core risk record. */
  createsCanonicalRiskRecord: false;
  reviewStatus: FailureLifecycleStatus;
  limitations: string[];
  assessedAt: string;
};

export type FailureRelationship = {
  relationshipId: string;
  relationshipType:
    | "mode_has_mechanism"
    | "mode_has_cause"
    | "mode_has_effect"
    | "mode_has_consequence"
    | "mechanism_has_cause";
  fromKind: string;
  fromCode: string;
  toKind: string;
  toCode: string;
  taxonomyVersion: string;
  version: number;
};

export type FailureAssessmentInput = {
  assetId: string;
  stateIdPrefix?: string;
  recordedAt: string;
  provenance: Provenance;
  failureModeCode: string;
  mechanismCode?: string;
  causeCode?: string;
  causeClassification?: CauseClassification;
  effectCode?: string;
  effectKind?: AssetFailureEffectState["effectKind"];
  consequenceCode?: string;
  consequenceDimensions?: AssetFailureConsequenceState["dimensions"];
  detectionMethodCode?: string;
  evidenceRefs?: string[];
  sourceRefs?: string[];
  evidenceConfidence?: EvidenceConfidenceAssessment;
  alternativeCauses?: string[];
  startReview?: boolean;
};

export type FailureAssessmentBundle = {
  failureMode: AssetFailureModeState;
  mechanism?: AssetFailureMechanismState;
  cause?: AssetFailureCauseState;
  effect?: AssetFailureEffectState;
  consequence?: AssetFailureConsequenceState;
  relationships: FailureRelationship[];
  abstained: boolean;
  abstentionReason?: string;
};
