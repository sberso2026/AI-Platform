/**
 * Phase 11J — Risk & Opportunity Intelligence Engine.
 *
 * Advisory intelligence signals from published composed contributors,
 * forecast, decision support, and scenario intelligence.
 * Never mutates upstream intelligence or the canonical risk register.
 *
 * Forbidden: risk/opportunity register mutation, owner assignment, treatment
 * execution, Monte Carlo, CPM, EV, schedule/cost/contract execution.
 */

import {
  isAbstainingRiskOpportunitySufficiency,
  riskOpportunityStateKey,
  type CrossContributorConflict,
  type OpportunityIntelligenceSignal,
  type RiskIntelligenceSignal,
  type RiskOpportunityAssessmentState,
  type RiskOpportunityConfidence,
  type RiskOpportunityControlContext,
  type RiskOpportunityContributorRef,
  type RiskOpportunityEvidence,
  type RiskOpportunityEvidenceSufficiency,
  type RiskOpportunitySynthesis,
  type RiskSignal,
  type OpportunitySignal,
} from "./risk-opportunity";
import {
  createRiskOpportunityConfidenceEngine,
  type RiskOpportunityConfidenceEngine,
} from "./risk-opportunity-confidence";
import {
  createProjectContextCompositionEngine,
  type ComposedProjectContext,
  type ProjectContextCompositionEngine,
} from "./project-context-composition";
import type { ChangeIntelligenceState } from "./change";
import type { CostIntelligenceState } from "./cost";
import type { ProductivityAssessmentState } from "./productivity";
import type { ProjectScopeRef } from "./progress";
import type { ProgressAssessmentState } from "./progress";
import type { ScheduleAssessmentState } from "./schedule";
import type { ForecastAssessmentState } from "./forecast";
import type { DecisionAssessmentState } from "./decision";
import type { ScenarioAssessmentState } from "./scenario";
import {
  AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
  AUTOMATIC_COST_CHANGE_ENABLED,
  AUTOMATIC_DECISION_EXECUTION_ENABLED,
  AUTOMATIC_OPPORTUNITY_REGISTER_MUTATION_ENABLED,
  AUTOMATIC_RISK_REGISTER_MUTATION_ENABLED,
  AUTOMATIC_SCHEDULE_CHANGE_ENABLED,
  AUTOMATIC_TREATMENT_EXECUTION_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  DECISION_ENGINE_IMPLEMENTED,
  DECISION_EXECUTION_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FORECAST_EXECUTION_IMPLEMENTED,
  PREDICTIVE_SCHEDULING_IMPLEMENTED,
  RISK_OPPORTUNITY_INTELLIGENCE_IS_ADVISORY_ONLY,
} from "../version";

export type RiskOpportunityAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: RiskOpportunityControlContext;
  progress: readonly ProgressAssessmentState[];
  schedule?: readonly ScheduleAssessmentState[];
  change?: readonly ChangeIntelligenceState[];
  cost?: readonly CostIntelligenceState[];
  productivity?: readonly ProductivityAssessmentState[];
  forecast?: readonly ForecastAssessmentState[];
  decision?: readonly DecisionAssessmentState[];
  scenario?: readonly ScenarioAssessmentState[];
  evidence?: readonly RiskOpportunityEvidence[];
  version?: number;
  status?: RiskOpportunityAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  freshnessHorizonHours?: number;
  minimumContributorCount?: number;
  composedContext?: ComposedProjectContext;
};

export type RiskOpportunityAssessmentResult = {
  state: RiskOpportunityAssessmentState;
  confidence: RiskOpportunityConfidence;
  composedContext: ComposedProjectContext;
  abstained: boolean;
  abstentionReason?: string;
};

export type RiskOpportunityIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: RiskOpportunityConfidenceEngine;
  compositionEngine?: ProjectContextCompositionEngine;
};

