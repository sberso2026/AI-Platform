/**
 * Engineering Memory persistence adapters.
 * Platform Kernel MemoryService remains ownership — no second store.
 * In-memory fixture used for deterministic certification tests.
 */

import { createHash, randomUUID } from "node:crypto";
import type { AIMemory, MemoryClassification, MemoryScopeKey } from "@rtb/types";
import type {
  EngineeringMemoryRecord,
  EngineeringMemoryRetentionPolicy,
} from "./contracts";

export type EngineeringMemoryStoreStats = {
  captureLatencyMs: number;
  retrieveLatencyMs: number;
  lastCaptureAt: string | null;
  lastRetrieveAt: string | null;
};

export interface EngineeringMemoryStore {
  upsert(record: EngineeringMemoryRecord): Promise<EngineeringMemoryRecord>;
  getById(tenantId: string, memoryId: string): Promise<EngineeringMemoryRecord | null>;
  findByCaptureHash(
    tenantId: string,
    captureHash: string,
  ): Promise<EngineeringMemoryRecord | null>;
  list(tenantId: string, limit?: number): Promise<EngineeringMemoryRecord[]>;
  softDelete(tenantId: string, memoryId: string): Promise<void>;
  applyRetention(
    tenantId: string,
    memoryId: string,
    policy: EngineeringMemoryRetentionPolicy,
  ): Promise<EngineeringMemoryRecord | null>;
  revokeSourceAccess(tenantId: string, sourceId: string): Promise<number>;
  getStats(): EngineeringMemoryStoreStats;
}

export function computeCaptureHash(input: {
  tenantId: string;
  sourceType: string;
  sourceId: string;
  eventType?: string | null;
  toolInvocationId?: string | null;
}): string {
  return createHash("sha256")
    .update(
      [
        input.tenantId,
        input.sourceType,
        input.sourceId,
        input.eventType ?? "",
        input.toolInvocationId ?? "",
      ].join("|"),
    )
    .digest("hex")
    .slice(0, 24);
}

function scopeFor(record: EngineeringMemoryRecord): {
  scopeKey: MemoryScopeKey;
  scopeRefId: string;
} {
  if (record.projectId) {
    return { scopeKey: "project", scopeRefId: record.projectId };
  }
  if (record.workspaceId) {
    return { scopeKey: "workspace", scopeRefId: record.workspaceId };
  }
  return { scopeKey: "tenant", scopeRefId: record.tenantId };
}

function toPlatformContent(record: EngineeringMemoryRecord): string {
  return JSON.stringify({
    engineeringMemory: true,
    memoryId: record.memoryId,
    memoryClass: record.memoryClass,
    summary: record.summary,
    fact: record.fact ?? null,
    authorityStatus: record.authorityStatus,
    sourceType: record.sourceType,
    sourceId: record.sourceId,
    subject: {
      objectType: record.subject.objectType,
      objectId: record.subject.objectId,
      projectId: record.subject.projectId ?? null,
    },
    provenance: record.provenance,
    containsCot: false,
  });
}

function fromPlatformMemory(row: AIMemory): EngineeringMemoryRecord | null {
  const meta = row.metadata ?? {};
  if (meta.engineeringMemoryRecord && typeof meta.engineeringMemoryRecord === "object") {
    return meta.engineeringMemoryRecord as EngineeringMemoryRecord;
  }
  try {
    const parsed = JSON.parse(row.content) as { engineeringMemory?: boolean };
    if (!parsed.engineeringMemory) return null;
  } catch {
    return null;
  }
  return null;
}

/** Deterministic in-process store for tests / ESSENTIAL zero-infra capture. */
export class InMemoryEngineeringMemoryStore implements EngineeringMemoryStore {
  private readonly byId = new Map<string, EngineeringMemoryRecord>();
  private readonly deleted = new Set<string>();
  private stats: EngineeringMemoryStoreStats = {
    captureLatencyMs: 0,
    retrieveLatencyMs: 0,
    lastCaptureAt: null,
    lastRetrieveAt: null,
  };

