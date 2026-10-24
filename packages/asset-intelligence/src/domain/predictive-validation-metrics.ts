/**
 * Phase 10J — Predictive Validation Metric Registry.
 *
 * Metrics define how a method would be measured during qualification. A metric
 * being registered says nothing about whether any method or objective has met
 * it: registering probability-of-failure calibration metrics does not imply
 * probability-of-failure certification.
 */

import type { PredictiveMethodClass } from "./predictive-objectives";

export type ValidationMetricFamily =
  | "point_error"
  | "relative_error"
  | "bias"
  | "interval"
  | "classification"
  | "probabilistic";

export type MetricDirection = "lower_is_better" | "higher_is_better" | "target_value";

export type ValidationMetricDefinition = {
  metricId: string;
  version: string;
  name: string;
  family: ValidationMetricFamily;
  description: string;
  direction: MetricDirection;
  unit: "same_as_measurand" | "ratio" | "percent" | "dimensionless";
  targetValue?: number;
  /** Method classes the metric is meaningful for, with the reason it applies. */
  applicableMethodClasses: readonly PredictiveMethodClass[];
  applicabilityNote: string;
  requiresGroundTruth: boolean;
  requiresIntervalOutput: boolean;
  requiresProbabilisticOutput: boolean;
  interpretationLimits: readonly string[];
  status: "registered" | "reserved";
  /** Registration never implies an accepted threshold or a certified claim. */
  acceptanceThresholdDefined: false;
  certificationImplied: false;
  probabilityOfFailureCertified: false;
  rulClaimsCertified: false;
};

const ALL_METHOD_CLASSES: readonly PredictiveMethodClass[] = [
  "deterministic",
  "statistical",
  "physics_based",
  "hybrid",
  "machine_learning",
] as const;

const PROBABILISTIC_METHOD_CLASSES: readonly PredictiveMethodClass[] = [
  "statistical",
  "hybrid",
  "machine_learning",
] as const;

