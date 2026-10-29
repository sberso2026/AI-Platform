import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D1M_0_COORDINATE_IDENTITIES, D1M_0_GEOMETRY_EVIDENCE_CANDIDATES, D1M_0_SEMANTIC_EVIDENCE_CANDIDATES, D1M_ARCHITECTURE_READY } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D1M_R3_CANONICAL_PHASE, D1M_R3_CANONICAL_SCOPE, createD1mR2Store, recordSourceObjectMapping, type D1mR2Input } from "./cad-bim-object-mapping";
import {
  D1M_R3_ADMIN_EQUALS_EVIDENCE_ENGINEERING_AUTHORITY,
  D1M_R3_AI_CAN_INFER_UNKNOWN_ENGINEERING_SEMANTIC,
  D1M_R3_AI_CAN_INVENT_GEOMETRY_EVIDENCE,
  D1M_R3_AI_CAN_INVENT_SEMANTIC_EVIDENCE,
  D1M_R3_AI_CAN_INVENT_SOURCE_PROPERTY,
  D1M_R3_AI_CAN_MARK_EVIDENCE_ENGINEERING_VALIDATED,
  D1M_R3_AI_GEOMETRY_EXTRACTION_RUNTIME_COUNT,
  D1M_R3_AI_MODEL_EXTRACTION_RUNTIME_COUNT,
  D1M_R3_AI_SEMANTIC_EXTRACTION_RUNTIME_COUNT,
  D1M_R3_ARCHITECTURE_READY,
  D1M_R3_ARTIFACT_RUNTIME_COUNT,
  D1M_R3_AXIS_INFERENCE_RUNTIME_COUNT,
  D1M_R3_BIM_AUTHORING_RUNTIME_COUNT,
  D1M_R3_CAD_AUTHORING_RUNTIME_COUNT,
  D1M_R3_CAN_CREATE_STRUCTURAL_TARGET_MAPPING,
  D1M_R3_CANONICAL_DIGITAL_THREAD_REUSED,
  D1M_R3_CANONICAL_FINGERPRINT_REUSED,
  D1M_R3_CHANGE_DETECTION_RUNTIME_COUNT,
  D1M_R3_CHANGE_GOVERNANCE_RUNTIME_READY,
  D1M_R3_CONFLICTING_EVIDENCE_AUTO_RESOLVED,
  D1M_R3_CONNECTOR_RUNTIME_COUNT,
  D1M_R3_CONNECTIVITY_INFERENCE_RUNTIME_COUNT,
  D1M_R3_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R3_CROSS_PROJECT_EVIDENCE_ALLOWED,
  D1M_R3_CROSS_WORKSPACE_EVIDENCE_ALLOWED,
  D1M_R3_D1A_REUSED,
  D1M_R3_D1G_BLOCKER_PRESERVED,
  D1M_R3_D1K_AXIS_ARCHITECTURE_REUSED,
  D1M_R3_D1K_COORDINATE_ARCHITECTURE_REUSED,
  D1M_R3_D1K_GOVERNANCE_REUSED,
  D1M_R3_D1K_LIMITATIONS_PRESERVED,
  D1M_R3_D1K_UNIT_ARCHITECTURE_REUSED,
  D1M_R3_D1L_TRACK_COMPLETE,
  D1M_R3_D1L_TRACK_STATUS,
  D1M_R3_D1N_ABSORBED,
  D1M_R3_D1N_CURRENT_STATUS,
  D1M_R3_D1N_RUNTIME_COUNT,
  D1M_R3_D1N_RUNTIME_STARTED,
  D1M_R3_D2_D8_RUNTIME_COUNT,
  D1M_R3_D2_D8_RUNTIME_STARTED,
  D1M_R3_D9_ABSORBED,
  D1M_R3_D9_RUNTIME_COUNT,
  D1M_R3_D9_RUNTIME_STARTED,
  D1M_R3_DATABASE_SCHEMA_CHANGED,
  D1M_R3_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT,
  D1M_R3_EVIDENCE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1M_R3_EVIDENCE_AUTHORITY_EQUALS_ENGINEERING_APPROVAL,
  D1M_R3_EVIDENCE_AUTHORITY_PRESERVED,
  D1M_R3_EVIDENCE_PROVENANCE_PRESERVED,
  D1M_R3_EVIDENCE_RECORDED_EQUALS_EXTRACTED_FROM_FILE,
  D1M_R3_EVIDENCE_RECORDED_EQUALS_FORMAT_SUPPORTED,
  D1M_R3_EVIDENCE_SPOOFING_PROTECTION_IMPLEMENTED,
  D1M_R3_EXACT_ARTIFACT_REVISION_BINDING_REQUIRED,
  D1M_R3_EXACT_OBJECT_MAPPING_BINDING_REQUIRED,
  D1M_R3_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R3_FORMAT_ADAPTER_RUNTIME_COUNT,
  D1M_R3_FORMAT_ADAPTER_RUNTIME_READY,
  D1M_R3_FREEFORM_ENGINEERING_SEMANTIC_TYPE_ALLOWED,
  D1M_R3_FREEFORM_GEOMETRY_TYPE_ALLOWED,
  D1M_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1M_R3_GENERAL_GEOMETRY_ENGINE_RUNTIME_COUNT,
  D1M_R3_GENERIC_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R3_GEOMETRY_AUTHORIZED_EQUALS_GEOMETRY_VALIDATED,
  D1M_R3_GEOMETRY_EVIDENCE_TYPES,
  D1M_R3_GEOMETRY_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED,
  D1M_R3_GEOMETRY_FINGERPRINT_IMPLEMENTED,
  D1M_R3_GEOMETRY_FINGERPRINT_VERIFIED_EQUALS_GEOMETRY_VALIDATED,
  D1M_R3_GEOMETRY_HISTORY_PRESERVED,
  D1M_R3_GEOMETRY_MATCHING_RUNTIME_COUNT,
  D1M_R3_GEOMETRY_RECORDED_EQUALS_GEOMETRY_VALIDATED,
  D1M_R3_GEOMETRY_RECORDED_EQUALS_STRUCTURAL_ADEQUACY,
  D1M_R3_GEOMETRY_REVISION_AUTO_UPGRADED,
  D1M_R3_GEOMETRY_RUNTIME_COUNT,
  D1M_R3_GEOMETRY_RUNTIME_IMPLEMENTED,
  D1M_R3_GEOMETRY_TYPE_ALLOWLIST_ENFORCED,
  D1M_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1M_R3_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION,
  D1M_R3_HUMAN_REVIEW_SUPPORTED,
  D1M_R3_LOAD_EQUALS_VALIDATED_LOAD,
  D1M_R3_LOAD_PATH_INFERENCE_RUNTIME_COUNT,
  D1M_R3_MAPPING_REFERENCE_AUTO_UPGRADED,
  D1M_R3_MAPPING_RUNTIME_COUNT,
  D1M_R3_MATERIAL_EQUALS_VALIDATED_MATERIAL,
  D1M_R3_MATURITY_STATE,
  D1M_R3_MISSING_COORDINATE_AUTO_INFERRED,
  D1M_R3_MISSING_UNIT_AUTO_INFERRED,
  D1M_R3_MODEL_CORRECTION_RUNTIME_COUNT,
  D1M_R3_MODEL_EVIDENCE_EQUALS_D1L_CERTIFICATION_ELIGIBLE,
  D1M_R3_MODEL_EVIDENCE_EQUALS_ENGINEERING_VALIDATED,
  D1M_R3_MODEL_EVIDENCE_EQUALS_STRUCTURAL_ADEQUACY,
  D1M_R3_MODEL_EVIDENCE_EQUALS_STRUCTURAL_INTERPRETATION_APPROVED,
  D1M_R3_MODEL_EVIDENCE_RUNTIME_READY,
  D1M_R3_NEW_DEPENDENCY_ADDED,
  D1M_R3_NEW_MAPPING_RUNTIME_COUNT,
  D1M_R3_OBJECT_EXTRACTION_RUNTIME_COUNT,
  D1M_R3_PARALLEL_ARTIFACT_REFERENCE_CREATED,
  D1M_R3_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED,
  D1M_R3_PARALLEL_DIGITAL_THREAD_CREATED,
  D1M_R3_PARALLEL_MAPPING_ENGINE_CREATED,
  D1M_R3_PARALLEL_STRUCTURAL_IDENTITY_CREATED,
  D1M_R3_PARSE_RUNTIME_COUNT,
  D1M_R3_PHASE,
  D1M_R3_POST_D1J_DEBT_PRESERVED,
  D1M_R3_R1_REUSED,
  D1M_R3_R1_SOURCE_REFERENCE_REQUIRED,
  D1M_R3_R2_OBJECT_MAPPING_REQUIRED,
  D1M_R3_R2_REUSED,
  D1M_R3_REINFORCEMENT_EQUALS_VALIDATED_REINFORCEMENT,
  D1M_R3_RELATIONSHIP_RUNTIME_COUNT,
  D1M_R3_RUNTIME_COUNT,
  D1M_R3_RUNTIME_STARTED,
  D1M_R3_SCOPE,
  D1M_R3_SCOPE_ENFORCED,
  D1M_R3_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1M_R3_SECTION_EQUALS_VALIDATED_SECTION,
  D1M_R3_SEMANTIC_EVIDENCE_TYPES,
  D1M_R3_SEMANTIC_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED,
  D1M_R3_SEMANTIC_FINGERPRINT_IMPLEMENTED,
  D1M_R3_SEMANTIC_HISTORY_PRESERVED,
  D1M_R3_SEMANTIC_MATCHING_RUNTIME_COUNT,
  D1M_R3_SEMANTIC_REVISION_AUTO_UPGRADED,
  D1M_R3_SEMANTIC_RUNTIME_COUNT,
  D1M_R3_SEMANTIC_RUNTIME_IMPLEMENTED,
  D1M_R3_SEMANTIC_TYPE_ALLOWLIST_ENFORCED,
  D1M_R3_SILENT_GEOMETRY_MUTATION_ALLOWED,
  D1M_R3_SILENT_SEMANTIC_MUTATION_ALLOWED,
  D1M_R3_SOURCE_CLASS_EQUALS_VALIDATED_STRUCTURAL_CLASS,
  D1M_R3_SOURCE_GEOMETRY_EQUALS_VALIDATED_EOS_GEOMETRY,
  D1M_R3_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT,
  D1M_R3_SOURCE_OBJECT_REVISION_BINDING_PRESERVED,
  D1M_R3_SOURCE_REFERENCE_RUNTIME_COUNT,
  D1M_R3_SOURCE_REFERENCE_RUNTIME_READY,
  D1M_R3_SOURCE_SEMANTIC_EQUALS_GOVERNED_ENGINEERING_SEMANTIC,
  D1M_R3_STATUS,
  D1M_R3_STRUCTURAL_INTERPRETATION_RUNTIME_READY,
  D1M_R3_STRUCTURAL_PACK_COMPLETE,
  D1M_R3_SUPPORT_EQUALS_VALIDATED_BOUNDARY,
  D1M_R3_UNAUTHORIZED_PRODUCT_CLAIM,
  D1M_R3_UNIT_CONVERSION_RUNTIME_COUNT,
  D1M_R3_UNKNOWN_LABEL_MEANING_INFERRED,
  D1M_R3_UNKNOWN_MODEL_SEMANTIC_AUTO_MAPPED,
  D1M_R4_CANONICAL_PHASE,
  D1M_R4_CANONICAL_SCOPE,
  D1M_R4_PHASE_TYPE,
  adaptCadBimFormat,
  authorBimModel,
  authorCadModel,
  confirmModelEvidence,
  connectCadBimVendor,
  convertCadBimUnits,
  correctCadBimModel,
  createD1mR3Store,
  createSourceObjectMapping,
  extractCadBimObjects,
  extractModelByAi,
  inferCadBimAxes,
  inferCadBimRelationships,
  inferLoadPath,
  inferStructuralConnectivity,
  ingestCadBimFile,
  interpretCadBimEngineeringProperties,
  matchObjectByGeometry,
  matchObjectBySemantics,
  mutateGeometryEvidence,
  mutateSemanticEvidence,
  parseCadBimArtifact,
  recordGeometryEvidence,
  recordSemanticEvidence,
  runGeometryEngine,
  supersedeGeometryEvidence,
  supersedeSemanticEvidence,
  transformCadBimCoordinates,
  upgradeEvidenceArtifactRevision,
  upgradeEvidenceMapping,
  type D1mR3Actor,
  type D1mR3GeometryInput,
  type D1mR3SemanticInput,
} from "./cad-bim-model-evidence";
import { createD1mR1Store, recordCadBimSourceRevision, type D1mR1Input } from "./cad-bim-source-revision";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const now = () => "2026-10-22T00:00:00.000Z";

