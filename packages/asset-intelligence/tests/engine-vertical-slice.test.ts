import { describe, expect, it } from "vitest";
import {
  AssetIntelligenceService,
  assertIiPublicContractConsumption,
  assertRegisteredActiveSource,
  composeAssetSnapshot,
  createAssetIntelligenceEngine,
  createDurableAssetIntelligenceMemoryStore,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  AssetIntelligenceRepository,
  deriveAdvisoryHealthIndex,
  getIntelligenceSource,
  HEALTH_INDEX_DEFAULT,
} from "../src/index";

describe("Phase 10B Asset Intelligence Engine vertical slice", () => {
  it("registers II public contracts and fails closed on unknown sources", () => {
    const check = assertIiPublicContractConsumption();
    expect(check.contractVersion).toBe("1.0.0");
    expect(check.contractIds).toContain("ii.asset.reference");
    expect(getIntelligenceSource("inspection_intelligence.public_contracts")?.status).toBe(
      "active",
    );
    expect(() => assertRegisteredActiveSource("not.a.source", "condition")).toThrow(
      /unregistered_intelligence_source/,
    );
    expect(() => assertRegisteredActiveSource("shm.signals", "condition")).toThrow(
      /inactive_intelligence_source/,
    );
  });

  it("orchestrates condition assess → health → timeline → snapshot without mutating identity", async () => {
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

    const result = await service.assessConditionFromInspection({
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

    expect(result.identityMutated).toBe(false);
    expect(result.identityOwner).toBe("engineering_os_shared_domain");
    expect(result.condition.conditionRating).toBe("fair");
    expect(result.condition.silentIdentityMutationForbidden).toBe(true);
    expect(result.healthIndex.status).toBe("advisory");
    expect(result.healthIndex.distinctFromConditionRating).toBe(true);
    expect(result.healthIndex.accuracyClaimsCertified).toBe(false);
    expect(result.snapshot.isAssetRegistry).toBe(false);
    expect(result.snapshot.identity.assetId).toBe("asset-1");
    expect(result.timelineEntries.length).toBe(2);

    const asOfSnap = await service.getSnapshot({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "asset-1",
      asOf: "2026-08-07T02:00:00.000Z",
    });
    expect(asOfSnap?.condition?.stateId).toBe(result.condition.stateId);
    expect(service.listTimeline("asset-1").length).toBe(2);
    expect(service.getHealthIndex("asset-1")?.stateId).toBe(result.healthIndex.stateId);

    const types = events.events.map((e) => e.type);
    expect(types).toContain("engineering.asset.condition.updated");
    expect(types).toContain("engineering.asset.health_index.updated");
    expect(types).toContain("engineering.asset.intelligence_timeline.appended");
    expect(events.events.every((e) => e.payload.rawEvidenceForbidden)).toBe(true);
  });

  it("abstains health index when evidence is insufficient", () => {
    const health = deriveAdvisoryHealthIndex({
      assetId: "a",
      stateId: "h1",
      recordedAt: "2026-08-07T00:00:00.000Z",
      provenance: { sourceSystem: "test", observedAt: "2026-08-07T00:00:00.000Z" },
    });
    expect(health.status).toBe("unavailable");
    expect(health.healthMethod).toBe("abstain_insufficient_evidence");
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
    expect(snap.contributions).toEqual([]);
  });
});
