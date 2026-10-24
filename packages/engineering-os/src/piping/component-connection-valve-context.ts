/**
 * EOS-D5-R4 Piping component, connection, valve, and specialty context.
 * One bounded runtime on exact R1-R3 revisions. No sizing or adequacy calculations.
 */
import {
  D5_COMPONENT_CLASSIFICATIONS,
  D5_CURRENTNESS_STATES,
  D5_IMPLEMENTATION_PHASE_TYPES,
  D5_IMPLEMENTATION_PHASES,
  D5_MATURITY_STATES,
  MECHANICAL_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN,
  PIPING_COMPONENT_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  PIPING_CONNECTION_CONTEXT_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
} from "@rtb/types";
import { type D4R1Store } from "../mechanical/identity-foundation";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY as R3_READY,
  D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_READY,
  D5_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY as R2_READY,
  type D5R3Store,
} from "./design-condition-specification-context";
import {
  D5_CONTEXT_AUTHORITY,
  type D5R1Actor,
  type D5R1Store,
} from "./identity-foundation";
import {
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_REUSES_CANONICAL_CURRENTNESS,
  D5_REUSES_CANONICAL_FINGERPRINT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  type D5R2Store,
} from "./system-line-service-context";

export const D5_R4_STATUS = "COMPONENT_CONNECTION_AND_VALVE_CONTEXT_IMPLEMENTED" as const;
export const D5_R4_MATURITY = D5_R4_STATUS;
export const D5_R4_MATURITY_STATE = D5_R4_STATUS;
export const D5_R4_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D5_R4_COMPONENT_CONNECTION_AND_VALVE_CONTEXT_CLOSEOUT.md" as const;
export const D5_RUNTIME_STARTED = true as const;
export const D5_RUNTIME_COUNT = 4 as const;
export const D5_R3_RUNTIME_COUNT = R3_RUNTIME_COUNT;
export const D5_PIPING_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_READY;
export const D5_SYSTEM_LINE_SERVICE_CONTEXT_RUNTIME_READY = R2_READY;
export const D5_DESIGN_CONDITION_SPECIFICATION_RUNTIME_READY = R3_READY;
export const D5_R1_IDENTITY_REUSED = R1_READY;
export const D5_R2_SYSTEM_LINE_SERVICE_CONTEXT_REUSED = R2_READY;
export const D5_R3_DESIGN_CONDITION_SPECIFICATION_CONTEXT_REUSED = R3_READY;
export const EXACT_D5_R1_R3_REFERENCE_REQUIRED = true as const;
export const FLOATING_D5_R4_SOURCE_REFERENCE_ALLOWED = false as const;
export const D5_R4_SOURCE_AUTO_REPOINTED = false as const;
export const D5_COMPONENT_CONNECTION_VALVE_RUNTIME_IMPLEMENTED = true as const;
export const D5_COMPONENT_CONNECTION_VALVE_RUNTIME_COUNT = 1 as const;
export const D5_COMPONENT_CONNECTION_VALVE_RUNTIME_READY = true as const;
export const D5_PIPING_COMPONENT_CONTEXT_IMPLEMENTED = true as const;
export const D5_R3_SPECIFICATION_CLASS_REFERENCE_SUPPORTED = true as const;
export const EXACT_D5_R3_SPECIFICATION_CLASS_REVISION_REQUIRED = true as const;
export const D5_COMPONENT_IDENTITY_REQUIRED = true as const;
export const D5_INFERRED_COMPONENT_IDENTITY_ALLOWED = false as const;
export const PIPING_COMPONENT_CONTEXT_EQUALS_COMPONENT_SIZING_CALCULATION = false as const;
export const PIPING_SPECIFICATION_APPLICABLE_EQUALS_COMPONENT_ADEQUATE = false as const;
export const PIPING_CLASS_REFERENCE_EQUALS_COMPONENT_VALIDATED = false as const;
export const D5_PIPING_CONNECTION_CONTEXT_IMPLEMENTED = true as const;
export const D5_EXPLICIT_CONNECTION_RELATIONSHIP_REQUIRED = true as const;
export const D5_INFERRED_CONNECTION_RELATIONSHIP_ALLOWED = false as const;
export const PIPING_CONNECTION_CONTEXT_EQUALS_CONNECTION_ADEQUACY = false as const;
export const PIPING_CONNECTION_CONTEXT_EQUALS_STRESS_VALIDATED = false as const;
export const D5_PIPING_VALVE_CONTEXT_IMPLEMENTED = true as const;
export const VALVE_CONTEXT_EQUALS_VALVE_SIZING = false as const;
export const VALVE_CONTEXT_EQUALS_PROCESS_CONTROL_DESIGN = false as const;
export const VALVE_CONTEXT_EQUALS_VALIDATED_VALVE_SELECTION = false as const;
export const D5_PIPING_SPECIALTY_CONTEXT_IMPLEMENTED = true as const;
export const D5_D4_EQUIPMENT_CONNECTION_REFERENCE_SUPPORTED = true as const;
export const EXACT_D4_EQUIPMENT_INTERFACE_REVISION_REQUIRED = true as const;
export const D5_R4_MISSING_D4_COUNTERPART_AUTO_FABRICATED = false as const;
export const D5_R4_INFERRED_D4_COUNTERPART_ALLOWED = false as const;
export const D5_R4_DIMENSION_CONTEXT_EQUALS_CALCULATED_SIZE = false as const;
export const D5_R4_RATING_CONTEXT_EQUALS_CALCULATED_PRESSURE_RATING = false as const;
export const D5_BRANCH_CONNECTION_CONTEXT_SUPPORTED = true as const;
export const BRANCH_CONNECTION_CONTEXT_EQUALS_BRANCH_REINFORCEMENT_CALCULATION = false as const;
export const BRANCH_CONNECTION_CONTEXT_EQUALS_CODE_COMPLIANT_BRANCH = false as const;
export const D5_FLANGE_CONTEXT_SUPPORTED = true as const;
export const FLANGE_RATING_CONTEXT_EQUALS_FLANGE_ADEQUACY = false as const;
export const FLANGE_CONTEXT_EQUALS_CODE_CONFORMANCE = false as const;
export const VALVE_ACTUATION_CONTEXT_EQUALS_ELECTRICAL_DESIGN = false as const;
export const VALVE_ACTUATION_CONTEXT_EQUALS_IAC_DESIGN = false as const;
export const D5_R4_SOURCE_BASIS_REQUIRED = true as const;
export const D5_R4_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D5_R4_RECORD_AUTO_ACCEPTED = false as const;
export const D5_R4_APPLICABILITY_EXPLICIT = true as const;
export const D5_R4_LIMITATIONS_EXPLICIT = true as const;
export const D5_R4_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D5_R4_AUTOMATIC_COMPONENT_SELECTION_ALLOWED = false as const;
export const D5_R4_AUTOMATIC_VALVE_SELECTION_ALLOWED = false as const;
export const D5_R4_AUTOMATIC_SPECIALTY_SELECTION_ALLOWED = false as const;
export const D5_VALVE_SIZING_RUNTIME_COUNT = 0 as const;
export const D5_COMPONENT_SIZING_RUNTIME_COUNT = 0 as const;
export const D5_R4_HIDDEN_CALCULATION_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_COMPONENT = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_CONNECTION = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D5_VALVE = false as const;
export const ADMIN_CAN_PROMOTE_CANDIDATE_COMPONENT_TO_ENGINEERING_TRUTH = false as const;
export const D5_R4_PROVENANCE_REQUIRED = true as const;
export const D5_R4_PROVENANCE_PRESERVED = true as const;
export const D5_R4_AUTO_REPOINTED = false as const;
export const SILENT_D5_R4_MUTATION_ALLOWED = false as const;
export const D5_R4_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D5_R4_SCOPE_ENFORCED = true as const;
export const D5_R4_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D5_R4_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D5_R4_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_COUNT = 0 as const;
export const UNAUTHORIZED_D1_PACK_COMPLETION = false as const;
export const UNAUTHORIZED_D2_REOPEN = false as const;
export const UNAUTHORIZED_D3_REOPEN = false as const;
export const UNAUTHORIZED_D4_REOPEN = false as const;
export const UNAUTHORIZED_D5_R5_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D6_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_COMPONENT_SELECTION_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_PIPING_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_COUNTERPART_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D5_R5_CANONICAL_PHASE = D5_IMPLEMENTATION_PHASES[4];
export const D5_R5_PHASE_TYPE = D5_IMPLEMENTATION_PHASE_TYPES[4];
export const D5_R5_CANONICAL_SCOPE =
  "Implement governed Piping routing, arrangement, fabrication, isometric, spool and weld/joint context using exact R1-R4 revisions. Record supplied/adopted route constraints, slopes, elevations, arrangement context and fabrication evidence without automatic routing, geometry solving, clash detection, constructability determination, stress analysis or multidisciplinary optimization. Preserve explicit connection/component relationships and Mechanical access/maintenance boundaries." as const;
