import type { BusinessEvidenceRef, BusinessRevenueComplianceStatus } from "@rtb/types";

export function assertRequirementCompliance(
  status: BusinessRevenueComplianceStatus,
  evidenceRefs: BusinessEvidenceRef[] | undefined,
  generatedBy?: "user" | "deterministic_rule" | "platform_ai_director",
): void {
  const evidence = evidenceRefs ?? [];
  if (status === "satisfied" && evidence.length === 0) {
    throw new Error("requirement_evidence_required");
  }
  if (generatedBy === "platform_ai_director" && status === "satisfied") {
    throw new Error("ai_cannot_mark_requirement_satisfied");
  }
}
