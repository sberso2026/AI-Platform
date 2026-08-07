/**
 * Phase 10J — Objective-specific predictive readiness.
 *
 * Extends the Phase 10I `PredictiveReadinessAssessor` with per-objective
 * assessment. The inherited global `assess()` is unchanged, so existing callers
 * keep working; `assessObjective()` answers the narrower question of whether the
 * evidence could support one named objective.
 *
 * Readiness is never permission. Probability of failure and remaining useful
 * life are permanently `not_ready` in Phase 10J.
 */

import type { AssetFusionState, FusionSourceKind, PredictiveReadinessClass, SourceReconciliationRecord } from "./fusion";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { TrendConfidenceAssessment } from "./trend-confidence";
import {
  PredictiveReadinessAssessor,
  type PredictiveReadinessAssessorDeps,
} from "./reconciliation-engine";
import {
  assertRegisteredObjective,
  isPermanentlyNotReadyInPhase10J,
  PREDICTIVE_OBJECTIVE_REGISTRY,
  type PredictiveObjectiveDefinition,
  type PredictiveObjectiveId,
  type PredictiveObjectiveInputKind,
} from "./predictive-objectives";
import {
  classifyFreshness,
  DEFAULT_PREDICTIVE_FRESHNESS_POLICY,
  type FreshnessPolicy,
  type FreshnessState,
  type FusionProvenanceRef,
  type ObjectivePredictiveReadinessState,
} from "./predictive-governance";

const READINESS_SEVERITY: Record<PredictiveReadinessClass, number> = {
  sufficient: 0,
  limited: 1,
  insufficient: 2,
  conflicting: 3,
  not_ready: 4,
};

function worstOf(a: PredictiveReadinessClass, b: PredictiveReadinessClass): PredictiveReadinessClass {
  return READINESS_SEVERITY[a] >= READINESS_SEVERITY[b] ? a : b;
}

/**
 * Inputs that can be inferred from a fused source. Anything absent here —
 * material properties, environment exposure, design basis — must be declared
 * explicitly, so objectives depending on them fail closed.
 */
const FUSION_SOURCE_INPUT_MAP: Readonly<
  Partial<Record<FusionSourceKind, readonly PredictiveObjectiveInputKind[]>>
> = {
  condition: ["condition_state"],
  health: ["health_index"],
  criticality: ["criticality"],
  reliability: ["reliability_state"],
  failure: ["failure_history"],
  trend: ["trend_state", "time_series"],
  degradation: ["degradation_state"],
  lifecycle: ["lifecycle_state"],
  maintenance_recommendation: ["maintenance_history"],
  inspection_intelligence_public: ["condition_state", "health_index"],
};

export type ObjectiveReadinessInput = {
  objectiveId: PredictiveObjectiveId | string;
  fusion: AssetFusionState;
  reconciliation?: SourceReconciliationRecord;
  evidenceConfidence: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  /** Inputs available beyond those inferable from fusion sources. */
  declaredInputs?: readonly PredictiveObjectiveInputKind[];
  observationCount?: number;
  observationWindowDays?: number;
  largestObservationGapDays?: number;
  evidenceAgeDays?: number;
  freshnessPolicy?: FreshnessPolicy;
  globalReadinessRef?: string;
  assessedAt?: string;
};

export type ObjectivePredictiveReadinessResult = {
  readiness: ObjectivePredictiveReadinessState;
  /** Constant across Phase 10J regardless of readiness class. */
  predictiveAllowed: false;
};

export class ObjectivePredictiveReadinessAssessor extends PredictiveReadinessAssessor {
  readonly objectiveKind = "objective_predictive_readiness_assessor" as const;
  private readonly newObjectiveId: (prefix: string) => string;

