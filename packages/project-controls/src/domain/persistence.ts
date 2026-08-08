/**
 * Phase 11E — Project Controls persistence port and memory adapter.
 *
 * The memory adapter exists for tests and certification units only;
 * `assertProductionRepositorySafe` makes choosing it in production a throw
 * rather than a silent data-loss bug.
 */

import { randomUUID } from "node:crypto";
import type {
  ProgressAssessmentState,
  ProgressEvidence,
  ProgressReviewRecord,
  ProgressSnapshot,
  ProgressTimelineEvent,
  ProjectProfile,
  ProjectScopeRef,
} from "./progress";
import { scopeKey } from "./progress";
import type {
  ScheduleAssessmentState,
  ScheduleEvidence,
  ScheduleReviewRecord,
  ScheduleSnapshot,
  ScheduleTimelineEvent,
} from "./schedule";
import type {
  ChangeCandidate,
  ChangeClassification,
  ChangeConfidence,
  ChangeEvidence,
  ChangeIntelligenceState,
  ChangeReviewRecord,
  ProjectSnapshot,
  ProjectTimelineEvent,
} from "./change";
import { changeStateKey } from "./change";
import type {
  CostConfidence,
  CostEvidence,
  CostIntelligenceState,
  CostReviewRecord,
} from "./cost";
import { costStateKey } from "./cost";
import type { ProjectControlsEvent } from "./events";
import { PRODUCTION_MEMORY_REPOSITORY_ALLOWED as VERSION_MEMORY_LOCK } from "../version";

export type PersistedProgressEvidence = ProgressEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  assessmentStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedProgressAssessment = ProgressAssessmentState;
export type PersistedProgressReview = ProgressReviewRecord;
export type PersistedProgressSnapshot = ProgressSnapshot;
export type PersistedProgressTimelineEvent = ProgressTimelineEvent;
export type PersistedProjectProfile = ProjectProfile;

export type PersistedScheduleEvidence = ScheduleEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  assessmentStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedScheduleAssessment = ScheduleAssessmentState;
export type PersistedScheduleReview = ScheduleReviewRecord;
export type PersistedScheduleSnapshot = ScheduleSnapshot;
export type PersistedScheduleTimelineEvent = ScheduleTimelineEvent;

export type PersistedChangeEvidence = ChangeEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  scope: ProjectScopeRef;
  changeStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedChangeState = ChangeIntelligenceState;
export type PersistedChangeCandidate = ChangeCandidate;
export type PersistedChangeReview = ChangeReviewRecord;
export type PersistedChangeConfidence = ChangeConfidence & {
  changeStateId: string;
  recordedAt: string;
};

export type PersistedCostEvidence = CostEvidence & {
  tenantId: string;
  workspaceId: string;
  projectId: string;
  costStateId: string;
  recordedAt: string;
  createdBy?: string;
};

export type PersistedCostState = CostIntelligenceState;
export type PersistedCostReview = CostReviewRecord;
export type PersistedCostConfidence = CostConfidence & {
  costStateId: string;
  recordedAt: string;
};

export type PersistedProjectSnapshot = ProjectSnapshot;
export type PersistedProjectTimelineEvent = ProjectTimelineEvent;

export type IdempotencyRecord = {
  tenantId: string;
  workspaceId: string;
  idempotencyKey: string;
  operation: string;
  resourceId?: string;
  responsePayload: Record<string, unknown>;
  createdAt: string;
};

export type OutboxEventRecord = {
  outboxId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  eventType: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  stateId?: string;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
};

