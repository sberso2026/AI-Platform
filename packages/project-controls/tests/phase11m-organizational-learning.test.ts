import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  LEARNING_TAXONOMY,
  LEARNING_BASIS_STATUSES,
  LEARNING_BASIS_REASONS,
  assertNoAutomaticKnowledgeMutation,
  assertNoAutomaticLearningApproval,
  assertNoEarnedValueOrCpm,
  assertNoFabricatedLessons,
  assertNoUnsupportedSimilarityScore,
  assertOwnershipLock,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  assertOrganizationalLearningAdvisoryOnly,
  createOrganizationalLearningIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectControlsEngine,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_ORGANIZATIONAL_LEARNING_TABLES,
  PROJECT_CONTROLS_EVENTS,
  ORGANIZATIONAL_LEARNING_REVIEW_WORKFLOW,
  startOrganizationalLearningReview,
  transitionOrganizationalLearningReview,
  assertOrganizationalLearningPublishable,
  type OrganizationalLearningControlContext,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function organizationalLearningControlContext(): OrganizationalLearningControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    organizationalLearningUnitId: "ol-001",
    organizationalLearningUnitLabel: "Organizational learning thread A",
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

describe("Phase 11M organizational learning taxonomy", () => {
  it("defines deterministic learning taxonomy and basis statuses", () => {
    expect(LEARNING_TAXONOMY).toEqual([
      "historical_pattern",
      "recurring_issue",
      "recurring_success",
      "lesson_learned",
      "knowledge_gap",
      "best_practice",
      "similar_project",
      "unknown",
    ]);
    expect(LEARNING_BASIS_STATUSES).toEqual([
      "supported",
      "partially_supported",
      "unsupported",
      "conflicting",
      "incomplete",
      "unknown",
    ]);
    expect(LEARNING_BASIS_REASONS).toEqual([
      "evidence_based",
      "derived",
      "assumed",
      "insufficient_evidence",
      "unknown",
    ]);
  });
});

describe("Phase 11M organizational learning intelligence engine", () => {
  it("abstains without historical evidence", () => {
    const outcome = createOrganizationalLearningIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: organizationalLearningControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.learningItems).toHaveLength(0);
    expect(outcome.state.taxonomyClass).toBe("unknown");
    expect(outcome.state.mutatesUpstreamContributors).toBe(false);
  });

  it("never fabricates lessons or unsupported similarity scores", () => {
    const outcome = createOrganizationalLearningIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: organizationalLearningControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.state.fabricatedLesson).toBe(false);
    expect(outcome.state.unsupportedSimilarityScore).toBe(false);
    expect(outcome.state.synthesis.fabricatedLesson).toBe(false);
    expect(outcome.state.synthesis.unsupportedSimilarityScore).toBe(false);
  });

  it("keeps automatic learning approval and knowledge mutation forbidden", () => {
    expect(assertNoAutomaticLearningApproval().automaticLearningApprovalEnabled).toBe(false);
    expect(assertNoAutomaticKnowledgeMutation().automaticKnowledgeMutationEnabled).toBe(false);
    expect(assertNoEarnedValueOrCpm().earnedValueImplemented).toBe(false);
    expect(assertOrganizationalLearningAdvisoryOnly().advisoryOnly).toBe(true);
    expect(assertNoFabricatedLessons().fabricatedLesson).toBe(false);
    expect(assertNoUnsupportedSimilarityScore().unsupportedSimilarityScore).toBe(false);
  });

  it("fail-closed with missing history produces unknown taxonomy", () => {
    const outcome = createOrganizationalLearningIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: organizationalLearningControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.state.taxonomyClass).toBe("unknown");
    expect(outcome.state.snapshot.reasonSummary).toMatch(/not recommendation/i);
  });
});

describe("Phase 11M organizational learning review workflow", () => {
  it("defines organizational_learning_review and forbids self-approval", () => {
    expect(ORGANIZATIONAL_LEARNING_REVIEW_WORKFLOW.slug).toBe(
      "project_controls.organizational_learning_review",
    );
    const started = startOrganizationalLearningReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertOrganizationalLearningPublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/organizational_learning_self_approval_forbidden/);
    const approved = transitionOrganizationalLearningReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11M project context with organizational learning", () => {
  it("lists twelve active contributors including organizational_learning", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(12);
    expect(check.activeContributorKeys).toContain("organizational_learning");
    expect(check.activeContributorKeys).toContain("explainability_intelligence");
  });
});

describe("Phase 11M locks", () => {
  it("enumerates organizational learning events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.organizational_learning.updated");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.organizational_learning.published");
  });

  it("declares Phase 11M organizational learning tables", () => {
    expect(PROJECT_CONTROLS_ORGANIZATIONAL_LEARNING_TABLES).toEqual([
      "project_controls_organizational_learning_states",
      "project_controls_organizational_learning_evidence",
      "project_controls_organizational_learning_reviews",
      "project_controls_organizational_learning_confidence",
    ]);
  });

  it("passes ownership and reserved provider locks", () => {
    expect(assertReservedProvidersUnimplemented().ok).toBe(true);
    expect(assertOwnershipLock().ok).toBe(true);
    expect(assertOwnershipLock().organizationalLearningIntelligenceReady).toBe(true);
  });
});

describe("Phase 11M organizational learning orchestration", () => {
  it("persists organizational learning state without upstream mutation", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.assessOrganizationalLearning({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: organizationalLearningControlContext(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      asOf: AS_OF,
      startReview: false,
    });
    expect(result.abstained).toBe(true);
    expect(store.organizationalLearningStates.length).toBe(1);
    expect(result.mutatesUpstreamContributors).toBe(false);
    expect(result.fabricatedLesson).toBe(false);
    expect(result.unsupportedSimilarityScore).toBe(false);
  });
});
