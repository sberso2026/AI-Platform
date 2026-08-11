/**
 * Grounded Ask orchestration — extends Engineering AI path without a second stack.
 * E3: optional context resolver enrichment; failure degrades to E2 retrieval.
 */

import type { CommerceExecutionContext } from "@rtb/types";
import type { EngineeringGroundedAnswer, EngineeringSearchQuery } from "../phase-e2/contracts";
import type { AuthorisationGate, ContextDomainProvider } from "../phase-e3/canonical-context-resolver";
import {
  boostEvidenceByContextRelatedIds,
  enrichAskQueryWithContext,
} from "../phase-e3/ask-context-bridge";
import { EngineeringRetrievalService } from "./engineering-retrieval-service";

export type GroundedAskResult = {
  message: string;
  requiresReview: boolean;
  grounded: EngineeringGroundedAnswer;
  evidence: EngineeringGroundedAnswer["evidence"];
  evidenceState: EngineeringGroundedAnswer["evidenceState"];
  scope: EngineeringGroundedAnswer["scope"];
  limitations: string[];
  retrievalMode: EngineeringGroundedAnswer["retrievalMode"];
  meta: Record<string, unknown>;
  run?: unknown;
};

/**
 * Prefer deterministic grounded synthesis from authorised evidence.
 * Optional generation hook may refine wording but must not replace evidence.
 */
export async function runGroundedEngineeringAsk(input: {
  commerce: CommerceExecutionContext;
  retrieval: EngineeringRetrievalService;
  query: EngineeringSearchQuery;
  tryGenerate?: (args: {
    message: string;
    evidenceSummary: string;
  }) => Promise<{ content: string; failed?: boolean } | null>;
  /** E3 optional — when absent or failing, E2 lexical path is unchanged. */
  contextProvider?: ContextDomainProvider | null;
  contextAuth?: AuthorisationGate | null;
}): Promise<GroundedAskResult> {
  const generationProbe = Boolean(input.tryGenerate);

  const enrichment = await enrichAskQueryWithContext({
    query: input.query,
    provider: input.contextProvider,
    auth: input.contextAuth,
  });
  const query = enrichment.query;

  const { search, answer } = await input.retrieval.retrieveAndAnswer(
    input.commerce,
    query,
    { generationAvailable: generationProbe },
  );

  // Prefer context-related authorised evidence without inventing rows.
  if (query.relatedObjectIds?.length) {
    answer.evidence = boostEvidenceByContextRelatedIds(
      answer.evidence,
      query.relatedObjectIds,
    );
    search.evidence = boostEvidenceByContextRelatedIds(
      search.evidence,
      query.relatedObjectIds,
    );
  }

  if (enrichment.contextApplied && enrichment.bundle) {
    answer.limitations.push(
      `E3 context ${enrichment.bundle.contextState}: ${enrichment.bundle.relationships.length} authorised relationship(s), ${enrichment.bundle.relatedObjects.length} related object(s).`,
    );
    if (enrichment.bundle.timingMs) {
      answer.limitations.push(
        `Context resolve ${enrichment.bundle.timingMs.resolveMs}ms / objects ${enrichment.bundle.timingMs.objectsLoaded} / edges ${enrichment.bundle.timingMs.relationshipsTraversed}.`,
      );
    }
  } else if (enrichment.degradedToE2) {
    // Silent degrade for missing provider; note only when resolve failed after attempt.
    if (enrichment.reason && enrichment.reason !== "context_provider_unavailable") {
      answer.limitations.push(
        "E3 context unavailable; used E2 native retrieval without fabricated relationship expansion.",
      );
    }
  }

  let message = answer.answer;
  let generationAvailable = false;
  let generationFailed = false;

  if (!answer.abstained && input.tryGenerate) {
    const evidenceSummary = answer.evidence
      .slice(0, 8)
      .map(
        (e, i) =>
          `[${i + 1}] (${e.sourceType}) ${e.title} :: ${e.excerpt} :: ${e.sourceLocation}`,
      )
      .join("\n");
    try {
      const generated = await input.tryGenerate({
        message: [
          "Answer ONLY using the authorised Engineering OS evidence below.",
          "Cite sources by number. Do not invent IDs, revisions, approvals, calculations, or history.",
          "If evidence is insufficient, say so.",
          "",
          `User question: ${input.query.query}`,
          "",
          "Evidence:",
          evidenceSummary,
        ].join("\n"),
        evidenceSummary,
      });
      if (generated?.failed) {
        generationFailed = true;
      } else if (generated?.content?.trim()) {
        generationAvailable = true;
        message = `${generated.content.trim()}\n\n—\nGrounded against ${answer.evidence.length} authorised Engineering OS source(s). Advisory only.`;
      }
    } catch {
      generationFailed = true;
    }
  }

  if (generationFailed) {
    answer.limitations.push(
      "AI generation unavailable; returned retrieval-grounded answer without fabricated fallback.",
    );
    message = answer.answer;
  }

  return {
    message,
    requiresReview: answer.requiresReview || !answer.abstained,
    grounded: {
      ...answer,
      answer: message,
      generationAvailable,
      retrievalMode: generationFailed ? "retrieval_only" : answer.retrievalMode,
      limitations: answer.limitations,
    },
    evidence: answer.evidence,
    evidenceState: answer.evidenceState,
    scope: answer.scope,
    limitations: answer.limitations,
    retrievalMode: generationFailed ? "retrieval_only" : answer.retrievalMode,
    meta: {
      phase: enrichment.contextApplied ? "E3" : "E2",
      grounded: true,
      evidenceState: answer.evidenceState,
      scope: answer.scope,
      retrievalMode: generationFailed ? "retrieval_only" : answer.retrievalMode,
      retrievalMs: search.timingMs.retrievalMs,
      sourcesRetrieved: answer.evidence.length,
      sourcesSearched: search.searchedSourceTypes.length,
      semanticAttempted: search.timingMs.semanticAttempted,
      semanticAvailable: search.timingMs.semanticAvailable,
      generationAvailable,
      generationFailed,
      abstained: answer.abstained,
      policyApplied: true,
      contextApplied: enrichment.contextApplied,
      contextDegradedToE2: enrichment.degradedToE2,
      contextState: query.contextState ?? null,
      contextResolveMs: enrichment.bundle?.timingMs?.resolveMs ?? null,
      relatedObjectIds: query.relatedObjectIds ?? [],
    },
  };
}
