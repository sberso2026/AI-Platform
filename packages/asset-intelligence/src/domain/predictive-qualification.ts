/**
 * Phase 10J — Predictive method qualification framework.
 *
 * Qualification asks one question: against a frozen fixture set, does a method
 * behave acceptably within a stated applicability domain? The evaluation is
 * deterministic and reproducible — same fixture set, same criteria, same
 * observed metrics, same verdict.
 *
 * Passing qualification does not certify the method and does not enable
 * production execution.
 */

import type { PredictiveObjectiveId } from "./predictive-objectives";
import { assertRegisteredObjective } from "./predictive-objectives";
import { assertRegisteredMethod } from "./predictive-methods";
import { assertRegisteredMetric, getValidationMetric } from "./predictive-validation-metrics";
import type {
  AcceptanceCriterion,
  PredictiveMethodQualificationState,
  QualificationMetricResult,
  QualificationStatus,
} from "./predictive-governance";

export type QualificationDraftInput = {
  methodId: string;
  objectiveId: PredictiveObjectiveId | string;
  /** Frozen fixture set identifier and content hash — both required for reruns. */
  fixtureSetRef: string;
  fixtureSetHash: string;
  fixtureCount: number;
  applicabilityDomain?: readonly string[];
  acceptanceCriteria: readonly AcceptanceCriterion[];
  tenantId?: string;
  workspaceId?: string;
  createdAt?: string;
  id?: string;
  version?: number;
};

export type ObservedMetricValue = {
  metricId: string;
  observedValue: number;
  note?: string;
};

export type QualificationEvaluationOptions = {
  evaluatedAt?: string;
  evaluatorId?: string;
  /** False when the fixture run could not be reproduced bit-for-bit. */
  reproducible?: boolean;
  /** Hash of the fixture set actually used; mismatch invalidates the run. */
  observedFixtureSetHash?: string;
};

/**
 * Builds an unevaluated qualification record. Fails closed on unregistered
 * methods, objectives, metrics, or malformed criteria.
 */
export function createQualificationDraft(
  input: QualificationDraftInput,
): PredictiveMethodQualificationState {
  const method = assertRegisteredMethod(input.methodId);
  const objective = assertRegisteredObjective(input.objectiveId);

  if (!method.applicableObjectives.includes(objective.objectiveId)) {
    throw new Error(
      `method_not_applicable_to_objective:${method.methodId}:${objective.objectiveId}`,
    );
  }
  if (!input.fixtureSetRef || !input.fixtureSetHash) {
    throw new Error("fixture_set_reference_and_hash_required");
  }
  if (input.fixtureCount <= 0) {
    throw new Error("fixture_set_empty");
  }
  if (input.acceptanceCriteria.length === 0) {
    throw new Error("acceptance_criteria_required");
  }

  const criteria = normaliseCriteria(input.acceptanceCriteria, method.methodClass);

  return {
    id: input.id ?? `qualification_${method.methodId}_${objective.objectiveId}_${input.fixtureSetHash}`,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    methodId: method.methodId,
    methodDefinitionVersion: method.version,
    methodClass: method.methodClass,
    methodStatusAtQualification: method.status,
    objectiveId: objective.objectiveId,
    version: input.version ?? 1,
    qualificationStatus: "draft",
    fixtureSetRef: input.fixtureSetRef,
    fixtureSetHash: input.fixtureSetHash,
    fixtureCount: input.fixtureCount,
    applicabilityDomain: [...(input.applicabilityDomain ?? method.applicabilityConditions)],
    acceptanceCriteria: criteria,
    results: [],
    failedMandatoryMetricIds: [],
    reproducible: false,
    reviewStatus: "draft",
    provenance: {
      framework: "predictive_method_qualification_v1",
      methodStatus: method.status,
      objectiveStatus: objective.status,
      fixtureSetRef: input.fixtureSetRef,
      fixtureSetHash: input.fixtureSetHash,
    },
    limitations: [
      "qualification_is_fixture_bounded",
      "qualification_does_not_grant_certification",
      "qualification_does_not_enable_production_execution",
      ...method.limitations,
    ],
    createdAt: input.createdAt ?? new Date().toISOString(),
    certificationGranted: false,
    productionExecutionEnabled: false,
    predictiveMlEnabled: false,
    predictiveMethodsCertified: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    isHealthFactor: false,
    autonomousExecutionForbidden: true,
  };
}

/**
 * Scores observed fixture metrics against the draft's acceptance criteria.
 * Pure and order-independent: results are sorted by metric id so repeated runs
 * on the same inputs produce identical records.
 */
