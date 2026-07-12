import type { DocumentChunk } from "./types";

export interface IndexedDocumentChunk extends DocumentChunk {
  embedding?: readonly number[];
}

export interface DocumentIndexFilter {
  tenantId: string;
  workspaceId: string;
  engineeringProjectIds?: readonly string[];
  engineeringDocumentIds?: readonly string[];
  revisions?: readonly string[];
}

export interface DocumentIndexHit {
  chunk: IndexedDocumentChunk;
  score: number;
  source: "lexical" | "vector" | "hybrid";
}

export interface ProjectIntelligenceDocumentIndexAdapter {
  upsert(chunks: readonly IndexedDocumentChunk[]): Promise<void>;
  deleteByDocument(filter: DocumentIndexFilter & { engineeringDocumentId: string }): Promise<void>;
  lexicalSearch(query: string, filter: DocumentIndexFilter, limit?: number): Promise<readonly DocumentIndexHit[]>;
  vectorSearch(embedding: readonly number[], filter: DocumentIndexFilter, limit?: number): Promise<readonly DocumentIndexHit[]>;
}

function cosine(a: readonly number[], b: readonly number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < len; i += 1) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

function matchesFilter(chunk: IndexedDocumentChunk, filter: DocumentIndexFilter): boolean {
  if (chunk.tenantId !== filter.tenantId || chunk.workspaceId !== filter.workspaceId) return false;
  if (filter.engineeringProjectIds?.length) {
    if (!chunk.engineeringProjectId || !filter.engineeringProjectIds.includes(chunk.engineeringProjectId)) return false;
  }
  if (filter.engineeringDocumentIds?.length && !filter.engineeringDocumentIds.includes(chunk.engineeringDocumentId)) {
    return false;
  }
  if (filter.revisions?.length && !filter.revisions.includes(chunk.revision)) return false;
  return true;
}

export class InMemoryDocumentIndexAdapter implements ProjectIntelligenceDocumentIndexAdapter {
  private readonly chunks = new Map<string, IndexedDocumentChunk>();

  async upsert(chunks: readonly IndexedDocumentChunk[]): Promise<void> {
    for (const chunk of chunks) {
      this.chunks.set(chunk.stableChunkId, chunk);
    }
  }

  async deleteByDocument(filter: DocumentIndexFilter & { engineeringDocumentId: string }): Promise<void> {
    for (const [key, chunk] of this.chunks) {
      if (
        chunk.engineeringDocumentId === filter.engineeringDocumentId &&
        chunk.tenantId === filter.tenantId &&
        chunk.workspaceId === filter.workspaceId
      ) {
        this.chunks.delete(key);
      }
    }
  }

  async lexicalSearch(query: string, filter: DocumentIndexFilter, limit = 10): Promise<readonly DocumentIndexHit[]> {
    const terms = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const hits: DocumentIndexHit[] = [];
    for (const chunk of this.chunks.values()) {
      if (!matchesFilter(chunk, filter)) continue;
      const hay = chunk.content.toLocaleLowerCase();
      const matched = terms.filter((term) => hay.includes(term)).length;
      if (matched === 0) continue;
      hits.push({ chunk, score: matched / terms.length, source: "lexical" });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, limit);
  }

  async vectorSearch(embedding: readonly number[], filter: DocumentIndexFilter, limit = 10): Promise<readonly DocumentIndexHit[]> {
    const hits: DocumentIndexHit[] = [];
    for (const chunk of this.chunks.values()) {
      if (!matchesFilter(chunk, filter) || !chunk.embedding) continue;
      hits.push({ chunk, score: cosine(embedding, chunk.embedding), source: "vector" });
    }
    return hits.sort((a, b) => b.score - a.score).slice(0, limit);
  }
}

/** Marker for postgres-backed index adapters. */
export interface PostgresDocumentIndexPort extends ProjectIntelligenceDocumentIndexAdapter {
  readonly kind: "postgres";
}
