import { describe, expect, it } from "vitest";
import {
  PLATFORM_IDENTITY_VERSION,
  PHASE_16A_BASELINE_COMMIT,
} from "./version";
import {
  EnterpriseIdentityDiscoveryReady,
  phase16BReady,
} from "./discovery-flags";
import { EnterpriseSsoRuntimeImplemented } from "./runtime-flags";
import { EXISTING_IDENTITY_FOOTPRINT } from "./footprint";
import { PROTOCOL_STRATEGY } from "./architecture-decisions";

describe("Phase 16A discovery preserved under 16B", () => {
  it("keeps discovery locks and 16A baseline", () => {
    expect(EnterpriseIdentityDiscoveryReady).toBe(true);
    expect(phase16BReady).toBe(true);
    expect(PHASE_16A_BASELINE_COMMIT).toBe(
      "af1e0425c77c516d4cf99a42d5e3eab9bee7206e",
    );
    expect(PROTOCOL_STRATEGY.primaryV1FederationProtocol).toBe("oidc_oauth2");
    expect(EXISTING_IDENTITY_FOOTPRINT.length).toBeGreaterThan(10);
  });

  it("advances package version for enterprise SSO / pen-test readiness", () => {
    expect(["0.2.0-enterprise-sso", "0.3.0-pen-test-readiness"]).toContain(
      PLATFORM_IDENTITY_VERSION,
    );
    expect(EnterpriseSsoRuntimeImplemented).toBe(true);
  });
});
