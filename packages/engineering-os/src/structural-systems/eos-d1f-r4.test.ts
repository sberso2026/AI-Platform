import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_CONNECTION_AUTHORITY,
  AI_D1F_R4_ASSISTANCE_ADVISORY_ONLY,
  CONNECTION_RECORD_EQUALS_CONNECTION_ADEQUACY,
  D1F_R4_ABSENT_END_ACTION_EQUALS_ZERO,
  D1F_R4_AUTOMATIC_CONNECTION_ENVELOPE,
  D1F_R4_AUTOMATIC_CONNECTION_FORCE_AGGREGATION,
  D1F_R4_CONNECTION_DESIGN_METHOD_COUNT,
  D1F_R4_CONNECTION_FAMILY_DEFINES_CAPACITY,
  D1F_R4_CONNECTION_TYPE_IMPLIES_RELEASE,
  D1F_R4_EQUILIBRIUM_DIAGNOSTIC_EQUALS_DESIGN_DEMAND,
  D1F_R4_FOUNDATION_DESIGN_IMPLEMENTED,
  D1F_R4_GENERIC_MAX_ABS_CONNECTION_DEMAND,
  D1F_R4_MEMBER_PASS_CAN_HIDE_REQUIRED_CONNECTION_GAP,
  D1F_R4_NEW_ENGINEERING_FORMULA_COUNT,
  D1F_R4_R3_HISTORICAL_RESULTS_REWRITTEN,
  D1F_R4_R3_STEEL_DISPATCH_CURRENT_SCOPE,
  D1F_R4_R3_STEEL_DISPATCH_OVERSTATED,
  D1F_R4_RELEASE_IMPLIES_CONNECTION_TYPE,
  MEMBER_END_ACTION_EQUALS_CONNECTION_DESIGN_DEMAND,
  PHYSICAL_CONNECTION_EQUALS_ANALYTICAL_JOINT,
  type D1fR1ReleaseInput,
} from "@rtb/types";
import { scanAnalysisFormulaBypass } from "./formula-scan";
import {
  evaluateConnectionInterface,
  recordSuccessorConnectionInterface,
  type D1fR4ConnectionInput,
  type D1fR4EndAction,
  type D1fR4MemberEnd,
} from "./connection-interface";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function end(id: string, memberEnd: string, orientation: string): D1fR4MemberEnd {
  return {
    memberEndId: id,
    projectId: "proj-1",
    physicalMemberId: `phys-${id}`,
    designMemberId: `design-${id}`,
    analyticalElementId: `elem-${id}`,
    memberEnd,
    nodeId: "node-1",
    localCoordinateSystemId: "member-local-1",
    orientation,
    orientationGuessed: false,
    provenanceRef: `end:${id}`,
  };
}

function action(id: string, endId: string, patch: Partial<D1fR4EndAction> = {}): D1fR4EndAction {
  return {
    bindingId: id,
    projectId: "proj-1",
    structuralSystemId: "sys-1",
    memberEndId: endId,
    authority: "VERIFIED_GOVERNED",
    completenessState: "BINDING_COMPLETE_FOR_DECLARED_SCOPE",
    runStatus: "COMPLETED",
    convergenceStatus: "CONVERGED",
    modelValidationEvidenceRef: "validation-1",
    loadCaseId: null,
    combinationId: "ULS-1",
    locationKind: "MEMBER_END",
    coordinateKind: "MEMBER_LOCAL",
    coordinateMappingRef: "map-1",
    signConventionRef: "sign-1",
    signConversionsApplied: 1,
    topologyFingerprint: "topo-1",
    analysisModelFingerprint: "model-1",
    resultSetFingerprint: "set-1",
    bindingFingerprint: `bind-${id}`,
    rawUnnormalized: false,
    components: [
      { quantity: "N", presence: "PRESENT", value: 1000 },
      { quantity: "V_MAJOR", presence: "ABSENT", value: null },
      { quantity: "M_MAJOR", presence: "EXPLICIT_ZERO", value: 0 },
    ],
    ...patch,
  };
}

