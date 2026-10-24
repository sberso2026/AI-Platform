/**
 * Phase 10J — Predictive Method Eligibility Engine.
 *
 * Decides whether a registered method could be considered for an objective on a
 * given asset, and emits a `PredictiveMethodCandidate` recording that judgement.
 * The engine never executes a method and never produces a predicted value; when
 * assumptions are violated or evidence is unsuitable it abstains by returning
 * `ineligible`.
 */

import { PREDICTIVE_ML_ENABLED, PRODUCTION_PREDICTIVE_EXECUTION_ENABLED } from "../version";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { TrendConfidenceAssessment } from "./trend-confidence";
import {
  assertRegisteredObjective,
  isPermanentlyNotReadyInPhase10J,
  type PredictiveObjectiveDefinition,
} from "./predictive-objectives";
import {
  assertRegisteredMethod,
  BLOCKED_METHOD_STATUSES,
  QUALIFIABLE_METHOD_STATUSES,
  type PredictiveMethodDefinition,
} from "./predictive-methods";
import {
  DEFAULT_PREDICTIVE_FRESHNESS_POLICY,
  type FreshnessPolicy,
  type ObjectivePredictiveReadinessState,
  type PredictiveEligibilityOutcome,
  type PredictiveMethodCandidate,
} from "./predictive-governance";

export type PredictiveEligibilityInput = {
  objectiveId: string;
  methodId: string;
  readiness: ObjectivePredictiveReadinessState;
  evidenceConfidence?: EvidenceConfidenceAssessment;
  trendConfidence?: TrendConfidenceAssessment;
  /** Assumptions the requester states are held for this asset. */
  assertedAssumptions?: readonly string[];
  /** Assumptions known to be violated — any entry forces abstention. */
  violatedAssumptions?: readonly string[];
  satisfiedApplicabilityConditions?: readonly string[];
  freshnessPolicy?: FreshnessPolicy;
  qualificationRef?: string;
  qualificationPassed?: boolean;
  proposedAt?: string;
};

export type PredictiveEligibilityResult = {
  outcome: PredictiveEligibilityOutcome;
  candidate: PredictiveMethodCandidate;
  /** Constant in Phase 10J: eligibility is not permission to run. */
  executionAllowed: false;
  abstained: boolean;
};

export type PredictiveMethodEligibilityEngineDeps = {
  newId?: (prefix: string) => string;
};

export class PredictiveMethodEligibilityEngine {
  readonly kind = "predictive_method_eligibility_engine" as const;
  private readonly newId: (prefix: string) => string;

  constructor(deps: PredictiveMethodEligibilityEngineDeps = {}) {
    this.newId = deps.newId ?? ((p) => `${p}_${crypto.randomUUID()}`);
  }

  evaluate(input: PredictiveEligibilityInput): PredictiveEligibilityResult {
    const objective = assertRegisteredObjective(input.objectiveId);
    const method = assertRegisteredMethod(input.methodId);
    const policy = input.freshnessPolicy ?? DEFAULT_PREDICTIVE_FRESHNESS_POLICY;
    const readiness = input.readiness;

    const rationale: string[] = [];
    const unmet: string[] = [];
    const conditions: string[] = [];
    const limitations: string[] = [
      "eligibility_is_not_permission_to_execute",
      "production_predictive_execution_enabled=false",
    ];

    let outcome: PredictiveEligibilityOutcome = "eligible";
    const disqualify = (reason: string) => {
      unmet.push(reason);
      outcome = "ineligible";
    };
    const restrict = (condition: string) => {
      conditions.push(condition);
      if (outcome === "eligible") outcome = "conditionally_eligible";
    };

    if (readiness.objectiveId !== objective.objectiveId) {
      disqualify(`readiness_objective_mismatch:${readiness.objectiveId}`);
    }

    outcome = applyApplicability(objective, method, disqualify, rationale, outcome);
    outcome = applyMethodStatus(method, disqualify, restrict, rationale, outcome);
    outcome = applyReadiness(objective, readiness, disqualify, restrict, rationale, outcome);
    outcome = applyFreshness(readiness, policy, disqualify, restrict, rationale, outcome);
    outcome = applyConfidence(
      objective,
      input.evidenceConfidence,
      input.trendConfidence,
      disqualify,
      restrict,
      outcome,
    );
    outcome = applyAssumptions(method, input, disqualify, restrict, rationale, outcome);

    // Recompute from the accumulated findings so ordering of checks cannot
    // change the verdict.
    const finalOutcome: PredictiveEligibilityOutcome =
      unmet.length > 0 ? "ineligible" : conditions.length > 0 ? "conditionally_eligible" : outcome;

    if (finalOutcome === "eligible") {
      rationale.push("method_may_be_proposed_for_qualification");
      limitations.push("qualification_and_certification_still_required");
    } else if (finalOutcome === "ineligible") {
      rationale.push("abstained_method_not_applicable");
    }

    if (input.qualificationRef && input.qualificationPassed !== true) {
      limitations.push("qualification_not_passed");
    }

    const candidate: PredictiveMethodCandidate = {
      id: this.newId("pred_candidate"),
      tenantId: readiness.tenantId,
      workspaceId: readiness.workspaceId,
      assetId: readiness.assetId,
      objectiveId: objective.objectiveId,
      methodId: method.methodId,
      methodDefinitionVersion: method.version,
      methodClass: method.methodClass,
      version: 1,
      eligibility: finalOutcome,
      eligibilityRationale: dedupe(rationale),
      outstandingConditions: dedupe(conditions),
      unmetRequirements: dedupe(unmet),
      assumptionsAsserted: dedupe(input.assertedAssumptions ?? []),
      assumptionsViolated: dedupe(input.violatedAssumptions ?? []),
      readinessStateRef: readiness.id,
      readinessClass: readiness.readinessClass,
      fusionProvenance: readiness.fusionProvenance,
      freshnessPolicyRef: policy.policyId,
      freshnessState: readiness.freshnessState,
      qualificationRef: input.qualificationRef,
      method: "predictive_method_candidate_v1",
      methodVersion: "1",
      reviewStatus: "draft",
      provenance: {
        engine: "PredictiveMethodEligibilityEngine",
        objectiveStatus: objective.status,
        methodStatus: method.status,
        methodClass: method.methodClass,
        readinessRef: readiness.id,
        readinessClass: readiness.readinessClass,
        predictiveMlEnabled: PREDICTIVE_ML_ENABLED,
        productionPredictiveExecutionEnabled: PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
      },
      limitations: dedupe([...limitations, ...method.limitations]),
      proposedAt: input.proposedAt ?? new Date().toISOString(),
      containsPredictionOutput: false,
      predictiveMlExecuted: false,
      predictiveMethodsCertified: false,
      productionExecutionEnabled: false,
      probabilityOfFailureCertified: false,
      rulClaimsCertified: false,
      isHealthFactor: false,
      autonomousExecutionForbidden: true,
    };

    return {
      outcome: finalOutcome,
      candidate,
      executionAllowed: false,
      abstained: finalOutcome === "ineligible",
    };
  }

