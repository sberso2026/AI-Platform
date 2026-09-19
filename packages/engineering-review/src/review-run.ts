import { failClosed } from "./errors";
import { asReviewPackageId, asReviewRunId, type ReviewPackageId, type ReviewRunId } from "./ids";
import { assertSameOwnership, createReviewOwnership, type ReviewOwnership } from "./ownership";
import type { ReviewPackage, ReviewPackageDocument } from "./review-package";
import type { ReviewScope } from "./review-scope";
import { ENGINEERING_REVIEW_ENGINE_VERSION } from "./version";

export const REVIEW_RUN_STATUSES = ["queued", "running", "completed", "failed", "cancelled"] as const;
export type ReviewRunStatus = (typeof REVIEW_RUN_STATUSES)[number];

export type ReviewRunRuleRef = {
  ruleId: string;
  version: string;
};

export type ReviewRunProvenance = {
  engineVersion: string;
  promptVersion?: string;
  modelProvider?: string;
  modelId?: string;
  ruleSetHash: string;
};

export type ReviewRun = ReviewOwnership & {
  id: ReviewRunId;
  reviewPackageId: ReviewPackageId;
  status: ReviewRunStatus;
  scope: ReviewScope;
  inputDocuments: readonly ReviewPackageDocument[];
  rules: readonly ReviewRunRuleRef[];
  provenance: ReviewRunProvenance;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export function hashRuleSet(rules: readonly ReviewRunRuleRef[]): string {
  return [...rules]
    .map((rule) => `${rule.ruleId}@${rule.version}`)
    .sort()
    .join("|");
}

export function createReviewRun(input: {
  id: string;
  pkg: ReviewPackage;
  scope: ReviewScope;
  rules: readonly ReviewRunRuleRef[];
  promptVersion?: string;
  modelProvider?: string;
  modelId?: string;
  now?: string;
}): ReviewRun {
  if (input.pkg.status === "archived") {
    failClosed("package_archived", "Cannot run review against an archived package");
  }
  const ownership = createReviewOwnership(input.pkg);
  assertSameOwnership(ownership, input.pkg);
  const now = input.now ?? new Date().toISOString();
  const rules = [...input.rules];
  return {
    id: asReviewRunId(input.id),
    reviewPackageId: asReviewPackageId(input.pkg.id),
    tenantId: ownership.tenantId,
    workspaceId: ownership.workspaceId,
    projectId: ownership.projectId,
    status: "queued",
    scope: input.scope,
    inputDocuments: input.pkg.documents,
    rules,
    provenance: {
      engineVersion: ENGINEERING_REVIEW_ENGINE_VERSION,
      promptVersion: input.promptVersion,
      modelProvider: input.modelProvider,
      modelId: input.modelId,
      ruleSetHash: hashRuleSet(rules),
    },
    createdAt: now,
    updatedAt: now,
  };
}

export function transitionReviewRun(
  run: ReviewRun,
  to: ReviewRunStatus,
  now?: string,
): ReviewRun {
  const allowed: Record<ReviewRunStatus, readonly ReviewRunStatus[]> = {
    queued: ["running", "cancelled"],
    running: ["completed", "failed", "cancelled"],
    completed: [],
    failed: ["queued"],
    cancelled: [],
  };
  if (!allowed[run.status].includes(to)) {
    failClosed("run_transition_invalid", "Review run status transition is not allowed", {
      from: run.status,
      to,
    });
  }
  const at = now ?? new Date().toISOString();
  return {
    ...run,
    status: to,
    startedAt: to === "running" ? at : run.startedAt,
    completedAt: to === "completed" || to === "failed" || to === "cancelled" ? at : run.completedAt,
    updatedAt: at,
  };
}
