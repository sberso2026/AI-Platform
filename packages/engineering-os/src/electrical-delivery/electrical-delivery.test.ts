import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addBattery,
  addCivilHandoff,
  addEarthing,
  addElectricalBasis,
  addEmergencyPower,
  addGenerator,
  addHazardousArea,
  addIcInterface,
  addLoad,
  addPowerBalance,
  addProtection,
  addSource,
  addStructuralHandoff,
  addStudy,
  addSwitchgear,
  addTransformer,
  addUps,
  attachElectrical,
  createElectricalDelivery,
  deliverableReadiness,
  EASYPOWER_ADAPTER_STATUS,
  electricalAdvisory,
  electricalHome,
  ETAP_ADAPTER_STATUS,
  EXTERNAL_ELECTRICAL_ANALYSIS_CERTIFIED,
  freezeElectrical,
  modifyCivilRoute,
  modifyMechanicalInput,
  modifyProcessInput,
  POWERFACTORY_ADAPTER_STATUS,
  progressElectricalStage,
  receiveCivilRoute,
  receiveMechanicalInput,
  receiveProcessInput,
  recordConflict,
  registerElectricalTool,
  reviewElectrical,
  reviseCivilRoute,
  reviseMechanicalPower,
  SKM_ADAPTER_STATUS,
  unimplementedElectricalCalculations,
} from "./engine";
import type { ElectricalActor } from "./engine";

const actor: ElectricalActor = {
  actorId: "gov-1",
  actorRole: "lifecycle_governor",
  at: "2026-10-28T19:00:00Z",
  workspaceId: "workspace-a",
  canAuthorizeLifecycleTransition: true,
  canApprove: true,
};

function must<T extends { error: string | null; delivery: unknown }>(result: T): T {
  expect(result.error).toBeNull();
  return result;
}

const linked = ["mech-1", "load-1", "route-1"];
const fixture = "SYNTHETIC_VALIDATION_FIXTURE" as const;

