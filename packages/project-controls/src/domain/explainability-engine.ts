/**
 * Phase 11L — Explainability Intelligence Engine.
 * Public explanation summaries with traces. Never mutates upstream contributors.
 */

import {
  assertNoChainOfThoughtExposure,
  explainabilityStateKey,
  explanationStatusFromSufficiency,
  isAbstainingExplainabilitySufficiency,
  reasonFromSufficiency,
  type ExplainabilityAssessmentState,
  type ExplainabilityConfidence,
  type ExplainabilityControlContext,
  type ExplainabilityContributorExplanation,
  type ExplainabilityContributorRef,
  type ExplainabilityDependencyTrace,
  type ExplainabilityEvidence,
  type ExplainabilityEvidenceRef,
  type ExplainabilityGovernanceRef,
  type ExplainabilityProvenanceTrace,
  type ExplainabilitySnapshot,
  type ExplainabilitySynthesis,
  type ExplainabilityTimelineTrace,
  type ExplanationReason,
  type ExplanationStatus,
} from "./explainability";
import {
  createExplainabilityConfidenceEngine,
  type ExplainabilityConfidenceEngine,
} from "./explainability-confidence";
import {
  createProjectContextCompositionEngine,
  type ComposedProjectContext,
  type ProjectContextCompositionEngine,
} from "./project-context-composition";
import type { AssuranceAssessmentState } from "./assurance";
import type { ChangeIntelligenceState } from "./change";
import type { CostIntelligenceState } from "./cost";
import type { ProductivityAssessmentState } from "./productivity";
import type { ProgressAssessmentState } from "./progress";
import type { ScheduleAssessmentState } from "./schedule";
import type { ForecastAssessmentState } from "./forecast";
import type { DecisionAssessmentState } from "./decision";
import type { ScenarioAssessmentState } from "./scenario";
import type { RiskOpportunityAssessmentState } from "./risk-opportunity";
import type { ProjectScopeRef } from "./progress";
import {
  AI_MAY_PUBLISH_EXPLAINABILITY_FORBIDDEN,
  AUTOMATIC_EVIDENCE_CREATION_ENABLED,
  AUTOMATIC_EXPLANATION_APPROVAL_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  EXPLAINABILITY_INTELLIGENCE_IS_ADVISORY_ONLY,
  FORECAST_EXECUTION_IMPLEMENTED,
  PREDICTIVE_SCHEDULING_IMPLEMENTED,
} from "../version";

export type ExplainabilityAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ExplainabilityControlContext;
  progress: readonly ProgressAssessmentState[];
  schedule?: readonly ScheduleAssessmentState[];
  change?: readonly ChangeIntelligenceState[];
  cost?: readonly CostIntelligenceState[];
  productivity?: readonly ProductivityAssessmentState[];
  forecast?: readonly ForecastAssessmentState[];
  decision?: readonly DecisionAssessmentState[];
  scenario?: readonly ScenarioAssessmentState[];
  riskOpportunity?: readonly RiskOpportunityAssessmentState[];
  assurance?: readonly AssuranceAssessmentState[];
  evidence?: readonly ExplainabilityEvidence[];
  timelineEvents?: readonly ExplainabilityTimelineTrace[];
  version?: number;
  status?: ExplainabilityAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  minimumContributorCount?: number;
  composedContext?: ComposedProjectContext;
};

export type ExplainabilityAssessmentResult = {
  state: ExplainabilityAssessmentState;
  confidence: ExplainabilityConfidence;
  composedContext: ComposedProjectContext;
  abstained: boolean;
  abstentionReason?: string;
};

export type ExplainabilityIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: ExplainabilityConfidenceEngine;
  compositionEngine?: ProjectContextCompositionEngine;
};

