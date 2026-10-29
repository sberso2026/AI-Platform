import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  acceptVendorData,
  addLifting,
  addMass,
  addMechanicalBasis,
  addVendorData,
  attachMechanical,
  createMechanicalDelivery,
  deliverableReadiness,
  freezeMechanical,
  mechanicalAdvisory,
  mechanicalHome,
  modifyProcessDuty,
  progressMechanicalStage,
  receiveProcessDuty,
  recordProcessConflict,
  recordVendorMassChange,
  registerMechanicalTool,
  reviewMechanical,
  reviseUpstream,
  unimplementedMechanicalCalculations,
} from "./engine";
import type { MechanicalActor } from "./engine";

const actor: MechanicalActor = {
  actorId: "gov-1",
  actorRole: "lifecycle_governor",
  at: "2026-10-28T16:00:00Z",
  workspaceId: "workspace-a",
  canAuthorizeLifecycleTransition: true,
  canApprove: true,
};

function must<T extends { error: string | null; delivery: unknown }>(result: T): T {
  expect(result.error).toBeNull();
  return result;
}

describe("EOS 2.5 mechanical design delivery", () => {
  it("moves a synthetic pump through the lifecycle without calculating mechanical capacity", () => {
    let delivery = must(createMechanicalDelivery({
      id: "mech-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-mechanical-demo",
      projectTitle: "EOS Mechanical Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    })).delivery;
    expect(delivery.lifecycle.stage).toBe("not_classified");
    expect(delivery.audits[0]?.detail.legacyEnrolled).toBe(false);
    delivery = must(progressMechanicalStage(delivery, actor, "concept", "classify concept")).delivery;
    delivery = must(addMechanicalBasis(delivery, actor, { id: "db-1", title: "Redundancy philosophy", statement: "Synthetic pump duty", status: "draft" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "options", { id: "opt-a", title: "1 x 100 percent duty pump", arrangement: "one_hundred_percent", stage: "concept", facts: ["P-101"], assumptions: ["Duty is preliminary"], unresolved: ["Vendor performance"] })).delivery;
    delivery = must(attachMechanical(delivery, actor, "options", { id: "opt-b", title: "2 x 100 percent duty/standby pumps", arrangement: "duty_standby", stage: "concept", facts: ["P-101"], assumptions: ["No commercial claim"], unresolved: ["Footprint"] })).delivery;
    delivery = must(attachMechanical(delivery, actor, "assumptions", { id: "as-1", statement: "Vendor performance is unknown", stage: "concept", blocksNextStage: false })).delivery;
    delivery = must(attachMechanical(delivery, actor, "decisions", { id: "dec-1", statement: "Prefer duty/standby for the synthetic pump", stage: "concept" })).delivery;
    delivery = must(progressMechanicalStage(delivery, actor, "feasibility", "concept gate")).delivery;

    delivery = must(attachMechanical(delivery, actor, "equipment", { id: "eq-p101", tag: "P-101", kind: "rotating", family: "pump", service: "Synthetic feed pump", processDutyId: "duty-1", stage: "feasibility", status: "current" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "equipment", { id: "eq-v101", tag: "V-101", kind: "static", family: "separator", service: "Synthetic inlet separator", processDutyId: null, stage: "feasibility", status: "current" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "equipment", { id: "eq-e101", tag: "E-101", kind: "static", family: "heat_exchanger", service: "Synthetic cooler mechanical record", processDutyId: null, stage: "feasibility", status: "current" })).delivery;
    expect(delivery.equipment.find((item) => item.family === "heat_exchanger")?.kind).toBe("static");
    delivery = must(receiveProcessDuty(delivery, actor, { id: "duty-1", equipmentId: "eq-p101", name: "Process flowrate", value: "synthetic", unit: "m3/h", ownedBy: "process", mechanicalModified: false, revision: 1, status: "current", synthetic: true })).delivery;
    expect(modifyProcessDuty(delivery).error).toMatch(/cannot modify a Process-owned duty/);
    delivery = must(recordProcessConflict(delivery, actor, { id: "cf-1", dutyId: "duty-1", statement: "Mechanical notes a datasheet gap" })).delivery;
    expect(delivery.conflicts[0]?.processModified).toBe(false);
    expect(delivery.duties[0]?.value).toBe("synthetic");
    delivery = must(attachMechanical(delivery, actor, "datasheets", { id: "ds-1", equipmentId: "eq-p101", revision: 1, dutyId: "duty-1", inputIds: ["duty-1"], freshness: "current", status: "current" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "materials", { id: "mat-1", equipmentId: "eq-p101", baseMaterial: "synthetic carbon steel", corrosionAllowance: null, unit: null })).delivery;
    delivery = must(addMass(delivery, actor, { id: "mass-1", equipmentId: "eq-p101", state: "operating", value: "synthetic", unit: "kg", inputIds: ["duty-1"], freshness: "current" })).delivery;
    delivery = must(addLifting(delivery, actor, { id: "lift-1", equipmentId: "eq-p101", massId: "mass-1", engineered: false, freshness: "current" })).delivery;
    expect(delivery.lifting[0]?.engineered).toBe(false);
    delivery = must(attachMechanical(delivery, actor, "maintenance", { id: "mnt-1", equipmentId: "eq-p101", task: "withdrawal", interval: null })).delivery;
    delivery = must(attachMechanical(delivery, actor, "risks", { id: "risk-1", statement: "Synthetic access constraint", stage: "feasibility" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "interfaces", { id: "if-pipe", consumer: "piping", parameter: "nozzle identity", status: "proposed", inputIds: ["duty-1"], freshness: "current" })).delivery;
    delivery = must(progressMechanicalStage(delivery, actor, "feed", "feasibility gate")).delivery;

    delivery = must(addMechanicalBasis(delivery, actor, { id: "db-feed", title: "Controlled mechanical basis", statement: "Synthetic FEED basis", status: "accepted_for_stage" })).delivery;
    expect(delivery.basis.basisItems.find((item) => item.id === "db-feed")?.approvalGranted).toBe(false);
    delivery = must(attachMechanical(delivery, actor, "requirements", { id: "req-1", title: "Mechanical integrity", sourceId: "src-1", stage: "feed" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "interfaces", { id: "if-str", consumer: "structural", parameter: "operating mass", status: "accepted", inputIds: ["duty-1"], freshness: "current" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "interfaces", { id: "if-el", consumer: "electrical", parameter: "driver power", status: "accepted", inputIds: ["duty-1"], freshness: "current" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "interfaces", { id: "if-ic", consumer: "instrumentation_and_control", parameter: "vibration monitoring", status: "accepted", inputIds: ["duty-1"], freshness: "current" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "packages", { id: "pkg-1", name: "P-101 skid", included: ["pump"], excluded: ["power supply"] })).delivery;
    delivery = must(attachMechanical(delivery, actor, "deliverables", { id: "del-feed", title: "Mechanical FEED basis", stage: "feed", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: ["duty-1"], freshness: "current", ifc: false })).delivery;
    const frozen = must(freezeMechanical(delivery, actor, "feed_baseline", "base-feed"));
    delivery = frozen.delivery;
    const snapshot = delivery.baselines[0];
    delivery = must(progressMechanicalStage(delivery, actor, "detailed_engineering", "feed gate")).delivery;

    delivery = must(attachMechanical(delivery, actor, "calculations", { id: "cal-1", equipmentId: "eq-p101", purpose: "Imported reference", engine: "not_calculated", inputIds: ["duty-1"], freshness: "current" })).delivery;
    delivery = must(attachMechanical(delivery, actor, "nozzles", { id: "nz-1", equipmentId: "eq-p101", nozzleId: "N1", allowableLoad: null, inputIds: ["duty-1"], freshness: "current" })).delivery;
    delivery = must(addVendorData(delivery, actor, { id: "ven-1", equipmentId: "eq-p101", revision: 1, status: "received", checksum: "aaa", supersedesId: null, packageApproved: false })).delivery;
    delivery = must(addVendorData(delivery, actor, { id: "ven-2", equipmentId: "eq-p101", revision: 2, status: "received", checksum: "bbb", supersedesId: null, packageApproved: false })).delivery;
    expect(delivery.vendorData.find((item) => item.id === "ven-1")?.checksum).toBe("aaa");
    expect(delivery.vendorData.find((item) => item.id === "ven-1")?.status).toBe("superseded");
    delivery = must(acceptVendorData(delivery, actor, "ven-2")).delivery;
    expect(delivery.vendorData.find((item) => item.id === "ven-2")?.packageApproved).toBe(false);
    delivery = must(attachMechanical(delivery, actor, "deliverables", { id: "del-1", title: "Detailed mechanical package", stage: "detailed_engineering", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: ["duty-1"], freshness: "current", ifc: false })).delivery;
    expect(deliverableReadiness(delivery, "del-1").ifc).toBe(false);

    const revised = must(reviseUpstream(delivery, actor, "duty-1", "revised synthetic flow"));
    delivery = revised.delivery;
    expect(delivery.duties.find((item) => item.id === "duty-1")?.value).toBe("synthetic");
    expect(delivery.duties.find((item) => item.id === "duty-1")?.mechanicalModified).toBe(false);
    expect(delivery.datasheets[0]?.freshness).toBe("potentially_stale");
    expect(delivery.calculations[0]?.freshness).toBe("potentially_stale");
    expect(delivery.masses[0]?.freshness).toBe("potentially_stale");
    expect(delivery.lifting[0]?.freshness).toBe("potentially_stale");
    expect(delivery.interfaces.find((item) => item.id === "if-str")?.freshness).toBe("potentially_stale");
    expect(delivery.interfaces.find((item) => item.id === "if-el")?.freshness).toBe("potentially_stale");
    expect(delivery.interfaces.find((item) => item.id === "if-ic")?.freshness).toBe("potentially_stale");
    const vendorMass = must(recordVendorMassChange(delivery, actor, { id: "ven-3", equipmentId: "eq-p101", revision: 3, checksum: "ccc", massId: "mass-1" }));
    delivery = vendorMass.delivery;
    expect(delivery.masses[0]?.value).toBe("synthetic");
    expect(delivery.masses[0]?.unit).toBe("kg");
    expect(delivery.vendorData.find((item) => item.id === "ven-1")?.checksum).toBe("aaa");
    expect(delivery.interfaces.find((item) => item.id === "if-str")?.freshness).toBe("potentially_stale");
    expect(delivery.lifting[0]?.freshness).toBe("potentially_stale");
    expect(delivery.deliverables.every((item) => item.freshness === "potentially_stale")).toBe(true);
    expect(vendorMass.delivery.audits.some((item) => item.detail.massValueChanged === false)).toBe(true);
    expect(snapshot?.dutyIds).toEqual(["duty-1"]);
    expect(revised.delivery.audits.some((item) => item.detail.recalculated === false)).toBe(true);
    expect(mechanicalAdvisory(delivery)).toMatch(/does not invent equipment data/);
    expect(mechanicalHome(delivery).staleCount).toBeGreaterThan(0);
  });

  it("refuses unitless mass, invented nozzle loads, owner approval, and another workspace", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(unimplementedMechanicalCalculations().map((item) => item.id)).toEqual(expect.arrayContaining(["pressure_vessel_calculation", "pump_performance_calculation", "hosted_mechanical_calculation"]));
    let delivery = createMechanicalDelivery({
      id: "mech-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-mechanical-demo", projectTitle: "EOS Mechanical Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    }).delivery;
    expect(addMass(delivery, actor, { id: "mass-x", equipmentId: "eq", state: "operating", value: "10", unit: "", inputIds: [], freshness: "current" }).error).toMatch(/unit/);
    expect(attachMechanical(delivery, actor, "nozzles", { id: "nz-x", equipmentId: "eq", nozzleId: "N1", allowableLoad: null, inputIds: [], freshness: "current" }).error).toBeNull();
    expect(registerMechanicalTool(delivery, actor, { id: "tool-1", tool: "external-mechanical-tool", certifyExecution: true }).error).toMatch(/not certified/);
    delivery = must(addVendorData(delivery, actor, { id: "ven-1", equipmentId: "eq", revision: 1, status: "received", checksum: "aaa", supersedesId: null, packageApproved: false })).delivery;
    expect(acceptVendorData(delivery, { ...actor, actorRole: "ai" }, "ven-1").error).toMatch(/AI cannot approve vendor data/);
    expect(reviewMechanical(delivery, { ...actor, actorRole: "owner", canApprove: true }, { id: "rev-1", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(receiveProcessDuty(delivery, { ...actor, workspaceId: "workspace-b" }, { id: "duty-x", equipmentId: "eq", name: "Other", value: null, unit: null, ownedBy: "process", mechanicalModified: false, revision: 1, status: "current", synthetic: true }).error).toBe("cross_workspace_denied");
    expect(progressMechanicalStage(delivery, actor, "detailed_engineering", "skip").error).toMatch(/next stage|Skipping/i);
  });
});
