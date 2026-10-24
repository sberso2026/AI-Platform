import { describe, expect, it } from "vitest";
import {
  ASSET_INTELLIGENCE_VERSION,
  AssetIntelligenceRepository,
  PREDICTIVE_GOVERNANCE_LOCKS,
  PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED,
  PREDICTIVE_METHOD_REGISTRY,
  PREDICTIVE_METHODS_CERTIFIED,
  PREDICTIVE_ML_ENABLED,
  PREDICTIVE_OBJECTIVE_REGISTRY,
  PHASE_10I_CERTIFIED_COMMIT,
  PHASE_10I_HOSTED_RUN,
  PROBABILITY_OF_FAILURE_CERTIFIED,
  PRODUCTION_PREDICTIVE_EXECUTION_ENABLED,
  RUL_CLAIMS_CERTIFIED,
  VALIDATION_METRIC_REGISTRY,
  assertFailureCapability,
  assertNoCertifiedMethods,
  assertRegisteredActiveSource,
  createAssetIntelligenceEngine,
  createDurableAssetIntelligenceMemoryStore,
  createEvidenceConfidenceEngine,
  createInMemorySharedDomainIdentityPort,
  createInProcessAssetIntelligenceEventPipeline,
  createMultiSourceFusionEngine,
  createObjectivePredictiveReadinessAssessor,
  createPredictiveMethodEligibilityEngine,
  createQualificationDraft,
  createTrendConfidenceEngine,
  evaluateAgainstAcceptanceCriteria,
  isPermanentlyNotReadyInPhase10J,
  qualificationGrantsExecution,
  startPredictiveMethodReview,
  type EvidenceConfidenceAssessment,
  type FusionSourceInput,
  type ObjectivePredictiveReadinessState,
  type TrendConfidenceAssessment,
} from "../src/index";

const ASSESSED_AT = "2026-08-07T07:00:00.000Z";

