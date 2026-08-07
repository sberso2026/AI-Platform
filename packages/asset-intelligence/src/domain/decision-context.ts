/**
 * Phase 10H — Asset Decision Context (non-autonomous).
 */

import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type DecisionDimension =
  | "health"
  | "criticality"
  | "condition"
  | "reliability"
  | "failure"
  | "trend"
  | "degradation"
  | "lifecycle"
  | "evidence_confidence"
  | "trend_confidence";

export type DecisionContextClass =
  | "complete_enough"
  | "partial"
  | "insufficient_evidence"
  | "conflicting_context"
  | "abstained";

export type PublishedSliceRef = {
  kind: DecisionDimension | string;
  stateId?: string;
  reviewStatus: string;
  note?: string;
};

export type AssetDecisionContext = {
  id: string;
  assetId: string;
  snapshotId?: string;
  healthProfileRef?: string;
  criticalityStateRef?: string;
  conditionStateRef?: string;
  reliabilityStateRef?: string;
  failureStateRefs: string[];
  trendStateRefs: string[];
  degradationStateRefs: string[];
  lifecycleIntelligenceRef?: string;
  evidenceConfidenceRef?: string;
  trendConfidenceRef?: string;
  availableDimensions: DecisionDimension[];
  missingDimensions: DecisionDimension[];
  conflictingDimensions: DecisionDimension[];
  contributingSlices: PublishedSliceRef[];
  decisionContextClass: DecisionContextClass;
  method: "decision_context_compose_v1";
  methodVersion: "1";
  confidence?: number;
  limitations: string[];
  provenance: Record<string, unknown>;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  calculatedAt: string;
  /** Explicit: no autonomous decision authority. */
  autonomousDecisionAuthority: false;
  mutatesCanonicalLifecycle: false;
  createsCoreRisk: false;
  createsWorkOrder: false;
  calculatesPoF: false;
  calculatesRul: false;
  isHealthFactor: false;
};

export type DecisionContextSliceInput = {
  stateId: string;
  reviewStatus: string;
  note?: string;
  trendConfidence?: TrendConfidenceAssessment;
};

export type DecisionContextInput = {
  assetId: string;
  snapshotId?: string;
  healthProfileRef?: string;
  criticality?: DecisionContextSliceInput;
  condition?: DecisionContextSliceInput;
  reliability?: DecisionContextSliceInput;
  failures?: DecisionContextSliceInput[];
  trends?: DecisionContextSliceInput[];
  degradations?: DecisionContextSliceInput[];
  lifecycle?: DecisionContextSliceInput;
  evidenceConfidence: EvidenceConfidenceAssessment;
  assessedAt?: string;
};
