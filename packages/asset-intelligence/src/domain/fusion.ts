/**
 * Phase 10I — Multi-source fusion, reconciliation, predictive readiness models.
 */

import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type FusionSourceKind =
  | "condition"
  | "reliability"
  | "criticality"
  | "health"
  | "failure"
  | "trend"
  | "degradation"
  | "lifecycle"
  | "decision_context"
  | "risk_signal"
  | "maintenance_recommendation"
  | "priority"
  | "inspection_intelligence_public"
  | "project_intelligence_public";

export type FusionSourceContribution = {
  kind: FusionSourceKind;
  stateId?: string;
  contractVersion?: string;
  reviewStatus: string;
  status: "included" | "excluded" | "missing" | "conflicting";
  note?: string;
};

export type AssetFusionState = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  assetId: string;
  version: number;
  contributingSources: FusionSourceContribution[];
  missingSources: FusionSourceKind[];
  conflictingSources: FusionSourceKind[];
  reconciliationRef?: string;
  predictiveReadinessRef?: string;
  evidenceConfidenceRef?: string;
  trendConfidenceRef?: string;
  fusionClass:
    | "aligned"
    | "partial"
    | "conflicting"
    | "insufficient_evidence"
    | "abstained";
  method: "multi_source_fusion_v1";
  methodVersion: "1";
  confidence?: number;
  reviewStatus: string;
  reviewInstanceId?: string;
  provenance: Record<string, unknown>;
  limitations: string[];
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  supersedesId?: string;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  predictiveMlExecuted: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  isHealthFactor: false;
  createsCoreRisk: false;
  createsWorkOrder: false;
  mutatesCanonicalLifecycle: false;
};

export type ReconciliationOutcome =
  | "aligned"
  | "prefer_higher_authority"
  | "prefer_fresher"
  | "require_human_review"
  | "abstain_conflict";

export type SourceReconciliationRecord = {
  id: string;
  assetId: string;
  fusionStateRef: string;
  conflicts: Array<{
    dimension: FusionSourceKind | string;
    sourceA?: string;
    sourceB?: string;
    outcome: ReconciliationOutcome;
    rationale: string;
  }>;
  method: "source_reconciliation_v1";
  methodVersion: "1";
  reconciledAt: string;
  limitations: string[];
  autonomousResolutionForbidden: true;
};

export type PredictiveReadinessClass =
  | "sufficient"
  | "limited"
  | "insufficient"
  | "conflicting"
  | "not_ready";

export type PredictiveReadinessState = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  assetId: string;
  version: number;
  fusionStateRef: string;
  reconciliationRef?: string;
  readinessClass: PredictiveReadinessClass;
  readinessRationale: string[];
  evidenceConfidenceRef?: string;
  trendConfidenceRef?: string;
  method: "predictive_readiness_v1";
  methodVersion: "1";
  reviewStatus: string;
  reviewInstanceId?: string;
  provenance: Record<string, unknown>;
  limitations: string[];
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  supersedesId?: string;
  /** Explicit: readiness only — no predictive execution. */
  predictiveMlEnabled: false;
  predictiveMethodsCertified: false;
  predictiveMlExecuted: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  isHealthFactor: false;
};

export type FusionSourceInput = {
  kind: FusionSourceKind;
  stateId?: string;
  contractVersion?: string;
  reviewStatus: string;
  note?: string;
  authorityRank?: number;
  observedAt?: string;
  trendConfidence?: TrendConfidenceAssessment;
};

export type FusionComposeInput = {
  assetId: string;
  sources: FusionSourceInput[];
  evidenceConfidence: EvidenceConfidenceAssessment;
  assessedAt?: string;
};
