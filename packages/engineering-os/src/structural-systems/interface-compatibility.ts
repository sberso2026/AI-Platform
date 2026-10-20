/**
 * EOS-D1K-R2 semantic, schema, unit, coordinate, and axis compatibility diagnostics.
 * Observes a governed D1K-R1 record. Does not convert, transform, reconcile, or approve.
 */

import {
  D1F_COORDINATE_SYSTEMS,
  D1F_MEMBER_END_RELEASE_AXES,
  D1F_SIGN_CONVENTION_FIELDS,
  D1K_CONVENTION_STATES,
  D1K_DIAGNOSTIC_KINDS,
} from "@rtb/types";
import { existingUnitFamily } from "../structural-demand/units";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1K_R2_CANONICAL_PHASE,
  D1K_R2_CANONICAL_SCOPE,
  D1K_R2_PHASE_TYPE,
  inspectStructuralInterfaceIdentity,
  type D1kR1Actor,
  type D1kR1InterfaceRecord,
  type D1kR1Store,
} from "./interface-identity-foundation";

export { D1K_R2_CANONICAL_PHASE, D1K_R2_CANONICAL_SCOPE, D1K_R2_PHASE_TYPE };

export const D1K_R2_STATUS = "COMPATIBILITY_DIAGNOSTICS_DEFINED" as const;
export const D1K_R2_MATURITY_STATE = "STRUCTURAL_INTERFACE_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY_IMPLEMENTED" as const;
export const D1K_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D1K_R2_SEMANTIC_UNIT_COORDINATE_AXIS_COMPATIBILITY_CLOSEOUT.md" as const;
export const D1K_R2_ARCHITECTURE_READY = true as const;
export const D1K_R2_REFERENCE_RUNTIME_READY = true as const;
export const D1K_R2_EXTERNAL_REFERENCE_READY = false as const;
export const D1K_R2_INTERNAL_DISCIPLINE_INTEGRATION_READY = false as const;
export const D1K_R2_CROSS_DISCIPLINE_INTELLIGENCE_READY = false as const;

export const D1K_R2_SEMANTIC_REGISTRY = [
  "APPLIED_FORCE",
  "SUPPORT_REACTION",
  "PRESSURE",
  "SERVICE_LOAD",
  "ULTIMATE_LOAD",
  "CHARACTERISTIC_VALUE",
  "DESIGN_VALUE",
  "DISPLACEMENT",
  "DRIFT",
  "ABSOLUTE_ELEVATION",
  "RELATIVE_OFFSET",
  "MASS",
  "WEIGHT",
  "VELOCITY",
  "ACCELERATION",
] as const;
export const D1K_R2_SCHEMA_REGISTRY = [
  { schemaId: "D1K_INTERFACE_QUANTITY", version: "1" },
  { schemaId: "D1K_INTERFACE_QUANTITY", version: "2" },
] as const;
export const D1K_R2_SCHEMA_VERSION_COMPATIBILITY_EDGES = [] as const;
export const D1K_R2_SEMANTIC_REGISTRY_REUSED = true as const;
export const D1K_R2_SCHEMA_REGISTRY_REUSED = true as const;
export const D1K_R2_UNIT_SYSTEM_REUSED = true as const;
export const D1K_R2_COORDINATE_SYSTEM_ARCHITECTURE_REUSED = true as const;
export const D1K_R2_AXIS_SIGN_ARCHITECTURE_REUSED = true as const;
export const D1K_R2_CANONICAL_DIAGNOSTIC_MODEL_REUSED = true as const;
export const D1K_R2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D1K_R2_FREEFORM_SEMANTIC_IDENTITY_ALLOWED = false as const;
export const D1K_R2_AI_SEMANTIC_SIMILARITY_USED = false as const;
export const D1K_R2_UNKNOWN_SEMANTIC_AUTO_MAPPED = false as const;
export const D1K_R2_UNKNOWN_UNIT_AUTO_MAPPED = false as const;
export const D1K_R2_UNKNOWN_COORDINATE_SYSTEM_AUTO_MAPPED = false as const;
export const D1K_R2_UNKNOWN_AXIS_SIGN_AUTO_MAPPED = false as const;

