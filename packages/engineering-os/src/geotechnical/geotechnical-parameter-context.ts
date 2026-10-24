/**
 * EOS-D3-R5 Geotechnical parameter context.
 * One bounded runtime. Supplied parameter records only.
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
import { D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R3_READY } from "./stratigraphy-groundwater-material";
import { D3_FIELD_LAB_TEST_RUNTIME_READY as R4_TEST_READY, type D3R4Store } from "./field-lab-test-context";

export const D3_R5_STATUS = "GEOTECHNICAL_PARAMETER_CONTEXT_IMPLEMENTED" as const;
export const D3_R5_MATURITY = "GEOTECHNICAL_PARAMETER_CONTEXT_IMPLEMENTED" as const;
export const D3_R5_MATURITY_STATE = D3_R5_MATURITY;
export const D3_R5_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D3_R5_GEOTECHNICAL_PARAMETER_CONTEXT_CLOSEOUT.md" as const;
export const D3_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const D3_R2_INVESTIGATION_EVIDENCE_REUSED = R2_EVIDENCE_READY;
export const D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED = R3_READY;
export const D3_R4_FIELD_LAB_TEST_REUSED = R4_TEST_READY;
export const EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED = true as const;
export const EXACT_R2_EVIDENCE_REFERENCE_REQUIRED = true as const;
export const EXACT_R3_CONTEXT_REFERENCE_REQUIRED_WHERE_APPLICABLE = true as const;
export const EXACT_R4_TEST_REFERENCE_REQUIRED_WHERE_APPLICABLE = true as const;
export const FLOATING_PARAMETER_SOURCE_REFERENCE_ALLOWED = false as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 5 as const;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_IMPLEMENTED = true as const;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_COUNT = 1 as const;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = R3_READY;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = R4_TEST_READY;
export const TEST_RESULT_EQUALS_ENGINEERING_PARAMETER = ARCH_TEST_EQUALS;
export const ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER = ARCH_PARAMETER_EQUALS;
export const CANDIDATE_PARAMETER_EQUALS_AUTHORITATIVE_PARAMETER = false as const;
export const AUTHORITATIVE_PARAMETER_EQUALS_VALIDATED_PARAMETER = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_GEOTECHNICAL_PARAMETER = false as const;
export const AI_CAN_PROMOTE_CANDIDATE_PARAMETER_TO_AUTHORITATIVE = false as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const D3_PARAMETER_SOURCE_BASIS_REQUIRED = true as const;
export const D3_PARAMETER_DERIVATION_METHOD_TRACEABLE = true as const;
export const D3_AUTOMATIC_PARAMETER_DERIVATION_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_INFERENCE_RUNTIME_COUNT = 0 as const;
export const R4_TEST_RESULT_AUTO_PROMOTED_TO_R5_PARAMETER = false as const;
export const R4_TEST_RESULT_AUTO_VALIDATED_AS_DESIGN_PARAMETER = false as const;
export const D3_PARAMETER_APPLICABILITY_EXPLICIT = true as const;
export const D3_PARAMETER_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const PARAMETER_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const PARAMETER_PRESENT_EQUALS_CONFORMANT = false as const;
export const PARAMETER_PRESENT_EQUALS_APPROVED = false as const;
export const PARAMETER_PRESENT_EQUALS_CERTIFIED = false as const;
export const D3_PARAMETER_AUTO_MUTATES_R3_STRATIGRAPHY = false as const;
export const D3_PARAMETER_AUTO_MUTATES_R3_MATERIAL_CLASSIFICATION = false as const;
export const D3_PARAMETER_AUTO_MUTATES_R3_GROUNDWATER_CONTEXT = false as const;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_R5_PROVENANCE_REQUIRED = ARCH_PROVENANCE_REQUIRED;
export const D3_R5_PROVENANCE_PRESERVED = true as const;
export const D3_PARAMETER_AUTO_REPOINTED = false as const;
export const SILENT_D3_R5_MUTATION_ALLOWED = false as const;
export const D3_R5_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R5_SCOPE_ENFORCED = true as const;
export const D3_R5_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D3_R5_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D3_R5_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = false as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_R6_RUNTIME_STARTED = false as const;

export const D3_R5_PARAMETER_CATEGORIES = ["UNIT_WEIGHT", "BULK_DENSITY", "DRY_DENSITY", "SATURATED_DENSITY", "COHESION", "EFFECTIVE_COHESION", "FRICTION_ANGLE", "EFFECTIVE_FRICTION_ANGLE", "UNDRAINED_SHEAR_STRENGTH", "STIFFNESS_MODULUS", "POISSON_RATIO", "COMPRESSIBILITY", "CONSOLIDATION", "PERMEABILITY", "SUBGRADE", "BEARING_RELATED", "SETTLEMENT_RELATED", "LATERAL_SOIL", "ROCK", "GROUNDWATER_DESIGN_ASSUMPTION", "OTHER"] as const;
export const D3_R5_PARAMETER_STATUSES = ["CANDIDATE", "GOVERNED_ADOPTED"] as const;
export const D3_R5_SOURCE_BASES = ["DIRECT_TEST_RESULT", "CORRELATION", "PUBLISHED_METHOD", "STANDARD", "PRIOR_ENGINEERING_INTERPRETATION", "PROJECT_SPECIFIC_JUDGMENT", "GOVERNED_ASSUMPTION"] as const;
const TEST_LINKED_BASES = new Set(["DIRECT_TEST_RESULT", "CORRELATION"]);

export const D3_PARAMETER_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_CALCULATION_RUNTIME_COUNT = 0 as const;
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
export const UNAUTHORIZED_D3_R6_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R6_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[5];
export const D3_R6_PHASE_TYPE = "FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT" as const;
export const D3_R6_CANONICAL_SCOPE = "Implement bounded governed Geotechnical foundation, excavation and slope engineering context using exact R1-R5 references. Record foundation-related Geotechnical context, excavation constraints, slope/geohazard context and supplied engineering recommendations/criteria with authority, evidence, provenance, currentness and limitations. Do not perform bearing-capacity, settlement, slope-stability or earth-pressure calculations, automatically generate recommendations, validate engineering, or start D4-D9." as const;
export const D3_R6_STARTED = false as const;
export const D3_R5_READY_FOR_NEXT_PHASE = true as const;
export const D3_R5_NEXT_PHASE = D3_R6_CANONICAL_PHASE;
export const D3_R5_NEXT_PHASE_TYPE = D3_R6_PHASE_TYPE;
export const D3_R5_CANONICAL_NEXT_PHASE = D3_R6_CANONICAL_PHASE;
export const D3_R5_CANONICAL_NEXT_PHASE_SCOPE = D3_R6_CANONICAL_SCOPE;
export const D3_R5_BLOCKER = "NONE" as const;
export const D3_R5_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);
const BROAD_APPLICABILITY = new Set(["all", "any", "everywhere", "unrestricted"]);

type Prohibited = {
  inventAuthoritative?: boolean;
  promoteCandidate?: boolean;
  aiGenerated?: boolean;
  autoPromoteFromTest?: boolean;
  autoValidateTest?: boolean;
  automaticDerivation?: boolean;
  inference?: boolean;
  propagateOutsideApplicability?: boolean;
  validated?: boolean;
  conformant?: boolean;
  approved?: boolean;
  certified?: boolean;
  silentUnitChange?: boolean;
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
  passToD1?: boolean;
  passToD2?: boolean;
  requirementsChange?: boolean;
  disciplineInterface?: boolean;
  d9Reasoning?: boolean;
};

export type D3R5ParameterInput = Prohibited & {
  parameterId: string;
  parameterCategory: string;
  parameterStatus: string;
  contextId: string;
  objectId: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  stratigraphyId?: string | null;
  materialClassificationId?: string | null;
  groundwaterContextId?: string | null;
  fieldTestId?: string | null;
  labTestId?: string | null;
  evidenceReferenceIds: readonly string[];
  value: string;
  unit: string;
  originalValue?: string | null;
  originalUnit?: string | null;
  transformationProvenance?: string | null;
  citedMeasuredResult?: string | null;
  citedUnit?: string | null;
  sourceBasis: string;
  derivationMethod: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorParameterId?: string | null;
};

type Conversion = { originalValue: string | null; originalUnit: string | null; transformationProvenance: string | null };

export type D3R5ParameterRecord = Conversion & {
  parameterId: string;
  parameterCategory: (typeof D3_R5_PARAMETER_CATEGORIES)[number];
  parameterStatus: (typeof D3_R5_PARAMETER_STATUSES)[number];
  candidate: boolean;
  authoritative: boolean;
  validatedDesignParameter: false;
  contextId: string;
  objectId: string;
  stratigraphyId: string | null;
  materialClassificationId: string | null;
  groundwaterContextId: string | null;
  fieldTestId: string | null;
  labTestId: string | null;
  evidenceReferenceIds: readonly string[];
  value: string;
  unit: string;
  sourceBasis: (typeof D3_R5_SOURCE_BASES)[number];
  derivationMethod: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  aiGeneratedCandidate: boolean;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  testResult: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorParameterId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R5History = {
  historyId: string;
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R5Store = {
  r4: D3R4Store;
  now: () => string;
  parameters: D3R5ParameterRecord[];
  history: D3R5History[];
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
  if (input.inventAuthoritative === true) fail("AI_CANNOT_INVENT_AUTHORITATIVE_PARAMETER");
  if (input.promoteCandidate === true) fail("AI_CANNOT_PROMOTE_CANDIDATE");
  if (input.autoPromoteFromTest === true) fail("R4_TEST_NOT_AUTO_PROMOTED");
  if (input.autoValidateTest === true) fail("R4_TEST_NOT_AUTO_VALIDATED");
  if (input.automaticDerivation === true) fail("AUTOMATIC_DERIVATION_NOT_IN_R5");
  if (input.inference === true) fail("PARAMETER_INFERENCE_NOT_IN_R5");
  if (input.propagateOutsideApplicability === true) fail("PARAMETER_NOT_PROPAGATED");
  if (input.validated === true || input.validation === true) fail("VALIDATION_NOT_IN_R5");
  if (input.conformant === true) fail("CONFORMANCE_NOT_IN_R5");
  if (input.approved === true || input.approval === true) fail("APPROVAL_NOT_IN_R5");
  if (input.certified === true || input.certification === true) fail("CERTIFICATION_NOT_IN_R5");
  if (input.silentUnitChange === true) fail("SILENT_UNIT_CHANGE_REJECTED");
  if (input.foundationRecommendation === true) fail("FOUNDATION_RECOMMENDATION_NOT_IN_R5");
  if (input.excavationRecommendation === true) fail("EXCAVATION_RECOMMENDATION_NOT_IN_R5");
  if (input.slopeRecommendation === true) fail("SLOPE_RECOMMENDATION_NOT_IN_R5");
  if (input.groundImprovementRecommendation === true) fail("GROUND_IMPROVEMENT_RECOMMENDATION_NOT_IN_R5");
  if (input.foundationCalculation === true) fail("FOUNDATION_CALCULATION_NOT_IN_R5");
  if (input.bearingCapacity === true) fail("BEARING_CAPACITY_NOT_IN_R5");
  if (input.settlementCalculation === true) fail("SETTLEMENT_CALCULATION_NOT_IN_R5");
  if (input.slopeStability === true) fail("SLOPE_STABILITY_NOT_IN_R5");
  if (input.earthPressure === true) fail("EARTH_PRESSURE_NOT_IN_R5");
  if (input.groundImprovementDesign === true) fail("GROUND_IMPROVEMENT_DESIGN_NOT_IN_R5");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.mutateStratigraphy === true || input.mutateMaterial === true || input.mutateGroundwater === true) fail("R3_MUTATION_REJECTED");
  if (input.passToD1 === true || input.passToD2 === true || input.disciplineInterface === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R5");
  if (input.requirementsChange === true) fail("REQUIREMENTS_NOT_IN_R5");
}

function conversionOf(input: D3R5ParameterInput): Conversion {
  const present = [input.originalValue, input.originalUnit, input.transformationProvenance].some((value) => value != null && value !== "");
  if (!present) return { originalValue: null, originalUnit: null, transformationProvenance: null };
  return {
    originalValue: explicit(input.originalValue ?? "", "ORIGINAL_VALUE_REQUIRED"),
    originalUnit: explicit(input.originalUnit ?? "", "ORIGINAL_UNIT_REQUIRED"),
    transformationProvenance: explicit(input.transformationProvenance ?? "", "TRANSFORMATION_PROVENANCE_REQUIRED"),
  };
}

function requireContext(store: D3R5Store, actor: D3R1Actor, contextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D3R5Store, actor: D3R1Actor, contextId: string, objectId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const object = store.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.objectType !== "GEOTECHNICAL_PARAMETER_SET") fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId || object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("R1_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireEvidence(store: D3R5Store, actor: D3R1Actor, contextId: string, ids: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]): string[] {
  if (!ids || ids.length === 0) fail("PARAMETER_WITHOUT_SOURCE");
  const resolved: string[] = [];
  for (const raw of ids) {
    const id = explicit(raw, "R2_EVIDENCE_REQUIRED");
    if (resolved.includes(id)) fail("DUPLICATE_EVIDENCE_LINK");
    const row = store.r4.r3.r2.evidence.find((item) => item.evidenceReferenceId === id);
    if (!row) fail("R2_EVIDENCE_NOT_FOUND");
    if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId || row.contextId !== contextId) fail("R2_EVIDENCE_CONTEXT_MISMATCH");
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_EVIDENCE_NOT_CURRENT");
    resolved.push(row.evidenceReferenceId);
  }
  return resolved;
}

function optionalContextId(store: D3R5Store, actor: D3R1Actor, contextId: string, raw: string | null | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], kind: "STRATIGRAPHY" | "MATERIAL" | "GROUNDWATER"): string | null {
  if (raw == null || raw === "") return null;
  const id = explicit(raw, `R3_${kind}_REQUIRED`);
  const row = kind === "STRATIGRAPHY"
    ? store.r4.r3.stratigraphy.find((item) => item.stratigraphyId === id)
    : kind === "MATERIAL"
      ? store.r4.r3.materials.find((item) => item.materialClassificationId === id)
      : store.r4.r3.groundwater.find((item) => item.groundwaterContextId === id);
  if (!row) fail(`R3_${kind}_NOT_FOUND`);
  if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R3_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail(`R3_${kind}_NOT_CURRENT`);
  return kind === "STRATIGRAPHY" ? (row as { stratigraphyId: string }).stratigraphyId : kind === "MATERIAL" ? (row as { materialClassificationId: string }).materialClassificationId : (row as { groundwaterContextId: string }).groundwaterContextId;
}

function requireFieldTest(store: D3R5Store, actor: D3R1Actor, contextId: string, raw: string | null | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], evidenceReferenceIds: readonly string[], citedMeasuredResult: string | null, citedUnit: string | null): string | null {
  if (raw == null || raw === "") return null;
  const id = explicit(raw, "R4_FIELD_TEST_REQUIRED");
  const row = store.r4.fieldTests.find((item) => item.fieldTestId === id);
  if (!row) fail("R4_FIELD_TEST_NOT_FOUND");
  if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R4_TEST_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R4_FIELD_TEST_NOT_CURRENT");
  if (!row.evidenceReferenceIds.every((evidenceId) => evidenceReferenceIds.includes(evidenceId))) fail("R4_TEST_EVIDENCE_MISMATCH");
  if (citedMeasuredResult != null && citedMeasuredResult !== row.measuredResult) fail("SOURCE_VALUE_MISMATCH");
  if (citedUnit != null && citedUnit !== row.unit) fail("SOURCE_UNIT_MISMATCH");
  return row.fieldTestId;
}

function requireLabTest(store: D3R5Store, actor: D3R1Actor, contextId: string, raw: string | null | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], evidenceReferenceIds: readonly string[], citedMeasuredResult: string | null, citedUnit: string | null): string | null {
  if (raw == null || raw === "") return null;
  const id = explicit(raw, "R4_LAB_TEST_REQUIRED");
  const row = store.r4.labTests.find((item) => item.labTestId === id);
  if (!row) fail("R4_LAB_TEST_NOT_FOUND");
  if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R4_TEST_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R4_LAB_TEST_NOT_CURRENT");
  if (!row.evidenceReferenceIds.every((evidenceId) => evidenceReferenceIds.includes(evidenceId))) fail("R4_TEST_EVIDENCE_MISMATCH");
  if (citedMeasuredResult != null && citedMeasuredResult !== row.measuredResult) fail("SOURCE_VALUE_MISMATCH");
  if (citedUnit != null && citedUnit !== row.unit) fail("SOURCE_UNIT_MISMATCH");
  return row.labTestId;
}

function remember(store: D3R5Store, subjectId: string, action: D3R5History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectId, action, fingerprint, recordedAt: store.now() });
}

export function createD3R5Store(r4: D3R4Store, now: () => string = () => r4.now()): D3R5Store {
  return { r4, now, parameters: [], history: [] };
}

export function recordGeotechnicalParameter(store: D3R5Store, actor: D3R1Actor, input: D3R5ParameterInput): D3R5ParameterRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness);
  const stratigraphyId = optionalContextId(store, actor, context.contextId, input.stratigraphyId, citedCurrentness, "STRATIGRAPHY");
  const materialClassificationId = optionalContextId(store, actor, context.contextId, input.materialClassificationId, citedCurrentness, "MATERIAL");
  const groundwaterContextId = optionalContextId(store, actor, context.contextId, input.groundwaterContextId, citedCurrentness, "GROUNDWATER");
  const parameterId = explicit(input.parameterId, "PARAMETER_REQUIRED");
  const parameterCategory = explicit(input.parameterCategory, "PARAMETER_CATEGORY_REQUIRED");
  if (!(D3_R5_PARAMETER_CATEGORIES as readonly string[]).includes(parameterCategory)) fail("PARAMETER_CATEGORY_NOT_ALLOWLISTED");
  const parameterStatus = explicit(input.parameterStatus, "PARAMETER_STATUS_REQUIRED");
  if (parameterStatus === "VALIDATED_DESIGN") fail("VALIDATED_PARAMETER_NOT_IN_R5");
  if (!(D3_R5_PARAMETER_STATUSES as readonly string[]).includes(parameterStatus)) fail("PARAMETER_STATUS_NOT_ALLOWLISTED");
  if (input.aiGenerated === true && parameterStatus === "GOVERNED_ADOPTED") fail("AI_CANNOT_PROMOTE_CANDIDATE");
  if (parameterCategory === "GROUNDWATER_DESIGN_ASSUMPTION" && !groundwaterContextId) fail("R3_GROUNDWATER_REQUIRED");
  const sourceBasis = explicit(input.sourceBasis, "SOURCE_BASIS_REQUIRED");
  if (!(D3_R5_SOURCE_BASES as readonly string[]).includes(sourceBasis)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  const citedMeasuredResult = optionalExplicit(input.citedMeasuredResult, "CITED_RESULT_INVALID");
  const citedUnit = optionalExplicit(input.citedUnit, "CITED_UNIT_INVALID");
  const fieldTestId = requireFieldTest(store, actor, context.contextId, input.fieldTestId, citedCurrentness, evidenceReferenceIds, citedMeasuredResult, citedUnit);
  const labTestId = requireLabTest(store, actor, context.contextId, input.labTestId, citedCurrentness, evidenceReferenceIds, citedMeasuredResult, citedUnit);
  if (TEST_LINKED_BASES.has(sourceBasis) && !fieldTestId && !labTestId) fail("R4_TEST_REFERENCE_REQUIRED");
  const value = explicit(input.value, "PARAMETER_VALUE_REQUIRED");
  const unit = explicit(input.unit, "PARAMETER_UNIT_REQUIRED");
  const derivationMethod = explicit(input.derivationMethod, "DERIVATION_METHOD_REQUIRED");
  const applicabilityToken = input.applicability.trim();
  if (!applicabilityToken || BROAD_APPLICABILITY.has(applicabilityToken.toLowerCase())) fail("APPLICABILITY_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const conversion = conversionOf(input);
  const predecessor = input.predecessorParameterId ? store.parameters.find((row) => row.parameterId === input.predecessorParameterId) : null;
  if (input.predecessorParameterId) {
    if (!predecessor || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail(predecessor ? "R1_CONTEXT_MISMATCH" : "PARAMETER_NOT_FOUND");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const aiGeneratedCandidate = input.aiGenerated === true;
  const candidate = parameterStatus === "CANDIDATE";
  const authoritative = parameterStatus === "GOVERNED_ADOPTED";
  const fingerprint = fingerprintCanonical({
    parameterId, parameterCategory, parameterStatus, contextId: context.contextId, objectId: object.objectId, stratigraphyId, materialClassificationId, groundwaterContextId, fieldTestId, labTestId, evidenceReferenceIds, value, unit, ...conversion, sourceBasis, derivationMethod, applicability, limitations, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, aiGeneratedCandidate, predecessorParameterId: predecessor?.parameterId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.parameters.find((row) => row.parameterId === parameterId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("PARAMETER_ALREADY_RECORDED");
  if (authoritative && store.parameters.some((row) => row.recordStatus === "CURRENT" && row.parameterId !== predecessor?.parameterId && row.objectId === object.objectId && row.parameterCategory === parameterCategory && row.applicability === applicability)) fail("DUPLICATE_AUTHORITATIVE_PARAMETER");
  if (store.parameters.some((row) => row.recordStatus === "CURRENT" && row.parameterId !== predecessor?.parameterId && row.objectId === object.objectId && row.parameterCategory === parameterCategory && row.applicability === applicability && row.value === value && row.unit === unit && row.sourceBasis === sourceBasis)) fail("DUPLICATE_PARAMETER_REJECTED");
  const record: D3R5ParameterRecord = Object.freeze({
    parameterId, parameterCategory: parameterCategory as D3R5ParameterRecord["parameterCategory"], parameterStatus: parameterStatus as D3R5ParameterRecord["parameterStatus"], candidate, authoritative, validatedDesignParameter: false, contextId: context.contextId, objectId: object.objectId, stratigraphyId, materialClassificationId, groundwaterContextId, fieldTestId, labTestId, evidenceReferenceIds, value, unit, ...conversion, sourceBasis: sourceBasis as D3R5ParameterRecord["sourceBasis"], derivationMethod, applicability, limitations, provenanceRef, citedCurrentness, authority: D3_CONTEXT_AUTHORITY, aiGeneratedCandidate, geotechnicalEngineeringAuthority: false, engineeringValidated: false, conformant: false, approved: false, certified: false, testResult: false, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", predecessorParameterId: predecessor?.parameterId ?? null, tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.parameters.findIndex((row) => row.parameterId === predecessor.parameterId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.parameters[index] = superseded;
    remember(store, superseded.parameterId, "SUPERSEDED", superseded.fingerprint);
  }
  store.parameters.push(record);
  remember(store, record.parameterId, "CREATED", record.fingerprint);
  return record;
}

export function mutateGeotechnicalParameter(): never {
  return fail("R5_MUTATION_REJECTED");
}

export function repointGeotechnicalParameter(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function deriveParameterAutomatically(): never {
  return fail("AUTOMATIC_DERIVATION_NOT_IN_R5");
}
