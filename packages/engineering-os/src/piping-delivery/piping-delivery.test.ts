import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addClass,
  addLine,
  addMto,
  addPipingBasis,
  addRoute,
  addStressModel,
  addStressResult,
  addSupport,
  addTestRequirement,
  addTieIn,
  attachPiping,
  calculatePipeSize,
  createPipingDelivery,
  deliverableReadiness,
  freezePiping,
  modifyProcessCondition,
  pipingAdvisory,
  pipingHome,
  progressPipingStage,
  receiveMechanicalNozzle,
  receiveProcessCondition,
  recordConflict,
  recordNozzleComparison,
  registerPipingTool,
  reviewPiping,
  reviseNozzleLocation,
  reviseProcessCondition,
  unimplementedPipingCalculations,
} from "./engine";
import type { PipingActor } from "./engine";

const actor: PipingActor = {
  actorId: "gov-1",
  actorRole: "lifecycle_governor",
  at: "2026-10-28T16:30:00Z",
  workspaceId: "workspace-a",
  canAuthorizeLifecycleTransition: true,
  canApprove: true,
};

function must<T extends { error: string | null; delivery: unknown }>(result: T): T {
  expect(result.error).toBeNull();
  return result;
}

describe("EOS 2.6 piping design delivery", () => {
  it("moves a synthetic suction and discharge system through the lifecycle without calculating stress", () => {
    let delivery = must(createPipingDelivery({
      id: "pipe-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-piping-demo",
      projectTitle: "EOS Piping Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    })).delivery;
    expect(delivery.lifecycle.stage).toBe("not_classified");
    expect(delivery.audits[0]?.detail.legacyEnrolled).toBe(false);
    expect(delivery.audits[0]?.detail.identityMasterCreated).toBe(false);
    delivery = must(progressPipingStage(delivery, actor, "concept", "classify concept")).delivery;
    delivery = must(addPipingBasis(delivery, actor, { id: "db-1", title: "Routing philosophy", statement: "Synthetic rack route", status: "draft" })).delivery;
    delivery = must(attachPiping(delivery, actor, "options", { id: "opt-a", title: "Direct elevated pipe-rack route", route: "pipe_rack", stage: "concept", facts: ["PIP-001"], assumptions: ["Rack space is preliminary"], unresolved: ["Stress adequacy"] })).delivery;
    delivery = must(attachPiping(delivery, actor, "options", { id: "opt-b", title: "Alternate longer flexible route", route: "alternate", stage: "concept", facts: ["PIP-001"], assumptions: ["No quantity claim"], unresolved: ["Tie-in access"] })).delivery;
    delivery = must(attachPiping(delivery, actor, "assumptions", { id: "as-1", statement: "Stress adequacy is unknown", stage: "concept", blocksNextStage: false })).delivery;
    delivery = must(attachPiping(delivery, actor, "decisions", { id: "dec-1", statement: "Prefer the pipe-rack concept", stage: "concept" })).delivery;
    delivery = must(progressPipingStage(delivery, actor, "feasibility", "concept gate")).delivery;

    delivery = must(attachPiping(delivery, actor, "systems", { id: "sys-1", name: "Synthetic Pump Suction and Discharge System PIP-001", equipmentTag: "P-101" })).delivery;
    delivery = must(receiveProcessCondition(delivery, actor, { id: "proc-1", name: "Design temperature", value: "synthetic", unit: "C", ownedBy: "process", pipingModified: false, revision: 1, status: "current", synthetic: true })).delivery;
    expect(modifyProcessCondition(delivery).error).toMatch(/cannot modify a Process-owned condition/);
    expect(calculatePipeSize(delivery).error).toMatch(/not calculated/);
    delivery = must(addLine(delivery, actor, {
      id: "line-1", lineNumber: "L-101", identityRef: null, service: "Synthetic pump discharge", streamRef: "proc-1",
      designPressure: null, designPressureUnit: null, designTemperature: "synthetic", designTemperatureUnit: "C",
      lineSize: "synthetic", lineSizeUnit: "DN", lineSizeSource: "process", classId: "class-1",
      stressCritical: true, humanConfirmed: true, revision: 1, status: "current", inputIds: ["proc-1", "nz-1"], freshness: "current",
    })).delivery;
    delivery = must(addClass(delivery, actor, { id: "class-1", identifier: "synthetic-class", materialFamily: "carbon steel", revision: 1, status: "current", approvalGranted: false, inputIds: ["proc-1"], freshness: "current" })).delivery;
    expect(delivery.classes[0]?.approvalGranted).toBe(false);
    delivery = must(addRoute(delivery, actor, { id: "route-1", lineId: "line-1", revision: 1, classification: "pipe_rack", inputIds: ["nz-1"], freshness: "current" })).delivery;
    delivery = must(attachPiping(delivery, actor, "materials", { id: "mat-1", lineId: "line-1", baseMaterial: "synthetic carbon steel", corrosionAllowance: null, unit: null })).delivery;
    delivery = must(attachPiping(delivery, actor, "valves", { id: "valve-1", lineId: "line-1", valveType: "gate", size: null, unit: null })).delivery;
    delivery = must(addSupport(delivery, actor, { id: "sup-1", lineId: "line-1", supportType: "shoe", reaction: null, unit: null, inputIds: ["proc-1", "nz-1"], freshness: "current", structuralDesign: false })).delivery;
    delivery = must(attachPiping(delivery, actor, "restraints", { id: "rest-1", lineId: "line-1", restraintType: "guide" })).delivery;
    delivery = must(addTieIn(delivery, actor, { id: "tie-1", number: "TI-001", lineId: "line-1", fieldVerified: false, evidenceId: null, status: "open" })).delivery;
    delivery = must(addMto(delivery, actor, { id: "mto-1", lineId: "line-1", quantity: "synthetic", unit: "m", revision: 1, inputIds: ["nz-1"], freshness: "current", procurementAccurate: false })).delivery;
    expect(delivery.mtos[0]?.procurementAccurate).toBe(false);
    delivery = must(attachPiping(delivery, actor, "risks", { id: "risk-1", statement: "Synthetic flexibility risk", stage: "feasibility" })).delivery;
    delivery = must(attachPiping(delivery, actor, "interfaces", { id: "if-proc", consumer: "process", parameter: "design temperature", status: "proposed", inputIds: ["proc-1"], freshness: "current" })).delivery;
    delivery = must(progressPipingStage(delivery, actor, "feed", "feasibility gate")).delivery;

    delivery = must(addPipingBasis(delivery, actor, { id: "db-feed", title: "Controlled piping basis", statement: "Synthetic FEED basis", status: "accepted_for_stage" })).delivery;
    expect(delivery.basis.basisItems.find((item) => item.id === "db-feed")?.approvalGranted).toBe(false);
    delivery = must(attachPiping(delivery, actor, "requirements", { id: "req-1", title: "Pressure containment", sourceId: "src-1", stage: "feed" })).delivery;
    delivery = must(receiveMechanicalNozzle(delivery, actor, { id: "nz-1", equipmentTag: "P-101", nozzleId: "N1", location: "synthetic rack", allowableLoad: null, allowableUnit: null, allowableSource: null, ownedBy: "mechanical", pipingModified: false, revision: 1, status: "current" })).delivery;
    delivery = must(recordConflict(delivery, actor, { id: "cf-1", subjectId: "proc-1", statement: "Piping notes a class gap" })).delivery;
    expect(delivery.conflicts[0]?.processModified).toBe(false);
    delivery = must(attachPiping(delivery, actor, "specialItems", { id: "sp-1", lineId: "line-1", itemType: "strainer" })).delivery;
    delivery = must(addTestRequirement(delivery, actor, { id: "test-1", lineId: "line-1", testType: "hydrotest", pressure: null, unit: null, calculatedHere: false })).delivery;
    expect(delivery.tests[0]?.calculatedHere).toBe(false);
    delivery = must(attachPiping(delivery, actor, "interfaces", { id: "if-str", consumer: "structural", parameter: "support reaction", status: "accepted", inputIds: ["proc-1"], freshness: "current" })).delivery;
    delivery = must(attachPiping(delivery, actor, "interfaces", { id: "if-mech", consumer: "mechanical", parameter: "nozzle load", status: "accepted", inputIds: ["proc-1", "nz-1"], freshness: "current" })).delivery;
    delivery = must(attachPiping(delivery, actor, "deliverables", { id: "del-feed", title: "Piping FEED basis", stage: "feed", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: ["proc-1"], freshness: "current", ifc: false })).delivery;
    const frozen = must(freezePiping(delivery, actor, "feed_baseline", "base-feed"));
    delivery = frozen.delivery;
    const snapshot = delivery.baselines[0];
    delivery = must(progressPipingStage(delivery, actor, "detailed_engineering", "feed gate")).delivery;

    delivery = must(addStressModel(delivery, actor, { id: "model-1", lineId: "line-1", solver: "external-piping-solver", revision: 1, executionCertified: false, inputIds: ["proc-1", "nz-1"], freshness: "current", provenance: "SYNTHETIC_VALIDATION_FIXTURE" })).delivery;
    delivery = must(attachPiping(delivery, actor, "stressCases", { id: "case-1", modelId: "model-1", caseName: "sustained" })).delivery;
    delivery = must(addStressResult(delivery, actor, { id: "result-1", modelId: "model-1", value: "synthetic", unit: "kN", provenance: "SYNTHETIC_VALIDATION_FIXTURE", engine: "not_calculated", codeComplianceClaimed: false, executionCertified: false, inputIds: ["proc-1", "nz-1"], freshness: "current" })).delivery;
    expect(delivery.stressResults[0]?.codeComplianceClaimed).toBe(false);
    delivery = must(addSupport(delivery, actor, { id: "sup-2", lineId: "line-1", supportType: "anchor", reaction: "synthetic", unit: "kN", inputIds: ["proc-1", "nz-1"], freshness: "current", structuralDesign: false })).delivery;
    expect(delivery.supports.find((item) => item.id === "sup-2")?.structuralDesign).toBe(false);
    delivery = must(recordNozzleComparison(delivery, actor, { id: "cmp-1", nozzleRecordId: "nz-1", allowableValue: null, allowableUnit: null, pipingLoadValue: "synthetic", pipingLoadUnit: "kN", inputIds: ["proc-1", "nz-1"], freshness: "current" })).delivery;
    expect(delivery.comparisons[0]?.state).toBe("not_compared");
    expect(delivery.comparisons[0]?.acceptable).toBe(false);
    delivery = must(attachPiping(delivery, actor, "deliverables", { id: "del-1", title: "Detailed isometric", stage: "detailed_engineering", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: ["proc-1", "nz-1"], freshness: "current", ifc: false })).delivery;
    expect(deliverableReadiness(delivery, "del-1").ifc).toBe(false);

    const revised = must(reviseProcessCondition(delivery, actor, "proc-1", "revised synthetic temperature"));
    delivery = revised.delivery;
    expect(delivery.conditions.find((item) => item.id === "proc-1")?.value).toBe("synthetic");
    expect(delivery.conditions.find((item) => item.id === "proc-1")?.pipingModified).toBe(false);
    expect(delivery.lines[0]?.freshness).toBe("potentially_stale");
    expect(delivery.classes[0]?.freshness).toBe("potentially_stale");
    expect(delivery.stressModels[0]?.freshness).toBe("potentially_stale");
    expect(delivery.stressResults[0]?.freshness).toBe("potentially_stale");
    expect(delivery.supports.find((item) => item.id === "sup-2")?.freshness).toBe("potentially_stale");
    expect(delivery.interfaces.find((item) => item.id === "if-str")?.freshness).toBe("potentially_stale");
    expect(delivery.interfaces.find((item) => item.id === "if-mech")?.freshness).toBe("potentially_stale");
    const moved = must(reviseNozzleLocation(delivery, actor, "nz-1", "revised synthetic location"));
    delivery = moved.delivery;
    expect(delivery.nozzles.find((item) => item.id === "nz-1")?.location).toBe("synthetic rack");
    expect(delivery.routes[0]?.freshness).toBe("potentially_stale");
    expect(delivery.mtos[0]?.freshness).toBe("potentially_stale");
    expect(delivery.deliverables.find((item) => item.id === "del-1")?.freshness).toBe("potentially_stale");
    expect(snapshot?.conditionIds).toEqual(["proc-1"]);
    expect(snapshot?.nozzleIds).toEqual(["nz-1"]);
    expect(revised.delivery.audits.some((item) => item.detail.recalculated === false)).toBe(true);
    expect(pipingAdvisory(delivery)).toMatch(/does not invent piping quantities/);
    expect(pipingHome(delivery).staleStressModels).toBeGreaterThan(0);
  });

  it("refuses invented sizes, certified solvers, owner approval, and another workspace", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(source).not.toContain("recordPipingObjectIdentity");
    expect(unimplementedPipingCalculations().map((item) => item.id)).toEqual(expect.arrayContaining(["deterministic_stress_engine", "pipe_size_calculation", "hosted_stress_execution", "bidirectional_model_sync"]));
    let delivery = createPipingDelivery({
      id: "pipe-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-piping-demo", projectTitle: "EOS Piping Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    }).delivery;
    expect(addLine(delivery, actor, {
      id: "line-x", lineNumber: "L-X", identityRef: null, service: "Other", streamRef: null,
      designPressure: "10", designPressureUnit: "", designTemperature: null, designTemperatureUnit: null,
      lineSize: null, lineSizeUnit: null, lineSizeSource: null, classId: null, stressCritical: false, humanConfirmed: false,
      revision: 1, status: "current", inputIds: [], freshness: "current",
    }).error).toMatch(/unit/);
    expect(addLine(delivery, { ...actor, actorRole: "ai" }, {
      id: "line-ai", lineNumber: "L-AI", identityRef: null, service: "Other", streamRef: null,
      designPressure: null, designPressureUnit: null, designTemperature: null, designTemperatureUnit: null,
      lineSize: null, lineSizeUnit: null, lineSizeSource: null, classId: null, stressCritical: true, humanConfirmed: true,
      revision: 1, status: "current", inputIds: [], freshness: "current",
    }).error).toMatch(/human confirms/);
    expect(addTieIn(delivery, actor, { id: "tie-x", number: "TI-X", lineId: "line-x", fieldVerified: true, evidenceId: null, status: "open" }).error).toMatch(/evidence/);
    expect(addStressResult(delivery, actor, { id: "res-x", modelId: "m", value: "1", unit: "kN", provenance: "imported_reference", engine: "not_calculated", codeComplianceClaimed: false, executionCertified: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/does not calculate/);
    expect(registerPipingTool(delivery, actor, { id: "tool-1", tool: "CAESAR II", certifyExecution: true }).error).toMatch(/not certified/);
    expect(registerPipingTool(delivery, actor, { id: "tool-2", tool: "AVEVA E3D", bidirectional: true }).error).toMatch(/not implemented/);
    delivery = must(receiveMechanicalNozzle(delivery, actor, { id: "nz-x", equipmentTag: "P-101", nozzleId: "N1", location: null, allowableLoad: null, allowableUnit: null, allowableSource: null, ownedBy: "mechanical", pipingModified: false, revision: 1, status: "current" })).delivery;
    expect(recordNozzleComparison(delivery, actor, { id: "cmp-x", nozzleRecordId: "nz-x", allowableValue: null, allowableUnit: null, pipingLoadValue: "1", pipingLoadUnit: "kN", inputIds: [], freshness: "current", declareAcceptable: true }).error).toMatch(/does not declare nozzle acceptability/);
    expect(reviewPiping(delivery, { ...actor, actorRole: "owner", canApprove: true }, { id: "rev-1", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(reviewPiping(delivery, { ...actor, actorRole: "ai", canApprove: true }, { id: "rev-2", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(receiveProcessCondition(delivery, { ...actor, workspaceId: "workspace-b" }, { id: "proc-x", name: "Other", value: null, unit: null, ownedBy: "process", pipingModified: false, revision: 1, status: "current", synthetic: true }).error).toBe("cross_workspace_denied");
    expect(progressPipingStage(delivery, actor, "detailed_engineering", "skip").error).toMatch(/next stage/i);
  });
});
