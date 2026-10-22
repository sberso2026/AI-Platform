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
  D2_DRAINAGE_STORMWATER_RUNTIME_READY as R4_DRAINAGE_READY,
  D2_RUNTIME_COUNT as R4_RUNTIME_COUNT,
  createD2R4Store,
  recordRoadsAccessContext,
} from "./roads-access-context";
import {
  AI_CAN_INVENT_AUTHORITATIVE_RAINFALL_CRITERIA,
  AI_CAN_INVENT_AUTHORITATIVE_RUNOFF_CRITERIA,
  CATCHMENT_CONTEXT_PRESENT_EQUALS_HYDROLOGY_CALCULATED,
  D2_CHANNEL_HYDRAULICS_RUNTIME_COUNT,
  D2_CIVIL_APPROVAL_RUNTIME_COUNT,
  D2_CIVIL_CERTIFICATION_RUNTIME_COUNT,
  D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY,
  D2_CIVIL_VALIDATION_RUNTIME_COUNT,
  D2_CULVERT_SIZING_RUNTIME_COUNT,
  D2_DETENTION_SIZING_RUNTIME_COUNT,
  D2_DRAINAGE_CONTEXT_AUTO_REPOINTED,
  D2_DRAINAGE_FINGERPRINT_IMPLEMENTED,
  D2_DRAINAGE_HISTORY_PRESERVED,
  D2_DRAINAGE_OPTIMIZATION_RUNTIME_COUNT,
  D2_DRAINAGE_PROVENANCE_REQUIRED,
  D2_DRAINAGE_STORMWATER_CONTEXT_RUNTIME_COUNT,
  D2_DRAINAGE_STORMWATER_CONTEXT_RUNTIME_IMPLEMENTED,
  D2_DRAINAGE_STORMWATER_RUNTIME_READY,
  D2_FLOOD_MODELLING_RUNTIME_COUNT,
  D2_FLOOD_ROUTING_RUNTIME_COUNT,
  D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT,
  D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT,
  D2_PIPE_SIZING_RUNTIME_COUNT,
  D2_R1_CIVIL_IDENTITY_REUSED,
  D2_R2_SPATIAL_SURFACE_CONTEXT_REUSED,
  D2_R3_GRADING_EARTHWORKS_CONTEXT_REUSED,
  D2_R4_ROADS_ACCESS_CONTEXT_REUSED,
  D2_R5_CANONICAL_NEXT_PHASE,
  D2_R5_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE,
  D2_R5_MATURITY,
  D2_R5_NEXT_PHASE_TYPE,
  D2_R5_STATUS,
  D2_R6_STARTED,
  D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT,
  D2_RUNOFF_CALCULATION_RUNTIME_COUNT,
  D2_RUNTIME_COUNT,
  D2_RUNTIME_STARTED,
  D3_D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  DRAINAGE_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  DRAINAGE_NETWORK_PRESENT_EQUALS_HYDRAULIC_MODEL_COMPLETE,
  DRAINAGE_RELATIONSHIP_EQUALS_AUTOMATIC_GRADING_CHANGE,
  DRAINAGE_RELATIONSHIP_EQUALS_AUTOMATIC_ROAD_CHANGE,
  NEW_DEPENDENCY_ADDED,
  SILENT_D2_DRAINAGE_MUTATION_ALLOWED,
  calculateChannelHydraulics,
  calculateHydraulics,
  calculateHydrology,
  calculateRunoff,
  createD2R5Store,
  modelFlood,
  mutateDrainage,
  optimizeDrainage,
  recordDrainageStormwaterContext,
  routeFlood,
  sizeCulvert,
  sizeDetention,
  sizePipe,
} from "./drainage-stormwater-context";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

