/**
 * Phase 11M — Organizational Learning Intelligence Engine.
 * Reference-only learning synthesis. Never mutates upstream contributors.
 */

import {
  assertNoFabricatedLessons,
  assertNoUnsupportedSimilarityScore,
  basisStatusFromSufficiency,
  isAbstainingOrganizationalLearningSufficiency,
  organizationalLearningStateKey,
  reasonFromSufficiency,
  taxonomyFromSufficiency,
  type KnowledgeProvenanceTrace,
  type LearningBasisReason,
  type LearningTaxonomyClass,
  type OrganizationalLearningAssessmentState,
  type OrganizationalLearningConfidence,
  type OrganizationalLearningControlContext,
  type OrganizationalLearningContributorRef,
  type OrganizationalLearningEvidence,
  type OrganizationalLearningEvidenceRef,
  type KnowledgeProvenanceTrace,
  type OrganizationalLearningGovernanceRef,
  type OrganizationalLearningItem,
  type OrganizationalLearningSnapshot,
  type OrganizationalLearningSynthesis,
  type OrganizationalLearningTimelineTrace,
  type LearningBasisStatus,
} from "./organizational-learning";
import {
  createOrganizationalLearningConfidenceEngine,
  type OrganizationalLearningConfidenceEngine,
} from "./organizational-learning-confidence";
import {
  createProjectContextCompositionEngine,
  type ComposedProjectContext,
  type ProjectContextCompositionEngine,
} from "./project-context-composition";
import type { ExplainabilityAssessmentState } from "./explainability";
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
  AI_MAY_PUBLISH_ORGANIZATIONAL_LEARNING_FORBIDDEN,
  AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED,
  AUTOMATIC_LEARNING_APPROVAL_ENABLED,
  CPM_SCHEDULING_IMPLEMENTED,
  EARNED_VALUE_IMPLEMENTED,
  FORECAST_EXECUTION_IMPLEMENTED,
  ORGANIZATIONAL_LEARNING_INTELLIGENCE_IS_ADVISORY_ONLY,
  PREDICTIVE_SCHEDULING_IMPLEMENTED,
} from "../version";

export type OrganizationalLearningAssessmentInput = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: OrganizationalLearningControlContext;
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
  explainability?: readonly ExplainabilityAssessmentState[];
  evidence?: readonly OrganizationalLearningEvidence[];
  historicalEvidenceRefs?: readonly { sourceRef: string; sourceType?: string; label?: string }[];
  lessonRegisterRefs?: readonly { lessonRefId: string; registerRef: string; summary: string }[];
  timelineEvents?: readonly OrganizationalLearningTimelineTrace[];
  crossProjectRefs?: readonly { projectRef: string; knowledgeRef: string; qualitativeReference: string }[];
  version?: number;
  status?: OrganizationalLearningAssessmentState["status"];
  asOf?: string;
  narrative?: string;
  createdBy?: string;
  supersedesId?: string;
  workflowInstanceId?: string;
  minimumContributorCount?: number;
  composedContext?: ComposedProjectContext;
};

export type OrganizationalLearningAssessmentResult = {
  state: OrganizationalLearningAssessmentState;
  confidence: OrganizationalLearningConfidence;
  composedContext: ComposedProjectContext;
  abstained: boolean;
  abstentionReason?: string;
};

export type OrganizationalLearningIntelligenceEngineDeps = {
  newId?: (prefix: string) => string;
  confidenceEngine?: OrganizationalLearningConfidenceEngine;
  compositionEngine?: ProjectContextCompositionEngine;
};

export class ProjectControlsOrganizationalLearningEngine {
  readonly kind = "organizational_learning_engine" as const;
  private readonly confidenceEngine: OrganizationalLearningConfidenceEngine;
  private readonly compositionEngine: ProjectContextCompositionEngine;
  private readonly newId: (prefix: string) => string;

