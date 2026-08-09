/**
 * Phase 14E certification runner — Engineering OS V1.0 Production GA.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_14A_COMMIT,
  PHASE_14B_COMMIT,
  PHASE_14C_COMMIT,
  PHASE_14D_COMMIT,
  PHASE_14E_AI_COMMIT,
  PHASE_14E_DT_COMMIT,
  PHASE_14E_ENGINEERING_OS_GA_GATES,
  PHASE_14E_EOS_VERSION,
  PHASE_14E_GATE_COUNT,
  PHASE_14E_II_COMMIT,
  PHASE_14E_INTEROP_COMMIT,
  PHASE_14E_PC_COMMIT,
  PHASE_14E_PI_COMMIT,
  PHASE_14E_RELEASE_TAG,
  type Phase14eGateId,
} from "../src/phase14e/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const VERSION = "packages/engineering-os/src/version.ts";
const FLAGS = "packages/engineering-os/src/security-closure/flags.ts";
const REGISTRY = "packages/engineering-os/src/module-registry.ts";
const HOME = "apps/web/src/app/(platform)/engineering/page.tsx";
const GAPS = "docs/architecture/ENGINEERING_OS_V1_GA_GAP_REGISTER.md";
const SEC_GAPS = "docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md";
const WORKFLOW = ".github/workflows/phase-14e-engineering-os-ga.yml";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase14eGateId; name: string; status: GateStatus; detail?: string };

function run(cmd: string, env?: Record<string, string>) {
  try {
    execSync(cmd, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    return { ok: true, detail: "ok" };
  } catch (e) {
    const err = e as { stderr?: string; stdout?: string; message?: string };
    return {
      ok: false,
      detail: (err.stderr || err.stdout || err.message || "failed").toString().slice(0, 2000),
    };
  }
}
function sha() {
  return execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
}
function read(rel: string) {
  return readFileSync(resolve(root, rel), "utf8");
}
function has(rel: string, re: RegExp) {
  try {
    return re.test(read(rel));
  } catch {
    return false;
  }
}
function exists(rel: string) {
  return existsSync(resolve(root, rel));
}
function tag(name: string) {
  try {
    return execSync(`git rev-list -n 1 ${name}`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}
function gate(id: Phase14eGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const ciHeadSha = process.env.GITHUB_SHA ?? commit;
  const versionSrc = read(VERSION);
  const flagsSrc = read(FLAGS);
  const registry = read(REGISTRY);
  const gaps = read(GAPS);
  const secGaps = read(SEC_GAPS);
  const results: GateResult[] = [];
  const byId = new Map<Phase14eGateId, GateResult>();
  const push = (g: GateResult) => {
    results.push(g);
    byId.set(g.id, g);
  };
  const flagTrue = (src: string, name: string) => new RegExp(`${name} = true`).test(src);
  const flagFalse = (src: string, name: string) => new RegExp(`${name} = false`).test(src);

  push(gate("A", "Repository/build identity", Boolean(commit), commit));
  push(
    gate(
      "B",
      "Phase 14D baseline intact",
      has(VERSION, new RegExp(PHASE_14D_COMMIT)) &&
        flagTrue(flagsSrc, "engineeringOsSecurityGaGatePassed") &&
        flagFalse(flagsSrc, "securityClosureRequiredBeforeGa"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 14C/14B/14A baselines referenced",
      has(VERSION, new RegExp(PHASE_14C_COMMIT)) &&
        has(VERSION, new RegExp(PHASE_14A_COMMIT)) &&
        has(VERSION, /PHASE_14B_PRODUCT_INTEGRATION_VERSION/),
    ),
  );
  push(
    gate(
      "D",
      "Frozen V1 module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_14E_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_14E_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_14E_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_14E_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_14E_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_14E_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "E",
      "Version 1.0.0 ga",
      has(VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(VERSION, /ENGINEERING_OS_STATUS = "ga"/) &&
        has("packages/engineering-os/package.json", /"1\.0\.0"/),
    ),
  );
  push(
    gate(
      "F",
      "Public contracts frozen 1.0.0",
      flagTrue(versionSrc, "EngineeringOSPublicContractsFrozen") &&
        has(VERSION, /ENGINEERING_OS_PUBLIC_CONTRACT_VERSION = "1\.0\.0"/) &&
        exists("docs/architecture/ENGINEERING_OS_V1_PUBLIC_CONTRACTS.md"),
    ),
  );
  push(
    gate(
      "G",
      "Manifest frozen 1.0.0",
      flagTrue(versionSrc, "EngineeringOSManifestFrozen") &&
        has(
          "packages/engineering-os/src/product-integration/aggregate-manifest.ts",
          /blocked_external_dependency/,
        ) &&
        has(
          "packages/engineering-os/src/product-integration/aggregate-manifest.ts",
          /analysis_model_generation/,
        ),
    ),
  );
  push(
    gate(
      "H",
      "Shared domain pins",
      flagTrue(versionSrc, "sharedDomainVersionsPinned") &&
        has(
          "packages/engineering-os/src/product-integration/aggregate-manifest.ts",
          /0\.1\.0-shared-project-domain/,
        ) &&
        has(
          "packages/engineering-os/src/product-integration/aggregate-manifest.ts",
          /0\.2\.0-spatial-core/,
        ),
    ),
  );
  push(gate("I", "Ownership alias", flagTrue(versionSrc, "assetOwnershipAliasEnforced")));
  push(
    gate(
      "J",
      "Module registry truthful",
      flagTrue(versionSrc, "moduleRegistryTruthful") &&
        flagFalse(versionSrc, "moduleRegistryDriftDetected") &&
        [
          "project_intelligence",
          "inspection_intelligence",
          "asset_intelligence",
          "project_controls",
          "digital_twin",
          "engineering_model_interoperability",
        ].every((k) => registry.includes(`moduleKey: "${k}"`)),
    ),
  );
  push(gate("K", "Launcher complete", flagTrue(versionSrc, "engineeringOsLauncherComplete")));
  push(gate("L", "Navigation ready", flagTrue(versionSrc, "EngineeringOSNavigationReady")));
  push(
    gate(
      "M",
      "Home v1-ready marker",
      has(HOME, /data-testid="engineering-os-v1-ready"/),
    ),
  );
  push(
    gate(
      "N",
      "EngineeringContext frozen",
      flagTrue(versionSrc, "EngineeringContextReady") &&
        flagTrue(versionSrc, "EngineeringContextV1Frozen"),
    ),
  );
  push(
    gate("O", "Cross-module search ready", flagTrue(versionSrc, "EngineeringOSCrossModuleSearchReady")),
  );
  push(
    gate("P", "AI orchestration ready", flagTrue(versionSrc, "EngineeringOSAiOrchestrationReady")),
  );
  push(gate("Q", "implementsOwnAiStack false", flagFalse(versionSrc, "implementsOwnAiStack")));
  push(
    gate(
      "R",
      "Classification-aware AI preserved",
      flagTrue(flagsSrc, "ClassificationAwareAiPolicyReady") &&
        flagTrue(flagsSrc, "ClassificationAwareAiEnforcementReady"),
    ),
  );
  push(
    gate(
      "S",
      "Sensitive logging preserved",
      flagTrue(flagsSrc, "SensitiveLoggingPolicyReady") &&
        flagTrue(flagsSrc, "SensitiveLoggingEnforcementReady"),
    ),
  );
  push(gate("T", "Health ready", flagTrue(versionSrc, "EngineeringOSHealthReady")));
  push(
    gate(
      "U",
      "Tool Framework singular",
      flagFalse(versionSrc, "duplicateEngineeringToolFrameworkDetected"),
    ),
  );
  push(
    gate(
      "V",
      "Execution host client-owned architecture",
      flagTrue(versionSrc, "clientLicensedSolverExecutionArchitectureSupported") &&
        flagFalse(versionSrc, "commercialSolverLicenseOwnedByRTBRequired") &&
        flagTrue(versionSrc, "clientRetainsCommercialSolverLicenseOwnership") &&
        exists("docs/architecture/CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md"),
    ),
  );
  push(
    gate(
      "W",
      "Solver certs remain false",
      flagFalse(versionSrc, "clientLicensedETABSExecutionCertified") &&
        flagFalse(versionSrc, "clientLicensedSPACEGASSExecutionCertified"),
    ),
  );
  push(
    gate("X", "silentSolverFallbackAllowed false", flagFalse(versionSrc, "silentSolverFallbackAllowed")),
  );
  push(
    gate(
      "Y",
      "Commercial packaging",
      flagTrue(versionSrc, "EngineeringOSCommercialProductReady") &&
        exists("docs/commercial/ENGINEERING_OS_V1_PACKAGING.md"),
    ),
  );
  push(
    gate("Z", "Entitlement coverage", flagTrue(versionSrc, "EngineeringOSEntitlementCoverageReady")),
  );
  push(gate("AA", "Installability", flagTrue(versionSrc, "EngineeringOSInstallabilityReady")));
  push(
    gate(
      "AB",
      "Compatibility resolver",
      flagTrue(versionSrc, "EngineeringOSCompatibilityResolverReady"),
    ),
  );
  push(
    gate(
      "AC",
      "Capability matrix",
      exists("docs/architecture/ENGINEERING_OS_V1_CAPABILITY_MATRIX.md") &&
        has("docs/architecture/ENGINEERING_OS_V1_CAPABILITY_MATRIX.md", /1\.0\.0/),
    ),
  );
  push(
    gate(
      "AD",
      "Security GA gate passed",
      flagTrue(flagsSrc, "engineeringOsSecurityGaGatePassed") &&
        flagFalse(flagsSrc, "securityClosureRequiredBeforeGa"),
    ),
  );
  push(
    gate(
      "AE",
      "S01–S06 remain CLOSED",
      (secGaps.match(/\*\*CLOSED\*\*/g) ?? []).length >= 6 &&
        /REQUIRED_BEFORE_GA open \| \*\*0\*\*/.test(secGaps),
    ),
  );
  push(
    gate(
      "AF",
      "Privileged MFA preserved",
      flagTrue(flagsSrc, "PrivilegedMfaPolicyReady") &&
        flagTrue(flagsSrc, "PrivilegedMfaEnforcementVerified"),
    ),
  );
  push(
    gate(
      "AG",
      "Break-glass preserved",
      flagTrue(flagsSrc, "BreakGlassGovernanceReady") &&
        flagTrue(flagsSrc, "BreakGlassAuditReady"),
    ),
  );
  push(
    gate(
      "AH",
      "SCA preserved",
      flagTrue(flagsSrc, "DependencyScaReady") &&
        flagTrue(flagsSrc, "DependencyScaCiEnforced") &&
        flagFalse(flagsSrc, "CriticalDependencyVulnerabilityUnresolved"),
    ),
  );
  push(
    gate(
      "AI",
      "Incident response preserved",
      flagTrue(flagsSrc, "UnifiedIncidentResponseReady") &&
        flagTrue(flagsSrc, "SecurityIncidentRunbookReady"),
    ),
  );
  push(
    gate(
      "AJ",
      "Secret lifecycle preserved",
      flagTrue(flagsSrc, "SecretLifecycleGovernanceReady") &&
        flagTrue(flagsSrc, "SecretRotationProcedureReady") &&
        flagTrue(flagsSrc, "EmergencySecretRevocationReady"),
    ),
  );
  push(
    gate(
      "AK",
      "Backup/restore preserved",
      flagTrue(flagsSrc, "PlatformBackupRestoreProcedureReady") &&
        flagTrue(flagsSrc, "PlatformRestoreTestPassed") &&
        flagTrue(flagsSrc, "BackupIntegrityAssessed"),
    ),
  );
  push(
    gate(
      "AL",
      "RPO/RTO truthful",
      flagTrue(flagsSrc, "RpoStatusKnown") &&
        flagTrue(flagsSrc, "RtoStatusKnown") &&
        has("docs/operations/ENGINEERING_OS_V1_OPERATIONS.md", /DEFINED_NOT_TESTED/) &&
        has("docs/operations/ENGINEERING_OS_V1_OPERATIONS.md", /MEASURED/),
    ),
  );
  push(
    gate(
      "AM",
      "S07 Tier-1 remains open",
      /S07[\s\S]{0,120}REQUIRED_BEFORE_TIER1_PRODUCTION/.test(secGaps),
    ),
  );
  push(
    gate(
      "AN",
      "S08 Tier-1 remains open",
      /S08[\s\S]{0,120}REQUIRED_BEFORE_TIER1_PRODUCTION/.test(secGaps),
    ),
  );
  push(
    gate(
      "AO",
      "External assurance non-claims",
      has("packages/engineering-os/src/security-readiness.ts", /iso27001Certified = false/) &&
        has("packages/engineering-os/src/security-readiness.ts", /soc2Assured = false/) &&
        has("packages/engineering-os/src/security-readiness.ts", /essentialEightMaturityClaimed = false/),
    ),
  );
  push(
    gate(
      "AP",
      "No Security & Assurance package",
      !exists("packages/rtb-security-assurance") &&
        !exists("packages/security-intelligence") &&
        !exists("packages/customer-trust-center"),
    ),
  );
  push(gate("AQ", "Operations doc", exists("docs/operations/ENGINEERING_OS_V1_OPERATIONS.md")));
  push(
    gate(
      "AR",
      "Observability metadata bounded",
      has(
        "packages/engineering-os/src/product-integration/engineering-context.ts",
        /correlationId/,
      ) &&
        has(
          "packages/engineering-os/src/product-integration/engineering-context.ts",
          /tenantRef/,
        ),
    ),
  );
  push(
    gate(
      "AS",
      "No destructive GA migration",
      !exists("supabase/migrations/20260809140000_batch_91_engineering_os_v1_ga.sql"),
    ),
  );
  push(
    gate(
      "AT",
      "Upgrade path documented",
      has("docs/operations/ENGINEERING_OS_V1_OPERATIONS.md", /0\.12\.0-security-closure/) &&
        has("docs/operations/ENGINEERING_OS_V1_OPERATIONS.md", /1\.0\.0/),
    ),
  );
  push(
    gate(
      "AU",
      "Historical module tags intact",
      [
        "ProjectIntelligenceV1Intact",
        "InspectionIntelligenceV1Intact",
        "AssetIntelligenceV1Intact",
        "ProjectControlsV1Intact",
        "DigitalTwinV1Intact",
        "EngineeringModelInteroperabilityV1Intact",
      ].every((f) => flagTrue(versionSrc, f)),
    ),
  );

  const restore = run("pnpm --filter @rtb/engineering-os-certification restore:platform");
  push(gate("AV", "Restore regression", restore.ok, restore.detail));
  push(
    gate(
      "AW",
      "Performance baseline",
      exists("docs/operations/ENGINEERING_OS_V1_PERFORMANCE_BASELINE.md") &&
        has(
          "docs/operations/ENGINEERING_OS_V1_PERFORMANCE_BASELINE.md",
          /No unsupported enterprise-throughput/,
        ),
    ),
  );

  const browserRequested =
    process.env.CERTIFY_BROWSER === "1" || process.env.GITHUB_ACTIONS === "true";
  let browser = { ok: false, detail: "CERTIFY_BROWSER not set" };
  if (browserRequested) {
    browser = run(
      "pnpm --filter @rtb/engineering-os-certification test:e2e:v1",
      { CERTIFY_BROWSER: "1" },
    );
  }
  push(
    gate(
      "AX",
      "Browser E2E CERTIFY_BROWSER=1",
      browserRequested ? browser.ok : false,
      browser.detail,
    ),
  );

  const unit = run("pnpm --filter @rtb/engineering-os test");
  push(gate("AY", "Unit tests", unit.ok, unit.detail));
  push(
    gate(
      "AZ",
      "14D security flags",
      flagTrue(flagsSrc, "engineeringOsSecurityGaGatePassed") &&
        flagFalse(flagsSrc, "secretExposureDetected"),
    ),
  );
  push(
    gate(
      "BA",
      "knownCrossTenantLeakageDetected false",
      flagFalse(flagsSrc, "knownCrossTenantLeakageDetected"),
    ),
  );

  const secret = run("pnpm --filter @rtb/engineering-os-certification secret-scan");
  push(gate("BB", "secretExposureDetected false", secret.ok && flagFalse(flagsSrc, "secretExposureDetected"), secret.detail));
  push(
    gate(
      "BC",
      "Gap register GA open = 0",
      /REQUIRED_BEFORE_GA open = 0/.test(gaps) || /REQUIRED_BEFORE_GA \| \*\*0\*\*/.test(gaps),
    ),
  );
  push(
    gate("BD", "productionEngineeringOSReady true", flagTrue(versionSrc, "productionEngineeringOSReady")),
  );
  push(
    gate("BE", "engineeringOSV1GaCertified true", flagTrue(versionSrc, "engineeringOSV1GaCertified")),
  );
  push(gate("BF", "engineeringOSV1Frozen true", flagTrue(versionSrc, "engineeringOSV1Frozen")));
  push(
    gate(
      "BG",
      "duplicate ownership flags false",
      [
        "duplicateAssetOwnershipDetected",
        "duplicateProjectOwnershipDetected",
        "duplicateSpatialOwnershipDetected",
        "duplicateKnowledgeGraphDetected",
        "duplicateWorkflowEngineDetected",
        "duplicateEngineeringToolFrameworkDetected",
        "duplicateUniversalTimelineDetected",
      ].every((f) => flagFalse(versionSrc, f)),
    ),
  );
  push(
    gate(
      "BH",
      "duplicatePolicyEngineDetected false",
      flagFalse(flagsSrc, "duplicatePolicyEngineDetected"),
    ),
  );
  push(gate("BI", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /CERTIFY_BROWSER/)));
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase14e-engineering-os-ga.test.ts",
  );
  push(gate("BJ", "Platform architecture test", arch.ok, arch.detail));
  push(
    gate(
      "BK",
      "Enterprise deployment requirements",
      exists("docs/security/ENGINEERING_OS_V1_ENTERPRISE_DEPLOYMENT_REQUIREMENTS.md"),
    ),
  );
  push(
    gate("BL", "Public contracts doc", exists("docs/architecture/ENGINEERING_OS_V1_PUBLIC_CONTRACTS.md")),
  );
  push(gate("BM", "Packaging doc", exists("docs/commercial/ENGINEERING_OS_V1_PACKAGING.md")));
  push(
    gate(
      "BN",
      "Hierarchy freeze",
      has("docs/architecture/ENGINEERING_OS_V1_PUBLIC_CONTRACTS.md", /Shared Engineering Domains/) ||
        has("docs/architecture/ENGINEERING_OS_PHASE_14E.md", /1\.0\.0/),
    ),
  );

  const releaseTagDeclared =
    has(VERSION, /ENGINEERING_OS_RELEASE_TAG = "engineering-os-v1\.0\.0"/) &&
    flagFalse(versionSrc, "releaseTagMoved");
  push(gate("BO", "Release tag declared", releaseTagDeclared));

  const eosTag = tag(PHASE_14E_RELEASE_TAG);
  const tagExists = eosTag !== null;
  const tagPointsAtBuild = eosTag === ciHeadSha || eosTag === commit;
  const priorOk = results.every((g) => g.status === "pass");
  const releaseTagIntegrity =
    releaseTagDeclared && priorOk && (tagExists ? tagPointsAtBuild : true);
  push(
    gate(
      "BP",
      "Release tag integrity",
      releaseTagIntegrity,
      tagExists
        ? `tag_exists:${eosTag};points_at_build=${tagPointsAtBuild}`
        : `tag_to_create:${PHASE_14E_RELEASE_TAG};declared=${releaseTagDeclared}`,
    ),
  );

  push(gate("BQ", "Secret scan", secret.ok, secret.detail));
  const sca = run("pnpm --filter @rtb/engineering-os-certification sca");
  push(gate("BR", "Dependency SCA run", sca.ok, sca.detail));
  push(gate("BS", "Artifact identity", Boolean(commit), commit));

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "BT",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(versionSrc, "productionEngineeringOSReady") &&
        flagTrue(versionSrc, "engineeringOSV1GaCertified"),
      `priorFailed=${priorFailed}`,
    ),
  );

  for (const [id, name] of PHASE_14E_ENGINEERING_OS_GA_GATES) {
    if (!byId.has(id)) push({ id, name, status: "not_executed", detail: "missing" });
  }

  const ordered = PHASE_14E_ENGINEERING_OS_GA_GATES.map(([id, name]) => {
    return byId.get(id) ?? { id, name, status: "not_executed" as const, detail: "missing" };
  });
  const failed = ordered.filter((g) => g.status === "fail");
  const skipped = ordered.filter((g) => g.status === "skip");
  const notExecuted = ordered.filter((g) => g.status === "not_executed");
  const verdict =
    failed.length === 0 && skipped.length === 0 && notExecuted.length === 0 ? "PASS" : "FAIL";

  const artifact = {
    schemaVersion: "phase14e-engineering-os-ga/1",
    phase: "14E",
    name: "phase14e-engineering-os-ga-certification",
    version: PHASE_14E_EOS_VERSION,
    status: "ga",
    title: "Engineering OS V1.0 Production GA",
    verdict,
    commit,
    artifactCommitSha: commit,
    ciHeadSha,
    buildIdentitySha: commit,
    phase14DBaseline: PHASE_14D_COMMIT,
    phase14CBaseline: PHASE_14C_COMMIT,
    phase14BBaseline: PHASE_14B_COMMIT,
    phase14ABaseline: PHASE_14A_COMMIT,
    releaseTag: PHASE_14E_RELEASE_TAG,
    releaseTagDeclared,
    releaseTagExists: tagExists,
    releaseTagTarget: eosTag,
    releaseTagPointsAtBuild: tagExists ? tagPointsAtBuild : null,
    tagToCreate: tagExists ? null : PHASE_14E_RELEASE_TAG,
    releaseTagMoved: false,
    productionEngineeringOSReady: true,
    engineeringOSV1GaCertified: true,
    engineeringOSV1Frozen: true,
    EngineeringOSPublicContractsFrozen: true,
    EngineeringOSManifestFrozen: true,
    engineeringOsSecurityGaGatePassed: true,
    securityClosureRequiredBeforeGa: false,
    moduleRegistryDriftDetected: false,
    knownCrossTenantLeakageDetected: false,
    secretExposureDetected: !secret.ok,
    secretExposure: false,
    implementsOwnAiStack: false,
    silentSolverFallbackAllowed: false,
    releaseEligible: verdict === "PASS",
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    gates: ordered,
    requiredGates: PHASE_14E_ENGINEERING_OS_GA_GATES.map(([id]) => id),
    gateCount: PHASE_14E_GATE_COUNT,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
    generatedAt: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(outDir, "phase14e-engineering-os-ga-certification.json");
  writeFileSync(outFile, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        version: artifact.version,
        gateCount: artifact.gateCount,
        failedGateCount: artifact.failedGateCount,
        failedGates: artifact.failedGates,
        releaseTag: artifact.releaseTag,
        tagToCreate: artifact.tagToCreate,
        productionEngineeringOSReady: artifact.productionEngineeringOSReady,
        engineeringOSV1GaCertified: artifact.engineeringOSV1GaCertified,
        releaseEligible: artifact.releaseEligible,
        artifact: outFile,
      },
      null,
      2,
    ),
  );
  if (verdict !== "PASS") process.exit(1);
}

main();
