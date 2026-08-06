/**
 * Engineering Assessment — structured assessments; AI drafts require mandatory human approval.
 */
import { randomUUID } from "node:crypto";

export type EngineeringAssessmentStatus =
  | "draft"
  | "ai_draft_pending_human"
  | "human_approved"
  | "rejected"
  | "superseded";

export type EngineeringAssessment = {
  id: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId?: string;
  title: string;
  body: string;
  aiGenerated: boolean;
  aiRunId?: string;
  status: EngineeringAssessmentStatus;
  approvedByPersonId?: string;
  createdAt: string;
  updatedAt: string;
};

export function createHumanAssessment(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId?: string;
  title: string;
  body: string;
}): EngineeringAssessment {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    ...input,
    aiGenerated: false,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };
}

/** AI may only produce drafts — never auto-approved. */
export function createAiAssessmentDraft(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  defectId?: string;
  title: string;
  body: string;
  aiRunId: string;
}): EngineeringAssessment {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    defectId: input.defectId,
    title: input.title,
    body: input.body,
    aiGenerated: true,
    aiRunId: input.aiRunId,
    status: "ai_draft_pending_human",
    createdAt: now,
    updatedAt: now,
  };
}

export function approveAssessment(
  assessment: EngineeringAssessment,
  approvedByPersonId: string,
): EngineeringAssessment {
  if (assessment.aiGenerated && assessment.status !== "ai_draft_pending_human") {
    throw new Error("ai_assessment_not_pending_human");
  }
  if (!assessment.aiGenerated && assessment.status !== "draft") {
    throw new Error("assessment_not_approvable");
  }
  if (!approvedByPersonId) {
    throw new Error("human_approval_required");
  }
  return {
    ...assessment,
    status: "human_approved",
    approvedByPersonId,
    updatedAt: new Date().toISOString(),
  };
}

export function rejectAssessment(assessment: EngineeringAssessment): EngineeringAssessment {
  return { ...assessment, status: "rejected", updatedAt: new Date().toISOString() };
}
