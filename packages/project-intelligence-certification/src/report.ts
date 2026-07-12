import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { BuildIdentity } from "./build-identity.js";
import type { CertificationGateId } from "./gates.js";

export interface CertificationReport {
  schemaVersion: 1;
  phase: "6B" | "6C-1" | "6C-2";
  verdict: "PASS" | "FAIL";
  createdAt: string;
  repository: string;
  branch: string;
  commitSha: string;
  buildIdentityCommitSha: string;
  workingTreeClean: boolean;
  buildIdentity: BuildIdentity;
  environment: string;
  hostedStagingProjectRef: string | null;
  gates: readonly { id: CertificationGateId; status: "pass" | "fail" | "skip"; detail?: string; command?: string }[];
  requiredGateCount: number;
  passedGateCount: number;
  failedGateCount: number;
  skippedGateCount: number;
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
  /** Phase 6C-2 document intelligence evidence fields */
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
}

export function writeCertificationReport(path: string, report: CertificationReport): string {
  const output = resolve(path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return output;
}
