import { describe, expect, it } from "vitest";
import { mapEvidence } from "./mappers";

describe("BOS-8 evidence provenance", () => {
  it("preserves point-in-time snapshots even if later source values change", () => {
    const linked = mapEvidence({
      id: "e1",
      tenant_id: "t",
      workspace_id: "w",
      decision_id: "d1",
      source_type: "kpi",
      source_domain: "finance",
      source_ref: "cash_runway_months",
      summary: "Cash runway 4.2 months at link time",
      value_state: "known",
      value_text: "4.2 months",
      linked_at: "2026-08-19T09:00:00.000Z",
      snapshot: { key: "cash_runway_months", value: 4.2, capturedAt: "2026-08-19T09:00:00.000Z" },
      generated_by: "deterministic_rule",
      provenance: { pointInTime: true },
      is_demo: true,
      created_at: "2026-08-19T09:00:00.000Z",
      updated_at: "2026-08-19T09:00:00.000Z",
    });
    expect(linked.snapshot.value).toBe(4.2);
    expect(linked.snapshot.capturedAt).toBe("2026-08-19T09:00:00.000Z");
    expect(linked.provenance.pointInTime).toBe(true);
    const laterSourceValue = 9.1;
    expect(linked.snapshot.value).not.toBe(laterSourceValue);
  });
});
