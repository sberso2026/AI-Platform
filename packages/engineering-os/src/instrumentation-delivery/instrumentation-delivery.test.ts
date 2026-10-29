import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  addAlarm,
  addCauseEffect,
  addCommissioning,
  addCyberRequirement,
  addDatasheet,
  addElectricalHandoff,
  addFat,
  addInstrument,
  addInstrumentationBasis,
  addLoop,
  addNarrative,
  addNetwork,
  addPackage,
  addRationalization,
  addSat,
  addSif,
  addSignal,
  addTrip,
  addVerification,
  attachInstrumentation,
  createInstrumentationDelivery,
  deliverableReadiness,
  DETERMINISTIC_SIL_VERIFICATION_ENGINE_READY,
  EXTERNAL_IC_CONFIGURATION_CERTIFIED,
  freezeInstrumentation,
  instrumentationAdvisory,
  instrumentationHome,
  modifyElectricalProtection,
  modifyMechanicalInput,
  modifyPipingInput,
  modifyProcessInput,
  progressInstrumentationStage,
  receiveElectricalInput,
  receiveMechanicalInput,
  receivePipingInput,
  receiveProcessInput,
  recordConflict,
  registerInstrumentationTool,
  reviewInstrumentation,
  revisePackageSignals,
  reviseProcessTrip,
  unimplementedInstrumentationCalculations,
} from "./engine";
import type { InstrumentationActor } from "./engine";

const actor: InstrumentationActor = {
  actorId: "gov-1",
  actorRole: "lifecycle_governor",
  at: "2026-10-28T20:00:00Z",
  workspaceId: "workspace-a",
  canAuthorizeLifecycleTransition: true,
  canApprove: true,
};

function must<T extends { error: string | null; delivery: unknown }>(result: T): T {
  expect(result.error).toBeNull();
  return result;
}

const linked = ["proc-1", "mech-1", "inst-1"];
const fixture = "SYNTHETIC_VALIDATION_FIXTURE" as const;

