import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  assertBaselineProviderUnimplemented,
  assertChangePublishable,
  assertNoContractualApproval,
  assertNoCostEngine,
  assertNoReservedCapabilities,
  assertOwnershipLock,
  assertProjectProfileContributorsComplete,
  assertReservedProvidersUnimplemented,
  CHANGE_REVIEW_WORKFLOW,
  createChangeIntelligenceEngine,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectContextEngine,
  createProjectControlsEngine,
  createReservedBaselineProvider,
  createReservedChangeProvider,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_CHANGE_TABLES,
  PROJECT_CONTROLS_EVENTS,
  PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
  startChangeReview,
  transitionChangeReview,
  type ChangeEvidence,
  type ChangeSignal,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";
const AS_OF = "2026-08-08T00:00:00.000Z";

function changeEvidence(overrides: Partial<ChangeEvidence> = {}): ChangeEvidence {
  return {
    evidenceId: overrides.evidenceId ?? `cev-${Math.random().toString(36).slice(2, 8)}`,
    kind: overrides.kind ?? "instruction_reference",
    sourceType: overrides.sourceType ?? "approved_document",
    sourceRef: overrides.sourceRef ?? "doc-001",
    sourceKey: overrides.sourceKey ?? "project_intelligence.documents",
    provenance: overrides.provenance ?? "primary_source",
    reviewStatus: overrides.reviewStatus ?? "approved",
    observedAt: overrides.observedAt ?? "2026-08-07T00:00:00.000Z",
    sourceVersion: overrides.sourceVersion,
    confidence: overrides.confidence,
    weight: overrides.weight,
    declaredChangeClass: overrides.declaredChangeClass,
    declaredStatusContext: overrides.declaredStatusContext,
    narrative: overrides.narrative,
    revoked: overrides.revoked,
    conflictsWith: overrides.conflictsWith,
    derivedFromEarnedValue: false,
    mutatesCoreRisk: false,
    mutatesBudget: false,
    contractualApprovalClaimed: false,
  };
}

function goodChangeEvidence(): ChangeEvidence[] {
  return [
    changeEvidence({
      evidenceId: "cev-1",
      declaredChangeClass: "scope",
      declaredStatusContext: "pending",
    }),
    changeEvidence({
      evidenceId: "cev-2",
      kind: "meeting_statement",
      sourceType: "approved_meeting",
      sourceKey: "project_intelligence.meetings",
      sourceRef: "meeting-014",
      declaredChangeClass: "scope",
      declaredStatusContext: "pending",
    }),
  ];
}

