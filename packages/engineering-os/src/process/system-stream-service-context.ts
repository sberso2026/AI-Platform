/**
 * EOS-D6-R2 Process system, stream, and service context.
 * One bounded runtime on exact R1 identities. Descriptive context only.
 */
import {
  D6_CURRENTNESS_STATES,
  D6_IMPLEMENTATION_PHASE_TYPES,
  D6_IMPLEMENTATION_PHASES,
  D6_MATURITY_STATES,
  D6_PHASE_CLASSIFICATIONS,
  D6_PROCESS_STREAM_CAN_REFERENCE_D5_LINE,
  PROCESS_SERVICE_AUTO_CREATES_D5_PIPING_SERVICE,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import type { D5R1Store } from "../piping/identity-foundation";
import {
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
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
  D6_APPROVAL_RUNTIME_COUNT,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_CONTEXT_AUTHORITY,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT,
  D6_DISCIPLINE,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_COUNT,
  D6_PROCESS_IDENTITY_RUNTIME_READY as R1_IDENTITY_READY,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_PROCESS_STREAM_REFERENCE_TRANSFERS_D5_AUTHORITY,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  PROCESS_SERVICE_EQUALS_PIPING_SERVICE_CONTEXT,
  PROCESS_STREAM_EQUALS_PIPING_LINE,
  PROCESS_STREAM_IDENTITY_EQUALS_PIPING_LINE_IDENTITY,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D5_REOPEN,
  UNAUTHORIZED_D7_RUNTIME_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PROCESS_CALCULATION_PROMOTION,
  UNAUTHORIZED_PROCESS_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
  type D6R1Actor,
  type D6R1ObjectRecord,
  type D6R1Store,
} from "./identity-foundation";

export const D6_R2_STATUS = "PROCESS_SYSTEM_STREAM_AND_SERVICE_CONTEXT_IMPLEMENTED" as const;
export const D6_R2_MATURITY = D6_R2_STATUS;
export const D6_R2_MATURITY_STATE = D6_R2_STATUS;
export const D6_R2_CLOSEOUT_PATH =
  "docs/architecture/engineering-os/EOS_D6_R2_PROCESS_SYSTEM_STREAM_AND_SERVICE_CONTEXT_CLOSEOUT.md" as const;
export const D6_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const EXACT_D6_R1_IDENTITY_REVISION_REQUIRED = true as const;
export const FLOATING_D6_R2_SOURCE_REFERENCE_ALLOWED = false as const;
export const D6_R2_SOURCE_AUTO_REPOINTED = false as const;
export const D6_RUNTIME_STARTED = true as const;
export const D6_RUNTIME_COUNT = 2 as const;
export const D6_R1_RUNTIME_COUNT = R1_RUNTIME_COUNT;
export const D6_PROCESS_IDENTITY_RUNTIME_READY = R1_IDENTITY_READY;
export const D6_SYSTEM_STREAM_SERVICE_RUNTIME_IMPLEMENTED = true as const;
export const D6_SYSTEM_STREAM_SERVICE_RUNTIME_COUNT = 1 as const;
export const D6_SYSTEM_STREAM_SERVICE_RUNTIME_READY = true as const;
export const D6_PROCESS_SYSTEM_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_SYSTEM_CONTEXT_EQUALS_PROCESS_SYSTEM_DESIGN = false as const;
export const PROCESS_SYSTEM_CONTEXT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const D6_PROCESS_STREAM_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_STREAM_CONTEXT_EQUALS_PROCESS_STREAM_CALCULATION = false as const;
export const PROCESS_STREAM_CONTEXT_EQUALS_VALIDATED_PROCESS_DESIGN = false as const;
export const D6_PROCESS_SERVICE_FUNCTION_CONTEXT_IMPLEMENTED = true as const;
export const PROCESS_SERVICE_CONTEXT_EQUALS_PROCESS_DESIGN = false as const;
export const D6_EXPLICIT_SYSTEM_STREAM_MEMBERSHIP_REQUIRED = true as const;
export const D6_INFERRED_SYSTEM_STREAM_MEMBERSHIP_ALLOWED = false as const;
export const D6_EXPLICIT_STREAM_SERVICE_ASSOCIATION_REQUIRED = true as const;
export const D6_INFERRED_STREAM_SERVICE_ASSOCIATION_ALLOWED = false as const;
export const D6_EXPLICIT_STREAM_ORIGIN_DESTINATION_RELATIONSHIP_SUPPORTED = true as const;
export const D6_INFERRED_STREAM_ORIGIN_DESTINATION_ALLOWED = false as const;
export const D6_PROCESS_FLUID_CONTEXT_SUPPORTED = true as const;
export const EXACT_D6_FLUID_IDENTITY_REVISION_REQUIRED = true as const;
export const PROCESS_FLUID_CONTEXT_EQUALS_VALIDATED_COMPOSITION = false as const;
export const PROCESS_FLUID_CONTEXT_EQUALS_THERMODYNAMIC_MODEL = false as const;
export const D6_PROCESS_PHASE_CONTEXT_SUPPORTED = true as const;
export const PROCESS_PHASE_CONTEXT_EQUALS_PHASE_EQUILIBRIUM_CALCULATION = false as const;
export const PROCESS_PHASE_CONTEXT_EQUALS_VALIDATED_PHASE_BEHAVIOR = false as const;
export const D6_SUPPLIED_COMPOSITION_CONTEXT_SUPPORTED = true as const;
export const SUPPLIED_COMPOSITION_CONTEXT_EQUALS_VALIDATED_COMPOSITION = false as const;
export const D6_R2_COMPOSITION_CALCULATION_ALLOWED = false as const;
export const D6_R2_NORMALIZES_COMPOSITION_TO_ENGINEERING_TRUTH = false as const;
export const EXACT_D5_LINE_REVISION_REQUIRED_WHEN_REFERENCED = true as const;
export const D6_AUTO_CREATES_D5_LINE_FROM_PROCESS_STREAM = false as const;
export const D6_INFERRED_D5_LINE_MEMBERSHIP_ALLOWED = false as const;
export const D6_R2_OPERATING_CONDITION_ENGINEERING_IMPLEMENTED = false as const;
export const D6_R2_DESIGN_CONDITION_ENGINEERING_IMPLEMENTED = false as const;
export const D6_R2_DESIGN_BASIS_ENGINEERING_IMPLEMENTED = false as const;
export const D6_R2_SOURCE_BASIS_REQUIRED = true as const;
export const D6_R2_SOURCE_BASIS_TRACEABLE = true as const;
export const BASISLESS_AUTHORITATIVE_D6_R2_RECORD_AUTO_ACCEPTED = false as const;
export const D6_R2_APPLICABILITY_EXPLICIT = true as const;
export const D6_R2_LIMITATIONS_EXPLICIT = true as const;
export const D6_R2_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D6_R2_HISTORY_PRESERVED = true as const;
export const D6_R2_AUTO_REPOINTED = false as const;
export const SILENT_D6_R2_MUTATION_ALLOWED = false as const;
export const D6_R2_PROVENANCE_REQUIRED = true as const;
export const D6_R2_PROVENANCE_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D6_R2_SCOPE_ENFORCED = true as const;
export const CROSS_TENANT_D6_R2_ACCESS_ALLOWED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_SYSTEM_STREAM_RELATIONSHIP = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_D6_SERVICE_CONTEXT = false as const;
export const ADMIN_CAN_PROMOTE_CANDIDATE_D6_R2_CONTEXT_TO_ENGINEERING_TRUTH = false as const;
export const D6_R2_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D6_R2_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D6_R2_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D6_R2_HIDDEN_CALCULATION_ALLOWED = false as const;
export const UNAUTHORIZED_D6_R3_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_CONDITION_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_EQUIPMENT_DUTY_PROMOTION = false as const;
export const UNAUTHORIZED_PROCESS_SAFETY_PROMOTION = false as const;
export const D6_R3_CANONICAL_PHASE = D6_IMPLEMENTATION_PHASES[2];
export const D6_R3_PHASE_TYPE = D6_IMPLEMENTATION_PHASE_TYPES[2];
export const D6_R3_CANONICAL_SCOPE =
  "Implement governed Process operating cases, design cases, Process design basis, operating-condition context and design-condition context using exact R1-R2 revisions. Preserve supplied/adopted values, units, source/basis, applicability and limitations without implementing mass/energy balances, hydraulics, thermodynamic calculations, equipment-duty calculations, Process-safety calculations, automatic Piping adoption, review/validation or D9 reasoning." as const;
export const D6_R3_STARTED = false as const;
export const D6_R2_READY_FOR_NEXT_PHASE = true as const;
export const D6_R2_NEXT_PHASE = D6_R3_CANONICAL_PHASE;
export const D6_R2_NEXT_PHASE_TYPE = D6_R3_PHASE_TYPE;
export const D6_R2_CANONICAL_NEXT_PHASE = D6_R3_CANONICAL_PHASE;
export const D6_R2_CANONICAL_NEXT_PHASE_SCOPE = D6_R3_CANONICAL_SCOPE;
export const D6_R2_BLOCKER = "NONE" as const;
export const D6_R2_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

export const D6_R2_SYSTEM_CATEGORIES = [
  "PRIMARY_PROCESS_SYSTEM",
  "UTILITY_PROCESS_SYSTEM",
  "OFFSITE_PROCESS_SYSTEM",
  "PACKAGE_PROCESS_SYSTEM",
  "OTHER_PROCESS_SYSTEM",
] as const;
export const D6_R2_SYSTEM_FUNCTIONS = [
  "CONTAINMENT",
  "SEPARATION",
  "REACTION",
  "HEAT_TRANSFER",
  "STORAGE",
  "TRANSFER",
  "UTILITY_SUPPORT",
  "OTHER_PROCESS_SYSTEM_FUNCTION",
] as const;
export const D6_R2_STREAM_FUNCTIONS = [
  "FEED",
  "PRODUCT",
  "RECYCLE",
  "UTILITY",
  "VENT",
  "DRAIN",
  "TRANSFER",
  "OTHER_PROCESS_STREAM_FUNCTION",
] as const;
export const D6_R2_SERVICE_FUNCTIONS = [
  "TRANSFER",
  "SUPPLY",
  "RETURN",
  "SEPARATION",
  "REACTION",
  "HEAT_TRANSFER",
  "STORAGE",
  "OTHER_PROCESS_SERVICE",
] as const;
export const D6_R2_ENDPOINT_ROLES = ["ORIGIN", "DESTINATION"] as const;
export const D6_R2_ENDPOINT_OBJECT_TYPES = ["PROCESS_STREAM", "PROCESS_UNIT", "PROCESS_SYSTEM"] as const;

export {
  D6_REUSES_CANONICAL_CURRENTNESS,
  D6_REUSES_CANONICAL_DIGITAL_THREAD,
  D6_REUSES_CANONICAL_FINGERPRINT,
  PARALLEL_D6_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D6_DIGITAL_THREAD_CREATED,
  SECOND_D6_FINGERPRINT_ALGORITHM_CREATED,
  D6_PROCESS_STREAM_CAN_REFERENCE_D5_LINE,
  D6_PROCESS_STREAM_REFERENCE_TRANSFERS_D5_AUTHORITY,
  PROCESS_STREAM_EQUALS_PIPING_LINE,
  PROCESS_STREAM_IDENTITY_EQUALS_PIPING_LINE_IDENTITY,
  PROCESS_SERVICE_EQUALS_PIPING_SERVICE_CONTEXT,
  PROCESS_SERVICE_AUTO_CREATES_D5_PIPING_SERVICE,
  AI_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  ADMIN_EQUALS_D6_PROCESS_ENGINEERING_AUTHORITY,
  D6_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D6_EQUALS_D2_CIVIL_AUTHORITY,
  D6_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D6_EQUALS_D4_MECHANICAL_AUTHORITY,
  D6_EQUALS_D5_PIPING_AUTHORITY,
  D6_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D6_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D6_DESIGN_BASIS_CONDITION_RUNTIME_COUNT,
  D6_PROCESS_EVIDENCE_RUNTIME_COUNT,
  D6_MASS_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_ENERGY_BALANCE_CALCULATION_RUNTIME_COUNT,
  D6_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D6_PRESSURE_DROP_CALCULATION_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_RUNTIME_COUNT,
  D6_EQUIPMENT_DUTY_CALCULATION_RUNTIME_COUNT,
  D6_UTILITY_CALCULATION_RUNTIME_COUNT,
  D6_PROCESS_SAFETY_RELIEF_RUNTIME_COUNT,
  D6_RELIEF_CALCULATION_RUNTIME_COUNT,
  D6_DEPRESSURING_CALCULATION_RUNTIME_COUNT,
  D6_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT,
  D6_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D6_REVIEW_VALIDATION_RUNTIME_COUNT,
  D6_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT,
  D6_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D6_D9_RUNTIME_INTEGRATION_COUNT,
  D6_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_PROCESS_CALCULATION_RUNTIME_COUNT,
  D6_AUTOMATIC_REDESIGN_RUNTIME_COUNT,
  D6_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT,
  D6_CONFORMANCE_DETERMINATION_RUNTIME_COUNT,
  D6_APPROVAL_RUNTIME_COUNT,
  D6_CERTIFICATION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_DETECTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D6_CROSS_DISCIPLINE_RECOMMENDATION_RUNTIME_COUNT,
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
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  D9_RUNTIME_COUNT,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  UNAUTHORIZED_D1_PACK_COMPLETION,
  UNAUTHORIZED_D2_REOPEN,
  UNAUTHORIZED_D3_REOPEN,
  UNAUTHORIZED_D4_REOPEN,
  UNAUTHORIZED_D5_REOPEN,
  UNAUTHORIZED_D7_RUNTIME_PROMOTION,
  UNAUTHORIZED_D8_RUNTIME_PROMOTION,
  UNAUTHORIZED_D9_RUNTIME_PROMOTION,
  UNAUTHORIZED_PROCESS_CALCULATION_PROMOTION,
  UNAUTHORIZED_PROCESS_VALIDATION_PROMOTION,
  UNAUTHORIZED_PROCESS_CONFORMANCE_PROMOTION,
  UNAUTHORIZED_DISCIPLINE_AUTHORITY_TRANSFER,
  UNAUTHORIZED_CROSS_DISCIPLINE_REASONING_PROMOTION,
  UNAUTHORIZED_GA_PROMOTION,
  UNAUTHORIZED_PRODUCT_CLAIM,
};

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set([
  "inferred",
  "numbering",
  "tag",
  "matching_tag",
  "matching_name",
  "naming_convention",
  "name_similarity",
  "tag_similarity",
  "diagram_proximity",
  "diagram_graphics",
  "common_service",
  "common_service_text",
  "ai_interpretation",
  "ai_inference",
  "ai_reasoning",
  "document_co_occurrence",
  "document_reference",
  "document_adjacency",
  "tag_ordering",
  "semantic_similarity",
  "timestamp",
]);
const BROAD = new Set(["all", "global", "every", "any", "any stream", "all streams"]);

type Prohibited = {
  systemDesign?: boolean;
  streamCalculation?: boolean;
  serviceDesign?: boolean;
  engineeringValidated?: boolean;
  operatingCondition?: boolean;
  designCondition?: boolean;
  designBasis?: boolean;
  operatingPressure?: unknown;
  operatingTemperature?: unknown;
  designPressure?: unknown;
  designTemperature?: unknown;
  flowRate?: unknown;
  massFlow?: unknown;
  massBalance?: boolean;
  energyBalance?: boolean;
  hydraulic?: boolean;
  pressureDrop?: unknown;
  velocity?: unknown;
  lineSize?: unknown;
  equipmentDuty?: boolean;
  utilityCalculation?: boolean;
  relief?: boolean;
  depressuring?: boolean;
  processSafety?: boolean;
  compositionCalculation?: boolean;
  normalizeComposition?: boolean;
  deriveComponents?: boolean;
  estimateChemistry?: boolean;
  componentFractions?: unknown;
  thermodynamicModel?: boolean;
  equilibriumCalculation?: boolean;
  validatedComposition?: boolean;
  validatedPhaseBehavior?: boolean;
  reviewValidation?: boolean;
  disciplineInterface?: boolean;
  d9Source?: boolean;
  hiddenCalculation?: boolean;
  calculation?: boolean;
  automaticRedesign?: boolean;
  repoint?: boolean;
  propagate?: boolean;
  inferredMembership?: boolean;
  inferredService?: boolean;
  inferredEndpoint?: boolean;
  createPipingLine?: boolean;
  createPipingService?: boolean;
  pipingServiceObjectId?: string;
  pipingLineTag?: string;
};

type BoundInput = Prohibited & {
  contextId: string;
  objectId: string;
  objectRevisionFingerprint: string;
  citedLifecycleStage: string;
  provenanceRef: string;
  sourceBasisRef: string;
  citedCurrentness: string;
  applicability: string;
  limitations: string;
  assertedFingerprint?: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

type Currentness = (typeof D6_CURRENTNESS_STATES)[number];
type Stage = (typeof D6_MATURITY_STATES)[number];

export type D6R2ContextRecordBase = {
  contextId: string;
  objectId: string;
  objectType: D6R1ObjectRecord["objectType"];
  objectRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  discipline: typeof D6_DISCIPLINE;
  citedLifecycleStage: Stage;
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D6_CONTEXT_AUTHORITY;
  processEngineeringAuthority: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
};

export type D6R2SystemInput = BoundInput & {
  systemRecordId: string;
  purpose: string;
  systemFunction: string;
  systemCategory: string;
  unitObjectId?: string | null;
  unitRevisionFingerprint?: string | null;
  predecessorSystemRecordId?: string | null;
};

export type D6R2SystemRecord = D6R2ContextRecordBase & {
  systemRecordId: string;
  purpose: string;
  systemFunction: (typeof D6_R2_SYSTEM_FUNCTIONS)[number];
  systemCategory: (typeof D6_R2_SYSTEM_CATEGORIES)[number];
  unitObjectId: string | null;
  unitRevisionFingerprint: string | null;
  systemDesign: false;
  predecessorSystemRecordId: string | null;
};

export type D6R2StreamInput = BoundInput & {
  streamRecordId: string;
  streamFunction: string;
  fluidObjectId?: string | null;
  fluidRevisionFingerprint?: string | null;
  citedPhaseClassification?: string | null;
  compositionObjectId?: string | null;
  compositionRevisionFingerprint?: string | null;
  pipingLineObjectId?: string | null;
  pipingLineRevisionFingerprint?: string | null;
  predecessorStreamRecordId?: string | null;
};

export type D6R2StreamRecord = D6R2ContextRecordBase & {
  streamRecordId: string;
  streamFunction: (typeof D6_R2_STREAM_FUNCTIONS)[number];
  fluidObjectId: string | null;
  fluidRevisionFingerprint: string | null;
  citedPhaseClassification: (typeof D6_PHASE_CLASSIFICATIONS)[number] | null;
  compositionObjectId: string | null;
  compositionRevisionFingerprint: string | null;
  pipingLineObjectId: string | null;
  pipingLineRevisionFingerprint: string | null;
  streamCalculation: false;
  validatedProcessDesign: false;
  transfersD5Authority: false;
  pipingLineCreated: false;
  inferredD5Membership: false;
  pipingLineIdentity: false;
  predecessorStreamRecordId: string | null;
};

export type D6R2ServiceInput = BoundInput & {
  serviceRecordId: string;
  serviceFunction: string;
  serviceDescription: string;
  predecessorServiceRecordId?: string | null;
};

export type D6R2ServiceRecord = D6R2ContextRecordBase & {
  serviceRecordId: string;
  serviceFunction: (typeof D6_R2_SERVICE_FUNCTIONS)[number];
  serviceDescription: string;
  processDesign: false;
  pipingServiceContext: false;
  pipingServiceCreated: false;
  predecessorServiceRecordId: string | null;
};

export type D6R2MembershipInput = BoundInput & {
  membershipId: string;
  systemObjectId: string;
  systemRevisionFingerprint: string;
  membershipBasis?: string;
  predecessorMembershipId?: string | null;
};

export type D6R2MembershipRecord = {
  membershipId: string;
  contextId: string;
  streamObjectId: string;
  streamRevisionFingerprint: string;
  systemObjectId: string;
  systemRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  membershipBasis: "EXPLICIT";
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D6_CONTEXT_AUTHORITY;
  inferred: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorMembershipId: string | null;
};

export type D6R2AssociationInput = BoundInput & {
  associationId: string;
  serviceObjectId: string;
  serviceRevisionFingerprint: string;
  associationBasis?: string;
  predecessorAssociationId?: string | null;
};

export type D6R2AssociationRecord = {
  associationId: string;
  contextId: string;
  streamObjectId: string;
  streamRevisionFingerprint: string;
  serviceObjectId: string;
  serviceRevisionFingerprint: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  associationBasis: "EXPLICIT";
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D6_CONTEXT_AUTHORITY;
  inferred: false;
  processDesign: false;
  pipingServiceContext: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorAssociationId: string | null;
};

export type D6R2EndpointInput = BoundInput & {
  endpointId: string;
  relatedObjectId: string;
  relatedRevisionFingerprint: string;
  role: string;
  relationshipBasis?: string;
  predecessorEndpointId?: string | null;
};

export type D6R2EndpointRecord = {
  endpointId: string;
  contextId: string;
  streamObjectId: string;
  streamRevisionFingerprint: string;
  relatedObjectId: string;
  relatedRevisionFingerprint: string;
  relatedObjectType: (typeof D6_R2_ENDPOINT_OBJECT_TYPES)[number];
  role: (typeof D6_R2_ENDPOINT_ROLES)[number];
  tenantId: string;
  workspaceId: string;
  projectId: string;
  relationshipBasis: "EXPLICIT";
  provenanceRef: string;
  sourceBasisRef: string;
  applicability: string;
  limitations: string;
  citedCurrentness: Currentness;
  authority: typeof D6_CONTEXT_AUTHORITY;
  inferred: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
  predecessorEndpointId: string | null;
};

export type D6R2FluidInput = BoundInput & {
  fluidRecordId: string;
  descriptiveContext: string;
  predecessorFluidRecordId?: string | null;
};

export type D6R2FluidRecord = D6R2ContextRecordBase & {
  fluidRecordId: string;
  descriptiveContext: string;
  validatedComposition: false;
  thermodynamicModel: false;
  predecessorFluidRecordId: string | null;
};

export type D6R2PhaseInput = BoundInput & {
  phaseRecordId: string;
  citedPhaseClassification: string;
  predecessorPhaseRecordId?: string | null;
};

export type D6R2PhaseRecord = D6R2ContextRecordBase & {
  phaseRecordId: string;
  citedPhaseClassification: (typeof D6_PHASE_CLASSIFICATIONS)[number];
  equilibriumCalculation: false;
  validatedPhaseBehavior: false;
  predecessorPhaseRecordId: string | null;
};

export type D6R2CompositionInput = BoundInput & {
  compositionRecordId: string;
  suppliedStatement: string;
  predecessorCompositionRecordId?: string | null;
};

export type D6R2CompositionRecord = D6R2ContextRecordBase & {
  compositionRecordId: string;
  suppliedStatement: string;
  validatedComposition: false;
  normalizedToTruth: false;
  predecessorCompositionRecordId: string | null;
};

export type D6R2History = {
  historyId: string;
  subjectKind: "SYSTEM" | "STREAM" | "SERVICE" | "MEMBERSHIP" | "ASSOCIATION" | "ENDPOINT" | "FLUID" | "PHASE" | "COMPOSITION";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D6R2Store = {
  r1: D6R1Store;
  d5: D5R1Store;
  now: () => string;
  systems: D6R2SystemRecord[];
  streams: D6R2StreamRecord[];
  services: D6R2ServiceRecord[];
  memberships: D6R2MembershipRecord[];
  associations: D6R2AssociationRecord[];
  endpoints: D6R2EndpointRecord[];
  fluids: D6R2FluidRecord[];
  phases: D6R2PhaseRecord[];
  compositions: D6R2CompositionRecord[];
  history: D6R2History[];
};

type Stored = {
  fingerprint: string;
  tenantId: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  currentness: "CURRENT" | "SUPERSEDED";
};

function fail(code: string): never {
  throw new Error(`D6_R2_${code}`);
}

function blockedParty(value: string): boolean {
  return /^AI(?:\b|_)/i.test(value) || /LLM/i.test(value) || /OPTIMIZER/i.test(value);
}

function explicit(value: string, code: string): string {
  const token = value.trim();
  if (!token || FLOATING.has(token.toLowerCase()) || INFERRED.has(token.toLowerCase()) || BROAD.has(token.toLowerCase()) || blockedParty(token)) fail(code);
  return token;
}

function isStage(value: string): value is Stage {
  return (D6_MATURITY_STATES as readonly string[]).includes(value);
}

function isCurrentness(value: string): value is Currentness {
  return (D6_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function isPhase(value: string): value is (typeof D6_PHASE_CLASSIFICATIONS)[number] {
  return (D6_PHASE_CLASSIFICATIONS as readonly string[]).includes(value);
}

function assertActor(actor: D6R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_PROCESS_AUTHORITY");
  if (actor.authority === "PROCESS_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_PROCESS_ENGINEERING_AUTHORITY");
  if (actor.authority !== D6_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D6R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.systemDesign === true) fail("SYSTEM_DESIGN_NOT_IN_R2");
  if (input.streamCalculation === true) fail("STREAM_CALCULATION_NOT_IN_R2");
  if (input.serviceDesign === true) fail("SERVICE_DESIGN_NOT_IN_R2");
  if (input.engineeringValidated === true || input.reviewValidation === true) fail("VALIDATION_NOT_IN_R2");
  if (
    input.operatingCondition === true ||
    input.designCondition === true ||
    input.designBasis === true ||
    input.operatingPressure != null ||
    input.operatingTemperature != null ||
    input.designPressure != null ||
    input.designTemperature != null ||
    input.flowRate != null ||
    input.massFlow != null
  ) fail("CONDITION_NOT_IN_R2");
  if (input.massBalance === true || input.energyBalance === true) fail("BALANCE_NOT_IN_R2");
  if (input.hydraulic === true || input.pressureDrop != null || input.velocity != null || input.lineSize != null) fail("HYDRAULIC_NOT_IN_R2");
  if (input.equipmentDuty === true || input.utilityCalculation === true) fail("DUTY_NOT_IN_R2");
  if (input.relief === true || input.depressuring === true || input.processSafety === true) fail("PROCESS_SAFETY_NOT_IN_R2");
  if (
    input.compositionCalculation === true ||
    input.normalizeComposition === true ||
    input.deriveComponents === true ||
    input.estimateChemistry === true ||
    input.componentFractions != null ||
    input.validatedComposition === true
  ) fail("COMPOSITION_CALCULATION_REJECTED");
  if (input.thermodynamicModel === true) fail("THERMODYNAMIC_MODEL_NOT_IN_R2");
  if (input.equilibriumCalculation === true || input.validatedPhaseBehavior === true) fail("PHASE_BEHAVIOR_NOT_IN_R2");
  if (input.disciplineInterface === true) fail("DISCIPLINE_INTERFACE_NOT_IN_R2");
  if (input.d9Source === true) fail("D9_SOURCE_NOT_IN_R2");
  if (input.hiddenCalculation === true || input.calculation === true || input.automaticRedesign === true) fail("CALCULATION_NOT_IN_R2");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.propagate === true) fail("AUTO_PROPAGATION_REJECTED");
  if (input.inferredMembership === true) fail("INFERRED_MEMBERSHIP_REJECTED");
  if (input.inferredService === true) fail("INFERRED_SERVICE_REJECTED");
  if (input.inferredEndpoint === true) fail("INFERRED_ENDPOINT_REJECTED");
  if (input.createPipingLine === true || input.pipingLineTag != null) fail("D5_LINE_NOT_CREATED");
  if (input.createPipingService === true || input.pipingServiceObjectId != null) fail("PIPING_SERVICE_NOT_MERGED");
}

function remember(store: D6R2Store, subjectKind: D6R2History["subjectKind"], subjectId: string, action: D6R2History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

function requireContext(store: D6R2Store, actor: D6R1Actor, contextId: string, citedCurrentness: Currentness) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId || context.workspaceId !== actor.workspaceId || context.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D6R2Store, actor: D6R1Actor, contextId: string, objectId: string, revisionFingerprint: string, allowed: readonly string[], citedCurrentness: Currentness) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const revision = explicit(revisionFingerprint, "R1_REVISION_REQUIRED");
  const object = store.r1.objects.find((row) => row.objectId === id);
  if (!object || !allowed.includes(object.objectType)) fail("R1_OBJECT_NOT_FOUND");
  if (object.fingerprint !== revision) fail("R1_REVISION_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function optionalObject(store: D6R2Store, actor: D6R1Actor, contextId: string, objectId: string | null | undefined, revision: string | null | undefined, allowed: readonly string[], cited: Currentness, code: string) {
  const hasId = objectId != null && objectId.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail(code);
  return requireObject(store, actor, contextId, objectId as string, revision as string, allowed, cited);
}

function optionalD5Line(store: D6R2Store, actor: D6R1Actor, objectId: string | null | undefined, revision: string | null | undefined, cited: Currentness) {
  const hasId = objectId != null && objectId.trim() !== "";
  const hasRevision = revision != null && revision.trim() !== "";
  if (!hasId && !hasRevision) return null;
  if (!hasId || !hasRevision) fail("D5_LINE_REVISION_REQUIRED");
  const id = explicit(objectId as string, "D5_LINE_REFERENCE_REQUIRED");
  const rev = explicit(revision as string, "D5_LINE_REVISION_REQUIRED");
  const line = store.d5.objects.find((row) => row.objectId === id && row.objectType === "PIPING_LINE");
  if (!line) fail("D5_LINE_NOT_FOUND");
  if (line.fingerprint !== rev) fail("D5_LINE_REVISION_MISMATCH");
  if (line.tenantId !== actor.tenantId || line.workspaceId !== actor.workspaceId || line.projectId !== actor.projectId) fail("D5_LINE_SCOPE_MISMATCH");
  if (cited === "CURRENT" && line.recordStatus !== "CURRENT") fail("D5_LINE_NOT_CURRENT");
  return line;
}

function sameLineage(store: D6R2Store, object: D6R1ObjectRecord, priorObjectId: string): boolean {
  let cursor: D6R1ObjectRecord | undefined = object;
  const seen = new Set<string>();
  while (cursor && !seen.has(cursor.objectId)) {
    if (cursor.objectId === priorObjectId) return true;
    seen.add(cursor.objectId);
    const predecessorId: string | null = cursor.predecessorObjectId;
    cursor = predecessorId ? store.r1.objects.find((row) => row.objectId === predecessorId) : undefined;
  }
  return false;
}

function prepare(store: D6R2Store, actor: D6R1Actor, input: BoundInput, allowed: readonly string[]) {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const cited = input.citedCurrentness.trim();
  if (!isCurrentness(cited)) fail("CURRENTNESS_INVALID");
  const context = requireContext(store, actor, input.contextId, cited);
  const object = requireObject(store, actor, context.contextId, input.objectId, input.objectRevisionFingerprint, allowed, cited);
  const stage = input.citedLifecycleStage.trim();
  if (!isStage(stage)) fail("MATURITY_STAGE_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const sourceBasisRef = explicit(input.sourceBasisRef, "MISSING_SOURCE_BASIS");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  if (!applicability.includes(object.objectId)) fail("APPLICABILITY_NOT_OBJECT_SCOPED");
  return { context, object, stage, provenanceRef, sourceBasisRef, applicability, limitations, citedCurrentness: cited };
}

function truthBase(actor: D6R1Actor, prepared: ReturnType<typeof prepare>, fingerprint: string): D6R2ContextRecordBase {
  return {
    contextId: prepared.context.contextId,
    objectId: prepared.object.objectId,
    objectType: prepared.object.objectType,
    objectRevisionFingerprint: prepared.object.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    discipline: D6_DISCIPLINE,
    citedLifecycleStage: prepared.stage,
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D6_CONTEXT_AUTHORITY,
    processEngineeringAuthority: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: "",
    recordStatus: "CURRENT",
    currentness: "CURRENT",
  };
}

function place<T extends Stored>(store: D6R2Store, rows: T[], kind: D6R2History["subjectKind"], id: string, fingerprint: string, tenantId: string, predecessor: T | null, idOf: (row: T) => string, duplicate: T | undefined, duplicateCode: string, record: T): T {
  const existing = rows.find((row) => idOf(row) === id);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === tenantId ? existing : fail(duplicateCode);
  if (duplicate) fail(duplicateCode);
  if (predecessor) {
    const index = rows.findIndex((row) => idOf(row) === idOf(predecessor));
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, currentness: "SUPERSEDED" as const });
    rows[index] = superseded;
    remember(store, kind, idOf(predecessor), "SUPERSEDED", predecessor.fingerprint);
  }
  rows.push(record);
  remember(store, kind, id, "CREATED", fingerprint);
  return record;
}

export function createD6R2Store(r1: D6R1Store, d5: D5R1Store, now: () => string = () => "2026-10-24T00:00:00.000Z"): D6R2Store {
  return { r1, d5, now, systems: [], streams: [], services: [], memberships: [], associations: [], endpoints: [], fluids: [], phases: [], compositions: [], history: [] };
}

export function recordProcessSystemContext(store: D6R2Store, actor: D6R1Actor, input: D6R2SystemInput): D6R2SystemRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_SYSTEM"]);
  const systemRecordId = explicit(input.systemRecordId, "SYSTEM_CONTEXT_REQUIRED");
  const purpose = explicit(input.purpose, "SYSTEM_PURPOSE_REQUIRED");
  const systemFunction = explicit(input.systemFunction, "SYSTEM_FUNCTION_REQUIRED");
  const systemCategory = explicit(input.systemCategory, "SYSTEM_CATEGORY_REQUIRED");
  if (!(D6_R2_SYSTEM_FUNCTIONS as readonly string[]).includes(systemFunction)) fail("SYSTEM_FUNCTION_NOT_ALLOWLISTED");
  if (!(D6_R2_SYSTEM_CATEGORIES as readonly string[]).includes(systemCategory)) fail("SYSTEM_CATEGORY_NOT_ALLOWLISTED");
  const unit = optionalObject(store, actor, prepared.context.contextId, input.unitObjectId, input.unitRevisionFingerprint, ["PROCESS_UNIT"], prepared.citedCurrentness, "UNIT_REVISION_REQUIRED");
  const predecessor = input.predecessorSystemRecordId ? store.systems.find((row) => row.systemRecordId === input.predecessorSystemRecordId) : null;
  if (input.predecessorSystemRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    systemRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    purpose, systemFunction, systemCategory, unitObjectId: unit?.objectId ?? null, unitRevisionFingerprint: unit?.fingerprint ?? null,
    applicability: prepared.applicability, limitations: prepared.limitations, provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness, predecessorSystemRecordId: predecessor?.systemRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.systems.find((row) => row.recordStatus === "CURRENT" && row.systemRecordId !== predecessor?.systemRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.systemCategory === systemCategory && row.systemFunction === systemFunction);
  const record: D6R2SystemRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    systemRecordId,
    purpose,
    systemFunction: systemFunction as D6R2SystemRecord["systemFunction"],
    systemCategory: systemCategory as D6R2SystemRecord["systemCategory"],
    unitObjectId: unit?.objectId ?? null,
    unitRevisionFingerprint: unit?.fingerprint ?? null,
    systemDesign: false,
    predecessorSystemRecordId: predecessor?.systemRecordId ?? null,
  });
  return place(store, store.systems, "SYSTEM", systemRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.systemRecordId, duplicate, "DUPLICATE_SYSTEM_REJECTED", record);
}

export function recordProcessStreamContext(store: D6R2Store, actor: D6R1Actor, input: D6R2StreamInput): D6R2StreamRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_STREAM"]);
  const streamRecordId = explicit(input.streamRecordId, "STREAM_CONTEXT_REQUIRED");
  const streamFunction = explicit(input.streamFunction, "STREAM_FUNCTION_REQUIRED");
  if (!(D6_R2_STREAM_FUNCTIONS as readonly string[]).includes(streamFunction)) fail("STREAM_FUNCTION_NOT_ALLOWLISTED");
  const fluid = optionalObject(store, actor, prepared.context.contextId, input.fluidObjectId, input.fluidRevisionFingerprint, ["PROCESS_FLUID"], prepared.citedCurrentness, "FLUID_REVISION_REQUIRED");
  const composition = optionalObject(store, actor, prepared.context.contextId, input.compositionObjectId, input.compositionRevisionFingerprint, ["PROCESS_COMPOSITION_CONTEXT"], prepared.citedCurrentness, "COMPOSITION_REVISION_REQUIRED");
  let citedPhase: D6R2StreamRecord["citedPhaseClassification"] = null;
  if (input.citedPhaseClassification != null && input.citedPhaseClassification.trim() !== "") {
    if (!fluid && !composition) fail("PHASE_REFERENCE_REQUIRED");
    const carrier = fluid ?? composition;
    if (!carrier?.phaseClassification || !isPhase(input.citedPhaseClassification.trim()) || carrier.phaseClassification !== input.citedPhaseClassification.trim()) fail("PHASE_REVISION_MISMATCH");
    citedPhase = input.citedPhaseClassification.trim() as D6R2StreamRecord["citedPhaseClassification"];
  }
  const line = optionalD5Line(store, actor, input.pipingLineObjectId, input.pipingLineRevisionFingerprint, prepared.citedCurrentness);
  const predecessor = input.predecessorStreamRecordId ? store.streams.find((row) => row.streamRecordId === input.predecessorStreamRecordId) : null;
  if (input.predecessorStreamRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    streamRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    streamFunction, fluidObjectId: fluid?.objectId ?? null, fluidRevisionFingerprint: fluid?.fingerprint ?? null, citedPhase,
    compositionObjectId: composition?.objectId ?? null, compositionRevisionFingerprint: composition?.fingerprint ?? null,
    pipingLineObjectId: line?.objectId ?? null, pipingLineRevisionFingerprint: line?.fingerprint ?? null,
    applicability: prepared.applicability, limitations: prepared.limitations, provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef,
    citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness, predecessorStreamRecordId: predecessor?.streamRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.streams.find((row) => row.recordStatus === "CURRENT" && row.streamRecordId !== predecessor?.streamRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.streamFunction === streamFunction && row.pipingLineObjectId === (line?.objectId ?? null));
  const record: D6R2StreamRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    streamRecordId,
    streamFunction: streamFunction as D6R2StreamRecord["streamFunction"],
    fluidObjectId: fluid?.objectId ?? null,
    fluidRevisionFingerprint: fluid?.fingerprint ?? null,
    citedPhaseClassification: citedPhase,
    compositionObjectId: composition?.objectId ?? null,
    compositionRevisionFingerprint: composition?.fingerprint ?? null,
    pipingLineObjectId: line?.objectId ?? null,
    pipingLineRevisionFingerprint: line?.fingerprint ?? null,
    streamCalculation: false,
    validatedProcessDesign: false,
    transfersD5Authority: false,
    pipingLineCreated: false,
    inferredD5Membership: false,
    pipingLineIdentity: false,
    predecessorStreamRecordId: predecessor?.streamRecordId ?? null,
  });
  return place(store, store.streams, "STREAM", streamRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.streamRecordId, duplicate, "DUPLICATE_STREAM_REJECTED", record);
}

