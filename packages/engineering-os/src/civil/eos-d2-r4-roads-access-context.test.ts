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
  D2_ROADS_ACCESS_RUNTIME_READY as R1_ROADS_READY,
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
  D2_ROADS_ACCESS_RUNTIME_READY as R3_ROADS_READY,
  D2_RUNTIME_COUNT as R3_RUNTIME_COUNT,
  createD2R3Store,
  recordGradingContext,
} from "./grading-earthworks-context";
import {
  ALIGNMENT_CONTEXT_PRESENT_EQUALS_ALIGNMENT_GENERATED,
  CORRIDOR_CONTEXT_PRESENT_EQUALS_CORRIDOR_MODEL_GENERATED,
  D2_ALIGNMENT_GENERATION_RUNTIME_COUNT,
  D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D2_PAVEMENT_ENGINEERING_CALCULATION_RUNTIME_COUNT,
  D2_PROFILE_DESIGN_RUNTIME_COUNT,
  D2_R4_CANONICAL_NEXT_PHASE,
  D2_R4_MATURITY,
  D2_R4_NEXT_PHASE_TYPE,
  D2_R4_STATUS,
  D2_R5_STARTED,
  D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT,
  D2_ROADS_ACCESS_CONTEXT_RUNTIME_COUNT,
  D2_ROADS_ACCESS_RUNTIME_READY,
  D2_RUNTIME_COUNT,
  D3_D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  INFERRED_ROAD_ENGINEERING_RELATIONSHIPS_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  PROFILE_CONTEXT_PRESENT_EQUALS_VERTICAL_DESIGN_COMPLETE,
  ROAD_CONTEXT_PRESENT_EQUALS_ENGINEERING_APPROVED,
  ROAD_CONTEXT_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  ROAD_CRITERIA_PRESENT_EQUALS_ROAD_DESIGN_COMPLETE,
  calculatePavement,
  createD2R4Store,
  designProfile,
  generateAlignment,
  generateCorridor,
  mutateRoadsAccess,
  optimizeAlignment,
  recordRoadsAccessContext,
} from "./roads-access-context";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

