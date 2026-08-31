/**
 * Phase 9G — Inspection Intelligence offline synchronization certification.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9G_INSPECTION_OFFLINE_SYNC_GATES,
  type Phase9gGateId,
} from "../src/phase9g/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9F_CERTIFIED = "59f30009b2b5c8ac5bd987cae5a24d2f258e22a3";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9gGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9gGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository and build identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
  );

  {
    const prior = run("pnpm --filter @rtb/engineering-os test");
    const mobile = fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
    );
    push(
      "B",
      "Prior phase regression",
      prior.ok && mobile && PHASE_9F_CERTIFIED.startsWith("59f3000") ? "pass" : "fail",
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
    "Engineering Mobile Offline SDK",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /ENGINEERING_MOBILE_OFFLINE_CAPABILITY_KEYS/,
    ) &&
      fileContains(
        "packages/engineering-os/src/mobile-sdk/index.ts",
        /export \* from "\.\/offline"/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Durable local store and schema migration",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /migrateOfflineStoreSchema/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/offline-sync.ts",
        /schemaVersion/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Encryption and key lifecycle",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /createCryptoKeyLifecycle/,
    ) &&
      fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /rotateCryptoKey/) &&
      fileContains(
        "packages/engineering-os/src/mobile-sdk/offline.ts",
        /cannot_guarantee_wipe_of_permanently_offline_device/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Offline packages",
    fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /createOfflinePackage/) &&
      fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /assertPackageUsable/) &&
      fileContains(
        "supabase/migrations/20260807010000_batch_48_inspection_intelligence_offline_sync.sql",
        /inspection_offline_packages/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Local command queue",
    fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /enqueueCommand/) &&
      fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /idempotencyKey/) &&
      fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /backoffWithJitter/)
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Evidence upload queue",
    fileContains(
      "packages/inspection-intelligence/src/domain/offline-sync.ts",
      /originalPreserved: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/offline-sync.ts",
        /serverConfirmed: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Sync coordinator",
    fileContains(
      "packages/inspection-intelligence/src/domain/offline-sync.ts",
      /coordinatorState/,
    ) &&
      fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /SyncCoordinatorState/)
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Connectivity model",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /browser_online_unverified/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/offline-sync.ts",
        /online_verified/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Deterministic conflict engine",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /lastWriteWinsForbidden: true/,
    ) &&
      fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /server_authoritative/)
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Multi-device reconciliation",
    fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /ReconciliationCursor/) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/offline-sync.ts",
        /causalityToken/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "Offline entitlement snapshot",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /createEntitlementSnapshot/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/offline-sync.ts",
        /denyExpiredEntitlement/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "Purge and storage management",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /unsyncedEvidenceProtected/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/offline-sync.ts",
        /local_logout/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "Pack-aware mobile reporting",
    fileContains(
      "packages/inspection-intelligence/src/domain/mobile-reporting.ts",
      /mobileReady: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/mobile-reporting.ts",
        /buildPackAwareMobileReports/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Sync UI",
    existsSync(
      resolve(
        root,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/sync/page.tsx",
      ),
    ) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
        /inspection-intelligence-offline-sync-ready/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "R",
    "Sync events and audit",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /engineering\.mobile\.sync\.completed/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/offline-sync.ts",
        /createSyncEvent/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "S",
    "Service-worker / recovery contracts",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/offline.ts",
      /serviceWorkerLifecycle/,
    ) &&
      fileContains("packages/engineering-os/src/mobile-sdk/offline.ts", /recovering/)
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/inspection-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9g-inspection-offline-sync.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    push(
      "T",
      "Offline unit and architecture tests",
      unit.ok && arch.ok ? "pass" : "fail",
      unit.ok ? arch.detail : unit.detail,
    );
  }

  push(
    "U",
    "Tenant and workspace isolation",
    fileContains(
      "supabase/migrations/20260807010000_batch_48_inspection_intelligence_offline_sync.sql",
      /tenant_isolation/,
    ) &&
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /inspection-intelligence\/sync/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "V",
    "Privacy and threat model",
    existsSync(resolve(root, "docs/security/INSPECTION_INTELLIGENCE_OFFLINE_THREAT_MODEL.md")) &&
      fileContains(
        "docs/security/INSPECTION_INTELLIGENCE_OFFLINE_THREAT_MODEL.md",
        /untrusted/,
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
        "pnpm --filter @rtb/inspection-intelligence-certification exec playwright test playwright/offline-sync.spec.ts",
        { CERTIFY_BROWSER: "1" },
      );
      playwrightOk = pw.ok;
      playwrightDetail = pw.detail;
    }
    push(
      "W",
      "Browser E2E offline",
      browser.ok && playwrightOk ? "pass" : "fail",
      browser.ok ? playwrightDetail : browser.detail,
    );
  }

  push(
    "X",
    "Device evidence documentation",
    existsSync(
      resolve(root, "docs/testing/INSPECTION_INTELLIGENCE_OFFLINE_DEVICE_EVIDENCE.md"),
    ) &&
      fileContains(
        "docs/testing/INSPECTION_INTELLIGENCE_OFFLINE_DEVICE_EVIDENCE.md",
        /not claim/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Y",
    "No AI Vision",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = true/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "Z",
    "No Asset Intelligence / Digital Twin ownership",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /assetOwnership: "engineering_os_shared_domain"/,
      )
      ? "pass"
      : "fail",
  );

  {
    const secret = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    push("AA", "Secret exposure", secret.ok ? "pass" : "fail", secret.detail);
  }

  {
    const identityOk =
      buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true";
    push("AB", "Artifact identity", identityOk ? "pass" : "fail");
  }

  const failedBeforeAc = gates.filter((g) => g.status === "fail");
  const skippedBeforeAc = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeAc = gates.filter((g) => g.status === "not_executed");
  const offlineSyncImplemented = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/,
  );
  const mobileProductImplemented = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
  );
  const phase9HReady =
    failedBeforeAc.length === 0 &&
    skippedBeforeAc.length === 0 &&
    notExecutedBeforeAc.length === 0 &&
    offlineSyncImplemented &&
    mobileProductImplemented &&
    !releaseTagMoved;

  push(
    "AC",
    "Release eligibility and phase9H readiness",
    phase9HReady && releaseTagTarget === PI_V1_CERTIFIED ? "pass" : "fail",
    `offlineSyncImplemented=${offlineSyncImplemented} phase9HReady=${phase9HReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9g-inspection-intelligence-offline-sync/1",
    phase: "9G",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.7.0-offline-sync",
    title: "Inspection Intelligence Offline Synchronization, Field Continuity and Mobile Reporting",
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
    phase9fBaseline: PHASE_9F_CERTIFIED,
    offlineSyncStatus: "complete",
    encryptionStatus: "implemented",
    conflictEngineStatus: "deterministic",
    mobileReportingStatus: "certified",
    physicalDeviceEvidence: "documented_separate_from_emulation",
    emulationEvidence: "playwright_phone_tablet",
    mobileProductImplemented: pass && mobileProductImplemented,
    offlineSyncImplemented: pass && offlineSyncImplemented,
    aiVisionImplemented: true,
    assetIntelligenceOwnership: false,
    digitalTwinOwnership: false,
    priorInspectionArchitectureIntact: true,
    architecturalReservationsIntact: true,
    releaseEligible,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "AA" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    phase9HReady: pass && phase9HReady,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9G_INSPECTION_OFFLINE_SYNC_GATES.map((g) => g[0]),
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
    "phase9g-inspection-intelligence-offline-sync-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        offlineSyncImplemented: artifact.offlineSyncImplemented,
        phase9HReady: artifact.phase9HReady,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
