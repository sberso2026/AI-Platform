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
import { D3_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD3R3Store, recordGroundwaterContext, recordMaterialClassificationContext, recordStratigraphicInterpretation } from "./stratigraphy-groundwater-material";
import { D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY as R4_PARAMETER_READY, D3_R5_STARTED, D3_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD3R4Store, recordFieldTestResult, recordLaboratoryTestResult } from "./field-lab-test-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_GEOTECHNICAL_PARAMETER,
  AI_CAN_PROMOTE_CANDIDATE_PARAMETER_TO_AUTHORITATIVE,
  AUTHORITATIVE_PARAMETER_EQUALS_VALIDATED_PARAMETER,
  CANDIDATE_PARAMETER_EQUALS_AUTHORITATIVE_PARAMETER,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D2_REOPENED,
  D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D3_EARTH_PRESSURE_RUNTIME_COUNT,
  D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_COUNT,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_IMPLEMENTED,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY,
  D3_PARAMETER_APPLICABILITY_EXPLICIT,
  D3_PARAMETER_AUTO_MUTATES_R3_GROUNDWATER_CONTEXT,
  D3_PARAMETER_AUTO_MUTATES_R3_MATERIAL_CLASSIFICATION,
  D3_PARAMETER_AUTO_MUTATES_R3_STRATIGRAPHY,
  D3_PARAMETER_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D3_PARAMETER_AUTO_REPOINTED,
  D3_PARAMETER_DERIVATION_METHOD_TRACEABLE,
  D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
  D3_PARAMETER_SOURCE_BASIS_REQUIRED,
  D3_R1_IDENTITY_REUSED,
  D3_R2_INVESTIGATION_EVIDENCE_REUSED,
  D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED,
  D3_R4_FIELD_LAB_TEST_REUSED,
  D3_R5_CANONICAL_NEXT_PHASE,
  D3_R5_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D3_R5_HISTORY_PRESERVED,
  D3_R5_MATURITY,
  D3_R5_NEXT_PHASE_TYPE,
  D3_R5_PROVENANCE_PRESERVED,
  D3_R5_PROVENANCE_REQUIRED,
  D3_R5_REPLAY_PROTECTION_IMPLEMENTED,
  D3_R5_SPOOFING_PROTECTION_IMPLEMENTED,
  D3_R5_STATUS,
  D3_R6_STARTED,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
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
  EXACT_R4_TEST_REFERENCE_REQUIRED_WHERE_APPLICABLE,
  FLOATING_PARAMETER_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARAMETER_PRESENT_EQUALS_APPROVED,
  PARAMETER_PRESENT_EQUALS_CERTIFIED,
  PARAMETER_PRESENT_EQUALS_CONFORMANT,
  PARAMETER_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  R4_TEST_RESULT_AUTO_PROMOTED_TO_R5_PARAMETER,
  R4_TEST_RESULT_AUTO_VALIDATED_AS_DESIGN_PARAMETER,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R5_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D3_R5_SCOPE_ENFORCED,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER,
  createD3R5Store,
  deriveParameterAutomatically,
  mutateGeotechnicalParameter,
  recordGeotechnicalParameter,
  repointGeotechnicalParameter,
} from "./geotechnical-parameter-context";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

