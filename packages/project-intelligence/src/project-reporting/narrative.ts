import type { AnalystAnswer } from "../ai-project-analyst/types";
import { containsUnsafeAiOverlay } from "../ai-project-analyst/claims";
import { detectPromptInjection } from "../ai-project-analyst/intent";
import type { ProjectReportSnapshot } from "./types";

function freeze<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/**
 * AI may only attach as AI_SUMMARY. Canonical sections are never rewritten.
 */
export function attachReportNarrative(
  snapshot: ProjectReportSnapshot,
  answer: Pick<
    AnalystAnswer,
    | "aiAvailable"
    | "aiProvider"
    | "aiModel"
    | "directorRunId"
    | "promptKey"
    | "promptVersion"
    | "overlaySkippedReason"
    | "refused"
    | "refusedReason"
    | "claims"
  >,
  aiSummaryText?: string,
): ProjectReportSnapshot {
  const candidate = aiSummaryText ?? answer.claims.find((claim) => claim.kind === "AI_SUMMARY")?.text;
  const unsafe =
    Boolean(candidate && (containsUnsafeAiOverlay(candidate) || detectPromptInjection(candidate))) ||
    Boolean(answer.refused);

  const next: ProjectReportSnapshot = {
    ...snapshot,
    narrative: {
      kind: "AI_SUMMARY",
      available: Boolean(answer.aiAvailable) && Boolean(candidate) && !unsafe,
      text: unsafe || !candidate ? undefined : candidate.slice(0, 1200),
      provider: answer.aiProvider,
      model: answer.aiModel,
      directorRunId: answer.directorRunId,
      promptKey: answer.promptKey,
      promptVersion: answer.promptVersion,
      skippedReason: unsafe
        ? answer.refused
          ? answer.refusedReason ?? "refused"
          : "unsafe_or_injection"
        : answer.aiAvailable
          ? candidate
            ? undefined
            : "empty_overlay"
          : answer.overlaySkippedReason ?? "ai_unavailable",
      refused: answer.refused,
      refusedReason: answer.refusedReason,
    },
  };
  return freeze(next);
}

export function markNarrativeUnavailable(
  snapshot: ProjectReportSnapshot,
  skippedReason: string,
): ProjectReportSnapshot {
  return freeze({
    ...snapshot,
    narrative: {
      kind: "AI_SUMMARY",
      available: false,
      skippedReason,
    },
  });
}
