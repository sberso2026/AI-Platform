/**
 * Phase 8G — Knowledge search façade service (refs + hybrid merge; no ownership clone).
 */
import {
  EngineeringKnowledgeGraph,
  assertKnowledgeIntelligenceSharedServices,
  assertNoKnowledgePrivateInfrastructure,
  drillDownPathFor,
  generateKnowledgeGroundedAnswer,
  hybridSearchNodes,
  runDeterministicReasoningPipeline,
  type DeterministicReasoningResult,
  type KnowledgeNodeRef,
  type UnifiedSearchResult,
} from "@rtb/project-intelligence";

export function buildDemoKnowledgeGraph(scope: {
  tenantId: string;
  workspaceId: string;
}): EngineeringKnowledgeGraph {
  return demoGraph(scope);
}

function demoGraph(scope: { tenantId: string; workspaceId: string }): EngineeringKnowledgeGraph {
  const g = new EngineeringKnowledgeGraph();
  const nodes: KnowledgeNodeRef[] = [
    {
      refId: "doc-valve-spec",
      kind: "document",
      owner: "document_intelligence",
      title: "Valve specification revision B",
      snippet: "Isolation valve leak testing requirements",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      drillDownPath: drillDownPathFor("document", "doc-valve-spec"),
      storesBusinessRecord: false,
    },
    {
      refId: "meet-site-access",
      kind: "meeting",
      owner: "meeting_intelligence",
      title: "Site access coordination",
      snippet: "Discussed valve leak observation near skid",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      drillDownPath: drillDownPathFor("meeting", "meet-site-access"),
      storesBusinessRecord: false,
    },
    {
      refId: "find-valve-leak",
      kind: "finding",
      owner: "findings_intelligence",
      title: "Valve leak risk finding",
      snippet: "Candidate finding from document and meeting evidence",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      drillDownPath: drillDownPathFor("finding", "find-valve-leak"),
      storesBusinessRecord: false,
    },
    {
      refId: "risk-leak",
      kind: "risk",
      owner: "engineering_core",
      title: "Hydrocarbon leak risk",
      snippet: "Core risk register reference",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      drillDownPath: drillDownPathFor("risk", "risk-leak"),
      storesBusinessRecord: false,
    },
    {
      refId: "report-exec",
      kind: "report",
      owner: "reporting_intelligence",
      title: "Executive intelligence snapshot",
      snippet: "Open risks and findings roll-up",
      tenantId: scope.tenantId,
      workspaceId: scope.workspaceId,
      drillDownPath: drillDownPathFor("report", "report-exec"),
      storesBusinessRecord: false,
    },
  ];
  for (const n of nodes) g.upsertNode(n);
  g.link({
    edgeId: "e1",
    fromRefId: "find-valve-leak",
    toRefId: "doc-valve-spec",
    edgeType: "derived_from",
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
  });
  g.link({
    edgeId: "e2",
    fromRefId: "find-valve-leak",
    toRefId: "meet-site-access",
    edgeType: "derived_from",
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
  });
  g.link({
    edgeId: "e3",
    fromRefId: "find-valve-leak",
    toRefId: "risk-leak",
    edgeType: "supports",
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
  });
  g.link({
    edgeId: "e4",
    fromRefId: "report-exec",
    toRefId: "find-valve-leak",
    edgeType: "references",
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
  });
  g.assertNoDuplicateOwnership();
  return g;
}

export function runUnifiedKnowledgeSearch(input: {
  query: string;
  tenantId: string;
  workspaceId: string;
  includeGroundedAnswer?: boolean;
  limit?: number;
}): UnifiedSearchResult & {
  groundedAnswer?: ReturnType<typeof generateKnowledgeGroundedAnswer>;
  graphIntegrity: true;
} {
  assertKnowledgeIntelligenceSharedServices();
  assertNoKnowledgePrivateInfrastructure({
    implementsPrivateAudit: false,
    implementsPrivateNotification: false,
    implementsPrivateAiRuntime: false,
    implementsPrivateEmbeddingClient: false,
    storesDuplicateBusinessRecords: false,
  });

  const graph = demoGraph({ tenantId: input.tenantId, workspaceId: input.workspaceId });
  const nodes = graph.listNodes({ tenantId: input.tenantId, workspaceId: input.workspaceId });

  // Document modality receives a synthetic vector boost when lexical already matches (hybrid merge).
  const vectorBoosts = new Map<string, number>();
  for (const n of nodes) {
    if (n.kind === "document" && /valve|leak|spec/i.test(`${n.title} ${n.snippet ?? ""}`)) {
      vectorBoosts.set(n.refId, 0.72);
    }
  }

  const search = hybridSearchNodes(nodes, {
    query: input.query,
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    limit: input.limit ?? 20,
  }, vectorBoosts);

  const groundedAnswer = input.includeGroundedAnswer
    ? generateKnowledgeGroundedAnswer({
        query: input.query,
        hits: search.hits,
        retrievalTraceId: search.retrievalTraceId,
      })
    : undefined;

  return {
    ...search,
    groundedAnswer,
    graphIntegrity: true,
  };
}

export function analyzeKnowledgeImpact(input: {
  refId: string;
  tenantId: string;
  workspaceId: string;
}) {
  const graph = demoGraph({ tenantId: input.tenantId, workspaceId: input.workspaceId });
  return {
    ...graph.impactAnalysis(input.refId, {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    }),
    neighbors: graph.neighbors(input.refId, {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
    }, 1),
    duplicateOwnership: false as const,
  };
}

export function runKnowledgeReasoningPipeline(input: {
  question: string;
  tenantId: string;
  workspaceId: string;
  seatAssigned?: boolean;
  workspaceAssigned?: boolean;
  canReadKnowledge?: boolean;
  seedRefIds?: readonly string[];
}): DeterministicReasoningResult {
  assertKnowledgeIntelligenceSharedServices();
  assertNoKnowledgePrivateInfrastructure({
    implementsPrivateAudit: false,
    implementsPrivateNotification: false,
    implementsPrivateAiRuntime: false,
    implementsPrivateEmbeddingClient: false,
    storesDuplicateBusinessRecords: false,
  });

  const graph = demoGraph({ tenantId: input.tenantId, workspaceId: input.workspaceId });
  const nodes = graph.listNodes({ tenantId: input.tenantId, workspaceId: input.workspaceId });
  const vectorBoosts = new Map<string, number>();
  for (const n of nodes) {
    if (n.kind === "document" && /valve|leak|spec/i.test(`${n.title} ${n.snippet ?? ""}`)) {
      vectorBoosts.set(n.refId, 0.72);
    }
  }

  return runDeterministicReasoningPipeline({
    question: input.question,
    graph,
    permissions: {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      seatAssigned: input.seatAssigned !== false,
      workspaceAssigned: input.workspaceAssigned !== false,
      canReadKnowledge: input.canReadKnowledge !== false,
    },
    seedRefIds: input.seedRefIds,
    vectorBoosts,
  });
}