export const D5_R5_STARTED = false as const;
export const D5_R4_READY_FOR_NEXT_PHASE = true as const;
export const D5_R4_NEXT_PHASE = D5_R5_CANONICAL_PHASE;
export const D5_R4_NEXT_PHASE_TYPE = D5_R5_PHASE_TYPE;
export const D5_R4_CANONICAL_NEXT_PHASE = D5_R5_CANONICAL_PHASE;
export const D5_R4_CANONICAL_NEXT_PHASE_SCOPE = D5_R5_CANONICAL_SCOPE;
export const D5_R4_BLOCKER = "NONE" as const;
export const D5_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;
export const D5_R4_CONNECTION_KINDS = [
  "COMPONENT_TO_COMPONENT",
  "LINE_TO_COMPONENT",
  "BRANCH",
  "FLANGE_INTERFACE",
  "EQUIPMENT",
  "SPECIALTY",
] as const;
export const D5_R4_VALVE_TYPES = ["GATE", "GLOBE", "BALL", "CHECK", "BUTTERFLY", "PLUG", "OTHER_VALVE"] as const;
export const D5_R4_SOURCE_BASIS_CATEGORIES = [
  "R3_SPECIFICATION_CLASS",
  "PROJECT_PIPING_DATA",
  "EQUIPMENT_INTERFACE_RECORD",
  "VENDOR_MANUFACTURER_EVIDENCE",
  "PROJECT_SPECIFICATION",
  "AUTHORIZED_PIPING_ENGINEERING_INPUT",
] as const;

