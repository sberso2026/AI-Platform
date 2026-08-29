/**
 * PI-1 Command Centre projections. Compact, reference-only, not canonical copies.
 */

import type { ProjectHealthDimensionResult, ProjectHealthEvidenceReference, ProjectHealthOverallClassification } from "../project-health/types";
import type { ProjectScheduleIntelligence } from "../schedule-intelligence/types";
import type { ProjectCostProgressIntelligence } from "../cost-progress-intelligence/types";
import type { ProjectRiskChangeIntelligence } from "../risk-change-intelligence/types";

export const COMMAND_CENTRE_AVAILABILITY = [
  "ok",
  "no_data",
  "unavailable",
  "forbidden",
  "stale",
  "error",
] as const;

export type CommandCentreAvailability = (typeof COMMAND_CENTRE_AVAILABILITY)[number];

export const COMMAND_CENTRE_ATTENTION_SEVERITIES = ["red", "amber", "info"] as const;
export type CommandCentreAttentionSeverity = (typeof COMMAND_CENTRE_ATTENTION_SEVERITIES)[number];

export type CommandCentreProjectProjection = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  projectCode: string;
  projectName: string;
  phase: string;
  status: string;
  storesCanonicalCopy: false;
};

export type CommandCentreAttentionItem = {
  id: string;
  severity: CommandCentreAttentionSeverity;
  reasonCode: string;
  explanation: string;
  sourceReference: ProjectHealthEvidenceReference;
};

export type CommandCentreSectionProjection = {
  availability: CommandCentreAvailability;
  title: string;
  summary: string;
  posture?: string;
  counts: Readonly<Record<string, number>>;
  evidenceReferences: readonly ProjectHealthEvidenceReference[];
  limitations: readonly string[];
  freshness?: string;
};

export const COMMAND_CENTRE_CONTROL_SECTIONS = [
  "schedule",
  "cost",
  "progress",
  "change",
  "forecast",
] as const;

export type CommandCentreControlSection = (typeof COMMAND_CENTRE_CONTROL_SECTIONS)[number];

export type CommandCentreControlsAvailability = Record<
  CommandCentreControlSection,
  CommandCentreAvailability
>;

export type ProjectCommandCentreView = {
  project: CommandCentreProjectProjection;
  overallHealth: ProjectHealthOverallClassification;
  healthDimensions: readonly ProjectHealthDimensionResult[];
  attentionItems: readonly CommandCentreAttentionItem[];
  schedule: CommandCentreSectionProjection;
  cost: CommandCentreSectionProjection;
  progress: CommandCentreSectionProjection;
  risk: CommandCentreSectionProjection;
  quality: CommandCentreSectionProjection;
  change: CommandCentreSectionProjection;
  decisionsActions: CommandCentreSectionProjection;
  forecast: CommandCentreSectionProjection;
  knowledge: CommandCentreSectionProjection;
  scheduleIntelligence: ProjectScheduleIntelligence;
  costProgressIntelligence: ProjectCostProgressIntelligence;
  riskChangeIntelligence: ProjectRiskChangeIntelligence;
  limitations: readonly string[];
  evidenceReferences: readonly ProjectHealthEvidenceReference[];
  generatedAt: string;
  readOnly: true;
  persisted: false;
  aiRequired: false;
  canonicalMutation: false;
};
