import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-7 Work & Operations web wiring", () => {
  it("maps /business/operations to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/operations")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not implement a second AI stack or autonomous assignment path", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.workOperations).toBeDefined();
    expect(() => bos.workOperations.allocateResourcesAutonomously()).toThrow("autonomous_assignment_forbidden");
    expect(() => bos.workOperations.writeExternalProjectSystem()).toThrow("external_project_write_forbidden");
    const src = fs.readFileSync(path.join(API_ROOT, "operations", "route.ts"), "utf8");
    expect(src).toContain("business_os.work_operations.view");
    expect(src).toContain("business_os.work_operations.manage");
    expect(src).not.toMatch(/primavera|servicenow|allocateResources/i);
    expect(fs.existsSync(path.join(API_ROOT, "operations", "schedule", "route.ts"))).toBe(false);
    expect(fs.existsSync(path.join(API_ROOT, "operations", "dispatch", "route.ts"))).toBe(false);
  });

  it("keeps nested reads on view and demo ingestion on manage", () => {
    for (const nested of ["work", "detail", "milestones", "costs", "capacity", "health"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "operations", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.work_operations.view");
    }
    expect(fs.readFileSync(path.join(API_ROOT, "operations", "demo", "route.ts"), "utf8")).toContain(
      "business_os.work_operations.manage",
    );
  });

  it("renders owner-focused operations sections rather than a scheduler", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/operations/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-operations-summary",
      "bos-operations-work",
      "bos-operations-capacity",
      "bos-operations-attention",
      "bos-operations-data-quality",
    ]) {
      expect(page).toContain(testId);
    }
    expect(page).toContain("not a scheduler");
    expect(page).not.toMatch(/primavera|cpm|pert|timesheet payroll/i);
    const detail = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/operations/[id]/page.tsx"),
      "utf8",
    );
    expect(detail).toContain("bos-operations-detail");
    expect(detail).toContain("bos-operations-engineering");
  });
});
