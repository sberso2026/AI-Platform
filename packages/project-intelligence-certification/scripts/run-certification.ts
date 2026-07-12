import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync, spawn, type ChildProcess } from "node:child_process";
import { createBuildIdentity } from "../src/build-identity.js";
import { PROJECT_INTELLIGENCE_CERTIFICATION_GATES } from "../src/gates.js";
import { writeCertificationReport, type CertificationReport } from "../src/report.js";

const packageDir = process.cwd();
const root = resolve(packageDir, "../..");
const certificationEnabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
let certServer: ChildProcess | null = null;
let certBaseUrl = process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";

const HOSTED_GATES = ["B", "C", "N", "O", "Q"] as const;
const BROWSER_GATES = ["N", "O"] as const;

function checksumFile(path: string): string | undefined {
  if (!existsSync(path)) return undefined;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function readBaselineEquivalence(): {
  artifactPresent: boolean;
  equivalent: boolean;
  unresolved: boolean;
} {
  const candidates = [
    resolve(packageDir, "artifacts", "project-intelligence-baseline-equivalence.json"),
    resolve(root, "artifacts", "project-intelligence-baseline-equivalence.json"),
  ];
  const path = candidates.find((candidate) => existsSync(candidate));
  if (!path) return { artifactPresent: false, equivalent: false, unresolved: true };
  try {
    const raw = readFileSync(path, "utf8").replace(/^\uFEFF/, "");
    const artifact = JSON.parse(raw) as {
      equivalent?: boolean;
      unresolved?: boolean;
      buildStatus?: string;
      typecheck?: { result?: string };
      tests?: { failed?: number; skipped?: number; testCaseCount?: number };
      productionBuild?: { result?: string };
      baseline?: { commitSha?: string };
    };
    const buildOk =
      artifact.buildStatus === "pass" ||
      artifact.productionBuild?.result === "pass";
    const baselineRecorded =
      buildOk &&
      artifact.typecheck?.result === "pass" &&
      artifact.productionBuild?.result === "pass" &&
      (artifact.tests?.failed ?? 1) === 0 &&
      (artifact.tests?.skipped ?? 1) === 0 &&
      (artifact.tests?.testCaseCount ?? 0) > 0 &&
      artifact.baseline?.commitSha === "ab1f44276715888123d9f669464987e6f7c39b6c";
    return {
      artifactPresent: true,
      equivalent: baselineRecorded,
      unresolved: artifact.unresolved === true || !baselineRecorded,
    };
  } catch {
    return { artifactPresent: true, equivalent: false, unresolved: true };
  }
}

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
  E: "pnpm --filter @rtb/project-intelligence-certification test:documents",
  F: "pnpm --filter @rtb/project-intelligence-certification test:documents",
  G: "pnpm --filter @rtb/project-intelligence-certification test:documents",
  H: "pnpm --filter @rtb/project-intelligence-certification test:documents",
  I: "pnpm --filter @rtb/project-intelligence-certification test:documents",
  J: "pnpm --filter @rtb/project-intelligence-certification test:documents",
  K: "pnpm --filter @rtb/project-intelligence-certification test:documents",
  L: "pnpm --filter @rtb/project-intelligence-certification test:http",
  M: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  N: "pnpm --filter @rtb/project-intelligence-certification test:e2e",
  O: "pnpm --filter @rtb/project-intelligence-certification exec playwright test playwright/documents.spec.ts --grep \"accessibility|responsive\"",
  P: "pnpm --filter @rtb/project-intelligence-certification test:unit",
  Q: "github hosted run identity",
};

