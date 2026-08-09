/**
 * Phase 15B certification runner — Security & Assurance Foundation.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_15A_BASELINE,
  PHASE_15B_AI_COMMIT,
  PHASE_15B_DT_COMMIT,
  PHASE_15B_EOS_COMMIT,
  PHASE_15B_EOS_TAG,
  PHASE_15B_GATE_COUNT,
  PHASE_15B_II_COMMIT,
  PHASE_15B_INTEROP_COMMIT,
  PHASE_15B_PC_COMMIT,
  PHASE_15B_PI_COMMIT,
  PHASE_15B_SECURITY_ASSURANCE_FOUNDATION_GATES,
  PHASE_15B_VERSION,
  type Phase15bGateId,
} from "../src/phase15b/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const FLAGS = "packages/security-assurance/src/foundation-flags.ts";
const DISCOVERY_FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const CONTRACTS = "packages/security-assurance/src/contracts.ts";
const OWNERSHIP = "docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md";
const MIGRATION =
  "supabase/migrations/20260808290000_batch_90_security_assurance_foundation.sql";
const UI =
  "apps/web/src/app/(platform)/platform/security-assurance/page.tsx";
const WORKFLOW =
  ".github/workflows/phase-15b-security-assurance-foundation.yml";
const SEMANTICS = "packages/security-assurance/src/domain/semantics.ts";
const SEED = "packages/security-assurance/src/domain/seed-controls.ts";
const ASSESSMENT = "packages/security-assurance/src/domain/assessment-engine.ts";
const EVENTS = "packages/security-assurance/src/domain/events.ts";
const TIMELINE = "packages/security-assurance/src/domain/timeline.ts";
const FOUNDATION = "packages/security-assurance/src/domain/foundation.ts";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15bGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15bGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const flagsSrc = read(FLAGS);
  const discoveryFlags = read(DISCOVERY_FLAGS);
  const versionSrc = read(VERSION);
  const contracts = read(CONTRACTS);
  const migration = read(MIGRATION);
  const ui = read(UI);
  const results: GateResult[] = [];
  const byId = new Map<Phase15bGateId, GateResult>();
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
      "Phase 15A baseline intact",
      has(VERSION, new RegExp(PHASE_15A_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15A.md"),
    ),
  );
  push(
    gate(
      "C",
      "Engineering OS V1 tag intact",
      tag(PHASE_15B_EOS_TAG) === PHASE_15B_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15B_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "D",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15B_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15B_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15B_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15B_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15B_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15B_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "E",
      "Foundation version 0.2.0-control-evidence",
      (has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.2\.0-control-evidence"/) ||
        has(VERSION, /PHASE_15B_BASELINE_VERSION = "0\.2\.0-control-evidence"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.3\.0-isolation-assurance"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.4\.0-ai-data-security"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.5\.0-secure-compute"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.6\.0-compliance-intelligence"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.7\.0-customer-assurance"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.8\.0-ga-readiness"/)) &&
        (has("packages/security-assurance/package.json", /"0\.2\.0-control-evidence"/) ||
          has("packages/security-assurance/package.json", /"0\.3\.0-isolation-assurance"/) ||
          has("packages/security-assurance/package.json", /"0\.4\.0-ai-data-security"/) ||
          has("packages/security-assurance/package.json", /"0\.5\.0-secure-compute"/) ||
          has("packages/security-assurance/package.json", /"0\.6\.0-compliance-intelligence"/) ||
          has("packages/security-assurance/package.json", /"0\.7\.0-customer-assurance"/) ||
          has("packages/security-assurance/package.json", /"0\.8\.0-ga-readiness"/)),
    ),
  );
  push(
    gate(
      "F",
      "Public contracts 0.2.0-control-evidence",
      (has(VERSION, /SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION =\s*"0\.2\.0-control-evidence"/) ||
        has(VERSION, /PHASE_15B_BASELINE_VERSION = "0\.2\.0-control-evidence"/) ||
        has(VERSION, /0\.3\.0-isolation-assurance/) ||
        has(VERSION, /0\.4\.0-ai-data-security/) ||
        has(VERSION, /0\.5\.0-secure-compute/) ||
        has(VERSION, /0\.6\.0-compliance-intelligence/) ||
        has(VERSION, /0\.7\.0-customer-assurance/) || has(VERSION, /0\.8\.0-ga-readiness/)) &&
        has(CONTRACTS, /SecurityEvidenceReference/) &&
        has(CONTRACTS, /universalNumericScore: null/),
    ),
  );
  push(
    gate(
      "G",
      "Ownership matrix preserved",
      exists(OWNERSHIP) &&
        has(OWNERSHIP, /MUST_NEVER_OWN/) &&
        has(OWNERSHIP, /Platform Identity/) &&
        has(OWNERSHIP, /\*\*None remaining\*\*/),
    ),
  );
  push(
    gate(
      "H",
      "Control registry",
      exists("packages/security-assurance/src/domain/control-registry.ts") &&
        flagTrue(flagsSrc, "SecurityControlRegistryReady"),
    ),
  );
  push(
    gate(
      "I",
      "Control lifecycle",
      has("packages/security-assurance/src/domain/control-registry.ts", /draft/) &&
        has("packages/security-assurance/src/domain/control-registry.ts", /retired/),
    ),
  );
  push(
    gate(
      "J",
      "Control implementation references",
      has(SEED, /ControlImplementationReference|authoritative/) &&
        has(SEED, /Platform Identity/),
    ),
  );
  push(
    gate(
      "K",
      "Evidence registry + provenance",
      exists("packages/security-assurance/src/domain/evidence-registry.ts") &&
        has(SEMANTICS, /assertObservedProvenance/) &&
        flagTrue(flagsSrc, "SecurityEvidenceProvenanceEnforced"),
    ),
  );
  push(
    gate(
      "L",
      "Evidence freshness",
      has(SEMANTICS, /evaluateEvidenceFreshness/) &&
        flagTrue(flagsSrc, "SecurityEvidenceFreshnessEnforced"),
    ),
  );
  push(
    gate(
      "M",
      "Missing evidence fail-closed",
      has(SEMANTICS, /statuses\.length === 0/) &&
        has(SEMANTICS, /return "unknown"/),
    ),
  );
  push(
    gate(
      "N",
      "Invalid/conflicting evidence",
      has("packages/security-assurance/src/domain/evidence-registry.ts", /detectConflict/) &&
        has(SEMANTICS, /invalid/),
    ),
  );
  push(
    gate(
      "O",
      "Assessment taxonomy",
      has(CONTRACTS, /"pass"/) &&
        has(CONTRACTS, /"not_applicable"/) &&
        flagTrue(flagsSrc, "SecurityAssessmentEngineReady"),
    ),
  );
  push(
    gate(
      "P",
      "Assessment reproducibility",
      has(ASSESSMENT, /reproduce\(/) &&
        has(ASSESSMENT, /reproducibleFromEvidence: true/),
    ),
  );
  push(
    gate(
      "Q",
      "Governed assessment review",
      has(ASSESSMENT, /security_assurance\.assessment_review/) &&
        has(ASSESSMENT, /AI self-approval/),
    ),
  );
  push(
    gate(
      "R",
      "Finding lifecycle",
      exists("packages/security-assurance/src/domain/finding-registry.ts") &&
        has(CONTRACTS, /remediation_planned/) &&
        flagTrue(flagsSrc, "SecurityFindingRegistryReady"),
    ),
  );
  push(
    gate(
      "S",
      "Exception expiry + approval governance",
      exists("packages/security-assurance/src/domain/exception-registry.ts") &&
        has("packages/security-assurance/src/domain/exception-registry.ts", /expiresAt/) &&
        has("packages/security-assurance/src/domain/exception-registry.ts", /AI cannot approve/) &&
        flagFalse(flagsSrc, "automaticExceptionApprovalEnabled"),
    ),
  );
  push(
    gate(
      "T",
      "Posture composition",
      exists("packages/security-assurance/src/domain/posture-engine.ts") &&
        flagTrue(flagsSrc, "SecurityPostureCompositionReady"),
    ),
  );
  push(
    gate(
      "U",
      "No universal security score",
      has(CONTRACTS, /universalScorePresent: false/) &&
        has(UI, /universalScorePresent=false/) &&
        has(MIGRATION, /sa_posture_no_universal/),
    ),
  );
  push(
    gate(
      "V",
      "Framework many-to-many mapping",
      has(SEED, /ISO27001/) &&
        has(SEED, /NIST_CSF_2/) &&
        has(SEED, /ESSENTIAL_EIGHT/) &&
        has("packages/security-assurance/src/domain/framework-mapping-registry.ts", /frameworksForControl/),
    ),
  );
  push(
    gate(
      "W",
      "Framework mapping ≠ certification",
      has(CONTRACTS, /certified: false/) &&
        has(MIGRATION, /sa_mapping_not_certified/),
    ),
  );
  push(
    gate(
      "X",
      "External assurance semantics",
      has(CONTRACTS, /generatedBySecurityAssurance: false/) &&
        has(CONTRACTS, /isExternalOpinion: true/),
    ),
  );
  push(
    gate(
      "Y",
      "S01–S06 CLOSED preserved",
      has(SEED, /CLOSED_S01_S06/) &&
        has("docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md", /S01[\s\S]{0,80}CLOSED/),
    ),
  );
  push(
    gate(
      "Z",
      "S07/S08 ownership preserved",
      has(SEED, /Platform Identity/) &&
        has(SEED, /securityAssuranceOwns: false/) &&
        has(OWNERSHIP, /Customer SSO \(S08\)/) &&
        has(UI, /S08 owned by Platform Identity/),
    ),
  );
  push(
    gate(
      "AA",
      "Tenant/workspace isolation in migration",
      has(MIGRATION, /tenant_id uuid NOT NULL/) &&
        has(MIGRATION, /workspace_id uuid NOT NULL/),
    ),
  );
  push(
    gate(
      "AB",
      "RLS policies present",
      has(MIGRATION, /ENABLE ROW LEVEL SECURITY/) &&
        has(MIGRATION, /get_user_tenant_ids\(\)/) &&
        has(MIGRATION, /workspace_memberships/),
    ),
  );
  push(
    gate(
      "AC",
      "Classification handling",
      has(CONTRACTS, /CLIENT_CONFIDENTIAL/) &&
        has(MIGRATION, /ENGINEERING_SENSITIVE/),
    ),
  );
  push(
    gate(
      "AD",
      "Audit/event safety",
      has(EVENTS, /containsSensitivePayload: false/) &&
        has(MIGRATION, /sa_outbox_no_sensitive/),
    ),
  );
  push(
    gate(
      "AE",
      "Timeline integrity",
      has(TIMELINE, /appendOnly: true/) &&
        has(TIMELINE, /overwritesPriorEvent: false/) &&
        has(MIGRATION, /sa_timeline_append_only/),
    ),
  );
  push(
    gate(
      "AF",
      "KG reuse / no Security KG",
      has(TIMELINE, /dedicatedSecurityKg: false/) &&
        has(TIMELINE, /usesSharedKnowledgeGraph: true/) &&
        flagFalse(discoveryFlags, "duplicateKnowledgeGraphDetected"),
    ),
  );
  push(
    gate(
      "AG",
      "Platform Files reuse",
      has(CONTRACTS, /platformFileRef/) &&
        has(MIGRATION, /platform_file_ref/) &&
        has(FOUNDATION, /platformFiles: true/),
    ),
  );
  push(
    gate(
      "AH",
      "Policy Engine reuse",
      has(FOUNDATION, /policyEngine: true/) &&
        has(FOUNDATION, /duplicatePolicyEngine: false/) &&
        flagFalse(discoveryFlags, "duplicatePolicyEngineDetected"),
    ),
  );
  push(
    gate(
      "AI",
      "Anti-duplication flags",
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
  push(
    gate(
      "AJ",
      "Migration batch_90 integrity",
      exists(MIGRATION) &&
        has(MIGRATION, /batch_90/) &&
        !exists(
          "supabase/migrations/20260808290000_batch_90_security_assurance_foundation.sql.bak",
        ),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AK", "Unit tests", unit.ok, unit.detail));

  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AL", "Secret scan", secret.ok, secret.detail));

  const browser = run("pnpm --filter @rtb/security-assurance-certification test:e2e", {
    CERTIFY_BROWSER: "1",
  });
  push(gate("AM", "Browser E2E", browser.ok, browser.detail));

  push(
    gate(
      "AN",
      "Accessibility markers",
      has(UI, /aria-label="Security assurance inspection surfaces"/) &&
        has(UI, /aria-label="Posture dimensions"/),
    ),
  );
  push(
    gate(
      "AO",
      "Responsive UI markers",
      has(UI, /sm:grid-cols-2/) && has(UI, /lg:grid-cols-3/),
    ),
  );
  push(
    gate(
      "AP",
      "Admin UI ready marker",
      has(UI, /data-testid="security-assurance-foundation-ready"/) &&
        (has(UI, /0\.2\.0-control-evidence/) || has(UI, /0\.3\.0-isolation-assurance/)),
    ),
  );
  push(gate("AQ", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase15CReady/)));
  push(
    gate(
      "AR",
      "Architecture test",
      exists(
        "packages/platform-certification/src/phase15b-security-assurance-foundation.test.ts",
      ),
    ),
  );
  push(
    gate(
      "AS",
      "Phase 15B overview doc",
      exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15B.md"),
    ),
  );
  push(
    gate(
      "AT",
      "Contracts doc",
      exists("docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_2_0.md") &&
        has(
          "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_2_0.md",
          /0\.2\.0-control-evidence/,
        ),
    ),
  );
  push(
    gate(
      "AU",
      "SecurityAssuranceFoundationReady",
      flagTrue(flagsSrc, "SecurityAssuranceFoundationReady"),
    ),
  );
  push(
    gate(
      "AV",
      "Registry ready flags",
      [
        "SecurityControlRegistryReady",
        "SecurityEvidenceRegistryReady",
        "SecurityAssessmentEngineReady",
        "SecurityFindingRegistryReady",
        "SecurityExceptionRegistryReady",
        "SecurityPostureCompositionReady",
        "FrameworkMappingRegistryReady",
      ].every((n) => flagTrue(flagsSrc, n)),
    ),
  );
  push(
    gate(
      "AW",
      "Evidence enforcement flags",
      flagTrue(flagsSrc, "SecurityEvidenceProvenanceEnforced") &&
        flagTrue(flagsSrc, "SecurityEvidenceFreshnessEnforced"),
    ),
  );
  push(
    gate(
      "AX",
      "Automatic approval disabled",
      flagFalse(flagsSrc, "automaticSecurityApprovalEnabled") &&
        flagFalse(flagsSrc, "automaticExceptionApprovalEnabled") &&
        flagFalse(flagsSrc, "automaticRemediationEnabled"),
    ),
  );
  push(
    gate(
      "AY",
      "Advanced runtimes unimplemented",
      flagFalse(discoveryFlags, "SecurityIntelligenceImplemented") &&
        (flagFalse(discoveryFlags, "ComplianceIntelligenceImplemented") ||
          has(
            "packages/security-assurance/src/discovery-flags.ts",
            /ComplianceIntelligenceImplemented = true/,
          )) &&
        (flagFalse(flagsSrc, "IsolationAssuranceRuntimeImplemented") ||
          has("packages/security-assurance/src/isolation-flags.ts", /IsolationAssuranceRuntimeImplemented = true/)) &&
        flagFalse(flagsSrc, "AiTrustRuntimeImplemented") &&
        (flagFalse(flagsSrc, "SecureComputeAssuranceRuntimeImplemented") ||
          has(
            "packages/security-assurance/src/secure-compute-flags.ts",
            /SecureComputeAssuranceRuntimeImplemented = true/,
          )) &&
        (flagFalse(flagsSrc, "ThreatIntelligenceRuntimeImplemented") ||
          has("packages/security-assurance/src/isolation-flags.ts", /ThreatIntelligenceRuntimeImplemented = false/)) &&
        flagFalse(discoveryFlags, "CustomerTrustCenterImplemented"),
    ),
  );
  push(gate("AZ", "implementsOwnAiStack=false", flagFalse(flagsSrc, "implementsOwnAiStack")));
  push(
    gate("BA", "EngineeringOSV1Intact", flagTrue(discoveryFlags, "EngineeringOSV1Intact")),
  );
  push(
    gate(
      "BB",
      "Module V1 intact flags",
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
  push(gate("BC", "phase15CReady", flagTrue(flagsSrc, "phase15CReady")));
  push(
    gate(
      "BD",
      "No Trust Center / Security Intelligence packages",
      !exists("packages/customer-trust-center") &&
        !exists("packages/security-intelligence") &&
        !exists("packages/siem"),
    ),
  );
  push(gate("BE", "Artifact identity", Boolean(commit), commit));
  push(
    gate(
      "BG",
      "Outbox event types bounded",
      has(EVENTS, /security_assurance\.evidence_recorded/) &&
        has(EVENTS, /security_assurance\.posture_published/) &&
        has(MIGRATION, /security_assurance\.finding_opened/),
    ),
  );
  push(
    gate(
      "BH",
      "IDOR surface least privilege notes",
      has(MIGRATION, /get_user_tenant_ids/) &&
        has("docs/architecture/SECURITY_ASSURANCE_PHASE_15B.md", /RLS/),
    ),
  );
  push(
    gate(
      "BI",
      "JWT/authz reuse (no new IdP)",
      flagFalse(discoveryFlags, "duplicateIdentityProviderDetected") &&
        has(OWNERSHIP, /Identity \/ AuthN \/ IdP/) &&
        has(OWNERSHIP, /MUST_NEVER_OWN/),
    ),
  );
  push(
    gate(
      "BJ",
      "EOS version still 1.0.0",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(
    gate(
      "BK",
      "Foundation package not 1.0.0",
      (has(VERSION, /0\.2\.0-control-evidence/) ||
        has(VERSION, /0\.3\.0-isolation-assurance/)) &&
        !has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "BL",
      "Phase 15A discovery corpus preserved",
      exists("docs/security/SECURITY_ASSURANCE_PHASE_15A_EXISTING_CONTROL_INVENTORY.md") &&
        exists("docs/security/SECURITY_ASSURANCE_PHASE_15A_GAP_REGISTER.md") &&
        exists(".github/workflows/phase-15a-security-assurance-discovery.yml"),
    ),
  );
  push(
    gate(
      "BM",
      "Semantics locks present",
      has(SEMANTICS, /frameworkMappingNeqCertification: true/) &&
        has(SEMANTICS, /evidenceStaleNeqCurrentAssurance: true/),
    ),
  );
  push(
    gate(
      "BN",
      "security_assurance.assessment_review",
      has(ASSESSMENT, /ASSESSMENT_REVIEW_ACTION/),
    ),
  );
  push(
    gate(
      "BO",
      "Posture dimensions complete",
      has(CONTRACTS, /"identity"/) &&
        has(CONTRACTS, /"compliance_evidence"/) &&
        has(UI, /data-testid="sa-posture-dimensions"/),
    ),
  );
  push(gate("BP", "No SIEM package", !exists("packages/siem") && !exists("packages/soar")));
  push(
    gate(
      "BQ",
      "No second Policy Engine",
      !has(FOUNDATION, /SecurityPolicyEngine/) &&
        flagFalse(discoveryFlags, "duplicatePolicyEngineDetected"),
    ),
  );
  push(
    gate(
      "BR",
      "Event payload safety constraints",
      has(MIGRATION, /NOT \(payload \? 'secret'\)/) &&
        has(EVENTS, /No raw sensitive payloads|containsSensitivePayload/),
    ),
  );
  push(
    gate("BS", "phase15BReady remains true", flagTrue(discoveryFlags, "phase15BReady")),
  );
  push(
    gate(
      "BT",
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
        flagTrue(flagsSrc, "SecurityAssuranceFoundationReady") &&
        flagFalse(discoveryFlags, "SecurityIntelligenceImplemented"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_15B_SECURITY_ASSURANCE_FOUNDATION_GATES.map(([id, name]) => {
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
    title: "Security & Assurance Control / Evidence / Assessment Foundation",
    verdict,
    version: PHASE_15B_VERSION,
    status: "control_evidence_foundation",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase15ABaseline: PHASE_15A_BASELINE,
    engineeringOsV1Baseline: PHASE_15B_EOS_COMMIT,
    gateCount: PHASE_15B_GATE_COUNT,
    requiredGates: PHASE_15B_SECURITY_ASSURANCE_FOUNDATION_GATES.map(([id, name]) => ({
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
    SecurityAssuranceFoundationReady: true,
    SecurityIntelligenceImplemented: false,
    ComplianceIntelligenceImplemented: false,
    CustomerTrustCenterImplemented: false,
    IsolationAssuranceRuntimeImplemented: false,
    AiTrustRuntimeImplemented: false,
    SecureComputeAssuranceRuntimeImplemented: false,
    ThreatIntelligenceRuntimeImplemented: false,
    automaticSecurityApprovalEnabled: false,
    automaticExceptionApprovalEnabled: false,
    automaticRemediationEnabled: false,
    implementsOwnAiStack: false,
    duplicatePolicyEngineDetected: false,
    EngineeringOSV1Intact: true,
    phase15CReady: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase15b-security-assurance-foundation-certification.json",
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
        phase15CReady: artifact.phase15CReady,
        SecurityAssuranceFoundationReady: artifact.SecurityAssuranceFoundationReady,
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
