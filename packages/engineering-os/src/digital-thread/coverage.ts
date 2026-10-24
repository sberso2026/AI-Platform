import type { ThreadCoverageFinding, ThreadCoverageResult, ThreadGraphInput } from "./types";

function finding(code: string, objectType: string, objectId: string, condition: string): ThreadCoverageFinding {
  return { code, objectType, objectId, condition, reviewRequired: true, automaticDefect: false };
}

/** Bounded assurance/traceability conditions. Not an engineering truth score. */
export function evaluateThreadCoverage(graph: ThreadGraphInput): ThreadCoverageResult {
  const findings: ThreadCoverageFinding[] = [];
  const links = graph.links;

  for (const node of graph.nodes) {
    if (node.objectType === "requirement") {
      const allocated = links.some(
        (l) => l.relationship === "ALLOCATED_TO" && l.fromType === "requirement" && l.fromId === node.objectId,
      );
      if (!allocated) {
        findings.push(finding("REQUIREMENT_WITHOUT_ALLOCATION", node.objectType, node.objectId, "No ALLOCATED_TO system/asset/interface"));
      }
    }
    if (node.objectType === "decision") {
      const supported = links.some(
        (l) =>
          l.fromType === "decision" &&
          l.fromId === node.objectId &&
          (l.relationship === "SUPPORTED_BY" || l.relationship === "BASED_ON"),
      );
      if (!supported) {
        findings.push(finding("DECISION_WITHOUT_SUPPORTING_EVIDENCE", node.objectType, node.objectId, "No SUPPORTED_BY or BASED_ON evidence"));
      }
    }
    if (node.objectType === "analysis_result") {
      const reviewed = links.some(
        (l) => l.relationship === "REVIEWS" && l.toType === "analysis_result" && l.toId === node.objectId,
      );
      if (node.reviewRequired && !reviewed) {
        findings.push(finding("ANALYSIS_RESULT_WITHOUT_REQUIRED_REVIEW", node.objectType, node.objectId, "Review required but no REVIEWS relation"));
      }
      const referencedByActiveDecision =
        node.stale === true &&
        links.some(
          (l) =>
            l.relationship === "SUPPORTED_BY" &&
            l.toType === "analysis_result" &&
            l.toId === node.objectId &&
            l.fromType === "decision",
        );
      if (referencedByActiveDecision) {
        findings.push(
          finding(
            "STALE_RESULT_REFERENCED_BY_ACTIVE_DECISION",
            node.objectType,
            node.objectId,
            `Stale result still referenced by an active Decision (${(node.staleReasons ?? []).join(", ") || "stale"})`,
          ),
        );
      }
    }
    if (node.objectType === "interface") {
      const connected = links.some((l) => l.relationship === "CONNECTS" && l.fromId === node.objectId);
      if (!connected) {
        findings.push(finding("INTERFACE_INCOMPLETE_REQUIRED_INFORMATION", node.objectType, node.objectId, "Interface has no CONNECTS participant"));
      }
    }
    if (node.objectType === "change") {
      const affects = links.filter((l) => l.relationship === "AFFECTS" && l.fromId === node.objectId);
      const confirmed = graph.nodes.some(
        (n) => n.objectType === "impact" && n.status === "confirmed" && links.some((l) => l.relationship === "CAUSED_BY" && l.fromId === n.objectId && l.toId === node.objectId),
      );
      if (affects.length && !confirmed) {
        findings.push(finding("CHANGE_WITH_UNRESOLVED_CANDIDATE_IMPACTS", node.objectType, node.objectId, "AFFECTS links exist without a confirmed Impact"));
      }
    }
    if (node.objectType === "configuration_item") {
      const proven = Boolean(node.provenance?.createdAt || node.provenance?.createdBy);
      if (!proven) {
        findings.push(finding("CONFIGURATION_ITEM_MISSING_REQUIRED_PROVENANCE", node.objectType, node.objectId, "Snapshot item lacks created_at/created_by provenance"));
      }
    }
  }

  return {
    findings,
    maturityModel: "EOS-A1",
    universalTraceabilityScore: false,
  };
}
