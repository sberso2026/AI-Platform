import { describe, it, expect } from "vitest";
import {
  GROWTH_CREDIT_DISCLAIMERS,
  mapInstallationProgress,
  mapUsageMetrics,
  PLATFORM_NAVIGATION,
} from "@rtb/platform-core";

describe("Phase 4 — Customer administration gates E–I", () => {
  it("Gate E: Installed Products navigation and workflow mapping", () => {
    const productsNav = PLATFORM_NAVIGATION.find((i) => i.id === "installed-products");
    expect(productsNav?.label).toBe("Installed Products");
    expect(productsNav?.href).toBe("/system/products");

    const progress = mapInstallationProgress({
      installation: { id: "x", status: "active" },
      workflowSteps: [
        { step_key: "activation", status: "completed", completed_at: new Date().toISOString() },
      ],
    });
    expect(progress.steps.some((s) => s.key === "activation_complete")).toBe(true);
  });

  it("Gate H: Usage portal metrics include allowances", () => {
    const metrics = mapUsageMetrics([
      {
        metric_key: "ai_operations",
        name: "AI operations",
        unit: "ops",
        total_quantity: 100,
        period_start: "",
        period_end: "",
      },
    ]);
    expect(metrics[0]?.includedAllowance).toBeGreaterThan(0);
    expect(metrics[0]?.remaining).toBeDefined();
  });

  it("Gate I: Growth Credits disclaimers present", () => {
    expect(GROWTH_CREDIT_DISCLAIMERS.some((d) => d.includes("not cash"))).toBe(true);
    expect(GROWTH_CREDIT_DISCLAIMERS.some((d) => d.includes("not investments"))).toBe(true);
  });
});