function changeSignal(overrides: Partial<ChangeSignal> = {}): ChangeSignal {
  return {
    signalId: overrides.signalId ?? `csig-${Math.random().toString(36).slice(2, 8)}`,
    tenantId: TENANT,
    workspaceId: WORKSPACE,
    projectId: PROJECT,
    scope: overrides.scope ?? { kind: "project", projectId: PROJECT },
    sourceType: overrides.sourceType ?? "manual_engineering_observation",
    sourceKey: overrides.sourceKey ?? "manual.engineering_observation",
    sourceRef: overrides.sourceRef,
    observedAt: overrides.observedAt ?? "2026-08-07T00:00:00.000Z",
    narrative: overrides.narrative,
    suggestedChangeClass: overrides.suggestedChangeClass ?? "scope",
    revoked: overrides.revoked,
    contractualApprovalClaimed: false,
    mutatesBudget: false,
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

describe("Phase 11D change intelligence engine", () => {
  it("abstains with no evidence and publishes no change context", () => {
    const result = createChangeIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      changeClass: "scope",
      evidence: [],
      asOf: AS_OF,
    });
    expect(result.abstained).toBe(true);
    expect(result.state.assessmentClass).toBe("abstained");
    expect(result.state.changeStatusContext).toBe("unknown");
    expect(result.state.impact.cost).toBe("unknown");
    expect(result.state.impact.schedule).toBe("unknown");
    expect(result.state.confidence.confidenceClass).toBe("unavailable");
  });

  it("abstains when evidence declares contradictory approval contexts", () => {
    const result = createChangeIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      changeClass: "scope",
      evidence: [
        changeEvidence({ evidenceId: "c1", declaredStatusContext: "approved_context" }),
        changeEvidence({
          evidenceId: "c2",
          sourceKey: "project_intelligence.meetings",
          declaredStatusContext: "rejected_context",
        }),
      ],
      asOf: AS_OF,
    });
    expect(result.abstained).toBe(true);
    expect(result.state.confidence.dataSufficiency).toBe("conflicting");
    expect(result.state.confidence.conflictState).toBe("detected");
  });

  it("produces advisory impact contexts and never a quantum", () => {
    const result = createChangeIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      changeClass: "scope",
      evidence: goodChangeEvidence(),
      asOf: AS_OF,
    });
    expect(result.abstained).toBe(false);
    expect(["suspected", "supported"]).toContain(result.state.impact.scope);
    expect(["suspected", "supported", "unknown"]).toContain(result.state.impact.cost);
    expect(result.state.costIntegrated).toBe(false);
    expect(result.state.budgetMutated).toBe(false);
    expect(result.state.financialPostingPerformed).toBe(false);
    expect(result.state.earnedValueComputed).toBe(false);
    expect(result.state.criticalPathComputed).toBe(false);
    expect(result.state.contractualApprovalClaimed).toBe(false);
    expect(result.state.contractualAuthorityClaimed).toBe(false);
    expect(result.state.coreRiskMutated).toBe(false);
    expect(result.state.advisoryOnly).toBe(true);
    expect(result.state.method).toBe("change_intelligence_advisory_v1");
  });

  it("treats a candidate as a subject for assessment, never an approved change", () => {
    const candidate = createChangeIntelligenceEngine().createCandidate({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      signals: [changeSignal({ signalId: "s1" }), changeSignal({ signalId: "s2" })],
      asOf: AS_OF,
    });
    expect(candidate.status).toBe("candidate");
    expect(candidate.isApprovedChange).toBe(false);
    expect(candidate.contractualApprovalClaimed).toBe(false);
    expect(candidate.changeClass).toBe("scope");
    expect(candidate.signalRefs).toEqual(["s1", "s2"]);
  });

  it("rejects evidence that claims contractual approval or mutates budget/risk", () => {
    const engine = createChangeIntelligenceEngine();
    const bad = {
      ...changeEvidence({ evidenceId: "bad-1" }),
      contractualApprovalClaimed: true as unknown as false,
    };
    expect(() =>
      engine.assess({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        scope: { kind: "project", projectId: PROJECT },
        changeClass: "scope",
        evidence: [bad],
        asOf: AS_OF,
      }),
    ).toThrow(/change_evidence_may_not_derive_from_earned_value/);
  });

  it("rejects a change reference owned by Project Controls", () => {
    const engine = createChangeIntelligenceEngine();
    expect(() =>
      engine.assess({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
        scope: { kind: "project", projectId: PROJECT },
        changeClass: "contractual",
        evidence: goodChangeEvidence(),
        authoritativeChangeRef: {
          referenceId: "cr-1",
          kind: "external_change_order",
          authorityOwner: "external_contract_administration",
          ownedByProjectControls: true as unknown as false,
          contractualApprovalClaimed: false,
        },
        asOf: AS_OF,
      }),
    ).toThrow(/change_reference_may_not_be_owned_by_project_controls/);
  });

  it("keeps cost, earned value and contractual approval forbidden", () => {
    const cost = assertNoCostEngine();
    expect(cost.costEngineImplemented).toBe(false);
    expect(cost.budgetLedgerImplemented).toBe(false);
    expect(cost.financialPostingImplemented).toBe(false);
    expect(cost.earnedValueImplemented).toBe(false);

    const authority = assertNoContractualApproval();
    expect(authority.contractualAuthority).toBe(false);
    expect(authority.changeExecutionImplemented).toBe(false);
    expect(authority.advisoryOnly).toBe(true);
  });
});

describe("Phase 11D change review workflow", () => {
  it("defines the change review workflow and forbids self-approval", () => {
    expect(CHANGE_REVIEW_WORKFLOW.slug).toBe("project_controls.change_review");
    const started = startChangeReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
      startedBy: "u1",
    });
    expect(started.instance.state).toBe("pending_review");
    const approved = transitionChangeReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");

    expect(() =>
      assertChangePublishable({ workflowState: "pending_review", reviewerId: "u2" }),
    ).toThrow(/change_publish_requires_approved_review/);
    expect(() =>
      assertChangePublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/change_self_approval_forbidden/);
  });

  it("refuses a publish that claims the review was a contractual approval", () => {
    expect(() =>
      assertChangePublishable({
        workflowState: "approved",
        reviewerId: "u2",
        assessedBy: "u1",
        contractualApprovalClaimed: true,
      }),
    ).toThrow(/change_assessment_approval_is_not_contractual_approval/);
  });
});

