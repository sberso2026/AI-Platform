import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import {
  D2_CONTEXT_AUTHORITY,
  D2_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY as R1_SURVEY_READY,
  createD2R1Store,
  recordCivilContext,
  recordCivilObjectIdentity,
  type D2R1Actor,
} from "./identity-foundation";
import {
  D2_R2_CANONICAL_NEXT_PHASE,
  D2_R2_MATURITY,
  D2_R2_NEXT_PHASE_TYPE,
  D2_R2_STATUS,
  D2_R3_STARTED,
  D2_RUNTIME_COUNT,
  D2_SPATIAL_REFERENCE_RUNTIME_COUNT,
  D2_SURVEY_OBSERVATION_RUNTIME_COUNT,
  D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY,
  D2_SURFACE_INTERPOLATION_RUNTIME_COUNT,
  D2_TERRAIN_GENERATION_RUNTIME_COUNT,
  D3_D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EXISTING_SURFACE_EQUALS_AUTHORITATIVE_SURVEY,
  NEW_DEPENDENCY_ADDED,
  PROPOSED_SURFACE_EQUALS_APPROVED_GRADING_DESIGN,
  SURVEY_SOURCE_PRESENT_EQUALS_ENGINEERING_VALIDATED,
  SURFACE_CONTEXT_PRESENT_EQUALS_TERRAIN_GENERATED,
  UNKNOWN_CRS_AUTO_INFERRED,
  createD2R2Store,
  generateTerrain,
  interpolateSurface,
  mutateSpatialSurfaceContext,
  recordSpatialReference,
  recordSurveySourceContext,
  recordSurfaceContext,
} from "./spatial-surface-context";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

