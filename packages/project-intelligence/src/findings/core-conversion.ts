/**
 * Phase 8E — Core conversion proposals. No automatic Core mutation.
 */
import { FindingsIntelligenceError } from "./errors";
import type { FindingsCoreTargetType } from "./types";
import { FINDINGS_CORE_TARGET_TYPES } from "./types";

export type FindingsConversionProposal = {
  findingId: string;
  targetType: FindingsCoreTargetType;
  title: string;
  description?: string;
  proposedBy: string;
  proposedAt: string;
  status: "proposed" | "approved" | "rejected";
  mayAutoConvert: false;
};

export type FindingsConversionResult = {
  findingId: string;
  coreRecordId: string;
  coreRecordType: FindingsCoreTargetType;
  backlink: { findingId: string; coreRecordId: string };
  idempotent: boolean;
  auditEventType: "project_intelligence.findings.converted";
  coreMutationViaAdapter: true;
};

export function proposeFindingsConversion(input: {
  findingId: string;
  targetType: FindingsCoreTargetType;
  title: string;
  description?: string;
  proposedBy: string;
  findingStatus: string;
}): FindingsConversionProposal {
  if (!(FINDINGS_CORE_TARGET_TYPES as readonly string[]).includes(input.targetType)) {
    throw new FindingsIntelligenceError("findings_target_invalid", "Invalid Core target type", 400);
  }
  if (input.findingStatus !== "accepted" && input.findingStatus !== "conversion_proposed") {
    throw new FindingsIntelligenceError(
      "findings_not_accepted",
      "Only accepted findings may propose Core conversion",
      409,
      { status: input.findingStatus },
    );
  }
  if (!input.proposedBy.trim()) {
    throw new FindingsIntelligenceError("findings_actor_required", "Proposer required", 400);
  }
  return {
    findingId: input.findingId,
    targetType: input.targetType,
    title: input.title,
    description: input.description,
    proposedBy: input.proposedBy,
    proposedAt: new Date().toISOString(),
    status: "proposed",
    mayAutoConvert: false,
  };
}

export function executeFindingsConversion(input: {
  proposal: FindingsConversionProposal;
  approverUserId: string;
  workspaceAuthorized: boolean;
  roleAuthorized: boolean;
  existingCoreRecordId?: string;
  newCoreRecordId: string;
}): FindingsConversionResult {
  if (!input.approverUserId.trim()) {
    throw new FindingsIntelligenceError("findings_actor_required", "Approver required", 400);
  }
  if (!input.workspaceAuthorized || !input.roleAuthorized) {
    throw new FindingsIntelligenceError(
      "findings_conversion_denied",
      "Workspace or role authorization failed for Core conversion",
      403,
    );
  }
  if (input.proposal.mayAutoConvert !== false) {
    throw new FindingsIntelligenceError(
      "findings_auto_convert_forbidden",
      "Automatic conversion is forbidden",
      403,
    );
  }
  if (input.existingCoreRecordId) {
    return {
      findingId: input.proposal.findingId,
      coreRecordId: input.existingCoreRecordId,
      coreRecordType: input.proposal.targetType,
      backlink: { findingId: input.proposal.findingId, coreRecordId: input.existingCoreRecordId },
      idempotent: true,
      auditEventType: "project_intelligence.findings.converted",
      coreMutationViaAdapter: true,
    };
  }
  return {
    findingId: input.proposal.findingId,
    coreRecordId: input.newCoreRecordId,
    coreRecordType: input.proposal.targetType,
    backlink: { findingId: input.proposal.findingId, coreRecordId: input.newCoreRecordId },
    idempotent: false,
    auditEventType: "project_intelligence.findings.converted",
    coreMutationViaAdapter: true,
  };
}
