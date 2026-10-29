import type { EvidenceStatus, SecurityEvidenceReference } from "../contracts";

export function evaluateEvidenceFreshness(
  evidence: Pick<
    SecurityEvidenceReference,
    "status" | "expiresAt" | "collectedAt" | "effectiveAt"
  >,
  nowIso: string = new Date().toISOString(),
): EvidenceStatus {
  if (evidence.status === "missing") return "missing";
  if (evidence.status === "invalid") return "invalid";
  if (evidence.status === "conflicting") return "conflicting";
  if (evidence.status === "unknown") return "unknown";

  const now = Date.parse(nowIso);
  if (Number.isNaN(now)) return "invalid";

  if (evidence.expiresAt) {
    const exp = Date.parse(evidence.expiresAt);
    if (!Number.isNaN(exp) && now > exp) return "expired";
  }

  if (evidence.status === "stale") return "stale";
  if (evidence.status === "expired") return "expired";
  return "current";
}

/** Fail-closed: missing/invalid/stale/expired/conflicting cannot yield PASS. */
export function evidenceSupportsPass(status: EvidenceStatus): boolean {
  return status === "current";
}

export function noEvidenceResult(): "unknown" {
  return "unknown";
}
