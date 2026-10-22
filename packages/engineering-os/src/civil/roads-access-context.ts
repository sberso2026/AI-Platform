/**
 * EOS-D2-R4 roads and access context.
 * Binds to exact R1 identity and applicable R2 and R3 references.
 * Does not design the road.
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
import { D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY } from "./spatial-surface-context";
import {
  D2_GRADING_EARTHWORKS_RUNTIME_READY,
  type D2R3Store,
} from "./grading-earthworks-context";

export const D2_R4_STATUS = "ROADS_AND_ACCESS_CONTEXT_IMPLEMENTED" as const;
export const D2_R4_MATURITY = "ROADS_AND_ACCESS_CONTEXT_IMPLEMENTED" as const;
export const D2_R4_MATURITY_STATE = D2_R4_MATURITY;
export const D2_R4_CLOSEOUT_PATH = "docs/architecture/engineering-os/EOS_D2_R4_ROADS_AND_ACCESS_CONTEXT_CLOSEOUT.md" as const;
export const D2_R4_R1_IDENTITY_READY = D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY;
export const D2_R4_R2_SPATIAL_SURFACE_READY = D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY;
export const D2_R4_R3_GRADING_READY = D2_GRADING_EARTHWORKS_RUNTIME_READY;
export const D2_RUNTIME_STARTED = true as const;
export const D2_RUNTIME_COUNT = 4 as const;
export const D2_ROADS_ACCESS_RUNTIME_READY = true as const;
export const D2_R1_CIVIL_IDENTITY_REUSED = true as const;
export const D2_R2_SPATIAL_SURFACE_CONTEXT_REUSED = true as const;
export const D2_R3_GRADING_EARTHWORKS_CONTEXT_REUSED = true as const;
export const EXACT_R1_CIVIL_CONTEXT_REFERENCE_REQUIRED = true as const;
export const EXACT_R2_SPATIAL_SURFACE_REFERENCE_REQUIRED = true as const;
export const EXACT_R3_GRADING_CONTEXT_REFERENCE_REQUIRED_WHERE_APPLICABLE = true as const;
export const FLOATING_R1_REFERENCE_ALLOWED = false as const;
export const FLOATING_R2_REFERENCE_ALLOWED = false as const;
export const FLOATING_R3_REFERENCE_ALLOWED = false as const;
export const D2_ROADS_ACCESS_CONTEXT_RUNTIME_IMPLEMENTED = true as const;
export const D2_ROADS_ACCESS_CONTEXT_RUNTIME_COUNT = 1 as const;
export const D2_ROAD_CRITERION_KINDS = [
  "ROAD_CLASSIFICATION",
  "DESIGN_SPEED",
  "HORIZONTAL_GEOMETRY",
  "VERTICAL_GEOMETRY",
  "LANE_WIDTH",
  "GRADE_LIMIT",
  "ACCESS_CONSTRAINT",
  "CLEARANCE",
  "STANDARD_REFERENCE",
] as const;
export const D2_ROAD_ACCESS_ROLES = [
  "ROAD_TO_SITE",
  "ROAD_TO_PLATFORM",
  "ACCESS_ROUTE_TO_CIVIL_OBJECT",
  "ACCESS_CONSTRAINT",
  "CROSSING_INTERFACE",
] as const;
export const AI_CAN_INVENT_AUTHORITATIVE_ROAD_CRITERIA = false as const;
export const ROAD_CRITERIA_PRESENT_EQUALS_ROAD_DESIGN_COMPLETE = false as const;
export const ROAD_CONTEXT_PRESENT_EQUALS_ENGINEERING_VALIDATED = false as const;
export const ROAD_CONTEXT_PRESENT_EQUALS_ENGINEERING_APPROVED = false as const;
export const ALIGNMENT_CONTEXT_PRESENT_EQUALS_ALIGNMENT_GENERATED = false as const;
export const PROFILE_CONTEXT_PRESENT_EQUALS_VERTICAL_DESIGN_COMPLETE = false as const;
export const CORRIDOR_CONTEXT_PRESENT_EQUALS_CORRIDOR_MODEL_GENERATED = false as const;
export const D2_PAVEMENT_ENGINEERING_CALCULATION_RUNTIME_COUNT = 0 as const;
export { D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY };
export const EXPLICIT_ROAD_ACCESS_RELATIONSHIPS_SUPPORTED = true as const;
export const INFERRED_ROAD_ENGINEERING_RELATIONSHIPS_ALLOWED = false as const;
export const CANONICAL_CURRENTNESS_REUSED = true as const;
export const PARALLEL_D2_CURRENTNESS_ENGINE_CREATED = false as const;
export const D2_ROAD_CONTEXT_AUTO_REPOINTED = false as const;
export const D2_ALIGNMENT_CONTEXT_AUTO_REPOINTED = false as const;
export const D2_PROFILE_CONTEXT_AUTO_REPOINTED = false as const;
export const TENANT_WORKSPACE_PROJECT_D2_ROADS_SCOPE_ENFORCED = true as const;
export const D2_ROADS_ACCESS_PROVENANCE_REQUIRED = true as const;
export const D2_ROADS_ACCESS_PROVENANCE_PRESERVED = true as const;
export const D2_CANONICAL_FINGERPRINT_REUSED = true as const;
export const D2_SECOND_FINGERPRINT_ALGORITHM_CREATED = false as const;
export const D2_ROADS_ACCESS_FINGERPRINT_IMPLEMENTED = true as const;
export const AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY = false as const;
export const SILENT_D2_ROADS_ACCESS_MUTATION_ALLOWED = false as const;
export const D2_ROADS_ACCESS_HISTORY_PRESERVED = true as const;

export const D2_DRAINAGE_STORMWATER_RUNTIME_READY = false as const;
export const D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY = false as const;
export const D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY = false as const;
export const D2_DISCIPLINE_INTERFACE_RUNTIME_READY = false as const;
export const D2_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_READY = false as const;
export const D2_CURRENTNESS_DIGITAL_THREAD_RUNTIME_READY = false as const;
export const D2_D9_SOURCE_CONTRACT_RUNTIME_READY = false as const;
export const D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_ALIGNMENT_GENERATION_RUNTIME_COUNT = 0 as const;
export const D2_ALIGNMENT_OPTIMIZATION_RUNTIME_COUNT = 0 as const;
export const D2_PROFILE_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_CORRIDOR_GENERATION_RUNTIME_COUNT = 0 as const;
export const D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT = 0 as const;
export const D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT = 0 as const;
export const D2_QUANTITY_CALCULATION_RUNTIME_COUNT = 0 as const;
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

export const D2_R5_CANONICAL_PHASE = D2_IMPLEMENTATION_PHASES[4];
export const D2_R5_PHASE_TYPE = "DRAINAGE_AND_STORMWATER_CONTEXT" as const;
export const D2_R5_CANONICAL_SCOPE =
  "Implement bounded governed drainage/stormwater context using exact Civil identity and applicable R2-R4 references. Record catchment, drainage-network, node/link, pit/manhole, channel, culvert, outfall and detention/retention context plus rainfall/runoff criteria references, provenance, currentness and fingerprint. Do not perform hydrology, hydraulics, pipe sizing, flood modelling, drainage optimization, terrain generation, grading calculations, road calculations, quantity takeoff, or start D3-D9." as const;
export const D2_R5_STARTED = false as const;
export const D2_R4_READY_FOR_NEXT_PHASE = true as const;
export const D2_R4_NEXT_PHASE = D2_R5_CANONICAL_PHASE;
export const D2_R4_NEXT_PHASE_TYPE = D2_R5_PHASE_TYPE;
export const D2_R4_CANONICAL_NEXT_PHASE = D2_R5_CANONICAL_PHASE;
export const D2_R4_CANONICAL_NEXT_PHASE_SCOPE = D2_R5_CANONICAL_SCOPE;
export const D2_R4_BLOCKER = "NONE" as const;
export const D2_R4_MACHINE_READABLE_ROADMAP_UPDATED = true as const;

const FLOATING = new Set(["latest", "current", "newest", "head", "active", "active model"]);
const INFERRED = new Set(["inferred", "unknown", "auto", "default"]);

type Citation = { kind: string; suppliedValue: string; sourceRef: string };
type Prohibited = {
  inventCriteria?: boolean;
  generateAlignment?: boolean;
  optimizeAlignment?: boolean;
  designProfile?: boolean;
  generateCorridor?: boolean;
  designGeometry?: boolean;
  pavementCalculation?: boolean;
  determineSubgrade?: boolean;
  determineMaterial?: boolean;
  inferRelationship?: boolean;
  gradingCalculation?: boolean;
  earthworksCalculation?: boolean;
  quantity?: boolean;
  drainage?: boolean;
  hydrology?: boolean;
  hydraulics?: boolean;
  validation?: boolean;
  approval?: boolean;
  certification?: boolean;
  repoint?: boolean;
  d1Integration?: boolean;
  d3Integration?: boolean;
  d9Reasoning?: boolean;
};

export type D2R4RoadInput = Prohibited & {
  roadsContextId: string;
  contextId: string;
  alignmentObjectId: string;
  profileObjectId: string;
  corridorObjectId: string;
  pavementObjectId: string;
  spatialReferenceId: string;
  surfaceContextIds: readonly string[];
  gradingContextId: string | null;
  criteria: readonly Citation[];
  accessRelationships: readonly { kind: string; accessRole: string; targetObjectId: string }[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  pavementTypeReference: string | null;
  subgradeReference: string | null;
  trafficCriterionReference: string | null;
  standardsReference: string | null;
  citedLifecycleStage: string;
  provenanceRef: string;
  citedCurrentness: string;
  assertedFingerprint?: string;
  predecessorRoadsContextId?: string | null;
  tenantId?: string;
  workspaceId?: string;
  projectId?: string;
};

export type D2R4RoadRecord = {
  roadsContextId: string;
  contextId: string;
  alignmentObjectId: string;
  profileObjectId: string;
  corridorObjectId: string;
  pavementObjectId: string;
  spatialReferenceId: string;
  surfaceContextIds: readonly string[];
  gradingContextId: string | null;
  criteria: readonly { kind: (typeof D2_ROAD_CRITERION_KINDS)[number]; suppliedValue: string; sourceRef: string }[];
  accessRelationships: readonly { kind: (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number]; accessRole: (typeof D2_ROAD_ACCESS_ROLES)[number]; targetObjectId: string }[];
  assumptionObjectIds: readonly string[];
  evidenceObjectIds: readonly string[];
  pavementTypeReference: string | null;
  subgradeReference: string | null;
  trafficCriterionReference: string | null;
  standardsReference: string | null;
  citedLifecycleStage: (typeof D2_MATURITY_STATES)[number];
  provenanceRef: string;
  citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number];
  authority: typeof D2_CONTEXT_AUTHORITY;
  civilEngineeringAuthority: false;
  geotechnicalAuthority: false;
  roadDesignComplete: false;
  alignmentGenerated: false;
  profileDesignComplete: false;
  corridorModelGenerated: false;
  pavementCalculated: false;
  subgradeDetermined: false;
  engineeringValidated: false;
  engineeringApproved: false;
  fingerprint: string;
  recordedBy: string;
  recordedAt: string;
  recordStatus: "CURRENT" | "SUPERSEDED";
  predecessorRoadsContextId: string | null;
  tenantId: string;
  workspaceId: string;
  projectId: string;
};

export type D2R4History = {
  historyId: string;
  subjectKind: "ROADS";
  subjectId: string;
  action: "CREATED" | "SUPERSEDED";
  fingerprint: string;
  recordedAt: string;
};

export type D2R4Store = {
  r3: D2R3Store;
  now: () => string;
  roads: D2R4RoadRecord[];
  history: D2R4History[];
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

function optionalExplicit(value: string | null | undefined, code: string): string | null {
  if (value == null) return null;
  return explicit(value, code);
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
  if (input.inventCriteria === true) fail("CRITERIA_NOT_INVENTED");
  if (input.generateAlignment === true) fail("ALIGNMENT_NOT_GENERATED");
  if (input.optimizeAlignment === true) fail("ALIGNMENT_OPTIMIZATION_NOT_IN_R4");
  if (input.designProfile === true) fail("PROFILE_DESIGN_NOT_IN_R4");
  if (input.generateCorridor === true) fail("CORRIDOR_NOT_GENERATED");
  if (input.designGeometry === true) fail("ROAD_GEOMETRY_NOT_IN_R4");
  if (input.pavementCalculation === true) fail("PAVEMENT_CALCULATION_NOT_IN_R4");
  if (input.determineSubgrade === true || input.determineMaterial === true) fail("GEOTECHNICAL_AUTHORITY_NOT_IN_R4");
  if (input.inferRelationship === true) fail("INFERRED_RELATIONSHIP_REJECTED");
  if (input.gradingCalculation === true) fail("GRADING_CALCULATION_NOT_IN_R4");
  if (input.earthworksCalculation === true) fail("EARTHWORKS_NOT_IN_R4");
  if (input.quantity === true) fail("QUANTITY_NOT_IN_R4");
  if (input.drainage === true || input.hydrology === true || input.hydraulics === true) fail("DRAINAGE_NOT_IN_R4");
  if (input.validation === true) fail("VALIDATION_NOT_IN_R4");
  if (input.approval === true) fail("APPROVAL_NOT_IN_R4");
  if (input.certification === true) fail("CERTIFICATION_NOT_IN_R4");
  if (input.repoint === true) fail("AUTO_REPOINT_REJECTED");
  if (input.d1Integration === true || input.d3Integration === true || input.d9Reasoning === true) fail("OTHER_DISCIPLINE_NOT_IN_R4");
}

function currentnessOf(value: string): (typeof D2_CURRENTNESS_STATES)[number] {
  if (!isCurrentness(value.trim())) fail("CURRENTNESS_INVALID");
  return value.trim() as (typeof D2_CURRENTNESS_STATES)[number];
}

function maturityOf(value: string): (typeof D2_MATURITY_STATES)[number] {
  if (!isMaturity(value.trim())) fail("MATURITY_INVALID");
  return value.trim() as (typeof D2_MATURITY_STATES)[number];
}

function requireContext(store: D2R4Store, actor: D2R1Actor, contextId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(contextId, "R1_CONTEXT_REQUIRED");
  const context = store.r3.r2.r1.contexts.find((row) => row.contextId === id);
  if (!context) fail("R1_CONTEXT_NOT_FOUND");
  if (context.tenantId !== actor.tenantId) fail("CROSS_TENANT_OPERATION");
  if (context.workspaceId !== actor.workspaceId) fail("CROSS_WORKSPACE_OPERATION");
  if (context.projectId !== actor.projectId) fail("CROSS_PROJECT_OPERATION");
  if (context.discipline !== D2_DISCIPLINE) fail("DISCIPLINE_NOT_CIVIL");
  if (citedCurrentness === "CURRENT" && context.recordStatus !== "CURRENT") fail("R1_CONTEXT_NOT_CURRENT");
  return context;
}

function requireObject(store: D2R4Store, actor: D2R1Actor, contextId: string, objectId: string, objectType: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number], code: string) {
  const id = explicit(objectId, code);
  const object = store.r3.r2.r1.objects.find((row) => row.objectId === id);
  if (!object || object.objectType !== objectType || object.contextId !== contextId) fail(code);
  if (object.tenantId !== actor.tenantId || object.workspaceId !== actor.workspaceId || object.projectId !== actor.projectId) fail("CROSS_SCOPE_OPERATION");
  if (citedCurrentness === "CURRENT" && object.recordStatus !== "CURRENT") fail("R1_OBJECT_NOT_CURRENT");
  return object;
}

function requireSpatial(store: D2R4Store, actor: D2R1Actor, contextId: string, spatialReferenceId: string, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]) {
  const id = explicit(spatialReferenceId, "R2_SPATIAL_REQUIRED");
  const spatial = store.r3.r2.spatial.find((row) => row.spatialReferenceId === id);
  if (!spatial || spatial.contextId !== contextId || spatial.tenantId !== actor.tenantId) fail("R2_SPATIAL_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && spatial.recordStatus !== "CURRENT") fail("R2_SPATIAL_NOT_CURRENT");
  return spatial;
}

function requireSurfaces(store: D2R4Store, actor: D2R1Actor, contextId: string, surfaceContextIds: readonly string[], citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string[] {
  if (!Array.isArray(surfaceContextIds) || surfaceContextIds.length === 0) fail("R2_SURFACE_REQUIRED");
  const ids = [...new Set(surfaceContextIds.map((id) => explicit(id, "R2_SURFACE_REQUIRED")))].sort();
  for (const id of ids) {
    const surface = store.r3.r2.surfaces.find((row) => row.surfaceContextId === id);
    if (!surface || surface.contextId !== contextId || surface.tenantId !== actor.tenantId) fail("R2_SURFACE_NOT_FOUND");
    if (citedCurrentness === "CURRENT" && surface.recordStatus !== "CURRENT") fail("R2_SURFACE_NOT_CURRENT");
  }
  return ids;
}

function requireGrading(store: D2R4Store, actor: D2R1Actor, contextId: string, gradingContextId: string | null | undefined, citedCurrentness: (typeof D2_CURRENTNESS_STATES)[number]): string | null {
  if (gradingContextId === undefined) fail("R3_GRADING_REFERENCE_REQUIRED");
  if (gradingContextId === null) return null;
  const id = explicit(gradingContextId, "R3_GRADING_REQUIRED");
  const grading = store.r3.grading.find((row) => row.gradingContextId === id);
  if (!grading || grading.contextId !== contextId || grading.tenantId !== actor.tenantId) fail("R3_GRADING_NOT_FOUND");
  if (citedCurrentness === "CURRENT" && grading.recordStatus !== "CURRENT") fail("R3_GRADING_NOT_CURRENT");
  return grading.gradingContextId;
}

function requireGovernedObjects(store: D2R4Store, actor: D2R1Actor, contextId: string, objectIds: readonly string[] | undefined, objectType: "CIVIL_ASSUMPTION" | "CIVIL_EVIDENCE_REFERENCE", missingCode: string): string[] {
  if (!Array.isArray(objectIds)) fail(missingCode);
  const ids = [...new Set(objectIds.map((id) => explicit(id, missingCode)))].sort();
  for (const id of ids) {
    const object = store.r3.r2.r1.objects.find((row) => row.objectId === id);
    if (!object || object.objectType !== objectType || object.contextId !== contextId || object.tenantId !== actor.tenantId) fail(missingCode);
  }
  return ids;
}

function normalizeCriteria(items: readonly Citation[] | undefined) {
  if (!Array.isArray(items)) fail("ROAD_CRITERIA_REQUIRED");
  const normalized = items.map((item) => {
    if (!(D2_ROAD_CRITERION_KINDS as readonly string[]).includes(item.kind)) fail("ROAD_CRITERION_INVALID");
    return {
      kind: item.kind as (typeof D2_ROAD_CRITERION_KINDS)[number],
      suppliedValue: explicit(item.suppliedValue, "ROAD_CRITERION_INVALID"),
      sourceRef: explicit(item.sourceRef, "SOURCE_REFERENCE_REQUIRED"),
    };
  });
  return normalized.sort((left, right) => `${left.kind}|${left.suppliedValue}|${left.sourceRef}`.localeCompare(`${right.kind}|${right.suppliedValue}|${right.sourceRef}`));
}

function normalizeAccess(store: D2R4Store, actor: D2R1Actor, contextId: string, links: D2R4RoadInput["accessRelationships"] | undefined) {
  if (!Array.isArray(links)) fail("ACCESS_RELATIONSHIPS_REQUIRED");
  const normalized = links.map((link) => {
    if (!(D2_EXPLICIT_RELATIONSHIP_KINDS as readonly string[]).includes(link.kind)) fail("RELATIONSHIP_KIND_NOT_EXPLICIT");
    if (!(D2_ROAD_ACCESS_ROLES as readonly string[]).includes(link.accessRole)) fail("ACCESS_ROLE_INVALID");
    const targetId = explicit(link.targetObjectId, "RELATIONSHIP_TARGET_REQUIRED");
    const target = store.r3.r2.r1.objects.find((row) => row.objectId === targetId);
    if (!target || target.contextId !== contextId || target.tenantId !== actor.tenantId) fail("RELATIONSHIP_TARGET_NOT_FOUND");
    return {
      kind: link.kind as (typeof D2_EXPLICIT_RELATIONSHIP_KINDS)[number],
      accessRole: link.accessRole as (typeof D2_ROAD_ACCESS_ROLES)[number],
      targetObjectId: target.objectId,
    };
  });
  return normalized.sort((left, right) => `${left.accessRole}|${left.kind}|${left.targetObjectId}`.localeCompare(`${right.accessRole}|${right.kind}|${right.targetObjectId}`));
}

function remember(store: D2R4Store, subjectId: string, action: D2R4History["action"], fingerprint: string): void {
  store.history.push({ historyId: `hist-${store.history.length + 1}`, subjectKind: "ROADS", subjectId, action, fingerprint, recordedAt: store.now() });
}

export function createD2R4Store(r3: D2R3Store, now: () => string = () => "2026-10-22T00:00:00.000Z"): D2R4Store {
  return { r3, now, roads: [], history: [] };
}

export function recordRoadsAccessContext(store: D2R4Store, actor: D2R1Actor, input: D2R4RoadInput): D2R4RoadRecord {
  assertActor(actor);
  assertProhibited(input);
  assertScope(actor, input);
  const citedCurrentness = currentnessOf(input.citedCurrentness);
  const citedLifecycleStage = maturityOf(input.citedLifecycleStage);
  const context = requireContext(store, actor, input.contextId, citedCurrentness);
  const alignment = requireObject(store, actor, context.contextId, input.alignmentObjectId, "ROAD_ALIGNMENT", citedCurrentness, "ALIGNMENT_OBJECT_REQUIRED");
  const profile = requireObject(store, actor, context.contextId, input.profileObjectId, "ROAD_PROFILE", citedCurrentness, "PROFILE_OBJECT_REQUIRED");
  const corridor = requireObject(store, actor, context.contextId, input.corridorObjectId, "ROAD_CORRIDOR", citedCurrentness, "CORRIDOR_OBJECT_REQUIRED");
  const pavement = requireObject(store, actor, context.contextId, input.pavementObjectId, "PAVEMENT_CONTEXT", citedCurrentness, "PAVEMENT_OBJECT_REQUIRED");
  const spatial = requireSpatial(store, actor, context.contextId, input.spatialReferenceId, citedCurrentness);
  const surfaceContextIds = requireSurfaces(store, actor, context.contextId, input.surfaceContextIds, citedCurrentness);
  const gradingContextId = requireGrading(store, actor, context.contextId, input.gradingContextId, citedCurrentness);
  const criteria = normalizeCriteria(input.criteria);
  const accessRelationships = normalizeAccess(store, actor, context.contextId, input.accessRelationships);
  const assumptionObjectIds = requireGovernedObjects(store, actor, context.contextId, input.assumptionObjectIds, "CIVIL_ASSUMPTION", "ASSUMPTION_REFERENCE_REQUIRED");
  const evidenceObjectIds = requireGovernedObjects(store, actor, context.contextId, input.evidenceObjectIds, "CIVIL_EVIDENCE_REFERENCE", "EVIDENCE_REFERENCE_REQUIRED");
  const pavementTypeReference = optionalExplicit(input.pavementTypeReference, "PAVEMENT_REFERENCE_INVALID");
  const subgradeReference = optionalExplicit(input.subgradeReference, "SUBGRADE_REFERENCE_INVALID");
  const trafficCriterionReference = optionalExplicit(input.trafficCriterionReference, "TRAFFIC_CRITERION_INVALID");
  const standardsReference = optionalExplicit(input.standardsReference, "STANDARD_REFERENCE_INVALID");
  const provenanceRef = explicit(input.provenanceRef, "MISSING_PROVENANCE");
  const roadsContextId = explicit(input.roadsContextId, "ROADS_CONTEXT_REQUIRED");
  const predecessor = input.predecessorRoadsContextId ? store.roads.find((row) => row.roadsContextId === input.predecessorRoadsContextId) : null;
  if (input.predecessorRoadsContextId && (!predecessor || predecessor.recordStatus !== "CURRENT" || predecessor.contextId !== context.contextId)) fail("PREDECESSOR_NOT_CURRENT");
  const fingerprint = fingerprintCanonical({
    roadsContextId,
    contextId: context.contextId,
    alignmentObjectId: alignment.objectId,
    profileObjectId: profile.objectId,
    corridorObjectId: corridor.objectId,
    pavementObjectId: pavement.objectId,
    spatialReferenceId: spatial.spatialReferenceId,
    surfaceContextIds,
    gradingContextId,
    criteria,
    accessRelationships,
    assumptionObjectIds,
    evidenceObjectIds,
    pavementTypeReference,
    subgradeReference,
    trafficCriterionReference,
    standardsReference,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    predecessorRoadsContextId: predecessor?.roadsContextId ?? null,
  });
  if (input.assertedFingerprint != null && input.assertedFingerprint !== fingerprint) fail("FINGERPRINT_MISMATCH");
  const existing = store.roads.find((row) => row.roadsContextId === roadsContextId);
  if (existing) {
    if (existing.fingerprint === fingerprint && existing.tenantId === actor.tenantId) return existing;
    fail("ROADS_CONTEXT_ALREADY_RECORDED");
  }
  const signature = `${surfaceContextIds.join(",")}|${gradingContextId ?? ""}|${JSON.stringify(criteria)}`;
  const duplicate = store.roads.find((row) => row.recordStatus === "CURRENT" && row.roadsContextId !== predecessor?.roadsContextId && row.contextId === context.contextId && row.alignmentObjectId === alignment.objectId && `${row.surfaceContextIds.join(",")}|${row.gradingContextId ?? ""}|${JSON.stringify(row.criteria)}` === signature);
  if (duplicate) fail("DUPLICATE_ROADS_CONTEXT_REJECTED");
  const record: D2R4RoadRecord = Object.freeze({
    roadsContextId,
    contextId: context.contextId,
    alignmentObjectId: alignment.objectId,
    profileObjectId: profile.objectId,
    corridorObjectId: corridor.objectId,
    pavementObjectId: pavement.objectId,
    spatialReferenceId: spatial.spatialReferenceId,
    surfaceContextIds,
    gradingContextId,
    criteria,
    accessRelationships,
    assumptionObjectIds,
    evidenceObjectIds,
    pavementTypeReference,
    subgradeReference,
    trafficCriterionReference,
    standardsReference,
    citedLifecycleStage,
    provenanceRef,
    citedCurrentness,
    authority: D2_CONTEXT_AUTHORITY,
    civilEngineeringAuthority: false,
    geotechnicalAuthority: false,
    roadDesignComplete: false,
    alignmentGenerated: false,
    profileDesignComplete: false,
    corridorModelGenerated: false,
    pavementCalculated: false,
    subgradeDetermined: false,
    engineeringValidated: false,
    engineeringApproved: false,
    fingerprint,
    recordedBy: actor.actorId,
    recordedAt: store.now(),
    recordStatus: "CURRENT",
    predecessorRoadsContextId: predecessor?.roadsContextId ?? null,
    tenantId: actor.tenantId,
    workspaceId: actor.workspaceId,
    projectId: actor.projectId,
  });
  if (predecessor) {
    const index = store.roads.findIndex((row) => row.roadsContextId === predecessor.roadsContextId);
    const superseded: D2R4RoadRecord = Object.freeze({ ...predecessor, recordStatus: "SUPERSEDED", citedCurrentness: "SUPERSEDED" });
    store.roads[index] = superseded;
    remember(store, superseded.roadsContextId, "SUPERSEDED", superseded.fingerprint);
  }
  store.roads.push(record);
  remember(store, record.roadsContextId, "CREATED", record.fingerprint);
  return record;
}

export function mutateRoadsAccess(): never {
  return fail("ROADS_ACCESS_MUTATION_REJECTED");
}

export function generateAlignment(): never {
  return fail("ALIGNMENT_NOT_GENERATED");
}

export function optimizeAlignment(): never {
  return fail("ALIGNMENT_OPTIMIZATION_NOT_IN_R4");
}

export function designProfile(): never {
  return fail("PROFILE_DESIGN_NOT_IN_R4");
}

export function generateCorridor(): never {
  return fail("CORRIDOR_NOT_GENERATED");
}

export function calculatePavement(): never {
  return fail("PAVEMENT_CALCULATION_NOT_IN_R4");
}
