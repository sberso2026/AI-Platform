import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  ASSURANCE_FINDING_KINDS,
  ASSURANCE_POSTURES,
  assertNoCertificationAuthority,
  assertNoEvidenceApproval,
  assertNoEarnedValueOrCpmInAssuranceIntelligence,
  assertOwnershipLock,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  assertAssuranceAdvisoryOnly,
  createAssuranceIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectControlsEngine,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_ASSURANCE_TABLES,
  PROJECT_CONTROLS_EVENTS,
  ASSURANCE_REVIEW_WORKFLOW,
  startAssuranceReview,
  transitionAssuranceReview,
  assertAssurancePublishable,
  type AssuranceControlContext,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function assuranceControlContext(): AssuranceControlContext {
  return {
    scope: { kind: "project", projectId: PROJECT },
    assuranceUnitId: "as-001",
    assuranceUnitLabel: "Assurance thread A",
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

describe("Phase 11K assurance taxonomy", () => {
  it("defines deterministic assurance postures and finding kinds", () => {
    expect(ASSURANCE_POSTURES).toEqual([
      "strong",
      "adequate",
      "constrained",
      "weak",
      "insufficient",
      "conflicting",
      "unknown",
    ]);
    expect(ASSURANCE_FINDING_KINDS).toEqual([
      "complete",
      "incomplete",
      "stale",
      "conflicting",
      "missing_source",
      "missing_provenance",
      "unsupported",
      "dependency_gap",
      "unavailable",
      "unknown",
    ]);
  });
});

describe("Phase 11K assurance intelligence engine", () => {
  it("abstains without published composed contributors", () => {
    const outcome = createAssuranceIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: assuranceControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.abstained).toBe(true);
    expect(outcome.state.contributorFindings).toHaveLength(0);
    expect(outcome.state.mutatesUpstreamContributors).toBe(false);
  });

  it("never claims certification verification or evidence approval", () => {
    const outcome = createAssuranceIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: assuranceControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.state.certificationClaimed).toBe(false);
    expect(outcome.state.verificationClaimed).toBe(false);
    expect(outcome.state.evidenceApprovalClaimed).toBe(false);
    expect(outcome.state.duplicateAssuranceOwnershipDetected).toBe(false);
    expect(outcome.state.synthesis.certificationClaimed).toBe(false);
    expect(outcome.state.synthesis.verificationClaimed).toBe(false);
  });

  it("keeps certification and evidence approval forbidden", () => {
    expect(assertNoCertificationAuthority().automaticAssuranceApprovalEnabled).toBe(false);
    expect(assertNoCertificationAuthority().automaticCertificationEnabled).toBe(false);
    expect(assertNoEvidenceApproval().automaticEvidenceApprovalEnabled).toBe(false);
    expect(assertNoEarnedValueOrCpmInAssuranceIntelligence().earnedValueImplemented).toBe(false);
    expect(assertAssuranceAdvisoryOnly().advisoryOnly).toBe(true);
  });

  it("does not fabricate numerical precision in confidence", () => {
    const outcome = createAssuranceIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: assuranceControlContext(),
      progress: [],
      asOf: AS_OF,
    });
    expect(outcome.confidence.numericalPrecisionClaimed).toBe(false);
    expect(outcome.state.numericalPrecisionClaimed).toBe(false);
  });
});

describe("Phase 11K assurance review workflow", () => {
  it("defines assurance_review and forbids self-approval", () => {
    expect(ASSURANCE_REVIEW_WORKFLOW.slug).toBe("project_controls.assurance_review");
    const started = startAssuranceReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
    });
    expect(started.instance.state).toBe("pending_review");
    expect(() =>
      assertAssurancePublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/assurance_self_approval_forbidden/);
    const approved = transitionAssuranceReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
  });
});

describe("Phase 11K project context with assurance intelligence", () => {
  it("lists ten active contributors including assurance_intelligence", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toHaveLength(10);
    expect(check.activeContributorKeys).toContain("assurance_intelligence");
  });
});

describe("Phase 11K locks", () => {
  it("enumerates assurance events in the domain event list", () => {
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.assurance.updated");
    expect(PROJECT_CONTROLS_EVENTS).toContain("engineering.project.assurance.published");
  });

  it("declares Phase 11K assurance tables", () => {
    expect(PROJECT_CONTROLS_ASSURANCE_TABLES).toEqual([
      "project_controls_assurance_states",
      "project_controls_assurance_evidence",
      "project_controls_assurance_reviews",
      "project_controls_assurance_confidence",
    ]);
  });

  it("passes ownership and reserved provider locks", () => {
    expect(assertReservedProvidersUnimplemented().ok).toBe(true);
    expect(assertOwnershipLock().ok).toBe(true);
    expect(assertOwnershipLock().assuranceIntelligenceReady).toBe(true);
  });
});

describe("Phase 11K assurance orchestration", () => {
  it("persists assurance state through assess path", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.assessAssurance({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      controlContext: assuranceControlContext(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
      asOf: AS_OF,
      startReview: false,
    });
    expect(result.abstained).toBe(true);
    expect(store.assuranceStates.length).toBe(1);
    expect(result.certificationClaimed).toBe(false);
    expect(result.verificationClaimed).toBe(false);
    expect(result.evidenceApprovalClaimed).toBe(false);
  });
});