export const D1K_R2_SEMANTIC_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1K_R2_SCHEMA_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1K_R2_UNIT_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1K_R2_COORDINATE_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1K_R2_AXIS_SIGN_COMPATIBILITY_RUNTIME_COUNT = 1 as const;
export const D1K_R2_SCHEMA_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R2_UNIT_CONVERSION_RUNTIME_COUNT = 0 as const;
export const D1K_R2_COORDINATE_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R2_AXIS_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R2_SIGN_TRANSFORMATION_RUNTIME_COUNT = 0 as const;
export const D1K_R2_AUTOMATIC_COMPATIBILITY_RECONCILIATION_COUNT = 0 as const;
export const D1K_R2_SILENT_UNIT_CONVERSION_ALLOWED = false as const;
export const D1K_R2_SILENT_COORDINATE_INFERENCE_ALLOWED = false as const;
export const D1K_R2_SILENT_AXIS_SIGN_INFERENCE_ALLOWED = false as const;
export const D1K_R2_SOURCE_MUTATION_AUTHORIZED = false as const;
export const D1K_R2_SOURCE_REPOINTING_AUTHORIZED = false as const;
export const D1K_R2_SOURCE_REVISION_AUTO_UPGRADED = false as const;
export const D1K_R2_COMPATIBILITY_REEVALUATION_REQUIRED_FOR_CHANGED_SOURCE = true as const;
export const D1K_R2_COMPATIBILITY_PASS_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1K_R2_COMPATIBILITY_PASS_EQUALS_DESIGN_APPROVAL = false as const;
export const D1K_R2_COMPATIBILITY_PASS_EQUALS_SOURCE_ENGINEERING_VALIDATED = false as const;
export const D1K_R2_COMPATIBILITY_PASS_EQUALS_STRUCTURAL_DESIGN_VALIDATED = false as const;
export const D1K_R2_COMPATIBILITY_PASS_EQUALS_SOURCE_CORRECT = false as const;
export const D1K_R2_PARALLEL_APPROVAL_ENGINE_CREATED = false as const;
export const D1K_R2_HANDOFF_RUNTIME_COUNT = 0 as const;
export const D1K_R2_D2_D8_RUNTIME_STARTED = false as const;
export const D1K_R2_D2_D8_RUNTIME_COUNT = 0 as const;
export const D1K_R2_D9_RUNTIME_STARTED = false as const;
export const D1K_R2_D9_RUNTIME_COUNT = 0 as const;
export const D1K_R2_GLOBAL_CYCLE_DETECTION_RUNTIME_COUNT = 0 as const;
export const D1K_R2_CROSS_DISCIPLINE_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D1K_R2_NEW_ENGINEERING_FORMULA_COUNT = 0 as const;
export const D1K_R2_AI_CAN_INVENT_SEMANTIC_IDENTITY = false as const;
export const D1K_R2_AI_CAN_INVENT_SCHEMA_IDENTITY = false as const;
export const D1K_R2_AI_CAN_INVENT_UNIT_IDENTITY = false as const;
export const D1K_R2_AI_CAN_INVENT_COORDINATE_SYSTEM = false as const;
export const D1K_R2_AI_CAN_INVENT_AXIS_CONVENTION = false as const;
export const D1K_R2_AI_CAN_INVENT_SIGN_CONVENTION = false as const;
export const D1K_R2_AI_CAN_OVERRIDE_COMPATIBILITY_RESULT = false as const;
export const D1K_R2_AI_CAN_RECONCILE_COMPATIBILITY_CONFLICT = false as const;
export const D1K_R2_AI_CAN_APPROVE_INTERFACE = false as const;
export const D1K_R2_AI_CAN_APPROVE_ENGINEERING = false as const;
export const D1K_R2_D1L_STARTED = false as const;
export const D1K_R2_D1M_ABSORBED = false as const;
export const D1K_R2_D1N_ABSORBED = false as const;
export const D1K_R2_DATABASE_SCHEMA_CHANGE_REQUIRED = false as const;
export const D1K_R2_NEW_DEPENDENCY_COUNT = 0 as const;
export const D1K_R2_POST_D1J_DEBT_PRESERVED = true as const;
export const D1K_R2_UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D1K_R3_HANDOFF_READY = true as const;
export const D1K_R3_CANONICAL_PHASE = "EOS-D1K-R3-HANDOFF-RESPONSE-CHANGE-CONFLICT-GOVERNANCE" as const;
export const D1K_R3_PHASE_TYPE = "STRUCTURAL_INTERFACE_HANDOFF_RESPONSE_CHANGE_CONFLICT_GOVERNANCE" as const;
export const D1K_R3_CANONICAL_SCOPE =
  "Record requests, provisions, acknowledgements, responses, source changes, stale references, interface conflicts, and human-governed resolution state. Do not automatically resolve engineering conflicts, approve engineering, start D2 through D8, or start D9." as const;