export function recordProcessServiceFunction(store: D6R2Store, actor: D6R1Actor, input: D6R2ServiceInput): D6R2ServiceRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_SERVICE"]);
  const serviceRecordId = explicit(input.serviceRecordId, "SERVICE_CONTEXT_REQUIRED");
  const serviceFunction = explicit(input.serviceFunction, "SERVICE_FUNCTION_REQUIRED");
  const serviceDescription = explicit(input.serviceDescription, "SERVICE_DESCRIPTION_REQUIRED");
  if (!(D6_R2_SERVICE_FUNCTIONS as readonly string[]).includes(serviceFunction)) fail("SERVICE_FUNCTION_NOT_ALLOWLISTED");
  const predecessor = input.predecessorServiceRecordId ? store.services.find((row) => row.serviceRecordId === input.predecessorServiceRecordId) : null;
  if (input.predecessorServiceRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    serviceRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    serviceFunction, serviceDescription, applicability: prepared.applicability, limitations: prepared.limitations,
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, citedLifecycleStage: prepared.stage,
    citedCurrentness: prepared.citedCurrentness, predecessorServiceRecordId: predecessor?.serviceRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.services.find((row) => row.recordStatus === "CURRENT" && row.serviceRecordId !== predecessor?.serviceRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.serviceFunction === serviceFunction);
  const record: D6R2ServiceRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    serviceRecordId,
    serviceFunction: serviceFunction as D6R2ServiceRecord["serviceFunction"],
    serviceDescription,
    processDesign: false,
    pipingServiceContext: false,
    pipingServiceCreated: false,
    predecessorServiceRecordId: predecessor?.serviceRecordId ?? null,
  });
  return place(store, store.services, "SERVICE", serviceRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.serviceRecordId, duplicate, "DUPLICATE_SERVICE_REJECTED", record);
}

