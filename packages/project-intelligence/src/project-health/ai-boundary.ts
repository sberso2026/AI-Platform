/**
 * Future AI explanation contract. PI-7 is not implemented here.
 */

import { implementsOwnAiStack } from "./ownership";
import type { ProjectHealthAssessment } from "./types";

export const PROJECT_HEALTH_AI_MAY = [
  "summarize_health",
  "explain_contributing_evidence",
  "highlight_contradictions",
  "identify_missing_evidence",
] as const;

export type ProjectHealthAiMay = (typeof PROJECT_HEALTH_AI_MAY)[number];

export const PROJECT_HEALTH_AI_MUST_NEVER = [
  "change_deterministic_state",
  "fabricate_metrics",
  "approve_project_actions",
  "modify_schedules",
  "modify_costs",
  "approve_change",
  "answer_contractual_tqs_autonomously",
] as const;

export type ProjectHealthAiMustNever = (typeof PROJECT_HEALTH_AI_MUST_NEVER)[number];

export type ProjectHealthExplanationRequest = {
  assessment: ProjectHealthAssessment;
  intent: ProjectHealthAiMay;
};

export type ProjectHealthExplanationResult = {
  abstained: true;
  reason: "pi_7_not_implemented";
  implementsOwnAiStack: false;
  deterministicStateUnchanged: true;
};

export function requestProjectHealthExplanation(
  _request: ProjectHealthExplanationRequest,
): ProjectHealthExplanationResult {
  return {
    abstained: true,
    reason: "pi_7_not_implemented",
    implementsOwnAiStack,
    deterministicStateUnchanged: true,
  };
}

export function assertProjectHealthAiBoundary(): void {
  if (implementsOwnAiStack) {
    throw new Error("Project Health must not implement its own AI stack");
  }
}