function input(patch: Partial<D1fR4ConnectionInput> = {}): D1fR4ConnectionInput {
  const ends = [end("a", "START", "I_POSITIVE"), end("b", "END", "J_NEGATIVE")];
  return {
    projectId: "proj-1",
    structuralSystemId: "sys-1",
    physicalConnection: {
      connectionId: "conn-1",
      projectId: "proj-1",
      connectedMemberIds: ["phys-a", "phys-b"],
      classification: null,
      impliesRelease: false,
      authority: "HUMAN_CONFIRMED",
      provenanceRef: "r1-connection",
      sourceOrigin: "MANUAL_HUMAN_INPUT",
      status: "GOVERNED",
      structuralSystemId: "sys-1",
      entityKind: "PHYSICAL_CONNECTION",
      connectedMemberEndIds: ["a", "b"],
      nodeId: "node-1",
      version: "1",
      topologyFingerprint: "topo-1",
      sourceHint: "HUMAN",
      profileId: "profile-1",
    },
    memberEnds: ends,
    analyticalJoints: [{
      analyticalJointId: "joint-1",
      projectId: "proj-1",
      analysisModelId: "model-1",
      nodeId: "node-1",
      connectedEnds: [
        { analyticalElementId: "elem-a", memberEnd: "START", orientation: "I_POSITIVE" },
        { analyticalElementId: "elem-b", memberEnd: "END", orientation: "J_NEGATIVE" },
      ],
      coordinateSystemRef: "member-local-1",
      mappingAuthority: "HUMAN_CONFIRMED",
      provenanceRef: "joint",
    }],
    designConnection: {
      designConnectionId: "design-conn-1",
      projectId: "proj-1",
      physicalConnectionId: "conn-1",
      profileId: "profile-1",
      family: null,
      requiredScope: ["INTERFACE_ONLY"],
      memberEndIds: ["a", "b"],
      actionContextRefs: ["b-a", "b-b"],
      authority: "HUMAN_CONFIRMED",
      status: "GOVERNED",
      provenanceRef: "design-identity",
      inferredByLlm: false,
      inferredFromGeometry: false,
      inferredFromForcePattern: false,
      familyDefinesStiffness: false,
      familyDefinesRelease: false,
      familyDefinesCapacity: false,
    },
    jointMapping: {
      mappingId: "map-joints",
      projectId: "proj-1",
      physicalConnectionId: "conn-1",
      analyticalJointIds: ["joint-1"],
      authority: "HUMAN_CONFIRMED",
      provenanceRef: "mapping",
    },
    releases: [],
    endActions: [action("b-a", "a"), action("b-b", "b", { components: [{ quantity: "N", presence: "PRESENT", value: -250 }] })],
    selectionRequest: null,
    synthesizeCombinationIds: [],
    connectionLocalAxisInferred: false,
    transferPathInferredByAi: false,
    transferPathInferredFromType: false,
    currentTopologyFingerprint: "topo-1",
    currentProfileId: "profile-1",
    currentReleaseFingerprint: "releases-0",
    connectionRequiredByScope: false,
    r3MemberSatisfied: false,
    supportId: null,
    reactionRefs: [],
    ...patch,
  };
}

function release(patch: Partial<D1fR1ReleaseInput> = {}): D1fR1ReleaseInput {
  return {
    releaseId: "rel-1",
    memberId: "phys-a",
    end: "START",
    releasedAxes: ["RX"],
    localAxisRef: "member-local-1",
    inferredFromConnectionType: false,
    inferredFromBimSymbol: false,
    inferredFromMemberType: false,
    authority: "HUMAN_AUTHORED",
    provenanceRef: "r1-release",
    sourceOrigin: "MANUAL_HUMAN_INPUT",
    ...patch,
  };
}

