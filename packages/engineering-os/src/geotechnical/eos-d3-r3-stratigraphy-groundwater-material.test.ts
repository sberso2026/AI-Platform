import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D3_0_RUNTIME_STARTED, D3_R1_STARTED, D3_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  D3_CONTEXT_AUTHORITY,
  D3_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  createD3R1Store,
  recordGeotechnicalContext,
  recordGeotechnicalObjectIdentity,
  type D3R1Actor,
} from "./identity-foundation";
import {
  D3_R3_STARTED,
  D3_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R2_R3_READY,
  createD3R2Store,
  recordBoreholeEvidenceContext,
  recordInvestigationEvidenceReference,
  recordInvestigationLocationContext,
  recordInvestigationProgram,
  recordTestPitEvidenceContext,
} from "./site-investigation-evidence";
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_CAN_AUTOMATICALLY_CREATE_AUTHORITATIVE_STRATIGRAPHY,
  AI_CAN_INVENT_AUTHORITATIVE_DESIGN_GROUNDWATER_LEVEL,
  AI_CAN_INVENT_AUTHORITATIVE_MATERIAL_CLASSIFICATION,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_GENERATED_INTERPRETATION_EQUALS_AUTHORITATIVE_INTERPRETATION,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D2_REOPENED,
  D3_APPROVAL_RUNTIME_COUNT,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D3_D9_RUNTIME_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D3_EARTH_PRESSURE_RUNTIME_COUNT,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D3_EQUALS_D2_CIVIL_AUTHORITY,
  D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT,
  D3_FIELD_LAB_TEST_RUNTIME_READY,
  D3_FIELD_TEST_DATA_RUNTIME_COUNT,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY,
  D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY,
  D3_GROUND_IMPROVEMENT_RECOMMENDATION_RUNTIME_COUNT,
  D3_GROUNDWATER_CONTEXT_IMPLEMENTED,
  D3_LAB_TEST_DATA_RUNTIME_COUNT,
  D3_MATERIAL_CLASSIFICATION_CONTEXT_IMPLEMENTED,
  D3_PARAMETER_CALCULATION_RUNTIME_COUNT,
  D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
  D3_PARAMETER_RUNTIME_COUNT,
  D3_R1_IDENTITY_REUSED,
  D3_R2_INVESTIGATION_EVIDENCE_REUSED,
  D3_R3_CANONICAL_NEXT_PHASE,
  D3_R3_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R3_EVIDENCE_TRACEABILITY_PRESERVED,
  D3_R3_EVIDENCE_TRACEABILITY_REQUIRED,
  D3_R3_FINGERPRINT_IMPLEMENTED,
  D3_R3_HISTORY_PRESERVED,
  D3_R3_INTERPRETATION_AUTO_REPOINTED,
  D3_R3_MATURITY,
  D3_R3_NEXT_PHASE_TYPE,
  D3_R3_PROVENANCE_PRESERVED,
  D3_R3_PROVENANCE_REQUIRED,
  D3_R3_STATUS,
  D3_R4_RUNTIME_STARTED,
  D3_R4_STARTED,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY,
  D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D3_STRATIGRAPHY_CONTEXT_IMPLEMENTED,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_COUNT,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_IMPLEMENTED,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY,
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
  FLOATING_R1_D3_OBJECT_REFERENCE_ALLOWED,
  FLOATING_R2_EVIDENCE_REFERENCE_ALLOWED,
  GROUNDWATER_OBSERVATION_EQUALS_DESIGN_GROUNDWATER_LEVEL,
  INTERPRETATION_EQUALS_ENGINEERING_RECOMMENDATION,
  INTERPRETATION_WITHOUT_GOVERNED_EVIDENCE_AUTO_ACCEPTED,
  MATERIAL_CLASSIFICATION_EQUALS_DESIGN_SUITABILITY_CONFIRMED,
  MATERIAL_CLASSIFICATION_EQUALS_ENGINEERING_PARAMETER_SET,
  NEW_DEPENDENCY_ADDED,
  OBSERVATION_EQUALS_INTERPRETATION,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED,
  RECOMMENDATION_EQUALS_APPROVAL,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R3_MUTATION_ALLOWED,
  STRATIGRAPHY_INTERPRETATION_EQUALS_RAW_EVIDENCE,
  TENANT_WORKSPACE_PROJECT_D3_R3_SCOPE_ENFORCED,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER,
  createD3R3Store,
  deriveGeotechnicalParameter,
  mutateStratigraphyContext,
  parseFieldOrLabTest,
  recordGroundwaterContext,
  recordMaterialClassificationContext,
  recordStratigraphicInterpretation,
  repointInterpretation,
} from "./stratigraphy-groundwater-material";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

