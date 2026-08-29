import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearBosCertificationEnv, stubBosStagingTargetOnly, stubBosBrowserE2eAvailable } from "./certification-env-harness";
import { BUSINESS_CAPABILITY_IDS } from "@rtb/types";
import { createPlatformKernel } from "@rtb/platform-kernel";
import {
  BOS15A_STATUS,
  BOS15B_STATUS,
  BOS15C_STATUS,
  BOS15D_STATUS,
  BOS15E_STATUS,
  BOS15F_STATUS,
  BOS15_PROVIDER_STATUS,
  BOS_14_CERTIFIED_SHA,
  BOS_15_BOUNDARY_NOTE,
  BOS_15_BROWSER_ROUTES,
  BOS_15_VERDICT,
  BOS_CONNECTOR_CERTIFICATION,
  BOS_LIVE_RLS_REPRESENTATIVE_TABLES,
  BOS_PRODUCTION_GA_REMAINING_GATES,
  BOS_RELEASE_INDICATORS,
  BROWSER_E2E_STATUS,
  BUSINESS_OS_PHASE,
  BUSINESS_OS_VERSION,
  LIVE_RLS_STATUS,
  bos15EnvironmentPreflight,
  bosBrowserE2eCertified,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveRlsCertified,
  bosLiveXeroCertified,
  bosProductionEligible,
  bosReleaseCandidate,
  browserE2eEnvironmentAvailable,
  createBusinessOS,
  defaultBusinessCapabilityRegistry,
  getBosReleaseDeclaration,
  liveProviderCredentialsAvailable,
  liveRlsEnvironmentAvailable,
} from "./index";

