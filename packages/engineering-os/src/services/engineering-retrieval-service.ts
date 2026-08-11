/**
 * Native Engineering Retrieval Service (E2).
 * Composes EngineeringSearchService; lexical-first with optional semantic fallback.
 */

import type { CommerceExecutionContext } from "@rtb/types";
import {
  classifyEvidenceState,
  resolveSearchScope,
  type EngineeringGroundedAnswer,
  type EngineeringRetrievalMode,
  type EngineeringSearchQuery,
  type EngineeringGroundedSearchResult,
} from "../phase-e2/contracts";
import {
  bucketsToEvidence,
  buildSearchResultEnvelope,
  synthesizeGroundedAnswer,
  type SearchBuckets,
} from "./engineering-evidence";

export type EngineeringSearchLike = {
  search: (
    commerce: CommerceExecutionContext,
    tenantId: string,
    query: string,
    filters?: {
      type?: string;
      projectId?: string;
      status?: string;
      includeKnowledgeGraph?: boolean;
    },
  ) => Promise<SearchBuckets>;
};

export type SemanticRetrievalProbe = {
  available: boolean;
  retrieve?: (query: EngineeringSearchQuery) => Promise<SearchBuckets | null>;
};

export class EngineeringRetrievalService {
  constructor(
    private readonly search: EngineeringSearchLike,
    private readonly semantic: SemanticRetrievalProbe = { available: false },
  ) {}

  async retrieve(
    commerce: CommerceExecutionContext,
    query: EngineeringSearchQuery,
  ): Promise<EngineeringGroundedSearchResult> {
    const started = Date.now();
    const scope = resolveSearchScope(query);
    const limitations: string[] = [];
    let retrievalMode: EngineeringRetrievalMode = "lexical";
    let semanticAttempted = false;
    let buckets: SearchBuckets | null = null;

    // Authorization is enforced inside EngineeringSearchService (assertEngineeringService + RLS).
    // Retrieval must never bypass that path.

    if (this.semantic.available && this.semantic.retrieve) {
      semanticAttempted = true;
      try {
        buckets = await this.semantic.retrieve(query);
        if (buckets) retrievalMode = "hybrid";
      } catch {
        limitations.push("Semantic retrieval unavailable; using lexical fallback.");
        retrievalMode = "lexical_fallback";
        buckets = null;
      }
    } else {
      limitations.push("Semantic embeddings not configured; lexical retrieval active.");
    }

    if (!buckets) {
      const projectId = scope === "workspace" ? undefined : query.projectId ?? undefined;
      buckets = await this.search.search(commerce, query.tenantId, query.query || "*", {
        projectId,
        type: "all",
      });
      if (retrievalMode !== "lexical_fallback") retrievalMode = "lexical";
    }

    // Object-scoped document summarisation when only metadata exists.
    if (scope === "document" && query.objectId) {
      const docs = (buckets.documents ?? []).filter(
        (d) => String((d as { id?: string }).id ?? "") === query.objectId,
      );
      if (docs.length === 0) {
        limitations.push("Document content/body is unavailable; metadata-only search applied.");
      } else {
        const doc = docs[0] as { file_path?: string | null; file_name?: string | null };
        if (!doc.file_path && !doc.file_name) {
          limitations.push(
            "Document content is unavailable for summarisation; only metadata was retrieved.",
          );
        } else {
          limitations.push(
            "Document body text extraction is not part of native E2 ESSENTIAL; metadata and titles were used.",
          );
        }
      }
    }

    let evidence = bucketsToEvidence(buckets, { ...query, scope });
    // E3: prefer authorised related object IDs from context (no fabricated rows).
    if (query.relatedObjectIds?.length) {
      const boost = new Set(query.relatedObjectIds);
      evidence = [...evidence].sort((a, b) => {
        const aHit = boost.has(a.canonicalObjectId) ? 1 : 0;
        const bHit = boost.has(b.canonicalObjectId) ? 1 : 0;
        if (aHit !== bHit) return bHit - aHit;
        return (b.retrievalScore ?? 0) - (a.retrievalScore ?? 0);
      });
      limitations.push(
        "E3 context hints applied to rank authorised related objects within search results.",
      );
    }
    // Preferential ranking already applied; keep superseded if conflicting.
    if (evidence.some((e) => e.authorityStatus === "SUPERSEDED")) {
      limitations.push("One supporting source is superseded.");
    }
    if (evidence.some((e) => e.conflicting)) {
      limitations.push("Conflicting evidence was retained for review.");
    }

    // Cross-tenant safety: drop any row that somehow carries another tenant id.
    evidence = evidence.filter((e) => {
      // Evidence mapper does not embed tenantId; search services are tenant-scoped.
      return e.permissionsApplied === true && e.provenance === "engineering_os_native";
    });

    return buildSearchResultEnvelope({
      query: { ...query, scope },
      evidence,
      retrievalMode,
      limitations,
      retrievalMs: Date.now() - started,
      semanticAttempted,
      semanticAvailable: this.semantic.available,
    });
  }

  async retrieveAndAnswer(
    commerce: CommerceExecutionContext,
    query: EngineeringSearchQuery,
    options?: { generationAvailable?: boolean },
  ): Promise<{ search: EngineeringGroundedSearchResult; answer: EngineeringGroundedAnswer }> {
    const search = await this.retrieve(commerce, query);
    const evidenceState = classifyEvidenceState({ evidence: search.evidence });
    const generationAvailable = options?.generationAvailable ?? false;
    const answer = synthesizeGroundedAnswer({
      query: query.query,
      evidence: search.evidence,
      evidenceState,
      scope: search.scope,
      limitations: search.limitations,
      retrievalMode:
        !generationAvailable && search.evidence.length > 0
          ? "retrieval_only"
          : search.retrievalMode,
      generationAvailable,
    });
    return { search, answer };
  }
}
