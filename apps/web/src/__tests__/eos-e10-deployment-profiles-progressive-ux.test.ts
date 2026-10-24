/**
 * Phase E10 smoke — deployment profiles + progressive UX (no enterprise hard deps).
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE10DeploymentProfilesComplete,
  PhaseE10ProfileIsNotAuthorization,
  PhaseE10EssentialZeroConnectorIndependent,
  createProfileSeedTenants,
  getPhaseE10Declaration,
  phaseE10Ready,
  resolveCapabilityVisibility,
} from "@rtb/engineering-os";
import {
  DEFAULT_ENGINEERING_DEPLOYMENT_PROFILE,
  resolveExperienceUxDensity,
  resolveVisiblePrimaryNavIds,
} from "../lib/engineering/experience-surfaces";

describe("eos-e10-deployment-profiles-progressive-ux", () => {
  it("exports E10 readiness and profile ≠ authorization", () => {
    expect(phaseE10Ready).toBe(true);
    expect(PhaseE10DeploymentProfilesComplete).toBe(true);
    expect(PhaseE10ProfileIsNotAuthorization).toBe(true);
    expect(PhaseE10EssentialZeroConnectorIndependent).toBe(true);
    expect(getPhaseE10Declaration().profileIsAuthorization).toBe(false);
    expect(getPhaseE10Declaration().providerHardDependenciesForbidden).toContain(
      "Microsoft Copilot",
    );
  });

  it("web nav adapts by profile density without dead tabs", () => {
    expect(DEFAULT_ENGINEERING_DEPLOYMENT_PROFILE).toBe("ESSENTIAL");
    expect(resolveExperienceUxDensity("ESSENTIAL")).toBe("MINIMAL");
    const essential = resolveVisiblePrimaryNavIds({
      productEntitled: true,
      entitledFeatureKeys: ["ai_assistant"],
      profileId: "ESSENTIAL",
    });
    expect(essential).toEqual(["eng-home", "eng-ask", "eng-my", "eng-explore"]);
    const enterprise = resolveVisiblePrimaryNavIds({
      productEntitled: true,
      entitledFeatureKeys: ["ai_assistant"],
      profileId: "ENTERPRISE",
    });
    expect(enterprise).toContain("eng-intelligence");
  });

  it("seed tenants isolate capabilities across profiles", () => {
    const seeds = createProfileSeedTenants();
    const small = seeds.find((s) => s.profileId === "ESSENTIAL")!;
    const mid = seeds.find((s) => s.profileId === "PROFESSIONAL")!;
    expect(small.connectorsEnabled).toBe(false);
    expect(small.visibleNavIds).not.toContain("eng-intelligence");
    expect(mid.visibleNavIds).toContain("eng-intelligence");
    expect(
      resolveCapabilityVisibility({
        profileId: "ESSENTIAL",
        capabilityKey: "enterprise_connectors",
        audience: "engineer",
        entitledKeys: ["engineering-os", "enterprise_connectors"],
      }).visible,
    ).toBe(false);
  });
});
