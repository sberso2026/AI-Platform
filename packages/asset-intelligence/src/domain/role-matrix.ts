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
  | "degradation.publish"
  | "lifecycle.read"
  | "lifecycle.assess"
  | "lifecycle.submit"
  | "lifecycle.review"
  | "lifecycle.approve"
  | "lifecycle.publish"
  | "decision_context.read"
  | "risk.read"
  | "risk.assess"
  | "risk.submit"
  | "risk.review"
  | "risk.approve"
  | "risk.publish"
  | "maintenance_recommendation.read"
  | "maintenance_recommendation.assess"
  | "maintenance_recommendation.submit"
  | "maintenance_recommendation.review"
  | "maintenance_recommendation.approve"
  | "maintenance_recommendation.publish"
  | "priority.read"
  | "priority.assess"
  | "priority.submit"
  | "priority.review"
  | "priority.approve"
  | "priority.publish"
  | "fusion.read"
  | "fusion.assess"
  | "fusion.submit"
  | "fusion.review"
  | "fusion.approve"
  | "fusion.publish"
  | "predictive_readiness.read"
  | "predictive_readiness.assess"
  | "predictive_readiness.submit"
  | "predictive_readiness.review"
  | "predictive_readiness.approve"
  | "predictive_readiness.publish"
  | "predictive_governance.read"
  | "predictive_governance.assess"
  | "predictive_governance.submit"
  | "predictive_governance.review"
  | "predictive_governance.approve"
  | "predictive_governance.publish";

/** Phase 10H — capabilities whose approval/publication is segregated from assessment. */
export const PHASE_10H_READ_CAPABILITIES = [
  "decision_context.read",
  "risk.read",
  "maintenance_recommendation.read",
  "priority.read",
] as const satisfies readonly FailureCapability[];

export const PHASE_10H_ASSESS_CAPABILITIES = [
  "risk.assess",
  "risk.submit",
  "maintenance_recommendation.assess",
  "maintenance_recommendation.submit",
  "priority.assess",
  "priority.submit",
] as const satisfies readonly FailureCapability[];

export const PHASE_10H_REVIEW_CAPABILITIES = [
  "risk.review",
  "risk.approve",
  "maintenance_recommendation.review",
  "maintenance_recommendation.approve",
  "priority.review",
  "priority.approve",
] as const satisfies readonly FailureCapability[];

export const PHASE_10H_PUBLISH_CAPABILITIES = [
  "risk.publish",
  "maintenance_recommendation.publish",
  "priority.publish",
] as const satisfies readonly FailureCapability[];

/** Phase 10I — fusion and predictive readiness follow the same segregation model. */
export const PHASE_10I_READ_CAPABILITIES = [
  "fusion.read",
  "predictive_readiness.read",
] as const satisfies readonly FailureCapability[];

export const PHASE_10I_ASSESS_CAPABILITIES = [
  "fusion.assess",
  "fusion.submit",
  "predictive_readiness.assess",
  "predictive_readiness.submit",
] as const satisfies readonly FailureCapability[];

export const PHASE_10I_REVIEW_CAPABILITIES = [
  "fusion.review",
  "fusion.approve",
  "predictive_readiness.review",
  "predictive_readiness.approve",
] as const satisfies readonly FailureCapability[];

export const PHASE_10I_PUBLISH_CAPABILITIES = [
  "fusion.publish",
  "predictive_readiness.publish",
] as const satisfies readonly FailureCapability[];

/**
 * Phase 10J — predictive method governance. Publishing a qualified method is a
 * governance act only: it never grants certified production execution.
 */
export const PHASE_10J_READ_CAPABILITIES = [
  "predictive_governance.read",
] as const satisfies readonly FailureCapability[];

export const PHASE_10J_ASSESS_CAPABILITIES = [
  "predictive_governance.assess",
  "predictive_governance.submit",
] as const satisfies readonly FailureCapability[];

export const PHASE_10J_REVIEW_CAPABILITIES = [
  "predictive_governance.review",
  "predictive_governance.approve",
] as const satisfies readonly FailureCapability[];

export const PHASE_10J_PUBLISH_CAPABILITIES = [
  "predictive_governance.publish",
] as const satisfies readonly FailureCapability[];

