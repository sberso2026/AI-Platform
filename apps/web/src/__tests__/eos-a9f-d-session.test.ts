import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { decideEngineeringIdentityAssurance } from "../lib/commerce/engineering-identity-assurance";
import { toSafeIdentityAssurance } from "../lib/supabase/safe-identity-assurance";
import { mfaUpgradeConfirmed, type SafeMfaVerifyObservation } from "../lib/supabase/persist-mfa-session";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

const MFA_POLICY = { requireMfa: true, requireEnterpriseSso: false };

describe("EOS-A9F-D AAL2 session upgrade", () => {
  it("returns only the approved identity-assurance contract", () => {
    const body = toSafeIdentityAssurance({
      userPresent: true,
      currentLevel: "aal2",
      nextLevel: "aal2",
      verifiedFactors: 1,
    });
    expect(body).toEqual({
      authenticated: true,
      currentLevel: "aal2",
      nextLevel: "aal2",
      aal: "aal2",
      verifiedFactors: 1,
    });
    expect(Object.keys(body).sort()).toEqual(
      ["aal", "authenticated", "currentLevel", "nextLevel", "verifiedFactors"].sort(),
    );
    expect(JSON.stringify(body)).not.toMatch(/access_token|refresh_token|cookie|totp|secret|authorization/i);
  });

  it("does not invent AAL2 for unauthenticated callers", () => {
    expect(
      toSafeIdentityAssurance({
        userPresent: false,
        currentLevel: "aal2",
        nextLevel: "aal2",
        verifiedFactors: 9,
      }),
    ).toEqual({
      authenticated: false,
      currentLevel: null,
      nextLevel: null,
      aal: null,
      verifiedFactors: 0,
    });
  });

  it("does not treat verify success without aal2 as an upgraded session", () => {
    const aal1: SafeMfaVerifyObservation = {
      verifySucceeded: true,
      errorCode: null,
      sessionPresent: true,
      userPresent: true,
      currentLevel: "aal1",
      nextLevel: "aal2",
    };
    const aal2: SafeMfaVerifyObservation = {
      ...aal1,
      currentLevel: "aal2",
      nextLevel: "aal2",
    };
    expect(mfaUpgradeConfirmed(aal1)).toBe(false);
    expect(mfaUpgradeConfirmed(aal2)).toBe(true);
    expect(mfaUpgradeConfirmed({ ...aal2, sessionPresent: false })).toBe(false);
  });

  it("persists the verify session on the same browser Auth client before redirect", () => {
    const mfa = readApp("src/app/(auth)/login/mfa/page.tsx");
    const persist = readApp("src/lib/supabase/persist-mfa-session.ts");
    expect(persist).toContain("setSession");
    expect(persist).toContain("getSession");
    expect(persist).toContain("getAuthenticatorAssuranceLevel");
    expect(persist).not.toMatch(/console\.(log|info|debug|warn)\(/);
    expect(persist).not.toMatch(/JSON\.stringify\((session|verify|observation)/);
    expect(mfa).toContain("persistVerifiedMfaSession");
    expect(mfa).toContain("mfaUpgradeConfirmed");
    expect(mfa).toContain("MFA_SESSION_UPGRADE_FAILED_MESSAGE");
    expect(mfa).toContain("verifiedTotpFactors");
    expect(mfa).toContain("auth.mfa.challenge");
    expect(mfa).toContain("auth.mfa.verify");
    expect(mfa).toContain("router.replace");
    expect(mfa.indexOf("mfaUpgradeConfirmed")).toBeLessThan(mfa.indexOf("router.replace"));
    expect(mfa).not.toMatch(/console\.(log|info|debug|warn)\(/);
    expect(mfa).not.toMatch(/hardcoded.?aal2|skipMfa|fake.?totp|cert-user bypass|localhost bypass/i);
  });

  it("identity-assurance is request-scoped and returns currentLevel/nextLevel without secrets", () => {
    const route = readApp("src/app/api/platform/identity-assurance/route.ts");
    expect(route).toContain("createClient");
    expect(route).toContain("getSession");
    expect(route).toContain("getUser");
    expect(route).toContain("getAuthenticatorAssuranceLevel");
    expect(route).toContain("toSafeIdentityAssurance");
    expect(route).toContain("currentLevel");
    expect(route).toContain("nextLevel");
    expect(route).not.toMatch(/access_token|refresh_token|totp\.secret|cookie contents/i);
    expect(route).not.toMatch(/console\.(log|info|debug|warn)\(/);
    expect(route).not.toMatch(/globalThis|cachedClient|createAdminClient/);
  });

  it("denies AAL1 mutations, allows AAL2 past identity assurance, and still requires authorization elsewhere", () => {
    const aal1 = decideEngineeringIdentityAssurance({
      segment: "deliverables",
      method: "POST",
      policy: MFA_POLICY,
      claims: { aal: "aal1", amr: ["password"] },
    });
    const aal2 = decideEngineeringIdentityAssurance({
      segment: "deliverables",
      method: "POST",
      policy: MFA_POLICY,
      claims: { aal: "aal2", amr: ["password", "totp"] },
    });
    const unauthenticated = decideEngineeringIdentityAssurance({
      segment: "deliverables",
      method: "POST",
      policy: MFA_POLICY,
      claims: { aal: null, amr: [] },
    });
    expect(aal1).toMatchObject({ gated: true, allowed: false, reason: "mfa_required" });
    expect(aal2).toMatchObject({ gated: true, allowed: true, reason: "mfa_verified" });
    expect(unauthenticated.allowed).toBe(false);
    const persist = readApp("src/lib/supabase/persist-mfa-session.ts");
    expect(persist).toContain("currentLevel === \"aal2\"");
    expect(persist).not.toContain('currentLevel = "aal2"');
  });

  it("contains no MFA bypass in A9F-D identity and MFA files", () => {
    for (const rel of [
      "src/app/(auth)/login/mfa/page.tsx",
      "src/lib/supabase/persist-mfa-session.ts",
      "src/lib/supabase/safe-identity-assurance.ts",
      "src/app/api/platform/identity-assurance/route.ts",
      "src/hooks/use-identity-assurance.ts",
      "src/components/engineering/identity-assurance-readout.tsx",
    ]) {
      const body = readApp(rel);
      expect(body, rel).not.toMatch(/mfa.?bypass|skipMfa|DISABLE_MFA|fakeJwt|hardcoded.?aal2|localhost.?bypass|fake.?totp/i);
      expect(body, rel).not.toMatch(/requireMfa\s*=\s*false/);
    }
  });
});
