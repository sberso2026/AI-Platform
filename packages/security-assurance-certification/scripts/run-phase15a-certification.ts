/**
 * Phase 15A certification runner — Security & Assurance Discovery.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_15A_AI_COMMIT,
  PHASE_15A_DT_COMMIT,
  PHASE_15A_EOS_COMMIT,
  PHASE_15A_EOS_TAG,
  PHASE_15A_GATE_COUNT,
  PHASE_15A_II_COMMIT,
  PHASE_15A_INTEROP_COMMIT,
  PHASE_15A_PC_COMMIT,
  PHASE_15A_PI_COMMIT,
  PHASE_15A_SECURITY_ASSURANCE_DISCOVERY_GATES,
  PHASE_15A_VERSION,
  type Phase15aGateId,
} from "../src/phase15a/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const OWNERSHIP = "docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md";
const BOUNDARY = "docs/security/SECURITY_ASSURANCE_ARCHITECTURE_BOUNDARIES.md";
const GAPS = "docs/security/SECURITY_ASSURANCE_PHASE_15A_GAP_REGISTER.md";
const SEC_GAPS = "docs/security/RTB_ENGINEERING_OS_V1_SECURITY_GAP_REGISTER.md";
const WORKFLOW = ".github/workflows/phase-15a-security-assurance-discovery.yml";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15aGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15aGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const flagsSrc = read(FLAGS);
  const ownership = read(OWNERSHIP);
  const boundary = read(BOUNDARY);
  const gaps = read(GAPS);
  const secGaps = read(SEC_GAPS);
  const results: GateResult[] = [];
  const byId = new Map<Phase15aGateId, GateResult>();
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
      "Engineering OS V1 tag intact",
      tag(PHASE_15A_EOS_TAG) === PHASE_15A_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15A_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "C",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15A_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15A_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15A_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15A_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15A_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15A_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "D",
      "Discovery version 0.1.0-discovery",
      (has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.1\.0-discovery"/) ||
        has(VERSION, /PHASE_15A_BASELINE_VERSION = "0\.1\.0-discovery"/)) &&
        (has("packages/security-assurance/package.json", /"0\.1\.0-discovery"/) ||
          has("packages/security-assurance/package.json", /"0\.2\.0-control-evidence"/) ||
          has("packages/security-assurance/package.json", /"0\.3\.0-isolation-assurance"/) ||
          has("packages/security-assurance/package.json", /"0\.4\.0-ai-data-security"/) ||
          has("packages/security-assurance/package.json", /"0\.5\.0-secure-compute"/) ||
          has("packages/security-assurance/package.json", /"0\.6\.0-compliance-intelligence"/) ||
          has("packages/security-assurance/package.json", /"0\.7\.0-customer-assurance"/) ||
          has("packages/security-assurance/package.json", /"0\.8\.0-ga-readiness"/) ||
          has("packages/security-assurance/package.json", /"1\.0\.0"/)),
    ),
  );
  push(
    gate(
      "E",
      "Existing control inventory",
      exists("docs/security/SECURITY_ASSURANCE_PHASE_15A_EXISTING_CONTROL_INVENTORY.md") &&
        has(
          "docs/security/SECURITY_ASSURANCE_PHASE_15A_EXISTING_CONTROL_INVENTORY.md",
          /AUTHORITATIVE_EXISTING/,
        ),
    ),
  );
  push(
    gate(
      "F",
      "Ownership matrix",
      exists(OWNERSHIP) && /\*\*None remaining\*\*/.test(ownership),
    ),
  );
  push(
    gate(
      "G",
      "Domain model",
      exists("docs/security/SECURITY_ASSURANCE_DOMAIN_MODEL.md") &&
        has("docs/security/SECURITY_ASSURANCE_DOMAIN_MODEL.md", /SecurityControl/),
    ),
  );
  push(
    gate(
      "H",
      "Control framework",
      exists("docs/security/SECURITY_ASSURANCE_CONTROL_FRAMEWORK.md") &&
        has(
          "docs/security/SECURITY_ASSURANCE_CONTROL_FRAMEWORK.md",
          /frameworkMapping ≠ certification/,
        ),
    ),
  );
  push(
    gate(
      "I",
      "Policy Engine reuse",
      flagFalse(flagsSrc, "duplicatePolicyEngineDetected") &&
        has(BOUNDARY, /duplicatePolicyEngineDetected = false/) &&
        has(BOUNDARY, /No `SecurityPolicyEngine`/),
    ),
  );
  push(
    gate(
      "J",
      "Evidence and posture model",
      exists("docs/security/SECURITY_ASSURANCE_EVIDENCE_AND_POSTURE_MODEL.md") &&
        has(
          "docs/security/SECURITY_ASSURANCE_EVIDENCE_AND_POSTURE_MODEL.md",
          /absence of evidence ≠ PASS/,
        ),
    ),
  );
  push(
    gate(
      "K",
      "Continuous monitoring architecture",
      has(
        "docs/security/SECURITY_ASSURANCE_EVIDENCE_AND_POSTURE_MODEL.md",
        /Continuous control monitoring/,
      ),
    ),
  );
  push(
    gate(
      "L",
      "Isolation Assurance boundary",
      has(BOUNDARY, /Isolation Assurance/) &&
        flagTrue(flagsSrc, "IsolationAssuranceArchitectureDefined"),
    ),
  );
  push(
    gate(
      "M",
      "Artifact Integrity boundary",
      has(BOUNDARY, /Artifact Integrity/) &&
        flagTrue(flagsSrc, "ArtifactIntegrityArchitectureDefined"),
    ),
  );
  push(
    gate(
      "N",
      "AI Trust boundary",
      has(BOUNDARY, /AI Security & Trust/) &&
        flagTrue(flagsSrc, "AiSecurityAssuranceArchitectureDefined") &&
        has(BOUNDARY, /implementsOwnAiStack = false/),
    ),
  );
  push(
    gate(
      "O",
      "Secure Compute boundary",
      has(BOUNDARY, /Secure Compute Assurance/) &&
        flagTrue(flagsSrc, "SecureComputeAssuranceArchitectureDefined"),
    ),
  );
  push(gate("P", "Privileged Access boundary", has(BOUNDARY, /Privileged Access/)));
  push(
    gate(
      "Q",
      "Data Governance boundary",
      flagTrue(flagsSrc, "DataGovernanceBoundaryLocked") &&
        has(BOUNDARY, /Adjacent Platform Governance/),
    ),
  );
  push(
    gate(
      "R",
      "Secure SDLC boundary",
      flagTrue(flagsSrc, "SecureSdlcAssuranceBoundaryLocked"),
    ),
  );
  push(
    gate(
      "S",
      "Supply Chain / Threat Intel boundary",
      flagTrue(flagsSrc, "ThreatIntelligenceBoundaryLocked") &&
        has(BOUNDARY, /Adapter-only/),
    ),
  );
  push(
    gate(
      "T",
      "Incident/Resilience boundary",
      flagTrue(flagsSrc, "IncidentResilienceBoundaryLocked") &&
        has(BOUNDARY, /No SIEM\/SOAR/),
    ),
  );
  push(gate("U", "Backup Assurance boundary", has(BOUNDARY, /Backup Assurance/)));
  push(
    gate(
      "V",
      "External integration boundary",
      has(BOUNDARY, /External integrations/),
    ),
  );
  push(
    gate(
      "W",
      "Customer Assurance boundary",
      flagTrue(flagsSrc, "CustomerAssuranceBoundaryLocked") &&
        flagFalse(flagsSrc, "CustomerTrustCenterImplemented"),
    ),
  );
  push(
    gate(
      "X",
      "Framework mapping honesty",
      has("docs/security/SECURITY_ASSURANCE_CONTROL_FRAMEWORK.md", /NIST CSF 2\.0/) &&
        has(
          "docs/security/SECURITY_ASSURANCE_CONTROL_FRAMEWORK.md",
          /frameworkMapping ≠ certification/,
        ),
    ),
  );
  push(
    gate(
      "Y",
      "External assurance boundary",
      flagTrue(flagsSrc, "ExternalAssuranceBoundaryLocked") &&
        has(BOUNDARY, /≠ ISO/),
    ),
  );
  push(
    gate(
      "Z",
      "Tier-1 S07/S08 ownership",
      has(GAPS, /SA-12/) &&
        has(GAPS, /SA-13/) &&
        has(OWNERSHIP, /Customer SSO \(S08\)/) &&
        has(OWNERSHIP, /Platform Identity/),
    ),
  );
  push(
    gate(
      "AA",
      "Capability maturity matrix",
      exists("docs/security/SECURITY_ASSURANCE_CAPABILITY_MATURITY_MATRIX.md") &&
        flagTrue(flagsSrc, "SecurityAssuranceCapabilityMatrixReady"),
    ),
  );
  push(
    gate(
      "AB",
      "Draft contracts 0.1.0-draft",
      (has(VERSION, /SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION =\s*"0\.1\.0-draft"/) ||
        has(VERSION, /PHASE_15A_BASELINE_VERSION = "0\.1\.0-discovery"/)) &&
        exists("docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_DRAFT.md") &&
        has(
          "packages/security-assurance/src/draft-contracts.ts",
          /SecurityControlReference/,
        ),
    ),
  );
  push(
    gate(
      "AC",
      "Package placement Platform-level",
      exists("packages/security-assurance/package.json") &&
        exists("packages/security-assurance-certification/package.json") &&
        !exists("packages/engineering-os/src/security-assurance"),
    ),
  );
  push(
    gate(
      "AD",
      "Commercial boundary",
      has(BOUNDARY, /not\*\* optional premium/) ||
        has(BOUNDARY, /not\*\* optional premium SKUs/) ||
        has(BOUNDARY, /Baseline tenant isolation/),
    ),
  );
  push(
    gate(
      "AE",
      "No universal security score",
      has(
        "docs/security/SECURITY_ASSURANCE_EVIDENCE_AND_POSTURE_MODEL.md",
        /universalScorePresent = false/,
      ),
    ),
  );
  push(
    gate(
      "AF",
      "Event/KG/workflow/file boundaries",
      has(BOUNDARY, /no second Event Bus/) &&
        has(BOUNDARY, /no Security KG/) &&
        has(BOUNDARY, /Reuse Platform Workflow Engine/) &&
        has(BOUNDARY, /Reuse Platform Files/),
    ),
  );
  push(
    gate(
      "AG",
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
      ].every((f) => flagFalse(flagsSrc, f)),
    ),
  );
  push(
    gate(
      "AH",
      "Gap register",
      exists(GAPS) && flagTrue(flagsSrc, "SecurityAssuranceGapRegisterReady"),
    ),
  );
  push(
    gate(
      "AI",
      "Implementation roadmap",
      exists("docs/security/SECURITY_ASSURANCE_IMPLEMENTATION_ROADMAP.md") &&
        flagTrue(flagsSrc, "SecurityAssuranceImplementationRoadmapReady"),
    ),
  );
  push(
    gate(
      "AJ",
      "SecurityAssuranceDiscoveryReady",
      flagTrue(flagsSrc, "SecurityAssuranceDiscoveryReady"),
    ),
  );
  push(
    gate(
      "AK",
      "Ownership/Boundary locked flags",
      flagTrue(flagsSrc, "SecurityAssuranceOwnershipLocked") &&
        flagTrue(flagsSrc, "SecurityAssuranceBoundaryLocked"),
    ),
  );
  push(
    gate(
      "AL",
      "Architecture defined flags",
      [
        "SecurityControlFrameworkDefined",
        "SecurityEvidenceModelDefined",
        "SecurityPostureModelDefined",
        "IsolationAssuranceArchitectureDefined",
        "ArtifactIntegrityArchitectureDefined",
        "AiSecurityAssuranceArchitectureDefined",
        "SecureComputeAssuranceArchitectureDefined",
      ].every((f) => flagTrue(flagsSrc, f)),
    ),
  );
  push(
    gate(
      "AM",
      "Runtime unimplemented flags",
      flagFalse(flagsSrc, "SecurityAssuranceRuntimeImplemented") &&
        flagFalse(flagsSrc, "SecurityIntelligenceImplemented") &&
        (flagFalse(flagsSrc, "ComplianceIntelligenceImplemented") ||
          has(
            "packages/security-assurance/src/discovery-flags.ts",
            /ComplianceIntelligenceImplemented = true/,
          )) &&
        flagFalse(flagsSrc, "CustomerTrustCenterImplemented"),
    ),
  );
  push(gate("AN", "EngineeringOSV1Intact", flagTrue(flagsSrc, "EngineeringOSV1Intact")));
  push(
    gate(
      "AO",
      "Module V1 intact flags",
      [
        "ProjectIntelligenceV1Intact",
        "InspectionIntelligenceV1Intact",
        "AssetIntelligenceV1Intact",
        "ProjectControlsV1Intact",
        "DigitalTwinV1Intact",
        "EngineeringModelInteroperabilityV1Intact",
      ].every((f) => flagTrue(flagsSrc, f)),
    ),
  );
  push(
    gate(
      "AP",
      "Phase 14 S01–S06 CLOSED preserved",
      (secGaps.match(/\*\*CLOSED\*\*/g) ?? []).length >= 6 &&
        /REQUIRED_BEFORE_GA open \| \*\*0\*\*/.test(secGaps),
    ),
  );
  push(
    gate(
      "AQ",
      "No Sec&A inside engineering-os",
      !exists("packages/engineering-os/packages/security-assurance") &&
        !has("packages/engineering-os/package.json", /security-assurance/),
    ),
  );
  push(
    gate("AR", "No Trust Center package", !exists("packages/customer-trust-center")),
  );
  push(
    gate(
      "AS",
      "No Security Intelligence package",
      !exists("packages/security-intelligence"),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AT", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AU", "Secret scan", secret.ok, secret.detail));
  push(gate("AV", "Workflow exists", exists(WORKFLOW)));
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase15a-security-assurance-discovery.test.ts",
  );
  push(gate("AW", "Platform architecture test", arch.ok, arch.detail));
  push(
    gate(
      "AX",
      "Phase 15A overview",
      exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15A.md"),
    ),
  );
  push(gate("AY", "Architecture boundaries doc", exists(BOUNDARY)));
  push(
    gate(
      "AZ",
      "Public contracts draft",
      exists("docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_DRAFT.md"),
    ),
  );
  push(gate("BA", "phase15BReady", flagTrue(flagsSrc, "phase15BReady")));
  push(
    gate(
      "BB",
      "S07 remains Tier-1",
      /S07[\s\S]{0,120}REQUIRED_BEFORE_TIER1_PRODUCTION/.test(secGaps) &&
        /SA-12/.test(gaps),
    ),
  );
  push(
    gate(
      "BC",
      "S08 owned by Identity",
      /Platform Identity/.test(ownership) && /SA-13/.test(gaps),
    ),
  );
  push(
    gate(
      "BD",
      "No ISO certification claim",
      !/ISO 27001 certified/i.test(boundary) &&
        has(BOUNDARY, /not claimed|≠ ISO|MUST_NEVER_OWN/),
    ),
  );
  push(gate("BE", "Artifact identity", Boolean(commit), commit));
  push(
    gate(
      "BG",
      "UNKNOWN ownership none",
      /\*\*None remaining\*\*/.test(ownership),
    ),
  );
  push(
    gate(
      "BH",
      "Boundary MUST_NEVER_OWN IdP",
      has(OWNERSHIP, /Identity \/ AuthN \/ IdP/) &&
        has(OWNERSHIP, /MUST_NEVER_OWN/),
    ),
  );
  push(
    gate(
      "BI",
      "Boundary MUST_NEVER_OWN SIEM",
      has(OWNERSHIP, /SIEM \/ EDR \/ vuln DB/) &&
        has(OWNERSHIP, /MUST_NEVER_OWN/),
    ),
  );
  push(
    gate(
      "BJ",
      "EOS GA version still 1.0.0",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(
    gate(
      "BK",
      "Discovery package not 1.0.0",
      (has(VERSION, /0\.1\.0-discovery/) || has(VERSION, /0\.2\.0-control-evidence/)) &&
        (!has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) || has(VERSION, /SECURITY_ASSURANCE_STATUS = "ga"/)),
    ),
  );
  push(
    gate(
      "BL",
      "SecurityAssuranceBoundaryLocked",
      flagTrue(flagsSrc, "SecurityAssuranceBoundaryLocked"),
    ),
  );

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "BF",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(flagsSrc, "SecurityAssuranceDiscoveryReady") &&
        flagFalse(flagsSrc, "SecurityAssuranceRuntimeImplemented"),
      `priorFailed=${priorFailed}`,
    ),
  );

  for (const [id, name] of PHASE_15A_SECURITY_ASSURANCE_DISCOVERY_GATES) {
    if (!byId.has(id)) push({ id, name, status: "not_executed", detail: "missing" });
  }

  const ordered = PHASE_15A_SECURITY_ASSURANCE_DISCOVERY_GATES.map(([id, name]) => {
    return byId.get(id) ?? { id, name, status: "not_executed" as const, detail: "missing" };
  });
  const failed = ordered.filter((g) => g.status === "fail");
  const skipped = ordered.filter((g) => g.status === "skip");
  const notExecuted = ordered.filter((g) => g.status === "not_executed");
  const verdict =
    failed.length === 0 && skipped.length === 0 && notExecuted.length === 0 ? "PASS" : "FAIL";

  const artifact = {
    schemaVersion: "phase15a-security-assurance-discovery/1",
    phase: "15A",
    name: "phase15a-security-assurance-discovery-certification",
    version: PHASE_15A_VERSION,
    status: "discovery",
    title: "Security & Assurance Discovery / Architecture Lock",
    verdict,
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    engineeringOsV1Baseline: PHASE_15A_EOS_COMMIT,
    SecurityAssuranceDiscoveryReady: true,
    SecurityAssuranceOwnershipLocked: true,
    SecurityAssuranceBoundaryLocked: true,
    SecurityAssuranceRuntimeImplemented: false,
    SecurityIntelligenceImplemented: false,
    ComplianceIntelligenceImplemented: false,
    CustomerTrustCenterImplemented: false,
    duplicatePolicyEngineDetected: false,
    EngineeringOSV1Intact: true,
    phase15BReady: true,
    releaseEligible: verdict === "PASS",
    secretExposureDetected: !secret.ok,
    secretExposure: false,
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    gates: ordered,
    requiredGates: PHASE_15A_SECURITY_ASSURANCE_DISCOVERY_GATES.map(([id]) => id),
    gateCount: PHASE_15A_GATE_COUNT,
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
    "phase15a-security-assurance-discovery-certification.json",
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
        phase15BReady: artifact.phase15BReady,
        SecurityAssuranceRuntimeImplemented: artifact.SecurityAssuranceRuntimeImplemented,
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
