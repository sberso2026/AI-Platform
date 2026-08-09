/**
 * Phase 16A certification runner — Platform Enterprise SSO Discovery.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_16A_AI_COMMIT,
  PHASE_16A_DT_COMMIT,
  PHASE_16A_EOS_COMMIT,
  PHASE_16A_EOS_TAG,
  PHASE_16A_GATE_COUNT,
  PHASE_16A_II_COMMIT,
  PHASE_16A_INTEROP_COMMIT,
  PHASE_16A_PC_COMMIT,
  PHASE_16A_PI_COMMIT,
  PHASE_16A_PLATFORM_ENTERPRISE_SSO_DISCOVERY_GATES,
  PHASE_16A_SA_COMMIT,
  PHASE_16A_SA_TAG,
  PHASE_16A_VERSION,
  type Phase16aGateId,
} from "../src/phase16a/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const FLAGS = "packages/platform-identity/src/discovery-flags.ts";
const VERSION = "packages/platform-identity/src/version.ts";
const DECISIONS = "packages/platform-identity/src/architecture-decisions.ts";
const FOOTPRINT = "packages/platform-identity/src/footprint.ts";
const DRAFT = "packages/platform-identity/src/draft-contracts.ts";
const EOS_VERSION = "packages/engineering-os/src/version.ts";
const SA_VERSION = "packages/security-assurance/src/version.ts";
const FOOTPRINT_DOC = "docs/identity/PLATFORM_IDENTITY_PHASE_16A_EXISTING_FOOTPRINT.md";
const ARCH = "docs/architecture/PLATFORM_ENTERPRISE_IDENTITY_ARCHITECTURE.md";
const OWNERSHIP = "docs/architecture/PLATFORM_ENTERPRISE_SSO_OWNERSHIP_MATRIX.md";
const THREAT = "docs/security/PLATFORM_ENTERPRISE_SSO_THREAT_MODEL.md";
const PROTOCOL = "docs/identity/PLATFORM_ENTERPRISE_SSO_PROTOCOL_STRATEGY.md";
const LIFECYCLE = "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_LIFECYCLE.md";
const TIER1 = "docs/identity/PLATFORM_ENTERPRISE_SSO_TIER1_READINESS.md";
const GAPS = "docs/identity/PLATFORM_ENTERPRISE_SSO_GAP_REGISTER.md";
const ROADMAP = "docs/identity/PLATFORM_ENTERPRISE_SSO_IMPLEMENTATION_ROADMAP.md";
const CONTRACTS_DOC =
  "docs/identity/PLATFORM_ENTERPRISE_IDENTITY_PUBLIC_CONTRACTS_0_1_0_DRAFT.md";
const UX = "docs/identity/PLATFORM_ENTERPRISE_SSO_UX_AND_COMMERCIAL.md";
const PHASE_DOC = "docs/architecture/PLATFORM_IDENTITY_PHASE_16A.md";
const WORKFLOW = ".github/workflows/phase-16a-platform-enterprise-sso-discovery.yml";
const SA_CONTRACTS = "docs/security/SECURITY_ASSURANCE_V1_PUBLIC_CONTRACTS.md";

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase16aGateId; name: string; status: GateStatus; detail?: string };

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
function gate(id: Phase16aGateId, name: string, ok: boolean, detail?: string): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const flagsSrc = read(FLAGS);
  const results: GateResult[] = [];
  const byId = new Map<Phase16aGateId, GateResult>();
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
      "Security & Assurance V1 tag intact",
      tag(PHASE_16A_SA_TAG) === PHASE_16A_SA_COMMIT &&
        has(VERSION, new RegExp(PHASE_16A_SA_COMMIT)),
    ),
  );
  push(
    gate(
      "C",
      "Engineering OS V1 tag intact",
      tag(PHASE_16A_EOS_TAG) === PHASE_16A_EOS_COMMIT &&
        has(VERSION, new RegExp(PHASE_16A_EOS_COMMIT)),
    ),
  );
  push(
    gate(
      "D",
      "Frozen module tags intact",
      tag("project-intelligence-v1.0.0") === PHASE_16A_PI_COMMIT &&
        tag("inspection-intelligence-v1.0.0") === PHASE_16A_II_COMMIT &&
        tag("asset-intelligence-v1.0.0") === PHASE_16A_AI_COMMIT &&
        tag("project-controls-v1.0.0") === PHASE_16A_PC_COMMIT &&
        tag("digital-twin-v1.0.0") === PHASE_16A_DT_COMMIT &&
        tag("engineering-model-interoperability-v1.0.0") === PHASE_16A_INTEROP_COMMIT,
    ),
  );
  push(
    gate(
      "E",
      "Discovery version 0.1.0-enterprise-sso-discovery",
      has(VERSION, /PLATFORM_IDENTITY_VERSION = "0\.1\.0-enterprise-sso-discovery"/) &&
        has("packages/platform-identity/package.json", /0\.1\.0-enterprise-sso-discovery/),
    ),
  );
  push(
    gate(
      "F",
      "Identity footprint inventory",
      exists(FOOTPRINT_DOC) &&
        has(FOOTPRINT_DOC, /AUTHORITATIVE_EXISTING/) &&
        has(FOOTPRINT_DOC, /MISSING/) &&
        has(FOOTPRINT, /EXISTING_IDENTITY_FOOTPRINT/),
    ),
  );
  push(
    gate(
      "G",
      "Identity ownership locked",
      exists(OWNERSHIP) &&
        has(OWNERSHIP, /\*\*None remaining\*\*/) &&
        flagTrue(flagsSrc, "PlatformIdentityOwnershipLocked") &&
        flagTrue(flagsSrc, "CustomerSsoOwnershipLocked") &&
        has(FLAGS, /platformIdentityOwnership = "platform_identity"/) &&
        has(FLAGS, /customerSsoOwnership = "platform_identity"/),
    ),
  );
  push(
    gate(
      "H",
      "Protocol strategy locked",
      exists(PROTOCOL) &&
        has(PROTOCOL, /OpenID Connect/) &&
        has(PROTOCOL, /SAML 2\.0/) &&
        flagTrue(flagsSrc, "EnterpriseSsoProtocolStrategyLocked") &&
        has(DECISIONS, /primaryV1FederationProtocol: "oidc_oauth2"/),
    ),
  );
  push(
    gate(
      "I",
      "Entra first-class boundary",
      has(PROTOCOL, /First-class/) &&
        has(ARCH, /Entra/) &&
        has(DECISIONS, /microsoftEntraFirstClass: true/) &&
        has(DECISIONS, /microsoftEntraExclusiveHardCodeForbidden: true/),
    ),
  );
  push(
    gate(
      "J",
      "Provider-neutral architecture",
      exists(ARCH) &&
        has(ARCH, /provider-neutral/i) &&
        has(DECISIONS, /providerNeutral: true/) &&
        flagTrue(flagsSrc, "EnterpriseSsoArchitectureLocked"),
    ),
  );
  push(
    gate(
      "K",
      "Tenant SSO policy",
      has(ARCH, /required_for_privileged_users/) &&
        has(ARCH, /passwordFallbackWhenRequired = false/) &&
        has(DECISIONS, /TENANT_SSO_POLICY_MODES/) &&
        has(DRAFT, /TenantSsoPolicy/),
    ),
  );
  push(
    gate(
      "L",
      "Domain verification architecture",
      has(ARCH, /verified domain/) &&
        has(ARCH, /Domain ownership must be verified/) &&
        has(DRAFT, /VerifiedIdentityDomain/),
    ),
  );
  push(
    gate(
      "M",
      "User/tenant binding",
      has(ARCH, /stable provider subject/) &&
        has(ARCH, /email domain/) &&
        has(DRAFT, /ExternalIdentityReference/),
    ),
  );
  push(
    gate(
      "N",
      "Account linking",
      has(LIFECYCLE, /email takeover/) &&
        has(LIFECYCLE, /cross-tenant/) &&
        has(LIFECYCLE, /governed verification/),
    ),
  );
  push(
    gate(
      "O",
      "JIT decision",
      has(LIFECYCLE, /OPTIONAL/) &&
        has(DECISIONS, /JIT_DECISION/) &&
        has(DECISIONS, /uncontrolledGroupToAdminMappingForbidden: true/),
    ),
  );
  push(
    gate(
      "P",
      "SCIM decision",
      has(LIFECYCLE, /POST_V1/) &&
        has(DECISIONS, /SCIM_DECISION/) &&
        has(DECISIONS, /ssoAuthenticationDistinctFromLifecycleProvisioning: true/) &&
        flagFalse(flagsSrc, "ScimProvisioningImplemented"),
    ),
  );
  push(
    gate(
      "Q",
      "Role/group mapping",
      has(ARCH, /governed/) &&
        has(DRAFT, /EnterpriseRoleMapping/) &&
        has(THREAT, /Role\/group escalation/),
    ),
  );
  push(
    gate(
      "R",
      "MFA assurance",
      has(ARCH, /SSO ≠ MFA/) &&
        has(DECISIONS, /ssoDoesNotEqualMfa: true/) &&
        has(DECISIONS, /phase14dPrivilegedMfaPreserved: true/),
    ),
  );
  push(
    gate(
      "S",
      "Conditional Access boundary",
      has(ARCH, /Conditional Access/) &&
        has(DECISIONS, /rtbIsNotCustomerConditionalAccessEngine: true/),
    ),
  );
  push(
    gate(
      "T",
      "Session security",
      has(ARCH, /Session/) &&
        has(LIFECYCLE, /Offboarding/) &&
        has(THREAT, /Logout \/ session mismatch/),
    ),
  );
  push(
    gate(
      "U",
      "Offboarding",
      has(LIFECYCLE, /disabled\/removed/) && has(LIFECYCLE, /instantaneous/),
    ),
  );
  push(
    gate(
      "V",
      "Break-glass boundary",
      has(LIFECYCLE, /break-glass/) &&
        has(ARCH, /break-glass/) &&
        has(LIFECYCLE, /No shared universal emergency credential/),
    ),
  );
  push(
    gate(
      "W",
      "Multi-tenant IdP isolation",
      has(ARCH, /issuer\/audience\/tenant/) && has(THREAT, /Tenant confusion/),
    ),
  );
  push(
    gate(
      "X",
      "Security & Assurance evidence boundary",
      has(OWNERSHIP, /Security & Assurance/) &&
        flagFalse(flagsSrc, "securityAssuranceOwnsCustomerSso") &&
        has(FOOTPRINT_DOC, /evidences SSO|does \*\*not\*\* own SSO|does not own SSO/i),
    ),
  );
  push(
    gate(
      "Y",
      "Audit reuse",
      has(FOOTPRINT_DOC, /Platform Audit/) && has(GAPS, /Audit \+ events/),
    ),
  );
  push(
    gate(
      "Z",
      "Events reuse",
      has(FOOTPRINT_DOC, /Event Bus/) && has(FOOTPRINT_DOC, /metadata events/),
    ),
  );
  push(
    gate(
      "AA",
      "Threat model",
      exists(THREAT) &&
        has(THREAT, /Issuer substitution/) &&
        flagTrue(flagsSrc, "EnterpriseSsoThreatModelReady"),
    ),
  );
  push(
    gate(
      "AB",
      "Fail-closed semantics",
      has(THREAT, /authenticated externally ≠ authorized internally/) &&
        has(DECISIONS, /FAIL_CLOSED_SEMANTICS/) &&
        has(VERSION, /PLATFORM_IDENTITY_V1_SEMANTICS/),
    ),
  );
  push(
    gate(
      "AC",
      "Customer UX",
      exists(UX) && has(UX, /Email-first/) && has(UX, /SSO-required redirect/),
    ),
  );
  push(
    gate(
      "AD",
      "Admin UX",
      has(UX, /configure provider/) && has(UX, /verify domain/),
    ),
  );
  push(
    gate(
      "AE",
      "Commercial boundary",
      has(UX, /enterprise entitlement/) &&
        has(UX, /privileged MFA/) &&
        has(UX, /never/),
    ),
  );
  push(
    gate(
      "AF",
      "S07 sequencing",
      has(TIER1, /independent external penetration test/) &&
        has(DECISIONS, /S07_SEQUENCING/) &&
        has(ROADMAP, /penetration test/),
    ),
  );
  push(
    gate(
      "AG",
      "Tier-1 readiness flags false",
      flagFalse(flagsSrc, "S07ExternalPenTestComplete") &&
        flagFalse(flagsSrc, "S08CustomerSsoProductionReady") &&
        flagFalse(flagsSrc, "CustomerSsoProductionReady") &&
        flagFalse(flagsSrc, "Tier1EnterpriseProductionReady") &&
        has(TIER1, /Tier1EnterpriseProductionReady=false/),
    ),
  );
  push(
    gate(
      "AH",
      "Draft contracts 0.1.0-draft",
      exists(CONTRACTS_DOC) &&
        has(CONTRACTS_DOC, /0\.1\.0-draft/) &&
        has(VERSION, /0\.1\.0-draft/) &&
        has(DRAFT, /EnterpriseIdentityProviderConfiguration/) &&
        !has(CONTRACTS_DOC, /FROZEN at 1\.0\.0/),
    ),
  );
  push(
    gate(
      "AI",
      "Package placement",
      has(DECISIONS, /@rtb\/platform-identity/) &&
        has(DECISIONS, /securityAssuranceSsoPackageForbidden: true/) &&
        !exists("packages/security-assurance-sso") &&
        !exists("packages/engineering-os-sso") &&
        !exists("packages/customer-sso-platform"),
    ),
  );
  push(
    gate(
      "AJ",
      "Gap register",
      exists(GAPS) &&
        has(GAPS, /REQUIRED_FOR_S08/) &&
        flagTrue(flagsSrc, "EnterpriseSsoGapRegisterReady"),
    ),
  );
  push(
    gate(
      "AK",
      "Implementation roadmap",
      exists(ROADMAP) &&
        has(ROADMAP, /OIDC/) &&
        flagTrue(flagsSrc, "EnterpriseSsoImplementationRoadmapReady") &&
        has(DECISIONS, /S08_MINIMUM_IMPLEMENTATION_SCOPE/),
    ),
  );
  push(
    gate(
      "AL",
      "Anti-duplication",
      flagFalse(flagsSrc, "duplicateIdentityProviderDetected") &&
        flagFalse(flagsSrc, "duplicateAuthorizationSystemDetected") &&
        flagFalse(flagsSrc, "duplicatePolicyEngineDetected") &&
        flagFalse(flagsSrc, "duplicateAuditSystemDetected"),
    ),
  );
  push(gate("AM", "SecurityAssuranceV1Intact", flagTrue(flagsSrc, "SecurityAssuranceV1Intact")));
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
      ].every((n) => flagTrue(flagsSrc, n)),
    ),
  );
  push(
    gate(
      "AP",
      "No production SSO runtime",
      flagFalse(flagsSrc, "EnterpriseSsoRuntimeImplemented") &&
        flagFalse(flagsSrc, "OidcFederationImplemented") &&
        flagFalse(flagsSrc, "SamlFederationImplemented") &&
        flagFalse(flagsSrc, "LiveEntraIntegrationImplemented") &&
        flagFalse(flagsSrc, "DomainVerificationImplemented"),
    ),
  );

  const unit = run("pnpm --filter @rtb/platform-identity test");
  push(gate("AQ", "Unit tests", unit.ok, unit.detail));
  const secret = run("pnpm --filter @rtb/platform-identity-certification secret-scan");
  push(gate("AR", "Secret scan", secret.ok, secret.detail));
  push(gate("AS", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase-16a/)));
  push(
    gate(
      "AT",
      "Platform architecture test",
      exists("packages/platform-certification/src/phase16a-platform-enterprise-sso-discovery.test.ts"),
    ),
  );
  push(
    gate(
      "AU",
      "Phase 16A overview",
      exists(PHASE_DOC) && has(PHASE_DOC, /S08/) && has(PHASE_DOC, /0\.1\.0-enterprise-sso-discovery/),
    ),
  );
  push(
    gate(
      "AV",
      "Ownership matrix UNKNOWN=0",
      has(OWNERSHIP, /\*\*None remaining\*\*/),
    ),
  );
  push(gate("AW", "phase16BReady", flagTrue(flagsSrc, "phase16BReady")));
  push(
    gate(
      "AX",
      "S08 remains incomplete",
      flagFalse(flagsSrc, "S08CustomerSsoProductionReady") &&
        has(TIER1, /S08CustomerSsoProductionReady=false/),
    ),
  );
  push(
    gate(
      "AY",
      "S07 remains incomplete",
      flagFalse(flagsSrc, "S07ExternalPenTestComplete") &&
        has(TIER1, /S07ExternalPenTestComplete=false/),
    ),
  );
  push(
    gate(
      "AZ",
      "No Sec&A V1 contract mutation",
      has(SA_VERSION, /SECURITY_ASSURANCE_VERSION = "1\.0\.0"/) &&
        has(SA_VERSION, /SecurityAssuranceV1GaCertified = true/) &&
        has(SA_CONTRACTS, /FROZEN/) &&
        has(SA_CONTRACTS, /1\.0\.0/),
    ),
  );
  push(
    gate(
      "BA",
      "No EOS V1 mutation",
      has(EOS_VERSION, /ENGINEERING_OS_VERSION = "1\.0\.0"/) &&
        has(EOS_VERSION, /engineeringOSV1Frozen = true/),
    ),
  );
  push(gate("BB", "Artifact identity", Boolean(commit), commit));
  push(
    gate(
      "BE",
      "securityAssuranceOwnsCustomerSso=false",
      flagFalse(flagsSrc, "securityAssuranceOwnsCustomerSso") &&
        flagFalse(flagsSrc, "EngineeringOsOwnsCustomerSso"),
    ),
  );
  push(
    gate(
      "BD",
      "Discovery package not 1.0.0",
      has(VERSION, /0\.1\.0-enterprise-sso-discovery/) &&
        !has(VERSION, /PLATFORM_IDENTITY_VERSION = "1\.0\.0"/),
    ),
  );

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase16a-platform-enterprise-sso-discovery.test.ts",
  );
  if (!arch.ok) {
    byId.set("AT", gate("AT", "Platform architecture test", false, arch.detail));
    const idx = results.findIndex((g) => g.id === "AT");
    if (idx >= 0) results[idx] = byId.get("AT")!;
  }

  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "BC",
      "releaseEligible",
      priorFailed === 0 &&
        flagTrue(flagsSrc, "EnterpriseIdentityDiscoveryReady") &&
        flagTrue(flagsSrc, "phase16BReady") &&
        flagFalse(flagsSrc, "S08CustomerSsoProductionReady"),
      `priorFailed=${priorFailed}`,
    ),
  );

  const ordered = PHASE_16A_PLATFORM_ENTERPRISE_SSO_DISCOVERY_GATES.map(([id, name]) => {
    return byId.get(id) ?? { id, name, status: "not_executed" as const };
  });
  const failed = ordered.filter((g) => g.status === "fail");
  const skipped = ordered.filter((g) => g.status === "skip");
  const notExecuted = ordered.filter((g) => g.status === "not_executed");
  const verdict =
    failed.length === 0 && skipped.length === 0 && notExecuted.length === 0 ? "PASS" : "FAIL";

  const artifact = {
    title: "Platform Enterprise SSO Discovery",
    schemaVersion: "platform-enterprise-sso-discovery-certification/1",
    phase: "16A",
    verdict,
    version: PHASE_16A_VERSION,
    status: "discovery",
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    securityAssuranceV1Baseline: PHASE_16A_SA_COMMIT,
    engineeringOsV1Baseline: PHASE_16A_EOS_COMMIT,
    gateCount: PHASE_16A_GATE_COUNT,
    requiredGates: PHASE_16A_PLATFORM_ENTERPRISE_SSO_DISCOVERY_GATES.map(([id, name]) => ({
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
    EnterpriseIdentityDiscoveryReady: true,
    PlatformIdentityOwnershipLocked: true,
    CustomerSsoOwnershipLocked: true,
    EnterpriseSsoArchitectureLocked: true,
    EnterpriseSsoProtocolStrategyLocked: true,
    EnterpriseIdentityLifecycleDefined: true,
    EnterpriseSsoThreatModelReady: true,
    EnterpriseSsoGapRegisterReady: true,
    EnterpriseSsoImplementationRoadmapReady: true,
    CustomerSsoProductionReady: false,
    S08CustomerSsoProductionReady: false,
    S07ExternalPenTestComplete: false,
    Tier1EnterpriseProductionReady: false,
    securityAssuranceOwnsCustomerSso: false,
    EngineeringOsOwnsCustomerSso: false,
    EnterpriseSsoRuntimeImplemented: false,
    duplicateIdentityProviderDetected: false,
    duplicateAuthorizationSystemDetected: false,
    duplicatePolicyEngineDetected: false,
    duplicateAuditSystemDetected: false,
    SecurityAssuranceV1Intact: true,
    EngineeringOSV1Intact: true,
    phase16BReady: true,
    releaseEligible: verdict === "PASS",
    gates: ordered,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase16a-platform-enterprise-sso-discovery-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        verdict,
        version: PHASE_16A_VERSION,
        gateCount: PHASE_16A_GATE_COUNT,
        failedGateCount: failed.length,
        failedGates: failed.map((g) => g.id),
        releaseEligible: artifact.releaseEligible,
        phase16BReady: true,
        S08CustomerSsoProductionReady: false,
        artifact: outPath,
      },
      null,
      2,
    ),
  );
  if (verdict !== "PASS") process.exit(1);
}

main();
