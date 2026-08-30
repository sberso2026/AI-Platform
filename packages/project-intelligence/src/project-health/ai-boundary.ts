/**
 * Project Health AI boundary.
 * PI-7 implemented the canonical Analyst surface separately.
 * This method remains an abstention so Project Health does not grow a second
 * explanation stack or own an AI runtime.
 */

import { implementsOwnAiStack } from "./ownership";
import { AI_PROJECT_ANALYST_CAPABILITY } from "../ai-project-analyst/capability";
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

/** Historical PI-0 placeholder. No longer returned. */
export const LEGACY_PI_7_NOT_IMPLEMENTED_REASON = "pi_7_not_implemented" as const;

export const PROJECT_HEALTH_EXPLANATION_ABSTAIN_REASON = "canonical_analyst_required" as const;
export const PROJECT_HEALTH_EXPLANATION_CANONICAL_SURFACE =
  "/engineering/apps/project-intelligence/analyst" as const;

export type ProjectHealthExplanationResult = {
  abstained: true;
  reason: typeof PROJECT_HEALTH_EXPLANATION_ABSTAIN_REASON;
  canonicalCapability: typeof AI_PROJECT_ANALYST_CAPABILITY;
  canonicalSurface: typeof PROJECT_HEALTH_EXPLANATION_CANONICAL_SURFACE;
  implementsOwnAiStack: false;
  deterministicStateUnchanged: true;
};

export function requestProjectHealthExplanation(
  _request: ProjectHealthExplanationRequest,
): ProjectHealthExplanationResult {
  return {
    abstained: true,
    reason: PROJECT_HEALTH_EXPLANATION_ABSTAIN_REASON,
    canonicalCapability: AI_PROJECT_ANALYST_CAPABILITY,
    canonicalSurface: PROJECT_HEALTH_EXPLANATION_CANONICAL_SURFACE,
    implementsOwnAiStack,
    deterministicStateUnchanged: true,
  };
}

export function assertProjectHealthAiBoundary(): void {
  if (implementsOwnAiStack) {
    throw new Error("Project Health must not implement its own AI stack");
  }
}
