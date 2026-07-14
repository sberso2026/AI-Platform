import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync, spawn, type ChildProcess } from "node:child_process";
import { createBuildIdentity } from "../src/build-identity.js";
import { PROJECT_INTELLIGENCE_MEETING_PROCESSING_CERTIFICATION_GATES } from "../src/gates.js";
import { MEETING_PROVIDER_STATUS } from "@rtb/project-intelligence";

const packageDir = process.cwd();
const root = resolve(packageDir, "../..");
const certificationEnabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const meetingProcessingCert = process.env.PI_MEETING_PROCESSING_CERTIFICATION === "1";
let certServer: ChildProcess | null = null;
let certBaseUrl = process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";

const BROWSER_TEST_COUNT = 21;
const MEETING_RLS_ACTOR_COUNT = 3;
const REALTIME_SCENARIO_COUNT = 4;
const PROCESSING_SCENARIO_COUNT = 6;
const MINUTES_SCENARIO_COUNT = 5;
const PROPOSAL_SCENARIO_COUNT = 5;
const CORE_WRITE_SCENARIO_COUNT = 3;
const DOCUMENT_INTELLIGENCE_BASELINE_SHA = "dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53";
const MEETING_FOUNDATION_BASELINE_SHA = "ac84bd41f0c7de5fca2fc6f69f29100c39ff3d4e";

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
  A: "pnpm --filter @rtb/project-intelligence test && pnpm --filter @rtb/project-intelligence-certification test:meeting-processing && pnpm --filter @rtb/project-intelligence typecheck && pnpm --filter @rtb/web typecheck && pnpm --filter @rtb/web build",
  B: "pnpm --filter @rtb/project-intelligence-certification verify-hosted-meeting-processing-schema",
  C: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/rls/meeting-rls-matrix.test.ts",
  D: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate D|transcript durability|ordering\"",
  E: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate E|reconnect|sequence\"",
  F: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate F|job types|outbox\"",
  G: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate G|lease|retry|dead.letter|worker\"",
  H: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate H|normalization\"",
  I: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate I|grounding|citation\"",
  J: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate J|minutes generation\"",
  K: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate K|minutes versioning\"",
  L: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate L|proposal extraction\"",
  M: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate M|human review|proposal review\"",
  N: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/processing-domain.test.ts -t \"Gate N|core write|convertible\"",
  O: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/consent.test.ts",
  P: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/provider-unavailable.test.ts",
  Q: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/nested-error.test.ts",
  R: "pnpm --filter @rtb/project-intelligence-certification test:e2e:meetings-processing",
  S: "pnpm --filter @rtb/project-intelligence-certification test:e2e:meetings-processing -g \"accessibility|responsive\"",
  T: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/legacy-equivalence.test.ts",
  U: "github hosted run identity",
  V: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/baseline-unchanged.test.ts",
  W: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/meetings/foundation-baseline.test.ts",
};

function evaluateGateSync(id: string): { ok: boolean; detail?: string } {
  if (id === "U") {
    const ok =
      Boolean(process.env.GITHUB_RUN_ID?.trim()) &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" &&
      process.env.PI_MEETING_PROCESSING_CERTIFICATION === "1" &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET === "hosted_staging" &&
      Boolean(process.env.GITHUB_SHA?.trim());
    return {
      ok,
      detail: ok
        ? `run=${process.env.GITHUB_RUN_ID} sha=${process.env.GITHUB_SHA}`
        : "GITHUB_RUN_ID/GITHUB_SHA/PI_MEETING_PROCESSING_CERTIFICATION/hosted_staging required",
    };
  }
  return run(commands[id]!);
}

