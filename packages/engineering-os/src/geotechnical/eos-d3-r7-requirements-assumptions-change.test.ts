import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D3_0_RUNTIME_STARTED, D3_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { D3_CONTEXT_AUTHORITY, D3_RUNTIME_COUNT as R1_RUNTIME_COUNT, createD3R1Store, recordGeotechnicalContext, recordGeotechnicalObjectIdentity, type D3R1Actor } from "./identity-foundation";
import { D3_RUNTIME_COUNT as R2_RUNTIME_COUNT, createD3R2Store, recordBoreholeEvidenceContext, recordInvestigationEvidenceReference, recordInvestigationLocationContext, recordInvestigationProgram } from "./site-investigation-evidence";
import { D3_RUNTIME_COUNT as R3_RUNTIME_COUNT, createD3R3Store, recordGroundwaterContext, recordMaterialClassificationContext, recordStratigraphicInterpretation } from "./stratigraphy-groundwater-material";
import { D3_RUNTIME_COUNT as R4_RUNTIME_COUNT, createD3R4Store, recordFieldTestResult, recordLaboratoryTestResult } from "./field-lab-test-context";
import { D3_RUNTIME_COUNT as R5_RUNTIME_COUNT, createD3R5Store, recordGeotechnicalParameter } from "./geotechnical-parameter-context";
import {
  D3_R7_CANONICAL_SCOPE as R6_STORED_R7_SCOPE,
  D3_R7_STARTED,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT as R6_CHANGE_RUNTIME_COUNT,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY as R6_CHANGE_READY,
  D3_RUNTIME_COUNT as R6_RUNTIME_COUNT,
  createD3R6Store,
  recordExcavationGeotechnicalContext,
  recordFoundationGeotechnicalContext,
} from "./foundation-excavation-slope-context";
import {
  ADMIN_ACTION_EQUALS_ENGINEERING_DECISION,
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_CAN_CLOSE_D3_REASSESSMENT_AS_ENGINEERING_COMPLETE,
  AI_CAN_CREATE_AUTHORITATIVE_D3_ENGINEERING_DECISION,
  AI_CAN_INVENT_AUTHORITATIVE_D3_ASSUMPTION,
  AI_CAN_INVENT_AUTHORITATIVE_D3_REQUIREMENT,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION,
  ASSUMPTION_EQUALS_VALIDATED_ENGINEERING_FACT,
  CANONICAL_CURRENTNESS_REUSED,
  CANONICAL_FINGERPRINT_REUSED,
  CHANGE_ACCEPTED_EQUALS_ENGINEERING_APPROVED,
  D2_REOPENED,
  D3_APPROVAL_RUNTIME_COUNT,
  D3_ASSUMPTION_CONTEXT_IMPLEMENTED,
  D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT,
  D3_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT,
  D3_CHANGE_AUTO_MUTATES_D1_STRUCTURAL_OBJECT,
  D3_CHANGE_AUTO_MUTATES_D2_CIVIL_OBJECT,
  D3_CHANGE_AUTO_MUTATES_R3_INTERPRETATION,
  D3_CHANGE_AUTO_MUTATES_R4_TEST_RESULT,
  D3_CHANGE_AUTO_MUTATES_R5_PARAMETER,
  D3_CHANGE_AUTO_MUTATES_R6_RECOMMENDATION,
  D3_CHANGE_AUTO_RECALCULATES_PARAMETER,
  D3_CHANGE_AUTO_REDESIGNS_EXCAVATION,
  D3_CHANGE_AUTO_REDESIGNS_FOUNDATION,
  D3_CHANGE_AUTO_REDESIGNS_SLOPE,
  D3_CHANGE_CONTEXT_IMPLEMENTED,
  D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY,
  D3_D9_RUNTIME_INTEGRATION_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D3_EARTH_PRESSURE_RUNTIME_COUNT,
  D3_ENGINEERING_DECISION_CONTEXT_IMPLEMENTED,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D3_EQUALS_D2_CIVIL_AUTHORITY,
  D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT,
  D3_EXPLICIT_CHANGE_DEPENDENCY_SUPPORTED,
  D3_EXPLICIT_CHANGE_RELATIONSHIPS_SUPPORTED,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY,
  D3_GOVERNANCE_REFERENCE_AUTO_REPOINTED,
  D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT,
  D3_INFERRED_DEPENDENCY_PROPAGATION_ALLOWED,
  D3_PILE_CAPACITY_RUNTIME_COUNT,
  D3_R7_AUTO_REPOINTED,
  D3_R7_BLOCKER,
  D3_R7_CANONICAL_NEXT_PHASE,
  D3_R7_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D3_R7_HISTORY_PRESERVED,
  D3_R7_MATURITY,
  D3_R7_NEXT_PHASE_TYPE,
  D3_R7_PROVENANCE_PRESERVED,
  D3_R7_PROVENANCE_REQUIRED,
  D3_R7_REPLAY_PROTECTION_IMPLEMENTED,
  D3_R7_SPOOFING_PROTECTION_IMPLEMENTED,
  D3_R7_STATUS,
  D3_R8_STARTED,
  D3_REQUIREMENT_CONTEXT_IMPLEMENTED,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED,
  D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT,
  D3_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE,
  D3_REUSES_CANONICAL_CHANGE_GOVERNANCE,
  D3_REUSES_CANONICAL_DECISION_GOVERNANCE,
  D3_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY,
  D3_SUPERSEDED_RECORD_AUTOMATICALLY_DELETED,
  D3_SUPERSESSION_REWRITES_HISTORY,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DECISION_RECORDED_EQUALS_ENGINEERING_CERTIFIED,
  EXACT_D3_R1_R6_SUBJECT_REFERENCE_REQUIRED,
  FLOATING_D3_GOVERNANCE_SUBJECT_REFERENCE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D3_ASSUMPTION_SYSTEM_CREATED,
  PARALLEL_D3_CHANGE_SYSTEM_CREATED,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D3_DECISION_SYSTEM_CREATED,
  PARALLEL_D3_REQUIREMENT_SYSTEM_CREATED,
  REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED,
  REASSESSMENT_REQUIRED_EQUALS_INVALID,
  REASSESSMENT_REQUIRED_EQUALS_RECALCULATED,
  REASSESSMENT_REQUIRED_EQUALS_REDESIGNED,
  REASSESSMENT_REQUIRED_EQUALS_VALIDATED,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_R7_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D3_R7_SCOPE_ENFORCED,
  closeGeotechnicalReassessment,
  createD3R7Store,
  inferGeotechnicalDependencies,
  mutateRequirementsAssumptionsChange,
  recordGeotechnicalAssumption,
  recordGeotechnicalChange,
  recordGeotechnicalDecision,
  recordGeotechnicalRequirement,
  repointGovernanceRecord,
} from "./requirements-assumptions-change";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

