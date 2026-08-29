import { describe, expect, it } from "vitest";
import {
  BOS16_PRE_GA_INTERNAL_STAGE_COMPLETE,
  BOS15_BROWSER_PREFLIGHT_RECONCILED,
  BOS_16_BOUNDARY_NOTE,
  BOS_DEDICATED_STAGING_PROJECT_REF,
  BOS_SHARED_HOST_PROJECT_REF,
  BOS_V1_GA_SCOPE_DEFINED,
  BOS_V1_RELEASE_SCOPE,
  CERTIFICATION_MANIFEST_IMPLEMENTED,
  CERTIFICATION_SECOND_STACK_DETECTED,
  PRE_GA_INTERNAL_READINESS_PASS,
  assessBosPreGaReadiness,
  bosBrowserCertificationState,
  bosBrowserE2eCertified,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveXeroCertified,
  bosProductionEligible,
  getBosCertificationManifest,
} from "@rtb/business-os";

describe("BOS-16A9 pre-GA certification ownership", () => {
  it("reuses Business OS + Platform Certification for Core GA while Preview providers stay outstanding", () => {
    const manifest = getBosCertificationManifest();
    const report = assessBosPreGaReadiness();
    expect(CERTIFICATION_MANIFEST_IMPLEMENTED).toBe(true);
    expect(CERTIFICATION_SECOND_STACK_DETECTED).toBe(false);
    expect(manifest.version).toBe("1.0.0");
    expect(manifest.releaseType).toBe("GA");
    expect(manifest.gaPromoted).toBe(true);
    expect(manifest.qualificationSha).toBe("b89e019d0201e4fa1e848391d03ede03756b4f13");
    expect(manifest.capabilityCount).toBe(18);
    expect(manifest.releaseScope.previewIntegrations).toEqual(["xero", "microsoft_365", "hubspot"]);
    expect(manifest.releaseScope.gaCertifiedProviders).toEqual([]);
    expect(manifest.coreGaEligibilityComputed).toBe(true);
    expect(manifest.productionEligible).toBe(true);
    expect(BOS_V1_GA_SCOPE_DEFINED).toBe(true);
    expect(BOS_V1_RELEASE_SCOPE.noVendorHardDependency).toBe(true);
    expect(manifest.rlsCertificationState.state).toBe("pass");
    expect(manifest.browserCertificationState.state).toBe("pass");
    expect(manifest.browserPreflight.evidenceResult).toBe("pass");
    expect(manifest.browserPreflight.certifiedDeclaration).toBe(true);
    expect(manifest.browserPreflight.validPreGaState).toBe(false);
    expect(bosBrowserE2eCertified).toBe(true);
    expect(BOS15_BROWSER_PREFLIGHT_RECONCILED).toBe(true);
    expect(bosBrowserCertificationState({ available: true }).validPreGaState).toBe(false);
    expect(report.xeroLive).toBe("outstanding");
    expect(report.microsoft365Live).toBe("outstanding");
    expect(report.hubspotLive).toBe("outstanding");
    expect(report.ga).toBe("READY");
    expect(bosProductionEligible).toBe(true);
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
