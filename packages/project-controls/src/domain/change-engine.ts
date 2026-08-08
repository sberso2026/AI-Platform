/**
 * Phase 11D — Change Intelligence Engine.
 *
 * Evidence-driven and abstention-first. It resolves evidence into confidence and
 * a `ChangeIntelligenceState`, and it groups signals into a `ChangeCandidate`.
 *
 * What it never does: approve a contractual change, publish a change to a
 * contract, compute a cost or schedule amount, touch a budget or a ledger,
 * compute earned value, compute a critical path or float, draw down contingency,
 * or mutate the canonical engineering risk register.
 */

import {
  assertCandidateIsNotApprovedChange,
  changeStateKey,
  CHANGE_AUTHORITY_OWNERS,
  dominantChangeClass,
  dominantChangeStatusContext,
  emptyChangeImpactContexts,
  isAbstainingChangeSufficiency,
  type ChangeCandidate,
  type ChangeClassification,
  type ChangeConfidence,
  type ChangeEvidence,
  type ChangeEvidenceSufficiency,
  type ChangeImpactContext,
  type ChangeImpactContexts,
  type ChangeIntelligenceState,
  type ChangeReference,
  type ChangeSignal,
  type ChangeStatusContext,
} from "./change";
import {
  createChangeConfidenceEngine,
  type ChangeConfidenceEngine,
} from "./change-confidence";
import type { ProjectScopeRef } from "./progress";
import {
  BUDGET_LEDGER_IMPLEMENTED,
  CHANGE_EXECUTION_IMPLEMENTED,
  CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY,
  CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY,
  CONTINGENCY_MANAGEMENT_IMPLEMENTED,
  CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED,
  COST_ENGINE_IMPLEMENTED,
  COST_INTELLIGENCE_IMPLEMENTED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FINANCIAL_POSTING_IMPLEMENTED,
  FLOAT_COMPUTATION_IMPLEMENTED,
  FORECASTING_IMPLEMENTED,
} from "../version";

export type ChangeAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  changeClass: ChangeClassification;
  evidence: readonly ChangeEvidence[];
  candidateId?: string;
  authoritativeChangeRef?: ChangeReference;
  version?: number;
  status?: ChangeIntelligenceState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

export type ChangeAssessmentResult = {
  state: ChangeIntelligenceState;
  confidence: ChangeConfidence;
  abstained: boolean;
  abstentionReason?: string;
};

export type ChangeCandidateInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  signals: readonly ChangeSignal[];
  changeClass?: ChangeClassification;
  title?: string;
  narrative?: string;
  asOf?: string;
  createdBy?: string;
  supersedesId?: string;
};

export type ChangeIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: ChangeConfidenceEngine;
};

