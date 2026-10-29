/**
 * EOS-D3-R2 site investigation and evidence context.
 * One bounded runtime on exact R1 identities. Factual evidence only.
 */
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_ADMIN_EQUALS,
  AI_CAN_FABRICATE_GEOTECHNICAL_EVIDENCE as ARCH_AI_FABRICATE,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY as ARCH_AI_EQUALS,
  D2_REOPENED as ARCH_D2_REOPENED,
  D3_0_CANONICAL_CURRENTNESS_REUSED,
  D3_0_CANONICAL_FINGERPRINT_REUSED,
  D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED,
  D3_CURRENTNESS_STATES,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY as ARCH_EQUALS_D1,
  D3_EQUALS_D2_CIVIL_AUTHORITY as ARCH_EQUALS_D2,
  D3_EVIDENCE_PROVENANCE_REQUIRED as ARCH_EVIDENCE_PROVENANCE_REQUIRED,
  D3_EVIDENCE_SOURCE_KINDS,
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
  PARALLEL_D3_IDENTITY_SYSTEM_CREATED as R1_PARALLEL_IDENTITY,
  type D3R1Actor,
  type D3R1Store,
} from "./identity-foundation";

export const D3_R2_STATUS = "SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT_IMPLEMENTED" as const;
export const D3_R2_MATURITY = "SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT_IMPLEMENTED" as const;
export const D3_R2_MATURITY_STATE = D3_R2_MATURITY;
export const D3_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D3_R2_SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT_CLOSEOUT.md" as const;
export const D3_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const EXACT_R1_D3_OBJECT_REFERENCE_REQUIRED = true as const;
export const FLOATING_R1_D3_OBJECT_REFERENCE_ALLOWED = false as const;
export const PARALLEL_D3_IDENTITY_SYSTEM_CREATED = R1_PARALLEL_IDENTITY;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 2 as const;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_IMPLEMENTED = true as const;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_COUNT = 1 as const;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_INVESTIGATION_LOCATION_CONTEXT_IMPLEMENTED = true as const;
export const AI_CAN_INVENT_AUTHORITATIVE_INVESTIGATION_LOCATION = false as const;
export const D3_BOREHOLE_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const D3_TEST_PIT_EVIDENCE_CONTEXT_IMPLEMENTED = true as const;
export const BOREHOLE_EVIDENCE_PRESENT_EQUALS_STRATIGRAPHY_INTERPRETED = false as const;
export const TEST_PIT_EVIDENCE_PRESENT_EQUALS_MATERIAL_CLASSIFIED = false as const;
export const D3_EVIDENCE_PROVENANCE_REQUIRED = ARCH_EVIDENCE_PROVENANCE_REQUIRED;
export const D3_EVIDENCE_PROVENANCE_PRESERVED = true as const;
export const AI_CAN_FABRICATE_GEOTECHNICAL_EVIDENCE = ARCH_AI_FABRICATE;
export const EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const AI_CAN_AUTOMATICALLY_INTERPRET_FACTUAL_GEOTECHNICAL_EVIDENCE_AS_AUTHORITY = false as const;
export const OBSERVATION_EQUALS_INTERPRETATION = ARCH_OBSERVATION_EQUALS;
export const TEST_RESULT_EQUALS_ENGINEERING_PARAMETER = ARCH_TEST_EQUALS;
export const ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER = ARCH_PARAMETER_EQUALS;
export const RECOMMENDATION_EQUALS_APPROVAL = ARCH_RECOMMENDATION_EQUALS;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_INVESTIGATION_EVIDENCE_AUTO_REPOINTED = false as const;
export const SILENT_D3_INVESTIGATION_EVIDENCE_MUTATION_ALLOWED = false as const;
export const D3_INVESTIGATION_EVIDENCE_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_EVIDENCE_SCOPE_ENFORCED = true as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;

export const D3_R2_INVESTIGATION_METHODS = [
  "BOREHOLE_DRILLING",
  "TEST_PIT_EXCAVATION",
  "FIELD_MAPPING",
  "INSTRUMENT_INSTALLATION",
  "DOCUMENT_REVIEW",
] as const;
export const D3_R2_EVIDENCE_REFERENCE_KINDS = [
  ...D3_EVIDENCE_SOURCE_KINDS,
  "FIELD_SHEET",
  "PHOTOGRAPH",
] as const;

