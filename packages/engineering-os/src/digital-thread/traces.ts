import { DISCOVERED_DEPENDENCY } from "../control-intelligence/invariants";
import { explainThreadObject } from "./explain";
import { catalogNodeByKey, discoverThreadImpactCandidates, nodeKey, traverseThread } from "./traversal";
import type {
  ThreadAuthorization,
  ThreadComposedBinding,
  ThreadGraphInput,
  ThreadObjectRef,
  ThreadQuery,
  ThreadTrace,
  ThreadTraceGap,
  ThreadTraversalResult,
} from "./types";

function asRoot(graph: ThreadGraphInput, type: string, id: string, fallback: Pick<ThreadObjectRef, "tenantId" | "workspaceId">): ThreadObjectRef {
  const node = catalogNodeByKey(graph.nodes, type, id);
  return {
    tenantId: node?.tenantId ?? fallback.tenantId,
    workspaceId: node?.workspaceId ?? fallback.workspaceId,
    objectType: type,
    objectId: id,
    projectId: node?.projectId,
    objectCode: node?.objectCode,
    title: node?.title,
    status: node?.status,
    stale: node?.stale,
    superseded: node?.superseded,
    staleReasons: node?.staleReasons,
    revision: node?.revision,
    configurationContext: node?.configurationContext,
  };
}

function hasEdge(
  traversal: ThreadTraversalResult,
  fromType: string,
  relationship: string,
  toType?: string,
  fromId?: string,
): boolean {
  return traversal.relationships.some(
    (rel) =>
      rel.relationship === relationship &&
      rel.fromType === fromType &&
      (toType ? rel.toType === toType : true) &&
      (fromId ? rel.fromId === fromId : true),
  );
}

function firstOfType(traversal: ThreadTraversalResult, type: string) {
  return traversal.nodes.find((n) => n.objectType === type && n.depth > 0);
}

function gap(expectedStep: string, expectedRelation?: string, fromType?: string, fromId?: string, toType?: string): ThreadTraceGap {
  return { expectedStep, expectedRelation, fromType, fromId, toType, reason: "MISSING_RELATION" };
}

function runQuery(
  graph: ThreadGraphInput,
  query: ThreadQuery,
  auth?: ThreadAuthorization,
): ThreadTraversalResult {
  return traverseThread(graph, query, auth);
}

export function requirementTrace(
  graph: ThreadGraphInput,
  query: ThreadQuery,
  auth?: ThreadAuthorization,
): ThreadTrace {
  const traversal = runQuery(graph, { ...query, direction: query.direction ?? "both" }, auth);
  const rootId = query.root.objectId;
  const gaps: ThreadTraceGap[] = [];
  if (!hasEdge(traversal, "requirement", "ALLOCATED_TO", undefined, rootId)) {
    gaps.push(gap("allocation", "ALLOCATED_TO", "requirement", rootId, "system|asset|interface"));
  }
  const allocated = traversal.relationships.find(
    (rel) => rel.relationship === "ALLOCATED_TO" && rel.fromId === rootId,
  );
  const analysis = firstOfType(traversal, "analysis_request");
  if (!analysis) gaps.push(gap("analysis", "BASED_ON|SCOPED_TO|DEPENDS_ON", allocated?.toType, allocated?.toId, "analysis_request"));
  const result = firstOfType(traversal, "analysis_result");
  if (!result) gaps.push(gap("result/evidence", undefined, "analysis_request", analysis?.objectId, "analysis_result"));
  if (!traversal.nodes.some((n) => n.objectType === "review_package")) {
    gaps.push(gap("review", "REVIEWS", "review_package", undefined, "analysis_result"));
  }
  if (!traversal.nodes.some((n) => n.objectType === "decision")) {
    gaps.push(gap("decision", "SUPPORTED_BY", "decision", undefined, "analysis_result"));
  }
  const composedBindings: ThreadComposedBinding[] = [];
  const requestNode = catalogNodeByKey(graph.nodes, "analysis_request", analysis?.objectId ?? "");
  const resultNode = graph.nodes.find(
    (n) => n.objectType === "analysis_result" && n.provenance?.sourceAnalysisId === analysis?.objectId,
  );
  if (analysis && resultNode) {
    composedBindings.push({
      kind: "CANONICAL_FK",
      fromType: "analysis_result",
      fromId: resultNode.objectId,
      toType: "analysis_request",
      toId: analysis.objectId,
      field: "analysis_result.analysis_request_id",
    });
  }
  return {
    kind: "requirement",
    root: asRoot(graph, "requirement", rootId, query),
    traversal,
    gaps,
    explanations: explainThreadObject(graph, traversal, "requirement"),
    composedBindings,
    impactCandidates: discoverThreadImpactCandidates(traversal),
  };
}

