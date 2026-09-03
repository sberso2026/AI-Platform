import type { SupabaseClient } from "@supabase/supabase-js";
import type { DocumentChunk } from "./types";
import type {
  DocumentIndexFilter,
  DocumentIndexHit,
  IndexedDocumentChunk,
  ProjectIntelligenceDocumentIndexAdapter,
} from "./index-adapter";
import { planEngineeringQuery } from "./query-plan";
import { contentContainsTerm, termSearchVariants } from "./lexical-overlap";

function maxNullable(left: number | null | undefined, right: number | null | undefined): number | null {
  if (left == null && right == null) return null;
  return Math.max(left ?? Number.NEGATIVE_INFINITY, right ?? Number.NEGATIVE_INFINITY);
}

function toVectorLiteral(values: readonly number[]): string {
  return `[${values.join(",")}]`;
}

/**
 * Durable hybrid index backed by PostgreSQL tsvector + pgvector.
 * Filters are applied in SQL — never fetch cross-tenant then filter in memory.
 */
export class PostgresDocumentIndexAdapter implements ProjectIntelligenceDocumentIndexAdapter {
  readonly kind = "postgres" as const;

  constructor(private readonly supabase: SupabaseClient) {}

  async upsert(chunks: readonly IndexedDocumentChunk[]): Promise<void> {
    for (const chunk of chunks) {
      if (!chunk.embedding || chunk.embedding.length !== 1536) {
        throw new Error(`Chunk ${chunk.stableChunkId} missing 1536-dim embedding for pgvector upsert`);
      }
      // Embeddings are written by the worker against chunk rows; upsert is a no-op for index adapter
      // when rows already exist. Vector search reads from project_intelligence_document_embeddings.
      void chunk;
    }
  }

  async deleteByDocument(filter: DocumentIndexFilter & { engineeringDocumentId: string }): Promise<void> {
    const now = new Date().toISOString();
    await this.supabase
      .from("project_intelligence_document_chunks")
      .update({ deleted_at: now, status: "superseded" })
      .eq("tenant_id", filter.tenantId)
      .eq("workspace_id", filter.workspaceId)
      .eq("engineering_document_id", filter.engineeringDocumentId);
    await this.supabase
      .from("project_intelligence_document_embeddings")
      .update({ deleted_at: now, status: "superseded" })
      .eq("tenant_id", filter.tenantId)
      .eq("workspace_id", filter.workspaceId)
      .eq("engineering_document_id", filter.engineeringDocumentId);
  }

  async lexicalSearch(query: string, filter: DocumentIndexFilter, limit = 10): Promise<readonly DocumentIndexHit[]> {
    const { data, error } = await this.supabase.rpc("pi_document_lexical_search", {
      p_tenant_id: filter.tenantId,
      p_workspace_id: filter.workspaceId,
      p_query: query,
      p_limit: limit,
      p_project_ids: filter.engineeringProjectIds ?? null,
      p_document_ids: filter.engineeringDocumentIds ?? null,
      p_revisions: filter.revisions ?? null,
    });
    const rpcHits = error
      ? []
      : (data as Array<Record<string, unknown>> ?? []).map((row) => this.rowToHit(row, "lexical", [], "fts"));
    const fallbackHits = await this.lexicalFallback(query, filter, limit);
    const merged = new Map<string, DocumentIndexHit>();
    for (const hit of [...rpcHits, ...fallbackHits]) {
      const existing = merged.get(hit.chunk.stableChunkId);
      if (!existing) {
        merged.set(hit.chunk.stableChunkId, hit);
        continue;
      }
      merged.set(hit.chunk.stableChunkId, {
        ...existing,
        score: Math.max(existing.score, hit.score),
        ftsScore: maxNullable(existing.ftsScore, hit.ftsScore),
        fallbackScore: maxNullable(existing.fallbackScore, hit.fallbackScore),
      });
    }
    return [...merged.values()].sort((a, b) => b.score - a.score).slice(0, Math.max(limit, fallbackHits.length));
  }

