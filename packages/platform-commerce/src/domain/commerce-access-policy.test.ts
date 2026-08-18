import { describe, expect, it } from "vitest";
import {
  ENGINEERING_API_POLICIES,
  BUSINESS_API_POLICIES,
  BUSINESS_PAGE_POLICIES,
  getEngineeringApiPolicy,
  getBusinessApiPolicy,
  resolveApiPolicyKey,
} from "./commerce-access-policy";

const ENGINEERING_API_SEGMENTS = [
  "health",
  "dashboard",
  "projects",
  "documents",
  "assets",
  "companies",
  "disciplines",
  "decisions",
  "risks",
  "issues",
  "actions",
  "lessons",
  "technical-queries",
  "timeline",
  "activity",
  "search",
  "ai",
  "settings",
  "applications",
  "demo",
];

describe("ENGINEERING_API_POLICIES", () => {
  it("defines policies for all engineering API segments", () => {
    for (const segment of ENGINEERING_API_SEGMENTS) {
      const readKey = resolveApiPolicyKey(segment, "GET");
      const writeKey = resolveApiPolicyKey(segment, "POST");
      expect(
        ENGINEERING_API_POLICIES[readKey] ?? ENGINEERING_API_POLICIES[`${segment}.read`]
      ).toBeDefined();
      const policy = getEngineeringApiPolicy(segment, "GET");
      expect(policy.productKey).toBe("engineering-os");
    }
  });

  it("requires fresh cache for write operations", () => {
    const write = getEngineeringApiPolicy("projects", "POST");
    expect(write.cachePolicy).toBe("fresh");
  });
});

describe("BOS BUSINESS_API_POLICIES", () => {
  it("binds foundation and owner-command routes to business-os and business_os", () => {
    expect(getBusinessApiPolicy("status", "GET").productKey).toBe("business-os");
    expect(getBusinessApiPolicy("status", "GET").featureKey).toBe("business_os");
    expect(getBusinessApiPolicy("command", "GET").workspaceRequired).toBe(true);
    expect(getBusinessApiPolicy("kpis", "PATCH").cachePolicy).toBe("fresh");
    expect(getBusinessApiPolicy("demo", "POST").action).toBe("demo.write");
    expect(getBusinessApiPolicy("finance", "GET").workspaceRequired).toBe(true);
    expect(getBusinessApiPolicy("finance", "POST").cachePolicy).toBe("fresh");
    expect(BUSINESS_PAGE_POLICIES["/business/finance"]?.productKey).toBe("business-os");
    expect(BUSINESS_API_POLICIES["capabilities.read"]?.seatRequired).toBe(false);
    expect(BUSINESS_PAGE_POLICIES["/business"]?.productKey).toBe("business-os");
  });
});