export function recordProcessSystemStreamMembership(store: D6R2Store, actor: D6R1Actor, input: D6R2MembershipInput): D6R2MembershipRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_STREAM"]);
  if (input.membershipBasis != null && input.membershipBasis !== "EXPLICIT") fail("INFERRED_MEMBERSHIP_REJECTED");
  const membershipId = explicit(input.membershipId, "MEMBERSHIP_REQUIRED");
  const system = requireObject(store, actor, prepared.context.contextId, input.systemObjectId, input.systemRevisionFingerprint, ["PROCESS_SYSTEM"], prepared.citedCurrentness);
  const predecessor = input.predecessorMembershipId ? store.memberships.find((row) => row.membershipId === input.predecessorMembershipId) : null;
  if (input.predecessorMembershipId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    membershipId, contextId: prepared.context.contextId, streamObjectId: prepared.object.objectId, streamRevisionFingerprint: prepared.object.fingerprint,
    systemObjectId: system.objectId, systemRevisionFingerprint: system.fingerprint, membershipBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness, predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.memberships.find((row) => row.recordStatus === "CURRENT" && row.membershipId !== predecessor?.membershipId && row.streamObjectId === prepared.object.objectId && row.streamRevisionFingerprint === prepared.object.fingerprint && row.systemObjectId === system.objectId && row.systemRevisionFingerprint === system.fingerprint);
  const record: D6R2MembershipRecord = Object.freeze({
    membershipId,
    contextId: prepared.context.contextId,
    streamObjectId: prepared.object.objectId,
    streamRevisionFingerprint: prepared.object.fingerprint,
    systemObjectId: system.objectId,
    systemRevisionFingerprint: system.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    membershipBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D6_CONTEXT_AUTHORITY,
    inferred: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorMembershipId: predecessor?.membershipId ?? null,
  });
  return place(store, store.memberships, "MEMBERSHIP", membershipId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.membershipId, duplicate, "DUPLICATE_MEMBERSHIP_REJECTED", record);
}

