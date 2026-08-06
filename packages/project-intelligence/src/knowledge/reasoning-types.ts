/**
 * Phase 8H — Deterministic reasoning pipeline types.
 * Question → … → Drill-down. No private AI client; Platform AI Runtime only.
 */

import type { KnowledgeCitation, KnowledgeEntityKind, KnowledgeNodeRef } from "./types";
import type { UnifiedSearchHit } from "./hybrid-search";

export const REASONING_PIPELINE_STAGES = [
  "question",
  "intent_classification",
  "permission_validation",
  "knowledge_graph_traversal",
  "hybrid_retrieval",
  "evidence_ranking",
  "conflict_detection",
  "reasoning",
  "grounded_answer",
  "citations",
  "confidence",
  "abstention",
  "drill_down",
] as const;

export type ReasoningPipelineStageId = (typeof REASONING_PIPELINE_STAGES)[number];

export const REASONING_INTENTS = [
  "lookup",
  "impact",
  "related",
  "summarize",
  "conflict_probe",
  "unknown",
] as const;

export type ReasoningIntent = (typeof REASONING_INTENTS)[number];

export type ReasoningPermissionContext = {
  tenantId: string;
  workspaceId: string;
  seatAssigned: boolean;
  workspaceAssigned: boolean;
  canReadKnowledge: boolean;
  allowedOwners?: readonly KnowledgeNodeRef["owner"][];
  allowedKinds?: readonly KnowledgeEntityKind[];
};

export type ReasoningPipelineRequest = {
  question: string;
  permissions: ReasoningPermissionContext;
  /** Optional seed refs for traversal (e.g. from UI selection). */
  seedRefIds?: readonly string[];
  retrievalLimit?: number;
  minConfidence?: number;
  minCitations?: number;
  scoreThreshold?: number;
};

export type StageTrace = {
  stage: ReasoningPipelineStageId;
  status: "pass" | "fail" | "skip";
  detail: string;
  at: string;
};

export type RankedEvidence = UnifiedSearchHit & {
  rank: number;
  graphProximity: number;
  combinedScore: number;
};

export type ConflictFinding = {
  kind: "opposing_snippets" | "owner_disagreement" | "insufficient_corroboration";
  refIds: readonly string[];
  detail: string;
};

export type ReasoningStep = {
  id: string;
  premise: string;
  evidenceRefIds: readonly string[];
};

export type DrillDownLink = {
  refId: string;
  label: string;
  path: string;
  owner: KnowledgeNodeRef["owner"];
  kind: KnowledgeEntityKind;
};

export type DeterministicReasoningResult = {
  kind: "knowledge_intelligence.deterministic_reasoning";
  pipeline: typeof REASONING_PIPELINE_STAGES;
  deterministic: true;
  usesPlatformAiRuntime: true;
  implementsPrivateAiClient: false;
  duplicateOwnership: false;
  question: string;
  intent: ReasoningIntent;
  intentConfidence: number;
  permitted: boolean;
  permissionFailure: string | null;
  traversalSeedRefIds: readonly string[];
  traversalNodeRefIds: readonly string[];
  retrievalTraceId: string;
  rankedEvidence: readonly RankedEvidence[];
  conflicts: readonly ConflictFinding[];
  reasoningSteps: readonly ReasoningStep[];
  status: "answered" | "abstained";
  answer: string;
  citations: readonly KnowledgeCitation[];
  confidence: number;
  abstained: boolean;
  abstentionReason: string | null;
  drillDown: readonly DrillDownLink[];
  stageTrace: readonly StageTrace[];
};
