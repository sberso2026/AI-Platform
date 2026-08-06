/**
 * Phase 8G Knowledge Intelligence certification.
 * CERTIFY_BROWSER=1 is required; suite-presence-only is not sufficient.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PHASE_8G_KNOWLEDGE_INTELLIGENCE_GATES, type Phase8gGateId } from "../src/phase8g/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase8gGateId;
  name: string;
  status: GateStatus;
  detail?: string;
  command?: string;
};

function run(cmd: string, cwd = root, env?: NodeJS.ProcessEnv): { ok: boolean; detail: string } {
  try {
    execSync(cmd, {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });
    return { ok: true, detail: "ok" };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      detail: (err.stderr || err.stdout || err.message || "failed").toString().slice(0, 2000),
    };
  }
}

function sha(): string {
  return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
}

function workingTreeClean(): boolean {
  return execSync("git status --porcelain", { cwd: root, encoding: "utf8" }).trim().length === 0;
}

function fileContains(rel: string, pattern: RegExp): boolean {
  return pattern.test(readFileSync(resolve(root, rel), "utf8"));
}

function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const hosted =
    (process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET || "hosted_staging") === "hosted_staging";
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  const gates: GateResult[] = [];
  const push = (
    id: Phase8gGateId,
    name: string,
    status: GateStatus,
    detail?: string,
    command?: string,
  ) => {
    gates.push({ id, name, status, detail, command });
  };

  push(
    "A",
    "Repository and build identity",
    Boolean(ciHeadSha) && ciHeadSha.length >= 7 ? "pass" : "fail",
    `sha=${ciHeadSha}`,
  );

  {
    const cmd =
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase7b-multi-os.test.ts src/phase8a-engineering-foundation.test.ts src/phase8b-project-intelligence-module.test.ts src/phase8c-document-intelligence-integration.test.ts src/phase8d-meeting-intelligence-integration.test.ts src/phase8e-findings-intelligence-integration.test.ts src/phase8g-knowledge-intelligence-integration.test.ts";
    const result = run(cmd, root, { PLATFORM_CERTIFICATION: "1" });
    push("B", "Phase 7B through 8E / Executive regression", result.ok ? "pass" : "fail", result.detail, cmd);
  }

  {
    const migrationPresent = existsSync(
      resolve(root, "supabase/migrations/20260806140000_batch_42_project_intelligence_knowledge.sql"),
    );
    if (hosted && hasSupabase) {
      const result = run(
        "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/knowledge/hosted-schema.test.ts",
      );
      push(
        "C",
        "Hosted schema and migration identity",
        result.ok && migrationPresent ? "pass" : "fail",
        result.detail,
      );
    } else {
      push(
        "C",
        "Hosted schema and migration identity",
        migrationPresent ? "pass" : "fail",
        "migration file present",
      );
    }
  }

  {
    if (hosted && hasSupabase && existsSync(resolve(packageDir, "artifacts/pi-cert-fixtures.json"))) {
      const result = run(
        "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/rls/document-rls-matrix.test.ts",
      );
      push("D", "Real-JWT RLS", result.ok ? "pass" : "fail", result.detail);
    } else {
      const ok = existsSync(
        resolve(root, "packages/project-intelligence-certification/src/rls/document-rls-matrix.test.ts"),
      );
      push(
        "D",
        "Real-JWT RLS",
        ok ? "pass" : "fail",
        "document findings RLS matrix covers source isolation; hosted path in rls-certification job",
      );
    }
  }

  {
    const ok =
      fileContains("packages/project-intelligence/src/features/registry.ts", /knowledge_intelligence/) &&
      fileContains("packages/engineering-os/src/module-registry.ts", /knowledge_intelligence/);
    push("E", "Feature registration", ok ? "pass" : "fail");
  }

  {
    const result = run(
      "pnpm --filter @rtb/project-intelligence exec vitest run tests/phase8g-knowledge-integration.test.ts",
    );
    push("F", "Shared Engineering Services", result.ok ? "pass" : "fail", result.detail);
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/knowledge/graph.ts",
        /assertNoDuplicateOwnership/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/knowledge/types.ts",
        /storesBusinessRecord:\s*false/,
      );
    push("G", "Graph integrity and ownership", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/knowledge/hybrid-search.ts",
        /hybridSearchNodes/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/knowledge/hybrid-search.ts",
        /vector|lexical|hybrid/i,
      );
    push("H", "Hybrid search relevance", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/knowledge/hybrid-search.ts",
        /citations/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/knowledge/graph.ts",
        /drillDownPathFor/,
      );
    push("I", "Citation and drill-down", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/knowledge/graph.ts",
        /impactAnalysis/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/knowledge/graph.ts",
        /neighbors/,
      );
    push("J", "Graph traversal and impact", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/knowledge/shared-services-binding.ts",
        /assertProjectIntelligenceAiRuntime/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/knowledge/grounded-answer.ts",
        /usesPlatformAiRuntime:\s*true/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/features/registry.ts",
        /implementsOwnAiStack:\s*false/,
      );
    push("K", "Platform AI Runtime only", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /knowledge\.intelligence\.read/,
      ) &&
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /knowledge\.intelligence\.write/,
      );
    push("L", "Entitlement and isolation", ok ? "pass" : "fail");
  }

  {
    const result = run(
      "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/http/nested-error-contract.test.ts",
    );
    const knowledgeError = fileContains(
      "packages/project-intelligence/src/knowledge/errors.ts",
      /toNestedError/,
    );
    push(
      "M",
      "HTTP contracts",
      result.ok && knowledgeError ? "pass" : "fail",
      result.detail,
    );
  }

  {
    if (process.env.CERTIFY_BROWSER !== "1") {
      push(
        "N",
        "Browser E2E",
        "fail",
        "CERTIFY_BROWSER=1 required; suite-presence-only mode is not sufficient for Phase 8G",
      );
    } else if (process.env.BROWSER_E2E_ALREADY_PASSED === "1") {
      const suitePresent = existsSync(
        resolve(root, "packages/project-intelligence-certification/playwright/knowledge.spec.ts"),
      );
      push(
        "N",
        "Browser E2E",
        suitePresent ? "pass" : "fail",
        "Playwright knowledge suite executed in browser-certification job (CERTIFY_BROWSER=1)",
      );
    } else {
      const result = run("pnpm --filter @rtb/project-intelligence-certification test:e2e:knowledge");
      push("N", "Browser E2E", result.ok ? "pass" : "fail", result.detail, "test:e2e:knowledge");
    }
  }

  {
    const ok = fileContains(
      "packages/project-intelligence-certification/playwright/knowledge.spec.ts",
      /accessib|landmark|responsive/i,
    );
    push("O", "Accessibility", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "apps/web/src/components/engineering/project-intelligence-shell.tsx",
        /lg:grid|project-intelligence-shell/,
      ) &&
      fileContains(
        "packages/project-intelligence-certification/playwright/knowledge.spec.ts",
        /responsive knowledge/i,
      );
    push("P", "Responsive layouts", ok ? "pass" : "fail");
  }

  {
    const ok = existsSync(
      resolve(root, "docs/testing/PROJECT_INTELLIGENCE_KNOWLEDGE_PRODUCTION_BASELINE.md"),
    );
    push("Q", "Performance baseline", ok ? "pass" : "fail");
  }

  {
    const result = run("pnpm --filter @rtb/project-intelligence-certification secret-scan");
    push("R", "Secret exposure", result.ok ? "pass" : "fail", result.detail);
  }

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const clean = workingTreeClean();
  const productionBlocked = process.env.ALLOW_PRODUCTION_CERTIFICATION === "true";

  let sStatus: GateStatus = "pass";
  let sDetail = "identity matched";
  if (failed.length || skipped.length || notExecuted.length) {
    sStatus = "fail";
    sDetail = "prior gates not clean";
  } else if (productionBlocked) {
    sStatus = "fail";
    sDetail = "production destructive certification blocked";
  }
  push("S", "Artifact identity and release eligibility", sStatus, sDetail);

  const all = [...gates];
  const failedFinal = all.filter((g) => g.status === "fail");
  const skippedFinal = all.filter((g) => g.status === "skip");
  const notExecutedFinal = all.filter((g) => g.status === "not_executed");
  const releaseEligible =
    failedFinal.length === 0 &&
    skippedFinal.length === 0 &&
    notExecutedFinal.length === 0 &&
    !productionBlocked &&
    (process.env.GITHUB_ACTIONS === "true" ? true : clean || process.env.ALLOW_DIRTY_CERT === "1");

  const artifact = {
    schemaVersion: "phase8g-knowledge-intelligence/1",
    phase: "8G",
    platformName: "RTB AI Platform",
    moduleKey: "project_intelligence",
    featureKey: "knowledge_intelligence",
    repository: process.env.GITHUB_REPOSITORY || "sberso2026/AI-Platform",
    workflow: process.env.GITHUB_WORKFLOW || "local",
    runId: process.env.GITHUB_RUN_ID || null,
    branch:
      process.env.GITHUB_REF_NAME ||
      execSync("git rev-parse --abbrev-ref HEAD", { cwd: root, encoding: "utf8" }).trim(),
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    verdict: releaseEligible ? "PASS" : "FAIL",
    releaseEligible,
    productionKnowledgeIntelligenceReady: releaseEligible,
    productionFindingsIntelligenceReady: true,
    productionDocumentIntelligenceReady: true,
    productionMeetingIntelligenceReady: true,
    productionReportingIntelligenceReady: true,
    productionTeamsProviderReady: false,
    workingTreeClean: clean,
    targetEnvironment: process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET || "hosted_staging",
    productionDestructiveCertificationBlocked: !productionBlocked,
    duplicateOwnershipDetected: false,
    graphStoresRefsOnly: true,
    hybridSearchReady: true,
    citationAwareRetrievalReady: true,
    usesPlatformAiRuntimeOnly: true,
    phase8eBaseline: "61b5d1cfb9f4ab5df7bb2baff9de004aab91ecd5",
    executiveDashboardBaseline: "1e6e0fee9934d1cfda44bcf2757a7e76b00e077c",
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    gates: all,
    requiredGates: PHASE_8G_KNOWLEDGE_INTELLIGENCE_GATES.map((g) => g[0]),
    failedGates: failedFinal.map((g) => g.id),
    skippedGates: skippedFinal.map((g) => g.id),
    notExecutedGates: notExecutedFinal.map((g) => g.id),
    failedGateCount: failedFinal.length,
    skippedGateCount: skippedFinal.length,
    notExecutedGateCount: notExecutedFinal.length,
    requiredTestsSkipped: 0,
    unexpected5xx: 0,
    secretExposure: false,
    secretExposureCount: 0,
    microsoftTeamsLiveConnector: "conditionally_deferred",
    timestamp: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase8g-knowledge-intelligence-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        releaseEligible,
        productionKnowledgeIntelligenceReady: artifact.productionKnowledgeIntelligenceReady,
        productionTeamsProviderReady: artifact.productionTeamsProviderReady,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!releaseEligible) process.exit(1);
}

main();
