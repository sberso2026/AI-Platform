/**
 * Phase 11E — Project Controls domain events.
 *
 * Identifiers only — no evidence payloads. Governance flags prevent mistaking
 * advisory schedule/progress/change intelligence for CPM, earned value or a
 * contractual change approval.
 */

import type {
  ProgressAssessmentState,
  ProjectProfile,
  ProjectScopeRef,
} from "./progress";
import type { ScheduleAssessmentState } from "./schedule";
import type {
  ChangeCandidate,
  ChangeIntelligenceState,
  ProjectSnapshot,
} from "./change";
import type {
  CostIntelligenceState,
} from "./cost";
import type { ProductivityAssessmentState } from "./productivity";
import type { ForecastAssessmentState } from "./forecast";
import type { DecisionAssessmentState } from "./decision";
import type { ScenarioAssessmentState } from "./scenario";
import type { RiskOpportunityAssessmentState } from "./risk-opportunity";
import type { AssuranceAssessmentState } from "./assurance";
import type { ExplainabilityAssessmentState } from "./explainability";
import type { OrganizationalLearningAssessmentState } from "./organizational-learning";

export const PROJECT_CONTROLS_EVENTS = [
  "engineering.project.progress.updated",
  "engineering.project.progress.reviewed",
  "engineering.project.progress.published",
  "engineering.project.schedule.updated",
  "engineering.project.schedule.reviewed",
  "engineering.project.schedule.published",
  "engineering.project.profile.updated",
  "engineering.project.change.assessed",
  "engineering.project.change.reviewed",
  "engineering.project.change.published",
  "engineering.project.change.superseded",
  "engineering.project.change_candidate.created",
  "engineering.project.cost.assessed",
  "engineering.project.cost.reviewed",
  "engineering.project.cost.published",
  "engineering.project.cost.superseded",
  "engineering.project.cost.variance_attributed",
  "engineering.project.productivity.updated",
  "engineering.project.productivity.reviewed",
  "engineering.project.productivity.published",
  "engineering.project.forecast.updated",
  "engineering.project.forecast.reviewed",
  "engineering.project.forecast.published",
  "engineering.project.decision.updated",
  "engineering.project.decision.reviewed",
  "engineering.project.decision.published",
  "engineering.project.scenario.updated",
  "engineering.project.scenario.reviewed",
  "engineering.project.scenario.published",
  "engineering.project.risk_opportunity.updated",
  "engineering.project.risk_opportunity.reviewed",
  "engineering.project.risk_opportunity.published",
  "engineering.project.assurance.updated",
  "engineering.project.assurance.reviewed",
  "engineering.project.assurance.published",
  "engineering.project.explainability.updated",
  "engineering.project.explainability.reviewed",
  "engineering.project.explainability.published",
  "engineering.project.organizational_learning.updated",
  "engineering.project.organizational_learning.reviewed",
  "engineering.project.organizational_learning.published",
  "engineering.project.snapshot.created",
] as const;

export type ProjectControlsEventType = (typeof PROJECT_CONTROLS_EVENTS)[number];

export const PROJECT_CONTROLS_CHANGE_EVENTS = [
  "engineering.project.change.assessed",
  "engineering.project.change.reviewed",
  "engineering.project.change.published",
  "engineering.project.change.superseded",
  "engineering.project.change_candidate.created",
  "engineering.project.snapshot.created",
] as const;

export const PROJECT_CONTROLS_COST_EVENTS = [
  "engineering.project.cost.assessed",
  "engineering.project.cost.reviewed",
  "engineering.project.cost.published",
  "engineering.project.cost.superseded",
  "engineering.project.cost.variance_attributed",
] as const;

export const PROJECT_CONTROLS_PRODUCTIVITY_EVENTS = [
  "engineering.project.productivity.updated",
  "engineering.project.productivity.reviewed",
  "engineering.project.productivity.published",
] as const;

