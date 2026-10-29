import { describe, expect, it } from "vitest";
import {
  PLATFORM_IDENTITY_VERSION,
  PLATFORM_IDENTITY_V1_SEMANTICS,
  PHASE_16C_BASELINE_COMMIT,
} from "./version";
import {
  InternalAdversarialSecurityValidationReady,
  InternalSecurityRegressionSuiteReady,
  KnownCriticalInternalSecurityFindingOpen,
  KnownHighInternalSecurityFindingOpen,
  S07Status,
  S07RequirementWaived,
  ExternalPenTestStillRequiredForTier1,
  ExternalPenTestPerformed,
  IndependentPenTestOpinionIssued,
  knownCrossTenantLeakageDetected,
} from "./internal-adversarial-flags";
import {
  S07ExternalPenTestComplete,
  Tier1EnterpriseProductionReady,
  S08CustomerSsoProductionReady,
} from "./runtime-flags";
import {
  runInternalAdversarialSuite,
  summarizeInternalFindings,
  listOpenCriticalHigh,
} from "./domain/internal-adversarial";

describe("Phase 16C.1 internal adversarial & S07 deferral", () => {
  it("declares internal-adversarial version without closing S07", () => {
    expect(PLATFORM_IDENTITY_VERSION).toBe("0.3.1-internal-adversarial");
    expect(PHASE_16C_BASELINE_COMMIT).toBe(
      "2999b103d35ce600ced3a15f2e39eef146c48236",
    );
    expect(PLATFORM_IDENTITY_V1_SEMANTICS.internalAdversarialNeqExternalPenTest).toBe(
      true,
    );
    expect(InternalAdversarialSecurityValidationReady).toBe(true);
    expect(InternalSecurityRegressionSuiteReady).toBe(true);
    expect(KnownCriticalInternalSecurityFindingOpen).toBe(false);
    expect(KnownHighInternalSecurityFindingOpen).toBe(false);
    expect(S07Status).toBe("DEFERRED_UNTIL_TIER1_COMMERCIALIZATION");
    expect(S07RequirementWaived).toBe(false);
    expect(ExternalPenTestStillRequiredForTier1).toBe(true);
    expect(ExternalPenTestPerformed).toBe(false);
    expect(IndependentPenTestOpinionIssued).toBe(false);
    expect(S07ExternalPenTestComplete).toBe(false);
    expect(Tier1EnterpriseProductionReady).toBe(false);
    expect(S08CustomerSsoProductionReady).toBe(true);
    expect(knownCrossTenantLeakageDetected).toBe(false);
  });

  it("passes adversarial regression suite with zero open critical/high", () => {
    const result = runInternalAdversarialSuite();
    expect(result.substitutesForExternalPenTest).toBe(false);
    expect(result.failed).toEqual([]);
    expect(result.openCriticalHigh).toEqual([]);
    expect(result.passed).toBe(true);
    expect(listOpenCriticalHigh()).toEqual([]);
    expect(summarizeInternalFindings().openCriticalHigh).toBe(0);
    expect(result.cases.length).toBeGreaterThan(20);
  });
});