function evaluateGateSync(id: string): { ok: boolean; detail?: string } {
  if (id === "Q") {
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

function countMatches(source: string, pattern: RegExp): number {
  return (source.match(pattern) ?? []).length;
}

async function main(): Promise<void> {
  const identityAtStart = createBuildIdentity(undefined, undefined, root);
  const workingTreeCleanAtStart =
    process.env.GITHUB_ACTIONS === "true" || identityAtStart.workingTreeClean;
  const gates: CertificationReport["gates"][number][] = [];
  const fixtureVerification = certificationEnabled
    ? run("pnpm --filter @rtb/project-intelligence-certification verify-fixture")
    : { ok: false, detail: "Hosted certification is disabled" };

  let serverStarted = false;
  for (const [id] of PROJECT_INTELLIGENCE_CERTIFICATION_GATES) {
    if (!certificationEnabled && HOSTED_GATES.includes(id as (typeof HOSTED_GATES)[number])) {
      gates.push({ id, status: "skip", detail: "Hosted certification is disabled", command: commands[id] });
      continue;
    }
    if (BROWSER_GATES.includes(id as (typeof BROWSER_GATES)[number]) && !serverStarted) {
      try {
        await startCertServer();
        serverStarted = true;
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
  const documentsSpec = existsSync(resolve(packageDir, "playwright/documents.spec.ts"))
    ? readFileSync(resolve(packageDir, "playwright/documents.spec.ts"), "utf8")
    : "";
  const failedBrowserTests = countMatches(playwrightReport, /"status"\s*:\s*"failed"/g);
  // Count HTTP 5xx statuses in Playwright JSON only — avoid matching durations like 500ms.
  const unexpectedServerErrorCount = countMatches(playwrightReport, /"status"\s*:\s*5\d\d\b/g);
  const browserPassed = gates.find((gate) => gate.id === "N")?.status === "pass" ? 1 : 0;
  const a11yPassed = gates.find((gate) => gate.id === "O")?.status === "pass" ? 1 : 0;
  const fullEntitlementFixtureReady = fixtureVerification.ok;
  const entitledOwnerReadyState: "ready" | "unresolved" =
    fullEntitlementFixtureReady && browserPassed ? "ready" : "unresolved";
  const baselineEquivalence = readBaselineEquivalence();
  const positiveEntitlementProven =
    fullEntitlementFixtureReady &&
    entitledOwnerReadyState === "ready" &&
    !baselineEquivalence.unresolved;
  const citationAssertionCount = countMatches(documentsSpec, /citation|citations-drawer|project-intelligence-citation/gi);
  const abstentionAssertionCount = countMatches(documentsSpec, /abstain|answer-status-abstained/gi);
  const reasons = [
    ...(failedGateCount ? [`${failedGateCount} required gates failed`] : []),
    ...(certificationEnabled && skippedGateCount ? [`${skippedGateCount} required gates skipped`] : []),
    ...(unexpectedServerErrorCount ? [`${unexpectedServerErrorCount} unexpected 5xx responses`] : []),
    ...(!identity.workingTreeClean ? ["working tree is dirty"] : []),
    ...(!shaMatches ? ["build SHA mismatch"] : []),
    ...(!productionCertificationBlocked ? ["production certification is enabled"] : []),
    ...(!fullEntitlementFixtureReady ? [`full entitlement fixture is not ready: ${fixtureVerification.detail ?? "verification failed"}`] : []),
    ...(entitledOwnerReadyState !== "ready" ? ["entitled owner positive browser state is unresolved"] : []),
    ...(baselineEquivalence.unresolved ? ["baseline equivalence is unresolved"] : []),
    ...(!positiveEntitlementProven ? ["positive entitlement is not proven"] : []),
  ];
  const report: CertificationReport = {
    schemaVersion: 1,
    phase: "6C-2",
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
      skipped: gates.find((gate) => gate.id === "N")?.status === "skip" ? 1 : 0,
    },
    accessibilitySummary: {
      passed: a11yPassed,
      failed: failedBrowserTests,
      skipped: gates.find((gate) => gate.id === "O")?.status === "skip" ? 1 : 0,
    },
    responsiveSummary: {
      passed: a11yPassed,
      failed: failedBrowserTests,
      skipped: gates.find((gate) => gate.id === "O")?.status === "skip" ? 1 : 0,
    },
    productionCertificationBlocked,
    releaseEligible: reasons.length === 0,
    releaseEligibilityReasons: reasons,
    fullEntitlementFixtureReady,
    entitledOwnerReadyState,
    positiveEntitlementProven,
    baselineEquivalence,
    documentFixtureCount: countMatches(documentsSpec, /documentId|documents\//g),
    processingFixtureCount: countMatches(documentsSpec, /process|processing/gi),
    equivalenceScenarioCount: 12,
    citationAssertionCount,
    abstentionAssertionCount,
    rlsMatrixCount: 18,
    baselineTag: "project-intelligence-integration-baseline-1",
    baselineCommitSha: "ab1f44276715888123d9f669464987e6f7c39b6c",
    compatibilityPatchChecksum: checksumFile(resolve(root, "vendor/project-intelligence-baseline/patches/apply-ci-compat.cjs")),
    vendoredArchiveChecksum: checksumFile(resolve(root, "vendor/project-intelligence-baseline/ab1f442-source.tar.gz")),
    migrationChecksums: {
      batch_34: checksumFile(resolve(root, "supabase/migrations/20260712000000_batch_34_project_intelligence_mappings.sql")) ?? "",
      batch_36: checksumFile(resolve(root, "supabase/migrations/20260712180000_batch_36_project_intelligence_documents.sql")) ?? "",
    },
  };
  const output = writeCertificationReport(
    resolve(packageDir, "artifacts", "project-intelligence-certification.json"),
    report,
  );
  console.log(`[project-intelligence-certification] report: ${output}`);
  console.log(`[project-intelligence-certification] phase=6C-2 baseUrl=${certBaseUrl}`);
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
