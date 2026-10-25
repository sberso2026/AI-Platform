import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT as ARCHITECTURE_INTERFACE_COUNT, D7_D6_INTERFACE_SUBJECTS, D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { createD7R5Store, recordElectricalCalculationEvidence } from "./calculation-evidence";
import {
  D7_D6_INTERFACE_COMPATIBLE_WITH_EXISTING_D6_R8_CONTRACT,
  D7_D8_HANDOFF_CONTRACT_IMPLEMENTED,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D7_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D7_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_APPROVED,
  D7_HANDOFF_CONTENT_EQUALS_COUNTERPART_ENGINEERING_TRUTH,
  D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN,
  D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION,
  D7_R8_INFERRED_COUNTERPART_ALLOWED,
  D7_R8_R7_CHANGE_INTEGRATION_IMPLEMENTED,
  D7_R8_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED,
  D7_R9_CANONICAL_PHASE,
  D7_R9_STARTED,
  D7_REQUIREMENT_EQUALS_COUNTERPART_ADOPTED_REQUIREMENT,
  D7_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  adoptElectricalHandoffAsCounterpartDesign,
  createD7R8Store,
  currentElectricalInterfaceHandoffs,
  markElectricalInterfaceFromChange,
  mutateElectricalInterfaceCounterpart,
  reasonAcrossElectricalDisciplines,
  recordElectricalInterfaceHandoff,
  repointElectricalInterface,
} from "./discipline-interfaces-handoffs";
import { createD7R4Store, recordElectricalFeederContext } from "./feeder-cable-rating-context";
import { D7_CONTEXT_AUTHORITY, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import { createD7R3Store, recordElectricalLoadContext } from "./load-consumer-equipment-context";
import { createD7R6Store, recordElectricalProtectionDeviceContext, recordElectricalProtectionSetting } from "./protection-grounding-hazardous-area-context";
import {
  D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT as R7_INTERFACE_COUNT,
  D7_R8_STARTED,
  D7_RUNTIME_COUNT as R7_RUNTIME_COUNT,
  createD7R7Store,
  recordElectricalChange,
  recordElectricalReassessment,
  recordElectricalSourceRequirement,
} from "./requirements-assumptions-change";
import { createD7R2Store, recordElectricalSystemContext } from "./system-source-distribution-context";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R8 discipline interfaces and handoffs", () => {
  it("records explicit Electrical handoffs without transferring counterpart authority", () => {
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_INTERFACE_COUNT).toBe(0);
    expect(R7_RUNTIME_COUNT).toBe(7);
    expect(R7_INTERFACE_COUNT).toBe(0);
    expect(D7_RUNTIME_COUNT).toBe(8);
    expect(D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT).toBe(1);
    expect(D7_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D7_R8_STARTED).toBe(false);
    expect(D7_R9_STARTED).toBe(false);
    expect(D7_R9_CANONICAL_PHASE).toBe("EOS-D7-R9-REVIEW-AND-VALIDATION-GOVERNANCE");
    expect(D7_D6_INTERFACE_COMPATIBLE_WITH_EXISTING_D6_R8_CONTRACT).toBe(true);
    expect(D7_D6_INTERFACE_SUBJECTS).toEqual(["MOTOR_OR_LOAD_PROCESS_REQUIREMENT", "POWER_REQUIREMENT_CONTEXT", "UTILITY_POWER_PROCESS_CONTEXT"]);
    expect(D7_D8_HANDOFF_CONTRACT_IMPLEMENTED).toBe(true);
    expect(D7_D8_RUNTIME_INTEGRATION_COUNT).toBe(0);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D7_HANDOFF_CONTENT_EQUALS_COUNTERPART_ENGINEERING_TRUTH).toBe(false);
    expect(D7_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_APPROVED).toBe(false);
    expect(D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN).toBe(false);
    expect(D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION).toBe(false);
    expect(D7_REQUIREMENT_EQUALS_COUNTERPART_ADOPTED_REQUIREMENT).toBe(false);
    expect(D7_R8_INFERRED_COUNTERPART_ALLOWED).toBe(false);
    expect(D7_R8_R7_CHANGE_INTEGRATION_IMPLEMENTED).toBe(true);
    expect(D7_R8_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED).toBe(true);

    const r1 = createD7R1Store();
    const who = actor();
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const load = recordElectricalObjectIdentity(r1, who, { objectId: "load-1", contextId: "ctx-1", objectType: "ELECTRICAL_LOAD", citedLifecycleStage: "FEED", provenanceRef: "prov-load-1", sourceBasisRef: "basis-load-1" });
    const system = recordElectricalObjectIdentity(r1, who, { objectId: "sys-1", contextId: "ctx-1", objectType: "ELECTRICAL_SYSTEM", citedLifecycleStage: "FEED", provenanceRef: "prov-sys-1", sourceBasisRef: "basis-sys-1" });
    const feeder = recordElectricalObjectIdentity(r1, who, { objectId: "feeder-1", contextId: "ctx-1", objectType: "ELECTRICAL_FEEDER", citedLifecycleStage: "FEED", provenanceRef: "prov-feeder-1", sourceBasisRef: "basis-feeder-1" });
    const deviceObject = recordElectricalObjectIdentity(r1, who, { objectId: "device-1", contextId: "ctx-1", objectType: "ELECTRICAL_PROTECTION_CONTEXT", citedLifecycleStage: "FEED", provenanceRef: "prov-device-1", sourceBasisRef: "basis-device-1" });
    const evidenceObject = recordElectricalObjectIdentity(r1, who, { objectId: "evidence-1", contextId: "ctx-1", objectType: "ELECTRICAL_CALCULATION_EVIDENCE", citedLifecycleStage: "FEED", provenanceRef: "prov-evidence-1", sourceBasisRef: "basis-evidence-1" });
    const identityFingerprint = load.fingerprint;
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const r3 = createD7R3Store(r1, r2);
    const suppliedLoad = recordElectricalLoadContext(r3, who, { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation", loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const r4 = createD7R4Store(r1, r2, r3);
    const feederContext = recordElectricalFeederContext(r4, who, { ...bound(feeder.objectId, feeder.fingerprint), feederRecordId: "feeder-rec", feederRole: "DISTRIBUTION_FEEDER" });
    const r5 = createD7R5Store(r1, r4);
    const protectionEvidence = recordElectricalCalculationEvidence(r5, who, { contextId: "ctx-1", objectId: evidenceObject.objectId, objectRevisionFingerprint: evidenceObject.fingerprint, subjectObjectId: deviceObject.objectId, subjectRevisionFingerprint: deviceObject.fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-evidence", sourceBasisRef: "basis-evidence", sourceOrigin: "EXTERNAL_ENGINEERING_SOFTWARE", sourceToolName: "ETAP", sourceToolVersion: "22.0", sourceOrganization: "External study office", applicability: "Applies only to evidence-1 and device-1", limitations: "Supplied study evidence is not an EOS calculation", assumptions: ["External study assumption retained"], inputs: [{ name: "SUPPLIED_INPUT", value: "10", unit: "kA" }], evidenceId: "evidence-protection", evidenceClass: "PROTECTION_COORDINATION", sourceDocumentRef: "RPT-PROTECTION", results: [{ name: "SUPPLIED_RESULT", value: "12", unit: "kA" }] });
    const r6 = createD7R6Store(r1, r5);
    const governed = { contextId: "ctx-1", citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: "prov-r6", sourceBasisRef: "basis-r6" };
    recordElectricalProtectionDeviceContext(r6, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), deviceRecordId: "device-rec", deviceClass: "BREAKER" });
    const suppliedSetting = recordElectricalProtectionSetting(r6, who, { ...governed, ...bound(deviceObject.objectId, deviceObject.fingerprint), settingRecordId: "setting-supplied", statementRole: "SUPPLIED_PROTECTION_SETTING", settingCategory: "CURRENT", suppliedValue: "800", unit: "A", jurisdictionProfileId: "australia", standardReference: "AS/NZS 3000 reference" });
    const r7 = createD7R7Store(r1, r6);
    const requirement = recordElectricalSourceRequirement(r7, who, { ...bound(load.objectId, load.fingerprint), requirementId: "req-source", statement: "Retain the supplied continuous load basis", requirementRole: "SOURCE_REQUIREMENT", requirementCategory: "DESIGN_INPUT", sourceClass: "PROJECT_REQUIREMENT", sourceRef: "PR-LOAD-001", sourceRevision: "rev-2" });
    const change = recordElectricalChange(r7, who, { ...bound(load.objectId, load.fingerprint), changeId: "chg-1", changeCategory: "R3_LOAD_CHANGED", reason: "The cited load requirement changed", dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint }] });
    recordElectricalReassessment(r7, who, { ...bound(load.objectId, load.fingerprint), reassessmentId: "ras-required", changeId: change.changeId, targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint, state: "REASSESSMENT_REQUIRED" });
    const scope = { tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", recordStatus: "CURRENT" as const };
    const counterparts = [
      { discipline: "mechanical" as const, counterpartId: "mech-1", sourceRevision: "rev-mech", fingerprint: "fp-mech", ...scope },
      { discipline: "process" as const, counterpartId: "proc-1", sourceRevision: "rev-proc", fingerprint: "fp-proc", ...scope },
      { discipline: "structural" as const, counterpartId: "str-1", sourceRevision: "rev-str", fingerprint: "fp-str", ...scope },
      { discipline: "civil" as const, counterpartId: "civ-1", sourceRevision: "rev-civ", fingerprint: "fp-civ", ...scope },
      { discipline: "geotechnical" as const, counterpartId: "geo-1", sourceRevision: "rev-geo", fingerprint: "fp-geo", ...scope },
      { discipline: "piping" as const, counterpartId: "pip-1", sourceRevision: "rev-pip", fingerprint: "fp-pip", ...scope },
    ];
    const store = createD7R8Store(r7, counterparts);
    const common = { ...bound(load.objectId, load.fingerprint), sourceKind: "R3_LOAD", sourceId: suppliedLoad.loadRecordId, sourceFingerprint: suppliedLoad.fingerprint, dependencies: [{ kind: "OBJECT_REFERENCE", targetKind: "R3_LOAD", targetId: suppliedLoad.loadRecordId, targetFingerprint: suppliedLoad.fingerprint }], direction: "D7_TO_COUNTERPART", suppliedContent: "Supplied electrical load context for the named counterpart", handoffStatus: "COMPLETE", identityBasis: "EXPLICIT", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" };
    const mechanical = recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-mech", counterpartDiscipline: "mechanical", interfaceTopic: "MOTOR_REQUIREMENTS", counterpartId: "mech-1", counterpartRevision: "rev-mech", counterpartFingerprint: "fp-mech" });
    const process = recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-proc", counterpartDiscipline: "process", interfaceTopic: "MOTOR_OR_LOAD_PROCESS_REQUIREMENT", counterpartId: "proc-1", counterpartRevision: "rev-proc", counterpartFingerprint: "fp-proc" });
    const structural = recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-str", counterpartDiscipline: "structural", interfaceTopic: "ELECTRICAL_EQUIPMENT_SUPPORT_CONTEXT", counterpartId: "str-1", counterpartRevision: "rev-str", counterpartFingerprint: "fp-str" });
    const civil = recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-civ", counterpartDiscipline: "civil", interfaceTopic: "CABLE_TRENCH_OR_UNDERGROUND_ROUTE", counterpartId: "civ-1", counterpartRevision: "rev-civ", counterpartFingerprint: "fp-civ" });
    const geotechnical = recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-geo", counterpartDiscipline: "geotechnical", interfaceTopic: "GROUNDING_INSTALLATION_GROUND_CONDITION_REFERENCE", counterpartId: "geo-1", counterpartRevision: "rev-geo", counterpartFingerprint: "fp-geo" });
    const piping = recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-pip", counterpartDiscipline: "piping", interfaceTopic: "ELECTRIC_HEAT_TRACING_REQUIREMENT", counterpartId: "pip-1", counterpartRevision: "rev-pip", counterpartFingerprint: "fp-pip" });
    const futureD8 = recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-d8", counterpartDiscipline: "instrumentation_control", interfaceTopic: "INSTRUMENT_AND_CONTROL_POWER_SUPPLY", handoffStatus: "AWAITING_COUNTERPART", suppliedContent: "Future control power context without an I and C design" });
    const stale = markElectricalInterfaceFromChange(store, who, { handoffId: mechanical.handoffId, handoffFingerprint: mechanical.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "STALE" });
    const reassessment = markElectricalInterfaceFromChange(store, who, { handoffId: process.handoffId, handoffFingerprint: process.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "REASSESSMENT_REQUIRED" });
    const replay = recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-str", counterpartDiscipline: "structural", interfaceTopic: "ELECTRICAL_EQUIPMENT_SUPPORT_CONTEXT", counterpartId: "str-1", counterpartRevision: "rev-str", counterpartFingerprint: "fp-str", assertedFingerprint: structural.fingerprint });

    expect(replay).toBe(structural);
    expect(mechanical.counterpart?.sourceRevision).toBe("rev-mech");
    expect(mechanical.counterpartTruth).toBe(false);
    expect(mechanical.mechanicalDesign).toBe(false);
    expect(mechanical.engineeringValidated).toBe(false);
    expect(mechanical.approved).toBe(false);
    expect(mechanical.authorityTransferred).toBe(false);
    expect(process.processDesign).toBe(false);
    expect(process.interfaceTopic).toBe("MOTOR_OR_LOAD_PROCESS_REQUIREMENT");
    expect(structural.counterpart?.fingerprint).toBe("fp-str");
    expect(civil.counterpartTruth).toBe(false);
    expect(geotechnical.engineeringValidated).toBe(false);
    expect(piping.approved).toBe(false);
    expect(futureD8.counterpart).toBeNull();
    expect(futureD8.iacDesign).toBe(false);
    expect(futureD8.functionalSafetyValidated).toBe(false);
    expect(futureD8.interfaceComplete).toBe(false);
    expect(stale.currentness).toBe("STALE");
    expect(stale.counterpart?.sourceRevision).toBe("rev-mech");
    expect(stale.fingerprint).toBe(mechanical.fingerprint);
    expect(currentElectricalInterfaceHandoffs(store, who).some((row) => row.handoffId === mechanical.handoffId)).toBe(false);
    expect(reassessment.currentness).toBe("REASSESSMENT_REQUIRED");
    expect(reassessment.engineeringValidated).toBe(false);
    expect(reassessment.approved).toBe(false);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(suppliedSetting.suppliedValue).toBe("800");
    expect(suppliedSetting.calculated).toBe(false);
    expect(feederContext.protectionCoordination).toBe(false);
    expect(protectionEvidence.eosCalculated).toBe(false);
    expect(protectionEvidence.results[0]?.value).toBe("12");
    expect(requirement.adopted).toBe(false);
    expect(load.fingerprint).toBe(identityFingerprint);
    expect(counterparts[0]?.fingerprint).toBe("fp-mech");
    expect(store.history.some((row) => row.handoffId === mechanical.handoffId && row.action === "CREATED")).toBe(true);

    expect(() => createD7R8Store(createD7R7Store(createD7R1Store(), r6), counterparts)).toThrow(/R1_R6_STORE_MISMATCH/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-infer", counterpartDiscipline: "mechanical", interfaceTopic: "MOTOR_REQUIREMENTS", counterpartId: "mech-1", counterpartRevision: "rev-mech", counterpartFingerprint: "fp-mech", inferCounterpart: true })).toThrow(/INFERRED_COUNTERPART_REJECTED/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-tag", counterpartDiscipline: "mechanical", interfaceTopic: "MOTOR_REQUIREMENTS", counterpartId: "mech-1", counterpartRevision: "rev-mech", counterpartFingerprint: "fp-mech", identityBasis: "matching_tag" })).toThrow(/INFERRED_COUNTERPART_REJECTED/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-float", counterpartDiscipline: "mechanical", interfaceTopic: "MOTOR_REQUIREMENTS", counterpartId: "mech-1", counterpartRevision: "latest", counterpartFingerprint: "fp-mech" })).toThrow(/COUNTERPART_REVISION_REQUIRED/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-spoof", counterpartDiscipline: "process", interfaceTopic: "POWER_REQUIREMENT_CONTEXT", counterpartId: "proc-1", counterpartRevision: "rev-proc", counterpartFingerprint: "spoof" })).toThrow(/COUNTERPART_REVISION_MISMATCH/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-missing", counterpartDiscipline: "mechanical", interfaceTopic: "SUPPLY_CHARACTERISTICS" })).toThrow(/COUNTERPART_REQUIRED/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-d8-object", counterpartDiscipline: "instrumentation_control", interfaceTopic: "UPS_OR_DC_SUPPLY_CONTEXT", handoffStatus: "AWAITING_COUNTERPART", counterpartId: "iac-1", counterpartRevision: "rev-iac", counterpartFingerprint: "fp-iac" })).toThrow(/D8_COUNTERPART_FABRICATION_REJECTED/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-d8-complete", counterpartDiscipline: "instrumentation_control", interfaceTopic: "TRIP_OR_INTERLOCK_ELECTRICAL_CONTEXT", handoffStatus: "COMPLETE" })).toThrow(/INCOMPLETE_COUNTERPART_NOT_COMPLETE/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-topic", counterpartDiscipline: "process", interfaceTopic: "PROCESS_DESIGN", counterpartId: "proc-1", counterpartRevision: "rev-proc", counterpartFingerprint: "fp-proc" })).toThrow(/INTERFACE_TOPIC_INVALID/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-dup", counterpartDiscipline: "mechanical", interfaceTopic: "MOTOR_REQUIREMENTS", counterpartId: "mech-1", counterpartRevision: "rev-mech", counterpartFingerprint: "fp-mech" })).toThrow(/DUPLICATE_HANDOFF_REJECTED/);
    expect(() => recordElectricalInterfaceHandoff(store, actor({ authority: "AI_ASSISTANT" }), { ...common, handoffId: "ho-ai", counterpartDiscipline: "piping", interfaceTopic: "PACKAGE_OR_INTERFACE_REQUIREMENT", counterpartId: "pip-1", counterpartRevision: "rev-pip", counterpartFingerprint: "fp-pip" })).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalInterfaceHandoff(store, actor({ authority: "ADMIN" }), { ...common, handoffId: "ho-admin", counterpartDiscipline: "civil", interfaceTopic: "CIVIL_SUPPORT_OR_ENCASEMENT", counterpartId: "civ-1", counterpartRevision: "rev-civ", counterpartFingerprint: "fp-civ" })).toThrow(/ADMIN_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-tenant", counterpartDiscipline: "structural", interfaceTopic: "POLE_OR_STRUCTURE_SUPPORT_REQUIREMENT", counterpartId: "str-1", counterpartRevision: "rev-str", counterpartFingerprint: "fp-str", tenantId: "tenant-b" })).toThrow(/SCOPE_MISMATCH/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-adopt", counterpartDiscipline: "mechanical", interfaceTopic: "ELECTRICAL_LOAD_OR_DEMAND", counterpartId: "mech-1", counterpartRevision: "rev-mech", counterpartFingerprint: "fp-mech", autoAdoptDesign: true })).toThrow(/COUNTERPART_REDESIGN_REJECTED/);
    expect(() => recordElectricalInterfaceHandoff(store, who, { ...common, handoffId: "ho-approve", counterpartDiscipline: "process", interfaceTopic: "UTILITY_POWER_PROCESS_CONTEXT", counterpartId: "proc-1", counterpartRevision: "rev-proc", counterpartFingerprint: "fp-proc", acceptAsApproved: true })).toThrow(/COUNTERPART_APPROVAL_REJECTED/);
    expect(() => markElectricalInterfaceFromChange(store, who, { handoffId: piping.handoffId, handoffFingerprint: piping.fingerprint, changeId: change.changeId, changeFingerprint: change.fingerprint, mark: "STALE", mutateCounterpart: true })).toThrow(/COUNTERPART_MUTATION_REJECTED/);
    expect(() => markElectricalInterfaceFromChange(store, who, { handoffId: civil.handoffId, handoffFingerprint: civil.fingerprint, changeId: "chg-missing", changeFingerprint: change.fingerprint, mark: "STALE" })).toThrow(/CHANGE_REVISION_MISMATCH/);
    expect(() => repointElectricalInterface()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateElectricalInterfaceCounterpart()).toThrow(/COUNTERPART_MUTATION_REJECTED/);
    expect(() => adoptElectricalHandoffAsCounterpartDesign()).toThrow(/COUNTERPART_REDESIGN_REJECTED/);
    expect(() => reasonAcrossElectricalDisciplines()).toThrow(/CROSS_DISCIPLINE_REASONING_NOT_IN_R8/);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(load.fingerprint).toBe(identityFingerprint);
    expect(counterparts[1]?.sourceRevision).toBe("rev-proc");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R9.REVIEW_AND_VALIDATION_GOVERNANCE")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "discipline-interfaces-handoffs.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "discipline-interfaces-handoffs.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
