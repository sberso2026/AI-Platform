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
import { D3_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD3R4Store, recordFieldTestResult, recordLaboratoryTestResult } from "./field-lab-test-context";
import { D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY as R5_SLOPE_READY, D3_R6_STARTED, D3_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD3R5Store, recordGeotechnicalParameter } from "./geotechnical-parameter-context";
import {
  AI_CAN_AUTOMATICALLY_GENERATE_AUTHORITATIVE_GEOTECHNICAL_RECOMMENDATION,
  AI_CAN_PROMOTE_CANDIDATE_RECOMMENDATION_TO_AUTHORITATIVE,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D2_REOPENED,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_D9_RUNTIME_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D3_EARTH_PRESSURE_RUNTIME_COUNT,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D3_EQUALS_D2_CIVIL_AUTHORITY,
  D3_EXCAVATION_GEOTECHNICAL_CONTEXT_IMPLEMENTED,
  D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_CONTEXT_EQUALS_STRUCTURAL_FOUNDATION_DESIGN,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_COUNT,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_IMPLEMENTED,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY,
  D3_FOUNDATION_GEOTECHNICAL_CONTEXT_IMPLEMENTED,
  D3_GROUND_IMPROVEMENT_CONTEXT_IMPLEMENTED,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
  D3_PILE_CAPACITY_RUNTIME_COUNT,
  D3_R1_IDENTITY_REUSED,
  D3_R2_INVESTIGATION_EVIDENCE_REUSED,
  D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED,
  D3_R4_FIELD_LAB_TEST_REUSED,
  D3_R5_PARAMETER_CONTEXT_REUSED,
  D3_R6_APPLICABILITY_EXPLICIT,
  D3_R6_AUTO_CREATES_R5_PARAMETER,
  D3_R6_AUTO_MUTATES_R5_PARAMETER,
  D3_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY,
  D3_R6_AUTO_REPOINTED,
  D3_R6_AUTO_VALIDATES_R5_PARAMETER,
  D3_R6_CANONICAL_NEXT_PHASE,
  D3_R6_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D3_R6_HISTORY_PRESERVED,
  D3_R6_LIMITATIONS_EXPLICIT,
  D3_R6_MATURITY,
  D3_R6_NEXT_PHASE_TYPE,
  D3_R6_PROVENANCE_PRESERVED,
  D3_R6_PROVENANCE_REQUIRED,
  D3_R6_RECOMMENDATION_BASIS_REQUIRED,
  D3_R6_RECOMMENDATION_BASIS_TRACEABLE,
  D3_R6_REPLAY_PROTECTION_IMPLEMENTED,
  D3_R6_SPOOFING_PROTECTION_IMPLEMENTED,
  D3_R6_STATUS,
  D3_R7_STARTED,
  D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SLOPE_GEOHAZARD_CONTEXT_IMPLEMENTED,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXACT_D3_R1_R5_REFERENCE_REQUIRED,
  FLOATING_R6_SOURCE_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  RECOMMENDATION_EQUALS_APPROVAL,
  RECOMMENDATION_EQUALS_CERTIFICATION,
  RECOMMENDATION_EQUALS_ENGINEERING_VALIDATED,
  RECOMMENDATION_WITHOUT_GOVERNED_BASIS_AUTO_ACCEPTED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R6_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D3_R6_SCOPE_ENFORCED,
  calculateGeotechnicalResponse,
  createD3R6Store,
  mutateFoundationExcavationSlope,
  recordExcavationGeotechnicalContext,
  recordFoundationGeotechnicalContext,
  recordGroundImprovementContext,
  recordSlopeGeohazardContext,
  repointFoundationExcavationSlope,
} from "./foundation-excavation-slope-context";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