describe("EOS-D2-R5 drainage and stormwater context", () => {
  it("records drainage context on exact R1 through R4 references without calculating flow", () => {
    expect(D2_R5_STATUS).toBe("DRAINAGE_AND_STORMWATER_CONTEXT_IMPLEMENTED");
    expect(D2_R5_MATURITY).toBe(D2_R5_STATUS);
    expect(D2_RUNTIME_STARTED).toBe(true);
    expect(D2_RUNTIME_COUNT).toBe(5);
    expect(R4_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D2_DRAINAGE_STORMWATER_RUNTIME_READY).toBe(true);
    expect(R4_DRAINAGE_READY).toBe(false);
    expect(D2_CIVIL_UTILITY_CORRIDOR_RUNTIME_READY).toBe(false);
    expect(D2_DRAINAGE_STORMWATER_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_DRAINAGE_STORMWATER_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D2_R1_CIVIL_IDENTITY_REUSED).toBe(true);
    expect(D2_R2_SPATIAL_SURFACE_CONTEXT_REUSED).toBe(true);
    expect(D2_R3_GRADING_EARTHWORKS_CONTEXT_REUSED).toBe(true);
    expect(D2_R4_ROADS_ACCESS_CONTEXT_REUSED).toBe(true);
    expect(CATCHMENT_CONTEXT_PRESENT_EQUALS_HYDROLOGY_CALCULATED).toBe(false);
    expect(DRAINAGE_NETWORK_PRESENT_EQUALS_HYDRAULIC_MODEL_COMPLETE).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_RAINFALL_CRITERIA).toBe(false);
    expect(AI_CAN_INVENT_AUTHORITATIVE_RUNOFF_CRITERIA).toBe(false);
    expect(DRAINAGE_RELATIONSHIP_EQUALS_AUTOMATIC_GRADING_CHANGE).toBe(false);
    expect(DRAINAGE_RELATIONSHIP_EQUALS_AUTOMATIC_ROAD_CHANGE).toBe(false);
    expect(D2_R5_CREATES_PARALLEL_ASSUMPTION_GOVERNANCE).toBe(false);
    expect(DRAINAGE_EVIDENCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D2_DRAINAGE_CONTEXT_AUTO_REPOINTED).toBe(false);
    expect(D2_DRAINAGE_PROVENANCE_REQUIRED).toBe(true);
    expect(D2_DRAINAGE_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(SILENT_D2_DRAINAGE_MUTATION_ALLOWED).toBe(false);
    expect(D2_DRAINAGE_HISTORY_PRESERVED).toBe(true);
    expect(D2_HYDROLOGY_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_RUNOFF_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_HYDRAULIC_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_PIPE_SIZING_RUNTIME_COUNT).toBe(0);
    expect(D2_CHANNEL_HYDRAULICS_RUNTIME_COUNT).toBe(0);
    expect(D2_CULVERT_SIZING_RUNTIME_COUNT).toBe(0);
    expect(D2_DETENTION_SIZING_RUNTIME_COUNT).toBe(0);
    expect(D2_FLOOD_MODELLING_RUNTIME_COUNT).toBe(0);
    expect(D2_FLOOD_ROUTING_RUNTIME_COUNT).toBe(0);
    expect(D2_DRAINAGE_OPTIMIZATION_RUNTIME_COUNT).toBe(0);
    expect(D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_APPROVAL_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_CERTIFICATION_RUNTIME_COUNT).toBe(0);
    expect(D2_R6_STARTED).toBe(false);
    expect(D2_R5_CANONICAL_NEXT_PHASE).toBe("EOS-D2-R6-CIVIL-UTILITY-AND-CORRIDOR-CONTEXT");
    expect(D2_R5_NEXT_PHASE_TYPE).toBe("CIVIL_UTILITY_AND_CORRIDOR_CONTEXT");
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D3_D9_RUNTIME_STARTED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);

    const r1 = createD2R1Store();
    const context = recordCivilContext(r1, actor, { contextId: "civil-context-1", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-context" });
    const coordinate = recordCivilObjectIdentity(r1, actor, { objectId: "crs-object", contextId: context.contextId, objectType: "COORDINATE_REFERENCE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-crs" });
    const surveyObject = recordCivilObjectIdentity(r1, actor, { objectId: "survey-object", contextId: context.contextId, objectType: "SURVEY_SOURCE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-survey-object" });
    const surfaceObject = recordCivilObjectIdentity(r1, actor, { objectId: "surface-object", contextId: context.contextId, objectType: "SURFACE_REFERENCE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-surface-object" });
    const gradingObject = recordCivilObjectIdentity(r1, actor, { objectId: "grading-object", contextId: context.contextId, objectType: "GRADING_ZONE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-grading-object" });
    const site = recordCivilObjectIdentity(r1, actor, { objectId: "site-object", contextId: context.contextId, objectType: "CIVIL_SITE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site" });
    const alignment = recordCivilObjectIdentity(r1, actor, { objectId: "alignment-object", contextId: context.contextId, objectType: "ROAD_ALIGNMENT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-alignment" });
    const profile = recordCivilObjectIdentity(r1, actor, { objectId: "profile-object", contextId: context.contextId, objectType: "ROAD_PROFILE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-profile" });
    const corridor = recordCivilObjectIdentity(r1, actor, { objectId: "corridor-object", contextId: context.contextId, objectType: "ROAD_CORRIDOR", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-corridor" });
    const pavement = recordCivilObjectIdentity(r1, actor, { objectId: "pavement-object", contextId: context.contextId, objectType: "PAVEMENT_CONTEXT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-pavement" });
    const catchment = recordCivilObjectIdentity(r1, actor, { objectId: "catchment-object", contextId: context.contextId, objectType: "DRAINAGE_CATCHMENT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-catchment" });
    const rainfall = recordCivilObjectIdentity(r1, actor, { objectId: "rainfall-object", contextId: context.contextId, objectType: "RAINFALL_REFERENCE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-rainfall" });
    const network = recordCivilObjectIdentity(r1, actor, { objectId: "network-object", contextId: context.contextId, objectType: "DRAINAGE_NETWORK", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-network" });
    const nodeA = recordCivilObjectIdentity(r1, actor, { objectId: "node-a", contextId: context.contextId, objectType: "DRAINAGE_NODE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-node-a" });
    const nodeB = recordCivilObjectIdentity(r1, actor, { objectId: "node-b", contextId: context.contextId, objectType: "DRAINAGE_NODE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-node-b" });
    const linkA = recordCivilObjectIdentity(r1, actor, { objectId: "link-a", contextId: context.contextId, objectType: "DRAINAGE_LINK", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-link-a" });
    const linkB = recordCivilObjectIdentity(r1, actor, { objectId: "link-b", contextId: context.contextId, objectType: "DRAINAGE_LINK", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-link-b" });
    const pit = recordCivilObjectIdentity(r1, actor, { objectId: "pit-object", contextId: context.contextId, objectType: "PIT", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-pit" });
    const manhole = recordCivilObjectIdentity(r1, actor, { objectId: "manhole-object", contextId: context.contextId, objectType: "MANHOLE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-manhole" });
    const channel = recordCivilObjectIdentity(r1, actor, { objectId: "channel-object", contextId: context.contextId, objectType: "CHANNEL", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-channel" });
    const culvert = recordCivilObjectIdentity(r1, actor, { objectId: "culvert-object", contextId: context.contextId, objectType: "CULVERT_REFERENCE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-culvert" });
    const outfall = recordCivilObjectIdentity(r1, actor, { objectId: "outfall-object", contextId: context.contextId, objectType: "STORMWATER_OUTFALL", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-outfall" });
    const detention = recordCivilObjectIdentity(r1, actor, { objectId: "detention-object", contextId: context.contextId, objectType: "DETENTION_REFERENCE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-detention" });
    const assumption = recordCivilObjectIdentity(r1, actor, { objectId: "assumption-object", contextId: context.contextId, objectType: "CIVIL_ASSUMPTION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-assumption" });
    const evidence = recordCivilObjectIdentity(r1, actor, { objectId: "evidence-object", contextId: context.contextId, objectType: "CIVIL_EVIDENCE_REFERENCE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-evidence" });
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
      corridorObjectId: corridor.objectId,
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
    const store = createD2R5Store(r4);
    const rainfallCriteria = [
      { kind: "RAINFALL_SOURCE" as const, suppliedValue: "cited BOM IFD", sourceRef: "rainfall-authority" },
      { kind: "DESIGN_EVENT" as const, suppliedValue: "cited 1 hour", sourceRef: "rainfall-authority" },
    ];
    const runoffCriteria = [{ kind: "RUNOFF_COEFFICIENT" as const, suppliedValue: "cited 0.70", sourceRef: "runoff-authority" }];
    const relationships = [
      { kind: "OBJECT_REFERENCE" as const, drainageRole: "LINK_TO_OUTFALL" as const, targetObjectId: outfall.objectId },
      { kind: "PARENT" as const, drainageRole: "CATCHMENT_TO_NETWORK" as const, targetObjectId: network.objectId },
      { kind: "OBJECT_REFERENCE" as const, drainageRole: "DRAINAGE_TO_GRADING" as const, targetObjectId: gradingObject.objectId },
    ];
    const shared = {
      contextId: context.contextId,
      catchmentObjectId: catchment.objectId,
      catchmentBoundaryReference: "boundary-ref-a",
      rainfallObjectId: rainfall.objectId,
      networkObjectId: network.objectId,
      nodeObjectIds: [nodeB.objectId, nodeA.objectId],
      linkObjectIds: [linkB.objectId, linkA.objectId],
      pitObjectIds: [pit.objectId],
      manholeObjectIds: [manhole.objectId],
      channelObjectId: channel.objectId,
      culvertObjectId: culvert.objectId,
      outfallObjectId: outfall.objectId,
      detentionObjectId: detention.objectId,
      pipeReference: "cited-pipe-ref",
      floodLevelReference: "cited-flood-level",
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      gradingContextId: grading.gradingContextId,
      roadsContextId: road.roadsContextId,
      rainfallCriteria,
      runoffCriteria,
      relationships,
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      standardsReference: "cited-drainage-standard",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-drainage",
      citedCurrentness: "CURRENT",
    };
    const gradingFingerprint = grading.fingerprint;
    const roadFingerprint = road.fingerprint;
    const recorded = recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-1" });
    expect(grading.fingerprint).toBe(gradingFingerprint);
    expect(road.fingerprint).toBe(roadFingerprint);
    expect(recorded.hydrologyCalculated).toBe(false);
    expect(recorded.runoffCalculated).toBe(false);
    expect(recorded.hydraulicModelComplete).toBe(false);
    expect(recorded.pipeSized).toBe(false);
    expect(recorded.channelHydraulicsCalculated).toBe(false);
    expect(recorded.culvertSized).toBe(false);
    expect(recorded.detentionSized).toBe(false);
    expect(recorded.floodModelled).toBe(false);
    expect(recorded.floodRouted).toBe(false);
    expect(recorded.drainageOptimized).toBe(false);
    expect(recorded.gradingChanged).toBe(false);
    expect(recorded.roadChanged).toBe(false);
    expect(recorded.engineeringValidated).toBe(false);
    expect(recorded.engineeringApproved).toBe(false);
    expect(recorded.nodeObjectIds).toEqual(["node-a", "node-b"]);
    expect(recorded.linkObjectIds).toEqual(["link-a", "link-b"]);
    expect(recorded.pitObjectIds).toEqual(["pit-object"]);
    expect(recorded.manholeObjectIds).toEqual(["manhole-object"]);
    expect(recorded.surfaceContextIds).toEqual(["surface-design", "surface-existing"]);
    const sortedRainfall = [
      { kind: "DESIGN_EVENT", suppliedValue: "cited 1 hour", sourceRef: "rainfall-authority" },
      { kind: "RAINFALL_SOURCE", suppliedValue: "cited BOM IFD", sourceRef: "rainfall-authority" },
    ];
    const sortedRelationships = [
      { kind: "PARENT", drainageRole: "CATCHMENT_TO_NETWORK", targetObjectId: network.objectId },
      { kind: "OBJECT_REFERENCE", drainageRole: "DRAINAGE_TO_GRADING", targetObjectId: gradingObject.objectId },
      { kind: "OBJECT_REFERENCE", drainageRole: "LINK_TO_OUTFALL", targetObjectId: outfall.objectId },
    ];
    expect(recorded.fingerprint).toBe(fingerprintCanonical({
      drainageContextId: "drainage-1",
      contextId: context.contextId,
      catchmentObjectId: catchment.objectId,
      catchmentBoundaryReference: "boundary-ref-a",
      rainfallObjectId: rainfall.objectId,
      networkObjectId: network.objectId,
      nodeObjectIds: ["node-a", "node-b"],
      linkObjectIds: ["link-a", "link-b"],
      pitObjectIds: ["pit-object"],
      manholeObjectIds: ["manhole-object"],
      channelObjectId: channel.objectId,
      culvertObjectId: culvert.objectId,
      outfallObjectId: outfall.objectId,
      detentionObjectId: detention.objectId,
      pipeReference: "cited-pipe-ref",
      floodLevelReference: "cited-flood-level",
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: ["surface-design", "surface-existing"],
      gradingContextId: grading.gradingContextId,
      roadsContextId: road.roadsContextId,
      rainfallCriteria: sortedRainfall,
      runoffCriteria,
      relationships: sortedRelationships,
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      standardsReference: "cited-drainage-standard",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-drainage",
      citedCurrentness: "CURRENT",
      authority: D2_CONTEXT_AUTHORITY,
      predecessorDrainageContextId: null,
    }));
    expect(recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-1" }).fingerprint).toBe(recorded.fingerprint);
    expect(store.history.filter((row) => row.action === "CREATED")).toHaveLength(1);
    const unbound = recordDrainageStormwaterContext(store, actor, {
      ...shared,
      drainageContextId: "drainage-unbound",
      gradingContextId: null,
      roadsContextId: null,
      channelObjectId: null,
      culvertObjectId: null,
      outfallObjectId: null,
      detentionObjectId: null,
      rainfallObjectId: null,
      pipeReference: null,
      floodLevelReference: null,
      pitObjectIds: [],
      manholeObjectIds: [],
      rainfallCriteria: [],
      runoffCriteria: [],
      relationships: [],
      provenanceRef: "prov-drainage-unbound",
    });
    expect(unbound.gradingContextId).toBeNull();
    expect(unbound.roadsContextId).toBeNull();
    expect(unbound.hydrologyCalculated).toBe(false);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-float", contextId: "latest" })).toThrow(/R1_CONTEXT_REQUIRED/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-missing-grade", gradingContextId: undefined as unknown as null })).toThrow(/R3_GRADING_REFERENCE_REQUIRED/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-float-road", roadsContextId: "latest" })).toThrow(/R4_ROADS_REQUIRED/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-rain", inventRainfallCriteria: true })).toThrow(/RAINFALL_CRITERIA_NOT_INVENTED/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-runoff", inventRunoffCriteria: true })).toThrow(/RUNOFF_CRITERIA_NOT_INVENTED/);
    expect(() => recordDrainageStormwaterContext(store, { ...actor, actorId: "AI_assistant" }, { ...shared, drainageContextId: "drainage-ai" })).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-scope", workspaceId: "workspace-b" })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-1", assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-type", catchmentObjectId: gradingObject.objectId })).toThrow(/CATCHMENT_OBJECT_REQUIRED/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-near", relationships: [{ kind: "PROXIMITY", drainageRole: "CATCHMENT_TO_NETWORK", targetObjectId: network.objectId }] })).toThrow(/RELATIONSHIP_KIND_NOT_EXPLICIT/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-infer", inferRelationship: true })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-hydro", hydrology: true })).toThrow(/HYDROLOGY_NOT_IN_R5/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-hydraulics", hydraulics: true })).toThrow(/HYDRAULICS_NOT_IN_R5/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-pipe", pipeSizing: true })).toThrow(/PIPE_SIZING_NOT_IN_R5/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-flood", floodModelling: true })).toThrow(/FLOOD_MODELLING_NOT_IN_R5/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-opt", drainageOptimization: true })).toThrow(/DRAINAGE_OPTIMIZATION_NOT_IN_R5/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-grade", changeGrading: true })).toThrow(/GRADING_CHANGE_NOT_IN_R5/);
    expect(() => recordDrainageStormwaterContext(store, actor, { ...shared, drainageContextId: "drainage-road", changeRoad: true })).toThrow(/ROAD_CHANGE_NOT_IN_R5/);

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
    const kept = store.drainage.find((row) => row.drainageContextId === recorded.drainageContextId);
    expect(kept?.surfaceContextIds).toEqual(["surface-design", "surface-existing"]);
    expect(kept?.gradingContextId).toBe("grading-1");
    expect(kept?.roadsContextId).toBe("road-1");
    expect(road.gradingContextId).toBe("grading-1");
    expect(road.fingerprint).toBe(roadFingerprint);
    const stale = recordDrainageStormwaterContext(store, actor, {
      ...shared,
      drainageContextId: "drainage-stale",
      gradingContextId: grading.gradingContextId,
      roadsContextId: road.roadsContextId,
      citedCurrentness: "STALE",
      provenanceRef: "prov-drainage-stale",
      predecessorDrainageContextId: recorded.drainageContextId,
    });
    expect(stale.citedCurrentness).toBe("STALE");
    expect(stale.gradingContextId).toBe("grading-1");
    expect(stale.roadsContextId).toBe("road-1");
    expect(stale.surfaceContextIds).toContain("surface-design");
    expect(store.drainage.find((row) => row.drainageContextId === "drainage-1")?.recordStatus).toBe("SUPERSEDED");
    expect(store.history.some((row) => row.action === "SUPERSEDED")).toBe(true);
    expect(() => calculateHydrology()).toThrow(/HYDROLOGY_NOT_IN_R5/);
    expect(() => calculateRunoff()).toThrow(/RUNOFF_CALCULATION_NOT_IN_R5/);
    expect(() => calculateHydraulics()).toThrow(/HYDRAULICS_NOT_IN_R5/);
    expect(() => sizePipe()).toThrow(/PIPE_SIZING_NOT_IN_R5/);
    expect(() => calculateChannelHydraulics()).toThrow(/CHANNEL_HYDRAULICS_NOT_IN_R5/);
    expect(() => sizeCulvert()).toThrow(/CULVERT_SIZING_NOT_IN_R5/);
    expect(() => sizeDetention()).toThrow(/DETENTION_SIZING_NOT_IN_R5/);
    expect(() => modelFlood()).toThrow(/FLOOD_MODELLING_NOT_IN_R5/);
    expect(() => routeFlood()).toThrow(/FLOOD_ROUTING_NOT_IN_R5/);
    expect(() => optimizeDrainage()).toThrow(/DRAINAGE_OPTIMIZATION_NOT_IN_R5/);
    expect(() => mutateDrainage()).toThrow(/DRAINAGE_MUTATION_REJECTED/);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "drainage-stormwater-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "drainage-stormwater-context.ts"), source)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R5.DRAINAGE_AND_STORMWATER_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R6.CIVIL_UTILITY_AND_CORRIDOR_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
