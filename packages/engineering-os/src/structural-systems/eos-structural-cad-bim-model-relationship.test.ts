import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D1M_0_SOURCE_RELATIONSHIP_KINDS } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { createD1mR2Store, recordSourceObjectMapping, type D1mR2Input } from "./cad-bim-object-mapping";
import { createD1mR3Store, recordGeometryEvidence, type D1mR3Actor, type D1mR3GeometryInput } from "./cad-bim-model-evidence";
import {
  D1M_R5_ADMIN_EQUALS_ENGINEERING_AUTHORITY,
  D1M_R5_AI_CAN_APPROVE_RELATIONSHIP,
  D1M_R5_AI_CAN_CREATE_RELATIONSHIP,
  D1M_R5_AI_CAN_INVENT_ENDPOINT,
  D1M_R5_AI_CAN_INVENT_TYPE,
  D1M_R5_AI_CAN_MARK_CONNECTIVITY_VALIDATED,
  D1M_R5_AI_CAN_MARK_LOAD_PATH,
  D1M_R5_AI_INFERENCE_RUNTIME_COUNT,
  D1M_R5_AMBIGUOUS_AUTO_RESOLVED,
  D1M_R5_ARCHITECTURE_READY,
  D1M_R5_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1M_R5_AUTHORITY_EQUALS_ENGINEERING_APPROVAL,
  D1M_R5_AUTHORITY_PRESERVED,
  D1M_R5_AUTHORIZED_EQUALS_CONNECTIVITY_VALIDATED,
  D1M_R5_AUTHORIZED_EQUALS_LOAD_PATH_VALIDATED,
  D1M_R5_AXIS_INFERENCE_RUNTIME_COUNT,
  D1M_R5_AXIS_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R5_BIM_AUTHORING_RUNTIME_COUNT,
  D1M_R5_CAD_AUTHORING_RUNTIME_COUNT,
  D1M_R5_CANONICAL_DIGITAL_THREAD_REUSED,
  D1M_R5_CANONICAL_FINGERPRINT_REUSED,
  D1M_R5_CHANGE_GOVERNANCE_RUNTIME_READY,
  D1M_R5_CLASH_DETECTION_RUNTIME_COUNT,
  D1M_R5_COMPOSITION_REASONING_RUNTIME_COUNT,
  D1M_R5_CONFLICT_AUTO_RESOLVED,
  D1M_R5_CONNECTIVITY_INFERENCE_RUNTIME_COUNT,
  D1M_R5_CONNECTIVITY_VALIDATION_RUNTIME_COUNT,
  D1M_R5_CONNECTOR_RUNTIME_COUNT,
  D1M_R5_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R5_COORDINATION_RUNTIME_COUNT,
  D1M_R5_CROSS_ARTIFACT_POLICY_GOVERNED,
  D1M_R5_CROSS_PROJECT_ALLOWED,
  D1M_R5_CROSS_WORKSPACE_ALLOWED,
  D1M_R5_D1G_BLOCKER_PRESERVED,
  D1M_R5_D1K_GOVERNANCE_REUSED,
  D1M_R5_D1K_INTELLIGENCE_READY,
  D1M_R5_D1K_INTERNAL_INTEGRATION_READY,
  D1M_R5_D1K_LIMITATIONS_PRESERVED,
  D1M_R5_D1L_TRACK_COMPLETE,
  D1M_R5_D1L_TRACK_STATUS,
  D1M_R5_D1N_ABSORBED,
  D1M_R5_D1N_CURRENT_STATUS,
  D1M_R5_D1N_RUNTIME_COUNT,
  D1M_R5_D1N_RUNTIME_STARTED,
  D1M_R5_D2_D8_RUNTIME_COUNT,
  D1M_R5_D2_D8_RUNTIME_STARTED,
  D1M_R5_D9_ABSORBED,
  D1M_R5_D9_RUNTIME_COUNT,
  D1M_R5_D9_RUNTIME_STARTED,
  D1M_R5_DATABASE_SCHEMA_CHANGED,
  D1M_R5_DIRECTION_PRESERVED,
  D1M_R5_DUPLICATE_GOVERNED,
  D1M_R5_ENDPOINT_ROLE_PRESERVED,
  D1M_R5_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT,
  D1M_R5_EQUALS_D1L_CERTIFICATION_ELIGIBLE,
  D1M_R5_EQUALS_LOAD_PATH,
  D1M_R5_EQUALS_STRUCTURAL_ADEQUACY,
  D1M_R5_EQUALS_STRUCTURAL_CONNECTIVITY,
  D1M_R5_EVIDENCE_AUTO_UPGRADED,
  D1M_R5_EVIDENCE_EQUALS_CONNECTIVITY_VALIDATED,
  D1M_R5_EVIDENCE_EQUALS_LOAD_PATH_VALIDATED,
  D1M_R5_EVIDENCE_PRESERVED,
  D1M_R5_EXACT_ENDPOINT_BINDING_REQUIRED,
  D1M_R5_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R5_FINGERPRINT_EQUALS_CONNECTIVITY_VALIDATED,
  D1M_R5_FINGERPRINT_EQUALS_LOAD_PATH_VALIDATED,
  D1M_R5_FINGERPRINT_IMPLEMENTED,
  D1M_R5_FORMAT_ADAPTER_RUNTIME_COUNT,
  D1M_R5_FORMAT_ADAPTER_RUNTIME_READY,
  D1M_R5_FREEFORM_TYPE_ALLOWED,
  D1M_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1M_R5_GENERIC_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R5_GEOMETRY_INFERENCE_RUNTIME_COUNT,
  D1M_R5_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R5_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1M_R5_GLOBAL_DEPENDENCY_REASONING_RUNTIME_COUNT,
  D1M_R5_HISTORY_PRESERVED,
  D1M_R5_HUMAN_REVIEW_EQUALS_CONNECTIVITY_VALIDATED,
  D1M_R5_HUMAN_REVIEW_EQUALS_LOAD_PATH_VALIDATED,
  D1M_R5_HUMAN_REVIEW_SUPPORTED,
  D1M_R5_LOAD_PATH_INFERENCE_RUNTIME_COUNT,
  D1M_R5_LOAD_PATH_VALIDATION_RUNTIME_COUNT,
  D1M_R5_MAPPING_AUTO_UPGRADED,
  D1M_R5_MATURITY_STATE,
  D1M_R5_MODEL_CORRECTION_RUNTIME_COUNT,
  D1M_R5_MODEL_EVIDENCE_RUNTIME_READY,
  D1M_R5_NEW_DEPENDENCY_ADDED,
  D1M_R5_OBJECT_EXTRACTION_RUNTIME_COUNT,
  D1M_R5_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED,
  D1M_R5_PARALLEL_DIGITAL_THREAD_CREATED,
  D1M_R5_PARSE_RUNTIME_COUNT,
  D1M_R5_PHASE,
  D1M_R5_POST_D1J_DEBT_PRESERVED,
  D1M_R5_PROVENANCE_PRESERVED,
  D1M_R5_R1_REUSED,
  D1M_R5_R2_REUSED,
  D1M_R5_R3_REUSED,
  D1M_R5_R4_REUSED,
  D1M_R5_RECORDED_EQUALS_CONNECTIVITY_VALIDATED,
  D1M_R5_RECORDED_EQUALS_LOAD_PATH_VALIDATED,
  D1M_R5_REFERENCE_COMPATIBLE_EQUALS_STRUCTURALLY_VALID,
  D1M_R5_RELATIONSHIP_IDENTITY_IMPLEMENTED,
  D1M_R5_RELATIONSHIP_RUNTIME_COUNT,
  D1M_R5_RELATIONSHIP_RUNTIME_IMPLEMENTED,
  D1M_R5_RELATIONSHIP_TYPES,
  D1M_R5_REVISION_AUTO_UPGRADED,
  D1M_R5_RUNTIME_COUNT,
  D1M_R5_RUNTIME_STARTED,
  D1M_R5_SCOPE,
  D1M_R5_SCOPE_ENFORCED,
  D1M_R5_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1M_R5_SEMANTIC_INFERENCE_RUNTIME_COUNT,
  D1M_R5_SILENT_ENDPOINT_REPOINTING_ALLOWED,
  D1M_R5_SILENT_MUTATION_ALLOWED,
  D1M_R5_SOURCE_REFERENCE_RUNTIME_READY,
  D1M_R5_SOURCE_TYPE_EQUALS_ENGINEERING_TYPE,
  D1M_R5_SPOOFING_PROTECTION_IMPLEMENTED,
  D1M_R5_STATUS,
  D1M_R5_STRUCTURAL_INTERPRETATION_RUNTIME_READY,
  D1M_R5_STRUCTURAL_PACK_COMPLETE,
  D1M_R5_TOPOLOGY_INFERENCE_RUNTIME_COUNT,
  D1M_R5_TRANSITIVE_INFERENCE_RUNTIME_COUNT,
  D1M_R5_TYPE_ALLOWLIST_ENFORCED,
  D1M_R5_UNAUTHORIZED_PRODUCT_CLAIM,
  D1M_R5_UNIT_CONVERSION_RUNTIME_COUNT,
  D1M_R6_CANONICAL_PHASE,
  D1M_R6_CANONICAL_SCOPE,
  D1M_R6_PHASE_TYPE,
  adaptCadBimFormat,
  authorBimModel,
  authorCadModel,
  composeRelationships,
  confirmModelRelationship,
  connectCadBimVendor,
  convertRelationshipUnits,
  coordinateMultidisciplinaryBim,
  correctCadBimModel,
  createD1mR5Store,
  detectCadBimClash,
  detectGlobalCycle,
  extractCadBimObjects,
  inferLoadPath,
  inferModelTopology,
  inferRelationshipAxis,
  inferRelationshipByAi,
  inferRelationshipFromGeometry,
  inferRelationshipFromSemantics,
  inferStructuralConnectivity,
  inferTransitiveRelationship,
  ingestCadBimFile,
  interpretCadBimEngineeringProperties,
  mutateModelRelationship,
  parseCadBimArtifact,
  reasonGlobalModelDependency,
  recordModelRelationship,
  repointRelationshipEndpoint,
  supersedeModelRelationship,
  transformRelationshipAxis,
  transformRelationshipCoordinates,
  transformRelationshipGeometry,
  upgradeRelationshipRevision,
  validateLoadPath,
  validateStructuralConnectivity,
  type D1mR5Actor,
  type D1mR5Input,
} from "./cad-bim-model-relationship";
import { D1M_R5_CANONICAL_PHASE, D1M_R5_CANONICAL_SCOPE, createD1mR4Store, recordReferenceContext } from "./cad-bim-reference-context";
import { createD1mR1Store, recordCadBimSourceRevision, type D1mR1Input } from "./cad-bim-source-revision";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const now = () => "2026-10-22T00:00:00.000Z";

