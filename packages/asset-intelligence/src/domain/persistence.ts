/**
 * Phase 10B.1 / 10C — Asset Intelligence repository port (infrastructure-independent).
 */

import { randomUUID } from "node:crypto";
import type {
  AssetConditionState,
  AssetIdentityReference,
} from "../architecture/identity-state";
import type { AssetCriticalityStateRecord } from "./criticality";
import type { AssetHealthIndexState } from "./health-index";
import type { IntelligenceTimelineEntry } from "./timeline";
import type { AssetIntelligenceEvent } from "./events";
import type { AssetSnapshot } from "./snapshot";

export type ConditionLifecycleStatus = "observed" | "calculated" | "reviewed" | "published";

export type PersistedConditionState = AssetConditionState & {
  tenantId: string;
  workspaceId: string;
  version: number;
  status: ConditionLifecycleStatus;
  sourceType: string;
  sourceReference?: string;
  observedAt?: string;
  calculatedAt?: string;
  reviewedAt?: string;
  publishedAt?: string;
  createdBy?: string;
  supersedesId?: string;
};

export type PersistedCriticalityState = AssetCriticalityStateRecord & {
  tenantId: string;
  workspaceId: string;
  version: number;
  status: ConditionLifecycleStatus;
  sourceType: string;
  sourceReference?: string;
  createdBy?: string;
  supersedesId?: string;
  reviewedAt?: string;
  publishedAt?: string;
};

export type PersistedHealthIndexState = AssetHealthIndexState & {
  tenantId: string;
  workspaceId: string;
  version: number;
};

export type PersistedSnapshotRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  assetId: string;
  schemaVersion: string;
  capturedAt: string;
  conditionStateId?: string;
  healthIndex?: AssetHealthIndexState;
  identityReference: AssetIdentityReference;
  sourceSet: string[];
  timelinePosition?: string;
  snapshot: AssetSnapshot;
};

export type SourceProvenanceRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  assetId: string;
  sourceKey: string;
  sourceType: string;
  contractFamily?: string;
  contractVersion?: string;
  ownership: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type IdempotencyRecord = {
  tenantId: string;
  workspaceId: string;
  idempotencyKey: string;
  operation: string;
  resourceId?: string;
  requestHash?: string;
  responsePayload: Record<string, unknown>;
};

export type OutboxEventRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  assetId: string;
  eventType: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  stateId?: string;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
};

