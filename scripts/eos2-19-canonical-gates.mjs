#!/usr/bin/env node
/**
 * EOS 2.19 canonical security/release gate orchestration.
 * Deterministic constituent results, bounded pack timeouts, correct secret-scan path,
 * and explicit known-moderate dependency disposition (GHSA-w5hq-g745-h8pq).
 *
 * Exit codes:
 *   0 — all required packs PASS (dependency may be PASS_WITH_KNOWN_MODERATE)
 *   1 — functional failure
 *   2 — pack timeout
 *   3 — orchestration/config error
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const KNOWN_MODERATE = "GHSA-w5hq-g745-h8pq";
const DEFAULT_TIMEOUT_MS = Number(process.env.EOS219_GATE_TIMEOUT_MS || 180_000);
const LIVE_TIMEOUT_MS = Number(process.env.EOS219_LIVE_PERSISTENCE_TIMEOUT_MS || 240_000);
const includeLive = process.env.EOS219_INCLUDE_LIVE_PERSISTENCE === "1";

/** @typedef {{ id: string, label: string, command: string, args: string[], timeoutMs: number, required: boolean, classify?: (code: number, stdout: string, stderr: string) => string }} Pack */

/** @type {Pack[]} */
const packs = [
  {
    id: "release-governance",
    label: "Release governance suite",
    command: "pnpm",
    args: ["--filter", "@rtb/release-governance", "test"],
    timeoutMs: DEFAULT_TIMEOUT_MS,
    required: true,
  },
  {
    id: "eos2-web",
    label: "EOS 2 web rollout/pilot tests",
    command: "pnpm",
    args: [
      "--filter",
      "@rtb/web",
      "exec",
      "vitest",
      "run",
      "src/__tests__/eos2-rollout.test.ts",
      "src/__tests__/eos2-rollout-mode.test.ts",
      "src/__tests__/eos2-pilot-workflow.test.ts",
    ],
    timeoutMs: DEFAULT_TIMEOUT_MS,
    required: true,
  },
  {
    id: "persistence-unit",
    label: "Engineering review persistence unit/security guards",
    command: "pnpm",
    args: ["--filter", "@rtb/engineering-review-persistence", "test:unit"],
    timeoutMs: DEFAULT_TIMEOUT_MS,
    required: true,
  },
  {
    id: "engineering-review",
    label: "Engineering review package tests",
    command: "pnpm",
    args: ["--filter", "@rtb/engineering-review", "test"],
    timeoutMs: DEFAULT_TIMEOUT_MS,
    required: true,
  },
  {
    id: "platform-core",
    label: "Platform core tests",
    command: "pnpm",
    args: ["--filter", "@rtb/platform-core", "test"],
    timeoutMs: DEFAULT_TIMEOUT_MS,
    required: true,
  },
  {
    id: "secret-scan",
    label: "Secret scan (correct package path)",
    command: "pnpm",
    args: ["--filter", "@rtb/engineering-review-persistence", "secret-scan"],
    timeoutMs: 60_000,
    required: true,
  },
  {
    id: "dependency-audit",
    label: "Production dependency audit",
    command: "pnpm",
    args: ["audit", "--prod"],
    timeoutMs: 120_000,
    required: true,
    classify(code, stdout, stderr) {
      const text = `${stdout}\n${stderr}`;
      if (code === 0) return "PASS";
      const onlyKnown =
        text.includes(KNOWN_MODERATE) &&
        /1 vulnerabilities found/i.test(text) &&
        /Severity:\s*1 moderate/i.test(text) &&
        !/critical|high/i.test(text.split(KNOWN_MODERATE)[0] ?? "");
      if (onlyKnown) return "PASS_WITH_KNOWN_MODERATE";
      return "FAIL";
    },
  },
];

if (includeLive) {
  packs.push({
    id: "persistence-live",
    label: "Live persistence/RLS pack (optional, bounded)",
    command: "pnpm",
    args: ["--filter", "@rtb/engineering-review-persistence", "test:rls"],
    timeoutMs: LIVE_TIMEOUT_MS,
    required: false,
  });
}

function runPack(pack) {
  return new Promise((resolve) => {
    const child = spawn(pack.command, pack.args, {
      cwd: root,
      shell: true,
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGTERM");
      setTimeout(() => child.kill("SIGKILL"), 5_000);
      resolve({
        id: pack.id,
        label: pack.label,
        required: pack.required,
        status: "TIMEOUT",
        exitCode: null,
        timeoutMs: pack.timeoutMs,
        stdoutTail: stdout.slice(-2000),
        stderrTail: stderr.slice(-2000),
      });
    }, pack.timeoutMs);

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({
        id: pack.id,
        label: pack.label,
        required: pack.required,
        status: "FAIL",
        exitCode: 3,
        error: String(error),
        stdoutTail: stdout.slice(-2000),
        stderrTail: stderr.slice(-2000),
      });
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const status = pack.classify
        ? pack.classify(code ?? 1, stdout, stderr)
        : code === 0
          ? "PASS"
          : "FAIL";
      resolve({
        id: pack.id,
        label: pack.label,
        required: pack.required,
        status,
        exitCode: code,
        timeoutMs: pack.timeoutMs,
        stdoutTail: stdout.slice(-2000),
        stderrTail: stderr.slice(-2000),
      });
    });
  });
}

function extractReleaseTestCount(result) {
  if (result.id !== "release-governance") return null;
  const match = result.stdoutTail.match(/Tests\s+(\d+)\s+passed/);
  return match ? Number(match[1]) : null;
}

const results = [];
for (const pack of packs) {
  process.stderr.write(`eos2-19-gate: starting ${pack.id} (timeout ${pack.timeoutMs}ms)\n`);
  const result = await runPack(pack);
  results.push(result);
  process.stderr.write(`eos2-19-gate: ${pack.id} => ${result.status}\n`);
}

const releaseTestCount = results.map(extractReleaseTestCount).find((n) => typeof n === "number") ?? null;
const timedOut = results.some((r) => r.status === "TIMEOUT" && r.required);
const failedRequired = results.some(
  (r) => r.required && r.status !== "PASS" && r.status !== "PASS_WITH_KNOWN_MODERATE",
);
const dependency = results.find((r) => r.id === "dependency-audit");
const authoritative =
  timedOut ? "TIMEOUT" : failedRequired ? "FAIL" : dependency?.status === "PASS_WITH_KNOWN_MODERATE"
    ? "PASS_WITH_KNOWN_MODERATE"
    : "PASS";

const report = {
  phase: "EOS-2.19-PILOT-EXPANSION-AND-OPERATIONAL-HARDENING",
  orchestration: "scripts/eos2-19-canonical-gates.mjs",
  authoritativeResult: authoritative,
  backgroundGateAmbiguityResolved: true,
  knownModerateAdvisory: KNOWN_MODERATE,
  knownModerateDisposition:
    dependency?.status === "PASS_WITH_KNOWN_MODERATE"
      ? "ACCEPTED_BOUNDED_RISK"
      : dependency?.status === "PASS"
        ? "REMEDIATED_OR_ABSENT"
        : "UNRESOLVED",
  releaseTestCount,
  includeLivePersistence: includeLive,
  results: results.map(({ stdoutTail, stderrTail, ...rest }) => rest),
  generatedAt: new Date().toISOString(),
};

const outDir = join(root, "docs/architecture/engineering-os");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "EOS_2_19_CANONICAL_GATE_RESULT.json");
writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);

if (authoritative === "TIMEOUT") process.exit(2);
if (authoritative === "FAIL") process.exit(1);
process.exit(0);
