/**
 * Phase 12D — TwinSourceAuthorityPolicy (class-based, not universal ranking).
 */

import type { SourceAdapterClass } from "./source-adapter";

export type SourceAuthorityRule = {
  sourceType: SourceAdapterClass;
  mayAcceptWithoutReview: false;
  mayAutoPublish: false;
  precedenceWithinClass: number;
  notes: string;
};

export type TwinSourceAuthorityPolicy = {
  policyId: string;
  policyVersion: string;
  description: string;
  rules: SourceAuthorityRule[];
  universalRankingForbidden: true;
};

export const DEFAULT_SOURCE_AUTHORITY_POLICY: TwinSourceAuthorityPolicy = {
  policyId: "governed_class_authority_v1",
  policyVersion: "1.0.0",
  description: "Class-based authority — no universal source ranking",
  universalRankingForbidden: true,
  rules: [
    {
      sourceType: "manual",
      mayAcceptWithoutReview: false,
      mayAutoPublish: false,
      precedenceWithinClass: 1,
      notes: "Manual governed entries require human review",
    },
    {
      sourceType: "asset_intelligence",
      mayAcceptWithoutReview: false,
      mayAutoPublish: false,
      precedenceWithinClass: 1,
      notes: "AI advisory slices via public contract only",
    },
    {
      sourceType: "project_controls",
      mayAcceptWithoutReview: false,
      mayAutoPublish: false,
      precedenceWithinClass: 1,
      notes: "PC V1 advisory slices via public contract only",
    },
    {
      sourceType: "inspection_intelligence",
      mayAcceptWithoutReview: false,
      mayAutoPublish: false,
      precedenceWithinClass: 0,
      notes: "Readiness stub — insufficient contract for ingestion",
    },
    {
      sourceType: "project_intelligence",
      mayAcceptWithoutReview: false,
      mayAutoPublish: false,
      precedenceWithinClass: 0,
      notes: "Readiness stub — insufficient contract for ingestion",
    },
    {
      sourceType: "telemetry_reference",
      mayAcceptWithoutReview: false,
      mayAutoPublish: false,
      precedenceWithinClass: 0,
      notes: "Telemetry references only — no payload ingestion",
    },
  ],
};

export function resolveAuthorityRule(
  policy: TwinSourceAuthorityPolicy,
  sourceType: SourceAdapterClass,
): SourceAuthorityRule | undefined {
  return policy.rules.find((r) => r.sourceType === sourceType);
}

export function assertAuthorityNoAutoPublish(rule: SourceAuthorityRule): void {
  if (rule.mayAutoPublish) {
    throw new Error("source_authority_auto_publish_forbidden");
  }
}

export function authorityAllowsCandidateAccept(rule: SourceAuthorityRule | undefined): boolean {
  return Boolean(rule && rule.precedenceWithinClass > 0);
}