describe("EOS-D3-R3 stratigraphy groundwater and material context", () => {
  it("records governed interpretation on exact R1 identities and R2 evidence without design values", () => {
    expect(D3_R3_STATUS).toBe("STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT_IMPLEMENTED");
    expect(D3_R3_MATURITY).toBe("STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT_IMPLEMENTED");
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R1_STARTED).toBe(false);
    expect(D3_R3_STARTED).toBe(false);
    expect(R2_R3_READY).toBe(false);
    expect(D3_R4_STARTED).toBe(false);
    expect(D3_R4_RUNTIME_STARTED).toBe(false);
    expect(D3_R1_IDENTITY_REUSED).toBe(true);
    expect(D3_R2_INVESTIGATION_EVIDENCE_REUSED).toBe(true);
    expect(D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED).toBe(true);
    expect(EXACT_R2_EVIDENCE_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_R1_D3_OBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(FLOATING_R2_EVIDENCE_REFERENCE_ALLOWED).toBe(false);
    expect(D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_COUNT).toBe(1);
    expect(D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY).toBe(true);
    expect(D3_STRATIGRAPHY_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_MATERIAL_CLASSIFICATION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_GROUNDWATER_CONTEXT_IMPLEMENTED).toBe(true);
    expect(OBSERVATION_EQUALS_INTERPRETATION).toBe(false);
    expect(STRATIGRAPHY_INTERPRETATION_EQUALS_RAW_EVIDENCE).toBe(false);
    expect(AI_CAN_AUTOMATICALLY_CREATE_AUTHORITATIVE_STRATIGRAPHY).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_MATERIAL_CLASSIFICATION).toBe(false);
    expect(MATERIAL_CLASSIFICATION_EQUALS_ENGINEERING_PARAMETER_SET).toBe(false);
    expect(MATERIAL_CLASSIFICATION_EQUALS_DESIGN_SUITABILITY_CONFIRMED).toBe(false);
    expect(GROUNDWATER_OBSERVATION_EQUALS_DESIGN_GROUNDWATER_LEVEL).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_DESIGN_GROUNDWATER_LEVEL).toBe(false);
    expect(AI_GENERATED_INTERPRETATION_EQUALS_AUTHORITATIVE_INTERPRETATION).toBe(false);
    expect(AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D3_R3_EVIDENCE_TRACEABILITY_REQUIRED).toBe(true);
    expect(D3_R3_EVIDENCE_TRACEABILITY_PRESERVED).toBe(true);
    expect(INTERPRETATION_WITHOUT_GOVERNED_EVIDENCE_AUTO_ACCEPTED).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D3_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(D3_R3_INTERPRETATION_AUTO_REPOINTED).toBe(false);
    expect(D3_R3_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_R3_PROVENANCE_PRESERVED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_R3_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(SILENT_D3_R3_MUTATION_ALLOWED).toBe(false);
    expect(D3_R3_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R3_SCOPE_ENFORCED).toBe(true);
    expect(TEST_RESULT_EQUALS_ENGINEERING_PARAMETER).toBe(false);
    expect(ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER).toBe(false);
    expect(INTERPRETATION_EQUALS_ENGINEERING_RECOMMENDATION).toBe(false);
    expect(RECOMMENDATION_EQUALS_APPROVAL).toBe(false);
    expect(D3_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D3_FIELD_LAB_TEST_RUNTIME_READY).toBe(false);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY).toBe(false);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY).toBe(false);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(false);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(false);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect([
      D3_FIELD_TEST_DATA_RUNTIME_COUNT,
      D3_LAB_TEST_DATA_RUNTIME_COUNT,
      D3_PARAMETER_RUNTIME_COUNT,
      D3_PARAMETER_CALCULATION_RUNTIME_COUNT,
      D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
      D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
      D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT,
      D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT,
      D3_GROUND_IMPROVEMENT_RECOMMENDATION_RUNTIME_COUNT,
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_EARTH_PRESSURE_RUNTIME_COUNT,
      D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D3_APPROVAL_RUNTIME_COUNT,
      D3_CERTIFICATION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D3_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(22).fill(0));
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
    expect(D3_R3_CANONICAL_NEXT_PHASE).toBe("EOS-D3-R4-FIELD-AND-LAB-TEST-CONTEXT");
    expect(D3_R3_NEXT_PHASE_TYPE).toBe("FIELD_AND_LAB_TEST_CONTEXT");
    expect(D3_R3_CANONICAL_NEXT_PHASE_SCOPE).toContain("without deriving authoritative design parameters");

    const r1 = createD3R1Store();
    const context = recordGeotechnicalContext(r1, actor, {
      contextId: "geotech-context-1",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-geotech-context",
    });
    const site = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "site-1",
      contextId: context.contextId,
      objectType: "GEOTECHNICAL_SITE_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-site",
    });
    const locationObject = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "location-1",
      contextId: context.contextId,
      objectType: "INVESTIGATION_LOCATION",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-location-identity",
      parentObjectId: site.objectId,
    });
    const borehole = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "borehole-1",
      contextId: context.contextId,
      objectType: "BOREHOLE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-borehole-identity",
      parentObjectId: site.objectId,
    });
    const testPit = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "test-pit-1",
      contextId: context.contextId,
      objectType: "TEST_PIT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-test-pit-identity",
      parentObjectId: site.objectId,
    });
    const layer = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "layer-1",
      contextId: context.contextId,
      objectType: "STRATIGRAPHIC_LAYER",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-layer-identity",
      parentObjectId: borehole.objectId,
    });
    const materialObject = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "material-1",
      contextId: context.contextId,
      objectType: "MATERIAL_CLASSIFICATION",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-material-identity",
    });
    const groundwaterObject = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "groundwater-1",
      contextId: context.contextId,
      objectType: "GROUNDWATER_OBSERVATION",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-groundwater-identity",
    });
    const r2 = createD3R2Store(r1);
    const program = recordInvestigationProgram(r2, actor, {
      investigationProgramId: "program-1",
      contextId: context.contextId,
      objectId: site.objectId,
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-2026-a",
      method: "BOREHOLE_DRILLING",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "prov-program",
      citedCurrentness: "CURRENT",
    });
    const location = recordInvestigationLocationContext(r2, actor, {
      locationContextId: "location-context-1",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: locationObject.objectId,
      locationEvidenceRef: "survey-control-sheet-14",
      provenanceRef: "prov-location",
      citedCurrentness: "CURRENT",
    });
    const boreholeEvidence = recordBoreholeEvidenceContext(r2, actor, {
      boreholeEvidenceId: "borehole-evidence-1",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: borehole.objectId,
      sourceLogRef: "bh-log-001",
      drillingRecordRef: "drill-sheet-001",
      provider: "Driller A",
      investigationDate: "2026-04-03",
      factualDepth: "12.5 m recorded on drill sheet 001",
      provenanceRef: "prov-borehole-evidence",
      citedCurrentness: "CURRENT",
    });
    recordTestPitEvidenceContext(r2, actor, {
      testPitEvidenceId: "test-pit-evidence-1",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: testPit.objectId,
      sourceLogRef: "tp-log-001",
      excavationRecordRef: "excavation-sheet-001",
      provider: "Excavator A",
      investigationDate: "2026-04-04",
      provenanceRef: "prov-test-pit-evidence",
      citedCurrentness: "CURRENT",
    });
    const boreholeLog = recordInvestigationEvidenceReference(r2, actor, {
      evidenceReferenceId: "evidence-log-1",
      contextId: context.contextId,
      objectId: borehole.objectId,
      evidenceKind: "BOREHOLE_LOG",
      sourceRevision: "rev-a",
      provenanceRef: "prov-log",
      citedCurrentness: "CURRENT",
    });
    const photo = recordInvestigationEvidenceReference(r2, actor, {
      evidenceReferenceId: "evidence-photo-1",
      contextId: context.contextId,
      objectId: site.objectId,
      evidenceKind: "PHOTOGRAPH",
      sourceRevision: "rev-a",
      provenanceRef: "prov-photo",
      citedCurrentness: "CURRENT",
    });
    const groundwaterEvidence = recordInvestigationEvidenceReference(r2, actor, {
      evidenceReferenceId: "evidence-groundwater-1",
      contextId: context.contextId,
      objectId: groundwaterObject.objectId,
      evidenceKind: "GROUNDWATER_OBSERVATION",
      sourceRevision: "standpipe-note-1",
      provenanceRef: "prov-groundwater",
      citedCurrentness: "CURRENT",
    });
    const contextFingerprint = context.fingerprint;
    const boreholeEvidenceFingerprint = boreholeEvidence.fingerprint;
    const logFingerprint = boreholeLog.fingerprint;
    const store = createD3R3Store(r2);
    const layerRecord = recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-interpretation-1",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId, photo.evidenceReferenceId],
      depthInterval: "0.0 m to 2.4 m as marked on bh-log-001",
      materialDescription: "brown sand described on bh-log-001",
      layerSequence: "1",
      interpretationSource: "logged by field geologist on bh-log-001",
      limitations: "Description is limited to the supplied log interval",
      provenanceRef: "prov-layer",
      citedCurrentness: "CURRENT",
    });
    expect(layerRecord.rawEvidence).toBe(false);
    expect(layerRecord.geotechnicalEngineeringAuthority).toBe(false);
    expect(layerRecord.engineeringValidated).toBe(false);
    expect(layerRecord.evidenceReferenceIds).toEqual(["evidence-log-1", "evidence-photo-1"]);
    expect(layerRecord.fingerprint).toBe(fingerprintCanonical({
      stratigraphyId: "layer-interpretation-1",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      testPitEvidenceId: null,
      evidenceReferenceIds: ["evidence-log-1", "evidence-photo-1"],
      depthInterval: "0.0 m to 2.4 m as marked on bh-log-001",
      materialDescription: "brown sand described on bh-log-001",
      layerSequence: "1",
      interpretationSource: "logged by field geologist on bh-log-001",
      limitations: "Description is limited to the supplied log interval",
      provenanceRef: "prov-layer",
      citedCurrentness: "CURRENT",
      authority: D3_CONTEXT_AUTHORITY,
      predecessorStratigraphyId: null,
    }));
    expect(recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-interpretation-1",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId, photo.evidenceReferenceId],
      depthInterval: "0.0 m to 2.4 m as marked on bh-log-001",
      materialDescription: "brown sand described on bh-log-001",
      layerSequence: "1",
      interpretationSource: "logged by field geologist on bh-log-001",
      limitations: "Description is limited to the supplied log interval",
      provenanceRef: "prov-layer",
      citedCurrentness: "CURRENT",
    }).fingerprint).toBe(layerRecord.fingerprint);
    expect(store.history.filter((row) => row.subjectKind === "STRATIGRAPHY")).toHaveLength(1);
    expect(boreholeEvidence.stratigraphyInterpreted).toBe(false);
    expect(boreholeEvidence.fingerprint).toBe(boreholeEvidenceFingerprint);
    expect(boreholeLog.fingerprint).toBe(logFingerprint);
    expect(context.fingerprint).toBe(contextFingerprint);
    expect(() => recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-no-evidence",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [],
      depthInterval: "2.4 m to 4.0 m",
      materialDescription: "clay described on the log",
      layerSequence: "2",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-empty",
      citedCurrentness: "CURRENT",
    })).toThrow(/INTERPRETATION_WITHOUT_EVIDENCE/);
    expect(() => recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-floating",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: ["latest"],
      depthInterval: "2.4 m to 4.0 m",
      materialDescription: "clay described on the log",
      layerSequence: "2",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-floating",
      citedCurrentness: "CURRENT",
    })).toThrow(/R2_EVIDENCE_REQUIRED/);
    expect(() => recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-automatic",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      depthInterval: "2.4 m to 4.0 m",
      materialDescription: "clay described on the log",
      layerSequence: "2",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-automatic",
      citedCurrentness: "CURRENT",
      automaticStratigraphy: true,
    })).toThrow(/AUTHORITATIVE_STRATIGRAPHY_NOT_AUTOMATIC/);
    expect(() => recordStratigraphicInterpretation(store, { ...actor, actorId: "AI_assistant" }, {
      stratigraphyId: "layer-ai",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      depthInterval: "2.4 m to 4.0 m",
      materialDescription: "clay described on the log",
      layerSequence: "2",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-ai",
      citedCurrentness: "CURRENT",
    })).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-ai-flag",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      depthInterval: "2.4 m to 4.0 m",
      materialDescription: "clay described on the log",
      layerSequence: "2",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-ai-flag",
      citedCurrentness: "CURRENT",
      aiGenerated: true,
    })).toThrow(/AI_INTERPRETATION_NOT_AUTHORITATIVE/);
    expect(() => recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-wrong-object",
      contextId: context.contextId,
      objectId: borehole.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      depthInterval: "2.4 m to 4.0 m",
      materialDescription: "clay described on the log",
      layerSequence: "2",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-wrong-object",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_OBJECT_TYPE_MISMATCH/);
    expect(() => recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-parameter",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      depthInterval: "2.4 m to 4.0 m",
      materialDescription: "clay described on the log",
      layerSequence: "2",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-parameter",
      citedCurrentness: "CURRENT",
      frictionAngle: 30,
    })).toThrow(/PARAMETER_NOT_IN_R3/);
    expect(() => recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-cross",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      depthInterval: "4.0 m to 6.0 m",
      materialDescription: "gravel described on the log",
      layerSequence: "3",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-cross",
      citedCurrentness: "CURRENT",
      tenantId: "tenant-b",
    })).toThrow(/CROSS_TENANT_OPERATION/);

    const material = recordMaterialClassificationContext(store, actor, {
      materialClassificationId: "material-classification-1",
      contextId: context.contextId,
      objectId: materialObject.objectId,
      layerInterpretationId: layerRecord.stratigraphyId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      classificationSystem: "USCS as cited on bh-log-001",
      classificationResult: "SP as written on bh-log-001",
      materialDescription: "poorly graded sand as written on bh-log-001",
      limitations: "Classification is the supplied log entry and does not confirm design suitability",
      provenanceRef: "prov-material",
      citedCurrentness: "CURRENT",
    });
    expect(material.designSuitabilityConfirmed).toBe(false);
    expect(material.parameterSet).toBe(false);
    expect(material.layerInterpretationId).toBe(layerRecord.stratigraphyId);
    expect(() => recordMaterialClassificationContext(store, actor, {
      materialClassificationId: "material-invented",
      contextId: context.contextId,
      objectId: materialObject.objectId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      classificationSystem: "USCS as cited on bh-log-001",
      classificationResult: "CL",
      materialDescription: "invented clay",
      limitations: "none supplied",
      provenanceRef: "prov-invented",
      citedCurrentness: "CURRENT",
      inventClassification: true,
    })).toThrow(/MATERIAL_CLASSIFICATION_NOT_INVENTED/);
    expect(() => recordMaterialClassificationContext(store, actor, {
      materialClassificationId: "material-suitability",
      contextId: context.contextId,
      objectId: materialObject.objectId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      classificationSystem: "USCS as cited on bh-log-001",
      classificationResult: "SP as written on bh-log-001",
      materialDescription: "poorly graded sand as written on bh-log-001",
      limitations: "should not confirm suitability",
      provenanceRef: "prov-suitability",
      citedCurrentness: "CURRENT",
      designSuitability: true,
    })).toThrow(/DESIGN_SUITABILITY_NOT_IN_R3/);
    expect(() => recordMaterialClassificationContext(store, actor, {
      materialClassificationId: "material-inferred",
      contextId: context.contextId,
      objectId: materialObject.objectId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      classificationSystem: "USCS as cited on bh-log-001",
      classificationResult: "inferred",
      materialDescription: "poorly graded sand as written on bh-log-001",
      limitations: "not inferred",
      provenanceRef: "prov-inferred",
      citedCurrentness: "CURRENT",
    })).toThrow(/CLASSIFICATION_RESULT_REQUIRED/);

    const water = recordGroundwaterContext(store, actor, {
      groundwaterContextId: "groundwater-context-1",
      contextId: context.contextId,
      objectId: groundwaterObject.objectId,
      locationContextId: location.locationContextId,
      evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId],
      observedWaterLevel: "3.2 m below ground surface on standpipe-note-1",
      observationDate: "2026-04-05",
      measurementMethod: "standpipe reading recorded on standpipe-note-1",
      interpretedContext: "water observed at the recorded standpipe depth",
      seasonalLimitation: "single observation, not a seasonal envelope",
      limitations: "Does not establish a design groundwater level",
      provenanceRef: "prov-groundwater-context",
      citedCurrentness: "CURRENT",
    });
    expect(water.designGroundwaterLevel).toBe(false);
    expect(water.observedWaterLevel).toBe("3.2 m below ground surface on standpipe-note-1");
    expect(water.engineeringValidated).toBe(false);
    expect(() => recordGroundwaterContext(store, actor, {
      groundwaterContextId: "groundwater-design",
      contextId: context.contextId,
      objectId: groundwaterObject.objectId,
      locationContextId: location.locationContextId,
      evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId],
      observedWaterLevel: "3.2 m below ground surface on standpipe-note-1",
      observationDate: "2026-04-06",
      interpretedContext: "design level",
      seasonalLimitation: "single observation",
      limitations: "must not become design",
      provenanceRef: "prov-design-water",
      citedCurrentness: "CURRENT",
      designGroundwaterLevel: true,
    })).toThrow(/DESIGN_GROUNDWATER_LEVEL_NOT_AUTHORITATIVE/);
    expect(() => recordGroundwaterContext(store, actor, {
      groundwaterContextId: "groundwater-lab",
      contextId: context.contextId,
      objectId: groundwaterObject.objectId,
      locationContextId: location.locationContextId,
      evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId],
      observationDate: "2026-04-06",
      interpretedContext: "parsed test",
      seasonalLimitation: "single observation",
      limitations: "must not parse tests",
      provenanceRef: "prov-lab",
      citedCurrentness: "CURRENT",
      testValues: [12],
    })).toThrow(/LAB_TEST_DATA_NOT_IN_R3/);
    expect(() => recordGroundwaterContext(store, actor, {
      groundwaterContextId: "groundwater-recommendation",
      contextId: context.contextId,
      objectId: groundwaterObject.objectId,
      locationContextId: location.locationContextId,
      evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId],
      observationDate: "2026-04-06",
      interpretedContext: "recommendation",
      seasonalLimitation: "single observation",
      limitations: "must not recommend",
      provenanceRef: "prov-recommendation",
      citedCurrentness: "CURRENT",
      foundationRecommendation: true,
    })).toThrow(/FOUNDATION_RECOMMENDATION_NOT_IN_R3/);
    expect(() => deriveGeotechnicalParameter()).toThrow(/PARAMETER_NOT_IN_R3/);
    expect(() => parseFieldOrLabTest()).toThrow(/FIELD_LAB_TEST_NOT_IN_R3/);
    expect(() => repointInterpretation()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateStratigraphyContext()).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => { (layerRecord as { materialDescription: string }).materialDescription = "silent"; }).toThrow();
    expect(layerRecord.materialDescription).toBe("brown sand described on bh-log-001");

    const preserved = layerRecord.fingerprint;
    const preservedEvidence = [...layerRecord.evidenceReferenceIds];
    const revised = recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-interpretation-1b",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId, photo.evidenceReferenceId],
      depthInterval: "0.0 m to 2.6 m as marked on bh-log-001 revision note",
      materialDescription: "brown sand described on bh-log-001",
      layerSequence: "1",
      interpretationSource: "logged by field geologist on bh-log-001",
      limitations: "Revised interval remains bound to rev-a until a new log is governed",
      provenanceRef: "prov-layer-b",
      citedCurrentness: "CURRENT",
      predecessorStratigraphyId: layerRecord.stratigraphyId,
    });
    const historical = store.stratigraphy.find((row) => row.stratigraphyId === layerRecord.stratigraphyId);
    expect(revised.recordStatus).toBe("CURRENT");
    expect(historical?.recordStatus).toBe("SUPERSEDED");
    expect(historical?.fingerprint).toBe(preserved);
    expect(historical?.evidenceReferenceIds).toEqual(preservedEvidence);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);

    const replacement = recordInvestigationEvidenceReference(r2, actor, {
      evidenceReferenceId: "evidence-groundwater-1b",
      contextId: context.contextId,
      objectId: groundwaterObject.objectId,
      evidenceKind: "GROUNDWATER_OBSERVATION",
      sourceRevision: "standpipe-note-2",
      provenanceRef: "prov-groundwater-b",
      citedCurrentness: "CURRENT",
      predecessorEvidenceReferenceId: groundwaterEvidence.evidenceReferenceId,
    });
    const bound = store.groundwater.find((row) => row.groundwaterContextId === water.groundwaterContextId);
    expect(bound?.evidenceReferenceIds).toEqual([groundwaterEvidence.evidenceReferenceId]);
    expect(bound?.fingerprint).toBe(water.fingerprint);
    expect(bound?.evidenceReferenceIds).not.toContain(replacement.evidenceReferenceId);
    expect(() => recordGroundwaterContext(store, actor, {
      groundwaterContextId: "groundwater-context-current-old",
      contextId: context.contextId,
      objectId: groundwaterObject.objectId,
      locationContextId: location.locationContextId,
      evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId],
      observedWaterLevel: "3.4 m below ground surface",
      observationDate: "2026-04-07",
      interpretedContext: "still citing the superseded note as current",
      seasonalLimitation: "single observation",
      limitations: "must not treat superseded evidence as current",
      provenanceRef: "prov-stale-current",
      citedCurrentness: "CURRENT",
    })).toThrow(/R2_EVIDENCE_NOT_CURRENT/);
    const reassessment = recordGroundwaterContext(store, actor, {
      groundwaterContextId: "groundwater-context-reassessment",
      contextId: context.contextId,
      objectId: groundwaterObject.objectId,
      locationContextId: location.locationContextId,
      evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId],
      observedWaterLevel: "3.2 m below ground surface on standpipe-note-1",
      observationDate: "2026-04-05",
      measurementMethod: "standpipe reading recorded on standpipe-note-1",
      interpretedContext: "historical observation requires reassessment",
      seasonalLimitation: "single observation, not a seasonal envelope",
      limitations: "Remains bound to standpipe-note-1",
      provenanceRef: "prov-reassessment",
      citedCurrentness: "REASSESSMENT_REQUIRED",
      predecessorGroundwaterContextId: water.groundwaterContextId,
    });
    expect(reassessment.citedCurrentness).toBe("REASSESSMENT_REQUIRED");
    expect(reassessment.evidenceReferenceIds).toEqual([groundwaterEvidence.evidenceReferenceId]);
    expect(reassessment.designGroundwaterLevel).toBe(false);
    expect(() => recordStratigraphicInterpretation(store, actor, {
      stratigraphyId: "layer-spoof",
      contextId: context.contextId,
      objectId: layer.objectId,
      locationContextId: location.locationContextId,
      boreholeEvidenceId: boreholeEvidence.boreholeEvidenceId,
      evidenceReferenceIds: [boreholeLog.evidenceReferenceId],
      depthInterval: "6.0 m to 8.0 m",
      materialDescription: "silt described on the log",
      layerSequence: "4",
      interpretationSource: "logged by field geologist",
      limitations: "limited to the log",
      provenanceRef: "prov-spoof",
      citedCurrentness: "CURRENT",
      assertedFingerprint: "spoofed",
    })).toThrow(/FINGERPRINT_MISMATCH/);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "stratigraphy-groundwater-material.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "stratigraphy-groundwater-material.ts"), source)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual([
      "@rtb/database",
            "@rtb/platform-commerce",
      "@rtb/platform-intelligence",
      "@rtb/platform-kernel",
      "@rtb/types",
      "docx",
      "exceljs",
      "pptxgenjs",
      "zod",
    ]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R3.STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R4.FIELD_AND_LAB_TEST_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
