/**
 * Phase 10J — Predictive Method Registry.
 *
 * A registered method is a documented methodology, not an approved capability.
 * All method classes are governed equally: machine learning holds no privileged
 * position over deterministic, statistical or physics-based methods.
 */

import { PREDICTIVE_ML_ENABLED } from "../version";
import type { PredictiveMethodClass, PredictiveObjectiveId } from "./predictive-objectives";
import { getPredictiveObjective } from "./predictive-objectives";

export type { PredictiveMethodClass } from "./predictive-objectives";

export type PredictiveMethodStatus =
  | "draft"
  | "registered"
  | "under_evaluation"
  | "qualified"
  | "certified"
  | "suspended"
  | "deprecated"
  | "revoked";

/** Statuses from which a method may progress toward qualification. */
export const QUALIFIABLE_METHOD_STATUSES: readonly PredictiveMethodStatus[] = [
  "registered",
  "under_evaluation",
  "qualified",
] as const;

/** Statuses that permanently block eligibility evaluation. */
export const BLOCKED_METHOD_STATUSES: readonly PredictiveMethodStatus[] = [
  "suspended",
  "deprecated",
  "revoked",
] as const;

export type PredictiveMethodClassEntry = {
  methodClass: PredictiveMethodClass;
  description: string;
  requiresDocumentedPhysicalBasis: boolean;
  requiresTrainingData: boolean;
  requiresUncertaintyQuantification: boolean;
  mlGovernanceApplies: boolean;
  /** Every class carries the same governance burden. */
  governanceParity: true;
};

export const PREDICTIVE_METHOD_CLASS_REGISTRY: readonly PredictiveMethodClassEntry[] = [
  {
    methodClass: "deterministic",
    description:
      "Closed-form or rule-based computation with fully specified inputs and no fitted parameters.",
    requiresDocumentedPhysicalBasis: false,
    requiresTrainingData: false,
    requiresUncertaintyQuantification: true,
    mlGovernanceApplies: false,
    governanceParity: true,
  },
  {
    methodClass: "statistical",
    description:
      "Parameter estimation and inference from observed data with stated distributional assumptions.",
    requiresDocumentedPhysicalBasis: false,
    requiresTrainingData: false,
    requiresUncertaintyQuantification: true,
    mlGovernanceApplies: false,
    governanceParity: true,
  },
  {
    methodClass: "physics_based",
    description:
      "Computation grounded in a documented degradation or failure mechanism with engineering-approved parameters.",
    requiresDocumentedPhysicalBasis: true,
    requiresTrainingData: false,
    requiresUncertaintyQuantification: true,
    mlGovernanceApplies: false,
    governanceParity: true,
  },
  {
    methodClass: "hybrid",
    description:
      "Combination of physical mechanism models with data-driven parameter estimation or correction.",
    requiresDocumentedPhysicalBasis: true,
    requiresTrainingData: true,
    requiresUncertaintyQuantification: true,
    mlGovernanceApplies: false,
    governanceParity: true,
  },
  {
    methodClass: "machine_learning",
    description:
      "Learned models whose behaviour is determined by training data rather than a declared mechanism.",
    requiresDocumentedPhysicalBasis: false,
    requiresTrainingData: true,
    requiresUncertaintyQuantification: true,
    mlGovernanceApplies: true,
    governanceParity: true,
  },
] as const;

/**
 * ML-specific governance artefacts. All fields are reserved in Phase 10J:
 * they describe what would have to exist before ML could be considered.
 */
export type PredictiveMlGovernance = {
  status: "reserved";
  trainingDatasetRef?: string;
  trainingDatasetLineageRef?: string;
  modelArtifactRef?: string;
  modelCardRef?: string;
  featureProvenanceRef?: string;
  driftMonitoringPlanRef?: string;
  explainabilityArtifactRef?: string;
  biasAssessmentRef?: string;
  humanOversightPlanRef?: string;
  retrainingPolicyRef?: string;
  predictiveMlEnabled: false;
};

export const RESERVED_ML_GOVERNANCE: PredictiveMlGovernance = {
  status: "reserved",
  predictiveMlEnabled: false,
};

export type PredictiveMethodDefinition = {
  methodId: string;
  version: string;
  name: string;
  description: string;
  methodClass: PredictiveMethodClass;
  applicableObjectives: readonly PredictiveObjectiveId[];
  requiredInputs: readonly string[];
  assumptions: readonly string[];
  applicabilityConditions: readonly string[];
  limitations: readonly string[];
  prohibitedUses: readonly string[];
  validationMetricIds: readonly string[];
  status: PredictiveMethodStatus;
  mlGovernance: PredictiveMlGovernance;
  /** Set when a method must not be considered even for candidacy. */
  suspendedFromExecution: boolean;
  qualificationRef?: string;
  certificationRef?: string;
  /** Phase 10J locks — no method may execute or claim certification. */
  certified: false;
  productionExecutionEnabled: false;
  autonomousExecutionForbidden: true;
  isHealthFactor: false;
};

