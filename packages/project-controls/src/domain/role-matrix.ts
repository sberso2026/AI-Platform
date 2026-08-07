/**
 * Phase 11B — Project Controls capability matrix.
 *
 * Segregation of duties: the role that assesses progress cannot approve or
 * publish it. Capabilities for reserved concerns (cost, schedule, earned value)
 * are deliberately absent — there is nothing to grant.
 */

export const PROJECT_CONTROLS_ROLES = [
  "viewer",
  "project_controls_engineer",
  "reviewer",
  "approver",
  "admin",
] as const;

export type ProjectControlsRole = (typeof PROJECT_CONTROLS_ROLES)[number];

export const PROJECT_CONTROLS_CAPABILITIES = [
  "progress.read",
  "progress.assess",
  "progress.submit_review",
  "progress.review",
  "progress.approve",
  "progress.publish",
  "progress.reject",
  "profile.read",
  "profile.compose",
] as const;

export type ProjectControlsCapability = (typeof PROJECT_CONTROLS_CAPABILITIES)[number];

/** Capabilities an actor may never exercise on their own assessment. */
export const SELF_APPROVE_FORBIDDEN_CAPABILITIES: readonly ProjectControlsCapability[] = [
  "progress.approve",
  "progress.publish",
] as const;

const MATRIX: Record<ProjectControlsRole, readonly ProjectControlsCapability[]> = {
  viewer: ["progress.read", "profile.read"],
  project_controls_engineer: [
    "progress.read",
    "progress.assess",
    "progress.submit_review",
    "profile.read",
    "profile.compose",
  ],
  reviewer: [
    "progress.read",
    "progress.review",
    "progress.reject",
    "profile.read",
  ],
  approver: [
    "progress.read",
    "progress.review",
    "progress.approve",
    "progress.publish",
    "progress.reject",
    "profile.read",
  ],
  admin: [...PROJECT_CONTROLS_CAPABILITIES],
};

export const PROJECT_CONTROLS_ROLE_MATRIX = MATRIX;

export function roleHasCapability(
  role: ProjectControlsRole,
  capability: ProjectControlsCapability,
): boolean {
  return MATRIX[role]?.includes(capability) ?? false;
}

export function assertProjectControlsCapability(
  role: ProjectControlsRole | undefined,
  capability: ProjectControlsCapability,
  options: { actorId?: string; assessedBy?: string } = {},
): void {
  if (!role) throw new Error(`project_controls_role_required:${capability}`);
  if (!roleHasCapability(role, capability)) {
    throw new Error(`project_controls_capability_denied:${role}:${capability}`);
  }
  if (
    SELF_APPROVE_FORBIDDEN_CAPABILITIES.includes(capability) &&
    options.actorId &&
    options.assessedBy &&
    options.actorId === options.assessedBy
  ) {
    throw new Error(`project_controls_self_approval_forbidden:${capability}`);
  }
}

/** No capability grants access to a reserved concern. */
export function assertNoReservedCapabilities(): { ok: true } {
  const forbidden = /(cost|schedule|earned_value|forecast|change|contingency|productivity)/;
  for (const capability of PROJECT_CONTROLS_CAPABILITIES) {
    if (forbidden.test(capability)) {
      throw new Error(`reserved_capability_must_not_be_granted:${capability}`);
    }
  }
  return { ok: true };
}
