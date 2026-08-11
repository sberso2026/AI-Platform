/**
 * Grounded Ask orchestration — E2 retrieval + E3 context + optional E4 connectors + E5 reasoning.
 * Reasoning provider failure degrades to E2 retrieval-only.
 */

import type { CommerceExecutionContext } from "@rtb/types";
import type { EngineeringGroundedAnswer, EngineeringSearchQuery } from "../phase-e2/contracts";
import type { AuthorisationGate, ContextDomainProvider } from "../phase-e3/canonical-context-resolver";
import {
  boostEvidenceByContextRelatedIds,
  enrichAskQueryWithContext,
} from "../phase-e3/ask-context-bridge";
import type { EngineeringReasoningResponse } from "../phase-e5/contracts";
import {
  EngineeringReasoningService,
  type ReasoningProvider,
} from "../phase-e5/reasoning-service";
import type { EngineeringToolResult } from "../phase-e6/contracts";
import {
  applyToolResultToReasoning,
  mapAskActionToToolId,
} from "../phase-e6/e5-bridge";
import { EngineeringToolInvocationService } from "../phase-e6/invocation";
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
  reasoning?: EngineeringReasoningResponse;
  why?: EngineeringReasoningResponse["why"];
  recommendedNextActions?: EngineeringReasoningResponse["recommendedNextActions"];
  toolResult?: EngineeringToolResult | null;
  meta: Record<string, unknown>;
  run?: unknown;
};

