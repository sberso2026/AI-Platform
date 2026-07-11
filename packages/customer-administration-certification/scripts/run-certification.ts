import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { platform, release } from "node:os";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { verifyBuildIdentity } from "../src/build-identity.js";
import { certificationArtifactPath } from "../src/lib/artifact-paths.js";
import {
  buildGateSummary,
  CERTIFICATION_ARTIFACT_SCHEMA_VERSION,
  countServerErrorsInGates,
  parseTestCounts,
  scanCertSourcesForWeakenedAssertions,
  validateCertificationArtifact,
} from "../src/lib/certification-artifact.js";
import { assertEnvironmentSafety } from "../src/lib/env-safety.js";
import { assertPreflight, fixturesManifestPath, HOSTED_PROJECT_REF } from "../src/lib/env.js";
import {
  assertWorkingTreeCleanAfter,
  readWorkingTreeStatus,
  resolveGitRevision,
} from "../src/lib/git-repo.js";
import { computeReleaseEligibility } from "../src/lib/release-eligibility.js";
import { CertificationServer } from "../src/lib/cert-server.js";
import { type GateResult, writePhase4Report, type CertificationArtifactReport } from "../src/report.js";

export interface CertificationRunOptions {
  root?: string;
  pkgDir?: string;
  skipPreflightGates?: boolean;
  preflightGates?: GateResult[];
  requireReleaseEligible?: boolean;
}

export interface CertificationRunResult {
  reportPath: string;
  report: CertificationArtifactReport;
  verdict: "PASS" | "FAIL";
}

function resolveRoot(options?: CertificationRunOptions): { root: string; pkg: string } {
  const pkg = options?.pkgDir ?? process.cwd();
  const root = options?.root ?? resolve(pkg, "../..");
  return { root, pkg };
}

function loadRootEnv(root: string): void {
  const envPath = resolve(root, ".env.local");
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

function run(cmd: string, cwd: string): { ok: boolean; output: string; durationMs: number } {
  const started = Date.now();
  try {
    const output = execSync(cmd, {
      cwd,
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
      env: { ...process.env, CUSTOMER_ADMIN_CERTIFICATION: "1", FORCE_COLOR: "0" },
    });
    return { ok: true, output, durationMs: Date.now() - started };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      output: [e.stdout, e.stderr, e.message].filter(Boolean).join("\n"),
      durationMs: Date.now() - started,
    };
  }
}

function gate(id: string, name: string, command: string, cwd: string): GateResult {
  console.log(`[phase4:certify] Gate ${id}: ${name}`);
  const result = run(command, cwd);
  return {
    gate: id,
    name,
    status: result.ok ? "pass" : "fail",
    command,
    output: result.output.slice(-3000),
    error: result.ok ? undefined : result.output.slice(-1500),
    durationMs: result.durationMs,
  };
}

