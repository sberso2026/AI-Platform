import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  D2_CONTEXT_AUTHORITY,
  D2_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  createD2R1Store,
  recordCivilContext,
  recordCivilObjectIdentity,
  type D2R1Actor,
} from "./identity-foundation";
import {
  D2_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  createD2R2Store,
  recordSpatialReference,
  recordSurfaceContext,
  recordSurveySourceContext,
} from "./spatial-surface-context";
import {
  D2_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  createD2R3Store,
  recordGradingContext,
} from "./grading-earthworks-context";
import {
  D2_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  createD2R4Store,
  recordRoadsAccessContext,
} from "./roads-access-context";
import {
  D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY as R5_UTILITY_READY,
  D2_RUNTIME_COUNT as R5_RUNTIME_COUNT,
  createD2R5Store,
  recordDrainageStormwaterContext,
} from "./drainage-stormwater-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_UTILITY_CLEARANCE_CRITERIA,
  CROSSING_CONTEXT_PRESENT_EQUALS_CONFLICT_RESOLVED,
  D2_AUTOMATIC_UTILITY_CONFLICT_RESOLUTION_RUNTIME_COUNT,
  D2_AUTOMATIC_UTILITY_ROUTING_RUNTIME_COUNT,
  D2_CIVIL_APPROVAL_RUNTIME_COUNT,
  D2_CIVIL_CERTIFICATION_RUNTIME_COUNT,
  D2_CIVIL_UTILITY_CORRIDOR_CONTEXT_RUNTIME_COUNT,
  D2_CIVIL_UTILITY_CORRIDOR_CONTEXT_RUNTIME_IMPLEMENTED,
  D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY,
  D2_CIVIL_VALIDATION_RUNTIME_COUNT,
  D2_EQUALS_D4_MECHANICAL_AUTHORITY,
  D2_EQUALS_D5_PIPING_AUTHORITY,
  D2_EQUALS_D6_PROCESS_AUTHORITY,
  D2_EQUALS_D7_ELECTRICAL_AUTHORITY,
  D2_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY,
  D2_R1_CIVIL_IDENTITY_REUSED,
  D2_R2_SPATIAL_SURFACE_CONTEXT_REUSED,
  D2_R3_GRADING_EARTHWORKS_CONTEXT_REUSED,
  D2_R4_ROADS_ACCESS_CONTEXT_REUSED,
  D2_R5_DRAINAGE_STORMWATER_CONTEXT_REUSED,
  D2_R6_CANONICAL_NEXT_PHASE,
  D2_R6_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE,
  D2_R6_MATURITY,
  D2_R6_NEXT_PHASE_TYPE,
  D2_R6_STATUS,
  D2_R7_STARTED,
  D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY,
  D2_RUNTIME_COUNT,
  D2_RUNTIME_STARTED,
  D2_UTILITY_CAPACITY_CALCULATION_RUNTIME_COUNT,
  D2_UTILITY_CORRIDOR_CONTEXT_AUTO_REPOINTED,
  D2_UTILITY_CORRIDOR_FINGERPRINT_IMPLEMENTED,
  D2_UTILITY_CORRIDOR_HISTORY_PRESERVED,
  D2_UTILITY_CORRIDOR_PROVENANCE_REQUIRED,
  D2_UTILITY_QUANTITY_CALCULATION_RUNTIME_COUNT,
  D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT,
  D2_UTILITY_SIZING_RUNTIME_COUNT,
  D3_D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  NEW_DEPENDENCY_ADDED,
  SILENT_D2_UTILITY_CORRIDOR_MUTATION_ALLOWED,
  UTILITY_CONTEXT_PRESENT_EQUALS_UTILITY_DESIGN_COMPLETE,
  UTILITY_CORRIDOR_PRESENT_EQUALS_DISCIPLINE_SYSTEM_VALIDATED,
  UTILITY_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  calculateUtilityCapacity,
  calculateUtilityQuantity,
  createD2R6Store,
  generateUtilityRoute,
  mutateUtilityCorridor,
  optimizeUtilityRoute,
  recordCivilUtilityCorridorContext,
  resolveUtilityConflict,
  sizeUtility,
} from "./utility-corridor-context";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

