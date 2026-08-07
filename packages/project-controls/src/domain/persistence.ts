/**
 * Phase 11B — Project Controls persistence port and memory adapter.
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
