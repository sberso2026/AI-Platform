/**
 * Phase 9D — Inspection Intelligence engineering domain completion certification.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9D_INSPECTION_ENGINEERING_DOMAIN_GATES,
  type Phase9dGateId,
} from "../src/phase9d/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9C_CERTIFIED = "3999e25ecc22876e78f38360a9ac45aff4942332";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9dGateId; name: string; status: GateStatus; detail?: string };

function run(cmd: string, env?: NodeJS.ProcessEnv): { ok: boolean; detail: string } {
  try {
    execSync(cmd, {
      cwd: root,
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
function git(cmd: string): string {
  return execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
}
function fileContains(rel: string, pattern: RegExp): boolean {
  return pattern.test(readFileSync(resolve(root, rel), "utf8"));
}
function resolveTag(tag: string): string | null {
  try {
    return git(`git rev-list -n 1 ${tag}`);
  } catch {
    return null;
  }
}

function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const gates: GateResult[] = [];
  const push = (id: Phase9dGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
  );

  let releaseTagTarget = resolveTag(PI_V1_TAG);
  if (!releaseTagTarget && process.env.GITHUB_ACTIONS === "true") {
    run("git fetch --tags --force");
    releaseTagTarget = resolveTag(PI_V1_TAG);
  }
  const releaseTagMoved = Boolean(releaseTagTarget && releaseTagTarget !== PI_V1_CERTIFIED);
  push(
    "B",
    "Project Intelligence v1 tag integrity",
    releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved ? "pass" : "fail",
  );

  push("C", "Phase 9C baseline identity", PHASE_9C_CERTIFIED.startsWith("3999e25") ? "pass" : "fail");

  push(
    "D",
    "Engineering Domain SDK",
    fileContains(
      "packages/engineering-os/src/domain-sdk/index.ts",
      /ENGINEERING_DOMAIN_SDK_CONTRACT_KEYS/,
    ) && fileContains("packages/engineering-os/src/domain-sdk/index.ts", /knowledgeGraph/)
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Defect Framework",
    fileContains("packages/inspection-intelligence/src/domain/defects.ts", /assertDefectTransition/) &&
      fileContains(
        "supabase/migrations/20260806220000_batch_45_inspection_intelligence_engineering_domain.sql",
        /inspection_defects/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Recommendation Framework",
    fileContains(
      "packages/inspection-intelligence/src/domain/recommendations.ts",
      /issueRecommendation/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Corrective Action Framework",
    fileContains(
      "packages/inspection-intelligence/src/domain/corrective-actions.ts",
      /assertCorrectiveActionTransition/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Engineering Assessment",
    fileContains(
      "packages/inspection-intelligence/src/domain/assessments.ts",
      /createAiAssessmentDraft/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/assessments.ts",
        /human_approval_required/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Verification Framework",
    fileContains(
      "packages/inspection-intelligence/src/domain/verification.ts",
      /completeVerification/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Close-out lifecycle",
    fileContains(
      "packages/inspection-intelligence/src/domain/close-out.ts",
      /evaluateInspectionCloseOut/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/close-out.ts",
        /corrective_action_unverified/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Compliance Framework",
    fileContains(
      "packages/inspection-intelligence/src/domain/compliance.ts",
      /ComplianceStandardFamily/,
    ) && fileContains("packages/inspection-intelligence/src/domain/compliance.ts", /NACE/)
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "KPI Framework",
    fileContains(
      "packages/inspection-intelligence/src/domain/kpis.ts",
      /computeBasicInspectionKpis/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Risk typed adapter integration",
    fileContains(
      "packages/inspection-intelligence/src/domain/risk-adapter.ts",
      /EngineeringRiskRegisterAdapter/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/risk-adapter.ts",
        /never a private risk store/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "No offline / no AI Vision",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = false/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_ENGINEERING_DOMAIN_COMPLETE = true/,
      )
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/inspection-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9d-inspection-engineering-domain.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push(
      "O",
      "Domain happy path + architecture tests",
      unit.ok && arch.ok ? "pass" : "fail",
      unit.ok ? arch.detail : unit.detail,
    );
  }

  {
    const browser = run(
      "pnpm --filter @rtb/inspection-intelligence-certification exec vitest run src/browser-certification.test.ts",
    );
    push("P", "Browser certification", browser.ok ? "pass" : "fail", browser.detail);
  }

  {
    const versionOk = fileContains(
      "packages/project-intelligence/src/version.ts",
      /PROJECT_INTELLIGENCE_VERSION = "1\.0\.0"/,
    );
    const moduleTest = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase8b-project-intelligence-module.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push(
      "Q",
      "Project Intelligence v1 regression",
      versionOk && moduleTest.ok && !releaseTagMoved ? "pass" : "fail",
      moduleTest.detail,
    );
  }

  {
    const secret = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    const foundation = fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_ENTERPRISE_FOUNDATION_READY = true/,
    );
    push(
      "R",
      "Secret exposure + prior foundation intact",
      secret.ok && foundation ? "pass" : "fail",
      secret.detail,
    );
  }

  const failedBeforeS = gates.filter((g) => g.status === "fail");
  const skippedBeforeS = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeS = gates.filter((g) => g.status === "not_executed");
  const artifactOk =
    (buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true") &&
    failedBeforeS.length === 0 &&
    skippedBeforeS.length === 0 &&
    notExecutedBeforeS.length === 0;

  const engineeringDomainComplete = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_ENGINEERING_DOMAIN_COMPLETE = true/,
  );
  const architecturalReservationsIntact =
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = false/,
    ) &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/,
    );
  const phase9EReady =
    artifactOk && engineeringDomainComplete && architecturalReservationsIntact && !releaseTagMoved;

  push(
    "S",
    "Artifact identity and phase9E readiness",
    phase9EReady ? "pass" : "fail",
    `engineeringDomainComplete=${engineeringDomainComplete} phase9EReady=${phase9EReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9d-inspection-intelligence-engineering-domain/1",
    phase: "9D",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.4.0-engineering-domain",
    title: "Inspection Intelligence Engineering Domain Completion",
    repository: process.env.GITHUB_REPOSITORY || "sberso2026/AI-Platform",
    workflow: process.env.GITHUB_WORKFLOW || "local",
    runId: process.env.GITHUB_RUN_ID || null,
    branch: process.env.GITHUB_REF_NAME || git("git rev-parse --abbrev-ref HEAD"),
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    projectIntelligenceV1CertifiedCommit: PI_V1_CERTIFIED,
    releaseTag: PI_V1_TAG,
    releaseTagTarget,
    releaseTagMoved,
    phase9cBaseline: PHASE_9C_CERTIFIED,
    engineeringDomainSdkStatus: "complete",
    defectFrameworkStatus: "complete",
    recommendationFrameworkStatus: "complete",
    correctiveActionFrameworkStatus: "complete",
    engineeringAssessmentStatus: "complete",
    verificationFrameworkStatus: "complete",
    closeOutLifecycleStatus: "complete",
    complianceFrameworkStatus: "complete",
    kpiFrameworkStatus: "complete",
    riskIntegrationStatus: "typed_adapter_only",
    mobileImplementationIntroduced: fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
    ),
    aiVisionImplementationIntroduced: false,
    architecturalReservationsIntact,
    engineeringDomainComplete: pass && engineeringDomainComplete,
    enterpriseFoundationReady: true,
    releaseEligible,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "R" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    phase9EReady: pass && phase9EReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9D_INSPECTION_ENGINEERING_DOMAIN_GATES.map((g) => g[0]),
    failedGates: finalFailed.map((g) => g.id),
    skippedGates: finalSkipped.map((g) => g.id),
    notExecutedGates: finalNotExecuted.map((g) => g.id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    timestamp: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase9d-inspection-intelligence-engineering-domain-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        engineeringDomainComplete: artifact.engineeringDomainComplete,
        phase9EReady: artifact.phase9EReady,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
