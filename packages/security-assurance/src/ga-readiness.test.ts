import { describe, expect, it } from "vitest";
import {
  phase15IReady,
  securityAssuranceV1GaCertified,
  securityAssuranceV1GaReady,
  SecurityAssuranceGaReadinessAssessmentComplete,
  SecurityAssurancePublicContractsFrozenAt1_0_0,
  getSecurityAssuranceGaReadinessDeclaration,
} from "./ga-readiness-flags";
import { createSecurityAssuranceGaReadinessAssessment } from "./domain/ga-readiness/assessment";
import { summarizeGaGaps } from "./domain/ga-readiness/gap-register";
import { countMaturityByClass } from "./domain/ga-readiness/maturity-matrix";
import {
  SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_VERSION,
  PHASE_15G_BASELINE_COMMIT,
  PHASE_15G_BASELINE_HOSTED_RUN,
} from "./version";
import {
  S07ExternalPenTestComplete,
  S08CustomerSsoProductionReady,
} from "./customer-assurance-flags";
import { CustomerTrustCenterImplemented } from "./discovery-flags";

describe("Phase 15H Security & Assurance V1 GA Readiness", () => {
  it("declares 0.8.0-ga-readiness on Phase 15G baseline", () => {
    expect(SECURITY_ASSURANCE_VERSION).toBe("0.8.0-ga-readiness");
    expect(SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION).toBe("0.8.0-ga-readiness");
    expect(PHASE_15G_BASELINE_COMMIT).toBe(
      "a7b309fbb556ed96f03a8e1c206955e54d90f1b2",
    );
    expect(PHASE_15G_BASELINE_HOSTED_RUN).toBe("31307150624");
  });

  it("completes assessment without freezing 1.0.0 or declaring GA certified", () => {
    expect(SecurityAssuranceGaReadinessAssessmentComplete).toBe(true);
    expect(SecurityAssurancePublicContractsFrozenAt1_0_0).toBe(false);
    expect(securityAssuranceV1GaCertified).toBe(false);
  });

  it("classifies all gaps with zero UNKNOWN and zero open GA blockers", () => {
    const summary = summarizeGaGaps();
    expect(summary.unknownClassifications).toBe(0);
    expect(summary.openBlockers).toBe(0);
    expect(summary.openRequiredBeforeGa).toBe(0);
    expect(summary.securityAssuranceV1GaReady).toBe(true);
    expect(securityAssuranceV1GaReady).toBe(true);
    expect(phase15IReady).toBe(true);
  });

  it("keeps S07/S08 and Trust Center truthful for Tier-1 distinction", () => {
    expect(S07ExternalPenTestComplete).toBe(false);
    expect(S08CustomerSsoProductionReady).toBe(false);
    expect(CustomerTrustCenterImplemented).toBe(false);
    const a = createSecurityAssuranceGaReadinessAssessment();
    expect(a.decide().subsystemReadyDistinctFromTier1Production).toBe(true);
    expect(a.backupRestoreTruth().rpo).toBe("DEFINED_NOT_TESTED");
    expect(a.backupRestoreTruth().rto).toBe("MEASURED");
    expect(a.backupRestoreTruth().slaClaimed).toBe(false);
  });

  it("preserves architecture chain and must-never-own boundary", () => {
    const a = createSecurityAssuranceGaReadinessAssessment();
    expect(a.architectureChain()).toContain("Customer Assurance");
    expect(a.mustNeverOwn()).toContain("SIEM");
    expect(a.ownershipUnknownCount()).toBe(0);
    expect(a.gaReadinessMigrationRequired).toBe(false);
    expect(a.migrationLineage()).toHaveLength(6);
  });

  it("records maturity and performance baselines", () => {
    const counts = countMaturityByClass();
    expect(counts.GA_READY).toBeGreaterThan(0);
    expect(counts.INTENTIONALLY_UNAVAILABLE).toBeGreaterThan(0);
    const a = createSecurityAssuranceGaReadinessAssessment();
    const b = a.measurePerformanceBaselines();
    expect(b.controlLookupMs).toBeLessThan(500);
    expect(a.frameworkClaimSafety().iso27001CertifiedClaimed).toBe(false);
  });

  it("declares required anti-automation and anti-duplication flags", () => {
    const d = getSecurityAssuranceGaReadinessDeclaration();
    expect(d.automaticCertificationEnabled).toBe(false);
    expect(d.automaticRemediationEnabled).toBe(false);
    expect(d.duplicatePolicyEngineDetected).toBe(false);
    expect(d.duplicateAssuranceStackDetected).toBe(false);
    expect(d.EngineeringOSV1Intact).toBe(true);
  });
});