export const D1K_R2_REQUIRED_DIMENSIONS = ["SEMANTICS", "SCHEMA_VERSION", "UNITS", "COORDINATES", "AXIS_SIGN"] as const;
export type D1kR2Dimension = (typeof D1K_R2_REQUIRED_DIMENSIONS)[number];
type D1kConventionState = (typeof D1K_CONVENTION_STATES)[number];

export type D1kR2Diagnostic = {
  dimension: D1kR2Dimension | "AXIS" | "SIGN";
  conclusion: D1kConventionState;
  reasonCode: string;
  diagnosticKind: (typeof D1K_DIAGNOSTIC_KINDS)[number] | null;
  sourceIdentity: string | null;
  receivingIdentity: string | null;
  supported: boolean;
  conversionRequired: false;
  transformationRequired: false;
  humanReviewRequired: boolean;
};

export type D1kR2Metadata = {
  semanticId: string | null;
  schemaId: string | null;
  schemaVersion: string | null;
  quantity: string | null;
  unit: string | null;
  coordinateSystem: string | null;
  axisConvention: string | null;
  signConvention: string | null;
};

export type D1kR2Requirement = D1kR2Metadata & {
  requiredDimensions: readonly D1kR2Dimension[];
};

export type D1kR2Result = {
  resultId: string;
  interfaceId: string;
  interfaceFingerprint: string;
  sourceId: string;
  sourceRevision: string;
  sourceFingerprint: string;
  sourceAuthority: string;
  evidence: string;
  provenance: string;
  diagnostics: readonly D1kR2Diagnostic[];
  aggregateConclusion: D1kConventionState;
  humanReviewRequired: boolean;
  engineeringApproval: false;
  designApproval: false;
  sourceEngineeringValidated: false;
  structuralDesignValidated: false;
  sourceCorrect: false;
  compatibilityScore: null;
  fingerprint: string;
  recordedAt: string;
};

export type D1kR2Store = {
  now: () => string;
  results: D1kR2Result[];
};

