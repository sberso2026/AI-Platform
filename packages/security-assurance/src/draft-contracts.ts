/**
 * Phase 15A draft public contracts — 0.1.0-draft only.
 * Not frozen. No database / runtime persistence.
 */

export type SecurityControlReference = {
  controlId: string;
  title: string;
  objective: string;
  ownerDomain: "security_assurance" | "platform_core" | "ops" | "external";
};

export type SecurityEvidenceReference = {
  evidenceId: string;
  source:
    | "ci"
    | "rls_cert"
    | "idor_test"
    | "dependency_sca"
    | "secret_scan"
    | "backup_restore"
    | "identity_mfa"
    | "policy_evaluation"
    | "execution_host"
    | "ai_provider_policy"
    | "incident_exercise"
    | "audit_event"
    | "external_pentest"
    | "external_certification";
  timestamp: string;
  scope: string;
  controlIds: string[];
  integrityRef?: string;
  status: "current" | "stale" | "unknown" | "failed";
  collector: string;
  limitations?: string;
  freshnessExpiry?: string;
};

export type SecurityAssessment = {
  assessmentId: string;
  controlId: string;
  result: "PASS" | "FAIL" | "PARTIAL" | "UNKNOWN";
  evidenceRefs: string[];
  assessedAt: string;
  notes?: string;
};

export type SecurityFinding = {
  findingId: string;
  severity: "critical" | "high" | "medium" | "low" | "info";
  source: string;
  summary: string;
  normalizedAt: string;
  /** Never store secret/sensitive payloads */
  containsSensitivePayload: false;
};

export type SecurityException = {
  exceptionId: string;
  controlId: string;
  justification: string;
  approvedBy: string;
  reviewBy: string;
  status: "active" | "expired" | "revoked";
};

export type SecurityPostureSnapshot = {
  snapshotId: string;
  capturedAt: string;
  dimensions: Record<string, "PASS" | "FAIL" | "PARTIAL" | "UNKNOWN">;
  /** No opaque universal score in 15A */
  universalScorePresent: false;
};

export type ComplianceMapping = {
  controlId: string;
  frameworks: Array<"ISO27001" | "NIST_CSF_2" | "ESSENTIAL_EIGHT" | "SOC2_TSC_RESERVED">;
  mappingNote: string;
};

export type ExternalAssuranceReference = {
  assuranceId: string;
  type: "iso27001" | "soc2" | "essential_eight" | "penetration_test" | "other";
  status: "not_obtained" | "in_progress" | "obtained";
  /** RTB control status ≠ this opinion */
  isExternalOpinion: true;
};

export const SECURITY_ASSURANCE_DRAFT_CONTRACT_NAMES = [
  "SecurityControlReference",
  "SecurityEvidenceReference",
  "SecurityAssessment",
  "SecurityFinding",
  "SecurityException",
  "SecurityPostureSnapshot",
  "ComplianceMapping",
  "ExternalAssuranceReference",
] as const;
