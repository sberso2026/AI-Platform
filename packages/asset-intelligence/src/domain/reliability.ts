/**
 * Phase 10D — Asset Reliability Intelligence (bounded).
 */

import type { Provenance } from "../architecture/identity-state";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";

export type ReliabilityAssessmentType =
  | "qualitative"
  | "semi_quantitative"
  | "quantitative";

export type ReliabilityLifecycleStatus =
  | "draft"
  | "calculated"
  | "pending_review"
  | "approved"
  | "rejected"
  | "published"
  | "superseded"
  | "archived";

export type ReliabilityMetricType =
  | "availability"
  | "mtbf"
  | "mttr"
  | "failure_rate"
  | "successful_operation_probability"
  | "observed_continuity"
  | "failure_frequency";

export type ReliabilityMetricDeclaration = {
  metricType: ReliabilityMetricType;
  status: "calculated" | "unavailable" | "abstained";
  value?: number;
  method?: string;
  units?: string;
  timeWindow?: string;
  populationContext?: string;
  dataSufficiency: "sufficient" | "insufficient";
  confidence?: number;
  assumptions: string[];
  limitations: string[];
  provenance?: Provenance;
};

export type AssetReliabilityStateRecord = {
  kind: "reliability";
  assetId: string;
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  silentIdentityMutationForbidden: true;
  assessmentType: ReliabilityAssessmentType;
  reliabilityClass?: string;
  reliabilityScore?: number;
  reliabilityConfidence?: number;
  reliabilityMethod?: string;
  evidenceWindow?: string;
  operatingWindow?: string;
  sourceRefs?: string[];
  failureHistoryRefs?: string[];
  inspectionRefs?: string[];
  reviewStatus: ReliabilityLifecycleStatus;
  reviewInstanceId?: string;
  assessedAt: string;
  reviewedAt?: string;
  publishedAt?: string;
  limitations: string[];
  metrics: ReliabilityMetricDeclaration[];
  evidenceConfidence?: EvidenceConfidenceAssessment;
  /** Qualitative must never be represented as a probability. */
  qualitativeAsProbabilityForbidden: true;
  quantitativeReliabilityCertified: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
  accuracyClaimsCertified: false;
};

export type ReliabilityAssessmentInput = {
  assetId: string;
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  assessmentType?: ReliabilityAssessmentType;
  reliabilityClass?: string;
  reliabilityScore?: number;
  reliabilityConfidence?: number;
  reliabilityMethod?: string;
  evidenceWindow?: string;
  operatingWindow?: string;
  sourceRefs?: string[];
  failureHistoryRefs?: string[];
  inspectionRefs?: string[];
  evidenceConfidence?: EvidenceConfidenceAssessment;
  /** Only when deterministic fixtures prove prerequisites. */
  quantitativeMetrics?: ReliabilityMetricDeclaration[];
  reviewStatus?: ReliabilityLifecycleStatus;
};

export function assessReliability(
  input: ReliabilityAssessmentInput,
): AssetReliabilityStateRecord {
  const evidence = input.evidenceConfidence;
  const insufficient =
    !evidence ||
    evidence.dataSufficiency === "insufficient" ||
    evidence.dataSufficiency === "conflicting" ||
    evidence.dataSufficiency === "stale" ||
    evidence.dataSufficiency === "revoked";

  if (insufficient) {
    return {
      kind: "reliability",
      assetId: input.assetId,
      stateId: input.stateId,
      recordedAt: input.recordedAt,
      provenance: {
        ...input.provenance,
        method: "abstain_insufficient_evidence",
      },
      silentIdentityMutationForbidden: true,
      assessmentType: input.assessmentType ?? "qualitative",
      reliabilityMethod: "abstain_insufficient_evidence",
      reviewStatus: "draft",
      assessedAt: input.recordedAt,
      limitations: [
        evidence?.abstentionReason ?? "insufficient_evidence",
        ...(evidence?.reasons ?? []),
      ],
      metrics: [],
      evidenceConfidence: evidence,
      sourceRefs: input.sourceRefs,
      inspectionRefs: input.inspectionRefs,
      failureHistoryRefs: input.failureHistoryRefs,
      qualitativeAsProbabilityForbidden: true,
      quantitativeReliabilityCertified: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      accuracyClaimsCertified: false,
    };
  }

  const assessmentType = input.assessmentType ?? "qualitative";
  const metrics =
    assessmentType === "quantitative"
      ? (input.quantitativeMetrics ?? []).map((m) =>
          m.dataSufficiency === "insufficient"
            ? { ...m, status: "unavailable" as const, value: undefined }
            : m,
        )
      : [];

  // Never invent quantitative values for qualitative assessments.
  if (assessmentType === "qualitative" && typeof input.reliabilityScore === "number") {
    // Score allowed only as semi_quantitative or quantitative.
  }

  const reliabilityScore =
    assessmentType === "qualitative" ? undefined : input.reliabilityScore;

  return {
    kind: "reliability",
    assetId: input.assetId,
    stateId: input.stateId,
    recordedAt: input.recordedAt,
    provenance: {
      ...input.provenance,
      method: input.reliabilityMethod ?? "governed_reliability_v1",
      confidence: input.reliabilityConfidence ?? evidence.score,
    },
    silentIdentityMutationForbidden: true,
    assessmentType,
    reliabilityClass: input.reliabilityClass,
    reliabilityScore,
    reliabilityConfidence: input.reliabilityConfidence ?? evidence.score,
    reliabilityMethod: input.reliabilityMethod ?? "governed_reliability_v1",
    evidenceWindow: input.evidenceWindow,
    operatingWindow: input.operatingWindow,
    sourceRefs: input.sourceRefs,
    failureHistoryRefs: input.failureHistoryRefs,
    inspectionRefs: input.inspectionRefs,
    reviewStatus: input.reviewStatus ?? "pending_review",
    assessedAt: input.recordedAt,
    limitations: [
      "advisory_only",
      "no_predictive_accuracy_claim",
      "no_pof_claim",
      "no_rul_claim",
    ],
    metrics,
    evidenceConfidence: evidence,
    qualitativeAsProbabilityForbidden: true,
    quantitativeReliabilityCertified: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    accuracyClaimsCertified: false,
  };
}

export function mapReliabilityClassToIndex(rating?: string): number | undefined {
  if (!rating) return undefined;
  const map: Record<string, number> = {
    high: 0.9,
    medium: 0.6,
    low: 0.3,
    unknown: 0.5,
  };
  return map[rating.toLowerCase()];
}
