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

describe("BOS-9 Business Risk", () => {
  it("reuses Platform AI Director and forbids autonomous risk acceptance", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as never, createPlatformKernel({} as never));
    expect(bos.status.snapshot().phase).toBe("BOS-13");
    expect(bos.businessRisk).toBeDefined();
    expect(bos.capabilities.isImplemented("business_risk")).toBe(true);
    expect(bos.capabilities.isImplemented("business_context")).toBe(true);
    expect(() => bos.businessRisk.acceptRiskAutonomously()).toThrow("autonomous_risk_acceptance_forbidden");
    expect(() => bos.businessRisk.declareStatutoryCompliance()).toThrow("statutory_compliance_claim_forbidden");
    expect(() => bos.businessRisk.writeExternalRegulator()).toThrow("external_regulator_write_forbidden");
    expect(() => bos.businessRisk.provideLegalAdvice()).toThrow("legal_advice_forbidden");
    expect(bos.businessRisk.contract().reuses).toEqual([
      "business_os_signals",
      "business_os_recommendations",
      "business_os_kpis",
      "business_os_decisions",
      "business_os_actions",
    ]);
    expect(bos.businessRisk.businessContextGraph().available).toBe(true);
  });

  it("registers /business/risk", () => {
    expect(
      BUSINESS_OS_RUNTIME_MANIFEST.routes?.some((r) => r.path === "/business/risk" && r.title === "Business Risk"),
    ).toBe(true);
    const page = readFileSync(resolve(ROOT, "apps/web/src/app/(platform)/business/risk/page.tsx"), "utf8");
    expect(page).toContain("Business Risk");
    expect(page).toContain("No autonomous risk acceptance");
    expect(page).not.toMatch(/legal advice endpoint|autonomous acceptance endpoint/i);
    expect(existsSync(resolve(ROOT, "apps/web/src/app/(platform)/business/risk/[id]/page.tsx"))).toBe(true);
  });

  it("adds risk tables with RLS and reuses BOS actions", () => {
    const migration = resolve(
      ROOT,
      "supabase/migrations/20260819140000_batch_105_business_os_business_risk.sql",
    );
    expect(existsSync(migration)).toBe(true);
    const sql = readFileSync(migration, "utf8");
    expect(sql).toContain("business_os_risks");
    expect(sql).toContain("business_os_risk_assessments");
    expect(sql).toContain("REFERENCES business_os_actions(id)");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql.toLowerCase()).not.toContain("create table if not exists business_os_tasks");
  });
});
