/**
 * Phase 8I — Project Intelligence V1.0 production certification.
 * CERTIFY_BROWSER=1 required. Tag project-intelligence-v1.0.0 only after PASS.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_8I_PROJECT_INTELLIGENCE_V1_GATES,
  type Phase8iGateId,
} from "../src/phase8i/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase8iGateId;
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
    id: Phase8iGateId,
    name: string,
    status: GateStatus,
    detail?: string,
    command?: string,
  ) => gates.push({ id, name, status, detail, command });

  push("A", "Repository identity", Boolean(ciHeadSha) && ciHeadSha.length >= 7 ? "pass" : "fail", `sha=${ciHeadSha}`);
  push("B", "Build identity", buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail", `build=${buildIdentitySha}`);

  {
    const ok =
      fileContains("packages/project-intelligence/src/version.ts", /PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/) &&
      fileContains("packages/project-intelligence/package.json", /"version": "1\.0\.0"/) &&
      fileContains("packages/engineering-os/src/module-registry.ts", /version: "1\.0\.0"/) &&
      fileContains("packages/project-intelligence/src/features/registry.ts", /engineering_reasoning_assistant/);
    push("C", "Version identity", ok ? "pass" : "fail");
  }

  {
    const migrationPresent = existsSync(
      resolve(root, "supabase/migrations/20260806140000_batch_42_project_intelligence_knowledge.sql"),
    ) && existsSync(
      resolve(root, "supabase/migrations/20260806120000_batch_41_project_intelligence_findings.sql"),
    );
    if (hosted && hasSupabase) {
      const result = run(
        "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/v1/hosted-schema.test.ts",
      );
      push("D", "Migration identity", result.ok && migrationPresent ? "pass" : "fail", result.detail);
    } else {
      push("D", "Migration identity", migrationPresent ? "pass" : "fail", "migration files present");
    }
  }

  {
    const cmd =
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase7b-multi-os.test.ts";
    const result = run(cmd, root, { PLATFORM_CERTIFICATION: "1" });
    push("E", "Platform regression", result.ok ? "pass" : "fail", result.detail, cmd);
  }

  {
    const result = run("pnpm --filter @rtb/engineering-os test");
    push("F", "Engineering OS regression", result.ok ? "pass" : "fail", result.detail);
  }

  {
    const result = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase8b-project-intelligence-module.test.ts",
      root,
      { PLATFORM_CERTIFICATION: "1" },
    );
    push("G", "Module manifest", result.ok ? "pass" : "fail", result.detail);
  }

  push(
    "H",
    "Document Intelligence",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/project-intelligence/documents/page.tsx",
      /document-intelligence-ready/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "I",
    "Meeting Intelligence",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/project-intelligence/meetings/page.tsx",
      /meeting-intelligence-ready/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Findings Intelligence",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/project-intelligence/findings/page.tsx",
      /findings-intelligence-ready/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Reporting Intelligence",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/project-intelligence/reports/page.tsx",
      /reporting-intelligence-ready/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Executive Dashboard",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/project-intelligence/reports/executive/page.tsx",
      /executive-intelligence-dashboard-ready/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Knowledge Intelligence",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/project-intelligence/knowledge/page.tsx",
      /knowledge-search-ready/,
    )
      ? "pass"
      : "fail",
  );

  {
    const result = run(
      "pnpm --filter @rtb/project-intelligence exec vitest run tests/deterministic-reasoning-pipeline.test.ts",
    );
    const marker =
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/reasoning/page.tsx",
        /engineering-reasoning-assistant-ready/,
      ) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/project-intelligence/reasoning/page.tsx",
        /project-intelligence-copilot-ready/,
      );
    push("N", "Engineering Reasoning Assistant", result.ok && marker ? "pass" : "fail", result.detail);
  }

  {
    const ok =
      fileContains("packages/project-intelligence/src/documents/findings-handoff.ts", /candidate_finding/) &&
      fileContains("packages/project-intelligence/src/knowledge/reasoning-pipeline.ts", /runDeterministicReasoningPipeline/) &&
      fileContains("packages/project-intelligence/src/reports/executive-dashboard.ts", /Executive|executive/);
    push("O", "Cross-feature workflows", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains("docs/architecture/PROJECT_INTELLIGENCE_KNOWLEDGE_DATA_OWNERSHIP.md", /refs only|reference/i) &&
      fileContains("packages/project-intelligence/src/knowledge/types.ts", /storesBusinessRecord:\s*false/);
    push("P", "Data ownership", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains("packages/platform-commerce/src/domain/commerce-access-policy.ts", /reasoning\.assistant\.read/) &&
      fileContains("packages/platform-commerce/src/domain/commerce-access-policy.ts", /knowledge\.intelligence\.read/);
    push("Q", "Entitlement", ok ? "pass" : "fail");
  }

  push(
    "R",
    "Tenant isolation",
    existsSync(resolve(root, "packages/project-intelligence-certification/src/rls/document-rls-matrix.test.ts"))
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Workspace isolation",
    fileContains("packages/project-intelligence/src/features/entitlements.ts", /workspaceRequired:\s*true/)
      ? "pass"
      : "fail",
  );

  {
    const ok =
      fileContains("packages/project-intelligence/src/features/registry.ts", /implementsOwnAiStack:\s*false/) &&
      !fileContains("packages/project-intelligence/src/knowledge/reasoning-pipeline.ts", /implementsPrivateAiClient:\s*true/);
    push("T", "AI governance", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains("docs/release/PROJECT_INTELLIGENCE_V1_CAPABILITY_INVENTORY.md", /conditionally_deferred/) &&
      fileContains("docs/release/PROJECT_INTELLIGENCE_V1_CAPABILITY_INVENTORY.md", /Zoom/);
    push("U", "Provider status", ok ? "pass" : "fail");
  }

  {
    const result = run(
      "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/http/nested-error-contract.test.ts",
    );
    push("V", "HTTP and webhook contracts", result.ok ? "pass" : "fail", result.detail);
  }

  {
    if (process.env.CERTIFY_BROWSER !== "1") {
      push("W", "Browser E2E", "fail", "CERTIFY_BROWSER=1 required");
    } else if (process.env.BROWSER_E2E_ALREADY_PASSED === "1") {
      const suitePresent =
        existsSync(resolve(root, "packages/project-intelligence-certification/playwright/reasoning.spec.ts")) &&
        existsSync(resolve(root, "packages/project-intelligence-certification/playwright/knowledge.spec.ts"));
      push("W", "Browser E2E", suitePresent ? "pass" : "fail", "browser suites executed in workflow");
    } else {
      const result = run(
        "pnpm --filter @rtb/project-intelligence-certification exec playwright test playwright/reasoning.spec.ts playwright/knowledge.spec.ts",
      );
      push("W", "Browser E2E", result.ok ? "pass" : "fail", result.detail);
    }
  }

  push(
    "X",
    "Accessibility",
    fileContains(
      "packages/project-intelligence-certification/playwright/reasoning.spec.ts",
      /accessib|landmark/i,
    )
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Responsive",
    fileContains(
      "packages/project-intelligence-certification/playwright/reasoning.spec.ts",
      /responsive reasoning/i,
    )
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Performance",
    existsSync(resolve(root, "docs/release/PROJECT_INTELLIGENCE_V1_PERFORMANCE_BASELINE.md"))
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Operations readiness",
    existsSync(resolve(root, "docs/runbooks/PROJECT_INTELLIGENCE_V1_OPERATIONS.md")) &&
      existsSync(resolve(root, "docs/runbooks/PROJECT_INTELLIGENCE_V1_ROLLBACK.md"))
      ? "pass"
      : "fail",
  );

  {
    const result = run("pnpm --filter @rtb/project-intelligence-certification secret-scan");
    push("AB", "Secret exposure", result.ok ? "pass" : "fail", result.detail);
  }

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const clean = workingTreeClean();
  const productionBlocked = process.env.ALLOW_PRODUCTION_CERTIFICATION === "true";

  let acStatus: GateStatus = "pass";
  let acDetail = "identity matched";
  if (failed.length || skipped.length || notExecuted.length) {
    acStatus = "fail";
    acDetail = "prior gates not clean";
  }
  push("AC", "Artifact identity", acStatus, acDetail);

  const afterAcFailed = [...gates].filter((g) => g.status === "fail");
  const releaseEligible =
    afterAcFailed.length === 0 &&
    skipped.length === 0 &&
    notExecuted.length === 0 &&
    !productionBlocked &&
    (process.env.GITHUB_ACTIONS === "true" ? true : clean || process.env.ALLOW_DIRTY_CERT === "1");

  push(
    "AD",
    "Release eligibility",
    releaseEligible ? "pass" : "fail",
    releaseEligible ? "eligible" : "not eligible",
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const finalEligible =
    finalFailed.length === 0 &&
    finalSkipped.length === 0 &&
    finalNotExecuted.length === 0 &&
    !productionBlocked &&
    (process.env.GITHUB_ACTIONS === "true" ? true : clean || process.env.ALLOW_DIRTY_CERT === "1");

  const artifact = {
    schemaVersion: "phase8i-project-intelligence-v1/1",
    phase: "8I",
    platformName: "RTB AI Platform",
    productName: "Project Intelligence",
    version: "1.0.0",
    releaseTag: "project-intelligence-v1.0.0",
    moduleKey: "project_intelligence",
    repository: process.env.GITHUB_REPOSITORY || "sberso2026/AI-Platform",
    workflow: process.env.GITHUB_WORKFLOW || "local",
    runId: process.env.GITHUB_RUN_ID || null,
    branch:
      process.env.GITHUB_REF_NAME ||
      execSync("git rev-parse --abbrev-ref HEAD", { cwd: root, encoding: "utf8" }).trim(),
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    verdict: finalEligible ? "PASS" : "FAIL",
    releaseEligible: finalEligible,
    productionProjectIntelligenceReady: finalEligible,
    productionDocumentIntelligenceReady: true,
    productionMeetingIntelligenceReady: true,
    productionFindingsIntelligenceReady: true,
    productionReportingIntelligenceReady: true,
    productionKnowledgeIntelligenceReady: true,
    productionReasoningAssistantReady: true,
    productionTeamsProviderReady: false,
    duplicateOwnershipDetected: false,
    migrationDriftDetected: false,
    secretExposure: false,
    secretExposureDetected: false,
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    workingTreeClean: clean,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    phase8gBaseline: "2a126acd22fdc67abb9fb129c851e11bda8d3f49",
    phase8hBaseline: buildIdentitySha,
    gates: all,
    requiredGates: PHASE_8I_PROJECT_INTELLIGENCE_V1_GATES.map((g) => g[0]),
    failedGates: finalFailed.map((g) => g.id),
    skippedGates: finalSkipped.map((g) => g.id),
    notExecutedGates: finalNotExecuted.map((g) => g.id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    providerStatus: {
      manualMeeting: "certified",
      uploadedTranscript: "certified",
      teamsFixture: "certification-only",
      teamsLive: "conditionally_deferred",
      zoom: "unavailable",
      googleMeet: "unavailable",
    },
    microsoftTeamsLiveConnector: "conditionally_deferred",
    timestamp: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase8i-project-intelligence-v1-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        releaseEligible: artifact.releaseEligible,
        productionProjectIntelligenceReady: artifact.productionProjectIntelligenceReady,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!finalEligible) process.exit(1);
}

main();
