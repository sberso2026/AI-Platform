import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { D2_CIVIL_OBJECT_TYPES, D2_MATURITY_STATES, D2_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT, D2_RUNTIME_STARTED as ARCHITECTURE_RUNTIME_STARTED } from "@rtb/types";
import { describe, expect, it } from "vitest";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { D1N_TRACK_COMPLETE, D1N_TRACK_STATUS } from "../structural-systems/orchestration-closeout";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  D2_AUTOMATIC_MATURITY_PROGRESSION_RUNTIME_COUNT,
  D2_CIVIL_CONTEXT_RUNTIME_COUNT,
  D2_CIVIL_CONTEXT_RUNTIME_IMPLEMENTED,
  D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY,
  D2_CIVIL_OBJECT_IDENTITY_RUNTIME_IMPLEMENTED,
  D2_CIVIL_OBJECT_TYPE_ALLOWLIST_IMPLEMENTED,
  D2_CONTEXT_AUTHORITY,
  D2_DISCIPLINE,
  D2_DRAINAGE_RUNTIME_COUNT,
  D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT,
  D2_R1_CANONICAL_NEXT_PHASE,
  D2_R1_CANONICAL_NEXT_PHASE_SCOPE,
  D2_R1_MATURITY,
  D2_R1_NEXT_PHASE_TYPE,
  D2_R1_STATUS,
  D2_R2_STARTED,
  D2_RUNTIME_COUNT,
  D2_RUNTIME_STARTED,
  D2_SURFACE_RUNTIME_COUNT,
  D2_SURVEY_OBSERVATION_RUNTIME_COUNT,
  D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY,
  D3_D9_RUNTIME_STARTED,
  ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY,
  DATABASE_SCHEMA_CHANGED,
  FREEFORM_AUTHORITATIVE_CIVIL_OBJECT_TYPE_ALLOWED,
  INFERRED_CIVIL_ENGINEERING_RELATIONSHIPS_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  UNKNOWN_CIVIL_OBJECT_TYPE_AUTO_ACCEPTED,
  advanceCivilMaturity,
  createD2R1Store,
  mutateCivilContext,
  recordCivilContext,
  recordCivilObjectIdentity,
  type D2R1Actor,
} from "./identity-foundation";

const actor: D2R1Actor = {
  actorId: "civil-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D2_CONTEXT_AUTHORITY,
};

function contextInput(overrides: Record<string, unknown> = {}) {
  return {
    contextId: "civil-context-1",
    citedLifecycleStage: "CONCEPT",
    provenanceRef: "prov-civil-context",
    ...overrides,
  };
}

