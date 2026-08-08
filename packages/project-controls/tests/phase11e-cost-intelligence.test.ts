import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  assertCostPublishable,
  assertNoEarnedValueInCostIntelligence,
  assertNoFinancialPosting,
  assertNoForecastEngine,
  assertNoReservedCapabilities,
  assertOwnershipLock,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  COST_REVIEW_WORKFLOW,
  createCostIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectContextEngine,
  createProjectControlsEngine,
  createReservedCostProvider,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_COST_TABLES,
  PROJECT_CONTROLS_EVENTS,
  startCostReview,
  transitionCostReview,
  type CostBasisReference,
  type CostControlContext,
  type CostEvidence,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function costControlContext(): CostControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    accountRef: {
      accountId: "acct-001",
      accountCode: "1000",
      currencyCode: "AUD",
      ownedByProjectControls: false,
    },
    currencyCode: "AUD",
  };
}

function costBasis(): CostBasisReference {
  return {
    referenceId: "basis-001",
    kind: "approved_budget",
    authorityOwner: "external_finance_or_future_finance_domain",
    currencyCode: "AUD",
    ownedByProjectControls: false,
    mutatesBudget: false,
    financialPostingClaimed: false,
  };
}

function costEvidence(overrides: Partial<CostEvidence> = {}): CostEvidence {
  return {
    evidenceId: overrides.evidenceId ?? `cev-${Math.random().toString(36).slice(2, 8)}`,
    kind: overrides.kind ?? "actual_cost_reference",
    sourceType: overrides.sourceType ?? "external_cost_register",
    sourceRef: overrides.sourceRef ?? "reg-001",
    sourceKey: overrides.sourceKey ?? "external.cost_register",
    provenance: overrides.provenance ?? "primary_source",
    reviewStatus: overrides.reviewStatus ?? "approved",
    observedAt: overrides.observedAt ?? "2026-08-07T00:00:00.000Z",
    currencyCode: overrides.currencyCode ?? "AUD",
    declaredDirection: overrides.declaredDirection ?? "over_basis",
    derivedFromEarnedValue: false,
    mutatesCoreRisk: false,
    mutatesBudget: false,
    financialPostingClaimed: false,
    forecastDerived: false,
  };
}

function goodCostEvidence(): CostEvidence[] {
  return [
    costEvidence({ evidenceId: "cev-1", declaredDirection: "over_basis" }),
    costEvidence({
      evidenceId: "cev-2",
      kind: "commitment_reference",
      declaredDirection: "over_basis",
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

describe("Phase 11E cost intelligence engine", () => {
  it("abstains with no evidence and publishes unknown posture", () => {
    const outcome = createCostIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: costControlContext(),
      costBasisRef: costBasis(),
      evidence: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.costPosture).toBe("unknown");
    expect(outcome.state.varianceAttribution).toBe("insufficient_evidence");
  });

  it("abstains on incompatible currencies without conversion ref", () => {
    const outcome = createCostIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: costControlContext(),
      costBasisRef: { ...costBasis(), currencyCode: "USD" },
      evidence: goodCostEvidence(),
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
  });

  it("derives over posture with valid basis and compatible evidence", () => {
    const outcome = createCostIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: costControlContext(),
      costBasisRef: costBasis(),
      evidence: goodCostEvidence(),
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(false);
    expect(outcome.state.costPosture).toBe("over");
    expect(outcome.state.budgetMutated).toBe(false);
    expect(outcome.state.financialPostingPerformed).toBe(false);
  });

  it("keeps earned value, financial posting and forecast forbidden", () => {
    expect(assertNoEarnedValueInCostIntelligence().earnedValueImplemented).toBe(false);
    expect(assertNoFinancialPosting().financialPostingImplemented).toBe(false);
    expect(assertNoForecastEngine().forecastEngineImplemented).toBe(false);
  });
});

describe("Phase 11E cost review workflow", () => {
  it("defines cost_review and forbids self-approval", () => {
    expect(COST_REVIEW_WORKFLOW.slug).toBe("project_controls.cost_review");
    const started = startCostReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertCostPublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/cost_self_approval_forbidden/);
    const approved = transitionCostReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11E project context with cost", () => {
  it("lists five active contributors including productivity_intelligence", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(10);
    expect(check.activeContributorKeys).toContain("cost_intelligence");
    expect(check.activeContributorKeys).toContain("productivity_intelligence");
  });

  it("composes a profile carrying the cost rollup", () => {
    const assessed = createCostIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: costControlContext(),
      costBasisRef: costBasis(),
      evidence: goodCostEvidence(),
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
      cost: [assessed],
    });

    expect(outcome.profile.cost?.costsAssessed).toBe(1);
    expect(outcome.profile.cost?.dominantPosture).toBe("over");
    expect(outcome.profile.cost?.financialPostingClaimed).toBe(false);
    expect(outcome.profile.activeContributorKeys).toContain("cost_intelligence");
  });
});

describe("Phase 11E cost orchestration", () => {
  it("persists cost state, evidence, confidence, timeline and outbox", async () => {
    const { engine, store, events } = memoryEngine();
    const result = await engine.assessCost({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: costControlContext(),
      costBasisRef: costBasis(),
      evidence: goodCostEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });

    expect(result.abstained).toBe(false);
    expect(result.budgetMutated).toBe(false);
    expect(store.costStates.length).toBe(1);
    expect(store.costEvidence.length).toBe(2);
    expect(store.costConfidence.length).toBe(1);
    expect(store.costReviews.length).toBe(1);
    expect(store.projectTimeline.length).toBe(1);
    expect(store.outbox[0].eventType).toBe("engineering.project.cost.assessed");
    expect(events.published().some((e) => e.eventType === "engineering.project.cost.assessed")).toBe(
      true,
    );
  });
});

describe("Phase 11E locks", () => {
  it("enumerates cost events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.cost.assessed");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.cost.variance_attributed");
  });

  it("keeps cost intelligence owned by project_controls and ledger external", () => {
    const lock = assertOwnershipLock();
    expect(lock.costIntelligenceOwnership).toBe("project_controls");
    expect(lock.financialLedgerOwnership).toBe("external_finance_or_future_finance_domain");
  });

  it("keeps ledger CostProvider methods not_implemented", async () => {
    assertReservedProvidersUnimplemented();
    const cost = createReservedCostProvider();
    await expect(
      cost.getBudget({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        scope: { kind: "project", projectId: PROJECT },
      }),
    ).rejects.toThrow(/not_implemented:cost.getBudget/);
  });

  it("grants cost assessment capabilities but not EV capability", () => {
    expect(assertNoReservedCapabilities().ok).toBe(true);
  });

  it("declares Phase 11E cost tables", () => {
    expect(PROJECT_CONTROLS_COST_TABLES).toEqual([
      "project_controls_cost_states",
      "project_controls_cost_evidence",
      "project_controls_cost_reviews",
      "project_controls_cost_confidence",
    ]);
  });
});