describe("EOS-D2-R4 roads and access context", () => {
  it("records road context on exact R1, R2, and R3 references", () => {
    expect(D2_R4_STATUS).toBe("ROADS_AND_ACCESS_CONTEXT_IMPLEMENTED");
    expect(D2_R4_MATURITY).toBe(D2_R4_STATUS);
    expect(D2_RUNTIME_COUNT).toBe(4);
    expect(R3_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D2_ROADS_ACCESS_RUNTIME_READY).toBe(true);
    expect(R3_ROADS_READY).toBe(false);
    expect(R1_ROADS_READY).toBe(false);
    expect(D2_ROADS_ACCESS_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(ROAD_CRITERIA_PRESENT_EQUALS_ROAD_DESIGN_COMPLETE).toBe(false);
    expect(ROAD_CONTEXT_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(ROAD_CONTEXT_PRESENT_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(ALIGNMENT_CONTEXT_PRESENT_EQUALS_ALIGNMENT_GENERATED).toBe(false);
    expect(PROFILE_CONTEXT_PRESENT_EQUALS_VERTICAL_DESIGN_COMPLETE).toBe(false);
    expect(CORRIDOR_CONTEXT_PRESENT_EQUALS_CORRIDOR_MODEL_GENERATED).toBe(false);
    expect(D2_PAVEMENT_ENGINEERING_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(INFERRED_ROAD_ENGINEERING_RELATIONSHIPS_ALLOWED).toBe(false);
    expect(D2_ROAD_GEOMETRIC_DESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_ALIGNMENT_GENERATION_RUNTIME_COUNT).toBe(0);
    expect(D2_PROFILE_DESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_R5_STARTED).toBe(false);
    expect(D2_R4_CANONICAL_NEXT_PHASE).toBe("EOS-D2-R5-DRAINAGE-AND-STORMWATER-CONTEXT");
    expect(D2_R4_NEXT_PHASE_TYPE).toBe("DRAINAGE_AND_STORMWATER_CONTEXT");
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
    const store = createD2R4Store(r3);
    const criteria = [
      { kind: "DESIGN_SPEED", suppliedValue: "60 km/h", sourceRef: "road-authority" },
      { kind: "LANE_WIDTH", suppliedValue: "3.5 m", sourceRef: "road-authority" },
    ];
    const shared = {
      contextId: context.contextId,
      alignmentObjectId: alignment.objectId,
      profileObjectId: profile.objectId,
      corridorObjectId: corridor.objectId,
      pavementObjectId: pavement.objectId,
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      criteria,
      accessRelationships: [{ kind: "OBJECT_REFERENCE" as const, accessRole: "ROAD_TO_SITE" as const, targetObjectId: site.objectId }],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      pavementTypeReference: "cited-flexible",
      subgradeReference: "cited-subgrade",
      trafficCriterionReference: "cited-traffic",
      standardsReference: "cited-standard",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-road",
      citedCurrentness: "CURRENT",
    };
    const road = recordRoadsAccessContext(store, actor, {
      ...shared,
      roadsContextId: "road-1",
      gradingContextId: grading.gradingContextId,
    });
    expect(road.roadDesignComplete).toBe(false);
    expect(road.alignmentGenerated).toBe(false);
    expect(road.profileDesignComplete).toBe(false);
    expect(road.corridorModelGenerated).toBe(false);
    expect(road.pavementCalculated).toBe(false);
    expect(road.subgradeDetermined).toBe(false);
    expect(road.geotechnicalAuthority).toBe(false);
    expect(road.engineeringValidated).toBe(false);
    expect(road.engineeringApproved).toBe(false);
    expect(road.surfaceContextIds).toEqual(["surface-design", "surface-existing"]);
    expect(road.fingerprint).toBe(fingerprintCanonical({
      roadsContextId: "road-1",
      contextId: context.contextId,
      alignmentObjectId: alignment.objectId,
      profileObjectId: profile.objectId,
      corridorObjectId: corridor.objectId,
      pavementObjectId: pavement.objectId,
      spatialReferenceId: spatial.spatialReferenceId,
      surfaceContextIds: ["surface-design", "surface-existing"],
      gradingContextId: grading.gradingContextId,
      criteria,
      accessRelationships: [{ kind: "OBJECT_REFERENCE", accessRole: "ROAD_TO_SITE", targetObjectId: site.objectId }],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      pavementTypeReference: "cited-flexible",
      subgradeReference: "cited-subgrade",
      trafficCriterionReference: "cited-traffic",
      standardsReference: "cited-standard",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-road",
      citedCurrentness: "CURRENT",
      authority: D2_CONTEXT_AUTHORITY,
      predecessorRoadsContextId: null,
    }));
    expect(recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-1", gradingContextId: grading.gradingContextId }).fingerprint).toBe(road.fingerprint);
    expect(store.history.filter((row) => row.action === "CREATED")).toHaveLength(1);
    const ungraded = recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-ungraded", gradingContextId: null, provenanceRef: "prov-road-ungraded" });
    expect(ungraded.gradingContextId).toBeNull();
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-float", gradingContextId: grading.gradingContextId, contextId: "latest" })).toThrow(/R1_CONTEXT_REQUIRED/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-float-grade", gradingContextId: "latest" })).toThrow(/R3_GRADING_REQUIRED/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-invent", gradingContextId: grading.gradingContextId, inventCriteria: true })).toThrow(/CRITERIA_NOT_INVENTED/);
    expect(() => recordRoadsAccessContext(store, { ...actor, actorId: "AI_assistant" }, { ...shared, roadsContextId: "road-ai", gradingContextId: grading.gradingContextId })).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-scope", gradingContextId: grading.gradingContextId, workspaceId: "workspace-b" })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-1", gradingContextId: grading.gradingContextId, assertedFingerprint: "spoofed" })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-type", gradingContextId: grading.gradingContextId, alignmentObjectId: gradingObject.objectId })).toThrow(/ALIGNMENT_OBJECT_REQUIRED/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-near", gradingContextId: grading.gradingContextId, accessRelationships: [{ kind: "PROXIMITY", accessRole: "ROAD_TO_SITE", targetObjectId: site.objectId }] })).toThrow(/RELATIONSHIP_KIND_NOT_EXPLICIT/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-infer", gradingContextId: grading.gradingContextId, inferRelationship: true })).toThrow(/INFERRED_RELATIONSHIP_REJECTED/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-pave", gradingContextId: grading.gradingContextId, pavementCalculation: true })).toThrow(/PAVEMENT_CALCULATION_NOT_IN_R4/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-sub", gradingContextId: grading.gradingContextId, determineSubgrade: true })).toThrow(/GEOTECHNICAL_AUTHORITY_NOT_IN_R4/);
    expect(() => recordRoadsAccessContext(store, actor, { ...shared, roadsContextId: "road-geom", gradingContextId: grading.gradingContextId, designGeometry: true })).toThrow(/ROAD_GEOMETRY_NOT_IN_R4/);

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
    const kept = store.roads.find((row) => row.roadsContextId === road.roadsContextId);
    expect(kept?.surfaceContextIds).toEqual(["surface-design", "surface-existing"]);
    expect(kept?.gradingContextId).toBe("grading-1");
    expect(kept?.spatialReferenceId).toBe(spatial.spatialReferenceId);
    const stale = recordRoadsAccessContext(store, actor, {
      ...shared,
      roadsContextId: "road-stale",
      gradingContextId: grading.gradingContextId,
      citedCurrentness: "STALE",
      provenanceRef: "prov-road-stale",
      predecessorRoadsContextId: road.roadsContextId,
    });
    expect(stale.citedCurrentness).toBe("STALE");
    expect(stale.surfaceContextIds).toContain("surface-design");
    expect(() => generateAlignment()).toThrow(/ALIGNMENT_NOT_GENERATED/);
    expect(() => optimizeAlignment()).toThrow(/ALIGNMENT_OPTIMIZATION_NOT_IN_R4/);
    expect(() => designProfile()).toThrow(/PROFILE_DESIGN_NOT_IN_R4/);
    expect(() => generateCorridor()).toThrow(/CORRIDOR_NOT_GENERATED/);
    expect(() => calculatePavement()).toThrow(/PAVEMENT_CALCULATION_NOT_IN_R4/);
    expect(() => mutateRoadsAccess()).toThrow(/ROADS_ACCESS_MUTATION_REJECTED/);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "roads-access-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "roads-access-context.ts"), source)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R4.ROADS_AND_ACCESS_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R5.DRAINAGE_AND_STORMWATER_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
