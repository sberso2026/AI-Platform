/**
 * EOS-A8B Engineering Digital Thread projection onto Platform KG.
 * Derived, disposable, never source of truth.
 */

export const THREAD_PROJECTION_VERSION = "engineering-thread-projection/v1";
export const THREAD_PROJECTION_FAMILY = "engineering-thread-projection";
export const THREAD_NODE_SOURCE_PREFIX = "eos-thread:";
export const THREAD_KG_NODE_TYPE = "engineering_thread_object";
export const THREAD_PROJECTION_JOB_TYPE = "engineering.thread.project" as const;
export const THREAD_KG_PROJECTION_FLAG = "engineering_digital_thread_kg_projection";
export const THREAD_KG_READS_FLAG = "engineering_digital_thread_kg_reads";

export const THREAD_PROJECTION_HEALTH = [
  "HEALTHY",
  "LAGGING",
  "DEGRADED",
  "REBUILD_REQUIRED",
  "FAILED",
] as const;
export type ThreadProjectionHealthStatus = (typeof THREAD_PROJECTION_HEALTH)[number];

export type CanonicalGovernedLink = {
  id: string;
  tenantId: string;
  workspaceId: string;
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  relationship: string;
  governed?: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
};

export type EngineeringThreadProjectionNode = {
  tenantId: string;
  workspaceId: string;
  objectType: string;
  objectId: string;
  projectId?: string | null;
  objectCode?: string | null;
  status?: string | null;
  title?: string | null;
};

export type EngineeringThreadProjectionEdge = {
  tenantId: string;
  workspaceId: string;
  sourceObjectType: string;
  sourceObjectId: string;
  normalizedRelationType: string;
  targetObjectType: string;
  targetObjectId: string;
  sourceLinkId: string;
  sourceRelationType: string;
  projectionVersion: string;
  projectedAt: string;
  projectionKey: string;
  sourceLinkIds: string[];
};

export type ThreadProjectionFlags = {
  writesEnabled: boolean;
  readsEnabled: boolean;
};

export type ThreadProjectionHealth = {
  status: ThreadProjectionHealthStatus;
  projectionVersion: string;
  lastProjectedAt: string | null;
  lastReconciledAt: string | null;
  lagMs: number | null;
  edgeCount: number;
  canonicalEdgeCount: number;
  missingCount: number;
  duplicateCount: number;
  orphanCount: number;
  semanticVersionMismatch: number;
  pendingFailures: number;
  source: "canonical" | "platform_kg_projection";
};

export type ThreadReconcileReport = {
  missing: EngineeringThreadProjectionEdge[];
  duplicates: string[];
  orphans: EngineeringThreadProjectionEdge[];
  staleVersion: EngineeringThreadProjectionEdge[];
  wrongWorkspace: EngineeringThreadProjectionEdge[];
  projected: number;
  canonical: number;
};

export type ThreadProjectionStore = {
  upsertNode(node: EngineeringThreadProjectionNode): Promise<void>;
  upsertEdge(edge: EngineeringThreadProjectionEdge): Promise<void>;
  removeEdgeBySourceLinkId(tenantId: string, workspaceId: string, linkId: string): Promise<void>;
  listEdges(tenantId: string, workspaceId: string): Promise<EngineeringThreadProjectionEdge[]>;
  listNodes(tenantId: string, workspaceId: string): Promise<EngineeringThreadProjectionNode[]>;
  deleteWorkspaceProjection(tenantId: string, workspaceId: string): Promise<void>;
};
