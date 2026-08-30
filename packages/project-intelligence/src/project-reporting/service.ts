import { detectMutationRequest, detectPromptInjection } from "../ai-project-analyst/intent";
import type { AnalystAnswer } from "../ai-project-analyst/types";
import { assembleProjectReport, type AssembleProjectReportInput } from "./compose";
import { attachReportNarrative, markNarrativeUnavailable } from "./narrative";
import { approveFromReport, writeProjectReport } from "./ports";
import type { ProjectReportSnapshot } from "./types";

export function composeProjectReportSnapshot(input: AssembleProjectReportInput): ProjectReportSnapshot {
  return assembleProjectReport(input);
}

export function finalizeProjectReport(input: {
  snapshot: ProjectReportSnapshot;
  answer?: AnalystAnswer;
  aiSummaryText?: string;
  skippedReason?: string;
}): ProjectReportSnapshot {
  if (input.skippedReason && !input.answer) {
    return markNarrativeUnavailable(input.snapshot, input.skippedReason);
  }
  if (!input.answer) {
    return markNarrativeUnavailable(input.snapshot, "ai_not_requested");
  }
  if (detectPromptInjection(input.aiSummaryText ?? "") || input.answer.refused) {
    return attachReportNarrative(input.snapshot, input.answer, input.aiSummaryText);
  }
  if (detectMutationRequest(input.aiSummaryText ?? "")) {
    return markNarrativeUnavailable(input.snapshot, "mutation_request");
  }
  return attachReportNarrative(input.snapshot, input.answer, input.aiSummaryText);
}

export { writeProjectReport, approveFromReport };
