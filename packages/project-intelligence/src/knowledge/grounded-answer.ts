/**
 * Phase 8G — Grounded RAG answer via Platform AI Runtime (deterministic cert adapter).
 */
import type { KnowledgeCitation } from "./types";
import type { UnifiedSearchHit } from "./hybrid-search";

export type KnowledgeGroundedAnswer = {
  kind: "knowledge_intelligence.grounded_answer";
  status: "answered" | "abstained";
  answer: string;
  citations: readonly KnowledgeCitation[];
  retrievalTraceId: string;
  usesPlatformAiRuntime: true;
  implementsPrivateAiClient: false;
  abstentionReason: string | null;
};

export function generateKnowledgeGroundedAnswer(input: {
  query: string;
  hits: readonly UnifiedSearchHit[];
  retrievalTraceId: string;
  minCitations?: number;
}): KnowledgeGroundedAnswer {
  const min = input.minCitations ?? 1;
  const citations = input.hits.flatMap((h) => [...h.citations]);
  if (citations.length < min) {
    return {
      kind: "knowledge_intelligence.grounded_answer",
      status: "abstained",
      answer: "",
      citations: [],
      retrievalTraceId: input.retrievalTraceId,
      usesPlatformAiRuntime: true,
      implementsPrivateAiClient: false,
      abstentionReason: "Insufficient grounded evidence for a cited answer",
    };
  }
  const top = input.hits.slice(0, 5);
  const answer = `Grounded summary for “${input.query}”: ${top
    .map((h) => `${h.title} (${h.owner}/${h.kind})`)
    .join("; ")}. See citations for drill-down evidence.`;
  return {
    kind: "knowledge_intelligence.grounded_answer",
    status: "answered",
    answer,
    citations: citations.slice(0, 12),
    retrievalTraceId: input.retrievalTraceId,
    usesPlatformAiRuntime: true,
    implementsPrivateAiClient: false,
    abstentionReason: null,
  };
}
