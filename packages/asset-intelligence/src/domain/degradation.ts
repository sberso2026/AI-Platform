/**
 * Phase 10F — Trend + Governed Degradation domain states.
 */

import type { Provenance } from "../architecture/identity-state";
import type { ChangeDetectionResult } from "./change-detection";
import type { TrendConfidenceAssessment } from "./trend-confidence";
import type { EngineeringTimeSeries } from "./time-series";

export type TrendLifecycleStatus =
  | "draft"
  | "calculated"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "superseded"
  | "archived";

export type TrendDirection = "improving" | "stable" | "degrading" | "indeterminate";

export type AssetTrendState = {
  kind: "trend";
  stateId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  seriesId: string;
  attributeKey: string;
  trendDirection: TrendDirection;
  trendClass: "qualitative" | "semi_quantitative";
  slopeHint?: number;
  windowStart?: string;
  windowEnd?: string;
  method: string;
  confidence?: number;
  trendConfidenceRef?: string;
  changeDetectionRef?: string;
  evidenceRefs?: string[];
  sourceRefs?: string[];
  reviewStatus: TrendLifecycleStatus;
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  limitations: string[];
  trendConfidence?: TrendConfidenceAssessment;
  changeDetection?: ChangeDetectionResult;
  predictiveMlUsed: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  aiMayPublishForbidden: true;
};

export type AssetDegradationState = {
  kind: "degradation";
  stateId: string;
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  seriesId?: string;
  trendStateId?: string;
  changeDetectionId?: string;
  /** Optional context from published failure intelligence — never auto-sole source. */
  relatedFailureModeCodes?: string[];
  degradationDirection: TrendDirection;
  degradationClass: "qualitative" | "semi_quantitative";
  severityHint?: "none" | "low" | "moderate" | "high" | "indeterminate";
  mechanismContext?: string;
  method: string;
  confidence?: number;
  trendConfidenceRef?: string;
  evidenceConfidenceRef?: string;
  evidenceRefs?: string[];
  sourceRefs?: string[];
  reviewStatus: TrendLifecycleStatus;
  reviewInstanceId?: string;
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  limitations: string[];
  supersedesId?: string;
  predictiveMlUsed: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
  aiMayPublishForbidden: true;
  /** Distinct from Failure Mode identification. */
  isFailureModeClaim: false;
};

export type TrendDegradationAssessmentInput = {
  assetId: string;
  recordedAt: string;
  provenance: Provenance;
  series: EngineeringTimeSeries;
  evidenceRefs?: string[];
  sourceRefs?: string[];
  relatedFailureModeCodes?: string[];
  mechanismContext?: string;
  startReview?: boolean;
  trendConfidence?: TrendConfidenceAssessment;
  evidenceConfidenceRef?: string;
};

export type TrendDegradationBundle = {
  series: EngineeringTimeSeries;
  trend: AssetTrendState;
  degradation: AssetDegradationState;
  changeDetection: ChangeDetectionResult;
  trendConfidence: TrendConfidenceAssessment;
  abstained: boolean;
  abstentionReason?: string;
};
