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
  D3_R2_STARTED,
  D3_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R1_EVIDENCE_READY,
  createD3R1Store,
  recordGeotechnicalContext,
  recordGeotechnicalObjectIdentity,
  type D3R1Actor,
} from "./identity-foundation";
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_CAN_AUTOMATICALLY_INTERPRET_FACTUAL_GEOTECHNICAL_EVIDENCE_AS_AUTHORITY,
  AI_CAN_FABRICATE_GEOTECHNICAL_EVIDENCE,
  AI_CAN_INVENT_AUTHORITATIVE_INVESTIGATION_LOCATION,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  BOREHOLE_EVIDENCE_PRESENT_EQUALS_STRATIGRAPHY_INTERPRETED,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  D2_REOPENED,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_BOREHOLE_EVIDENCE_CONTEXT_IMPLEMENTED,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D3_D9_RUNTIME_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D3_EARTH_PRESSURE_RUNTIME_COUNT,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D3_EQUALS_D2_CIVIL_AUTHORITY,
  D3_EVIDENCE_PROVENANCE_PRESERVED,
  D3_EVIDENCE_PROVENANCE_REQUIRED,
  D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT,
  D3_FIELD_LAB_TEST_RUNTIME_READY,
  D3_FIELD_TEST_DATA_RUNTIME_COUNT,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY,
  D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
  D3_GROUNDWATER_INTERPRETATION_RUNTIME_COUNT,
  D3_INVESTIGATION_EVIDENCE_AUTO_REPOINTED,
  D3_INVESTIGATION_EVIDENCE_HISTORY_PRESERVED,
  D3_INVESTIGATION_LOCATION_CONTEXT_IMPLEMENTED,
  D3_LAB_TEST_DATA_RUNTIME_COUNT,
  D3_MATERIAL_CLASSIFICATION_RUNTIME_COUNT,
  D3_PARAMETER_CALCULATION_RUNTIME_COUNT,
  D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
  D3_PARAMETER_RUNTIME_COUNT,
  D3_R1_IDENTITY_REUSED,
  D3_R2_CANONICAL_NEXT_PHASE,
  D3_R2_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R2_MATURITY,
  D3_R2_NEXT_PHASE_TYPE,
  D3_R2_STATUS,
  D3_R3_RUNTIME_STARTED,
  D3_R3_STARTED,
  D3_R4_RUNTIME_STARTED,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_IMPLEMENTED,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY,
  D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY,
  D3_STRATIGRAPHY_RUNTIME_COUNT,
  D3_TEST_PIT_EVIDENCE_CONTEXT_IMPLEMENTED,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER,
  EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED,
  FLOATING_R1_D3_OBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  OBSERVATION_EQUALS_INTERPRETATION,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D3_IDENTITY_SYSTEM_CREATED,
  RECOMMENDATION_EQUALS_APPROVAL,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_INVESTIGATION_EVIDENCE_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D3_EVIDENCE_SCOPE_ENFORCED,
  TEST_PIT_EVIDENCE_PRESENT_EQUALS_MATERIAL_CLASSIFIED,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER,
  createD3R2Store,
  deriveGeotechnicalParameter,
  interpretStratigraphy,
  mutateInvestigationEvidence,
  recordBoreholeEvidenceContext,
  recordInvestigationEvidenceReference,
  recordInvestigationLocationContext,
  recordInvestigationProgram,
  recordTestPitEvidenceContext,
  repointInvestigationEvidence,
} from "./site-investigation-evidence";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