describe("EOS-D2-R2 survey spatial and surface context", () => {
  it("binds survey and surface context to exact R1 identity", () => {
    expect(D2_R2_STATUS).toBe("SURVEY_SPATIAL_AND_SURFACE_CONTEXT_IMPLEMENTED");
    expect(D2_R2_MATURITY).toBe(D2_R2_STATUS);
    expect(D2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY).toBe(true);
    expect(R1_SURVEY_READY).toBe(false);
    expect(D2_SPATIAL_REFERENCE_RUNTIME_COUNT).toBe(1);
    expect(D2_SURVEY_OBSERVATION_RUNTIME_COUNT).toBe(0);
    expect(D2_TERRAIN_GENERATION_RUNTIME_COUNT).toBe(0);
    expect(D2_SURFACE_INTERPOLATION_RUNTIME_COUNT).toBe(0);
    expect(UNKNOWN_CRS_AUTO_INFERRED).toBe(false);
    expect(SURVEY_SOURCE_PRESENT_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(SURFACE_CONTEXT_PRESENT_EQUALS_TERRAIN_GENERATED).toBe(false);
    expect(EXISTING_SURFACE_EQUALS_AUTHORITATIVE_SURVEY).toBe(false);
    expect(PROPOSED_SURFACE_EQUALS_APPROVED_GRADING_DESIGN).toBe(false);
    expect(D2_R3_STARTED).toBe(false);
    expect(D2_R2_CANONICAL_NEXT_PHASE).toBe("EOS-D2-R3-GRADING-AND-EARTHWORKS-CONTEXT");
    expect(D2_R2_NEXT_PHASE_TYPE).toBe("GRADING_AND_EARTHWORKS_CONTEXT");
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D3_D9_RUNTIME_STARTED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);

    const r1 = createD2R1Store();
    const context = recordCivilContext(r1, actor, {
      contextId: "civil-context-1",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-context",
    });
    const coordinate = recordCivilObjectIdentity(r1, actor, {
      objectId: "crs-object",
      contextId: context.contextId,
      objectType: "COORDINATE_REFERENCE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-crs-object",
    });
    const surveyObject = recordCivilObjectIdentity(r1, actor, {
      objectId: "survey-object",
      contextId: context.contextId,
      objectType: "SURVEY_SOURCE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-survey-object",
    });
    const surfaceObject = recordCivilObjectIdentity(r1, actor, {
      objectId: "surface-object",
      contextId: context.contextId,
      objectType: "SURFACE_REFERENCE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-surface-object",
    });
    const store = createD2R2Store(r1);
    const spatial = recordSpatialReference(store, actor, {
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
    expect(spatial.civilEngineeringAuthority).toBe(false);
    expect(spatial.engineeringValidated).toBe(false);
    expect(spatial.fingerprint).toBe(fingerprintCanonical({
      spatialReferenceId: "spatial-1",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "EPSG:7844",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      coordinateUnit: null,
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
      authority: D2_CONTEXT_AUTHORITY,
      predecessorSpatialReferenceId: null,
    }));
    expect(recordSpatialReference(store, actor, {
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
    }).fingerprint).toBe(spatial.fingerprint);
    expect(store.history.filter((row) => row.subjectKind === "SPATIAL" && row.action === "CREATED")).toHaveLength(1);
    expect(() => recordSpatialReference(store, actor, {
      spatialReferenceId: "spatial-2",
      contextId: "latest",
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "EPSG:7844",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_CONTEXT_REQUIRED/);
    expect(() => recordSpatialReference(store, actor, {
      spatialReferenceId: "spatial-3",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      coordinateReferenceSystemId: "EPSG:7844",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_OBJECT_TYPE_MISMATCH/);
    expect(() => recordSpatialReference(store, actor, {
      spatialReferenceId: "spatial-4",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "EPSG:7844",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
      inferCrs: true,
    })).toThrow(/CRS_NOT_INFERRED/);
    expect(() => recordSpatialReference(store, actor, {
      spatialReferenceId: "spatial-5",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
    })).toThrow(/CRS_REQUIRED/);
    expect(() => recordSpatialReference(store, { ...actor, actorId: "AI_assistant" }, {
      spatialReferenceId: "spatial-6",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "EPSG:7844",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
    })).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordSpatialReference(store, actor, {
      spatialReferenceId: "spatial-7",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "EPSG:7844",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-a",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial",
      citedCurrentness: "CURRENT",
      workspaceId: "workspace-b",
    })).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordSpatialReference(store, actor, {
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
      assertedFingerprint: "spoofed",
    })).toThrow(/FINGERPRINT_MISMATCH/);

    const survey = recordSurveySourceContext(store, actor, {
      surveySourceId: "survey-1",
      contextId: context.contextId,
      objectId: surveyObject.objectId,
      spatialReferenceId: spatial.spatialReferenceId,
      sourceType: "CONTROL_SURVEY",
      sourceRevision: "rev-a",
      surveyDate: "2026-01-15",
      sourceOrganization: "licensed-surveyor",
      provenanceRef: "prov-survey",
      citedCurrentness: "CURRENT",
    });
    expect(survey.engineeringValidated).toBe(false);
    expect(survey).not.toHaveProperty("observations");
    expect(() => recordSurveySourceContext(store, actor, {
      surveySourceId: "survey-2",
      contextId: context.contextId,
      objectId: surveyObject.objectId,
      spatialReferenceId: spatial.spatialReferenceId,
      sourceType: "CONTROL_SURVEY",
      sourceRevision: "rev-b",
      provenanceRef: "prov-survey-b",
      citedCurrentness: "CURRENT",
      observations: [{ easting: 1 }],
    })).toThrow(/SURVEY_OBSERVATION_NOT_IN_R2/);

    const surface = recordSurfaceContext(store, actor, {
      surfaceContextId: "surface-1",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "EXISTING_SURFACE",
      spatialReferenceId: spatial.spatialReferenceId,
      surveySourceId: survey.surveySourceId,
      sourceReference: "survey-1",
      revision: "s-rev-a",
      provenanceRef: "prov-surface",
      citedCurrentness: "CURRENT",
    });
    expect(surface.terrainGenerated).toBe(false);
    expect(surface.engineeringApproved).toBe(false);
    expect(() => recordSurfaceContext(store, actor, {
      surfaceContextId: "surface-2",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "APPROVED_GRADING",
      spatialReferenceId: spatial.spatialReferenceId,
      sourceReference: "design",
      revision: "s-rev-b",
      provenanceRef: "prov-surface-b",
      citedCurrentness: "CURRENT",
    })).toThrow(/SURFACE_ROLE_INVALID/);
    const design = recordSurfaceContext(store, actor, {
      surfaceContextId: "surface-design",
      contextId: context.contextId,
      objectId: surfaceObject.objectId,
      surfaceRole: "DESIGN_SURFACE",
      spatialReferenceId: spatial.spatialReferenceId,
      sourceReference: "design-reference",
      revision: "d-rev-a",
      provenanceRef: "prov-design-surface",
      citedCurrentness: "CURRENT",
    });
    expect(design.surfaceRole).toBe("DESIGN_SURFACE");
    expect(design.surveySourceId).toBeNull();

    const replacement = recordSpatialReference(store, actor, {
      spatialReferenceId: "spatial-1b",
      contextId: context.contextId,
      objectId: coordinate.objectId,
      coordinateReferenceSystemId: "EPSG:7850",
      horizontalDatum: "GDA2020",
      verticalDatum: "AHD",
      projectCoordinateContext: "project-local-b",
      sourceAuthorityRef: "survey-authority",
      provenanceRef: "prov-spatial-b",
      citedCurrentness: "CURRENT",
      predecessorSpatialReferenceId: spatial.spatialReferenceId,
    });
    expect(replacement.predecessorSpatialReferenceId).toBe(spatial.spatialReferenceId);
    expect(store.spatial.find((row) => row.spatialReferenceId === spatial.spatialReferenceId)?.citedCurrentness).toBe("SUPERSEDED");
    expect(store.surfaces.find((row) => row.surfaceContextId === surface.surfaceContextId)?.spatialReferenceId).toBe(spatial.spatialReferenceId);
    expect(store.surveys.find((row) => row.surveySourceId === survey.surveySourceId)?.spatialReferenceId).toBe(spatial.spatialReferenceId);
    const stale = recordSurveySourceContext(store, actor, {
      surveySourceId: "survey-stale",
      contextId: context.contextId,
      objectId: surveyObject.objectId,
      spatialReferenceId: replacement.spatialReferenceId,
      sourceType: "CONTROL_SURVEY",
      sourceRevision: "rev-c",
      provenanceRef: "prov-survey-stale",
      citedCurrentness: "STALE",
      predecessorSurveySourceId: survey.surveySourceId,
    });
    expect(stale.citedCurrentness).toBe("STALE");
    expect(() => generateTerrain()).toThrow(/TERRAIN_NOT_IN_R2/);
    expect(() => interpolateSurface()).toThrow(/INTERPOLATION_NOT_IN_R2/);
    expect(() => mutateSpatialSurfaceContext()).toThrow(/SPATIAL_SURFACE_MUTATION_REJECTED/);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "spatial-surface-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "spatial-surface-context.ts"), source)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R2.SURVEY_SPATIAL_AND_SURFACE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R3.GRADING_AND_EARTHWORKS_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
