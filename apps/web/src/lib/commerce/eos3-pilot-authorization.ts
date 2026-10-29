/**
 * EOS 3.11R human Production Pilot authorization binding.
 * TECHNICALLY_READY != HUMAN_GO; HUMAN_GO != ENGINEERING_APPROVAL
 */

import { createHash } from "node:crypto";

export const EOS_3_PRODUCTION_PILOT_HUMAN_GO = "ISSUED" as const;

export const EOS_3_PILOT_RELEASE_AUTHORITY = {
  designated: true as const,
  name: "Silvestre Berso",
  role: "Founder, RTB Engineering & Analytics",
  scope: "EOS_3_CONTROLLED_PRODUCTION_PILOT_SOFTWARE_RELEASE_ONLY" as const,
};

/** Frozen candidate from EOS 3.11 gate. */
export const EOS_3_AUTHORIZED_CANDIDATE = {
  validatedRuntimeCommit: "c89f106af689a2e79c81a30d0a8420803e632220",
  releaseEvidenceCommit: "4417cc642ebf98f97a84066893db8fc6cd04947e",
  candidateFingerprint: "sha256:4c8f9bcb48c478b32fc8ccded642ada8a3f4f330952645ef8f0ff1b6d5b964e1",
  approvedMigrationCount: 9,
  ledgerTransition: { from: 161, to: 170 },
} as const;

/**
 * Authorized initial cohort: exactly one internal workspace.
 * Bound to the established eos-controlled-pilot Default Workspace from EOS 2 GA evidence
 * under GO cohort size = 1 (no substitute workspace).
 */
export const EOS_3_AUTHORIZED_PILOT_WORKSPACE = {
  tenantId: "4f7da5fe-4ffb-453d-9d63-b74ff36aba2a",
  tenantSlug: "eos-controlled-pilot",
  workspaceId: "5c85d773-3b79-43b2-b138-c6251f566768",
  workspaceName: "Default Workspace",
  count: 1,
} as const;

export const EOS_3_AUTHORIZED_PILOT_CONTROLS = {
  accessModel: "EXPLICIT_ENTITLEMENT_AND_ENROLLMENT",
  externalCustomerAccess: "DENIED",
  autoMigration: false,
  liveLlm: "DISABLED_NOT_VALIDATED",
  realConnectors: "DISABLED",
  spaceGassGlobalQualification: false,
  externalSolverGlobalQualification: false,
  d1: "QUALIFIED_BOUNDED",
  nonD1: "NOT_QUALIFIED",
  aiEngineeringAuthority: false,
  aiFinalDecisionAuthority: false,
  aiDeliverableApprovalAuthority: false,
  aiReleaseIfcAuthority: false,
  aiMigrationAuthority: false,
  aiSolverQualificationAuthority: false,
  projectStrategy: "NEW_EOS3_PILOT_PROJECT",
} as const;

export function createEos3PilotAuthorizationFingerprint(authorizedAtIso: string): string {
  const payload = {
    candidateFingerprint: EOS_3_AUTHORIZED_CANDIDATE.candidateFingerprint,
    validatedRuntimeCommit: EOS_3_AUTHORIZED_CANDIDATE.validatedRuntimeCommit,
    releaseEvidenceCommit: EOS_3_AUTHORIZED_CANDIDATE.releaseEvidenceCommit,
    approvedMigrationCount: EOS_3_AUTHORIZED_CANDIDATE.approvedMigrationCount,
    ledgerTransition: EOS_3_AUTHORIZED_CANDIDATE.ledgerTransition,
    targetWorkspace: EOS_3_AUTHORIZED_PILOT_WORKSPACE,
    controls: EOS_3_AUTHORIZED_PILOT_CONTROLS,
    releaseAuthority: EOS_3_PILOT_RELEASE_AUTHORITY,
    humanGo: EOS_3_PRODUCTION_PILOT_HUMAN_GO,
    authorizationDecision: "GO",
    authorizedAt: authorizedAtIso,
  };
  return "sha256:" + createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

/** Production EOS 3 access is allowed only for explicit PILOT enrollment under issued GO. */
export function eos3ProductionPilotAccessAllowed(enrollmentState: string | null | undefined): boolean {
  return EOS_3_PRODUCTION_PILOT_HUMAN_GO === "ISSUED" && enrollmentState === "PILOT";
}
