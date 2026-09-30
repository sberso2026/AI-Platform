import { describe, expect, it } from "vitest";
import { evaluateReviewIdentityPolicy } from "./identity-policy";
import {
  challengeAfterVerifyDestination,
  mapMfaVerifyError,
  MFA_CHALLENGE_ROUTE,
  MFA_SECURITY_ROUTE,
  MFA_SESSION_UPGRADE_FAILED_MESSAGE,
  payloadContainsMfaSecret,
  postPasswordMfaDestination,
  redactMfaEnrollmentForLog,
  reviewMfaUiStatus,
  safeMfaReturnPath,
  totpQrImageSrc,
  verifiedTotpFactors,
} from "./mfa-ux";

describe("Review MFA UX helpers", () => {
  it("rejects open redirects in the MFA return URL", () => {
    expect(safeMfaReturnPath("https://evil.example")).toBe("/review");
    expect(safeMfaReturnPath("//evil.example")).toBe("/review");
    expect(safeMfaReturnPath("/review/../../../settings")).toBe("/review");
    expect(safeMfaReturnPath("/login?next=https://evil.example")).toBe("/review");
    expect(safeMfaReturnPath("/review/projects/abc")).toBe("/review/projects/abc");
    expect(safeMfaReturnPath("/settings/security")).toBe("/settings/security");
  });

  it("maps enrollment status labels", () => {
    expect(reviewMfaUiStatus({ verifiedTotpCount: 0, currentAal: "aal1", enrollmentInProgress: false })).toBe(
      "Not configured",
    );
    expect(reviewMfaUiStatus({ verifiedTotpCount: 1, currentAal: "aal1", enrollmentInProgress: false })).toBe(
      "Verification required",
    );
    expect(reviewMfaUiStatus({ verifiedTotpCount: 1, currentAal: "aal2", enrollmentInProgress: false })).toBe(
      "Configured",
    );
  });

  it("lets an authenticated AAL1 user start enrollment when no verified factor exists", () => {
    expect(
      postPasswordMfaDestination({
        requireMfa: true,
        currentAal: "aal1",
        verifiedTotpCount: 0,
        nextPath: "/review",
      }),
    ).toBe(`${MFA_SECURITY_ROUTE}?next=${encodeURIComponent("/review")}`);
  });

  it("sends AAL1 users with a verified factor to the challenge route", () => {
    expect(
      postPasswordMfaDestination({
        requireMfa: true,
        currentAal: "aal1",
        verifiedTotpCount: 1,
        nextPath: "/review",
      }),
    ).toBe(`${MFA_CHALLENGE_ROUTE}?next=${encodeURIComponent("/review")}`);
  });

  it("does not treat unverified TOTP factors as satisfying MFA", () => {
    expect(
      verifiedTotpFactors([
        { id: "pending", factor_type: "totp", status: "unverified", friendly_name: "pending" },
      ]),
    ).toEqual([]);
    expect(
      challengeAfterVerifyDestination({ currentAal: "aal1", nextPath: "/review" }),
    ).toEqual({ ok: false, reason: "aal2_required" });
  });

  it("recognizes verified TOTP factors only", () => {
    const factors = verifiedTotpFactors([
      { id: "unverified", factor_type: "totp", status: "unverified", friendly_name: "pending" },
      { id: "ok", factor_type: "totp", status: "verified", friendly_name: "Phone" },
    ]);
    expect(factors).toEqual([{ id: "ok", friendlyName: "Phone", factorType: "totp", status: "verified" }]);
  });

  it("does not treat a requireMfa tenant + AAL1 session as Review-authorized", () => {
    const decision = evaluateReviewIdentityPolicy(
      { requireMfa: true, requireEnterpriseSso: false },
      { aal: "aal1", amr: ["password"] },
    );
    expect(decision.allowed).toBe(false);
  });

  it("allows Review after a valid challenge produces AAL2", () => {
    expect(challengeAfterVerifyDestination({ currentAal: "aal2", nextPath: "/review" })).toEqual({
      ok: true,
      path: "/review",
    });
    expect(
      evaluateReviewIdentityPolicy(
        { requireMfa: true, requireEnterpriseSso: false },
        { aal: "aal2", amr: ["password", "totp"] },
      ).allowed,
    ).toBe(true);
  });

  it("rejects invalid TOTP mapping without echoing the code", () => {
    expect(mapMfaVerifyError("Invalid TOTP code 123456")).toBe(
      "Verification failed. Check the authenticator code and try again.",
    );
    expect(mapMfaVerifyError("Invalid TOTP code 123456")).not.toContain("123456");
    expect(MFA_SESSION_UPGRADE_FAILED_MESSAGE).toBe("Authentication could not be upgraded. Try again.");
    expect(MFA_SESSION_UPGRADE_FAILED_MESSAGE.toLowerCase()).not.toMatch(/token|secret|totp seed/);
  });

  it("does not log TOTP enrollment secrets", () => {
    const redacted = redactMfaEnrollmentForLog({
      id: "factor-1",
      type: "totp",
      totp: { secret: "JBSWY3DPEHPK3PXP", qr_code: "data:image/svg+xml,<svg/>", uri: "otpauth://totp/RTB" },
    });
    expect(redacted).toEqual({ factorId: "factor-1", factorType: "totp" });
    expect(payloadContainsMfaSecret(redacted)).toBe(false);
    expect(payloadContainsMfaSecret({ totp: { secret: "JBSWY3DPEHPK3PXP" } })).toBe(true);
  });

  it("builds a QR image source from a data URI or SVG", () => {
    expect(totpQrImageSrc("data:image/svg+xml;utf8,<svg/>")).toBe("data:image/svg+xml;utf8,<svg/>");
    expect(totpQrImageSrc("<svg xmlns='x'></svg>")?.startsWith("data:image/svg+xml")).toBe(true);
  });
});
