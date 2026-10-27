import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D1F_COORDINATE_SYSTEMS, D1F_MEMBER_END_RELEASE_AXES, D1F_SIGN_CONVENTION_FIELDS, D1K_CONVENTION_STATES, D1M_0_COORDINATE_IDENTITIES } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { createD1mR2Store, recordSourceObjectMapping, type D1mR2Input } from "./cad-bim-object-mapping";
import { createD1mR3Store, recordGeometryEvidence, type D1mR3Actor, type D1mR3GeometryInput, type D1mR3Record } from "./cad-bim-model-evidence";
import {
  D1M_R4_ADMIN_EQUALS_ENGINEERING_AUTHORITY,
  D1M_R4_AI_AXIS_INFERENCE_RUNTIME_COUNT,
  D1M_R4_AI_CAN_INVENT_AXIS,
  D1M_R4_AI_CAN_INVENT_COORDINATE,
  D1M_R4_AI_CAN_INVENT_SIGN,
  D1M_R4_AI_CAN_INVENT_UNIT,
  D1M_R4_AI_CAN_MARK_ENGINEERING_VALIDATED,
  D1M_R4_AI_CAN_RESOLVE_CONFLICT,
  D1M_R4_AI_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R4_AI_UNIT_CONVERSION_RUNTIME_COUNT,
  D1M_R4_ARCHITECTURE_READY,
  D1M_R4_ARTIFACT_RUNTIME_COUNT,
  D1M_R4_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY,
  D1M_R4_AUTHORITY_EQUALS_ENGINEERING_APPROVAL,
  D1M_R4_AUTHORITY_PRESERVED,
  D1M_R4_AXIS_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED,
  D1M_R4_AXIS_COMPATIBILITY_EQUALS_TRANSFORMATION,
  D1M_R4_AXIS_HISTORY_PRESERVED,
  D1M_R4_AXIS_INFERENCE_RUNTIME_COUNT,
  D1M_R4_AXIS_REFERENCE_AUTO_UPGRADED,
  D1M_R4_AXIS_SIGN_COMPATIBILITY_IMPLEMENTED,
  D1M_R4_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT,
  D1M_R4_AXIS_SIGN_REFERENCE_RUNTIME_COUNT,
  D1M_R4_AXIS_SIGN_REFERENCE_RUNTIME_IMPLEMENTED,
  D1M_R4_AXIS_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R4_BIM_AUTHORING_RUNTIME_COUNT,
  D1M_R4_CAD_AUTHORING_RUNTIME_COUNT,
  D1M_R4_CAN_MUTATE_R3_GEOMETRY,
  D1M_R4_CAN_MUTATE_R3_SEMANTIC,
  D1M_R4_CANONICAL_DIGITAL_THREAD_REUSED,
  D1M_R4_CANONICAL_FINGERPRINT_REUSED,
  D1M_R4_CHANGE_GOVERNANCE_RUNTIME_READY,
  D1M_R4_COMPATIBILITY_CONFIDENCE_SCORE_IMPLEMENTED,
  D1M_R4_COMPATIBILITY_STATES,
  D1M_R4_CONFLICT_AUTO_RESOLVED,
  D1M_R4_CONNECTIVITY_INFERENCE_RUNTIME_COUNT,
  D1M_R4_CONNECTOR_RUNTIME_COUNT,
  D1M_R4_COORDINATE_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED,
  D1M_R4_COORDINATE_COMPATIBILITY_EQUALS_TRANSFORM,
  D1M_R4_COORDINATE_COMPATIBILITY_IMPLEMENTED,
  D1M_R4_COORDINATE_COMPATIBILITY_RUNTIME_COUNT,
  D1M_R4_COORDINATE_HISTORY_PRESERVED,
  D1M_R4_COORDINATE_REFERENCE_AUTO_UPGRADED,
  D1M_R4_COORDINATE_REFERENCE_RUNTIME_COUNT,
  D1M_R4_COORDINATE_REFERENCE_RUNTIME_IMPLEMENTED,
  D1M_R4_COORDINATE_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R4_CROSS_PROJECT_ALLOWED,
  D1M_R4_CROSS_WORKSPACE_ALLOWED,
  D1M_R4_D1G_BLOCKER_PRESERVED,
  D1M_R4_D1K_AXIS_ARCHITECTURE_REUSED,
  D1M_R4_D1K_COMPATIBILITY_REUSED,
  D1M_R4_D1K_COORDINATE_ARCHITECTURE_REUSED,
  D1M_R4_D1K_GOVERNANCE_REUSED,
  D1M_R4_D1K_INTELLIGENCE_READY,
  D1M_R4_D1K_INTERNAL_INTEGRATION_READY,
  D1M_R4_D1K_LIMITATIONS_PRESERVED,
  D1M_R4_D1K_UNIT_ARCHITECTURE_REUSED,
  D1M_R4_D1L_TRACK_COMPLETE,
  D1M_R4_D1L_TRACK_STATUS,
  D1M_R4_D1N_ABSORBED,
  D1M_R4_D1N_CURRENT_STATUS,
  D1M_R4_D1N_RUNTIME_COUNT,
  D1M_R4_D1N_RUNTIME_STARTED,
  D1M_R4_D2_D8_RUNTIME_COUNT,
  D1M_R4_D2_D8_RUNTIME_STARTED,
  D1M_R4_D9_ABSORBED,
  D1M_R4_D9_RUNTIME_COUNT,
  D1M_R4_D9_RUNTIME_STARTED,
  D1M_R4_DATABASE_SCHEMA_CHANGED,
  D1M_R4_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT,
  D1M_R4_EVIDENCE_AUTO_UPGRADED,
  D1M_R4_EXACT_EVIDENCE_BINDING_REQUIRED,
  D1M_R4_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R4_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED,
  D1M_R4_FORMAT_ADAPTER_RUNTIME_COUNT,
  D1M_R4_FORMAT_ADAPTER_RUNTIME_READY,
  D1M_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
  D1M_R4_GENERIC_FILE_INGESTION_RUNTIME_COUNT,
  D1M_R4_GEOMETRY_RUNTIME_COUNT,
  D1M_R4_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT,
  D1M_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT,
  D1M_R4_GOVERNED_AXES,
  D1M_R4_GOVERNED_COORDINATE_SYSTEMS,
  D1M_R4_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION,
  D1M_R4_HUMAN_REVIEW_SUPPORTED,
  D1M_R4_INDETERMINATE_AUTO_ACCEPTED,
  D1M_R4_LOAD_PATH_INFERENCE_RUNTIME_COUNT,
  D1M_R4_MAPPING_RUNTIME_COUNT,
  D1M_R4_MATURITY_STATE,
  D1M_R4_MISSING_AXIS_AUTO_INFERRED,
  D1M_R4_MISSING_COORDINATE_AUTO_INFERRED,
  D1M_R4_MISSING_SIGN_AUTO_INFERRED,
  D1M_R4_MISSING_UNIT_AUTO_INFERRED,
  D1M_R4_MODEL_CORRECTION_RUNTIME_COUNT,
  D1M_R4_MODEL_EVIDENCE_RUNTIME_READY,
  D1M_R4_MUTATES_R3_SOURCE_VALUES,
  D1M_R4_NEW_DEPENDENCY_ADDED,
  D1M_R4_OBJECT_EXTRACTION_RUNTIME_COUNT,
  D1M_R4_PARALLEL_AXIS_SYSTEM_CREATED,
  D1M_R4_PARALLEL_COMPATIBILITY_ENGINE_CREATED,
  D1M_R4_PARALLEL_COORDINATE_SYSTEM_CREATED,
  D1M_R4_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED,
  D1M_R4_PARALLEL_DIGITAL_THREAD_CREATED,
  D1M_R4_PARALLEL_UNIT_SYSTEM_CREATED,
  D1M_R4_PARSE_RUNTIME_COUNT,
  D1M_R4_PHASE,
  D1M_R4_POST_D1J_DEBT_PRESERVED,
  D1M_R4_PROVENANCE_PRESERVED,
  D1M_R4_R1_REUSED,
  D1M_R4_R2_REUSED,
  D1M_R4_R3_EVIDENCE_REQUIRED,
  D1M_R4_R3_REUSED,
  D1M_R4_REFERENCE_COMPATIBLE_EQUALS_ENGINEERING_VALIDATED,
  D1M_R4_REFERENCE_COMPATIBLE_EQUALS_STRUCTURAL_ADEQUACY,
  D1M_R4_REFERENCE_EQUALS_D1L_CERTIFICATION_ELIGIBLE,
  D1M_R4_REFERENCE_FINGERPRINT_IMPLEMENTED,
  D1M_R4_REFERENCE_HISTORY_PRESERVED,
  D1M_R4_RELATIONSHIP_RUNTIME_COUNT,
  D1M_R4_RUNTIME_COUNT,
  D1M_R4_RUNTIME_STARTED,
  D1M_R4_SCOPE,
  D1M_R4_SCOPE_ENFORCED,
  D1M_R4_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D1M_R4_SEMANTIC_RUNTIME_COUNT,
  D1M_R4_SIGN_CONVENTIONS,
  D1M_R4_SILENT_AXIS_NORMALIZATION_ALLOWED,
  D1M_R4_SILENT_COORDINATE_NORMALIZATION_ALLOWED,
  D1M_R4_SILENT_MUTATION_ALLOWED,
  D1M_R4_SILENT_UNIT_NORMALIZATION_ALLOWED,
  D1M_R4_SOURCE_AXIS_EQUALS_ENGINEERING_AXIS,
  D1M_R4_SOURCE_COORDINATE_IDENTITIES,
  D1M_R4_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT,
  D1M_R4_SOURCE_REFERENCE_RUNTIME_COUNT,
  D1M_R4_SOURCE_REFERENCE_RUNTIME_READY,
  D1M_R4_SPOOFING_PROTECTION_IMPLEMENTED,
  D1M_R4_STATUS,
  D1M_R4_STRUCTURAL_INTERPRETATION_RUNTIME_READY,
  D1M_R4_STRUCTURAL_PACK_COMPLETE,
  D1M_R4_UNAUTHORIZED_PRODUCT_CLAIM,
  D1M_R4_UNIT_COMPATIBILITY_EQUALS_CONVERSION,
  D1M_R4_UNIT_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED,
  D1M_R4_UNIT_COMPATIBILITY_IMPLEMENTED,
  D1M_R4_UNIT_COMPATIBILITY_RUNTIME_COUNT,
  D1M_R4_UNIT_CONVERSION_RUNTIME_COUNT,
  D1M_R4_UNIT_HISTORY_PRESERVED,
  D1M_R4_UNIT_REFERENCE_AUTO_UPGRADED,
  D1M_R4_UNIT_REFERENCE_RUNTIME_COUNT,
  D1M_R4_UNIT_REFERENCE_RUNTIME_IMPLEMENTED,
  D1M_R4_UNKNOWN_COORDINATE_DEFAULTS_COMPATIBLE,
  D1M_R4_UNKNOWN_UNIT_AUTO_MAPPED,
  D1M_R4_UNKNOWN_UNIT_DEFAULTS_COMPATIBLE,
  D1M_R5_CANONICAL_PHASE,
  D1M_R5_CANONICAL_SCOPE,
  D1M_R5_PHASE_TYPE,
  adaptCadBimFormat,
  authorBimModel,
  authorCadModel,
  compareReferenceContexts,
  confirmReferenceContext,
  connectCadBimVendor,
  convertReferenceUnits,
  correctCadBimModel,
  createD1mR4Store,
  extractCadBimObjects,
  inferCadBimRelationships,
  inferLoadPath,
  inferReferenceAxis,
  inferStructuralConnectivity,
  ingestCadBimFile,
  interpretCadBimEngineeringProperties,
  mutateReferenceContext,
  parseCadBimArtifact,
  recordReferenceContext,
  resolveReferenceByAi,
  supersedeReferenceContext,
  transformReferenceAxis,
  transformReferenceCoordinates,
  transformReferenceGeometry,
  upgradeReferenceContext,
  type D1mR4Actor,
  type D1mR4Input,
} from "./cad-bim-reference-context";
import { D1M_R4_CANONICAL_PHASE, D1M_R4_CANONICAL_SCOPE } from "./cad-bim-model-evidence";
import { createD1mR1Store, recordCadBimSourceRevision, type D1mR1Input } from "./cad-bim-source-revision";
import { scanAnalysisFormulaBypass } from "./formula-scan";

