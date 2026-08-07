import { describe, expect, it } from "vitest";
import {
  ASSET_FUSION_OWNERSHIP,
  ASSET_INTELLIGENCE_VERSION,
  AssetIntelligenceRepository,
  FUSION_HEALTH_CONTRIBUTION_ENABLED,
  MULTI_SOURCE_FUSION_READY,
  PREDICTIVE_METHODS_CERTIFIED,
  PREDICTIVE_ML_ENABLED,
  PREDICTIVE_READINESS_ASSESSOR_READY,
  PHASE_10H_CERTIFIED_COMMIT,
  PHASE_10H_HOSTED_RUN,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  RUL_CLAIMS_CERTIFIED,
  SOURCE_RECONCILIATION_ENGINE_READY,
  assertFailureCapability,
  assertRegisteredActiveSource,
  createAssetIntelligenceEngine,
  createDurableAssetIntelligenceMemoryStore,
  createEvidenceConfidenceEngine,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  createMultiSourceFusionEngine,
  createPredictiveReadinessAssessor,
  createSourceReconciliationEngine,
  startFusionReview,
  type EvidenceConfidenceAssessment,
  type FusionSourceInput,
} from "../src/index";

const ASSESSED_AT = "2026-08-07T07:00:00.000Z";

function evidence(
  overrides: Partial<EvidenceConfidenceAssessment> = {},
): EvidenceConfidenceAssessment {
  const base = createEvidenceConfidenceEngine().assess({
    assessmentId: "ec-fusion-1",
    assetId: "a1",
    scope: "multi_source_fusion",
    evidenceRefs: ["e1", "e2", "e3"],
    sourceKeys: ["manual.engineering_assessment", "asset_intelligence.review"],
    observedAt: ASSESSED_AT,
    asOf: ASSESSED_AT,
    reviewStatus: "published",
  });
  return { ...base, ...overrides };
}

function allPublishedSources(): FusionSourceInput[] {
  return [
    { kind: "condition", stateId: "cond-1", reviewStatus: "published" },
    { kind: "reliability", stateId: "rel-1", reviewStatus: "published" },
    { kind: "criticality", stateId: "crit-1", reviewStatus: "published" },
    { kind: "health", stateId: "hprof-1", reviewStatus: "published" },
    { kind: "failure", stateId: "fm-1", reviewStatus: "published" },
    { kind: "trend", stateId: "trend-1", reviewStatus: "published" },
    { kind: "degradation", stateId: "deg-1", reviewStatus: "published" },
    { kind: "lifecycle", stateId: "life-1", reviewStatus: "published" },
    { kind: "decision_context", stateId: "dc-1", reviewStatus: "published" },
    { kind: "risk_signal", stateId: "risk-1", reviewStatus: "published" },
    {
      kind: "maintenance_recommendation",
      stateId: "mr-1",
      reviewStatus: "published",
    },
    { kind: "priority", stateId: "prio-1", reviewStatus: "published" },
  ];
}

function fuse(sources: FusionSourceInput[], ec = evidence()) {
  return createMultiSourceFusionEngine({ newId: (p) => `${p}_1` }).compose({
    assetId: "a1",
    sources,
    evidenceConfidence: ec,
    assessedAt: ASSESSED_AT,
  });
}

function memoryEngine() {
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
  return { store, repository, engine };
}

describe("Phase 10I readiness locks", () => {
  it("locks version, fusion readiness, and predictive governance flags", () => {
    expect(ASSET_INTELLIGENCE_VERSION).toBe("0.9.0-fusion-readiness");
    expect(MULTI_SOURCE_FUSION_READY).toBe(true);
    expect(SOURCE_RECONCILIATION_ENGINE_READY).toBe(true);
    expect(PREDICTIVE_READINESS_ASSESSOR_READY).toBe(true);
    expect(PREDICTIVE_ML_ENABLED).toBe(false);
    expect(PREDICTIVE_METHODS_CERTIFIED).toBe(false);
    expect(FUSION_HEALTH_CONTRIBUTION_ENABLED).toBe(false);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(RUL_CLAIMS_CERTIFIED).toBe(false);
    expect(ASSET_FUSION_OWNERSHIP).toBe("asset_intelligence");
  });

  it("pins the authoritative Phase 10H baseline and hosted run", () => {
    expect(PHASE_10H_CERTIFIED_COMMIT).toBe("acec6ce63f9e6eb6968d0f899a61cf442c35ec90");
    expect(PHASE_10H_HOSTED_RUN).toBe("31158369645");
  });

  it("registers fusion and predictive readiness as governed state kinds", () => {
    expect(() =>
      assertRegisteredActiveSource("manual.engineering_assessment", "fusion"),
    ).not.toThrow();
    expect(() =>
      assertRegisteredActiveSource("manual.engineering_assessment", "predictive_readiness"),
    ).not.toThrow();
    expect(() => assertRegisteredActiveSource("shm.signals", "fusion")).toThrow(
      /inactive_intelligence_source/,
    );
  });
});

