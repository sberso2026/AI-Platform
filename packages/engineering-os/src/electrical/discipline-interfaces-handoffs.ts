/**
 * EOS-D7-R8 Electrical discipline interfaces and handoffs.
 * One bounded runtime on exact R1-R7 revisions. A handoff cites an exact counterpart.
 * It does not become that discipline's engineering truth, validation, or approval.
 */
import {
  D7_CURRENTNESS_STATES,
  D7_D1_FUTURE_CONTRACT_SUBJECTS,
  D7_D2_FUTURE_CONTRACT_SUBJECTS,
  D7_D3_FUTURE_CONTRACT_SUBJECTS,
  D7_D4_INTERFACE_SUBJECTS,
  D7_D5_INTERFACE_SUBJECTS,
  D7_D6_INTERFACE_ARCHITECTURE_COMPATIBLE_WITH_D6_R8,
  D7_D6_INTERFACE_SUBJECTS,
  D7_D8_FUTURE_CONTRACT_SUBJECTS,
  D7_ELECTRICAL_OBJECT_TYPES,
  D7_IMPLEMENTATION_PHASE_TYPES,
  D7_IMPLEMENTATION_PHASES,
  D7_INTERFACE_TRANSFERS_DISCIPLINE_AUTHORITY,
  D7_MATURITY_STATES,
} from "@rtb/types";
import { D2_R8_HANDOFF_STATUSES } from "../civil/discipline-interfaces-handoffs";
import { assertHumanApprovalActor } from "../decision-intelligence/invariants";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D1K_R3_AI_CAN_APPROVE_INTERFACE,
  D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED,
} from "../structural-systems/interface-handoff-governance";
import { assertInterfaceDirectionality, assertInterfaceType } from "../systems-intelligence/invariants";
import { D7_CONTEXT_AUTHORITY, D7_DISCIPLINE, D7_EXPLICIT_RELATIONSHIP_KINDS, type D7R1Actor } from "./identity-foundation";
import {
  D7_APPROVAL_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  D7_REUSES_CANONICAL_FINGERPRINT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_RUNTIME_COUNT as R7_RUNTIME_COUNT,
  D7_R7_DEPENDENCY_TARGETS,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_REOPENED,
  D2_TRACK_COMPLETE,
  D3_REOPENED,
  D3_TRACK_COMPLETE,
  D4_REOPENED,
  D4_TRACK_COMPLETE,
  D5_REOPENED,
  D5_TRACK_COMPLETE,
  D6_REOPENED,
  D6_STATUS,
  D6_TRACK_COMPLETE,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  UNAUTHORIZED_APPROVAL_PROMOTION,
  UNAUTHORIZED_CERTIFICATION_PROMOTION,
  UNAUTHORIZED_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_VALIDATION_PROMOTION,
  type D7R7Store,
} from "./requirements-assumptions-change";

