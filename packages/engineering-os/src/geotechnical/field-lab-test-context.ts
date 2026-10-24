/**
 * EOS-D3-R4 field and laboratory test context.
 * One bounded runtime. Supplied measurements only.
 */
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS,
  D2_REOPENED as ARCH_D2_REOPENED,
  D3_0_CANONICAL_CURRENTNESS_REUSED,
  D3_0_CANONICAL_FINGERPRINT_REUSED,
  D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D3_CURRENTNESS_STATES,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_EQUALS_D1,
  D3_EQUALS_D2_CIVIL_AUTHORITY as ARCH_EQUALS_D2,
  D3_EVIDENCE_PROVENANCE_REQUIRED as ARCH_PROVENANCE_REQUIRED,
  D3_IMPLEMENTATION_PHASES,
  ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER as ARCH_PARAMETER_EQUALS,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER as ARCH_TEST_EQUALS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D3_CONTEXT_AUTHORITY, D3_DISCIPLINE, D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY, type D3R1Actor } from "./identity-foundation";
import { D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R2_EVIDENCE_READY } from "./site-investigation-evidence";
import { D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R3_READY, type D3R3Store } from "./stratigraphy-groundwater-material";

export const D3_R4_STATUS = "FIELD_AND_LAB_TEST_CONTEXT_IMPLEMENTED" as const;
export const D3_R4_MATURITY = "FIELD_AND_LAB_TEST_CONTEXT_IMPLEMENTED" as const;
export const D3_R4_MATURITY_STATE = D3_R4_MATURITY;
export const D3_R4_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D3_R4_FIELD_AND_LAB_TEST_CONTEXT_CLOSEOUT.md" as const;
export const D3_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const D3_R2_INVESTIGATION_EVIDENCE_REUSED = R2_EVIDENCE_READY;
export const D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED = R3_READY;
export const EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED = true as const;
export const EXACT_R2_EVIDENCE_REFERENCE_REQUIRED = true as const;
export const EXACT_R3_CONTEXT_REFERENCE_REQUIRED_WHERE_APPLICABLE = true as const;
export const FLOATING_UPSTREAM_TEST_REFERENCE_ALLOWED = false as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 4 as const;
export const D3_FIELD_LAB_TEST_RUNTIME_IMPLEMENTED = true as const;
export const D3_FIELD_LAB_TEST_RUNTIME_COUNT = 1 as const;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = R3_READY;
export const D3_FIELD_TEST_CONTEXT_IMPLEMENTED = true as const;
export const D3_LAB_TEST_CONTEXT_IMPLEMENTED = true as const;
export const D3_TEST_METHOD_REFERENCE_REQUIRED = true as const;
export const D3_TEST_RESULT_UNIT_REQUIRED_WHERE_QUANTITATIVE = true as const;
export const AI_CAN_INVENT_TEST_METHOD = false as const;
export const AI_CAN_INVENT_TEST_RESULT = false as const;
export const AI_CAN_SILENTLY_CHANGE_TEST_UNIT = false as const;
export const D3_TEST_SAMPLE_SPECIMEN_TRACEABILITY_REQUIRED = true as const;
export const D3_TEST_SAMPLE_SPECIMEN_TRACEABILITY_PRESERVED = true as const;
export const TEST_WITHOUT_GOVERNED_SAMPLE_OR_SOURCE_AUTO_ACCEPTED = false as const;
export const TEST_RESULT_EQUALS_ENGINEERING_PARAMETER = ARCH_TEST_EQUALS;
export const ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER = ARCH_PARAMETER_EQUALS;
export const TEST_RESULT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_AUTOMATICALLY_INTERPRET_TEST_RESULT_AS_AUTHORITATIVE_PARAMETER = false as const;
export const AI_GENERATED_TEST_INTERPRETATION_EQUALS_ENGINEERING_AUTHORITY = false as const;
export const D3_TEST_RESULT_AUTO_MUTATES_R3_STRATIGRAPHY = false as const;
export const D3_TEST_RESULT_AUTO_MUTATES_R3_MATERIAL_CLASSIFICATION = false as const;
export const D3_TEST_RESULT_AUTO_MUTATES_R3_GROUNDWATER_CONTEXT = false as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const AI_CAN_FABRICATE_GEOTECHNICAL_TEST_RESULT = false as const;
export const AI_CAN_APPROVE_GEOTECHNICAL_TEST_RESULT = false as const;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_R4_PROVENANCE_REQUIRED = ARCH_PROVENANCE_REQUIRED;
export const D3_R4_PROVENANCE_PRESERVED = true as const;
export const D3_TEST_RESULT_AUTO_REPOINTED = false as const;
export const SILENT_D3_R4_MUTATION_ALLOWED = false as const;
export const D3_R4_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R4_SCOPE_ENFORCED = true as const;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = false as const;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = false as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_R5_RUNTIME_STARTED = false as const;