describe("EOS-D3-R6 foundation excavation and slope context", () => {
  it("records supplied foundation, excavation, slope and ground-improvement context without calculating", () => {
    expect(D3_R6_STATUS).toBe("FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT_IMPLEMENTED");
    expect(D3_R6_MATURITY).toBe("FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT_IMPLEMENTED");
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R6_STARTED).toBe(false);
    expect(R5_SLOPE_READY).toBe(false);
    expect(D3_R7_STARTED).toBe(false);
    expect(D3_R1_IDENTITY_REUSED).toBe(true);
    expect(D3_R2_INVESTIGATION_EVIDENCE_REUSED).toBe(true);
    expect(D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED).toBe(true);
    expect(D3_R4_FIELD_LAB_TEST_REUSED).toBe(true);
    expect(D3_R5_PARAMETER_CONTEXT_REUSED).toBe(true);
    expect(EXACT_D3_R1_R5_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_R6_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_COUNT).toBe(1);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY).toBe(true);
    expect(D3_FOUNDATION_GEOTECHNICAL_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_EXCAVATION_GEOTECHNICAL_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_SLOPE_GEOHAZARD_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_GROUND_IMPROVEMENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_FOUNDATION_CONTEXT_EQUALS_STRUCTURAL_FOUNDATION_DESIGN).toBe(false);
    expect(D3_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D3_R6_RECOMMENDATION_BASIS_REQUIRED).toBe(true);
    expect(D3_R6_RECOMMENDATION_BASIS_TRACEABLE).toBe(true);
    expect(RECOMMENDATION_WITHOUT_GOVERNED_BASIS_AUTO_ACCEPTED).toBe(false);
    expect(AI_CAN_AUTOMATICALLY_GENERATE_AUTHORITATIVE_GEOTECHNICAL_RECOMMENDATION).toBe(false);
    expect(AI_CAN_PROMOTE_CANDIDATE_RECOMMENDATION_TO_AUTHORITATIVE).toBe(false);
    expect(AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(RECOMMENDATION_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(RECOMMENDATION_EQUALS_APPROVAL).toBe(false);
    expect(RECOMMENDATION_EQUALS_CERTIFICATION).toBe(false);
    expect(D3_R6_APPLICABILITY_EXPLICIT).toBe(true);
    expect(D3_R6_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D3_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY).toBe(false);
    expect(D3_R6_AUTO_MUTATES_R5_PARAMETER).toBe(false);
    expect(D3_R6_AUTO_CREATES_R5_PARAMETER).toBe(false);
    expect(D3_R6_AUTO_VALIDATES_R5_PARAMETER).toBe(false);
    expect([
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_PILE_CAPACITY_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_EARTH_PRESSURE_RUNTIME_COUNT,
      D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
      D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
      D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
      D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D3_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(14).fill(0));
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_R6_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_R6_PROVENANCE_PRESERVED).toBe(true);
    expect(D3_R6_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D3_R6_MUTATION_ALLOWED).toBe(false);
    expect(D3_R6_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R6_SCOPE_ENFORCED).toBe(true);
    expect(D3_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D3_R6_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R6_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
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
    expect(D3_R6_CANONICAL_NEXT_PHASE).toBe("EOS-D3-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE");
    expect(D3_R6_NEXT_PHASE_TYPE).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE");
    expect(D3_R6_CANONICAL_NEXT_PHASE_SCOPE).toContain("without inferred dependency propagation");

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
    const foundationObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "foundation-context-1", contextId: context.contextId, objectType: "FOUNDATION_GEOTECHNICAL_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-foundation-identity" });
    const excavationObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "excavation-context-1", contextId: context.contextId, objectType: "EXCAVATION_GEOTECHNICAL_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-excavation-identity" });
    const slopeObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "slope-context-1", contextId: context.contextId, objectType: "SLOPE_GEOTECHNICAL_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-slope-identity" });
    const improvementObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "improvement-context-1", contextId: context.contextId, objectType: "GROUND_IMPROVEMENT_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-improvement-identity" });
    const r2 = createD3R2Store(r1);
    const program = recordInvestigationProgram(r2, actor, { investigationProgramId: "program-1", contextId: context.contextId, objectId: site.objectId, purpose: "Factual site investigation campaign", campaignRef: "campaign-2026-a", method: "BOREHOLE_DRILLING", provider: "Field provider A", investigationDate: "2026-04-01", provenanceRef: "prov-program", citedCurrentness: "CURRENT" });
    const location = recordInvestigationLocationContext(r2, actor, { locationContextId: "location-context-1", investigationProgramId: program.investigationProgramId, contextId: context.contextId, objectId: locationObject.objectId, locationEvidenceRef: "survey-control-sheet-14", provenanceRef: "prov-location", citedCurrentness: "CURRENT" });
    const boreholeEvidence = recordBoreholeEvidenceContext(r2, actor, { boreholeEvidenceId: "borehole-evidence-1", investigationProgramId: program.investigationProgramId, contextId: context.contextId, objectId: borehole.objectId, sourceLogRef: "bh-log-001", drillingRecordRef: "drill-sheet-001", provider: "Driller A", investigationDate: "2026-04-03", provenanceRef: "prov-borehole-evidence", citedCurrentness: "CURRENT" });
    const boreholeLog = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-log-1", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "BOREHOLE_LOG", sourceRevision: "rev-a", provenanceRef: "prov-log", citedCurrentness: "CURRENT" });
    const fieldEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-field-1", contextId: context.contextId, objectId: fieldObject.objectId, evidenceKind: "FIELD_TEST_DATA", sourceRevision: "spt-sheet-1", provenanceRef: "prov-field", citedCurrentness: "CURRENT" });
    const labEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-lab-1", contextId: context.contextId, objectId: labObject.objectId, evidenceKind: "LABORATORY_REPORT", sourceRevision: "lab-cert-1", provenanceRef: "prov-lab", citedCurrentness: "CURRENT" });
    const reportEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-report-1", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "FIELD_SHEET", sourceRevision: "geotech-note-1", provenanceRef: "prov-report", citedCurrentness: "CURRENT" });
    const groundwaterEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-water-1", contextId: context.contextId, objectId: groundwaterObject.objectId, evidenceKind: "GROUNDWATER_OBSERVATION", sourceRevision: "standpipe-1", provenanceRef: "prov-water", citedCurrentness: "CURRENT" });
    const r3 = createD3R3Store(r2);
    const stratigraphy = recordStratigraphicInterpretation(r3, actor, { stratigraphyId: "layer-interpretation-1", contextId: context.contextId, objectId: layer.objectId, locationContextId: location.locationContextId, boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId, evidenceReferenceIds: [boreholeLog.evidenceReferenceId], depthInterval: "0.0 m to 2.4 m as marked on bh-log-001", materialDescription: "brown sand described on bh-log-001", layerSequence: "1", interpretationSource: "logged by field geologist on bh-log-001", limitations: "Description is limited to the supplied log interval", provenanceRef: "prov-layer", citedCurrentness: "CURRENT" });
    const material = recordMaterialClassificationContext(r3, actor, { materialClassificationId: "material-classification-1", contextId: context.contextId, objectId: materialObject.objectId, layerInterpretationId: stratigraphy.stratigraphyId, evidenceReferenceIds: [boreholeLog.evidenceReferenceId], classificationSystem: "USCS as cited on bh-log-001", classificationResult: "SP as written on bh-log-001", materialDescription: "poorly graded sand as written on bh-log-001", limitations: "Classification is the supplied log entry", provenanceRef: "prov-material", citedCurrentness: "CURRENT" });
    const groundwater = recordGroundwaterContext(r3, actor, { groundwaterContextId: "groundwater-context-1", contextId: context.contextId, objectId: groundwaterObject.objectId, locationContextId: location.locationContextId, evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId], observedWaterLevel: "1.8 m below ground as read on standpipe-1", observationDate: "2026-04-04", measurementMethod: "standpipe reading on standpipe-1", interpretedContext: "water level as written on standpipe-1", seasonalLimitation: "Single reading only", limitations: "Observation is the supplied reading", provenanceRef: "prov-groundwater", citedCurrentness: "CURRENT" });
    const r4 = createD3R4Store(r3);
    recordFieldTestResult(r4, actor, { fieldTestId: "field-test-1", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, stratigraphyId: stratigraphy.stratigraphyId, depthOrElevation: "1.5 m as written on spt-sheet-1", methodReference: "ASTM D1586 as cited on spt-sheet-1", measuredResult: "12", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "Supplied blow count only", provenanceRef: "prov-spt", citedCurrentness: "CURRENT" });
    const lab = recordLaboratoryTestResult(r4, actor, { labTestId: "lab-test-1", contextId: context.contextId, objectId: labObject.objectId, testCategory: "DIRECT_SHEAR", materialClassificationId: material.materialClassificationId, specimenReference: "specimen-16 as labeled on lab-cert-1", methodReference: "ASTM D3080 as cited on lab-cert-1", measuredResult: "32", unit: "degrees", evidenceReferenceIds: [labEvidence.evidenceReferenceId], provider: "Laboratory A", testDate: "2026-04-06", limitations: "Supplied shear result only", provenanceRef: "prov-shear", citedCurrentness: "CURRENT" });
    const r5 = createD3R5Store(r4);
    const parameter = recordGeotechnicalParameter(r5, actor, { parameterId: "parameter-phi-1", parameterCategory: "EFFECTIVE_FRICTION_ANGLE", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, stratigraphyId: stratigraphy.stratigraphyId, materialClassificationId: material.materialClassificationId, labTestId: lab.labTestId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "30", unit: "degrees", sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "Adopted below the laboratory peak as written in the parameter selection note", applicability: "drained effective-stress strength for layer 1 between 0.0 m and 2.4 m", limitations: "Adopted value is not a validated design parameter", provenanceRef: "prov-phi", citedCurrentness: "CURRENT" });
    const parameterFingerprint = parameter.fingerprint;
    const stratigraphyFingerprint = stratigraphy.fingerprint;
    const groundwaterFingerprint = groundwater.fingerprint;
    const store = createD3R6Store(r5);
    const foundation = recordFoundationGeotechnicalContext(store, actor, {
      contextRecordId: "foundation-record-1",
      contextId: context.contextId,
      objectId: foundationObject.objectId,
      condition: "PERMANENT",
      applicability: "pad footings on layer 1 between 0.0 m and 2.4 m only",
      limitations: "Geotechnical context is not a structural foundation design",
      provenanceRef: "prov-foundation",
      citedCurrentness: "CURRENT",
      sourceBasis: "R5_PARAMETER",
      basisStatement: "Founding note cites parameter-phi-1 and geotech-note-1",
      evidenceReferenceIds: [reportEvidence.evidenceReferenceId],
      parameterIds: [parameter.parameterId],
      stratigraphyId: stratigraphy.stratigraphyId,
      foundingDepthOrRange: "1.2 m to 1.8 m as written on geotech-note-1",
      recommendationText: "Found pad footings within the stated depth range on layer 1",
      recommendationStatus: "GOVERNED_ADOPTED",
    });
    expect(foundation.structuralFoundationDesign).toBe(false);
    expect(foundation.authoritativeRecommendation).toBe(true);
    expect(foundation.engineeringValidated).toBe(false);
    expect(foundation.approved).toBe(false);
    expect(foundation.certified).toBe(false);
    expect(foundation.parameterIds).toEqual([parameter.parameterId]);
    expect(parameter.fingerprint).toBe(parameterFingerprint);
    expect(parameter.value).toBe("30");
    expect(stratigraphy.fingerprint).toBe(stratigraphyFingerprint);
    expect(foundation.fingerprint).toBe(fingerprintCanonical({
      contextRecordId: "foundation-record-1", contextKind: "FOUNDATION", contextId: context.contextId, objectId: foundationObject.objectId, objectType: "FOUNDATION_GEOTECHNICAL_CONTEXT", condition: "PERMANENT", applicability: "pad footings on layer 1 between 0.0 m and 2.4 m only", limitations: "Geotechnical context is not a structural foundation design", provenanceRef: "prov-foundation", citedCurrentness: "CURRENT", sourceBasis: "R5_PARAMETER", basisStatement: "Founding note cites parameter-phi-1 and geotech-note-1", evidenceReferenceIds: ["evidence-report-1"], parameterIds: ["parameter-phi-1"], stratigraphyId: stratigraphy.stratigraphyId, materialClassificationId: null, groundwaterContextId: null, fieldTestId: null, labTestId: null, foundingDepthOrRange: "1.2 m to 1.8 m as written on geotech-note-1", excavationDepthOrRange: null, hazardObservation: null, improvementCategory: null, recommendationText: "Found pad footings within the stated depth range on layer 1", recommendationStatus: "GOVERNED_ADOPTED", aiGeneratedCandidate: false, authority: D3_CONTEXT_AUTHORITY, predecessorContextRecordId: null,
    }));
    expect(recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-record-1", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "pad footings on layer 1 between 0.0 m and 2.4 m only", limitations: "Geotechnical context is not a structural foundation design", provenanceRef: "prov-foundation", citedCurrentness: "CURRENT", sourceBasis: "R5_PARAMETER", basisStatement: "Founding note cites parameter-phi-1 and geotech-note-1", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], parameterIds: [parameter.parameterId], stratigraphyId: stratigraphy.stratigraphyId, foundingDepthOrRange: "1.2 m to 1.8 m as written on geotech-note-1", recommendationText: "Found pad footings within the stated depth range on layer 1", recommendationStatus: "GOVERNED_ADOPTED" }).fingerprint).toBe(foundation.fingerprint);

    const excavation = recordExcavationGeotechnicalContext(store, actor, {
      contextRecordId: "excavation-record-1", contextId: context.contextId, objectId: excavationObject.objectId, condition: "TEMPORARY", applicability: "temporary trench beside borehole-1 only", limitations: "Constraint record does not design excavation support", provenanceRef: "prov-excavation", citedCurrentness: "CURRENT", sourceBasis: "R3_INTERPRETATION", basisStatement: "Excavation note cites standpipe-1", evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId], groundwaterContextId: groundwater.groundwaterContextId, excavationDepthOrRange: "2.0 m as written on the excavation note",
    });
    expect(excavation.contextKind).toBe("EXCAVATION");
    expect(excavation.recommendationStatus).toBe("NONE");
    expect(excavation.authoritativeRecommendation).toBe(false);
    expect(groundwater.fingerprint).toBe(groundwaterFingerprint);

    const slope = recordSlopeGeohazardContext(store, actor, {
      contextRecordId: "slope-record-1", contextId: context.contextId, objectId: slopeObject.objectId, condition: "PERMANENT", applicability: "cut slope at the north batter of layer 1 only", limitations: "Observation is not a stability analysis", provenanceRef: "prov-slope", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "Field note on bh-log-001 describes a local slump scar", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], stratigraphyId: stratigraphy.stratigraphyId, hazardObservation: "local slump scar described on bh-log-001", recommendationText: "Inspect the slump scar before the next wet season", recommendationStatus: "CANDIDATE", aiGenerated: true,
    });
    expect(slope.candidateRecommendation).toBe(true);
    expect(slope.authoritativeRecommendation).toBe(false);
    expect(slope.aiGeneratedCandidate).toBe(true);
    expect(slope.engineeringValidated).toBe(false);

    const improvement = recordGroundImprovementContext(store, actor, {
      contextRecordId: "improvement-record-1", contextId: context.contextId, objectId: improvementObject.objectId, condition: "PERMANENT", applicability: "SP layer 1 beneath the pad footprint only", limitations: "Category is supplied and is not a ground-improvement design", provenanceRef: "prov-improvement", citedCurrentness: "CURRENT", sourceBasis: "SUPPLIED_ENGINEERING_REPORT", basisStatement: "geotech-note-1 names compaction for the pad footprint", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], materialClassificationId: material.materialClassificationId, improvementCategory: "compaction as named on geotech-note-1", recommendationText: "Compact the pad footprint as stated on geotech-note-1", recommendationStatus: "GOVERNED_ADOPTED",
    });
    expect(improvement.improvementCategory).toBe("compaction as named on geotech-note-1");
    expect(improvement.structuralFoundationDesign).toBe(false);
    expect(material.classificationResult).toBe("SP as written on bh-log-001");

    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-no-basis", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 pads", limitations: "missing basis", provenanceRef: "prov-missing", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [] })).toThrow(/CONTEXT_WITHOUT_BASIS/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-no-parameter", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "another pad zone", limitations: "missing parameter", provenanceRef: "prov-noparam", citedCurrentness: "CURRENT", sourceBasis: "R5_PARAMETER", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId] })).toThrow(/R5_PARAMETER_REQUIRED/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-broad", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "all", limitations: "too broad", provenanceRef: "prov-broad", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId] })).toThrow(/APPLICABILITY_REQUIRED/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-no-limit", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 pads only", limitations: "", provenanceRef: "prov-limit", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId] })).toThrow(/LIMITATIONS_REQUIRED/);
    expect(() => recordExcavationGeotechnicalContext(store, actor, { contextRecordId: "excavation-no-depth", contextId: context.contextId, objectId: excavationObject.objectId, condition: "TEMPORARY", applicability: "another trench", limitations: "missing depth", provenanceRef: "prov-depth", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId] })).toThrow(/EXCAVATION_DEPTH_REQUIRED/);
    expect(() => recordSlopeGeohazardContext(store, actor, { contextRecordId: "slope-no-observation", contextId: context.contextId, objectId: slopeObject.objectId, condition: "PERMANENT", applicability: "another batter", limitations: "missing observation", provenanceRef: "prov-hazard", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [boreholeLog.evidenceReferenceId] })).toThrow(/HAZARD_OBSERVATION_REQUIRED/);
    expect(() => recordGroundImprovementContext(store, actor, { contextRecordId: "improvement-auto", contextId: context.contextId, objectId: improvementObject.objectId, condition: "PERMANENT", applicability: "layer 1 only", limitations: "not selected here", provenanceRef: "prov-auto-method", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], improvementCategory: "auto" })).toThrow(/IMPROVEMENT_CATEGORY_INVALID/);
    expect(() => recordFoundationGeotechnicalContext(store, { ...actor, actorId: "AI_assistant" }, { contextRecordId: "foundation-ai", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1", limitations: "ai actor", provenanceRef: "prov-ai", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId] })).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordFoundationGeotechnicalContext(store, { ...actor, authority: "ADMIN" }, { contextRecordId: "foundation-admin", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1", limitations: "admin", provenanceRef: "prov-admin", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId] })).toThrow(/ADMIN_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-invent", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 west pads", limitations: "invented", provenanceRef: "prov-invent", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], recommendationText: "Use a deeper founding level", recommendationStatus: "GOVERNED_ADOPTED", inventAuthoritative: true })).toThrow(/AI_CANNOT_INVENT_AUTHORITATIVE_RECOMMENDATION/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-promote", contextId: context.contextId, objectId: foundationObject.objectId, condition: "TEMPORARY", applicability: "temporary crane pad on layer 1", limitations: "promotion", provenanceRef: "prov-promote", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], recommendationText: "Adopt the candidate note", recommendationStatus: "GOVERNED_ADOPTED", aiGenerated: true })).toThrow(/AI_RECOMMENDATION_MUST_STAY_CANDIDATE/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-generate", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 east pads", limitations: "generated", provenanceRef: "prov-generate", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], autoGenerateRecommendation: true })).toThrow(/AUTOMATIC_RECOMMENDATION_NOT_IN_R6/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-bearing", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 south pads", limitations: "no calculation", provenanceRef: "prov-bearing", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], bearingCapacity: true })).toThrow(/BEARING_CAPACITY_NOT_IN_R6/);
    expect(() => recordExcavationGeotechnicalContext(store, actor, { contextRecordId: "excavation-support", contextId: context.contextId, objectId: excavationObject.objectId, condition: "TEMPORARY", applicability: "south trench", limitations: "no support design", provenanceRef: "prov-support", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId], excavationDepthOrRange: "1.5 m", excavationSupportDesign: true })).toThrow(/EXCAVATION_SUPPORT_DESIGN_NOT_IN_R6/);
    expect(() => recordSlopeGeohazardContext(store, actor, { contextRecordId: "slope-calc", contextId: context.contextId, objectId: slopeObject.objectId, condition: "PERMANENT", applicability: "south batter", limitations: "no analysis", provenanceRef: "prov-stability", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], hazardObservation: "tension crack noted on the field sheet", slopeStability: true })).toThrow(/SLOPE_STABILITY_NOT_IN_R6/);
    expect(() => recordGroundImprovementContext(store, actor, { contextRecordId: "improvement-design", contextId: context.contextId, objectId: improvementObject.objectId, condition: "PERMANENT", applicability: "layer 1 east", limitations: "no design", provenanceRef: "prov-design", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], improvementCategory: "stone columns as named on the note", groundImprovementDesign: true })).toThrow(/GROUND_IMPROVEMENT_DESIGN_NOT_IN_R6/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-mutate-parameter", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 north pads", limitations: "must not rewrite the parameter", provenanceRef: "prov-mutate", citedCurrentness: "CURRENT", sourceBasis: "R5_PARAMETER", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], parameterIds: [parameter.parameterId], mutateParameter: true })).toThrow(/R5_PARAMETER_NOT_MUTATED/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-d1", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 column pads", limitations: "not structural", provenanceRef: "prov-d1", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], mutateStructuralFoundation: true })).toThrow(/D1_MUTATION_REJECTED/);
    expect(() => recordExcavationGeotechnicalContext(store, actor, { contextRecordId: "excavation-d2", contextId: context.contextId, objectId: excavationObject.objectId, condition: "TEMPORARY", applicability: "west trench", limitations: "not civil design", provenanceRef: "prov-d2", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId], excavationDepthOrRange: "1.0 m", mutateCivilObject: true })).toThrow(/D2_MUTATION_REJECTED/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-cross", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 service pads", limitations: "cross", provenanceRef: "prov-cross", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], tenantId: "tenant-b" })).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-floating", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 utility pads", limitations: "floating", provenanceRef: "prov-floating", citedCurrentness: "CURRENT", sourceBasis: "R5_PARAMETER", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], parameterIds: ["latest"] })).toThrow(/R5_PARAMETER_REQUIRED/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-validated", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "layer 1 stair pads", limitations: "not validated", provenanceRef: "prov-validated", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], recommendationText: "Adopt the note", recommendationStatus: "GOVERNED_ADOPTED", validated: true })).toThrow(/VALIDATION_NOT_IN_R6/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-duplicate-authority", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "pad footings on layer 1 between 0.0 m and 2.4 m only", limitations: "second authority", provenanceRef: "prov-dup", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "a different note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], recommendationText: "A second founding instruction", recommendationStatus: "GOVERNED_ADOPTED" })).toThrow(/DUPLICATE_AUTHORITATIVE_RECOMMENDATION/);
    expect(() => calculateGeotechnicalResponse()).toThrow(/CALCULATION_NOT_IN_R6/);
    expect(() => repointFoundationExcavationSlope()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateFoundationExcavationSlope()).toThrow(/R6_MUTATION_REJECTED/);
    expect(() => { (foundation as { recommendationText: string | null }).recommendationText = "silent"; }).toThrow();
    expect(foundation.recommendationText).toBe("Found pad footings within the stated depth range on layer 1");
    const preserved = foundation.fingerprint;
    const revised = recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-record-1b", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "pad footings on layer 1 between 0.0 m and 2.4 m only", limitations: "Revised note still is not structural design", provenanceRef: "prov-foundation-b", citedCurrentness: "CURRENT", sourceBasis: "R5_PARAMETER", basisStatement: "Revised founding note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], parameterIds: [parameter.parameterId], stratigraphyId: stratigraphy.stratigraphyId, foundingDepthOrRange: "1.4 m to 1.8 m as written on the revised note", recommendationText: "Found pad footings within the revised depth range on layer 1", recommendationStatus: "GOVERNED_ADOPTED", predecessorContextRecordId: foundation.contextRecordId });
    const historical = store.contexts.find((row) => row.contextRecordId === foundation.contextRecordId);
    expect(revised.recordStatus).toBe("CURRENT");
    expect(historical?.fingerprint).toBe(preserved);
    expect(historical?.parameterIds).toEqual(["parameter-phi-1"]);
    expect(historical?.evidenceReferenceIds).toEqual(["evidence-report-1"]);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    const replacement = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-report-1b", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "FIELD_SHEET", sourceRevision: "geotech-note-2", provenanceRef: "prov-report-b", citedCurrentness: "CURRENT", predecessorEvidenceReferenceId: reportEvidence.evidenceReferenceId });
    expect(historical?.evidenceReferenceIds).not.toContain(replacement.evidenceReferenceId);
    expect(parameter.fingerprint).toBe(parameterFingerprint);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-stale", contextId: context.contextId, objectId: foundationObject.objectId, condition: "TEMPORARY", applicability: "temporary hoist pad on layer 1", limitations: "stale source", provenanceRef: "prov-stale", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "old note", evidenceReferenceIds: [reportEvidence.evidenceReferenceId] })).toThrow(/R2_EVIDENCE_NOT_CURRENT/);
    expect(() => recordFoundationGeotechnicalContext(store, actor, { contextRecordId: "foundation-spoof", contextId: context.contextId, objectId: foundationObject.objectId, condition: "TEMPORARY", applicability: "temporary hoist pad on layer 1", limitations: "spoof", provenanceRef: "prov-spoof", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "revised note", evidenceReferenceIds: [replacement.evidenceReferenceId], assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(stratigraphy.materialDescription).toBe("brown sand described on bh-log-001");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "foundation-excavation-slope-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "foundation-excavation-slope-context.ts"), source)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R6.FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
