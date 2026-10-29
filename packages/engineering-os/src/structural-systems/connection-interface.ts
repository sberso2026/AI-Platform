import type { D1fR1ConnectionInput, D1fR1ReleaseInput, D1fR4Completeness, D1fR4ScopeState } from "@rtb/types";
import { fingerprintStructuralSubject } from "./fingerprint";

const GOVERNING = ["HUMAN_AUTHORED", "HUMAN_CONFIRMED", "GOVERNED_IMPORTED", "EXPLICIT_GOVERNED_MODEL"] as const;
const NON_GOVERNING_ORIGINS = ["PROXIMITY", "BIM_TOUCH", "AI_VISUAL", "LLM", "UNCONFIRMED_CANDIDATE"] as const;
const FAMILIES = ["SHEAR_CONNECTION", "MOMENT_CONNECTION", "BRACE_CONNECTION", "SPLICE", "BASE_CONNECTION", "CONCRETE_JOINT", "OTHER"] as const;
const COORDINATES = ["GLOBAL", "SYSTEM", "MEMBER_LOCAL", "CONNECTION_LOCAL", "ANALYSIS_PROVIDER_LOCAL"] as const;
const QUANTITIES = ["N", "V_MAJOR", "V_MINOR", "M_MAJOR", "M_MINOR", "T"] as const;
const FORBIDDEN_SELECTION = ["MAX_ABS", "SUM", "ENVELOPE", "CROSS_COMBINATION", "VECTOR_SUM"];

export type D1fR4MemberEnd = {
  memberEndId: string;
  projectId: string;
  physicalMemberId: string;
  designMemberId: string | null;
  analyticalElementId: string | null;
  memberEnd: string;
  nodeId: string;
  localCoordinateSystemId: string | null;
  orientation: string | null;
  orientationGuessed: boolean;
  provenanceRef: string;
};

export type D1fR4Component = {
  quantity: (typeof QUANTITIES)[number];
  presence: "PRESENT" | "ABSENT" | "EXPLICIT_ZERO";
  value: number | null;
};

export type D1fR4EndAction = {
  bindingId: string;
  projectId: string;
  structuralSystemId: string;
  memberEndId: string;
  authority: string;
  completenessState: string;
  runStatus: string;
  convergenceStatus: string;
  modelValidationEvidenceRef: string | null;
  loadCaseId: string | null;
  combinationId: string | null;
  locationKind: string | null;
  coordinateKind: string | null;
  coordinateMappingRef: string | null;
  signConventionRef: string | null;
  signConversionsApplied: number;
  topologyFingerprint: string;
  analysisModelFingerprint: string;
  resultSetFingerprint: string;
  bindingFingerprint: string;
  rawUnnormalized: boolean;
  components: readonly D1fR4Component[];
};

export type D1fR4AnalyticalJoint = {
  analyticalJointId: string;
  projectId: string;
  analysisModelId: string;
  nodeId: string;
  connectedEnds: readonly { analyticalElementId: string; memberEnd: string; orientation: string }[];
  coordinateSystemRef: string | null;
  mappingAuthority: string;
  provenanceRef: string;
};

export type D1fR4DesignConnection = {
  designConnectionId: string;
  projectId: string;
  physicalConnectionId: string;
  profileId: string | null;
  family: (typeof FAMILIES)[number] | null;
  requiredScope: readonly string[];
  memberEndIds: readonly string[];
  actionContextRefs: readonly string[];
  authority: string;
  status: string;
  provenanceRef: string;
  inferredByLlm: boolean;
  inferredFromGeometry: boolean;
  inferredFromForcePattern: boolean;
  familyDefinesStiffness: boolean;
  familyDefinesRelease: boolean;
  familyDefinesCapacity: boolean;
};

export type D1fR4JointMapping = {
  mappingId: string;
  projectId: string;
  physicalConnectionId: string;
  analyticalJointIds: readonly string[];
  authority: string;
  provenanceRef: string;
};