  constructor(deps: OrganizationalLearningIntelligenceEngineDeps = {}) {
    assertNoAutomaticLearningApproval();
    assertNoAutomaticKnowledgeMutation();
    assertNoEarnedValueOrCpm();
    assertAdvisoryOnly();
    assertNoFabricatedLessons();
    assertNoUnsupportedSimilarityScore();
    this.confidenceEngine =
      deps.confidenceEngine ?? createOrganizationalLearningConfidenceEngine();
    this.compositionEngine =
      deps.compositionEngine ?? createProjectContextCompositionEngine({ newId: deps.newId });
    this.newId = deps.newId ?? ((prefix) => `${prefix}_${Math.random().toString(36).slice(2, 12)}`);
  }

  assess(input: OrganizationalLearningAssessmentInput): OrganizationalLearningAssessmentResult {
    const asOf = input.asOf ?? new Date().toISOString();
    const reasons: string[] = [];
    const limitations: string[] = [
      "advisory_organizational_learning_intelligence_only",
      "pattern_is_not_prediction",
      "lesson_is_not_recommendation",
      "history_is_not_approval",
      "organizational_learning_is_not_optimisation",
      "similar_project_is_not_current_project",
      "no_automatic_learning_approval_or_knowledge_mutation",
    ];
    const assumptions: string[] = [
      "organizational_learning_derived_from_published_contributors_and_historical_refs",
      "upstream_contributors_not_mutated",
      "humans_remain_owners_of_organizational_knowledge",
    ];

    if (!input.projectId) throw new Error("project_id_required");
    if (!input.controlContext.organizationalLearningUnitId) {
      throw new Error("organizational_learning_unit_id_required");
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

    const publishedExplainability = (input.explainability ?? []).filter(
      (s) => s.status === "published" && !s.abstained,
    );
    const latestExplainability = publishedExplainability.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];
    const publishedAssurance = (input.assurance ?? []).filter(
      (s) => s.status === "published" && !s.abstained,
    );
    const latestAssurance = publishedAssurance.sort(
      (a, b) => Date.parse(b.assessedAt) - Date.parse(a.assessedAt),
    )[0];

    const evidence = buildEvidence(
      composed,
      latestExplainability,
      latestAssurance,
      input.evidence ?? [],
      input.historicalEvidenceRefs ?? [],
      input.lessonRegisterRefs ?? [],
      this.newId,
    );

    const confidence = this.confidenceEngine.assess({
      confidenceId: this.newId("pcolconf"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope,
      controlContext: input.controlContext,
      composedContext: composed,
      explainabilityStates: publishedExplainability,
      assuranceStates: publishedAssurance,
      evidence,
      historicalEvidenceRefs: input.historicalEvidenceRefs,
      asOf,
      minimumContributorCount: input.minimumContributorCount,
    });
    reasons.push(...confidence.reasons);

    const abstained = isAbstainingOrganizationalLearningSufficiency(confidence.dataSufficiency);
    const abstentionReason = abstained
      ? (confidence.abstentionReason ?? "insufficient_organizational_learning_basis")
      : undefined;

    const contributingContributors = buildContributorRefs(
      composed,
      latestExplainability,
      latestAssurance,
    );

    const evidenceRefs = evidence.map(
      (item): OrganizationalLearningEvidenceRef => ({
        evidenceRefId: item.evidenceId,
        kind: item.kind,
        sourceType: item.sourceType,
        sourceRef: item.sourceRef,
        sourceKey: item.sourceKey,
        provenance: item.provenance,
        observedAt: item.observedAt,
        reviewStatus: item.reviewStatus,
        contributorKey: item.contributorKey,
        fabricatedLesson: false,
        unsupportedSimilarityScore: false,
        knowledgeMutationClaimed: false,
      }),
    );

    const knowledgeProvenanceTraces = buildProvenanceTraces(evidenceRefs, this.newId);
    const timelineTraces = input.timelineEvents ?? [];

    let learningItems: OrganizationalLearningItem[] = [];
    let synthesis: OrganizationalLearningSynthesis = emptySynthesis(this.newId);
    let taxonomyClass: LearningTaxonomyClass = "unknown";
    let basisStatus: LearningBasisStatus = "unknown";
    let integratedReason: LearningBasisReason = "unknown";
    let reasonSummary = "Organizational learning basis unavailable.";

    if (abstained) {
      reasons.push("abstained_no_organizational_learning_published");
      limitations.push("abstained_insufficient_basis");
      taxonomyClass = taxonomyFromSufficiency(
        confidence.dataSufficiency,
        confidence.historicalEvidencePresent,
      );
      basisStatus = basisStatusFromSufficiency(
        confidence.dataSufficiency,
        confidence.conflictState === "detected",
      );
      integratedReason = reasonFromSufficiency(confidence.dataSufficiency, evidence.length > 0);
      reasonSummary = buildReasonSummary(taxonomyClass, basisStatus, integratedReason, true);
    } else {
      const derived = deriveLearningItems(
        contributingContributors,
        confidence.dataSufficiency,
        confidence.historicalEvidencePresent,
        evidenceRefs,
        input.lessonRegisterRefs ?? [],
        this.newId,
      );
      learningItems = derived.items;
      taxonomyClass = derived.integratedTaxonomy;
      basisStatus = derived.integratedStatus;
      integratedReason = derived.integratedReason;
      reasonSummary = derived.reasonSummary;

      synthesis = {
        synthesisId: this.newId("pcolsyn"),
        integratedTaxonomyClass: taxonomyClass,
        integratedBasisStatus: basisStatus,
        integratedReason,
        reasonSummary,
        learningItems,
        historicalSimilarityRefs: (input.crossProjectRefs ?? []).map((ref) => ({
          similarityRefId: this.newId("pcolsim"),
          projectRef: ref.projectRef,
          qualitativeReference: ref.qualitativeReference,
          unsupportedSimilarityScore: false,
        })),
        lessonReferences: (input.lessonRegisterRefs ?? []).map((ref) => ({
          lessonRefId: ref.lessonRefId,
          lessonRegisterRef: ref.registerRef,
          summary: ref.summary,
          taxonomyClass: "lesson_learned" as const,
          fabricatedLesson: false,
          recommendationClaimed: false,
        })),
        patternReferences: derived.patternRefs,
        outcomeReferences: [],
        reusablePracticeReferences: [],
        crossProjectKnowledgeRefs: (input.crossProjectRefs ?? []).map((ref) => ({
          crossProjectRefId: this.newId("pcolxpr"),
          projectRef: ref.projectRef,
          knowledgeRef: ref.knowledgeRef,
          qualitativeReference: ref.qualitativeReference,
          currentProjectClaimed: false,
          unsupportedSimilarityScore: false,
        })),
        knowledgeProvenanceTraces,
        timelineTraces,
        governanceRefs: [
          {
            governanceRefId: this.newId("pcolgov"),
            kind: "advisory_only",
            learningApprovalClaimed: false,
            knowledgeMutationClaimed: false,
          },
        ] satisfies OrganizationalLearningGovernanceRef[],
        fabricatedLesson: false,
        unsupportedSimilarityScore: false,
        knowledgeMutationClaimed: false,
        learningApprovalClaimed: false,
        mutatesUpstreamContributors: false,
      };
    }

    const snapshot: OrganizationalLearningSnapshot = {
      snapshotId: this.newId("pcolsnp"),
      integratedTaxonomyClass: taxonomyClass,
      integratedBasisStatus: basisStatus,
      reasonSummary,
      learningItemCount: learningItems.length,
      evidenceRefCount: evidenceRefs.length,
      traceCount: knowledgeProvenanceTraces.length + timelineTraces.length,
      abstained,
      fabricatedLesson: false,
      unsupportedSimilarityScore: false,
    };

    const stateId = this.newId("pcolst");
    const state: OrganizationalLearningAssessmentState = {
      id: stateId,
      stateId,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      controlContext: input.controlContext,
      version: input.version ?? 1,
      status: input.status ?? "assessed",
      assessmentClass: abstained ? "abstained" : "assessed",
      taxonomyClass,
      synthesis,
      snapshot,
      learningItems,
      contributingContributors,
      evidenceRefs,
      historicalSimilarityRefs: synthesis.historicalSimilarityRefs,
      lessonReferences: synthesis.lessonReferences,
      patternReferences: synthesis.patternReferences,
      outcomeReferences: synthesis.outcomeReferences,
      reusablePracticeReferences: synthesis.reusablePracticeReferences,
      crossProjectKnowledgeRefs: synthesis.crossProjectKnowledgeRefs,
      knowledgeProvenanceTraces,
      timelineTraces,
      governanceRefs: synthesis.governanceRefs,
      confidence,
      assumptions: dedupe(assumptions),
      limitations: dedupe(limitations),
      reasons: dedupe(reasons),
      abstained,
      abstentionReason,
      narrative: input.narrative,
      method: "organizational_learning_intelligence_advisory_v1",
      methodVersion: "1",
      assessedAt: asOf,
      recordedAt: asOf,
      createdBy: input.createdBy,
      supersedesId: input.supersedesId,
      workflowInstanceId: input.workflowInstanceId,
      composedContextId: composed.contextId,
      explainabilityContextId: latestExplainability?.stateId,
      assuranceContextId: latestAssurance?.stateId,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
      autoExecutionEnabled: false,
      scheduleExecutionPerformed: false,
      costExecutionPerformed: false,
      contractInstructionPerformed: false,
      learningApprovalClaimed: false,
      knowledgeMutationClaimed: false,
      automaticLearningApprovalClaimed: false,
      automaticKnowledgeMutationClaimed: false,
      resourcePlanningPerformed: false,
      budgetLedgerMutated: false,
      financialPostingPerformed: false,
      predictiveSchedulingPerformed: false,
      advisoryOnly: true,
      mutatesProjectIdentity: false,
      mutatesUpstreamContributors: false,
      autonomousPublication: false,
      duplicateKnowledgeOwnershipDetected: false,
      fabricatedLesson: false,
      unsupportedSimilarityScore: false,
      recommendationClaimed: false,
      predictionClaimed: false,
      optimisationClaimed: false,
    };

    return { state, confidence, composedContext: composed, abstained, abstentionReason };
  }

  assessOrganizationalLearning(
    input: OrganizationalLearningAssessmentInput,
  ): OrganizationalLearningAssessmentResult {
    return this.assess(input);
  }

  keyFor(scope: ProjectScopeRef, organizationalLearningUnitId: string): string {
    return organizationalLearningStateKey(scope, organizationalLearningUnitId);
  }
}

export const OrganizationalLearningIntelligenceEngine = ProjectControlsOrganizationalLearningEngine;

export function createOrganizationalLearningIntelligenceEngine(
  deps: OrganizationalLearningIntelligenceEngineDeps = {},
): ProjectControlsOrganizationalLearningEngine {
  return new ProjectControlsOrganizationalLearningEngine(deps);
}

export function assertNoAutomaticLearningApproval(): {
  ok: true;
  automaticLearningApprovalEnabled: false;
} {
  if (AUTOMATIC_LEARNING_APPROVAL_ENABLED) {
    throw new Error("automatic_learning_approval_forbidden");
  }
  return { ok: true, automaticLearningApprovalEnabled: false };
}

export function assertNoAutomaticKnowledgeMutation(): {
  ok: true;
  automaticKnowledgeMutationEnabled: false;
} {
  if (AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED) {
    throw new Error("automatic_knowledge_mutation_forbidden_in_organizational_learning");
  }
  return { ok: true, automaticKnowledgeMutationEnabled: false };
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
    throw new Error("earned_value_and_cpm_forbidden_in_organizational_learning");
  }
  return { ok: true, earnedValueImplemented: false, cpmSchedulingImplemented: false };
}