export function decisionTrace(
  graph: ThreadGraphInput,
  query: ThreadQuery,
  auth?: ThreadAuthorization,
): ThreadTrace {
  const traversal = runQuery(graph, { ...query, direction: query.direction ?? "both" }, auth);
  const node = catalogNodeByKey(graph.nodes, "decision", query.root.objectId);
  const gaps: ThreadTraceGap[] = [];
  if (!hasEdge(traversal, "decision", "SUPPORTED_BY", undefined, query.root.objectId) && !hasEdge(traversal, "decision", "BASED_ON", undefined, query.root.objectId)) {
    gaps.push(gap("supporting evidence", "SUPPORTED_BY|BASED_ON", "decision", query.root.objectId));
  }
  return {
    kind: "decision",
    root: {
      ...asRoot(graph, "decision", query.root.objectId, query),
      title: node?.title ?? node?.question ?? null,
    },
    traversal,
    gaps,
    explanations: explainThreadObject(graph, traversal, "decision"),
    composedBindings: [],
    impactCandidates: discoverThreadImpactCandidates(traversal),
  };
}

export function analysisTrace(
  graph: ThreadGraphInput,
  query: ThreadQuery,
  auth?: ThreadAuthorization,
): ThreadTrace {
  const traversal = runQuery(graph, { ...query, direction: query.direction ?? "both" }, auth);
  const request = catalogNodeByKey(graph.nodes, "analysis_request", query.root.objectId);
  const result = graph.nodes.find(
    (n) => n.objectType === "analysis_result" && n.provenance?.sourceAnalysisId === query.root.objectId,
  );
  const gaps: ThreadTraceGap[] = [];
  const composedBindings: ThreadComposedBinding[] = [];
  if (result) {
    composedBindings.push({
      kind: "CANONICAL_FK",
      fromType: "analysis_result",
      fromId: result.objectId,
      toType: "analysis_request",
      toId: query.root.objectId,
      field: "analysis_result.analysis_request_id",
    });
  } else if (request && (request.status === "blocked" || (request.blockingReasons?.length ?? 0) > 0)) {
    gaps.push(gap("analysis result", undefined, "analysis_request", query.root.objectId, "analysis_result"));
  } else if (!result) {
    gaps.push(gap("analysis result", undefined, "analysis_request", query.root.objectId, "analysis_result"));
  }
  const blocked =
    request && (request.status === "blocked" || (request.blockingReasons?.length ?? 0) > 0)
      ? {
          requestId: request.objectId,
          discipline: request.discipline ?? undefined,
          capability: request.capability ?? undefined,
          toolBinding: request.toolCode ? `${request.toolCode} ${request.toolVersion ?? ""}`.trim() : undefined,
          reasons: request.blockingReasons ?? ["BLOCKED"],
          fabricatedResult: false as const,
        }
      : undefined;
  return {
    kind: "analysis",
    root: asRoot(graph, query.root.objectType, query.root.objectId, query),
    traversal,
    gaps,
    explanations: explainThreadObject(graph, traversal, "analysis"),
    composedBindings,
    impactCandidates: discoverThreadImpactCandidates(traversal),
    blockedAnalysis: blocked,
  };
}

export function configurationTrace(
  graph: ThreadGraphInput,
  query: ThreadQuery,
  auth?: ThreadAuthorization,
): ThreadTrace {
  const traversal = runQuery(graph, { ...query, direction: query.direction ?? "both" }, auth);
  const baseline = catalogNodeByKey(graph.nodes, "configuration_baseline", query.root.objectId);
  const items = baseline?.snapshotItems ?? [];
  const composedBindings: ThreadComposedBinding[] = items.map((item) => ({
    kind: "CANONICAL_FK" as const,
    fromType: "configuration_item",
    fromId: item.id,
    toType: "configuration_baseline",
    toId: query.root.objectId,
    field: "engineering_configuration_items.baseline_id",
  }));
  const gaps: ThreadTraceGap[] = [];
  if (!items.length && !hasEdge(traversal, "configuration_baseline", "BASELINES", undefined, query.root.objectId) && !hasEdge(traversal, "configuration_baseline", "CONTAINS", undefined, query.root.objectId)) {
    gaps.push(gap("configuration items", "BASELINES|CONTAINS", "configuration_baseline", query.root.objectId));
  }
  return {
    kind: "configuration",
    root: asRoot(graph, "configuration_baseline", query.root.objectId, query),
    traversal,
    gaps,
    explanations: explainThreadObject(graph, traversal, "configuration"),
    composedBindings,
    impactCandidates: discoverThreadImpactCandidates(traversal),
    configurationAvailability: items.length ? "SNAPSHOT_EVIDENCE_AVAILABLE" : "NONE",
  };
}

export function changeTrace(
  graph: ThreadGraphInput,
  query: ThreadQuery,
  auth?: ThreadAuthorization,
): ThreadTrace {
  const traversal = runQuery(graph, { ...query, direction: query.direction ?? "both" }, auth);
  const gaps: ThreadTraceGap[] = [];
  if (!hasEdge(traversal, "change", "AFFECTS", undefined, query.root.objectId)) {
    gaps.push(gap("affected objects", "AFFECTS", "change", query.root.objectId));
  }
  const impactCandidates = discoverThreadImpactCandidates(traversal).map((c) => ({
    ...c,
    kind: c.kind === DISCOVERED_DEPENDENCY ? DISCOVERED_DEPENDENCY : c.kind,
    confirmedImpact: false as const,
  }));
  return {
    kind: "change",
    root: asRoot(graph, "change", query.root.objectId, query),
    traversal,
    gaps,
    explanations: explainThreadObject(graph, traversal, "change"),
    composedBindings: [],
    impactCandidates,
  };
}

export { nodeKey };