describe("EOS 2.10 instrumentation and control design delivery", () => {
  it("moves a synthetic control system through the lifecycle without determining SIL", () => {
    let delivery = must(createInstrumentationDelivery({
      id: "ic-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-ic-demo",
      projectTitle: "EOS Instrumentation and Control Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    })).delivery;
    expect(delivery.lifecycle.stage).toBe("not_classified");
    expect(delivery.audits[0]?.detail.legacyEnrolled).toBe(false);
    expect(delivery.audits[0]?.detail.instrumentMasterCreated).toBe(false);
    delivery = must(progressInstrumentationStage(delivery, actor, "concept", "classify concept")).delivery;
    delivery = must(addInstrumentationBasis(delivery, actor, { id: "db-1", title: "Control philosophy", statement: "Synthetic DCS versus package PLC", status: "draft" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "options", { id: "opt-a", title: "Central DCS", concept: "dcs_hardwired", stage: "concept", facts: ["IC-001"], assumptions: ["Hardwired package interface"], unresolved: ["I/O count"] })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "options", { id: "opt-b", title: "Package PLC", concept: "package_plc", stage: "concept", facts: ["IC-001"], assumptions: ["No vendor performance invented"], unresolved: ["Protocol"] })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "assumptions", { id: "as-1", statement: "SIL target is not yet supplied", stage: "concept", blocksNextStage: false })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "decisions", { id: "dec-1", statement: "Carry both control concepts", stage: "concept" })).delivery;
    delivery = must(progressInstrumentationStage(delivery, actor, "feasibility", "concept gate")).delivery;

    delivery = must(attachInstrumentation(delivery, actor, "systems", { id: "sys-bpcs", name: "Synthetic Feed Pump Control and Protection System IC-001", allocation: "bpcs", equipmentMasterCreated: false })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "systems", { id: "sys-sis", name: "IC-001 safety system", allocation: "sis", equipmentMasterCreated: false })).delivery;
    delivery = must(addInstrument(delivery, actor, { id: "inst-1", tag: "PT-101", instrumentFunction: "trip", range: null, unit: null, revision: 1, status: "current", provenance: fixture, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addSignal(delivery, actor, { id: "io-1", source: "PT-101", destination: "SIS", allocation: "sis", signalType: "digital", revision: 1, status: "current", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addLoop(delivery, actor, { id: "loop-1", tag: "PC-101", objective: "synthetic pressure control", tuningGenerated: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addPackage(delivery, actor, { id: "pkg-1", tag: "P-101", signalsInvented: false, revision: 1, status: "current", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addAlarm(delivery, actor, { id: "alm-1", tag: "PAH-101", setpoint: null, unit: null, approvalGranted: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addTrip(delivery, actor, { id: "trip-1", statement: "high-high pressure", setpoint: null, unit: null, sourceId: null, ownedBy: "process", icModified: false, revision: 1, status: "current", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "panels", { id: "pnl-1", name: "CP-001", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addNetwork(delivery, actor, { id: "net-1", name: "control network", protocol: "synthetic", secretStored: false })).delivery;
    delivery = must(addSif(delivery, actor, { id: "sif-1", silTarget: null, authorizedSourceId: null, allocatedToBpcs: false, verifiedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "risks", { id: "risk-1", statement: "Trip setpoint is not yet evidenced", stage: "feasibility" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "interfaces", { id: "if-open", consumer: "process", parameter: "trip intent", status: "proposed", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(progressInstrumentationStage(delivery, actor, "feed", "feasibility gate")).delivery;

    delivery = must(addInstrumentationBasis(delivery, actor, { id: "db-feed", title: "SIS philosophy", statement: "Synthetic controlled basis", status: "accepted_for_stage" })).delivery;
    expect(delivery.basis.basisItems.find((item) => item.id === "db-feed")?.approvalGranted).toBe(false);
    delivery = must(attachInstrumentation(delivery, actor, "requirements", { id: "req-1", title: "High-high trip", sourceId: "src-req-1", stage: "feed" })).delivery;
    delivery = must(addNarrative(delivery, actor, { id: "nar-1", title: "P-101 control narrative", status: "proposed", aiGenerated: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addCauseEffect(delivery, actor, { id: "ce-1", cause: "PT-101 high-high", effect: "stop P-101", approvalGranted: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addRationalization(delivery, actor, { id: "rat-1", alarmId: "alm-1", outcome: "candidate", approvalGranted: false })).delivery;
    delivery = must(addSif(delivery, actor, { id: "sif-feed", silTarget: "supplied", authorizedSourceId: "synthetic-lopa", allocatedToBpcs: false, verifiedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addVerification(delivery, actor, { id: "ver-1", sifId: "sif-feed", result: null, unit: null, provenance: "imported_reference", calculatedHere: false, certified: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addDatasheet(delivery, actor, { id: "ds-1", tag: "PT-101", range: null, unit: null, vendorInvented: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "fireGas", { id: "fg-1", tag: "GD-001", coverageModeled: false })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "valves", { id: "cv-1", tag: "PV-101", cvInvented: false })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "finalElements", { id: "fe-1", tag: "PV-101", failAction: "close" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "cabinets", { id: "cab-1", name: "SIS cabinet", systemAllocation: "sis" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "junctionBoxes", { id: "jb-1", name: "JB-001", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "marshalling", { id: "msh-1", cabinetId: "cab-1", signalId: "io-1" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "cables", { id: "cbl-1", kind: "signal", size: null, unit: null, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "cableSchedules", { id: "sch-1", cableId: "cbl-1", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "communications", { id: "com-1", protocol: "Modbus", interoperabilityClaimed: false })).delivery;
    delivery = must(addCyberRequirement(delivery, actor, { id: "cy-1", statement: "Segment the control network", accessOpened: false, firewallChanged: false })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "logicDocuments", { id: "log-1", title: "Cause and effect reference", generatedHere: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addFat(delivery, actor, { id: "fat-1", result: null, evidenceId: null, passedClaimed: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addSat(delivery, actor, { id: "sat-1", result: null, evidenceId: null, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(addCommissioning(delivery, actor, { id: "comx-1", test: "trip test", safetyClosed: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(receiveProcessInput(delivery, actor, { id: "proc-1", statement: "synthetic high-high trip", ownedBy: "process", icModified: false, revision: 1, status: "current" })).delivery;
    expect(modifyProcessInput(delivery).error).toMatch(/cannot modify a Process/);
    delivery = must(receiveMechanicalInput(delivery, actor, { id: "mech-1", tag: "P-101", signalList: "synthetic signals", ownedBy: "mechanical", icModified: false, revision: 1, status: "current" })).delivery;
    expect(modifyMechanicalInput(delivery).error).toMatch(/cannot modify a Mechanical/);
    delivery = must(receivePipingInput(delivery, actor, { id: "pip-1", line: "L-101", ownedBy: "piping", icModified: false })).delivery;
    expect(modifyPipingInput(delivery).error).toMatch(/cannot modify a Piping/);
    delivery = must(receiveElectricalInput(delivery, actor, { id: "elec-1", supply: "UPS", ownedBy: "electrical", protectionModified: false })).delivery;
    expect(modifyElectricalProtection(delivery).error).toMatch(/cannot modify an Electrical/);
    delivery = must(addElectricalHandoff(delivery, actor, { id: "ho-elec", load: "synthetic", unit: "kW", protectionModified: false, inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "structuralInterfaces", { id: "ho-str", requirement: "panel mass", structuralCapacityClaimed: false })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "civilInterfaces", { id: "ho-civ", requirement: "instrument trench", civilModified: false })).delivery;
    delivery = must(recordConflict(delivery, actor, { id: "cf-1", subjectId: "proc-1", statement: "Trip intent remains owned by Process" })).delivery;
    expect(delivery.conflicts[0]?.processModified).toBe(false);
    delivery = must(registerInstrumentationTool(delivery, actor, { id: "tool-1", tool: "instrument database", version: "metadata" })).delivery;
    expect(delivery.models[0]?.executionCertified).toBe(false);
    delivery = must(attachInstrumentation(delivery, actor, "interfaces", { id: "if-proc", consumer: "process", parameter: "trip intent", status: "accepted", inputIds: linked, freshness: "current" })).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "deliverables", { id: "del-feed", title: "I&C FEED report", stage: "feed", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: linked, freshness: "current", ifc: false })).delivery;
    delivery = must(freezeInstrumentation(delivery, actor, "feed_baseline", "base-feed")).delivery;
    const snapshot = delivery.baselines[0];
    delivery = must(progressInstrumentationStage(delivery, actor, "detailed_engineering", "feed baseline")).delivery;
    delivery = must(attachInstrumentation(delivery, actor, "deliverables", { id: "del-1", title: "Detailed I&C report", stage: "detailed_engineering", revision: 1, basisLinked: true, requirementLinked: true, reviewId: null, inputIds: linked, freshness: "current", ifc: false })).delivery;
    expect(deliverableReadiness(delivery, "del-1").ifc).toBe(false);

    const revised = must(reviseProcessTrip(delivery, actor, "proc-1", "revised synthetic high-high trip"));
    delivery = revised.delivery;
    expect(delivery.processInputs.find((item) => item.id === "proc-1")?.statement).toBe("synthetic high-high trip");
    expect(delivery.processInputs.find((item) => item.id === "proc-1")?.icModified).toBe(false);
    expect(delivery.trips[0]?.freshness).toBe("potentially_stale");
    expect(delivery.datasheets[0]?.freshness).toBe("potentially_stale");
    expect(delivery.signals[0]?.freshness).toBe("potentially_stale");
    expect(delivery.narratives[0]?.freshness).toBe("potentially_stale");
    expect(delivery.causeEffect[0]?.freshness).toBe("potentially_stale");
    expect(delivery.sifs.find((item) => item.id === "sif-feed")?.freshness).toBe("potentially_stale");
    expect(delivery.logicDocuments[0]?.freshness).toBe("potentially_stale");
    expect(delivery.fat[0]?.freshness).toBe("potentially_stale");
    expect(delivery.sat[0]?.freshness).toBe("potentially_stale");
    expect(delivery.commissioning[0]?.freshness).toBe("potentially_stale");
    expect(delivery.deliverables.find((item) => item.id === "del-1")?.freshness).toBe("potentially_stale");
    const packaged = must(revisePackageSignals(delivery, actor, "mech-1", "revised synthetic signals"));
    delivery = packaged.delivery;
    expect(delivery.mechanicalInputs.find((item) => item.id === "mech-1")?.signalList).toBe("synthetic signals");
    expect(delivery.mechanicalInputs.find((item) => item.id === "mech-1")?.icModified).toBe(false);
    expect(delivery.packages[0]?.freshness).toBe("potentially_stale");
    expect(delivery.cableSchedules[0]?.freshness).toBe("potentially_stale");
    expect(snapshot?.instrumentIds).toEqual(["inst-1"]);
    expect(snapshot?.sifIds).toEqual(["sif-1", "sif-feed"]);
    expect(revised.delivery.audits.some((item) => item.detail.recalculated === false)).toBe(true);
    expect(instrumentationAdvisory(delivery)).toMatch(/does not determine a SIL target/);
    expect(instrumentationHome(delivery).staleCount).toBeGreaterThan(0);
    expect(DETERMINISTIC_SIL_VERIFICATION_ENGINE_READY).toBe(false);
    expect(EXTERNAL_IC_CONFIGURATION_CERTIFIED).toBe(false);
  });

  it("refuses invented setpoints, SIL determination, secrets, and another workspace", () => {
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "engine.ts"), "utf8");
    expect(source).not.toContain("system-evaluation");
    expect(source).not.toContain("recordIacObjectIdentity");
    expect(unimplementedInstrumentationCalculations().map((item) => item.id)).toEqual(expect.arrayContaining(["sil_verification_calculation", "instrument_sizing", "logic_generation", "hosted_ic_calculation"]));
    const delivery = createInstrumentationDelivery({
      id: "ic-2", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "eos-ic-demo", projectTitle: "EOS Instrumentation and Control Design Delivery Demo", actorId: actor.actorId, at: actor.at,
    }).delivery;
    expect(addInstrument(delivery, actor, { id: "inst-x", tag: "PT", instrumentFunction: "indication", range: "10", unit: "", revision: 1, status: "current", provenance: fixture, inputIds: [], freshness: "current" }).error).toMatch(/unit/);
    expect(addInstrument(delivery, actor, { id: "inst-y", tag: "PT", instrumentFunction: "indication", range: null, unit: null, revision: 1, status: "current", provenance: fixture, inputIds: [], freshness: "current", inventRange: true }).error).toMatch(/not invented/);
    expect(addSignal(delivery, actor, { id: "io-x", source: "", destination: "DCS", allocation: "bpcs", signalType: "analog", revision: 1, status: "current", inputIds: [], freshness: "current" }).error).toMatch(/source, destination/);
    expect(addSignal(delivery, actor, { id: "io-y", source: "PT", destination: "DCS", allocation: "bpcs", signalType: "safety", revision: 1, status: "current", inputIds: [], freshness: "current" }).error).toMatch(/not allocated to the BPCS/);
    expect(addLoop(delivery, actor, { id: "loop-x", tag: "LC", objective: "level", tuningGenerated: false, inputIds: [], freshness: "current", generateTuning: true }).error).toMatch(/not generated/);
    expect(addAlarm(delivery, actor, { id: "alm-x", tag: "LAH", setpoint: null, unit: null, approvalGranted: false, inputIds: [], freshness: "current", inventSetpoint: true }).error).toMatch(/not invented/);
    expect(addAlarm(delivery, { ...actor, actorRole: "ai" }, { id: "alm-ai", tag: "LAH", setpoint: null, unit: null, approvalGranted: false, inputIds: [], freshness: "current" }).error).toMatch(/cannot approve an alarm/);
    expect(addTrip(delivery, actor, { id: "trip-x", statement: "high", setpoint: "1", unit: "kPa", sourceId: null, ownedBy: "process", icModified: false, revision: 1, status: "current", inputIds: [], freshness: "current" }).error).toMatch(/authorized source/);
    expect(addSif(delivery, actor, { id: "sif-x", silTarget: "SIL 2", authorizedSourceId: null, allocatedToBpcs: false, verifiedHere: false, inputIds: [], freshness: "current", determineSil: true }).error).toMatch(/not determined/);
    expect(addSif(delivery, { ...actor, actorRole: "ai" }, { id: "sif-ai", silTarget: "SIL 1", authorizedSourceId: "study", allocatedToBpcs: false, verifiedHere: false, inputIds: [], freshness: "current" }).error).toMatch(/cannot determine a SIL/);
    expect(addVerification(delivery, actor, { id: "ver-x", sifId: "sif-1", result: "1", unit: "PFD", provenance: "imported_reference", calculatedHere: false, certified: false, inputIds: [], freshness: "current", calculate: true }).error).toMatch(/not calculated/);
    expect(addCauseEffect(delivery, { ...actor, actorRole: "ai" }, { id: "ce-x", cause: "high", effect: "stop", approvalGranted: false, inputIds: [], freshness: "current" }).error).toMatch(/cannot approve cause-and-effect/);
    expect(addRationalization(delivery, { ...actor, actorRole: "ai" }, { id: "rat-x", alarmId: "alm-1", outcome: "keep", approvalGranted: false }).error).toMatch(/cannot approve alarm rationalization/);
    expect(addNarrative(delivery, { ...actor, actorRole: "ai" }, { id: "nar-x", title: "draft", status: "accepted", aiGenerated: true, inputIds: [], freshness: "current" }).error).toMatch(/stays proposed/);
    expect(addPackage(delivery, actor, { id: "pkg-x", tag: "P-101", signalsInvented: false, revision: 1, status: "current", inputIds: [], freshness: "current", inventSignals: true }).error).toMatch(/not invented/);
    expect(addNetwork(delivery, actor, { id: "net-x", name: "net", protocol: "synthetic", secretStored: false, password: "not-a-real-secret" }).error).toMatch(/not stored/);
    expect(addCyberRequirement(delivery, actor, { id: "cy-x", statement: "open", accessOpened: false, firewallChanged: false, openAccess: true }).error).toMatch(/cannot change OT access/);
    expect(addFat(delivery, actor, { id: "fat-x", result: "passed", evidenceId: null, passedClaimed: false, inputIds: [], freshness: "current" }).error).toMatch(/not passed without evidence/);
    expect(addCommissioning(delivery, actor, { id: "cx", test: "trip", safetyClosed: false, inputIds: [], freshness: "current", closeSafetyTest: true }).error).toMatch(/not closed automatically/);
    expect(registerInstrumentationTool(delivery, actor, { id: "tool-x", tool: "DCS", version: "1", certifyExecution: true }).error).toMatch(/not certified/);
    expect(registerInstrumentationTool(delivery, actor, { id: "tool-y", tool: "PLC", version: "1", bidirectional: true }).error).toMatch(/not implemented/);
    expect(reviewInstrumentation(delivery, { ...actor, actorRole: "owner", canApprove: true }, { id: "rev-1", subjectId: "del-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(reviewInstrumentation(delivery, { ...actor, actorRole: "ai", canApprove: true }, { id: "rev-2", subjectId: "sif-1", revision: 1, outcome: "approved" }).error).toMatch(/cannot approve/);
    expect(addInstrument(delivery, { ...actor, workspaceId: "workspace-b" }, { id: "inst-b", tag: "PT", instrumentFunction: "indication", range: null, unit: null, revision: 1, status: "current", provenance: fixture, inputIds: [], freshness: "current" }).error).toBe("cross_workspace_denied");
    expect(progressInstrumentationStage(delivery, actor, "detailed_engineering", "skip").error).toMatch(/next stage/i);
  });
});
