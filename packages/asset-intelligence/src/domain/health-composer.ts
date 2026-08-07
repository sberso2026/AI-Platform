/**
 * Phase 10D — Health Composition Engine (versioned).
 *
 * v1 (historical Phase 10C): compose_condition_criticality_v1 — auditable, not mutated.
 * v2 (default Phase 10D): compose_condition_reliability_v2 — criticality is CONTEXT only.
 *
 * Health Index remains state/output; this engine owns composition scoring.
 */

import type { Provenance } from "../architecture/identity-state";
import { mapCriticalityRatingToWeight } from "./criticality";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import { computeEvidenceSufficiency } from "./evidence-sufficiency";
import {
  HEALTH_INDEX_DEFAULT,
  mapConditionRatingToIndex,
  type AssetHealthIndexState,
  type HealthCompositionFactor,
} from "./health-index";
import type { AssetHealthProfile } from "./health-profile";
import { mapReliabilityClassToIndex } from "./reliability";

export type HealthCompositionMethod =
  | "compose_condition_criticality_v1"
  | "compose_from_condition_v1"
  | "compose_condition_reliability_v2"
  | "compose_condition_criticality_reliability_v1"
  /** Reserved — not enabled in Phase 10E (FAILURE_CONTRIBUTION_TO_HEALTH_ENABLED = false). */
  | "compose_condition_reliability_failure_v3"
  | "abstain_insufficient_evidence";

/** Default for new compositions in Phase 10D+. */
export const DEFAULT_HEALTH_COMPOSITION_METHOD: HealthCompositionMethod =
  "compose_condition_reliability_v2";

export const CRITICALITY_IS_HEALTH_FACTOR_V2 = false as const;

/** Phase 10E — failure does not contribute to Health Index until explicitly enabled via v3. */
export const FAILURE_CONTRIBUTION_TO_HEALTH_ENABLED = false as const;
export const FAILURE_HEALTH_COMPOSITION_METHOD_RESERVED =
  "compose_condition_reliability_failure_v3" as const;
/** Phase 10F — degradation/trend must not contribute to Health Index yet. */
export const DEGRADATION_HEALTH_CONTRIBUTION_ENABLED = false as const;

export type HealthCompositionInput = {
  assetId: string;
  tenantId?: string;
  workspaceId?: string;
  stateId: string;
  profileId?: string;
  recordedAt: string;
  provenance: Provenance;
  /** Explicit method; defaults to v2. Historical replay may request v1. */
  compositionMethod?: HealthCompositionMethod;
  condition?: {
    rating?: string;
    index?: number;
    confidence?: number;
    trend?: string;
    stateId?: string;
    evidenceRefs?: string[];
    observedAt?: string;
  };
  criticality?: {
    rating?: string;
    confidence?: number;
    stateId?: string;
    reviewStatus?: string;
    evidenceRefs?: string[];
  };
  reliability?: {
    rating?: string;
    continuity?: number;
    confidence?: number;
    stateId?: string;
    reviewStatus?: string;
    evidenceRefs?: string[];
    evidenceSufficient?: boolean;
  };
  evidenceConfidence?: EvidenceConfidenceAssessment;
  sourceKeys?: string[];
};

export type HealthCompositionResult = {
  healthIndex: AssetHealthIndexState;
  healthProfile: AssetHealthProfile;
};

export type HealthComposer = {
  readonly kind: "health_composition_engine";
  compose(input: HealthCompositionInput): HealthCompositionResult;
};

export class HealthCompositionEngine implements HealthComposer {
  readonly kind = "health_composition_engine" as const;