  async vectorSearch(embedding: readonly number[], filter: DocumentIndexFilter, limit = 10): Promise<readonly DocumentIndexHit[]> {
    const { data, error } = await this.supabase.rpc("pi_document_vector_search", {
      p_tenant_id: filter.tenantId,
      p_workspace_id: filter.workspaceId,
      p_query_embedding: toVectorLiteral(embedding),
      p_limit: limit,
      p_project_ids: filter.engineeringProjectIds ?? null,
      p_document_ids: filter.engineeringDocumentIds ?? null,
      p_revisions: filter.revisions ?? null,
    });
    if (error) throw new Error(`pi_document_vector_search failed: ${error.message}`);
    return (data as Array<Record<string, unknown>>).map((row) => this.rowToHit(row, "vector"));
  }

  private async lexicalFallback(query: string, filter: DocumentIndexFilter, limit: number): Promise<readonly DocumentIndexHit[]> {
    const plan = planEngineeringQuery(query);
    const terms = (plan.distinctiveTerms.length ? plan.distinctiveTerms : plan.retrievalQueries[0]?.split(/\s+/) ?? [])
      .slice(0, 8);
    const searchTerms = [...new Set(
      (terms.length ? terms : [query.replace(/[% ,]/g, " ").trim() || query])
        .flatMap((term) => termSearchVariants(term)),
    )].slice(0, 12);
    const orClause = searchTerms
      .map((term) => `content.ilike.%${term.replace(/[%*,()]/g, "")}%`)
      .join(",");
    let builder = this.supabase
      .from("project_intelligence_document_chunks")
      .select("*")
      .eq("tenant_id", filter.tenantId)
      .eq("workspace_id", filter.workspaceId)
      .is("deleted_at", null)
      .or(orClause)
      .limit(Math.max(limit * 12, 200));
    if (filter.engineeringDocumentIds?.length) {
      builder = builder.in("engineering_document_id", [...filter.engineeringDocumentIds]);
    }
    if (filter.engineeringProjectIds?.length) {
      builder = builder.in("engineering_project_id", [...filter.engineeringProjectIds]);
    }
    if (filter.revisions?.length) {
      builder = builder.in("source_revision", [...filter.revisions]);
    }
    const { data, error } = await builder;
    if (error) throw new Error(error.message);
    return (data ?? [])
      .map((row) => this.rowToHit(row as Record<string, unknown>, "lexical", searchTerms, "fallback"))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private rowToHit(
    row: Record<string, unknown>,
    source: "lexical" | "vector",
    queryTerms: readonly string[] = [],
    channel: "fts" | "fallback" | "vector" = source === "vector" ? "vector" : "fts",
  ): DocumentIndexHit {
    const chunk: DocumentChunk = {
      id: String(row.chunk_id ?? row.id),
      engineeringDocumentId: String(row.engineering_document_id),
      revision: String(row.source_revision ?? row.revision ?? "A"),
      processingVersion: String(row.processing_version ?? "1"),
      chunkIndex: Number(row.chunk_index ?? 0),
      stableChunkId: String(row.stable_chunk_id ?? row.chunk_id ?? row.id),
      content: String(row.content ?? ""),
      contentHash: String(row.content_hash ?? ""),
      sectionPath: row.section_path ? String(row.section_path) : undefined,
      pageStart: row.page_start == null ? undefined : Number(row.page_start),
      pageEnd: row.page_end == null ? undefined : Number(row.page_end),
      blockType: (row.block_type as DocumentChunk["blockType"]) ?? "paragraph",
      tenantId: String(row.tenant_id),
      workspaceId: String(row.workspace_id),
      engineeringProjectId: row.engineering_project_id ? String(row.engineering_project_id) : undefined,
      metadata: row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : undefined,
    };
    const rawScore = Number(row.score ?? row.rank);
    const overlapHay = `${chunk.sectionPath ?? ""} ${chunk.content}`;
    const overlap = queryTerms.length
      ? queryTerms.filter((term) => contentContainsTerm(overlapHay, term)).length / queryTerms.length
      : 0;
    const score = Number.isFinite(rawScore) && rawScore > 0
      ? rawScore
      : source === "lexical"
        ? (overlap > 0 ? overlap : 0)
        : 0;
    return {
      chunk,
      score,
      source,
      ftsScore: channel === "fts" ? score : null,
      fallbackScore: channel === "fallback" ? score : null,
    };
  }
}
