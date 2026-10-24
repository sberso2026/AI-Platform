import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_D1F_R5_ASSISTANCE_ADVISORY_ONLY,
  AI_FOUNDATION_AUTHORITY,
  AI_SOIL_PARAMETER_AUTHORITY,
  AI_SUPPORT_FOUNDATION_MAPPING_CAN_GOVERN,
  D1F_R5_ABSENT_REACTION_COMPONENT_EQUALS_ZERO,
  D1F_R5_AUTOMATIC_FOUNDATION_ENVELOPE,
  D1F_R5_AUTOMATIC_REACTION_AGGREGATION,
  D1F_R5_CROSS_COMBINATION_REACTION_SYNTHESIS,
  D1F_R5_DEBT_ITEMS,
  D1F_R5_FOUNDATION_DESIGN_METHOD_COUNT,
  D1F_R5_FOUNDATION_INTERFACE_RUNTIME_COUNT,
  D1F_R5_GEOTECHNICAL_DESIGN_METHOD_COUNT,
  D1F_R5_MATURITY_STATE,
  D1F_R5_MULTI_SUPPORT_AGGREGATION_ROUTE,
  D1F_R5_MULTI_SUPPORT_REACTIONS_AUTOMATICALLY_SUMMED,
  D1F_R5_NEW_ENGINEERING_FORMULA_COUNT,
  D1F_R5_ONE_SUPPORT_EQUALS_ONE_FOUNDATION_ASSUMED,
  D1F_R5_R3_STEEL_DISPATCH_CURRENT_SCOPE,
  D1F_R5_SUPPORT_REACTION_CONTEXT_RUNTIME_COUNT,
  D1F_R6_HANDOFF_READY,
  D1F_R6_REQUIRED_R5_CONTRACTS,
  FOUNDATION_IDENTITY_EQUALS_FOUNDATION_ADEQUACY,
  STRUCTURAL_SUPPORT_EQUALS_FOUNDATION,
  type D1fR1SupportInput,
} from "@rtb/types";
import {
  evaluateFoundationInterface,
  recordSuccessorFoundationInterface,
  type D1fR5Foundation,
  type D1fR5FoundationInput,
  type D1fR5GeotechRef,
  type D1fR5Mapping,
  type D1fR5Reaction,
} from "./foundation-interface";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function support(id: string, supportType = "PINNED"): D1fR1SupportInput {
  return {
    supportId: id,
    projectId: "proj-1",
    nodeRef: `node-${id}`,
    memberRef: null,
    supportType,
    restraints: [{ axis: "UZ", state: supportType === "SPRING" ? "SPRING" : "FIXED", springValue: supportType === "SPRING" ? 1000 : null, springUnit: supportType === "SPRING" ? "N/m" : null, valueInvented: false }],
    authority: "HUMAN_AUTHORED",
    provenanceRef: `support:${id}`,
    sourceOrigin: "MANUAL_HUMAN_INPUT",
    status: "GOVERNED",
  };
}

function reaction(id: string, supportId: string, patch: Partial<D1fR5Reaction> = {}): D1fR5Reaction {
  return {
    reactionId: id,
    projectId: "proj-1",
    structuralSystemId: "sys-1",
    supportId,
    authority: "VERIFIED_GOVERNED",
    completenessState: "BINDING_COMPLETE_FOR_DECLARED_SCOPE",
    runStatus: "COMPLETED",
    convergenceStatus: "CONVERGED",
    modelValidationEvidenceRef: "validation-1",
    loadCaseId: null,
    combinationId: "ULS-1",
    locationRef: `loc-${supportId}`,
    coordinateKind: "GLOBAL",
    coordinateMappingRef: "map-1",
    signConventionRef: "sign-1",
    signConversionsApplied: 1,
    topologyFingerprint: "topo-1",
    analysisModelId: "model-1",
    analysisRunId: "run-1",
    resultSetFingerprint: "set-1",
    reactionFingerprint: `react-${id}`,
    rawUnnormalized: false,
    components: [
      { quantity: "FZ", presence: "PRESENT", value: 120, unit: "kN" },
      { quantity: "FX", presence: "ABSENT", value: null, unit: "kN" },
      { quantity: "MX", presence: "EXPLICIT_ZERO", value: 0, unit: "kN.m" },
    ],
    ...patch,
  };
}

