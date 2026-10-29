/**
 * Phase 13B — Mapping states + mapping review (human confirmation; no AI self-approval).
 */

import { MAPPING_REVIEW_SLUG } from "../version";

export type EngineeringModelMappingState =
  | "unmapped"
  | "candidate"
  | "confirmed"
  | "conflicting"
  | "superseded"
  | "unknown";

export type EngineeringModelMappingTargetKind =
  | "asset"
  | "project"
  | "spatial"
  | "twin"
  | "element"
  | "unknown";

export type EngineeringModelMapping = {
  kind: "engineering_model_mapping";
  owner: "engineering_model_interoperability";
  mappingId: string;
  tenantId: string;
  workspaceId: string;
  modelRefId: string;
  modelVersionId?: string;
  elementRefId?: string;
  targetKind: EngineeringModelMappingTargetKind;
  targetId?: string;
  state: EngineeringModelMappingState;
  candidateTargetId?: string;
  confirmedTargetId?: string;
  notes?: string;
  aiSelfApproval: false;
  createdAt: string;
  updatedAt: string;
};

export type EngineeringModelMappingReviewDecision =
  | "confirm"
  | "reject"
  | "request_changes"
  | "abstain";

export type EngineeringModelMappingReview = {
  kind: "engineering_model_mapping_review";
  owner: "engineering_model_interoperability";
  reviewId: string;
  tenantId: string;
  workspaceId: string;
  mappingId: string;
  decision: EngineeringModelMappingReviewDecision;
  reviewerId?: string;
  rationale?: string;
  aiSelfApproval: false;
  workflowSlug: typeof MAPPING_REVIEW_SLUG;
  createdAt: string;
};

export function assertNoAiSelfApproval(aiSelfApproval: boolean): void {
  if (aiSelfApproval) {
    throw new Error("ai_self_approval_forbidden");
  }
}
