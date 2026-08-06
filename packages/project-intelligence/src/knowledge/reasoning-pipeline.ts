/**
 * Phase 8H — Deterministic reasoning pipeline orchestrator.
 *
 * Question → Intent → Permission → Graph Traversal → Hybrid Retrieval →
 * Evidence Ranking → Conflict Detection → Reasoning → Grounded Answer →
 * Citations → Confidence → Abstention → Drill-down
 */
import type { EngineeringKnowledgeGraph } from "./graph";
import type { KnowledgeNodeRef } from "./types";
import type {
  DeterministicReasoningResult,
  ReasoningPipelineRequest,
  StageTrace,
} from "./reasoning-types";
import { REASONING_PIPELINE_STAGES } from "./reasoning-types";
import {
  buildDrillDown,
  buildReasoningSteps,
  classifyIntent,
  collectCitations,
  composeGroundedAnswer,
  computeConfidence,
  decideAbstention,
  detectEvidenceConflicts,
  normalizeQuestion,
  rankEvidence,
  runHybridRetrieval,
  selectTraversalSeeds,
  trace,
  traverseKnowledgeGraph,
  validatePermissions,
} from "./reasoning-stages";

export type RunDeterministicReasoningPipelineInput = ReasoningPipelineRequest & {
  graph: EngineeringKnowledgeGraph;
  /** Optional document vector boosts (reuse DI embeddings when available). */
  vectorBoosts?: ReadonlyMap<string, number>;
};

function emptyResult(
  question: string,
  partial: Partial<DeterministicReasoningResult> & {
    stageTrace: StageTrace[];
    intent: DeterministicReasoningResult["intent"];
    intentConfidence: number;
    permitted: boolean;
    permissionFailure: string | null;
  },
): DeterministicReasoningResult {
  return {
    kind: "knowledge_intelligence.deterministic_reasoning",
    pipeline: REASONING_PIPELINE_STAGES,
    deterministic: true,
    usesPlatformAiRuntime: true,
    implementsPrivateAiClient: false,
    duplicateOwnership: false,
    question,
    intent: partial.intent,
    intentConfidence: partial.intentConfidence,
    permitted: partial.permitted,
    permissionFailure: partial.permissionFailure,
    traversalSeedRefIds: partial.traversalSeedRefIds ?? [],
    traversalNodeRefIds: partial.traversalNodeRefIds ?? [],
    retrievalTraceId: partial.retrievalTraceId ?? `kg-reason-${Date.now().toString(36)}`,
    rankedEvidence: partial.rankedEvidence ?? [],
    conflicts: partial.conflicts ?? [],
    reasoningSteps: partial.reasoningSteps ?? [],
    status: "abstained",
    answer: "",
    citations: partial.citations ?? [],
    confidence: partial.confidence ?? 0,
    abstained: true,
    abstentionReason: partial.abstentionReason ?? "pipeline_halted",
    drillDown: partial.drillDown ?? [],
    stageTrace: partial.stageTrace,
  };
}

