import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  D3_0_RUNTIME_STARTED,
  D3_GEOTECHNICAL_OBJECT_TYPES,
  D3_MATURITY_STATES,
  D3_R1_STARTED,
  D3_RUNTIME_COUNT as ARCHITECTURE_RUNTIME_COUNT,
} from "@rtb/types";
import { describe, expect, it } from "vitest";
import { D2_RUNTIME_COUNT_AFTER_R12, D2_TRACK_COMPLETE, D2_TRACK_COMPLETION_CLASSIFICATION } from "../civil/civil-bounded-closeout";
import { fingerprintCanonical } from "../optimization-intelligence/fingerprint";
import { STRUCTURAL_CAPABILITY_MANIFEST } from "../structural-concrete/capability";
import { scanAnalysisFormulaBypass } from "../structural-systems/formula-scan";
import { D1_STRUCTURAL_PACK_COMPLETE, D1N_REOPENED } from "../structural-systems/structural-pack-sequencing";
import {
  ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY,
  CANONICAL_FINGERPRINT_REUSED,
  CROSS_TENANT_D3_OBJECT_ACCESS_ALLOWED,
  D2_REOPENED,
  D3_APPROVAL_RUNTIME_COUNT,
  D3_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED,
  D3_BEARING_CAPACITY_RUNTIME_COUNT,
  D3_BOREHOLE_DATA_RUNTIME_COUNT,
  D3_CERTIFICATION_RUNTIME_COUNT,
  D3_CONTEXT_AUTHORITY,
  D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
  D3_D9_SOURCE_CONTRACT_RUNTIME_READY,
  D3_DISCIPLINE,
  D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
  D3_DISCIPLINE_INTERFACE_RUNTIME_READY,
  D3_DUPLICATE_GOVERNANCE_IMPLEMENTED,
  D3_EQUALS_D1_STRUCTURAL_AUTHORITY,
  D3_EQUALS_D2_CIVIL_AUTHORITY,
  D3_EXPLICIT_RELATIONSHIPS_SUPPORTED,
  D3_FIELD_TEST_DATA_RUNTIME_COUNT,
  D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
  D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
  D3_GEOTECHNICAL_CONTEXT_RUNTIME_COUNT,
  D3_GEOTECHNICAL_CONTEXT_RUNTIME_IMPLEMENTED,
  D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY,
  D3_GROUNDWATER_DATA_RUNTIME_COUNT,
  D3_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED,
  D3_LAB_TEST_DATA_RUNTIME_COUNT,
  D3_LIFECYCLE_MATURITY_GOVERNED,
  D3_OBJECT_FINGERPRINT_IMPLEMENTED,
  D3_OBJECT_HISTORY_PRESERVED,
  D3_OBJECT_IDENTITY_EQUALS_ENGINEERING_CONTENT,
  D3_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED,
  D3_OBJECT_TYPE_ALLOWLIST_ENFORCED,
  D3_PARAMETER_CALCULATION_RUNTIME_COUNT,
  D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
  D3_PARAMETER_RUNTIME_COUNT,
  D3_PROVENANCE_PRESERVED,
  D3_PROVENANCE_REQUIRED,
  D3_R1_CANONICAL_NEXT_PHASE,
  D3_R1_CANONICAL_NEXT_PHASE_SCOPE,
  D3_R1_MATURITY,
  D3_R1_NEXT_PHASE_TYPE,
  D3_R1_STATUS,
  D3_R2_STARTED,
  D3_REPLAY_PROTECTION_IMPLEMENTED,
  D3_REUSES_CANONICAL_CURRENTNESS,
  D3_REUSES_CANONICAL_FINGERPRINT,
  D3_REUSES_CANONICAL_OBJECT_IDENTITY,
  D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
  D3_RUNTIME_COUNT,
  D3_RUNTIME_STARTED,
  D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
  D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY,
  D3_SITE_INVESTIGATION_RUNTIME_COUNT,
  D3_SLOPE_STABILITY_RUNTIME_COUNT,
  D3_SPOOFING_PROTECTION_IMPLEMENTED,
  D3_STRATIGRAPHY_RUNTIME_COUNT,
  D3_TEST_PIT_DATA_RUNTIME_COUNT,
  D4_RUNTIME_STARTED,
  D5_RUNTIME_STARTED,
  D6_RUNTIME_STARTED,
  D7_RUNTIME_STARTED,
  D8_RUNTIME_STARTED,
  D9_RUNTIME_STARTED,
  DATABASE_SCHEMA_CHANGED,
  ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER,
  FREEFORM_AUTHORITATIVE_D3_OBJECT_TYPE_ALLOWED,
  NEW_DEPENDENCY_ADDED,
  OBSERVATION_EQUALS_INTERPRETATION,
  PARALLEL_D3_CURRENTNESS_ENGINE_CREATED,
  PARALLEL_D3_IDENTITY_SYSTEM_CREATED,
  RECOMMENDATION_EQUALS_APPROVAL,
  SECOND_FINGERPRINT_ALGORITHM_CREATED,
  SILENT_D3_OBJECT_MUTATION_ALLOWED,
  TENANT_WORKSPACE_PROJECT_D3_SCOPE_ENFORCED,
  TEST_RESULT_EQUALS_ENGINEERING_PARAMETER,
  UNKNOWN_D3_OBJECT_TYPE_AUTO_ACCEPTED,
  advanceGeotechnicalMaturity,
  createD3R1Store,
  deriveGeotechnicalParameter,
  mutateGeotechnicalContext,
  recommendFoundation,
  recordBoreholeData,
  recordGeotechnicalContext,
  recordGeotechnicalObjectIdentity,
  type D3R1Actor,
} from "./identity-foundation";

