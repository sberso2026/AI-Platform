/**
 * Phase 8E — Findings Intelligence domain types.
 */
export const FINDINGS_LIFECYCLE_STATUSES = [
  "candidate",
  "triage_pending",
  "under_review",
  "changes_requested",
  "accepted",
  "rejected",
  "deferred",
  "duplicate",
  "superseded",
  "conversion_proposed",
  "converted",
  "closed",
  "reopened",
  "archived",
] as const;

export type FindingsLifecycleStatus = (typeof FINDINGS_LIFECYCLE_STATUSES)[number];

export const FINDINGS_CATEGORIES = [
  "observation",
  "discrepancy",
  "non_conformance",
  "design_concern",
  "constructability_concern",
  "safety_concern",
  "quality_concern",
  "schedule_concern",
  "cost_concern",
  "compliance_concern",
  "information_gap",
  "opportunity",
  "lesson_candidate",
  "other",
] as const;

export type FindingsCategory = (typeof FINDINGS_CATEGORIES)[number];

export const FINDINGS_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type FindingsSeverity = (typeof FINDINGS_SEVERITIES)[number];

export const FINDINGS_PRIORITIES = ["p1", "p2", "p3", "p4"] as const;
export type FindingsPriority = (typeof FINDINGS_PRIORITIES)[number];

export const FINDINGS_SOURCE_TYPES = [
  "document_intelligence.candidate_finding",
  "meeting_intelligence.candidate_finding",
  "manual",
  "future_feature",
] as const;

export type FindingsSourceType = (typeof FINDINGS_SOURCE_TYPES)[number];

export const FINDINGS_CORE_TARGET_TYPES = [
  "decision",
  "action",
  "risk",
  "issue",
  "technical_query",
  "lesson",
] as const;

export type FindingsCoreTargetType = (typeof FINDINGS_CORE_TARGET_TYPES)[number];

export const FINDINGS_DUPLICATE_KINDS = [
  "exact_duplicate",
  "probable_duplicate",
  "related_finding",
  "conflicting_finding",
  "superseding_finding",
  "recurring_pattern",
] as const;

export type FindingsDuplicateKind = (typeof FINDINGS_DUPLICATE_KINDS)[number];

export type FindingsEvidenceRef = {
  kind: "document_chunk" | "document_revision" | "table_or_page" | "transcript_segment" | "minutes" | "participant_statement" | "external";
  refId: string;
  excerpt?: string;
  engineeringDocumentId?: string;
  revision?: string;
  meetingSessionId?: string;
  evidenceScore?: number;
};

export type FindingsCitationLineage = {
  immutable: true;
  refs: readonly FindingsEvidenceRef[];
  revoked: boolean;
};
