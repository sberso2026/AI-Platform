/**
 * Phase 11K — Assurance Intelligence Engine.
 *
 * Advisory assurance posture from published composed contributors and all
 * upstream intelligence outputs. Never mutates upstream contributors.
 *
 * Forbidden: certification/verification/approval claims, evidence approval,
 * register mutation, CPM, EV, unsupported numerical confidence %.
 */

import {
  isAbstainingAssuranceSufficiency,
  assuranceStateKey,
  postureFromSufficiency,
  type AssuranceAssessmentState,
  type AssuranceConfidence,
  type AssuranceControlContext,
  type AssuranceContributorFinding,
  type AssuranceContributorRef,
  type AssuranceCrossContributorConflict,
  type AssuranceEvidence,
  type AssuranceEvidenceSufficiency,
  type AssuranceFindingKind,
  type AssurancePosture,
  type AssuranceSynthesis,
} from "./assurance";
import {
  createAssuranceConfidenceEngine,
  type AssuranceConfidenceEngine,
} from "./assurance-confidence";
import {
  createProjectContextCompositionEngine,
  type ComposedProjectContext,
  type ProjectContextCompositionEngine,
} from "./project-context-composition";
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
  AI_MAY_PUBLISH_ASSURANCE_FORBIDDEN,
  ASSURANCE_INTELLIGENCE_IS_ADVISORY_ONLY,
  AUTOMATIC_ASSURANCE_APPROVAL_ENABLED,
  AUTOMATIC_CERTIFICATION_ENABLED,
  AUTOMATIC_EVIDENCE_APPROVAL_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FORECAST_EXECUTION_IMPLEMENTED,
  PREDICTIVE_SCHEDULING_IMPLEMENTED,
} from "../version";

export type AssuranceAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: AssuranceControlContext;
  progress: readonly ProgressAssessmentState[];
  schedule?: readonly ScheduleAssessmentState[];
  change?: readonly ChangeIntelligenceState[];
  cost?: readonly CostIntelligenceState[];
  productivity?: readonly ProductivityAssessmentState[];
  forecast?: readonly ForecastAssessmentState[];
  decision?: readonly DecisionAssessmentState[];
  scenario?: readonly ScenarioAssessmentState[];
  riskOpportunity?: readonly RiskOpportunityAssessmentState[];
  evidence?: readonly AssuranceEvidence[];
  version?: number;
  status?: AssuranceAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  freshnessHorizonHours?: number;
  minimumContributorCount?: number;
  composedContext?: ComposedProjectContext;
};

export type AssuranceAssessmentResult = {
  state: AssuranceAssessmentState;
  confidence: AssuranceConfidence;
  composedContext: ComposedProjectContext;
  abstained: boolean;
  abstentionReason?: string;
};

export type AssuranceIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: AssuranceConfidenceEngine;
  compositionEngine?: ProjectContextCompositionEngine;
};

