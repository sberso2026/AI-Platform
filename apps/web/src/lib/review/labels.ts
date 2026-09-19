export const REVIEW_DISCLAIMER =
  "Engineering Review AI provides AI-assisted first-pass review. It does not replace professional engineering judgment. Findings require engineer review. Absence of findings is not certification of compliance, safety, adequacy, or completeness.";

export const ZERO_FINDING_COPY =
  "No findings were identified within the selected review scope.";

export const REVIEW_SCOPE_OPTIONS = [
  { id: "cross_document_inconsistency", label: "Cross-document consistency" },
  { id: "missing_information", label: "Missing information" },
  { id: "design_basis_consistency", label: "Design-basis consistency" },
  { id: "requirement_traceability", label: "Requirement traceability" },
  { id: "unsupported_assumption", label: "Unsupported assumptions" },
  { id: "revision_inconsistency", label: "Revision consistency" },
  { id: "missing_engineering_evidence", label: "Missing evidence" },
] as const;

export const READINESS_LABELS: Record<string, string> = {
  READY_MACHINE_READABLE: "READY",
  OCR_REQUIRED: "OCR REQUIRED",
  UNSUPPORTED: "UNSUPPORTED",
  FAILED_INGESTION: "FAILED",
  NOT_READY: "NOT READY",
};

export const EXECUTION_READY = new Set(["READY_MACHINE_READABLE"]);
