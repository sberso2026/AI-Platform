/**
 * EOS-D1M-R4 unit, coordinate, and axis reference context.
 * Binds exact references to R3 evidence. Does not convert, transform, or rewrite that evidence.
 */
import type { D1kR2Diagnostic } from "./interface-compatibility";
import { aggregateCompatibility } from "./interface-compatibility";
import {
  AXIS_SIGN_ARCHITECTURE_REUSED,
  COORDINATE_ARCHITECTURE_REUSED,
  D1F_COORDINATE_SYSTEMS,
  D1F_MEMBER_END_RELEASE_AXES,
  D1F_SIGN_CONVENTION_FIELDS,
  D1K_CONVENTION_STATES,
  D1M_0_COORDINATE_IDENTITIES,
  UNIT_ARCHITECTURE_REUSED,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { existingUnitFamily } from "../structural-demand/units";
import type { D1mR3Record } from "./cad-bim-model-evidence";
import { D1M_R4_CANONICAL_PHASE, D1M_R4_CANONICAL_SCOPE } from "./cad-bim-model-evidence";
import { D1L_R6_TRACK_COMPLETE, D1L_R6_TRACK_STATUS } from "./certification-gate-closeout";
import { D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY, D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY } from "./interface-closeout";
import { POST_D1J_STRUCTURAL_DEBT_LEDGER } from "./post-d1j-roadmap";
import {
  D1_STRUCTURAL_PACK_COMPLETE,
  D1G_CERTIFIED_SOLVER_STATUS,
  D1G_CONFORMANCE_VALIDATED,
  D1G_ENGINEER_VALIDATED,
  D1G_LIVE_VALIDATED,
  GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY,
} from "./roadmap-after-twin-closeout";

export const D1M_R4_PHASE = D1M_R4_CANONICAL_PHASE;
export const D1M_R4_PHASE_TYPE = "CAD_OR_BIM_UNIT_COORDINATE_AXIS_REFERENCE" as const;
export const D1M_R4_STATUS = "REFERENCE_CONTEXT_IMPLEMENTED" as const;
export const D1M_R4_MATURITY_STATE = "STRUCTURAL_CAD_OR_BIM_UNIT_COORDINATE_AXIS_REFERENCE_IMPLEMENTED" as const;
export const D1M_R4_SCOPE = D1M_R4_CANONICAL_SCOPE;
export const D1M_R4_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R4_UNIT_COORDINATE_AXIS_REFERENCE_CLOSEOUT.md" as const;
export const D1M_R4_PARENT_ARCHITECTURE_PATH =
  "docs/architecture/engineering-os/EOS_D1M_0_CAD_OR_BIM_INTELLIGENCE_ARCHITECTURE.md" as const;
export const D1M_R4_R1_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R1_CAD_OR_BIM_ARTIFACT_SOURCE_REVISION_FOUNDATION_CLOSEOUT.md" as const;
export const D1M_R4_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R2_SOURCE_OBJECT_STRUCTURAL_TARGET_MAPPING_CLOSEOUT.md" as const;
export const D1M_R4_R3_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1M_R3_GEOMETRY_SEMANTIC_EVIDENCE_CLOSEOUT.md" as const;
export const D1M_R4_COMPATIBILITY_STATES = D1K_CONVENTION_STATES;
export const D1M_R4_ARCHITECTURE_READY = true as const;
export const D1M_R4_SOURCE_REFERENCE_RUNTIME_READY = true as const;
export const D1M_R4_MODEL_EVIDENCE_RUNTIME_READY = true as const;
export const D1M_R4_FORMAT_ADAPTER_RUNTIME_READY = false as const;
export const D1M_R4_STRUCTURAL_INTERPRETATION_RUNTIME_READY = false as const;
export const D1M_R4_CHANGE_GOVERNANCE_RUNTIME_READY = false as const;
export const D1M_R4_R3_EVIDENCE_REQUIRED = true as const;
export const D1M_R4_EXACT_EVIDENCE_BINDING_REQUIRED = true as const;
export const D1M_R4_CAN_MUTATE_R3_GEOMETRY = false as const;
export const D1M_R4_CAN_MUTATE_R3_SEMANTIC = false as const;
export const D1M_R4_R1_REUSED = true as const;
export const D1M_R4_R2_REUSED = true as const;
export const D1M_R4_R3_REUSED = true as const;
export const D1M_R4_UNIT_REFERENCE_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R4_UNIT_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1M_R4_D1K_UNIT_ARCHITECTURE_REUSED = UNIT_ARCHITECTURE_REUSED;
export const D1M_R4_PARALLEL_UNIT_SYSTEM_CREATED = false as const;
export const D1M_R4_UNKNOWN_UNIT_AUTO_MAPPED = false as const;
export const D1M_R4_MISSING_UNIT_AUTO_INFERRED = false as const;
export const D1M_R4_UNIT_COMPATIBILITY_IMPLEMENTED = true as const;
export const D1M_R4_UNIT_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1M_R4_UNKNOWN_UNIT_DEFAULTS_COMPATIBLE = false as const;
export const D1M_R4_UNIT_COMPATIBILITY_EQUALS_CONVERSION = false as const;
export const D1M_R4_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_COORDINATE_REFERENCE_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R4_COORDINATE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1M_R4_D1K_COORDINATE_ARCHITECTURE_REUSED = COORDINATE_ARCHITECTURE_REUSED;
export const D1M_R4_PARALLEL_COORDINATE_SYSTEM_CREATED = false as const;
export const D1M_R4_SOURCE_COORDINATE_IDENTITIES = D1M_0_COORDINATE_IDENTITIES;
export const D1M_R4_GOVERNED_COORDINATE_SYSTEMS = D1F_COORDINATE_SYSTEMS;
export const D1M_R4_MISSING_COORDINATE_AUTO_INFERRED = false as const;
export const D1M_R4_UNKNOWN_COORDINATE_DEFAULTS_COMPATIBLE = false as const;
export const D1M_R4_COORDINATE_COMPATIBILITY_IMPLEMENTED = true as const;
export const D1M_R4_COORDINATE_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1M_R4_COORDINATE_COMPATIBILITY_EQUALS_TRANSFORM = false as const;
export const D1M_R4_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_AXIS_SIGN_REFERENCE_RUNTIME_IMPLEMENTED = true as const;
export const D1M_R4_AXIS_SIGN_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1M_R4_D1K_AXIS_ARCHITECTURE_REUSED = AXIS_SIGN_ARCHITECTURE_REUSED;
export const D1M_R4_PARALLEL_AXIS_SYSTEM_CREATED = false as const;
export const D1M_R4_GOVERNED_AXES = D1F_MEMBER_END_RELEASE_AXES;
export const D1M_R4_SIGN_CONVENTIONS = D1F_SIGN_CONVENTION_FIELDS;
export const D1M_R4_MISSING_AXIS_AUTO_INFERRED = false as const;
export const D1M_R4_MISSING_SIGN_AUTO_INFERRED = false as const;
export const D1M_R4_SOURCE_AXIS_EQUALS_ENGINEERING_AXIS = false as const;
export const D1M_R4_AXIS_SIGN_COMPATIBILITY_IMPLEMENTED = true as const;
export const D1M_R4_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1M_R4_AXIS_COMPATIBILITY_EQUALS_TRANSFORMATION = false as const;
export const D1M_R4_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R4_AXIS_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_REFERENCE_FINGERPRINT_IMPLEMENTED = true as const;
export const D1M_R4_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1M_R4_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D1M_R4_FINGERPRINT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R4_COMPATIBILITY_CONFIDENCE_SCORE_IMPLEMENTED = false as const;
export const D1M_R4_INDETERMINATE_AUTO_ACCEPTED = false as const;
export const D1M_R4_UNIT_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R4_COORDINATE_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R4_AXIS_COMPATIBILITY_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R4_REFERENCE_COMPATIBLE_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D1M_R4_REFERENCE_COMPATIBLE_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1M_R4_SILENT_UNIT_NORMALIZATION_ALLOWED = false as const;
export const D1M_R4_SILENT_COORDINATE_NORMALIZATION_ALLOWED = false as const;
export const D1M_R4_SILENT_AXIS_NORMALIZATION_ALLOWED = false as const;
export const D1M_R4_SILENT_MUTATION_ALLOWED = false as const;
export const D1M_R4_UNIT_REFERENCE_AUTO_UPGRADED = false as const;
export const D1M_R4_COORDINATE_REFERENCE_AUTO_UPGRADED = false as const;
export const D1M_R4_AXIS_REFERENCE_AUTO_UPGRADED = false as const;
export const D1M_R4_EVIDENCE_AUTO_UPGRADED = false as const;
export const D1M_R4_UNIT_HISTORY_PRESERVED = true as const;
export const D1M_R4_COORDINATE_HISTORY_PRESERVED = true as const;
export const D1M_R4_AXIS_HISTORY_PRESERVED = true as const;
export const D1M_R4_REFERENCE_HISTORY_PRESERVED = true as const;
export const D1M_R4_CONFLICT_AUTO_RESOLVED = false as const;
export const D1M_R4_HUMAN_REVIEW_SUPPORTED = true as const;
export const D1M_R4_HUMAN_REVIEW_EQUALS_ENGINEERING_VALIDATION = false as const;
export const D1M_R4_AUTHORITY_PRESERVED = true as const;
export const D1M_R4_PROVENANCE_PRESERVED = true as const;
export const D1M_R4_AUTHORITY_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1M_R4_AUTHORITY_EQUALS_CERTIFICATION_AUTHORITY = false as const;
export const D1M_R4_ADMIN_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const D1M_R4_AI_CAN_INVENT_UNIT = false as const;
export const D1M_R4_AI_CAN_INVENT_COORDINATE = false as const;
export const D1M_R4_AI_CAN_INVENT_AXIS = false as const;
export const D1M_R4_AI_CAN_INVENT_SIGN = false as const;
export const D1M_R4_AI_CAN_RESOLVE_CONFLICT = false as const;
export const D1M_R4_AI_CAN_MARK_ENGINEERING_VALIDATED = false as const;
export const D1M_R4_AI_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_AI_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_AI_AXIS_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R4_MUTATES_R3_SOURCE_VALUES = false as const;
export const D1M_R4_GEOMETRY_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_PARSE_RUNTIME_COUNT = 0 as const;
export const D1M_R4_OBJECT_EXTRACTION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_GENERIC_FILE_INGESTION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_FORMAT_ADAPTER_RUNTIME_COUNT = 0 as const;
export const D1M_R4_CONNECTOR_RUNTIME_COUNT = 0 as const;
export const D1M_R4_RELATIONSHIP_RUNTIME_COUNT = 0 as const;
export const D1M_R4_CONNECTIVITY_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R4_LOAD_PATH_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D1M_R4_ENGINEERING_PROPERTY_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_D1K_COMPATIBILITY_REUSED = true as const;
export const D1M_R4_PARALLEL_COMPATIBILITY_ENGINE_CREATED = false as const;
export const D1M_R4_D1K_GOVERNANCE_REUSED = true as const;
export const D1M_R4_PARALLEL_CROSS_DISCIPLINE_INTERFACE_CREATED = false as const;
export const D1M_R4_D1K_INTERNAL_INTEGRATION_READY = D1K_R5_INTERNAL_DISCIPLINE_INTEGRATION_READY;
export const D1M_R4_D1K_INTELLIGENCE_READY = D1K_R5_CROSS_DISCIPLINE_INTELLIGENCE_READY;
export const D1M_R4_CANONICAL_DIGITAL_THREAD_REUSED = true as const;
export const D1M_R4_PARALLEL_DIGITAL_THREAD_CREATED = false as const;
export const D1M_R4_SCOPE_ENFORCED = true as const;
export const D1M_R4_CROSS_WORKSPACE_ALLOWED = false as const;
export const D1M_R4_CROSS_PROJECT_ALLOWED = false as const;
export const D1M_R4_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D1M_R4_D1L_TRACK_COMPLETE = D1L_R6_TRACK_COMPLETE;
export const D1M_R4_D1L_TRACK_STATUS = D1L_R6_TRACK_STATUS;
export const D1M_R4_REFERENCE_EQUALS_D1L_CERTIFICATION_ELIGIBLE = false as const;
export const D1M_R4_D1N_CURRENT_STATUS = "NOT_ABSORBED" as const;
export const D1M_R4_D1N_ABSORBED = false as const;
export const D1M_R4_D1N_RUNTIME_STARTED = false as const;
export const D1M_R4_D1N_RUNTIME_COUNT = 0 as const;
export const D1M_R4_D9_ABSORBED = false as const;
export const D1M_R4_D9_RUNTIME_STARTED = false as const;
export const D1M_R4_D9_RUNTIME_COUNT = 0 as const;
export const D1M_R4_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_D2_D8_RUNTIME_STARTED = false as const;
export const D1M_R4_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1M_R4_RUNTIME_STARTED = true as const;
export const D1M_R4_RUNTIME_COUNT = 4 as const;
export const D1M_R4_SOURCE_REFERENCE_RUNTIME_COUNT = 1 as const;
export const D1M_R4_ARTIFACT_RUNTIME_COUNT = 1 as const;
export const D1M_R4_SOURCE_OBJECT_IDENTITY_RUNTIME_COUNT = 1 as const;
export const D1M_R4_MAPPING_RUNTIME_COUNT = 1 as const;
export const D1M_R4_GEOMETRY_RUNTIME_COUNT = 1 as const;
export const D1M_R4_SEMANTIC_RUNTIME_COUNT = 1 as const;
export const D1M_R4_MODEL_CORRECTION_RUNTIME_COUNT = 0 as const;
export const D1M_R4_CAD_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R4_BIM_AUTHORING_RUNTIME_COUNT = 0 as const;
export const D1M_R4_DATABASE_SCHEMA_CHANGED = false as const;
export const D1M_R4_NEW_DEPENDENCY_ADDED = false as const;
export const D1M_R4_STRUCTURAL_PACK_COMPLETE = D1_STRUCTURAL_PACK_COMPLETE;
export const D1M_R4_D1G_BLOCKER_PRESERVED = D1G_LIVE_VALIDATED === false && D1G_ENGINEER_VALIDATED === false && D1G_CONFORMANCE_VALIDATED === false && D1G_CERTIFIED_SOLVER_STATUS === "NOT_CERTIFIED";
export const D1M_R4_POST_D1J_DEBT_PRESERVED = POST_D1J_STRUCTURAL_DEBT_LEDGER;
export const D1M_R4_D1K_LIMITATIONS_PRESERVED = D1M_R4_D1K_INTERNAL_INTEGRATION_READY === false && D1M_R4_D1K_INTELLIGENCE_READY === false;
export const D1M_R4_GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY = GA_SECURITY_DEBT_BLOCKS_GENERAL_AVAILABILITY;
export const D1M_R4_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1M_R5_CANONICAL_PHASE = "EOS-D1M-R5-MODEL-RELATIONSHIP-EVIDENCE" as const;
export const D1M_R5_PHASE_TYPE = "CAD_OR_BIM_MODEL_RELATIONSHIP_EVIDENCE" as const;
export const D1M_R5_CANONICAL_SCOPE =
  "Record explicit governed relationship evidence among source-model objects and mapped structural targets using exact R1 through R4 context. Keep a declared model relationship distinct from validated structural connectivity or a load path. Do not infer relationships from geometry or semantics, perform clash detection, or implement global dependency reasoning." as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "current bim", "current drawing"]);
