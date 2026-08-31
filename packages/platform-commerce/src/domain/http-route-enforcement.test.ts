import { describe, it, expect } from "vitest";
import { createTestCommerceExecutionContext, verifyCommerceAuthorization } from "./commerce-execution-context";
import { ENGINEERING_API_POLICIES, getEngineeringApiPolicy } from "./commerce-access-policy";
import { assertVerifiedCommerceContext } from "./service-assertions";

describe("HTTP route policy enforcement", () => {
  it("maps engineering API segments to typed policies", () => {
    expect(getEngineeringApiPolicy("projects", "GET").action).toBe("project.read");
    expect(getEngineeringApiPolicy("projects", "POST").action).toBe("project.create");
    expect(getEngineeringApiPolicy("documents", "GET").applicationKey).toBe("documents");
    expect(getEngineeringApiPolicy("ai", "POST").featureKey).toBe("ai_assistant");
    expect(getEngineeringApiPolicy("inspection-intelligence-workflow", "POST").applicationKey).toBe(
      "inspection_intelligence",
    );
  });

  it("requires fresh cache policy for writes", () => {
    expect(getEngineeringApiPolicy("projects", "POST").cachePolicy).toBe("fresh");
    expect(getEngineeringApiPolicy("projects", "GET").cachePolicy).toBeUndefined();
  });

  it("covers all registered API policy keys", () => {
    const keys = Object.keys(ENGINEERING_API_POLICIES);
    expect(keys.length).toBeGreaterThanOrEqual(24);
    for (const key of keys) {
      expect(ENGINEERING_API_POLICIES[key].productKey).toBe("engineering-os");
    }
  });
});

describe("Verified commerce execution context", () => {
  it("rejects forged authorization signatures", () => {
    const commerce = createTestCommerceExecutionContext();
    const forged = {
      ...commerce,
      authorization: {
        ...commerce.authorization,
        signatureOrInternalToken: "forged-signature",
      },
    };
    expect(() =>
      assertVerifiedCommerceContext(forged, {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      })
    ).toThrow();
  });

  it("rejects tenant mismatch between context and authorization", () => {
    const commerce = createTestCommerceExecutionContext({ tenantId: "tenant-a" });
    const mismatched = {
      ...commerce,
      tenantId: "tenant-b",
    };
    expect(() =>
      assertVerifiedCommerceContext(mismatched, {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      })
    ).toThrow();
  });

  it("accepts valid server-issued authorization", () => {
    const commerce = createTestCommerceExecutionContext({
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      },
    });
    expect(verifyCommerceAuthorization(commerce.authorization)).toBe(true);
    expect(() =>
      assertVerifiedCommerceContext(commerce, {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.read",
        seatRequired: true,
      })
    ).not.toThrow();
  });
});
