/**
 * Phase 10C — Health Composition Engine (Health Composer).
 *
 * Reusable orchestration for multi-factor advisory health composition.
 * Produces AssetHealthIndexState; does NOT own identity, persistence, or review workflows.
 * Reliability factor slot is reserved for Phase 10D (ignored until supplied with evidence).
 */

import type { Provenance } from "../architecture/identity-state";
import { mapCriticalityRatingToWeight } from "./criticality";
import { computeEvidenceSufficiency } from "./evidence-sufficiency";
import {
  HEALTH_INDEX_DEFAULT,
  mapConditionRatingToIndex,
  type AssetHealthIndexState,
  type HealthCompositionFactor,
} from "./health-index";

export type HealthCompositionInput = {
  assetId: string;
  stateId: string;
  recordedAt: string;
  provenance: Provenance;
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
  /**
   * Reserved for Phase 10D Reliability Engine.
   * Composer accepts the slot but does not invent reliability without an upstream assessor.
   */
  reliability?: {
    rating?: string;
    continuity?: number;
    confidence?: number;
    stateId?: string;
    reviewStatus?: string;
    evidenceRefs?: string[];
    evidenceSufficient?: boolean;
  };
  sourceKeys?: string[];
};

export type HealthComposer = {
  readonly kind: "health_composition_engine";
  compose(input: HealthCompositionInput): AssetHealthIndexState;
};

/**
 * Health Composition Engine — factor selection, weighting, abstention, method tagging.
 */
export class HealthCompositionEngine implements HealthComposer {
  readonly kind = "health_composition_engine" as const;

  compose(input: HealthCompositionInput): AssetHealthIndexState {
    const factors: HealthCompositionFactor[] = [];
    const sourceRefs: string[] = [...(input.provenance.evidenceRefs ?? [])];
    const scores: number[] = [];
    const weights: number[] = [];

    const conditionPresent =
      input.condition?.rating !== undefined ||
      input.condition?.index !== undefined ||
      (input.condition?.evidenceRefs?.length ?? 0) > 0;

    if (conditionPresent) {
      const idx =
        typeof input.condition?.index === "number"
          ? input.condition.index
          : mapConditionRatingToIndex(input.condition?.rating);
      if (typeof idx === "number") {
        factors.push("condition");
        scores.push(idx);
        weights.push(0.45);
        if (input.condition?.stateId) sourceRefs.push(`condition:${input.condition.stateId}`);
      }
    }

    if (Boolean(input.criticality?.rating)) {
      const w = mapCriticalityRatingToWeight(input.criticality?.rating);
      if (typeof w === "number") {
        // Higher criticality reduces composite health for the same condition.
        const adjusted = 1 - w * 0.5;
        factors.push("criticality");
        scores.push(adjusted);
        weights.push(0.25);
        if (input.criticality?.stateId) {
          sourceRefs.push(`criticality:${input.criticality.stateId}`);
        }
      }
    }

    // Reliability reserved: only compose when an upstream Phase 10D assessor supplies it.
    const reliabilityOk =
      input.reliability?.evidenceSufficient !== false &&
      (input.reliability?.rating !== undefined ||
        typeof input.reliability?.continuity === "number");
    if (reliabilityOk) {
      const idx =
        typeof input.reliability?.continuity === "number"
          ? input.reliability.continuity
          : mapReliabilityRatingToIndexReserved(input.reliability?.rating);
      if (typeof idx === "number") {
        factors.push("reliability");
        scores.push(idx);
        weights.push(0.3);
        if (input.reliability?.stateId) {
          sourceRefs.push(`reliability:${input.reliability.stateId}`);
        }
      }
    }

    const evidenceSufficiency = computeEvidenceSufficiency({
      evidenceRefs: sourceRefs,
      sourceKeys: input.sourceKeys,
      observedAt: input.condition?.observedAt ?? input.provenance.observedAt,
      asOf: input.recordedAt,
      reviewStatus: input.criticality?.reviewStatus ?? input.reliability?.reviewStatus,
      confidenceHint: input.condition?.confidence,
    });

    if (factors.length === 0 || !evidenceSufficiency.sufficient) {
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
        evidenceSufficiency,
        factorsUsed: factors,
        composedBy: "health_composition_engine",
        healthSourceRefs: sourceRefs,
      };
    }

    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const healthIndex = scores.reduce(
      (acc, s, i) => acc + s * (weights[i]! / totalWeight),
      0,
    );
    const method =
      factors.length === 1 && factors[0] === "condition"
        ? "compose_from_condition_v1"
        : factors.includes("reliability")
          ? "compose_condition_criticality_reliability_v1"
          : factors.includes("criticality")
            ? "compose_condition_criticality_v1"
            : "compose_from_condition_v1";

    return {
      kind: "health_index",
      assetId: input.assetId,
      stateId: input.stateId,
      recordedAt: input.recordedAt,
      provenance: {
        ...input.provenance,
        method,
        confidence: evidenceSufficiency.sufficiencyScore,
      },
      ...HEALTH_INDEX_DEFAULT,
      status: "advisory",
      healthIndex,
      healthClass: input.condition?.rating,
      healthConfidence: evidenceSufficiency.sufficiencyScore,
      healthTrend: input.condition?.trend,
      healthMethod: method,
      healthSourceRefs: sourceRefs,
      healthComputedAt: input.recordedAt,
      evidenceSufficiency,
      factorsUsed: factors,
      composedBy: "health_composition_engine",
    };
  }
}

export function createHealthCompositionEngine(): HealthCompositionEngine {
  return new HealthCompositionEngine();
}

/** Convenience: compose via default engine instance. */
export function composeAdvisoryHealthIndex(
  input: HealthCompositionInput,
): AssetHealthIndexState {
  return createHealthCompositionEngine().compose(input);
}

/**
 * Backward-compatible condition-only entry used by Phase 10B tests.
 * Delegates to HealthCompositionEngine — does not live on Health Index model.
 */
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

function mapReliabilityRatingToIndexReserved(rating?: string): number | undefined {
  if (!rating) return undefined;
  const map: Record<string, number> = {
    high: 0.9,
    medium: 0.6,
    low: 0.3,
    unknown: 0.5,
  };
  return map[rating.toLowerCase()];
}
