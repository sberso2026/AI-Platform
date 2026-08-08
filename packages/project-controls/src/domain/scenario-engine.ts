/**
 * Phase 11I — Scenario Intelligence Engine.
 *
 * Exploratory scenario comparison from published composed contributors,
 * forecast intelligence, and decision support recommendations.
 * Never mutates upstream intelligence. Never selects a preferred scenario.
 *
 * Forbidden: auto-execution, optimisation, preferred selection, Monte Carlo,
 * CPM, EV metrics, schedule/cost/contract execution, financial posting.
 */

import {
  isAbstainingScenarioSufficiency,
  scenarioStateKey,
  type ScenarioAssessmentState,
  type ScenarioComparison,
  type ScenarioConfidence,
  type ScenarioControlContext,
  type ScenarioContributorRef,
  type ScenarioEvidence,
  type ScenarioEvidenceSufficiency,
  type ScenarioOption,
  type ScenarioType,
} from "./scenario";
import {
  createScenarioConfidenceEngine,
  type ScenarioConfidenceEngine,
} from "./scenario-confidence";
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
import {
  AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
  AUTOMATIC_COST_CHANGE_ENABLED,
  AUTOMATIC_DECISION_EXECUTION_ENABLED,
  AUTOMATIC_SCENARIO_EXECUTION_ENABLED,
  AUTOMATIC_SCHEDULE_CHANGE_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  DECISION_ENGINE_IMPLEMENTED,
  DECISION_EXECUTION_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FORECAST_EXECUTION_IMPLEMENTED,
  PREDICTIVE_SCHEDULING_IMPLEMENTED,
  SCENARIO_INTELLIGENCE_IS_ADVISORY_ONLY,
} from "../version";

export type ScenarioAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ScenarioControlContext;
  progress: readonly ProgressAssessmentState[];
  schedule?: readonly ScheduleAssessmentState[];
  change?: readonly ChangeIntelligenceState[];
  cost?: readonly CostIntelligenceState[];
  productivity?: readonly ProductivityAssessmentState[];
  forecast?: readonly ForecastAssessmentState[];
  decision?: readonly DecisionAssessmentState[];
  evidence?: readonly ScenarioEvidence[];
  version?: number;
  status?: ScenarioAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  freshnessHorizonHours?: number;
  minimumContributorCount?: number;
  composedContext?: ComposedProjectContext;
};

export type ScenarioAssessmentResult = {
  state: ScenarioAssessmentState;
  confidence: ScenarioConfidence;
  composedContext: ComposedProjectContext;
  abstained: boolean;
  abstentionReason?: string;
};

export type ScenarioIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: ScenarioConfidenceEngine;
  compositionEngine?: ProjectContextCompositionEngine;
};