const actor: D3R1Actor = {
  actorId: "geotechnical-recorder",
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  projectId: "project-a",
  authority: D3_CONTEXT_AUTHORITY,
};

function contextInput(overrides: Record<string, unknown> = {}) {
  return {
    contextId: "geotech-context-1",
    citedLifecycleStage: "CONCEPT",
    provenanceRef: "prov-geotech-context",
    ...overrides,
  };
}

describe("EOS-D3-R1 Geotechnical identity and object foundation", () => {
  it("records scoped Geotechnical identity without investigation or engineering content", () => {
    expect(D3_R1_STATUS).toBe("GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D3_R1_MATURITY).toBe("GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION_IMPLEMENTED");
    expect(D3_RUNTIME_STARTED).toBe(true);
    expect(D3_RUNTIME_COUNT).toBe(1);
    expect(D3_GEOTECHNICAL_CONTEXT_RUNTIME_IMPLEMENTED).toBe(true);
    expect(D3_GEOTECHNICAL_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D3_GEOTECHNICAL_IDENTITY_OBJECT_FOUNDATION_RUNTIME_READY).toBe(true);
    expect(D3_0_RUNTIME_STARTED).toBe(false);
    expect(ARCHITECTURE_RUNTIME_COUNT).toBe(0);
    expect(D3_R1_STARTED).toBe(false);
    expect(D3_SITE_INVESTIGATION_EVIDENCE_RUNTIME_READY).toBe(false);
    expect(D3_DISCIPLINE_INTERFACE_RUNTIME_READY).toBe(false);
    expect(D3_D9_SOURCE_CONTRACT_RUNTIME_READY).toBe(false);
    expect(D3_R2_STARTED).toBe(false);
    expect(D3_R1_CANONICAL_NEXT_PHASE).toBe("EOS-D3-R2-SITE-INVESTIGATION-AND-EVIDENCE-CONTEXT");
    expect(D3_R1_NEXT_PHASE_TYPE).toBe("SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT");
    expect(D3_R1_CANONICAL_NEXT_PHASE_SCOPE).toContain("without yet interpreting stratigraphy");
    expect(D1_STRUCTURAL_PACK_COMPLETE).toBe(false);
    expect(D1N_REOPENED).toBe(false);
    expect(D2_TRACK_COMPLETE).toBe(true);
    expect(D2_TRACK_COMPLETION_CLASSIFICATION).toBe("COMPLETE_BOUNDED_WITH_LIMITATIONS");
    expect(D2_REOPENED).toBe(false);
    expect(D2_RUNTIME_COUNT_AFTER_R12).toBe(11);
    expect(D3_REUSES_CANONICAL_OBJECT_IDENTITY).toBe(true);
    expect(D3_REUSES_CANONICAL_CURRENTNESS).toBe(true);
    expect(D3_REUSES_CANONICAL_FINGERPRINT).toBe(true);
    expect(PARALLEL_D3_IDENTITY_SYSTEM_CREATED).toBe(false);
    expect(PARALLEL_D3_CURRENTNESS_ENGINE_CREATED).toBe(false);
    expect(CANONICAL_FINGERPRINT_REUSED).toBe(true);
    expect(D3_OBJECT_FINGERPRINT_IMPLEMENTED).toBe(true);
    expect(SECOND_FINGERPRINT_ALGORITHM_CREATED).toBe(false);
    expect(D3_OBJECT_TYPE_ALLOWLIST_ENFORCED).toBe(true);
    expect(FREEFORM_AUTHORITATIVE_D3_OBJECT_TYPE_ALLOWED).toBe(false);
    expect(UNKNOWN_D3_OBJECT_TYPE_AUTO_ACCEPTED).toBe(false);
    expect(D3_OBJECT_IDENTITY_EQUALS_ENGINEERING_CONTENT).toBe(false);
    expect(D3_OBJECT_IDENTITY_EQUALS_ENGINEERING_VALIDATED).toBe(false);
    expect(D3_EXPLICIT_RELATIONSHIPS_SUPPORTED).toBe(true);
    expect(D3_INFERRED_ENGINEERING_RELATIONSHIPS_ALLOWED).toBe(false);
    expect(D3_LIFECYCLE_MATURITY_GOVERNED).toBe(true);
    expect(D3_AUTOMATIC_MATURITY_PROGRESSION_ALLOWED).toBe(false);
    expect(TENANT_WORKSPACE_PROJECT_D3_SCOPE_ENFORCED).toBe(true);
    expect(CROSS_TENANT_D3_OBJECT_ACCESS_ALLOWED).toBe(false);
    expect(D3_PROVENANCE_REQUIRED).toBe(true);
    expect(D3_PROVENANCE_PRESERVED).toBe(true);
    expect(SILENT_D3_OBJECT_MUTATION_ALLOWED).toBe(false);
    expect(D3_OBJECT_HISTORY_PRESERVED).toBe(true);
    expect(D3_DUPLICATE_GOVERNANCE_IMPLEMENTED).toBe(true);
    expect(D3_REPLAY_PROTECTION_IMPLEMENTED).toBe(true);
    expect(D3_SPOOFING_PROTECTION_IMPLEMENTED).toBe(true);
    expect(AI_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(ADMIN_EQUALS_D3_GEOTECHNICAL_ENGINEERING_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D1_STRUCTURAL_AUTHORITY).toBe(false);
    expect(D3_EQUALS_D2_CIVIL_AUTHORITY).toBe(false);
    expect(OBSERVATION_EQUALS_INTERPRETATION).toBe(false);
    expect(TEST_RESULT_EQUALS_ENGINEERING_PARAMETER).toBe(false);
    expect(ENGINEERING_PARAMETER_EQUALS_VALIDATED_PARAMETER).toBe(false);
    expect(RECOMMENDATION_EQUALS_APPROVAL).toBe(false);
    expect([
      D3_SITE_INVESTIGATION_RUNTIME_COUNT,
      D3_BOREHOLE_DATA_RUNTIME_COUNT,
      D3_TEST_PIT_DATA_RUNTIME_COUNT,
      D3_STRATIGRAPHY_RUNTIME_COUNT,
      D3_GROUNDWATER_DATA_RUNTIME_COUNT,
      D3_FIELD_TEST_DATA_RUNTIME_COUNT,
      D3_LAB_TEST_DATA_RUNTIME_COUNT,
      D3_PARAMETER_RUNTIME_COUNT,
      D3_PARAMETER_CALCULATION_RUNTIME_COUNT,
      D3_PARAMETER_INFERENCE_RUNTIME_COUNT,
      D3_FOUNDATION_RECOMMENDATION_RUNTIME_COUNT,
      D3_FOUNDATION_CALCULATION_RUNTIME_COUNT,
      D3_BEARING_CAPACITY_RUNTIME_COUNT,
      D3_SETTLEMENT_CALCULATION_RUNTIME_COUNT,
      D3_SLOPE_STABILITY_RUNTIME_COUNT,
      D3_REVIEW_VALIDATION_GOVERNANCE_RUNTIME_COUNT,
      D3_APPROVAL_RUNTIME_COUNT,
      D3_CERTIFICATION_RUNTIME_COUNT,
      D3_DISCIPLINE_INTERFACE_RUNTIME_COUNT,
      D3_D9_SOURCE_CONTRACT_RUNTIME_COUNT,
      D3_CROSS_DISCIPLINE_REASONING_RUNTIME_COUNT,
    ]).toEqual(Array(21).fill(0));
    expect(D4_RUNTIME_STARTED).toBe(false);
    expect(D5_RUNTIME_STARTED).toBe(false);
    expect(D6_RUNTIME_STARTED).toBe(false);
    expect(D7_RUNTIME_STARTED).toBe(false);
    expect(D8_RUNTIME_STARTED).toBe(false);
    expect(D9_RUNTIME_STARTED).toBe(false);
    expect(DATABASE_SCHEMA_CHANGED).toBe(false);
    expect(NEW_DEPENDENCY_ADDED).toBe(false);

    const store = createD3R1Store();
    const context = recordGeotechnicalContext(store, actor, contextInput());
    expect(context.discipline).toBe(D3_DISCIPLINE);
    expect(context.tenantId).toBe(actor.tenantId);
    expect(context.currentness).toBe("CURRENT");
    expect(context.geotechnicalEngineeringAuthority).toBe(false);
    expect(context.fingerprint).toBe(fingerprintCanonical({
      contextId: context.contextId,
      tenantId: actor.tenantId,
      workspaceId: actor.workspaceId,
      projectId: actor.projectId,
      discipline: D3_DISCIPLINE,
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-geotech-context",
      authority: D3_CONTEXT_AUTHORITY,
      predecessorContextId: null,
    }));
    expect(recordGeotechnicalContext(store, actor, contextInput()).contextId).toBe(context.contextId);
    expect(store.history).toHaveLength(1);
    expect(() => recordGeotechnicalContext(store, actor, contextInput({ contextId: "geotech-context-2" }))).toThrow(/DUPLICATE_CONTEXT_REJECTED/);
    expect(() => recordGeotechnicalContext(store, actor, contextInput({ tenantId: "tenant-b" }))).toThrow(/CROSS_TENANT_OPERATION/);
    expect(() => recordGeotechnicalContext(store, actor, contextInput({ workspaceId: "workspace-b" }))).toThrow(/CROSS_WORKSPACE_OPERATION/);
    expect(() => recordGeotechnicalContext(store, actor, contextInput({ projectId: "project-b" }))).toThrow(/CROSS_PROJECT_OPERATION/);
    expect(() => recordGeotechnicalContext(store, { ...actor, actorId: "AI_assistant" }, contextInput())).toThrow(/AI_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalContext(store, { ...actor, authority: "ADMIN" }, contextInput())).toThrow(/ADMIN_NOT_GEOTECHNICAL_AUTHORITY/);
    expect(() => recordGeotechnicalContext(store, { ...actor, authority: "GEOTECHNICAL_ENGINEERING_AUTHORITY" }, contextInput())).toThrow(/RECORDER_NOT_GEOTECHNICAL_ENGINEERING_AUTHORITY/);
    expect(() => recordGeotechnicalContext(store, actor, contextInput({ citedLifecycleStage: "CONSTRUCTION" }))).toThrow(/MATURITY_STAGE_INVALID/);
    expect(() => recordGeotechnicalContext(store, actor, contextInput({ assertedFingerprint: "spoofed" }))).toThrow(/FINGERPRINT_MISMATCH/);
    expect(() => recordGeotechnicalContext(store, actor, contextInput({ provenanceRef: "AI_generated" }))).toThrow(/MISSING_PROVENANCE/);
    expect(() => recordGeotechnicalContext(store, actor, contextInput({ boreholeData: true }))).toThrow(/BOREHOLE_DATA_NOT_IN_R1/);
    expect(() => advanceGeotechnicalMaturity()).toThrow(/MATURITY_PROGRESSION_NOT_IN_R1/);
    expect(() => mutateGeotechnicalContext()).toThrow(/CONTEXT_MUTATION_REJECTED/);
    expect(() => recordBoreholeData()).toThrow(/BOREHOLE_DATA_NOT_IN_R1/);
    expect(() => deriveGeotechnicalParameter()).toThrow(/PARAMETER_NOT_IN_R1/);
    expect(() => recommendFoundation()).toThrow(/FOUNDATION_RECOMMENDATION_NOT_IN_R1/);
    for (const stage of D3_MATURITY_STATES) {
      expect(["CONCEPT", "PREFEASIBILITY", "FEASIBILITY", "FEED", "DETAILED_DESIGN"]).toContain(stage);
    }

    const site = recordGeotechnicalObjectIdentity(store, actor, {
      objectId: "site-1",
      contextId: context.contextId,
      objectType: "GEOTECHNICAL_SITE_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-site",
    });
    expect(site.objectCategory).toBe("SITE_INVESTIGATION_CONTEXT");
    expect(site.geotechnicalEngineeringAuthority).toBe(false);
    expect(site).not.toHaveProperty("boreholeLog");
    const borehole = recordGeotechnicalObjectIdentity(store, actor, {
      objectId: "borehole-identity-1",
      contextId: context.contextId,
      objectType: "BOREHOLE",
      objectCategory: "SITE_INVESTIGATION_CONTEXT",
      citedLifecycleStage: "FEED",
      provenanceRef: "prov-borehole-identity",
      parentObjectId: site.objectId,
    });
    expect(borehole.objectType).toBe("BOREHOLE");
    expect(borehole).not.toHaveProperty("depth");
    expect(borehole).not.toHaveProperty("testResult");
    expect(borehole).not.toHaveProperty("parameterValue");
    expect(D3_BOREHOLE_DATA_RUNTIME_COUNT).toBe(0);
    expect(borehole.relationships).toEqual([{ kind: "PARENT", targetObjectId: site.objectId }]);
    expect(() => recordGeotechnicalObjectIdentity(store, actor, {
      objectId: "freeform-1",
      contextId: context.contextId,
      objectType: "CUSTOM_BOREHOLE",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-custom",
    })).toThrow(/OBJECT_TYPE_NOT_ALLOWLISTED/);
    expect(() => recordGeotechnicalObjectIdentity(store, actor, {
      objectId: "category-mismatch",
      contextId: context.contextId,
      objectType: "BOREHOLE",
      objectCategory: "GEOTECHNICAL_PARAMETER_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-mismatch",
    })).toThrow(/OBJECT_CATEGORY_MISMATCH/);
    expect(() => recordGeotechnicalObjectIdentity(store, actor, {
      objectId: "inferred-1",
      contextId: context.contextId,
      objectType: "TEST_PIT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-inferred",
      relationships: [{ kind: "NEARBY", targetObjectId: site.objectId }],
    })).toThrow(/RELATIONSHIP_KIND_NOT_EXPLICIT/);
    expect(() => recordGeotechnicalObjectIdentity(store, actor, {
      objectId: "parameter-identity",
      contextId: context.contextId,
      objectType: "GEOTECHNICAL_PARAMETER_SET",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-parameter",
      parameter: true,
    })).toThrow(/PARAMETER_NOT_IN_R1/);
    const replay = recordGeotechnicalObjectIdentity(store, actor, {
      objectId: site.objectId,
      contextId: context.contextId,
      objectType: "GEOTECHNICAL_SITE_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-site",
    });
    expect(replay.fingerprint).toBe(site.fingerprint);
    expect(() => recordGeotechnicalObjectIdentity(store, actor, {
      objectId: "site-2",
      contextId: context.contextId,
      objectType: "GEOTECHNICAL_SITE_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-site",
    })).toThrow(/DUPLICATE_OBJECT_REJECTED/);
    const other = createD3R1Store();
    const otherActor = { ...actor, tenantId: "tenant-b", workspaceId: "workspace-b", projectId: "project-b" };
    const otherContext = recordGeotechnicalContext(other, otherActor, contextInput());
    recordGeotechnicalObjectIdentity(other, otherActor, {
      objectId: "foreign-site",
      contextId: otherContext.contextId,
      objectType: "GEOTECHNICAL_SITE_CONTEXT",
      citedLifecycleStage: "CONCEPT",
      provenanceRef: "prov-foreign",
    });
    store.objects.push(other.objects[0]!);
    expect(() => recordGeotechnicalObjectIdentity(store, actor, {
      objectId: "site-3",
      contextId: context.contextId,
      objectType: "GEOTECHNICAL_SITE_CONTEXT",
      citedLifecycleStage: "DETAILED_DESIGN",
      provenanceRef: "prov-spoof-parent",
      parentObjectId: "foreign-site",
    })).toThrow(/CROSS_TENANT_OPERATION/);
    const preservedFingerprint = context.fingerprint;
    const revised = recordGeotechnicalContext(store, actor, contextInput({
      contextId: "geotech-context-1b",
      predecessorContextId: context.contextId,
      provenanceRef: "prov-geotech-context-b",
    }));
    const historical = store.contexts.find((row) => row.contextId === context.contextId);
    expect(revised.recordStatus).toBe("CURRENT");
    expect(historical?.recordStatus).toBe("SUPERSEDED");
    expect(historical?.currentness).toBe("SUPERSEDED");
    expect(historical?.fingerprint).toBe(preservedFingerprint);
    expect(store.history.some((row) => row.action === "SUPERSEDED" && row.fingerprint === preservedFingerprint)).toBe(true);
    expect(D3_GEOTECHNICAL_OBJECT_TYPES).toHaveLength(24);
    const here = dirname(fileURLToPath(import.meta.url));
    const source = readFileSync(join(here, "identity-foundation.ts"), "utf8");
    expect(source).toContain("fingerprintCanonical");
    expect(source).not.toMatch(/createHash|from ["']@rtb\/engineering-review["']|CREATE TABLE/);
    expect(scanAnalysisFormulaBypass(join(here, "identity-foundation.ts"), source)).toEqual([]);
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R1.GEOTECHNICAL_IDENTITY_AND_OBJECT_FOUNDATION")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
    expect(STRUCTURAL_CAPABILITY_MANIFEST.find((row) => row.capabilityId === "D3.R2.SITE_INVESTIGATION_AND_EVIDENCE_CONTEXT")?.implementationState).toBe("IMPLEMENTED_BOUNDED");
  });
});