function evidence(
  overrides: Partial<EvidenceConfidenceAssessment> = {},
): EvidenceConfidenceAssessment {
  const base = createEvidenceConfidenceEngine().assess({
    assessmentId: "ec-predictive-1",
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

function trend(overrides: Partial<TrendConfidenceAssessment> = {}): TrendConfidenceAssessment {
  const base = createTrendConfidenceEngine().assess({
    assessmentId: "tc-predictive-1",
    assetId: "a1",
    scope: "trend_intelligence",
    pointCount: 12,
    asOf: ASSESSED_AT,
    sourceKeys: ["manual.engineering_assessment", "asset_intelligence.review"],
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
    { kind: "maintenance_recommendation", stateId: "mr-1", reviewStatus: "published" },
    { kind: "priority", stateId: "prio-1", reviewStatus: "published" },
  ];
}

function fuse(ec = evidence()) {
  return createMultiSourceFusionEngine({ newId: (p) => `${p}_1` }).compose({
    assetId: "a1",
    sources: allPublishedSources(),
    evidenceConfidence: ec,
    assessedAt: ASSESSED_AT,
  });
}

/** Evidence base deliberately strong enough that only governance can block. */
function readinessFor(
  objectiveId: string,
  overrides: Partial<Parameters<
    ReturnType<typeof createObjectivePredictiveReadinessAssessor>["assessObjective"]
  >[0]> = {},
): ObjectivePredictiveReadinessState {
  const ec = evidence();
  return createObjectivePredictiveReadinessAssessor({ newId: (p) => `${p}_1` }).assessObjective({
    objectiveId,
    fusion: fuse(ec).fusion,
    evidenceConfidence: ec,
    trendConfidence: trend(),
    declaredInputs: [
      "material_properties",
      "environment_exposure",
      "design_basis",
      "maintenance_history",
    ],
    observationCount: 24,
    observationWindowDays: 1095,
    largestObservationGapDays: 30,
    evidenceAgeDays: 10,
    assessedAt: ASSESSED_AT,
    ...overrides,
  }).readiness;
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

describe("Phase 10J readiness locks", () => {
  it("locks version and every predictive execution flag", () => {
    expect(["0.10.0-predictive-governance", "1.0.0"]).toContain(ASSET_INTELLIGENCE_VERSION);
    expect(PRODUCTION_PREDICTIVE_EXECUTION_ENABLED).toBe(false);
    expect(PREDICTIVE_ML_ENABLED).toBe(false);
    expect(PREDICTIVE_METHODS_CERTIFIED).toBe(false);
    expect(PROBABILITY_OF_FAILURE_CERTIFIED).toBe(false);
    expect(RUL_CLAIMS_CERTIFIED).toBe(false);
    expect(PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED).toBe(false);
    expect(PREDICTIVE_GOVERNANCE_LOCKS.containsPredictionOutput).toBe(false);
    expect(PREDICTIVE_GOVERNANCE_LOCKS.autonomousExecutionForbidden).toBe(true);
  });

  it("pins the authoritative Phase 10I baseline and hosted run", () => {
    expect(PHASE_10I_CERTIFIED_COMMIT).toBe("27fed4e975f015ff01b60a41dd76ab06ea2886a9");
    expect(PHASE_10I_HOSTED_RUN).toBe("31163563401");
  });

  it("registers objectives, methods and metrics without certifying any of them", () => {
    expect(PREDICTIVE_OBJECTIVE_REGISTRY.length).toBeGreaterThan(0);
    expect(PREDICTIVE_OBJECTIVE_REGISTRY.every((o) => o.certified === false)).toBe(true);
    expect(PREDICTIVE_METHOD_REGISTRY.every((m) => m.certified === false)).toBe(true);
    expect(
      PREDICTIVE_METHOD_REGISTRY.every((m) => m.productionExecutionEnabled === false),
    ).toBe(true);
    expect(VALIDATION_METRIC_REGISTRY.every((m) => m.certificationImplied === false)).toBe(true);
    expect(() => assertNoCertifiedMethods()).not.toThrow();
  });

  it("keeps machine-learning methods suspended while predictive ML is disabled", () => {
    const ml = PREDICTIVE_METHOD_REGISTRY.filter((m) => m.methodClass === "machine_learning");
    expect(ml.length).toBeGreaterThan(0);
    expect(ml.every((m) => m.suspendedFromExecution)).toBe(true);
  });

  it("registers predictive governance as a governed state kind", () => {
    expect(() =>
      assertRegisteredActiveSource("manual.engineering_assessment", "predictive_governance"),
    ).not.toThrow();
    expect(() => assertRegisteredActiveSource("shm.signals", "predictive_governance")).toThrow(
      /inactive_intelligence_source/,
    );
  });
});

describe("ObjectivePredictiveReadinessAssessor", () => {
  it("can reach readiness for a reserved objective without granting permission", () => {
    const readiness = readinessFor("condition_trend_projection");
    expect(readiness.readinessClass).toBe("sufficient");
    expect(readiness.unmetRequirements).toEqual([]);
    expect(readiness.containsPredictionOutput).toBe(false);
    expect(readiness.productionExecutionEnabled).toBe(false);
    expect(readiness.predictiveMlExecuted).toBe(false);
    expect(readiness.isHealthFactor).toBe(false);
    expect(readiness.limitations).toContain("readiness_is_not_permission_to_predict");
    expect(readiness.limitations).toContain("production_predictive_execution_enabled=false");
  });

  it("holds probability of failure and remaining useful life at not_ready", () => {
    for (const objectiveId of ["probability_of_failure", "remaining_useful_life"] as const) {
      expect(isPermanentlyNotReadyInPhase10J(objectiveId)).toBe(true);
      const readiness = readinessFor(objectiveId);
      expect(readiness.readinessClass).toBe("not_ready");
      expect(readiness.readinessRationale).toContain(
        "objective_reserved_and_uncertified_in_phase_10j",
      );
      expect(readiness.probabilityOfFailureCertified).toBe(false);
      expect(readiness.rulClaimsCertified).toBe(false);
    }
  });

  it("downgrades readiness when evidence falls outside the freshness policy", () => {
    const stale = readinessFor("condition_trend_projection", { evidenceAgeDays: 900 });
    expect(stale.freshnessState).toBe("stale");
    expect(stale.readinessClass).toBe("not_ready");

    const aging = readinessFor("condition_trend_projection", { evidenceAgeDays: 300 });
    expect(aging.freshnessState).toBe("aging");
    expect(aging.readinessClass).toBe("limited");
  });

  it("fails closed when a required input cannot be evidenced", () => {
    const readiness = readinessFor("threshold_crossing_estimation", { declaredInputs: [] });
    expect(readiness.unmetRequirements).toContain("missing_required_input:design_basis");
    expect(readiness.readinessClass).not.toBe("sufficient");
  });
});

describe("PredictiveMethodEligibilityEngine", () => {
  const eligibility = createPredictiveMethodEligibilityEngine({ newId: (p) => `${p}_1` });

  it("proposes a candidate that carries no prediction of any kind", () => {
    const result = eligibility.evaluate({
      objectiveId: "condition_trend_projection",
      methodId: "linear_trend_extrapolation",
      readiness: readinessFor("condition_trend_projection"),
      evidenceConfidence: evidence(),
      trendConfidence: trend(),
      assertedAssumptions: [
        "monotonic_degradation_within_window",
        "constant_operating_regime",
        "measurement_error_independent_and_unbiased",
      ],
      satisfiedApplicabilityConditions: [
        "trend_confidence_sufficient",
        "projection_horizon_within_observed_window",
        "no_change_point_detected_in_window",
      ],
      proposedAt: ASSESSED_AT,
    });

    expect(result.outcome).toBe("conditionally_eligible");
    expect(result.executionAllowed).toBe(false);
    expect(result.candidate.containsPredictionOutput).toBe(false);
    expect(result.candidate.predictiveMlExecuted).toBe(false);
    expect(result.candidate.productionExecutionEnabled).toBe(false);
    expect(result.candidate.outstandingConditions).toContain("method_qualification_outstanding");

    const asRecord = result.candidate as unknown as Record<string, unknown>;
    for (const forbidden of [
      "predictedValue",
      "prediction",
      "estimate",
      "horizon",
      "probability",
      "remainingUsefulLife",
    ]) {
      expect(asRecord[forbidden]).toBeUndefined();
    }
  });

  it("abstains for machine-learning methods while predictive ML is disabled", () => {
    const result = eligibility.evaluate({
      objectiveId: "condition_trend_projection",
      methodId: "generic_ml_regressor",
      readiness: readinessFor("condition_trend_projection"),
      evidenceConfidence: evidence(),
      trendConfidence: trend(),
      proposedAt: ASSESSED_AT,
    });
    expect(result.outcome).toBe("ineligible");
    expect(result.abstained).toBe(true);
    expect(result.candidate.unmetRequirements).toContain(
      "method_suspended_from_execution:generic_ml_regressor",
    );
  });

  it("abstains for objectives that are uncertified for the whole of Phase 10J", () => {
    const result = eligibility.evaluate({
      objectiveId: "remaining_useful_life",
      methodId: "linear_trend_extrapolation",
      readiness: readinessFor("remaining_useful_life"),
      proposedAt: ASSESSED_AT,
    });
    expect(result.outcome).toBe("ineligible");
    expect(result.candidate.eligibility).toBe("ineligible");
  });

  it("abstains when a stated assumption is violated", () => {
    const result = eligibility.evaluate({
      objectiveId: "condition_trend_projection",
      methodId: "linear_trend_extrapolation",
      readiness: readinessFor("condition_trend_projection"),
      evidenceConfidence: evidence(),
      trendConfidence: trend(),
      violatedAssumptions: ["constant_operating_regime"],
      proposedAt: ASSESSED_AT,
    });
    expect(result.outcome).toBe("ineligible");
    expect(result.candidate.assumptionsViolated).toContain("constant_operating_regime");
    expect(result.candidate.eligibilityRationale).toContain("abstained_assumptions_violated");
  });
});

describe("Predictive method qualification", () => {
  const draftInput = {
    methodId: "linear_trend_extrapolation",
    objectiveId: "condition_trend_projection",
    fixtureSetRef: "fixtures/condition_trend_v1",
    fixtureSetHash: "sha256:fixture-hash-1",
    fixtureCount: 40,
    acceptanceCriteria: [
      { metricId: "mae", comparator: "lte" as const, threshold: 0.5, mandatory: true },
      { metricId: "rmse", comparator: "lte" as const, threshold: 0.8, mandatory: true },
    ],
    createdAt: ASSESSED_AT,
  };

  it("passes within the fixture domain without granting certification", () => {
    const draft = createQualificationDraft(draftInput);
    expect(draft.qualificationStatus).toBe("draft");

    const evaluated = evaluateAgainstAcceptanceCriteria(
      draft,
      [
        { metricId: "mae", observedValue: 0.3 },
        { metricId: "rmse", observedValue: 0.6 },
      ],
      { evaluatedAt: ASSESSED_AT, evaluatorId: "engineer-1", reproducible: true },
    );

    expect(evaluated.qualificationStatus).toBe("passed");
    expect(evaluated.certificationGranted).toBe(false);
    expect(evaluated.productionExecutionEnabled).toBe(false);
    expect(evaluated.limitations).toContain("passed_within_fixture_domain_only");
    expect(evaluated.limitations).toContain("qualification_does_not_grant_certification");
    expect(qualificationGrantsExecution(evaluated)).toBe(false);
  });

  it("fails when a mandatory metric misses its threshold", () => {
    const evaluated = evaluateAgainstAcceptanceCriteria(
      createQualificationDraft(draftInput),
      [
        { metricId: "mae", observedValue: 0.9 },
        { metricId: "rmse", observedValue: 0.6 },
      ],
      { evaluatedAt: ASSESSED_AT, reproducible: true },
    );
    expect(evaluated.qualificationStatus).toBe("failed");
    expect(evaluated.failedMandatoryMetricIds).toContain("mae");
  });

  it("is inconclusive when the fixture set cannot be reproduced", () => {
    const evaluated = evaluateAgainstAcceptanceCriteria(
      createQualificationDraft(draftInput),
      [
        { metricId: "mae", observedValue: 0.3 },
        { metricId: "rmse", observedValue: 0.6 },
      ],
      { evaluatedAt: ASSESSED_AT, observedFixtureSetHash: "sha256:other-hash" },
    );
    expect(evaluated.qualificationStatus).toBe("inconclusive");
    expect(evaluated.reproducible).toBe(false);
    expect(evaluated.limitations).toContain("fixture_set_hash_mismatch");
  });

  it("refuses a method that is not applicable to the objective", () => {
    expect(() =>
      createQualificationDraft({ ...draftInput, objectiveId: "reliability_projection" }),
    ).toThrow(/method_not_applicable_to_objective/);
  });
});

describe("Governed Phase 10J assess/review over the memory repository", () => {
  it("persists objective readiness and candidates without touching Health", async () => {
    const { engine, store } = memoryEngine();

    const bundle = await engine.assessPredictiveGovernanceBundle({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      objectiveId: "condition_trend_projection",
      evidenceRefs: ["e1", "e2", "e3"],
      trendConfidence: trend(),
      declaredInputs: ["material_properties", "environment_exposure", "design_basis"],
      observationCount: 24,
      observationWindowDays: 1095,
      largestObservationGapDays: 30,
      evidenceAgeDays: 10,
      actorRole: "engineer",
      idempotencyKey: "predictive-bundle-1",
    });

    expect(bundle.identityMutated).toBe(false);
    expect(bundle.healthMutated).toBe(false);
    expect(bundle.predictiveHealthContributionEnabled).toBe(false);
    expect(bundle.productionPredictiveExecutionEnabled).toBe(false);
    expect(bundle.predictiveMlEnabled).toBe(false);
    expect(bundle.predictiveMlExecuted).toBe(false);
    expect(bundle.containsPredictionOutput).toBe(false);
    expect(bundle.probabilityOfFailureCertified).toBe(false);
    expect(bundle.rulClaimsCertified).toBe(false);
    expect(bundle.predictiveAllowed).toBe(false);
    expect(bundle.executionAllowed).toBe(false);
    expect(bundle.objectiveReadiness.version).toBe(1);
    expect(bundle.candidates.length).toBeGreaterThan(0);
    expect(bundle.candidates.every((c) => c.containsPredictionOutput === false)).toBe(true);
    expect(bundle.candidates.every((c) => c.productionExecutionEnabled === false)).toBe(true);

    expect(store.objectivePredictiveReadiness.length).toBe(1);
    expect(store.predictiveMethodCandidates.length).toBe(bundle.candidates.length);
    expect(store.healthIndexStates.length).toBe(0);
    expect(store.timeline.some((t) => t.kind === "predictive_objective_readiness")).toBe(true);
    expect(store.timeline.some((t) => t.kind === "predictive_method_candidate")).toBe(true);
    expect(store.outbox.every((o) => o.published)).toBe(true);
    expect(
      store.events.some(
        (e) => e.type === "engineering.asset.predictive_objective_readiness.assessed",
      ),
    ).toBe(true);
    expect(
      store.events.some((e) => e.type === "engineering.asset.predictive_method_candidate.proposed"),
    ).toBe(true);
  });

  it("holds probability of failure at not_ready end to end", async () => {
    const { engine } = memoryEngine();
    const result = await engine.assessObjectivePredictiveReadiness({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      objectiveId: "probability_of_failure",
      evidenceRefs: ["e1", "e2", "e3"],
      trendConfidence: trend(),
      observationCount: 24,
      observationWindowDays: 1095,
      evidenceAgeDays: 10,
      actorRole: "engineer",
    });
    expect(result.objectiveReadiness.readinessClass).toBe("not_ready");
    expect(result.abstained).toBe(true);
    expect(result.reviewInstanceId).toBeUndefined();
    expect(result.predictiveAllowed).toBe(false);
  });

  it("replays objective readiness idempotently and enforces version locks", async () => {
    const { engine } = memoryEngine();
    const cmd = {
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      objectiveId: "condition_trend_projection" as const,
      evidenceRefs: ["e1"],
      trendConfidence: trend(),
      observationCount: 24,
      observationWindowDays: 1095,
      evidenceAgeDays: 10,
      actorRole: "engineer" as const,
    };
    const first = await engine.assessObjectivePredictiveReadiness({
      ...cmd,
      idempotencyKey: "objective-readiness-1",
    });
    const replay = await engine.assessObjectivePredictiveReadiness({
      ...cmd,
      idempotencyKey: "objective-readiness-1",
    });
    expect(replay.idempotentReplay).toBe(true);
    expect(replay.objectiveReadiness.id).toBe(first.objectiveReadiness.id);

    await expect(
      engine.assessObjectivePredictiveReadiness({ ...cmd, expectedVersion: 99 }),
    ).rejects.toThrow(/optimistic_lock_conflict/);
  });

  it("qualifies a method under governed review without certifying it", async () => {
    const { engine, store } = memoryEngine();
    const started = await engine.startMethodQualification({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      methodId: "linear_trend_extrapolation",
      objectiveId: "condition_trend_projection",
      fixtureSetRef: "fixtures/condition_trend_v1",
      fixtureSetHash: "sha256:fixture-hash-1",
      fixtureCount: 40,
      acceptanceCriteria: [
        { metricId: "mae", comparator: "lte", threshold: 0.5, mandatory: true },
      ],
      observedMetrics: [{ metricId: "mae", observedValue: 0.2 }],
      reproducible: true,
      createdBy: "engineer-1",
      actorRole: "engineer",
    });

    expect(started.qualification.qualificationStatus).toBe("passed");
    expect(started.certificationGranted).toBe(false);
    expect(started.executionAllowed).toBe(false);
    expect(started.reviewInstanceId).toBeTruthy();

    const reviewed = await engine.reviewMethodQualification({
      tenantId: "t1",
      workspaceId: "w1",
      assetId: "a1",
      qualificationId: started.qualification.id,
      methodId: "linear_trend_extrapolation",
      objectiveId: "condition_trend_projection",
      workflowInstance: started.reviewWorkflowInstance!,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      publish: true,
      actorRole: "reviewer",
    });

    expect(reviewed.qualified).toBe(true);
    expect(reviewed.certificationGranted).toBe(false);
    expect(reviewed.executionAllowed).toBe(false);
    expect(reviewed.productionPredictiveExecutionEnabled).toBe(false);
    expect(reviewed.qualification.reviewStatus).toBe("published");
    expect(store.predictiveReviews.length).toBe(1);
    expect(store.predictiveReviews[0].grantsProductionExecution).toBe(false);
    expect(store.predictiveReviews[0].grantsCertification).toBe(false);
    expect(
      store.events.some(
        (e) => e.type === "engineering.asset.predictive_method_qualification.qualified",
      ),
    ).toBe(true);

    await expect(
      engine.reviewMethodQualification({
        tenantId: "t1",
        workspaceId: "w1",
        assetId: "a1",
        qualificationId: reviewed.qualification.id,
        methodId: "linear_trend_extrapolation",
        objectiveId: "condition_trend_projection",
        workflowInstance: started.reviewWorkflowInstance!,
        action: "approve",
        to: "approved",
        reviewerId: "reviewer-1",
        actorRole: "reviewer",
      }),
    ).rejects.toThrow("published_predictive_method_qualification_immutable");
  });

  it("refuses approval by the engineer who raised the qualification", async () => {
    const { engine } = memoryEngine();
    const started = await engine.startMethodQualification({
      tenantId: "t1",
      workspaceId: "w1",
      methodId: "linear_trend_extrapolation",
      objectiveId: "condition_trend_projection",
      fixtureSetRef: "fixtures/condition_trend_v1",
      fixtureSetHash: "sha256:fixture-hash-2",
      fixtureCount: 40,
      acceptanceCriteria: [
        { metricId: "mae", comparator: "lte", threshold: 0.5, mandatory: true },
      ],
      observedMetrics: [{ metricId: "mae", observedValue: 0.2 }],
      reproducible: true,
      createdBy: "engineer-1",
      actorRole: "engineer",
    });

    await expect(
      engine.reviewMethodQualification({
        tenantId: "t1",
        workspaceId: "w1",
        qualificationId: started.qualification.id,
        methodId: "linear_trend_extrapolation",
        objectiveId: "condition_trend_projection",
        workflowInstance: started.reviewWorkflowInstance!,
        action: "approve",
        to: "approved",
        reviewerId: "engineer-1",
        actorRole: "reviewer",
      }),
    ).rejects.toThrow("segregation_of_duties_violation");
  });

  it("forbids engineer self-approval across Phase 10J capabilities", () => {
    for (const capability of [
      "predictive_governance.approve",
      "predictive_governance.publish",
    ] as const) {
      expect(() => assertFailureCapability("engineer", capability)).toThrow(
        "engineer_self_approve_forbidden",
      );
    }
    expect(() => assertFailureCapability("engineer", "predictive_governance.assess")).not.toThrow();
    expect(() => assertFailureCapability("engineer", "predictive_governance.submit")).not.toThrow();
    expect(() => assertFailureCapability("reviewer", "predictive_governance.approve")).not.toThrow();
    expect(() => assertFailureCapability("viewer", "predictive_governance.assess")).toThrow(
      /failure_capability_denied/,
    );
    expect(() => assertFailureCapability("viewer", "predictive_governance.read")).not.toThrow();
  });

  it("routes predictive governance through its own review workflow", () => {
    const review = startPredictiveMethodReview({
      tenantId: "t1",
      workspaceId: "w1",
      subjectId: "qual-1",
      subjectKind: "method_qualification",
    });
    expect(review.instance.state).toBe("pending_review");
    expect(review.instance.definitionSlug).toBe("asset_intelligence.predictive_method_review");
  });
});