export function recordProcessStreamServiceAssociation(store: D6R2Store, actor: D6R1Actor, input: D6R2AssociationInput): D6R2AssociationRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_STREAM"]);
  if (input.associationBasis != null && input.associationBasis !== "EXPLICIT") fail("INFERRED_SERVICE_REJECTED");
  const associationId = explicit(input.associationId, "ASSOCIATION_REQUIRED");
  const service = requireObject(store, actor, prepared.context.contextId, input.serviceObjectId, input.serviceRevisionFingerprint, ["PROCESS_SERVICE"], prepared.citedCurrentness);
  const predecessor = input.predecessorAssociationId ? store.associations.find((row) => row.associationId === input.predecessorAssociationId) : null;
  if (input.predecessorAssociationId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    associationId, contextId: prepared.context.contextId, streamObjectId: prepared.object.objectId, streamRevisionFingerprint: prepared.object.fingerprint,
    serviceObjectId: service.objectId, serviceRevisionFingerprint: service.fingerprint, associationBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness, predecessorAssociationId: predecessor?.associationId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.associations.find((row) => row.recordStatus === "CURRENT" && row.associationId !== predecessor?.associationId && row.streamObjectId === prepared.object.objectId && row.streamRevisionFingerprint === prepared.object.fingerprint && row.serviceObjectId === service.objectId && row.serviceRevisionFingerprint === service.fingerprint);
  const record: D6R2AssociationRecord = Object.freeze({
    associationId,
    contextId: prepared.context.contextId,
    streamObjectId: prepared.object.objectId,
    streamRevisionFingerprint: prepared.object.fingerprint,
    serviceObjectId: service.objectId,
    serviceRevisionFingerprint: service.fingerprint,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    associationBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D6_CONTEXT_AUTHORITY,
    inferred: false,
    processDesign: false,
    pipingServiceContext: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorAssociationId: predecessor?.associationId ?? null,
  });
  return place(store, store.associations, "ASSOCIATION", associationId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.associationId, duplicate, "DUPLICATE_ASSOCIATION_REJECTED", record);
}

