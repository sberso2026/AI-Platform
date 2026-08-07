/**
 * Phase 11C — Project Controls service facades.
 *
 * Thin wrappers over the engine so HTTP handlers and future UI code depend on
 * an intent-shaped API rather than the orchestration surface.
 */

import type {
  AssessProgressCommand,
  AssessProgressResult,
  AssessScheduleCommand,
  AssessScheduleResult,
  ComposeProjectProfileCommand,
  ComposeProjectProfileResult,
  ProjectControlsEngine,
  ReviewProgressCommand,
  ReviewProgressResult,
  ReviewScheduleCommand,
  ReviewScheduleResult,
} from "./engine";
import type { ProgressAssessmentState, ProjectProfile, ProjectScopeRef } from "./progress";
import type { ScheduleAssessmentState } from "./schedule";
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
  readonly context: ProjectContextService;

  constructor(private readonly engine: ProjectControlsEngine) {
    this.progress = new ProgressIntelligenceService(engine);
    this.schedule = new ScheduleIntelligenceService(engine);
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

  composeProjectProfile(
    command: ComposeProjectProfileCommand,
  ): Promise<ComposeProjectProfileResult> {
    return this.engine.composeProjectProfile(command);
  }
}
