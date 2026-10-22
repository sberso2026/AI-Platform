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
  D2_GRADING_EARTHWORKS_RUNTIME_READY as R1_GRADING_READY,
  D2_RUNTIME_COUNT as R1_RUNTIME_COUNT,
  createD2R1Store,
  recordCivilContext,
  recordCivilObjectIdentity,
  type D2R1Actor,
} from "./identity-foundation";
import {
  D2_GRADING_EARTHWORKS_RUNTIME_READY as R2_GRADING_READY,
  D2_RUNTIME_COUNT as R2_RUNTIME_COUNT,
  createD2R2Store,
  recordSpatialReference,
  recordSurfaceContext,
  recordSurveySourceContext,
} from "./spatial-surface-context";
import {
  D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT,
  D2_CUT_FILL_QUANTITY_RUNTIME_COUNT,
  D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT,
  D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY,
  D2_GEOTECHNICAL_MATERIAL_VALIDATION_RUNTIME_COUNT,
  D2_GEOTECHNICAL_SLOPE_STABILITY_RUNTIME_COUNT,
  D2_GRADING_CONTEXT_RUNTIME_COUNT,
  D2_GRADING_EARTHWORKS_RUNTIME_READY,
  D2_R3_CANONICAL_NEXT_PHASE,
  D2_R3_MATURITY,
  D2_R3_NEXT_PHASE_TYPE,
  D2_R3_STATUS,
  D2_R4_STARTED,
  D2_RUNTIME_COUNT,
  D3_D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  EARTHWORKS_CONTEXT_PRESENT_EQUALS_QUANTITY_VALIDATED,
  GRADING_CONTEXT_PRESENT_EQUALS_ENGINEERING_APPROVED,
  LEVEL_CRITERIA_PRESENT_EQUALS_GRADING_DESIGN_COMPLETE,
  NEW_DEPENDENCY_ADDED,
  SLOPE_CRITERIA_PRESENT_EQUALS_SLOPE_STABILITY_VALIDATED,
  calculateCutFill,
  createD2R3Store,
  designGrading,
  mutateGradingEarthworks,
  recordEarthworksContext,
  recordGradingContext,
  validateSlopeStability,
} from "./grading-earthworks-context";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