export function recordProcessStreamOriginDestination(store: D6R2Store, actor: D6R1Actor, input: D6R2EndpointInput): D6R2EndpointRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_STREAM"]);
  if (input.relationshipBasis != null && input.relationshipBasis !== "EXPLICIT") fail("INFERRED_ENDPOINT_REJECTED");
  const endpointId = explicit(input.endpointId, "ENDPOINT_REQUIRED");
  const role = explicit(input.role, "ENDPOINT_ROLE_REQUIRED");
  if (!(D6_R2_ENDPOINT_ROLES as readonly string[]).includes(role)) fail("INFERRED_ENDPOINT_REJECTED");
  const related = requireObject(store, actor, prepared.context.contextId, input.relatedObjectId, input.relatedRevisionFingerprint, D6_R2_ENDPOINT_OBJECT_TYPES, prepared.citedCurrentness);
  const predecessor = input.predecessorEndpointId ? store.endpoints.find((row) => row.endpointId === input.predecessorEndpointId) : null;
  if (input.predecessorEndpointId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    endpointId, contextId: prepared.context.contextId, streamObjectId: prepared.object.objectId, streamRevisionFingerprint: prepared.object.fingerprint,
    relatedObjectId: related.objectId, relatedRevisionFingerprint: related.fingerprint, relatedObjectType: related.objectType, role, relationshipBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef, sourceBasisRef: prepared.sourceBasisRef, applicability: prepared.applicability, limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness, predecessorEndpointId: predecessor?.endpointId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.endpoints.find((row) => row.recordStatus === "CURRENT" && row.endpointId !== predecessor?.endpointId && row.streamObjectId === prepared.object.objectId && row.streamRevisionFingerprint === prepared.object.fingerprint && row.relatedObjectId === related.objectId && row.role === role);
  const record: D6R2EndpointRecord = Object.freeze({
    endpointId,
    contextId: prepared.context.contextId,
    streamObjectId: prepared.object.objectId,
    streamRevisionFingerprint: prepared.object.fingerprint,
    relatedObjectId: related.objectId,
    relatedRevisionFingerprint: related.fingerprint,
    relatedObjectType: related.objectType as D6R2EndpointRecord["relatedObjectType"],
    role: role as D6R2EndpointRecord["role"],
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
    relationshipBasis: "EXPLICIT",
    provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef,
    applicability: prepared.applicability,
    limitations: prepared.limitations,
    citedCurrentness: prepared.citedCurrentness,
    authority: D6_CONTEXT_AUTHORITY,
    inferred: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    currentness: "CURRENT",
    predecessorEndpointId: predecessor?.endpointId ?? null,
  });
  return place(store, store.endpoints, "ENDPOINT", endpointId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.endpointId, duplicate, "DUPLICATE_ENDPOINT_REJECTED", record);
}

