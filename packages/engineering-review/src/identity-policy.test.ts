import { describe, expect, it } from "vitest";
import {
  assertReviewIdentityOrThrow,
  evaluateReviewIdentityPolicy,
  resolveReviewIdentityPolicy,
} from "./identity-policy";
import { expectCode } from "./expect-code";

describe("Review identity policy", () => {
  it("does not require MFA or SSO unless tenant or env policy says so", () => {
    expect(resolveReviewIdentityPolicy({})).toEqual({ requireMfa: false, requireEnterpriseSso: false });
    const decision = evaluateReviewIdentityPolicy(
      { requireMfa: false, requireEnterpriseSso: false },
      { aal: "aal1", amr: ["password"] },
    );
    expect(decision).toEqual({ allowed: true, reason: "policy_not_required" });
  });

  it("rejects a valid password-only session when Review tenant policy requires MFA", () => {
    const policy = resolveReviewIdentityPolicy({ engineeringReview: { requireMfa: true } });
    expect(policy.requireMfa).toBe(true);
    const decision = evaluateReviewIdentityPolicy(policy, { aal: "aal1", amr: ["password"] });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.reason).toBe("mfa_required");
    expectCode(
      () => assertReviewIdentityOrThrow(policy, { aal: "aal1", amr: ["password"] }),
      "identity_assurance_insufficient",
    );
  });

  it("allows AAL2 when MFA is required", () => {
    const decision = evaluateReviewIdentityPolicy(
      { requireMfa: true, requireEnterpriseSso: false },
      { aal: "aal2", amr: ["password", "totp"] },
    );
    expect(decision).toEqual({ allowed: true, reason: "mfa_verified" });
  });

  it("rejects password email when enterprise SSO is required", () => {
    const decision = evaluateReviewIdentityPolicy(
      { requireMfa: false, requireEnterpriseSso: true },
      { aal: "aal1", amr: ["password"], appMetadata: { provider: "email" } },
    );
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.reason).toBe("enterprise_sso_required");
  });

  it("allows enterprise SSO claims when required", () => {
    const decision = evaluateReviewIdentityPolicy(
      { requireMfa: false, requireEnterpriseSso: true },
      { aal: "aal1", amr: ["sso"], appMetadata: { provider: "azure" } },
    );
    expect(decision).toEqual({ allowed: true, reason: "sso_verified" });
  });

  it("fail-closes when MFA is required and assurance is unknown", () => {
    const decision = evaluateReviewIdentityPolicy(
      { requireMfa: true, requireEnterpriseSso: false },
      { aal: null, amr: null },
    );
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.reason).toBe("assurance_unknown_fail_closed");
  });

  it("enables enterprise Review defaults from env without forcing unrelated products", () => {
    expect(
      resolveReviewIdentityPolicy({}, { RTB_REVIEW_ENTERPRISE_IDENTITY: "1" } as NodeJS.ProcessEnv),
    ).toEqual({ requireMfa: true, requireEnterpriseSso: false });
  });
});