beforeEach(() => {
  clearBosCertificationEnv();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("BOS-15 live GA certification honesty", () => {
  it("preserves the BOS-14 baseline and refuses GA without executed live gates", () => {
    expect(BUSINESS_OS_VERSION).toBe("0.13.3");
    expect(BUSINESS_OS_PHASE).toBe("BOS-15");
    expect(BOS_15_VERDICT).toBe("PASS_WITH_LIMITATIONS");
    expect(BOS_15_BOUNDARY_NOTE).toContain("Do not implement new BOS modules");
    expect(BOS_14_CERTIFIED_SHA).toBe("1a52a8fedf065756ce78d1021e2a3bfda1546ea8");
    expect(defaultBusinessCapabilityRegistry.ids()).toHaveLength(18);
    expect([...defaultBusinessCapabilityRegistry.ids()]).toEqual([...BUSINESS_CAPABILITY_IDS]);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-15");
    expect(bos.capabilities.list()).toHaveLength(18);
    expect(bosReleaseCandidate).toBe(true);
    expect(bosProductionEligible).toBe(false);
    expect(bosLiveRlsCertified).toBe(false);
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(bosBrowserE2eCertified).toBe(false);
    expect(BOS_RELEASE_INDICATORS["bos.releaseCandidate"]).toBe(true);
    expect(BOS_RELEASE_INDICATORS["bos.productionEligible"]).toBe(false);
    expect(BOS_RELEASE_INDICATORS.implementsOwnAiStack).toBe(false);
    expect(BOS_RELEASE_INDICATORS.duplicateIntegrationStackDetected).toBe(false);
    expect(BOS_RELEASE_INDICATORS.duplicateAgentRuntimeDetected).toBe(false);
    expect(BOS_RELEASE_INDICATORS.duplicateKnowledgeGraphDetected).toBe(false);
    expect(BOS_RELEASE_INDICATORS.ExternalWritesDisabled).toBe(true);
    expect(BOS_RELEASE_INDICATORS.NoVendorHardDependency).toBe(true);
    expect(BOS_RELEASE_INDICATORS.NoAutonomousApproval).toBe(true);
    expect(BOS_RELEASE_INDICATORS.directAgentProviderAccess).toBe(false);
    expect(BOS_RELEASE_INDICATORS.unrestrictedGraphAccess).toBe(false);
    expect(BOS_RELEASE_INDICATORS.canonicalDomainMutationBypass).toBe(false);
    expect(BOS_RELEASE_INDICATORS.crossTenantConnectorAccess).toBe(false);
    expect(BOS_RELEASE_INDICATORS.crossTenantAgentAccess).toBe(false);
    expect(BOS_RELEASE_INDICATORS.suppressedIdentityReconstructionBlocked).toBe(true);
    expect(getBosReleaseDeclaration().productionGaReady).toBe(false);
    expect(getBosReleaseDeclaration().verdict).toBe("PASS_WITH_LIMITATIONS");
    expect(getBosReleaseDeclaration().bos14CertifiedSha).toBe(BOS_14_CERTIFIED_SHA);
  });
});

describe("BOS-15A environment preflight", () => {
  it("reports present/missing only and does not treat missing env as a live pass", () => {
    const preflight = bos15EnvironmentPreflight();
    expect(preflight.identity.cursorEnvironment).toBe("unlinked");
    expect(preflight.identity.bos14CertifiedSha).toBe("1a52a8fedf065756ce78d1021e2a3bfda1546ea8");
    expect(BOS15A_STATUS).toBe("BOS15A_PREFLIGHT_COMPLETE");
    expect(preflight.supabase.executed).toBe(false);
    const liveRlsReady = liveRlsEnvironmentAvailable();
    if (!liveRlsReady) {
      expect(preflight.supabase.available).toBe(false);
      expect(preflight.supabase.classification).toBe("BLOCKED_ENV");
      for (const value of Object.values(preflight.supabase.refs)) {
        expect(value).toBe("missing");
      }
    } else {
      expect(preflight.supabase.available).toBe(true);
    }
    expect(preflight.xero.available).toBe(false);
    expect(preflight.xero.executed).toBe(false);
    expect(preflight.xero.classification).toBe("BLOCKED_ENV");
    expect(preflight.xero.readiness.connectorImplemented).toBe(true);
    expect(preflight.xero.readiness.securityArchitectureReady).toBe(true);
    expect(preflight.xero.readiness.liveCredentialsAvailable).toBe(false);
    expect(preflight.xero.readiness.liveCertificationExecuted).toBe(false);
    expect(preflight.microsoft365.available).toBe(false);
    expect(preflight.microsoft365.executed).toBe(false);
    expect(preflight.microsoft365.classification).toBe("BLOCKED_ENV");
    expect(preflight.microsoft365.readiness.connectorImplemented).toBe(true);
    expect(preflight.microsoft365.readiness.securityArchitectureReady).toBe(true);
    expect(preflight.microsoft365.readiness.liveCredentialsAvailable).toBe(false);
    expect(preflight.microsoft365.readiness.liveCertificationExecuted).toBe(false);
    expect(preflight.hubspot.available).toBe(false);
    expect(preflight.hubspot.executed).toBe(false);
    expect(preflight.hubspot.classification).toBe("BLOCKED_ENV");
    expect(preflight.hubspot.readiness.connectorImplemented).toBe(true);
    expect(preflight.hubspot.readiness.securityArchitectureReady).toBe(true);
    expect(preflight.hubspot.readiness.liveCredentialsAvailable).toBe(false);
    expect(preflight.hubspot.readiness.liveCertificationExecuted).toBe(false);
    expect(preflight.browser.available).toBe(false);
    expect(preflight.browser.executed).toBe(false);
    expect(preflight.browser.classification).toBe("BLOCKED_ENV");
    expect(preflight.browser.executionMode).toBe("browser");
    expect(preflight.browser.evidenceResult).toBe("pass");
    expect(preflight.browser.certifiedDeclaration).toBe(false);
    for (const value of Object.values(preflight.xero.refs)) {
      expect(value).toBe("missing");
    }
    for (const value of Object.values(preflight.microsoft365.refs)) {
      expect(value).toBe("missing");
    }
    for (const value of Object.values(preflight.hubspot.refs)) {
      expect(value).toBe("missing");
    }
    for (const value of Object.values(preflight.browser.refs)) {
      expect(value).toBe("missing");
    }
    expect(JSON.stringify(preflight)).not.toMatch(/eyJ|sk-|secret-|Bearer /i);
  });
});

describe("BOS-15A staging-target-only preflight", () => {
  it("reports staging refs present without treating them as live RLS", () => {
    stubBosStagingTargetOnly();
    const preflight = bos15EnvironmentPreflight();
    expect(liveRlsEnvironmentAvailable()).toBe(false);
    expect(preflight.supabase.available).toBe(false);
    expect(preflight.supabase.classification).toBe("BLOCKED_ENV");
    expect(preflight.supabase.executed).toBe(false);
    expect(preflight.supabase.refs.BOS_STAGING_PROJECT_REF).toBe("present");
    expect(preflight.supabase.refs.SUPABASE_TEST_URL).toBe("present");
    expect(preflight.supabase.refs.tenantAJwt).toBe("missing");
    expect(bosLiveRlsCertified).toBe(false);
    expect(bosProductionEligible).toBe(false);
    expect(BOS15B_STATUS).toBe("BOS15B_BLOCKED_LIVE_RLS_ENV");
  });
});

describe("BOS-15B live RLS", () => {
  it("returns BOS15B_BLOCKED_LIVE_RLS_ENV when JWTs and test DB are absent", () => {
    const liveRlsReady = liveRlsEnvironmentAvailable();
    expect(typeof liveRlsReady).toBe("boolean");
    if (!liveRlsReady) {
      expect(liveRlsReady).toBe(false);
      expect(BOS15B_STATUS).toBe("BOS15B_BLOCKED_LIVE_RLS_ENV");
    } else {
      expect(liveRlsReady).toBe(true);
    }
    expect(LIVE_RLS_STATUS).toBe("LIVE_RLS_NOT_CERTIFIED");
    expect(bosLiveRlsCertified).toBe(false);
    expect(BOS_LIVE_RLS_REPRESENTATIVE_TABLES).toHaveLength(11);
    expect(BOS_PRODUCTION_GA_REMAINING_GATES).toContain("BOS15B_BLOCKED_LIVE_RLS_ENV");
  });
});

describe("BOS-15C/D/E live providers", () => {
  it("classifies each provider BLOCKED_ENV and does not infer live from fixtures", () => {
    expect(liveProviderCredentialsAvailable("xero")).toBe(false);
    expect(liveProviderCredentialsAvailable("microsoft_365")).toBe(false);
    expect(liveProviderCredentialsAvailable("hubspot")).toBe(false);
    expect(BOS15C_STATUS).toBe("BOS15C_XERO_BLOCKED_ENV");
    expect(BOS15D_STATUS).toBe("BOS15D_MICROSOFT_365_BLOCKED_ENV");
    expect(BOS15E_STATUS).toBe("BOS15E_HUBSPOT_BLOCKED_ENV");
    expect(BOS15_PROVIDER_STATUS.xero).toBe("BLOCKED_ENV");
    expect(BOS15_PROVIDER_STATUS.microsoft_365).toBe("BLOCKED_ENV");
    expect(BOS15_PROVIDER_STATUS.hubspot).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).not.toBe("LIVE_PROVIDER_CERTIFIED");
    expect(BOS_CONNECTOR_CERTIFICATION.microsoft_365.live).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.hubspot.live).toBe("BLOCKED_ENV");
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
  });
});

