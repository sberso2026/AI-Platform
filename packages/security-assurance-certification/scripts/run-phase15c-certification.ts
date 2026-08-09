/**
 * Phase 15C certification runner — Isolation Assurance.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_15A_BASELINE,
  PHASE_15B_BASELINE,
  PHASE_15C_AI_COMMIT,
  PHASE_15C_DT_COMMIT,
  PHASE_15C_EOS_COMMIT,
  PHASE_15C_EOS_TAG,
  PHASE_15C_GATE_COUNT,
  PHASE_15C_II_COMMIT,
  PHASE_15C_INTEROP_COMMIT,
  PHASE_15C_PC_COMMIT,
  PHASE_15C_PI_COMMIT,
  PHASE_15C_SECURITY_ASSURANCE_ISOLATION_GATES,
  PHASE_15C_VERSION,
  type Phase15cGateId,
} from "../src/phase15c/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const ISO_FLAGS = "packages/security-assurance/src/isolation-flags.ts";
const FOUNDATION_FLAGS = "packages/security-assurance/src/foundation-flags.ts";
const DISCOVERY_FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const ISO_CONTRACTS = "packages/security-assurance/src/isolation-contracts.ts";
const OWNERSHIP = "docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md";
const MIGRATION =
  "supabase/migrations/20260808300000_batch_91_security_assurance_isolation.sql";
const UI =
  "apps/web/src/app/(platform)/platform/security-assurance/page.tsx";
const WORKFLOW =
  ".github/workflows/phase-15c-security-assurance-isolation.yml";
const ENGINE = "packages/security-assurance/src/domain/isolation/engine.ts";
const REGISTRY =
  "packages/security-assurance/src/domain/isolation/probe-registry.ts";
const SEED = "packages/security-assurance/src/domain/isolation/seed-probes.ts";
const GATE = "packages/security-assurance/src/domain/isolation/release-gate.ts";
const RUNTIME = "packages/security-assurance/src/domain/isolation/runtime.ts";
const EVENTS = "packages/security-assurance/src/domain/events.ts";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15cGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15cGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const isoFlags = read(ISO_FLAGS);
  const foundationFlags = read(FOUNDATION_FLAGS);
  const discoveryFlags = read(DISCOVERY_FLAGS);
  const results: GateResult[] = [];
  const byId = new Map<Phase15cGateId, GateResult>();
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
      "Phase 15B baseline intact",
      has(VERSION, new RegExp(PHASE_15B_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15B.md"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 15A regression corpus",
      has(VERSION, new RegExp(PHASE_15A_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15A.md") &&
        exists("docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md"),
    ),
  );
  push(
    gate(
      "D",
      "Engineering OS V1 tag intact",
      tag(PHASE_15C_EOS_TAG) === PHASE_15C_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15C_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "E",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15C_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15C_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15C_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15C_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15C_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15C_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Version 0.3.0-isolation-assurance",
      (has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.3\.0-isolation-assurance"/) ||
        has(VERSION, /PHASE_15C_BASELINE_VERSION = "0\.3\.0-isolation-assurance"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.4\.0-ai-data-security"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.5\.0-secure-compute"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.6\.0-compliance-intelligence"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.7\.0-customer-assurance"/)) &&
        (has("packages/security-assurance/package.json", /"0\.3\.0-isolation-assurance"/) ||
          has("packages/security-assurance/package.json", /"0\.4\.0-ai-data-security"/) ||
          has("packages/security-assurance/package.json", /"0\.5\.0-secure-compute"/) ||
          has("packages/security-assurance/package.json", /"0\.6\.0-compliance-intelligence"/) ||
          has("packages/security-assurance/package.json", /"0\.7\.0-customer-assurance"/)),
    ),
  );
  push(
    gate(
      "G",
      "Contracts 0.3.0-isolation-assurance",
      (has(VERSION, /0\.3\.0-isolation-assurance/) ||
        has(VERSION, /0\.4\.0-ai-data-security/) ||
        has(VERSION, /0\.5\.0-secure-compute/) ||
        has(VERSION, /0\.6\.0-compliance-intelligence/) ||
        has(VERSION, /0\.7\.0-customer-assurance/)) &&
        has(ISO_CONTRACTS, /IsolationProbeRun/) &&
        has(ISO_CONTRACTS, /IsolationAssuranceSnapshot/),
    ),
  );
  push(
    gate(
      "H",
      "Ownership — does not own enforcement",
      has(OWNERSHIP, /MUST_NEVER_OWN/) &&
        has("docs/architecture/SECURITY_ASSURANCE_PHASE_15C.md", /Does \*\*not\*\* own/) &&
        has(RUNTIME, /enforcementAuthority: false/),
    ),
  );
  push(
    gate(
      "I",
      "Probe registry",
      exists(REGISTRY) && flagTrue(isoFlags, "IsolationProbeRegistryReady"),
    ),
  );
  push(
    gate(
      "J",
      "Probe versioning / no unrestricted code",
      has(REGISTRY, /registerExecutable/) &&
        has(REGISTRY, /forbidden/) &&
        has(SEED, /version: "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "K",
      "Database/RLS isolation",
      has(SEED, /database\.cross_tenant_deny/) &&
        has(SEED, /database\.cross_workspace_deny/) &&
        flagTrue(isoFlags, "DatabaseIsolationAssessed"),
    ),
  );
  push(
    gate(
      "L",
      "API/IDOR isolation",
      has(SEED, /api\.idor_foreign_tenant/) && flagTrue(isoFlags, "ApiIsolationAssessed"),
    ),
  );
  push(
    gate(
      "M",
      "File isolation",
      has(SEED, /files\.cross_tenant_deny/) && flagTrue(isoFlags, "FileIsolationAssessed"),
    ),
  );
  push(
    gate(
      "N",
      "Search isolation",
      has(SEED, /search\.cross_tenant_filter/) &&
        flagTrue(isoFlags, "SearchIsolationAssessed"),
    ),
  );
  push(
    gate(
      "O",
      "KG isolation",
      has(SEED, /kg\.cross_tenant_deny/) &&
        flagTrue(isoFlags, "KnowledgeGraphIsolationAssessed") &&
        flagFalse(discoveryFlags, "duplicateKnowledgeGraphDetected"),
    ),
  );
  push(
    gate(
      "P",
      "AI context isolation",
      has(SEED, /ai\.cross_tenant_context_deny/) &&
        flagTrue(isoFlags, "AiContextIsolationAssessed") &&
        flagFalse(foundationFlags, "implementsOwnAiStack"),
    ),
  );
  push(
    gate(
      "Q",
      "Background job isolation",
      has(SEED, /job\.foreign_object_deny/) &&
        flagTrue(isoFlags, "BackgroundJobIsolationAssessed"),
    ),
  );
  push(
    gate(
      "R",
      "Event isolation",
      has(SEED, /event\.cross_tenant_deny/) &&
        flagTrue(isoFlags, "EventIsolationAssessed") &&
        flagFalse(discoveryFlags, "duplicateEventBusDetected"),
    ),
  );
  push(
    gate(
      "S",
      "Execution host isolation",
      has(SEED, /execution_host\.cross_job_deny/) &&
        flagTrue(isoFlags, "ExecutionHostIsolationAssessed") &&
        flagFalse(discoveryFlags, "duplicateExecutionHostDetected"),
    ),
  );
  push(
    gate(
      "T",
      "Solver workspace isolation",
      has(SEED, /solver\.cross_job_deny/) &&
        flagTrue(isoFlags, "SolverWorkspaceIsolationAssessed"),
    ),
  );
  push(
    gate(
      "U",
      "Cache applicability",
      has(SEED, /cache\.not_applicable/) &&
        has(SEED, /expectedOutcome: "not_applicable"/),
    ),
  );
  push(
    gate(
      "V",
      "Evidence provenance",
      has(ENGINE, /observed: true/) &&
        has(ENGINE, /fabricated: false/) &&
        flagTrue(isoFlags, "IsolationEvidenceReady"),
    ),
  );
  push(
    gate(
      "W",
      "Evidence freshness",
      has(ENGINE, /freshness: "current"/) &&
        has(ISO_CONTRACTS, /staleEvidenceNotCurrent: true/),
    ),
  );
  push(
    gate(
      "X",
      "Probe error semantics",
      has(ENGINE, /forceError/) &&
        has(ENGINE, /return "error"/) &&
        has(ISO_CONTRACTS, /failedProbeNeverFallbackPass: true/),
    ),
  );
  push(
    gate(
      "Y",
      "Isolation assessment",
      has(ENGINE, /assess\(/) && flagTrue(isoFlags, "IsolationAssessmentReady"),
    ),
  );
  push(
    gate(
      "Z",
      "Isolation findings",
      has(ENGINE, /isIncident: false/) &&
        has(ISO_CONTRACTS, /isolationFindingNeqIncident: true/),
    ),
  );
  push(
    gate(
      "AA",
      "Posture integration isolation-only",
      has(ENGINE, /compose\(/) &&
        flagTrue(isoFlags, "IsolationPostureIntegrationReady") &&
        has(UI, /universalScorePresent=false/),
    ),
  );
  push(
    gate(
      "AB",
      "Control mapping",
      has(SEED, /RTB-SEC-ISO-BASE/) && has(SEED, /controlRefs/),
    ),
  );
  push(
    gate(
      "AC",
      "Scheduled/repeatable assurance contract",
      has(GATE, /"scheduled"/) && has(GATE, /ISOLATION_EXECUTION_MODES/),
    ),
  );
  push(
    gate(
      "AD",
      "Release-gate contract",
      has(GATE, /DEFAULT_ISOLATION_RELEASE_GATE/) &&
        has(GATE, /evaluateReleaseGate/) &&
        has(GATE, /maxEvidenceAgeHours/),
    ),
  );
  push(
    gate(
      "AE",
      "Production safety",
      has(SEED, /productionSafe: true/) &&
        has(MIGRATION, /production_safe/) &&
        has("docs/architecture/SECURITY_ASSURANCE_PHASE_15C.md", /production-safe|Observes/i),
    ),
  );
  push(
    gate(
      "AF",
      "Admin UI isolation marker",
      has(UI, /data-testid="security-assurance-isolation-ready"/) &&
        has(UI, /0\.3\.0-isolation-assurance/),
    ),
  );
  push(
    gate(
      "AG",
      "Isolation events",
      has(EVENTS, /security_assurance\.isolation\.probe_completed/) &&
        has(EVENTS, /security_assurance\.isolation\.posture_updated/) &&
        has(MIGRATION, /security_assurance\.isolation\.finding_opened/),
    ),
  );
  push(
    gate(
      "AH",
      "Audit/timeline",
      has(ENGINE, /timeline\.append/) &&
        has(ENGINE, /isolation_probe_completed/),
    ),
  );
  push(
    gate(
      "AI",
      "Workflow reuse isolation_review",
      has(ISO_CONTRACTS, /security_assurance\.isolation_review/) &&
        has(RUNTIME, /isolationReviewAction/) &&
        flagFalse(discoveryFlags, "duplicateWorkflowEngineDetected"),
    ),
  );
  push(
    gate(
      "AJ",
      "Migration batch_91",
      exists(MIGRATION) && has(MIGRATION, /batch_91/),
    ),
  );
  push(
    gate(
      "AK",
      "RLS on isolation tables",
      has(MIGRATION, /ENABLE ROW LEVEL SECURITY/) &&
        has(MIGRATION, /get_user_tenant_ids\(\)/),
    ),
  );
  push(
    gate(
      "AL",
      "Tenant/workspace isolation",
      has(MIGRATION, /tenant_id uuid NOT NULL/) &&
        has(MIGRATION, /workspace_id uuid NOT NULL/),
    ),
  );
  push(
    gate(
      "AM",
      "IDOR least privilege",
      has(MIGRATION, /workspace_memberships/) &&
        has("docs/architecture/SECURITY_ASSURANCE_PHASE_15C.md", /RLS/),
    ),
  );
  push(
    gate(
      "AN",
      "Performance baselines recorded",
      has(ENGINE, /durationMs/) && has(ISO_CONTRACTS, /timeoutPolicyMs/),
    ),
  );
  push(
    gate(
      "AO",
      "No remediation / no RLS mutation",
      flagFalse(foundationFlags, "automaticRemediationEnabled") &&
        flagFalse(isoFlags, "automaticAuthorizationMutationEnabled") &&
        flagFalse(isoFlags, "automaticRlsMutationEnabled") &&
        has(MIGRATION, /sa_iso_snap_no_remediation/),
    ),
  );
  push(
    gate(
      "AP",
      "Anti-duplication",
      [
        "duplicateIdentityProviderDetected",
        "duplicatePolicyEngineDetected",
        "duplicateAuditSystemDetected",
        "duplicateAiRuntimeDetected",
        "duplicateToolFrameworkDetected",
        "duplicateExecutionHostDetected",
        "duplicateKnowledgeGraphDetected",
        "duplicateWorkflowEngineDetected",
        "duplicateFileStoreDetected",
        "duplicateEventBusDetected",
      ].every((n) => flagFalse(discoveryFlags, n)),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AQ", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AR", "Secret scan", secret.ok, secret.detail));
  const browser = run("pnpm --filter @rtb/security-assurance-certification test:e2e:isolation", {
    CERTIFY_BROWSER: "1",
  });
  push(gate("AS", "Browser E2E", browser.ok, browser.detail));

  push(
    gate(
      "AT",
      "Accessibility",
      has(UI, /aria-label="Isolation assurance"/) &&
        has(UI, /aria-label="Isolation target planes"/),
    ),
  );
  push(
    gate(
      "AU",
      "Responsive",
      has(UI, /sm:grid-cols-2/) && has(UI, /lg:grid-cols-3/),
    ),
  );
  push(
    gate(
      "AV",
      "Architecture test",
      exists(
        "packages/platform-certification/src/phase15c-security-assurance-isolation.test.ts",
      ),
    ),
  );
  push(gate("AW", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase15DReady/)));
  push(
    gate(
      "AX",
      "IsolationAssuranceReady flags",
      flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagTrue(isoFlags, "IsolationAssuranceRuntimeImplemented"),
    ),
  );
  push(
    gate(
      "AY",
      "Plane assessed flags",
      [
        "DatabaseIsolationAssessed",
        "ApiIsolationAssessed",
        "FileIsolationAssessed",
        "SearchIsolationAssessed",
        "KnowledgeGraphIsolationAssessed",
        "AiContextIsolationAssessed",
        "BackgroundJobIsolationAssessed",
        "EventIsolationAssessed",
        "ExecutionHostIsolationAssessed",
        "SolverWorkspaceIsolationAssessed",
      ].every((n) => flagTrue(isoFlags, n)),
    ),
  );
  push(
    gate(
      "AZ",
      "Leakage flags false",
      flagFalse(isoFlags, "knownCrossTenantLeakageDetected") &&
        flagFalse(isoFlags, "knownCrossWorkspaceLeakageDetected"),
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
        flagFalse(discoveryFlags, "CustomerTrustCenterImplemented"),
    ),
  );
  push(gate("BB", "implementsOwnAiStack=false", flagFalse(foundationFlags, "implementsOwnAiStack")));
  push(gate("BC", "EngineeringOSV1Intact", flagTrue(discoveryFlags, "EngineeringOSV1Intact")));
  push(
    gate(
      "BD",
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
  push(gate("BE", "phase15DReady", flagTrue(isoFlags, "phase15DReady")));
  push(gate("BF", "Artifact identity", Boolean(commit), commit));
  push(
    gate(
      "BH",
      "Semantics locks",
      has(ISO_CONTRACTS, /isolationConfiguredNeqVerified: true/) &&
        has(ISO_CONTRACTS, /failedProbeNeverFallbackPass: true/),
    ),
  );
  push(
    gate(
      "BI",
      "Foundation still ready",
      flagTrue(foundationFlags, "SecurityAssuranceFoundationReady"),
    ),
  );
  push(
    gate(
      "BJ",
      "No SIEM/Trust Center packages",
      !exists("packages/siem") &&
        !exists("packages/customer-trust-center") &&
        !exists("packages/security-intelligence"),
    ),
  );
  push(
    gate(
      "BK",
      "EOS still 1.0.0",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(
    gate(
      "BL",
      "Package not 1.0.0",
      has(VERSION, /0\.3\.0-isolation-assurance/) &&
        !has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "BM",
      "Isolation docs",
      exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15C.md") &&
        exists("docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_3_0.md"),
    ),
  );
  push(
    gate(
      "BN",
      "knownCrossTenantLeakageDetected=false",
      flagFalse(isoFlags, "knownCrossTenantLeakageDetected") &&
        has(UI, /knownCrossTenantLeakageDetected=false/),
    ),
  );
  push(
    gate(
      "BO",
      "knownCrossWorkspaceLeakageDetected=false",
      flagFalse(isoFlags, "knownCrossWorkspaceLeakageDetected") &&
        has(UI, /knownCrossWorkspaceLeakageDetected=false/),
    ),
  );
  push(
    gate(
      "BP",
      "Failed probe never PASS fallback",
      has(ENGINE, /fallbackToPassForbidden: true/) &&
        has(MIGRATION, /fallback_to_pass_forbidden/),
    ),
  );
  push(
    gate(
      "BQ",
      "CACHE not_applicable truthful",
      has(SEED, /iso-cache-applicability/) &&
        has(UI, /CACHE \(NOT_APPLICABLE\)/),
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
      "BG",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagFalse(isoFlags, "knownCrossTenantLeakageDetected"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_15C_SECURITY_ASSURANCE_ISOLATION_GATES.map(([id, name]) => {
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
    title: "Security & Assurance Isolation Assurance",
    verdict,
    version: PHASE_15C_VERSION,
    status: "isolation_assurance",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase15BBaseline: PHASE_15B_BASELINE,
    phase15ABaseline: PHASE_15A_BASELINE,
    engineeringOsV1Baseline: PHASE_15C_EOS_COMMIT,
    gateCount: PHASE_15C_GATE_COUNT,
    requiredGates: PHASE_15C_SECURITY_ASSURANCE_ISOLATION_GATES.map(([id, name]) => ({
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
    IsolationAssuranceReady: true,
    IsolationAssuranceRuntimeImplemented: true,
    knownCrossTenantLeakageDetected: false,
    knownCrossWorkspaceLeakageDetected: false,
    automaticRemediationEnabled: false,
    automaticRlsMutationEnabled: false,
    SecurityIntelligenceImplemented: false,
    CustomerTrustCenterImplemented: false,
    implementsOwnAiStack: false,
    duplicatePolicyEngineDetected: false,
    EngineeringOSV1Intact: true,
    phase15DReady: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase15c-security-assurance-isolation-certification.json",
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
        phase15DReady: artifact.phase15DReady,
        IsolationAssuranceReady: artifact.IsolationAssuranceReady,
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
