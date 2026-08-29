/**
 * PI-2 Schedule Intelligence contracts. Read-only projections over published
 * Project Controls schedule assessments and evidence. Not a schedule of record.
 */

import type { ProjectHealthEvidenceReference, ProjectHealthOverallClassification } from "../project-health/types";
import type { CommandCentreAvailability } from "../command-centre/types";

export const SCHEDULE_POSTURES = ["on_track", "at_risk", "missed", "unknown"] as const;
export type SchedulePublishedPosture = (typeof SCHEDULE_POSTURES)[number];

export const SCHEDULE_FRESHNESS_STATES = ["CURRENT", "STALE", "UNKNOWN", "UNAVAILABLE"] as const;
export type ScheduleFreshnessState = (typeof SCHEDULE_FRESHNESS_STATES)[number];

export const SCHEDULE_ATTENTION_SEVERITIES = ["red", "amber", "info"] as const;
export type ScheduleAttentionSeverity = (typeof SCHEDULE_ATTENTION_SEVERITIES)[number];

export type ScheduleEvidenceReference = ProjectHealthEvidenceReference;

export type PublishedScheduleAssessmentRef = {
  assessmentId: string;
  stateId: string;
  projectId: string;
  published: boolean;
  abstained: boolean;
  posture?: SchedulePublishedPosture;
  declaredBaselineDate?: string;
  declaredCurrentDate?: string;
  /** Published by Project Controls from declared dates. PI must not recompute. */
  declaredDateDeltaDays?: number;
  dataSufficiency?: string;
  confidenceClass?: string;
  evidenceCount?: number;
  usableEvidenceCount?: number;
  assessedAt?: string;
  publishedAt?: string;
  recordedAt?: string;
  version?: number;
  storesCanonicalCopy: false;
};

export type PublishedScheduleEvidenceRef = {
  evidenceId: string;
  assessmentId: string;
  kind: string;
  sourceType: string;
  sourceKey: string;
  sourceReference?: string;
  title?: string;
  declaredBaselineDate?: string;
  declaredCurrentDate?: string;
  declaredPosture?: SchedulePublishedPosture;
  scopeKind?: string;
  scopeReferenceId?: string;
  observedAt?: string;
  recordedAt?: string;
  revoked: boolean;
  storesCanonicalCopy: false;
};

export type ScheduleRelatedContextRef = {
  sourceDomain: "engineering_core" | "project_intelligence" | "inspection_intelligence" | "project_controls";
  entityType: string;
  entityId: string;
  linkKind: "explicit_source_key" | "explicit_source_reference";
  storesCanonicalCopy: false;
};

export type ScheduleHealthSummary = {
  classification: ProjectHealthOverallClassification;
  posture?: SchedulePublishedPosture;
  headline: string;
  reasonCodes: readonly string[];
};

export type ScheduleMilestoneInsight = {
  milestoneId: string;
  title: string;
  baselineDate?: string;
  currentOrForecastDate?: string;
  publishedStatus?: SchedulePublishedPosture;
  /** Present only when Project Controls published declaredDateDeltaDays on the parent assessment or dates are not used to invent a delta. */
  publishedVarianceDays?: number;
  criticalityPublished: false;
  evidenceReference: ScheduleEvidenceReference;
  relatedContext: readonly ScheduleRelatedContextRef[];
};

export type ScheduleAttentionItem = {
  id: string;
  severity: ScheduleAttentionSeverity;
  reasonCode: string;
  explanation: string;
  evidenceReference: ScheduleEvidenceReference;
  asOf?: string;
};

export type ScheduleTrend = {
  available: false;
  explanation: string;
} | {
  available: true;
  fromPosture?: SchedulePublishedPosture;
  toPosture?: SchedulePublishedPosture;
  healthChange: "improved" | "deteriorated" | "unchanged" | "unknown";
  publishedDeltaChangeDays?: number;
  lateMilestoneCountChange?: number;
  explanation: string;
};

export type ScheduleDataQuality = {
  asOf?: string;
  source: "project_controls";
  freshness: ScheduleFreshnessState;
  completeness?: string;
  missing: readonly string[];
  limitations: readonly string[];
  evidenceCount?: number;
  usableEvidenceCount?: number;
};

export type ProjectScheduleIntelligence = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  availability: CommandCentreAvailability;
  health: ScheduleHealthSummary;
  attentionItems: readonly ScheduleAttentionItem[];
  milestones: readonly ScheduleMilestoneInsight[];
  trend: ScheduleTrend;
  dataQuality: ScheduleDataQuality;
  forecast: {
    declaredCurrentDate?: string;
    declaredBaselineDate?: string;
    publishedVarianceDays?: number;
    computedCompletionPublished: false;
    summary: string;
  };
  criticalPath: {
    published: false;
    state: "unknown";
    limitation: "critical_path_not_published";
  };
  float: {
    published: false;
    state: "unknown";
    limitation: "float_not_published";
  };
  evidenceReferences: readonly ScheduleEvidenceReference[];
  generatedAt: string;
  readOnly: true;
  persisted: false;
  aiRequired: false;
  mutatesSchedule: false;
};

export type ScheduleIntelligenceSourceSnapshot = {
  availability: CommandCentreAvailability;
  latest: PublishedScheduleAssessmentRef | null;
  history: readonly PublishedScheduleAssessmentRef[];
  evidence: readonly PublishedScheduleEvidenceRef[];
  priorEvidence: readonly PublishedScheduleEvidenceRef[];
};