/** Approving or publishing these is forbidden for the engineer who assessed them. */
export const SELF_APPROVE_FORBIDDEN_CAPABILITIES: readonly FailureCapability[] = [
  "failure.approve",
  "failure.publish",
  "degradation.approve",
  "degradation.publish",
  "lifecycle.approve",
  "lifecycle.publish",
  ...PHASE_10H_REVIEW_CAPABILITIES.filter((c) => c.endsWith(".approve")),
  ...PHASE_10H_PUBLISH_CAPABILITIES,
  ...PHASE_10I_REVIEW_CAPABILITIES.filter((c) => c.endsWith(".approve")),
  ...PHASE_10I_PUBLISH_CAPABILITIES,
  ...PHASE_10J_REVIEW_CAPABILITIES.filter((c) => c.endsWith(".approve")),
  ...PHASE_10J_PUBLISH_CAPABILITIES,
];

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
    "lifecycle.read",
    ...PHASE_10H_READ_CAPABILITIES,
    ...PHASE_10I_READ_CAPABILITIES,
    ...PHASE_10J_READ_CAPABILITIES,
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
    "lifecycle.read",
    "lifecycle.assess",
    "lifecycle.submit",
    ...PHASE_10H_READ_CAPABILITIES,
    ...PHASE_10H_ASSESS_CAPABILITIES,
    ...PHASE_10I_READ_CAPABILITIES,
    ...PHASE_10I_ASSESS_CAPABILITIES,
    ...PHASE_10J_READ_CAPABILITIES,
    ...PHASE_10J_ASSESS_CAPABILITIES,
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
    "lifecycle.read",
    "lifecycle.review",
    "lifecycle.approve",
    ...PHASE_10H_READ_CAPABILITIES,
    ...PHASE_10H_REVIEW_CAPABILITIES,
    ...PHASE_10I_READ_CAPABILITIES,
    ...PHASE_10I_REVIEW_CAPABILITIES,
    ...PHASE_10J_READ_CAPABILITIES,
    ...PHASE_10J_REVIEW_CAPABILITIES,
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
    "lifecycle.read",
    "lifecycle.assess",
    "lifecycle.submit",
    "lifecycle.review",
    "lifecycle.approve",
    "lifecycle.publish",
    ...PHASE_10H_READ_CAPABILITIES,
    ...PHASE_10H_ASSESS_CAPABILITIES,
    ...PHASE_10H_REVIEW_CAPABILITIES,
    ...PHASE_10H_PUBLISH_CAPABILITIES,
    ...PHASE_10I_READ_CAPABILITIES,
    ...PHASE_10I_ASSESS_CAPABILITIES,
    ...PHASE_10I_REVIEW_CAPABILITIES,
    ...PHASE_10I_PUBLISH_CAPABILITIES,
    ...PHASE_10J_READ_CAPABILITIES,
    ...PHASE_10J_ASSESS_CAPABILITIES,
    ...PHASE_10J_REVIEW_CAPABILITIES,
    ...PHASE_10J_PUBLISH_CAPABILITIES,
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
    "lifecycle.read",
    "lifecycle.assess",
    "lifecycle.submit",
    "lifecycle.review",
    "lifecycle.approve",
    "lifecycle.publish",
    ...PHASE_10H_READ_CAPABILITIES,
    ...PHASE_10H_ASSESS_CAPABILITIES,
    ...PHASE_10H_REVIEW_CAPABILITIES,
    ...PHASE_10H_PUBLISH_CAPABILITIES,
    ...PHASE_10I_READ_CAPABILITIES,
    ...PHASE_10I_ASSESS_CAPABILITIES,
    ...PHASE_10I_REVIEW_CAPABILITIES,
    ...PHASE_10I_PUBLISH_CAPABILITIES,
    ...PHASE_10J_READ_CAPABILITIES,
    ...PHASE_10J_ASSESS_CAPABILITIES,
    ...PHASE_10J_REVIEW_CAPABILITIES,
    ...PHASE_10J_PUBLISH_CAPABILITIES,
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
    "lifecycle.read",
    "lifecycle.assess",
    "lifecycle.submit",
    "lifecycle.review",
    "lifecycle.approve",
    "lifecycle.publish",
    ...PHASE_10H_READ_CAPABILITIES,
    ...PHASE_10H_ASSESS_CAPABILITIES,
    ...PHASE_10H_REVIEW_CAPABILITIES,
    ...PHASE_10H_PUBLISH_CAPABILITIES,
    ...PHASE_10I_READ_CAPABILITIES,
    ...PHASE_10I_ASSESS_CAPABILITIES,
    ...PHASE_10I_REVIEW_CAPABILITIES,
    ...PHASE_10I_PUBLISH_CAPABILITIES,
    ...PHASE_10J_READ_CAPABILITIES,
    ...PHASE_10J_ASSESS_CAPABILITIES,
    ...PHASE_10J_REVIEW_CAPABILITIES,
    ...PHASE_10J_PUBLISH_CAPABILITIES,
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
    SELF_APPROVE_FORBIDDEN_CAPABILITIES.includes(capability)
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
    SELF_APPROVE_FORBIDDEN_CAPABILITIES.includes(capability) &&
    role === "engineer"
  ) {
    throw new Error("segregation_of_duties_violation");
  }
}