describe("EOS-D2-R1 Civil identity and object foundation", () => {
  it("records scoped Civil identity without engineering data", () => {
    expect(D2_R1_STATUS).toBe("CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D2_R1_MATURITY).toBe("CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D2_RUNTIME_STARTED).toBe(true);
    expect(D2_RUNTIME_COUNT).toBe(1);
    expect(D2_CIVIL_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D2_CIVIL_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(ARCHITECTURE_RUNTIME_STARTED).toBe(false);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D2_CIVIL_IDENTITY_AND_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D2_SURVEY_SPATIAL_SURFACE_RUNTIME_READY).toBe(false);
    expect(D2_R2_STARTED).toBe(false);
    expect(D2_R1_CANONICAL_NEXT_PHASE).toBe("EOS-D2-R2-SURVEY-SPATIAL-AND-SURFACE-CONTEXT");
    expect(D2_R1_NEXT_PHASE_TYPE).toBe("SURVEY_SPATIAL_AND_SURFACE_CONTEXT");
    expect(D2_R1_CANONICAL_NEXT_PHASE_SCOPE).toContain("Do not perform terrain generation");
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D1N_TRACK_COMPLETE).toBe(true);
    expect(D1N_TRACK_STATUS).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D3_D9_RUNTIME_STARTED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);
    expect(D2_SURVEY_OBSERVATION_RUNTIME_COUNT).toBe(0);
    expect(D2_SURFACE_RUNTIME_COUNT).toBe(0);
    expect(D2_EARTHWORKS_CALCULATION_RUNTIME_COUNT).toBe(0);
    expect(D2_DRAINAGE_RUNTIME_COUNT).toBe(0);
    expect(D2_AUTOMATIC_MATURITY_PROGRESSION_RUNTIME_COUNT).toBe(0);
    expect(AI_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D2_CIVIL_ENGINEERING_AUTHORITY).toBe(false);
    expect(FREEFORM_AUTHORITATIVE_CIVIL_OBJECT_TYPE_ALLOWED).toBe(false);
    expect(UNKNOWN_CIVIL_OBJECT_TYPE_AUTO_ACCEPTED).toBe(false);
    expect(INFERRED_CIVIL_ENGINEERING_RELATIONSHIPS_ALLOWED).toBe(false);
    expect(D2_CIVIL_OBJECT_TYPE_ALLOWLIST_IMPLEMENTED).toBe(true);
    expect(D2_CIVIL_OBJECT_IDENTITY_RUNTIME_IMPLEMENTED).toBe(true);

    const store = createD2R1Store();
    const context = recordCivilContext(store, actor, contextInput());
    expect(context.discipline).toBe(D2_DISCIPLINE);
    expect(context.tenantId).toBe(actor.tenantId);
    expect(context.workspaceId).toBe(actor.workspaceId);
    expect(context.projectId).toBe(actor.projectId);
    expect(context.civilEngineeringAuthority).toBe(false);
    expect(context.authority).toBe(D2_CONTEXT_AUTHORITY);
    expect(context.fingerprint).toBe(fingerprintCanonical({
      contextId: context.contextId,
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      projectId: actor.projectId,
      discipline: D2_DISCIPLINE,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-civil-context",
      authority: D2_CONTEXT_AUTHORITY,
      predecessorContextId: null,
    }));
    expect(recordCivilContext(store, actor, contextInput()).contextId).toBe(context.contextId);
    expect(store.history).toHaveLength(1);
    expect(() => recordCivilContext(store, actor, contextInput({ contextId: "civil-context-2" }))).toThrow(/DUPLICATE_CONTEXT_REJECTED/);
    expect(() => recordCivilContext(store, actor, contextInput({ tenantId: "tenant-b" }))).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordCivilContext(store, actor, contextInput({ workspaceId: "workspace-b" }))).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordCivilContext(store, actor, contextInput({ projectId: "project-b" }))).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordCivilContext(store, { ...actor, actorId: "AI_assistant" }, contextInput())).toThrow(/AI_NOT_CIVIL_AUTHORITY/);
    expect(() => recordCivilContext(store, { ...actor, authority: "ADMIN" }, contextInput())).toThrow(/ADMIN_NOT_CIVIL_AUTHORITY/);
    expect(() => recordCivilContext(store, actor, contextInput({ citedLifecycleStage: "CONSTRUCTION" }))).toThrow(/MATURITY_STAGE_INVALID/);
    expect(() => recordCivilContext(store, actor, contextInput({ assertedFingerprint: "spoofed" }))).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordCivilContext(store, actor, contextInput({ surveyObservation: true }))).toThrow(/SURVEY_OBSERVATION_NOT_IN_R1/);
    expect(() => advanceCivilMaturity()).toThrow(/MATURITY_PROGRESSION_NOT_IN_R1/);
    expect(() => mutateCivilContext()).toThrow(/CONTEXT_MUTATION_REJECTED/);
    for (const stage of D2_MATURITY_STATES) {
      expect(["CONCEPT", "PREFEASIBILITY", "FEASIBILITY", "FEED", "DETAILED_DESIGN"]).toContain(stage);
    }

    const site = recordCivilObjectIdentity(store, actor, {
      objectId: "site-1",
      contextId: context.contextId,
      objectType: "CIVIL_SITE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-site",
    });
    expect(site.objectCategory).toBe("SITE_AND_SPATIAL_REFERENCE");
    expect(site.civilEngineeringAuthority).toBe(false);
    expect(site).not.toHaveProperty("elevation");
    const surfaceIdentity = recordCivilObjectIdentity(store, actor, {
      objectId: "surface-identity-1",
      contextId: context.contextId,
      objectType: "SURFACE_REFERENCE",
      objectCategory: "SURFACE_CONTEXT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-surface-identity",
      parentObjectId: site.objectId,
    });
    expect(surfaceIdentity.objectType).toBe("SURFACE_REFERENCE");
    expect(D2_SURFACE_RUNTIME_COUNT).toBe(0);
    expect(surfaceIdentity.relationships).toEqual([{ kind: "PARENT", targetObjectId: site.objectId }]);
    expect(() => recordCivilObjectIdentity(store, actor, {
      objectId: "surface-identity-2",
      contextId: context.contextId,
      objectType: "CUSTOM_SURFACE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-custom",
    })).toThrow(/OBJECT_TYPE_NOT_ALLOWLISTED/);
    expect(() => recordCivilObjectIdentity(store, actor, {
      objectId: "surface-identity-3",
      contextId: context.contextId,
      objectType: "SURFACE_REFERENCE",
      objectCategory: "ROADS_AND_ACCESS",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-mismatch",
    })).toThrow(/OBJECT_CATEGORY_MISMATCH/);
    expect(() => recordCivilObjectIdentity(store, actor, {
      objectId: "surface-identity-4",
      contextId: context.contextId,
      objectType: "CIVIL_SITE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-inferred",
      relationships: [{ kind: "IMPACT", targetObjectId: site.objectId }],
    })).toThrow(/RELATIONSHIP_KIND_NOT_EXPLICIT/);
    expect(() => recordCivilObjectIdentity(store, actor, {
      objectId: "surface-identity-5",
      contextId: context.contextId,
      objectType: "GRADING_ZONE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-grade",
      gradingDesign: true,
    })).toThrow(/GRADING_NOT_IN_R1/);
    const replay = recordCivilObjectIdentity(store, actor, {
      objectId: site.objectId,
      contextId: context.contextId,
      objectType: "CIVIL_SITE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-site",
    });
    expect(replay.fingerprint).toBe(site.fingerprint);
    expect(() => recordCivilObjectIdentity(store, actor, {
      objectId: "site-2",
      contextId: context.contextId,
      objectType: "CIVIL_SITE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-site",
    })).toThrow(/DUPLICATE_OBJECT_REJECTED/);
    const other = createD2R1Store();
    const otherContext = recordCivilContext(other, { ...actor, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }, contextInput());
    recordCivilObjectIdentity(other, { ...actor, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" }, {
      objectId: "foreign-site",
      contextId: otherContext.contextId,
      objectType: "CIVIL_SITE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-foreign",
    });
    store.objects.push(other.objects[0]!);
    expect(() => recordCivilObjectIdentity(store, actor, {
      objectId: "site-3",
      contextId: context.contextId,
      objectType: "CIVIL_SITE",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-spoof-parent",
      parentObjectId: "foreign-site",
    })).toThrow(/CROSS_TENANT_OPERATION/);
    const revised = recordCivilContext(store, actor, contextInput({
      contextId: "civil-context-1b",
      predecessorContextId: context.contextId,
      provenanceRef: "prov-civil-context-b",
    }));
    expect(revised.recordStatus).toBe("CURRENT");
    expect(store.contexts.find((row) => row.contextId === context.contextId)?.recordStatus).toBe("SUPERSEDED");
    expect(store.history.some((row) => row.action === "SUPERSEDED")).toBe(true);
    expect(D2_CIVIL_OBJECT_TYPES).toHaveLength(33);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "identity-foundation.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "identity-foundation.ts"), source)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R1.CIVIL_IDENTITY_AND_OBJECT_FOUNDATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D2.R2.SURVEY_SPATIAL_AND_SURFACE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