export {
  PIPING_COMPONENT_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  MECHANICAL_NOZZLE_CONTEXT_EQUALS_PIPING_DESIGN,
  PIPING_CONNECTION_CONTEXT_EQUALS_MECHANICAL_EQUIPMENT_DESIGN,
  D5_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D5_CURRENTNESS_ENGINE_CREATED,
  D5_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D5_FINGERPRINT_ALGORITHM_CREATED,
  AI_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D5_PIPING_ENGINEERING_AUTHORITY,
  D5_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D5_EQUALS_D2_CIVIL_AUTHORITY,
  D5_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D5_EQUALS_D4_MECHANICAL_AUTHORITY,
  D5_EQUALS_D6_PROCESS_AUTHORITY,
  D5_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D5_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D5_PIPE_SIZING_RUNTIME_COUNT,
  D5_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D5_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D5_WALL_THICKNESS_CALCULATION_RUNTIME_COUNT,
  D5_BRANCH_REINFORCEMENT_CALCULATION_RUNTIME_COUNT,
  D5_FLANGE_RATING_CALCULATION_RUNTIME_COUNT,
  D5_PIPING_STRESS_CALCULATION_RUNTIME_COUNT,
  D5_FLEXIBILITY_CALCULATION_RUNTIME_COUNT,
  D5_SUPPORT_LOAD_CALCULATION_RUNTIME_COUNT,
  D5_ROUTING_ARRANGEMENT_FABRICATION_RUNTIME_COUNT,
  D5_STRESS_SUPPORT_TEST_EVIDENCE_RUNTIME_COUNT,
  D5_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D5_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D5_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D5_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D5_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D5_D9_RUNTIME_INTEGRATION_COUNT,
  D5_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D5_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D5_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D5_APPROVAL_RUNTIME_COUNT,
  D5_CERTIFICATION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D5_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set([
  "inferred", "drawing_proximity", "line_graphics", "neighboring_text", "tag_similarity",
  "bom_adjacency", "ai_semantic", "shared_vendor", "geometry", "proximity", "all", "global",
]);
const D4_INTERFACE_TYPES = ["MECHANICAL_EQUIPMENT", "MECHANICAL_INTERFACE_POINT", "STATIC_EQUIPMENT", "ROTATING_EQUIPMENT"] as const;

type Measure = { value: string; unit: string } | null;
type Prohibited = {
  autoSelect?: boolean;
  inferIdentity?: boolean;
  inferConnection?: boolean;
  fabricateCounterpart?: boolean;
  calculatedSize?: boolean;
  calculatedRating?: boolean;
  reinforcementCalculation?: boolean;
  flangeAdequacy?: boolean;
  valveSizing?: boolean;
  electricalDesign?: boolean;
  iacDesign?: boolean;
  engineeringValidated?: boolean;
  propagate?: boolean;
  hiddenCalculation?: boolean;
};

type BoundInput = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  specificationId: string;
  specificationFingerprint: string;
  citedLifecycleStage: string;
  citedCurrentness: string;
  provenanceRef: string;
  sourceBasisRef: string;
  sourceBasisCategory: string;
  applicabilityRef: string;
  limitations: string;
  identityBasis: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  predecessorId?: string | null;
};

export type D5R4ComponentInput = BoundInput & {
  componentRecordId: string;
  componentClassification: string;
  size?: { value?: string | null; unit?: string | null } | null;
  materialContext?: string | null;
  ratingContext?: string | null;
};

