export type Eos2AccessDecision = {
  allowed: boolean;
  reason:
    | "enrolled"
    | "unauthenticated"
    | "entitlement_missing"
    | "workspace_missing"
    | "kill_switch"
    | "global_off"
    | "not_enrolled"
    | "indeterminate";
};

export type Eos2ActiveRolloutMode = "controlled_pilot" | "general_availability";

const ENROLLMENT_DENIED_ROLES = new Set([
  "engineer",
  "pilot-engineer",
  "pilot_engineer",
  "ai",
  "member",
  "viewer",
]);

/** Product rollout is active only for controlled pilot or GA; both still require entitlement + enrollment. */
export function isEos2ProductRolloutActive(value: unknown): value is Eos2ActiveRolloutMode {
  return value === "controlled_pilot" || value === "general_availability";
}

export function normalizeEos2Mode(value: unknown): "off" | Eos2ActiveRolloutMode {
  if (value === "controlled_pilot" || value === "general_availability") return value;
  return "off";
}

export function decideEos2Access(input: {
  authenticated: boolean;
  productEntitled: boolean;
  workspaceId: string | null;
  mode: unknown;
  enrolled: unknown;
  emergencyOff: boolean;
  indeterminate?: boolean;
}): Eos2AccessDecision {
  if (input.indeterminate) return { allowed: false, reason: "indeterminate" };
  if (!input.authenticated) return { allowed: false, reason: "unauthenticated" };
  if (!input.productEntitled) return { allowed: false, reason: "entitlement_missing" };
  if (!input.workspaceId) return { allowed: false, reason: "workspace_missing" };
  if (input.emergencyOff) return { allowed: false, reason: "kill_switch" };
  if (!isEos2ProductRolloutActive(normalizeEos2Mode(input.mode))) {
    return { allowed: false, reason: "global_off" };
  }
  if (input.enrolled !== true) return { allowed: false, reason: "not_enrolled" };
  return { allowed: true, reason: "enrolled" };
}

export function canEnrollEos2(roleSlug: string | null | undefined): boolean {
  const role = (roleSlug ?? "").trim().toLowerCase();
  if (!role || ENROLLMENT_DENIED_ROLES.has(role)) return false;
  return role === "owner" || role === "admin";
}
