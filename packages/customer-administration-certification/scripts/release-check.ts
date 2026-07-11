import { execSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { executeCertification } from "./run-certification.js";
import { certificationArtifactPath } from "../src/lib/artifact-paths.js";
import { scanCertSourcesForWeakenedAssertions } from "../src/lib/certification-artifact.js";
import { assertEnvironmentSafety } from "../src/lib/env-safety.js";
import { assertPreflight } from "../src/lib/env.js";
import {
  assertWorkingTreeClean,
  assertWorkingTreeCleanAfter,
  resolveGitRevision,
} from "../src/lib/git-repo.js";
import { writeReleaseCheckReport, type GateResult } from "../src/report.js";

const ROOT = resolve(process.cwd(), "../..");
const PKG = process.cwd();

interface TimedStep {
  name: string;
  ok: boolean;
  command: string;
  durationMs: number;
  output?: string;
}

function log(msg: string): void {
  console.log(`[phase5:release-check] ${msg}`);
}

function loadRootEnv(): void {
  const envPath = resolve(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    if (!process.env[key]) process.env[key] = value;
  }
  process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function runTimed(cmd: string, cwd = ROOT): TimedStep {
  const started = Date.now();
  try {
    const output = execSync(cmd, {
      cwd,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      env: {
        ...process.env,
        CUSTOMER_ADMIN_CERTIFICATION: "1",
        CUSTOMER_ADMIN_RELEASE_CHECK: "1",
        FORCE_COLOR: "0",
      },
    });
    return { name: cmd, ok: true, command: cmd, durationMs: Date.now() - started, output: output.slice(-2000) };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    const output = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n");
    return {
      name: cmd,
      ok: false,
      command: cmd,
      durationMs: Date.now() - started,
      output: output.slice(-2000),
    };
  }
}

function collectCertSourceFiles(): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  for (const dir of [resolve(PKG, "src"), resolve(PKG, "playwright")]) {
    if (!existsSync(dir)) continue;
    for (const file of readdirSync(dir, { recursive: true })) {
      const name = String(file);
      if (!/\.(ts|tsx)$/.test(name)) continue;
      const path = resolve(dir, name);
      files.push({ path, content: readFileSync(path, "utf8") });
    }
  }
  return files;
}

function toGateResult(
  id: string,
  name: string,
  command: string,
  step: TimedStep
): GateResult {
  return {
    gate: id,
    name,
    status: step.ok ? "pass" : "fail",
    command,
    output: step.output?.slice(-3000),
    error: step.ok ? undefined : step.output?.slice(-1500),
    durationMs: step.durationMs,
  };
}

async function main(): Promise<void> {
  process.env.CUSTOMER_ADMIN_RELEASE_CHECK = "1";
  loadRootEnv();

  const allowDirty = process.env.CUSTOMER_ADMIN_ALLOW_DIRTY === "1";
  if (allowDirty) {
    log("WARNING: CUSTOMER_ADMIN_ALLOW_DIRTY=1 — artifact will not be release eligible");
  } else {
    assertWorkingTreeClean(ROOT, "Release check preflight");
  }

  log("Environment safety checks");
  const environmentSafety = assertEnvironmentSafety(ROOT);
  const gitRevision = resolveGitRevision(ROOT);
  assertPreflight(ROOT, { allowDirty });

  const steps: TimedStep[] = [];
  const started = Date.now();

  log("Platform core tests");
  const platformCore = runTimed("pnpm --filter @rtb/platform-core test", ROOT);
  steps.push({ ...platformCore, name: "platform-core-tests" });
  if (!platformCore.ok) throw new Error("platform core tests failed");

  log("Phase 4 unit tests");
  const unit = runTimed("pnpm test:unit", PKG);
  steps.push({ ...unit, name: "unit-tests" });
  if (!unit.ok) throw new Error("unit tests failed");

  log("Web typecheck");
  const webTypecheck = runTimed("pnpm --filter @rtb/web typecheck", ROOT);
  steps.push({ ...webTypecheck, name: "web-typecheck" });
  if (!webTypecheck.ok) throw new Error("web typecheck failed");

  const regression = runTimed("pnpm test:regression", PKG);
  steps.push({ ...regression, name: "regression-tests" });
  if (!regression.ok) throw new Error("regression tests failed");

  log("Source scan for weakened assertions");
  const scanStarted = Date.now();
  const sourceFiles = collectCertSourceFiles();
  const weakened = scanCertSourcesForWeakenedAssertions(sourceFiles);
  steps.push({
    name: "source-scan",
    ok: weakened.length === 0,
    command: "scanCertSourcesForWeakenedAssertions",
    durationMs: Date.now() - scanStarted,
  });
  if (weakened.length > 0) {
    throw new Error(`Weakened assertion patterns detected: ${weakened.join("; ")}`);
  }

  log("Hosted certification harness (single run, preflight gates skipped)");
  const certStarted = Date.now();
  const preflightGates: GateResult[] = [
    toGateResult("A", "Platform core tests", "pnpm --filter @rtb/platform-core test", platformCore),
    toGateResult("A", "Phase 4 unit tests", "pnpm test:unit", unit),
    toGateResult("A", "Web typecheck", "pnpm --filter @rtb/web typecheck", webTypecheck),
  ];
  const cert = await executeCertification({
    root: ROOT,
    pkgDir: PKG,
    skipPreflightGates: true,
    preflightGates,
    requireReleaseEligible: !allowDirty,
  });
  steps.push({
    name: "certify",
    ok: cert.verdict === "PASS",
    command: "executeCertification",
    durationMs: Date.now() - certStarted,
  });

  assertWorkingTreeCleanAfter(ROOT, "Release check");

  const certPath = certificationArtifactPath(PKG);
  const reportPath = writeReleaseCheckReport(PKG, {
    verdict: cert.report.releaseEligible ? "PASS" : allowDirty ? "PASS_DIAGNOSTIC" : "FAIL",
    phase: 5,
    releaseCheckTimestamp: new Date().toISOString(),
    totalDurationMs: Date.now() - started,
    commitSha: gitRevision.commitSha,
    branch: gitRevision.branch,
    certificationArtifactPath: certPath,
    certificationCommitSha: cert.report.commitSha,
    certificationTarget: environmentSafety.certificationTarget,
    environmentSafety,
    releaseEligible: cert.report.releaseEligible,
    releaseEligibilityReasons: cert.report.releaseEligibilityReasons,
    workingTreeClean: cert.report.workingTreeClean,
    steps,
    artifactGateSummary: cert.report.gateSummary,
    artifactPlaywrightSummary: cert.report.playwrightCertificationSummary,
    artifactHttpSummary: cert.report.httpCertificationSummary,
  });

  log(`Release check artifact: ${reportPath}`);
  log(`Certification artifact: ${certPath}`);
  log(`releaseEligible: ${cert.report.releaseEligible}`);
  log(`Verdict: ${cert.report.releaseEligible || allowDirty ? "PASS" : "FAIL"}`);

  if (!cert.report.releaseEligible && !allowDirty) {
    throw new Error(
      `Release check produced non-eligible artifact: ${cert.report.releaseEligibilityReasons.join("; ")}`
    );
  }
}

main().catch((e) => {
  console.error(`[phase5:release-check] ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
