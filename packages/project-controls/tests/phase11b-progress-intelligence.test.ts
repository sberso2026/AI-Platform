import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  assertNoEarnedValue,
  assertProjectControlsCapability,
  assertProjectProfileContributorsComplete,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProgressConfidenceEngine,
  createProgressIntelligenceEngine,
  createProjectContextEngine,
  createProjectControlsEngine,
  createProjectControlsRepository,
  MemoryProjectControlsRepository,
  PROGRESS_REVIEW_WORKFLOW,
  PROJECT_CONTROLS_EVENTS,
  PROJECT_PROFILE_CONTRIBUTORS,
  ProjectControlsService,
  progressBandFor,
  roleHasCapability,
  startProgressReview,
  transitionProgressReview,
  type ProgressEvidence,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";

function evidence(overrides: Partial<ProgressEvidence> = {}): ProgressEvidence {
  return {
    evidenceId: overrides.evidenceId ?? `ev-${Math.random().toString(36).slice(2, 8)}`,
    kind: overrides.kind ?? "site_observation",
    sourceType: overrides.sourceType ?? "manual_engineering_assessment",
    sourceKey: overrides.sourceKey ?? "manual.engineering_assessment",
    observedAt: overrides.observedAt ?? "2026-08-07T00:00:00.000Z",
    indicatedCompletion: overrides.indicatedCompletion,
    weight: overrides.weight,
    reviewStatus: overrides.reviewStatus ?? "approved",
    revoked: overrides.revoked,
    conflictsWith: overrides.conflictsWith,
    narrative: overrides.narrative,
    sourceReference: overrides.sourceReference,
    derivedFromEarnedValue: false,
    derivedFromCostData: false,
  };
}

function goodEvidence() {
  return [
    evidence({
      evidenceId: "ev-1",
      sourceKey: "manual.engineering_assessment",
      indicatedCompletion: 0.6,
    }),
    evidence({
      evidenceId: "ev-2",
      kind: "inspection_result",
      sourceType: "inspection_intelligence",
      sourceKey: "inspection_intelligence.public_contracts",
      indicatedCompletion: 0.65,
    }),
    evidence({
      evidenceId: "ev-3",
      kind: "quantity_record",
      sourceType: "external_import",
      sourceKey: "external.quantity_survey",
      indicatedCompletion: 0.62,
    }),
  ];
}

function memoryEngine() {
  const store = createDurableProjectControlsMemoryStore();
  const repository = new MemoryProjectControlsRepository(store);
  const events = createInProcessProjectControlsEventPipeline();
  const projectDomainPort = createInMemorySharedProjectDomainPort({
    projects: [
      createProjectReferenceFixture({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        projectCode: "PRJ-001",
        projectName: "Berth 7 Upgrade",
      }),
    ],
  });
  const engine = createProjectControlsEngine({ projectDomainPort, repository, events });
  return { store, repository, events, engine, service: new ProjectControlsService(engine) };
}

