/**
 * Phase 11G — Forecast Intelligence Engine.
 *
 * Advisory trajectory only from published composed contributors. Never mutates
 * upstream Progress/Schedule/Change/Cost/Productivity intelligence.
 *
 * Forbidden: CPM, EV metrics, completion dates, cost forecasts, resource planning,
 * budget ledger, financial posting, predictive scheduling.
 */

import {
  isAbstainingForecastSufficiency,
  forecastStateKey,
  type ForecastAssessmentState,
  type ForecastConfidence,
  type ForecastControlContext,
  type ForecastContributorRef,
  type ForecastEvidence,
  type ForecastEvidenceSufficiency,
  type ForecastPosture,
  type ForecastTrajectorySignal,
} from "./forecast";
import {
  createForecastConfidenceEngine,
  type ForecastConfidenceEngine,
} from "./forecast-confidence";
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
import {
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FORECAST_ENGINE_IMPLEMENTED,
  FORECAST_EXECUTION_IMPLEMENTED,
  FORECAST_INTELLIGENCE_IS_ADVISORY_ONLY,
  PREDICTIVE_SCHEDULING_IMPLEMENTED,
  RESOURCE_PLANNING_IMPLEMENTED,
} from "../version";

export type ForecastAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ForecastControlContext;
  progress: readonly ProgressAssessmentState[];
  schedule?: readonly ScheduleAssessmentState[];
  change?: readonly ChangeIntelligenceState[];
  cost?: readonly CostIntelligenceState[];
  productivity?: readonly ProductivityAssessmentState[];
  evidence?: readonly ForecastEvidence[];
  version?: number;
  status?: ForecastAssessmentState["status"];
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

export type ForecastAssessmentResult = {
  state: ForecastAssessmentState;
  confidence: ForecastConfidence;
  composedContext: ComposedProjectContext;
  abstained: boolean;
  abstentionReason?: string;
};

export type ForecastIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: ForecastConfidenceEngine;
  compositionEngine?: ProjectContextCompositionEngine;
};

export class ForecastIntelligenceEngine {
  readonly kind = "forecast_intelligence_engine" as const;
  private readonly confidenceEngine: ForecastConfidenceEngine;
  private readonly compositionEngine: ProjectContextCompositionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ForecastIntelligenceEngineDeps = {}) {
    assertNoPredictiveScheduling();
    assertNoEarnedValueOrCpm();
    assertAdvisoryOnly();
    this.confidenceEngine = deps.confidenceEngine ?? createForecastConfidenceEngine();
    this.compositionEngine =
      deps.compositionEngine ?? createProjectContextCompositionEngine({ newId: deps.newId });
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: ForecastAssessmentInput): ForecastAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_forecast_intelligence_only",
      "not_completion_date_or_cost_forecast",
      "no_predictive_scheduling_or_earned_value",
    ];
    const assumptions: string[] = [
      "forecast_derived_from_published_composed_contributors_only",
      "upstream_contributors_not_mutated",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.trajectoryUnitId) throw new Error("trajectory_unit_id_required");
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

    const evidence = buildEvidenceFromComposition(composed, input.evidence ?? [], this.newId);

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcfcconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      composedContext: composed,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      sufficiencyThreshold: input.sufficiencyThreshold,
      minimumContributorCount: input.minimumContributorCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingForecastSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_forecast_basis")
      : undefined;

    let forecastPosture: ForecastPosture = "unknown";
    const contributingContributors: ForecastContributorRef[] = composed.contributorRefs;

    if (abstained) {
      reasons.push("abstained_no_forecast_posture_published");
      limitations.push("abstained_insufficient_composed_basis");
    } else {
      forecastPosture = deriveForecastPosture(contributingContributors, confidence.dataSufficiency);
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_forecast_posture_is_advisory");
        limitations.push("limited_contributor_basis");
      }
    }

    const stateId = this.newId("pcfcst");
    const state: ForecastAssessmentState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      forecastPosture: abstained ? "unknown" : forecastPosture,
      contributingContributors,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      confidence,
      assumptions: dedupe(assumptions),
      limitations: dedupe(limitations),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "forecast_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      composedContextId: composed.contextId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      completionDatePredicted: false,
      costForecastComputed: false,
      resourcePlanningPerformed: false,
      budgetLedgerMutated: false,
      financialPostingPerformed: false,
      scheduleExecuted: false,
      changeExecuted: false,
      predictiveSchedulingPerformed: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      mutatesUpstreamContributors: false,
      autonomousPublication: false,
    };

    return { state, confidence, composedContext: composed, abstained, abstentionReason };
  }

  keyFor(scope: ProjectScopeRef, trajectoryUnitId: string): string {
    return forecastStateKey(scope, trajectoryUnitId);
  }
}

