import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  assertNoForecastOrEarnedValueInProductivityIntelligence,
  assertNoLabourProductivityMetrics,
  assertNoWorkforceManagement,
  assertNoReservedCapabilities,
  assertOwnershipLock,
  assertProductivityPublishable,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  PRODUCTIVITY_REVIEW_WORKFLOW,
  createProductivityIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectContextEngine,
  createProjectControlsEngine,
  createReservedProductivityProvider,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_PRODUCTIVITY_TABLES,
  PROJECT_CONTROLS_EVENTS,
  startProductivityReview,
  transitionProductivityReview,
  type ProductivityControlContext,
  type ProductivityEvidence,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function productivityControlContext(): ProductivityControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    controlUnitId: "wp-001",
    controlUnitLabel: "Berth 7 Civil Works",
  };
}

function productivityEvidence(overrides: Partial<ProductivityEvidence> = {}): ProductivityEvidence {
  return {
    evidenceId: overrides.evidenceId ?? `pev-${Math.random().toString(36).slice(2, 8)}`,
    kind: overrides.kind ?? "completed_quantity_reference",
    sourceType: overrides.sourceType ?? "progress_intelligence",
    sourceRef: overrides.sourceRef ?? "prog-001",
    sourceKey: overrides.sourceKey ?? "progress.intelligence",
    provenance: overrides.provenance ?? "primary_source",
    reviewStatus: overrides.reviewStatus ?? "approved",
    observedAt: overrides.observedAt ?? "2026-08-07T00:00:00.000Z",
    declaredTrend: overrides.declaredTrend ?? "improving",
    derivedFromTimesheet: false,
    derivedFromPayroll: false,
    labourProductivityPercentClaimed: false,
    resourcePlanningClaimed: false,
    forecastDerived: false,
    earnedValueDerived: false,
    mutatesCoreRisk: false,
  };
}

function goodProductivityEvidence(): ProductivityEvidence[] {
  return [
    productivityEvidence({ evidenceId: "pev-1", declaredTrend: "improving" }),
    productivityEvidence({
      evidenceId: "pev-2",
      kind: "progress_assessment_ref",
      declaredTrend: "improving",
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
  return { store, repository, events, engine };
}

describe("Phase 11F productivity intelligence engine", () => {
  it("abstains with no evidence and publishes unknown posture", () => {
    const outcome = createProductivityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: productivityControlContext(),
      evidence: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.productivityPosture).toBe("unknown");
  });

  it("derives improving posture with sufficient evidence", () => {
    const outcome = createProductivityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: productivityControlContext(),
      evidence: goodProductivityEvidence(),
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(false);
    expect(outcome.state.productivityPosture).toBe("improving");
    expect(outcome.state.workforceManagementPerformed).toBe(false);
    expect(outcome.state.labourProductivityPercentComputed).toBe(false);
  });

  it("keeps workforce, labour % and forecast forbidden", () => {
    expect(assertNoWorkforceManagement().payrollImplemented).toBe(false);
    expect(assertNoLabourProductivityMetrics().labourCostEngineImplemented).toBe(false);
    expect(assertNoForecastOrEarnedValueInProductivityIntelligence().earnedValueImplemented).toBe(
      false,
    );
  });
});

describe("Phase 11F productivity review workflow", () => {
  it("defines productivity_review and forbids self-approval", () => {
    expect(PRODUCTIVITY_REVIEW_WORKFLOW.slug).toBe("project_controls.productivity_review");
    const started = startProductivityReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertProductivityPublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/productivity_self_approval_forbidden/);
    const approved = transitionProductivityReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11F project context with productivity", () => {
  it("lists seven active contributors including productivity_intelligence", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(10);
    expect(check.activeContributorKeys).toContain("productivity_intelligence");
    expect(check.activeContributorKeys).toContain("forecast");
    expect(check.activeContributorKeys).toContain("decision_support");
  });

  it("composes a profile carrying the productivity rollup", () => {
    const assessed = createProductivityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: productivityControlContext(),
      evidence: goodProductivityEvidence(),
      asOf: AS_OF,
    }).state;

    const outcome = createProjectContextEngine().compose({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectReference: createProjectReferenceFixture({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
      }),
      progress: [],
      productivity: [assessed],
    });

    expect(outcome.profile.productivity?.productivityAssessed).toBe(1);
    expect(outcome.profile.productivity?.dominantPosture).toBe("improving");
    expect(outcome.profile.productivity?.labourProductivityPercentClaimed).toBe(false);
    expect(outcome.profile.activeContributorKeys).toContain("productivity_intelligence");
  });
});

describe("Phase 11F productivity orchestration", () => {
  it("persists productivity state, evidence, confidence, timeline and outbox", async () => {
    const { engine, store, events } = memoryEngine();
    const result = await engine.assessProductivity({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: productivityControlContext(),
      evidence: goodProductivityEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });

    expect(result.abstained).toBe(false);
    expect(result.workforceManagementPerformed).toBe(false);
    expect(store.productivityStates.length).toBe(1);
    expect(store.productivityEvidence.length).toBe(2);
    expect(store.productivityConfidence.length).toBe(1);
    expect(store.productivityReviews.length).toBe(1);
    expect(store.projectTimeline.length).toBe(1);
    expect(store.outbox[0].eventType).toBe("engineering.project.productivity.updated");
    expect(
      events.published().some((e) => e.eventType === "engineering.project.productivity.updated"),
    ).toBe(true);
  });
});

describe("Phase 11F locks", () => {
  it("enumerates productivity events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.productivity.updated");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.productivity.reviewed");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.productivity.published");
  });

  it("keeps productivity intelligence owned by project_controls", () => {
    const lock = assertOwnershipLock();
    expect(lock.productivityIntelligenceOwnership).toBe("project_controls");
  });

  it("keeps ProductivityProvider unit-rate methods not_implemented", async () => {
    assertReservedProvidersUnimplemented();
    const productivity = createReservedProductivityProvider();
    await expect(
      productivity.getUnitRates({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        scope: { kind: "project", projectId: PROJECT },
      }),
    ).rejects.toThrow(/not_implemented:productivity.getUnitRates/);
  });

  it("grants productivity assessment capabilities but not EV capability", () => {
    expect(assertNoReservedCapabilities().ok).toBe(true);
  });

  it("declares Phase 11F productivity tables", () => {
    expect(PROJECT_CONTROLS_PRODUCTIVITY_TABLES).toEqual([
      "project_controls_productivity_states",
      "project_controls_productivity_evidence",
      "project_controls_productivity_reviews",
      "project_controls_productivity_confidence",
    ]);
  });
});
