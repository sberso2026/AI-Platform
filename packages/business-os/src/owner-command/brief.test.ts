import { describe, expect, it } from "vitest";
import type { BusinessAction, BusinessDecision, BusinessKpi, BusinessSignal } from "@rtb/types";
import { computeBusinessHealth } from "./health";
import { buildDeterministicBrief, rankSignals, structuredBriefEvidence } from "./brief";

function kpi(partial: Partial<BusinessKpi> & { key: string; status: BusinessKpi["status"] }): BusinessKpi {
  return {
    id: partial.key,
    tenantId: "t",
    workspaceId: "w",
    name: partial.name ?? partial.key,
    value: partial.value ?? 1,
    category: "cash",
    unit: "count",
    target: null,
    warningThreshold: null,
    criticalThreshold: null,
    direction: "higher_is_better",
    measuredAt: "2026-08-18T09:00:00.000Z",
    sourceType: "demo",
    provenance: {},
    isDemo: true,
    createdAt: "2026-08-18T09:00:00.000Z",
    updatedAt: "2026-08-18T09:00:00.000Z",
    ...partial,
  };
}

function signal(partial: Partial<BusinessSignal> & { id: string; title: string }): BusinessSignal {
  return {
    tenantId: "t",
    workspaceId: "w",
    type: "test",
    severity: "warning",
    summary: "summary",
    sourceType: "demo",
    evidence: [{ sourceType: "kpi", sourceRef: "k", title: "KPI" }],
    provenance: { live: false },
    detectedAt: "2026-08-18T09:00:00.000Z",
    status: "open",
    isDemo: true,
    createdAt: "2026-08-18T09:00:00.000Z",
    updatedAt: "2026-08-18T09:00:00.000Z",
    ...partial,
  };
}

describe("rankSignals", () => {
  it("orders by severity, then impact, then recency", () => {
    const ranked = rankSignals([
      signal({ id: "old-warning", title: "old warning", severity: "warning", businessImpact: "high", detectedAt: "2026-08-01T00:00:00.000Z" }),
      signal({ id: "new-info", title: "new info", severity: "info", businessImpact: "critical", detectedAt: "2026-08-18T00:00:00.000Z" }),
      signal({ id: "critical-low", title: "critical low", severity: "critical", businessImpact: "low", detectedAt: "2026-08-10T00:00:00.000Z" }),
      signal({ id: "critical-high", title: "critical high", severity: "critical", businessImpact: "high", detectedAt: "2026-08-09T00:00:00.000Z" }),
    ]);
    expect(ranked.map((s) => s.id)).toEqual(["critical-high", "critical-low", "old-warning", "new-info"]);
  });
});

describe("buildDeterministicBrief", () => {
  it("summarises health, signals, KPIs, decisions and overdue actions without AI", () => {
    const kpis = [
      kpi({ key: "cash", status: "warning", name: "Cash runway" }),
      kpi({ key: "rev", status: "unknown", name: "Revenue", value: null }),
      kpi({ key: "ok", status: "healthy", name: "OK" }),
    ];
    const health = computeBusinessHealth(kpis, "2026-08-18T09:00:00.000Z");
    const brief = buildDeterministicBrief({
      health,
      kpis,
      signals: [
        signal({ id: "s1", title: "Cash runway warning", severity: "warning" }),
        signal({ id: "s2", title: "Resolved", status: "resolved", severity: "critical" }),
      ],
      decisions: [
        { id: "d1", tenantId: "t", workspaceId: "w", statement: "Hold spend", status: "pending", isDemo: true, createdAt: "", updatedAt: "" },
      ] as BusinessDecision[],
      actions: [
        { id: "a1", tenantId: "t", workspaceId: "w", title: "Collect invoices", status: "open", dueDate: "2020-01-01", priority: "high", completionEvidence: {}, isDemo: true, createdAt: "", updatedAt: "" },
      ] as BusinessAction[],
      generatedAt: "2026-08-18T09:00:00.000Z",
    });

    expect(brief.health.overallStatus).toBe(health.overallStatus);
    expect(brief.criticalSignals.map((s) => s.id)).toEqual(["s1"]);
    expect(brief.majorKpiChanges.map((k) => k.name)).toEqual(["Cash runway", "Revenue"]);
    expect(brief.pendingDecisions[0]?.statement).toBe("Hold spend");
    expect(brief.overdueOrBlockedActions[0]?.title).toBe("Collect invoices");
    expect(brief.containsDemoData).toBe(true);
    expect(brief.evidenceRefs.some((e) => e.sourceType === "signal")).toBe(true);
    expect(brief.domainSections).toEqual([]);

    const evidence = structuredBriefEvidence(brief);
    expect(evidence.kind).toBe("business_os.daily_brief.evidence");
    expect(evidence.instructions.join(" ")).toMatch(/do not invent/i);
    expect(evidence.instructions.join(" ")).not.toMatch(/chain-of-thought hidden/i);
  });

  it("adds a generic Finance domain section from KPI provenance, not hard-coded OCC finance logic", () => {
    const kpis = [
      kpi({
        key: "revenue",
        status: "warning",
        name: "Revenue",
        provenance: { domain: "finance" },
      }),
    ];
    const brief = buildDeterministicBrief({
      health: computeBusinessHealth(kpis, "2026-08-18T09:00:00.000Z"),
      kpis,
      signals: [],
      decisions: [],
      actions: [],
      generatedAt: "2026-08-18T09:00:00.000Z",
    });
    expect(brief.domainSections[0]?.id).toBe("finance");
    expect(brief.domainSections[0]?.lines.some((line) => line.includes("Revenue"))).toBe(true);
  });

  it("adds a generic Growth domain section from KPI provenance", () => {
    const kpis = [
      kpi({
        key: "total_pipeline",
        status: "warning",
        name: "Total pipeline",
        provenance: { domain: "growth" },
      }),
    ];
    const brief = buildDeterministicBrief({
      health: computeBusinessHealth(kpis, "2026-08-18T09:00:00.000Z"),
      kpis,
      signals: [],
      decisions: [],
      actions: [],
      generatedAt: "2026-08-18T09:00:00.000Z",
    });
    expect(brief.domainSections[0]?.id).toBe("growth");
    expect(brief.domainSections[0]?.title).toBe("Growth");
  });

  it("adds a generic Revenue domain section from KPI provenance", () => {
    const kpis = [
      kpi({
        key: "proposals_in_progress",
        status: "warning",
        name: "Proposals in progress",
        provenance: { domain: "revenue" },
      }),
    ];
    const brief = buildDeterministicBrief({
      health: computeBusinessHealth(kpis, "2026-08-18T09:00:00.000Z"),
      kpis,
      signals: [],
      decisions: [],
      actions: [],
      generatedAt: "2026-08-18T09:00:00.000Z",
    });
    expect(brief.domainSections[0]?.id).toBe("revenue");
    expect(brief.domainSections[0]?.title).toBe("Revenue");
  });
});