const RECORDER = "INTERFACE_RECORD_AUTHORITY";
const REVIEWER = "REVIEWER_AUTHORITY";

export type D1mR4Actor = {
  actorId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  authority: string;
};

export type D1mR4Input = {
  contextId: string;
  evidenceId: string;
  quantity?: string | null;
  governedCoordinateSystem?: string | null;
  governedAxis?: string | null;
  signConvention?: string | null;
  canonicalUnit?: string | null;
  evidenceRef: string;
  provenanceRef: string;
  expectedEvidenceFingerprint?: string;
  expectedMappingFingerprint?: string;
  expectedSourceRevision?: string;
  predecessorContextId?: string | null;
  ambiguous?: boolean;
  confidence?: number;
  normalizeUnit?: boolean;
  inferCoordinate?: boolean;
  inferAxis?: boolean;
  inferSign?: boolean;
  convertUnits?: boolean;
  transformCoordinates?: boolean;
  transformGeometry?: boolean;
  engineeringValidated?: boolean;
  createEvidence?: boolean;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D1mR4Record = {
  contextId: string;
  evidenceId: string;
  evidenceFamily: D1mR3Record["evidenceFamily"];
  evidenceFingerprint: string;
  referenceId: string;
  sourceRevision: string;
  r1MetadataFingerprint: string;
  mappingId: string;
  mappingFingerprint: string;
  sourceObjectId: string;
  structuralTargetId: string;
  sourceDeclaredUnit: string | null;
  quantity: string | null;
  canonicalUnit: string | null;
  unitFamily: string | null;
  unitResolution: "RESOLVED" | "UNRESOLVED" | "MISSING";
  sourceCoordinateIdentity: D1mR3Record["coordinateIdentity"];
  governedCoordinateSystem: (typeof D1F_COORDINATE_SYSTEMS)[number] | null;
  coordinateResolution: "DECLARED_SOURCE" | "EXPLICIT_GOVERNED_FRAME" | "MISSING";
  sourceDeclaredAxis: string | null;
  governedAxis: (typeof D1F_MEMBER_END_RELEASE_AXES)[number] | null;
  signConvention: (typeof D1F_SIGN_CONVENTION_FIELDS)[number] | null;
  axisResolution: "EXPLICIT" | "MISSING";
  signResolution: "EXPLICIT" | "MISSING";
  sourceAxisEqualsValidatedEngineeringAxis: false;
  conversionPerformed: false;
  transformationPerformed: false;
  evidenceAuthority: typeof RECORDER;
  engineeringApprover: null;
  certificationAuthority: null;
  provenanceRef: string;
  evidenceRef: string;
  contextFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordedBy: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  contextStatus: "RECORDED" | "CONFIRMED";
  predecessorContextId: string | null;
  humanReviewRecorded: boolean;
  engineeringValidated: false;
  structuralAdequacyConfirmed: false;
  certified: false;
};

export type D1mR4Comparison = {
  comparisonId: string;
  leftContextId: string;
  rightContextId: string;
  leftEvidenceFingerprint: string;
  rightEvidenceFingerprint: string;
  diagnostics: readonly D1kR2Diagnostic[];
  aggregateConclusion: (typeof D1K_CONVENTION_STATES)[number];
  conversionPerformed: false;
  transformationPerformed: false;
  engineeringValidated: false;
  structuralAdequacyConfirmed: false;
  comparisonFingerprint: string;
};

export type D1mR4History = {
  historyId: string;
  contextId: string;
  action: "CREATED" | "SUPERSEDED" | "CONFIRMED";
  evidenceId: string;
  contextFingerprint: string;
  recordedAt: string;
};

export type D1mR4Store = {
  evidence: readonly D1mR3Record[];
  now: () => string;
  records: D1mR4Record[];
  comparisons: D1mR4Comparison[];
  history: D1mR4History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function floating(value: string): boolean {
  return FLOATING.has(value.trim().toLowerCase());
}

function blank(value: string | null | undefined): boolean {
  return value == null || value === "";
}

function assertScope(actor: D1mR4Actor, row: { tenantId: string; workspaceId: string; projectId: string }): void {
  if (actor.tenantId !== row.tenantId) fail("CROSS_TENANT_OPERATION");
  if (actor.workspaceId !== row.workspaceId || actor.projectId !== row.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertRecorder(actor: D1mR4Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_REFERENCE_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_REFERENCE_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("REFERENCE_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("REFERENCE_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== RECORDER) fail("UNAUTHORIZED");
}

function identityConclusion(left: string | null, right: string | null, registry: readonly string[], mismatchKind: D1kR2Diagnostic["diagnosticKind"], mismatchCode: string, unknownCode: string, missingCode: string): Pick<D1kR2Diagnostic, "conclusion" | "reasonCode" | "diagnosticKind" | "supported" | "humanReviewRequired"> {
  if (blank(left) || blank(right)) {
    return { conclusion: "MISSING", reasonCode: missingCode, diagnosticKind: "MISSING_INTERFACE_INFORMATION", supported: true, humanReviewRequired: true };
  }
  const leftKnown = registry.includes(left as string);
  const rightKnown = registry.includes(right as string);
  if (!leftKnown || !rightKnown) {
    return { conclusion: "UNRESOLVED", reasonCode: unknownCode, diagnosticKind: null, supported: false, humanReviewRequired: true };
  }
  if (left === right) return { conclusion: "MATCHING", reasonCode: "EXACT_MATCH", diagnosticKind: null, supported: true, humanReviewRequired: false };
  return { conclusion: "INCOMPATIBLE", reasonCode: mismatchCode, diagnosticKind: mismatchKind, supported: true, humanReviewRequired: true };
}

function diagnostic(dimension: D1kR2Diagnostic["dimension"], sourceIdentity: string | null, receivingIdentity: string | null, body: ReturnType<typeof identityConclusion>): D1kR2Diagnostic {
  return {
    dimension,
    sourceIdentity,
    receivingIdentity,
    conclusion: body.conclusion,
    reasonCode: body.reasonCode,
    diagnosticKind: body.diagnosticKind,
    supported: body.supported,
    conversionRequired: false,
    transformationRequired: false,
    humanReviewRequired: body.humanReviewRequired,
  };
}

function unitDiagnostic(left: D1mR4Record, right: D1mR4Record): D1kR2Diagnostic {
  const sourceIdentity = left.canonicalUnit ? `${left.unitFamily}:${left.canonicalUnit}` : left.sourceDeclaredUnit;
  const receivingIdentity = right.canonicalUnit ? `${right.unitFamily}:${right.canonicalUnit}` : right.sourceDeclaredUnit;
  if (left.unitResolution === "MISSING" || right.unitResolution === "MISSING" || blank(left.quantity) || blank(right.quantity)) {
    return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
      conclusion: "MISSING", reasonCode: "UNIT_MISSING", diagnosticKind: "MISSING_INTERFACE_INFORMATION", supported: true, humanReviewRequired: true,
    });
  }
  if (left.unitResolution !== "RESOLVED" || right.unitResolution !== "RESOLVED" || !left.unitFamily || !right.unitFamily) {
    return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
      conclusion: "UNRESOLVED", reasonCode: "UNIT_UNSUPPORTED", diagnosticKind: null, supported: false, humanReviewRequired: true,
    });
  }
  if (left.unitFamily !== right.unitFamily) {
    return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
      conclusion: "INCOMPATIBLE", reasonCode: "DIMENSION_MISMATCH", diagnosticKind: "UNIT_MISMATCH", supported: true, humanReviewRequired: true,
    });
  }
  if (left.canonicalUnit === right.canonicalUnit) {
    return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
      conclusion: "MATCHING", reasonCode: "UNIT_EXACT_MATCH", diagnosticKind: null, supported: true, humanReviewRequired: false,
    });
  }
  return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
    conclusion: "UNRESOLVED", reasonCode: "DIMENSIONALLY_COMPATIBLE_CONVERSION_REQUIRED", diagnosticKind: "UNIT_MISMATCH", supported: true, humanReviewRequired: true,
  });
}

