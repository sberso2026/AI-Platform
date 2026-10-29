/**
 * Phase 11H — Decision Support Intelligence Engine.
 *
 * Advisory options and recommendations only from published composed contributors
 * and forecast intelligence. Never mutates upstream intelligence.
 *
 * Forbidden: auto-execution, approve/reject/execute classes, CPM, EV metrics,
 * schedule/cost/contract execution, financial posting.
 */

import {
  isAbstainingDecisionSufficiency,
  decisionStateKey,
  type DecisionAssessmentState,
  type DecisionClass,
  type DecisionConfidence,
  type DecisionControlContext,
  type DecisionContributorRef,
  type DecisionEvidence,
  type DecisionEvidenceSufficiency,
  type DecisionOption,
  type DecisionRecommendation,
} from "./decision";
import {
  createDecisionConfidenceEngine,
  type DecisionConfidenceEngine,
} from "./decision-confidence";
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
import {
  AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED,
  AUTOMATIC_COST_CHANGE_ENABLED,
  AUTOMATIC_DECISION_EXECUTION_ENABLED,
  AUTOMATIC_SCHEDULE_CHANGE_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  DECISION_ENGINE_IMPLEMENTED,
  DECISION_EXECUTION_IMPLEMENTED,
  DECISION_SUPPORT_IS_ADVISORY_ONLY,
  EARNED_VALUE_IMPLEMENTED,
  FORECAST_EXECUTION_IMPLEMENTED,
  PREDICTIVE_SCHEDULING_IMPLEMENTED,
} from "../version";

export type DecisionAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: DecisionControlContext;
  progress: readonly ProgressAssessmentState[];
  schedule?: readonly ScheduleAssessmentState[];
  change?: readonly ChangeIntelligenceState[];
  cost?: readonly CostIntelligenceState[];
  productivity?: readonly ProductivityAssessmentState[];
  forecast?: readonly ForecastAssessmentState[];
  evidence?: readonly DecisionEvidence[];
  version?: number;
  status?: DecisionAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumContributorCount?: number;
  composedContext?: ComposedProjectContext;
};

export type DecisionAssessmentResult = {
  state: DecisionAssessmentState;
  confidence: DecisionConfidence;
  composedContext: ComposedProjectContext;
  abstained: boolean;
  abstentionReason?: string;
};

export type DecisionSupportEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: DecisionConfidenceEngine;
  compositionEngine?: ProjectContextCompositionEngine;
};

export class DecisionSupportEngine {
  readonly kind = "decision_support_engine" as const;
  private readonly confidenceEngine: DecisionConfidenceEngine;
  private readonly compositionEngine: ProjectContextCompositionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: DecisionSupportEngineDeps = {}) {
    assertNoAutoExecution();
    assertNoPredictiveScheduling();
    assertNoEarnedValueOrCpm();
    assertAdvisoryOnly();
    this.confidenceEngine = deps.confidenceEngine ?? createDecisionConfidenceEngine();
    this.compositionEngine =
      deps.compositionEngine ?? createProjectContextCompositionEngine({ newId: deps.newId });
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: DecisionAssessmentInput): DecisionAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_decision_support_only",
      "options_and_recommendations_not_instructions",
      "no_auto_execution_or_contract_authority",
    ];
    const assumptions: string[] = [
      "decision_support_derived_from_published_composed_contributors_and_forecast",
      "upstream_contributors_not_mutated",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.decisionUnitId) throw new Error("decision_unit_id_required");
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

    const evidence = buildEvidenceFromComposition(
      composed,
      latestForecast,
      input.evidence ?? [],
      this.newId,
    );

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcdconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      composedContext: composed,
      forecastStates: publishedForecast,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      sufficiencyThreshold: input.sufficiencyThreshold,
      minimumContributorCount: input.minimumContributorCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingDecisionSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_decision_basis")
      : undefined;

    const contributingContributors: DecisionContributorRef[] = [
      ...composed.contributorRefs.map((ref) => ({
        contributorKey: ref.contributorKey as DecisionContributorRef["contributorKey"],
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
    ];

    let options: DecisionOption[] = [];
    let recommendations: DecisionRecommendation[] = [];
    let dominantDecisionClass: DecisionClass | undefined;

    if (abstained) {
      reasons.push("abstained_no_decision_recommendations_published");
      limitations.push("abstained_insufficient_composed_basis");
    } else {
      const derived = deriveDecisionOptions(
        contributingContributors,
        confidence.dataSufficiency,
        this.newId,
      );
      options = derived.options;
      recommendations = derived.recommendations;
      dominantDecisionClass = derived.dominantClass;
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_decision_recommendations_are_advisory");
        limitations.push("limited_contributor_basis");
      }
    }

    const stateId = this.newId("pcdst");
    const state: DecisionAssessmentState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      options,
      recommendations,
      dominantDecisionClass,
      contributingContributors,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      confidence,
      assumptions: dedupe(assumptions),
      limitations: dedupe(limitations),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "decision_support_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      composedContextId: composed.contextId,
      forecastContextId: latestForecast?.stateId,
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
    };

    return { state, confidence, composedContext: composed, abstained, abstentionReason };
  }

  keyFor(scope: ProjectScopeRef, decisionUnitId: string): string {
    return decisionStateKey(scope, decisionUnitId);
  }
}

