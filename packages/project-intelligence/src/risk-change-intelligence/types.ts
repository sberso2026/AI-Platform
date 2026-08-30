/**
 * PI-4 Risk & Change Intelligence contracts. Read-only interpretation over
 * canonical Engineering OS risks and published Project Controls change outputs.
 * Not a risk register, scoring engine, or change-management engine.
 */

import type { ProjectHealthEvidenceReference, ProjectHealthOverallClassification } from "../project-health/types";
import type { CommandCentreAvailability } from "../command-centre/types";

export const RISK_CHANGE_FRESHNESS_STATES = ["CURRENT", "STALE", "UNKNOWN", "UNAVAILABLE"] as const;
export type RiskChangeFreshnessState = (typeof RISK_CHANGE_FRESHNESS_STATES)[number];

export const RISK_CHANGE_ATTENTION_SEVERITIES = ["red", "amber", "info"] as const;
export type RiskChangeAttentionSeverity = (typeof RISK_CHANGE_ATTENTION_SEVERITIES)[number];

export const CANONICAL_RISK_MATRIX_SCALE = "probability_1_5_consequence_1_5" as const;
export type CanonicalRiskMatrixScale = typeof CANONICAL_RISK_MATRIX_SCALE;

export const PUBLISHED_CHANGE_STATUS_CONTEXTS = [
  "pending",
  "approved_context",
  "rejected_context",
  "unknown",
] as const;
export type PublishedChangeStatusContext = (typeof PUBLISHED_CHANGE_STATUS_CONTEXTS)[number];

export const PUBLISHED_CHANGE_IMPACT_CONTEXTS = [
  "suspected",
  "supported",
  "unknown",
  "not_applicable",
] as const;
export type PublishedChangeImpactContext = (typeof PUBLISHED_CHANGE_IMPACT_CONTEXTS)[number];

export type RiskEvidenceReference = ProjectHealthEvidenceReference;
export type ChangeEvidenceReference = ProjectHealthEvidenceReference;

export type CanonicalRiskRef = {
  id: string;
  riskNumber?: string;
  title?: string;
  status: string;
  open: boolean;
  priority?: string;
  score?: number;
  probability?: number;
  consequence?: number;
  residualScore?: number;
  category?: string;
  ownerId?: string;
  assignedTo?: string;
  dueAt?: string;
  mitigationPresent?: boolean;
  createdAt?: string;
  updatedAt?: string;
  matrixId?: string;
  matrixScale?: CanonicalRiskMatrixScale;
  storesCanonicalCopy: false;
};

export type CanonicalRiskActionRef = {
  id: string;
  open: boolean;
  dueAt?: string;
  originatingObjectType?: string;
  originatingObjectId?: string;
  updatedAt?: string;
  storesCanonicalCopy: false;
};

export type PublishedChangeImpactIndications = {
  scope?: PublishedChangeImpactContext;
  schedule?: PublishedChangeImpactContext;
  cost?: PublishedChangeImpactContext;
  risk?: PublishedChangeImpactContext;
  quality?: PublishedChangeImpactContext;
  procurement?: PublishedChangeImpactContext;
};

export type PublishedChangeStateRef = {
  stateId: string;
  projectId: string;
  published: boolean;
  abstained: boolean;
  statusContext?: PublishedChangeStatusContext;
  changeClass?: string;
  impact?: PublishedChangeImpactIndications;
  dataSufficiency?: string;
  confidenceClass?: string;
  evidenceCount?: number;
  usableEvidenceCount?: number;
  assessedAt?: string;
  publishedAt?: string;
  recordedAt?: string;
  reviewedAt?: string;
  version?: number;
  storesCanonicalCopy: false;
};

export type PublishedChangeEvidenceRef = {
  evidenceId: string;
  changeStateId: string;
  kind: string;
  sourceType: string;
  sourceRef: string;
  sourceKey: string;
  observedAt?: string;
  recordedAt?: string;
  revoked: boolean;
  storesCanonicalCopy: false;
};

export type RiskHealthSummary = {
  classification: ProjectHealthOverallClassification;
  headline: string;
  reasonCodes: readonly string[];
};

export type ChangeHealthSummary = {
  classification: ProjectHealthOverallClassification;
  statusContext?: PublishedChangeStatusContext;
  headline: string;
  reasonCodes: readonly string[];
};

export type RiskAttentionItem = {
  id: string;
  severity: RiskChangeAttentionSeverity;
  reasonCode: string;
  explanation: string;
  evidenceReference: RiskEvidenceReference;
  canonicalRiskId?: string;
  asOf?: string;
};