  /** Evaluate every registered method that names the objective. */
  evaluateAll(
    methodIds: readonly string[],
    input: Omit<PredictiveEligibilityInput, "methodId">,
  ): PredictiveEligibilityResult[] {
    return methodIds.map((methodId) => this.evaluate({ ...input, methodId }));
  }
}

export function createPredictiveMethodEligibilityEngine(
  deps?: PredictiveMethodEligibilityEngineDeps,
): PredictiveMethodEligibilityEngine {
  return new PredictiveMethodEligibilityEngine(deps);
}

function applyApplicability(
  objective: PredictiveObjectiveDefinition,
  method: PredictiveMethodDefinition,
  disqualify: (reason: string) => void,
  rationale: string[],
  outcome: PredictiveEligibilityOutcome,
): PredictiveEligibilityOutcome {
  if (!method.applicableObjectives.includes(objective.objectiveId)) {
    disqualify(`method_not_applicable_to_objective:${objective.objectiveId}`);
    return "ineligible";
  }
  if (!objective.allowedMethodClasses.includes(method.methodClass)) {
    disqualify(`method_class_not_allowed_for_objective:${method.methodClass}`);
    return "ineligible";
  }
  rationale.push("method_applicable_to_objective");
  return outcome;
}

function applyMethodStatus(
  method: PredictiveMethodDefinition,
  disqualify: (reason: string) => void,
  restrict: (condition: string) => void,
  rationale: string[],
  outcome: PredictiveEligibilityOutcome,
): PredictiveEligibilityOutcome {
  if (method.suspendedFromExecution) {
    disqualify(`method_suspended_from_execution:${method.methodId}`);
    return "ineligible";
  }
  if (BLOCKED_METHOD_STATUSES.includes(method.status)) {
    disqualify(`method_status_blocked:${method.status}`);
    return "ineligible";
  }
  if (method.methodClass === "machine_learning" && !PREDICTIVE_ML_ENABLED) {
    disqualify("predictive_ml_enabled=false");
    return "ineligible";
  }
  if (!QUALIFIABLE_METHOD_STATUSES.includes(method.status)) {
    restrict(`method_status_requires_registration:${method.status}`);
    return outcome === "eligible" ? "conditionally_eligible" : outcome;
  }
  if (method.status !== "qualified") {
    restrict("method_qualification_outstanding");
    return outcome === "eligible" ? "conditionally_eligible" : outcome;
  }
  rationale.push("method_status_permits_candidacy");
  return outcome;
}

