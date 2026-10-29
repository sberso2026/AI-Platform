/**
 * Phase 10J — Predictive Objective Registry.
 *
 * A predictive objective is a specific future quantity or event that Asset
 * Intelligence may one day be permitted to estimate. Registration is governance
 * only: no objective is certified and no objective may be executed in Phase 10J.
 */

export type PredictiveObjectiveId =
  | "condition_trend_projection"
  | "degradation_rate_estimation"
  | "threshold_crossing_estimation"
  | "failure_mode_forecasting"
  | "reliability_projection"
  | "probability_of_failure"
  | "remaining_useful_life"
  | "maintenance_interval_optimization";

/**
 * Method classes are declared here because objectives constrain which classes
 * may ever be applied to them. `predictive-methods` re-exports this union.
 */
export type PredictiveMethodClass =
  | "deterministic"
  | "statistical"
  | "physics_based"
  | "hybrid"
  | "machine_learning";

export type PredictiveObjectiveStatus =
  | "reserved"
  | "not_certified"
  | "under_evaluation";

export type PredictiveObjectiveInputKind =
  | "condition_state"
  | "health_index"
  | "criticality"
  | "reliability_state"
  | "failure_history"
  | "time_series"
  | "trend_state"
  | "degradation_state"
  | "lifecycle_state"
  | "maintenance_history"
  | "material_properties"
  | "environment_exposure"
  | "design_basis"
  | "inspection_intelligence_public";

export type PredictiveObjectiveEvidenceRequirement = {
  minimumSourceCount: number;
  minimumObservationCount: number;
  minimumEvidenceConfidenceClass: "medium" | "high";
  minimumTrendSufficiency: "limited" | "sufficient";
  independentCorroborationRequired: boolean;
};

export type PredictiveObjectiveTimeWindow = {
  minimumWindowDays: number;
  minimumObservationsInWindow: number;
  maximumObservationGapDays: number;
  note?: string;
};

export type PredictiveObjectiveConfidenceRequirement = {
  minimumEvidenceConfidenceScore: number;
  minimumTrendConfidenceScore: number;
  uncertaintyQuantificationRequired: boolean;
};

export type PredictiveObjectiveGovernanceRequirement = {
  governedReviewRequired: true;
  qualificationRequired: true;
  certificationRequired: true;
  dualReviewRequired: boolean;
  requiredReviewerRoles: readonly string[];
  autonomousExecutionForbidden: true;
  productionExecutionEnabled: false;
};

export type PredictiveObjectiveDefinition = {
  objectiveId: PredictiveObjectiveId;
  version: string;
  description: string;
  requiredInputs: readonly PredictiveObjectiveInputKind[];
  minimumEvidence: PredictiveObjectiveEvidenceRequirement;
  minimumTimeWindow: PredictiveObjectiveTimeWindow;
  requiredConfidence: PredictiveObjectiveConfidenceRequirement;
  requiredGovernance: PredictiveObjectiveGovernanceRequirement;
  allowedMethodClasses: readonly PredictiveMethodClass[];
  prohibitedUses: readonly string[];
  status: PredictiveObjectiveStatus;
  /** No objective is certified in Phase 10J. */
  certified: false;
};

const BASE_GOVERNANCE: PredictiveObjectiveGovernanceRequirement = {
  governedReviewRequired: true,
  qualificationRequired: true,
  certificationRequired: true,
  dualReviewRequired: false,
  requiredReviewerRoles: ["asset_intelligence_reviewer"],
  autonomousExecutionForbidden: true,
  productionExecutionEnabled: false,
};

const SAFETY_CRITICAL_GOVERNANCE: PredictiveObjectiveGovernanceRequirement = {
  ...BASE_GOVERNANCE,
  dualReviewRequired: true,
  requiredReviewerRoles: [
    "asset_intelligence_reviewer",
    "responsible_engineer",
  ],
};

const UNIVERSAL_PROHIBITED_USES = [
  "autonomous_work_order_creation",
  "canonical_risk_mutation",
  "canonical_lifecycle_mutation",
  "health_index_contribution",
  "safety_case_evidence_without_certification",
] as const;

