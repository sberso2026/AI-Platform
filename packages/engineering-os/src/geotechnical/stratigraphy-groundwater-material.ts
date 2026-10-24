/**
 * EOS-D3-R3 stratigraphy, groundwater, and material context.
 * One bounded runtime on exact R1 identities and exact R2 evidence.
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
  OBSERVATION_EQUALS_INTERPRETATION as ARCH_OBSERVATION_EQUALS,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
  RECOMMENDATION_EQUALS_APPROVAL as ARCH_RECOMMENDATION_EQUALS,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER as ARCH_TEST_EQUALS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D3_CONTEXT_AUTHORITY,
  D3_DISCIPLINE,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY,
  type D3R1Actor,
} from "./identity-foundation";
import {
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R2_EVIDENCE_READY,
  type D3R2Store,
} from "./site-investigation-evidence";

export const D3_R3_STATUS = "STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT_IMPLEMENTED" as const;
export const D3_R3_MATURITY = "STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT_IMPLEMENTED" as const;
export const D3_R3_MATURITY_STATE = D3_R3_MATURITY;
export const D3_R3_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D3_R3_STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT_CLOSEOUT.md" as const;
export const D3_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const D3_R2_INVESTIGATION_EVIDENCE_REUSED = R2_EVIDENCE_READY;
export const EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED = true as const;
export const EXACT_R2_EVIDENCE_REFERENCE_REQUIRED = true as const;
export const FLOATING_R1_D3_OBJECT_REFERENCE_ALLOWED = false as const;
export const FLOATING_R2_EVIDENCE_REFERENCE_ALLOWED = false as const;
export const PARALLEL_D3_IDENTITY_SYSTEM_CREATED = false as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 3 as const;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_IMPLEMENTED = true as const;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_COUNT = 1 as const;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_CONTEXT_IMPLEMENTED = true as const;
export const D3_MATERIAL_CLASSIFICATION_CONTEXT_IMPLEMENTED = true as const;
export const D3_GROUNDWATER_CONTEXT_IMPLEMENTED = true as const;
export const OBSERVATION_EQUALS_INTERPRETATION = ARCH_OBSERVATION_EQUALS;
export const STRATIGRAPHY_INTERPRETATION_EQUALS_RAW_EVIDENCE = false as const;
export const AI_CAN_AUTOMATICALLY_CREATE_AUTHORITATIVE_STRATIGRAPHY = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_MATERIAL_CLASSIFICATION = false as const;
export const MATERIAL_CLASSIFICATION_EQUALS_ENGINEERING_PARAMETER_SET = false as const;
export const MATERIAL_CLASSIFICATION_EQUALS_DESIGN_SUITABILITY_CONFIRMED = false as const;
export const GROUNDWATER_OBSERVATION_EQUALS_DESIGN_GROUNDWATER_LEVEL = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_DESIGN_GROUNDWATER_LEVEL = false as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const AI_GENERATED_INTERPRETATION_EQUALS_AUTHORITATIVE_INTERPRETATION = false as const;
export const D3_R3_EVIDENCE_TRACEABILITY_REQUIRED = true as const;
export const D3_R3_EVIDENCE_TRACEABILITY_PRESERVED = true as const;
export const INTERPRETATION_WITHOUT_GOVERNED_EVIDENCE_AUTO_ACCEPTED = false as const;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = false as const;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = false as const;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = false as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_R4_RUNTIME_STARTED = false as const;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const D3_R3_INTERPRETATION_AUTO_REPOINTED = false as const;
export const D3_R3_PROVENANCE_REQUIRED = ARCH_PROVENANCE_REQUIRED;
export const D3_R3_PROVENANCE_PRESERVED = true as const;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_R3_FINGERPRINT_IMPLEMENTED = true as const;
export const SILENT_D3_R3_MUTATION_ALLOWED = false as const;
export const D3_R3_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R3_SCOPE_ENFORCED = true as const;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const TEST_RESULT_EQUALS_ENGINEERING_PARAMETER = ARCH_TEST_EQUALS;
export const ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER = ARCH_PARAMETER_EQUALS;
export const INTERPRETATION_EQUALS_ENGINEERING_RECOMMENDATION = false as const;
export const RECOMMENDATION_EQUALS_APPROVAL = ARCH_RECOMMENDATION_EQUALS;

export const D3_FIELD_TEST_DATA_RUNTIME_COUNT = 0 as const;
export const D3_LAB_TEST_DATA_RUNTIME_COUNT = 0 as const;
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
export const UNAUTHORIZED_D3_R4_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R4_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[3];
export const D3_R4_PHASE_TYPE = "FIELD_AND_LAB_TEST_CONTEXT" as const;
export const D3_R4_CANONICAL_SCOPE =
  "Implement governed Geotechnical field-test and laboratory-test result context using exact R1 identities and R2/R3 evidence references. Record supplied test types, methods, results, units, specimen/sample references, source evidence, authority, provenance, currentness and limitations without deriving authoritative design parameters, performing Geotechnical calculations, issuing recommendations, automatically validating engineering, or starting D4-D9." as const;
export const D3_R4_STARTED = false as const;
export const D3_R3_READY_FOR_NEXT_PHASE = true as const;
export const D3_R3_NEXT_PHASE = D3_R4_CANONICAL_PHASE;
export const D3_R3_NEXT_PHASE_TYPE = D3_R4_PHASE_TYPE;
export const D3_R3_CANONICAL_NEXT_PHASE = D3_R4_CANONICAL_PHASE;
export const D3_R3_CANONICAL_NEXT_PHASE_SCOPE = D3_R4_CANONICAL_SCOPE;
export const D3_R3_BLOCKER = "NONE" as const;
export const D3_R3_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);

type Prohibited = {
  automaticStratigraphy?: boolean;
  inventClassification?: boolean;
  inventDesignGroundwaterLevel?: boolean;
  aiGenerated?: boolean;
  designGroundwaterLevel?: boolean;
  designSuitability?: boolean;
  parameters?: unknown;
  unitWeight?: unknown;
  cohesion?: unknown;
  frictionAngle?: unknown;
  modulus?: unknown;
  poissonRatio?: unknown;
  undrainedShearStrength?: unknown;
  permeability?: unknown;
  bearingParameter?: unknown;
  settlementParameter?: unknown;
  subgradeValue?: unknown;
  parseFieldTest?: boolean;
  parseLabTest?: boolean;
  testValues?: readonly unknown[] | null;
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
  requirementsChange?: boolean;
  disciplineInterface?: boolean;
  reviewValidation?: boolean;
  validation?: boolean;
  approval?: boolean;
  certification?: boolean;
  repoint?: boolean;
  d1Integration?: boolean;
  d2Integration?: boolean;
  d9Reasoning?: boolean;
};

type Scoped = {
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  contextId: string;
  objectId: string;
  evidenceReferenceIds: readonly string[];
  provenanceRef: string;
  citedCurrentness: string;
  limitations: string;
  assertedFingerprint?: string;
};

export type D3R3StratigraphyInput = Prohibited & Scoped & {
  stratigraphyId: string;
  locationContextId: string;
  boreholeEvidenceId?: string | null;
  testPitEvidenceId?: string | null;
  depthInterval: string;
  materialDescription: string;
  layerSequence: string;
  interpretationSource: string;
  predecessorStratigraphyId?: string | null;
};

export type D3R3StratigraphyRecord = {
  stratigraphyId: string;
  contextId: string;
  objectId: string;
  locationContextId: string;
  boreholeEvidenceId: string | null;
  testPitEvidenceId: string | null;
  evidenceReferenceIds: readonly string[];
  depthInterval: string;
  materialDescription: string;
  layerSequence: string;
  interpretationSource: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  rawEvidence: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorStratigraphyId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R3MaterialInput = Prohibited & Scoped & {
  materialClassificationId: string;
  layerInterpretationId?: string | null;
  classificationSystem: string;
  classificationResult: string;
  materialDescription: string;
  predecessorMaterialClassificationId?: string | null;
};

export type D3R3MaterialRecord = {
  materialClassificationId: string;
  contextId: string;
  objectId: string;
  layerInterpretationId: string | null;
  evidenceReferenceIds: readonly string[];
  classificationSystem: string;
  classificationResult: string;
  materialDescription: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  designSuitabilityConfirmed: false;
  parameterSet: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorMaterialClassificationId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R3GroundwaterInput = Prohibited & Scoped & {
  groundwaterContextId: string;
  locationContextId: string;
  observedWaterLevel?: string | null;
  observationDate: string;
  measurementMethod?: string | null;
  interpretedContext: string;
  seasonalLimitation: string;
  predecessorGroundwaterContextId?: string | null;
};

export type D3R3GroundwaterRecord = {
  groundwaterContextId: string;
  contextId: string;
  objectId: string;
  locationContextId: string;
  evidenceReferenceIds: readonly string[];
  observedWaterLevel: string | null;
  observationDate: string;
  measurementMethod: string | null;
  interpretedContext: string;
  seasonalLimitation: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  designGroundwaterLevel: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorGroundwaterContextId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R3History = {
  historyId: string;
  subjectKind: "STRATIGRAPHY" | "MATERIAL" | "GROUNDWATER";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R3Store = {
  r2: D3R2Store;
  now: () => string;
  stratigraphy: D3R3StratigraphyRecord[];
  materials: D3R3MaterialRecord[];
  groundwater: D3R3GroundwaterRecord[];
  history: D3R3History[];
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
  if (input.automaticStratigraphy === true) fail("AUTHORITATIVE_STRATIGRAPHY_NOT_AUTOMATIC");
  if (input.inventClassification === true) fail("MATERIAL_CLASSIFICATION_NOT_INVENTED");
  if (input.inventDesignGroundwaterLevel === true || input.designGroundwaterLevel === true) fail("DESIGN_GROUNDWATER_LEVEL_NOT_AUTHORITATIVE");
  if (input.aiGenerated === true) fail("AI_INTERPRETATION_NOT_AUTHORITATIVE");
  if (input.designSuitability === true) fail("DESIGN_SUITABILITY_NOT_IN_R3");
  if (
    input.parameters != null ||
    input.unitWeight != null ||
    input.cohesion != null ||
    input.frictionAngle != null ||
    input.modulus != null ||
    input.poissonRatio != null ||
    input.undrainedShearStrength != null ||
    input.permeability != null ||
    input.bearingParameter != null ||
    input.settlementParameter != null ||
    input.subgradeValue != null
  ) fail("PARAMETER_NOT_IN_R3");
  if (input.parseFieldTest === true) fail("FIELD_TEST_DATA_NOT_IN_R3");
  if (input.parseLabTest === true || input.testValues != null) fail("LAB_TEST_DATA_NOT_IN_R3");
  if (input.foundationRecommendation === true) fail("FOUNDATION_RECOMMENDATION_NOT_IN_R3");
  if (input.excavationRecommendation === true) fail("EXCAVATION_RECOMMENDATION_NOT_IN_R3");
  if (input.slopeRecommendation === true) fail("SLOPE_RECOMMENDATION_NOT_IN_R3");
  if (input.groundImprovementRecommendation === true) fail("GROUND_IMPROVEMENT_RECOMMENDATION_NOT_IN_R3");
  if (input.foundationCalculation === true) fail("FOUNDATION_CALCULATION_NOT_IN_R3");
  if (input.bearingCapacity === true) fail("BEARING_CAPACITY_NOT_IN_R3");
  if (input.settlementCalculation === true) fail("SETTLEMENT_CALCULATION_NOT_IN_R3");
  if (input.slopeStability === true) fail("SLOPE_STABILITY_NOT_IN_R3");
  if (input.earthPressure === true) fail("EARTH_PRESSURE_NOT_IN_R3");
  if (input.groundImprovementDesign === true) fail("GROUND_IMPROVEMENT_DESIGN_NOT_IN_R3");
  if (input.requirementsChange === true) fail("REQUIREMENTS_NOT_IN_R3");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R3");
  if (input.reviewValidation === true || input.validation === true) fail("VALIDATION_NOT_IN_R3");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R3");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R3");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.d1Integration === true || input.d2Integration === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R3");
}

function requireContext(store: D3R3Store, actor: D3R1Actor, contextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D3R3Store, actor: D3R1Actor, contextId: string, objectId: string, allowed: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const object = store.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (!allowed.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (object.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (object.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function sameScope(actor: D3R1Actor, row: { tenantId: string; workspaceId: string; projectId: string; contextId: string }, contextId: string): void {
  if (row.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (row.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (row.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (row.contextId !== contextId) fail("R2_EVIDENCE_CONTEXT_MISMATCH");
}

function requireEvidence(store: D3R3Store, actor: D3R1Actor, contextId: string, ids: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], requiredKinds: readonly string[]): string[] {
  if (!ids || ids.length === 0) fail("INTERPRETATION_WITHOUT_EVIDENCE");
  const resolved: string[] = [];
  for (const raw of ids) {
    const id = explicit(raw, "R2_EVIDENCE_REQUIRED");
    if (resolved.includes(id)) fail("DUPLICATE_EVIDENCE_LINK");
    const row = store.r2.evidence.find((item) => item.evidenceReferenceId === id);
    if (!row) fail("R2_EVIDENCE_NOT_FOUND");
    sameScope(actor, row, contextId);
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_EVIDENCE_NOT_CURRENT");
    resolved.push(row.evidenceReferenceId);
  }
  for (const kind of requiredKinds) {
    const matched = resolved.some((id) => store.r2.evidence.find((item) => item.evidenceReferenceId === id)?.evidenceKind === kind);
    if (!matched) fail("R2_EVIDENCE_KIND_REQUIRED");
  }
  return resolved;
}

function requireLocation(store: D3R3Store, actor: D3R1Actor, contextId: string, locationContextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(locationContextId, "R2_LOCATION_REQUIRED");
  const row = store.r2.locations.find((item) => item.locationContextId === id);
  if (!row) fail("R2_LOCATION_NOT_FOUND");
  sameScope(actor, row, contextId);
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_LOCATION_NOT_CURRENT");
  return row;
}

function requireBoreholeEvidence(store: D3R3Store, actor: D3R1Actor, contextId: string, boreholeEvidenceId: string | null | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  if (boreholeEvidenceId == null || boreholeEvidenceId === "") return null;
  const id = explicit(boreholeEvidenceId, "R2_BOREHOLE_EVIDENCE_REQUIRED");
  const row = store.r2.boreholeEvidence.find((item) => item.boreholeEvidenceId === id);
  if (!row) fail("R2_BOREHOLE_EVIDENCE_NOT_FOUND");
  sameScope(actor, row, contextId);
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_BOREHOLE_EVIDENCE_NOT_CURRENT");
  return row.boreholeEvidenceId;
}

function requireTestPitEvidence(store: D3R3Store, actor: D3R1Actor, contextId: string, testPitEvidenceId: string | null | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  if (testPitEvidenceId == null || testPitEvidenceId === "") return null;
  const id = explicit(testPitEvidenceId, "R2_TEST_PIT_EVIDENCE_REQUIRED");
  const row = store.r2.testPitEvidence.find((item) => item.testPitEvidenceId === id);
  if (!row) fail("R2_TEST_PIT_EVIDENCE_NOT_FOUND");
  sameScope(actor, row, contextId);
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_TEST_PIT_EVIDENCE_NOT_CURRENT");
  return row.testPitEvidenceId;
}

function remember(store: D3R3Store, subjectKind: D3R3History["subjectKind"], subjectId: string, action: D3R3History["action"], fingerprint: string): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    recordedAt: store.now(),
  });
}

export function createD3R3Store(r2: D3R2Store, now: () => string = () => r2.now()): D3R3Store {
  return { r2, now, stratigraphy: [], materials: [], groundwater: [], history: [] };
}

export function recordStratigraphicInterpretation(store: D3R3Store, actor: D3R1Actor, input: D3R3StratigraphyInput): D3R3StratigraphyRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["STRATIGRAPHIC_LAYER"], citedCurrentness);
  const location = requireLocation(store, actor, context.contextId, input.locationContextId, citedCurrentness);
  const boreholeEvidenceId = requireBoreholeEvidence(store, actor, context.contextId, input.boreholeEvidenceId, citedCurrentness);
  const testPitEvidenceId = requireTestPitEvidence(store, actor, context.contextId, input.testPitEvidenceId, citedCurrentness);
  if (!boreholeEvidenceId && !testPitEvidenceId) fail("BOREHOLE_OR_TEST_PIT_EVIDENCE_REQUIRED");
  const requiredKinds = [
    ...(boreholeEvidenceId ? ["BOREHOLE_LOG"] : []),
    ...(testPitEvidenceId ? ["TEST_PIT_LOG"] : []),
  ];
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness, requiredKinds);
  const stratigraphyId = explicit(input.stratigraphyId, "STRATIGRAPHY_REQUIRED");
  const depthInterval = explicit(input.depthInterval, "DEPTH_INTERVAL_REQUIRED");
  const materialDescription = explicit(input.materialDescription, "MATERIAL_DESCRIPTION_REQUIRED");
  const layerSequence = explicit(input.layerSequence, "LAYER_SEQUENCE_REQUIRED");
  const interpretationSource = explicit(input.interpretationSource, "INTERPRETATION_SOURCE_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorStratigraphyId ? store.stratigraphy.find((row) => row.stratigraphyId === input.predecessorStratigraphyId) : null;
  if (input.predecessorStratigraphyId) {
    if (!predecessor) fail("STRATIGRAPHY_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    stratigraphyId,
    contextId: context.contextId,
    objectId: object.objectId,
    locationContextId: location.locationContextId,
    boreholeEvidenceId,
    testPitEvidenceId,
    evidenceReferenceIds,
    depthInterval,
    materialDescription,
    layerSequence,
    interpretationSource,
    limitations,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    predecessorStratigraphyId: predecessor?.stratigraphyId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.stratigraphy.find((row) => row.stratigraphyId === stratigraphyId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("STRATIGRAPHY_ALREADY_RECORDED");
  }
  const duplicate = store.stratigraphy.find((row) => row.recordStatus === "CURRENT" && row.stratigraphyId !== predecessor?.stratigraphyId && row.objectId === object.objectId && row.boreholeEvidenceId === boreholeEvidenceId && row.testPitEvidenceId === testPitEvidenceId && row.depthInterval === depthInterval && row.materialDescription === materialDescription);
  if (duplicate) fail("DUPLICATE_STRATIGRAPHY_REJECTED");
  const record: D3R3StratigraphyRecord = Object.freeze({
    stratigraphyId,
    contextId: context.contextId,
    objectId: object.objectId,
    locationContextId: location.locationContextId,
    boreholeEvidenceId,
    testPitEvidenceId,
    evidenceReferenceIds,
    depthInterval,
    materialDescription,
    layerSequence,
    interpretationSource,
    limitations,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
    engineeringValidated: false,
    rawEvidence: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorStratigraphyId: predecessor?.stratigraphyId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.stratigraphy.findIndex((row) => row.stratigraphyId === predecessor.stratigraphyId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.stratigraphy[index] = superseded;
    remember(store, "STRATIGRAPHY", superseded.stratigraphyId, "SUPERSEDED", superseded.fingerprint);
  }
  store.stratigraphy.push(record);
  remember(store, "STRATIGRAPHY", record.stratigraphyId, "CREATED", record.fingerprint);
  return record;
}

export function recordMaterialClassificationContext(store: D3R3Store, actor: D3R1Actor, input: D3R3MaterialInput): D3R3MaterialRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["MATERIAL_CLASSIFICATION"], citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness, []);
  let layerInterpretationId: string | null = null;
  if (input.layerInterpretationId != null && input.layerInterpretationId !== "") {
    const layerId = explicit(input.layerInterpretationId, "LAYER_INTERPRETATION_REQUIRED");
    const layer = store.stratigraphy.find((row) => row.stratigraphyId === layerId);
    if (!layer) fail("STRATIGRAPHY_NOT_FOUND");
    sameScope(actor, layer, context.contextId);
    if (citedCurrentness === "CURRENT" && layer.recordStatus !== "CURRENT") fail("STRATIGRAPHY_NOT_CURRENT");
    layerInterpretationId = layer.stratigraphyId;
  }
  const materialClassificationId = explicit(input.materialClassificationId, "MATERIAL_CLASSIFICATION_REQUIRED");
  const classificationSystem = explicit(input.classificationSystem, "CLASSIFICATION_SYSTEM_REQUIRED");
  const classificationResult = explicit(input.classificationResult, "CLASSIFICATION_RESULT_REQUIRED");
  const materialDescription = explicit(input.materialDescription, "MATERIAL_DESCRIPTION_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorMaterialClassificationId ? store.materials.find((row) => row.materialClassificationId === input.predecessorMaterialClassificationId) : null;
  if (input.predecessorMaterialClassificationId) {
    if (!predecessor) fail("MATERIAL_CLASSIFICATION_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    materialClassificationId,
    contextId: context.contextId,
    objectId: object.objectId,
    layerInterpretationId,
    evidenceReferenceIds,
    classificationSystem,
    classificationResult,
    materialDescription,
    limitations,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    predecessorMaterialClassificationId: predecessor?.materialClassificationId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.materials.find((row) => row.materialClassificationId === materialClassificationId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("MATERIAL_CLASSIFICATION_ALREADY_RECORDED");
  }
  const duplicate = store.materials.find((row) => row.recordStatus === "CURRENT" && row.materialClassificationId !== predecessor?.materialClassificationId && row.objectId === object.objectId && row.classificationSystem === classificationSystem && row.classificationResult === classificationResult && row.layerInterpretationId === layerInterpretationId);
  if (duplicate) fail("DUPLICATE_MATERIAL_CLASSIFICATION_REJECTED");
  const record: D3R3MaterialRecord = Object.freeze({
    materialClassificationId,
    contextId: context.contextId,
    objectId: object.objectId,
    layerInterpretationId,
    evidenceReferenceIds,
    classificationSystem,
    classificationResult,
    materialDescription,
    limitations,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
    engineeringValidated: false,
    designSuitabilityConfirmed: false,
    parameterSet: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorMaterialClassificationId: predecessor?.materialClassificationId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.materials.findIndex((row) => row.materialClassificationId === predecessor.materialClassificationId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.materials[index] = superseded;
    remember(store, "MATERIAL", superseded.materialClassificationId, "SUPERSEDED", superseded.fingerprint);
  }
  store.materials.push(record);
  remember(store, "MATERIAL", record.materialClassificationId, "CREATED", record.fingerprint);
  return record;
}

export function recordGroundwaterContext(store: D3R3Store, actor: D3R1Actor, input: D3R3GroundwaterInput): D3R3GroundwaterRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["GROUNDWATER_OBSERVATION"], citedCurrentness);
  const location = requireLocation(store, actor, context.contextId, input.locationContextId, citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness, ["GROUNDWATER_OBSERVATION"]);
  const groundwaterContextId = explicit(input.groundwaterContextId, "GROUNDWATER_CONTEXT_REQUIRED");
  const observedWaterLevel = optionalExplicit(input.observedWaterLevel, "OBSERVED_WATER_LEVEL_INVALID");
  const observationDate = explicit(input.observationDate, "OBSERVATION_DATE_REQUIRED");
  const measurementMethod = optionalExplicit(input.measurementMethod, "MEASUREMENT_METHOD_INVALID");
  const interpretedContext = explicit(input.interpretedContext, "GROUNDWATER_INTERPRETATION_REQUIRED");
  const seasonalLimitation = explicit(input.seasonalLimitation, "SEASONAL_LIMITATION_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorGroundwaterContextId ? store.groundwater.find((row) => row.groundwaterContextId === input.predecessorGroundwaterContextId) : null;
  if (input.predecessorGroundwaterContextId) {
    if (!predecessor) fail("GROUNDWATER_CONTEXT_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    groundwaterContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    locationContextId: location.locationContextId,
    evidenceReferenceIds,
    observedWaterLevel,
    observationDate,
    measurementMethod,
    interpretedContext,
    seasonalLimitation,
    limitations,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    designGroundwaterLevel: false,
    predecessorGroundwaterContextId: predecessor?.groundwaterContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.groundwater.find((row) => row.groundwaterContextId === groundwaterContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("GROUNDWATER_CONTEXT_ALREADY_RECORDED");
  }
  const duplicate = store.groundwater.find((row) => row.recordStatus === "CURRENT" && row.groundwaterContextId !== predecessor?.groundwaterContextId && row.objectId === object.objectId && row.observedWaterLevel === observedWaterLevel && row.observationDate === observationDate && row.interpretedContext === interpretedContext);
  if (duplicate) fail("DUPLICATE_GROUNDWATER_CONTEXT_REJECTED");
  const record: D3R3GroundwaterRecord = Object.freeze({
    groundwaterContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    locationContextId: location.locationContextId,
    evidenceReferenceIds,
    observedWaterLevel,
    observationDate,
    measurementMethod,
    interpretedContext,
    seasonalLimitation,
    limitations,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
    engineeringValidated: false,
    designGroundwaterLevel: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorGroundwaterContextId: predecessor?.groundwaterContextId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.groundwater.findIndex((row) => row.groundwaterContextId === predecessor.groundwaterContextId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.groundwater[index] = superseded;
    remember(store, "GROUNDWATER", superseded.groundwaterContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.groundwater.push(record);
  remember(store, "GROUNDWATER", record.groundwaterContextId, "CREATED", record.fingerprint);
  return record;
}

export function mutateStratigraphyContext(): never {
  return fail("R3_MUTATION_REJECTED");
}

export function repointInterpretation(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function deriveGeotechnicalParameter(): never {
  return fail("PARAMETER_NOT_IN_R3");
}

export function parseFieldOrLabTest(): never {
  return fail("FIELD_LAB_TEST_NOT_IN_R3");
}