export type ChangeAttentionItem = {
  id: string;
  severity: RiskChangeAttentionSeverity;
  reasonCode: string;
  explanation: string;
  evidenceReference: ChangeEvidenceReference;
  asOf?: string;
};

export type RiskDataQuality = {
  asOf?: string;
  source: "engineering_core";
  freshness: RiskChangeFreshnessState;
  missing: readonly string[];
  limitations: readonly string[];
  registerBound: boolean;
};

export type ChangeDataQuality = {
  asOf?: string;
  publishedAt?: string;
  source: "project_controls";
  freshness: RiskChangeFreshnessState;
  completeness?: string;
  missing: readonly string[];
  limitations: readonly string[];
  evidenceCount?: number;
  usableEvidenceCount?: number;
};

export type RiskPortfolioSummary = {
  openCount: number;
  criticalHighCount: number;
  overdueMitigationCount: number;
  unownedCount: number;
  staleReviewCount: number;
  categoryCounts: Readonly<Record<string, number>>;
  numericalScoreImplemented: false;
  matricesNormalized: false;
};

export type ChangePortfolioSummary = {
  openPendingCount: number;
  highImpactCount: number;
  scheduleImpactIndicationCount: number;
  costImpactIndicationCount: number;
  staleAssessmentCount: number;
  monetaryImpactsSummed: false;
  exposureInvented: false;
};

export type ChangePublishedImplications = {
  schedule?: PublishedChangeImpactContext;
  cost?: PublishedChangeImpactContext;
  forecastPublished: false;
  monetaryAmountPublished: false;
  scheduleDaysPublished: false;
  summary: string;
};

export type RiskMatrixSafety = {
  scale: CanonicalRiskMatrixScale;
  matrixIds: readonly string[];
  compatible: boolean;
  silentlyNormalized: false;
  independentScoringImplemented: false;
  limitation?: string;
};

export type RiskChangeLinkedSignal = {
  id: string;
  reasonCode: string;
  explanation: string;
  riskEvidence: RiskEvidenceReference;
  changeOrActionEvidence: ChangeEvidenceReference;
};

export type QualityBoundaryNote = {
  inspectionIntegrated: false;
  sources: readonly ["core_issues", "pi_findings"];
  explanation: string;
};

export type UnsupportedChangeImpacts = {
  monetaryAmount: "unavailable";
  scheduleDays: "unavailable";
  forecastImplication: "unavailable";
  redPosture: "unavailable";
  limitation: "change_impacts_not_independently_calculated";
};

export type ProjectRiskIntelligence = {
  availability: CommandCentreAvailability;
  health: RiskHealthSummary;
  attentionItems: readonly RiskAttentionItem[];
  portfolio: RiskPortfolioSummary;
  matrix: RiskMatrixSafety;
  dataQuality: RiskDataQuality;
  evidenceReferences: readonly RiskEvidenceReference[];
  trend: "unavailable";
};

export type ProjectChangeIntelligence = {
  availability: CommandCentreAvailability;
  health: ChangeHealthSummary;
  attentionItems: readonly ChangeAttentionItem[];
  portfolio: ChangePortfolioSummary;
  implications: ChangePublishedImplications;
  dataQuality: ChangeDataQuality;
  evidenceReferences: readonly ChangeEvidenceReference[];
};

export type ProjectRiskChangeIntelligence = {
  projectId: string;
  tenantId: string;
  workspaceId: string;
  risk: ProjectRiskIntelligence;
  change: ProjectChangeIntelligence;
  linkedSignals: readonly RiskChangeLinkedSignal[];
  qualityBoundary: QualityBoundaryNote;
  unsupportedImpacts: UnsupportedChangeImpacts;
  generatedAt: string;
  readOnly: true;
  persisted: false;
  aiRequired: false;
  mutatesRisk: false;
  mutatesChange: false;
};

export type RiskSourceSlice = {
  availability: CommandCentreAvailability;
  bound: boolean;
  completeness?: "complete" | "unknown";
  items: readonly CanonicalRiskRef[];
  actions: readonly CanonicalRiskActionRef[];
  sourceTimestamp?: string;
};

export type ChangeSourceSlice = {
  availability: CommandCentreAvailability;
  latest: PublishedChangeStateRef | null;
  history: readonly PublishedChangeStateRef[];
  evidence: readonly PublishedChangeEvidenceRef[];
};

export type RiskChangeSourceSnapshot = {
  risk: RiskSourceSlice;
  change: ChangeSourceSlice;
};
