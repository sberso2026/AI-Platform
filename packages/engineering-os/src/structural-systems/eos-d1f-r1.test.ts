import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  AI_AXIS_AUTHORITY,
  AI_CONNECTIVITY_AUTHORITY,
  AI_ENGINEERING_ACCEPTANCE_AUTHORITY,
  AI_LOAD_PATH_AUTHORITY,
  AI_MAPPING_AUTHORITY,
  AI_MAPPING_CAN_GOVERN,
  AI_NODE_MERGE_AUTHORITY,
  AI_RELEASE_AUTHORITY,
  AI_STRUCTURAL_SYSTEM_AUTHORITY,
  AI_SUPPORT_AUTHORITY,
  AI_TOPOLOGY_AUTHORITY,
  CANDIDATE_CONNECTIVITY_INCLUDED_IN_GOVERNED_FINGERPRINT,
  CROSS_PROJECT_TOPOLOGY_BINDING_ALLOWED,
  D1F_R1_AI_CANDIDATE_STATE_GOVERNED,
  D1F_R1_AI_CAN_CONFIRM_CONNECTIVITY,
  D1F_R1_ANALYTICAL_ELEMENT_RESPONSE_IMPLEMENTED,
  D1F_R1_ANALYTICAL_ELEMENT_STIFFNESS_IMPLEMENTED,
  D1F_R1_AUTOMATIC_CONFIRMATION,
  D1F_R1_AUTO_MERGE_COINCIDENT_NODES,
  D1F_R1_BASE_PLATE_DESIGN_IMPLEMENTED,
  D1F_R1_BOLT_DESIGN_IMPLEMENTED,
  D1F_R1_CONCRETE_DESIGN_CHECK_EXECUTED,
  D1F_R1_CONNECTED_COMPONENT_EQUALS_LOAD_PATH,
  D1F_R1_CONNECTION_CAPACITY_CALCULATED,
  D1F_R1_CONNECTION_DESIGN_IMPLEMENTED,
  D1F_R1_CONNECTION_TYPE_IMPLIES_RELEASE,
  D1F_R1_DISPLACEMENT_CALCULATED,
  D1F_R1_EVENT_EQUALS_ENGINEERING_APPROVAL,
  D1F_R1_EVENT_TYPES_IMPLEMENTED,
  D1F_R1_FOUNDATION_DESIGN_IMPLEMENTED,
  D1F_R1_HISTORICAL_TOPOLOGY_REPRODUCIBLE,
  D1F_R1_IMPLICIT_SIGN_CONVENTION_ALLOWED,
  D1F_R1_LLM_CONNECTIVITY_CAN_GOVERN,
  D1F_R1_LOAD_DISTRIBUTION_IMPLEMENTED,
  D1F_R1_LOAD_PATH_ANNOTATION_EQUALS_ANALYSIS,
  D1F_R1_LOAD_PATH_ANNOTATION_FROM_AI_GOVERNING,
  D1F_R1_M_CALCULATED,
  D1F_R1_MATURITY_STATE,
  D1F_R1_MEMBER_DESIGN_METHOD_COUNT,
  D1F_R1_MEMBER_FORCE_CALCULATION_IMPLEMENTED,
  D1F_R1_MEMBER_TYPE_INFERRED_BY_LLM,
  D1F_R1_MEMBER_TYPE_INFERRED_FROM_GEOMETRY_ONLY,
  D1F_R1_N_CALCULATED,
  D1F_R1_NEW_TOPOLOGY_REVISION_OVERWRITES_HISTORY,
  D1F_R1_PROXIMITY_ONLY_CONNECTIVITY_CAN_GOVERN,
  D1F_R1_REACTION_CALCULATED,
  D1F_R1_RELEASE_FROM_BIM_SYMBOL_INFERRED,
  D1F_R1_RELEASE_FROM_CONNECTION_TYPE_INFERRED,
  D1F_R1_RELEASE_FROM_MEMBER_TYPE_INFERRED,
  D1F_R1_RUNTIME_FOUNDATION_EQUALS_STRUCTURAL_SOLVER,
  D1F_R1_SPRING_UNIT_REQUIRED,
  D1F_R1_SPRING_VALUE_INVENTED,
  D1F_R1_STEEL_DESIGN_CHECK_EXECUTED,
  D1F_R1_STRUCTURAL_ANALYSIS_METHOD_COUNT,
  D1F_R1_STRUCTURAL_SYSTEM_RUNTIME_FOUNDATION_COUNT,
  D1F_R1_STRUCTURAL_SYSTEM_STATUS_STATES,
  D1F_R1_SUPPORT_RECORD_EQUALS_STRUCTURAL_RESPONSE,
  D1F_R1_SUPPORT_STIFFNESS_CALCULATED,
  D1F_R1_SYSTEM_ORCHESTRATOR_COUNT,
  D1F_R1_T_CALCULATED,
  D1F_R1_TOPOLOGY_CHANGE_CAN_INVALIDATE_FUTURE_ANALYSIS,
  D1F_R1_TOPOLOGY_CHANGE_SILENTLY_REUSES_ANALYSIS,
  D1F_R1_TOPOLOGY_COMPLETE_EQUALS_ANALYSIS_READY,
  D1F_R1_TOPOLOGY_COMPLETE_EQUALS_DESIGN_READY,
  D1F_R1_TOPOLOGY_EQUALS_ANALYSIS,
  D1F_R1_TOPOLOGY_RESULT_EQUALS_ANALYSIS_VALIDATION,
  D1F_R1_TOPOLOGY_RESULT_EQUALS_STRUCTURAL_ADEQUACY,
  D1F_R1_TOPOLOGY_RESULT_EQUALS_STRUCTURAL_DESIGN,
  D1F_R1_UI_STATE_AFFECTS_TOPOLOGY_FINGERPRINT,
  D1F_R1_UNCONFIRMED_CONNECTIVITY_CAN_GOVERN,
  D1F_R1_V_CALCULATED,
  D1F_R1_WELD_DESIGN_IMPLEMENTED,
  D1F_R2_REQUIRED_R1_CONTRACTS,
  DYNAMIC_ANALYSIS_IMPLEMENTED,
  EIGENVALUE_IMPLEMENTED,
  FEA_IMPLEMENTED,
  FRAME_ANALYSIS_IMPLEMENTED,
  MATRIX_STIFFNESS_IMPLEMENTED,
  MODAL_ANALYSIS_IMPLEMENTED,
  PARALLEL_UNIT_ENGINE_CREATED,
  PDELTA_IMPLEMENTED,
  PLATE_ANALYSIS_IMPLEMENTED,
  SHELL_ANALYSIS_IMPLEMENTED,
  TOPOLOGY_AUTHORITY_STATE_BYPASSES_AUTHORIZATION,
  TRUSS_ANALYSIS_IMPLEMENTED,
  UNCONFIRMED_CANDIDATE_CAN_GOVERN,
  UNITLESS_NODE_COORDINATE_ALLOWED,
  type D1fR1EdgeInput,
  type D1fR1TopologyInput,
} from "@rtb/types";
import {
  assertTopologyFingerprintCurrent,
  confirmConnectivity,
  evaluateStructuralSystemTopology,
  reviseStructuralTopology,
  scanAnalysisFormulaBypass,
} from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../../..");

