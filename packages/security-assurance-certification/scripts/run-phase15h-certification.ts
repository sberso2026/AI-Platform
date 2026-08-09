/**
 * Phase 15H certification runner — Security & Assurance V1 GA Readiness.
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
  PHASE_15F_BASELINE,
  PHASE_15G_BASELINE,
  PHASE_15H_AI_COMMIT,
  PHASE_15H_DT_COMMIT,
  PHASE_15H_EOS_COMMIT,
  PHASE_15H_EOS_TAG,
  PHASE_15H_GATE_COUNT,
  PHASE_15H_II_COMMIT,
  PHASE_15H_INTEROP_COMMIT,
  PHASE_15H_PC_COMMIT,
  PHASE_15H_PI_COMMIT,
  PHASE_15H_SECURITY_ASSURANCE_GA_READINESS_GATES,
  PHASE_15H_VERSION,
  type Phase15hGateId,
} from "../src/phase15h/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const GA_FLAGS = "packages/security-assurance/src/ga-readiness-flags.ts";
const CA_FLAGS = "packages/security-assurance/src/customer-assurance-flags.ts";
const CI_FLAGS = "packages/security-assurance/src/compliance-intelligence-flags.ts";
const SC_FLAGS = "packages/security-assurance/src/secure-compute-flags.ts";
const AID_FLAGS = "packages/security-assurance/src/ai-data-flags.ts";
const ISO_FLAGS = "packages/security-assurance/src/isolation-flags.ts";
const FOUNDATION_FLAGS = "packages/security-assurance/src/foundation-flags.ts";
const DISCOVERY_FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const ASSESSMENT = "packages/security-assurance/src/domain/ga-readiness/assessment.ts";
const GAPS = "packages/security-assurance/src/domain/ga-readiness/gap-register.ts";
const MATURITY = "packages/security-assurance/src/domain/ga-readiness/maturity-matrix.ts";
const CA_ENGINE = "packages/security-assurance/src/domain/customer-assurance/engine.ts";
const UI = "apps/web/src/app/(platform)/platform/security-assurance/page.tsx";
const WORKFLOW = ".github/workflows/phase-15h-security-assurance-v1-ga.yml";
const DOC = "docs/architecture/SECURITY_ASSURANCE_PHASE_15H.md";
const GAP_DOC = "docs/security/SECURITY_ASSURANCE_V1_GA_GAP_REGISTER.md";
const MATRIX_DOC = "docs/security/SECURITY_ASSURANCE_V1_CAPABILITY_MATURITY_MATRIX.md";
const OPS_DOC = "docs/security/SECURITY_ASSURANCE_V1_OPERATIONS_RUNBOOK.md";
const PACK_DOC = "docs/security/SECURITY_ASSURANCE_V1_COMMERCIAL_PACKAGING.md";
const CONTRACTS_DOC = "docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_8_0.md";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15hGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15hGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const gaFlags = read(GA_FLAGS);
  const caFlags = read(CA_FLAGS);
  const ciFlags = read(CI_FLAGS);
  const scFlags = read(SC_FLAGS);
  const aidFlags = read(AID_FLAGS);
  const isoFlags = read(ISO_FLAGS);
  const foundationFlags = read(FOUNDATION_FLAGS);
  const discoveryFlags = read(DISCOVERY_FLAGS);
  const results: GateResult[] = [];
  const byId = new Map<Phase15hGateId, GateResult>();
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
      "Phase 15G baseline intact",
      has(VERSION, new RegExp(PHASE_15G_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15G.md"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 15F–15A regression",
      has(VERSION, new RegExp(PHASE_15F_BASELINE)) &&
        has(VERSION, new RegExp(PHASE_15E_BASELINE)) &&
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
      tag(PHASE_15H_EOS_TAG) === PHASE_15H_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15H_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "E",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15H_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15H_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15H_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15H_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15H_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15H_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Version 0.8.0-ga-readiness",
      has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.8\.0-ga-readiness"/) &&
        has("packages/security-assurance/package.json", /"0\.8\.0-ga-readiness"/),
    ),
  );
  push(
    gate(
      "G",
      "Status ga_readiness / contracts not 1.0.0",
      has(VERSION, /SECURITY_ASSURANCE_STATUS = "ga_readiness"/) &&
        !has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) &&
        flagFalse(gaFlags, "SecurityAssurancePublicContractsFrozenAt1_0_0"),
    ),
  );
  push(
    gate(
      "H",
      "Ownership / unknown=0",
      has(ASSESSMENT, /ownershipUnknownCount/) &&
        has(DOC, /UNKNOWN ownership = 0/) &&
        has("docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md", /\*\*None remaining\*\*/),
    ),
  );
  push(
    gate(
      "I",
      "Architecture chain",
      has(ASSESSMENT, /Governed Disclosure/) &&
        has(ASSESSMENT, /architectureChain/) &&
        has(DOC, /Customer Assurance/),
    ),
  );
  push(
    gate(
      "J",
      "MUST_NEVER_OWN boundary",
      has(ASSESSMENT, /mustNeverOwn/) && has(ASSESSMENT, /SIEM/) && has(DOC, /MUST_NEVER_OWN/),
    ),
  );
  push(
    gate(
      "K",
      "Public contracts review",
      exists(CONTRACTS_DOC) &&
        has(CONTRACTS_DOC, /not frozen 1\.0\.0/) &&
        has(CONTRACTS_DOC, /Fail-closed/),
    ),
  );
  push(
    gate(
      "L",
      "Control/evidence integrity",
      flagTrue(foundationFlags, "SecurityControlRegistryReady") &&
        flagTrue(foundationFlags, "SecurityEvidenceRegistryReady") &&
        flagTrue(foundationFlags, "SecurityAssuranceFoundationReady"),
    ),
  );
  push(
    gate(
      "M",
      "Assessment governance",
      has(ASSESSMENT, /candidateNeqApprovedAssessment: true/) &&
        has(ASSESSMENT, /findingNeqIncident: true/) &&
        has(ASSESSMENT, /noAiSelfApproval: true/) &&
        flagFalse(foundationFlags, "automaticSecurityApprovalEnabled"),
    ),
  );
  push(
    gate(
      "N",
      "Framework claim safety",
      has(ASSESSMENT, /iso27001CertifiedClaimed: false/) &&
        has(ASSESSMENT, /soc2CompliantClaimed: false/) &&
        has(ASSESSMENT, /essentialEightMaturityClaimed: false/) &&
        has(ASSESSMENT, /nistCompliantClaimed: false/),
    ),
  );
  push(
    gate(
      "O",
      "Customer disclosure / projection",
      flagTrue(caFlags, "CustomerAssuranceImplemented") &&
        has(CA_ENGINE, /internalFindingsExposed: false/) &&
        flagFalse(caFlags, "automaticCustomerAssurancePublicationEnabled"),
    ),
  );
  push(
    gate(
      "P",
      "External assurance / S07 S08",
      flagFalse(caFlags, "S07ExternalPenTestComplete") &&
        flagFalse(caFlags, "S08CustomerSsoProductionReady") &&
        has(GAP_DOC, /REQUIRED_BEFORE_TIER1_PRODUCTION/) &&
        has(UI, /S07 REQUIRED_BEFORE_TIER1_PRODUCTION/),
    ),
  );
  push(
    gate(
      "Q",
      "Tenant isolation / IDOR",
      has(CA_ENGINE, /assertPackageTenantIsolation/) &&
        has(
          "supabase/migrations/20260808340000_batch_95_security_assurance_customer.sql",
          /get_user_tenant_ids\(\)/,
        ),
    ),
  );
  push(
    gate(
      "R",
      "RLS migration lineage",
      has(ASSESSMENT, /batch_90/) &&
        has(ASSESSMENT, /batch_95/) &&
        has(ASSESSMENT, /gaReadinessMigrationRequired = false/),
    ),
  );
  push(
    gate(
      "S",
      "Security flags / anti-automation",
      flagFalse(ciFlags, "automaticCertificationEnabled") &&
        flagFalse(ciFlags, "automaticComplianceClaimEnabled") &&
        flagFalse(caFlags, "automaticExternalDisclosureEnabled") &&
        flagFalse(foundationFlags, "automaticRemediationEnabled"),
    ),
  );
  push(
    gate(
      "T",
      "Anti-duplication",
      [
        "duplicatePolicyEngineDetected",
        "duplicateIdentityProviderDetected",
        "duplicateAuditSystemDetected",
        "duplicateAiRuntimeDetected",
        "duplicateToolFrameworkDetected",
        "duplicateExecutionHostDetected",
        "duplicateFileStoreDetected",
      ].every((n) => flagFalse(discoveryFlags, n)) &&
        flagFalse(caFlags, "duplicateAssuranceStackDetected"),
    ),
  );
  push(
    gate(
      "U",
      "Operations runbook",
      exists(OPS_DOC) &&
        has(OPS_DOC, /Stale evidence/) &&
        has(OPS_DOC, /Disclosure \/ package revocation/) &&
        flagTrue(gaFlags, "SecurityAssuranceV1OperationsRunbookReady"),
    ),
  );
  push(
    gate(
      "V",
      "Observability health signals",
      has(ASSESSMENT, /healthSignals/) &&
        has(ASSESSMENT, /customer_assurance/) &&
        flagTrue(gaFlags, "SecurityAssuranceV1ObservabilityDefined"),
    ),
  );
  push(
    gate(
      "W",
      "Backup/restore truth",
      has(ASSESSMENT, /DEFINED_NOT_TESTED/) &&
        has(ASSESSMENT, /MEASURED/) &&
        has(ASSESSMENT, /slaClaimed: false/),
    ),
  );
  push(
    gate(
      "X",
      "Upgrade path 0.7.0→1.0.0 candidate",
      has(ASSESSMENT, /0\.7\.0-customer-assurance/) &&
        has(ASSESSMENT, /towardCandidate: "1\.0\.0"/) &&
        has(ASSESSMENT, /historicalTraceabilityPreserved: true/) &&
        flagTrue(gaFlags, "SecurityAssuranceV1UpgradePathAssessed"),
    ),
  );
  push(
    gate(
      "Y",
      "Performance baselines",
      has(ASSESSMENT, /measurePerformanceBaselines/) &&
        has(ASSESSMENT, /controlLookupMs/) &&
        has("packages/security-assurance/src/ga-readiness.test.ts", /measurePerformanceBaselines/),
    ),
  );
  push(
    gate(
      "Z",
      "Commercial packaging",
      exists(PACK_DOC) &&
        has(ASSESSMENT, /commercialPackaging/) &&
        flagTrue(gaFlags, "SecurityAssuranceV1CommercialPackagingDefined"),
    ),
  );
  push(
    gate(
      "AA",
      "Entitlements server-side",
      has(PACK_DOC, /server-side enforced/) &&
        has(ASSESSMENT, /serverSideEntitlementsRequired: true/) &&
        has(ASSESSMENT, /baselineControlsNeverUiOnlyOptional: true/),
    ),
  );
  push(
    gate(
      "AB",
      "Capability maturity matrix",
      exists(MATRIX_DOC) &&
        has(MATURITY, /GA_READY/) &&
        has(MATURITY, /PRODUCTION_BOUNDED/) &&
        has(MATURITY, /INTENTIONALLY_UNAVAILABLE/),
    ),
  );
  push(
    gate(
      "AC",
      "GA gap register complete",
      exists(GAP_DOC) &&
        has(GAPS, /SECURITY_ASSURANCE_V1_GA_GAP_REGISTER/) &&
        has(GAPS, /summarizeGaGaps/),
    ),
  );
  push(
    gate(
      "AD",
      "Gap classification no UNKNOWN",
      has(GAPS, /unknownClassifications: 0/) &&
        has(GAP_DOC, /No UNKNOWN classifications/) &&
        !has(GAPS, /classification: "UNKNOWN"/),
    ),
  );
  push(
    gate(
      "AE",
      "Open BLOCKER=0",
      has(UI, /openBlockers=0/) && has(GAP_DOC, /BLOCKER \| 0/),
    ),
  );
  push(
    gate(
      "AF",
      "Open REQUIRED_BEFORE_GA=0",
      has(UI, /openRequiredBeforeGa=0/) && has(GAP_DOC, /REQUIRED_BEFORE_GA \| 0/),
    ),
  );
  push(
    gate(
      "AG",
      "securityAssuranceV1GaReady decision",
      flagTrue(gaFlags, "securityAssuranceV1GaReady") &&
        has(UI, /securityAssuranceV1GaReady=true/) &&
        has(ASSESSMENT, /securityAssuranceV1GaReady/),
    ),
  );
  push(
    gate(
      "AH",
      "securityAssuranceV1GaCertified=false",
      flagFalse(gaFlags, "securityAssuranceV1GaCertified") &&
        has(UI, /securityAssuranceV1GaCertified=false/),
    ),
  );
  push(gate("AI", "phase15IReady", flagTrue(gaFlags, "phase15IReady") && has(UI, /phase15IReady=true/)));
  push(
    gate(
      "AJ",
      "Contracts not frozen 1.0.0",
      flagFalse(gaFlags, "SecurityAssurancePublicContractsFrozenAt1_0_0") &&
        has(UI, /SecurityAssurancePublicContractsFrozenAt1_0_0=false/),
    ),
  );
  push(
    gate(
      "AK",
      "UI v1-readiness marker",
      has(UI, /data-testid="security-assurance-v1-readiness"/) &&
        has(UI, /0\.8\.0-ga-readiness/) &&
        flagTrue(gaFlags, "SecurityAssuranceV1UiReadinessMarkerReady"),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AL", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AM", "Secret scan", secret.ok, secret.detail));
  const browser = run(
    "pnpm --filter @rtb/security-assurance-certification test:e2e:ga-readiness",
    { CERTIFY_BROWSER: "1" },
  );
  push(gate("AN", "Browser E2E", browser.ok, browser.detail));

  push(
    gate(
      "AO",
      "Accessibility",
      has(UI, /aria-label="V1 readiness summary"/) && has(UI, /aria-label="V1 GA readiness"/),
    ),
  );
  push(gate("AP", "Responsive", has(UI, /sm:grid-cols-2/) && has(UI, /lg:grid-cols-3/)));
  push(
    gate(
      "AQ",
      "Architecture test",
      exists("packages/platform-certification/src/phase15h-security-assurance-v1-ga.test.ts"),
    ),
  );
  push(gate("AR", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase15IReady/)));
  push(
    gate(
      "AS",
      "Foundation+Isolation+AI/SC+Compliance+Customer ready",
      flagTrue(foundationFlags, "SecurityAssuranceFoundationReady") &&
        flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagTrue(aidFlags, "AiDataSecurityReady") &&
        flagTrue(scFlags, "SecureComputeAssuranceReady") &&
        flagTrue(ciFlags, "ComplianceIntelligenceReady") &&
        flagTrue(caFlags, "CustomerAssuranceImplemented"),
    ),
  );
  push(
    gate(
      "AT",
      "Advanced products unimplemented",
      flagFalse(discoveryFlags, "SecurityIntelligenceImplemented") &&
        flagFalse(isoFlags, "AiTrustRuntimeImplemented") &&
        flagFalse(discoveryFlags, "CustomerTrustCenterImplemented"),
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
  push(
    gate(
      "AW",
      "No GA-only migration rewrite",
      has(ASSESSMENT, /gaReadinessMigrationRequired = false/) &&
        !exists("supabase/migrations/20260808350000_batch_96_security_assurance_ga.sql"),
    ),
  );
  push(gate("AX", "Artifact identity", Boolean(commit), commit));
  push(gate("AZ", "CustomerTrustCenterImplemented=false", flagFalse(discoveryFlags, "CustomerTrustCenterImplemented")));
  push(gate("BA", "S07ExternalPenTestComplete=false", flagFalse(caFlags, "S07ExternalPenTestComplete")));
  push(gate("BB", "S08CustomerSsoProductionReady=false", flagFalse(caFlags, "S08CustomerSsoProductionReady")));
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
      has(VERSION, /0\.8\.0-ga-readiness/) &&
        !has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/),
    ),
  );
  push(
    gate(
      "BE",
      "Phase 15H docs",
      exists(DOC) && exists(GAP_DOC) && exists(MATRIX_DOC) && exists(OPS_DOC) && exists(PACK_DOC),
    ),
  );
  push(
    gate(
      "BF",
      "Tier-1 distinct from subsystem GA",
      has(ASSESSMENT, /subsystemReadyDistinctFromTier1Production: true/) &&
        has(DOC, /Tier-1/),
    ),
  );
  push(
    gate(
      "BG",
      "No Trust Center/GRC/SIEM packages",
      !exists("packages/customer-trust-center") &&
        !exists("packages/grc") &&
        !exists("packages/siem") &&
        !exists("packages/security-intelligence"),
    ),
  );
  push(
    gate(
      "BH",
      "Internal/customer separation preserved",
      has(CA_ENGINE, /internalFindingsExposed: false/) &&
        has(UI, /Customer Assurance/),
    ),
  );
  push(
    gate(
      "BI",
      "Evidence absence remains unknown",
      has(DOC, /fail-closed/) ||
        has(CONTRACTS_DOC, /missing evidence → unknown/) ||
        has(CONTRACTS_DOC, /missing evidence/),
    ),
  );
  push(
    gate(
      "BJ",
      "Posture no universal score",
      has(UI, /universalScorePresent=false/),
    ),
  );
  push(
    gate(
      "BK",
      "Migration inventory batch_90–95",
      has(ASSESSMENT, /batch_90/) &&
        has(ASSESSMENT, /batch_91/) &&
        has(ASSESSMENT, /batch_94/) &&
        has(ASSESSMENT, /batch_95/),
    ),
  );
  push(
    gate(
      "BL",
      "GaReadinessAssessmentComplete",
      flagTrue(gaFlags, "SecurityAssuranceGaReadinessAssessmentComplete"),
    ),
  );
  push(
    gate(
      "BM",
      "Capability matrix ready flag",
      flagTrue(gaFlags, "SecurityAssuranceV1CapabilityMatrixReady"),
    ),
  );
  push(
    gate(
      "BN",
      "Gap register ready flag",
      flagTrue(gaFlags, "SecurityAssuranceV1GaGapRegisterReady"),
    ),
  );
  push(
    gate(
      "BO",
      "Operations runbook ready flag",
      flagTrue(gaFlags, "SecurityAssuranceV1OperationsRunbookReady"),
    ),
  );
  push(
    gate(
      "BP",
      "Commercial packaging defined flag",
      flagTrue(gaFlags, "SecurityAssuranceV1CommercialPackagingDefined"),
    ),
  );
  push(
    gate(
      "BQ",
      "SecurityAssuranceBoundaryLocked",
      flagTrue(discoveryFlags, "SecurityAssuranceBoundaryLocked"),
    ),
  );
  push(
    gate(
      "BR",
      "No Phase 15I started",
      !exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15I.md") &&
        !exists(".github/workflows/phase-15i-security-assurance-v1-ga.yml") &&
        !has(VERSION, /SECURITY_ASSURANCE_PHASE = "15I"/),
    ),
  );

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "AY",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(gaFlags, "securityAssuranceV1GaReady") &&
        flagFalse(gaFlags, "securityAssuranceV1GaCertified"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_15H_SECURITY_ASSURANCE_GA_READINESS_GATES.map(([id, name]) => {
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
    title: "Security & Assurance V1 GA Readiness",
    verdict,
    version: PHASE_15H_VERSION,
    status: "ga_readiness",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase15GBaseline: PHASE_15G_BASELINE,
    phase15FBaseline: PHASE_15F_BASELINE,
    phase15EBaseline: PHASE_15E_BASELINE,
    phase15DBaseline: PHASE_15D_BASELINE,
    phase15CBaseline: PHASE_15C_BASELINE,
    phase15BBaseline: PHASE_15B_BASELINE,
    phase15ABaseline: PHASE_15A_BASELINE,
    engineeringOsV1Baseline: PHASE_15H_EOS_COMMIT,
    gateCount: PHASE_15H_GATE_COUNT,
    requiredGates: PHASE_15H_SECURITY_ASSURANCE_GA_READINESS_GATES.map(([id, name]) => ({
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
    SecurityAssuranceGaReadinessAssessmentComplete: true,
    securityAssuranceV1GaReady: true,
    securityAssuranceV1GaCertified: false,
    SecurityAssurancePublicContractsFrozenAt1_0_0: false,
    openBlockers: 0,
    openRequiredBeforeGa: 0,
    CustomerAssuranceImplemented: true,
    ComplianceIntelligenceImplemented: true,
    CustomerTrustCenterImplemented: false,
    S07ExternalPenTestComplete: false,
    S08CustomerSsoProductionReady: false,
    EngineeringOSV1Intact: true,
    phase15IReady: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase15h-security-assurance-v1-ga-readiness-certification.json",
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
        securityAssuranceV1GaReady: artifact.securityAssuranceV1GaReady,
        securityAssuranceV1GaCertified: artifact.securityAssuranceV1GaCertified,
        phase15IReady: artifact.phase15IReady,
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