const R8_SCOPE = "Implement governed D3 interfaces/handoffs to D1 Structural and D2 Civil using exact D3 revisions while establishing bounded placeholders/contracts for future D4-D8. Preserve discipline authority and explicit currentness/limitations. Do not perform cross-discipline reasoning, conflict resolution, counterpart validation, automatic redesign or start D4-D9 runtime.";

describe("EOS-D3-R7 requirements assumptions and change", () => {
  it("records governed requirements, assumptions, decisions and explicit change without performing reassessment", () => {
    expect(D3_R7_STATUS).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED");
    expect(D3_R7_MATURITY).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE_IMPLEMENTED");
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(7);
    expect(R6_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(D3_R7_STARTED).toBe(false);
    expect(R6_CHANGE_READY).toBe(false);
    expect(R6_CHANGE_RUNTIME_COUNT).toBe(0);
    expect(D3_R8_STARTED).toBe(false);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT).toBe(1);
    expect(D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(true);
    expect(D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY).toBe(true);
    expect(D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY).toBe(true);
    expect(D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY).toBe(true);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(false);
    expect(D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D3_REUSES_CANONICAL_REQUIREMENT_GOVERNANCE).toBe(true);
    expect(D3_REUSES_CANONICAL_ASSUMPTION_GOVERNANCE).toBe(true);
    expect(D3_REUSES_CANONICAL_DECISION_GOVERNANCE).toBe(true);
    expect(D3_REUSES_CANONICAL_CHANGE_GOVERNANCE).toBe(true);
    expect(PARALLEL_D3_REQUIREMENT_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D3_ASSUMPTION_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D3_DECISION_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D3_CHANGE_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D3_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(EXACT_D3_R1_R6_SUBJECT_REFERENCE_REQUIRED).toBe(true);
    expect(FLOATING_D3_GOVERNANCE_SUBJECT_REFERENCE_ALLOWED).toBe(false);
    expect(D3_GOVERNANCE_REFERENCE_AUTO_REPOINTED).toBe(false);
    expect(D3_REQUIREMENT_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_ASSUMPTION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_ENGINEERING_DECISION_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_CHANGE_CONTEXT_IMPLEMENTED).toBe(true);
    expect(D3_EXPLICIT_CHANGE_RELATIONSHIPS_SUPPORTED).toBe(true);
    expect(D3_EXPLICIT_CHANGE_DEPENDENCY_SUPPORTED).toBe(true);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D3_REQUIREMENT).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_D3_ASSUMPTION).toBe(false);
    expect(AI_CAN_CREATE_AUTHORITATIVE_D3_ENGINEERING_DECISION).toBe(false);
    expect(ASSUMPTION_EQUALS_VALIDATED_ENGINEERING_FACT).toBe(false);
    expect(AI_RECOMMENDATION_EQUALS_ENGINEERING_DECISION).toBe(false);
    expect(ADMIN_ACTION_EQUALS_ENGINEERING_DECISION).toBe(false);
    expect(D3_SUPERSESSION_REWRITES_HISTORY).toBe(false);
    expect(D3_SUPERSEDED_RECORD_AUTOMATICALLY_DELETED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_INVALID).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_RECALCULATED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_REDESIGNED).toBe(false);
    expect(REASSESSMENT_REQUIRED_EQUALS_VALIDATED).toBe(false);
    expect(REASSESSMENT_COMPLETED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(CHANGE_ACCEPTED_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(DECISION_RECORDED_EQUALS_ENGINEERING_CERTIFIED).toBe(false);
    expect(D3_INFERRED_DEPENDENCY_PROPAGATION_ALLOWED).toBe(false);
    expect(D3_CHANGE_AUTO_MUTATES_R3_INTERPRETATION).toBe(false);
    expect(D3_CHANGE_AUTO_MUTATES_R4_TEST_RESULT).toBe(false);
    expect(D3_CHANGE_AUTO_MUTATES_R5_PARAMETER).toBe(false);
    expect(D3_CHANGE_AUTO_MUTATES_R6_RECOMMENDATION).toBe(false);
    expect(D3_CHANGE_AUTO_RECALCULATES_PARAMETER).toBe(false);
    expect(D3_CHANGE_AUTO_REDESIGNS_FOUNDATION).toBe(false);
    expect(D3_CHANGE_AUTO_REDESIGNS_EXCAVATION).toBe(false);
    expect(D3_CHANGE_AUTO_REDESIGNS_SLOPE).toBe(false);
    expect(D3_CHANGE_AUTO_MUTATES_D1_STRUCTURAL_OBJECT).toBe(false);
    expect(D3_CHANGE_AUTO_MUTATES_D2_CIVIL_OBJECT).toBe(false);
    expect(AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(AI_CAN_CLOSE_D3_REASSESSMENT_AS_ENGINEERING_COMPLETE).toBe(false);
    expect(CANONICAL_CURRENTNESS_REUSED).toBe(true);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_R7_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_R7_PROVENANCE_PRESERVED).toBe(true);
    expect(D3_R7_AUTO_REPOINTED).toBe(false);
    expect(SILENT_D3_R7_MUTATION_ALLOWED).toBe(false);
    expect(D3_R7_HISTORY_PRESERVED).toBe(true);
    expect(TENANT_WORKSPACE_PROJECT_D3_R7_SCOPE_ENFORCED).toBe(true);
    expect(D3_R7_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D3_R7_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_R7_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect([
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
      D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
      D3_APPROVAL_RUNTIME_COUNT,
      D3_CERTIFICATION_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
      D3_D9_RUNTIME_INTEGRATION_COUNT,
    ]).toEqual(Array(21).fill(0));
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
    expect(D3_R7_CANONICAL_NEXT_PHASE).toBe("EOS-D3-R8-DISCIPLINE-INTERFACES-AND-HANDOFFS");
    expect(D3_R7_NEXT_PHASE_TYPE).toBe("DISCIPLINE_INTERFACES_AND_HANDOFFS");
    expect(D3_R7_CANONICAL_NEXT_PHASE_SCOPE).toBe(R8_SCOPE);
    expect(D3_R7_BLOCKER).toBe("NONE");
    expect(R6_STORED_R7_SCOPE).toBe("Implement governed Geotechnical requirements, assumptions, decisions and change relationships using exact R1-R6 references and canonical EOS governance. Support explicit reassessment/change relationships without inferred dependency propagation, automatic recalculation, redesign or automatic invalidation. Do not start D4-D9.");

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
    const requirementObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "requirement-object-1", contextId: context.contextId, objectType: "GEOTECHNICAL_REQUIREMENT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-requirement-identity" });
    const assumptionObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "assumption-object-1", contextId: context.contextId, objectType: "GEOTECHNICAL_ASSUMPTION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-assumption-identity" });
    const decisionObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "decision-object-1", contextId: context.contextId, objectType: "GEOTECHNICAL_DECISION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-decision-identity" });
    const changeObject = recordGeotechnicalObjectIdentity(r1, actor, { objectId: "change-object-1", contextId: context.contextId, objectType: "GEOTECHNICAL_GOVERNANCE_RECORD", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-change-identity" });
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
    const field = recordFieldTestResult(r4, actor, { fieldTestId: "field-test-1", contextId: context.contextId, objectId: fieldObject.objectId, testCategory: "SPT", locationContextId: location.locationContextId, stratigraphyId: stratigraphy.stratigraphyId, depthOrElevation: "1.5 m as written on spt-sheet-1", methodReference: "ASTM D1586 as cited on spt-sheet-1", measuredResult: "12", unit: "blows per 300 mm", evidenceReferenceIds: [fieldEvidence.evidenceReferenceId], provider: "Field crew A", testDate: "2026-04-03", limitations: "Supplied blow count only", provenanceRef: "prov-spt", citedCurrentness: "CURRENT" });
    const lab = recordLaboratoryTestResult(r4, actor, { labTestId: "lab-test-1", contextId: context.contextId, objectId: labObject.objectId, testCategory: "DIRECT_SHEAR", materialClassificationId: material.materialClassificationId, specimenReference: "specimen-16 as labeled on lab-cert-1", methodReference: "ASTM D3080 as cited on lab-cert-1", measuredResult: "32", unit: "degrees", evidenceReferenceIds: [labEvidence.evidenceReferenceId], provider: "Laboratory A", testDate: "2026-04-06", limitations: "Supplied shear result only", provenanceRef: "prov-shear", citedCurrentness: "CURRENT" });
    const r5 = createD3R5Store(r4);
    const parameter = recordGeotechnicalParameter(r5, actor, { parameterId: "parameter-phi-1", parameterCategory: "EFFECTIVE_FRICTION_ANGLE", parameterStatus: "GOVERNED_ADOPTED", contextId: context.contextId, objectId: parameterObject.objectId, stratigraphyId: stratigraphy.stratigraphyId, materialClassificationId: material.materialClassificationId, labTestId: lab.labTestId, evidenceReferenceIds: [labEvidence.evidenceReferenceId], value: "30", unit: "degrees", sourceBasis: "DIRECT_TEST_RESULT", derivationMethod: "Adopted below the laboratory peak as written in the parameter selection note", applicability: "drained effective-stress strength for layer 1 between 0.0 m and 2.4 m", limitations: "Adopted value is not a validated design parameter", provenanceRef: "prov-phi", citedCurrentness: "CURRENT" });
    const r6 = createD3R6Store(r5);
    const foundation = recordFoundationGeotechnicalContext(r6, actor, { contextRecordId: "foundation-record-1", contextId: context.contextId, objectId: foundationObject.objectId, condition: "PERMANENT", applicability: "pad footings on layer 1 between 0.0 m and 2.4 m only", limitations: "Geotechnical context is not a structural foundation design", provenanceRef: "prov-foundation", citedCurrentness: "CURRENT", sourceBasis: "R5_PARAMETER", basisStatement: "Founding note cites parameter-phi-1 and geotech-note-1", evidenceReferenceIds: [reportEvidence.evidenceReferenceId], parameterIds: [parameter.parameterId], stratigraphyId: stratigraphy.stratigraphyId, foundingDepthOrRange: "1.2 m to 1.8 m as written on geotech-note-1", recommendationText: "Found pad footings within the stated depth range on layer 1", recommendationStatus: "GOVERNED_ADOPTED" });
    const excavation = recordExcavationGeotechnicalContext(r6, actor, { contextRecordId: "excavation-record-1", contextId: context.contextId, objectId: excavationObject.objectId, condition: "TEMPORARY", applicability: "temporary trench beside borehole-1 only", limitations: "Constraint record does not design excavation support", provenanceRef: "prov-excavation", citedCurrentness: "CURRENT", sourceBasis: "R3_INTERPRETATION", basisStatement: "Excavation note cites standpipe-1", evidenceReferenceIds: [groundwaterEvidence.evidenceReferenceId], groundwaterContextId: groundwater.groundwaterContextId, excavationDepthOrRange: "2.0 m as written on the excavation note" });
    const objectCount = r1.objects.length;
    const parameterFingerprint = parameter.fingerprint;
    const stratigraphyFingerprint = stratigraphy.fingerprint;
    const fieldFingerprint = field.fingerprint;
    const labFingerprint = lab.fingerprint;
    const foundationFingerprint = foundation.fingerprint;
    const excavationFingerprint = excavation.fingerprint;
    const store = createD3R7Store(r6);
    const shared = { contextId: context.contextId, applicability: "pad footings on layer 1 between 0.0 m and 2.4 m only", limitations: "Governance record does not recalculate or redesign", provenanceRef: "prov-governance", citedCurrentness: "CURRENT", citedLifecycleStage: "CONCEPT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId] };
    const requirement = recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-1", objectId: requirementObject.objectId, requirementText: "Investigate layer 1 to 2.4 m before founding as written on bh-log-001", sourceRef: "project geotechnical basis note", sourceRevision: "rev-a", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline", requirementStatus: "PLANNED" });
    expect(requirement.requirementSatisfied).toBe(false);
    expect(requirement.engineeringValidated).toBe(false);
    expect(requirement.authority).toBe(D3_CONTEXT_AUTHORITY);
    expect(recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-1", objectId: requirementObject.objectId, requirementText: "Investigate layer 1 to 2.4 m before founding as written on bh-log-001", sourceRef: "project geotechnical basis note", sourceRevision: "rev-a", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline", requirementStatus: "PLANNED" }).fingerprint).toBe(requirement.fingerprint);
    expect(store.requirements).toHaveLength(1);
    const preservedRequirement = requirement.fingerprint;
    const revisedRequirement = recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-1b", objectId: requirementObject.objectId, requirementText: "Investigate layer 1 to 2.4 m and record groundwater before founding", sourceRef: "project geotechnical basis note", sourceRevision: "rev-b", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline", requirementStatus: "REQUESTED", predecessorRequirementContextId: requirement.requirementContextId });
    const historicalRequirement = store.requirements.find((row) => row.requirementContextId === requirement.requirementContextId);
    expect(revisedRequirement.recordStatus).toBe("CURRENT");
    expect(historicalRequirement?.recordStatus).toBe("SUPERSEDED");
    expect(historicalRequirement?.fingerprint).toBe(preservedRequirement);
    expect(historicalRequirement?.evidenceReferenceIds).toEqual(["evidence-log-1"]);
    expect(store.requirements).toHaveLength(2);
    expect(store.history.some((row) => row.subjectKind === "REQUIREMENT" && row.action === "SUPERSEDED" && row.fingerprint === preservedRequirement)).toBe(true);
    const assumption = recordGeotechnicalAssumption(store, actor, { ...shared, assumptionContextId: "assumption-1", objectId: assumptionObject.objectId, statement: "Layer 1 remains the founding layer stated on bh-log-001", rationale: "The supplied log interval is the only interval named for the pads", affectedObjectIds: [foundationObject.objectId], validationStatus: "unvalidated", materiality: "high" });
    expect(assumption.validationStatus).toBe("unvalidated");
    expect(assumption.validatedEngineeringFact).toBe(false);
    const decision = recordGeotechnicalDecision(store, actor, { ...shared, decisionContextId: "decision-1", objectId: decisionObject.objectId, statement: "Adopt the supplied founding note for the layer 1 pads", rationale: "The note and the recorded requirement identify the same interval", affectedObjectIds: [foundationObject.objectId], requirementContextIds: [revisedRequirement.requirementContextId], assumptionContextIds: [assumption.assumptionContextId], alternatives: [{ id: "adopt-note", statement: "Keep the supplied founding note", is_selected: true }, { id: "defer-note", statement: "Defer the founding note", is_selected: false }] });
    expect(decision.authoritativeDecision).toBe(true);
    expect(decision.aiRecommendation).toBe(false);
    expect(decision.engineeringCertified).toBe(false);
    expect(decision.engineeringApproved).toBe(false);
    expect(decision.engineeringValidated).toBe(false);
    const change = recordGeotechnicalChange(store, actor, { changeContextId: "change-1", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "PARAMETER_CHANGED", changedObjectId: parameterObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }, { kind: "OBJECT_REFERENCE", targetObjectId: parameterObject.objectId }], rationale: "The parameter selection note revision is recorded as an explicit subject change", limitations: "Recording the change does not recalculate or redesign", reassessmentRequired: true, provenanceRef: "prov-change", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId] });
    expect(change.reassessmentRequired).toBe(true);
    expect(change.engineeringInvalid).toBe(false);
    expect(change.automaticRecalculation).toBe(false);
    expect(change.automaticRedesign).toBe(false);
    expect(change.engineeringApproved).toBe(false);
    expect(store.reassessments).toEqual([
      { objectId: foundationObject.objectId, changeContextId: "change-1", status: "REASSESSMENT_REQUIRED", engineeringInvalid: false, automaticRecalculation: false, automaticRedesign: false, engineeringValidated: false },
      { objectId: parameterObject.objectId, changeContextId: "change-1", status: "REASSESSMENT_REQUIRED", engineeringInvalid: false, automaticRecalculation: false, automaticRedesign: false, engineeringValidated: false },
    ]);
    expect(store.reassessments.some((row) => row.objectId === excavationObject.objectId)).toBe(false);
    expect(parameter.fingerprint).toBe(parameterFingerprint);
    expect(parameter.value).toBe("30");
    expect(stratigraphy.fingerprint).toBe(stratigraphyFingerprint);
    expect(stratigraphy.materialDescription).toBe("brown sand described on bh-log-001");
    expect(field.fingerprint).toBe(fieldFingerprint);
    expect(field.measuredResult).toBe("12");
    expect(lab.fingerprint).toBe(labFingerprint);
    expect(lab.measuredResult).toBe("32");
    expect(foundation.fingerprint).toBe(foundationFingerprint);
    expect(foundation.recommendationText).toBe("Found pad footings within the stated depth range on layer 1");
    expect(foundation.recordStatus).toBe("CURRENT");
    expect(excavation.fingerprint).toBe(excavationFingerprint);
    expect(r1.objects).toHaveLength(objectCount);
    expect(r5.parameters).toHaveLength(1);
    expect(r6.contexts).toHaveLength(2);
    const preservedChange = change.fingerprint;
    const revisedChange = recordGeotechnicalChange(store, actor, { changeContextId: "change-1b", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "REASSESSMENT_REQUIRED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "The revised note asks for reassessment of the pad founding record only", limitations: "Reassessment required is not redesign", reassessmentRequired: true, provenanceRef: "prov-change-b", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], predecessorChangeContextId: change.changeContextId });
    const historicalChange = store.changes.find((row) => row.changeContextId === change.changeContextId);
    expect(revisedChange.recordStatus).toBe("CURRENT");
    expect(historicalChange?.fingerprint).toBe(preservedChange);
    expect(historicalChange?.recordStatus).toBe("SUPERSEDED");
    expect(store.changes).toHaveLength(2);
    expect(parameter.fingerprint).toBe(parameterFingerprint);
    expect(foundation.recommendationText).toBe("Found pad footings within the stated depth range on layer 1");
    expect(() => recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-dup", objectId: requirementObject.objectId, requirementText: "Investigate layer 1 to 2.4 m and record groundwater before founding", sourceRef: "project geotechnical basis note", sourceRevision: "rev-b", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline" })).toThrow(/DUPLICATE_REQUIREMENT_REJECTED/);
    expect(() => recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-accepted", objectId: requirementObject.objectId, requirementText: "A different investigation obligation", sourceRef: "project geotechnical basis note", sourceRevision: "rev-c", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline", requirementStatus: "ACCEPTED_FOR_PURPOSE" })).toThrow(/REQUIREMENT_ACCEPTANCE_NOT_IN_R7/);
    expect(() => recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-broad", objectId: requirementObject.objectId, requirementText: "A site-wide obligation", sourceRef: "project geotechnical basis note", sourceRevision: "rev-d", applicability: "all", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline" })).toThrow(/APPLICABILITY_REQUIRED/);
    expect(() => recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-float", objectId: "latest", requirementText: "A floating obligation", sourceRef: "project geotechnical basis note", sourceRevision: "rev-e", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline" })).toThrow(/REQUIREMENT_OBJECT_REQUIRED/);
    expect(() => recordGeotechnicalRequirement(store, { ...actor, actorId: "AI_assistant" }, { ...shared, requirementContextId: "requirement-ai", objectId: requirementObject.objectId, requirementText: "An invented obligation", sourceRef: "project geotechnical basis note", sourceRevision: "rev-f", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline" })).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-invent", objectId: requirementObject.objectId, requirementText: "An invented obligation", sourceRef: "project geotechnical basis note", sourceRevision: "rev-g", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline", inventRequirement: true })).toThrow(/AI_CANNOT_INVENT_AUTHORITATIVE_REQUIREMENT/);
    expect(() => recordGeotechnicalAssumption(store, actor, { ...shared, assumptionContextId: "assumption-validated", objectId: assumptionObject.objectId, statement: "Layer 1 is proven for every footing", rationale: "No validation is recorded", affectedObjectIds: [foundationObject.objectId], validationStatus: "validated" })).toThrow(/ASSUMPTION_NOT_VALIDATED_FACT/);
    expect(() => recordGeotechnicalAssumption(store, actor, { ...shared, assumptionContextId: "assumption-invent", objectId: assumptionObject.objectId, statement: "An invented assumption", rationale: "No source", affectedObjectIds: [foundationObject.objectId], inventAssumption: true })).toThrow(/AI_CANNOT_INVENT_AUTHORITATIVE_ASSUMPTION/);
    expect(() => recordGeotechnicalDecision(store, { ...actor, authority: "ADMIN" }, { ...shared, decisionContextId: "decision-admin", objectId: decisionObject.objectId, statement: "Admin adopts the note", rationale: "Admin action", affectedObjectIds: [foundationObject.objectId] })).toThrow(/ADMIN_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalDecision(store, actor, { ...shared, decisionContextId: "decision-ai", objectId: decisionObject.objectId, statement: "The model adopts the note", rationale: "recommendation text", affectedObjectIds: [foundationObject.objectId], aiRecommendation: true })).toThrow(/AI_RECOMMENDATION_NOT_DECISION/);
    expect(() => recordGeotechnicalDecision(store, actor, { ...shared, decisionContextId: "decision-two", objectId: decisionObject.objectId, statement: "Two alternatives selected", rationale: "ambiguous", affectedObjectIds: [foundationObject.objectId], alternatives: [{ id: "a", statement: "first", is_selected: true }, { id: "b", statement: "second", is_selected: true }] })).toThrow(/at most one alternative/);
    expect(() => recordGeotechnicalDecision(store, actor, { ...shared, decisionContextId: "decision-spoof", objectId: decisionObject.objectId, statement: "A different recorded decision", rationale: "spoof", affectedObjectIds: [foundationObject.objectId], assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-infer", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "RECOMMENDATION_CHANGED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: excavationObject.objectId }], rationale: "Nearby excavation should follow", limitations: "Inference is rejected", reassessmentRequired: true, provenanceRef: "prov-infer", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], inferDependencies: true })).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-nearby", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "RECOMMENDATION_CHANGED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "nearby", targetObjectId: excavationObject.objectId }], rationale: "Spatial proximity", limitations: "Not an explicit relationship", reassessmentRequired: false, provenanceRef: "prov-nearby", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId] })).toThrow(/RELATIONSHIP_NOT_EXPLICIT/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-invalidate", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "SUBJECT_REVISION_SUPERSEDED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "Do not invalidate", limitations: "No automatic invalidation", reassessmentRequired: false, provenanceRef: "prov-invalid", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], invalidate: true })).toThrow(/AUTOMATIC_INVALIDATION_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-calc", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "PARAMETER_CHANGED", changedObjectId: parameterObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: parameterObject.objectId }], rationale: "Do not recalculate", limitations: "No calculation", reassessmentRequired: false, provenanceRef: "prov-calc", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], recalculate: true })).toThrow(/AUTOMATIC_RECALCULATION_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-foundation", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "RECOMMENDATION_CHANGED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "Do not redesign the foundation", limitations: "No redesign", reassessmentRequired: false, provenanceRef: "prov-redesign-f", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], redesignFoundation: true })).toThrow(/FOUNDATION_REDESIGN_NOT_IN_R7/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-excavation", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "RECOMMENDATION_CHANGED", changedObjectId: excavationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: excavationObject.objectId }], rationale: "Do not redesign the excavation", limitations: "No redesign", reassessmentRequired: false, provenanceRef: "prov-redesign-e", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], redesignExcavation: true })).toThrow(/EXCAVATION_REDESIGN_NOT_IN_R7/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-slope", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "RECOMMENDATION_CHANGED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "Do not redesign the slope", limitations: "No redesign", reassessmentRequired: false, provenanceRef: "prov-redesign-s", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], redesignSlope: true })).toThrow(/SLOPE_REDESIGN_NOT_IN_R7/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-r3", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "SOURCE_EVIDENCE_CHANGED", changedObjectId: layer.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: layer.objectId }], rationale: "Do not rewrite the interpretation", limitations: "No R3 mutation", reassessmentRequired: false, provenanceRef: "prov-r3", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], mutateInterpretation: true })).toThrow(/R3_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-r4", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "SOURCE_EVIDENCE_CHANGED", changedObjectId: fieldObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: fieldObject.objectId }], rationale: "Do not rewrite the test", limitations: "No R4 mutation", reassessmentRequired: false, provenanceRef: "prov-r4", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], mutateTestResult: true })).toThrow(/R4_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-r5", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "PARAMETER_CHANGED", changedObjectId: parameterObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: parameterObject.objectId }], rationale: "Do not rewrite the parameter", limitations: "No R5 mutation", reassessmentRequired: false, provenanceRef: "prov-r5", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], mutateParameter: true })).toThrow(/R5_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-r6", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "RECOMMENDATION_CHANGED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "Do not rewrite the recommendation", limitations: "No R6 mutation", reassessmentRequired: false, provenanceRef: "prov-r6", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], mutateRecommendation: true })).toThrow(/R6_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-d1", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "SUBJECT_REVISION_SUPERSEDED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "Do not mutate structural objects", limitations: "No D1 mutation", reassessmentRequired: false, provenanceRef: "prov-d1", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], mutateStructural: true })).toThrow(/D1_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-d2", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "SUBJECT_REVISION_SUPERSEDED", changedObjectId: excavationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: excavationObject.objectId }], rationale: "Do not mutate civil objects", limitations: "No D2 mutation", reassessmentRequired: false, provenanceRef: "prov-d2", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], mutateCivil: true })).toThrow(/D2_MUTATION_REJECTED/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-close", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "REASSESSMENT_REQUIRED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "Do not close reassessment", limitations: "No completion", reassessmentRequired: true, provenanceRef: "prov-close", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], closeReassessment: true })).toThrow(/AI_CANNOT_CLOSE_REASSESSMENT/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-cross", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "REQUIREMENT_CHANGED", changedObjectId: requirementObject.objectId, affectedRelationships: [{ kind: "PARENT", targetObjectId: foundationObject.objectId }], rationale: "Cross-project change", limitations: "Scope is enforced", reassessmentRequired: false, provenanceRef: "prov-cross", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], projectId: "project-b" })).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordGeotechnicalChange(store, actor, { changeContextId: "change-replay", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "REASSESSMENT_REQUIRED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "The revised note asks for reassessment of the pad founding record only", limitations: "Reassessment required is not redesign", reassessmentRequired: true, provenanceRef: "prov-change-b", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], predecessorChangeContextId: change.changeContextId })).toThrow(/PREDECESSOR_NOT_CURRENT|CHANGE_ALREADY_RECORDED|DUPLICATE_CHANGE_REJECTED/);
    expect(recordGeotechnicalChange(store, actor, { changeContextId: "change-1b", contextId: context.contextId, objectId: changeObject.objectId, changeCategory: "REASSESSMENT_REQUIRED", changedObjectId: foundationObject.objectId, affectedRelationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: foundationObject.objectId }], rationale: "The revised note asks for reassessment of the pad founding record only", limitations: "Reassessment required is not redesign", reassessmentRequired: true, provenanceRef: "prov-change-b", citedCurrentness: "CURRENT", evidenceReferenceIds: [boreholeLog.evidenceReferenceId], predecessorChangeContextId: change.changeContextId }).fingerprint).toBe(revisedChange.fingerprint);
    const replacement = recordInvestigationEvidenceReference(r2, actor, { evidenceReferenceId: "evidence-log-1b", contextId: context.contextId, objectId: borehole.objectId, evidenceKind: "BOREHOLE_LOG", sourceRevision: "rev-b", provenanceRef: "prov-log-b", citedCurrentness: "CURRENT", predecessorEvidenceReferenceId: boreholeLog.evidenceReferenceId });
    expect(historicalRequirement?.evidenceReferenceIds).not.toContain(replacement.evidenceReferenceId);
    expect(historicalRequirement?.evidenceReferenceIds).toEqual(["evidence-log-1"]);
    expect(() => recordGeotechnicalRequirement(store, actor, { ...shared, requirementContextId: "requirement-stale", objectId: requirementObject.objectId, requirementText: "A later obligation citing the superseded log", sourceRef: "project geotechnical basis note", sourceRevision: "rev-h", affectedObjectIds: [foundationObject.objectId], jurisdictionProfileId: "global-baseline" })).toThrow(/R2_EVIDENCE_NOT_CURRENT/);
    expect(parameter.fingerprint).toBe(parameterFingerprint);
    expect(foundation.fingerprint).toBe(foundationFingerprint);
    expect(() => closeGeotechnicalReassessment()).toThrow(/AI_CANNOT_CLOSE_REASSESSMENT/);
    expect(() => inferGeotechnicalDependencies()).toThrow(/INFERRED_DEPENDENCY_REJECTED/);
    expect(() => repointGovernanceRecord()).toThrow(/AUTO_REPOINT_REJECTED/);
    expect(() => mutateRequirementsAssumptionsChange()).toThrow(/R7_MUTATION_REJECTED/);
    expect(() => { (requirement as { requirementText: string }).requirementText = "silent"; }).toThrow();
    expect(requirement.requirementText).toBe("Investigate layer 1 to 2.4 m before founding as written on bh-log-001");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "requirements-assumptions-change.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).toContain("assertHumanApprovalActor");
    expect(source).toContain("assertAssumptionValidationStatus");
    expect(source).toContain("INFORMATION_REQUIREMENT_STATUSES");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE|requirements-assumptions-change\"/);
    expect(scanAnalysisFormulaBypass(join(here, "requirements-assumptions-change.ts"), source)).toEqual([]);
    const packageJson = JSON.parse(readFileSync(join(here, "../../package.json"), "utf8")) as { dependencies: Record<string, string> };
    expect(Object.keys(packageJson.dependencies).sort()).toEqual(["@rtb/database", "@rtb/engineering-review", "@rtb/platform-commerce", "@rtb/platform-intelligence", "@rtb/platform-kernel", "@rtb/types", "docx", "exceljs", "pptxgenjs", "zod"]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R8.DISCIPLINE_INTERFACES_AND_HANDOFFS")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
