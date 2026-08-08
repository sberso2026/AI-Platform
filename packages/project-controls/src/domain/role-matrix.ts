/**
 * Phase 11D — Project Controls capability matrix.
 *
 * Segregation of duties: the role that assesses cannot approve or publish.
 * CPM / cost / earned value / forecast / contingency / financial posting
 * capabilities remain absent. Change capabilities cover the *assessment*
 * lifecycle only — no capability here confers contractual change authority.
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
  "schedule.read",
  "schedule.assess",
  "schedule.submit_review",
  "schedule.review",
  "schedule.approve",
  "schedule.publish",
  "schedule.reject",
  "change.read",
  "change.assess",
  "change.submit_review",
  "change.review",
  "change.approve",
  "change.publish",
  "change.reject",
  "cost.read",
  "cost.assess",
  "cost.submit_review",
  "cost.review",
  "cost.approve",
  "cost.publish",
  "cost.reject",
  "productivity.read",
  "productivity.assess",
  "productivity.submit_review",
  "productivity.review",
  "productivity.approve",
  "productivity.publish",
  "productivity.reject",
  "profile.read",
  "profile.compose",
  "snapshot.read",
  "snapshot.create",
] as const;

export type ProjectControlsCapability = (typeof PROJECT_CONTROLS_CAPABILITIES)[number];

export const SELF_APPROVE_FORBIDDEN_CAPABILITIES: readonly ProjectControlsCapability[] = [
  "progress.approve",
  "progress.publish",
  "schedule.approve",
  "schedule.publish",
  "change.approve",
  "change.publish",
  "cost.approve",
  "cost.publish",
  "productivity.approve",
  "productivity.publish",
] as const;

const MATRIX: Record<ProjectControlsRole, readonly ProjectControlsCapability[]> = {
  viewer: [
    "progress.read",
    "schedule.read",
    "change.read",
    "cost.read",
    "productivity.read",
    "profile.read",
    "snapshot.read",
  ],
  project_controls_engineer: [
    "progress.read",
    "progress.assess",
    "progress.submit_review",
    "schedule.read",
    "schedule.assess",
    "schedule.submit_review",
    "change.read",
    "change.assess",
    "change.submit_review",
    "cost.read",
    "cost.assess",
    "cost.submit_review",
    "productivity.read",
    "productivity.assess",
    "productivity.submit_review",
    "profile.read",
    "profile.compose",
    "snapshot.read",
    "snapshot.create",
  ],
  reviewer: [
    "progress.read",
    "progress.review",
    "progress.reject",
    "schedule.read",
    "schedule.review",
    "schedule.reject",
    "change.read",
    "change.review",
    "change.reject",
    "cost.read",
    "cost.review",
    "cost.reject",
    "productivity.read",
    "productivity.review",
    "productivity.reject",
    "profile.read",
    "snapshot.read",
  ],
  approver: [
    "progress.read",
    "progress.review",
    "progress.approve",
    "progress.publish",
    "progress.reject",
    "schedule.read",
    "schedule.review",
    "schedule.approve",
    "schedule.publish",
    "schedule.reject",
    "change.read",
    "change.review",
    "change.approve",
    "change.publish",
    "change.reject",
    "cost.read",
    "cost.review",
    "cost.approve",
    "cost.publish",
    "cost.reject",
    "productivity.read",
    "productivity.review",
    "productivity.approve",
    "productivity.publish",
    "productivity.reject",
    "profile.read",
    "snapshot.read",
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

/**
 * Reserved capabilities must never appear in the matrix. `change.*` and `cost.*`
 * are implemented *assessment* capability sets; earned value, CPM, float,
 * forecast, contingency and financial posting stay forbidden.
 */
export function assertNoReservedCapabilities(): { ok: true } {
  const forbidden = /^(earned_value|cpm|float|forecast|contingency|posting)/;
  for (const capability of PROJECT_CONTROLS_CAPABILITIES) {
    if (forbidden.test(capability)) {
      throw new Error(`reserved_capability_must_not_be_granted:${capability}`);
    }
  }
  return { ok: true };
}
