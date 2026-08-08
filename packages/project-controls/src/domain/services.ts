/**
 * Phase 11E — Project Controls service facades.
 *
 * Thin wrappers over the engine so HTTP handlers and future UI code depend on
 * an intent-shaped API rather than the orchestration surface.
 */

import type {
  AssessChangeCommand,
  AssessChangeResult,
  AssessCostCommand,
  AssessCostResult,
  AssessProductivityCommand,
  AssessProductivityResult,
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
  ReviewCostCommand,
  ReviewCostResult,
  ReviewProductivityCommand,
  ReviewProductivityResult,
  ReviewProgressCommand,
  ReviewProgressResult,
  ReviewScheduleCommand,
  ReviewScheduleResult,
} from "./engine";
import type {
  AssessForecastCommand,
  AssessForecastResult,
  ReviewForecastCommand,
  ReviewForecastResult,
} from "./engine-forecast";
import type {
  AssessDecisionCommand,
  AssessDecisionResult,
  ReviewDecisionCommand,
  ReviewDecisionResult,
} from "./engine-decision";
import type { ProgressAssessmentState, ProjectProfile, ProjectScopeRef } from "./progress";
import type { ScheduleAssessmentState } from "./schedule";
import type {
  ChangeCandidate,
  ChangeClassification,
  ChangeIntelligenceState,
  ProjectSnapshot,
  ProjectTimelineEvent,
} from "./change";
import type { CostIntelligenceState } from "./cost";
import type { ProductivityAssessmentState } from "./productivity";
import type { ForecastAssessmentState } from "./forecast";
import type { DecisionAssessmentState } from "./decision";
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

/**
 * Advisory cost intelligence. Nothing on this service posts to a ledger or
 * mutates a budget.
 */
export class CostIntelligenceService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  assess(command: AssessCostCommand): Promise<AssessCostResult> {
    return this.engine.assessCost(command);
  }

  review(command: ReviewCostCommand): Promise<ReviewCostResult> {
    return this.engine.reviewCost(command);
  }

  latest(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    accountId: string;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<CostIntelligenceState | undefined> {
    return this.engine.getLatestCost(input);
  }

  history(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<CostIntelligenceState[]> {
    return this.engine.listCostHistory(input);
  }
}

/**
 * Advisory productivity intelligence. Nothing on this service manages workforce,
 * payroll, timesheets or labour productivity %.
 */
export class ProductivityIntelligenceService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  assess(command: AssessProductivityCommand): Promise<AssessProductivityResult> {
    return this.engine.assessProductivity(command);
  }

  review(command: ReviewProductivityCommand): Promise<ReviewProductivityResult> {
    return this.engine.reviewProductivity(command);
  }

  latest(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    controlUnitId: string;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ProductivityAssessmentState | undefined> {
    return this.engine.getLatestProductivity(input);
  }

  history(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ProductivityAssessmentState[]> {
    return this.engine.listProductivityHistory(input);
  }
}

/**
 * Advisory forecast intelligence from composed contributors only.
 */
export class ForecastIntelligenceService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  assess(command: AssessForecastCommand): Promise<AssessForecastResult> {
    return this.engine.assessForecast(command);
  }

  review(command: ReviewForecastCommand): Promise<ReviewForecastResult> {
    return this.engine.reviewForecast(command);
  }

  latest(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    trajectoryUnitId: string;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ForecastAssessmentState | undefined> {
    return this.engine.getLatestForecast(input);
  }

  history(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ForecastAssessmentState[]> {
    return this.engine.listForecastHistory(input);
  }
}

/**
 * Advisory decision support from composed contributors and forecast only.
 */
export class DecisionSupportService {
  constructor(private readonly engine: ProjectControlsEngine) {}

  assess(command: AssessDecisionCommand): Promise<AssessDecisionResult> {
    return this.engine.assessDecision(command);
  }

  review(command: ReviewDecisionCommand): Promise<ReviewDecisionResult> {
    return this.engine.reviewDecision(command);
  }

  latest(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    decisionUnitId: string;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<DecisionAssessmentState | undefined> {
    return this.engine.getLatestDecision(input);
  }

  history(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<DecisionAssessmentState[]> {
    return this.engine.listDecisionHistory(input);
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
  readonly cost: CostIntelligenceService;
  readonly productivity: ProductivityIntelligenceService;
  readonly forecast: ForecastIntelligenceService;
  readonly decision: DecisionSupportService;
  readonly snapshot: ProjectSnapshotService;
  readonly context: ProjectContextService;

  constructor(private readonly engine: ProjectControlsEngine) {
    this.progress = new ProgressIntelligenceService(engine);
    this.schedule = new ScheduleIntelligenceService(engine);
    this.change = new ChangeIntelligenceService(engine);
    this.cost = new CostIntelligenceService(engine);
    this.productivity = new ProductivityIntelligenceService(engine);
    this.forecast = new ForecastIntelligenceService(engine);
    this.decision = new DecisionSupportService(engine);
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

  assessCost(command: AssessCostCommand): Promise<AssessCostResult> {
    return this.engine.assessCost(command);
  }

  reviewCost(command: ReviewCostCommand): Promise<ReviewCostResult> {
    return this.engine.reviewCost(command);
  }

  assessProductivity(command: AssessProductivityCommand): Promise<AssessProductivityResult> {
    return this.engine.assessProductivity(command);
  }

  reviewProductivity(command: ReviewProductivityCommand): Promise<ReviewProductivityResult> {
    return this.engine.reviewProductivity(command);
  }

  assessForecast(command: AssessForecastCommand): Promise<AssessForecastResult> {
    return this.engine.assessForecast(command);
  }

  reviewForecast(command: ReviewForecastCommand): Promise<ReviewForecastResult> {
    return this.engine.reviewForecast(command);
  }

  assessDecision(command: AssessDecisionCommand): Promise<AssessDecisionResult> {
    return this.engine.assessDecision(command);
  }

  reviewDecision(command: ReviewDecisionCommand): Promise<ReviewDecisionResult> {
    return this.engine.reviewDecision(command);
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
