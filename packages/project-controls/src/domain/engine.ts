/**
 * Phase 11E — Project Controls engine facade.
 *
 * Orchestrates the progress, schedule and change intelligence slices end to
 * end: capability check → identity resolution → confidence → assessment →
 * review start → versioned persistence → snapshot → timeline → outbox → events.
 *
 * Identity is always resolved through the Engineering Shared Project Domain
 * port. The engine has no write path into `engineering_projects`.
 *
 * Forbidden here and everywhere below: cost engine, budget ledger, financial
 * posting, forecast, earned value, CPM/float, schedule execution, change
 * execution and contractual change approval.
 */

import {
  requireProjectReference,
  type ProjectReference,
  type SharedProjectDomainPort,
} from "@rtb/engineering-shared-project-domain";
import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import { assertOwnershipLock } from "../architecture/ownership-lock";
import {
  changeCandidateEventPayload,
  changeEventPayload,
  costEventPayload,
  createProjectControlsEvent,
  productivityEventPayload,
  profileEventPayload,
  progressEventPayload,
  scheduleEventPayload,
  snapshotEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import {
  assertProjectControlsCapability,
  type ProjectControlsCapability,
  type ProjectControlsRole,
} from "./role-matrix";
import type {
  IdempotencyRecord,
  PersistedChangeEvidence,
  PersistedCostEvidence,
  PersistedProductivityEvidence,
  PersistedProgressEvidence,
  PersistedScheduleEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
import {
  changeStateKey,
  type ChangeCandidate,
  type ChangeClassification,
  type ChangeEvidence,
  type ChangeIntelligenceState,
  type ChangeReference,
  type ChangeReviewOutcome,
  type ChangeReviewRecord,
  type ChangeSignal,
  type ProjectSnapshot,
  type ProjectTimelineEvent,
} from "./change";
import {
  createChangeIntelligenceEngine,
  type ChangeIntelligenceEngine,
} from "./change-engine";
import {
  costStateKey,
  type CostBasisReference,
  type CostControlContext,
  type CostEvidence,
  type CostIntelligenceState,
  type CostReviewOutcome,
  type CostReviewRecord,
} from "./cost";
import {
  createCostIntelligenceEngine,
  type CostIntelligenceEngine,
} from "./cost-engine";
import {
  productivityStateKey,
  type ProductivityAssessmentState,
  type ProductivityControlContext,
  type ProductivityEvidence,
  type ProductivityReviewOutcome,
  type ProductivityReviewRecord,
} from "./productivity";
import {
  createProductivityIntelligenceEngine,
  type ProductivityIntelligenceEngine,
} from "./productivity-engine";
import {
  scopeKey,
  type ProgressAssessmentState,
  type ProgressEvidence,
  type ProgressReviewOutcome,
  type ProgressReviewRecord,
  type ProgressSnapshot,
  type ProgressTimelineEvent,
  type ProjectProfile,
  type ProjectScopeRef,
} from "./progress";
import {
  createProgressIntelligenceEngine,
  type ProgressIntelligenceEngine,
} from "./progress-engine";
import {
  createProjectContextEngine,
  type ProjectContextEngine,
} from "./project-context-engine";
import {
  createScheduleIntelligenceEngine,
  type ScheduleIntelligenceEngine,
} from "./schedule-engine";
import {
  assertChangePublishable,
  assertCostPublishable,
  assertProductivityPublishable,
  assertPublishable,
  assertSchedulePublishable,
  startChangeReview,
  startCostReview,
  startProductivityReview,
  startProgressReview,
  startScheduleReview,
  transitionChangeReview,
  transitionCostReview,
  transitionProductivityReview,
  transitionProgressReview,
  transitionScheduleReview,
  type ChangeReviewAction,
  type ChangeReviewTargetState,
  type CostReviewAction,
  type CostReviewTargetState,
  type ProductivityReviewAction,
  type ProductivityReviewTargetState,
  type ProgressReviewAction,
  type ProgressReviewTargetState,
  type ScheduleReviewAction,
  type ScheduleReviewTargetState,
} from "./review-workflow";
import {
  type ScheduleAssessmentState,
  type ScheduleEvidence,
  type ScheduleReviewOutcome,
  type ScheduleReviewRecord,
  type ScheduleSnapshot,
  type ScheduleTimelineEvent,
} from "./schedule";
import { assertReservedProvidersUnimplemented } from "./reserved-providers";
import {
  createForecastOrchestration,
  type AssessForecastCommand,
  type AssessForecastResult,
  type ReviewForecastCommand,
  type ReviewForecastResult,
} from "./engine-forecast";
import {
  createDecisionOrchestration,
  type AssessDecisionCommand,
  type AssessDecisionResult,
  type ReviewDecisionCommand,
  type ReviewDecisionResult,
} from "./engine-decision";
import {
  createScenarioOrchestration,
  type AssessScenarioCommand,
  type AssessScenarioResult,
  type ReviewScenarioCommand,
  type ReviewScenarioResult,
} from "./engine-scenario";
import {
  createRiskOpportunityOrchestration,
  type AssessRiskOpportunityCommand,
  type AssessRiskOpportunityResult,
  type ReviewRiskOpportunityCommand,
  type ReviewRiskOpportunityResult,
} from "./engine-risk-opportunity";
import {
  createAssuranceOrchestration,
  type AssessAssuranceCommand,
  type AssessAssuranceResult,
  type ReviewAssuranceCommand,
  type ReviewAssuranceResult,
} from "./engine-assurance";

export type {
  AssessForecastCommand,
  AssessForecastResult,
  ReviewForecastCommand,
  ReviewForecastResult,
} from "./engine-forecast";

export type {
  AssessDecisionCommand,
  AssessDecisionResult,
  ReviewDecisionCommand,
  ReviewDecisionResult,
} from "./engine-decision";

export type {
  AssessScenarioCommand,
  AssessScenarioResult,
  ReviewScenarioCommand,
  ReviewScenarioResult,
} from "./engine-scenario";

export type {
  AssessRiskOpportunityCommand,
  AssessRiskOpportunityResult,
  ReviewRiskOpportunityCommand,
  ReviewRiskOpportunityResult,
} from "./engine-risk-opportunity";

export type {
  AssessAssuranceCommand,
  AssessAssuranceResult,
  ReviewAssuranceCommand,
  ReviewAssuranceResult,
} from "./engine-assurance";

export type AssessProgressCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  evidence: readonly ProgressEvidence[];
  actorRole: ProjectControlsRole;
  actorId?: string;
  narrative?: string;
  asOf?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  /** Set false to assess without opening a review (drafting). */
  startReview?: boolean;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

export type AssessProgressResult = {
  assessment: ProgressAssessmentState;
  snapshotId: string;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: ProgressReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  earnedValueComputed: false;
  criticalPathComputed: false;
};

export type ReviewProgressCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: ProgressReviewAction;
  to: ProgressReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewProgressResult = {
  assessment: ProgressAssessmentState;
  review: ProgressReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
};

export type AssessScheduleCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  evidence: readonly ScheduleEvidence[];
  actorRole: ProjectControlsRole;
  actorId?: string;
  narrative?: string;
  asOf?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  startReview?: boolean;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  disagreementThresholdDays?: number;
  minimumEvidenceCount?: number;
};

export type AssessScheduleResult = {
  assessment: ScheduleAssessmentState;
  snapshotId: string;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: ScheduleReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  earnedValueComputed: false;
  criticalPathComputed: false;
  floatComputed: false;
};

export type ReviewScheduleCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assessmentStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: ScheduleReviewAction;
  to: ScheduleReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewScheduleResult = {
  assessment: ScheduleAssessmentState;
  review: ScheduleReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
};

export type CreateChangeCandidateCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  signals: readonly ChangeSignal[];
  actorRole: ProjectControlsRole;
  actorId?: string;
  changeClass?: ChangeClassification;
  title?: string;
  narrative?: string;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type CreateChangeCandidateResult = {
  candidate: ChangeCandidate;
  idempotentReplay: boolean;
  /** A candidate is a subject for assessment, never an approved change. */
  isApprovedChange: false;
  contractualApprovalClaimed: false;
};

export type AssessChangeCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  changeClass: ChangeClassification;
  evidence: readonly ChangeEvidence[];
  actorRole: ProjectControlsRole;
  actorId?: string;
  candidateId?: string;
  authoritativeChangeRef?: ChangeReference;
  narrative?: string;
  asOf?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  startReview?: boolean;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

export type AssessChangeResult = {
  state: ChangeIntelligenceState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: ChangeReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  earnedValueComputed: false;
  criticalPathComputed: false;
  financialPostingPerformed: false;
  contractualApprovalClaimed: false;
};

export type ReviewChangeCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  changeStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: ChangeReviewAction;
  to: ChangeReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewChangeResult = {
  state: ChangeIntelligenceState;
  review: ChangeReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  /** Publishing intelligence is not approving a contractual change. */
  contractualApprovalClaimed: false;
};

export type AssessCostCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: CostControlContext;
  evidence: readonly CostEvidence[];
  actorRole: ProjectControlsRole;
  actorId?: string;
  costBasisRef?: CostBasisReference;
  changeIntelligenceStateIds?: readonly string[];
  narrative?: string;
  asOf?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  startReview?: boolean;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

export type AssessCostResult = {
  state: CostIntelligenceState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: CostReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  varianceAttribution: CostIntelligenceState["varianceAttribution"];
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  earnedValueComputed: false;
  financialPostingPerformed: false;
  budgetMutated: false;
  forecastProduced: false;
};

export type ReviewCostCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  costStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: CostReviewAction;
  to: CostReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewCostResult = {
  state: CostIntelligenceState;
  review: CostReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  financialPostingClaimed: false;
};

export type AssessProductivityCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  controlContext: ProductivityControlContext;
  evidence: readonly ProductivityEvidence[];
  actorRole: ProjectControlsRole;
  actorId?: string;
  narrative?: string;
  asOf?: string;
  expectedVersion?: number;
  idempotencyKey?: string;
  correlationId?: string;
  startReview?: boolean;
  freshnessHorizonHours?: number;
  sufficiencyThreshold?: number;
  minimumEvidenceCount?: number;
};

export type AssessProductivityResult = {
  state: ProductivityAssessmentState;
  workflowInstance?: EngineeringWorkflowInstance;
  review?: ProductivityReviewRecord;
  abstained: boolean;
  abstentionReason?: string;
  idempotentReplay: boolean;
  projectIdentityMutated: false;
  workforceManagementPerformed: false;
  labourProductivityPercentComputed: false;
  forecastProduced: false;
};

