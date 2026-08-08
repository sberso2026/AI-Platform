import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  OPPORTUNITY_SIGNALS,
  RISK_SIGNALS,
  assertNoRegisterMutation,
  assertNoTreatmentExecution,
  assertNoEarnedValueOrCpmInRiskOpportunityIntelligence,
  assertOwnershipLock,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  assertRiskOpportunityAdvisoryOnly,
  createRiskOpportunityIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectControlsEngine,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_RISK_OPPORTUNITY_TABLES,
  PROJECT_CONTROLS_EVENTS,
  RISK_OPPORTUNITY_REVIEW_WORKFLOW,
  startRiskOpportunityReview,
  transitionRiskOpportunityReview,
  assertRiskOpportunityPublishable,
  type RiskOpportunityControlContext,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function riskOpportunityControlContext(): RiskOpportunityControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    riskOpportunityUnitId: "ro-001",
    riskOpportunityUnitLabel: "Risk/Opportunity thread A",
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

describe("Phase 11J risk/opportunity taxonomy", () => {
  it("defines deterministic risk and opportunity signals", () => {
    expect(RISK_SIGNALS).toEqual([
      "emerging",
      "increasing",
      "persistent",
      "interacting",
      "unresolved",
      "evidence_gap",
      "unknown",
    ]);
    expect(OPPORTUNITY_SIGNALS).toEqual([
      "recovery",
      "mitigation",
      "coordination",
      "sequencing",
      "productivity",
      "cost_avoidance",
      "schedule_protection",
      "unknown",
    ]);
  });
});

describe("Phase 11J risk/opportunity intelligence engine", () => {
  it("abstains without published composed contributors", () => {
    const outcome = createRiskOpportunityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: riskOpportunityControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.riskSignals).toHaveLength(0);
    expect(outcome.state.mutatesUpstreamContributors).toBe(false);
  });

  it("never mutates risk register or assigns owners", () => {
    const outcome = createRiskOpportunityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: riskOpportunityControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.state.riskRegisterMutated).toBe(false);
    expect(outcome.state.opportunityRegisterMutated).toBe(false);
    expect(outcome.state.ownerAssignmentPerformed).toBe(false);
    expect(outcome.state.treatmentExecutionPerformed).toBe(false);
    expect(outcome.state.duplicateRiskOwnershipDetected).toBe(false);
    expect(outcome.state.synthesis.riskRegisterMutated).toBe(false);
    expect(outcome.state.synthesis.opportunityRegisterMutated).toBe(false);
  });

  it("keeps register mutation and treatment execution forbidden", () => {
    expect(assertNoRegisterMutation().automaticRiskRegisterMutationEnabled).toBe(false);
    expect(assertNoRegisterMutation().automaticOpportunityRegisterMutationEnabled).toBe(false);
    expect(assertNoTreatmentExecution().automaticTreatmentExecutionEnabled).toBe(false);
    expect(assertNoEarnedValueOrCpmInRiskOpportunityIntelligence().earnedValueImplemented).toBe(false);
    expect(assertRiskOpportunityAdvisoryOnly().advisoryOnly).toBe(true);
  });

  it("does not fabricate numerical precision in confidence", () => {
    const outcome = createRiskOpportunityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: riskOpportunityControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.confidence.numericalPrecisionClaimed).toBe(false);
    expect(outcome.confidence.monteCarloClaimed).toBe(false);
    expect(outcome.state.numericalPrecisionClaimed).toBe(false);
    expect(outcome.state.monteCarloPerformed).toBe(false);
  });
});

describe("Phase 11J risk/opportunity review workflow", () => {
  it("defines risk_opportunity_review and forbids self-approval", () => {
    expect(RISK_OPPORTUNITY_REVIEW_WORKFLOW.slug).toBe("project_controls.risk_opportunity_review");
    const started = startRiskOpportunityReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertRiskOpportunityPublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/risk_opportunity_self_approval_forbidden/);
    const approved = transitionRiskOpportunityReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11J project context with risk/opportunity intelligence", () => {
  it("lists nine active contributors including risk_opportunity_intelligence", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(11);
    expect(check.activeContributorKeys).toContain("risk_opportunity_intelligence");
  });
});

describe("Phase 11J locks", () => {
  it("enumerates risk/opportunity events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.risk_opportunity.updated");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.risk_opportunity.published");
  });

  it("declares Phase 11J risk/opportunity tables", () => {
    expect(PROJECT_CONTROLS_RISK_OPPORTUNITY_TABLES).toEqual([
      "project_controls_risk_opportunity_states",
      "project_controls_risk_opportunity_evidence",
      "project_controls_risk_opportunity_reviews",
      "project_controls_risk_opportunity_confidence",
    ]);
  });

  it("passes ownership and reserved provider locks", () => {
    expect(assertReservedProvidersUnimplemented().ok).toBe(true);
    expect(assertOwnershipLock().ok).toBe(true);
    expect(assertOwnershipLock().riskOpportunityIntelligenceReady).toBe(true);
  });
});

describe("Phase 11J risk/opportunity orchestration", () => {
  it("persists risk/opportunity state through assess path", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.assessRiskOpportunity({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: riskOpportunityControlContext(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      asOf: AS_OF,
      startReview: false,
    });
    expect(result.abstained).toBe(true);
    expect(store.riskOpportunityStates.length).toBe(1);
    expect(result.riskRegisterMutated).toBe(false);
    expect(result.opportunityRegisterMutated).toBe(false);
    expect(result.ownerAssignmentPerformed).toBe(false);
    expect(result.treatmentExecutionPerformed).toBe(false);
  });
});