function actor(overrides: Partial<D1mR5Actor> = {}): D1mR5Actor {
  return { actorId: "recorder-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "INTERFACE_RECORD_AUTHORITY", ...overrides };
}

function reviewer(): D1mR5Actor {
  return { ...actor(), actorId: "reviewer-1", authority: "REVIEWER_AUTHORITY" };
}

function revision(overrides: Partial<D1mR1Input> = {}): D1mR1Input {
  return {
    referenceId: "ref-1", artifactId: "artifact-1", displayName: "Level 2 model", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE",
    sourceSystemId: "source-sys-1", sourceRevision: "rev-1", sourceLocator: "source-key:artifact-1", declaredFormat: "IFC",
    sourceWorkflowState: "approved", provenanceRef: "prov-1", evidenceId: "ev-1", contentFingerprint: "fp-content-1",
    fingerprintProvenanceRef: "fp-prov-1", fingerprintEvidenceId: "fp-ev-1", structuralSystemId: "system-1", ...overrides,
  };
}

function mapping(overrides: Partial<D1mR2Input> = {}): D1mR2Input {
  return {
    mappingId: "map-1", referenceId: "ref-1", expectedSourceRevision: "rev-1", sourceObjectId: "source-object-1",
    structuralTargetId: "member-1", structuralTargetKind: "MEMBER", evidenceId: "map-ev-1", evidenceKind: "human_input", provenanceRef: "map-prov-1", ...overrides,
  };
}

function chain() {
  const source = createD1mR1Store({
    contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
  }, now);
  recordCadBimSourceRevision(source, actor() as D1mR3Actor, revision());
  recordCadBimSourceRevision(source, actor() as D1mR3Actor, revision({
    referenceId: "ref-2", artifactId: "artifact-2", sourceRevision: "rev-2", sourceLocator: "source-key:artifact-2",
    provenanceRef: "prov-2", evidenceId: "ev-2", contentFingerprint: "fp-content-2",
  }));
  const mapped = createD1mR2Store({
    references: source.records,
    targets: [
      { id: "member-1", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" },
      { id: "member-2", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" },
    ],
  }, now);
  recordSourceObjectMapping(mapped, actor(), mapping());
  recordSourceObjectMapping(mapped, actor(), mapping({ mappingId: "map-2", sourceObjectId: "source-object-2", structuralTargetId: "member-2", evidenceId: "map-ev-2", provenanceRef: "map-prov-2" }));
  recordSourceObjectMapping(mapped, actor(), mapping({ mappingId: "map-3", referenceId: "ref-2", expectedSourceRevision: "rev-2", sourceObjectId: "source-object-3", structuralTargetId: "member-2", evidenceId: "map-ev-3", provenanceRef: "map-prov-3" }));
  const evidenceStore = createD1mR3Store({ references: source.records, mappings: mapped.records }, now);
  const geometry = (overrides: Partial<D1mR3GeometryInput>): D1mR3GeometryInput => ({
    evidenceId: "geo-1", mappingId: "map-1", geometryType: "POINT", components: [1000, 0, 0], declaredUnit: "m",
    coordinateIdentity: "LOCAL", evidenceKind: "human_input", evidenceRef: "geo-ev", provenanceRef: "geo-prov", expectedSourceRevision: "rev-1", ...overrides,
  });
  const geo = recordGeometryEvidence(evidenceStore, actor() as D1mR3Actor, geometry({}));
  const geo2 = recordGeometryEvidence(evidenceStore, actor() as D1mR3Actor, geometry({ evidenceId: "geo-2", geometryType: "LINE", components: [0, 0, 0, 1, 0, 0], evidenceRef: "geo-ev-2", provenanceRef: "geo-prov-2" }));
  const contexts = createD1mR4Store(evidenceStore.records, now);
  const ctx = recordReferenceContext(contexts, actor(), { contextId: "ctx-1", evidenceId: "geo-1", quantity: "length", governedCoordinateSystem: "GLOBAL", governedAxis: "UX", signConvention: "FORCE_SIGN", evidenceRef: "ref-ev", provenanceRef: "ref-prov" });
  const ctx2 = recordReferenceContext(contexts, actor(), { contextId: "ctx-2", evidenceId: "geo-2", quantity: "length", governedCoordinateSystem: "GLOBAL", governedAxis: "UX", signConvention: "FORCE_SIGN", evidenceRef: "ref-ev-2", provenanceRef: "ref-prov-2" });
  const runtime = createD1mR5Store({ mappings: mapped.records, evidence: evidenceStore.records, contexts: contexts.records }, now);
  return { runtime, geo, geo2, ctx, ctx2 };
}

function relation(overrides: Partial<D1mR5Input> = {}): D1mR5Input {
  return {
    relationshipId: "rel-1", relationshipType: "SUPPORTED_BY", subjectMappingId: "map-1", objectMappingId: "map-2",
    supportingEvidenceId: "geo-1", referenceContextId: "ctx-1", evidenceRef: "rel-ev-1", provenanceRef: "rel-prov-1",
    expectedSubjectRevision: "rev-1", expectedObjectRevision: "rev-1", ...overrides,
  };
}

describe("EOS-D1M-R5 model relationship evidence", () => {
  it("binds an explicit directional relationship to exact R1 through R4 endpoints", () => {
    const { runtime, geo, ctx } = chain();
    const components = geo.components?.slice();
    const recorded = recordModelRelationship(runtime, actor(), relation({
      expectedSubjectMappingFingerprint: runtime.mappings[0]?.mappingFingerprint,
      expectedEvidenceFingerprint: geo.evidenceFingerprint,
      expectedContextFingerprint: ctx.contextFingerprint,
    }));
    const repeated = recordModelRelationship(runtime, actor(), relation());
    expect(recorded).toBe(repeated);
    expect(recorded.subject.referenceId).toBe("ref-1");
    expect(recorded.subject.sourceRevision).toBe("rev-1");
    expect(recorded.subject.mappingId).toBe("map-1");
    expect(recorded.subject.structuralTargetId).toBe("member-1");
    expect(recorded.object.mappingId).toBe("map-2");
    expect(recorded.object.sourceObjectId).toBe("source-object-2");
    expect(recorded.supportingEvidenceId).toBe("geo-1");
    expect(recorded.evidenceFingerprint).toBe(geo.evidenceFingerprint);
    expect(recorded.referenceContextId).toBe("ctx-1");
    expect(recorded.contextFingerprint).toBe(ctx.contextFingerprint);
    expect(recorded.direction).toBe("SUBJECT_TO_OBJECT");
    expect(recorded.subject.role).toBe("SUBJECT");
    expect(recorded.object.role).toBe("OBJECT");
    expect(recorded.engineeringRelationshipType).toBeNull();
    expect(recorded.structuralConnectivityValidated).toBe(false);
    expect(recorded.loadPathValidated).toBe(false);
    expect(recorded.structuralAdequacyConfirmed).toBe(false);
    expect(recorded.referenceContextCompatibleEqualsStructurallyValid).toBe(false);
    expect(geo.components).toEqual(components);
    expect(ctx.contextFingerprint).toBe(recorded.contextFingerprint);
    expect(D1M_R5_PHASE).toBe(D1M_R5_CANONICAL_PHASE);
    expect(D1M_R5_SCOPE).toBe(D1M_R5_CANONICAL_SCOPE);
    expect(D1M_R5_STATUS).toBe("MODEL_RELATIONSHIP_EVIDENCE_IMPLEMENTED");
    expect(D1M_R5_MATURITY_STATE).toBe("STRUCTURAL_CAD_OR_BIM_MODEL_RELATIONSHIP_EVIDENCE_IMPLEMENTED");
    expect(D1M_R5_RELATIONSHIP_TYPES).toBe(D1M_0_SOURCE_RELATIONSHIP_KINDS);
    expect(D1M_R5_ARCHITECTURE_READY).toBe(true);
    expect(D1M_R5_SOURCE_REFERENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R5_MODEL_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R5_FORMAT_ADAPTER_RUNTIME_READY).toBe(false);
    expect(D1M_R5_STRUCTURAL_INTERPRETATION_RUNTIME_READY).toBe(false);
    expect(D1M_R5_CHANGE_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D1M_R5_R1_REUSED).toBe(true);
    expect(D1M_R5_R2_REUSED).toBe(true);
    expect(D1M_R5_R3_REUSED).toBe(true);
    expect(D1M_R5_R4_REUSED).toBe(true);
    expect(D1M_R5_EXACT_ENDPOINT_BINDING_REQUIRED).toBe(true);
    expect(D1M_R5_CROSS_ARTIFACT_POLICY_GOVERNED).toBe(true);
    expect(D1M_R5_RELATIONSHIP_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R5_RELATIONSHIP_RUNTIME_COUNT).toBe(1);
    expect(D1M_R5_RELATIONSHIP_IDENTITY_IMPLEMENTED).toBe(true);
    expect(D1M_R5_RUNTIME_STARTED).toBe(true);
    expect(D1M_R5_RUNTIME_COUNT).toBe(5);
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-missing", subjectMappingId: "missing" }))).toThrow("R2_MAPPING_REQUIRED");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-float", expectedSubjectRevision: "latest" }))).toThrow("FLOATING_REFERENCE_REJECTED");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-rev", expectedObjectRevision: "rev-9" }))).toThrow("ARTIFACT_REVISION_MISMATCH");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-map", expectedSubjectMappingFingerprint: "forged" }))).toThrow("MAPPING_SUBSTITUTION_REJECTED");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-end", expectedObjectObjectId: "other" }))).toThrow("ENDPOINT_SUBSTITUTION_REJECTED");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-ev", expectedEvidenceFingerprint: "forged" }))).toThrow("EVIDENCE_SUBSTITUTION_REJECTED");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-ctx", expectedContextFingerprint: "forged" }))).toThrow("REFERENCE_CONTEXT_SUBSTITUTION_REJECTED");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-self", objectMappingId: "map-1" }))).toThrow("SELF_ENDPOINT_REJECTED");
    expect(() => upgradeRelationshipRevision()).toThrow("RELATIONSHIP_REVISION_AUTO_UPGRADE_REJECTED");
  });

  it("keeps source relationship types directional and distinct from engineering topology", () => {
    const { runtime } = chain();
    const recorded = recordModelRelationship(runtime, actor(), relation());
    expect(recorded.sourceRelationshipType).toBe("SUPPORTED_BY");
    expect(recorded.sourceRelationshipEqualsEngineeringRelationship).toBe(false);
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-free", relationshipType: "beam supported by column" }))).toThrow("RELATIONSHIP_TYPE_UNSUPPORTED");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-dup" }))).toThrow("RELATIONSHIP_CONFLICT");
    expect(recorded.subject.mappingId).toBe("map-1");
    expect(recorded.object.mappingId).toBe("map-2");
    const reversed = recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-reverse", subjectMappingId: "map-2", objectMappingId: "map-1" }));
    expect(reversed.subject.mappingId).toBe("map-2");
    expect(reversed.object.mappingId).toBe("map-1");
    expect(recorded.subject.mappingId).toBe("map-1");
    expect(() => recordModelRelationship(runtime, actor(), relation({ reverseDirection: true }))).toThrow("DIRECTION_REVERSAL_REJECTED");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-1", subjectMappingId: "map-2", objectMappingId: "map-1" }))).toThrow("RELATIONSHIP_ALREADY_RECORDED");
    expect(recorded.direction).toBe("SUBJECT_TO_OBJECT");
    const cross = recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-cross", relationshipType: "REFERENCES", objectMappingId: "map-3", expectedObjectRevision: "rev-2" }));
    expect(cross.subject.artifactId).toBe("artifact-1");
    expect(cross.object.artifactId).toBe("artifact-2");
    expect(cross.object.sourceRevision).toBe("rev-2");
    expect(cross.structuralConnectivityValidated).toBe(false);
    expect(cross.loadPathValidated).toBe(false);
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-ambiguous", relationshipType: "CONNECTED_TO", ambiguous: true }))).toThrow("AMBIGUOUS_RELATIONSHIP_UNRESOLVED");
    expect(runtime.records.some((row) => row.relationshipId === "rel-ambiguous")).toBe(false);
    expect(D1M_R5_TYPE_ALLOWLIST_ENFORCED).toBe(true);
    expect(D1M_R5_FREEFORM_TYPE_ALLOWED).toBe(false);
    expect(D1M_R5_SOURCE_TYPE_EQUALS_ENGINEERING_TYPE).toBe(false);
    expect(D1M_R5_DIRECTION_PRESERVED).toBe(true);
    expect(D1M_R5_ENDPOINT_ROLE_PRESERVED).toBe(true);
    expect(D1M_R5_DUPLICATE_GOVERNED).toBe(true);
    expect(D1M_R5_EQUALS_STRUCTURAL_CONNECTIVITY).toBe(false);
    expect(D1M_R5_EQUALS_LOAD_PATH).toBe(false);
    expect(D1M_R5_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(D1M_R5_RECORDED_EQUALS_CONNECTIVITY_VALIDATED).toBe(false);
    expect(D1M_R5_AUTHORIZED_EQUALS_CONNECTIVITY_VALIDATED).toBe(false);
    expect(D1M_R5_RECORDED_EQUALS_LOAD_PATH_VALIDATED).toBe(false);
    expect(D1M_R5_AUTHORIZED_EQUALS_LOAD_PATH_VALIDATED).toBe(false);
    expect(D1M_R5_EVIDENCE_EQUALS_CONNECTIVITY_VALIDATED).toBe(false);
    expect(D1M_R5_EVIDENCE_EQUALS_LOAD_PATH_VALIDATED).toBe(false);
    expect(D1M_R5_AMBIGUOUS_AUTO_RESOLVED).toBe(false);
    expect(D1M_R5_CONFLICT_AUTO_RESOLVED).toBe(false);
    expect(D1M_R5_REFERENCE_COMPATIBLE_EQUALS_STRUCTURALLY_VALID).toBe(false);
  });

  it("fingerprints relationship evidence and preserves history without repointing endpoints", () => {
    const { runtime, geo, ctx } = chain();
    const original = recordModelRelationship(runtime, actor(), relation());
    const again = recordModelRelationship(createD1mR5Store({ mappings: runtime.mappings, evidence: runtime.evidence, contexts: runtime.contexts }, now), actor(), relation());
    expect(original.relationshipFingerprint).toBe(again.relationshipFingerprint);
    expect(original.relationshipFingerprint).toBe(fingerprintCanonical({
      relationshipId: "rel-1", relationshipType: "SUPPORTED_BY", direction: "SUBJECT_TO_OBJECT",
      subjectRole: "SUBJECT", subjectMappingId: "map-1", subjectMappingFingerprint: original.subject.mappingFingerprint,
      subjectRevision: "rev-1", subjectR1Fingerprint: original.subject.r1MetadataFingerprint, subjectObjectId: "source-object-1", subjectTargetId: "member-1",
      objectRole: "OBJECT", objectMappingId: "map-2", objectMappingFingerprint: original.object.mappingFingerprint,
      objectRevision: "rev-1", objectR1Fingerprint: original.object.r1MetadataFingerprint, objectObjectId: "source-object-2", objectTargetId: "member-2",
      supportingEvidenceId: "geo-1", evidenceFingerprint: geo.evidenceFingerprint, referenceContextId: "ctx-1", contextFingerprint: ctx.contextFingerprint,
      provenanceRef: "rel-prov-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", predecessorRelationshipId: null,
    }));
    expect(original.engineeringValidated).toBe(false);
    expect(() => supersedeModelRelationship(runtime, actor(), relation({ relationshipId: "rel-moved", objectMappingId: "map-3", expectedObjectRevision: "rev-2", predecessorRelationshipId: "rel-1" }))).toThrow("SILENT_ENDPOINT_REPOINTING_REJECTED");
    expect(original.object.mappingId).toBe("map-2");
    const successor = supersedeModelRelationship(runtime, actor(), relation({ relationshipId: "rel-2", supportingEvidenceId: "geo-2", referenceContextId: "ctx-2", predecessorRelationshipId: "rel-1" }));
    expect(successor.supportingEvidenceId).toBe("geo-2");
    expect(successor.subject.mappingId).toBe("map-1");
    expect(successor.object.mappingId).toBe("map-2");
    expect(original.recordStatus).toBe("SUPERSEDED");
    expect(original.relationshipFingerprint).toBe(again.relationshipFingerprint);
    expect(runtime.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(() => mutateModelRelationship()).toThrow("SILENT_RELATIONSHIP_MUTATION_REJECTED");
    expect(() => repointRelationshipEndpoint()).toThrow("SILENT_ENDPOINT_REPOINTING_REJECTED");
    const confirmed = confirmModelRelationship(runtime, reviewer(), successor.relationshipId);
    expect(confirmed.relationshipStatus).toBe("CONFIRMED");
    expect(confirmed.humanReviewRecorded).toBe(true);
    expect(confirmed.structuralConnectivityValidated).toBe(false);
    expect(confirmed.loadPathValidated).toBe(false);
    expect(confirmed.relationshipFingerprint).toBe(successor.relationshipFingerprint);
    expect(confirmed.provenanceRef).toBe("rel-prov-1");
    expect(confirmed.evidenceRef).toBe("rel-ev-1");
    expect(confirmed.relationshipAuthority).toBe("INTERFACE_RECORD_AUTHORITY");
    expect(D1M_R5_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1M_R5_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1M_R5_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1M_R5_FINGERPRINT_EQUALS_CONNECTIVITY_VALIDATED).toBe(false);
    expect(D1M_R5_FINGERPRINT_EQUALS_LOAD_PATH_VALIDATED).toBe(false);
    expect(D1M_R5_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R5_SILENT_MUTATION_ALLOWED).toBe(false);
    expect(D1M_R5_SILENT_ENDPOINT_REPOINTING_ALLOWED).toBe(false);
    expect(D1M_R5_REVISION_AUTO_UPGRADED).toBe(false);
    expect(D1M_R5_MAPPING_AUTO_UPGRADED).toBe(false);
    expect(D1M_R5_EVIDENCE_AUTO_UPGRADED).toBe(false);
    expect(D1M_R5_EVIDENCE_PRESERVED).toBe(true);
    expect(D1M_R5_PROVENANCE_PRESERVED).toBe(true);
    expect(D1M_R5_HUMAN_REVIEW_SUPPORTED).toBe(true);
    expect(D1M_R5_HUMAN_REVIEW_EQUALS_CONNECTIVITY_VALIDATED).toBe(false);
    expect(D1M_R5_HUMAN_REVIEW_EQUALS_LOAD_PATH_VALIDATED).toBe(false);
    expect(D1M_R5_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1M_R5_PARALLEL_DIGITAL_THREAD_CREATED).toBe(false);
  });

  it("rejects elevated authority, cross-scope endpoints, and relationship spoofing", () => {
    const { runtime } = chain();
    expect(() => recordModelRelationship(runtime, actor({ authority: "AI_ASSISTANT" }), relation())).toThrow("AI_NOT_RELATIONSHIP_AUTHORITY");
    expect(() => recordModelRelationship(runtime, actor({ actorId: "LLM-1" }), relation())).toThrow("AI_NOT_RELATIONSHIP_AUTHORITY");
    expect(() => recordModelRelationship(runtime, actor({ authority: "ADMINISTRATOR" }), relation())).toThrow("ADMIN_NOT_RELATIONSHIP_AUTHORITY");
    expect(() => recordModelRelationship(runtime, actor({ authority: "ENGINEERING_APPROVAL_AUTHORITY" }), relation())).toThrow("RELATIONSHIP_AUTHORITY_NOT_ENGINEERING_APPROVAL");
    expect(() => recordModelRelationship(runtime, actor({ authority: "CERTIFICATION_AUTHORITY" }), relation())).toThrow("RELATIONSHIP_AUTHORITY_NOT_CERTIFIER");
    expect(() => recordModelRelationship(runtime, actor(), relation({ structurallyValidated: true }))).toThrow("STRUCTURAL_CONNECTIVITY_VALIDATION_NOT_IN_R5");
    expect(() => recordModelRelationship(runtime, actor(), relation({ loadPath: true }))).toThrow("LOAD_PATH_VALIDATION_NOT_IN_R5");
    expect(() => inferRelationshipByAi()).toThrow("AI_RELATIONSHIP_INFERENCE_NOT_IN_R5");
    const recorded = recordModelRelationship(runtime, actor(), relation());
    expect(() => confirmModelRelationship(runtime, { ...reviewer(), authority: "AI_ASSISTANT" }, recorded.relationshipId)).toThrow("AI_NOT_RELATIONSHIP_AUTHORITY");
    expect(() => confirmModelRelationship(runtime, actor(), recorded.relationshipId)).toThrow("UNAUTHORIZED");
    expect(recorded.engineeringApprover).toBeNull();
    expect(recorded.certificationAuthority).toBeNull();
    expect(() => recordModelRelationship(runtime, actor({ tenantId: "tenant-b" }), relation({ relationshipId: "rel-b" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordModelRelationship(runtime, actor({ workspaceId: "workspace-b" }), relation({ relationshipId: "rel-w" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordModelRelationship(runtime, actor({ projectId: "project-b" }), relation({ relationshipId: "rel-p" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordModelRelationship(runtime, actor(), relation({ relationshipId: "rel-scope", workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(D1M_R5_AUTHORITY_PRESERVED).toBe(true);
    expect(D1M_R5_AUTHORITY_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D1M_R5_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1M_R5_ADMIN_EQUALS_ENGINEERING_AUTHORITY).toBe(false);
    expect(D1M_R5_AI_CAN_CREATE_RELATIONSHIP).toBe(false);
    expect(D1M_R5_AI_CAN_APPROVE_RELATIONSHIP).toBe(false);
    expect(D1M_R5_AI_CAN_INVENT_ENDPOINT).toBe(false);
    expect(D1M_R5_AI_CAN_INVENT_TYPE).toBe(false);
    expect(D1M_R5_AI_CAN_MARK_CONNECTIVITY_VALIDATED).toBe(false);
    expect(D1M_R5_AI_CAN_MARK_LOAD_PATH).toBe(false);
    expect(D1M_R5_AI_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_SCOPE_ENFORCED).toBe(true);
    expect(D1M_R5_CROSS_WORKSPACE_ALLOWED).toBe(false);
    expect(D1M_R5_CROSS_PROJECT_ALLOWED).toBe(false);
    expect(D1M_R5_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
  });

  it("does not infer topology, parse a model, or promote closed tracks", () => {
    expect(() => inferRelationshipFromGeometry()).toThrow("GEOMETRY_RELATIONSHIP_INFERENCE_NOT_IN_R5");
    expect(() => inferRelationshipFromSemantics()).toThrow("SEMANTIC_RELATIONSHIP_INFERENCE_NOT_IN_R5");
    expect(() => inferModelTopology()).toThrow("TOPOLOGY_INFERENCE_NOT_IN_R5");
    expect(() => inferTransitiveRelationship()).toThrow("TRANSITIVE_RELATIONSHIP_INFERENCE_NOT_IN_R5");
    expect(() => composeRelationships()).toThrow("RELATIONSHIP_COMPOSITION_NOT_IN_R5");
    expect(() => inferStructuralConnectivity()).toThrow("CONNECTIVITY_INFERENCE_NOT_IN_R5");
    expect(() => validateStructuralConnectivity()).toThrow("STRUCTURAL_CONNECTIVITY_VALIDATION_NOT_IN_R5");
    expect(() => inferLoadPath()).toThrow("LOAD_PATH_INFERENCE_NOT_IN_R5");
    expect(() => validateLoadPath()).toThrow("LOAD_PATH_VALIDATION_NOT_IN_R5");
    expect(() => detectCadBimClash()).toThrow("CLASH_DETECTION_NOT_IN_R5");
    expect(() => coordinateMultidisciplinaryBim()).toThrow("MULTIDISCIPLINARY_COORDINATION_NOT_IN_R5");
    expect(() => reasonGlobalModelDependency()).toThrow("GLOBAL_DEPENDENCY_REASONING_NOT_IN_R5");
    expect(() => detectGlobalCycle()).toThrow("GLOBAL_CYCLE_DETECTION_NOT_IN_R5");
    expect(() => convertRelationshipUnits()).toThrow("UNIT_CONVERSION_NOT_IN_R5");
    expect(() => transformRelationshipCoordinates()).toThrow("COORDINATE_TRANSFORMATION_NOT_IN_R5");
    expect(() => inferRelationshipAxis()).toThrow("AXIS_INFERENCE_NOT_IN_R5");
    expect(() => transformRelationshipAxis()).toThrow("AXIS_TRANSFORMATION_NOT_IN_R5");
    expect(() => transformRelationshipGeometry()).toThrow("GEOMETRY_TRANSFORMATION_NOT_IN_R5");
    expect(() => parseCadBimArtifact()).toThrow("PARSE_NOT_IN_R5");
    expect(() => extractCadBimObjects()).toThrow("OBJECT_EXTRACTION_NOT_IN_R5");
    expect(() => ingestCadBimFile()).toThrow("FILE_INGESTION_NOT_IN_R5");
    expect(() => adaptCadBimFormat()).toThrow("FORMAT_ADAPTER_NOT_IN_R5");
    expect(() => connectCadBimVendor()).toThrow("CONNECTOR_NOT_IN_R5");
    expect(() => interpretCadBimEngineeringProperties()).toThrow("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R5");
    expect(() => correctCadBimModel()).toThrow("MODEL_CORRECTION_NOT_IN_R5");
    expect(() => authorCadModel()).toThrow("CAD_AUTHORING_NOT_IN_R5");
    expect(() => authorBimModel()).toThrow("BIM_AUTHORING_NOT_IN_R5");
    expect(D1M_R5_GEOMETRY_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_SEMANTIC_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_TOPOLOGY_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_TRANSITIVE_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_COMPOSITION_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_CONNECTIVITY_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_CONNECTIVITY_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_LOAD_PATH_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_LOAD_PATH_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_CLASH_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_COORDINATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_GLOBAL_DEPENDENCY_REASONING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_AXIS_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_AXIS_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_PARSE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_OBJECT_EXTRACTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_GENERIC_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_FORMAT_ADAPTER_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_CONNECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_MODEL_CORRECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_CAD_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_BIM_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_D1K_GOVERNANCE_REUSED).toBe(true);
    expect(D1M_R5_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED).toBe(false);
    expect(D1M_R5_D1K_INTERNAL_INTEGRATION_READY).toBe(false);
    expect(D1M_R5_D1K_INTELLIGENCE_READY).toBe(false);
    expect(D1M_R5_D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1M_R5_D1L_TRACK_COMPLETE).toBe(true);
    expect(D1M_R5_D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1M_R5_EQUALS_D1L_CERTIFICATION_ELIGIBLE).toBe(false);
    expect(D1M_R5_D1N_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1M_R5_D1N_ABSORBED).toBe(false);
    expect(D1M_R5_D1N_RUNTIME_STARTED).toBe(false);
    expect(D1M_R5_D1N_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_D9_ABSORBED).toBe(false);
    expect(D1M_R5_D9_RUNTIME_STARTED).toBe(false);
    expect(D1M_R5_D9_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1M_R5_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1M_R5_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1M_R5_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1M_R5_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1M_R5_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1M_R5_POST_D1J_DEBT_PRESERVED).toContain("NOT_AVAILABLE");
    expect(D1M_R5_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1M_R5_UNAUTHORIZED_PRODUCT_CLAIM).toBe(false);
    expect(D1M_R6_CANONICAL_PHASE).toBe("EOS-D1M-R6-FILE-API-ADAPTER-BOUNDARY");
    expect(D1M_R6_PHASE_TYPE).toBe("CAD_OR_BIM_FILE_API_ADAPTER_BOUNDARY");
    expect(D1M_R6_CANONICAL_SCOPE).toContain("Do not treat that boundary as arbitrary format support");
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "cad-bim-model-relationship.ts"), "utf8");
    expect(source.includes(["from", '"@rtb/engineering-review"'].join(" "))).toBe(false);
    expect(source.includes("fetch(")).toBe(false);
    expect(scanAnalysisFormulaBypass("cad-bim-model-relationship.ts", source)).toEqual([]);
  });
});