function collectCertSourceFiles(pkg: string): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];
  for (const dir of [resolve(pkg, "src"), resolve(pkg, "playwright")]) {
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

function runtimeVersions(): { nodeVersion: string; pnpmVersion: string; runnerOs: string } {
  let pnpmVersion = "unknown";
  try {
    pnpmVersion = execSync("pnpm --version", { encoding: "utf8" }).trim();
  } catch {
    // ignore
  }
  return {
    nodeVersion: process.version,
    pnpmVersion,
    runnerOs: `${platform()} ${release()}`,
  };
}

export async function executeCertification(
  options: CertificationRunOptions = {}
): Promise<CertificationRunResult> {
  const { root, pkg } = resolveRoot(options);
  process.env.CUSTOMER_ADMIN_CERTIFICATION = "1";
  loadRootEnv(root);

  const environmentSafety = assertEnvironmentSafety(root);
  const allowDirty = process.env.CUSTOMER_ADMIN_ALLOW_DIRTY === "1";
  const preflight = assertPreflight(root, { allowDirty });
  const gitRevision = resolveGitRevision(root);
  const workingTree = readWorkingTreeStatus(root);
  const runtime = runtimeVersions();

  const gates: GateResult[] = [];
  const skipPreflight = options.skipPreflightGates ?? process.env.CUSTOMER_ADMIN_RELEASE_CHECK === "1";

  if (skipPreflight && options.preflightGates?.length) {
    gates.push(...options.preflightGates);
  } else if (!skipPreflight) {
    gates.push(
      gate("A", "Platform core tests", "pnpm --filter @rtb/platform-core test", root),
      gate("A", "Phase 4 unit tests", "pnpm test:unit", pkg),
      gate("A", "Web typecheck", "pnpm --filter @rtb/web typecheck", root)
    );
  }

  console.log("[phase4:certify] Provisioning Phase 4 fixtures...");
  const prov = run("pnpm provision", pkg);
  if (!prov.ok) {
    gates.push({
      gate: "PRE",
      name: "Fixture provision",
      status: "fail",
      command: "pnpm provision",
      error: prov.output,
      durationMs: prov.durationMs,
    });
    throw new Error("Fixture provision failed");
  }

  gates.push(
    gate("B", "Hosted Batch 33 schema", "pnpm verify-hosted-schema", pkg),
    gate("C", "Growth credit reconciliation", "pnpm test:growth", pkg)
  );

  const certServer = new CertificationServer(root);
  let port: number | undefined;
  let buildPayload;

  try {
    port = await certServer.start();
    gates.push({
      gate: "A",
      name: "Web production build (cert server)",
      status: "pass",
      command: "pnpm build + pnpm start",
      output: "built",
    });

    const identity = await verifyBuildIdentity(root, certServer.baseUrl, {
      allowDirtyOverride: allowDirty,
      requireCleanForRelease: process.env.CUSTOMER_ADMIN_RELEASE_CHECK === "1" && !allowDirty,
    });
    if (!identity.ok) {
      gates.push({
        gate: "N",
        name: "Build identity",
        status: "fail",
        command: "GET /api/platform/build-identity",
        error: identity.error,
      });
    } else {
      buildPayload = identity.payload;
      gates.push({
        gate: "N",
        name: "Build identity",
        status: "pass",
        command: "GET /api/platform/build-identity",
        output: JSON.stringify(buildPayload, null, 2),
      });
    }

    gates.push(
      gate("D", "HTTP authorization matrix", "pnpm test:http", pkg),
      gate("E", "Administration UI unit gates", "pnpm test:administration", pkg),
      gate("F", "Playwright flows A–P", "pnpm test:e2e", pkg),
      gate("M", "Accessibility checks", "pnpm test:a11y", pkg),
      gate("M", "Responsive checks", "pnpm test:responsive", pkg)
    );
  } finally {
    certServer.stop();
    try {
      run("pnpm teardown", pkg);
    } catch {
      // teardown is best-effort
    }
  }

  const failures = gates.filter((g) => g.status === "fail").map((g) => `${g.gate} ${g.name}`);
  const verdict = failures.length === 0 ? "PASS" : "FAIL";
  const gateSummary = buildGateSummary(gates);
  const serverErrorCaptureCount = countServerErrorsInGates(gates);

  const httpCertificationSummary = gates
    .filter((g) => g.gate === "D" || g.name.toLowerCase().includes("http"))
    .map((g) => {
      const counts = parseTestCounts(g.output);
      return {
        gateId: g.gate,
        gateName: g.name,
        status: g.status,
        testsPassed: counts.passed,
        testsTotal: counts.total,
      };
    });

  const playwrightCertificationSummary = gates
    .filter((g) => g.gate === "F" || g.name.toLowerCase().includes("playwright"))
    .map((g) => {
      const counts = parseTestCounts(g.output);
      return {
        gateId: g.gate,
        gateName: g.name,
        status: g.status,
        testsPassed: counts.passed,
        testsTotal: counts.total,
      };
    });

  const releaseEligibility = computeReleaseEligibility(
    {
      schemaVersion: CERTIFICATION_ARTIFACT_SCHEMA_VERSION,
      verdict,
      phase: 4,
      environment: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "unknown",
      commitSha: preflight.commitSha,
      branch: preflight.branch,
      buildTimestamp: new Date().toISOString(),
      packageVersion: "0.1.0",
      supabaseProjectRef: buildPayload?.supabaseProjectRef ?? HOSTED_PROJECT_REF,
      buildIdentityToken: buildPayload?.buildIdentityToken,
      certificationServerPort: port,
      certificationTarget: environmentSafety.certificationTarget,
      environmentSafety,
      gateSummary,
      httpCertificationSummary,
      playwrightCertificationSummary,
      serverErrorCaptureCount,
      gates,
      failures,
      skippedTests: 0,
      artifacts: [certificationArtifactPath(pkg), fixturesManifestPath()],
      migrationChecksums: buildPayload?.migrationChecksums,
      workingTreeClean: workingTree.clean,
      releaseEligible: false,
      releaseEligibilityReasons: [],
      productionCertificationBlocked: environmentSafety.productionProjectBlocked,
      requiredGateCount: gateSummary.total,
      passedGateCount: gateSummary.passed,
      failedGateCount: gateSummary.failed,
      skippedGateCount: gateSummary.skipped,
      unexpectedServerErrorCount: serverErrorCaptureCount,
    },
    {
      workingTree,
      expectedCommitSha: gitRevision.commitSha,
      buildIdentityCommitSha: buildPayload?.commitSha ?? null,
      ciRunId: process.env.GITHUB_RUN_ID,
      ciWorkflow: process.env.GITHUB_WORKFLOW,
      ciRunner: process.env.RUNNER_NAME,
    }
  );

  const report: CertificationArtifactReport = {
    schemaVersion: CERTIFICATION_ARTIFACT_SCHEMA_VERSION,
    verdict,
    phase: 4,
    environment: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "unknown",
    commitSha: preflight.commitSha,
    branch: preflight.branch,
    buildTimestamp: new Date().toISOString(),
    packageVersion: "0.1.0",
    supabaseProjectRef: buildPayload?.supabaseProjectRef ?? HOSTED_PROJECT_REF,
    buildIdentityToken: buildPayload?.buildIdentityToken,
    certificationServerPort: port,
    certificationTarget: environmentSafety.certificationTarget,
    environmentSafety,
    gateSummary,
    httpCertificationSummary,
    playwrightCertificationSummary,
    serverErrorCaptureCount,
    gates,
    failures,
    skippedTests: 0,
    artifacts: [certificationArtifactPath(pkg), fixturesManifestPath()],
    migrationChecksums: buildPayload?.migrationChecksums,
    workingTreeClean: releaseEligibility.workingTreeClean,
    releaseEligible: releaseEligibility.releaseEligible,
    releaseEligibilityReasons: releaseEligibility.releaseEligibilityReasons,
    productionCertificationBlocked: releaseEligibility.productionCertificationBlocked,
    requiredGateCount: releaseEligibility.requiredGateCount,
    passedGateCount: releaseEligibility.passedGateCount,
    failedGateCount: releaseEligibility.failedGateCount,
    skippedGateCount: releaseEligibility.skippedGateCount,
    unexpectedServerErrorCount: releaseEligibility.unexpectedServerErrorCount,
    repositoryUrl: gitRevision.repositoryUrl,
    nodeVersion: runtime.nodeVersion,
    pnpmVersion: runtime.pnpmVersion,
    runnerOs: runtime.runnerOs,
    ciRunId: releaseEligibility.ciRunId,
    ciWorkflow: releaseEligibility.ciWorkflow,
    ciRunner: releaseEligibility.ciRunner,
    buildIdentityCommitSha: buildPayload?.commitSha ?? null,
    diagnosticDirtyOverride: allowDirty && !workingTree.clean,
  };

  const reportPath = writePhase4Report(pkg, report);
  const sourceFiles = collectCertSourceFiles(pkg);
  const sourceScan = sourceFiles.map((f) => f.content).join("\n");
  const weakened = scanCertSourcesForWeakenedAssertions(sourceFiles);
  if (weakened.length > 0) {
    throw new Error(`Weakened assertion patterns detected in certification sources: ${weakened.join("; ")}`);
  }

  if (verdict === "PASS") {
    validateCertificationArtifact(report, {
      sourceScan,
      requireReleaseEligible: options.requireReleaseEligible,
    });
  }

  assertWorkingTreeCleanAfter(root, "Certification");

  console.log(`[phase4:certify] Report: ${reportPath}`);
  console.log(`[phase4:certify] Verdict: ${verdict}`);
  console.log(`[phase4:certify] releaseEligible: ${report.releaseEligible}`);

  if (verdict === "FAIL") {
    throw new Error(`Certification failed: ${failures.join(", ")}`);
  }

  return { reportPath, report, verdict };
}

async function main(): Promise<void> {
  try {
    await executeCertification();
  } catch (err) {
    console.error(`[phase4:certify] ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}

function isDirectExecution(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(resolve(entry)).href;
  } catch {
    return false;
  }
}

if (isDirectExecution()) {
  void main();
}