describe("EOS-D2-R3 grading and earthworks context", () => {
  it("records grading and earthworks context on exact R1 and R2 references", () => {
    expect(D2_R3_STATUS).toBe("GRADING_AND_EARTHWORKS_CONTEXT_IMPLEMENTED");
    expect(D2_R3_MATURITY).toBe(D2_R3_STATUS);
    expect(D2_RUNTIME_COUNT).toBe(3);
    expect(R2_RUNTIME_COUNT).toBe(2);
    expect(R1_RUNTIME_COUNT).toBe(1);
    expect(D2_GRADING_EARTHWORKS_RUNTIME_READY).toBe(true);
    expect(R2_GRADING_READY).toBe(false);
    expect(R1_GRADING_READY).toBe(false);
    expect(D2_GRADING_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(LEVEL_CRITERIA_PRESENT_EQUALS_GRADING_DESIGN_COMPLETE).toBe(false);
    expect(SLOPE_CRITERIA_PRESENT_EQUALS_SLOPE_STABILITY_VALIDATED).toBe(false);
    expect(GRADING_CONTEXT_PRESENT_EQUALS_ENGINEERING_APPROVED).toBe(false);
    expect(EARTHWORKS_CONTEXT_PRESENT_EQUALS_QUANTITY_VALIDATED).toBe(false);
    expect(D2_EQUALS_D3_GEOTECHNICAL_AUTHORITY).toBe(false);
    expect(D2_GEOTECHNICAL_SLOPE_STABILITY_RUNTIME_COUNT).toBe(0);
    expect(D2_GEOTECHNICAL_MATERIAL_VALIDATION_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_GRADING_DESIGN_RUNTIME_COUNT).toBe(0);
    expect(D2_CUT_FILL_QUANTITY_RUNTIME_COUNT).toBe(0);
    expect(D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_R4_STARTED).toBe(false);
    expect(D2_R3_CANONICAL_NEXT_PHASE).toBe("EOS-D2-R4-ROADS-AND-ACCESS-CONTEXT");
    expect(D2_R3_NEXT_PHASE_TYPE).toBe("ROADS_AND_ACCESS_CONTEXT");
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
    const earthworksObject = recordCivilObjectIdentity(r1, actor, { objectId: "earthworks-object", contextId: context.contextId, objectType: "EARTHWORKS_ZONE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-earthworks-object" });
    const assumption = recordCivilObjectIdentity(r1, actor, { objectId: "assumption-object", contextId: context.contextId, objectType: "CIVIL_ASSUMPTION", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-assumption" });
    const evidence = recordCivilObjectIdentity(r1, actor, { objectId: "evidence-object", contextId: context.contextId, objectType: "CIVIL_EVIDENCE_REFERENCE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-evidence" });
    const boundary = recordCivilObjectIdentity(r1, actor, { objectId: "site-boundary", contextId: context.contextId, objectType: "CIVIL_SITE", citedLifecycleStage: "CONCEPT", provenanceRef: "prov-site" });
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
    const store = createD2R3Store(r2);
    const criteria = [
      { kind: "MAXIMUM_SLOPE", suppliedValue: "1:4", sourceRef: "criteria-source" },
      { kind: "TARGET_FINISHED_LEVEL", suppliedValue: "RL 12.50", sourceRef: "criteria-source" },
    ];
    const grading = recordGradingContext(store, actor, {
      gradingContextId: "grading-1",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      criteria,
      relationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: boundary.objectId }],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
    });
    expect(grading.gradingDesignComplete).toBe(false);
    expect(grading.engineeringApproved).toBe(false);
    expect(grading.slopeStabilityValidated).toBe(false);
    expect(grading.engineeringValidated).toBe(false);
    expect(grading.surfaceContextIds).toEqual(["surface-design", "surface-existing"]);
    expect(grading.fingerprint).toBe(fingerprintCanonical({
      gradingContextId: "grading-1",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: ["surface-design", "surface-existing"],
      criteria: [
        { kind: "MAXIMUM_SLOPE", suppliedValue: "1:4", sourceRef: "criteria-source" },
        { kind: "TARGET_FINISHED_LEVEL", suppliedValue: "RL 12.50", sourceRef: "criteria-source" },
      ],
      relationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: boundary.objectId }],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
      authority: D2_CONTEXT_AUTHORITY,
      predecessorGradingContextId: null,
    }));
    expect(recordGradingContext(store, actor, {
      gradingContextId: "grading-1",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [design.surfaceContextId, existing.surfaceContextId],
      criteria,
      relationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: boundary.objectId }],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
    }).fingerprint).toBe(grading.fingerprint);
    expect(store.history.filter((row) => row.subjectKind === "GRADING" && row.action === "CREATED")).toHaveLength(1);
    expect(() => recordGradingContext(store, actor, {
      gradingContextId: "grading-floating",
      contextId: "latest",
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      criteria,
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
    })).toThrow(/R1_CONTEXT_REQUIRED/);
    expect(() => recordGradingContext(store, actor, {
      gradingContextId: "grading-float-surface",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: ["latest"],
      criteria,
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
    })).toThrow(/R2_SURFACE_REQUIRED/);
    expect(() => recordGradingContext(store, actor, {
      gradingContextId: "grading-invented",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      criteria,
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
      inventCriteria: true,
    })).toThrow(/CRITERIA_NOT_INVENTED/);
    expect(() => recordGradingContext(store, actor, {
      gradingContextId: "grading-text",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      criteria,
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
      assumptionText: "the pad is flat",
    })).toThrow(/CRITERIA_NOT_INVENTED/);
    expect(() => recordGradingContext(store, { ...actor, actorId: "AI_assistant" }, {
      gradingContextId: "grading-ai",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      criteria,
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
    })).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordGradingContext(store, actor, {
      gradingContextId: "grading-scope",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      criteria,
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
      projectId: "project-b",
    })).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordGradingContext(store, actor, {
      gradingContextId: "grading-1",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      criteria,
      relationships: [{ kind: "OBJECT_REFERENCE", targetObjectId: boundary.objectId }],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading",
      citedCurrentness: "CURRENT",
      assertedFingerprint: "spoofed",
    })).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordGradingContext(store, actor, {
      gradingContextId: "grading-volume",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      criteria: [{ kind: "TARGET_FINISHED_LEVEL", suppliedValue: "RL 1", sourceRef: "criteria-source" }],
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-volume",
      citedCurrentness: "CURRENT",
      cutVolume: 10,
    })).toThrow(/CUT_FILL_NOT_IN_R3/);

    const earthworks = recordEarthworksContext(store, actor, {
      earthworksContextId: "earthworks-1",
      gradingContextId: grading.gradingContextId,
      contextId: context.contextId,
      objectId: earthworksObject.objectId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      earthworksKind: "FILL",
      suppliedCitations: [{ kind: "FILL_CLASSIFICATION", suppliedValue: "cited-class", sourceRef: "external-geotech" }],
      assumptionObjectIds: [assumption.objectId],
      evidenceObjectIds: [evidence.objectId],
      provenanceRef: "prov-earthworks",
      citedCurrentness: "CURRENT",
    });
    expect(earthworks.quantityValidated).toBe(false);
    expect(earthworks.materialValidated).toBe(false);
    expect(earthworks.geotechnicalAuthority).toBe(false);
    expect(earthworks.cutFillCalculated).toBe(false);
    expect(earthworks.engineeringValidated).toBe(false);
    expect(() => recordEarthworksContext(store, actor, {
      earthworksContextId: "earthworks-stability",
      gradingContextId: grading.gradingContextId,
      contextId: context.contextId,
      objectId: earthworksObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      earthworksKind: "EXCAVATION",
      suppliedCitations: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      provenanceRef: "prov-stability",
      citedCurrentness: "CURRENT",
      slopeStability: true,
    })).toThrow(/SLOPE_STABILITY_NOT_IN_R3/);
    expect(() => recordEarthworksContext(store, actor, {
      earthworksContextId: "earthworks-geo",
      gradingContextId: grading.gradingContextId,
      contextId: context.contextId,
      objectId: earthworksObject.objectId,
      surfaceContextIds: [existing.surfaceContextId],
      earthworksKind: "FILL",
      suppliedCitations: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      provenanceRef: "prov-geo",
      citedCurrentness: "CURRENT",
      determineGeotechnical: true,
    })).toThrow(/GEOTECHNICAL_AUTHORITY_NOT_IN_R3/);

    const replacement = recordSurfaceContext(r2, actor, {
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
    expect(replacement.surfaceContextId).toBe("surface-design-b");
    expect(store.grading.find((row) => row.gradingContextId === grading.gradingContextId)?.surfaceContextIds).toEqual(["surface-design", "surface-existing"]);
    expect(store.earthworks.find((row) => row.earthworksContextId === earthworks.earthworksContextId)?.gradingContextId).toBe(grading.gradingContextId);
    const stale = recordGradingContext(store, actor, {
      gradingContextId: "grading-stale",
      contextId: context.contextId,
      objectId: gradingObject.objectId,
      surfaceContextIds: [existing.surfaceContextId, design.surfaceContextId],
      criteria: [{ kind: "GRADING_CONSTRAINT", suppliedValue: "hold existing", sourceRef: "criteria-source" }],
      relationships: [],
      assumptionObjectIds: [],
      evidenceObjectIds: [],
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grading-stale",
      citedCurrentness: "STALE",
      predecessorGradingContextId: grading.gradingContextId,
    });
    expect(stale.citedCurrentness).toBe("STALE");
    expect(store.earthworks.find((row) => row.earthworksContextId === earthworks.earthworksContextId)?.gradingContextId).toBe("grading-1");
    expect(() => designGrading()).toThrow(/AUTOMATIC_GRADING_NOT_IN_R3/);
    expect(() => calculateCutFill()).toThrow(/CUT_FILL_NOT_IN_R3/);
    expect(() => validateSlopeStability()).toThrow(/SLOPE_STABILITY_NOT_IN_R3/);
    expect(() => mutateGradingEarthworks()).toThrow(/GRADING_EARTHWORKS_MUTATION_REJECTED/);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "grading-earthworks-context.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "grading-earthworks-context.ts"), source)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R3.GRADING_AND_EARTHWORKS_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R4.ROADS_AND_ACCESS_CONTEXT")?.implementationState).toBe("NOT_IMPLEMENTED");
  });
});
