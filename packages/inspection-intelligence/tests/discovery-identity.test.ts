import { describe, expect, it } from "vitest";
import {
  INSPECTION_PRODUCT_FEATURES_IMPLEMENTED,
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_AI_VISION_IMPLEMENTED,
  INSPECTION_VERTICAL_SLICE_READY,
  getInspectionIntelligenceSliceDeclaration,
} from "../src/version";
import {
  AI_VISION_EXTENSION_RESERVED,
  GENERIC_INSPECTION_PACK,
  MOBILE_CERTIFICATION_PLACEHOLDERS,
  PREDICTIVE_INSPECTION_RESERVED,
  createMeasurementEngine,
  InspectionPackRegistry,
} from "../src/architecture";
import { runVerticalSliceHappyPath } from "../src/domain/vertical-slice";

describe("Phase 9B architectural reservations", () => {
  it("locks slice identity without AI Vision / Asset Intelligence / predictive / mobile products", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.2.0-vertical-slice");
    expect(INSPECTION_PRODUCT_FEATURES_IMPLEMENTED).toBe(true);
    expect(INSPECTION_VERTICAL_SLICE_READY).toBe(true);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(false);
    const decl = getInspectionIntelligenceSliceDeclaration();
    expect(decl.couplesVia).toBe("inspection_target");
    expect(decl.assetOwnership).toBe("engineering_os_shared_domain");
    expect(AI_VISION_EXTENSION_RESERVED).toBe(true);
    expect(PREDICTIVE_INSPECTION_RESERVED).toBe(true);
    expect(MOBILE_CERTIFICATION_PLACEHOLDERS).toHaveLength(5);
  });

  it("registers generic pack and measurement engine", () => {
    const registry = new InspectionPackRegistry();
    expect(registry.get("generic")?.packId).toBe(GENERIC_INSPECTION_PACK.packId);
    const engine = createMeasurementEngine();
    expect(engine.reservedTrends).toBe(true);
    const result = engine.evaluate(
      {
        measurementType: "gap",
        observedValue: 5,
        expectedValue: 5,
        source: "human",
        observedAt: new Date().toISOString(),
      },
      { mode: "tolerance", tolerance: { absolute: 1 } },
    );
    expect(result.status).toBe("pass");
  });

  it("runs vertical slice happy path with immutable evidence and review", () => {
    const store = runVerticalSliceHappyPath({
      tenantId: "t1",
      workspaceId: "w1",
    });
    expect(store.templates).toHaveLength(1);
    expect(store.plans[0]?.targets[0]?.kind).toBe("asset");
    expect(store.sessions[0]?.status).toBe("reviewed");
    expect(store.evidence[0]?.immutable).toBe(true);
    expect(store.evidence[0]?.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(store.events.some((e) => e.type === "inspection.review.completed")).toBe(true);
    expect(store.events[0]?.fanout).toContain("knowledge_graph");
  });
});
