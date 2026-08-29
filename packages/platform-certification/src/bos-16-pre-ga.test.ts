import { describe, expect, it } from "vitest";
import {
  BOS16_PRE_GA_INTERNAL_STAGE_COMPLETE,
  BOS_16_BOUNDARY_NOTE,
  BOS_DEDICATED_STAGING_PROJECT_REF,
  BOS_SHARED_HOST_PROJECT_REF,
  CERTIFICATION_MANIFEST_IMPLEMENTED,
  CERTIFICATION_SECOND_STACK_DETECTED,
  PRE_GA_INTERNAL_READINESS_PASS,
  assessBosPreGaReadiness,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveXeroCertified,
  bosProductionEligible,
  getBosCertificationManifest,
} from "@rtb/business-os";

describe("BOS-16A9 pre-GA certification ownership", () => {
  it("reuses Business OS + Platform Certification and does not declare GA", () => {
    const manifest = getBosCertificationManifest();
    const report = assessBosPreGaReadiness();
    expect(CERTIFICATION_MANIFEST_IMPLEMENTED).toBe(true);
    expect(CERTIFICATION_SECOND_STACK_DETECTED).toBe(false);
    expect(manifest.capabilityCount).toBe(18);
    expect(manifest.rlsCertificationState.state).toBe("pass");
    expect(manifest.browserCertificationState.state).toBe("pass");
    expect(report.xeroLive).toBe("outstanding");
    expect(report.microsoft365Live).toBe("outstanding");
    expect(report.hubspotLive).toBe("outstanding");
    expect(report.ga).toBe("NOT_READY");
    expect(bosProductionEligible).toBe(false);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(PRE_GA_INTERNAL_READINESS_PASS).toBe(true);
    expect(BOS16_PRE_GA_INTERNAL_STAGE_COMPLETE).toBe(true);
    expect(BOS_16_BOUNDARY_NOTE).toContain("Do not start BOS-17");
    expect(JSON.stringify(manifest)).toContain(BOS_DEDICATED_STAGING_PROJECT_REF);
    expect(JSON.stringify(manifest)).not.toContain(BOS_SHARED_HOST_PROJECT_REF);
  });
});
