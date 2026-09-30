import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE } from "../digital-thread/fixture";
import { EngineeringLifecycleService } from "../lifecycle-intelligence/service";
import { createMemoryCanonicalSource } from "../lifecycle-intelligence/harvest";
import { crusherCanonicalHarvestRecords, readyFeedEvidence } from "../lifecycle-intelligence/fixture";
import { EngineeringDeliverableService } from "./service";
import {
  A9C_INTERFACE_PACKAGE_CODE,
  A9C_STRUCTURAL_ANALYSIS_CODE,
  crusherDeliverableExpectation,
  structuralBindings,
} from "./fixture";
import { applyWaiverToDimensions, readinessFromDimensions } from "./evaluate";
import { DEFAULT_DELIVERABLE_MATURITY_PROFILE } from "./catalog";
import { MATURITY_DIMENSIONS } from "./types";

function commerce(action: "analysis.read" | "analysis.write" | "settings.write") {
  return createTestCommerceExecutionContext({
    tenantId: CRUSHER_FEED_TENANT,
    workspaceId: CRUSHER_FEED_WORKSPACE,
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function cloneBundle(reviewed = true, interfaceStatus = "ACCEPTED", stale = false, withRequirement = true) {
  const bundle = crusherCanonicalHarvestRecords(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, { interfaceStatus });
  bundle.records = bundle.records.map((row) => {
    if (row.objectId === "anl-struct") {
      return { ...row, fields: { ...row.fields, reviewed, stale }, stale };
    }
    return row;
  });
  if (!withRequirement) {
    bundle.records = bundle.records.filter((row) => row.objectType !== "requirement");
  }
  return bundle;
}

describe("EOS-A9C Deliverable & Engineering Maturity Intelligence", () => {
  const read = commerce("analysis.read");
  const write = commerce("analysis.write");
  const admin = commerce("settings.write");

  it("models a deliverable as an expectation and certifies the Crusher Structural Analysis Package path", async () => {
    const started = Date.now();
    const service = EngineeringDeliverableService.memoryForTests(cloneBundle(false));
    const catalog = service.catalog();
    expect(catalog.universalScore).toBe(false);
    expect(catalog.percentCompleteAuthority).toBe(false);
    expect(catalog.scheduleMaturityAuthority).toBe(false);
    expect(catalog.kgReadsDefault).toBe("OFF");
    expect(catalog.definitions.every((row) => row.origin === "EXAMPLE")).toBe(true);

    const expectation = await service.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "engineer-a1",
    });
    expect(expectation.definitionCode).toBe("STR-ANL-FEED");
    expect(expectation.responsibleDiscipline).toBe("STRUCTURAL");
    expect(expectation.contributingDisciplines).toContain("MECHANICAL");

    const missing = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(false),
    });
    expect(missing.assessment.readiness).toBe("INCOMPLETE");
    expect(missing.assessment.dimensions.find((row) => row.dimension === "CONTENT")?.state).toBe("NOT_SATISFIED");
    expect(missing.humanApproved).toBe(false);
    expect(missing.percentComplete).toBeNull();

    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "analysis_result",
      artifactId: "anl-struct",
      artifactRole: "PRIMARY",
      actorId: "engineer-a1",
    });
    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "analysis_result",
      artifactId: "anl-struct",
      artifactRole: "CALCULATION",
      actorId: "engineer-a1",
    });
    const contentOnly = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(false),
    });
    expect(contentOnly.assessment.dimensions.find((row) => row.dimension === "CONTENT")?.state).toBe("SATISFIED");
    expect(contentOnly.assessment.dimensions.find((row) => row.dimension === "REVIEW")?.state).toBe("NOT_SATISFIED");
    expect(contentOnly.assessment.dimensions.find((row) => row.dimension === "SUPPORTING_EVIDENCE")?.state).toBe("NOT_SATISFIED");

    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "review_package",
      artifactId: "rev-feed-exit",
      artifactRole: "REVIEW",
      actorId: "engineer-a1",
    });
    const incompleteReviewEvidence = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(false, "INCOMPLETE"),
    });
    expect(incompleteReviewEvidence.assessment.dimensions.find((row) => row.dimension === "REVIEW")?.state).toBe("SATISFIED");
    expect(incompleteReviewEvidence.assessment.dimensions.find((row) => row.dimension === "SUPPORTING_EVIDENCE")?.state).toBe("NOT_SATISFIED");
    expect(incompleteReviewEvidence.assessment.dimensions.find((row) => row.dimension === "COORDINATION")?.state).toBe("NOT_SATISFIED");
    expect(incompleteReviewEvidence.assessment.readiness).not.toBe("READY_FOR_REVIEW");

    const coordinated = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(true, "ACCEPTED"),
    });
    expect(coordinated.assessment.dimensions.find((row) => row.dimension === "REVIEW")?.state).toBe("SATISFIED");
    expect(coordinated.assessment.dimensions.find((row) => row.dimension === "COORDINATION")?.state).toBe("SATISFIED");
    expect(coordinated.assessment.dimensions.find((row) => row.dimension === "CONFIGURATION")?.state).toBe("SATISFIED");
    expect(coordinated.assessment.dimensions.find((row) => row.dimension === "TRACEABILITY")?.state).toBe("SATISFIED");
    expect(coordinated.assessment.dimensions.find((row) => row.dimension === "SUPPORTING_EVIDENCE")?.state).toBe("SATISFIED");
    expect(coordinated.assessment.completeness).toBe("COMPLETE");
    expect(coordinated.assessment.readiness).toBe("READY_FOR_REVIEW");
    expect(coordinated.assessment.digitalThread).toContain("deliverable_expectation:");
    expect(coordinated.assessment.evidenceFingerprint).toHaveLength(64);
    expect(coordinated.assessment.evidenceFingerprint).not.toMatch(/Structural Analysis Package/);
    expect(Date.now() - started).toBeLessThan(5000);
  });

  it("rejects caller-supplied authoritative maturity and keeps TEST_FIXTURE explicit", async () => {
    const service = EngineeringDeliverableService.memoryForTests(cloneBundle());
    const expectation = await service.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "engineer-a1",
    });
    await expect(
      service.evaluate(write, CRUSHER_FEED_TENANT, {
        expectationId: expectation.id,
        maturityClaims: { contentComplete: true, reviewComplete: true },
      }),
    ).rejects.toThrow("caller_supplied_maturity_rejected");
  });

  it("does not let PARTIAL harvest claim purpose readiness", async () => {
    const truncated = cloneBundle();
    truncated.truncated = true;
    const service = EngineeringDeliverableService.memoryForTests(truncated);
    const expectation = await service.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "engineer-a1",
    });
    for (const binding of structuralBindings(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, { includeAnalysis: true, includeReview: true })) {
      await service.bind(write, CRUSHER_FEED_TENANT, {
        expectationId: expectation.id,
        artifactClass: binding.artifactClass,
        artifactId: binding.artifactId,
        artifactRole: binding.artifactRole,
        actorId: "engineer-a1",
      });
    }
    const assessed = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: truncated,
    });
    expect(assessed.assessment.completeness).toBe("PARTIAL");
    expect(assessed.assessment.readiness).toBe("PARTIAL");
    expect(assessed.assessment.readiness).not.toBe("READY_FOR_CONFIGURED_PURPOSE");
    expect(assessed.assessment.readiness).not.toBe("READY_FOR_REVIEW");
  });

  it("stales the prior assessment when analysis evidence changes", async () => {
    const service = EngineeringDeliverableService.memoryForTests(cloneBundle(true));
    const expectation = await service.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "engineer-a1",
    });
    for (const binding of structuralBindings(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, { includeAnalysis: true, includeReview: true })) {
      await service.bind(write, CRUSHER_FEED_TENANT, {
        expectationId: expectation.id,
        artifactClass: binding.artifactClass,
        artifactId: binding.artifactId,
        artifactRole: binding.artifactRole,
        actorId: "engineer-a1",
      });
    }
    const first = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(true),
    });
    expect(first.assessment.readiness).toBe("READY_FOR_REVIEW");
    const second = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(true, "ACCEPTED", true),
    });
    expect(second.assessment.readiness).not.toBe("READY_FOR_REVIEW");
    expect(second.assessment.dimensions.find((row) => row.dimension === "SUPPORTING_EVIDENCE")?.state).toBe("NOT_SATISFIED");
    const listed = await service.list(read, CRUSHER_FEED_TENANT, "proj-crusher-feed");
    expect(listed.note).toContain("not engineering percent complete");
    expect(listed.note).not.toMatch(/% complete|83%/i);
  });

  it("keeps schedule complete from setting deliverable maturity", async () => {
    const service = EngineeringDeliverableService.memoryForTests(cloneBundle(false));
    const row = crusherDeliverableExpectation(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, A9C_STRUCTURAL_ANALYSIS_CODE, {
      id: "sched-conflict",
      scheduleStatus: "complete",
    });
    const created = await service.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: row.projectId,
      code: row.definitionCode,
      scheduleObjectId: "structural-analysis-complete",
      scheduleStatus: "complete",
      actorId: "engineer-a1",
    });
    const assessed = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: created.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(false),
    });
    expect(created.scheduleStatus).toBe("complete");
    expect(assessed.scheduleCompleteDoesNotSetMaturity).toBe(true);
    expect(assessed.assessment.readiness).not.toBe("READY_FOR_REVIEW");
  });

  it("marks multidisciplinary coordination incomplete when required interface information is missing", async () => {
    const service = EngineeringDeliverableService.memoryForTests(cloneBundle(true, "INCOMPLETE"));
    const expectation = await service.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_INTERFACE_PACKAGE_CODE,
      actorId: "engineer-a1",
    });
    await service.bind(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      artifactClass: "interface",
      artifactId: "iir-load",
      artifactRole: "PRIMARY",
      actorId: "engineer-a1",
    });
    const assessed = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(true, "INCOMPLETE"),
    });
    expect(expectation.responsibleDiscipline).toBe("PROCESS");
    expect(expectation.contributingDisciplines).toEqual(expect.arrayContaining(["MECHANICAL", "STRUCTURAL"]));
    expect(assessed.assessment.dimensions.find((row) => row.dimension === "COORDINATION")?.state).toBe("NOT_SATISFIED");
    expect(assessed.assessment.assuranceSignals.some((row) => row.conditionType === "DELIVERABLE_INTERFACE_COORDINATION_GAP")).toBe(true);
  });

  it("records a waiver without rewriting unsatisfied evidence as SATISFIED", async () => {
    const service = EngineeringDeliverableService.memoryForTests(cloneBundle(false));
    const expectation = await service.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "engineer-a1",
    });
    const assessed = await service.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle: cloneBundle(false),
    });
    const waived = await service.waive(admin, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      assessmentId: assessed.assessment.id,
      dimension: "REVIEW",
      rationale: "FEED review deferred by authorized project engineering manager",
      actorId: "eng-admin",
    });
    expect(waived.originalState).toBe("NOT_SATISFIED");
    expect(waived.waivedState).toBe("NOT_SATISFIED");
    expect(waived.evidenceRewritten).toBe(false);
    const overlay = applyWaiverToDimensions(assessed.assessment.dimensions, [{ dimension: "REVIEW", waiverId: waived.waiver.id }]);
    expect(overlay.find((row) => row.dimension === "REVIEW")?.state).toBe("NOT_SATISFIED");
    expect(overlay.find((row) => row.dimension === "REVIEW")?.waived).toBe(true);
  });

  it("lets a lifecycle gate consume configured deliverable maturity without auto-approval", async () => {
    const bundle = cloneBundle(true);
    const deliverables = EngineeringDeliverableService.memoryForTests(bundle);
    const lifecycle = EngineeringLifecycleService.memoryForTests(
      undefined,
      createMemoryCanonicalSource(bundle),
      deliverables,
    );
    const assignment = await lifecycle.assign(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      scopeType: "PROJECT",
      scopeId: "proj-crusher-feed",
      stage: "FEED",
      actorId: "engineer-a1",
    });
    const missingGate = await lifecycle.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
      evidenceMode: "TEST_FIXTURE",
      evidence: readyFeedEvidence(),
    });
    expect(missingGate.criteria.find((row) => row.type === "REQUIRED_DELIVERABLES_PRESENT")?.applicability).toBe("NOT_APPLICABLE");

    const expectation = await deliverables.instantiate(write, CRUSHER_FEED_TENANT, {
      projectId: "proj-crusher-feed",
      code: A9C_STRUCTURAL_ANALYSIS_CODE,
      actorId: "engineer-a1",
    });
    const incomplete = await lifecycle.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
    });
    expect(incomplete.criteria.find((row) => row.type === "REQUIRED_DELIVERABLES_PRESENT")?.status).toBe("NOT_SATISFIED");
    expect(incomplete.readiness).toBe("NOT_READY");

    for (const binding of structuralBindings(CRUSHER_FEED_TENANT, CRUSHER_FEED_WORKSPACE, { includeAnalysis: true, includeReview: true })) {
      await deliverables.bind(write, CRUSHER_FEED_TENANT, {
        expectationId: expectation.id,
        artifactClass: binding.artifactClass,
        artifactId: binding.artifactId,
        artifactRole: binding.artifactRole,
        actorId: "engineer-a1",
      });
    }
    await deliverables.evaluate(write, CRUSHER_FEED_TENANT, {
      expectationId: expectation.id,
      evidenceMode: "TEST_FIXTURE",
      bundle,
    });
    const ready = await lifecycle.evaluateGate(write, CRUSHER_FEED_TENANT, {
      assignmentId: assignment.id,
      gateId: "FEED_EXIT",
    });
    expect(ready.criteria.find((row) => row.type === "REQUIRED_DELIVERABLES_PRESENT")?.status).toBe("SATISFIED");
    expect(ready.criteria.find((row) => row.type === "DELIVERABLE_MATURITY_REQUIRED")?.status).toBe("SATISFIED");
    expect(ready.readiness).toBe("READY_FOR_REVIEW");
    expect(ready.criteria.find((row) => row.type === "ENGINEERING_REVIEW_REQUIRED")?.status).toBe("SATISFIED");
  });

  it("keeps purpose-specific readiness and has no universal score", () => {
    expect(MATURITY_DIMENSIONS).toEqual([
      "CONTENT",
      "TRACEABILITY",
      "COORDINATION",
      "REVIEW",
      "CONFIGURATION",
      "SUPPORTING_EVIDENCE",
    ]);
    expect(DEFAULT_DELIVERABLE_MATURITY_PROFILE.requiredDimensionsByPurpose.FOR_INTERNAL_COORDINATION).not.toEqual(
      DEFAULT_DELIVERABLE_MATURITY_PROFILE.requiredDimensionsByPurpose.FOR_CONSTRUCTION_USE,
    );
    expect(
      readinessFromDimensions({
        dimensions: [],
        purpose: "FOR_ENGINEERING_REVIEW",
        required: ["CONTENT"],
        completeness: "PARTIAL",
        bound: true,
      }),
    ).toBe("PARTIAL");
  });
});