export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = false as const;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = false as const;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = false as const;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = false as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_R3_RUNTIME_STARTED = false as const;
export const D3_R4_RUNTIME_STARTED = false as const;

export const D3_STRATIGRAPHY_RUNTIME_COUNT = 0 as const;
export const D3_GROUNDWATER_INTERPRETATION_RUNTIME_COUNT = 0 as const;
export const D3_MATERIAL_CLASSIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_FIELD_TEST_DATA_RUNTIME_COUNT = 0 as const;
export const D3_LAB_TEST_DATA_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_PARAMETER_INFERENCE_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
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
export const UNAUTHORIZED_D3_R3_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R3_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[2];
export const D3_R3_PHASE_TYPE = "STRATIGRAPHY_GROUNDWATER_AND_MATERIAL_CONTEXT" as const;
export const D3_R3_CANONICAL_SCOPE =
  "Implement governed Geotechnical stratigraphy, groundwater and material-classification context using exact R1 identities and R2 evidence references. Record explicit interpreted layers/material classifications, groundwater observation/interpretation context, evidence traceability, authority, currentness and limitations. Do not derive engineering design parameters, perform bearing/settlement/slope calculations, issue foundation recommendations, perform automatic validation, or start D4-D9." as const;
export const D3_R3_STARTED = false as const;
export const D3_R2_READY_FOR_NEXT_PHASE = true as const;
export const D3_R2_NEXT_PHASE = D3_R3_CANONICAL_PHASE;
export const D3_R2_NEXT_PHASE_TYPE = D3_R3_PHASE_TYPE;
export const D3_R2_CANONICAL_NEXT_PHASE = D3_R3_CANONICAL_PHASE;
export const D3_R2_CANONICAL_NEXT_PHASE_SCOPE = D3_R3_CANONICAL_SCOPE;
export const D3_R2_BLOCKER = "NONE" as const;
export const D3_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);
const EVIDENCE_OBJECT_TYPES = [
  "GEOTECHNICAL_SITE_CONTEXT",
  "INVESTIGATION_LOCATION",
  "BOREHOLE",
  "TEST_PIT",
  "FIELD_TEST_RECORD",
  "LAB_TEST_RECORD",
  "GROUNDWATER_OBSERVATION",
  "GEOTECHNICAL_EVIDENCE_REFERENCE",
] as const;

type Prohibited = {
  inventLocation?: boolean;
  fabricateEvidence?: boolean;
  interpretStratigraphy?: boolean;
  interpretGroundwater?: boolean;
  classifyMaterial?: boolean;
  parseFieldTest?: boolean;
  parseLabTest?: boolean;
  deriveParameter?: boolean;
  inferParameter?: boolean;
  calculateParameter?: boolean;
  layers?: readonly unknown[] | null;
  parameters?: unknown;
  testValues?: readonly unknown[] | null;
  foundationRecommendation?: boolean;
  excavationRecommendation?: boolean;
  slopeRecommendation?: boolean;
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
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
};

export type D3R2ProgramInput = Prohibited & Scoped & {
  investigationProgramId: string;
  purpose: string;
  campaignRef: string;
  method: string;
  provider: string;
  investigationDate: string;
  predecessorInvestigationProgramId?: string | null;
};

