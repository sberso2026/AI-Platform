import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D1K_SOURCE_CLASSES, D1M_ARCHITECTURE_READY, D1M_R1_CANONICAL_PHASE, D1M_SOURCE_REFERENCE_RUNTIME_READY } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1M_R1_ARTIFACT_RUNTIME_COUNT,
  D1M_R1_CANONICAL_FINGERPRINT_REUSED,
  D1M_R1_CHANGE_DETECTION_RUNTIME_COUNT,
  D1M_R1_D1G_BLOCKER_PRESERVED,
  D1M_R1_D1K_LIMITATIONS_PRESERVED,
  D1M_R1_D1L_TRACK_COMPLETE,
  D1M_R1_D1L_TRACK_STATUS,
  D1M_R1_D1N_ABSORBED,
  D1M_R1_D1N_RUNTIME_COUNT,
  D1M_R1_D2_D8_RUNTIME_COUNT,
  D1M_R1_D9_ABSORBED,
  D1M_R1_D9_RUNTIME_COUNT,
  D1M_R1_DATABASE_SCHEMA_CHANGED,
  D1M_R1_FLOATING_CAD_BIM_SOURCE_ALLOWED,
  D1M_R1_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1M_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1M_R1_MATURITY_STATE,
  D1M_R1_NEW_DEPENDENCY_ADDED,
  D1M_R1_OBJECT_MAPPING_RUNTIME_COUNT,
  D1M_R1_OBJECT_RUNTIME_COUNT,
  D1M_R1_PARALLEL_DIGITAL_THREAD_CREATED,
  D1M_R1_PHASE,
  D1M_R1_POST_D1J_DEBT_PRESERVED,
  D1M_R1_RUNTIME_STARTED,
  D1M_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1M_R1_SOURCE_CLASSES,
  D1M_R1_SOURCE_REFERENCE_RUNTIME_COUNT,
  D1M_R1_SOURCE_REFERENCE_RUNTIME_READY,
  D1M_R1_STATUS,
  D1M_R1_STRUCTURAL_PACK_COMPLETE,
  D1M_R2_CANONICAL_PHASE,
  D1M_R2_CANONICAL_SCOPE,
  D1M_R2_PHASE_TYPE,
  authorBimModel,
  authorCadModel,
  connectCadBimVendor,
  convertCadBimUnits,
  correctCadBimModel,
  createD1mR1Store,
  extractCadBimGeometry,
  extractCadBimRelationships,
  extractCadBimSemantics,
  inferCadBimAxes,
  ingestCadBimFile,
  mapCadBimObjectToStructuralTarget,
  markCadBimSourceEngineeringValidated,
  parseCadBimArtifact,
  recordCadBimSourceRevision,
  repointCadBimSourceRevision,
  supersedeCadBimSourceRevision,
  transformCadBimCoordinates,
  upgradeCadBimSourceToLatest,
  type D1mR1Actor,
  type D1mR1Input,
} from "./cad-bim-source-revision";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const now = () => "2026-10-21T00:00:00.000Z";

function actor(overrides: Partial<D1mR1Actor> = {}): D1mR1Actor {
  return {
    actorId: "recorder-1",
    tenantId: "tenant-a",
    workspaceId: "workspace-a",
    projectId: "project-a",
    authority: "INTERFACE_RECORD_AUTHORITY",
    ...overrides,
  };
}

