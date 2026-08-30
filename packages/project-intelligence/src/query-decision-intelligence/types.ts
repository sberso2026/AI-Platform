/**
 * PI-5 Query, Decision, and Action Intelligence. Read-only interpretation over
 * canonical Engineering OS technical queries, decisions, and actions.
 * RFI is not a separate canonical register.
 */

import type { ProjectHealthEvidenceReference, ProjectHealthOverallClassification } from "../project-health/types";
import type { CommandCentreAvailability } from "../command-centre/types";
import type { RegisterReadCompleteness } from "../project-health/register-read-semantics";

export const QUERY_DECISION_FRESHNESS_STATES = ["CURRENT", "STALE", "UNKNOWN", "UNAVAILABLE"] as const;
export type QueryDecisionFreshnessState = (typeof QUERY_DECISION_FRESHNESS_STATES)[number];

export const QUERY_DECISION_ATTENTION_SEVERITIES = ["red", "amber", "info"] as const;
export type QueryDecisionAttentionSeverity = (typeof QUERY_DECISION_ATTENTION_SEVERITIES)[number];

export const PI_CANONICAL_TQ_MODEL = "engineering_technical_queries" as const;
export const PI_CANONICAL_RFI_MODEL = "not_first_class_represented_through_technical_queries" as const;

export type QueryEvidenceReference = ProjectHealthEvidenceReference;
export type DecisionEvidenceReference = ProjectHealthEvidenceReference;
export type ActionEvidenceReference = ProjectHealthEvidenceReference;

export type CanonicalQueryRef = {
  id: string;
  number?: string;
  title?: string;
  status: string;
  open: boolean;
  priority?: string;
  ownerId?: string;
  assignedTo?: string;
  raisedBy?: string;
  requesterId?: string;
  responderId?: string;
  dueAt?: string;
  responseDue?: string;
  createdAt?: string;
  closedAt?: string;
  updatedAt?: string;
  disciplineId?: string;
  storesCanonicalCopy: false;
};

export type CanonicalDecisionRef = {
  id: string;
  number?: string;
  title?: string;
  status: string;
  open: boolean;
  priority?: string;
  ownerId?: string;
  assignedTo?: string;
  raisedBy?: string;
  approvalStatus?: string;
  reviewStatus?: string;
  dueAt?: string;
  createdAt?: string;
  decisionDate?: string;
  closedAt?: string;
  updatedAt?: string;
  storesCanonicalCopy: false;
};

export type CanonicalActionRef = {
  id: string;
  number?: string;
  title?: string;
  status: string;
  open: boolean;
  priority?: string;
  ownerId?: string;
  assignedTo?: string;
  dueAt?: string;
  createdAt?: string;
  closedAt?: string;
  updatedAt?: string;
  originatingObjectType?: string;
  originatingObjectId?: string;
  storesCanonicalCopy: false;
};

export type QueryHealthSummary = {
  classification: ProjectHealthOverallClassification;
  headline: string;
  reasonCodes: readonly string[];
};

export type DecisionHealthSummary = QueryHealthSummary;
export type ActionHealthSummary = QueryHealthSummary;

export type QueryAttentionItem = {
  id: string;
  severity: QueryDecisionAttentionSeverity;
  reasonCode: string;
  explanation: string;
  evidenceReference: QueryEvidenceReference;
  canonicalQueryId?: string;
  ageDays?: number;
  dueAt?: string;
  asOf?: string;
};

export type DecisionAttentionItem = {
  id: string;
  severity: QueryDecisionAttentionSeverity;
  reasonCode: string;
  explanation: string;
  evidenceReference: DecisionEvidenceReference;
  canonicalDecisionId?: string;
  ageDays?: number;
  latencyDays?: number;
  dueAt?: string;
  asOf?: string;
};

export type ActionAttentionItem = {
  id: string;
  severity: QueryDecisionAttentionSeverity;
  reasonCode: string;
  explanation: string;
  evidenceReference: ActionEvidenceReference;
  canonicalActionId?: string;
  originatingObjectType?: string;
  originatingObjectId?: string;
  dueAt?: string;
  asOf?: string;
};