function node(nodeId: string, x: number, overrides: Partial<D1fR1TopologyInput["nodes"][number]> = {}): D1fR1TopologyInput["nodes"][number] {
  return {
    nodeId,
    projectId: "project-1",
    x,
    y: 0,
    z: 0,
    unit: "m",
    coordinateSystemRef: "global-cs",
    authority: "HUMAN_CONFIRMED",
    provenanceRef: `prov-${nodeId}`,
    sourceOrigin: "MANUAL_HUMAN_INPUT",
    status: "GOVERNED",
    ...overrides,
  };
}

function member(memberId: string, startNodeId: string, endNodeId: string, overrides: Partial<D1fR1TopologyInput["members"][number]> = {}): D1fR1TopologyInput["members"][number] {
  return {
    memberId,
    projectId: "project-1",
    memberKind: "BEAM",
    candidateMemberKind: null,
    memberTypeInferredByLlm: false,
    memberTypeInferredFromGeometryOnly: false,
    startNodeId,
    endNodeId,
    sectionRef: "section-a",
    materialRef: "material-a",
    authority: "HUMAN_CONFIRMED",
    provenanceRef: `prov-${memberId}`,
    sourceOrigin: "MANUAL_HUMAN_INPUT",
    status: "GOVERNED",
    ...overrides,
  };
}

function edge(partial: Partial<D1fR1EdgeInput> & Pick<D1fR1EdgeInput, "edgeId" | "authority">): D1fR1EdgeInput {
  return {
    kind: "MEMBER_TO_MEMBER",
    fromId: "m1",
    toId: "m1",
    originHint: "EXPLICIT",
    provenanceRef: `prov-${partial.edgeId}`,
    sourceOrigin: "MANUAL_HUMAN_INPUT",
    ...partial,
  };
}

function base(overrides: Partial<D1fR1TopologyInput> = {}): D1fR1TopologyInput {
  return {
    structuralSystemId: "ss-1",
    tenantId: "tenant-1",
    workspaceId: "workspace-1",
    projectId: "project-1",
    disciplineRef: "structural",
    context: { contextId: "ctx-1", projectId: "project-1", discipline: "structural" },
    systemVersion: "1",
    status: "GOVERNED",
    topologyVersion: "t1",
    unitSystemRef: "SI",
    globalCoordinateSystemRef: "global-cs",
    provenanceRef: "prov-system",
    sourceOrigin: "MANUAL_HUMAN_INPUT",
    declaredMemberIds: null,
    declaredNodeIds: null,
    members: [member("m1", "n1", "n2")],
    nodes: [node("n1", 0), node("n2", 6)],
    edges: [],
    supports: [],
    releases: [],
    connections: [],
    coordinateSystems: [{ systemId: "global-cs", kind: "GLOBAL", authority: "HUMAN_AUTHORED", provenanceRef: "prov-cs", sourceOrigin: "MANUAL_HUMAN_INPUT" }],
    transforms: [],
    signConvention: null,
    directionalSemanticsPresent: false,
    loadCaseIds: ["LC1"],
    combinationIds: ["ULS"],
    loadPaths: [],
    analyticalElements: [],
    analyticalMappings: [],
    designMappings: [],
    uiSelection: null,
    viewport: null,
    displayColor: null,
    ...overrides,
  };
}

