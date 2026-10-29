/**
 * EOS-D2-R3 grading and earthworks context.
 * Binds to exact R1 identity and exact R2 surface context.
 * Does not design grading or calculate earthworks.
 */
import {
  D2_CURRENTNESS_STATES,
  D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D2_IMPLEMENTATION_PHASES,
  D2_MATURITY_STATES,
} from "@rtb/types";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import {
  D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY,
  D2_CONTEXT_AUTHORITY,
  D2_DISCIPLINE,
  D2_EXPLICIT_RELATIONSHIP_KINDS,
  type D2R1Actor,
} from "./identity-foundation";
import {
  D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY,
  type D2R2Store,
} from "./spatial-surface-context";

export const D2_R3_STATUS = "GRADING_AND_EARTHWORKS_CONTEXT_IMPLEMENTED" as const;
export const D2_R3_MATURITY = "GRADING_AND_EARTHWORKS_CONTEXT_IMPLEMENTED" as const;
export const D2_R3_MATURITY_STATE = D2_R3_MATURITY;
export const D2_R3_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R3_GRADING_AND_EARTHWORKS_CONTEXT_CLOSEOUT.md" as const;
export const D2_R3_R1_IDENTITY_READY = D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY;
export const D2_R3_R2_SPATIAL_SURFACE_READY = D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 3 as const;
export const D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY_NOW = D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY;
export const D2_GRADING_EARTHWORKS_RUNTIME_READY = true as const;
export const D2_R1_CIVIL_IDENTITY_REUSED = true as const;
export const D2_R2_SPATIAL_SURFACE_CONTEXT_REUSED = true as const;
export const EXACT_R1_CIVIL_CONTEXT_REFERENCE_REQUIRED = true as const;
export const EXACT_R2_SURFACE_CONTEXT_REFERENCE_REQUIRED = true as const;
export const FLOATING_R1_REFERENCE_ALLOWED = false as const;
export const FLOATING_R2_SURFACE_REFERENCE_ALLOWED = false as const;
export const D2_GRADING_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D2_GRADING_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D2_EARTHWORKS_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D2_GRADING_CRITERION_KINDS = [
  "TARGET_FINISHED_LEVEL",
  "MAXIMUM_SLOPE",
  "MINIMUM_SLOPE",
  "GRADING_CONSTRAINT",
  "NO_DISTURBANCE_ZONE",
  "DRAINAGE_GRADING_CRITERION",
  "INTERFACE_CONSTRAINT",
] as const;
export const D2_EARTHWORKS_CONTEXT_KINDS = ["EXCAVATION", "FILL"] as const;
export const D2_SUPPLIED_GEOTECHNICAL_CITATION_KINDS = [
  "FILL_CLASSIFICATION",
  "EXCAVATION_CONSTRAINT",
  "GROUNDWATER_CONDITION",
  "ALLOWABLE_SLOPE_CRITERION",
  "COMPACTION_CRITERION",
  "MATERIAL_SUITABILITY",
] as const;
export const LEVEL_CRITERIA_PRESENT_EQUALS_GRADING_DESIGN_COMPLETE = false as const;
export const SLOPE_CRITERIA_PRESENT_EQUALS_SLOPE_STABILITY_VALIDATED = false as const;
export const GRADING_CONTEXT_PRESENT_EQUALS_ENGINEERING_APPROVED = false as const;
export const EARTHWORKS_CONTEXT_PRESENT_EQUALS_QUANTITY_VALIDATED = false as const;
export const AI_CAN_INVENT_AUTHORITATIVE_GRADING_CRITERIA = false as const;
export const D2_R3_CAN_REFERENCE_GOVERNED_ASSUMPTIONS = true as const;
export const D2_R3_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE = false as const;
export const D2_R3_CAN_REFERENCE_GOVERNED_EVIDENCE = true as const;
export const EVIDENCE_REFERENCE_EQUALS_ENGINEERING_VALIDATED = false as const;
export { D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY };
export const D2_GEOTECHNICAL_SLOPE_STABILITY_RUNTIME_COUNT = 0 as const;
export const D2_GEOTECHNICAL_MATERIAL_VALIDATION_RUNTIME_COUNT = 0 as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const D2_GRADING_CONTEXT_AUTO_REPOINTED = false as const;
export const D2_EARTHWORKS_CONTEXT_AUTO_REPOINTED = false as const;
export const TENANT_WORKSPACE_PROJECT_D2_GRADING_SCOPE_ENFORCED = true as const;
export const D2_GRADING_EARTHWORKS_PROVENANCE_REQUIRED = true as const;
export const D2_GRADING_EARTHWORKS_PROVENANCE_PRESERVED = true as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_GRADING_EARTHWORKS_FINGERPRINT_IMPLEMENTED = true as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const SILENT_D2_GRADING_EARTHWORKS_MUTATION_ALLOWED = false as const;
export const D2_GRADING_EARTHWORKS_HISTORY_PRESERVED = true as const;