export class ProjectControlsRiskOpportunityIntelligenceEngine {
  readonly kind = "risk_opportunity_intelligence_engine" as const;
  private readonly confidenceEngine: RiskOpportunityConfidenceEngine;
  private readonly compositionEngine: ProjectContextCompositionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: RiskOpportunityIntelligenceEngineDeps = {}) {
    assertNoRegisterMutation();
    assertNoTreatmentExecution();
    assertNoPredictiveScheduling();
    assertNoEarnedValueOrCpm();
    assertAdvisoryOnly();
    this.confidenceEngine = deps.confidenceEngine ?? createRiskOpportunityConfidenceEngine();
    this.compositionEngine =
      deps.compositionEngine ?? createProjectContextCompositionEngine({ newId: deps.newId });
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: RiskOpportunityAssessmentInput): RiskOpportunityAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_risk_opportunity_intelligence_only",
      "signals_are_not_formal_register_items",
      "no_automatic_register_mutation_or_owner_assignment",
      "no_treatment_execution_or_contract_authority",
    ];
    const assumptions: string[] = [
      "risk_opportunity_intelligence_derived_from_published_composed_contributors_forecast_decision_and_scenario",
      "upstream_contributors_not_mutated",
      "canonical_engineering_risk_register_not_mutated",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.riskOpportunityUnitId) throw new Error("risk_opportunity_unit_id_required");
    const scope = input.controlContext.scope;
    if (scope.kind !== "project" && !scope.referenceId) {
      throw new Error("scope_reference_id_required");
    }
    if (scope.projectId !== input.projectId) throw new Error("scope_project_mismatch");

    const composed =
      input.composedContext ??
      this.compositionEngine.compose({
        tenantId: input.tenantId,
        workspaceId: input.workspaceId,
        projectId: input.projectId,
        progress: input.progress,
        schedule: input.schedule,
        change: input.change,
        cost: input.cost,
        productivity: input.productivity,
        asOf,
      }).context;

    const publishedForecast = (input.forecast ?? []).filter(
      (state) => state.status === "published" && !state.abstained,
    );
    const latestForecast = publishedForecast.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];

    const publishedDecision = (input.decision ?? []).filter(
      (state) => state.status === "published" && !state.abstained,
    );
    const latestDecision = publishedDecision.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];

    const publishedScenario = (input.scenario ?? []).filter(
      (state) => state.status === "published" && !state.abstained,
    );
    const latestScenario = publishedScenario.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];

    const evidence = buildEvidenceFromComposition(
      composed,
      latestForecast,
      latestDecision,
      latestScenario,
      input.evidence ?? [],
      this.newId,
    );

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcroconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      composedContext: composed,
      forecastStates: publishedForecast,
      decisionStates: publishedDecision,
      scenarioStates: publishedScenario,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      minimumContributorCount: input.minimumContributorCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingRiskOpportunitySufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_risk_opportunity_basis")
      : undefined;

    const contributingContributors: RiskOpportunityContributorRef[] = [
      ...composed.contributorRefs.map((ref) => ({
        contributorKey: ref.contributorKey as RiskOpportunityContributorRef["contributorKey"],
        stateId: ref.stateId,
        status: ref.status,
        abstained: ref.abstained,
        postureOrIndication: ref.postureOrIndication,
        assessedAt: ref.assessedAt,
      })),
      ...(latestForecast
        ? [
            {
              contributorKey: "forecast" as const,
              stateId: latestForecast.stateId,
              status: latestForecast.status,
              abstained: latestForecast.abstained,
              postureOrIndication: latestForecast.forecastPosture,
              assessedAt: latestForecast.assessedAt,
            },
          ]
        : []),
      ...(latestDecision
        ? [
            {
              contributorKey: "decision_support" as const,
              stateId: latestDecision.stateId,
              status: latestDecision.status,
              abstained: latestDecision.abstained,
              postureOrIndication: latestDecision.dominantDecisionClass,
              assessedAt: latestDecision.assessedAt,
            },
          ]
        : []),
      ...(latestScenario
        ? [
            {
              contributorKey: "scenario_intelligence" as const,
              stateId: latestScenario.stateId,
              status: latestScenario.status,
              abstained: latestScenario.abstained,
              postureOrIndication: latestScenario.assessmentClass,
              assessedAt: latestScenario.assessedAt,
            },
          ]
        : []),
    ];

    let riskSignals: RiskIntelligenceSignal[] = [];
    let opportunitySignals: OpportunityIntelligenceSignal[] = [];
    let synthesis: RiskOpportunitySynthesis = {
      synthesisId: this.newId("pcrocmp"),
      riskSignals: [],
      opportunitySignals: [],
      crossContributorConflicts: [],
      escalationIndicators: [],
      synthesisNotes: [],
      riskRegisterMutated: false,
      opportunityRegisterMutated: false,
      ownerAssignmentPerformed: false,
      treatmentExecutionPerformed: false,
    };

    if (abstained) {
      reasons.push("abstained_no_risk_opportunity_signals_published");
      limitations.push("abstained_insufficient_composed_basis");
    } else {
      const derived = deriveSignals(
        contributingContributors,
        confidence.dataSufficiency,
        this.newId,
      );
      riskSignals = derived.riskSignals;
      opportunitySignals = derived.opportunitySignals;
      synthesis = {
        synthesisId: this.newId("pcrocmp"),
        riskSignals: derived.riskSignals,
        opportunitySignals: derived.opportunitySignals,
        crossContributorConflicts: derived.conflicts,
        escalationIndicators: derived.escalationIndicators,
        synthesisNotes: derived.synthesisNotes,
        riskRegisterMutated: false,
        opportunityRegisterMutated: false,
        ownerAssignmentPerformed: false,
        treatmentExecutionPerformed: false,
      };
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_risk_opportunity_signals_are_advisory");
        limitations.push("limited_contributor_basis");
      }
    }

    const stateId = this.newId("pcrost");
    const state: RiskOpportunityAssessmentState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      synthesis,
      riskSignals,
      opportunitySignals,
      contributingContributors,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      confidence,
      assumptions: dedupe(assumptions),
      limitations: dedupe(limitations),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "risk_opportunity_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      composedContextId: composed.contextId,
      forecastContextId: latestForecast?.stateId,
      decisionContextId: latestDecision?.stateId,
      scenarioContextId: latestScenario?.stateId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      autoExecutionEnabled: false,
      scheduleExecutionPerformed: false,
      costExecutionPerformed: false,
      contractInstructionPerformed: false,
      approvalAuthorityClaimed: false,
      resourcePlanningPerformed: false,
      budgetLedgerMutated: false,
      financialPostingPerformed: false,
      predictiveSchedulingPerformed: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      mutatesUpstreamContributors: false,
      autonomousPublication: false,
      riskRegisterMutated: false,
      opportunityRegisterMutated: false,
      ownerAssignmentPerformed: false,
      treatmentExecutionPerformed: false,
      duplicateRiskOwnershipDetected: false,
      monteCarloPerformed: false,
      numericalPrecisionClaimed: false,
    };

    return { state, confidence, composedContext: composed, abstained, abstentionReason };
  }

  assessRiskOpportunity(input: RiskOpportunityAssessmentInput): RiskOpportunityAssessmentResult {
    return this.assess(input);
  }

  keyFor(scope: ProjectScopeRef, riskOpportunityUnitId: string): string {
    return riskOpportunityStateKey(scope, riskOpportunityUnitId);
  }
}