export type ReviewProductivityCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  productivityStateId: string;
  workflowInstance: EngineeringWorkflowInstance;
  action: ProductivityReviewAction;
  to: ProductivityReviewTargetState;
  reviewerId: string;
  actorRole: ProjectControlsRole;
  notes?: string;
  publish?: boolean;
  asOf?: string;
  correlationId?: string;
  idempotencyKey?: string;
};

export type ReviewProductivityResult = {
  state: ProductivityAssessmentState;
  review: ProductivityReviewRecord;
  workflowInstance: EngineeringWorkflowInstance;
  published: boolean;
  projectIdentityMutated: false;
  workforceManagementClaimed: false;
};

export type CreateProjectSnapshotCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorRole: ProjectControlsRole;
  actorId?: string;
  profileId?: string;
  asOf?: string;
  correlationId?: string;
};

export type CreateProjectSnapshotResult = {
  snapshot: ProjectSnapshot;
  projectIdentityMutated: false;
};

export type ComposeProjectProfileCommand = {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  actorRole: ProjectControlsRole;
  actorId?: string;
  asOf?: string;
  correlationId?: string;
  persist?: boolean;
};

export type ComposeProjectProfileResult = {
  profile: ProjectProfile;
  abstained: boolean;
  abstentionReason?: string;
  projectIdentityMutated: false;
};

export type ProjectControlsEngineDeps = {
  projectDomainPort: SharedProjectDomainPort;
  repository: ProjectControlsRepositoryPort;
  events: ProjectControlsEventPublishPort;
  progressEngine?: ProgressIntelligenceEngine;
  scheduleEngine?: ScheduleIntelligenceEngine;
  changeEngine?: ChangeIntelligenceEngine;
  costEngine?: CostIntelligenceEngine;
  productivityEngine?: ProductivityIntelligenceEngine;
  contextEngine?: ProjectContextEngine;
};

const PROGRESS_SOURCE_KEY = "project_controls.progress_intelligence" as const;
const SCHEDULE_SOURCE_KEY = "project_controls.schedule_intelligence" as const;
const CHANGE_SOURCE_KEY = "project_controls.change_intelligence" as const;
const COST_SOURCE_KEY = "project_controls.cost_intelligence" as const;
const PRODUCTIVITY_SOURCE_KEY = "project_controls.productivity_intelligence" as const;

const PROJECT_TIMELINE_GOVERNANCE = {
  advisoryOnly: true,
  earnedValueComputed: false,
  criticalPathComputed: false,
  floatComputed: false,
  financialPostingPerformed: false,
  contractualApprovalClaimed: false,
  mutatesProjectIdentity: false,
} as const;

export class ProjectControlsEngine {
  private readonly progressEngine: ProgressIntelligenceEngine;
  private readonly scheduleEngine: ScheduleIntelligenceEngine;
  private readonly changeEngine: ChangeIntelligenceEngine;
  private readonly costEngine: CostIntelligenceEngine;
  private readonly productivityEngine: ProductivityIntelligenceEngine;
  private readonly contextEngine: ProjectContextEngine;
  private readonly forecastOrchestration: ReturnType<typeof createForecastOrchestration>;
  private readonly decisionOrchestration: ReturnType<typeof createDecisionOrchestration>;
  private readonly scenarioOrchestration: ReturnType<typeof createScenarioOrchestration>;
  private readonly riskOpportunityOrchestration: ReturnType<typeof createRiskOpportunityOrchestration>;
  private readonly assuranceOrchestration: ReturnType<typeof createAssuranceOrchestration>;