export type D1kR2Input = {
  resultId: string;
  interfaceId: string;
  expectedInterfaceFingerprint?: string | null;
  expectedSourceFingerprint?: string | null;
  sourceMetadata: D1kR2Metadata;
  receivingRequirement: D1kR2Requirement;
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedAuthority(value: string): boolean {
  const authority = value.trim();
  return !authority || /^AI(?:\b|_)/i.test(authority) || /LLM/i.test(authority) || /OPTIMIZER/i.test(authority) || /^SYSTEM$/i.test(authority);
}

function blank(value: string | null | undefined): boolean {
  return value == null || value.trim() === "";
}

function identityConclusion(source: string | null, receiving: string | null, registry: readonly string[], mismatchKind: (typeof D1K_DIAGNOSTIC_KINDS)[number], mismatchCode: string, unknownCode: string, missingCode: string): Pick<D1kR2Diagnostic, "conclusion" | "reasonCode" | "diagnosticKind" | "supported" | "humanReviewRequired"> {
  if (blank(source) || blank(receiving)) {
    return { conclusion: "MISSING", reasonCode: missingCode, diagnosticKind: "MISSING_INTERFACE_INFORMATION", supported: true, humanReviewRequired: true };
  }
  const sourceKnown = registry.includes(source as string);
  const receivingKnown = registry.includes(receiving as string);
  if (!sourceKnown || !receivingKnown) {
    return { conclusion: "UNRESOLVED", reasonCode: unknownCode, diagnosticKind: null, supported: false, humanReviewRequired: true };
  }
  if (source === receiving) {
    return { conclusion: "MATCHING", reasonCode: "EXACT_MATCH", diagnosticKind: null, supported: true, humanReviewRequired: false };
  }
  return { conclusion: "INCOMPATIBLE", reasonCode: mismatchCode, diagnosticKind: mismatchKind, supported: true, humanReviewRequired: true };
}

function diagnostic(dimension: D1kR2Diagnostic["dimension"], sourceIdentity: string | null, receivingIdentity: string | null, body: ReturnType<typeof identityConclusion>, flags?: { conversionRequired?: false; transformationRequired?: false }): D1kR2Diagnostic {
  return {
    dimension,
    sourceIdentity,
    receivingIdentity,
    conclusion: body.conclusion,
    reasonCode: body.reasonCode,
    diagnosticKind: body.diagnosticKind,
    supported: body.supported,
    conversionRequired: false,
    transformationRequired: flags?.transformationRequired ?? false,
    humanReviewRequired: body.humanReviewRequired,
  };
}

function semanticDiagnostic(source: D1kR2Metadata, receiving: D1kR2Requirement): D1kR2Diagnostic {
  const body = identityConclusion(source.semanticId, receiving.semanticId, D1K_R2_SEMANTIC_REGISTRY, "SEMANTIC_INCOMPATIBILITY", "SEMANTIC_INCOMPATIBLE", "SEMANTIC_UNKNOWN", "SEMANTIC_MISSING");
  return diagnostic("SEMANTICS", source.semanticId, receiving.semanticId, body);
}

function schemaDiagnostic(source: D1kR2Metadata, receiving: D1kR2Requirement): D1kR2Diagnostic {
  const sourceIdentity = blank(source.schemaId) && blank(source.schemaVersion) ? null : `${source.schemaId ?? ""}@${source.schemaVersion ?? ""}`;
  const receivingIdentity = blank(receiving.schemaId) && blank(receiving.schemaVersion) ? null : `${receiving.schemaId ?? ""}@${receiving.schemaVersion ?? ""}`;
  if (blank(source.schemaId) || blank(source.schemaVersion) || blank(receiving.schemaId) || blank(receiving.schemaVersion)) {
    return diagnostic("SCHEMA_VERSION", sourceIdentity, receivingIdentity, {
      conclusion: "MISSING",
      reasonCode: "SCHEMA_MISSING",
      diagnosticKind: "MISSING_INTERFACE_INFORMATION",
      supported: true,
      humanReviewRequired: true,
    });
  }
  const known = (schemaId: string, version: string) => D1K_R2_SCHEMA_REGISTRY.some((row) => row.schemaId === schemaId && row.version === version);
  if (!known(source.schemaId as string, source.schemaVersion as string) || !known(receiving.schemaId as string, receiving.schemaVersion as string)) {
    return diagnostic("SCHEMA_VERSION", sourceIdentity, receivingIdentity, {
      conclusion: "UNRESOLVED",
      reasonCode: "SCHEMA_UNSUPPORTED",
      diagnosticKind: null,
      supported: false,
      humanReviewRequired: true,
    });
  }
  if (source.schemaId === receiving.schemaId && source.schemaVersion === receiving.schemaVersion) {
    return diagnostic("SCHEMA_VERSION", sourceIdentity, receivingIdentity, {
      conclusion: "MATCHING",
      reasonCode: "SCHEMA_EXACT_MATCH",
      diagnosticKind: null,
      supported: true,
      humanReviewRequired: false,
    });
  }
  return diagnostic("SCHEMA_VERSION", sourceIdentity, receivingIdentity, {
    conclusion: "INCOMPATIBLE",
    reasonCode: "SCHEMA_VERSION_MISMATCH",
    diagnosticKind: "SCHEMA_VERSION_INCOMPATIBILITY",
    supported: true,
    humanReviewRequired: true,
  });
}

function unitDiagnostic(source: D1kR2Metadata, receiving: D1kR2Requirement): D1kR2Diagnostic {
  const sourceIdentity = blank(source.quantity) && blank(source.unit) ? null : `${source.quantity ?? ""}:${source.unit ?? ""}`;
  const receivingIdentity = blank(receiving.quantity) && blank(receiving.unit) ? null : `${receiving.quantity ?? ""}:${receiving.unit ?? ""}`;
  if (blank(source.quantity) || blank(source.unit) || blank(receiving.quantity) || blank(receiving.unit)) {
    return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
      conclusion: "MISSING",
      reasonCode: "UNIT_MISSING",
      diagnosticKind: "MISSING_INTERFACE_INFORMATION",
      supported: true,
      humanReviewRequired: true,
    });
  }
  const sourceFamily = existingUnitFamily(source.quantity as string, source.unit as string);
  const receivingFamily = existingUnitFamily(receiving.quantity as string, receiving.unit as string);
  if (!sourceFamily || !receivingFamily) {
    return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
      conclusion: "UNRESOLVED",
      reasonCode: "UNIT_UNSUPPORTED",
      diagnosticKind: null,
      supported: false,
      humanReviewRequired: true,
    });
  }
  if (sourceFamily !== receivingFamily) {
    return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
      conclusion: "INCOMPATIBLE",
      reasonCode: "DIMENSION_MISMATCH",
      diagnosticKind: "UNIT_MISMATCH",
      supported: true,
      humanReviewRequired: true,
    });
  }
  if (source.unit === receiving.unit) {
    return diagnostic("UNITS", sourceIdentity, receivingIdentity, {
      conclusion: "MATCHING",
      reasonCode: "UNIT_EXACT_MATCH",
      diagnosticKind: null,
      supported: true,
      humanReviewRequired: false,
    });
  }
  return {
    dimension: "UNITS",
    sourceIdentity,
    receivingIdentity,
    conclusion: "UNRESOLVED",
    reasonCode: "DIMENSIONALLY_COMPATIBLE_CONVERSION_REQUIRED",
    diagnosticKind: "UNIT_MISMATCH",
    supported: true,
    conversionRequired: false,
    transformationRequired: false,
    humanReviewRequired: true,
  };
}

