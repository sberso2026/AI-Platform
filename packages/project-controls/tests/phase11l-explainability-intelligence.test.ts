import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  EXPLANATION_REASONS,
  EXPLANATION_STATUSES,
  assertNoAutomaticEvidenceCreation,
  assertNoAutomaticExplanationApproval,
  assertNoEarnedValueOrCpmInExplainabilityIntelligence,
  assertNoChainOfThoughtExposure,
  assertOwnershipLock,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  assertExplainabilityAdvisoryOnly,
  createExplainabilityIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectControlsEngine,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_EXPLAINABILITY_TABLES,
  PROJECT_CONTROLS_EVENTS,
  EXPLAINABILITY_REVIEW_WORKFLOW,
  startExplainabilityReview,
  transitionExplainabilityReview,
  assertExplainabilityPublishable,
  type ExplainabilityControlContext,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function explainabilityControlContext(): ExplainabilityControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    explainabilityUnitId: "ex-001",
    explainabilityUnitLabel: "Explainability thread A",
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

describe("Phase 11L explainability taxonomy", () => {
  it("defines deterministic explanation statuses and reasons", () => {
    expect(EXPLANATION_STATUSES).toEqual([
      "supported",
      "partially_supported",
      "unsupported",
      "conflicting",
      "incomplete",
      "unknown",
    ]);
    expect(EXPLANATION_REASONS).toEqual([
      "evidence_based",
      "derived",
      "assumed",
      "insufficient_evidence",
      "unknown",
    ]);
  });
});

describe("Phase 11L explainability intelligence engine", () => {
  it("abstains without published composed contributors", () => {
    const outcome = createExplainabilityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: explainabilityControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.contributorExplanations).toHaveLength(0);
    expect(outcome.state.mutatesUpstreamContributors).toBe(false);
  });

  it("never exposes chain-of-thought or hidden reasoning", () => {
    const outcome = createExplainabilityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: explainabilityControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.state.chainOfThoughtExposed).toBe(false);
    expect(outcome.state.hiddenReasoningExposed).toBe(false);
    expect(outcome.state.fabricatedProvenance).toBe(false);
    expect(outcome.state.synthesis.chainOfThoughtExposed).toBe(false);
    expect(outcome.state.synthesis.hiddenReasoningExposed).toBe(false);
  });

  it("keeps automatic approval and evidence creation forbidden", () => {
    expect(assertNoAutomaticExplanationApproval().automaticExplanationApprovalEnabled).toBe(false);
    expect(assertNoAutomaticEvidenceCreation().automaticEvidenceCreationEnabled).toBe(false);
    expect(assertNoEarnedValueOrCpmInExplainabilityIntelligence().earnedValueImplemented).toBe(
      false,
    );
    expect(assertExplainabilityAdvisoryOnly().advisoryOnly).toBe(true);
    expect(assertNoChainOfThoughtExposure().chainOfThoughtExposed).toBe(false);
  });

  it("fail-closed with missing evidence produces incomplete/unknown summaries", () => {
    const outcome = createExplainabilityIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: explainabilityControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(["incomplete", "unknown", "conflicting"]).toContain(outcome.state.explanationStatus);
    expect(outcome.state.snapshot.reasonSummary).toMatch(/not chain-of-thought/i);
  });
});

describe("Phase 11L explainability review workflow", () => {
  it("defines explainability_review and forbids self-approval", () => {
    expect(EXPLAINABILITY_REVIEW_WORKFLOW.slug).toBe("project_controls.explainability_review");
    const started = startExplainabilityReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertExplainabilityPublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/explainability_self_approval_forbidden/);
    const approved = transitionExplainabilityReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11L project context with explainability intelligence", () => {
  it("lists twelve active contributors including explainability_intelligence", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(12);
    expect(check.activeContributorKeys).toContain("explainability_intelligence");
    expect(check.activeContributorKeys).toContain("organizational_learning");
    expect(check.activeContributorKeys).toContain("assurance_intelligence");
  });
});

describe("Phase 11L locks", () => {
  it("enumerates explainability events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.explainability.updated");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.explainability.published");
  });

  it("declares Phase 11L explainability tables", () => {
    expect(PROJECT_CONTROLS_EXPLAINABILITY_TABLES).toEqual([
      "project_controls_explainability_states",
      "project_controls_explainability_evidence",
      "project_controls_explainability_reviews",
      "project_controls_explainability_confidence",
    ]);
  });

  it("passes ownership and reserved provider locks", () => {
    expect(assertReservedProvidersUnimplemented().ok).toBe(true);
    expect(assertOwnershipLock().ok).toBe(true);
    expect(assertOwnershipLock().explainabilityIntelligenceReady).toBe(true);
  });
});

describe("Phase 11L explainability orchestration", () => {
  it("persists explainability state through assess path without upstream mutation", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.assessExplainability({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: explainabilityControlContext(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      asOf: AS_OF,
      startReview: false,
    });
    expect(result.abstained).toBe(true);
    expect(store.explainabilityStates.length).toBe(1);
    expect(result.mutatesUpstreamContributors).toBe(false);
    expect(result.chainOfThoughtExposed).toBe(false);
    expect(result.fabricatedProvenance).toBe(false);
  });
});