export function evaluateAgainstAcceptanceCriteria(
  draft: PredictiveMethodQualificationState,
  observed: readonly ObservedMetricValue[],
  options: QualificationEvaluationOptions = {},
): PredictiveMethodQualificationState {
  const observedByMetric = new Map<string, ObservedMetricValue>();
  for (const value of observed) {
    observedByMetric.set(value.metricId, value);
  }

  const hashMismatch =
    options.observedFixtureSetHash !== undefined &&
    options.observedFixtureSetHash !== draft.fixtureSetHash;
  const reproducible = options.reproducible !== false && !hashMismatch;

  const results: QualificationMetricResult[] = [];
  const missingMetricIds: string[] = [];

  for (const criterion of [...draft.acceptanceCriteria].sort(byMetricId)) {
    const value = observedByMetric.get(criterion.metricId);
    if (!value) {
      missingMetricIds.push(criterion.metricId);
      continue;
    }
    results.push({
      metricId: criterion.metricId,
      observedValue: value.observedValue,
      comparator: criterion.comparator,
      threshold: criterion.threshold,
      tolerance: criterion.tolerance,
      mandatory: criterion.mandatory,
      passed: satisfiesCriterion(criterion, value.observedValue),
      note: value.note,
    });
  }

  const failedMandatoryMetricIds = results
    .filter((r) => r.mandatory && !r.passed)
    .map((r) => r.metricId);
  const missingMandatory = draft.acceptanceCriteria.filter(
    (c) => c.mandatory && missingMetricIds.includes(c.metricId),
  );

  const qualificationStatus: QualificationStatus = !reproducible
    ? "inconclusive"
    : missingMandatory.length > 0
      ? "inconclusive"
      : failedMandatoryMetricIds.length > 0
        ? "failed"
        : results.length === 0
          ? "inconclusive"
          : "passed";

  const limitations = [...draft.limitations];
  if (hashMismatch) limitations.push("fixture_set_hash_mismatch");
  if (!reproducible) limitations.push("qualification_run_not_reproducible");
  for (const metricId of missingMetricIds) {
    limitations.push(`metric_not_reported:${metricId}`);
  }
  if (qualificationStatus === "passed") {
    limitations.push("passed_within_fixture_domain_only");
  }

  return {
    ...draft,
    qualificationStatus,
    results,
    failedMandatoryMetricIds,
    reproducible,
    evaluatedAt: options.evaluatedAt ?? draft.evaluatedAt,
    evaluatorId: options.evaluatorId ?? draft.evaluatorId,
    limitations: [...new Set(limitations)],
    provenance: {
      ...draft.provenance,
      evaluatedMetricCount: results.length,
      missingMetricIds,
      reproducible,
    },
    certificationGranted: false,
    productionExecutionEnabled: false,
    predictiveMlEnabled: false,
    predictiveMethodsCertified: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    isHealthFactor: false,
    autonomousExecutionForbidden: true,
  };
}

/**
 * Qualification outcome carries no production authority; certification remains
 * a separate, later, human decision.
 */
export function qualificationGrantsExecution(
  _state: PredictiveMethodQualificationState,
): false {
  return false;
}

export function satisfiesCriterion(criterion: AcceptanceCriterion, observedValue: number): boolean {
  if (!Number.isFinite(observedValue)) return false;
  switch (criterion.comparator) {
    case "lte":
      return observedValue <= criterion.threshold;
    case "gte":
      return observedValue >= criterion.threshold;
    case "within_tolerance_of":
      return Math.abs(observedValue - criterion.threshold) <= (criterion.tolerance ?? 0);
    default:
      return false;
  }
}

function normaliseCriteria(
  criteria: readonly AcceptanceCriterion[],
  methodClass: PredictiveMethodQualificationState["methodClass"],
): AcceptanceCriterion[] {
  const seen = new Set<string>();
  const normalised: AcceptanceCriterion[] = [];

  for (const criterion of criteria) {
    const metric = assertRegisteredMetric(criterion.metricId);
    if (seen.has(criterion.metricId)) {
      throw new Error(`duplicate_acceptance_criterion:${criterion.metricId}`);
    }
    seen.add(criterion.metricId);

    if (!metric.applicableMethodClasses.includes(methodClass)) {
      throw new Error(
        `metric_not_applicable_to_method_class:${criterion.metricId}:${methodClass}`,
      );
    }
    if (!Number.isFinite(criterion.threshold)) {
      throw new Error(`acceptance_threshold_invalid:${criterion.metricId}`);
    }
    if (
      criterion.comparator === "within_tolerance_of" &&
      !(criterion.tolerance !== undefined && criterion.tolerance > 0)
    ) {
      throw new Error(`acceptance_tolerance_required:${criterion.metricId}`);
    }
    normalised.push({ ...criterion });
  }

  return normalised.sort(byMetricId);
}

function byMetricId(a: { metricId: string }, b: { metricId: string }): number {
  return a.metricId.localeCompare(b.metricId);
}

/**
 * Default criteria skeleton for a metric set. Thresholds must still be set by
 * engineering review — the registry deliberately defines none.
 */
export function draftAcceptanceCriteria(
  metricIds: readonly string[],
  thresholds: Readonly<Record<string, number>>,
  options: {
    /** Required for target-value metrics such as bias and coverage. */
    tolerances?: Readonly<Record<string, number>>;
    mandatoryMetricIds?: readonly string[];
  } = {},
): AcceptanceCriterion[] {
  const mandatoryMetricIds = options.mandatoryMetricIds ?? metricIds;

  return metricIds.map((metricId) => {
    const metric = assertRegisteredMetric(metricId);
    const threshold = thresholds[metricId];
    if (threshold === undefined) {
      throw new Error(`acceptance_threshold_missing:${metricId}`);
    }
    const comparator: AcceptanceCriterion["comparator"] =
      metric.direction === "lower_is_better"
        ? "lte"
        : metric.direction === "higher_is_better"
          ? "gte"
          : "within_tolerance_of";
    const tolerance = options.tolerances?.[metricId];
    if (comparator === "within_tolerance_of" && !(tolerance !== undefined && tolerance > 0)) {
      throw new Error(`acceptance_tolerance_missing:${metricId}`);
    }
    return {
      metricId,
      comparator,
      threshold,
      tolerance: comparator === "within_tolerance_of" ? tolerance : undefined,
      mandatory: mandatoryMetricIds.includes(metricId),
      rationale: getValidationMetric(metricId)?.applicabilityNote,
    };
  });
}
