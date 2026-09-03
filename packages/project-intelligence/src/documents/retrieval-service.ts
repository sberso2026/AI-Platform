import type { ProjectIntelligenceEmbeddingAdapter } from "./embedding-adapter";
import type { DocumentIndexFilter, DocumentIndexHit, ProjectIntelligenceDocumentIndexAdapter } from "./index-adapter";
import type { DocumentCitation } from "./types";
import { DocumentIntelligenceError } from "./errors";
import { excerptAroundQuery, lexicalOverlap, rerankHitsByQueryOverlap } from "./lexical-overlap";
import { planEngineeringQuery, queryPlanToDiagnostic, type EngineeringQueryPlan } from "./query-plan";

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

export interface RetrievalCandidateTrace {
  rank: number;
  chunkId: string;
  page: number | null;
  sectionPath: string | null;
  lexicalScore: number | null;
  ftsScore: number | null;
  distinctiveTermScore: number | null;
  fallbackScore: number | null;
  semanticScore: number | null;
  fusionScore: number | null;
  rerankScore: number | null;
  combinedScore: number;
  threshold: number;
  selected: boolean;
  rejectionReason: string | null;
}

export interface RetrievalResult {
  hits: readonly DocumentIndexHit[];
  citations: readonly DocumentCitation[];
  retrievalTraceId: string;
  maxScore: number;
  lexicalHitCount?: number;
  vectorHitCount?: number;
  vectorAttempted?: boolean;
  queryPlan?: EngineeringQueryPlan;
  candidates?: readonly RetrievalCandidateTrace[];
  queryPlanDiagnostic?: string;
  rank1Margin?: number | null;
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

function toCitation(hit: DocumentIndexHit, query: string): DocumentCitation {
  const meta = hit.chunk.metadata ?? {};
  return {
    engineeringDocumentId: hit.chunk.engineeringDocumentId,
    revision: hit.chunk.revision,
    pageStart: hit.chunk.pageStart,
    pageEnd: hit.chunk.pageEnd,
    sectionPath: hit.chunk.sectionPath,
    excerpt: excerptAroundQuery(hit.chunk.content, query),
    evidenceScore: hit.score,
    chunkId: hit.chunk.stableChunkId,
    sourceCoordinates: {
      figureNumber: meta.figureNumber ?? null,
      figureCaption: meta.figureCaption ?? null,
      blockType: hit.chunk.blockType,
    },
  };
}

function uniqueChunkWindows(hits: readonly DocumentIndexHit[], limit: number): DocumentIndexHit[] {
  const seen = new Set<string>();
  const selected: DocumentIndexHit[] = [];
  for (const hit of hits) {
    const clause = (hit.chunk.sectionPath ?? "").match(/\b(\d+(?:\.\d+){1,4})\b/)?.[1] ?? "";
    const key = clause
      ? [hit.chunk.engineeringDocumentId, String(hit.chunk.pageStart ?? ""), clause].join("|")
      : [
          hit.chunk.engineeringDocumentId,
          String(hit.chunk.pageStart ?? ""),
          (hit.chunk.sectionPath ?? "").replace(/\s+/g, " ").slice(0, 24),
          hit.chunk.content.replace(/\s+/g, " ").trim().slice(0, 48),
        ].join("|");
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(hit);
    if (selected.length >= limit) break;
  }
  return selected;
}

function rejectionReason(input: {
  hit: DocumentIndexHit;
  selectedIds: Set<string>;
  rankedIds: Set<string>;
  threshold: number;
  sameDocument: boolean;
}): string | null {
  if (input.selectedIds.has(input.hit.chunk.stableChunkId)) return null;
  if (!input.rankedIds.has(input.hit.chunk.stableChunkId)) return "not_lexically_relevant";
  if (input.sameDocument) {
    return input.hit.score > 0 ? "not_selected_after_window_dedupe" : "non_positive_score";
  }
  if (input.hit.score < input.threshold) return "below_score_threshold";
  return "not_selected_after_diversify";
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

    const requestedProjects = request.filters?.engineeringProjectIds;
    let projectFilter: string[] | undefined;
    if (auth.allowedProjectIds.length > 0) {
      projectFilter = (requestedProjects?.length ? requestedProjects : auth.allowedProjectIds)
        .filter((id) => auth.allowedProjectIds.includes(id));
      if (projectFilter.length === 0) {
        throw new DocumentIntelligenceError("document_access_denied", "Requested projects are outside permitted scope", 403);
      }
    } else if (requestedProjects?.length) {
      projectFilter = [...requestedProjects];
    }

    const filter: DocumentIndexFilter = {
      tenantId: auth.tenantId,
      workspaceId: auth.workspaceId,
      engineeringProjectIds: projectFilter,
      engineeringDocumentIds: request.filters?.engineeringDocumentIds,
      revisions: request.filters?.revisions,
    };

    const limit = request.limit ?? 8;
    const threshold = request.scoreThreshold ?? 0.35;
    const sameDocument = (request.filters?.engineeringDocumentIds?.length ?? 0) === 1;
    const plan = planEngineeringQuery(request.query);
    const channelLimit = sameDocument ? Math.max(limit * 8, 48) : limit * 2;

    const lexicalGroups = await Promise.all(
      plan.retrievalQueries.map((queryText) => this.index.lexicalSearch(queryText, filter, channelLimit)),
    );
    const lexicalById = new Map<string, number>();
    const ftsById = new Map<string, number>();
    const fallbackById = new Map<string, number>();
    for (const group of lexicalGroups) {
      for (const hit of group) {
        const prev = lexicalById.get(hit.chunk.stableChunkId);
        if (prev == null || hit.score > prev) {
          lexicalById.set(hit.chunk.stableChunkId, hit.score);
        }
        if (hit.ftsScore != null) {
          const prevFts = ftsById.get(hit.chunk.stableChunkId);
          if (prevFts == null || hit.ftsScore > prevFts) ftsById.set(hit.chunk.stableChunkId, hit.ftsScore);
        }
        if (hit.fallbackScore != null) {
          const prevFb = fallbackById.get(hit.chunk.stableChunkId);
          if (prevFb == null || hit.fallbackScore > prevFb) fallbackById.set(hit.chunk.stableChunkId, hit.fallbackScore);
        }
      }
    }
    const lexical: DocumentIndexHit[] = [];
    const seenLexical = new Set<string>();
    for (const group of lexicalGroups) {
      for (const hit of group) {
        if (seenLexical.has(hit.chunk.stableChunkId)) continue;
        seenLexical.add(hit.chunk.stableChunkId);
        lexical.push({
          ...hit,
          score: lexicalById.get(hit.chunk.stableChunkId) ?? hit.score,
        });
      }
    }

    let vector: readonly DocumentIndexHit[] = [];
    let vectorAttempted = false;
    const semanticById = new Map<string, number>();
    try {
      const embedded = await this.embeddings.embed({ texts: [plan.normalizedQuery], dimensions: 1536 });
      vectorAttempted = true;
      vector = await this.index.vectorSearch(embedded.embeddings[0] ?? [], filter, limit * 2);
      for (const hit of vector) semanticById.set(hit.chunk.stableChunkId, hit.score);
    } catch {
      vector = [];
    }

    const fused = combineHits(lexical, vector);
    const ranked = rerankHitsByQueryOverlap(fused, plan.normalizedQuery, plan.distinctiveTerms);
    const rankedById = new Map(ranked.map((hit) => [hit.chunk.stableChunkId, hit.score]));
    const rankedIds = new Set(ranked.map((hit) => hit.chunk.stableChunkId));
    const combined = sameDocument ? uniqueChunkWindows(ranked, limit) : diversify(ranked, limit);
    const filtered = sameDocument
      ? combined.filter((hit) => hit.score > 0)
      : combined.filter((hit) => hit.score >= threshold);
    const selectedIds = new Set(filtered.map((hit) => hit.chunk.stableChunkId));
    const candidates: RetrievalCandidateTrace[] = fused.slice(0, 20).map((hit, index) => {
      const distinctive = lexicalOverlap(
        `${hit.chunk.sectionPath ?? ""} ${hit.chunk.content}`,
        plan.distinctiveTerms,
      ).score;
      return {
        rank: index + 1,
        chunkId: hit.chunk.stableChunkId,
        page: hit.chunk.pageStart ?? null,
        sectionPath: hit.chunk.sectionPath ?? null,
        lexicalScore: lexicalById.get(hit.chunk.stableChunkId) ?? null,
        ftsScore: ftsById.get(hit.chunk.stableChunkId) ?? null,
        distinctiveTermScore: plan.distinctiveTerms.length ? distinctive : null,
        fallbackScore: fallbackById.get(hit.chunk.stableChunkId) ?? null,
        semanticScore: semanticById.get(hit.chunk.stableChunkId) ?? null,
        fusionScore: hit.score,
        rerankScore: rankedById.get(hit.chunk.stableChunkId) ?? null,
        combinedScore: hit.score,
        threshold,
        selected: selectedIds.has(hit.chunk.stableChunkId),
        rejectionReason: rejectionReason({ hit, selectedIds, rankedIds, threshold, sameDocument }),
      };
    });
    const rank1Margin = candidates.length >= 2
      ? (candidates[0]?.fusionScore ?? 0) - (candidates[1]?.fusionScore ?? 0)
      : candidates.length === 1 ? (candidates[0]?.fusionScore ?? 0) : null;
    const citations = filtered.map((hit) => toCitation(hit, plan.normalizedQuery));

    return {
      hits: filtered,
      citations,
      retrievalTraceId: this.createTraceId(),
      maxScore: filtered.reduce((max, hit) => Math.max(max, hit.score), 0),
      lexicalHitCount: lexical.length,
      vectorHitCount: vector.length,
      vectorAttempted,
      queryPlan: plan,
      candidates,
      queryPlanDiagnostic: queryPlanToDiagnostic(plan),
      rank1Margin,
    };
  }
}
