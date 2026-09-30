import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateReviewIdentityPolicy } from "@rtb/engineering-review";
import {
  decideEngineeringIdentityAssurance,
  engineeringApiRequiresIdentityAssurance,
} from "../lib/commerce/engineering-identity-assurance";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

const MFA_POLICY = { requireMfa: true, requireEnterpriseSso: false };
const AAL1 = { aal: "aal1", amr: ["password"] };
const AAL2 = { aal: "aal2", amr: ["password", "totp"] };

describe("EOS-A9E Deliverables/Lifecycle AAL2 server enforcement", () => {
  it("gates deliverables and lifecycle on all methods, and settings mutations only", () => {
    expect(engineeringApiRequiresIdentityAssurance("deliverables", "GET")).toBe(true);
    expect(engineeringApiRequiresIdentityAssurance("deliverables", "POST")).toBe(true);
    expect(engineeringApiRequiresIdentityAssurance("lifecycle", "GET")).toBe(true);
    expect(engineeringApiRequiresIdentityAssurance("lifecycle", "POST")).toBe(true);
    expect(engineeringApiRequiresIdentityAssurance("settings", "GET")).toBe(false);
    expect(engineeringApiRequiresIdentityAssurance("settings", "POST")).toBe(true);
    expect(engineeringApiRequiresIdentityAssurance("documents", "POST")).toBe(false);
  });

  it("rejects AAL1 and allows AAL2 when tenant requireMfa is true", () => {
    const aal1 = decideEngineeringIdentityAssurance({
      segment: "deliverables",
      method: "POST",
      policy: MFA_POLICY,
      claims: AAL1,
    });
    const aal2 = decideEngineeringIdentityAssurance({
      segment: "deliverables",
      method: "POST",
      policy: MFA_POLICY,
      claims: AAL2,
    });
    const ungated = decideEngineeringIdentityAssurance({
      segment: "documents",
      method: "POST",
      policy: MFA_POLICY,
      claims: AAL1,
    });
    expect(aal1).toMatchObject({ gated: true, allowed: false, reason: "mfa_required" });
    expect(aal2).toMatchObject({ gated: true, allowed: true, reason: "mfa_verified" });
    expect(ungated).toMatchObject({ gated: false, allowed: true });
    expect(evaluateReviewIdentityPolicy(MFA_POLICY, AAL1).allowed).toBe(false);
    expect(evaluateReviewIdentityPolicy(MFA_POLICY, AAL2).allowed).toBe(true);
  });

  it("wires identity_assurance_insufficient into the engineering API guard", () => {
    const src = readApp("src/lib/commerce/engineering-api.ts");
    const policy = readApp("src/lib/commerce/engineering-identity-assurance.ts");
    expect(policy).toContain("evaluateReviewIdentityPolicy");
    expect(src).toContain("decideEngineeringIdentityAssurance");
    expect(src).toContain("identity_assurance_insufficient");
    expect(src).toContain("denyIfEngineeringIdentityInsufficient");
    expect(src).not.toMatch(/requireMfa\s*=\s*false/);
    expect(policy).not.toMatch(/requireMfa\s*=\s*false/);
  });

  it("AAL2-gates Deliverables and Lifecycle UI paths in middleware", () => {
    const middleware = readApp("src/middleware.ts");
    expect(middleware).toContain("isDeliverableLifecycleAal2Path");
    expect(middleware).toContain("/engineering/deliverables");
    expect(middleware).toContain("/engineering/lifecycle");
    expect(middleware).toContain("/engineering/settings/deliverables");
    expect(middleware).toContain("evaluateReviewIdentityPolicy");
    expect(middleware).toContain("MFA_CHALLENGE_ROUTE");
  });
});
