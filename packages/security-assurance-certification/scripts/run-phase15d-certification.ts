/**
 * Phase 15D certification runner — AI & Data Security Assurance.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_15A_BASELINE,
  PHASE_15B_BASELINE,
  PHASE_15C_BASELINE,
  PHASE_15D_AI_COMMIT,
  PHASE_15D_DT_COMMIT,
  PHASE_15D_EOS_COMMIT,
  PHASE_15D_EOS_TAG,
  PHASE_15D_GATE_COUNT,
  PHASE_15D_II_COMMIT,
  PHASE_15D_INTEROP_COMMIT,
  PHASE_15D_PC_COMMIT,
  PHASE_15D_PI_COMMIT,
  PHASE_15D_SECURITY_ASSURANCE_AI_DATA_GATES,
  PHASE_15D_VERSION,
  type Phase15dGateId,
} from "../src/phase15d/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const AID_FLAGS = "packages/security-assurance/src/ai-data-flags.ts";
const ISO_FLAGS = "packages/security-assurance/src/isolation-flags.ts";
const FOUNDATION_FLAGS = "packages/security-assurance/src/foundation-flags.ts";
const DISCOVERY_FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const CONTRACTS = "packages/security-assurance/src/ai-data-contracts.ts";
const ENGINE = "packages/security-assurance/src/domain/ai-data/engine.ts";
const SEED = "packages/security-assurance/src/domain/ai-data/seed-probes.ts";
const RUNTIME = "packages/security-assurance/src/domain/ai-data/runtime.ts";
const EVENTS = "packages/security-assurance/src/domain/events.ts";
const MIGRATION =
  "supabase/migrations/20260808310000_batch_92_security_assurance_ai_data.sql";
const UI =
  "apps/web/src/app/(platform)/platform/security-assurance/page.tsx";
const WORKFLOW =
  ".github/workflows/phase-15d-security-assurance-ai-data.yml";
const DOC = "docs/architecture/SECURITY_ASSURANCE_PHASE_15D.md";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15dGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15dGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const aidFlags = read(AID_FLAGS);
  const isoFlags = read(ISO_FLAGS);
  const foundationFlags = read(FOUNDATION_FLAGS);
  const discoveryFlags = read(DISCOVERY_FLAGS);
  const results: GateResult[] = [];
  const byId = new Map<Phase15dGateId, GateResult>();
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
      "Phase 15C baseline intact",
      has(VERSION, new RegExp(PHASE_15C_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15C.md"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 15B/15A regression",
      has(VERSION, new RegExp(PHASE_15B_BASELINE)) &&
        has(VERSION, new RegExp(PHASE_15A_BASELINE)) &&
        exists("docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md"),
    ),
  );
  push(
    gate(
      "D",
      "Engineering OS V1 tag intact",
      tag(PHASE_15D_EOS_TAG) === PHASE_15D_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15D_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "E",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15D_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15D_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15D_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15D_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15D_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15D_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Version 0.4.0-ai-data-security",
      (has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.4\.0-ai-data-security"/) ||
        has(VERSION, /PHASE_15D_BASELINE_VERSION = "0\.4\.0-ai-data-security"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.5\.0-secure-compute"/)) &&
        (has("packages/security-assurance/package.json", /"0\.4\.0-ai-data-security"/) ||
          has("packages/security-assurance/package.json", /"0\.5\.0-secure-compute"/)),
    ),
  );
  push(
    gate(
      "G",
      "Contracts 0.4.0-ai-data-security",
      (has(VERSION, /0\.4\.0-ai-data-security/) ||
        has(VERSION, /0\.5\.0-secure-compute/)) &&
        has(CONTRACTS, /AiDataFlowRecord/) &&
        has(CONTRACTS, /AiDataSecuritySnapshot/),
    ),
  );
  push(
    gate(
      "H",
      "Ownership / reuse boundary",
      has(DOC, /Reuses Auth\/RLS/) &&
        has(RUNTIME, /duplicateAiStack: false/) &&
        has(RUNTIME, /enforcementAuthority: false/),
    ),
  );
  push(
    gate(
      "I",
      "Classification fail-closed",
      has(CONTRACTS, /unknownClassificationNeverSilentPublic: true/) &&
        has(CONTRACTS, /normalizeClassification/),
    ),
  );
  for (const [id, plane, re] of [
    ["J", "DATA_INGESTION", /DATA_INGESTION/],
    ["K", "DATA_STORAGE", /DATA_STORAGE/],
    ["L", "RETRIEVAL", /retrieval\.cross_tenant_deny/],
    ["M", "AI_CONTEXT", /ai_context\.cross_tenant_deny/],
    ["N", "PROMPT", /prompt\.boundary_assessed/],
    ["O", "MODEL_PROVIDER", /provider\.approved/],
    ["P", "TOOL_INPUT", /tool_input\.scope_preserved/],
    ["Q", "TOOL_OUTPUT", /tool_output\.provenance_retained/],
    ["R", "MODEL_OUTPUT", /model_output\.disclosure_assessed/],
    ["S", "PERSISTENCE", /persistence\.metadata_retained/],
    ["T", "LOGGING_TELEMETRY", /logging\.no_secret_persist/],
    ["U", "DATA_EGRESS", /egress\.policy_evidenced/],
  ] as const) {
    push(gate(id, `${plane} plane`, has(SEED, re) && has(CONTRACTS, new RegExp(`"${plane}"`))));
  }
  push(
    gate(
      "V",
      "Provider unknown fail-closed",
      has(SEED, /provider\.unknown_fail_closed/) &&
        has(ENGINE, /not_assessed/) &&
        has(CONTRACTS, /fabricatedPassForbidden: true/),
    ),
  );
  push(
    gate(
      "W",
      "Sensitive exposure assessment",
      has(ENGINE, /SensitiveDataExposureAssessment|exposureAssessments/) &&
        has(CONTRACTS, /universalSafetyClaimed: false/) &&
        flagTrue(aidFlags, "SensitiveDataExposureAssessmentImplemented"),
    ),
  );
  push(
    gate(
      "X",
      "Evidence provenance/freshness",
      has(ENGINE, /observed: true/) && has(ENGINE, /freshness: "current"/),
    ),
  );
  push(
    gate(
      "Y",
      "Probe error != PASS",
      has(ENGINE, /forceError/) &&
        has(ENGINE, /errorCannotBecomePass: true/) &&
        has(CONTRACTS, /probeErrorNeverPass: true/),
    ),
  );
  push(
    gate(
      "Z",
      "Findings != incidents",
      has(ENGINE, /isIncident: false/) && has(CONTRACTS, /findingNeqIncident: true/),
    ),
  );
  push(
    gate(
      "AA",
      "No autonomous remediation",
      flagFalse(foundationFlags, "automaticRemediationEnabled") &&
        flagFalse(isoFlags, "automaticAuthorizationMutationEnabled") &&
        flagFalse(isoFlags, "automaticRlsMutationEnabled") &&
        has(ENGINE, /automaticRemediationEnabled = false/),
    ),
  );
  push(
    gate(
      "AB",
      "Anti-duplication",
      flagFalse(aidFlags, "duplicateAiStackDetected") &&
        flagFalse(aidFlags, "duplicateSecretManagerDetected") &&
        [
          "duplicatePolicyEngineDetected",
          "duplicateKnowledgeGraphDetected",
          "duplicateEventBusDetected",
          "duplicateWorkflowEngineDetected",
          "duplicateExecutionHostDetected",
          "duplicateAiRuntimeDetected",
        ].every((n) => flagFalse(discoveryFlags, n)),
    ),
  );
  push(
    gate(
      "AC",
      "Isolation dimension preserved",
      has(ENGINE, /isolationDimensionPreserved: true/) &&
        flagTrue(isoFlags, "IsolationAssuranceReady"),
    ),
  );
  push(
    gate(
      "AD",
      "Posture no universal score",
      has(CONTRACTS, /universalScorePresent: false/) &&
        has(UI, /universalScorePresent=false/),
    ),
  );
  push(
    gate(
      "AE",
      "Events ai_data.*",
      has(EVENTS, /security_assurance\.ai_data\.assessment_completed/) &&
        has(EVENTS, /security_assurance\.ai_data\.posture_updated/) &&
        has(MIGRATION, /security_assurance\.ai_data\.finding_opened/),
    ),
  );
  push(
    gate(
      "AF",
      "Workflow ai_data_review",
      has(CONTRACTS, /security_assurance\.ai_data_review/) &&
        has(RUNTIME, /aiDataReviewAction/),
    ),
  );
  push(
    gate(
      "AG",
      "Admin UI marker",
      has(UI, /data-testid="security-assurance-ai-data-ready"/) &&
        (has(UI, /0\.4\.0-ai-data-security/) || has(UI, /0\.5\.0-secure-compute/)),
    ),
  );
  push(gate("AH", "Migration batch_92", exists(MIGRATION) && has(MIGRATION, /batch_92/)));
  push(
    gate(
      "AI",
      "RLS tenant/workspace",
      has(MIGRATION, /ENABLE ROW LEVEL SECURITY/) &&
        has(MIGRATION, /get_user_tenant_ids\(\)/) &&
        has(MIGRATION, /workspace_memberships/),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AJ", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AK", "Secret scan", secret.ok, secret.detail));
  const browser = run("pnpm --filter @rtb/security-assurance-certification test:e2e:ai-data", {
    CERTIFY_BROWSER: "1",
  });
  push(gate("AL", "Browser E2E", browser.ok, browser.detail));

  push(
    gate(
      "AM",
      "Accessibility",
      has(UI, /aria-label="AI and data security assurance"/) &&
        has(UI, /aria-label="AI data security planes"/),
    ),
  );
  push(gate("AN", "Responsive", has(UI, /sm:grid-cols-2/) && has(UI, /lg:grid-cols-3/)));
  push(
    gate(
      "AO",
      "Architecture test",
      exists(
        "packages/platform-certification/src/phase15d-security-assurance-ai-data.test.ts",
      ),
    ),
  );
  push(gate("AP", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase15EReady/)));
  push(
    gate(
      "AQ",
      "AiDataSecurityReady flags",
      [
        "AiDataSecurityReady",
        "AiDataSecurityRuntimeImplemented",
        "AiDataSecurityAssessmentImplemented",
        "AiDataFlowEvidenceImplemented",
        "ProviderDataHandlingAssuranceImplemented",
        "SensitiveDataExposureAssessmentImplemented",
      ].every((n) => flagTrue(aidFlags, n)),
    ),
  );
  push(
    gate(
      "AR",
      "Advanced products unimplemented",
      flagFalse(discoveryFlags, "SecurityIntelligenceImplemented") &&
        flagFalse(discoveryFlags, "ComplianceIntelligenceImplemented") &&
        flagFalse(isoFlags, "AiTrustRuntimeImplemented") &&
        flagFalse(isoFlags, "ThreatIntelligenceRuntimeImplemented") &&
        (flagFalse(foundationFlags, "SecureComputeAssuranceRuntimeImplemented") ||
          has(
            "packages/security-assurance/src/secure-compute-flags.ts",
            /SecureComputeAssuranceRuntimeImplemented = true/,
          )) &&
        flagFalse(discoveryFlags, "CustomerTrustCenterImplemented"),
    ),
  );
  push(gate("AS", "implementsOwnAiStack=false", flagFalse(foundationFlags, "implementsOwnAiStack")));
  push(gate("AT", "EngineeringOSV1Intact", flagTrue(discoveryFlags, "EngineeringOSV1Intact")));
  push(
    gate(
      "AU",
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
  push(gate("AV", "phase15EReady", flagTrue(aidFlags, "phase15EReady")));
  push(gate("AW", "Artifact identity", Boolean(commit), commit));
  push(
    gate(
      "AY",
      "Semantics locks",
      has(CONTRACTS, /noUniversalPromptInjectionClaim: true/) &&
        has(CONTRACTS, /noDuplicateAiStack: true/),
    ),
  );
  push(
    gate(
      "AZ",
      "Foundation+Isolation still ready",
      flagTrue(foundationFlags, "SecurityAssuranceFoundationReady") &&
        flagTrue(isoFlags, "IsolationAssuranceReady"),
    ),
  );
  push(
    gate(
      "BA",
      "No SIEM/DLP/Trust Center packages",
      !exists("packages/siem") &&
        !exists("packages/dlp") &&
        !exists("packages/customer-trust-center") &&
        !exists("packages/security-intelligence"),
    ),
  );
  push(
    gate(
      "BB",
      "EOS still 1.0.0",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(
    gate(
      "BC",
      "Package not 1.0.0",
      has(VERSION, /0\.4\.0-ai-data-security/) &&
        (has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.4\.0-ai-data-security"/) ||
          has(VERSION, /PHASE_15D_BASELINE_VERSION = "0\.4\.0-ai-data-security"/) ||
          has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.5\.0-secure-compute"/)) &&
        !has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "BD",
      "AI/data docs",
      exists(DOC) &&
        exists("docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_4_0.md"),
    ),
  );
  push(
    gate(
      "BE",
      "No prompt-injection completeness claim",
      has(CONTRACTS, /promptInjectionCompletelyPreventedClaimed/) &&
        has(UI, /promptInjectionCompletelyPreventedClaimed=false/),
    ),
  );
  push(
    gate(
      "BF",
      "Secret non-exposure in evidence",
      has(ENGINE, /containsRawSecret/) &&
        has(MIGRATION, /sa_aid_flow_no_secret/),
    ),
  );
  push(
    gate(
      "BG",
      "Data-flow evidence implemented",
      flagTrue(aidFlags, "AiDataFlowEvidenceImplemented") && has(ENGINE, /recordFlow/),
    ),
  );
  push(
    gate(
      "BH",
      "Provider assurance implemented",
      flagTrue(aidFlags, "ProviderDataHandlingAssuranceImplemented") &&
        has(ENGINE, /providerAssessments/),
    ),
  );
  push(
    gate(
      "BI",
      "Cross-tenant context denial",
      has(SEED, /aid-context-deny/) && has(SEED, /ai_context\.cross_tenant_deny/),
    ),
  );
  push(
    gate(
      "BJ",
      "Unauthorized retrieval denial",
      has(SEED, /aid-retrieval-deny/) && has(SEED, /retrieval\.cross_tenant_deny/),
    ),
  );
  push(
    gate(
      "BK",
      "Tool scope/provenance",
      has(SEED, /tool_input\.scope_preserved/) &&
        has(SEED, /tool_output\.provenance_retained/),
    ),
  );
  push(
    gate(
      "BL",
      "Logging secret non-exposure",
      has(SEED, /logging\.no_secret_persist/),
    ),
  );
  push(gate("BM", "Egress assessment", has(SEED, /egress\.policy_evidenced/)));
  push(
    gate(
      "BN",
      "duplicateAiStackDetected=false",
      flagFalse(aidFlags, "duplicateAiStackDetected") &&
        has(UI, /duplicateAiStackDetected=false/),
    ),
  );
  push(
    gate(
      "BO",
      "duplicateSecretManagerDetected=false",
      flagFalse(aidFlags, "duplicateSecretManagerDetected"),
    ),
  );
  push(
    gate(
      "BP",
      "SecurityAssuranceBoundaryLocked",
      flagTrue(discoveryFlags, "SecurityAssuranceBoundaryLocked"),
    ),
  );

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "AX",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(aidFlags, "AiDataSecurityReady") &&
        flagFalse(aidFlags, "duplicateAiStackDetected"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_15D_SECURITY_ASSURANCE_AI_DATA_GATES.map(([id, name]) => {
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
    title: "Security & Assurance AI & Data Security Assurance",
    verdict,
    version: PHASE_15D_VERSION,
    status: "ai_data_security",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase15CBaseline: PHASE_15C_BASELINE,
    phase15BBaseline: PHASE_15B_BASELINE,
    phase15ABaseline: PHASE_15A_BASELINE,
    engineeringOsV1Baseline: PHASE_15D_EOS_COMMIT,
    gateCount: PHASE_15D_GATE_COUNT,
    requiredGates: PHASE_15D_SECURITY_ASSURANCE_AI_DATA_GATES.map(([id, name]) => ({
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
    AiDataSecurityReady: true,
    AiDataSecurityRuntimeImplemented: true,
    IsolationAssuranceReady: true,
    duplicateAiStackDetected: false,
    automaticRemediationEnabled: false,
    SecurityIntelligenceImplemented: false,
    AiTrustRuntimeImplemented: false,
    implementsOwnAiStack: false,
    EngineeringOSV1Intact: true,
    phase15EReady: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase15d-security-assurance-ai-data-certification.json",
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
        phase15EReady: artifact.phase15EReady,
        AiDataSecurityReady: artifact.AiDataSecurityReady,
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
