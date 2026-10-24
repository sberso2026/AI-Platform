import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  SCENARIO_TYPES,
  assertNoAutoExecution,
  assertNoEarnedValueOrCpmInScenarioIntelligence,
  assertOwnershipLock,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  assertScenarioAdvisoryOnly,
  createScenarioIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectControlsEngine,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_SCENARIO_TABLES,
  PROJECT_CONTROLS_EVENTS,
  SCENARIO_REVIEW_WORKFLOW,
  startScenarioReview,
  transitionScenarioReview,
  assertScenarioPublishable,
  type ScenarioControlContext,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function scenarioControlContext(): ScenarioControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    scenarioUnitId: "scn-001",
    scenarioUnitLabel: "Scenario thread A",
  };
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

describe("Phase 11I scenario taxonomy", () => {
  it("defines deterministic advisory scenario types", () => {
    expect(SCENARIO_TYPES).toEqual([
      "maintain_current_posture",
      "investigate",
      "coordinate",
      "prioritise",
      "defer",
      "recovery_planning",
      "alternative_sequence",
      "unknown",
    ]);
  });
});

describe("Phase 11I scenario intelligence engine", () => {
  it("abstains without published composed contributors", () => {
    const outcome = createScenarioIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: scenarioControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.scenarioOptions).toHaveLength(0);
    expect(outcome.state.mutatesUpstreamContributors).toBe(false);
  });

  it("never selects a preferred scenario or performs optimisation", () => {
    const engine = createScenarioIntelligenceEngine();
    const outcome = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: scenarioControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.state.preferredScenarioSelected).toBe(false);
    expect(outcome.state.optimisationPerformed).toBe(false);
    expect(outcome.state.comparison.preferredScenarioSelected).toBe(false);
    expect(outcome.state.comparison.optimisationPerformed).toBe(false);
    for (const option of outcome.state.scenarioOptions) {
      expect(option.selectionClaimed).toBe(false);
    }
  });

  it("keeps auto-execution and EV forbidden", () => {
    expect(assertNoAutoExecution().automaticScenarioExecutionEnabled).toBe(false);
    expect(assertNoEarnedValueOrCpmInScenarioIntelligence().earnedValueImplemented).toBe(false);
    expect(assertScenarioAdvisoryOnly().advisoryOnly).toBe(true);
  });

  it("does not fabricate numerical precision in confidence", () => {
    const outcome = createScenarioIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: scenarioControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.confidence.numericalPrecisionClaimed).toBe(false);
    expect(outcome.confidence.monteCarloClaimed).toBe(false);
    expect(outcome.state.numericalPrecisionClaimed).toBe(false);
    expect(outcome.state.monteCarloPerformed).toBe(false);
  });
});

describe("Phase 11I scenario review workflow", () => {
  it("defines scenario_review and forbids self-approval", () => {
    expect(SCENARIO_REVIEW_WORKFLOW.slug).toBe("project_controls.scenario_review");
    const started = startScenarioReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertScenarioPublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/scenario_self_approval_forbidden/);
    const approved = transitionScenarioReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11I project context with scenario intelligence", () => {
  it("lists nine active contributors including scenario_intelligence", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(12);
    expect(check.activeContributorKeys).toContain("scenario_intelligence");
    expect(check.activeContributorKeys).toContain("risk_opportunity_intelligence");
  });
});

describe("Phase 11I locks", () => {
  it("enumerates scenario events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.scenario.updated");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.scenario.published");
  });

  it("declares Phase 11I scenario tables", () => {
    expect(PROJECT_CONTROLS_SCENARIO_TABLES).toEqual([
      "project_controls_scenario_states",
      "project_controls_scenario_evidence",
      "project_controls_scenario_reviews",
      "project_controls_scenario_confidence",
    ]);
  });

  it("grants scenario assessment capabilities", () => {
    expect(assertReservedProvidersUnimplemented().ok).toBe(true);
    expect(assertOwnershipLock().ok).toBe(true);
  });
});

describe("Phase 11I scenario orchestration", () => {
  it("persists scenario state through assess path", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.assessScenario({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: scenarioControlContext(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      asOf: AS_OF,
      startReview: false,
    });
    expect(result.abstained).toBe(true);
    expect(store.scenarioStates.length).toBe(1);
    expect(result.preferredScenarioSelected).toBe(false);
  });
});
