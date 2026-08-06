/**
 * Phase 8G — Hybrid unified search (lexical + vector metadata + filters).
 * Document vector path reuses Document Intelligence; other modalities are lexical/metadata.
 */
import type { KnowledgeCitation, KnowledgeNodeRef } from "./types";

export type UnifiedSearchHit = {
  refId: string;
  kind: KnowledgeNodeRef["kind"];
  owner: KnowledgeNodeRef["owner"];
  title: string;
  snippet: string;
  score: number;
  source: "lexical" | "vector" | "hybrid" | "metadata";
  drillDownPath: string;
  citations: readonly KnowledgeCitation[];
};

export type UnifiedSearchRequest = {
  query: string;
  tenantId: string;
  workspaceId: string;
  projectIds?: readonly string[];
  kinds?: readonly KnowledgeNodeRef["kind"][];
  owners?: readonly KnowledgeNodeRef["owner"][];
  limit?: number;
};

export type UnifiedSearchResult = {
  hits: readonly UnifiedSearchHit[];
  retrievalTraceId: string;
  hybrid: true;
  duplicateOwnership: false;
};

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((t) => t.length > 1);
}

function lexicalScore(query: string, title: string, snippet?: string): number {
  const tokens = tokenize(query);
  if (!tokens.length) return 0;
  const hay = `${title} ${snippet ?? ""}`.toLowerCase();
  let hits = 0;
  for (const t of tokens) if (hay.includes(t)) hits += 1;
  return hits / tokens.length;
}

export function hybridSearchNodes(
  nodes: readonly KnowledgeNodeRef[],
  request: UnifiedSearchRequest,
  vectorBoosts: ReadonlyMap<string, number> = new Map(),
): UnifiedSearchResult {
  if (!request.tenantId || !request.workspaceId) {
    throw new Error("Unified search requires tenant and workspace scope");
  }
  const limit = request.limit ?? 20;
  const filtered = nodes.filter((n) => {
    if (n.tenantId !== request.tenantId || n.workspaceId !== request.workspaceId) return false;
    if (n.storesBusinessRecord !== false) return false;
    if (request.projectIds?.length && n.projectId && !request.projectIds.includes(n.projectId)) {
      return false;
    }
    if (request.kinds?.length && !request.kinds.includes(n.kind)) return false;
    if (request.owners?.length && !request.owners.includes(n.owner)) return false;
    return true;
  });

  const scored: UnifiedSearchHit[] = [];
  for (const n of filtered) {
    const lex = lexicalScore(request.query, n.title, n.snippet);
    const vec = vectorBoosts.get(n.refId) ?? 0;
    if (lex <= 0 && vec <= 0) continue;
    const score = Math.min(1, lex * 0.55 + vec * 0.45 + (lex > 0 && vec > 0 ? 0.05 : 0));
    const source =
      lex > 0 && vec > 0 ? "hybrid" : vec > 0 ? "vector" : lex > 0 ? "lexical" : "metadata";
    const citation: KnowledgeCitation = {
      owner: n.owner,
      kind: n.kind,
      refId: n.refId,
      excerpt: (n.snippet ?? n.title).slice(0, 280),
      score,
      drillDownPath: n.drillDownPath,
    };
    scored.push({
      refId: n.refId,
      kind: n.kind,
      owner: n.owner,
      title: n.title,
      snippet: n.snippet ?? n.title,
      score,
      source,
      drillDownPath: n.drillDownPath,
      citations: [citation],
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return {
    hits: scored.slice(0, limit),
    retrievalTraceId: `kg-search-${Date.now().toString(36)}`,
    hybrid: true,
    duplicateOwnership: false,
  };
}
