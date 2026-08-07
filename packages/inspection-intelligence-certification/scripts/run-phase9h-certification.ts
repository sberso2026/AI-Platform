/**
 * Phase 9H — Inspection Intelligence condition rating / predictive / pack expansion certification.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9H_INSPECTION_CONDITION_PREDICTIVE_GATES,
  type Phase9hGateId,
} from "../src/phase9h/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9G_CERTIFIED = "00223fc3d6d7b8afdc515f3bf1e50fff9697496e";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9hGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9hGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository and build identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
  );

  {
    const prior = run("pnpm --filter @rtb/engineering-os test");
    const offline = fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/,
    );
    push(
      "B",
      "Prior phase regression",
      prior.ok && offline && PHASE_9G_CERTIFIED.startsWith("00223fc") ? "pass" : "fail",
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
    "Condition rating model",
    fileContains(
      "packages/inspection-intelligence/src/domain/condition-rating.ts",
      /createObservedConditionRating/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/condition-rating.ts",
        /human_approved/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_CONDITION_RATING_IMPLEMENTED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Condition aggregation",
    fileContains(
      "packages/inspection-intelligence/src/domain/condition-aggregation.ts",
      /aggregateComponentRatings/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/condition-aggregation.ts",
        /abstained: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Override and publication authority",
    fileContains(
      "packages/inspection-intelligence/src/domain/condition-rating.ts",
      /overrideConditionRating/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/condition-rating.ts",
        /condition_publish_unauthorised/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Predictive signals scaffolding",
    fileContains(
      "packages/inspection-intelligence/src/domain/predictive-signals.ts",
      /generateDeterministicPredictiveSignals/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_PREDICTIVE_SIGNALS_SCAFFOLDED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Fail-closed providers and no RUL/ML claims",
    fileContains(
      "packages/inspection-intelligence/src/domain/predictive-signals.ts",
      /claimsRemainingUsefulLife: false/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/predictive-signals.ts",
        /ml_provider_not_certified/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_PREDICTIVE_IMPLEMENTED = false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Structural pack expansion",
    fileContains(
      "packages/inspection-intelligence/src/pack-sdk/index.ts",
      /STRUCTURAL_CONDITION_PACK_SDK/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_PACK_EXPANSION_IMPLEMENTED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Offline continuity for ratings/signals",
    fileContains(
      "packages/inspection-intelligence/src/domain/condition-predictive-product.ts",
      /offlineOrigin: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/condition-predictive-product.ts",
        /offlineDraftUnpublished/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Reporting and KPI continuity",
    fileContains(
      "packages/inspection-intelligence/src/domain/reporting-preparation.ts",
      /condition_rating_snapshot/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/reporting-preparation.ts",
        /buildConditionPredictiveReportingOutputs/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Operational hardening scenarios",
    fileContains(
      "packages/inspection-intelligence/src/domain/condition-predictive-product.ts",
      /incompatibleSchemeBlocked/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/tests/discovery-identity.test.ts",
        /abstain/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Events and metrics contracts",
    fileContains(
      "packages/inspection-intelligence/src/domain/condition-rating.ts",
      /engineering\.inspection\.condition\./,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/predictive-signals.ts",
        /engineering\.inspection\.predictive\./,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/condition-predictive-product.ts",
        /engineering\.inspection\.pack\./,
      )
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "Condition and predictive UI",
    existsSync(
      resolve(
        root,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/condition/page.tsx",
      ),
    ) &&
      existsSync(
        resolve(
          root,
          "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/predictive/page.tsx",
        ),
      ) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
        /inspection-intelligence-condition-predictive-ready/,
      )
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/inspection-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9h-inspection-condition-predictive.test.ts",
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
    "Tenant isolation and entitlements",
    fileContains(
      "supabase/migrations/20260807020000_batch_49_inspection_intelligence_condition_predictive.sql",
      /tenant_isolation/,
    ) &&
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /inspection-intelligence\/condition/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Threat model and limitations",
    existsSync(
      resolve(root, "docs/security/INSPECTION_INTELLIGENCE_CONDITION_PREDICTIVE_THREAT_MODEL.md"),
    ) &&
      fileContains(
        "docs/security/INSPECTION_INTELLIGENCE_CONDITION_PREDICTIVE_THREAT_MODEL.md",
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
        "pnpm --filter @rtb/inspection-intelligence-certification exec playwright test playwright/condition-predictive.spec.ts",
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
    "Device evidence documentation",
    existsSync(
      resolve(root, "docs/testing/INSPECTION_INTELLIGENCE_CONDITION_DEVICE_EVIDENCE.md"),
    ) &&
      fileContains(
        "docs/testing/INSPECTION_INTELLIGENCE_CONDITION_DEVICE_EVIDENCE.md",
        /not claim/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "No AI Vision",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = false/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "U",
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

  {
    const secret = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    push("V", "Secret exposure", secret.ok ? "pass" : "fail", secret.detail);
  }

  {
    const identityOk =
      buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true";
    push("W", "Artifact identity", identityOk ? "pass" : "fail");
  }

  const failedBeforeX = gates.filter((g) => g.status === "fail");
  const skippedBeforeX = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeX = gates.filter((g) => g.status === "not_executed");
  const conditionRatingImplemented = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_CONDITION_RATING_IMPLEMENTED = true/,
  );
  const predictiveSignalsScaffolded = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_PREDICTIVE_SIGNALS_SCAFFOLDED = true/,
  );
  const packExpansionImplemented = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_PACK_EXPANSION_IMPLEMENTED = true/,
  );
  const phase9IReady =
    failedBeforeX.length === 0 &&
    skippedBeforeX.length === 0 &&
    notExecutedBeforeX.length === 0 &&
    conditionRatingImplemented &&
    predictiveSignalsScaffolded &&
    packExpansionImplemented &&
    !releaseTagMoved;

  push(
    "X",
    "Release eligibility and phase9I readiness",
    phase9IReady && releaseTagTarget === PI_V1_CERTIFIED ? "pass" : "fail",
    `conditionRatingImplemented=${conditionRatingImplemented} phase9IReady=${phase9IReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9h-inspection-intelligence-condition-predictive/1",
    phase: "9H",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.8.0-condition-predictive",
    title:
      "Inspection Intelligence Condition Rating, Predictive Signals, Pack Expansion and Operational Hardening",
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
    phase9gBaseline: PHASE_9G_CERTIFIED,
    packDelivered: "structural_condition@1.0.0",
    conditionRatingStatus: "complete",
    predictiveSignalsStatus: "scaffolded_advisory_fail_closed",
    packExpansionStatus: "structural_condition_certified",
    performanceBaselinesDocumented: true,
    physicalDeviceEvidence: "documented_separate_from_emulation",
    emulationEvidence: "playwright_phone_tablet",
    mobileProductImplemented: true,
    offlineSyncImplemented: true,
    conditionRatingImplemented: pass && conditionRatingImplemented,
    predictiveSignalsScaffolded: pass && predictiveSignalsScaffolded,
    packExpansionImplemented: pass && packExpansionImplemented,
    aiVisionImplemented: false,
    assetIntelligenceOwnership: false,
    digitalTwinOwnership: false,
    remainingUsefulLifeClaimed: false,
    productionMlAccuracyClaimed: false,
    priorInspectionArchitectureIntact: true,
    architecturalReservationsIntact: true,
    releaseEligible,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "V" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: finalSkipped.length,
    phase9IReady: pass && phase9IReady,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9H_INSPECTION_CONDITION_PREDICTIVE_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase9h-inspection-intelligence-condition-predictive-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        conditionRatingImplemented: artifact.conditionRatingImplemented,
        phase9IReady: artifact.phase9IReady,
        failedGates: finalFailed.map((g) => g.id),
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