const now = () => "2026-10-22T00:00:00.000Z";

function actor(overrides: Partial<D1mR4Actor> = {}): D1mR4Actor {
  return { actorId: "recorder-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", authority: "INTERFACE_RECORD_AUTHORITY", ...overrides };
}

function reviewer(): D1mR4Actor {
  return { ...actor(), actorId: "reviewer-1", authority: "REVIEWER_AUTHORITY" };
}

function revision(): D1mR1Input {
  return {
    referenceId: "ref-1", artifactId: "artifact-1", displayName: "Level 2 model", sourceClass: "EXTERNAL_GOVERNED_ENGINEERING_SOURCE",
    sourceSystemId: "source-sys-1", sourceRevision: "rev-1", sourceLocator: "source-key:artifact-1", declaredFormat: "IFC",
    sourceWorkflowState: "approved", provenanceRef: "prov-1", evidenceId: "ev-1", contentFingerprint: "fp-content-1",
    fingerprintProvenanceRef: "fp-prov-1", fingerprintEvidenceId: "fp-ev-1", structuralSystemId: "system-1",
  };
}

function mapping(): D1mR2Input {
  return {
    mappingId: "map-1", referenceId: "ref-1", expectedSourceRevision: "rev-1", sourceObjectId: "source-object-1",
    structuralTargetId: "member-1", structuralTargetKind: "MEMBER", evidenceId: "map-ev-1", evidenceKind: "human_input", provenanceRef: "map-prov-1",
  };
}

