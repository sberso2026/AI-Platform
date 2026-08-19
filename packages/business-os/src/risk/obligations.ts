import type { BusinessRiskObligationStatus } from "@rtb/types";

export function assertObligationComplianceAllowed(
  status: BusinessRiskObligationStatus | string,
  evidenceRefs: unknown[] | null | undefined,
  authorizedConfirmation: boolean,
): void {
  if (status !== "compliant") return;
  const evidenced = Array.isArray(evidenceRefs) && evidenceRefs.length > 0;
  if (!evidenced || !authorizedConfirmation) {
    throw new Error("obligation_evidence_required");
  }
}

export function obligationOverdue(
  status: BusinessRiskObligationStatus | string,
  dueAt: string | null | undefined,
  asOf: string,
): boolean {
  if (status === "not_applicable" || status === "compliant") return false;
  if (status === "overdue") return true;
  if (!dueAt) return false;
  return new Date(dueAt).getTime() < new Date(asOf).getTime();
}
