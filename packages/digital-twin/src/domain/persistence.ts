/**
 * Phase 12D — Digital Twin persistence port and memory adapter.
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
import type { ObservedTwinStateCandidate } from "./observed-state-candidate";
import type { TwinStateReconciliationRecord } from "./state-reconciliation";
import type { DigitalTwinSourceAdapter } from "./source-adapter";
import type { TwinSourceAuthorityPolicy } from "./source-authority";
import type { TwinStateSchema } from "./state-schema-registry";
import type { TelemetrySourceReference } from "./telemetry-source";
import type { TelemetryChannelReference } from "./telemetry-channel";
import type { TwinTelemetryBinding } from "./telemetry-binding";
import type { TwinTelemetryAggregationPolicy } from "./aggregation-policy";
import type { TelemetryProjectionRecord } from "./telemetry-projection-engine";
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

export type IngestionIdempotencyRecord = {
  idempotencyId: string;
  tenantId: string;
  workspaceId: string;
  idempotencyKey: string;
  candidateId: string;
  createdAt: string;
};

export type PersistedStateCandidate = ObservedTwinStateCandidate;
export type PersistedStateReconciliation = TwinStateReconciliationRecord;
export type PersistedSourceAdapter = DigitalTwinSourceAdapter;
export type PersistedStateSchema = TwinStateSchema;
export type PersistedSourceAuthorityPolicy = TwinSourceAuthorityPolicy;
export type PersistedTelemetrySource = TelemetrySourceReference;
export type PersistedTelemetryChannel = TelemetryChannelReference;
export type PersistedTelemetryBinding = TwinTelemetryBinding;
export type PersistedTelemetryAggregationPolicy = TwinTelemetryAggregationPolicy;
export type PersistedTelemetryProjectionRecord = TelemetryProjectionRecord;

export type TelemetryBindingReviewRecord = {
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  twinId: string;
  bindingId: string;
  workflowInstanceId: string;
  workflowState: string;
  outcome?: "approved" | "rejected" | "changes_requested" | "resubmitted";
  reviewerId?: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
  selfApproved: false;
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

  saveSourceAdapter(adapter: PersistedSourceAdapter): Promise<PersistedSourceAdapter>;
  getSourceAdapterById(adapterId: string): Promise<PersistedSourceAdapter | null>;
  listSourceAdapters(tenantId: string, workspaceId: string): Promise<PersistedSourceAdapter[]>;

  saveStateSchema(schema: PersistedStateSchema): Promise<PersistedStateSchema>;
  getStateSchemaById(schemaId: string): Promise<PersistedStateSchema | null>;
  listStateSchemas(): Promise<PersistedStateSchema[]>;

  saveStateCandidate(candidate: PersistedStateCandidate): Promise<PersistedStateCandidate>;
  getStateCandidateById(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedStateCandidate | null>;
  listStateCandidates(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedStateCandidate[]>;

  saveStateReconciliation(
    record: PersistedStateReconciliation,
  ): Promise<PersistedStateReconciliation>;
  getStateReconciliationByCandidate(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedStateReconciliation | null>;

  saveSourceAuthorityPolicy(
    policy: PersistedSourceAuthorityPolicy,
  ): Promise<PersistedSourceAuthorityPolicy>;
  getSourceAuthorityPolicy(policyId: string): Promise<PersistedSourceAuthorityPolicy | null>;

  saveIngestionIdempotency(
    record: IngestionIdempotencyRecord,
  ): Promise<IngestionIdempotencyRecord>;
  getIngestionIdempotency(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<IngestionIdempotencyRecord | null>;

  saveTelemetrySource(source: PersistedTelemetrySource): Promise<PersistedTelemetrySource>;
  listTelemetrySources(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetrySource[]>;
  getTelemetrySourceById(
    tenantId: string,
    workspaceId: string,
    sourceId: string,
  ): Promise<PersistedTelemetrySource | null>;

  saveTelemetryChannel(channel: PersistedTelemetryChannel): Promise<PersistedTelemetryChannel>;
  listTelemetryChannels(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetryChannel[]>;

  saveTelemetryBinding(binding: PersistedTelemetryBinding): Promise<PersistedTelemetryBinding>;
  getTelemetryBindingById(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryBinding | null>;
  listTelemetryBindings(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetryBinding[]>;

  saveTelemetryAggregationPolicy(
    policy: PersistedTelemetryAggregationPolicy,
  ): Promise<PersistedTelemetryAggregationPolicy>;
  getTelemetryAggregationPolicyByBinding(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryAggregationPolicy | null>;

  saveTelemetryProjectionRecord(
    record: PersistedTelemetryProjectionRecord,
  ): Promise<PersistedTelemetryProjectionRecord>;
  listTelemetryProjectionRecords(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryProjectionRecord[]>;

  saveTelemetryBindingReview(
    review: TelemetryBindingReviewRecord,
  ): Promise<TelemetryBindingReviewRecord>;
  listTelemetryBindingReviews(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<TelemetryBindingReviewRecord[]>;
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
  sourceAdapters: PersistedSourceAdapter[];
  stateSchemas: PersistedStateSchema[];
  stateCandidates: PersistedStateCandidate[];
  stateReconciliations: PersistedStateReconciliation[];
  sourceAuthorityPolicies: PersistedSourceAuthorityPolicy[];
  ingestionIdempotency: IngestionIdempotencyRecord[];
  telemetrySources: PersistedTelemetrySource[];
  telemetryChannels: PersistedTelemetryChannel[];
  telemetryBindings: PersistedTelemetryBinding[];
  telemetryAggregationPolicies: PersistedTelemetryAggregationPolicy[];
  telemetryProjectionRecords: PersistedTelemetryProjectionRecord[];
  telemetryBindingReviews: TelemetryBindingReviewRecord[];
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
    sourceAdapters: [],
    stateSchemas: [],
    stateCandidates: [],
    stateReconciliations: [],
    sourceAuthorityPolicies: [],
    ingestionIdempotency: [],
    telemetrySources: [],
    telemetryChannels: [],
    telemetryBindings: [],
    telemetryAggregationPolicies: [],
    telemetryProjectionRecords: [],
    telemetryBindingReviews: [],
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

  async saveSourceAdapter(adapter: PersistedSourceAdapter): Promise<PersistedSourceAdapter> {
    const idx = this.store.sourceAdapters.findIndex((a) => a.adapterId === adapter.adapterId);
    if (idx >= 0) this.store.sourceAdapters[idx] = adapter;
    else this.store.sourceAdapters.push(adapter);
    return adapter;
  }

  async getSourceAdapterById(adapterId: string): Promise<PersistedSourceAdapter | null> {
    return this.store.sourceAdapters.find((a) => a.adapterId === adapterId) ?? null;
  }

  async listSourceAdapters(
    tenantId: string,
    workspaceId: string,
  ): Promise<PersistedSourceAdapter[]> {
    void tenantId;
    void workspaceId;
    return [...this.store.sourceAdapters];
  }

  async saveStateSchema(schema: PersistedStateSchema): Promise<PersistedStateSchema> {
    const idx = this.store.stateSchemas.findIndex((s) => s.schemaId === schema.schemaId);
    if (idx >= 0) this.store.stateSchemas[idx] = schema;
    else this.store.stateSchemas.push(schema);
    return schema;
  }

  async getStateSchemaById(schemaId: string): Promise<PersistedStateSchema | null> {
    return this.store.stateSchemas.find((s) => s.schemaId === schemaId) ?? null;
  }

  async listStateSchemas(): Promise<PersistedStateSchema[]> {
    return [...this.store.stateSchemas];
  }

  async saveStateCandidate(
    candidate: PersistedStateCandidate,
  ): Promise<PersistedStateCandidate> {
    const idx = this.store.stateCandidates.findIndex((c) => c.candidateId === candidate.candidateId);
    if (idx >= 0) this.store.stateCandidates[idx] = candidate;
    else this.store.stateCandidates.push(candidate);
    return candidate;
  }

  async getStateCandidateById(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedStateCandidate | null> {
    return (
      this.store.stateCandidates.find(
        (c) =>
          c.candidateId === candidateId &&
          c.tenantId === tenantId &&
          c.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async listStateCandidates(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedStateCandidate[]> {
    return this.store.stateCandidates.filter(
      (c) => c.tenantId === tenantId && c.workspaceId === workspaceId && c.twinId === twinId,
    );
  }

  async saveStateReconciliation(
    record: PersistedStateReconciliation,
  ): Promise<PersistedStateReconciliation> {
    const idx = this.store.stateReconciliations.findIndex(
      (r) => r.reconciliationId === record.reconciliationId,
    );
    if (idx >= 0) this.store.stateReconciliations[idx] = record;
    else this.store.stateReconciliations.push(record);
    return record;
  }

  async getStateReconciliationByCandidate(
    tenantId: string,
    workspaceId: string,
    candidateId: string,
  ): Promise<PersistedStateReconciliation | null> {
    return (
      this.store.stateReconciliations.find(
        (r) =>
          r.candidateId === candidateId &&
          r.tenantId === tenantId &&
          r.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async saveSourceAuthorityPolicy(
    policy: PersistedSourceAuthorityPolicy,
  ): Promise<PersistedSourceAuthorityPolicy> {
    const idx = this.store.sourceAuthorityPolicies.findIndex((p) => p.policyId === policy.policyId);
    if (idx >= 0) this.store.sourceAuthorityPolicies[idx] = policy;
    else this.store.sourceAuthorityPolicies.push(policy);
    return policy;
  }

  async getSourceAuthorityPolicy(
    policyId: string,
  ): Promise<PersistedSourceAuthorityPolicy | null> {
    return this.store.sourceAuthorityPolicies.find((p) => p.policyId === policyId) ?? null;
  }

  async saveIngestionIdempotency(
    record: IngestionIdempotencyRecord,
  ): Promise<IngestionIdempotencyRecord> {
    this.store.ingestionIdempotency.push(record);
    return record;
  }

  async getIngestionIdempotency(
    tenantId: string,
    workspaceId: string,
    idempotencyKey: string,
  ): Promise<IngestionIdempotencyRecord | null> {
    return (
      this.store.ingestionIdempotency.find(
        (r) =>
          r.tenantId === tenantId &&
          r.workspaceId === workspaceId &&
          r.idempotencyKey === idempotencyKey,
      ) ?? null
    );
  }

  async saveTelemetrySource(source: PersistedTelemetrySource): Promise<PersistedTelemetrySource> {
    const idx = this.store.telemetrySources.findIndex((s) => s.sourceId === source.sourceId);
    if (idx >= 0) this.store.telemetrySources[idx] = source;
    else this.store.telemetrySources.push(source);
    return source;
  }

  async listTelemetrySources(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetrySource[]> {
    return this.store.telemetrySources.filter(
      (s) => s.tenantId === tenantId && s.workspaceId === workspaceId && s.twinId === twinId,
    );
  }

  async getTelemetrySourceById(
    tenantId: string,
    workspaceId: string,
    sourceId: string,
  ): Promise<PersistedTelemetrySource | null> {
    return (
      this.store.telemetrySources.find(
        (s) => s.sourceId === sourceId && s.tenantId === tenantId && s.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async saveTelemetryChannel(channel: PersistedTelemetryChannel): Promise<PersistedTelemetryChannel> {
    const idx = this.store.telemetryChannels.findIndex((c) => c.channelId === channel.channelId);
    if (idx >= 0) this.store.telemetryChannels[idx] = channel;
    else this.store.telemetryChannels.push(channel);
    return channel;
  }

  async listTelemetryChannels(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetryChannel[]> {
    return this.store.telemetryChannels.filter(
      (c) => c.tenantId === tenantId && c.workspaceId === workspaceId && c.twinId === twinId,
    );
  }

  async saveTelemetryBinding(binding: PersistedTelemetryBinding): Promise<PersistedTelemetryBinding> {
    const idx = this.store.telemetryBindings.findIndex((b) => b.bindingId === binding.bindingId);
    if (idx >= 0) this.store.telemetryBindings[idx] = binding;
    else this.store.telemetryBindings.push(binding);
    return binding;
  }

  async getTelemetryBindingById(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryBinding | null> {
    return (
      this.store.telemetryBindings.find(
        (b) =>
          b.bindingId === bindingId && b.tenantId === tenantId && b.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async listTelemetryBindings(
    tenantId: string,
    workspaceId: string,
    twinId: string,
  ): Promise<PersistedTelemetryBinding[]> {
    return this.store.telemetryBindings.filter(
      (b) => b.tenantId === tenantId && b.workspaceId === workspaceId && b.twinId === twinId,
    );
  }

  async saveTelemetryAggregationPolicy(
    policy: PersistedTelemetryAggregationPolicy,
  ): Promise<PersistedTelemetryAggregationPolicy> {
    const idx = this.store.telemetryAggregationPolicies.findIndex(
      (p) => p.policyId === policy.policyId,
    );
    if (idx >= 0) this.store.telemetryAggregationPolicies[idx] = policy;
    else this.store.telemetryAggregationPolicies.push(policy);
    return policy;
  }

  async getTelemetryAggregationPolicyByBinding(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryAggregationPolicy | null> {
    return (
      this.store.telemetryAggregationPolicies.find(
        (p) =>
          p.bindingId === bindingId && p.tenantId === tenantId && p.workspaceId === workspaceId,
      ) ?? null
    );
  }

  async saveTelemetryProjectionRecord(
    record: PersistedTelemetryProjectionRecord,
  ): Promise<PersistedTelemetryProjectionRecord> {
    this.store.telemetryProjectionRecords.push(record);
    return record;
  }

  async listTelemetryProjectionRecords(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<PersistedTelemetryProjectionRecord[]> {
    return this.store.telemetryProjectionRecords.filter(
      (r) =>
        r.bindingId === bindingId && r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }

  async saveTelemetryBindingReview(
    review: TelemetryBindingReviewRecord,
  ): Promise<TelemetryBindingReviewRecord> {
    this.store.telemetryBindingReviews.push(review);
    return review;
  }

  async listTelemetryBindingReviews(
    tenantId: string,
    workspaceId: string,
    bindingId: string,
  ): Promise<TelemetryBindingReviewRecord[]> {
    return this.store.telemetryBindingReviews.filter(
      (r) =>
        r.bindingId === bindingId && r.tenantId === tenantId && r.workspaceId === workspaceId,
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
