import { describe, expect, it } from "vitest";
import type { BusinessKpi } from "@rtb/types";
import {
  BUSINESS_HEALTH_MIN_KNOWN_KPIS_FOR_SCORE,
  BUSINESS_HEALTH_STATUS_WEIGHTS,
} from "@rtb/types";
import { computeBusinessHealth, deriveKpiStatus } from "./health";

function kpi(partial: Partial<BusinessKpi> & { key: string; status: BusinessKpi["status"]; value: number | null }): BusinessKpi {
  return {
    id: partial.id ?? partial.key,
    tenantId: "t",
    workspaceId: "w",
    name: partial.name ?? partial.key,
    description: null,
    category: partial.category ?? "general",
    unit: partial.unit ?? "count",
    target: partial.target ?? null,
    warningThreshold: partial.warningThreshold ?? null,
    criticalThreshold: partial.criticalThreshold ?? null,
    direction: partial.direction ?? "higher_is_better",
    measuredAt: partial.measuredAt ?? "2026-08-18T09:00:00.000Z",
    sourceType: "demo",
    sourceRef: "test",
    provenance: {},
    isDemo: true,
    createdAt: "2026-08-18T09:00:00.000Z",
    updatedAt: "2026-08-18T09:00:00.000Z",
    ...partial,
  };
}

describe("deriveKpiStatus", () => {
  it("returns unknown when value is missing", () => {
    expect(
      deriveKpiStatus({
        value: null,
        direction: "higher_is_better",
        warningThreshold: 6,
        criticalThreshold: 3,
        target: 9,
      }),
    ).toBe("unknown");
  });

  it("returns critical then warning using explicit thresholds", () => {
    const base = {
      direction: "higher_is_better" as const,
      warningThreshold: 6,
      criticalThreshold: 3,
      target: 9,
    };
    expect(deriveKpiStatus({ ...base, value: 2 })).toBe("critical");
    expect(deriveKpiStatus({ ...base, value: 4 })).toBe("warning");
    expect(deriveKpiStatus({ ...base, value: 10 })).toBe("healthy");
  });
});

describe("computeBusinessHealth", () => {
  const asOf = "2026-08-18T09:00:00.000Z";

  it("does not fabricate a score without KPIs", () => {
    const health = computeBusinessHealth([], asOf);
    expect(health.overallStatus).toBe("unknown");
    expect(health.score).toBeNull();
    expect(health.contributingKpiCount).toBe(0);
    expect(health.unknownCount).toBe(0);
    expect(health.weights).toEqual(BUSINESS_HEALTH_STATUS_WEIGHTS);
    expect(health.disclaimer).toMatch(/not a statutory, financial, or professional assessment/i);
  });

  it("keeps score unknown when known KPI coverage is below the explicit minimum", () => {
    const health = computeBusinessHealth(
      [
        kpi({ key: "a", status: "healthy", value: 1 }),
        kpi({ key: "b", status: "warning", value: 1 }),
      ],
      asOf,
    );
    expect(health.contributingKpiCount).toBe(2);
    expect(health.contributingKpiCount).toBeLessThan(BUSINESS_HEALTH_MIN_KNOWN_KPIS_FOR_SCORE);
    expect(health.score).toBeNull();
    expect(health.overallStatus).toBe("warning");
  });

  it("excludes unknown KPIs from the score and keeps them visible", () => {
    const health = computeBusinessHealth(
      [
        kpi({ key: "a", status: "healthy", value: 1 }),
        kpi({ key: "b", status: "healthy", value: 1 }),
        kpi({ key: "c", status: "healthy", value: 1 }),
        kpi({ key: "d", status: "unknown", value: null }),
      ],
      asOf,
    );
    expect(health.score).toBe(100);
    expect(health.overallStatus).toBe("healthy");
    expect(health.unknownCount).toBe(1);
    expect(health.missingCount).toBe(1);
    expect(health.contributingKpiCount).toBe(3);
  });

  it("reduces score for warning and critical KPIs with inspectable weights", () => {
    const health = computeBusinessHealth(
      [
        kpi({ key: "a", status: "healthy", value: 1 }),
        kpi({ key: "b", status: "warning", value: 1 }),
        kpi({ key: "c", status: "critical", value: 1 }),
      ],
      asOf,
    );
    expect(health.weights.healthy).toBe(4);
    expect(health.weights.warning).toBe(1);
    expect(health.weights.critical).toBe(0);
    expect(health.weights.unknown).toBeNull();
    expect(health.score).toBe(42);
    expect(health.overallStatus).toBe("critical");
    expect(health.primaryNegativeContributors.map((c) => c.key)).toEqual(["c", "b"]);
  });
});
