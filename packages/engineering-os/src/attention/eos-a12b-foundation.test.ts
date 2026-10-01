import { describe, expect, it } from "vitest";
import { attentionFingerprint } from "./fingerprint";
import { resolveEngineeringAttention } from "./resolve";
import { ATTENTION_AI_BOUNDARY, ATTENTION_PRIVACY, ATTENTION_RECON, type AttentionProjectSnapshot, type ResolveAttentionInput } from "./types";

const USER = "engineer-a";
const TENANT = "tenant-a";
const WS = "workspace-a";
const PROJECT_A = "project-alpha";
const PROJECT_B = "project-beta";
const PROJECT_C = "project-gamma";
const PROJECT_D = "project-delta-unauthorized";

function emptyProject(id: string, name: string, lifecycle = "FEED"): AttentionProjectSnapshot {
  return {
    projectId: id,
    projectName: name,
    lifecycleStage: lifecycle,
    workPlans: [],
    requirements: [],
    reviews: [],
    impacts: [],
    decisions: [],
    interfaces: [],
    events: [],
  };
}

function resolve(partial: Partial<ResolveAttentionInput> & { projects: AttentionProjectSnapshot[]; authorized?: string[] }) {
  return resolveEngineeringAttention({
    viewer: {
      userId: USER,
      tenantId: TENANT,
      workspaceId: WS,
      authorizedProjectIds: partial.authorized ?? [PROJECT_A, PROJECT_B, PROJECT_C],
      role: partial.viewer?.role ?? null,
      discipline: partial.viewer?.discipline ?? "STRUCTURAL",
    },
    projects: partial.projects,
    acknowledgements: partial.acknowledgements,
    preferences: partial.preferences,
    nowIso: partial.nowIso ?? "2026-10-01T12:00:00.000Z",
    filter: partial.filter,
  });
}