describe("EOS 2.9 electrical design delivery", () => {
  it("moves a synthetic electrical system through the lifecycle without calculating study results", () => {
    let delivery = must(createElectricalDelivery({
      id: "elec-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-electrical-demo",
      projectTitle: "EOS Electrical Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    })).delivery;
    expect(delivery.lifecycle.stage).toBe("not_classified");
    expect(delivery.audits[0]?.detail.legacyEnrolled).toBe(false);
    expect(delivery.audits[0]?.detail.equipmentMasterCreated).toBe(false);
    delivery = must(progressElectricalStage(delivery, actor, "concept", "classify concept")).delivery;
    delivery = must(addElectricalBasis(delivery, actor, { id: "db-1", title: "Voltage philosophy", statement: "Synthetic radial versus dual supply", status: "draft" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "options", { id: "opt-a", title: "Single substation", concept: "radial", stage: "concept", facts: ["ELEC-001"], assumptions: ["Grid supply is available"], unresolved: ["Fault level"] })).delivery;
    delivery = must(attachElectrical(delivery, actor, "options", { id: "opt-b", title: "Dual substation", concept: "dual", stage: "concept", facts: ["ELEC-001"], assumptions: ["No capacity invented"], unresolved: ["Second incomer"] })).delivery;
    delivery = must(attachElectrical(delivery, actor, "assumptions", { id: "as-1", statement: "Emergency classification is preliminary", stage: "concept", blocksNextStage: false })).delivery;
    delivery = must(attachElectrical(delivery, actor, "decisions", { id: "dec-1", statement: "Carry both supply concepts", stage: "concept" })).delivery;
    delivery = must(progressElectricalStage(delivery, actor, "feasibility", "concept gate")).delivery;

    delivery = must(attachElectrical(delivery, actor, "systems", { id: "sys-1", name: "Synthetic Process Facility Electrical System ELEC-001", equipmentMasterCreated: false })).delivery;
    delivery = must(attachElectrical(delivery, actor, "consumers", { id: "con-pump", tag: "P-101", kind: "motor" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "consumers", { id: "con-pkg", tag: "PKG-001", kind: "package" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "consumers", { id: "con-light", tag: "LTG-001", kind: "lighting" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "consumers", { id: "con-ups", tag: "UPS-001", kind: "ups" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "consumers", { id: "con-em", tag: "EM-001", kind: "emergency" })).delivery;
    delivery = must(addLoad(delivery, actor, { id: "load-1", tag: "P-101", description: "Synthetic Feed Pump", category: "motor", ratedPower: "synthetic", unit: "kW", sourceDiscipline: "mechanical", revision: 1, status: "current", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "operatingCases", { id: "case-1", name: "normal operation", stage: "feasibility" })).delivery;
    delivery = must(addPowerBalance(delivery, actor, { id: "bal-1", demand: "synthetic", unit: "kW", provenance: "metadata", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addSource(delivery, actor, { id: "src-1", kind: "grid", capacity: "synthetic", unit: "kVA", adequacyClaimed: false })).delivery;
    delivery = must(addGenerator(delivery, actor, { id: "gen-1", capacity: null, unit: null, adequacyClaimed: false })).delivery;
    delivery = must(attachElectrical(delivery, actor, "voltageLevels", { id: "v-1", nominal: "synthetic", unit: "V", frequency: "50", frequencyUnit: "Hz" })).delivery;
    delivery = must(addTransformer(delivery, actor, { id: "tx-1", rating: "synthetic", unit: "kVA", impedance: null, adequacyClaimed: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addSwitchgear(delivery, actor, { id: "swg-1", name: "SWG-001", faultRating: null, unit: null, certified: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "mccs", { id: "mcc-1", name: "MCC-001", certified: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "slds", { id: "sld-1", revision: 1, status: "current", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "cables", { id: "cab-1", size: null, unit: null, provenance: fixture, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addUps(delivery, actor, { id: "ups-1", autonomy: null, unit: null, calculatedHere: false })).delivery;
    delivery = must(addBattery(delivery, actor, { id: "bat-1", capacity: null, unit: null, calculatedHere: false })).delivery;
    delivery = must(addEmergencyPower(delivery, actor, { id: "em-1", source: "standby generator", calculatedHere: false })).delivery;
    delivery = must(attachElectrical(delivery, actor, "dcSystems", { id: "dc-1", nominal: "synthetic", unit: "V" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "risks", { id: "risk-1", statement: "Fault level is not yet evidenced", stage: "feasibility" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "interfaces", { id: "if-open", consumer: "mechanical", parameter: "motor duty", status: "proposed", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(progressElectricalStage(delivery, actor, "feed", "feasibility gate")).delivery;

    delivery = must(addElectricalBasis(delivery, actor, { id: "db-feed", title: "Distribution philosophy", statement: "Synthetic controlled basis", status: "accepted_for_stage" })).delivery;
    expect(delivery.basis.basisItems.find((item) => item.id === "db-feed")?.approvalGranted).toBe(false);
    delivery = must(attachElectrical(delivery, actor, "requirements", { id: "req-1", title: "Supply continuity", sourceId: "src-req-1", stage: "feed" })).delivery;
    delivery = must(registerElectricalTool(delivery, actor, { id: "model-1", tool: "ETAP", version: "metadata", loadListRevision: 1, inputChecksum: "synthetic" })).delivery;
    expect(delivery.models[0]?.executionCertified).toBe(false);
    delivery = must(addStudy(delivery, actor, { id: "lf-1", kind: "load_flow", value: null, unit: null, provenance: fixture, calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "sc-1", kind: "short_circuit", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "coord-1", kind: "coordination", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "ms-1", kind: "motor_starting", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "vd-1", kind: "voltage_drop", value: "synthetic", unit: "V", provenance: fixture, calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "cs-1", kind: "cable_sizing", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "harm-1", kind: "harmonic", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "af-1", kind: "arc_flash", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "ltg-1", kind: "lighting", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: [], freshness: "current" })).delivery;
    delivery = must(addStudy(delivery, actor, { id: "lp-1", kind: "lightning", value: null, unit: null, provenance: "metadata", calculatedHere: false, inputIds: [], freshness: "current" })).delivery;
    delivery = must(addProtection(delivery, actor, { id: "prot-1", device: "incomer", setting: null, unit: null, approvalGranted: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addEarthing(delivery, actor, { id: "eth-1", resistivitySource: "supplied", resistance: null, unit: null, calculatedHere: false, inferredFromGeotechnics: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addHazardousArea(delivery, actor, { id: "haz-1", classification: "supplied zone", sourceDiscipline: "process_safety", createdByElectrical: false })).delivery;
    delivery = must(receiveProcessInput(delivery, actor, { id: "proc-1", scenario: "normal operation", ownedBy: "process", electricalModified: false })).delivery;
    expect(modifyProcessInput(delivery).error).toMatch(/cannot modify a Process/);
    delivery = must(receiveMechanicalInput(delivery, actor, { id: "mech-1", tag: "P-101", ratedPower: "synthetic", unit: "kW", duty: "continuous", ownedBy: "mechanical", electricalModified: false, revision: 1, status: "current" })).delivery;
    expect(modifyMechanicalInput(delivery).error).toMatch(/cannot modify a Mechanical/);
    delivery = must(receiveCivilRoute(delivery, actor, { id: "route-1", length: "synthetic", unit: "m", ownedBy: "civil", electricalModified: false, revision: 1, status: "current" })).delivery;
    expect(modifyCivilRoute(delivery).error).toMatch(/cannot modify a Civil/);
    delivery = must(attachElectrical(delivery, actor, "rooms", { id: "room-1", name: "Substation 1", purpose: "synthetic electrical room" })).delivery;
    delivery = must(addCivilHandoff(delivery, actor, { id: "ho-civ", requirement: "duct bank", value: "synthetic", unit: "m", civilModified: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addStructuralHandoff(delivery, actor, { id: "ho-str", equipment: "TX-001", mass: "synthetic", unit: "kg", structuralCapacityClaimed: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addIcInterface(delivery, actor, { id: "ic-1", topic: "UPS-backed control power", fullDesignImplemented: false })).delivery;
    delivery = must(attachElectrical(delivery, actor, "cableSchedules", { id: "sch-1", cableId: "cab-1", revision: 1, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(recordConflict(delivery, actor, { id: "cf-1", subjectId: "mech-1", statement: "Motor power remains owned by Mechanical" })).delivery;
    expect(delivery.conflicts[0]?.mechanicalModified).toBe(false);
    delivery = must(attachElectrical(delivery, actor, "interfaces", { id: "if-mech", consumer: "mechanical", parameter: "P-101 power", status: "accepted", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachElectrical(delivery, actor, "deliverables", { id: "del-feed", title: "Electrical FEED report", stage: "feed", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: linked, freshness: "current", ifc: false })).delivery;
    delivery = must(freezeElectrical(delivery, actor, "feed_baseline", "base-feed")).delivery;
    const snapshot = delivery.baselines[0];
    delivery = must(progressElectricalStage(delivery, actor, "detailed_engineering", "feed baseline")).delivery;
    delivery = must(attachElectrical(delivery, actor, "deliverables", { id: "del-1", title: "Detailed electrical report", stage: "detailed_engineering", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: linked, freshness: "current", ifc: false })).delivery;
    expect(deliverableReadiness(delivery, "del-1").ifc).toBe(false);

    const revised = must(reviseMechanicalPower(delivery, actor, "mech-1", "revised synthetic power"));
    delivery = revised.delivery;
    expect(delivery.mechanicalInputs.find((item) => item.id === "mech-1")?.ratedPower).toBe("synthetic");
    expect(delivery.mechanicalInputs.find((item) => item.id === "mech-1")?.electricalModified).toBe(false);
    expect(delivery.loads.find((item) => item.id === "load-1")?.freshness).toBe("potentially_stale");
    expect(delivery.powerBalances[0]?.freshness).toBe("potentially_stale");
    expect(delivery.transformers[0]?.freshness).toBe("potentially_stale");
    expect(delivery.switchgear[0]?.freshness).toBe("potentially_stale");
    expect(delivery.studies.find((item) => item.id === "lf-1")?.freshness).toBe("potentially_stale");
    expect(delivery.studies.find((item) => item.id === "sc-1")?.freshness).toBe("potentially_stale");
    expect(delivery.protection[0]?.freshness).toBe("potentially_stale");
    expect(delivery.studies.find((item) => item.id === "ms-1")?.freshness).toBe("potentially_stale");
    expect(delivery.studies.find((item) => item.id === "cs-1")?.freshness).toBe("potentially_stale");
    expect(delivery.studies.find((item) => item.id === "vd-1")?.freshness).toBe("potentially_stale");
    expect(delivery.slds[0]?.freshness).toBe("potentially_stale");
    expect(delivery.cableSchedules[0]?.freshness).toBe("potentially_stale");
    expect(delivery.deliverables.find((item) => item.id === "del-1")?.freshness).toBe("potentially_stale");
    const routed = must(reviseCivilRoute(delivery, actor, "route-1", "revised synthetic length"));
    delivery = routed.delivery;
    expect(delivery.civilRoutes.find((item) => item.id === "route-1")?.length).toBe("synthetic");
    expect(delivery.civilRoutes.find((item) => item.id === "route-1")?.electricalModified).toBe(false);
    expect(delivery.cables[0]?.freshness).toBe("potentially_stale");
    expect(snapshot?.loadIds).toEqual(["load-1"]);
    expect(snapshot?.modelIds).toEqual(["model-1"]);
    expect(revised.delivery.audits.some((item) => item.detail.recalculated === false)).toBe(true);
    expect(electricalAdvisory(delivery)).toMatch(/does not invent electrical study results/);
    expect(electricalHome(delivery).staleStudyCount).toBeGreaterThan(0);
    expect(ETAP_ADAPTER_STATUS).toBe("METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED");
    expect(POWERFACTORY_ADAPTER_STATUS).toBe("METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED");
    expect(SKM_ADAPTER_STATUS).toBe("METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED");
    expect(EASYPOWER_ADAPTER_STATUS).toBe("METADATA_OR_IMPORT_ONLY_NOT_CERTIFIED");
    expect(EXTERNAL_ELECTRICAL_ANALYSIS_CERTIFIED).toBe(false);
  });

  it("refuses invented study results, certified tools, unauthorized approval, and another workspace", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(source).not.toContain("recordElectricalObjectIdentity");
    expect(unimplementedElectricalCalculations().map((item) => item.id)).toEqual(expect.arrayContaining(["load_flow_calculation", "short_circuit_calculation", "cable_sizing_calculation", "hosted_electrical_calculation"]));
    let delivery = createElectricalDelivery({
      id: "elec-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-electrical-demo", projectTitle: "EOS Electrical Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    }).delivery;
    expect(addLoad(delivery, actor, { id: "load-x", tag: "P-101", description: "pump", category: "motor", ratedPower: "10", unit: "", sourceDiscipline: "mechanical", revision: 1, status: "current", inputIds: [], freshness: "current" }).error).toMatch(/unit/);
    expect(addStudy(delivery, actor, { id: "lf-x", kind: "load_flow", value: "1", unit: "V", provenance: "imported_reference", calculatedHere: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addStudy(delivery, actor, { id: "sc-x", kind: "short_circuit", value: "1", unit: "kA", provenance: "imported_reference", calculatedHere: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addStudy(delivery, actor, { id: "cs-x", kind: "cable_sizing", value: "1", unit: "mm2", provenance: "imported_reference", calculatedHere: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addStudy(delivery, actor, { id: "vd-x", kind: "voltage_drop", value: "1", unit: "V", provenance: "imported_reference", calculatedHere: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addStudy(delivery, actor, { id: "ms-x", kind: "motor_starting", value: "1", unit: "percent", provenance: "imported_reference", calculatedHere: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addStudy(delivery, actor, { id: "af-x", kind: "arc_flash", value: "1", unit: "cal/cm2", provenance: "imported_reference", calculatedHere: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addEarthing(delivery, actor, { id: "eth-x", resistivitySource: null, resistance: "1", unit: "ohm", calculatedHere: false, inferredFromGeotechnics: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addEarthing(delivery, actor, { id: "eth-y", resistivitySource: null, resistance: null, unit: null, calculatedHere: false, inferredFromGeotechnics: false, inputIds: [], freshness: "current", inferResistivity: true }).error).toMatch(/not inferred/);
    expect(addBattery(delivery, actor, { id: "bat-x", capacity: "1", unit: "Ah", calculatedHere: false, calculate: true }).error).toMatch(/not calculated/);
    expect(addTransformer(delivery, actor, { id: "tx-x", rating: "1", unit: "kVA", impedance: null, adequacyClaimed: false, inputIds: [], freshness: "current", adequate: true }).error).toMatch(/not calculated/);
    expect(addGenerator(delivery, actor, { id: "gen-x", capacity: "1", unit: "kW", adequacyClaimed: false, adequate: true }).error).toMatch(/not calculated/);
    expect(addProtection(delivery, { ...actor, actorRole: "ai" }, { id: "prot-x", device: "breaker", setting: "1", unit: "A", approvalGranted: false, inputIds: [], freshness: "current" }).error).toMatch(/cannot approve a protection setting/);
    expect(addHazardousArea(delivery, actor, { id: "haz-x", classification: "zone", sourceDiscipline: "electrical", createdByElectrical: false }).error).toMatch(/does not create process hazardous-area/);
    expect(addIcInterface(delivery, actor, { id: "ic-x", topic: "trip", fullDesignImplemented: false, implementDesign: true }).error).toMatch(/not implemented/);
    expect(registerElectricalTool(delivery, actor, { id: "tool-1", tool: "ETAP", version: "1", loadListRevision: 1, inputChecksum: "x", certifyExecution: true }).error).toMatch(/not certified/);
    expect(registerElectricalTool(delivery, actor, { id: "tool-2", tool: "PowerFactory", version: "1", loadListRevision: 1, inputChecksum: "x", bidirectional: true }).error).toMatch(/not implemented/);
    expect(reviewElectrical(delivery, { ...actor, actorRole: "owner", canApprove: true }, { id: "rev-1", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(reviewElectrical(delivery, { ...actor, actorRole: "ai", canApprove: true }, { id: "rev-2", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(addLoad(delivery, { ...actor, workspaceId: "workspace-b" }, { id: "load-b", tag: "P-101", description: "pump", category: "motor", ratedPower: "1", unit: "kW", sourceDiscipline: "mechanical", revision: 1, status: "current", inputIds: [], freshness: "current" }).error).toBe("cross_workspace_denied");
    expect(progressElectricalStage(delivery, actor, "detailed_engineering", "skip").error).toMatch(/next stage/i);
  });
});
