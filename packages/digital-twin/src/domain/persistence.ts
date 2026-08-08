/**
 * Phase 12B — Digital Twin persistence port and memory adapter.
 *
 * Memory adapter exists for unit tests only; production fails closed.
 */

import { randomUUID } from "node:crypto";
import type { TwinIdentity } from "./identity";
import type { TwinRepresentationReference } from "./representation";
import type { TwinRelationship } from "./relationships";
import type { DigitalThreadLink } from "./thread";
import type { TwinStateReference, TwinState, TwinStateVersion, TwinStateSnapshot } from "./state";
import type { RepresentationVersion } from "./representation-versioning";
import type { TwinTimelineEvent } from "./timeline";
import type { DigitalTwinEvent } from "./events";
import { PRODUCTION_MEMORY_REPOSITORY_ALLOWED as VERSION_MEMORY_LOCK } from "../version";

export type PersistedTwinIdentity = TwinIdentity;

export type PersistedTwinRepresentation = TwinRepresentationReference;

export type PersistedTwinRelationship = TwinRelationship;

export type PersistedThreadLink = DigitalThreadLink;

export type PersistedStateReference = TwinStateReference;

export type TwinStateReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  stateId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: "approved" | "rejected" | "changes_requested" | "resubmitted";
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
};

export type TwinReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: "approved" | "rejected" | "changes_requested" | "resubmitted";
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
};

export type OutboxEventRecord = {
  outboxId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  eventType: string;
  payload: Record<string, unknown>;
  correlationId?: string;
  published: boolean;
  createdAt: string;
  publishedAt?: string;
};