export type QueryDataQuality = {
  asOf?: string;
  source: "engineering_core";
  freshness: QueryDecisionFreshnessState;
  registerBound: boolean;
  completeness?: RegisterReadCompleteness;
  missing: readonly string[];
  limitations: readonly string[];
};

export type DecisionDataQuality = QueryDataQuality;
export type ActionDataQuality = QueryDataQuality;

export type QueryPortfolioSummary = {
  openCount: number;
  overdueCount: number;
  unassignedCount: number;
  highPriorityCount: number;
  staleCount: number;
  resolvedOrClosedCount: number;
  numericalScoreImplemented: false;
};

export type DecisionPortfolioSummary = {
  openCount: number;
  overdueCount: number;
  unassignedCount: number;
  agingCount: number;
  recentlyDecidedCount: number;
  numericalScoreImplemented: false;
};

export type ActionPortfolioSummary = {
  openCount: number;
  overdueCount: number;
  unassignedCount: number;
  highPriorityCount: number;
  originatingFromRiskCount: number;
  originatingFromQueryCount: number;
  originatingFromDecisionCount: number;
  originatingFromChangeCount: number;
  recentlyCompletedCount: number;
  numericalScoreImplemented: false;
};

export type QueryDecisionLinkedSignal = {
  id: string;
  reasonCode: string;
  explanation: string;
  fromEvidence: QueryEvidenceReference;
  toEvidence: QueryEvidenceReference;
};

export type ProjectQueryIntelligence = {
  availability: CommandCentreAvailability;
  health: QueryHealthSummary;
  attentionItems: readonly QueryAttentionItem[];
  portfolio: QueryPortfolioSummary;
  dataQuality: QueryDataQuality;
  evidenceReferences: readonly QueryEvidenceReference[];
  canonicalModel: typeof PI_CANONICAL_TQ_MODEL;
  rfiModel: typeof PI_CANONICAL_RFI_MODEL;
};

export type ProjectDecisionIntelligence = {
  availability: CommandCentreAvailability;
  health: DecisionHealthSummary;
  attentionItems: readonly DecisionAttentionItem[];
  portfolio: DecisionPortfolioSummary;
  dataQuality: DecisionDataQuality;
  evidenceReferences: readonly DecisionEvidenceReference[];
};

export type ProjectActionIntelligence = {
  availability: CommandCentreAvailability;
  health: ActionHealthSummary;
  attentionItems: readonly ActionAttentionItem[];
  portfolio: ActionPortfolioSummary;
  dataQuality: ActionDataQuality;
  evidenceReferences: readonly ActionEvidenceReference[];
};

export type ProjectQueryDecisionIntelligence = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  query: ProjectQueryIntelligence;
  decision: ProjectDecisionIntelligence;
  action: ProjectActionIntelligence;
  linkedSignals: readonly QueryDecisionLinkedSignal[];
  generatedAt: string;
  readOnly: true;
  persisted: false;
  aiRequired: false;
  mutatesQuery: false;
  mutatesDecision: false;
  mutatesAction: false;
};

export type QuerySourceSlice = {
  availability: CommandCentreAvailability;
  bound: boolean;
  completeness?: RegisterReadCompleteness;
  items: readonly CanonicalQueryRef[];
  sourceTimestamp?: string;
};

export type DecisionSourceSlice = {
  availability: CommandCentreAvailability;
  bound: boolean;
  completeness?: RegisterReadCompleteness;
  items: readonly CanonicalDecisionRef[];
  sourceTimestamp?: string;
};

export type ActionSourceSlice = {
  availability: CommandCentreAvailability;
  bound: boolean;
  completeness?: RegisterReadCompleteness;
  items: readonly CanonicalActionRef[];
  sourceTimestamp?: string;
};

export type QueryDecisionSourceSnapshot = {
  query: QuerySourceSlice;
  decision: DecisionSourceSlice;
  action: ActionSourceSlice;
};