function actor(overrides: Partial<D1mR3Actor> = {}): D1mR3Actor {
  return {
    actorId: "recorder-1",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    authority: "INTERFACE_RECORD_AUTHORITY",
    ...overrides,
  };
}

function reviewer(overrides: Partial<D1mR3Actor> = {}): D1mR3Actor {
  return { ...actor(), actorId: "reviewer-1", authority: "REVIEWER_AUTHORITY", ...overrides };
}

function revisionInput(overrides: Partial<D1mR1Input> = {}): D1mR1Input {
  return {
    referenceId: "ref-1",
    artifactId: "artifact-1",
    displayName: "Level 2 model",
    sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE",
    sourceSystemId: "source-sys-1",
    sourceRevision: "rev-1",
    sourceLocator: "source-key:artifact-1",
    declaredFormat: "IFC",
    sourceWorkflowState: "approved",
    provenanceRef: "prov-1",
    evidenceId: "ev-1",
    contentFingerprint: "fp-content-1",
    fingerprintProvenanceRef: "fp-prov-1",
    fingerprintEvidenceId: "fp-ev-1",
    structuralSystemId: "system-1",
    ...overrides,
  };
}

function mappingInput(overrides: Partial<D1mR2Input> = {}): D1mR2Input {
  return {
    mappingId: "map-1",
    referenceId: "ref-1",
    expectedSourceRevision: "rev-1",
    sourceObjectId: "source-object-1",
    structuralTargetId: "member-1",
    structuralTargetKind: "MEMBER",
    evidenceId: "map-ev-1",
    evidenceKind: "human_input",
    provenanceRef: "map-prov-1",
    ...overrides,
  };
}

