import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import type { EnvironmentSafetyReport } from "./lib/env-safety.js";
import type {
  GateSummary,
  HttpCertificationSummary,
  PlaywrightCertificationSummary,
} from "./lib/certification-artifact.js";
import { CERTIFICATION_ARTIFACT_SCHEMA_VERSION } from "./lib/certification-artifact.js";
import {
  certificationArtifactPath,
  releaseCheckArtifactPath,
} from "./lib/artifact-paths.js";

export interface GateResult {
  gate: string;
  name: string;
  status: "pass" | "fail" | "skip";
  command: string;
  output?: string;
  error?: string;
  durationMs?: number;
}

export interface Phase4CertificationReport {
  verdict: "PASS" | "FAIL";
  phase: 4;
  environment: string;
  commitSha: string;
  branch: string;
  buildTimestamp: string;
  packageVersion: string;
  supabaseProjectRef: string | null;
  buildIdentityToken?: string;
  certificationServerPort?: number;
  gates: GateResult[];
  failures: string[];
  skippedTests: number;
  artifacts: string[];
  migrationChecksums?: Record<string, string>;
}

export interface CertificationArtifactReport extends Phase4CertificationReport {
  schemaVersion: typeof CERTIFICATION_ARTIFACT_SCHEMA_VERSION;
  certificationTarget: string;
  environmentSafety: EnvironmentSafetyReport;
  gateSummary: GateSummary;
  httpCertificationSummary: HttpCertificationSummary[];
  playwrightCertificationSummary: PlaywrightCertificationSummary[];
  serverErrorCaptureCount: number;
  workingTreeClean: boolean;
  releaseEligible: boolean;
  releaseEligibilityReasons: string[];
  productionCertificationBlocked: boolean;
  requiredGateCount: number;
  passedGateCount: number;
  failedGateCount: number;
  skippedGateCount: number;
  unexpectedServerErrorCount: number;
  repositoryUrl?: string | null;
  nodeVersion?: string;
  pnpmVersion?: string;
  runnerOs?: string;
  ciRunId?: string;
  ciWorkflow?: string;
  ciRunner?: string;
  buildIdentityCommitSha?: string | null;
  diagnosticDirtyOverride?: boolean;
}

export function writePhase4Report(
  pkgDir: string,
  report: CertificationArtifactReport
): string {
  const path = certificationArtifactPath(pkgDir);
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(report, null, 2));
  return path;
}

export function writeReleaseCheckReport(
  pkgDir: string,
  report: Record<string, unknown>
): string {
  const path = releaseCheckArtifactPath(pkgDir);
  mkdirSync(resolve(path, ".."), { recursive: true });
  writeFileSync(path, JSON.stringify(report, null, 2));
  return path;
}
