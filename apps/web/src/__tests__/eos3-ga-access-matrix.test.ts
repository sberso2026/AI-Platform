import { describe, expect, it } from "vitest";
import {
  EOS3_ACTIVATION_STATUS,
  EOS3_RELEASE_STATUS,
  EOS3_VERSION,
  eos3VersionContext,
} from "../lib/commerce/eos3-identity";
import { evaluateEos3Access, type Eos3EntitlementRecord } from "../lib/commerce/eos3-entitlement";
import {
  EOS_3_GA_ACTIVATION_STATUS,
  EOS_3_GA_AUTHORIZED_CONTROLS,
  EOS_3_GA_HUMAN_GO,
  eos3ProductionGaAccessAllowed,
} from "../lib/commerce/eos3-ga-authorization";
import { EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE } from "../lib/commerce/eos2-external-customer-hold";

const AUTHORIZED_WS = "5c85d773-3b79-43b2-b138-c6251f566768";
const AUTHORIZED_TENANT = "4f7da5fe-4ffb-453d-9d63-b74ff36aba2a";

const enrolledGrant: Eos3EntitlementRecord = {
  productKey: "eos-3",
  tenantId: AUTHORIZED_TENANT,
  workspaceId: AUTHORIZED_WS,
  status: "active",
  grantSource: "INTERNAL_VALIDATION",
  validFrom: "2026-01-01",
  validUntil: null,
};

function access(partial: Parameters<typeof evaluateEos3Access>[0]) {
  return evaluateEos3Access(partial);
}

describe("EOS 3.13R-C GA access matrix + activation semantics", () => {
  it("binds controlled GA activation identity (not uncontrolled access)", () => {
    expect(EOS3_VERSION).toBe("3.0.0");
    expect(EOS3_RELEASE_STATUS).toBe("GENERAL_AVAILABILITY");
    expect(EOS3_ACTIVATION_STATUS).toBe("ACTIVE_CONTROLLED_GA");
    expect(EOS_3_GA_ACTIVATION_STATUS).toBe("ACTIVE_CONTROLLED_GA");
    expect(eos3VersionContext().activationStatus).toBe("ACTIVE_CONTROLLED_GA");
    expect(EOS_3_GA_HUMAN_GO).toBe("ISSUED");
    expect(EOS_3_GA_AUTHORIZED_CONTROLS.accessModel).toBe("EXPLICIT_ENTITLEMENT_AND_ENROLLMENT");
    expect(EOS_3_GA_AUTHORIZED_CONTROLS.accessDefault).toBe("DENY");
    expect(EOS_3_GA_AUTHORIZED_CONTROLS.publicSelfServiceSignup).toBe(false);
    expect(EOS_3_GA_AUTHORIZED_CONTROLS.externalCustomerRelease).toBe("NOT_AUTHORIZED");
    expect(EOS_3_GA_AUTHORIZED_CONTROLS.externalCustomerHold).toBe("ACTIVE");
    expect(EOS2_EXTERNAL_CUSTOMER_HOLD_ACTIVE).toBe(true);
  });

  it("ALLOW: authorized enrolled workspace in Production under GA GO", () => {
    const d = access({
      authenticated: true,
      requestedProductKey: "eos-3",
      tenantId: AUTHORIZED_TENANT,
      workspaceId: AUTHORIZED_WS,
      record: enrolledGrant,
      enrollmentState: "PILOT",
      productionEnvironment: true,
    });
    expect(d.allowed).toBe(true);
    expect(d.reason).toBe("active_controlled_ga");
    expect(eos3ProductionGaAccessAllowed("PILOT")).toBe(true);
  });

  it("DENY: EOS 2-only workspace (no eos-3 grant)", () => {
    const d = access({
      authenticated: true,
      requestedProductKey: "eos-3",
      tenantId: AUTHORIZED_TENANT,
      workspaceId: AUTHORIZED_WS,
      record: null,
      enrollmentState: "PILOT",
      productionEnvironment: true,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("missing");
  });

  it("DENY: EOS 3 entitled but unenrolled workspace", () => {
    const d = access({
      authenticated: true,
      requestedProductKey: "eos-3",
      tenantId: AUTHORIZED_TENANT,
      workspaceId: AUTHORIZED_WS,
      record: enrolledGrant,
      enrollmentState: "NOT_ELIGIBLE",
      productionEnvironment: true,
    });
    expect(d.allowed).toBe(false);
    expect(["production_denied", "not_enrolled"]).toContain(d.reason);
  });

  it("DENY: entitled DEVELOPMENT enrollment is not Production GA enrollment", () => {
    const d = access({
      authenticated: true,
      requestedProductKey: "eos-3",
      tenantId: AUTHORIZED_TENANT,
      workspaceId: AUTHORIZED_WS,
      record: enrolledGrant,
      enrollmentState: "DEVELOPMENT",
      productionEnvironment: true,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("production_denied");
    expect(eos3ProductionGaAccessAllowed("DEVELOPMENT")).toBe(false);
  });

  it("DENY: foreign workspace (grant workspace mismatch)", () => {
    const d = access({
      authenticated: true,
      requestedProductKey: "eos-3",
      tenantId: AUTHORIZED_TENANT,
      workspaceId: "foreign-workspace",
      record: enrolledGrant,
      enrollmentState: "PILOT",
      productionEnvironment: true,
    });
    expect(d.allowed).toBe(false);
    expect(d.reason).toBe("wrong_workspace");
  });

  it("DENY: external customer / anonymous / kill switch", () => {
    expect(
      access({
        authenticated: false,
        requestedProductKey: "eos-3",
        tenantId: AUTHORIZED_TENANT,
        workspaceId: AUTHORIZED_WS,
        record: enrolledGrant,
        enrollmentState: "PILOT",
        productionEnvironment: true,
      }).reason,
    ).toBe("unauthenticated");

    expect(
      access({
        authenticated: true,
        requestedProductKey: "eos-2",
        tenantId: AUTHORIZED_TENANT,
        workspaceId: AUTHORIZED_WS,
        record: { ...enrolledGrant, productKey: "eos-2" },
        enrollmentState: "PILOT",
        productionEnvironment: true,
      }).allowed,
    ).toBe(false);

    expect(
      access({
        authenticated: true,
        requestedProductKey: "eos-3",
        tenantId: AUTHORIZED_TENANT,
        workspaceId: AUTHORIZED_WS,
        record: enrolledGrant,
        enrollmentState: "PILOT",
        productionEnvironment: true,
        emergencyOff: true,
      }).reason,
    ).toBe("kill_switch");
  });

  it("proves ACTIVE_GENERAL_AVAILABILITY was label-only; access semantics remain controlled", () => {
    // Prior activation docs used ACTIVE_GENERAL_AVAILABILITY / active_general_availability.
    // Gate: Production ALLOW still requires GO + PILOT enrollment + matching eos-3 entitlement.
    expect(eos3ProductionGaAccessAllowed(null)).toBe(false);
    expect(eos3ProductionGaAccessAllowed("STAGING")).toBe(false);
    expect(eos3ProductionGaAccessAllowed("PILOT")).toBe(true);
    expect(EOS3_ACTIVATION_STATUS).toBe("ACTIVE_CONTROLLED_GA");
  });
});
