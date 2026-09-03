/**
 * Grounded Ask orchestration — E2 retrieval + E3 context + optional E4 connectors + E5 reasoning + E6 tools + E7 memory.
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
import type { EngineeringMemoryHit } from "../phase-e7/contracts";
import {
  applyMemoryToReasoning,
  deriveMemoryContextChips,
  memoryHitsToEvidence,
  type AskMemoryContextChips,
} from "../phase-e7/ask-bridge";
import { EngineeringMemoryCaptureService } from "../phase-e7/capture";
import { EngineeringMemoryRetrievalService } from "../phase-e7/retrieval";
import type { EngineeringMemoryStore } from "../phase-e7/store";
import type { EngineeringIntelligenceResultEnvelope } from "../phase-e9/contracts";
import { applyIntelligenceToReasoning } from "../phase-e9/ask-bridge";
import {
  EngineeringIntelligenceService,
} from "../phase-e9/invocation";
import { EngineeringRetrievalService } from "./engineering-retrieval-service";
import { formatGeneratedDocumentAnswer, isDocumentBodyEvidence } from "./document-grounded-answer";

export const ENGINEERING_AI_DEGRADED_USER_MESSAGE =
  "Degraded mode: Engineering AI could not generate an answer. Retrieved authorised evidence is shown below. This is not generative reasoning.";

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
  memoryHits?: EngineeringMemoryHit[];
  memoryChips?: AskMemoryContextChips | null;
  intelligenceResults?: EngineeringIntelligenceResultEnvelope[];
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
  }) => Promise<{
    content: string;
    failed?: boolean;
    failureLayer?: string;
    failureCause?: string;
    provider?: string;
    model?: string | null;
  } | null>;
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
  /** E7 optional passive memory store / capture (Platform Memory ownership). */
  memoryStore?: EngineeringMemoryStore | null;
  memoryCapture?: EngineeringMemoryCaptureService | null;
  skipMemory?: boolean;
  captureToolResultToMemory?: boolean;
  /** E9 optional certified intelligence routing (no engine ownership). */
  intelligence?: EngineeringIntelligenceService | null;
  intelligenceEntitledKeys?: string[];
  skipIntelligence?: boolean;
}): Promise<GroundedAskResult> {
  const generationProbe = Boolean(input.tryGenerate);
  let lastGenerateMeta: {
    content?: string;
    failed?: boolean;
    failureLayer?: string;
    failureCause?: string;
    provider?: string;
    model?: string | null;
  } | null = null;
  const tryGenerate = input.tryGenerate
    ? async (args: { message: string; evidenceSummary: string }) => {
        const generated = await input.tryGenerate!(args);
        lastGenerateMeta = generated;
        return generated;
      }
    : undefined;

  const enrichment = await enrichAskQueryWithContext({
    query: input.query,
    provider: input.contextProvider,
    auth: input.contextAuth,
  });
  const query = enrichment.query;

  // E7: bounded memory retrieval after context, before/alongside evidence assembly
  let memoryHits: EngineeringMemoryHit[] = [];
  let memoryLimitations: string[] = [];
  let memoryRetrieveMs: number | null = null;
  if (!input.skipMemory && input.memoryStore) {
    const memoryRetrieval = new EngineeringMemoryRetrievalService(input.memoryStore);
    const memoryResult = await memoryRetrieval.retrieve({
      tenantId: query.tenantId,
      workspaceId: query.workspaceId,
      projectId: query.projectId,
      userId: query.userId,
      query: query.query,
      subjectObjectId: query.objectId,
      subjectObjectType: query.objectType,
      limit: 8,
    });
    memoryHits = memoryResult.hits;
    memoryLimitations = memoryResult.limitations;
    memoryRetrieveMs = memoryResult.timingMs.retrieveMs;
  }

  // E9: bounded certified intelligence routing (no fan-out) after context
  let intelligenceResults: EngineeringIntelligenceResultEnvelope[] = [];
  let intelligenceLimitations: string[] = [];
  let intelligenceTiming: { routeMs: number; invokeMs: number; totalMs: number } | null =
    null;
  if (!input.skipIntelligence && input.intelligence) {
    const intel = await input.intelligence.routeAndInvoke({
      tenantId: query.tenantId,
      workspaceId: query.workspaceId,
      userId: query.userId,
      query: query.query,
      objectType: query.objectType,
      objectId: query.objectId,
      projectId: query.projectId,
      entitledKeys: input.intelligenceEntitledKeys,
      providedInputs: {
        projectId: query.projectId,
        assetId: query.objectType === "asset" ? query.objectId : undefined,
        subjectId: query.objectId,
      },
      maxCapabilities: 2,
    });
    intelligenceResults = intel.results;
    intelligenceLimitations = intel.limitations;
    intelligenceTiming = intel.timingMs;
  }

  const { search, answer } = await input.retrieval.retrieveAndAnswer(
    input.commerce,
    query,
    { generationAvailable: generationProbe },
  );

  if (memoryHits.length) {
    const memoryEvidence = memoryHitsToEvidence(memoryHits);
    answer.evidence = [...memoryEvidence, ...answer.evidence];
    answer.limitations.push(...memoryLimitations);
  }
  if (intelligenceLimitations.length) {
    answer.limitations.push(...intelligenceLimitations);
  }

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
        (tryGenerate
          ? {
              refine: async ({ finding, evidenceSummary, mode }) => {
                try {
                  const generated = await tryGenerate({
                    message: [
                      "You refine an evidence-grounded engineering finding.",
                      "Answer ONLY using the authorised evidence below. Do not invent standards, revisions, approvals, calculations, or citations.",
                      "Return a concise answer, then Why?, then Sources with page / clause / section / figure when present.",
                      "Classify each claim as FACT, INFERENCE, ASSUMPTION, or MISSING EVIDENCE.",
                      "This is advisory only. No autonomous engineering approval.",
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
  let generationFailureLayer: string | null = null;
  let generationFailureCause: string | null = null;
  let generationProvider: string | null = null;
  let retrievalMode = answer.retrievalMode;

  if (reasoning?.degradedToRetrievalOnly) {
    generationFailed = true;
    generationFailureLayer = lastGenerateMeta?.failureLayer ?? "reasoning_provider";
    generationFailureCause = lastGenerateMeta?.failureCause ?? "refine_failed";
    retrievalMode = "retrieval_only";
    message = reasoning.answer;
    answer.limitations.push(...reasoning.limitations);
  } else if (reasoning) {
    generationAvailable = Boolean(tryGenerate) && !reasoning.degradedToRetrievalOnly;
    generationProvider = lastGenerateMeta?.provider ?? null;
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
    if (lastGenerateMeta?.content?.trim() && isDocumentBodyEvidence(reasoning.evidence)) {
      reasoning.answer = formatGeneratedDocumentAnswer({
        generated: reasoning.answer,
        query: input.query.query,
        evidence: reasoning.evidence,
      });
    }
    answer.answer = reasoning.answer;
    message = reasoning.answer;
  } else if (!answer.abstained && tryGenerate) {
    // Legacy E2 path when reasoning skipped
    const evidenceSummary = answer.evidence
      .slice(0, 8)
      .map(
        (e, i) =>
          `[${i + 1}] (${e.sourceType}) ${e.title} :: ${e.excerpt} :: ${e.sourceLocation}`,
      )
      .join("\n");
    try {
      const generated = await tryGenerate({
        message: [
          "Answer ONLY using the authorised Engineering OS evidence below.",
          "Return a concise answer, then Why?, then Sources with page / clause / section / figure when present.",
          "Classify each claim as FACT, INFERENCE, ASSUMPTION, or MISSING EVIDENCE.",
          "Do not invent IDs, revisions, approvals, calculations, or history.",
          "If evidence is insufficient, say so. Advisory only — no autonomous engineering approval.",
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
      answer.evidence.length > 0
        ? "generation_failed_retrieval_shown"
        : "AI generation unavailable; returned retrieval-grounded answer without fabricated fallback.",
    );
    retrievalMode = "retrieval_only";
    if (answer.evidence.length > 0) {
      const body = (reasoning?.answer ?? answer.answer ?? "").trim();
      message = body
        ? `${ENGINEERING_AI_DEGRADED_USER_MESSAGE}\n\n${body}`
        : ENGINEERING_AI_DEGRADED_USER_MESSAGE;
    } else if (!reasoning) {
      message = answer.answer;
    }
  }

  // E7: fold memory provenance into Why? after reasoning
  if (reasoning && memoryHits.length) {
    reasoning = applyMemoryToReasoning(reasoning, memoryHits);
    message = reasoning.answer;
    answer.limitations = [
      ...new Set([...answer.limitations, ...reasoning.limitations]),
    ];
  }

  // E9: fold certified intelligence into Why?
  if (reasoning && intelligenceResults.length) {
    reasoning = applyIntelligenceToReasoning(reasoning, intelligenceResults);
    message = reasoning.answer;
    answer.limitations = [
      ...new Set([...answer.limitations, ...reasoning.limitations]),
    ];
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

      if (input.captureToolResultToMemory && input.memoryCapture && toolResult) {
        await input.memoryCapture.captureToolResult({
          tenantId: query.tenantId,
          workspaceId: query.workspaceId,
          projectId: query.projectId,
          userId: query.userId,
          subject: {
            objectType: (query.objectType as never) ?? "DOCUMENT",
            objectId: query.objectId ?? toolResult.invocationId,
            tenantId: query.tenantId,
            workspaceId: query.workspaceId,
            projectId: query.projectId,
            authority: "ENGINEERING_OS",
            provenance: {
              sourceType: "tool_result",
              sourceId: toolResult.invocationId,
              mechanism: "SYSTEM",
              timestamp: new Date().toISOString(),
            },
          },
          toolResult,
        });
      }
    } else {
      answer.limitations.push(
        `Tool action "${input.toolAction}" has no governed executable tool; capability unavailable.`,
      );
    }
  }

  const memoryChips = memoryHits.length ? deriveMemoryContextChips(memoryHits) : null;

  const emptyAnswerAbstention =
    "Engineering OS does not have enough authorised evidence to answer this reliably. No sources were invented.";
  if (!String(message ?? "").trim()) {
    message = emptyAnswerAbstention;
    answer.abstained = true;
    if (answer.evidenceState !== "PARTIAL") {
      answer.evidenceState = "INSUFFICIENT";
    }
    if (!answer.limitations.includes("Insufficient authorised evidence for a client-specific claim.")) {
      if (!isDocumentBodyEvidence(answer.evidence)) {
        answer.limitations.push("Insufficient authorised evidence for a client-specific claim.");
      }
    }
  }

  const phase = intelligenceResults.length
    ? "E9"
    : memoryHits.length
      ? "E7"
      : toolResult
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
    memoryHits,
    memoryChips,
    intelligenceResults,
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
      generationFailureLayer,
      generationFailureCause,
      generationProvider,
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
      memoryHitCount: memoryHits.length,
      memoryRetrieveMs,
      memoryIsAuthority: false,
      cotPersisted: false,
      intelligenceCapabilityIds: intelligenceResults.map((r) => r.capabilityId),
      intelligenceOwners: intelligenceResults.map((r) => r.owner),
      intelligenceRouteMs: intelligenceTiming?.routeMs ?? null,
      intelligenceInvokeMs: intelligenceTiming?.invokeMs ?? null,
      intelligenceTotalMs: intelligenceTiming?.totalMs ?? null,
      intelligenceIsApproval: false,
      fabricatedIntelligence: false,
    },
  };
}