  compose(input: HealthCompositionInput): HealthCompositionResult {
    const method =
      input.compositionMethod ?? DEFAULT_HEALTH_COMPOSITION_METHOD;

    if (method === "compose_condition_reliability_failure_v3") {
      if (!FAILURE_CONTRIBUTION_TO_HEALTH_ENABLED) {
        throw new Error("failure_health_contribution_disabled");
      }
      // Reserved for a later certified composition — unreachable while disabled.
      throw new Error("failure_health_composition_v3_not_implemented");
    }

    if (
      method === "compose_condition_criticality_v1" ||
      method === "compose_from_condition_v1" ||
      method === "compose_condition_criticality_reliability_v1"
    ) {
      return composeV1Historical(input, method);
    }

    return composeV2(input);
  }
}

export function createHealthCompositionEngine(): HealthCompositionEngine {
  return new HealthCompositionEngine();
}

export function composeAdvisoryHealthIndex(
  input: HealthCompositionInput,
): AssetHealthIndexState {
  return createHealthCompositionEngine().compose(input).healthIndex;
}

/** Backward-compatible condition-only entry used by Phase 10B tests. */
export function deriveAdvisoryHealthIndex(input: {
  assetId: string;
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
  conditionRating?: string;
  conditionIndex?: number;
  conditionConfidence?: number;
  conditionTrend?: string;
  conditionStateId?: string;
}): AssetHealthIndexState {
  return composeAdvisoryHealthIndex({
    assetId: input.assetId,
    stateId: input.stateId,
    recordedAt: input.recordedAt,
    provenance: input.provenance,
    compositionMethod: "compose_condition_reliability_v2",
    sourceKeys: [input.provenance.sourceSystem],
    condition: {
      rating: input.conditionRating,
      index: input.conditionIndex,
      confidence: input.conditionConfidence,
      trend: input.conditionTrend,
      stateId: input.conditionStateId,
      evidenceRefs: input.provenance.evidenceRefs,
      observedAt: input.provenance.observedAt,
    },
  });
}