describe("Phase 11D project context with change", () => {
  it("lists eight active contributors including change_intelligence", () => {
    const check = assertProjectProfileContributorsComplete();
    expect(check.activeContributorKeys).toEqual([
      "progress_intelligence",
      "schedule_intelligence",
      "change_intelligence",
      "cost_intelligence",
      "productivity_intelligence",
      "forecast",
      "decision_support",
      "scenario_intelligence",
      "risk_opportunity_intelligence",
    ]);
    expect(check.reservedContributorKeys).toContain("contingency_intelligence");
  });

  it("composes a profile carrying the change rollup", () => {
    const assessed = createChangeIntelligenceEngine().assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      changeClass: "scope",
      evidence: goodChangeEvidence(),
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
      change: [assessed],
      changeCandidateCount: 2,
    });

    expect(outcome.profile.change?.changesAssessed).toBe(1);
    expect(outcome.profile.change?.candidateCount).toBe(2);
    expect(outcome.profile.change?.dominantChangeClass).toBe("scope");
    expect(outcome.profile.change?.contractualAuthorityClaimed).toBe(false);
    expect(outcome.profile.financialPostingPerformed).toBe(false);
    expect(outcome.profile.floatComputed).toBe(false);
    expect(outcome.profile.activeContributorKeys).toContain("change_intelligence");
  });
});

describe("Phase 11D change orchestration", () => {
  it("persists change state, evidence, confidence, timeline and outbox", async () => {
    const { engine, store, events } = memoryEngine();
    const result = await engine.assessChange({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      changeClass: "scope",
      evidence: goodChangeEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });

    expect(result.abstained).toBe(false);
    expect(result.contractualApprovalClaimed).toBe(false);
    expect(result.financialPostingPerformed).toBe(false);
    expect(store.changeStates.length).toBe(1);
    expect(store.changeEvidence.length).toBe(2);
    expect(store.changeConfidence.length).toBe(1);
    expect(store.changeReviews.length).toBe(1);
    expect(store.projectTimeline.length).toBe(1);
    expect(store.outbox[0].eventType).toBe("engineering.project.change.assessed");
    expect(
      events.published().some((e) => e.eventType === "engineering.project.change.assessed"),
    ).toBe(true);
  });

  it("emits change_candidate.created and keeps the candidate unapproved", async () => {
    const { engine, store } = memoryEngine();
    const result = await engine.createChangeCandidate({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      signals: [changeSignal({ signalId: "s1" })],
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });

    expect(result.isApprovedChange).toBe(false);
    expect(store.changeCandidates.length).toBe(1);
    expect(store.outbox[0].eventType).toBe("engineering.project.change_candidate.created");
    expect(store.outbox[0].payload.isApprovedChange).toBe(false);
  });

  it("publishes only through an approved review by a different actor", async () => {
    const { engine, store } = memoryEngine();
    const assessed = await engine.assessChange({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      changeClass: "scope",
      evidence: goodChangeEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });

    const reviewed = await engine.reviewChange({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      changeStateId: assessed.state.stateId,
      workflowInstance: assessed.workflowInstance!,
      action: "approve",
      to: "approved",
      reviewerId: "approver-1",
      actorRole: "approver",
      publish: true,
    });

    expect(reviewed.published).toBe(true);
    expect(reviewed.state.status).toBe("published");
    expect(reviewed.contractualApprovalClaimed).toBe(false);
    expect(
      store.outbox.some((row) => row.eventType === "engineering.project.change.published"),
    ).toBe(true);
    expect(
      store.outbox.some((row) => row.eventType === "engineering.project.change.superseded"),
    ).toBe(true);
  });

  it("refuses to review an abstained change assessment", async () => {
    const { engine } = memoryEngine();
    const abstained = await engine.assessChange({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      changeClass: "scope",
      evidence: [],
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });
    expect(abstained.abstained).toBe(true);
    expect(abstained.workflowInstance).toBeUndefined();
  });
});