describe("MultiSourceFusionEngine", () => {
  it("fuses published slices without executing predictive ML", () => {
    const result = fuse(allPublishedSources());
    expect(result.fusion.fusionClass).toBe("aligned");
    expect(result.fusion.method).toBe("multi_source_fusion_v1");
    expect(result.fusion.predictiveMlExecuted).toBe(false);
    expect(result.fusion.probabilityOfFailureCertified).toBe(false);
    expect(result.fusion.rulClaimsCertified).toBe(false);
    expect(result.fusion.isHealthFactor).toBe(false);
    expect(result.fusion.createsCoreRisk).toBe(false);
    expect(result.fusion.createsWorkOrder).toBe(false);
    expect(result.fusion.mutatesCanonicalLifecycle).toBe(false);
    expect(result.fusion.provenance.publishedSlicePolicy).toBe("published_or_approved_only");
    expect((result.fusion as Record<string, unknown>).numericScore).toBeUndefined();
  });

  it("excludes non-published slices and reports them as missing", () => {
    const sources = allPublishedSources().map((s) =>
      s.kind === "condition" ? { ...s, reviewStatus: "draft" } : s,
    );
    const result = fuse(sources);
    expect(result.fusion.missingSources).toContain("condition");
    expect(
      result.fusion.contributingSources.some((c) =>
        c.note?.startsWith("not_published:"),
      ),
    ).toBe(true);
    expect(result.fusion.fusionClass).toBe("partial");
  });

  it("excludes Inspection Intelligence contracts other than 1.0.0", () => {
    const withPrivateIi = [
      ...allPublishedSources(),
      {
        kind: "inspection_intelligence_public" as const,
        stateId: "ii-1",
        contractVersion: "0.9.0",
        reviewStatus: "published",
      },
    ];
    const result = fuse(withPrivateIi);
    const ii = result.fusion.contributingSources.find(
      (c) => c.kind === "inspection_intelligence_public",
    );
    expect(ii?.status).toBe("excluded");
    expect(ii?.note).toBe("ii_contract_must_be_1.0.0");
    expect(result.fusion.limitations).toContain("ii_private_or_non_1.0.0_excluded");

    const accepted = fuse([
      ...allPublishedSources(),
      {
        kind: "inspection_intelligence_public",
        stateId: "ii-1",
        contractVersion: "1.0.0",
        reviewStatus: "published",
      },
    ]);
    expect(
      accepted.fusion.contributingSources.find(
        (c) => c.kind === "inspection_intelligence_public",
      )?.status,
    ).toBe("included");
  });

  it("abstains when evidence confidence is insufficient", () => {
    const result = fuse(allPublishedSources(), evidence({ dataSufficiency: "insufficient" }));
    expect(result.abstained).toBe(true);
    expect(result.fusion.fusionClass).toBe("abstained");
    expect(result.fusion.reviewStatus).toBe("abstained");
  });

  it("marks conflicting duplicate slices of the same kind", () => {
    const result = fuse([
      ...allPublishedSources(),
      { kind: "condition", stateId: "cond-2", reviewStatus: "published" },
    ]);
    expect(result.fusion.conflictingSources).toContain("condition");
    expect(result.fusion.fusionClass).toBe("conflicting");
  });
});

describe("SourceReconciliationEngine", () => {
  it("records conflicts for human review and never resolves autonomously", () => {
    const fused = fuse([
      ...allPublishedSources(),
      { kind: "condition", stateId: "cond-2", reviewStatus: "published" },
    ]);
    const record = createSourceReconciliationEngine({ newId: (p) => `${p}_1` }).reconcile(
      fused.fusion,
    );
    expect(record.autonomousResolutionForbidden).toBe(true);
    expect(record.method).toBe("source_reconciliation_v1");
    expect(record.conflicts.length).toBeGreaterThan(0);
    expect(record.conflicts.every((c) => c.outcome !== "aligned")).toBe(true);
    expect(record.conflicts.some((c) => c.outcome === "require_human_review")).toBe(true);
    expect(record.limitations).toContain("autonomous_resolution_forbidden");
  });

  it("reports no conflicts for an aligned fusion", () => {
    const record = createSourceReconciliationEngine().reconcile(fuse(allPublishedSources()).fusion);
    expect(record.conflicts).toEqual([]);
    expect(record.limitations).toContain("no_conflicts_detected");
  });
});

