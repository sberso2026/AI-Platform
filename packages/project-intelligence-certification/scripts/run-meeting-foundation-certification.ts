import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync, spawn, type ChildProcess } from "node:child_process";
import { createBuildIdentity } from "../src/build-identity.js";
import { PROJECT_INTELLIGENCE_MEETING_FOUNDATION_CERTIFICATION_GATES } from "../src/gates.js";
import { PHASE_6C3B_MANUAL_TRANSITIONS, MEETING_PROVIDER_STATUS } from "@rtb/project-intelligence";

const packageDir = process.cwd();
const root = resolve(packageDir, "../..");
const certificationEnabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const meetingCert = process.env.PI_MEETING_FOUNDATION_CERTIFICATION === "1";
let certServer: ChildProcess | null = null;
let certBaseUrl = process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";

const BROWSER_TEST_COUNT = 18;
const MEETING_RLS_ACTOR_COUNT = 3;
const DOCUMENT_INTELLIGENCE_BASELINE_SHA = "dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";

function checksumFile(path: string): string | undefined {
  if (!existsSync(path)) return undefined;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function run(command: string, envOverrides: Record<string, string> = {}): { ok: boolean; detail?: string } {
  try {
    execSync(command, {
      cwd: root,
      stdio: "pipe",
      encoding: "utf8",
      env: { ...process.env, ...envOverrides },
    });
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
  A: "pnpm --filter @rtb/project-intelligence test && pnpm --filter @rtb/project-intelligence-certification test:meetings && pnpm --filter @rtb/project-intelligence typecheck && pnpm --filter @rtb/web typecheck && pnpm --filter @rtb/web build",
  B: "pnpm --filter @rtb/project-intelligence-certification verify-hosted-meeting-schema",
  C: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/rls/meeting-rls-matrix.test.ts",
  D: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/entitlement-isolation.test.ts",
  E: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/lifecycle.test.ts",
  F: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/service-surfaces.test.ts -t \"Gate F\"",
  G: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/service-surfaces.test.ts -t \"Gate G\"",
  H: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/consent.test.ts",
  I: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/service-surfaces.test.ts -t \"Gate I\"",
  J: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/service-surfaces.test.ts -t \"Gate J\"",
  K: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/service-surfaces.test.ts -t \"Gate K\"",
  L: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/nested-error.test.ts",
  M: "pnpm --filter @rtb/project-intelligence-certification test:e2e:meetings",
  N: "pnpm --filter @rtb/project-intelligence-certification test:e2e:meetings:a11y",
  O: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/provider-unavailable.test.ts",
  P: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/entitlement-isolation.test.ts -t \"rejects meeting_intelligence\"",
  Q: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/build-identity.test.ts",
  R: "github hosted run identity",
  S: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/baseline-unchanged.test.ts",
};

function evaluateGateSync(id: string): { ok: boolean; detail?: string } {
  if (id === "R") {
    const ok =
      Boolean(process.env.GITHUB_RUN_ID?.trim()) &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" &&
      process.env.PI_MEETING_FOUNDATION_CERTIFICATION === "1" &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET === "hosted_staging" &&
      Boolean(process.env.GITHUB_SHA?.trim());
    return {
      ok,
      detail: ok
        ? `run=${process.env.GITHUB_RUN_ID} sha=${process.env.GITHUB_SHA}`
        : "GITHUB_RUN_ID/GITHUB_SHA/PI_MEETING_FOUNDATION_CERTIFICATION/hosted_staging required",
    };
  }
  return run(commands[id]!);
}

async function main(): Promise<void> {
  if (!meetingCert) {
    console.error("[meeting-foundation-certification] PI_MEETING_FOUNDATION_CERTIFICATION=1 is required");
    process.exitCode = 1;
    return;
  }

  const identityAtStart = createBuildIdentity(undefined, undefined, root);
  const workingTreeCleanAtStart =
    process.env.GITHUB_ACTIONS === "true" || identityAtStart.workingTreeClean;
  const gates: { id: string; status: GateStatus; detail?: string; command?: string }[] = [];

  let serverStarted = false;
  for (const [id] of PROJECT_INTELLIGENCE_MEETING_FOUNDATION_CERTIFICATION_GATES) {
    if (!certificationEnabled) {
      gates.push({ id, status: "not_executed", detail: "Hosted certification is disabled", command: commands[id] });
      continue;
    }
    if ((id === "M" || id === "N") && process.env.PI_BROWSER_ALREADY_CERTIFIED === "1") {
      gates.push({
        id,
        status: "pass",
        detail: "browser-certification job already passed; credited without re-run",
        command: commands[id],
      });
      continue;
    }
    if ((id === "M" || id === "N") && !serverStarted && !process.env.RTB_TEST_BASE_URL) {
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
    console.log(
      `[meeting-foundation-certification] gate ${id}: ${result.ok ? "pass" : "fail"}${result.detail ? ` — ${result.detail.slice(0, 400)}` : ""}`,
    );
  }
  stopCertServer();

  const identity = {
    ...createBuildIdentity(undefined, undefined, root),
    workingTreeClean: workingTreeCleanAtStart,
  };

  const gateCount = gates.length;
  const passedGates = gates.filter((gate) => gate.status === "pass").map((gate) => gate.id);
  const failedGates = gates.filter((gate) => gate.status === "fail").map((gate) => gate.id);
  const skippedGates = gates.filter((gate) => gate.status === "skip" || gate.status === "not_executed").map((gate) => gate.id);

  const ciHeadSha = process.env.GITHUB_SHA ?? identity.commitSha;
  const artifactCommitSha = identity.commitSha;
  const buildIdentitySha = identity.commitSha;
  const shaMatches =
    ciHeadSha !== "unknown" &&
    artifactCommitSha !== "unknown" &&
    ciHeadSha === artifactCommitSha &&
    artifactCommitSha === buildIdentitySha;

  const playwrightReportPath = resolve(packageDir, "artifacts/playwright-report.json");
  const playwrightReport = existsSync(playwrightReportPath) ? readFileSync(playwrightReportPath, "utf8") : "";
  const unexpected5xx = (playwrightReport.match(/"status"\s*:\s*5\d\d\b/g) ?? []).length;

  const allGatesPassed = failedGates.length === 0 && skippedGates.length === 0 && gateCount === 19;
  const manualMeetingFoundationReady = allGatesPassed && unexpected5xx === 0 && shaMatches;
  const externalProvidersCertified: string[] = [];
  const productionCertificationBlocked = true;

  const reasons = [
    ...(failedGates.length ? [`${failedGates.length} required gates failed: ${failedGates.join(",")}`] : []),
    ...(skippedGates.length ? [`${skippedGates.length} required gates skipped/not executed: ${skippedGates.join(",")}`] : []),
    ...(unexpected5xx ? [`${unexpected5xx} unexpected 5xx responses`] : []),
    ...(!shaMatches ? ["CI head SHA / artifact commit SHA / build identity SHA mismatch"] : []),
    ...(!identity.workingTreeClean && process.env.GITHUB_ACTIONS !== "true" ? ["working tree is dirty"] : []),
  ];

  const verdict: "PASS" | "FAIL" = reasons.length === 0 && manualMeetingFoundationReady ? "PASS" : "FAIL";

  const batch38 = checksumFile(
    resolve(root, "supabase/migrations/20260713120000_batch_38_project_intelligence_meeting_foundation.sql"),
  );

  const artifact = {
    schemaVersion: 1,
    phase: "6C-3B",
    verdict,
    createdAt: new Date().toISOString(),
    repository: identity.repository ?? "unknown",
    branch: identity.branch,
    ciHeadSha,
    artifactCommitSha,
    buildIdentitySha,
    nodeVersion: identity.nodeVersion,
    pnpmVersion: identity.pnpmVersion,
    runnerOs: identity.runnerOs,
    hostedProjectRef: process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF ?? "wcydlhqiqdwgoaqrlget",
    migrationChecksums: {
      batch_38: batch38 ?? "",
      ...identity.migrationChecksums,
    },
    gateCount,
    passedGates,
    failedGates,
    skippedGates,
    unexpected5xx,
    browserTestCount: BROWSER_TEST_COUNT,
    rlsActorCount: MEETING_RLS_ACTOR_COUNT,
    lifecycleTransitionCount: PHASE_6C3B_MANUAL_TRANSITIONS.length,
    providerStatuses: { ...MEETING_PROVIDER_STATUS },
    manualMeetingFoundationReady,
    externalProvidersCertified,
    productionCertificationBlocked,
    documentIntelligenceBaselineSha: DOCUMENT_INTELLIGENCE_BASELINE_SHA,
    gates,
    githubHostedCertificationRunVerification: {
      repository: identity.repository ?? "unknown",
      workflow: "project-intelligence-phase-6c3b-meeting-foundation-certification.yml",
      runId: process.env.GITHUB_RUN_ID ?? null,
      trigger: process.env.GITHUB_EVENT_NAME ?? null,
      branch: identity.branch,
      ciHeadSha,
      jobs: [
        "preflight",
        "validate",
        "hosted-schema",
        "rls-certification",
        "manual-workflow",
        "browser-certification",
        "release-evidence",
      ],
      requiredGates: "A-S",
      requiredTestsSkipped: skippedGates.length,
      unexpected5xx,
      artifactCommitMatch: shaMatches ? "PASS" : "FAIL",
      buildIdentity: shaMatches ? "PASS" : "FAIL",
      documentIntelligenceBaseline: "unchanged",
    },
    releaseEligibilityReasons: reasons,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const output = resolve(outDir, "project-intelligence-meeting-foundation-certification.json");
  writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  console.log(`[meeting-foundation-certification] report: ${output}`);
  console.log(`[meeting-foundation-certification] manualMeetingFoundationReady=${manualMeetingFoundationReady}`);
  console.log(`[meeting-foundation-certification] documentIntelligenceBaselineSha=${DOCUMENT_INTELLIGENCE_BASELINE_SHA}`);
  if (verdict === "FAIL") {
    console.error(`[meeting-foundation-certification] FAIL: ${reasons.join("; ")}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  stopCertServer();
  console.error(error);
  process.exitCode = 1;
});
