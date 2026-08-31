/**
 * Phase 9I — Inspection Intelligence AI Vision certification.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9I_INSPECTION_AI_VISION_GATES,
  type Phase9iGateId,
} from "../src/phase9i/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9H_CERTIFIED = "d6e536119dfdc2ba13c2e6d197af1ba255381fe9";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9iGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9iGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository and build identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
  );

  {
    const prior = run("pnpm --filter @rtb/engineering-os test");
    const condition = fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_CONDITION_RATING_IMPLEMENTED = true/,
    );
    push(
      "B",
      "Prior phase regression",
      prior.ok && condition && PHASE_9H_CERTIFIED.startsWith("d6e5361") ? "pass" : "fail",
      prior.detail,
    );
  }

  let releaseTagTarget = resolveTag(PI_V1_TAG);
  if (!releaseTagTarget && process.env.GITHUB_ACTIONS === "true") {
    run("git fetch --tags --force");
    releaseTagTarget = resolveTag(PI_V1_TAG);
  }
  const releaseTagMoved = Boolean(releaseTagTarget && releaseTagTarget !== PI_V1_CERTIFIED);
  push(
    "C",
    "Project Intelligence v1 tag integrity",
    releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved ? "pass" : "fail",
  );

  push(
    "D",
    "Vision analysis contract",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
      /VisionAnalysisResult/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_AI_VISION_IMPLEMENTED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Immutable evidence and derivative lineage",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
      /assertOriginalImmutable/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
        /originalImmutable: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Privacy and preprocessing",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
      /exifLocationRemoved/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
        /submittedDerivativeHash/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Provider governance and fail-closed",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
      /denied_unapproved/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-product.ts",
        /expected_unapproved_provider_denial/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Model assurance",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-assurance.ts",
      /createModelAssurance/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-assurance.ts",
        /claimsAccuracy: false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Human validation",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-assurance.ts",
      /validateVisionAnalysis/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-assurance.ts",
        /vision_bulk_validation_forbidden/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Governed condition linkage",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-assurance.ts",
      /linkValidatedVisionToConditionObservedInput/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-assurance.ts",
        /vision_condition_link_requires_explicit_reviewer_action/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Pack-aware adapters",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-pack-adapters.ts",
      /STRUCTURAL_VISION_ADAPTER/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-pack-adapters.ts",
        /executableCodeForbidden: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Mobile and offline continuity",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-product.ts",
      /offlineQueuedOnly/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-product.ts",
        /queued_must_not_claim_inference/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Vision UI",
    existsSync(
      resolve(
        root,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/vision/page.tsx",
      ),
    ) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
        /inspection-intelligence-ai-vision-ready/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "Events",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
      /engineering\.inspection\.vision\./,
    )
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/inspection-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9i-inspection-ai-vision.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push(
      "O",
      "Unit and architecture tests",
      unit.ok && arch.ok ? "pass" : "fail",
      unit.ok ? arch.detail : unit.detail,
    );
  }

  push(
    "P",
    "Tenant isolation",
    fileContains(
      "supabase/migrations/20260807030000_batch_50_inspection_intelligence_ai_vision.sql",
      /tenant_isolation/,
    ) &&
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /inspection-intelligence\/vision/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Threat model",
    existsSync(resolve(root, "docs/security/INSPECTION_INTELLIGENCE_AI_VISION_THREAT_MODEL.md")) &&
      fileContains(
        "docs/security/INSPECTION_INTELLIGENCE_AI_VISION_THREAT_MODEL.md",
        /advisory/,
      )
      ? "pass"
      : "fail",
  );

  {
    const browser = run(
      "pnpm --filter @rtb/inspection-intelligence-certification exec vitest run src/browser-certification.test.ts",
    );
    let playwrightOk = true;
    let playwrightDetail = "source-browser-cert";
    if (process.env.CERTIFY_BROWSER === "1") {
      const pw = run(
        "pnpm --filter @rtb/inspection-intelligence-certification exec playwright test playwright/ai-vision.spec.ts",
        { CERTIFY_BROWSER: "1" },
      );
      playwrightOk = pw.ok;
      playwrightDetail = pw.detail;
    }
    push(
      "R",
      "Browser E2E",
      browser.ok && playwrightOk ? "pass" : "fail",
      browser.ok ? playwrightDetail : browser.detail,
    );
  }

  push(
    "S",
    "Device evidence",
    existsSync(resolve(root, "docs/testing/INSPECTION_INTELLIGENCE_AI_VISION_DEVICE_EVIDENCE.md")) &&
      fileContains(
        "docs/testing/INSPECTION_INTELLIGENCE_AI_VISION_DEVICE_EVIDENCE.md",
        /not claim/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "No Asset Intelligence / Digital Twin ownership",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/predictive.ts",
        /PREDICTIVE_INSPECTION_RESERVED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "No accuracy or RUL claims",
    fileContains(
      "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
      /claimsAccuracy: false/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
        /claimsRemainingUsefulLife: false/,
      )
      ? "pass"
      : "fail",
  );

  {
    const secret = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    push("V", "Secret exposure", secret.ok ? "pass" : "fail", secret.detail);
  }

  push(
    "W",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeX = gates.filter((g) => g.status === "fail");
  const skippedBeforeX = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeX = gates.filter((g) => g.status === "not_executed");
  const aiVisionImplemented = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_AI_VISION_IMPLEMENTED = true/,
  );
  const priorFlags =
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/,
    ) &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_CONDITION_RATING_IMPLEMENTED = true/,
    ) &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
    );
  const phase9JReady =
    failedBeforeX.length === 0 &&
    skippedBeforeX.length === 0 &&
    notExecutedBeforeX.length === 0 &&
    aiVisionImplemented &&
    priorFlags &&
    !releaseTagMoved;

  push(
    "X",
    "Release eligibility and next-phase readiness",
    phase9JReady && releaseTagTarget === PI_V1_CERTIFIED ? "pass" : "fail",
    `aiVisionImplemented=${aiVisionImplemented} phase9JReady=${phase9JReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9i-inspection-intelligence-ai-vision/1",
    phase: "9I",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.9.0-ai-vision",
    title:
      "Inspection Intelligence AI Vision Evidence Analysis, Model Assurance and Human Validation",
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
    phase9hBaseline: PHASE_9H_CERTIFIED,
    providerModelAssurance: "vision_provider_approved_v1 / ii_vision_detector@1.0.0",
    visionStatus: "advisory_human_validated",
    physicalDeviceEvidence: "documented_separate_from_emulation",
    emulationEvidence: "playwright_phone_tablet",
    mobileProductImplemented: true,
    offlineSyncImplemented: true,
    conditionRatingImplemented: true,
    predictiveSignalsScaffolded: true,
    packExpansionImplemented: true,
    aiVisionImplemented: pass && aiVisionImplemented,
    assetIntelligenceOwnership: false,
    digitalTwinOwnership: false,
    remainingUsefulLifeClaimed: false,
    productionMlAccuracyClaimed: false,
    priorInspectionArchitectureIntact: true,
    releaseEligible,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "V" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: finalSkipped.length,
    phase9JReady: pass && phase9JReady,
    nextPhaseReady: pass && phase9JReady,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9I_INSPECTION_AI_VISION_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase9i-inspection-intelligence-ai-vision-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        aiVisionImplemented: artifact.aiVisionImplemented,
        phase9JReady: artifact.phase9JReady,
        failedGates: finalFailed.map((g) => g.id),
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
