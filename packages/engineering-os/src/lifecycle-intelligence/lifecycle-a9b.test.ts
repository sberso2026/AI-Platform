import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { evaluateLifecycleGate } from "./evaluate";
import { composeLifecycleThread } from "./fingerprint";
import { crusherCanonicalHarvestRecords, A9A_EARLY_WORKS_ID, A9A_STRUCTURAL_PACKAGE_ID, CRUSHER_EXPANSION_FEED_PROJECT_ID, readyFeedEvidence } from "./fixture";
import { createMemoryCanonicalSource, harvestCanonicalLifecycleEvidence } from "./harvest";
import { DEFAULT_ENGINEERING_LIFECYCLE_PROFILE } from "./profile";
import { alignScheduleToLifecycle, expectedStageFromLegacyProjectPhase, scheduleCannotAuthorizeTransition } from "./schedule";
import { EngineeringLifecycleService } from "./service";

function commerce(action: "analysis.read" | "analysis.write" | "settings.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

describe("EOS-A9B Lifecycle Evidence Harvest and Schedule Mapping", () => {
  const read = commerce("analysis.read");
  const write = commerce("analysis.write");
  const admin = commerce("settings.write");

  it("harvests Crusher FEED EXIT from canonical records without a caller evidence payload", async () => {
    const source = createMemoryCanonicalSource(crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE));
    const service = EngineeringLifecycleService.memoryForTests(undefined, source);
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
    });
    expect(evaluation.evidenceSource).toBe("CANONICAL");
    expect(evaluation.evidenceSnapshot?.fingerprint).toHaveLength(64);
    expect(evaluation.completeness).toBe("COMPLETE");
    expect(evaluation.readiness).toBe("READY_FOR_REVIEW");
    expect(evaluation.criteria.find((row) => row.type === "CONFIGURATION_BASELINE_REQUIRED")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "REQUIREMENTS_CONTEXT_REQUIRED")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "ASSUMPTION_REVIEW_REQUIRED")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "INTERFACE_INFORMATION_REQUIRED")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "ANALYSIS_EVIDENCE_REQUIRED")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "ENGINEERING_REVIEW_REQUIRED")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "DECISION_EVIDENCE_REQUIRED")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "ASSURANCE_EVALUATION_COMPLETE")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "CHANGE_SURFACED")?.status).toBe("SATISFIED");
    expect(evaluation.criteria.find((row) => row.type === "OPTIMIZATION_CONTEXT")?.applicability).toBe("NOT_APPLICABLE");
    expect(evaluation.criteria.every((row) => row.expectedCondition || row.applicability === "NOT_APPLICABLE" || row.type === "CHANGE_SURFACED" || row.type === "TRACEABILITY_MATURITY_REQUIRED" || row.explanation)).toBe(true);
  });

  it("rejects caller-supplied authoritative evidence on the production path", async () => {
    const source = createMemoryCanonicalSource(crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, { interfaceStatus: "INCOMPLETE" }));
    const service = EngineeringLifecycleService.memoryForTests(undefined, source);
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    await expect(
      service.evaluateGate(write, CRUSHER_FEED_TENANT, {
        assignmentId: assignment.id,
        gateId: "FEED_EXIT",
        evidence: readyFeedEvidence(),
      }),
    ).rejects.toThrow("caller_supplied_evidence_rejected");
  });

  it("allows TEST_FIXTURE injection only when evidenceMode is explicit", async () => {
    const service = EngineeringLifecycleService.memoryForTests();
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
      evidence: readyFeedEvidence(),
      evidenceMode: "TEST_FIXTURE",
    });
    expect(evaluation.evidenceSource).toBe("TEST_FIXTURE");
    expect(evaluation.readiness).toBe("READY_FOR_REVIEW");
  });

  it("marks the prior evaluation STALE when canonical interface evidence becomes INCOMPLETE", async () => {
    let status = "ACCEPTED";
    const source = createMemoryCanonicalSource((query) =>
      crusherCanonicalHarvestRecords(query.tenantId, query.workspaceId, { interfaceStatus: status }),
    );
    const service = EngineeringLifecycleService.memoryForTests(undefined, source);
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const ready = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
    });
    expect(ready.readiness).toBe("READY_FOR_REVIEW");
    status = "INCOMPLETE";
    const next = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
    });
    expect(next.readiness).toBe("NOT_READY");
    const prior = await service.getEvaluation(read, CRUSHER_FEED_TENANT, ready.id);
    expect(prior?.stale || prior?.readiness === "STALE").toBe(true);
    await expect(
      service.recordGateDecision(admin, CRUSHER_FEED_TENANT, {
        evaluationId: ready.id,
        decision: "APPROVED_TO_TRANSITION",
        rationale: "stale should be denied",
        actorId: "eng-admin",
      }),
    ).rejects.toThrow("stale_gate_evaluation");
  });

  it("propagates truncated harvest to PARTIAL completeness and blocks READY_FOR_REVIEW", async () => {
    const source = createMemoryCanonicalSource(
      crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, { truncated: true }),
    );
    const service = EngineeringLifecycleService.memoryForTests(undefined, source);
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
    });
    expect(evaluation.completeness).toBe("PARTIAL");
    expect(evaluation.readiness).toBe("PARTIAL");
    expect(evaluation.readiness).not.toBe("READY_FOR_REVIEW");
  });

  it("cannot satisfy NO_OPEN_BLOCKING from a PARTIAL Assurance Evaluation Run", () => {
    const evaluation = evaluateLifecycleGate({
      tenantId: CRUSHER_FEED_TENANT,
      workspaceId: CRUSHER_FEED_WORKSPACE,
      assignmentId: "a9b",
      profile: DEFAULT_ENGINEERING_LIFECYCLE_PROFILE,
      gateId: "FEED_EXIT",
      evidence: { ...readyFeedEvidence(), assurance: { completeness: "PARTIAL", conditions: [] } },
    });
    expect(evaluation.criteria.find((row) => row.type === "NO_OPEN_BLOCKING_ASSURANCE_CONDITIONS")?.status).toBe("NOT_SATISFIED");
    expect(evaluation.completeness).toBe("PARTIAL");
    expect(evaluation.readiness).not.toBe("READY_FOR_REVIEW");
  });

  it("harvests mixed scopes independently without merging project-wide truth", async () => {
    const harvested = await harvestCanonicalLifecycleEvidence(
      createMemoryCanonicalSource(crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE)),
      {
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        scopeType: "SYSTEM",
        scopeId: A9A_STRUCTURAL_PACKAGE_ID,
      },
    );
    expect(harvested.evidence.analyses.some((row) => row.id === "anl-structural-dd")).toBe(true);
    expect(harvested.evidence.reviews.some((row) => row.id === "rev-early-works")).toBe(false);
    const early = await harvestCanonicalLifecycleEvidence(
      createMemoryCanonicalSource(crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE)),
      {
        tenantId: CRUSHER_FEED_TENANT,
        workspaceId: CRUSHER_FEED_WORKSPACE,
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        scopeType: "ASSET",
        scopeId: A9A_EARLY_WORKS_ID,
      },
    );
    expect(early.evidence.reviews.some((row) => row.id === "rev-early-works")).toBe(true);
    expect(early.evidence.analyses.some((row) => row.id === "anl-structural-dd")).toBe(false);
  });

  it("keeps schedule mapping descriptive and refuses schedule authority over gates or transitions", async () => {
    const service = EngineeringLifecycleService.memoryForTests();
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    await expect(
      service.saveScheduleMapping(write, CRUSHER_FEED_TENANT, {
        projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
        scheduleObjectId: "feed-design-activities",
        schedulePhaseCode: "FEED",
        expectedLifecycleStage: "FEED",
        actorId: "engineer-a1",
      }),
    ).rejects.toThrow();
    await service.saveScheduleMapping(admin, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scheduleObjectId: "feed-design-activities",
      schedulePhaseCode: "FEED",
      expectedLifecycleStage: "FEED",
      mappingType: "EXPECTED_DURING",
      scheduleStatus: "active",
      actorId: "eng-admin",
    });
    await service.saveScheduleMapping(admin, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scheduleObjectId: "detailed-design-activities",
      schedulePhaseCode: "DETAILED_DESIGN",
      expectedLifecycleStage: "DETAILED_DESIGN",
      mappingType: "ALIGNS_WITH",
      scheduleStatus: "active",
      actorId: "eng-admin",
    });
    const overlapping = await service.scheduleAlignment(read, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(overlapping.state).toBe("OVERLAPPING");
    expect(overlapping.scheduleAuthority).toBe(false);
    expect(overlapping.legacyProjectPhaseAuthority).toBe(false);
    const ahead = alignScheduleToLifecycle({
      lifecycleStage: "FEED",
      mappings: overlapping.mappings.filter((row) => row.expectedLifecycleStage === "DETAILED_DESIGN"),
    });
    expect(ahead.state).toBe("AHEAD_OF_LIFECYCLE");
    expect(scheduleCannotAuthorizeTransition()).toEqual({ gateDecision: false, transition: false });
    expect(expectedStageFromLegacyProjectPhase("feed")).toBe("FEED");
    expect(assignment.stage).toBe("FEED");
    const current = await service.effective(read, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    });
    expect(current.stage).toBe("FEED");
    expect(composeLifecycleThread({
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      profileId: "EOS-DEFAULT-ENGINEERING",
      profileVersion: "v1",
      gateId: "FEED_EXIT",
      evaluationId: "eval-1",
      decisionId: "dec-1",
      transitionId: "tr-1",
      toStage: "DETAILED_DESIGN",
    })).toMatch(/lifecycle_gate:FEED_EXIT/);
  });

  it("measures canonical harvest duration for a representative FEED EXIT evaluation", async () => {
    const source = createMemoryCanonicalSource(crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE));
    const service = EngineeringLifecycleService.memoryForTests(undefined, source);
    const assignment = await service.assign(write, CRUSHER_FEED_TENANT, {
      projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      scopeType: "PROJECT",
      scopeId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const started = Date.now();
    const evaluation = await service.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
    });
    const durationMs = Date.now() - started;
    expect(evaluation.evidenceSnapshot?.items.length).toBeGreaterThan(5);
    expect(evaluation.criteria.length).toBeGreaterThan(8);
    expect(durationMs).toBeLessThan(1000);
  });
});
