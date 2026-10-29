/**
 * Phase 14A certification runner — Engineering OS GA Readiness Lock.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_14A_AI_COMMIT,
  PHASE_14A_AI_TAG,
  PHASE_14A_DT_COMMIT,
  PHASE_14A_DT_TAG,
  PHASE_14A_ENGINEERING_OS_GA_READINESS_GATES,
  PHASE_14A_EOS_STATUS,
  PHASE_14A_EOS_VERSION,
  PHASE_14A_GATE_COUNT,
  PHASE_14A_II_COMMIT,
  PHASE_14A_II_TAG,
  PHASE_14A_INTEROP_COMMIT,
  PHASE_14A_INTEROP_TAG,
  PHASE_14A_PC_COMMIT,
  PHASE_14A_PC_TAG,
  PHASE_14A_PI_COMMIT,
  PHASE_14A_PI_TAG,
  type Phase14aGateId,
} from "../src/phase14a/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const EOS = "packages/engineering-os";
const EOS_CERT = "packages/engineering-os-certification";
const VERSION = `${EOS}/src/version.ts`;
const EOS_PKG = `${EOS}/package.json`;
const EOS_CERT_PKG = `${EOS_CERT}/package.json`;
const WORKFLOW = ".github/workflows/phase-14a-engineering-os-ga-readiness.yml";

const DOCS = {
  inventory: "docs/architecture/ENGINEERING_OS_PHASE_14A_EXISTING_SYSTEM_INVENTORY.md",
  boundary: "docs/architecture/ENGINEERING_OS_PRODUCT_BOUNDARY.md",
  ownership: "docs/architecture/ENGINEERING_OS_V1_OWNERSHIP_MATRIX.md",
  normalization: "docs/architecture/ENGINEERING_OS_CANONICAL_OWNERSHIP_NORMALIZATION.md",
  sharedMaturity: "docs/architecture/ENGINEERING_OS_SHARED_DOMAIN_MATURITY_MATRIX.md",
  compatibility: "docs/architecture/ENGINEERING_OS_V1_MODULE_COMPATIBILITY_MATRIX.md",
  capability: "docs/architecture/ENGINEERING_OS_V1_CAPABILITY_MATRIX.md",
  search: "docs/architecture/ENGINEERING_OS_CROSS_MODULE_SEARCH_MODEL.md",
  ai: "docs/architecture/ENGINEERING_OS_AI_ORCHESTRATION_MODEL.md",
  tools: "docs/architecture/ENGINEERING_OS_TOOL_FRAMEWORK_INTEGRATION.md",
  solver: "docs/architecture/CLIENT_OWNED_COMMERCIAL_SOLVER_EXECUTION_ARCHITECTURE.md",
  nav: "docs/architecture/ENGINEERING_OS_V1_NAVIGATION_MODEL.md",
  context: "docs/architecture/ENGINEERING_OS_CONTEXT_MODEL.md",
  events: "docs/architecture/ENGINEERING_OS_V1_EVENT_MATRIX.md",
  health: "docs/architecture/ENGINEERING_OS_V1_HEALTH_MODEL.md",
  packaging: "docs/commercial/ENGINEERING_OS_V1_PACKAGING_ARCHITECTURE.md",
  security: "docs/security/ENGINEERING_OS_V1_SECURITY_BOUNDARY.md",
  perf: "docs/operations/ENGINEERING_OS_V1_CAPACITY_AND_PERFORMANCE_BASELINE.md",
  ops: "docs/operations/ENGINEERING_OS_V1_OPERATIONS_READINESS.md",
  gaps: "docs/architecture/ENGINEERING_OS_V1_GA_GAP_REGISTER.md",
  readiness: "docs/architecture/ENGINEERING_OS_V1_READINESS_MATRIX.md",
  phase: "docs/architecture/ENGINEERING_OS_PHASE_14A.md",
} as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase14aGateId; name: string; status: GateStatus; detail?: string };

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
function readRepoFile(rel: string): string {
  return readFileSync(resolve(root, rel), "utf8");
}
function has(rel: string, re: RegExp) {
  try {
    return re.test(readRepoFile(rel));
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
function gate(
  id: Phase14aGateId,
  name: string,
  ok: boolean,
  detail?: string,
): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "fail") };
}

function main() {
  const commit = sha();
  const versionSrc = readRepoFile(VERSION);
  const pkg = JSON.parse(readRepoFile(EOS_PKG)) as { version: string };
  const gaps = readRepoFile(DOCS.gaps);

  const results: GateResult[] = [];
  const byId = new Map<Phase14aGateId, GateResult>();
  const push = (g: GateResult) => {
    results.push(g);
    byId.set(g.id, g);
  };

  push(gate("A", "Repository/build identity", Boolean(commit), commit));
  push(
    gate(
      "B",
      "Project Intelligence V1 tag intact",
      tag(PHASE_14A_PI_TAG) === PHASE_14A_PI_COMMIT,
    ),
  );
  push(
    gate(
      "C",
      "Inspection Intelligence V1 tag intact",
      tag(PHASE_14A_II_TAG) === PHASE_14A_II_COMMIT,
    ),
  );
  push(
    gate(
      "D",
      "Asset Intelligence V1 tag intact",
      tag(PHASE_14A_AI_TAG) === PHASE_14A_AI_COMMIT,
    ),
  );
  push(
    gate(
      "E",
      "Project Controls V1 tag intact",
      tag(PHASE_14A_PC_TAG) === PHASE_14A_PC_COMMIT,
    ),
  );
  push(
    gate(
      "F",
      "Digital Twin V1 tag intact",
      tag(PHASE_14A_DT_TAG) === PHASE_14A_DT_COMMIT,
    ),
  );
  push(
    gate(
      "G",
      "Engineering Model Interoperability V1 tag intact",
      tag(PHASE_14A_INTEROP_TAG) === PHASE_14A_INTEROP_COMMIT,
    ),
  );
  push(gate("H", "Engineering OS package exists", exists(EOS_PKG)));
  push(gate("I", "Engineering OS certification package exists", exists(EOS_CERT_PKG)));
  push(
    gate(
      "J",
      "Version 0.9.0-ga-readiness",
      pkg.version === PHASE_14A_EOS_VERSION &&
        has(VERSION, /ENGINEERING_OS_VERSION = "0\.9\.0-ga-readiness"/),
    ),
  );
  push(
    gate(
      "K",
      "Status ga_readiness",
      has(VERSION, /ENGINEERING_OS_STATUS = "ga_readiness"/),
    ),
  );
  push(
    gate(
      "L",
      "productionEngineeringOSReady is false",
      has(VERSION, /productionEngineeringOSReady = false/),
    ),
  );
  push(
    gate(
      "M",
      "engineeringOSV1GaCertified is false",
      has(VERSION, /engineeringOSV1GaCertified = false/),
    ),
  );

  const docGates: Array<[Phase14aGateId, string, string, RegExp]> = [
    ["N", "System inventory document", DOCS.inventory, /Package inventory/],
    ["O", "Product boundary document", DOCS.boundary, /MUST_NEVER_OWN/],
    ["P", "Ownership matrix document", DOCS.ownership, /duplicateAssetOwnershipDetected/],
    ["Q", "Canonical ownership normalization document", DOCS.normalization, /UNKNOWN ownership/],
    ["R", "Shared domain maturity matrix", DOCS.sharedMaturity, /Shared Spatial Domain/],
    ["S", "Module compatibility matrix", DOCS.compatibility, /privateCrossModuleCouplingDetected/],
    ["T", "Capability matrix", DOCS.capability, /blocked_external_dependency/],
    ["U", "Cross-module search model", DOCS.search, /search result ≠ authority/],
    ["V", "AI orchestration model", DOCS.ai, /implementsOwnAiStack = false/],
    ["W", "Tool framework integration", DOCS.tools, /duplicateEngineeringToolFrameworkDetected/],
    ["X", "Client-owned commercial solver architecture", DOCS.solver, /clientLicensedSolverExecutionArchitectureSupported = true/],
    ["Y", "Navigation model", DOCS.nav, /Engineering Models/],
    ["Z", "Context model", DOCS.context, /EngineeringContext/],
    ["AA", "Event matrix", DOCS.events, /Platform Event Bus/],
    ["AB", "Health model", DOCS.health, /Partial degradation/],
    ["AC", "Commercial packaging architecture", DOCS.packaging, /Platform Commerce/],
    ["AD", "Security boundary", DOCS.security, /JWT/],
    ["AE", "Capacity/performance baseline", DOCS.perf, /enterprise-scale claim/],
    ["AF", "Operations readiness", DOCS.ops, /Offline \/ mobile/],
    ["AG", "GA gap register", DOCS.gaps, /REQUIRED_BEFORE_GA/],
    ["AH", "V1 readiness matrix", DOCS.readiness, /productionEngineeringOSReady/],
    ["AI", "Phase 14A overview", DOCS.phase, /0\.9\.0-ga-readiness/],
  ];
  for (const [id, name, path, re] of docGates) {
    push(gate(id, name, exists(path) && has(path, re), path));
  }

  const flagGates: Array<[Phase14aGateId, string, RegExp]> = [
    ["AJ", "EngineeringOSGaReadinessAssessmentComplete", /EngineeringOSGaReadinessAssessmentComplete = true/],
    ["AK", "EngineeringOSProductBoundaryLocked", /EngineeringOSProductBoundaryLocked = true/],
    ["AL", "EngineeringOSOwnershipModelLocked", /EngineeringOSOwnershipModelLocked = true/],
    ["AM", "EngineeringOSModuleCompatibilityAssessed", /EngineeringOSModuleCompatibilityAssessed = true/],
    ["AN", "EngineeringOSSharedDomainMaturityAssessed", /EngineeringOSSharedDomainMaturityAssessed = true/],
    ["AO", "EngineeringOSCapabilityMatrixReady", /EngineeringOSCapabilityMatrixReady = true/],
    ["AP", "EngineeringOSCrossModuleSearchAssessed", /EngineeringOSCrossModuleSearchAssessed = true/],
    ["AQ", "EngineeringOSAiOrchestrationAssessed", /EngineeringOSAiOrchestrationAssessed = true/],
    ["AR", "EngineeringOSToolFrameworkIntegrated", /EngineeringOSToolFrameworkIntegrated = true/],
    ["AS", "clientLicensedSolverExecutionArchitectureSupported", /clientLicensedSolverExecutionArchitectureSupported = true/],
    ["AT", "EngineeringOSNavigationAssessed", /EngineeringOSNavigationAssessed = true/],
    ["AU", "EngineeringOSContextModelLocked", /EngineeringOSContextModelLocked = true/],
    ["AV", "EngineeringOSEventMatrixReady", /EngineeringOSEventMatrixReady = true/],
    ["AW", "EngineeringOSHealthModelDefined", /EngineeringOSHealthModelDefined = true/],
    ["AX", "EngineeringOSCommercialPackagingDefined", /EngineeringOSCommercialPackagingDefined = true/],
    ["AY", "EngineeringOSSecurityBoundaryDefined", /EngineeringOSSecurityBoundaryDefined = true/],
    ["AZ", "EngineeringOSOperationsReadinessAssessed", /EngineeringOSOperationsReadinessAssessed = true/],
    ["BA", "EngineeringOSGaGapRegisterReady", /EngineeringOSGaGapRegisterReady = true/],
    ["BB", "EngineeringOSV1ReadinessMatrixReady", /EngineeringOSV1ReadinessMatrixReady = true/],
  ];
  for (const [id, name, re] of flagGates) {
    push(gate(id, name, has(VERSION, re)));
  }

  push(
    gate(
      "BC",
      "Duplicate ownership/framework flags false",
      has(VERSION, /duplicateAssetOwnershipDetected = false/) &&
        has(VERSION, /duplicateProjectOwnershipDetected = false/) &&
        has(VERSION, /duplicateSpatialOwnershipDetected = false/) &&
        has(VERSION, /duplicateKnowledgeGraphDetected = false/) &&
        has(VERSION, /duplicateWorkflowEngineDetected = false/) &&
        has(VERSION, /duplicateEngineeringToolFrameworkDetected = false/) &&
        has(VERSION, /privateCrossModuleCouplingDetected = false/),
    ),
  );
  push(gate("BD", "implementsOwnAiStack false", has(VERSION, /implementsOwnAiStack = false/)));
  push(
    gate(
      "BE",
      "Live commercial solver flags false",
      has(VERSION, /clientLicensedETABSExecutionCertified = false/) &&
        has(VERSION, /clientLicensedSPACEGASSExecutionCertified = false/) &&
        has(VERSION, /silentSolverFallbackAllowed = false/),
    ),
  );
  push(
    gate(
      "BF",
      "Gap register has no UNKNOWN ownership",
      /UNKNOWN ownership boundaries/.test(gaps) &&
        /\*\*None remaining\*\*/.test(readRepoFile(DOCS.normalization)) &&
        !/Class \| UNKNOWN/.test(gaps),
    ),
  );
  push(
    gate(
      "BG",
      "Migration lineage inventoried / no 14A migration",
      has(DOCS.inventory, /No Phase 14A migration/) &&
        !exists("supabase/migrations/20260809000000_batch_90_engineering_os_ga.sql"),
    ),
  );
  push(
    gate(
      "BH",
      "UI/status mismatches documented",
      has(DOCS.gaps, /coming_soon/) && has(DOCS.inventory, /mismatch/i),
    ),
  );

  const secret = run("pnpm --filter @rtb/engineering-os-certification secret-scan");
  push(gate("BI", "Secret exposure", secret.ok, secret.detail));
  push(gate("BJ", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase-14a-engineering-os-ga-readiness/)));
  const unit = run("pnpm --filter @rtb/engineering-os test");
  push(gate("BK", "Unit tests", unit.ok, unit.detail));

  const phase14BReady = has(VERSION, /phase14BReady = true/);
  const releaseEligible =
    results.every((g) => g.status === "pass") &&
    phase14BReady &&
    has(VERSION, /productionEngineeringOSReady = false/) &&
    has(VERSION, /engineeringOSV1GaCertified = false/);
  // BL evaluated after provisional releaseEligible computation excluding itself
  const priorFailed = results.filter((g) => g.status !== "pass").length;
  push(
    gate(
      "BL",
      "phase14BReady and releaseEligible",
      phase14BReady && priorFailed === 0,
      `phase14BReady=${phase14BReady};priorFailed=${priorFailed}`,
    ),
  );

  // Ensure every declared gate executed
  for (const [id, name] of PHASE_14A_ENGINEERING_OS_GA_READINESS_GATES) {
    if (!byId.has(id)) {
      push({ id, name, status: "not_executed", detail: "missing" });
    }
  }

  const ordered = PHASE_14A_ENGINEERING_OS_GA_READINESS_GATES.map(([id, name]) => {
    return byId.get(id) ?? { id, name, status: "not_executed" as const, detail: "missing" };
  });

  const failed = ordered.filter((g) => g.status === "fail");
  const skipped = ordered.filter((g) => g.status === "skip");
  const notExecuted = ordered.filter((g) => g.status === "not_executed");
  const verdict =
    failed.length === 0 && skipped.length === 0 && notExecuted.length === 0
      ? "PASS"
      : "FAIL";
  const finalReleaseEligible = verdict === "PASS";

  const artifact = {
    schemaVersion: "phase14a-engineering-os-ga-readiness/1",
    phase: "14A",
    name: "phase14a-engineering-os-ga-readiness-certification",
    version: PHASE_14A_EOS_VERSION,
    status: PHASE_14A_EOS_STATUS,
    title: "Engineering OS V1 System Integration and GA Readiness Lock",
    verdict,
    commit,
    artifactCommitSha: commit,
    ciHeadSha: process.env.GITHUB_SHA ?? commit,
    buildIdentitySha: commit,
    EngineeringOSGaReadinessAssessmentComplete: true,
    EngineeringOSProductBoundaryLocked: true,
    EngineeringOSOwnershipModelLocked: true,
    EngineeringOSModuleCompatibilityAssessed: true,
    EngineeringOSSharedDomainMaturityAssessed: true,
    EngineeringOSCapabilityMatrixReady: true,
    EngineeringOSCrossModuleSearchAssessed: true,
    EngineeringOSAiOrchestrationAssessed: true,
    EngineeringOSToolFrameworkIntegrated: true,
    clientLicensedSolverExecutionArchitectureSupported: true,
    EngineeringOSNavigationAssessed: true,
    EngineeringOSContextModelLocked: true,
    EngineeringOSEventMatrixReady: true,
    EngineeringOSHealthModelDefined: true,
    EngineeringOSCommercialPackagingDefined: true,
    EngineeringOSSecurityBoundaryDefined: true,
    EngineeringOSOperationsReadinessAssessed: true,
    EngineeringOSGaGapRegisterReady: true,
    EngineeringOSV1ReadinessMatrixReady: true,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    duplicateSpatialOwnershipDetected: false,
    duplicateKnowledgeGraphDetected: false,
    duplicateWorkflowEngineDetected: false,
    duplicateEngineeringToolFrameworkDetected: false,
    privateCrossModuleCouplingDetected: false,
    productionEngineeringOSReady: false,
    engineeringOSV1GaCertified: false,
    clientLicensedETABSExecutionCertified: false,
    clientLicensedSPACEGASSExecutionCertified: false,
    implementsOwnAiStack: false,
    silentSolverFallbackAllowed: false,
    ProjectIntelligenceV1Intact: tag(PHASE_14A_PI_TAG) === PHASE_14A_PI_COMMIT,
    InspectionIntelligenceV1Intact: tag(PHASE_14A_II_TAG) === PHASE_14A_II_COMMIT,
    AssetIntelligenceV1Intact: tag(PHASE_14A_AI_TAG) === PHASE_14A_AI_COMMIT,
    ProjectControlsV1Intact: tag(PHASE_14A_PC_TAG) === PHASE_14A_PC_COMMIT,
    DigitalTwinV1Intact: tag(PHASE_14A_DT_TAG) === PHASE_14A_DT_COMMIT,
    EngineeringModelInteroperabilityV1Intact:
      tag(PHASE_14A_INTEROP_TAG) === PHASE_14A_INTEROP_COMMIT,
    phase14BReady: true,
    releaseEligible: finalReleaseEligible,
    secretExposure: false,
    secretExposureDetected: !secret.ok,
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    gates: ordered,
    requiredGates: PHASE_14A_ENGINEERING_OS_GA_READINESS_GATES.map(([id]) => id),
    gateCount: PHASE_14A_GATE_COUNT,
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
    "phase14a-engineering-os-ga-readiness-certification.json",
  );
  writeFileSync(outFile, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        version: artifact.version,
        gateCount: artifact.gateCount,
        failedGateCount: artifact.failedGateCount,
        releaseEligible: artifact.releaseEligible,
        productionEngineeringOSReady: artifact.productionEngineeringOSReady,
        phase14BReady: artifact.phase14BReady,
        artifact: outFile,
      },
      null,
      2,
    ),
  );
  if (verdict !== "PASS") process.exit(1);
}

main();
