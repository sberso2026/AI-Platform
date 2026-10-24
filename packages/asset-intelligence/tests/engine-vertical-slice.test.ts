import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceService,
  assertIiPublicContractConsumption,
  assertRegisteredActiveSource,
  composeAssetSnapshot,
  createAssetIntelligenceEngine,
  createDurableAssetIntelligenceMemoryStore,
  createHealthCompositionEngine,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  AssetIntelligenceRepository,
  deriveAdvisoryHealthIndex,
  getIntelligenceSource,
  HEALTH_INDEX_DEFAULT,
} from "../src/index";

describe("Phase 10C Asset Intelligence criticality + Health Composition Engine", () => {
  it("registers II public contracts and criticality sources", () => {
    const check = assertIiPublicContractConsumption();
    expect(check.contractVersion).toBe("1.0.0");
    expect(getIntelligenceSource("manual.engineering_assessment")?.status).toBe("active");
    expect(() => assertRegisteredActiveSource("not.a.source", "criticality")).toThrow(
      /unregistered_intelligence_source/,
    );
  });

  it("keeps Health Index model free of composition scoring exports", async () => {
    const healthIndexModule = await import("../src/domain/health-index.js");
    expect(typeof healthIndexModule.mapConditionRatingToIndex).toBe("function");
    expect(healthIndexModule.HEALTH_INDEX_DEFAULT.distinctFromCriticalityRating).toBe(true);
    // Composition lives on HealthCompositionEngine, not Health Index defaults.
    expect((healthIndexModule as Record<string, unknown>).HealthCompositionEngine).toBeUndefined();
  });

  it("orchestrates condition + criticality through Health Composition Engine", async () => {
    const identity = {
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      owner: "engineering_os_shared_domain" as const,
    };
    const store = createDurableAssetIntelligenceMemoryStore();
    const repo = new AssetIntelligenceRepository(store);
    const events = createInProcessAssetIntelligenceEventPipeline();
    const composer = createHealthCompositionEngine();
    const engine = createAssetIntelligenceEngine({
      identityPort: createInMemorySharedDomainIdentityPort([identity]),
      repository: repo,
      events,
      healthComposer: composer,
    });
    const service = new AssetIntelligenceService(engine);

    const condition = await service.assessConditionFromInspection({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      ii: {
        assetReference: {
          identity: { tenantId: "t1", workspaceId: "w1", assetId: "asset-1" },
        },
        conditionRating: "fair",
        conditionIndex: 0.55,
        conditionConfidence: 0.8,
        conditionTrend: "stable",
        observedAt: "2026-08-07T01:00:00.000Z",
        evidenceRefs: ["ii.evidenceRef:e1"],
        conditionRatingId: "cr-1",
        sessionId: "sess-1",
      },
      recordedAt: "2026-08-07T02:00:00.000Z",
    });

    expect(condition.healthComposedBy).toBe("health_composition_engine");
    expect(condition.healthIndex.composedBy).toBe("health_composition_engine");
    expect(condition.healthIndex.factorsUsed).toContain("condition");

    const criticality = await service.assessCriticality({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      criticalityRating: "high",
      safetyCriticality: "high",
      productionCriticality: "medium",
      criticalityConfidence: 0.85,
      evidenceRefs: ["eng.assessment:a1"],
      observedAt: "2026-08-07T02:10:00.000Z",
      recordedAt: "2026-08-07T02:15:00.000Z",
      startReview: true,
    });

    expect(criticality.identityMutated).toBe(false);
    expect(criticality.criticality.criticalityRating).toBe("high");
    expect(criticality.criticality.reviewStatus).toBe("pending_review");
    expect(criticality.reviewInstanceId).toBeTruthy();
    expect(criticality.healthComposedBy).toBe("health_composition_engine");
    expect(criticality.healthIndex.factorsUsed ?? []).not.toContain("criticality");
    expect(criticality.healthIndex.healthMethod).toBe("compose_condition_reliability_v2");
    expect(criticality.healthIndex.distinctFromCriticalityRating).toBe(true);
    expect(criticality.healthIndex.accuracyClaimsCertified).toBe(false);

    const approved = await service.reviewCriticality({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      criticalityStateId: criticality.criticality.stateId,
      workflowInstance: criticality.reviewWorkflowInstance!,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      recordedAt: "2026-08-07T02:30:00.000Z",
    });
    expect(approved.criticality.reviewStatus).toBe("approved");
    expect(approved.criticality.status).toBe("published");
    expect(approved.healthComposedBy).toBe("health_composition_engine");

    expect((await service.getCriticality("t1", "w1", "asset-1"))?.criticalityRating).toBe("high");
    expect((await service.getHealthIndex("t1", "w1", "asset-1"))?.composedBy).toBe(
      "health_composition_engine",
    );

    const types = events.events.map((e) => e.type);
    expect(types).toContain("engineering.asset.criticality.updated");
    expect(types).toContain("engineering.asset.criticality.reviewed");
    expect(types).toContain("engineering.asset.health_index.updated");
  });

  it("abstains health composition when evidence is insufficient", () => {
    const health = deriveAdvisoryHealthIndex({
      assetId: "a",
      stateId: "h1",
      recordedAt: "2026-08-07T00:00:00.000Z",
      provenance: { sourceSystem: "test", observedAt: "2026-08-07T00:00:00.000Z" },
    });
    expect(health.status).toBe("unavailable");
    expect(health.healthMethod).toBe("abstain_insufficient_evidence");
    expect(health.composedBy).toBe("health_composition_engine");
    expect(HEALTH_INDEX_DEFAULT.rulClaimsCertified).toBe(false);
  });

  it("composes snapshot without registry semantics", () => {
    const snap = composeAssetSnapshot({
      identity: {
        tenantId: "t",
        workspaceId: "w",
        assetId: "a",
        owner: "engineering_os_shared_domain",
      },
      asOf: "2026-08-07T00:00:00.000Z",
    });
    expect(snap.isAssetRegistry).toBe(false);
    expect(snap.mutatesIdentity).toBe(false);
  });
});