export const PREDICTIVE_METHOD_REGISTRY: readonly PredictiveMethodDefinition[] = [
  {
    methodId: "linear_trend_extrapolation",
    version: "1",
    name: "Linear trend extrapolation",
    description:
      "Least-squares linear fit over an observed condition series, projected forward within the observed window.",
    methodClass: "statistical",
    applicableObjectives: [
      "condition_trend_projection",
      "threshold_crossing_estimation",
    ],
    requiredInputs: ["time_series", "trend_state"],
    assumptions: [
      "monotonic_degradation_within_window",
      "constant_operating_regime",
      "measurement_error_independent_and_unbiased",
    ],
    applicabilityConditions: [
      "trend_confidence_sufficient",
      "projection_horizon_within_observed_window",
      "no_change_point_detected_in_window",
    ],
    limitations: [
      "invalid_after_regime_change",
      "no_mechanism_awareness",
      "underestimates_accelerating_degradation",
    ],
    prohibitedUses: [
      "remaining_useful_life_claim",
      "probability_of_failure_claim",
      "extrapolation_beyond_observed_window",
    ],
    validationMetricIds: ["mae", "rmse", "mape", "bias", "confidence_interval_coverage"],
    status: "registered",
    mlGovernance: RESERVED_ML_GOVERNANCE,
    suspendedFromExecution: false,
    certified: false,
    productionExecutionEnabled: false,
    autonomousExecutionForbidden: true,
    isHealthFactor: false,
  },
  {
    methodId: "corrosion_rate_projection",
    version: "1",
    name: "Corrosion rate projection",
    description:
      "Mechanism-based wall-loss projection from measured thickness history and documented environment exposure.",
    methodClass: "physics_based",
    applicableObjectives: [
      "degradation_rate_estimation",
      "threshold_crossing_estimation",
    ],
    requiredInputs: [
      "time_series",
      "degradation_state",
      "material_properties",
      "environment_exposure",
      "design_basis",
    ],
    assumptions: [
      "single_dominant_corrosion_mechanism",
      "uniform_material_loss_across_measured_area",
      "stable_environment_exposure",
    ],
    applicabilityConditions: [
      "documented_material_specification_available",
      "documented_minimum_allowable_thickness_available",
      "degradation_mechanism_confirmed_by_engineer",
    ],
    limitations: [
      "not_valid_for_localised_pitting_or_cracking",
      "sensitive_to_measurement_location_repeatability",
      "environment_change_invalidates_projection",
    ],
    prohibitedUses: [
      "remaining_useful_life_claim",
      "fitness_for_service_determination",
      "statutory_inspection_interval_extension",
    ],
    validationMetricIds: ["mae", "rmse", "bias", "coverage", "confidence_interval_coverage"],
    status: "registered",
    mlGovernance: RESERVED_ML_GOVERNANCE,
    suspendedFromExecution: false,
    certified: false,
    productionExecutionEnabled: false,
    autonomousExecutionForbidden: true,
    isHealthFactor: false,
  },
  {
    methodId: "threshold_crossing_deterministic_projection",
    version: "1",
    name: "Deterministic threshold crossing projection",
    description:
      "Closed-form time-to-threshold computation from a supplied degradation rate and documented threshold.",
    methodClass: "deterministic",
    applicableObjectives: ["threshold_crossing_estimation"],
    requiredInputs: ["condition_state", "degradation_state", "design_basis"],
    assumptions: ["constant_supplied_rate", "threshold_is_engineering_approved"],
    applicabilityConditions: [
      "degradation_rate_supplied_by_qualified_method_or_engineer",
      "documented_threshold_available",
    ],
    limitations: [
      "no_uncertainty_propagation_without_supplied_rate_interval",
      "inherits_all_error_from_supplied_rate",
    ],
    prohibitedUses: ["remaining_useful_life_claim", "probability_of_failure_claim"],
    validationMetricIds: ["mae", "bias", "false_positive_rate", "false_negative_rate"],
    status: "draft",
    mlGovernance: RESERVED_ML_GOVERNANCE,
    suspendedFromExecution: false,
    certified: false,
    productionExecutionEnabled: false,
    autonomousExecutionForbidden: true,
    isHealthFactor: false,
  },
  {
    methodId: "hybrid_mechanism_calibrated_projection",
    version: "1",
    name: "Hybrid mechanism-calibrated projection",
    description:
      "Physics-based mechanism model whose parameters are calibrated against observed condition history.",
    methodClass: "hybrid",
    applicableObjectives: [
      "degradation_rate_estimation",
      "condition_trend_projection",
      "failure_mode_forecasting",
    ],
    requiredInputs: [
      "time_series",
      "degradation_state",
      "material_properties",
      "environment_exposure",
      "failure_history",
    ],
    assumptions: [
      "mechanism_model_is_applicable_to_asset_class",
      "calibration_population_is_representative",
    ],
    applicabilityConditions: [
      "calibration_fixture_set_available",
      "mechanism_model_reviewed_by_responsible_engineer",
    ],
    limitations: [
      "calibration_drift_untracked_in_phase_10j",
      "extrapolation_outside_calibration_population_invalid",
    ],
    prohibitedUses: [
      "remaining_useful_life_claim",
      "probability_of_failure_claim",
      "cross_asset_class_transfer_without_recalibration",
    ],
    validationMetricIds: ["mae", "rmse", "bias", "coverage", "calibration_error"],
    status: "draft",
    mlGovernance: RESERVED_ML_GOVERNANCE,
    suspendedFromExecution: false,
    certified: false,
    productionExecutionEnabled: false,
    autonomousExecutionForbidden: true,
    isHealthFactor: false,
  },
  {
    methodId: "generic_ml_regressor",
    version: "1",
    name: "Generic machine-learning regressor",
    description:
      "Placeholder learned regression model retained only to hold ML governance requirements in view.",
    methodClass: "machine_learning",
    applicableObjectives: ["condition_trend_projection", "degradation_rate_estimation"],
    requiredInputs: ["time_series", "condition_state"],
    assumptions: [
      "training_population_representative_of_deployment_population",
      "feature_provenance_fully_traceable",
    ],
    applicabilityConditions: [
      "predictive_ml_enabled",
      "model_card_and_lineage_registered",
      "drift_monitoring_active",
      "human_oversight_plan_approved",
    ],
    limitations: [
      "no_mechanism_awareness",
      "opaque_failure_modes",
      "no_training_or_evaluation_performed_in_phase_10j",
    ],
    prohibitedUses: [
      "any_execution_while_predictive_ml_enabled_is_false",
      "remaining_useful_life_claim",
      "probability_of_failure_claim",
      "safety_related_decision_support",
    ],
    validationMetricIds: [
      "mae",
      "rmse",
      "mape",
      "bias",
      "precision",
      "recall",
      "calibration_error",
    ],
    status: "draft",
    mlGovernance: RESERVED_ML_GOVERNANCE,
    suspendedFromExecution: true,
    certified: false,
    productionExecutionEnabled: false,
    autonomousExecutionForbidden: true,
    isHealthFactor: false,
  },
] as const;

