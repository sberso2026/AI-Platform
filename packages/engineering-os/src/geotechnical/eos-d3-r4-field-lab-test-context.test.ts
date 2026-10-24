import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D3_0_RUNTIME_STARTED, D3_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D3_CONTEXT_AUTHORITY, D3_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity, type D3R1Actor } from "./identity-foundation";
import { D3_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD3R2Store, recordBoreholeEvidenceContext, recordInvestigationEvidenceReference, recordInvestigationLocationContext, recordInvestigationProgram } from "./site-investigation-evidence";
import { D3_FIELD_LAB_TEST_RUNTIME_READY as R3_FIELD_READY, D3_R4_STARTED, D3_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD3R3Store, recordMaterialClassificationContext, recordStratigraphicInterpretation } from "./stratigraphy-groundwater-material";
import {
  AI_CAN_AUTOMATICALLY_INTERPRET_TEST_RESULT_AS_AUTHORITATIVE_PARAMETER,
  AI_CAN_FABRICATE_GEOTECHNICAL_TEST_RESULT,
  AI_CAN_INVENT_TEST_METHOD,
  AI_CAN_INVENT_TEST_RESULT,
  AI_CAN_SILENTLY_CHANGE_TEST_UNIT,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_GENERATED_TEST_INTERPRETATION_EQUALS_ENGINEERING_AUTHORITY,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D2_REOPENED,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D3_FIELD_LAB_TEST_RUNTIME_COUNT,
  D3_FIELD_LAB_TEST_RUNTIME_IMPLEMENTED,
  D3_FIELD_LAB_TEST_RUNTIME_READY,
  D3_FIELD_TEST_CONTEXT_IMPLEMENTED,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
  D3_LAB_TEST_CONTEXT_IMPLEMENTED,
  D3_PARAMETER_CALCULATION_RUNTIME_COUNT,
  D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
  D3_PARAMETER_RUNTIME_COUNT,
  D3_R1_IDENTITY_REUSED,
  D3_R2_INVESTIGATION_EVIDENCE_REUSED,
  D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED,
  D3_R4_CANONICAL_NEXT_PHASE,
  D3_R4_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R4_HISTORY_PRESERVED,
  D3_R4_MATURITY,
  D3_R4_NEXT_PHASE_TYPE,
  D3_R4_PROVENANCE_PRESERVED,
  D3_R4_PROVENANCE_REQUIRED,
  D3_R4_STATUS,
  D3_R5_STARTED,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D3_TEST_METHOD_REFERENCE_REQUIRED,
  D3_TEST_RESULT_AUTO_MUTATES_R3_GROUNDWATER_CONTEXT,
  D3_TEST_RESULT_AUTO_MUTATES_R3_MATERIAL_CLASSIFICATION,
  D3_TEST_RESULT_AUTO_MUTATES_R3_STRATIGRAPHY,
  D3_TEST_RESULT_AUTO_REPOINTED,
  D3_TEST_RESULT_UNIT_REQUIRED_WHERE_QUANTITATIVE,
  D3_TEST_SAMPLE_SPECIMEN_TRACEABILITY_PRESERVED,
  D3_TEST_SAMPLE_SPECIMEN_TRACEABILITY_REQUIRED,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER,
  EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED,
  EXACT_R2_EVIDENCE_REFERENCE_REQUIRED,
  EXACT_R3_CONTEXT_REFERENCE_REQUIRED_WHERE_APPLICABLE,
  FLOATING_UPSTREAM_TEST_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R4_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D3_R4_SCOPE_ENFORCED,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER,
  TEST_RESULT_EQUALS_ENGINEERING_VALIDATED,
  TEST_WITHOUT_GOVERNED_SAMPLE_OR_SOURCE_AUTO_ACCEPTED,
  createD3R4Store,
  deriveGeotechnicalParameter,
  mutateFieldOrLabTest,
  recordFieldTestResult,
  recordLaboratoryTestResult,
  repointTestResult,
} from "./field-lab-test-context";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

