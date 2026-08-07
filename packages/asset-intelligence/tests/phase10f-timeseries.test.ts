import { describe, expect, it } from "vitest";
import {
  ASSET_INTELLIGENCE_VERSION,
  CHANGE_DETECTION_ENGINE_READY,
  DEGRADATION_ANALYSIS_READY,
  DEGRADATION_HEALTH_CONTRIBUTION_ENABLED,
  ENGINEERING_TIME_SERIES_READY,
  PHASE_10E_CERTIFIED_COMMIT,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  RUL_CLAIMS_CERTIFIED,
  TREND_CONFIDENCE_ENGINE_READY,
  TREND_INTELLIGENCE_READY,
  AssetIntelligenceRepository,
  assertOwnershipLock,
  createAssetIntelligenceEngine,
  createAssetTrendIntelligenceEngine,
  createChangeDetectionEngine,
  createDurableAssetIntelligenceMemoryStore,
  createEngineeringTimeSeries,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  createTrendConfidenceEngine,
  startDegradationReview,
} from "../src/index";

describe("Phase 10F time series / trend / degradation", () => {
  it("locks version and readiness flags", () => {
    expect(ASSET_INTELLIGENCE_VERSION).toBe("0.7.0-lifecycle");
    expect(ENGINEERING_TIME_SERIES_READY).toBe(true);
    expect(CHANGE_DETECTION_ENGINE_READY).toBe(true);
    expect(TREND_CONFIDENCE_ENGINE_READY).toBe(true);
    expect(TREND_INTELLIGENCE_READY).toBe(true);
    expect(DEGRADATION_ANALYSIS_READY).toBe(true);
    expect(DEGRADATION_HEALTH_CONTRIBUTION_ENABLED).toBe(false);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(RUL_CLAIMS_CERTIFIED).toBe(false);
    expect(PHASE_10E_CERTIFIED_COMMIT).toBe(
      "ed127cd85901f8053d09155f7c4053f0b22b8a5f",
    );
    expect(assertOwnershipLock().assetIdentityOwnership).toBe(
      "engineering_os_shared_domain",
    );
  });

  it("builds engineering time series without becoming a sensor registry", () => {
    const series = createEngineeringTimeSeries({
      seriesId: "s1",
      assetId: "a1",
      recordedAt: "2026-08-07T05:00:00.000Z",
      provenance: {
        sourceSystem: "manual.engineering_assessment",
        observedAt: "2026-08-07T05:00:00.000Z",
      },
      attributeKey: "wall_thickness",
      unit: "mm",
      orientation: "decreasing_worse",
      points: [
        { observedAt: "2026-01-01T00:00:00.000Z", value: 12 },
        { observedAt: "2026-03-01T00:00:00.000Z", value: 11.2 },
        { observedAt: "2026-06-01T00:00:00.000Z", value: 10.1 },
      ],
    });
    expect(series.isSensorRegistry).toBe(false);
    expect(series.isShmRuntime).toBe(false);
    expect(series.points).toHaveLength(3);
  });

  it("abstains change detection and trend when points are insufficient", () => {
    const series = createEngineeringTimeSeries({
      seriesId: "s2",
      assetId: "a1",
      recordedAt: "2026-08-07T05:00:00.000Z",
      provenance: {
        sourceSystem: "manual.engineering_assessment",
        observedAt: "2026-08-07T05:00:00.000Z",
      },
      attributeKey: "vibration_rms",
      unit: "mm/s",
      points: [{ observedAt: "2026-06-01T00:00:00.000Z", value: 1 }],
    });
    const tc = createTrendConfidenceEngine().assess({
      assessmentId: "tc1",
      assetId: "a1",
      pointCount: 1,
      asOf: "2026-08-07T05:00:00.000Z",
    });
    expect(tc.dataSufficiency).toBe("insufficient");
    const cd = createChangeDetectionEngine().detect({
      detectionId: "cd1",
      series,
      assessedAt: "2026-08-07T05:00:00.000Z",
      trendConfidence: tc,
    });
    expect(cd.abstained).toBe(true);
    expect(cd.predictiveMlUsed).toBe(false);
  });

  it("produces degrading trend distinct from failure mode claims", () => {
    const series = createEngineeringTimeSeries({
      seriesId: "s3",
      assetId: "a1",
      recordedAt: "2026-08-07T05:00:00.000Z",
      provenance: {
        sourceSystem: "manual.engineering_assessment",
        observedAt: "2026-08-07T05:00:00.000Z",
        evidenceRefs: ["e1", "e2", "e3"],
      },
      attributeKey: "crack_length",
      unit: "mm",
      orientation: "increasing_worse",
      points: [
        { observedAt: "2026-01-01T00:00:00.000Z", value: 1 },
        { observedAt: "2026-02-01T00:00:00.000Z", value: 1.4 },
        { observedAt: "2026-03-01T00:00:00.000Z", value: 2.1 },
        { observedAt: "2026-04-01T00:00:00.000Z", value: 2.8 },
        { observedAt: "2026-05-01T00:00:00.000Z", value: 3.5 },
      ],
      evidenceRefs: ["e1", "e2", "e3"],
    });
    const bundle = createAssetTrendIntelligenceEngine().assess({
      assetId: "a1",
      recordedAt: "2026-08-07T05:00:00.000Z",
      provenance: series.provenance,
      series,
      evidenceRefs: ["e1", "e2", "e3"],
    });
    expect(bundle.abstained).toBe(false);
    expect(bundle.trend.trendDirection).toBe("degrading");
    expect(bundle.degradation.isFailureModeClaim).toBe(false);
    expect(bundle.degradation.rulClaimsCertified).toBe(false);
    expect(bundle.changeDetection.method).toBe("change_detection_heuristic_v1");
  });

  it("persists governed degradation without mutating health", async () => {
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

    const result = await engine.assessDegradation({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      attributeKey: "wall_thickness",
      unit: "mm",
      orientation: "decreasing_worse",
      points: [
        { observedAt: "2026-01-01T00:00:00.000Z", value: 12 },
        { observedAt: "2026-02-01T00:00:00.000Z", value: 11.5 },
        { observedAt: "2026-03-01T00:00:00.000Z", value: 11 },
        { observedAt: "2026-04-01T00:00:00.000Z", value: 10.4 },
        { observedAt: "2026-05-01T00:00:00.000Z", value: 9.8 },
      ],
      evidenceRefs: ["e1", "e2", "e3"],
      actorRole: "engineer",
      idempotencyKey: "deg-1",
    });
    expect(result.healthMutated).toBe(false);
    expect(result.degradationHealthContributionEnabled).toBe(false);
    expect(result.predictiveMlUsed).toBe(false);
    expect(result.degradation.version).toBe(1);

    const replay = await engine.assessDegradation({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      attributeKey: "wall_thickness",
      unit: "mm",
      points: result.bundle.series.points,
      evidenceRefs: ["e1", "e2", "e3"],
      actorRole: "engineer",
      idempotencyKey: "deg-1",
    });
    expect(replay.idempotentReplay).toBe(true);

    const review = startDegradationReview({
      tenantId: "t1",
      workspaceId: "w1",
      degradationStateId: result.degradation.stateId,
    });
    const published = await engine.reviewDegradation({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      degradationStateId: result.degradation.stateId,
      workflowInstance: review.instance,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      publish: true,
      actorRole: "reviewer",
    });
    expect(published.degradation.reviewStatus).toBe("published");
    expect(published.healthMutated).toBe(false);
  });
});