  async upsert(record: EngineeringMemoryRecord): Promise<EngineeringMemoryRecord> {
    const t0 = Date.now();
    const key = `${record.tenantId}:${record.memoryId}`;
    this.byId.set(key, structuredClone(record));
    this.deleted.delete(key);
    this.stats.captureLatencyMs = Date.now() - t0;
    this.stats.lastCaptureAt = new Date().toISOString();
    return structuredClone(record);
  }

  async getById(tenantId: string, memoryId: string): Promise<EngineeringMemoryRecord | null> {
    const t0 = Date.now();
    const key = `${tenantId}:${memoryId}`;
    if (this.deleted.has(key)) {
      this.stats.retrieveLatencyMs = Date.now() - t0;
      this.stats.lastRetrieveAt = new Date().toISOString();
      return null;
    }
    const row = this.byId.get(key) ?? null;
    this.stats.retrieveLatencyMs = Date.now() - t0;
    this.stats.lastRetrieveAt = new Date().toISOString();
    return row ? structuredClone(row) : null;
  }

  async findByCaptureHash(
    tenantId: string,
    captureHash: string,
  ): Promise<EngineeringMemoryRecord | null> {
    for (const [key, row] of this.byId) {
      if (this.deleted.has(key)) continue;
      if (row.tenantId === tenantId && row.provenance.captureHash === captureHash) {
        return structuredClone(row);
      }
    }
    return null;
  }

  async list(tenantId: string, limit = 50): Promise<EngineeringMemoryRecord[]> {
    const t0 = Date.now();
    const rows = [...this.byId.values()]
      .filter((r) => r.tenantId === tenantId && !this.deleted.has(`${r.tenantId}:${r.memoryId}`))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
      .map((r) => structuredClone(r));
    this.stats.retrieveLatencyMs = Date.now() - t0;
    this.stats.lastRetrieveAt = new Date().toISOString();
    return rows;
  }

  async softDelete(tenantId: string, memoryId: string): Promise<void> {
    this.deleted.add(`${tenantId}:${memoryId}`);
  }

  async applyRetention(
    tenantId: string,
    memoryId: string,
    policy: EngineeringMemoryRetentionPolicy,
  ): Promise<EngineeringMemoryRecord | null> {
    const existing = await this.getById(tenantId, memoryId);
    if (!existing) return null;
    if (policy.action === "DELETE" && policy.hardDeletePermitted) {
      this.byId.delete(`${tenantId}:${memoryId}`);
      this.deleted.add(`${tenantId}:${memoryId}`);
      return null;
    }
    if (policy.action === "DELETE" || policy.action === "SOFT_DELETE") {
      await this.softDelete(tenantId, memoryId);
      return null;
    }
    const next: EngineeringMemoryRecord = {
      ...existing,
      retentionPolicy: policy,
      authorityStatus:
        policy.action === "ARCHIVE" && existing.authorityStatus === "APPROVED"
          ? existing.authorityStatus
          : existing.authorityStatus,
    };
    return this.upsert(next);
  }

  async revokeSourceAccess(tenantId: string, sourceId: string): Promise<number> {
    let n = 0;
    for (const [key, row] of this.byId) {
      if (row.tenantId !== tenantId || row.sourceId !== sourceId) continue;
      if (this.deleted.has(key)) continue;
      row.access = { ...row.access, revoked: true, restricted: true };
      this.byId.set(key, structuredClone(row));
      n += 1;
    }
    return n;
  }

  getStats(): EngineeringMemoryStoreStats {
    return { ...this.stats };
  }
}

/** Thin adapter over Platform Kernel MemoryService (ownership preserved). */
export class PlatformEngineeringMemoryAdapter implements EngineeringMemoryStore {
  private readonly local = new InMemoryEngineeringMemoryStore();
  private stats: EngineeringMemoryStoreStats = {
    captureLatencyMs: 0,
    retrieveLatencyMs: 0,
    lastCaptureAt: null,
    lastRetrieveAt: null,
  };

