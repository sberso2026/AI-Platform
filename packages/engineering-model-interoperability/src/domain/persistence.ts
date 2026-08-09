/**
 * Phase 13B — Engineering Model Interoperability repository port + memory adapter.
 */

import { randomUUID } from "node:crypto";
import { PRODUCTION_MEMORY_REPOSITORY_ALLOWED } from "../version";
import type { EngineeringModelChangeImpact } from "./change-impact";
import type { EngineeringModelOutboxEvent } from "./events";
import type { EngineeringModelElementReference } from "./engineering-model-element-reference";
import type {
  EngineeringModelReference,
  EngineeringModelVersion,
} from "./engineering-model-reference";
import type {
  EngineeringModelMapping,
  EngineeringModelMappingReview,
} from "./mappings";
import { createPostgresEngineeringModelRepository } from "./postgres-repository";
import type { EngineeringAnalysisResultReference } from "./result-reference";

export type EngineeringModelRepositoryPort = {
  readonly adapterKind: "memory" | "postgres";
  newId(prefix: string): string;

  saveModel(ref: EngineeringModelReference): Promise<EngineeringModelReference>;
  getModel(
    tenantId: string,
    workspaceId: string,
    modelRefId: string,
  ): Promise<EngineeringModelReference | null>;
  listModels(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringModelReference[]>;

  saveVersion(ref: EngineeringModelVersion): Promise<EngineeringModelVersion>;
  getVersion(
    tenantId: string,
    workspaceId: string,
    modelVersionId: string,
  ): Promise<EngineeringModelVersion | null>;
  listVersions(
    tenantId: string,
    workspaceId: string,
    modelRefId?: string,
  ): Promise<EngineeringModelVersion[]>;

  saveElement(
    ref: EngineeringModelElementReference,
  ): Promise<EngineeringModelElementReference>;
  getElement(
    tenantId: string,
    workspaceId: string,
    elementRefId: string,
  ): Promise<EngineeringModelElementReference | null>;
  listElements(
    tenantId: string,
    workspaceId: string,
    modelRefId?: string,
  ): Promise<EngineeringModelElementReference[]>;

  saveMapping(ref: EngineeringModelMapping): Promise<EngineeringModelMapping>;
  getMapping(
    tenantId: string,
    workspaceId: string,
    mappingId: string,
  ): Promise<EngineeringModelMapping | null>;
  listMappings(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringModelMapping[]>;

  saveReview(
    ref: EngineeringModelMappingReview,
  ): Promise<EngineeringModelMappingReview>;
  listReviews(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringModelMappingReview[]>;

  saveChangeImpact(
    ref: EngineeringModelChangeImpact,
  ): Promise<EngineeringModelChangeImpact>;
  listChangeImpacts(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringModelChangeImpact[]>;

  saveResult(
    ref: EngineeringAnalysisResultReference,
  ): Promise<EngineeringAnalysisResultReference>;
  listResults(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringAnalysisResultReference[]>;

  enqueueOutbox(
    record: EngineeringModelOutboxEvent,
  ): Promise<EngineeringModelOutboxEvent>;
  listOutbox(
    tenantId: string,
    workspaceId: string,
  ): Promise<EngineeringModelOutboxEvent[]>;
};

export type DurableEngineeringModelStore = {
  models: EngineeringModelReference[];
  versions: EngineeringModelVersion[];
  elements: EngineeringModelElementReference[];
  mappings: EngineeringModelMapping[];
  reviews: EngineeringModelMappingReview[];
  changeImpacts: EngineeringModelChangeImpact[];
  results: EngineeringAnalysisResultReference[];
  outbox: EngineeringModelOutboxEvent[];
};

export function createDurableEngineeringModelMemoryStore(
  seed?: Partial<DurableEngineeringModelStore>,
): DurableEngineeringModelStore {
  return {
    models: seed?.models ? [...seed.models] : [],
    versions: seed?.versions ? [...seed.versions] : [],
    elements: seed?.elements ? [...seed.elements] : [],
    mappings: seed?.mappings ? [...seed.mappings] : [],
    reviews: seed?.reviews ? [...seed.reviews] : [],
    changeImpacts: seed?.changeImpacts ? [...seed.changeImpacts] : [],
    results: seed?.results ? [...seed.results] : [],
    outbox: seed?.outbox ? [...seed.outbox] : [],
  };
}

function scoped<T extends { tenantId: string; workspaceId: string }>(
  items: T[],
  tenantId: string,
  workspaceId: string,
): T[] {
  return items.filter(
    (i) => i.tenantId === tenantId && i.workspaceId === workspaceId,
  );
}

export class MemoryEngineeringModelRepository
  implements EngineeringModelRepositoryPort
{
  readonly adapterKind = "memory" as const;

  constructor(private readonly store: DurableEngineeringModelStore) {}

  newId(prefix: string): string {
    return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
  }

  async saveModel(ref: EngineeringModelReference): Promise<EngineeringModelReference> {
    const idx = this.store.models.findIndex(
      (r) =>
        r.modelRefId === ref.modelRefId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.models[idx] = ref;
    else this.store.models.push(ref);
    return ref;
  }

  async getModel(tenantId: string, workspaceId: string, modelRefId: string) {
    return (
      scoped(this.store.models, tenantId, workspaceId).find(
        (r) => r.modelRefId === modelRefId,
      ) ?? null
    );
  }

  async listModels(tenantId: string, workspaceId: string) {
    return scoped(this.store.models, tenantId, workspaceId);
  }

  async saveVersion(ref: EngineeringModelVersion): Promise<EngineeringModelVersion> {
    const idx = this.store.versions.findIndex(
      (r) =>
        r.modelVersionId === ref.modelVersionId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.versions[idx] = ref;
    else this.store.versions.push(ref);
    return ref;
  }

  async getVersion(tenantId: string, workspaceId: string, modelVersionId: string) {
    return (
      scoped(this.store.versions, tenantId, workspaceId).find(
        (r) => r.modelVersionId === modelVersionId,
      ) ?? null
    );
  }

  async listVersions(tenantId: string, workspaceId: string, modelRefId?: string) {
    const rows = scoped(this.store.versions, tenantId, workspaceId);
    return modelRefId ? rows.filter((r) => r.modelRefId === modelRefId) : rows;
  }

  async saveElement(
    ref: EngineeringModelElementReference,
  ): Promise<EngineeringModelElementReference> {
    const idx = this.store.elements.findIndex(
      (r) =>
        r.elementRefId === ref.elementRefId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.elements[idx] = ref;
    else this.store.elements.push(ref);
    return ref;
  }

  async getElement(tenantId: string, workspaceId: string, elementRefId: string) {
    return (
      scoped(this.store.elements, tenantId, workspaceId).find(
        (r) => r.elementRefId === elementRefId,
      ) ?? null
    );
  }

  async listElements(tenantId: string, workspaceId: string, modelRefId?: string) {
    const rows = scoped(this.store.elements, tenantId, workspaceId);
    return modelRefId ? rows.filter((r) => r.modelRefId === modelRefId) : rows;
  }

  async saveMapping(ref: EngineeringModelMapping): Promise<EngineeringModelMapping> {
    const idx = this.store.mappings.findIndex(
      (r) =>
        r.mappingId === ref.mappingId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.mappings[idx] = ref;
    else this.store.mappings.push(ref);
    return ref;
  }

  async getMapping(tenantId: string, workspaceId: string, mappingId: string) {
    return (
      scoped(this.store.mappings, tenantId, workspaceId).find(
        (r) => r.mappingId === mappingId,
      ) ?? null
    );
  }

  async listMappings(tenantId: string, workspaceId: string) {
    return scoped(this.store.mappings, tenantId, workspaceId);
  }

  async saveReview(
    ref: EngineeringModelMappingReview,
  ): Promise<EngineeringModelMappingReview> {
    this.store.reviews.push(ref);
    return ref;
  }

  async listReviews(tenantId: string, workspaceId: string) {
    return scoped(this.store.reviews, tenantId, workspaceId);
  }

  async saveChangeImpact(
    ref: EngineeringModelChangeImpact,
  ): Promise<EngineeringModelChangeImpact> {
    const idx = this.store.changeImpacts.findIndex(
      (r) =>
        r.changeImpactId === ref.changeImpactId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.changeImpacts[idx] = ref;
    else this.store.changeImpacts.push(ref);
    return ref;
  }

  async listChangeImpacts(tenantId: string, workspaceId: string) {
    return scoped(this.store.changeImpacts, tenantId, workspaceId);
  }

  async saveResult(
    ref: EngineeringAnalysisResultReference,
  ): Promise<EngineeringAnalysisResultReference> {
    const idx = this.store.results.findIndex(
      (r) =>
        r.resultRefId === ref.resultRefId &&
        r.tenantId === ref.tenantId &&
        r.workspaceId === ref.workspaceId,
    );
    if (idx >= 0) this.store.results[idx] = ref;
    else this.store.results.push(ref);
    return ref;
  }

  async listResults(tenantId: string, workspaceId: string) {
    return scoped(this.store.results, tenantId, workspaceId);
  }

  async enqueueOutbox(record: EngineeringModelOutboxEvent) {
    this.store.outbox.push(record);
    return record;
  }

  async listOutbox(tenantId: string, workspaceId: string) {
    return scoped(this.store.outbox, tenantId, workspaceId);
  }
}

export type EngineeringModelRepositoryFactoryOptions = {
  adapter?: "memory" | "postgres";
  nodeEnv?: string;
  memoryStore?: DurableEngineeringModelStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase?: any;
};

export function createEngineeringModelRepository(
  options: EngineeringModelRepositoryFactoryOptions = {},
): EngineeringModelRepositoryPort {
  const nodeEnv = options.nodeEnv ?? process.env.NODE_ENV ?? "development";
  const adapter =
    options.adapter ??
    process.env.ENGINEERING_MODEL_REPOSITORY_ADAPTER ??
    (nodeEnv === "production" ? "postgres" : "memory");

  if (adapter === "memory") {
    if (nodeEnv === "production" && !PRODUCTION_MEMORY_REPOSITORY_ALLOWED) {
      throw new Error("production_memory_repository_forbidden");
    }
    return new MemoryEngineeringModelRepository(
      options.memoryStore ?? createDurableEngineeringModelMemoryStore(),
    );
  }
  if (!options.supabase) {
    throw new Error("postgres_repository_requires_supabase_client");
  }
  return createPostgresEngineeringModelRepository(options.supabase);
}
