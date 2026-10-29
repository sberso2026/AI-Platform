/**
 * EOS-D1F-R1 runtime types for structural-system context and physical topology.
 * Reuses the D1F-0 contract. This runtime represents a system. It does not analyse one.
 */

import type { D1fMappingCardinality, D1fDesignBindingTarget } from "./structural-systems";

export const EOS_D1F_R1_PHASE = "EOS-D1F-R1-STRUCTURAL-SYSTEM-CONTEXT-TOPOLOGY" as const;
export const D1F_R1_MATURITY_STATE = "RUNTIME_TOPOLOGY_FOUNDATION_IMPLEMENTED" as const;
export const D1F_R1_STRUCTURAL_SYSTEM_RUNTIME_FOUNDATION_COUNT = 1 as const;
export const D1F_R1_STRUCTURAL_ANALYSIS_METHOD_COUNT = 0 as const;
export const D1F_R1_MEMBER_DESIGN_METHOD_COUNT = 0 as const;
export const D1F_R1_SYSTEM_ORCHESTRATOR_COUNT = 0 as const;

export const D1F_R1_TOPOLOGY_EQUALS_ANALYSIS = false as const;
export const D1F_R1_CONNECTIVITY_EQUALS_LOAD_PATH = false as const;
export const D1F_R1_SUPPORT_RECORD_EQUALS_STRUCTURAL_RESPONSE = false as const;
export const D1F_R1_RUNTIME_FOUNDATION_EQUALS_STRUCTURAL_SOLVER = false as const;
export const D1F_R1_TOPOLOGY_AUTHORITY_CONTRACT_DEFINED = true as const;
export const UNCONFIRMED_CANDIDATE_CAN_GOVERN = false as const;
export const AI_TOPOLOGY_AUTHORITY = false as const;
export const D1F_R1_MEMBER_TYPE_INFERRED_BY_LLM = false as const;
export const D1F_R1_MEMBER_TYPE_INFERRED_FROM_GEOMETRY_ONLY = false as const;
export const D1F_R1_NODE_COORDINATE_UNITS_REQUIRED = true as const;
export const D1F_R1_NODE_COORDINATE_SYSTEM_REQUIRED = true as const;
export const UNITLESS_NODE_COORDINATE_ALLOWED = false as const;
export const D1F_R1_CONNECTIVITY_AUTHORITY_REQUIRED = true as const;
export const D1F_R1_UNCONFIRMED_CONNECTIVITY_CAN_GOVERN = false as const;
export const D1F_R1_PROXIMITY_ONLY_CONNECTIVITY_CAN_GOVERN = false as const;
export const D1F_R1_LLM_CONNECTIVITY_CAN_GOVERN = false as const;
export const D1F_R1_CANDIDATE_CONNECTIVITY_SEPARATE_FROM_GOVERNED = true as const;
export const CANDIDATE_CONNECTIVITY_INCLUDED_IN_GOVERNED_FINGERPRINT = false as const;
export const D1F_R1_AI_CAN_CONFIRM_CONNECTIVITY = false as const;
export const D1F_R1_AUTOMATIC_CONFIRMATION = false as const;
export const D1F_R1_RESTRAINT_COMPONENTS_EXPLICIT = true as const;
export const D1F_R1_SUPPORT_STIFFNESS_CALCULATED = false as const;
export const D1F_R1_SPRING_VALUE_INVENTED = false as const;
export const D1F_R1_SPRING_UNIT_REQUIRED = true as const;
export const D1F_R1_RELEASE_FROM_CONNECTION_TYPE_INFERRED = false as const;
export const D1F_R1_RELEASE_FROM_BIM_SYMBOL_INFERRED = false as const;
export const D1F_R1_RELEASE_FROM_MEMBER_TYPE_INFERRED = false as const;
export const AI_RELEASE_AUTHORITY = false as const;
export const D1F_R1_CONNECTION_CAPACITY_CALCULATED = false as const;
export const D1F_R1_BOLT_DESIGN_IMPLEMENTED = false as const;
export const D1F_R1_WELD_DESIGN_IMPLEMENTED = false as const;
export const D1F_R1_BASE_PLATE_DESIGN_IMPLEMENTED = false as const;
export const D1F_R1_CONNECTION_TYPE_IMPLIES_RELEASE = false as const;
export const D1F_R1_TRANSFORM_REFERENCE_CONTRACT_DEFINED = true as const;
export const D1F_R1_AXIS_VALIDATION_FAILS_CLOSED = true as const;
export const D1F_R1_IMPLICIT_SIGN_CONVENTION_ALLOWED = false as const;
export const D1F_R1_SYSTEM_UNIT_REFERENCE_REQUIRED = true as const;
export const D1F_R1_DIMENSIONED_VALUE_UNIT_REQUIRED = true as const;
export const D1F_R1_EXISTING_UNIT_NORMALIZATION_REUSED = true as const;
export const PARALLEL_UNIT_ENGINE_CREATED = false as const;
export const D1F_R1_AUTO_MERGE_COINCIDENT_NODES = false as const;
export const AI_NODE_MERGE_AUTHORITY = false as const;
export const D1F_R1_CONNECTED_COMPONENT_EQUALS_LOAD_PATH = false as const;
export const D1F_R1_TOPOLOGY_COMPLETE_EQUALS_ANALYSIS_READY = false as const;
export const D1F_R1_TOPOLOGY_COMPLETE_EQUALS_DESIGN_READY = false as const;
export const D1F_R1_D1B_CONTEXT_BINDING_IMPLEMENTED = true as const;
export const D1F_R1_PROJECT_CONTEXT_BINDING = true as const;
export const CROSS_PROJECT_TOPOLOGY_BINDING_ALLOWED = false as const;
export const D1F_R1_D1C_LOAD_REFERENCES_SUPPORTED = true as const;
export const D1F_R1_LOAD_DISTRIBUTION_IMPLEMENTED = false as const;
export const D1F_R1_MEMBER_FORCE_CALCULATION_IMPLEMENTED = false as const;
export const D1F_R1_LOAD_PATH_ANNOTATION_CAN_BE_HUMAN_AUTHORED = true as const;
export const D1F_R1_LOAD_PATH_ANNOTATION_FROM_AI_GOVERNING = false as const;
export const D1F_R1_LOAD_PATH_ANNOTATION_EQUALS_ANALYSIS = false as const;
export const D1F_R1_ANALYTICAL_ELEMENT_STIFFNESS_IMPLEMENTED = false as const;
export const D1F_R1_ANALYTICAL_ELEMENT_RESPONSE_IMPLEMENTED = false as const;
export const D1F_R1_STEEL_DESIGN_CHECK_EXECUTED = false as const;
export const D1F_R1_CONCRETE_DESIGN_CHECK_EXECUTED = false as const;
export const D1F_R1_MAPPING_AUTHORITY_REQUIRED = true as const;
export const AI_MAPPING_CAN_GOVERN = false as const;
export const D1F_R1_PROVENANCE_GRAPH_IMPLEMENTED = true as const;
export const D1F_R1_SOURCE_ORIGIN_CONTRACT_DEFINED = true as const;
export const D1F_R1_EVENT_EQUALS_ENGINEERING_APPROVAL = false as const;
export const D1F_R1_TOPOLOGY_FINGERPRINT_IMPLEMENTED = true as const;
export const D1F_R1_UI_STATE_AFFECTS_TOPOLOGY_FINGERPRINT = false as const;
export const D1F_R1_TOPOLOGY_FINGERPRINT_DETERMINISTIC = true as const;
export const D1F_R1_TOPOLOGY_INVALIDATION_IMPLEMENTED = true as const;
export const D1F_R1_TOPOLOGY_CHANGE_CAN_INVALIDATE_FUTURE_ANALYSIS = true as const;
export const D1F_R1_TOPOLOGY_CHANGE_SILENTLY_REUSES_ANALYSIS = false as const;
export const D1F_R1_HISTORICAL_TOPOLOGY_REPRODUCIBLE = true as const;
export const D1F_R1_NEW_TOPOLOGY_REVISION_OVERWRITES_HISTORY = false as const;
export const D1F_R1_COMPLETENESS_STATE_CONTRACT_DEFINED = true as const;
export const D1F_R1_TOPOLOGY_RESULT_EQUALS_STRUCTURAL_ADEQUACY = false as const;
export const D1F_R1_TOPOLOGY_RESULT_EQUALS_STRUCTURAL_DESIGN = false as const;
export const D1F_R1_TOPOLOGY_RESULT_EQUALS_ANALYSIS_VALIDATION = false as const;
export const D1F_R1_N_CALCULATED = false as const;
export const D1F_R1_V_CALCULATED = false as const;
export const D1F_R1_M_CALCULATED = false as const;
export const D1F_R1_T_CALCULATED = false as const;
export const D1F_R1_REACTION_CALCULATED = false as const;
export const D1F_R1_DISPLACEMENT_CALCULATED = false as const;
export const D1F_R1_CONNECTION_DESIGN_IMPLEMENTED = false as const;
export const D1F_R1_FOUNDATION_DESIGN_IMPLEMENTED = false as const;
export const AI_STRUCTURAL_SYSTEM_AUTHORITY = false as const;
export const AI_CONNECTIVITY_AUTHORITY = false as const;
export const AI_SUPPORT_AUTHORITY = false as const;
export const AI_AXIS_AUTHORITY = false as const;
export const AI_MAPPING_AUTHORITY = false as const;
export const D1F_R1_AI_CANDIDATE_STATE_GOVERNED = false as const;
export const TOPOLOGY_AUTHORITY_STATE_BYPASSES_AUTHORIZATION = false as const;
export const D1F_R2_HANDOFF_READY = true as const;
export const MATRIX_STIFFNESS_IMPLEMENTED = false as const;
export const FRAME_ANALYSIS_IMPLEMENTED = false as const;
export const TRUSS_ANALYSIS_IMPLEMENTED = false as const;
export const FEA_IMPLEMENTED = false as const;
export const PDELTA_IMPLEMENTED = false as const;
export const EIGENVALUE_IMPLEMENTED = false as const;
export const MODAL_ANALYSIS_IMPLEMENTED = false as const;
export const DYNAMIC_ANALYSIS_IMPLEMENTED = false as const;
export const SHELL_ANALYSIS_IMPLEMENTED = false as const;
export const PLATE_ANALYSIS_IMPLEMENTED = false as const;