export const VALIDATION_METRIC_REGISTRY: readonly ValidationMetricDefinition[] = [
  {
    metricId: "mae",
    version: "1",
    name: "Mean absolute error",
    family: "point_error",
    description: "Mean of absolute differences between estimated and observed values.",
    direction: "lower_is_better",
    unit: "same_as_measurand",
    applicableMethodClasses: ALL_METHOD_CLASSES,
    applicabilityNote:
      "Applies to any method producing point estimates on a continuous measurand.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: false,
    interpretationLimits: [
      "scale_dependent",
      "insensitive_to_error_direction",
      "dominated_by_measurand_variance_in_small_fixtures",
    ],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "rmse",
    version: "1",
    name: "Root mean squared error",
    family: "point_error",
    description: "Square root of the mean squared error between estimated and observed values.",
    direction: "lower_is_better",
    unit: "same_as_measurand",
    applicableMethodClasses: ALL_METHOD_CLASSES,
    applicabilityNote:
      "Applies to any point-estimating method; preferred where large errors are disproportionately costly.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: false,
    interpretationLimits: ["scale_dependent", "highly_sensitive_to_outliers"],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "mape",
    version: "1",
    name: "Mean absolute percentage error",
    family: "relative_error",
    description: "Mean of absolute errors expressed as a percentage of observed values.",
    direction: "lower_is_better",
    unit: "percent",
    applicableMethodClasses: ALL_METHOD_CLASSES,
    applicabilityNote:
      "Applies to point-estimating methods on strictly positive measurands only.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: false,
    interpretationLimits: [
      "undefined_at_zero_observed_values",
      "asymmetric_penalty_for_over_and_under_estimation",
    ],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "bias",
    version: "1",
    name: "Mean signed error (bias)",
    family: "bias",
    description: "Mean signed difference between estimated and observed values.",
    direction: "target_value",
    unit: "same_as_measurand",
    targetValue: 0,
    applicableMethodClasses: ALL_METHOD_CLASSES,
    applicabilityNote:
      "Applies to all classes; the primary check that a method is not systematically optimistic.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: false,
    interpretationLimits: ["cancels_offsetting_errors", "near_zero_bias_does_not_imply_accuracy"],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "coverage",
    version: "1",
    name: "Empirical coverage",
    family: "interval",
    description:
      "Fraction of observed values falling inside the method's stated uncertainty bounds.",
    direction: "target_value",
    unit: "ratio",
    targetValue: 0.9,
    applicableMethodClasses: ["statistical", "physics_based", "hybrid", "machine_learning"],
    applicabilityNote:
      "Applies only to methods that emit uncertainty bounds; deterministic point methods are out of scope.",
    requiresGroundTruth: true,
    requiresIntervalOutput: true,
    requiresProbabilisticOutput: false,
    interpretationLimits: [
      "trivially_satisfied_by_arbitrarily_wide_intervals",
      "must_be_read_alongside_interval_width",
    ],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "confidence_interval_coverage",
    version: "1",
    name: "Confidence interval coverage",
    family: "interval",
    description:
      "Coverage measured against the nominal confidence level declared by the method.",
    direction: "target_value",
    unit: "ratio",
    targetValue: 0.95,
    applicableMethodClasses: ["statistical", "physics_based", "hybrid", "machine_learning"],
    applicabilityNote:
      "Applies to methods declaring a nominal confidence level; compares realised against nominal coverage.",
    requiresGroundTruth: true,
    requiresIntervalOutput: true,
    requiresProbabilisticOutput: false,
    interpretationLimits: [
      "requires_declared_nominal_level",
      "unreliable_on_small_fixture_populations",
    ],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "precision",
    version: "1",
    name: "Precision",
    family: "classification",
    description:
      "Fraction of flagged events that were observed, for methods emitting discrete event flags.",
    direction: "higher_is_better",
    unit: "ratio",
    applicableMethodClasses: ["deterministic", "statistical", "hybrid", "machine_learning"],
    applicabilityNote:
      "Applies to event-flagging methods such as threshold crossing or failure mode forecasting.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: false,
    interpretationLimits: ["misleading_under_class_imbalance", "must_be_paired_with_recall"],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "recall",
    version: "1",
    name: "Recall",
    family: "classification",
    description: "Fraction of observed events that the method flagged.",
    direction: "higher_is_better",
    unit: "ratio",
    applicableMethodClasses: ["deterministic", "statistical", "hybrid", "machine_learning"],
    applicabilityNote:
      "Applies to event-flagging methods; the governing metric where missed events carry safety consequence.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: false,
    interpretationLimits: ["trivially_satisfied_by_flagging_everything", "must_be_paired_with_precision"],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "false_positive_rate",
    version: "1",
    name: "False positive rate",
    family: "classification",
    description: "Fraction of non-events incorrectly flagged as events.",
    direction: "lower_is_better",
    unit: "ratio",
    applicableMethodClasses: ["deterministic", "statistical", "hybrid", "machine_learning"],
    applicabilityNote:
      "Applies to event-flagging methods; governs unnecessary intervention burden.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: false,
    interpretationLimits: ["depends_on_flagging_threshold", "sensitive_to_non_event_population_size"],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "false_negative_rate",
    version: "1",
    name: "False negative rate",
    family: "classification",
    description: "Fraction of observed events the method failed to flag.",
    direction: "lower_is_better",
    unit: "ratio",
    applicableMethodClasses: ["deterministic", "statistical", "hybrid", "machine_learning"],
    applicabilityNote:
      "Applies to event-flagging methods; the safety-dominant error type for degradation and failure objectives.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: false,
    interpretationLimits: ["depends_on_flagging_threshold", "unstable_on_rare_event_fixtures"],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "calibration_error",
    version: "1",
    name: "Calibration error",
    family: "probabilistic",
    description:
      "Deviation between predicted probabilities and observed event frequencies across probability bins.",
    direction: "lower_is_better",
    unit: "dimensionless",
    applicableMethodClasses: PROBABILISTIC_METHOD_CLASSES,
    applicabilityNote:
      "Applies to methods emitting probabilities. Registered for future probability-of-failure work; registration does not certify probability-of-failure.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: true,
    interpretationLimits: [
      "requires_large_observed_event_population",
      "bin_choice_sensitive",
      "does_not_imply_probability_of_failure_certification",
    ],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
  {
    metricId: "brier_score",
    version: "1",
    name: "Brier score",
    family: "probabilistic",
    description:
      "Mean squared difference between predicted event probabilities and binary observed outcomes.",
    direction: "lower_is_better",
    unit: "dimensionless",
    applicableMethodClasses: PROBABILISTIC_METHOD_CLASSES,
    applicabilityNote:
      "Applies to methods emitting probabilities. Registered for future probability-of-failure work; registration does not certify probability-of-failure.",
    requiresGroundTruth: true,
    requiresIntervalOutput: false,
    requiresProbabilisticOutput: true,
    interpretationLimits: [
      "conflates_calibration_and_resolution",
      "requires_baseline_comparison_to_be_meaningful",
      "does_not_imply_probability_of_failure_certification",
    ],
    status: "registered",
    acceptanceThresholdDefined: false,
    certificationImplied: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
  },
] as const;

export const VALIDATION_METRIC_IDS: readonly string[] = VALIDATION_METRIC_REGISTRY.map(
  (m) => m.metricId,
);

/** Metrics that speak to probability calibration — registered, never certifying. */
export const PROBABILITY_CALIBRATION_METRIC_IDS: readonly string[] = [
  "calibration_error",
  "brier_score",
] as const;

export function getValidationMetric(metricId: string): ValidationMetricDefinition | undefined {
  return VALIDATION_METRIC_REGISTRY.find((m) => m.metricId === metricId);
}

export function assertRegisteredMetric(metricId: string): ValidationMetricDefinition {
  const entry = getValidationMetric(metricId);
  if (!entry) {
    throw new Error(`unregistered_validation_metric:${metricId}`);
  }
  return entry;
}

export function listMetricsForMethodClass(
  methodClass: PredictiveMethodClass,
): readonly ValidationMetricDefinition[] {
  return VALIDATION_METRIC_REGISTRY.filter((m) =>
    m.applicableMethodClasses.includes(methodClass),
  );
}

/**
 * Explicit statement of the Phase 10J boundary: calibration metrics exist so
 * that probability-of-failure work can be evaluated later, not so that it can
 * be claimed now.
 */
export function probabilityOfFailureCertifiedByMetrics(): false {
  return false;
}
