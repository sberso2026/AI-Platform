/**
 * Phase 11E — Cost Intelligence Engine.
 *
 * Evidence-driven and abstention-first. Resolves evidence into confidence and
 * a `CostIntelligenceState`. Consumes Change Intelligence for variance
 * attribution only — a change candidate is never treated as approved.
 *
 * What it never does: post to a ledger, mutate a budget, compute earned value,
 * produce a forecast, draw contingency, execute schedule/change, or compute CPM.
 */

import type { ChangeIntelligenceState } from "./change";
import {
  attributeVarianceFromChangeIntelligence,
  costStateKey,
  currenciesCompatible,
  isAbstainingCostSufficiency,
  type CostBasisReference,
  type CostConfidence,
  type CostControlContext,
  type CostEvidence,
  type CostEvidenceDirection,
  type CostEvidenceSufficiency,
  type CostIntelligenceState,
  type CostPosture,
  type CostVarianceAttribution,
} from "./cost";
import { createCostConfidenceEngine, type CostConfidenceEngine } from "./cost-confidence";
import type { ProjectScopeRef } from "./progress";
import {
  BUDGET_LEDGER_IMPLEMENTED,
  CHANGE_EXECUTION_IMPLEMENTED,
  CONTINGENCY_MANAGEMENT_IMPLEMENTED,
  COST_ENGINE_IMPLEMENTED,
  COST_INTELLIGENCE_IS_ADVISORY_ONLY,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_POSTING_IMPLEMENTED,
  FLOAT_COMPUTATION_IMPLEMENTED,
  FORECAST_ENGINE_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
  SCHEDULE_EXECUTION_IMPLEMENTED,
} from "../version";

export type CostAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: CostControlContext;
  evidence: readonly CostEvidence[];
  costBasisRef?: CostBasisReference;
  changeIntelligence?: readonly ChangeIntelligenceState[];
  version?: number;
  status?: CostIntelligenceState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

export type CostAssessmentResult = {
  state: CostIntelligenceState;
  confidence: CostConfidence;
  abstained: boolean;
  abstentionReason?: string;
  varianceAttribution: CostVarianceAttribution;
};

export type CostIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: CostConfidenceEngine;
};

export class CostIntelligenceEngine {
  readonly kind = "cost_intelligence_engine" as const;
  private readonly confidenceEngine: CostConfidenceEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: CostIntelligenceEngineDeps = {}) {
    assertNoEarnedValue();
    assertNoFinancialPosting();
    assertNoForecastEngine();
    this.confidenceEngine = deps.confidenceEngine ?? createCostConfidenceEngine();
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: CostAssessmentInput): CostAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_cost_intelligence_only",
      "not_a_budget_ledger_or_financial_posting",
      "no_earned_value_or_forecast_computed",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.currencyCode) throw new Error("currency_code_required");
    const scope = input.controlContext.scope;
    if (scope.kind !== "project" && !scope.referenceId) {
      throw new Error("scope_reference_id_required");
    }
    if (scope.projectId !== input.projectId) throw new Error("scope_project_mismatch");
    if (input.costBasisRef) assertCostBasisReference(input.costBasisRef);

    const evidence = (input.evidence ?? []).map(normaliseEvidence);
    const changeIntelligence = (input.changeIntelligence ?? []).filter(
      (state) => state.contractualApprovalClaimed === false,
    );

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pccostconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      costBasisRef: input.costBasisRef,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      sufficiencyThreshold: input.sufficiencyThreshold,
      minimumEvidenceCount: input.minimumEvidenceCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingCostSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_cost_evidence")
      : undefined;

    let costPosture: CostPosture = "unknown";
    let varianceAttribution: CostVarianceAttribution = "insufficient_evidence";

    if (abstained) {
      reasons.push("abstained_no_cost_posture_published");
      limitations.push("abstained_insufficient_evidence");
    } else {
      const usable = evidence.filter(
        (item) => item.revoked !== true && item.reviewStatus !== "revoked",
      );
      const currencyOk = currenciesCompatible(
        input.controlContext.currencyCode,
        input.costBasisRef,
        usable,
      ).compatible;

      if (!input.costBasisRef || !currencyOk) {
        costPosture = "unknown";
        varianceAttribution = "insufficient_evidence";
        reasons.push("posture_unknown_without_valid_basis_and_compatible_evidence");
      } else {
        costPosture = deriveCostPosture(usable, confidence.dataSufficiency);
        varianceAttribution = attributeVarianceFromChangeIntelligence(changeIntelligence);
        if (varianceAttribution === "insufficient_evidence" && changeIntelligence.length === 0) {
          varianceAttribution = "unexplained_movement";
        }
        if (confidence.dataSufficiency === "limited") {
          reasons.push("limited_basis_cost_posture_is_advisory");
          limitations.push("limited_evidence_basis");
        }
      }
    }

    const stateId = this.newId("pccost");
    const state: CostIntelligenceState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      costPosture: abstained ? "unknown" : costPosture,
      varianceAttribution: abstained ? "insufficient_evidence" : varianceAttribution,
      costBasisRef: input.costBasisRef,
      changeIntelligenceRefs: changeIntelligence.map((item) => item.stateId),
      evidenceRefs: evidence.map((item) => item.evidenceId),
      confidence,
      reasons: dedupe(reasons),
      limitations: dedupe(limitations),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "cost_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      budgetMutated: false,
      financialPostingPerformed: false,
      forecastProduced: false,
      contingencyDrawn: false,
      changeExecuted: false,
      scheduleExecuted: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      autonomousPublication: false,
    };

    return { state, confidence, abstained, abstentionReason, varianceAttribution };
  }

  keyFor(scope: ProjectScopeRef, accountId: string): string {
    return costStateKey(scope, accountId);
  }
}