export const D1F_R1_TOPOLOGY_AUTHORITIES = [
  "EXPLICIT_GOVERNED_MODEL",
  "HUMAN_AUTHORED",
  "HUMAN_CONFIRMED",
  "GOVERNED_IMPORTED",
  "UNCONFIRMED_CANDIDATE",
  "INVALID",
] as const;
export type D1fR1TopologyAuthority = (typeof D1F_R1_TOPOLOGY_AUTHORITIES)[number];

export const D1F_R1_GOVERNING_AUTHORITIES = [
  "EXPLICIT_GOVERNED_MODEL",
  "HUMAN_AUTHORED",
  "HUMAN_CONFIRMED",
  "GOVERNED_IMPORTED",
] as const;

export const D1F_R1_STRUCTURAL_SYSTEM_STATUS_STATES = [
  "DRAFT",
  "GOVERNED",
  "STALE",
  "INVALIDATED",
  "SUPERSEDED",
  "ARCHIVED",
] as const;
export type D1fR1SystemStatus = (typeof D1F_R1_STRUCTURAL_SYSTEM_STATUS_STATES)[number];

export const D1F_R1_FORBIDDEN_TOPOLOGY_STATUSES = ["ANALYSED", "SAFE", "APPROVED", "PASS"] as const;

export const D1F_R1_CONNECTIVITY_KINDS = [
  "MEMBER_TO_NODE",
  "MEMBER_TO_MEMBER",
  "MEMBER_TO_SUPPORT",
  "CONNECTION_TO_MEMBER",
] as const;
export type D1fR1ConnectivityKind = (typeof D1F_R1_CONNECTIVITY_KINDS)[number];