export const RiskOpportunityIntelligenceEngine = ProjectControlsRiskOpportunityIntelligenceEngine;

export function createRiskOpportunityIntelligenceEngine(
  deps: RiskOpportunityIntelligenceEngineDeps = {},
): ProjectControlsRiskOpportunityIntelligenceEngine {
  return new ProjectControlsRiskOpportunityIntelligenceEngine(deps);
}

export function assertNoRegisterMutation(): {
  ok: true;
  automaticRiskRegisterMutationEnabled: false;
  automaticOpportunityRegisterMutationEnabled: false;
} {
  if (
    AUTOMATIC_RISK_REGISTER_MUTATION_ENABLED ||
    AUTOMATIC_OPPORTUNITY_REGISTER_MUTATION_ENABLED
  ) {
    throw new Error("automatic_register_mutation_forbidden_in_risk_opportunity_intelligence");
  }
  return {
    ok: true,
    automaticRiskRegisterMutationEnabled: false,
    automaticOpportunityRegisterMutationEnabled: false,
  };
}

export function assertNoTreatmentExecution(): {
  ok: true;
  automaticTreatmentExecutionEnabled: false;
} {
  if (AUTOMATIC_TREATMENT_EXECUTION_ENABLED) {
    throw new Error("automatic_treatment_execution_forbidden_in_risk_opportunity_intelligence");
  }
  return { ok: true, automaticTreatmentExecutionEnabled: false };
}

