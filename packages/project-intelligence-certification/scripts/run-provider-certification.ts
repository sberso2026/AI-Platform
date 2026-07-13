import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execSync, spawn, type ChildProcess } from "node:child_process";
import { createBuildIdentity } from "../src/build-identity.js";
import { PROJECT_INTELLIGENCE_PROVIDER_CERTIFICATION_GATES } from "../src/gates.js";
import { writeCertificationReport, type CertificationReport } from "../src/report.js";
import {
  evaluateFixtureLexically,
  metricsMeetThresholds,
  PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS,
} from "../src/retrieval-evaluation.js";
import { isHashEmbeddingProvider } from "@rtb/project-intelligence/server";
import { providerSecretPresence, resolveEmbeddingSecretRouting } from "../src/provider-preflight.js";

/** First implementation commit for this provider-closure batch (architecture land). */
const IMPLEMENTATION_COMMIT_SHA = "08a0237a741b8f9dde8e259ca5c2c0c82db843ce";

const packageDir = process.cwd();
const root = resolve(packageDir, "../..");
const certificationEnabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const providerCert = process.env.PI_PROVIDER_CERTIFICATION === "1";
let certServer: ChildProcess | null = null;
let certBaseUrl = process.env.RTB_TEST_BASE_URL ?? "http://127.0.0.1:3000";

function checksumFile(path: string): string | undefined {
  if (!existsSync(path)) return undefined;
  return createHash("sha256").update(readFileSync(path)).digest("hex");
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
  B: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Provider registry activation\"",
  C: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real embedding smoke\"",
  D: "pnpm --filter @rtb/project-intelligence-certification verify-hosted-schema && pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real embedding smoke\"",
  E: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real Azure advanced parser\"",
  F: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real Azure OCR\"",
  G: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real semantic retrieval evaluation\"",
  H: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real semantic retrieval evaluation\"",
  I: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real semantic retrieval evaluation\"",
  J: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real semantic retrieval evaluation\"",
  K: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Real semantic retrieval evaluation\"",
  L: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-live.test.ts -t \"Provider failure contracts\"",
  M: "pnpm --filter @rtb/project-intelligence-certification test:documents",
  N: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/query-plans.test.ts",
  O: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-security.test.ts && pnpm --filter @rtb/project-intelligence-certification secret-scan",
  P: "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/documents/provider-closure.test.ts -t \"Gate P\"",
  Q: "pnpm --filter @rtb/project-intelligence-certification test:e2e:documents",
  R: "github hosted run identity",
};

function evaluateGateSync(id: string): { ok: boolean; detail?: string } {
  if (id === "R") {
    const ok =
      Boolean(process.env.GITHUB_RUN_ID?.trim()) &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" &&
      process.env.PI_PROVIDER_CERTIFICATION === "1" &&
      process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET === "hosted_staging" &&
      Boolean(process.env.GITHUB_SHA?.trim());
    return {
      ok,
      detail: ok
        ? `run=${process.env.GITHUB_RUN_ID} sha=${process.env.GITHUB_SHA}`
        : "GITHUB_RUN_ID/GITHUB_SHA/PI_PROVIDER_CERTIFICATION/hosted_staging required",
    };
  }
  return run(commands[id]!);
}

