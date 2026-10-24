/**
 * Verification Framework — separate from review and approval (Phase 9D).
 */
import { randomUUID } from "node:crypto";

export type VerificationKind = "corrective_action" | "defect" | "inspection_closeout";
export type VerificationStatus = "pending" | "passed" | "failed";

export type InspectionVerification = {
  id: string;
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  kind: VerificationKind;
  subjectId: string;
  status: VerificationStatus;
  verifierPersonId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export function requestVerification(input: {
  tenantId: string;
  workspaceId: string;
  sessionId: string;
  kind: VerificationKind;
  subjectId: string;
}): InspectionVerification {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    ...input,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };
}

export function completeVerification(
  verification: InspectionVerification,
  input: { status: "passed" | "failed"; verifierPersonId: string; notes?: string },
): InspectionVerification {
  if (verification.status !== "pending") {
    throw new Error("verification_already_completed");
  }
  if (!input.verifierPersonId) {
    throw new Error("verifier_required");
  }
  return {
    ...verification,
    status: input.status,
    verifierPersonId: input.verifierPersonId,
    notes: input.notes,
    updatedAt: new Date().toISOString(),
  };
}
