/**
 * EOS-D1F-R1 structural-system topology runtime.
 * Graph identity, authority, and validation only. No structural analysis.
 */

import { STRUCTURAL_MEMBER_KINDS } from "@rtb/types";
import type {
  D1fR1EdgeInput,
  D1fR1EventType,
  D1fR1Finding,
  D1fR1ProvenanceFact,
  D1fR1TopologyInput,
  D1fR1TopologyResult,
} from "@rtb/types";
import {
  D1F_COORDINATE_SYSTEMS,
  D1F_MAPPING_CARDINALITIES,
  D1F_R1_CONNECTIVITY_KINDS,
  D1F_R1_DOF_AXES,
  D1F_R1_FORBIDDEN_TOPOLOGY_STATUSES,
  D1F_R1_GOVERNING_AUTHORITIES,
  D1F_R1_STRUCTURAL_SYSTEM_STATUS_STATES,
  D1F_R1_TOPOLOGY_AUTHORITIES,
  D1F_SUPPORTED_DESIGN_BINDINGS,
} from "@rtb/types";
import { toLengthM } from "../structural-demand/units";
import { fingerprintStructuralSubject } from "./fingerprint";

const GOVERNING = new Set<string>(D1F_R1_GOVERNING_AUTHORITIES);
const AUTHORITIES = new Set<string>(D1F_R1_TOPOLOGY_AUTHORITIES);
const STATUSES = new Set<string>(D1F_R1_STRUCTURAL_SYSTEM_STATUS_STATES);
const MEMBER_KINDS = new Set<string>(STRUCTURAL_MEMBER_KINDS);
const DOF = new Set<string>(D1F_R1_DOF_AXES);
const EDGE_KINDS = new Set<string>(D1F_R1_CONNECTIVITY_KINDS);
const CS_KINDS = new Set<string>(D1F_COORDINATE_SYSTEMS);
const CARDINALITIES = new Set<string>(D1F_MAPPING_CARDINALITIES);
const DESIGN_TARGETS = new Set<string>(D1F_SUPPORTED_DESIGN_BINDINGS);
const TRANSLATION = new Set(["UX", "UY", "UZ"]);
const ROTATION = new Set(["RX", "RY", "RZ"]);

function governs(authority: string, originHint?: string | null): boolean {
  if (originHint === "PROXIMITY" || originHint === "LLM") return false;
  return GOVERNING.has(authority);
}

function acceptedLengthUnit(unit: string | null, sample: number): boolean {
  if (!unit?.trim() || unit === "SOLVER_DEFAULT") return false;
  const probe = Number.isFinite(sample) ? Math.abs(sample) : Number.NaN;
  try {
    toLengthM(probe, unit);
    return true;
  } catch {
    return false;
  }
}

function byId<T>(rows: readonly T[], key: keyof T): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const id = String(row[key]);
    grouped.set(id, [...(grouped.get(id) ?? []), row]);
  }
  return grouped;
}