describe("EOS-D3-R2 site investigation and evidence context", () => {
  it("records factual investigation evidence on exact R1 identities without interpreting the ground", () => {
    expect(D3_R2_STATUS).toBe("SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT_IMPLEMENTED");
    expect(D3_R2_MATURITY).toBe("SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT_IMPLEMENTED");
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R1_STARTED).toBe(false);
    expect(D3_R2_STARTED).toBe(false);
    expect(R1_EVIDENCE_READY).toBe(false);
    expect(D3_R1_IDENTITY_REUSED).toBe(true);
    expect(D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_R1_D3_OBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(PARALLEL_D3_IDENTITY_SYSTEM_CREATED).toBe(false);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_COUNT).toBe(1);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D3_INVESTIGATION_LOCATION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(AI_CAN_INVENT_AUTHORITATIVE_INVESTIGATION_LOCATION).toBe(false);
    expect(D3_BOREHOLE_EVIDENCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_TEST_PIT_EVIDENCE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(BOREHOLE_EVIDENCE_PRESENT_EQUALS_STRATIGRAPHY_INTERPRETED).toBe(false);
    expect(TEST_PIT_EVIDENCE_PRESENT_EQUALS_MATERIAL_CLASSIFIED).toBe(false);
    expect(D3_EVIDENCE_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_EVIDENCE_PROVENANCE_PRESERVED).toBe(true);
    expect(AI_CAN_FABRICATE_GEOTECHNICAL_EVIDENCE).toBe(false);
    expect(EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(AI_CAN_AUTOMATICALLY_INTERPRET_FACTUAL_GEOTECHNICAL_EVIDENCE_AS_AUTHORITY).toBe(false);
    expect(OBSERVATION_EQUALS_INTERPRETATION).toBe(false);
    expect(TEST_RESULT_EQUALS_ENGINEERING_PARAMETER).toBe(false);
    expect(ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER).toBe(false);
    expect(RECOMMENDATION_EQUALS_APPROVAL).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(PARALLEL_D3_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_INVESTIGATION_EVIDENCE_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D3_INVESTIGATION_EVIDENCE_MUTATION_ALLOWED).toBe(false);
    expect(D3_INVESTIGATION_EVIDENCE_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_EVIDENCE_SCOPE_ENFORCED).toBe(true);
    expect(AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY).toBe(false);
    expect(D3_FIELD_LAB_TEST_RUNTIME_READY).toBe(false);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY).toBe(false);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY).toBe(false);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(false);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(false);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D3_R3_STARTED).toBe(false);
    expect(D3_R3_RUNTIME_STARTED).toBe(false);
    expect(D3_R4_RUNTIME_STARTED).toBe(false);
    expect([
      D3_STRATIGRAPHY_RUNTIME_COUNT,
      D3_GROUNDWATER_INTERPRETATION_RUNTIME_COUNT,
      D3_MATERIAL_CLASSIFICATION_RUNTIME_COUNT,
      D3_FIELD_TEST_DATA_RUNTIME_COUNT,
      D3_LAB_TEST_DATA_RUNTIME_COUNT,
      D3_PARAMETER_RUNTIME_COUNT,
      D3_PARAMETER_CALCULATION_RUNTIME_COUNT,
      D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
      D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
      D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT,
      D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT,
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_EARTH_PRESSURE_RUNTIME_COUNT,
      D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
      D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
      D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D3_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(24).fill(0));
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D2_REOPENED).toBe(false);
    expect(D2_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D3_R2_CANONICAL_NEXT_PHASE).toBe("EOS-D3-R3-STRATIGRAPHY-GROUNDWATER-AND-MATERIAL-CONTEXT");
    expect(D3_R2_NEXT_PHASE_TYPE).toBe("STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT");
    expect(D3_R2_CANONICAL_NEXT_PHASE_SCOPE).toContain("Do not derive engineering design parameters");

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
    const fieldRecord = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "field-record-1",
      contextId: context.contextId,
      objectType: "FIELD_TEST_RECORD",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-field-identity",
    });
    const labRecord = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "lab-record-1",
      contextId: context.contextId,
      objectType: "LAB_TEST_RECORD",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-lab-identity",
    });
    const groundwater = recordGeotechnicalObjectIdentity(r1, actor, {
      objectId: "groundwater-1",
      contextId: context.contextId,
      objectType: "GROUNDWATER_OBSERVATION",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-groundwater-identity",
    });
    const contextFingerprint = context.fingerprint;
    const siteFingerprint = site.fingerprint;
    const store = createD3R2Store(r1);
    const program = recordInvestigationProgram(store, actor, {
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
    expect(program.authority).toBe(D3_CONTEXT_AUTHORITY);
    expect(program.geotechnicalEngineeringAuthority).toBe(false);
    expect(program.engineeringValidated).toBe(false);
    expect(program.fingerprint).toBe(fingerprintCanonical({
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
      authority: D3_CONTEXT_AUTHORITY,
      predecessorInvestigationProgramId: null,
    }));
    expect(recordInvestigationProgram(store, actor, {
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
    }).fingerprint).toBe(program.fingerprint);
    expect(store.history.filter((row) => row.subjectKind === "PROGRAM")).toHaveLength(1);
    expect(() => recordInvestigationProgram(store, actor, {
      investigationProgramId: "program-2",
      contextId: context.contextId,
      objectId: site.objectId,
      purpose: "Another campaign",
      campaignRef: "campaign-2026-a",
      method: "BOREHOLE_DRILLING",
      provider: "Field provider A",
      investigationDate: "2026-04-02",
      provenanceRef: "prov-program-2",
      citedCurrentness: "CURRENT",
    })).toThrow(/DUPLICATE_INVESTIGATION_PROGRAM_REJECTED/);
    expect(() => recordInvestigationProgram(store, actor, {
      investigationProgramId: "floating-program",
      contextId: "current",
      objectId: site.objectId,
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-floating",
      method: "DOCUMENT_REVIEW",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "prov-floating",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_CONTEXT_REQUIRED/);
    expect(() => recordInvestigationProgram(store, actor, {
      investigationProgramId: "missing-object",
      contextId: context.contextId,
      objectId: "not-an-r1-object",
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-missing",
      method: "DOCUMENT_REVIEW",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "prov-missing",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_OBJECT_NOT_FOUND/);
    expect(() => recordInvestigationProgram(store, actor, {
      investigationProgramId: "wrong-type",
      contextId: context.contextId,
      objectId: borehole.objectId,
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-wrong",
      method: "DOCUMENT_REVIEW",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "prov-wrong",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_OBJECT_TYPE_MISMATCH/);
    expect(() => recordInvestigationProgram(store, { ...actor, actorId: "AI_assistant" }, {
      investigationProgramId: "ai-program",
      contextId: context.contextId,
      objectId: site.objectId,
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-ai",
      method: "DOCUMENT_REVIEW",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "prov-ai",
      citedCurrentness: "CURRENT",
    })).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordInvestigationProgram(store, { ...actor, authority: "ADMIN" }, {
      investigationProgramId: "admin-program",
      contextId: context.contextId,
      objectId: site.objectId,
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-admin",
      method: "DOCUMENT_REVIEW",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "prov-admin",
      citedCurrentness: "CURRENT",
    })).toThrow(/ADMIN_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordInvestigationProgram(store, actor, {
      investigationProgramId: "spoof-program",
      contextId: context.contextId,
      objectId: site.objectId,
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-spoof",
      method: "DOCUMENT_REVIEW",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "AI_generated",
      citedCurrentness: "CURRENT",
    })).toThrow(/MISSING_PROVENANCE/);
    expect(() => recordInvestigationProgram(store, actor, {
      investigationProgramId: "fingerprint-program",
      contextId: context.contextId,
      objectId: site.objectId,
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-fingerprint",
      method: "DOCUMENT_REVIEW",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "prov-fingerprint",
      citedCurrentness: "CURRENT",
      assertedFingerprint: "spoofed",
    })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordInvestigationProgram(store, actor, {
      investigationProgramId: "cross-program",
      contextId: context.contextId,
      objectId: site.objectId,
      purpose: "Factual site investigation campaign",
      campaignRef: "campaign-cross",
      method: "DOCUMENT_REVIEW",
      provider: "Field provider A",
      investigationDate: "2026-04-01",
      provenanceRef: "prov-cross",
      citedCurrentness: "CURRENT",
      tenantId: "tenant-b",
    })).toThrow(/CROSS_TENANT_OPERATION/);

    const location = recordInvestigationLocationContext(store, actor, {
      locationContextId: "location-context-1",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: locationObject.objectId,
      locationEvidenceRef: "survey-control-sheet-14",
      provenanceRef: "prov-location",
      citedCurrentness: "CURRENT",
    });
    expect(location.suppliedPosition).toBeNull();
    expect(location.locationInvented).toBe(false);
    expect(location.engineeringValidated).toBe(false);
    const supplied = recordInvestigationLocationContext(store, actor, {
      locationContextId: "location-context-supplied",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: locationObject.objectId,
      locationEvidenceRef: "survey-control-sheet-15",
      suppliedPosition: "chainage 12.4 supplied by survey sheet 15",
      provenanceRef: "prov-location-supplied",
      citedCurrentness: "CURRENT",
    });
    expect(supplied.suppliedPosition).toBe("chainage 12.4 supplied by survey sheet 15");
    expect(supplied.locationInvented).toBe(false);
    expect(() => recordInvestigationLocationContext(store, actor, {
      locationContextId: "invented-location",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: locationObject.objectId,
      locationEvidenceRef: "missing",
      inventLocation: true,
      provenanceRef: "prov-invented",
      citedCurrentness: "CURRENT",
    })).toThrow(/LOCATION_NOT_INVENTED/);
    expect(() => recordInvestigationLocationContext(store, actor, {
      locationContextId: "untraced-location",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: locationObject.objectId,
      locationEvidenceRef: "",
      provenanceRef: "prov-untraced",
      citedCurrentness: "CURRENT",
    })).toThrow(/LOCATION_EVIDENCE_REQUIRED/);

    const boreholeEvidence = recordBoreholeEvidenceContext(store, actor, {
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
    expect(boreholeEvidence.stratigraphyInterpreted).toBe(false);
    expect(boreholeEvidence.engineeringValidated).toBe(false);
    expect(boreholeEvidence).not.toHaveProperty("layers");
    expect(() => recordBoreholeEvidenceContext(store, actor, {
      boreholeEvidenceId: "borehole-evidence-layers",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: borehole.objectId,
      sourceLogRef: "bh-log-002",
      drillingRecordRef: "drill-sheet-002",
      provider: "Driller A",
      investigationDate: "2026-04-03",
      provenanceRef: "prov-layers",
      citedCurrentness: "CURRENT",
      layers: ["sand"],
    })).toThrow(/STRATIGRAPHY_NOT_IN_R2/);
    expect(() => recordBoreholeEvidenceContext(store, actor, {
      boreholeEvidenceId: "borehole-on-pit",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: testPit.objectId,
      sourceLogRef: "bh-log-wrong",
      drillingRecordRef: "drill-sheet-wrong",
      provider: "Driller A",
      investigationDate: "2026-04-03",
      provenanceRef: "prov-wrong-borehole",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_OBJECT_TYPE_MISMATCH/);

    const testPitEvidence = recordTestPitEvidenceContext(store, actor, {
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
    expect(testPitEvidence.materialClassified).toBe(false);
    expect(() => recordTestPitEvidenceContext(store, actor, {
      testPitEvidenceId: "classified-pit",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: testPit.objectId,
      sourceLogRef: "tp-log-002",
      excavationRecordRef: "excavation-sheet-002",
      provider: "Excavator A",
      investigationDate: "2026-04-04",
      provenanceRef: "prov-classified",
      citedCurrentness: "CURRENT",
      classifyMaterial: true,
    })).toThrow(/MATERIAL_CLASSIFICATION_NOT_IN_R2/);

    const log = recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "evidence-log-1",
      contextId: context.contextId,
      objectId: borehole.objectId,
      evidenceKind: "BOREHOLE_LOG",
      sourceRevision: "rev-a",
      provenanceRef: "prov-log",
      citedCurrentness: "CURRENT",
    });
    expect(log.engineeringValidated).toBe(false);
    expect(log.testResultParsed).toBe(false);
    expect(log.parameterDerived).toBe(false);
    const fieldSheet = recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "evidence-sheet-1",
      contextId: context.contextId,
      objectId: fieldRecord.objectId,
      evidenceKind: "FIELD_SHEET",
      sourceRevision: "rev-a",
      provenanceRef: "prov-sheet",
      citedCurrentness: "CURRENT",
    });
    expect(fieldSheet.evidenceKind).toBe("FIELD_SHEET");
    const photo = recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "evidence-photo-1",
      contextId: context.contextId,
      objectId: site.objectId,
      evidenceKind: "PHOTOGRAPH",
      sourceRevision: "rev-a",
      provenanceRef: "prov-photo",
      citedCurrentness: "CURRENT",
    });
    expect(photo.evidenceKind).toBe("PHOTOGRAPH");
    const fieldCitation = recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "evidence-field-citation",
      contextId: context.contextId,
      objectId: fieldRecord.objectId,
      evidenceKind: "FIELD_TEST_DATA",
      sourceRevision: "certificate-ref-only",
      provenanceRef: "prov-field-citation",
      citedCurrentness: "CURRENT",
    });
    expect(fieldCitation.testResultParsed).toBe(false);
    const labCitation = recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "evidence-lab-citation",
      contextId: context.contextId,
      objectId: labRecord.objectId,
      evidenceKind: "LABORATORY_REPORT",
      sourceRevision: "lab-report-ref-only",
      provenanceRef: "prov-lab-citation",
      citedCurrentness: "CURRENT",
    });
    expect(labCitation.testResultParsed).toBe(false);
    expect(labCitation.parameterDerived).toBe(false);
    const groundwaterCitation = recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "evidence-groundwater-citation",
      contextId: context.contextId,
      objectId: groundwater.objectId,
      evidenceKind: "GROUNDWATER_OBSERVATION",
      sourceRevision: "standpipe-note-1",
      provenanceRef: "prov-groundwater-citation",
      citedCurrentness: "CURRENT",
    });
    expect(groundwaterCitation.groundwaterInterpreted).toBe(false);
    expect(() => recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "parsed-lab",
      contextId: context.contextId,
      objectId: labRecord.objectId,
      evidenceKind: "LABORATORY_REPORT",
      sourceRevision: "parsed",
      provenanceRef: "prov-parsed",
      citedCurrentness: "CURRENT",
      testValues: [12],
    })).toThrow(/LAB_TEST_DATA_NOT_IN_R2/);
    expect(() => recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "parsed-field",
      contextId: context.contextId,
      objectId: fieldRecord.objectId,
      evidenceKind: "FIELD_TEST_DATA",
      sourceRevision: "parsed",
      provenanceRef: "prov-parsed-field",
      citedCurrentness: "CURRENT",
      parseFieldTest: true,
    })).toThrow(/FIELD_TEST_DATA_NOT_IN_R2/);
    expect(() => recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "interpreted-water",
      contextId: context.contextId,
      objectId: groundwater.objectId,
      evidenceKind: "GROUNDWATER_OBSERVATION",
      sourceRevision: "interpreted",
      provenanceRef: "prov-interpreted",
      citedCurrentness: "CURRENT",
      interpretGroundwater: true,
    })).toThrow(/GROUNDWATER_INTERPRETATION_NOT_IN_R2/);
    expect(() => recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "derived",
      contextId: context.contextId,
      objectId: borehole.objectId,
      evidenceKind: "CONSULTANT_REPORT",
      sourceRevision: "rev-b",
      provenanceRef: "prov-derived",
      citedCurrentness: "CURRENT",
      parameters: { phi: 30 },
    })).toThrow(/PARAMETER_NOT_IN_R2/);
    expect(() => recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "fabricated",
      contextId: context.contextId,
      objectId: borehole.objectId,
      evidenceKind: "HISTORICAL_SITE_INFORMATION",
      sourceRevision: "rev-c",
      provenanceRef: "prov-fabricated",
      citedCurrentness: "CURRENT",
      fabricateEvidence: true,
    })).toThrow(/EVIDENCE_NOT_FABRICATED/);
    expect(() => recordInvestigationEvidenceReference(store, actor, {
      evidenceReferenceId: "recommended",
      contextId: context.contextId,
      objectId: borehole.objectId,
      evidenceKind: "CONSULTANT_REPORT",
      sourceRevision: "rev-d",
      provenanceRef: "prov-recommended",
      citedCurrentness: "CURRENT",
      foundationRecommendation: true,
    })).toThrow(/FOUNDATION_RECOMMENDATION_NOT_IN_R2/);
    expect(() => interpretStratigraphy()).toThrow(/STRATIGRAPHY_NOT_IN_R2/);
    expect(() => deriveGeotechnicalParameter()).toThrow(/PARAMETER_NOT_IN_R2/);
    expect(() => repointInvestigationEvidence()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateInvestigationEvidence()).toThrow(/INVESTIGATION_EVIDENCE_MUTATION_REJECTED/);
    expect(() => { (program as { purpose: string }).purpose = "silent"; }).toThrow();
    expect(program.purpose).toBe("Factual site investigation campaign");
    expect(program.objectId).toBe(site.objectId);
    expect(context.fingerprint).toBe(contextFingerprint);
    expect(site.fingerprint).toBe(siteFingerprint);
    const preserved = program.fingerprint;
    const revised = recordInvestigationProgram(store, actor, {
      investigationProgramId: "program-1b",
      contextId: context.contextId,
      objectId: site.objectId,
      purpose: "Factual site investigation campaign revised",
      campaignRef: "campaign-2026-b",
      method: "BOREHOLE_DRILLING",
      provider: "Field provider A",
      investigationDate: "2026-04-08",
      provenanceRef: "prov-program-b",
      citedCurrentness: "CURRENT",
      predecessorInvestigationProgramId: program.investigationProgramId,
    });
    const historical = store.programs.find((row) => row.investigationProgramId === program.investigationProgramId);
    expect(revised.recordStatus).toBe("CURRENT");
    expect(historical?.recordStatus).toBe("SUPERSEDED");
    expect(historical?.citedCurrentness).toBe("SUPERSEDED");
    expect(historical?.fingerprint).toBe(preserved);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preserved)).toBe(true);
    expect(() => recordInvestigationLocationContext(store, actor, {
      locationContextId: "stale-location",
      investigationProgramId: program.investigationProgramId,
      contextId: context.contextId,
      objectId: locationObject.objectId,
      locationEvidenceRef: "survey-control-sheet-stale",
      provenanceRef: "prov-stale",
      citedCurrentness: "CURRENT",
    })).toThrow(/INVESTIGATION_PROGRAM_NOT_CURRENT/);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "site-investigation-evidence.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "site-investigation-evidence.ts"), source)).toEqual([]);
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
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R2.SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R3.STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
