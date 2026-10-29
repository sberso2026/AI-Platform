import { DISCOVERED_DEPENDENCY } from "../control-intelligence/invariants";
import { isLifecycleUpstreamHop, relationSemantics } from "./relation-semantics";
import {
  THREAD_DEFAULT_EDGE_LIMIT,
  THREAD_DEFAULT_MAX_DEPTH,
  THREAD_DEFAULT_NODE_LIMIT,
  THREAD_HARD_MAX_DEPTH,
  type ThreadAuthorization,
  type ThreadCatalogNode,
  type ThreadDirection,
  type ThreadEdge,
  type ThreadGraphInput,
  type ThreadImpactCandidate,
  type ThreadNode,
  type ThreadObjectRef,
  type ThreadPath,
  type ThreadQuery,
  type ThreadRelation,
  type ThreadTraversalResult,
} from "./types";

export function nodeKey(type: string, id: string): string {
  return `${type}:${id}`;
}

export function clampThreadDepth(requested?: number): number {
  const raw = requested ?? THREAD_DEFAULT_MAX_DEPTH;
  if (!Number.isFinite(raw) || raw < 1) return THREAD_DEFAULT_MAX_DEPTH;
  return Math.min(Math.floor(raw), THREAD_HARD_MAX_DEPTH);
}

function authorizedNode(
  auth: ThreadAuthorization | undefined,
  type: string,
  id: string,
): { tenantId: string; workspaceId: string } | null {
  if (!auth) return { tenantId: "", workspaceId: "" };
  if (auth.role === "anonymous") return null;
  const rec = auth.nodeAccess.get(nodeKey(type, id));
  if (!rec) return null;
  if (rec.tenantId !== auth.tenantId) return null;
  if (!auth.allowedWorkspaceIds.includes(rec.workspaceId)) return null;
  return rec;
}

function neighbour(
  link: ThreadRelation,
  currentType: string,
  currentId: string,
): { type: string; id: string; currentIsFrom: boolean } | null {
  if (link.fromType === currentType && link.fromId === currentId) {
    return { type: link.toType, id: link.toId, currentIsFrom: true };
  }
  if (link.toType === currentType && link.toId === currentId) {
    return { type: link.fromType, id: link.fromId, currentIsFrom: false };
  }
  return null;
}

function directionAllows(direction: ThreadDirection, relationship: string, currentIsFrom: boolean): boolean {
  if (direction === "both") return true;
  const upstreamHop = isLifecycleUpstreamHop(relationship, currentIsFrom);
  return direction === "upstream" ? upstreamHop : !upstreamHop;
}

