/**
 * Recommendation Framework — reusable engineering recommendations (Phase 9D).
 */
import { randomUUID } from "node:crypto";
import type { EngineeringRecommendationRef } from "@rtb/engineering-os";

export type RecommendationAction =
  | "repair"
  | "replace"
  | "monitor"
  | "shutdown"
  | "reinspect"
  | "escalate"
  | "engineering_assessment"
  | "no_action";

export type RecommendationStatus = "draft" | "issued" | "accepted" | "rejected" | "superseded";

export type InspectionRecommendation = {
  id: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId?: string;
  action: RecommendationAction;
  rationale: string;
  status: RecommendationStatus;
  createdAt: string;
  updatedAt: string;
};

export function createRecommendation(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId?: string;
  action: RecommendationAction;
  rationale: string;
}): InspectionRecommendation {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    ...input,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

export function issueRecommendation(
  recommendation: InspectionRecommendation,
): InspectionRecommendation {
  if (recommendation.status !== "draft") {
    throw new Error("recommendation_already_issued");
  }
  return { ...recommendation, status: "issued", updatedAt: new Date().toISOString() };
}

export function toRecommendationRef(
  recommendation: InspectionRecommendation,
): EngineeringRecommendationRef {
  return { recommendationId: recommendation.id, action: recommendation.action };
}
