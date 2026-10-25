import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D7_CALCULATION_EVIDENCE_CLASSES, D7_ELECTRICAL_EVIDENCE_RUNTIME_COUNT as ARCHITECTURE_EVIDENCE_COUNT, D7_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT as R4_EVIDENCE_COUNT,
  D7_R5_STARTED,
  D7_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  createD7R4Store,
  recordElectricalCableContext,
} from "./feeder-cable-rating-context";
import { D7_CONTEXT_AUTHORITY, D7_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD7R1Store, recordElectricalContext, recordElectricalObjectIdentity, type D7R1Actor } from "./identity-foundation";
import { D7_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD7R3Store, recordElectricalLoadContext } from "./load-consumer-equipment-context";
import { D7_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD7R2Store, recordElectricalSystemContext } from "./system-source-distribution-context";
import {
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_READY,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT,
  D7_R4_FEEDER_CABLE_RATING_CONTEXT_REUSED,
  D7_R5_EVIDENCE_CLASSES,
  D7_R5_NEXT_PHASE,
  D7_R5_NEXT_PHASE_TYPE,
  D7_R6_STARTED,
  D7_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ELECTRICAL_EVIDENCE_RESULT_AUTO_ADOPTED,
  EXTERNAL_ELECTRICAL_EVIDENCE_EQUALS_EOS_CALCULATION,
  adoptElectricalEvidenceResult,
  createD7R5Store,
  performElectricalLoadCalculation,
  recordElectricalCalculationEvidence,
  recordElectricalProtectionContext,
  reconstructElectricalCalculationEvidence,
  repointElectricalCalculationEvidence,
} from "./calculation-evidence";

const here = dirname(fileURLToPath(import.meta.url));

