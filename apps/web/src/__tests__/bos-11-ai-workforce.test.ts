import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createBusinessOS, implementsOwnAiStack } from "@rtb/business-os";
import { createPlatformKernel } from "@rtb/platform-kernel";
import type { SupabaseClient } from "@rtb/database";
import { resolveEntitlementTarget } from "../lib/commerce/guards";

const API_ROOT = path.resolve(__dirname, "../app/api/business");

describe("BOS-11 AI Workforce web wiring", () => {
  it("maps /business/ai-workforce to business-os / business_os", () => {
    expect(resolveEntitlementTarget("/business/ai-workforce")).toEqual({
      productKey: "business-os",
      featureKey: "business_os",
    });
  });

  it("does not expose arbitrary agent execution or a second AI stack", () => {
    expect(implementsOwnAiStack).toBe(false);
    const bos = createBusinessOS({} as SupabaseClient, createPlatformKernel({} as SupabaseClient));
    expect(bos.aiWorkforce).toBeDefined();
    expect(() => bos.aiWorkforce.executeArbitrary()).toThrow("unrestricted_agent_execution_forbidden");
    const execute = fs.readFileSync(path.join(API_ROOT, "ai-workforce", "execute", "route.ts"), "utf8");
    expect(execute).toContain("unrestricted_agent_execution_forbidden");
    expect(fs.readFileSync(path.join(API_ROOT, "ai-workforce", "route.ts"), "utf8")).toContain(
      "business_os.ai_workforce.view",
    );
  });

  it("keeps nested reads on view, lifecycle on manage, tasks on run, and approvals on approve", () => {
    for (const nested of ["agents", "detail", "runs", "run"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "ai-workforce", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.ai_workforce.view");
    }
    for (const nested of ["install", "enable", "suspend", "revoke", "configure", "demo", "diagnostics"]) {
      const file = fs.readFileSync(path.join(API_ROOT, "ai-workforce", nested, "route.ts"), "utf8");
      expect(file).toContain("business_os.ai_workforce.manage");
    }
    expect(fs.readFileSync(path.join(API_ROOT, "ai-workforce", "tasks", "route.ts"), "utf8")).toContain(
      "business_os.ai_workforce.run",
    );
    expect(fs.readFileSync(path.join(API_ROOT, "ai-workforce", "approvals", "route.ts"), "utf8")).toContain(
      "business_os.ai_workforce.approve",
    );
  });

  it("renders workforce overview, agents, runs, approvals, and diagnostics", () => {
    const page = fs.readFileSync(
      path.resolve(__dirname, "../app/(platform)/business/ai-workforce/page.tsx"),
      "utf8",
    );
    for (const testId of [
      "bos-workforce-overview",
      "bos-workforce-agents",
      "bos-workforce-runs",
      "bos-workforce-approvals",
      "bos-workforce-diagnostics",
    ]) {
      expect(page).toContain(testId);
    }
    expect(page).toContain("Advisory authority");
    expect(page).toContain("Execution authority");
    expect(page).not.toMatch(/chain-of-thought/i);
  });
});