function remember(store: D1mR4Store, record: D1mR4Record, action: D1mR4History["action"]): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    contextId: record.contextId,
    action,
    evidenceId: record.evidenceId,
    contextFingerprint: record.contextFingerprint,
    recordedAt: store.now(),
  });
}

export function createD1mR4Store(evidence: readonly D1mR3Record[], now: () => string): D1mR4Store {
  return { evidence, now, records: [], comparisons: [], history: [] };
}

export function recordReferenceContext(store: D1mR4Store, actor: D1mR4Actor, input: D1mR4Input): D1mR4Record {
  assertRecorder(actor);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if ((input.workspaceId != null && input.workspaceId !== actor.workspaceId) || (input.projectId != null && input.projectId !== actor.projectId)) {
    fail("CROSS_PROJECT_OPERATION");
  }
  if (input.ambiguous === true) fail("AMBIGUOUS_REFERENCE_UNRESOLVED");
  if (input.confidence != null) fail("CONFIDENCE_SCORE_NOT_AUTHORITATIVE");
  if (input.normalizeUnit === true) fail("SILENT_UNIT_NORMALIZATION_REJECTED");
  if (input.inferCoordinate === true) fail("COORDINATE_INFERENCE_NOT_IN_R4");
  if (input.inferAxis === true) fail("AXIS_INFERENCE_NOT_IN_R4");
  if (input.inferSign === true) fail("SIGN_INFERENCE_NOT_IN_R4");
  if (input.convertUnits === true) fail("UNIT_CONVERSION_NOT_IN_R4");
  if (input.transformCoordinates === true) fail("COORDINATE_TRANSFORMATION_NOT_IN_R4");
  if (input.transformGeometry === true) fail("GEOMETRY_TRANSFORMATION_NOT_IN_R4");
  if (input.engineeringValidated === true) fail("ENGINEERING_VALIDATION_NOT_IN_R4");
  if (input.createEvidence === true) fail("EVIDENCE_CREATION_NOT_IN_R4");
  if (!input.contextId.trim() || floating(input.contextId) || blockedParty(input.contextId)) fail("REFERENCE_IDENTITY_REQUIRED");
  if (!input.evidenceId.trim() || floating(input.evidenceId)) fail("R3_EVIDENCE_REQUIRED");
  if (!input.provenanceRef.trim() || blockedParty(input.provenanceRef) || !input.evidenceRef.trim() || blockedParty(input.evidenceRef)) {
    fail("MISSING_REFERENCE_PROVENANCE");
  }
  if (input.expectedSourceRevision != null && floating(input.expectedSourceRevision)) fail("FLOATING_REFERENCE_REJECTED");
  const evidence = store.evidence.find((row) => row.evidenceId === input.evidenceId);
  if (!evidence) fail("R3_EVIDENCE_REQUIRED");
  if (evidence.recordStatus !== "CURRENT") fail("EVIDENCE_NOT_CURRENT");
  assertScope(actor, evidence);
  if (input.expectedEvidenceFingerprint != null && input.expectedEvidenceFingerprint !== evidence.evidenceFingerprint) fail("FINGERPRINT_MISMATCH");
  if (input.expectedMappingFingerprint != null && input.expectedMappingFingerprint !== evidence.mappingFingerprint) fail("MAPPING_SUBSTITUTION_REJECTED");
  if (input.expectedSourceRevision != null && input.expectedSourceRevision !== evidence.sourceRevision) fail("ARTIFACT_REVISION_MISMATCH");
  const componentsBefore = evidence.components?.slice() ?? null;
  const valueBefore = evidence.sourceValue;
  const declaredUnit = evidence.declaredUnit;
  if (input.canonicalUnit != null && input.canonicalUnit !== declaredUnit) fail("SILENT_UNIT_NORMALIZATION_REJECTED");
  const quantity = blank(input.quantity) ? null : input.quantity ?? null;
  const unitFamily = declaredUnit && quantity ? existingUnitFamily(quantity, declaredUnit) : null;
  const unitResolution = !declaredUnit ? "MISSING" : unitFamily ? "RESOLVED" : "UNRESOLVED";
  const canonicalUnit = unitResolution === "RESOLVED" ? declaredUnit : null;
  let governedCoordinateSystem: D1mR4Record["governedCoordinateSystem"] = null;
  if (!blank(input.governedCoordinateSystem)) {
    if (!(D1F_COORDINATE_SYSTEMS as readonly string[]).includes(input.governedCoordinateSystem as string)) fail("COORDINATE_UNSUPPORTED");
    governedCoordinateSystem = input.governedCoordinateSystem as D1mR4Record["governedCoordinateSystem"];
  }
  let governedAxis: D1mR4Record["governedAxis"] = null;
  if (!blank(input.governedAxis)) {
    if (!(D1F_MEMBER_END_RELEASE_AXES as readonly string[]).includes(input.governedAxis as string)) fail("AXIS_UNSUPPORTED");
    governedAxis = input.governedAxis as D1mR4Record["governedAxis"];
  }
  let signConvention: D1mR4Record["signConvention"] = null;
  if (!blank(input.signConvention)) {
    if (!(D1F_SIGN_CONVENTION_FIELDS as readonly string[]).includes(input.signConvention as string)) fail("SIGN_CONVENTION_UNSUPPORTED");
    signConvention = input.signConvention as D1mR4Record["signConvention"];
  }
  const predecessor = input.predecessorContextId ? store.records.find((row) => row.contextId === input.predecessorContextId) : null;
  if (input.predecessorContextId) {
    if (!predecessor) fail("REFERENCE_NOT_FOUND");
    assertScope(actor, predecessor);
    if (predecessor.recordStatus !== "CURRENT" || predecessor.evidenceId !== evidence.evidenceId) fail("PREDECESSOR_NOT_CURRENT");
  }
  const active = store.records.find((row) => row.recordStatus === "CURRENT" && row.evidenceId === evidence.evidenceId);
  if (active && active.contextId !== input.contextId && active.contextId !== predecessor?.contextId) fail("REFERENCE_CONFLICT");
  const contextFingerprint = fingerprintCanonical({
    contextId: input.contextId,
    evidenceId: evidence.evidenceId,
    evidenceFingerprint: evidence.evidenceFingerprint,
    referenceId: evidence.referenceId,
    sourceRevision: evidence.sourceRevision,
    r1MetadataFingerprint: evidence.r1MetadataFingerprint,
    mappingId: evidence.mappingId,
    mappingFingerprint: evidence.mappingFingerprint,
    sourceObjectId: evidence.sourceObjectId,
    structuralTargetId: evidence.structuralTargetId,
    sourceDeclaredUnit: declaredUnit,
    quantity,
    canonicalUnit,
    unitFamily,
    sourceCoordinateIdentity: evidence.coordinateIdentity,
    governedCoordinateSystem,
    sourceDeclaredAxis: evidence.declaredAxis,
    governedAxis,
    signConvention,
    provenanceRef: input.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    predecessorContextId: predecessor?.contextId ?? null,
  });
  if (predecessor && predecessor.canonicalUnit === canonicalUnit && predecessor.quantity === quantity && predecessor.governedCoordinateSystem === governedCoordinateSystem && predecessor.governedAxis === governedAxis && predecessor.signConvention === signConvention && predecessor.sourceDeclaredUnit === declaredUnit) {
    fail("REFERENCE_UNCHANGED");
  }
  const existing = store.records.find((row) => row.contextId === input.contextId);
  if (existing) {
    if (existing.contextFingerprint === contextFingerprint && !predecessor) return existing;
    fail("REFERENCE_ALREADY_RECORDED");
  }
  const record: D1mR4Record = {
    contextId: input.contextId,
    evidenceId: evidence.evidenceId,
    evidenceFamily: evidence.evidenceFamily,
    evidenceFingerprint: evidence.evidenceFingerprint,
    referenceId: evidence.referenceId,
    sourceRevision: evidence.sourceRevision,
    r1MetadataFingerprint: evidence.r1MetadataFingerprint,
    mappingId: evidence.mappingId,
    mappingFingerprint: evidence.mappingFingerprint,
    sourceObjectId: evidence.sourceObjectId,
    structuralTargetId: evidence.structuralTargetId,
    sourceDeclaredUnit: declaredUnit,
    quantity,
    canonicalUnit,
    unitFamily,
    unitResolution,
    sourceCoordinateIdentity: evidence.coordinateIdentity,
    governedCoordinateSystem,
    coordinateResolution: evidence.coordinateIdentity ? "DECLARED_SOURCE" : governedCoordinateSystem ? "EXPLICIT_GOVERNED_FRAME" : "MISSING",
    sourceDeclaredAxis: evidence.declaredAxis,
    governedAxis,
    signConvention,
    axisResolution: governedAxis ? "EXPLICIT" : "MISSING",
    signResolution: signConvention ? "EXPLICIT" : "MISSING",
    sourceAxisEqualsValidatedEngineeringAxis: false,
    conversionPerformed: false,
    transformationPerformed: false,
    evidenceAuthority: RECORDER,
    engineeringApprover: null,
    certificationAuthority: null,
    provenanceRef: input.provenanceRef,
    evidenceRef: input.evidenceRef,
    contextFingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    recordedBy: actor.actorId,
    recordStatus: "CURRENT",
    contextStatus: "RECORDED",
    predecessorContextId: predecessor?.contextId ?? null,
    humanReviewRecorded: false,
    engineeringValidated: false,
    structuralAdequacyConfirmed: false,
    certified: false,
  };
  if (predecessor) {
    predecessor.recordStatus = "SUPERSEDED";
    remember(store, predecessor, "SUPERSEDED");
  }
  store.records.push(record);
  remember(store, record, "CREATED");
  if (evidence.sourceValue !== valueBefore || (componentsBefore && evidence.components?.some((item, index) => item !== componentsBefore[index]))) {
    fail("R3_EVIDENCE_MUTATED");
  }
  return record;
}

