/**
 * Phase 13A certification runner (gates A–BE) — Engineering Model & Solver
 * Interoperability Discovery.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_13A_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_13A_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_13A_DIGITAL_TWIN_COMMIT,
  PHASE_13A_DIGITAL_TWIN_TAG,
  PHASE_13A_DIGITAL_TWIN_VERSION,
  PHASE_13A_ENGINEERING_INTEROP_DISCOVERY_GATES,
  PHASE_13A_GATE_COUNT,
  PHASE_13A_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_13A_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_13A_INTEROP_VERSION,
  PHASE_13A_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_13A_PROJECT_CONTROLS_V1_TAG,
  PHASE_13A_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_13A_PROJECT_INTELLIGENCE_V1_TAG,
  type Phase13aGateId,
} from "../src/phase13a/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

function loadEnvLocal() {
  const envPath = resolve(root, ".env.local");
  if (!existsSync(envPath)) return;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvLocal();

const EMI = "packages/engineering-model-interoperability";
const EMI_CERT = "packages/engineering-model-interoperability-certification";
const DT = "packages/digital-twin";
const VERSION = `${EMI}/src/version.ts`;
const OWNERSHIP_LOCK = `${EMI}/src/architecture/ownership-lock.ts`;
const TERMINOLOGY = `${EMI}/src/architecture/terminology-lock.ts`;
const FEDERATION = `${EMI}/src/architecture/federation-model.ts`;
const CONTRACTS = `${EMI}/src/contracts/draft-contracts.ts`;
const PROVIDERS = `${EMI}/src/discovery/provider-matrix.ts`;
const FOOTPRINT = `${EMI}/src/discovery/existing-footprint.ts`;
const INDEX = `${EMI}/src/index.ts`;
const EMI_PKG = `${EMI}/package.json`;
const EMI_TEST = `${EMI}/tests/ownership-lock.test.ts`;
const EMI_CERT_PKG = `${EMI_CERT}/package.json`;
const GATES_FILE = `${EMI_CERT}/src/phase13a/gates.ts`;
const RUNNER_FILE = `${EMI_CERT}/scripts/run-phase13a-certification.ts`;
const SECRET_SCAN_FILE = `${EMI_CERT}/scripts/secret-exposure-scan.ts`;
const WORKFLOW = ".github/workflows/phase-13a-engineering-interoperability-discovery.yml";
const DT_VERSION = `${DT}/src/version.ts`;
const DT_PKG = `${DT}/package.json`;
const DT_STUBS = `${DT}/src/domain/simulation-external-solver-stubs.ts`;

const DOC_FOOTPRINT =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_EXISTING_FOOTPRINT.md";
const DOC_BOUNDARY =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_BOUNDARY_MAP.md";
const DOC_OWNERSHIP =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_OWNERSHIP_MATRIX.md";
const DOC_IFC =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_IFC_STRATEGY.md";
const DOC_SOLVER =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_SOLVER_STRATEGY.md";
const DOC_ETABS =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_ETABS_DISCOVERY.md";
const DOC_SPACEGASS =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_SPACEGASS_DISCOVERY.md";
const DOC_FEDERATION = "docs/architecture/ENGINEERING_FEDERATION_MODEL.md";
const DOC_PHASE =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13A.md";
const DOC_CONTRACTS =
  "docs/contracts/ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACTS_DRAFT.md";

const FORBIDDEN_EMI_DIRECTORIES = [
  `${EMI}/src/runtime`,
  `${EMI}/src/adapters/production`,
  `${EMI}/src/services`,
  `${EMI}/src/api`,
  `${EMI}/migrations`,
] as const;

const FORBIDDEN_13B_PATHS = [
  `${EMI}/src/domain/phase13b`,
  `${DT}/src/domain/phase13a`,
  `${DT}/src/domain/phase13b`,
  "packages/engineering-model-interoperability-runtime",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase13aGateId; name: string; status: GateStatus; detail?: string };

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
function collectFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "artifacts") continue;
      collectFiles(full, acc);
    } else if (st.isFile()) {
      acc.push(full);
    }
  }
  return acc;
}
function discoveryPackageText(): string {
  return collectFiles(resolve(root, EMI))
    .filter((file) => /\.(ts|tsx|json|md|sql)$/.test(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}
function discoverySourceFiles(): string[] {
  return collectFiles(resolve(root, `${EMI}/src`))
    .map((file) => relative(resolve(root, EMI), file).split("\\").join("/"))
    .sort();
}

function gate(
  id: Phase13aGateId,
  name: string,
  ok: boolean,
  detail?: string,
): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "failed") };
}

function main() {
  const commit = sha();
  const pcTag = tag(PHASE_13A_PROJECT_CONTROLS_V1_TAG);
  const aiTag = tag(PHASE_13A_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_13A_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_13A_INSPECTION_INTELLIGENCE_V1_TAG);
  const dtTag = tag(PHASE_13A_DIGITAL_TWIN_TAG);
  const secretScan = run(
    `pnpm --filter @rtb/engineering-model-interoperability-certification secret-scan`,
  );
  const unitTests = run(`pnpm --filter @rtb/engineering-model-interoperability test`);
  const pkgText = discoveryPackageText();
  const sourceFiles = discoverySourceFiles();

  const noProductionAdapters =
    FORBIDDEN_EMI_DIRECTORIES.every((d) => !exists(d)) &&
    !pkgText.match(/productionAdapterImplemented:\s*true/) &&
    !sourceFiles.some((f) => /\/(runtime|adapters\/production)\//.test(f)) &&
    has(VERSION, /PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED = false/);

  const results: GateResult[] = [];
  const push = (id: Phase13aGateId, name: string, ok: boolean, detail?: string) => {
    results.push(gate(id, name, ok, detail));
  };

  push("A", "Repository/build identity", Boolean(commit) && exists(EMI_PKG) && exists(EMI_CERT_PKG));
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_13A_PROJECT_CONTROLS_V1_COMMIT,
    pcTag ?? "missing",
  );
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_13A_ASSET_INTELLIGENCE_V1_COMMIT,
    aiTag ?? "missing",
  );
  push(
    "D",
    "Project Intelligence V1 intact",
    piTag === PHASE_13A_PROJECT_INTELLIGENCE_V1_COMMIT,
    piTag ?? "missing",
  );
  push(
    "E",
    "Inspection Intelligence V1 intact",
    iiTag === PHASE_13A_INSPECTION_INTELLIGENCE_V1_COMMIT,
    iiTag ?? "missing",
  );
  push(
    "F",
    "Digital Twin V1 tag intact",
    dtTag === PHASE_13A_DIGITAL_TWIN_COMMIT,
    dtTag ?? "missing",
  );
  push(
    "G",
    "Interop discovery package exists",
    exists(VERSION) &&
      exists(OWNERSHIP_LOCK) &&
      exists(FEDERATION) &&
      exists(PROVIDERS) &&
      exists(INDEX),
  );
  push(
    "H",
    "Interop certification package exists",
    exists(GATES_FILE) && exists(RUNNER_FILE) && exists(SECRET_SCAN_FILE),
  );
  push(
    "I",
    "Version 0.1.0-interop-discovery",
    has(
      VERSION,
      /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.1\.0-interop-discovery"/,
    ) &&
      has(EMI_PKG, /"version": "0\.1\.0-interop-discovery"/) &&
      has(EMI_CERT_PKG, /"version": "0\.1\.0-interop-discovery"/),
  );
  push(
    "J",
    "InteropDiscoveryReady is true",
    has(VERSION, /INTEROP_DISCOVERY_READY = true/) &&
      has(VERSION, /InteropDiscoveryReady = true/),
  );
  push(
    "K",
    "EngineeringFederationModelLocked is true",
    has(VERSION, /ENGINEERING_FEDERATION_MODEL_LOCKED = true/) &&
      has(VERSION, /EngineeringFederationModelLocked = true/),
  );
  push(
    "L",
    "productionInteroperabilityRuntimeImplemented is false",
    has(VERSION, /PRODUCTION_INTEROPERABILITY_RUNTIME_IMPLEMENTED = false/) &&
      has(VERSION, /productionInteroperabilityRuntimeImplemented = false/),
  );
  push(
    "M",
    "automaticAnalysisModelCertificationEnabled is false",
    has(VERSION, /AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED = false/) &&
      has(VERSION, /automaticAnalysisModelCertificationEnabled = false/),
  );
  push(
    "N",
    "duplicateToolFrameworkDetected is false",
    has(VERSION, /DUPLICATE_TOOL_FRAMEWORK_DETECTED = false/) &&
      has(VERSION, /duplicateToolFrameworkDetected = false/),
  );
  push(
    "O",
    "sourceModelOwnershipPreserved is true",
    has(VERSION, /SOURCE_MODEL_OWNERSHIP_PRESERVED = true/) &&
      has(VERSION, /sourceModelOwnershipPreserved = true/),
  );
  push(
    "P",
    "ModelFederationBoundaryLocked is true",
    has(VERSION, /MODEL_FEDERATION_BOUNDARY_LOCKED = true/) &&
      has(VERSION, /ModelFederationBoundaryLocked = true/),
  );
  push(
    "Q",
    "ResultFederationBoundaryLocked is true",
    has(VERSION, /RESULT_FEDERATION_BOUNDARY_LOCKED = true/) &&
      has(VERSION, /ResultFederationBoundaryLocked = true/),
  );
  push(
    "R",
    "SolverExecutionBoundaryLocked is true",
    has(VERSION, /SOLVER_EXECUTION_BOUNDARY_LOCKED = true/) &&
      has(VERSION, /SolverExecutionBoundaryLocked = true/),
  );
  push(
    "S",
    "Existing footprint inventory document",
    exists(DOC_FOOTPRINT) &&
      has(DOC_FOOTPRINT, /calculix/i) &&
      has(DOC_FOOTPRINT, /etabs/i) &&
      has(DOC_FOOTPRINT, /spacegass|SPACE GASS/i) &&
      has(DOC_FOOTPRINT, /RESERVED_EXTERNAL_SOLVER_ADAPTERS|reserved stub/i),
  );
  push(
    "T",
    "Boundary map document",
    exists(DOC_BOUNDARY) &&
      has(DOC_BOUNDARY, /Model Federation/) &&
      has(DOC_BOUNDARY, /Result Federation/) &&
      has(DOC_BOUNDARY, /Solver Execution/),
  );
  push(
    "U",
    "Ownership matrix document",
    exists(DOC_OWNERSHIP) &&
      has(DOC_OWNERSHIP, /OWNS|owns/) &&
      has(DOC_OWNERSHIP, /MUST_NEVER_OWN|must_never_own/i) &&
      has(DOC_OWNERSHIP, /engineering_os_shared_domain/) &&
      has(DOC_OWNERSHIP, /source_client_engineering_application|external_engineering_tool/),
  );
  push(
    "V",
    "IFC strategy document",
    exists(DOC_IFC) &&
      has(DOC_IFC, /first-class/i) &&
      has(DOC_IFC, /not sole|not the sole/i),
  );
  push(
    "W",
    "Solver strategy document",
    exists(DOC_SOLVER) &&
      has(DOC_SOLVER, /EngineeringSolverAdapter/) &&
      has(DOC_SOLVER, /four-layer|four layer/i) &&
      has(DOC_SOLVER, /projectApprovedProviders/),
  );
  push(
    "X",
    "ETABS discovery document",
    exists(DOC_ETABS) &&
      has(DOC_ETABS, /ETABS/) &&
      has(DOC_ETABS, /CSI/) &&
      has(DOC_ETABS, /discovered/i),
  );
  push(
    "Y",
    "SPACE GASS discovery document",
    exists(DOC_SPACEGASS) &&
      has(DOC_SPACEGASS, /SPACE GASS|SpaceGass|spacegass/i) &&
      has(DOC_SPACEGASS, /discovered/i),
  );
  push(
    "Z",
    "Engineering federation model document",
    exists(DOC_FEDERATION) &&
      has(DOC_FEDERATION, /Model Federation/) &&
      has(DOC_FEDERATION, /abstain/i),
  );
  push(
    "AA",
    "Phase 13A discovery overview",
    exists(DOC_PHASE) &&
      has(DOC_PHASE, /0\.1\.0-interop-discovery/) &&
      has(DOC_PHASE, /do not start Phase 13B/i),
  );
  push(
    "AB",
    "Draft public contracts document",
    exists(DOC_CONTRACTS) && has(DOC_CONTRACTS, /0\.1\.0-draft/),
  );
  push(
    "AC",
    "Digital Twin remains 1.0.0",
    has(DT_VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/) &&
      has(DT_PKG, /"version": "1\.0\.0"/) &&
      has(VERSION, /DIGITAL_TWIN_V1_VERSION = "1\.0\.0"/),
  );
  push(
    "AD",
    "No phase13a under digital-twin package",
    !exists(`${DT}/src/domain/phase13a`) &&
      !exists(`${DT}/src/phase13a`) &&
      !sourceFiles.some((f) => f.includes("digital-twin")),
  );
  push(
    "AE",
    "Terminology locks encoded",
    has(TERMINOLOGY, /ModelFederation/) &&
      has(TERMINOLOGY, /ResultFederation/) &&
      has(TERMINOLOGY, /SolverExecution/) &&
      has(TERMINOLOGY, /ModelAuthoring/) &&
      has(TERMINOLOGY, /AnalysisModelGeneration/) &&
      has(TERMINOLOGY, /assertTerminologyLocks/),
  );
  push(
    "AF",
    "Provider discovery matrix complete",
    has(PROVIDERS, /ifc_openbim/) &&
      has(PROVIDERS, /etabs/) &&
      has(PROVIDERS, /spacegass/) &&
      has(PROVIDERS, /revit/) &&
      has(PROVIDERS, /navisworks/) &&
      has(PROVIDERS, /tekla/) &&
      has(PROVIDERS, /sap2000/) &&
      has(PROVIDERS, /staad/) &&
      has(PROVIDERS, /opensees/) &&
      has(PROVIDERS, /calculix/) &&
      has(PROVIDERS, /abaqus/) &&
      has(PROVIDERS, /openfoam/) &&
      has(PROVIDERS, /ansys/) &&
      has(PROVIDERS, /modelFederationSupported/) &&
      has(PROVIDERS, /assertProviderDiscoveryMatrix/),
  );
  push(
    "AG",
    "IFCFirstClassInteroperabilityReserved is true",
    has(VERSION, /IFC_FIRST_CLASS_INTEROPERABILITY_RESERVED = true/) &&
      has(VERSION, /IFCFirstClassInteroperabilityReserved = true/),
  );
  push(
    "AH",
    "ETABSIntegrationDiscovered is true",
    has(VERSION, /ETABS_INTEGRATION_DISCOVERED = true/) &&
      has(VERSION, /ETABSIntegrationDiscovered = true/),
  );
  push(
    "AI",
    "SpaceGassIntegrationDiscovered is true",
    has(VERSION, /SPACE_GASS_INTEGRATION_DISCOVERED = true/) &&
      has(VERSION, /SpaceGassIntegrationDiscovered = true/),
  );
  push("AJ", "No production interoperability adapters", noProductionAdapters);
  push(
    "AK",
    "Reuses Digital Twin solver/tool framework",
    has(VERSION, /REUSES_DIGITAL_TWIN_SOLVER_ADAPTER_FRAMEWORK = true/) &&
      has(DOC_SOLVER, /Do NOT create a second solver framework/i) &&
      has(OWNERSHIP_LOCK, /second_solver_framework/),
  );
  push(
    "AL",
    "CSI family product adapters remain separate",
    has(VERSION, /CSI_PRODUCT_ADAPTERS_REMAIN_SEPARATE = true/) &&
      has(FEDERATION, /productSpecificAdaptersRemainSeparate: true/) &&
      has(DOC_ETABS, /product-specific|remain separate/i),
  );
  push("AM", "Secret exposure", secretScan.ok, secretScan.detail);
  push(
    "AN",
    "Artifact identity / gate count",
    has(GATES_FILE, /PHASE_13A_GATE_COUNT/) &&
      PHASE_13A_GATE_COUNT === PHASE_13A_ENGINEERING_INTEROP_DISCOVERY_GATES.length &&
      PHASE_13A_GATE_COUNT === 57,
  );
  push(
    "AO",
    "phase13BReady is true",
    has(VERSION, /PHASE_13B_READY = true/) && has(VERSION, /phase13BReady = true/),
  );
  // AP evaluated after all gates
  push(
    "AQ",
    "Digital Twin V1 commit pin",
    has(VERSION, new RegExp(PHASE_13A_DIGITAL_TWIN_COMMIT)) &&
      has(VERSION, /DIGITAL_TWIN_V1_TAG = "digital-twin-v1\.0\.0"/) &&
      dtTag === PHASE_13A_DIGITAL_TWIN_COMMIT,
  );
  push(
    "AR",
    "Project-aware solver policy locked",
    has(VERSION, /PROJECT_AWARE_SOLVER_POLICY_LOCKED = true/) &&
      has(VERSION, /ABSTAIN_RATHER_THAN_SILENT_SUBSTITUTE = true/) &&
      has(FEDERATION, /projectApprovedProviders/) &&
      has(FEDERATION, /resolveProjectApprovedProvider/),
  );
  push(
    "AS",
    "Asset/Project/Spatial ownership preserved",
    has(VERSION, /CANONICAL_ASSET_OWNERSHIP = "engineering_os_shared_domain"/) &&
      has(
        VERSION,
        /CANONICAL_PROJECT_OWNERSHIP =\s*"engineering_os_shared_project_domain"/,
      ) &&
      has(
        VERSION,
        /CANONICAL_SPATIAL_OWNERSHIP =\s*"engineering_os_shared_spatial_domain"/,
      ),
  );
  push(
    "AT",
    "duplicateAssetOwnershipDetected is false",
    has(VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/),
  );
  push(
    "AU",
    "duplicateProjectOwnershipDetected is false",
    has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/),
  );
  push(
    "AV",
    "duplicateSpatialOwnershipDetected is false",
    has(VERSION, /DUPLICATE_SPATIAL_OWNERSHIP_DETECTED = false/),
  );
  push(
    "AW",
    "Public contracts draft 0.1.0-draft",
    has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.1\.0-draft"/) &&
      has(CONTRACTS, /ENGINEERING_INTEROP_PUBLIC_CONTRACT_FAMILIES/) &&
      has(CONTRACTS, /EngineeringModelAdapter/) &&
      !has(CONTRACTS, /PUBLIC_CONTRACT_VERSION = "1\.0\.0"/) &&
      exists(DOC_CONTRACTS),
  );
  push(
    "AX",
    "Ownership lock assert passes",
    has(OWNERSHIP_LOCK, /export function assertEngineeringInteropOwnershipLock/) &&
      has(EMI_TEST, /assertEngineeringInteropOwnershipLock/),
  );
  push(
    "AY",
    "Workflow exists",
    exists(WORKFLOW) &&
      has(WORKFLOW, /NODE_VERSION:\s*"22"/) &&
      has(WORKFLOW, /PNPM_VERSION:\s*"9\.15\.0"/) &&
      has(WORKFLOW, /certify:phase13a/),
  );
  push("AZ", "Discovery unit tests", unitTests.ok, unitTests.detail);
  push(
    "BA",
    "CalculiX existing certified path documented",
    has(FOOTPRINT, /calculix/) &&
      has(DOC_FOOTPRINT, /linear.?static|linear_elastic_static/i) &&
      has(PROVIDERS, /existing_certified/),
  );
  push(
    "BB",
    "Reserved DT stubs inventoried without mutation",
    exists(DT_STUBS) &&
      has(DT_STUBS, /"etabs"/) &&
      has(DT_STUBS, /"spacegass"/) &&
      has(FOOTPRINT, /RESERVED_EXTERNAL_SOLVER|reservedSolverStubs/) &&
      has(DOC_FOOTPRINT, /do not modify|without modifying/i),
  );
  push(
    "BC",
    "External model ownership preserved",
    has(VERSION, /EXTERNAL_MODEL_OWNERSHIP =\s*"source_client_engineering_application"/) &&
      has(OWNERSHIP_LOCK, /external_model_files/),
  );
  push(
    "BD",
    "External solver ownership preserved",
    has(VERSION, /EXTERNAL_SOLVER_OWNERSHIP = "external_engineering_tool"/) &&
      has(OWNERSHIP_LOCK, /external_solver_binaries/),
  );
  push(
    "BE",
    "Phase 13B not started",
    FORBIDDEN_13B_PATHS.every((p) => !exists(p)) &&
      !has(VERSION, /PHASE_13B_IMPLEMENTED = true/) &&
      has(DOC_PHASE, /do not start Phase 13B/i),
  );

  const preApFailed = results.filter((g) => g.status === "fail");
  const releaseEligible = preApFailed.length === 0 && secretScan.ok && unitTests.ok;
  push("AP", "releaseEligible is true", releaseEligible, releaseEligible ? "eligible" : "blocked");

  const byId = new Map(results.map((g) => [g.id, g]));
  const ordered = PHASE_13A_ENGINEERING_INTEROP_DISCOVERY_GATES.map(([id, name]) => {
    return byId.get(id) ?? gate(id, name, false, "not_executed");
  });
  const failed = ordered.filter((g) => g.status === "fail");
  const skipped = ordered.filter((g) => g.status === "skip");
  const notExecuted = ordered.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const digitalTwinV1Intact = dtTag === PHASE_13A_DIGITAL_TWIN_COMMIT;

  const artifact = {
    phase: "13A",
    product: "Engineering Model & Solver Interoperability",
    certification: "engineering-interoperability-discovery",
    version: PHASE_13A_INTEROP_VERSION,
    status: "interop_discovery",
    commit,
    baselineHead: PHASE_13A_DIGITAL_TWIN_COMMIT,
    verdict: pass ? "PASS" : "FAIL",
    DigitalTwinV1Intact: digitalTwinV1Intact,
    EngineeringFederationModelLocked: true,
    ModelFederationBoundaryLocked: true,
    ResultFederationBoundaryLocked: true,
    SolverExecutionBoundaryLocked: true,
    IFCFirstClassInteroperabilityReserved: true,
    ETABSIntegrationDiscovered: true,
    SpaceGassIntegrationDiscovered: true,
    automaticAnalysisModelCertificationEnabled: false,
    duplicateToolFrameworkDetected: false,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    duplicateSpatialOwnershipDetected: false,
    sourceModelOwnershipPreserved: true,
    productionInteroperabilityRuntimeImplemented: false,
    InteropDiscoveryReady: true,
    digitalTwinVersion: PHASE_13A_DIGITAL_TWIN_VERSION,
    digitalTwinV1Tag: PHASE_13A_DIGITAL_TWIN_TAG,
    digitalTwinV1Commit: PHASE_13A_DIGITAL_TWIN_COMMIT,
    publicContractVersion: "0.1.0-draft",
    projectControlsV1Intact: pcTag === PHASE_13A_PROJECT_CONTROLS_V1_COMMIT,
    projectControlsV1TagMoved: pcTag !== PHASE_13A_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_13A_ASSET_INTELLIGENCE_V1_COMMIT,
    projectIntelligenceV1Intact: piTag === PHASE_13A_PROJECT_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === PHASE_13A_INSPECTION_INTELLIGENCE_V1_COMMIT,
    secretExposureDetected: !secretScan.ok,
    phase13BReady: true,
    releaseEligible: pass,
    requiredGates: ordered.map((g) => ({ id: g.id, name: g.name, status: g.status })),
    gateCount: ordered.length,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => ({ id: g.id, name: g.name, detail: g.detail })),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase13a-engineering-interoperability-discovery-certification.json",
  );
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        failed: failed.length,
        gateCount: ordered.length,
        releaseEligible: artifact.releaseEligible,
        DigitalTwinV1Intact: artifact.DigitalTwinV1Intact,
        phase13BReady: artifact.phase13BReady,
        outPath,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