export function assertNoPredictiveScheduling(): {
  ok: true;
  decisionEngineImplemented: false;
  predictiveSchedulingImplemented: false;
  decisionExecutionImplemented: false;
} {
  if (
    DECISION_ENGINE_IMPLEMENTED ||
    PREDICTIVE_SCHEDULING_IMPLEMENTED ||
    DECISION_EXECUTION_IMPLEMENTED
  ) {
    throw new Error("predictive_scheduling_forbidden_in_risk_opportunity_intelligence");
  }
  return {
    ok: true,
    decisionEngineImplemented: false,
    predictiveSchedulingImplemented: false,
    decisionExecutionImplemented: false,
  };
}

export function assertNoEarnedValueOrCpm(): {
  ok: true;
  earnedValueImplemented: false;
  cpmSchedulingImplemented: false;
} {
  if (
    EARNED_VALUE_IMPLEMENTED ||
    CPM_SCHEDULING_IMPLEMENTED ||
    PREDICTIVE_SCHEDULING_IMPLEMENTED ||
    FORECAST_EXECUTION_IMPLEMENTED
  ) {
    throw new Error("earned_value_and_cpm_forbidden_in_risk_opportunity_intelligence");
  }
  return { ok: true, earnedValueImplemented: false, cpmSchedulingImplemented: false };
}

export function assertAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  if (!RISK_OPPORTUNITY_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("risk_opportunity_intelligence_must_be_advisory_only");
  }
  return { ok: true, advisoryOnly: true };
}