export class ProjectControlsAssuranceIntelligenceEngine {
  readonly kind = "assurance_intelligence_engine" as const;
  private readonly confidenceEngine: AssuranceConfidenceEngine;
  private readonly compositionEngine: ProjectContextCompositionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: AssuranceIntelligenceEngineDeps = {}) {
    assertNoCertificationAuthority();
    assertNoEvidenceApproval();
    assertNoEarnedValueOrCpm();
    assertAdvisoryOnly();
    this.confidenceEngine = deps.confidenceEngine ?? createAssuranceConfidenceEngine();
    this.compositionEngine =
      deps.compositionEngine ?? createProjectContextCompositionEngine({ newId: deps.newId });
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: AssuranceAssessmentInput): AssuranceAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_assurance_intelligence_only",
      "assurance_is_not_verification_or_certification",
      "no_automatic_evidence_approval_or_certification",
      "findings_are_advisory_only",
    ];
    const assumptions: string[] = [
      "assurance_derived_from_published_composed_contributors_and_all_intelligence_outputs",
      "upstream_contributors_not_mutated",
      "humans_remain_assurance_verification_and_certification_authorities",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.assuranceUnitId) throw new Error("assurance_unit_id_required");
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

    const publishedRiskOpportunity = (input.riskOpportunity ?? []).filter(
      (state) => state.status === "published" && !state.abstained,
    );
    const latestRiskOpportunity = publishedRiskOpportunity.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];

    const evidence = buildEvidenceFromComposition(
      composed,
      latestForecast,
      latestDecision,
      latestScenario,
      latestRiskOpportunity,
      input.evidence ?? [],
      this.newId,
    );

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcasconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      composedContext: composed,
      forecastStates: publishedForecast,
      decisionStates: publishedDecision,
      scenarioStates: publishedScenario,
      riskOpportunityStates: publishedRiskOpportunity,
      evidence,
      asOf,
      freshnessHorizonHours: input.freshnessHorizonHours,
      minimumContributorCount: input.minimumContributorCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingAssuranceSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_assurance_basis")
      : undefined;

    const contributingContributors: AssuranceContributorRef[] = [
      ...composed.contributorRefs.map((ref) => ({
        contributorKey: ref.contributorKey as AssuranceContributorRef["contributorKey"],
        stateId: ref.stateId,
        status: ref.status,
        abstained: ref.abstained,
        postureOrIndication: ref.postureOrIndication,
        assessedAt: ref.assessedAt,
        published: ref.status === "published",
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
              published: true,
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
              published: true,
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
              published: true,
            },
          ]
        : []),
      ...(latestRiskOpportunity
        ? [
            {
              contributorKey: "risk_opportunity_intelligence" as const,
              stateId: latestRiskOpportunity.stateId,
              status: latestRiskOpportunity.status,
              abstained: latestRiskOpportunity.abstained,
              postureOrIndication: latestRiskOpportunity.assessmentClass,
              assessedAt: latestRiskOpportunity.assessedAt,
              published: true,
            },
          ]
        : []),
    ];

    let contributorFindings: AssuranceContributorFinding[] = [];
    let synthesis: AssuranceSynthesis = emptySynthesis(this.newId);
    let assurancePosture: AssurancePosture = "unknown";

    if (abstained) {
      reasons.push("abstained_no_assurance_findings_published");
      limitations.push("abstained_insufficient_composed_basis");
      assurancePosture = postureFromSufficiency(
        confidence.dataSufficiency,
        confidence.conflictState === "detected",
      );
    } else {
      const derived = deriveAssuranceFindings(
        contributingContributors,
        confidence.dataSufficiency,
        this.newId,
      );
      contributorFindings = derived.findings;
      assurancePosture = derived.integratedPosture;
      synthesis = {
        synthesisId: this.newId("pcascmp"),
        integratedPosture: derived.integratedPosture,
        contributorFindings: derived.findings,
        crossContributorConflicts: derived.conflicts,
        evidenceGapNotes: derived.evidenceGapNotes,
        staleSourceNotes: derived.staleSourceNotes,
        unsupportedClaimNotes: derived.unsupportedClaimNotes,
        synthesisNotes: derived.synthesisNotes,
        certificationClaimed: false,
        verificationClaimed: false,
        approvalClaimed: false,
        evidenceApproved: false,
        mutatesUpstreamContributors: false,
      };
      if (confidence.dataSufficiency === "limited") {
        reasons.push("limited_basis_assurance_findings_are_advisory");
        limitations.push("limited_contributor_basis");
      }
    }

    const stateId = this.newId("pcasst");
    const state: AssuranceAssessmentState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      assurancePosture,
      synthesis,
      contributorFindings,
      contributingContributors,
      evidenceRefs: evidence.map((item) => item.evidenceId),
      confidence,
      assumptions: dedupe(assumptions),
      limitations: dedupe(limitations),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "assurance_intelligence_advisory_v1",
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
      riskOpportunityContextId: latestRiskOpportunity?.stateId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      autoExecutionEnabled: false,
      scheduleExecutionPerformed: false,
      costExecutionPerformed: false,
      contractInstructionPerformed: false,
      approvalAuthorityClaimed: false,
      certificationClaimed: false,
      verificationClaimed: false,
      evidenceApprovalClaimed: false,
      resourcePlanningPerformed: false,
      budgetLedgerMutated: false,
      financialPostingPerformed: false,
      predictiveSchedulingPerformed: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      mutatesUpstreamContributors: false,
      autonomousPublication: false,
      duplicateAssuranceOwnershipDetected: false,
      numericalPrecisionClaimed: false,
    };

    return { state, confidence, composedContext: composed, abstained, abstentionReason };
  }

  assessAssurance(input: AssuranceAssessmentInput): AssuranceAssessmentResult {
    return this.assess(input);
  }

  keyFor(scope: ProjectScopeRef, assuranceUnitId: string): string {
    return assuranceStateKey(scope, assuranceUnitId);
  }
}

export const AssuranceIntelligenceEngine = ProjectControlsAssuranceIntelligenceEngine;

export function createAssuranceIntelligenceEngine(
  deps: AssuranceIntelligenceEngineDeps = {},
): ProjectControlsAssuranceIntelligenceEngine {
  return new ProjectControlsAssuranceIntelligenceEngine(deps);
}