export type D1fR4ConnectionInput = {
  projectId: string;
  structuralSystemId: string;
  physicalConnection: D1fR1ConnectionInput & {
    structuralSystemId: string;
    entityKind: "PHYSICAL_CONNECTION" | "SUPPORT_CONNECTION" | "FOUNDATION_INTERFACE_CONNECTION";
    connectedMemberEndIds: readonly string[];
    nodeId: string | null;
    version: string;
    topologyFingerprint: string;
    sourceHint: string;
    profileId: string | null;
  };
  memberEnds: readonly D1fR4MemberEnd[];
  analyticalJoints: readonly D1fR4AnalyticalJoint[];
  designConnection: D1fR4DesignConnection | null;
  jointMapping: D1fR4JointMapping | null;
  releases: readonly D1fR1ReleaseInput[];
  endActions: readonly D1fR4EndAction[];
  selectionRequest: string | null;
  synthesizeCombinationIds: readonly string[];
  connectionLocalAxisInferred: boolean;
  transferPathInferredByAi: boolean;
  transferPathInferredFromType: boolean;
  currentTopologyFingerprint: string;
  currentProfileId: string | null;
  currentReleaseFingerprint: string;
  connectionRequiredByScope: boolean;
  r3MemberSatisfied: boolean;
  supportId: string | null;
  reactionRefs: readonly string[];
};

export type D1fR4ForceTransfer = {
  forceTransferContextId: string;
  connectionId: string;
  bindingIds: readonly string[];
  combinationIds: readonly string[];
  loadCaseIds: readonly string[];
  memberEndActionSets: readonly D1fR4EndAction[];
  aggregatedDemand: null;
  fingerprint: string;
  canGovern: boolean;
};

export type D1fR4ConnectionResult = {
  connectionInterfaceResultId: string;
  connectionId: string;
  structuralSystemId: string;
  physicalConnectionId: string;
  analyticalJointIds: readonly string[];
  designConnectionId: string | null;
  memberEndIds: readonly string[];
  forceTransfer: D1fR4ForceTransfer | null;
  profileId: string | null;
  authority: string;
  findings: readonly string[];
  blockingFindings: readonly string[];
  completenessState: D1fR4Completeness;
  scopeState: D1fR4ScopeState;
  designAvailabilityState: "NOT_IMPLEMENTED";
  connectionPass: false;
  connectionAdequate: false;
  designComplete: false;
  equilibriumDiagnostic: "DEFERRED_NON_GOVERNING_DIAGNOSTIC";
  equilibriumEqualsDesignDemand: false;
  memberPassHidesConnectionGap: false;
  supportRestraintEqualsCapacity: false;
  steelInterface: { materialDomain: "STEEL"; resistanceComputed: false } | null;
  concreteInterface: { materialDomain: "CONCRETE"; jointDesignComputed: false } | null;
  baseInterface: { supportId: string | null; reactionRefs: readonly string[]; designComputed: false } | null;
  provenance: readonly string[];
  fingerprint: string;
  forceTransferFingerprint: string | null;
  warnings: readonly string[];
  events: readonly { type: string; subjectId: string; approval: false }[];
  r3ResultsRewritten: false;
  supportIdentity: string | null;
};

function sortIds(values: readonly string[]): string[] {
  return [...values].sort();
}

function completeness(findings: readonly string[]): D1fR4Completeness {
  if (findings.some((item) => ["STALE_TOPOLOGY", "STALE_BINDING", "STALE_PROFILE", "STALE_RELEASE", "STALE_MAPPING"].includes(item))) {
    return "CONNECTION_INTERFACE_STALE";
  }
  if (findings.some((item) => ["AUTHORITY_NOT_GOVERNING", "PROXIMITY_CONNECTION", "CROSS_PROJECT", "CONNECTION_TYPE_IMPLIES_RELEASE", "RELEASE_IMPLIES_CONNECTION_TYPE", "MAPPING_AUTHORITY_MISSING", "AI_MAPPING", "FAMILY_DEFINES_BEHAVIOR", "TRANSFER_PATH_INFERRED", "TYPE_INFERRED"].includes(item))) {
    return "CONNECTION_INTERFACE_INVALID";
  }
  if (findings.some((item) => ["MAX_ABS_DEMAND", "AUTOMATIC_SUM", "AUTOMATIC_ENVELOPE", "CROSS_COMBINATION", "MULTIPLE_SELECTION"].includes(item))) {
    return "CONNECTION_INTERFACE_UNDETERMINED";
  }
  if (findings.some((item) => item.startsWith("MISSING_") || item.startsWith("UNUSABLE_") || item === "ABSENT_AS_ZERO" || item === "RAW_FORCE" || item === "DOUBLE_SIGN" || item === "AXIS_INFERRED" || item === "ORIENTATION_GUESSED" || item === "TYPE_INFERRED")) {
    return "CONNECTION_INTERFACE_INCOMPLETE";
  }
  return "CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE";
}

