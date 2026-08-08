/**
 * Phase 12M — Shared Spatial Domain repository port + memory adapter.
 */

import { randomUUID } from "node:crypto";
import { PRODUCTION_MEMORY_REPOSITORY_ALLOWED } from "../version";
import {
  createSpatialOutboxEvent,
  type SpatialOutboxEvent,
} from "./events";
import { createPostgresSharedSpatialRepository } from "./postgres-repository";
import type {
  CoordinateReference,
  CoordinateReferenceSystemReference,
  LegacySpatialReconciliation,
  SpatialReference,
  SpatialReferenceReview,
  SpatialRelationshipReference,
} from "./spatial-references";

export type SharedSpatialRepositoryPort = {
  readonly adapterKind: "memory" | "postgres";
  newId(prefix: string): string;

  saveSpatialReference(ref: SpatialReference): Promise<SpatialReference>;
  getSpatialReference(
    tenantId: string,
    workspaceId: string,
    spatialReferenceId: string,
  ): Promise<SpatialReference | null>;
  listSpatialReferences(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialReference[]>;

  saveCrs(ref: CoordinateReferenceSystemReference): Promise<CoordinateReferenceSystemReference>;
  getCrs(
    tenantId: string,
    workspaceId: string,
    crsId: string,
  ): Promise<CoordinateReferenceSystemReference | null>;
  listCrs(
    tenantId: string,
    workspaceId: string,
  ): Promise<CoordinateReferenceSystemReference[]>;

  saveCoordinate(ref: CoordinateReference): Promise<CoordinateReference>;
  getCoordinate(
    tenantId: string,
    workspaceId: string,
    coordinateReferenceId: string,
  ): Promise<CoordinateReference | null>;
  listCoordinates(
    tenantId: string,
    workspaceId: string,
  ): Promise<CoordinateReference[]>;

  saveRelationship(
    ref: SpatialRelationshipReference,
  ): Promise<SpatialRelationshipReference>;
  getRelationship(
    tenantId: string,
    workspaceId: string,
    relationshipId: string,
  ): Promise<SpatialRelationshipReference | null>;
  listRelationships(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialRelationshipReference[]>;

  saveReconciliation(
    ref: LegacySpatialReconciliation,
  ): Promise<LegacySpatialReconciliation>;
  getReconciliation(
    tenantId: string,
    workspaceId: string,
    reconciliationId: string,
  ): Promise<LegacySpatialReconciliation | null>;
  listReconciliations(
    tenantId: string,
    workspaceId: string,
  ): Promise<LegacySpatialReconciliation[]>;

  saveReview(ref: SpatialReferenceReview): Promise<SpatialReferenceReview>;
  listReviews(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialReferenceReview[]>;

  enqueueOutbox(record: SpatialOutboxEvent): Promise<SpatialOutboxEvent>;
  listOutbox(tenantId: string, workspaceId: string): Promise<SpatialOutboxEvent[]>;
};

export type DurableSharedSpatialStore = {
  spatialReferences: SpatialReference[];
  crs: CoordinateReferenceSystemReference[];
  coordinates: CoordinateReference[];
  relationships: SpatialRelationshipReference[];
  reconciliations: LegacySpatialReconciliation[];
  reviews: SpatialReferenceReview[];
  outbox: SpatialOutboxEvent[];
};

export function createDurableSharedSpatialMemoryStore(
  seed?: Partial<DurableSharedSpatialStore>,
): DurableSharedSpatialStore {
  return {
    spatialReferences: seed?.spatialReferences ? [...seed.spatialReferences] : [],
    crs: seed?.crs ? [...seed.crs] : [],
    coordinates: seed?.coordinates ? [...seed.coordinates] : [],
    relationships: seed?.relationships ? [...seed.relationships] : [],
    reconciliations: seed?.reconciliations ? [...seed.reconciliations] : [],
    reviews: seed?.reviews ? [...seed.reviews] : [],
    outbox: seed?.outbox ? [...seed.outbox] : [],
  };
}

function scopeKey(tenantId: string, workspaceId: string) {
  return `${tenantId}::${workspaceId}`;
}

export class MemorySharedSpatialRepository implements SharedSpatialRepositoryPort {
  readonly adapterKind = "memory" as const;

  constructor(private readonly store: DurableSharedSpatialStore) {}

  newId(prefix: string): string {
    return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }

  async saveSpatialReference(ref: SpatialReference): Promise<SpatialReference> {
    const idx = this.store.spatialReferences.findIndex(
      (r) =>
        r.id === ref.id &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.spatialReferences[idx] = ref;
    else this.store.spatialReferences.push(ref);
    return ref;
  }

  async getSpatialReference(
    tenantId: string,
    workspaceId: string,
    spatialReferenceId: string,
  ): Promise<SpatialReference | null> {
    return (
      this.store.spatialReferences.find(
        (r) =>
          r.tenantId === tenantId &&
          r.workspaceId === workspaceId &&
          r.id === spatialReferenceId,
      ) ?? null
    );
  }

  async listSpatialReferences(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialReference[]> {
    return this.store.spatialReferences.filter(
      (r) => r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }

  async saveCrs(
    ref: CoordinateReferenceSystemReference,
  ): Promise<CoordinateReferenceSystemReference> {
    const idx = this.store.crs.findIndex(
      (r) =>
        r.crsId === ref.crsId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.crs[idx] = ref;
    else this.store.crs.push(ref);
    return ref;
  }

  async getCrs(
    tenantId: string,
    workspaceId: string,
    crsId: string,
  ): Promise<CoordinateReferenceSystemReference | null> {
    return (
      this.store.crs.find(
        (r) =>
          r.tenantId === tenantId &&
          r.workspaceId === workspaceId &&
          r.crsId === crsId,
      ) ?? null
    );
  }

  async listCrs(
    tenantId: string,
    workspaceId: string,
  ): Promise<CoordinateReferenceSystemReference[]> {
    return this.store.crs.filter(
      (r) => r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }

  async saveCoordinate(ref: CoordinateReference): Promise<CoordinateReference> {
    const idx = this.store.coordinates.findIndex(
      (r) =>
        r.coordinateReferenceId === ref.coordinateReferenceId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.coordinates[idx] = ref;
    else this.store.coordinates.push(ref);
    return ref;
  }

  async getCoordinate(
    tenantId: string,
    workspaceId: string,
    coordinateReferenceId: string,
  ): Promise<CoordinateReference | null> {
    return (
      this.store.coordinates.find(
        (r) =>
          r.tenantId === tenantId &&
          r.workspaceId === workspaceId &&
          r.coordinateReferenceId === coordinateReferenceId,
      ) ?? null
    );
  }

  async listCoordinates(
    tenantId: string,
    workspaceId: string,
  ): Promise<CoordinateReference[]> {
    return this.store.coordinates.filter(
      (r) => r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }

  async saveRelationship(
    ref: SpatialRelationshipReference,
  ): Promise<SpatialRelationshipReference> {
    const idx = this.store.relationships.findIndex(
      (r) =>
        r.relationshipId === ref.relationshipId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.relationships[idx] = ref;
    else this.store.relationships.push(ref);
    return ref;
  }

  async getRelationship(
    tenantId: string,
    workspaceId: string,
    relationshipId: string,
  ): Promise<SpatialRelationshipReference | null> {
    return (
      this.store.relationships.find(
        (r) =>
          r.tenantId === tenantId &&
          r.workspaceId === workspaceId &&
          r.relationshipId === relationshipId,
      ) ?? null
    );
  }

  async listRelationships(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialRelationshipReference[]> {
    return this.store.relationships.filter(
      (r) => r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }

  async saveReconciliation(
    ref: LegacySpatialReconciliation,
  ): Promise<LegacySpatialReconciliation> {
    const idx = this.store.reconciliations.findIndex(
      (r) =>
        r.reconciliationId === ref.reconciliationId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.reconciliations[idx] = ref;
    else this.store.reconciliations.push(ref);
    return ref;
  }

  async getReconciliation(
    tenantId: string,
    workspaceId: string,
    reconciliationId: string,
  ): Promise<LegacySpatialReconciliation | null> {
    return (
      this.store.reconciliations.find(
        (r) =>
          r.tenantId === tenantId &&
          r.workspaceId === workspaceId &&
          r.reconciliationId === reconciliationId,
      ) ?? null
    );
  }

  async listReconciliations(
    tenantId: string,
    workspaceId: string,
  ): Promise<LegacySpatialReconciliation[]> {
    return this.store.reconciliations.filter(
      (r) => r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }

  async saveReview(ref: SpatialReferenceReview): Promise<SpatialReferenceReview> {
    this.store.reviews.push(ref);
    return ref;
  }

  async listReviews(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialReferenceReview[]> {
    return this.store.reviews.filter(
      (r) => r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }

  async enqueueOutbox(record: SpatialOutboxEvent): Promise<SpatialOutboxEvent> {
    this.store.outbox.push(record);
    return record;
  }

  async listOutbox(
    tenantId: string,
    workspaceId: string,
  ): Promise<SpatialOutboxEvent[]> {
    return this.store.outbox.filter(
      (r) => r.tenantId === tenantId && r.workspaceId === workspaceId,
    );
  }
}

export type SharedSpatialRepositoryFactoryOptions = {
  adapter?: "memory" | "postgres";
  nodeEnv?: string;
  memoryStore?: DurableSharedSpatialStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase?: any;
};

export function createSharedSpatialRepository(
  options: SharedSpatialRepositoryFactoryOptions = {},
): SharedSpatialRepositoryPort {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const adapter =
    options.adapter ??
    (process.env.SHARED_SPATIAL_REPOSITORY_ADAPTER as "memory" | "postgres" | undefined) ??
    (nodeEnv === "production" ? "postgres" : "memory");

  if (adapter === "memory") {
    if (nodeEnv === "production" && !PRODUCTION_MEMORY_REPOSITORY_ALLOWED) {
      throw new Error("production_memory_repository_forbidden");
    }
    return new MemorySharedSpatialRepository(
      options.memoryStore ?? createDurableSharedSpatialMemoryStore(),
    );
  }

  if (!options.supabase) {
    throw new Error("postgres_repository_requires_supabase_client");
  }
  return createPostgresSharedSpatialRepository(options.supabase);
}

export { createSpatialOutboxEvent, scopeKey };