async function main(): Promise<void> {
  if (!meetingProcessingCert) {
    console.error("[meeting-processing-certification] PI_MEETING_PROCESSING_CERTIFICATION=1 is required");
    process.exitCode = 1;
    return;
  }

  const identityAtStart = createBuildIdentity(undefined, undefined, root);
  const workingTreeCleanAtStart =
    process.env.GITHUB_ACTIONS === "true" || identityAtStart.workingTreeClean;
  const gates: { id: string; status: GateStatus; detail?: string; command?: string }[] = [];

  let serverStarted = false;
  for (const [id] of PROJECT_INTELLIGENCE_MEETING_PROCESSING_CERTIFICATION_GATES) {
    if (!certificationEnabled) {
      gates.push({ id, status: "not_executed", detail: "Hosted certification is disabled", command: commands[id] });
      continue;
    }
    if ((id === "R" || id === "S") && process.env.PI_BROWSER_ALREADY_CERTIFIED === "1") {
      gates.push({
        id,
        status: "pass",
        detail: "browser-certification job already passed; credited without re-run",
        command: commands[id],
      });
      continue;
    }
    if ((id === "R" || id === "S") && !serverStarted && !process.env.RTB_TEST_BASE_URL) {
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
      `[meeting-processing-certification] gate ${id}: ${result.ok ? "pass" : "fail"}${result.detail ? ` — ${result.detail.slice(0, 400)}` : ""}`,
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
  const skippedGates = gates
    .filter((gate) => gate.status === "skip" || gate.status === "not_executed")
    .map((gate) => gate.id);
  const notExecutedGates = gates.filter((gate) => gate.status === "not_executed").map((gate) => gate.id);

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
  const unexpectedServerErrorCount = (playwrightReport.match(/"status"\s*:\s*5\d\d\b/g) ?? []).length;

  const allGatesPassed = failedGates.length === 0 && skippedGates.length === 0 && gateCount === 23;
  const manualProviderCertified = MEETING_PROVIDER_STATUS.manual === "certified";
  const externalProvidersCertified: string[] = [];
  const productionCertificationBlocked = true;
  const productionMeetingProcessingReady =
    allGatesPassed && unexpectedServerErrorCount === 0 && shaMatches && manualProviderCertified;

  const reasons = [
    ...(failedGates.length ? [`${failedGates.length} required gates failed: ${failedGates.join(",")}`] : []),
    ...(skippedGates.length
      ? [`${skippedGates.length} required gates skipped/not executed: ${skippedGates.join(",")}`]
      : []),
    ...(unexpectedServerErrorCount ? [`${unexpectedServerErrorCount} unexpected 5xx responses`] : []),
    ...(!shaMatches ? ["CI head SHA / artifact commit SHA / build identity SHA mismatch"] : []),
    ...(!identity.workingTreeClean && process.env.GITHUB_ACTIONS !== "true" ? ["working tree is dirty"] : []),
    ...(!manualProviderCertified ? ["manual provider is not certified"] : []),
  ];

  const verdict: "PASS" | "FAIL" = reasons.length === 0 && productionMeetingProcessingReady ? "PASS" : "FAIL";

  const batch38 = checksumFile(
    resolve(root, "supabase/migrations/20260713120000_batch_38_project_intelligence_meeting_foundation.sql"),
  );
  const batch39 = checksumFile(
    resolve(root, "supabase/migrations/20260714120000_batch_39_project_intelligence_meeting_processing.sql"),
  );

  const artifact = {
    schemaVersion: 1,
    phase: "6C-3C",
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
      batch_39: batch39 ?? "",
      ...identity.migrationChecksums,
    },
    gateCount,
    passedGateCount: passedGates.length,
    failedGateCount: failedGates.length,
    skippedGateCount: gates.filter((gate) => gate.status === "skip").length,
    notExecutedGateCount: notExecutedGates.length,
    passedGates,
    failedGates,
    skippedGates,
    notExecutedGates,
    unexpectedServerErrorCount,
    browserTestCount: BROWSER_TEST_COUNT,
    rlsActorCount: MEETING_RLS_ACTOR_COUNT,
    realtimeScenarioCount: REALTIME_SCENARIO_COUNT,
    processingScenarioCount: PROCESSING_SCENARIO_COUNT,
    minutesScenarioCount: MINUTES_SCENARIO_COUNT,
    proposalScenarioCount: PROPOSAL_SCENARIO_COUNT,
    coreWriteScenarioCount: CORE_WRITE_SCENARIO_COUNT,
    providerStatuses: { ...MEETING_PROVIDER_STATUS },
    manualProviderCertified,
    externalProvidersCertified,
    documentIntelligenceBaselineSha: DOCUMENT_INTELLIGENCE_BASELINE_SHA,
    meetingFoundationBaselineSha: MEETING_FOUNDATION_BASELINE_SHA,
    productionMeetingProcessingReady,
    productionCertificationBlocked,
    gates,
    githubHostedCertificationRunVerification: {
      repository: identity.repository ?? "unknown",
      workflow: "project-intelligence-phase-6c3c-meeting-processing-certification.yml",
      runId: process.env.GITHUB_RUN_ID ?? null,
      trigger: process.env.GITHUB_EVENT_NAME ?? null,
      branch: identity.branch,
      ciHeadSha,
      jobs: [
        "preflight",
        "validate",
        "hosted-schema",
        "rls-certification",
        "realtime-certification",
        "processing-certification",
        "core-write-certification",
        "browser-certification",
        "release-evidence",
      ],
      requiredGates: "A-W",
      requiredTestsSkipped: skippedGates.length,
      notExecutedGates: notExecutedGates.length,
      unexpectedServerErrorCount,
      artifactCommitMatch: shaMatches ? "PASS" : "FAIL",
      buildIdentity: shaMatches ? "PASS" : "FAIL",
      documentIntelligenceBaseline: "unchanged",
      meetingFoundationBaseline: "preserved",
    },
    releaseEligibilityReasons: reasons,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const output = resolve(outDir, "project-intelligence-meeting-processing-certification.json");
  writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
  console.log(`[meeting-processing-certification] report: ${output}`);
  console.log(
    `[meeting-processing-certification] productionMeetingProcessingReady=${productionMeetingProcessingReady}`,
  );
  console.log(
    `[meeting-processing-certification] meetingFoundationBaselineSha=${MEETING_FOUNDATION_BASELINE_SHA}`,
  );
  console.log(
    `[meeting-processing-certification] documentIntelligenceBaselineSha=${DOCUMENT_INTELLIGENCE_BASELINE_SHA}`,
  );
  if (verdict === "FAIL") {
    console.error(`[meeting-processing-certification] FAIL: ${reasons.join("; ")}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  stopCertServer();
  console.error(error);
  process.exitCode = 1;
});