describe("EOS-D2-R6 civil utility and corridor context", () => {
  it("records corridor context on exact R1 through R5 references without designing utilities", () => {
    expect(D2_R6_STATUS).toBe("CIVIL_UTILITY_AND_CORRIDOR_CONTEXT_IMPLEMENTED");
    expect(D2_R6_MATURITY).toBe(D2_R6_STATUS);
    expect(D2_RUNTIME_STARTED).toBe(true);
    expect(D2_RUNTIME_COUNT).toBe(6);
    expect(R5_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY).toBe(true);
    expect(R5_UTILITY_READY).toBe(false);
    expect(D2_REQUIREMENTS_ASSUMPTIONS_CHANGE_RUNTIME_READY).toBe(false);
    expect(D2_CIVIL_UTILITY_CORRIDOR_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_CIVIL_UTILITY_CORRIDOR_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D2_R1_CIVIL_IDENTITY_REUSED).toBe(true);
    expect(D2_R2_SPATIAL_SURFACE_CONTEXT_REUSED).toBe(true);
    expect(D2_R3_GRADING_EARTHWORKS_CONTEXT_REUSED).toBe(true);
    expect(D2_R4_ROADS_ACCESS_CONTEXT_REUSED).toBe(true);
    expect(D2_R5_DRAINAGE_STORMWATER_CONTEXT_REUSED).toBe(true);
    expect(D2_EQUALS_D4_MECHANICAL_AUTHORITY).toBe(false);
    expect(D2_EQUALS_D5_PIPING_AUTHORITY).toBe(false);
    expect(D2_EQUALS_D6_PROCESS_AUTHORITY).toBe(false);
    expect(D2_EQUALS_D7_ELECTRICAL_AUTHORITY).toBe(false);
    expect(D2_EQUALS_D8_INSTRUMENTATION_CONTROL_AUTHORITY).toBe(false);
    expect(UTILITY_CONTEXT_PRESENT_EQUALS_UTILITY_DESIGN_COMPLETE).toBe(false);
    expect(UTILITY_CORRIDOR_PRESENT_EQUALS_DISCIPLINE_SYSTEM_VALIDATED).toBe(false);
    expect(CROSSING_CONTEXT_PRESENT_EQUALS_CONFLICT_RESOLVED).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_UTILITY_CLEARANCE_CRITERIA).toBe(false);
    expect(D2_R6_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE).toBe(false);
    expect(UTILITY_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D2_UTILITY_CORRIDOR_CONTEXT_AUTO_REPOINTED).toBe(false);
    expect(D2_UTILITY_CORRIDOR_PROVENANCE_REQUIRED).toBe(true);
    expect(D2_UTILITY_CORRIDOR_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(SILENT_D2_UTILITY_CORRIDOR_MUTATION_ALLOWED).toBe(false);
    expect(D2_UTILITY_CORRIDOR_HISTORY_PRESERVED).toBe(true);
    expect(D2_AUTOMATIC_UTILITY_ROUTING_RUNTIME_COUNT).toBe(0);
    expect(D2_UTILITY_ROUTE_OPTIMIZATION_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_UTILITY_CONFLICT_RESOLUTION_RUNTIME_COUNT).toBe(0);
    expect(D2_UTILITY_SIZING_RUNTIME_COUNT).toBe(0);
    expect(D2_UTILITY_CAPACITY_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_UTILITY_QUANTITY_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D2_R7_STARTED).toBe(false);
    expect(D2_R6_CANONICAL_NEXT_PHASE).toBe("EOS-D2-R7-REQUIREMENTS-ASSUMPTIONS-AND-CHANGE");
    expect(D2_R6_NEXT_PHASE_TYPE).toBe("REQUIREMENTS_ASSUMPTIONS_AND_CHANGE");
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D3_D9_RUNTIME_STARTED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);

    const r1 = createD2R1Store();
    const context = recordCivilContext(r1, actor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-context" });
    const object = (objectId: string, objectType: "COORDINATE_REFERENCE" | "SURVEY_SOURCE" | "SURFACE_REFERENCE" | "GRADING_ZONE" | "CIVIL_SITE" | "ROAD_ALIGNMENT" | "ROAD_PROFILE" | "ROAD_CORRIDOR" | "PAVEMENT_CONTEXT" | "DRAINAGE_CATCHMENT" | "DRAINAGE_NETWORK" | "DRAINAGE_NODE" | "DRAINAGE_LINK" | "CIVIL_UTILITY_CORRIDOR" | "TRENCH" | "PIT" | "CROSSING" | "CLEARANCE_ENVELOPE" | "CIVIL_ASSUMPTION" | "CIVIL_EVIDENCE_REFERENCE") =>
      recordCivilObjectIdentity(r1, actor, { objectId, contextId: context.contextId, objectType, citedLifecycleStage: "CONCEPT", provenanceRef: `prov-${objectId}` });
    const coordinate = object("crs-object", "COORDINATE_REFERENCE");
    const surveyObject = object("survey-object", "SURVEY_SOURCE");
    const surfaceObject = object("surface-object", "SURFACE_REFERENCE");
    const gradingObject = object("grading-object", "GRADING_ZONE");
    const site = object("site-object", "CIVIL_SITE");
    const alignment = object("alignment-object", "ROAD_ALIGNMENT");
    const profile = object("profile-object", "ROAD_PROFILE");
    const roadCorridor = object("road-corridor-object", "ROAD_CORRIDOR");
    const pavement = object("pavement-object", "PAVEMENT_CONTEXT");
    const catchment = object("catchment-object", "DRAINAGE_CATCHMENT");
    const network = object("network-object", "DRAINAGE_NETWORK");
    const node = object("node-a", "DRAINAGE_NODE");
    const link = object("link-a", "DRAINAGE_LINK");
    const corridor = object("utility-corridor-object", "CIVIL_UTILITY_CORRIDOR");
    const trenchA = object("trench-a", "TRENCH");
    const trenchB = object("trench-b", "TRENCH");
    const pit = object("pit-object", "PIT");
    const crossingA = object("crossing-a", "CROSSING");
    const crossingB = object("crossing-b", "CROSSING");
    const clearance = object("clearance-object", "CLEARANCE_ENVELOPE");
    const assumption = object("assumption-object", "CIVIL_ASSUMPTION");
    const evidence = object("evidence-object", "CIVIL_EVIDENCE_REFERENCE");
    const r2 = createD2R2Store(r1);
    const spatial = recordSpatialReference(r2, actor, {
      spatialReferenceId: "spatial-1",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "EPSG:7844",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
    });
    const survey = recordSurveySourceContext(r2, actor, {
      surveySourceId: "survey-1",
      contextId: context.contextId,
      objectId: surveyObject.objectId,
      spatialReferenceId: spatial.spatialReferenceId,
      sourceType: "CONTROL_SURVEY",
      sourceRevision: "rev-a",
      provenanceRef: "prov-survey",
      citedCurrentness: "CURRENT",
    });
    const existing = recordSurfaceContext(r2, actor, {
      surfaceContextId: "surface-existing",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "EXISTING_SURFACE",
      spatialReferenceId: spatial.spatialReferenceId,
      surveySourceId: survey.surveySourceId,
      sourceReference: "survey-1",
      revision: "s-rev-a",
      provenanceRef: "prov-existing",
      citedCurrentness: "CURRENT",
    });
    const design = recordSurfaceContext(r2, actor, {
      surfaceContextId: "surface-design",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "DESIGN_SURFACE",
      spatialReferenceId: spatial.spatialReferenceId,
      sourceReference: "design-reference",
      revision: "d-rev-a",
      provenanceRef: "prov-design",
      citedCurrentness: "CURRENT",
    });
    const r3 = createD2R3Store(r2);
    const grading = recordGradingContext(r3, actor, {
      gradingContextId: "grading-1",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      criteria: [{ kind: "TARGET_FINISHED_LEVEL", suppliedValue: "RL 12.50", sourceRef: "criteria-source" }],
      relationships: [],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
    });
    const r4 = createD2R4Store(r3);
    const road = recordRoadsAccessContext(r4, actor, {
      roadsContextId: "road-1",
      contextId: context.contextId,
      alignmentObjectId: alignment.objectId,
      profileObjectId: profile.objectId,
      corridorObjectId: roadCorridor.objectId,
      pavementObjectId: pavement.objectId,
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      gradingContextId: grading.gradingContextId,
      criteria: [{ kind: "DESIGN_SPEED", suppliedValue: "60 km/h", sourceRef: "road-authority" }],
      accessRelationships: [{ kind: "OBJECT_REFERENCE", accessRole: "ROAD_TO_SITE", targetObjectId: site.objectId }],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      pavementTypeReference: null,
      subgradeReference: null,
      trafficCriterionReference: null,
      standardsReference: null,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-road",
      citedCurrentness: "CURRENT",
    });
    const r5 = createD2R5Store(r4);
    const drainage = recordDrainageStormwaterContext(r5, actor, {
      drainageContextId: "drainage-1",
      contextId: context.contextId,
      catchmentObjectId: catchment.objectId,
      catchmentBoundaryReference: "boundary-ref-a",
      rainfallObjectId: null,
      networkObjectId: network.objectId,
      nodeObjectIds: [node.objectId],
      linkObjectIds: [link.objectId],
      pitObjectIds: [],
      manholeObjectIds: [],
      channelObjectId: null,
      culvertObjectId: null,
      outfallObjectId: null,
      detentionObjectId: null,
      pipeReference: null,
      floodLevelReference: null,
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      gradingContextId: grading.gradingContextId,
      roadsContextId: road.roadsContextId,
      rainfallCriteria: [],
      runoffCriteria: [],
      relationships: [],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      standardsReference: null,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-drainage",
      citedCurrentness: "CURRENT",
    });
    const store = createD2R6Store(r5);
    const criteria = [
      { kind: "CORRIDOR_CLASSIFICATION" as const, suppliedValue: "cited shared services", sourceRef: "corridor-authority" },
      { kind: "CLEARANCE_SEPARATION" as const, suppliedValue: "cited 300 mm", sourceRef: "clearance-authority" },
    ];
    const relationships = [
      { kind: "OBJECT_REFERENCE" as const, utilityRole: "ROAD_CROSSING" as const, targetObjectId: crossingA.objectId },
      { kind: "PARENT" as const, utilityRole: "CORRIDOR_TO_ROAD" as const, targetObjectId: alignment.objectId },
      { kind: "OBJECT_REFERENCE" as const, utilityRole: "CORRIDOR_TO_DRAINAGE" as const, targetObjectId: network.objectId },
      { kind: "OBJECT_REFERENCE" as const, utilityRole: "CORRIDOR_TO_GRADING" as const, targetObjectId: gradingObject.objectId },
      { kind: "PARENT" as const, utilityRole: "CORRIDOR_TO_SITE" as const, targetObjectId: site.objectId },
    ];
    const shared = {
      contextId: context.contextId,
      corridorObjectId: corridor.objectId,
      trenchObjectIds: [trenchB.objectId, trenchA.objectId],
      pitObjectIds: [pit.objectId],
      crossingObjectIds: [crossingB.objectId, crossingA.objectId],
      clearanceEnvelopeObjectId: clearance.objectId,
      reservedSpaceReference: "cited-reserved-space",
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      gradingContextId: grading.gradingContextId,
      roadsContextId: road.roadsContextId,
      drainageContextId: drainage.drainageContextId,
      criteria,
      relationships,
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-utility",
      citedCurrentness: "CURRENT",
    };
    const gradingFingerprint = grading.fingerprint;
    const roadFingerprint = road.fingerprint;
    const drainageFingerprint = drainage.fingerprint;
    const recorded = recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-1" });
    expect(grading.fingerprint).toBe(gradingFingerprint);
    expect(road.fingerprint).toBe(roadFingerprint);
    expect(drainage.fingerprint).toBe(drainageFingerprint);
    expect(recorded.utilityDesignComplete).toBe(false);
    expect(recorded.disciplineSystemValidated).toBe(false);
    expect(recorded.conflictResolved).toBe(false);
    expect(recorded.routeGenerated).toBe(false);
    expect(recorded.routeOptimized).toBe(false);
    expect(recorded.utilitySized).toBe(false);
    expect(recorded.capacityCalculated).toBe(false);
    expect(recorded.quantityCalculated).toBe(false);
    expect(recorded.mechanicalAuthority).toBe(false);
    expect(recorded.pipingAuthority).toBe(false);
    expect(recorded.processAuthority).toBe(false);
    expect(recorded.electricalAuthority).toBe(false);
    expect(recorded.instrumentationAuthority).toBe(false);
    expect(recorded.engineeringValidated).toBe(false);
    expect(recorded.engineeringApproved).toBe(false);
    expect(recorded.trenchObjectIds).toEqual(["trench-a", "trench-b"]);
    expect(recorded.pitObjectIds).toEqual(["pit-object"]);
    expect(recorded.crossingObjectIds).toEqual(["crossing-a", "crossing-b"]);
    expect(recorded.surfaceContextIds).toEqual(["surface-design", "surface-existing"]);
    const sortedCriteria = [
      { kind: "CLEARANCE_SEPARATION", suppliedValue: "cited 300 mm", sourceRef: "clearance-authority" },
      { kind: "CORRIDOR_CLASSIFICATION", suppliedValue: "cited shared services", sourceRef: "corridor-authority" },
    ];
    const sortedRelationships = [
      { kind: "OBJECT_REFERENCE", utilityRole: "CORRIDOR_TO_DRAINAGE", targetObjectId: network.objectId },
      { kind: "OBJECT_REFERENCE", utilityRole: "CORRIDOR_TO_GRADING", targetObjectId: gradingObject.objectId },
      { kind: "PARENT", utilityRole: "CORRIDOR_TO_ROAD", targetObjectId: alignment.objectId },
      { kind: "PARENT", utilityRole: "CORRIDOR_TO_SITE", targetObjectId: site.objectId },
      { kind: "OBJECT_REFERENCE", utilityRole: "ROAD_CROSSING", targetObjectId: crossingA.objectId },
    ];
    expect(recorded.fingerprint).toBe(fingerprintCanonical({
      utilityContextId: "utility-1",
      contextId: context.contextId,
      corridorObjectId: corridor.objectId,
      trenchObjectIds: ["trench-a", "trench-b"],
      pitObjectIds: ["pit-object"],
      crossingObjectIds: ["crossing-a", "crossing-b"],
      clearanceEnvelopeObjectId: clearance.objectId,
      reservedSpaceReference: "cited-reserved-space",
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: ["surface-design", "surface-existing"],
      gradingContextId: grading.gradingContextId,
      roadsContextId: road.roadsContextId,
      drainageContextId: drainage.drainageContextId,
      criteria: sortedCriteria,
      relationships: sortedRelationships,
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-utility",
      citedCurrentness: "CURRENT",
      authority: D2_CONTEXT_AUTHORITY,
      predecessorUtilityContextId: null,
    }));
    expect(recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-1" }).fingerprint).toBe(recorded.fingerprint);
    expect(store.history.filter((row) => row.action === "CREATED")).toHaveLength(1);
    const unbound = recordCivilUtilityCorridorContext(store, actor, {
      ...shared,
      utilityContextId: "utility-unbound",
      gradingContextId: null,
      roadsContextId: null,
      drainageContextId: null,
      clearanceEnvelopeObjectId: null,
      reservedSpaceReference: null,
      trenchObjectIds: [],
      pitObjectIds: [],
      crossingObjectIds: [],
      criteria: [],
      relationships: [],
      provenanceRef: "prov-utility-unbound",
    });
    expect(unbound.gradingContextId).toBeNull();
    expect(unbound.roadsContextId).toBeNull();
    expect(unbound.drainageContextId).toBeNull();
    expect(unbound.utilityDesignComplete).toBe(false);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-float", contextId: "latest" })).toThrow(/R1_CONTEXT_REQUIRED/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-missing-grade", gradingContextId: undefined as unknown as null })).toThrow(/R3_GRADING_REFERENCE_REQUIRED/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-float-drain", drainageContextId: "latest" })).toThrow(/R5_DRAINAGE_REQUIRED/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-invent", inventClearanceCriteria: true })).toThrow(/CLEARANCE_CRITERIA_NOT_INVENTED/);
    expect(() => recordCivilUtilityCorridorContext(store, { ...actor, actorId: "AI_assistant" }, { ...shared, utilityContextId: "utility-ai" })).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-scope", workspaceId: "workspace-b" })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-1", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-type", corridorObjectId: gradingObject.objectId })).toThrow(/CORRIDOR_OBJECT_REQUIRED/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-near", relationships: [{ kind: "PROXIMITY", utilityRole: "CORRIDOR_TO_SITE", targetObjectId: site.objectId }] })).toThrow(/RELATIONSHIP_KIND_NOT_EXPLICIT/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-infer", inferRelationship: true })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-route", generateRoute: true })).toThrow(/ROUTE_GENERATION_NOT_IN_R6/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-opt", optimizeRoute: true })).toThrow(/ROUTE_OPTIMIZATION_NOT_IN_R6/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-clash", resolveConflict: true })).toThrow(/CONFLICT_RESOLUTION_NOT_IN_R6/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-size", sizeUtility: true })).toThrow(/UTILITY_SIZING_NOT_IN_R6/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-qty", quantityCalculation: true })).toThrow(/UTILITY_QUANTITY_NOT_IN_R6/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-elec", electricalDesign: true })).toThrow(/ELECTRICAL_DESIGN_NOT_IN_R6/);
    expect(() => recordCivilUtilityCorridorContext(store, actor, { ...shared, utilityContextId: "utility-mech", mechanicalDesign: true })).toThrow(/MECHANICAL_DESIGN_NOT_IN_R6/);

    recordSurfaceContext(r2, actor, {
      surfaceContextId: "surface-design-b",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "DESIGN_SURFACE",
      spatialReferenceId: spatial.spatialReferenceId,
      sourceReference: "design-reference-b",
      revision: "d-rev-b",
      provenanceRef: "prov-design-b",
      citedCurrentness: "CURRENT",
      predecessorSurfaceContextId: design.surfaceContextId,
    });
    recordGradingContext(r3, actor, {
      gradingContextId: "grading-1b",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      criteria: [{ kind: "GRADING_CONSTRAINT", suppliedValue: "hold", sourceRef: "criteria-source" }],
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading-b",
      citedCurrentness: "CURRENT",
      predecessorGradingContextId: grading.gradingContextId,
    });
    recordDrainageStormwaterContext(r5, actor, {
      drainageContextId: "drainage-1b",
      contextId: context.contextId,
      catchmentObjectId: catchment.objectId,
      catchmentBoundaryReference: "boundary-ref-b",
      rainfallObjectId: null,
      networkObjectId: network.objectId,
      nodeObjectIds: [node.objectId],
      linkObjectIds: [link.objectId],
      pitObjectIds: [],
      manholeObjectIds: [],
      channelObjectId: null,
      culvertObjectId: null,
      outfallObjectId: null,
      detentionObjectId: null,
      pipeReference: null,
      floodLevelReference: null,
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId],
      gradingContextId: null,
      roadsContextId: null,
      rainfallCriteria: [],
      runoffCriteria: [],
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      standardsReference: null,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-drainage-b",
      citedCurrentness: "CURRENT",
      predecessorDrainageContextId: drainage.drainageContextId,
    });
    const kept = store.utilities.find((row) => row.utilityContextId === recorded.utilityContextId);
    expect(kept?.surfaceContextIds).toEqual(["surface-design", "surface-existing"]);
    expect(kept?.gradingContextId).toBe("grading-1");
    expect(kept?.roadsContextId).toBe("road-1");
    expect(kept?.drainageContextId).toBe("drainage-1");
    expect(road.fingerprint).toBe(roadFingerprint);
    const stale = recordCivilUtilityCorridorContext(store, actor, {
      ...shared,
      utilityContextId: "utility-stale",
      gradingContextId: grading.gradingContextId,
      drainageContextId: drainage.drainageContextId,
      citedCurrentness: "STALE",
      provenanceRef: "prov-utility-stale",
      predecessorUtilityContextId: recorded.utilityContextId,
    });
    expect(stale.citedCurrentness).toBe("STALE");
    expect(stale.gradingContextId).toBe("grading-1");
    expect(stale.drainageContextId).toBe("drainage-1");
    expect(stale.surfaceContextIds).toContain("surface-design");
    expect(store.utilities.find((row) => row.utilityContextId === "utility-1")?.recordStatus).toBe("SUPERSEDED");
    expect(store.history.some((row) => row.action === "SUPERSEDED")).toBe(true);
    expect(() => generateUtilityRoute()).toThrow(/ROUTE_GENERATION_NOT_IN_R6/);
    expect(() => optimizeUtilityRoute()).toThrow(/ROUTE_OPTIMIZATION_NOT_IN_R6/);
    expect(() => resolveUtilityConflict()).toThrow(/CONFLICT_RESOLUTION_NOT_IN_R6/);
    expect(() => sizeUtility()).toThrow(/UTILITY_SIZING_NOT_IN_R6/);
    expect(() => calculateUtilityCapacity()).toThrow(/UTILITY_CAPACITY_NOT_IN_R6/);
    expect(() => calculateUtilityQuantity()).toThrow(/UTILITY_QUANTITY_NOT_IN_R6/);
    expect(() => mutateUtilityCorridor()).toThrow(/UTILITY_MUTATION_REJECTED/);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "utility-corridor-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "utility-corridor-context.ts"), source)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R6.CIVIL_UTILITY_AND_CORRIDOR_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R7.REQUIREMENTS_ASSUMPTIONS_AND_CHANGE")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
