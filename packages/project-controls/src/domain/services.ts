/**
 * Phase 11B — Project Controls service facades.
 *
 * Thin wrappers over the engine so HTTP handlers and future UI code depend on
 * an intent-shaped API rather than the orchestration surface.
 */

import type {
  AssessProgressCommand,
  AssessProgressResult,
  ComposeProjectProfileCommand,
  ComposeProjectProfileResult,
  ProjectControlsEngine,
  ReviewProgressCommand,
  ReviewProgressResult,
} from "./engine";
import type { ProgressAssessmentState, ProjectProfile, ProjectScopeRef } from "./progress";
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
  readonly context: ProjectContextService;

  constructor(private readonly engine: ProjectControlsEngine) {
    this.progress = new ProgressIntelligenceService(engine);
    this.context = new ProjectContextService(engine);
  }

  assessProgress(command: AssessProgressCommand): Promise<AssessProgressResult> {
    return this.engine.assessProgress(command);
  }

  reviewProgress(command: ReviewProgressCommand): Promise<ReviewProgressResult> {
    return this.engine.reviewProgress(command);
  }

  composeProjectProfile(
    command: ComposeProjectProfileCommand,
  ): Promise<ComposeProjectProfileResult> {
    return this.engine.composeProjectProfile(command);
  }
}