export const PREDICTIVE_OBJECTIVE_REGISTRY: readonly PredictiveObjectiveDefinition[] = [
  {
    objectiveId: "condition_trend_projection",
    version: "1",
    description:
      "Projection of an observed condition indicator forward in time within the observed operating regime.",
    requiredInputs: ["condition_state", "time_series", "trend_state"],
    minimumEvidence: {
      minimumSourceCount: 1,
      minimumObservationCount: 5,
      minimumEvidenceConfidenceClass: "medium",
      minimumTrendSufficiency: "limited",
      independentCorroborationRequired: false,
    },
    minimumTimeWindow: {
      minimumWindowDays: 180,
      minimumObservationsInWindow: 5,
      maximumObservationGapDays: 120,
      note: "Projection horizon must not exceed the observed window.",
    },
    requiredConfidence: {
      minimumEvidenceConfidenceScore: 0.5,
      minimumTrendConfidenceScore: 0.5,
      uncertaintyQuantificationRequired: true,
    },
    requiredGovernance: BASE_GOVERNANCE,
    allowedMethodClasses: ["deterministic", "statistical", "physics_based", "hybrid"],
    prohibitedUses: [
      ...UNIVERSAL_PROHIBITED_USES,
      "extrapolation_beyond_observed_operating_regime",
      "presentation_as_remaining_useful_life",
    ],
    status: "reserved",
    certified: false,
  },
  {
    objectiveId: "degradation_rate_estimation",
    version: "1",
    description:
      "Estimation of the rate at which a degradation mechanism progresses under observed conditions.",
    requiredInputs: [
      "condition_state",
      "time_series",
      "degradation_state",
      "environment_exposure",
    ],
    minimumEvidence: {
      minimumSourceCount: 1,
      minimumObservationCount: 6,
      minimumEvidenceConfidenceClass: "medium",
      minimumTrendSufficiency: "sufficient",
      independentCorroborationRequired: false,
    },
    minimumTimeWindow: {
      minimumWindowDays: 365,
      minimumObservationsInWindow: 6,
      maximumObservationGapDays: 180,
      note: "Rate estimation requires a window long enough to separate signal from measurement scatter.",
    },
    requiredConfidence: {
      minimumEvidenceConfidenceScore: 0.55,
      minimumTrendConfidenceScore: 0.55,
      uncertaintyQuantificationRequired: true,
    },
    requiredGovernance: BASE_GOVERNANCE,
    allowedMethodClasses: ["deterministic", "statistical", "physics_based", "hybrid"],
    prohibitedUses: [
      ...UNIVERSAL_PROHIBITED_USES,
      "mechanism_substitution_without_engineering_review",
      "presentation_as_remaining_useful_life",
    ],
    status: "reserved",
    certified: false,
  },
  {
    objectiveId: "threshold_crossing_estimation",
    version: "1",
    description:
      "Estimation of when a monitored indicator is expected to cross a defined engineering threshold.",
    requiredInputs: [
      "condition_state",
      "time_series",
      "trend_state",
      "design_basis",
    ],
    minimumEvidence: {
      minimumSourceCount: 1,
      minimumObservationCount: 6,
      minimumEvidenceConfidenceClass: "medium",
      minimumTrendSufficiency: "sufficient",
      independentCorroborationRequired: false,
    },
    minimumTimeWindow: {
      minimumWindowDays: 365,
      minimumObservationsInWindow: 6,
      maximumObservationGapDays: 150,
    },
    requiredConfidence: {
      minimumEvidenceConfidenceScore: 0.6,
      minimumTrendConfidenceScore: 0.6,
      uncertaintyQuantificationRequired: true,
    },
    requiredGovernance: BASE_GOVERNANCE,
    allowedMethodClasses: ["deterministic", "statistical", "physics_based", "hybrid"],
    prohibitedUses: [
      ...UNIVERSAL_PROHIBITED_USES,
      "threshold_inference_without_documented_design_basis",
      "presentation_as_failure_date",
    ],
    status: "reserved",
    certified: false,
  },
  {
    objectiveId: "failure_mode_forecasting",
    version: "1",
    description:
      "Forecasting of which registered failure modes are most likely to become active over a defined horizon.",
    requiredInputs: [
      "condition_state",
      "failure_history",
      "degradation_state",
      "environment_exposure",
      "maintenance_history",
    ],
    minimumEvidence: {
      minimumSourceCount: 2,
      minimumObservationCount: 8,
      minimumEvidenceConfidenceClass: "high",
      minimumTrendSufficiency: "sufficient",
      independentCorroborationRequired: true,
    },
    minimumTimeWindow: {
      minimumWindowDays: 730,
      minimumObservationsInWindow: 8,
      maximumObservationGapDays: 180,
    },
    requiredConfidence: {
      minimumEvidenceConfidenceScore: 0.7,
      minimumTrendConfidenceScore: 0.65,
      uncertaintyQuantificationRequired: true,
    },
    requiredGovernance: SAFETY_CRITICAL_GOVERNANCE,
    allowedMethodClasses: ["statistical", "physics_based", "hybrid"],
    prohibitedUses: [
      ...UNIVERSAL_PROHIBITED_USES,
      "unregistered_failure_mode_invention",
      "presentation_as_probability_of_failure",
    ],
    status: "reserved",
    certified: false,
  },
  {
    objectiveId: "reliability_projection",
    version: "1",
    description:
      "Projection of qualitative reliability posture over a defined horizon under stated assumptions.",
    requiredInputs: [
      "reliability_state",
      "failure_history",
      "maintenance_history",
      "condition_state",
    ],
    minimumEvidence: {
      minimumSourceCount: 2,
      minimumObservationCount: 10,
      minimumEvidenceConfidenceClass: "high",
      minimumTrendSufficiency: "sufficient",
      independentCorroborationRequired: true,
    },
    minimumTimeWindow: {
      minimumWindowDays: 1095,
      minimumObservationsInWindow: 10,
      maximumObservationGapDays: 365,
    },
    requiredConfidence: {
      minimumEvidenceConfidenceScore: 0.7,
      minimumTrendConfidenceScore: 0.65,
      uncertaintyQuantificationRequired: true,
    },
    requiredGovernance: SAFETY_CRITICAL_GOVERNANCE,
    allowedMethodClasses: ["statistical", "physics_based", "hybrid"],
    prohibitedUses: [
      ...UNIVERSAL_PROHIBITED_USES,
      "quantitative_reliability_claim_without_certification",
      "presentation_as_probability_of_failure",
    ],
    status: "reserved",
    certified: false,
  },
  {
    objectiveId: "probability_of_failure",
    version: "1",
    description:
      "Quantified probability that an asset or failure mode fails within a defined horizon. Reserved and uncertified.",
    requiredInputs: [
      "reliability_state",
      "failure_history",
      "condition_state",
      "degradation_state",
      "environment_exposure",
      "design_basis",
    ],
    minimumEvidence: {
      minimumSourceCount: 3,
      minimumObservationCount: 20,
      minimumEvidenceConfidenceClass: "high",
      minimumTrendSufficiency: "sufficient",
      independentCorroborationRequired: true,
    },
    minimumTimeWindow: {
      minimumWindowDays: 1825,
      minimumObservationsInWindow: 20,
      maximumObservationGapDays: 365,
      note: "Calibration requires observed failure and survival populations, not condition history alone.",
    },
    requiredConfidence: {
      minimumEvidenceConfidenceScore: 0.85,
      minimumTrendConfidenceScore: 0.8,
      uncertaintyQuantificationRequired: true,
    },
    requiredGovernance: SAFETY_CRITICAL_GOVERNANCE,
    allowedMethodClasses: ["statistical", "physics_based", "hybrid"],
    prohibitedUses: [
      ...UNIVERSAL_PROHIBITED_USES,
      "any_production_use_in_phase_10j",
      "quantitative_risk_assessment_input",
      "insurance_or_regulatory_submission",
    ],
    status: "not_certified",
    certified: false,
  },
  {
    objectiveId: "remaining_useful_life",
    version: "1",
    description:
      "Estimated remaining service life before a defined end-of-life criterion is reached. Reserved and uncertified.",
    requiredInputs: [
      "condition_state",
      "degradation_state",
      "lifecycle_state",
      "material_properties",
      "environment_exposure",
      "design_basis",
    ],
    minimumEvidence: {
      minimumSourceCount: 3,
      minimumObservationCount: 20,
      minimumEvidenceConfidenceClass: "high",
      minimumTrendSufficiency: "sufficient",
      independentCorroborationRequired: true,
    },
    minimumTimeWindow: {
      minimumWindowDays: 1825,
      minimumObservationsInWindow: 20,
      maximumObservationGapDays: 365,
      note: "End-of-life criterion must be documented and engineering-approved before estimation.",
    },
    requiredConfidence: {
      minimumEvidenceConfidenceScore: 0.85,
      minimumTrendConfidenceScore: 0.8,
      uncertaintyQuantificationRequired: true,
    },
    requiredGovernance: SAFETY_CRITICAL_GOVERNANCE,
    allowedMethodClasses: ["physics_based", "hybrid"],
    prohibitedUses: [
      ...UNIVERSAL_PROHIBITED_USES,
      "any_production_use_in_phase_10j",
      "replacement_capex_justification",
      "presentation_of_trend_extrapolation_as_rul",
    ],
    status: "not_certified",
    certified: false,
  },
  {
    objectiveId: "maintenance_interval_optimization",
    version: "1",
    description:
      "Recommendation of maintenance or inspection interval adjustments derived from governed intelligence.",
    requiredInputs: [
      "maintenance_history",
      "failure_history",
      "condition_state",
      "criticality",
    ],
    minimumEvidence: {
      minimumSourceCount: 2,
      minimumObservationCount: 10,
      minimumEvidenceConfidenceClass: "high",
      minimumTrendSufficiency: "sufficient",
      independentCorroborationRequired: true,
    },
    minimumTimeWindow: {
      minimumWindowDays: 1095,
      minimumObservationsInWindow: 10,
      maximumObservationGapDays: 365,
    },
    requiredConfidence: {
      minimumEvidenceConfidenceScore: 0.7,
      minimumTrendConfidenceScore: 0.6,
      uncertaintyQuantificationRequired: true,
    },
    requiredGovernance: SAFETY_CRITICAL_GOVERNANCE,
    allowedMethodClasses: ["deterministic", "statistical", "hybrid"],
    prohibitedUses: [
      ...UNIVERSAL_PROHIBITED_USES,
      "statutory_inspection_interval_extension",
      "cmms_schedule_mutation",
    ],
    status: "reserved",
    certified: false,
  },
] as const;

