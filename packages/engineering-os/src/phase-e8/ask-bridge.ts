/**
 * Ask → action proposal mapping and review UX helpers.
 */

import type { EngineeringToolResult } from "../phase-e6/contracts";
import type {
  EngineeringActionType,
  CreateEngineeringActionProposalInput,
} from "./contracts";

export type AskActionKind =
  | "create_action"
  | "draft_response"
  | "prepare_decision"
  | "add_risk"
  | "add_issue"
  | "assign_review"
  | "link_evidence";

export function mapAskActionKindToType(kind: AskActionKind): EngineeringActionType {
  switch (kind) {
    case "create_action":
      return "CREATE_ACTION";
    case "draft_response":
      return "DRAFT_TQ_RESPONSE";
    case "prepare_decision":
      return "CREATE_DECISION_DRAFT";
    case "add_risk":
      return "CREATE_RISK_DRAFT";
    case "add_issue":
      return "CREATE_ISSUE_DRAFT";
    case "assign_review":
      return "ASSIGN_REVIEW";
    case "link_evidence":
      return "LINK_EVIDENCE";
    default:
      return "CREATE_ACTION";
  }
}

export const ASK_ACTION_BUTTONS: Array<{ id: AskActionKind; label: string }> = [
  { id: "create_action", label: "Create action" },
  { id: "draft_response", label: "Draft response" },
  { id: "prepare_decision", label: "Prepare decision" },
  { id: "add_risk", label: "Add risk" },
  { id: "add_issue", label: "Add issue" },
  { id: "assign_review", label: "Assign review" },
  { id: "link_evidence", label: "Link evidence" },
];

/**
 * Tool results may prefill only when immutable + successful.
 * Failed/incomplete/experimental cannot silently justify approved action.
 */
export function toolResultMayPrefill(toolResult: EngineeringToolResult | null | undefined): {
  ok: boolean;
  refs: string[];
  reason?: string;
} {
  if (!toolResult) return { ok: false, refs: [], reason: "no_tool_result" };
  if (toolResult.provenance.llmGenerated) {
    return { ok: false, refs: [], reason: "llm_fabricated_tool_result" };
  }
  if (!toolResult.immutable) {
    return { ok: false, refs: [], reason: "tool_result_not_immutable" };
  }
  if (
    toolResult.status === "FAILED" ||
    toolResult.status === "TIMEOUT" ||
    toolResult.status === "INCOMPLETE" ||
    toolResult.status === "BLOCKED"
  ) {
    return { ok: false, refs: [], reason: "failed_or_incomplete_tool_cannot_justify_action" };
  }
  if (toolResult.authorityStatus === "FAILED" || toolResult.authorityStatus === "BLOCKED") {
    return { ok: false, refs: [], reason: "tool_authority_blocked" };
  }
  return { ok: true, refs: [toolResult.invocationId] };
}

export function buildProposalInputFromAsk(input: {
  tenantId: string;
  workspaceId?: string | null;
  projectId?: string | null;
  userId: string;
  kind: AskActionKind;
  title?: string;
  description?: string;
  draftText?: string;
  objectType?: string | null;
  objectId?: string | null;
  evidenceRefs?: string[];
  reasoningRef?: string | null;
  memoryRefs?: string[];
  toolResult?: EngineeringToolResult | null;
  askQuery?: string | null;
  assigneeId?: string | null;
}): CreateEngineeringActionProposalInput {
  const actionType = mapAskActionKindToType(input.kind);
  const tool = toolResultMayPrefill(input.toolResult);
  const payload: Record<string, unknown> = {
    title:
      input.title ??
      (input.kind === "draft_response"
        ? "Draft TQ response"
        : input.kind === "prepare_decision"
          ? "Decision draft"
          : "Engineering action"),
    description: input.description ?? input.draftText ?? null,
    status: "draft",
    draftText: input.draftText ?? null,
    assigneeId: input.assigneeId ?? null,
    projectId: input.projectId ?? null,
    objectType: input.objectType ?? null,
    objectId: input.objectId ?? null,
  };
  if (tool.ok && input.toolResult?.output) {
    payload.toolPrefill = input.toolResult.output;
  }

  return {
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    userId: input.userId,
    actionType,
    proposedPayload: payload,
    sourceContext: {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      projectId: input.projectId,
      objectType: input.objectType,
      objectId: input.objectId,
      askQuery: input.askQuery,
      contextResolvedAt: new Date().toISOString(),
    },
    targetObject:
      input.objectId && input.objectType
        ? {
            objectType: input.objectType,
            objectId: input.objectId,
            tenantId: input.tenantId,
            projectId: input.projectId,
          }
        : null,
    evidenceRefs: input.evidenceRefs ?? [],
    reasoningRef: input.reasoningRef,
    toolResultRefs: tool.ok ? tool.refs : [],
    memoryRefs: input.memoryRefs ?? [],
    llmGeneratedDraft:
      Boolean(input.draftText) ||
      input.kind === "draft_response" ||
      input.kind === "prepare_decision",
    permissions: ["engineering_action.propose"],
  };
}