describe("EOS-D3-R5 Geotechnical parameter context", () => {
  it("records supplied Geotechnical parameters without calculating or validating them", () => {
    expect(D3_R5_STATUS).toBe("GEOTECHNICAL_PARAMETER_CONTEXT_IMPLEMENTED");
    expect(D3_R5_MATURITY).toBe("GEOTECHNICAL_PARAMETER_CONTEXT_IMPLEMENTED");
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R5_STARTED).toBe(false);
    expect(R4_PARAMETER_READY).toBe(false);
    expect(D3_R6_STARTED).toBe(false);
    expect(D3_R1_IDENTITY_REUSED).toBe(true);
    expect(D3_R2_INVESTIGATION_EVIDENCE_REUSED).toBe(true);
    expect(D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED).toBe(true);
    expect(D3_R4_FIELD_LAB_TEST_REUSED).toBe(true);
    expect(EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_R2_EVIDENCE_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_R3_CONTEXT_REFERENCE_REQUIRED_WHERE_APPLICABLE).toBe(true);
    expect(EXACT_R4_TEST_REFERENCE_REQUIRED_WHERE_APPLICABLE).toBe(true);
    expect(FLOATING_PARAMETER_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_COUNT).toBe(1);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY).toBe(true);
    expect(TEST_RESULT_EQUALS_ENGINEERING_PARAMETER).toBe(false);
    expect(ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER).toBe(false);
    expect(CANDIDATE_PARAMETER_EQUALS_AUTHORITATIVE_PARAMETER).toBe(false);
    expect(AUTHORITATIVE_PARAMETER_EQUALS_VALIDATED_PARAMETER).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_GEOTECHNICAL_PARAMETER).toBe(false);
    expect(AI_CAN_PROMOTE_CANDIDATE_PARAMETER_TO_AUTHORITATIVE).toBe(false);
    expect(D3_PARAMETER_SOURCE_BASIS_REQUIRED).toBe(true);
    expect(D3_PARAMETER_DERIVATION_METHOD_TRACEABLE).toBe(true);
    expect(D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT).toBe(0);
    expect(D3_PARAMETER_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(R4_TEST_RESULT_AUTO_PROMOTED_TO_R5_PARAMETER).toBe(false);
    expect(R4_TEST_RESULT_AUTO_VALIDATED_AS_DESIGN_PARAMETER).toBe(false);
    expect(D3_PARAMETER_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D3_PARAMETER_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(PARAMETER_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(PARAMETER_PRESENT_EQUALS_CONFORMANT).toBe(false);
    expect(PARAMETER_PRESENT_EQUALS_APPROVED).toBe(false);
    expect(PARAMETER_PRESENT_EQUALS_CERTIFIED).toBe(false);
    expect(D3_PARAMETER_AUTO_MUTATES_R3_STRATIGRAPHY).toBe(false);
    expect(D3_PARAMETER_AUTO_MUTATES_R3_MATERIAL_CLASSIFICATION).toBe(false);
    expect(D3_PARAMETER_AUTO_MUTATES_R3_GROUNDWATER_CONTEXT).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_R5_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_R5_PROVENANCE_PRESERVED).toBe(true);
    expect(D3_PARAMETER_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D3_R5_MUTATION_ALLOWED).toBe(false);
    expect(D3_R5_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R5_SCOPE_ENFORCED).toBe(true);
    expect(D3_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D3_R5_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R5_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect([
      D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
      D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT,
      D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT,
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_EARTH_PRESSURE_RUNTIME_COUNT,
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
    expect(D3_R5_CANONICAL_NEXT_PHASE).toBe("EOS-D3-R6-FOUNDATION-EXCAVATION-AND-SLOPE-CONTEXT");
    expect(D3_R5_NEXT_PHASE_TYPE).toBe("FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT");
    expect(D3_R5_CANONICAL_NEXT_PHASE_SCOPE).toContain("Do not perform bearing-capacity, settlement, slope-stability");

    const r1 = createD3R1Store();
    const context = recordGeotechnicalContext(r1, actor, { contextId: "geotech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-context" });
    const site = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "site-1", contextId: context.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site" });
    const locationObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "location-1", contextId: context.contextId, objectType: "INVESTIGATION_LOCATION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-location-identity", parentObjectId: site.objectId });
    const borehole = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "borehole-1", contextId: context.contextId, objectType: "BOREHOLE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-borehole-identity", parentObjectId: site.objectId });
    const layer = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "layer-1", contextId: context.contextId, objectType: "STRATIGRAPHIC_LAYER", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-layer-identity", parentObjectId: borehole.objectId });
    const materialObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "material-1", contextId: context.contextId, objectType: "MATERIAL_CLASSIFICATION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-material-identity" });
    const groundwaterObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "groundwater-object-1", contextId: context.contextId, objectType: "GROUNDWATER_OBSERVATION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-groundwater-identity" });
    const fieldObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "field-record-1", contextId: context.contextId, objectType: "FIELD_TEST_RECORD", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-field-identity" });
    const labObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "lab-record-1", contextId: context.contextId, objectType: "LAB_TEST_RECORD", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-lab-identity" });
    const parameterObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "parameter-set-1", contextId: context.contextId, objectType: "GEOTECHNICAL_PARAMETER_SET", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-parameter-identity" });
    const r2 = createD3R2Store(r1);
    const program = recordInvestigationProgram(r2, actor, { investigationProgramId: "program-1", contextId: context.contextId, objectId: site.objectId, purpose: "Factual site investigation campaign", campaignRef: "campaign-2026-a", method: "BOREHOLE_DRILLING", provider: "Field provider A", investigationDate: "2026-04-01", provenanceRef: "prov-program", citedCurrentness: "CURRENT" });
    const location = recordInvestigationLocationContext(r2, actor, { locationContextId: "location-context-1", investigationProgramId: program.investigationProgramId, contextId: context.contextId, objectId: locationObject.objectId, locationEvidenceRef: "survey-control-sheet-14", provenanceRef: "prov-location", citedCurrentness: "CURRENT" });
    const boreholeEvidence = recordBoreholeEvidenceContext(r2, actor, { boreholeEvidenceId: "borehole-evidence-1", investigationProgramId: program.investigationProgramId, contextId: context.contextId, objectId: borehole.objectId, sourceLogRef: "bh-log-001", drillingRecordRef: "drill-sheet-001", provider: "Driller A", investigationDate: "2026-04-03", provenanceRef: "prov-borehole-evidence", citedCurrentness: "CURRENT" });
    const boreholeLog = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-log-1", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "BOREHOLE_LOG", sourceRevision: "rev-a", provenanceRef: "prov-log", citedCurrentness: "CURRENT" });
    const fieldEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-field-1", contextId: context.contextId, objectId: fieldObject.objectId, evidenceKind: "FIELD_TEST_DATA", sourceRevision: "spt-sheet-1", provenanceRef: "prov-field", citedCurrentness: "CURRENT" });
    const labEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-lab-1", contextId: context.contextId, objectId: labObject.objectId, evidenceKind: "LABORATORY_REPORT", sourceRevision: "lab-cert-1", provenanceRef: "prov-lab", citedCurrentness: "CURRENT" });
    const groundwaterEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-water-1", contextId: context.contextId, objectId: groundwaterObject.objectId, evidenceKind: "GROUNDWATER_OBSERVATION", sourceRevision: "standpipe-1", provenanceRef: "prov-water", citedCurrentness: "CURRENT" });
    const r3 = createD3R3Store(r2);
    const stratigraphy = recordStratigraphicInterpretation(r3, actor, { stratigraphyId: "layer-interpretation-1", contextId: context.contextId, objectId: layer.objectId, locationContextId: location.locationContextId, boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId, evidenceReferenceIds: [boreholeLog.evidenceReferenceId], depthInterval: "0.0 m to 2.4 m as marked on bh-log-001", materialDescription: "brown sand described on bh-log-001", layerSequence: "1", interpretationSource: "logged by field geologist on bh-log-001", limitations: "Description is limited to the supplied log interval", provenanceRef: "prov-layer", citedCurrentness: "CURRENT" });
    const material = recordMaterialClassificationContext(r3, actor, { materialClassificationId: "material-classification-1", contextId: context.contextId, objectId: materialObject.objectId, layerInterpretationId: stratigraphy.stratigraphyId, evidenceReferenceIds: [boreholeLog.evidenceReferenceId], classificationSystem: "USCS as cited on bh-log-001", classificationResult: "SP as written on bh-log-001", materialDescription: "poorly graded sand as written on bh-log-001", limitations: "Classification is the supplied log entry", provenanceRef: "prov-material", citedCurrentness: "CURRENT" });
    const groundwater = recordGroundwaterContext(r3, actor, { groundwaterContextId: "groundwater-context-1", contextId: context.contextId, objectId: groundwaterObject.objectId, locationContextId: location.locationContextId, evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId], observedWaterLevel: "1.8 m below ground as read on standpipe-1", observationDate: "2026-04-04", measurementMethod: "standpipe reading on standpipe-1", interpretedContext: "water level as written on standpipe-1", seasonalLimitation: "Single reading only", limitations: "Observation is the supplied reading", provenanceRef: "prov-groundwater", citedCurrentness: "CURRENT" });
    const r4 = createD3R4Store(r3);
    const field = recordFieldTestResult(r4, actor, { fieldTestId: "field-test-1", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, stratigraphyId: stratigraphy.stratigraphyId, depthOrElevation: "1.5 m as written on spt-sheet-1", methodReference: "ASTM D1586 as cited on spt-sheet-1", measuredResult: "12", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "Supplied blow count only", provenanceRef: "prov-spt", citedCurrentness: "CURRENT" });
    const lab = recordLaboratoryTestResult(r4, actor, { labTestId: "lab-test-1", contextId: context.contextId, objectId: labObject.objectId, testCategory: "DIRECT_SHEAR", materialClassificationId: material.materialClassificationId, specimenReference: "specimen-16 as labeled on lab-cert-1", methodReference: "ASTM D3080 as cited on lab-cert-1", measuredResult: "32", unit: "degrees", evidenceReferenceIds: [labEvidence.evidenceReferenceId], provider: "Laboratory A", testDate: "2026-04-06", limitations: "Supplied shear result only", provenanceRef: "prov-shear", citedCurrentness: "CURRENT" });
    const fieldFingerprint = field.fingerprint;
    const stratigraphyFingerprint = stratigraphy.fingerprint;
    const groundwaterFingerprint = groundwater.fingerprint;
    const store = createD3R5Store(r4);
    const adopted = recordGeotechnicalParameter(store, actor, {
      parameterId: "parameter-phi-1",
      parameterCategory: "EFFECTIVE_FRICTION_ANGLE",
      parameterStatus: "GOVERNED_ADOPTED",
      contextId: context.contextId,
      objectId: parameterObject.objectId,
      stratigraphyId: stratigraphy.stratigraphyId,
      materialClassificationId: material.materialClassificationId,
      labTestId: lab.labTestId,
      evidenceReferenceIds: [labEvidence.evidenceReferenceId],
      value: "30",
      unit: "degrees",
      citedMeasuredResult: "32",
      citedUnit: "degrees",
      sourceBasis: "DIRECT_TEST_RESULT",
      derivationMethod: "Adopted below the laboratory peak as written in the parameter selection note",
      applicability: "drained effective-stress strength for layer 1 between 0.0 m and 2.4 m",
      limitations: "Adopted value is not a validated design parameter",
      provenanceRef: "prov-phi",
      citedCurrentness: "CURRENT",
    });
    expect(adopted.authoritative).toBe(true);
    expect(adopted.candidate).toBe(false);
    expect(adopted.validatedDesignParameter).toBe(false);
    expect(adopted.engineeringValidated).toBe(false);
    expect(adopted.conformant).toBe(false);
    expect(adopted.approved).toBe(false);
    expect(adopted.certified).toBe(false);
    expect(adopted.testResult).toBe(false);
    expect(adopted.value).toBe("30");
    expect(adopted.labTestId).toBe(lab.labTestId);
    expect(field.engineeringParameter).toBe(false);
    expect(field.fingerprint).toBe(fieldFingerprint);
    expect(stratigraphy.fingerprint).toBe(stratigraphyFingerprint);
    expect(groundwater.fingerprint).toBe(groundwaterFingerprint);
    expect(adopted.fingerprint).toBe(fingerprintCanonical({
      parameterId: "parameter-phi-1", parameterCategory: "EFFECTIVE_FRICTION_ANGLE", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, stratigraphyId: stratigraphy.stratigraphyId, materialClassificationId: material.materialClassificationId, groundwaterContextId: null, fieldTestId: null, labTestId: lab.labTestId, evidenceReferenceIds: ["evidence-lab-1"], value: "30", unit: "degrees", originalValue: null, originalUnit: null, transformationProvenance: null, sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "Adopted below the laboratory peak as written in the parameter selection note", applicability: "drained effective-stress strength for layer 1 between 0.0 m and 2.4 m", limitations: "Adopted value is not a validated design parameter", provenanceRef: "prov-phi", citedCurrentness: "CURRENT", authority: D3_CONTEXT_AUTHORITY, aiGeneratedCandidate: false, predecessorParameterId: null,
    }));
    expect(recordGeotechnicalParameter(store, actor, { parameterId: "parameter-phi-1", parameterCategory: "EFFECTIVE_FRICTION_ANGLE", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, stratigraphyId: stratigraphy.stratigraphyId, materialClassificationId: material.materialClassificationId, labTestId: lab.labTestId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "30", unit: "degrees", citedMeasuredResult: "32", citedUnit: "degrees", sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "Adopted below the laboratory peak as written in the parameter selection note", applicability: "drained effective-stress strength for layer 1 between 0.0 m and 2.4 m", limitations: "Adopted value is not a validated design parameter", provenanceRef: "prov-phi", citedCurrentness: "CURRENT" }).fingerprint).toBe(adopted.fingerprint);

    const candidate = recordGeotechnicalParameter(store, actor, {
      parameterId: "parameter-phi-candidate", parameterCategory: "FRICTION_ANGLE", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, fieldTestId: field.fieldTestId, evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], value: "28", unit: "degrees", sourceBasis: "CORRELATION", derivationMethod: "Supplied correlation reference on the parameter note, not executed here", applicability: "candidate total-stress angle for the same 1.5 m SPT interval only", limitations: "Candidate remains non-authoritative", provenanceRef: "prov-candidate", citedCurrentness: "CURRENT", aiGenerated: true,
    });
    expect(candidate.candidate).toBe(true);
    expect(candidate.authoritative).toBe(false);
    expect(candidate.aiGeneratedCandidate).toBe(true);
    expect(candidate.validatedDesignParameter).toBe(false);
    expect(candidate.value).not.toBe(field.measuredResult);

    const water = recordGeotechnicalParameter(store, actor, {
      parameterId: "parameter-water-1", parameterCategory: "GROUNDWATER_DESIGN_ASSUMPTION", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, groundwaterContextId: groundwater.groundwaterContextId, evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId, boreholeLog.evidenceReferenceId], value: "1.8", unit: "m below ground", sourceBasis: "PRIOR_ENGINEERING_INTERPRETATION", derivationMethod: "Explicit adoption note citing standpipe-1", applicability: "temporary construction stage at the standpipe location only", limitations: "Single reading; not a design groundwater level validation", provenanceRef: "prov-water-parameter", citedCurrentness: "CURRENT",
    });
    expect(water.groundwaterContextId).toBe(groundwater.groundwaterContextId);
    expect(groundwater.fingerprint).toBe(groundwaterFingerprint);
    expect(groundwater.engineeringValidated).toBe(false);

    const converted = recordGeotechnicalParameter(store, actor, {
      parameterId: "parameter-unit-weight", parameterCategory: "UNIT_WEIGHT", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, materialClassificationId: material.materialClassificationId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "18", unit: "kN/m3", originalValue: "1800", originalUnit: "kg/m3", transformationProvenance: "unit statement on the parameter note", sourceBasis: "PUBLISHED_METHOD", derivationMethod: "Published bulk unit-weight table cited on the note", applicability: "bulk unit weight for the SP layer only", limitations: "Converted representation keeps the original value", provenanceRef: "prov-weight", citedCurrentness: "CURRENT",
    });
    expect(converted.originalValue).toBe("1800");
    expect(converted.originalUnit).toBe("kg/m3");
    expect(converted.unit).toBe("kN/m3");

    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-no-source", parameterCategory: "COHESION", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [], value: "0", unit: "kPa", sourceBasis: "GOVERNED_ASSUMPTION", derivationMethod: "assumption note", applicability: "layer 1 only", limitations: "missing source", provenanceRef: "prov-missing", citedCurrentness: "CURRENT" })).toThrow(/PARAMETER_WITHOUT_SOURCE/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-no-basis", parameterCategory: "COHESION", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "0", unit: "kPa", sourceBasis: "", derivationMethod: "assumption note", applicability: "layer 1 only", limitations: "missing basis", provenanceRef: "prov-basis", citedCurrentness: "CURRENT" })).toThrow(/SOURCE_BASIS_REQUIRED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-no-method", parameterCategory: "COHESION", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "0", unit: "kPa", sourceBasis: "STANDARD", derivationMethod: "", applicability: "layer 1 only", limitations: "missing method", provenanceRef: "prov-method", citedCurrentness: "CURRENT" })).toThrow(/DERIVATION_METHOD_REQUIRED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-no-unit", parameterCategory: "PERMEABILITY", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "1e-6", unit: "", sourceBasis: "STANDARD", derivationMethod: "cited standard clause", applicability: "layer 1 only", limitations: "missing unit", provenanceRef: "prov-unit", citedCurrentness: "CURRENT" })).toThrow(/PARAMETER_UNIT_REQUIRED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-broad", parameterCategory: "SUBGRADE", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "8", unit: "percent", sourceBasis: "PROJECT_SPECIFIC_JUDGMENT", derivationMethod: "judgment note", applicability: "all", limitations: "too broad", provenanceRef: "prov-broad", citedCurrentness: "CURRENT" })).toThrow(/APPLICABILITY_REQUIRED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-no-test", parameterCategory: "UNDRAINED_SHEAR_STRENGTH", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "40", unit: "kPa", sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "direct citation", applicability: "layer 1 undrained", limitations: "missing test", provenanceRef: "prov-notest", citedCurrentness: "CURRENT" })).toThrow(/R4_TEST_REFERENCE_REQUIRED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-validated", parameterCategory: "STIFFNESS_MODULUS", parameterStatus: "VALIDATED_DESIGN", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "20", unit: "MPa", sourceBasis: "PUBLISHED_METHOD", derivationMethod: "published chart", applicability: "layer 1 only", limitations: "not validated here", provenanceRef: "prov-validated", citedCurrentness: "CURRENT" })).toThrow(/VALIDATED_PARAMETER_NOT_IN_R5/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-adopt-validated", parameterCategory: "POISSON_RATIO", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "0.3", unit: "dimensionless", sourceBasis: "GOVERNED_ASSUMPTION", derivationMethod: "assumption note", applicability: "layer 1 drained", limitations: "adoption is not validation", provenanceRef: "prov-flag", citedCurrentness: "CURRENT", validated: true })).toThrow(/VALIDATION_NOT_IN_R5/);
    expect(() => recordGeotechnicalParameter(store, { ...actor, actorId: "AI_assistant" }, { parameterId: "parameter-ai", parameterCategory: "COHESION", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "5", unit: "kPa", sourceBasis: "GOVERNED_ASSUMPTION", derivationMethod: "note", applicability: "layer 1", limitations: "ai actor", provenanceRef: "prov-ai", citedCurrentness: "CURRENT" })).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalParameter(store, { ...actor, authority: "ADMIN" }, { parameterId: "parameter-admin", parameterCategory: "COHESION", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "5", unit: "kPa", sourceBasis: "GOVERNED_ASSUMPTION", derivationMethod: "note", applicability: "layer 1", limitations: "admin", provenanceRef: "prov-admin", citedCurrentness: "CURRENT" })).toThrow(/ADMIN_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-invent", parameterCategory: "COHESION", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "99", unit: "kPa", sourceBasis: "GOVERNED_ASSUMPTION", derivationMethod: "note", applicability: "layer 1", limitations: "invented", provenanceRef: "prov-invent", citedCurrentness: "CURRENT", inventAuthoritative: true })).toThrow(/AI_CANNOT_INVENT_AUTHORITATIVE_PARAMETER/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-promote", parameterCategory: "FRICTION_ANGLE", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, fieldTestId: field.fieldTestId, evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], value: "28", unit: "degrees", sourceBasis: "CORRELATION", derivationMethod: "note", applicability: "another interval", limitations: "promotion", provenanceRef: "prov-promote", citedCurrentness: "CURRENT", aiGenerated: true })).toThrow(/AI_CANNOT_PROMOTE_CANDIDATE/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-auto", parameterCategory: "FRICTION_ANGLE", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, fieldTestId: field.fieldTestId, evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], value: "32", unit: "degrees", sourceBasis: "CORRELATION", derivationMethod: "auto", applicability: "spt interval", limitations: "auto", provenanceRef: "prov-auto", citedCurrentness: "CURRENT", autoPromoteFromTest: true })).toThrow(/R4_TEST_NOT_AUTO_PROMOTED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-bearing", parameterCategory: "BEARING_RELATED", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "150", unit: "kPa", sourceBasis: "PUBLISHED_METHOD", derivationMethod: "cited chart", applicability: "pad footing at layer 1", limitations: "record only", provenanceRef: "prov-bearing", citedCurrentness: "CURRENT", bearingCapacity: true })).toThrow(/BEARING_CAPACITY_NOT_IN_R5/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-recommend", parameterCategory: "SETTLEMENT_RELATED", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "25", unit: "mm", sourceBasis: "PUBLISHED_METHOD", derivationMethod: "cited method", applicability: "layer 1 footing", limitations: "not a recommendation", provenanceRef: "prov-recommend", citedCurrentness: "CURRENT", foundationRecommendation: true })).toThrow(/FOUNDATION_RECOMMENDATION_NOT_IN_R5/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-r3", parameterCategory: "COMPRESSIBILITY", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "0.2", unit: "dimensionless", sourceBasis: "STANDARD", derivationMethod: "cited clause", applicability: "layer 1", limitations: "must not rewrite the layer", provenanceRef: "prov-r3", citedCurrentness: "CURRENT", mutateStratigraphy: true })).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-propagate", parameterCategory: "LATERAL_SOIL", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "0.4", unit: "dimensionless", sourceBasis: "STANDARD", derivationMethod: "cited clause", applicability: "layer 1 only", limitations: "do not spread", provenanceRef: "prov-spread", citedCurrentness: "CURRENT", propagateOutsideApplicability: true })).toThrow(/PARAMETER_NOT_PROPAGATED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-cross", parameterCategory: "ROCK", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "50", unit: "MPa", sourceBasis: "STANDARD", derivationMethod: "cited clause", applicability: "rock interval only", limitations: "cross", provenanceRef: "prov-cross", citedCurrentness: "CURRENT", tenantId: "tenant-b" })).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-floating", parameterCategory: "CONSOLIDATION", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, labTestId: "latest", evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "0.01", unit: "m2/year", sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "direct citation", applicability: "layer 1", limitations: "floating", provenanceRef: "prov-floating", citedCurrentness: "CURRENT" })).toThrow(/R4_LAB_TEST_REQUIRED/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-mismatch", parameterCategory: "EFFECTIVE_COHESION", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, labTestId: lab.labTestId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "2", unit: "kPa", citedMeasuredResult: "99", sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "direct citation", applicability: "layer 1 drained", limitations: "mismatch", provenanceRef: "prov-mismatch", citedCurrentness: "CURRENT" })).toThrow(/SOURCE_VALUE_MISMATCH/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-duplicate-authority", parameterCategory: "EFFECTIVE_FRICTION_ANGLE", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, labTestId: lab.labTestId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "31", unit: "degrees", sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "second adoption note", applicability: "drained effective-stress strength for layer 1 between 0.0 m and 2.4 m", limitations: "duplicate authority", provenanceRef: "prov-dup", citedCurrentness: "CURRENT" })).toThrow(/DUPLICATE_AUTHORITATIVE_PARAMETER/);
    expect(() => deriveParameterAutomatically()).toThrow(/AUTOMATIC_DERIVATION_NOT_IN_R5/);
    expect(() => repointGeotechnicalParameter()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateGeotechnicalParameter()).toThrow(/R5_MUTATION_REJECTED/);
    expect(() => { (adopted as { value: string }).value = "silent"; }).toThrow();
    expect(adopted.value).toBe("30");
    const preserved = adopted.fingerprint;
    const revised = recordGeotechnicalParameter(store, actor, { parameterId: "parameter-phi-1b", parameterCategory: "EFFECTIVE_FRICTION_ANGLE", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, stratigraphyId: stratigraphy.stratigraphyId, materialClassificationId: material.materialClassificationId, labTestId: lab.labTestId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "29", unit: "degrees", sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "Revised adoption note", applicability: "drained effective-stress strength for layer 1 between 0.0 m and 2.4 m", limitations: "Successor record", provenanceRef: "prov-phi-b", citedCurrentness: "CURRENT", predecessorParameterId: adopted.parameterId });
    const historical = store.parameters.find((row) => row.parameterId === adopted.parameterId);
    expect(revised.recordStatus).toBe("CURRENT");
    expect(historical?.fingerprint).toBe(preserved);
    expect(historical?.evidenceReferenceIds).toEqual(["evidence-lab-1"]);
    expect(historical?.labTestId).toBe(lab.labTestId);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    const replacement = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-lab-1b", contextId: context.contextId, objectId: labObject.objectId, evidenceKind: "LABORATORY_REPORT", sourceRevision: "lab-cert-2", provenanceRef: "prov-lab-b", citedCurrentness: "CURRENT", predecessorEvidenceReferenceId: labEvidence.evidenceReferenceId });
    expect(historical?.evidenceReferenceIds).not.toContain(replacement.evidenceReferenceId);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-stale-source", parameterCategory: "DRY_DENSITY", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "16", unit: "kN/m3", sourceBasis: "STANDARD", derivationMethod: "cited clause", applicability: "layer 1", limitations: "stale source", provenanceRef: "prov-stale", citedCurrentness: "CURRENT" })).toThrow(/R2_EVIDENCE_NOT_CURRENT/);
    expect(() => recordGeotechnicalParameter(store, actor, { parameterId: "parameter-spoof", parameterCategory: "SATURATED_DENSITY", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [replacement.evidenceReferenceId], value: "20", unit: "kN/m3", sourceBasis: "STANDARD", derivationMethod: "cited clause", applicability: "layer 1 saturated", limitations: "spoof", provenanceRef: "prov-spoof", citedCurrentness: "CURRENT", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(field.fingerprint).toBe(fieldFingerprint);
    expect(stratigraphy.materialDescription).toBe("brown sand described on bh-log-001");
    expect(material.classificationResult).toBe("SP as written on bh-log-001");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "geotechnical-parameter-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "geotechnical-parameter-context.ts"), source)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R5.GEOTECHNICAL_PARAMETER_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R6.FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