function actor(overrides: Partial<D7R1Actor> = {}): D7R1Actor {
  return { actorId: "elec-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D7_CONTEXT_AUTHORITY, ...overrides };
}

describe("EOS-D7-R5 electrical calculation evidence", () => {
  it("records supplied electrical study evidence without calculating or adopting it", () => {
    expect(D7_R4_FEEDER_CABLE_RATING_CONTEXT_REUSED).toBe(true);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R4_EVIDENCE_COUNT).toBe(0);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(ARCHITECTURE_EVIDENCE_COUNT).toBe(0);
    expect(D7_RUNTIME_COUNT).toBe(5);
    expect(D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_COUNT).toBe(1);
    expect(D7_ELECTRICAL_CALCULATION_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D7_R5_STARTED).toBe(false);
    expect(D7_R6_STARTED).toBe(false);
    expect(D7_CALCULATION_EVIDENCE_CLASSES.every((item) => (D7_R5_EVIDENCE_CLASSES as readonly string[]).includes(item))).toBe(true);
    expect(EXTERNAL_ELECTRICAL_EVIDENCE_EQUALS_EOS_CALCULATION || ELECTRICAL_EVIDENCE_RESULT_AUTO_ADOPTED || D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT !== 0).toBe(false);
    expect(D7_PROTECTION_GROUNDING_HAZARDOUS_AREA_RUNTIME_COUNT).toBe(0);
    expect(D8_RUNTIME_STARTED || D9_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_COUNT).toBe(0);
    expect(D7_R5_NEXT_PHASE).toBe("EOS-D7-R6-PROTECTION-GROUNDING-AND-HAZARDOUS-AREA-CONTEXT");
    expect(D7_R5_NEXT_PHASE_TYPE).toBe("PROTECTION_GROUNDING_AND_HAZARDOUS_AREA_CONTEXT");

    const r1 = createD7R1Store();
    const who = actor();
    recordElectricalContext(r1, who, { contextId: "ctx-1", citedLifecycleStage: "FEED", provenanceRef: "prov-ctx", sourceBasisRef: "basis-ctx" });
    const identity = (objectId: string, objectType: "ELECTRICAL_SYSTEM" | "ELECTRICAL_LOAD" | "ELECTRICAL_CABLE" | "ELECTRICAL_CALCULATION_EVIDENCE") =>
      recordElectricalObjectIdentity(r1, who, { objectId, contextId: "ctx-1", objectType, citedLifecycleStage: "FEED", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}` });
    const system = identity("sys-1", "ELECTRICAL_SYSTEM");
    const load = identity("load-1", "ELECTRICAL_LOAD");
    const cable = identity("cable-1", "ELECTRICAL_CABLE");
    const evidence = identity("evidence-1", "ELECTRICAL_CALCULATION_EVIDENCE");
    const r2 = createD7R2Store(r1);
    const bound = (objectId: string, fingerprint: string) => ({ contextId: "ctx-1", objectId, objectRevisionFingerprint: fingerprint, citedLifecycleStage: "FEED", citedCurrentness: "CURRENT", provenanceRef: `prov-${objectId}`, sourceBasisRef: `basis-${objectId}`, applicability: `Applies only to ${objectId}`, limitations: `Context only for ${objectId}` });
    const systemContext = recordElectricalSystemContext(r2, who, { ...bound(system.objectId, system.fingerprint), systemRecordId: "sys-rec", systemRole: "DISTRIBUTION_SYSTEM", nominalClassification: "MEDIUM_VOLTAGE_CLASS" });
    const r3 = createD7R3Store(r1, r2);
    const suppliedLoad = recordElectricalLoadContext(r3, who, { ...bound(load.objectId, load.fingerprint), caseName: "NORMAL_CASE", duty: "CONTINUOUS", availability: "REQUIRED", applicability: "Applies only to load-1 in NORMAL_CASE", limitations: "Supplied value is not a calculation", loadRecordId: "load-supplied", statementRole: "SUPPLIED_LOAD_REQUIREMENT", suppliedValue: "250", unit: "kW" });
    const r4 = createD7R4Store(r1, r2, r3);
    const cableContext = recordElectricalCableContext(r4, who, { ...bound(cable.objectId, cable.fingerprint), cableRecordId: "cable-rec", conductorMaterial: "COPPER", suppliedCoreCount: "3", insulationContext: "XLPE", suppliedSizeAttribute: "4/0", sizeUnit: "AWG", installationEnvironment: "INDOOR", routingCategory: "TRAY", installationMethod: "TRAY_REFERENCE", ambientContext: "40C" });
    const loadFingerprint = suppliedLoad.fingerprint;
    const cableFingerprint = cableContext.fingerprint;
    const systemFingerprint = systemContext.fingerprint;
    const evidenceFingerprint = evidence.fingerprint;
    const store = createD7R5Store(r1, r4);
    const common = {
      contextId: "ctx-1",
      objectId: evidence.objectId,
      objectRevisionFingerprint: evidence.fingerprint,
      citedLifecycleStage: "FEED",
      citedCurrentness: "CURRENT",
      provenanceRef: "prov-evidence",
      sourceBasisRef: "basis-evidence",
      sourceOrigin: "EXTERNAL_ENGINEERING_SOFTWARE",
      sourceToolName: "ETAP",
      sourceToolVersion: "22.0",
      sourceOrganization: "External study office",
      sourceModelRevision: "model-7",
      studyDate: "2026-10-01",
    };
    const recorded = D7_R5_EVIDENCE_CLASSES.map((evidenceClass) => {
      const cableStudy = evidenceClass === "CABLE_SIZING" || evidenceClass === "AMPACITY" || evidenceClass === "CABLE_DERATING";
      const subject = cableStudy ? cable : load;
      return recordElectricalCalculationEvidence(store, who, {
        ...common,
        evidenceId: `evidence-${evidenceClass}`,
        evidenceClass,
        subjectObjectId: subject.objectId,
        subjectRevisionFingerprint: subject.fingerprint,
        sourceDocumentRef: `RPT-${evidenceClass}`,
        applicability: `Applies only to evidence-1 and ${subject.objectId}`,
        limitations: "Supplied study evidence is not an EOS calculation",
        assumptions: ["External study assumption retained"],
        inputs: [{ name: "SUPPLIED_INPUT", value: "250", unit: "kW" }],
        results: [{ name: "SUPPLIED_RESULT", value: evidenceClass === "CABLE_SIZING" ? "4/0" : "180", unit: evidenceClass === "CABLE_SIZING" ? "AWG" : "kW" }],
        ...(cableStudy ? { cableRecordId: cableContext.cableRecordId, cableRevisionFingerprint: cableContext.fingerprint } : { loadRecordId: suppliedLoad.loadRecordId, loadRevisionFingerprint: suppliedLoad.fingerprint, systemRecordId: systemContext.systemRecordId, systemRevisionFingerprint: systemContext.fingerprint }),
      });
    });
    expect(recorded).toHaveLength(D7_R5_EVIDENCE_CLASSES.length);
    expect(recorded.every((row) => row.eosCalculated === false && row.adoptedDesign === false && row.engineeringValidated === false && row.codeConformance === false && row.approved === false && row.certified === false && row.changesCableRating === false)).toBe(true);
    const loadEvidence = recorded.find((row) => row.evidenceClass === "LOAD");
    expect(loadEvidence?.inputs[0]?.value).toBe("250");
    expect(loadEvidence?.results[0]?.value).toBe("180");
    expect(loadEvidence?.inputs).not.toBe(loadEvidence?.results);
    expect(loadEvidence?.assumptions).toEqual(["External study assumption retained"]);
    expect(loadEvidence?.sourceToolName).toBe("ETAP");
    expect(loadEvidence?.sourceModelRevision).toBe("model-7");
    expect(loadEvidence?.loadRevisionFingerprint).toBe(loadFingerprint);
    expect(reconstructElectricalCalculationEvidence(store, "evidence-LOAD")).toBe(loadEvidence);
    const replay = recordElectricalCalculationEvidence(store, who, {
      ...common,
      evidenceId: "evidence-LOAD",
      evidenceClass: "LOAD",
      subjectObjectId: load.objectId,
      subjectRevisionFingerprint: load.fingerprint,
      sourceDocumentRef: "RPT-LOAD",
      applicability: "Applies only to evidence-1 and load-1",
      limitations: "Supplied study evidence is not an EOS calculation",
      assumptions: ["External study assumption retained"],
      inputs: [{ name: "SUPPLIED_INPUT", value: "250", unit: "kW" }],
      results: [{ name: "SUPPLIED_RESULT", value: "180", unit: "kW" }],
      loadRecordId: suppliedLoad.loadRecordId,
      loadRevisionFingerprint: suppliedLoad.fingerprint,
      systemRecordId: systemContext.systemRecordId,
      systemRevisionFingerprint: systemContext.fingerprint,
      assertedFingerprint: loadEvidence?.fingerprint,
    });
    expect(replay).toBe(loadEvidence);
    expect(suppliedLoad.fingerprint).toBe(loadFingerprint);
    expect(suppliedLoad.suppliedValue).toBe("250");
    expect(suppliedLoad.adopted).toBe(false);
    expect(cableContext.fingerprint).toBe(cableFingerprint);
    expect(cableContext.suppliedSizeAttribute).toBe("4/0");
    expect(systemContext.fingerprint).toBe(systemFingerprint);
    expect(evidence.fingerprint).toBe(evidenceFingerprint);
    expect(() => createD7R5Store(createD7R1Store(), r4)).toThrow(/R1_R4_STORE_MISMATCH/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-sum", evidenceClass: "LOAD_FLOW", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-SUM", applicability: "Applies only to evidence-1 and load-1", limitations: "no arithmetic", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "10", unit: "kW" }], results: [{ name: "RESULT", value: "180+10", unit: "kW" }] })).toThrow(/HIDDEN_CALCULATION/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-unit", evidenceClass: "VOLTAGE_DROP", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-UNIT", applicability: "Applies only to evidence-1 and load-1", limitations: "unit preserved", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "415", unit: "V" }], results: [{ name: "RESULT", value: "3", unit: "hp" }] })).toThrow(/UNIT_NOT_PRESERVED/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-derive", evidenceClass: "SHORT_CIRCUIT", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-DERIVE", applicability: "Applies only to evidence-1 and load-1", limitations: "no derivation", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "10", unit: "kA" }], results: [{ name: "RESULT", value: "12", unit: "kA" }], deriveMissingResult: true })).toThrow(/RESULT_DERIVATION_NOT_IN_R5/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-adopt", evidenceClass: "MOTOR_STARTING", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-ADOPT", applicability: "Applies only to evidence-1 and load-1", limitations: "no adoption", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "10", unit: "kW" }], results: [{ name: "RESULT", value: "12", unit: "kW" }], autoAdoptLoad: true })).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-recalc", evidenceClass: "HARMONIC", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-RECALC", applicability: "Applies only to evidence-1 and load-1", limitations: "no recalculation", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "5", unit: "percent" }], results: [{ name: "RESULT", value: "6", unit: "percent" }], recalculate: true })).toThrow(/HIDDEN_CALCULATION_NOT_IN_R5/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-spoof", evidenceClass: "POWER_QUALITY", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-SPOOF", applicability: "Applies only to evidence-1 and load-1", limitations: "exact load revision", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "1", unit: "percent" }], results: [{ name: "RESULT", value: "2", unit: "percent" }], loadRecordId: suppliedLoad.loadRecordId, loadRevisionFingerprint: "spoof" })).toThrow(/R3_LOAD_REVISION_MISMATCH/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-float", evidenceClass: "GROUNDING", objectRevisionFingerprint: "latest", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-FLOAT", applicability: "Applies only to evidence-1 and load-1", limitations: "exact revision", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "1", unit: "ohm" }], results: [{ name: "RESULT", value: "1", unit: "ohm" }] })).toThrow(/R1_REVISION_REQUIRED/);
    expect(() => recordElectricalCalculationEvidence(store, actor({ tenantId: "tenant-b" }), { ...common, evidenceId: "evidence-tenant", evidenceClass: "BATTERY_UPS", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-TENANT", applicability: "Applies only to evidence-1 and load-1", limitations: "scope", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "30", unit: "kW" }], results: [{ name: "RESULT", value: "30", unit: "kW" }] })).toThrow(/CROSS_SCOPE_OPERATION/);
    expect(() => recordElectricalCalculationEvidence(store, actor({ authority: "AI_ASSISTANT" }), { ...common, evidenceId: "evidence-ai", evidenceClass: "ARC_FLASH", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-AI", applicability: "Applies only to evidence-1 and load-1", limitations: "ai is not authority", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "8", unit: "kA" }], results: [{ name: "RESULT", value: "8", unit: "kA" }] })).toThrow(/AI_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalCalculationEvidence(store, actor({ authority: "ADMIN" }), { ...common, evidenceId: "evidence-admin", evidenceClass: "PROTECTION_COORDINATION", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-ADMIN", applicability: "Applies only to evidence-1 and load-1", limitations: "admin cannot validate", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "1", unit: "s" }], results: [{ name: "RESULT", value: "1", unit: "s" }] })).toThrow(/ADMIN_NOT_ELECTRICAL_AUTHORITY/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-LOAD-conflict", evidenceClass: "LOAD", subjectObjectId: load.objectId, subjectRevisionFingerprint: load.fingerprint, sourceDocumentRef: "RPT-LOAD", applicability: "Applies only to evidence-1 and load-1", limitations: "duplicate", assumptions: ["kept"], inputs: [{ name: "SUPPLIED_INPUT", value: "250", unit: "kW" }], results: [{ name: "SUPPLIED_RESULT", value: "200", unit: "kW" }] })).toThrow(/DUPLICATE_EVIDENCE_REJECTED/);
    expect(() => recordElectricalCalculationEvidence(store, who, { ...common, evidenceId: "evidence-cable-change", evidenceClass: "CABLE_DERATING", subjectObjectId: cable.objectId, subjectRevisionFingerprint: cable.fingerprint, sourceDocumentRef: "RPT-CHANGE", applicability: "Applies only to evidence-1 and cable-1", limitations: "does not change cable", assumptions: ["kept"], inputs: [{ name: "INPUT", value: "40", unit: "degC" }], results: [{ name: "RESULT", value: "185", unit: "mm2" }], cableRecordId: cableContext.cableRecordId, cableRevisionFingerprint: cableContext.fingerprint, changeCableRating: true })).toThrow(/CABLE_RATING_NOT_CHANGED_BY_EVIDENCE/);
    expect(() => performElectricalLoadCalculation()).toThrow(/HIDDEN_CALCULATION_NOT_IN_R5/);
    expect(() => adoptElectricalEvidenceResult()).toThrow(/AUTO_ADOPTION_REJECTED/);
    expect(() => repointElectricalCalculationEvidence()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => recordElectricalProtectionContext()).toThrow(/PROTECTION_GROUNDING_NOT_IN_R5/);
    expect(suppliedLoad.fingerprint).toBe(loadFingerprint);
    expect(cableContext.suppliedSizeAttribute).toBe("4/0");
    expect(systemContext.fingerprint).toBe(systemFingerprint);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R5.ELECTRICAL_CALCULATION_EVIDENCE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D7.R6.PROTECTION_GROUNDING_AND_HAZARDOUS_AREA_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
    const sourceText = readFileSync(join(here, "calculation-evidence.ts"), "utf8");
    expect(sourceText).toMatch(/fingerprintCanonical/);
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|eval\(|child_process|new Function/);
    expect(scanAnalysisFormulaBypass(join(here, "calculation-evidence.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
  });
});
