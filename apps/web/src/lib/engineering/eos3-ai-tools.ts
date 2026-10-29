/**
 * EOS 3.7 governed AI tool registry.
 * AI_TOOL_USE != TOOL_QUALIFICATION
 */

import type { ToolSideEffect } from "./eos3-ai-policy";

export type ToolQualificationState =
  | "n/a"
  | "INTEGRATED_NOT_VALIDATED"
  | "VALIDATED_BOUNDED"
  | "QUALIFIED_BOUNDED"
  | "QUALIFIED";

export type Eos3AiTool = {
  toolId: string;
  category:
    | "canonical_object_retrieval"
    | "graph_trace"
    | "knowledge_intelligence"
    | "decision_intelligence"
    | "optimization_intelligence"
    | "workflow"
    | "solver_framework"
    | "connector_framework"
    | "deterministic_calculation"
    | "audit_provenance";
  capability: string;
  inputContract: string;
  outputContract: string;
  authorityRequirement: "AI_ALLOWED" | "HUMAN_CHECKPOINT_REQUIRED" | "HUMAN_ONLY";
  qualificationState: ToolQualificationState;
  sideEffect: ToolSideEffect;
  tenantScoped: true;
  workspaceScoped: true;
  auditRequired: true;
};

export const EOS3_AI_TOOL_REGISTRY: Eos3AiTool[] = [
  {
    toolId: "tool.retrieve.canonical",
    category: "canonical_object_retrieval",
    capability: "READ_CANONICAL",
    inputContract: "objectId|query",
    outputContract: "context_items",
    authorityRequirement: "AI_ALLOWED",
    qualificationState: "n/a",
    sideEffect: "READ_ONLY",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.graph.trace",
    category: "graph_trace",
    capability: "TRACE_RELATIONSHIPS",
    inputContract: "objectId",
    outputContract: "edges",
    authorityRequirement: "AI_ALLOWED",
    qualificationState: "n/a",
    sideEffect: "READ_ONLY",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.knowledge.retrieve",
    category: "knowledge_intelligence",
    capability: "HYBRID_RETRIEVAL",
    inputContract: "query",
    outputContract: "hits+provenance",
    authorityRequirement: "AI_ALLOWED",
    qualificationState: "n/a",
    sideEffect: "READ_ONLY",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.decision.support",
    category: "decision_intelligence",
    capability: "PREPARE_RECOMMENDATION",
    inputContract: "decisionCaseId",
    outputContract: "recommendation_draft",
    authorityRequirement: "AI_ALLOWED",
    qualificationState: "n/a",
    sideEffect: "DRAFT_WRITE",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.optimization.request",
    category: "optimization_intelligence",
    capability: "REQUEST_OPTIMIZATION",
    inputContract: "problem_draft",
    outputContract: "optimization_request",
    authorityRequirement: "HUMAN_CHECKPOINT_REQUIRED",
    qualificationState: "n/a",
    sideEffect: "DRAFT_WRITE",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.workflow.draft_work_item",
    category: "workflow",
    capability: "DRAFT_WORK_ITEM",
    inputContract: "objectId+type",
    outputContract: "work_item_draft",
    authorityRequirement: "AI_ALLOWED",
    qualificationState: "n/a",
    sideEffect: "DRAFT_WRITE",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.workflow.transition",
    category: "workflow",
    capability: "TRANSITION",
    inputContract: "instance+to",
    outputContract: "denied_or_human",
    authorityRequirement: "HUMAN_ONLY",
    qualificationState: "n/a",
    sideEffect: "HUMAN_ONLY_ACTION",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.solver.prepare",
    category: "solver_framework",
    capability: "PREPARE_SOLVER_REQUEST",
    inputContract: "manifest_draft",
    outputContract: "solver_request_draft",
    authorityRequirement: "HUMAN_CHECKPOINT_REQUIRED",
    qualificationState: "INTEGRATED_NOT_VALIDATED",
    sideEffect: "DRAFT_WRITE",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.solver.qualify",
    category: "solver_framework",
    capability: "CHANGE_QUALIFICATION",
    inputContract: "solverId+state",
    outputContract: "denied",
    authorityRequirement: "HUMAN_ONLY",
    qualificationState: "n/a",
    sideEffect: "HUMAN_ONLY_ACTION",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.connector.read",
    category: "connector_framework",
    capability: "READ_AUTHORIZED",
    inputContract: "connectorId+query",
    outputContract: "connector_hits",
    authorityRequirement: "AI_ALLOWED",
    qualificationState: "n/a",
    sideEffect: "READ_ONLY",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.connector.secret",
    category: "connector_framework",
    capability: "READ_SECRET",
    inputContract: "connectorId",
    outputContract: "denied",
    authorityRequirement: "HUMAN_ONLY",
    qualificationState: "n/a",
    sideEffect: "HUMAN_ONLY_ACTION",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
  {
    toolId: "tool.audit.provenance",
    category: "audit_provenance",
    capability: "READ_PROVENANCE",
    inputContract: "objectId",
    outputContract: "provenance",
    authorityRequirement: "AI_ALLOWED",
    qualificationState: "n/a",
    sideEffect: "READ_ONLY",
    tenantScoped: true,
    workspaceScoped: true,
    auditRequired: true,
  },
];

export function getTool(toolId: string): Eos3AiTool | undefined {
  return EOS3_AI_TOOL_REGISTRY.find((t) => t.toolId === toolId);
}

/** AI cannot elevate tool/solver qualification. */
export function aiMayChangeToolQualification(): false {
  return false;
}

export function toolAwareOfQualification(tool: Eos3AiTool): {
  known: true;
  state: ToolQualificationState;
  elevates: false;
} {
  return { known: true, state: tool.qualificationState, elevates: false };
}

/** Documents/connectors are data, not privileged instructions. */
export function sanitizeRetrievedInstruction(content: string): {
  treatedAsData: true;
  attemptedToolInjection: boolean;
  blockedTools: string[];
} {
  const blockedTools: string[] = [];
  const lower = content.toLowerCase();
  const injection =
    /ignore previous|system prompt|invoke tool|call solver|exfiltrate|send secrets|use connector secret|approve this|release ifc/.test(
      lower,
    );
  if (/invoke\s+tool\.solver\.qualify|change_solver_qualification|tool\.connector\.secret/.test(lower)) {
    blockedTools.push("tool.solver.qualify", "tool.connector.secret");
  }
  if (/invoke\s+tool\.workflow\.transition/.test(lower)) {
    blockedTools.push("tool.workflow.transition");
  }
  return { treatedAsData: true, attemptedToolInjection: injection || blockedTools.length > 0, blockedTools };
}