describe("Phase 11B progress intelligence engine", () => {
  it("abstains with no evidence and publishes no indication", () => {
    const engine = createProgressIntelligenceEngine();
    const result = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: [],
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(result.abstained).toBe(true);
    expect(result.abstentionReason).toBe("no_progress_evidence");
    expect(result.assessment.assessmentClass).toBe("abstained");
    expect(result.assessment.indicatedCompletion).toBeUndefined();
    expect(result.assessment.band).toBe("unavailable");
    expect(result.assessment.confidence.confidenceClass).toBe("unavailable");
    expect(result.assessment.earnedValueComputed).toBe(false);
    expect(result.assessment.criticalPathComputed).toBe(false);
    expect(result.assessment.advisoryOnly).toBe(true);
  });

  it("abstains when evidence is qualitative only", () => {
    const engine = createProgressIntelligenceEngine();
    const result = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: [
        evidence({ evidenceId: "q-1", narrative: "Crew mobilised" }),
        evidence({ evidenceId: "q-2", sourceKey: "external.diary", narrative: "Formwork begun" }),
      ],
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(result.abstained).toBe(true);
    expect(result.assessment.indicatedCompletion).toBeUndefined();
    expect(result.assessment.reasons).toContain("no_quantified_evidence");
  });

  it("abstains when sources disagree beyond the threshold", () => {
    const engine = createProgressIntelligenceEngine();
    const result = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "wbs_node", projectId: PROJECT, referenceId: "wbs-1" },
      evidence: [
        evidence({ evidenceId: "d-1", indicatedCompletion: 0.2 }),
        evidence({ evidenceId: "d-2", sourceKey: "supplier.report", indicatedCompletion: 0.9 }),
      ],
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(result.abstained).toBe(true);
    expect(result.abstentionReason).toBe("conflicting_progress_evidence");
    expect(result.assessment.confidence.conflictState).toBe("detected");
  });

  it("abstains when evidence is stale", () => {
    const engine = createProgressIntelligenceEngine();
    const result = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence().map((item) =>
        evidence({ ...item, observedAt: "2024-01-01T00:00:00.000Z" }),
      ),
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(result.abstained).toBe(true);
    expect(result.abstentionReason).toBe("stale_progress_evidence");
  });

  it("abstains when declared conflicts exist", () => {
    const engine = createProgressIntelligenceEngine();
    const result = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: [
        evidence({ evidenceId: "c-1", indicatedCompletion: 0.5, conflictsWith: ["c-2"] }),
        evidence({ evidenceId: "c-2", sourceKey: "supplier.report", indicatedCompletion: 0.52 }),
      ],
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(result.abstained).toBe(true);
    expect(result.assessment.confidence.reasons).toContain("declared_evidence_conflict");
  });

  it("produces an advisory indication when the basis is sufficient", () => {
    const engine = createProgressIntelligenceEngine();
    const result = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      asOf: "2026-08-08T00:00:00.000Z",
      previousIndication: 0.4,
    });
    expect(result.abstained).toBe(false);
    expect(result.assessment.assessmentClass).toBe("assessed");
    expect(result.assessment.indicatedCompletion).toBeGreaterThan(0.55);
    expect(result.assessment.indicatedCompletion).toBeLessThan(0.7);
    expect(result.assessment.band).toBe("in_progress");
    expect(result.assessment.trendDirection).toBe("improving");
    expect(result.assessment.physicalPercentCompleteCertified).toBe(false);
    expect(result.assessment.paymentCertificationClaimed).toBe(false);
    expect(result.assessment.forecastProduced).toBe(false);
  });

  it("excludes revoked evidence from the indication", () => {
    const engine = createProgressIntelligenceEngine();
    const result = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: [
        ...goodEvidence(),
        evidence({ evidenceId: "revoked-1", indicatedCompletion: 1, revoked: true }),
      ],
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(result.assessment.confidence.reasons).toContain("revoked_evidence_excluded");
    expect(result.assessment.indicatedCompletion).toBeLessThan(0.7);
  });

  it("refuses evidence derived from earned value or cost", () => {
    const engine = createProgressIntelligenceEngine();
    expect(() =>
      engine.assess({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        scope: { kind: "project", projectId: PROJECT },
        evidence: [
          { ...evidence({ indicatedCompletion: 0.5 }), derivedFromEarnedValue: true } as never,
        ],
      }),
    ).toThrow(/progress_evidence_may_not_derive_from_earned_value_or_cost/);
  });

  it("requires a reference id for non-project scopes", () => {
    const engine = createProgressIntelligenceEngine();
    expect(() =>
      engine.assess({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        scope: { kind: "activity", projectId: PROJECT },
        evidence: goodEvidence(),
      }),
    ).toThrow(/scope_reference_id_required/);
  });

  it("keeps the earned value and CPM guard closed", () => {
    const guard = assertNoEarnedValue();
    expect(guard.earnedValueImplemented).toBe(false);
    expect(guard.cpmImplemented).toBe(false);
    expect(guard.costEngineImplemented).toBe(false);
    expect(guard.forecastingImplemented).toBe(false);
  });

  it("bands indications without weighting by budget or duration", () => {
    expect(progressBandFor(0)).toBe("not_started");
    expect(progressBandFor(0.1)).toBe("early");
    expect(progressBandFor(0.5)).toBe("in_progress");
    expect(progressBandFor(0.8)).toBe("advanced");
    expect(progressBandFor(0.97)).toBe("substantially_complete");
    expect(progressBandFor(1)).toBe("complete");
  });
});

