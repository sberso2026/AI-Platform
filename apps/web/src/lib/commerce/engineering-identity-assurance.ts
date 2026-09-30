import {
  evaluateReviewIdentityPolicy,
  type ReviewIdentityClaims,
  type ReviewIdentityPolicy,
} from "@rtb/engineering-review";

/** Deliverables, Lifecycle, and their settings mutations require tenant MFA when requireMfa is set. */
const ENGINEERING_A9E_ALL_METHOD_SEGMENTS = new Set(["deliverables", "lifecycle", "information", "work"]);
const ENGINEERING_A9E_MUTATING_SEGMENTS = new Set(["settings"]);

export function engineeringApiRequiresIdentityAssurance(segment: string, method: string): boolean {
  if (ENGINEERING_A9E_ALL_METHOD_SEGMENTS.has(segment)) return true;
  if (ENGINEERING_A9E_MUTATING_SEGMENTS.has(segment)) {
    return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
  }
  return false;
}

export function decideEngineeringIdentityAssurance(input: {
  segment: string;
  method: string;
  policy: ReviewIdentityPolicy;
  claims: ReviewIdentityClaims;
}): { gated: boolean; allowed: boolean; reason: string } {
  if (!engineeringApiRequiresIdentityAssurance(input.segment, input.method)) {
    return { gated: false, allowed: true, reason: "segment_not_gated" };
  }
  const identity = evaluateReviewIdentityPolicy(input.policy, input.claims);
  return { gated: true, allowed: identity.allowed, reason: identity.reason };
}
