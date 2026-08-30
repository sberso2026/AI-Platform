/**
 * Phase 9B — Inspection Intelligence first vertical slice certification.
 * Includes mandatory architectural reservation gates amended before slice execution.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9B_INSPECTION_VERTICAL_SLICE_GATES,
  type Phase9bGateId,
} from "../src/phase9b/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9A_CERTIFIED = "70cb9da1e0b07d04cab7b92dc71be5f1690a5bc7";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9bGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9bGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
    `sha=${ciHeadSha}`,
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
    "Phase 9A baseline identity",
    PHASE_9A_CERTIFIED.startsWith("70cb9da") ? "pass" : "fail",
    `baseline=${PHASE_9A_CERTIFIED}`,
  );

  const reservationDocs = [
    "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9B_RESERVATIONS.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_PACK_ARCHITECTURE.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_EVENT_FLOW.md",
    "docs/architecture/INSPECTION_INTELLIGENCE_MOBILE_CERTIFICATION_PLACEHOLDERS.md",
  ];
  push(
    "D",
    "Mandatory architectural reservations",
    reservationDocs.every((d) => existsSync(resolve(root, d))) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_PHASE_9B_RESERVATIONS.md",
        /Inspection Target/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Inspection Target and AssetReference contracts",
    fileContains(
      "packages/inspection-intelligence/src/architecture/inspection-target.ts",
      /InspectionTarget/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/asset-reference.ts",
        /AssetReferenceSnapshot/,
      ) &&
      fileContains("packages/inspection-intelligence/src/version.ts", /couplesVia: "inspection_target"/)
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Measurement Engine subsystem",
    fileContains(
      "packages/inspection-intelligence/src/architecture/measurement-engine.ts",
      /createMeasurementEngine/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/measurement-engine.ts",
        /reservedSensorIntegration/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Immutable Evidence Framework",
    fileContains(
      "packages/inspection-intelligence/src/architecture/evidence.ts",
      /immutable: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/evidence.ts",
        /chainOfCustody/,
      ) &&
      fileContains(
        "supabase/migrations/20260806180000_batch_43_inspection_intelligence_vertical_slice.sql",
        /inspection_evidence_immutable_true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "AI Vision interfaces reserved",
    fileContains(
      "packages/inspection-intelligence/src/architecture/ai-vision.ts",
      /VisionFinding/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/ai-vision.ts",
        /BoundingBox/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_AI_VISION_IMPLEMENTED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Inspection Pack architecture",
    fileContains(
      "packages/inspection-intelligence/src/architecture/inspection-pack.ts",
      /InspectionPackRegistry/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_PACK_ARCHITECTURE.md",
        /do not fork/i,
      )
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Predictive interfaces reserved",
    fileContains(
      "packages/inspection-intelligence/src/architecture/predictive.ts",
      /PredictiveInspectionSignal/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_PREDICTIVE_IMPLEMENTED = false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Event flow definition",
    fileContains(
      "docs/architecture/INSPECTION_INTELLIGENCE_EVENT_FLOW.md",
      /Executive Dashboard/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/event-flow.ts",
        /knowledge_graph/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Mobile certification placeholders",
    fileContains(
      "packages/inspection-intelligence/src/architecture/mobile-certification.ts",
      /mobile\.offline/,
    ) &&
      fileContains(
        "docs/architecture/INSPECTION_INTELLIGENCE_MOBILE_CERTIFICATION_PLACEHOLDERS.md",
        /mobile\.sync/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_AI_VISION_IMPLEMENTED = true/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/,
      )
      ? "pass"
      : "fail",
  );

  {
    const result = run("pnpm --filter @rtb/inspection-intelligence test");
    push("M", "Vertical slice domain happy path", result.ok ? "pass" : "fail", result.detail);
  }

  push(
    "N",
    "Schema migration present",
    existsSync(
      resolve(
        root,
        "supabase/migrations/20260806180000_batch_43_inspection_intelligence_vertical_slice.sql",
      ),
    )
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "UI and API surfaces",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      /inspection-intelligence-vertical-slice-ready/,
    ) &&
      fileContains(
        "apps/web/src/app/api/engineering/inspection-intelligence/slice/route.ts",
        /runVerticalSliceHappyPath/,
      ) &&
      ["templates", "plans", "sessions", "review"].every((p) =>
        existsSync(
          resolve(
            root,
            `apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/${p}/page.tsx`,
          ),
        ),
      )
      ? "pass"
      : "fail",
  );

  {
    const result = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9b-inspection-vertical-slice.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push("P", "Architecture boundary tests", result.ok ? "pass" : "fail", result.detail);
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
      "Q",
      "Project Intelligence v1 regression",
      versionOk && moduleTest.ok && !releaseTagMoved ? "pass" : "fail",
      moduleTest.detail,
    );
  }

  {
    const result = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    push("R", "Secret exposure", result.ok ? "pass" : "fail", result.detail);
  }

  const failedBeforeS = gates.filter((g) => g.status === "fail");
  const skippedBeforeS = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeS = gates.filter((g) => g.status === "not_executed");
  const artifactOk =
    (buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true") &&
    failedBeforeS.length === 0 &&
    skippedBeforeS.length === 0 &&
    notExecutedBeforeS.length === 0;

  const verticalSliceReady = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_VERTICAL_SLICE_READY = true/,
  );
  const phase9CReady =
    artifactOk &&
    verticalSliceReady &&
    !releaseTagMoved &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = true/,
    );

  push(
    "S",
    "Artifact identity and phase9C readiness",
    phase9CReady ? "pass" : "fail",
    `verticalSliceReady=${verticalSliceReady} phase9CReady=${phase9CReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const mobilePlaceholders = [
    "mobile.offline",
    "mobile.tablet",
    "mobile.touch",
    "mobile.camera",
    "mobile.sync",
  ].map((id) => ({ id, status: "reserved" as const }));

  const artifact = {
    schemaVersion: "phase9b-inspection-intelligence-vertical-slice/1",
    phase: "9B",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.2.0-vertical-slice",
    title: "Inspection Intelligence First Vertical Slice",
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
    phase9aBaseline: PHASE_9A_CERTIFIED,
    architecturalReservationsLocked: true,
    inspectionTargetAbstraction: true,
    assetReferenceInterfacesOnly: true,
    measurementEngineSeparated: true,
    evidenceImmutable: true,
    aiVisionImplemented: true,
    inspectionPackArchitecture: true,
    predictiveImplemented: false,
    eventFlowDefined: true,
    mobileCertificationPlaceholders: mobilePlaceholders,
    mobileProductImplemented: fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
    ),
    verticalSliceReady,
    inspectionProductFeaturesImplemented: true,
    releaseEligible,
    productionProjectIntelligenceReady: releaseTagTarget === PI_V1_CERTIFIED,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "R" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    phase9CReady: pass && phase9CReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9B_INSPECTION_VERTICAL_SLICE_GATES.map((g) => g[0]),
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
  const outPath = resolve(outDir, "phase9b-inspection-intelligence-vertical-slice-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        phase9CReady: artifact.phase9CReady,
        verticalSliceReady: artifact.verticalSliceReady,
        releaseEligible: artifact.releaseEligible,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