export const D1F_R1_FINDING_SEVERITIES = ["INFO", "WARNING", "BLOCKING_INVALID_TOPOLOGY"] as const;
export type D1fR1FindingSeverity = (typeof D1F_R1_FINDING_SEVERITIES)[number];

export const D1F_R1_COMPLETENESS_STATES = [
  "TOPOLOGY_COMPLETE_FOR_DECLARED_SCOPE",
  "TOPOLOGY_INCOMPLETE",
  "TOPOLOGY_INVALID",
  "TOPOLOGY_UNDETERMINED",
] as const;
export type D1fR1CompletenessState = (typeof D1F_R1_COMPLETENESS_STATES)[number];

export const D1F_R1_EVENT_TYPES_IMPLEMENTED = [
  "SYSTEM_CREATED",
  "TOPOLOGY_CHANGED",
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  "NODE_CHANGED",
  "SUPPORT_CHANGED",
  "RELEASE_CHANGED",
  "CONNECTIVITY_CONFIRMED",
  "TOPOLOGY_INVALIDATED",
] as const;
export type D1fR1EventType = (typeof D1F_R1_EVENT_TYPES_IMPLEMENTED)[number];

export const D1F_R1_SOURCE_ORIGINS = [
  "MANUAL_HUMAN_INPUT",
  "GOVERNED_CAD_BIM_IMPORT",
  "GOVERNED_EXTERNAL_MODEL_IMPORT",
  "EXISTING_REPOSITORY_ENTITY",
] as const;
export type D1fR1SourceOrigin = (typeof D1F_R1_SOURCE_ORIGINS)[number];

