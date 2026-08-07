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
import type { AssetHealthProfile } from "./health-profile";
import type { EvidenceConfidenceAssessment } from "./evidence-confidence";
import type { AssetReliabilityStateRecord } from "./reliability";
import type { IntelligenceTimelineEntry } from "./timeline";
import type { AssetIntelligenceEvent } from "./events";
import type { AssetSnapshot } from "./snapshot";
import type {
  AssetFailureCauseState,
  AssetFailureConsequenceState,
  AssetFailureEffectState,
  AssetFailureMechanismState,
  AssetFailureModeState,
  FailureRelationship,
} from "./failure";
import type { FailureTaxonomyEntry, TaxonomyEntryKind } from "./failure-taxonomy";
import type { EngineeringTimeSeries } from "./time-series";
import type { TrendConfidenceAssessment } from "./trend-confidence";
import type { ChangeDetectionResult } from "./change-detection";
import type { AssetDegradationState, AssetTrendState } from "./degradation";
import type {
  AssetLifecycleIntelligenceState,
  LifecycleTransitionCandidate,
} from "./lifecycle";
import type { LifecycleTaxonomyEntry, LifecycleTaxonomyKind } from "./lifecycle-taxonomy";

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

export type PersistedReliabilityState = AssetReliabilityStateRecord & {
  tenantId: string;
  workspaceId: string;
  version: number;
  status: ConditionLifecycleStatus;
  sourceType: string;
  createdBy?: string;
  supersedesId?: string;
};

export type PersistedEvidenceConfidence = EvidenceConfidenceAssessment & {
  tenantId: string;
  workspaceId: string;
  version: number;
};

export type PersistedHealthProfile = AssetHealthProfile & {
  version: number;
};

/** Phase 10E — Failure Intelligence persisted state types. */
export type PersistedFailureModeState = AssetFailureModeState & {
  tenantId: string;
  workspaceId: string;
  version: number;
  sourceType?: string;
  createdBy?: string;
  supersedesId?: string;
};

export type PersistedFailureMechanismState = AssetFailureMechanismState & {
  tenantId: string;
  workspaceId: string;
  version: number;
  failureModeStateId?: string;
};

export type PersistedFailureCauseState = AssetFailureCauseState & {
  tenantId: string;
  workspaceId: string;
  version: number;
  failureModeStateId?: string;
};

export type PersistedFailureEffectState = AssetFailureEffectState & {
  tenantId: string;
  workspaceId: string;
  version: number;
  failureModeStateId?: string;
};

export type PersistedFailureConsequenceState = AssetFailureConsequenceState & {
  tenantId: string;
  workspaceId: string;
  version: number;
  failureModeStateId?: string;
};

export type PersistedFailureRelationship = FailureRelationship & {
  tenantId: string;
  workspaceId: string;
  assetId: string;
  failureModeStateId?: string;
};

export type PersistedFailureReview = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  assetId: string;
  failureModeStateId: string;
  reviewInstanceId: string;
  action: string;
  reviewerId: string;
  reason?: string;
  stateVersion: number;
  taxonomyVersion: string;
  evidenceConfidenceRef?: string;
  contentHash?: string;
  correlationId?: string;
  createdAt: string;
};

/** Shared + pack-extensible registry entries — optionally tenant/workspace scoped. */
export type PersistedFailureTaxonomyEntry = FailureTaxonomyEntry & {
  tenantId?: string;
  workspaceId?: string;
};

/** Phase 10F — Time series / trend / degradation. */
export type PersistedTimeSeries = EngineeringTimeSeries & {
  tenantId: string;
  workspaceId: string;
};

export type PersistedTrendConfidence = TrendConfidenceAssessment & {
  tenantId: string;
  workspaceId: string;
};

export type PersistedChangeDetection = ChangeDetectionResult & {
  tenantId: string;
  workspaceId: string;
};

export type PersistedTrendState = AssetTrendState & {
  tenantId: string;
  workspaceId: string;
  version: number;
};

export type PersistedDegradationState = AssetDegradationState & {
  tenantId: string;
  workspaceId: string;
  version: number;
  createdBy?: string;
};

export type PersistedDegradationReview = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  assetId: string;
  degradationStateId: string;
  reviewInstanceId: string;
  action: string;
  reviewerId: string;
  reason?: string;
  stateVersion: number;
  correlationId?: string;
  createdAt: string;
};

