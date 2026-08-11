/**
 * Native Engineering Retrieval Service (E2 + optional E4 connector evidence).
 * Composes EngineeringSearchService; lexical-first with optional semantic / connector contribution.
 */

import type { CommerceExecutionContext } from "@rtb/types";
import {
  classifyEvidenceState,
  resolveSearchScope,
  type EngineeringGroundedAnswer,
  type EngineeringRetrievalMode,
  type EngineeringSearchQuery,
  type EngineeringGroundedSearchResult,
  type EngineeringEvidence,
} from "../phase-e2/contracts";
import type { ExternalIdentityMapping } from "../phase-e3/contracts";
import type { EngineeringConnectorRegistry } from "../phase-e4/registry";
import { retrieveConnectorEvidence } from "../phase-e4/connector-retrieval";
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

export type ConnectorRetrievalProbe = {
  registry?: EngineeringConnectorRegistry | null;
  existingMappings?: ExternalIdentityMapping[];
  enabled?: boolean;
  timeoutMs?: number;
};

export class EngineeringRetrievalService {
  constructor(
    private readonly search: EngineeringSearchLike,
    private readonly semantic: SemanticRetrievalProbe = { available: false },
    private readonly connectors: ConnectorRetrievalProbe = { enabled: false },
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

    // 1. Native Engineering OS retrieval (always)
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

    let evidence: EngineeringEvidence[] = bucketsToEvidence(buckets, { ...query, scope });

    // 2–3. E3 context ranking hints (relatedObjectIds already on query from grounded-ask)
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

    // 4–7. Optional connector evidence (E4) — never required; failure degrades gracefully
    let connectorTiming: Record<string, number> | undefined;
    if (this.connectors.enabled && this.connectors.registry) {
      try {
        const contrib = await retrieveConnectorEvidence({
          query,
          registry: this.connectors.registry,
          existingMappings: this.connectors.existingMappings,
          timeoutMs: this.connectors.timeoutMs,
        });
        connectorTiming = contrib.timing;
        limitations.push(...contrib.limitations);
        if (contrib.evidence.length) {
          evidence = [...evidence, ...contrib.evidence];
          limitations.push(
            `E4 connector contribution: ${contrib.evidence.length} external evidence item(s) from ${contrib.connectorsQueried.length} connector(s).`,
          );
        }
        if (contrib.connectorsFailed.length) {
          limitations.push(
            `Connector failures (non-fatal): ${contrib.connectorsFailed.join(", ")}.`,
          );
        }
      } catch {
        limitations.push(
          "E4 connector retrieval failed; continued with native Engineering OS evidence only.",
        );
      }
    }

    if (evidence.some((e) => e.authorityStatus === "SUPERSEDED")) {
      limitations.push("One supporting source is superseded.");
    }
    if (evidence.some((e) => e.conflicting)) {
      limitations.push("Conflicting evidence was retained for review.");
    }

    // Keep native + authorised connector evidence; drop insecure permission states.
    evidence = evidence.filter((e) => {
      if (e.permissionsApplied !== true) return false;
      return (
        e.provenance === "engineering_os_native" || e.provenance === "connector_external"
      );
    });

    const envelope = buildSearchResultEnvelope({
      query: { ...query, scope },
      evidence,
      retrievalMode,
      limitations,
      retrievalMs: Date.now() - started,
      semanticAttempted,
      semanticAvailable: this.semantic.available,
    });
    if (connectorTiming) {
      envelope.limitations.push(
        `Connector timing selection=${connectorTiming.selectionMs}ms query=${connectorTiming.queryMs}ms map=${connectorTiming.mappingMs}ms total=${connectorTiming.totalMs}ms.`,
      );
    }
    return envelope;
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
