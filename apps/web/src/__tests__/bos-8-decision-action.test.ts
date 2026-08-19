import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-8 Decision & Action Intelligence web wiring", () => {
  it("maps /business/decisions to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/decisions")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not implement a second AI stack or autonomous approval path", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.decisionAction).toBeDefined();
    expect(() => bos.decisionAction.approveAutonomously()).toThrow("autonomous_approval_forbidden");
    expect(() => bos.decisionAction.executeExternalAction()).toThrow("external_execution_forbidden");
    const src = fs.readFileSync(path.join(API_ROOT, "decisions", "route.ts"), "utf8");
    expect(src).toContain("business_os.owner_command.view");
    expect(src).toContain("business_os.owner_command.manage");
    expect(src).not.toMatch(/approveAutonomously|executeExternalAction/i);
    expect(fs.existsSync(path.join(API_ROOT, "decisions", "autonomous", "route.ts"))).toBe(false);
    expect(fs.existsSync(path.join(API_ROOT, "tasks", "route.ts"))).toBe(false);
  });

  it("keeps nested reads on view and mutations on manage, with human lesson acceptance on approve", () => {
    for (const nested of ["queue", "detail", "evidence", "options", "impact", "comparison", "brief", "outcomes", "lessons", "summary"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "decisions", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.decision_action.view");
    }
    expect(fs.readFileSync(path.join(API_ROOT, "decisions", "demo", "route.ts"), "utf8")).toContain(
      "business_os.decision_action.manage",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "decisions", "lessons", "accept", "route.ts"), "utf8")).toContain(
      "business_os.decision_action.approve",
    );
  });

  it("renders decision queue, outcomes, memory, and detail sections", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/decisions/page.tsx"),
      "utf8",
    );
    for (const testId of ["bos-decisions-queue", "bos-decisions-outcomes", "bos-decisions-memory", "bos-decisions-summary"]) {
      expect(page).toContain(testId);
    }
    expect(page).toContain("No autonomous approval");
    const detail = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/decisions/[id]/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-decisions-detail",
      "bos-decisions-context",
      "bos-decisions-evidence",
      "bos-decisions-options",
      "bos-decisions-impact",
      "bos-decisions-comparison",
      "bos-decisions-recommendation",
      "bos-decisions-decision",
      "bos-decisions-actions",
      "bos-decisions-outcome",
      "bos-decisions-lessons",
      "bos-decisions-audit",
    ]) {
      expect(detail).toContain(testId);
    }
    expect(detail).not.toMatch(/chain-of-thought/i);
    const occ = fs.readFileSync(path.resolve(__dirname, "../app/(platform)/business/page.tsx"), "utf8");
    expect(occ).toContain("bos-decision-intelligence");
    expect(occ).toContain("/business/decisions");
  });
});