function foundation(patch: Partial<D1fR5Foundation> = {}): D1fR5Foundation {
  return {
    foundationId: "fdn-1",
    projectId: "proj-1",
    structuralSystemId: "sys-1",
    supportIds: ["sup-1"],
    connectionIds: ["conn-1"],
    forceTransferContextIds: ["ft-1"],
    locationRef: "grid-A1",
    coordinateKind: "GLOBAL",
    family: "ISOLATED_FOOTING",
    profileId: "profile-1",
    authority: "HUMAN_AUTHORED",
    sourceHint: "HUMAN",
    status: "GOVERNED",
    version: "1",
    topologyFingerprint: "topo-1",
    provenanceRef: "fdn:1",
    inferredByLlm: false,
    inferredFromReactionPattern: false,
    inferredFromMemberType: false,
    inferredFromGeometryOnly: false,
    familyDefinesCapacity: false,
    familyDefinesDimensions: false,
    familyDefinesReinforcement: false,
    familyDefinesSoilModel: false,
    ...patch,
  };
}

function mapping(patch: Partial<D1fR5Mapping> = {}): D1fR5Mapping {
  return {
    mappingId: "map-fdn-1",
    projectId: "proj-1",
    supportIds: ["sup-1"],
    foundationId: "fdn-1",
    connectionIds: ["conn-1"],
    cardinality: "ONE_TO_ONE",
    authority: "HUMAN_CONFIRMED",
    provenanceRef: "mapping:1",
    ...patch,
  };
}

function geotech(patch: Partial<D1fR5GeotechRef> = {}): D1fR5GeotechRef {
  return {
    referenceId: "geo-1",
    projectId: "proj-1",
    kind: "bearingRecommendationRef",
    authority: "HUMAN_CONFIRMED",
    sourceHint: "GOVERNED_REPORT",
    valuePresent: true,
    locationApplicabilityRef: "borehole-A/2.5m",
    units: "kPa",
    version: "1",
    fingerprint: "geo-fp-1",
    siteWideAssumed: false,
    ...patch,
  };
}

function input(patch: Partial<D1fR5FoundationInput> = {}): D1fR5FoundationInput {
  return {
    projectId: "proj-1",
    structuralSystemId: "sys-1",
    supports: [support("sup-1")],
    foundation: foundation(),
    mapping: mapping(),
    reactions: [reaction("rx-1", "sup-1")],
    geotechnicalRefs: [geotech()],
    envelope: null,
    selectionRequest: null,
    synthesizeCombinationIds: [],
    localAxisInferred: false,
    interpretSpringAsSoil: false,
    restraintDefinesFoundation: false,
    eccentricityRequested: false,
    momentTransportRequested: false,
    jurisdictionInferredFromLocation: false,
    geotechnicalStandardSelectedByAi: false,
    foundationRequired: false,
    geotechnicalRequired: false,
    memberEvaluationSatisfied: false,
    connectionInterfaceComplete: false,
    currentTopologyFingerprint: "topo-1",
    currentProfileId: "profile-1",
    ...patch,
  };
}

