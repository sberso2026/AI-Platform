import { catalogNodeByKey, nodeKey } from "./traversal";
import type { ThreadGraphInput, ThreadTraversalResult } from "./types";

function label(graph: ThreadGraphInput, type: string, id: string): string {
  const node = catalogNodeByKey(graph.nodes, type, id);
  const code = node?.objectCode ?? id;
  const title = node?.title;
  return title ? `${code} (${title})` : code;
}

/** Deterministic explanations from retrieved authorized relations. No LLM invention. */
export function explainThreadObject(
  graph: ThreadGraphInput,
  traversal: ThreadTraversalResult,
  kind: "requirement" | "decision" | "analysis" | "configuration" | "change",
): string[] {
  const out: string[] = [];
  const rootKey = nodeKey(traversal.root.objectType, traversal.root.objectId);

  for (const rel of traversal.relationships) {
    const from = label(graph, rel.fromType, rel.fromId);
    const to = label(graph, rel.toType, rel.toId);
    if (rel.relationship === "SUPPORTED_BY") {
      out.push(`This ${rel.fromType} ${from} is supported by ${rel.toType} ${to}.`);
    } else if (rel.relationship === "BASED_ON") {
      out.push(`This ${rel.fromType} ${from} is based on ${rel.toType} ${to}.`);
    } else if (rel.relationship === "ALLOCATED_TO") {
      out.push(`Requirement ${from} is allocated to ${rel.toType} ${to}.`);
    } else if (rel.relationship === "REVIEWS") {
      out.push(`Review package ${from} reviews ${rel.toType} ${to}.`);
    } else if (rel.relationship === "AFFECTS") {
      out.push(`Change ${from} affects ${rel.toType} ${to}.`);
    } else if (rel.relationship === "DEPENDS_ON") {
      out.push(`${rel.fromType} ${from} depends on ${rel.toType} ${to}.`);
    } else if (rel.relationship === "USES") {
      out.push(`${rel.fromType} ${from} uses ${rel.toType} ${to}.`);
    } else if (rel.relationship === "USED_BY") {
      out.push(`${rel.fromType} ${from} is used by ${rel.toType} ${to}.`);
    } else if (rel.relationship === "SUPERSEDES") {
      out.push(`${rel.fromType} ${from} supersedes ${rel.toType} ${to}.`);
    } else if (rel.relationship === "CONNECTS") {
      out.push(`Interface ${from} connects ${rel.toType} ${to}.`);
    } else if (rel.relationship === "SCOPED_TO") {
      out.push(`${rel.fromType} ${from} is scoped to ${rel.toType} ${to}.`);
    }
  }

  for (const node of traversal.nodes) {
    if (node.stale) {
      const reasons = (node.staleReasons ?? []).join(", ") || "canonical bounded-context staleness";
      const via = traversal.paths.find((p) => p.steps.some((s) => s.objectType === node.objectType && s.objectId === node.objectId));
      const pathText = via ? via.steps.map((s) => `${s.objectType}:${s.objectId}`).join(" → ") : rootKey;
      out.push(`This ${node.objectType} ${label(graph, node.objectType, node.objectId)} is stale because ${reasons}. Path: ${pathText}.`);
    }
    if (node.superseded) {
      out.push(`This ${node.objectType} ${label(graph, node.objectType, node.objectId)} is superseded.`);
    }
  }

  if (kind === "analysis") {
    const request = catalogNodeByKey(graph.nodes, traversal.root.objectType, traversal.root.objectId);
    if (request?.blockingReasons?.length) {
      out.push(
        `Analysis request ${label(graph, request.objectType, request.objectId)} is BLOCKED (${request.blockingReasons.join(", ")}). No analysis result is present.`,
      );
    }
  }

  if (kind === "configuration") {
    out.push("Configuration baselines are snapshots. Snapshot evidence is not full historical reconstruction of every domain object.");
  }

  return Array.from(new Set(out));
}

export const AI_THREAD_BOUNDARY = {
  maySummarizeRetrievedRelations: true,
  mayInventMissingRelations: false,
  mayConfirmImpactsAutomatically: false,
  mayDeclareEngineeringCorrectness: false,
  mayDeclareDesignCompliance: false,
  mayApproveDecisions: false,
  mayAlterConfigurationAuthority: false,
} as const;
