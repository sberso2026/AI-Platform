/**
 * Core Security & Assurance semantics (Phase 15B).
 * Fail-closed evaluation helpers.
 */

import type {
  AssessmentResult,
  EvidenceStatus,
  SecurityEvidenceReference,
} from "../contracts";

export const SEMANTICS = {
  controlDefinedNeqImplemented: true,
  controlImplementedNeqEffective: true,
  evidencePresentNeqSufficient: true,
  evidenceStaleNeqCurrentAssurance: true,
  automatedEvidenceNeqIndependentAssurance: true,
  frameworkMappingNeqCertification: true,
  internalAssessmentNeqExternalAudit: true,
  findingNeqIncident: true,
  exceptionNeqRemediation: true,
  postureNeqCertification: true,
} as const;

export function evaluateEvidenceFreshness(
  evidence: Pick<
    SecurityEvidenceReference,
    "status" | "expiresAt" | "effectiveAt" | "collectedAt"
  >,
  nowIso: string = new Date().toISOString(),
): EvidenceStatus {
  if (evidence.status === "missing" || evidence.status === "invalid") {
    return evidence.status;
  }
  if (evidence.status === "conflicting") return "conflicting";
  const now = Date.parse(nowIso);
  if (Number.isNaN(now)) return "unknown";
  if (evidence.expiresAt) {
    const exp = Date.parse(evidence.expiresAt);
    if (!Number.isNaN(exp) && exp < now) return "expired";
  }
  if (evidence.status === "stale" || evidence.status === "expired") {
    return evidence.status;
  }
  if (evidence.status === "current") return "current";
  return "unknown";
}

/**
 * Fail-closed assessment from evidence statuses.
 * No evidence → unknown. Invalid → not pass. Stale/expired → not current assurance.
 */
export function assessFromEvidenceStatuses(
  statuses: EvidenceStatus[],
): AssessmentResult {
  if (statuses.length === 0) return "unknown";
  if (statuses.some((s) => s === "missing")) return "unknown";
  if (statuses.some((s) => s === "invalid" || s === "conflicting")) return "fail";
  if (statuses.every((s) => s === "current")) return "pass";
  if (statuses.some((s) => s === "stale" || s === "expired" || s === "unknown")) {
    return "partial";
  }
  return "unknown";
}

export function assertNoSensitivePayload(containsSensitivePayload: false): void {
  if (containsSensitivePayload !== false) {
    throw new Error("Sensitive evidence payloads are forbidden");
  }
}

export function assertObservedProvenance(provenance: {
  observed: true;
  inferred: false;
  fabricated: false;
}): void {
  if (!provenance.observed || provenance.inferred || provenance.fabricated) {
    throw new Error("Fabricated or inferred-as-observed evidence is forbidden");
  }
}
