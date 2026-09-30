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
  "assumptions",
  "systems",
  "interfaces",
  "requirements",
  "changes",
  "impacts",
  "configuration",
  "optimization",
  "analysis",
  "thread",
  "assurance",
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
  "external-tools",
  "discipline-intelligence",
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

  it("maps inspection workflow segment to inspection_intelligence", () => {
    const policy = getEngineeringApiPolicy("inspection-intelligence-workflow", "POST");
    expect(policy.applicationKey).toBe("inspection_intelligence");
    expect(policy.action).toBe("inspection.write");
    expect(policy.cachePolicy).toBe("fresh");
  });

  it("requires fresh cache for write operations", () => {
    const write = getEngineeringApiPolicy("projects", "POST");
    expect(write.cachePolicy).toBe("fresh");
  });

  it("maps External Tools settings API to Engineering OS settings entitlement", () => {
    const read = getEngineeringApiPolicy("external-tools", "GET");
    const write = getEngineeringApiPolicy("external-tools", "POST");
    expect(read.productKey).toBe("engineering-os");
    expect(write.productKey).toBe("engineering-os");
    expect(read.action).toBe("settings.read");
    expect(write.action).toBe("settings.write");
  });

  it("maps Discipline Intelligence settings API to Engineering OS settings entitlement", () => {
    const read = getEngineeringApiPolicy("discipline-intelligence", "GET");
    const write = getEngineeringApiPolicy("discipline-intelligence", "POST");
    expect(read.action).toBe("settings.read");
    expect(write.action).toBe("settings.write");
  });

  it("maps Analysis to Engineering OS product, not Project Intelligence", () => {
    const read = getEngineeringApiPolicy("analysis", "GET");
    const write = getEngineeringApiPolicy("analysis", "POST");
    expect(read.productKey).toBe("engineering-os");
    expect(write.productKey).toBe("engineering-os");
    expect(read.applicationKey).toBeUndefined();
    expect(write.applicationKey).toBeUndefined();
    expect(read.action).toBe("analysis.read");
    expect(write.action).toBe("analysis.write");
  });

  it("maps Engineering Assurance to Engineering OS product, not Project Intelligence", () => {
    const read = getEngineeringApiPolicy("assurance", "GET");
    const write = getEngineeringApiPolicy("assurance", "POST");
    expect(read.productKey).toBe("engineering-os");
    expect(write.productKey).toBe("engineering-os");
    expect(read.applicationKey).toBeUndefined();
    expect(write.applicationKey).toBeUndefined();
  });

  it("maps Optimization to Engineering OS product, not Project Intelligence", () => {
    const read = getEngineeringApiPolicy("optimization", "GET");
    const write = getEngineeringApiPolicy("optimization", "POST");
    expect(read.productKey).toBe("engineering-os");
    expect(write.productKey).toBe("engineering-os");
    expect(read.applicationKey).toBeUndefined();
    expect(write.applicationKey).toBeUndefined();
    expect(read.action).toBe("optimization.read");
    expect(write.action).toBe("optimization.write");
  });

  it("maps Engineering OS A2-A4 registers to product entitlement, not PI", () => {
    for (const segment of ["decisions", "assumptions", "systems", "interfaces", "requirements", "changes", "impacts", "configuration"]) {
      const policy = getEngineeringApiPolicy(segment, "GET");
      expect(policy.productKey).toBe("engineering-os");
      expect(policy.applicationKey).toBeUndefined();
    }
  });
});