function input(overrides: Partial<D1mR1Input> = {}): D1mR1Input {
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

function store() {
  return createD1mR1Store({
    contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
  }, now);
}

describe("EOS-D1M-R1 CAD or BIM artifact source revision", () => {
  it("records one exact artifact revision and keeps the display name out of identity", () => {
    const recorded = recordCadBimSourceRevision(store(), actor(), input());
    const renamed = recordCadBimSourceRevision(store(), actor(), input({ displayName: "friendly title" }));
    expect(recorded.referenceId).toBe("ref-1");
    expect(recorded.artifactId).toBe("artifact-1");
    expect(recorded.sourceRevision).toBe("rev-1");
    expect(recorded.displayName).not.toBe(recorded.artifactId);
    expect(renamed.metadataFingerprint).toBe(recorded.metadataFingerprint);
    expect(recorded.referenceStatus).toBe("RECORDED");
    expect(recorded.structuralTargetKind).toBe("STRUCTURAL_SYSTEM");
    expect(D1M_R1_STATUS).toBe("SOURCE_REVISION_FOUNDATION_IMPLEMENTED");
    expect(D1M_R1_MATURITY_STATE).toBe("STRUCTURAL_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_IMPLEMENTED");
    expect(D1M_R1_PHASE).toBe(D1M_R1_CANONICAL_PHASE);
    expect(D1M_ARCHITECTURE_READY).toBe(true);
    expect(D1M_SOURCE_REFERENCE_RUNTIME_READY).toBe(false);
    expect(D1M_R1_SOURCE_REFERENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R1_RUNTIME_STARTED).toBe(true);
    expect(D1M_R1_SOURCE_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D1M_R1_ARTIFACT_RUNTIME_COUNT).toBe(1);
  });

  it("rejects a floating revision and a free-form source class", () => {
    for (const sourceRevision of ["latest", "current", "newest", "head", "active model", "current BIM", "current drawing"]) {
      expect(() => recordCadBimSourceRevision(store(), actor(), input({ sourceRevision }))).toThrow("FLOATING_SOURCE_REJECTED");
    }
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ sourceRevision: "" }))).toThrow("SOURCE_REVISION_REQUIRED");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ sourceClass: "REVIT_MODEL" }))).toThrow("SOURCE_CLASS_INVALID");
    expect(D1M_R1_SOURCE_CLASSES).toBe(D1K_SOURCE_CLASSES);
    expect(D1M_R1_FLOATING_CAD_BIM_SOURCE_ALLOWED).toBe(false);
    expect(() => upgradeCadBimSourceToLatest()).toThrow("FLOATING_SOURCE_AUTO_RESOLUTION_REJECTED");
  });

  it("preserves authority and provenance and refuses invented or elevated authority", () => {
    const recorded = recordCadBimSourceRevision(store(), actor(), input());
    expect(recorded.sourceAuthority).toBe("SOURCE_AUTHORITY");
    expect(recorded.provenance.provenanceRef).toBe("prov-1");
    expect(recorded.provenance.evidenceId).toBe("ev-1");
    expect(recorded.provenance.aiGenerated).toBe(false);
    expect(recorded.engineeringApprover).toBeNull();
    expect(recorded.certificationAuthority).toBeNull();
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ provenanceRef: "" }))).toThrow("MISSING_PROVENANCE");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ evidenceId: "" }))).toThrow("MISSING_PROVENANCE");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ sourceAuthority: "ENGINEERING_APPROVAL_AUTHORITY" }))).toThrow("MODEL_AUTHOR_NOT_ENGINEERING_APPROVER");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ sourceAuthority: "CERTIFICATION_AUTHORITY" }))).toThrow("SOURCE_AUTHORITY_NOT_CERTIFIER");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ sourceAuthority: "ADMINISTRATOR" }))).toThrow("ADMIN_NOT_SOURCE_AUTHORITY");
    expect(() => recordCadBimSourceRevision(store(), actor({ authority: "ADMINISTRATOR" }), input())).toThrow("ADMIN_NOT_SOURCE_AUTHORITY");
    expect(() => recordCadBimSourceRevision(store(), actor({ authority: "AI_ASSISTANT" }), input())).toThrow("AI_NOT_SOURCE_AUTHORITY");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ contentFingerprint: "AI_GENERATED" }))).toThrow("AI_FINGERPRINT_REJECTED");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ provenanceRef: "LLM provenance" }))).toThrow("MISSING_PROVENANCE");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ fingerprintProvenanceRef: "" }))).toThrow("MISSING_FINGERPRINT_PROVENANCE");
    expect(() => markCadBimSourceEngineeringValidated()).toThrow("ENGINEERING_VALIDATION_NOT_IN_R1");
  });

  it("enforces tenant, workspace, and project scope", () => {
    const runtime = store();
    const recorded = recordCadBimSourceRevision(runtime, actor(), input());
    expect(recorded.tenantId).toBe("tenant-a");
    expect(recorded.workspaceId).toBe("workspace-a");
    expect(recorded.projectId).toBe("project-a");
    expect(() => recordCadBimSourceRevision(runtime, actor({ tenantId: "tenant-b" }), input())).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordCadBimSourceRevision(runtime, actor({ workspaceId: "workspace-b" }), input())).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordCadBimSourceRevision(runtime, actor({ projectId: "project-b" }), input())).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordCadBimSourceRevision(runtime, actor(), input({ workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
  });

  it("binds a declared content fingerprint with canonical metadata and does not treat it as validation", () => {
    const left = recordCadBimSourceRevision(store(), actor(), input());
    const right = recordCadBimSourceRevision(store(), actor(), input());
    expect(left.contentFingerprint).toBe("fp-content-1");
    expect(left.contentFingerprintOrigin).toBe("DECLARED_SOURCE");
    expect(left.contentFingerprintEosVerified).toBe(false);
    expect(left.metadataFingerprint).toBe(right.metadataFingerprint);
    expect(left.metadataFingerprint).toBe(fingerprintCanonical({
      referenceId: "ref-1",
      artifactId: "artifact-1",
      sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE",
      sourceSystemId: "source-sys-1",
      sourceRevision: "rev-1",
      sourceLocator: "source-key:artifact-1",
      contentFingerprint: "fp-content-1",
      fingerprintProvenanceRef: "fp-prov-1",
      fingerprintEvidenceId: "fp-ev-1",
      provenanceRef: "prov-1",
      evidenceId: "ev-1",
      structuralSystemId: "system-1",
      sourceAuthority: "SOURCE_AUTHORITY",
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      projectId: "project-a",
      predecessorReferenceId: null,
    }));
    const changedContent = recordCadBimSourceRevision(store(), actor(), input({ referenceId: "ref-content", contentFingerprint: "fp-content-2" }));
    const changedRevision = recordCadBimSourceRevision(store(), actor(), input({ referenceId: "ref-revision", sourceRevision: "rev-2" }));
    expect(changedContent.sourceRevision).toBe(left.sourceRevision);
    expect(changedContent.metadataFingerprint).not.toBe(left.metadataFingerprint);
    expect(changedRevision.contentFingerprint).toBe(left.contentFingerprint);
    expect(changedRevision.metadataFingerprint).not.toBe(left.metadataFingerprint);
    expect(left.sourceRevision).not.toBe(left.contentFingerprint);
    expect(left.engineeringValidated).toBe(false);
    expect(left.engineeringEquivalence).toBe(false);
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ eosVerifiedFingerprint: true }))).toThrow("FINGERPRINT_VERIFICATION_NOT_IN_R1");
    expect(D1M_R1_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1M_R1_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
  });

  it("does not treat the reference as a payload, a parsed model, format support, or approval", () => {
    const recorded = recordCadBimSourceRevision(store(), actor(), input({ sourceWorkflowState: "published", declaredFormat: "RVT" }));
    expect(recorded.payloadStored).toBe(false);
    expect(recorded.parsedModel).toBeNull();
    expect(recorded.formatSupported).toBe(false);
    expect(recorded.adapterSupport).toBe("NOT_CLAIMED");
    expect(recorded.declaredFormat).toBe("RVT");
    expect(recorded.sourceSystemLiveConnector).toBe(false);
    expect(recorded.eosEngineeringApproved).toBe(false);
    expect(recorded.certified).toBe(false);
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ payload: Buffer.from("bytes") }))).toThrow("SOURCE_PAYLOAD_NOT_IN_R1");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ liveConnector: true }))).toThrow("CONNECTOR_NOT_IN_R1");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ formatSupported: true }))).toThrow("FORMAT_SUPPORT_NOT_CLAIMED");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ engineeringValidated: true }))).toThrow("ENGINEERING_VALIDATION_NOT_IN_R1");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ eosApproved: true }))).toThrow("SOURCE_APPROVAL_NOT_EOS_APPROVAL");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ certified: true }))).toThrow("SOURCE_PUBLISHED_NOT_CERTIFIED");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ sourceLocator: "../secret.ifc" }))).toThrow("SOURCE_LOCATOR_REJECTED");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ sourceLocator: "file:///models/a.ifc" }))).toThrow("SOURCE_LOCATOR_REJECTED");
  });

  it("keeps the reference immutable and preserves history when a new revision is explicit", () => {
    const runtime = store();
    const original = recordCadBimSourceRevision(runtime, actor(), input());
    const fingerprintBefore = original.metadataFingerprint;
    expect(() => recordCadBimSourceRevision(runtime, actor(), input({ sourceRevision: "rev-2" }))).toThrow("REFERENCE_ALREADY_RECORDED");
    expect(original.sourceRevision).toBe("rev-1");
    expect(original.metadataFingerprint).toBe(fingerprintBefore);
    expect(() => repointCadBimSourceRevision()).toThrow("SILENT_SOURCE_REPOINTING_REJECTED");
    const successor = supersedeCadBimSourceRevision(runtime, actor(), input({
      referenceId: "ref-2",
      sourceRevision: "rev-2",
      contentFingerprint: "fp-content-2",
      predecessorReferenceId: "ref-1",
    }));
    expect(original.recordStatus).toBe("SUPERSEDED");
    expect(original.metadataFingerprint).toBe(fingerprintBefore);
    expect(successor.recordStatus).toBe("CURRENT");
    expect(successor.predecessorReferenceId).toBe("ref-1");
    expect(runtime.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(() => supersedeCadBimSourceRevision(runtime, actor(), input({
      referenceId: "ref-3",
      predecessorReferenceId: "ref-1",
    }))).toThrow("PREDECESSOR_NOT_CURRENT");
  });

  it("refuses parsing, ingestion, mapping, geometry, and every later runtime", () => {
    expect(() => parseCadBimArtifact()).toThrow("PARSE_NOT_IN_R1");
    expect(() => ingestCadBimFile()).toThrow("FILE_INGESTION_NOT_IN_R1");
    expect(() => extractCadBimGeometry()).toThrow("GEOMETRY_NOT_IN_R1");
    expect(() => extractCadBimSemantics()).toThrow("SEMANTIC_NOT_IN_R1");
    expect(() => extractCadBimRelationships()).toThrow("RELATIONSHIP_NOT_IN_R1");
    expect(() => connectCadBimVendor()).toThrow("CONNECTOR_NOT_IN_R1");
    expect(() => convertCadBimUnits()).toThrow("UNIT_CONVERSION_NOT_IN_R1");
    expect(() => transformCadBimCoordinates()).toThrow("COORDINATE_TRANSFORMATION_NOT_IN_R1");
    expect(() => inferCadBimAxes()).toThrow("AXIS_INFERENCE_NOT_IN_R1");
    expect(() => correctCadBimModel()).toThrow("MODEL_CORRECTION_NOT_IN_R1");
    expect(() => authorCadModel()).toThrow("CAD_AUTHORING_NOT_IN_R1");
    expect(() => authorBimModel()).toThrow("BIM_AUTHORING_NOT_IN_R1");
    expect(() => mapCadBimObjectToStructuralTarget()).toThrow("OBJECT_MAPPING_NOT_IN_R1");
    expect(() => recordCadBimSourceRevision(store(), actor(), input({ structuralObjectId: "member-1" }))).toThrow("OBJECT_MAPPING_NOT_IN_R1");
    expect(D1M_R1_OBJECT_RUNTIME_COUNT).toBe(0);
    expect(D1M_R1_OBJECT_MAPPING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R1_CHANGE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R1_PARALLEL_DIGITAL_THREAD_CREATED).toBe(false);
  });

  it("keeps D1L closed and leaves D1N, D9, and the structural pack unfinished", () => {
    expect(D1M_R1_D1L_TRACK_COMPLETE).toBe(true);
    expect(D1M_R1_D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1M_R1_D1N_ABSORBED).toBe(false);
    expect(D1M_R1_D1N_RUNTIME_COUNT).toBe(0);
    expect(D1M_R1_D9_ABSORBED).toBe(false);
    expect(D1M_R1_D9_RUNTIME_COUNT).toBe(0);
    expect(D1M_R1_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1M_R1_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1M_R1_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1M_R1_POST_D1J_DEBT_PRESERVED).toContain("NOT_AVAILABLE");
    expect(D1M_R1_D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1M_R1_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1M_R1_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1M_R1_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1M_R2_CANONICAL_PHASE).toBe("EOS-D1M-R2-SOURCE-OBJECT-STRUCTURAL-TARGET-MAPPING");
    expect(D1M_R2_PHASE_TYPE).toBe("CAD_OR_BIM_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING");
    expect(D1M_R2_CANONICAL_SCOPE).toContain("Do not extract geometry");
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "cad-bim-source-revision.ts"), "utf8");
    expect(source).not.toContain("from \"@rtb/engineering-review\"");
    expect(source).not.toContain("fetch(");
    expect(scanAnalysisFormulaBypass(join(here, "cad-bim-source-revision.ts"), source)).toEqual([]);
  });
});