describe("PredictiveReadinessAssessor", () => {
  it("never enables predictive methods even when evidence is sufficient", () => {
    const fused = fuse(allPublishedSources());
    const result = createPredictiveReadinessAssessor({ newId: (p) => `${p}_1` }).assess({
      fusion: fused.fusion,
      evidenceConfidence: evidence(),
      assessedAt: ASSESSED_AT,
    });
    expect(result.predictiveAllowed).toBe(false);
    expect(result.readiness.predictiveMlEnabled).toBe(false);
    expect(result.readiness.predictiveMethodsCertified).toBe(false);
    expect(result.readiness.predictiveMlExecuted).toBe(false);
    expect(result.readiness.probabilityOfFailureCertified).toBe(false);
    expect(result.readiness.rulClaimsCertified).toBe(false);
    expect(result.readiness.isHealthFactor).toBe(false);
    expect(result.readiness.limitations).toContain("predictive_ml_enabled=false");
    expect(result.readiness.limitations).toContain("phase_10i_readiness_only_no_execution");
  });

  it("reports conflicting readiness when reconciliation requires human review", () => {
    const fused = fuse([
      ...allPublishedSources(),
      { kind: "condition", stateId: "cond-2", reviewStatus: "published" },
    ]);
    const reconciliation = createSourceReconciliationEngine().reconcile(fused.fusion);
    const result = createPredictiveReadinessAssessor().assess({
      fusion: fused.fusion,
      reconciliation,
      evidenceConfidence: evidence(),
      assessedAt: ASSESSED_AT,
    });
    expect(result.readiness.readinessClass).toBe("conflicting");
    expect(result.readiness.readinessRationale).toContain("fusion_conflicts_unresolved");
  });

  it("reports insufficient readiness when evidence abstains", () => {
    const ec = evidence({ dataSufficiency: "insufficient" });
    const fused = fuse(allPublishedSources(), ec);
    const result = createPredictiveReadinessAssessor().assess({
      fusion: fused.fusion,
      evidenceConfidence: ec,
      assessedAt: ASSESSED_AT,
    });
    expect(result.readiness.readinessClass).toBe("insufficient");
    expect(result.readiness.limitations).toContain("predictive_methods_remain_disabled");
  });
});