function buildEvidenceFromComposition(
  composed: ComposedProjectContext,
  forecast: ForecastAssessmentState | undefined,
  decision: DecisionAssessmentState | undefined,
  scenario: ScenarioAssessmentState | undefined,
  extra: readonly RiskOpportunityEvidence[],
  newId: (prefix: string) => string,
): RiskOpportunityEvidence[] {
  const baseEvidence = (ref: {
    stateId: string;
    contributorKey: string;
    status: string;
    assessedAt?: string;
    postureOrIndication?: string;
    kind: RiskOpportunityEvidence["kind"];
    sourceType: RiskOpportunityEvidence["sourceType"];
  }): RiskOpportunityEvidence => ({
    evidenceId: newId("pcroev"),
    kind: ref.kind,
    sourceType: ref.sourceType,
    sourceRef: ref.stateId,
    sourceKey: ref.contributorKey,
    provenance: "system_reference",
    reviewStatus: ref.status === "published" ? "published" : "reviewed",
    observedAt: ref.assessedAt,
    declaredSignal: ref.postureOrIndication,
    contributorKey: ref.contributorKey as RiskOpportunityEvidence["contributorKey"],
    autoExecutionClaimed: false,
    scheduleExecutionClaimed: false,
    costExecutionClaimed: false,
    contractInstructionClaimed: false,
    approvalAuthorityClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    monteCarloClaimed: false,
    numericalPrecisionClaimed: false,
    riskRegisterMutationClaimed: false,
    opportunityRegisterMutationClaimed: false,
    ownerAssignmentClaimed: false,
    treatmentExecutionClaimed: false,
    mutatesCoreRisk: false,
  });

  const fromComposition = composed.contributorRefs.map((ref) =>
    baseEvidence({
      stateId: ref.stateId,
      contributorKey: ref.contributorKey,
      status: ref.status,
      assessedAt: ref.assessedAt,
      postureOrIndication: ref.postureOrIndication,
      kind: "composed_context_ref",
      sourceType: "project_context_composition",
    }),
  );

  const fromForecast = forecast
    ? [
        baseEvidence({
          stateId: forecast.stateId,
          contributorKey: "forecast",
          status: forecast.status,
          assessedAt: forecast.assessedAt,
          postureOrIndication: forecast.forecastPosture,
          kind: "forecast_assessment_ref",
          sourceType: "forecast_intelligence",
        }),
      ]
    : [];

  const fromDecision = decision
    ? [
        baseEvidence({
          stateId: decision.stateId,
          contributorKey: "decision_support",
          status: decision.status,
          assessedAt: decision.assessedAt,
          postureOrIndication: decision.dominantDecisionClass,
          kind: "decision_assessment_ref",
          sourceType: "decision_support",
        }),
      ]
    : [];

  const fromScenario = scenario
    ? [
        baseEvidence({
          stateId: scenario.stateId,
          contributorKey: "scenario_intelligence",
          status: scenario.status,
          assessedAt: scenario.assessedAt,
          postureOrIndication: scenario.assessmentClass,
          kind: "scenario_assessment_ref",
          sourceType: "scenario_intelligence",
        }),
      ]
    : [];

  return [
    ...fromComposition,
    ...fromForecast,
    ...fromDecision,
    ...fromScenario,
    ...extra.map(normaliseEvidence),
  ];
}

function normaliseEvidence(evidence: RiskOpportunityEvidence): RiskOpportunityEvidence {
  if (
    evidence.autoExecutionClaimed !== false ||
    evidence.scheduleExecutionClaimed !== false ||
    evidence.costExecutionClaimed !== false ||
    evidence.contractInstructionClaimed !== false ||
    evidence.approvalAuthorityClaimed !== false ||
    evidence.earnedValueDerived !== false ||
    evidence.cpmDerived !== false ||
    evidence.financialPostingClaimed !== false ||
    evidence.monteCarloClaimed !== false ||
    evidence.numericalPrecisionClaimed !== false ||
    evidence.riskRegisterMutationClaimed !== false ||
    evidence.opportunityRegisterMutationClaimed !== false ||
    evidence.ownerAssignmentClaimed !== false ||
    evidence.treatmentExecutionClaimed !== false ||
    evidence.mutatesCoreRisk !== false
  ) {
    throw new Error("risk_opportunity_evidence_may_not_claim_forbidden_capabilities");
  }
  return evidence;
}