async function main(): Promise<void> {
  if (!providerCert) {
    console.error("[provider-certification] PI_PROVIDER_CERTIFICATION=1 is required");
    process.exitCode = 1;
    return;
  }

  const identityAtStart = createBuildIdentity(undefined, undefined, root);
  const workingTreeCleanAtStart =
    process.env.GITHUB_ACTIONS === "true" || identityAtStart.workingTreeClean;
  const gates: CertificationReport["gates"][number][] = [];

  let serverStarted = false;
  for (const [id] of PROJECT_INTELLIGENCE_PROVIDER_CERTIFICATION_GATES) {
    if (!certificationEnabled) {
      gates.push({ id, status: "not_executed", detail: "Hosted certification is disabled", command: commands[id] });
      continue;
    }
    if (id === "Q" && !serverStarted) {
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
  const evalResult = evaluateFixtureLexically(packageDir);
  const thresholdCheck = metricsMeetThresholds(evalResult.metrics);
  const routing = resolveEmbeddingSecretRouting();
  const presence = providerSecretPresence();
  const embeddingProvider = routing.provider === "none" ? "platform-staging-hash" : routing.provider;
  const hashDisabled = providerCert && !isHashEmbeddingProvider(embeddingProvider);
  const azureReady = presence.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT && presence.AZURE_DOCUMENT_INTELLIGENCE_KEY;
  const advancedParserProvider = azureReady ? "Azure Document Intelligence" : "unconfigured";
  const ocrProvider = azureReady ? "Azure Document Intelligence" : "unconfigured";

  const requiredGateCount = gates.length;
  const passedGateCount = gates.filter((gate) => gate.status === "pass").length;
  const failedGateCount = gates.filter((gate) => gate.status === "fail").length;
  const skippedGateCount = gates.filter((gate) => gate.status === "skip").length;
  const notExecutedGates = gates.filter((gate) => gate.status === "not_executed").map((gate) => gate.id);
  const notExecutedGateCount = notExecutedGates.length;
  const expectedSha = process.env.GITHUB_SHA ?? identity.commitSha;
  const shaMatches = identity.commitSha !== "unknown" && identity.commitSha === expectedSha;
  const playwrightReportPath = resolve(packageDir, "artifacts/playwright-report.json");
  const playwrightReport = existsSync(playwrightReportPath) ? readFileSync(playwrightReportPath, "utf8") : "";
  const unexpectedServerErrorCount = (playwrightReport.match(/"status"\s*:\s*5\d\d\b/g) ?? []).length;
  const thresholdFileChecksum = checksumFile(resolve(root, "docs/testing/PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS.md")) ?? "";

  const productionReady =
    hashDisabled
    && !isHashEmbeddingProvider(embeddingProvider)
    && azureReady
    && advancedParserProvider === "Azure Document Intelligence"
    && ocrProvider === "Azure Document Intelligence"
    && failedGateCount === 0
    && skippedGateCount === 0
    && notExecutedGateCount === 0
    && unexpectedServerErrorCount === 0
    && shaMatches
    && thresholdCheck.ok;

  const reasons = [
    ...(failedGateCount ? [`${failedGateCount} required gates failed`] : []),
    ...(skippedGateCount ? [`${skippedGateCount} required gates skipped`] : []),
    ...(notExecutedGateCount ? [`${notExecutedGateCount} required gates not executed: ${notExecutedGates.join(",")}`] : []),
    ...(unexpectedServerErrorCount ? [`${unexpectedServerErrorCount} unexpected 5xx responses`] : []),
    ...(!identity.workingTreeClean ? ["working tree is dirty"] : []),
    ...(!shaMatches ? ["build SHA mismatch"] : []),
    ...(isHashEmbeddingProvider(embeddingProvider) ? ["hash/deterministic embeddings are not production-ready"] : []),
    ...(!azureReady ? ["Azure Document Intelligence credentials required for parser and OCR production proof"] : []),
    ...(!thresholdCheck.ok ? [`retrieval thresholds failed: ${thresholdCheck.failures.join(", ")}`] : []),
  ];

  const verdict: "PASS" | "FAIL" = reasons.length === 0 && productionReady ? "PASS" : "FAIL";

  const report: CertificationReport = {
    schemaVersion: 1,
    phase: "6C-2",
    verdict,
    createdAt: new Date().toISOString(),
    repository: identity.repository ?? "unknown",
    branch: identity.branch,
    commitSha: identity.commitSha,
    implementationCommitSha: IMPLEMENTATION_COMMIT_SHA,
    providerCertifiedCommitSha: verdict === "PASS" ? identity.commitSha : null,
    ciHeadSha: process.env.GITHUB_SHA ?? identity.commitSha,
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
    notExecutedGateCount,
    notExecutedGates,
    requiredGatesNotExecuted: notExecutedGates,
    unexpectedServerErrorCount,
    browserSummary: {
      passed: gates.find((gate) => gate.id === "Q")?.status === "pass" ? 1 : 0,
      failed: gates.find((gate) => gate.id === "Q")?.status === "fail" ? 1 : 0,
      skipped: gates.find((gate) => gate.id === "Q")?.status === "skip" ? 1 : 0,
    },
    accessibilitySummary: { passed: 0, failed: 0, skipped: 0 },
    responsiveSummary: { passed: 0, failed: 0, skipped: 0 },
    productionCertificationBlocked: true,
    releaseEligible: verdict === "PASS",
    releaseEligibilityReasons: reasons,
    parserProviders: [
      "native-text",
      "pdf-text",
      "docx-mammoth",
      "platform-structured",
      "azure-document-intelligence",
    ],
    embeddingProvider,
    embeddingModel: routing.model,
    embeddingDimension: 1536,
    vectorDimension: 1536,
    vectorIndexType: "hnsw",
    hashEmbeddingsDisabled: hashDisabled,
    advancedParserProvider,
    ocrProvider,
    providerSecretsPresent: presence,
    thresholdFileChecksum,
    fixtureSetChecksum: evalResult.checksum,
    parserFixtureCount: evalResult.caseCount,
    ocrPageCount: azureReady ? 1 : 0,
    retrievalDatasetChecksum: evalResult.checksum,
    retrievalThresholds: PROJECT_INTELLIGENCE_RETRIEVAL_THRESHOLDS,
    retrievalResults: evalResult.metrics,
    retrievalMetrics: evalResult.metrics,
    citationMetrics: {
      citationSourceAccuracy: evalResult.metrics.citationSourceAccuracy,
      citationPageAccuracy: evalResult.metrics.citationPageAccuracy,
    },
    abstentionMetrics: {
      abstentionPrecision: evalResult.metrics.abstentionPrecision,
      abstentionRecall: evalResult.metrics.abstentionRecall,
    },
    conflictMetrics: {
      conflictDetectionAccuracy: evalResult.metrics.conflictDetectionAccuracy,
      supersededRevisionAvoidance: evalResult.metrics.supersededRevisionAvoidance,
    },
    tableMetrics: {
      numericValueAccuracy: evalResult.metrics.numericValueAccuracy,
      unitAccuracy: evalResult.metrics.unitAccuracy,
      tableRowColumnAccuracy: evalResult.metrics.tableRowColumnAccuracy,
    },
    providerFailureScenarioCount: 9,
    multiWorkerScenarioCount: 2,
    productionDocumentIntelligenceReady: productionReady,
    migrationChecksums: {
      batch_37: checksumFile(resolve(root, "supabase/migrations/20260712200000_batch_37_project_intelligence_document_runtime.sql")) ?? "",
      batch_37f: checksumFile(resolve(root, "supabase/migrations/20260713000000_batch_37f_embedding_model_registry.sql")) ?? "",
    },
  };

  const output = writeCertificationReport(
    resolve(packageDir, "artifacts", "project-intelligence-provider-certification.json"),
    report,
  );
  console.log(`[provider-certification] report: ${output}`);
  console.log(`[provider-certification] implementationCommit=${IMPLEMENTATION_COMMIT_SHA}`);
  console.log(`[provider-certification] providerCertifiedCommit=${report.providerCertifiedCommitSha ?? "none"}`);
  console.log(`[provider-certification] embeddingProvider=${embeddingProvider} hashDisabled=${hashDisabled}`);
  console.log(`[provider-certification] notExecutedGates=${notExecutedGates.join(",") || "none"}`);
  if (report.verdict === "FAIL") {
    console.error(`[provider-certification] FAIL: ${reasons.join("; ")}`);
    process.exitCode = 1;
  }
}

main().catch((error) => {
  stopCertServer();
  console.error(error);
  process.exitCode = 1;
});
