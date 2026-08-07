/**
 * Phase 11C — Project Controls domain events.
 *
 * Identifiers only — no evidence payloads. Governance flags prevent mistaking
 * advisory schedule/progress intelligence for CPM or earned value.
 */

import type {
  ProgressAssessmentState,
  ProjectProfile,
  ProjectScopeRef,
} from "./progress";
import type { ScheduleAssessmentState } from "./schedule";

export const PROJECT_CONTROLS_EVENTS = [
  "engineering.project.progress.updated",
  "engineering.project.progress.reviewed",
  "engineering.project.progress.published",
  "engineering.project.schedule.updated",
  "engineering.project.schedule.reviewed",
  "engineering.project.schedule.published",
  "engineering.project.profile.updated",
] as const;

export type ProjectControlsEventType = (typeof PROJECT_CONTROLS_EVENTS)[number];

export type ProjectControlsEventGovernance = {
  advisoryOnly: true;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
  costIntegrated: false;
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
    abstained: profile.abstained,
    activeContributorKeys: profile.activeContributorKeys,
    reservedContributorKeys: profile.reservedContributorKeys,
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
