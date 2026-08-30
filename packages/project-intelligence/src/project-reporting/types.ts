/**
 * PI-9 Project Reporting Intelligence. Point-in-time composition over
 * deterministic PI and governed EXTERNAL_CONTEXT. Not a second truth model.
 */

import type { AnalystClaimKind } from "../ai-project-analyst/types";
import type { ConnectorContextPack } from "../connector-context/types";
import type { ProjectHealthEvidenceReference, ProjectHealthOverallClassification } from "../project-health/types";

export const PROJECT_REPORT_TYPES = [
  "project_status_report",
  "executive_project_brief",
  "management_attention_report",
] as const;
export type ProjectReportType = (typeof PROJECT_REPORT_TYPES)[number];

export const PROJECT_REPORT_SECTION_IDS = [
  "executive_summary",
  "overall_health",
  "schedule",
  "cost",
  "progress",
  "risks",
  "changes",
  "rfi_tq",
  "decisions",
  "actions",
  "forecast",
  "external_context",
  "management_attention",
  "data_quality",
] as const;
export type ProjectReportSectionId = (typeof PROJECT_REPORT_SECTION_IDS)[number];

export const PROJECT_REPORT_SOURCE_CLASSIFICATIONS = [
  "CANONICAL_PI",
  "DETERMINISTIC_INTERPRETATION",
  "EXTERNAL_CONTEXT",
  "AI_SUMMARY",
  "LIMITATION",
] as const;
export type ProjectReportSourceClassification = (typeof PROJECT_REPORT_SOURCE_CLASSIFICATIONS)[number];

export const MANAGEMENT_ATTENTION_KINDS = [
  "known_issue",
  "known_risk",
  "missing_information",
  "stale_external_information",
  "conflicting_information",
] as const;
export type ManagementAttentionKind = (typeof MANAGEMENT_ATTENTION_KINDS)[number];

export type ProjectReportEvidence = ProjectHealthEvidenceReference & {
  label?: string;
};

export type ProjectReportSection = {
  id: ProjectReportSectionId;
  title: string;
  sourceClassification: ProjectReportSourceClassification;
  state: string;
  availability: string;
  freshness?: string;
  body: string;
  evidence: readonly ProjectReportEvidence[];
  limitations: readonly string[];
  unknownPreserved: boolean;
};

export type ManagementAttentionItem = {
  id: string;
  kind: ManagementAttentionKind;
  severity: "red" | "amber" | "info";
  reasonCode: string;
  explanation: string;
  sourceClassification: ProjectReportSourceClassification;
  evidence: readonly ProjectReportEvidence[];
  freshness?: string;
};

export type ProjectReportNarrative = {
  kind: Extract<AnalystClaimKind, "AI_SUMMARY">;
  available: boolean;
  text?: string;
  provider?: string;
  model?: string;
  directorRunId?: string;
  promptKey?: string;
  promptVersion?: string;
  skippedReason?: string;
  refused?: boolean;
  refusedReason?: string;
};

export type ProjectReportSnapshot = {
  kind: "project_intelligence.project_report";
  snapshotId: string;
  reportType: ProjectReportType;
  generatedAt: string;
  projectId: string;
  tenantId: string;
  workspaceId: string;
  projectCode: string;
  projectName: string;
  overallHealth: ProjectHealthOverallClassification;
  sections: readonly ProjectReportSection[];
  managementAttention: readonly ManagementAttentionItem[];
  connectorContext: {
    availability: ConnectorContextPack["availability"];
    freshnessStates: readonly string[];
    retrievedAt?: string;
    liveExecution: false | boolean;
    degraded: boolean;
    conflictCount: number;
    canonicality: "EXTERNAL_CONTEXT";
  };
  narrative: ProjectReportNarrative;
  limitations: readonly string[];
  evidence: readonly ProjectReportEvidence[];
  persisted: false;
  readOnly: true;
  advisory: true;
  canonicalMutation: false;
  externalWritesEnabled: false;
  autonomousApprovalEnabled: false;
  aiOptional: true;
  duplicateReportingTruthModel: false;
};

export const REPORT_SECTIONS_BY_TYPE: Record<ProjectReportType, readonly ProjectReportSectionId[]> = {
  project_status_report: PROJECT_REPORT_SECTION_IDS,
  executive_project_brief: [
    "executive_summary",
    "overall_health",
    "management_attention",
    "forecast",
    "external_context",
    "data_quality",
  ],
  management_attention_report: [
    "management_attention",
    "overall_health",
    "risks",
    "changes",
    "schedule",
    "cost",
    "external_context",
    "data_quality",
  ],
};

export const REPORT_NARRATIVE_QUESTIONS: Record<ProjectReportType, string> = {
  project_status_report:
    "Summarize the project status report using only published Project Intelligence. Preserve UNKNOWN. Do not approve or mutate.",
  executive_project_brief:
    "Produce an executive project brief from published evidence only. Preserve UNKNOWN. Do not invent dates, cost, progress, or probabilities.",
  management_attention_report:
    "What needs my attention today? Prioritize only published items. Preserve UNKNOWN. Do not approve or mutate.",
};
