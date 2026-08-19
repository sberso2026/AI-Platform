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

describe("BOS-8 Decision & Action Intelligence", () => {
  it("reuses Platform AI Director and forbids autonomous approval", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-12");
    expect(bos.decisionAction).toBeDefined();
    expect(bos.capabilities.isImplemented("decision_action")).toBe(true);
    expect(bos.capabilities.isImplemented("business_risk")).toBe(true);
    expect(() => bos.decisionAction.approveAutonomously()).toThrow("autonomous_approval_forbidden");
    expect(() => bos.decisionAction.executeExternalAction()).toThrow("external_execution_forbidden");
    expect(() => bos.decisionAction.rewriteHistoricalEvidence()).toThrow("historical_evidence_rewrite_forbidden");
    expect(bos.decisionAction.contract().reuses).toEqual([
      "business_os_signals",
      "business_os_recommendations",
      "business_os_decisions",
      "business_os_actions",
    ]);
    expect(bos.decisionAction.businessRisk().available).toBe(true);
  });

  it("registers /business/decisions", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some(
        (r) => r.path === "/business/decisions" && r.title === "Decision Intelligence",
      ),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/decisions/page.tsx"), "utf8");
    expect(page).toContain("Decision Intelligence");
    expect(page).toContain("No autonomous approval");
    expect(page).not.toMatch(/chain-of-thought|autonomous approval endpoint/i);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/(platform)/business/decisions/[id]/page.tsx"))).toBe(true);
  });

  it("adds supporting tables without a second decision or task system", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260819130000_batch_104_business_os_decision_action.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_decision_contexts");
    expect(sql).toContain("business_os_decision_evidence");
    expect(sql).toContain("business_os_decision_options");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_tasks");
  });
});