export function createDecisionSupportEngine(
  deps: DecisionSupportEngineDeps = {},
): DecisionSupportEngine {
  return new DecisionSupportEngine(deps);
}

export function assertNoAutoExecution(): {
  ok: true;
  automaticDecisionExecutionEnabled: false;
  automaticScheduleChangeEnabled: false;
  automaticCostChangeEnabled: false;
  automaticContractInstructionEnabled: false;
} {
  if (
    AUTOMATIC_DECISION_EXECUTION_ENABLED ||
    AUTOMATIC_SCHEDULE_CHANGE_ENABLED ||
    AUTOMATIC_COST_CHANGE_ENABLED ||
    AUTOMATIC_CONTRACT_INSTRUCTION_ENABLED
  ) {
    throw new Error("automatic_decision_execution_forbidden_in_decision_support");
  }
  return {
    ok: true,
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
    throw new Error("predictive_scheduling_forbidden_in_decision_support");
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
    throw new Error("earned_value_and_cpm_forbidden_in_decision_support");
  }
  return { ok: true, earnedValueImplemented: false, cpmSchedulingImplemented: false };
}

export function assertAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  if (!DECISION_SUPPORT_IS_ADVISORY_ONLY) {
    throw new Error("decision_support_must_be_advisory_only");
  }
  return { ok: true, advisoryOnly: true };
}

function buildEvidenceFromComposition(
  composed: ComposedProjectContext,
  forecast: ForecastAssessmentState | undefined,
  extra: readonly DecisionEvidence[],
  newId: (prefix: string) => string,
): DecisionEvidence[] {
  const fromComposition: DecisionEvidence[] = composed.contributorRefs.map((ref) => ({
    evidenceId: newId("pcdcev"),
    kind: "composed_context_ref",
    sourceType: "project_context_composition",
    sourceRef: ref.stateId,
    sourceKey: ref.contributorKey,
    provenance: "system_reference",
    reviewStatus: ref.status === "published" ? "published" : "reviewed",
    observedAt: ref.assessedAt,
    declaredSignal: ref.postureOrIndication,
    contributorKey: ref.contributorKey as DecisionEvidence["contributorKey"],
    autoExecutionClaimed: false,
    scheduleExecutionClaimed: false,
    costExecutionClaimed: false,
    contractInstructionClaimed: false,
    approvalAuthorityClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    mutatesCoreRisk: false,
  }));
  const fromForecast: DecisionEvidence[] = forecast
    ? [
        {
          evidenceId: newId("pcdcev"),
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
          mutatesCoreRisk: false,
        },
      ]
    : [];
  return [...fromComposition, ...fromForecast, ...extra.map(normaliseEvidence)];
}

function normaliseEvidence(evidence: DecisionEvidence): DecisionEvidence {
  if (
    evidence.autoExecutionClaimed !== false ||
    evidence.scheduleExecutionClaimed !== false ||
    evidence.costExecutionClaimed !== false ||
    evidence.contractInstructionClaimed !== false ||
    evidence.approvalAuthorityClaimed !== false ||
    evidence.earnedValueDerived !== false ||
    evidence.cpmDerived !== false ||
    evidence.financialPostingClaimed !== false
  ) {
    throw new Error("decision_evidence_may_not_claim_forbidden_capabilities");
  }
  return evidence;
}

function deriveDecisionOptions(
  contributors: readonly DecisionContributorRef[],
  sufficiency: DecisionEvidenceSufficiency,
  newId: (prefix: string) => string,
): {
  options: DecisionOption[];
  recommendations: DecisionRecommendation[];
  dominantClass?: DecisionClass;
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

  let primaryClass: DecisionClass = "monitor";
  if (deteriorating && sufficiency !== "insufficient") primaryClass = "investigate";
  else if (uncertain) primaryClass = "review";
  else if (postures.some((value) => value === "favourable" || value === "improving")) {
    primaryClass = "monitor";
  }

  const affected = contributors
    .map((ref) => ref.contributorKey)
    .filter((key): key is DecisionOption["affectedContributors"][number] => key !== "forecast" || true);

  const option: DecisionOption = {
    optionId: newId("pcdopt"),
    decisionClass: primaryClass,
    objective: `Advisory ${primaryClass} based on composed project intelligence`,
    expectedBenefit: "Improved situational awareness without executing changes",
    engineeringAssumptions: ["recommendations_are_advisory_only"],
    limitations: ["not_contract_or_project_approval", "human_decision_ownership_required"],
    affectedContributors: [
      ...new Set(
        affected.filter(
          (key): key is DecisionOption["affectedContributors"][number] =>
            key !== "forecast" ||
            contributors.some((ref) => ref.contributorKey === "forecast"),
        ),
      ),
    ].slice(0, 6) as DecisionOption["affectedContributors"],
    priorityRank: 1,
  };

  const recommendation: DecisionRecommendation = {
    recommendationId: newId("pcdrec"),
    decisionClass: primaryClass,
    objective: option.objective,
    supportingEvidenceIds: [],
    expectedBenefit: option.expectedBenefit,
    engineeringAssumptions: option.engineeringAssumptions,
    limitations: option.limitations,
    confidence: {
      dataSufficiency: sufficiency,
      confidenceClass: sufficiency === "limited" ? "medium" : "high",
      abstention: false,
    },
    affectedContributors: option.affectedContributors,
  };

  return {
    options: [option],
    recommendations: [recommendation],
    dominantClass: primaryClass,
  };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
