import { describe, expect, it } from "vitest";
import {
  ASSET_INTELLIGENCE_VERSION,
  LIFECYCLE_CONTEXT_ENGINE_READY,
  LIFECYCLE_TAXONOMY_REGISTRY_READY,
  LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  RUL_CLAIMS_CERTIFIED,
  AssetIntelligenceRepository,
  assertOwnershipLock,
  createAssetIntelligenceEngine,
  createAssetLifecycleReference,
  createDurableAssetIntelligenceMemoryStore,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  createLifecycleContextEngine,
  startLifecycleReview,
} from "../src/index";

describe("Phase 10G lifecycle context intelligence", () => {
  it("locks version and readiness flags", () => {
    expect(["0.8.0-risk-priority", "0.9.0-fusion-readiness", "0.10.0-predictive-governance"]).toContain(ASSET_INTELLIGENCE_VERSION);
    expect(LIFECYCLE_CONTEXT_ENGINE_READY).toBe(true);
    expect(LIFECYCLE_TAXONOMY_REGISTRY_READY).toBe(true);
    expect(LIFECYCLE_HEALTH_CONTRIBUTION_ENABLED).toBe(false);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(RUL_CLAIMS_CERTIFIED).toBe(false);
    expect(assertOwnershipLock().assetIdentityOwnership).toBe(
      "engineering_os_shared_domain",
    );
  });

  it("composes lifecycle context from published slices without mutating canonical lifecycle", () => {
    const engine = createLifecycleContextEngine();
    const canonicalLifecycle = createAssetLifecycleReference({
      assetId: "a1",
      canonicalLifecycleStage: "operation",
      stageVersion: 3,
      effectiveAt: "2020-01-01T00:00:00.000Z",
    });
    const result = engine.compose({
      assetId: "a1",
      recordedAt: "2026-08-07T05:00:00.000Z",
      provenance: {
        sourceSystem: "manual.engineering_assessment",
        observedAt: "2026-08-07T05:00:00.000Z",
      },
      canonicalLifecycle,
      condition: { stateId: "cond1", reviewStatus: "published", rating: "fair" },
      reliability: { stateId: "rel1", reviewStatus: "published", rating: "moderate" },
      criticality: { stateId: "crit1", reviewStatus: "published", rating: "high" },
      failures: [{ stateId: "fm1", reviewStatus: "published", code: "FM.CORROSION" }],
      trends: [{ stateId: "trend1", reviewStatus: "published", direction: "degrading" }],
      degradations: [
        { stateId: "deg1", reviewStatus: "published", direction: "degrading" },
      ],
    });
    expect(result.lifecycle.mutatesCanonicalLifecycle).toBe(false);
    expect(result.lifecycle.canonicalLifecycleRef.writeBackForbidden).toBe(true);
    expect(result.lifecycle.lifecycleContextClass).toBe("degradation_attention");
    expect(result.abstained).toBe(false);
    expect(result.transitionCandidates[0]?.mutatesCanonicalLifecycle).toBe(false);
  });

  it("persists governed lifecycle assessment and review without mutating canonical lifecycle or health", async () => {
    const store = createDurableAssetIntelligenceMemoryStore();
    const repository = new AssetIntelligenceRepository(store);
    const engine = createAssetIntelligenceEngine({
      identityPort: createInMemorySharedDomainIdentityPort([
        {
          tenantId: "t1",
          workspaceId: "w1",
          assetId: "a1",
          owner: "engineering_os_shared_domain",
        },
      ]),
      repository,
      events: createInProcessAssetIntelligenceEventPipeline(),
    });

    const canonicalLifecycle = createAssetLifecycleReference({
      assetId: "a1",
      canonicalLifecycleStage: "operation",
      stageVersion: 2,
      effectiveAt: "2020-01-01T00:00:00.000Z",
    });

    const result = await engine.assessLifecycle({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      canonicalLifecycle,
      evidenceRefs: ["e1", "e2"],
      actorRole: "engineer",
      idempotencyKey: "life-1",
    });

    expect(result.identityMutated).toBe(false);
    expect(result.healthMutated).toBe(false);
    expect(result.mutatesCanonicalLifecycle).toBe(false);
    expect(result.lifecycle.mutatesCanonicalLifecycle).toBe(false);
    expect(result.lifecycle.version).toBe(1);

    const replay = await engine.assessLifecycle({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      canonicalLifecycle,
      evidenceRefs: ["e1", "e2"],
      actorRole: "engineer",
      idempotencyKey: "life-1",
    });
    expect(replay.idempotentReplay).toBe(true);

    await expect(
      engine.assessLifecycle({
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        canonicalLifecycle,
        expectedCanonicalLifecycleVersion: 999,
        actorRole: "engineer",
      }),
    ).rejects.toThrow("canonical_lifecycle_version_conflict");

    const review = startLifecycleReview({
      tenantId: "t1",
      workspaceId: "w1",
      lifecycleStateId: result.lifecycle.stateId,
    });
    const published = await engine.reviewLifecycle({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      lifecycleStateId: result.lifecycle.stateId,
      workflowInstance: review.instance,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      publish: true,
      actorRole: "reviewer",
    });
    expect(published.lifecycle.reviewStatus).toBe("published");
    expect(published.healthMutated).toBe(false);

    await expect(
      engine.reviewLifecycle({
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        lifecycleStateId: published.lifecycle.stateId,
        workflowInstance: review.instance,
        action: "approve",
        to: "approved",
        reviewerId: "reviewer-1",
        actorRole: "reviewer",
      }),
    ).rejects.toThrow("published_lifecycle_immutable");
  });
});
