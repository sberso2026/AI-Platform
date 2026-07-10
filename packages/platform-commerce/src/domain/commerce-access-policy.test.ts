import { describe, expect, it } from "vitest";
import {
  ENGINEERING_API_POLICIES,
  getEngineeringApiPolicy,
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
