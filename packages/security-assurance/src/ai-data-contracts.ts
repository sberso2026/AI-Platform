/**
 * Phase 15D AI & Data Security Assurance public contracts — 0.4.0-ai-data-security.
 * Not frozen 1.0.0. Observes AI/data security; does not own AI stack or DLP platform.
 */

export type DataSecurityClassification =
  | "public"
  | "internal"
  | "confidential"
  | "restricted"
  | "unknown";

export type AiDataSecurityPlane =
  | "DATA_INGESTION"
  | "DATA_STORAGE"
  | "RETRIEVAL"
  | "AI_CONTEXT"
  | "PROMPT"
  | "MODEL_PROVIDER"
  | "TOOL_INPUT"
  | "TOOL_OUTPUT"
  | "MODEL_OUTPUT"
  | "PERSISTENCE"
  | "LOGGING_TELEMETRY"
  | "DATA_EGRESS";

export type AiDataSecurityResult =
  | "pass"
  | "fail"
  | "partial"
  | "not_applicable"
  | "unknown"
  | "not_assessed"
  | "error";

export type DataHandlingPolicyRef = {
  policyId: string;
  version: string;
  owner: "platform_policy" | "ai_provider_policy" | "data_governance" | "ops";
  /** Reuses Platform Policy Engine — not a second engine */
  usesPlatformPolicyEngine: true;
};

export type AiDataFlowRecord = {
  flowId: string;
  plane: AiDataSecurityPlane;
  source: string;
  tenantId: string;
  workspaceId: string;
  classification: DataSecurityClassification;
  purpose: string;
  destination: string;
  providerId?: string;
  modelId?: string;
  modelVersion?: string;
  toolId?: string;
  policyRefs: string[];
  provenanceRefs: string[];
  evidenceRefs: string[];
  timestamp: string;
  decision: "allow" | "deny" | "unknown";
  status: AiDataSecurityResult;
  /** Never persist raw secrets solely for assurance */
  containsRawSecret: false;
  containsSensitivePayload: false;
};

export type ProviderDataHandlingAssessment = {
  assessmentId: string;
  providerId: string;
  modelId?: string;
  modelVersion?: string;
  approvedStatus: "approved" | "unknown" | "unapproved";
  dataHandlingPolicyRef?: string;
  retentionTrainingPosture?: "evidenced" | "unknown" | "not_applicable";
  egressClassification: DataSecurityClassification;
  tenantId: string;
  workspaceId: string;
  result: AiDataSecurityResult;
  assessedAt: string;
  /** Unknown evidence => unknown/not_assessed, never fabricated PASS */
  fabricatedPassForbidden: true;
};

export type SensitiveDataExposureAssessment = {
  assessmentId: string;
  plane: AiDataSecurityPlane;
  scope: string;
  exposureDetected: boolean;
  redactedEvidenceRef?: string;
  result: AiDataSecurityResult;
  assessedAt: string;
  /** Findings ≠ proof of universal safety */
  universalSafetyClaimed: false;
};

export type AiDataSecurityFinding = {
  findingId: string;
  plane: AiDataSecurityPlane;
  severity: "critical" | "high" | "medium" | "low" | "informational" | "unknown";
  status: "open" | "accepted" | "remediation_planned" | "remediated" | "closed" | "false_positive";
  summary: string;
  evidenceRefs: string[];
  provenanceRefs: string[];
  normalizedAt: string;
  /** finding ≠ incident */
  isIncident: false;
  containsSensitivePayload: false;
};

export type AiDataSecurityAssessment = {
  assessmentId: string;
  plane: AiDataSecurityPlane;
  scope: string;
  flowRefs: string[];
  evidenceRefs: string[];
  result: AiDataSecurityResult;
  freshness: "current" | "stale" | "expired" | "unknown";
  limitations?: string;
  findingIds: string[];
  assessedAt: string;
  reviewStatus: "candidate" | "pending_review" | "approved" | "rejected";
  governedReviewAction: "security_assurance.ai_data_review";
  /** Probe/test errors must not become PASS */
  errorCannotBecomePass: true;
};

export type AiDataSecurityPlaneStatus = {
  plane: AiDataSecurityPlane;
  result: AiDataSecurityResult;
  lastVerifiedAt?: string;
  freshness: "current" | "stale" | "expired" | "missing" | "unknown";
  limitations?: string;
};

export type AiDataSecuritySnapshot = {
  snapshotId: string;
  capturedAt: string;
  scope: string;
  planes: AiDataSecurityPlaneStatus[];
  overallResult: AiDataSecurityResult;
  isolationDimensionPreserved: true;
  universalScorePresent: false;
  promptInjectionCompletelyPreventedClaimed: false;
  knownSensitiveDataLeakageDetected: false;
};

export const AI_DATA_SECURITY_PLANES: AiDataSecurityPlane[] = [
  "DATA_INGESTION",
  "DATA_STORAGE",
  "RETRIEVAL",
  "AI_CONTEXT",
  "PROMPT",
  "MODEL_PROVIDER",
  "TOOL_INPUT",
  "TOOL_OUTPUT",
  "MODEL_OUTPUT",
  "PERSISTENCE",
  "LOGGING_TELEMETRY",
  "DATA_EGRESS",
];

export const AI_DATA_SECURITY_CONTRACT_NAMES = [
  "DataSecurityClassification",
  "DataHandlingPolicyRef",
  "AiDataFlowRecord",
  "AiDataSecurityAssessment",
  "AiDataSecurityFinding",
  "ProviderDataHandlingAssessment",
  "SensitiveDataExposureAssessment",
  "AiDataSecuritySnapshot",
] as const;

export const AI_DATA_SECURITY_SEMANTICS = {
  unknownClassificationNeverSilentPublic: true,
  unknownProviderNeverFabricatedPass: true,
  probeErrorNeverPass: true,
  findingNeqIncident: true,
  noUniversalPromptInjectionClaim: true,
  noAutonomousRemediation: true,
  assuranceNeqEnforcement: true,
  noDuplicateAiStack: true,
} as const;

/** Unknown/missing classification must never silently become public. */
export function normalizeClassification(
  value: DataSecurityClassification | null | undefined,
): DataSecurityClassification {
  if (!value) return "unknown";
  if (value === "public" || value === "internal" || value === "confidential" || value === "restricted") {
    return value;
  }
  return "unknown";
}

export function classificationAllowsPublicDisclosure(
  classification: DataSecurityClassification,
): boolean {
  return classification === "public";
}