  constructor(deps: PredictiveReadinessAssessorDeps = {}) {
    super(deps);
    this.newObjectiveId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  assessObjective(input: ObjectiveReadinessInput): ObjectivePredictiveReadinessResult {
    const objective = assertRegisteredObjective(input.objectiveId);
    const { fusion, reconciliation, evidenceConfidence: ec, trendConfidence: tc } = input;
    const policy = input.freshnessPolicy ?? DEFAULT_PREDICTIVE_FRESHNESS_POLICY;
    const assessedAt = input.assessedAt ?? new Date().toISOString();

    // The global assessment is a ceiling: an objective can never be readier
    // than the fused evidence base as a whole.
    const global = this.assess({ fusion, reconciliation, evidenceConfidence: ec, assessedAt });

    const satisfied: string[] = [];
    const unmet: string[] = [];
    const rationale: string[] = [...global.readiness.readinessRationale];
    const limitations: string[] = [
      "readiness_is_not_permission_to_predict",
      "predictive_ml_enabled=false",
      "production_predictive_execution_enabled=false",
    ];

    let readinessClass: PredictiveReadinessClass = global.readiness.readinessClass;

    const freshnessState = classifyFreshness(input.evidenceAgeDays, policy);
    readinessClass = applyFreshness(readinessClass, freshnessState, policy, rationale, satisfied, unmet);

    readinessClass = worstOf(
      readinessClass,
      checkInputs(objective, fusion, input.declaredInputs, satisfied, unmet),
    );
    readinessClass = worstOf(
      readinessClass,
      checkEvidence(objective, fusion, ec, input.observationCount, satisfied, unmet),
    );
    readinessClass = worstOf(
      readinessClass,
      checkTimeWindow(objective, input, satisfied, unmet),
    );
    readinessClass = worstOf(readinessClass, checkConfidence(objective, ec, tc, satisfied, unmet));

    if (isPermanentlyNotReadyInPhase10J(objective.objectiveId)) {
      readinessClass = "not_ready";
      rationale.push("objective_reserved_and_uncertified_in_phase_10j");
      limitations.push(
        objective.objectiveId === "probability_of_failure"
          ? "probability_of_failure_certified=false"
          : "rul_claims_certified=false",
      );
    } else if (unmet.length > 0) {
      rationale.push("objective_requirements_unmet");
    } else if (readinessClass === "sufficient") {
      rationale.push("objective_requirements_satisfied_for_future_consideration");
    }

    if (objective.status !== "under_evaluation") {
      limitations.push(`objective_status=${objective.status}`);
    }

    const readiness: ObjectivePredictiveReadinessState = {
      id: this.newObjectiveId("obj_ready"),
      tenantId: fusion.tenantId,
      workspaceId: fusion.workspaceId,
      assetId: fusion.assetId,
      objectiveId: objective.objectiveId,
      objectiveVersion: objective.version,
      version: 1,
      readinessClass,
      readinessRationale: dedupe(rationale),
      satisfiedRequirements: dedupe(satisfied),
      unmetRequirements: dedupe(unmet),
      evidenceConfidenceRef: ec.assessmentId,
      trendConfidenceRef: tc?.assessmentId ?? fusion.trendConfidenceRef,
      fusionProvenance: buildFusionProvenance(fusion, reconciliation, ec, tc, input.globalReadinessRef ?? global.readiness.id),
      freshnessPolicyRef: policy.policyId,
      freshnessState,
      observationCount: input.observationCount,
      observationWindowDays: input.observationWindowDays,
      method: "objective_predictive_readiness_v1",
      methodVersion: "1",
      reviewStatus: "draft",
      provenance: {
        engine: "ObjectivePredictiveReadinessAssessor",
        globalReadinessClass: global.readiness.readinessClass,
        globalReadinessRef: global.readiness.id,
        objectiveStatus: objective.status,
        freshnessPolicy: policy.policyId,
        predictiveMlEnabled: false,
        predictiveMethodsCertified: false,
        predictiveMlExecuted: false,
      },
      limitations: dedupe([...global.readiness.limitations, ...limitations]),
      assessedAt,
      predictiveMlEnabled: false,
      predictiveMethodsCertified: false,
      predictiveMlExecuted: false,
      productionExecutionEnabled: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      isHealthFactor: false,
      containsPredictionOutput: false,
      autonomousExecutionForbidden: true,
    };

    return { readiness, predictiveAllowed: false };
  }

  /** Convenience: readiness across every registered objective. */
  assessAllObjectives(
    input: Omit<ObjectiveReadinessInput, "objectiveId">,
  ): ObjectivePredictiveReadinessResult[] {
    return PREDICTIVE_OBJECTIVE_REGISTRY.map((objective) =>
      this.assessObjective({ ...input, objectiveId: objective.objectiveId }),
    );
  }
}

export function createObjectivePredictiveReadinessAssessor(
  deps?: PredictiveReadinessAssessorDeps,
): ObjectivePredictiveReadinessAssessor {
  return new ObjectivePredictiveReadinessAssessor(deps);
}

function applyFreshness(
  current: PredictiveReadinessClass,
  freshnessState: FreshnessState,
  policy: FreshnessPolicy,
  rationale: string[],
  satisfied: string[],
  unmet: string[],
): PredictiveReadinessClass {
  if (freshnessState === "fresh") {
    satisfied.push("evidence_fresh");
    return current;
  }
  if (freshnessState === "unknown") {
    unmet.push("evidence_age_unknown");
    rationale.push("evidence_age_not_supplied");
    return worstOf(current, "limited");
  }
  if (freshnessState === "aging") {
    unmet.push("evidence_aging");
    rationale.push(`freshness_policy_${policy.onAging}`);
    return worstOf(current, "limited");
  }
  unmet.push("evidence_stale");
  rationale.push(`freshness_policy_${policy.onStale}`);
  return worstOf(current, policy.onStale === "downgrade_to_not_ready" ? "not_ready" : "insufficient");
}

function checkInputs(
  objective: PredictiveObjectiveDefinition,
  fusion: AssetFusionState,
  declaredInputs: readonly PredictiveObjectiveInputKind[] | undefined,
  satisfied: string[],
  unmet: string[],
): PredictiveReadinessClass {
  const available = new Set<PredictiveObjectiveInputKind>(declaredInputs ?? []);
  for (const contribution of fusion.contributingSources) {
    if (contribution.status !== "included") continue;
    for (const kind of FUSION_SOURCE_INPUT_MAP[contribution.kind] ?? []) {
      available.add(kind);
    }
  }

  const missing = objective.requiredInputs.filter((kind) => !available.has(kind));
  if (missing.length === 0) {
    satisfied.push("required_inputs_available");
    return "sufficient";
  }
  for (const kind of missing) {
    unmet.push(`missing_required_input:${kind}`);
  }
  return missing.length >= objective.requiredInputs.length ? "insufficient" : "limited";
}

function checkEvidence(
  objective: PredictiveObjectiveDefinition,
  fusion: AssetFusionState,
  ec: EvidenceConfidenceAssessment,
  observationCount: number | undefined,
  satisfied: string[],
  unmet: string[],
): PredictiveReadinessClass {
  const requirement = objective.minimumEvidence;
  let outcome: PredictiveReadinessClass = "sufficient";

  const includedSources = fusion.contributingSources.filter((c) => c.status === "included").length;
  if (includedSources < requirement.minimumSourceCount) {
    unmet.push(
      `insufficient_source_count:${includedSources}<${requirement.minimumSourceCount}`,
    );
    outcome = worstOf(outcome, "limited");
  } else {
    satisfied.push("minimum_source_count_met");
  }

  if (observationCount === undefined) {
    unmet.push("observation_count_unknown");
    outcome = worstOf(outcome, "limited");
  } else if (observationCount < requirement.minimumObservationCount) {
    unmet.push(
      `insufficient_observations:${observationCount}<${requirement.minimumObservationCount}`,
    );
    outcome = worstOf(outcome, "insufficient");
  } else {
    satisfied.push("minimum_observation_count_met");
  }

  const classRank = { unavailable: 0, low: 1, medium: 2, high: 3 } as const;
  if (classRank[ec.confidenceClass] < classRank[requirement.minimumEvidenceConfidenceClass]) {
    unmet.push(
      `evidence_confidence_class_below_minimum:${ec.confidenceClass}<${requirement.minimumEvidenceConfidenceClass}`,
    );
    outcome = worstOf(outcome, ec.confidenceClass === "unavailable" ? "insufficient" : "limited");
  } else {
    satisfied.push("evidence_confidence_class_met");
  }

  if (requirement.independentCorroborationRequired) {
    const distinctKinds = new Set(
      fusion.contributingSources.filter((c) => c.status === "included").map((c) => c.kind),
    );
    if (distinctKinds.size < 2) {
      unmet.push("independent_corroboration_missing");
      outcome = worstOf(outcome, "limited");
    } else {
      satisfied.push("independent_corroboration_present");
    }
  }

  return outcome;
}

function checkTimeWindow(
  objective: PredictiveObjectiveDefinition,
  input: ObjectiveReadinessInput,
  satisfied: string[],
  unmet: string[],
): PredictiveReadinessClass {
  const requirement = objective.minimumTimeWindow;
  let outcome: PredictiveReadinessClass = "sufficient";

  if (input.observationWindowDays === undefined) {
    unmet.push("observation_window_unknown");
    outcome = worstOf(outcome, "limited");
  } else if (input.observationWindowDays < requirement.minimumWindowDays) {
    unmet.push(
      `observation_window_too_short:${input.observationWindowDays}<${requirement.minimumWindowDays}`,
    );
    outcome = worstOf(outcome, "insufficient");
  } else {
    satisfied.push("minimum_time_window_met");
  }

  if (
    input.observationCount !== undefined &&
    input.observationCount < requirement.minimumObservationsInWindow
  ) {
    unmet.push(
      `insufficient_observations_in_window:${input.observationCount}<${requirement.minimumObservationsInWindow}`,
    );
    outcome = worstOf(outcome, "insufficient");
  }

  if (
    input.largestObservationGapDays !== undefined &&
    input.largestObservationGapDays > requirement.maximumObservationGapDays
  ) {
    unmet.push(
      `observation_gap_exceeded:${input.largestObservationGapDays}>${requirement.maximumObservationGapDays}`,
    );
    outcome = worstOf(outcome, "limited");
  }

  return outcome;
}

function checkConfidence(
  objective: PredictiveObjectiveDefinition,
  ec: EvidenceConfidenceAssessment,
  tc: TrendConfidenceAssessment | undefined,
  satisfied: string[],
  unmet: string[],
): PredictiveReadinessClass {
  const requirement = objective.requiredConfidence;
  let outcome: PredictiveReadinessClass = "sufficient";

  if (ec.score < requirement.minimumEvidenceConfidenceScore) {
    unmet.push(
      `evidence_confidence_below_minimum:${ec.score.toFixed(2)}<${requirement.minimumEvidenceConfidenceScore}`,
    );
    outcome = worstOf(outcome, "limited");
  } else {
    satisfied.push("evidence_confidence_score_met");
  }

  if (!tc) {
    unmet.push("trend_confidence_absent");
    outcome = worstOf(outcome, "limited");
    return outcome;
  }

  if (tc.dataSufficiency === "conflicting") {
    unmet.push("trend_confidence_conflicting");
    return worstOf(outcome, "conflicting");
  }
  if (
    tc.dataSufficiency === "insufficient" ||
    tc.dataSufficiency === "stale" ||
    tc.dataSufficiency === "revoked"
  ) {
    unmet.push(`trend_${tc.dataSufficiency}`);
    return worstOf(outcome, "insufficient");
  }
  if (
    objective.minimumEvidence.minimumTrendSufficiency === "sufficient" &&
    tc.dataSufficiency !== "sufficient"
  ) {
    unmet.push(`trend_sufficiency_below_minimum:${tc.dataSufficiency}`);
    outcome = worstOf(outcome, "limited");
  } else {
    satisfied.push("trend_sufficiency_met");
  }

  if (tc.score < requirement.minimumTrendConfidenceScore) {
    unmet.push(
      `trend_confidence_below_minimum:${tc.score.toFixed(2)}<${requirement.minimumTrendConfidenceScore}`,
    );
    outcome = worstOf(outcome, "limited");
  } else {
    satisfied.push("trend_confidence_score_met");
  }

  return outcome;
}

function buildFusionProvenance(
  fusion: AssetFusionState,
  reconciliation: SourceReconciliationRecord | undefined,
  ec: EvidenceConfidenceAssessment,
  tc: TrendConfidenceAssessment | undefined,
  globalReadinessRef: string | undefined,
): FusionProvenanceRef {
  return {
    fusionStateRef: fusion.id,
    fusionClass: fusion.fusionClass,
    reconciliationRef: reconciliation?.id ?? fusion.reconciliationRef,
    evidenceConfidenceRef: ec.assessmentId,
    trendConfidenceRef: tc?.assessmentId ?? fusion.trendConfidenceRef,
    contributingSourceKinds: fusion.contributingSources
      .filter((c) => c.status === "included")
      .map((c) => c.kind),
    missingSourceKinds: fusion.missingSources,
    conflictingSourceKinds: fusion.conflictingSources,
    globalReadinessRef,
  };
}

function dedupe(values: readonly string[]): string[] {
  return [...new Set(values)];
}