export type D3R2ProgramRecord = {
  investigationProgramId: string;
  contextId: string;
  objectId: string;
  purpose: string;
  campaignRef: string;
  method: (typeof D3_R2_INVESTIGATION_METHODS)[number];
  provider: string;
  investigationDate: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorInvestigationProgramId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R2LocationInput = Prohibited & Scoped & {
  locationContextId: string;
  investigationProgramId: string;
  locationEvidenceRef: string;
  suppliedPosition?: string | null;
  predecessorLocationContextId?: string | null;
};

export type D3R2LocationRecord = {
  locationContextId: string;
  investigationProgramId: string;
  contextId: string;
  objectId: string;
  locationEvidenceRef: string;
  suppliedPosition: string | null;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  locationInvented: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorLocationContextId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R2BoreholeEvidenceInput = Prohibited & Scoped & {
  boreholeEvidenceId: string;
  investigationProgramId: string;
  sourceLogRef: string;
  drillingRecordRef: string;
  provider: string;
  investigationDate: string;
  factualDepth?: string | null;
  predecessorBoreholeEvidenceId?: string | null;
};

export type D3R2BoreholeEvidenceRecord = {
  boreholeEvidenceId: string;
  investigationProgramId: string;
  contextId: string;
  objectId: string;
  sourceLogRef: string;
  drillingRecordRef: string;
  provider: string;
  investigationDate: string;
  factualDepth: string | null;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  stratigraphyInterpreted: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorBoreholeEvidenceId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R2TestPitEvidenceInput = Prohibited & Scoped & {
  testPitEvidenceId: string;
  investigationProgramId: string;
  sourceLogRef: string;
  excavationRecordRef: string;
  provider: string;
  investigationDate: string;
  predecessorTestPitEvidenceId?: string | null;
};

export type D3R2TestPitEvidenceRecord = {
  testPitEvidenceId: string;
  investigationProgramId: string;
  contextId: string;
  objectId: string;
  sourceLogRef: string;
  excavationRecordRef: string;
  provider: string;
  investigationDate: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  materialClassified: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorTestPitEvidenceId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R2EvidenceInput = Prohibited & Scoped & {
  evidenceReferenceId: string;
  evidenceKind: string;
  sourceRevision: string;
  predecessorEvidenceReferenceId?: string | null;
};

export type D3R2EvidenceRecord = {
  evidenceReferenceId: string;
  contextId: string;
  objectId: string;
  evidenceKind: (typeof D3_R2_EVIDENCE_REFERENCE_KINDS)[number];
  sourceRevision: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  authority: typeof D3_CONTEXT_AUTHORITY;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  testResultParsed: false;
  parameterDerived: false;
  groundwaterInterpreted: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorEvidenceReferenceId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R2History = {
  historyId: string;
  subjectKind: "PROGRAM" | "LOCATION" | "BOREHOLE_EVIDENCE" | "TEST_PIT_EVIDENCE" | "EVIDENCE";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R2Store = {
  r1: D3R1Store;
  now: () => string;
  programs: D3R2ProgramRecord[];
  locations: D3R2LocationRecord[];
  boreholeEvidence: D3R2BoreholeEvidenceRecord[];
  testPitEvidence: D3R2TestPitEvidenceRecord[];
  evidence: D3R2EvidenceRecord[];
  history: D3R2History[];
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
  if (input.inventLocation === true) fail("LOCATION_NOT_INVENTED");
  if (input.fabricateEvidence === true) fail("EVIDENCE_NOT_FABRICATED");
  if (input.interpretStratigraphy === true || input.layers != null) fail("STRATIGRAPHY_NOT_IN_R2");
  if (input.interpretGroundwater === true) fail("GROUNDWATER_INTERPRETATION_NOT_IN_R2");
  if (input.classifyMaterial === true) fail("MATERIAL_CLASSIFICATION_NOT_IN_R2");
  if (input.parseFieldTest === true) fail("FIELD_TEST_DATA_NOT_IN_R2");
  if (input.parseLabTest === true || input.testValues != null) fail("LAB_TEST_DATA_NOT_IN_R2");
  if (input.deriveParameter === true || input.inferParameter === true || input.parameters != null) fail("PARAMETER_NOT_IN_R2");
  if (input.calculateParameter === true) fail("PARAMETER_CALCULATION_NOT_IN_R2");
  if (input.foundationRecommendation === true) fail("FOUNDATION_RECOMMENDATION_NOT_IN_R2");
  if (input.excavationRecommendation === true) fail("EXCAVATION_RECOMMENDATION_NOT_IN_R2");
  if (input.slopeRecommendation === true) fail("SLOPE_RECOMMENDATION_NOT_IN_R2");
  if (input.foundationCalculation === true) fail("FOUNDATION_CALCULATION_NOT_IN_R2");
  if (input.bearingCapacity === true) fail("BEARING_CAPACITY_NOT_IN_R2");
  if (input.settlementCalculation === true) fail("SETTLEMENT_CALCULATION_NOT_IN_R2");
  if (input.slopeStability === true) fail("SLOPE_STABILITY_NOT_IN_R2");
  if (input.earthPressure === true) fail("EARTH_PRESSURE_NOT_IN_R2");
  if (input.groundImprovementDesign === true) fail("GROUND_IMPROVEMENT_DESIGN_NOT_IN_R2");
  if (input.requirementsChange === true) fail("REQUIREMENTS_NOT_IN_R2");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R2");
  if (input.reviewValidation === true || input.validation === true) fail("VALIDATION_NOT_IN_R2");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R2");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R2");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.d1Integration === true || input.d2Integration === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R2");
}

function requireContext(store: D3R2Store, actor: D3R1Actor, contextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D3R2Store, actor: D3R1Actor, contextId: string, objectId: string, allowed: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (!allowed.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (object.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (object.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireProgram(store: D3R2Store, actor: D3R1Actor, programId: string, contextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(programId, "INVESTIGATION_PROGRAM_REQUIRED");
  const program = store.programs.find((row) => row.investigationProgramId === id);
  if (!program) fail("INVESTIGATION_PROGRAM_NOT_FOUND");
  if (program.contextId !== contextId || program.tenantId !== actor.tenantId) fail("R1_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && program.recordStatus !== "CURRENT") fail("INVESTIGATION_PROGRAM_NOT_CURRENT");
  return program;
}

function remember(store: D3R2Store, subjectKind: D3R2History["subjectKind"], subjectId: string, action: D3R2History["action"], fingerprint: string): void {
  store.history.push({
    historyId: `hist-${store.history.length + 1}`,
    subjectKind,
    subjectId,
    action,
    fingerprint,
    recordedAt: store.now(),
  });
}

function optionalExplicit(value: string | null | undefined, code: string): string | null {
  if (value == null || value === "") return null;
  return explicit(value, code);
}

export function createD3R2Store(r1: D3R1Store, now: () => string = () => "2026-10-23T00:00:00.000Z"): D3R2Store {
  return { r1, now, programs: [], locations: [], boreholeEvidence: [], testPitEvidence: [], evidence: [], history: [] };
}

export function recordInvestigationProgram(store: D3R2Store, actor: D3R1Actor, input: D3R2ProgramInput): D3R2ProgramRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["GEOTECHNICAL_SITE_CONTEXT"], citedCurrentness);
  const investigationProgramId = explicit(input.investigationProgramId, "INVESTIGATION_PROGRAM_REQUIRED");
  const purpose = explicit(input.purpose, "INVESTIGATION_PURPOSE_REQUIRED");
  const campaignRef = explicit(input.campaignRef, "INVESTIGATION_CAMPAIGN_REQUIRED");
  const method = explicit(input.method, "INVESTIGATION_METHOD_REQUIRED");
  if (!(D3_R2_INVESTIGATION_METHODS as readonly string[]).includes(method)) fail("INVESTIGATION_METHOD_NOT_ALLOWLISTED");
  const provider = explicit(input.provider, "PROVIDER_REQUIRED");
  const investigationDate = explicit(input.investigationDate, "INVESTIGATION_DATE_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorInvestigationProgramId ? store.programs.find((row) => row.investigationProgramId === input.predecessorInvestigationProgramId) : null;
  if (input.predecessorInvestigationProgramId) {
    if (!predecessor) fail("INVESTIGATION_PROGRAM_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.contextId !== context.contextId || predecessor.objectId !== object.objectId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    investigationProgramId,
    contextId: context.contextId,
    objectId: object.objectId,
    purpose,
    campaignRef,
    method,
    provider,
    investigationDate,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    predecessorInvestigationProgramId: predecessor?.investigationProgramId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.programs.find((row) => row.investigationProgramId === investigationProgramId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("INVESTIGATION_PROGRAM_ALREADY_RECORDED");
  }
  const duplicate = store.programs.find((row) => row.recordStatus === "CURRENT" && row.investigationProgramId !== predecessor?.investigationProgramId && row.contextId === context.contextId && row.objectId === object.objectId && row.campaignRef === campaignRef && row.method === method);
  if (duplicate) fail("DUPLICATE_INVESTIGATION_PROGRAM_REJECTED");
  const record: D3R2ProgramRecord = Object.freeze({
    investigationProgramId,
    contextId: context.contextId,
    objectId: object.objectId,
    purpose,
    campaignRef,
    method: method as D3R2ProgramRecord["method"],
    provider,
    investigationDate,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorInvestigationProgramId: predecessor?.investigationProgramId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.programs.findIndex((row) => row.investigationProgramId === predecessor.investigationProgramId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.programs[index] = superseded;
    remember(store, "PROGRAM", superseded.investigationProgramId, "SUPERSEDED", superseded.fingerprint);
  }
  store.programs.push(record);
  remember(store, "PROGRAM", record.investigationProgramId, "CREATED", record.fingerprint);
  return record;
}

export function recordInvestigationLocationContext(store: D3R2Store, actor: D3R1Actor, input: D3R2LocationInput): D3R2LocationRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["INVESTIGATION_LOCATION"], citedCurrentness);
  const program = requireProgram(store, actor, input.investigationProgramId, context.contextId, citedCurrentness);
  const locationContextId = explicit(input.locationContextId, "LOCATION_CONTEXT_REQUIRED");
  const locationEvidenceRef = explicit(input.locationEvidenceRef, "LOCATION_EVIDENCE_REQUIRED");
  const suppliedPosition = optionalExplicit(input.suppliedPosition, "LOCATION_POSITION_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorLocationContextId ? store.locations.find((row) => row.locationContextId === input.predecessorLocationContextId) : null;
  if (input.predecessorLocationContextId) {
    if (!predecessor) fail("LOCATION_CONTEXT_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    locationContextId,
    investigationProgramId: program.investigationProgramId,
    contextId: context.contextId,
    objectId: object.objectId,
    locationEvidenceRef,
    suppliedPosition,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    predecessorLocationContextId: predecessor?.locationContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.locations.find((row) => row.locationContextId === locationContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("LOCATION_CONTEXT_ALREADY_RECORDED");
  }
  const duplicate = store.locations.find((row) => row.recordStatus === "CURRENT" && row.locationContextId !== predecessor?.locationContextId && row.objectId === object.objectId && row.locationEvidenceRef === locationEvidenceRef && row.suppliedPosition === suppliedPosition);
  if (duplicate) fail("DUPLICATE_LOCATION_CONTEXT_REJECTED");
  const record: D3R2LocationRecord = Object.freeze({
    locationContextId,
    investigationProgramId: program.investigationProgramId,
    contextId: context.contextId,
    objectId: object.objectId,
    locationEvidenceRef,
    suppliedPosition,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
    engineeringValidated: false,
    locationInvented: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorLocationContextId: predecessor?.locationContextId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.locations.findIndex((row) => row.locationContextId === predecessor.locationContextId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.locations[index] = superseded;
    remember(store, "LOCATION", superseded.locationContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.locations.push(record);
  remember(store, "LOCATION", record.locationContextId, "CREATED", record.fingerprint);
  return record;
}

export function recordBoreholeEvidenceContext(store: D3R2Store, actor: D3R1Actor, input: D3R2BoreholeEvidenceInput): D3R2BoreholeEvidenceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["BOREHOLE"], citedCurrentness);
  const program = requireProgram(store, actor, input.investigationProgramId, context.contextId, citedCurrentness);
  const boreholeEvidenceId = explicit(input.boreholeEvidenceId, "BOREHOLE_EVIDENCE_REQUIRED");
  const sourceLogRef = explicit(input.sourceLogRef, "SOURCE_LOG_REQUIRED");
  const drillingRecordRef = explicit(input.drillingRecordRef, "DRILLING_RECORD_REQUIRED");
  const provider = explicit(input.provider, "PROVIDER_REQUIRED");
  const investigationDate = explicit(input.investigationDate, "INVESTIGATION_DATE_REQUIRED");
  const factualDepth = optionalExplicit(input.factualDepth, "FACTUAL_DEPTH_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorBoreholeEvidenceId ? store.boreholeEvidence.find((row) => row.boreholeEvidenceId === input.predecessorBoreholeEvidenceId) : null;
  if (input.predecessorBoreholeEvidenceId) {
    if (!predecessor) fail("BOREHOLE_EVIDENCE_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    boreholeEvidenceId,
    investigationProgramId: program.investigationProgramId,
    contextId: context.contextId,
    objectId: object.objectId,
    sourceLogRef,
    drillingRecordRef,
    provider,
    investigationDate,
    factualDepth,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    predecessorBoreholeEvidenceId: predecessor?.boreholeEvidenceId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.boreholeEvidence.find((row) => row.boreholeEvidenceId === boreholeEvidenceId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("BOREHOLE_EVIDENCE_ALREADY_RECORDED");
  }
  const duplicate = store.boreholeEvidence.find((row) => row.recordStatus === "CURRENT" && row.boreholeEvidenceId !== predecessor?.boreholeEvidenceId && row.objectId === object.objectId && row.sourceLogRef === sourceLogRef);
  if (duplicate) fail("DUPLICATE_BOREHOLE_EVIDENCE_REJECTED");
  const record: D3R2BoreholeEvidenceRecord = Object.freeze({
    boreholeEvidenceId,
    investigationProgramId: program.investigationProgramId,
    contextId: context.contextId,
    objectId: object.objectId,
    sourceLogRef,
    drillingRecordRef,
    provider,
    investigationDate,
    factualDepth,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
    engineeringValidated: false,
    stratigraphyInterpreted: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorBoreholeEvidenceId: predecessor?.boreholeEvidenceId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.boreholeEvidence.findIndex((row) => row.boreholeEvidenceId === predecessor.boreholeEvidenceId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.boreholeEvidence[index] = superseded;
    remember(store, "BOREHOLE_EVIDENCE", superseded.boreholeEvidenceId, "SUPERSEDED", superseded.fingerprint);
  }
  store.boreholeEvidence.push(record);
  remember(store, "BOREHOLE_EVIDENCE", record.boreholeEvidenceId, "CREATED", record.fingerprint);
  return record;
}

export function recordTestPitEvidenceContext(store: D3R2Store, actor: D3R1Actor, input: D3R2TestPitEvidenceInput): D3R2TestPitEvidenceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, ["TEST_PIT"], citedCurrentness);
  const program = requireProgram(store, actor, input.investigationProgramId, context.contextId, citedCurrentness);
  const testPitEvidenceId = explicit(input.testPitEvidenceId, "TEST_PIT_EVIDENCE_REQUIRED");
  const sourceLogRef = explicit(input.sourceLogRef, "SOURCE_LOG_REQUIRED");
  const excavationRecordRef = explicit(input.excavationRecordRef, "EXCAVATION_RECORD_REQUIRED");
  const provider = explicit(input.provider, "PROVIDER_REQUIRED");
  const investigationDate = explicit(input.investigationDate, "INVESTIGATION_DATE_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorTestPitEvidenceId ? store.testPitEvidence.find((row) => row.testPitEvidenceId === input.predecessorTestPitEvidenceId) : null;
  if (input.predecessorTestPitEvidenceId) {
    if (!predecessor) fail("TEST_PIT_EVIDENCE_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    testPitEvidenceId,
    investigationProgramId: program.investigationProgramId,
    contextId: context.contextId,
    objectId: object.objectId,
    sourceLogRef,
    excavationRecordRef,
    provider,
    investigationDate,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    predecessorTestPitEvidenceId: predecessor?.testPitEvidenceId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.testPitEvidence.find((row) => row.testPitEvidenceId === testPitEvidenceId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("TEST_PIT_EVIDENCE_ALREADY_RECORDED");
  }
  const duplicate = store.testPitEvidence.find((row) => row.recordStatus === "CURRENT" && row.testPitEvidenceId !== predecessor?.testPitEvidenceId && row.objectId === object.objectId && row.sourceLogRef === sourceLogRef);
  if (duplicate) fail("DUPLICATE_TEST_PIT_EVIDENCE_REJECTED");
  const record: D3R2TestPitEvidenceRecord = Object.freeze({
    testPitEvidenceId,
    investigationProgramId: program.investigationProgramId,
    contextId: context.contextId,
    objectId: object.objectId,
    sourceLogRef,
    excavationRecordRef,
    provider,
    investigationDate,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
    engineeringValidated: false,
    materialClassified: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorTestPitEvidenceId: predecessor?.testPitEvidenceId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.testPitEvidence.findIndex((row) => row.testPitEvidenceId === predecessor.testPitEvidenceId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.testPitEvidence[index] = superseded;
    remember(store, "TEST_PIT_EVIDENCE", superseded.testPitEvidenceId, "SUPERSEDED", superseded.fingerprint);
  }
  store.testPitEvidence.push(record);
  remember(store, "TEST_PIT_EVIDENCE", record.testPitEvidenceId, "CREATED", record.fingerprint);
  return record;
}

export function recordInvestigationEvidenceReference(store: D3R2Store, actor: D3R1Actor, input: D3R2EvidenceInput): D3R2EvidenceRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, EVIDENCE_OBJECT_TYPES, citedCurrentness);
  const evidenceReferenceId = explicit(input.evidenceReferenceId, "EVIDENCE_REFERENCE_REQUIRED");
  const evidenceKind = explicit(input.evidenceKind, "EVIDENCE_KIND_REQUIRED");
  if (!(D3_R2_EVIDENCE_REFERENCE_KINDS as readonly string[]).includes(evidenceKind)) fail("EVIDENCE_KIND_NOT_ALLOWLISTED");
  const sourceRevision = explicit(input.sourceRevision, "SOURCE_REVISION_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const predecessor = input.predecessorEvidenceReferenceId ? store.evidence.find((row) => row.evidenceReferenceId === input.predecessorEvidenceReferenceId) : null;
  if (input.predecessorEvidenceReferenceId) {
    if (!predecessor) fail("EVIDENCE_REFERENCE_NOT_FOUND");
    if (predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId) fail("R1_CONTEXT_MISMATCH");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    evidenceReferenceId,
    contextId: context.contextId,
    objectId: object.objectId,
    evidenceKind,
    sourceRevision,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    predecessorEvidenceReferenceId: predecessor?.evidenceReferenceId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.evidence.find((row) => row.evidenceReferenceId === evidenceReferenceId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("EVIDENCE_REFERENCE_ALREADY_RECORDED");
  }
  const duplicate = store.evidence.find((row) => row.recordStatus === "CURRENT" && row.evidenceReferenceId !== predecessor?.evidenceReferenceId && row.objectId === object.objectId && row.evidenceKind === evidenceKind && row.sourceRevision === sourceRevision);
  if (duplicate) fail("DUPLICATE_EVIDENCE_REFERENCE_REJECTED");
  const record: D3R2EvidenceRecord = Object.freeze({
    evidenceReferenceId,
    contextId: context.contextId,
    objectId: object.objectId,
    evidenceKind: evidenceKind as D3R2EvidenceRecord["evidenceKind"],
    sourceRevision,
    provenanceRef,
    citedCurrentness,
    authority: D3_CONTEXT_AUTHORITY,
    geotechnicalEngineeringAuthority: false,
    engineeringValidated: false,
    testResultParsed: false,
    parameterDerived: false,
    groundwaterInterpreted: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorEvidenceReferenceId: predecessor?.evidenceReferenceId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.evidence.findIndex((row) => row.evidenceReferenceId === predecessor.evidenceReferenceId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.evidence[index] = superseded;
    remember(store, "EVIDENCE", superseded.evidenceReferenceId, "SUPERSEDED", superseded.fingerprint);
  }
  store.evidence.push(record);
  remember(store, "EVIDENCE", record.evidenceReferenceId, "CREATED", record.fingerprint);
  return record;
}

export function mutateInvestigationEvidence(): never {
  return fail("INVESTIGATION_EVIDENCE_MUTATION_REJECTED");
}

export function repointInvestigationEvidence(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function interpretStratigraphy(): never {
  return fail("STRATIGRAPHY_NOT_IN_R2");
}

export function deriveGeotechnicalParameter(): never {
  return fail("PARAMETER_NOT_IN_R2");
}
