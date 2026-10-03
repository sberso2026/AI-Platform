import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import {
  A11A_SYSTEM_ID,
  CRUSHER_EXPANSION_FEED_PROJECT_ID,
  CRUSHER_FEED_TENANT,
  CRUSHER_FEED_WORKSPACE,
  feedStructuralSnapshot,
  WORKFLOW_READINESS,
} from "../fixture";
import { A11E_PROJECT_B } from "../../change-workbench/fixture";
import { createMemoryWorkPlanStore } from "../memory-store";
import { EngineeringWorkGeneratorService } from "../service";
import { createMemoryQuantityMtoStore } from "../../lifecycle-intelligence/quantity-mto-store";
import { createTestQuantityMtoService } from "../../lifecycle-intelligence/quantity-mto-service";
import { acceptGovernedQuantity, deriveCost } from "../../lifecycle-intelligence/quantity-mto";
import { CRUSHER_APPROVED_STEEL_RATE } from "../../lifecycle-intelligence/quantity-mto-demonstrator";
import { valuePolicyForProject } from "../../lifecycle-intelligence/cross-lifecycle-value";
import { hostedMalwareScannerAvailable, MALWARE_SCAN_STATUS } from "../../tool-orchestration/return-validation";
import { spaceGassExecutionBoundary } from "../../tool-orchestration/tools";
import {
  A15A_V5_FEATURE_FREEZE,
  HOSTED_MALWARE_SCANNER,
  RETURNED_ARTIFACT_ROUND_TRIP,
  STRUCTURAL_SOLVER_BOUNDARY,
  STRUCTURAL_WORK_KINDS,
  computeSimplySupportedUdlDemand,
  createMemoryStructuralStore,
  createTestStructuralWorkService,
  crusherStructuralDesignBasis,
  exportStructuralCalculationWorkbook,
  fingerprintGovernedInputs,
  STRUCTURAL_FIXTURE_EXPECTED_DEMAND,
} from "./index";

function commerce(action: "analysis.read" | "analysis.write" = "analysis.write", extras: { tenantId?: string; workspaceId?: string } = {}) {
  return createTestCommerceExecutionContext({
    tenantId: extras.tenantId ?? CRUSHER_FEED_TENANT,
    workspaceId: extras.workspaceId ?? CRUSHER_FEED_WORKSPACE,
    actorUserId: "cert-er-a1@rtb-cert.test",
    policy: { productKey: "engineering-os", action, seatRequired: true },
  });
}

function harness() {
  const plans = createMemoryWorkPlanStore();
  const work = new EngineeringWorkGeneratorService({ from() { return this; } } as never, plans);
  const mto = createTestQuantityMtoService(createMemoryQuantityMtoStore(), (id) => plans.getPlan(id));
  const structural = createTestStructuralWorkService(createMemoryStructuralStore(), (id) => plans.getPlan(id), mto);
  return { plans, work, mto, structural };
}

async function crusherPlan(work: EngineeringWorkGeneratorService) {
  return work.generatePlan(commerce(), CRUSHER_FEED_TENANT, {
    projectId: CRUSHER_EXPANSION_FEED_PROJECT_ID,
    workType: "DESIGN_CALCULATION",
    lifecycleStage: "FEED",
    discipline: "STRUCTURAL",
    systemId: A11A_SYSTEM_ID,
    snapshot: feedStructuralSnapshot(),
    readiness: WORKFLOW_READINESS.feedBlocked,
    acknowledged: true,
  });
}

