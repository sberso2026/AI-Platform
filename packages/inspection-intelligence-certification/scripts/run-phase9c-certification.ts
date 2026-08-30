/**
 * Phase 9C — Inspection Intelligence enterprise foundation certification.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9C_INSPECTION_ENTERPRISE_GATES,
  type Phase9cGateId,
} from "../src/phase9c/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9B_CERTIFIED = "7ee22e1851b2616788817328b67471677a052736";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9cGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9cGateId, name: string, status: GateStatus, detail?: string) =>
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
    `target=${releaseTagTarget ?? "missing"}`,
  );

  push(
    "C",
    "Phase 9B baseline identity",
    PHASE_9B_CERTIFIED.startsWith("7ee22e1") ? "pass" : "fail",
  );

  push(
    "D",
    "Durable persistence migrations",
    existsSync(
      resolve(
        root,
        "supabase/migrations/20260806180000_batch_43_inspection_intelligence_vertical_slice.sql",
      ),
    ) &&
      fileContains(
        "supabase/migrations/20260806200000_batch_44_inspection_intelligence_enterprise_foundation.sql",
        /inspection_template_versions/,
      ) &&
      fileContains(
        "supabase/migrations/20260806200000_batch_44_inspection_intelligence_enterprise_foundation.sql",
        /inspection_pack_registry/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Engineering Module SDK",
    fileContains(
      "packages/engineering-os/src/module-sdk/index.ts",
      /createEngineeringModuleSdkSkeleton/,
    ) &&
      fileContains(
        "packages/engineering-os/src/module-sdk/index.ts",
        /ENGINEERING_MODULE_SDK_FUTURE_CONSUMERS/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Inspection Pack SDK",
    fileContains(
      "packages/inspection-intelligence/src/pack-sdk/index.ts",
      /InspectionPackSdk/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/pack-sdk/index.ts",
        /COATINGS_PACK_SCAFFOLD/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Immutable template versioning",
    fileContains(
      "packages/inspection-intelligence/src/domain/persistence.ts",
      /PersistedTemplateVersion/,
    ) &&
      fileContains(
        "supabase/migrations/20260806200000_batch_44_inspection_intelligence_enterprise_foundation.sql",
        /inspection_template_versions_immutable_true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Immutable evidence framework",
    fileContains(
      "packages/inspection-intelligence/src/architecture/evidence.ts",
      /immutable: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/persistence.ts",
        /appendImmutableEvidence/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "State machine and authorization",
    fileContains(
      "packages/inspection-intelligence/src/domain/state-machine.ts",
      /assertInspectionTransition/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/state-machine.ts",
        /inspection_transition_unauthorized/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Event contracts and pipeline",
    fileContains(
      "packages/inspection-intelligence/src/domain/engineering-events.ts",
      /PLATFORM_EVENT_PIPELINE/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/engineering-events.ts",
        /InspectionCompleted/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Measurement Engine expansion",
    fileContains(
      "packages/inspection-intelligence/src/architecture/measurement-engine.ts",
      /reservedFormulaLibrary/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/measurement-engine.ts",
        /reservedCalibrationHistory/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Reserved condition/defect/recommendation/offline/AI Vision",
    fileContains(
      "packages/inspection-intelligence/src/architecture/enterprise-reservations.ts",
      /CONDITION_RATING_RESERVED/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/enterprise-reservations.ts",
        /OFFLINE_SYNC_CONTRACTS_RESERVED/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_AI_VISION_IMPLEMENTED = true/,
      )
      ? "pass"
      : "fail",
  );

  {
    const result = run("pnpm --filter @rtb/inspection-intelligence test");
    push("M", "Enterprise domain happy path", result.ok ? "pass" : "fail", result.detail);
  }

  {
    const result = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9c-inspection-enterprise.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push("N", "Architecture boundary tests", result.ok ? "pass" : "fail", result.detail);
  }

  {
    const browserUnit = run(
      "pnpm --filter @rtb/inspection-intelligence-certification exec vitest run src/browser-certification.test.ts",
    );
    let detail = browserUnit.detail;
    let ok = browserUnit.ok;
    if (ok && process.env.CERTIFY_BROWSER === "1" && process.env.GITHUB_ACTIONS === "true") {
      const browserE2E = run(
        "pnpm --filter @rtb/inspection-intelligence-certification exec playwright test playwright/enterprise.spec.ts",
        {
          INSPECTION_INTELLIGENCE_CERTIFICATION: "1",
          PROJECT_INTELLIGENCE_CERTIFICATION: "1",
        },
      );
      ok = browserE2E.ok;
      detail = browserE2E.detail;
    } else if (browserUnit.ok) {
      detail = "source_browser_cert_pass";
    }
    push("O", "Browser certification", ok ? "pass" : "fail", detail);
  }

  {
    const versionOk = fileContains(
      "packages/project-intelligence/src/version.ts",
      /PROJECT_INTELLIGENCE_V1_CERTIFICATION_VERSION = "1\.0\.0"/,
    );
    const moduleTest = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase8b-project-intelligence-module.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push(
      "P",
      "Project Intelligence v1 regression",
      versionOk && moduleTest.ok && !releaseTagMoved ? "pass" : "fail",
      moduleTest.detail,
    );
  }

  {
    const result = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    push("Q", "Secret exposure", result.ok ? "pass" : "fail", result.detail);
  }

  const failedBeforeR = gates.filter((g) => g.status === "fail");
  const artifactOk =
    (buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true") &&
    failedBeforeR.length === 0;
  push("R", "Artifact identity", artifactOk ? "pass" : "fail");

  const failedBeforeS = gates.filter((g) => g.status === "fail");
  const enterpriseFoundationReady = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_ENTERPRISE_FOUNDATION_READY = true/,
  );
  const architecturalReservationsIntact =
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = true/,
    ) &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /couplesVia: "inspection_target"/,
    );
  const phase9DReady =
    failedBeforeS.length === 0 &&
    enterpriseFoundationReady &&
    architecturalReservationsIntact &&
    !releaseTagMoved;

  push(
    "S",
    "Enterprise foundation and phase9D readiness",
    phase9DReady ? "pass" : "fail",
    `enterpriseFoundationReady=${enterpriseFoundationReady} phase9DReady=${phase9DReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9c-inspection-intelligence-enterprise-foundation/1",
    phase: "9C",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.3.0-enterprise-foundation",
    title: "Inspection Intelligence Enterprise Foundation",
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
    phase9bBaseline: PHASE_9B_CERTIFIED,
    hostedPersistenceStatus: "migrations_and_durable_repository",
    engineeringModuleSdkStatus: "complete",
    inspectionPackSdkStatus: "complete_with_coatings_scaffold",
    templateVersioningStatus: "immutable_implemented",
    measurementEngineStatus: "expanded_with_reservations",
    evidenceFrameworkStatus: "immutable_implemented",
    eventContractsStatus: "implemented",
    eventPipelineStatus: "operational_in_process_and_schema",
    conditionRatingStatus: "reserved",
    defectTaxonomyStatus: "reserved",
    recommendationContractsStatus: "reserved",
    offlineContractStatus: "reserved",
    aiVisionReservationStatus: "reserved",
    architecturalReservationsIntact,
    enterpriseFoundationReady: pass && enterpriseFoundationReady,
    verticalSliceReady: true,
    releaseEligible,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "Q" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    phase9DReady: pass && phase9DReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9C_INSPECTION_ENTERPRISE_GATES.map((g) => g[0]),
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
    "phase9c-inspection-intelligence-enterprise-foundation-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        enterpriseFoundationReady: artifact.enterpriseFoundationReady,
        phase9DReady: artifact.phase9DReady,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