  constructor(private readonly deps: ProjectControlsEngineDeps) {
    assertOwnershipLock();
    assertReservedProvidersUnimplemented();
    this.progressEngine =
      deps.progressEngine ??
      createProgressIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });
    this.scheduleEngine =
      deps.scheduleEngine ??
      createScheduleIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });
    this.changeEngine =
      deps.changeEngine ??
      createChangeIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });
    this.costEngine =
      deps.costEngine ??
      createCostIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });
    this.productivityEngine =
      deps.productivityEngine ??
      createProductivityIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });
    this.contextEngine =
      deps.contextEngine ?? createProjectContextEngine({ newId: (p) => deps.repository.newId(p) });
    this.forecastOrchestration = createForecastOrchestration({
      projectDomainPort: deps.projectDomainPort,
      repository: deps.repository,
      events: deps.events,
      appendTimeline: (input) => this.appendProjectTimeline(input),
    });
    this.decisionOrchestration = createDecisionOrchestration({
      projectDomainPort: deps.projectDomainPort,
      repository: deps.repository,
      events: deps.events,
      appendTimeline: (input) => this.appendProjectTimeline(input),
    });
    this.scenarioOrchestration = createScenarioOrchestration({
      projectDomainPort: deps.projectDomainPort,
      repository: deps.repository,
      events: deps.events,
      appendTimeline: (input) => this.appendProjectTimeline(input),
    });
    this.riskOpportunityOrchestration = createRiskOpportunityOrchestration({
      projectDomainPort: deps.projectDomainPort,
      repository: deps.repository,
      events: deps.events,
      appendTimeline: (input) => this.appendProjectTimeline(input),
    });
    this.assuranceOrchestration = createAssuranceOrchestration({
      projectDomainPort: deps.projectDomainPort,
      repository: deps.repository,
      events: deps.events,
      appendTimeline: (input) => this.appendProjectTimeline(input),
    });
  }

  async assessProgress(command: AssessProgressCommand): Promise<AssessProgressResult> {
    this.requireCapability(command.actorRole, "progress.assess");
    const replay = await this.replay<AssessProgressResult>(command, "assess_progress");
    if (replay) return replay;

    const reference = await this.resolveProject(command);
    const asOf = command.asOf ?? new Date().toISOString();

    const previous = await this.deps.repository.latestProgressAssessment(
      command.tenantId,
      command.workspaceId,
      command.scope,
    );
    const version = await this.deps.repository.nextProgressAssessmentVersion(
      command.tenantId,
      command.workspaceId,
      command.scope,
      command.expectedVersion,
    );

    const outcome = this.progressEngine.assess({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      scope: command.scope,
      evidence: command.evidence,
      version,
      asOf,
      narrative: command.narrative,
      createdBy: command.actorId,
      supersedesId: previous?.stateId,
      previousIndication: previous?.indicatedCompletion,
      previousAssessedAt: previous?.assessedAt,
      freshnessHorizonHours: command.freshnessHorizonHours,
      sufficiencyThreshold: command.sufficiencyThreshold,
      minimumEvidenceCount: command.minimumEvidenceCount,
    });

    let assessment = outcome.assessment;
    let workflowInstance: EngineeringWorkflowInstance | undefined;
    let review: ProgressReviewRecord | undefined;

    // An abstained assessment is recorded but never enters review: there is
    // nothing for a reviewer to approve.
    if (!outcome.abstained && command.startReview !== false) {
      const started = startProgressReview({
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        assessmentStateId: assessment.stateId,
        startedBy: command.actorId,
      });
      workflowInstance = started.instance;
      assessment = {
        ...assessment,
        status: "pending_review",
        workflowInstanceId: started.instance.instanceId,
      };
      review = {
        reviewId: started.review.reviewId,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        assessmentStateId: assessment.stateId,
        workflowInstanceId: started.instance.instanceId,
        workflowState: started.instance.state,
        reviewerId: undefined,
        createdAt: started.review.createdAt,
        selfApproved: false,
      };
    }

    const saved = await this.deps.repository.saveProgressAssessment(assessment);
    await this.deps.repository.saveProgressEvidence(
      command.evidence.map<PersistedProgressEvidence>((item) => ({
        ...item,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        scope: command.scope,
        assessmentStateId: saved.stateId,
        recordedAt: asOf,
        createdBy: command.actorId,
      })),
    );
    if (review) await this.deps.repository.saveProgressReview(review);

    const snapshot = await this.captureSnapshot(saved, asOf);
    await this.appendTimeline(saved, outcome.abstained ? "progress_abstained" : "progress_assessed", {
      actorId: command.actorId,
      recordedAt: asOf,
      detail: outcome.abstentionReason,
    });
    await this.emit("engineering.project.progress.updated", saved, command.correlationId);

    const result: AssessProgressResult = {
      assessment: saved,
      snapshotId: snapshot.snapshotId,
      workflowInstance,
      review,
      abstained: outcome.abstained,
      abstentionReason: outcome.abstentionReason,
      idempotentReplay: false,
      projectIdentityMutated: false,
      earnedValueComputed: false,
      criticalPathComputed: false,
    };
    await this.recordIdempotency(command, "assess_progress", saved.stateId, result);
    return result;
  }

  async reviewProgress(command: ReviewProgressCommand): Promise<ReviewProgressResult> {
    const latest = await this.deps.repository.getProgressAssessmentById(
      command.tenantId,
      command.workspaceId,
      command.assessmentStateId,
    );
    if (!latest) throw new Error("progress_assessment_not_found");
    if (latest.status === "published") {
      throw new Error("published_progress_assessment_immutable");
    }
    if (latest.abstained) {
      throw new Error("abstained_progress_assessment_not_reviewable");
    }

    const capability: ProjectControlsCapability =
      command.action === "approve" ? "progress.approve" : "progress.review";
    assertProjectControlsCapability(command.actorRole, capability, {
      actorId: command.reviewerId,
      assessedBy: latest.createdBy,
    });

    const asOf = command.asOf ?? new Date().toISOString();
    let instance = transitionProgressReview({
      instance: command.workflowInstance,
      action: command.action,
      to: command.to,
    });

    const publish = command.publish === true && command.to === "approved";
    if (publish) {
      assertProjectControlsCapability(command.actorRole, "progress.publish", {
        actorId: command.reviewerId,
        assessedBy: latest.createdBy,
      });
      assertPublishable({
        workflowState: instance.state,
        reviewerId: command.reviewerId,
        assessedBy: latest.createdBy,
      });
      instance = transitionProgressReview({
        instance,
        action: "publish",
        to: "published",
      });
    }

    const nextStatus: ProgressAssessmentState["status"] = publish
      ? "published"
      : command.to === "approved"
        ? "reviewed"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "changes_requested"
            ? "changes_requested"
            : "pending_review";

    const version = await this.deps.repository.nextProgressAssessmentVersion(
      command.tenantId,
      command.workspaceId,
      latest.scope,
    );
    const next: ProgressAssessmentState = {
      ...latest,
      stateId: this.deps.repository.newId("pcprog"),
      version,
      status: nextStatus,
      recordedAt: asOf,
      reviewedAt: asOf,
      publishedAt: publish ? asOf : latest.publishedAt,
      supersedesId: latest.stateId,
      workflowInstanceId: instance.instanceId,
    };
    const saved = await this.deps.repository.saveProgressAssessment(next);

    const review: ProgressReviewRecord = {
      reviewId: this.deps.repository.newId("pcreview"),
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: command.projectId,
      assessmentStateId: saved.stateId,
      workflowInstanceId: instance.instanceId,
      workflowState: instance.state,
      outcome: reviewOutcomeFor(command.action),
      reviewerId: command.reviewerId,
      notes: command.notes,
      createdAt: asOf,
      completedAt: command.action === "resubmit" ? undefined : asOf,
      selfApproved: false,
    };
    await this.deps.repository.saveProgressReview(review);

    await this.captureSnapshot(saved, asOf);
    await this.appendTimeline(
      saved,
      publish ? "progress_published" : command.to === "rejected" ? "progress_rejected" : "progress_reviewed",
      { actorId: command.reviewerId, recordedAt: asOf, detail: command.notes },
    );
    await this.emit("engineering.project.progress.reviewed", saved, command.correlationId);
    if (publish) {
      await this.emit("engineering.project.progress.published", saved, command.correlationId);
    }

    return {
      assessment: saved,
      review,
      workflowInstance: instance,
      published: publish,
      projectIdentityMutated: false,
    };
  }

  async assessSchedule(command: AssessScheduleCommand): Promise<AssessScheduleResult> {
    this.requireCapability(command.actorRole, "schedule.assess");
    const replay = await this.replay<AssessScheduleResult>(command, "assess_schedule");
    if (replay) return replay;

    const reference = await this.resolveProject(command);
    const asOf = command.asOf ?? new Date().toISOString();

    const previous = await this.deps.repository.latestScheduleAssessment(
      command.tenantId,
      command.workspaceId,
      command.scope,
    );
    const version = await this.deps.repository.nextScheduleAssessmentVersion(
      command.tenantId,
      command.workspaceId,
      command.scope,
      command.expectedVersion,
    );

    const outcome = this.scheduleEngine.assess({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      scope: command.scope,
      evidence: command.evidence,
      version,
      asOf,
      narrative: command.narrative,
      createdBy: command.actorId,
      supersedesId: previous?.stateId,
      freshnessHorizonHours: command.freshnessHorizonHours,
      sufficiencyThreshold: command.sufficiencyThreshold,
      disagreementThresholdDays: command.disagreementThresholdDays,
      minimumEvidenceCount: command.minimumEvidenceCount,
    });

    let assessment = outcome.assessment;
    let workflowInstance: EngineeringWorkflowInstance | undefined;
    let review: ScheduleReviewRecord | undefined;

    if (!outcome.abstained && command.startReview !== false) {
      const started = startScheduleReview({
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        assessmentStateId: assessment.stateId,
        startedBy: command.actorId,
      });
      workflowInstance = started.instance;
      assessment = {
        ...assessment,
        status: "pending_review",
        workflowInstanceId: started.instance.instanceId,
      };
      review = {
        reviewId: started.review.reviewId,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        assessmentStateId: assessment.stateId,
        workflowInstanceId: started.instance.instanceId,
        workflowState: started.instance.state,
        createdAt: started.review.createdAt,
        selfApproved: false,
      };
    }

    const saved = await this.deps.repository.saveScheduleAssessment(assessment);
    await this.deps.repository.saveScheduleEvidence(
      command.evidence.map<PersistedScheduleEvidence>((item) => ({
        ...item,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        scope: command.scope,
        assessmentStateId: saved.stateId,
        recordedAt: asOf,
        createdBy: command.actorId,
      })),
    );
    if (review) await this.deps.repository.saveScheduleReview(review);

    const snapshot = await this.captureScheduleSnapshot(saved, asOf);
    await this.appendScheduleTimeline(
      saved,
      outcome.abstained ? "schedule_abstained" : "schedule_assessed",
      { actorId: command.actorId, recordedAt: asOf, detail: outcome.abstentionReason },
    );
    await this.emitSchedule("engineering.project.schedule.updated", saved, command.correlationId);

    const result: AssessScheduleResult = {
      assessment: saved,
      snapshotId: snapshot.snapshotId,
      workflowInstance,
      review,
      abstained: outcome.abstained,
      abstentionReason: outcome.abstentionReason,
      idempotentReplay: false,
      projectIdentityMutated: false,
      earnedValueComputed: false,
      criticalPathComputed: false,
      floatComputed: false,
    };
    await this.recordIdempotency(command, "assess_schedule", saved.stateId, result);
    return result;
  }

  async reviewSchedule(command: ReviewScheduleCommand): Promise<ReviewScheduleResult> {
    const latest = await this.deps.repository.getScheduleAssessmentById(
      command.tenantId,
      command.workspaceId,
      command.assessmentStateId,
    );
    if (!latest) throw new Error("schedule_assessment_not_found");
    if (latest.status === "published") {
      throw new Error("published_schedule_assessment_immutable");
    }
    if (latest.abstained) {
      throw new Error("abstained_schedule_assessment_not_reviewable");
    }

    const capability: ProjectControlsCapability =
      command.action === "approve" ? "schedule.approve" : "schedule.review";
    assertProjectControlsCapability(command.actorRole, capability, {
      actorId: command.reviewerId,
      assessedBy: latest.createdBy,
    });

    const asOf = command.asOf ?? new Date().toISOString();
    let instance = transitionScheduleReview({
      instance: command.workflowInstance,
      action: command.action,
      to: command.to,
    });

    const publish = command.publish === true && command.to === "approved";
    if (publish) {
      assertProjectControlsCapability(command.actorRole, "schedule.publish", {
        actorId: command.reviewerId,
        assessedBy: latest.createdBy,
      });
      assertSchedulePublishable({
        workflowState: instance.state,
        reviewerId: command.reviewerId,
        assessedBy: latest.createdBy,
      });
      instance = transitionScheduleReview({
        instance,
        action: "publish",
        to: "published",
      });
    }

    const nextStatus: ScheduleAssessmentState["status"] = publish
      ? "published"
      : command.to === "approved"
        ? "reviewed"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "changes_requested"
            ? "changes_requested"
            : "pending_review";

    const version = await this.deps.repository.nextScheduleAssessmentVersion(
      command.tenantId,
      command.workspaceId,
      latest.scope,
    );
    const next: ScheduleAssessmentState = {
      ...latest,
      stateId: this.deps.repository.newId("pcsched"),
      version,
      status: nextStatus,
      recordedAt: asOf,
      reviewedAt: asOf,
      publishedAt: publish ? asOf : latest.publishedAt,
      supersedesId: latest.stateId,
      workflowInstanceId: instance.instanceId,
    };
    const saved = await this.deps.repository.saveScheduleAssessment(next);

    const review: ScheduleReviewRecord = {
      reviewId: this.deps.repository.newId("pcschedreview"),
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: command.projectId,
      assessmentStateId: saved.stateId,
      workflowInstanceId: instance.instanceId,
      workflowState: instance.state,
      outcome: scheduleReviewOutcomeFor(command.action),
      reviewerId: command.reviewerId,
      notes: command.notes,
      createdAt: asOf,
      completedAt: command.action === "resubmit" ? undefined : asOf,
      selfApproved: false,
    };
    await this.deps.repository.saveScheduleReview(review);

    await this.captureScheduleSnapshot(saved, asOf);
    await this.appendScheduleTimeline(
      saved,
      publish ? "schedule_published" : command.to === "rejected" ? "schedule_rejected" : "schedule_reviewed",
      { actorId: command.reviewerId, recordedAt: asOf, detail: command.notes },
    );
    await this.emitSchedule("engineering.project.schedule.reviewed", saved, command.correlationId);
    if (publish) {
      await this.emitSchedule("engineering.project.schedule.published", saved, command.correlationId);
    }

    return {
      assessment: saved,
      review,
      workflowInstance: instance,
      published: publish,
      projectIdentityMutated: false,
    };
  }

  async createChangeCandidate(
    command: CreateChangeCandidateCommand,
  ): Promise<CreateChangeCandidateResult> {
    this.requireCapability(command.actorRole, "change.assess");
    const replay = await this.replay<CreateChangeCandidateResult>(
      command,
      "create_change_candidate",
    );
    if (replay) return replay;

    const reference = await this.resolveProject(command);
    const asOf = command.asOf ?? new Date().toISOString();

    const candidate = this.changeEngine.createCandidate({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      scope: command.scope,
      signals: command.signals,
      changeClass: command.changeClass,
      title: command.title,
      narrative: command.narrative,
      asOf,
      createdBy: command.actorId,
    });
    const saved = await this.deps.repository.saveChangeCandidate(candidate);

    await this.appendProjectTimeline({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      stateId: saved.candidateId,
      kind: "change_candidate_created",
      eventType: "engineering.project.change_candidate.created",
      recordedAt: asOf,
      actorId: command.actorId,
    });
    await this.emitChangeEvent({
      eventType: "engineering.project.change_candidate.created",
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      scope: saved.scope,
      stateId: saved.candidateId,
      occurredAt: asOf,
      correlationId: command.correlationId,
      payload: changeCandidateEventPayload(saved),
    });

    const result: CreateChangeCandidateResult = {
      candidate: saved,
      idempotentReplay: false,
      isApprovedChange: false,
      contractualApprovalClaimed: false,
    };
    await this.recordIdempotency(
      command,
      "create_change_candidate",
      saved.candidateId,
      result,
    );
    return result;
  }

  async assessChange(command: AssessChangeCommand): Promise<AssessChangeResult> {
    this.requireCapability(command.actorRole, "change.assess");
    const replay = await this.replay<AssessChangeResult>(command, "assess_change");
    if (replay) return replay;

    const reference = await this.resolveProject(command);
    const asOf = command.asOf ?? new Date().toISOString();

    const previous = await this.deps.repository.latestChangeState(
      command.tenantId,
      command.workspaceId,
      command.scope,
      command.changeClass,
    );
    const version = await this.deps.repository.nextChangeStateVersion(
      command.tenantId,
      command.workspaceId,
      command.scope,
      command.changeClass,
      command.expectedVersion,
    );

    const outcome = this.changeEngine.assess({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      scope: command.scope,
      changeClass: command.changeClass,
      evidence: command.evidence,
      candidateId: command.candidateId,
      authoritativeChangeRef: command.authoritativeChangeRef,
      version,
      asOf,
      narrative: command.narrative,
      createdBy: command.actorId,
      supersedesId: previous?.stateId,
      freshnessHorizonHours: command.freshnessHorizonHours,
      sufficiencyThreshold: command.sufficiencyThreshold,
      minimumEvidenceCount: command.minimumEvidenceCount,
    });

    let state = outcome.state;
    let workflowInstance: EngineeringWorkflowInstance | undefined;
    let review: ChangeReviewRecord | undefined;

    // An abstained assessment is recorded but never enters review: there is no
    // supported change posture for a reviewer to approve.
    if (!outcome.abstained && command.startReview !== false) {
      const started = startChangeReview({
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        assessmentStateId: state.stateId,
        startedBy: command.actorId,
      });
      workflowInstance = started.instance;
      state = {
        ...state,
        status: "pending_review",
        workflowInstanceId: started.instance.instanceId,
      };
      review = {
        reviewId: started.review.reviewId,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        changeStateId: state.stateId,
        workflowInstanceId: started.instance.instanceId,
        workflowState: started.instance.state,
        createdAt: started.review.createdAt,
        selfApproved: false,
        contractualApprovalClaimed: false,
      };
    }

    const saved = await this.deps.repository.saveChangeState(state);
    await this.deps.repository.saveChangeEvidence(
      command.evidence.map<PersistedChangeEvidence>((item) => ({
        ...item,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        scope: command.scope,
        changeStateId: saved.stateId,
        recordedAt: asOf,
        createdBy: command.actorId,
      })),
    );
    await this.deps.repository.saveChangeConfidence({
      ...outcome.confidence,
      changeStateId: saved.stateId,
      recordedAt: asOf,
    });
    if (review) await this.deps.repository.saveChangeReview(review);

    await this.appendProjectTimeline({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      projectId: saved.projectId,
      stateId: saved.stateId,
      kind: outcome.abstained ? "change_abstained" : "change_assessed",
      eventType: "engineering.project.change.assessed",
      recordedAt: asOf,
      actorId: command.actorId,
      detail: outcome.abstentionReason,
    });
    await this.emitChangeState("engineering.project.change.assessed", saved, command.correlationId);

    const result: AssessChangeResult = {
      state: saved,
      workflowInstance,
      review,
      abstained: outcome.abstained,
      abstentionReason: outcome.abstentionReason,
      idempotentReplay: false,
      projectIdentityMutated: false,
      earnedValueComputed: false,
      criticalPathComputed: false,
      financialPostingPerformed: false,
      contractualApprovalClaimed: false,
    };
    await this.recordIdempotency(command, "assess_change", saved.stateId, result);
    return result;
  }

  async reviewChange(command: ReviewChangeCommand): Promise<ReviewChangeResult> {
    const latest = await this.deps.repository.getChangeStateById(
      command.tenantId,
      command.workspaceId,
      command.changeStateId,
    );
    if (!latest) throw new Error("change_state_not_found");
    if (latest.status === "published") throw new Error("published_change_state_immutable");
    if (latest.abstained) throw new Error("abstained_change_state_not_reviewable");

    const capability: ProjectControlsCapability =
      command.action === "approve" ? "change.approve" : "change.review";
    assertProjectControlsCapability(command.actorRole, capability, {
      actorId: command.reviewerId,
      assessedBy: latest.createdBy,
    });

    const asOf = command.asOf ?? new Date().toISOString();
    let instance = transitionChangeReview({
      instance: command.workflowInstance,
      action: command.action,
      to: command.to,
    });

    const publish = command.publish === true && command.to === "approved";
    if (publish) {
      assertProjectControlsCapability(command.actorRole, "change.publish", {
        actorId: command.reviewerId,
        assessedBy: latest.createdBy,
      });
      assertChangePublishable({
        workflowState: instance.state,
        reviewerId: command.reviewerId,
        assessedBy: latest.createdBy,
        contractualApprovalClaimed: false,
      });
      instance = transitionChangeReview({ instance, action: "publish", to: "published" });
    }

    const nextStatus: ChangeIntelligenceState["status"] = publish
      ? "published"
      : command.to === "approved"
        ? "reviewed"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "changes_requested"
            ? "changes_requested"
            : "pending_review";

    const version = await this.deps.repository.nextChangeStateVersion(
      command.tenantId,
      command.workspaceId,
      latest.scope,
      latest.changeClass,
    );
    const nextId = this.deps.repository.newId("pcchange");
    const next: ChangeIntelligenceState = {
      ...latest,
      id: nextId,
      stateId: nextId,
      version,
      status: nextStatus,
      recordedAt: asOf,
      reviewedAt: asOf,
      publishedAt: publish ? asOf : latest.publishedAt,
      supersedesId: latest.stateId,
      workflowInstanceId: instance.instanceId,
    };
    const saved = await this.deps.repository.saveChangeState(next);

    const review: ChangeReviewRecord = {
      reviewId: this.deps.repository.newId("pcchgreview"),
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: command.projectId,
      changeStateId: saved.stateId,
      workflowInstanceId: instance.instanceId,
      workflowState: instance.state,
      outcome: changeReviewOutcomeFor(command.action),
      reviewerId: command.reviewerId,
      notes: command.notes,
      createdAt: asOf,
      completedAt: command.action === "resubmit" ? undefined : asOf,
      selfApproved: false,
      contractualApprovalClaimed: false,
    };
    await this.deps.repository.saveChangeReview(review);

    await this.appendProjectTimeline({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      projectId: saved.projectId,
      stateId: saved.stateId,
      kind: publish
        ? "change_published"
        : command.to === "rejected"
          ? "change_rejected"
          : "change_reviewed",
      eventType: publish
        ? "engineering.project.change.published"
        : "engineering.project.change.reviewed",
      recordedAt: asOf,
      actorId: command.reviewerId,
      detail: command.notes,
    });
    await this.emitChangeState("engineering.project.change.reviewed", saved, command.correlationId);
    if (publish) {
      await this.emitChangeState(
        "engineering.project.change.published",
        saved,
        command.correlationId,
      );
    }
    if (latest.stateId !== saved.stateId) {
      await this.emitChangeState(
        "engineering.project.change.superseded",
        latest,
        command.correlationId,
      );
    }

    return {
      state: saved,
      review,
      workflowInstance: instance,
      published: publish,
      projectIdentityMutated: false,
      contractualApprovalClaimed: false,
    };
  }

  async assessCost(command: AssessCostCommand): Promise<AssessCostResult> {
    this.requireCapability(command.actorRole, "cost.assess");
    const replay = await this.replay<AssessCostResult>(command, "assess_cost");
    if (replay) return replay;

    const reference = await this.resolveProject(command);
    const asOf = command.asOf ?? new Date().toISOString();
    const scope = command.controlContext.scope;
    const accountId = command.controlContext.accountRef.accountId;

    const changeIntelligence = await this.resolveChangeIntelligenceRefs(
      command.tenantId,
      command.workspaceId,
      command.changeIntelligenceStateIds,
    );

    const previous = await this.deps.repository.latestCostState(
      command.tenantId,
      command.workspaceId,
      scope,
      accountId,
    );
    const version = await this.deps.repository.nextCostStateVersion(
      command.tenantId,
      command.workspaceId,
      scope,
      accountId,
      command.expectedVersion,
    );

    const outcome = this.costEngine.assess({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      controlContext: command.controlContext,
      evidence: command.evidence,
      costBasisRef: command.costBasisRef,
      changeIntelligence,
      version,
      asOf,
      narrative: command.narrative,
      createdBy: command.actorId,
      supersedesId: previous?.stateId,
      freshnessHorizonHours: command.freshnessHorizonHours,
      sufficiencyThreshold: command.sufficiencyThreshold,
      minimumEvidenceCount: command.minimumEvidenceCount,
    });

    let state = outcome.state;
    let workflowInstance: EngineeringWorkflowInstance | undefined;
    let review: CostReviewRecord | undefined;

    if (!outcome.abstained && command.startReview !== false) {
      const started = startCostReview({
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        assessmentStateId: state.stateId,
        startedBy: command.actorId,
      });
      workflowInstance = started.instance;
      state = {
        ...state,
        status: "pending_review",
        workflowInstanceId: started.instance.instanceId,
      };
      review = {
        reviewId: started.review.reviewId,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        costStateId: state.stateId,
        workflowInstanceId: started.instance.instanceId,
        workflowState: started.instance.state,
        createdAt: started.review.createdAt,
        selfApproved: false,
        financialPostingClaimed: false,
      };
    }

    const saved = await this.deps.repository.saveCostState(state);
    await this.deps.repository.saveCostEvidence(
      command.evidence.map<PersistedCostEvidence>((item) => ({
        ...item,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        costStateId: saved.stateId,
        recordedAt: asOf,
        createdBy: command.actorId,
      })),
    );
    await this.deps.repository.saveCostConfidence({
      ...outcome.confidence,
      costStateId: saved.stateId,
      recordedAt: asOf,
    });
    if (review) await this.deps.repository.saveCostReview(review);

    await this.appendProjectTimeline({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      projectId: saved.projectId,
      stateId: saved.stateId,
      kind: outcome.abstained ? "cost_abstained" : "cost_assessed",
      eventType: "engineering.project.cost.assessed",
      recordedAt: asOf,
      actorId: command.actorId,
      detail: outcome.abstentionReason,
      sourceKey: COST_SOURCE_KEY,
    });
    await this.emitCostState("engineering.project.cost.assessed", saved, command.correlationId);
    if (!outcome.abstained && outcome.varianceAttribution !== "insufficient_evidence") {
      await this.emitCostState(
        "engineering.project.cost.variance_attributed",
        saved,
        command.correlationId,
      );
    }

    const result: AssessCostResult = {
      state: saved,
      workflowInstance,
      review,
      abstained: outcome.abstained,
      abstentionReason: outcome.abstentionReason,
      varianceAttribution: saved.varianceAttribution,
      idempotentReplay: false,
      projectIdentityMutated: false,
      earnedValueComputed: false,
      financialPostingPerformed: false,
      budgetMutated: false,
      forecastProduced: false,
    };
    await this.recordIdempotency(command, "assess_cost", saved.stateId, result);
    return result;
  }

  async reviewCost(command: ReviewCostCommand): Promise<ReviewCostResult> {
    const latest = await this.deps.repository.getCostStateById(
      command.tenantId,
      command.workspaceId,
      command.costStateId,
    );
    if (!latest) throw new Error("cost_state_not_found");
    if (latest.status === "published") throw new Error("published_cost_state_immutable");
    if (latest.abstained) throw new Error("abstained_cost_state_not_reviewable");

    const capability: ProjectControlsCapability =
      command.action === "approve" ? "cost.approve" : "cost.review";
    assertProjectControlsCapability(command.actorRole, capability, {
      actorId: command.reviewerId,
      assessedBy: latest.createdBy,
    });

    const asOf = command.asOf ?? new Date().toISOString();
    let instance = transitionCostReview({
      instance: command.workflowInstance,
      action: command.action,
      to: command.to,
    });

    const publish = command.publish === true && command.to === "approved";
    if (publish) {
      assertProjectControlsCapability(command.actorRole, "cost.publish", {
        actorId: command.reviewerId,
        assessedBy: latest.createdBy,
      });
      assertCostPublishable({
        workflowState: instance.state,
        reviewerId: command.reviewerId,
        assessedBy: latest.createdBy,
        financialPostingClaimed: false,
      });
      instance = transitionCostReview({ instance, action: "publish", to: "published" });
    }

    const nextStatus: CostIntelligenceState["status"] = publish
      ? "published"
      : command.to === "approved"
        ? "reviewed"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "changes_requested"
            ? "changes_requested"
            : "pending_review";

    const version = await this.deps.repository.nextCostStateVersion(
      command.tenantId,
      command.workspaceId,
      latest.controlContext.scope,
      latest.controlContext.accountRef.accountId,
    );
    const nextId = this.deps.repository.newId("pccost");
    const next: CostIntelligenceState = {
      ...latest,
      id: nextId,
      stateId: nextId,
      version,
      status: nextStatus,
      recordedAt: asOf,
      reviewedAt: asOf,
      publishedAt: publish ? asOf : latest.publishedAt,
      supersedesId: latest.stateId,
      workflowInstanceId: instance.instanceId,
    };
    const saved = await this.deps.repository.saveCostState(next);

    const review: CostReviewRecord = {
      reviewId: this.deps.repository.newId("pccostreview"),
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: command.projectId,
      costStateId: saved.stateId,
      workflowInstanceId: instance.instanceId,
      workflowState: instance.state,
      outcome: costReviewOutcomeFor(command.action),
      reviewerId: command.reviewerId,
      notes: command.notes,
      createdAt: asOf,
      completedAt: command.action === "resubmit" ? undefined : asOf,
      selfApproved: false,
      financialPostingClaimed: false,
    };
    await this.deps.repository.saveCostReview(review);

    await this.appendProjectTimeline({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      projectId: saved.projectId,
      stateId: saved.stateId,
      kind: publish
        ? "cost_published"
        : command.to === "rejected"
          ? "cost_rejected"
          : "cost_reviewed",
      eventType: publish
        ? "engineering.project.cost.published"
        : "engineering.project.cost.reviewed",
      recordedAt: asOf,
      actorId: command.reviewerId,
      detail: command.notes,
      sourceKey: COST_SOURCE_KEY,
    });
    await this.emitCostState("engineering.project.cost.reviewed", saved, command.correlationId);
    if (publish) {
      await this.emitCostState("engineering.project.cost.published", saved, command.correlationId);
    }
    if (latest.stateId !== saved.stateId) {
      await this.emitCostState(
        "engineering.project.cost.superseded",
        latest,
        command.correlationId,
      );
    }

    return {
      state: saved,
      review,
      workflowInstance: instance,
      published: publish,
      projectIdentityMutated: false,
      financialPostingClaimed: false,
    };
  }

  async assessProductivity(command: AssessProductivityCommand): Promise<AssessProductivityResult> {
    this.requireCapability(command.actorRole, "productivity.assess");
    const replay = await this.replay<AssessProductivityResult>(command, "assess_productivity");
    if (replay) return replay;

    const reference = await this.resolveProject(command);
    const asOf = command.asOf ?? new Date().toISOString();
    const scope = command.controlContext.scope;
    const controlUnitId = command.controlContext.controlUnitId;

    const previous = await this.deps.repository.latestProductivityState(
      command.tenantId,
      command.workspaceId,
      scope,
      controlUnitId,
    );
    const version = await this.deps.repository.nextProductivityStateVersion(
      command.tenantId,
      command.workspaceId,
      scope,
      controlUnitId,
      command.expectedVersion,
    );

    const outcome = this.productivityEngine.assess({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      controlContext: command.controlContext,
      evidence: command.evidence,
      version,
      asOf,
      narrative: command.narrative,
      createdBy: command.actorId,
      supersedesId: previous?.stateId,
      freshnessHorizonHours: command.freshnessHorizonHours,
      sufficiencyThreshold: command.sufficiencyThreshold,
      minimumEvidenceCount: command.minimumEvidenceCount,
    });

    let state = outcome.state;
    let workflowInstance: EngineeringWorkflowInstance | undefined;
    let review: ProductivityReviewRecord | undefined;

    if (!outcome.abstained && command.startReview !== false) {
      const started = startProductivityReview({
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        assessmentStateId: state.stateId,
        startedBy: command.actorId,
      });
      workflowInstance = started.instance;
      state = {
        ...state,
        status: "pending_review",
        workflowInstanceId: started.instance.instanceId,
      };
      review = {
        reviewId: started.review.reviewId,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        productivityStateId: state.stateId,
        workflowInstanceId: started.instance.instanceId,
        workflowState: started.instance.state,
        createdAt: started.review.createdAt,
        selfApproved: false,
        workforceManagementClaimed: false,
      };
    }

    const saved = await this.deps.repository.saveProductivityState(state);
    await this.deps.repository.saveProductivityEvidence(
      command.evidence.map<PersistedProductivityEvidence>((item) => ({
        ...item,
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        productivityStateId: saved.stateId,
        recordedAt: asOf,
        createdBy: command.actorId,
      })),
    );
    await this.deps.repository.saveProductivityConfidence({
      ...outcome.confidence,
      productivityStateId: saved.stateId,
      recordedAt: asOf,
    });
    if (review) await this.deps.repository.saveProductivityReview(review);

    await this.appendProjectTimeline({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      projectId: saved.projectId,
      stateId: saved.stateId,
      kind: outcome.abstained ? "productivity_abstained" : "productivity_updated",
      eventType: "engineering.project.productivity.updated",
      recordedAt: asOf,
      actorId: command.actorId,
      detail: outcome.abstentionReason,
      sourceKey: PRODUCTIVITY_SOURCE_KEY,
    });
    await this.emitProductivityState(
      "engineering.project.productivity.updated",
      saved,
      command.correlationId,
    );

    const result: AssessProductivityResult = {
      state: saved,
      workflowInstance,
      review,
      abstained: outcome.abstained,
      abstentionReason: outcome.abstentionReason,
      idempotentReplay: false,
      projectIdentityMutated: false,
      workforceManagementPerformed: false,
      labourProductivityPercentComputed: false,
      forecastProduced: false,
    };
    await this.recordIdempotency(command, "assess_productivity", saved.stateId, result);
    return result;
  }

  async reviewProductivity(command: ReviewProductivityCommand): Promise<ReviewProductivityResult> {
    const latest = await this.deps.repository.getProductivityStateById(
      command.tenantId,
      command.workspaceId,
      command.productivityStateId,
    );
    if (!latest) throw new Error("productivity_state_not_found");
    if (latest.status === "published") throw new Error("published_productivity_state_immutable");
    if (latest.abstained) throw new Error("abstained_productivity_state_not_reviewable");

    const capability: ProjectControlsCapability =
      command.action === "approve" ? "productivity.approve" : "productivity.review";
    assertProjectControlsCapability(command.actorRole, capability, {
      actorId: command.reviewerId,
      assessedBy: latest.createdBy,
    });

    const asOf = command.asOf ?? new Date().toISOString();
    let instance = transitionProductivityReview({
      instance: command.workflowInstance,
      action: command.action,
      to: command.to,
    });

    const publish = command.publish === true && command.to === "approved";
    if (publish) {
      assertProjectControlsCapability(command.actorRole, "productivity.publish", {
        actorId: command.reviewerId,
        assessedBy: latest.createdBy,
      });
      assertProductivityPublishable({
        workflowState: instance.state,
        reviewerId: command.reviewerId,
        assessedBy: latest.createdBy,
        workforceManagementClaimed: false,
      });
      instance = transitionProductivityReview({ instance, action: "publish", to: "published" });
    }

    const nextStatus: ProductivityAssessmentState["status"] = publish
      ? "published"
      : command.to === "approved"
        ? "reviewed"
        : command.to === "rejected"
          ? "rejected"
          : command.to === "changes_requested"
            ? "changes_requested"
            : "pending_review";

    const version = await this.deps.repository.nextProductivityStateVersion(
      command.tenantId,
      command.workspaceId,
      latest.controlContext.scope,
      latest.controlContext.controlUnitId,
    );
    const nextId = this.deps.repository.newId("pcprod");
    const next: ProductivityAssessmentState = {
      ...latest,
      id: nextId,
      stateId: nextId,
      version,
      status: nextStatus,
      recordedAt: asOf,
      reviewedAt: asOf,
      publishedAt: publish ? asOf : latest.publishedAt,
      supersedesId: latest.stateId,
      workflowInstanceId: instance.instanceId,
    };
    const saved = await this.deps.repository.saveProductivityState(next);

    const review: ProductivityReviewRecord = {
      reviewId: this.deps.repository.newId("pcprodreview"),
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: command.projectId,
      productivityStateId: saved.stateId,
      workflowInstanceId: instance.instanceId,
      workflowState: instance.state,
      outcome: productivityReviewOutcomeFor(command.action),
      reviewerId: command.reviewerId,
      notes: command.notes,
      createdAt: asOf,
      completedAt: command.action === "resubmit" ? undefined : asOf,
      selfApproved: false,
      workforceManagementClaimed: false,
    };
    await this.deps.repository.saveProductivityReview(review);

    await this.appendProjectTimeline({
      tenantId: saved.tenantId,
      workspaceId: saved.workspaceId,
      projectId: saved.projectId,
      stateId: saved.stateId,
      kind: publish
        ? "productivity_published"
        : command.to === "rejected"
          ? "productivity_rejected"
          : "productivity_reviewed",
      eventType: publish
        ? "engineering.project.productivity.published"
        : "engineering.project.productivity.reviewed",
      recordedAt: asOf,
      actorId: command.reviewerId,
      detail: command.notes,
      sourceKey: PRODUCTIVITY_SOURCE_KEY,
    });
    await this.emitProductivityState(
      "engineering.project.productivity.reviewed",
      saved,
      command.correlationId,
    );
    if (publish) {
      await this.emitProductivityState(
        "engineering.project.productivity.published",
        saved,
        command.correlationId,
      );
    }

    return {
      state: saved,
      review,
      workflowInstance: instance,
      published: publish,
      projectIdentityMutated: false,
      workforceManagementClaimed: false,
    };
  }

  async assessForecast(command: AssessForecastCommand): Promise<AssessForecastResult> {
    this.requireCapability(command.actorRole, "forecast.assess");
    return this.forecastOrchestration.assessForecast(command);
  }

  async reviewForecast(command: ReviewForecastCommand): Promise<ReviewForecastResult> {
    this.requireCapability(
      command.publish ? command.actorRole : command.actorRole,
      command.publish ? "forecast.publish" : "forecast.review",
    );
    return this.forecastOrchestration.reviewForecast(command);
  }

  async getLatestForecast(input: {
    tenantId: string;
    workspaceId: string;
    scope: import("./progress").ProjectScopeRef;
    trajectoryUnitId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "forecast.read");
    return this.forecastOrchestration.getLatestForecast(input);
  }

  async listForecastHistory(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "forecast.read");
    return this.forecastOrchestration.listForecastHistory(input);
  }

  async assessDecision(command: AssessDecisionCommand): Promise<AssessDecisionResult> {
    this.requireCapability(command.actorRole, "decision.assess");
    return this.decisionOrchestration.assessDecision(command);
  }

  async reviewDecision(command: ReviewDecisionCommand): Promise<ReviewDecisionResult> {
    this.requireCapability(
      command.publish ? command.actorRole : command.actorRole,
      command.publish ? "decision.publish" : "decision.review",
    );
    return this.decisionOrchestration.reviewDecision(command);
  }

  async getLatestDecision(input: {
    tenantId: string;
    workspaceId: string;
    scope: import("./progress").ProjectScopeRef;
    decisionUnitId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "decision.read");
    return this.decisionOrchestration.getLatestDecision(input);
  }

  async listDecisionHistory(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "decision.read");
    return this.decisionOrchestration.listDecisionHistory(input);
  }

  async assessScenario(command: AssessScenarioCommand): Promise<AssessScenarioResult> {
    this.requireCapability(command.actorRole, "scenario.assess");
    return this.scenarioOrchestration.assessScenario(command);
  }

  async reviewScenario(command: ReviewScenarioCommand): Promise<ReviewScenarioResult> {
    this.requireCapability(
      command.actorRole,
      command.publish ? "scenario.publish" : "scenario.review",
    );
    return this.scenarioOrchestration.reviewScenario(command);
  }

  async getLatestScenario(input: {
    tenantId: string;
    workspaceId: string;
    scope: import("./scenario").ScenarioControlContext["scope"];
    scenarioUnitId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "scenario.read");
    return this.scenarioOrchestration.getLatestScenario(input);
  }

  async listScenarioHistory(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "scenario.read");
    return this.scenarioOrchestration.listScenarioHistory(input);
  }

  async assessRiskOpportunity(
    command: AssessRiskOpportunityCommand,
  ): Promise<AssessRiskOpportunityResult> {
    this.requireCapability(command.actorRole, "risk_opportunity.assess");
    return this.riskOpportunityOrchestration.assessRiskOpportunity(command);
  }

  async reviewRiskOpportunity(
    command: ReviewRiskOpportunityCommand,
  ): Promise<ReviewRiskOpportunityResult> {
    this.requireCapability(
      command.actorRole,
      command.publish ? "risk_opportunity.publish" : "risk_opportunity.review",
    );
    return this.riskOpportunityOrchestration.reviewRiskOpportunity(command);
  }

  async getLatestRiskOpportunity(input: {
    tenantId: string;
    workspaceId: string;
    scope: import("./risk-opportunity").RiskOpportunityControlContext["scope"];
    riskOpportunityUnitId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "risk_opportunity.read");
    return this.riskOpportunityOrchestration.getLatestRiskOpportunity(input);
  }

  async listRiskOpportunityHistory(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "risk_opportunity.read");
    return this.riskOpportunityOrchestration.listRiskOpportunityHistory(input);
  }

  async assessAssurance(command: AssessAssuranceCommand): Promise<AssessAssuranceResult> {
    this.requireCapability(command.actorRole, "assurance.assess");
    return this.assuranceOrchestration.assessAssurance(command);
  }

  async reviewAssurance(command: ReviewAssuranceCommand): Promise<ReviewAssuranceResult> {
    this.requireCapability(
      command.actorRole,
      command.publish ? "assurance.publish" : "assurance.review",
    );
    return this.assuranceOrchestration.reviewAssurance(command);
  }

  async getLatestAssurance(input: {
    tenantId: string;
    workspaceId: string;
    scope: import("./assurance").AssuranceControlContext["scope"];
    assuranceUnitId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "assurance.read");
    return this.assuranceOrchestration.getLatestAssurance(input);
  }

  async listAssuranceHistory(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }) {
    this.requireCapability(input.actorRole, "assurance.read");
    return this.assuranceOrchestration.listAssuranceHistory(input);
  }

  /**
   * Capture an immutable, identifier-only reference set for the project. The
   * snapshot copies no evidence, no indications and no dates from the states it
   * points at.
   */
  async createProjectSnapshot(
    command: CreateProjectSnapshotCommand,
  ): Promise<CreateProjectSnapshotResult> {
    this.requireCapability(command.actorRole, "snapshot.create");
    const reference = await this.resolveProject(command);
    const asOf = command.asOf ?? new Date().toISOString();

    const [progress, schedule, change, cost, productivity, forecast, decision, scenario, riskOpportunity, assurance] =
      await Promise.all([
      this.deps.repository.listProgressAssessments(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listScheduleAssessments(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listChangeStates(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listCostStates(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listProductivityStates(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listForecastStates(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listDecisionStates(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listScenarioStates(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listRiskOpportunityStates(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
      this.deps.repository.listAssuranceStates(
        command.tenantId,
        command.workspaceId,
        reference.projectId,
      ),
    ]);

    const profileId =
      command.profileId ??
      (
        await this.deps.repository.latestProjectProfile(
          command.tenantId,
          command.workspaceId,
          reference.projectId,
        )
      )?.profileId;

    const snapshot: ProjectSnapshot = {
      snapshotId: this.deps.repository.newId("pcprojsnap"),
      schemaVersion: "project_controls_project_snapshot/1",
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      capturedAt: asOf,
      profileId,
      progressStateIds: latestPerScope(progress).map((state) => state.stateId),
      scheduleStateIds: latestPerScopeSchedule(schedule).map((state) => state.stateId),
      changeStateIds: latestPerChangeThread(change).map((state) => state.stateId),
      costStateIds: latestPerCostThread(cost).map((state) => state.stateId),
      productivityStateIds: latestPerProductivityThread(productivity).map((state) => state.stateId),
      forecastStateIds: this.forecastOrchestration.latestPerForecastThread(forecast).map(
        (state) => state.stateId,
      ),
      decisionStateIds: this.decisionOrchestration.latestPerDecisionThread(decision).map(
        (state) => state.stateId,
      ),
      scenarioStateIds: this.scenarioOrchestration.latestPerScenarioThread(scenario).map(
        (state) => state.stateId,
      ),
      riskOpportunityStateIds: this.riskOpportunityOrchestration
        .latestPerRiskOpportunityThread(riskOpportunity)
        .map((state) => state.stateId),
      assuranceStateIds: this.assuranceOrchestration
        .latestPerAssuranceThread(assurance)
        .map((state) => state.stateId),
      createdBy: command.actorId,
      immutable: true,
      containsEvidencePayloads: false,
      projectReferenceResolved: true,
      isProjectRegistry: false,
      mutatesProjectIdentity: false,
      earnedValueComputed: false,
      financialPostingPerformed: false,
      contractualApprovalClaimed: false,
    };
    const saved = await this.deps.repository.saveProjectSnapshot(snapshot);

    await this.appendProjectTimeline({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      stateId: saved.snapshotId,
      kind: "project_snapshot_created",
      eventType: "engineering.project.snapshot.created",
      recordedAt: asOf,
      actorId: command.actorId,
    });
    await this.emitChangeEvent({
      eventType: "engineering.project.snapshot.created",
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectId: reference.projectId,
      stateId: saved.snapshotId,
      occurredAt: asOf,
      correlationId: command.correlationId,
      payload: snapshotEventPayload(saved),
    });

    return { snapshot: saved, projectIdentityMutated: false };
  }

  async composeProjectProfile(
    command: ComposeProjectProfileCommand,
  ): Promise<ComposeProjectProfileResult> {
    this.requireCapability(command.actorRole, "profile.compose");
    const reference = await this.resolveProject(command);
    const asOf = command.asOf ?? new Date().toISOString();

    const progress = await this.deps.repository.listProgressAssessments(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const schedule = await this.deps.repository.listScheduleAssessments(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const change = await this.deps.repository.listChangeStates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const cost = await this.deps.repository.listCostStates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const productivity = await this.deps.repository.listProductivityStates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const forecast = await this.deps.repository.listForecastStates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const decision = await this.deps.repository.listDecisionStates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const scenario = await this.deps.repository.listScenarioStates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const riskOpportunity = await this.deps.repository.listRiskOpportunityStates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const assurance = await this.deps.repository.listAssuranceStates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const candidates = await this.deps.repository.listChangeCandidates(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const version = await this.deps.repository.nextProjectProfileVersion(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );
    const previous = await this.deps.repository.latestProjectProfile(
      command.tenantId,
      command.workspaceId,
      reference.projectId,
    );

    const outcome = this.contextEngine.compose({
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      projectReference: reference,
      progress: latestPerScope(progress),
      schedule: latestPerScopeSchedule(schedule),
      change: latestPerChangeThread(change),
      cost: latestPerCostThread(cost),
      productivity: latestPerProductivityThread(productivity),
      forecast: this.forecastOrchestration.latestPerForecastThread(forecast),
      decision: this.decisionOrchestration.latestPerDecisionThread(decision),
      scenario: this.scenarioOrchestration.latestPerScenarioThread(scenario),
      riskOpportunity: this.riskOpportunityOrchestration.latestPerRiskOpportunityThread(
        riskOpportunity,
      ),
      assurance: this.assuranceOrchestration.latestPerAssuranceThread(assurance),
      changeCandidateCount: candidates.filter((row) => row.status === "candidate").length,
      version,
      asOf,
      createdBy: command.actorId,
      supersedesId: previous?.profileId,
    });

    const profile =
      command.persist === false
        ? outcome.profile
        : await this.deps.repository.saveProjectProfile(outcome.profile);

    if (command.persist !== false) {
      await this.deps.repository.appendProgressTimeline({
        entryId: this.deps.repository.newId("pctimeline"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        scope: { kind: "project", projectId: reference.projectId },
        stateId: profile.profileId,
        kind: "project_profile_composed",
        eventType: "engineering.project.profile.updated",
        recordedAt: asOf,
        sourceKey: PROGRESS_SOURCE_KEY,
        actorId: command.actorId,
        governance: {
          advisoryOnly: true,
          earnedValueComputed: false,
          criticalPathComputed: false,
          mutatesProjectIdentity: false,
        },
      });
      const event = createProjectControlsEvent({
        eventId: this.deps.repository.newId("pcevent"),
        eventType: "engineering.project.profile.updated",
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        stateId: profile.profileId,
        occurredAt: asOf,
        correlationId: command.correlationId,
        payload: profileEventPayload(profile),
      });
      await this.deps.repository.enqueueOutbox({
        outboxId: this.deps.repository.newId("pcoutbox"),
        tenantId: command.tenantId,
        workspaceId: command.workspaceId,
        projectId: reference.projectId,
        eventType: event.eventType,
        payload: event.payload,
        correlationId: command.correlationId,
        stateId: profile.profileId,
        published: false,
        createdAt: asOf,
      });
      await this.deps.events.publish(event);
    }

    return {
      profile,
      abstained: outcome.abstained,
      abstentionReason: outcome.abstentionReason,
      projectIdentityMutated: false,
    };
  }

  async getLatestProgress(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ProgressAssessmentState | undefined> {
    this.requireCapability(input.actorRole, "progress.read");
    return this.deps.repository.latestProgressAssessment(
      input.tenantId,
      input.workspaceId,
      input.scope,
      input.asOf,
    );
  }

  async getLatestSchedule(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ScheduleAssessmentState | undefined> {
    this.requireCapability(input.actorRole, "schedule.read");
    return this.deps.repository.latestScheduleAssessment(
      input.tenantId,
      input.workspaceId,
      input.scope,
      input.asOf,
    );
  }

  async getLatestChange(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    changeClass: ChangeClassification;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ChangeIntelligenceState | undefined> {
    this.requireCapability(input.actorRole, "change.read");
    return this.deps.repository.latestChangeState(
      input.tenantId,
      input.workspaceId,
      input.scope,
      input.changeClass,
      input.asOf,
    );
  }

  async listChangeHistory(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ChangeIntelligenceState[]> {
    this.requireCapability(input.actorRole, "change.read");
    return this.deps.repository.listChangeStates(
      input.tenantId,
      input.workspaceId,
      input.projectId,
    );
  }

  async listChangeCandidates(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ChangeCandidate[]> {
    this.requireCapability(input.actorRole, "change.read");
    return this.deps.repository.listChangeCandidates(
      input.tenantId,
      input.workspaceId,
      input.projectId,
    );
  }

  async getLatestCost(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    accountId: string;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<CostIntelligenceState | undefined> {
    this.requireCapability(input.actorRole, "cost.read");
    return this.deps.repository.latestCostState(
      input.tenantId,
      input.workspaceId,
      input.scope,
      input.accountId,
      input.asOf,
    );
  }

  async listCostHistory(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<CostIntelligenceState[]> {
    this.requireCapability(input.actorRole, "cost.read");
    return this.deps.repository.listCostStates(
      input.tenantId,
      input.workspaceId,
      input.projectId,
    );
  }

  async getLatestProductivity(input: {
    tenantId: string;
    workspaceId: string;
    scope: ProjectScopeRef;
    controlUnitId: string;
    actorRole: ProjectControlsRole;
    asOf?: string;
  }): Promise<ProductivityAssessmentState | undefined> {
    this.requireCapability(input.actorRole, "productivity.read");
    return this.deps.repository.latestProductivityState(
      input.tenantId,
      input.workspaceId,
      input.scope,
      input.controlUnitId,
      input.asOf,
    );
  }

  async listProductivityHistory(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ProductivityAssessmentState[]> {
    this.requireCapability(input.actorRole, "productivity.read");
    return this.deps.repository.listProductivityStates(
      input.tenantId,
      input.workspaceId,
      input.projectId,
    );
  }

  async listProjectSnapshots(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ProjectSnapshot[]> {
    this.requireCapability(input.actorRole, "snapshot.read");
    return this.deps.repository.listProjectSnapshots(
      input.tenantId,
      input.workspaceId,
      input.projectId,
    );
  }

  async listProjectTimeline(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ProjectTimelineEvent[]> {
    this.requireCapability(input.actorRole, "profile.read");
    return this.deps.repository.listProjectTimeline(
      input.tenantId,
      input.workspaceId,
      input.projectId,
    );
  }

  async getLatestProjectProfile(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    actorRole: ProjectControlsRole;
  }): Promise<ProjectProfile | undefined> {
    this.requireCapability(input.actorRole, "profile.read");
    return this.deps.repository.latestProjectProfile(
      input.tenantId,
      input.workspaceId,
      input.projectId,
    );
  }

  // ------------------------------------------------------------------ helpers

  private requireCapability(
    role: ProjectControlsRole,
    capability: ProjectControlsCapability,
  ): void {
    assertProjectControlsCapability(role, capability);
  }

  private async resolveProject(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
  }): Promise<ProjectReference> {
    return requireProjectReference(this.deps.projectDomainPort, {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
    });
  }

  private async replay<T>(
    command: { tenantId: string; workspaceId: string; idempotencyKey?: string },
    operation: string,
  ): Promise<T | null> {
    if (!command.idempotencyKey) return null;
    const existing = await this.deps.repository.findIdempotency(
      command.tenantId,
      command.workspaceId,
      command.idempotencyKey,
    );
    if (!existing || existing.operation !== operation) return null;
    return { ...(existing.responsePayload as T), idempotentReplay: true } as T;
  }

  private async recordIdempotency(
    command: { tenantId: string; workspaceId: string; idempotencyKey?: string },
    operation: string,
    resourceId: string,
    payload: unknown,
  ): Promise<void> {
    if (!command.idempotencyKey) return;
    const record: IdempotencyRecord = {
      tenantId: command.tenantId,
      workspaceId: command.workspaceId,
      idempotencyKey: command.idempotencyKey,
      operation,
      resourceId,
      responsePayload: payload as Record<string, unknown>,
      createdAt: new Date().toISOString(),
    };
    await this.deps.repository.saveIdempotency(record);
  }

  private async captureSnapshot(
    state: ProgressAssessmentState,
    asOf: string,
  ): Promise<ProgressSnapshot> {
    const snapshot: ProgressSnapshot = {
      snapshotId: this.deps.repository.newId("pcsnap"),
      schemaVersion: "project_controls_progress_snapshot/1",
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.scope,
      capturedAt: asOf,
      assessmentStateId: state.stateId,
      status: state.status,
      assessmentClass: state.assessmentClass,
      indicatedCompletion: state.indicatedCompletion,
      band: state.band,
      confidenceClass: state.confidence.confidenceClass,
      dataSufficiency: state.confidence.dataSufficiency,
      evidenceRefs: state.evidenceRefs,
      projectReferenceResolved: true,
      isProjectRegistry: false,
      mutatesProjectIdentity: false,
    };
    return this.deps.repository.saveProgressSnapshot(snapshot);
  }

  private async appendTimeline(
    state: ProgressAssessmentState,
    kind: ProgressTimelineEvent["kind"],
    options: { actorId?: string; recordedAt: string; detail?: string },
  ): Promise<void> {
    await this.deps.repository.appendProgressTimeline({
      entryId: this.deps.repository.newId("pctimeline"),
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.scope,
      stateId: state.stateId,
      kind,
      eventType: `engineering.project.progress.${kind === "progress_published" ? "published" : kind === "progress_reviewed" ? "reviewed" : "updated"}`,
      recordedAt: options.recordedAt,
      sourceKey: PROGRESS_SOURCE_KEY,
      actorId: options.actorId,
      detail: options.detail,
      governance: {
        advisoryOnly: true,
        earnedValueComputed: false,
        criticalPathComputed: false,
        mutatesProjectIdentity: false,
      },
    });
  }

  private async emit(
    eventType:
      | "engineering.project.progress.updated"
      | "engineering.project.progress.reviewed"
      | "engineering.project.progress.published",
    state: ProgressAssessmentState,
    correlationId?: string,
  ): Promise<void> {
    const event = createProjectControlsEvent({
      eventId: this.deps.repository.newId("pcevent"),
      eventType,
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.scope,
      stateId: state.stateId,
      occurredAt: state.recordedAt,
      correlationId,
      payload: progressEventPayload(state),
    });
    await this.deps.repository.enqueueOutbox({
      outboxId: this.deps.repository.newId("pcoutbox"),
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      eventType,
      payload: event.payload,
      correlationId,
      stateId: state.stateId,
      published: false,
      createdAt: state.recordedAt,
    });
    await this.deps.events.publish(event);
  }

  private async captureScheduleSnapshot(
    state: ScheduleAssessmentState,
    asOf: string,
  ): Promise<ScheduleSnapshot> {
    const snapshot: ScheduleSnapshot = {
      snapshotId: this.deps.repository.newId("pcschedsnap"),
      schemaVersion: "project_controls_schedule_snapshot/1",
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.scope,
      capturedAt: asOf,
      assessmentStateId: state.stateId,
      status: state.status,
      assessmentClass: state.assessmentClass,
      milestonePosture: state.milestonePosture,
      confidenceClass: state.confidence.confidenceClass,
      dataSufficiency: state.confidence.dataSufficiency,
      evidenceRefs: state.evidenceRefs,
      projectReferenceResolved: true,
      isProjectRegistry: false,
      mutatesProjectIdentity: false,
      criticalPathComputed: false,
      floatComputed: false,
    };
    return this.deps.repository.saveScheduleSnapshot(snapshot);
  }

  private async appendScheduleTimeline(
    state: ScheduleAssessmentState,
    kind: ScheduleTimelineEvent["kind"],
    options: { actorId?: string; recordedAt: string; detail?: string },
  ): Promise<void> {
    await this.deps.repository.appendScheduleTimeline({
      entryId: this.deps.repository.newId("pcschedtimeline"),
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.scope,
      stateId: state.stateId,
      kind,
      eventType: `engineering.project.schedule.${kind === "schedule_published" ? "published" : kind === "schedule_reviewed" ? "reviewed" : "updated"}`,
      recordedAt: options.recordedAt,
      sourceKey: SCHEDULE_SOURCE_KEY,
      actorId: options.actorId,
      detail: options.detail,
      governance: {
        advisoryOnly: true,
        earnedValueComputed: false,
        criticalPathComputed: false,
        floatComputed: false,
        mutatesProjectIdentity: false,
      },
    });
  }

  private async emitSchedule(
    eventType:
      | "engineering.project.schedule.updated"
      | "engineering.project.schedule.reviewed"
      | "engineering.project.schedule.published",
    state: ScheduleAssessmentState,
    correlationId?: string,
  ): Promise<void> {
    const event = createProjectControlsEvent({
      eventId: this.deps.repository.newId("pcevent"),
      eventType,
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.scope,
      stateId: state.stateId,
      occurredAt: state.recordedAt,
      correlationId,
      payload: scheduleEventPayload(state),
    });
    await this.deps.repository.enqueueOutbox({
      outboxId: this.deps.repository.newId("pcoutbox"),
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      eventType,
      payload: event.payload,
      correlationId,
      stateId: state.stateId,
      published: false,
      createdAt: state.recordedAt,
    });
    await this.deps.events.publish(event);
  }

  private async appendProjectTimeline(input: {
    tenantId: string;
    workspaceId: string;
    projectId: string;
    stateId?: string;
    kind: ProjectTimelineEvent["kind"];
    eventType: string;
    recordedAt: string;
    actorId?: string;
    detail?: string;
    sourceKey?: string;
  }): Promise<void> {
    await this.deps.repository.appendProjectTimeline({
      entryId: this.deps.repository.newId("pcprojtimeline"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      stateId: input.stateId,
      kind: input.kind,
      eventType: input.eventType,
      recordedAt: input.recordedAt,
      sourceKey: input.sourceKey ?? CHANGE_SOURCE_KEY,
      actorId: input.actorId,
      detail: input.detail,
      governance: PROJECT_TIMELINE_GOVERNANCE,
    });
  }

  private async emitChangeState(
    eventType:
      | "engineering.project.change.assessed"
      | "engineering.project.change.reviewed"
      | "engineering.project.change.published"
      | "engineering.project.change.superseded",
    state: ChangeIntelligenceState,
    correlationId?: string,
  ): Promise<void> {
    await this.emitChangeEvent({
      eventType,
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.scope,
      stateId: state.stateId,
      occurredAt: state.recordedAt,
      correlationId,
      payload: changeEventPayload(state),
    });
  }

  private async emitChangeEvent(input: {
    eventType:
      | "engineering.project.change.assessed"
      | "engineering.project.change.reviewed"
      | "engineering.project.change.published"
      | "engineering.project.change.superseded"
      | "engineering.project.change_candidate.created"
      | "engineering.project.snapshot.created";
    tenantId: string;
    workspaceId: string;
    projectId: string;
    scope?: ProjectScopeRef;
    stateId: string;
    occurredAt: string;
    correlationId?: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const event = createProjectControlsEvent({
      eventId: this.deps.repository.newId("pcevent"),
      eventType: input.eventType,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      stateId: input.stateId,
      occurredAt: input.occurredAt,
      correlationId: input.correlationId,
      payload: input.payload,
    });
    await this.deps.repository.enqueueOutbox({
      outboxId: this.deps.repository.newId("pcoutbox"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      eventType: input.eventType,
      payload: event.payload,
      correlationId: input.correlationId,
      stateId: input.stateId,
      published: false,
      createdAt: input.occurredAt,
    });
    await this.deps.events.publish(event);
  }

  private async resolveChangeIntelligenceRefs(
    tenantId: string,
    workspaceId: string,
    stateIds: readonly string[] | undefined,
  ): Promise<ChangeIntelligenceState[]> {
    if (!stateIds || stateIds.length === 0) return [];
    const states: ChangeIntelligenceState[] = [];
    for (const stateId of stateIds) {
      const state = await this.deps.repository.getChangeStateById(
        tenantId,
        workspaceId,
        stateId,
      );
      if (state) states.push(state);
    }
    return states;
  }

  private async emitCostState(
    eventType:
      | "engineering.project.cost.assessed"
      | "engineering.project.cost.reviewed"
      | "engineering.project.cost.published"
      | "engineering.project.cost.superseded"
      | "engineering.project.cost.variance_attributed",
    state: CostIntelligenceState,
    correlationId?: string,
  ): Promise<void> {
    await this.emitCostEvent({
      eventType,
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.controlContext.scope,
      stateId: state.stateId,
      occurredAt: state.recordedAt,
      correlationId,
      payload: costEventPayload(state),
    });
  }

  private async emitCostEvent(input: {
    eventType:
      | "engineering.project.cost.assessed"
      | "engineering.project.cost.reviewed"
      | "engineering.project.cost.published"
      | "engineering.project.cost.superseded"
      | "engineering.project.cost.variance_attributed"
      | "engineering.project.snapshot.created";
    tenantId: string;
    workspaceId: string;
    projectId: string;
    scope?: ProjectScopeRef;
    stateId: string;
    occurredAt: string;
    correlationId?: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const event = createProjectControlsEvent({
      eventId: this.deps.repository.newId("pcevent"),
      eventType: input.eventType,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      stateId: input.stateId,
      occurredAt: input.occurredAt,
      correlationId: input.correlationId,
      payload: input.payload,
    });
    await this.deps.repository.enqueueOutbox({
      outboxId: this.deps.repository.newId("pcoutbox"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      eventType: input.eventType,
      payload: event.payload,
      correlationId: input.correlationId,
      stateId: input.stateId,
      published: false,
      createdAt: input.occurredAt,
    });
    await this.deps.events.publish(event);
  }

  private async emitProductivityState(
    eventType:
      | "engineering.project.productivity.updated"
      | "engineering.project.productivity.reviewed"
      | "engineering.project.productivity.published",
    state: ProductivityAssessmentState,
    correlationId?: string,
  ): Promise<void> {
    await this.emitProductivityEvent({
      eventType,
      tenantId: state.tenantId,
      workspaceId: state.workspaceId,
      projectId: state.projectId,
      scope: state.controlContext.scope,
      stateId: state.stateId,
      occurredAt: state.recordedAt,
      correlationId,
      payload: productivityEventPayload(state),
    });
  }

  private async emitProductivityEvent(input: {
    eventType:
      | "engineering.project.productivity.updated"
      | "engineering.project.productivity.reviewed"
      | "engineering.project.productivity.published";
    tenantId: string;
    workspaceId: string;
    projectId: string;
    scope?: ProjectScopeRef;
    stateId: string;
    occurredAt: string;
    correlationId?: string;
    payload: Record<string, unknown>;
  }): Promise<void> {
    const event = createProjectControlsEvent({
      eventId: this.deps.repository.newId("pcevent"),
      eventType: input.eventType,
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      scope: input.scope,
      stateId: input.stateId,
      occurredAt: input.occurredAt,
      correlationId: input.correlationId,
      payload: input.payload,
    });
    await this.deps.repository.enqueueOutbox({
      outboxId: this.deps.repository.newId("pcoutbox"),
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      eventType: input.eventType,
      payload: event.payload,
      correlationId: input.correlationId,
      stateId: input.stateId,
      published: false,
      createdAt: input.occurredAt,
    });
    await this.deps.events.publish(event);
  }
}

export function createProjectControlsEngine(
  deps: ProjectControlsEngineDeps,
): ProjectControlsEngine {
  return new ProjectControlsEngine(deps);
}

function reviewOutcomeFor(action: ProgressReviewAction): ProgressReviewOutcome {
  switch (action) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "request_changes":
      return "changes_requested";
    case "resubmit":
      return "resubmitted";
    case "publish":
      return "approved";
  }
}

function scheduleReviewOutcomeFor(action: ScheduleReviewAction): ScheduleReviewOutcome {
  switch (action) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "request_changes":
      return "changes_requested";
    case "resubmit":
      return "resubmitted";
    case "publish":
      return "approved";
  }
}

/** Highest version per scope, so the profile never double-counts a scope. */
function latestPerScope(
  states: readonly ProgressAssessmentState[],
): ProgressAssessmentState[] {
  const byScope = new Map<string, ProgressAssessmentState>();
  for (const state of states) {
    const key = scopeKey(state.scope);
    const current = byScope.get(key);
    if (!current || state.version > current.version) byScope.set(key, state);
  }
  return [...byScope.values()];
}

function latestPerScopeSchedule(
  states: readonly ScheduleAssessmentState[],
): ScheduleAssessmentState[] {
  const byScope = new Map<string, ScheduleAssessmentState>();
  for (const state of states) {
    const key = scopeKey(state.scope);
    const current = byScope.get(key);
    if (!current || state.version > current.version) byScope.set(key, state);
  }
  return [...byScope.values()];
}

/** One change thread per scope + change class, so a profile counts each once. */
function latestPerChangeThread(
  states: readonly ChangeIntelligenceState[],
): ChangeIntelligenceState[] {
  const byThread = new Map<string, ChangeIntelligenceState>();
  for (const state of states) {
    const key = changeStateKey(state.scope, state.changeClass);
    const current = byThread.get(key);
    if (!current || state.version > current.version) byThread.set(key, state);
  }
  return [...byThread.values()];
}

/** One cost thread per scope + account, so a profile counts each once. */
function latestPerCostThread(
  states: readonly CostIntelligenceState[],
): CostIntelligenceState[] {
  const byThread = new Map<string, CostIntelligenceState>();
  for (const state of states) {
    const key = costStateKey(
      state.controlContext.scope,
      state.controlContext.accountRef.accountId,
    );
    const current = byThread.get(key);
    if (!current || state.version > current.version) byThread.set(key, state);
  }
  return [...byThread.values()];
}

function changeReviewOutcomeFor(action: ChangeReviewAction): ChangeReviewOutcome {
  switch (action) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "request_changes":
      return "changes_requested";
    case "resubmit":
      return "resubmitted";
    case "publish":
      return "approved";
  }
}

function costReviewOutcomeFor(action: CostReviewAction): CostReviewOutcome {
  switch (action) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "request_changes":
      return "changes_requested";
    case "resubmit":
      return "resubmitted";
    case "publish":
      return "approved";
  }
}

function productivityReviewOutcomeFor(action: ProductivityReviewAction): ProductivityReviewOutcome {
  switch (action) {
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "request_changes":
      return "changes_requested";
    case "resubmit":
      return "resubmitted";
    case "publish":
      return "approved";
  }
}

function latestPerProductivityThread(
  states: readonly ProductivityAssessmentState[],
): ProductivityAssessmentState[] {
  const byThread = new Map<string, ProductivityAssessmentState>();
  for (const state of states) {
    const key = productivityStateKey(
      state.controlContext.scope,
      state.controlContext.controlUnitId,
    );
    const current = byThread.get(key);
    if (!current || state.version > current.version) byThread.set(key, state);
  }
  return [...byThread.values()];
}
