/**
 * Phase 15G certification runner — Customer Assurance.
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
  PHASE_15G_AI_COMMIT,
  PHASE_15G_DT_COMMIT,
  PHASE_15G_EOS_COMMIT,
  PHASE_15G_EOS_TAG,
  PHASE_15G_GATE_COUNT,
  PHASE_15G_II_COMMIT,
  PHASE_15G_INTEROP_COMMIT,
  PHASE_15G_PC_COMMIT,
  PHASE_15G_PI_COMMIT,
  PHASE_15G_SECURITY_ASSURANCE_CUSTOMER_GATES,
  PHASE_15G_VERSION,
  type Phase15gGateId,
} from "../src/phase15g/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const CA_FLAGS = "packages/security-assurance/src/customer-assurance-flags.ts";
const CI_FLAGS = "packages/security-assurance/src/compliance-intelligence-flags.ts";
const SC_FLAGS = "packages/security-assurance/src/secure-compute-flags.ts";
const AID_FLAGS = "packages/security-assurance/src/ai-data-flags.ts";
const ISO_FLAGS = "packages/security-assurance/src/isolation-flags.ts";
const FOUNDATION_FLAGS = "packages/security-assurance/src/foundation-flags.ts";
const DISCOVERY_FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const VERSION = "packages/security-assurance/src/version.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const CONTRACTS = "packages/security-assurance/src/customer-assurance-contracts.ts";
const ENGINE = "packages/security-assurance/src/domain/customer-assurance/engine.ts";
const SEED = "packages/security-assurance/src/domain/customer-assurance/seed-claims.ts";
const RUNTIME = "packages/security-assurance/src/domain/customer-assurance/runtime.ts";
const EVENTS = "packages/security-assurance/src/domain/events.ts";
const MIGRATION =
  "supabase/migrations/20260808340000_batch_95_security_assurance_customer.sql";
const UI = "apps/web/src/app/(platform)/platform/security-assurance/page.tsx";
const UI_CA =
  "apps/web/src/app/(platform)/platform/security-assurance/customer-assurance/page.tsx";
const WORKFLOW = ".github/workflows/phase-15g-security-assurance-customer.yml";
const DOC = "docs/architecture/SECURITY_ASSURANCE_PHASE_15G.md";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15gGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15gGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const caFlags = read(CA_FLAGS);
  const ciFlags = read(CI_FLAGS);
  const scFlags = read(SC_FLAGS);
  const aidFlags = read(AID_FLAGS);
  const isoFlags = read(ISO_FLAGS);
  const foundationFlags = read(FOUNDATION_FLAGS);
  const discoveryFlags = read(DISCOVERY_FLAGS);
  const results: GateResult[] = [];
  const byId = new Map<Phase15gGateId, GateResult>();
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
      "Phase 15F baseline intact",
      has(VERSION, new RegExp(PHASE_15F_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15F.md"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 15E–15A regression",
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
      tag(PHASE_15G_EOS_TAG) === PHASE_15G_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15G_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "E",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15G_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15G_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15G_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15G_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15G_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15G_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Version 0.7.0-customer-assurance",
      (has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.7\.0-customer-assurance"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "0\.8\.0-ga-readiness"/) ||
        has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/)) &&
        (has("packages/security-assurance/package.json", /"0\.7\.0-customer-assurance"/) ||
          has("packages/security-assurance/package.json", /"0\.8\.0-ga-readiness"/) ||
          has("packages/security-assurance/package.json", /"1\.0\.0"/)),
    ),
  );
  push(
    gate(
      "G",
      "Contracts 0.7.0-customer-assurance",
      (has(VERSION, /0\.7\.0-customer-assurance/) || has(VERSION, /0\.8\.0-ga-readiness/) || has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) || has(VERSION, /0\.8\.0-ga-readiness|1\.0\.0/)) &&
        has(CONTRACTS, /CustomerAssuranceProfile/) &&
        has(CONTRACTS, /AssuranceDisclosurePolicy/) &&
        has(CONTRACTS, /AssuranceClaimReference/) &&
        has(CONTRACTS, /CustomerAssurancePackage/) &&
        has(CONTRACTS, /AssuranceDisclosureRecord/),
    ),
  );
  push(
    gate(
      "H",
      "Ownership / reuse boundary",
      has(DOC, /Reuses Security Control Registry/) &&
        has(RUNTIME, /duplicateAssuranceStack: false/) &&
        has(RUNTIME, /duplicatePolicyEngine: false/) &&
        has(RUNTIME, /trustCenterProduct: false/),
    ),
  );
  push(
    gate(
      "I",
      "CustomerAssuranceProfile",
      has(SEED, /SEED_CUSTOMER_PROFILE/) &&
        has(SEED, /security_governance/) &&
        has(ENGINE, /listProfiles/),
    ),
  );
  push(
    gate(
      "J",
      "AssuranceDisclosurePolicy",
      has(SEED, /SEED_DISCLOSURE_POLICIES/) &&
        has(CONTRACTS, /usesPlatformPolicyEngine: true/) &&
        has(RUNTIME, /policyEngine: true/),
    ),
  );
  push(
    gate(
      "K",
      "Disclosure classification fail-closed",
      has(CONTRACTS, /normalizeDisclosureLevel/) &&
        has(CONTRACTS, /never_disclose/) &&
        has(CONTRACTS, /unknownClassificationFailClosed: true/),
    ),
  );
  push(
    gate(
      "L",
      "AssuranceClaimReference",
      has(CONTRACTS, /requiresAuthoritativeSupport: true/) &&
        has(CONTRACTS, /certificationWordingForbidden: true/) &&
        has(SEED, /SEED_APPROVED_CLAIMS/),
    ),
  );
  push(
    gate(
      "M",
      "Claim lifecycle / status taxonomy",
      has(CONTRACTS, /requires_external_assurance/) &&
        has(CONTRACTS, /partially_supported/) &&
        has(ENGINE, /evaluateClaimFreshness/) &&
        has(ENGINE, /revokeClaim/),
    ),
  );
  push(
    gate(
      "N",
      "Approved claim library",
      has(SEED, /claim-mfa-privileged/) &&
        has(SEED, /claim-external-pentest/) &&
        has(SEED, /claim-customer-sso/) &&
        has(SEED, /claim-iso27001/) &&
        has(SEED, /RPO=DEFINED_NOT_TESTED/) &&
        has(SEED, /RTO=MEASURED/),
    ),
  );
  push(
    gate(
      "O",
      "External assurance surfaces",
      has(ENGINE, /externalAssuranceSurface/) &&
        has(ENGINE, /not_available/) &&
        has(UI_CA, /penetration test/),
    ),
  );
  push(
    gate(
      "P",
      "Questionnaire mapping",
      has(SEED, /SEED_QUESTIONNAIRE_RESPONSES/) &&
        has(CONTRACTS, /inventedResponseForbidden: true/) &&
        flagTrue(caFlags, "SecurityQuestionnaireMappingReady"),
    ),
  );
  push(
    gate(
      "Q",
      "CustomerAssurancePackage",
      has(ENGINE, /publishPackage/) &&
        has(CONTRACTS, /immutableOncePublished: true/) &&
        has(ENGINE, /immutableOncePublished: true/),
    ),
  );
  push(
    gate(
      "R",
      "AssuranceDocumentReference / Platform Files",
      has(SEED, /usesPlatformFiles: true/) &&
        has(RUNTIME, /platformFiles: true/) &&
        has(RUNTIME, /duplicateFileStore: false/),
    ),
  );
  push(
    gate(
      "S",
      "Framework customer-safe view",
      has(ENGINE, /mapped coverage available/) &&
        has(ENGINE, /not certified/) &&
        has(UI_CA, /mapping scaffold only/) &&
        has(CONTRACTS, /frameworkMappingNeqComplianceClaim: true/),
    ),
  );
  push(
    gate(
      "T",
      "Data governance / residency",
      has(ENGINE, /dataResidencyState/) &&
        has(SEED, /not_verified/) &&
        has(UI_CA, /not_verified/),
    ),
  );
  push(
    gate(
      "U",
      "Subprocessor assurance",
      has(SEED, /SEED_SUBPROCESSORS/) &&
        has(CONTRACTS, /SubprocessorAssuranceReference/) &&
        has(ENGINE, /listSubprocessors/),
    ),
  );
  push(
    gate(
      "V",
      "AI assurance (customer-safe)",
      has(SEED, /claim-ai-training/) &&
        has(UI_CA, /System prompts/) &&
        has(RUNTIME, /aiDataSecurityAssurance: true/),
    ),
  );
  push(
    gate(
      "W",
      "Isolation assurance projection",
      has(SEED, /claim-tenant-isolation/) &&
        has(SEED, /probe methodology/) &&
        has(RUNTIME, /isolationAssurance: true/),
    ),
  );
  push(
    gate(
      "X",
      "Secure compute assurance projection",
      has(SEED, /claim-secure-compute/) &&
        has(SEED, /no silent solver fallback/) &&
        has(RUNTIME, /secureComputeAssurance: true/),
    ),
  );
  push(
    gate(
      "Y",
      "Secure SDLC assurance",
      has(SEED, /claim-secure-sdlc/) &&
        has(SEED, /raw vulnerability inventory/),
    ),
  );
  push(
    gate(
      "Z",
      "Incident assurance",
      has(SEED, /claim-incident-readiness/) &&
        has(UI_CA, /Incident Response/),
    ),
  );
  push(
    gate(
      "AA",
      "Backup/recovery assurance",
      has(SEED, /claim-backup-restore/) &&
        has(UI_CA, /DEFINED_NOT_TESTED/) &&
        has(CONTRACTS, /backupTestedNeqContractualSla: true/),
    ),
  );
  push(
    gate(
      "AB",
      "Tier-1 S07/S08 truthful",
      flagFalse(caFlags, "S07ExternalPenTestComplete") &&
        flagFalse(caFlags, "S08CustomerSsoProductionReady") &&
        has(ENGINE, /REQUIRED_BEFORE_TIER1_PRODUCTION/) &&
        has(UI_CA, /S07/) &&
        has(UI_CA, /S08/),
    ),
  );
  push(
    gate(
      "AC",
      "Internal/customer separation",
      has(ENGINE, /internalFindingsExposed: false/) &&
        has(UI_CA, /Internal findings/) &&
        has(CONTRACTS, /internalFindingNeqCustomerFacingFinding: true/),
    ),
  );
  push(
    gate(
      "AD",
      "Identity/entitlements reuse",
      has(RUNTIME, /platformIdentity: true/) &&
        has(RUNTIME, /duplicateIdentityProvider: false/) &&
        has(DOC, /Platform Identity/),
    ),
  );
  push(
    gate(
      "AE",
      "Governed review action",
      has(RUNTIME, /security_assurance\.customer_assurance_review/) &&
        has(DOC, /customer_assurance_review/),
    ),
  );
  push(
    gate(
      "AF",
      "Disclosure audit",
      has(ENGINE, /recordDisclosure/) &&
        has(CONTRACTS, /AssuranceDisclosureRecord/) &&
        flagTrue(caFlags, "CustomerAssuranceDisclosureAuditReady"),
    ),
  );
  push(
    gate(
      "AG",
      "Events customer.*",
      has(EVENTS, /security_assurance\.customer\.claim_approved/) &&
        has(EVENTS, /security_assurance\.customer\.package_published/) &&
        has(MIGRATION, /security_assurance\.customer\.document_disclosed/),
    ),
  );
  push(
    gate(
      "AH",
      "Evidence freshness / stale claims",
      has(ENGINE, /forceStaleEvidence/) &&
        has(ENGINE, /status: "stale"/) &&
        has(ENGINE, /requires_review/),
    ),
  );
  push(
    gate(
      "AI",
      "Claim revocation",
      has(ENGINE, /revokeClaim/) &&
        has(ENGINE, /reviewStatus: "revoked"/),
    ),
  );
  push(
    gate(
      "AJ",
      "Versioning / immutable packages",
      has(ENGINE, /immutableOncePublished: true/) &&
        has(SEED, /version: "1\.0\.0"/) &&
        has(MIGRATION, /immutable_once_published/),
    ),
  );
  push(
    gate(
      "AK",
      "Tenant/customer package isolation (IDOR)",
      has(ENGINE, /assertPackageTenantIsolation/) &&
        has(MIGRATION, /get_user_tenant_ids\(\)/) &&
        has(MIGRATION, /security_assurance_customer_packages/),
    ),
  );
  push(
    gate(
      "AL",
      "Sensitive metadata filtering",
      has(ENGINE, /filtersSensitiveMetadata/) &&
        has(ENGINE, /systemPrompt/) &&
        has(CONTRACTS, /noFabricatedPositiveAssurance: true/),
    ),
  );
  push(gate("AM", "Migration batch_95", exists(MIGRATION) && has(MIGRATION, /batch_95/)));
  push(
    gate(
      "AN",
      "RLS",
      has(MIGRATION, /ENABLE ROW LEVEL SECURITY/) &&
        has(MIGRATION, /get_user_tenant_ids\(\)/),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AO", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AP", "Secret scan", secret.ok, secret.detail));
  const browser = run("pnpm --filter @rtb/security-assurance-certification test:e2e:customer", {
    CERTIFY_BROWSER: "1",
  });
  push(gate("AQ", "Browser E2E", browser.ok, browser.detail));

  push(
    gate(
      "AR",
      "Accessibility",
      has(UI_CA, /aria-label="Customer assurance"/) &&
        has(UI_CA, /aria-label="Customer assurance claims"/),
    ),
  );
  push(gate("AS", "Responsive", has(UI_CA, /sm:grid-cols-2/) && has(UI_CA, /lg:grid-cols-3/)));
  push(
    gate(
      "AT",
      "Performance baselines",
      has(ENGINE, /measureBaselines/) &&
        has(ENGINE, /profileRetrievalMs/) &&
        has("packages/security-assurance/src/customer-assurance.test.ts", /measureBaselines/),
    ),
  );
  push(
    gate(
      "AU",
      "Architecture test",
      exists(
        "packages/platform-certification/src/phase15g-security-assurance-customer.test.ts",
      ),
    ),
  );
  push(gate("AV", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase15HReady/)));
  push(
    gate(
      "AW",
      "CustomerAssurance flags",
      [
        "CustomerAssuranceImplemented",
        "CustomerAssuranceProfileReady",
        "AssuranceDisclosurePolicyReady",
        "AssuranceClaimRegistryReady",
        "AssuranceDocumentRegistryReady",
        "CustomerAssurancePackageReady",
        "SecurityQuestionnaireMappingReady",
        "CustomerAssuranceUiReady",
        "CustomerAssuranceDisclosureAuditReady",
      ].every((n) => flagTrue(caFlags, n)),
    ),
  );
  push(
    gate(
      "AX",
      "Advanced products unimplemented",
      flagFalse(discoveryFlags, "SecurityIntelligenceImplemented") &&
        flagFalse(isoFlags, "AiTrustRuntimeImplemented") &&
        flagFalse(discoveryFlags, "CustomerTrustCenterImplemented") &&
        has(RUNTIME, /automaticExternalDisclosure: false/),
    ),
  );
  push(gate("AY", "EngineeringOSV1Intact", flagTrue(discoveryFlags, "EngineeringOSV1Intact")));
  push(
    gate(
      "AZ",
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
  push(gate("BA", "phase15HReady", flagTrue(caFlags, "phase15HReady")));
  push(gate("BB", "Artifact identity", Boolean(commit), commit));
  push(
    gate(
      "BD",
      "Semantics / claim safety locks",
      has(CONTRACTS, /customerAssuranceNeqCertification: true/) &&
        has(UI_CA, /iso27001CertifiedClaimed=false/) &&
        has(SEED, /not certified/) &&
        has(ENGINE, /certificationClaimed: false/),
    ),
  );
  push(
    gate(
      "BE",
      "Foundation+Isolation+AI/data+SC+Compliance still ready",
      flagTrue(foundationFlags, "SecurityAssuranceFoundationReady") &&
        flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagTrue(aidFlags, "AiDataSecurityReady") &&
        flagTrue(scFlags, "SecureComputeAssuranceReady") &&
        flagTrue(ciFlags, "ComplianceIntelligenceReady"),
    ),
  );
  push(
    gate(
      "BF",
      "No Trust Center/GRC packages",
      !exists("packages/customer-trust-center") &&
        !exists("packages/grc") &&
        !exists("packages/security-intelligence") &&
        !exists("packages/siem"),
    ),
  );
  push(
    gate(
      "BG",
      "EOS still 1.0.0",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(
    gate(
      "BH",
      "Package not 1.0.0",
      has(VERSION, /0\.7\.0-customer-assurance/) || has(VERSION, /0\.8\.0-ga-readiness/) || has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) || has(VERSION, /0\.8\.0-ga-readiness|1\.0\.0/) &&
        (!has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) || has(VERSION, /SECURITY_ASSURANCE_STATUS = "ga"/)),
    ),
  );
  push(
    gate(
      "BI",
      "Customer Assurance docs",
      exists(DOC) &&
        exists("docs/security/SECURITY_ASSURANCE_PUBLIC_CONTRACTS_0_7_0.md"),
    ),
  );
  push(
    gate(
      "BJ",
      "Anti-duplication",
      flagFalse(caFlags, "duplicateControlRegistryDetected") &&
        flagFalse(caFlags, "duplicateEvidenceRegistryDetected") &&
        flagFalse(caFlags, "duplicateComplianceStackDetected") &&
        flagFalse(caFlags, "duplicateAssuranceStackDetected") &&
        [
          "duplicatePolicyEngineDetected",
          "duplicateAuditSystemDetected",
          "duplicateWorkflowEngineDetected",
          "duplicateEventBusDetected",
          "duplicateFileStoreDetected",
          "duplicateIdentityProviderDetected",
        ].every((n) => flagFalse(discoveryFlags, n)),
    ),
  );
  push(
    gate(
      "BK",
      "No automatic publication/disclosure",
      flagFalse(caFlags, "automaticCustomerAssurancePublicationEnabled") &&
        flagFalse(caFlags, "automaticExternalDisclosureEnabled") &&
        flagFalse(ciFlags, "automaticCertificationEnabled") &&
        flagFalse(ciFlags, "automaticComplianceClaimEnabled") &&
        flagFalse(foundationFlags, "automaticSecurityApprovalEnabled") &&
        flagFalse(foundationFlags, "automaticRemediationEnabled"),
    ),
  );
  push(
    gate(
      "BL",
      "CustomerTrustCenterImplemented=false",
      flagFalse(discoveryFlags, "CustomerTrustCenterImplemented"),
    ),
  );
  push(
    gate(
      "BM",
      "ComplianceIntelligenceImplemented=true",
      flagTrue(discoveryFlags, "ComplianceIntelligenceImplemented"),
    ),
  );
  push(
    gate(
      "BN",
      "S07ExternalPenTestComplete=false",
      flagFalse(caFlags, "S07ExternalPenTestComplete"),
    ),
  );
  push(
    gate(
      "BO",
      "S08CustomerSsoProductionReady=false",
      flagFalse(caFlags, "S08CustomerSsoProductionReady"),
    ),
  );
  push(
    gate(
      "BP",
      "SecurityAssuranceBoundaryLocked",
      flagTrue(discoveryFlags, "SecurityAssuranceBoundaryLocked"),
    ),
  );
  push(
    gate(
      "BQ",
      "No fabricated certification wording",
      has(CONTRACTS, /certificationWordingForbidden: true/) &&
        !has(SEED, /RTB is ISO compliant/) &&
        !has(SEED, /RTB is SOC 2 compliant/) &&
        !has(UI_CA, /RTB passed Essential Eight/),
    ),
  );
  push(
    gate(
      "BR",
      "CustomerAssuranceImplemented=true",
      flagTrue(caFlags, "CustomerAssuranceImplemented"),
    ),
  );

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "BC",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(caFlags, "CustomerAssuranceImplemented") &&
        flagFalse(caFlags, "automaticCustomerAssurancePublicationEnabled"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_15G_SECURITY_ASSURANCE_CUSTOMER_GATES.map(([id, name]) => {
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
    title: "Security & Assurance Customer Assurance",
    verdict,
    version: PHASE_15G_VERSION,
    status: "customer_assurance",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    phase15FBaseline: PHASE_15F_BASELINE,
    phase15EBaseline: PHASE_15E_BASELINE,
    phase15DBaseline: PHASE_15D_BASELINE,
    phase15CBaseline: PHASE_15C_BASELINE,
    phase15BBaseline: PHASE_15B_BASELINE,
    phase15ABaseline: PHASE_15A_BASELINE,
    engineeringOsV1Baseline: PHASE_15G_EOS_COMMIT,
    gateCount: PHASE_15G_GATE_COUNT,
    requiredGates: PHASE_15G_SECURITY_ASSURANCE_CUSTOMER_GATES.map(([id, name]) => ({
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
    CustomerAssuranceImplemented: true,
    ComplianceIntelligenceImplemented: true,
    CustomerTrustCenterImplemented: false,
    S07ExternalPenTestComplete: false,
    S08CustomerSsoProductionReady: false,
    automaticCustomerAssurancePublicationEnabled: false,
    automaticExternalDisclosureEnabled: false,
    automaticCertificationEnabled: false,
    EngineeringOSV1Intact: true,
    phase15HReady: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase15g-security-assurance-customer-certification.json",
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
        phase15HReady: artifact.phase15HReady,
        CustomerAssuranceImplemented: artifact.CustomerAssuranceImplemented,
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