export class ProjectControlsExplainabilityIntelligenceEngine {
  readonly kind = "explainability_intelligence_engine" as const;
  private readonly confidenceEngine: ExplainabilityConfidenceEngine;
  private readonly compositionEngine: ProjectContextCompositionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: ExplainabilityIntelligenceEngineDeps = {}) {
    assertNoAutomaticExplanationApproval();
    assertNoAutomaticEvidenceCreation();
    assertNoEarnedValueOrCpm();
    assertAdvisoryOnly();
    assertNoChainOfThoughtExposure();
    this.confidenceEngine =
      deps.confidenceEngine ?? createExplainabilityConfidenceEngine();
    this.compositionEngine =
      deps.compositionEngine ?? createProjectContextCompositionEngine({ newId: deps.newId });
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: ExplainabilityAssessmentInput): ExplainabilityAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_explainability_intelligence_only",
      "explanation_is_not_chain_of_thought_or_hidden_inference",
      "traceability_is_not_approval_or_verification",
      "no_automatic_explanation_approval_or_evidence_creation",
    ];
    const assumptions: string[] = [
      "explainability_derived_from_published_contributors_and_traces",
      "upstream_contributors_not_mutated",
      "humans_remain_approval_authorities",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.explainabilityUnitId) {
      throw new Error("explainability_unit_id_required");
    }
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

    const publishedAssurance = (input.assurance ?? []).filter(
      (s) => s.status === "published" && !s.abstained,
    );
    const latestAssurance = publishedAssurance.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];
    const publishedForecast = (input.forecast ?? []).filter(
      (s) => s.status === "published" && !s.abstained,
    );
    const latestForecast = publishedForecast.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];
    const publishedDecision = (input.decision ?? []).filter(
      (s) => s.status === "published" && !s.abstained,
    );
    const latestDecision = publishedDecision.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];
    const publishedScenario = (input.scenario ?? []).filter(
      (s) => s.status === "published" && !s.abstained,
    );
    const latestScenario = publishedScenario.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];
    const publishedRiskOpportunity = (input.riskOpportunity ?? []).filter(
      (s) => s.status === "published" && !s.abstained,
    );
    const latestRiskOpportunity = publishedRiskOpportunity.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];

    const evidence = buildEvidence(
      composed,
      latestAssurance,
      latestForecast,
      latestDecision,
      latestScenario,
      latestRiskOpportunity,
      input.evidence ?? [],
      this.newId,
    );

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcexconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      composedContext: composed,
      assuranceStates: publishedAssurance,
      forecastStates: publishedForecast,
      decisionStates: publishedDecision,
      scenarioStates: publishedScenario,
      riskOpportunityStates: publishedRiskOpportunity,
      evidence,
      asOf,
      minimumContributorCount: input.minimumContributorCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingExplainabilitySufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_explainability_basis")
      : undefined;

    const contributingContributors = buildContributorRefs(
      composed,
      latestAssurance,
      latestForecast,
      latestDecision,
      latestScenario,
      latestRiskOpportunity,
    );

    const evidenceRefs = evidence.map(
      (item): ExplainabilityEvidenceRef => ({
        evidenceRefId: item.evidenceId,
        kind: item.kind,
        sourceType: item.sourceType,
        sourceRef: item.sourceRef,
        sourceKey: item.sourceKey,
        provenance: item.provenance,
        observedAt: item.observedAt,
        reviewStatus: item.reviewStatus,
        contributorKey: item.contributorKey,
        chainOfThoughtExposed: false,
        hiddenReasoningExposed: false,
        fabricatedProvenance: false,
      }),
    );

    const dependencyTraces = buildDependencyTraces(contributingContributors, this.newId);
    const provenanceTraces = buildProvenanceTraces(evidenceRefs, this.newId);
    const timelineTraces = input.timelineEvents ?? [];

    let contributorExplanations: ExplainabilityContributorExplanation[] = [];
    let synthesis: ExplainabilitySynthesis = emptySynthesis(this.newId);
    let explanationStatus: ExplanationStatus = "unknown";
    let integratedReason: ExplanationReason = "unknown";
    let reasonSummary = "Explainability basis unavailable.";

    if (abstained) {
      reasons.push("abstained_no_explainability_published");
      limitations.push("abstained_insufficient_basis");
      explanationStatus = explanationStatusFromSufficiency(
        confidence.dataSufficiency,
        confidence.conflictState === "detected",
      );
      integratedReason = reasonFromSufficiency(confidence.dataSufficiency, evidence.length > 0);
      reasonSummary = buildReasonSummary(explanationStatus, integratedReason, true);
    } else {
      const derived = deriveContributorExplanations(
        contributingContributors,
        confidence.dataSufficiency,
        evidenceRefs,
        this.newId,
      );
      contributorExplanations = derived.explanations;
      explanationStatus = derived.integratedStatus;
      integratedReason = derived.integratedReason;
      reasonSummary = derived.reasonSummary;
      synthesis = {
        synthesisId: this.newId("pcexsyn"),
        integratedExplanationStatus: explanationStatus,
        integratedReason,
        reasonSummary,
        contributorExplanations,
        crossContributorConflictNotes: derived.conflictNotes,
        missingEvidenceNotes: derived.missingEvidenceNotes,
        unknownNotes: derived.unknownNotes,
        dependencyTraces,
        provenanceTraces,
        timelineTraces,
        assumptionRefs: [
          {
            assumptionRefId: this.newId("pcexasm"),
            assumption: "explainability_derived_from_published_contributors_only",
            reason: integratedReason,
            disclosed: true,
          },
        ],
        confidenceSourceRefs: contributingContributors.map((ref) => ({
          sourceRefId: this.newId("pcexcsr"),
          contributorKey: ref.contributorKey,
          confidenceClass: ref.published ? "medium" : "unavailable",
        })),
        governanceRefs: [
          {
            governanceRefId: this.newId("pcexgov"),
            kind: "advisory_only",
            approvalAuthorityClaimed: false,
            verificationClaimed: false,
          },
        ],
        chainOfThoughtExposed: false,
        hiddenReasoningExposed: false,
        fabricatedProvenance: false,
        approvalClaimed: false,
        verificationClaimed: false,
        mutatesUpstreamContributors: false,
      };
    }

    const snapshot: ExplainabilitySnapshot = {
      snapshotId: this.newId("pcexsnp"),
      integratedExplanationStatus: explanationStatus,
      integratedReason,
      reasonSummary,
      contributorCount: contributingContributors.length,
      evidenceRefCount: evidenceRefs.length,
      traceCount: dependencyTraces.length + provenanceTraces.length + timelineTraces.length,
      abstained,
      chainOfThoughtExposed: false,
      hiddenReasoningExposed: false,
    };

    const stateId = this.newId("pcexst");
    const state: ExplainabilityAssessmentState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      explanationStatus,
      synthesis,
      snapshot,
      contributorExplanations,
      contributingContributors,
      evidenceRefs,
      dependencyTraces,
      provenanceTraces,
      timelineTraces,
      assumptionRefs: synthesis.assumptionRefs,
      confidenceSourceRefs: synthesis.confidenceSourceRefs,
      governanceRefs: synthesis.governanceRefs,
      confidence,
      assumptions: dedupe(assumptions),
      limitations: dedupe(limitations),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "explainability_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      composedContextId: composed.contextId,
      assuranceContextId: latestAssurance?.stateId,
      forecastContextId: latestForecast?.stateId,
      decisionContextId: latestDecision?.stateId,
      scenarioContextId: latestScenario?.stateId,
      riskOpportunityContextId: latestRiskOpportunity?.stateId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      autoExecutionEnabled: false,
      scheduleExecutionPerformed: false,
      costExecutionPerformed: false,
      contractInstructionPerformed: false,
      approvalAuthorityClaimed: false,
      verificationClaimed: false,
      automaticEvidenceCreationClaimed: false,
      automaticExplanationApprovalClaimed: false,
      resourcePlanningPerformed: false,
      budgetLedgerMutated: false,
      financialPostingPerformed: false,
      predictiveSchedulingPerformed: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      mutatesUpstreamContributors: false,
      autonomousPublication: false,
      duplicateExplainabilityOwnershipDetected: false,
      chainOfThoughtExposed: false,
      hiddenReasoningExposed: false,
      fabricatedProvenance: false,
    };

    return { state, confidence, composedContext: composed, abstained, abstentionReason };
  }

  assessExplainability(input: ExplainabilityAssessmentInput): ExplainabilityAssessmentResult {
    return this.assess(input);
  }

  keyFor(scope: ProjectScopeRef, explainabilityUnitId: string): string {
    return explainabilityStateKey(scope, explainabilityUnitId);
  }
}

