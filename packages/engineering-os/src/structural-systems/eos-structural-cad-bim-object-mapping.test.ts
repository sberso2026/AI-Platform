import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D1M_ARCHITECTURE_READY, D1M_SOURCE_REFERENCE_RUNTIME_READY, STRUCTURAL_OBJECT_KINDS } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1M_R2_ADMIN_EQUALS_MAPPING_ENGINEERING_AUTHORITY,
  D1M_R2_AI_CAN_APPROVE_OBJECT_MAPPING,
  D1M_R2_AI_CAN_CREATE_AUTHORITATIVE_OBJECT_MAPPING,
  D1M_R2_AI_CAN_INVENT_SOURCE_OBJECT_IDENTITY,
  D1M_R2_AI_CAN_INVENT_STRUCTURAL_TARGET_IDENTITY,
  D1M_R2_AI_OBJECT_MATCHING_RUNTIME_COUNT,
  D1M_R2_AMBIGUOUS_MAPPING_AUTO_RESOLVED,
  D1M_R2_ARCHITECTURE_READY,
  D1M_R2_ARTIFACT_RUNTIME_COUNT,
  D1M_R2_AUTHORITATIVE_MAPPING_CONFIDENCE_SCORE_IMPLEMENTED,
  D1M_R2_AUTOMATIC_MODEL_CORRECTION_RUNTIME_COUNT,
  D1M_R2_AXIS_INFERENCE_RUNTIME_COUNT,
  D1M_R2_BIM_AUTHORING_RUNTIME_COUNT,
  D1M_R2_CAD_AUTHORING_RUNTIME_COUNT,
  D1M_R2_CANONICAL_DIGITAL_THREAD_REUSED,
  D1M_R2_CANONICAL_FINGERPRINT_REUSED,
  D1M_R2_CANONICAL_SCOPE as MAPPING_SCOPE,
  D1M_R2_CHANGE_DETECTION_RUNTIME_COUNT,
  D1M_R2_CHANGE_GOVERNANCE_RUNTIME_READY,
  D1M_R2_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R2_CROSS_PROJECT_OBJECT_MAPPING_ALLOWED,
  D1M_R2_CROSS_WORKSPACE_OBJECT_MAPPING_ALLOWED,
  D1M_R2_D1A_STRUCTURAL_IDENTITY_REUSED,
  D1M_R2_D1G_BLOCKER_PRESERVED,
  D1M_R2_D1K_CROSS_DISCIPLINE_GOVERNANCE_REUSED,
  D1M_R2_D1K_LIMITATIONS_PRESERVED,
  D1M_R2_D1L_TRACK_COMPLETE,
  D1M_R2_D1L_TRACK_STATUS,
  D1M_R2_D1N_ABSORBED,
  D1M_R2_D1N_CURRENT_STATUS,
  D1M_R2_D1N_RUNTIME_COUNT,
  D1M_R2_D1N_RUNTIME_STARTED,
  D1M_R2_D2_D8_RUNTIME_COUNT,
  D1M_R2_D2_D8_RUNTIME_STARTED,
  D1M_R2_D9_ABSORBED,
  D1M_R2_D9_RUNTIME_COUNT,
  D1M_R2_D9_RUNTIME_STARTED,
  D1M_R2_DATABASE_SCHEMA_CHANGED,
  D1M_R2_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT,
  D1M_R2_EXACT_ARTIFACT_REVISION_BINDING_REQUIRED,
  D1M_R2_EXISTING_D1A_STRUCTURAL_TARGET_REQUIRED,
  D1M_R2_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R2_FLOATING_ARTIFACT_REFERENCE_ALLOWED,
  D1M_R2_FORMAT_ADAPTER_RUNTIME_COUNT,
  D1M_R2_FORMAT_ADAPTER_RUNTIME_READY,
  D1M_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1M_R2_GENERIC_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R2_GEOMETRY_BASED_OBJECT_MATCHING_RUNTIME_COUNT,
  D1M_R2_GEOMETRY_RUNTIME_COUNT,
  D1M_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1M_R2_MAPPING_ARTIFACT_REFERENCE_AUTO_UPGRADED,
  D1M_R2_MAPPING_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1M_R2_MAPPING_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY,
  D1M_R2_MAPPING_AUTHORITY_PRESERVED,
  D1M_R2_MAPPING_AUTHORIZED_EQUALS_ENGINEERING_VALIDATED,
  D1M_R2_MAPPING_CARDINALITY,
  D1M_R2_MAPPING_CONFIRMED_EQUALS_STRUCTURAL_ADEQUACY_CONFIRMED,
  D1M_R2_MAPPING_DUPLICATE_CONFLICT_GOVERNED,
  D1M_R2_MAPPING_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  D1M_R2_MAPPING_EVIDENCE_PRESERVED,
  D1M_R2_MAPPING_FINGERPRINT_IMPLEMENTED,
  D1M_R2_MAPPING_FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED,
  D1M_R2_MAPPING_HISTORY_PRESERVED,
  D1M_R2_MAPPING_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION,
  D1M_R2_MAPPING_HUMAN_REVIEW_SUPPORTED,
  D1M_R2_MAPPING_PROVENANCE_PRESERVED,
  D1M_R2_MAPPING_RECORDED_EQUALS_ENGINEERING_VALIDATED,
  D1M_R2_MAPPING_RUNTIME_COUNT,
  D1M_R2_MAPPING_RUNTIME_IMPLEMENTED,
  D1M_R2_MAPPING_SOURCE_OBJECT_AUTO_REPOINTED,
  D1M_R2_MAPPING_STRUCTURAL_TARGET_AUTO_REPOINTED,
  D1M_R2_MATURITY_STATE,
  D1M_R2_MISSING_STRUCTURAL_TARGET_AUTO_CREATED,
  D1M_R2_MODEL_EVIDENCE_RUNTIME_READY,
  D1M_R2_NEW_DEPENDENCY_ADDED,
  D1M_R2_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT,
  D1M_R2_OBJECT_EXTRACTION_RUNTIME_COUNT,
  D1M_R2_OBJECT_MAPPING_EQUALS_D1L_CERTIFICATION_ELIGIBLE,
  D1M_R2_OBJECT_MAPPING_RECORDED_EQUALS_CERTIFIED,
  D1M_R2_OBJECT_MAPPING_RECORDED_EQUALS_ENGINEERING_VALIDATED,
  D1M_R2_OBJECT_RUNTIME_COUNT,
  D1M_R2_OBJECT_RUNTIME_MEANING,
  D1M_R2_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED,
  D1M_R2_PARALLEL_DIGITAL_THREAD_CREATED,
  D1M_R2_PARALLEL_STRUCTURAL_IDENTITY_CREATED,
  D1M_R2_PARSE_RUNTIME_COUNT,
  D1M_R2_PHASE,
  D1M_R2_POST_D1J_DEBT_PRESERVED,
  D1M_R2_R1_SOURCE_REFERENCE_REQUIRED,
  D1M_R2_RELATIONSHIP_RUNTIME_COUNT,
  D1M_R2_RUNTIME_COUNT,
  D1M_R2_RUNTIME_STARTED,
  D1M_R2_SAME_SOURCE_OBJECT_ID_ACROSS_REVISIONS_EQUALS_ENGINEERING_EQUIVALENT,
  D1M_R2_SCOPE_ENFORCED,
  D1M_R2_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1M_R2_SEMANTIC_BASED_OBJECT_MATCHING_RUNTIME_COUNT,
  D1M_R2_SEMANTIC_RUNTIME_COUNT,
  D1M_R2_SILENT_MAPPING_REPOINTING_ALLOWED,
  D1M_R2_SOURCE_MODEL_OBJECT_ID_EQUALS_STRUCTURAL_OBJECT_ID,
  D1M_R2_SOURCE_OBJECT_DISCOVERY_BY_FILE_PARSING_IMPLEMENTED,
  D1M_R2_SOURCE_OBJECT_ID_RECORDED_EQUALS_OBJECT_CONTENT_VERIFIED,
  D1M_R2_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT,
  D1M_R2_SOURCE_OBJECT_IDENTITY_RUNTIME_IMPLEMENTED,
  D1M_R2_SOURCE_OBJECT_RECORDED_EQUALS_ENGINEERING_VALIDATED,
  D1M_R2_SOURCE_OBJECT_REVISION_BINDING_ENFORCED,
  D1M_R2_SOURCE_OBJECT_SPOOFING_PROTECTION_IMPLEMENTED,
  D1M_R2_SOURCE_REFERENCE_RUNTIME_COUNT,
  D1M_R2_SOURCE_REFERENCE_RUNTIME_READY,
  D1M_R2_STATUS,
  D1M_R2_STRUCTURAL_INTERPRETATION_RUNTIME_READY,
  D1M_R2_STRUCTURAL_PACK_COMPLETE,
  D1M_R2_STRUCTURAL_TARGET_SPOOFING_PROTECTION_IMPLEMENTED,
  D1M_R2_UNAUTHORIZED_PRODUCT_CLAIM,
  D1M_R2_UNIT_CONVERSION_RUNTIME_COUNT,
  D1M_R3_CANONICAL_PHASE,
  D1M_R3_CANONICAL_SCOPE,
  D1M_R3_PHASE_TYPE,
  adaptCadBimFormat,
  authorBimModel,
  authorCadModel,
  confirmSourceObjectMapping,
  connectCadBimVendor,
  convertCadBimUnits,
  correctCadBimModel,
  createD1mR2Store,
  discoverSourceObjectByParsing,
  extractCadBimGeometry,
  extractCadBimObjects,
  extractCadBimSemantics,
  inferCadBimAxes,
  inferCadBimRelationships,
  ingestCadBimFile,
  interpretCadBimEngineeringProperties,
  matchObjectByAi,
  matchObjectByGeometry,
  matchObjectBySemantics,
  parseCadBimArtifact,
  recordSourceObjectMapping,
  repointSourceObjectMapping,
  supersedeSourceObjectMapping,
  transformCadBimCoordinates,
  upgradeMappedArtifactRevision,
  type D1mR2Actor,
  type D1mR2Input,
  type D1mR2Target,
} from "./cad-bim-object-mapping";
import { D1M_R2_CANONICAL_PHASE, D1M_R2_CANONICAL_SCOPE, createD1mR1Store, mapCadBimObjectToStructuralTarget, recordCadBimSourceRevision, type D1mR1Input } from "./cad-bim-source-revision";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const now = () => "2026-10-21T00:00:00.000Z";

