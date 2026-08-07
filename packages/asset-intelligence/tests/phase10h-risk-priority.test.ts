import { describe, expect, it } from "vitest";
import {
  ASSET_DECISION_CONTEXT_ENGINE_READY,
  ASSET_INTELLIGENCE_VERSION,
  ASSET_PRIORITY_ENGINE_READY,
  AssetIntelligenceRepository,
  CANONICAL_ENGINEERING_RISK_OWNERSHIP,
  CMMS_WORK_ORDER_OWNERSHIP,
  MAINTENANCE_RECOMMENDATION_ENGINE_READY,
  MAINTENANCE_RECOMMENDATION_TAXONOMY_READY,
  NUMERIC_PRIORITY_SCORE_REQUIRED,
  PRIORITY_HEALTH_CONTRIBUTION_ENABLED,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  RISK_CORE_AUTO_MUTATION_ALLOWED,
  RISK_HEALTH_CONTRIBUTION_ENABLED,
  RISK_SIGNAL_ENGINE_READY,
  RUL_CLAIMS_CERTIFIED,
  assertFailureCapability,
  createAssetDecisionContextEngine,
  createAssetIntelligenceEngine,
  createAssetPriorityContextEngine,
  createDurableAssetIntelligenceMemoryStore,
  createEvidenceConfidenceEngine,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  createMaintenanceRecommendationEngine,
  createMaintenanceRecommendationTaxonomyRegistry,
  createRiskSignalEngine,
  startRiskReview,
  type EvidenceConfidenceAssessment,
} from "../src/index";

const ASSESSED_AT = "2026-08-07T06:00:00.000Z";

function evidence(
  overrides: Partial<EvidenceConfidenceAssessment> = {},
): EvidenceConfidenceAssessment {
  const base = createEvidenceConfidenceEngine().assess({
    assessmentId: "ec-1",
    assetId: "a1",
    scope: "risk_signal",
    evidenceRefs: ["e1", "e2", "e3"],
    sourceKeys: ["manual.engineering_assessment", "asset_intelligence.review"],
    observedAt: ASSESSED_AT,
    asOf: ASSESSED_AT,
    reviewStatus: "published",
  });
  return { ...base, ...overrides };
}

