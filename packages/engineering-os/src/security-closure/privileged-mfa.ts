/**
 * Phase 14D S01 — Privileged MFA policy + fail-closed enforcement.
 * Reuses Supabase Auth JWT assurance claims (aal / amr). Not a new IdP.
 */

export type PrivilegedRole =
  | "owner"
  | "platform_admin"
  | "security_admin"
  | "production_support_privileged";

export type AuthAssuranceLevel = "aal1" | "aal2" | "unknown";

export interface PrivilegedAuthClaims {
  /** Supabase Auth Assurance Level when present. */
  aal?: string | null;
  /** Authentication Methods References when present. */
  amr?: Array<string | { method?: string }> | null;
  /** app_metadata.platform_admin */
  platformAdmin?: boolean;
  /** Active membership role slug */
  roleSlug?: string | null;
  /** Explicit break-glass session approved + audited */
  breakGlassActive?: boolean;
}

export const PRIVILEGED_ROLES: readonly PrivilegedRole[] = [
  "owner",
  "platform_admin",
  "security_admin",
  "production_support_privileged",
] as const;

/** External IdP (Supabase Auth MFA) must issue aal2 / MFA amr for production. */
export const PRIVILEGED_MFA_EXTERNAL_ENFORCEMENT_DEPENDENCY =
  "supabase_auth_mfa" as const;

export function resolveAuthAssuranceLevel(
  claims: PrivilegedAuthClaims,
): AuthAssuranceLevel {
  const aal = (claims.aal ?? "").toLowerCase();
  if (aal === "aal2") return "aal2";
  if (aal === "aal1") return "aal1";

  const methods = (claims.amr ?? []).map((entry) =>
    typeof entry === "string" ? entry.toLowerCase() : (entry.method ?? "").toLowerCase(),
  );
  if (methods.some((m) => m === "totp" || m === "mfa" || m === "phone" || m === "otp")) {
    return "aal2";
  }
  if (methods.length > 0) return "aal1";
  return "unknown";
}

export function isPrivilegedPrincipal(claims: PrivilegedAuthClaims): boolean {
  if (claims.platformAdmin === true) return true;
  const slug = (claims.roleSlug ?? "").toLowerCase();
  return (
    slug === "owner" ||
    slug === "platform_admin" ||
    slug === "security_admin" ||
    slug === "production_support_privileged"
  );
}

export type PrivilegedMfaDecision =
  | { allowed: true; reason: "aal2_verified" | "break_glass_audited" }
  | {
      allowed: false;
      reason:
        | "privileged_mfa_required"
        | "assurance_unknown_fail_closed"
        | "not_privileged";
    };

/**
 * Fail-closed privileged authentication decision.
 * Break-glass may proceed only when explicitly marked active (audit required separately).
 */
export function evaluatePrivilegedMfa(
  claims: PrivilegedAuthClaims,
): PrivilegedMfaDecision {
  if (!isPrivilegedPrincipal(claims)) {
    return { allowed: false, reason: "not_privileged" };
  }
  if (claims.breakGlassActive === true) {
    return { allowed: true, reason: "break_glass_audited" };
  }
  const level = resolveAuthAssuranceLevel(claims);
  if (level === "aal2") {
    return { allowed: true, reason: "aal2_verified" };
  }
  if (level === "unknown") {
    return { allowed: false, reason: "assurance_unknown_fail_closed" };
  }
  return { allowed: false, reason: "privileged_mfa_required" };
}

export function assertPrivilegedMfaOrThrow(claims: PrivilegedAuthClaims): void {
  const decision = evaluatePrivilegedMfa(claims);
  if (!decision.allowed) {
    throw new Error(
      `Privileged operation denied (${decision.reason}). MFA/AAL2 required via ${PRIVILEGED_MFA_EXTERNAL_ENFORCEMENT_DEPENDENCY}.`,
    );
  }
}