export type D5R4ComponentRecord = {
  componentRecordId: string;
  componentClassification: (typeof D5_COMPONENT_CLASSIFICATIONS)[number];
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  specificationId: string;
  specificationFingerprint: string;
  size: Measure;
  materialContext: string | null;
  ratingContext: string | null;
  applicabilityRef: string;
  limitations: string;
  sourceBasisRef: string;
  sourceBasisCategory: (typeof D5_R4_SOURCE_BASIS_CATEGORIES)[number];
  provenanceRef: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  citedCurrentness: (typeof D5_CURRENTNESS_STATES)[number];
  engineeringValidated: false;
  sizingCalculation: false;
  specificationImpliesAdequate: false;
  classValidated: false;
  calculatedSize: false;
  calculatedRating: false;
  branchReinforcementCalculation: false;
  codeCompliantBranch: false;
  flangeAdequacy: false;
  flangeConformance: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorId: string | null;
};

export type D5R4ConnectionInput = BoundInput & {
  connectionRecordId: string;
  connectionKind: string;
  connectionBasis: string;
  fromObjectId: string;
  fromRevisionFingerprint: string;
  toObjectId: string;
  toRevisionFingerprint: string;
  equipmentObjectId?: string | null;
  equipmentRevisionFingerprint?: string | null;
  counterpartAbsent?: boolean;
};

export type D5R4ConnectionRecord = {
  connectionRecordId: string;
  connectionKind: (typeof D5_R4_CONNECTION_KINDS)[number];
  connectionBasis: "EXPLICIT";
  fromObjectId: string;
  fromRevisionFingerprint: string;
  toObjectId: string;
  toRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  specificationId: string;
  specificationFingerprint: string;
  applicabilityRef: string;
  limitations: string;
  sourceBasisRef: string;
  provenanceRef: string;
  tenantId: string;
  d4CounterpartPresent: boolean;
  d4EquipmentObjectId: string | null;
  d4EquipmentRevisionFingerprint: string | null;
  mechanicalEquipmentDesign: false;
  nozzleEqualsPipingDesign: false;
  connectionAdequacy: false;
  stressValidated: false;
  inferred: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorId: string | null;
};

export type D5R4ValveInput = BoundInput & {
  valveRecordId: string;
  valveTag: string;
  valveType: string;
  actuationContext?: string | null;
  failPosition?: string | null;
  size?: { value?: string | null; unit?: string | null } | null;
  ratingContext?: string | null;
};

export type D5R4ValveRecord = {
  valveRecordId: string;
  valveTag: string;
  valveType: (typeof D5_R4_VALVE_TYPES)[number];
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  lineContextFingerprint: string;
  specificationId: string;
  specificationFingerprint: string;
  actuationContext: string | null;
  failPosition: string | null;
  size: Measure;
  ratingContext: string | null;
  applicabilityRef: string;
  limitations: string;
  sourceBasisRef: string;
  provenanceRef: string;
  tenantId: string;
  valveSizing: false;
  processControlDesign: false;
  validatedSelection: false;
  electricalDesign: false;
  iacDesign: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorId: string | null;
};

export type D5R4SpecialtyInput = BoundInput & {
  specialtyRecordId: string;
  specialtyDescription: string;
};

export type D5R4SpecialtyRecord = {
  specialtyRecordId: string;
  specialtyDescription: string;
  objectId: string;
  objectRevisionFingerprint: string;
  lineRecordId: string;
  specificationId: string;
  specificationFingerprint: string;
  applicabilityRef: string;
  limitations: string;
  sourceBasisRef: string;
  provenanceRef: string;
  tenantId: string;
  engineeringAdequate: false;
  automaticSelection: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorId: string | null;
};