export function assertNoCertificationAuthority(): {
  ok: true;
  automaticCertificationEnabled: false;
  automaticAssuranceApprovalEnabled: false;
} {
  if (AUTOMATIC_CERTIFICATION_ENABLED || AUTOMATIC_ASSURANCE_APPROVAL_ENABLED) {
    throw new Error("automatic_certification_or_assurance_approval_forbidden");
  }
  return {
    ok: true,
    automaticCertificationEnabled: false,
    automaticAssuranceApprovalEnabled: false,
  };
}

export function assertNoEvidenceApproval(): {
  ok: true;
  automaticEvidenceApprovalEnabled: false;
} {
  if (AUTOMATIC_EVIDENCE_APPROVAL_ENABLED) {
    throw new Error("automatic_evidence_approval_forbidden_in_assurance_intelligence");
  }
  return { ok: true, automaticEvidenceApprovalEnabled: false };
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
    throw new Error("earned_value_and_cpm_forbidden_in_assurance_intelligence");
  }
  return { ok: true, earnedValueImplemented: false, cpmSchedulingImplemented: false };
}

export function assertAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  if (!ASSURANCE_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("assurance_intelligence_must_be_advisory_only");
  }
  if (!AI_MAY_PUBLISH_ASSURANCE_FORBIDDEN) {
    throw new Error("ai_may_not_publish_assurance");
  }
  return { ok: true, advisoryOnly: true };
}

function emptySynthesis(newId: (prefix: string) => string): AssuranceSynthesis {
  return {
    synthesisId: newId("pcascmp"),
    integratedPosture: "unknown",
    contributorFindings: [],
    crossContributorConflicts: [],
    evidenceGapNotes: [],
    staleSourceNotes: [],
    unsupportedClaimNotes: [],
    synthesisNotes: [],
    certificationClaimed: false,
    verificationClaimed: false,
    approvalClaimed: false,
    evidenceApproved: false,
    mutatesUpstreamContributors: false,
  };
}

