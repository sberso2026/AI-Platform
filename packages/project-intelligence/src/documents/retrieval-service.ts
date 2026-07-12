import type { ProjectIntelligenceEmbeddingAdapter } from "./embedding-adapter";
import type { DocumentIndexFilter, DocumentIndexHit, ProjectIntelligenceDocumentIndexAdapter } from "./index-adapter";
import type { DocumentCitation } from "./types";
import { DocumentIntelligenceError } from "./errors";

export interface RetrievalAuthorization {
  tenantId: string;
  workspaceId: string;
  allowedProjectIds: readonly string[];
  authorized: boolean;
}

export interface RetrievalQuery {
  query: string;
  filters?: {
    engineeringProjectIds?: readonly string[];
    engineeringDocumentIds?: readonly string[];
    revisions?: readonly string[];
  };
  limit?: number;
  scoreThreshold?: number;
}

export interface RetrievalResult {
  hits: readonly DocumentIndexHit[];
  citations: readonly DocumentCitation[];
  retrievalTraceId: string;
  maxScore: number;
}

function combineHits(lexical: readonly DocumentIndexHit[], vector: readonly DocumentIndexHit[]): DocumentIndexHit[] {
  const byId = new Map<string, DocumentIndexHit>();
  for (const hit of [...lexical, ...vector]) {
    const existing = byId.get(hit.chunk.stableChunkId);
    if (!existing || hit.score > existing.score) {
      byId.set(hit.chunk.stableChunkId, {
        ...hit,
        source: existing && existing.source !== hit.source ? "hybrid" : hit.source,
        score: existing ? Math.min(1, existing.score * 0.45 + hit.score * 0.55 + 0.05) : hit.score,
      });
    }
  }
  return [...byId.values()].sort((a, b) => b.score - a.score);
}

function diversify(hits: readonly DocumentIndexHit[], limit: number): DocumentIndexHit[] {
  const seenDocs = new Set<string>();
  const selected: DocumentIndexHit[] = [];
  for (const hit of hits) {
    const key = `${hit.chunk.engineeringDocumentId}:${hit.chunk.revision}`;
    if (seenDocs.has(key) && selected.length >= Math.ceil(limit / 2)) continue;
    seenDocs.add(key);
    selected.push(hit);
    if (selected.length >= limit) break;
  }
  return selected;
}

function toCitation(hit: DocumentIndexHit): DocumentCitation {
  return {
    engineeringDocumentId: hit.chunk.engineeringDocumentId,
    revision: hit.chunk.revision,
    pageStart: hit.chunk.pageStart,
    pageEnd: hit.chunk.pageEnd,
    sectionPath: hit.chunk.sectionPath,
    excerpt: hit.chunk.content.slice(0, 500),
    evidenceScore: hit.score,
    chunkId: hit.chunk.stableChunkId,
  };
}

export class ProjectIntelligenceDocumentRetrievalService {
  constructor(
    private readonly index: ProjectIntelligenceDocumentIndexAdapter,
    private readonly embeddings: ProjectIntelligenceEmbeddingAdapter,
    private readonly createTraceId: () => string = () => `ret-${Date.now().toString(36)}`,
  ) {}

  async retrieve(auth: RetrievalAuthorization, request: RetrievalQuery): Promise<RetrievalResult> {
    if (!auth.authorized) {
      throw new DocumentIntelligenceError("document_access_denied", "Document retrieval is not authorized", 403);
    }

    const projectFilter = request.filters?.engineeringProjectIds?.length
      ? request.filters.engineeringProjectIds.filter((id) => auth.allowedProjectIds.includes(id))
      : [...auth.allowedProjectIds];

    if (projectFilter.length === 0 && auth.allowedProjectIds.length > 0) {
      throw new DocumentIntelligenceError("document_access_denied", "Requested projects are outside permitted scope", 403);
    }

    const filter: DocumentIndexFilter = {
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId,
      engineeringProjectIds: projectFilter.length ? projectFilter : undefined,
      engineeringDocumentIds: request.filters?.engineeringDocumentIds,
      revisions: request.filters?.revisions,
    };

    const limit = request.limit ?? 8;
    const threshold = request.scoreThreshold ?? 0.35;
    const [lexical, embedded] = await Promise.all([
      this.index.lexicalSearch(request.query, filter, limit * 2),
      this.embeddings.embed({ texts: [request.query], dimensions: 64 }),
    ]);
    const vector = await this.index.vectorSearch(embedded.embeddings[0] ?? [], filter, limit * 2);
    const combined = diversify(combineHits(lexical, vector), limit);
    const filtered = combined.filter((hit) => hit.score >= threshold);
    const citations = filtered.map(toCitation);

    return {
      hits: filtered,
      citations,
      retrievalTraceId: this.createTraceId(),
      maxScore: filtered.reduce((max, hit) => Math.max(max, hit.score), 0),
    };
  }
}
