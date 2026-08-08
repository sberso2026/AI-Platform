import { describe, expect, it } from "vitest";
import {
  createInMemorySharedProjectDomainPort,
  createProjectReferenceFixture,
} from "@rtb/engineering-shared-project-domain";
import {
  assertNoCpm,
  assertProjectProfileContributorsComplete,
  assertSchedulePublishable,
  createDurableProjectControlsMemoryStore,
  createInProcessProjectControlsEventPipeline,
  createProjectContextEngine,
  createProjectControlsEngine,
  createScheduleIntelligenceEngine,
  MemoryProjectControlsRepository,
  PROJECT_CONTROLS_EVENTS,
  SCHEDULE_REVIEW_WORKFLOW,
  startScheduleReview,
  transitionScheduleReview,
  type ScheduleEvidence,
} from "../src/index";

const TENANT = "11111111-1111-1111-1111-111111111111";
const WORKSPACE = "22222222-2222-2222-2222-222222222222";
const PROJECT = "33333333-3333-3333-3333-333333333333";

function scheduleEvidence(overrides: Partial<ScheduleEvidence> = {}): ScheduleEvidence {
  return {
    evidenceId: overrides.evidenceId ?? `sev-${Math.random().toString(36).slice(2, 8)}`,
    kind: overrides.kind ?? "milestone_declaration",
    sourceType: overrides.sourceType ?? "manual_engineering_assessment",
    sourceKey: overrides.sourceKey ?? "manual.engineering_assessment",
    observedAt: overrides.observedAt ?? "2026-08-07T00:00:00.000Z",
    declaredPosture: overrides.declaredPosture,
    declaredBaselineDate: overrides.declaredBaselineDate,
    declaredCurrentDate: overrides.declaredCurrentDate,
    weight: overrides.weight,
    reviewStatus: overrides.reviewStatus ?? "approved",
    revoked: overrides.revoked,
    conflictsWith: overrides.conflictsWith,
    narrative: overrides.narrative,
    sourceReference: overrides.sourceReference,
    derivedFromCpm: false,
    derivedFromFloat: false,
    derivedFromEarnedValue: false,
    mutatesActivityIdentity: false,
  };
}

function goodScheduleEvidence() {
  return [
    scheduleEvidence({
      evidenceId: "sev-1",
      declaredPosture: "on_track",
      declaredBaselineDate: "2026-06-01T00:00:00.000Z",
      declaredCurrentDate: "2026-08-01T00:00:00.000Z",
    }),
    scheduleEvidence({
      evidenceId: "sev-2",
      kind: "meeting_statement",
      sourceType: "approved_meeting",
      sourceKey: "project_intelligence.meetings",
      declaredPosture: "on_track",
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

describe("Phase 11C schedule intelligence engine", () => {
  it("abstains with no evidence and publishes no posture", () => {
    const engine = createScheduleIntelligenceEngine();
    const result = engine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: [],
      asOf: "2026-08-08T00:00:00.000Z",
    });
    expect(result.abstained).toBe(true);
    expect(result.assessment.milestonePosture).toBeUndefined();
    expect(result.assessment.criticalPathComputed).toBe(false);
    expect(result.assessment.floatComputed).toBe(false);
    expect(result.assessment.scheduleExecuted).toBe(false);
    expect(result.assessment.advisoryOnly).toBe(true);
  });

  it("assertNoCpm forbids CPM flags", () => {
    const guard = assertNoCpm();
    expect(guard.cpmImplemented).toBe(false);
    expect(guard.floatComputed).toBe(false);
    expect(guard.scheduleExecutionImplemented).toBe(false);
  });

  it("defines the schedule review workflow on the Workflow SDK", () => {
    expect(SCHEDULE_REVIEW_WORKFLOW.slug).toBe("project_controls.schedule_review");
    const started = startScheduleReview({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      assessmentStateId: "state-1",
      startedBy: "u1",
    });
    expect(started.instance.state).toBe("pending_review");
    const approved = transitionScheduleReview({
      instance: started.instance,
      action: "approve",
      to: "approved",
    });
    expect(approved.state).toBe("approved");
    expect(() =>
      assertSchedulePublishable({
        workflowState: "pending_review",
        reviewerId: "u2",
        assessedBy: "u1",
      }),
    ).toThrow(/schedule_publish_requires_approved_review/);
    expect(() =>
      assertSchedulePublishable({
        workflowState: "approved",
        reviewerId: "u1",
        assessedBy: "u1",
      }),
    ).toThrow(/schedule_self_approval_forbidden/);
  });

  it("keeps the seven Phase 11C domain events at the head of the event list", () => {
    expect(PROJECT_CONTROLS_EVENTS.slice(0, 7)).toEqual([
      "engineering.project.progress.updated",
      "engineering.project.progress.reviewed",
      "engineering.project.progress.published",
      "engineering.project.schedule.updated",
      "engineering.project.schedule.reviewed",
      "engineering.project.schedule.published",
      "engineering.project.profile.updated",
    ]);
  });
});

describe("Phase 11C project context with schedule", () => {
  it("keeps schedule_intelligence active alongside progress and change", () => {
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
      "assurance_intelligence",
    ]);
  });

  it("composes a profile from schedule assessments", () => {
    const scheduleEngine = createScheduleIntelligenceEngine();
    const assessed = scheduleEngine.assess({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodScheduleEvidence(),
      asOf: "2026-08-08T00:00:00.000Z",
    }).assessment;

    const outcome = createProjectContextEngine().compose({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectReference: createProjectReferenceFixture({
        tenantId: TENANT,
        workspaceId: WORKSPACE,
        projectId: PROJECT,
      }),
      progress: [],
      schedule: [assessed],
    });
    expect(outcome.profile.schedule?.scopesAssessed).toBe(1);
    expect(outcome.profile.schedule?.dominantMilestonePosture).toBe("on_track");
    expect(outcome.profile.floatComputed).toBe(false);
    expect(outcome.profile.activeContributorKeys).toContain("schedule_intelligence");
  });
});

describe("Phase 11C schedule orchestration", () => {
  it("persists schedule assessment, snapshot, timeline and outbox", async () => {
    const { engine, store, events } = memoryEngine();
    const result = await engine.assessSchedule({
      tenantId: TENANT,
      workspaceId: WORKSPACE,
      projectId: PROJECT,
      scope: { kind: "project", projectId: PROJECT },
      evidence: goodScheduleEvidence(),
      actorRole: "project_controls_engineer",
      actorId: "engineer-1",
    });
    expect(result.abstained).toBe(false);
    expect(result.floatComputed).toBe(false);
    expect(result.criticalPathComputed).toBe(false);
    expect(store.scheduleAssessments.length).toBe(1);
    expect(store.scheduleEvidence.length).toBe(2);
    expect(store.scheduleSnapshots.length).toBe(1);
    expect(store.scheduleTimeline.length).toBe(1);
    expect(store.outbox.length).toBe(1);
    expect(store.outbox[0].eventType).toBe("engineering.project.schedule.updated");
    expect(events.published().some((e) => e.eventType === "engineering.project.schedule.updated")).toBe(
      true,
    );
  });
});
