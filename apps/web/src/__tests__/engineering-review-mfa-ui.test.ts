import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { sanitizeAuditMetadata } from "@rtb/engineering-review";
import { evaluateReviewIdentityPolicy } from "@rtb/engineering-review";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("ERA-7A MFA enrollment and challenge UI", () => {
  it("keeps the security page authenticated-only via middleware", () => {
    const middleware = readApp("src/middleware.ts");
    expect(middleware).toContain('pathname = "/login"');
    expect(middleware).not.toMatch(/isPublicRoute[^\n]*settings\/security/);
    expect(middleware).toContain('if (!user && !isPublicRoute && !isApiRoute)');
  });

  it("exposes enrollment and challenge routes using Supabase MFA APIs", () => {
    const security = readApp("src/app/(platform)/settings/security/page.tsx");
    const challenge = readApp("src/app/(auth)/login/mfa/page.tsx");
    expect(security).toContain("auth.mfa.enroll");
    expect(security).toContain('factorType: "totp"');
    expect(security).toContain("Set up authenticator");
    expect(challenge).toContain("Additional verification is required.");
    expect(challenge).toContain("auth.mfa.challenge");
    expect(challenge).toContain("auth.mfa.verify");
    expect(challenge).toContain("persistVerifiedMfaSession");
    expect(challenge).not.toContain("speakeasy");
    expect(security).not.toContain("otplib");
  });

  it("does not log or audit TOTP secrets", () => {
    const security = readApp("src/app/(platform)/settings/security/page.tsx");
    const challenge = readApp("src/app/(auth)/login/mfa/page.tsx");
    expect(security).toContain("redactMfaEnrollmentForLog");
    expect(security).not.toMatch(/console\.(log|info|debug|warn)\([^)]*secret/);
    expect(challenge).not.toMatch(/console\.(log|info|debug|warn)/);
    expect(sanitizeAuditMetadata({ totpSecret: "JBSWY3DPEHPK3PXP", factorId: "abc" })).toEqual({
      factorId: "abc",
    });
  });

  it("does not let MFA UI replace Review server enforcement or RLS", () => {
    const guard = readApp("src/lib/review/with-review-api.ts");
    const runtime = readApp("src/lib/review/runtime.ts");
    const middleware = readApp("src/middleware.ts");
    expect(guard).toContain("evaluateReviewIdentityPolicy");
    expect(guard).toContain("identity_assurance_insufficient");
    expect(runtime).toContain(".eq(\"workspace_id\", actor.workspaceId)");
    expect(middleware).toContain("evaluateReviewIdentityPolicy");
    expect(middleware).toContain("resolveRequestActorContext");
    expect(middleware).toContain("MFA_CHALLENGE_ROUTE");
    const aal1 = evaluateReviewIdentityPolicy(
      { requireMfa: true, requireEnterpriseSso: false },
      { aal: "aal1", amr: ["password"] },
    );
    const aal2 = evaluateReviewIdentityPolicy(
      { requireMfa: true, requireEnterpriseSso: false },
      { aal: "aal2", amr: ["password", "totp"] },
    );
    const wrongTenant = evaluateReviewIdentityPolicy(
      { requireMfa: true, requireEnterpriseSso: false },
      { aal: "aal1", amr: ["password"] },
    );
    expect(aal1.allowed).toBe(false);
    expect(aal2.allowed).toBe(true);
    expect(wrongTenant.allowed).toBe(false);
  });

  it("keeps MFA client pages free of service-role material", () => {
    for (const file of [
      "src/app/(platform)/settings/security/page.tsx",
      "src/app/(auth)/login/mfa/page.tsx",
      "src/app/(auth)/login/page.tsx",
    ]) {
      const body = readApp(file);
      expect(body, file).not.toMatch(/SERVICE_ROLE|createServiceClient|encryptPlaceholder/);
    }
  });
});
