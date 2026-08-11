/**
 * Grounded Ask orchestration — extends Engineering AI path without a second stack.
 */

import type { CommerceExecutionContext } from "@rtb/types";
import type { EngineeringGroundedAnswer, EngineeringSearchQuery } from "../phase-e2/contracts";
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
}): Promise<GroundedAskResult> {
  const generationProbe = Boolean(input.tryGenerate);
  const { search, answer } = await input.retrieval.retrieveAndAnswer(
    input.commerce,
    input.query,
    { generationAvailable: generationProbe },
  );

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
        // Keep deterministic synthesis as authority; append model wording only when non-empty
        // and still attach real evidence (never model-fabricated refs).
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
      phase: "E2",
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
    },
  };
}
