import { describe, expect, it } from "vitest";
import {
  PLATFORM_IDENTITY_VERSION,
  PLATFORM_IDENTITY_STATUS,
  PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACT_VERSION,
  SECURITY_ASSURANCE_V1_COMMIT,
  ENGINEERING_OS_V1_COMMIT,
  PLATFORM_IDENTITY_V1_SEMANTICS,
} from "./version";
import {
  EnterpriseIdentityDiscoveryReady,
  CustomerSsoProductionReady,
  S08CustomerSsoProductionReady,
  S07ExternalPenTestComplete,
  Tier1EnterpriseProductionReady,
  securityAssuranceOwnsCustomerSso,
  EngineeringOsOwnsCustomerSso,
  EnterpriseSsoRuntimeImplemented,
  duplicateIdentityProviderDetected,
  SecurityAssuranceV1Intact,
  EngineeringOSV1Intact,
  phase16BReady,
} from "./discovery-flags";
import {
  PROTOCOL_STRATEGY,
  JIT_DECISION,
  SCIM_DECISION,
  S08_MINIMUM_IMPLEMENTATION_SCOPE,
} from "./architecture-decisions";
import { EXISTING_IDENTITY_FOOTPRINT } from "./footprint";
import { PLATFORM_ENTERPRISE_IDENTITY_DRAFT_CONTRACTS } from "./draft-contracts";

describe("Phase 16A Platform Enterprise Identity Discovery", () => {
  it("declares discovery version and draft contracts", () => {
    expect(PLATFORM_IDENTITY_VERSION).toBe("0.1.0-enterprise-sso-discovery");
    expect(PLATFORM_IDENTITY_STATUS).toBe("discovery");
    expect(PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACT_VERSION).toBe(
      "0.1.0-draft",
    );
    expect(PLATFORM_ENTERPRISE_IDENTITY_DRAFT_CONTRACTS.length).toBeGreaterThanOrEqual(
      9,
    );
  });

  it("locks ownership and keeps production readiness false", () => {
    expect(EnterpriseIdentityDiscoveryReady).toBe(true);
    expect(securityAssuranceOwnsCustomerSso).toBe(false);
    expect(EngineeringOsOwnsCustomerSso).toBe(false);
    expect(CustomerSsoProductionReady).toBe(false);
    expect(S08CustomerSsoProductionReady).toBe(false);
    expect(S07ExternalPenTestComplete).toBe(false);
    expect(Tier1EnterpriseProductionReady).toBe(false);
    expect(EnterpriseSsoRuntimeImplemented).toBe(false);
  });

  it("preserves frozen baselines and anti-duplication", () => {
    expect(SECURITY_ASSURANCE_V1_COMMIT).toBe(
      "cf3e9eff49c1314ea16e115dcde26cd45e520121",
    );
    expect(ENGINEERING_OS_V1_COMMIT).toBe(
      "3bfc02478f50ce17f7a81e4e312986c9e1377535",
    );
    expect(SecurityAssuranceV1Intact).toBe(true);
    expect(EngineeringOSV1Intact).toBe(true);
    expect(duplicateIdentityProviderDetected).toBe(false);
    expect(phase16BReady).toBe(true);
  });

  it("locks protocol, JIT, and SCIM decisions", () => {
    expect(PROTOCOL_STRATEGY.primaryV1FederationProtocol).toBe("oidc_oauth2");
    expect(PROTOCOL_STRATEGY.secondaryReservedProtocol).toBe("saml2");
    expect(PROTOCOL_STRATEGY.providerNeutral).toBe(true);
    expect(JIT_DECISION.classification).toBe("OPTIONAL");
    expect(SCIM_DECISION.classification).toBe("POST_V1");
    expect(S08_MINIMUM_IMPLEMENTATION_SCOPE).toContain(
      "oidc_entra_first_class_federation",
    );
  });

  it("inventories existing footprint and fail-closed semantics", () => {
    expect(EXISTING_IDENTITY_FOOTPRINT.length).toBeGreaterThan(15);
    expect(
      EXISTING_IDENTITY_FOOTPRINT.some(
        (e) => e.capability.includes("enterprise SSO") && e.classification === "MISSING",
      ),
    ).toBe(true);
    expect(
      PLATFORM_IDENTITY_V1_SEMANTICS.authenticatedExternallyNeqAuthorizedInternally,
    ).toBe(true);
    expect(PLATFORM_IDENTITY_V1_SEMANTICS.ssoEnabledNeqMfaVerified).toBe(true);
  });
});