export const D1F_R1_DOF_AXES = ["UX", "UY", "UZ", "RX", "RY", "RZ"] as const;
export type D1fR1DofAxis = (typeof D1F_R1_DOF_AXES)[number];

export const D1F_R1_STRUCTURAL_SYSTEM_RUNTIME_CONTRACT =
  "Runtime identity records structuralSystemId, project context, discipline, system version, status, topology version, unit-system reference, global coordinate-system reference, provenance, and system fingerprint." as const;

export const D1F_R1_PHYSICAL_MEMBER_BINDING_CONTRACT =
  "A physical member reuses the D1A member id and member kind. It binds start and end nodes, optional section and material references, authority, provenance, and status into one structural system." as const;

export const D1F_R1_NODE_CONTRACT =
  "A node records nodeId, coordinates, coordinate-system reference, authority, provenance, and status. Identical coordinates do not merge nodes." as const;

export const D1F_R1_CONNECTIVITY_CONTRACT =
  "Connectivity edges are MEMBER_TO_NODE, MEMBER_TO_MEMBER, MEMBER_TO_SUPPORT, or CONNECTION_TO_MEMBER. Each edge has authority. Candidates stay outside the governed edge set." as const;

export const D1F_R1_SUPPORT_RUNTIME_CONTRACT =
  "A support records supportId, a node or member reference, an explicit support type, explicit restraint components, optional governed spring metadata, authority, provenance, and status. Stiffness is not calculated." as const;

export const D1F_R1_MEMBER_RELEASE_RUNTIME_CONTRACT =
  "A release records member id, end, released degrees of freedom, local-axis reference, authority, and provenance. Connection type, BIM symbol, and member type do not create a release." as const;

export const D1F_R1_CONNECTION_TOPOLOGY_CONTRACT =
  "A connection records connectionId, connected physical entities, an explicit classification when supplied, authority, provenance, and status. It has no capacity." as const;

export const D1F_R1_COORDINATE_SYSTEM_RUNTIME_CONTRACT =
  "Coordinate-system records reuse GLOBAL, SYSTEM, MEMBER_LOCAL, SECTION_LOCAL, and ANALYSIS_PROVIDER_LOCAL. A transform reference names source, target, method version, authority, and provenance, and does not apply analysis mathematics." as const;

export const D1F_R1_SIGN_CONVENTION_RUNTIME_CONTRACT =
  "Directional topology semantics require explicit FORCE_SIGN, MOMENT_SIGN, MEMBER_END_CONVENTION, LOCAL_AXIS_ORIENTATION, and DESIGN_METHOD_CONVENTION metadata." as const;

export const D1F_R1_TOPOLOGY_VALIDATION_CONTRACT =
  "Validation detects duplicate ids, dangling and unknown references, missing authority, invalid units, invalid coordinates, invalid release ends, and invalid restraint axes. Blocking findings make the topology invalid." as const;

export const D1F_R1_CONNECTED_COMPONENT_DETECTION =
  "Governed member endpoint references and governed member-to-member edges form physical groups. The count is graph topology only and is not a load path." as const;

export const D1F_R1_TOPOLOGY_ANOMALY_DETECTION =
  "Orphan nodes, isolated members, unused supports, and unreferenced connections are reported. An anomaly is not automatically an engineering error." as const;

export const D1F_R1_TOPOLOGY_FINDING_TAXONOMY = D1F_R1_FINDING_SEVERITIES;

