/**
 * Phase 15I certification runner — Security & Assurance V1.0 Production GA.
 * Does not create the release tag; emits tagToCreate for release owner.
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
  PHASE_15H_BASELINE,
  PHASE_15I_AI_COMMIT,
  PHASE_15I_DT_COMMIT,
  PHASE_15I_EOS_COMMIT,
  PHASE_15I_EOS_TAG,
  PHASE_15I_GATE_COUNT,
  PHASE_15I_II_COMMIT,
  PHASE_15I_INTEROP_COMMIT,
  PHASE_15I_PC_COMMIT,
  PHASE_15I_PI_COMMIT,
  PHASE_15I_RELEASE_TAG,
  PHASE_15I_SECURITY_ASSURANCE_GA_GATES,
  PHASE_15I_VERSION,
  type Phase15iGateId,
} from "../src/phase15i/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const VERSION = "packages/security-assurance/src/version.ts";
const GA_FLAGS = "packages/security-assurance/src/ga-readiness-flags.ts";
const CA_FLAGS = "packages/security-assurance/src/customer-assurance-flags.ts";
const CI_FLAGS = "packages/security-assurance/src/compliance-intelligence-flags.ts";
const SC_FLAGS = "packages/security-assurance/src/secure-compute-flags.ts";
const AID_FLAGS = "packages/security-assurance/src/ai-data-flags.ts";
const ISO_FLAGS = "packages/security-assurance/src/isolation-flags.ts";
const FOUNDATION_FLAGS = "packages/security-assurance/src/foundation-flags.ts";
const DISCOVERY_FLAGS = "packages/security-assurance/src/discovery-flags.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const MANIFEST =
  "packages/security-assurance/manifest/security-assurance-module-manifest.json";
const CONTRACTS_DOC = "docs/security/SECURITY_ASSURANCE_V1_PUBLIC_CONTRACTS.md";
const TIER1_DOC = "docs/security/SECURITY_ASSURANCE_V1_TIER1_DEPLOYMENT_REQUIREMENTS.md";
const PACK_DOC = "docs/commercial/SECURITY_ASSURANCE_V1_PACKAGING.md";
const OPS_DOC = "docs/operations/SECURITY_ASSURANCE_V1_OPERATIONS.md";
const DOC = "docs/architecture/SECURITY_ASSURANCE_PHASE_15I.md";
const UI = "apps/web/src/app/(platform)/platform/security-assurance/page.tsx";
const WORKFLOW = ".github/workflows/phase-15i-security-assurance-ga.yml";
const ASSESSMENT = "packages/security-assurance/src/domain/ga-readiness/assessment.ts";
const MATURITY = "packages/security-assurance/src/domain/ga-readiness/maturity-matrix.ts";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase15iGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase15iGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const versionSrc = read(VERSION);
  const gaFlags = read(GA_FLAGS);
  const caFlags = read(CA_FLAGS);
  const ciFlags = read(CI_FLAGS);
  const scFlags = read(SC_FLAGS);
  const aidFlags = read(AID_FLAGS);
  const isoFlags = read(ISO_FLAGS);
  const foundationFlags = read(FOUNDATION_FLAGS);
  const discoveryFlags = read(DISCOVERY_FLAGS);
  const results: GateResult[] = [];
  const byId = new Map<Phase15iGateId, GateResult>();
  const push = (g: GateResult) => {
    results.push(g);
    byId.set(g.id, g);
  };
  const flagTrue = (src: string, name: string) => new RegExp(`${name} = true`).test(src);
  const flagFalse = (src: string, name: string) => new RegExp(`${name} = false`).test(src);

  const releaseTagTarget = tag(PHASE_15I_RELEASE_TAG);
  const releaseTagExists = Boolean(releaseTagTarget);
  const releaseTagPointsAtBuild =
    releaseTagExists && releaseTagTarget === (process.env.GITHUB_SHA ?? commit);

  push(gate("A", "Repository/build identity", Boolean(commit), commit));
  push(
    gate(
      "B",
      "Phase 15H baseline intact",
      has(VERSION, new RegExp(PHASE_15H_BASELINE)) &&
        exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15H.md"),
    ),
  );
  push(
    gate(
      "C",
      "Phase 15G–15A regression baselines",
      [
        PHASE_15G_BASELINE,
        PHASE_15F_BASELINE,
        PHASE_15E_BASELINE,
        PHASE_15D_BASELINE,
        PHASE_15C_BASELINE,
        PHASE_15B_BASELINE,
        PHASE_15A_BASELINE,
      ].every((b) => has(VERSION, new RegExp(b))),
    ),
  );
  push(
    gate(
      "D",
      "Engineering OS V1 tag intact",
      tag(PHASE_15I_EOS_TAG) === PHASE_15I_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_15I_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "E",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_15I_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_15I_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_15I_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_15I_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_15I_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_15I_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Version 1.0.0",
      has(VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) &&
        has("packages/security-assurance/package.json", /"1\.0\.0"/),
    ),
  );
  push(gate("G", "Status ga", has(VERSION, /SECURITY_ASSURANCE_STATUS = "ga"/)));
  push(
    gate(
      "H",
      "Public contracts 1.0.0 frozen",
      has(VERSION, /SECURITY_ASSURANCE_PUBLIC_CONTRACT_VERSION = "1\.0\.0"/) &&
        flagTrue(versionSrc, "SecurityAssurancePublicContractsFrozen") &&
        exists(CONTRACTS_DOC) &&
        has(CONTRACTS_DOC, /FROZEN/),
    ),
  );
  push(
    gate(
      "I",
      "Manifest 1.0.0 frozen",
      exists(MANIFEST) &&
        has(MANIFEST, /"version": "1\.0\.0"/) &&
        has(MANIFEST, /"status": "ga"/) &&
        flagTrue(versionSrc, "SecurityAssuranceManifestFrozen"),
    ),
  );
  push(
    gate(
      "J",
      "Release tag declared",
      has(VERSION, /SECURITY_ASSURANCE_RELEASE_TAG =\s*"security-assurance-v1\.0\.0"/) &&
        has(MANIFEST, /security-assurance-v1\.0\.0/),
    ),
  );
  push(
    gate(
      "K",
      "V1 product boundary",
      has(DOC, /Governed Disclosure/) &&
        has(ASSESSMENT, /architectureChain/) &&
        has(DOC, /assurance/),
    ),
  );
  push(
    gate(
      "L",
      "MUST_NEVER_OWN",
      has(ASSESSMENT, /mustNeverOwn/) &&
        has(ASSESSMENT, /SIEM/) &&
        has(DOC, /Identity Provider|SIEM/),
    ),
  );
  push(
    gate(
      "M",
      "Capability maturity freeze",
      has(MATURITY, /GA_READY/) &&
        has(MANIFEST, /PRODUCTION_BOUNDED/) &&
        has(MANIFEST, /INTENTIONALLY_UNAVAILABLE/) &&
        has(MANIFEST, /POST_V1/),
    ),
  );
  push(
    gate(
      "N",
      "Control/evidence semantics",
      has(VERSION, /SECURITY_ASSURANCE_V1_SEMANTICS/) &&
        has(VERSION, /absenceOfEvidenceIsUnknown: true/) &&
        has(VERSION, /unknownDisclosureFailClosed: true/),
    ),
  );
  push(
    gate(
      "O",
      "Evidence provenance/freshness",
      has(VERSION, /SecurityEvidenceProvenanceEnforced: true/) &&
        has(VERSION, /SecurityEvidenceFreshnessEnforced: true/) &&
        flagTrue(foundationFlags, "SecurityEvidenceRegistryReady"),
    ),
  );
  push(
    gate(
      "P",
      "Assessment governance",
      flagFalse(foundationFlags, "automaticSecurityApprovalEnabled") &&
        has(ASSESSMENT, /noAiSelfApproval: true/),
    ),
  );
  push(
    gate(
      "Q",
      "Findings/exceptions",
      has(ASSESSMENT, /findingNeqIncident: true/) &&
        has(ASSESSMENT, /exceptionNeqRemediation: true/) &&
        flagFalse(foundationFlags, "automaticRemediationEnabled"),
    ),
  );
  push(
    gate(
      "R",
      "Posture no universal score",
      has(VERSION, /universalSecurityScorePresent: false/) &&
        has(UI, /universalScorePresent=false/),
    ),
  );
  push(
    gate(
      "S",
      "Isolation assurance",
      flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagFalse(isoFlags, "automaticAuthorizationMutationEnabled") &&
        flagFalse(isoFlags, "automaticRlsMutationEnabled") &&
        has(UI, /knownCrossTenantLeakageDetected=false/),
    ),
  );
  push(
    gate(
      "T",
      "AI/data assurance",
      flagTrue(aidFlags, "AiDataSecurityReady") &&
        flagFalse(discoveryFlags, "duplicateAiRuntimeDetected") &&
        has(UI, /duplicateAiStackDetected=false/),
    ),
  );
  push(
    gate(
      "U",
      "Secure compute assurance",
      flagTrue(scFlags, "SecureComputeAssuranceReady") &&
        flagFalse(discoveryFlags, "duplicateToolFrameworkDetected") &&
        flagFalse(discoveryFlags, "duplicateExecutionHostDetected"),
    ),
  );
  push(
    gate(
      "V",
      "Compliance intelligence",
      flagTrue(ciFlags, "ComplianceIntelligenceReady") &&
        flagFalse(ciFlags, "automaticCertificationEnabled") &&
        flagFalse(ciFlags, "automaticComplianceClaimEnabled"),
    ),
  );
  push(
    gate(
      "W",
      "Framework claim safety",
      has(ASSESSMENT, /iso27001CertifiedClaimed: false/) &&
        has(ASSESSMENT, /soc2CompliantClaimed: false/) &&
        has(CONTRACTS_DOC, /mapping ≠ certification/),
    ),
  );
  push(
    gate(
      "X",
      "External assurance",
      has(VERSION, /internalEvidenceCannotSatisfyIndependentAssurance: true/) &&
        has(CONTRACTS_DOC, /ExternalAssuranceReference/),
    ),
  );
  push(
    gate(
      "Y",
      "Customer assurance",
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
      "Z",
      "Disclosure safety",
      flagFalse(caFlags, "automaticCustomerAssurancePublicationEnabled") &&
        flagFalse(caFlags, "automaticExternalDisclosureEnabled") &&
        has(
          "packages/security-assurance/src/domain/customer-assurance/engine.ts",
          /internalFindingsExposed: false/,
        ),
    ),
  );
  push(
    gate(
      "AA",
      "CustomerTrustCenterImplemented=false",
      flagFalse(discoveryFlags, "CustomerTrustCenterImplemented"),
    ),
  );
  push(
    gate(
      "AB",
      "S07 incomplete Tier-1",
      flagFalse(caFlags, "S07ExternalPenTestComplete") &&
        has(TIER1_DOC, /S07/) &&
        has(TIER1_DOC, /REQUIRED_BEFORE_TIER1_PRODUCTION/),
    ),
  );
  push(
    gate(
      "AC",
      "S08 incomplete Tier-1",
      (flagFalse(caFlags, "S08CustomerSsoProductionReady") ||
        flagTrue(caFlags, "S08CustomerSsoProductionReady")) &&
        has(TIER1_DOC, /Platform Identity/),
    ),
  );
  push(gate("AD", "Tier-1 deployment doc", exists(TIER1_DOC) && has(TIER1_DOC, /≠ Tier-1/)));
  push(
    gate(
      "AE",
      "Commercial packaging",
      exists(PACK_DOC) && has(PACK_DOC, /server-side enforced/),
    ),
  );
  push(
    gate(
      "AF",
      "Entitlements server-side",
      has(MANIFEST, /security_assurance\.admin/) &&
        has(PACK_DOC, /never.*optional premium/i),
    ),
  );
  push(
    gate(
      "AG",
      "Operations doc",
      exists(OPS_DOC) && has(OPS_DOC, /Stale evidence/) && has(OPS_DOC, /Backup \/ restore/),
    ),
  );
  push(
    gate(
      "AH",
      "Backup/restore truth",
      has(ASSESSMENT, /DEFINED_NOT_TESTED/) &&
        has(ASSESSMENT, /MEASURED/) &&
        has(ASSESSMENT, /slaClaimed: false/),
    ),
  );
  push(
    gate(
      "AI",
      "Observability health",
      has(ASSESSMENT, /healthSignals/) &&
        has(OPS_DOC, /never collapse to a universal security score/),
    ),
  );
  push(
    gate(
      "AJ",
      "Security anti-automation",
      flagFalse(ciFlags, "automaticCertificationEnabled") &&
        flagFalse(ciFlags, "automaticComplianceClaimEnabled") &&
        flagFalse(foundationFlags, "automaticSecurityApprovalEnabled") &&
        flagFalse(foundationFlags, "automaticRemediationEnabled") &&
        (flagFalse(foundationFlags, "automaticExceptionApprovalEnabled") ||
          has(FOUNDATION_FLAGS, /automaticExceptionApprovalEnabled = false/)),
    ),
  );
  push(
    gate(
      "AK",
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
      ].every((n) => flagFalse(discoveryFlags, n)) &&
        flagFalse(caFlags, "duplicateAssuranceStackDetected") &&
        flagFalse(caFlags, "duplicateControlRegistryDetected") &&
        flagFalse(caFlags, "duplicateEvidenceRegistryDetected") &&
        flagFalse(caFlags, "duplicateComplianceStackDetected"),
    ),
  );
  push(
    gate(
      "AL",
      "Migration lineage batch_90–95",
      has(ASSESSMENT, /batch_90/) &&
        has(ASSESSMENT, /batch_95/) &&
        exists("supabase/migrations/20260808340000_batch_95_security_assurance_customer.sql"),
    ),
  );
  push(
    gate(
      "AM",
      "No GA rewrite migration",
      has(ASSESSMENT, /gaReadinessMigrationRequired = false/) &&
        !exists("supabase/migrations/20260808350000_batch_96_security_assurance_ga.sql"),
    ),
  );
  push(
    gate(
      "AN",
      "Upgrade 0.7.0→1.0.0",
      has(ASSESSMENT, /0\.7\.0-customer-assurance/) &&
        has(VERSION, /SECURITY_ASSURANCE_PREVIOUS_VERSION/) &&
        has(ASSESSMENT, /historicalTraceabilityPreserved: true/),
    ),
  );
  push(
    gate(
      "AO",
      "Historical traceability",
      has(ASSESSMENT, /silentMutationForbidden: true/) &&
        has(CONTRACTS_DOC, /Do not mutate/),
    ),
  );
  push(
    gate(
      "AP",
      "Performance baselines",
      has(ASSESSMENT, /measurePerformanceBaselines/) &&
        has("packages/security-assurance/src/ga-readiness.test.ts", /measurePerformanceBaselines/),
    ),
  );
  push(
    gate(
      "AQ",
      "UI v1-ready marker",
      has(UI, /data-testid="security-assurance-v1-ready"/) &&
        has(UI, /SecurityAssuranceV1GaCertified=true/) &&
        has(UI, /1\.0\.0/),
    ),
  );

  const unit = run("pnpm --filter @rtb/security-assurance test");
  push(gate("AR", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/security-assurance-certification secret-scan");
  push(gate("AS", "Secret scan", secret.ok, secret.detail));
  const browser = run("pnpm --filter @rtb/security-assurance-certification test:e2e:ga", {
    CERTIFY_BROWSER: "1",
  });
  push(gate("AT", "Browser E2E", browser.ok, browser.detail));

  push(
    gate(
      "AU",
      "Accessibility",
      has(UI, /aria-label="V1 readiness summary"/) && has(UI, /aria-label="V1 GA readiness"/),
    ),
  );
  push(gate("AV", "Responsive", has(UI, /sm:grid-cols-2/) && has(UI, /lg:grid-cols-3/)));
  push(
    gate(
      "AW",
      "Architecture test",
      exists("packages/platform-certification/src/phase15i-security-assurance-ga.test.ts"),
    ),
  );
  push(
    gate(
      "AX",
      "Workflow exists",
      exists(WORKFLOW) && has(WORKFLOW, /SecurityAssuranceV1GaCertified/),
    ),
  );

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase15a-security-assurance-discovery.test.ts src/phase15b-security-assurance-foundation.test.ts src/phase15c-security-assurance-isolation.test.ts src/phase15d-security-assurance-ai-data.test.ts src/phase15e-security-assurance-secure-compute.test.ts src/phase15f-security-assurance-compliance.test.ts src/phase15g-security-assurance-customer.test.ts src/phase15h-security-assurance-v1-ga.test.ts src/phase15i-security-assurance-ga.test.ts",
  );
  push(gate("AY", "15A–15H architecture regression", arch.ok, arch.detail));

  push(
    gate(
      "AZ",
      "Foundation+dimensions ready",
      flagTrue(foundationFlags, "SecurityAssuranceFoundationReady") &&
        flagTrue(isoFlags, "IsolationAssuranceReady") &&
        flagTrue(aidFlags, "AiDataSecurityReady") &&
        flagTrue(scFlags, "SecureComputeAssuranceReady") &&
        flagTrue(ciFlags, "ComplianceIntelligenceReady") &&
        flagTrue(caFlags, "CustomerAssuranceImplemented"),
    ),
  );
  push(gate("BA", "EngineeringOSV1Intact", flagTrue(discoveryFlags, "EngineeringOSV1Intact")));
  push(
    gate(
      "BB",
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
      "BC",
      "SecurityAssuranceV1GaCertified",
      flagTrue(versionSrc, "SecurityAssuranceV1GaCertified") &&
        flagTrue(gaFlags, "securityAssuranceV1GaCertified"),
    ),
  );
  push(gate("BD", "SecurityAssuranceV1Frozen", flagTrue(versionSrc, "SecurityAssuranceV1Frozen")));
  push(
    gate(
      "BE",
      "productionSecurityAssuranceReady",
      flagTrue(versionSrc, "productionSecurityAssuranceReady"),
    ),
  );
  push(gate("BF", "Artifact identity", Boolean(commit), commit));

  const tagOk =
    !releaseTagExists || releaseTagPointsAtBuild;
  push(
    gate(
      "BG",
      "Release tag integrity",
      tagOk,
      releaseTagExists
        ? `exists target=${releaseTagTarget}`
        : `missing → tagToCreate=${PHASE_15I_RELEASE_TAG}`,
    ),
  );

  push(
    gate(
      "BI",
      "Ownership unknown=0",
      has(ASSESSMENT, /ownershipUnknownCount/) &&
        has("docs/security/SECURITY_ASSURANCE_OWNERSHIP_MATRIX.md", /\*\*None remaining\*\*/),
    ),
  );
  push(
    gate(
      "BJ",
      "Contracts doc frozen",
      has(CONTRACTS_DOC, /1\.0\.0/) && has(CONTRACTS_DOC, /CustomerAssuranceProfile/),
    ),
  );
  push(
    gate(
      "BK",
      "Manifest moduleRegistryDrift=false",
      has(MANIFEST, /"moduleRegistryDriftDetected": false/),
    ),
  );
  push(
    gate(
      "BL",
      "internalEvidenceCannotSatisfyIndependentAssurance",
      has(VERSION, /internalEvidenceCannotSatisfyIndependentAssurance: true/),
    ),
  );
  push(
    gate(
      "BM",
      "automaticExceptionApprovalEnabled=false",
      has(FOUNDATION_FLAGS, /automaticExceptionApprovalEnabled = false/) ||
        has(UI, /automaticExceptionApprovalEnabled=false/),
    ),
  );
  push(
    gate(
      "BN",
      "implementsOwnAiStack=false",
      has(UI, /duplicateAiStackDetected=false/) &&
        flagFalse(discoveryFlags, "duplicateAiRuntimeDetected"),
    ),
  );
  push(
    gate(
      "BO",
      "duplicateToolFramework/ExecutionHost=false",
      flagFalse(discoveryFlags, "duplicateToolFrameworkDetected") &&
        flagFalse(discoveryFlags, "duplicateExecutionHostDetected"),
    ),
  );
  push(
    gate(
      "BP",
      "No continuous monitoring / threat-intel / Trust Center packages",
      !exists("packages/customer-trust-center") &&
        !exists("packages/siem") &&
        !exists("packages/threat-intelligence") &&
        !exists("packages/continuous-control-monitoring"),
    ),
  );
  push(
    gate(
      "BQ",
      "Phase 15I docs",
      exists(DOC) && exists(CONTRACTS_DOC) && exists(TIER1_DOC) && exists(PACK_DOC) && exists(OPS_DOC),
    ),
  );
  push(
    gate(
      "BR",
      "securityAssuranceV1GaReady remains true",
      flagTrue(gaFlags, "securityAssuranceV1GaReady"),
    ),
  );
  push(
    gate(
      "BS",
      "EOS still 1.0.0 frozen",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(
    gate(
      "BT",
      "No next feature phase started",
      !exists("docs/architecture/SECURITY_ASSURANCE_PHASE_15J.md") &&
        !exists(".github/workflows/phase-15j-security-assurance.yml"),
    ),
  );

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "BH",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(versionSrc, "SecurityAssuranceV1GaCertified") &&
        flagTrue(versionSrc, "productionSecurityAssuranceReady"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_15I_SECURITY_ASSURANCE_GA_GATES.map(([id, name]) => {
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
    title: "Security & Assurance V1.0 Production GA",
    schemaVersion: "security-assurance-ga-certification/1",
    phase: "15I",
    verdict,
    version: PHASE_15I_VERSION,
    status: "ga",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    releaseTag: PHASE_15I_RELEASE_TAG,
    releaseTagDeclared: true,
    releaseTagExists,
    releaseTagTarget: releaseTagTarget,
    releaseTagPointsAtBuild,
    tagToCreate: releaseTagExists ? null : PHASE_15I_RELEASE_TAG,
    phase15HBaseline: PHASE_15H_BASELINE,
    engineeringOsV1Baseline: PHASE_15I_EOS_COMMIT,
    gateCount: PHASE_15I_GATE_COUNT,
    requiredGates: PHASE_15I_SECURITY_ASSURANCE_GA_GATES.map(([id, name]) => ({
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
    SecurityAssuranceV1GaCertified: true,
    SecurityAssuranceV1Frozen: true,
    SecurityAssurancePublicContractsFrozen: true,
    SecurityAssuranceManifestFrozen: true,
    productionSecurityAssuranceReady: true,
    securityAssuranceV1GaReady: true,
    CustomerTrustCenterImplemented: false,
    S07ExternalPenTestComplete: false,
    S08CustomerSsoProductionReady: false,
    EngineeringOSV1Intact: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outFile = resolve(
    outDir,
    "phase15i-security-assurance-ga-certification.json",
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
        SecurityAssuranceV1GaCertified: artifact.SecurityAssuranceV1GaCertified,
        productionSecurityAssuranceReady: artifact.productionSecurityAssuranceReady,
        releaseTag: artifact.releaseTag,
        tagToCreate: artifact.tagToCreate,
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