function deriveSignals(
  contributors: readonly RiskOpportunityContributorRef[],
  sufficiency: RiskOpportunityEvidenceSufficiency,
  newId: (prefix: string) => string,
): {
  riskSignals: RiskIntelligenceSignal[];
  opportunitySignals: OpportunityIntelligenceSignal[];
  conflicts: CrossContributorConflict[];
  escalationIndicators: string[];
  synthesisNotes: string[];
} {
  const postures = contributors
    .map((ref) => ref.postureOrIndication)
    .filter((value): value is string => typeof value === "string");

  const deteriorating = postures.some(
    (value) => value === "deteriorating" || value === "declining" || value === "over",
  );
  const uncertain = postures.some(
    (value) => value === "uncertain" || value === "attention_required",
  );
  const favourable = postures.some(
    (value) => value === "favourable" || value === "improving",
  );

  const riskTypes: RiskSignal[] = ["unknown"];
  if (deteriorating && sufficiency !== "insufficient") {
    riskTypes.push("emerging", "increasing", "persistent");
  } else if (uncertain) {
    riskTypes.push("emerging", "unresolved", "evidence_gap");
  } else {
    riskTypes.push("emerging");
  }
  if (contributors.length >= 3) riskTypes.push("interacting");

  const opportunityTypes: OpportunitySignal[] = ["unknown"];
  if (favourable) {
    opportunityTypes.push("recovery", "productivity", "schedule_protection");
  }
  if (deteriorating) {
    opportunityTypes.push("mitigation", "coordination", "sequencing", "cost_avoidance");
  } else {
    opportunityTypes.push("coordination", "sequencing");
  }

  const uniqueRisk = [...new Set(riskTypes)].slice(0, 4);
  const uniqueOpportunity = [...new Set(opportunityTypes)].slice(0, 4);
  const affected = contributors.map((ref) => ref.contributorKey);

  const riskSignals: RiskIntelligenceSignal[] = uniqueRisk.map((riskSignal) => ({
    signalId: newId("pcrosg"),
    riskSignal,
    narrative: `Advisory ${riskSignal.replace(/_/g, " ")} risk intelligence signal — not a governed register item`,
    assumptions: ["signal_is_advisory_only", "human_decides_register_items"],
    dependencies: ["published_composed_contributors"],
    uncertainties: uncertain ? ["contributor_signals_uncertain"] : [],
    evidenceGapNotes: riskSignal === "evidence_gap" ? ["insufficient_evidence_for_formal_risk"] : [],
    supportingEvidenceIds: [],
    affectedContributors: [...new Set(affected)].slice(0, 8) as RiskIntelligenceSignal["affectedContributors"],
    materialityPosture: deteriorating ? "attention_warranted" : "monitoring",
    escalationIndicator: deteriorating && uncertain,
    registerItemClaimed: false,
    ownerAssigned: false,
    treatmentExecuted: false,
  }));

  const opportunitySignals: OpportunityIntelligenceSignal[] = uniqueOpportunity.map(
    (opportunitySignal) => ({
      signalId: newId("pcrosg"),
      opportunitySignal,
      narrative: `Advisory ${opportunitySignal.replace(/_/g, " ")} opportunity intelligence signal — not a governed register item`,
      assumptions: ["signal_is_advisory_only", "human_decides_register_items"],
      dependencies: ["published_composed_contributors"],
      uncertainties: uncertain ? ["contributor_signals_uncertain"] : [],
      evidenceGapNotes: [],
      supportingEvidenceIds: [],
      affectedContributors: [...new Set(affected)].slice(0, 8) as OpportunityIntelligenceSignal["affectedContributors"],
      materialityPosture: favourable ? "informational" : "monitoring",
      registerItemClaimed: false,
      ownerAssigned: false,
      treatmentExecuted: false,
    }),
  );

  const conflicts: CrossContributorConflict[] = [];
  if (deteriorating && favourable) {
    conflicts.push({
      conflictId: newId("pcrocf"),
      contributorKeys: [...new Set(affected)].slice(0, 4) as CrossContributorConflict["contributorKeys"],
      description: "Mixed deteriorating and favourable contributor postures detected",
      unresolved: true,
    });
  }

  const escalationIndicators = riskSignals
    .filter((signal) => signal.escalationIndicator)
    .map((signal) => `escalation:${signal.riskSignal}`);

  const synthesisNotes = [
    `${riskSignals.length} advisory risk signals and ${opportunitySignals.length} opportunity signals synthesised`,
    "no risk or opportunity register mutation performed",
    "no owner assignment or treatment execution",
  ];

  return { riskSignals, opportunitySignals, conflicts, escalationIndicators, synthesisNotes };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