describe("EOS-D1F-R5 foundation support interface", () => {
  it("keeps one support and one foundation as an interface, not a design", () => {
    const result = evaluateFoundationInterface(input());
    expect(result.completenessState).toBe("FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(result.foundationPass).toBe(false);
    expect(result.foundationAdequate).toBe(false);
    expect(result.designResult).toBe(false);
    expect(result.foundationDesignAvailability).toBe("FOUNDATION_DESIGN_NOT_IMPLEMENTED");
    expect(result.supportReactionContext.aggregatedDemand).toBeNull();
    expect(result.supportReactionContext.reactions[0]?.components.find((item) => item.quantity === "FX")?.value).toBeNull();
    expect(result.supportReactionContext.reactions[0]?.components.find((item) => item.quantity === "MX")?.value).toBe(0);
    expect(STRUCTURAL_SUPPORT_EQUALS_FOUNDATION).toBe(false);
    expect(FOUNDATION_IDENTITY_EQUALS_FOUNDATION_ADEQUACY).toBe(false);
    expect(D1F_R5_ONE_SUPPORT_EQUALS_ONE_FOUNDATION_ASSUMED).toBe(false);
    expect(D1F_R5_FOUNDATION_INTERFACE_RUNTIME_COUNT).toBe(1);
    expect(D1F_R5_SUPPORT_REACTION_CONTEXT_RUNTIME_COUNT).toBe(1);
    expect(D1F_R5_FOUNDATION_DESIGN_METHOD_COUNT).toBe(0);
    expect(D1F_R5_GEOTECHNICAL_DESIGN_METHOD_COUNT).toBe(0);
    expect(D1F_R5_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(D1F_R5_MATURITY_STATE).toBe("FOUNDATION_SUPPORT_INTERFACE_RUNTIME_FOUNDATION_IMPLEMENTED");
    expect(D1F_R5_R3_STEEL_DISPATCH_CURRENT_SCOPE).toContain("D1D_EU_TENSION only");
    expect(D1F_R6_HANDOFF_READY).toBe(true);
    expect(D1F_R6_REQUIRED_R5_CONTRACTS).toContain("foundationIdentity");
    expect(D1F_R5_DEBT_ITEMS).toContain("NO_FOUNDATION_DESIGN");
    expect(D1F_R5_DEBT_ITEMS).toContain("GA_SECURITY_DEBT_REMAINS");
    expect(AI_FOUNDATION_AUTHORITY).toBe(false);
    expect(AI_SOIL_PARAMETER_AUTHORITY).toBe(false);
    expect(AI_SUPPORT_FOUNDATION_MAPPING_CAN_GOVERN).toBe(false);
    expect(AI_D1F_R5_ASSISTANCE_ADVISORY_ONLY).toBe(true);
  });

  it("preserves several supports, cases, and geotechnical refs without combining them", () => {
    const result = evaluateFoundationInterface(input({
      supports: [support("sup-1"), support("sup-2")],
      foundation: foundation({ supportIds: ["sup-1", "sup-2"], family: "COMBINED_FOOTING" }),
      mapping: mapping({ supportIds: ["sup-2", "sup-1"], cardinality: "MANY_TO_ONE" }),
      reactions: [
        reaction("rx-2", "sup-2", { combinationId: "ULS-2", coordinateKind: "SUPPORT_LOCAL", locationRef: "loc-b" }),
        reaction("rx-1", "sup-1"),
      ],
      geotechnicalRefs: [geotech({ referenceId: "geo-b" }), geotech()],
    }));
    expect(result.completenessState).toBe("FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(result.supportReactionContext.reactions.map((item) => item.reactionId)).toEqual(["rx-1", "rx-2"]);
    expect(result.supportReactionContext.combinationIds).toEqual(["ULS-1", "ULS-2"]);
    expect(result.supportReactionContext.aggregatedDemand).toBeNull();
    expect(result.geotechnicalRefs).toEqual(["geo-1", "geo-b"]);
    expect(D1F_R5_MULTI_SUPPORT_REACTIONS_AUTOMATICALLY_SUMMED).toBe(false);
    expect(D1F_R5_MULTI_SUPPORT_AGGREGATION_ROUTE).toBe("DEFER_TO_FUTURE_FOUNDATION_DESIGN_ORCHESTRATION");
    expect(D1F_R5_AUTOMATIC_REACTION_AGGREGATION).toBe(false);
    expect(D1F_R5_AUTOMATIC_FOUNDATION_ENVELOPE).toBe(false);
    expect(D1F_R5_CROSS_COMBINATION_REACTION_SYNTHESIS).toBe(false);
    expect(D1F_R5_ABSENT_REACTION_COMPONENT_EQUALS_ZERO).toBe(false);
  });

  it("fails closed for authority, reaction quality, synthesis, and separation breaches", () => {
    const cases: Array<[Partial<D1fR5FoundationInput>, string]> = [
      [{ foundation: foundation({ foundationId: "" }) }, "MISSING_FOUNDATION_ID"],
      [{ mapping: mapping({ supportIds: [] }) }, "MISSING_SUPPORT"],
      [{ mapping: mapping({ connectionIds: [] }) }, "MISSING_CONNECTION"],
      [{ mapping: null }, "MISSING_MAPPING"],
      [{ mapping: mapping({ authority: "UNCONFIRMED_CANDIDATE" }) }, "AI_MAPPING"],
      [{ foundation: foundation({ authority: "UNCONFIRMED_CANDIDATE" }) }, "AUTHORITY_NOT_GOVERNING"],
      [{ foundation: foundation({ sourceHint: "LLM" }) }, "AUTHORITY_NOT_GOVERNING"],
      [{ currentTopologyFingerprint: "topo-2" }, "STALE_TOPOLOGY"],
      [{ reactions: [reaction("rx-1", "sup-1", { authority: "IMPORTED_PENDING_VERIFICATION" })] }, "UNUSABLE_REACTION"],
      [{ reactions: [reaction("rx-1", "sup-1", { completenessState: "STALE" })] }, "STALE_REACTION"],
      [{ reactions: [reaction("rx-1", "sup-1", { convergenceStatus: "NONCONVERGED" })] }, "NONCONVERGED_REACTION"],
      [{ reactions: [reaction("rx-1", "sup-1", { runStatus: "FAILED" })] }, "FAILED_REACTION"],
      [{ reactions: [reaction("rx-1", "sup-1", { modelValidationEvidenceRef: null })] }, "MISSING_MODEL_VALIDATION"],
      [{ reactions: [reaction("rx-1", "sup-1", { locationRef: null })] }, "MISSING_LOCATION"],
      [{ reactions: [reaction("rx-1", "sup-1", { components: [{ quantity: "FZ", presence: "PRESENT", value: 1, unit: null }] })] }, "MISSING_UNITS"],
      [{ reactions: [reaction("rx-1", "sup-1", { coordinateKind: null })] }, "MISSING_COORDINATE"],
      [{ reactions: [reaction("rx-1", "sup-1", { signConventionRef: null })] }, "MISSING_SIGN"],
      [{ reactions: [reaction("rx-1", "sup-1", { loadCaseId: null, combinationId: null })] }, "MISSING_CASE"],
      [{ reactions: [reaction("rx-1", "sup-1", { components: [{ quantity: "FX", presence: "ABSENT", value: 0, unit: "kN" }] })] }, "ABSENT_AS_ZERO"],
      [{ reactions: [reaction("rx-1", "sup-1", { rawUnnormalized: true })] }, "RAW_REACTION"],
      [{ synthesizeCombinationIds: ["ULS-1", "ULS-2"] }, "CROSS_COMBINATION"],
      [{ selectionRequest: "MAX_ABS" }, "MAX_ABS_DEMAND"],
      [{ selectionRequest: "SUM", reactions: [reaction("rx-1", "sup-1"), reaction("rx-2", "sup-2")], supports: [support("sup-1"), support("sup-2")], mapping: mapping({ supportIds: ["sup-1", "sup-2"], cardinality: "MANY_TO_ONE" }) }, "AUTOMATIC_SUM"],
      [{ selectionRequest: "SUM", reactions: [reaction("rx-1", "sup-1"), reaction("rx-2", "sup-1", { coordinateKind: "FOUNDATION_LOCAL" })] }, "MIXED_COORDINATES"],
      [{ selectionRequest: "SUM", reactions: [reaction("rx-1", "sup-1"), reaction("rx-2", "sup-1", { locationRef: "other" })] }, "MIXED_REFERENCE_POINTS"],
      [{ foundation: foundation({ familyDefinesCapacity: true }) }, "FAMILY_DEFINES_BEHAVIOR"],
      [{ supports: [support("sup-1", "SPRING")], interpretSpringAsSoil: true }, "SPRING_AS_SOIL"],
      [{ supports: [support("sup-1", "FIXED")], restraintDefinesFoundation: true }, "RESTRAINT_DEFINES_FOUNDATION"],
      [{ foundationRequired: true, memberEvaluationSatisfied: true, connectionInterfaceComplete: true }, "FOUNDATION_REQUIRED_NOT_EVALUATED"],
      [{ geotechnicalRequired: true, geotechnicalRefs: [] }, "MISSING_GEOTECH_REF"],
      [{ geotechnicalRefs: [geotech({ authority: "UNCONFIRMED_CANDIDATE" })] }, "UNCONFIRMED_GEOTECH"],
      [{ geotechnicalRefs: [geotech({ sourceHint: "LLM" })] }, "UNCONFIRMED_GEOTECH"],
      [{ geotechnicalRefs: [geotech({ locationApplicabilityRef: null })] }, "GEOTECH_APPLICABILITY_MISSING"],
      [{ mapping: mapping({ projectId: "proj-2" }) }, "CROSS_PROJECT"],
    ];
    for (const [patch, finding] of cases) {
      expect(evaluateFoundationInterface(input(patch)).findings, finding).toContain(finding);
    }
    const complete = evaluateFoundationInterface(input({ foundationRequired: true }));
    expect(complete.memberPassHidesFoundationGap).toBe(false);
    expect(complete.connectionCompleteHidesFoundationGap).toBe(false);
    expect(complete.foundationPass).toBe(false);
  });

  it("changes fingerprints for governed changes and preserves history", () => {
    const base = evaluateFoundationInterface(input());
    const reordered = evaluateFoundationInterface(input({
      supports: [support("sup-2"), support("sup-1")],
      mapping: mapping({ supportIds: ["sup-2", "sup-1"], cardinality: "MANY_TO_ONE" }),
      reactions: [reaction("rx-2", "sup-2"), reaction("rx-1", "sup-1")],
      geotechnicalRefs: [geotech({ referenceId: "geo-b" }), geotech()],
    }));
    const sameOrder = evaluateFoundationInterface(input({
      supports: [support("sup-1"), support("sup-2")],
      mapping: mapping({ supportIds: ["sup-1", "sup-2"], cardinality: "MANY_TO_ONE" }),
      reactions: [reaction("rx-1", "sup-1"), reaction("rx-2", "sup-2")],
      geotechnicalRefs: [geotech(), geotech({ referenceId: "geo-b" })],
    }));
    expect(reordered.fingerprint).toBe(sameOrder.fingerprint);
    expect(evaluateFoundationInterface(input()).fingerprint).toBe(base.fingerprint);
    expect(evaluateFoundationInterface(input({ mapping: mapping({ supportIds: ["sup-1"], connectionIds: ["conn-2"] }) })).fingerprint).not.toBe(base.fingerprint);
    expect(evaluateFoundationInterface(input({ reactions: [reaction("rx-1", "sup-1", { reactionFingerprint: "changed" })] })).reactionFingerprint).not.toBe(base.reactionFingerprint);
    expect(evaluateFoundationInterface(input({ reactions: [reaction("rx-1", "sup-1", { combinationId: "ULS-9" })] })).reactionFingerprint).not.toBe(base.reactionFingerprint);
    expect(evaluateFoundationInterface(input({ reactions: [reaction("rx-1", "sup-1", { signConventionRef: "sign-2", coordinateKind: "SYSTEM" })] })).reactionFingerprint).not.toBe(base.reactionFingerprint);
    expect(evaluateFoundationInterface(input({ foundation: foundation({ family: "RAFT_OR_MAT" }) })).fingerprint).not.toBe(base.fingerprint);
    expect(evaluateFoundationInterface(input({ foundation: foundation({ profileId: "profile-2" }), currentProfileId: "profile-2", geotechnicalRefs: [geotech({ version: "2", fingerprint: "geo-fp-2" })] })).fingerprint).not.toBe(base.fingerprint);
    const successor = recordSuccessorFoundationInterface(base, evaluateFoundationInterface(input({ foundation: foundation({ version: "2" }) })));
    expect(base.completenessState).toBe("FOUNDATION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(successor.prior.completenessState).toBe("FOUNDATION_INTERFACE_STALE");
    expect(successor.prior.supportReactionContext.canGovern).toBe(false);
    expect(successor.history[0]?.fingerprint).toBe(base.fingerprint);
    expect(successor.current.fingerprint).not.toBe(base.fingerprint);
    expect(successor.current.events.every((event) => event.approval === false)).toBe(true);
    expect(base.provenance.join(" ")).toContain("rx-1");
    expect(base.provenance.join(" ")).toContain("geo-1");
    expect(base.provenance.join(" ")).toContain("model-1");
  });

  it("does not implement foundation or geotechnical design calculations", () => {
    const runtime = readFileSync(join(ROOT, "packages/engineering-os/src/structural-systems/foundation-interface.ts"), "utf8");
    const contracts = readFileSync(join(ROOT, "packages/types/src/structural-systems-r5.ts"), "utf8");
    const doc = readFileSync(join(ROOT, "docs/architecture/engineering-os/EOS_D1F_R5_FOUNDATION_SUPPORT_INTERFACE_FOUNDATION.md"), "utf8");
    const forbidden = [
      ["bearing", "Capacity"].join(""),
      ["allowable", "Pressure"].join(""),
      ["settlement", "Calc"].join(""),
      ["footing", "Size"].join(""),
      ["punching", "Shear"].join(""),
      ["pile", "Resistance"].join(""),
      ["soil", "Stiffness"].join(""),
      ["Math.max"].join(""),
      [".reduce("].join(""),
    ];
    for (const token of forbidden) {
      expect(runtime.includes(token), token).toBe(false);
      expect(contracts.includes(token), token).toBe(false);
      expect(doc.includes(token), token).toBe(false);
    }
    expect(doc.includes("```")).toBe(false);
  });
});