export const D7_R8_STATUS = "DISCIPLINE_INTERFACES_AND_HANDOFFS_IMPLEMENTED" as const;
export const D7_R8_MATURITY = D7_R8_STATUS;
export const D7_R8_MATURITY_STATE = D7_R8_STATUS;
export const D7_R8_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D7_R8_DISCIPLINE_INTERFACES_AND_HANDOFFS_CLOSEOUT.md" as const;
export const D7_RUNTIME_STARTED = true as const;
export const D7_RUNTIME_COUNT = 8 as const;
export const D7_DISCIPLINE_INTERFACE_RUNTIME_IMPLEMENTED = true as const;
export const D7_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 1 as const;
export const D7_DISCIPLINE_INTERFACE_RUNTIME_READY = true as const;
export const D7_R1_R7_EXACT_SOURCE_REVISIONS_REUSED = true as const;
export const EXACT_D7_R8_SOURCE_REVISION_REQUIRED = true as const;
export const FLOATING_D7_R8_SOURCE_REFERENCE_ALLOWED = false as const;
export const D7_R8_SOURCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const EXACT_D7_R8_COUNTERPART_REVISION_REQUIRED = true as const;
export const FLOATING_D7_R8_COUNTERPART_REFERENCE_ALLOWED = false as const;
export const D7_R8_COUNTERPART_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const D7_REUSES_CANONICAL_DISCIPLINE_INTERFACE_GOVERNANCE = true as const;
export const PARALLEL_D7_INTERFACE_FRAMEWORK_CREATED = false as const;
export const D7_R8_EXPLICIT_COUNTERPART_REQUIRED = true as const;
export const D7_R8_INFERRED_COUNTERPART_ALLOWED = false as const;
export const D7_R8_HANDOFF_RECORD_IMPLEMENTED = true as const;
export const D7_R8_HANDOFF_EXACT_REVISION_REQUIRED = true as const;
export const D7_HANDOFF_CONTENT_EQUALS_COUNTERPART_ENGINEERING_TRUTH = false as const;
export const D7_HANDOFF_COMPLETED_EQUALS_COUNTERPART_VALIDATED = false as const;
export const D7_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_APPROVED = false as const;
export const D7_HANDOFF_ACCEPTED_EQUALS_COUNTERPART_CONFORMANT = false as const;
export const D7_R8_SOURCE_AUTHORITY_PRESERVED = true as const;
export const D7_R8_COUNTERPART_AUTHORITY_PRESERVED = true as const;
export const D7_R8_TRANSFERS_DISCIPLINE_AUTHORITY = D7_INTERFACE_TRANSFERS_DISCIPLINE_AUTHORITY;
export const D7_D4_HANDOFF_IMPLEMENTED = true as const;
export const EXACT_D4_COUNTERPART_REVISION_REQUIRED = true as const;
export const D7_HANDOFF_TO_D4_EQUALS_MECHANICAL_DESIGN = false as const;
export const D7_R8_VALIDATES_D4_MECHANICAL_ENGINEERING = false as const;
export const D7_R8_MUTATES_D4_COUNTERPART = false as const;
export const D7_D6_HANDOFF_IMPLEMENTED = true as const;
export const D7_D6_INTERFACE_COMPATIBLE_WITH_EXISTING_D6_R8_CONTRACT = D7_D6_INTERFACE_ARCHITECTURE_COMPATIBLE_WITH_D6_R8;
export const EXACT_D6_COUNTERPART_REVISION_REQUIRED = true as const;
export const D7_HANDOFF_TO_D6_EQUALS_PROCESS_DESIGN = false as const;
export const D7_R8_VALIDATES_D6_PROCESS_ENGINEERING = false as const;
export const D7_R8_MUTATES_D6_COUNTERPART = false as const;
export const D7_D8_HANDOFF_CONTRACT_IMPLEMENTED = true as const;
export const D7_POWER_INTERFACE_EQUALS_D8_IAC_DESIGN = false as const;
export const D7_TRIP_CONTEXT_EQUALS_D8_CONTROL_LOGIC_DESIGN = false as const;
export const D7_PROTECTION_CONTEXT_EQUALS_D8_IAC_IMPLEMENTATION = false as const;
export const D7_PROTECTION_CONTEXT_EQUALS_FUNCTIONAL_SAFETY_VALIDATION = false as const;
export const D7_D1_INTERFACE_CONTEXT_SUPPORTED = true as const;
export const D7_R8_VALIDATES_D1_STRUCTURAL_ENGINEERING = false as const;
export const D7_R8_MUTATES_D1_COUNTERPART = false as const;
export const D7_D2_INTERFACE_CONTEXT_SUPPORTED = true as const;
export const D7_R8_VALIDATES_D2_CIVIL_ENGINEERING = false as const;
export const D7_R8_MUTATES_D2_COUNTERPART = false as const;
export const D7_D3_INTERFACE_CONTEXT_SUPPORTED = true as const;
export const D7_R8_VALIDATES_D3_GEOTECHNICAL_ENGINEERING = false as const;
export const D7_R8_MUTATES_D3_COUNTERPART = false as const;
export const D7_D5_INTERFACE_CONTEXT_SUPPORTED = true as const;
export const D7_R8_VALIDATES_D5_PIPING_ENGINEERING = false as const;
export const D7_R8_MUTATES_D5_COUNTERPART = false as const;
export const D7_LOAD_CONTEXT_EQUALS_COUNTERPART_ENGINEERING_TRUTH = false as const;
export const D7_FEEDER_CONTEXT_EQUALS_COUNTERPART_ENGINEERING_TRUTH = false as const;
export const D7_PROTECTION_CONTEXT_EQUALS_COUNTERPART_ENGINEERING_TRUTH = false as const;
export const D7_REQUIREMENT_EQUALS_COUNTERPART_ADOPTED_REQUIREMENT = false as const;
export const D7_R8_AUTO_ADOPTS_HANDOFF_AS_COUNTERPART_REQUIREMENT = false as const;
export const D7_R8_AUTO_ADOPTS_HANDOFF_AS_COUNTERPART_DESIGN = false as const;
export const D7_R8_AUTO_ADOPTS_HANDOFF_AS_COUNTERPART_VALIDATION = false as const;
export const D7_R8_R7_CHANGE_INTEGRATION_IMPLEMENTED = true as const;
export const D7_R8_R7_REASSESSMENT_INTEGRATION_IMPLEMENTED = true as const;
export const D7_R8_CHANGE_AUTO_MUTATES_COUNTERPART = false as const;
export const D7_R8_CHANGE_AUTO_RECALCULATES_COUNTERPART = false as const;
export const D7_R8_CHANGE_AUTO_REVALIDATES_COUNTERPART = false as const;
export const D7_R8_EXPLICIT_INTERFACE_DEPENDENCY_REQUIRED = true as const;
export const D7_R8_INFERRED_INTERFACE_DEPENDENCY_ALLOWED = false as const;
export const D7_R8_HANDOFF_CURRENTNESS_INTEGRATED = true as const;
export const STALE_D7_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const SUPERSEDED_D7_HANDOFF_EXPOSED_AS_CURRENT = false as const;
export const D7_R8_AUTO_REPOINTS_INTERFACE_COUNTERPART = false as const;
export const D7_R8_AUTO_REPOINTS_SOURCE_REFERENCE = false as const;
export const D7_R8_AUTO_MUTATES_INTERFACE_COUNTERPART = false as const;
export const D7_R8_AUTO_MUTATES_R1_IDENTITY = false as const;
export const D7_R8_AUTO_MUTATES_R2_SYSTEM_SOURCE_DISTRIBUTION = false as const;
export const D7_R8_AUTO_MUTATES_R3_LOAD_CONSUMER_EQUIPMENT = false as const;
export const D7_R8_AUTO_MUTATES_R4_FEEDER_CABLE_RATING = false as const;
export const D7_R8_AUTO_MUTATES_R5_CALCULATION_EVIDENCE = false as const;
export const D7_R8_AUTO_MUTATES_R6_PROTECTION_GROUNDING_HAZARDOUS_AREA = false as const;
export const D7_R8_AUTO_MUTATES_R7_CHANGE_GOVERNANCE = false as const;
export const D7_R8_HISTORY_PRESERVED = true as const;
export const D7_R8_HISTORICAL_REFERENCE_AUTO_REPOINTED = D1K_R3_SILENT_SOURCE_REPOINTING_ALLOWED;
export const SILENT_D7_R8_MUTATION_ALLOWED = false as const;
export const D7_R8_SOURCE_BASIS_REQUIRED = true as const;
export const D7_R8_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D7_R8_HANDOFF_AUTO_ACCEPTED = false as const;
export const D7_R8_APPLICABILITY_EXPLICIT = true as const;
export const D7_R8_LIMITATIONS_EXPLICIT = true as const;
export const D7_R8_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D7_R8_PROVENANCE_REQUIRED = true as const;
export const D7_R8_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D7_R8_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D7_R8_ACCESS_ALLOWED = false as const;
export const AI_CAN_INVENT_D7_INTERFACE_COUNTERPART = D1K_R3_AI_CAN_APPROVE_INTERFACE;
export const AI_CAN_INVENT_D7_HANDOFF_RELATIONSHIP = D1K_R3_AI_CAN_APPROVE_INTERFACE;
export const AI_CAN_PROMOTE_D7_HANDOFF_TO_COUNTERPART_VALIDATION = false as const;
export const ADMIN_CAN_PROMOTE_D7_HANDOFF_TO_COUNTERPART_APPROVAL = false as const;
export const D7_R8_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D7_R8_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D7_R8_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const UNAUTHORIZED_D7_R9_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_INFERRED_INTERFACE_COUNTERPART = false as const;
export const UNAUTHORIZED_INTERFACE_AUTO_REPOINT = false as const;
export const UNAUTHORIZED_COUNTERPART_MUTATION = false as const;
export const UNAUTHORIZED_COUNTERPART_RECALCULATION = false as const;
export const UNAUTHORIZED_COUNTERPART_REVALIDATION = false as const;
export const UNAUTHORIZED_HANDOFF_TO_COUNTERPART_TRUTH_PROMOTION = false as const;
export const UNAUTHORIZED_HANDOFF_TO_COUNTERPART_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_HANDOFF_TO_COUNTERPART_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER = false as const;
export const UNAUTHORIZED_ELECTRICAL_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_ELECTRICAL_DESIGN_PROMOTION = false as const;
export const UNAUTHORIZED_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;
export const D7_R8_HANDOFF_STATUSES = D2_R8_HANDOFF_STATUSES;
export const D7_R8_DIRECTIONS = ["D7_TO_COUNTERPART", "COUNTERPART_TO_D7"] as const;
export const D7_R8_COUNTERPART_DISCIPLINES = ["mechanical", "process", "instrumentation_control", "structural", "civil", "geotechnical", "piping"] as const;
export const D7_R9_CANONICAL_PHASE = D7_IMPLEMENTATION_PHASES[8];
export const D7_R9_PHASE_TYPE = D7_IMPLEMENTATION_PHASE_TYPES[8];
export const D7_R9_CANONICAL_SCOPE =
  "Implement canonical Electrical review and validation governance using exact D7 R1-R8 revisions. Support review requests, findings, dispositions, review completion, reviewer authority and explicit validation state while preserving review requested != completed, review completed != validated, finding closed != validated, and validated != conformant/approved/certified/regulatory-approved. Integrate R7 reassessment and R8 handoff review context without transferring validation to counterpart disciplines. Automatic Electrical engineering validation remains zero." as const;
