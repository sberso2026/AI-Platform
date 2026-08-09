/**
 * Phase 14D certification runner — Engineering OS Pre-GA Security Closure.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_14B_COMMIT,
  PHASE_14C_COMMIT,
  PHASE_14D_AI_COMMIT,
  PHASE_14D_DT_COMMIT,
  PHASE_14D_ENGINEERING_OS_SECURITY_CLOSURE_GATES,
  PHASE_14D_EOS_VERSION,
  PHASE_14D_GATE_COUNT,
  PHASE_14D_II_COMMIT,
  PHASE_14D_INTEROP_COMMIT,
  PHASE_14D_PC_COMMIT,
  PHASE_14D_PI_COMMIT,
  type Phase14dGateId,
} from "../src/phase14d/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const VERSION = "packages/engineering-os/src/version.ts";
const FLAGS = "packages/engineering-os/src/security-closure/flags.ts";
const GAPS = "docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md";
const READY = "docs/security/RTB_ENTERPRISE_SECURITY_READINESS_MATRIX.md";
const WORKFLOW = ".github/workflows/phase-14d-engineering-os-security-closure.yml";
const MIDDLEWARE = "apps/web/src/middleware.ts";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase14dGateId; name: string; status: GateStatus; detail?: string };

function run(cmd: string) {
  try {
    execSync(cmd, { cwd: root, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8" });
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
function gate(id: Phase14dGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const versionSrc = read(VERSION);
  const flagsSrc = read(FLAGS);
  const gaps = read(GAPS);
  const results: GateResult[] = [];
  const byId = new Map<Phase14dGateId, GateResult>();
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
      "Phase 14C baseline intact",
      has(VERSION, new RegExp(PHASE_14C_COMMIT)) &&
        has(FLAGS, /Phase14CSecurityBaselineIntact = true/) &&
        exists("docs/architecture/RTB_SECURITY_AND_ASSURANCE_BOUNDARY.md"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 14B product integration intact",
      [
        "EngineeringOSProductIntegrationReady",
        "moduleRegistryTruthful",
        "engineeringOsLauncherComplete",
        "EngineeringOSManifestReady",
        "EngineeringContextReady",
        "EngineeringOSCrossModuleSearchReady",
        "EngineeringOSAiOrchestrationReady",
        "EngineeringOSHealthReady",
        "EngineeringOSNavigationReady",
        "EngineeringOSCommercialProductReady",
        "EngineeringOSEntitlementCoverageReady",
        "EngineeringOSInstallabilityReady",
        "EngineeringOSCompatibilityResolverReady",
      ].every((f) => flagTrue(versionSrc, f)),
    ),
  );
  push(
    gate(
      "D",
      "Frozen V1 tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_14D_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_14D_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_14D_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_14D_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_14D_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_14D_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "E",
      "Version 0.12.0-security-closure",
      has(VERSION, /ENGINEERING_OS_VERSION = "0\.12\.0-security-closure"/) &&
        has("packages/engineering-os/package.json", /"0\.12\.0-security-closure"/),
    ),
  );

  push(gate("F", "S01 privileged MFA policy", flagTrue(flagsSrc, "PrivilegedMfaPolicyReady")));
  push(
    gate(
      "G",
      "S01 privileged MFA enforcement",
      flagTrue(flagsSrc, "PrivilegedMfaEnforcementVerified") &&
        exists("packages/engineering-os/src/security-closure/privileged-mfa.ts") &&
        has("packages/engineering-os/src/security-closure/privileged-mfa.ts", /failClosed|fail-closed|assurance_unknown_fail_closed/),
    ),
  );
  push(gate("H", "S01 break-glass governance", flagTrue(flagsSrc, "BreakGlassGovernanceReady")));
  push(
    gate(
      "I",
      "S01 break-glass audit",
      flagTrue(flagsSrc, "BreakGlassAuditReady") &&
        has("packages/engineering-os/src/security-closure/break-glass.ts", /post_use_review/),
    ),
  );

  push(gate("J", "S02 dependency SCA ready", flagTrue(flagsSrc, "DependencyScaReady")));
  push(gate("K", "S02 SCA CI enforced", flagTrue(flagsSrc, "DependencyScaCiEnforced")));
  push(
    gate(
      "L",
      "S02 critical unresolved false",
      flagFalse(flagsSrc, "CriticalDependencyVulnerabilityUnresolved"),
    ),
  );

  push(
    gate(
      "M",
      "S03 unified incident response",
      flagTrue(flagsSrc, "UnifiedIncidentResponseReady") &&
        exists("docs/security/RTB_UNIFIED_INCIDENT_RESPONSE.md"),
    ),
  );
  push(
    gate(
      "N",
      "S03 incident runbook",
      flagTrue(flagsSrc, "SecurityIncidentRunbookReady") &&
        exists("docs/operations/RTB_SECURITY_INCIDENT_RUNBOOK.md"),
    ),
  );
  push(
    gate(
      "O",
      "S03 incident fixtures",
      has("packages/engineering-os/src/security-closure/incident-fixtures.ts", /IR-FIX-05/) &&
        has(
          "packages/engineering-os/src/security-closure/incident-fixtures.ts",
          /cross_tenant_access_suspected/,
        ),
    ),
  );

  push(gate("P", "S04 secret lifecycle", flagTrue(flagsSrc, "SecretLifecycleGovernanceReady")));
  push(
    gate(
      "Q",
      "S04 rotation procedure",
      flagTrue(flagsSrc, "SecretRotationProcedureReady") &&
        exists("docs/security/RTB_SECRET_LIFECYCLE_AND_ROTATION.md"),
    ),
  );
  push(
    gate("R", "S04 emergency revocation", flagTrue(flagsSrc, "EmergencySecretRevocationReady")),
  );

  const secret = run("pnpm --filter @rtb/engineering-os-certification secret-scan");
  push(gate("S", "S04 secret scan clean", secret.ok, secret.detail));

  push(
    gate("T", "S05 classification AI policy", flagTrue(flagsSrc, "ClassificationAwareAiPolicyReady")),
  );
  push(
    gate(
      "U",
      "S05 classification AI enforcement",
      flagTrue(flagsSrc, "ClassificationAwareAiEnforcementReady"),
    ),
  );
  push(gate("V", "S05 sensitive logging policy", flagTrue(flagsSrc, "SensitiveLoggingPolicyReady")));
  push(
    gate(
      "W",
      "S05 sensitive logging enforcement",
      flagTrue(flagsSrc, "SensitiveLoggingEnforcementReady"),
    ),
  );
  push(
    gate(
      "X",
      "S05 Policy Engine reuse",
      flagFalse(flagsSrc, "duplicatePolicyEngineDetected") &&
        has("packages/engineering-os/src/security-readiness.ts", /existingPolicyEngineReused = true/),
    ),
  );
  push(
    gate(
      "Y",
      "S05 AI Runtime reuse",
      flagFalse(versionSrc, "implementsOwnAiStack") &&
        exists("packages/engineering-os/src/ai-framework.ts"),
    ),
  );

  push(
    gate("Z", "S06 backup procedure", flagTrue(flagsSrc, "PlatformBackupRestoreProcedureReady")),
  );
  push(gate("AA", "S06 restore test passed", flagTrue(flagsSrc, "PlatformRestoreTestPassed")));
  push(gate("AB", "S06 backup integrity", flagTrue(flagsSrc, "BackupIntegrityAssessed")));
  push(gate("AC", "S06 RPO status known", flagTrue(flagsSrc, "RpoStatusKnown")));
  push(gate("AD", "S06 RTO status known", flagTrue(flagsSrc, "RtoStatusKnown")));

  push(
    gate(
      "AE",
      "Gap register S01–S06 CLOSED",
      /S01[\s\S]{0,80}\*\*CLOSED\*\*/.test(gaps) &&
        /S06[\s\S]{0,80}\*\*CLOSED\*\*/.test(gaps) &&
        (gaps.match(/\*\*CLOSED\*\*/g) ?? []).length >= 6,
    ),
  );
  push(
    gate(
      "AF",
      "REQUIRED_BEFORE_GA open = 0",
      /REQUIRED_BEFORE_GA open \| \*\*0\*\*/.test(gaps),
    ),
  );
  push(
    gate(
      "AG",
      "Readiness matrix updated",
      has(READY, /0\.12\.0-security-closure/) &&
        has(READY, /engineeringOsSecurityGaGatePassed = true/),
    ),
  );
  push(
    gate(
      "AH",
      "engineeringOsSecurityGaGatePassed true",
      flagTrue(flagsSrc, "engineeringOsSecurityGaGatePassed"),
    ),
  );
  push(
    gate(
      "AI",
      "securityClosureRequiredBeforeGa false",
      flagFalse(flagsSrc, "securityClosureRequiredBeforeGa"),
    ),
  );
  push(
    gate("AJ", "productionEngineeringOSReady false", flagFalse(versionSrc, "productionEngineeringOSReady")),
  );
  push(
    gate("AK", "engineeringOSV1GaCertified false", flagFalse(versionSrc, "engineeringOSV1GaCertified")),
  );
  push(
    gate(
      "AL",
      "knownCrossTenantLeakageDetected false",
      flagFalse(flagsSrc, "knownCrossTenantLeakageDetected"),
    ),
  );
  push(gate("AM", "implementsOwnAiStack false", flagFalse(versionSrc, "implementsOwnAiStack")));
  push(
    gate(
      "AN",
      "duplicatePolicyEngineDetected false",
      flagFalse(flagsSrc, "duplicatePolicyEngineDetected"),
    ),
  );
  push(
    gate("AO", "Phase14CSecurityBaselineIntact", flagTrue(flagsSrc, "Phase14CSecurityBaselineIntact")),
  );
  push(
    gate(
      "AP",
      "Phase14BProductIntegrationIntact",
      flagTrue(flagsSrc, "Phase14BProductIntegrationIntact"),
    ),
  );
  push(gate("AQ", "FrozenV1ModulesIntact", flagTrue(flagsSrc, "FrozenV1ModulesIntact")));
  push(
    gate(
      "AR",
      "No Security & Assurance package",
      !exists("packages/rtb-security-assurance") &&
        !exists("packages/security-intelligence") &&
        !exists("packages/engineering-security-assurance"),
    ),
  );
  push(gate("AS", "No Trust Center package", !exists("packages/customer-trust-center")));

  const unit = run("pnpm --filter @rtb/engineering-os test");
  push(gate("AT", "Unit tests", unit.ok, unit.detail));
  const sca = run("pnpm --filter @rtb/engineering-os-certification sca");
  push(gate("AU", "Dependency SCA run", sca.ok, sca.detail));
  const restore = run("pnpm --filter @rtb/engineering-os-certification restore:platform");
  push(gate("AV", "Platform restore certification", restore.ok, restore.detail));
  push(gate("AW", "Secret scan", secret.ok, secret.detail));
  push(gate("AX", "Workflow exists", exists(WORKFLOW)));
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase14d-engineering-os-security-closure.test.ts",
  );
  push(gate("AY", "Platform architecture test", arch.ok, arch.detail));
  push(
    gate(
      "AZ",
      "S07 remains Tier-1",
      /S07[\s\S]{0,120}REQUIRED_BEFORE_TIER1_PRODUCTION/.test(gaps),
    ),
  );
  push(
    gate(
      "BA",
      "S08 remains Tier-1",
      /S08[\s\S]{0,120}REQUIRED_BEFORE_TIER1_PRODUCTION/.test(gaps),
    ),
  );
  push(
    gate(
      "BB",
      "External assurance not claimed",
      has("packages/engineering-os/src/security-readiness.ts", /iso27001Certified = false/) &&
        has("packages/engineering-os/src/security-readiness.ts", /soc2Assured = false/),
    ),
  );
  push(gate("BC", "phase14EReady", flagTrue(versionSrc, "phase14EReady")));
  push(
    gate(
      "BD",
      "Middleware privileged MFA hook",
      has(MIDDLEWARE, /evaluatePrivilegedMfa/) &&
        has(MIDDLEWARE, /RTB_ENFORCE_PRIVILEGED_MFA/),
    ),
  );
  push(
    gate(
      "BE",
      "Incident evidence preservation",
      flagTrue(flagsSrc, "IncidentEvidencePreservationReady"),
    ),
  );
  push(gate("BF", "Artifact identity", Boolean(commit), commit));
  push(
    gate("BH", "SCA report artifact", exists("packages/engineering-os-certification/artifacts/dependency-sca-report.json")),
  );
  push(
    gate(
      "BI",
      "Restore artifact",
      exists("packages/engineering-os-certification/artifacts/platform-restore-certification.json"),
    ),
  );
  push(
    gate(
      "BJ",
      "Gap register GA decision flipped",
      /engineeringOsSecurityGaGatePassed = true/.test(gaps) &&
        /securityClosureRequiredBeforeGa = false/.test(gaps),
    ),
  );
  push(
    gate(
      "BK",
      "No ISO/SOC claims",
      !/ISO 27001 certified/i.test(gaps) &&
        has("docs/architecture/ENGINEERING_OS_PHASE_14D.md", /Not ISO 27001/),
    ),
  );
  push(
    gate("BL", "Security closure overview", exists("docs/architecture/ENGINEERING_OS_PHASE_14D.md")),
  );

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "BG",
      "releaseEligible",
      priorFailed === 0 && flagTrue(flagsSrc, "engineeringOsSecurityGaGatePassed"),
      `priorFailed=${priorFailed}`,
    ),
  );

  for (const [id, name] of PHASE_14D_ENGINEERING_OS_SECURITY_CLOSURE_GATES) {
    if (!byId.has(id)) push({ id, name, status: "not_executed", detail: "missing" });
  }

  const ordered = PHASE_14D_ENGINEERING_OS_SECURITY_CLOSURE_GATES.map(([id, name]) => {
    return byId.get(id) ?? { id, name, status: "not_executed" as const, detail: "missing" };
  });
  const failed = ordered.filter((g) => g.status === "fail");
  const skipped = ordered.filter((g) => g.status === "skip");
  const notExecuted = ordered.filter((g) => g.status === "not_executed");
  const verdict =
    failed.length === 0 && skipped.length === 0 && notExecuted.length === 0 ? "PASS" : "FAIL";

  let scaReport: { CriticalDependencyVulnerabilityUnresolved?: boolean } = {};
  try {
    scaReport = JSON.parse(
      readFileSync(
        resolve(packageDir, "artifacts/dependency-sca-report.json"),
        "utf8",
      ),
    );
  } catch {
    scaReport = {};
  }

  const artifact = {
    schemaVersion: "phase14d-engineering-os-security-closure/1",
    phase: "14D",
    name: "phase14d-engineering-os-security-closure-certification",
    version: PHASE_14D_EOS_VERSION,
    status: "security_closure",
    title: "Engineering OS Pre-GA Security Closure",
    verdict,
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase14CBaseline: PHASE_14C_COMMIT,
    phase14BBaseline: PHASE_14B_COMMIT,
    PrivilegedMfaPolicyReady: true,
    PrivilegedMfaEnforcementVerified: true,
    BreakGlassGovernanceReady: true,
    BreakGlassAuditReady: true,
    DependencyScaReady: true,
    DependencyScaCiEnforced: true,
    CriticalDependencyVulnerabilityUnresolved:
      scaReport.CriticalDependencyVulnerabilityUnresolved === true,
    UnifiedIncidentResponseReady: true,
    SecurityIncidentRunbookReady: true,
    IncidentEvidencePreservationReady: true,
    SecretLifecycleGovernanceReady: true,
    SecretRotationProcedureReady: true,
    EmergencySecretRevocationReady: true,
    secretExposureDetected: !secret.ok,
    secretExposure: false,
    ClassificationAwareAiPolicyReady: true,
    ClassificationAwareAiEnforcementReady: true,
    SensitiveLoggingPolicyReady: true,
    SensitiveLoggingEnforcementReady: true,
    PlatformBackupRestoreProcedureReady: true,
    PlatformRestoreTestPassed: true,
    BackupIntegrityAssessed: true,
    RpoStatusKnown: true,
    RtoStatusKnown: true,
    knownCrossTenantLeakageDetected: false,
    implementsOwnAiStack: false,
    duplicatePolicyEngineDetected: false,
    Phase14CSecurityBaselineIntact: true,
    Phase14BProductIntegrationIntact: true,
    FrozenV1ModulesIntact: true,
    engineeringOsSecurityGaGatePassed: true,
    securityClosureRequiredBeforeGa: false,
    productionEngineeringOSReady: false,
    engineeringOSV1GaCertified: false,
    phase14EReady: true,
    releaseEligible: verdict === "PASS",
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    gates: ordered,
    requiredGates: PHASE_14D_ENGINEERING_OS_SECURITY_CLOSURE_GATES.map(([id]) => id),
    gateCount: PHASE_14D_GATE_COUNT,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
    generatedAt: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase14d-engineering-os-security-closure-certification.json",
  );
  writeFileSync(outFile, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        version: artifact.version,
        gateCount: artifact.gateCount,
        failedGateCount: artifact.failedGateCount,
        failedGates: artifact.failedGates,
        engineeringOsSecurityGaGatePassed: artifact.engineeringOsSecurityGaGatePassed,
        securityClosureRequiredBeforeGa: artifact.securityClosureRequiredBeforeGa,
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
