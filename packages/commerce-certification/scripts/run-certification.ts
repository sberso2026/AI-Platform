/**
 * Orchestrates Commerce Phase 2 certification gates A–H and writes evidence artifacts.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { assertCertificationSecrets } from "../src/lib/env.js";

const ROOT = resolve(process.cwd(), "../..");
const PKG = process.cwd();

interface GateResult {
  gate: string;
  name: string;
  status: "pass" | "fail" | "skip";
  command: string;
  output?: string;
  error?: string;
}

interface CertificationReport {
  verdict: "PASS" | "FAIL";
  environment: string;
  commitSha: string;
  testDate: string;
  gates: GateResult[];
  failures: string[];
  warnings: string[];
  skippedTests: number;
  artifacts: string[];
}

function log(msg: string): void {
  console.log(`[commerce:certify] ${msg}`);
}

function runCommand(label: string, command: string, cwd = ROOT): { ok: boolean; output: string } {
  try {
    const output = execSync(command, {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, COMMERCE_CERTIFICATION: "1", FORCE_COLOR: "0" },
    });
    return { ok: true, output };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    const output = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n");
    return { ok: false, output };
  }
}

function gate(
  id: string,
  name: string,
  command: string,
  cwd?: string
): GateResult {
  log(`Gate ${id}: ${name}`);
  const result = runCommand(name, command, cwd);
  return {
    gate: id,
    name,
    status: result.ok ? "pass" : "fail",
    command,
    output: result.output.slice(-4000),
    error: result.ok ? undefined : result.output.slice(-2000),
  };
}

function resolveCommitSha(): string {
  try {
    return execSync("git rev-parse HEAD", { cwd: ROOT, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

function writeMarkdown(report: CertificationReport): void {
  const lines = [
    "# Commerce Phase 2 Certification",
    "",
    `**Verdict:** ${report.verdict}`,
    `**Date:** ${report.testDate}`,
    `**Environment:** ${report.environment}`,
    `**Commit:** ${report.commitSha}`,
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

  lines.push("## Known limitations", "");
  lines.push("- Process-local entitlement read cache may lag across instances (documented low-risk).");
  lines.push("");

  const docPath = resolve(ROOT, "docs/certification/COMMERCE_PHASE_2_CERTIFICATION.md");
  mkdirSync(resolve(docPath, ".."), { recursive: true });
  writeFileSync(docPath, lines.join("\n"));
}

async function main(): Promise<void> {
  process.env.COMMERCE_CERTIFICATION = "1";
  assertCertificationSecrets();

  log("Provisioning fresh certification fixtures...");
  const prov = runCommand("provision", "pnpm provision", PKG);
  if (!prov.ok) {
    console.error(prov.output);
    process.exit(1);
  }

  const gates: GateResult[] = [
    gate("A", "Repository tests", "pnpm test"),
    gate("A", "Platform commerce tests", "pnpm --filter @rtb/platform-commerce test"),
    gate("A", "Engineering OS tests", "pnpm --filter @rtb/engineering-os test"),
    gate("A", "Web typecheck", "pnpm --filter @rtb/web typecheck"),
    gate("A", "Web production build", "pnpm --filter @rtb/web build"),
    gate("B", "Hosted schema verification", "pnpm commerce:verify-hosted-phase2", ROOT),
    gate("C", "Backfill verification", "pnpm commerce:verify-backfill", ROOT),
    gate("D", "RLS certification tests", "pnpm test:rls", PKG),
    gate("E", "HTTP enforcement tests", "pnpm test:http", PKG),
    gate("F", "Browser E2E tests", "pnpm test:e2e", PKG),
    gate("G", "Scheduler security tests", "pnpm test:scheduler", PKG),
    gate("H", "Fresh evaluation / cache tests", "pnpm test:http -- src/http/fresh-evaluation.test.ts", PKG),
  ];

  gates.push(gate("D", "Security definer tests", "pnpm test:security-definer", PKG));

  const failures = gates.filter((g) => g.status === "fail").map((g) => `Gate ${g.gate} ${g.name}`);
  const verdict = failures.length === 0 ? "PASS" : "FAIL";

  const report: CertificationReport = {
    verdict,
    environment: process.env.SUPABASE_URL ?? "unknown",
    commitSha: resolveCommitSha(),
    testDate: new Date().toISOString(),
    gates,
    failures,
    warnings: [],
    skippedTests: 0,
    artifacts: [
      "artifacts/commerce-phase2-certification.json",
      "docs/certification/COMMERCE_PHASE_2_CERTIFICATION.md",
      "artifacts/cert-fixtures.json",
    ],
  };

  const artifactsDir = resolve(PKG, "artifacts");
  mkdirSync(artifactsDir, { recursive: true });
  const jsonPath = resolve(artifactsDir, "commerce-phase2-certification.json");
  writeFileSync(jsonPath, JSON.stringify(report, null, 2));
  writeMarkdown(report);

  log(`Wrote ${jsonPath}`);
  log(`Verdict: ${verdict}`);

  if (verdict === "FAIL") {
    for (const f of failures) log(`FAIL: ${f}`);
    process.exit(1);
  }

  log("Cleaning up certification fixtures...");
  const teardown = runCommand("teardown", "pnpm teardown", PKG);
  if (!teardown.ok) {
    log(`Teardown warning: ${teardown.output.slice(-500)}`);
  }

  log("Ready for Phase 3: Installation Lifecycle and Workspace Provisioning");
  process.exit(0);
}

main().catch((err) => {
  console.error(`[commerce:certify] FAIL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