describe("EOS-D1F-R4 connection interface", () => {
  it("keeps connection identity separate from design and records the R3 steel limit", () => {
    expect(PHYSICAL_CONNECTION_EQUALS_ANALYTICAL_JOINT).toBe(false);
    expect(MEMBER_END_ACTION_EQUALS_CONNECTION_DESIGN_DEMAND).toBe(false);
    expect(CONNECTION_RECORD_EQUALS_CONNECTION_ADEQUACY).toBe(false);
    expect(D1F_R4_AUTOMATIC_CONNECTION_FORCE_AGGREGATION).toBe(false);
    expect(D1F_R4_AUTOMATIC_CONNECTION_ENVELOPE).toBe(false);
    expect(D1F_R4_GENERIC_MAX_ABS_CONNECTION_DEMAND).toBe(false);
    expect(D1F_R4_CONNECTION_TYPE_IMPLIES_RELEASE).toBe(false);
    expect(D1F_R4_RELEASE_IMPLIES_CONNECTION_TYPE).toBe(false);
    expect(D1F_R4_CONNECTION_FAMILY_DEFINES_CAPACITY).toBe(false);
    expect(D1F_R4_ABSENT_END_ACTION_EQUALS_ZERO).toBe(false);
    expect(D1F_R4_EQUILIBRIUM_DIAGNOSTIC_EQUALS_DESIGN_DEMAND).toBe(false);
    expect(D1F_R4_MEMBER_PASS_CAN_HIDE_REQUIRED_CONNECTION_GAP).toBe(false);
    expect(D1F_R4_R3_HISTORICAL_RESULTS_REWRITTEN).toBe(false);
    expect(D1F_R4_FOUNDATION_DESIGN_IMPLEMENTED).toBe(false);
    expect(D1F_R4_CONNECTION_DESIGN_METHOD_COUNT).toBe(0);
    expect(D1F_R4_NEW_ENGINEERING_FORMULA_COUNT).toBe(0);
    expect(AI_CONNECTION_AUTHORITY).toBe(false);
    expect(AI_D1F_R4_ASSISTANCE_ADVISORY_ONLY).toBe(true);
    expect(D1F_R4_R3_STEEL_DISPATCH_OVERSTATED).toBe(false);
    expect(D1F_R4_R3_STEEL_DISPATCH_CURRENT_SCOPE).toMatch(/D1D_EU_TENSION/);
  });

  it("preserves separate member-end actions for two-member and multi-member joints", () => {
    const two = evaluateConnectionInterface(input());
    expect(two.completenessState).toBe("CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(two.connectionPass).toBe(false);
    expect(two.designAvailabilityState).toBe("NOT_IMPLEMENTED");
    expect(two.forceTransfer?.aggregatedDemand).toBeNull();
    expect(two.forceTransfer?.memberEndActionSets.map((item) => item.memberEndId)).toEqual(["a", "b"]);
    expect(two.forceTransfer?.memberEndActionSets[0]?.components.find((item) => item.quantity === "V_MAJOR")?.value).toBeNull();
    expect(two.forceTransfer?.memberEndActionSets[0]?.components.find((item) => item.quantity === "M_MAJOR")?.value).toBe(0);
    expect(two.physicalConnectionId).not.toBe(two.analyticalJointIds[0]);
    expect(two.equilibriumDiagnostic).toBe("DEFERRED_NON_GOVERNING_DIAGNOSTIC");
    const ends = ["a", "b", "c", "d"].map((id, index) => end(id, index % 2 === 0 ? "START" : "END", `ORIENT_${id}`));
    const many = evaluateConnectionInterface(input({
      memberEnds: ends,
      physicalConnection: {
        ...input().physicalConnection,
        connectedMemberIds: ends.map((item) => item.physicalMemberId),
        connectedMemberEndIds: ends.map((item) => item.memberEndId),
      },
      endActions: ends.map((item) => action(`b-${item.memberEndId}`, item.memberEndId)),
    }));
    expect(many.completenessState).toBe("CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(many.forceTransfer?.memberEndActionSets).toHaveLength(4);
    expect(many.designConnectionId).toBe("design-conn-1");
  });

  it("fails closed for authority, bindings, selection, and scope gaps", () => {
    const base = input();
    const cases: Array<{ name: string; result: ReturnType<typeof evaluateConnectionInterface>; finding: string }> = [
      { name: "missing id", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, connectionId: "" } })), finding: "MISSING_CONNECTION_ID" },
      { name: "missing member", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, connectedMemberIds: [] } })), finding: "MISSING_CONNECTED_MEMBER" },
      { name: "missing end", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, connectedMemberEndIds: [] } })), finding: "MISSING_MEMBER_END" },
      { name: "missing node", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, nodeId: null } })), finding: "MISSING_NODE" },
      { name: "unconfirmed", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, authority: "UNCONFIRMED_CANDIDATE" } })), finding: "AUTHORITY_NOT_GOVERNING" },
      { name: "proximity", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, sourceHint: "PROXIMITY" } })), finding: "PROXIMITY_CONNECTION" },
      { name: "bim touch", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, sourceHint: "BIM_TOUCH" } })), finding: "PROXIMITY_CONNECTION" },
      { name: "ai visual", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, sourceHint: "AI_VISUAL" } })), finding: "PROXIMITY_CONNECTION" },
      { name: "implies release", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, impliesRelease: true } })), finding: "CONNECTION_TYPE_IMPLIES_RELEASE" },
      { name: "release infers type", result: evaluateConnectionInterface(input({ releases: [release({ inferredFromConnectionType: true })] })), finding: "RELEASE_IMPLIES_CONNECTION_TYPE" },
      { name: "unverified", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { authority: "IMPORTED_PENDING_VERIFICATION", completenessState: "BINDING_INCOMPLETE" })] })), finding: "UNUSABLE_BINDING" },
      { name: "stale binding", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { completenessState: "STALE", authority: "STALE" })] })), finding: "STALE_BINDING" },
      { name: "nonconverged", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { convergenceStatus: "NONCONVERGED" })] })), finding: "UNUSABLE_NONCONVERGED" },
      { name: "failed", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { runStatus: "FAILED" })] })), finding: "UNUSABLE_FAILED" },
      { name: "missing validation", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { modelValidationEvidenceRef: null })] })), finding: "MISSING_MODEL_VALIDATION" },
      { name: "missing case", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { combinationId: null, loadCaseId: null })] })), finding: "MISSING_CASE" },
      { name: "missing location", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { locationKind: null })] })), finding: "MISSING_LOCATION" },
      { name: "missing coordinate", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { coordinateMappingRef: null })] })), finding: "MISSING_COORDINATE" },
      { name: "missing sign", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { signConventionRef: null })] })), finding: "MISSING_SIGN" },
      { name: "absent as zero", result: evaluateConnectionInterface(input({ endActions: [action("b-a", "a", { components: [{ quantity: "V_MAJOR", presence: "ABSENT", value: 0 }] })] })), finding: "ABSENT_AS_ZERO" },
      { name: "max abs", result: evaluateConnectionInterface(input({ selectionRequest: "MAX_ABS" })), finding: "MAX_ABS_DEMAND" },
      { name: "sum", result: evaluateConnectionInterface(input({ selectionRequest: "SUM" })), finding: "AUTOMATIC_SUM" },
      { name: "envelope", result: evaluateConnectionInterface(input({ selectionRequest: "ENVELOPE" })), finding: "AUTOMATIC_ENVELOPE" },
      { name: "cross combination", result: evaluateConnectionInterface(input({ synthesizeCombinationIds: ["ULS-1", "ULS-2"] })), finding: "CROSS_COMBINATION" },
      { name: "bad mapping", result: evaluateConnectionInterface(input({ jointMapping: null })), finding: "MAPPING_AUTHORITY_MISSING" },
      { name: "cross project", result: evaluateConnectionInterface(input({ physicalConnection: { ...base.physicalConnection, projectId: "other" } })), finding: "CROSS_PROJECT" },
      { name: "stale topology", result: evaluateConnectionInterface(input({ currentTopologyFingerprint: "other" })), finding: "STALE_TOPOLOGY" },
    ];
    for (const item of cases) {
      expect(item.result.findings, item.name).toContain(item.finding);
      expect(item.result.completenessState, item.name).not.toBe("CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
      expect(item.result.forceTransfer?.aggregatedDemand, item.name).toBeNull();
    }
    const required = evaluateConnectionInterface(input({ connectionRequiredByScope: true, r3MemberSatisfied: true }));
    expect(required.findings).toContain("CONNECTION_REQUIRED_NOT_EVALUATED");
    expect(required.memberPassHidesConnectionGap).toBe(false);
    expect(required.scopeState).toBe("CONNECTION_DESIGN_UNAVAILABLE");
    expect(required.r3ResultsRewritten).toBe(false);
  });

  it("keeps orientation, releases, and families from defining behavior", () => {
    const result = evaluateConnectionInterface(input());
    const sets = result.forceTransfer?.memberEndActionSets ?? [];
    expect(sets[0]?.memberEndId).not.toBe(sets[1]?.memberEndId);
    expect(result.provenance.join(" ")).toContain("elem-a");
    const oriented = input();
    expect(oriented.memberEnds[0]?.orientation).toBe("I_POSITIVE");
    expect(oriented.memberEnds[1]?.orientation).toBe("J_NEGATIVE");
    expect(oriented.analyticalJoints[0]?.connectedEnds[1]?.orientation).toBe("J_NEGATIVE");
    const family = evaluateConnectionInterface(input({
      designConnection: { ...input().designConnection!, family: "MOMENT_CONNECTION" },
    }));
    expect(family.steelInterface?.resistanceComputed).toBe(false);
    expect(family.findings).not.toContain("CONNECTION_TYPE_IMPLIES_RELEASE");
    expect(family.designConnectionId).not.toBe(family.analyticalJointIds[0]);
    const concrete = evaluateConnectionInterface(input({
      designConnection: { ...input().designConnection!, family: "CONCRETE_JOINT" },
    }));
    expect(concrete.concreteInterface?.jointDesignComputed).toBe(false);
  });

  it("fingerprints independently of order and invalidates history without overwrite", () => {
    const forward = evaluateConnectionInterface(input());
    const reversed = evaluateConnectionInterface(input({
      memberEnds: [...input().memberEnds].reverse(),
      endActions: [...input().endActions].reverse(),
      physicalConnection: { ...input().physicalConnection, connectedMemberEndIds: ["b", "a"], connectedMemberIds: ["phys-b", "phys-a"] },
    }));
    expect(forward.fingerprint).toBe(reversed.fingerprint);
    expect(forward.forceTransferFingerprint).toBe(reversed.forceTransferFingerprint);
    const endChanged = evaluateConnectionInterface(input({
      physicalConnection: { ...input().physicalConnection, connectedMemberEndIds: ["a", "c"] },
      memberEnds: [end("a", "START", "I_POSITIVE"), end("c", "END", "J_NEGATIVE")],
    }));
    expect(endChanged.fingerprint).not.toBe(forward.fingerprint);
    const mappingChanged = evaluateConnectionInterface(input({
      jointMapping: { ...input().jointMapping!, analyticalJointIds: ["joint-9"] },
    }));
    expect(mappingChanged.fingerprint).not.toBe(forward.fingerprint);
    const releaseChanged = evaluateConnectionInterface(input({ releases: [release()], currentReleaseFingerprint: "releases-1" }));
    expect(releaseChanged.fingerprint).not.toBe(forward.fingerprint);
    const bindingChanged = evaluateConnectionInterface(input({
      endActions: [action("b-a", "a", { bindingFingerprint: "bind-changed" }), action("b-b", "b")],
    }));
    expect(bindingChanged.forceTransferFingerprint).not.toBe(forward.forceTransferFingerprint);
    const caseChanged = evaluateConnectionInterface(input({
      endActions: [action("b-a", "a", { combinationId: "ULS-9" }), action("b-b", "b")],
    }));
    expect(caseChanged.forceTransferFingerprint).not.toBe(forward.forceTransferFingerprint);
    const signChanged = evaluateConnectionInterface(input({
      endActions: [action("b-a", "a", { signConventionRef: "sign-2" }), action("b-b", "b")],
    }));
    expect(signChanged.forceTransferFingerprint).not.toBe(forward.forceTransferFingerprint);
    const again = evaluateConnectionInterface(input());
    expect(again.fingerprint).toBe(forward.fingerprint);
    expect(again.completenessState).toBe(forward.completenessState);
    const successor = recordSuccessorConnectionInterface(forward, endChanged);
    expect(forward.completenessState).toBe("CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE");
    expect(successor.prior.completenessState).toBe("CONNECTION_INTERFACE_STALE");
    expect(successor.history[0]).toBe(forward);
    expect(successor.history).toHaveLength(2);
    expect(successor.current.events.every((event) => event.approval === false)).toBe(true);
    expect(forward.provenance[0]).toBe("sys-1");
    expect(forward.provenance).toContain("conn-1");
    expect(forward.provenance).toContain("force-transfer:conn-1");
  });

  it("scans the connection runtime for design formulas and force aggregation", () => {
    const files = [
      "packages/engineering-os/src/structural-systems/connection-interface.ts",
      "packages/types/src/structural-systems-r4.ts",
      "docs/architecture/engineering-os/EOS_D1F_R4_CONNECTION_JOINT_INTERFACE_FOUNDATION.md",
    ];
    const hits = files.flatMap((file) => scanAnalysisFormulaBypass(file, readFileSync(join(ROOT, file), "utf8")));
    expect(hits).toEqual([]);
    const source = readFileSync(join(ROOT, files[0]!), "utf8");
    const tokens = ["bolt", "Resistance", "weld", "Size", "block", "Shear", "prying", "Action", "anchor", "Capacity", "base", "Plate", "joint", "Shear", "connection", "Stiffness"].reduce<string[]>((found, token, index, all) => {
      if (index % 2 === 1) found.push([all[index - 1], token].join(""));
      return found;
    }, []);
    expect(tokens.filter((token) => source.includes(token))).toEqual([]);
    expect(source.includes("Math.max")).toBe(false);
    expect(source.includes("reduce(")).toBe(false);
  });
});
