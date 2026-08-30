import type { ProjectHealthEvidenceReference, ProjectHealthOverallClassification } from "../project-health/types";
import type { CommandCentreAvailability } from "../command-centre/types";
import type { AI_PROJECT_ANALYST_CAPABILITY } from "./capability";

export const ANALYST_CLAIM_KINDS = [
  "FACT",
  "DETERMINISTIC_INTERPRETATION",
  "AI_SUMMARY",
  "AI_INFERENCE",
  "LIMITATION",
] as const;
export type AnalystClaimKind = (typeof ANALYST_CLAIM_KINDS)[number];

export const ANALYST_INTENTS = [
  "attention",
  "health",
  "schedule",
  "cost_progress",
  "risk",
  "change",
  "queries",
  "decisions",
  "actions",
  "forecast",
  "missing",
  "evidence",
  "brief",
  "cross_domain",
  "injection",
  "mutation",
  "unsupported_forecast_metric",
] as const;
export type AnalystIntent = (typeof ANALYST_INTENTS)[number];

export const PI_ANALYST_PLATFORM_TOOL_KEYS = [
  "project_intelligence.get_project_health",
  "project_intelligence.get_schedule_intelligence",
  "project_intelligence.get_cost_progress_intelligence",
  "project_intelligence.get_risk_change_intelligence",
  "project_intelligence.get_query_decision_intelligence",
  "project_intelligence.get_forecast_intelligence",
  "project_intelligence.get_project_evidence",
] as const;
export type PiAnalystPlatformToolKey = (typeof PI_ANALYST_PLATFORM_TOOL_KEYS)[number];

export type AnalystCitation = {
  sourceDomain: string;
  entityType: string;
  entityId: string;
  asOf?: string;
  label: string;
  storesCanonicalCopy: false;
};

export type AnalystClaim = {
  kind: AnalystClaimKind;
  text: string;
  citations: readonly AnalystCitation[];
};

export type AnalystSectionContext = {
  id: string;
  state: string;
  availability: CommandCentreAvailability | string;
  asOf?: string;
  source: string;
  summary: string;
  limitations: readonly string[];
  evidence: readonly AnalystCitation[];
  counts?: Readonly<Record<string, number>>;
  navigationPath: string;
};

export type AnalystContext = {
  capability: typeof AI_PROJECT_ANALYST_CAPABILITY;
  generatedAt: string;
  project: {
    projectId: string;
    tenantId: string;
    workspaceId: string;
    projectCode: string;
    projectName: string;
    phase: string;
    status: string;
  };
  health: AnalystSectionContext;
  schedule: AnalystSectionContext;
  cost: AnalystSectionContext;
  progress: AnalystSectionContext;
  risk: AnalystSectionContext;
  change: AnalystSectionContext;
  queries: AnalystSectionContext;
  decisions: AnalystSectionContext;
  actions: AnalystSectionContext;
  forecast: AnalystSectionContext;
  knowledge: AnalystSectionContext;
  attention: readonly { severity: string; reasonCode: string; explanation: string; citation: AnalystCitation }[];
  limitations: readonly string[];
  freshness: Readonly<Record<string, string>>;
  linkedSignals: readonly { explanation: string; from: AnalystCitation; to: AnalystCitation }[];
  readOnly: true;
  mutationEnabled: false;
};

export type AnalystAnswer = {
  capability: typeof AI_PROJECT_ANALYST_CAPABILITY;
  intent: AnalystIntent;
  toolsUsed: readonly PiAnalystPlatformToolKey[];
  answer: string;
  claims: readonly AnalystClaim[];
  citations: readonly AnalystCitation[];
  limitations: readonly string[];
  navigation: readonly { label: string; path: string }[];
  starterQuestions: readonly string[];
  advisory: true;
  readOnly: true;
  mutationEnabled: false;
  autonomousApprovalEnabled: false;
  aiOptional: true;
  aiAvailable: boolean;
  aiProvider?: string;
  aiModel?: string;
  refused: boolean;
  refusedReason?: string;
};

export type AnalystBrief = {
  executiveStatus: string;
  topAttention: readonly string[];
  schedule: string;
  costProgress: string;
  riskChange: string;
  queriesDecisionsActions: string;
  forecast: string;
  missingOrStale: readonly string[];
  evidence: readonly AnalystCitation[];
  limitations: readonly string[];
  advisory: true;
};
