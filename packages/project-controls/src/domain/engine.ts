/**
 * Phase 11C — Project Controls engine facade.
 *
 * Orchestrates the progress and schedule intelligence slices end to end:
 * capability check → identity resolution → confidence → assessment → review
 * start → versioned persistence → snapshot → timeline → outbox → events.
 *
 * Identity is always resolved through the Engineering Shared Project Domain
 * port. The engine has no write path into `engineering_projects`.
 */

import {
  requireProjectReference,
  type ProjectReference,
  type SharedProjectDomainPort,
} from "@rtb/engineering-shared-project-domain";
import type { EngineeringWorkflowInstance } from "@rtb/engineering-os";
import { assertOwnershipLock } from "../architecture/ownership-lock";
import {
  createProjectControlsEvent,
  profileEventPayload,
  progressEventPayload,
  scheduleEventPayload,
  type ProjectControlsEventPublishPort,
} from "./events";
import {
  assertProjectControlsCapability,
  type ProjectControlsCapability,
  type ProjectControlsRole,
} from "./role-matrix";
import type {
  IdempotencyRecord,
  PersistedProgressEvidence,
  PersistedScheduleEvidence,
  ProjectControlsRepositoryPort,
} from "./persistence";
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
  assertPublishable,
  assertSchedulePublishable,
  startProgressReview,
  startScheduleReview,
  transitionProgressReview,
  transitionScheduleReview,
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
  contextEngine?: ProjectContextEngine;
};

const PROGRESS_SOURCE_KEY = "project_controls.progress_intelligence" as const;
const SCHEDULE_SOURCE_KEY = "project_controls.schedule_intelligence" as const;

export class ProjectControlsEngine {
  private readonly progressEngine: ProgressIntelligenceEngine;
  private readonly scheduleEngine: ScheduleIntelligenceEngine;
  private readonly contextEngine: ProjectContextEngine;

  constructor(private readonly deps: ProjectControlsEngineDeps) {
    assertOwnershipLock();
    assertReservedProvidersUnimplemented();
    this.progressEngine =
      deps.progressEngine ??
      createProgressIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });
    this.scheduleEngine =
      deps.scheduleEngine ??
      createScheduleIntelligenceEngine({ newId: (p) => deps.repository.newId(p) });
    this.contextEngine =
      deps.contextEngine ?? createProjectContextEngine({ newId: (p) => deps.repository.newId(p) });
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
