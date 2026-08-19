import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_OS_RUNTIME_MANIFEST,
  createBusinessOS,
  implementsOwnAiStack,
} from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";

const ROOT = resolve(import.meta.dirname, "../../..");

describe("BOS-7 Work & Operations", () => {
  it("reuses Platform AI Director and forbids autonomous operations actions", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-12");
    expect(bos.workOperations).toBeDefined();
    expect(bos.capabilities.isImplemented("work_operations")).toBe(true);
    expect(bos.capabilities.isImplemented("decision_action")).toBe(true);
    expect(() => bos.workOperations.allocateResourcesAutonomously()).toThrow("autonomous_assignment_forbidden");
    expect(() => bos.workOperations.writeExternalProjectSystem()).toThrow("external_project_write_forbidden");
    expect(() => bos.workOperations.approveCompletionAutonomously()).toThrow("autonomous_completion_forbidden");
    expect(bos.workOperations.engineeringLink().writesEngineeringOs).toBe(false);
    expect(bos.workOperations.decisionAction().available).toBe(true);
  });

  it("registers /business/operations", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/operations" && r.title === "Work & Operations",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/operations/page.tsx"), "utf8");
    expect(page).toContain("Work & Operations");
    expect(page).toContain("not a scheduler");
    expect(page).not.toMatch(/primavera|servicenow|timesheet payroll/i);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/(platform)/business/operations/[id]/page.tsx"))).toBe(true);
  });

  it("adds work tables without scheduling, payroll, or engineering subsystems", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260819120000_batch_103_business_os_work_operations.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_work_items");
    expect(sql).toContain("business_os_work_cost_facts");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql.toLowerCase()).not.toContain("create table if not exists payroll");
    expect(sql.toLowerCase()).not.toContain("create table if not exists engineering_projects");
  });
});
