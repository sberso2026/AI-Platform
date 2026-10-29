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

const ENROLLMENT_DENIED_ROLES = new Set([
  "engineer",
  "pilot-engineer",
  "pilot_engineer",
  "ai",
  "member",
  "viewer",
]);

export function normalizeEos2Mode(value: unknown): "off" | "controlled_pilot" {
  return value === "controlled_pilot" ? "controlled_pilot" : "off";
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
  if (normalizeEos2Mode(input.mode) !== "controlled_pilot") return { allowed: false, reason: "global_off" };
  if (input.enrolled !== true) return { allowed: false, reason: "not_enrolled" };
  return { allowed: true, reason: "enrolled" };
}

export function canEnrollEos2(roleSlug: string | null | undefined): boolean {
  const role = (roleSlug ?? "").trim().toLowerCase();
  if (!role || ENROLLMENT_DENIED_ROLES.has(role)) return false;
  return role === "owner" || role === "admin";
}
