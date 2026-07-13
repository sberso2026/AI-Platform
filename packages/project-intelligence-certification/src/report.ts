import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { BuildIdentity } from "./build-identity.js";
import type {
  CertificationGateId,
  MeetingFoundationCertificationGateId,
  ProviderCertificationGateId,
} from "./gates.js";

export interface CertificationReport {
  schemaVersion: 1;
  phase: "6B" | "6C-1" | "6C-2" | "6C-3B";
  verdict: "PASS" | "FAIL";
  createdAt: string;
  repository: string;
  branch: string;
  commitSha: string;
  /** Alias of commit under test — not "certified" unless verdict PASS. */
  implementationCommitSha?: string;
  /** Set only when provider certification verdict is PASS; otherwise null/none. */
  providerCertifiedCommitSha?: string | null;
  ciHeadSha?: string;
  buildIdentityCommitSha: string;
  workingTreeClean: boolean;
  buildIdentity: BuildIdentity;
  environment: string;
  hostedStagingProjectRef: string | null;
  gates: readonly {
    id: CertificationGateId | ProviderCertificationGateId | MeetingFoundationCertificationGateId;
    status: "pass" | "fail" | "skip" | "not_executed";
    detail?: string;
    command?: string;
  }[];
  requiredGateCount: number;
  passedGateCount: number;
  failedGateCount: number;
  skippedGateCount: number;
  notExecutedGateCount?: number;
  unexpectedServerErrorCount: number;
  browserSummary: { passed: number; failed: number; skipped: number };
  accessibilitySummary: { passed: number; failed: number; skipped: number };
  responsiveSummary: { passed: number; failed: number; skipped: number };
  productionCertificationBlocked: boolean;
  releaseEligible: boolean;
  releaseEligibilityReasons: string[];
  fullEntitlementFixtureReady?: boolean;
  entitledOwnerReadyState?: "ready" | "unresolved";
  positiveEntitlementProven?: boolean;
  baselineEquivalence?: {
    artifactPresent: boolean;
    equivalent: boolean;
    unresolved: boolean;
  };
  documentFixtureCount?: number;
  processingFixtureCount?: number;
  equivalenceScenarioCount?: number;
  citationAssertionCount?: number;
  abstentionAssertionCount?: number;
  rlsMatrixCount?: number;
  baselineTag?: string;
  baselineCommitSha?: string;
  compatibilityPatchChecksum?: string;
  vendoredArchiveChecksum?: string;
  migrationChecksums?: Record<string, string>;
  parserProviders?: string[];
  embeddingProvider?: string;
  embeddingModel?: string;
  embeddingDimension?: number;
  vectorDimension?: number;
  vectorIndexType?: string;
  hashEmbeddingsDisabled?: boolean;
  advancedParserProvider?: string;
  ocrProvider?: string;
  providerSecretsPresent?: Record<string, boolean>;
  thresholdFileChecksum?: string;
  fixtureSetChecksum?: string;
  parserFixtureCount?: number;
  ocrPageCount?: number;
  retrievalDatasetChecksum?: string;
  retrievalThresholds?: Record<string, number>;
  retrievalResults?: Record<string, number>;
  retrievalMetrics?: Record<string, number>;
  citationMetrics?: Record<string, number>;
  abstentionMetrics?: Record<string, number>;
  conflictMetrics?: Record<string, number>;
  tableMetrics?: Record<string, number>;
  providerFailureScenarioCount?: number;
  multiWorkerScenarioCount?: number;
  productionDocumentIntelligenceReady?: boolean;
  notExecutedGates?: string[];
  requiredGatesNotExecuted?: string[];
}

export function writeCertificationReport(path: string, report: CertificationReport): string {
  const output = resolve(path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return output;
}
