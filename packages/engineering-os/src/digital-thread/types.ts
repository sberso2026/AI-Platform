/**
 * EOS-A8A Engineering Digital Thread domain contract.
 * Refs identify canonical objects. Relations are governed engineering_object_links.
 * This module does not persist a second object model or a third graph store.
 */

export const THREAD_DEFAULT_MAX_DEPTH = 4;
export const THREAD_HARD_MAX_DEPTH = 8;
export const THREAD_DEFAULT_NODE_LIMIT = 200;
export const THREAD_DEFAULT_EDGE_LIMIT = 400;

export const THREAD_DIRECTIONS = ["upstream", "downstream", "both"] as const;
export type ThreadDirection = (typeof THREAD_DIRECTIONS)[number];

export const THREAD_IMPACT_CANDIDATE_KINDS = [
  "DISCOVERED_DEPENDENCY",
  "POTENTIAL_DOWNSTREAM_EFFECT",
  "TRACE_DEPENDENCY",
] as const;
export type ThreadImpactCandidateKind = (typeof THREAD_IMPACT_CANDIDATE_KINDS)[number];

export const CONFIGURATION_AVAILABILITY = [
  "NONE",
  "SNAPSHOT_EVIDENCE_AVAILABLE",
  "FULL_HISTORICAL_STATE_AVAILABLE",
] as const;
export type ConfigurationAvailability = (typeof CONFIGURATION_AVAILABILITY)[number];

export const THREAD_ROOT_TYPES = [
  "requirement",
  "system",
  "asset",
  "interface",
  "assumption",
  "analysis_request",
  "analysis_result",
  "review_package",
  "review_finding",
  "decision",
  "change",
  "impact",
  "configuration_baseline",
  "optimization_study",
  "optimization_run",
  "document",
  "engineering_information",
  "engineering_work_event",
] as const;
export type ThreadRootType = (typeof THREAD_ROOT_TYPES)[number];

export type ThreadObjectRef = {
  tenantId: string;
  workspaceId: string;
  objectType: string;
  objectId: string;
  projectId?: string | null;
  objectCode?: string | null;
  revision?: string | null;
  configurationContext?: string | null;
  title?: string | null;
  status?: string | null;
  stale?: boolean;
  superseded?: boolean;
  staleReasons?: string[];
};

export type ThreadRelation = {
  id?: string;
  relationship: string;
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  governed?: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
  metadata?: Record<string, unknown>;
};

export type ThreadPathStep = {
  objectType: string;
  objectId: string;
  relationship?: string;
  depth: number;
};

export type ThreadPath = {
  steps: ThreadPathStep[];
  cyclic: boolean;
  truncated: boolean;
};

export type ThreadProvenance = {
  createdBy?: string | null;
  createdAt?: string | null;
  sourceDocumentId?: string | null;
  sourceAnalysisId?: string | null;
  sourceExternalTool?: string | null;
  toolVersion?: string | null;
  adapterVersion?: string | null;
  executionHost?: string | null;
  inputFingerprint?: string | null;
  artifactHash?: string | null;
  reviewReference?: string | null;
  decisionReference?: string | null;
};

export type ThreadQuery = {
  tenantId: string;
  workspaceId: string;
  root: Pick<ThreadObjectRef, "objectType" | "objectId">;
  direction?: ThreadDirection;
  relationTypes?: string[];
  objectTypes?: string[];
  maxDepth?: number;
  nodeLimit?: number;
  edgeLimit?: number;
};

export type ThreadNode = ThreadObjectRef & {
  depth: number;
  provenance?: ThreadProvenance;
};

export type ThreadEdge = ThreadRelation & {
  inverseLabel?: string;
  traversalCategory?: string;
  impactRelevant?: boolean;
  assuranceRelevant?: boolean;
};

export type ThreadTruncationReason = "DEPTH_LIMIT" | "NODE_LIMIT" | "EDGE_LIMIT";

export type ThreadTraversalResult = {
  root: ThreadObjectRef;
  nodes: ThreadNode[];
  relationships: ThreadEdge[];
  paths: ThreadPath[];
  maxDepthUsed: number;
  truncated: boolean;
  truncationReason?: ThreadTruncationReason;
  cycleDetected: boolean;
};

export type ThreadTraceGap = {
  expectedStep: string;
  expectedRelation?: string;
  fromType?: string;
  fromId?: string;
  toType?: string;
  reason: "MISSING_RELATION";
};

export type ThreadComposedBinding = {
  kind: "CANONICAL_FK";
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  field: string;
};

export type ThreadImpactCandidate = {
  kind: ThreadImpactCandidateKind;
  objectType: string;
  objectId: string;
  depth: number;
  via: string;
  path: string[];
  confirmedImpact: false;
};

export type ThreadTrace = {
  kind: "requirement" | "decision" | "analysis" | "configuration" | "change";
  root: ThreadObjectRef;
  traversal: ThreadTraversalResult;
  gaps: ThreadTraceGap[];
  explanations: string[];
  composedBindings: ThreadComposedBinding[];
  impactCandidates: ThreadImpactCandidate[];
  configurationAvailability?: ConfigurationAvailability;
  blockedAnalysis?: {
    requestId: string;
    discipline?: string;
    capability?: string;
    toolBinding?: string;
    reasons: string[];
    fabricatedResult: false;
  };
};

export type ThreadCoverageFinding = {
  code: string;
  objectType: string;
  objectId: string;
  condition: string;
  reviewRequired: true;
  automaticDefect: false;
};

export type ThreadCoverageResult = {
  findings: ThreadCoverageFinding[];
  maturityModel: "EOS-A1";
  universalTraceabilityScore: false;
};

export type ThreadAuthorization = {
  tenantId: string;
  allowedWorkspaceIds: readonly string[];
  role: "anonymous" | "member" | "admin";
  /** key = `${objectType}:${objectId}` */
  nodeAccess: ReadonlyMap<string, { tenantId: string; workspaceId: string }>;
};

export type ThreadCatalogNode = ThreadObjectRef & {
  discipline?: string | null;
  capability?: string | null;
  blockingReasons?: string[];
  toolCode?: string | null;
  toolVersion?: string | null;
  adapterVersion?: string | null;
  executionHost?: string | null;
  inputFingerprint?: string | null;
  reviewRequired?: boolean;
  acceptanceState?: string | null;
  materiality?: string | null;
  validationStatus?: string | null;
  expiresAt?: string | null;
  question?: string | null;
  alternatives?: string[];
  snapshotItems?: Array<{ id: string; objectType: string; objectId: string; objectCode?: string }>;
  provenance?: ThreadProvenance;
};

export type ThreadGraphInput = {
  nodes: ThreadCatalogNode[];
  links: ThreadRelation[];
};
