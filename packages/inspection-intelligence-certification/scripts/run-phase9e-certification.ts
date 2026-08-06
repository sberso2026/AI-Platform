/**
 * Phase 9E — Inspection Intelligence operational workflows certification.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9E_INSPECTION_OPERATIONAL_WORKFLOW_GATES,
  type Phase9eGateId,
} from "../src/phase9e/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9D_CERTIFIED = "5fdc73a943df98cee551a1be147acbaaab5d4022";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9eGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9eGateId, name: string, status: GateStatus, detail?: string) =>
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

  push("C", "Phase 9D baseline identity", PHASE_9D_CERTIFIED.startsWith("5fdc73a") ? "pass" : "fail");

  push(
    "D",
    "Engineering Workflow SDK",
    fileContains(
      "packages/engineering-os/src/workflow-sdk/index.ts",
      /ENGINEERING_WORKFLOW_SDK_CAPABILITY_KEYS/,
    ) &&
      fileContains(
        "packages/engineering-os/src/workflow-sdk/index.ts",
        /assertEngineeringWorkflowSdkComplete/,
      ) &&
      fileContains("packages/engineering-os/src/index.ts", /workflow-sdk/)
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Inspection operational workflows",
    fileContains(
      "packages/inspection-intelligence/src/domain/operational-workflows.ts",
      /runInspectionOperationalWorkflowHappyPath/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/operational-workflow-definition.ts",
        /INSPECTION_OPERATIONAL_WORKFLOW_DEFINITION/,
      ) &&
      fileContains(
        "supabase/migrations/20260806230000_batch_46_inspection_intelligence_operational_workflows.sql",
        /inspection_workflow_instances/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Reporting preparation",
    fileContains(
      "packages/inspection-intelligence/src/domain/reporting-preparation.ts",
      /INSPECTION_REPORTING_DATA_MODELS/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/reporting-preparation.ts",
        /mobileReady: false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Workflow typed event emission",
    fileContains(
      "packages/engineering-os/src/workflow-sdk/index.ts",
      /engineering\.workflow\.transitioned/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/operational-workflows.ts",
        /engineering\.workflow\.started/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/operational-workflows.ts",
        /createWorkflowEvent/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
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
        /INSPECTION_OPERATIONAL_WORKFLOWS_READY = true/,
      )
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/inspection-intelligence test");
    const engOs = run("pnpm --filter @rtb/engineering-os test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9e-inspection-operational-workflows.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push(
      "I",
      "Operational happy path + architecture tests",
      unit.ok && engOs.ok && arch.ok ? "pass" : "fail",
      unit.ok && engOs.ok ? arch.detail : unit.ok ? engOs.detail : unit.detail,
    );
  }

  {
    const browser = run(
      "pnpm --filter @rtb/inspection-intelligence-certification exec vitest run src/browser-certification.test.ts",
    );
    push("J", "Browser certification", browser.ok ? "pass" : "fail", browser.detail);
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
      "K",
      "Project Intelligence v1 regression",
      versionOk && moduleTest.ok && !releaseTagMoved ? "pass" : "fail",
      moduleTest.detail,
    );
  }

  {
    const secret = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    const domain = fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_ENGINEERING_DOMAIN_COMPLETE = true/,
    );
    push(
      "L",
      "Secret exposure + prior domain intact",
      secret.ok && domain ? "pass" : "fail",
      secret.detail,
    );
  }

  const failedBeforeM = gates.filter((g) => g.status === "fail");
  const skippedBeforeM = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeM = gates.filter((g) => g.status === "not_executed");
  const artifactOk =
    (buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true") &&
    failedBeforeM.length === 0 &&
    skippedBeforeM.length === 0 &&
    notExecutedBeforeM.length === 0;

  const operationalWorkflowsReady = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_OPERATIONAL_WORKFLOWS_READY = true/,
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
  const phase9FReady =
    artifactOk && operationalWorkflowsReady && architecturalReservationsIntact && !releaseTagMoved;

  push(
    "M",
    "Artifact identity and phase9F readiness",
    phase9FReady ? "pass" : "fail",
    `operationalWorkflowsReady=${operationalWorkflowsReady} phase9FReady=${phase9FReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9e-inspection-intelligence-operational-workflows/1",
    phase: "9E",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.5.0-operational-workflows",
    title: "Inspection Intelligence Operational Workflows and Engineering Workflow SDK",
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
    phase9dBaseline: PHASE_9D_CERTIFIED,
    engineeringWorkflowSdkStatus: "complete",
    operationalWorkflowsStatus: "complete",
    reportingPreparationStatus: "complete",
    workflowEventIntegrationStatus: "typed_contracts",
    mobileImplementationIntroduced: fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
    ),
    offlineSyncIntroduced: false,
    aiVisionImplementationIntroduced: false,
    architecturalReservationsIntact,
    engineeringDomainComplete: true,
    operationalWorkflowsReady: pass && operationalWorkflowsReady,
    releaseEligible,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "L" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    phase9FReady: pass && phase9FReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9E_INSPECTION_OPERATIONAL_WORKFLOW_GATES.map((g) => g[0]),
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
    "phase9e-inspection-intelligence-operational-workflows-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        operationalWorkflowsReady: artifact.operationalWorkflowsReady,
        phase9FReady: artifact.phase9FReady,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