describe("Phase 11B progress confidence engine", () => {
  it("classifies a thin single-source basis as insufficient", () => {
    const engine = createProgressConfidenceEngine();
    const confidence = engine.assess({
      confidenceId: "c1",
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: [evidence({ indicatedCompletion: 0.5, reviewStatus: "unreviewed" })],
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(confidence.dataSufficiency).toBe("insufficient");
    expect(confidence.confidenceClass).toBe("unavailable");
    expect(confidence.reasons).toContain("single_source_basis");
    expect(confidence.engineeringCorrectnessClaimed).toBe(false);
  });

  it("rates a diverse reviewed fresh basis as sufficient", () => {
    const engine = createProgressConfidenceEngine();
    const confidence = engine.assess({
      confidenceId: "c2",
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(["sufficient", "limited"]).toContain(confidence.dataSufficiency);
    expect(confidence.conflictState).toBe("none");
    expect(confidence.usableEvidenceCount).toBe(3);
    expect(confidence.method).toBe("progress_confidence_v1");
  });
});

describe("Phase 11B project context engine", () => {
  it("lists exactly one active contributor and keeps EV/forecast reserved", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toEqual(["progress_intelligence"]);
    expect(check.reservedContributorKeys).toContain("earned_value");
    expect(check.reservedContributorKeys).toContain("forecast");
    expect(check.reservedContributorKeys).toContain("cost_intelligence");
    expect(PROJECT_PROFILE_CONTRIBUTORS.length).toBe(8);
  });

  it("abstains when no progress intelligence exists", () => {
    const contextEngine = createProjectContextEngine();
    const outcome = contextEngine.compose({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectReference: createProjectReferenceFixture({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
      }),
      progress: [],
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.abstentionReason).toBe("no_progress_intelligence_available");
    expect(outcome.profile.profileClass).toBe("abstained");
    expect(outcome.profile.progress.projectScopeIndication).toBeUndefined();
    expect(outcome.profile.earnedValueComputed).toBe(false);
    expect(outcome.profile.isProjectRegistry).toBe(false);
  });

  it("composes a profile from an assessed progress state", () => {
    const progressEngine = createProgressIntelligenceEngine();
    const assessed = progressEngine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      asOf: "2026-08-08T00:00:00.000Z",
    }).assessment;

    const outcome = createProjectContextEngine().compose({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectReference: createProjectReferenceFixture({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        projectCode: "PRJ-001",
        projectName: "Berth 7 Upgrade",
      }),
      progress: [assessed],
    });
    expect(outcome.abstained).toBe(false);
    expect(outcome.profile.projectCode).toBe("PRJ-001");
    expect(outcome.profile.progress.scopesAssessed).toBe(1);
    expect(outcome.profile.progress.projectScopeBand).toBe("in_progress");
    expect(outcome.profile.profileClass).toBe("partially_composed");
    expect(outcome.profile.activeContributorKeys).toEqual(["progress_intelligence"]);
    expect(outcome.profile.mutatesProjectIdentity).toBe(false);
  });

  it("rejects a project reference from the wrong owner", () => {
    const reference = {
      ...createProjectReferenceFixture({ tenantId: TENANT, projectId: PROJECT }),
      owner: "project_controls",
    } as never;
    expect(() =>
      createProjectContextEngine().compose({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectReference: reference,
        progress: [],
      }),
    ).toThrow(/project_reference_owner_mismatch/);
  });
});

describe("Phase 11B role matrix and review workflow", () => {
  it("separates assessment from approval", () => {
    expect(roleHasCapability("project_controls_engineer", "progress.assess")).toBe(true);
    expect(roleHasCapability("project_controls_engineer", "progress.approve")).toBe(false);
    expect(roleHasCapability("project_controls_engineer", "progress.publish")).toBe(false);
    expect(roleHasCapability("approver", "progress.publish")).toBe(true);
    expect(roleHasCapability("viewer", "progress.assess")).toBe(false);
    expect(() =>
      assertProjectControlsCapability("reviewer", "progress.approve"),
    ).toThrow(/project_controls_capability_denied/);
    expect(() =>
      assertProjectControlsCapability("approver", "progress.approve", {
        actorId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/project_controls_self_approval_forbidden/);
  });

  it("defines the progress review workflow on the Workflow SDK", () => {
    expect(PROGRESS_REVIEW_WORKFLOW.slug).toBe("project_controls.progress_review");
    expect(PROGRESS_REVIEW_WORKFLOW.moduleKey).toBe("project_controls");
    expect(PROGRESS_REVIEW_WORKFLOW.initialState).toBe("draft");
    const started = startProgressReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
      startedBy: "u1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(started.review.status).toBe("pending");
    const approved = transitionProgressReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
    expect(PROGRESS_REVIEW_WORKFLOW.states).toContain("published");
    const published = transitionProgressReview({
      instance: approved,
      action: "publish",
      to: "published",
    });
    expect(published.state).toBe("published");
  });

  it("enumerates exactly the four Phase 11B events", () => {
    expect(PROJECT_CONTROLS_EVENTS).toEqual([
      "engineering.project.progress.updated",
      "engineering.project.progress.reviewed",
      "engineering.project.progress.published",
      "engineering.project.profile.updated",
    ]);
  });
});

describe("Phase 11B persistence and orchestration", () => {
  it("forbids the memory repository in production", () => {
    expect(() =>
      createProjectControlsRepository({ adapter: "memory", nodeEnv: "production" }),
    ).toThrow(/production_memory_repository_forbidden/);
    expect(() =>
      createProjectControlsRepository({ adapter: "postgres", nodeEnv: "production" }),
    ).toThrow(/postgres_repository_requires_supabase_client/);
  });

  it("persists a versioned assessment, snapshot, timeline, outbox and event", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.assessProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      idempotencyKey: "progress-1",
    });
    expect(result.abstained).toBe(false);
    expect(result.assessment.version).toBe(1);
    expect(result.assessment.status).toBe("pending_review");
    expect(result.projectIdentityMutated).toBe(false);
    expect(result.earnedValueComputed).toBe(false);
    expect(store.progressAssessments.length).toBe(1);
    expect(store.progressEvidence.length).toBe(3);
    expect(store.progressSnapshots.length).toBe(1);
    expect(store.progressTimeline.length).toBe(1);
    expect(store.outbox.length).toBe(1);
    expect(store.outbox[0].eventType).toBe("engineering.project.progress.updated");

    const replay = await engine.assessProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      idempotencyKey: "progress-1",
    });
    expect(replay.idempotentReplay).toBe(true);
    expect(store.progressAssessments.length).toBe(1);
  });

  it("fails closed when the project reference cannot be resolved", async () => {
    const { engine } = memoryEngine();
    await expect(
      engine.assessProgress({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: "99999999-9999-9999-9999-999999999999",
        scope: { kind: "project", projectId: "99999999-9999-9999-9999-999999999999" },
        evidence: goodEvidence(),
        actorRole: "project_controls_engineer",
      }),
    ).rejects.toThrow(/project_reference_not_found/);
  });

  it("reviews, publishes and then treats the published state as immutable", async () => {
    const { engine, store } = memoryEngine();
    const assessed = await engine.assessProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });
    const published = await engine.reviewProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: assessed.assessment.stateId,
      workflowInstance: assessed.workflowInstance!,
      action: "approve",
      to: "approved",
      reviewerId: "reviewer-1",
      actorRole: "approver",
      publish: true,
    });
    expect(published.published).toBe(true);
    expect(published.assessment.status).toBe("published");
    expect(published.assessment.version).toBe(2);
    expect(published.assessment.supersedesId).toBe(assessed.assessment.stateId);
    expect(store.outbox.some((e) => e.eventType === "engineering.project.progress.published")).toBe(
      true,
    );

    await expect(
      engine.reviewProgress({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        assessmentStateId: published.assessment.stateId,
        workflowInstance: published.workflowInstance,
        action: "approve",
        to: "approved",
        reviewerId: "reviewer-1",
        actorRole: "approver",
      }),
    ).rejects.toThrow(/published_progress_assessment_immutable/);
  });

  it("refuses to review an abstained assessment", async () => {
    const { engine } = memoryEngine();
    const abstained = await engine.assessProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: [],
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });
    expect(abstained.abstained).toBe(true);
    expect(abstained.workflowInstance).toBeUndefined();
    const started = startProgressReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: abstained.assessment.stateId,
    });
    await expect(
      engine.reviewProgress({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        assessmentStateId: abstained.assessment.stateId,
        workflowInstance: started.instance,
        action: "approve",
        to: "approved",
        reviewerId: "reviewer-1",
        actorRole: "approver",
      }),
    ).rejects.toThrow(/abstained_progress_assessment_not_reviewable/);
  });

  it("blocks self-approval through the engine", async () => {
    const { engine } = memoryEngine();
    const assessed = await engine.assessProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });
    await expect(
      engine.reviewProgress({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        assessmentStateId: assessed.assessment.stateId,
        workflowInstance: assessed.workflowInstance!,
        action: "approve",
        to: "approved",
        reviewerId: "engineer-1",
        actorRole: "approver",
        publish: true,
      }),
    ).rejects.toThrow(/self_approval_forbidden/);
  });

  it("detects optimistic lock conflicts", async () => {
    const { engine } = memoryEngine();
    await engine.assessProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      actorRole: "project_controls_engineer",
    });
    await expect(
      engine.assessProgress({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        scope: { kind: "project", projectId: PROJECT },
        evidence: goodEvidence(),
        actorRole: "project_controls_engineer",
        expectedVersion: 0,
      }),
    ).rejects.toThrow(/optimistic_lock_conflict/);
  });

  it("denies progress assessment to a viewer", async () => {
    const { engine } = memoryEngine();
    await expect(
      engine.assessProgress({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        scope: { kind: "project", projectId: PROJECT },
        evidence: goodEvidence(),
        actorRole: "viewer",
      }),
    ).rejects.toThrow(/project_controls_capability_denied/);
  });

  it("composes and persists a project profile through the service facade", async () => {
    const { service, engine, store } = memoryEngine();
    await service.assessProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });
    const composed = await service.composeProjectProfile({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });
    expect(composed.abstained).toBe(false);
    expect(composed.profile.version).toBe(1);
    expect(store.projectProfiles.length).toBe(1);
    expect(
      store.outbox.some((e) => e.eventType === "engineering.project.profile.updated"),
    ).toBe(true);

    const latest = await engine.getLatestProjectProfile({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      actorRole: "viewer",
    });
    expect(latest?.profileId).toBe(composed.profile.profileId);
  });

  it("isolates tenants in the memory repository", async () => {
    const { engine, repository } = memoryEngine();
    await engine.assessProgress({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodEvidence(),
      actorRole: "project_controls_engineer",
    });
    const foreign = await repository.listProgressAssessments(
      "99999999-9999-9999-9999-999999999999",
      WORKSPACE,
      PROJECT,
    );
    expect(foreign.length).toBe(0);
  });
});