export function evaluateConnectionInterface(input: D1fR4ConnectionInput): D1fR4ConnectionResult {
  const connection = input.physicalConnection;
  const findings: string[] = [];
  if (!connection.connectionId) findings.push("MISSING_CONNECTION_ID");
  if (connection.connectedMemberIds.length === 0) findings.push("MISSING_CONNECTED_MEMBER");
  if (connection.connectedMemberEndIds.length === 0) findings.push("MISSING_MEMBER_END");
  if (!connection.nodeId) findings.push("MISSING_NODE");
  if (!GOVERNING.includes(connection.authority as (typeof GOVERNING)[number]) || connection.authority === "UNCONFIRMED_CANDIDATE") {
    findings.push("AUTHORITY_NOT_GOVERNING");
  }
  if (NON_GOVERNING_ORIGINS.includes(connection.sourceHint as (typeof NON_GOVERNING_ORIGINS)[number])) findings.push("PROXIMITY_CONNECTION");
  if (connection.impliesRelease) findings.push("CONNECTION_TYPE_IMPLIES_RELEASE");
  if (connection.projectId !== input.projectId || connection.structuralSystemId !== input.structuralSystemId) findings.push("CROSS_PROJECT");
  if (input.currentTopologyFingerprint !== connection.topologyFingerprint) findings.push("STALE_TOPOLOGY");
  if (input.currentProfileId && connection.profileId && input.currentProfileId !== connection.profileId) findings.push("STALE_PROFILE");
  for (const end of input.memberEnds) {
    if (!end.memberEnd || !end.orientation || end.orientationGuessed) findings.push("ORIENTATION_GUESSED");
    if (!end.physicalMemberId) findings.push("MISSING_CONNECTED_MEMBER");
    if (end.projectId !== input.projectId) findings.push("CROSS_PROJECT");
  }
  const knownEnds = new Set(input.memberEnds.map((end) => end.memberEndId));
  for (const endId of connection.connectedMemberEndIds) {
    if (!knownEnds.has(endId)) findings.push("MISSING_MEMBER_END");
  }
  if (input.designConnection) {
    const design = input.designConnection;
    if (design.inferredByLlm || design.inferredFromGeometry || design.inferredFromForcePattern) findings.push("TYPE_INFERRED");
    if (design.family && !FAMILIES.includes(design.family)) findings.push("TYPE_INFERRED");
    if (design.familyDefinesStiffness || design.familyDefinesRelease || design.familyDefinesCapacity) findings.push("FAMILY_DEFINES_BEHAVIOR");
    if (design.projectId !== input.projectId) findings.push("CROSS_PROJECT");
  }
  for (const release of input.releases) {
    if (release.inferredFromConnectionType || release.inferredFromBimSymbol || release.inferredFromMemberType) findings.push("RELEASE_IMPLIES_CONNECTION_TYPE");
  }
  if (!input.jointMapping) findings.push("MAPPING_AUTHORITY_MISSING");
  else if (!GOVERNING.includes(input.jointMapping.authority as (typeof GOVERNING)[number]) || input.jointMapping.authority === "UNCONFIRMED_CANDIDATE") {
    findings.push("AI_MAPPING");
  }
  if (input.connectionLocalAxisInferred) findings.push("AXIS_INFERRED");
  if (input.transferPathInferredByAi || input.transferPathInferredFromType) findings.push("TRANSFER_PATH_INFERRED");
  if (input.selectionRequest && FORBIDDEN_SELECTION.includes(input.selectionRequest)) {
    if (input.selectionRequest === "MAX_ABS") findings.push("MAX_ABS_DEMAND");
    else if (input.selectionRequest === "SUM" || input.selectionRequest === "VECTOR_SUM") findings.push("AUTOMATIC_SUM");
    else findings.push("AUTOMATIC_ENVELOPE");
  }
  if (input.synthesizeCombinationIds.length > 1) findings.push("CROSS_COMBINATION");
  const usableActions: D1fR4EndAction[] = [];
  for (const action of input.endActions) {
    if (action.projectId !== input.projectId || action.structuralSystemId !== input.structuralSystemId) findings.push("CROSS_PROJECT");
    if (action.rawUnnormalized) findings.push("RAW_FORCE");
    if (action.authority !== "VERIFIED_GOVERNED" || action.completenessState !== "BINDING_COMPLETE_FOR_DECLARED_SCOPE") findings.push("UNUSABLE_BINDING");
    if (action.authority === "IMPORTED_PENDING_VERIFICATION") findings.push("UNUSABLE_BINDING");
    if (action.completenessState === "STALE") findings.push("STALE_BINDING");
    if (action.runStatus === "FAILED" || action.convergenceStatus === "FAILED") findings.push("UNUSABLE_FAILED");
    if (action.runStatus === "NONCONVERGED" || action.convergenceStatus === "NONCONVERGED") findings.push("UNUSABLE_NONCONVERGED");
    if (!action.modelValidationEvidenceRef) findings.push("MISSING_MODEL_VALIDATION");
    if (!action.loadCaseId && !action.combinationId) findings.push("MISSING_CASE");
    if (!action.locationKind) findings.push("MISSING_LOCATION");
    if (!action.coordinateKind || !COORDINATES.includes(action.coordinateKind as (typeof COORDINATES)[number]) || !action.coordinateMappingRef) {
      findings.push("MISSING_COORDINATE");
    }
    if (!action.signConventionRef) findings.push("MISSING_SIGN");
    if (action.signConversionsApplied > 1) findings.push("DOUBLE_SIGN");
    if (action.topologyFingerprint !== connection.topologyFingerprint) findings.push("STALE_TOPOLOGY");
    for (const component of action.components) {
      if (component.presence === "ABSENT" && component.value !== null) findings.push("ABSENT_AS_ZERO");
      if (component.presence === "EXPLICIT_ZERO" && component.value !== 0) findings.push("ABSENT_AS_ZERO");
      if (component.presence === "PRESENT" && component.value === null) findings.push("MISSING_COMPONENT");
    }
    usableActions.push(action);
  }
  const unique = [...new Set(findings)].sort();
  const state = completeness(unique);
  const canGovern = state === "CONNECTION_INTERFACE_COMPLETE_FOR_DECLARED_SCOPE";
  const bindingIds = sortIds(usableActions.map((action) => action.bindingId));
  const forceFingerprint = fingerprintStructuralSubject("MEMBER_BINDING", {
    kind: "FORCE_TRANSFER",
    connectionId: connection.connectionId,
    bindings: usableActions.map((action) => ({
      id: action.bindingId,
      fingerprint: action.bindingFingerprint,
      end: action.memberEndId,
      caseId: action.loadCaseId,
      combinationId: action.combinationId,
      location: action.locationKind,
      coordinate: action.coordinateKind,
      sign: action.signConventionRef,
      conversions: action.signConversionsApplied,
      resultSet: action.resultSetFingerprint,
      model: action.analysisModelFingerprint,
      topology: action.topologyFingerprint,
    })).sort((left, right) => left.id.localeCompare(right.id)),
    authority: connection.authority,
  });
  const releasePrint = sortIds(input.releases.map((release) => `${release.releaseId}:${release.end}:${[...release.releasedAxes].sort().join(",")}`));
  const connectionFingerprint = fingerprintStructuralSubject("SYSTEM_EVALUATION", {
    kind: "CONNECTION_INTERFACE",
    connectionId: connection.connectionId,
    ends: sortIds(connection.connectedMemberEndIds),
    joints: sortIds(input.jointMapping?.analyticalJointIds ?? []),
    authority: connection.authority,
    family: input.designConnection?.family ?? null,
    coordinates: sortIds(usableActions.map((action) => action.coordinateMappingRef ?? "")),
    releases: releasePrint,
    forceTransfer: forceFingerprint,
    profile: connection.profileId,
    version: connection.version,
    releaseState: input.currentReleaseFingerprint,
  });
  const scopeState: D1fR4ScopeState = input.connectionRequiredByScope
    ? "CONNECTION_DESIGN_UNAVAILABLE"
    : "CONNECTION_NOT_IN_DECLARED_SCOPE";
  const gapFindings = input.connectionRequiredByScope ? ["CONNECTION_REQUIRED_NOT_EVALUATED"] : [];
  return {
    connectionInterfaceResultId: `connection-interface:${connection.connectionId}:${connectionFingerprint.slice(0, 12)}`,
    connectionId: connection.connectionId,
    structuralSystemId: input.structuralSystemId,
    physicalConnectionId: connection.connectionId,
    analyticalJointIds: sortIds(input.analyticalJoints.map((joint) => joint.analyticalJointId)),
    designConnectionId: input.designConnection?.designConnectionId ?? null,
    memberEndIds: sortIds(connection.connectedMemberEndIds),
    forceTransfer: {
      forceTransferContextId: `force-transfer:${connection.connectionId}`,
      connectionId: connection.connectionId,
      bindingIds,
      combinationIds: sortIds(usableActions.flatMap((action) => action.combinationId ? [action.combinationId] : [])),
      loadCaseIds: sortIds(usableActions.flatMap((action) => action.loadCaseId ? [action.loadCaseId] : [])),
      memberEndActionSets: [...usableActions].sort((left, right) => left.bindingId.localeCompare(right.bindingId)),
      aggregatedDemand: null,
      fingerprint: forceFingerprint,
      canGovern: canGovern && !unique.some((item) => item.startsWith("UNUSABLE_") || item === "STALE_BINDING"),
    },
    profileId: connection.profileId,
    authority: connection.authority,
    findings: [...unique, ...gapFindings],
    blockingFindings: unique,
    completenessState: state,
    scopeState,
    designAvailabilityState: "NOT_IMPLEMENTED",
    connectionPass: false,
    connectionAdequate: false,
    designComplete: false,
    equilibriumDiagnostic: "DEFERRED_NON_GOVERNING_DIAGNOSTIC",
    equilibriumEqualsDesignDemand: false,
    memberPassHidesConnectionGap: false,
    supportRestraintEqualsCapacity: false,
    steelInterface: input.designConnection?.family === "SHEAR_CONNECTION" || input.designConnection?.family === "MOMENT_CONNECTION" || input.designConnection?.family === "SPLICE" || input.designConnection?.family === "BRACE_CONNECTION"
      ? { materialDomain: "STEEL", resistanceComputed: false }
      : null,
    concreteInterface: input.designConnection?.family === "CONCRETE_JOINT"
      ? { materialDomain: "CONCRETE", jointDesignComputed: false }
      : null,
    baseInterface: connection.entityKind === "SUPPORT_CONNECTION" || connection.entityKind === "FOUNDATION_INTERFACE_CONNECTION" || input.designConnection?.family === "BASE_CONNECTION"
      ? { supportId: input.supportId, reactionRefs: input.reactionRefs, designComputed: false }
      : null,
    provenance: [
      input.structuralSystemId,
      ...sortIds(connection.connectedMemberIds),
      ...sortIds(connection.connectedMemberEndIds),
      connection.connectionId,
      ...sortIds(input.analyticalJoints.flatMap((joint) => [joint.analyticalJointId, ...joint.connectedEnds.map((end) => end.analyticalElementId)])),
      input.designConnection?.designConnectionId ?? "NO_DESIGN_CONNECTION",
      ...bindingIds,
      `force-transfer:${connection.connectionId}`,
    ],
    fingerprint: connectionFingerprint,
    forceTransferFingerprint: forceFingerprint,
    warnings: [...unique, ...gapFindings],
    events: [
      { type: "CONNECTION_CREATED", subjectId: connection.connectionId, approval: false },
      { type: "FORCE_TRANSFER_CONTEXT_CREATED", subjectId: connection.connectionId, approval: false },
      { type: "CONNECTION_INTERFACE_EVALUATED", subjectId: connection.connectionId, approval: false },
    ],
    r3ResultsRewritten: false,
    supportIdentity: input.supportId,
  };
}

export function recordSuccessorConnectionInterface(prior: D1fR4ConnectionResult, current: D1fR4ConnectionResult): {
  prior: D1fR4ConnectionResult;
  current: D1fR4ConnectionResult;
  history: readonly D1fR4ConnectionResult[];
} {
  return {
    prior: {
      ...prior,
      completenessState: "CONNECTION_INTERFACE_STALE",
      events: [...prior.events, { type: "CONNECTION_INTERFACE_INVALIDATED", subjectId: prior.connectionId, approval: false }],
    },
    current,
    history: [prior, current],
  };
}