export const D3_R4_FIELD_TEST_CATEGORIES = ["SPT", "CPT", "CPTU", "DCP", "FIELD_VANE", "PRESSUREMETER", "PLATE_LOAD", "PERMEABILITY_INFILTRATION", "IN_SITU_DENSITY", "OTHER_FIELD"] as const;
export const D3_R4_LAB_TEST_CATEGORIES = ["MOISTURE_CONTENT", "PARTICLE_SIZE_DISTRIBUTION", "ATTERBERG_LIMITS", "DENSITY", "COMPACTION", "CBR", "CONSOLIDATION", "SHEAR_STRENGTH", "TRIAXIAL", "DIRECT_SHEAR", "PERMEABILITY", "ROCK", "CHEMICAL_AGGRESSIVITY", "OTHER_LAB"] as const;

export const D3_PARAMETER_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_BEARING_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_STABILITY_RUNTIME_COUNT = 0 as const;
export const D3_EARTH_PRESSURE_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 0 as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D3_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D3_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D2_REOPENED = ARCH_D2_REOPENED;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_R5_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R5_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[4];
export const D3_R5_PHASE_TYPE = "GEOTECHNICAL_PARAMETER_CONTEXT" as const;
export const D3_R5_CANONICAL_SCOPE = "Implement governed Geotechnical parameter context using exact R1 identities and explicit R2-R4 evidence/test references. Record authoritative or candidate parameter values, units, source basis, derivation/reference method where supplied, applicability, authority, provenance, currentness and limitations while preserving the distinction between raw test results, interpreted parameters and validated design parameters. Do not perform foundation/bearing/settlement/slope calculations, issue foundation recommendations, automatically validate parameter values, or start D4-D9." as const;
export const D3_R5_STARTED = false as const;
export const D3_R4_READY_FOR_NEXT_PHASE = true as const;
export const D3_R4_NEXT_PHASE = D3_R5_CANONICAL_PHASE;
export const D3_R4_NEXT_PHASE_TYPE = D3_R5_PHASE_TYPE;
export const D3_R4_CANONICAL_NEXT_PHASE = D3_R5_CANONICAL_PHASE;
export const D3_R4_CANONICAL_NEXT_PHASE_SCOPE = D3_R5_CANONICAL_SCOPE;
export const D3_R4_BLOCKER = "NONE" as const;
export const D3_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);

type Prohibited = {
  inventMethod?: boolean;
  inventResult?: boolean;
  fabricateResult?: boolean;
  silentUnitChange?: boolean;
  aiGenerated?: boolean;
  deriveParameter?: boolean;
  sptCorrelation?: boolean;
  cptCorrelation?: boolean;
  cohesion?: unknown;
  frictionAngle?: unknown;
  modulus?: unknown;
  undrainedStrength?: unknown;
  designPermeability?: unknown;
  designCbr?: unknown;
  allowableBearing?: unknown;
  settlementParameter?: unknown;
  slopeParameter?: unknown;
  parameters?: unknown;
  foundationRecommendation?: boolean;
  excavationRecommendation?: boolean;
  slopeRecommendation?: boolean;
  groundImprovementRecommendation?: boolean;
  foundationCalculation?: boolean;
  bearingCapacity?: boolean;
  settlementCalculation?: boolean;
  slopeStability?: boolean;
  earthPressure?: boolean;
  groundImprovementDesign?: boolean;
  validation?: boolean;
  approval?: boolean;
  certification?: boolean;
  repoint?: boolean;
  mutateStratigraphy?: boolean;
  mutateMaterial?: boolean;
  mutateGroundwater?: boolean;
  requirementsChange?: boolean;
  disciplineInterface?: boolean;
  d9Reasoning?: boolean;
};

