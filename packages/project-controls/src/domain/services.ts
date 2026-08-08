/**
 * Phase 11D — Project Controls service facades.
 *
 * Thin wrappers over the engine so HTTP handlers and future UI code depend on
 * an intent-shaped API rather than the orchestration surface.
 */

import type {
  AssessChangeCommand,
  AssessChangeResult,
  AssessProgressCommand,
  AssessProgressResult,
  AssessScheduleCommand,
  AssessScheduleResult,
  ComposeProjectProfileCommand,
  ComposeProjectProfileResult,
  CreateChangeCandidateCommand,
  CreateChangeCandidateResult,
  CreateProjectSnapshotCommand,
  CreateProjectSnapshotResult,
  ProjectControlsEngine,
  ReviewChangeCommand,
  ReviewChangeResult,
  ReviewProgressCommand,
  ReviewProgressResult,
  ReviewScheduleCommand,
  ReviewScheduleResult,
} from "./engine";
import type { ProgressAssessmentState, ProjectProfile, ProjectScopeRef } from "./progress";
import type { ScheduleAssessmentState } from "./schedule";
import type {
  ChangeCandidate,
  ChangeClassification,
  ChangeIntelligenceState,
  ProjectSnapshot,
  ProjectTimelineEvent,
} from "./change";
import type { ProjectControlsRole } from "./role-matrix";

export class ProgressIntelligenceService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  assess(command: AssessProgressCommand): Promise<AssessProgressResult> {
    return this.engine.assessProgress(command);
  }

  review(command: ReviewProgressCommand): Promise<ReviewProgressResult> {
    return this.engine.reviewProgress(command);
  }

  latest(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ProgressAssessmentState | undefined> {
    return this.engine.getLatestProgress(input);
  }
}

export class ScheduleIntelligenceService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  assess(command: AssessScheduleCommand): Promise<AssessScheduleResult> {
    return this.engine.assessSchedule(command);
  }

  review(command: ReviewScheduleCommand): Promise<ReviewScheduleResult> {
    return this.engine.reviewSchedule(command);
  }

  latest(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ScheduleAssessmentState | undefined> {
    return this.engine.getLatestSchedule(input);
  }
}

/**
 * Advisory change intelligence. Nothing on this service approves, prices or
 * executes a contractual change.
 */
export class ChangeIntelligenceService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  createCandidate(
    command: CreateChangeCandidateCommand,
  ): Promise<CreateChangeCandidateResult> {
    return this.engine.createChangeCandidate(command);
  }

  assess(command: AssessChangeCommand): Promise<AssessChangeResult> {
    return this.engine.assessChange(command);
  }

  review(command: ReviewChangeCommand): Promise<ReviewChangeResult> {
    return this.engine.reviewChange(command);
  }

  latest(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    changeClass: ChangeClassification;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ChangeIntelligenceState | undefined> {
    return this.engine.getLatestChange(input);
  }

  history(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ChangeIntelligenceState[]> {
    return this.engine.listChangeHistory(input);
  }

  candidates(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ChangeCandidate[]> {
    return this.engine.listChangeCandidates(input);
  }
}

export class ProjectSnapshotService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  create(command: CreateProjectSnapshotCommand): Promise<CreateProjectSnapshotResult> {
    return this.engine.createProjectSnapshot(command);
  }

  list(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ProjectSnapshot[]> {
    return this.engine.listProjectSnapshots(input);
  }

  timeline(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ProjectTimelineEvent[]> {
    return this.engine.listProjectTimeline(input);
  }
}

export class ProjectContextService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  compose(command: ComposeProjectProfileCommand): Promise<ComposeProjectProfileResult> {
    return this.engine.composeProjectProfile(command);
  }

  latest(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ProjectProfile | undefined> {
    return this.engine.getLatestProjectProfile(input);
  }
}

export class ProjectControlsService {
  readonly progress: ProgressIntelligenceService;
  readonly schedule: ScheduleIntelligenceService;
  readonly change: ChangeIntelligenceService;
  readonly snapshot: ProjectSnapshotService;
  readonly context: ProjectContextService;

  constructor(private readonly engine: ProjectControlsEngine) {
    this.progress = new ProgressIntelligenceService(engine);
    this.schedule = new ScheduleIntelligenceService(engine);
    this.change = new ChangeIntelligenceService(engine);
    this.snapshot = new ProjectSnapshotService(engine);
    this.context = new ProjectContextService(engine);
  }

  assessProgress(command: AssessProgressCommand): Promise<AssessProgressResult> {
    return this.engine.assessProgress(command);
  }

  reviewProgress(command: ReviewProgressCommand): Promise<ReviewProgressResult> {
    return this.engine.reviewProgress(command);
  }

  assessSchedule(command: AssessScheduleCommand): Promise<AssessScheduleResult> {
    return this.engine.assessSchedule(command);
  }

  reviewSchedule(command: ReviewScheduleCommand): Promise<ReviewScheduleResult> {
    return this.engine.reviewSchedule(command);
  }

  createChangeCandidate(
    command: CreateChangeCandidateCommand,
  ): Promise<CreateChangeCandidateResult> {
    return this.engine.createChangeCandidate(command);
  }

  assessChange(command: AssessChangeCommand): Promise<AssessChangeResult> {
    return this.engine.assessChange(command);
  }

  reviewChange(command: ReviewChangeCommand): Promise<ReviewChangeResult> {
    return this.engine.reviewChange(command);
  }

  createProjectSnapshot(
    command: CreateProjectSnapshotCommand,
  ): Promise<CreateProjectSnapshotResult> {
    return this.engine.createProjectSnapshot(command);
  }

  composeProjectProfile(
    command: ComposeProjectProfileCommand,
  ): Promise<ComposeProjectProfileResult> {
    return this.engine.composeProjectProfile(command);
  }
}