export function createForecastIntelligenceEngine(
  deps: ForecastIntelligenceEngineDeps = {},
): ForecastIntelligenceEngine {
  return new ForecastIntelligenceEngine(deps);
}

export function assertNoPredictiveScheduling(): {
  ok: true;
  forecastEngineImplemented: false;
  predictiveSchedulingImplemented: false;
  forecastExecutionImplemented: false;
} {
  if (
    FORECAST_ENGINE_IMPLEMENTED ||
    PREDICTIVE_SCHEDULING_IMPLEMENTED ||
    FORECAST_EXECUTION_IMPLEMENTED
  ) {
    throw new Error("predictive_scheduling_forbidden_in_forecast_intelligence");
  }
  return {
    ok: true,
    forecastEngineImplemented: false,
    predictiveSchedulingImplemented: false,
    forecastExecutionImplemented: false,
  };
}

export function assertNoEarnedValueOrCpm(): {
  ok: true;
  earnedValueImplemented: false;
  cpmSchedulingImplemented: false;
} {
  if (EARNED_VALUE_IMPLEMENTED || CPM_SCHEDULING_IMPLEMENTED) {
    throw new Error("earned_value_and_cpm_forbidden_in_forecast_intelligence");
  }
  return { ok: true, earnedValueImplemented: false, cpmSchedulingImplemented: false };
}

export function assertAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  if (!FORECAST_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("forecast_intelligence_must_be_advisory_only");
  }
  return { ok: true, advisoryOnly: true };
}

function buildEvidenceFromComposition(
  composed: ComposedProjectContext,
  extra: readonly ForecastEvidence[],
  newId: (prefix: string) => string,
): ForecastEvidence[] {
  const fromComposition: ForecastEvidence[] = composed.contributorRefs.map((ref) => ({
    evidenceId: newId("pcfcev"),
    kind: "composed_context_ref",
    sourceType: "project_context_composition",
    sourceRef: ref.stateId,
    sourceKey: ref.contributorKey,
    provenance: "system_reference",
    reviewStatus: ref.status === "published" ? "published" : "reviewed",
    observedAt: ref.assessedAt,
    declaredSignal: postureToSignal(ref.postureOrIndication),
    contributorKey: ref.contributorKey,
    completionDateClaimed: false,
    costForecastClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    resourcePlanningClaimed: false,
    budgetLedgerClaimed: false,
    financialPostingClaimed: false,
    mutatesCoreRisk: false,
  }));
  return [...fromComposition, ...extra.map(normaliseEvidence)];
}

function normaliseEvidence(evidence: ForecastEvidence): ForecastEvidence {
  if (
    evidence.completionDateClaimed !== false ||
    evidence.costForecastClaimed !== false ||
    evidence.earnedValueDerived !== false ||
    evidence.cpmDerived !== false ||
    evidence.resourcePlanningClaimed !== false ||
    evidence.budgetLedgerClaimed !== false ||
    evidence.financialPostingClaimed !== false
  ) {
    throw new Error("forecast_evidence_may_not_claim_forbidden_capabilities");
  }
  return evidence;
}

function postureToSignal(posture?: string): ForecastTrajectorySignal {
  if (!posture) return "unknown";
  const map: Record<string, ForecastTrajectorySignal> = {
    improving: "favourable",
    favourable: "favourable",
    stable: "stable",
    within_tolerance: "stable",
    declining: "deteriorating",
    deteriorating: "deteriorating",
    constrained: "uncertain",
    uncertain: "uncertain",
    recovering: "recovery_possible",
    recovery_possible: "recovery_possible",
    over: "deteriorating",
    under: "favourable",
    attention_required: "uncertain",
  };
  return map[posture] ?? "unknown";
}

function deriveForecastPosture(
  contributors: readonly ForecastContributorRef[],
  sufficiency: ForecastEvidenceSufficiency,
): ForecastPosture {
  const signals = contributors
    .map((ref) => postureToSignal(ref.postureOrIndication))
    .filter((value) => value !== "unknown");

  if (signals.length === 0) return "unknown";
  if (signals.some((value) => value === "deteriorating")) return "deteriorating";
  if (signals.some((value) => value === "recovery_possible")) return "recovery_possible";
  if (signals.some((value) => value === "uncertain")) return "uncertain";

  const favourable = signals.filter((value) => value === "favourable").length;
  const stable = signals.filter((value) => value === "stable").length;
  const deteriorating = signals.filter((value) => value === "deteriorating").length;

  if (favourable > 0 && deteriorating > 0) return "uncertain";
  if (deteriorating > favourable && sufficiency !== "insufficient") return "deteriorating";
  if (favourable > deteriorating && sufficiency !== "insufficient") return "favourable";
  if (stable > 0) return "stable";
  return "unknown";
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
