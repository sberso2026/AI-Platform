import { readFileSync } from "node:fs";

import type { GateResult, Phase4CertificationReport } from "../report.js";
import type { EnvironmentSafetyReport } from "./env-safety.js";

export const CERTIFICATION_ARTIFACT_SCHEMA_VERSION = "customer-admin-certification/v1";

export interface GateSummary {
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  requiredMissing: string[];
}

export interface HttpCertificationSummary {
  gateId: string;
  gateName: string;
  status: "pass" | "fail" | "skip";
  testsPassed: number | null;
  testsTotal: number | null;
}

export interface PlaywrightCertificationSummary {
  gateId: string;
  gateName: string;
  status: "pass" | "fail" | "skip";
  testsPassed: number | null;
  testsTotal: number | null;
}

export interface CertificationArtifactV1 extends Phase4CertificationReport {
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

const REQUIRED_GATE_NAMES = [
  "Platform core tests",
  "Phase 4 unit tests",
  "Web typecheck",
  "Hosted Batch 33 schema",
  "Growth credit reconciliation",
  "Build identity",
  "HTTP authorization matrix",
  "Administration UI unit gates",
  "Playwright flows A–P",
  "Accessibility checks",
  "Responsive checks",
];

const FORBIDDEN_STATUS_ALLOWLIST_PATTERNS = [
  /\[\s*[^\]]*500[^\]]*\]\.toContain/,
  /\[\s*[^\]]*503[^\]]*\]\.toContain/,
  /\[\s*200,\s*403,\s*404,\s*409,\s*422,\s*500\s*\]/,
  /status\s*[!<>=]+\s*600/,
  /toBeLessThan\(600\)/,
  /not\.toBe\(401\)/,
  /500,\s*503/,
];

export function parseTestCounts(output: string | undefined): { passed: number | null; total: number | null } {
  if (!output) return { passed: null, total: null };
  const passedMatch = output.match(/(\d+)\s+passed/i);
  const totalMatch = output.match(/(\d+)\s+tests?\s/i) ?? output.match(/Running\s+(\d+)\s+test/i);
  return {
    passed: passedMatch ? Number(passedMatch[1]) : null,
    total: totalMatch ? Number(totalMatch[1]) : null,
  };
}

export function buildGateSummary(gates: GateResult[]): GateSummary {
  const passed = gates.filter((g) => g.status === "pass").length;
  const failed = gates.filter((g) => g.status === "fail").length;
  const skipped = gates.filter((g) => g.status === "skip").length;
  const present = new Set(gates.map((g) => g.name));
  const requiredMissing = REQUIRED_GATE_NAMES.filter((name) => !present.has(name));
  return { total: gates.length, passed, failed, skipped, requiredMissing };
}

export function countServerErrorsInGates(gates: GateResult[]): number {
  let count = 0;
  for (const gate of gates) {
    const blob = `${gate.output ?? ""}\n${gate.error ?? ""}`;
    const statusMatches = blob.matchAll(/\b(5\d{2})\b/g);
    for (const match of statusMatches) {
      const code = Number(match[1]);
      if (code >= 500) count += 1;
    }
    if (/Unexpected server error status/i.test(blob)) count += 1;
  }
  return count;
}

export function scanCertSourceForWeakenedAssertions(
  source: string,
  options?: { filePath?: string }
): string[] {
  const violations: string[] = [];
  for (const pattern of FORBIDDEN_STATUS_ALLOWLIST_PATTERNS) {
    if (pattern.test(source)) violations.push(pattern.source);
  }
  const isPlaywrightFile = options?.filePath?.includes(`${"playwright"}${"/"}`) ?? false;
  if (isPlaywrightFile && /from\s+["']vitest["']/.test(source)) {
    violations.push("playwright imports vitest");
  }
  return violations;
}

export function scanCertSourcesForWeakenedAssertions(
  files: Array<{ path: string; content: string }>
): string[] {
  const violations: string[] = [];
  for (const file of files) {
    violations.push(...scanCertSourceForWeakenedAssertions(file.content, { filePath: file.path }));
  }
  return [...new Set(violations)];
}

export function validateCertificationArtifact(
  artifact: CertificationArtifactV1,
  options?: { sourceScan?: string; requireReleaseEligible?: boolean }
): void {
  const errors: string[] = [];

  if (!artifact.commitSha?.trim()) errors.push("commitSha is missing");
  if (!artifact.supabaseProjectRef?.trim()) errors.push("supabaseProjectRef is missing");
  if (!artifact.schemaVersion) errors.push("schemaVersion is missing");
  if (!artifact.buildTimestamp) errors.push("buildTimestamp is missing");
  if (artifact.skippedTests > 0) errors.push(`skippedTests must be 0, got ${artifact.skippedTests}`);
  if (artifact.gateSummary.requiredMissing.length > 0) {
    errors.push(`missing required gates: ${artifact.gateSummary.requiredMissing.join(", ")}`);
  }
  if (artifact.gateSummary.failed > 0) errors.push(`failed gates: ${artifact.gateSummary.failed}`);
  if (artifact.serverErrorCaptureCount > 0) {
    errors.push(`5xx captured in gate output: ${artifact.serverErrorCaptureCount}`);
  }
  if (artifact.verdict !== "PASS") errors.push(`verdict is ${artifact.verdict}`);
  if (options?.requireReleaseEligible && !artifact.releaseEligible) {
    errors.push(`releaseEligible is false: ${artifact.releaseEligibilityReasons.join("; ")}`);
  }
  if (artifact.diagnosticDirtyOverride && artifact.releaseEligible) {
    errors.push("releaseEligible cannot be true when diagnosticDirtyOverride is set");
  }

  if (options?.sourceScan) {
    const weakened = scanCertSourceForWeakenedAssertions(options.sourceScan);
    if (weakened.length > 0) errors.push(`weakened assertion patterns: ${weakened.join("; ")}`);
  }

  if (errors.length > 0) {
    throw new Error(`Certification artifact validation failed:\n- ${errors.join("\n- ")}`);
  }
}

export function validateReleaseArtifact(
  artifact: CertificationArtifactV1,
  expected: { commitSha: string; projectRef: string; certificationTarget: string }
): void {
  const errors: string[] = [];
  validateCertificationArtifact(artifact);
  if (artifact.commitSha !== expected.commitSha) {
    errors.push(`commitSha mismatch: artifact=${artifact.commitSha} expected=${expected.commitSha}`);
  }
  if (artifact.supabaseProjectRef !== expected.projectRef) {
    errors.push(
      `project ref mismatch: artifact=${artifact.supabaseProjectRef} expected=${expected.projectRef}`
    );
  }
  if (artifact.certificationTarget !== expected.certificationTarget) {
    errors.push(
      `target mismatch: artifact=${artifact.certificationTarget} expected=${expected.certificationTarget}`
    );
  }
  if (!artifact.releaseEligible) {
    errors.push(`releaseEligible false: ${artifact.releaseEligibilityReasons.join("; ")}`);
  }
  if (!artifact.workingTreeClean) errors.push("workingTreeClean must be true for release verification");
  if (errors.length > 0) {
    throw new Error(`Release artifact verification failed:\n- ${errors.join("\n- ")}`);
  }
}

export function readCertificationArtifact(path: string): CertificationArtifactV1 {
  const raw = JSON.parse(readFileSync(path, "utf8")) as CertificationArtifactV1;
  validateCertificationArtifact(raw);
  return raw;
}
