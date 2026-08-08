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