type Upstream = {
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  contextId: string;
  objectId: string;
  evidenceReferenceIds: readonly string[];
  stratigraphyId?: string | null;
  materialClassificationId?: string | null;
  groundwaterContextId?: string | null;
  methodReference: string;
  measuredResult: string;
  unit: string;
  originalMeasuredResult?: string | null;
  originalUnit?: string | null;
  transformationProvenance?: string | null;
  provider: string;
  testDate: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
};

export type D3R4FieldInput = Prohibited & Upstream & {
  fieldTestId: string;
  testCategory: string;
  locationContextId: string;
  depthOrElevation?: string | null;
  specimenReference?: string | null;
  predecessorFieldTestId?: string | null;
};

export type D3R4LabInput = Prohibited & Upstream & {
  labTestId: string;
  testCategory: string;
  specimenReference: string;
  predecessorLabTestId?: string | null;
};

type Conversion = { originalMeasuredResult: string | null; originalUnit: string | null; transformationProvenance: string | null };

export type D3R4FieldRecord = Conversion & {
  fieldTestId: string;
  testCategory: (typeof D3_R4_FIELD_TEST_CATEGORIES)[number];
  contextId: string;
  objectId: string;
  locationContextId: string;
  stratigraphyId: string | null;
  materialClassificationId: string | null;
  groundwaterContextId: string | null;
  depthOrElevation: string | null;
  specimenReference: string | null;
  methodReference: string;
  measuredResult: string;
  unit: string;
  evidenceReferenceIds: readonly string[];
  provider: string;
  testDate: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  engineeringParameter: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorFieldTestId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R4LabRecord = Conversion & {
  labTestId: string;
  testCategory: (typeof D3_R4_LAB_TEST_CATEGORIES)[number];
  contextId: string;
  objectId: string;
  stratigraphyId: string | null;
  materialClassificationId: string | null;
  groundwaterContextId: string | null;
  specimenReference: string;
  methodReference: string;
  measuredResult: string;
  unit: string;
  evidenceReferenceIds: readonly string[];
  provider: string;
  testDate: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  engineeringParameter: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorLabTestId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R4History = {
  historyId: string;
  subjectKind: "FIELD_TEST" | "LAB_TEST";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R4Store = {
  r3: D3R3Store;
  now: () => string;
  fieldTests: D3R4FieldRecord[];
  labTests: D3R4LabRecord[];
  history: D3R4History[];
};

function fail(code: string): never {
  throw new Error(code);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isCurrentness(value: string): value is (typeof D3_CURRENTNESS_STATES)[number] {
  return (D3_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function currentnessOf(value: string): (typeof D3_CURRENTNESS_STATES)[number] {
  const token = value.trim();
  if (!isCurrentness(token)) fail("CURRENTNESS_INVALID");
  return token;
}

function optionalExplicit(value: string | null | undefined, code: string): string | null {
  if (value == null || value === "") return null;
  return explicit(value, code);
}

function assertActor(actor: D3R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_GEOTECHNICAL_AUTHORITY");
  if (actor.authority === "GEOTECHNICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_GEOTECHNICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D3_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D3R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.inventMethod === true) fail("TEST_METHOD_NOT_INVENTED");
  if (input.inventResult === true) fail("TEST_RESULT_NOT_INVENTED");
  if (input.fabricateResult === true) fail("TEST_RESULT_NOT_FABRICATED");
  if (input.silentUnitChange === true) fail("SILENT_UNIT_CHANGE_REJECTED");
  if (input.aiGenerated === true) fail("AI_TEST_INTERPRETATION_NOT_AUTHORITY");
  if (input.deriveParameter === true || input.sptCorrelation === true || input.cptCorrelation === true || input.parameters != null || input.cohesion != null || input.frictionAngle != null || input.modulus != null || input.undrainedStrength != null || input.designPermeability != null || input.designCbr != null || input.allowableBearing != null || input.settlementParameter != null || input.slopeParameter != null) fail("PARAMETER_NOT_IN_R4");
  if (input.foundationRecommendation === true) fail("FOUNDATION_RECOMMENDATION_NOT_IN_R4");
  if (input.excavationRecommendation === true) fail("EXCAVATION_RECOMMENDATION_NOT_IN_R4");
  if (input.slopeRecommendation === true) fail("SLOPE_RECOMMENDATION_NOT_IN_R4");
  if (input.groundImprovementRecommendation === true) fail("GROUND_IMPROVEMENT_RECOMMENDATION_NOT_IN_R4");
  if (input.foundationCalculation === true) fail("FOUNDATION_CALCULATION_NOT_IN_R4");
  if (input.bearingCapacity === true) fail("BEARING_CAPACITY_NOT_IN_R4");
  if (input.settlementCalculation === true) fail("SETTLEMENT_CALCULATION_NOT_IN_R4");
  if (input.slopeStability === true) fail("SLOPE_STABILITY_NOT_IN_R4");
  if (input.earthPressure === true) fail("EARTH_PRESSURE_NOT_IN_R4");
  if (input.groundImprovementDesign === true) fail("GROUND_IMPROVEMENT_DESIGN_NOT_IN_R4");
  if (input.validation === true) fail("VALIDATION_NOT_IN_R4");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R4");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R4");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.mutateStratigraphy === true || input.mutateMaterial === true || input.mutateGroundwater === true) fail("R3_MUTATION_REJECTED");
  if (input.requirementsChange === true) fail("REQUIREMENTS_NOT_IN_R4");
  if (input.disciplineInterface === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R4");
}

function conversionOf(input: Upstream): Conversion {
  const present = [input.originalMeasuredResult, input.originalUnit, input.transformationProvenance].some((value) => value != null && value !== "");
  if (!present) return { originalMeasuredResult: null, originalUnit: null, transformationProvenance: null };
  return {
    originalMeasuredResult: explicit(input.originalMeasuredResult ?? "", "ORIGINAL_RESULT_REQUIRED"),
    originalUnit: explicit(input.originalUnit ?? "", "ORIGINAL_UNIT_REQUIRED"),
    transformationProvenance: explicit(input.transformationProvenance ?? "", "TRANSFORMATION_PROVENANCE_REQUIRED"),
  };
}

function requireContext(store: D3R4Store, actor: D3R1Actor, contextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D3R4Store, actor: D3R1Actor, contextId: string, objectId: string, allowed: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const object = store.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (!allowed.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId || object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("R1_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireEvidence(store: D3R4Store, actor: D3R1Actor, contextId: string, ids: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], requiredKinds: readonly string[]): string[] {
  if (!ids || ids.length === 0) fail("TEST_WITHOUT_SAMPLE_OR_SOURCE");
  const resolved: string[] = [];
  for (const raw of ids) {
    const id = explicit(raw, "R2_EVIDENCE_REQUIRED");
    if (resolved.includes(id)) fail("DUPLICATE_EVIDENCE_LINK");
    const row = store.r3.r2.evidence.find((item) => item.evidenceReferenceId === id);
    if (!row) fail("R2_EVIDENCE_NOT_FOUND");
    if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId || row.contextId !== contextId) fail("R2_EVIDENCE_CONTEXT_MISMATCH");
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_EVIDENCE_NOT_CURRENT");
    resolved.push(row.evidenceReferenceId);
  }
  for (const kind of requiredKinds) {
    if (!resolved.some((id) => store.r3.r2.evidence.find((item) => item.evidenceReferenceId === id)?.evidenceKind === kind)) fail("R2_EVIDENCE_KIND_REQUIRED");
  }
  return resolved;
}

function requireLocation(store: D3R4Store, actor: D3R1Actor, contextId: string, locationContextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(locationContextId, "R2_LOCATION_REQUIRED");
  const row = store.r3.r2.locations.find((item) => item.locationContextId === id);
  if (!row) fail("R2_LOCATION_NOT_FOUND");
  if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R2_EVIDENCE_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_LOCATION_NOT_CURRENT");
  return row.locationContextId;
}

function optionalId(store: D3R4Store, actor: D3R1Actor, contextId: string, raw: string | null | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], kind: "STRATIGRAPHY" | "MATERIAL" | "GROUNDWATER"): string | null {
  if (raw == null || raw === "") return null;
  const id = explicit(raw, `R3_${kind}_REQUIRED`);
  const row = kind === "STRATIGRAPHY"
    ? store.r3.stratigraphy.find((item) => item.stratigraphyId === id)
    : kind === "MATERIAL"
      ? store.r3.materials.find((item) => item.materialClassificationId === id)
      : store.r3.groundwater.find((item) => item.groundwaterContextId === id);
  if (!row) fail(`R3_${kind}_NOT_FOUND`);
  if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R3_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail(`R3_${kind}_NOT_CURRENT`);
  return kind === "STRATIGRAPHY" ? (row as { stratigraphyId: string }).stratigraphyId : kind === "MATERIAL" ? (row as { materialClassificationId: string }).materialClassificationId : (row as { groundwaterContextId: string }).groundwaterContextId;
}

function remember(store: D3R4Store, subjectKind: D3R4History["subjectKind"], subjectId: string, action: D3R4History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

export function createD3R4Store(r3: D3R3Store, now: () => string = () => r3.now()): D3R4Store {
  return { r3, now, fieldTests: [], labTests: [], history: [] };
}

export function recordFieldTestResult(store: D3R4Store, actor: D3R1Actor, input: D3R4FieldInput): D3R4FieldRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["FIELD_TEST_RECORD"], citedCurrentness);
  const locationContextId = requireLocation(store, actor, context.contextId, input.locationContextId, citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness, ["FIELD_TEST_DATA"]);
  const stratigraphyId = optionalId(store, actor, context.contextId, input.stratigraphyId, citedCurrentness, "STRATIGRAPHY");
  const materialClassificationId = optionalId(store, actor, context.contextId, input.materialClassificationId, citedCurrentness, "MATERIAL");
  const groundwaterContextId = optionalId(store, actor, context.contextId, input.groundwaterContextId, citedCurrentness, "GROUNDWATER");
  const fieldTestId = explicit(input.fieldTestId, "FIELD_TEST_REQUIRED");
  const testCategory = explicit(input.testCategory, "FIELD_TEST_CATEGORY_REQUIRED");
  if (!(D3_R4_FIELD_TEST_CATEGORIES as readonly string[]).includes(testCategory)) fail("FIELD_TEST_CATEGORY_NOT_ALLOWLISTED");
  const methodReference = explicit(input.methodReference, "TEST_METHOD_REQUIRED");
  const measuredResult = explicit(input.measuredResult, "TEST_RESULT_REQUIRED");
  const unit = explicit(input.unit, "TEST_UNIT_REQUIRED");
  const depthOrElevation = optionalExplicit(input.depthOrElevation, "DEPTH_INVALID");
  const specimenReference = optionalExplicit(input.specimenReference, "SPECIMEN_INVALID");
  const provider = explicit(input.provider, "PROVIDER_REQUIRED");
  const testDate = explicit(input.testDate, "TEST_DATE_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const conversion = conversionOf(input);
  const predecessor = input.predecessorFieldTestId ? store.fieldTests.find((row) => row.fieldTestId === input.predecessorFieldTestId) : null;
  if (input.predecessorFieldTestId) {
    if (!predecessor || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail(predecessor ? "R1_CONTEXT_MISMATCH" : "FIELD_TEST_NOT_FOUND");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    fieldTestId, testCategory, contextId: context.contextId, objectId: object.objectId, locationContextId, stratigraphyId, materialClassificationId, groundwaterContextId, depthOrElevation, specimenReference, methodReference, measuredResult, unit, ...conversion, evidenceReferenceIds, provider, testDate, limitations, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, predecessorFieldTestId: predecessor?.fieldTestId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.fieldTests.find((row) => row.fieldTestId === fieldTestId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("FIELD_TEST_ALREADY_RECORDED");
  if (store.fieldTests.some((row) => row.recordStatus === "CURRENT" && row.fieldTestId !== predecessor?.fieldTestId && row.objectId === object.objectId && row.testCategory === testCategory && row.methodReference === methodReference && row.measuredResult === measuredResult && row.unit === unit && row.depthOrElevation === depthOrElevation)) fail("DUPLICATE_FIELD_TEST_REJECTED");
  const record: D3R4FieldRecord = Object.freeze({
    fieldTestId, testCategory: testCategory as D3R4FieldRecord["testCategory"], contextId: context.contextId, objectId: object.objectId, locationContextId, stratigraphyId, materialClassificationId, groundwaterContextId, depthOrElevation, specimenReference, methodReference, measuredResult, unit, ...conversion, evidenceReferenceIds, provider, testDate, limitations, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, geotechnicalEngineeringAuthority: false, engineeringValidated: false, engineeringParameter: false, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", predecessorFieldTestId: predecessor?.fieldTestId ?? null, tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.fieldTests.findIndex((row) => row.fieldTestId === predecessor.fieldTestId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.fieldTests[index] = superseded;
    remember(store, "FIELD_TEST", superseded.fieldTestId, "SUPERSEDED", superseded.fingerprint);
  }
  store.fieldTests.push(record);
  remember(store, "FIELD_TEST", record.fieldTestId, "CREATED", record.fingerprint);
  return record;
}

export function recordLaboratoryTestResult(store: D3R4Store, actor: D3R1Actor, input: D3R4LabInput): D3R4LabRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["LAB_TEST_RECORD"], citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness, ["LABORATORY_REPORT"]);
  const stratigraphyId = optionalId(store, actor, context.contextId, input.stratigraphyId, citedCurrentness, "STRATIGRAPHY");
  const materialClassificationId = optionalId(store, actor, context.contextId, input.materialClassificationId, citedCurrentness, "MATERIAL");
  const groundwaterContextId = optionalId(store, actor, context.contextId, input.groundwaterContextId, citedCurrentness, "GROUNDWATER");
  const labTestId = explicit(input.labTestId, "LAB_TEST_REQUIRED");
  const testCategory = explicit(input.testCategory, "LAB_TEST_CATEGORY_REQUIRED");
  if (!(D3_R4_LAB_TEST_CATEGORIES as readonly string[]).includes(testCategory)) fail("LAB_TEST_CATEGORY_NOT_ALLOWLISTED");
  const specimenReference = explicit(input.specimenReference, "SPECIMEN_REQUIRED");
  const methodReference = explicit(input.methodReference, "TEST_METHOD_REQUIRED");
  const measuredResult = explicit(input.measuredResult, "TEST_RESULT_REQUIRED");
  const unit = explicit(input.unit, "TEST_UNIT_REQUIRED");
  const provider = explicit(input.provider, "PROVIDER_REQUIRED");
  const testDate = explicit(input.testDate, "TEST_DATE_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const conversion = conversionOf(input);
  const predecessor = input.predecessorLabTestId ? store.labTests.find((row) => row.labTestId === input.predecessorLabTestId) : null;
  if (input.predecessorLabTestId) {
    if (!predecessor || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail(predecessor ? "R1_CONTEXT_MISMATCH" : "LAB_TEST_NOT_FOUND");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    labTestId, testCategory, contextId: context.contextId, objectId: object.objectId, stratigraphyId, materialClassificationId, groundwaterContextId, specimenReference, methodReference, measuredResult, unit, ...conversion, evidenceReferenceIds, provider, testDate, limitations, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, predecessorLabTestId: predecessor?.labTestId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.labTests.find((row) => row.labTestId === labTestId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("LAB_TEST_ALREADY_RECORDED");
  if (store.labTests.some((row) => row.recordStatus === "CURRENT" && row.labTestId !== predecessor?.labTestId && row.objectId === object.objectId && row.testCategory === testCategory && row.specimenReference === specimenReference && row.methodReference === methodReference && row.measuredResult === measuredResult && row.unit === unit)) fail("DUPLICATE_LAB_TEST_REJECTED");
  const record: D3R4LabRecord = Object.freeze({
    labTestId, testCategory: testCategory as D3R4LabRecord["testCategory"], contextId: context.contextId, objectId: object.objectId, stratigraphyId, materialClassificationId, groundwaterContextId, specimenReference, methodReference, measuredResult, unit, ...conversion, evidenceReferenceIds, provider, testDate, limitations, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, geotechnicalEngineeringAuthority: false, engineeringValidated: false, engineeringParameter: false, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", predecessorLabTestId: predecessor?.labTestId ?? null, tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.labTests.findIndex((row) => row.labTestId === predecessor.labTestId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.labTests[index] = superseded;
    remember(store, "LAB_TEST", superseded.labTestId, "SUPERSEDED", superseded.fingerprint);
  }
  store.labTests.push(record);
  remember(store, "LAB_TEST", record.labTestId, "CREATED", record.fingerprint);
  return record;
}

export function mutateFieldOrLabTest(): never {
  return fail("R4_MUTATION_REJECTED");
}

export function repointTestResult(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function deriveGeotechnicalParameter(): never {
  return fail("PARAMETER_NOT_IN_R4");
}