export type DigitalTwinRepositoryPort = {
  readonly adapterKind: "memory" | "postgres";
  newId(prefix: string): string;

  saveIdentity(identity: PersistedTwinIdentity): Promise<PersistedTwinIdentity>;
  getIdentityById(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinIdentity | null>;
  getIdentityByTarget(
    tenantId: string,
    workspaceId: string,
    canonicalEntityType: string,
    canonicalEntityId: string,
  ): Promise<PersistedTwinIdentity | undefined>;
  listIdentities(tenantId: string, workspaceId: string): Promise<PersistedTwinIdentity[]>;

  saveRepresentation(
    representation: PersistedTwinRepresentation,
  ): Promise<PersistedTwinRepresentation>;
  listRepresentations(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinRepresentation[]>;

  saveRelationship(relationship: PersistedTwinRelationship): Promise<PersistedTwinRelationship>;
  listRelationships(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinRelationship[]>;

  saveThreadLink(link: PersistedThreadLink): Promise<PersistedThreadLink>;
  listThreadLinks(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedThreadLink[]>;

  saveStateReference(state: PersistedStateReference): Promise<PersistedStateReference>;
  listStateReferences(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedStateReference[]>;

  saveState(state: PersistedTwinState): Promise<PersistedTwinState>;
  getStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedTwinState | null>;
  listStates(tenantId: string, workspaceId: string, twinId: string): Promise<PersistedTwinState[]>;

  saveStateVersion(version: PersistedTwinStateVersion): Promise<PersistedTwinStateVersion>;
  listStateVersions(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedTwinStateVersion[]>;
  listStateVersionsForTwin(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinStateVersion[]>;

  saveRepresentationVersion(
    version: PersistedRepresentationVersion,
  ): Promise<PersistedRepresentationVersion>;
  listRepresentationVersions(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedRepresentationVersion[]>;

  saveSnapshot(snapshot: PersistedTwinSnapshot): Promise<PersistedTwinSnapshot>;
  getSnapshotById(
    tenantId: string,
    workspaceId: string,
    snapshotId: string,
  ): Promise<PersistedTwinSnapshot | null>;
  listSnapshots(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinSnapshot[]>;

  appendTimelineEvent(event: PersistedTimelineEvent): Promise<PersistedTimelineEvent>;
  listTimelineEvents(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTimelineEvent[]>;

  saveReview(review: TwinReviewRecord): Promise<TwinReviewRecord>;
  listReviews(
    tenantId: string,
    workspaceId: string,
    twinId?: string,
  ): Promise<TwinReviewRecord[]>;

  saveStateReview(review: TwinStateReviewRecord): Promise<TwinStateReviewRecord>;
  listStateReviews(
    tenantId: string,
    workspaceId: string,
    twinId?: string,
    stateId?: string,
  ): Promise<TwinStateReviewRecord[]>;

  enqueueOutbox(record: OutboxEventRecord): Promise<OutboxEventRecord>;
  listOutbox(tenantId: string, workspaceId: string): Promise<OutboxEventRecord[]>;
};

export type DurableDigitalTwinStore = {
  identities: PersistedTwinIdentity[];
  representations: PersistedTwinRepresentation[];
  relationships: PersistedTwinRelationship[];
  threadLinks: PersistedThreadLink[];
  stateReferences: PersistedStateReference[];
  states: PersistedTwinState[];
  stateVersions: PersistedTwinStateVersion[];
  representationVersions: PersistedRepresentationVersion[];
  snapshots: PersistedTwinSnapshot[];
  timelineEvents: PersistedTimelineEvent[];
  reviews: TwinReviewRecord[];
  stateReviews: TwinStateReviewRecord[];
  outbox: OutboxEventRecord[];
  events: DigitalTwinEvent[];
};

export function createDurableDigitalTwinMemoryStore(): DurableDigitalTwinStore {
  return {
    identities: [],
    representations: [],
    relationships: [],
    threadLinks: [],
    stateReferences: [],
    states: [],
    stateVersions: [],
    representationVersions: [],
    snapshots: [],
    timelineEvents: [],
    reviews: [],
    stateReviews: [],
    outbox: [],
    events: [],
  };
}

/** Test/certification unit adapter only — not for production. */
export class MemoryDigitalTwinRepository implements DigitalTwinRepositoryPort {
  readonly adapterKind = "memory" as const;

  constructor(private readonly store: DurableDigitalTwinStore) {}

  newId(_prefix: string): string {
    return randomUUID();
  }

  getStore(): DurableDigitalTwinStore {
    return this.store;
  }

  async saveIdentity(identity: PersistedTwinIdentity): Promise<PersistedTwinIdentity> {
    const idx = this.store.identities.findIndex((row) => row.twinId === identity.twinId);
    if (idx >= 0) {
      this.store.identities[idx] = identity;
    } else {
      this.store.identities.push(identity);
    }
    return identity;
  }

  async getIdentityById(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinIdentity | null> {
    return (
      this.store.identities.find(
        (row) =>
          row.twinId === twinId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async getIdentityByTarget(
    tenantId: string,
    workspaceId: string,
    canonicalEntityType: string,
    canonicalEntityId: string,
  ): Promise<PersistedTwinIdentity | undefined> {
    return this.store.identities.find(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        row.target.canonicalEntityType === canonicalEntityType &&
        row.target.canonicalEntityId === canonicalEntityId,
    );
  }

  async listIdentities(tenantId: string, workspaceId: string): Promise<PersistedTwinIdentity[]> {
    return this.store.identities.filter(
      (row) => row.tenantId === tenantId && row.workspaceId === workspaceId,
    );
  }

  async saveRepresentation(
    representation: PersistedTwinRepresentation,
  ): Promise<PersistedTwinRepresentation> {
    this.store.representations.push(representation);
    return representation;
  }

  async listRepresentations(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinRepresentation[]> {
    return this.store.representations.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async saveRelationship(
    relationship: PersistedTwinRelationship,
  ): Promise<PersistedTwinRelationship> {
    this.store.relationships.push(relationship);
    return relationship;
  }

  async listRelationships(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinRelationship[]> {
    return this.store.relationships.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async saveThreadLink(link: PersistedThreadLink): Promise<PersistedThreadLink> {
    this.store.threadLinks.push(link);
    return link;
  }

  async listThreadLinks(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedThreadLink[]> {
    return this.store.threadLinks.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async saveStateReference(state: PersistedStateReference): Promise<PersistedStateReference> {
    this.store.stateReferences.push(state);
    return state;
  }

  async listStateReferences(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedStateReference[]> {
    return this.store.stateReferences.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async saveState(state: PersistedTwinState): Promise<PersistedTwinState> {
    const idx = this.store.states.findIndex((row) => row.stateId === state.stateId);
    if (idx >= 0) this.store.states[idx] = state;
    else this.store.states.push(state);
    return state;
  }

  async getStateById(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedTwinState | null> {
    return (
      this.store.states.find(
        (row) =>
          row.stateId === stateId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async listStates(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinState[]> {
    return this.store.states.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async saveStateVersion(version: PersistedTwinStateVersion): Promise<PersistedTwinStateVersion> {
    this.store.stateVersions.push(version);
    return version;
  }

  async listStateVersions(
    tenantId: string,
    workspaceId: string,
    stateId: string,
  ): Promise<PersistedTwinStateVersion[]> {
    return this.store.stateVersions.filter(
      (row) =>
        row.stateId === stateId &&
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId,
    );
  }

  async listStateVersionsForTwin(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinStateVersion[]> {
    return this.store.stateVersions.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async saveRepresentationVersion(
    version: PersistedRepresentationVersion,
  ): Promise<PersistedRepresentationVersion> {
    this.store.representationVersions.push(version);
    return version;
  }

  async listRepresentationVersions(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedRepresentationVersion[]> {
    return this.store.representationVersions.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async saveSnapshot(snapshot: PersistedTwinSnapshot): Promise<PersistedTwinSnapshot> {
    this.store.snapshots.push(snapshot);
    return snapshot;
  }

  async getSnapshotById(
    tenantId: string,
    workspaceId: string,
    snapshotId: string,
  ): Promise<PersistedTwinSnapshot | null> {
    return (
      this.store.snapshots.find(
        (row) =>
          row.snapshotId === snapshotId &&
          row.tenantId === tenantId &&
          row.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async listSnapshots(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTwinSnapshot[]> {
    return this.store.snapshots.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async appendTimelineEvent(event: PersistedTimelineEvent): Promise<PersistedTimelineEvent> {
    this.store.timelineEvents.push(event);
    return event;
  }

  async listTimelineEvents(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTimelineEvent[]> {
    return this.store.timelineEvents.filter(
      (row) =>
        row.tenantId === tenantId && row.workspaceId === workspaceId && row.twinId === twinId,
    );
  }

  async saveReview(review: TwinReviewRecord): Promise<TwinReviewRecord> {
    this.store.reviews.push(review);
    return review;
  }

  async listReviews(
    tenantId: string,
    workspaceId: string,
    twinId?: string,
  ): Promise<TwinReviewRecord[]> {
    return this.store.reviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!twinId || row.twinId === twinId),
    );
  }

  async saveStateReview(review: TwinStateReviewRecord): Promise<TwinStateReviewRecord> {
    this.store.stateReviews.push(review);
    return review;
  }

  async listStateReviews(
    tenantId: string,
    workspaceId: string,
    twinId?: string,
    stateId?: string,
  ): Promise<TwinStateReviewRecord[]> {
    return this.store.stateReviews.filter(
      (row) =>
        row.tenantId === tenantId &&
        row.workspaceId === workspaceId &&
        (!twinId || row.twinId === twinId) &&
        (!stateId || row.stateId === stateId),
    );
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
  memoryStore?: DurableDigitalTwinStore;
};

export function assertProductionRepositorySafe(
  adapterKind: "memory" | "postgres",
  nodeEnv = process.env.NODE_ENV,
): void {
  if (nodeEnv === "production" && adapterKind === "memory") {
    throw new Error("production_memory_repository_forbidden");
  }
}
