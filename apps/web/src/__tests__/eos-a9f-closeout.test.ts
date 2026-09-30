import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  decideEngineeringIdentityAssurance,
} from "../lib/commerce/engineering-identity-assurance";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

const MFA_POLICY = { requireMfa: true, requireEnterpriseSso: false };
const AAL2 = { aal: "aal2", amr: ["password", "totp"] };

describe("EOS-A9F AAL2 closeout invariants", () => {
  it("does not treat AAL2 as Engineering authorization", () => {
    const identity = decideEngineeringIdentityAssurance({
      segment: "deliverables",
      method: "POST",
      policy: MFA_POLICY,
      claims: AAL2,
    });
    expect(identity.allowed).toBe(true);
    expect(identity.reason).toBe("mfa_verified");
    const access = readApp("src/lib/commerce/canonical-access.ts");
    expect(access).toContain('return roleSlug === "viewer"');
    const guard = readApp("src/lib/commerce/engineering-api.ts");
    expect(guard).toContain("isReadOnlyEngineeringRole");
    expect(guard).toContain("denyIfEngineeringIdentityInsufficient");
  });

  it("contains no MFA/AAL2 bypass in A9E identity paths", () => {
    for (const rel of [
      "src/lib/commerce/engineering-identity-assurance.ts",
      "src/lib/commerce/engineering-api.ts",
      "src/middleware.ts",
      "src/app/(platform)/engineering/settings/page.tsx",
    ]) {
      const body = readApp(rel);
      expect(body, rel).not.toMatch(/mfa.?bypass|skipMfa|DISABLE_MFA|fakeJwt|hardcoded.?aal2|localhost.?bypass|cert-er-a1/i);
      expect(body, rel).not.toMatch(/requireMfa\s*=\s*false/);
    }
  });

  it("keeps Engineering settings internal navigation on Next Link", () => {
    const src = readApp("src/app/(platform)/engineering/settings/page.tsx");
    expect(src).toContain('import Link from "next/link"');
    expect(src).not.toMatch(/<a[^>]+href="\/engineering\/settings\//);
    expect(src).toContain('href="/engineering/settings/deliverables"');
    expect(src).toContain('href="/engineering/settings/lifecycle"');
  });
});