export const D1F_R1_TOPOLOGY_COMPLETENESS_CONTRACT =
  "Declared scope is complete only when identity, required governing members and nodes, resolved connectivity, declared supports, units, coordinate systems, and acceptable authority are present and no blocking finding exists." as const;

export const D1F_R1_PHYSICAL_ANALYTICAL_MAPPING_RUNTIME_CONTRACT =
  "Mapping records carry ONE_TO_ONE, ONE_TO_MANY, or MANY_TO_ONE identity and authority. They do not create analytical stiffness or response." as const;

export const D1F_R1_DESIGN_MEMBER_MAPPING_RUNTIME_CONTRACT =
  "Design mappings name D1D_STEEL_MEMBER or D1E_CONCRETE_MEMBER. They do not execute steel or concrete checks." as const;

export const D1F_R1_RUNTIME_RESULT_CONTRACT =
  "The runtime result reports identity, version, fingerprints, counts, findings, completeness, provenance, and warnings. Completeness is not adequacy, design, or analysis validation." as const;

export const D1F_R2_REQUIRED_R1_CONTRACTS = [
  "structuralSystemIdentity",
  "physicalMemberIdentity",
  "nodeIdentity",
  "coordinateSystems",
  "unitSystem",
  "topologyFingerprint",
  "physicalToAnalyticalMappingIdentity",
  "designMemberMappingIdentity",
  "authority",
  "provenance",
] as const;

export type D1fR1ProvenanceFact = {
  subjectType: string;
  subjectId: string;
  provenanceRef: string;
  authority: string;
  sourceOrigin: D1fR1SourceOrigin;
  structuralSystemId: string;
  revision: string;
};

export type D1fR1Finding = {
  code: string;
  severity: D1fR1FindingSeverity;
  subjectId: string;
  message: string;
};

export type D1fR1MemberInput = {
  memberId: string;
  projectId: string;
  memberKind: string;
  candidateMemberKind: string | null;
  memberTypeInferredByLlm: boolean;
  memberTypeInferredFromGeometryOnly: boolean;
  startNodeId: string;
  endNodeId: string;
  sectionRef: string | null;
  materialRef: string | null;
  authority: string;
  provenanceRef: string;
  sourceOrigin: D1fR1SourceOrigin;
  status: string;
};

export type D1fR1NodeInput = {
  nodeId: string;
  projectId: string;
  x: number;
  y: number;
  z: number;
  unit: string | null;
  coordinateSystemRef: string | null;
  authority: string;
  provenanceRef: string;
  sourceOrigin: D1fR1SourceOrigin;
  status: string;
};

export type D1fR1EdgeInput = {
  edgeId: string;
  kind: string;
  fromId: string;
  toId: string;
  authority: string;
  originHint: "EXPLICIT" | "PROXIMITY" | "LLM" | null;
  provenanceRef: string;
  sourceOrigin: D1fR1SourceOrigin;
};

export type D1fR1RestraintInput = {
  axis: string;
  state: "FIXED" | "FREE" | "SPRING";
  springValue: number | null;
  springUnit: string | null;
  valueInvented: boolean;
};

export type D1fR1SupportInput = {
  supportId: string;
  projectId: string;
  nodeRef: string | null;
  memberRef: string | null;
  supportType: string;
  restraints: readonly D1fR1RestraintInput[];
  authority: string;
  provenanceRef: string;
  sourceOrigin: D1fR1SourceOrigin;
  status: string;
};

export type D1fR1ReleaseInput = {
  releaseId: string;
  memberId: string;
  end: string;
  releasedAxes: readonly string[];
  localAxisRef: string | null;
  inferredFromConnectionType: boolean;
  inferredFromBimSymbol: boolean;
  inferredFromMemberType: boolean;
  authority: string;
  provenanceRef: string;
  sourceOrigin: D1fR1SourceOrigin;
};

export type D1fR1ConnectionInput = {
  connectionId: string;
  projectId: string;
  connectedMemberIds: readonly string[];
  classification: string | null;
  impliesRelease: boolean;
  authority: string;
  provenanceRef: string;
  sourceOrigin: D1fR1SourceOrigin;
  status: string;
};

export type D1fR1CoordinateSystemInput = {
  systemId: string;
  kind: string;
  authority: string;
  provenanceRef: string;
  sourceOrigin: D1fR1SourceOrigin;
};