export const PROJECT_CONTROLS_FORECAST_EVENTS = [
  "engineering.project.forecast.updated",
  "engineering.project.forecast.reviewed",
  "engineering.project.forecast.published",
] as const;

export const PROJECT_CONTROLS_DECISION_EVENTS = [
  "engineering.project.decision.updated",
  "engineering.project.decision.reviewed",
  "engineering.project.decision.published",
] as const;

export const PROJECT_CONTROLS_RISK_OPPORTUNITY_EVENTS = [
  "engineering.project.risk_opportunity.updated",
  "engineering.project.risk_opportunity.reviewed",
  "engineering.project.risk_opportunity.published",
] as const;

export const PROJECT_CONTROLS_ASSURANCE_EVENTS = [
  "engineering.project.assurance.updated",
  "engineering.project.assurance.reviewed",
  "engineering.project.assurance.published",
] as const;

export const PROJECT_CONTROLS_EXPLAINABILITY_EVENTS = [
  "engineering.project.explainability.updated",
  "engineering.project.explainability.reviewed",
  "engineering.project.explainability.published",
] as const;

export const PROJECT_CONTROLS_SCENARIO_EVENTS = [
  "engineering.project.scenario.updated",
  "engineering.project.scenario.reviewed",
  "engineering.project.scenario.published",
] as const;

export type ProjectControlsEventGovernance = {
  advisoryOnly: true;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  costIntegrated: false;
  financialPostingPerformed: false;
  contractualApprovalClaimed: false;
  forecastProduced: false;
  mutatesProjectIdentity: false;
  autonomousPublication: false;
};

export const PROJECT_CONTROLS_EVENT_GOVERNANCE: ProjectControlsEventGovernance = {
  advisoryOnly: true,
  earnedValueComputed: false,
  criticalPathComputed: false,
  floatComputed: false,
  costIntegrated: false,
  financialPostingPerformed: false,
  contractualApprovalClaimed: false,
  forecastProduced: false,
  mutatesProjectIdentity: false,
  autonomousPublication: false,
};

export type ProjectControlsEvent = {
  eventId: string;
  eventType: ProjectControlsEventType;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope?: ProjectScopeRef;
  stateId?: string;
  occurredAt: string;
  correlationId?: string;
  payload: Record<string, unknown>;
  governance: ProjectControlsEventGovernance;
};

export function createProjectControlsEvent(input: {
  eventId: string;
  eventType: ProjectControlsEventType;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope?: ProjectScopeRef;
  stateId?: string;
  occurredAt?: string;
  correlationId?: string;
  payload?: Record<string, unknown>;
}): ProjectControlsEvent {
  return {
    eventId: input.eventId,
    eventType: input.eventType,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    scope: input.scope,
    stateId: input.stateId,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    correlationId: input.correlationId,
    payload: input.payload ?? {},
    governance: PROJECT_CONTROLS_EVENT_GOVERNANCE,
  };
}

/** Identifiers only — no evidence bodies, indications or confidential fields. */
export function progressEventPayload(state: ProgressAssessmentState): Record<string, unknown> {
  return {
    assessmentStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    scopeKind: state.scope.kind,
    scopeReferenceId: state.scope.referenceId,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
  };
}

/** Identifiers only — no evidence payloads, dates or postures. */
export function scheduleEventPayload(state: ScheduleAssessmentState): Record<string, unknown> {
  return {
    assessmentStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    scopeKind: state.scope.kind,
    scopeReferenceId: state.scope.referenceId,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
  };
}