export function assertAdvisoryOnly(): { ok: true; advisoryOnly: true } {
  if (!ORGANIZATIONAL_LEARNING_INTELLIGENCE_IS_ADVISORY_ONLY) {
    throw new Error("organizational_learning_intelligence_must_be_advisory_only");
  }
  if (!AI_MAY_PUBLISH_ORGANIZATIONAL_LEARNING_FORBIDDEN) {
    throw new Error("ai_may_not_publish_organizational_learning");
  }
  return { ok: true, advisoryOnly: true };
}

function emptySynthesis(newId: (prefix: string) => string): OrganizationalLearningSynthesis {
  return {
    synthesisId: newId("pcolsyn"),
    integratedTaxonomyClass: "unknown",
    integratedBasisStatus: "unknown",
    integratedReason: "unknown",
    reasonSummary: "Organizational learning basis unavailable.",
    learningItems: [],
    historicalSimilarityRefs: [],
    lessonReferences: [],
    patternReferences: [],
    outcomeReferences: [],
    reusablePracticeReferences: [],
    crossProjectKnowledgeRefs: [],
    knowledgeProvenanceTraces: [],
    timelineTraces: [],
    governanceRefs: [],
    fabricatedLesson: false,
    unsupportedSimilarityScore: false,
    knowledgeMutationClaimed: false,
    learningApprovalClaimed: false,
    mutatesUpstreamContributors: false,
  };
}