function coordinateDiagnostic(source: D1kR2Metadata, receiving: D1kR2Requirement): D1kR2Diagnostic {
  const body = identityConclusion(source.coordinateSystem, receiving.coordinateSystem, D1F_COORDINATE_SYSTEMS, "COORDINATE_SYSTEM_MISMATCH", "COORDINATE_MISMATCH", "COORDINATE_UNSUPPORTED", "COORDINATE_MISSING");
  return diagnostic("COORDINATES", source.coordinateSystem, receiving.coordinateSystem, body, {
    transformationRequired: body.conclusion === "INCOMPATIBLE" ? false : false,
  });
}

function axisSignDiagnostics(source: D1kR2Metadata, receiving: D1kR2Requirement): D1kR2Diagnostic[] {
  const axis = identityConclusion(source.axisConvention, receiving.axisConvention, D1F_MEMBER_END_RELEASE_AXES, "AXIS_MISMATCH", "AXIS_MISMATCH", "AXIS_UNSUPPORTED", "AXIS_MISSING");
  const sign = identityConclusion(source.signConvention, receiving.signConvention, D1F_SIGN_CONVENTION_FIELDS, "SIGN_CONVENTION_MISMATCH", "SIGN_MISMATCH", "SIGN_UNSUPPORTED", "SIGN_MISSING");
  return [
    diagnostic("AXIS", source.axisConvention, receiving.axisConvention, axis),
    diagnostic("SIGN", source.signConvention, receiving.signConvention, sign),
  ];
}

export function aggregateCompatibility(diagnostics: readonly D1kR2Diagnostic[]): D1kConventionState {
  if (diagnostics.some((row) => row.conclusion === "INCOMPATIBLE")) return "INCOMPATIBLE";
  if (diagnostics.some((row) => row.conclusion === "MISSING")) return "MISSING";
  if (diagnostics.some((row) => row.conclusion === "UNRESOLVED" || !row.supported)) return "UNRESOLVED";
  if (diagnostics.length === 0) return "MISSING";
  return "MATCHING";
}

function collectDiagnostics(source: D1kR2Metadata, receiving: D1kR2Requirement): D1kR2Diagnostic[] {
  if (!receiving.requiredDimensions?.length) fail("REQUIREMENT_DIMENSIONS_REQUIRED");
  const unknown = receiving.requiredDimensions.filter((dimension) => !(D1K_R2_REQUIRED_DIMENSIONS as readonly string[]).includes(dimension));
  if (unknown.length > 0) fail("REQUIREMENT_DIMENSION_UNSUPPORTED");
  const rows: D1kR2Diagnostic[] = [];
  if (receiving.requiredDimensions.includes("SEMANTICS")) rows.push(semanticDiagnostic(source, receiving));
  if (receiving.requiredDimensions.includes("SCHEMA_VERSION")) rows.push(schemaDiagnostic(source, receiving));
  if (receiving.requiredDimensions.includes("UNITS")) rows.push(unitDiagnostic(source, receiving));
  if (receiving.requiredDimensions.includes("COORDINATES")) rows.push(coordinateDiagnostic(source, receiving));
  if (receiving.requiredDimensions.includes("AXIS_SIGN")) rows.push(...axisSignDiagnostics(source, receiving));
  return rows;
}