export type AssetIntelligenceRepositoryPort = {
  readonly adapterKind: "memory" | "postgres";
  newId(prefix: string): string;
  saveCondition(state: PersistedConditionState): Promise<PersistedConditionState>;
  getConditionById(
    tenantId: string,
    workspaceId: string,
    id: string,
  ): Promise<PersistedConditionState | null>;
  latestCondition(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedConditionState | undefined>;
  listConditionHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedConditionState[]>;
  saveHealthIndex(state: PersistedHealthIndexState): Promise<PersistedHealthIndexState>;
  latestHealthIndex(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedHealthIndexState | undefined>;
  saveCriticality(state: PersistedCriticalityState): Promise<PersistedCriticalityState>;
  latestCriticality(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedCriticalityState | undefined>;
  nextCriticalityVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number>;
  appendTimeline(entry: IntelligenceTimelineEntry): Promise<IntelligenceTimelineEntry>;
  listTimeline(assetId: string, asOf?: string): Promise<IntelligenceTimelineEntry[]>;
  saveSnapshot(record: PersistedSnapshotRecord): Promise<PersistedSnapshotRecord>;
  getSnapshot(
    tenantId: string,
    workspaceId: string,
    id: string,
  ): Promise<PersistedSnapshotRecord | null>;
  latestSnapshot(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedSnapshotRecord | undefined>;
  registerSourceProvenance(record: SourceProvenanceRecord): Promise<SourceProvenanceRecord>;
  findIdempotency(
    tenantId: string,
    workspaceId: string,
    key: string,
  ): Promise<IdempotencyRecord | null>;
  saveIdempotency(record: IdempotencyRecord): Promise<IdempotencyRecord>;
  appendOutbox(event: OutboxEventRecord): Promise<OutboxEventRecord>;
  markOutboxPublished(id: string, publishedAt: string): Promise<void>;
  appendEvent(event: AssetIntelligenceEvent): Promise<AssetIntelligenceEvent>;
  cacheIdentity(identity: AssetIdentityReference): Promise<void>;
  /** Optimistic concurrency: returns next version or throws on conflict. */
  nextConditionVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number>;
};

export type DurableAssetIntelligenceStore = {
  conditionStates: PersistedConditionState[];
  healthIndexStates: PersistedHealthIndexState[];
  criticalityStates: PersistedCriticalityState[];
  timeline: IntelligenceTimelineEntry[];
  events: AssetIntelligenceEvent[];
  snapshots: PersistedSnapshotRecord[];
  sourceProvenance: SourceProvenanceRecord[];
  idempotency: IdempotencyRecord[];
  outbox: OutboxEventRecord[];
  identityCache: AssetIdentityReference[];
};

export function createDurableAssetIntelligenceMemoryStore(): DurableAssetIntelligenceStore {
  return {
    conditionStates: [],
    healthIndexStates: [],
    criticalityStates: [],
    timeline: [],
    events: [],
    snapshots: [],
    sourceProvenance: [],
    idempotency: [],
    outbox: [],
    identityCache: [],
  };
}

function latestAsOf<T extends { recordedAt?: string; capturedAt?: string }>(
  items: T[],
  asOf?: string,
  field: "recordedAt" | "capturedAt" = "recordedAt",
): T | undefined {
  const filtered = items
    .filter((i) => {
      const ts = (i as Record<string, string | undefined>)[field];
      return !asOf || !ts || ts <= asOf;
    })
    .sort((a, b) => {
      const ta = (a as Record<string, string | undefined>)[field] ?? "";
      const tb = (b as Record<string, string | undefined>)[field] ?? "";
      return ta.localeCompare(tb);
    });
  return filtered[filtered.length - 1];
}

/** Test/certification unit adapter only — not for production. */
export class MemoryAssetIntelligenceRepository implements AssetIntelligenceRepositoryPort {
  readonly adapterKind = "memory" as const;

  constructor(private readonly store: DurableAssetIntelligenceStore) {}

  newId(_prefix: string): string {
    return randomUUID();
  }

  async saveCondition(state: PersistedConditionState): Promise<PersistedConditionState> {
    this.store.conditionStates.push(state);
    return state;
  }

  async getConditionById(
    tenantId: string,
    workspaceId: string,
    id: string,
  ): Promise<PersistedConditionState | null> {
    return (
      this.store.conditionStates.find(
        (s) => s.stateId === id && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestCondition(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedConditionState | undefined> {
    return latestAsOf(
      this.store.conditionStates.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
      asOf,
    );
  }

  async listConditionHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedConditionState[]> {
    return this.store.conditionStates
      .filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      )
      .sort((a, b) => a.version - b.version);
  }

  async saveHealthIndex(state: PersistedHealthIndexState): Promise<PersistedHealthIndexState> {
    this.store.healthIndexStates.push(state);
    return state;
  }

  async latestHealthIndex(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedHealthIndexState | undefined> {
    return latestAsOf(
      this.store.healthIndexStates.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
      asOf,
    );
  }

  async saveCriticality(state: PersistedCriticalityState): Promise<PersistedCriticalityState> {
    this.store.criticalityStates.push(state);
    return state;
  }

  async latestCriticality(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedCriticalityState | undefined> {
    return latestAsOf(
      this.store.criticalityStates.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
      asOf,
    );
  }

  async nextCriticalityVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestCriticality(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(
        `optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`,
      );
    }
    return current + 1;
  }

  async appendTimeline(entry: IntelligenceTimelineEntry): Promise<IntelligenceTimelineEntry> {
    this.store.timeline.push(entry);
    return entry;
  }

  async listTimeline(assetId: string, asOf?: string): Promise<IntelligenceTimelineEntry[]> {
    return this.store.timeline
      .filter((e) => e.assetId === assetId)
      .filter((e) => !asOf || e.recordedAt <= asOf)
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  }

  async saveSnapshot(record: PersistedSnapshotRecord): Promise<PersistedSnapshotRecord> {
    this.store.snapshots.push(record);
    return record;
  }

  async getSnapshot(
    tenantId: string,
    workspaceId: string,
    id: string,
  ): Promise<PersistedSnapshotRecord | null> {
    return (
      this.store.snapshots.find(
        (s) => s.id === id && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async latestSnapshot(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedSnapshotRecord | undefined> {
    return latestAsOf(
      this.store.snapshots.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
      undefined,
      "capturedAt",
    );
  }

  async registerSourceProvenance(
    record: SourceProvenanceRecord,
  ): Promise<SourceProvenanceRecord> {
    this.store.sourceProvenance.push(record);
    return record;
  }

  async findIdempotency(
    tenantId: string,
    workspaceId: string,
    key: string,
  ): Promise<IdempotencyRecord | null> {
    return (
      this.store.idempotency.find(
        (r) =>
          r.tenantId === tenantId &&
          r.workspaceId === workspaceId &&
          r.idempotencyKey === key,
      ) ?? null
    );
  }

  async saveIdempotency(record: IdempotencyRecord): Promise<IdempotencyRecord> {
    this.store.idempotency.push(record);
    return record;
  }

  async appendOutbox(event: OutboxEventRecord): Promise<OutboxEventRecord> {
    this.store.outbox.push(event);
    return event;
  }

  async markOutboxPublished(id: string, publishedAt: string): Promise<void> {
    const row = this.store.outbox.find((e) => e.id === id);
    if (row) {
      row.published = true;
      row.publishedAt = publishedAt;
    }
  }

  async appendEvent(event: AssetIntelligenceEvent): Promise<AssetIntelligenceEvent> {
    this.store.events.push(event);
    return event;
  }

  async cacheIdentity(identity: AssetIdentityReference): Promise<void> {
    const idx = this.store.identityCache.findIndex(
      (i) =>
        i.tenantId === identity.tenantId &&
        i.workspaceId === identity.workspaceId &&
        i.assetId === identity.assetId,
    );
    if (idx >= 0) this.store.identityCache[idx] = identity;
    else this.store.identityCache.push(identity);
  }

  async nextConditionVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestCondition(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(`optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`);
    }
    return current + 1;
  }

  getStore(): DurableAssetIntelligenceStore {
    return this.store;
  }
}

/** @deprecated Prefer MemoryAssetIntelligenceRepository — kept for 10B test compatibility. */
export class AssetIntelligenceRepository extends MemoryAssetIntelligenceRepository {}

export const PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false as const;

export type RepositoryFactoryOptions = {
  adapter?: "memory" | "postgres";
  nodeEnv?: string;
  supabase?: unknown;
  memoryStore?: DurableAssetIntelligenceStore;
};

export function assertProductionRepositorySafe(
  adapterKind: "memory" | "postgres",
  nodeEnv = process.env.NODE_ENV,
): void {
  if (nodeEnv === "production" && adapterKind === "memory") {
    throw new Error("production_memory_repository_forbidden");
  }
}