  constructor(
    private readonly platform: {
      store: (input: {
        tenantId: string;
        scopeKey: MemoryScopeKey;
        scopeRefId: string;
        content: string;
        classification?: MemoryClassification;
        createdBy?: string;
        expiresAt?: string;
        metadata?: Record<string, unknown>;
      }) => Promise<AIMemory>;
      retrieve: (input: {
        tenantId: string;
        scopeKey: MemoryScopeKey;
        scopeRefId: string;
        limit?: number;
      }) => Promise<AIMemory[]>;
      delete: (memoryId: string) => Promise<void>;
      list: (tenantId: string, limit?: number) => Promise<AIMemory[]>;
    } | null = null,
  ) {}

  async upsert(record: EngineeringMemoryRecord): Promise<EngineeringMemoryRecord> {
    const t0 = Date.now();
    let next = { ...record };
    if (this.platform) {
      const scope = scopeFor(record);
      const stored = await this.platform.store({
        tenantId: record.tenantId,
        scopeKey: scope.scopeKey,
        scopeRefId: scope.scopeRefId,
        content: toPlatformContent(record),
        classification: record.sensitivity as MemoryClassification,
        createdBy: record.createdBy,
        expiresAt: record.retentionPolicy?.applyAfter ?? undefined,
        metadata: {
          engineeringMemory: true,
          engineeringMemoryRecord: record,
          captureHash: record.provenance.captureHash,
          memoryClass: record.memoryClass,
          authorityStatus: record.authorityStatus,
          sourceType: record.sourceType,
          sourceId: record.sourceId,
          containsCot: false,
        },
      });
      next = {
        ...record,
        provenance: {
          ...record.provenance,
          platformMemoryId: stored.id,
          platformMemoryOwner: "platform_kernel",
        },
      };
    }
    await this.local.upsert(next);
    this.stats.captureLatencyMs = Date.now() - t0;
    this.stats.lastCaptureAt = new Date().toISOString();
    return next;
  }

  async getById(tenantId: string, memoryId: string): Promise<EngineeringMemoryRecord | null> {
    return this.local.getById(tenantId, memoryId);
  }

  async findByCaptureHash(
    tenantId: string,
    captureHash: string,
  ): Promise<EngineeringMemoryRecord | null> {
    return this.local.findByCaptureHash(tenantId, captureHash);
  }

  async list(tenantId: string, limit = 50): Promise<EngineeringMemoryRecord[]> {
    const t0 = Date.now();
    if (this.platform) {
      try {
        const rows = await this.platform.list(tenantId, limit);
        for (const row of rows) {
          const parsed = fromPlatformMemory(row);
          if (parsed && parsed.tenantId === tenantId) {
            await this.local.upsert(parsed);
          }
        }
      } catch {
        // Fail closed to local cache — never invent memories.
      }
    }
    const listed = await this.local.list(tenantId, limit);
    this.stats.retrieveLatencyMs = Date.now() - t0;
    this.stats.lastRetrieveAt = new Date().toISOString();
    return listed;
  }

  async softDelete(tenantId: string, memoryId: string): Promise<void> {
    const existing = await this.local.getById(tenantId, memoryId);
    if (existing?.provenance.platformMemoryId && this.platform) {
      await this.platform.delete(existing.provenance.platformMemoryId);
    }
    await this.local.softDelete(tenantId, memoryId);
  }

  async applyRetention(
    tenantId: string,
    memoryId: string,
    policy: EngineeringMemoryRetentionPolicy,
  ): Promise<EngineeringMemoryRecord | null> {
    if (policy.action === "DELETE" || policy.action === "SOFT_DELETE") {
      await this.softDelete(tenantId, memoryId);
      return null;
    }
    const existing = await this.local.getById(tenantId, memoryId);
    if (!existing) return null;
    return this.upsert({ ...existing, retentionPolicy: policy });
  }

  async revokeSourceAccess(tenantId: string, sourceId: string): Promise<number> {
    return this.local.revokeSourceAccess(tenantId, sourceId);
  }

  getStats(): EngineeringMemoryStoreStats {
    return { ...this.stats, ...this.local.getStats() };
  }
}

export function newMemoryId(): string {
  return `emem_${randomUUID()}`;
}