export class ChangeIntelligenceEngine {
  readonly kind = "change_intelligence_engine" as const;
  private readonly confidenceEngine: ChangeConfidenceEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ChangeIntelligenceEngineDeps = {}) {
    assertNoCostEngine();
    assertNoContractualApproval();
    this.confidenceEngine = deps.confidenceEngine ?? createChangeConfidenceEngine();
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  /**
   * Group signals into a candidate. A candidate is a subject for assessment; it
   * carries no approval and no impact.
   */
  createCandidate(input: ChangeCandidateInput): ChangeCandidate {
    if (!input.projectId) throw new Error("project_id_required");
    if (input.scope.kind !== "project" && !input.scope.referenceId) {
      throw new Error("scope_reference_id_required");
    }
    if (input.scope.projectId !== input.projectId) throw new Error("scope_project_mismatch");
    const signals = (input.signals ?? []).map(normaliseSignal);
    if (signals.length === 0) throw new Error("change_candidate_requires_signals");

    const suggested = signals
      .map((signal) => signal.suggestedChangeClass)
      .filter((value): value is ChangeClassification => typeof value === "string");

    const candidate: ChangeCandidate = {
      candidateId: this.newId("pcchgcand"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      changeClass: input.changeClass ?? dominantChangeClass(suggested) ?? "other",
      status: "candidate",
      signalRefs: signals.map((signal) => signal.signalId),
      title: input.title,
      narrative: input.narrative,
      createdAt: input.asOf ?? new Date().toISOString(),
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      isApprovedChange: false,
      contractualApprovalClaimed: false,
      mutatesBudget: false,
      derivedFromEarnedValue: false,
    };
    assertCandidateIsNotApprovedChange(candidate);
    return candidate;
  }

  assess(input: ChangeAssessmentInput): ChangeAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_change_intelligence_only",
      "not_contractual_change_approval",
      "no_cost_or_schedule_amount_computed",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (input.scope.kind !== "project" && !input.scope.referenceId) {
      throw new Error("scope_reference_id_required");
    }
    if (input.scope.projectId !== input.projectId) throw new Error("scope_project_mismatch");
    if (input.authoritativeChangeRef) assertChangeReference(input.authoritativeChangeRef);

    const evidence = (input.evidence ?? []).map(normaliseEvidence);
    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcchgconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      sufficiencyThreshold: input.sufficiencyThreshold,
      minimumEvidenceCount: input.minimumEvidenceCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingChangeSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_change_evidence")
      : undefined;

    let changeStatusContext: ChangeStatusContext = "unknown";
    let impact: ChangeImpactContexts = emptyChangeImpactContexts();

    if (abstained) {
      reasons.push("abstained_no_change_context_published");
      limitations.push("abstained_insufficient_evidence");
    } else {
      const usable = evidence.filter(
        (item) => item.revoked !== true && item.reviewStatus !== "revoked",
      );
      const declaredStatuses = usable
        .map((item) => item.declaredStatusContext)
        .filter((value): value is ChangeStatusContext => typeof value === "string");
      changeStatusContext = dominantChangeStatusContext(declaredStatuses);
      if (input.authoritativeChangeRef?.declaredStatusContext) {
        changeStatusContext = dominantChangeStatusContext([
          changeStatusContext,
          input.authoritativeChangeRef.declaredStatusContext,
        ]);
        reasons.push("status_context_includes_authoritative_reference");
      }
      impact = deriveImpactContexts(input.changeClass, usable, confidence.dataSufficiency);
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_change_context_is_advisory");
        limitations.push("limited_evidence_basis");
      }
      if (changeStatusContext === "approved_context") {
        reasons.push("approved_context_is_reported_by_source_not_granted_here");
        limitations.push("approved_context_is_not_project_controls_approval");
      }
    }

    const stateId = this.newId("pcchange");
    const state: ChangeIntelligenceState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      changeClass: input.changeClass,
      changeStatusContext: abstained ? "unknown" : changeStatusContext,
      authoritativeChangeRef: input.authoritativeChangeRef,
      candidateId: input.candidateId,
      impact: abstained ? emptyChangeImpactContexts() : impact,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      confidence,
      reasons: dedupe(reasons),
      limitations: dedupe(limitations),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "change_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      costIntegrated: false,
      budgetMutated: false,
      financialPostingPerformed: false,
      forecastProduced: false,
      contingencyDrawn: false,
      changeExecuted: false,
      contractualApprovalClaimed: false,
      contractualAuthorityClaimed: false,
      coreRiskMutated: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      autonomousPublication: false,
    };

    return { state, confidence, abstained, abstentionReason };
  }

  /** Stable version-series key so one scope can hold several change threads. */
  keyFor(scope: ProjectScopeRef, changeClass: ChangeClassification): string {
    return changeStateKey(scope, changeClass);
  }
}

export function createChangeIntelligenceEngine(
  deps: ChangeIntelligenceEngineDeps = {},
): ChangeIntelligenceEngine {
  return new ChangeIntelligenceEngine(deps);
}

export function assertNoCostEngine(): {
  ok: true;
  costEngineImplemented: false;
  costIntelligenceImplemented: false;
  budgetLedgerImplemented: false;
  financialPostingImplemented: false;
  earnedValueImplemented: false;
  forecastingImplemented: false;
  contingencyManagementImplemented: false;
} {
  if (
    COST_ENGINE_IMPLEMENTED ||
    COST_INTELLIGENCE_IMPLEMENTED ||
    BUDGET_LEDGER_IMPLEMENTED ||
    FINANCIAL_POSTING_IMPLEMENTED
  ) {
    throw new Error("cost_engine_forbidden_in_change_intelligence");
  }
  if (EARNED_VALUE_IMPLEMENTED || CPM_SCHEDULING_IMPLEMENTED || FLOAT_COMPUTATION_IMPLEMENTED) {
    throw new Error("earned_value_and_cpm_forbidden_in_change_intelligence");
  }
  if (FORECASTING_IMPLEMENTED || CONTINGENCY_MANAGEMENT_IMPLEMENTED) {
    throw new Error("forecasting_and_contingency_forbidden_in_change_intelligence");
  }
  return {
    ok: true,
    costEngineImplemented: false,
    costIntelligenceImplemented: false,
    budgetLedgerImplemented: false,
    financialPostingImplemented: false,
    earnedValueImplemented: false,
    forecastingImplemented: false,
    contingencyManagementImplemented: false,
  };
}