export type ProjectControlsRepositoryPort = {
  readonly adapterKind: "memory" | "postgres";
  newId(prefix: string): string;

  saveProgressAssessment(
    state: PersistedProgressAssessment,
  ): Promise<PersistedProgressAssessment>;
  getProgressAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedProgressAssessment | null>;
  latestProgressAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedProgressAssessment | undefined>;
  listProgressAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressAssessment[]>;
  nextProgressAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number>;

  saveProgressEvidence(
    evidence: readonly PersistedProgressEvidence[],
  ): Promise<PersistedProgressEvidence[]>;
  listProgressEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedProgressEvidence[]>;

  saveProgressReview(review: PersistedProgressReview): Promise<PersistedProgressReview>;
  listProgressReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedProgressReview[]>;

  saveProgressSnapshot(snapshot: PersistedProgressSnapshot): Promise<PersistedProgressSnapshot>;
  listProgressSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressSnapshot[]>;

  appendProgressTimeline(
    entry: PersistedProgressTimelineEvent,
  ): Promise<PersistedProgressTimelineEvent>;
  listProgressTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressTimelineEvent[]>;

  saveScheduleAssessment(
    state: PersistedScheduleAssessment,
  ): Promise<PersistedScheduleAssessment>;
  getScheduleAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedScheduleAssessment | null>;
  latestScheduleAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedScheduleAssessment | undefined>;
  listScheduleAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleAssessment[]>;
  nextScheduleAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number>;

  saveScheduleEvidence(
    evidence: readonly PersistedScheduleEvidence[],
  ): Promise<PersistedScheduleEvidence[]>;
  listScheduleEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedScheduleEvidence[]>;

  saveScheduleReview(review: PersistedScheduleReview): Promise<PersistedScheduleReview>;
  listScheduleReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedScheduleReview[]>;

  saveScheduleSnapshot(snapshot: PersistedScheduleSnapshot): Promise<PersistedScheduleSnapshot>;
  listScheduleSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleSnapshot[]>;

  appendScheduleTimeline(
    entry: PersistedScheduleTimelineEvent,
  ): Promise<PersistedScheduleTimelineEvent>;
  listScheduleTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleTimelineEvent[]>;

  saveChangeState(state: PersistedChangeState): Promise<PersistedChangeState>;
  getChangeStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedChangeState | null>;
  latestChangeState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    asOf?: string,
  ): Promise<PersistedChangeState | undefined>;
  listChangeStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeState[]>;
  nextChangeStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    expectedVersion?: number,
  ): Promise<number>;

  saveChangeEvidence(
    evidence: readonly PersistedChangeEvidence[],
  ): Promise<PersistedChangeEvidence[]>;
  listChangeEvidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeEvidence[]>;

  saveChangeReview(review: PersistedChangeReview): Promise<PersistedChangeReview>;
  listChangeReviews(
    tenantId: string,
    workspaceId: string,
    changeStateId?: string,
  ): Promise<PersistedChangeReview[]>;

  saveChangeConfidence(
    confidence: PersistedChangeConfidence,
  ): Promise<PersistedChangeConfidence>;
  listChangeConfidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeConfidence[]>;

  saveChangeCandidate(candidate: PersistedChangeCandidate): Promise<PersistedChangeCandidate>;
  getChangeCandidateById(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedChangeCandidate | null>;
  listChangeCandidates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeCandidate[]>;

  saveCostState(state: PersistedCostState): Promise<PersistedCostState>;
  getCostStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedCostState | null>;
  latestCostState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    asOf?: string,
  ): Promise<PersistedCostState | undefined>;
  listCostStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedCostState[]>;
  nextCostStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    expectedVersion?: number,
  ): Promise<number>;

  saveCostEvidence(
    evidence: readonly PersistedCostEvidence[],
  ): Promise<PersistedCostEvidence[]>;
  listCostEvidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostEvidence[]>;

  saveCostReview(review: PersistedCostReview): Promise<PersistedCostReview>;
  listCostReviews(
    tenantId: string,
    workspaceId: string,
    costStateId?: string,
  ): Promise<PersistedCostReview[]>;

  saveCostConfidence(confidence: PersistedCostConfidence): Promise<PersistedCostConfidence>;
  listCostConfidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostConfidence[]>;

  saveProjectSnapshot(snapshot: PersistedProjectSnapshot): Promise<PersistedProjectSnapshot>;
  getProjectSnapshotById(
    tenantId: string,
    workspaceId: string,
    snapshotId: string,
  ): Promise<PersistedProjectSnapshot | null>;
  listProjectSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectSnapshot[]>;

  appendProjectTimeline(
    entry: PersistedProjectTimelineEvent,
  ): Promise<PersistedProjectTimelineEvent>;
  listProjectTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectTimelineEvent[]>;

  saveProjectProfile(profile: PersistedProjectProfile): Promise<PersistedProjectProfile>;
  latestProjectProfile(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectProfile | undefined>;
  nextProjectProfileVersion(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<number>;

  findIdempotency(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | null>;
  saveIdempotency(record: IdempotencyRecord): Promise<IdempotencyRecord>;

  enqueueOutbox(record: OutboxEventRecord): Promise<OutboxEventRecord>;
  listOutbox(tenantId: string, workspaceId: string): Promise<OutboxEventRecord[]>;
};

export type DurableProjectControlsStore = {
  progressAssessments: PersistedProgressAssessment[];
  progressEvidence: PersistedProgressEvidence[];
  progressReviews: PersistedProgressReview[];
  progressSnapshots: PersistedProgressSnapshot[];
  progressTimeline: PersistedProgressTimelineEvent[];
  scheduleAssessments: PersistedScheduleAssessment[];
  scheduleEvidence: PersistedScheduleEvidence[];
  scheduleReviews: PersistedScheduleReview[];
  scheduleSnapshots: PersistedScheduleSnapshot[];
  scheduleTimeline: PersistedScheduleTimelineEvent[];
  changeStates: PersistedChangeState[];
  changeEvidence: PersistedChangeEvidence[];
  changeReviews: PersistedChangeReview[];
  changeConfidence: PersistedChangeConfidence[];
  changeCandidates: PersistedChangeCandidate[];
  costStates: PersistedCostState[];
  costEvidence: PersistedCostEvidence[];
  costReviews: PersistedCostReview[];
  costConfidence: PersistedCostConfidence[];
  projectSnapshots: PersistedProjectSnapshot[];
  projectTimeline: PersistedProjectTimelineEvent[];
  projectProfiles: PersistedProjectProfile[];
  idempotency: IdempotencyRecord[];
  outbox: OutboxEventRecord[];
  events: ProjectControlsEvent[];
};

export function createDurableProjectControlsMemoryStore(): DurableProjectControlsStore {
  return {
    progressAssessments: [],
    progressEvidence: [],
    progressReviews: [],
    progressSnapshots: [],
    progressTimeline: [],
    scheduleAssessments: [],
    scheduleEvidence: [],
    scheduleReviews: [],
    scheduleSnapshots: [],
    scheduleTimeline: [],
    changeStates: [],
    changeEvidence: [],
    changeReviews: [],
    changeConfidence: [],
    changeCandidates: [],
    costStates: [],
    costEvidence: [],
    costReviews: [],
    costConfidence: [],
    projectSnapshots: [],
    projectTimeline: [],
    projectProfiles: [],
    idempotency: [],
    outbox: [],
    events: [],
  };
}

function latestAsOf<T extends { recordedAt: string; version: number }>(
  rows: T[],
  asOf?: string,
): T | undefined {
  const filtered = asOf
    ? rows.filter((row) => Date.parse(row.recordedAt) <= Date.parse(asOf))
    : rows;
  return [...filtered].sort(
    (a, b) => b.version - a.version || Date.parse(b.recordedAt) - Date.parse(a.recordedAt),
  )[0];
}

function assertNextVersion(current: number, expectedVersion?: number): void {
  if (expectedVersion !== undefined && expectedVersion !== current) {
    throw new Error(`optimistic_lock_conflict:expected=${expectedVersion};actual=${current}`);
  }
}

/** Test/certification unit adapter only — not for production. */
export class MemoryProjectControlsRepository implements ProjectControlsRepositoryPort {
  readonly adapterKind = "memory" as const;

  constructor(private readonly store: DurableProjectControlsStore) {}

  newId(_prefix: string): string {
    return randomUUID();
  }

  getStore(): DurableProjectControlsStore {
    return this.store;
  }

  async saveProgressAssessment(
    state: PersistedProgressAssessment,
  ): Promise<PersistedProgressAssessment> {
    const clash = this.store.progressAssessments.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        scopeKey(row.scope) === scopeKey(state.scope) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:version=${state.version}`);
    }
    this.store.progressAssessments.push(state);
    return state;
  }

  async getProgressAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedProgressAssessment | null> {
    return (
      this.store.progressAssessments.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestProgressAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedProgressAssessment | undefined> {
    return latestAsOf(
      this.store.progressAssessments.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          scopeKey(row.scope) === scopeKey(scope),
      ),
      asOf,
    );
  }

  async listProgressAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressAssessment[]> {
    return this.store.progressAssessments.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextProgressAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestProgressAssessment(tenantId, workspaceId, scope);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveProgressEvidence(
    evidence: readonly PersistedProgressEvidence[],
  ): Promise<PersistedProgressEvidence[]> {
    this.store.progressEvidence.push(...evidence);
    return [...evidence];
  }

  async listProgressEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedProgressEvidence[]> {
    return this.store.progressEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.assessmentStateId === assessmentStateId,
    );
  }

  async saveProgressReview(review: PersistedProgressReview): Promise<PersistedProgressReview> {
    this.store.progressReviews.push(review);
    return review;
  }

  async listProgressReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedProgressReview[]> {
    return this.store.progressReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!assessmentStateId || row.assessmentStateId === assessmentStateId),
    );
  }

  async saveProgressSnapshot(
    snapshot: PersistedProgressSnapshot,
  ): Promise<PersistedProgressSnapshot> {
    this.store.progressSnapshots.push(snapshot);
    return snapshot;
  }

  async listProgressSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressSnapshot[]> {
    return this.store.progressSnapshots.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async appendProgressTimeline(
    entry: PersistedProgressTimelineEvent,
  ): Promise<PersistedProgressTimelineEvent> {
    this.store.progressTimeline.push(entry);
    return entry;
  }

  async listProgressTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProgressTimelineEvent[]> {
    return this.store.progressTimeline.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async saveScheduleAssessment(
    state: PersistedScheduleAssessment,
  ): Promise<PersistedScheduleAssessment> {
    const clash = this.store.scheduleAssessments.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        scopeKey(row.scope) === scopeKey(state.scope) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:version=${state.version}`);
    }
    this.store.scheduleAssessments.push(state);
    return state;
  }

  async getScheduleAssessmentById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedScheduleAssessment | null> {
    return (
      this.store.scheduleAssessments.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestScheduleAssessment(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    asOf?: string,
  ): Promise<PersistedScheduleAssessment | undefined> {
    return latestAsOf(
      this.store.scheduleAssessments.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          scopeKey(row.scope) === scopeKey(scope),
      ),
      asOf,
    );
  }

  async listScheduleAssessments(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleAssessment[]> {
    return this.store.scheduleAssessments.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextScheduleAssessmentVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestScheduleAssessment(tenantId, workspaceId, scope);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveScheduleEvidence(
    evidence: readonly PersistedScheduleEvidence[],
  ): Promise<PersistedScheduleEvidence[]> {
    this.store.scheduleEvidence.push(...evidence);
    return [...evidence];
  }

  async listScheduleEvidence(
    tenantId: string,
    workspaceId: string,
    assessmentStateId: string,
  ): Promise<PersistedScheduleEvidence[]> {
    return this.store.scheduleEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.assessmentStateId === assessmentStateId,
    );
  }

  async saveScheduleReview(review: PersistedScheduleReview): Promise<PersistedScheduleReview> {
    this.store.scheduleReviews.push(review);
    return review;
  }

  async listScheduleReviews(
    tenantId: string,
    workspaceId: string,
    assessmentStateId?: string,
  ): Promise<PersistedScheduleReview[]> {
    return this.store.scheduleReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!assessmentStateId || row.assessmentStateId === assessmentStateId),
    );
  }

  async saveScheduleSnapshot(
    snapshot: PersistedScheduleSnapshot,
  ): Promise<PersistedScheduleSnapshot> {
    this.store.scheduleSnapshots.push(snapshot);
    return snapshot;
  }

  async listScheduleSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleSnapshot[]> {
    return this.store.scheduleSnapshots.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async appendScheduleTimeline(
    entry: PersistedScheduleTimelineEvent,
  ): Promise<PersistedScheduleTimelineEvent> {
    this.store.scheduleTimeline.push(entry);
    return entry;
  }

  async listScheduleTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedScheduleTimelineEvent[]> {
    return this.store.scheduleTimeline.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async saveChangeState(state: PersistedChangeState): Promise<PersistedChangeState> {
    const clash = this.store.changeStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        changeStateKey(row.scope, row.changeClass) ===
          changeStateKey(state.scope, state.changeClass) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:change_version=${state.version}`);
    }
    this.store.changeStates.push(state);
    return state;
  }

  async getChangeStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedChangeState | null> {
    return (
      this.store.changeStates.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestChangeState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    asOf?: string,
  ): Promise<PersistedChangeState | undefined> {
    return latestAsOf(
      this.store.changeStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          changeStateKey(row.scope, row.changeClass) === changeStateKey(scope, changeClass),
      ),
      asOf,
    );
  }

  async listChangeStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeState[]> {
    return this.store.changeStates.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextChangeStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    changeClass: ChangeClassification,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestChangeState(tenantId, workspaceId, scope, changeClass);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveChangeEvidence(
    evidence: readonly PersistedChangeEvidence[],
  ): Promise<PersistedChangeEvidence[]> {
    this.store.changeEvidence.push(...evidence);
    return [...evidence];
  }

  async listChangeEvidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeEvidence[]> {
    return this.store.changeEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.changeStateId === changeStateId,
    );
  }

  async saveChangeReview(review: PersistedChangeReview): Promise<PersistedChangeReview> {
    this.store.changeReviews.push(review);
    return review;
  }

  async listChangeReviews(
    tenantId: string,
    workspaceId: string,
    changeStateId?: string,
  ): Promise<PersistedChangeReview[]> {
    return this.store.changeReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!changeStateId || row.changeStateId === changeStateId),
    );
  }

  async saveChangeConfidence(
    confidence: PersistedChangeConfidence,
  ): Promise<PersistedChangeConfidence> {
    this.store.changeConfidence.push(confidence);
    return confidence;
  }

  async listChangeConfidence(
    tenantId: string,
    workspaceId: string,
    changeStateId: string,
  ): Promise<PersistedChangeConfidence[]> {
    return this.store.changeConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.changeStateId === changeStateId,
    );
  }

  async saveChangeCandidate(
    candidate: PersistedChangeCandidate,
  ): Promise<PersistedChangeCandidate> {
    this.store.changeCandidates.push(candidate);
    return candidate;
  }

  async getChangeCandidateById(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedChangeCandidate | null> {
    return (
      this.store.changeCandidates.find(
        (row) =>
          row.candidateId === candidateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async listChangeCandidates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedChangeCandidate[]> {
    return this.store.changeCandidates.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async saveCostState(state: PersistedCostState): Promise<PersistedCostState> {
    const accountId = state.controlContext.accountRef.accountId;
    const clash = this.store.costStates.find(
      (row) =>
        row.tenantId === state.tenantId &&
        row.workspaceId === state.workspaceId &&
        costStateKey(row.controlContext.scope, row.controlContext.accountRef.accountId) ===
          costStateKey(state.controlContext.scope, accountId) &&
        row.version === state.version,
    );
    if (clash) {
      throw new Error(`optimistic_lock_conflict:cost_version=${state.version}`);
    }
    this.store.costStates.push(state);
    return state;
  }

  async getCostStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedCostState | null> {
    return (
      this.store.costStates.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestCostState(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    asOf?: string,
  ): Promise<PersistedCostState | undefined> {
    return latestAsOf(
      this.store.costStates.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          costStateKey(row.controlContext.scope, row.controlContext.accountRef.accountId) ===
            costStateKey(scope, accountId),
      ),
      asOf,
    );
  }

  async listCostStates(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedCostState[]> {
    return this.store.costStates.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async nextCostStateVersion(
    tenantId: string,
    workspaceId: string,
    scope: ProjectScopeRef,
    accountId: string,
    expectedVersion?: number,
  ): Promise<number> {
    const latest = await this.latestCostState(tenantId, workspaceId, scope, accountId);
    const current = latest?.version ?? 0;
    assertNextVersion(current, expectedVersion);
    return current + 1;
  }

  async saveCostEvidence(
    evidence: readonly PersistedCostEvidence[],
  ): Promise<PersistedCostEvidence[]> {
    this.store.costEvidence.push(...evidence);
    return [...evidence];
  }

  async listCostEvidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostEvidence[]> {
    return this.store.costEvidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.costStateId === costStateId,
    );
  }

  async saveCostReview(review: PersistedCostReview): Promise<PersistedCostReview> {
    this.store.costReviews.push(review);
    return review;
  }

  async listCostReviews(
    tenantId: string,
    workspaceId: string,
    costStateId?: string,
  ): Promise<PersistedCostReview[]> {
    return this.store.costReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!costStateId || row.costStateId === costStateId),
    );
  }

  async saveCostConfidence(
    confidence: PersistedCostConfidence,
  ): Promise<PersistedCostConfidence> {
    this.store.costConfidence.push(confidence);
    return confidence;
  }

  async listCostConfidence(
    tenantId: string,
    workspaceId: string,
    costStateId: string,
  ): Promise<PersistedCostConfidence[]> {
    return this.store.costConfidence.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.costStateId === costStateId,
    );
  }

  async saveProjectSnapshot(
    snapshot: PersistedProjectSnapshot,
  ): Promise<PersistedProjectSnapshot> {
    const clash = this.store.projectSnapshots.find(
      (row) => row.snapshotId === snapshot.snapshotId,
    );
    if (clash) throw new Error("project_snapshot_is_immutable");
    this.store.projectSnapshots.push(snapshot);
    return snapshot;
  }

  async getProjectSnapshotById(
    tenantId: string,
    workspaceId: string,
    snapshotId: string,
  ): Promise<PersistedProjectSnapshot | null> {
    return (
      this.store.projectSnapshots.find(
        (row) =>
          row.snapshotId === snapshotId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async listProjectSnapshots(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectSnapshot[]> {
    return this.store.projectSnapshots.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async appendProjectTimeline(
    entry: PersistedProjectTimelineEvent,
  ): Promise<PersistedProjectTimelineEvent> {
    this.store.projectTimeline.push(entry);
    return entry;
  }

  async listProjectTimeline(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectTimelineEvent[]> {
    return this.store.projectTimeline.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.projectId === projectId,
    );
  }

  async saveProjectProfile(profile: PersistedProjectProfile): Promise<PersistedProjectProfile> {
    const clash = this.store.projectProfiles.find(
      (row) =>
        row.tenantId === profile.tenantId &&
        row.workspaceId === profile.workspaceId &&
        row.projectId === profile.projectId &&
        row.version === profile.version,
    );
    if (clash) throw new Error(`optimistic_lock_conflict:profile_version=${profile.version}`);
    this.store.projectProfiles.push(profile);
    return profile;
  }

  async latestProjectProfile(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<PersistedProjectProfile | undefined> {
    return latestAsOf(
      this.store.projectProfiles.filter(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          row.projectId === projectId,
      ),
    );
  }

  async nextProjectProfileVersion(
    tenantId: string,
    workspaceId: string,
    projectId: string,
  ): Promise<number> {
    const latest = await this.latestProjectProfile(tenantId, workspaceId, projectId);
    return (latest?.version ?? 0) + 1;
  }

  async findIdempotency(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<IdempotencyRecord | null> {
    return (
      this.store.idempotency.find(
        (row) =>
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId &&
          row.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async saveIdempotency(record: IdempotencyRecord): Promise<IdempotencyRecord> {
    this.store.idempotency.push(record);
    return record;
  }

  async enqueueOutbox(record: OutboxEventRecord): Promise<OutboxEventRecord> {
    this.store.outbox.push(record);
    return record;
  }

  async listOutbox(tenantId: string, workspaceId: string): Promise<OutboxEventRecord[]> {
    return this.store.outbox.filter(
      (row) => row.tenantId === tenantId && row.workspaceId === workspaceId,
    );
  }
}

export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = VERSION_MEMORY_LOCK;

export type RepositoryFactoryOptions = {
  adapter?: "memory" | "postgres";
  nodeEnv?: string;
  supabase?: unknown;
  memoryStore?: DurableProjectControlsStore;
};

export function assertProductionRepositorySafe(
  adapterKind: "memory" | "postgres",
  nodeEnv = process.env.NODE_ENV,
): void {
  if (nodeEnv === "production" && adapterKind === "memory") {
    throw new Error("production_memory_repository_forbidden");
  }
}
