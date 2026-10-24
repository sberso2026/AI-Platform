/**
 * Phase 10H — Risk Signal + Risk Candidate models.
 */

import type { AssetDecisionContext } from "./decision-context";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { TrendConfidenceAssessment } from "./trend-confidence";

export type RiskSignalClass =
  | "normal_context"
  | "attention"
  | "elevated_attention"
  | "consequence_sensitive"
  | "insufficient_evidence"
  | "conflicting_context";

export type AssetRiskSignalState = {
  id: string;
  tenantId?: string;
  workspaceId?: string;
  assetId: string;
  version: number;
  riskSignalClass: RiskSignalClass;
  riskSignalCategory: "advisory_context";
  decisionContextRef: string;
  healthContextRef?: string;
  criticalityContextRef?: string;
  failureContextRefs: string[];
  degradationContextRefs: string[];
  lifecycleContextRef?: string;
  evidenceConfidenceRef?: string;
  trendConfidenceRef?: string;
  consequenceContext?: string;
  exposureContext?: string;
  confidence?: number;
  method: "risk_signal_compose_v1";
  methodVersion: "1";
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
  /** Explicit locks */
  probabilityOfFailureCertified: false;
  createsCoreRisk: false;
  isHealthFactor: false;
  mutatesCanonicalLifecycle: false;
};

export type AssetRiskCandidate = {
  candidateId: string;
  assetId: string;
  riskSignalRef: string;
  title: string;
  description: string;
  consequenceContext?: string;
  evidenceRefs: string[];
  confidence?: number;
  limitations: string[];
  createdAt: string;
  status: "proposed" | "accepted" | "rejected" | "withdrawn";
  /** Never auto-mutates Engineering Core. */
  autoMutatesCoreRisk: false;
  requiresHumanGatedAdapter: true;
};

export type RiskSignalInput = {
  decisionContext: AssetDecisionContext;
  evidenceConfidence: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  assessedAt?: string;
  actorId?: string;
};
