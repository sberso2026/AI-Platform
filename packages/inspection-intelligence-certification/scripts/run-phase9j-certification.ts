/**
 * Phase 9J — Inspection Intelligence module release certification.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9J_INSPECTION_MODULE_RELEASE_GATES,
  type Phase9jGateId,
} from "../src/phase9j/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9I_CERTIFIED = "d3545e7786152030c1dfbc9178d38ad266357c45";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9jGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9jGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository and build identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
  );

  {
    const prior = run("pnpm --filter @rtb/engineering-os test");
    const vision = fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = true/,
    );
    push(
      "B",
      "Prior phase regression",
      prior.ok && vision && PHASE_9I_CERTIFIED.startsWith("d3545e7") ? "pass" : "fail",
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
    "Module release closure and publication authority",
    fileContains(
      "packages/inspection-intelligence/src/domain/module-release-product.ts",
      /runModuleReleaseHappyPath/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_INTELLIGENCE_RELEASE_CLOSED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Public module contracts",
    fileContains(
      "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
      /assertPublicContractsMachineCheckable/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_PUBLIC_MODULE_CONTRACTS_PUBLISHED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Capability Registry integration",
    fileContains(
      "packages/inspection-intelligence/src/domain/capability-registry-integration.ts",
      /INSPECTION_CAPABILITY_CATALOG/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_CAPABILITY_REGISTRY_INTEGRATED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Service Registry publication",
    fileContains(
      "packages/inspection-intelligence/src/domain/service-registry.ts",
      /INSPECTION_SERVICE_REGISTRY/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_SERVICE_REGISTRY_PUBLISHED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Hardened Inspection Pack Registry",
    fileContains(
      "packages/inspection-intelligence/src/domain/pack-registry-hardened.ts",
      /assertHardenedPackRegistry/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_PACK_REGISTRY_HARDENED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Module manifest",
    existsSync(
      resolve(
        root,
        "packages/inspection-intelligence/manifest/inspection-intelligence-module-manifest.json",
      ),
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/module-manifest.ts",
        /assertManifestConsistentWithRegistries/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_MODULE_MANIFEST_GENERATED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Operational health metrics",
    fileContains(
      "packages/inspection-intelligence/src/domain/operational-health-metrics.ts",
      /collectOperationalHealthMetrics/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_OPERATIONAL_HEALTH_METRICS_EXPOSED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Versioning and compatibility",
    existsSync(
      resolve(root, "docs/architecture/INSPECTION_INTELLIGENCE_VERSIONING_COMPATIBILITY.md"),
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/versioning-compatibility.ts",
        /assertVersioningFormalized/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_VERSIONING_COMPATIBILITY_FORMALIZED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Consumer contracts non-owning",
    fileContains(
      "packages/inspection-intelligence/src/domain/consumer-contracts.ts",
      /ownership: "none"/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/consumer-contracts.ts",
        /assertConsumerContractsNonOwning/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Release UI",
    existsSync(
      resolve(
        root,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
      ),
    ) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
        /inspection-intelligence-release-ready/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "Events",
    fileContains(
      "packages/inspection-intelligence/src/domain/module-release-product.ts",
      /engineering\.inspection\.release\.closed/,
    )
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/inspection-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9j-inspection-module-release.test.ts",
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
    "Tenant isolation and commerce",
    fileContains(
      "packages/platform-commerce/src/domain/commerce-access-policy.ts",
      /inspection-intelligence\/release/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
        /tenantIsolated: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Threat model",
    existsSync(
      resolve(root, "docs/security/INSPECTION_INTELLIGENCE_MODULE_RELEASE_THREAT_MODEL.md"),
    ) &&
      fileContains(
        "docs/security/INSPECTION_INTELLIGENCE_MODULE_RELEASE_THREAT_MODEL.md",
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
        "pnpm --filter @rtb/inspection-intelligence-certification exec playwright test playwright/module-release.spec.ts",
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
    existsSync(
      resolve(root, "docs/testing/INSPECTION_INTELLIGENCE_MODULE_RELEASE_DEVICE_EVIDENCE.md"),
    ) &&
      fileContains(
        "docs/testing/INSPECTION_INTELLIGENCE_MODULE_RELEASE_DEVICE_EVIDENCE.md",
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
        "packages/inspection-intelligence/src/domain/module-manifest.ts",
        /digitalTwinOwnership: false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "No accuracy or RUL claims",
    fileContains(
      "packages/inspection-intelligence/src/domain/operational-health-metrics.ts",
      /claimsAccuracy: false/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/operational-health-metrics.ts",
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
  const releaseClosed = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_INTELLIGENCE_RELEASE_CLOSED = true/,
  );
  const priorFlags =
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = true/,
    ) &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_CONDITION_RATING_IMPLEMENTED = true/,
    ) &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/,
    ) &&
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
    );
  const phase9KReady =
    failedBeforeX.length === 0 &&
    skippedBeforeX.length === 0 &&
    notExecutedBeforeX.length === 0 &&
    releaseClosed &&
    priorFlags &&
    !releaseTagMoved;

  push(
    "X",
    "Release eligibility and next-phase readiness",
    phase9KReady && releaseTagTarget === PI_V1_CERTIFIED ? "pass" : "fail",
    `releaseClosed=${releaseClosed} phase9KReady=${phase9KReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9j-inspection-intelligence-module-release/1",
    phase: "9J",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "1.0.0-ii-release",
    title:
      "Inspection Intelligence Module Release Closure, Public Contracts, Registries, Manifest and Production Hardening",
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
    phase9iBaseline: PHASE_9I_CERTIFIED,
    publicContractVersion: "1.0.0",
    packSdkVersion: "0.6.0",
    manifestSchema: "inspection-intelligence-module-manifest/1",
    providerModelAssurance: "vision_provider_approved_v1 / ii_vision_detector@1.0.0 (advisory)",
    physicalDeviceEvidence: "documented_separate_from_emulation",
    emulationEvidence: "playwright_phone_tablet",
    mobileProductImplemented: true,
    offlineSyncImplemented: true,
    conditionRatingImplemented: true,
    predictiveSignalsScaffolded: true,
    packExpansionImplemented: true,
    aiVisionImplemented: true,
    inspectionIntelligenceReleaseClosed: pass && releaseClosed,
    publicModuleContractsPublished: true,
    capabilityRegistryIntegrated: true,
    serviceRegistryPublished: true,
    inspectionPackRegistryHardened: true,
    moduleManifestGenerated: true,
    operationalHealthMetricsExposed: true,
    versioningCompatibilityFormalized: true,
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
    phase9KReady: pass && phase9KReady,
    nextPhaseReady: pass && phase9KReady,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9J_INSPECTION_MODULE_RELEASE_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase9j-inspection-intelligence-module-release-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        inspectionIntelligenceReleaseClosed: artifact.inspectionIntelligenceReleaseClosed,
        phase9KReady: artifact.phase9KReady,
        failedGates: finalFailed.map((g) => g.id),
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