export class ProjectControlsScenarioIntelligenceEngine {
  readonly kind = "scenario_intelligence_engine" as const;
  private readonly confidenceEngine: ScenarioConfidenceEngine;
  private readonly compositionEngine: ProjectContextCompositionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ScenarioIntelligenceEngineDeps = {}) {
    assertNoAutoExecution();
    assertNoPredictiveScheduling();
    assertNoEarnedValueOrCpm();
    assertAdvisoryOnly();
    this.confidenceEngine = deps.confidenceEngine ?? createScenarioConfidenceEngine();
    this.compositionEngine =
      deps.compositionEngine ?? createProjectContextCompositionEngine({ newId: deps.newId });
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: ScenarioAssessmentInput): ScenarioAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_scenario_intelligence_only",
      "scenarios_are_exploratory_not_instructions",
      "no_preferred_scenario_selection_or_optimisation",
      "no_auto_execution_or_contract_authority",
    ];
    const assumptions: string[] = [
      "scenario_intelligence_derived_from_published_composed_contributors_forecast_and_decision",
      "upstream_contributors_not_mutated",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.scenarioUnitId) throw new Error("scenario_unit_id_required");
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

    const evidence = buildEvidenceFromComposition(
      composed,
      latestForecast,
      latestDecision,
      input.evidence ?? [],
      this.newId,
    );

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcscconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      composedContext: composed,
      forecastStates: publishedForecast,
      decisionStates: publishedDecision,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      minimumContributorCount: input.minimumContributorCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingScenarioSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_scenario_basis")
      : undefined;

    const contributingContributors: ScenarioContributorRef[] = [
      ...composed.contributorRefs.map((ref) => ({
        contributorKey: ref.contributorKey as ScenarioContributorRef["contributorKey"],
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
    ];

    let scenarioOptions: ScenarioOption[] = [];
    let comparison: ScenarioComparison = {
      comparisonId: this.newId("pcsccmp"),
      scenarioOptions: [],
      comparisonNotes: [],
      preferredScenarioSelected: false,
      optimisationPerformed: false,
    };

    if (abstained) {
      reasons.push("abstained_no_scenario_comparison_published");
      limitations.push("abstained_insufficient_composed_basis");
    } else {
      const derived = deriveScenarioOptions(
        contributingContributors,
        confidence.dataSufficiency,
        this.newId,
      );
      scenarioOptions = derived.options;
      comparison = {
        comparisonId: this.newId("pcsccmp"),
        scenarioOptions: derived.options,
        comparisonNotes: derived.comparisonNotes,
        preferredScenarioSelected: false,
        optimisationPerformed: false,
      };
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_scenario_comparison_is_advisory");
        limitations.push("limited_contributor_basis");
      }
    }

    const stateId = this.newId("pcssst");
    const state: ScenarioAssessmentState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      comparison,
      scenarioOptions,
      contributingContributors,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      confidence,
      assumptions: dedupe(assumptions),
      limitations: dedupe(limitations),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "scenario_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      composedContextId: composed.contextId,
      forecastContextId: latestForecast?.stateId,
      decisionContextId: latestDecision?.stateId,
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
      completionDatePredicted: false,
      costDecisionComputed: false,
      scheduleExecuted: false,
      preferredScenarioSelected: false,
      optimisationPerformed: false,
      monteCarloPerformed: false,
      numericalPrecisionClaimed: false,
    };

    return { state, confidence, composedContext: composed, abstained, abstentionReason };
  }

  compareScenarios(input: ScenarioAssessmentInput): ScenarioAssessmentResult {
    return this.assess(input);
  }

  keyFor(scope: ProjectScopeRef, scenarioUnitId: string): string {
    return scenarioStateKey(scope, scenarioUnitId);
  }
}

export const ScenarioIntelligenceEngine = ProjectControlsScenarioIntelligenceEngine;

export function createScenarioIntelligenceEngine(
  deps: ScenarioIntelligenceEngineDeps = {},
): ProjectControlsScenarioIntelligenceEngine {
  return new ProjectControlsScenarioIntelligenceEngine(deps);
}

export function assertNoAutoExecution(): {
  ok: true;
  automaticScenarioExecutionEnabled: false;
  automaticDecisionExecutionEnabled: false;
  automaticScheduleChangeEnabled: false;
  automaticCostChangeEnabled: false;
  automaticContractInstructionEnabled: false;
} {
  if (
    AUTOMATIC_SCENARIO_EXECUTION_ENABLED ||
    AUTOMATIC_DECISION_EXECUTION_ENABLED ||
    AUTOMATIC_SCHEDULE_CHANGE_ENABLED ||
    AUTOMATIC_COST_CHANGE_ENABLED ||
    AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED
  ) {
    throw new Error("automatic_scenario_execution_forbidden_in_scenario_intelligence");
  }
  return {
    ok: true,
    automaticScenarioExecutionEnabled: false,
    automaticDecisionExecutionEnabled: false,
    automaticScheduleChangeEnabled: false,
    automaticCostChangeEnabled: false,
    automaticContractInstructionEnabled: false,
  };
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
    throw new Error("predictive_scheduling_forbidden_in_scenario_intelligence");
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
    throw new Error("earned_value_and_cpm_forbidden_in_scenario_intelligence");
  }
  return { ok: true, earnedValueImplemented: false, cpmSchedulingImplemented: false };
}

export function assertAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  if (!SCENARIO_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("scenario_intelligence_must_be_advisory_only");
  }
  return { ok: true, advisoryOnly: true };
}