export function recordProcessFluidContext(store: D6R2Store, actor: D6R1Actor, input: D6R2FluidInput): D6R2FluidRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_FLUID"]);
  const fluidRecordId = explicit(input.fluidRecordId, "FLUID_CONTEXT_REQUIRED");
  const descriptiveContext = explicit(input.descriptiveContext, "FLUID_CONTEXT_REQUIRED");
  const predecessor = input.predecessorFluidRecordId ? store.fluids.find((row) => row.fluidRecordId === input.predecessorFluidRecordId) : null;
  if (input.predecessorFluidRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    fluidRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    descriptiveContext, applicability: prepared.applicability, limitations: prepared.limitations, provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef, citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness,
    predecessorFluidRecordId: predecessor?.fluidRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.fluids.find((row) => row.recordStatus === "CURRENT" && row.fluidRecordId !== predecessor?.fluidRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.descriptiveContext === descriptiveContext);
  const record: D6R2FluidRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    fluidRecordId,
    descriptiveContext,
    validatedComposition: false,
    thermodynamicModel: false,
    predecessorFluidRecordId: predecessor?.fluidRecordId ?? null,
  });
  return place(store, store.fluids, "FLUID", fluidRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.fluidRecordId, duplicate, "DUPLICATE_FLUID_REJECTED", record);
}