export const ExplainabilityIntelligenceEngine = ProjectControlsExplainabilityIntelligenceEngine;

export function createExplainabilityIntelligenceEngine(
  deps: ExplainabilityIntelligenceEngineDeps = {},
): ProjectControlsExplainabilityIntelligenceEngine {
  return new ProjectControlsExplainabilityIntelligenceEngine(deps);
}

export function assertNoAutomaticExplanationApproval(): {
  ok: true;
  automaticExplanationApprovalEnabled: false;
} {
  if (AUTOMATIC_EXPLANATION_APPROVAL_ENABLED) {
    throw new Error("automatic_explanation_approval_forbidden");
  }
  return { ok: true, automaticExplanationApprovalEnabled: false };
}

export function assertNoAutomaticEvidenceCreation(): {
  ok: true;
  automaticEvidenceCreationEnabled: false;
} {
  if (AUTOMATIC_EVIDENCE_CREATION_ENABLED) {
    throw new Error("automatic_evidence_creation_forbidden_in_explainability_intelligence");
  }
  return { ok: true, automaticEvidenceCreationEnabled: false };
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
    throw new Error("earned_value_and_cpm_forbidden_in_explainability_intelligence");
  }
  return { ok: true, earnedValueImplemented: false, cpmSchedulingImplemented: false };
}