export type D5R4History = {
  historyId: string;
  subjectKind: "COMPONENT" | "CONNECTION" | "VALVE" | "SPECIALTY";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D5R4Store = {
  r1: D5R1Store;
  r2: D5R2Store;
  r3: D5R3Store;
  d4: D4R1Store | null;
  now: () => string;
  components: D5R4ComponentRecord[];
  connections: D5R4ConnectionRecord[];
  valves: D5R4ValveRecord[];
  specialties: D5R4SpecialtyRecord[];
  history: D5R4History[];
};

function fail(code: string): never {
  throw new Error(`D5_R4_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function assertActor(actor: D5R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PIPING_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PIPING_AUTHORITY");
  if (actor.authority !== D5_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertProhibited(input: Prohibited): void {
  if (input.autoSelect === true) fail("AUTOMATIC_SELECTION_REJECTED");
  if (input.inferIdentity === true) fail("INFERRED_IDENTITY_REJECTED");
  if (input.inferConnection === true) fail("INFERRED_CONNECTION_REJECTED");
  if (input.fabricateCounterpart === true) fail("COUNTERPART_NOT_FABRICATED");
  if (input.calculatedSize === true || input.calculatedRating === true || input.reinforcementCalculation === true || input.flangeAdequacy === true || input.valveSizing === true || input.hiddenCalculation === true) fail("CALCULATION_NOT_IN_R4");
  if (input.electricalDesign === true) fail("ELECTRICAL_DESIGN_NOT_IN_R4");
  if (input.iacDesign === true) fail("IAC_DESIGN_NOT_IN_R4");
  if (input.engineeringValidated === true) fail("VALIDATION_NOT_IN_R4");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
}

function measure(input: { value?: string | null; unit?: string | null } | null | undefined): Measure {
  if (!input || (input.value == null && input.unit == null)) return null;
  const value = explicit(input.value ?? "", "SIZE_REQUIRED");
  if (/[=]|calc\(/i.test(value)) fail("CALCULATION_NOT_IN_R4");
  if (!input.unit?.trim()) fail("UNITS_REQUIRED");
  return { value, unit: explicit(input.unit, "UNIT_INVALID") };
}

function remember(store: D5R4Store, subjectKind: D5R4History["subjectKind"], subjectId: string, action: D5R4History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function prepare(store: D5R4Store, actor: D5R1Actor, input: BoundInput, allowedTypes: readonly string[]) {
  assertActor(actor);
  assertProhibited(input);
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (input.identityBasis.trim() !== "EXPLICIT") fail("INFERRED_IDENTITY_REJECTED");
  const cited = input.citedCurrentness.trim();
  if (!(D5_CURRENTNESS_STATES as readonly string[]).includes(cited)) fail("CURRENTNESS_INVALID");
  const stage = input.citedLifecycleStage.trim();
  if (!(D5_MATURITY_STATES as readonly string[]).includes(stage)) fail("MATURITY_STAGE_INVALID");
  const objectId = explicit(input.objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === objectId);
  if (!object || object.fingerprint !== revision) fail(object ? "R1_REVISION_MISMATCH" : "R1_OBJECT_NOT_FOUND");
  if (!allowedTypes.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  const lineRecordId = explicit(input.lineRecordId, "R2_LINE_REQUIRED");
  const lineRevision = explicit(input.lineContextFingerprint, "R2_REVISION_REQUIRED");
  const line = store.r2.lines.find((row) => row.lineRecordId === lineRecordId);
  if (!line || line.fingerprint !== lineRevision) fail(line ? "R2_REVISION_MISMATCH" : "R2_LINE_NOT_FOUND");
  if (line.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && line.recordStatus !== "CURRENT") fail("R2_CONTEXT_NOT_CURRENT");
  const specificationId = explicit(input.specificationId, "R3_SPECIFICATION_REQUIRED");
  const specificationFingerprint = explicit(input.specificationFingerprint, "R3_REVISION_REQUIRED");
  const specification = store.r3.specifications.find((row) => row.specificationId === specificationId);
  if (!specification || specification.fingerprint !== specificationFingerprint) fail(specification ? "R3_REVISION_MISMATCH" : "R3_SPECIFICATION_NOT_FOUND");
  if (specification.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  if (cited === "CURRENT" && specification.recordStatus !== "CURRENT") fail("R3_SPECIFICATION_NOT_CURRENT");
  const applicabilityRef = explicit(input.applicabilityRef, "APPLICABILITY_REQUIRED");
  if (applicabilityRef !== object.objectId) fail("APPLICABILITY_MISMATCH");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const sourceBasisCategory = explicit(input.sourceBasisCategory, "SOURCE_BASIS_REQUIRED");
  if (!(D5_R4_SOURCE_BASIS_CATEGORIES as readonly string[]).includes(sourceBasisCategory)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  return {
    object, line, specification, citedCurrentness: cited as (typeof D5_CURRENTNESS_STATES)[number],
    applicabilityRef, limitations, sourceBasisRef, provenanceRef,
    sourceBasisCategory: sourceBasisCategory as (typeof D5_R4_SOURCE_BASIS_CATEGORIES)[number],
  };
}

function requireEnd(store: D5R4Store, actor: D5R1Actor, objectId: string, revision: string) {
  const id = explicit(objectId, "CONNECTION_END_REQUIRED");
  const fingerprint = explicit(revision, "CONNECTION_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object || object.fingerprint !== fingerprint) fail(object ? "CONNECTION_REVISION_MISMATCH" : "CONNECTION_END_NOT_FOUND");
  if (object.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
  return object;
}

export function createD5R4Store(r1: D5R1Store, r2: D5R2Store, r3: D5R3Store, d4: D4R1Store | null = null, now: () => string = () => "2026-10-24T00:00:00.000Z"): D5R4Store {
  return { r1, r2, r3, d4, now, components: [], connections: [], valves: [], specialties: [], history: [] };
}

export function recordPipingComponentContext(store: D5R4Store, actor: D5R1Actor, input: D5R4ComponentInput): D5R4ComponentRecord {
  const prepared = prepare(store, actor, input, ["PIPING_COMPONENT_CONTEXT"]);
  const componentRecordId = explicit(input.componentRecordId, "COMPONENT_REQUIRED");
  const componentClassification = explicit(input.componentClassification, "COMPONENT_CLASSIFICATION_REQUIRED");
  if (!(D5_COMPONENT_CLASSIFICATIONS as readonly string[]).includes(componentClassification)) fail("COMPONENT_CLASSIFICATION_NOT_ALLOWLISTED");
  const size = measure(input.size);
  const materialContext = input.materialContext == null || input.materialContext === "" ? null : explicit(input.materialContext, "MATERIAL_CONTEXT_INVALID");
  const ratingContext = input.ratingContext == null || input.ratingContext === "" ? null : explicit(input.ratingContext, "RATING_CONTEXT_INVALID");
  if ((materialContext && /[=]|calc\(/i.test(materialContext)) || (ratingContext && /[=]|calc\(/i.test(ratingContext))) fail("CALCULATION_NOT_IN_R4");
  const predecessor = input.predecessorId ? store.components.find((row) => row.componentRecordId === input.predecessorId) : null;
  if (input.predecessorId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.objectId !== prepared.object.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    componentRecordId, componentClassification, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId, lineContextFingerprint: prepared.line.fingerprint,
    specificationId: prepared.specification.specificationId, specificationFingerprint: prepared.specification.fingerprint,
    size, materialContext, ratingContext, applicabilityRef: prepared.applicabilityRef, limitations: prepared.limitations,
    sourceBasisRef: prepared.sourceBasisRef, predecessorId: predecessor?.componentRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.components.find((row) => row.componentRecordId === componentRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_COMPONENT_REJECTED");
  const duplicate = store.components.find((row) => row.recordStatus === "CURRENT" && row.componentRecordId !== predecessor?.componentRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.componentClassification === componentClassification);
  if (duplicate) fail("DUPLICATE_COMPONENT_REJECTED");
  const record: D5R4ComponentRecord = Object.freeze({
    componentRecordId,
    componentClassification: componentClassification as D5R4ComponentRecord["componentClassification"],
    objectId: prepared.object.objectId,
    objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId,
    lineContextFingerprint: prepared.line.fingerprint,
    specificationId: prepared.specification.specificationId,
    specificationFingerprint: prepared.specification.fingerprint,
    size,
    materialContext,
    ratingContext,
    applicabilityRef: prepared.applicabilityRef,
    limitations: prepared.limitations,
    sourceBasisRef: prepared.sourceBasisRef,
    sourceBasisCategory: prepared.sourceBasisCategory,
    provenanceRef: prepared.provenanceRef,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    citedCurrentness: prepared.citedCurrentness,
    engineeringValidated: false,
    sizingCalculation: false,
    specificationImpliesAdequate: false,
    classValidated: false,
    calculatedSize: false,
    calculatedRating: false,
    branchReinforcementCalculation: false,
    codeCompliantBranch: false,
    flangeAdequacy: false,
    flangeConformance: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorId: predecessor?.componentRecordId ?? null,
  });
  if (predecessor) {
    const index = store.components.findIndex((row) => row.componentRecordId === predecessor.componentRecordId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    store.components[index] = superseded;
    remember(store, "COMPONENT", superseded.componentRecordId, "SUPERSEDED", superseded.fingerprint);
  }
  store.components.push(record);
  remember(store, "COMPONENT", record.componentRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingConnectionContext(store: D5R4Store, actor: D5R1Actor, input: D5R4ConnectionInput): D5R4ConnectionRecord {
  const prepared = prepare(store, actor, input, ["PIPING_CONNECTION_CONTEXT", "PIPING_COMPONENT_CONTEXT"]);
  if (input.connectionBasis.trim() !== "EXPLICIT") fail("INFERRED_CONNECTION_REJECTED");
  const connectionRecordId = explicit(input.connectionRecordId, "CONNECTION_REQUIRED");
  const connectionKind = explicit(input.connectionKind, "CONNECTION_KIND_REQUIRED");
  if (!(D5_R4_CONNECTION_KINDS as readonly string[]).includes(connectionKind)) fail("CONNECTION_KIND_NOT_EXPLICIT");
  const from = requireEnd(store, actor, input.fromObjectId, input.fromRevisionFingerprint);
  const to = requireEnd(store, actor, input.toObjectId, input.toRevisionFingerprint);
  let d4CounterpartPresent = false;
  let d4EquipmentObjectId: string | null = null;
  let d4EquipmentRevisionFingerprint: string | null = null;
  if (connectionKind !== "EQUIPMENT" && (input.equipmentObjectId || input.counterpartAbsent === true)) fail("D4_REFERENCE_NOT_APPLICABLE");
  if (connectionKind === "EQUIPMENT") {
    if (input.counterpartAbsent === true && input.equipmentObjectId) fail("COUNTERPART_STATUS_CONTRADICTION");
    if (input.counterpartAbsent === true) {
      d4CounterpartPresent = false;
    } else {
      const equipmentId = explicit(input.equipmentObjectId ?? "", "D4_COUNTERPART_REQUIRED");
      const equipmentRevision = explicit(input.equipmentRevisionFingerprint ?? "", "D4_REVISION_REQUIRED");
      const equipment = store.d4?.objects.find((row) => row.objectId === equipmentId);
      if (!equipment || equipment.fingerprint !== equipmentRevision) fail(equipment ? "D4_REVISION_MISMATCH" : "D4_COUNTERPART_NOT_FOUND");
      if (!(D4_INTERFACE_TYPES as readonly string[]).includes(equipment.objectType)) fail("D4_OBJECT_TYPE_MISMATCH");
      if (equipment.tenantId !== actor.tenantId) fail("CROSS_SCOPE_OPERATION");
      d4CounterpartPresent = true;
      d4EquipmentObjectId = equipment.objectId;
      d4EquipmentRevisionFingerprint = equipment.fingerprint;
    }
  }
  const before = store.d4 ? store.d4.objects.length : 0;
  const fingerprint = fingerprintCanonical({
    connectionRecordId, connectionKind, fromObjectId: from.objectId, fromRevisionFingerprint: from.fingerprint,
    toObjectId: to.objectId, toRevisionFingerprint: to.fingerprint, d4EquipmentObjectId, d4EquipmentRevisionFingerprint,
    lineRecordId: prepared.line.lineRecordId, specificationId: prepared.specification.specificationId,
    specificationFingerprint: prepared.specification.fingerprint, applicabilityRef: prepared.applicabilityRef,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.connections.find((row) => row.connectionRecordId === connectionRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_CONNECTION_REJECTED");
  const duplicate = store.connections.find((row) => row.recordStatus === "CURRENT" && row.fromObjectId === from.objectId && row.toObjectId === to.objectId && row.connectionKind === connectionKind && row.fromRevisionFingerprint === from.fingerprint);
  if (duplicate) fail("DUPLICATE_CONNECTION_REJECTED");
  const record: D5R4ConnectionRecord = Object.freeze({
    connectionRecordId,
    connectionKind: connectionKind as D5R4ConnectionRecord["connectionKind"],
    connectionBasis: "EXPLICIT",
    fromObjectId: from.objectId,
    fromRevisionFingerprint: from.fingerprint,
    toObjectId: to.objectId,
    toRevisionFingerprint: to.fingerprint,
    lineRecordId: prepared.line.lineRecordId,
    lineContextFingerprint: prepared.line.fingerprint,
    specificationId: prepared.specification.specificationId,
    specificationFingerprint: prepared.specification.fingerprint,
    applicabilityRef: prepared.applicabilityRef,
    limitations: prepared.limitations,
    sourceBasisRef: prepared.sourceBasisRef,
    provenanceRef: prepared.provenanceRef,
    tenantId: actor.tenantId,
    d4CounterpartPresent,
    d4EquipmentObjectId,
    d4EquipmentRevisionFingerprint,
    mechanicalEquipmentDesign: false,
    nozzleEqualsPipingDesign: false,
    connectionAdequacy: false,
    stressValidated: false,
    inferred: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorId: null,
  });
  store.connections.push(record);
  remember(store, "CONNECTION", record.connectionRecordId, "CREATED", record.fingerprint);
  if (store.d4 && store.d4.objects.length !== before) fail("COUNTERPART_NOT_FABRICATED");
  return record;
}

export function recordPipingValveContext(store: D5R4Store, actor: D5R1Actor, input: D5R4ValveInput): D5R4ValveRecord {
  const prepared = prepare(store, actor, input, ["PIPING_VALVE_CONTEXT"]);
  const valveRecordId = explicit(input.valveRecordId, "VALVE_REQUIRED");
  const valveTag = explicit(input.valveTag, "VALVE_TAG_REQUIRED");
  const valveType = explicit(input.valveType, "VALVE_TYPE_REQUIRED");
  if (!(D5_R4_VALVE_TYPES as readonly string[]).includes(valveType)) fail("VALVE_TYPE_NOT_ALLOWLISTED");
  const actuationContext = input.actuationContext == null || input.actuationContext === "" ? null : explicit(input.actuationContext, "ACTUATION_CONTEXT_INVALID");
  const failPosition = input.failPosition == null || input.failPosition === "" ? null : explicit(input.failPosition, "FAIL_POSITION_INVALID");
  const size = measure(input.size);
  const ratingContext = input.ratingContext == null || input.ratingContext === "" ? null : explicit(input.ratingContext, "RATING_CONTEXT_INVALID");
  if (ratingContext && /[=]|calc\(/i.test(ratingContext)) fail("CALCULATION_NOT_IN_R4");
  const fingerprint = fingerprintCanonical({
    valveRecordId, valveTag, valveType, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId, specificationId: prepared.specification.specificationId,
    specificationFingerprint: prepared.specification.fingerprint, actuationContext, failPosition, size, ratingContext,
    applicabilityRef: prepared.applicabilityRef, limitations: prepared.limitations,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.valves.find((row) => row.valveRecordId === valveRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_VALVE_REJECTED");
  const duplicate = store.valves.find((row) => row.recordStatus === "CURRENT" && row.objectId === prepared.object.objectId && row.valveType === valveType && row.objectRevisionFingerprint === prepared.object.fingerprint);
  if (duplicate) fail("DUPLICATE_VALVE_REJECTED");
  const record: D5R4ValveRecord = Object.freeze({
    valveRecordId, valveTag, valveType: valveType as D5R4ValveRecord["valveType"],
    objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId, lineContextFingerprint: prepared.line.fingerprint,
    specificationId: prepared.specification.specificationId, specificationFingerprint: prepared.specification.fingerprint,
    actuationContext, failPosition, size, ratingContext,
    applicabilityRef: prepared.applicabilityRef, limitations: prepared.limitations,
    sourceBasisRef: prepared.sourceBasisRef, provenanceRef: prepared.provenanceRef, tenantId: actor.tenantId,
    valveSizing: false, processControlDesign: false, validatedSelection: false, electricalDesign: false, iacDesign: false,
    fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorId: null,
  });
  store.valves.push(record);
  remember(store, "VALVE", record.valveRecordId, "CREATED", record.fingerprint);
  return record;
}

export function recordPipingSpecialtyContext(store: D5R4Store, actor: D5R1Actor, input: D5R4SpecialtyInput): D5R4SpecialtyRecord {
  const prepared = prepare(store, actor, input, ["PIPING_SPECIALTY_CONTEXT"]);
  const specialtyRecordId = explicit(input.specialtyRecordId, "SPECIALTY_REQUIRED");
  const specialtyDescription = explicit(input.specialtyDescription, "SPECIALTY_DESCRIPTION_REQUIRED");
  const fingerprint = fingerprintCanonical({
    specialtyRecordId, specialtyDescription, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId, specificationId: prepared.specification.specificationId,
    specificationFingerprint: prepared.specification.fingerprint, applicabilityRef: prepared.applicabilityRef,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.specialties.find((row) => row.specialtyRecordId === specialtyRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("DUPLICATE_SPECIALTY_REJECTED");
  const record: D5R4SpecialtyRecord = Object.freeze({
    specialtyRecordId, specialtyDescription,
    objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    lineRecordId: prepared.line.lineRecordId, specificationId: prepared.specification.specificationId,
    specificationFingerprint: prepared.specification.fingerprint, applicabilityRef: prepared.applicabilityRef,
    limitations: prepared.limitations, sourceBasisRef: prepared.sourceBasisRef, provenanceRef: prepared.provenanceRef,
    tenantId: actor.tenantId, engineeringAdequate: false, automaticSelection: false,
    fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", currentness: "CURRENT", predecessorId: null,
  });
  store.specialties.push(record);
  remember(store, "SPECIALTY", record.specialtyRecordId, "CREATED", record.fingerprint);
  return record;
}

export function mutatePipingComponentContext(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function repointPipingComponentContext(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function selectPipingComponent(): never {
  return fail("AUTOMATIC_SELECTION_REJECTED");
}

export function calculatePiping(): never {
  return fail("CALCULATION_NOT_IN_R4");
}

export function recordPipingRoute(): never {
  return fail("ROUTING_NOT_IN_R4");
}

export function recordPipingStressSupport(): never {
  return fail("STRESS_SUPPORT_NOT_IN_R4");
}

export function validatePipingEngineering(): never {
  return fail("VALIDATION_NOT_IN_R4");
}