export function compareReferenceContexts(store: D1mR4Store, actor: D1mR4Actor, leftContextId: string, rightContextId: string): D1mR4Comparison {
  assertRecorder(actor);
  const left = store.records.find((row) => row.contextId === leftContextId);
  const right = store.records.find((row) => row.contextId === rightContextId);
  if (!left || !right) fail("REFERENCE_NOT_FOUND");
  assertScope(actor, left);
  assertScope(actor, right);
  if (left.recordStatus !== "CURRENT" || right.recordStatus !== "CURRENT") fail("REFERENCE_NOT_CURRENT");
  const sourceCoordinate = identityConclusion(left.sourceCoordinateIdentity, right.sourceCoordinateIdentity, D1M_0_COORDINATE_IDENTITIES, "COORDINATE_SYSTEM_MISMATCH", "COORDINATE_MISMATCH", "COORDINATE_UNSUPPORTED", "COORDINATE_MISSING");
  const governedCoordinate = identityConclusion(left.governedCoordinateSystem, right.governedCoordinateSystem, D1F_COORDINATE_SYSTEMS, "COORDINATE_SYSTEM_MISMATCH", "COORDINATE_MISMATCH", "COORDINATE_UNSUPPORTED", "COORDINATE_MISSING");
  const axis = identityConclusion(left.governedAxis, right.governedAxis, D1F_MEMBER_END_RELEASE_AXES, "AXIS_MISMATCH", "AXIS_MISMATCH", "AXIS_UNSUPPORTED", "AXIS_MISSING");
  const sign = identityConclusion(left.signConvention, right.signConvention, D1F_SIGN_CONVENTION_FIELDS, "SIGN_CONVENTION_MISMATCH", "SIGN_MISMATCH", "SIGN_UNSUPPORTED", "SIGN_MISSING");
  const diagnostics = [
    unitDiagnostic(left, right),
    diagnostic("COORDINATES", left.sourceCoordinateIdentity, right.sourceCoordinateIdentity, sourceCoordinate),
    diagnostic("COORDINATES", left.governedCoordinateSystem, right.governedCoordinateSystem, governedCoordinate),
    diagnostic("AXIS", left.governedAxis, right.governedAxis, axis),
    diagnostic("SIGN", left.signConvention, right.signConvention, sign),
  ];
  const aggregateConclusion = aggregateCompatibility(diagnostics);
  if (aggregateConclusion !== "MATCHING" && aggregateConclusion !== "INCOMPATIBLE" && aggregateConclusion !== "MISSING" && aggregateConclusion !== "UNRESOLVED") {
    fail("COMPATIBILITY_STATE_INVALID");
  }
  const comparisonFingerprint = fingerprintCanonical({
    leftContextId,
    rightContextId,
    leftEvidenceFingerprint: left.evidenceFingerprint,
    rightEvidenceFingerprint: right.evidenceFingerprint,
    diagnostics,
    aggregateConclusion,
  });
  const comparison: D1mR4Comparison = {
    comparisonId: `cmp-${store.comparisons.length + 1}`,
    leftContextId,
    rightContextId,
    leftEvidenceFingerprint: left.evidenceFingerprint,
    rightEvidenceFingerprint: right.evidenceFingerprint,
    diagnostics,
    aggregateConclusion,
    conversionPerformed: false,
    transformationPerformed: false,
    engineeringValidated: false,
    structuralAdequacyConfirmed: false,
    comparisonFingerprint,
  };
  store.comparisons.push(comparison);
  return comparison;
}