describe("Phase 11D snapshot and timeline", () => {
  it("captures an immutable, identifier-only project snapshot", async () => {
    const { engine, store } = memoryEngine();
    await engine.assessChange({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      changeClass: "scope",
      evidence: goodChangeEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });

    const result = await engine.createProjectSnapshot({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });

    expect(result.snapshot.schemaVersion).toBe("project_controls_project_snapshot/1");
    expect(result.snapshot.immutable).toBe(true);
    expect(result.snapshot.containsEvidencePayloads).toBe(false);
    expect(result.snapshot.changeStateIds.length).toBe(1);
    expect(result.snapshot.progressStateIds).toEqual([]);
    expect(store.projectSnapshots.length).toBe(1);
    expect(
      store.outbox.some((row) => row.eventType === "engineering.project.snapshot.created"),
    ).toBe(true);
  });

  it("appends project timeline entries with governance locks", async () => {
    const { engine, store } = memoryEngine();
    await engine.createChangeCandidate({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      signals: [changeSignal({ signalId: "s1" })],
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });

    const timeline = await engine.listProjectTimeline({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      actorRole: "viewer",
    });
    expect(timeline.length).toBe(1);
    expect(timeline[0].kind).toBe("change_candidate_created");
    expect(timeline[0].governance.advisoryOnly).toBe(true);
    expect(timeline[0].governance.financialPostingPerformed).toBe(false);
    expect(timeline[0].governance.contractualApprovalClaimed).toBe(false);
    expect(store.projectTimeline.length).toBe(1);
  });
});

describe("Phase 11D locks", () => {
  it("enumerates the thirty Phase 11I domain events", () => {
    expect(PROJECT_CONTROLS_EVENTS).toEqual([
      "engineering.project.progress.updated",
      "engineering.project.progress.reviewed",
      "engineering.project.progress.published",
      "engineering.project.schedule.updated",
      "engineering.project.schedule.reviewed",
      "engineering.project.schedule.published",
      "engineering.project.profile.updated",
      "engineering.project.change.assessed",
      "engineering.project.change.reviewed",
      "engineering.project.change.published",
      "engineering.project.change.superseded",
      "engineering.project.change_candidate.created",
      "engineering.project.cost.assessed",
      "engineering.project.cost.reviewed",
      "engineering.project.cost.published",
      "engineering.project.cost.superseded",
      "engineering.project.cost.variance_attributed",
      "engineering.project.productivity.updated",
      "engineering.project.productivity.reviewed",
      "engineering.project.productivity.published",
      "engineering.project.forecast.updated",
      "engineering.project.forecast.reviewed",
      "engineering.project.forecast.published",
      "engineering.project.decision.updated",
      "engineering.project.decision.reviewed",
      "engineering.project.decision.published",
      "engineering.project.scenario.updated",
      "engineering.project.scenario.reviewed",
      "engineering.project.scenario.published",
      "engineering.project.risk_opportunity.updated",
      "engineering.project.risk_opportunity.reviewed",
      "engineering.project.risk_opportunity.published",
      "engineering.project.snapshot.created",
    ]);
  });

  it("keeps change owned and contractual authority outside Project Controls", () => {
    const lock = assertOwnershipLock();
    expect(lock.changeIntelligenceOwnership).toBe("project_controls");
    expect(lock.changeIntelligenceReady).toBe(true);
    expect(lock.changeIntelligenceIsContractualAuthority).toBe(false);
    expect(lock.contractualChangeAuthorityOwnership).toBe("reserved_not_project_controls");
    expect(lock.financialLedgerOwnership).toBe("external_finance_or_future_finance_domain");
  });

  it("keeps the contractual change provider and baseline provider unimplemented", async () => {
    const providers = assertReservedProvidersUnimplemented();
    expect(providers.reservedProviderKeys).toContain("baseline");
    expect(providers.reservedProviderKeys).toContain("contingency");

    const change = createReservedChangeProvider();
    await expect(
      change.approveContractualChange({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        scope: { kind: "project", projectId: PROJECT },
      }),
    ).rejects.toThrow(/not_implemented:change.approveContractualChange/);

    const baseline = createReservedBaselineProvider();
    expect(assertBaselineProviderUnimplemented().implemented).toBe(false);
    await expect(
      baseline.getBaseline({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        scope: { kind: "project", projectId: PROJECT },
      }),
    ).rejects.toThrow(/not_implemented:baseline.getBaseline/);
  });

  it("grants change assessment capabilities but no cost or EV capability", () => {
    expect(assertNoReservedCapabilities().ok).toBe(true);
  });

  it("declares the Phase 11D tables", () => {
    expect(PROJECT_CONTROLS_CHANGE_TABLES).toEqual([
      "project_controls_change_states",
      "project_controls_change_evidence",
      "project_controls_change_reviews",
      "project_controls_change_confidence",
      "project_controls_change_candidates",
    ]);
    expect(PROJECT_CONTROLS_SHARED_PROJECT_TABLES).toEqual([
      "project_controls_project_snapshots",
      "project_controls_project_timeline",
    ]);
  });
});
