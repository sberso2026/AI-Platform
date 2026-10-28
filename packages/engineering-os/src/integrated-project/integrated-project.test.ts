import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { runIntegratedDemonstration } from "./engine";

describe("EOS 2.14 integrated project demonstration", () => {
  const demo = runIntegratedDemonstration();

  it("carries one synthetic project through the governed stages and IFC", () => {
    expect(demo.projectId).toBe("EOS-IPF-001");
    expect(demo.stages).toEqual(["not_classified", "concept", "feasibility", "feed", "detailed_engineering"]);
    expect(demo.stage).toBe("detailed_engineering");
    expect(demo.disciplines).toHaveLength(8);
    expect(demo.conceptDecision).toMatch(/human selection/i);
    expect(demo.overrideRationale).toMatch(/inspection cycle/i);
    expect(demo.detailedFreezeBefore).toBe("NOT_READY");
    expect(demo.detailedFreezeBlocker).toBe("STALE_MODEL");
    expect(demo.detailedFreezeAfter).toBe("READY");
    expect(demo.ifcReleaseBlocked).toMatch(/review is incomplete/i);
    expect(demo.originalIfcRevision).toBe("1");
    expect(demo.revisedIfcRevision).toBe("2");
    expect(demo.originalIfcUnchanged).toBe(true);
    expect(demo.calculationFreshness).toBe("potentially_stale");
    expect(demo.recalculated).toBe(false);
    expect(demo.formulasChanged).toBe(false);
    expect(demo.requirementStatus).toBe("reverification_required");
    expect(demo.requirementEvidencePreserved).toBe("evidence-temp-1");
    expect(demo.unitComparison).toBe("COMPATIBLE_EQUIVALENT");
    expect(demo.coordinateCheck).toBe("COORDINATE_SYSTEM_MISMATCH");
    expect(demo.feedComparisonRevised).toEqual(["mass"]);
    expect(demo.impactDisposition).toBe("BASELINE_REVALIDATION_REQUIRED");
    expect(demo.baselineRewriteBlocked).toMatch(/not rewritten/i);
    expect(demo.leakCount).toBe(0);
    expect(demo.unauthorized.length).toBeGreaterThanOrEqual(4);
  });

  it("keeps AI advisory and scale evidence bounded", () => {
    expect(demo.counts).toEqual({ interfaces: 105, changes: 27, deliverables: 57, dependencyEdges: 250 });
    expect(demo.counts.deliverables).toBeGreaterThanOrEqual(50);
    expect(demo.counts.changes).toBeGreaterThanOrEqual(25);
    expect(demo.counts.dependencyEdges).toBeGreaterThanOrEqual(200);
    for (const answer of Object.values(demo.aiAnswers)) {
      expect(answer).toMatch(/HUMAN_DECISION_REQUIRED/);
      expect(answer).not.toMatch(/release is authorized|foundation is unsafe|formula/i);
    }
    expect(demo.aiAnswers.vendorRevision).toMatch(/DETERMINISTIC_DEPENDENCY/);
    expect(demo.auditActions).toEqual(expect.arrayContaining(["basis_override_recorded", "interface_superseded", "impact_discovery_run", "deliverable_released"]));
    expect(demo.projectControlEvents).toEqual(expect.arrayContaining(["interface_overdue", "impact_discovery_run"]));
    expect(readFileSync(new URL("./engine.ts", import.meta.url), "utf8")).not.toMatch(/system-evaluation|recordIacObjectIdentity/);
  });
});
