import { failClosed } from "./errors";
import { resolveAuthAssuranceLevel } from "./identity-assurance";

/**
 * Review-only identity assurance. Does not globally force MFA onto other products.
 * Authentication success is distinct from assurance sufficiency.
 */
export type ReviewIdentityPolicy = {
  requireMfa: boolean;
  requireEnterpriseSso: boolean;
};

export type ReviewIdentityClaims = {
  aal?: string | null;
  amr?: Array<string | { method?: string }> | null;
  appMetadata?: Record<string, unknown> | null;
};

export type ReviewIdentityDecision =
  | { allowed: true; reason: "policy_not_required" | "mfa_verified" | "sso_verified" | "mfa_and_sso_verified" }
  | {
      allowed: false;
      reason: "mfa_required" | "enterprise_sso_required" | "assurance_unknown_fail_closed";
    };

export type ReviewTenantIdentitySettings = {
  engineeringReview?: {
    requireMfa?: boolean;
    requireEnterpriseSso?: boolean;
  };
};

export function resolveReviewIdentityPolicy(
  settings: ReviewTenantIdentitySettings | Record<string, unknown> | null | undefined,
  env: NodeJS.ProcessEnv = process.env,
): ReviewIdentityPolicy {
  const review =
    settings && typeof settings === "object" && "engineeringReview" in settings
      ? ((settings as ReviewTenantIdentitySettings).engineeringReview ?? {})
      : {};
  const explicitMfa = typeof review.requireMfa === "boolean";
  const explicitSso = typeof review.requireEnterpriseSso === "boolean";
  if (explicitMfa || explicitSso) {
    return {
      requireMfa: review.requireMfa === true,
      requireEnterpriseSso: review.requireEnterpriseSso === true,
    };
  }
  if (env.RTB_REVIEW_ENTERPRISE_IDENTITY === "1") {
    return { requireMfa: true, requireEnterpriseSso: env.RTB_REVIEW_REQUIRE_SSO === "1" };
  }
  return { requireMfa: false, requireEnterpriseSso: false };
}

export function hasEnterpriseSso(claims: ReviewIdentityClaims): boolean {
  const methods = (claims.amr ?? []).map((entry) =>
    typeof entry === "string" ? entry.toLowerCase() : (entry.method ?? "").toLowerCase(),
  );
  if (methods.some((method) => method === "sso" || method === "saml" || method === "oidc" || method === "oauth")) {
    return true;
  }
  const metadata = claims.appMetadata ?? {};
  const provider = String(metadata.provider ?? "").toLowerCase();
  if (provider && provider !== "email") return true;
  const providers = metadata.providers;
  if (Array.isArray(providers) && providers.some((item) => String(item).toLowerCase() !== "email")) {
    return true;
  }
  return false;
}

export function evaluateReviewIdentityPolicy(
  policy: ReviewIdentityPolicy,
  claims: ReviewIdentityClaims,
): ReviewIdentityDecision {
  if (!policy.requireMfa && !policy.requireEnterpriseSso) {
    return { allowed: true, reason: "policy_not_required" };
  }

  const level = resolveAuthAssuranceLevel(claims);
  const sso = hasEnterpriseSso(claims);

  if (policy.requireMfa && level === "unknown") {
    return { allowed: false, reason: "assurance_unknown_fail_closed" };
  }
  if (policy.requireMfa && level !== "aal2") {
    return { allowed: false, reason: "mfa_required" };
  }
  if (policy.requireEnterpriseSso && !sso) {
    return { allowed: false, reason: "enterprise_sso_required" };
  }
  if (policy.requireMfa && policy.requireEnterpriseSso) {
    return { allowed: true, reason: "mfa_and_sso_verified" };
  }
  if (policy.requireMfa) return { allowed: true, reason: "mfa_verified" };
  return { allowed: true, reason: "sso_verified" };
}

export function assertReviewIdentityOrThrow(
  policy: ReviewIdentityPolicy,
  claims: ReviewIdentityClaims,
): void {
  const decision = evaluateReviewIdentityPolicy(policy, claims);
  if (!decision.allowed) {
    failClosed("identity_assurance_insufficient", "Authentication succeeded but Review identity policy was not met", {
      reason: decision.reason,
      requireMfa: policy.requireMfa,
      requireEnterpriseSso: policy.requireEnterpriseSso,
    });
  }
}