describe("Governed Phase 10I assess/review over the memory repository", () => {
  it("persists fusion, reconciliation, and readiness without touching Health", async () => {
    const { engine, store } = memoryEngine();

    const bundle = await engine.assessFusionBundle({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1", "e2"],
      actorRole: "engineer",
      idempotencyKey: "fusion-bundle-1",
    });

    expect(bundle.identityMutated).toBe(false);
    expect(bundle.healthMutated).toBe(false);
    expect(bundle.fusionHealthContributionEnabled).toBe(false);
    expect(bundle.predictiveMlEnabled).toBe(false);
    expect(bundle.predictiveMethodsCertified).toBe(false);
    expect(bundle.predictiveMlExecuted).toBe(false);
    expect(bundle.probabilityOfFailureCertified).toBe(false);
    expect(bundle.rulClaimsCertified).toBe(false);
    expect(bundle.autonomousReconciliationForbidden).toBe(true);
    expect(bundle.predictiveAllowed).toBe(false);
    expect(bundle.fusionState.version).toBe(1);
    expect(bundle.predictiveReadiness.version).toBe(1);
    expect(bundle.predictiveReadiness.fusionStateRef).toBe(bundle.fusionState.id);
    expect(bundle.reconciliation.fusionStateRef).toBe(bundle.fusionState.id);

    expect(store.fusionStates.length).toBe(1);
    expect(store.reconciliationRecords.length).toBe(1);
    expect(store.predictiveReadinessStates.length).toBe(1);
    expect(store.healthIndexStates.length).toBe(0);
    expect(store.timeline.some((t) => t.kind === "fusion_state")).toBe(true);
    expect(store.timeline.some((t) => t.kind === "reconciliation_record")).toBe(true);
    expect(store.timeline.some((t) => t.kind === "predictive_readiness")).toBe(true);
    expect(store.snapshots.length).toBeGreaterThan(0);
    expect(store.outbox.every((o) => o.published)).toBe(true);
    expect(
      store.events.some((e) => e.type === "engineering.asset.fusion.assessed"),
    ).toBe(true);
    expect(
      store.events.some((e) => e.type === "engineering.asset.reconciliation.recorded"),
    ).toBe(true);
    expect(
      store.events.some(
        (e) => e.type === "engineering.asset.predictive_readiness.assessed",
      ),
    ).toBe(true);
  });

  it("replays fusion assessment idempotently", async () => {
    const { engine } = memoryEngine();
    const first = await engine.assessFusion({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1"],
      actorRole: "engineer",
      idempotencyKey: "fusion-1",
    });
    const replay = await engine.assessFusion({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1"],
      actorRole: "engineer",
      idempotencyKey: "fusion-1",
    });
    expect(replay.idempotentReplay).toBe(true);
    expect(replay.fusionState.id).toBe(first.fusionState.id);
  });

  it("enforces optimistic version locks on fusion assessment", async () => {
    const { engine } = memoryEngine();
    await engine.assessFusion({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1"],
      actorRole: "engineer",
    });
    await expect(
      engine.assessFusion({
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        evidenceRefs: ["e1"],
        actorRole: "engineer",
        expectedVersion: 99,
      }),
    ).rejects.toThrow(/optimistic_lock_conflict/);
  });

  it("keeps published fusion states immutable", async () => {
    const { engine } = memoryEngine();
    const assessed = await engine.assessFusion({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1", "e2", "e3"],
      actorRole: "engineer",
    });
    const review = startFusionReview({
      tenantId: "t1",
      workspaceId: "w1",
      fusionStateId: assessed.fusionState.id,
    });
    const published = await engine.reviewFusion({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      fusionStateId: assessed.fusionState.id,
      workflowInstance: review.instance,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      publish: true,
      actorRole: "reviewer",
    });
    expect(published.fusionState.reviewStatus).toBe("published");
    expect(published.fusionHealthContributionEnabled).toBe(false);
    expect(published.predictiveMlExecuted).toBe(false);

    await expect(
      engine.reviewFusion({
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        fusionStateId: published.fusionState.id,
        workflowInstance: review.instance,
        action: "approve",
        to: "approved",
        reviewerId: "reviewer-1",
        actorRole: "reviewer",
      }),
    ).rejects.toThrow("published_fusion_immutable");
  });

  it("keeps published predictive readiness states immutable", async () => {
    const { engine } = memoryEngine();
    const bundle = await engine.assessFusionBundle({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1", "e2", "e3"],
      actorRole: "engineer",
      startReview: false,
    });
    const review = startFusionReview({
      tenantId: "t1",
      workspaceId: "w1",
      fusionStateId: bundle.predictiveReadiness.id,
    });
    const published = await engine.reviewPredictiveReadiness({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      readinessStateId: bundle.predictiveReadiness.id,
      workflowInstance: review.instance,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      publish: true,
      actorRole: "reviewer",
    });
    expect(published.predictiveReadiness.reviewStatus).toBe("published");
    expect(published.predictiveMlEnabled).toBe(false);
    expect(published.predictiveMethodsCertified).toBe(false);

    await expect(
      engine.reviewPredictiveReadiness({
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        readinessStateId: published.predictiveReadiness.id,
        workflowInstance: review.instance,
        action: "approve",
        to: "approved",
        reviewerId: "reviewer-1",
        actorRole: "reviewer",
      }),
    ).rejects.toThrow("published_predictive_readiness_immutable");
  });

  it("forbids engineer self-approval and publication across Phase 10I capabilities", () => {
    for (const capability of [
      "fusion.approve",
      "fusion.publish",
      "predictive_readiness.approve",
      "predictive_readiness.publish",
    ] as const) {
      expect(() => assertFailureCapability("engineer", capability)).toThrow(
        "engineer_self_approve_forbidden",
      );
    }
    expect(() => assertFailureCapability("engineer", "fusion.assess")).not.toThrow();
    expect(() =>
      assertFailureCapability("engineer", "predictive_readiness.assess"),
    ).not.toThrow();
    expect(() => assertFailureCapability("reviewer", "fusion.approve")).not.toThrow();
    expect(() => assertFailureCapability("viewer", "fusion.assess")).toThrow(
      /failure_capability_denied/,
    );
    expect(() => assertFailureCapability("viewer", "fusion.read")).not.toThrow();
  });
});