export const PREDICTIVE_OBJECTIVE_IDS: readonly PredictiveObjectiveId[] =
  PREDICTIVE_OBJECTIVE_REGISTRY.map((o) => o.objectiveId);

/**
 * Objectives that can never reach a ready state in Phase 10J regardless of
 * evidence quality.
 */
export const PHASE_10J_PERMANENTLY_NOT_READY_OBJECTIVES: readonly PredictiveObjectiveId[] = [
  "probability_of_failure",
  "remaining_useful_life",
] as const;

export function getPredictiveObjective(
  objectiveId: string,
): PredictiveObjectiveDefinition | undefined {
  return PREDICTIVE_OBJECTIVE_REGISTRY.find((o) => o.objectiveId === objectiveId);
}

export function assertRegisteredObjective(objectiveId: string): PredictiveObjectiveDefinition {
  const entry = getPredictiveObjective(objectiveId);
  if (!entry) {
    throw new Error(`unregistered_predictive_objective:${objectiveId}`);
  }
  return entry;
}

export function isPredictiveObjectiveCertified(_objectiveId: string): false {
  return false;
}

export function isPermanentlyNotReadyInPhase10J(objectiveId: string): boolean {
  return PHASE_10J_PERMANENTLY_NOT_READY_OBJECTIVES.includes(
    objectiveId as PredictiveObjectiveId,
  );
}

export function listObjectivesForMethodClass(
  methodClass: PredictiveMethodClass,
): readonly PredictiveObjectiveDefinition[] {
  return PREDICTIVE_OBJECTIVE_REGISTRY.filter((o) =>
    o.allowedMethodClasses.includes(methodClass),
  );
}