export type D1fR1TransformInput = {
  transformId: string;
  fromSystem: string;
  toSystem: string;
  methodRef: string;
  version: string;
  authority: string;
  provenanceRef: string;
};

export type D1fR1SignInput = {
  forceSign: string;
  momentSign: string;
  memberEndConvention: string;
  localAxisOrientation: string;
  designMethodConvention: string;
  solverNameAssumed: boolean;
};

export type D1fR1LoadPathInput = {
  annotationId: string;
  authority: string;
  declaredBy: "HUMAN" | "AI";
  relationshipRefs: readonly string[];
};

export type D1fR1AnalyticalElementInput = {
  elementId: string;
  stiffnessImplemented: boolean;
  responseImplemented: boolean;
};

export type D1fR1AnalyticalMappingInput = {
  mappingId: string;
  physicalMemberIds: readonly string[];
  analyticalElementIds: readonly string[];
  cardinality: D1fMappingCardinality | string;
  authority: string;
  exclusiveOneToOneAssumed: boolean;
};

export type D1fR1DesignMappingInput = {
  mappingId: string;
  analyticalElementId: string;
  designMemberId: string;
  target: D1fDesignBindingTarget | string;
  authority: string;
  steelCheckExecuted: boolean;
  concreteCheckExecuted: boolean;
};

export type D1fR1ContextInput = {
  contextId: string;
  projectId: string;
  discipline: string;
};

export type D1fR1TopologyInput = {
  structuralSystemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  disciplineRef: string;
  context: D1fR1ContextInput | null;
  systemVersion: string;
  status: string;
  topologyVersion: string;
  unitSystemRef: string | null;
  globalCoordinateSystemRef: string | null;
  provenanceRef: string;
  sourceOrigin: D1fR1SourceOrigin;
  declaredMemberIds: readonly string[] | null;
  declaredNodeIds: readonly string[] | null;
  members: readonly D1fR1MemberInput[];
  nodes: readonly D1fR1NodeInput[];
  edges: readonly D1fR1EdgeInput[];
  supports: readonly D1fR1SupportInput[];
  releases: readonly D1fR1ReleaseInput[];
  connections: readonly D1fR1ConnectionInput[];
  coordinateSystems: readonly D1fR1CoordinateSystemInput[];
  transforms: readonly D1fR1TransformInput[];
  signConvention: D1fR1SignInput | null;
  directionalSemanticsPresent: boolean;
  loadCaseIds: readonly string[];
  combinationIds: readonly string[];
  loadPaths: readonly D1fR1LoadPathInput[];
  analyticalElements: readonly D1fR1AnalyticalElementInput[];
  analyticalMappings: readonly D1fR1AnalyticalMappingInput[];
  designMappings: readonly D1fR1DesignMappingInput[];
  uiSelection: string | null;
  viewport: string | null;
  displayColor: string | null;
};

export type D1fR1TopologyResult = {
  structuralSystemId: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  disciplineRef: string;
  contextRef: string | null;
  systemVersion: string;
  systemStatus: string;
  topologyVersion: string;
  unitSystemRef: string | null;
  globalCoordinateSystemRef: string | null;
  topologyFingerprint: string;
  candidateFingerprint: string;
  memberCount: number;
  nodeCount: number;
  supportCount: number;
  connectionCount: number;
  governedConnectivityCount: number;
  candidateConnectivityCount: number;
  connectedComponentCount: number;
  mappingCount: number;
  findings: readonly D1fR1Finding[];
  blockingFindings: readonly D1fR1Finding[];
  warnings: readonly string[];
  anomalies: {
    orphanMemberIds: readonly string[];
    orphanNodeIds: readonly string[];
    unusedSupportIds: readonly string[];
    unreferencedConnectionIds: readonly string[];
  };
  completenessState: D1fR1CompletenessState;
  analysisReady: false;
  designReady: false;
  structuralAdequacyClaimed: false;
  loadDistributionImplemented: false;
  invalidatesFutureAnalysis: boolean;
  provenance: readonly D1fR1ProvenanceFact[];
  events: readonly D1fR1EventType[];
  governedMemberIds: readonly string[];
  governedNodeIds: readonly string[];
  governedEdgeIds: readonly string[];
  governedSupportIds: readonly string[];
  governedReleaseIds: readonly string[];
  nodeStateKey: string;
  supportStateKey: string;
  releaseStateKey: string;
  edgeStateKey: string;
};