describe("EOS-A12B engineering attention", () => {
  it("reuses existing domains and does not create a second event bus or productivity score", () => {
    expect(ATTENTION_RECON.newEventBus).toBe("NO");
    expect(ATTENTION_RECON.kernelNotifications).toBe("REUSE");
    expect(ATTENTION_RECON.workPlans).toBe("REUSE");
    expect(ATTENTION_PRIVACY.employeeProductivityScoring).toBe("PROHIBITED");
    expect(ATTENTION_PRIVACY.employeeRanking).toBe("PROHIBITED");
    expect(ATTENTION_PRIVACY.applicationUsageMonitoring).toBe(false);
    expect(ATTENTION_PRIVACY.newContentBase64Usage).toBe(false);
    expect(ATTENTION_AI_BOUNDARY.mayInventAttentionItem).toBe(false);
    expect(ATTENTION_AI_BOUNDARY.mayInventUrgency).toBe(false);
  });

  it("projects WAITING_ON_OTHERS then RECENTLY_READY after provider information is accepted", () => {
    const waitingReq = {
      id: "req-mech-reactions",
      title: "Mechanical Equipment Reactions",
      status: "AWAITING_INFORMATION",
      blocking: true,
      providerDiscipline: "MECHANICAL",
      providerKind: "DISCIPLINE",
      providerRole: null,
      consumerDiscipline: "STRUCTURAL",
      neededBy: "2026-10-05T00:00:00.000Z",
      requiredForObjectId: "plan-foundation",
      workType: "FOUNDATION_CALCULATION",
    };
    const plan = {
      id: "plan-foundation",
      workType: "DESIGN_CALCULATION",
      status: "BLOCKED" as const,
      readiness: "BLOCKED_INFORMATION_MISSING",
      startAllowed: false,
      discipline: "STRUCTURAL",
      systemId: "sys-crusher",
      relatedObjectType: null,
      relatedObjectId: null,
    };
    const blocked = emptyProject(PROJECT_A, "Project Alpha", "DETAILED_DESIGN");
    blocked.workPlans = [plan];
    blocked.requirements = [waitingReq];
    const waiting = resolve({ projects: [blocked] });
    expect(waiting.sections.WAITING_ON_OTHERS).toHaveLength(1);
    expect(waiting.sections.WAITING_ON_OTHERS[0].provider).toBe("MECHANICAL");
    expect(waiting.sections.WAITING_ON_OTHERS[0].blocks).toMatch(/DESIGN CALCULATION/i);
    expect(waiting.sections.RECENTLY_READY).toHaveLength(0);

    const ready = emptyProject(PROJECT_A, "Project Alpha", "DETAILED_DESIGN");
    ready.workPlans = [{ ...plan, status: "READY", readiness: "READY", startAllowed: true }];
    ready.requirements = [{ ...waitingReq, status: "ACCEPTED_FOR_PURPOSE" }];
    ready.events = [{
      id: "ev-accepted",
      eventType: "INFORMATION_ACCEPTED",
      sourceObjectType: "engineering_information_requirement",
      sourceObjectId: waitingReq.id,
      materiality: "MATERIAL",
      occurredAt: "2026-10-01T10:00:00.000Z",
    }];
    const after = resolve({ projects: [ready] });
    expect(after.sections.WAITING_ON_OTHERS).toHaveLength(0);
    expect(after.sections.RECENTLY_READY).toHaveLength(1);
    expect(after.sections.RECENTLY_READY[0].action?.code).toBe("START_ENGINEERING_WORK");
    expect(after.sections.RECENTLY_READY[0].action?.href).toContain("/engineering/work/plans/plan-foundation");
  });

  it("collapses low-level input-change events into one DO_NOW assess-impact item", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha", "FEED");
    project.workPlans = [{
      id: "plan-str",
      workType: "DESIGN_CALCULATION",
      status: "IN_PROGRESS",
      readiness: "READY",
      startAllowed: true,
      discipline: "STRUCTURAL",
      systemId: "sys-crusher",
      relatedObjectType: "information_ref",
      relatedObjectId: "mech-load",
    }];
    project.events = [
      { id: "e1", eventType: "SOURCE_REVISED", sourceObjectType: "information_ref", sourceObjectId: "mech-load", materiality: "ROUTINE", occurredAt: "2026-10-01T09:00:00.000Z" },
      { id: "e2", eventType: "SOURCE_REVISED", sourceObjectType: "information_ref", sourceObjectId: "mech-load", materiality: "ROUTINE", occurredAt: "2026-10-01T09:01:00.000Z" },
      { id: "e3", eventType: "SOURCE_PUBLISHED", sourceObjectType: "information_ref", sourceObjectId: "mech-load", materiality: "MATERIAL", occurredAt: "2026-10-01T09:02:00.000Z" },
      { id: "e4", eventType: "INTERFACE_INFORMATION_CHANGED", sourceObjectType: "information_ref", sourceObjectId: "mech-load", materiality: "MATERIAL", occurredAt: "2026-10-01T09:03:00.000Z" },
    ];
    const day = resolve({ projects: [project] });
    const inputItems = day.sections.DO_NOW.filter((row) => row.action?.code === "ASSESS_IMPACT");
    expect(inputItems).toHaveLength(1);
    expect(inputItems[0].projectId).toBe(PROJECT_A);
  });

  it("projects REVIEW_REQUIRED and clears it when conditions are gone", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha", "DETAILED_DESIGN");
    project.workPlans = [{
      id: "plan-calc",
      workType: "DESIGN_CALCULATION",
      status: "IN_PROGRESS",
      readiness: "READY",
      startAllowed: true,
      discipline: "STRUCTURAL",
      systemId: null,
      relatedObjectType: null,
      relatedObjectId: null,
    }];
    project.reviews = [{
      id: "rev-1",
      workPlanId: "plan-calc",
      resultState: "ATTENTION_REQUIRED",
      openConditionCount: 2,
      targetTitle: "STR-CALC-021",
    }];
    const open = resolve({ projects: [project] });
    expect(open.sections.REVIEW_REQUIRED[0].whatHappened).toMatch(/2 Pre-Issue Review/);
    expect(open.sections.REVIEW_REQUIRED[0].action?.href).toContain("#review");

    project.reviews = [{ ...project.reviews[0], openConditionCount: 0, resultState: "NO_BLOCKING_CONDITIONS_IDENTIFIED" }];
    const closed = resolve({ projects: [project] });
    expect(closed.sections.REVIEW_REQUIRED).toHaveLength(0);
  });

  it("projects RFI DO_NOW onto the correct project Work Plan", () => {
    const project = emptyProject(PROJECT_B, "Project Beta", "CONSTRUCTION");
    project.workPlans = [{
      id: "plan-rfi-142",
      workType: "RFI_TQ_RESPONSE",
      status: "READY",
      readiness: "READY",
      startAllowed: true,
      discipline: "STRUCTURAL",
      systemId: null,
      relatedObjectType: "rfi",
      relatedObjectId: "RFI-142",
    }];
    const day = resolve({ projects: [project] });
    const rfi = day.sections.DO_NOW.find((row) => row.action?.code === "PREPARE_RFI_RESPONSE");
    expect(rfi?.projectId).toBe(PROJECT_B);
    expect(rfi?.action?.href).toContain("/engineering/work/plans/plan-rfi-142");
  });

  it("projects DECISION_REQUIRED for option study without choosing an option", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha", "PREFEASIBILITY");
    project.impacts = [{
      id: "imp-opt",
      status: "REVIEW_REQUIRED",
      workflow: "OPTION_STUDY",
      workPlanId: "plan-opt",
      optionStudyNeedsDecision: true,
      constructionQuery: null,
      sourceObjectId: "opt-1",
    }];
    const day = resolve({ projects: [project] });
    expect(day.sections.DECISION_REQUIRED[0].action?.code).toBe("RECORD_DECISION");
    expect(day.sections.DECISION_REQUIRED[0].whyItMatters).toMatch(/does not choose/i);
  });

  it("keeps a multidiscipline waiting chain without notifying unrelated disciplines", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha", "FEED");
    project.requirements = [
      {
        id: "req-mech",
        title: "Mechanical equipment loads",
        status: "AWAITING_INFORMATION",
        blocking: true,
        providerDiscipline: "MECHANICAL",
        providerKind: "DISCIPLINE",
        providerRole: null,
        consumerDiscipline: "STRUCTURAL",
        neededBy: null,
        requiredForObjectId: "plan-str",
        workType: null,
      },
      {
        id: "req-str",
        title: "Structural reactions",
        status: "AWAITING_INFORMATION",
        blocking: true,
        providerDiscipline: "STRUCTURAL",
        providerKind: "DISCIPLINE",
        providerRole: null,
        consumerDiscipline: "CIVIL",
        neededBy: null,
        requiredForObjectId: "plan-civ",
        workType: null,
      },
    ];
    project.workPlans = [
      { id: "plan-str", workType: "DESIGN_CALCULATION", status: "BLOCKED", readiness: "BLOCKED", startAllowed: false, discipline: "STRUCTURAL", systemId: null, relatedObjectType: null, relatedObjectId: null },
      { id: "plan-civ", workType: "DESIGN_CALCULATION", status: "BLOCKED", readiness: "BLOCKED", startAllowed: false, discipline: "CIVIL", systemId: null, relatedObjectType: null, relatedObjectId: null },
    ];
    const structural = resolve({
      projects: [project],
      viewer: { userId: USER, tenantId: TENANT, workspaceId: WS, authorizedProjectIds: [PROJECT_A], role: "DISCIPLINE_LEAD", discipline: "STRUCTURAL" },
      authorized: [PROJECT_A],
    });
    expect(structural.sections.WAITING_ON_OTHERS.every((row) => row.discipline === "STRUCTURAL" || row.provider === "STRUCTURAL")).toBe(true);
    expect(structural.items.some((row) => row.discipline === "ELECTRICAL")).toBe(false);
  });

  it("aggregates authorized multi-project items without contaminating project identity", () => {
    const a = emptyProject(PROJECT_A, "Project Alpha", "DETAILED_DESIGN");
    a.reviews = [{ id: "rev-a", workPlanId: "plan-a", resultState: "ATTENTION_REQUIRED", openConditionCount: 1, targetTitle: "A-CALC" }];
    a.workPlans = [{ id: "plan-a", workType: "DESIGN_CALCULATION", status: "IN_PROGRESS", readiness: "READY", startAllowed: true, discipline: "STRUCTURAL", systemId: null, relatedObjectType: null, relatedObjectId: null }];
    const b = emptyProject(PROJECT_B, "Project Beta", "FEED");
    b.requirements = [{
      id: "req-b", title: "Geotechnical bearing", status: "AWAITING_INFORMATION", blocking: true,
      providerDiscipline: "GEOTECHNICAL", providerKind: "DISCIPLINE", providerRole: null, consumerDiscipline: "STRUCTURAL",
      neededBy: null, requiredForObjectId: "plan-b", workType: null,
    }];
    b.workPlans = [{ id: "plan-b", workType: "DESIGN_CALCULATION", status: "BLOCKED", readiness: "BLOCKED", startAllowed: false, discipline: "STRUCTURAL", systemId: null, relatedObjectType: null, relatedObjectId: null }];
    const c = emptyProject(PROJECT_C, "Project Gamma", "CONSTRUCTION");
    c.workPlans = [{ id: "plan-c", workType: "DESIGN_CALCULATION", status: "READY", readiness: "READY", startAllowed: true, discipline: "STRUCTURAL", systemId: null, relatedObjectType: null, relatedObjectId: null }];
    const leaked = emptyProject(PROJECT_D, "Project Delta", "FEED");
    leaked.workPlans = [{ id: "plan-d", workType: "DESIGN_CALCULATION", status: "READY", readiness: "READY", startAllowed: true, discipline: "STRUCTURAL", systemId: null, relatedObjectType: null, relatedObjectId: null }];
    const day = resolve({ projects: [a, b, c, leaked] });
    expect(day.items.some((row) => row.projectId === PROJECT_A && row.category === "REVIEW_REQUIRED")).toBe(true);
    expect(day.items.some((row) => row.projectId === PROJECT_B && row.category === "WAITING_ON_OTHERS")).toBe(true);
    expect(day.items.some((row) => row.projectId === PROJECT_C && row.category === "DO_NOW")).toBe(true);
    expect(day.items.some((row) => row.projectId === PROJECT_D)).toBe(false);
    expect(JSON.stringify(day)).not.toContain("Project Delta");
  });

  it("does not fabricate a role when none is supplied", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha");
    project.reviews = [{ id: "rev-a", workPlanId: "plan-a", resultState: "ATTENTION_REQUIRED", openConditionCount: 1, targetTitle: "A-CALC" }];
    project.workPlans = [{ id: "plan-a", workType: "DESIGN_CALCULATION", status: "READY", readiness: "READY", startAllowed: true, discipline: "STRUCTURAL", systemId: null, relatedObjectType: null, relatedObjectId: null }];
    const day = resolve({ projects: [project] });
    expect(day.sections.REVIEW_REQUIRED.length + day.sections.DO_NOW.length).toBeGreaterThan(0);
  });

  it("is idempotent for identical source fingerprints", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha");
    project.events = [
      { id: "e1", eventType: "DRAWING_ISSUED", sourceObjectType: "drawing", sourceObjectId: "S-104", materiality: "MATERIAL", occurredAt: "2026-10-01T08:00:00.000Z" },
      { id: "e2", eventType: "DRAWING_ISSUED", sourceObjectType: "drawing", sourceObjectId: "S-104", materiality: "MATERIAL", occurredAt: "2026-10-01T08:05:00.000Z" },
    ];
    const once = resolve({ projects: [project] });
    const twice = resolve({ projects: [project] });
    expect(once.sections.FYI).toHaveLength(1);
    expect(twice.sections.FYI.map((row) => row.fingerprint)).toEqual(once.sections.FYI.map((row) => row.fingerprint));
    expect(attentionFingerprint({
      sourceDomain: "work_event",
      sourceObjectId: "S-104",
      category: "FYI",
      projectId: PROJECT_A,
      stateKey: "DRAWING_ISSUED",
    })).toBe(once.sections.FYI[0].fingerprint);
  });

  it("acknowledges presentation without resolving source state", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha");
    project.workPlans = [{ id: "plan-a", workType: "DESIGN_CALCULATION", status: "READY", readiness: "READY", startAllowed: true, discipline: "STRUCTURAL", systemId: null, relatedObjectType: null, relatedObjectId: null }];
    const open = resolve({ projects: [project] });
    const fingerprint = open.sections.DO_NOW[0].fingerprint;
    const acked = resolve({
      projects: [project],
      acknowledgements: [{ fingerprint, acknowledgedAt: "2026-10-01T11:00:00.000Z" }],
    });
    expect(acked.sections.DO_NOW[0].acknowledged).toBe(true);
    expect(acked.sections.DO_NOW[0].resolved).toBe(false);
    expect(acked.sections.DO_NOW[0].engineeringStateMutatedByAck).toBe(false);
  });

  it("does not invent due dates or overdue without a canonical needed-by", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha");
    project.requirements = [{
      id: "req-1", title: "Survey", status: "AWAITING_INFORMATION", blocking: true,
      providerDiscipline: "SURVEY", providerKind: "DISCIPLINE", providerRole: null, consumerDiscipline: "STRUCTURAL",
      neededBy: null, requiredForObjectId: null, workType: null,
    }];
    const day = resolve({ projects: [project] });
    expect(day.sections.WAITING_ON_OTHERS[0].neededBy).toBeNull();
    expect(day.sections.WAITING_ON_OTHERS[0].overdue).toBe(false);
  });

  it("routes attention actions to exact work context rather than module homes", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha");
    project.reviews = [{ id: "rev-1", workPlanId: "plan-xyz", resultState: "ATTENTION_REQUIRED", openConditionCount: 1, targetTitle: "CALC" }];
    const day = resolve({ projects: [project] });
    expect(day.sections.REVIEW_REQUIRED[0].action?.href).toBe("/engineering/work/plans/plan-xyz#review");
    expect(day.sections.REVIEW_REQUIRED[0].action?.href).not.toBe("/engineering/review");
  });

  it("counts active attention items rather than raw events", () => {
    const project = emptyProject(PROJECT_A, "Project Alpha");
    project.events = Array.from({ length: 12 }, (_, i) => ({
      id: `e${i}`,
      eventType: "SOURCE_REVISED" as const,
      sourceObjectType: "information_ref",
      sourceObjectId: "same",
      materiality: "ROUTINE",
      occurredAt: "2026-10-01T09:00:00.000Z",
    }));
    project.events.push({
      id: "pub",
      eventType: "SOURCE_PUBLISHED",
      sourceObjectType: "information_ref",
      sourceObjectId: "same",
      materiality: "MATERIAL",
      occurredAt: "2026-10-01T09:10:00.000Z",
    });
    project.workPlans = [{ id: "plan-a", workType: "DESIGN_CALCULATION", status: "IN_PROGRESS", readiness: "READY", startAllowed: true, discipline: "STRUCTURAL", systemId: null, relatedObjectType: "information_ref", relatedObjectId: "same" }];
    const day = resolve({ projects: [project] });
    expect(day.counts.actionRequired).toBeLessThan(12);
    expect(day.productivityScore).toBeNull();
    expect(day.employeeRanking).toBeNull();
  });
});