export function evaluateStructuralSystemTopology(input: D1fR1TopologyInput): D1fR1TopologyResult {
  const findings: D1fR1Finding[] = [];
  const add = (code: string, severity: D1fR1Finding["severity"], subjectId: string, message: string) => {
    findings.push({ code, severity, subjectId, message });
  };

  const identityMissing = !input.structuralSystemId || !input.tenantId || !input.workspaceId || !input.projectId;
  if (!input.structuralSystemId) add("MISSING_SYSTEM_ID", "BLOCKING_INVALID_TOPOLOGY", "system", "structural system id is required");
  if (!input.tenantId || !input.workspaceId || !input.projectId) {
    add("MISSING_PROJECT_CONTEXT", "BLOCKING_INVALID_TOPOLOGY", "system", "tenant, workspace, and project are required");
  }
  if (!STATUSES.has(input.status) || (D1F_R1_FORBIDDEN_TOPOLOGY_STATUSES as readonly string[]).includes(input.status)) {
    add("INVALID_SYSTEM_STATUS", "BLOCKING_INVALID_TOPOLOGY", input.structuralSystemId || "system", "topology status cannot be an analysis or approval state");
  }
  if (!input.context?.contextId || input.context.discipline !== "structural" || input.context.projectId !== input.projectId) {
    add("CONTEXT_MISMATCH", "BLOCKING_INVALID_TOPOLOGY", input.context?.contextId ?? "context", "D1B structural context must match the system project");
  }
  if (!input.unitSystemRef) add("MISSING_UNIT_SYSTEM", "BLOCKING_INVALID_TOPOLOGY", "units", "a unit-system reference is required");
  if (!input.globalCoordinateSystemRef) add("MISSING_GLOBAL_COORDINATE_SYSTEM", "BLOCKING_INVALID_TOPOLOGY", "coordinates", "a global coordinate system is required");

  const coordinateById = byId(input.coordinateSystems, "systemId");
  for (const [id, rows] of coordinateById) {
    if (rows.length > 1) add("DUPLICATE_COORDINATE_SYSTEM", "BLOCKING_INVALID_TOPOLOGY", id, "coordinate system id is duplicated");
  }
  const globalCs = input.coordinateSystems.find((row) => row.systemId === input.globalCoordinateSystemRef);
  if (input.globalCoordinateSystemRef && (!globalCs || globalCs.kind !== "GLOBAL" || !CS_KINDS.has(globalCs.kind))) {
    add("INVALID_GLOBAL_COORDINATE_SYSTEM", "BLOCKING_INVALID_TOPOLOGY", input.globalCoordinateSystemRef, "global coordinate system reference does not resolve");
  }
  for (const system of input.coordinateSystems) {
    if (!CS_KINDS.has(system.kind)) add("INVALID_COORDINATE_SYSTEM", "BLOCKING_INVALID_TOPOLOGY", system.systemId, "coordinate system kind is not canonical");
    if (!AUTHORITIES.has(system.authority)) add("INVALID_AUTHORITY", "BLOCKING_INVALID_TOPOLOGY", system.systemId, "coordinate system authority is invalid");
  }

  for (const transform of input.transforms) {
    if (!transform.fromSystem || !transform.toSystem || !transform.methodRef || !transform.version || !transform.provenanceRef) {
      add("INVALID_TRANSFORM_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", transform.transformId, "transform reference is incomplete");
    }
    if (transform.methodRef === "UI_ORIENTATION") add("UI_ORIENTATION_AXIS", "BLOCKING_INVALID_TOPOLOGY", transform.transformId, "UI orientation does not define an engineering axis");
    if (!coordinateById.has(transform.fromSystem) || !coordinateById.has(transform.toSystem)) {
      add("INVALID_TRANSFORM_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", transform.transformId, "transform coordinate systems do not resolve");
    }
    if (!AUTHORITIES.has(transform.authority) || !governs(transform.authority)) {
      add("INVALID_AUTHORITY", "BLOCKING_INVALID_TOPOLOGY", transform.transformId, "transform authority cannot govern");
    }
  }

  const memberGroups = byId(input.members, "memberId");
  for (const [id, rows] of memberGroups) if (rows.length > 1) add("DUPLICATE_MEMBER_ID", "BLOCKING_INVALID_TOPOLOGY", id, "member id is duplicated");
  const nodeGroups = byId(input.nodes, "nodeId");
  for (const [id, rows] of nodeGroups) if (rows.length > 1) add("DUPLICATE_NODE_ID", "BLOCKING_INVALID_TOPOLOGY", id, "node id is duplicated");

  const nodeIds = new Set(input.nodes.map((row) => row.nodeId));
  const memberIds = new Set(input.members.map((row) => row.memberId));
  const supportIds = new Set(input.supports.map((row) => row.supportId));

  for (const node of input.nodes) {
    if (node.projectId !== input.projectId) add("CROSS_PROJECT_BINDING", "BLOCKING_INVALID_TOPOLOGY", node.nodeId, "node project does not match the structural system");
    if (!AUTHORITIES.has(node.authority)) add("INVALID_AUTHORITY", "BLOCKING_INVALID_TOPOLOGY", node.nodeId, "node authority is invalid");
    if (!node.coordinateSystemRef) add("MISSING_NODE_COORDINATE_SYSTEM", "BLOCKING_INVALID_TOPOLOGY", node.nodeId, "node coordinate system is required");
    else if (!coordinateById.has(node.coordinateSystemRef)) add("INVALID_COORDINATE_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", node.nodeId, "node coordinate system does not resolve");
    if (!acceptedLengthUnit(node.unit, node.x) || !acceptedLengthUnit(node.unit, node.y) || !acceptedLengthUnit(node.unit, node.z)) {
      add("INVALID_NODE_UNITS", "BLOCKING_INVALID_TOPOLOGY", node.nodeId, "node coordinates require an explicit accepted length unit");
    }
  }

  const governedNodes = input.nodes.filter((row) => governs(row.authority) && row.projectId === input.projectId);
  const coordinateKey = new Map<string, string[]>();
  for (const node of governedNodes) {
    if (!acceptedLengthUnit(node.unit, node.x)) continue;
    const key = `${node.x}|${node.y}|${node.z}|${node.unit}|${node.coordinateSystemRef}`;
    coordinateKey.set(key, [...(coordinateKey.get(key) ?? []), node.nodeId]);
  }
  for (const ids of coordinateKey.values()) {
    if (ids.length > 1) add("COINCIDENT_NODE_ADVISORY", "INFO", ids.join(","), "coincident coordinates are advisory and do not merge nodes");
  }

  for (const member of input.members) {
    if (member.projectId !== input.projectId) add("CROSS_PROJECT_BINDING", "BLOCKING_INVALID_TOPOLOGY", member.memberId, "member project does not match the structural system");
    if (!AUTHORITIES.has(member.authority)) add("INVALID_AUTHORITY", "BLOCKING_INVALID_TOPOLOGY", member.memberId, "member authority is invalid");
    if (member.memberTypeInferredByLlm || member.memberTypeInferredFromGeometryOnly) {
      add("MEMBER_TYPE_INFERRED", "BLOCKING_INVALID_TOPOLOGY", member.memberId, "member type must be explicit, governed imported, or human confirmed");
    }
    if (governs(member.authority) && !MEMBER_KINDS.has(member.memberKind)) {
      add("INVALID_MEMBER_TYPE", "BLOCKING_INVALID_TOPOLOGY", member.memberId, "governing member type is not a canonical member kind");
    }
    if (!member.startNodeId || !member.endNodeId) add("ORPHAN_MEMBER", "WARNING", member.memberId, "member has no topology endpoints");
    if (member.startNodeId && !nodeIds.has(member.startNodeId)) add("UNKNOWN_NODE_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", member.memberId, "member start node does not resolve");
    if (member.endNodeId && !nodeIds.has(member.endNodeId)) add("UNKNOWN_NODE_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", member.memberId, "member end node does not resolve");
    if (member.startNodeId && member.startNodeId === member.endNodeId) add("INVALID_MEMBER_NODE_CONFIGURATION", "BLOCKING_INVALID_TOPOLOGY", member.memberId, "member endpoints must be distinct nodes");
  }

  const governedMembers = input.members.filter((row) => governs(row.authority) && row.projectId === input.projectId && !row.memberTypeInferredByLlm && !row.memberTypeInferredFromGeometryOnly && MEMBER_KINDS.has(row.memberKind));
  const referencedNodes = new Set<string>();
  for (const member of governedMembers) {
    if (nodeIds.has(member.startNodeId)) referencedNodes.add(member.startNodeId);
    if (nodeIds.has(member.endNodeId)) referencedNodes.add(member.endNodeId);
  }

  const governedEdges: D1fR1EdgeInput[] = [];
  const candidateEdges: D1fR1EdgeInput[] = [];
  for (const edge of input.edges) {
    if (!EDGE_KINDS.has(edge.kind)) add("INVALID_CONNECTIVITY_KIND", "BLOCKING_INVALID_TOPOLOGY", edge.edgeId, "connectivity kind is not canonical");
    if (!AUTHORITIES.has(edge.authority)) add("INVALID_AUTHORITY", "BLOCKING_INVALID_TOPOLOGY", edge.edgeId, "connectivity authority is invalid");
    const illegalOrigin = edge.originHint === "PROXIMITY" || edge.originHint === "LLM";
    if (illegalOrigin && GOVERNING.has(edge.authority)) {
      add("CANDIDATE_AUTHORITY_PROMOTION", "BLOCKING_INVALID_TOPOLOGY", edge.edgeId, "proximity or AI connectivity cannot govern");
    }
    const governingEdge = governs(edge.authority, edge.originHint);
    if (governingEdge) governedEdges.push(edge);
    else candidateEdges.push(edge);
    if (governingEdge) {
      if (edge.kind === "MEMBER_TO_NODE" && (!memberIds.has(edge.fromId) || !nodeIds.has(edge.toId))) add("DANGLING_CONNECTIVITY", "BLOCKING_INVALID_TOPOLOGY", edge.edgeId, "member-to-node reference does not resolve");
      if (edge.kind === "MEMBER_TO_MEMBER" && (!memberIds.has(edge.fromId) || !memberIds.has(edge.toId))) add("DANGLING_CONNECTIVITY", "BLOCKING_INVALID_TOPOLOGY", edge.edgeId, "member-to-member reference does not resolve");
      if (edge.kind === "MEMBER_TO_SUPPORT" && (!memberIds.has(edge.fromId) || !supportIds.has(edge.toId))) add("UNKNOWN_SUPPORT_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", edge.edgeId, "member-to-support reference does not resolve");
      if (edge.kind === "CONNECTION_TO_MEMBER" && !memberIds.has(edge.toId)) add("CONNECTION_MEMBER_MISSING", "BLOCKING_INVALID_TOPOLOGY", edge.edgeId, "connection-to-member reference does not resolve");
    }
  }

  const directional = input.directionalSemanticsPresent || input.releases.length > 0 || input.supports.some((row) => row.restraints.length > 0);
  if (directional) {
    const sign = input.signConvention;
    if (!sign || sign.solverNameAssumed || !sign.forceSign || !sign.momentSign || !sign.memberEndConvention || !sign.localAxisOrientation || !sign.designMethodConvention) {
      add("MISSING_SIGN_CONVENTION", "BLOCKING_INVALID_TOPOLOGY", "sign", "directional topology semantics require an explicit sign convention");
    }
  }

  for (const support of input.supports) {
    if (support.projectId !== input.projectId) add("CROSS_PROJECT_BINDING", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "support project does not match the structural system");
    if (!AUTHORITIES.has(support.authority)) add("INVALID_AUTHORITY", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "support authority is invalid");
    if (governs(support.authority)) {
      if (!support.nodeRef && !support.memberRef) add("UNKNOWN_SUPPORT_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "support requires a node or member reference");
      if (support.nodeRef && !nodeIds.has(support.nodeRef)) add("UNKNOWN_SUPPORT_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "support node does not resolve");
      if (support.memberRef && !memberIds.has(support.memberRef)) add("UNKNOWN_SUPPORT_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "support member does not resolve");
      if (support.nodeRef && nodeIds.has(support.nodeRef) && !referencedNodes.has(support.nodeRef) && !support.memberRef) {
        add("UNUSED_SUPPORT", "WARNING", support.supportId, "support is not used by a governed member");
      }
    }
    for (const restraint of support.restraints) {
      if (!DOF.has(restraint.axis)) add("INVALID_RESTRAINT", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "restraint axis is not an explicit degree of freedom");
      const translation = TRANSLATION.has(restraint.axis);
      const rotation = ROTATION.has(restraint.axis);
      if (DOF.has(restraint.axis) && !translation && !rotation) add("INVALID_RESTRAINT", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "restraint dimension is ambiguous");
      if (restraint.state === "SPRING") {
        if (restraint.valueInvented || restraint.springValue == null || !Number.isFinite(restraint.springValue)) {
          add("SPRING_VALUE_INVENTED", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "spring stiffness must be an explicit governed value");
        }
        if (!restraint.springUnit?.trim() || restraint.springUnit === "SOLVER_DEFAULT") {
          add("SPRING_UNIT_MISSING", "BLOCKING_INVALID_TOPOLOGY", support.supportId, "spring value requires an explicit unit");
        }
      }
    }
  }

  for (const release of input.releases) {
    if (release.end !== "START" && release.end !== "END") add("INVALID_RELEASE_END", "BLOCKING_INVALID_TOPOLOGY", release.releaseId, "release end must be START or END");
    if (!release.localAxisRef) add("MISSING_RELEASE_AXIS", "BLOCKING_INVALID_TOPOLOGY", release.releaseId, "release local axis is required");
    else if (release.localAxisRef === "AMBIGUOUS" || release.localAxisRef === "UI_ORIENTATION" || !coordinateById.has(release.localAxisRef)) {
      add("INVALID_LOCAL_AXIS", "BLOCKING_INVALID_TOPOLOGY", release.releaseId, "release local axis does not resolve");
    }
    if (!memberIds.has(release.memberId)) add("UNKNOWN_MEMBER_REFERENCE", "BLOCKING_INVALID_TOPOLOGY", release.releaseId, "release member does not resolve");
    if (release.inferredFromConnectionType || release.inferredFromBimSymbol || release.inferredFromMemberType || !governs(release.authority)) {
      add("RELEASE_INFERRED", "BLOCKING_INVALID_TOPOLOGY", release.releaseId, "releases cannot be inferred or unconfirmed");
    }
    for (const axis of release.releasedAxes) if (!DOF.has(axis)) add("INVALID_RELEASE_AXIS", "BLOCKING_INVALID_TOPOLOGY", release.releaseId, "released axis is not explicit");
  }

  for (const connection of input.connections) {
    if (connection.projectId !== input.projectId) add("CROSS_PROJECT_BINDING", "BLOCKING_INVALID_TOPOLOGY", connection.connectionId, "connection project does not match the structural system");
    if (connection.impliesRelease) add("CONNECTION_TYPE_IMPLIES_RELEASE", "BLOCKING_INVALID_TOPOLOGY", connection.connectionId, "connection classification does not create a release");
    if (governs(connection.authority)) {
      if (connection.connectedMemberIds.length === 0) add("UNREFERENCED_CONNECTION", "WARNING", connection.connectionId, "connection has no members");
      for (const memberId of connection.connectedMemberIds) {
        if (!memberIds.has(memberId)) add("CONNECTION_MEMBER_MISSING", "BLOCKING_INVALID_TOPOLOGY", connection.connectionId, "connection member does not resolve");
      }
    }
  }

  for (const element of input.analyticalElements) {
    if (element.stiffnessImplemented || element.responseImplemented) {
      add("ANALYTICAL_BEHAVIOR_FORBIDDEN", "BLOCKING_INVALID_TOPOLOGY", element.elementId, "an analytical element in this runtime has identity only");
    }
  }
  const elementIds = new Set(input.analyticalElements.map((row) => row.elementId));
  for (const mapping of input.analyticalMappings) {
    if (!AUTHORITIES.has(mapping.authority)) add("INVALID_AUTHORITY", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "mapping authority is invalid");
    if (!governs(mapping.authority)) add("MAPPING_NOT_GOVERNING", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "physical-to-analytical mapping authority cannot govern");
    if (mapping.exclusiveOneToOneAssumed || !CARDINALITIES.has(mapping.cardinality)) add("INVALID_MAPPING_CARDINALITY", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "mapping cardinality is unsupported");
    if (mapping.physicalMemberIds.length === 0 || mapping.analyticalElementIds.length === 0) add("INVALID_MAPPING", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "mapping references are incomplete");
    for (const memberId of mapping.physicalMemberIds) if (!memberIds.has(memberId)) add("MAPPING_MISSING_OBJECT", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "mapping member does not resolve");
    for (const elementId of mapping.analyticalElementIds) if (!elementIds.has(elementId)) add("MAPPING_MISSING_OBJECT", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "mapping analytical element does not resolve");
  }
  for (const mapping of input.designMappings) {
    if (!governs(mapping.authority)) add("MAPPING_NOT_GOVERNING", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "design mapping authority cannot govern");
    if (!DESIGN_TARGETS.has(mapping.target)) add("INVALID_MAPPING", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "design mapping target is unsupported");
    if (!elementIds.has(mapping.analyticalElementId) || !mapping.designMemberId) add("MAPPING_MISSING_OBJECT", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "design mapping object does not resolve");
    if (mapping.steelCheckExecuted || mapping.concreteCheckExecuted) add("DESIGN_CHECK_EXECUTED", "BLOCKING_INVALID_TOPOLOGY", mapping.mappingId, "topology runtime does not execute member design checks");
  }
  for (const path of input.loadPaths) {
    if (path.declaredBy === "AI" || !governs(path.authority)) add("LOAD_PATH_NOT_GOVERNING", "BLOCKING_INVALID_TOPOLOGY", path.annotationId, "an AI load-path annotation cannot govern");
  }

  const requiredMembers = input.declaredMemberIds ?? governedMembers.map((row) => row.memberId);
  const requiredNodes = input.declaredNodeIds ?? governedNodes.map((row) => row.nodeId);
  for (const memberId of requiredMembers) {
    const member = input.members.find((row) => row.memberId === memberId);
    if (!member || !governedMembers.includes(member)) add("REQUIRED_MEMBER_NOT_GOVERNING", "WARNING", memberId, "declared member is missing or not governed");
  }
  for (const nodeId of requiredNodes) {
    const node = input.nodes.find((row) => row.nodeId === nodeId);
    if (!node || !governedNodes.includes(node)) add("REQUIRED_NODE_NOT_GOVERNING", "WARNING", nodeId, "declared node is missing or not governed");
  }

  const parent = new Map<string, string>();
  const find = (id: string): string => {
    const next = parent.get(id) ?? id;
    if (next === id) return id;
    const root = find(next);
    parent.set(id, root);
    return root;
  };
  const unite = (left: string, right: string) => {
    const a = find(left);
    const b = find(right);
    if (a !== b) parent.set(a, b);
  };
  for (const member of governedMembers) {
    parent.set(member.memberId, member.memberId);
    if (nodeIds.has(member.startNodeId) && nodeIds.has(member.endNodeId) && member.startNodeId !== member.endNodeId) {
      const sharers = governedMembers.filter((row) => row.startNodeId === member.startNodeId || row.endNodeId === member.startNodeId || row.startNodeId === member.endNodeId || row.endNodeId === member.endNodeId);
      for (const other of sharers) unite(member.memberId, other.memberId);
    }
  }
  for (const edge of governedEdges) {
    if (edge.kind === "MEMBER_TO_MEMBER") unite(edge.fromId, edge.toId);
  }
  const componentRoots = new Set(governedMembers.map((row) => find(row.memberId)));
  if (componentRoots.size > 1) add("DISCONNECTED_PHYSICAL_GROUPS", "INFO", input.structuralSystemId || "system", "multiple physical groups are topology, not a load path");

  const orphanNodeIds = governedNodes.filter((row) => !referencedNodes.has(row.nodeId)).map((row) => row.nodeId);
  for (const nodeId of orphanNodeIds) add("ORPHAN_NODE", "WARNING", nodeId, "governed node is not referenced by a governed member");
  const orphanMemberIds = governedMembers.filter((row) => !row.startNodeId || !row.endNodeId || !nodeIds.has(row.startNodeId) || !nodeIds.has(row.endNodeId)).map((row) => row.memberId);
  const unusedSupportIds = input.supports.filter((row) => governs(row.authority) && !!row.nodeRef && !referencedNodes.has(row.nodeRef)).map((row) => row.supportId);
  const unreferencedConnectionIds = input.connections.filter((row) => governs(row.authority) && row.connectedMemberIds.length === 0).map((row) => row.connectionId);

  const blocking = findings.filter((row) => row.severity === "BLOCKING_INVALID_TOPOLOGY").sort(compareFindings);
  const ordered = [...findings].sort(compareFindings);
  const warnings = ordered.filter((row) => row.severity === "WARNING").map((row) => row.message);
  let completenessState: D1fR1TopologyResult["completenessState"] = "TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE";
  const declaredScopeIncomplete = findings.some((row) => row.code === "REQUIRED_MEMBER_NOT_GOVERNING" || row.code === "REQUIRED_NODE_NOT_GOVERNING");
  if (identityMissing) completenessState = "TOPOLOGY_UNDETERMINED";
  else if (blocking.length > 0) completenessState = "TOPOLOGY_INVALID";
  else if (declaredScopeIncomplete || governedMembers.length === 0 || governedNodes.length === 0) completenessState = "TOPOLOGY_INCOMPLETE";

  const governedFingerprintPayload = {
    structuralSystemId: input.structuralSystemId,
    projectId: input.projectId,
    disciplineRef: input.disciplineRef,
    contextRef: input.context?.contextId ?? null,
    systemVersion: input.systemVersion,
    status: input.status,
    topologyVersion: input.topologyVersion,
    unitSystemRef: input.unitSystemRef,
    globalCoordinateSystemRef: input.globalCoordinateSystemRef,
    members: governedMembers.map(memberFingerprint).sort(byJson),
    nodes: governedNodes.map(nodeFingerprint).sort(byJson),
    edges: governedEdges.map(edgeFingerprint).sort(byJson),
    supports: input.supports.filter((row) => governs(row.authority)).map((row) => ({ ...row, restraints: [...row.restraints] })).sort(byJson),
    releases: input.releases.filter((row) => governs(row.authority)).sort(byJson),
    connections: input.connections.filter((row) => governs(row.authority)).sort(byJson),
    coordinateSystems: [...input.coordinateSystems].sort(byJson),
    transforms: [...input.transforms].sort(byJson),
    signConvention: input.signConvention,
    analyticalMappings: input.analyticalMappings.filter((row) => governs(row.authority)).sort(byJson),
    designMappings: input.designMappings.filter((row) => governs(row.authority)).sort(byJson),
  };
  const candidateFingerprintPayload = {
    structuralSystemId: input.structuralSystemId,
    edges: candidateEdges.map(edgeFingerprint).sort(byJson),
  };

  const provenance: D1fR1ProvenanceFact[] = [
    fact("STRUCTURAL_SYSTEM", input.structuralSystemId, input.provenanceRef, input.status, input.sourceOrigin, input),
    ...input.members.map((row) => fact("PHYSICAL_MEMBER", row.memberId, row.provenanceRef, row.authority, row.sourceOrigin, input)),
    ...input.nodes.map((row) => fact("NODE", row.nodeId, row.provenanceRef, row.authority, row.sourceOrigin, input)),
    ...input.supports.map((row) => fact("SUPPORT", row.supportId, row.provenanceRef, row.authority, row.sourceOrigin, input)),
    ...input.connections.map((row) => fact("CONNECTION", row.connectionId, row.provenanceRef, row.authority, row.sourceOrigin, input)),
    ...input.analyticalMappings.map((row) => fact("ANALYTICAL_MAPPING", row.mappingId, input.provenanceRef, row.authority, input.sourceOrigin, input)),
    ...input.designMappings.map((row) => fact("DESIGN_MAPPING", row.mappingId, input.provenanceRef, row.authority, input.sourceOrigin, input)),
  ];

  return {
    structuralSystemId: input.structuralSystemId,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    disciplineRef: input.disciplineRef,
    contextRef: input.context?.contextId ?? null,
    systemVersion: input.systemVersion,
    systemStatus: input.status,
    topologyVersion: input.topologyVersion,
    unitSystemRef: input.unitSystemRef,
    globalCoordinateSystemRef: input.globalCoordinateSystemRef,
    topologyFingerprint: fingerprintStructuralSubject("PHYSICAL_TOPOLOGY", governedFingerprintPayload),
    candidateFingerprint: fingerprintStructuralSubject("PHYSICAL_TOPOLOGY", candidateFingerprintPayload),
    memberCount: governedMembers.length,
    nodeCount: governedNodes.length,
    supportCount: input.supports.filter((row) => governs(row.authority)).length,
    connectionCount: input.connections.filter((row) => governs(row.authority)).length,
    governedConnectivityCount: governedEdges.length + governedMembers.filter((row) => nodeIds.has(row.startNodeId) && nodeIds.has(row.endNodeId)).length,
    candidateConnectivityCount: candidateEdges.length,
    connectedComponentCount: componentRoots.size,
    mappingCount: input.analyticalMappings.filter((row) => governs(row.authority)).length + input.designMappings.filter((row) => governs(row.authority)).length,
    findings: ordered,
    blockingFindings: blocking,
    warnings,
    anomalies: { orphanMemberIds, orphanNodeIds, unusedSupportIds, unreferencedConnectionIds },
    completenessState,
    analysisReady: false,
    designReady: false,
    structuralAdequacyClaimed: false,
    loadDistributionImplemented: false,
    invalidatesFutureAnalysis: false,
    provenance,
    events: ["SYSTEM_CREATED"],
    governedMemberIds: governedMembers.map((row) => row.memberId).sort(),
    governedNodeIds: governedNodes.map((row) => row.nodeId).sort(),
    governedEdgeIds: governedEdges.map((row) => row.edgeId).sort(),
    governedSupportIds: input.supports.filter((row) => governs(row.authority)).map((row) => row.supportId).sort(),
    governedReleaseIds: input.releases.filter((row) => governs(row.authority)).map((row) => row.releaseId).sort(),
    nodeStateKey: JSON.stringify(governedFingerprintPayload.nodes),
    supportStateKey: JSON.stringify(governedFingerprintPayload.supports),
    releaseStateKey: JSON.stringify(governedFingerprintPayload.releases),
    edgeStateKey: JSON.stringify(governedFingerprintPayload.edges),
  };
}

export function reviseStructuralTopology(prior: D1fR1TopologyResult, next: D1fR1TopologyInput): { prior: D1fR1TopologyResult; current: D1fR1TopologyResult } {
  const current = evaluateStructuralSystemTopology(next);
  const changed = current.topologyFingerprint !== prior.topologyFingerprint;
  const events: D1fR1EventType[] = [...current.events];
  if (changed) events.push("TOPOLOGY_CHANGED", "TOPOLOGY_INVALIDATED");
  if (added(current.governedMemberIds, prior.governedMemberIds)) events.push("MEMBER_ADDED");
  if (removed(current.governedMemberIds, prior.governedMemberIds)) events.push("MEMBER_REMOVED");
  if (current.nodeStateKey !== prior.nodeStateKey) events.push("NODE_CHANGED");
  if (current.supportStateKey !== prior.supportStateKey) events.push("SUPPORT_CHANGED");
  if (current.releaseStateKey !== prior.releaseStateKey) events.push("RELEASE_CHANGED");
  return {
    prior: { ...prior, systemStatus: "SUPERSEDED" },
    current: { ...current, events, invalidatesFutureAnalysis: changed },
  };
}

export function confirmConnectivity(
  edge: D1fR1EdgeInput,
  action: { actor: "HUMAN" | "AI" | "AUTOMATIC"; explicit: boolean },
): { ok: true; edge: D1fR1EdgeInput; event: "CONNECTIVITY_CONFIRMED" } | { ok: false; reason: string } {
  if (action.actor !== "HUMAN" || !action.explicit) return { ok: false, reason: "confirmation requires an explicit human action" };
  if (edge.authority !== "UNCONFIRMED_CANDIDATE") return { ok: false, reason: "only an unconfirmed candidate can be confirmed" };
  return { ok: true, edge: { ...edge, authority: "HUMAN_CONFIRMED", originHint: "EXPLICIT" }, event: "CONNECTIVITY_CONFIRMED" };
}

export function assertTopologyFingerprintCurrent(currentFingerprint: string, boundFingerprint: string): void {
  if (currentFingerprint !== boundFingerprint) throw new Error("stale topology fingerprint rejected");
}

function added(current: readonly string[], prior: readonly string[]): boolean {
  return current.some((id) => !prior.includes(id));
}

function removed(current: readonly string[], prior: readonly string[]): boolean {
  return prior.some((id) => !current.includes(id));
}

function fact(
  subjectType: string,
  subjectId: string,
  provenanceRef: string,
  authority: string,
  sourceOrigin: D1fR1ProvenanceFact["sourceOrigin"],
  input: D1fR1TopologyInput,
): D1fR1ProvenanceFact {
  return {
    subjectType,
    subjectId,
    provenanceRef,
    authority,
    sourceOrigin,
    structuralSystemId: input.structuralSystemId,
    revision: input.topologyVersion,
  };
}

function memberFingerprint(row: D1fR1TopologyInput["members"][number]) {
  return {
    memberId: row.memberId,
    memberKind: row.memberKind,
    startNodeId: row.startNodeId,
    endNodeId: row.endNodeId,
    sectionRef: row.sectionRef,
    materialRef: row.materialRef,
    authority: row.authority,
    status: row.status,
  };
}

function nodeFingerprint(row: D1fR1TopologyInput["nodes"][number]) {
  return {
    nodeId: row.nodeId,
    x: row.x,
    y: row.y,
    z: row.z,
    unit: row.unit,
    coordinateSystemRef: row.coordinateSystemRef,
    authority: row.authority,
  };
}

function edgeFingerprint(row: D1fR1EdgeInput) {
  return { edgeId: row.edgeId, kind: row.kind, fromId: row.fromId, toId: row.toId, authority: row.authority };
}

function byJson(left: unknown, right: unknown): number {
  const a = JSON.stringify(left);
  const b = JSON.stringify(right);
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

function compareFindings(left: D1fR1Finding, right: D1fR1Finding): number {
  return `${left.code}|${left.subjectId}|${left.severity}`.localeCompare(`${right.code}|${right.subjectId}|${right.severity}`);
}
