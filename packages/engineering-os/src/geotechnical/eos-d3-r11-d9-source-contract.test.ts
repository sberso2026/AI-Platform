import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D2_RUNTIME_COUNT as D2_ARCHITECTURE_RUNTIME_COUNT, D3_0_RUNTIME_STARTED, D3_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D3_R11_STARTED, D3_RUNTIME_COUNT as R10_RUNTIME_COUNT, createD3R10Store, recordGeotechnicalCurrentness, recordGeotechnicalLineage } from "./currentness-digital-thread";
import {
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY as R10_SOURCE_READY,
} from "./currentness-digital-thread";
import { recordGeotechnicalInterfaceHandoff } from "./discipline-interfaces-handoffs";
import { recordFieldTestResult, recordLaboratoryTestResult } from "./field-lab-test-context";
import { recordFoundationGeotechnicalContext } from "./foundation-excavation-slope-context";
import { recordGeotechnicalParameter } from "./geotechnical-parameter-context";
import { D3_CONTEXT_AUTHORITY, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity, type D3R1Actor } from "./identity-foundation";
import { recordGeotechnicalAssumption, recordGeotechnicalChange, recordGeotechnicalDecision, recordGeotechnicalRequirement } from "./requirements-assumptions-change";
import { createD3R9Store, recordGeotechnicalReviewRequest, recordGeotechnicalValidationState, type D3R9Actor } from "./review-validation-governance";
import { createD3R2Store, recordBoreholeEvidenceContext, recordInvestigationEvidenceReference, recordInvestigationLocationContext, recordInvestigationProgram } from "./site-investigation-evidence";
import { createD3R3Store, recordGroundwaterContext, recordMaterialClassificationContext, recordStratigraphicInterpretation } from "./stratigraphy-groundwater-material";
import { createD3R4Store } from "./field-lab-test-context";
import { createD3R5Store } from "./geotechnical-parameter-context";
import { createD3R6Store } from "./foundation-excavation-slope-context";
import { createD3R7Store } from "./requirements-assumptions-change";
import { createD3R8Store } from "./discipline-interfaces-handoffs";
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  CANONICAL_FINGERPRINT_REUSED,
  D1_STRUCTURAL_PACK_COMPLETE as PACK,
  D2_REOPENED,
  D3_APPROVAL_RUNTIME_COUNT,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT,
  D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT,
  D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT,
  D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D3_D9_CHANGE_REASSESSMENT_METADATA_EXPOSED,
  D3_D9_CURRENTNESS_LINEAGE_METADATA_EXPOSED,
  D3_D9_FIELD_LAB_TEST_METADATA_EXPOSED,
  D3_D9_FOUNDATION_EXCAVATION_SLOPE_METADATA_EXPOSED,
  D3_D9_GROUNDWATER_METADATA_EXPOSED,
  D3_D9_IDENTITY_METADATA_EXPOSED,
  D3_D9_INTERFACE_HANDOFF_METADATA_EXPOSED,
  D3_D9_INVESTIGATION_EVIDENCE_METADATA_EXPOSED,
  D3_D9_MATERIAL_CLASSIFICATION_METADATA_EXPOSED,
  D3_D9_PARAMETER_METADATA_EXPOSED,
  D3_D9_REQUIREMENT_ASSUMPTION_DECISION_METADATA_EXPOSED,
  D3_D9_REVIEW_VALIDATION_METADATA_EXPOSED,
  D3_D9_RUNTIME_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT,
  D3_D9_SOURCE_CONTRACT_DERIVES_NEW_PARAMETER,
  D3_D9_SOURCE_CONTRACT_EXISTS_EQUALS_D9_STARTED,
  D3_D9_SOURCE_CONTRACT_FABRICATES_COUNTERPART_DATA,
  D3_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION,
  D3_D9_SOURCE_CONTRACT_PERFORMS_ENGINEERING_CALCULATION,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED,
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D3_D9_SOURCE_CONTRACT_TRANSFERS_D1_AUTHORITY,
  D3_D9_SOURCE_CONTRACT_TRANSFERS_D2_AUTHORITY,
  D3_D9_SOURCE_CONTRACT_TRANSFERS_GEOTECHNICAL_AUTHORITY,
  D3_D9_SOURCE_CURRENTNESS_EXPLICIT,
  D3_D9_SOURCE_FINGERPRINT_EXPOSED,
  D3_D9_SOURCE_LIMITATIONS_EXPLICIT,
  D3_D9_SOURCE_LIMITATIONS_PRESERVED,
  D3_D9_SOURCE_LINEAGE_EXPLICIT,
  D3_D9_SOURCE_PROVENANCE_PRESERVED,
  D3_D9_SOURCE_PROVENANCE_REQUIRED,
  D3_D9_SOURCE_REVIEW_STATE_EXPLICIT,
  D3_D9_SOURCE_VALIDATION_STATE_EXPLICIT,
  D3_D9_SOURCE_AUTHORITY_EXPLICIT,
  D3_D9_SOURCE_PRESERVES_TRUTH_CLASSIFICATION,
  D3_D9_STRATIGRAPHY_METADATA_EXPOSED,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D3_EARTH_PRESSURE_RUNTIME_COUNT,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D3_EQUALS_D2_CIVIL_AUTHORITY,
  D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
  D3_FIELD_LAB_TEST_RUNTIME_READY,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
  D3_PILE_CAPACITY_RUNTIME_COUNT,
  D3_R8_INTERFACE_METADATA_REUSED,
  D3_R10_LINEAGE_REUSED,
  D3_R11_BLOCKER,
  D3_R11_CANONICAL_NEXT_PHASE,
  D3_R11_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D3_R11_HISTORY_PRESERVED,
  D3_R11_MATURITY,
  D3_R11_NEXT_PHASE_TYPE,
  D3_R11_REPLAY_PROTECTION_IMPLEMENTED,
  D3_R11_SPOOFING_PROTECTION_IMPLEMENTED,
  D3_R11_STATUS,
  D3_R12_CANONICAL_PHASE,
  D3_R12_CANONICAL_SCOPE,
  D3_R12_PHASE_TYPE,
  D3_R12_STARTED,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
  D3_REUSES_CANONICAL_D9_SOURCE_CONTRACT_GOVERNANCE,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER,
  EXACT_D3_D9_SOURCE_REVISION_REQUIRED,
  FLOATING_D3_D9_SOURCE_REFERENCE_ALLOWED,
  D3_D9_SOURCE_AUTO_REPOINTED,
  INFERRED_D3_D9_LINEAGE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  OBSERVATION_EQUALS_INTERPRETATION,
  PARALLEL_D3_D9_SOURCE_CONTRACT_FRAMEWORK_CREATED,
  REASSESSMENT_REQUIRED_D3_SOURCE_EXPOSED_AS_VALIDATED,
  RECOMMENDATION_EQUALS_APPROVAL,
  REVIEWED_EQUALS_VALIDATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R11_MUTATION_ALLOWED,
  STALE_D3_SOURCE_EXPOSED_AS_CURRENT,
  SUPERSEDED_D3_SOURCE_EXPOSED_AS_CURRENT,
  TENANT_WORKSPACE_PROJECT_D3_R11_SCOPE_ENFORCED,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER,
  VALIDATED_EQUALS_APPROVED,
  VALIDATED_EQUALS_CERTIFIED,
  VALIDATED_EQUALS_CONFORMANT,
  createD3R11Store,
  deriveGeotechnicalSourceFact,
  fabricateGeotechnicalCounterpart,
  inferGeotechnicalSourceLineage,
  recordGeotechnicalSourceContract,
  repointGeotechnicalSourceContract,
  startD9FromGeotechnicalSource,
} from "./d9-source-contract";