describe("EOS-D3-R4 field and laboratory test context", () => {
  it("records supplied field and laboratory measurements without selecting design parameters", () => {
    expect(D3_R4_STATUS).toBe("FIELD_AND_LAB_TEST_CONTEXT_IMPLEMENTED");
    expect(D3_R4_MATURITY).toBe("FIELD_AND_LAB_TEST_CONTEXT_IMPLEMENTED");
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R4_STARTED).toBe(false);
    expect(R3_FIELD_READY).toBe(false);
    expect(D3_R5_STARTED).toBe(false);
    expect(D3_R1_IDENTITY_REUSED).toBe(true);
    expect(D3_R2_INVESTIGATION_EVIDENCE_REUSED).toBe(true);
    expect(D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED).toBe(true);
    expect(EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_R2_EVIDENCE_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_R3_CONTEXT_REFERENCE_REQUIRED_WHERE_APPLICABLE).toBe(true);
    expect(FLOATING_UPSTREAM_TEST_REFERENCE_ALLOWED).toBe(false);
    expect(D3_FIELD_LAB_TEST_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_FIELD_LAB_TEST_RUNTIME_COUNT).toBe(1);
    expect(D3_FIELD_LAB_TEST_RUNTIME_READY).toBe(true);
    expect(D3_FIELD_TEST_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_LAB_TEST_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_TEST_METHOD_REFERENCE_REQUIRED).toBe(true);
    expect(D3_TEST_RESULT_UNIT_REQUIRED_WHERE_QUANTITATIVE).toBe(true);
    expect(AI_CAN_INVENT_TEST_METHOD).toBe(false);
    expect(AI_CAN_INVENT_TEST_RESULT).toBe(false);
    expect(AI_CAN_SILENTLY_CHANGE_TEST_UNIT).toBe(false);
    expect(D3_TEST_SAMPLE_SPECIMEN_TRACEABILITY_REQUIRED).toBe(true);
    expect(D3_TEST_SAMPLE_SPECIMEN_TRACEABILITY_PRESERVED).toBe(true);
    expect(TEST_WITHOUT_GOVERNED_SAMPLE_OR_SOURCE_AUTO_ACCEPTED).toBe(false);
    expect(TEST_RESULT_EQUALS_ENGINEERING_PARAMETER).toBe(false);
    expect(ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER).toBe(false);
    expect(TEST_RESULT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_CAN_AUTOMATICALLY_INTERPRET_TEST_RESULT_AS_AUTHORITATIVE_PARAMETER).toBe(false);
    expect(AI_GENERATED_TEST_INTERPRETATION_EQUALS_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_FABRICATE_GEOTECHNICAL_TEST_RESULT).toBe(false);
    expect(AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D3_TEST_RESULT_AUTO_MUTATES_R3_STRATIGRAPHY).toBe(false);
    expect(D3_TEST_RESULT_AUTO_MUTATES_R3_MATERIAL_CLASSIFICATION).toBe(false);
    expect(D3_TEST_RESULT_AUTO_MUTATES_R3_GROUNDWATER_CONTEXT).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(D3_R4_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_R4_PROVENANCE_PRESERVED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_TEST_RESULT_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D3_R4_MUTATION_ALLOWED).toBe(false);
    expect(D3_R4_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R4_SCOPE_ENFORCED).toBe(true);
    expect([
      D3_PARAMETER_RUNTIME_COUNT,
      D3_PARAMETER_CALCULATION_RUNTIME_COUNT,
      D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
      D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
    ]).toEqual(Array(12).fill(0));
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D2_REOPENED).toBe(false);
    expect(D2_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D3_R4_CANONICAL_NEXT_PHASE).toBe("EOS-D3-R5-GEOTECHNICAL-PARAMETER-CONTEXT");
    expect(D3_R4_NEXT_PHASE_TYPE).toBe("GEOTECHNICAL_PARAMETER_CONTEXT");
    expect(D3_R4_CANONICAL_NEXT_PHASE_SCOPE).toContain("preserving the distinction between raw test results");

    const r1 = createD3R1Store();
    const context = recordGeotechnicalContext(r1, actor, { contextId: "geotech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-context" });
    const site = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "site-1", contextId: context.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site" });
    const locationObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "location-1", contextId: context.contextId, objectType: "INVESTIGATION_LOCATION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-location-identity", parentObjectId: site.objectId });
    const borehole = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "borehole-1", contextId: context.contextId, objectType: "BOREHOLE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-borehole-identity", parentObjectId: site.objectId });
    const layer = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "layer-1", contextId: context.contextId, objectType: "STRATIGRAPHIC_LAYER", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-layer-identity", parentObjectId: borehole.objectId });
    const materialObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "material-1", contextId: context.contextId, objectType: "MATERIAL_CLASSIFICATION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-material-identity" });
    const fieldObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "field-record-1", contextId: context.contextId, objectType: "FIELD_TEST_RECORD", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-field-identity" });
    const labObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "lab-record-1", contextId: context.contextId, objectType: "LAB_TEST_RECORD", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-lab-identity" });
    const r2 = createD3R2Store(r1);
    const program = recordInvestigationProgram(r2, actor, { investigationProgramId: "program-1", contextId: context.contextId, objectId: site.objectId, purpose: "Factual site investigation campaign", campaignRef: "campaign-2026-a", method: "BOREHOLE_DRILLING", provider: "Field provider A", investigationDate: "2026-04-01", provenanceRef: "prov-program", citedCurrentness: "CURRENT" });
    const location = recordInvestigationLocationContext(r2, actor, { locationContextId: "location-context-1", investigationProgramId: program.investigationProgramId, contextId: context.contextId, objectId: locationObject.objectId, locationEvidenceRef: "survey-control-sheet-14", provenanceRef: "prov-location", citedCurrentness: "CURRENT" });
    const boreholeEvidence = recordBoreholeEvidenceContext(r2, actor, { boreholeEvidenceId: "borehole-evidence-1", investigationProgramId: program.investigationProgramId, contextId: context.contextId, objectId: borehole.objectId, sourceLogRef: "bh-log-001", drillingRecordRef: "drill-sheet-001", provider: "Driller A", investigationDate: "2026-04-03", provenanceRef: "prov-borehole-evidence", citedCurrentness: "CURRENT" });
    const boreholeLog = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-log-1", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "BOREHOLE_LOG", sourceRevision: "rev-a", provenanceRef: "prov-log", citedCurrentness: "CURRENT" });
    const fieldEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-field-1", contextId: context.contextId, objectId: fieldObject.objectId, evidenceKind: "FIELD_TEST_DATA", sourceRevision: "spt-sheet-1", provenanceRef: "prov-field", citedCurrentness: "CURRENT" });
    const labEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-lab-1", contextId: context.contextId, objectId: labObject.objectId, evidenceKind: "LABORATORY_REPORT", sourceRevision: "lab-cert-1", provenanceRef: "prov-lab", citedCurrentness: "CURRENT" });
    const r3 = createD3R3Store(r2);
    const stratigraphy = recordStratigraphicInterpretation(r3, actor, { stratigraphyId: "layer-interpretation-1", contextId: context.contextId, objectId: layer.objectId, locationContextId: location.locationContextId, boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId, evidenceReferenceIds: [boreholeLog.evidenceReferenceId], depthInterval: "0.0 m to 2.4 m as marked on bh-log-001", materialDescription: "brown sand described on bh-log-001", layerSequence: "1", interpretationSource: "logged by field geologist on bh-log-001", limitations: "Description is limited to the supplied log interval", provenanceRef: "prov-layer", citedCurrentness: "CURRENT" });
    const material = recordMaterialClassificationContext(r3, actor, { materialClassificationId: "material-classification-1", contextId: context.contextId, objectId: materialObject.objectId, layerInterpretationId: stratigraphy.stratigraphyId, evidenceReferenceIds: [boreholeLog.evidenceReferenceId], classificationSystem: "USCS as cited on bh-log-001", classificationResult: "SP as written on bh-log-001", materialDescription: "poorly graded sand as written on bh-log-001", limitations: "Classification is the supplied log entry", provenanceRef: "prov-material", citedCurrentness: "CURRENT" });
    const stratigraphyFingerprint = stratigraphy.fingerprint;
    const materialFingerprint = material.fingerprint;
    const store = createD3R4Store(r3);
    const field = recordFieldTestResult(store, actor, {
      fieldTestId: "field-test-1",
      contextId: context.contextId,
      objectId: fieldObject.objectId,
      testCategory: "SPT",
      locationContextId: location.locationContextId,
      stratigraphyId: stratigraphy.stratigraphyId,
      depthOrElevation: "1.5 m as written on spt-sheet-1",
      methodReference: "ASTM D1586 as cited on spt-sheet-1",
      measuredResult: "12",
      unit: "blows per 300 mm",
      evidenceReferenceIds: [fieldEvidence.evidenceReferenceId],
      provider: "Field crew A",
      testDate: "2026-04-03",
      limitations: "Supplied blow count only",
      provenanceRef: "prov-spt",
      citedCurrentness: "CURRENT",
    });
    expect(field.engineeringParameter).toBe(false);
    expect(field.engineeringValidated).toBe(false);
    expect(field.stratigraphyId).toBe(stratigraphy.stratigraphyId);
    expect(field.fingerprint).toBe(fingerprintCanonical({
      fieldTestId: "field-test-1", testCategory: "SPT", contextId: context.contextId, objectId: fieldObject.objectId, locationContextId: location.locationContextId, stratigraphyId: stratigraphy.stratigraphyId, materialClassificationId: null, groundwaterContextId: null, depthOrElevation: "1.5 m as written on spt-sheet-1", specimenReference: null, methodReference: "ASTM D1586 as cited on spt-sheet-1", measuredResult: "12", unit: "blows per 300 mm", originalMeasuredResult: null, originalUnit: null, transformationProvenance: null, evidenceReferenceIds: ["evidence-field-1"], provider: "Field crew A", testDate: "2026-04-03", limitations: "Supplied blow count only", provenanceRef: "prov-spt", citedCurrentness: "CURRENT", authority: D3_CONTEXT_AUTHORITY, predecessorFieldTestId: null,
    }));
    expect(recordFieldTestResult(store, actor, { fieldTestId: "field-test-1", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, stratigraphyId: stratigraphy.stratigraphyId, depthOrElevation: "1.5 m as written on spt-sheet-1", methodReference: "ASTM D1586 as cited on spt-sheet-1", measuredResult: "12", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "Supplied blow count only", provenanceRef: "prov-spt", citedCurrentness: "CURRENT" }).fingerprint).toBe(field.fingerprint);
    expect(stratigraphy.fingerprint).toBe(stratigraphyFingerprint);
    expect(material.fingerprint).toBe(materialFingerprint);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-no-source", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, methodReference: "ASTM D1586", measuredResult: "8", unit: "blows per 300 mm", evidenceReferenceIds: [], provider: "Field crew A", testDate: "2026-04-03", limitations: "missing source", provenanceRef: "prov-missing", citedCurrentness: "CURRENT" })).toThrow(/TEST_WITHOUT_SAMPLE_OR_SOURCE/);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-no-unit", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "CPT", locationContextId: location.locationContextId, methodReference: "ASTM D5778 as cited", measuredResult: "2.4", unit: "", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "missing unit", provenanceRef: "prov-unit", citedCurrentness: "CURRENT" })).toThrow(/TEST_UNIT_REQUIRED/);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-invented", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, methodReference: "ASTM D1586", measuredResult: "99", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "invented", provenanceRef: "prov-invented", citedCurrentness: "CURRENT", inventResult: true })).toThrow(/TEST_RESULT_NOT_INVENTED/);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-method", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, methodReference: "auto", measuredResult: "10", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "invented method", provenanceRef: "prov-method", citedCurrentness: "CURRENT" })).toThrow(/TEST_METHOD_REQUIRED/);
    expect(() => recordFieldTestResult(store, { ...actor, actorId: "AI_assistant" }, { fieldTestId: "field-ai", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, methodReference: "ASTM D1586", measuredResult: "10", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "ai", provenanceRef: "prov-ai", citedCurrentness: "CURRENT" })).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-parameter", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, methodReference: "ASTM D1586", measuredResult: "10", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "correlation", provenanceRef: "prov-correlation", citedCurrentness: "CURRENT", sptCorrelation: true })).toThrow(/PARAMETER_NOT_IN_R4/);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-unit-change", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, methodReference: "ASTM D1586", measuredResult: "12", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "silent unit", provenanceRef: "prov-silent", citedCurrentness: "CURRENT", silentUnitChange: true })).toThrow(/SILENT_UNIT_CHANGE_REJECTED/);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-cross", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "DCP", locationContextId: location.locationContextId, methodReference: "cited method", measuredResult: "4", unit: "blows per 100 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "cross", provenanceRef: "prov-cross", citedCurrentness: "CURRENT", tenantId: "tenant-b" })).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-floating", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: "latest", methodReference: "ASTM D1586", measuredResult: "10", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "floating", provenanceRef: "prov-floating", citedCurrentness: "CURRENT" })).toThrow(/R2_LOCATION_REQUIRED/);
    const converted = recordFieldTestResult(store, actor, {
      fieldTestId: "field-test-converted", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "CPT", locationContextId: location.locationContextId, depthOrElevation: "2.0 m", methodReference: "ASTM D5778 as cited on spt-sheet-1", measuredResult: "2.4", unit: "MPa", originalMeasuredResult: "2400", originalUnit: "kPa", transformationProvenance: "unit statement on spt-sheet-1", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-04", limitations: "Original unit retained", provenanceRef: "prov-cpt", citedCurrentness: "CURRENT",
    });
    expect(converted.originalMeasuredResult).toBe("2400");
    expect(converted.originalUnit).toBe("kPa");
    expect(converted.unit).toBe("MPa");
    expect(converted.engineeringParameter).toBe(false);

    const lab = recordLaboratoryTestResult(store, actor, {
      labTestId: "lab-test-1", contextId: context.contextId, objectId: labObject.objectId, testCategory: "MOISTURE_CONTENT", materialClassificationId: material.materialClassificationId, specimenReference: "specimen-14 as labeled on lab-cert-1", methodReference: "ASTM D2216 as cited on lab-cert-1", measuredResult: "18.4", unit: "percent", evidenceReferenceIds: [labEvidence.evidenceReferenceId], provider: "Laboratory A", testDate: "2026-04-06", limitations: "Supplied moisture content only", provenanceRef: "prov-moisture", citedCurrentness: "CURRENT",
    });
    expect(lab.specimenReference).toBe("specimen-14 as labeled on lab-cert-1");
    expect(lab.engineeringParameter).toBe(false);
    expect(lab.materialClassificationId).toBe(material.materialClassificationId);
    expect(material.fingerprint).toBe(materialFingerprint);
    expect(() => recordLaboratoryTestResult(store, actor, { labTestId: "lab-no-specimen", contextId: context.contextId, objectId: labObject.objectId, testCategory: "CBR", specimenReference: "", methodReference: "ASTM D1883", measuredResult: "8", unit: "percent", evidenceReferenceIds: [labEvidence.evidenceReferenceId], provider: "Laboratory A", testDate: "2026-04-06", limitations: "missing specimen", provenanceRef: "prov-specimen", citedCurrentness: "CURRENT" })).toThrow(/SPECIMEN_REQUIRED/);
    expect(() => recordLaboratoryTestResult(store, actor, { labTestId: "lab-fabricated", contextId: context.contextId, objectId: labObject.objectId, testCategory: "CBR", specimenReference: "specimen-15", methodReference: "ASTM D1883", measuredResult: "20", unit: "percent", evidenceReferenceIds: [labEvidence.evidenceReferenceId], provider: "Laboratory A", testDate: "2026-04-06", limitations: "fabricated", provenanceRef: "prov-fabricated", citedCurrentness: "CURRENT", fabricateResult: true })).toThrow(/TEST_RESULT_NOT_FABRICATED/);
    expect(() => recordLaboratoryTestResult(store, actor, { labTestId: "lab-recommend", contextId: context.contextId, objectId: labObject.objectId, testCategory: "DIRECT_SHEAR", specimenReference: "specimen-16", methodReference: "ASTM D3080", measuredResult: "32", unit: "kPa", evidenceReferenceIds: [labEvidence.evidenceReferenceId], provider: "Laboratory A", testDate: "2026-04-06", limitations: "not a recommendation", provenanceRef: "prov-recommend", citedCurrentness: "CURRENT", foundationRecommendation: true })).toThrow(/FOUNDATION_RECOMMENDATION_NOT_IN_R4/);
    expect(() => recordLaboratoryTestResult(store, actor, { labTestId: "lab-r3", contextId: context.contextId, objectId: labObject.objectId, testCategory: "ATTERBERG_LIMITS", specimenReference: "specimen-17", methodReference: "ASTM D4318", measuredResult: "24", unit: "percent", evidenceReferenceIds: [labEvidence.evidenceReferenceId], provider: "Laboratory A", testDate: "2026-04-06", limitations: "must not rewrite the layer", provenanceRef: "prov-r3", citedCurrentness: "CURRENT", mutateStratigraphy: true })).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => deriveGeotechnicalParameter()).toThrow(/PARAMETER_NOT_IN_R4/);
    expect(() => repointTestResult()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateFieldOrLabTest()).toThrow(/R4_MUTATION_REJECTED/);
    expect(() => { (field as { measuredResult: string }).measuredResult = "silent"; }).toThrow();
    expect(field.measuredResult).toBe("12");
    const preserved = field.fingerprint;
    const revised = recordFieldTestResult(store, actor, { fieldTestId: "field-test-1b", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, stratigraphyId: stratigraphy.stratigraphyId, depthOrElevation: "1.5 m as written on spt-sheet-1", methodReference: "ASTM D1586 as cited on spt-sheet-1", measuredResult: "14", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "Recount supplied on the same sheet", provenanceRef: "prov-spt-b", citedCurrentness: "CURRENT", predecessorFieldTestId: field.fieldTestId });
    const historical = store.fieldTests.find((row) => row.fieldTestId === field.fieldTestId);
    expect(revised.recordStatus).toBe("CURRENT");
    expect(historical?.fingerprint).toBe(preserved);
    expect(historical?.evidenceReferenceIds).toEqual(["evidence-field-1"]);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    const replacement = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-field-1b", contextId: context.contextId, objectId: fieldObject.objectId, evidenceKind: "FIELD_TEST_DATA", sourceRevision: "spt-sheet-2", provenanceRef: "prov-field-b", citedCurrentness: "CURRENT", predecessorEvidenceReferenceId: fieldEvidence.evidenceReferenceId });
    expect(historical?.evidenceReferenceIds).not.toContain(replacement.evidenceReferenceId);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-old-current", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "FIELD_VANE", locationContextId: location.locationContextId, methodReference: "cited vane method", measuredResult: "40", unit: "kPa", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-05", limitations: "stale source", provenanceRef: "prov-stale", citedCurrentness: "CURRENT" })).toThrow(/R2_EVIDENCE_NOT_CURRENT/);
    expect(() => recordFieldTestResult(store, actor, { fieldTestId: "field-spoof", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "PLATE_LOAD", locationContextId: location.locationContextId, methodReference: "cited plate method", measuredResult: "150", unit: "kPa", evidenceReferenceIds: [replacement.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-05", limitations: "spoof", provenanceRef: "prov-spoof", citedCurrentness: "CURRENT", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(stratigraphy.fingerprint).toBe(stratigraphyFingerprint);
    expect(material.materialDescription).toBe("poorly graded sand as written on bh-log-001");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "field-lab-test-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "field-lab-test-context.ts"), source)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R4.FIELD_AND_LAB_TEST_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R5.GEOTECHNICAL_PARAMETER_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