export const D7_R9_STARTED = false as const;
export const D7_R8_READY_FOR_NEXT_PHASE = true as const;
export const D7_R8_NEXT_PHASE = D7_R9_CANONICAL_PHASE;
export const D7_R8_NEXT_PHASE_TYPE = D7_R9_PHASE_TYPE;
export const D7_R8_CANONICAL_NEXT_PHASE = D7_R9_CANONICAL_PHASE;
export const D7_R8_CANONICAL_NEXT_PHASE_SCOPE = D7_R9_CANONICAL_SCOPE;
export const D7_R8_BLOCKER = "NONE" as const;
export const D7_R8_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export {
  D7_D6_INTERFACE_SUBJECTS,
  D7_D8_FUTURE_CONTRACT_SUBJECTS,
  D7_D8_RUNTIME_INTEGRATION_COUNT,
  D7_ELECTRICAL_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_CALCULATION_RUNTIME_COUNT,
  D7_LOAD_FLOW_CALCULATION_RUNTIME_COUNT,
  D7_SHORT_CIRCUIT_CALCULATION_RUNTIME_COUNT,
  D7_MOTOR_STARTING_CALCULATION_RUNTIME_COUNT,
  D7_VOLTAGE_DROP_CALCULATION_RUNTIME_COUNT,
  D7_CABLE_SIZING_CALCULATION_RUNTIME_COUNT,
  D7_PROTECTION_COORDINATION_CALCULATION_RUNTIME_COUNT,
  D7_ARC_FLASH_CALCULATION_RUNTIME_COUNT,
  D7_GROUNDING_CALCULATION_RUNTIME_COUNT,
  D7_POWER_QUALITY_CALCULATION_RUNTIME_COUNT,
  D7_HARMONIC_CALCULATION_RUNTIME_COUNT,
  D7_BATTERY_UPS_CALCULATION_RUNTIME_COUNT,
  D7_HAZARDOUS_AREA_CLASSIFICATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_DESIGN_RUNTIME_COUNT,
  D7_AUTOMATIC_ELECTRICAL_REDESIGN_RUNTIME_COUNT,
  D7_REVIEW_VALIDATION_RUNTIME_COUNT,
  D7_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D7_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D7_APPROVAL_RUNTIME_COUNT,
  D7_CERTIFICATION_RUNTIME_COUNT,
  D7_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D7_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D7_D9_RUNTIME_INTEGRATION_COUNT,
  D7_REUSES_CANONICAL_CURRENTNESS,
  PARALLEL_D7_CURRENTNESS_ENGINE_CREATED,
  CURRENT_D7_RECORD_EQUALS_VALIDATED,
  STALE_D7_RECORD_EQUALS_INVALID,
  SUPERSEDED_D7_RECORD_EQUALS_INVALID,
  D7_REUSES_CANONICAL_DIGITAL_THREAD,
  PARALLEL_D7_DIGITAL_THREAD_CREATED,
  D7_EXPLICIT_LINEAGE_REQUIRED,
  D7_INFERRED_LINEAGE_ALLOWED,
  D7_REUSES_CANONICAL_FINGERPRINT,
  SECOND_D7_FINGERPRINT_ALGORITHM_CREATED,
  D7_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D7_EQUALS_D2_CIVIL_AUTHORITY,
  D7_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D7_EQUALS_D4_MECHANICAL_AUTHORITY,
  D7_EQUALS_D5_PIPING_AUTHORITY,
  D7_EQUALS_D6_PROCESS_AUTHORITY,
  D7_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  AI_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D7_ELECTRICAL_ENGINEERING_AUTHORITY,
  D7_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D7_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D1_STRUCTURAL_PACK_COMPLETE,
  D1N_REOPENED,
  D2_TRACK_COMPLETE,
  D2_REOPENED,
  D3_TRACK_COMPLETE,
  D3_REOPENED,
  D4_TRACK_COMPLETE,
  D4_REOPENED,
  D5_TRACK_COMPLETE,
  D5_REOPENED,
  D6_TRACK_COMPLETE,
  D6_STATUS,
  D6_REOPENED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  UNAUTHORIZED_APPROVAL_PROMOTION,
  UNAUTHORIZED_CERTIFICATION_PROMOTION,
  UNAUTHORIZED_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_ELECTRICAL_VALIDATION_PROMOTION,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model", "now"]);
const INFERRED = new Set(["inferred", "matching_name", "matching_tag", "same_system", "same_voltage", "topology", "topology_proximity", "same_source_document", "semantic_similarity", "ai_inference", "ai_reasoning", "drawing", "document_co_occurrence"]);
const BROAD = new Set(["all", "global", "every", "any"]);
const FUTURE = new Set(["instrumentation_control"]);

type Stage = (typeof D7_MATURITY_STATES)[number];
type Currentness = (typeof D7_CURRENTNESS_STATES)[number];
type SourceKind = (typeof D7_R7_DEPENDENCY_TARGETS)[number];
type Discipline = (typeof D7_R8_COUNTERPART_DISCIPLINES)[number];
type Direction = (typeof D7_R8_DIRECTIONS)[number];
type HandoffStatus = (typeof D7_R8_HANDOFF_STATUSES)[number];

export type D7R8CounterpartSnapshot = {
  discipline: Exclude<Discipline, "instrumentation_control">;
  counterpartId: string;
  sourceRevision: string;
  fingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
};

export type D7R8CounterpartPin = {
  counterpartId: string;
  sourceRevision: string;
  fingerprint: string;
  discipline: Discipline;
};

export type D7R8Dependency = {
  kind: (typeof D7_EXPLICIT_RELATIONSHIP_KINDS)[number];
  targetKind: SourceKind;
  targetId: string;
  targetFingerprint: string;
};

type Prohibited = {
  inferCounterpart?: boolean;
  transferAuthority?: boolean;
  validateCounterpart?: boolean;
  mutateCounterpart?: boolean;
  recalculateCounterpart?: boolean;
  revalidateCounterpart?: boolean;
  redesignCounterpart?: boolean;
  repointCounterpart?: boolean;
  repointSource?: boolean;
  autoAdoptRequirement?: boolean;
  autoAdoptDesign?: boolean;
  autoAdoptValidation?: boolean;
  acceptAsApproved?: boolean;
  acceptAsConformant?: boolean;
  createIacDesign?: boolean;
  functionalSafetyValidation?: boolean;
  reasonAcrossDisciplines?: boolean;
  mutateR1?: boolean;
  mutateR2?: boolean;
  mutateR3?: boolean;
  mutateR4?: boolean;
  mutateR5?: boolean;
  mutateR6?: boolean;
  mutateR7?: boolean;
  propagateOutsideApplicability?: boolean;
};

export type D7R8HandoffRecord = {
  handoffId: string;
  contextId: string;
  objectId: string;
  objectType: string;
  objectRevisionFingerprint: string;
  sourceKind: SourceKind;
  sourceId: string;
  sourceFingerprint: string;
  dependencies: D7R8Dependency[];
  counterpartDiscipline: Discipline;
  direction: Direction;
  interfaceTopic: string;
  suppliedContent: string;
  counterpart: D7R8CounterpartPin | null;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  sourceAuthority: typeof D7_CONTEXT_AUTHORITY;
  receivingAuthority: Discipline;
  authorityTransferred: false;
  interfaceAccepted: boolean;
  interfaceComplete: boolean;
  engineeringValidated: false;
  approved: false;
  conformant: false;
  counterpartTruth: false;
  mechanicalDesign: false;
  processDesign: false;
  iacDesign: false;
  functionalSafetyValidated: false;
  handoffStatus: HandoffStatus;
  citedCurrentness: Currentness;
  currentness: Currentness;
  citedLifecycleStage: Stage;
  fingerprint: string;
  predecessorHandoffId: string | null;
  predecessorFingerprint: string | null;
  recordStatus: "CURRENT" | "SUPERSEDED";
  tenantId: string;
  workspaceId: string;
  projectId: string;
  deleted: false;
  invalidated: false;
  createdAt: string;
  createdBy: string;
};

export type D7R8History = {
  historyId: string;
  handoffId: string;
  action: "CREATED" | "SUPERSEDED" | "CURRENTNESS_MARKED";
  fingerprint: string;
  recordedAt: string;
};

export type D7R8Store = {
  r7: D7R7Store;
  counterparts: readonly D7R8CounterpartSnapshot[];
  now: () => string;
  handoffs: D7R8HandoffRecord[];
  history: D7R8History[];
};

type SourcePin = { fingerprint: string; tenantId: string; recordStatus: string; objectId: string };

function fail(code: string): never {
  throw new Error(`D7_R8_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  if (/[=]|calc\(|solve\(/i.test(token)) fail("HIDDEN_CALCULATION_REJECTED");
  return token;
}

function assertActor(actor: D7R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_ELECTRICAL_AUTHORITY");
  if (actor.authority === "ELECTRICAL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_ELECTRICAL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D7_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
  assertHumanApprovalActor("human", actor.actorId);
}

function assertProhibited(input: Prohibited): void {
  if (input.inferCounterpart === true) fail("INFERRED_COUNTERPART_REJECTED");
  if (input.transferAuthority === true) fail("AUTHORITY_TRANSFER_REJECTED");
  if (input.validateCounterpart === true || input.autoAdoptValidation === true) fail("COUNTERPART_VALIDATION_REJECTED");
  if (input.mutateCounterpart === true) fail("COUNTERPART_MUTATION_REJECTED");
  if (input.recalculateCounterpart === true) fail("COUNTERPART_RECALCULATION_REJECTED");
  if (input.revalidateCounterpart === true) fail("COUNTERPART_REVALIDATION_REJECTED");
  if (input.redesignCounterpart === true || input.autoAdoptDesign === true) fail("COUNTERPART_REDESIGN_REJECTED");
  if (input.repointCounterpart === true || input.repointSource === true) fail("AUTO_REPOINT_REJECTED");
  if (input.autoAdoptRequirement === true) fail("COUNTERPART_ADOPTION_REJECTED");
  if (input.acceptAsApproved === true) fail("COUNTERPART_APPROVAL_REJECTED");
  if (input.acceptAsConformant === true) fail("COUNTERPART_CONFORMANCE_REJECTED");
  if (input.createIacDesign === true) fail("D8_DESIGN_NOT_IN_R8");
  if (input.functionalSafetyValidation === true) fail("FUNCTIONAL_SAFETY_VALIDATION_NOT_IN_R8");
  if (input.reasonAcrossDisciplines === true) fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
  if (input.propagateOutsideApplicability === true) fail("APPLICABILITY_PROPAGATION_REJECTED");
  if (input.mutateR1 === true || input.mutateR2 === true || input.mutateR3 === true || input.mutateR4 === true || input.mutateR5 === true || input.mutateR6 === true || input.mutateR7 === true) fail("UPSTREAM_MUTATION_REJECTED");
}

function sameScope(row: { tenantId: string; workspaceId: string; projectId: string }, actor: D7R1Actor): boolean {
  return row.tenantId === actor.tenantId && row.workspaceId === actor.workspaceId && row.projectId === actor.projectId;
}

function findSource(store: D7R7Store, kind: string, id: string): SourcePin | undefined {
  const r2 = store.r6.r5.r4.r2;
  const r3 = store.r6.r5.r4.r3;
  const r4 = store.r6.r5.r4;
  if (kind === "R1_IDENTITY") return store.r1.objects.find((row) => row.objectId === id);
  if (kind === "R2_SYSTEM") return r2.systems.find((row) => row.systemRecordId === id);
  if (kind === "R2_SOURCE") return r2.sources.find((row) => row.sourceRecordId === id);
  if (kind === "R2_DISTRIBUTION") return r2.distributions.find((row) => row.distributionRecordId === id);
  if (kind === "R3_LOAD") return r3.loads.find((row) => row.loadRecordId === id);
  if (kind === "R3_CONSUMER") return r3.consumers.find((row) => row.consumerRecordId === id);
  if (kind === "R3_SUPPLY") return r3.supplies.find((row) => row.supplyRecordId === id);
  if (kind === "R4_FEEDER") return r4.feeders.find((row) => row.feederRecordId === id);
  if (kind === "R4_CABLE") return r4.cables.find((row) => row.cableRecordId === id);
  if (kind === "R4_RATING") return r4.ratings.find((row) => row.ratingRecordId === id);
  if (kind === "R5_EVIDENCE") return store.r6.r5.evidence.find((row) => row.evidenceId === id);
  if (kind === "R6_DEVICE") return store.r6.devices.find((row) => row.deviceRecordId === id);
  if (kind === "R6_SETTING") return store.r6.settings.find((row) => row.settingRecordId === id);
  if (kind === "R6_GROUNDING") return store.r6.grounding.find((row) => row.groundingRecordId === id);
  if (kind === "R6_HAZARDOUS_AREA") return store.r6.hazardousAreas.find((row) => row.areaRecordId === id);
  if (kind === "R6_SUITABILITY") {
    const row = store.r6.suitability.find((item) => item.suitabilityRecordId === id);
    return row ? { fingerprint: row.fingerprint, tenantId: row.tenantId, recordStatus: row.recordStatus, objectId: row.equipmentObjectId } : undefined;
  }
  if (kind === "R7_REQUIREMENT") return store.requirements.find((row) => row.requirementId === id);
  if (kind === "R7_ASSUMPTION") return store.assumptions.find((row) => row.assumptionId === id);
  if (kind === "R7_DECISION") return store.decisions.find((row) => row.decisionId === id);
  return undefined;
}

function seal(store: D7R8Store): string {
  const r7 = store.r7;
  const r6 = r7.r6;
  const r5 = r6.r5;
  const r4 = r5.r4;
  const r3 = r4.r3;
  const r2 = r4.r2;
  return JSON.stringify({
    objects: r7.r1.objects.map((row) => [row.objectId, row.fingerprint, row.recordStatus]),
    systems: r2.systems.map((row) => [row.systemRecordId, row.fingerprint, row.recordStatus]),
    loads: r3.loads.map((row) => [row.loadRecordId, row.fingerprint, row.suppliedValue, row.adopted]),
    feeders: r4.feeders.map((row) => [row.feederRecordId, row.fingerprint, row.protectionCoordination]),
    evidence: r5.evidence.map((row) => [row.evidenceId, row.fingerprint, row.eosCalculated]),
    settings: r6.settings.map((row) => [row.settingRecordId, row.fingerprint, row.suppliedValue, row.calculated]),
    requirements: r7.requirements.map((row) => [row.requirementId, row.fingerprint, row.recordStatus, row.adopted]),
    changes: r7.changes.map((row) => [row.changeId, row.fingerprint, row.recordStatus]),
    reassessments: r7.reassessments.map((row) => [row.reassessmentId, row.fingerprint, row.state, row.validationFailed]),
    counterparts: store.counterparts.map((row) => [row.discipline, row.counterpartId, row.sourceRevision, row.fingerprint, row.recordStatus]),
  });
}

function topicFor(discipline: Discipline, topic: string): string {
  const value = explicit(topic, "INTERFACE_TOPIC_REQUIRED");
  const allowed = discipline === "mechanical"
    ? D7_D4_INTERFACE_SUBJECTS
    : discipline === "process"
      ? D7_D6_INTERFACE_SUBJECTS
      : discipline === "instrumentation_control"
        ? D7_D8_FUTURE_CONTRACT_SUBJECTS
        : discipline === "structural"
          ? D7_D1_FUTURE_CONTRACT_SUBJECTS
          : discipline === "civil"
            ? D7_D2_FUTURE_CONTRACT_SUBJECTS
            : discipline === "geotechnical"
              ? D7_D3_FUTURE_CONTRACT_SUBJECTS
              : D7_D5_INTERFACE_SUBJECTS;
  if (!(allowed as readonly string[]).includes(value)) fail("INTERFACE_TOPIC_INVALID");
  return value;
}

function pinCounterpart(store: D7R8Store, actor: D7R1Actor, discipline: Discipline, id: string | null | undefined, revision: string | null | undefined, fingerprint: string | null | undefined, cited: Currentness): D7R8CounterpartPin | null {
  const present = (id != null && id.trim() !== "") || (revision != null && revision.trim() !== "") || (fingerprint != null && fingerprint.trim() !== "");
  if (FUTURE.has(discipline)) {
    if (present) fail("D8_COUNTERPART_FABRICATION_REJECTED");
    return null;
  }
  if (!present) fail("COUNTERPART_REQUIRED");
  const counterpartId = explicit(id ?? "", "COUNTERPART_REFERENCE_REQUIRED");
  const sourceRevision = explicit(revision ?? "", "COUNTERPART_REVISION_REQUIRED");
  const asserted = explicit(fingerprint ?? "", "COUNTERPART_FINGERPRINT_REQUIRED");
  const row = store.counterparts.find((item) => item.discipline === discipline && item.counterpartId === counterpartId);
  if (!row || !sameScope(row, actor)) fail("COUNTERPART_NOT_FOUND");
  if (row.sourceRevision !== sourceRevision || row.fingerprint !== asserted) fail("COUNTERPART_REVISION_MISMATCH");
  if (cited === "CURRENT" && row.recordStatus !== "CURRENT") fail("COUNTERPART_NOT_CURRENT");
  return { counterpartId: row.counterpartId, sourceRevision: row.sourceRevision, fingerprint: row.fingerprint, discipline };
}

export function createD7R8Store(
  r7: D7R7Store,
  counterparts: readonly D7R8CounterpartSnapshot[] = [],
  now: () => string = () => r7.now(),
): D7R8Store {
  if (R7_RUNTIME_COUNT !== 7) fail("R7_RUNTIME_COUNT_UNEXPECTED");
  if (r7.r6.r5.r1 !== r7.r1 || r7.r6.r5.r4.r1 !== r7.r1 || r7.r6.r5.r4.r2.r1 !== r7.r1 || r7.r6.r5.r4.r3.r1 !== r7.r1 || r7.r6.r5.r4.r3.r2 !== r7.r6.r5.r4.r2) fail("R1_R7_STORE_MISMATCH");
  return { r7, counterparts, now, handoffs: [], history: [] };
}

export function currentElectricalInterfaceHandoffs(store: D7R8Store, actor: D7R1Actor): D7R8HandoffRecord[] {
  return store.handoffs.filter((row) => sameScope(row, actor) && row.recordStatus === "CURRENT" && row.currentness === "CURRENT");
}

export function recordElectricalInterfaceHandoff(store: D7R8Store, actor: D7R1Actor, input: Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  sourceKind: string;
  sourceId: string;
  sourceFingerprint: string;
  dependencies: { kind: string; targetKind: string; targetId: string; targetFingerprint: string; inferred?: boolean; inference?: string | null }[];
  counterpartDiscipline: string;
  direction: string;
  interfaceTopic: string;
  suppliedContent: string;
  counterpartId?: string | null;
  counterpartRevision?: string | null;
  counterpartFingerprint?: string | null;
  handoffStatus: string;
  citedCurrentness: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedLifecycleStage: string;
  handoffId: string;
  predecessorHandoffId?: string | null;
  identityBasis: string;
  inference?: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  assertedFingerprint?: string | null;
}): D7R8HandoffRecord {
  assertActor(actor);
  assertProhibited(input);
  assertInterfaceType("ELECTRICAL");
  assertInterfaceDirectionality("directed");
  if (input.identityBasis.trim() !== "EXPLICIT") fail("INFERRED_COUNTERPART_REJECTED");
  if (input.inference != null && input.inference.trim() !== "") fail("INFERRED_COUNTERPART_REJECTED");
  const tenantId = explicit(input.tenantId, "SCOPE_REQUIRED");
  const workspaceId = explicit(input.workspaceId, "SCOPE_REQUIRED");
  const projectId = explicit(input.projectId, "SCOPE_REQUIRED");
  if (tenantId !== actor.tenantId || workspaceId !== actor.workspaceId || projectId !== actor.projectId) fail("SCOPE_MISMATCH");
  const citedCurrentness = input.citedCurrentness.trim();
  if (!(D7_CURRENTNESS_STATES as readonly string[]).includes(citedCurrentness)) fail("CURRENTNESS_INVALID");
  const cited = citedCurrentness as Currentness;
  const before = seal(store);
  const contextId = explicit(input.contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r7.r1.contexts.find((row) => row.contextId === contextId);
  if (!context || !sameScope(context, actor)) fail("R1_CONTEXT_NOT_FOUND");
  const object = store.r7.r1.objects.find((row) => row.objectId === explicit(input.objectId, "R1_OBJECT_REQUIRED"));
  const objectRevision = explicit(input.objectRevisionFingerprint, "R1_REVISION_REQUIRED");
  if (!object || !(D7_ELECTRICAL_OBJECT_TYPES as readonly string[]).includes(object.objectType) || object.fingerprint !== objectRevision || !sameScope(object, actor)) {
    fail(object ? "R1_REVISION_MISMATCH" : "R1_OBJECT_NOT_FOUND");
  }
  const sourceKind = explicit(input.sourceKind, "SOURCE_KIND_REQUIRED");
  if (!(D7_R7_DEPENDENCY_TARGETS as readonly string[]).includes(sourceKind)) fail("SOURCE_KIND_INVALID");
  const source = findSource(store.r7, sourceKind, explicit(input.sourceId, "SOURCE_REQUIRED"));
  const sourceFingerprint = explicit(input.sourceFingerprint, "SOURCE_REVISION_REQUIRED");
  if (!source || source.fingerprint !== sourceFingerprint || source.tenantId !== actor.tenantId || source.objectId !== object.objectId) {
    fail(source ? "SOURCE_REVISION_MISMATCH" : "SOURCE_NOT_FOUND");
  }
  if (cited === "CURRENT" && [context, object, source].some((row) => row.recordStatus !== "CURRENT")) fail("SOURCE_NOT_CURRENT");
  if (!input.dependencies?.length) fail("EXPLICIT_DEPENDENCY_REQUIRED");
  const sourceId = explicit(input.sourceId, "SOURCE_REQUIRED");
  const dependencies = input.dependencies.map((link) => {
    if (link.inferred === true || (link.inference != null && link.inference.trim() !== "")) fail("INFERRED_DEPENDENCY_REJECTED");
    const kind = explicit(link.kind, "RELATIONSHIP_NOT_EXPLICIT");
    if (!(D7_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(kind)) fail("RELATIONSHIP_NOT_EXPLICIT");
    const targetKind = explicit(link.targetKind, "DEPENDENCY_TARGET_REQUIRED");
    if (!(D7_R7_DEPENDENCY_TARGETS as readonly string[]).includes(targetKind)) fail("DEPENDENCY_TARGET_INVALID");
    const targetId = explicit(link.targetId, "DEPENDENCY_TARGET_REQUIRED");
    const targetFingerprint = explicit(link.targetFingerprint, "DEPENDENCY_REVISION_REQUIRED");
    const target = findSource(store.r7, targetKind, targetId);
    if (!target || target.fingerprint !== targetFingerprint || target.tenantId !== actor.tenantId) fail("DEPENDENCY_REVISION_MISMATCH");
    return { kind: kind as D7R8Dependency["kind"], targetKind: targetKind as SourceKind, targetId, targetFingerprint };
  });
  if (!dependencies.some((link) => link.targetKind === sourceKind && link.targetId === sourceId && link.targetFingerprint === source.fingerprint)) fail("SOURCE_DEPENDENCY_REQUIRED");
  const disciplineToken = explicit(input.counterpartDiscipline, "COUNTERPART_DISCIPLINE_REQUIRED");
  if (!(D7_R8_COUNTERPART_DISCIPLINES as readonly string[]).includes(disciplineToken)) fail("COUNTERPART_DISCIPLINE_INVALID");
  const discipline = disciplineToken as Discipline;
  const directionToken = explicit(input.direction, "DIRECTION_REQUIRED");
  if (!(D7_R8_DIRECTIONS as readonly string[]).includes(directionToken)) fail("DIRECTION_INVALID");
  const interfaceTopic = topicFor(discipline, input.interfaceTopic);
  const suppliedContent = explicit(input.suppliedContent, "HANDOFF_CONTENT_REQUIRED");
  const counterpart = pinCounterpart(store, actor, discipline, input.counterpartId, input.counterpartRevision, input.counterpartFingerprint, cited);
  const handoffStatus = explicit(input.handoffStatus, "HANDOFF_STATUS_REQUIRED");
  if (!(D7_R8_HANDOFF_STATUSES as readonly string[]).includes(handoffStatus)) fail("HANDOFF_STATUS_INVALID");
  if ((FUTURE.has(discipline) || !counterpart) && handoffStatus === "COMPLETE") fail("INCOMPLETE_COUNTERPART_NOT_COMPLETE");
  if (handoffStatus === "COMPLETE" && cited !== "CURRENT") fail("CURRENTNESS_STATUS_MISMATCH");
  if ((handoffStatus === "AWAITING_COUNTERPART" || handoffStatus === "NOT_YET_AVAILABLE") && counterpart) fail("COUNTERPART_NOT_AWAITING");
  if (!FUTURE.has(discipline) && (handoffStatus === "AWAITING_COUNTERPART" || handoffStatus === "NOT_YET_AVAILABLE")) fail("COUNTERPART_REQUIRED");
  if (handoffStatus === "STALE" && cited !== "STALE") fail("CURRENTNESS_STATUS_MISMATCH");
  if (handoffStatus === "REASSESSMENT_REQUIRED" && cited !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_STATUS_MISMATCH");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "PROVENANCE_REQUIRED");
  const sourceBasisRef = explicit(input.sourceBasisRef, "SOURCE_BASIS_REQUIRED");
  const stage = input.citedLifecycleStage.trim();
  if (!(D7_MATURITY_STATES as readonly string[]).includes(stage)) fail("LIFECYCLE_INVALID");
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const predecessorId = input.predecessorHandoffId ? explicit(input.predecessorHandoffId, "HANDOFF_ID_REQUIRED") : null;
  const predecessor = predecessorId ? store.handoffs.find((row) => row.handoffId === predecessorId) : null;
  if (predecessorId && (!predecessor || predecessor.tenantId !== actor.tenantId)) fail("HANDOFF_NOT_FOUND");
  if (predecessor && predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    handoffId, contextId, objectId: object.objectId, objectRevisionFingerprint: object.fingerprint,
    sourceKind, sourceId, sourceFingerprint: source.fingerprint, dependencies, counterpartDiscipline: discipline,
    direction: directionToken, interfaceTopic, suppliedContent, counterpart, applicability, limitations, provenanceRef, sourceBasisRef,
    handoffStatus, citedCurrentness: cited, authority: D7_CONTEXT_AUTHORITY, predecessorHandoffId: predecessor?.handoffId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.handoffs.find((row) => row.handoffId === handoffId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("HANDOFF_ALREADY_RECORDED");
  const signature = `${object.objectId}|${object.fingerprint}|${sourceKind}|${source.fingerprint}|${discipline}|${directionToken}|${interfaceTopic}|${counterpart?.counterpartId ?? ""}|${counterpart?.sourceRevision ?? ""}`;
  if (store.handoffs.some((row) => row.recordStatus === "CURRENT" && row.handoffId !== predecessor?.handoffId && `${row.objectId}|${row.objectRevisionFingerprint}|${row.sourceKind}|${row.sourceFingerprint}|${row.counterpartDiscipline}|${row.direction}|${row.interfaceTopic}|${row.counterpart?.counterpartId ?? ""}|${row.counterpart?.sourceRevision ?? ""}` === signature)) {
    fail("DUPLICATE_HANDOFF_REJECTED");
  }
  if (predecessor) {
    const priorRevision = predecessor.objectRevisionFingerprint;
    const priorCounterpart = predecessor.counterpart?.sourceRevision ?? null;
    const index = store.handoffs.findIndex((row) => row.handoffId === predecessor.handoffId);
    store.handoffs[index] = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", currentness: "SUPERSEDED" });
    if (store.handoffs[index]?.objectRevisionFingerprint !== priorRevision || (store.handoffs[index]?.counterpart?.sourceRevision ?? null) !== priorCounterpart) fail("HISTORICAL_AUTO_REPOINT_REJECTED");
    store.history.push({ historyId: `d7r8-history-${store.history.length + 1}`, handoffId: predecessor.handoffId, action: "SUPERSEDED", fingerprint: predecessor.fingerprint, recordedAt: store.now() });
  }
  const record: D7R8HandoffRecord = {
    handoffId, contextId, objectId: object.objectId, objectType: object.objectType, objectRevisionFingerprint: object.fingerprint,
    sourceKind: sourceKind as SourceKind, sourceId, sourceFingerprint: source.fingerprint, dependencies,
    counterpartDiscipline: discipline, direction: directionToken as Direction, interfaceTopic, suppliedContent, counterpart,
    applicability, limitations, provenanceRef, sourceBasisRef, sourceAuthority: D7_CONTEXT_AUTHORITY, receivingAuthority: discipline,
    authorityTransferred: false, interfaceAccepted: handoffStatus === "COMPLETE", interfaceComplete: handoffStatus === "COMPLETE" && counterpart !== null,
    engineeringValidated: false, approved: false, conformant: false, counterpartTruth: false, mechanicalDesign: false, processDesign: false,
    iacDesign: false, functionalSafetyValidated: false, handoffStatus: handoffStatus as HandoffStatus, citedCurrentness: cited, currentness: cited,
    citedLifecycleStage: stage as Stage, fingerprint, predecessorHandoffId: predecessor?.handoffId ?? null, predecessorFingerprint: predecessor?.fingerprint ?? null,
    recordStatus: "CURRENT", tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId, deleted: false, invalidated: false,
    createdAt: store.now(), createdBy: actor.actorId,
  };
  store.handoffs.push(record);
  store.history.push({ historyId: `d7r8-history-${store.history.length + 1}`, handoffId, action: "CREATED", fingerprint, recordedAt: store.now() });
  if (seal(store) !== before) fail("UPSTREAM_MUTATION_REJECTED");
  return record;
}

export function markElectricalInterfaceFromChange(store: D7R8Store, actor: D7R1Actor, input: Prohibited & {
  handoffId: string;
  handoffFingerprint: string;
  changeId: string;
  changeFingerprint: string;
  mark: string;
}): D7R8HandoffRecord {
  assertActor(actor);
  assertProhibited(input);
  const before = seal(store);
  const handoffId = explicit(input.handoffId, "HANDOFF_ID_REQUIRED");
  const handoffFingerprint = explicit(input.handoffFingerprint, "HANDOFF_REVISION_REQUIRED");
  const index = store.handoffs.findIndex((row) => row.handoffId === handoffId && row.tenantId === actor.tenantId);
  const handoff = index >= 0 ? store.handoffs[index] : null;
  if (!handoff || handoff.fingerprint !== handoffFingerprint) fail(handoff ? "FINGERPRINT_MISMATCH" : "HANDOFF_NOT_FOUND");
  if (handoff.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  const change = store.r7.changes.find((row) => row.changeId === explicit(input.changeId, "CHANGE_REFERENCE_REQUIRED"));
  if (!change || change.fingerprint !== explicit(input.changeFingerprint, "CHANGE_REVISION_REQUIRED") || change.tenantId !== actor.tenantId || change.recordStatus !== "CURRENT") fail("CHANGE_REVISION_MISMATCH");
  if (!change.dependencies.some((link) => link.targetKind === handoff.sourceKind && link.targetId === handoff.sourceId && link.targetFingerprint === handoff.sourceFingerprint)) fail("INFERRED_DEPENDENCY_REJECTED");
  if (input.mark !== "STALE" && input.mark !== "REASSESSMENT_REQUIRED") fail("CURRENTNESS_MARK_INVALID");
  if (input.mark === "REASSESSMENT_REQUIRED" && !store.r7.reassessments.some((row) => row.changeId === change.changeId && row.targetId === handoff.sourceId && row.targetFingerprint === handoff.sourceFingerprint && row.tenantId === actor.tenantId && row.validationFailed === false && row.engineeringValidated === false)) {
    fail("REASSESSMENT_NOT_LINKED");
  }
  const marked: D7R8HandoffRecord = Object.freeze({
    ...handoff,
    currentness: input.mark,
    handoffStatus: input.mark,
    interfaceAccepted: false,
    interfaceComplete: false,
    engineeringValidated: false,
    approved: false,
    conformant: false,
    invalidated: false,
    counterpart: handoff.counterpart,
    objectRevisionFingerprint: handoff.objectRevisionFingerprint,
    sourceFingerprint: handoff.sourceFingerprint,
  });
  store.handoffs[index] = marked;
  store.history.push({ historyId: `d7r8-history-${store.history.length + 1}`, handoffId: marked.handoffId, action: "CURRENTNESS_MARKED", fingerprint: marked.fingerprint, recordedAt: store.now() });
  if (marked.fingerprint !== handoffFingerprint || marked.counterpart?.fingerprint !== handoff.counterpart?.fingerprint || marked.counterpart?.sourceRevision !== handoff.counterpart?.sourceRevision) fail("AUTO_REPOINT_REJECTED");
  if (marked.currentness === "CURRENT" || currentElectricalInterfaceHandoffs(store, actor).some((row) => row.handoffId === marked.handoffId)) fail("STALE_EXPOSED_AS_CURRENT");
  if (seal(store) !== before) fail("UPSTREAM_MUTATION_REJECTED");
  return marked;
}

export function repointElectricalInterface(): never {
  return fail("AUTO_REPOINT_REJECTED");
}
export function mutateElectricalInterfaceCounterpart(): never {
  return fail("COUNTERPART_MUTATION_REJECTED");
}
export function recalculateElectricalInterfaceCounterpart(): never {
  return fail("COUNTERPART_RECALCULATION_REJECTED");
}
export function revalidateElectricalInterfaceCounterpart(): never {
  return fail("COUNTERPART_REVALIDATION_REJECTED");
}
export function adoptElectricalHandoffAsCounterpartDesign(): never {
  return fail("COUNTERPART_REDESIGN_REJECTED");
}
export function reasonAcrossElectricalDisciplines(): never {
  return fail("CROSS_DISCIPLINE_REASONING_NOT_IN_R8");
}