export const PREDICTIVE_METHOD_IDS: readonly string[] = PREDICTIVE_METHOD_REGISTRY.map(
  (m) => m.methodId,
);

export function getPredictiveMethod(methodId: string): PredictiveMethodDefinition | undefined {
  return PREDICTIVE_METHOD_REGISTRY.find((m) => m.methodId === methodId);
}

export function assertRegisteredMethod(methodId: string): PredictiveMethodDefinition {
  const entry = getPredictiveMethod(methodId);
  if (!entry) {
    throw new Error(`unregistered_predictive_method:${methodId}`);
  }
  return entry;
}

export function getPredictiveMethodClass(
  methodClass: PredictiveMethodClass,
): PredictiveMethodClassEntry {
  const entry = PREDICTIVE_METHOD_CLASS_REGISTRY.find((c) => c.methodClass === methodClass);
  if (!entry) {
    throw new Error(`unregistered_predictive_method_class:${methodClass}`);
  }
  return entry;
}

export function listMethodsByClass(
  methodClass: PredictiveMethodClass,
): readonly PredictiveMethodDefinition[] {
  return PREDICTIVE_METHOD_REGISTRY.filter((m) => m.methodClass === methodClass);
}

/**
 * Methods registered against an objective, filtered by the method classes the
 * objective itself permits.
 */
export function listMethodsForObjective(
  objectiveId: string,
): readonly PredictiveMethodDefinition[] {
  const objective = getPredictiveObjective(objectiveId);
  if (!objective) return [];
  return PREDICTIVE_METHOD_REGISTRY.filter(
    (m) =>
      m.applicableObjectives.includes(objective.objectiveId) &&
      objective.allowedMethodClasses.includes(m.methodClass),
  );
}

export function isMethodBlocked(method: PredictiveMethodDefinition): boolean {
  return (
    method.suspendedFromExecution ||
    BLOCKED_METHOD_STATUSES.includes(method.status) ||
    (method.methodClass === "machine_learning" && !PREDICTIVE_ML_ENABLED)
  );
}

/** Registry invariant: no method may be seeded or promoted to certified. */
export function assertNoCertifiedMethods(
  registry: readonly PredictiveMethodDefinition[] = PREDICTIVE_METHOD_REGISTRY,
): void {
  const offenders = registry.filter((m) => m.status === "certified" || m.certified);
  if (offenders.length > 0) {
    throw new Error(
      `certified_predictive_method_forbidden:${offenders.map((m) => m.methodId).join(",")}`,
    );
  }
}
