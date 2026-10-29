/**
 * EOS-D3-R6 foundation, excavation and slope context.
 * One bounded runtime. Supplied context and recommendations only.
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
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED as ARCH_PARALLEL_CURRENTNESS,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { D3_CONTEXT_AUTHORITY, D3_DISCIPLINE, D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY as R1_IDENTITY_READY, type D3R1Actor } from "./identity-foundation";
import { D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY as R2_EVIDENCE_READY } from "./site-investigation-evidence";
import { D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY as R3_READY } from "./stratigraphy-groundwater-material";
import { D3_FIELD_LAB_TEST_RUNTIME_READY as R4_TEST_READY } from "./field-lab-test-context";
import { D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY as R5_PARAMETER_READY, type D3R5Store } from "./geotechnical-parameter-context";

export const D3_R6_STATUS = "FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT_IMPLEMENTED" as const;
export const D3_R6_MATURITY = "FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT_IMPLEMENTED" as const;
export const D3_R6_MATURITY_STATE = D3_R6_MATURITY;
export const D3_R6_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D3_R6_FOUNDATION_EXCAVATION_AND_SLOPE_CONTEXT_CLOSEOUT.md" as const;
export const D3_R1_IDENTITY_REUSED = R1_IDENTITY_READY;
export const D3_R2_INVESTIGATION_EVIDENCE_REUSED = R2_EVIDENCE_READY;
export const D3_R3_STRATIGRAPHY_MATERIAL_GROUNDWATER_REUSED = R3_READY;
export const D3_R4_FIELD_LAB_TEST_REUSED = R4_TEST_READY;
export const D3_R5_PARAMETER_CONTEXT_REUSED = R5_PARAMETER_READY;
export const EXACT_D3_R1_R5_REFERENCE_REQUIRED = true as const;
export const FLOATING_R6_SOURCE_REFERENCE_ALLOWED = false as const;
export const D3_RUNTIME_STARTED = true as const;
export const D3_RUNTIME_COUNT = 6 as const;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_IMPLEMENTED = true as const;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_COUNT = 1 as const;
export const D3_FOUNDATION_EXCAVATION_SLOPE_RUNTIME_READY = true as const;
export const D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY = R1_IDENTITY_READY;
export const D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY = R2_EVIDENCE_READY;
export const D3_STRATIGRAPHY_GROUNDWATER_MATERIAL_RUNTIME_READY = R3_READY;
export const D3_FIELD_LAB_TEST_RUNTIME_READY = R4_TEST_READY;
export const D3_GEOTECHNICAL_PARAMETER_RUNTIME_READY = R5_PARAMETER_READY;
export const D3_FOUNDATION_GEOTECHNICAL_CONTEXT_IMPLEMENTED = true as const;
export const D3_EXCAVATION_GEOTECHNICAL_CONTEXT_IMPLEMENTED = true as const;
export const D3_SLOPE_GEOHAZARD_CONTEXT_IMPLEMENTED = true as const;
export const D3_GROUND_IMPROVEMENT_CONTEXT_IMPLEMENTED = true as const;
export const D3_FOUNDATION_CONTEXT_EQUALS_STRUCTURAL_FOUNDATION_DESIGN = false as const;
export const D3_FOUNDATION_CONTEXT_EQUALS_D1_STRUCTURAL_DESIGN = false as const;
export const D3_EQUALS_D1_STRUCTURAL_AUTHORITY = ARCH_EQUALS_D1;
export const D3_EQUALS_D2_CIVIL_AUTHORITY = ARCH_EQUALS_D2;
export const D3_R6_AUTO_MUTATES_D2_CIVIL_OBJECT = false as const;
export const D3_R6_RECOMMENDATION_BASIS_REQUIRED = true as const;
export const D3_R6_RECOMMENDATION_BASIS_TRACEABLE = true as const;
export const RECOMMENDATION_WITHOUT_GOVERNED_BASIS_AUTO_ACCEPTED = false as const;
export const AI_CAN_AUTOMATICALLY_GENERATE_AUTHORITATIVE_GEOTECHNICAL_RECOMMENDATION = false as const;
export const AI_CAN_PROMOTE_CANDIDATE_RECOMMENDATION_TO_AUTHORITATIVE = false as const;
export const AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_AI_EQUALS;
export const ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY = ARCH_ADMIN_EQUALS;
export const RECOMMENDATION_EQUALS_ENGINEERING_VALIDATED = false as const;
export const RECOMMENDATION_EQUALS_APPROVAL = false as const;
export const RECOMMENDATION_EQUALS_CERTIFICATION = false as const;
export const RECOMMENDATION_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const RECOMMENDATION_PRESENT_EQUALS_CONFORMANT = false as const;
export const RECOMMENDATION_PRESENT_EQUALS_APPROVED = false as const;
export const RECOMMENDATION_PRESENT_EQUALS_CERTIFIED = false as const;
export const D3_R6_APPLICABILITY_EXPLICIT = true as const;
export const D3_R6_LIMITATIONS_EXPLICIT = true as const;
export const D3_R6_AUTO_PROPAGATED_OUTSIDE_APPLICABILITY = false as const;
export const D3_R6_AUTO_MUTATES_R5_PARAMETER = false as const;
export const D3_R6_AUTO_CREATES_R5_PARAMETER = false as const;
export const D3_R6_AUTO_VALIDATES_R5_PARAMETER = false as const;
export const CANONICAL_CURRENTNESS_REUSED = D3_0_CANONICAL_CURRENTNESS_REUSED;
export const PARALLEL_D3_CURRENTNESS_ENGINE_CREATED = ARCH_PARALLEL_CURRENTNESS;
export const CANONICAL_FINGERPRINT_REUSED = D3_0_CANONICAL_FINGERPRINT_REUSED;
export const SECOND_FINGERPRINT_ALGORITHM_CREATED = D3_0_SECOND_FINGERPRINT_ALGORITHM_CREATED;
export const D3_R6_PROVENANCE_REQUIRED = ARCH_PROVENANCE_REQUIRED;
export const D3_R6_PROVENANCE_PRESERVED = true as const;
export const D3_R6_AUTO_REPOINTED = false as const;
export const SILENT_D3_R6_MUTATION_ALLOWED = false as const;
export const D3_R6_HISTORY_PRESERVED = true as const;
export const TENANT_WORKSPACE_PROJECT_D3_R6_SCOPE_ENFORCED = true as const;
export const D3_R6_DUPLICATE_GOVERNANCE_IMPLEMENTED = true as const;
export const D3_R6_REPLAY_PROTECTION_IMPLEMENTED = true as const;
export const D3_R6_SPOOFING_PROTECTION_IMPLEMENTED = true as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D3_R7_RUNTIME_STARTED = false as const;

export const D3_R6_CONTEXT_KINDS = ["FOUNDATION", "EXCAVATION", "SLOPE_GEOHAZARD", "GROUND_IMPROVEMENT"] as const;
export const D3_R6_CONDITIONS = ["TEMPORARY", "PERMANENT", "BOTH"] as const;
export const D3_R6_RECOMMENDATION_STATUSES = ["NONE", "CANDIDATE", "GOVERNED_ADOPTED"] as const;
export const D3_R6_SOURCE_BASES = ["R2_EVIDENCE", "R3_INTERPRETATION", "R4_TEST_RESULT", "R5_PARAMETER", "SUPPLIED_ENGINEERING_REPORT", "GOVERNED_ASSUMPTION", "REFERENCED_METHOD_OR_STANDARD", "QUALIFIED_ENGINEERING_JUDGMENT"] as const;

export const D3_FOUNDATION_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_BEARING_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D3_PILE_CAPACITY_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_STABILITY_RUNTIME_COUNT = 0 as const;
export const D3_EARTH_PRESSURE_RUNTIME_COUNT = 0 as const;
export const D3_RETAINING_SYSTEM_ANALYSIS_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_SUPPORT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_SELECTION_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_DESIGN_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_RECOMMENDATION_GENERATION_RUNTIME_COUNT = 0 as const;
export const D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_EXCAVATION_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_SLOPE_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_GROUND_IMPROVEMENT_RECOMMENDATION_RUNTIME_COUNT = 0 as const;
export const D3_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_COUNT = 0 as const;
export const D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT = 0 as const;
export const D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT = 0 as const;
export const D3_CURRENTNESS_DIGITAL_THREAD_DEDICATED_RUNTIME_COUNT = 0 as const;
export const D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT = 0 as const;
export const D3_AUTOMATIC_ENGINEERING_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D3_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D3_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT = 0 as const;
export const D3_CROSS_DISCIPLINE_CONFLICT_RESOLUTION_RUNTIME_COUNT = 0 as const;
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
export const UNAUTHORIZED_D3_R7_R12_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D4_D8_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D9_RUNTIME_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CALCULATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_VALIDATION_PROMOTION = false as const;
export const UNAUTHORIZED_D3_APPROVAL_PROMOTION = false as const;
export const UNAUTHORIZED_D3_CERTIFICATION_PROMOTION = false as const;
export const UNAUTHORIZED_GA_PROMOTION = false as const;
export const UNAUTHORIZED_PRODUCT_CLAIM = false as const;

export const D3_R7_CANONICAL_PHASE = D3_IMPLEMENTATION_PHASES[6];
export const D3_R7_PHASE_TYPE = "REQUIREMENTS_ASSUMPTIONS_AND_CHANGE" as const;
export const D3_R7_CANONICAL_SCOPE = "Implement governed Geotechnical requirements, assumptions, decisions and change relationships using exact R1-R6 references and canonical EOS governance. Support explicit reassessment/change relationships without inferred dependency propagation, automatic recalculation, redesign or automatic invalidation. Do not start D4-D9." as const;
export const D3_R7_STARTED = false as const;
export const D3_R6_READY_FOR_NEXT_PHASE = true as const;
export const D3_R6_NEXT_PHASE = D3_R7_CANONICAL_PHASE;
export const D3_R6_NEXT_PHASE_TYPE = D3_R7_PHASE_TYPE;
export const D3_R6_CANONICAL_NEXT_PHASE = D3_R7_CANONICAL_PHASE;
export const D3_R6_CANONICAL_NEXT_PHASE_SCOPE = D3_R7_CANONICAL_SCOPE;
export const D3_R6_BLOCKER = "NONE" as const;
export const D3_R6_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);
const BROAD = new Set(["all", "any", "everywhere", "unrestricted"]);
const KIND_OBJECTS = {
  FOUNDATION: ["FOUNDATION_GEOTECHNICAL_CONTEXT"],
  EXCAVATION: ["EXCAVATION_GEOTECHNICAL_CONTEXT"],
  SLOPE_GEOHAZARD: ["SLOPE_GEOTECHNICAL_CONTEXT", "GEOHAZARD_CONTEXT"],
  GROUND_IMPROVEMENT: ["GROUND_IMPROVEMENT_CONTEXT"],
} as const;

type Kind = (typeof D3_R6_CONTEXT_KINDS)[number];

type Prohibited = {
  inventAuthoritative?: boolean;
  promoteCandidate?: boolean;
  aiGenerated?: boolean;
  autoGenerateRecommendation?: boolean;
  validated?: boolean;
  conformant?: boolean;
  approved?: boolean;
  certified?: boolean;
  foundationCalculation?: boolean;
  bearingCapacity?: boolean;
  settlementCalculation?: boolean;
  pileCapacity?: boolean;
  slopeStability?: boolean;
  earthPressure?: boolean;
  retainingSystemAnalysis?: boolean;
  excavationSupportDesign?: boolean;
  groundImprovementSelection?: boolean;
  groundImprovementDesign?: boolean;
  createParameter?: boolean;
  mutateParameter?: boolean;
  validateParameter?: boolean;
  propagateOutsideApplicability?: boolean;
  mutateStructuralFoundation?: boolean;
  consumeStructuralReaction?: boolean;
  mutateCivilObject?: boolean;
  repoint?: boolean;
  validation?: boolean;
  approval?: boolean;
  certification?: boolean;
  requirementsChange?: boolean;
  disciplineInterface?: boolean;
  d9Reasoning?: boolean;
};

export type D3R6ContextInput = Prohibited & {
  contextRecordId: string;
  contextId: string;
  objectId: string;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
  condition: string;
  applicability: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: string;
  sourceBasis: string;
  basisStatement: string;
  evidenceReferenceIds: readonly string[];
  parameterIds?: readonly string[];
  stratigraphyId?: string | null;
  materialClassificationId?: string | null;
  groundwaterContextId?: string | null;
  fieldTestId?: string | null;
  labTestId?: string | null;
  foundingDepthOrRange?: string | null;
  excavationDepthOrRange?: string | null;
  hazardObservation?: string | null;
  improvementCategory?: string | null;
  recommendationText?: string | null;
  recommendationStatus?: string | null;
  assertedFingerprint?: string;
  predecessorContextRecordId?: string | null;
};

export type D3R6ContextRecord = {
  contextRecordId: string;
  contextKind: Kind;
  contextId: string;
  objectId: string;
  objectType: string;
  condition: (typeof D3_R6_CONDITIONS)[number];
  applicability: string;
  limitations: string;
  provenanceRef: string;
  citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number];
  sourceBasis: (typeof D3_R6_SOURCE_BASES)[number];
  basisStatement: string;
  evidenceReferenceIds: readonly string[];
  parameterIds: readonly string[];
  stratigraphyId: string | null;
  materialClassificationId: string | null;
  groundwaterContextId: string | null;
  fieldTestId: string | null;
  labTestId: string | null;
  foundingDepthOrRange: string | null;
  excavationDepthOrRange: string | null;
  hazardObservation: string | null;
  improvementCategory: string | null;
  recommendationText: string | null;
  recommendationStatus: (typeof D3_R6_RECOMMENDATION_STATUSES)[number];
  candidateRecommendation: boolean;
  authoritativeRecommendation: boolean;
  aiGeneratedCandidate: boolean;
  structuralFoundationDesign: false;
  geotechnicalEngineeringAuthority: false;
  engineeringValidated: false;
  conformant: false;
  approved: false;
  certified: false;
  authority: typeof D3_CONTEXT_AUTHORITY;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorContextRecordId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D3R6History = {
  historyId: string;
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D3R6Store = {
  r5: D3R5Store;
  now: () => string;
  contexts: D3R6ContextRecord[];
  history: D3R6History[];
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
  if (input.inventAuthoritative === true) fail("AI_CANNOT_INVENT_AUTHORITATIVE_RECOMMENDATION");
  if (input.promoteCandidate === true) fail("AI_CANNOT_PROMOTE_CANDIDATE");
  if (input.autoGenerateRecommendation === true) fail("AUTOMATIC_RECOMMENDATION_NOT_IN_R6");
  if (input.validated === true || input.validation === true) fail("VALIDATION_NOT_IN_R6");
  if (input.conformant === true) fail("CONFORMANCE_NOT_IN_R6");
  if (input.approved === true || input.approval === true) fail("APPROVAL_NOT_IN_R6");
  if (input.certified === true || input.certification === true) fail("CERTIFICATION_NOT_IN_R6");
  if (input.foundationCalculation === true) fail("FOUNDATION_CALCULATION_NOT_IN_R6");
  if (input.bearingCapacity === true) fail("BEARING_CAPACITY_NOT_IN_R6");
  if (input.settlementCalculation === true) fail("SETTLEMENT_CALCULATION_NOT_IN_R6");
  if (input.pileCapacity === true) fail("PILE_CAPACITY_NOT_IN_R6");
  if (input.slopeStability === true) fail("SLOPE_STABILITY_NOT_IN_R6");
  if (input.earthPressure === true) fail("EARTH_PRESSURE_NOT_IN_R6");
  if (input.retainingSystemAnalysis === true) fail("RETAINING_ANALYSIS_NOT_IN_R6");
  if (input.excavationSupportDesign === true) fail("EXCAVATION_SUPPORT_DESIGN_NOT_IN_R6");
  if (input.groundImprovementSelection === true) fail("GROUND_IMPROVEMENT_SELECTION_NOT_IN_R6");
  if (input.groundImprovementDesign === true) fail("GROUND_IMPROVEMENT_DESIGN_NOT_IN_R6");
  if (input.createParameter === true) fail("R5_PARAMETER_NOT_CREATED");
  if (input.mutateParameter === true) fail("R5_PARAMETER_NOT_MUTATED");
  if (input.validateParameter === true) fail("R5_PARAMETER_NOT_VALIDATED");
  if (input.propagateOutsideApplicability === true) fail("CONTEXT_NOT_PROPAGATED");
  if (input.mutateStructuralFoundation === true || input.consumeStructuralReaction === true) fail("D1_MUTATION_REJECTED");
  if (input.mutateCivilObject === true) fail("D2_MUTATION_REJECTED");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.requirementsChange === true) fail("REQUIREMENTS_NOT_IN_R6");
  if (input.disciplineInterface === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R6");
}

function requireContext(store: D3R6Store, actor: D3R1Actor, contextId: string, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r5.r4.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D3_DISCIPLINE) fail("DISCIPLINE_NOT_GEOTECHNICAL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D3R6Store, actor: D3R1Actor, contextId: string, objectId: string, allowed: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const object = store.r5.r4.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (!allowed.includes(object.objectType)) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId || object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("R1_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireEvidence(store: D3R6Store, actor: D3R1Actor, contextId: string, ids: readonly string[], citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]): string[] {
  if (!ids || ids.length === 0) fail("CONTEXT_WITHOUT_BASIS");
  const resolved: string[] = [];
  for (const raw of ids) {
    const id = explicit(raw, "R2_EVIDENCE_REQUIRED");
    if (resolved.includes(id)) fail("DUPLICATE_EVIDENCE_LINK");
    const row = store.r5.r4.r3.r2.evidence.find((item) => item.evidenceReferenceId === id);
    if (!row) fail("R2_EVIDENCE_NOT_FOUND");
    if (row.tenantId !== actor.tenantId || row.workspaceId !== actor.workspaceId || row.projectId !== actor.projectId || row.contextId !== contextId) fail("R2_EVIDENCE_CONTEXT_MISMATCH");
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R2_EVIDENCE_NOT_CURRENT");
    resolved.push(row.evidenceReferenceId);
  }
  return resolved;
}

function optionalContextId(store: D3R6Store, actor: D3R1Actor, contextId: string, raw: string | null | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], kind: "STRATIGRAPHY" | "MATERIAL" | "GROUNDWATER"): string | null {
  if (raw == null || raw === "") return null;
  const id = explicit(raw, `R3_${kind}_REQUIRED`);
  const row = kind === "STRATIGRAPHY"
    ? store.r5.r4.r3.stratigraphy.find((item) => item.stratigraphyId === id)
    : kind === "MATERIAL"
      ? store.r5.r4.r3.materials.find((item) => item.materialClassificationId === id)
      : store.r5.r4.r3.groundwater.find((item) => item.groundwaterContextId === id);
  if (!row) fail(`R3_${kind}_NOT_FOUND`);
  if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R3_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail(`R3_${kind}_NOT_CURRENT`);
  return kind === "STRATIGRAPHY" ? (row as { stratigraphyId: string }).stratigraphyId : kind === "MATERIAL" ? (row as { materialClassificationId: string }).materialClassificationId : (row as { groundwaterContextId: string }).groundwaterContextId;
}

function requireParameters(store: D3R6Store, actor: D3R1Actor, contextId: string, ids: readonly string[] | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number]): string[] {
  if (!ids || ids.length === 0) return [];
  const resolved: string[] = [];
  for (const raw of ids) {
    const id = explicit(raw, "R5_PARAMETER_REQUIRED");
    if (resolved.includes(id)) fail("DUPLICATE_PARAMETER_LINK");
    const row = store.r5.parameters.find((item) => item.parameterId === id);
    if (!row) fail("R5_PARAMETER_NOT_FOUND");
    if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R5_PARAMETER_CONTEXT_MISMATCH");
    if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail("R5_PARAMETER_NOT_CURRENT");
    resolved.push(row.parameterId);
  }
  return resolved;
}

function optionalTest(store: D3R6Store, actor: D3R1Actor, contextId: string, raw: string | null | undefined, citedCurrentness: (typeof D3_CURRENTNESS_STATES)[number], kind: "FIELD" | "LAB"): string | null {
  if (raw == null || raw === "") return null;
  const id = explicit(raw, kind === "FIELD" ? "R4_FIELD_TEST_REQUIRED" : "R4_LAB_TEST_REQUIRED");
  const row = kind === "FIELD" ? store.r5.r4.fieldTests.find((item) => item.fieldTestId === id) : store.r5.r4.labTests.find((item) => item.labTestId === id);
  if (!row) fail(kind === "FIELD" ? "R4_FIELD_TEST_NOT_FOUND" : "R4_LAB_TEST_NOT_FOUND");
  if (row.tenantId !== actor.tenantId || row.contextId !== contextId) fail("R4_TEST_CONTEXT_MISMATCH");
  if (citedCurrentness === "CURRENT" && row.recordStatus !== "CURRENT") fail(kind === "FIELD" ? "R4_FIELD_TEST_NOT_CURRENT" : "R4_LAB_TEST_NOT_CURRENT");
  return kind === "FIELD" ? (row as { fieldTestId: string }).fieldTestId : (row as { labTestId: string }).labTestId;
}

function remember(store: D3R6Store, subjectId: string, action: D3R6History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectId, action, fingerprint, recordedAt: store.now() });
}

export function createD3R6Store(r5: D3R5Store, now: () => string = () => r5.now()): D3R6Store {
  return { r5, now, contexts: [], history: [] };
}

function record(store: D3R6Store, actor: D3R1Actor, kind: Kind, input: D3R6ContextInput): D3R6ContextRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, KIND_OBJECTS[kind], citedCurrentness);
  const evidenceReferenceIds = requireEvidence(store, actor, context.contextId, input.evidenceReferenceIds, citedCurrentness);
  const parameterIds = requireParameters(store, actor, context.contextId, input.parameterIds, citedCurrentness);
  const stratigraphyId = optionalContextId(store, actor, context.contextId, input.stratigraphyId, citedCurrentness, "STRATIGRAPHY");
  const materialClassificationId = optionalContextId(store, actor, context.contextId, input.materialClassificationId, citedCurrentness, "MATERIAL");
  const groundwaterContextId = optionalContextId(store, actor, context.contextId, input.groundwaterContextId, citedCurrentness, "GROUNDWATER");
  const fieldTestId = optionalTest(store, actor, context.contextId, input.fieldTestId, citedCurrentness, "FIELD");
  const labTestId = optionalTest(store, actor, context.contextId, input.labTestId, citedCurrentness, "LAB");
  const sourceBasis = explicit(input.sourceBasis, "SOURCE_BASIS_REQUIRED");
  if (!(D3_R6_SOURCE_BASES as readonly string[]).includes(sourceBasis)) fail("SOURCE_BASIS_NOT_ALLOWLISTED");
  if (sourceBasis === "R3_INTERPRETATION" && !stratigraphyId && !materialClassificationId && !groundwaterContextId) fail("R3_CONTEXT_REQUIRED");
  if (sourceBasis === "R4_TEST_RESULT" && !fieldTestId && !labTestId) fail("R4_TEST_REFERENCE_REQUIRED");
  if (sourceBasis === "R5_PARAMETER" && parameterIds.length === 0) fail("R5_PARAMETER_REQUIRED");
  const basisStatement = explicit(input.basisStatement, "RECOMMENDATION_BASIS_REQUIRED");
  const applicabilityToken = input.applicability.trim();
  if (!applicabilityToken || BROAD.has(applicabilityToken.toLowerCase())) fail("APPLICABILITY_REQUIRED");
  const applicability = explicit(input.applicability, "APPLICABILITY_REQUIRED");
  const limitations = explicit(input.limitations, "LIMITATIONS_REQUIRED");
  const condition = explicit(input.condition, "CONDITION_REQUIRED");
  if (!(D3_R6_CONDITIONS as readonly string[]).includes(condition)) fail("CONDITION_NOT_ALLOWLISTED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const contextRecordId = explicit(input.contextRecordId, "CONTEXT_RECORD_REQUIRED");
  const foundingDepthOrRange = optionalExplicit(input.foundingDepthOrRange, "FOUNDING_DEPTH_INVALID");
  const excavationDepthOrRange = optionalExplicit(input.excavationDepthOrRange, "EXCAVATION_DEPTH_INVALID");
  const hazardObservation = optionalExplicit(input.hazardObservation, "HAZARD_OBSERVATION_INVALID");
  const improvementCategory = optionalExplicit(input.improvementCategory, "IMPROVEMENT_CATEGORY_INVALID");
  if (kind === "EXCAVATION" && !excavationDepthOrRange) fail("EXCAVATION_DEPTH_REQUIRED");
  if (kind === "SLOPE_GEOHAZARD" && !hazardObservation) fail("HAZARD_OBSERVATION_REQUIRED");
  if (kind === "GROUND_IMPROVEMENT" && !improvementCategory) fail("IMPROVEMENT_CATEGORY_REQUIRED");
  const recommendationText = optionalExplicit(input.recommendationText, "RECOMMENDATION_TEXT_INVALID");
  const recommendationStatus = recommendationText ? explicit(input.recommendationStatus ?? "", "RECOMMENDATION_STATUS_REQUIRED") : "NONE";
  if (recommendationStatus === "VALIDATED") fail("VALIDATED_RECOMMENDATION_NOT_IN_R6");
  if (!(D3_R6_RECOMMENDATION_STATUSES as readonly string[]).includes(recommendationStatus)) fail("RECOMMENDATION_STATUS_NOT_ALLOWLISTED");
  if (!recommendationText && input.recommendationStatus && input.recommendationStatus !== "NONE") fail("RECOMMENDATION_TEXT_REQUIRED");
  if (input.aiGenerated === true && recommendationStatus !== "CANDIDATE") fail("AI_RECOMMENDATION_MUST_STAY_CANDIDATE");
  const predecessor = input.predecessorContextRecordId ? store.contexts.find((row) => row.contextRecordId === input.predecessorContextRecordId) : null;
  if (input.predecessorContextRecordId) {
    if (!predecessor || predecessor.tenantId !== actor.tenantId || predecessor.objectId !== object.objectId || predecessor.contextKind !== kind) fail(predecessor ? "R1_CONTEXT_MISMATCH" : "CONTEXT_RECORD_NOT_FOUND");
    if (predecessor.recordStatus !== "CURRENT") fail("PREDECESSOR_NOT_CURRENT");
  }
  const aiGeneratedCandidate = input.aiGenerated === true;
  const candidateRecommendation = recommendationStatus === "CANDIDATE";
  const authoritativeRecommendation = recommendationStatus === "GOVERNED_ADOPTED";
  const fingerprint = fingerprintCanonical({
    contextRecordId, contextKind: kind, contextId: context.contextId, objectId: object.objectId, objectType: object.objectType, condition, applicability, limitations, provenanceRef, citedCurrentness, sourceBasis, basisStatement, evidenceReferenceIds, parameterIds, stratigraphyId, materialClassificationId, groundwaterContextId, fieldTestId, labTestId, foundingDepthOrRange, excavationDepthOrRange, hazardObservation, improvementCategory, recommendationText, recommendationStatus, aiGeneratedCandidate, authority: D3_CONTEXT_AUTHORITY, predecessorContextRecordId: predecessor?.contextRecordId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.contexts.find((row) => row.contextRecordId === contextRecordId);
  if (existing) return existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId ? existing : fail("CONTEXT_ALREADY_RECORDED");
  if (authoritativeRecommendation && store.contexts.some((row) => row.recordStatus === "CURRENT" && row.contextRecordId !== predecessor?.contextRecordId && row.objectId === object.objectId && row.contextKind === kind && row.applicability === applicability && row.authoritativeRecommendation)) fail("DUPLICATE_AUTHORITATIVE_RECOMMENDATION");
  if (store.contexts.some((row) => row.recordStatus === "CURRENT" && row.contextRecordId !== predecessor?.contextRecordId && row.objectId === object.objectId && row.contextKind === kind && row.applicability === applicability && row.basisStatement === basisStatement && row.recommendationText === recommendationText)) fail("DUPLICATE_CONTEXT_REJECTED");
  const recordRow: D3R6ContextRecord = Object.freeze({
    contextRecordId, contextKind: kind, contextId: context.contextId, objectId: object.objectId, objectType: object.objectType, condition: condition as D3R6ContextRecord["condition"], applicability, limitations, provenanceRef, citedCurrentness, sourceBasis: sourceBasis as D3R6ContextRecord["sourceBasis"], basisStatement, evidenceReferenceIds, parameterIds, stratigraphyId, materialClassificationId, groundwaterContextId, fieldTestId, labTestId, foundingDepthOrRange, excavationDepthOrRange, hazardObservation, improvementCategory, recommendationText, recommendationStatus: recommendationStatus as D3R6ContextRecord["recommendationStatus"], candidateRecommendation, authoritativeRecommendation, aiGeneratedCandidate, structuralFoundationDesign: false, geotechnicalEngineeringAuthority: false, engineeringValidated: false, conformant: false, approved: false, certified: false, authority: D3_CONTEXT_AUTHORITY, fingerprint, recordedBy: actor.actorId, recordedAt: store.now(), recordStatus: "CURRENT", predecessorContextRecordId: predecessor?.contextRecordId ?? null, tenantId: actor.tenantId, workspaceId: actor.workspaceId, projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.contexts.findIndex((row) => row.contextRecordId === predecessor.contextRecordId);
    const superseded = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED" as const, citedCurrentness: "SUPERSEDED" as const });
    store.contexts[index] = superseded;
    remember(store, superseded.contextRecordId, "SUPERSEDED", superseded.fingerprint);
  }
  store.contexts.push(recordRow);
  remember(store, recordRow.contextRecordId, "CREATED", recordRow.fingerprint);
  return recordRow;
}

export function recordFoundationGeotechnicalContext(store: D3R6Store, actor: D3R1Actor, input: D3R6ContextInput): D3R6ContextRecord {
  return record(store, actor, "FOUNDATION", input);
}

export function recordExcavationGeotechnicalContext(store: D3R6Store, actor: D3R1Actor, input: D3R6ContextInput): D3R6ContextRecord {
  return record(store, actor, "EXCAVATION", input);
}

export function recordSlopeGeohazardContext(store: D3R6Store, actor: D3R1Actor, input: D3R6ContextInput): D3R6ContextRecord {
  return record(store, actor, "SLOPE_GEOHAZARD", input);
}

export function recordGroundImprovementContext(store: D3R6Store, actor: D3R1Actor, input: D3R6ContextInput): D3R6ContextRecord {
  return record(store, actor, "GROUND_IMPROVEMENT", input);
}

export function mutateFoundationExcavationSlope(): never {
  return fail("R6_MUTATION_REJECTED");
}

export function repointFoundationExcavationSlope(): never {
  return fail("AUTO_REPOINT_REJECTED");
}

export function calculateGeotechnicalResponse(): never {
  return fail("CALCULATION_NOT_IN_R6");
}
