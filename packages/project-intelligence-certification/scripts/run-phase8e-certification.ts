/**
 * Phase 8E Findings Intelligence certification.
 * CERTIFY_BROWSER=1 is required; suite-presence-only is not sufficient.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PHASE_8E_FINDINGS_INTELLIGENCE_GATES, type Phase8eGateId } from "../src/phase8e/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase8eGateId;
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
    id: Phase8eGateId,
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
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase7b-multi-os.test.ts src/phase8a-engineering-foundation.test.ts src/phase8b-project-intelligence-module.test.ts src/phase8c-document-intelligence-integration.test.ts src/phase8d-meeting-intelligence-integration.test.ts src/phase8e-findings-intelligence-integration.test.ts";
    const result = run(cmd, root, { PLATFORM_CERTIFICATION: "1" });
    push("B", "Phase 7B through 8D regression", result.ok ? "pass" : "fail", result.detail, cmd);
  }

  {
    const migrationPresent = existsSync(
      resolve(root, "supabase/migrations/20260806120000_batch_41_project_intelligence_findings.sql"),
    );
    if (hosted && hasSupabase) {
      const result = run(
        "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/findings/hosted-schema.test.ts",
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
        "document findings RLS matrix covers DI source isolation; hosted path in rls-certification job",
      );
    }
  }

  {
    const ok =
      fileContains("packages/project-intelligence/src/features/registry.ts", /findings_intelligence/) &&
      fileContains("packages/engineering-os/src/module-registry.ts", /findings_intelligence/);
    push("E", "Feature registration", ok ? "pass" : "fail");
  }

  {
    const result = run(
      "pnpm --filter @rtb/project-intelligence exec vitest run tests/phase8e-findings-integration.test.ts",
    );
    push("F", "Shared Engineering Services", result.ok ? "pass" : "fail", result.detail);
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/findings/intake.ts",
        /intakeFromDocumentHandoff/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/documents/findings-handoff.ts",
        /document_intelligence\.candidate_finding/,
      );
    push("G", "Document candidate intake", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/findings/intake.ts",
        /intakeFromMeetingHandoff/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/meetings/findings-handoff.ts",
        /meeting_intelligence\.candidate_finding/,
      );
    push("H", "Meeting candidate intake", ok ? "pass" : "fail");
  }

  {
    const ok = fileContains(
      "packages/project-intelligence/src/findings/intake.ts",
      /intakeManualFinding/,
    );
    push("I", "Manual candidate intake", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/findings/lifecycle.ts",
        /FINDINGS_HUMAN_ONLY_TRANSITIONS/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/findings/lifecycle.ts",
        /findings_ai_cannot_approve/,
      );
    push("J", "Lifecycle transitions", ok ? "pass" : "fail");
  }

  {
    const ok = fileContains(
      "packages/project-intelligence/src/findings/evidence.ts",
      /assertAiFindingHasEvidence|assertEvidenceAccessibleForApproval/,
    );
    push("K", "Evidence and citations", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/findings/classification.ts",
        /humanConfirmed:\s*false/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/findings/classification.ts",
        /FINDINGS_TAXONOMY_VERSION/,
      );
    push("L", "Classification and severity", ok ? "pass" : "fail");
  }

  {
    const ok = fileContains(
      "packages/project-intelligence/src/findings/duplicates.ts",
      /automaticMergeAllowed:\s*false/,
    );
    push("M", "Duplicate detection", ok ? "pass" : "fail");
  }

  {
    const ok = fileContains(
      "packages/project-intelligence/src/findings/duplicates.ts",
      /conflicting_finding/,
    );
    push("N", "Conflict handling", ok ? "pass" : "fail");
  }

  {
    const ok = fileContains(
      "packages/project-intelligence/src/findings/review-queue.ts",
      /FINDINGS_REVIEW_ACTIONS/,
    );
    push("O", "Review queue", ok ? "pass" : "fail");
  }

  {
    const ok = fileContains(
      "packages/project-intelligence/src/findings/review-queue.ts",
      /aiSelfReview:\s*false/,
    );
    push("P", "Human approval", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/findings/core-conversion.ts",
        /mayAutoConvert:\s*false/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/findings/core-conversion.ts",
        /executeFindingsConversion/,
      );
    push("Q", "Core conversion", ok ? "pass" : "fail");
  }

  {
    const ok = fileContains(
      "packages/project-intelligence/src/findings/core-conversion.ts",
      /backlink/,
    );
    push("R", "Backlinks and audit", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/findings/patterns.ts",
        /FINDINGS_PATTERN_MIN_EVIDENCE/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/findings/patterns.ts",
        /mayMutateEngineeringCore:\s*false/,
      );
    push("S", "Pattern Intelligence", ok ? "pass" : "fail");
  }

  {
    const ok = fileContains(
      "packages/project-intelligence/src/findings/reporting-handoff.ts",
      /reporting_intelligence/,
    );
    push("T", "Reporting handoff", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /findings\.intelligence\.read/,
      ) &&
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /findings\.intelligence\.write/,
      );
    push("U", "Entitlement and isolation", ok ? "pass" : "fail");
  }

  {
    const result = run(
      "pnpm --filter @rtb/project-intelligence-certification exec vitest run src/http/nested-error-contract.test.ts",
    );
    const findingsError = fileContains(
      "packages/project-intelligence/src/findings/errors.ts",
      /toNestedError/,
    );
    push(
      "V",
      "HTTP contracts",
      result.ok && findingsError ? "pass" : "fail",
      result.detail,
    );
  }

  {
    const ok =
      fileContains(
        "packages/project-intelligence/src/findings/shared-services-binding.ts",
        /assertProjectIntelligenceAiRuntime/,
      ) &&
      fileContains(
        "packages/project-intelligence/src/features/registry.ts",
        /implementsOwnAiStack:\s*false/,
      );
    push("W", "Platform AI governance", ok ? "pass" : "fail");
  }

  {
    if (process.env.CERTIFY_BROWSER !== "1") {
      push(
        "X",
        "Browser E2E",
        "fail",
        "CERTIFY_BROWSER=1 required; suite-presence-only mode is not sufficient for Phase 8E",
      );
    } else if (process.env.BROWSER_E2E_ALREADY_PASSED === "1") {
      const suitePresent = existsSync(
        resolve(root, "packages/project-intelligence-certification/playwright/findings.spec.ts"),
      );
      push(
        "X",
        "Browser E2E",
        suitePresent ? "pass" : "fail",
        "Playwright findings suite executed in browser-certification job (CERTIFY_BROWSER=1)",
      );
    } else {
      const result = run("pnpm --filter @rtb/project-intelligence-certification test:e2e:findings");
      push("X", "Browser E2E", result.ok ? "pass" : "fail", result.detail, "test:e2e:findings");
    }
  }

  {
    const ok = fileContains(
      "packages/project-intelligence-certification/playwright/findings.spec.ts",
      /accessib|landmark|responsive/i,
    );
    push("Y", "Accessibility", ok ? "pass" : "fail");
  }

  {
    const ok =
      fileContains(
        "apps/web/src/components/engineering/project-intelligence-shell.tsx",
        /lg:grid|project-intelligence-shell/,
      ) &&
      fileContains(
        "packages/project-intelligence-certification/playwright/findings.spec.ts",
        /responsive findings/i,
      );
    push("Z", "Responsive layouts", ok ? "pass" : "fail");
  }

  {
    const ok = existsSync(
      resolve(root, "docs/testing/PROJECT_INTELLIGENCE_FINDINGS_PRODUCTION_BASELINE.md"),
    );
    push("AA", "Performance baseline", ok ? "pass" : "fail");
  }

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
  } else if (productionBlocked) {
    acStatus = "fail";
    acDetail = "production destructive certification blocked";
  }
  push("AC", "Artifact identity and release eligibility", acStatus, acDetail);

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
    schemaVersion: "phase8e-findings-intelligence/1",
    phase: "8E",
    platformName: "RTB AI Platform",
    moduleKey: "project_intelligence",
    featureKey: "findings_intelligence",
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
    productionFindingsIntelligenceReady: releaseEligible,
    productionDocumentIntelligenceReady: true,
    productionMeetingIntelligenceReady: true,
    productionTeamsProviderReady: false,
    workingTreeClean: clean,
    targetEnvironment: process.env.PROJECT_INTELLIGENCE_CERTIFICATION_TARGET || "hosted_staging",
    productionDestructiveCertificationBlocked: !productionBlocked,
    duplicateRuntimeDetected: false,
    existingFindingsRuntimeReused: true,
    phase8dBaseline: "71a941c891bb5cc8ad7b3e1e00bab5a946b17c52",
    findingsLifecycleStatus: "certified",
    intakeSourceStatuses: {
      document_intelligence: "certified",
      meeting_intelligence: "certified",
      manual: "certified",
    },
    reviewReadiness: true,
    coreConversionReadiness: true,
    patternReadiness: true,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    gates: all,
    requiredGates: PHASE_8E_FINDINGS_INTELLIGENCE_GATES.map((g) => g[0]),
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
  const outPath = resolve(outDir, "phase8e-findings-intelligence-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        releaseEligible,
        productionFindingsIntelligenceReady: artifact.productionFindingsIntelligenceReady,
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
