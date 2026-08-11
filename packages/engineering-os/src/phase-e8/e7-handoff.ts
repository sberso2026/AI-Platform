/**
 * Completed governed actions may emit E7 memory candidates.
 * Rejected proposals / draft text never become approved organisational knowledge.
 */

import type { EngineeringObjectReference } from "../phase-e3/contracts";
import type { EngineeringMemoryCaptureService } from "../phase-e7/capture";
import type { EngineeringActionProposal } from "./contracts";

export async function emitMemoryCandidateFromCompletedAction(input: {
  proposal: EngineeringActionProposal;
  capture: EngineeringMemoryCaptureService;
  subject?: EngineeringObjectReference | null;
}): Promise<{ emitted: boolean; reason?: string; memoryId?: string }> {
  const p = input.proposal;
  if (p.approvalState === "REJECTED") {
    return { emitted: false, reason: "rejected_proposal_not_promoted" };
  }
  if (p.approvalState !== "COMPLETED") {
    return { emitted: false, reason: "only_completed_actions_emit_memory" };
  }
  if (!p.domainResultId) {
    return { emitted: false, reason: "missing_domain_result" };
  }

  const subject: EngineeringObjectReference =
    input.subject ??
    ({
      objectType: "ACTION",
      objectId: p.domainResultId,
      tenantId: p.tenantId,
      workspaceId: p.workspaceId,
      projectId: p.projectId,
      authority: "ENGINEERING_OS",
      provenance: {
        sourceType: "action_proposal",
        sourceId: p.proposalId,
        mechanism: "SYSTEM",
        timestamp: new Date().toISOString(),
      },
    } as EngineeringObjectReference);

  const { record, blockedReason } = await input.capture.capture({
    tenantId: p.tenantId,
    workspaceId: p.workspaceId,
    projectId: p.projectId,
    subject,
    summary: `Completed governed ${p.actionType}: ${String(p.proposedPayload.title ?? p.proposalId)}`,
    fact: p.domainResultId
      ? `Domain ${p.domainResultType}:${p.domainResultId}`
      : null,
    evidenceRefs: p.evidenceRefs,
    sourceType: "project_outcome",
    sourceId: p.domainResultId,
    authorityStatus: "OBSERVED",
    eventType: "engineering.action_proposal.completed",
    createdBy: p.reviewedBy ?? p.provenance.createdBy,
    memoryClass: "PROJECT_MEMORY",
    relatedObjects: [],
  });

  if (!record) {
    return { emitted: false, reason: blockedReason ?? "capture_blocked" };
  }
  return { emitted: true, memoryId: record.memoryId };
}