/** Identifiers only — no evidence payloads or progress/schedule values. */
export function profileEventPayload(profile: ProjectProfile): Record<string, unknown> {
  return {
    profileId: profile.profileId,
    version: profile.version,
    profileClass: profile.profileClass,
    scopesAssessed: profile.progress.scopesAssessed,
    scopesAbstained: profile.progress.scopesAbstained,
    publishedScopes: profile.progress.publishedScopes,
    scheduleScopesAssessed: profile.schedule?.scopesAssessed ?? 0,
    scheduleScopesAbstained: profile.schedule?.scopesAbstained ?? 0,
    changesAssessed: profile.change?.changesAssessed ?? 0,
    changesAbstained: profile.change?.changesAbstained ?? 0,
    costsAssessed: profile.cost?.costsAssessed ?? 0,
    costsAbstained: profile.cost?.costsAbstained ?? 0,
    productivityAssessed: profile.productivity?.productivityAssessed ?? 0,
    productivityAbstained: profile.productivity?.productivityAbstained ?? 0,
    forecastsAssessed: profile.forecast?.forecastsAssessed ?? 0,
    forecastsAbstained: profile.forecast?.forecastsAbstained ?? 0,
    decisionsAssessed: profile.decisionSupport?.decisionsAssessed ?? 0,
    decisionsAbstained: profile.decisionSupport?.decisionsAbstained ?? 0,
    scenariosAssessed: profile.scenarioIntelligence?.scenariosAssessed ?? 0,
    scenariosAbstained: profile.scenarioIntelligence?.scenariosAbstained ?? 0,
    riskOpportunityAssessmentsCompleted: profile.riskOpportunityIntelligence?.assessmentsCompleted ?? 0,
    riskOpportunityAssessmentsAbstained: profile.riskOpportunityIntelligence?.assessmentsAbstained ?? 0,
    abstained: profile.abstained,
    activeContributorKeys: profile.activeContributorKeys,
    reservedContributorKeys: profile.reservedContributorKeys,
  };
}

/**
 * Identifiers only — no evidence payloads, no narratives, no impact detail and
 * never a monetary quantum.
 */
export function changeEventPayload(state: ChangeIntelligenceState): Record<string, unknown> {
  return {
    changeStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    changeClass: state.changeClass,
    changeStatusContext: state.changeStatusContext,
    scopeKind: state.scope.kind,
    scopeReferenceId: state.scope.referenceId,
    candidateId: state.candidateId,
    authoritativeChangeRefId: state.authoritativeChangeRef?.referenceId,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    contractualApprovalClaimed: false,
    contractualAuthorityClaimed: false,
  };
}

/** Identifiers only — no monetary amounts or ledger balances. */
export function costEventPayload(state: CostIntelligenceState): Record<string, unknown> {
  return {
    costStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    costPosture: state.costPosture,
    varianceAttribution: state.varianceAttribution,
    scopeKind: state.controlContext.scope.kind,
    scopeReferenceId: state.controlContext.scope.referenceId,
    accountId: state.controlContext.accountRef.accountId,
    currencyCode: state.controlContext.currencyCode,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    changeIntelligenceRefCount: state.changeIntelligenceRefs.length,
    financialPostingClaimed: false,
  };
}

/** Identifiers only. A candidate event never asserts an approved change. */
export function changeCandidateEventPayload(
  candidate: ChangeCandidate,
): Record<string, unknown> {
  return {
    candidateId: candidate.candidateId,
    status: candidate.status,
    changeClass: candidate.changeClass,
    scopeKind: candidate.scope.kind,
    scopeReferenceId: candidate.scope.referenceId,
    signalRefCount: candidate.signalRefs.length,
    isApprovedChange: false,
    contractualApprovalClaimed: false,
  };
}

/** Identifiers only — no labour % or workforce metrics. */
export function productivityEventPayload(
  state: ProductivityAssessmentState,
): Record<string, unknown> {
  return {
    productivityStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    productivityPosture: state.productivityPosture,
    scopeKind: state.controlContext.scope.kind,
    scopeReferenceId: state.controlContext.scope.referenceId,
    controlUnitId: state.controlContext.controlUnitId,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    factorCount: state.factors.length,
    labourProductivityPercentClaimed: false,
    workforceManagementClaimed: false,
  };
}

