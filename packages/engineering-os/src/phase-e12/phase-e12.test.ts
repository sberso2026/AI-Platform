import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceV1Intact,
  DigitalTwinV1Intact,
  EngineeringModelInteroperabilityV1Intact,
  EngineeringOSProductBoundaryLocked,
  InspectionIntelligenceV1Intact,
  ProjectControlsV1Intact,
  ProjectIntelligenceV1Intact,
  duplicateAssetOwnershipDetected,
  privateCrossModuleCouplingDetected,
} from "../version";
import {
  assertPhaseE12Invariants,
  getPhaseE12Declaration,
  PhaseE12FixturesNeverLiveCertified,
  PhaseE12IsCertificationNotFeaturePhase,
} from "./contracts";
import { runArchitectureOwnershipAudit } from "./architecture-audit";
import { certifyProductAssertions } from "./assertions";
import { certifyEndToEndAskFlow, certifyEngineeringAuthorityBoundaries } from "./e2e-provenance";
import { buildProfileCertificationMatrix } from "./profile-certification";
import { buildIntegrationMaturityMatrix } from "./integration-maturity";
import {
  certifyEnterpriseScenario,
  certifyFailureModes,
  certifyKgpScenario,
  certifyPerformanceRegression,
  certifySecurityAdversarial,
  certifySmallCompanyEssentialScenario,
  certifyUxProductExperience,
} from "./certification-runners";
import { runE12ProductionCertification } from "./certification-report";

describe("Phase E12 production architecture & product certification", () => {
  it("is certification-not-feature and preserves E0-E11 invariants", () => {
    expect(PhaseE12IsCertificationNotFeaturePhase).toBe(true);
    expect(PhaseE12FixturesNeverLiveCertified).toBe(true);
    expect(getPhaseE12Declaration().assertionIds).toHaveLength(20);
    assertPhaseE12Invariants({
      ProjectIntelligenceV1Intact,
      InspectionIntelligenceV1Intact,
      AssetIntelligenceV1Intact,
      ProjectControlsV1Intact,
      DigitalTwinV1Intact,
      EngineeringModelInteroperabilityV1Intact,
      privateCrossModuleCouplingDetected,
      duplicateAssetOwnershipDetected,
      EngineeringOSProductBoundaryLocked,
    });
  });

  it("architecture ownership audit detects no illegal duplicates", () => {
    const audit = runArchitectureOwnershipAudit();
    expect(audit.passed).toBe(true);
    expect(audit.findings.every((f) => !f.duplicateDetected)).toBe(true);
  });

  it("A1–A20 product assertions all pass", () => {
    const a = certifyProductAssertions();
    expect(a.results).toHaveLength(20);
    expect(a.allPassed).toBe(true);
  });

  it("end-to-end provenance survives Ask→…→memory without hidden CoT", () => {
    const e2e = certifyEndToEndAskFlow();
    expect(e2e.passed).toBe(true);
    expect(e2e.hiddenCot).toBe(false);
    expect(e2e.autoApproved).toBe(false);
    expect(e2e.humanReviewRequired).toBe(true);
    expect(e2e.orphanedAuthoritativeClaim).toBe(false);
    expect(certifyEngineeringAuthorityBoundaries().passed).toBe(true);
  });

  it("profile certification matrix is honest (no false live adapters)", () => {
    const m = buildProfileCertificationMatrix();
    expect(m.passed).toBe(true);
    expect(
      m.rows.find((r) => r.profileId === "ESSENTIAL" && r.capability === "zero_connectors")
        ?.status,
    ).toBe("CERTIFIED");
    expect(
      m.rows.find((r) => r.capability === "optional_connectors")?.status,
    ).toBe("CONTRACT_READY");
  });

  it("integration maturity never promotes fixtures to LIVE_CERTIFIED enterprise", () => {
    const m = buildIntegrationMaturityMatrix();
    expect(m.passed).toBe(true);
    expect(m.rows.find((r) => r.integration.includes("SAP"))?.maturity).toBe("CONTRACT_ONLY");
    expect(m.rows.find((r) => r.integration.includes("Copilot"))?.maturity).toBe(
      "CONTRACT_ONLY",
    );
    expect(m.rows.find((r) => r.integration.includes("Native EOS"))?.maturity).toBe(
      "LIVE_CERTIFIED",
    );
  });

  it("security fail-closed and failure modes do not fabricate", () => {
    expect(certifySecurityAdversarial().allPassed).toBe(true);
    const f = certifyFailureModes();
    expect(f.allPassed).toBe(true);
    expect(f.fabricatedSubstitute).toBe(false);
  });

  it("ESSENTIAL small-company scenario is mandatory pass", () => {
    const s = certifySmallCompanyEssentialScenario();
    expect(s.passed).toBe(true);
    expect(s.connectorsEnabled).toBe(false);
    expect(s.noSapFabricCopilot).toBe(true);
  });

  it("enterprise scenario packaging passes without live SoR claims", () => {
    const e = certifyEnterpriseScenario();
    expect(e.passed).toBe(true);
    expect(e.fixtureNotLiveCertified).toBe(true);
  });

  it("KGP + UX + performance certification", () => {
    expect(certifyKgpScenario().passed).toBe(true);
    expect(certifyUxProductExperience().passed).toBe(true);
    const perf = certifyPerformanceRegression();
    expect(perf.passed).toBe(true);
    expect(perf.disclaimer).toMatch(/not a production SLA/i);
  });

  it("aggregate certification report is release-eligible with limitations", () => {
    const report = runE12ProductionCertification({ e11BaselineCommit: "fc871d4" });
    expect(report.criticalBlockers).toEqual([]);
    expect(report.verdict).toBe("PASS_WITH_LIMITATIONS");
    expect(report.releaseEligible).toBe(true);
    expect(report.knownLimitations.length).toBeGreaterThan(0);
    expect(report.assertions.allPassed).toBe(true);
  });
});