export function assertNoContractualApproval(): {
  ok: true;
  contractualAuthority: false;
  contractualApprovalByAiAllowed: false;
  changeExecutionImplemented: false;
  advisoryOnly: true;
} {
  if (CHANGE_INTELLIGENCE_IS_CONTRACTUAL_AUTHORITY) {
    throw new Error("change_intelligence_may_not_be_contractual_authority");
  }
  if (CONTRACTUAL_CHANGE_APPROVAL_BY_AI_ALLOWED) {
    throw new Error("contractual_change_approval_by_ai_forbidden");
  }
  if (CHANGE_EXECUTION_IMPLEMENTED) {
    throw new Error("change_execution_forbidden_in_change_intelligence");
  }
  if (!CHANGE_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("change_intelligence_must_be_advisory_only");
  }
  return {
    ok: true,
    contractualAuthority: false,
    contractualApprovalByAiAllowed: false,
    changeExecutionImplemented: false,
    advisoryOnly: true,
  };
}

function assertChangeReference(reference: ChangeReference): void {
  if (reference.ownedByProjectControls !== false) {
    throw new Error("change_reference_may_not_be_owned_by_project_controls");
  }
  if (reference.contractualApprovalClaimed !== false) {
    throw new Error("change_reference_may_not_claim_contractual_approval");
  }
  if (!(CHANGE_AUTHORITY_OWNERS as readonly string[]).includes(reference.authorityOwner)) {
    throw new Error(`change_reference_authority_owner_invalid:${reference.authorityOwner}`);
  }
}

function normaliseEvidence(evidence: ChangeEvidence): ChangeEvidence {
  if (
    evidence.derivedFromEarnedValue !== false ||
    evidence.mutatesCoreRisk !== false ||
    evidence.mutatesBudget !== false ||
    evidence.contractualApprovalClaimed !== false
  ) {
    throw new Error(
      "change_evidence_may_not_derive_from_earned_value_or_mutate_risk_budget_or_claim_approval",
    );
  }
  return evidence;
}

function normaliseSignal(signal: ChangeSignal): ChangeSignal {
  if (signal.contractualApprovalClaimed !== false || signal.mutatesBudget !== false) {
    throw new Error("change_signal_may_not_claim_approval_or_mutate_budget");
  }
  return signal;
}

/**
 * Impact contexts are qualitative. `supported` means multiple pieces of usable
 * evidence point at the dimension; `suspected` means the classification implies
 * it but the evidence does not yet carry it. Nothing here is a monetary amount.
 */
function deriveImpactContexts(
  changeClass: ChangeClassification,
  usable: readonly ChangeEvidence[],
  sufficiency: ChangeEvidenceSufficiency,
): ChangeImpactContexts {
  const supported = sufficiency === "sufficient" && usable.length >= 2;
  const primary: ChangeImpactContext = supported ? "supported" : "suspected";

  const impact = emptyChangeImpactContexts();
  switch (changeClass) {
    case "scope":
      impact.scope = primary;
      impact.schedule = "suspected";
      impact.cost = "suspected";
      break;
    case "design":
    case "technical":
      impact.scope = primary;
      impact.quality = "suspected";
      break;
    case "schedule":
      impact.schedule = primary;
      break;
    case "cost":
      // Subject of the change, not a monetary position held by this module.
      impact.cost = primary;
      break;
    case "contractual":
      impact.scope = "suspected";
      impact.cost = "suspected";
      impact.schedule = "suspected";
      break;
    case "regulatory":
      impact.quality = primary;
      impact.risk = "suspected";
      break;
    case "procurement":
      impact.procurement = primary;
      impact.schedule = "suspected";
      break;
    case "construction":
      impact.scope = "suspected";
      impact.schedule = primary;
      break;
    case "quality":
      impact.quality = primary;
      break;
    case "safety":
      impact.risk = primary;
      impact.quality = "suspected";
      break;
    case "asset_interface":
      impact.scope = "suspected";
      impact.risk = "suspected";
      break;
    case "other":
      break;
  }
  return impact;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