function geometry(overrides: Partial<D1mR3GeometryInput>): D1mR3GeometryInput {
  return {
    evidenceId: "geo-m", mappingId: "map-1", geometryType: "POINT", components: [1000, 0, 0], declaredUnit: "m",
    coordinateIdentity: "LOCAL", evidenceKind: "human_input", evidenceRef: "geo-ev", provenanceRef: "geo-prov",
    expectedSourceRevision: "rev-1", ...overrides,
  };
}

function context(overrides: Partial<D1mR4Input> = {}): D1mR4Input {
  return {
    contextId: "ctx-m", evidenceId: "geo-m", quantity: "length", governedCoordinateSystem: "GLOBAL", governedAxis: "UX",
    signConvention: "FORCE_SIGN", evidenceRef: "ref-ev-1", provenanceRef: "ref-prov-1", ...overrides,
  };
}

function harness() {
  const source = createD1mR1Store({
    contexts: [{ id: "system-1", kind: "STRUCTURAL_SYSTEM", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
  }, now);
  recordCadBimSourceRevision(source, actor() as D1mR3Actor, revision());
  const mapped = createD1mR2Store({
    references: source.records,
    targets: [{ id: "member-1", kind: "MEMBER", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a" }],
  }, now);
  recordSourceObjectMapping(mapped, actor(), mapping());
  const evidenceStore = createD1mR3Store({ references: source.records, mappings: mapped.records }, now);
  const specs: Partial<D1mR3GeometryInput>[] = [
    { evidenceId: "geo-m", geometryType: "POINT", components: [1000, 0, 0], declaredUnit: "m", coordinateIdentity: "LOCAL" },
    { evidenceId: "geo-m2", geometryType: "LINE", components: [1, 0, 0, 2, 0, 0], declaredUnit: "m", coordinateIdentity: "LOCAL" },
    { evidenceId: "geo-n", geometryType: "CURVE", components: [10], declaredUnit: "N", coordinateIdentity: "LOCAL" },
    { evidenceId: "geo-kn", geometryType: "SURFACE", components: [10], declaredUnit: "kN", coordinateIdentity: "LOCAL" },
    { evidenceId: "geo-mm", geometryType: "SOLID", components: [1000], declaredUnit: "mm", coordinateIdentity: "LOCAL" },
    { evidenceId: "geo-none", geometryType: "MEMBER_EXTENT", components: [4], declaredUnit: null, coordinateIdentity: null },
    { evidenceId: "geo-project", geometryType: "SECTION_GEOMETRY", components: [2], declaredUnit: "m", coordinateIdentity: "PROJECT" },
    { evidenceId: "geo-axis", geometryType: "ORIENTATION", components: [0, 0, 1], declaredUnit: "m", coordinateIdentity: "LOCAL", declaredAxis: "source-x" },
    { evidenceId: "geo-label", geometryType: "LEVEL_OR_GRID", components: [1], declaredUnit: "millimetres", coordinateIdentity: "LOCAL" },
  ];
  const recorded = specs.map((spec) => recordGeometryEvidence(evidenceStore, actor() as D1mR3Actor, geometry(spec)));
  return { evidenceStore, recorded, runtime: createD1mR4Store(evidenceStore.records, now) };
}

function byId(rows: readonly D1mR3Record[], id: string): D1mR3Record {
  const row = rows.find((item) => item.evidenceId === id);
  if (!row) throw new Error("missing evidence");
  return row;
}

describe("EOS-D1M-R4 unit coordinate axis reference", () => {
  it("binds exact unit, coordinate, and axis references to unchanged R3 evidence", () => {
    const { runtime, recorded } = harness();
    const source = byId(recorded, "geo-m");
    const components = source.components?.slice();
    const bound = recordReferenceContext(runtime, actor(), context({ expectedEvidenceFingerprint: source.evidenceFingerprint, expectedMappingFingerprint: source.mappingFingerprint, expectedSourceRevision: "rev-1" }));
    const repeated = recordReferenceContext(runtime, actor(), context({ expectedEvidenceFingerprint: source.evidenceFingerprint }));
    expect(bound).toBe(repeated);
    expect(bound.referenceId).toBe("ref-1");
    expect(bound.sourceRevision).toBe("rev-1");
    expect(bound.mappingId).toBe("map-1");
    expect(bound.mappingFingerprint).toBe(source.mappingFingerprint);
    expect(bound.evidenceFingerprint).toBe(source.evidenceFingerprint);
    expect(bound.r1MetadataFingerprint).toBe(source.r1MetadataFingerprint);
    expect(bound.canonicalUnit).toBe("m");
    expect(bound.unitFamily).toBe("length");
    expect(bound.unitResolution).toBe("RESOLVED");
    expect(bound.sourceCoordinateIdentity).toBe("LOCAL");
    expect(bound.governedCoordinateSystem).toBe("GLOBAL");
    expect(bound.governedAxis).toBe("UX");
    expect(bound.signConvention).toBe("FORCE_SIGN");
    expect(bound.sourceAxisEqualsValidatedEngineeringAxis).toBe(false);
    expect(bound.conversionPerformed).toBe(false);
    expect(bound.transformationPerformed).toBe(false);
    expect(bound.engineeringValidated).toBe(false);
    expect(source.components).toEqual(components);
    expect(D1M_R4_PHASE).toBe(D1M_R4_CANONICAL_PHASE);
    expect(D1M_R4_SCOPE).toBe(D1M_R4_CANONICAL_SCOPE);
    expect(D1M_R4_STATUS).toBe("REFERENCE_CONTEXT_IMPLEMENTED");
    expect(D1M_R4_MATURITY_STATE).toBe("STRUCTURAL_CAD_OR_BIM_UNIT_COORDINATE_AXIS_REFERENCE_IMPLEMENTED");
    expect(D1M_R4_ARCHITECTURE_READY).toBe(true);
    expect(D1M_R4_SOURCE_REFERENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R4_MODEL_EVIDENCE_RUNTIME_READY).toBe(true);
    expect(D1M_R4_FORMAT_ADAPTER_RUNTIME_READY).toBe(false);
    expect(D1M_R4_STRUCTURAL_INTERPRETATION_RUNTIME_READY).toBe(false);
    expect(D1M_R4_CHANGE_GOVERNANCE_RUNTIME_READY).toBe(false);
    expect(D1M_R4_R3_EVIDENCE_REQUIRED).toBe(true);
    expect(D1M_R4_EXACT_EVIDENCE_BINDING_REQUIRED).toBe(true);
    expect(D1M_R4_CAN_MUTATE_R3_GEOMETRY).toBe(false);
    expect(D1M_R4_CAN_MUTATE_R3_SEMANTIC).toBe(false);
    expect(D1M_R4_MUTATES_R3_SOURCE_VALUES).toBe(false);
    expect(D1M_R4_R1_REUSED).toBe(true);
    expect(D1M_R4_R2_REUSED).toBe(true);
    expect(D1M_R4_R3_REUSED).toBe(true);
    expect(D1M_R4_SOURCE_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_ARTIFACT_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_MAPPING_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_GEOMETRY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_SEMANTIC_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_RUNTIME_STARTED).toBe(true);
    expect(D1M_R4_RUNTIME_COUNT).toBe(4);
    expect(D1M_R4_SOURCE_COORDINATE_IDENTITIES).toBe(D1M_0_COORDINATE_IDENTITIES);
    expect(D1M_R4_GOVERNED_COORDINATE_SYSTEMS).toBe(D1F_COORDINATE_SYSTEMS);
    expect(D1M_R4_GOVERNED_AXES).toBe(D1F_MEMBER_END_RELEASE_AXES);
    expect(D1M_R4_SIGN_CONVENTIONS).toBe(D1F_SIGN_CONVENTION_FIELDS);
    expect(D1M_R4_D1K_UNIT_ARCHITECTURE_REUSED).toBe(true);
    expect(D1M_R4_D1K_COORDINATE_ARCHITECTURE_REUSED).toBe(true);
    expect(D1M_R4_D1K_AXIS_ARCHITECTURE_REUSED).toBe(true);
    expect(D1M_R4_PARALLEL_UNIT_SYSTEM_CREATED).toBe(false);
    expect(D1M_R4_PARALLEL_COORDINATE_SYSTEM_CREATED).toBe(false);
    expect(D1M_R4_PARALLEL_AXIS_SYSTEM_CREATED).toBe(false);
    expect(() => recordReferenceContext(runtime, actor(), context({ evidenceId: "missing" }))).toThrow("R3_EVIDENCE_REQUIRED");
    expect(() => recordReferenceContext(runtime, actor(), context({ expectedSourceRevision: "latest" }))).toThrow("FLOATING_REFERENCE_REJECTED");
    expect(() => recordReferenceContext(runtime, actor(), context({ expectedEvidenceFingerprint: "forged" }))).toThrow("FINGERPRINT_MISMATCH");
    expect(() => recordReferenceContext(runtime, actor(), context({ expectedMappingFingerprint: "forged" }))).toThrow("MAPPING_SUBSTITUTION_REJECTED");
    expect(() => recordReferenceContext(runtime, actor(), context({ createEvidence: true }))).toThrow("EVIDENCE_CREATION_NOT_IN_R4");
  });

  it("resolves canonical units without converting and keeps unknown units unresolved", () => {
    const { runtime, recorded } = harness();
    const metres = recordReferenceContext(runtime, actor(), context());
    const metresAgain = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-m2", evidenceId: "geo-m2" }));
    const compared = compareReferenceContexts(runtime, actor(), metres.contextId, metresAgain.contextId);
    expect(compared.diagnostics.find((row) => row.dimension === "UNITS")?.conclusion).toBe("MATCHING");
    expect(compared.aggregateConclusion).toBe("MATCHING");
    expect(compared.conversionPerformed).toBe(false);
    expect(compared.engineeringValidated).toBe(false);
    expect(compared.structuralAdequacyConfirmed).toBe(false);
    expect(byId(recorded, "geo-m").components).toEqual([1000, 0, 0]);
    const newton = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-n", evidenceId: "geo-n", quantity: "force" }));
    const kilonewton = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-kn", evidenceId: "geo-kn", quantity: "force" }));
    const dimensional = compareReferenceContexts(runtime, actor(), newton.contextId, kilonewton.contextId);
    expect(dimensional.diagnostics.find((row) => row.dimension === "UNITS")).toMatchObject({
      conclusion: "UNRESOLVED", reasonCode: "DIMENSIONALLY_COMPATIBLE_CONVERSION_REQUIRED", conversionRequired: false,
    });
    expect(dimensional.aggregateConclusion).toBe("UNRESOLVED");
    expect(byId(recorded, "geo-n").components).toEqual([10]);
    expect(byId(recorded, "geo-kn").components).toEqual([10]);
    const incompatible = compareReferenceContexts(runtime, actor(), metres.contextId, kilonewton.contextId);
    expect(incompatible.diagnostics.find((row) => row.dimension === "UNITS")?.conclusion).toBe("INCOMPATIBLE");
    expect(incompatible.aggregateConclusion).toBe("INCOMPATIBLE");
    const millimetre = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-mm", evidenceId: "geo-mm", quantity: "length" }));
    expect(millimetre.canonicalUnit).toBeNull();
    expect(millimetre.unitResolution).toBe("UNRESOLVED");
    expect(millimetre.sourceDeclaredUnit).toBe("mm");
    const unknown = compareReferenceContexts(runtime, actor(), metres.contextId, millimetre.contextId);
    expect(unknown.diagnostics.find((row) => row.dimension === "UNITS")?.conclusion).toBe("UNRESOLVED");
    expect(unknown.aggregateConclusion).not.toBe("MATCHING");
    const label = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-label", evidenceId: "geo-label", quantity: "length" }));
    expect(label.sourceDeclaredUnit).toBe("millimetres");
    expect(label.canonicalUnit).toBeNull();
    const missing = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-none", evidenceId: "geo-none", quantity: "length", governedCoordinateSystem: null, governedAxis: null, signConvention: null }));
    expect(missing.unitResolution).toBe("MISSING");
    expect(missing.canonicalUnit).toBeNull();
    const missingComparison = compareReferenceContexts(runtime, actor(), metres.contextId, missing.contextId);
    expect(missingComparison.diagnostics.find((row) => row.dimension === "UNITS")?.conclusion).toBe("MISSING");
    expect(missingComparison.aggregateConclusion).not.toBe("MATCHING");
    expect(() => recordReferenceContext(runtime, actor(), context({ canonicalUnit: "mm" }))).toThrow("SILENT_UNIT_NORMALIZATION_REJECTED");
    expect(() => recordReferenceContext(runtime, actor(), context({ normalizeUnit: true }))).toThrow("SILENT_UNIT_NORMALIZATION_REJECTED");
    expect(() => convertReferenceUnits()).toThrow("UNIT_CONVERSION_NOT_IN_R4");
    expect(D1M_R4_UNIT_REFERENCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R4_UNIT_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_UNIT_COMPATIBILITY_IMPLEMENTED).toBe(true);
    expect(D1M_R4_UNIT_COMPATIBILITY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_UNKNOWN_UNIT_AUTO_MAPPED).toBe(false);
    expect(D1M_R4_MISSING_UNIT_AUTO_INFERRED).toBe(false);
    expect(D1M_R4_UNKNOWN_UNIT_DEFAULTS_COMPATIBLE).toBe(false);
    expect(D1M_R4_UNIT_COMPATIBILITY_EQUALS_CONVERSION).toBe(false);
    expect(D1M_R4_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_UNIT_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R4_INDETERMINATE_AUTO_ACCEPTED).toBe(false);
    expect(D1M_R4_SILENT_UNIT_NORMALIZATION_ALLOWED).toBe(false);
  });

  it("compares coordinate and axis references without transforming them", () => {
    const { runtime, recorded } = harness();
    const local = recordReferenceContext(runtime, actor(), context());
    const localAgain = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-m2", evidenceId: "geo-m2" }));
    const sameFrame = compareReferenceContexts(runtime, actor(), local.contextId, localAgain.contextId);
    expect(sameFrame.diagnostics.filter((row) => row.dimension === "COORDINATES").every((row) => row.conclusion === "MATCHING")).toBe(true);
    expect(sameFrame.diagnostics.find((row) => row.dimension === "AXIS")?.conclusion).toBe("MATCHING");
    expect(sameFrame.diagnostics.find((row) => row.dimension === "SIGN")?.conclusion).toBe("MATCHING");
    expect(sameFrame.transformationPerformed).toBe(false);
    const project = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-project", evidenceId: "geo-project" }));
    const coordinateConflict = compareReferenceContexts(runtime, actor(), local.contextId, project.contextId);
    expect(coordinateConflict.diagnostics.find((row) => row.dimension === "COORDINATES" && row.sourceIdentity === "LOCAL")?.conclusion).toBe("INCOMPATIBLE");
    expect(coordinateConflict.aggregateConclusion).toBe("INCOMPATIBLE");
    const noFrame = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-no-frame", evidenceId: "geo-none", quantity: "length", governedCoordinateSystem: null }));
    expect(compareReferenceContexts(runtime, actor(), local.contextId, noFrame.contextId).diagnostics.some((row) => row.dimension === "COORDINATES" && row.conclusion === "MISSING")).toBe(true);
    const memberLocal = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-member", evidenceId: "geo-axis", governedCoordinateSystem: "MEMBER_LOCAL", governedAxis: "UY" }));
    const frameConflict = compareReferenceContexts(runtime, actor(), local.contextId, memberLocal.contextId);
    expect(frameConflict.diagnostics.find((row) => row.sourceIdentity === "GLOBAL")?.conclusion).toBe("INCOMPATIBLE");
    expect(frameConflict.diagnostics.find((row) => row.dimension === "AXIS")?.conclusion).toBe("INCOMPATIBLE");
    expect(frameConflict.transformationPerformed).toBe(false);
    expect(memberLocal.sourceDeclaredAxis).toBe("source-x");
    expect(memberLocal.governedAxis).toBe("UY");
    expect(memberLocal.sourceAxisEqualsValidatedEngineeringAxis).toBe(false);
    expect(byId(recorded, "geo-axis").declaredAxis).toBe("source-x");
    expect(byId(recorded, "geo-axis").components).toEqual([0, 0, 1]);
    const noAxis = recordReferenceContext(runtime, actor(), context({ contextId: "ctx-no-axis", evidenceId: "geo-n", quantity: "force", governedAxis: null, signConvention: null }));
    expect(noAxis.axisResolution).toBe("MISSING");
    expect(noAxis.signResolution).toBe("MISSING");
    const absent = compareReferenceContexts(runtime, actor(), local.contextId, noAxis.contextId);
    expect(absent.diagnostics.find((row) => row.dimension === "AXIS")?.conclusion).toBe("MISSING");
    expect(absent.diagnostics.find((row) => row.dimension === "SIGN")?.conclusion).toBe("MISSING");
    expect(() => recordReferenceContext(runtime, actor(), context({ governedCoordinateSystem: "project north" }))).toThrow("COORDINATE_UNSUPPORTED");
    expect(() => recordReferenceContext(runtime, actor(), context({ governedAxis: "source-x" }))).toThrow("AXIS_UNSUPPORTED");
    expect(() => recordReferenceContext(runtime, actor(), context({ signConvention: "tension positive" }))).toThrow("SIGN_CONVENTION_UNSUPPORTED");
    expect(() => recordReferenceContext(runtime, actor(), context({ inferCoordinate: true }))).toThrow("COORDINATE_INFERENCE_NOT_IN_R4");
    expect(() => recordReferenceContext(runtime, actor(), context({ inferAxis: true }))).toThrow("AXIS_INFERENCE_NOT_IN_R4");
    expect(() => recordReferenceContext(runtime, actor(), context({ inferSign: true }))).toThrow("SIGN_INFERENCE_NOT_IN_R4");
    expect(() => transformReferenceCoordinates()).toThrow("COORDINATE_TRANSFORMATION_NOT_IN_R4");
    expect(() => inferReferenceAxis()).toThrow("AXIS_INFERENCE_NOT_IN_R4");
    expect(() => transformReferenceAxis()).toThrow("AXIS_TRANSFORMATION_NOT_IN_R4");
    expect(() => transformReferenceGeometry()).toThrow("GEOMETRY_TRANSFORMATION_NOT_IN_R4");
    expect(D1M_R4_COORDINATE_REFERENCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R4_COORDINATE_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_COORDINATE_COMPATIBILITY_IMPLEMENTED).toBe(true);
    expect(D1M_R4_COORDINATE_COMPATIBILITY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_MISSING_COORDINATE_AUTO_INFERRED).toBe(false);
    expect(D1M_R4_UNKNOWN_COORDINATE_DEFAULTS_COMPATIBLE).toBe(false);
    expect(D1M_R4_COORDINATE_COMPATIBILITY_EQUALS_TRANSFORM).toBe(false);
    expect(D1M_R4_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_COORDINATE_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R4_AXIS_SIGN_REFERENCE_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D1M_R4_AXIS_SIGN_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_AXIS_SIGN_COMPATIBILITY_IMPLEMENTED).toBe(true);
    expect(D1M_R4_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT).toBe(1);
    expect(D1M_R4_MISSING_AXIS_AUTO_INFERRED).toBe(false);
    expect(D1M_R4_MISSING_SIGN_AUTO_INFERRED).toBe(false);
    expect(D1M_R4_SOURCE_AXIS_EQUALS_ENGINEERING_AXIS).toBe(false);
    expect(D1M_R4_AXIS_COMPATIBILITY_EQUALS_TRANSFORMATION).toBe(false);
    expect(D1M_R4_AXIS_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_AXIS_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_AXIS_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R4_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_SILENT_COORDINATE_NORMALIZATION_ALLOWED).toBe(false);
    expect(D1M_R4_SILENT_AXIS_NORMALIZATION_ALLOWED).toBe(false);
  });

  it("fingerprints reference context, preserves history, and does not resolve a conflict", () => {
    const { runtime } = harness();
    const original = recordReferenceContext(runtime, actor(), context());
    const again = recordReferenceContext(createD1mR4Store(runtime.evidence, now), actor(), context());
    expect(original.contextFingerprint).toBe(again.contextFingerprint);
    expect(original.contextFingerprint).toBe(fingerprintCanonical({
      contextId: "ctx-m", evidenceId: "geo-m", evidenceFingerprint: original.evidenceFingerprint, referenceId: "ref-1",
      sourceRevision: "rev-1", r1MetadataFingerprint: original.r1MetadataFingerprint, mappingId: "map-1", mappingFingerprint: original.mappingFingerprint,
      sourceObjectId: "source-object-1", structuralTargetId: "member-1", sourceDeclaredUnit: "m", quantity: "length", canonicalUnit: "m",
      unitFamily: "length", sourceCoordinateIdentity: "LOCAL", governedCoordinateSystem: "GLOBAL", sourceDeclaredAxis: null, governedAxis: "UX",
      signConvention: "FORCE_SIGN", provenanceRef: "ref-prov-1", tenantId: "tenant-a", workspaceId: "workspace-a", projectId: "project-a", predecessorContextId: null,
    }));
    expect(original.engineeringValidated).toBe(false);
    expect(() => recordReferenceContext(runtime, actor(), context({ contextId: "ctx-other", quantity: "force" }))).toThrow("REFERENCE_CONFLICT");
    expect(original.quantity).toBe("length");
    expect(original.contextFingerprint).toBe(again.contextFingerprint);
    const successor = supersedeReferenceContext(runtime, actor(), context({ contextId: "ctx-force", quantity: "force", predecessorContextId: "ctx-m" }));
    expect(successor.evidenceId).toBe("geo-m");
    expect(runtime.history.map((row) => row.action)).toEqual(["CREATED", "SUPERSEDED", "CREATED"]);
    expect(() => mutateReferenceContext()).toThrow("SILENT_REFERENCE_MUTATION_REJECTED");
    expect(() => upgradeReferenceContext()).toThrow("REFERENCE_AUTO_UPGRADE_REJECTED");
    expect(() => recordReferenceContext(runtime, actor(), context({ contextId: "ctx-ambiguous", evidenceId: "geo-m2", ambiguous: true }))).toThrow("AMBIGUOUS_REFERENCE_UNRESOLVED");
    expect(() => recordReferenceContext(runtime, actor(), context({ confidence: 0.8 }))).toThrow("CONFIDENCE_SCORE_NOT_AUTHORITATIVE");
    const confirmed = confirmReferenceContext(runtime, reviewer(), successor.contextId);
    expect(confirmed.contextStatus).toBe("CONFIRMED");
    expect(confirmed.humanReviewRecorded).toBe(true);
    expect(confirmed.engineeringValidated).toBe(false);
    expect(confirmed.structuralAdequacyConfirmed).toBe(false);
    expect(confirmed.contextFingerprint).toBe(successor.contextFingerprint);
    expect(D1M_R4_COMPATIBILITY_STATES).toBe(D1K_CONVENTION_STATES);
    expect(D1M_R4_REFERENCE_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(D1M_R4_CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D1M_R4_SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D1M_R4_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R4_COMPATIBILITY_CONFIDENCE_SCORE_IMPLEMENTED).toBe(false);
    expect(D1M_R4_REFERENCE_COMPATIBLE_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R4_REFERENCE_COMPATIBLE_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(D1M_R4_SILENT_MUTATION_ALLOWED).toBe(false);
    expect(D1M_R4_UNIT_REFERENCE_AUTO_UPGRADED).toBe(false);
    expect(D1M_R4_COORDINATE_REFERENCE_AUTO_UPGRADED).toBe(false);
    expect(D1M_R4_AXIS_REFERENCE_AUTO_UPGRADED).toBe(false);
    expect(D1M_R4_EVIDENCE_AUTO_UPGRADED).toBe(false);
    expect(D1M_R4_UNIT_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R4_COORDINATE_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R4_AXIS_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R4_REFERENCE_HISTORY_PRESERVED).toBe(true);
    expect(D1M_R4_CONFLICT_AUTO_RESOLVED).toBe(false);
    expect(D1M_R4_HUMAN_REVIEW_SUPPORTED).toBe(true);
    expect(D1M_R4_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION).toBe(false);
    expect(D1M_R4_CANONICAL_DIGITAL_THREAD_REUSED).toBe(true);
    expect(D1M_R4_PARALLEL_DIGITAL_THREAD_CREATED).toBe(false);
  });

  it("rejects elevated authority, cross-scope binding, and reference spoofing", () => {
    const { runtime } = harness();
    expect(() => recordReferenceContext(runtime, actor({ authority: "AI_ASSISTANT" }), context())).toThrow("AI_NOT_REFERENCE_AUTHORITY");
    expect(() => recordReferenceContext(runtime, actor({ actorId: "LLM-1" }), context())).toThrow("AI_NOT_REFERENCE_AUTHORITY");
    expect(() => recordReferenceContext(runtime, actor({ authority: "ADMINISTRATOR" }), context())).toThrow("ADMIN_NOT_REFERENCE_AUTHORITY");
    expect(() => recordReferenceContext(runtime, actor({ authority: "ENGINEERING_APPROVAL_AUTHORITY" }), context())).toThrow("REFERENCE_AUTHORITY_NOT_ENGINEERING_APPROVAL");
    expect(() => recordReferenceContext(runtime, actor({ authority: "CERTIFICATION_AUTHORITY" }), context())).toThrow("REFERENCE_AUTHORITY_NOT_CERTIFIER");
    expect(() => recordReferenceContext(runtime, actor(), context({ engineeringValidated: true }))).toThrow("ENGINEERING_VALIDATION_NOT_IN_R4");
    const recorded = recordReferenceContext(runtime, actor(), context());
    expect(() => confirmReferenceContext(runtime, { ...reviewer(), authority: "AI_ASSISTANT" }, recorded.contextId)).toThrow("AI_NOT_REFERENCE_AUTHORITY");
    expect(() => confirmReferenceContext(runtime, actor(), recorded.contextId)).toThrow("UNAUTHORIZED");
    expect(() => resolveReferenceByAi()).toThrow("AI_REFERENCE_RESOLUTION_NOT_IN_R4");
    expect(recorded.evidenceAuthority).toBe("INTERFACE_RECORD_AUTHORITY");
    expect(recorded.engineeringApprover).toBeNull();
    expect(recorded.certificationAuthority).toBeNull();
    expect(recorded.provenanceRef).toBe("ref-prov-1");
    expect(() => recordReferenceContext(runtime, actor({ tenantId: "tenant-b" }), context({ contextId: "ctx-b", evidenceId: "geo-m2" }))).toThrow("CROSS_TENANT_OPERATION");
    expect(() => recordReferenceContext(runtime, actor({ workspaceId: "workspace-b" }), context({ contextId: "ctx-w", evidenceId: "geo-m2" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordReferenceContext(runtime, actor({ projectId: "project-b" }), context({ contextId: "ctx-p", evidenceId: "geo-m2" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(() => recordReferenceContext(runtime, actor(), context({ contextId: "ctx-scope", evidenceId: "geo-m2", workspaceId: "workspace-b" }))).toThrow("CROSS_PROJECT_OPERATION");
    expect(D1M_R4_AUTHORITY_PRESERVED).toBe(true);
    expect(D1M_R4_PROVENANCE_PRESERVED).toBe(true);
    expect(D1M_R4_AUTHORITY_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D1M_R4_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY).toBe(false);
    expect(D1M_R4_ADMIN_EQUALS_ENGINEERING_AUTHORITY).toBe(false);
    expect(D1M_R4_AI_CAN_INVENT_UNIT).toBe(false);
    expect(D1M_R4_AI_CAN_INVENT_COORDINATE).toBe(false);
    expect(D1M_R4_AI_CAN_INVENT_AXIS).toBe(false);
    expect(D1M_R4_AI_CAN_INVENT_SIGN).toBe(false);
    expect(D1M_R4_AI_CAN_RESOLVE_CONFLICT).toBe(false);
    expect(D1M_R4_AI_CAN_MARK_ENGINEERING_VALIDATED).toBe(false);
    expect(D1M_R4_AI_UNIT_CONVERSION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_AI_COORDINATE_TRANSFORMATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_AI_AXIS_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_SCOPE_ENFORCED).toBe(true);
    expect(D1M_R4_CROSS_WORKSPACE_ALLOWED).toBe(false);
    expect(D1M_R4_CROSS_PROJECT_ALLOWED).toBe(false);
    expect(D1M_R4_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
  });

  it("does not parse, relate, or author a model and preserves closed boundaries", () => {
    expect(() => parseCadBimArtifact()).toThrow("PARSE_NOT_IN_R4");
    expect(() => extractCadBimObjects()).toThrow("OBJECT_EXTRACTION_NOT_IN_R4");
    expect(() => ingestCadBimFile()).toThrow("FILE_INGESTION_NOT_IN_R4");
    expect(() => adaptCadBimFormat()).toThrow("FORMAT_ADAPTER_NOT_IN_R4");
    expect(() => connectCadBimVendor()).toThrow("CONNECTOR_NOT_IN_R4");
    expect(() => inferCadBimRelationships()).toThrow("RELATIONSHIP_NOT_IN_R4");
    expect(() => inferStructuralConnectivity()).toThrow("CONNECTIVITY_INFERENCE_NOT_IN_R4");
    expect(() => inferLoadPath()).toThrow("LOAD_PATH_INFERENCE_NOT_IN_R4");
    expect(() => interpretCadBimEngineeringProperties()).toThrow("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R4");
    expect(() => correctCadBimModel()).toThrow("MODEL_CORRECTION_NOT_IN_R4");
    expect(() => authorCadModel()).toThrow("CAD_AUTHORING_NOT_IN_R4");
    expect(() => authorBimModel()).toThrow("BIM_AUTHORING_NOT_IN_R4");
    expect(D1M_R4_PARSE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_OBJECT_EXTRACTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_GENERIC_FILE_INGESTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_FORMAT_ADAPTER_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_CONNECTOR_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_RELATIONSHIP_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_CONNECTIVITY_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_LOAD_PATH_INFERENCE_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_MODEL_CORRECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_CAD_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_BIM_AUTHORING_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_D1K_COMPATIBILITY_REUSED).toBe(true);
    expect(D1M_R4_PARALLEL_COMPATIBILITY_ENGINE_CREATED).toBe(false);
    expect(D1M_R4_D1K_GOVERNANCE_REUSED).toBe(true);
    expect(D1M_R4_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED).toBe(false);
    expect(D1M_R4_D1K_INTERNAL_INTEGRATION_READY).toBe(false);
    expect(D1M_R4_D1K_INTELLIGENCE_READY).toBe(false);
    expect(D1M_R4_D1K_LIMITATIONS_PRESERVED).toBe(true);
    expect(D1M_R4_D1L_TRACK_COMPLETE).toBe(true);
    expect(D1M_R4_D1L_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D1M_R4_REFERENCE_EQUALS_D1L_CERTIFICATION_ELIGIBLE).toBe(false);
    expect(D1M_R4_D1N_CURRENT_STATUS).toBe("NOT_ABSORBED");
    expect(D1M_R4_D1N_ABSORBED).toBe(false);
    expect(D1M_R4_D1N_RUNTIME_STARTED).toBe(false);
    expect(D1M_R4_D1N_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_D9_ABSORBED).toBe(false);
    expect(D1M_R4_D9_RUNTIME_STARTED).toBe(false);
    expect(D1M_R4_D9_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_D2_D8_RUNTIME_STARTED).toBe(false);
    expect(D1M_R4_D2_D8_RUNTIME_COUNT).toBe(0);
    expect(D1M_R4_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1M_R4_DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(D1M_R4_NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D1M_R4_D1G_BLOCKER_PRESERVED).toBe(true);
    expect(D1M_R4_POST_D1J_DEBT_PRESERVED).toContain("NOT_AVAILABLE");
    expect(D1M_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY).toBe(true);
    expect(D1M_R4_UNAUTHORIZED_PRODUCT_CLAIM).toBe(false);
    expect(D1M_R5_CANONICAL_PHASE).toBe("EOS-D1M-R5-MODEL-RELATIONSHIP-EVIDENCE");
    expect(D1M_R5_PHASE_TYPE).toBe("CAD_OR_BIM_MODEL_RELATIONSHIP_EVIDENCE");
    expect(D1M_R5_CANONICAL_SCOPE).toContain("Do not infer relationships");
    const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "cad-bim-reference-context.ts"), "utf8");
    expect(source.includes(["from", '"@rtb/engineering-review"'].join(" "))).toBe(false);
    expect(source.includes("fetch(")).toBe(false);
    expect(source.includes("toLengthM")).toBe(false);
    expect(source.includes("toForceN")).toBe(false);
    expect(source.includes("normalizeWithExistingUnitSystem")).toBe(false);
    expect(scanAnalysisFormulaBypass("cad-bim-reference-context.ts", source)).toEqual([]);
  });
});
