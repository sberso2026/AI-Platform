import { describe, expect, it } from "vitest";
import {
  INSPECTION_INTELLIGENCE_VERSION,
  INSPECTION_MOBILE_PRODUCT_IMPLEMENTED,
  INSPECTION_OFFLINE_SYNC_IMPLEMENTED,
  INSPECTION_CONDITION_RATING_IMPLEMENTED,
  INSPECTION_PREDICTIVE_SIGNALS_SCAFFOLDED,
  INSPECTION_PACK_EXPANSION_IMPLEMENTED,
  INSPECTION_PREDICTIVE_IMPLEMENTED,
  INSPECTION_AI_VISION_IMPLEMENTED,
  getInspectionIntelligenceDomainDeclaration,
  runConditionPredictiveHappyPath,
  STRUCTURAL_CONDITION_PACK_SDK,
  executeMlProviderReserved,
  aggregateComponentRatings,
  createObservedConditionRating,
  STRUCTURAL_ORDINAL_SCHEME_V1,
} from "../src";

describe("Phase 9H condition rating and predictive signals", () => {
  it("locks condition/predictive identity without AI Vision or Twin ownership", () => {
    expect(INSPECTION_INTELLIGENCE_VERSION).toBe("0.8.0-condition-predictive");
    expect(INSPECTION_MOBILE_PRODUCT_IMPLEMENTED).toBe(true);
    expect(INSPECTION_OFFLINE_SYNC_IMPLEMENTED).toBe(true);
    expect(INSPECTION_CONDITION_RATING_IMPLEMENTED).toBe(true);
    expect(INSPECTION_PREDICTIVE_SIGNALS_SCAFFOLDED).toBe(true);
    expect(INSPECTION_PACK_EXPANSION_IMPLEMENTED).toBe(true);
    expect(INSPECTION_PREDICTIVE_IMPLEMENTED).toBe(false);
    expect(INSPECTION_AI_VISION_IMPLEMENTED).toBe(false);
    const decl = getInspectionIntelligenceDomainDeclaration();
    expect(decl.conditionRatingImplemented).toBe(true);
    expect(decl.predictiveSignalsScaffolded).toBe(true);
    expect(decl.assetOwnership).toBe("engineering_os_shared_domain");
  });

  it("certifies structural pack expansion", () => {
    expect(STRUCTURAL_CONDITION_PACK_SDK.packId).toBe("structural_condition");
    expect(STRUCTURAL_CONDITION_PACK_SDK.featureFlags.conditionRating).toBe(true);
    expect(STRUCTURAL_CONDITION_PACK_SDK.featureFlags.offlineCompatible).toBe(true);
    expect(STRUCTURAL_CONDITION_PACK_SDK.featureFlags.aiVision).toBe(false);
  });

  it("runs condition → override → publish → aggregate → predictive → reporting", async () => {
    const result = await runConditionPredictiveHappyPath({
      tenantId: "t1",
      workspaceId: "w1",
      sessionId: "s1",
      assessorUserId: "u1",
      authorityUserId: "u2",
      targetRef: "structure:bridge-1",
    });
    expect(result.conditionRatingImplemented).toBe(true);
    expect(result.predictiveSignalsScaffolded).toBe(true);
    expect(result.packExpansionImplemented).toBe(true);
    expect(result.ratings[0]?.overrides[0]?.previousValue.ordinalCode).toBe("3");
    expect(result.ratings[0]?.published?.layer).toBe("published");
    expect(result.aggregation.abstained).toBe(false);
    expect(result.signals.every((s) => s.advisory && !s.claimsRemainingUsefulLife)).toBe(true);
    expect(result.mlAbstention.abstained).toBe(true);
    expect(result.reportingOutputs.some((o) => o.kind === "condition_rating_snapshot")).toBe(true);
    expect(result.conditionEvents.some((e) => e.type.includes("condition"))).toBe(true);
    expect(result.operationalHardeningChecks.overridePreservesHistory).toBe(true);

    const ml = executeMlProviderReserved({
      tenantId: "t1",
      workspaceId: "w1",
      targetRef: "x",
    });
    expect(ml.claimsProductionMlAccuracy).toBe(false);

    expect(() =>
      createObservedConditionRating({
        tenantId: "t1",
        workspaceId: "w1",
        sessionId: "s1",
        componentScope: "x",
        inspectionScope: "y",
        observationIds: [],
        scheme: STRUCTURAL_ORDINAL_SCHEME_V1,
        ordinalCode: "2",
        confidence: 0.1,
        uncertainty: 0.9,
        evidenceSufficiency: "abstain",
        assessorUserId: "u1",
        packId: "structural_condition",
      }),
    ).toThrow(/abstain/);

    const emptyAgg = aggregateComponentRatings({
      ratings: [],
      weighting: { weightingId: "w", version: "1", weights: {} },
      requiredComponents: ["girder"],
    });
    expect(emptyAgg.abstained).toBe(true);
  });
});
