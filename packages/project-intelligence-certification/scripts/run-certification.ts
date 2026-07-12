import { execSync, spawn, type ChildProcess } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createBuildIdentity } from "../src/build-identity.js";
import { PROJECT_INTELLIGENCE_CERTIFICATION_GATES } from "../src/gates.js";
import { writeCertificationReport, type CertificationReport } from "../src/report.js";

const packageDir = process.cwd();
const root = resolve(packageDir, "../..");
const certificationEnabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
let certServer: ChildProcess | null = null;
let certBaseUrl = process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";

function run(command: string): { ok: boolean; detail?: string } {
  try {
    execSync(command, { cwd: root, stdio: "pipe", encoding: "utf8", env: process.env });
    return { ok: true };
  } catch (error) {
    const result = error as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, detail: [result.stdout, result.stderr, result.message].filter(Boolean).join("\n").slice(-2000) };
  }
}

async function waitForServer(url: string, timeoutMs = 180_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let last = "timeout";
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
      last = `status ${response.status}`;
    } catch (error) {
      last = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
  }
  throw new Error(`cert server not ready: ${last}`);
}

async function startCertServer(): Promise<void> {
  if (process.env.RTB_TEST_BASE_URL) {
    certBaseUrl = process.env.RTB_TEST_BASE_URL;
    return;
  }
  const webDir = resolve(root, "apps/web");
  certServer = spawn("pnpm", ["start"], {
    cwd: webDir,
    env: { ...process.env, PORT: "3000", HOSTNAME: "127.0.0.1" },
    stdio: "inherit",
    shell: true,
  });
  certBaseUrl = "http://127.0.0.1:3000";
  process.env.RTB_TEST_BASE_URL = certBaseUrl;
  await waitForServer(certBaseUrl);
}

function stopCertServer(): void {
  if (!certServer) return;
  certServer.kill("SIGTERM");
  certServer = null;
}

const commands: Record<string, string> = {
  A: "pnpm --filter @rtb/project-intelligence test && pnpm --filter @rtb/project-intelligence-certification test:unit && pnpm --filter @rtb/project-intelligence typecheck && pnpm --filter @rtb/web typecheck && pnpm --filter @rtb/web build",
  B: "pnpm --filter @rtb/project-intelligence-certification verify-hosted-schema",
  C: "pnpm --filter @rtb/project-intelligence-certification test:rls",
  D: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  E: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  F: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  G: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  H: "pnpm --filter @rtb/project-intelligence-certification test:http",
  I: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  J: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  K: "pnpm --filter @rtb/project-intelligence-certification test:e2e",
  L: "pnpm --filter @rtb/project-intelligence-certification test:http",
  M: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  N: "github hosted run identity",
};

function evaluateGateSync(id: string): { ok: boolean; detail?: string } {
  if (id === "N") {
    const ok =
      Boolean(process.env.GITHUB_RUN_ID?.trim()) &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET === "hosted_staging" &&
      Boolean(process.env.GITHUB_SHA?.trim());
    return {
      ok,
      detail: ok
        ? `run=${process.env.GITHUB_RUN_ID} sha=${process.env.GITHUB_SHA}`
        : "GITHUB_RUN_ID/GITHUB_SHA/hosted_staging certification env required",
    };
  }
  return run(commands[id]!);
}