export function recordProcessPhaseContext(store: D6R2Store, actor: D6R1Actor, input: D6R2PhaseInput): D6R2PhaseRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_FLUID", "PROCESS_COMPOSITION_CONTEXT"]);
  const phaseRecordId = explicit(input.phaseRecordId, "PHASE_CONTEXT_REQUIRED");
  const citedPhase = explicit(input.citedPhaseClassification, "PHASE_CLASSIFICATION_REQUIRED");
  if (!prepared.object.phaseClassification || !isPhase(citedPhase) || prepared.object.phaseClassification !== citedPhase) fail("PHASE_REVISION_MISMATCH");
  const predecessor = input.predecessorPhaseRecordId ? store.phases.find((row) => row.phaseRecordId === input.predecessorPhaseRecordId) : null;
  if (input.predecessorPhaseRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    phaseRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    citedPhase, applicability: prepared.applicability, limitations: prepared.limitations, provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef, citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness,
    predecessorPhaseRecordId: predecessor?.phaseRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.phases.find((row) => row.recordStatus === "CURRENT" && row.phaseRecordId !== predecessor?.phaseRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.citedPhaseClassification === citedPhase);
  const record: D6R2PhaseRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    phaseRecordId,
    citedPhaseClassification: citedPhase,
    equilibriumCalculation: false,
    validatedPhaseBehavior: false,
    predecessorPhaseRecordId: predecessor?.phaseRecordId ?? null,
  });
  return place(store, store.phases, "PHASE", phaseRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.phaseRecordId, duplicate, "DUPLICATE_PHASE_REJECTED", record);
}