/**
 * Prefer deterministic grounded synthesis from authorised evidence.
 * Optional generation hook may refine wording but must not replace evidence.
 * Optional governed tool action runs after reasoning and feeds Why? provenance.
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
  /** E5 optional reasoning provider — failure degrades to retrieval-only. */
  reasoningProvider?: ReasoningProvider | null;
  skipReasoning?: boolean;
  /** E6 optional governed tool action (run_check|compare|verify|estimate|analyse). */
  toolAction?: string | null;
  toolInputs?: Record<string, unknown>;
  toolUnits?: Record<string, string>;
  toolPermissions?: string[];
  requireCertifiedToolPath?: boolean;
  toolInvocation?: EngineeringToolInvocationService | null;
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
    if (enrichment.reason && enrichment.reason !== "context_provider_unavailable") {
      answer.limitations.push(
        "E3 context unavailable; used E2 native retrieval without fabricated relationship expansion.",
      );
    }
  }

  // E5 reasoning over authorised evidence (deterministic; optional refine)
  let reasoning: EngineeringReasoningResponse | undefined;
  if (!input.skipReasoning) {
    const reasoningService = new EngineeringReasoningService(
      input.reasoningProvider ??
        (input.tryGenerate
          ? {
              refine: async ({ finding, evidenceSummary, mode }) => {
                try {
                  const generated = await input.tryGenerate!({
                    message: [
                      "You refine an evidence-grounded engineering finding.",
                      "Answer ONLY using the authorised evidence below.",
                      "Distinguish facts (from evidence) vs inferences. Do not invent standards, revisions, approvals, calculations, or citations.",
                      "Do not expose chain-of-thought or platform internals.",
                      `Mode: ${mode}`,
                      `Finding: ${finding}`,
                      "",
                      "Evidence:",
                      evidenceSummary,
                    ].join("\n"),
                    evidenceSummary,
                  });
                  return generated;
                } catch {
                  return { content: "", failed: true };
                }
              },
            }
          : {}),
    );
    reasoning = await reasoningService.reason({
      query: input.query.query,
      evidence: answer.evidence,
      searchQuery: query,
      context: {
        tenantId: query.tenantId,
        workspaceId: query.workspaceId ?? null,
        userId: query.userId,
        projectId: query.projectId ?? null,
        objectType: (query.objectType as never) ?? null,
        objectId: query.objectId ?? null,
      },
    });
  }

  let message = reasoning?.answer ?? answer.answer;
  let generationAvailable = false;
  let generationFailed = false;
  let retrievalMode = answer.retrievalMode;

  if (reasoning?.degradedToRetrievalOnly) {
    generationFailed = true;
    retrievalMode = "retrieval_only";
    message = reasoning.answer;
    answer.limitations.push(...reasoning.limitations);
  } else if (reasoning) {
    generationAvailable = Boolean(input.tryGenerate) && !reasoning.degradedToRetrievalOnly;
    answer.evidence = reasoning.evidence;
    answer.evidenceState = reasoning.evidenceState;
    answer.abstained = reasoning.abstained;
    answer.requiresReview =
      reasoning.authorityStatus === "REQUIRES_HUMAN_REVIEW" ||
      reasoning.authorityStatus === "ADVISORY" ||
      !reasoning.abstained;
    answer.limitations = [
      ...new Set([...answer.limitations, ...reasoning.limitations]),
    ];
    answer.answer = reasoning.answer;
  } else if (!answer.abstained && input.tryGenerate) {
    // Legacy E2 path when reasoning skipped
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

  if (generationFailed && !reasoning) {
    answer.limitations.push(
      "AI generation unavailable; returned retrieval-grounded answer without fabricated fallback.",
    );
    message = answer.answer;
    retrievalMode = "retrieval_only";
  }

  // E6: optional governed tool invocation after reasoning
  let toolResult: EngineeringToolResult | null = null;
  if (input.toolAction) {
    const toolId = mapAskActionToToolId(input.toolAction);
    if (toolId) {
      const invoker = input.toolInvocation ?? new EngineeringToolInvocationService();
      toolResult = await invoker.invoke({
        tenantId: query.tenantId,
        workspaceId: query.workspaceId,
        userId: query.userId,
        toolId,
        inputs: input.toolInputs ?? {},
        units: input.toolUnits,
        intent: input.query.query,
        requireCertifiedPath: input.requireCertifiedToolPath ?? false,
        permissions: input.toolPermissions ?? [
          "engineering_tool.execute",
          "engineering_tool.discover",
        ],
        evidenceRefs: (reasoning?.evidence ?? answer.evidence).map((e) => e.sourceId),
      });
      if (reasoning) {
        reasoning = applyToolResultToReasoning(reasoning, toolResult);
        message = reasoning.answer;
        answer.limitations = reasoning.limitations;
      } else {
        answer.limitations.push(...toolResult.limitations);
        if (toolResult.status === "SUCCESS" && toolResult.output) {
          message = `${message}\n\nGoverned tool result: ${JSON.stringify(toolResult.output)}`;
        }
      }
    } else {
      answer.limitations.push(
        `Tool action "${input.toolAction}" has no governed executable tool; capability unavailable.`,
      );
    }
  }

  const phase = toolResult
    ? "E6"
    : reasoning
      ? "E5"
      : enrichment.contextApplied
        ? "E3"
        : "E2";

  return {
    message,
    requiresReview:
      reasoning?.authorityStatus === "REQUIRES_HUMAN_REVIEW" ||
      reasoning?.authorityStatus === "ADVISORY" ||
      Boolean(toolResult?.reviewRequired) ||
      answer.requiresReview ||
      !answer.abstained,
    grounded: {
      ...answer,
      answer: message,
      generationAvailable,
      retrievalMode: generationFailed || reasoning?.degradedToRetrievalOnly
        ? "retrieval_only"
        : retrievalMode,
      limitations: answer.limitations,
      abstained: reasoning?.abstained ?? answer.abstained,
    },
    evidence: reasoning?.evidence ?? answer.evidence,
    evidenceState: reasoning?.evidenceState ?? answer.evidenceState,
    scope: answer.scope,
    limitations: answer.limitations,
    retrievalMode:
      generationFailed || reasoning?.degradedToRetrievalOnly
        ? "retrieval_only"
        : retrievalMode,
    reasoning,
    why: reasoning?.why,
    recommendedNextActions: reasoning?.recommendedNextActions,
    toolResult,
    meta: {
      phase,
      grounded: true,
      evidenceState: reasoning?.evidenceState ?? answer.evidenceState,
      scope: answer.scope,
      retrievalMode:
        generationFailed || reasoning?.degradedToRetrievalOnly
          ? "retrieval_only"
          : retrievalMode,
      retrievalMs: search.timingMs.retrievalMs,
      sourcesRetrieved: (reasoning?.evidence ?? answer.evidence).length,
      sourcesSearched: search.searchedSourceTypes.length,
      semanticAttempted: search.timingMs.semanticAttempted,
      semanticAvailable: search.timingMs.semanticAvailable,
      generationAvailable,
      generationFailed,
      abstained: reasoning?.abstained ?? answer.abstained,
      policyApplied: true,
      contextApplied: enrichment.contextApplied,
      contextDegradedToE2: enrichment.degradedToE2,
      contextState: query.contextState ?? null,
      contextResolveMs: enrichment.bundle?.timingMs?.resolveMs ?? null,
      relatedObjectIds: query.relatedObjectIds ?? [],
      reasoningMode: reasoning?.mode ?? null,
      explanationStatus: reasoning?.explanationStatus ?? null,
      authorityStatus: reasoning?.authorityStatus ?? null,
      confidence: reasoning?.confidence ?? null,
      evidenceAssemblyMs: reasoning?.timingMs.evidenceAssemblyMs ?? null,
      reasoningMs: reasoning?.timingMs.reasoningMs ?? null,
      reasoningTotalMs: reasoning?.timingMs.totalMs ?? null,
      degradedToRetrievalOnly: reasoning?.degradedToRetrievalOnly ?? generationFailed,
      chainOfThoughtExposed: false,
      toolId: toolResult?.toolId ?? null,
      toolVersion: toolResult?.toolVersion ?? null,
      toolInvocationId: toolResult?.invocationId ?? null,
      toolStatus: toolResult?.status ?? null,
      toolOutputKind: toolResult?.outputKind ?? null,
      llmFabricatedToolResult: false,
    },
  };
}