export function traverseThread(
  graph: ThreadGraphInput,
  query: ThreadQuery,
  auth?: ThreadAuthorization,
): ThreadTraversalResult {
  const catalog = new Map(graph.nodes.map((n) => [nodeKey(n.objectType, n.objectId), n]));
  const maxDepth = clampThreadDepth(query.maxDepth);
  const nodeLimit = query.nodeLimit ?? THREAD_DEFAULT_NODE_LIMIT;
  const edgeLimit = query.edgeLimit ?? THREAD_DEFAULT_EDGE_LIMIT;
  const direction: ThreadDirection = query.direction ?? "both";
  const relationFilter = query.relationTypes?.length ? new Set(query.relationTypes) : null;
  const objectFilter = query.objectTypes?.length ? new Set(query.objectTypes) : null;

  const rootAuth = authorizedNode(auth, query.root.objectType, query.root.objectId);
  const rootCatalog = catalog.get(nodeKey(query.root.objectType, query.root.objectId));
  const root: ThreadObjectRef =
    rootAuth === null
      ? {
          tenantId: query.tenantId,
          workspaceId: query.workspaceId,
          objectType: query.root.objectType,
          objectId: query.root.objectId,
        }
      : {
          tenantId: query.tenantId,
          workspaceId: rootCatalog?.workspaceId ?? query.workspaceId,
          objectType: query.root.objectType,
          objectId: query.root.objectId,
          projectId: rootCatalog?.projectId,
          objectCode: rootCatalog?.objectCode,
          title: rootCatalog?.title,
          status: rootCatalog?.status,
          stale: rootCatalog?.stale,
          superseded: rootCatalog?.superseded,
          staleReasons: rootCatalog?.staleReasons,
          revision: rootCatalog?.revision,
          configurationContext: rootCatalog?.configurationContext,
        };

  if (rootAuth === null) {
    return {
      root,
      nodes: [],
      relationships: [],
      paths: [],
      maxDepthUsed: maxDepth,
      truncated: false,
      cycleDetected: false,
    };
  }

  const seenNodes = new Set<string>([nodeKey(root.objectType, root.objectId)]);
  const seenEdges = new Set<string>();
  const nodes: ThreadNode[] = [
    {
      ...root,
      depth: 0,
      provenance: rootCatalog?.provenance,
    },
  ];
  const relationships: ThreadEdge[] = [];
  const paths: ThreadPath[] = [
    {
      steps: [{ objectType: root.objectType, objectId: root.objectId, depth: 0 }],
      cyclic: false,
      truncated: false,
    },
  ];
  let truncated = false;
  let truncationReason: ThreadTraversalResult["truncationReason"];
  let cycleDetected = false;

  const queue: Array<{ type: string; id: string; depth: number; pathIndex: number }> = [
    { type: root.objectType, id: root.objectId, depth: 0, pathIndex: 0 },
  ];

  while (queue.length) {
    const current = queue.shift()!;
    if (current.depth >= maxDepth) {
      for (const link of graph.links) {
        if (relationFilter && !relationFilter.has(link.relationship)) continue;
        const next = neighbour(link, current.type, current.id);
        if (!next) continue;
        if (!directionAllows(direction, link.relationship, next.currentIsFrom)) continue;
        if (objectFilter && !objectFilter.has(next.type)) continue;
        if (authorizedNode(auth, next.type, next.id) === null) continue;
        if (!seenNodes.has(nodeKey(next.type, next.id))) {
          truncated = true;
          truncationReason = truncationReason ?? "DEPTH_LIMIT";
          break;
        }
      }
      continue;
    }
    for (const link of graph.links) {
      if (relationFilter && !relationFilter.has(link.relationship)) continue;
      const next = neighbour(link, current.type, current.id);
      if (!next) continue;
      if (!directionAllows(direction, link.relationship, next.currentIsFrom)) continue;
      if (objectFilter && !objectFilter.has(next.type)) continue;

      const nextAuth = authorizedNode(auth, next.type, next.id);
      if (nextAuth === null) continue;

      const edgeKey = [
        link.fromType,
        link.fromId,
        link.relationship,
        link.toType,
        link.toId,
      ].join("|");
      const alreadyEdge = seenEdges.has(edgeKey);
      const nextKey = nodeKey(next.type, next.id);
      const alreadyNode = seenNodes.has(nextKey);

      if (alreadyNode && !alreadyEdge) {
        cycleDetected = true;
      }
      if (alreadyNode) {
        if (!alreadyEdge && relationships.length < edgeLimit) {
          seenEdges.add(edgeKey);
          const sem = relationSemantics(link.relationship);
          relationships.push({
            ...link,
            inverseLabel: sem?.inverseLabel,
            traversalCategory: sem?.lifecycleDirection,
            impactRelevant: sem?.impactRelevant,
            assuranceRelevant: sem?.assuranceRelevant,
          });
          const parentPath = paths[current.pathIndex];
          if (parentPath) {
            paths.push({
              steps: [
                ...parentPath.steps,
                { objectType: next.type, objectId: next.id, relationship: link.relationship, depth: current.depth + 1 },
              ],
              cyclic: true,
              truncated: false,
            });
          }
        }
        continue;
      }

      if (nodes.length >= nodeLimit) {
        truncated = true;
        truncationReason = "NODE_LIMIT";
        continue;
      }
      if (relationships.length >= edgeLimit) {
        truncated = true;
        truncationReason = "EDGE_LIMIT";
        continue;
      }

      seenNodes.add(nextKey);
      seenEdges.add(edgeKey);
      const catalogNode = catalog.get(nextKey);
      const node: ThreadNode = {
        tenantId: query.tenantId,
        workspaceId: catalogNode?.workspaceId ?? query.workspaceId,
        objectType: next.type,
        objectId: next.id,
        projectId: catalogNode?.projectId,
        objectCode: catalogNode?.objectCode,
        title: catalogNode?.title,
        status: catalogNode?.status,
        stale: catalogNode?.stale,
        superseded: catalogNode?.superseded,
        staleReasons: catalogNode?.staleReasons,
        revision: catalogNode?.revision,
        configurationContext: catalogNode?.configurationContext,
        depth: current.depth + 1,
        provenance: catalogNode?.provenance ?? {
          createdBy: link.createdBy ?? null,
          createdAt: link.createdAt ?? null,
        },
      };
      nodes.push(node);
      const sem = relationSemantics(link.relationship);
      relationships.push({
        ...link,
        inverseLabel: sem?.inverseLabel,
        traversalCategory: sem?.lifecycleDirection,
        impactRelevant: sem?.impactRelevant,
        assuranceRelevant: sem?.assuranceRelevant,
      });
      const parentPath = paths[current.pathIndex];
      const nextPath: ThreadPath = {
        steps: [
          ...(parentPath?.steps ?? []),
          { objectType: next.type, objectId: next.id, relationship: link.relationship, depth: current.depth + 1 },
        ],
        cyclic: false,
        truncated: current.depth + 1 >= maxDepth,
      };
      paths.push(nextPath);
      queue.push({ type: next.type, id: next.id, depth: current.depth + 1, pathIndex: paths.length - 1 });
    }
  }

  return {
    root,
    nodes,
    relationships,
    paths,
    maxDepthUsed: maxDepth,
    truncated,
    truncationReason,
    cycleDetected,
  };
}

export function discoverThreadImpactCandidates(
  result: ThreadTraversalResult,
): ThreadImpactCandidate[] {
  return result.nodes
    .filter((n) => n.depth > 0)
    .filter((n) =>
      result.relationships.some(
        (rel) =>
          rel.impactRelevant &&
          ((rel.fromType === n.objectType && rel.fromId === n.objectId) ||
            (rel.toType === n.objectType && rel.toId === n.objectId)),
      ),
    )
    .map((n) => ({
      kind: DISCOVERED_DEPENDENCY,
      objectType: n.objectType,
      objectId: n.objectId,
      depth: n.depth,
      via: result.relationships.find(
        (rel) =>
          (rel.fromType === n.objectType && rel.fromId === n.objectId) ||
          (rel.toType === n.objectType && rel.toId === n.objectId),
      )?.relationship ?? "DEPENDS_ON",
      path: [nodeKey(result.root.objectType, result.root.objectId), nodeKey(n.objectType, n.objectId)],
      confirmedImpact: false as const,
    }));
}

export function catalogNodeByKey(nodes: ThreadCatalogNode[], type: string, id: string): ThreadCatalogNode | undefined {
  return nodes.find((n) => n.objectType === type && n.objectId === id);
}
