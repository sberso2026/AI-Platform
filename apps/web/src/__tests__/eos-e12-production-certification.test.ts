/**
 * Phase E12 smoke — production certification gates.
 */
import { describe, expect, it } from "vitest";
import {
  PhaseE12FixturesNeverLiveCertified,
  PhaseE12IsCertificationNotFeaturePhase,
  phaseE12Ready,
  runE12ProductionCertification,
} from "@rtb/engineering-os";

describe("eos-e12-production-certification", () => {
  it("exports E12 readiness and release-eligible certification report", () => {
    expect(phaseE12Ready).toBe(true);
    expect(PhaseE12IsCertificationNotFeaturePhase).toBe(true);
    expect(PhaseE12FixturesNeverLiveCertified).toBe(true);
    const report = runE12ProductionCertification({ e11BaselineCommit: "fc871d4" });
    expect(report.verdict).toBe("PASS_WITH_LIMITATIONS");
    expect(report.releaseEligible).toBe(true);
    expect(report.criticalBlockers).toEqual([]);
    expect(report.assertions.allPassed).toBe(true);
    expect(report.smallCompany.passed).toBe(true);
    expect(
      report.integrations.rows.some(
        (r) => r.integration.includes("SAP") && r.maturity === "LIVE_CERTIFIED",
      ),
    ).toBe(false);
  });
});