describe("EOS-A15A-V5 structural engineering work generator", () => {
  it("does not create a new top-level domain or uncertified solver", () => {
    expect(A15A_V5_FEATURE_FREEZE.newTopLevelDomain).toBe(false);
    expect(A15A_V5_FEATURE_FREEZE.newStructuralIntelligenceDomain).toBe(false);
    expect(A15A_V5_FEATURE_FREEZE.newCalculationIntelligenceDomain).toBe(false);
    expect(A15A_V5_FEATURE_FREEZE.newSolverFramework).toBe(false);
    expect(A15A_V5_FEATURE_FREEZE.spaceGassApiAvailable).toBe(false);
    expect(A15A_V5_FEATURE_FREEZE.llmAsNumericalSolver).toBe(false);
    expect(STRUCTURAL_WORK_KINDS).toEqual([
      "STRUCTURAL_DESIGN_BASIS",
      "STRUCTURAL_MEMBER_CHECK",
      "STRUCTURAL_CONNECTION_CHECK",
      "STRUCTURAL_FOUNDATION_INPUT_PACKAGE",
      "STRUCTURAL_MTO",
      "STRUCTURAL_DESIGN_REPORT",
    ]);
    const space = spaceGassExecutionBoundary("catalog");
    expect(space.apiAvailable).toBe(false);
    expect(space.realSolverExecution).toBe("NOT_CERTIFIED");
    expect(space.productionUsePermitted).toBe(false);
    expect(HOSTED_MALWARE_SCANNER).toBe("DEFERRED_EXTERNAL_DEPENDENCY");
    expect(RETURNED_ARTIFACT_ROUND_TRIP).toBe("DEFERRED_DEPENDENT_GATE");
    expect(hostedMalwareScannerAvailable({ RTB_REVIEW_CLAMAV_URL: "" })).toBe(false);
    expect(MALWARE_SCAN_STATUS === "UNAVAILABLE_HOSTED_CLAMAV" || MALWARE_SCAN_STATUS === "HOSTED_CLAMAV_CONFIGURED").toBe(true);
    const svc = createTestStructuralWorkService();
    expect(svc.rejectCallerClaims({ tenantId: "x" })).toBe("caller_supplied_authority_rejected");
    expect(svc.catalog().newTopLevelDomain).toBe(false);
  });

  it("assembles governed design basis provenance and blocks missing loads, geometry, and material", () => {
    const complete = crusherStructuralDesignBasis();
    expect(complete.complete).toBe(true);
    expect(complete.dataClassification).toBe("SYNTHETIC_DEMONSTRATION_DATA");
    expect(complete.standards[0]?.identifier).toBe("AS 4100");
    expect(complete.standards[0]?.projectApplicability).toBe("CONFIGURED");
    const dead = complete.inputs.find((row) => row.key === "load.dead.udl")!;
    expect(dead.provenance.sourceId).toBeTruthy();
    expect(dead.provenance.revision).toBe("A");
    expect(dead.status).toBe("GOVERNED");
    const missingLoad = crusherStructuralDesignBasis({ omitDeadLoad: true });
    expect(missingLoad.complete).toBe(false);
    expect(missingLoad.missing).toContain("LOAD_REQUIRED");
    const missingGeom = crusherStructuralDesignBasis({ omitSpan: true });
    expect(missingGeom.missing).toContain("GEOMETRY_REQUIRED");
    const missingMat = crusherStructuralDesignBasis({ omitMaterialGrade: true });
    expect(missingMat.missing).toContain("MATERIAL_GRADE_REQUIRED");
    expect(missingMat.inputs.find((row) => row.key === "material.grade")?.value).toBeNull();
  });

  it("computes deterministic simply-supported UDL demand independently of an LLM or SPACE GASS", () => {
    const demand = computeSimplySupportedUdlDemand({
      udlKNpm: STRUCTURAL_FIXTURE_EXPECTED_DEMAND.udlKNpm,
      spanM: STRUCTURAL_FIXTURE_EXPECTED_DEMAND.spanM,
    });
    expect(demand.shearKN).toBeCloseTo(STRUCTURAL_FIXTURE_EXPECTED_DEMAND.shearKN);
    expect(demand.momentKNm).toBeCloseTo(STRUCTURAL_FIXTURE_EXPECTED_DEMAND.momentKNm);
    expect(STRUCTURAL_SOLVER_BOUNDARY.notSpaceGassExecution).toBe(true);
    expect(STRUCTURAL_SOLVER_BOUNDARY.notAs4100Capacity).toBe(true);
  });

  it("creates a traceable manifest, fingerprints inputs, and runs a bounded member check", async () => {
    const { work, structural } = harness();
    const plan = await crusherPlan(work);
    const seeded = await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    expect(seeded.manifest.inputFingerprint).toBe(fingerprintGovernedInputs(seeded.designBasis.inputs));
    expect(seeded.manifest.engineId).toBe(STRUCTURAL_SOLVER_BOUNDARY.engineId);
    const ran = await structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: seeded.id });
    expect(ran.result?.results.demandMomentKNm).toBeCloseTo(156);
    expect(ran.result?.results.demandShearKN).toBeCloseTo(78);
    expect(ran.result?.results.utilization).toBeCloseTo(0.78);
    expect(ran.result?.engineeringApproved).toBe(false);
    expect(ran.status).toBe("REVIEW_REQUIRED");
    expect(ran.result?.results.capacityStatus).toBe("CAPACITY_SUPPLIED");
    expect(ran.thread.some((link) => link.relationship === "SOURCE_FOR")).toBe(true);
    expect(ran.thread.some((link) => link.relationship === "PRODUCED")).toBe(true);
  });

  it("blocks calculation when material grade is absent rather than guessing", async () => {
    const { work, structural } = harness();
    const plan = await crusherPlan(work);
    const seeded = await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id, omitMaterialGrade: true });
    expect(seeded.missingCodes).toContain("MATERIAL_GRADE_REQUIRED");
    const ran = await structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: seeded.id });
    expect(ran.status).toBe("INPUT_REQUIRED");
    expect(ran.result?.results.demandMomentKNm).toBeNull();
    expect(ran.result?.warnings).toContain("MATERIAL_GRADE_REQUIRED");
    expect(ran.result?.warnings).toContain("DESIGN_BASIS_INCOMPLETE");
    expect(new Set(ran.result?.warnings).size).toBe(ran.result?.warnings.length);
  });

  it("marks results stale on input change, keeps verified results immutable, and requires engineer review", async () => {
    const { work, structural } = harness();
    const plan = await crusherPlan(work);
    const seeded = await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    const ran = await structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: seeded.id });
    const verified = await structural.review(commerce(), CRUSHER_FEED_TENANT, { calculationId: ran.id, action: "ACCEPT_FOR_USE" });
    expect(verified.status).toBe("VERIFIED_BY_ENGINEER");
    expect(verified.result?.engineeringApproved).toBe(false);
    await expect(structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: verified.id })).rejects.toThrow("verified_calculation_immutable");
    const changed = await structural.changeGovernedInput(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: verified.id,
      key: "geometry.section",
      value: "360UB44.7",
    });
    expect(changed.id).not.toBe(verified.id);
    expect(changed.status).toBe("STALE");
    expect(changed.supersedesId).toBe(verified.id);
    expect(changed.designBasis.inputs.find((row) => row.key === "geometry.section")?.value).toBe("360UB44.7");
    expect(changed.designBasis.inputs.find((row) => row.key === "geometry.unitMass")?.value).toBe(44.7);
    const original = await structural.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, { id: verified.id });
    expect(original.status).toBe("VERIFIED_BY_ENGINEER");
    expect(original.designBasis.inputs.find((row) => row.key === "geometry.section")?.value).toBe("310UB40.4");
    expect(original.designBasis.inputs.find((row) => row.key === "geometry.unitMass")?.value).toBe(40.4);
    const rerun = await structural.rerun(commerce(), CRUSHER_FEED_TENANT, { calculationId: changed.id });
    expect(rerun.status).toBe("REVIEW_REQUIRED");
    expect(rerun.inputFingerprint).not.toBe(original.inputFingerprint);
  });

  it("integrates calculation outputs into governed Structural MTO without silently overwriting a verified snapshot", async () => {
    const { work, structural, mto } = harness();
    const plan = await crusherPlan(work);
    const seeded = await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    const ran = await structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: seeded.id });
    const first = await structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, { calculationId: ran.id });
    expect(first.revision).toBe("A");
    expect(first.items[0]?.quantityOrigin).toBe("DETERMINISTICALLY_DERIVED");
    await mto.verifyItem(commerce(), CRUSHER_FEED_TENANT, { snapshotId: first.id, itemId: first.items[0]!.id, status: "VERIFIED" });
    const verifiedSnap = await mto.verifySnapshot(commerce(), CRUSHER_FEED_TENANT, { snapshotId: first.id });
    expect(verifiedSnap.status).toBe("VERIFIED");
    const revision = await structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, { calculationId: ran.id });
    expect(revision.id).not.toBe(first.id);
    expect(revision.status).toBe("DRAFT");
    const still = await mto.getSnapshot(commerce("analysis.read"), CRUSHER_FEED_TENANT, { snapshotId: first.id });
    expect(still.status).toBe("SUPERSEDED");
    expect(still.snapshotFingerprint).toBe(verifiedSnap.snapshotFingerprint);
    const impacts = await structural.changeImpacts(commerce("analysis.read"), CRUSHER_FEED_TENANT, { calculationId: ran.id });
    expect(impacts.some((row) => row.dimension === "QUANTITY")).toBe(true);
    expect(impacts.find((row) => row.dimension === "COST")?.reason).toMatch(/COST_NOT_CALCULATED/);
  });

  it("exports a calculation appendix XLSX with provenance sheets", async () => {
    const { work, structural } = harness();
    const plan = await crusherPlan(work);
    const seeded = await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    const ran = await structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: seeded.id });
    const exported = await exportStructuralCalculationWorkbook(ran);
    expect(exported.fileName).toMatch(/STRUCT-CALC-/);
    expect(exported.sheets).toContain("07_Calculation");
    expect(exported.sheets).toContain("10_Source_Register");
    expect(exported.buffer.length).toBeGreaterThan(1000);
  });

  it("rejects cross-project access and caller-supplied tenant authority", async () => {
    const { work, structural } = harness();
    const plan = await crusherPlan(work);
    const seeded = await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    await expect(
      structural.get(commerce("analysis.read"), CRUSHER_FEED_TENANT, { id: seeded.id, selectedProjectId: A11E_PROJECT_B }),
    ).rejects.toThrow("CROSS_PROJECT_MISMATCH");
    await expect(
      structural.get(commerce("analysis.read", { tenantId: "other-tenant" }), "other-tenant", { id: seeded.id }),
    ).rejects.toThrow("not_found");
  });

  it("lists 10/100/500 calculations for staleness detection without FEA payloads", async () => {
    const { work, structural } = harness();
    const plan = await crusherPlan(work);
    const started = Date.now();
    for (let i = 0; i < 500; i += 1) {
      await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
      if (i + 1 === 10 || i + 1 === 100 || i + 1 === 500) {
        const listed = await structural.list(commerce("analysis.read"), CRUSHER_FEED_TENANT, { projectId: plan.projectId, workPlanId: plan.id });
        expect(listed.length).toBe(i + 1);
        expect(listed.every((row) => row.inputFingerprint.length === 64)).toBe(true);
        expect(listed.some((row) => row.status === "INPUT_REQUIRED" || row.status === "CALCULATION_INCOMPLETE")).toBe(true);
      }
    }
    expect(Date.now() - started).toBeLessThan(20000);
  }, 30000);

  it("syncs catalog unit mass on section change and derives steel mass from the catalog row", async () => {
    const { work, structural, mto } = harness();
    const plan = await crusherPlan(work);
    const seeded = await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    const ran = await structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: seeded.id });
    const first = await structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, { calculationId: ran.id });
    expect(first.disciplineScope).toBe("STRUCTURAL");
    expect(first.items).toHaveLength(1);
    expect(first.items[0]?.section).toBe("310UB40.4");
    expect(first.items[0]?.unitMass).toBe(40.4);
    expect(first.items[0]?.quantity).toBeCloseTo(0.3232, 6);
    const changed = await structural.changeGovernedInput(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: ran.id,
      key: "geometry.section",
      value: "360UB44.7",
    });
    expect(changed.designBasis.inputs.find((row) => row.key === "geometry.unitMass")?.value).toBe(44.7);
    expect(changed.designBasis.inputs.find((row) => row.key === "geometry.unitMass")?.provenance.sourceId).toBe("360 UB 44.7");
    const unknown = await structural.changeGovernedInput(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: changed.id,
      key: "geometry.section",
      value: "NOT-A-CATALOG-SECTION",
    });
    expect(unknown.designBasis.inputs.find((row) => row.key === "geometry.unitMass")?.value).toBeNull();
    expect(unknown.designBasis.inputs.find((row) => row.key === "geometry.unitMass")?.status).toBe("MISSING");
    const restored = await structural.changeGovernedInput(commerce(), CRUSHER_FEED_TENANT, {
      calculationId: unknown.id,
      key: "geometry.section",
      value: "360UB44.7",
    });
    const rerun = await structural.rerun(commerce(), CRUSHER_FEED_TENANT, { calculationId: restored.id });
    const second = await structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, { calculationId: rerun.id });
    expect(second.id).not.toBe(first.id);
    expect(second.supersedesSnapshotId).toBe(first.id);
    expect(second.items[0]?.section).toBe("360UB44.7");
    expect(second.items[0]?.unitMass).toBe(44.7);
    expect(second.items[0]?.quantity).toBeCloseTo(0.3576, 6);
    expect(second.items[0]?.basis.sourceRef).toBe(rerun.id);
    expect(second.items[0]?.basis.inputRefs).toContain(rerun.inputFingerprint);
    const preserved = await mto.getSnapshot(commerce("analysis.read"), CRUSHER_FEED_TENANT, { snapshotId: first.id });
    expect(preserved.snapshotFingerprint).toBe(first.snapshotFingerprint);
    expect(preserved.items[0]?.quantity).toBeCloseTo(0.3232, 6);
    const compared = await mto.compare(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      fromSnapshotId: first.id,
      toSnapshotId: second.id,
    });
    const steelDelta = compared.deltas.find((row) => row.itemCode === "ST-STEEL-UB");
    expect(compared.likeScope).toBe(true);
    expect(steelDelta?.kind).toBe("INCREASED");
    expect(steelDelta?.priorQuantity).toBeCloseTo(0.3232, 6);
    expect(steelDelta?.currentQuantity).toBeCloseTo(0.3576, 6);
    expect(steelDelta?.unit).toBe("t");
    const cost = deriveCost(acceptGovernedQuantity(second.items[0]!), CRUSHER_APPROVED_STEEL_RATE);
    expect(cost.state).toBe("DERIVED");
    if (cost.state === "DERIVED") {
      expect(cost.amount).toBeCloseTo(0.3576 * 4200, 6);
      expect(cost.currency).toBe("AUD");
      expect(cost.quantity).toBeCloseTo(0.3576, 6);
      expect(cost.rate.sourceRevision).toBe("R4");
    }
    expect(second.policy.carbon).toBe(valuePolicyForProject(plan.projectId).carbon);
    expect(second.carbonRequiredWithoutFactorExample.state).toBe("CARBON_NOT_CALCULATED");
  });

  it("keeps structural calculation MTO on a STRUCTURAL lineage and does not remove multidisciplinary missing-basis items", async () => {
    const { work, structural, mto } = harness();
    const plan = await crusherPlan(work);
    const seededMto = await mto.seedDemonstrator(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    const multiFingerprint = seededMto.revB.snapshotFingerprint;
    const plate = seededMto.revB.items.find((row) => row.itemCode === "ST-UNKNOWN-PLATE");
    expect(plate?.quantity).toBeNull();
    expect(plate?.quantityOrigin).toBe("MISSING");
    const plateQty = acceptGovernedQuantity(plate!);
    expect(plateQty.ok).toBe(false);
    if (!plateQty.ok) expect(plateQty.code).toBe("QUANTITY_NOT_AVAILABLE");
    const seeded = await structural.seedFixture(commerce(), CRUSHER_FEED_TENANT, { workPlanId: plan.id });
    const ran = await structural.runCheck(commerce(), CRUSHER_FEED_TENANT, { calculationId: seeded.id });
    const structuralSnap = await structural.applyToMto(commerce(), CRUSHER_FEED_TENANT, { calculationId: ran.id });
    expect(structuralSnap.disciplineScope).toBe("STRUCTURAL");
    expect(structuralSnap.supersedesSnapshotId).toBeNull();
    expect(structuralSnap.items.map((row) => row.itemCode)).toEqual(["ST-STEEL-UB"]);
    const multiStill = await mto.getSnapshot(commerce("analysis.read"), CRUSHER_FEED_TENANT, { snapshotId: seededMto.revB.id });
    expect(multiStill.status).not.toBe("SUPERSEDED");
    expect(multiStill.snapshotFingerprint).toBe(multiFingerprint);
    expect(multiStill.items.find((row) => row.itemCode === "ST-UNKNOWN-PLATE")?.quantity).toBeNull();
    const unlike = await mto.compare(commerce("analysis.read"), CRUSHER_FEED_TENANT, {
      fromSnapshotId: seededMto.revB.id,
      toSnapshotId: structuralSnap.id,
    });
    expect(unlike.likeScope).toBe(false);
    expect(unlike.deltas).toEqual([]);
    expect(unlike.deltas.some((row) => row.kind === "REMOVED")).toBe(false);
    const listed = await mto.listSnapshots(commerce("analysis.read"), CRUSHER_FEED_TENANT, { projectId: plan.projectId, workPlanId: plan.id });
    expect(listed.filter((row) => row.disciplineScope === "MULTIDISCIPLINARY" && row.status !== "SUPERSEDED")).toHaveLength(1);
    expect(listed.filter((row) => row.disciplineScope === "STRUCTURAL")).toHaveLength(1);
  });
});
