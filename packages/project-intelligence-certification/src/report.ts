import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { BuildIdentity } from "./build-identity.js";
import type { CertificationGateId } from "./gates.js";

export interface CertificationReport {
  schemaVersion: 1;
  phase: "6B";
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
}

export function writeCertificationReport(path: string, report: CertificationReport): string {
  const output = resolve(path);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return output;
}