export const D2_ROADS_ACCESS_RUNTIME_READY = false as const;
export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = false as const;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = false as const;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D2_TERRAIN_GENERATION_RUNTIME_COUNT = 0 as const;
export const D2_SURFACE_INTERPOLATION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_GRADING_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_CUT_FILL_QUANTITY_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_MASS_HAUL_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_ROAD_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_DRAINAGE_RUNTIME_COUNT = 0 as const;
export const D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_UTILITY_GEOMETRY_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_VALIDATION_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_APPROVAL_RUNTIME_COUNT = 0 as const;
export const D2_CIVIL_CERTIFICATION_RUNTIME_COUNT = 0 as const;
export const D2_D1_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D3_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D4_D8_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D2_D9_RUNTIME_INTEGRATION_COUNT = 0 as const;
export const D3_RUNTIME_STARTED = false as const;
export const D4_RUNTIME_STARTED = false as const;
export const D5_RUNTIME_STARTED = false as const;
export const D6_RUNTIME_STARTED = false as const;
export const D7_RUNTIME_STARTED = false as const;
export const D8_RUNTIME_STARTED = false as const;
export const D9_RUNTIME_STARTED = false as const;
export const D3_D9_RUNTIME_STARTED = false as const;
export const DATABASE_SCHEMA_CHANGED = false as const;
export const NEW_DEPENDENCY_ADDED = false as const;

export const D2_R4_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[3];
export const D2_R4_PHASE_TYPE = "ROADS_AND_ACCESS_CONTEXT" as const;
export const D2_R4_CANONICAL_SCOPE =
  "Implement bounded governed roads/access context using exact R1 identity and applicable R2/R3 references. Record road/alignment/profile/corridor identity and design-criteria context, access relationships, pavement context references, provenance, currentness and fingerprint. Do not perform road geometric calculations, alignment optimization, pavement engineering calculations, grading calculations, drainage calculations, quantity takeoff, or start D3-D9." as const;
export const D2_R4_STARTED = false as const;
export const D2_R3_READY_FOR_NEXT_PHASE = true as const;
export const D2_R3_NEXT_PHASE = D2_R4_CANONICAL_PHASE;
export const D2_R3_NEXT_PHASE_TYPE = D2_R4_PHASE_TYPE;
export const D2_R3_CANONICAL_NEXT_PHASE = D2_R4_CANONICAL_PHASE;
export const D2_R3_CANONICAL_NEXT_PHASE_SCOPE = D2_R4_CANONICAL_SCOPE;
export const D2_R3_BLOCKER = "NONE" as const;
export const D2_R3_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);

type Citation = { kind: string; suppliedValue: string; sourceRef: string };
type Prohibited = {
  inventCriteria?: boolean;
  inventAssumption?: boolean;
  assumptionText?: string | null;
  terrainGeneration?: boolean;
  interpolateSurface?: boolean;
  automaticGrading?: boolean;
  optimizeGrading?: boolean;
  cutVolume?: number | null;
  fillVolume?: number | null;
  massHaul?: boolean;
  quantity?: boolean;
  slopeStability?: boolean;
  materialValidation?: boolean;
  determineGeotechnical?: boolean;
  roadDesign?: boolean;
  drainage?: boolean;
  repoint?: boolean;
  validation?: boolean;
  approval?: boolean;
  certification?: boolean;
  d1Integration?: boolean;
  d3Integration?: boolean;
  d9Reasoning?: boolean;
};