function codes(input: D1fR1TopologyInput): string[] {
  return evaluateStructuralSystemTopology(input).findings.map((row) => row.code);
}

const sign = {
  forceSign: "FORCE_SIGN",
  momentSign: "MOMENT_SIGN",
  memberEndConvention: "MEMBER_END_CONVENTION",
  localAxisOrientation: "LOCAL_AXIS_ORIENTATION",
  designMethodConvention: "DESIGN_METHOD_CONVENTION",
  solverNameAssumed: false,
};

describe("EOS-D1F-R1 topology runtime", () => {
  it("accepts a minimal governed structural system without claiming analysis or design", () => {
    const result = evaluateStructuralSystemTopology(base());
    expect(result.completenessState).toBe("TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE");
    expect(result.blockingFindings).toEqual([]);
    expect(result.memberCount).toBe(1);
    expect(result.nodeCount).toBe(2);
    expect(result.connectedComponentCount).toBe(1);
    expect(result.analysisReady).toBe(false);
    expect(result.designReady).toBe(false);
    expect(result.structuralAdequacyClaimed).toBe(false);
    expect(result.loadDistributionImplemented).toBe(false);
    expect(result.events).toEqual(["SYSTEM_CREATED"]);
    expect(result.contextRef).toBe("ctx-1");
    expect(D1F_R1_STRUCTURAL_SYSTEM_STATUS_STATES).toEqual(["DRAFT", "GOVERNED", "STALE", "INVALIDATED", "SUPERSEDED", "ARCHIVED"]);
    expect(D1F_R1_EVENT_TYPES_IMPLEMENTED).toContain("CONNECTIVITY_CONFIRMED");
    expect(D1F_R2_REQUIRED_R1_CONTRACTS).toContain("topologyFingerprint");
  });

  it("fails closed on identity, units, coordinates, duplicates, and dangling references", () => {
    expect(evaluateStructuralSystemTopology(base({ structuralSystemId: "" })).completenessState).toBe("TOPOLOGY_UNDETERMINED");
    expect(evaluateStructuralSystemTopology(base({ projectId: "", context: null })).completenessState).toBe("TOPOLOGY_UNDETERMINED");
    expect(codes(base({ unitSystemRef: null }))).toContain("MISSING_UNIT_SYSTEM");
    expect(codes(base({ globalCoordinateSystemRef: null }))).toContain("MISSING_GLOBAL_COORDINATE_SYSTEM");
    expect(codes(base({ status: "ANALYSED" }))).toContain("INVALID_SYSTEM_STATUS");
    expect(codes(base({ members: [member("m1", "n1", "n2"), member("m1", "n1", "n2")] }))).toContain("DUPLICATE_MEMBER_ID");
    expect(codes(base({ nodes: [node("n1", 0), node("n1", 1), node("n2", 6)] }))).toContain("DUPLICATE_NODE_ID");
    expect(codes(base({ members: [member("m1", "missing", "n2")] }))).toContain("UNKNOWN_NODE_REFERENCE");
    expect(codes(base({ members: [member("m1", "n1", "n1")] }))).toContain("INVALID_MEMBER_NODE_CONFIGURATION");
    expect(codes(base({ context: { contextId: "ctx-1", projectId: "other", discipline: "structural" } }))).toContain("CONTEXT_MISMATCH");
    expect(codes(base({ nodes: [node("n1", 0, { unit: null }), node("n2", 6)] }))).toContain("INVALID_NODE_UNITS");
    expect(codes(base({ nodes: [node("n1", 0, { unit: "SOLVER_DEFAULT" }), node("n2", 6)] }))).toContain("INVALID_NODE_UNITS");
    expect(codes(base({ nodes: [node("n1", 0, { coordinateSystemRef: null }), node("n2", 6)] }))).toContain("MISSING_NODE_COORDINATE_SYSTEM");
    expect(UNITLESS_NODE_COORDINATE_ALLOWED).toBe(false);
  });

  it("keeps unconfirmed, proximity, and AI connectivity out of the governed set", () => {
    const human = evaluateStructuralSystemTopology(base({ edges: [edge({ edgeId: "e-human", authority: "HUMAN_CONFIRMED", fromId: "m1", toId: "m1", kind: "MEMBER_TO_MEMBER" })] }));
    expect(human.governedEdgeIds).toContain("e-human");
    const imported = evaluateStructuralSystemTopology(base({ edges: [edge({ edgeId: "e-import", authority: "GOVERNED_IMPORTED", originHint: "EXPLICIT" })] }));
    expect(imported.governedEdgeIds).toContain("e-import");
    const candidate = evaluateStructuralSystemTopology(base({ edges: [edge({ edgeId: "e-candidate", authority: "UNCONFIRMED_CANDIDATE", originHint: "LLM" })] }));
    expect(candidate.governedEdgeIds).not.toContain("e-candidate");
    expect(candidate.candidateConnectivityCount).toBe(1);
    expect(candidate.completenessState).toBe("TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE");
    const proximity = evaluateStructuralSystemTopology(base({ edges: [edge({ edgeId: "e-near", authority: "EXPLICIT_GOVERNED_MODEL", originHint: "PROXIMITY" })] }));
    expect(proximity.governedEdgeIds).not.toContain("e-near");
    expect(proximity.findings.map((row) => row.code)).toContain("CANDIDATE_AUTHORITY_PROMOTION");
    const ai = confirmConnectivity(edge({ edgeId: "e-candidate", authority: "UNCONFIRMED_CANDIDATE" }), { actor: "AI", explicit: true });
    const automatic = confirmConnectivity(edge({ edgeId: "e-candidate", authority: "UNCONFIRMED_CANDIDATE" }), { actor: "AUTOMATIC", explicit: true });
    const humanConfirm = confirmConnectivity(edge({ edgeId: "e-candidate", authority: "UNCONFIRMED_CANDIDATE" }), { actor: "HUMAN", explicit: true });
    expect(ai.ok).toBe(false);
    expect(automatic.ok).toBe(false);
    expect(humanConfirm.ok).toBe(true);
    if (humanConfirm.ok) expect(humanConfirm.edge.authority).toBe("HUMAN_CONFIRMED");
    expect(D1F_R1_AI_CAN_CONFIRM_CONNECTIVITY).toBe(false);
    expect(D1F_R1_AUTOMATIC_CONFIRMATION).toBe(false);
    expect(D1F_R1_UNCONFIRMED_CONNECTIVITY_CAN_GOVERN).toBe(false);
    expect(D1F_R1_PROXIMITY_ONLY_CONNECTIVITY_CAN_GOVERN).toBe(false);
    expect(D1F_R1_LLM_CONNECTIVITY_CAN_GOVERN).toBe(false);
    expect(UNCONFIRMED_CANDIDATE_CAN_GOVERN).toBe(false);
    expect(AI_TOPOLOGY_AUTHORITY).toBe(false);
    expect(AI_CONNECTIVITY_AUTHORITY).toBe(false);
  });

  it("requires explicit restraints, releases, spring units, and refuses inferred releases", () => {
    const local = { systemId: "member-axis", kind: "MEMBER_LOCAL", authority: "HUMAN_AUTHORED", provenanceRef: "prov-axis", sourceOrigin: "MANUAL_HUMAN_INPUT" as const };
    const support = {
      supportId: "s1",
      projectId: "project-1",
      nodeRef: "n1",
      memberRef: null,
      supportType: "PINNED",
      restraints: [{ axis: "UX", state: "FIXED" as const, springValue: null, springUnit: null, valueInvented: false }],
      authority: "HUMAN_CONFIRMED",
      provenanceRef: "prov-s1",
      sourceOrigin: "MANUAL_HUMAN_INPUT" as const,
      status: "GOVERNED",
    };
    const pinned = evaluateStructuralSystemTopology(base({
      supports: [support],
      signConvention: sign,
      connections: [{
        connectionId: "c1",
        projectId: "project-1",
        connectedMemberIds: ["m1"],
        classification: "PINNED",
        impliesRelease: false,
        authority: "HUMAN_CONFIRMED",
        provenanceRef: "prov-c1",
        sourceOrigin: "MANUAL_HUMAN_INPUT",
        status: "GOVERNED",
      }],
      coordinateSystems: [...base().coordinateSystems, local],
    }));
    expect(pinned.completenessState).toBe("TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE");
    expect(pinned.findings.map((row) => row.code)).not.toContain("RELEASE_INFERRED");
    expect(codes(base({
      supports: [{ ...support, nodeRef: "missing" }],
      signConvention: sign,
    }))).toContain("UNKNOWN_SUPPORT_REFERENCE");
    expect(codes(base({
      supports: [{ ...support, restraints: [{ axis: "AMBIGUOUS", state: "FIXED", springValue: null, springUnit: null, valueInvented: false }] }],
      signConvention: sign,
    }))).toContain("INVALID_RESTRAINT");
    expect(codes(base({
      supports: [{ ...support, restraints: [{ axis: "UY", state: "SPRING", springValue: 12, springUnit: null, valueInvented: false }] }],
      signConvention: sign,
    }))).toContain("SPRING_UNIT_MISSING");
    expect(codes(base({
      supports: [{ ...support, restraints: [{ axis: "UY", state: "SPRING", springValue: null, springUnit: "kN/m", valueInvented: true }] }],
      signConvention: sign,
    }))).toContain("SPRING_VALUE_INVENTED");
    expect(codes(base({
      releases: [{
        releaseId: "r1",
        memberId: "m1",
        end: "MID",
        releasedAxes: ["RY"],
        localAxisRef: "member-axis",
        inferredFromConnectionType: false,
        inferredFromBimSymbol: false,
        inferredFromMemberType: false,
        authority: "HUMAN_CONFIRMED",
        provenanceRef: "prov-r1",
        sourceOrigin: "MANUAL_HUMAN_INPUT",
      }],
      coordinateSystems: [...base().coordinateSystems, local],
      signConvention: sign,
    }))).toContain("INVALID_RELEASE_END");
    expect(codes(base({
      releases: [{
        releaseId: "r1",
        memberId: "m1",
        end: "START",
        releasedAxes: ["RY"],
        localAxisRef: null,
        inferredFromConnectionType: false,
        inferredFromBimSymbol: false,
        inferredFromMemberType: false,
        authority: "HUMAN_CONFIRMED",
        provenanceRef: "prov-r1",
        sourceOrigin: "MANUAL_HUMAN_INPUT",
      }],
      signConvention: sign,
    }))).toContain("MISSING_RELEASE_AXIS");
    expect(codes(base({
      releases: [{
        releaseId: "r1",
        memberId: "m1",
        end: "END",
        releasedAxes: ["RX"],
        localAxisRef: "member-axis",
        inferredFromConnectionType: true,
        inferredFromBimSymbol: true,
        inferredFromMemberType: true,
        authority: "HUMAN_CONFIRMED",
        provenanceRef: "prov-r1",
        sourceOrigin: "MANUAL_HUMAN_INPUT",
      }],
      coordinateSystems: [...base().coordinateSystems, local],
      signConvention: sign,
    }))).toContain("RELEASE_INFERRED");
    expect(codes(base({
      connections: [{
        connectionId: "c1",
        projectId: "project-1",
        connectedMemberIds: ["missing"],
        classification: "BOLTED",
        impliesRelease: true,
        authority: "HUMAN_CONFIRMED",
        provenanceRef: "prov-c1",
        sourceOrigin: "MANUAL_HUMAN_INPUT",
        status: "GOVERNED",
      }],
    }))).toEqual(expect.arrayContaining(["CONNECTION_TYPE_IMPLIES_RELEASE", "CONNECTION_MEMBER_MISSING"]));
    expect(D1F_R1_SUPPORT_STIFFNESS_CALCULATED).toBe(false);
    expect(D1F_R1_SPRING_VALUE_INVENTED).toBe(false);
    expect(D1F_R1_SPRING_UNIT_REQUIRED).toBe(true);
    expect(D1F_R1_CONNECTION_TYPE_IMPLIES_RELEASE).toBe(false);
    expect(D1F_R1_CONNECTION_CAPACITY_CALCULATED).toBe(false);
    expect(D1F_R1_BOLT_DESIGN_IMPLEMENTED).toBe(false);
    expect(D1F_R1_WELD_DESIGN_IMPLEMENTED).toBe(false);
    expect(D1F_R1_BASE_PLATE_DESIGN_IMPLEMENTED).toBe(false);
    expect(AI_RELEASE_AUTHORITY).toBe(false);
    expect(AI_SUPPORT_AUTHORITY).toBe(false);
  });

  it("fails closed on axes, units, and implicit solver conventions", () => {
    expect(codes(base({
      transforms: [{
        transformId: "t-ui",
        fromSystem: "global-cs",
        toSystem: "global-cs",
        methodRef: "UI_ORIENTATION",
        version: "1",
        authority: "HUMAN_AUTHORED",
        provenanceRef: "prov-t",
      }],
    }))).toContain("UI_ORIENTATION_AXIS");
    expect(codes(base({
      transforms: [{
        transformId: "t-missing",
        fromSystem: "missing",
        toSystem: "global-cs",
        methodRef: "RIGID",
        version: "1",
        authority: "HUMAN_AUTHORED",
        provenanceRef: "prov-t",
      }],
    }))).toContain("INVALID_TRANSFORM_REFERENCE");
    expect(codes(base({ directionalSemanticsPresent: true, signConvention: { ...sign, solverNameAssumed: true } }))).toContain("MISSING_SIGN_CONVENTION");
    expect(D1F_R1_IMPLICIT_SIGN_CONVENTION_ALLOWED).toBe(false);
    expect(AI_AXIS_AUTHORITY).toBe(false);
    expect(PARALLEL_UNIT_ENGINE_CREATED).toBe(false);
  });

  it("reports coincident nodes, orphans, and disconnected groups without merging or analysing", () => {
    const coincident = evaluateStructuralSystemTopology(base({ nodes: [node("n1", 0), node("n2", 0)] }));
    expect(coincident.governedNodeIds).toEqual(["n1", "n2"]);
    expect(coincident.findings.map((row) => row.code)).toContain("COINCIDENT_NODE_ADVISORY");
    const orphan = evaluateStructuralSystemTopology(base({ nodes: [node("n1", 0), node("n2", 6), node("n3", 9)] }));
    expect(orphan.anomalies.orphanNodeIds).toContain("n3");
    const split = evaluateStructuralSystemTopology(base({
      members: [member("m1", "n1", "n2"), member("m2", "n3", "n4")],
      nodes: [node("n1", 0), node("n2", 6), node("n3", 20), node("n4", 26)],
    }));
    expect(split.connectedComponentCount).toBe(2);
    expect(split.findings.map((row) => row.code)).toContain("DISCONNECTED_PHYSICAL_GROUPS");
    expect(split.completenessState).toBe("TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE");
    const unused = evaluateStructuralSystemTopology(base({
      supports: [{
        supportId: "s-orphan",
        projectId: "project-1",
        nodeRef: "n3",
        memberRef: null,
        supportType: "ROLLER",
        restraints: [],
        authority: "HUMAN_CONFIRMED",
        provenanceRef: "prov-s",
        sourceOrigin: "MANUAL_HUMAN_INPUT",
        status: "GOVERNED",
      }],
      nodes: [node("n1", 0), node("n2", 6), node("n3", 9)],
    }));
    expect(unused.anomalies.unusedSupportIds).toContain("s-orphan");
    expect(D1F_R1_AUTO_MERGE_COINCIDENT_NODES).toBe(false);
    expect(AI_NODE_MERGE_AUTHORITY).toBe(false);
    expect(D1F_R1_CONNECTED_COMPONENT_EQUALS_LOAD_PATH).toBe(false);
  });

  it("rejects non-governing mappings and does not execute design or analysis", () => {
    const element = { elementId: "a1", stiffnessImplemented: false, responseImplemented: false };
    const valid = evaluateStructuralSystemTopology(base({
      analyticalElements: [element],
      analyticalMappings: [{
        mappingId: "map-1",
        physicalMemberIds: ["m1"],
        analyticalElementIds: ["a1"],
        cardinality: "ONE_TO_ONE",
        authority: "HUMAN_CONFIRMED",
        exclusiveOneToOneAssumed: false,
      }],
      designMappings: [{
        mappingId: "design-1",
        analyticalElementId: "a1",
        designMemberId: "steel-1",
        target: "D1D_STEEL_MEMBER",
        authority: "HUMAN_CONFIRMED",
        steelCheckExecuted: false,
        concreteCheckExecuted: false,
      }],
    }));
    expect(valid.completenessState).toBe("TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE");
    expect(valid.mappingCount).toBe(2);
    expect(codes(base({
      analyticalMappings: [{
        mappingId: "map-ai",
        physicalMemberIds: ["m1"],
        analyticalElementIds: ["missing"],
        cardinality: "ONE_TO_MANY",
        authority: "UNCONFIRMED_CANDIDATE",
        exclusiveOneToOneAssumed: false,
      }],
    }))).toContain("MAPPING_NOT_GOVERNING");
    expect(codes(base({
      analyticalElements: [element],
      analyticalMappings: [{
        mappingId: "map-missing",
        physicalMemberIds: ["missing-member"],
        analyticalElementIds: ["a1"],
        cardinality: "MANY_TO_ONE",
        authority: "GOVERNED_IMPORTED",
        exclusiveOneToOneAssumed: false,
      }],
    }))).toContain("MAPPING_MISSING_OBJECT");
    expect(codes(base({
      analyticalElements: [{ elementId: "a1", stiffnessImplemented: true, responseImplemented: true }],
    }))).toContain("ANALYTICAL_BEHAVIOR_FORBIDDEN");
    expect(codes(base({
      analyticalElements: [element],
      designMappings: [{
        mappingId: "design-check",
        analyticalElementId: "a1",
        designMemberId: "conc-1",
        target: "D1E_CONCRETE_MEMBER",
        authority: "HUMAN_AUTHORED",
        steelCheckExecuted: true,
        concreteCheckExecuted: true,
      }],
    }))).toContain("DESIGN_CHECK_EXECUTED");
    expect(codes(base({
      loadPaths: [{ annotationId: "lp-ai", authority: "HUMAN_CONFIRMED", declaredBy: "AI", relationshipRefs: ["m1"] }],
    }))).toContain("LOAD_PATH_NOT_GOVERNING");
    const humanPath = evaluateStructuralSystemTopology(base({
      loadPaths: [{ annotationId: "lp-human", authority: "HUMAN_AUTHORED", declaredBy: "HUMAN", relationshipRefs: ["m1"] }],
    }));
    expect(humanPath.completenessState).toBe("TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE");
    expect(humanPath.analysisReady).toBe(false);
    expect(AI_MAPPING_CAN_GOVERN).toBe(false);
    expect(AI_MAPPING_AUTHORITY).toBe(false);
    expect(AI_LOAD_PATH_AUTHORITY).toBe(false);
    expect(D1F_R1_LOAD_PATH_ANNOTATION_FROM_AI_GOVERNING).toBe(false);
    expect(D1F_R1_LOAD_PATH_ANNOTATION_EQUALS_ANALYSIS).toBe(false);
    expect(D1F_R1_ANALYTICAL_ELEMENT_STIFFNESS_IMPLEMENTED).toBe(false);
    expect(D1F_R1_ANALYTICAL_ELEMENT_RESPONSE_IMPLEMENTED).toBe(false);
    expect(D1F_R1_STEEL_DESIGN_CHECK_EXECUTED).toBe(false);
    expect(D1F_R1_CONCRETE_DESIGN_CHECK_EXECUTED).toBe(false);
    expect(D1F_R1_LOAD_DISTRIBUTION_IMPLEMENTED).toBe(false);
    expect(D1F_R1_MEMBER_FORCE_CALCULATION_IMPLEMENTED).toBe(false);
  });

  it("keeps the governed fingerprint deterministic and excludes candidates and UI state", () => {
    const first = evaluateStructuralSystemTopology(base());
    const reordered = evaluateStructuralSystemTopology(base({
      members: [member("m1", "n1", "n2")],
      nodes: [node("n2", 6), node("n1", 0)],
      uiSelection: "m1",
      viewport: "iso",
      displayColor: "blue",
    }));
    expect(reordered.topologyFingerprint).toBe(first.topologyFingerprint);
    const candidateKind = evaluateStructuralSystemTopology(base({
      members: [member("m1", "n1", "n2", { candidateMemberKind: "COLUMN" })],
      edges: [edge({ edgeId: "e-candidate", authority: "UNCONFIRMED_CANDIDATE", originHint: "LLM" })],
    }));
    expect(candidateKind.topologyFingerprint).toBe(first.topologyFingerprint);
    expect(candidateKind.candidateFingerprint).not.toBe(first.candidateFingerprint);
    expect(CANDIDATE_CONNECTIVITY_INCLUDED_IN_GOVERNED_FINGERPRINT).toBe(false);
    expect(D1F_R1_UI_STATE_AFFECTS_TOPOLOGY_FINGERPRINT).toBe(false);
    const moved = evaluateStructuralSystemTopology(base({ nodes: [node("n1", 1), node("n2", 6)] }));
    const supported = evaluateStructuralSystemTopology(base({
      supports: [{
        supportId: "s1",
        projectId: "project-1",
        nodeRef: "n1",
        memberRef: null,
        supportType: "PINNED",
        restraints: [{ axis: "UX", state: "FIXED", springValue: null, springUnit: null, valueInvented: false }],
        authority: "HUMAN_CONFIRMED",
        provenanceRef: "prov-s1",
        sourceOrigin: "MANUAL_HUMAN_INPUT",
        status: "GOVERNED",
      }],
      signConvention: sign,
    }));
    const released = evaluateStructuralSystemTopology(base({
      coordinateSystems: [...base().coordinateSystems, { systemId: "member-axis", kind: "MEMBER_LOCAL", authority: "HUMAN_AUTHORED", provenanceRef: "prov-axis", sourceOrigin: "MANUAL_HUMAN_INPUT" }],
      releases: [{
        releaseId: "r1",
        memberId: "m1",
        end: "START",
        releasedAxes: ["RY"],
        localAxisRef: "member-axis",
        inferredFromConnectionType: false,
        inferredFromBimSymbol: false,
        inferredFromMemberType: false,
        authority: "HUMAN_CONFIRMED",
        provenanceRef: "prov-r1",
        sourceOrigin: "MANUAL_HUMAN_INPUT",
      }],
      signConvention: sign,
    }));
    const connected = evaluateStructuralSystemTopology(base({
      members: [member("m1", "n1", "n2"), member("m2", "n2", "n1", { memberKind: "BRACE" })],
      edges: [edge({ edgeId: "e-gov", authority: "HUMAN_CONFIRMED", fromId: "m1", toId: "m2" })],
    }));
    expect(moved.topologyFingerprint).not.toBe(first.topologyFingerprint);
    expect(supported.topologyFingerprint).not.toBe(first.topologyFingerprint);
    expect(released.topologyFingerprint).not.toBe(first.topologyFingerprint);
    expect(connected.topologyFingerprint).not.toBe(first.topologyFingerprint);
    expect(evaluateStructuralSystemTopology(base()).topologyFingerprint).toBe(first.topologyFingerprint);
    expect(evaluateStructuralSystemTopology(base()).findings).toEqual(first.findings);
    expect(evaluateStructuralSystemTopology(base()).completenessState).toBe(first.completenessState);
  });

  it("invalidates future analysis and preserves history, provenance, and project binding", () => {
    const current = evaluateStructuralSystemTopology(base());
    const movedInput = base({ nodes: [node("n1", 2), node("n2", 6)], topologyVersion: "t2" });
    const revised = reviseStructuralTopology(current, movedInput);
    expect(current.systemStatus).toBe("GOVERNED");
    expect(revised.prior.systemStatus).toBe("SUPERSEDED");
    expect(revised.current.invalidatesFutureAnalysis).toBe(true);
    expect(revised.current.events).toEqual(expect.arrayContaining(["TOPOLOGY_CHANGED", "NODE_CHANGED", "TOPOLOGY_INVALIDATED"]));
    expect(() => assertTopologyFingerprintCurrent(revised.current.topologyFingerprint, current.topologyFingerprint)).toThrow(/stale topology fingerprint/);
    const systemFact = revised.current.provenance.find((row) => row.subjectType === "STRUCTURAL_SYSTEM");
    expect(systemFact).toMatchObject({
      sourceOrigin: "MANUAL_HUMAN_INPUT",
      structuralSystemId: "ss-1",
      revision: "t2",
    });
    const cross = evaluateStructuralSystemTopology(base({ nodes: [node("n1", 0, { projectId: "other-project", authority: "HUMAN_CONFIRMED" }), node("n2", 6)] }));
    expect(cross.findings.map((row) => row.code)).toContain("CROSS_PROJECT_BINDING");
    expect(CROSS_PROJECT_TOPOLOGY_BINDING_ALLOWED).toBe(false);
    expect(TOPOLOGY_AUTHORITY_STATE_BYPASSES_AUTHORIZATION).toBe(false);
    expect(D1F_R1_HISTORICAL_TOPOLOGY_REPRODUCIBLE).toBe(true);
    expect(D1F_R1_NEW_TOPOLOGY_REVISION_OVERWRITES_HISTORY).toBe(false);
    expect(D1F_R1_TOPOLOGY_CHANGE_CAN_INVALIDATE_FUTURE_ANALYSIS).toBe(true);
    expect(D1F_R1_TOPOLOGY_CHANGE_SILENTLY_REUSES_ANALYSIS).toBe(false);
    expect(D1F_R1_EVENT_EQUALS_ENGINEERING_APPROVAL).toBe(false);
    expect(D1F_R1_AI_CANDIDATE_STATE_GOVERNED).toBe(false);
  });

  it("rejects inferred member types and keeps analysis, design, and AI authority closed", () => {
    expect(codes(base({ members: [member("m1", "n1", "n2", { memberTypeInferredByLlm: true })] }))).toContain("MEMBER_TYPE_INFERRED");
    expect(codes(base({ members: [member("m1", "n1", "n2", { memberTypeInferredFromGeometryOnly: true })] }))).toContain("MEMBER_TYPE_INFERRED");
    expect(codes(base({ members: [member("m1", "n1", "n2", { authority: "NOT_AN_AUTHORITY" })] }))).toContain("INVALID_AUTHORITY");
    expect(D1F_R1_MEMBER_TYPE_INFERRED_BY_LLM).toBe(false);
    expect(D1F_R1_MEMBER_TYPE_INFERRED_FROM_GEOMETRY_ONLY).toBe(false);
    expect(D1F_R1_TOPOLOGY_EQUALS_ANALYSIS).toBe(false);
    expect(D1F_R1_SUPPORT_RECORD_EQUALS_STRUCTURAL_RESPONSE).toBe(false);
    expect(D1F_R1_RUNTIME_FOUNDATION_EQUALS_STRUCTURAL_SOLVER).toBe(false);
    expect(D1F_R1_TOPOLOGY_COMPLETE_EQUALS_ANALYSIS_READY).toBe(false);
    expect(D1F_R1_TOPOLOGY_COMPLETE_EQUALS_DESIGN_READY).toBe(false);
    expect(D1F_R1_TOPOLOGY_RESULT_EQUALS_STRUCTURAL_ADEQUACY).toBe(false);
    expect(D1F_R1_TOPOLOGY_RESULT_EQUALS_STRUCTURAL_DESIGN).toBe(false);
    expect(D1F_R1_TOPOLOGY_RESULT_EQUALS_ANALYSIS_VALIDATION).toBe(false);
    expect(MATRIX_STIFFNESS_IMPLEMENTED).toBe(false);
    expect(FRAME_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(TRUSS_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(FEA_IMPLEMENTED).toBe(false);
    expect(PDELTA_IMPLEMENTED).toBe(false);
    expect(EIGENVALUE_IMPLEMENTED).toBe(false);
    expect(MODAL_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(DYNAMIC_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(SHELL_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(PLATE_ANALYSIS_IMPLEMENTED).toBe(false);
    expect(D1F_R1_N_CALCULATED).toBe(false);
    expect(D1F_R1_V_CALCULATED).toBe(false);
    expect(D1F_R1_M_CALCULATED).toBe(false);
    expect(D1F_R1_T_CALCULATED).toBe(false);
    expect(D1F_R1_REACTION_CALCULATED).toBe(false);
    expect(D1F_R1_DISPLACEMENT_CALCULATED).toBe(false);
    expect(D1F_R1_CONNECTION_DESIGN_IMPLEMENTED).toBe(false);
    expect(D1F_R1_FOUNDATION_DESIGN_IMPLEMENTED).toBe(false);
    expect(AI_STRUCTURAL_SYSTEM_AUTHORITY).toBe(false);
    expect(AI_ENGINEERING_ACCEPTANCE_AUTHORITY).toBe(false);
    expect(D1F_R1_RELEASE_FROM_CONNECTION_TYPE_INFERRED).toBe(false);
    expect(D1F_R1_RELEASE_FROM_BIM_SYMBOL_INFERRED).toBe(false);
    expect(D1F_R1_RELEASE_FROM_MEMBER_TYPE_INFERRED).toBe(false);
    expect(D1F_R1_MATURITY_STATE).toBe("RUNTIME_TOPOLOGY_FOUNDATION_IMPLEMENTED");
    expect(D1F_R1_STRUCTURAL_SYSTEM_RUNTIME_FOUNDATION_COUNT).toBe(1);
    expect(D1F_R1_STRUCTURAL_ANALYSIS_METHOD_COUNT).toBe(0);
    expect(D1F_R1_MEMBER_DESIGN_METHOD_COUNT).toBe(0);
    expect(D1F_R1_SYSTEM_ORCHESTRATOR_COUNT).toBe(0);
  });

  it("does not introduce analysis formulas in the topology runtime", () => {
    const folder = join(ROOT, "packages/engineering-os/src/structural-systems");
    const files = readdirSync(folder)
      .filter((name) => name.endsWith(".ts") && !name.endsWith(".test.ts"))
      .map((name) => join(folder, name));
    files.push(join(ROOT, "packages/types/src/structural-systems-r1.ts"));
    files.push(join(ROOT, "docs/architecture/engineering-os/EOS_D1F_R1_STRUCTURAL_SYSTEM_CONTEXT_TOPOLOGY.md"));
    const hits = files.flatMap((file) => {
      if (!statSync(file).isFile()) return [];
      return scanAnalysisFormulaBypass(file, readFileSync(file, "utf8"));
    });
    expect(hits).toEqual([]);
  });
});
