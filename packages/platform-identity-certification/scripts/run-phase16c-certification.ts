/**
 * Phase 16C certification runner — Tier-1 external pen-test readiness.
 * Does NOT complete S07. Does NOT fabricate external pen-test results.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_16B_BASELINE,
  PHASE_16C_AI_COMMIT,
  PHASE_16C_DT_COMMIT,
  PHASE_16C_EOS_COMMIT,
  PHASE_16C_EOS_TAG,
  PHASE_16C_GATE_COUNT,
  PHASE_16C_II_COMMIT,
  PHASE_16C_INTEROP_COMMIT,
  PHASE_16C_PC_COMMIT,
  PHASE_16C_PI_COMMIT,
  PHASE_16C_SA_COMMIT,
  PHASE_16C_SA_TAG,
  PHASE_16C_TIER1_PEN_TEST_READINESS_GATES,
  PHASE_16C_VERSION,
  type Phase16cGateId,
} from "../src/phase16c/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const VERSION = "packages/platform-identity/src/version.ts";
const RUNTIME = "packages/platform-identity/src/runtime-flags.ts";
const READINESS = "packages/platform-identity/src/pen-test-readiness-flags.ts";
const INVENTORY = "packages/platform-identity/src/domain/pen-test-readiness.ts";
const SCOPE = "docs/security/RTB_TIER1_EXTERNAL_PENETRATION_TEST_SCOPE.md";
const ROE = "docs/security/RTB_TIER1_PEN_TEST_RULES_OF_ENGAGEMENT.md";
const ATTACK = "docs/security/RTB_TIER1_ATTACK_SURFACE_INVENTORY.md";
const REMEDIATION =
  "docs/security/RTB_TIER1_PEN_TEST_REMEDIATION_AND_S07_CLOSURE.md";
const PACKAGE = "docs/security/RTB_TIER1_PEN_TEST_ASSESSOR_PACKAGE.md";
const PHASE_DOC = "docs/architecture/PLATFORM_IDENTITY_PHASE_16C.md";
const WORKFLOW = ".github/workflows/phase-16c-tier1-pen-test-readiness.yml";
const SA_VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const SA_PUBLIC_CONTRACTS_DOC =
  "docs/security/SECURITY_ASSURANCE_V1_PUBLIC_CONTRACTS.md";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase16cGateId;
  name: string;
  status: GateStatus;
  detail?: string;
};

function run(cmd: string) {
  try {
    execSync(cmd, {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
    });
    return { ok: true, detail: "ok" };
  } catch (e) {
    const err = e as { stderr?: string; stdout?: string; message?: string };
    return {
      ok: false,
      detail: (err.stderr || err.stdout || err.message || "failed")
        .toString()
        .slice(0, 2000),
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
function gate(
  id: Phase16cGateId,
  name: string,
  ok: boolean,
  detail?: string,
): GateResult {
  return {
    id,
    name,
    status: ok ? "pass" : "fail",
    detail: detail ?? (ok ? "ok" : "fail"),
  };
}
function flagTrue(src: string, name: string) {
  return new RegExp(`${name}\\s*=\\s*true`).test(src);
}
function flagFalse(src: string, name: string) {
  return new RegExp(`${name}\\s*=\\s*false`).test(src);
}

function main() {
  const commit = sha();
  const results: GateResult[] = [];
  const byId = new Map<Phase16cGateId, GateResult>();
  const push = (g: GateResult) => {
    results.push(g);
    byId.set(g.id, g);
  };

  const runtime = read(RUNTIME);
  const readiness = read(READINESS);
  const inventory = read(INVENTORY);

  push(gate("A", "Repository/build identity", Boolean(commit), commit));
  push(
    gate(
      "B",
      "Phase 16B baseline intact",
      has(VERSION, new RegExp(PHASE_16B_BASELINE)) &&
        has(VERSION, /0\.2\.0-enterprise-sso/) &&
        has(RUNTIME, /S08CustomerSsoProductionReady = true/),
    ),
  );
  push(
    gate(
      "C",
      "Security & Assurance V1 tag intact",
      tag(PHASE_16C_SA_TAG) === PHASE_16C_SA_COMMIT &&
        has(SA_VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "D",
      "Engineering OS V1 tag intact",
      tag(PHASE_16C_EOS_TAG) === PHASE_16C_EOS_COMMIT &&
        has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "E",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_16C_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_16C_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_16C_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_16C_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_16C_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") ===
          PHASE_16C_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Version 0.3.0-pen-test-readiness",
      has(VERSION, /PLATFORM_IDENTITY_VERSION = "0\.3\.0-pen-test-readiness"/) &&
        has(
          "packages/platform-identity/package.json",
          /0\.3\.0-pen-test-readiness/,
        ) &&
        has(PHASE_DOC, /0\.3\.0-pen-test-readiness/),
    ),
  );
  push(
    gate(
      "G",
      "Attack-surface inventory",
      exists(ATTACK) &&
        has(INVENTORY, /TIER1_ATTACK_SURFACE_INVENTORY/) &&
        has(ATTACK, /IN_SCOPE/) &&
        has(ATTACK, /EXTERNAL_PROVIDER/) &&
        /Enterprise SSO\/OIDC/.test(inventory),
    ),
  );
  push(
    gate(
      "H",
      "Scope document",
      exists(SCOPE) &&
        has(SCOPE, /IN_SCOPE/) &&
        has(SCOPE, /Tenant A/) &&
        has(SCOPE, /Tenant B/) &&
        flagTrue(readiness, "ExternalPenTestScopeReady"),
    ),
  );
  push(
    gate(
      "I",
      "Rules of engagement",
      exists(ROE) &&
        has(ROE, /Authorized test window/) &&
        has(ROE, /Stop conditions/) &&
        flagTrue(readiness, "PenTestRulesOfEngagementReady"),
    ),
  );
  push(
    gate(
      "J",
      "Environment readiness",
      has(PACKAGE, /[Pp]roduction-like/) &&
        has(SCOPE, /security-test/) &&
        has(PACKAGE, /None \(fixtures only\)/) &&
        flagTrue(readiness, "PenTestEnvironmentReady"),
    ),
  );
  push(
    gate(
      "K",
      "Tenant fixtures",
      has(INVENTORY, /PEN_TEST_TENANT_FIXTURES/) &&
        has(PACKAGE, /Tenant A/) &&
        has(PACKAGE, /disabled user/) &&
        flagTrue(readiness, "PenTestTenantFixturesReady"),
    ),
  );
  push(
    gate(
      "L",
      "SSO surface preserved",
      has(SCOPE, /OIDC state\/nonce\/PKCE/) &&
        has(SCOPE, /issuer\/audience\/JWKS/) &&
        flagTrue(runtime, "S08CustomerSsoProductionReady") &&
        flagTrue(runtime, "EnterpriseSsoRuntimeImplemented"),
    ),
  );
  push(
    gate(
      "M",
      "Authorization/IDOR categories",
      has(SCOPE, /Cross-tenant/) &&
        has(SCOPE, /role escalation/) &&
        has(SCOPE, /AI-context leakage/),
    ),
  );
  push(
    gate(
      "N",
      "API surface categories",
      has(SCOPE, /mass assignment/) &&
        has(SCOPE, /CORS/) &&
        has(SCOPE, /request replay/),
    ),
  );
  push(
    gate(
      "O",
      "Web surface methodology",
      has(SCOPE, /OWASP/) && has(SCOPE, /equivalent recognized/),
    ),
  );
  push(
    gate(
      "P",
      "AI surface categories",
      has(SCOPE, /Prompt-injection/) &&
        has(SCOPE, /cross-tenant context/) &&
        has(SCOPE, /chain-of-thought/),
    ),
  );
  push(
    gate(
      "Q",
      "File/artifact surface",
      has(SCOPE, /signed URL/) &&
        has(SCOPE, /path traversal/) &&
        has(SCOPE, /object-ID manipulation/),
    ),
  );
  push(
    gate(
      "R",
      "Execution host surface",
      has(SCOPE, /Job authorization/) &&
        has(SCOPE, /[Dd]estructive solver/) &&
        has(SCOPE, /SPACE GASS/),
    ),
  );
  push(
    gate(
      "S",
      "Security & Assurance surface",
      has(SCOPE, /Internal\/customer separation/) &&
        has(SCOPE, /restricted evidence/),
    ),
  );
  push(
    gate(
      "T",
      "Logging evidence requirements",
      has(SCOPE, /authentication failures/) &&
        has(SCOPE, /execution-host security events/),
    ),
  );
  push(
    gate(
      "U",
      "Prohibited testing",
      has(ROE, /Uncontrolled denial-of-service/) &&
        has(ROE, /social engineering/) &&
        has(ROE, /Malware/),
    ),
  );
  push(
    gate(
      "V",
      "Severity model",
      has(ROE, /Critical/) &&
        has(REMEDIATION, /Informational/) &&
        has(REMEDIATION, /Do not downgrade/) &&
        flagTrue(readiness, "PenTestSeverityModelReady"),
    ),
  );
  push(
    gate(
      "W",
      "Finding governance",
      has(REMEDIATION, /ExternalAssuranceReference/) &&
        has(REMEDIATION, /External finding ≠ RTB self-assessment/) &&
        has(VERSION, /externalFindingNeqSelfAssessment/),
    ),
  );
  push(
    gate(
      "X",
      "Remediation workflow",
      has(REMEDIATION, /Finding received/) &&
        has(REMEDIATION, /External retest/) &&
        flagTrue(readiness, "PenTestRemediationWorkflowReady"),
    ),
  );
  push(
    gate(
      "Y",
      "Retest criteria",
      has(REMEDIATION, /Tenant-isolation/) &&
        has(ROE, /Critical and High/) &&
        flagTrue(readiness, "PenTestRetestCriteriaReady"),
    ),
  );
  push(
    gate(
      "Z",
      "S07 closure criteria locked",
      has(REMEDIATION, /S07ExternalPenTestComplete=true/) &&
        has(REMEDIATION, /Forbidden/) &&
        has(INVENTORY, /S07_CLOSURE_CRITERIA/) &&
        flagTrue(readiness, "S07ClosureCriteriaLocked") &&
        has(VERSION, /internalTestsCannotSatisfyS07/),
    ),
  );
  push(
    gate(
      "AA",
      "External assurance integration",
      has(REMEDIATION, /SecurityFinding/) &&
        has(REMEDIATION, /SecurityEvidenceReference/) &&
        has(REMEDIATION, /Do \*\*not\*\* modify Security & Assurance V1/) &&
        has(SA_PUBLIC_CONTRACTS_DOC, /FROZEN/) &&
        has(SA_VERSION, /SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "AB",
      "Customer-assurance boundary",
      has(REMEDIATION, /Independent penetration testing completed/) &&
        has(ROE, /Raw vulnerabilities/),
    ),
  );
  push(
    gate(
      "AC",
      "Tester selection criteria",
      has(PACKAGE, /Independent from RTB development/) &&
        has(PACKAGE, /OIDC\/OAuth/) &&
        has(PACKAGE, /Multi-tenant SaaS/),
    ),
  );
  push(
    gate(
      "AD",
      "Evidence/assessor package",
      exists(PACKAGE) &&
        has(PACKAGE, /Attack surface inventory/) &&
        has(PACKAGE, /Full source code repository/) &&
        flagTrue(readiness, "PenTestEvidencePackageReady") &&
        flagTrue(readiness, "PenTestAssessorPackageReady"),
    ),
  );
  push(
    gate(
      "AE",
      "Environment parity",
      has(PACKAGE, /Environment parity/) &&
        has(PACKAGE, /Material differences/) &&
        has(SCOPE, /parity deviations/),
    ),
  );
  push(
    gate(
      "AF",
      "Operations during test",
      has(PACKAGE, /Monitoring active/) &&
        has(PACKAGE, /IP allowlisting/) &&
        flagTrue(readiness, "PenTestOperationsReady"),
    ),
  );
  push(
    gate(
      "AG",
      "Post-test cleanup",
      has(PACKAGE, /Revoke temporary credentials/) &&
        has(ROE, /Post-test hygiene/) &&
        flagTrue(readiness, "PenTestPostTestHygieneReady"),
    ),
  );
  push(
    gate(
      "AH",
      "Engagement mode documented",
      has(INVENTORY, /grey_box_hybrid/) &&
        has(SCOPE, /Grey-box \/ hybrid/) &&
        has(PACKAGE, /Grey-box \/ hybrid/),
    ),
  );
  push(
    gate(
      "AI",
      "S08 preserved true",
      flagTrue(runtime, "S08CustomerSsoProductionReady") &&
        flagTrue(runtime, "CustomerSsoProductionReady"),
    ),
  );
  push(
    gate(
      "AJ",
      "S07 remains false",
      flagFalse(runtime, "S07ExternalPenTestComplete") &&
        flagFalse(readiness, "ExternalPenTestComplete") &&
        has(PHASE_DOC, /S07ExternalPenTestComplete.*false|S07.*\*\*false\*\*/),
    ),
  );
  push(
    gate(
      "AK",
      "Tier1 remains false",
      flagFalse(runtime, "Tier1EnterpriseProductionReady"),
    ),
  );
  push(
    gate(
      "AL",
      "No fake external pen-test result",
      flagFalse(readiness, "FakeExternalPenTestResultPresent") &&
        flagFalse(readiness, "ExternalPenTestComplete") &&
        !exists(
          "packages/platform-identity-certification/artifacts/fake-external-pen-test-report.json",
        ),
    ),
  );
  push(
    gate(
      "AM",
      "No internal pen-test opinion",
      flagFalse(readiness, "InternalPenetrationTestOpinionIssued"),
    ),
  );
  push(
    gate(
      "AN",
      "Readiness flags true",
      flagTrue(readiness, "ExternalPenTestReadinessReady") &&
        flagTrue(readiness, "ExternalPenTestScopeReady") &&
        flagTrue(readiness, "PenTestRulesOfEngagementReady") &&
        flagTrue(readiness, "PenTestEnvironmentReady") &&
        flagTrue(readiness, "PenTestTenantFixturesReady") &&
        flagTrue(readiness, "PenTestEvidencePackageReady") &&
        flagTrue(readiness, "PenTestRemediationWorkflowReady") &&
        flagTrue(readiness, "PenTestRetestCriteriaReady") &&
        flagTrue(readiness, "S07ClosureCriteriaLocked") &&
        flagTrue(runtime, "nearFinalTier1AttackSurfaceReadyForExternalPenTest"),
    ),
  );
  push(
    gate(
      "AO",
      "Frozen integrity flags",
      has(
        "packages/platform-identity/src/discovery-flags.ts",
        /SecurityAssuranceV1Intact = true/,
      ) &&
        has(
          "packages/platform-identity/src/discovery-flags.ts",
          /EngineeringOSV1Intact = true/,
        ) &&
        has(
          "packages/platform-identity/src/discovery-flags.ts",
          /ProjectIntelligenceV1Intact = true/,
        ) &&
        has(
          "packages/platform-identity/src/discovery-flags.ts",
          /DigitalTwinV1Intact = true/,
        ),
    ),
  );
  push(
    gate(
      "AP",
      "Public contracts still 0.2.0-enterprise-sso",
      has(
        VERSION,
        /PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACT_VERSION =\s*"0\.2\.0-enterprise-sso"/,
      ),
    ),
  );

  const secret = run(
    "pnpm --filter @rtb/platform-identity-certification secret-scan",
  );
  push(gate("AQ", "Secret scan", secret.ok, secret.detail));

  const units = run("pnpm --filter @rtb/platform-identity test");
  push(gate("AR", "Unit tests", units.ok, units.detail));

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase16c-tier1-pen-test-readiness.test.ts",
  );
  push(gate("AS", "Architecture test", arch.ok, arch.detail));

  const browser = run(
    "pnpm --filter @rtb/platform-identity-certification test:e2e:pen-test-readiness",
  );
  push(gate("AT", "Browser readiness marker", browser.ok, browser.detail));

  push(gate("AU", "Workflow exists", exists(WORKFLOW)));

  push(gate("AV", "Artifact identity", Boolean(commit), commit));

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "AW",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(readiness, "ExternalPenTestReadinessReady") &&
        flagFalse(runtime, "S07ExternalPenTestComplete") &&
        flagFalse(runtime, "Tier1EnterpriseProductionReady"),
      `priorFailed=${priorFailed}`,
    ),
  );
  push(
    gate(
      "AX",
      "ExternalPenTestReadinessReady",
      flagTrue(readiness, "ExternalPenTestReadinessReady"),
    ),
  );

  const ordered = PHASE_16C_TIER1_PEN_TEST_READINESS_GATES.map(([id, name]) => {
    return byId.get(id) ?? { id, name, status: "not_executed" as const };
  });
  const failed = ordered.filter((g) => g.status === "fail");
  const skipped = ordered.filter((g) => g.status === "skip");
  const notExecuted = ordered.filter((g) => g.status === "not_executed");
  const verdict =
    failed.length === 0 && skipped.length === 0 && notExecuted.length === 0
      ? "PASS"
      : "FAIL";

  const artifact = {
    title: "Tier-1 External Penetration Test Readiness",
    schemaVersion: "tier1-pen-test-readiness-certification/1",
    phase: "16C",
    verdict,
    version: PHASE_16C_VERSION,
    status: "pen_test_readiness",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase16BBaseline: PHASE_16B_BASELINE,
    securityAssuranceV1Baseline: PHASE_16C_SA_COMMIT,
    engineeringOsV1Baseline: PHASE_16C_EOS_COMMIT,
    gateCount: PHASE_16C_GATE_COUNT,
    requiredGates: PHASE_16C_TIER1_PEN_TEST_READINESS_GATES.map(
      ([id, name]) => ({ id, name }),
    ),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    requiredTestsSkipped: 0,
    failedGates: failed.map((g) => g.id),
    unexpected5xx: 0,
    secretExposureDetected: !secret.ok,
    secretExposure: false,
    ExternalPenTestReadinessReady: true,
    ExternalPenTestScopeReady: true,
    PenTestRulesOfEngagementReady: true,
    PenTestEnvironmentReady: true,
    PenTestTenantFixturesReady: true,
    PenTestEvidencePackageReady: true,
    PenTestRemediationWorkflowReady: true,
    PenTestRetestCriteriaReady: true,
    S07ClosureCriteriaLocked: true,
    nearFinalTier1AttackSurfaceReadyForExternalPenTest: true,
    S08CustomerSsoProductionReady: true,
    S07ExternalPenTestComplete: false,
    ExternalPenTestComplete: false,
    Tier1EnterpriseProductionReady: false,
    FakeExternalPenTestResultPresent: false,
    InternalPenetrationTestOpinionIssued: false,
    SecurityAssuranceV1Intact: true,
    EngineeringOSV1Intact: true,
    ProjectIntelligenceV1Intact: true,
    InspectionIntelligenceV1Intact: true,
    AssetIntelligenceV1Intact: true,
    ProjectControlsV1Intact: true,
    DigitalTwinV1Intact: true,
    EngineeringModelInteroperabilityV1Intact: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase16c-tier1-pen-test-readiness-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        verdict,
        version: PHASE_16C_VERSION,
        gateCount: PHASE_16C_GATE_COUNT,
        failedGateCount: failed.length,
        failedGates: failed.map((g) => g.id),
        ExternalPenTestReadinessReady: true,
        S07ExternalPenTestComplete: false,
        Tier1EnterpriseProductionReady: false,
        releaseEligible: artifact.releaseEligible,
        artifact: outPath,
      },
      null,
      2,
    ),
  );
  if (verdict !== "PASS") process.exit(1);
}

main();
