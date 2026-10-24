/**
 * Bridge E6 tool results into E5 Why? / reasoning response fields.
 */

import type { EngineeringReasoningResponse } from "../phase-e5/contracts";
import type { EngineeringToolResult } from "./contracts";

export function applyToolResultToReasoning(
  reasoning: EngineeringReasoningResponse,
  toolResult: EngineeringToolResult,
): EngineeringReasoningResponse {
  const toolLine = `Tool ${toolResult.toolId}@${toolResult.toolVersion} → ${toolResult.status} (${toolResult.outputKind}); invocation ${toolResult.invocationId}; inputHash ${toolResult.provenance.inputHash}`;
  const why = {
    ...reasoning.why,
    ruleOrToolBasis: [...reasoning.why.ruleOrToolBasis, toolLine],
    uncertaintyAndLimitations: [
      ...reasoning.why.uncertaintyAndLimitations,
      ...toolResult.limitations,
      ...toolResult.warnings,
    ],
    authorityState:
      toolResult.authorityStatus === "BLOCKED" || toolResult.authorityStatus === "FAILED"
        ? reasoning.why.authorityState
        : "REQUIRES_HUMAN_REVIEW",
    chainOfThoughtExposed: false as const,
    platformInternalsExposed: false as const,
  };

  const answerExtra =
    toolResult.status === "SUCCESS" && toolResult.output
      ? `\n\nGoverned tool result (${toolResult.outputKind}): ${JSON.stringify(toolResult.output)}\nTool ${toolResult.toolId} v${toolResult.toolVersion}. Review required — advisory only.`
      : toolResult.status === "INCOMPLETE"
        ? `\n\nTool invocation incomplete: ${toolResult.limitations.join(" ")}`
        : toolResult.status === "BLOCKED" || toolResult.status === "FAILED" || toolResult.status === "TIMEOUT"
          ? `\n\nTool ${toolResult.toolId} ${toolResult.status.toLowerCase()}: ${toolResult.limitations.join(" ")} No fabricated substitute was generated.`
          : "";

  return {
    ...reasoning,
    answer: `${reasoning.answer}${answerExtra}`,
    limitations: [
      ...new Set([...reasoning.limitations, ...toolResult.limitations, ...toolResult.warnings]),
    ],
    why,
    recommendedNextActions: [
      ...reasoning.recommendedNextActions,
      {
        action: "Review governed tool inputs, units, and outputs before acting",
        rationale: `Invocation ${toolResult.invocationId}`,
        requiresHumanReview: true as const,
        autonomousApproval: false as const,
      },
    ],
    authorityStatus: "REQUIRES_HUMAN_REVIEW",
  };
}

export function mapAskActionToCapability(action: string): string | null {
  switch (action) {
    case "run_check":
    case "verify":
      return "check.evidence.keyword";
    case "compare":
      return "compare.document.title";
    case "estimate":
      return "estimate.material.length";
    case "analyse":
      return "estimate.geometry.area";
    default:
      return null;
  }
}

export function mapAskActionToToolId(action: string): string | null {
  switch (action) {
    case "run_check":
    case "verify":
      return "eos.evidence_keyword_check";
    case "compare":
      return "eos.document_title_comparator";
    case "estimate":
      return "eos.material_length_estimator";
    case "analyse":
      return "eos.rectangle_area";
    default:
      return null;
  }
}