export function runDeterministicReasoningPipeline(
  input: RunDeterministicReasoningPipelineInput,
): DeterministicReasoningResult {
  const stageTrace: StageTrace[] = [];
  const question = normalizeQuestion(input.question);
  stageTrace.push(
    trace("question", question ? "pass" : "fail", question ? "normalized" : "empty_question"),
  );
  if (!question) {
    return emptyResult(question, {
      stageTrace,
      intent: "unknown",
      intentConfidence: 0,
      permitted: false,
      permissionFailure: "empty_question",
      abstentionReason: "empty_question",
    });
  }

  const { intent, confidence: intentConfidence } = classifyIntent(question);
  stageTrace.push(trace("intent_classification", "pass", `${intent}@${intentConfidence.toFixed(2)}`));

  const permission = validatePermissions(input.permissions);
  stageTrace.push(
    trace(
      "permission_validation",
      permission.permitted ? "pass" : "fail",
      permission.failure ?? "permitted",
    ),
  );
  if (!permission.permitted) {
    return emptyResult(question, {
      stageTrace,
      intent,
      intentConfidence,
      permitted: false,
      permissionFailure: permission.failure,
      abstentionReason: permission.failure,
    });
  }

  const scope = {
    tenantId: input.permissions.tenantId,
    workspaceId: input.permissions.workspaceId,
  };
  const allNodes = input.graph.listNodes(scope);
  const seeds = selectTraversalSeeds(question, allNodes, input.seedRefIds ?? []);
  const traversal = traverseKnowledgeGraph(input.graph, scope, seeds, 1);
  stageTrace.push(
    trace(
      "knowledge_graph_traversal",
      traversal.nodeRefIds.length ? "pass" : "pass",
      `seeds=${seeds.length};nodes=${traversal.nodeRefIds.length}`,
    ),
  );

  const retrievalPool: KnowledgeNodeRef[] =
    traversal.nodes.length > 0
      ? [...new Map([...allNodes, ...traversal.nodes].map((n) => [n.refId, n])).values()]
      : allNodes;

  const retrieval = runHybridRetrieval({
    question,
    nodes: retrievalPool,
    tenantId: scope.tenantId,
    workspaceId: scope.workspaceId,
    allowedOwners: input.permissions.allowedOwners,
    allowedKinds: input.permissions.allowedKinds,
    limit: input.retrievalLimit ?? 20,
    vectorBoosts: input.vectorBoosts,
  });
  stageTrace.push(
    trace("hybrid_retrieval", retrieval.hits.length ? "pass" : "pass", `hits=${retrieval.hits.length}`),
  );

  const ranked = rankEvidence(retrieval.hits, new Set(traversal.nodeRefIds), intent);
  stageTrace.push(trace("evidence_ranking", "pass", `ranked=${ranked.length}`));

  const conflicts = detectEvidenceConflicts(ranked, intent);
  stageTrace.push(
    trace(
      "conflict_detection",
      conflicts.some((c) => c.kind === "opposing_snippets") ? "fail" : "pass",
      `conflicts=${conflicts.length}`,
    ),
  );

  const reasoningSteps = buildReasoningSteps(question, intent, ranked, conflicts);
  stageTrace.push(trace("reasoning", "pass", `steps=${reasoningSteps.length}`));

  const draftAnswer = composeGroundedAnswer({
    question,
    intent,
    steps: reasoningSteps,
    ranked,
  });
  stageTrace.push(
    trace("grounded_answer", draftAnswer ? "pass" : "fail", draftAnswer ? "composed" : "empty"),
  );

  const citations = collectCitations(ranked);
  stageTrace.push(trace("citations", citations.length ? "pass" : "fail", `n=${citations.length}`));

  const confidence = computeConfidence({
    ranked,
    conflicts,
    citations,
    intentConfidence,
  });
  stageTrace.push(trace("confidence", "pass", confidence.toFixed(3)));

  const abstention = decideAbstention({
    permitted: true,
    permissionFailure: null,
    citations,
    confidence,
    minConfidence: input.minConfidence ?? 0.45,
    minCitations: input.minCitations ?? 1,
    scoreThreshold: input.scoreThreshold ?? 0.2,
    ranked,
    conflicts,
  });
  stageTrace.push(
    trace("abstention", abstention.abstain ? "fail" : "pass", abstention.reason ?? "answer"),
  );

  const drillDown = buildDrillDown(citations);
  stageTrace.push(trace("drill_down", drillDown.length ? "pass" : "pass", `links=${drillDown.length}`));

  if (abstention.abstain) {
    return {
      kind: "knowledge_intelligence.deterministic_reasoning",
      pipeline: REASONING_PIPELINE_STAGES,
      deterministic: true,
      usesPlatformAiRuntime: true,
      implementsPrivateAiClient: false,
      duplicateOwnership: false,
      question,
      intent,
      intentConfidence,
      permitted: true,
      permissionFailure: null,
      traversalSeedRefIds: seeds,
      traversalNodeRefIds: traversal.nodeRefIds,
      retrievalTraceId: retrieval.retrievalTraceId,
      rankedEvidence: ranked,
      conflicts,
      reasoningSteps,
      status: "abstained",
      answer: "",
      citations: [],
      confidence,
      abstained: true,
      abstentionReason: abstention.reason,
      drillDown: [],
      stageTrace,
    };
  }

  return {
    kind: "knowledge_intelligence.deterministic_reasoning",
    pipeline: REASONING_PIPELINE_STAGES,
    deterministic: true,
    usesPlatformAiRuntime: true,
    implementsPrivateAiClient: false,
    duplicateOwnership: false,
    question,
    intent,
    intentConfidence,
    permitted: true,
    permissionFailure: null,
    traversalSeedRefIds: seeds,
    traversalNodeRefIds: traversal.nodeRefIds,
    retrievalTraceId: retrieval.retrievalTraceId,
    rankedEvidence: ranked,
    conflicts,
    reasoningSteps,
    status: "answered",
    answer: draftAnswer,
    citations,
    confidence,
    abstained: false,
    abstentionReason: null,
    drillDown,
    stageTrace,
  };
}