export function confirmReferenceContext(store: D1mR4Store, actor: D1mR4Actor, contextId: string): D1mR4Record {
  if (!actor.actorId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_REFERENCE_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_REFERENCE_AUTHORITY");
  if (actor.authority === "ENGINEERING_APPROVAL_AUTHORITY") fail("REFERENCE_AUTHORITY_NOT_ENGINEERING_APPROVAL");
  if (actor.authority === "CERTIFICATION_AUTHORITY") fail("REFERENCE_AUTHORITY_NOT_CERTIFIER");
  if (actor.authority !== REVIEWER) fail("UNAUTHORIZED");
  const record = store.records.find((row) => row.contextId === contextId);
  if (!record) fail("REFERENCE_NOT_FOUND");
  assertScope(actor, record);
  if (record.recordStatus !== "CURRENT") fail("REFERENCE_NOT_CURRENT");
  const fingerprintBefore = record.contextFingerprint;
  record.contextStatus = "CONFIRMED";
  record.humanReviewRecorded = true;
  record.engineeringValidated = false;
  record.structuralAdequacyConfirmed = false;
  record.certified = false;
  if (record.contextFingerprint !== fingerprintBefore) fail("REFERENCE_MUTATED");
  remember(store, record, "CONFIRMED");
  return record;
}

export function supersedeReferenceContext(store: D1mR4Store, actor: D1mR4Actor, input: D1mR4Input): D1mR4Record {
  if (!input.predecessorContextId) fail("REFERENCE_NOT_FOUND");
  return recordReferenceContext(store, actor, input);
}

export function mutateReferenceContext(): never {
  return fail("SILENT_REFERENCE_MUTATION_REJECTED");
}

export function upgradeReferenceContext(): never {
  return fail("REFERENCE_AUTO_UPGRADE_REJECTED");
}

export function convertReferenceUnits(): never {
  return fail("UNIT_CONVERSION_NOT_IN_R4");
}

export function transformReferenceCoordinates(): never {
  return fail("COORDINATE_TRANSFORMATION_NOT_IN_R4");
}

export function inferReferenceAxis(): never {
  return fail("AXIS_INFERENCE_NOT_IN_R4");
}

export function transformReferenceAxis(): never {
  return fail("AXIS_TRANSFORMATION_NOT_IN_R4");
}

export function transformReferenceGeometry(): never {
  return fail("GEOMETRY_TRANSFORMATION_NOT_IN_R4");
}

export function resolveReferenceByAi(): never {
  return fail("AI_REFERENCE_RESOLUTION_NOT_IN_R4");
}

export function parseCadBimArtifact(): never {
  return fail("PARSE_NOT_IN_R4");
}

export function ingestCadBimFile(): never {
  return fail("FILE_INGESTION_NOT_IN_R4");
}

export function extractCadBimObjects(): never {
  return fail("OBJECT_EXTRACTION_NOT_IN_R4");
}

export function adaptCadBimFormat(): never {
  return fail("FORMAT_ADAPTER_NOT_IN_R4");
}

export function connectCadBimVendor(): never {
  return fail("CONNECTOR_NOT_IN_R4");
}

export function inferCadBimRelationships(): never {
  return fail("RELATIONSHIP_NOT_IN_R4");
}

export function inferStructuralConnectivity(): never {
  return fail("CONNECTIVITY_INFERENCE_NOT_IN_R4");
}

export function inferLoadPath(): never {
  return fail("LOAD_PATH_INFERENCE_NOT_IN_R4");
}

export function interpretCadBimEngineeringProperties(): never {
  return fail("ENGINEERING_PROPERTY_INTERPRETATION_NOT_IN_R4");
}

export function correctCadBimModel(): never {
  return fail("MODEL_CORRECTION_NOT_IN_R4");
}

export function authorCadModel(): never {
  return fail("CAD_AUTHORING_NOT_IN_R4");
}

export function authorBimModel(): never {
  return fail("BIM_AUTHORING_NOT_IN_R4");
}
