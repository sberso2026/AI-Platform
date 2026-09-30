import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = resolve(__dirname, "../../");

function readApp(rel: string) {
  return readFileSync(resolve(WEB_ROOT, rel), "utf8");
}

describe("EOS-A9F-C live AAL2 browser UX closeout", () => {
  it("exposes a safe identity-assurance readout without tokens or TOTP", () => {
    const route = readApp("src/app/api/platform/identity-assurance/route.ts");
    expect(route).toContain("getAuthenticatorAssuranceLevel");
    expect(route).toContain("verifiedFactors");
    expect(route).toContain("authenticated: true");
    expect(route).not.toMatch(/access_token|refresh_token|totp\.secret|cookie contents/i);
    expect(route).not.toMatch(/console\.(log|info|debug|warn)\(/);
  });

  it("uses shared authorized project context instead of raw project-id mutation fields", () => {
    const deliverables = readApp("src/components/engineering/deliverable-workspace.tsx");
    const lifecycle = readApp("src/components/engineering/lifecycle-workspace.tsx");
    const settings = readApp("src/app/(platform)/engineering/settings/deliverables/page.tsx");
    for (const src of [deliverables, lifecycle, settings]) {
      expect(src).toContain("EngineeringProjectContextBar");
      expect(src).toContain("useResolvedEngineeringProjectId");
      expect(src).not.toMatch(/Project id/);
      expect(src).not.toContain("proj-crusher-feed");
    }
  });

  it("gives Deliverables an empty-state next action and keeps templates non-authoritative", () => {
    const deliverables = readApp("src/components/engineering/deliverable-workspace.tsx");
    expect(deliverables).toContain("Browse Templates");
    expect(deliverables).toContain("setView(\"templates\")");
    expect(deliverables).not.toMatch(/auto-adopt|autoAdopt/);
  });

  it("visibly disables Lifecycle human controls when no assignment exists", () => {
    const lifecycle = readApp("src/components/engineering/lifecycle-workspace.tsx");
    expect(lifecycle).toContain("lifecycleControlState");
    expect(lifecycle).toContain("disabled={!controls.decisionEnabled}");
    expect(lifecycle).toContain("disabled={!controls.transitionEnabled}");
    expect(lifecycle).toContain("disabled={!controls.targetEditable");
    expect(lifecycle).toContain("Assign Lifecycle Profile");
  });

  it("contains no MFA/AAL2 bypass in A9F-C identity paths", () => {
    for (const rel of [
      "src/app/api/platform/identity-assurance/route.ts",
      "src/lib/engineering/lifecycle-control-state.ts",
      "src/components/engineering/deliverable-workspace.tsx",
      "src/components/engineering/lifecycle-workspace.tsx",
      "src/app/(platform)/engineering/settings/deliverables/page.tsx",
    ]) {
      const body = readApp(rel);
      expect(body, rel).not.toMatch(/mfa.?bypass|skipMfa|DISABLE_MFA|fakeJwt|hardcoded.?aal2|localhost.?bypass/i);
      expect(body, rel).not.toMatch(/requireMfa\s*=\s*false/);
    }
  });
});