export function createCostIntelligenceEngine(
  deps: CostIntelligenceEngineDeps = {},
): CostIntelligenceEngine {
  return new CostIntelligenceEngine(deps);
}

export function assertNoEarnedValue(): {
  ok: true;
  earnedValueImplemented: false;
  cpmSchedulingImplemented: false;
  floatComputationImplemented: false;
} {
  if (EARNED_VALUE_IMPLEMENTED || CPM_SCHEDULING_IMPLEMENTED || FLOAT_COMPUTATION_IMPLEMENTED) {
    throw new Error("earned_value_and_cpm_forbidden_in_cost_intelligence");
  }
  return {
    ok: true,
    earnedValueImplemented: false,
    cpmSchedulingImplemented: false,
    floatComputationImplemented: false,
  };
}

export function assertNoFinancialPosting(): {
  ok: true;
  costEngineImplemented: false;
  budgetLedgerImplemented: false;
  financialPostingImplemented: false;
} {
  if (COST_ENGINE_IMPLEMENTED || BUDGET_LEDGER_IMPLEMENTED || FINANCIAL_POSTING_IMPLEMENTED) {
    throw new Error("financial_posting_forbidden_in_cost_intelligence");
  }
  return {
    ok: true,
    costEngineImplemented: false,
    budgetLedgerImplemented: false,
    financialPostingImplemented: false,
  };
}

export function assertNoForecastEngine(): {
  ok: true;
  forecastingImplemented: false;
  forecastEngineImplemented: false;
  contingencyManagementImplemented: false;
  scheduleExecutionImplemented: false;
  changeExecutionImplemented: false;
  advisoryOnly: true;
} {
  if (
    FORECASTING_IMPLEMENTED ||
    FORECAST_ENGINE_IMPLEMENTED ||
    CONTINGENCY_MANAGEMENT_IMPLEMENTED
  ) {
    throw new Error("forecast_and_contingency_forbidden_in_cost_intelligence");
  }
  if (SCHEDULE_EXECUTION_IMPLEMENTED || CHANGE_EXECUTION_IMPLEMENTED) {
    throw new Error("schedule_and_change_execution_forbidden_in_cost_intelligence");
  }
  if (!COST_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("cost_intelligence_must_be_advisory_only");
  }
  return {
    ok: true,
    forecastingImplemented: false,
    forecastEngineImplemented: false,
    contingencyManagementImplemented: false,
    scheduleExecutionImplemented: false,
    changeExecutionImplemented: false,
    advisoryOnly: true,
  };
}

function assertCostBasisReference(reference: CostBasisReference): void {
  if (reference.ownedByProjectControls !== false) {
    throw new Error("cost_basis_reference_may_not_be_owned_by_project_controls");
  }
  if (reference.mutatesBudget !== false || reference.financialPostingClaimed !== false) {
    throw new Error("cost_basis_reference_may_not_mutate_budget_or_claim_posting");
  }
  if (!reference.currencyCode) {
    throw new Error("cost_basis_reference_requires_currency_code");
  }
}

function normaliseEvidence(evidence: CostEvidence): CostEvidence {
  if (
    evidence.derivedFromEarnedValue !== false ||
    evidence.mutatesCoreRisk !== false ||
    evidence.mutatesBudget !== false ||
    evidence.financialPostingClaimed !== false ||
    evidence.forecastDerived !== false
  ) {
    throw new Error(
      "cost_evidence_may_not_derive_from_earned_value_or_mutate_risk_budget_or_claim_posting",
    );
  }
  if (!evidence.currencyCode) {
    throw new Error("cost_evidence_requires_currency_code");
  }
  return evidence;
}

/**
 * Over/under only when basis exists and directions agree; attention_required when
 * flagged; otherwise within_tolerance or unknown.
 */
function deriveCostPosture(
  usable: readonly CostEvidence[],
  sufficiency: CostEvidenceSufficiency,
): CostPosture {
  const directions = usable
    .map((item) => item.declaredDirection)
    .filter((value): value is CostEvidenceDirection => typeof value === "string")
    .filter((value) => value !== "unknown");

  if (directions.length === 0) return "unknown";
  if (directions.some((value) => value === "attention_required")) return "attention_required";

  const overs = directions.filter((value) => value === "over_basis").length;
  const unders = directions.filter((value) => value === "under_basis").length;
  const within = directions.filter((value) => value === "within_tolerance").length;

  if (overs > 0 && unders > 0) return "unknown";
  if (overs > unders && sufficiency !== "insufficient") return "over";
  if (unders > overs && sufficiency !== "insufficient") return "under";
  if (within > 0) return "within_tolerance";
  return "unknown";
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
