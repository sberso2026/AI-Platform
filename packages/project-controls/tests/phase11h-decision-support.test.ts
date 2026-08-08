import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  assertDecisionAdvisoryOnly,
  assertDecisionPublishable,
  assertNoAutoExecutionInDecisionSupport as assertNoAutoExecution,
  assertNoEarnedValueOrCpmInDecisionSupport,
  assertNoReservedCapabilities,
  assertOwnershipLock,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  DECISION_REVIEW_WORKFLOW,
  createDecisionSupportEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectControlsEngine,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_DECISION_TABLES,
  PROJECT_CONTROLS_EVENTS,
  startDecisionReview,
  transitionDecisionReview,
  type DecisionControlContext,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function decisionControlContext(): DecisionControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    decisionUnitId: "dec-001",
    decisionUnitLabel: "Governance thread A",
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

describe("Phase 11H decision support engine", () => {
  it("abstains without published composed contributors", () => {
    const outcome = createDecisionSupportEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: decisionControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.recommendations).toHaveLength(0);
    expect(outcome.state.mutatesUpstreamContributors).toBe(false);
  });

  it("keeps auto-execution and EV forbidden", () => {
    expect(assertNoAutoExecution().automaticDecisionExecutionEnabled).toBe(false);
    expect(assertNoEarnedValueOrCpmInDecisionSupport().earnedValueImplemented).toBe(false);
    expect(assertDecisionAdvisoryOnly().advisoryOnly).toBe(true);
  });
});

describe("Phase 11H decision review workflow", () => {
  it("defines decision_review and forbids self-approval", () => {
    expect(DECISION_REVIEW_WORKFLOW.slug).toBe("project_controls.decision_review");
    const started = startDecisionReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertDecisionPublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/decision_self_approval_forbidden/);
    const approved = transitionDecisionReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11H project context with decision support", () => {
  it("lists nine active contributors including decision_support and scenario_intelligence", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(11);
    expect(check.activeContributorKeys).toContain("decision_support");
    expect(check.activeContributorKeys).toContain("scenario_intelligence");
  });
});

describe("Phase 11H locks", () => {
  it("enumerates decision events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.decision.updated");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.decision.published");
  });

  it("declares Phase 11H decision tables", () => {
    expect(PROJECT_CONTROLS_DECISION_TABLES).toEqual([
      "project_controls_decision_states",
      "project_controls_decision_evidence",
      "project_controls_decision_reviews",
      "project_controls_decision_confidence",
    ]);
  });

  it("grants decision assessment capabilities", () => {
    expect(assertNoReservedCapabilities().ok).toBe(true);
    expect(assertReservedProvidersUnimplemented().ok).toBe(true);
    expect(assertOwnershipLock().ok).toBe(true);
  });
});

describe("Phase 11H decision orchestration", () => {
  it("persists decision state through assess path", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.assessDecision({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: decisionControlContext(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      asOf: AS_OF,
      startReview: false,
    });
    expect(result.abstained).toBe(true);
    expect(store.decisionStates.length).toBe(1);
    expect(result.state.autoExecutionEnabled).toBe(false);
  });
});