function geometryInput(overrides: Partial<D1mR3GeometryInput> = {}): D1mR3GeometryInput {
  return {
    evidenceId: "geo-1",
    mappingId: "map-1",
    geometryType: "POINT",
    components: [10.5, 0, -3.25],
    evidenceKind: "human_input",
    evidenceRef: "geo-ev-1",
    provenanceRef: "geo-prov-1",
    expectedSourceRevision: "rev-1",
    expectedSourceObjectId: "source-object-1",
    expectedStructuralTargetId: "member-1",
    ...overrides,
  };
}

function semanticInput(overrides: Partial<D1mR3SemanticInput> = {}): D1mR3SemanticInput {
  return {
    evidenceId: "sem-1",
    mappingId: "map-1",
    semanticType: "MATERIAL_LABEL",
    sourcePropertyName: "Material",
    sourceValue: "Concrete",
    evidenceKind: "human_input",
    evidenceRef: "sem-ev-1",
    provenanceRef: "sem-prov-1",
    expectedSourceRevision: "rev-1",
    expectedSourceObjectId: "source-object-1",
    ...overrides,
  };
}

function ready(revisionOverrides: Partial<D1mR1Input> = {}, mapOverrides: Partial<D1mR2Input> = {}) {
  const source = createD1mR1Store({
    contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
  }, now);
  recordCadBimSourceRevision(source, actor(), revisionInput(revisionOverrides));
  const mapped = createD1mR2Store({
    references: source.records,
    targets: [{ id: "member-1", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
  }, now);
  const mapping = recordSourceObjectMapping(mapped, actor(), mappingInput(mapOverrides));
  return { source, mapping, evidence: createD1mR3Store({ references: source.records, mappings: mapped.records }, now) };
}

describe("EOS-D1M-R3 geometry and semantic evidence", () => {
  it("records source geometry and semantic evidence on an exact revision and mapping", () => {
    const { evidence, mapping } = ready();
    const geometry = recordGeometryEvidence(evidence, actor(), geometryInput());
    const repeated = recordGeometryEvidence(evidence, actor(), geometryInput());
    const semantic = recordSemanticEvidence(evidence, actor(), semanticInput());
    expect(geometry).toBe(repeated);
    expect(geometry.referenceId).toBe("ref-1");
    expect(geometry.sourceRevision).toBe("rev-1");
    expect(geometry.mappingId).toBe(mapping.mappingId);
    expect(geometry.mappingFingerprint).toBe(mapping.mappingFingerprint);
    expect(geometry.sourceObjectId).toBe("source-object-1");
    expect(geometry.structuralTargetId).toBe("member-1");
    expect(geometry.structuralTargetKind).toBe("MEMBER");
    expect(geometry.components).toEqual([10.5, 0, -3.25]);
    expect(geometry.origin).toBe("DECLARED_SOURCE");
    expect(geometry.extractedFromFile).toBe(false);
    expect(geometry.geometryValidated).toBe(false);
    expect(geometry.engineeringValidated).toBe(false);
    expect(geometry.structuralAdequacyConfirmed).toBe(false);
    expect(geometry.structuralInterpretationApproved).toBe(false);
    expect(semantic.sourceValue).toBe("Concrete");
    expect(semantic.sourceEqualsGovernedEngineeringSemantic).toBe(false);
    expect(semantic.materialValidated).toBe(false);
    expect(D1M_R3_PHASE).toBe(D1M_R3_CANONICAL_PHASE);
    expect(D1M_R3_SCOPE).toBe(D1M_R3_CANONICAL_SCOPE);
    expect(D1M_R3_STATUS).toBe("MODEL_EVIDENCE_IMPLEMENTED");
    expect(D1M_R3_MATURITY_STATE).toBe("STRUCTURAL_CAD_OR_BIM_GEOMETRY_SEMANTIC_EVIDENCE_IMPLEMENTED");
    expect(D1M_ARCHITECTURE_READY).toBe(true);
    expect(D1M_R3_ARCHITECTURE_READY).toBe(true);
    expect(D1M_R3_SOURCE_REFERENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R3_MODEL_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R3_FORMAT_ADAPTER_RUNTIME_READY).toBe(false);
    expect(D1M_R3_STRUCTURAL_INTERPRETATION_RUNTIME_READY).toBe(false);
    expect(D1M_R3_CHANGE_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D1M_R3_R1_SOURCE_REFERENCE_REQUIRED).toBe(true);
    expect(D1M_R3_EXACT_ARTIFACT_REVISION_BINDING_REQUIRED).toBe(true);
    expect(D1M_R3_R2_OBJECT_MAPPING_REQUIRED).toBe(true);
    expect(D1M_R3_EXACT_OBJECT_MAPPING_BINDING_REQUIRED).toBe(true);
    expect(D1M_R3_SOURCE_OBJECT_REVISION_BINDING_PRESERVED).toBe(true);
    expect(D1M_R3_GEOMETRY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R3_GEOMETRY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R3_SEMANTIC_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R3_SEMANTIC_RUNTIME_COUNT).toBe(1);
    expect(D1M_R3_SOURCE_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D1M_R3_ARTIFACT_RUNTIME_COUNT).toBe(1);
    expect(D1M_R3_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R3_MAPPING_RUNTIME_COUNT).toBe(1);
    expect(D1M_R3_RUNTIME_STARTED).toBe(true);
    expect(D1M_R3_RUNTIME_COUNT).toBe(3);
    expect(D1M_R3_R1_REUSED).toBe(true);
    expect(D1M_R3_R2_REUSED).toBe(true);
    expect(D1M_R3_D1A_REUSED).toBe(true);
    expect(D1M_R3_PARALLEL_ARTIFACT_REFERENCE_CREATED).toBe(false);
    expect(D1M_R3_PARALLEL_MAPPING_ENGINE_CREATED).toBe(false);
    expect(D1M_R3_PARALLEL_STRUCTURAL_IDENTITY_CREATED).toBe(false);
    expect(D1M_R3_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1M_R3_PARALLEL_DIGITAL_THREAD_CREATED).toBe(false);
  });

  it("requires the exact R1 revision and R2 mapping and cannot create a mapping", () => {
    const { evidence } = ready();
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ mappingId: "" }))).toThrow("R2_MAPPING_REQUIRED");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ mappingId: "missing" }))).toThrow("R2_MAPPING_REQUIRED");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ mappingId: "latest" }))).toThrow("FLOATING_ARTIFACT_REFERENCE_REJECTED");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ expectedSourceRevision: "current" }))).toThrow("FLOATING_ARTIFACT_REFERENCE_REJECTED");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ expectedSourceRevision: "rev-2" }))).toThrow("ARTIFACT_REVISION_MISMATCH");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ expectedSourceObjectId: "other-object" }))).toThrow("SOURCE_OBJECT_MISMATCH");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ expectedStructuralTargetId: "other-member" }))).toThrow("TARGET_SUBSTITUTION_REJECTED");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ expectedMappingFingerprint: "forged" }))).toThrow("FINGERPRINT_MISMATCH");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ createMapping: true }))).toThrow("MAPPING_CREATION_NOT_IN_R3");
    expect(() => createSourceObjectMapping()).toThrow("MAPPING_CREATION_NOT_IN_R3");
    expect(() => upgradeEvidenceArtifactRevision()).toThrow("EVIDENCE_ARTIFACT_REVISION_AUTO_UPGRADE_REJECTED");
    expect(() => upgradeEvidenceMapping()).toThrow("EVIDENCE_MAPPING_AUTO_UPGRADE_REJECTED");
    expect(evidence.records).toHaveLength(0);
    expect(evidence.mappings).toHaveLength(1);
    expect(D1M_R3_CAN_CREATE_STRUCTURAL_TARGET_MAPPING).toBe(false);
    expect(D1M_R3_NEW_MAPPING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_GEOMETRY_REVISION_AUTO_UPGRADED).toBe(false);
    expect(D1M_R3_SEMANTIC_REVISION_AUTO_UPGRADED).toBe(false);
    expect(D1M_R3_MAPPING_REFERENCE_AUTO_UPGRADED).toBe(false);
  });

  it("enforces evidence allowlists and keeps source meaning unresolved", () => {
    const { evidence } = ready();
    expect(D1M_R3_GEOMETRY_TYPE_ALLOWLIST_ENFORCED).toBe(true);
    expect(D1M_R3_GEOMETRY_EVIDENCE_TYPES).toBe(D1M_0_GEOMETRY_EVIDENCE_CANDIDATES);
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ geometryType: "MESH" }))).toThrow("GEOMETRY_TYPE_INVALID");
    expect(D1M_R3_FREEFORM_GEOMETRY_TYPE_ALLOWED).toBe(false);
    expect(D1M_R3_SEMANTIC_TYPE_ALLOWLIST_ENFORCED).toBe(true);
    expect(D1M_R3_SEMANTIC_EVIDENCE_TYPES).toBe(D1M_0_SEMANTIC_EVIDENCE_CANDIDATES);
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ semanticType: "BEAM" }))).toThrow("SEMANTIC_TYPE_INVALID");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ inferEngineeringMeaning: true }))).toThrow("UNKNOWN_SEMANTIC_NOT_INFERRED");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ engineeringSemanticId: "BEAM" }))).toThrow("UNKNOWN_SEMANTIC_NOT_INFERRED");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ sourcePropertyName: "AI_PROPERTY" }))).toThrow("SOURCE_PROPERTY_REQUIRED");
    const objectClass = recordSemanticEvidence(evidence, actor(), semanticInput({
      evidenceId: "sem-class",
      semanticType: "OBJECT_TYPE",
      sourcePropertyName: "ObjectType",
      sourceValue: "beam",
    }));
    expect(objectClass.sourceValue).toBe("beam");
    expect(objectClass.structuralTargetKind).toBe("MEMBER");
    expect(objectClass.sourceClassEqualsValidatedStructuralClass).toBe(false);
    const material = recordSemanticEvidence(evidence, actor(), semanticInput());
    expect(material.materialValidated).toBe(false);
    const section = recordSemanticEvidence(evidence, actor(), semanticInput({
      evidenceId: "sem-section",
      semanticType: "SECTION_LABEL",
      sourcePropertyName: "Section",
      sourceValue: "UB610x305x149",
    }));
    expect(section.sourceValue).toBe("UB610x305x149");
    expect(section.sectionValidated).toBe(false);
    const load = recordSemanticEvidence(evidence, actor(), semanticInput({
      evidenceId: "sem-load",
      semanticType: "PROPERTY_SET_VALUE",
      sourcePropertyName: "Load",
      sourceValue: "10kN",
    }));
    const support = recordSemanticEvidence(evidence, actor(), semanticInput({
      evidenceId: "sem-support",
      semanticType: "PROPERTY_SET_VALUE",
      sourcePropertyName: "Support",
      sourceValue: "pinned",
    }));
    const reinforcement = recordSemanticEvidence(evidence, actor(), semanticInput({
      evidenceId: "sem-rebar",
      semanticType: "PROPERTY_SET_VALUE",
      sourcePropertyName: "Reinforcement",
      sourceValue: "2-N20",
    }));
    expect(load.loadValidated).toBe(false);
    expect(support.supportValidated).toBe(false);
    expect(reinforcement.reinforcementValidated).toBe(false);
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ validatedMaterial: true }))).toThrow("MATERIAL_VALIDATION_NOT_IN_R3");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ validatedSection: true }))).toThrow("SECTION_VALIDATION_NOT_IN_R3");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ validatedLoad: true }))).toThrow("LOAD_VALIDATION_NOT_IN_R3");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ validatedSupport: true }))).toThrow("SUPPORT_VALIDATION_NOT_IN_R3");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ validatedReinforcement: true }))).toThrow("REINFORCEMENT_VALIDATION_NOT_IN_R3");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ validatedStructuralClass: true }))).toThrow("STRUCTURAL_CLASS_VALIDATION_NOT_IN_R3");
    expect(D1M_R3_FREEFORM_ENGINEERING_SEMANTIC_TYPE_ALLOWED).toBe(false);
    expect(D1M_R3_SOURCE_SEMANTIC_EQUALS_GOVERNED_ENGINEERING_SEMANTIC).toBe(false);
    expect(D1M_R3_UNKNOWN_MODEL_SEMANTIC_AUTO_MAPPED).toBe(false);
    expect(D1M_R3_UNKNOWN_LABEL_MEANING_INFERRED).toBe(false);
    expect(D1M_R3_SOURCE_CLASS_EQUALS_VALIDATED_STRUCTURAL_CLASS).toBe(false);
    expect(D1M_R3_MATERIAL_EQUALS_VALIDATED_MATERIAL).toBe(false);
    expect(D1M_R3_SECTION_EQUALS_VALIDATED_SECTION).toBe(false);
    expect(D1M_R3_LOAD_EQUALS_VALIDATED_LOAD).toBe(false);
    expect(D1M_R3_SUPPORT_EQUALS_VALIDATED_BOUNDARY).toBe(false);
    expect(D1M_R3_REINFORCEMENT_EQUALS_VALIDATED_REINFORCEMENT).toBe(false);
    expect(D1M_R3_SOURCE_GEOMETRY_EQUALS_VALIDATED_EOS_GEOMETRY).toBe(false);
    expect(D1M_R3_GEOMETRY_RECORDED_EQUALS_GEOMETRY_VALIDATED).toBe(false);
    expect(D1M_R3_GEOMETRY_AUTHORIZED_EQUALS_GEOMETRY_VALIDATED).toBe(false);
    expect(D1M_R3_GEOMETRY_FINGERPRINT_VERIFIED_EQUALS_GEOMETRY_VALIDATED).toBe(false);
    expect(D1M_R3_GEOMETRY_RECORDED_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(D1M_R3_MODEL_EVIDENCE_EQUALS_STRUCTURAL_INTERPRETATION_APPROVED).toBe(false);
    expect(D1M_R3_MODEL_EVIDENCE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R3_MODEL_EVIDENCE_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
  });

  it("preserves declared values and leaves missing unit, coordinate, and axis context unresolved", () => {
    const { evidence, mapping } = ready();
    const unresolved = recordGeometryEvidence(evidence, actor(), geometryInput({ labels: [" B1 "] }));
    expect(unresolved.components).toEqual([10.5, 0, -3.25]);
    expect(unresolved.labels).toEqual([" B1 "]);
    expect(unresolved.declaredUnit).toBeNull();
    expect(unresolved.unitContextStatus).toBe("UNRESOLVED_PENDING_R4");
    expect(unresolved.coordinateIdentity).toBeNull();
    expect(unresolved.coordinateContextStatus).toBe("UNRESOLVED_PENDING_R4");
    expect(unresolved.declaredAxis).toBeNull();
    expect(unresolved.axisContextStatus).toBe("UNRESOLVED_PENDING_R4");
    expect(unresolved.engineeringAxisAssigned).toBe(false);
    const declared = recordGeometryEvidence(evidence, actor(), geometryInput({
      evidenceId: "geo-line",
      geometryType: "LINE",
      components: [0, 0, 0, 1, 0, 0],
      declaredUnit: "mm",
      coordinateIdentity: "LOCAL",
      declaredAxis: "source-x",
      declaredFormat: "IFC",
    }));
    expect(declared.declaredUnit).toBe("mm");
    expect(declared.components).toEqual([0, 0, 0, 1, 0, 0]);
    expect(declared.coordinateIdentity).toBe("LOCAL");
    expect(declared.declaredAxis).toBe("source-x");
    expect(declared.formatSupported).toBe(false);
    expect(declared.declaredFormat).toBe("IFC");
    expect(D1M_0_COORDINATE_IDENTITIES).toContain("LOCAL");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ coordinateIdentity: "project north" }))).toThrow("COORDINATE_CONTEXT_UNSUPPORTED");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ convertUnits: true }))).toThrow("UNIT_CONVERSION_NOT_IN_R3");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ transformCoordinates: true }))).toThrow("COORDINATE_TRANSFORMATION_NOT_IN_R3");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ inferAxis: true }))).toThrow("AXIS_INFERENCE_NOT_IN_R3");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ geometryValidated: true }))).toThrow("GEOMETRY_VALIDATION_NOT_IN_R3");
    const label = recordSemanticEvidence(evidence, actor(), semanticInput({
      evidenceId: "sem-label",
      semanticType: "SOURCE_CLASSIFICATION",
      sourcePropertyName: "Name",
      sourceValue: "conc",
    }));
    expect(label.sourceValue).toBe("conc");
    expect(unresolved.evidenceFingerprint).toBe(fingerprintCanonical({
      evidenceId: "geo-1",
      evidenceFamily: "GEOMETRY",
      mappingId: mapping.mappingId,
      mappingFingerprint: mapping.mappingFingerprint,
      referenceId: "ref-1",
      sourceRevision: "rev-1",
      r1MetadataFingerprint: mapping.r1MetadataFingerprint,
      sourceObjectId: "source-object-1",
      structuralTargetId: "member-1",
      evidenceType: "POINT",
      sourcePropertyName: null,
      components: [10.5, 0, -3.25],
      labels: [" B1 "],
      sourceValue: null,
      declaredUnit: null,
      unitContextStatus: "UNRESOLVED_PENDING_R4",
      coordinateIdentity: null,
      coordinateContextStatus: "UNRESOLVED_PENDING_R4",
      declaredAxis: null,
      axisContextStatus: "UNRESOLVED_PENDING_R4",
      provenanceRef: "geo-prov-1",
      evidenceRef: "geo-ev-1",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
      predecessorEvidenceId: null,
    }));
    expect(recordGeometryEvidence(ready().evidence, actor(), geometryInput({ labels: [" B1 "] })).evidenceFingerprint).toBe(unresolved.evidenceFingerprint);
    expect(unresolved.engineeringValidated).toBe(false);
    expect(label.engineeringValidated).toBe(false);
    expect(D1M_R3_MISSING_UNIT_AUTO_INFERRED).toBe(false);
    expect(D1M_R3_MISSING_COORDINATE_AUTO_INFERRED).toBe(false);
    expect(D1M_R3_D1K_UNIT_ARCHITECTURE_REUSED).toBe(true);
    expect(D1M_R3_D1K_COORDINATE_ARCHITECTURE_REUSED).toBe(true);
    expect(D1M_R3_D1K_AXIS_ARCHITECTURE_REUSED).toBe(true);
    expect(D1M_R3_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_AXIS_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_GEOMETRY_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1M_R3_SEMANTIC_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1M_R3_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1M_R3_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1M_R3_GEOMETRY_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R3_SEMANTIC_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R3_EVIDENCE_RECORDED_EQUALS_FORMAT_SUPPORTED).toBe(false);
  });

  it("preserves authority, provenance, immutability, history, and an unresolved conflict", () => {
    const { evidence } = ready();
    const original = recordGeometryEvidence(evidence, actor(), geometryInput());
    const fingerprint = original.evidenceFingerprint;
    expect(original.evidenceAuthority).toBe("INTERFACE_RECORD_AUTHORITY");
    expect(original.sourceAuthority).toBe("SOURCE_AUTHORITY");
    expect(original.engineeringApprover).toBeNull();
    expect(original.certificationAuthority).toBeNull();
    expect(original.provenance.mappingId).toBe("map-1");
    expect(original.provenance.sourceRevision).toBe("rev-1");
    expect(original.provenance.sourceObjectId).toBe("source-object-1");
    expect(original.provenance.aiGenerated).toBe(false);
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ evidenceId: "geo-2", components: [1, 2, 3] }))).toThrow("EVIDENCE_CONFLICT");
    expect(original.components).toEqual([10.5, 0, -3.25]);
    expect(original.evidenceFingerprint).toBe(fingerprint);
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ components: [1, 2, 3] }))).toThrow("EVIDENCE_ALREADY_RECORDED");
    const successor = supersedeGeometryEvidence(evidence, actor(), geometryInput({
      evidenceId: "geo-2",
      components: [1, 2, 3],
      predecessorEvidenceId: "geo-1",
    }));
    expect(original.recordStatus).toBe("SUPERSEDED");
    expect(original.evidenceFingerprint).toBe(fingerprint);
    expect(successor.components).toEqual([1, 2, 3]);
    expect(successor.predecessorEvidenceId).toBe("geo-1");
    const semantic = recordSemanticEvidence(evidence, actor(), semanticInput());
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({
      evidenceId: "sem-2",
      sourceValue: "Steel",
    }))).toThrow("EVIDENCE_CONFLICT");
    expect(semantic.sourceValue).toBe("Concrete");
    const semanticSuccessor = supersedeSemanticEvidence(evidence, actor(), semanticInput({
      evidenceId: "sem-2",
      sourceValue: "Steel",
      predecessorEvidenceId: "sem-1",
    }));
    expect(semantic.recordStatus).toBe("SUPERSEDED");
    expect(semantic.sourceValue).toBe("Concrete");
    expect(semanticSuccessor.sourceValue).toBe("Steel");
    expect(evidence.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED", "CREATED", "SUPERSEDED", "CREATED"]);
    expect(() => mutateGeometryEvidence()).toThrow("SILENT_GEOMETRY_MUTATION_REJECTED");
    expect(() => mutateSemanticEvidence()).toThrow("SILENT_SEMANTIC_MUTATION_REJECTED");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ evidenceId: "geo-3", ambiguous: true }))).toThrow("AMBIGUOUS_EVIDENCE_UNRESOLVED");
    const confirmed = confirmModelEvidence(evidence, reviewer(), successor.evidenceId);
    expect(confirmed.evidenceStatus).toBe("CONFIRMED");
    expect(confirmed.humanReviewRecorded).toBe(true);
    expect(confirmed.engineeringValidated).toBe(false);
    expect(confirmed.geometryValidated).toBe(false);
    expect(confirmed.structuralAdequacyConfirmed).toBe(false);
    expect(confirmed.evidenceFingerprint).toBe(successor.evidenceFingerprint);
    expect(confirmed.components).toEqual([1, 2, 3]);
    expect(D1M_R3_EVIDENCE_AUTHORITY_PRESERVED).toBe(true);
    expect(D1M_R3_EVIDENCE_PROVENANCE_PRESERVED).toBe(true);
    expect(D1M_R3_GEOMETRY_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R3_SEMANTIC_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R3_SILENT_GEOMETRY_MUTATION_ALLOWED).toBe(false);
    expect(D1M_R3_SILENT_SEMANTIC_MUTATION_ALLOWED).toBe(false);
    expect(D1M_R3_CONFLICTING_EVIDENCE_AUTO_RESOLVED).toBe(false);
    expect(D1M_R3_HUMAN_REVIEW_SUPPORTED).toBe(true);
    expect(D1M_R3_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION).toBe(false);
  });

  it("refuses AI, administrator, engineering-approval, and certification authority", () => {
    const { evidence } = ready();
    expect(() => recordGeometryEvidence(evidence, actor({ authority: "AI_ASSISTANT" }), geometryInput())).toThrow("AI_NOT_EVIDENCE_AUTHORITY");
    expect(() => recordSemanticEvidence(evidence, actor({ actorId: "LLM-1" }), semanticInput())).toThrow("AI_NOT_EVIDENCE_AUTHORITY");
    expect(() => recordGeometryEvidence(evidence, actor({ authority: "ADMINISTRATOR" }), geometryInput())).toThrow("ADMIN_NOT_EVIDENCE_AUTHORITY");
    expect(() => recordGeometryEvidence(evidence, actor({ authority: "ENGINEERING_APPROVAL_AUTHORITY" }), geometryInput())).toThrow("EVIDENCE_AUTHORITY_NOT_ENGINEERING_APPROVAL");
    expect(() => recordSemanticEvidence(evidence, actor({ authority: "CERTIFICATION_AUTHORITY" }), semanticInput())).toThrow("EVIDENCE_AUTHORITY_NOT_CERTIFIER");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ engineeringValidated: true }))).toThrow("ENGINEERING_VALIDATION_NOT_IN_R3");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ certified: true }))).toThrow("EVIDENCE_NOT_CERTIFICATION");
    const recorded = recordGeometryEvidence(evidence, actor(), geometryInput());
    expect(() => confirmModelEvidence(evidence, reviewer({ authority: "AI_ASSISTANT" }), recorded.evidenceId)).toThrow("AI_NOT_EVIDENCE_AUTHORITY");
    expect(() => confirmModelEvidence(evidence, reviewer({ authority: "ADMINISTRATOR" }), recorded.evidenceId)).toThrow("ADMIN_NOT_EVIDENCE_AUTHORITY");
    expect(() => confirmModelEvidence(evidence, actor(), recorded.evidenceId)).toThrow("UNAUTHORIZED");
    expect(() => extractModelByAi()).toThrow("AI_EXTRACTION_NOT_IN_R3");
    expect(recorded.evidenceStatus).toBe("RECORDED");
    expect(D1M_R3_AI_CAN_INVENT_GEOMETRY_EVIDENCE).toBe(false);
    expect(D1M_R3_AI_CAN_INVENT_SEMANTIC_EVIDENCE).toBe(false);
    expect(D1M_R3_AI_CAN_INVENT_SOURCE_PROPERTY).toBe(false);
    expect(D1M_R3_AI_CAN_INFER_UNKNOWN_ENGINEERING_SEMANTIC).toBe(false);
    expect(D1M_R3_AI_CAN_MARK_EVIDENCE_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R3_AI_MODEL_EXTRACTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_AI_GEOMETRY_EXTRACTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_AI_SEMANTIC_EXTRACTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_ADMIN_EQUALS_EVIDENCE_ENGINEERING_AUTHORITY).toBe(false);
    expect(D1M_R3_EVIDENCE_AUTHORITY_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D1M_R3_EVIDENCE_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
  });

  it("rejects cross-scope evidence and spoofed revision or mapping identity", () => {
    const localSource = createD1mR1Store({
      contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
    }, now);
    const foreignSource = createD1mR1Store({
      contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }],
    }, now);
    recordCadBimSourceRevision(localSource, actor(), revisionInput());
    recordCadBimSourceRevision(foreignSource, actor({ tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }), revisionInput({
      referenceId: "ref-b",
      artifactId: "artifact-b",
      contentFingerprint: "fp-content-b",
    }));
    const localMap = createD1mR2Store({
      references: localSource.records,
      targets: [{ id: "member-1", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
    }, now);
    const foreignMap = createD1mR2Store({
      references: foreignSource.records,
      targets: [{ id: "member-b", kind: "MEMBER", tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }],
    }, now);
    recordSourceObjectMapping(localMap, actor(), mappingInput());
    recordSourceObjectMapping(foreignMap, actor({ tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }), mappingInput({
      mappingId: "map-b",
      referenceId: "ref-b",
      structuralTargetId: "member-b",
    }));
    const evidence = createD1mR3Store({
      references: [...localSource.records, ...foreignSource.records],
      mappings: [...localMap.records, ...foreignMap.records],
    }, now);
    expect(() => recordGeometryEvidence(evidence, actor({ tenantId: "tenant-b" }), geometryInput())).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordGeometryEvidence(evidence, actor({ workspaceId: "workspace-b" }), geometryInput())).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordGeometryEvidence(evidence, actor({ projectId: "project-b" }), geometryInput())).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordSemanticEvidence(evidence, actor(), semanticInput({ workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordGeometryEvidence(evidence, actor(), geometryInput({ mappingId: "map-b" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(evidence.records).toHaveLength(0);
    expect(D1M_R3_SCOPE_ENFORCED).toBe(true);
    expect(D1M_R3_CROSS_WORKSPACE_EVIDENCE_ALLOWED).toBe(false);
    expect(D1M_R3_CROSS_PROJECT_EVIDENCE_ALLOWED).toBe(false);
    expect(D1M_R3_EVIDENCE_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
  });

  it("does not parse, extract, match, convert, or author a model", () => {
    expect(() => parseCadBimArtifact()).toThrow("PARSE_NOT_IN_R3");
    expect(() => ingestCadBimFile()).toThrow("FILE_INGESTION_NOT_IN_R3");
    expect(() => extractCadBimObjects()).toThrow("OBJECT_EXTRACTION_NOT_IN_R3");
    expect(() => adaptCadBimFormat()).toThrow("FORMAT_ADAPTER_NOT_IN_R3");
    expect(() => connectCadBimVendor()).toThrow("CONNECTOR_NOT_IN_R3");
    expect(() => matchObjectByGeometry()).toThrow("GEOMETRY_MATCHING_NOT_IN_R3");
    expect(() => matchObjectBySemantics()).toThrow("SEMANTIC_MATCHING_NOT_IN_R3");
    expect(() => convertCadBimUnits()).toThrow("UNIT_CONVERSION_NOT_IN_R3");
    expect(() => transformCadBimCoordinates()).toThrow("COORDINATE_TRANSFORMATION_NOT_IN_R3");
    expect(() => inferCadBimAxes()).toThrow("AXIS_INFERENCE_NOT_IN_R3");
    expect(() => inferStructuralConnectivity()).toThrow("CONNECTIVITY_INFERENCE_NOT_IN_R3");
    expect(() => inferLoadPath()).toThrow("LOAD_PATH_INFERENCE_NOT_IN_R3");
    expect(() => inferCadBimRelationships()).toThrow("RELATIONSHIP_NOT_IN_R3");
    expect(() => interpretCadBimEngineeringProperties()).toThrow("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R3");
    expect(() => runGeometryEngine()).toThrow("GEOMETRY_ENGINE_NOT_IN_R3");
    expect(() => correctCadBimModel()).toThrow("MODEL_CORRECTION_NOT_IN_R3");
    expect(() => authorCadModel()).toThrow("CAD_AUTHORING_NOT_IN_R3");
    expect(() => authorBimModel()).toThrow("BIM_AUTHORING_NOT_IN_R3");
    expect(() => recordGeometryEvidence(ready().evidence, actor(), geometryInput({ extractedFromFile: true }))).toThrow("EXTRACTION_NOT_IN_R3");
    expect(() => recordSemanticEvidence(ready().evidence, actor(), semanticInput({ formatSupported: true }))).toThrow("FORMAT_SUPPORT_NOT_CLAIMED");
    expect(D1M_R3_OBJECT_EXTRACTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_PARSE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_GENERIC_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_RELATIONSHIP_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_CHANGE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_FORMAT_ADAPTER_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_CONNECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_GEOMETRY_MATCHING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_SEMANTIC_MATCHING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_CONNECTIVITY_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_LOAD_PATH_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_GENERAL_GEOMETRY_ENGINE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_MODEL_CORRECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_CAD_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_BIM_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_EVIDENCE_RECORDED_EQUALS_EXTRACTED_FROM_FILE).toBe(false);
    expect(D1M_R3_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1M_R3_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1M_R3_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1M_R3_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1M_R3_POST_D1J_DEBT_PRESERVED).toContain("NOT_AVAILABLE");
    expect(D1M_R3_D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1M_R3_D1K_GOVERNANCE_REUSED).toBe(true);
    expect(D1M_R3_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED).toBe(false);
    expect(D1M_R3_D1L_TRACK_COMPLETE).toBe(true);
    expect(D1M_R3_D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1M_R3_MODEL_EVIDENCE_EQUALS_D1L_CERTIFICATION_ELIGIBLE).toBe(false);
    expect(D1M_R3_D1N_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1M_R3_D1N_ABSORBED).toBe(false);
    expect(D1M_R3_D1N_RUNTIME_STARTED).toBe(false);
    expect(D1M_R3_D1N_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_D9_ABSORBED).toBe(false);
    expect(D1M_R3_D9_RUNTIME_STARTED).toBe(false);
    expect(D1M_R3_D9_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1M_R3_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1M_R3_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1M_R3_UNAUTHORIZED_PRODUCT_CLAIM).toBe(false);
    expect(D1M_R4_CANONICAL_PHASE).toBe("EOS-D1M-R4-UNIT-COORDINATE-AXIS-REFERENCE");
    expect(D1M_R4_PHASE_TYPE).toBe("CAD_OR_BIM_UNIT_COORDINATE_AXIS_REFERENCE");
    expect(D1M_R4_CANONICAL_SCOPE).toContain("Do not silently convert geometry");
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "cad-bim-model-evidence.ts"), "utf8");
    expect(source.includes(["from", '"@rtb/engineering-review"'].join(" "))).toBe(false);
    expect(source.includes("fetch(")).toBe(false);
    expect(source.includes("existingUnitPairCompatible")).toBe(false);
    expect(scanAnalysisFormulaBypass("cad-bim-model-evidence.ts", source)).toEqual([]);
  });
});