function buildEvidenceFromComposition(
  composed: ComposedProjectContext,
  forecast: ForecastAssessmentState | undefined,
  decision: DecisionAssessmentState | undefined,
  extra: readonly ScenarioEvidence[],
  newId: (prefix: string) => string,
): ScenarioEvidence[] {
  const fromComposition: ScenarioEvidence[] = composed.contributorRefs.map((ref) => ({
    evidenceId: newId("pcscev"),
    kind: "composed_context_ref",
    sourceType: "project_context_composition",
    sourceRef: ref.stateId,
    sourceKey: ref.contributorKey,
    provenance: "system_reference",
    reviewStatus: ref.status === "published" ? "published" : "reviewed",
    observedAt: ref.assessedAt,
    declaredSignal: ref.postureOrIndication,
    contributorKey: ref.contributorKey as ScenarioEvidence["contributorKey"],
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
    preferredSelectionClaimed: false,
    optimisationClaimed: false,
    mutatesCoreRisk: false,
  }));
  const fromForecast: ScenarioEvidence[] = forecast
    ? [
        {
          evidenceId: newId("pcscev"),
          kind: "forecast_assessment_ref",
          sourceType: "forecast_intelligence",
          sourceRef: forecast.stateId,
          sourceKey: "forecast",
          provenance: "system_reference",
          reviewStatus: "published",
          observedAt: forecast.assessedAt,
          declaredSignal: forecast.forecastPosture,
          contributorKey: "forecast",
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
          preferredSelectionClaimed: false,
          optimisationClaimed: false,
          mutatesCoreRisk: false,
        },
      ]
    : [];
  const fromDecision: ScenarioEvidence[] = decision
    ? [
        {
          evidenceId: newId("pcscev"),
          kind: "decision_assessment_ref",
          sourceType: "decision_support",
          sourceRef: decision.stateId,
          sourceKey: "decision_support",
          provenance: "system_reference",
          reviewStatus: "published",
          observedAt: decision.assessedAt,
          declaredSignal: decision.dominantDecisionClass,
          contributorKey: "decision_support",
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
          preferredSelectionClaimed: false,
          optimisationClaimed: false,
          mutatesCoreRisk: false,
        },
      ]
    : [];
  return [...fromComposition, ...fromForecast, ...fromDecision, ...extra.map(normaliseEvidence)];
}

function normaliseEvidence(evidence: ScenarioEvidence): ScenarioEvidence {
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
    evidence.preferredSelectionClaimed !== false ||
    evidence.optimisationClaimed !== false
  ) {
    throw new Error("scenario_evidence_may_not_claim_forbidden_capabilities");
  }
  return evidence;
}

function deriveScenarioOptions(
  contributors: readonly ScenarioContributorRef[],
  sufficiency: ScenarioEvidenceSufficiency,
  newId: (prefix: string) => string,
): {
  options: ScenarioOption[];
  comparisonNotes: string[];
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

  const types: ScenarioType[] = ["maintain_current_posture"];
  if (deteriorating && sufficiency !== "insufficient") {
    types.push("investigate", "recovery_planning");
  } else if (uncertain) {
    types.push("investigate", "coordinate");
  } else {
    types.push("coordinate");
  }
  if (postures.some((value) => value === "favourable" || value === "improving")) {
    types.push("prioritise");
  }
  types.push("defer", "alternative_sequence");

  const uniqueTypes = [...new Set(types)].slice(0, 5);

  const affected = contributors.map((ref) => ref.contributorKey);

  const options: ScenarioOption[] = uniqueTypes.map((scenarioType) => ({
    optionId: newId("pcsopt"),
    scenarioType,
    objective: `Advisory ${scenarioType.replace(/_/g, " ")} scenario for exploratory comparison`,
    assumptions: ["scenarios_are_advisory_only", "no_preferred_selection"],
    dependencies: ["published_composed_contributors"],
    constraints: ["not_contract_or_project_approval", "human_decision_ownership_required"],
    uncertainties: uncertain ? ["contributor_signals_uncertain"] : [],
    potentialImplications: ["improved_situational_awareness_without_executing_changes"],
    supportingEvidenceIds: [],
    limitations: ["scenario_not_recommendation_not_decision_not_authorised_action"],
    affectedContributors: [...new Set(affected)].slice(0, 7) as ScenarioOption["affectedContributors"],
    selectionClaimed: false,
  }));

  const comparisonNotes = [
    `${options.length} advisory scenarios presented for comparison`,
    "no preferred scenario selected",
    "no optimisation performed",
  ];

  return { options, comparisonNotes };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