describe("BOS-15F browser E2E", () => {
  it("does not certify browser E2E without a live app, auth, and Playwright base URL", () => {
    expect(browserE2eEnvironmentAvailable()).toBe(false);
    expect(BOS15F_STATUS).toBe("BOS15F_BLOCKED_BROWSER_ENV");
    expect(BROWSER_E2E_STATUS).toBe("BROWSER_E2E_NOT_CERTIFIED");
    expect(bosBrowserE2eCertified).toBe(false);
    expect(BOS_15_BROWSER_ROUTES).toContain("/business");
    expect(BOS_15_BROWSER_ROUTES).toContain("/business/settings");
    expect(BOS_15_BROWSER_ROUTES).toContain("/business/customers/demo");
  });

  it("keeps declaration false when the browser environment is available and evidence already passed", () => {
    stubBosBrowserE2eAvailable();
    expect(browserE2eEnvironmentAvailable()).toBe(true);
    const preflight = bos15EnvironmentPreflight();
    expect(preflight.browser.available).toBe(true);
    expect(preflight.browser.classification).toBe("AVAILABLE");
    expect(preflight.browser.evidenceResult).toBe("pass");
    expect(preflight.browser.certifiedDeclaration).toBe(false);
    expect(bosBrowserE2eCertified).toBe(false);
    expect(BOS15F_STATUS).toBe("BOS15F_BLOCKED_BROWSER_ENV");
  });
});
