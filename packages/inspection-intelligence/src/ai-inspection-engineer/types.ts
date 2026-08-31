import type { AI_INSPECTION_ENGINEER_CAPABILITY } from "./capability";

export const ENGINEER_CLAIM_KINDS = [
  "FACT",
  "DETERMINISTIC_RESULT",
  "AI_INTERPRETATION",
  "UNKNOWN",
  "LIMITATION",
] as const;
export type EngineerClaimKind = (typeof ENGINEER_CLAIM_KINDS)[number];

export const ENGINEER_INTENTS = [
  "summary",
  "defects",
  "condition",
  "measurements",
  "evidence",
  "missing",
  "recommendations",
  "history",
  "indicators",
  "report_draft",
  "question",
  "injection",
  "mutation",
  "certification",
  "remaining_life",
] as const;
export type EngineerIntent = (typeof ENGINEER_INTENTS)[number];

export const II_ENGINEER_PLATFORM_TOOL_KEYS = [
  "inspection_intelligence.get_inspection",
  "inspection_intelligence.get_session",
  "inspection_intelligence.get_target_history",
  "inspection_intelligence.get_defects",
  "inspection_intelligence.get_condition_assessment",
  "inspection_intelligence.get_evidence",
  "inspection_intelligence.get_measurements",
  "inspection_intelligence.get_recommendations",
  "inspection_intelligence.get_corrective_actions",
  "inspection_intelligence.get_verifications",
  "inspection_intelligence.get_report_snapshot",
  "inspection_intelligence.get_deterministic_indicators",
] as const;
export type IiEngineerPlatformToolKey = (typeof II_ENGINEER_PLATFORM_TOOL_KEYS)[number];

export type EngineerCitation = {
  sourceDomain: "inspection_intelligence";
  entityType: string;
  entityId: string;
  asOf?: string;
  label: string;
};

export type EngineerClaim = {
  kind: EngineerClaimKind;
  text: string;
  citations: readonly EngineerCitation[];
};

export type EngineerRecordSummary = {
  id: string;
  kind: string;
  status?: string;
  summary: string;
  at?: string;
};

export type EngineerContext = {
  capability: typeof AI_INSPECTION_ENGINEER_CAPABILITY;
  generatedAt: string;
  tenantBound: true;
  workspaceBound: true;
  projectId?: string;
  session?: {
    id: string;
    status: string;
    planId?: string;
    planTitle?: string;
    startedAt?: string;
    completedAt?: string;
    targets: Array<{ kind?: string; canonicalId?: string; label?: string }>;
  };
  observations: readonly EngineerRecordSummary[];
  measurements: readonly EngineerRecordSummary[];
  evidence: readonly EngineerRecordSummary[];
  defects: readonly EngineerRecordSummary[];
  recommendations: readonly EngineerRecordSummary[];
  correctiveActions: readonly EngineerRecordSummary[];
  assessments: readonly EngineerRecordSummary[];
  conditionRatings: readonly EngineerRecordSummary[];
  verifications: readonly EngineerRecordSummary[];
  history: readonly EngineerRecordSummary[];
  indicators: {
    openDefects?: number;
    unknownDefectStatus?: number;
    outstandingCorrectiveActions?: number;
    pendingVerifications?: number;
    sessionsWithoutEvidence?: number;
    unratedSessions?: number;
  };
  report?: {
    id: string;
    reportKey: string;
    title?: string;
    authority?: string;
    limitations: readonly string[];
  };
  unknowns: readonly string[];
  limitations: readonly string[];
  readOnly: true;
  mutationEnabled: false;
};

export type EngineerAnswer = {
  capability: typeof AI_INSPECTION_ENGINEER_CAPABILITY;
  intent: EngineerIntent;
  toolsUsed: readonly IiEngineerPlatformToolKey[];
  answer: string;
  summary: string;
  facts: readonly string[];
  interpretations: readonly string[];
  unknowns: readonly string[];
  limitations: readonly string[];
  evidenceRefs: readonly EngineerCitation[];
  inspectionRefs: readonly EngineerCitation[];
  claims: readonly EngineerClaim[];
  confidenceBasis: string;
  starterQuestions: readonly string[];
  navigation: readonly { label: string; path: string }[];
  advisory: true;
  readOnly: true;
  mutationEnabled: false;
  autonomousApprovalEnabled: false;
  aiOptional: true;
  aiAvailable: boolean;
  aiProvider?: string;
  aiModel?: string;
  directorRunId?: string;
  overlaySkippedReason?: string;
  promptKey?: string;
  promptVersion?: string;
  refused: boolean;
  refusedReason?: string;
  profile?: {
    contextAssemblyMs?: number;
    modelMs?: number;
    toolMs?: number;
    totalMs?: number;
  };
};

export type EngineerRuntimeProbe = {
  featureFlagEnabled: boolean;
  agentRegistered: boolean;
  agentActive: boolean;
  promptResolvable: boolean;
  promptKey?: string;
  promptVersion?: string;
  promptFallback?: "none" | "catalog_system_prompt" | "unresolved";
  promptFallbackPolicy?: string;
  modelPolicyResolvable: boolean;
  modelKey?: string;
  providerType?: string;
  toolsResolvable: boolean;
  toolCatalogRowsFound: number;
  providerRouteAvailable: boolean;
  realProviderAvailable: boolean;
  realModelAvailable: boolean;
  toolRegistryModel: string;
  directorUsed: boolean;
};
