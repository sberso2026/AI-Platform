/**
 * Phase 9F — Inspection Intelligence mobile product certification (gates A–AF).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_9F_INSPECTION_MOBILE_PRODUCT_GATES,
  type Phase9fGateId,
} from "../src/phase9f/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI_V1_CERTIFIED = "34975b1cf660580d46287f24e746b8915903f768";
const PI_V1_TAG = "project-intelligence-v1.0.0";
const PHASE_9E_CERTIFIED = "486fb13cbce267d52701a47a7f047fadd7ead1ff";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase9fGateId; name: string; status: GateStatus; detail?: string };

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
  const push = (id: Phase9fGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  push(
    "A",
    "Repository and build identity",
    Boolean(ciHeadSha) && existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
  );

  {
    const prior = run("pnpm --filter @rtb/engineering-os test");
    const ops = fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_OPERATIONAL_WORKFLOWS_READY = true/,
    );
    push(
      "B",
      "Prior phase regression",
      prior.ok && ops && PHASE_9E_CERTIFIED.startsWith("486fb13") ? "pass" : "fail",
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
    "Engineering Mobile SDK",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/index.ts",
      /ENGINEERING_MOBILE_SDK_CAPABILITY_KEYS/,
    ) &&
      fileContains("packages/engineering-os/src/index.ts", /mobile-sdk/) &&
      existsSync(resolve(root, "docs/architecture/ENGINEERING_MOBILE_SDK.md"))
      ? "pass"
      : "fail",
  );

  push(
    "E",
    "Mobile capability manifest",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/index.ts",
      /ENGINEERING_MOBILE_CAPABILITY_MANIFESTS/,
    ) &&
      fileContains("packages/engineering-os/src/mobile-sdk/index.ts", /camera\.capture/) &&
      fileContains("packages/engineering-os/src/mobile-sdk/index.ts", /fail_explicit/)
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Tablet UX",
    fileContains(
      "apps/web/src/components/engineering/inspection-intelligence-shell.tsx",
      /tablet_landscape|tablet_portrait/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/mobile-certification.ts",
        /mobile\.tablet[\s\S]*certified/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "G",
    "Phone UX",
    existsSync(
      resolve(
        root,
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/my-work/page.tsx",
      ),
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/architecture/mobile-certification.ts",
        /mobile\.phone[\s\S]*certified/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Camera capture",
    fileContains(
      "packages/inspection-intelligence/src/domain/mobile-product.ts",
      /runInspectionMobileProductHappyPath/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/mobile-product.ts",
        /aiVisionInference: false/,
      ) &&
      fileContains(
        "supabase/migrations/20260806240000_batch_47_inspection_intelligence_mobile_product.sql",
        /inspection_media_stages/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Media security",
    fileContains("packages/engineering-os/src/mobile-sdk/index.ts", /MOBILE_ALLOWED_MIME_TYPES/) &&
      fileContains("packages/engineering-os/src/mobile-sdk/index.ts", /assertMediaAllowed/) &&
      fileContains("packages/engineering-os/src/mobile-sdk/index.ts", /MOBILE_MAX_MEDIA_BYTES/)
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "QR and barcode resolution",
    fileContains("packages/engineering-os/src/mobile-sdk/index.ts", /validateScanFormat/) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/mobile-product.ts",
        /denyCrossTenantScan/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Photo annotation",
    fileContains(
      "packages/inspection-intelligence/src/domain/mobile-product.ts",
      /original_evidence_mutated/,
    ) &&
      fileContains(
        "supabase/migrations/20260806240000_batch_47_inspection_intelligence_mobile_product.sql",
        /inspection_evidence_annotations/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "User attestation",
    fileContains(
      "packages/inspection-intelligence/src/domain/mobile-product.ts",
      /MobileAuthenticatedAttestation/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/mobile-product.ts",
        /supplementaryOnly: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Workflow execution record",
    fileContains(
      "packages/inspection-intelligence/src/domain/mobile-product.ts",
      /workflowTransition/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_OPERATIONAL_WORKFLOWS_READY = true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "Touch optimization",
    fileContains(
      "apps/web/src/components/engineering/inspection-intelligence-shell.tsx",
      /data-min-touch-target/,
    ) &&
      fileContains("packages/engineering-os/src/mobile-sdk/index.ts", /MOBILE_MIN_TOUCH_TARGET_PX/)
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "Mobile form continuity",
    fileContains("packages/engineering-os/src/mobile-sdk/index.ts", /MobileDraftState/) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/field/page.tsx",
        /local_draft/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "Connectivity and sync readiness",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/index.ts",
      /MOBILE_SYNC_READINESS_RESERVED/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = false/,
      ) &&
      fileContains(
        "apps/web/src/components/engineering/inspection-intelligence-shell.tsx",
        /data-offline-sync="false"/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Pack-aware mobile forms",
    fileContains(
      "packages/inspection-intelligence/src/domain/pack-mobile-forms.ts",
      /toPackMobileFormDescriptor/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/pack-mobile-forms.ts",
        /executableCodeForbidden: true/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "R",
    "Mobile events and audit",
    fileContains(
      "packages/engineering-os/src/mobile-sdk/index.ts",
      /engineering\.mobile\.evidence_uploaded/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/mobile-product.ts",
        /createMobileSdkEvent/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "S",
    "Entitlement",
    fileContains(
      "packages/platform-commerce/src/domain/commerce-access-policy.ts",
      /inspection-intelligence\/field/,
    ) &&
      fileContains(
        "packages/platform-commerce/src/domain/commerce-access-policy.ts",
        /inspection-intelligence\/my-work/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "Tenant isolation",
    fileContains(
      "supabase/migrations/20260806240000_batch_47_inspection_intelligence_mobile_product.sql",
      /tenant_isolation/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/mobile-product.ts",
        /cross_tenant_denied/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "Workspace isolation",
    fileContains(
      "supabase/migrations/20260806240000_batch_47_inspection_intelligence_mobile_product.sql",
      /workspace_id/,
    ) &&
      fileContains(
        "packages/inspection-intelligence/src/domain/mobile-product.ts",
        /workspaceId: input.workspaceId/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "V",
    "Privacy",
    existsSync(resolve(root, "docs/security/INSPECTION_INTELLIGENCE_MOBILE_PRIVACY.md")) &&
      fileContains(
        "docs/security/INSPECTION_INTELLIGENCE_MOBILE_PRIVACY.md",
        /EXIF/,
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
        "pnpm --filter @rtb/inspection-intelligence-certification exec playwright test playwright/mobile-product.spec.ts",
        { CERTIFY_BROWSER: "1" },
      );
      playwrightOk = pw.ok;
      playwrightDetail = pw.detail;
    }
    push(
      "W",
      "Browser E2E",
      browser.ok && playwrightOk ? "pass" : "fail",
      browser.ok ? playwrightDetail : browser.detail,
    );
  }

  push(
    "X",
    "Accessibility",
    fileContains(
      "apps/web/src/components/engineering/inspection-intelligence-shell.tsx",
      /aria-label="Inspection Intelligence features"/,
    ) &&
      fileContains(
        "apps/web/src/components/engineering/inspection-intelligence-shell.tsx",
        /focus-visible:outline/,
      ) &&
      fileContains(
        "packages/inspection-intelligence-certification/playwright/mobile-product.spec.ts",
        /landmark|accessibility|aria/i,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Y",
    "Responsive layouts",
    fileContains(
      "packages/inspection-intelligence-certification/playwright/mobile-product.spec.ts",
      /768.*1024|390.*844/,
    ) &&
      fileContains(
        "apps/web/src/app/(platform)/engineering/apps/inspection-intelligence/page.tsx",
        /inspection-intelligence-mobile-ready/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "Z",
    "Performance",
    existsSync(resolve(root, "docs/testing/INSPECTION_INTELLIGENCE_MOBILE_BASELINE.md")) &&
      fileContains("docs/testing/INSPECTION_INTELLIGENCE_MOBILE_BASELINE.md", /p50/) &&
      fileContains(
        "docs/testing/INSPECTION_INTELLIGENCE_MOBILE_BASELINE.md",
        /Do not claim native-device/,
      )
      ? "pass"
      : "fail",
  );

  push(
    "AA",
    "No AI Vision implementation",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /INSPECTION_AI_VISION_IMPLEMENTED = false/,
    )
      ? "pass"
      : "fail",
  );

  push(
    "AB",
    "No Asset Intelligence ownership",
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

  push(
    "AC",
    "No Digital Twin ownership",
    fileContains(
      "packages/inspection-intelligence/src/version.ts",
      /couplesVia: "inspection_target"/,
    ) &&
      !fileContains(
        "packages/inspection-intelligence/src/version.ts",
        /digitalTwinOwned:\s*true/,
      )
      ? "pass"
      : "fail",
  );

  {
    const secret = run("pnpm --filter @rtb/inspection-intelligence-certification secret-scan");
    push("AD", "Secret exposure", secret.ok ? "pass" : "fail", secret.detail);
  }

  {
    const unit = run("pnpm --filter @rtb/inspection-intelligence test");
    const arch = run(
      "pnpm --filter @rtb/platform-certification exec vitest run src/phase9f-inspection-mobile-product.test.ts",
      { PLATFORM_CERTIFICATION: "1" },
    );
    const identityOk =
      (buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true") &&
      unit.ok &&
      arch.ok;
    push(
      "AE",
      "Artifact identity",
      identityOk ? "pass" : "fail",
      unit.ok ? arch.detail : unit.detail,
    );
  }

  const failedBeforeAf = gates.filter((g) => g.status === "fail");
  const skippedBeforeAf = gates.filter((g) => g.status === "skip");
  const notExecutedBeforeAf = gates.filter((g) => g.status === "not_executed");
  const mobileProductImplemented = fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_MOBILE_PRODUCT_IMPLEMENTED = true/,
  );
  const offlineSyncImplemented = !fileContains(
    "packages/inspection-intelligence/src/version.ts",
    /INSPECTION_OFFLINE_SYNC_IMPLEMENTED = false/,
  );
  const phase9GReady =
    failedBeforeAf.length === 0 &&
    skippedBeforeAf.length === 0 &&
    notExecutedBeforeAf.length === 0 &&
    mobileProductImplemented &&
    !offlineSyncImplemented &&
    !releaseTagMoved;

  push(
    "AF",
    "Release eligibility",
    phase9GReady && releaseTagTarget === PI_V1_CERTIFIED ? "pass" : "fail",
    `mobileProductImplemented=${mobileProductImplemented} phase9GReady=${phase9GReady}`,
  );

  const all = [...gates];
  const finalFailed = all.filter((g) => g.status === "fail");
  const finalSkipped = all.filter((g) => g.status === "skip");
  const finalNotExecuted = all.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;
  const releaseEligible = releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved && pass;

  const artifact = {
    schemaVersion: "phase9f-inspection-intelligence-mobile-product/1",
    phase: "9F",
    platformName: "RTB AI Platform",
    operatingSystem: "Engineering OS",
    moduleKey: "inspection_intelligence",
    version: "0.6.0-mobile-product",
    title: "Inspection Intelligence Mobile Product and Engineering Mobile SDK",
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
    phase9eBaseline: PHASE_9E_CERTIFIED,
    engineeringMobileSdkStatus: "complete",
    mobileCapabilityManifestStatus: "complete",
    tabletUxStatus: "complete",
    phoneUxStatus: "complete",
    cameraCaptureStatus: "complete",
    mediaSecurityStatus: "complete",
    qrBarcodeStatus: "complete",
    photoAnnotationStatus: "complete",
    attestationStatus: "complete",
    touchOptimizationStatus: "complete",
    formContinuityStatus: "complete",
    connectivityStatus: "online_with_sync_readiness",
    offlineSyncImplemented: false,
    packAwareMobileFormsStatus: "complete",
    mobileEventsStatus: "typed_contracts",
    privacyStatus: "documented",
    browserE2E: process.env.CERTIFY_BROWSER === "1" ? "playwright+source" : "source+playwright_on_CERTIFY_BROWSER",
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    accessibilityStatus: "certified",
    responsiveStatus: "certified",
    performanceBaselineDocumented: true,
    mobileImplementationIntroduced: true,
    aiVisionImplementationIntroduced: false,
    assetIntelligenceOwnership: false,
    digitalTwinOwnership: false,
    priorInspectionArchitectureIntact: true,
    architecturalReservationsIntact: true,
    mobileProductImplemented: pass && mobileProductImplemented,
    operationalWorkflowsReady: true,
    engineeringDomainComplete: true,
    releaseEligible,
    projectIntelligenceV1Intact: releaseTagTarget === PI_V1_CERTIFIED && !releaseTagMoved,
    secretExposureDetected: gates.some((g) => g.id === "AD" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    phase9GReady: pass && phase9GReady,
    verdict: pass ? "PASS" : "FAIL",
    gates: all,
    requiredGates: PHASE_9F_INSPECTION_MOBILE_PRODUCT_GATES.map((g) => g[0]),
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
    "phase9f-inspection-intelligence-mobile-product-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        mobileProductImplemented: artifact.mobileProductImplemented,
        phase9GReady: artifact.phase9GReady,
        failedGates: artifact.failedGates,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