export function assertAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  if (!EXPLAINABILITY_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("explainability_intelligence_must_be_advisory_only");
  }
  if (!AI_MAY_PUBLISH_EXPLAINABILITY_FORBIDDEN) {
    throw new Error("ai_may_not_publish_explainability");
  }
  return { ok: true, advisoryOnly: true };
}

function emptySynthesis(newId: (prefix: string) => string): ExplainabilitySynthesis {
  return {
    synthesisId: newId("pcexsyn"),
    integratedExplanationStatus: "unknown",
    integratedReason: "unknown",
    reasonSummary: "Explainability basis unavailable.",
    contributorExplanations: [],
    crossContributorConflictNotes: [],
    missingEvidenceNotes: [],
    unknownNotes: [],
    dependencyTraces: [],
    provenanceTraces: [],
    timelineTraces: [],
    assumptionRefs: [],
    confidenceSourceRefs: [],
    governanceRefs: [],
    chainOfThoughtExposed: false,
    hiddenReasoningExposed: false,
    fabricatedProvenance: false,
    approvalClaimed: false,
    verificationClaimed: false,
    mutatesUpstreamContributors: false,
  };
}

function buildEvidence(
  composed: ComposedProjectContext,
  assurance: AssuranceAssessmentState | undefined,
  forecast: ForecastAssessmentState | undefined,
  decision: DecisionAssessmentState | undefined,
  scenario: ScenarioAssessmentState | undefined,
  riskOpportunity: RiskOpportunityAssessmentState | undefined,
  extra: readonly ExplainabilityEvidence[],
  newId: (prefix: string) => string,
): ExplainabilityEvidence[] {
  const base = (ref: {
    stateId: string;
    contributorKey: string;
    status: string;
    assessedAt?: string;
    kind: ExplainabilityEvidence["kind"];
    sourceType: string;
  }): ExplainabilityEvidence => ({
    evidenceId: newId("pcexid"),
    kind: ref.kind,
    sourceType: ref.sourceType,
    sourceRef: ref.stateId,
    sourceKey: ref.contributorKey,
    provenance: ref.status === "published" ? "system_reference" : "unknown",
    reviewStatus: ref.status,
    observedAt: ref.assessedAt,
    contributorKey: ref.contributorKey as ExplainabilityEvidence["contributorKey"],
    chainOfThoughtExposed: false,
    hiddenReasoningExposed: false,
    fabricatedProvenance: false,
    autoExecutionClaimed: false,
    approvalAuthorityClaimed: false,
    verificationClaimed: false,
    automaticEvidenceCreationClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    registerMutationClaimed: false,
    mutatesUpstreamContributors: false,
  });

  const fromComposition = composed.contributorRefs.map((ref) =>
    base({
      stateId: ref.stateId,
      contributorKey: ref.contributorKey,
      status: ref.status,
      assessedAt: ref.assessedAt,
      kind: "composed_context_ref",
      sourceType: "project_context_composition",
    }),
  );

  const extended = [
    assurance &&
      base({
        stateId: assurance.stateId,
        contributorKey: "assurance_intelligence",
        status: assurance.status,
        assessedAt: assurance.assessedAt,
        kind: "assurance_assessment_ref",
        sourceType: "assurance_intelligence",
      }),
    forecast &&
      base({
        stateId: forecast.stateId,
        contributorKey: "forecast",
        status: forecast.status,
        assessedAt: forecast.assessedAt,
        kind: "forecast_assessment_ref",
        sourceType: "forecast_intelligence",
      }),
    decision &&
      base({
        stateId: decision.stateId,
        contributorKey: "decision_support",
        status: decision.status,
        assessedAt: decision.assessedAt,
        kind: "decision_assessment_ref",
        sourceType: "decision_support",
      }),
    scenario &&
      base({
        stateId: scenario.stateId,
        contributorKey: "scenario_intelligence",
        status: scenario.status,
        assessedAt: scenario.assessedAt,
        kind: "scenario_assessment_ref",
        sourceType: "scenario_intelligence",
      }),
    riskOpportunity &&
      base({
        stateId: riskOpportunity.stateId,
        contributorKey: "risk_opportunity_intelligence",
        status: riskOpportunity.status,
        assessedAt: riskOpportunity.assessedAt,
        kind: "risk_opportunity_assessment_ref",
        sourceType: "risk_opportunity_intelligence",
      }),
  ].filter((item): item is ExplainabilityEvidence => Boolean(item));

  return [...fromComposition, ...extended, ...extra.map(normaliseEvidence)];
}