function composeV2(input: HealthCompositionInput): HealthCompositionResult {
  const factors: HealthCompositionFactor[] = [];
  const sourceRefs: string[] = [...(input.provenance.evidenceRefs ?? [])];
  const scores: number[] = [];
  const weights: number[] = [];
  const limitations: string[] = [];

  const conditionPresent =
    input.condition?.rating !== undefined ||
    input.condition?.index !== undefined ||
    (input.condition?.evidenceRefs?.length ?? 0) > 0;

  let conditionContribution: number | undefined;
  if (conditionPresent) {
    const idx =
      typeof input.condition?.index === "number"
        ? input.condition.index
        : mapConditionRatingToIndex(input.condition?.rating);
    if (typeof idx === "number") {
      factors.push("condition");
      scores.push(idx);
      weights.push(0.55);
      conditionContribution = idx;
      if (input.condition?.stateId) sourceRefs.push(`condition:${input.condition.stateId}`);
    }
  }

  let reliabilityContribution: number | "unavailable" = "unavailable";
  const reliabilityOk =
    input.reliability?.evidenceSufficient !== false &&
    (input.reliability?.rating !== undefined ||
      typeof input.reliability?.continuity === "number");
  if (reliabilityOk) {
    const idx =
      typeof input.reliability?.continuity === "number"
        ? input.reliability.continuity
        : mapReliabilityClassToIndex(input.reliability?.rating);
    if (typeof idx === "number") {
      factors.push("reliability");
      scores.push(idx);
      weights.push(0.45);
      reliabilityContribution = idx;
      if (input.reliability?.stateId) {
        sourceRefs.push(`reliability:${input.reliability.stateId}`);
      }
    }
  } else {
    limitations.push("reliability_unavailable");
  }

  // Criticality is CONTEXT only in v2 — never a health scoring factor.
  const criticalityContext = input.criticality
    ? {
        criticalityClass: input.criticality.rating,
        criticalityScore: mapCriticalityRatingToWeight(input.criticality.rating),
        isHealthFactor: false as const,
      }
    : undefined;
  if (input.criticality?.stateId) {
    sourceRefs.push(`criticality_context:${input.criticality.stateId}`);
  }

  const evidence =
    input.evidenceConfidence ??
    ({
      assessmentId: `ec_inline_${input.stateId}`,
      assetId: input.assetId,
      scope: "health_composition",
      score: computeEvidenceSufficiency({
        evidenceRefs: sourceRefs,
        sourceKeys: input.sourceKeys,
        observedAt: input.condition?.observedAt ?? input.provenance.observedAt,
        asOf: input.recordedAt,
        reviewStatus: input.reliability?.reviewStatus ?? input.criticality?.reviewStatus,
        confidenceHint: input.condition?.confidence,
      }).sufficiencyScore,
      confidenceClass: "medium" as const,
      confidence: 0.5,
      sourceCount: sourceRefs.length,
      sourceDiversity: 0.5,
      freshness: 0.5,
      reviewCompleteness: 0.5,
      conflictState: "none" as const,
      lineageIntegrity: "unknown" as const,
      dataSufficiency: "limited" as const,
      method: "evidence_confidence_v1" as const,
      methodVersion: "1" as const,
      assessedAt: input.recordedAt,
      reasons: [],
      engineeringCorrectnessClaimed: false as const,
    } satisfies EvidenceConfidenceAssessment);

  const evidenceOk =
    evidence.dataSufficiency === "sufficient" ||
    evidence.dataSufficiency === "limited";

  if (factors.length === 0 || !evidenceOk) {
    const healthIndex = abstainIndex(input, sourceRefs, factors, evidence);
    const healthProfile = toProfile(input, healthIndex, {
      conditionContribution,
      reliabilityContribution,
      criticalityContext,
      limitations: [
        ...limitations,
        evidence.abstentionReason ?? "insufficient_evidence",
      ],
      evidence,
      method: "abstain_insufficient_evidence",
    });
    return { healthIndex, healthProfile };
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const overallHealth = scores.reduce(
    (acc, s, i) => acc + s * (weights[i]! / totalWeight),
    0,
  );
  const method: HealthCompositionMethod = "compose_condition_reliability_v2";

  const healthIndex: AssetHealthIndexState = {
    kind: "health_index",
    assetId: input.assetId,
    stateId: input.stateId,
    recordedAt: input.recordedAt,
    provenance: {
      ...input.provenance,
      method,
      confidence: evidence.score,
    },
    ...HEALTH_INDEX_DEFAULT,
    status: "advisory",
    healthIndex: overallHealth,
    healthClass: input.condition?.rating,
    healthConfidence: evidence.score,
    healthTrend: input.condition?.trend,
    healthMethod: method,
    healthSourceRefs: sourceRefs,
    healthComputedAt: input.recordedAt,
    evidenceSufficiency: {
      sufficiencyScore: evidence.score,
      freshnessScore: evidence.freshness,
      sourceDiversityScore: evidence.sourceDiversity,
      reviewCompletenessScore: evidence.reviewCompleteness,
      uncertaintyScore: clamp01(1 - evidence.score),
      sufficient: evidenceOk,
      reasons: evidence.reasons,
      computedAt: evidence.assessedAt,
      method: "evidence_sufficiency_v1",
    },
    factorsUsed: factors,
    composedBy: "health_composition_engine",
  };

  const healthProfile = toProfile(input, healthIndex, {
    conditionContribution,
    reliabilityContribution,
    criticalityContext,
    limitations,
    evidence,
    method,
    overallHealth,
  });

  return { healthIndex, healthProfile };
}

/** Historical Phase 10C semantics — preserved for audit/replay only. */
function composeV1Historical(
  input: HealthCompositionInput,
  requested: HealthCompositionMethod,
): HealthCompositionResult {
  const factors: HealthCompositionFactor[] = [];
  const sourceRefs: string[] = [...(input.provenance.evidenceRefs ?? [])];
  const scores: number[] = [];
  const weights: number[] = [];

  const conditionPresent =
    input.condition?.rating !== undefined ||
    input.condition?.index !== undefined ||
    (input.condition?.evidenceRefs?.length ?? 0) > 0;

  let conditionContribution: number | undefined;
  if (conditionPresent) {
    const idx =
      typeof input.condition?.index === "number"
        ? input.condition.index
        : mapConditionRatingToIndex(input.condition?.rating);
    if (typeof idx === "number") {
      factors.push("condition");
      scores.push(idx);
      weights.push(0.45);
      conditionContribution = idx;
      if (input.condition?.stateId) sourceRefs.push(`condition:${input.condition.stateId}`);
    }
  }

  if (Boolean(input.criticality?.rating)) {
    const w = mapCriticalityRatingToWeight(input.criticality?.rating);
    if (typeof w === "number") {
      const adjusted = 1 - w * 0.5;
      factors.push("criticality");
      scores.push(adjusted);
      weights.push(0.25);
      if (input.criticality?.stateId) {
        sourceRefs.push(`criticality:${input.criticality.stateId}`);
      }
    }
  }

  let reliabilityContribution: number | "unavailable" = "unavailable";
  const reliabilityOk =
    input.reliability?.evidenceSufficient !== false &&
    (input.reliability?.rating !== undefined ||
      typeof input.reliability?.continuity === "number");
  if (reliabilityOk) {
    const idx =
      typeof input.reliability?.continuity === "number"
        ? input.reliability.continuity
        : mapReliabilityClassToIndex(input.reliability?.rating);
    if (typeof idx === "number") {
      factors.push("reliability");
      scores.push(idx);
      weights.push(0.3);
      reliabilityContribution = idx;
      if (input.reliability?.stateId) {
        sourceRefs.push(`reliability:${input.reliability.stateId}`);
      }
    }
  }

  const sufficiency = computeEvidenceSufficiency({
    evidenceRefs: sourceRefs,
    sourceKeys: input.sourceKeys,
    observedAt: input.condition?.observedAt ?? input.provenance.observedAt,
    asOf: input.recordedAt,
    reviewStatus: input.reliability?.reviewStatus ?? input.criticality?.reviewStatus,
    confidenceHint: input.condition?.confidence,
  });

  if (factors.length === 0 || !sufficiency.sufficient) {
    const healthIndex = abstainIndex(input, sourceRefs, factors);
    return {
      healthIndex,
      healthProfile: toProfile(input, healthIndex, {
        conditionContribution,
        reliabilityContribution,
        criticalityContext: input.criticality
          ? {
              criticalityClass: input.criticality.rating,
              criticalityScore: mapCriticalityRatingToWeight(input.criticality.rating),
              isHealthFactor: false,
            }
          : undefined,
        limitations: ["historical_v1_abstain", ...sufficiency.reasons],
        method: "abstain_insufficient_evidence",
      }),
    };
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const overallHealth = scores.reduce(
    (acc, s, i) => acc + s * (weights[i]! / totalWeight),
    0,
  );
  const method: HealthCompositionMethod =
    factors.length === 1 && factors[0] === "condition"
      ? "compose_from_condition_v1"
      : factors.includes("reliability")
        ? "compose_condition_criticality_reliability_v1"
        : requested === "compose_from_condition_v1"
          ? "compose_from_condition_v1"
          : "compose_condition_criticality_v1";

  const healthIndex: AssetHealthIndexState = {
    kind: "health_index",
    assetId: input.assetId,
    stateId: input.stateId,
    recordedAt: input.recordedAt,
    provenance: {
      ...input.provenance,
      method,
      confidence: sufficiency.sufficiencyScore,
    },
    ...HEALTH_INDEX_DEFAULT,
    status: "advisory",
    healthIndex: overallHealth,
    healthClass: input.condition?.rating,
    healthConfidence: sufficiency.sufficiencyScore,
    healthTrend: input.condition?.trend,
    healthMethod: method,
    healthSourceRefs: sourceRefs,
    healthComputedAt: input.recordedAt,
    evidenceSufficiency: sufficiency,
    factorsUsed: factors,
    composedBy: "health_composition_engine",
  };

  return {
    healthIndex,
    healthProfile: toProfile(input, healthIndex, {
      conditionContribution,
      reliabilityContribution,
      criticalityContext: input.criticality
        ? {
            criticalityClass: input.criticality.rating,
            criticalityScore: mapCriticalityRatingToWeight(input.criticality.rating),
            // Historical v1 used criticality as a scoring factor; profile still flags
            // current policy: criticalityIsHealthFactor = false for forward claims.
            isHealthFactor: false,
          }
        : undefined,
      limitations: [
        "historical_composition_v1",
        "do_not_mutate_published_historical_outputs",
      ],
      method,
      overallHealth,
    }),
  };
}

function abstainIndex(
  input: HealthCompositionInput,
  sourceRefs: string[],
  factors: HealthCompositionFactor[],
  evidence?: EvidenceConfidenceAssessment,
): AssetHealthIndexState {
  return {
    kind: "health_index",
    assetId: input.assetId,
    stateId: input.stateId,
    recordedAt: input.recordedAt,
    provenance: input.provenance,
    ...HEALTH_INDEX_DEFAULT,
    status: "unavailable",
    healthMethod: "abstain_insufficient_evidence",
    healthComputedAt: input.recordedAt,
    factorsUsed: factors,
    composedBy: "health_composition_engine",
    healthSourceRefs: sourceRefs,
    evidenceSufficiency: evidence
      ? {
          sufficiencyScore: evidence.score,
          freshnessScore: evidence.freshness,
          sourceDiversityScore: evidence.sourceDiversity,
          reviewCompletenessScore: evidence.reviewCompleteness,
          uncertaintyScore: clamp01(1 - evidence.score),
          sufficient: false,
          reasons: evidence.reasons,
          computedAt: evidence.assessedAt,
          method: "evidence_sufficiency_v1",
        }
      : undefined,
  };
}

function toProfile(
  input: HealthCompositionInput,
  healthIndex: AssetHealthIndexState,
  opts: {
    conditionContribution?: number;
    reliabilityContribution?: number | "unavailable";
    criticalityContext?: AssetHealthProfile["criticalityContext"];
    limitations: string[];
    evidence?: EvidenceConfidenceAssessment;
    method: HealthCompositionMethod;
    overallHealth?: number;
  },
): AssetHealthProfile {
  return {
    profileId: input.profileId ?? input.stateId,
    assetId: input.assetId,
    tenantId: input.tenantId ?? "",
    workspaceId: input.workspaceId ?? "",
    compositionMethod: opts.method,
    compositionVersion: opts.method.includes("v2") ? "2" : "1",
    conditionStateRef: input.condition?.stateId,
    conditionContribution: opts.conditionContribution,
    reliabilityStateRef: input.reliability?.stateId,
    reliabilityContribution: opts.reliabilityContribution ?? "unavailable",
    evidenceConfidenceRef: opts.evidence?.assessmentId,
    evidenceConfidence: opts.evidence,
    overallHealth: opts.overallHealth ?? healthIndex.healthIndex,
    overallHealthClass: healthIndex.healthClass,
    overallHealthConfidence: healthIndex.healthConfidence,
    criticalityStateRef: input.criticality?.stateId,
    criticalityContext: opts.criticalityContext,
    priorityContext: { reserved: true, engine: "AssetPriorityEngine" },
    limitations: opts.limitations,
    calculatedAt: input.recordedAt,
    reviewStatus: healthIndex.status === "unavailable" ? "draft" : "calculated",
    provenance: healthIndex.provenance,
    silentIdentityMutationForbidden: true,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    probabilityOfFailureCertified: false,
    criticalityIsHealthFactor: false,
  };
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}