function buildEvidence(
  composed: ComposedProjectContext,
  explainability: ExplainabilityAssessmentState | undefined,
  assurance: AssuranceAssessmentState | undefined,
  extra: readonly OrganizationalLearningEvidence[],
  historicalRefs: readonly { sourceRef: string; sourceType?: string; label?: string }[],
  lessonRefs: readonly { lessonRefId: string; registerRef: string; summary: string }[],
  newId: (prefix: string) => string,
): OrganizationalLearningEvidence[] {
  const base = (ref: {
    stateId: string;
    contributorKey: string;
    status: string;
    assessedAt?: string;
    kind: OrganizationalLearningEvidence["kind"];
    sourceType: string;
  }): OrganizationalLearningEvidence => ({
    evidenceId: newId("pcolid"),
    kind: ref.kind,
    sourceType: ref.sourceType,
    sourceRef: ref.stateId,
    sourceKey: ref.contributorKey,
    provenance: ref.status === "published" ? "system_reference" : "unknown",
    reviewStatus: ref.status,
    observedAt: ref.assessedAt,
    contributorKey: ref.contributorKey as OrganizationalLearningEvidence["contributorKey"],
    fabricatedLesson: false,
    unsupportedSimilarityScore: false,
    knowledgeMutationClaimed: false,
    autoExecutionClaimed: false,
    learningApprovalClaimed: false,
    recommendationClaimed: false,
    predictionClaimed: false,
    optimisationClaimed: false,
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
    explainability &&
      base({
        stateId: explainability.stateId,
        contributorKey: "explainability_intelligence",
        status: explainability.status,
        assessedAt: explainability.assessedAt,
        kind: "explainability_assessment_ref",
        sourceType: "explainability_intelligence",
      }),
    assurance &&
      base({
        stateId: assurance.stateId,
        contributorKey: "assurance_intelligence",
        status: assurance.status,
        assessedAt: assurance.assessedAt,
        kind: "assurance_assessment_ref",
        sourceType: "assurance_intelligence",
      }),
  ].filter((item): item is OrganizationalLearningEvidence => Boolean(item));

  const fromHistorical = historicalRefs.map(
    (ref): OrganizationalLearningEvidence => ({
      evidenceId: newId("pcolid"),
      kind: "historical_evidence_ref",
      sourceType: ref.sourceType ?? "historical_evidence",
      sourceRef: ref.sourceRef,
      sourceKey: ref.label ?? ref.sourceRef,
      provenance: "primary_source",
      reviewStatus: "reviewed",
      fabricatedLesson: false,
      unsupportedSimilarityScore: false,
      knowledgeMutationClaimed: false,
      autoExecutionClaimed: false,
      learningApprovalClaimed: false,
      recommendationClaimed: false,
      predictionClaimed: false,
      optimisationClaimed: false,
      earnedValueDerived: false,
      cpmDerived: false,
      financialPostingClaimed: false,
      registerMutationClaimed: false,
      mutatesUpstreamContributors: false,
    }),
  );

  const fromLessons = lessonRefs.map(
    (ref): OrganizationalLearningEvidence => ({
      evidenceId: newId("pcolid"),
      kind: "lesson_register_ref",
      sourceType: "lessons_learned_register",
      sourceRef: ref.registerRef,
      sourceKey: ref.lessonRefId,
      provenance: "human_attestation",
      reviewStatus: "reviewed",
      narrative: ref.summary,
      fabricatedLesson: false,
      unsupportedSimilarityScore: false,
      knowledgeMutationClaimed: false,
      autoExecutionClaimed: false,
      learningApprovalClaimed: false,
      recommendationClaimed: false,
      predictionClaimed: false,
      optimisationClaimed: false,
      earnedValueDerived: false,
      cpmDerived: false,
      financialPostingClaimed: false,
      registerMutationClaimed: false,
      mutatesUpstreamContributors: false,
    }),
  );

  return [...fromComposition, ...extended, ...fromHistorical, ...fromLessons, ...extra.map(normaliseEvidence)];
}

function normaliseEvidence(evidence: OrganizationalLearningEvidence): OrganizationalLearningEvidence {
  if (
    evidence.fabricatedLesson !== false ||
    evidence.unsupportedSimilarityScore !== false ||
    evidence.knowledgeMutationClaimed !== false ||
    evidence.mutatesUpstreamContributors !== false
  ) {
    throw new Error("organizational_learning_evidence_may_not_claim_forbidden_capabilities");
  }
  return evidence;
}

function buildContributorRefs(
  composed: ComposedProjectContext,
  explainability?: ExplainabilityAssessmentState,
  assurance?: AssuranceAssessmentState,
): OrganizationalLearningContributorRef[] {
  return [
    ...composed.contributorRefs.map((ref) => ({
      contributorKey: ref.contributorKey as OrganizationalLearningContributorRef["contributorKey"],
      stateId: ref.stateId,
      status: ref.status,
      abstained: ref.abstained,
      indication: ref.postureOrIndication,
      assessedAt: ref.assessedAt,
      published: ref.status === "published",
    })),
    ...(explainability
      ? [
          {
            contributorKey: "explainability_intelligence" as const,
            stateId: explainability.stateId,
            status: explainability.status,
            abstained: explainability.abstained,
            indication: explainability.explanationStatus,
            assessedAt: explainability.assessedAt,
            published: true,
          },
        ]
      : []),
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
  ];
}

function buildProvenanceTraces(
  evidenceRefs: readonly OrganizationalLearningEvidenceRef[],
  newId: (prefix: string) => string,
): KnowledgeProvenanceTrace[] {
  return evidenceRefs.map((ref) => ({
    traceId: newId("pcolprv"),
    sourceRef: ref.sourceRef,
    sourceType: ref.sourceType,
    provenance: ref.provenance,
    complete: ref.provenance !== "unknown" && Boolean(ref.observedAt),
    missingFields: ref.provenance === "unknown" ? ["provenance"] : [],
  }));
}

function deriveLearningItems(
  contributors: readonly OrganizationalLearningContributorRef[],
  sufficiency: OrganizationalLearningAssessmentState["confidence"]["dataSufficiency"],
  hasHistoricalEvidence: boolean,
  evidenceRefs: readonly OrganizationalLearningEvidenceRef[],
  lessonRefs: readonly { lessonRefId: string; registerRef: string; summary: string }[],
  newId: (prefix: string) => string,
): {
  items: OrganizationalLearningItem[];
  integratedTaxonomy: LearningTaxonomyClass;
  integratedStatus: LearningBasisStatus;
  integratedReason: LearningBasisReason;
  reasonSummary: string;
  patternRefs: OrganizationalLearningSynthesis["patternReferences"];
} {
  const items: OrganizationalLearningItem[] = [];
  const patternRefs: OrganizationalLearningSynthesis["patternReferences"] = [];

  for (const ref of contributors) {
    let taxonomyClass: LearningTaxonomyClass = "historical_pattern";
    let basisStatus: LearningBasisStatus = "supported";
    let reason: LearningBasisReason = "evidence_based";
    const contributorEvidence = evidenceRefs.filter((e) => e.contributorKey === ref.contributorKey);

    if (!hasHistoricalEvidence) {
      taxonomyClass = "unknown";
      basisStatus = "unknown";
      reason = "unknown";
    } else if (!ref.published) {
      taxonomyClass = "knowledge_gap";
      basisStatus = "incomplete";
      reason = "insufficient_evidence";
    } else if (ref.abstained) {
      taxonomyClass = "unknown";
      basisStatus = "unknown";
      reason = "unknown";
    } else if (contributorEvidence.length === 0) {
      taxonomyClass = "knowledge_gap";
      basisStatus = "unsupported";
      reason = "insufficient_evidence";
    }

    items.push({
      learningItemId: newId("pcolitem"),
      taxonomyClass,
      basisStatus,
      reason,
      reasonSummary: buildReasonSummary(taxonomyClass, basisStatus, reason, false, ref.contributorKey),
      evidenceRefIds: contributorEvidence.map((e) => e.evidenceRefId),
      lessonRefIds: lessonRefs.map((l) => l.lessonRefId),
      patternRefIds: [],
      missingEvidenceNotes: contributorEvidence.length === 0 ? [`${ref.contributorKey}:missing_evidence_refs`] : [],
      unknownNotes: !hasHistoricalEvidence ? ["no_historical_evidence"] : [],
      fabricatedLesson: false,
      unsupportedSimilarityScore: false,
      recommendationClaimed: false,
      predictionClaimed: false,
      optimisationClaimed: false,
    });

    if (taxonomyClass === "historical_pattern" && hasHistoricalEvidence) {
      patternRefs.push({
        patternRefId: newId("pcolpat"),
        patternSummary: `Reference pattern from ${ref.contributorKey} (qualitative only)`,
        taxonomyClass: "historical_pattern",
        predictionClaimed: false,
      });
    }
  }

  const integratedTaxonomy = taxonomyFromSufficiency(sufficiency, hasHistoricalEvidence);
  const integratedStatus = basisStatusFromSufficiency(sufficiency, false);
  const integratedReason = reasonFromSufficiency(sufficiency, evidenceRefs.length > 0);
  const reasonSummary = buildReasonSummary(integratedTaxonomy, integratedStatus, integratedReason, false);

  return { items, integratedTaxonomy, integratedStatus, integratedReason, reasonSummary, patternRefs };
}

function buildReasonSummary(
  taxonomy: LearningTaxonomyClass,
  status: LearningBasisStatus,
  reason: LearningBasisReason,
  abstained: boolean,
  contributorKey?: string,
): string {
  const subject = contributorKey ? `Contributor ${contributorKey}` : "Integrated organizational learning";
  if (abstained) {
    return `${subject}: learning unavailable due to insufficient historical evidence (reference only; not recommendation).`;
  }
  return `${subject}: ${taxonomy.replace(/_/g, " ")} with ${status.replace(/_/g, " ")} / ${reason.replace(/_/g, " ")} basis (reference only; not recommendation).`;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