function normaliseEvidence(evidence: ExplainabilityEvidence): ExplainabilityEvidence {
  if (
    evidence.chainOfThoughtExposed !== false ||
    evidence.hiddenReasoningExposed !== false ||
    evidence.fabricatedProvenance !== false ||
    evidence.automaticEvidenceCreationClaimed !== false ||
    evidence.mutatesUpstreamContributors !== false
  ) {
    throw new Error("explainability_evidence_may_not_claim_forbidden_capabilities");
  }
  return evidence;
}

function buildContributorRefs(
  composed: ComposedProjectContext,
  assurance?: AssuranceAssessmentState,
  forecast?: ForecastAssessmentState,
  decision?: DecisionAssessmentState,
  scenario?: ScenarioAssessmentState,
  riskOpportunity?: RiskOpportunityAssessmentState,
): ExplainabilityContributorRef[] {
  return [
    ...composed.contributorRefs.map((ref) => ({
      contributorKey: ref.contributorKey as ExplainabilityContributorRef["contributorKey"],
      stateId: ref.stateId,
      status: ref.status,
      abstained: ref.abstained,
      indication: ref.postureOrIndication,
      assessedAt: ref.assessedAt,
      published: ref.status === "published",
    })),
    ...(assurance
      ? [
          {
            contributorKey: "assurance_intelligence" as const,
            stateId: assurance.stateId,
            status: assurance.status,
            abstained: assurance.abstained,
            indication: assurance.assurancePosture,
            assessedAt: assurance.assessedAt,
            published: true,
          },
        ]
      : []),
    ...(forecast
      ? [
          {
            contributorKey: "forecast" as const,
            stateId: forecast.stateId,
            status: forecast.status,
            abstained: forecast.abstained,
            indication: forecast.forecastPosture,
            assessedAt: forecast.assessedAt,
            published: true,
          },
        ]
      : []),
    ...(decision
      ? [
          {
            contributorKey: "decision_support" as const,
            stateId: decision.stateId,
            status: decision.status,
            abstained: decision.abstained,
            indication: decision.dominantDecisionClass,
            assessedAt: decision.assessedAt,
            published: true,
          },
        ]
      : []),
    ...(scenario
      ? [
          {
            contributorKey: "scenario_intelligence" as const,
            stateId: scenario.stateId,
            status: scenario.status,
            abstained: scenario.abstained,
            indication: scenario.assessmentClass,
            assessedAt: scenario.assessedAt,
            published: true,
          },
        ]
      : []),
    ...(riskOpportunity
      ? [
          {
            contributorKey: "risk_opportunity_intelligence" as const,
            stateId: riskOpportunity.stateId,
            status: riskOpportunity.status,
            abstained: riskOpportunity.abstained,
            indication: riskOpportunity.assessmentClass,
            assessedAt: riskOpportunity.assessedAt,
            published: true,
          },
        ]
      : []),
  ];
}

function buildDependencyTraces(
  contributors: readonly ExplainabilityContributorRef[],
  newId: (prefix: string) => string,
): ExplainabilityDependencyTrace[] {
  return contributors.map((ref) => ({
    traceId: newId("pcexdep"),
    fromContributorKey: ref.contributorKey,
    dependencyKind: "references" as const,
    stateId: ref.stateId,
    unresolved: !ref.published || ref.abstained,
  }));
}