/** Identifiers only — no completion dates or cost forecasts. */
export function forecastEventPayload(state: ForecastAssessmentState): Record<string, unknown> {
  return {
    forecastStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    forecastPosture: state.forecastPosture,
    scopeKind: state.controlContext.scope.kind,
    scopeReferenceId: state.controlContext.scope.referenceId,
    trajectoryUnitId: state.controlContext.trajectoryUnitId,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    contributorCount: state.contributingContributors.length,
    composedContextId: state.composedContextId,
    completionDateClaimed: false,
    costForecastClaimed: false,
    mutatesUpstreamContributors: false,
  };
}

/** Identifiers only — no execution or approval authority claims. */
export function decisionEventPayload(state: DecisionAssessmentState): Record<string, unknown> {
  return {
    decisionStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    dominantDecisionClass: state.dominantDecisionClass,
    scopeKind: state.controlContext.scope.kind,
    scopeReferenceId: state.controlContext.scope.referenceId,
    decisionUnitId: state.controlContext.decisionUnitId,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    optionCount: state.options.length,
    recommendationCount: state.recommendations.length,
    contributorCount: state.contributingContributors.length,
    composedContextId: state.composedContextId,
    forecastContextId: state.forecastContextId,
    autoExecutionClaimed: false,
    approvalAuthorityClaimed: false,
    mutatesUpstreamContributors: false,
  };
}

/** Identifiers only — no register mutation or owner assignment claims. */
export function riskOpportunityEventPayload(
  state: import("./risk-opportunity").RiskOpportunityAssessmentState,
): Record<string, unknown> {
  return {
    riskOpportunityStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    scopeKind: state.controlContext.scope.kind,
    scopeReferenceId: state.controlContext.scope.referenceId,
    riskOpportunityUnitId: state.controlContext.riskOpportunityUnitId,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    riskSignalCount: state.riskSignals.length,
    opportunitySignalCount: state.opportunitySignals.length,
    contributorCount: state.contributingContributors.length,
    composedContextId: state.composedContextId,
    forecastContextId: state.forecastContextId,
    decisionContextId: state.decisionContextId,
    scenarioContextId: state.scenarioContextId,
    autoExecutionClaimed: false,
    approvalAuthorityClaimed: false,
    riskRegisterMutated: false,
    opportunityRegisterMutated: false,
    ownerAssignmentPerformed: false,
    treatmentExecutionPerformed: false,
    duplicateRiskOwnershipDetected: false,
    mutatesUpstreamContributors: false,
  };
}

/** Identifiers only — no certification, verification, or approval claims. */
export function assuranceEventPayload(
  state: AssuranceAssessmentState,
): Record<string, unknown> {
  return {
    assuranceStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    scopeKind: state.controlContext.scope.kind,
    scopeReferenceId: state.controlContext.scope.referenceId,
    assuranceUnitId: state.controlContext.assuranceUnitId,
    assurancePosture: state.assurancePosture,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    findingCount: state.contributorFindings.length,
    contributorCount: state.contributingContributors.length,
    composedContextId: state.composedContextId,
    forecastContextId: state.forecastContextId,
    decisionContextId: state.decisionContextId,
    scenarioContextId: state.scenarioContextId,
    riskOpportunityContextId: state.riskOpportunityContextId,
    autoExecutionClaimed: false,
    approvalAuthorityClaimed: false,
    certificationClaimed: false,
    verificationClaimed: false,
    evidenceApprovalClaimed: false,
    duplicateAssuranceOwnershipDetected: false,
    mutatesUpstreamContributors: false,
  };
}