function publishedContext(overrides: Record<string, unknown> = {}) {
  return createAssetDecisionContextEngine({ newId: (p) => `${p}_1` }).compose({
    assetId: "a1",
    healthProfileRef: "hprof-1",
    criticality: { stateId: "crit-1", reviewStatus: "published" },
    condition: { stateId: "cond-1", reviewStatus: "published" },
    reliability: { stateId: "rel-1", reviewStatus: "published" },
    failures: [{ stateId: "fm-1", reviewStatus: "published" }],
    degradations: [{ stateId: "deg-1", reviewStatus: "published" }],
    lifecycle: { stateId: "life-1", reviewStatus: "published" },
    trends: [{ stateId: "trend-1", reviewStatus: "published" }],
    evidenceConfidence: evidence(),
    assessedAt: ASSESSED_AT,
    ...overrides,
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

describe("Phase 10H readiness locks", () => {
  it("locks version, engine readiness, and governance flags", () => {
    expect(["0.8.0-risk-priority", "0.9.0-fusion-readiness", "0.10.0-predictive-governance"]).toContain(ASSET_INTELLIGENCE_VERSION);
    expect(ASSET_DECISION_CONTEXT_ENGINE_READY).toBe(true);
    expect(RISK_SIGNAL_ENGINE_READY).toBe(true);
    expect(MAINTENANCE_RECOMMENDATION_ENGINE_READY).toBe(true);
    expect(MAINTENANCE_RECOMMENDATION_TAXONOMY_READY).toBe(true);
    expect(ASSET_PRIORITY_ENGINE_READY).toBe(true);
    expect(RISK_HEALTH_CONTRIBUTION_ENABLED).toBe(false);
    expect(PRIORITY_HEALTH_CONTRIBUTION_ENABLED).toBe(false);
    expect(RISK_CORE_AUTO_MUTATION_ALLOWED).toBe(false);
    expect(NUMERIC_PRIORITY_SCORE_REQUIRED).toBe(false);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(RUL_CLAIMS_CERTIFIED).toBe(false);
    expect(CANONICAL_ENGINEERING_RISK_OWNERSHIP).toBe("engineering_core");
    expect(CMMS_WORK_ORDER_OWNERSHIP).toBe("none_in_asset_intelligence");
  });
});

describe("AssetDecisionContextEngine", () => {
  it("includes only published slices and never claims decision authority", () => {
    const result = publishedContext({
      condition: { stateId: "cond-1", reviewStatus: "draft" },
    });
    expect(result.context.autonomousDecisionAuthority).toBe(false);
    expect(result.context.createsCoreRisk).toBe(false);
    expect(result.context.createsWorkOrder).toBe(false);
    expect(result.context.conditionStateRef).toBeUndefined();
    expect(result.context.missingDimensions).toContain("condition");
    expect(
      result.context.contributingSlices.some((s) => s.note?.startsWith("not_published:")),
    ).toBe(true);
  });

  it("abstains when evidence is insufficient", () => {
    const result = publishedContext({
      evidenceConfidence: evidence({ dataSufficiency: "insufficient" }),
    });
    expect(result.abstained).toBe(true);
    expect(result.context.decisionContextClass).toBe("abstained");
  });

  it("flags conflicting evidence as conflicting context", () => {
    const result = publishedContext({
      evidenceConfidence: evidence({ dataSufficiency: "conflicting" }),
    });
    expect(result.abstained).toBe(true);
    expect(result.context.decisionContextClass).toBe("conflicting_context");
    expect(result.context.conflictingDimensions).toContain("evidence_confidence");
  });
});

describe("RiskSignalEngine", () => {
  it("produces an advisory consequence-sensitive signal with a human-gated candidate", () => {
    const ctx = publishedContext();
    const result = createRiskSignalEngine({ newId: (p) => `${p}_1` }).assess({
      decisionContext: ctx.context,
      evidenceConfidence: ctx.context.evidenceConfidence!,
      assessedAt: ASSESSED_AT,
    });
    expect(result.riskSignal.riskSignalClass).toBe("consequence_sensitive");
    expect(result.riskSignal.riskSignalCategory).toBe("advisory_context");
    expect(result.riskSignal.createsCoreRisk).toBe(false);
    expect(result.riskSignal.probabilityOfFailureCertified).toBe(false);
    expect(result.riskSignal.isHealthFactor).toBe(false);
    expect(result.riskCandidate?.autoMutatesCoreRisk).toBe(false);
    expect(result.riskCandidate?.requiresHumanGatedAdapter).toBe(true);
  });

  it("abstains when the decision context abstained", () => {
    const ctx = publishedContext({
      evidenceConfidence: evidence({ dataSufficiency: "insufficient" }),
    });
    const result = createRiskSignalEngine().assess({
      decisionContext: ctx.context,
      evidenceConfidence: ctx.context.evidenceConfidence!,
      assessedAt: ASSESSED_AT,
    });
    expect(result.abstained).toBe(true);
    expect(result.riskSignal.riskSignalClass).toBe("insufficient_evidence");
    expect(result.riskCandidate).toBeUndefined();
  });
});

describe("MaintenanceRecommendationEngine", () => {
  it("recommends assessment classes and never a work order", () => {
    const ctx = publishedContext();
    const risk = createRiskSignalEngine().assess({
      decisionContext: ctx.context,
      evidenceConfidence: ctx.context.evidenceConfidence!,
      assessedAt: ASSESSED_AT,
    });
    const result = createMaintenanceRecommendationEngine().assess({
      decisionContext: ctx.context,
      riskSignal: risk.riskSignal,
      evidenceConfidence: ctx.context.evidenceConfidence!,
      assessedAt: ASSESSED_AT,
    });
    expect(result.recommendation.recommendationCode).toBe("engineering_assessment");
    expect(result.recommendation.createsWorkOrder).toBe(false);
    expect(result.recommendation.calculatesRul).toBe(false);
    expect(result.recommendation.provenance.cmmsWorkOrderOwnership).toBe(
      "none_in_asset_intelligence",
    );
  });

  it("rejects pack extensions that redefine shared recommendation semantics", () => {
    const registry = createMaintenanceRecommendationTaxonomyRegistry();
    expect(registry.get("monitor")?.packOwner).toBe("engineering_os_shared");
    expect(() =>
      registry.registerPackExtension({
        code: "monitor",
        name: "Pack monitor",
        description: "",
        category: "monitor",
        version: "1",
        status: "active",
        applicableAssetClasses: ["*"],
        packOwner: "pack.pressure_vessel",
        redefinesSharedSemantics: false,
      }),
    ).toThrow(/pack_must_not_redefine_shared_recommendation_code/);
  });
});

describe("AssetPriorityContextEngine", () => {
  it("preserves dimensions and emits no opaque numeric score", () => {
    const ctx = publishedContext();
    const risk = createRiskSignalEngine().assess({
      decisionContext: ctx.context,
      evidenceConfidence: ctx.context.evidenceConfidence!,
      assessedAt: ASSESSED_AT,
    });
    const result = createAssetPriorityContextEngine().compose({
      decisionContext: ctx.context,
      riskSignal: risk.riskSignal,
      evidenceConfidence: ctx.context.evidenceConfidence!,
      assessedAt: ASSESSED_AT,
    });
    expect(result.profile.priorityClass).toBe("urgent_review");
    expect(result.profile.dimensionStates.length).toBeGreaterThan(5);
    expect(result.profile.isHealthFactor).toBe(false);
    expect(result.profile.impliesPoF).toBe(false);
    expect(result.profile.provenance.numericPriorityScoreRequired).toBe(false);
    expect((result.profile as Record<string, unknown>).numericScore).toBeUndefined();
  });
});

describe("Governed Phase 10H assess/review over the memory repository", () => {
  it("persists risk, recommendation, and priority without touching Health or Core Risk", async () => {
    const { engine, store } = memoryEngine();

    const bundle = await engine.assessRiskPriorityBundle({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1", "e2"],
      actorRole: "engineer",
      idempotencyKey: "bundle-1",
    });

    expect(bundle.identityMutated).toBe(false);
    expect(bundle.healthMutated).toBe(false);
    expect(bundle.createsCoreRisk).toBe(false);
    expect(bundle.createsWorkOrder).toBe(false);
    expect(bundle.riskCoreAutoMutationAllowed).toBe(false);
    expect(bundle.riskHealthContributionEnabled).toBe(false);
    expect(bundle.priorityHealthContributionEnabled).toBe(false);
    expect(bundle.canonicalEngineeringRiskOwnership).toBe("engineering_core");
    expect(bundle.cmmsWorkOrderOwnership).toBe("none_in_asset_intelligence");
    expect(bundle.riskSignal.version).toBe(1);
    expect(bundle.recommendation.version).toBe(1);
    expect(bundle.priorityProfile.version).toBe(1);
    expect(store.decisionContexts.length).toBeGreaterThan(0);
    expect(store.healthIndexStates.length).toBe(0);
    expect(store.timeline.some((t) => t.kind === "decision_context")).toBe(true);
    expect(store.timeline.some((t) => t.kind === "risk_signal")).toBe(true);
    expect(store.timeline.some((t) => t.kind === "priority_profile")).toBe(true);
    expect(store.outbox.every((o) => o.published)).toBe(true);
  });

  it("replays assess operations idempotently", async () => {
    const { engine } = memoryEngine();
    const first = await engine.assessRisk({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1"],
      actorRole: "engineer",
      idempotencyKey: "risk-1",
    });
    const replay = await engine.assessRisk({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1"],
      actorRole: "engineer",
      idempotencyKey: "risk-1",
    });
    expect(replay.idempotentReplay).toBe(true);
    expect(replay.riskSignal.id).toBe(first.riskSignal.id);
  });

  it("enforces optimistic version locks on risk assessment", async () => {
    const { engine } = memoryEngine();
    await engine.assessRisk({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1"],
      actorRole: "engineer",
    });
    await expect(
      engine.assessRisk({
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        evidenceRefs: ["e1"],
        actorRole: "engineer",
        expectedVersion: 99,
      }),
    ).rejects.toThrow(/optimistic_lock_conflict/);
  });

  it("keeps published risk signals immutable", async () => {
    const { engine } = memoryEngine();
    const assessed = await engine.assessRisk({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      evidenceRefs: ["e1", "e2", "e3"],
      actorRole: "engineer",
    });
    const review = startRiskReview({
      tenantId: "t1",
      workspaceId: "w1",
      riskSignalStateId: assessed.riskSignal.id,
    });
    const published = await engine.reviewRisk({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      riskSignalStateId: assessed.riskSignal.id,
      workflowInstance: review.instance,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      publish: true,
      actorRole: "reviewer",
    });
    expect(published.riskSignal.reviewStatus).toBe("published");
    expect(published.createsCoreRisk).toBe(false);

    await expect(
      engine.reviewRisk({
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        riskSignalStateId: published.riskSignal.id,
        workflowInstance: review.instance,
        action: "approve",
        to: "approved",
        reviewerId: "reviewer-1",
        actorRole: "reviewer",
      }),
    ).rejects.toThrow("published_risk_signal_immutable");
  });

  it("forbids engineer self-approval and publication across Phase 10H capabilities", () => {
    for (const capability of [
      "risk.approve",
      "risk.publish",
      "maintenance_recommendation.approve",
      "maintenance_recommendation.publish",
      "priority.approve",
      "priority.publish",
    ] as const) {
      expect(() => assertFailureCapability("engineer", capability)).toThrow(
        "engineer_self_approve_forbidden",
      );
    }
    expect(() => assertFailureCapability("engineer", "risk.assess")).not.toThrow();
    expect(() => assertFailureCapability("reviewer", "risk.approve")).not.toThrow();
    expect(() => assertFailureCapability("viewer", "risk.assess")).toThrow(
      /failure_capability_denied/,
    );
  });
});
