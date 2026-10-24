/**
 * Phase 9D engineering domain completion happy path.
 */
import { createDefect, transitionDefect } from "./defects";
import { createRecommendation, issueRecommendation } from "./recommendations";
import {
  createCorrectiveAction,
  transitionCorrectiveAction,
} from "./corrective-actions";
import {
  createAiAssessmentDraft,
  approveAssessment,
} from "./assessments";
import { requestVerification, completeVerification } from "./verification";
import { closeOutInspectionSession, evaluateInspectionCloseOut } from "./close-out";
import { createComplianceLink } from "./compliance";
import { computeBasicInspectionKpis } from "./kpis";
import { createInProcessRiskRegisterAdapter } from "./risk-adapter";
import type { InspectionSessionState } from "./state-machine";

export type EngineeringDomainCompletionResult = {
  sessionStatus: InspectionSessionState;
  defectId: string;
  recommendationId: string;
  correctiveActionId: string;
  assessmentId: string;
  verificationId: string;
  complianceLinkId: string;
  riskId: string;
  kpis: ReturnType<typeof computeBasicInspectionKpis>;
  closeOutAllowed: boolean;
};

export async function runEngineeringDomainCompletionHappyPath(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  actorUserId: string;
}): Promise<EngineeringDomainCompletionResult> {
  let defect = createDefect({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    title: "Coating breakdown",
    description: "Localized coating failure",
    taxonomy: {
      severity: "high",
      urgency: "priority",
      monitoringRequired: true,
      defectCategory: "coating",
      failureMode: "delamination",
    },
    assetRef: {
      tenantId: input.tenantId,
      workspaceId: input.workspaceId,
      assetId: "asset-1",
    },
  });
  defect = transitionDefect(defect, "classified");
  defect = transitionDefect(defect, "open");

  let recommendation = createRecommendation({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    defectId: defect.id,
    action: "repair",
    rationale: "Restore protective coating",
  });
  recommendation = issueRecommendation(recommendation);

  let action = createCorrectiveAction({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    defectId: defect.id,
    recommendationId: recommendation.id,
    ownerPersonId: input.actorUserId,
    dueAt: new Date(Date.now() + 14 * 86400000).toISOString(),
    description: "Blast and recoat affected area",
  });
  action = transitionCorrectiveAction(action, "in_progress");
  action = transitionCorrectiveAction(action, "pending_verification");

  let assessment = createAiAssessmentDraft({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    defectId: defect.id,
    title: "AI draft assessment",
    body: "Proposed repair scope",
    aiRunId: "runtime-run-1",
  });
  assessment = approveAssessment(assessment, input.actorUserId);

  let verification = requestVerification({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    kind: "corrective_action",
    subjectId: action.id,
  });
  verification = completeVerification(verification, {
    status: "passed",
    verifierPersonId: input.actorUserId,
    notes: "Work verified on site",
  });
  action = transitionCorrectiveAction(action, "verified");
  action = transitionCorrectiveAction(action, "closed");
  defect = transitionDefect(defect, "mitigating");
  defect = transitionDefect(defect, "awaiting_verification");
  defect = transitionDefect(defect, "verified");
  defect = transitionDefect(defect, "closed");

  const compliance = createComplianceLink({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    defectId: defect.id,
    family: "NACE",
    code: "SP0188",
    title: "Discontinuity Testing",
    conformity: "nonconforms",
  });

  const riskAdapter = createInProcessRiskRegisterAdapter();
  const risk = await riskAdapter.linkOrCreate({
    tenantId: input.tenantId,
    workspaceId: input.workspaceId,
    sessionId: input.sessionId,
    defectId: defect.id,
    title: "Coating integrity risk",
    description: defect.description,
    severity: "high",
    assetRef: defect.assetRef,
  });

  const closeEval = evaluateInspectionCloseOut({
    sessionStatus: "verified",
    correctiveActions: [action],
    verifications: [verification],
  });
  const sessionStatus = closeOutInspectionSession({
    sessionStatus: "verified",
    correctiveActions: [action],
    verifications: [verification],
    auth: { action: "inspection.approve", actorUserId: input.actorUserId },
  });

  const kpis = computeBasicInspectionKpis({
    sessionsCompleted: 1,
    sessionsOverdue: 0,
    defectsOpen: 0,
    defectsCritical: 0,
    correctiveActionsOverdue: 0,
    verificationsPassed: 1,
    verificationsTotal: 1,
    meanTimeToCloseDays: 2,
  });

  return {
    sessionStatus,
    defectId: defect.id,
    recommendationId: recommendation.id,
    correctiveActionId: action.id,
    assessmentId: assessment.id,
    verificationId: verification.id,
    complianceLinkId: compliance.id,
    riskId: risk.riskId,
    kpis,
    closeOutAllowed: closeEval.canClose,
  };
}