export type D2R3GradingInput = Prohibited & {
  gradingContextId: string;
  contextId: string;
  objectId: string;
  surfaceContextIds: readonly string[];
  criteria: readonly Citation[];
  relationships: readonly { kind: string; targetObjectId: string }[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  citedLifecycleStage: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorGradingContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R3GradingRecord = {
  gradingContextId: string;
  contextId: string;
  objectId: string;
  surfaceContextIds: readonly string[];
  criteria: readonly { kind: (typeof D2_GRADING_CRITERION_KINDS)[number]; suppliedValue: string; sourceRef: string }[];
  relationships: readonly { kind: (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number]; targetObjectId: string }[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  citedLifecycleStage: (typeof D2_MATURITY_STATES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  gradingDesignComplete: false;
  engineeringApproved: false;
  engineeringValidated: false;
  slopeStabilityValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorGradingContextId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R3EarthworksInput = Prohibited & {
  earthworksContextId: string;
  gradingContextId: string;
  contextId: string;
  objectId: string;
  surfaceContextIds: readonly string[];
  earthworksKind: string;
  suppliedCitations: readonly Citation[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorEarthworksContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R3EarthworksRecord = {
  earthworksContextId: string;
  gradingContextId: string;
  contextId: string;
  objectId: string;
  surfaceContextIds: readonly string[];
  earthworksKind: (typeof D2_EARTHWORKS_CONTEXT_KINDS)[number];
  suppliedCitations: readonly { kind: (typeof D2_SUPPLIED_GEOTECHNICAL_CITATION_KINDS)[number]; suppliedValue: string; sourceRef: string }[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  geotechnicalAuthority: false;
  quantityValidated: false;
  materialValidated: false;
  slopeStabilityValidated: false;
  cutFillCalculated: false;
  engineeringValidated: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorEarthworksContextId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R3History = {
  historyId: string;
  subjectKind: "GRADING" | "EARTHWORKS";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R3Store = {
  r2: D2R2Store;
  now: () => string;
  grading: D2R3GradingRecord[];
  earthworks: D2R3EarthworksRecord[];
  history: D2R3History[];
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

function isCurrentness(value: string): value is (typeof D2_CURRENTNESS_STATES)[number] {
  return (D2_CURRENTNESS_STATES as readonly string[]).includes(value);
}

function isMaturity(value: string): value is (typeof D2_MATURITY_STATES)[number] {
  return (D2_MATURITY_STATES as readonly string[]).includes(value);
}

function assertActor(actor: D2R1Actor): void {
  if (!actor.actorId.trim() || !actor.tenantId.trim() || !actor.workspaceId.trim() || !actor.projectId.trim()) fail("SCOPE_REQUIRED");
  if (blockedParty(actor.actorId) || blockedParty(actor.authority)) fail("AI_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "ADMINISTRATOR" || actor.authority === "ADMIN") fail("ADMIN_NOT_CIVIL_AUTHORITY");
  if (actor.authority === "CIVIL_ENGINEERING_AUTHORITY") fail("RECORDER_NOT_CIVIL_ENGINEERING_AUTHORITY");
  if (actor.authority !== D2_CONTEXT_AUTHORITY) fail("UNAUTHORIZED");
}

function assertScope(actor: D2R1Actor, input: { tenantId?: string; workspaceId?: string; projectId?: string }): void {
  if (input.tenantId != null && input.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (input.workspaceId != null && input.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (input.projectId != null && input.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
}

function assertProhibited(input: Prohibited): void {
  if (input.inventCriteria === true || input.inventAssumption === true || (input.assumptionText != null && input.assumptionText !== "")) fail("CRITERIA_NOT_INVENTED");
  if (input.terrainGeneration === true) fail("TERRAIN_NOT_IN_R3");
  if (input.interpolateSurface === true) fail("INTERPOLATION_NOT_IN_R3");
  if (input.automaticGrading === true) fail("AUTOMATIC_GRADING_NOT_IN_R3");
  if (input.optimizeGrading === true) fail("GRADING_OPTIMIZATION_NOT_IN_R3");
  if (input.cutVolume != null || input.fillVolume != null) fail("CUT_FILL_NOT_IN_R3");
  if (input.massHaul === true) fail("MASS_HAUL_NOT_IN_R3");
  if (input.quantity === true) fail("QUANTITY_NOT_IN_R3");
  if (input.slopeStability === true) fail("SLOPE_STABILITY_NOT_IN_R3");
  if (input.materialValidation === true || input.determineGeotechnical === true) fail("GEOTECHNICAL_AUTHORITY_NOT_IN_R3");
  if (input.roadDesign === true) fail("ROAD_DESIGN_NOT_IN_R3");
  if (input.drainage === true) fail("DRAINAGE_NOT_IN_R3");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.validation === true) fail("VALIDATION_NOT_IN_R3");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R3");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R3");
  if (input.d1Integration === true || input.d3Integration === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R3");
}

function currentnessOf(value: string): (typeof D2_CURRENTNESS_STATES)[number] {
  if (!isCurrentness(value.trim())) fail("CURRENTNESS_INVALID");
  return value.trim() as (typeof D2_CURRENTNESS_STATES)[number];
}

function maturityOf(value: string): (typeof D2_MATURITY_STATES)[number] {
  if (!isMaturity(value.trim())) fail("MATURITY_INVALID");
  return value.trim() as (typeof D2_MATURITY_STATES)[number];
}

function requireContext(store: D2R3Store, actor: D2R1Actor, contextId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D2R3Store, actor: D2R1Actor, contextId: string, objectId: string, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(objectId, "R1_OBJECT_REQUIRED");
  const object = store.r2.r1.objects.find((row) => row.objectId === id);
  if (!object) fail("R1_OBJECT_NOT_FOUND");
  if (object.objectType !== objectType) fail("R1_OBJECT_TYPE_MISMATCH");
  if (object.contextId !== contextId) fail("R1_CONTEXT_MISMATCH");
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireSurfaces(store: D2R3Store, actor: D2R1Actor, contextId: string, surfaceContextIds: readonly string[], citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string[] {
  if (!Array.isArray(surfaceContextIds) || surfaceContextIds.length === 0) fail("R2_SURFACE_REQUIRED");
  const ids = [...new Set(surfaceContextIds.map((id) => explicit(id, "R2_SURFACE_REQUIRED")))].sort();
  for (const id of ids) {
    const surface = store.r2.surfaces.find((row) => row.surfaceContextId === id);
    if (!surface) fail("R2_SURFACE_NOT_FOUND");
    if (surface.contextId !== contextId || surface.tenantId !== actor.tenantId) fail("R1_CONTEXT_MISMATCH");
    if (citedCurrentness === "CURRENT" && surface.recordStatus !== "CURRENT") fail("R2_SURFACE_NOT_CURRENT");
  }
  return ids;
}

function requireGovernedObjects(store: D2R3Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined, objectType: "CIVIL_ASSUMPTION" | "CIVIL_EVIDENCE_REFERENCE", missingCode: string): string[] {
  if (!Array.isArray(objectIds)) fail(missingCode);
  const ids = [...new Set(objectIds.map((id) => explicit(id, missingCode)))].sort();
  for (const id of ids) {
    const object = store.r2.r1.objects.find((row) => row.objectId === id);
    if (!object || object.objectType !== objectType || object.contextId !== contextId) fail(missingCode);
    if (object.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  }
  return ids;
}

function normalizeCriteria<T extends string>(items: readonly Citation[] | undefined, allowlist: readonly T[], code: string): { kind: T; suppliedValue: string; sourceRef: string }[] {
  if (!Array.isArray(items)) fail(code);
  const normalized = items.map((item) => {
    if (!(allowlist as readonly string[]).includes(item.kind)) fail(code);
    return {
      kind: item.kind as T,
      suppliedValue: explicit(item.suppliedValue, code),
      sourceRef: explicit(item.sourceRef, "SOURCE_REFERENCE_REQUIRED"),
    };
  });
  return normalized.sort((left, right) => `${left.kind}|${left.suppliedValue}|${left.sourceRef}`.localeCompare(`${right.kind}|${right.suppliedValue}|${right.sourceRef}`));
}

function normalizeRelationships(store: D2R3Store, actor: D2R1Actor, contextId: string, links: readonly { kind: string; targetObjectId: string }[] | undefined) {
  if (!Array.isArray(links)) fail("RELATIONSHIPS_REQUIRED");
  const normalized = links.map((link) => {
    if (!(D2_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    const targetId = explicit(link.targetObjectId, "RELATIONSHIP_TARGET_REQUIRED");
    const target = store.r2.r1.objects.find((row) => row.objectId === targetId);
    if (!target || target.contextId !== contextId) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    if (target.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
    return { kind: link.kind as (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number], targetObjectId: target.objectId };
  });
  return normalized.sort((left, right) => `${left.kind}|${left.targetObjectId}`.localeCompare(`${right.kind}|${right.targetObjectId}`));
}

function remember(store: D2R3Store, subjectKind: D2R3History["subjectKind"], subjectId: string, action: D2R3History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind, subjectId, action, fingerprint, recordedAt: store.now() });
}

export function createD2R3Store(r2: D2R2Store, now: () => string = () => "2026-10-22T00:00:00.000Z"): D2R3Store {
  return { r2, now, grading: [], earthworks: [], history: [] };
}

export function recordGradingContext(store: D2R3Store, actor: D2R1Actor, input: D2R3GradingInput): D2R3GradingRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, "GRADING_ZONE", citedCurrentness);
  const surfaceContextIds = requireSurfaces(store, actor, context.contextId, input.surfaceContextIds, citedCurrentness);
  const criteria = normalizeCriteria(input.criteria, D2_GRADING_CRITERION_KINDS, "GRADING_CRITERION_INVALID");
  const relationships = normalizeRelationships(store, actor, context.contextId, input.relationships);
  const assumptionObjectIds = requireGovernedObjects(store, actor, context.contextId, input.assumptionObjectIds, "CIVIL_ASSUMPTION", "ASSUMPTION_REFERENCE_REQUIRED");
  const evidenceObjectIds = requireGovernedObjects(store, actor, context.contextId, input.evidenceObjectIds, "CIVIL_EVIDENCE_REFERENCE", "EVIDENCE_REFERENCE_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const gradingContextId = explicit(input.gradingContextId, "GRADING_CONTEXT_REQUIRED");
  const predecessor = input.predecessorGradingContextId ? store.grading.find((row) => row.gradingContextId === input.predecessorGradingContextId) : null;
  if (input.predecessorGradingContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    gradingContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    surfaceContextIds,
    criteria,
    relationships,
    assumptionObjectIds,
    evidenceObjectIds,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorGradingContextId: predecessor?.gradingContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.grading.find((row) => row.gradingContextId === gradingContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("GRADING_CONTEXT_ALREADY_RECORDED");
  }
  const signature = `${surfaceContextIds.join(",")}|${JSON.stringify(criteria)}`;
  const duplicate = store.grading.find((row) => row.recordStatus === "CURRENT" && row.gradingContextId !== predecessor?.gradingContextId && row.contextId === context.contextId && row.objectId === object.objectId && `${row.surfaceContextIds.join(",")}|${JSON.stringify(row.criteria)}` === signature);
  if (duplicate) fail("DUPLICATE_GRADING_CONTEXT_REJECTED");
  const record: D2R3GradingRecord = Object.freeze({
    gradingContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    surfaceContextIds,
    criteria,
    relationships,
    assumptionObjectIds,
    evidenceObjectIds,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    gradingDesignComplete: false,
    engineeringApproved: false,
    engineeringValidated: false,
    slopeStabilityValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorGradingContextId: predecessor?.gradingContextId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.grading.findIndex((row) => row.gradingContextId === predecessor.gradingContextId);
    const superseded: D2R3GradingRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.grading[index] = superseded;
    remember(store, "GRADING", superseded.gradingContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.grading.push(record);
  remember(store, "GRADING", record.gradingContextId, "CREATED", record.fingerprint);
  return record;
}

export function recordEarthworksContext(store: D2R3Store, actor: D2R1Actor, input: D2R3EarthworksInput): D2R3EarthworksRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const object = requireObject(store, actor, context.contextId, input.objectId, "EARTHWORKS_ZONE", citedCurrentness);
  const grading = store.grading.find((row) => row.gradingContextId === input.gradingContextId);
  if (!grading || grading.contextId !== context.contextId || grading.tenantId !== actor.tenantId) fail("GRADING_CONTEXT_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && grading.recordStatus !== "CURRENT") fail("GRADING_CONTEXT_NOT_CURRENT");
  const surfaceContextIds = requireSurfaces(store, actor, context.contextId, input.surfaceContextIds, citedCurrentness);
  if (!(D2_EARTHWORKS_CONTEXT_KINDS as readonly string[]).includes(input.earthworksKind)) fail("EARTHWORKS_KIND_INVALID");
  const earthworksKind = input.earthworksKind as (typeof D2_EARTHWORKS_CONTEXT_KINDS)[number];
  const suppliedCitations = normalizeCriteria(input.suppliedCitations, D2_SUPPLIED_GEOTECHNICAL_CITATION_KINDS, "GEOTECHNICAL_CITATION_INVALID");
  const assumptionObjectIds = requireGovernedObjects(store, actor, context.contextId, input.assumptionObjectIds, "CIVIL_ASSUMPTION", "ASSUMPTION_REFERENCE_REQUIRED");
  const evidenceObjectIds = requireGovernedObjects(store, actor, context.contextId, input.evidenceObjectIds, "CIVIL_EVIDENCE_REFERENCE", "EVIDENCE_REFERENCE_REQUIRED");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const earthworksContextId = explicit(input.earthworksContextId, "EARTHWORKS_CONTEXT_REQUIRED");
  const predecessor = input.predecessorEarthworksContextId ? store.earthworks.find((row) => row.earthworksContextId === input.predecessorEarthworksContextId) : null;
  if (input.predecessorEarthworksContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    earthworksContextId,
    gradingContextId: grading.gradingContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    surfaceContextIds,
    earthworksKind,
    suppliedCitations,
    assumptionObjectIds,
    evidenceObjectIds,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorEarthworksContextId: predecessor?.earthworksContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.earthworks.find((row) => row.earthworksContextId === earthworksContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint) return existing;
    fail("EARTHWORKS_CONTEXT_ALREADY_RECORDED");
  }
  const duplicate = store.earthworks.find((row) => row.recordStatus === "CURRENT" && row.earthworksContextId !== predecessor?.earthworksContextId && row.contextId === context.contextId && row.objectId === object.objectId && row.earthworksKind === earthworksKind && row.gradingContextId === grading.gradingContextId);
  if (duplicate) fail("DUPLICATE_EARTHWORKS_CONTEXT_REJECTED");
  const record: D2R3EarthworksRecord = Object.freeze({
    earthworksContextId,
    gradingContextId: grading.gradingContextId,
    contextId: context.contextId,
    objectId: object.objectId,
    surfaceContextIds,
    earthworksKind,
    suppliedCitations,
    assumptionObjectIds,
    evidenceObjectIds,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    geotechnicalAuthority: false,
    quantityValidated: false,
    materialValidated: false,
    slopeStabilityValidated: false,
    cutFillCalculated: false,
    engineeringValidated: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorEarthworksContextId: predecessor?.earthworksContextId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.earthworks.findIndex((row) => row.earthworksContextId === predecessor.earthworksContextId);
    const superseded: D2R3EarthworksRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.earthworks[index] = superseded;
    remember(store, "EARTHWORKS", superseded.earthworksContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.earthworks.push(record);
  remember(store, "EARTHWORKS", record.earthworksContextId, "CREATED", record.fingerprint);
  return record;
}

export function mutateGradingEarthworks(): never {
  return fail("GRADING_EARTHWORKS_MUTATION_REJECTED");
}

export function designGrading(): never {
  return fail("AUTOMATIC_GRADING_NOT_IN_R3");
}

export function calculateCutFill(): never {
  return fail("CUT_FILL_NOT_IN_R3");
}

export function validateSlopeStability(): never {
  return fail("SLOPE_STABILITY_NOT_IN_R3");
}
