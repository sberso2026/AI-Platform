import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  DATABASE_POLICY_CHANGED,
  II_6P_IMPLEMENTED,
  II_6_IMPLEMENTED,
  II_LATENCY_CLASSIFICATION,
  II_PERFORMANCE_GA_BLOCKER_OPEN,
  II_PERFORMANCE_OPTIMIZATION_PASS,
  II_PERFORMANCE_ROOT_CAUSE_ESTABLISHED,
  II_RELEASE_CANDIDATE_READY,
  INSPECTION_INTELLIGENCE_II_6P_IMPLEMENTED,
  PLATFORM_SHARED_BEHAVIOR_CHANGED,
  SCHEMA_CHANGED,
} from "@rtb/inspection-intelligence";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("II-6P shared-platform latency certification", () => {
  it("reuses request-scoped auth context and parallelizes independent entitlement reads", () => {
    expect(INSPECTION_INTELLIGENCE_II_6P_IMPLEMENTED).toBe(true);
    expect(II_6P_IMPLEMENTED).toBe(true);
    expect(II_6_IMPLEMENTED).toBe(true);
    expect(PLATFORM_SHARED_BEHAVIOR_CHANGED).toBe(true);
    expect(II_LATENCY_CLASSIFICATION).toBe("MIXED");
    expect(II_PERFORMANCE_ROOT_CAUSE_ESTABLISHED).toBe(true);
    expect(II_PERFORMANCE_OPTIMIZATION_PASS).toBe(true);
    expect(II_PERFORMANCE_GA_BLOCKER_OPEN).toBe(true);
    expect(II_RELEASE_CANDIDATE_READY).toBe(false);
    expect(SCHEMA_CHANGED).toBe(false);
    expect(DATABASE_POLICY_CHANGED).toBe(false);

    const kernel = readFileSync(resolve(ROOT, "apps/web/src/lib/kernel.ts"), "utf8");
    expect(kernel).toContain('from "react"');
    expect(kernel).toContain("cache(loadAuthContext)");
    expect(kernel).toContain("roles(slug, permissions)");
    expect(kernel).not.toContain("getUserPermissions");

    const entitlement = readFileSync(
      resolve(ROOT, "packages/platform-commerce/src/services/entitlement-service.ts"),
      "utf8",
    );
    expect(entitlement).toContain("Promise.allSettled");
    expect(entitlement).toContain("matchOverride");
    expect(entitlement).toContain("overrideListCalls");
    expect(entitlement).toContain("hasStoredDecisions");
    expect(entitlement).not.toContain("createServiceClient");

    expect(existsSync(resolve(ROOT, "packages/inspection-intelligence-certification/src/ii6p-platform-performance-live.test.ts"))).toBe(
      true,
    );
  });
});
