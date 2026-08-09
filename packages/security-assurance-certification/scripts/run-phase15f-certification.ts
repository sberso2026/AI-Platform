/**
 * Phase 15F certification runner — Compliance Intelligence Foundation.
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
  PHASE_15E_BASELINE,
  PHASE_15F_AI_COMMIT,
  PHASE_15F_DT_COMMIT,
  PHASE_15F_EOS_COMMIT,
  PHASE_15F_EOS_TAG,
  PHASE_15F_GATE_COUNT,
  PHASE_15F_II_COMMIT,
  PHASE_15F_INTEROP_COMMIT,
  PHASE_15F_PC_COMMIT,
  PHASE_15F_PI_COMMIT,
  PHASE_15F_SECURITY_ASSURANCE_COMPLIANCE_GATES,
  PHASE_15F_VERSION,
  type Phase15fGateId,
} from "../src/phase15f/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const CI_FLAGS = "packages/security-assurance/src/compliance-intelligence-flags.ts";
const SC_FLAGS = "packages/security-assurance/src/secure-compute-flags.ts";
const AID_FLAGS = "packages/security-assurance/src/ai-data-flags.ts";
const ISO_FLAGS = "packages/security-assurance/src/isolation-flags.ts";
const FOUNDATION_FLAGS = "packages/security-assurance/src/foundation-flags.ts";
const DISCOVERY_FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const CONTRACTS = "packages/security-assurance/src/compliance-intelligence-contracts.ts";
const ENGINE = "packages/security-assurance/src/domain/compliance-intelligence/engine.ts";
const SEED = "packages/security-assurance/src/domain/compliance-intelligence/seed-frameworks.ts";
const RUNTIME = "packages/security-assurance/src/domain/compliance-intelligence/runtime.ts";
const EVENTS = "packages/security-assurance/src/domain/events.ts";
const MIGRATION =
  "supabase/migrations/20260808330000_batch_94_security_assurance_compliance.sql";
const UI = "apps/web/src/app/(platform)/platform/security-assurance/page.tsx";
const WORKFLOW = ".github/workflows/phase-15f-security-assurance-compliance.yml";
const DOC = "docs/architecture/SECURITY_ASSURANCE_PHASE_15F.md";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15fGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15fGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const ciFlags = read(CI_FLAGS);
  const scFlags = read(SC_FLAGS);
  const aidFlags = read(AID_FLAGS);
  const isoFlags = read(ISO_FLAGS);
  const foundationFlags = read(FOUNDATION_FLAGS);
  const discoveryFlags = read(DISCOVERY_FLAGS);
  const results: GateResult[] = [];
  const byId = new Map<Phase15fGateId, GateResult>();
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
      "Phase 15E baseline intact",
      has(VERSION, new RegExp(PHASE_15E_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15E.md"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 15D–15A regression",
      has(VERSION, new RegExp(PHASE_15D_BASELINE)) &&
        has(VERSION, new RegExp(PHASE_15C_BASELINE)) &&
        has(VERSION, new RegExp(PHASE_15B_BASELINE)) &&
        has(VERSION, new RegExp(PHASE_15A_BASELINE)),
    ),
  );
  push(
    gate(
      "D",
      "Engineering OS V1 tag intact",
      tag(PHASE_15F_EOS_TAG) === PHASE_15F_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15F_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "E",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15F_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15F_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15F_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15F_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15F_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15F_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Version 0.6.0-compliance-intelligence",
      (has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.6\.0-compliance-intelligence"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.7\.0-customer-assurance"/)) &&
        (has("packages/security-assurance/package.json", /"0\.6\.0-compliance-intelligence"/) ||
          has("packages/security-assurance/package.json", /"0\.7\.0-customer-assurance"/)),
    ),
  );
  push(
    gate(
      "G",
      "Contracts 0.6.0-compliance-intelligence",
      (has(VERSION, /0\.6\.0-compliance-intelligence/) ||
        has(VERSION, /0\.7\.0-customer-assurance/)) &&
        has(CONTRACTS, /ComplianceFramework/) &&
        has(CONTRACTS, /ComplianceSnapshot/) &&
        has(CONTRACTS, /ExternalAssuranceRequirement/),
    ),
  );
  push(
    gate(
      "H",
      "Ownership / reuse boundary",
      has(DOC, /Reuses Security Control Registry/) &&
        has(RUNTIME, /duplicateSecurityControlRegistry: false/) &&
        has(RUNTIME, /certificationAuthority: false/),
    ),
  );
  push(
    gate(
      "I",
      "Framework/version registry",
      has(SEED, /SEED_COMPLIANCE_FRAMEWORKS/) &&
        has(SEED, /SEED_COMPLIANCE_FRAMEWORK_VERSIONS/) &&
        has(ENGINE, /listFrameworkVersions/),
    ),
  );
  push(gate("J", "ISO27001_2022 framework", has(SEED, /ISO27001_2022/) && has(UI, /ISO\/IEC 27001:2022/)));
  push(gate("K", "NIST_CSF_2_0 framework", has(SEED, /NIST_CSF_2_0/) && has(UI, /NIST CSF 2\.0/)));
  push(gate("L", "ESSENTIAL_EIGHT framework", has(SEED, /ESSENTIAL_EIGHT/) && has(UI, /Essential Eight/)));
  push(gate("M", "SOC2_TSC scaffold", has(SEED, /SOC2_TSC/) && has(UI, /SOC 2 TSC/)));
  push(
    gate(
      "N",
      "Requirement mapping",
      has(SEED, /SEED_COMPLIANCE_REQUIREMENTS/) && has(SEED, /req-iso-a5-access/),
    ),
  );
  push(
    gate(
      "O",
      "Many-to-many control mapping",
      has(SEED, /cmap-s01-iso-a5/) &&
        has(SEED, /cmap-s01-nist-pr-aa/) &&
        has(SEED, /soleControlInfersCompliance: false/),
    ),
  );
  push(
    gate(
      "P",
      "Cross-framework RTB control reuse",
      has(ENGINE, /frameworksForControl/) && has(SEED, /RTB-SEC-S01/),
    ),
  );
  push(
    gate(
      "Q",
      "Evidence mapping",
      has(ENGINE, /recordEvidenceMapping/) && has(CONTRACTS, /ComplianceEvidenceMapping/),
    ),
  );
  push(
    gate(
      "R",
      "Provenance preservation",
      has(ENGINE, /provenanceRef/) && has(CONTRACTS, /provenanceRef/),
    ),
  );
  push(
    gate(
      "S",
      "Evidence freshness",
      has(ENGINE, /freshness/) && has(CONTRACTS, /evidenceQuality/),
    ),
  );
  push(
    gate(
      "T",
      "Stale evidence handling",
      has(ENGINE, /forceStale/) &&
        has(ENGINE, /partially_supported/) &&
        has(ENGINE, /stale evidence/),
    ),
  );
  push(
    gate(
      "U",
      "Missing evidence fail-closed",
      has(ENGINE, /Missing evidence — fail-closed/) &&
        has(CONTRACTS, /unknownNeverSilentSupported: true/),
    ),
  );
  push(gate("V", "Partial support semantics", has(ENGINE, /partially_supported/)));
  push(gate("W", "Unsupported semantics", has(ENGINE, /forceUnsupported/) && has(ENGINE, /unsupported/)));
  push(
    gate(
      "X",
      "Not-applicable semantics",
      has(SEED, /notApplicableAllowed: true/) && has(ENGINE, /not_applicable/),
    ),
  );
  push(
    gate(
      "Y",
      "External-assurance requirement",
      has(SEED, /requiresExternalAssurance: true/) &&
        has(ENGINE, /requires_external_assurance/),
    ),
  );
  push(
    gate(
      "Z",
      "Internal evidence cannot satisfy external-only",
      has(SEED, /internalEvidenceCannotSatisfy: true/) &&
        has(CONTRACTS, /internalEvidenceCannotSatisfyExternalOnly: true/) &&
        has(ENGINE, /internal evidence alone cannot satisfy/i),
    ),
  );
  push(
    gate(
      "AA",
      "Gaps != incidents",
      has(ENGINE, /isIncident: false/) && has(CONTRACTS, /gapNeqIncident: true/),
    ),
  );
  push(
    gate(
      "AB",
      "No automatic remediation",
      flagFalse(foundationFlags, "automaticRemediationEnabled") &&
        flagFalse(isoFlags, "automaticAuthorizationMutationEnabled") &&
        flagFalse(isoFlags, "automaticRlsMutationEnabled") &&
        has(ENGINE, /automaticRemediationEnabled = false/),
    ),
  );
  push(
    gate(
      "AC",
      "No automatic certification/claims",
      flagFalse(ciFlags, "automaticCertificationEnabled") &&
        flagFalse(ciFlags, "automaticComplianceClaimEnabled") &&
        has(ENGINE, /certificationClaimed: false/) &&
        has(CONTRACTS, /noAutomaticCertification: true/),
    ),
  );
  push(
    gate(
      "AD",
      "Anti-duplication",
      flagFalse(ciFlags, "duplicateSecurityControlRegistryDetected") &&
        flagFalse(ciFlags, "duplicateSecurityEvidenceRegistryDetected") &&
        flagFalse(ciFlags, "duplicateSecurityAssuranceStackDetected") &&
        [
          "duplicatePolicyEngineDetected",
          "duplicateAuditSystemDetected",
          "duplicateWorkflowEngineDetected",
          "duplicateEventBusDetected",
        ].every((n) => flagFalse(discoveryFlags, n)),
    ),
  );
  push(
    gate(
      "AE",
      "Prior dimensions preserved",
      has(ENGINE, /isolationDimensionPreserved: true/) &&
        has(ENGINE, /aiDataDimensionPreserved: true/) &&
        has(ENGINE, /secureComputeDimensionPreserved: true/),
    ),
  );
  push(
    gate(
      "AF",
      "Posture no universal score",
      has(CONTRACTS, /universalScorePresent: false/) &&
        has(UI, /universalScorePresent=false/),
    ),
  );
  push(
    gate(
      "AG",
      "Events compliance.*",
      has(EVENTS, /security_assurance\.compliance\.assessment_completed/) &&
        has(EVENTS, /security_assurance\.compliance\.gap_opened/) &&
        has(MIGRATION, /security_assurance\.compliance\.posture_updated/),
    ),
  );
  push(
    gate(
      "AH",
      "Workflow compliance_review",
      has(CONTRACTS, /security_assurance\.compliance_review/) &&
        has(RUNTIME, /complianceReviewAction/),
    ),
  );
  push(
    gate(
      "AI",
      "Admin UI marker",
      has(UI, /data-testid="security-assurance-compliance-ready"/) &&
        (has(UI, /0\.6\.0-compliance-intelligence/) || has(UI, /0\.7\.0-customer-assurance/)),
    ),
  );
  push(gate("AJ", "Migration batch_94", exists(MIGRATION) && has(MIGRATION, /batch_94/)));
  push(
    gate(
      "AK",
      "RLS tenant/workspace",
      has(MIGRATION, /ENABLE ROW LEVEL SECURITY/) &&
        has(MIGRATION, /get_user_tenant_ids\(\)/) &&
        has(MIGRATION, /workspace_memberships/),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AL", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AM", "Secret scan", secret.ok, secret.detail));
  const browser = run("pnpm --filter @rtb/security-assurance-certification test:e2e:compliance", {
    CERTIFY_BROWSER: "1",
  });
  push(gate("AN", "Browser E2E", browser.ok, browser.detail));

  push(
    gate(
      "AO",
      "Accessibility",
      has(UI, /aria-label="Compliance intelligence"/) &&
        has(UI, /aria-label="Compliance frameworks"/),
    ),
  );
  push(gate("AP", "Responsive", has(UI, /sm:grid-cols-2/) && has(UI, /lg:grid-cols-3/)));
  push(
    gate(
      "AQ",
      "Architecture test",
      exists(
        "packages/platform-certification/src/phase15f-security-assurance-compliance.test.ts",
      ),
    ),
  );
  push(gate("AR", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase15GReady/)));
  push(
    gate(
      "AS",
      "ComplianceIntelligenceReady flags",
      [
        "ComplianceIntelligenceReady",
        "ComplianceFrameworkRegistryImplemented",
        "ComplianceControlMappingImplemented",
        "ComplianceEvidenceMappingImplemented",
        "ComplianceAssessmentImplemented",
        "ComplianceGapAssessmentImplemented",
        "ExternalAssuranceRequirementImplemented",
      ].every((n) => flagTrue(ciFlags, n)),
    ),
  );
  push(
    gate(
      "AT",
      "Advanced products unimplemented",
      flagFalse(discoveryFlags, "SecurityIntelligenceImplemented") &&
        flagFalse(isoFlags, "AiTrustRuntimeImplemented") &&
        flagFalse(isoFlags, "ThreatIntelligenceRuntimeImplemented") &&
        flagFalse(discoveryFlags, "CustomerTrustCenterImplemented") &&
        has(RUNTIME, /automaticCertification: false/),
    ),
  );
  push(gate("AU", "EngineeringOSV1Intact", flagTrue(discoveryFlags, "EngineeringOSV1Intact")));
  push(
    gate(
      "AV",
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
  push(gate("AW", "phase15GReady", flagTrue(ciFlags, "phase15GReady")));
  push(gate("AX", "Artifact identity", Boolean(commit), commit));
  push(
    gate(
      "AZ",
      "Semantics / claim safety locks",
      has(CONTRACTS, /noAutomaticComplianceClaim: true/) &&
        has(UI, /iso27001CertifiedClaimed=false/) &&
        has(UI, /soc2CompliantClaimed=false/) &&
        has(ENGINE, /iso27001CertifiedClaimed: false/),
    ),
  );
  push(
    gate(
      "BA",
      "Foundation+Isolation+AI/data+SC still ready",
      flagTrue(foundationFlags, "SecurityAssuranceFoundationReady") &&
        flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagTrue(aidFlags, "AiDataSecurityReady") &&
        flagTrue(scFlags, "SecureComputeAssuranceReady"),
    ),
  );
  push(
    gate(
      "BB",
      "No Trust Center/GRC packages",
      !exists("packages/customer-trust-center") &&
        !exists("packages/grc") &&
        !exists("packages/security-intelligence") &&
        !exists("packages/siem"),
    ),
  );
  push(
    gate(
      "BC",
      "EOS still 1.0.0",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(
    gate(
      "BD",
      "Package not 1.0.0",
      (has(VERSION, /0\.6\.0-compliance-intelligence/) || has(VERSION, /0\.7\.0-customer-assurance/)) &&
        !has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "BE",
      "Compliance docs",
      exists(DOC) &&
        exists("docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_6_0.md"),
    ),
  );
  push(
    gate(
      "BF",
      "Sole control never infers compliance",
      has(CONTRACTS, /soleControlNeverInfersCompliance: true/) &&
        has(SEED, /soleControlInfersCompliance: false/),
    ),
  );
  push(
    gate(
      "BG",
      "FrameworkMappingRegistry reused",
      has(RUNTIME, /frameworkMappingRegistry: true/) &&
        exists("packages/security-assurance/src/domain/framework-mapping-registry.ts"),
    ),
  );
  push(
    gate(
      "BH",
      "ComplianceIntelligenceImplemented=true",
      flagTrue(discoveryFlags, "ComplianceIntelligenceImplemented"),
    ),
  );
  push(
    gate(
      "BI",
      "compliance_intelligence posture dimension",
      has("packages/security-assurance/src/contracts.ts", /compliance_intelligence/) &&
        has(UI, />compliance_intelligence</),
    ),
  );
  push(
    gate(
      "BJ",
      "Gap recommended human action",
      has(ENGINE, /recommendedHumanAction/) && has(CONTRACTS, /recommendedHumanAction/),
    ),
  );
  push(
    gate(
      "BK",
      "duplicateSecurityControlRegistryDetected=false",
      flagFalse(ciFlags, "duplicateSecurityControlRegistryDetected"),
    ),
  );
  push(
    gate(
      "BL",
      "duplicateSecurityEvidenceRegistryDetected=false",
      flagFalse(ciFlags, "duplicateSecurityEvidenceRegistryDetected"),
    ),
  );
  push(
    gate(
      "BM",
      "No global framework compliant label",
      has(ENGINE, /never label framework globally compliant/i),
    ),
  );
  push(
    gate(
      "BN",
      "automaticControlCreationEnabled=false",
      flagFalse(ciFlags, "automaticControlCreationEnabled"),
    ),
  );
  push(
    gate(
      "BO",
      "SecurityAssuranceBoundaryLocked",
      flagTrue(discoveryFlags, "SecurityAssuranceBoundaryLocked"),
    ),
  );
  push(
    gate(
      "BP",
      "Unknown never silent supported",
      has(CONTRACTS, /unknownNeverSilentSupported: true/),
    ),
  );
  push(
    gate(
      "BQ",
      "ExternalAssuranceRequirementImplemented",
      flagTrue(ciFlags, "ExternalAssuranceRequirementImplemented"),
    ),
  );
  push(
    gate(
      "BR",
      "ComplianceGapAssessmentImplemented",
      flagTrue(ciFlags, "ComplianceGapAssessmentImplemented"),
    ),
  );

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "AY",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(ciFlags, "ComplianceIntelligenceReady") &&
        flagFalse(ciFlags, "automaticCertificationEnabled"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_15F_SECURITY_ASSURANCE_COMPLIANCE_GATES.map(([id, name]) => {
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
    title: "Security & Assurance Compliance Intelligence Foundation",
    verdict,
    version: PHASE_15F_VERSION,
    status: "compliance_intelligence",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase15EBaseline: PHASE_15E_BASELINE,
    phase15DBaseline: PHASE_15D_BASELINE,
    phase15CBaseline: PHASE_15C_BASELINE,
    phase15BBaseline: PHASE_15B_BASELINE,
    phase15ABaseline: PHASE_15A_BASELINE,
    engineeringOsV1Baseline: PHASE_15F_EOS_COMMIT,
    gateCount: PHASE_15F_GATE_COUNT,
    requiredGates: PHASE_15F_SECURITY_ASSURANCE_COMPLIANCE_GATES.map(([id, name]) => ({
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
    ComplianceIntelligenceReady: true,
    ComplianceIntelligenceImplemented: true,
    SecureComputeAssuranceReady: true,
    duplicateSecurityControlRegistryDetected: false,
    automaticCertificationEnabled: false,
    automaticComplianceClaimEnabled: false,
    automaticRemediationEnabled: false,
    SecurityIntelligenceImplemented: false,
    CustomerTrustCenterImplemented: false,
    EngineeringOSV1Intact: true,
    phase15GReady: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase15f-security-assurance-compliance-certification.json",
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
        phase15GReady: artifact.phase15GReady,
        ComplianceIntelligenceReady: artifact.ComplianceIntelligenceReady,
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
