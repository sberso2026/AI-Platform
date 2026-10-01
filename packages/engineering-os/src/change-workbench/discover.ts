import { traverseThread } from "../digital-thread/traversal";
import type { ThreadAuthorization, ThreadCatalogNode, ThreadGraphInput, ThreadPath } from "../digital-thread/types";
import { candidateEvidenceFingerprint } from "./fingerprint";
import type { ImpactAssessmentPolicy } from "./policy";
import type {
  ImpactCategory,
  ImpactDiscoveryCompleteness,
  ImpactDiscoveryPerformance,
  ImpactTraversalStatus,
  PotentialImpactCandidate,
} from "./types";

const CATEGORY_BY_TYPE: Record<string, ImpactCategory> = {
  engineering_information: "INFORMATION",
  requirement: "REQUIREMENT",
  assumption: "ASSUMPTION",
  interface: "INTERFACE",
  analysis_request: "ANALYSIS",
  analysis_result: "ANALYSIS",
  calculation: "CALCULATION",
  document: "DRAWING",
  drawing: "DRAWING",
  specification: "SPECIFICATION",
  model: "MODEL",
  decision: "DECISION",
  deliverable_expectation: "DELIVERABLE",
  engineering_handover_package: "HANDOVER",
  configuration_baseline: "CONFIGURATION",
  configuration_item: "CONFIGURATION",
  review_package: "REVIEW",
  engineering_pre_issue_review: "REVIEW",
  engineering_work_plan: "WORK_PLAN",
  change: "CHANGE",
  system: "SYSTEM",
  asset: "ASSET",
  technical_query: "QUERY",
  rfi: "QUERY",
  cost_input: "COST_INPUT",
  schedule_input: "SCHEDULE_INPUT",
};

export function categoryForObjectType(objectType: string, objectCode?: string | null, title?: string | null): ImpactCategory {
  const code = `${objectCode ?? ""} ${title ?? ""}`.toUpperCase();
  if (/CALC/.test(code) && objectType === "document") return "CALCULATION";
  if (/SPEC/.test(code) && objectType === "document") return "SPECIFICATION";
  if (CATEGORY_BY_TYPE[objectType]) return CATEGORY_BY_TYPE[objectType];
  return "INFORMATION";
}

function pathForNode(paths: ThreadPath[], objectType: string, objectId: string) {
  const matching = paths.filter((path) => path.steps.some((step) => step.objectType === objectType && step.objectId === objectId));
  const chosen = matching.sort((a, b) => a.steps.length - b.steps.length)[0];
  return chosen?.steps ?? [];
}

function reasonFor(category: ImpactCategory, lastRelationship: string | undefined, depth: number, sourceType: string): string {
  const relation = lastRelationship ?? "RELATED";
  const sourceNote =
    sourceType === "assumption"
      ? "Assumption is no longer valid or is superseded. Dependent work is not automatically rejected. "
      : sourceType === "requirement"
        ? "Requirement change may affect dependent analyses, decisions, deliverables, and work plans. "
        : sourceType === "interface"
          ? "Interface information changed for a provider/consumer relationship. "
          : "";
  const categoryReason: Partial<Record<ImpactCategory, string>> = {
    ANALYSIS: "ANALYSIS_POTENTIALLY_STALE: analysis used changed governing information. No solver rerun.",
    CALCULATION: "Calculation is derived from potentially affected analysis or changed information.",
    DRAWING: "Drawing is supported by a potentially affected calculation or analysis.",
    DELIVERABLE: "Deliverable references potentially affected engineering evidence. Maturity is not reduced automatically.",
    REVIEW: "Reviewed evidence may have changed. Historical review is preserved; rerun remains separate.",
    WORK_PLAN: "Work Plan inputs may be stale. Reuse existing fingerprint refresh; do not invent a second staleness engine.",
    CONFIGURATION: "Configuration / baseline pointer may no longer match the changed source. Latest revision is not assumed applicable.",
    REQUIREMENT: "Requirement change may affect dependent analyses, decisions, deliverables, and work plans.",
    ASSUMPTION: "Assumption is no longer valid or is superseded. Dependent work is not automatically rejected.",
    INTERFACE: "Interface information changed for a provider/consumer relationship.",
    HANDOVER: "Handover package assembled from potentially affected final information. Human acceptance is unchanged.",
    QUERY: "Construction / commissioning query is related through governed Digital Thread links.",
  };
  return `${sourceNote}${categoryReason[category] ?? "Object is related through Digital Thread."} Relation ${relation} at depth ${depth} is RELATED, not CONFIRMED IMPACT.`;
}

export type PotentialImpactDiscovery = {
  candidates: PotentialImpactCandidate[];
  completeness: ImpactDiscoveryCompleteness;
  traversalStatus: ImpactTraversalStatus;
  truncated: boolean;
  truncationReason?: string;
  disciplines: string[];
  systems: Array<{ objectId: string; title: string | null }>;
  performance: ImpactDiscoveryPerformance;
  nodesTraversed: number;
  relationsTraversed: number;
  humanReviewRequired: true;
};