function buildEvidenceFromComposition(
  composed: ComposedProjectContext,
  forecast: ForecastAssessmentState | undefined,
  decision: DecisionAssessmentState | undefined,
  scenario: ScenarioAssessmentState | undefined,
  riskOpportunity: RiskOpportunityAssessmentState | undefined,
  extra: readonly AssuranceEvidence[],
  newId: (prefix: string) => string,
): AssuranceEvidence[] {
  const baseEvidence = (ref: {
    stateId: string;
    contributorKey: string;
    status: string;
    assessedAt?: string;
    postureOrIndication?: string;
    kind: AssuranceEvidence["kind"];
    sourceType: AssuranceEvidence["sourceType"];
  }): AssuranceEvidence => ({
    evidenceId: newId("pcasev"),
    kind: ref.kind,
    sourceType: ref.sourceType,
    sourceRef: ref.stateId,
    sourceKey: ref.contributorKey,
    provenance: "system_reference",
    reviewStatus: ref.status === "published" ? "published" : "reviewed",
    observedAt: ref.assessedAt,
    declaredSignal: ref.postureOrIndication,
    contributorKey: ref.contributorKey as AssuranceEvidence["contributorKey"],
    autoExecutionClaimed: false,
    scheduleExecutionClaimed: false,
    costExecutionClaimed: false,
    contractInstructionClaimed: false,
    approvalAuthorityClaimed: false,
    certificationClaimed: false,
    verificationClaimed: false,
    evidenceApprovalClaimed: false,
    earnedValueDerived: false,
    cpmDerived: false,
    financialPostingClaimed: false,
    numericalPrecisionClaimed: false,
    registerMutationClaimed: false,
    mutatesCoreRisk: false,
    mutatesUpstreamContributors: false,
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

  const extended = [
    forecast &&
      baseEvidence({
        stateId: forecast.stateId,
        contributorKey: "forecast",
        status: forecast.status,
        assessedAt: forecast.assessedAt,
        postureOrIndication: forecast.forecastPosture,
        kind: "forecast_assessment_ref",
        sourceType: "forecast_intelligence",
      }),
    decision &&
      baseEvidence({
        stateId: decision.stateId,
        contributorKey: "decision_support",
        status: decision.status,
        assessedAt: decision.assessedAt,
        postureOrIndication: decision.dominantDecisionClass,
        kind: "decision_assessment_ref",
        sourceType: "decision_support",
      }),
    scenario &&
      baseEvidence({
        stateId: scenario.stateId,
        contributorKey: "scenario_intelligence",
        status: scenario.status,
        assessedAt: scenario.assessedAt,
        postureOrIndication: scenario.assessmentClass,
        kind: "scenario_assessment_ref",
        sourceType: "scenario_intelligence",
      }),
    riskOpportunity &&
      baseEvidence({
        stateId: riskOpportunity.stateId,
        contributorKey: "risk_opportunity_intelligence",
        status: riskOpportunity.status,
        assessedAt: riskOpportunity.assessedAt,
        postureOrIndication: riskOpportunity.assessmentClass,
        kind: "risk_opportunity_assessment_ref",
        sourceType: "risk_opportunity_intelligence",
      }),
  ].filter((item): item is AssuranceEvidence => Boolean(item));

  return [...fromComposition, ...extended, ...extra.map(normaliseEvidence)];
}

function normaliseEvidence(evidence: AssuranceEvidence): AssuranceEvidence {
  if (
    evidence.certificationClaimed !== false ||
    evidence.verificationClaimed !== false ||
    evidence.evidenceApprovalClaimed !== false ||
    evidence.numericalPrecisionClaimed !== false ||
    evidence.mutatesUpstreamContributors !== false
  ) {
    throw new Error("assurance_evidence_may_not_claim_forbidden_capabilities");
  }
  return evidence;
}

function deriveAssuranceFindings(
  contributors: readonly AssuranceContributorRef[],
  sufficiency: AssuranceEvidenceSufficiency,
  newId: (prefix: string) => string,
): {
  findings: AssuranceContributorFinding[];
  integratedPosture: AssurancePosture;
  conflicts: AssuranceCrossContributorConflict[];
  evidenceGapNotes: string[];
  staleSourceNotes: string[];
  unsupportedClaimNotes: string[];
  synthesisNotes: string[];
} {
  const findings: AssuranceContributorFinding[] = [];
  const evidenceGapNotes: string[] = [];
  const staleSourceNotes: string[] = [];
  const unsupportedClaimNotes: string[] = [];
  const synthesisNotes: string[] = [];

  for (const ref of contributors) {
    let findingKind: AssuranceFindingKind = "complete";
    if (!ref.published) findingKind = "incomplete";
    else if (ref.abstained) findingKind = "unavailable";
    else if (!ref.assessedAt) findingKind = "missing_provenance";
    else if (!ref.postureOrIndication) findingKind = "missing_source";

    if (findingKind === "missing_source") evidenceGapNotes.push(`${ref.contributorKey}:missing_source`);
    if (findingKind === "missing_provenance") {
      staleSourceNotes.push(`${ref.contributorKey}:missing_provenance`);
    }
    if (findingKind === "incomplete") {
      synthesisNotes.push(`${ref.contributorKey}:not_published`);
    }

    findings.push({
      findingId: newId("pcasfnd"),
      contributorKey: ref.contributorKey,
      findingKind,
      narrative: `Contributor ${ref.contributorKey} assessed as ${findingKind}`,
      evidenceIds: [],
      unresolved: findingKind !== "complete",
      certificationClaimed: false,
      verificationClaimed: false,
      approvalClaimed: false,
    });
  }

  const unpublished = contributors.filter((ref) => !ref.published);
  if (unpublished.length > 0) {
    synthesisNotes.push("dependency_gap_unpublished_contributors");
  }

  const conflicts: AssuranceCrossContributorConflict[] = [];
  const postures = contributors
    .map((ref) => ref.postureOrIndication)
    .filter((value): value is string => typeof value === "string");
  const weak = postures.filter((p) => p === "deteriorating" || p === "declining" || p === "over");
  const strong = postures.filter((p) => p === "favourable" || p === "under" || p === "on_track");
  if (weak.length > 0 && strong.length > 0) {
    conflicts.push({
      conflictId: newId("pcasconf"),
      contributorKeys: contributors.slice(0, 4).map((ref) => ref.contributorKey),
      description: "cross_contributor_posture_conflict_detected",
      unresolved: true,
    });
    synthesisNotes.push("conflicting_contributor_postures");
  }

  const completeCount = findings.filter((f) => f.findingKind === "complete").length;
  let integratedPosture: AssurancePosture = postureFromSufficiency(
    sufficiency,
    conflicts.length > 0,
  );
  if (integratedPosture === "adequate" && completeCount === contributors.length) {
    integratedPosture = "strong";
  } else if (integratedPosture === "adequate" && completeCount < contributors.length / 2) {
    integratedPosture = "constrained";
  }

  if (sufficiency === "limited") unsupportedClaimNotes.push("limited_basis_no_numerical_precision");

  return {
    findings,
    integratedPosture,
    conflicts,
    evidenceGapNotes,
    staleSourceNotes,
    unsupportedClaimNotes,
    synthesisNotes,
  };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