/** Phase 10G — Lifecycle Intelligence persisted state types. */
export type PersistedLifecycleIntelligenceState = AssetLifecycleIntelligenceState & {
  tenantId: string;
  workspaceId: string;
  version: number;
  createdBy?: string;
};

export type PersistedLifecycleReview = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  assetId: string;
  lifecycleStateId: string;
  reviewInstanceId: string;
  action: string;
  reviewerId: string;
  reason?: string;
  stateVersion: number;
  canonicalLifecycleVersion?: number;
  evidenceConfidenceRef?: string;
  trendConfidenceRef?: string;
  correlationId?: string;
  createdAt: string;
};

export type PersistedLifecycleTransitionCandidate = LifecycleTransitionCandidate & {
  tenantId: string;
  workspaceId: string;
};

/** Shared + pack-extensible registry entries — optionally tenant/workspace scoped. */
export type PersistedLifecycleTaxonomyEntry = LifecycleTaxonomyEntry & {
  tenantId?: string;
  workspaceId?: string;
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
  saveReliability(state: PersistedReliabilityState): Promise<PersistedReliabilityState>;
  latestReliability(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedReliabilityState | undefined>;
  nextReliabilityVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number>;
  saveEvidenceConfidence(
    record: PersistedEvidenceConfidence,
  ): Promise<PersistedEvidenceConfidence>;
  latestEvidenceConfidence(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedEvidenceConfidence | undefined>;
  saveHealthProfile(profile: PersistedHealthProfile): Promise<PersistedHealthProfile>;
  latestHealthProfile(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedHealthProfile | undefined>;
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
  /** Optimistic concurrency: returns next version or throws on conflict. */
  nextFailureModeVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number>;
  saveFailureMode(state: PersistedFailureModeState): Promise<PersistedFailureModeState>;
  latestFailureMode(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedFailureModeState | undefined>;
  listFailureModeHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedFailureModeState[]>;
  saveFailureMechanism(
    state: PersistedFailureMechanismState,
  ): Promise<PersistedFailureMechanismState>;
  latestFailureMechanism(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedFailureMechanismState | undefined>;
  saveFailureCause(state: PersistedFailureCauseState): Promise<PersistedFailureCauseState>;
  saveFailureEffect(state: PersistedFailureEffectState): Promise<PersistedFailureEffectState>;
  saveFailureConsequence(
    state: PersistedFailureConsequenceState,
  ): Promise<PersistedFailureConsequenceState>;
  saveFailureRelationship(
    relationship: PersistedFailureRelationship,
  ): Promise<PersistedFailureRelationship>;
  saveFailureReview(review: PersistedFailureReview): Promise<PersistedFailureReview>;
  upsertFailureTaxonomy(
    entry: PersistedFailureTaxonomyEntry,
  ): Promise<PersistedFailureTaxonomyEntry>;
  listFailureTaxonomy(
    kind?: TaxonomyEntryKind,
    packOwner?: string,
  ): Promise<PersistedFailureTaxonomyEntry[]>;
  nextTimeSeriesVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    attributeKey: string,
    expectedCurrentVersion?: number,
  ): Promise<number>;
  saveTimeSeries(series: PersistedTimeSeries): Promise<PersistedTimeSeries>;
  latestTimeSeries(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    attributeKey: string,
  ): Promise<PersistedTimeSeries | undefined>;
  saveTrendConfidence(record: PersistedTrendConfidence): Promise<PersistedTrendConfidence>;
  saveChangeDetection(record: PersistedChangeDetection): Promise<PersistedChangeDetection>;
  nextTrendVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number>;
  saveTrendState(state: PersistedTrendState): Promise<PersistedTrendState>;
  latestTrendState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedTrendState | undefined>;
  nextDegradationVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number>;
  saveDegradationState(state: PersistedDegradationState): Promise<PersistedDegradationState>;
  latestDegradationState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedDegradationState | undefined>;
  listDegradationHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedDegradationState[]>;
  saveDegradationReview(
    review: PersistedDegradationReview,
  ): Promise<PersistedDegradationReview>;
  /** Optimistic concurrency: returns next version or throws on conflict. */
  nextLifecycleVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number>;
  saveLifecycleState(
    state: PersistedLifecycleIntelligenceState,
  ): Promise<PersistedLifecycleIntelligenceState>;
  latestLifecycleState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleIntelligenceState | undefined>;
  listLifecycleHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleIntelligenceState[]>;
  saveLifecycleReview(review: PersistedLifecycleReview): Promise<PersistedLifecycleReview>;
  saveLifecycleTransitionCandidate(
    candidate: PersistedLifecycleTransitionCandidate,
  ): Promise<PersistedLifecycleTransitionCandidate>;
  listLifecycleTransitionCandidates(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleTransitionCandidate[]>;
  upsertLifecycleTaxonomy(
    entry: PersistedLifecycleTaxonomyEntry,
  ): Promise<PersistedLifecycleTaxonomyEntry>;
  listLifecycleTaxonomy(
    kind?: LifecycleTaxonomyKind,
    packOwner?: string,
  ): Promise<PersistedLifecycleTaxonomyEntry[]>;
};

export type DurableAssetIntelligenceStore = {
  conditionStates: PersistedConditionState[];
  healthIndexStates: PersistedHealthIndexState[];
  criticalityStates: PersistedCriticalityState[];
  reliabilityStates: PersistedReliabilityState[];
  evidenceConfidence: PersistedEvidenceConfidence[];
  healthProfiles: PersistedHealthProfile[];
  timeline: IntelligenceTimelineEntry[];
  events: AssetIntelligenceEvent[];
  snapshots: PersistedSnapshotRecord[];
  sourceProvenance: SourceProvenanceRecord[];
  idempotency: IdempotencyRecord[];
  outbox: OutboxEventRecord[];
  identityCache: AssetIdentityReference[];
  failureModes: PersistedFailureModeState[];
  failureMechanisms: PersistedFailureMechanismState[];
  failureCauses: PersistedFailureCauseState[];
  failureEffects: PersistedFailureEffectState[];
  failureConsequences: PersistedFailureConsequenceState[];
  failureRelationships: PersistedFailureRelationship[];
  failureReviews: PersistedFailureReview[];
  failureTaxonomy: PersistedFailureTaxonomyEntry[];
  timeSeries: PersistedTimeSeries[];
  trendConfidence: PersistedTrendConfidence[];
  changeDetections: PersistedChangeDetection[];
  trendStates: PersistedTrendState[];
  degradationStates: PersistedDegradationState[];
  degradationReviews: PersistedDegradationReview[];
  lifecycleStates: PersistedLifecycleIntelligenceState[];
  lifecycleReviews: PersistedLifecycleReview[];
  lifecycleTransitionCandidates: PersistedLifecycleTransitionCandidate[];
  lifecycleTaxonomy: PersistedLifecycleTaxonomyEntry[];
};

export function createDurableAssetIntelligenceMemoryStore(): DurableAssetIntelligenceStore {
  return {
    conditionStates: [],
    healthIndexStates: [],
    criticalityStates: [],
    reliabilityStates: [],
    evidenceConfidence: [],
    healthProfiles: [],
    timeline: [],
    events: [],
    snapshots: [],
    sourceProvenance: [],
    idempotency: [],
    outbox: [],
    identityCache: [],
    failureModes: [],
    failureMechanisms: [],
    failureCauses: [],
    failureEffects: [],
    failureConsequences: [],
    failureRelationships: [],
    failureReviews: [],
    failureTaxonomy: [],
    timeSeries: [],
    trendConfidence: [],
    changeDetections: [],
    trendStates: [],
    degradationStates: [],
    degradationReviews: [],
    lifecycleStates: [],
    lifecycleReviews: [],
    lifecycleTransitionCandidates: [],
    lifecycleTaxonomy: [],
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

  async saveReliability(state: PersistedReliabilityState): Promise<PersistedReliabilityState> {
    this.store.reliabilityStates.push(state);
    return state;
  }

  async latestReliability(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedReliabilityState | undefined> {
    return latestAsOf(
      this.store.reliabilityStates.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
      asOf,
    );
  }

  async nextReliabilityVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestReliability(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(
        `optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`,
      );
    }
    return current + 1;
  }

  async saveEvidenceConfidence(
    record: PersistedEvidenceConfidence,
  ): Promise<PersistedEvidenceConfidence> {
    this.store.evidenceConfidence.push(record);
    return record;
  }

  async latestEvidenceConfidence(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedEvidenceConfidence | undefined> {
    const items = this.store.evidenceConfidence.filter(
      (e) => e.assetId === assetId && e.tenantId === tenantId && e.workspaceId === workspaceId,
    );
    return items[items.length - 1];
  }

  async saveHealthProfile(profile: PersistedHealthProfile): Promise<PersistedHealthProfile> {
    this.store.healthProfiles.push(profile);
    return profile;
  }

  async latestHealthProfile(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedHealthProfile | undefined> {
    const items = this.store.healthProfiles.filter(
      (p) => p.assetId === assetId && p.tenantId === tenantId && p.workspaceId === workspaceId,
    );
    return items[items.length - 1];
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

  async nextFailureModeVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestFailureMode(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(
        `optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`,
      );
    }
    return current + 1;
  }

  async saveFailureMode(state: PersistedFailureModeState): Promise<PersistedFailureModeState> {
    this.store.failureModes.push(state);
    return state;
  }

  async latestFailureMode(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedFailureModeState | undefined> {
    return latestAsOf(
      this.store.failureModes.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
      asOf,
    );
  }

  async listFailureModeHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedFailureModeState[]> {
    return this.store.failureModes
      .filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      )
      .sort((a, b) => a.version - b.version);
  }

  async saveFailureMechanism(
    state: PersistedFailureMechanismState,
  ): Promise<PersistedFailureMechanismState> {
    this.store.failureMechanisms.push(state);
    return state;
  }

  async latestFailureMechanism(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    asOf?: string,
  ): Promise<PersistedFailureMechanismState | undefined> {
    return latestAsOf(
      this.store.failureMechanisms.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
      asOf,
    );
  }

  async saveFailureCause(state: PersistedFailureCauseState): Promise<PersistedFailureCauseState> {
    this.store.failureCauses.push(state);
    return state;
  }

  async saveFailureEffect(
    state: PersistedFailureEffectState,
  ): Promise<PersistedFailureEffectState> {
    this.store.failureEffects.push(state);
    return state;
  }

  async saveFailureConsequence(
    state: PersistedFailureConsequenceState,
  ): Promise<PersistedFailureConsequenceState> {
    this.store.failureConsequences.push(state);
    return state;
  }

  async saveFailureRelationship(
    relationship: PersistedFailureRelationship,
  ): Promise<PersistedFailureRelationship> {
    this.store.failureRelationships.push(relationship);
    return relationship;
  }

  async saveFailureReview(review: PersistedFailureReview): Promise<PersistedFailureReview> {
    this.store.failureReviews.push(review);
    return review;
  }

  async upsertFailureTaxonomy(
    entry: PersistedFailureTaxonomyEntry,
  ): Promise<PersistedFailureTaxonomyEntry> {
    const idx = this.store.failureTaxonomy.findIndex(
      (e) => e.kind === entry.kind && e.code === entry.code && e.taxonomyVersion === entry.taxonomyVersion,
    );
    if (idx >= 0) this.store.failureTaxonomy[idx] = entry;
    else this.store.failureTaxonomy.push(entry);
    return entry;
  }

  async listFailureTaxonomy(
    kind?: TaxonomyEntryKind,
    packOwner?: string,
  ): Promise<PersistedFailureTaxonomyEntry[]> {
    return this.store.failureTaxonomy.filter(
      (e) => (!kind || e.kind === kind) && (!packOwner || e.packOwner === packOwner),
    );
  }

  async nextTimeSeriesVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    attributeKey: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestTimeSeries(tenantId, workspaceId, assetId, attributeKey);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(
        `optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`,
      );
    }
    return current + 1;
  }

  async saveTimeSeries(series: PersistedTimeSeries): Promise<PersistedTimeSeries> {
    this.store.timeSeries.push(series);
    return series;
  }

  async latestTimeSeries(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    attributeKey: string,
  ): Promise<PersistedTimeSeries | undefined> {
    const items = this.store.timeSeries.filter(
      (s) =>
        s.tenantId === tenantId &&
        s.workspaceId === workspaceId &&
        s.assetId === assetId &&
        s.attributeKey === attributeKey,
    );
    return items.sort((a, b) => a.version - b.version)[items.length - 1];
  }

  async saveTrendConfidence(
    record: PersistedTrendConfidence,
  ): Promise<PersistedTrendConfidence> {
    this.store.trendConfidence.push(record);
    return record;
  }

  async saveChangeDetection(
    record: PersistedChangeDetection,
  ): Promise<PersistedChangeDetection> {
    this.store.changeDetections.push(record);
    return record;
  }

  async nextTrendVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestTrendState(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(
        `optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`,
      );
    }
    return current + 1;
  }

  async saveTrendState(state: PersistedTrendState): Promise<PersistedTrendState> {
    this.store.trendStates.push(state);
    return state;
  }

  async latestTrendState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedTrendState | undefined> {
    return latestAsOf(
      this.store.trendStates.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
    );
  }

  async nextDegradationVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestDegradationState(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(
        `optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`,
      );
    }
    return current + 1;
  }

  async saveDegradationState(
    state: PersistedDegradationState,
  ): Promise<PersistedDegradationState> {
    this.store.degradationStates.push(state);
    return state;
  }

  async latestDegradationState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedDegradationState | undefined> {
    return latestAsOf(
      this.store.degradationStates.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
    );
  }

  async listDegradationHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedDegradationState[]> {
    return this.store.degradationStates
      .filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      )
      .sort((a, b) => a.version - b.version);
  }

  async saveDegradationReview(
    review: PersistedDegradationReview,
  ): Promise<PersistedDegradationReview> {
    this.store.degradationReviews.push(review);
    return review;
  }

  async nextLifecycleVersion(
    tenantId: string,
    workspaceId: string,
    assetId: string,
    expectedCurrentVersion?: number,
  ): Promise<number> {
    const latest = await this.latestLifecycleState(tenantId, workspaceId, assetId);
    const current = latest?.version ?? 0;
    if (expectedCurrentVersion !== undefined && expectedCurrentVersion !== current) {
      throw new Error(
        `optimistic_lock_conflict:expected=${expectedCurrentVersion}:actual=${current}`,
      );
    }
    return current + 1;
  }

  async saveLifecycleState(
    state: PersistedLifecycleIntelligenceState,
  ): Promise<PersistedLifecycleIntelligenceState> {
    this.store.lifecycleStates.push(state);
    return state;
  }

  async latestLifecycleState(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleIntelligenceState | undefined> {
    return latestAsOf(
      this.store.lifecycleStates.filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ),
    );
  }

  async listLifecycleHistory(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleIntelligenceState[]> {
    return this.store.lifecycleStates
      .filter(
        (s) =>
          s.assetId === assetId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      )
      .sort((a, b) => a.version - b.version);
  }

  async saveLifecycleReview(
    review: PersistedLifecycleReview,
  ): Promise<PersistedLifecycleReview> {
    this.store.lifecycleReviews.push(review);
    return review;
  }

  async saveLifecycleTransitionCandidate(
    candidate: PersistedLifecycleTransitionCandidate,
  ): Promise<PersistedLifecycleTransitionCandidate> {
    this.store.lifecycleTransitionCandidates.push(candidate);
    return candidate;
  }

  async listLifecycleTransitionCandidates(
    tenantId: string,
    workspaceId: string,
    assetId: string,
  ): Promise<PersistedLifecycleTransitionCandidate[]> {
    return this.store.lifecycleTransitionCandidates.filter(
      (c) =>
        c.assetId === assetId && c.tenantId === tenantId && c.workspaceId === workspaceId,
    );
  }

  async upsertLifecycleTaxonomy(
    entry: PersistedLifecycleTaxonomyEntry,
  ): Promise<PersistedLifecycleTaxonomyEntry> {
    const idx = this.store.lifecycleTaxonomy.findIndex(
      (e) =>
        e.kind === entry.kind &&
        e.code === entry.code &&
        e.taxonomyVersion === entry.taxonomyVersion,
    );
    if (idx >= 0) this.store.lifecycleTaxonomy[idx] = entry;
    else this.store.lifecycleTaxonomy.push(entry);
    return entry;
  }

  async listLifecycleTaxonomy(
    kind?: LifecycleTaxonomyKind,
    packOwner?: string,
  ): Promise<PersistedLifecycleTaxonomyEntry[]> {
    return this.store.lifecycleTaxonomy.filter(
      (e) => (!kind || e.kind === kind) && (!packOwner || e.packOwner === packOwner),
    );
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
