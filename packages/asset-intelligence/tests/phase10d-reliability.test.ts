import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceService,
  assertOwnershipLock,
  ASSET_INTELLIGENCE_VERSION,
  CRITICALITY_IS_HEALTH_FACTOR,
  CORE_RELIABILITY_SLICE_READY,
  createAssetIntelligenceEngine,
  createDurableAssetIntelligenceMemoryStore,
  createEvidenceConfidenceEngine,
  createHealthCompositionEngine,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  AssetIntelligenceRepository,
  DEFAULT_HEALTH_COMPOSITION_METHOD,
  EVIDENCE_CONFIDENCE_ENGINE_READY,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  QUANTITATIVE_RELIABILITY_CERTIFIED,
  PHASE_10C_CERTIFIED_COMMIT,
} from "../src/index";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Phase 10D reliability + health semantics", () => {
  it("locks versioned health semantics and claim flags", () => {
    expect(["0.8.0-risk-priority", "0.9.0-fusion-readiness", "0.10.0-predictive-governance"]).toContain(ASSET_INTELLIGENCE_VERSION);
    expect(CRITICALITY_IS_HEALTH_FACTOR).toBe(false);
    expect(CORE_RELIABILITY_SLICE_READY).toBe(true);
    expect(EVIDENCE_CONFIDENCE_ENGINE_READY).toBe(true);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(QUANTITATIVE_RELIABILITY_CERTIFIED).toBe(false);
    expect(DEFAULT_HEALTH_COMPOSITION_METHOD).toBe("compose_condition_reliability_v2");
    expect(PHASE_10C_CERTIFIED_COMMIT).toBe("10b0259134995f55bfe889dba2386edd653d9c2b");
    expect(assertOwnershipLock().assetIdentityOwnership).toBe("engineering_os_shared_domain");
  });

  it("keeps scoring out of health-index.ts", () => {
    const src = readFileSync(
      resolve(__dirname, "../src/domain/health-index.ts"),
      "utf8",
    );
    expect(src).not.toMatch(/compose_condition_criticality/);
    expect(src).not.toMatch(/compose_condition_reliability/);
    expect(src).not.toMatch(/class HealthCompositionEngine/);
  });

  it("preserves v1 composition and defaults to v2 without criticality as health factor", () => {
    const composer = createHealthCompositionEngine();
    const v1 = composer.compose({
      assetId: "a1",
      stateId: "h1",
      recordedAt: "2026-08-07T03:00:00.000Z",
      provenance: {
        sourceSystem: "test",
        observedAt: "2026-08-07T03:00:00.000Z",
        evidenceRefs: ["e1", "e2", "e3"],
      },
      compositionMethod: "compose_condition_criticality_v1",
      sourceKeys: ["manual.engineering_assessment"],
      condition: { rating: "good", index: 0.8, stateId: "c1", evidenceRefs: ["e1"] },
      criticality: { rating: "high", stateId: "k1" },
    });
    expect(v1.healthIndex.healthMethod).toMatch(/compose_condition_criticality_v1|compose_from_condition/);
    expect(v1.healthProfile.limitations).toEqual(
      expect.arrayContaining(["historical_composition_v1"]),
    );

    const v2 = composer.compose({
      assetId: "a1",
      tenantId: "t1",
      workspaceId: "w1",
      stateId: "h2",
      recordedAt: "2026-08-07T03:00:00.000Z",
      provenance: {
        sourceSystem: "test",
        observedAt: "2026-08-07T03:00:00.000Z",
        evidenceRefs: ["e1", "e2", "e3"],
      },
      sourceKeys: ["manual.engineering_assessment"],
      condition: { rating: "good", index: 0.8, stateId: "c1", evidenceRefs: ["e1", "e2"] },
      criticality: { rating: "extreme", stateId: "k1" },
      reliability: {
        rating: "high",
        continuity: 0.9,
        stateId: "r1",
        evidenceSufficient: true,
        evidenceRefs: ["e3"],
      },
      evidenceConfidence: createEvidenceConfidenceEngine().assess({
        assessmentId: "ec1",
        assetId: "a1",
        evidenceRefs: ["e1", "e2", "e3"],
        sourceKeys: ["manual.engineering_assessment"],
        observedAt: "2026-08-07T03:00:00.000Z",
        asOf: "2026-08-07T03:00:00.000Z",
      }),
    });
    expect(v2.healthIndex.healthMethod).toBe("compose_condition_reliability_v2");
    expect(v2.healthIndex.factorsUsed).toEqual(
      expect.arrayContaining(["condition", "reliability"]),
    );
    expect(v2.healthIndex.factorsUsed).not.toContain("criticality");
    expect(v2.healthProfile.criticalityIsHealthFactor).toBe(false);
    expect(v2.healthProfile.criticalityContext?.isHealthFactor).toBe(false);
  });

  it("assesses reliability through Evidence Confidence and Health Composition Engine", async () => {
    const identity = {
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      owner: "engineering_os_shared_domain" as const,
    };
    const store = createDurableAssetIntelligenceMemoryStore();
    const repo = new AssetIntelligenceRepository(store);
    const events = createInProcessAssetIntelligenceEventPipeline();
    const engine = createAssetIntelligenceEngine({
      identityPort: createInMemorySharedDomainIdentityPort([identity]),
      repository: repo,
      events,
    });
    const service = new AssetIntelligenceService(engine);

    await service.assessConditionFromInspection({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      ii: {
        assetReference: {
          identity: { tenantId: "t1", workspaceId: "w1", assetId: "asset-1" },
        },
        conditionRating: "good",
        conditionIndex: 0.8,
        conditionConfidence: 0.9,
        observedAt: "2026-08-07T01:00:00.000Z",
        evidenceRefs: ["ii.evidenceRef:e1", "ii.evidenceRef:e2"],
      },
      recordedAt: "2026-08-07T02:00:00.000Z",
    });

    const criticality = await service.assessCriticality({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      criticalityRating: "high",
      evidenceRefs: ["eng.assessment:a1"],
      recordedAt: "2026-08-07T02:10:00.000Z",
      startReview: false,
    });
    expect(criticality.healthIndex.healthMethod).toBe("compose_condition_reliability_v2");
    // Criticality alone does not become a health scoring factor in v2.
    expect(criticality.healthIndex.factorsUsed ?? []).not.toContain("criticality");

    const reliability = await engine.assessReliability({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      assessmentType: "qualitative",
      reliabilityClass: "high",
      evidenceRefs: ["eng.rel:r1", "eng.rel:r2"],
      inspectionRefs: ["ii.evidenceRef:e1"],
      recordedAt: "2026-08-07T02:20:00.000Z",
      startReview: true,
    });
    expect(reliability.identityMutated).toBe(false);
    expect(reliability.reliability.assessmentType).toBe("qualitative");
    expect(reliability.reliability.reliabilityScore).toBeUndefined();
    expect(reliability.reliability.quantitativeReliabilityCertified).toBe(false);
    expect(reliability.evidenceConfidence.method).toBe("evidence_confidence_v1");
    expect(reliability.healthIndex.healthMethod).toBe("compose_condition_reliability_v2");
    expect(reliability.healthIndex.factorsUsed).toEqual(
      expect.arrayContaining(["condition", "reliability"]),
    );
    expect(reliability.healthComposedBy).toBe("health_composition_engine");

    const abstain = createEvidenceConfidenceEngine().assess({
      assessmentId: "ec-empty",
      assetId: "asset-1",
      evidenceRefs: [],
    });
    expect(abstain.dataSufficiency).toBe("insufficient");
  });
});