async function main(): Promise<void> {
  const identityAtStart = createBuildIdentity(undefined, undefined, root);
  const workingTreeCleanAtStart = identityAtStart.workingTreeClean;
  const gates: CertificationReport["gates"] = [];
  for (const [id] of PROJECT_INTELLIGENCE_CERTIFICATION_GATES) {
    if (!certificationEnabled && ["B", "C", "K", "N"].includes(id)) {
      gates.push({ id, status: "skip", detail: "Hosted certification is disabled", command: commands[id] });
      continue;
    }
    if (id === "K") {
      try {
        await startCertServer();
      } catch (error) {
        gates.push({
          id,
          status: "fail",
          detail: error instanceof Error ? error.message : String(error),
          command: commands[id],
        });
        continue;
      }
    }
    const result = evaluateGateSync(id);
    gates.push({ id, status: result.ok ? "pass" : "fail", detail: result.detail, command: commands[id] });
  }
  stopCertServer();

  const identity = {
    ...createBuildIdentity(undefined, undefined, root),
    workingTreeClean: workingTreeCleanAtStart,
  };
  const requiredGateCount = gates.length;
  const passedGateCount = gates.filter((gate) => gate.status === "pass").length;
  const failedGateCount = gates.filter((gate) => gate.status === "fail").length;
  const skippedGateCount = gates.filter((gate) => gate.status === "skip").length;
  const productionCertificationBlocked =
    process.env.ALLOW_PRODUCTION_CERTIFICATION !== "true" &&
    process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET !== "production";
  const expectedSha = process.env.GITHUB_SHA ?? identity.commitSha;
  const shaMatches = identity.commitSha !== "unknown" && identity.commitSha === expectedSha;
  const playwrightReportPath = resolve(packageDir, "artifacts/playwright-report.json");
  const playwrightReport = existsSync(playwrightReportPath) ? readFileSync(playwrightReportPath, "utf8") : "";
  const failedBrowserTests = (playwrightReport.match(/"status"\s*:\s*"failed"/g) ?? []).length;
  const unexpectedServerErrorCount = (playwrightReport.match(/\b5\d\d\b/g) ?? []).length;
  const browserPassed = gates.find((gate) => gate.id === "K")?.status === "pass" ? 1 : 0;
  const reasons = [
    ...(failedGateCount ? [`${failedGateCount} required gates failed`] : []),
    ...(certificationEnabled && skippedGateCount ? [`${skippedGateCount} required gates skipped`] : []),
    ...(unexpectedServerErrorCount ? [`${unexpectedServerErrorCount} unexpected 5xx responses`] : []),
    ...(!identity.workingTreeClean ? ["working tree is dirty"] : []),
    ...(!shaMatches ? ["build SHA mismatch"] : []),
    ...(!productionCertificationBlocked ? ["production certification is enabled"] : []),
  ];
  const report: CertificationReport = {
    schemaVersion: 1,
    phase: "6B",
    verdict: reasons.length === 0 ? "PASS" : "FAIL",
    createdAt: new Date().toISOString(),
    repository: identity.repository ?? "unknown",
    branch: identity.branch,
    commitSha: identity.commitSha,
    buildIdentityCommitSha: identity.commitSha,
    workingTreeClean: identity.workingTreeClean,
    buildIdentity: identity,
    environment: process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET ?? "unknown",
    hostedStagingProjectRef: process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF ?? null,
    gates,
    requiredGateCount,
    passedGateCount,
    failedGateCount,
    skippedGateCount,
    unexpectedServerErrorCount,
    browserSummary: {
      passed: browserPassed,
      failed: failedBrowserTests,
      skipped: gates.find((gate) => gate.id === "K")?.status === "skip" ? 1 : 0,
    },
    accessibilitySummary: {
      passed: browserPassed,
      failed: failedBrowserTests,
      skipped: gates.find((gate) => gate.id === "K")?.status === "skip" ? 1 : 0,
    },
    responsiveSummary: {
      passed: browserPassed,
      failed: failedBrowserTests,
      skipped: gates.find((gate) => gate.id === "K")?.status === "skip" ? 1 : 0,
    },
    productionCertificationBlocked,
    releaseEligible: reasons.length === 0,
    releaseEligibilityReasons: reasons,
  };
  const output = writeCertificationReport(
    resolve(packageDir, "artifacts", "project-intelligence-certification.json"),
    report,
  );
  console.log(`[project-intelligence-certification] report: ${output}`);
  console.log(`[project-intelligence-certification] baseUrl=${certBaseUrl}`);
  if (report.verdict === "FAIL") {
    console.error(`[project-intelligence-certification] FAIL: ${reasons.join("; ")}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  stopCertServer();
  console.error(error);
  process.exitCode = 1;
});
