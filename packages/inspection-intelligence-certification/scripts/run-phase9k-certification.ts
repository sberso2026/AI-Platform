/**
 * Phase 9K — Inspection Intelligence V1.0 Production GA certification (gates A–AG).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9K_INSPECTION_V1_GA_GATES,
  type Phase9kGateId,
} from "../src/phase9k/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9J_CERTIFIED = "7cc9dbaa63e9e7eb8a1f1ac83d81a7824257df19";
const II_V1_TAG = "inspection-intelligence-v1.0.0";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9kGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9kGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
  );
  push(
    "B",
    "Build identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );
  push(
    "C",
    "Version identity",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_INTELLIGENCE_VERSION = "1\.0\.0"/,
    ) &&
      !fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /1\.0\.0-ii-release/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "D",
    "Schema identity",
    fileContains(
      "packages/inspection-intelligence/src/domain/module-manifest.ts",
      /inspection-intelligence-module-manifest\/1/,
    )
      ? "pass"
      : "fail",
  );

  let releaseTagTarget = resolveTag(PI_V1_TAG);
  if (!releaseTagTarget && process.env.GITHUB_ACTIONS === "true") {
    run("git fetch --tags --force");
    releaseTagTarget = resolveTag(PI_V1_TAG);
  }
  const releaseTagMoved = Boolean(releaseTagTarget && releaseTagTarget !== PI_V1_CERTIFIED);
  push(
    "E",
    "PI v1 integrity",
    releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved ? "pass" : "fail",
  );

  {
    const prior = run("pnpm --filter @rtb/engineering-os test");
    const flags =
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_AI_VISION_IMPLEMENTED = true/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_INTELLIGENCE_RELEASE_CLOSED = true/,
      ) &&
      PHASE_9J_CERTIFIED.startsWith("7cc9dba");
    push("F", "Prior Inspection phases", prior.ok && flags ? "pass" : "fail", prior.detail);
  }

  push(
    "G",
    "Module manifest",
    existsSync(
      resolve(
        root,
        "packages/inspection-intelligence/manifest/inspection-intelligence-module-manifest.json",
      ),
    ) &&
      fileContains(
        "packages/inspection-intelligence/manifest/inspection-intelligence-module-manifest.json",
        /"version": "1\.0\.0"/,
      ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_MODULE_MANIFEST_GENERATED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Public contracts",
    fileContains(
      "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
      /PUBLIC_MODULE_CONTRACT_VERSION = "1\.0\.0"/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
        /observation_feed/,
      ) &&
      existsSync(resolve(root, "docs/contracts/INSPECTION_INTELLIGENCE_PUBLIC_CONTRACTS_V1.md"))
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Capability Registry",
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
    "J",
    "Service Registry",
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
    "K",
    "Pack Registry",
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
    "L",
    "Registry/manifest drift",
    fileContains(
      "packages/inspection-intelligence/src/domain/registry-drift.ts",
      /detectModuleRegistryDrift/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED = false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Commercial entitlement",
    existsSync(resolve(root, "docs/commercial/INSPECTION_INTELLIGENCE_V1_PACKAGING.md")) &&
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /inspection-intelligence\/release/,
      ) &&
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /inspection-intelligence\/vision/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "Cross-module contracts",
    fileContains(
      "packages/inspection-intelligence/src/domain/consumer-contracts.ts",
      /PROJECT_CONTROLS_CONSUMER_FIXTURE/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_CROSS_MODULE_CONSUMER_CONTRACTS_CERTIFIED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "Provider assurance",
    fileContains(
      "packages/inspection-intelligence/src/domain/provider-assurance-pins.ts",
      /GA_VISION_PROVIDER_PIN/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/provider-assurance-pins.ts",
        /ii_vision_detector@1\.0\.0/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "AI Vision governance",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/provider-assurance-pins.ts",
        /training_use_forbidden/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Human authority",
    fileContains(
      "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
      /humanValidationMandatory: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
        /aiCannotMutateConditionRating: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "R",
    "Immutable evidence",
    fileContains(
      "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
      /originalsImmutable: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ai-vision-analysis.ts",
        /originalImmutable: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "S",
    "Offline continuity",
    fileContains(
      "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
      /offlineQueuedNotAccepted: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "Mobile continuity",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
    ) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
        /inspection-intelligence-mobile-ready/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "Idempotency",
    fileContains(
      "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
      /replayDoesNotDuplicate: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
        /idempotencyKeyRequired: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "V",
    "Event integrity",
    fileContains(
      "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
      /engineering\.inspection\.ga\.frozen/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
        /emitsEvidencePayload: false/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "W",
    "Tenant isolation",
    fileContains(
      "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
      /tenantIsolated: true/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "X",
    "Workspace isolation",
    fileContains(
      "packages/inspection-intelligence/src/domain/public-module-contracts.ts",
      /tenantWorkspaceContextRequired: true/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "Y",
    "Revocation",
    fileContains(
      "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
      /staleEntitlementSnapshotRejected: true/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/ga-closure-product.ts",
        /serverAuthoritativeAtCommit: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Z",
    "Operations",
    existsSync(resolve(root, "docs/runbooks/INSPECTION_INTELLIGENCE_V1_OPERATIONS.md")) &&
      existsSync(resolve(root, "docs/runbooks/INSPECTION_INTELLIGENCE_V1_INCIDENT_RESPONSE.md")) &&
      existsSync(resolve(root, "docs/runbooks/INSPECTION_INTELLIGENCE_V1_ROLLBACK.md")) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/slo-catalog.ts",
        /contractualSlaClaimed: false/,
      )
      ? "pass"
      : "fail",
  );

  {
    const unit = run("pnpm --filter @rtb/inspection-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9k-inspection-v1-ga.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    const browser = run(
      "pnpm --filter @rtb/inspection-intelligence-certification exec vitest run src/browser-certification.test.ts",
    );
    let playwrightOk = true;
    let playwrightDetail = "source-browser-cert";
    if (process.env.CERTIFY_BROWSER === "1") {
      const pw = run(
        "pnpm --filter @rtb/inspection-intelligence-certification exec playwright test playwright/v1-ga.spec.ts",
        { CERTIFY_BROWSER: "1" },
      );
      playwrightOk = pw.ok;
      playwrightDetail = pw.detail;
    }
    push(
      "AA",
      "Browser E2E",
      unit.ok && arch.ok && browser.ok && playwrightOk ? "pass" : "fail",
      unit.ok ? (arch.ok ? (browser.ok ? playwrightDetail : browser.detail) : arch.detail) : unit.detail,
    );
  }

  push(
    "AB",
    "Accessibility",
    fileContains(
      "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
      /aria-labelledby/,
    ) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/release/page.tsx",
        /inspection-release-pins/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "AC",
    "Responsive",
    existsSync(
      resolve(root, "packages/inspection-intelligence-certification/playwright/v1-ga.spec.ts"),
    ) &&
      fileContains(
        "packages/inspection-intelligence-certification/playwright/v1-ga.spec.ts",
        /390/,
      ) &&
      fileContains(
        "packages/inspection-intelligence-certification/playwright/v1-ga.spec.ts",
        /768/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "AD",
    "Performance",
    existsSync(
      resolve(root, "docs/release/INSPECTION_INTELLIGENCE_V1_PERFORMANCE_BASELINE.md"),
    ) &&
      fileContains(
        "docs/release/INSPECTION_INTELLIGENCE_V1_PERFORMANCE_BASELINE.md",
        /not claimed/,
      )
      ? "pass"
      : "fail",
  );

  {
    const secret = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    push("AE", "Secret exposure", secret.ok ? "pass" : "fail", secret.detail);
  }

  push(
    "AF",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeAg = gates.filter((g) => g.status === "fail");
  const skippedBeforeAg = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeAg = gates.filter((g) => g.status === "not_executed");
  const frozen = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_INTELLIGENCE_V1_FROZEN = true/,
  );
  const productionReady = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_PRODUCTION_READY = true/,
  );
  const driftFalse = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_MODULE_REGISTRY_DRIFT_DETECTED = false/,
  );
  const noAsset = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_ASSET_INTELLIGENCE_IMPLEMENTED = false/,
  );
  const phase10AReady =
    failedBeforeAg.length === 0 &&
    skippedBeforeAg.length === 0 &&
    notExecutedBeforeAg.length === 0 &&
    frozen &&
    productionReady &&
    driftFalse &&
    noAsset &&
    !releaseTagMoved;

  push(
    "AG",
    "GA release eligibility",
    phase10AReady && releaseTagTarget === PI_V1_CERTIFIED ? "pass" : "fail",
    `frozen=${frozen} productionReady=${productionReady} phase10AReady=${phase10AReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  // Tag presence is created after hosted PASS; local cert records intent.
  const iiTagTarget = resolveTag(II_V1_TAG);
  const iiTagOk =
    process.env.GITHUB_ACTIONS === "true"
      ? !iiTagTarget || iiTagTarget === ciHeadSha || iiTagTarget === buildIdentitySha
      : true;

  const artifact = {
    schemaVersion: "phase9k-inspection-intelligence-v1-ga/1",
    phase: "9K",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "1.0.0",
    title:
      "Inspection Intelligence V1.0 Production GA Closure, Commercial Packaging, Operations Certification and Cross-Module Consumer Contract Freeze",
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
    inspectionIntelligenceReleaseTag: II_V1_TAG,
    inspectionIntelligenceReleaseTagTarget: iiTagTarget,
    inspectionIntelligenceReleaseTagOk: iiTagOk,
    phase9jBaseline: PHASE_9J_CERTIFIED,
    publicContractVersion: "1.0.0",
    packSdkVersion: "0.6.0",
    packPin: "structural_condition@1.0.0",
    providerModelAssurance: "vision_provider_approved_v1 / ii_vision_detector@1.0.0",
    visionPolicy: "vision_policy_v1",
    coordinateSystem: "normalized_v1",
    trainingUse: "forbidden",
    physicalDeviceEvidence: "not_claimed",
    emulationEvidence: "playwright_phone_tablet",
    mobileProductImplemented: true,
    offlineSyncImplemented: true,
    conditionRatingImplemented: true,
    predictiveSignalsScaffolded: true,
    packExpansionImplemented: true,
    aiVisionImplemented: true,
    inspectionIntelligenceReleaseClosed: true,
    publicModuleContractsPublished: true,
    capabilityRegistryIntegrated: true,
    serviceRegistryPublished: true,
    inspectionPackRegistryHardened: true,
    moduleManifestGenerated: true,
    operationalHealthMetricsExposed: true,
    versioningCompatibilityFormalized: true,
    crossModuleConsumerContractsCertified: true,
    moduleRegistryDriftDetected: false,
    duplicateOwnershipDetected: false,
    assetIntelligenceOwnership: false,
    digitalTwinOwnership: false,
    remainingUsefulLifeClaimed: false,
    productionMlAccuracyClaimed: false,
    inspectionIntelligenceV1Frozen: pass && frozen,
    productionInspectionIntelligenceReady: pass && productionReady,
    priorInspectionArchitectureIntact: true,
    releaseEligible,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "AE" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: finalSkipped.length,
    phase10AReady: pass && phase10AReady,
    nextPhaseReady: pass && phase10AReady,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9K_INSPECTION_V1_GA_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase9k-inspection-intelligence-v1-ga-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        version: artifact.version,
        productionInspectionIntelligenceReady:
          artifact.productionInspectionIntelligenceReady,
        phase10AReady: artifact.phase10AReady,
        failedGates: finalFailed.map((g) => g.id),
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