function resultFingerprint(record: D1kR1InterfaceRecord, diagnostics: readonly D1kR2Diagnostic[], aggregateConclusion: D1kConventionState): string {
  return fingerprintCanonical({
    interfaceId: record.interfaceId,
    interfaceFingerprint: record.fingerprint,
    sourceId: record.sourceId,
    sourceRevision: record.sourceRevision,
    sourceFingerprint: record.sourceFingerprint,
    aggregateConclusion,
    diagnostics: diagnostics.map((row) => ({
      dimension: row.dimension,
      conclusion: row.conclusion,
      reasonCode: row.reasonCode,
      diagnosticKind: row.diagnosticKind,
      sourceIdentity: row.sourceIdentity,
      receivingIdentity: row.receivingIdentity,
      supported: row.supported,
    })),
    semanticRegistry: D1K_R2_SEMANTIC_REGISTRY,
    schemaRegistry: D1K_R2_SCHEMA_REGISTRY,
    conventionStates: D1K_CONVENTION_STATES,
  });
}

export function createD1kR2Store(now: () => string): D1kR2Store {
  return { now, results: [] };
}

export function evaluateInterfaceCompatibility(interfaces: D1kR1Store, store: D1kR2Store, actor: D1kR1Actor, input: D1kR2Input): D1kR2Result {
  if (!actor.actorId.trim() || blockedAuthority(actor.authority)) fail("UNAUTHORIZED");
  if (!input.resultId.trim()) fail("RESULT_IDENTITY_REQUIRED");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, input.interfaceId);
  if (input.expectedInterfaceFingerprint != null && input.expectedInterfaceFingerprint !== record.fingerprint) fail("FINGERPRINT_MISMATCH");
  if (input.expectedSourceFingerprint != null && input.expectedSourceFingerprint !== record.sourceFingerprint) fail("FINGERPRINT_MISMATCH");
  const before = JSON.stringify(record);
  const diagnostics = collectDiagnostics(input.sourceMetadata, input.receivingRequirement);
  const aggregateConclusion = aggregateCompatibility(diagnostics);
  const fingerprint = resultFingerprint(record, diagnostics, aggregateConclusion);
  if (JSON.stringify(record) !== before) fail("SOURCE_MUTATION_REJECTED");
  const existing = store.results.find((row) => row.resultId === input.resultId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("RESULT_ALREADY_BOUND");
  }
  const result: D1kR2Result = {
    resultId: input.resultId,
    interfaceId: record.interfaceId,
    interfaceFingerprint: record.fingerprint,
    sourceId: record.sourceId,
    sourceRevision: record.sourceRevision,
    sourceFingerprint: record.sourceFingerprint,
    sourceAuthority: record.sourceAuthority,
    evidence: record.evidence,
    provenance: record.provenance,
    diagnostics,
    aggregateConclusion,
    humanReviewRequired: record.humanReviewRequired || aggregateConclusion !== "MATCHING",
    engineeringApproval: false,
    designApproval: false,
    sourceEngineeringValidated: false,
    structuralDesignValidated: false,
    sourceCorrect: false,
    compatibilityScore: null,
    fingerprint,
    recordedAt: store.now(),
  };
  store.results.push(result);
  return result;
}

export function reuseCompatibilityResult(interfaces: D1kR1Store, store: D1kR2Store, actor: D1kR1Actor, resultId: string, interfaceId: string): D1kR2Result {
  if (!actor.actorId.trim() || blockedAuthority(actor.authority)) fail("UNAUTHORIZED");
  const result = store.results.find((row) => row.resultId === resultId);
  if (!result) fail("RESULT_NOT_FOUND");
  const record = inspectStructuralInterfaceIdentity(interfaces, actor, interfaceId);
  if (result.interfaceFingerprint !== record.fingerprint || result.sourceFingerprint !== record.sourceFingerprint || result.sourceRevision !== record.sourceRevision) {
    fail("COMPATIBILITY_REEVALUATION_REQUIRED");
  }
  return result;
}
