import { explainThreadObject } from "../digital-thread/explain";
import { traverseThread } from "../digital-thread/traversal";
import type { ThreadGraphInput } from "../digital-thread/types";

function query(graph: ThreadGraphInput, objectType: string, objectId: string, direction: "both" | "upstream" | "downstream", maxDepth: number) {
  const root = graph.nodes.find((row) => row.objectType === objectType && row.objectId === objectId) ?? graph.nodes[0];
  return traverseThread(graph, {
    tenantId: root?.tenantId ?? "",
    workspaceId: root?.workspaceId ?? "",
    root: { objectType, objectId },
    direction,
    maxDepth,
    nodeLimit: 80,
    edgeLimit: 160,
  });
}

export function explainWhyRelated(graph: ThreadGraphInput, objectType: string, objectId: string): string[] {
  return explainThreadObject(graph, query(graph, objectType, objectId, "both", 3), "requirement");
}

export function explainWhyAffected(graph: ThreadGraphInput, objectType: string, objectId: string): string[] {
  return explainThreadObject(graph, query(graph, objectType, objectId, "downstream", 3), "change");
}

export function explainWhatChanged(graph: ThreadGraphInput, objectType: string, objectId: string): string[] {
  const lines = explainThreadObject(graph, query(graph, objectType, objectId, "both", 2), "change");
  return lines.length ? lines : ["No governed change relation is visible for this object in the current authorized graph."];
}

export function explainDecisionOrigin(graph: ThreadGraphInput, decisionId: string): string[] {
  return explainThreadObject(graph, query(graph, "decision", decisionId, "upstream", 3), "decision");
}