export function discoverPotentialEngineeringImpacts(input: {
  graph: ThreadGraphInput;
  source: { objectType: string; objectId: string; projectId: string };
  tenantId: string;
  workspaceId: string;
  policy: ImpactAssessmentPolicy;
  authorization?: ThreadAuthorization;
}): PotentialImpactDiscovery {
  const started = Date.now();
  const catalog = new Map(input.graph.nodes.map((n) => [`${n.objectType}:${n.objectId}`, n]));
  const sourceNode = catalog.get(`${input.source.objectType}:${input.source.objectId}`);
  const traversal = traverseThread(
    input.graph,
    {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      root: { objectType: input.source.objectType, objectId: input.source.objectId },
      direction: "both",
      relationTypes: input.policy.relationTypes,
      objectTypes: input.policy.objectTypes,
      maxDepth: input.policy.maxDepth,
      nodeLimit: input.policy.nodeLimit,
      edgeLimit: input.policy.edgeLimit,
    },
    input.authorization,
  );
  const traversalDurationMs = Date.now() - started;
  if (!sourceNode && traversal.nodes.length === 0) {
    return {
      candidates: [],
      completeness: "FAILED",
      traversalStatus: "FAILED",
      truncated: false,
      disciplines: [],
      systems: [],
      performance: {
        traversalDurationMs,
        policyEvaluationDurationMs: Date.now() - started - traversalDurationMs,
        candidateCount: 0,
        nodesTraversed: 0,
        relationsTraversed: 0,
        optionStudyPreparationMs: null,
        constructionResponsePreparationMs: null,
      },
      nodesTraversed: 0,
      relationsTraversed: 0,
      humanReviewRequired: true,
    };
  }

  const candidates: PotentialImpactCandidate[] = [];
  for (const node of traversal.nodes) {
    if (node.depth <= 0) continue;
    const projectId = node.projectId ?? sourceNode?.projectId ?? input.source.projectId;
    if (projectId !== input.source.projectId) continue;
    const meta: ThreadCatalogNode | undefined = catalog.get(`${node.objectType}:${node.objectId}`);
    const relationPath = pathForNode(traversal.paths, node.objectType, node.objectId);
    const last = [...relationPath].reverse().find((step) => step.relationship);
    const category = categoryForObjectType(node.objectType, node.objectCode ?? meta?.objectCode, node.title ?? meta?.title);
    const reason = reasonFor(category, last?.relationship, node.depth, input.source.objectType);
    const candidate: PotentialImpactCandidate = {
      id: `${node.objectType}:${node.objectId}`,
      objectType: node.objectType,
      objectId: node.objectId,
      objectCode: node.objectCode ?? meta?.objectCode ?? null,
      title: node.title ?? meta?.title ?? null,
      category,
      discipline: meta?.discipline ?? null,
      systemId: node.objectType === "system" ? node.objectId : null,
      currentState: node.status ?? meta?.status ?? null,
      relationPath,
      reason,
      traversalDepth: node.depth,
      sourceEvidence: `${input.source.objectType}:${input.source.objectId}`,
      disposition: "POTENTIAL_IMPACT",
      autoConfirmed: false,
      confidenceCategory: "DETERMINISTIC_RELATION",
      evidenceFingerprint: candidateEvidenceFingerprint({
        objectType: node.objectType,
        objectId: node.objectId,
        relationPath,
        reason,
      }),
      rationale: null,
      projectId,
    };
    candidates.push(candidate);
  }

  const sourceDiscipline = sourceNode?.discipline ?? null;
  const disciplines = [...new Set([sourceDiscipline, ...candidates.map((row) => row.discipline)].filter((row): row is string => Boolean(row)))];
  const systems = input.graph.nodes
    .filter((n) => n.objectType === "system" && (n.projectId ?? input.source.projectId) === input.source.projectId)
    .filter((n) => candidates.some((c) => c.objectId === n.objectId || c.systemId === n.objectId) || n.objectId === (sourceNode as ThreadCatalogNode | undefined)?.objectId)
    .map((n) => ({ objectId: n.objectId, title: n.title ?? null }));

  const truncated = traversal.truncated;
  const completeness: ImpactDiscoveryCompleteness = truncated ? "PARTIAL" : "COMPLETE";
  const traversalStatus: ImpactTraversalStatus = truncated ? "PARTIAL_TRAVERSAL" : "COMPLETE";
  return {
    candidates,
    completeness,
    traversalStatus,
    truncated,
    truncationReason: traversal.truncationReason,
    disciplines,
    systems,
    performance: {
      traversalDurationMs,
      policyEvaluationDurationMs: Date.now() - started - traversalDurationMs,
      candidateCount: candidates.length,
      nodesTraversed: traversal.nodes.length,
      relationsTraversed: traversal.relationships.length,
      optionStudyPreparationMs: null,
      constructionResponsePreparationMs: null,
    },
    nodesTraversed: traversal.nodes.length,
    relationsTraversed: traversal.relationships.length,
    humanReviewRequired: true,
  };
}