/** Identifiers only — no chain-of-thought or hidden reasoning disclosure. */
export function explainabilityEventPayload(
  state: ExplainabilityAssessmentState,
): Record<string, unknown> {
  return {
    explainabilityStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    scopeKind: state.controlContext.scope.kind,
    scopeReferenceId: state.controlContext.scope.referenceId,
    explainabilityUnitId: state.controlContext.explainabilityUnitId,
    explanationStatus: state.explanationStatus,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    explanationCount: state.contributorExplanations.length,
    contributorCount: state.contributingContributors.length,
    traceCount:
      state.dependencyTraces.length +
      state.provenanceTraces.length +
      state.timelineTraces.length,
    composedContextId: state.composedContextId,
    assuranceContextId: state.assuranceContextId,
    autoExecutionClaimed: false,
    approvalAuthorityClaimed: false,
    verificationClaimed: false,
    automaticEvidenceCreationClaimed: false,
    chainOfThoughtExposed: false,
    hiddenReasoningExposed: false,
    fabricatedProvenance: false,
    duplicateExplainabilityOwnershipDetected: false,
    mutatesUpstreamContributors: false,
  };
}

/** Identifiers only — no preferred selection or optimisation claims. */
export function scenarioEventPayload(state: ScenarioAssessmentState): Record<string, unknown> {
  return {
    scenarioStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    scopeKind: state.controlContext.scope.kind,
    scopeReferenceId: state.controlContext.scope.referenceId,
    scenarioUnitId: state.controlContext.scenarioUnitId,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    scenarioOptionCount: state.scenarioOptions.length,
    contributorCount: state.contributingContributors.length,
    composedContextId: state.composedContextId,
    forecastContextId: state.forecastContextId,
    decisionContextId: state.decisionContextId,
    autoExecutionClaimed: false,
    approvalAuthorityClaimed: false,
    preferredScenarioSelected: false,
    optimisationPerformed: false,
    mutatesUpstreamContributors: false,
  };
}

/** Identifiers and counts only — a snapshot event carries no state content. */
export function snapshotEventPayload(snapshot: ProjectSnapshot): Record<string, unknown> {
  return {
    snapshotId: snapshot.snapshotId,
    schemaVersion: snapshot.schemaVersion,
    profileId: snapshot.profileId,
    progressStateCount: snapshot.progressStateIds.length,
    scheduleStateCount: snapshot.scheduleStateIds.length,
    changeStateCount: snapshot.changeStateIds.length,
    costStateCount: snapshot.costStateIds.length,
    productivityStateCount: snapshot.productivityStateIds.length,
    forecastStateCount: snapshot.forecastStateIds.length,
    decisionStateCount: snapshot.decisionStateIds.length,
    scenarioStateCount: snapshot.scenarioStateIds.length,
    riskOpportunityStateCount: snapshot.riskOpportunityStateIds.length,
    capturedAt: snapshot.capturedAt,
    immutable: true,
    containsEvidencePayloads: false,
  };
}

export type ProjectControlsEventPublishPort = {
  publish(event: ProjectControlsEvent): Promise<void>;
  published(): readonly ProjectControlsEvent[];
};

export function createInProcessProjectControlsEventPipeline(): ProjectControlsEventPublishPort {
  const log: ProjectControlsEvent[] = [];
  return {
    async publish(event) {
      log.push(event);
    },
    published() {
      return log;
    },
  };
}

/** Identifiers only — no fabricated lessons, unsupported similarity scores, or knowledge mutation claims. */
export function organizationalLearningEventPayload(
  state: OrganizationalLearningAssessmentState,
): Record<string, unknown> {
  return {
    organizationalLearningStateId: state.stateId,
    version: state.version,
    status: state.status,
    assessmentClass: state.assessmentClass,
    projectId: state.projectId,
    organizationalLearningUnitId: state.controlContext.organizationalLearningUnitId,
    taxonomyClass: state.taxonomyClass,
    abstained: state.abstained,
    evidenceRefCount: state.evidenceRefs.length,
    advisoryOnly: true,
    fabricatedLesson: false,
    unsupportedSimilarityScore: false,
    knowledgeMutationClaimed: false,
    mutatesUpstreamContributors: false,
  };
}
