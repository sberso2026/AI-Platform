/**
 * PI-6 Forecasting Intelligence. Read-only interpretation of published
 * Project Controls advisory forecast assessments. Not a predictive engine.
 */

import type { ProjectHealthEvidenceReference, ProjectHealthOverallClassification } from "../project-health/types";
import type { CommandCentreAvailability } from "../command-centre/types";

export const FORECAST_PUBLISHED_POSTURES = [
  "favourable",
  "stable",
  "uncertain",
  "deteriorating",
  "recovery_possible",
  "unknown",
] as const;
export type ForecastPublishedPosture = (typeof FORECAST_PUBLISHED_POSTURES)[number];

export const FORECAST_READINESS_STATES = [
  "AVAILABLE",
  "QUALITATIVE_ONLY",
  "NOT_PRODUCED",
  "INSUFFICIENT_DATA",
  "STALE",
  "UNAVAILABLE",
  "UNKNOWN",
  "FORBIDDEN",
] as const;
export type ForecastReadinessState = (typeof FORECAST_READINESS_STATES)[number];

export const FORECAST_PUBLICATION_KINDS = [
  "QUANTITATIVE_PUBLISHED",
  "QUALITATIVE_PUBLISHED",
  "NOT_PUBLISHED",
  "UNSUPPORTED",
] as const;
export type ForecastPublicationKind = (typeof FORECAST_PUBLICATION_KINDS)[number];

export const FORECAST_DOMAINS = ["schedule", "cost", "progress", "completion", "change"] as const;
export type ForecastDomain = (typeof FORECAST_DOMAINS)[number];

export const FORECAST_FRESHNESS_STATES = ["CURRENT", "STALE", "UNKNOWN", "UNAVAILABLE"] as const;
export type ForecastFreshnessState = (typeof FORECAST_FRESHNESS_STATES)[number];

export const FORECAST_ATTENTION_SEVERITIES = ["red", "amber", "info"] as const;
export type ForecastAttentionSeverity = (typeof FORECAST_ATTENTION_SEVERITIES)[number];

export type ForecastEvidenceReference = ProjectHealthEvidenceReference;

export type PublishedForecastContributorRef = {
  contributorKey: string;
  stateId: string;
  status: string;
  abstained: boolean;
  postureOrIndication?: string;
  assessedAt?: string;
};

export type PublishedForecastStateRef = {
  stateId: string;
  projectId: string;
  published: boolean;
  abstained: boolean;
  posture?: ForecastPublishedPosture;
  version?: number;
  assessedAt?: string;
  publishedAt?: string;
  recordedAt?: string;
  dataSufficiency?: string;
  confidenceClass?: string;
  confidenceScore?: number;
  evidenceCount?: number;
  usableEvidenceCount?: number;
  abstentionReason?: string;
  contributingContributors: readonly PublishedForecastContributorRef[];
  limitations: readonly string[];
  completionDatePredicted: false;
  costForecastComputed: false;
  scenarioIdPublished: false;
  storesCanonicalCopy: false;
};

export type PublishedForecastEvidenceRef = {
  evidenceId: string;
  forecastStateId: string;
  kind: string;
  sourceType: string;
  sourceKey: string;
  declaredSignal?: string;
  contributorKey?: string;
  observedAt?: string;
  recordedAt?: string;
  revoked: boolean;
  completionDateClaimed: false;
  costForecastClaimed: false;
  storesCanonicalCopy: false;
};

export type PublishedCurrentPostureRef = {
  domain: Exclude<ForecastDomain, "completion">;
  posture?: string;
  published: boolean;
  assessmentId?: string;
  publishedAt?: string;
};

export type ForecastHealthSummary = {
  classification: ProjectHealthOverallClassification;
  posture?: ForecastPublishedPosture;
  headline: string;
  reasonCodes: readonly string[];
};

export type ForecastAttentionItem = {
  id: string;
  severity: ForecastAttentionSeverity;
  reasonCode: string;
  domain: ForecastDomain | "forecast";
  explanation: string;
  evidenceReference: ForecastEvidenceReference;
  asOf?: string;
  publishedAt?: string;
  limitations?: readonly string[];
};

export type ForecastDataQuality = {
  asOf?: string;
  publishedAt?: string;
  source: "project_controls";
  version?: number;
  freshness: ForecastFreshnessState;
  confidenceClass?: string;
  dataSufficiency?: string;
  forecastProduced: boolean;
  missing: readonly string[];
  limitations: readonly string[];
  evidenceCount?: number;
  usableEvidenceCount?: number;
};

export type ForecastDomainSummary = {
  domain: ForecastDomain;
  readiness: ForecastReadinessState;
  publicationKind: ForecastPublicationKind;
  posture?: ForecastPublishedPosture | string;
  contributorKey?: string;
  headline: string;
  quantitativeValuePublished: false;
  completionDatePublished: false;
  monetaryAmountPublished: false;
  probabilityPublished: false;
};

export type ForecastTrend = {
  available: boolean;
  fromPosture?: ForecastPublishedPosture;
  toPosture?: ForecastPublishedPosture;
  fromVersion?: number;
  toVersion?: number;
  fromPublishedAt?: string;
  toPublishedAt?: string;
  direction?: "improved" | "worsened" | "unchanged";
  explanation: string;
};

export type ForecastUnsupportedMetrics = {
  completionDate: "unavailable";
  monetaryAmount: "unavailable";
  probability: "unavailable";
  scenarioSelection: "unavailable";
  limitation: string;
};

export type ForecastObservation = {
  id: string;
  reasonCode: string;
  explanation: string;
  forecastEvidence: ForecastEvidenceReference;
  currentStateEvidence: ForecastEvidenceReference;
};

export type ProjectForecastIntelligence = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  availability: CommandCentreAvailability;
  readiness: ForecastReadinessState;
  publicationKind: ForecastPublicationKind;
  health: ForecastHealthSummary;
  domains: readonly ForecastDomainSummary[];
  trend: ForecastTrend;
  attentionItems: readonly ForecastAttentionItem[];
  observations: readonly ForecastObservation[];
  dataQuality: ForecastDataQuality;
  evidenceReferences: readonly ForecastEvidenceReference[];
  unsupported: ForecastUnsupportedMetrics;
  generatedAt: string;
  readOnly: true;
  persisted: false;
  aiRequired: false;
  mutatesForecast: false;
};

export type ForecastSourceSlice = {
  availability: CommandCentreAvailability;
  latest: PublishedForecastStateRef | null;
  history: readonly PublishedForecastStateRef[];
  evidence: readonly PublishedForecastEvidenceRef[];
  currentStates: readonly PublishedCurrentPostureRef[];
};

export type ForecastIntelligenceSourceSnapshot = ForecastSourceSlice;