export function recordProcessSuppliedCompositionContext(store: D6R2Store, actor: D6R1Actor, input: D6R2CompositionInput): D6R2CompositionRecord {
  const prepared = prepare(store, actor, input, ["PROCESS_COMPOSITION_CONTEXT"]);
  const compositionRecordId = explicit(input.compositionRecordId, "COMPOSITION_CONTEXT_REQUIRED");
  const suppliedStatement = explicit(input.suppliedStatement, "SUPPLIED_COMPOSITION_REQUIRED");
  const predecessor = input.predecessorCompositionRecordId ? store.compositions.find((row) => row.compositionRecordId === input.predecessorCompositionRecordId) : null;
  if (input.predecessorCompositionRecordId) {
    if (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.tenantId !== actor.tenantId || !sameLineage(store, prepared.object, predecessor.objectId)) fail("PREDECESSOR_NOT_CURRENT");
  }
  const fingerprint = fingerprintCanonical({
    compositionRecordId, contextId: prepared.context.contextId, objectId: prepared.object.objectId, objectRevisionFingerprint: prepared.object.fingerprint,
    suppliedStatement, applicability: prepared.applicability, limitations: prepared.limitations, provenanceRef: prepared.provenanceRef,
    sourceBasisRef: prepared.sourceBasisRef, citedLifecycleStage: prepared.stage, citedCurrentness: prepared.citedCurrentness,
    predecessorCompositionRecordId: predecessor?.compositionRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const duplicate = store.compositions.find((row) => row.recordStatus === "CURRENT" && row.compositionRecordId !== predecessor?.compositionRecordId && row.objectId === prepared.object.objectId && row.objectRevisionFingerprint === prepared.object.fingerprint && row.suppliedStatement === suppliedStatement);
  const record: D6R2CompositionRecord = Object.freeze({
    ...truthBase(actor, prepared, fingerprint),
    recordedAt: store.now(),
    compositionRecordId,
    suppliedStatement,
    validatedComposition: false,
    normalizedToTruth: false,
    predecessorCompositionRecordId: predecessor?.compositionRecordId ?? null,
  });
  return place(store, store.compositions, "COMPOSITION", compositionRecordId, fingerprint, actor.tenantId, predecessor ?? null, (row) => row.compositionRecordId, duplicate, "DUPLICATE_COMPOSITION_REJECTED", record);
}

export function mutateProcessSystemStreamService(): never {
  return fail("CONTEXT_MUTATION_REJECTED");
}

export function repointProcessSystemStreamService(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function recordProcessOperatingCondition(): never {
  return fail("CONDITION_NOT_IN_R2");
}

export function recordProcessDesignCondition(): never {
  return fail("CONDITION_NOT_IN_R2");
}

export function recordProcessDesignBasis(): never {
  return fail("CONDITION_NOT_IN_R2");
}

export function calculateProcessComposition(): never {
  return fail("COMPOSITION_CALCULATION_REJECTED");
}

export function calculateProcessBalance(): never {
  return fail("BALANCE_NOT_IN_R2");
}

export function calculateProcessHydraulic(): never {
  return fail("HYDRAULIC_NOT_IN_R2");
}

export function recordProcessEquipmentDuty(): never {
  return fail("DUTY_NOT_IN_R2");
}

export function recordProcessSafetyRelief(): never {
  return fail("PROCESS_SAFETY_NOT_IN_R2");
}

export function createPipingLineFromProcessStream(): never {
  return fail("D5_LINE_NOT_CREATED");
}

export function createPipingServiceFromProcessService(): never {
  return fail("PIPING_SERVICE_NOT_MERGED");
}

export function validateProcessEngineering(): never {
  return fail("VALIDATION_NOT_IN_R2");
}

export function propagateProcessContext(): never {
  return fail("AUTO_PROPAGATION_REJECTED");
}