function buildProvenanceTraces(
  evidenceRefs: readonly ExplainabilityEvidenceRef[],
  newId: (prefix: string) => string,
): ExplainabilityProvenanceTrace[] {
  return evidenceRefs.map((ref) => ({
    traceId: newId("pcexprv"),
    sourceRef: ref.sourceRef,
    sourceType: ref.sourceType,
    provenance: ref.provenance,
    complete: ref.provenance !== "unknown" && Boolean(ref.observedAt),
    missingFields: ref.provenance === "unknown" ? ["provenance"] : [],
  }));
}

function deriveContributorExplanations(
  contributors: readonly ExplainabilityContributorRef[],
  sufficiency: ExplainabilityAssessmentState["confidence"]["dataSufficiency"],
  evidenceRefs: readonly ExplainabilityEvidenceRef[],
  newId: (prefix: string) => string,
): {
  explanations: ExplainabilityContributorExplanation[];
  integratedStatus: ExplanationStatus;
  integratedReason: ExplanationReason;
  reasonSummary: string;
  conflictNotes: string[];
  missingEvidenceNotes: string[];
  unknownNotes: string[];
} {
  const missingEvidenceNotes: string[] = [];
  const unknownNotes: string[] = [];
  const conflictNotes: string[] = [];
  const explanations: ExplainabilityContributorExplanation[] = [];

  for (const ref of contributors) {
    let explanationStatus: ExplanationStatus = "supported";
    let reason: ExplanationReason = "evidence_based";
    const contributorEvidence = evidenceRefs.filter(
      (e) => e.contributorKey === ref.contributorKey,
    );

    if (!ref.published) {
      explanationStatus = "incomplete";
      reason = "insufficient_evidence";
      missingEvidenceNotes.push(`${ref.contributorKey}:not_published`);
    } else if (ref.abstained) {
      explanationStatus = "unknown";
      reason = "unknown";
      unknownNotes.push(`${ref.contributorKey}:abstained`);
    } else if (contributorEvidence.length === 0) {
      explanationStatus = "unsupported";
      reason = "insufficient_evidence";
      missingEvidenceNotes.push(`${ref.contributorKey}:missing_evidence_refs`);
    } else if (contributorEvidence.some((e) => e.provenance === "unknown")) {
      explanationStatus = "partially_supported";
      reason = "derived";
    }

    explanations.push({
      explanationId: newId("pcexxpl"),
      contributorKey: ref.contributorKey,
      explanationStatus,
      reason,
      reasonSummary: buildReasonSummary(explanationStatus, reason, false, ref.contributorKey),
      evidenceRefIds: contributorEvidence.map((e) => e.evidenceRefId),
      missingEvidenceNotes: missingEvidenceNotes.filter((n) => n.startsWith(ref.contributorKey)),
      conflictNotes: [],
      unknownNotes: unknownNotes.filter((n) => n.startsWith(ref.contributorKey)),
      chainOfThoughtExposed: false,
      hiddenReasoningExposed: false,
      fabricatedProvenance: false,
      approvalClaimed: false,
      verificationClaimed: false,
    });
  }

  const integratedStatus = explanationStatusFromSufficiency(
    sufficiency,
    conflictNotes.length > 0,
  );
  const integratedReason = reasonFromSufficiency(sufficiency, evidenceRefs.length > 0);
  const reasonSummary = buildReasonSummary(integratedStatus, integratedReason, false);

  return {
    explanations,
    integratedStatus,
    integratedReason,
    reasonSummary,
    conflictNotes,
    missingEvidenceNotes,
    unknownNotes,
  };
}

function buildReasonSummary(
  status: ExplanationStatus,
  reason: ExplanationReason,
  abstained: boolean,
  contributorKey?: string,
): string {
  const subject = contributorKey ? `Contributor ${contributorKey}` : "Integrated explainability";
  if (abstained) {
    return `${subject}: explanation unavailable due to insufficient evidence basis (public summary only; not chain-of-thought).`;
  }
  return `${subject}: ${status.replace(/_/g, " ")} with ${reason.replace(/_/g, " ")} basis (public summary only; not chain-of-thought).`;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