const actor: D3R1Actor = { actorId: "geotechnical-recorder", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: D3_CONTEXT_AUTHORITY };
const reviewer: D3R9Actor = { actorId: "geotechnical-reviewer", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "REVIEWER", actorKind: "human", aal: "aal2" };
const R12_SCOPE = "Perform bounded D3 track closeout across R1-R11. Verify architecture-to-runtime traceability, exact readiness states, discipline boundaries, D9 source-contract integrity, security/release posture and unresolved limitations. Do not add substantive D3 runtime, perform engineering calculations, close D1 debt, start D4-D9 runtime, or claim project/engineering validation, certification, conformance or GA readiness.";

describe("EOS-D3-R11 D9 source contract", () => {
  it("exposes exact Geotechnical revisions without inventing engineering or starting D9", () => {
    expect(D3_R11_STATUS).toBe("D9_SOURCE_CONTRACT_IMPLEMENTED");
    expect(D3_R11_MATURITY).toBe(D3_R11_STATUS);
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(11);
    expect(R10_RUNTIME_COUNT).toBe(10);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R11_STARTED).toBe(false);
    expect(R10_SOURCE_READY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT).toBe(1);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(true);
    expect(D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY).toBe(true);
    expect(D3_FIELD_LAB_TEST_RUNTIME_READY).toBe(true);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY).toBe(true);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY).toBe(true);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(true);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(true);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(true);
    expect(D3_REUSES_CANONICAL_D9_SOURCE_CONTRACT_GOVERNANCE).toBe(true);
    expect(PARALLEL_D3_D9_SOURCE_CONTRACT_FRAMEWORK_CREATED).toBe(false);
    expect(EXACT_D3_D9_SOURCE_REVISION_REQUIRED).toBe(true);
    expect(FLOATING_D3_D9_SOURCE_REFERENCE_ALLOWED).toBe(false);
    expect(D3_D9_SOURCE_AUTO_REPOINTED).toBe(false);
    expect(D3_D9_IDENTITY_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_INVESTIGATION_EVIDENCE_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_STRATIGRAPHY_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_MATERIAL_CLASSIFICATION_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_GROUNDWATER_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_FIELD_LAB_TEST_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_PARAMETER_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_FOUNDATION_EXCAVATION_SLOPE_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_REQUIREMENT_ASSUMPTION_DECISION_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_CHANGE_REASSESSMENT_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_INTERFACE_HANDOFF_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_REVIEW_VALIDATION_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_CURRENTNESS_LINEAGE_METADATA_EXPOSED).toBe(true);
    expect(D3_D9_SOURCE_PRESERVES_TRUTH_CLASSIFICATION).toBe(true);
    expect(OBSERVATION_EQUALS_INTERPRETATION).toBe(false);
    expect(TEST_RESULT_EQUALS_ENGINEERING_PARAMETER).toBe(false);
    expect(ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER).toBe(false);
    expect(RECOMMENDATION_EQUALS_APPROVAL).toBe(false);
    expect(D3_D9_SOURCE_AUTHORITY_EXPLICIT).toBe(true);
    expect(D3_D9_SOURCE_CONTRACT_TRANSFERS_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D3_D9_SOURCE_CURRENTNESS_EXPLICIT).toBe(true);
    expect(STALE_D3_SOURCE_EXPOSED_AS_CURRENT).toBe(false);
    expect(SUPERSEDED_D3_SOURCE_EXPOSED_AS_CURRENT).toBe(false);
    expect(REASSESSMENT_REQUIRED_D3_SOURCE_EXPOSED_AS_VALIDATED).toBe(false);
    expect(D3_D9_SOURCE_REVIEW_STATE_EXPLICIT).toBe(true);
    expect(D3_D9_SOURCE_VALIDATION_STATE_EXPLICIT).toBe(true);
    expect(REVIEWED_EQUALS_VALIDATED).toBe(false);
    expect(VALIDATED_EQUALS_CONFORMANT).toBe(false);
    expect(VALIDATED_EQUALS_APPROVED).toBe(false);
    expect(VALIDATED_EQUALS_CERTIFIED).toBe(false);
    expect(D3_D9_SOURCE_LIMITATIONS_EXPLICIT).toBe(true);
    expect(D3_D9_SOURCE_LIMITATIONS_PRESERVED).toBe(true);
    expect(D3_D9_SOURCE_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_D9_SOURCE_PROVENANCE_PRESERVED).toBe(true);
    expect(D3_R10_LINEAGE_REUSED).toBe(true);
    expect(D3_D9_SOURCE_LINEAGE_EXPLICIT).toBe(true);
    expect(INFERRED_D3_D9_LINEAGE_ALLOWED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_D9_SOURCE_FINGERPRINT_EXPOSED).toBe(true);
    expect(D3_R8_INTERFACE_METADATA_REUSED).toBe(true);
    expect(D3_D9_SOURCE_CONTRACT_CREATES_NEW_ENGINEERING_FACT).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_DERIVES_NEW_PARAMETER).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_GENERATES_NEW_RECOMMENDATION).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_PERFORMS_ENGINEERING_CALCULATION).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_TRANSFERS_D1_AUTHORITY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_TRANSFERS_D2_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_FABRICATES_COUNTERPART_DATA).toBe(false);
    expect([
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
      D3_D9_RUNTIME_INTEGRATION_COUNT,
      D9_RUNTIME_COUNT,
      D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT,
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_PILE_CAPACITY_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_EARTH_PRESSURE_RUNTIME_COUNT,
      D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
      D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
      D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
      D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
      D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D3_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
      D3_APPROVAL_RUNTIME_COUNT,
      D3_CERTIFICATION_RUNTIME_COUNT,
      D3_CONFORMANCE_CERTIFICATION_RUNTIME_COUNT,
    ]).toEqual(Array(22).fill(0));
    expect(D3_D9_SOURCE_CONTRACT_EXISTS_EQUALS_D9_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(PACK).toBe(false);
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D2_REOPENED).toBe(false);
    expect(D2_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D2_ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(SILENT_D3_R11_MUTATION_ALLOWED).toBe(false);
    expect(D3_R11_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R11_SCOPE_ENFORCED).toBe(true);
    expect(D3_R11_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D3_R11_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R11_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R12_STARTED).toBe(false);
    expect(D3_R12_CANONICAL_PHASE).toBe("EOS-D3-R12-GEOTECHNICAL-BOUNDED-CLOSEOUT");
    expect(D3_R12_PHASE_TYPE).toBe("GEOTECHNICAL_BOUNDED_CLOSEOUT");
    expect(D3_R11_CANONICAL_NEXT_PHASE).toBe(D3_R12_CANONICAL_PHASE);
    expect(D3_R11_NEXT_PHASE_TYPE).toBe("GEOTECHNICAL_BOUNDED_CLOSEOUT");
    expect(D3_R11_CANONICAL_NEXT_PHASE_SCOPE).toBe(R12_SCOPE);
    expect(D3_R12_CANONICAL_SCOPE).toBe(R12_SCOPE);
    expect(D3_R11_BLOCKER).toBe("NONE");

    const r1 = createD3R1Store();
    const context = recordGeotechnicalContext(r1, actor, { contextId: "geotech-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-geotech-context" });
    const site = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "site-1", contextId: context.contextId, objectType: "GEOTECHNICAL_SITE_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site" });
    const child = (objectId: string, objectType: "BOREHOLE" | "INVESTIGATION_LOCATION" | "STRATIGRAPHIC_LAYER" | "MATERIAL_CLASSIFICATION" | "GROUNDWATER_OBSERVATION" | "FIELD_TEST_RECORD" | "LAB_TEST_RECORD" | "GEOTECHNICAL_PARAMETER_SET" | "FOUNDATION_GEOTECHNICAL_CONTEXT" | "GEOTECHNICAL_REQUIREMENT" | "GEOTECHNICAL_ASSUMPTION" | "GEOTECHNICAL_DECISION" | "GEOTECHNICAL_GOVERNANCE_RECORD" | "GEOTECHNICAL_INTERFACE", provenanceRef: string, parentObjectId: string) => recordGeotechnicalObjectIdentity(r1, actor, { objectId, contextId: context.contextId, objectType, citedLifecycleStage: "CONCEPT", provenanceRef, parentObjectId });
    const borehole = child("borehole-1", "BOREHOLE", "prov-borehole-identity", site.objectId);
    const locationObject = child("location-1", "INVESTIGATION_LOCATION", "prov-location-identity", site.objectId);
    const layer = child("layer-1", "STRATIGRAPHIC_LAYER", "prov-layer-identity", borehole.objectId);
    const materialObject = child("material-1", "MATERIAL_CLASSIFICATION", "prov-material-identity", site.objectId);
    const groundwaterObject = child("groundwater-1", "GROUNDWATER_OBSERVATION", "prov-groundwater-identity", site.objectId);
    const fieldObject = child("field-1", "FIELD_TEST_RECORD", "prov-field-identity", site.objectId);
    const labObject = child("lab-1", "LAB_TEST_RECORD", "prov-lab-identity", site.objectId);
    const parameterObject = child("parameter-1", "GEOTECHNICAL_PARAMETER_SET", "prov-parameter-identity", site.objectId);
    const foundationObject = child("foundation-1", "FOUNDATION_GEOTECHNICAL_CONTEXT", "prov-foundation-identity", site.objectId);
    const requirementObject = child("requirement-1", "GEOTECHNICAL_REQUIREMENT", "prov-requirement-identity", site.objectId);
    const assumptionObject = child("assumption-1", "GEOTECHNICAL_ASSUMPTION", "prov-assumption-identity", site.objectId);
    const decisionObject = child("decision-1", "GEOTECHNICAL_DECISION", "prov-decision-identity", site.objectId);
    const governance = child("governance-1", "GEOTECHNICAL_GOVERNANCE_RECORD", "prov-governance", site.objectId);
    const interfaceObject = child("interface-1", "GEOTECHNICAL_INTERFACE", "prov-interface-identity", site.objectId);
    const r2 = createD3R2Store(r1);
    const program = recordInvestigationProgram(r2, actor, { investigationProgramId: "program-1", contextId: context.contextId, objectId: site.objectId, purpose: "Factual campaign", campaignRef: "campaign-a", method: "BOREHOLE_DRILLING", provider: "Field provider A", investigationDate: "2026-04-01", provenanceRef: "prov-program", citedCurrentness: "CURRENT" });
    const location = recordInvestigationLocationContext(r2, actor, { locationContextId: "location-context-1", investigationProgramId: program.investigationProgramId, contextId: context.contextId, objectId: locationObject.objectId, locationEvidenceRef: "survey-14", provenanceRef: "prov-location", citedCurrentness: "CURRENT" });
    recordBoreholeEvidenceContext(r2, actor, { boreholeEvidenceId: "borehole-evidence-1", investigationProgramId: program.investigationProgramId, contextId: context.contextId, objectId: borehole.objectId, sourceLogRef: "bh-log-001", drillingRecordRef: "drill-sheet-001", provider: "Driller A", investigationDate: "2026-04-03", factualDepth: "12.5 m recorded", provenanceRef: "prov-borehole-evidence", citedCurrentness: "CURRENT" });
    const evidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-log-1", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "BOREHOLE_LOG", sourceRevision: "rev-a", provenanceRef: "prov-log", citedCurrentness: "CURRENT" });
    const waterEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-groundwater-1", contextId: context.contextId, objectId: groundwaterObject.objectId, evidenceKind: "GROUNDWATER_OBSERVATION", sourceRevision: "standpipe-note-1", provenanceRef: "prov-water", citedCurrentness: "CURRENT" });
    const fieldEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-field-1", contextId: context.contextId, objectId: fieldObject.objectId, evidenceKind: "FIELD_TEST_DATA", sourceRevision: "spt-sheet-1", provenanceRef: "prov-field-evidence", citedCurrentness: "CURRENT" });
    const labEvidence = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-lab-1", contextId: context.contextId, objectId: labObject.objectId, evidenceKind: "LABORATORY_REPORT", sourceRevision: "lab-cert-1", provenanceRef: "prov-lab-evidence", citedCurrentness: "CURRENT" });
    const r3 = createD3R3Store(r2);
    const layerRecord = recordStratigraphicInterpretation(r3, actor, { stratigraphyId: "layer-interpretation-1", contextId: context.contextId, objectId: layer.objectId, locationContextId: location.locationContextId, boreholeEvidenceId: "borehole-evidence-1", evidenceReferenceIds: [evidence.evidenceReferenceId], depthInterval: "0.0 m to 2.4 m", materialDescription: "brown sand described on bh-log-001", layerSequence: "1", interpretationSource: "logged on bh-log-001", limitations: "Limited to the supplied log interval", provenanceRef: "prov-layer", citedCurrentness: "CURRENT" });
    recordMaterialClassificationContext(r3, actor, { materialClassificationId: "material-classification-1", contextId: context.contextId, objectId: materialObject.objectId, layerInterpretationId: layerRecord.stratigraphyId, evidenceReferenceIds: [evidence.evidenceReferenceId], classificationSystem: "supplied", classificationResult: "SP", materialDescription: "sand described on the log", limitations: "Classification is the supplied label", provenanceRef: "prov-material", citedCurrentness: "CURRENT" });
    recordGroundwaterContext(r3, actor, { groundwaterContextId: "groundwater-context-1", contextId: context.contextId, objectId: groundwaterObject.objectId, locationContextId: location.locationContextId, evidenceReferenceIds: [waterEvidence.evidenceReferenceId], observedWaterLevel: "4.2 m on the note", observationDate: "2026-04-03", interpretedContext: "one observation", seasonalLimitation: "one date only", limitations: "Not a design water level", provenanceRef: "prov-groundwater", citedCurrentness: "CURRENT" });
    const r4 = createD3R4Store(r3);
    const field = recordFieldTestResult(r4, actor, { fieldTestId: "field-test-1", testCategory: "SPT", contextId: context.contextId, objectId: fieldObject.objectId, locationContextId: location.locationContextId, evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], methodReference: "supplied method", measuredResult: "8", unit: "blows", provider: "Field provider A", testDate: "2026-04-03", limitations: "A supplied blow count", provenanceRef: "prov-field", citedCurrentness: "CURRENT" });
    const lab = recordLaboratoryTestResult(r4, actor, { labTestId: "lab-test-1", testCategory: "MOISTURE_CONTENT", contextId: context.contextId, objectId: labObject.objectId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], specimenReference: "spec-1", methodReference: "supplied method", measuredResult: "12", unit: "percent", provider: "Lab A", testDate: "2026-04-05", limitations: "A supplied moisture result", provenanceRef: "prov-lab", citedCurrentness: "CURRENT" });
    const r5 = createD3R5Store(r4);
    const parameter = recordGeotechnicalParameter(r5, actor, { parameterId: "parameter-1", parameterCategory: "COHESION", parameterStatus: "CANDIDATE", contextId: context.contextId, objectId: parameterObject.objectId, evidenceReferenceIds: [evidence.evidenceReferenceId], value: "25", unit: "kPa", sourceBasis: "GOVERNED_ASSUMPTION", derivationMethod: "supplied from the log", applicability: "the logged interval", limitations: "A candidate value", provenanceRef: "prov-parameter", citedCurrentness: "CURRENT" });
    const r6 = createD3R6Store(r5);
    const foundation = recordFoundationGeotechnicalContext(r6, actor, { contextRecordId: "foundation-record-1", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "the supplied pad note", limitations: "The note is not a calculation", provenanceRef: "prov-foundation", citedCurrentness: "CURRENT", sourceBasis: "R2_EVIDENCE", basisStatement: "The supplied note names the interval", evidenceReferenceIds: [evidence.evidenceReferenceId], recommendationText: "Found in the interval named on the log", recommendationStatus: "CANDIDATE" });
    const r7 = createD3R7Store(r6);
    const shared = { contextId: context.contextId, applicability: "the logged interval", limitations: "The statement stays on this revision", provenanceRef: "prov-governance-item", citedCurrentness: "CURRENT" as const, citedLifecycleStage: "CONCEPT", evidenceReferenceIds: [evidence.evidenceReferenceId] };
    recordGeotechnicalRequirement(r7, actor, { ...shared, requirementContextId: "requirement-context-1", objectId: requirementObject.objectId, requirementText: "Investigate the logged interval", sourceRef: "basis note", sourceRevision: "rev-a", affectedObjectIds: [site.objectId], jurisdictionProfileId: "global-baseline", requirementStatus: "PLANNED" });
    recordGeotechnicalAssumption(r7, actor, { ...shared, assumptionContextId: "assumption-context-1", objectId: assumptionObject.objectId, statement: "The logged interval is the one named", rationale: "The log is the supplied source", affectedObjectIds: [site.objectId], validationStatus: "unvalidated", materiality: "high" });
    recordGeotechnicalDecision(r7, actor, { ...shared, decisionContextId: "decision-context-1", objectId: decisionObject.objectId, statement: "Adopt the supplied note", rationale: "The note and the requirement name the same interval", affectedObjectIds: [site.objectId], alternatives: [{ id: "adopt", statement: "Keep the note", is_selected: true }] });
    const change = recordGeotechnicalChange(r7, actor, { changeContextId: "change-1", contextId: context.contextId, objectId: governance.objectId, changeCategory: "REASSESSMENT_REQUIRED", changedObjectId: site.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: site.objectId }], rationale: "A later note is recorded", limitations: "The change does not perform reassessment", reassessmentRequired: true, provenanceRef: "prov-change-1", citedCurrentness: "CURRENT", evidenceReferenceIds: [evidence.evidenceReferenceId] });
    const r8 = createD3R8Store(r7);
    const handoff = recordGeotechnicalInterfaceHandoff(r8, actor, { handoffId: "handoff-mech", contextId: context.contextId, objectId: interfaceObject.objectId, sourceObjectId: site.objectId, sourceRevision: site.provenanceRef, counterpartDiscipline: "mechanical", direction: "D3_TO_COUNTERPART", interfaceTopic: "DISCIPLINE_OBJECT_IDENTITY_CITATION", counterpartInterfaceId: null, counterpartSourceRevision: null, evidenceReferenceIds: [evidence.evidenceReferenceId], limitations: "No counterpart record exists", handoffStatus: "NOT_YET_AVAILABLE", provenanceRef: "prov-handoff-mech", citedCurrentness: "CURRENT" });
    const r9 = createD3R9Store(r8);
    const subject = { contextId: context.contextId, subjectKind: "OBJECT" as const, subjectId: site.objectId, subjectRevision: site.provenanceRef, subjectFingerprint: site.fingerprint, evidenceReferenceIds: [evidence.evidenceReferenceId] };
    const request = recordGeotechnicalReviewRequest(r9, actor, { ...subject, reviewRequestId: "review-1", reviewType: "GEOTECHNICAL_SUBJECT_REVIEW", reviewScope: "Site identity", purpose: "Review this exact revision", requestedReviewerAuthority: "REVIEWER", limitations: "A request is not validation", requestedAt: "2026-10-24T01:00:00.000Z", citedCurrentness: "CURRENT", provenanceRef: "prov-review-1" });
    const validation = recordGeotechnicalValidationState(r9, reviewer, { ...subject, validationId: "validation-1", reviewRequestId: request.reviewRequestId, validationScope: "Site identity", requiredEvidenceReferenceIds: [evidence.evidenceReferenceId], validationState: "VALIDATED", limitations: "Validation stays on this revision", citedCurrentness: "CURRENT", provenanceRef: "prov-validation-1" });
    const r10 = createD3R10Store(r9);
    recordGeotechnicalLineage(r10, actor, { lineageId: "line-evidence", contextId: context.contextId, source: { subjectKind: "EVIDENCE", subjectId: evidence.evidenceReferenceId, subjectRevision: evidence.provenanceRef, subjectFingerprint: evidence.fingerprint }, target: { subjectKind: "OBJECT", subjectId: site.objectId, subjectRevision: site.provenanceRef, subjectFingerprint: site.fingerprint }, relationshipType: "SUPPORTED_BY", geotechnicalDependency: "INVESTIGATION_EVIDENCE_TO_STRATIGRAPHY_AND_GROUNDWATER", citedCurrentness: "CURRENT", provenanceRef: "prov-line-evidence" });
    recordGeotechnicalCurrentness(r10, actor, { eventId: "mark-handoff", contextId: context.contextId, subject: { subjectKind: "HANDOFF", subjectId: handoff.handoffId, subjectRevision: handoff.sourceRevision, subjectFingerprint: handoff.fingerprint }, currentness: "STALE", provenanceRef: "prov-mark-handoff" });
    const store = createD3R11Store(r10);
    const contract = recordGeotechnicalSourceContract(store, actor, { contractId: "contract-1", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-1" });
    const fields = contract.fields as {
      OBJECT_IDENTITY: { discipline: string };
      EXACT_REVISION: string;
      EVIDENCE: { subjectId: string; truthClass: string; engineeringValidated: boolean }[];
      STRATIGRAPHY: { truthClass: string; rawEvidence: boolean }[];
      MATERIAL_CLASSIFICATION: { parameterSet: boolean }[];
      GROUNDWATER: { designGroundwaterLevel: boolean }[];
      FIELD_LAB_TESTS: { fieldTests: { engineeringParameter: boolean; measuredResult: string }[]; labTests: { engineeringParameter: boolean }[] };
      GEOTECHNICAL_PARAMETERS: { value: string; validatedDesignParameter: boolean; testResult: boolean }[];
      FOUNDATION_EXCAVATION_SLOPE: { recommendationText: string | null; approved: boolean }[];
      REQUIREMENTS: { requirementSatisfied: boolean }[];
      ASSUMPTIONS: { validationStatus: string }[];
      DECISIONS: { engineeringApproved: boolean }[];
      CHANGES: { reassessmentRequired: boolean; automaticRecalculation: boolean }[];
      INTERFACE_HANDOFFS: { currentness: string; complete: boolean; counterpart: unknown; counterpartFabricated: boolean; exactRevision: string }[];
      D1_INTERFACE_RECORDS: unknown[];
      D2_INTERFACE_RECORDS: unknown[];
      REVIEW_VALIDATION_STATE: { reviews: { reviewCompleted: boolean; engineeringValidated: boolean }[]; validations: { engineeringValidated: boolean; conformant: boolean; approved: boolean; certified: boolean }[] };
      LINEAGE: { inferred: boolean; engineeringValidated: boolean; sourceRevision: string }[];
      LIMITATIONS: string[];
      CANONICAL_FINGERPRINT: string;
    };
    expect(contract.exactRevision).toBe(site.provenanceRef);
    expect(fields.OBJECT_IDENTITY.discipline).toBe("GEOTECHNICAL");
    expect(fields.EXACT_REVISION).toBe(site.provenanceRef);
    expect(fields.EVIDENCE[0]?.truthClass).toBe("OBSERVATION");
    expect(fields.EVIDENCE[0]?.engineeringValidated).toBe(false);
    expect(fields.STRATIGRAPHY[0]?.truthClass).toBe("INTERPRETATION");
    expect(fields.STRATIGRAPHY[0]?.rawEvidence).toBe(false);
    expect(fields.MATERIAL_CLASSIFICATION[0]?.parameterSet).toBe(false);
    expect(fields.GROUNDWATER[0]?.designGroundwaterLevel).toBe(false);
    expect(fields.FIELD_LAB_TESTS.fieldTests[0]?.measuredResult).toBe(field.measuredResult);
    expect(fields.FIELD_LAB_TESTS.fieldTests[0]?.engineeringParameter).toBe(false);
    expect(fields.FIELD_LAB_TESTS.labTests[0]?.engineeringParameter).toBe(false);
    expect(fields.GEOTECHNICAL_PARAMETERS[0]?.value).toBe(parameter.value);
    expect(fields.GEOTECHNICAL_PARAMETERS[0]?.validatedDesignParameter).toBe(false);
    expect(fields.GEOTECHNICAL_PARAMETERS[0]?.testResult).toBe(false);
    expect(fields.FOUNDATION_EXCAVATION_SLOPE[0]?.recommendationText).toBe(foundation.recommendationText);
    expect(fields.FOUNDATION_EXCAVATION_SLOPE[0]?.approved).toBe(false);
    expect(fields.REQUIREMENTS[0]?.requirementSatisfied).toBe(false);
    expect(fields.ASSUMPTIONS[0]?.validationStatus).toBe("unvalidated");
    expect(fields.DECISIONS[0]?.engineeringApproved).toBe(false);
    expect(fields.CHANGES[0]?.reassessmentRequired).toBe(true);
    expect(fields.CHANGES[0]?.automaticRecalculation).toBe(false);
    expect(fields.INTERFACE_HANDOFFS[0]?.currentness).toBe("STALE");
    expect(fields.INTERFACE_HANDOFFS[0]?.complete).toBe(false);
    expect(fields.INTERFACE_HANDOFFS[0]?.counterpart).toBeNull();
    expect(fields.INTERFACE_HANDOFFS[0]?.counterpartFabricated).toBe(false);
    expect(fields.INTERFACE_HANDOFFS[0]?.exactRevision).toBe(site.provenanceRef);
    expect(fields.D1_INTERFACE_RECORDS).toEqual([]);
    expect(fields.D2_INTERFACE_RECORDS).toEqual([]);
    expect(fields.REVIEW_VALIDATION_STATE.reviews[0]?.reviewCompleted).toBe(false);
    expect(fields.REVIEW_VALIDATION_STATE.reviews[0]?.engineeringValidated).toBe(false);
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.engineeringValidated).toBe(true);
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.conformant).toBe(false);
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.approved).toBe(false);
    expect(fields.REVIEW_VALIDATION_STATE.validations[0]?.certified).toBe(false);
    expect(contract.representedAsValidated).toBe(true);
    expect(contract.conformant).toBe(false);
    expect(contract.authorityTransferred).toBe(false);
    expect(contract.d9Started).toBe(false);
    expect(fields.LINEAGE[0]?.inferred).toBe(false);
    expect(fields.LINEAGE[0]?.engineeringValidated).toBe(false);
    expect(fields.LINEAGE[0]?.sourceRevision).toBe(evidence.provenanceRef);
    expect(fields.LIMITATIONS.some((row) => row.includes("future D9"))).toBe(true);
    expect(fields.CANONICAL_FINGERPRINT).toBe(contract.fingerprint);
    expect(recordGeotechnicalSourceContract(store, actor, { contractId: "contract-1", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-contract-1" }).fingerprint).toBe(contract.fingerprint);
    expect(store.contracts).toHaveLength(1);
    expect(store.history.some((row) => row.fingerprint === contract.fingerprint)).toBe(true);
    expect(evidence.fingerprint).toBeTruthy();
    expect(parameter.value).toBe("25");
    expect(foundation.recommendationText).toBe("Found in the interval named on the log");
    expect(handoff.sourceRevision).toBe(site.provenanceRef);
    expect(validation.engineeringValidated).toBe(true);
    expect(validation.subjectRevision).toBe(site.provenanceRef);
    expect(request.reviewCompleted).toBe(false);
    expect(lab.engineeringParameter).toBe(false);
    expect(change.automaticRecalculation).toBe(false);

    expect(() => recordGeotechnicalSourceContract(store, actor, { contractId: "contract-float", contextId: context.contextId, objectId: site.objectId, sourceRevision: "latest", citedCurrentness: "CURRENT", provenanceRef: "prov-float" })).toThrow(/SUBJECT_REVISION_REQUIRED/);
    expect(() => recordGeotechnicalSourceContract(store, actor, { contractId: "contract-stale", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "STALE", provenanceRef: "prov-stale" })).toThrow(/CURRENTNESS_MISMATCH/);
    expect(() => recordGeotechnicalSourceContract(store, actor, { contractId: "contract-infer", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-infer", sameBorehole: true })).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => recordGeotechnicalSourceContract(store, { ...actor, actorId: "AI_recorder", actorKind: "ai" }, { contractId: "contract-ai", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-ai" })).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalSourceContract(store, { ...actor, authority: "ADMIN" }, { contractId: "contract-admin", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-admin" })).toThrow(/ADMIN_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalSourceContract(store, actor, { contractId: "contract-cross", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-cross", projectId: "project-b" })).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordGeotechnicalSourceContract(store, actor, { contractId: "contract-spoof", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-spoof", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordGeotechnicalSourceContract(store, actor, { contractId: "contract-1", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-other" })).toThrow(/DUPLICATE_SOURCE_CONTRACT_REJECTED/);
    expect(() => recordGeotechnicalSourceContract(store, actor, { contractId: "contract-derive", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-derive", derive: true })).toThrow(/PARAMETER_DERIVATION_NOT_IN_R11/);
    expect(() => recordGeotechnicalSourceContract(store, actor, { contractId: "contract-counterpart", contextId: context.contextId, objectId: site.objectId, sourceRevision: site.provenanceRef, citedCurrentness: "CURRENT", provenanceRef: "prov-counterpart", fabricateCounterpart: true })).toThrow(/COUNTERPART_FABRICATION_REJECTED/);
    expect(() => inferGeotechnicalSourceLineage()).toThrow(/INFERRED_LINEAGE_REJECTED/);
    expect(() => repointGeotechnicalSourceContract()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => deriveGeotechnicalSourceFact()).toThrow(/PARAMETER_DERIVATION_NOT_IN_R11/);
    expect(() => startD9FromGeotechnicalSource()).toThrow(/D9_NOT_STARTED/);
    expect(() => fabricateGeotechnicalCounterpart()).toThrow(/COUNTERPART_FABRICATION_REJECTED/);
    expect(() => { (contract as { provenanceRef: string }).provenanceRef = "silent"; }).toThrow();
    expect(contract.exactRevision).toBe(site.provenanceRef);
    expect(handoff.sourceRevision).toBe(site.provenanceRef);
    const here = dirname(fileURLToPath(import.meta.url));
    const sourceText = readFileSync(join(here, "d9-source-contract.ts"), "utf8");
    expect(sourceText).toContain("fingerprintCanonical");
    expect(sourceText).toContain("D3_D9_SOURCE_CONTRACT_FIELDS");
    expect(sourceText).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "d9-source-contract.ts"), sourceText)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R11.D9_SOURCE_CONTRACT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R12.GEOTECHNICAL_BOUNDED_CLOSEOUT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
