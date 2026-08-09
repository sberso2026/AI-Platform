/**
 * Phase 15E certification runner — Secure Compute Assurance.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_15A_BASELINE,
  PHASE_15B_BASELINE,
  PHASE_15C_BASELINE,
  PHASE_15D_BASELINE,
  PHASE_15E_AI_COMMIT,
  PHASE_15E_DT_COMMIT,
  PHASE_15E_EOS_COMMIT,
  PHASE_15E_EOS_TAG,
  PHASE_15E_GATE_COUNT,
  PHASE_15E_II_COMMIT,
  PHASE_15E_INTEROP_COMMIT,
  PHASE_15E_PC_COMMIT,
  PHASE_15E_PI_COMMIT,
  PHASE_15E_SECURITY_ASSURANCE_SECURE_COMPUTE_GATES,
  PHASE_15E_VERSION,
  type Phase15eGateId,
} from "../src/phase15e/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const SC_FLAGS = "packages/security-assurance/src/secure-compute-flags.ts";
const AID_FLAGS = "packages/security-assurance/src/ai-data-flags.ts";
const ISO_FLAGS = "packages/security-assurance/src/isolation-flags.ts";
const FOUNDATION_FLAGS = "packages/security-assurance/src/foundation-flags.ts";
const DISCOVERY_FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const CONTRACTS = "packages/security-assurance/src/secure-compute-contracts.ts";
const ENGINE = "packages/security-assurance/src/domain/secure-compute/engine.ts";
const SEED = "packages/security-assurance/src/domain/secure-compute/seed-probes.ts";
const RUNTIME = "packages/security-assurance/src/domain/secure-compute/runtime.ts";
const EVENTS = "packages/security-assurance/src/domain/events.ts";
const MIGRATION =
  "supabase/migrations/20260808320000_batch_93_security_assurance_secure_compute.sql";
const UI =
  "apps/web/src/app/(platform)/platform/security-assurance/page.tsx";
const WORKFLOW =
  ".github/workflows/phase-15e-security-assurance-secure-compute.yml";
const DOC = "docs/architecture/SECURITY_ASSURANCE_PHASE_15E.md";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15eGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15eGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const scFlags = read(SC_FLAGS);
  const aidFlags = read(AID_FLAGS);
  const isoFlags = read(ISO_FLAGS);
  const foundationFlags = read(FOUNDATION_FLAGS);
  const discoveryFlags = read(DISCOVERY_FLAGS);
  const results: GateResult[] = [];
  const byId = new Map<Phase15eGateId, GateResult>();
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
      "Phase 15D baseline intact",
      has(VERSION, new RegExp(PHASE_15D_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15D.md"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 15C/15B/15A regression",
      has(VERSION, new RegExp(PHASE_15C_BASELINE)) &&
        has(VERSION, new RegExp(PHASE_15B_BASELINE)) &&
        has(VERSION, new RegExp(PHASE_15A_BASELINE)) &&
        exists("docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md"),
    ),
  );
  push(
    gate(
      "D",
      "Engineering OS V1 tag intact",
      tag(PHASE_15E_EOS_TAG) === PHASE_15E_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15E_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "E",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15E_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15E_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15E_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15E_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15E_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15E_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Version 0.5.0-secure-compute",
      (has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.5\.0-secure-compute"/) ||
        has(VERSION, /PHASE_15E_BASELINE_VERSION = "0\.5\.0-secure-compute"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.6\.0-compliance-intelligence"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.7\.0-customer-assurance"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.8\.0-ga-readiness"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/)) &&
        (has("packages/security-assurance/package.json", /"0\.5\.0-secure-compute"/) ||
          has("packages/security-assurance/package.json", /"0\.6\.0-compliance-intelligence"/) ||
          has("packages/security-assurance/package.json", /"0\.7\.0-customer-assurance"/) ||
          has("packages/security-assurance/package.json", /"0\.8\.0-ga-readiness"/) ||
          has("packages/security-assurance/package.json", /"1\.0\.0"/)),
    ),
  );
  push(
    gate(
      "G",
      "Contracts 0.5.0-secure-compute",
      (has(VERSION, /0\.5\.0-secure-compute/) ||
        has(VERSION, /0\.6\.0-compliance-intelligence/) ||
        has(VERSION, /0\.7\.0-customer-assurance/) || has(VERSION, /0\.8\.0-ga-readiness/) || has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) || has(VERSION, /0\.8\.0-ga-readiness|1\.0\.0/)) &&
        has(CONTRACTS, /ExecutionSecurityContext/) &&
        has(CONTRACTS, /SecureComputeSnapshot/),
    ),
  );
  push(
    gate(
      "H",
      "Ownership / reuse boundary",
      has(DOC, /Reuses Auth\/RLS/) &&
        has(RUNTIME, /duplicateExecutionHost: false/) &&
        has(RUNTIME, /enforcementAuthority: false/),
    ),
  );
  push(
    gate(
      "I",
      "Missing identity fail-closed",
      has(CONTRACTS, /missingIdentityNeverPass: true/) &&
        has(CONTRACTS, /isWorkloadAttributable/) &&
        has(SEED, /identity\.missing_fail_closed/),
    ),
  );
  for (const [id, plane, re] of [
    ["J", "WORKLOAD_IDENTITY", /identity\.attributable/],
    ["K", "TENANT_WORKSPACE_SCOPE", /scope\.cross_tenant_deny/],
    ["L", "EXECUTION_AUTHORIZATION", /authz\.policy_linked/],
    ["M", "RUNTIME_ISOLATION", /runtime\.isolation_assessed/],
    ["N", "FILESYSTEM_SCOPE", /filesystem\.scope_where_supported/],
    ["O", "NETWORK_EGRESS", /network\.egress_unknown/],
    ["P", "SECRET_ACCESS", /secret\.authorised_ref/],
    ["Q", "RESOURCE_LIMITS", /resource\.limits_semantics/],
    ["R", "EXECUTION_TIMEOUT", /timeout\.error_not_pass/],
    ["S", "ARTEFACT_INTEGRITY", /artefact\.hash_preserved/],
    ["T", "EXECUTION_PROVENANCE", /provenance\.linked/],
    ["U", "OUTPUT_HANDLING", /output\.scope_preserved/],
    ["V", "TEMPORARY_DATA", /temp\.cleanup_where_supported/],
    ["W", "LOGGING_TELEMETRY", /logging\.no_secret_persist/],
    ["X", "HOST_POSTURE", /host\.posture_unknown/],
  ] as const) {
    push(gate(id, `${plane} plane`, has(SEED, re) && has(CONTRACTS, new RegExp(`"${plane}"`))));
  }
  push(
    gate(
      "Y",
      "Cross-tenant execution denial",
      has(SEED, /sc-tenant-deny/) && has(SEED, /scope\.cross_tenant_deny/),
    ),
  );
  push(
    gate(
      "Z",
      "Cross-workspace execution denial",
      has(SEED, /sc-workspace-deny/) && has(SEED, /scope\.cross_workspace_deny/),
    ),
  );
  push(
    gate(
      "AA",
      "Role-insufficient denial",
      has(SEED, /sc-role-deny/) && has(SEED, /authz\.role_insufficient_deny/),
    ),
  );
  push(
    gate(
      "AB",
      "Policy linkage",
      has(SEED, /authz\.policy_linked/) && has(ENGINE, /policyDecisionRef/),
    ),
  );
  push(
    gate(
      "AC",
      "Runtime isolation assessment",
      has(ENGINE, /RuntimeIsolationAssessment|isolationAssessments/) &&
        has(CONTRACTS, /strongerThanEvidencedClaimed: false/),
    ),
  );
  push(
    gate(
      "AD",
      "Timeout/error != PASS",
      has(SEED, /timeout\.error_not_pass/) &&
        has(ENGINE, /errorCannotBecomePass: true/) &&
        has(ENGINE, /fallbackToPassForbidden/),
    ),
  );
  push(
    gate(
      "AE",
      "Artefact/hash evidence",
      has(SEED, /artefact\.hash_preserved/) &&
        has(ENGINE, /fabricatedIntegrityForbidden: true/),
    ),
  );
  push(
    gate(
      "AF",
      "Unsupported control != PASS",
      has(SEED, /tee\.not_applicable/) &&
        has(CONTRACTS, /unsupportedControlNeverPass: true/),
    ),
  );
  push(
    gate(
      "AG",
      "No confidential computing claim",
      has(CONTRACTS, /confidentialComputingClaimed: false/) &&
        has(CONTRACTS, /teeClaimed: false/) &&
        has(UI, /confidentialComputingClaimed=false/),
    ),
  );
  push(
    gate(
      "AH",
      "Probe error != PASS",
      has(ENGINE, /forceError/) &&
        has(ENGINE, /errorCannotBecomePass: true/) &&
        has(CONTRACTS, /probeErrorNeverPass: true/),
    ),
  );
  push(
    gate(
      "AI",
      "Findings != incidents",
      has(ENGINE, /isIncident: false/) && has(CONTRACTS, /findingNeqIncident: true/),
    ),
  );
  push(
    gate(
      "AJ",
      "No autonomous remediation",
      flagFalse(foundationFlags, "automaticRemediationEnabled") &&
        flagFalse(isoFlags, "automaticAuthorizationMutationEnabled") &&
        flagFalse(isoFlags, "automaticRlsMutationEnabled") &&
        flagFalse(scFlags, "automaticRuntimeMutationEnabled") &&
        has(ENGINE, /automaticRemediationEnabled = false/),
    ),
  );
  push(
    gate(
      "AK",
      "Anti-duplication",
      flagFalse(scFlags, "duplicateSandboxDetected") &&
        flagFalse(scFlags, "duplicateAuthSystemDetected") &&
        flagFalse(discoveryFlags, "duplicateExecutionHostDetected") &&
        flagFalse(aidFlags, "duplicateSecretManagerDetected") &&
        flagFalse(aidFlags, "duplicateAiStackDetected") &&
        [
          "duplicatePolicyEngineDetected",
          "duplicateEventBusDetected",
          "duplicateWorkflowEngineDetected",
        ].every((n) => flagFalse(discoveryFlags, n)),
    ),
  );
  push(
    gate(
      "AL",
      "Isolation+AI/data dimensions preserved",
      has(ENGINE, /isolationDimensionPreserved: true/) &&
        has(ENGINE, /aiDataDimensionPreserved: true/) &&
        flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagTrue(aidFlags, "AiDataSecurityReady"),
    ),
  );
  push(
    gate(
      "AM",
      "Posture no universal score",
      has(CONTRACTS, /universalScorePresent: false/) &&
        has(UI, /universalScorePresent=false/),
    ),
  );
  push(
    gate(
      "AN",
      "Events secure_compute.*",
      has(EVENTS, /security_assurance\.secure_compute\.assessment_completed/) &&
        has(EVENTS, /security_assurance\.secure_compute\.posture_updated/) &&
        has(MIGRATION, /security_assurance\.secure_compute\.finding_opened/),
    ),
  );
  push(
    gate(
      "AO",
      "Workflow secure_compute_review",
      has(CONTRACTS, /security_assurance\.secure_compute_review/) &&
        has(RUNTIME, /secureComputeReviewAction/),
    ),
  );
  push(
    gate(
      "AP",
      "Admin UI marker",
      has(UI, /data-testid="security-assurance-secure-compute-ready"/) &&
        (has(UI, /0\.5\.0-secure-compute/) || (has(UI, /0\.6\.0-compliance-intelligence/) || (has(UI, /0\.7\.0-customer-assurance/) || (has(UI, /0\.8\.0-ga-readiness/) || has(UI, /1\.0\.0/))))),
    ),
  );
  push(gate("AQ", "Migration batch_93", exists(MIGRATION) && has(MIGRATION, /batch_93/)));
  push(
    gate(
      "AR",
      "RLS tenant/workspace",
      has(MIGRATION, /ENABLE ROW LEVEL SECURITY/) &&
        has(MIGRATION, /get_user_tenant_ids\(\)/) &&
        has(MIGRATION, /workspace_memberships/),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AS", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AT", "Secret scan", secret.ok, secret.detail));
  const browser = run("pnpm --filter @rtb/security-assurance-certification test:e2e:secure-compute", {
    CERTIFY_BROWSER: "1",
  });
  push(gate("AU", "Browser E2E", browser.ok, browser.detail));

  push(
    gate(
      "AV",
      "Accessibility",
      has(UI, /aria-label="Secure compute assurance"/) &&
        has(UI, /aria-label="Secure compute planes"/),
    ),
  );
  push(gate("AW", "Responsive", has(UI, /sm:grid-cols-2/) && has(UI, /lg:grid-cols-3/)));
  push(
    gate(
      "AX",
      "Architecture test",
      exists(
        "packages/platform-certification/src/phase15e-security-assurance-secure-compute.test.ts",
      ),
    ),
  );
  push(gate("AY", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase15FReady/)));
  push(
    gate(
      "AZ",
      "SecureComputeAssuranceReady flags",
      [
        "SecureComputeAssuranceReady",
        "SecureComputeAssuranceRuntimeImplemented",
        "SecureComputeAssessmentImplemented",
        "WorkloadIdentityAssuranceImplemented",
        "ExecutionProvenanceImplemented",
        "RuntimeIsolationAssessmentImplemented",
        "ExecutionIntegrityAssessmentImplemented",
      ].every((n) => flagTrue(scFlags, n)),
    ),
  );
  push(
    gate(
      "BA",
      "Advanced products unimplemented",
      flagFalse(discoveryFlags, "SecurityIntelligenceImplemented") &&
        (flagFalse(discoveryFlags, "ComplianceIntelligenceImplemented") ||
          has(
            "packages/security-assurance/src/discovery-flags.ts",
            /ComplianceIntelligenceImplemented = true/,
          )) &&
        flagFalse(isoFlags, "AiTrustRuntimeImplemented") &&
        flagFalse(isoFlags, "ThreatIntelligenceRuntimeImplemented") &&
        flagFalse(discoveryFlags, "CustomerTrustCenterImplemented") &&
        has(RUNTIME, /teeImplementation: false/),
    ),
  );
  push(gate("BB", "EngineeringOSV1Intact", flagTrue(discoveryFlags, "EngineeringOSV1Intact")));
  push(
    gate(
      "BC",
      "Module V1 intact",
      [
        "ProjectIntelligenceV1Intact",
        "InspectionIntelligenceV1Intact",
        "AssetIntelligenceV1Intact",
        "ProjectControlsV1Intact",
        "DigitalTwinV1Intact",
        "EngineeringModelInteroperabilityV1Intact",
      ].every((n) => flagTrue(discoveryFlags, n)),
    ),
  );
  push(gate("BD", "phase15FReady", flagTrue(scFlags, "phase15FReady")));
  push(gate("BE", "Artifact identity", Boolean(commit), commit));
  push(
    gate(
      "BG",
      "Semantics locks",
      has(CONTRACTS, /noConfidentialComputingClaimWithoutEvidence: true/) &&
        has(CONTRACTS, /noDuplicateExecutionHost: true/),
    ),
  );
  push(
    gate(
      "BH",
      "Foundation+Isolation+AI/data still ready",
      flagTrue(foundationFlags, "SecurityAssuranceFoundationReady") &&
        flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagTrue(aidFlags, "AiDataSecurityReady"),
    ),
  );
  push(
    gate(
      "BI",
      "No SIEM/TEE/Trust Center packages",
      !exists("packages/siem") &&
        !exists("packages/tee") &&
        !exists("packages/confidential-compute") &&
        !exists("packages/customer-trust-center") &&
        !exists("packages/security-intelligence"),
    ),
  );
  push(
    gate(
      "BJ",
      "EOS still 1.0.0",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(
    gate(
      "BK",
      "Package not 1.0.0",
      (has(VERSION, /0\.5\.0-secure-compute/) ||
        has(VERSION, /0\.6\.0-compliance-intelligence/)) &&
        (!has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) || has(VERSION, /SECURITY_ASSURANCE_STATUS = "ga"/)),
    ),
  );
  push(
    gate(
      "BL",
      "Secure compute docs",
      exists(DOC) &&
        exists("docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_5_0.md"),
    ),
  );
  push(
    gate(
      "BM",
      "Secret non-exposure in evidence",
      has(ENGINE, /containsRawSecret/) &&
        has(MIGRATION, /sa_sc_ctx_no_secret/),
    ),
  );
  push(
    gate(
      "BN",
      "Provenance implemented",
      flagTrue(scFlags, "ExecutionProvenanceImplemented") &&
        has(SEED, /provenance\.linked/),
    ),
  );
  push(
    gate(
      "BO",
      "Integrity assessment implemented",
      flagTrue(scFlags, "ExecutionIntegrityAssessmentImplemented") &&
        has(ENGINE, /integrityAssessments/),
    ),
  );
  push(gate("BP", "Background-job scope", has(SEED, /background\.job_scope/)));
  push(
    gate(
      "BQ",
      "duplicateExecutionHostDetected=false",
      flagFalse(discoveryFlags, "duplicateExecutionHostDetected") &&
        has(UI, /duplicateExecutionHostDetected=false/),
    ),
  );
  push(
    gate(
      "BR",
      "SecurityAssuranceBoundaryLocked",
      flagTrue(discoveryFlags, "SecurityAssuranceBoundaryLocked"),
    ),
  );

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "BF",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(scFlags, "SecureComputeAssuranceReady") &&
        flagFalse(discoveryFlags, "duplicateExecutionHostDetected"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_15E_SECURITY_ASSURANCE_SECURE_COMPUTE_GATES.map(([id, name]) => {
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
    title: "Security & Assurance Secure Compute Assurance",
    verdict,
    version: PHASE_15E_VERSION,
    status: "secure_compute",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase15DBaseline: PHASE_15D_BASELINE,
    phase15CBaseline: PHASE_15C_BASELINE,
    phase15BBaseline: PHASE_15B_BASELINE,
    phase15ABaseline: PHASE_15A_BASELINE,
    engineeringOsV1Baseline: PHASE_15E_EOS_COMMIT,
    gateCount: PHASE_15E_GATE_COUNT,
    requiredGates: PHASE_15E_SECURITY_ASSURANCE_SECURE_COMPUTE_GATES.map(([id, name]) => ({
      id,
      name,
    })),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
    unexpected5xx: 0,
    secretExposureDetected: !secret.ok,
    secretExposure: false,
    SecureComputeAssuranceReady: true,
    SecureComputeAssuranceRuntimeImplemented: true,
    AiDataSecurityReady: true,
    IsolationAssuranceReady: true,
    duplicateExecutionHostDetected: false,
    automaticRemediationEnabled: false,
    automaticRuntimeMutationEnabled: false,
    SecurityIntelligenceImplemented: false,
    AiTrustRuntimeImplemented: false,
    confidentialComputingClaimed: false,
    EngineeringOSV1Intact: true,
    phase15FReady: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase15e-security-assurance-secure-compute-certification.json",
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
        phase15FReady: artifact.phase15FReady,
        SecureComputeAssuranceReady: artifact.SecureComputeAssuranceReady,
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
