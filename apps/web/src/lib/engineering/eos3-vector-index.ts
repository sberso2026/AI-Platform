/**
 * EOS 3.3 in-process vector index for staging/dev.
 * Reuses deterministic local hash embeddings pattern from project-intelligence.
 * VECTOR_INDEX_IS_NOT_SYSTEM_OF_RECORD — rebuild does not alter canonical state.
 */

import { createHash } from "node:crypto";
import { VECTOR_INDEX_IS_NOT_SYSTEM_OF_RECORD } from "./eos3-knowledge-tiers";

function hashToUnitFloat(seed: string, index: number): number {
  const digest = createHash("sha256").update(`${seed}:${index}`).digest();
  const value = digest.readUInt32BE(0) / 0xffffffff;
  return Number((value * 2 - 1).toFixed(6));
}

export function deterministicEmbed(text: string, dimensions = 64): number[] {
  const vector: number[] = [];
  for (let i = 0; i < dimensions; i += 1) vector.push(hashToUnitFloat(text, i));
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  return vector.map((v) => Number((v / norm).toFixed(6)));
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i += 1) dot += a[i]! * b[i]!;
  return dot;
}

export type VectorIndexEntry = {
  entryId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  sourceId: string;
  chunkId: string;
  text: string;
  embedding: number[];
  authorityRank: number;
  effectiveState: string;
};

export class Eos3VectorIndex {
  private entries = new Map<string, VectorIndexEntry>();

  upsert(entry: VectorIndexEntry): void {
    this.entries.set(entry.entryId, entry);
  }

  removeBySource(sourceId: string): void {
    for (const [id, e] of this.entries) {
      if (e.sourceId === sourceId) this.entries.delete(id);
    }
  }

  /** Full rebuild from provided entries — does not touch canonical object store. */
  rebuild(entries: VectorIndexEntry[]): { rebuilt: number; isSystemOfRecord: false } {
    this.entries.clear();
    for (const e of entries) this.entries.set(e.entryId, e);
    return { rebuilt: this.entries.size, isSystemOfRecord: false };
  }

  search(input: {
    query: string;
    tenantId: string;
    workspaceId: string;
    projectId?: string | null;
    limit?: number;
  }): Array<VectorIndexEntry & { score: number }> {
    const q = deterministicEmbed(input.query);
    const hits: Array<VectorIndexEntry & { score: number }> = [];
    for (const e of this.entries.values()) {
      if (e.tenantId !== input.tenantId || e.workspaceId !== input.workspaceId) continue;
      if (input.projectId && e.projectId && e.projectId !== input.projectId) continue;
      if (e.effectiveState === "REVOKED" || e.effectiveState === "WITHDRAWN") continue;
      hits.push({ ...e, score: cosine(q, e.embedding) });
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, input.limit ?? 10);
  }

  size(): number {
    return this.entries.size;
  }

  assertsNotSystemOfRecord(): typeof VECTOR_INDEX_IS_NOT_SYSTEM_OF_RECORD {
    return VECTOR_INDEX_IS_NOT_SYSTEM_OF_RECORD;
  }
}

export const EOS3_VECTOR_ARCHITECTURE_REUSE =
  "REUSE_PROJECT_INTELLIGENCE_DETERMINISTIC_LOCAL_EMBEDDING_PATTERN" as const;
