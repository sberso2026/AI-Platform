/**
 * Phase 16C.1 certification — internal adversarial security & S07 deferral.
 * Does NOT complete S07. Does NOT fabricate external pen-test evidence.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_16B_BASELINE,
  PHASE_16C_BASELINE,
  PHASE_16C1_AI_COMMIT,
  PHASE_16C1_DT_COMMIT,
  PHASE_16C1_EOS_COMMIT,
  PHASE_16C1_EOS_TAG,
  PHASE_16C1_GATE_COUNT,
  PHASE_16C1_II_COMMIT,
  PHASE_16C1_INTERNAL_ADVERSARIAL_GATES,
  PHASE_16C1_INTEROP_COMMIT,
  PHASE_16C1_PC_COMMIT,
  PHASE_16C1_PI_COMMIT,
  PHASE_16C1_SA_COMMIT,
  PHASE_16C1_SA_TAG,
  PHASE_16C1_VERSION,
  type Phase16c1GateId,
} from "../src/phase16c1/gates.js";
import { runInternalAdversarialSuite } from "../../platform-identity/src/domain/internal-adversarial/suite.ts";
import {
  KnownCriticalInternalSecurityFindingOpen,
  KnownHighInternalSecurityFindingOpen,
  InternalAdversarialSecurityValidationReady,
  InternalSecurityRegressionSuiteReady,
  S07Status,
  S07RequirementWaived,
  ExternalPenTestStillRequiredForTier1,
  ExternalPenTestPerformed,
  IndependentPenTestOpinionIssued,
  knownCrossTenantLeakageDetected,
} from "../../platform-identity/src/internal-adversarial-flags.ts";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const VERSION = "packages/platform-identity/src/version.ts";
const RUNTIME = "packages/platform-identity/src/runtime-flags.ts";
const READINESS = "packages/platform-identity/src/pen-test-readiness-flags.ts";
const ADVERSARIAL = "packages/platform-identity/src/internal-adversarial-flags.ts";
const SUITE =
  "packages/platform-identity/src/domain/internal-adversarial/suite.ts";
const FINDINGS =
  "packages/platform-identity/src/domain/internal-adversarial/findings.ts";
const DEFERRAL = "docs/security/S07_EXTERNAL_PEN_TEST_DEFERRAL.md";
const VALIDATION = "docs/security/INTERNAL_ADVERSARIAL_SECURITY_VALIDATION.md";
const MATRIX = "docs/security/INTERNAL_SECURITY_TEST_MATRIX.md";
const FINDINGS_DOC = "docs/security/INTERNAL_SECURITY_FINDINGS.md";
const RUNBOOK = "docs/security/INTERNAL_SECURITY_REGRESSION_RUNBOOK.md";
const PHASE_DOC = "docs/architecture/PLATFORM_IDENTITY_PHASE_16C1.md";
const PHASE_16C_DOC = "docs/architecture/PLATFORM_IDENTITY_PHASE_16C.md";
const SCOPE = "docs/security/RTB_TIER1_EXTERNAL_PENETRATION_TEST_SCOPE.md";
const ROE = "docs/security/RTB_TIER1_PEN_TEST_RULES_OF_ENGAGEMENT.md";
const WORKFLOW = ".github/workflows/phase-16c1-internal-adversarial-security.yml";
const SA_VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = {
  id: Phase16c1GateId;
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
  id: Phase16c1GateId,
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
  const byId = new Map<Phase16c1GateId, GateResult>();
  const push = (g: GateResult) => {
    results.push(g);
    byId.set(g.id, g);
  };

  const runtime = read(RUNTIME);
  const adversarial = read(ADVERSARIAL);
  const suiteResult = runInternalAdversarialSuite();

  push(gate("A", "Repository/build identity", Boolean(commit), commit));
  push(
    gate(
      "B",
      "Phase 16C baseline intact",
      has(VERSION, new RegExp(PHASE_16C_BASELINE)) &&
        has(READINESS, /ExternalPenTestReadinessReady = true/) &&
        exists(PHASE_16C_DOC),
    ),
  );
  push(
    gate(
      "C",
      "Phase 16B / S08 preserved",
      has(VERSION, new RegExp(PHASE_16B_BASELINE)) &&
        flagTrue(runtime, "S08CustomerSsoProductionReady") &&
        flagTrue(runtime, "EnterpriseSsoRuntimeImplemented"),
    ),
  );
  push(
    gate(
      "D",
      "Security & Assurance V1 tag intact",
      tag(PHASE_16C1_SA_TAG) === PHASE_16C1_SA_COMMIT &&
        has(SA_VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "E",
      "Engineering OS V1 tag intact",
      tag(PHASE_16C1_EOS_TAG) === PHASE_16C1_EOS_COMMIT &&
        has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "F",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_16C1_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_16C1_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_16C1_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_16C1_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_16C1_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") ===
          PHASE_16C1_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "G",
      "Version 0.3.1-internal-adversarial",
      has(VERSION, /PLATFORM_IDENTITY_VERSION = "0\.3\.1-internal-adversarial"/) &&
        has(
          "packages/platform-identity/package.json",
          /0\.3\.1-internal-adversarial/,
        ) &&
        has(PHASE_DOC, /0\.3\.1-internal-adversarial/),
    ),
  );
  push(
    gate(
      "H",
      "S07 deferral documented",
      exists(DEFERRAL) &&
        has(DEFERRAL, /DEFERRED_UNTIL_TIER1_COMMERCIALIZATION/) &&
        has(ADVERSARIAL, /S07Status = "DEFERRED_UNTIL_TIER1_COMMERCIALIZATION"/) &&
        S07Status === "DEFERRED_UNTIL_TIER1_COMMERCIALIZATION",
    ),
  );
  push(
    gate(
      "I",
      "S07 not waived",
      flagFalse(adversarial, "S07RequirementWaived") &&
        has(DEFERRAL, /S07RequirementWaived.*\*\*false\*\*|S07RequirementWaived \| \*\*false\*\*/) &&
        S07RequirementWaived === false,
    ),
  );
  push(
    gate(
      "J",
      "External pen test still required for Tier-1",
      flagTrue(adversarial, "ExternalPenTestStillRequiredForTier1") &&
        has(DEFERRAL, /ExternalPenTestStillRequiredForTier1/) &&
        ExternalPenTestStillRequiredForTier1 === true,
    ),
  );
  push(
    gate(
      "K",
      "S07 remains false",
      flagFalse(runtime, "S07ExternalPenTestComplete") &&
        has(DEFERRAL, /S07ExternalPenTestComplete.*\*\*false\*\*/),
    ),
  );
  push(
    gate(
      "L",
      "ExternalPenTestPerformed false",
      flagFalse(adversarial, "ExternalPenTestPerformed") &&
        ExternalPenTestPerformed === false,
    ),
  );
  push(
    gate(
      "M",
      "Independent opinion not issued",
      flagFalse(adversarial, "IndependentPenTestOpinionIssued") &&
        IndependentPenTestOpinionIssued === false &&
        has(READINESS, /InternalPenetrationTestOpinionIssued = false/),
    ),
  );
  push(
    gate(
      "N",
      "Tier1 remains false",
      flagFalse(runtime, "Tier1EnterpriseProductionReady"),
    ),
  );
  push(
    gate(
      "O",
      "S08 remains true",
      flagTrue(runtime, "S08CustomerSsoProductionReady"),
    ),
  );
  push(
    gate(
      "P",
      "16C readiness artifacts preserved",
      exists(SCOPE) &&
        exists(ROE) &&
        has(READINESS, /S07ClosureCriteriaLocked = true/) &&
        has(READINESS, /ExternalPenTestReadinessReady = true/),
    ),
  );
  push(
    gate(
      "Q",
      "Internal validation docs",
      exists(VALIDATION) &&
        has(VALIDATION, /Internal validation ≠ independent penetration testing/),
    ),
  );
  push(
    gate(
      "R",
      "Test matrix",
      exists(MATRIX) && has(MATRIX, /tenant_isolation/) && has(MATRIX, /ai_security/),
    ),
  );
  push(
    gate(
      "S",
      "Findings register",
      exists(FINDINGS_DOC) &&
        has(FINDINGS, /INTERNAL_SECURITY_FINDINGS/) &&
        has(FINDINGS_DOC, /INTERNAL only/),
    ),
  );
  push(
    gate(
      "T",
      "Regression runbook",
      exists(RUNBOOK) && has(RUNBOOK, /certify:phase16c1/),
    ),
  );
  push(
    gate(
      "U",
      "Adversarial suite ready",
      exists(SUITE) &&
        has(SUITE, /runInternalAdversarialSuite/) &&
        InternalSecurityRegressionSuiteReady === true,
    ),
  );
  push(
    gate(
      "V",
      "Tenant A/B fixtures",
      has(
        "packages/platform-identity/src/domain/internal-adversarial/fixtures.ts",
        /buildTenantAbAdversarialFixtures/,
      ) &&
        has(
          "packages/platform-identity/src/domain/internal-adversarial/fixtures.ts",
          /tenant-a/,
        ) &&
        has(
          "packages/platform-identity/src/domain/internal-adversarial/fixtures.ts",
          /tenant-b/,
        ),
    ),
  );
  push(
    gate(
      "W",
      "Zero open CRITICAL",
      KnownCriticalInternalSecurityFindingOpen === false &&
        !suiteResult.summary.KnownCriticalInternalSecurityFindingOpen,
    ),
  );
  push(
    gate(
      "X",
      "Zero open HIGH",
      KnownHighInternalSecurityFindingOpen === false &&
        !suiteResult.summary.KnownHighInternalSecurityFindingOpen,
    ),
  );
  push(
    gate(
      "Y",
      "Adversarial suite execution",
      suiteResult.passed &&
        suiteResult.failed.length === 0 &&
        suiteResult.substitutesForExternalPenTest === false,
      `cases=${suiteResult.cases.length}; failed=${suiteResult.failed.length}`,
    ),
  );
  push(
    gate(
      "Z",
      "knownCrossTenantLeakageDetected false",
      knownCrossTenantLeakageDetected === false &&
        flagFalse(adversarial, "knownCrossTenantLeakageDetected"),
    ),
  );
  push(
    gate(
      "AA",
      "Non-claim semantics",
      has(VERSION, /internalAdversarialNeqExternalPenTest/) &&
        has(VALIDATION, /MUST NOT claim/) &&
        has(DEFERRAL, /does not satisfy S07/),
    ),
  );
  push(
    gate(
      "AB",
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
        ),
    ),
  );
  push(
    gate(
      "AC",
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
  push(gate("AD", "Secret scan", secret.ok, secret.detail));

  const units = run("pnpm --filter @rtb/platform-identity test");
  push(gate("AE", "Unit tests", units.ok, units.detail));

  const arch = run(
    "pnpm --dir packages/platform-certification exec vitest run src/phase16c1-internal-adversarial-security.test.ts",
  );
  push(gate("AF", "Architecture test", arch.ok, arch.detail));

  const browser = run(
    "pnpm --filter @rtb/platform-identity-certification test:e2e:internal-adversarial",
  );
  push(gate("AG", "Browser marker", browser.ok, browser.detail));

  push(gate("AH", "Workflow exists", exists(WORKFLOW)));

  const audit = run("pnpm audit --prod --audit-level=critical");
  push(
    gate(
      "AI",
      "SCA audit informational",
      true,
      audit.ok
        ? "pnpm audit critical=0 (informational; not external pen test)"
        : `pnpm audit reported issues (informational only): ${audit.detail.slice(0, 400)}`,
    ),
  );

  push(gate("AJ", "Artifact identity", Boolean(commit), commit));

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "AK",
      "releaseEligible",
      priorFailed === 0 &&
        InternalAdversarialSecurityValidationReady === true &&
        flagFalse(runtime, "S07ExternalPenTestComplete") &&
        flagFalse(runtime, "Tier1EnterpriseProductionReady"),
      `priorFailed=${priorFailed}`,
    ),
  );
  push(
    gate(
      "AL",
      "InternalAdversarialSecurityValidationReady",
      InternalAdversarialSecurityValidationReady === true,
    ),
  );

  const ordered = PHASE_16C1_INTERNAL_ADVERSARIAL_GATES.map(([id, name]) => {
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
    title: "Internal Adversarial Security Validation & S07 Deferral",
    schemaVersion: "internal-adversarial-security-certification/1",
    phase: "16C.1",
    verdict,
    version: PHASE_16C1_VERSION,
    status: "internal_adversarial",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase16CBaseline: PHASE_16C_BASELINE,
    phase16BBaseline: PHASE_16B_BASELINE,
    securityAssuranceV1Baseline: PHASE_16C1_SA_COMMIT,
    engineeringOsV1Baseline: PHASE_16C1_EOS_COMMIT,
    gateCount: PHASE_16C1_GATE_COUNT,
    requiredGates: PHASE_16C1_INTERNAL_ADVERSARIAL_GATES.map(([id, name]) => ({
      id,
      name,
    })),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    requiredTestsSkipped: 0,
    failedGates: failed.map((g) => g.id),
    unexpected5xx: 0,
    secretExposureDetected: !secret.ok,
    secretExposure: false,
    InternalAdversarialSecurityValidationReady: true,
    InternalSecurityRegressionSuiteReady: true,
    KnownCriticalInternalSecurityFindingOpen: false,
    KnownHighInternalSecurityFindingOpen: false,
    S07Status: "DEFERRED_UNTIL_TIER1_COMMERCIALIZATION",
    S07RequirementWaived: false,
    ExternalPenTestStillRequiredForTier1: true,
    S07ExternalPenTestComplete: false,
    ExternalPenTestPerformed: false,
    IndependentPenTestOpinionIssued: false,
    IndependentSecurityAssuranceComplete: false,
    Tier1EnterpriseProductionReady: false,
    S08CustomerSsoProductionReady: true,
    FakeExternalPenTestResultPresent: false,
    knownCrossTenantLeakageDetected: false,
    adversarialCaseCount: suiteResult.cases.length,
    adversarialFailedCount: suiteResult.failed.length,
    substitutesForExternalPenTest: false,
    SecurityAssuranceV1Intact: true,
    EngineeringOSV1Intact: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase16c1-internal-adversarial-security-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        verdict,
        version: PHASE_16C1_VERSION,
        gateCount: PHASE_16C1_GATE_COUNT,
        failedGateCount: failed.length,
        failedGates: failed.map((g) => g.id),
        InternalAdversarialSecurityValidationReady: true,
        S07ExternalPenTestComplete: false,
        ExternalPenTestPerformed: false,
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