function applyReadiness(
  objective: PredictiveObjectiveDefinition,
  readiness: ObjectivePredictiveReadinessState,
  disqualify: (reason: string) => void,
  restrict: (condition: string) => void,
  rationale: string[],
  outcome: PredictiveEligibilityOutcome,
): PredictiveEligibilityOutcome {
  if (isPermanentlyNotReadyInPhase10J(objective.objectiveId)) {
    disqualify(`objective_uncertified_in_phase_10j:${objective.objectiveId}`);
    return "ineligible";
  }
  switch (readiness.readinessClass) {
    case "sufficient":
      rationale.push("objective_readiness_sufficient");
      return outcome;
    case "limited":
      restrict("objective_readiness_limited");
      return outcome === "eligible" ? "conditionally_eligible" : outcome;
    case "conflicting":
      disqualify("objective_readiness_conflicting");
      return "ineligible";
    case "insufficient":
      disqualify("objective_readiness_insufficient");
      return "ineligible";
    default:
      disqualify("objective_readiness_not_ready");
      return "ineligible";
  }
}

function applyFreshness(
  readiness: ObjectivePredictiveReadinessState,
  policy: FreshnessPolicy,
  disqualify: (reason: string) => void,
  restrict: (condition: string) => void,
  rationale: string[],
  outcome: PredictiveEligibilityOutcome,
): PredictiveEligibilityOutcome {
  switch (readiness.freshnessState) {
    case "fresh":
      rationale.push("evidence_within_freshness_policy");
      return outcome;
    case "aging":
      restrict(`evidence_aging:${policy.policyId}`);
      return outcome === "eligible" ? "conditionally_eligible" : outcome;
    case "unknown":
      restrict("evidence_age_unknown");
      return outcome === "eligible" ? "conditionally_eligible" : outcome;
    default:
      disqualify(`evidence_stale:${policy.policyId}`);
      return "ineligible";
  }
}

function applyConfidence(
  objective: PredictiveObjectiveDefinition,
  ec: EvidenceConfidenceAssessment | undefined,
  tc: TrendConfidenceAssessment | undefined,
  disqualify: (reason: string) => void,
  restrict: (condition: string) => void,
  outcome: PredictiveEligibilityOutcome,
): PredictiveEligibilityOutcome {
  const required = objective.requiredConfidence;

  if (!ec) {
    restrict("evidence_confidence_not_supplied");
    outcome = outcome === "eligible" ? "conditionally_eligible" : outcome;
  } else if (
    ec.dataSufficiency === "conflicting" ||
    ec.dataSufficiency === "revoked" ||
    ec.dataSufficiency === "stale"
  ) {
    disqualify(`evidence_${ec.dataSufficiency}`);
    return "ineligible";
  } else if (ec.score < required.minimumEvidenceConfidenceScore) {
    restrict(
      `evidence_confidence_below_minimum:${ec.score.toFixed(2)}<${required.minimumEvidenceConfidenceScore}`,
    );
    outcome = outcome === "eligible" ? "conditionally_eligible" : outcome;
  }

  if (!tc) {
    restrict("trend_confidence_not_supplied");
    return outcome === "eligible" ? "conditionally_eligible" : outcome;
  }
  if (tc.dataSufficiency === "conflicting" || tc.dataSufficiency === "revoked") {
    disqualify(`trend_${tc.dataSufficiency}`);
    return "ineligible";
  }
  if (tc.score < required.minimumTrendConfidenceScore) {
    restrict(
      `trend_confidence_below_minimum:${tc.score.toFixed(2)}<${required.minimumTrendConfidenceScore}`,
    );
    return outcome === "eligible" ? "conditionally_eligible" : outcome;
  }
  return outcome;
}

function applyAssumptions(
  method: PredictiveMethodDefinition,
  input: PredictiveEligibilityInput,
  disqualify: (reason: string) => void,
  restrict: (condition: string) => void,
  rationale: string[],
  outcome: PredictiveEligibilityOutcome,
): PredictiveEligibilityOutcome {
  const violated = input.violatedAssumptions ?? [];
  if (violated.length > 0) {
    for (const assumption of violated) {
      disqualify(`assumption_violated:${assumption}`);
    }
    rationale.push("abstained_assumptions_violated");
    return "ineligible";
  }

  const asserted = new Set(input.assertedAssumptions ?? []);
  const unasserted = method.assumptions.filter((a) => !asserted.has(a));
  if (unasserted.length > 0) {
    for (const assumption of unasserted) {
      restrict(`assumption_unverified:${assumption}`);
    }
    outcome = outcome === "eligible" ? "conditionally_eligible" : outcome;
  } else {
    rationale.push("method_assumptions_asserted");
  }

  const satisfiedConditions = new Set(input.satisfiedApplicabilityConditions ?? []);
  const outstanding = method.applicabilityConditions.filter((c) => !satisfiedConditions.has(c));
  if (outstanding.length > 0) {
    for (const condition of outstanding) {
      restrict(`applicability_condition_outstanding:${condition}`);
    }
    return outcome === "eligible" ? "conditionally_eligible" : outcome;
  }
  return outcome;
}

function dedupe(values: readonly string[]): string[] {
  return [...new Set(values)];
}
