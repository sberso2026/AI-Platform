import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface GateResult {
  gate: string;
  name: string;
  status: "pass" | "fail" | "skip";
  command: string;
  output?: string;
  error?: string;
}

export interface CertificationReport {
  verdict: "PASS" | "FAIL";
  environment: string;
  commitSha: string;
  supabaseProjectRef: string | null;
  testDate: string;
  certificationServerPort?: number;
  gates: GateResult[];
  failures: string[];
  warnings: string[];
  skippedTests: number;
  artifacts: string[];
  migrationChecksums?: Record<string, string>;
}

export function writeCertificationReport(
  pkgDir: string,
  root: string,
  report: CertificationReport
): string {
  const artifactsDir = resolve(pkgDir, "artifacts");
  mkdirSync(artifactsDir, { recursive: true });

  const jsonPath = resolve(artifactsDir, "phase-3-certification.json");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const lines = [
    "# Installation Phase 3 Certification",
    "",
    `**Verdict:** ${report.verdict}`,
    `**Date:** ${report.testDate}`,
    `**Environment:** ${report.environment}`,
    `**Commit:** ${report.commitSha}`,
    `**Supabase project:** ${report.supabaseProjectRef ?? "unknown"}`,
    "",
    "## Gates",
    "",
    "| Gate | Name | Status |",
    "|------|------|--------|",
    ...report.gates.map((g) => `| ${g.gate} | ${g.name} | ${g.status.toUpperCase()} |`),
    "",
    "## Summary",
    "",
    `- Failures: ${report.failures.length}`,
    `- Warnings: ${report.warnings.length}`,
    `- Skipped required tests: ${report.skippedTests}`,
    "",
  ];

  if (report.failures.length > 0) {
    lines.push("## Failures", "");
    for (const f of report.failures) lines.push(`- ${f}`);
    lines.push("");
  }

  if (report.warnings.length > 0) {
    lines.push("## Warnings", "");
    for (const w of report.warnings) lines.push(`- ${w}`);
    lines.push("");
  }

  const docPath = resolve(root, "docs/certification/INSTALLATION_PHASE_3_CERTIFICATION.md");
  mkdirSync(resolve(docPath, ".."), { recursive: true });
  writeFileSync(docPath, lines.join("\n"));

  return jsonPath;
}
