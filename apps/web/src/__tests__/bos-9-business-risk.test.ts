import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-9 Business Risk web wiring", () => {
  it("maps /business/risk to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/risk")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not implement a second AI stack or autonomous acceptance path", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.businessRisk).toBeDefined();
    expect(() => bos.businessRisk.acceptRiskAutonomously()).toThrow("autonomous_risk_acceptance_forbidden");
    expect(() => bos.businessRisk.writeExternalRegulator()).toThrow("external_regulator_write_forbidden");
    const src = fs.readFileSync(path.join(API_ROOT, "risk", "route.ts"), "utf8");
    expect(src).toContain("business_os.business_risk.view");
    expect(src).toContain("business_os.business_risk.manage");
    expect(src).not.toMatch(/acceptRiskAutonomously|writeExternalRegulator/i);
    expect(fs.existsSync(path.join(API_ROOT, "risk", "autonomous", "route.ts"))).toBe(false);
    expect(fs.existsSync(path.join(API_ROOT, "regulator", "route.ts"))).toBe(false);
  });

  it("keeps nested reads on view, mutations on manage, and human acceptance on approve", () => {
    for (const nested of ["summary", "detail", "controls", "obligations", "intelligence", "settings"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "risk", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.business_risk.view");
    }
    expect(fs.readFileSync(path.join(API_ROOT, "risk", "demo", "route.ts"), "utf8")).toContain(
      "business_os.business_risk.manage",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "risk", "accept", "route.ts"), "utf8")).toContain(
      "business_os.business_risk.approve",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "risk", "tolerance-exception", "route.ts"), "utf8")).toContain(
      "business_os.business_risk.approve",
    );
  });

  it("renders risk summary, register, and detail sections", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/risk/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-risk-summary",
      "bos-risk-register",
      "bos-risk-controls",
      "bos-risk-obligations",
      "bos-risk-attention",
      "bos-risk-data-quality",
    ]) {
      expect(page).toContain(testId);
    }
    expect(page).toContain("No autonomous risk acceptance");
    const detail = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/risk/[id]/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-risk-detail",
      "bos-risk-overview",
      "bos-risk-assessment",
      "bos-risk-evidence",
      "bos-risk-controls-detail",
      "bos-risk-treatment",
      "bos-risk-decisions",
      "bos-risk-actions",
      "bos-risk-obligations-detail",
      "bos-risk-incidents",
      "bos-risk-history",
      "bos-risk-audit",
    ]) {
      expect(detail).toContain(testId);
    }
    expect(detail).not.toMatch(/chain-of-thought/i);
    const occ = fs.readFileSync(path.resolve(__dirname, "../app/(platform)/business/page.tsx"), "utf8");
    expect(occ).toContain("bos-business-risk");
    expect(occ).toContain("/business/risk");
  });
});
