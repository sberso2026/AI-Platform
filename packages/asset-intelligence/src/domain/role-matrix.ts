/**
 * Phase 10E — least-privilege role matrix for Failure Intelligence.
 * Application-level segregation; RLS remains tenant/workspace membership.
 */

export type FailureIntelligenceRole =
  | "viewer"
  | "engineer"
  | "reviewer"
  | "manager"
  | "owner"
  | "admin";

export type FailureCapability =
  | "failure.read"
  | "failure.assess"
  | "failure.submit"
  | "failure.review"
  | "failure.approve"
  | "failure.publish"
  | "failure.taxonomy.query"
  | "failure.history.read"
  | "timeseries.read"
  | "timeseries.ingest"
  | "trend.read"
  | "trend.assess"
  | "degradation.read"
  | "degradation.assess"
  | "degradation.submit"
  | "degradation.review"
  | "degradation.approve"
  | "degradation.publish";

export const FAILURE_ROLE_CAPABILITIES: Record<
  FailureIntelligenceRole,
  readonly FailureCapability[]
> = {
  viewer: [
    "failure.read",
    "failure.taxonomy.query",
    "failure.history.read",
    "timeseries.read",
    "trend.read",
    "degradation.read",
  ],
  engineer: [
    "failure.read",
    "failure.assess",
    "failure.submit",
    "failure.taxonomy.query",
    "failure.history.read",
    "timeseries.read",
    "timeseries.ingest",
    "trend.read",
    "trend.assess",
    "degradation.read",
    "degradation.assess",
    "degradation.submit",
  ],
  reviewer: [
    "failure.read",
    "failure.review",
    "failure.approve",
    "failure.taxonomy.query",
    "failure.history.read",
    "timeseries.read",
    "trend.read",
    "degradation.read",
    "degradation.review",
    "degradation.approve",
  ],
  manager: [
    "failure.read",
    "failure.assess",
    "failure.submit",
    "failure.review",
    "failure.approve",
    "failure.publish",
    "failure.taxonomy.query",
    "failure.history.read",
    "timeseries.read",
    "timeseries.ingest",
    "trend.read",
    "trend.assess",
    "degradation.read",
    "degradation.assess",
    "degradation.submit",
    "degradation.review",
    "degradation.approve",
    "degradation.publish",
  ],
  owner: [
    "failure.read",
    "failure.assess",
    "failure.submit",
    "failure.review",
    "failure.approve",
    "failure.publish",
    "failure.taxonomy.query",
    "failure.history.read",
    "timeseries.read",
    "timeseries.ingest",
    "trend.read",
    "trend.assess",
    "degradation.read",
    "degradation.assess",
    "degradation.submit",
    "degradation.review",
    "degradation.approve",
    "degradation.publish",
  ],
  admin: [
    "failure.read",
    "failure.assess",
    "failure.submit",
    "failure.review",
    "failure.approve",
    "failure.publish",
    "failure.taxonomy.query",
    "failure.history.read",
    "timeseries.read",
    "timeseries.ingest",
    "trend.read",
    "trend.assess",
    "degradation.read",
    "degradation.assess",
    "degradation.submit",
    "degradation.review",
    "degradation.approve",
    "degradation.publish",
  ],
};

/** Engineer may assess/submit but cannot self-approve under segregation. */
export const ENGINEER_SELF_APPROVE_FORBIDDEN = true as const;
/** AI may not approve or publish. */
export const AI_SELF_APPROVE_FORBIDDEN = true as const;
export const AI_AUTONOMOUS_PUBLISH_FORBIDDEN = true as const;

export function roleHasCapability(
  role: FailureIntelligenceRole,
  capability: FailureCapability,
): boolean {
  return FAILURE_ROLE_CAPABILITIES[role].includes(capability);
}

export function assertFailureCapability(
  role: FailureIntelligenceRole,
  capability: FailureCapability,
  opts?: { actorId?: string; subjectActorId?: string },
): void {
  if (
    ENGINEER_SELF_APPROVE_FORBIDDEN &&
    role === "engineer" &&
    (capability === "failure.approve" ||
      capability === "failure.publish" ||
      capability === "degradation.approve" ||
      capability === "degradation.publish")
  ) {
    throw new Error("engineer_self_approve_forbidden");
  }
  if (!roleHasCapability(role, capability)) {
    throw new Error(`failure_capability_denied:${role}:${capability}`);
  }
  if (
    opts?.actorId &&
    opts.subjectActorId &&
    opts.actorId === opts.subjectActorId &&
    (capability === "failure.approve" || capability === "failure.publish") &&
    role === "engineer"
  ) {
    throw new Error("segregation_of_duties_violation");
  }
}
