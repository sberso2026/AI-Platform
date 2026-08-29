import { afterEach, describe, expect, it, vi } from "vitest";
import { clearBosCertificationEnv } from "../certification-env-harness";
import {
  BOS14B_PROVIDER_STATUS,
  BOS_CONNECTOR_CERTIFICATION,
  XERO_CONNECTOR_IMPLEMENTED,
  XERO_LIVE_CERTIFICATION_EXECUTED,
  XERO_SECURITY_ARCHITECTURE_READY,
  bosLiveHubSpotCertified,
  bosLiveMicrosoft365Certified,
  bosLiveXeroCertified,
  liveProviderCredentialsAvailable,
} from "../release";
import { BOS_CONNECTOR_ADAPTERS } from "./adapters";

describe("BOS-14B live provider honesty", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("keeps contract/sandbox certification and reports BLOCKED_ENV when live credentials are absent", () => {
    clearBosCertificationEnv();
    expect(liveProviderCredentialsAvailable("xero")).toBe(false);
    expect(liveProviderCredentialsAvailable("microsoft_365")).toBe(false);
    expect(liveProviderCredentialsAvailable("hubspot")).toBe(false);
    expect(BOS14B_PROVIDER_STATUS).toEqual({
      xero: "BLOCKED_ENV",
      microsoft_365: "BLOCKED_ENV",
      hubspot: "BLOCKED_ENV",
    });
    expect(BOS_CONNECTOR_CERTIFICATION.xero.live).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.microsoft_365.live).toBe("BLOCKED_ENV");
    expect(BOS_CONNECTOR_CERTIFICATION.hubspot.live).toBe("BLOCKED_ENV");
    expect(bosLiveXeroCertified).toBe(false);
    expect(bosLiveMicrosoft365Certified).toBe(false);
    expect(bosLiveHubSpotCertified).toBe(false);
    expect(XERO_CONNECTOR_IMPLEMENTED).toBe(true);
    expect(XERO_SECURITY_ARCHITECTURE_READY).toBe(true);
    expect(XERO_LIVE_CERTIFICATION_EXECUTED).toBe(false);
    expect(() => BOS_CONNECTOR_ADAPTERS.xero.write()).toThrow("connector_write_forbidden");
    expect(() => BOS_CONNECTOR_ADAPTERS.microsoft_365.write()).toThrow("connector_write_forbidden");
    expect(() => BOS_CONNECTOR_ADAPTERS.hubspot.write()).toThrow("connector_write_forbidden");
  });

  it.skipIf(!liveProviderCredentialsAvailable("xero"))("executes live Xero validation only when credentials exist", () => {
    expect(liveProviderCredentialsAvailable("xero")).toBe(true);
  });

  it.skipIf(!liveProviderCredentialsAvailable("microsoft_365"))(
    "executes live Microsoft 365 validation only when credentials exist",
    () => {
      expect(liveProviderCredentialsAvailable("microsoft_365")).toBe(true);
    },
  );

  it.skipIf(!liveProviderCredentialsAvailable("hubspot"))(
    "executes live HubSpot validation only when credentials exist",
    () => {
      expect(liveProviderCredentialsAvailable("hubspot")).toBe(true);
    },
  );
});