function recorder(overrides: Partial<D1mR2Actor> = {}): D1mR2Actor {
  return {
    actorId: "recorder-1",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    authority: "INTERFACE_RECORD_AUTHORITY",
    ...overrides,
  };
}

function reviewer(overrides: Partial<D1mR2Actor> = {}): D1mR2Actor {
  return { ...recorder(), actorId: "reviewer-1", authority: "REVIEWER_AUTHORITY", ...overrides };
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

function target(overrides: Partial<D1mR2Target> = {}): D1mR2Target {
  return {
    id: "member-1",
    kind: "MEMBER",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
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

function ready(targets: D1mR2Target[] = [target()], revisions: D1mR1Input[] = [revisionInput()]) {
  const source = createD1mR1Store({
    contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
  }, now);
  for (const revision of revisions) recordCadBimSourceRevision(source, recorder(), revision);
  return createD1mR2Store({ references: source.records, targets }, now);
}

describe("EOS-D1M-R2 source object to structural target mapping", () => {
  it("binds one declared source object on an exact R1 revision to one existing D1A target", () => {
    const runtime = ready();
    const recorded = recordSourceObjectMapping(runtime, recorder(), mappingInput());
    const repeated = recordSourceObjectMapping(runtime, recorder(), mappingInput());
    expect(recorded).toBe(repeated);
    expect(recorded.referenceId).toBe("ref-1");
    expect(recorded.artifactId).toBe("artifact-1");
    expect(recorded.sourceRevision).toBe("rev-1");
    expect(recorded.sourceObjectId).toBe("source-object-1");
    expect(recorded.sourceObjectOrigin).toBe("DECLARED_SOURCE");
    expect(recorded.sourceObjectContentVerified).toBe(false);
    expect(recorded.structuralTargetId).toBe("member-1");
    expect(recorded.structuralTargetKind).toBe("MEMBER");
    expect(recorded.mappingStatus).toBe("RECORDED");
    expect(recorded.engineeringValidated).toBe(false);
    expect(recorded.structuralAdequacyConfirmed).toBe(false);
    expect(recorded.certified).toBe(false);
    expect(recorded.sourceObjectId).not.toBe(recorded.structuralTargetId);
    expect(STRUCTURAL_OBJECT_KINDS).toContain(recorded.structuralTargetKind);
    expect(runtime.catalog.targets).toHaveLength(1);
    expect(D1M_R2_PHASE).toBe(D1M_R2_CANONICAL_PHASE);
    expect(MAPPING_SCOPE).toBe(D1M_R2_CANONICAL_SCOPE);
    expect(D1M_R2_STATUS).toBe("SOURCE_OBJECT_MAPPING_IMPLEMENTED");
    expect(D1M_R2_MATURITY_STATE).toBe("STRUCTURAL_CAD_OR_BIM_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_IMPLEMENTED");
    expect(D1M_ARCHITECTURE_READY).toBe(true);
    expect(D1M_R2_ARCHITECTURE_READY).toBe(true);
    expect(D1M_SOURCE_REFERENCE_RUNTIME_READY).toBe(false);
    expect(D1M_R2_SOURCE_REFERENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R2_R1_SOURCE_REFERENCE_REQUIRED).toBe(true);
    expect(D1M_R2_EXACT_ARTIFACT_REVISION_BINDING_REQUIRED).toBe(true);
    expect(D1M_R2_SOURCE_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D1M_R2_ARTIFACT_RUNTIME_COUNT).toBe(1);
    expect(D1M_R2_SOURCE_OBJECT_IDENTITY_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R2_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R2_OBJECT_RUNTIME_COUNT).toBe(1);
    expect(D1M_R2_OBJECT_RUNTIME_MEANING).toBe("SOURCE_OBJECT_IDENTITY_REFERENCE_ONLY");
    expect(D1M_R2_MAPPING_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R2_MAPPING_RUNTIME_COUNT).toBe(1);
    expect(D1M_R2_RUNTIME_STARTED).toBe(true);
    expect(D1M_R2_RUNTIME_COUNT).toBe(2);
    expect(D1M_R2_MAPPING_CARDINALITY).toBe("ONE_SOURCE_OBJECT_TO_ONE_STRUCTURAL_TARGET");
    expect(D1M_R2_EXISTING_D1A_STRUCTURAL_TARGET_REQUIRED).toBe(true);
    expect(D1M_R2_D1A_STRUCTURAL_IDENTITY_REUSED).toBe(true);
    expect(D1M_R2_PARALLEL_STRUCTURAL_IDENTITY_CREATED).toBe(false);
    expect(D1M_R2_SOURCE_MODEL_OBJECT_ID_EQUALS_STRUCTURAL_OBJECT_ID).toBe(false);
    expect(D1M_R2_SOURCE_OBJECT_ID_RECORDED_EQUALS_OBJECT_CONTENT_VERIFIED).toBe(false);
    expect(D1M_R2_SOURCE_OBJECT_REVISION_BINDING_ENFORCED).toBe(true);
    expect(() => mapCadBimObjectToStructuralTarget()).toThrow("OBJECT_MAPPING_NOT_IN_R1");
  });

  it("rejects a missing R1 reference, a floating artifact, and a revision that does not match", () => {
    const runtime = ready();
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ referenceId: "" }))).toThrow("R1_REFERENCE_REQUIRED");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ referenceId: "missing" }))).toThrow("R1_REFERENCE_REQUIRED");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ referenceId: "latest" }))).toThrow("FLOATING_ARTIFACT_REFERENCE_REJECTED");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ expectedSourceRevision: "current" }))).toThrow("FLOATING_ARTIFACT_REFERENCE_REJECTED");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ expectedSourceRevision: "rev-2" }))).toThrow("ARTIFACT_REVISION_MISMATCH");
    expect(D1M_R2_FLOATING_ARTIFACT_REFERENCE_ALLOWED).toBe(false);
    expect(D1M_R2_MAPPING_ARTIFACT_REFERENCE_AUTO_UPGRADED).toBe(false);
    expect(() => upgradeMappedArtifactRevision()).toThrow("MAPPING_ARTIFACT_REVISION_AUTO_UPGRADE_REJECTED");
    expect(runtime.records).toHaveLength(0);
  });

  it("keeps the same source object id revision-specific and distinct from the structural target", () => {
    const runtime = ready([target(), target({ id: "member-2" })], [
      revisionInput(),
      revisionInput({ referenceId: "ref-2", artifactId: "artifact-2", sourceRevision: "rev-2", contentFingerprint: "fp-content-2" }),
    ]);
    const first = recordSourceObjectMapping(runtime, recorder(), mappingInput());
    const second = recordSourceObjectMapping(runtime, recorder(), mappingInput({
      mappingId: "map-2",
      referenceId: "ref-2",
      expectedSourceRevision: "rev-2",
      structuralTargetId: "member-2",
      evidenceId: "map-ev-2",
      provenanceRef: "map-prov-2",
    }));
    expect(first.sourceObjectId).toBe(second.sourceObjectId);
    expect(first.sourceRevision).not.toBe(second.sourceRevision);
    expect(first.mappingFingerprint).not.toBe(second.mappingFingerprint);
    expect(first.engineeringEquivalentAcrossRevisions).toBe(false);
    expect(second.engineeringEquivalentAcrossRevisions).toBe(false);
    expect(D1M_R2_SAME_SOURCE_OBJECT_ID_ACROSS_REVISIONS_EQUALS_ENGINEERING_EQUIVALENT).toBe(false);
    expect(first.sourceObjectId).not.toBe(first.structuralTargetId);
  });

  it("rejects a missing target and does not create one", () => {
    const runtime = ready();
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ structuralTargetId: "missing-member" }))).toThrow("TARGET_NOT_FOUND");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ structuralTargetKind: "BEAM" }))).toThrow("TARGET_KIND_MISMATCH");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ structuralTargetKind: "NOT_A_KIND" }))).toThrow("STRUCTURAL_TARGET_INVALID");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ createTarget: true }))).toThrow("TARGET_AUTO_CREATE_REJECTED");
    expect(runtime.catalog.targets).toHaveLength(1);
    expect(runtime.records).toHaveLength(0);
    expect(D1M_R2_MISSING_STRUCTURAL_TARGET_AUTO_CREATED).toBe(false);
  });

  it("preserves evidence, authority, provenance, and a canonical fingerprint", () => {
    const left = recordSourceObjectMapping(ready(), recorder(), mappingInput());
    const right = recordSourceObjectMapping(ready(), recorder(), mappingInput());
    expect(left.evidenceId).toBe("map-ev-1");
    expect(left.evidenceKind).toBe("human_input");
    expect(left.mappingAuthority).toBe("INTERFACE_RECORD_AUTHORITY");
    expect(left.engineeringApprover).toBeNull();
    expect(left.certificationAuthority).toBeNull();
    expect(left.provenance.referenceId).toBe("ref-1");
    expect(left.provenance.sourceRevision).toBe("rev-1");
    expect(left.provenance.sourceObjectId).toBe("source-object-1");
    expect(left.provenance.structuralTargetId).toBe("member-1");
    expect(left.provenance.actorId).toBe("recorder-1");
    expect(left.provenance.aiGenerated).toBe(false);
    expect(left.mappingFingerprint).toBe(right.mappingFingerprint);
    expect(left.mappingFingerprint).toBe(fingerprintCanonical({
      mappingId: "map-1",
      referenceId: "ref-1",
      sourceRevision: "rev-1",
      r1MetadataFingerprint: left.r1MetadataFingerprint,
      sourceObjectId: "source-object-1",
      structuralTargetKind: "MEMBER",
      structuralTargetId: "member-1",
      evidenceId: "map-ev-1",
      evidenceKind: "human_input",
      provenanceRef: "map-prov-1",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
      predecessorMappingId: null,
    }));
    expect(left.engineeringValidated).toBe(false);
    expect(() => recordSourceObjectMapping(ready(), recorder(), mappingInput({ evidenceId: "" }))).toThrow("MISSING_MAPPING_EVIDENCE");
    expect(() => recordSourceObjectMapping(ready(), recorder(), mappingInput({ evidenceKind: "free-form" }))).toThrow("MISSING_MAPPING_EVIDENCE");
    expect(() => recordSourceObjectMapping(ready(), recorder(), mappingInput({ provenanceRef: "" }))).toThrow("MISSING_MAPPING_PROVENANCE");
    expect(D1M_R2_MAPPING_EVIDENCE_PRESERVED).toBe(true);
    expect(D1M_R2_MAPPING_AUTHORITY_PRESERVED).toBe(true);
    expect(D1M_R2_MAPPING_PROVENANCE_PRESERVED).toBe(true);
    expect(D1M_R2_MAPPING_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1M_R2_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1M_R2_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1M_R2_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1M_R2_PARALLEL_DIGITAL_THREAD_CREATED).toBe(false);
    expect(D1M_R2_MAPPING_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R2_MAPPING_FINGERPRINT_VERIFIED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R2_MAPPING_AUTHORIZED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R2_MAPPING_RECORDED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R2_OBJECT_MAPPING_RECORDED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R2_SOURCE_OBJECT_RECORDED_EQUALS_ENGINEERING_VALIDATED).toBe(false);
  });

  it("rejects a conflicting active mapping and preserves history when a successor is explicit", () => {
    const runtime = ready([target(), target({ id: "member-2" })]);
    const original = recordSourceObjectMapping(runtime, recorder(), mappingInput());
    const fingerprint = original.mappingFingerprint;
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({
      mappingId: "map-2",
      structuralTargetId: "member-2",
      evidenceId: "map-ev-2",
      provenanceRef: "map-prov-2",
    }))).toThrow("MAPPING_CONFLICT");
    expect(original.structuralTargetId).toBe("member-1");
    expect(original.mappingFingerprint).toBe(fingerprint);
    const successor = supersedeSourceObjectMapping(runtime, recorder(), mappingInput({
      mappingId: "map-2",
      structuralTargetId: "member-2",
      evidenceId: "map-ev-2",
      provenanceRef: "map-prov-2",
      predecessorMappingId: "map-1",
    }));
    expect(original.recordStatus).toBe("SUPERSEDED");
    expect(original.mappingFingerprint).toBe(fingerprint);
    expect(original.sourceObjectId).toBe("source-object-1");
    expect(successor.recordStatus).toBe("CURRENT");
    expect(successor.structuralTargetId).toBe("member-2");
    expect(successor.predecessorMappingId).toBe("map-1");
    expect(runtime.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(() => repointSourceObjectMapping()).toThrow("SILENT_MAPPING_REPOINTING_REJECTED");
    expect(D1M_R2_MAPPING_DUPLICATE_CONFLICT_GOVERNED).toBe(true);
    expect(D1M_R2_MAPPING_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R2_SILENT_MAPPING_REPOINTING_ALLOWED).toBe(false);
    expect(D1M_R2_MAPPING_SOURCE_OBJECT_AUTO_REPOINTED).toBe(false);
    expect(D1M_R2_MAPPING_STRUCTURAL_TARGET_AUTO_REPOINTED).toBe(false);
  });

  it("allows two source objects to name one target and refuses silent repointing of an existing mapping", () => {
    const runtime = ready();
    const first = recordSourceObjectMapping(runtime, recorder(), mappingInput());
    const second = recordSourceObjectMapping(runtime, recorder(), mappingInput({
      mappingId: "map-2",
      sourceObjectId: "source-object-2",
      evidenceId: "map-ev-2",
      provenanceRef: "map-prov-2",
    }));
    expect(second.structuralTargetId).toBe(first.structuralTargetId);
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({
      evidenceId: "map-ev-3",
    }))).toThrow("MAPPING_ALREADY_RECORDED");
    expect(first.evidenceId).toBe("map-ev-1");
    expect(first.structuralTargetId).toBe("member-1");
    expect(first.sourceObjectId).toBe("source-object-1");
    expect(first.sourceRevision).toBe("rev-1");
  });

  it("does not resolve an ambiguous mapping and keeps human review from becoming engineering validation", () => {
    const runtime = ready();
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ ambiguous: true }))).toThrow("AMBIGUOUS_MAPPING_UNRESOLVED");
    expect(runtime.records).toHaveLength(0);
    const recorded = recordSourceObjectMapping(runtime, recorder(), mappingInput());
    const confirmed = confirmSourceObjectMapping(runtime, reviewer(), recorded.mappingId);
    expect(confirmed.mappingStatus).toBe("CONFIRMED");
    expect(confirmed.humanReviewRecorded).toBe(true);
    expect(confirmed.engineeringValidated).toBe(false);
    expect(confirmed.structuralAdequacyConfirmed).toBe(false);
    expect(confirmed.certified).toBe(false);
    expect(confirmed.mappingFingerprint).toBe(recorded.mappingFingerprint);
    expect(confirmed.structuralTargetId).toBe("member-1");
    expect(D1M_R2_AMBIGUOUS_MAPPING_AUTO_RESOLVED).toBe(false);
    expect(D1M_R2_MAPPING_HUMAN_REVIEW_SUPPORTED).toBe(true);
    expect(D1M_R2_MAPPING_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(D1M_R2_MAPPING_CONFIRMED_EQUALS_STRUCTURAL_ADEQUACY_CONFIRMED).toBe(false);
    expect(D1M_R2_OBJECT_MAPPING_RECORDED_EQUALS_CERTIFIED).toBe(false);
  });

  it("refuses AI, administrator, engineering-approval, and certification authority", () => {
    const runtime = ready();
    expect(() => recordSourceObjectMapping(runtime, recorder({ authority: "AI_ASSISTANT" }), mappingInput())).toThrow("AI_NOT_MAPPING_AUTHORITY");
    expect(() => recordSourceObjectMapping(runtime, recorder({ actorId: "LLM-1" }), mappingInput())).toThrow("AI_NOT_MAPPING_AUTHORITY");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ sourceObjectId: "AI_OBJECT" }))).toThrow("SOURCE_OBJECT_IDENTITY_REQUIRED");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ structuralTargetId: "AI_MEMBER" }))).toThrow("STRUCTURAL_TARGET_INVALID");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ confidence: 0.92 }))).toThrow("CONFIDENCE_SCORE_NOT_AUTHORITATIVE");
    expect(() => recordSourceObjectMapping(runtime, recorder({ authority: "ADMINISTRATOR" }), mappingInput())).toThrow("ADMIN_NOT_MAPPING_AUTHORITY");
    expect(() => recordSourceObjectMapping(runtime, recorder({ authority: "ENGINEERING_APPROVAL_AUTHORITY" }), mappingInput())).toThrow("MAPPING_AUTHORITY_NOT_ENGINEERING_APPROVAL");
    expect(() => recordSourceObjectMapping(runtime, recorder({ authority: "CERTIFICATION_AUTHORITY" }), mappingInput())).toThrow("MAPPING_AUTHORITY_NOT_CERTIFIER");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ engineeringValidated: true }))).toThrow("ENGINEERING_VALIDATION_NOT_IN_R2");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ certified: true }))).toThrow("MAPPING_NOT_CERTIFICATION");
    const recorded = recordSourceObjectMapping(runtime, recorder(), mappingInput());
    expect(() => confirmSourceObjectMapping(runtime, reviewer({ authority: "AI_ASSISTANT" }), recorded.mappingId)).toThrow("AI_NOT_MAPPING_AUTHORITY");
    expect(() => confirmSourceObjectMapping(runtime, reviewer({ authority: "ADMINISTRATOR" }), recorded.mappingId)).toThrow("ADMIN_NOT_MAPPING_AUTHORITY");
    expect(() => confirmSourceObjectMapping(runtime, reviewer({ authority: "ENGINEERING_APPROVAL_AUTHORITY" }), recorded.mappingId)).toThrow("MAPPING_AUTHORITY_NOT_ENGINEERING_APPROVAL");
    expect(() => confirmSourceObjectMapping(runtime, reviewer({ authority: "CERTIFICATION_AUTHORITY" }), recorded.mappingId)).toThrow("MAPPING_AUTHORITY_NOT_CERTIFIER");
    expect(() => confirmSourceObjectMapping(runtime, recorder(), recorded.mappingId)).toThrow("UNAUTHORIZED");
    expect(recorded.mappingStatus).toBe("RECORDED");
    expect(() => matchObjectByAi()).toThrow("AI_OBJECT_MATCHING_NOT_IN_R2");
    expect(D1M_R2_AI_CAN_CREATE_AUTHORITATIVE_OBJECT_MAPPING).toBe(false);
    expect(D1M_R2_AI_CAN_APPROVE_OBJECT_MAPPING).toBe(false);
    expect(D1M_R2_AI_CAN_INVENT_SOURCE_OBJECT_IDENTITY).toBe(false);
    expect(D1M_R2_AI_CAN_INVENT_STRUCTURAL_TARGET_IDENTITY).toBe(false);
    expect(D1M_R2_AI_OBJECT_MATCHING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_AUTHORITATIVE_MAPPING_CONFIDENCE_SCORE_IMPLEMENTED).toBe(false);
    expect(D1M_R2_ADMIN_EQUALS_MAPPING_ENGINEERING_AUTHORITY).toBe(false);
    expect(D1M_R2_MAPPING_AUTHORITY_EQUALS_ENGINEERING_APPROVAL_AUTHORITY).toBe(false);
    expect(D1M_R2_MAPPING_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
  });

  it("rejects cross-scope mappings and spoofed source or target identity", () => {
    const local = createD1mR1Store({
      contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
    }, now);
    const foreign = createD1mR1Store({
      contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }],
    }, now);
    const localRef = recordCadBimSourceRevision(local, recorder(), revisionInput());
    const foreignRef = recordCadBimSourceRevision(foreign, recorder({
      tenantId: "tenant-b",
      workspaceId: "workspace-b",
      projectId: "project-b",
    }), revisionInput({
      referenceId: "ref-b",
      artifactId: "artifact-b",
      contentFingerprint: "fp-content-b",
    }));
    const runtime = createD1mR2Store({
      references: [localRef, foreignRef],
      targets: [
        target(),
        target({ id: "other-workspace-member", workspaceId: "workspace-b" }),
        target({ id: "foreign-member", tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }),
      ],
    }, now);
    expect(() => recordSourceObjectMapping(runtime, recorder({ tenantId: "tenant-b" }), mappingInput())).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordSourceObjectMapping(runtime, recorder({ workspaceId: "workspace-b" }), mappingInput())).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordSourceObjectMapping(runtime, recorder({ projectId: "project-b" }), mappingInput())).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ referenceId: "ref-b" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ structuralTargetId: "other-workspace-member" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ structuralTargetId: "foreign-member" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordSourceObjectMapping(runtime, recorder(), mappingInput({ objectContentVerified: true }))).toThrow("OBJECT_CONTENT_VERIFICATION_NOT_IN_R2");
    expect(runtime.records).toHaveLength(0);
    expect(D1M_R2_SCOPE_ENFORCED).toBe(true);
    expect(D1M_R2_CROSS_WORKSPACE_OBJECT_MAPPING_ALLOWED).toBe(false);
    expect(D1M_R2_CROSS_PROJECT_OBJECT_MAPPING_ALLOWED).toBe(false);
    expect(D1M_R2_SOURCE_OBJECT_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D1M_R2_STRUCTURAL_TARGET_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
  });

  it("does not parse, extract, match, adapt, or author a model", () => {
    expect(() => discoverSourceObjectByParsing()).toThrow("OBJECT_DISCOVERY_NOT_IN_R2");
    expect(() => extractCadBimObjects()).toThrow("OBJECT_EXTRACTION_NOT_IN_R2");
    expect(() => parseCadBimArtifact()).toThrow("PARSE_NOT_IN_R2");
    expect(() => ingestCadBimFile()).toThrow("FILE_INGESTION_NOT_IN_R2");
    expect(() => extractCadBimGeometry()).toThrow("GEOMETRY_NOT_IN_R2");
    expect(() => extractCadBimSemantics()).toThrow("SEMANTIC_NOT_IN_R2");
    expect(() => matchObjectByGeometry()).toThrow("GEOMETRY_MATCHING_NOT_IN_R2");
    expect(() => matchObjectBySemantics()).toThrow("SEMANTIC_MATCHING_NOT_IN_R2");
    expect(() => inferCadBimRelationships()).toThrow("RELATIONSHIP_NOT_IN_R2");
    expect(() => adaptCadBimFormat()).toThrow("FORMAT_ADAPTER_NOT_IN_R2");
    expect(() => connectCadBimVendor()).toThrow("CONNECTOR_NOT_IN_R2");
    expect(() => convertCadBimUnits()).toThrow("UNIT_CONVERSION_NOT_IN_R2");
    expect(() => transformCadBimCoordinates()).toThrow("COORDINATE_TRANSFORMATION_NOT_IN_R2");
    expect(() => inferCadBimAxes()).toThrow("AXIS_INFERENCE_NOT_IN_R2");
    expect(() => interpretCadBimEngineeringProperties()).toThrow("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R2");
    expect(() => correctCadBimModel()).toThrow("MODEL_CORRECTION_NOT_IN_R2");
    expect(() => authorCadModel()).toThrow("CAD_AUTHORING_NOT_IN_R2");
    expect(() => authorBimModel()).toThrow("BIM_AUTHORING_NOT_IN_R2");
    expect(() => recordSourceObjectMapping(ready(), recorder(), mappingInput({ formatSupported: true }))).toThrow("FORMAT_SUPPORT_NOT_CLAIMED");
    expect(D1M_R2_SOURCE_OBJECT_DISCOVERY_BY_FILE_PARSING_IMPLEMENTED).toBe(false);
    expect(D1M_R2_OBJECT_EXTRACTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_PARSE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_GENERIC_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_GEOMETRY_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_SEMANTIC_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_RELATIONSHIP_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_CHANGE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_GEOMETRY_BASED_OBJECT_MATCHING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_SEMANTIC_BASED_OBJECT_MATCHING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_FORMAT_ADAPTER_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_NEW_EXTERNAL_CONNECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_AXIS_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_AUTOMATIC_MODEL_CORRECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_CAD_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_BIM_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_MODEL_EVIDENCE_RUNTIME_READY).toBe(false);
    expect(D1M_R2_FORMAT_ADAPTER_RUNTIME_READY).toBe(false);
    expect(D1M_R2_STRUCTURAL_INTERPRETATION_RUNTIME_READY).toBe(false);
    expect(D1M_R2_CHANGE_GOVERNANCE_RUNTIME_READY).toBe(false);
  });

  it("preserves closed-track boundaries and does not complete the structural pack", () => {
    expect(D1M_R2_D1K_CROSS_DISCIPLINE_GOVERNANCE_REUSED).toBe(true);
    expect(D1M_R2_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED).toBe(false);
    expect(D1M_R2_D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1M_R2_D1L_TRACK_COMPLETE).toBe(true);
    expect(D1M_R2_D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1M_R2_OBJECT_MAPPING_EQUALS_D1L_CERTIFICATION_ELIGIBLE).toBe(false);
    expect(D1M_R2_D1N_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1M_R2_D1N_ABSORBED).toBe(false);
    expect(D1M_R2_D1N_RUNTIME_STARTED).toBe(false);
    expect(D1M_R2_D1N_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_D9_ABSORBED).toBe(false);
    expect(D1M_R2_D9_RUNTIME_STARTED).toBe(false);
    expect(D1M_R2_D9_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1M_R2_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1M_R2_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1M_R2_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1M_R2_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1M_R2_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1M_R2_POST_D1J_DEBT_PRESERVED).toContain("NOT_AVAILABLE");
    expect(D1M_R2_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1M_R2_UNAUTHORIZED_PRODUCT_CLAIM).toBe(false);
    expect(D1M_R3_CANONICAL_PHASE).toBe("EOS-D1M-R3-GEOMETRY-SEMANTIC-EVIDENCE");
    expect(D1M_R3_PHASE_TYPE).toBe("CAD_OR_BIM_GEOMETRY_SEMANTIC_EVIDENCE");
    expect(D1M_R3_CANONICAL_SCOPE).toContain("Do not parse a file");
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "cad-bim-object-mapping.ts"), "utf8");
    expect(source.includes('from "@rtb/engineering-review"')).toBe(false);
    expect(source.includes("fetch(")).toBe(false);
    expect(scanAnalysisFormulaBypass("cad-bim-object-mapping.ts", source)).toEqual([]);
  });
});
