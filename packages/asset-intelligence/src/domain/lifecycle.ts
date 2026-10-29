/**
 * Phase 10G — Asset Lifecycle Intelligence domain states.
 */

import type { Provenance } from "../architecture/identity-state";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type {
  AssetLifecycleReference,
  MaintenanceState,
  OperatingState,
} from "./lifecycle-reference";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type LifecycleIntelligenceLifecycleStatus =
  | "draft"
  | "calculated"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "superseded"
  | "archived";

export type LifecycleContextClass =
  | "normal_operational_context"
  | "ageing_context"
  | "degradation_attention"
  | "life_extension_assessment_recommended"
  | "replacement_assessment_recommended"
  | "insufficient_evidence"
  | "conflicting_context";

export type LifecycleSliceContribution = {
  kind:
    | "condition"
    | "reliability"
    | "criticality_context"
    | "failure"
    | "trend"
    | "degradation"
    | "canonical_lifecycle";
  stateId?: string;
  status: "published" | "approved" | "missing" | "excluded" | "conflicting";
  note?: string;
};

export type AssetLifecycleIntelligenceState = {
  kind: "lifecycle_intelligence";
  stateId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  canonicalLifecycleRef: AssetLifecycleReference;
  lifecycleContextClass: LifecycleContextClass;
  lifecycleContextCode: string;
  lifecycleContextRationale: string[];
  operatingState?: OperatingState;
  maintenanceState?: MaintenanceState;
  conditionStateRef?: string;
  reliabilityStateRef?: string;
  failureStateRefs: string[];
  trendStateRefs: string[];
  degradationStateRefs: string[];
  contributingSlices: LifecycleSliceContribution[];
  missingSlices: string[];
  conflictingSlices: string[];
  evidenceConfidenceRef?: string;
  trendConfidenceRef?: string;
  confidence?: number;
  method: string;
  methodVersion: string;
  reviewStatus: LifecycleIntelligenceLifecycleStatus;
  reviewInstanceId?: string;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  limitations: string[];
  supersedesId?: string;
  /** Service age is context only — never sole basis for claims. */
  serviceAgeContext?: {
    commissionedAt?: string;
    serviceAgeDays?: number;
    designLifeReference?: string;
    ageAloneDoesNotDetermineCondition: true;
    ageAloneDoesNotDetermineDegradation: true;
    ageAloneDoesNotDetermineRul: true;
  };
  mutatesCanonicalLifecycle: false;
  isHealthFactor: false;
  predictiveMlUsed: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  aiMayPublishForbidden: true;
};

export type LifecycleTransitionCandidate = {
  kind: "lifecycle_transition_candidate";
  candidateId: string;
  assetId: string;
  code: string;
  label: string;
  rationale: string[];
  lifecycleIntelligenceStateId: string;
  recommendedReview?: string;
  status: "proposed" | "accepted" | "rejected" | "withdrawn";
  mutatesCanonicalLifecycle: false;
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionReason?: string;
};

export type LifecycleContextInput = {
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  canonicalLifecycle: AssetLifecycleReference;
  operatingState?: OperatingState;
  maintenanceState?: MaintenanceState;
  condition?: { stateId: string; reviewStatus: string; rating?: string };
  reliability?: { stateId: string; reviewStatus: string; rating?: string };
  criticality?: { stateId: string; reviewStatus: string; rating?: string };
  failures?: Array<{ stateId: string; reviewStatus: string; code?: string }>;
  trends?: Array<{
    stateId: string;
    reviewStatus: string;
    direction?: string;
    trendConfidence?: TrendConfidenceAssessment;
  }>;
  degradations?: Array<{
    stateId: string;
    reviewStatus: string;
    direction?: string;
    trendConfidence?: TrendConfidenceAssessment;
  }>;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  commissionedAt?: string;
  designLifeReference?: string;
  startReview?: boolean;
};
