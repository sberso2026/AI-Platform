import { describe, expect, it } from "vitest";
import {
  createBaseline,
  createDeliveryLifecycle,
  changeMaturity,
  lifecycleAdvisory,
  requestStageTransition,
  reviseBaseline,
} from "./engine";
import { evaluateGate, genericCriteria, roleMayAuthorizeTransition } from "./model";

const base = () =>
  createDeliveryLifecycle({
    id: "life-1",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-1",
    actorId: "user-1",
    at: "2026-10-28T12:00:00Z",
  });

describe("EOS 2.1 delivery lifecycle", () => {
  it("creates an unclassified lifecycle and does not invent a stage", () => {
    const created = base();
    expect(created.lifecycle.stage).toBe("not_classified");
    expect(created.lifecycle.maturity).toBeNull();
    expect(created.audit[0]?.action).toBe("lifecycle_created");
    expect(created.audit[0]?.detail.autoClassified).toBe(false);
  });

  it("allows only the next stage", () => {
    const created = base();
    const skip = requestStageTransition(created.lifecycle, {
      to: "feed",
      reason: "skip",
      actorId: "gov-1",
      actorRole: "lifecycle_governor",
      at: "2026-10-28T12:01:00Z",
      canAuthorizeLifecycleTransition: true,
    });
    expect(skip.committed).toBe(false);
    expect(skip.error).toMatch(/next stage/i);
    const concept = requestStageTransition(created.lifecycle, {
      to: "concept",
      reason: "classify",
      actorId: "gov-1",
      actorRole: "lifecycle_governor",
      at: "2026-10-28T12:01:00Z",
      canAuthorizeLifecycleTransition: true,
    });
    expect(concept.committed).toBe(true);
    expect(concept.lifecycle.stage).toBe("concept");
    expect(concept.audit.some((item) => item.action === "stage_transition")).toBe(true);
  });

  it("refuses owner, admin, pilot engineer, and AI even when a flag is set", () => {
    const created = base();
    for (const role of ["owner", "admin", "pilot-engineer", "pilot_engineer", "ai"]) {
      expect(roleMayAuthorizeTransition(role)).toBe(false);
      const result = requestStageTransition(created.lifecycle, {
        to: "concept",
        reason: "classify",
        actorId: "user",
        actorRole: role,
        at: "2026-10-28T12:01:00Z",
        canAuthorizeLifecycleTransition: true,
      });
      expect(result.committed).toBe(false);
    }
  });

  it("blocks an ordinary transition when a blocking criterion is unmet", () => {
    const created = base();
    const concept = requestStageTransition(created.lifecycle, {
      to: "concept",
      reason: "classify",
      actorId: "gov-1",
      actorRole: "lifecycle_governor",
      at: "2026-10-28T12:01:00Z",
      canAuthorizeLifecycleTransition: true,
    });
    const blocked = requestStageTransition(concept.lifecycle, {
      to: "feasibility",
      reason: "advance",
      actorId: "gov-1",
      actorRole: "lifecycle_governor",
      at: "2026-10-28T12:02:00Z",
      canAuthorizeLifecycleTransition: true,
    });
    expect(blocked.committed).toBe(false);
    expect(blocked.blockers.length).toBeGreaterThan(0);
    const overridden = requestStageTransition(concept.lifecycle, {
      to: "feasibility",
      reason: "advance",
      actorId: "gov-1",
      actorRole: "lifecycle_governor",
      at: "2026-10-28T12:02:00Z",
      canAuthorizeLifecycleTransition: true,
      overrideRationale: "Recorded exception for this synthetic project.",
    });
    expect(overridden.committed).toBe(true);
    expect(overridden.audit.some((item) => item.action === "gate_override")).toBe(true);
  });

  it("keeps maturity separate from approval and freezes baselines by revision", () => {
    const created = base();
    const matured = changeMaturity(created.lifecycle, "concept_initial", "user-1", "2026-10-28T12:03:00Z");
    expect(matured.audit.detail.approvalGranted).toBe(false);
    const first = createBaseline({
      lifecycle: matured.lifecycle,
      id: "base-1",
      baselineType: "concept_freeze",
      actorId: "user-1",
      at: "2026-10-28T12:04:00Z",
      unresolvedExceptions: ["assumption-1"],
    });
    expect(first.baseline.frozen).toBe(true);
    expect(first.baseline.refs.assumptions).toEqual([]);
    const revised = reviseBaseline(first.baseline, first.lifecycle, "user-1", "2026-10-28T12:05:00Z");
    expect("baseline" in revised).toBe(true);
    if ("baseline" in revised) expect(revised.baseline.revision).toBe(2);
  });

  it("links assumptions, requirements, interfaces, and deliverables without treating them as approval", () => {
    const created = base();
    created.lifecycle.assumptions.push({
      id: "a-1",
      introducedStage: "concept",
      expectedResolutionStage: "feasibility",
      status: "blocking_next_stage",
      owner: "eng",
      impactIfWrong: "option may be invalid",
      downstream: ["req-1"],
    });
    created.lifecycle.requirements.push({
      id: "req-1",
      introducedStage: "concept",
      maturity: "concept_initial",
      verificationMethod: "review",
      verificationStatus: "unverified",
      evidenceRef: null,
      discipline: "common",
      downstream: ["del-1"],
    });
    created.lifecycle.interfaces.push({
      id: "if-1",
      sourceDiscipline: "process",
      receivingDiscipline: "mechanical",
      parameter: "duty",
      revision: "1",
      status: "proposed",
      stage: "concept",
      acceptance: "pending",
      downstream: ["del-1"],
      owner: "eng",
      dueDate: null,
    });
    created.lifecycle.deliverables.push({
      id: "del-1",
      deliverableType: "report",
      discipline: "common",
      stage: "concept",
      maturity: "concept_initial",
      revision: "A",
      status: "current",
      reviewer: null,
      approver: null,
      linkedObjects: ["req-1"],
      baselineId: null,
    });
    const concept = requestStageTransition(
      { ...created.lifecycle, stage: "concept", criteria: genericCriteria("concept").map((item) => ({ ...item, status: "met" as const })) },
      {
        to: "feasibility",
        reason: "advance",
        actorId: "gov-1",
        actorRole: "lifecycle_governor",
        at: "2026-10-28T12:06:00Z",
        canAuthorizeLifecycleTransition: true,
      },
    );
    expect(concept.committed).toBe(false);
    expect(concept.blockers).toContain("a-1");
    const advice = lifecycleAdvisory(created.lifecycle);
    expect(advice).toMatch(/Advisory only/i);
    expect(advice).toMatch(/does not authorize/i);
    expect(evaluateGate(genericCriteria("feed")).ready).toBe(false);
  });
});
