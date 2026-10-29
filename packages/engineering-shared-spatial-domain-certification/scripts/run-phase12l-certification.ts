/**
 * Phase 12L certification runner (gates A–BE) — Shared Spatial Domain Discovery.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_12L_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12L_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12L_DIGITAL_TWIN_CERTIFIED_COMMIT,
  PHASE_12L_DIGITAL_TWIN_HOSTED_RUN,
  PHASE_12L_DIGITAL_TWIN_VERSION,
  PHASE_12L_GATE_COUNT,
  PHASE_12L_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_12L_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_12L_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12L_PROJECT_CONTROLS_V1_TAG,
  PHASE_12L_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_12L_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_12L_PROTECTED_BATCH_MIGRATIONS,
  PHASE_12L_SHARED_SPATIAL_DOMAIN_DISCOVERY_GATES,
  PHASE_12L_SHARED_SPATIAL_VERSION,
  type Phase12lGateId,
} from "../src/phase12l/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const SSD = "packages/engineering-shared-spatial-domain";
const SSD_CERT = "packages/engineering-shared-spatial-domain-certification";
const DT = "packages/digital-twin";
const VERSION = `${SSD}/src/version.ts`;
const OWNERSHIP_LOCK = `${SSD}/src/architecture/ownership-lock.ts`;
const DOMAIN_REFS = `${SSD}/src/domain/spatial-references.ts`;
const CONTRACTS = `${SSD}/src/contracts/public-contracts-draft.ts`;
const INDEX = `${SSD}/src/index.ts`;
const SSD_PKG = `${SSD}/package.json`;
const SSD_TEST = `${SSD}/tests/ownership-lock.test.ts`;
const SSD_CERT_PKG = `${SSD_CERT}/package.json`;
const GATES_FILE = `${SSD_CERT}/src/phase12l/gates.ts`;
const RUNNER_FILE = `${SSD_CERT}/scripts/run-phase12l-certification.ts`;
const SECRET_SCAN_FILE = `${SSD_CERT}/scripts/secret-exposure-scan.ts`;
const WORKFLOW = ".github/workflows/phase-12l-shared-spatial-domain-discovery.yml";
const DT_VERSION = `${DT}/src/version.ts`;
const DT_OWNERSHIP = `${DT}/src/architecture/ownership-lock.ts`;
const DT_SPATIAL = `${DT}/src/domain/spatial-reference.ts`;
const DT_PKG = `${DT}/package.json`;

const DOC_FOOTPRINT =
  "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_EXISTING_FOOTPRINT.md";
const DOC_OWNERSHIP =
  "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY =
  "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_BOUNDARY_MAP.md";
const DOC_PHASE = "docs/architecture/ENGINEERING_SHARED_SPATIAL_DOMAIN_PHASE_12L.md";
const DOC_CONTRACTS =
  "docs/contracts/ENGINEERING_SHARED_SPATIAL_DOMAIN_PUBLIC_CONTRACTS_DRAFT.md";
const ADR_OWNERSHIP = "docs/architecture/adr/ADR_SHARED_SPATIAL_OWNERSHIP.md";
const ADR_GEOMETRY = "docs/architecture/adr/ADR_SHARED_SPATIAL_GEOMETRY_OWNERSHIP.md";
const ADR_CRS = "docs/architecture/adr/ADR_SHARED_SPATIAL_CRS_GOVERNANCE.md";
const ADR_LOCAL = "docs/architecture/adr/ADR_SHARED_SPATIAL_LOCAL_VS_GLOBAL_COORDINATES.md";
const ADR_BIM = "docs/architecture/adr/ADR_SHARED_SPATIAL_BIM_GIS_MODEL_BOUNDARY.md";
const ADR_LINEAR = "docs/architecture/adr/ADR_SHARED_SPATIAL_LINEAR_REFERENCING_BOUNDARY.md";
const ADR_TWIN = "docs/architecture/adr/ADR_TWIN_SPATIAL_REFERENCE_REBINDING.md";

const FORBIDDEN_SSD_DIRECTORIES = [
  `${SSD}/src/services`,
  `${SSD}/src/runtime`,
  `${SSD}/src/gis`,
  `${SSD}/src/postgis`,
  `${SSD}/src/analytics`,
  `${SSD}/src/transforms`,
  `${SSD}/src/api`,
  `${SSD}/migrations`,
] as const;

const FORBIDDEN_12M_PATHS = [
  `${SSD}/src/domain/phase12m`,
  `${DT}/src/domain/phase12m`,
  "packages/engineering-shared-spatial-domain-runtime",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12lGateId; name: string; status: GateStatus; detail?: string };

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
  return collectFiles(resolve(root, SSD))
    .filter((file) => /\.(ts|tsx|json|md|sql)$/.test(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}
function discoverySourceFiles(): string[] {
  return collectFiles(resolve(root, `${SSD}/src`))
    .map((file) => relative(resolve(root, SSD), file).split("\\").join("/"))
    .sort();
}

function gate(
  id: Phase12lGateId,
  name: string,
  ok: boolean,
  detail?: string,
): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "failed") };
}

function main() {
  const commit = sha();
  const pcTag = tag(PHASE_12L_PROJECT_CONTROLS_V1_TAG);
  const aiTag = tag(PHASE_12L_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_12L_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_12L_INSPECTION_INTELLIGENCE_V1_TAG);
  const secretScan = run(`pnpm --filter @rtb/engineering-shared-spatial-domain-certification secret-scan`);
  const unitTests = run(`pnpm --filter @rtb/engineering-shared-spatial-domain test`);
  const pkgText = discoveryPackageText();
  const sourceFiles = discoverySourceFiles();

  const protectedBatchesExist = PHASE_12L_PROTECTED_BATCH_MIGRATIONS.every((rel) => exists(rel));
  const noBatch85 = !exists("supabase/migrations")
    ? true
    : !readdirSync(resolve(root, "supabase/migrations")).some((f) => /batch_85/i.test(f));
  const noEngineeringLocationsCreate =
    !has(DOC_FOOTPRINT, /CREATE TABLE[\s\S]*engineering_locations/i) &&
    !pkgText.includes("CREATE TABLE") &&
    !readdirSync(resolve(root, "supabase/migrations")).some((f) =>
      /engineering_locations/i.test(f),
    );
  const noPostgis =
    !pkgText.match(/CREATE EXTENSION\s+postgis/i) &&
    !pkgText.match(/postgisImplemented\s*=\s*true/i) &&
    !has(VERSION, /POSTGIS_IMPLEMENTED = true/) &&
    has(VERSION, /POSTGIS_IMPLEMENTED = false/) &&
    !has(DT_VERSION, /POSTGIS_IMPLEMENTED\s*=\s*true/);

  const results: GateResult[] = [];
  const push = (id: Phase12lGateId, name: string, ok: boolean, detail?: string) => {
    results.push(gate(id, name, ok, detail));
  };

  push("A", "Repository/build identity", Boolean(commit) && exists(SSD_PKG) && exists(SSD_CERT_PKG));
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_12L_PROJECT_CONTROLS_V1_COMMIT,
    pcTag ?? "missing",
  );
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_12L_ASSET_INTELLIGENCE_V1_COMMIT,
    aiTag ?? "missing",
  );
  push(
    "D",
    "Project Intelligence V1 intact",
    piTag === PHASE_12L_PROJECT_INTELLIGENCE_V1_COMMIT,
    piTag ?? "missing",
  );
  push(
    "E",
    "Inspection Intelligence V1 intact",
    iiTag === PHASE_12L_INSPECTION_INTELLIGENCE_V1_COMMIT,
    iiTag ?? "missing",
  );
  push(
    "F",
    "Shared spatial discovery package exists",
    exists(VERSION) && exists(OWNERSHIP_LOCK) && exists(DOMAIN_REFS) && exists(INDEX),
  );
  push(
    "G",
    "Shared spatial certification package exists",
    exists(GATES_FILE) && exists(RUNNER_FILE) && exists(SECRET_SCAN_FILE),
  );
  push(
    "H",
    "Version 0.1.0-spatial-discovery",
    has(
      VERSION,
      /ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION\s*=\s*"0\.1\.0-spatial-discovery"/,
    ) &&
      has(SSD_PKG, /"version": "0\.1\.0-spatial-discovery"/) &&
      has(SSD_CERT_PKG, /"version": "0\.1\.0-spatial-discovery"/),
  );
  push(
    "I",
    "SharedSpatialDomainDiscoveryReady is true",
    has(VERSION, /SHARED_SPATIAL_DOMAIN_DISCOVERY_READY = true/) &&
      has(VERSION, /SharedSpatialDomainDiscoveryReady = true/),
  );
  push(
    "J",
    "SharedSpatialDomainOwnershipLocked is true",
    has(VERSION, /SHARED_SPATIAL_DOMAIN_OWNERSHIP_LOCKED = true/) &&
      has(VERSION, /SharedSpatialDomainOwnershipLocked = true/),
  );
  push(
    "K",
    "SharedSpatialDomainRuntimeImplemented is false",
    has(VERSION, /SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED = false/) &&
      has(VERSION, /SharedSpatialDomainRuntimeImplemented = false/),
  );
  push(
    "L",
    "spatialOwnershipFullyResolved is false",
    has(VERSION, /SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/) &&
      has(VERSION, /spatialOwnershipFullyResolved = false/),
  );
  push(
    "M",
    "coordinateTransformationImplemented is false",
    has(VERSION, /COORDINATE_TRANSFORMATION_IMPLEMENTED = false/) &&
      has(VERSION, /coordinateTransformationImplemented = false/),
  );
  push(
    "N",
    "gisRuntimeImplemented is false",
    has(VERSION, /GIS_RUNTIME_IMPLEMENTED = false/) &&
      has(VERSION, /gisRuntimeImplemented = false/),
  );
  push(
    "O",
    "spatialAnalyticsImplemented is false",
    has(VERSION, /SPATIAL_ANALYTICS_IMPLEMENTED = false/) &&
      has(VERSION, /spatialAnalyticsImplemented = false/),
  );
  push(
    "P",
    "duplicateSpatialOwnershipDetected is false",
    has(VERSION, /DUPLICATE_SPATIAL_OWNERSHIP_DETECTED = false/),
  );
  push(
    "Q",
    "duplicateGeometryOwnershipDetected is false",
    has(VERSION, /DUPLICATE_GEOMETRY_OWNERSHIP_DETECTED = false/),
  );
  push(
    "R",
    "Existing footprint inventory complete",
    exists(DOC_FOOTPRINT) &&
      has(DOC_FOOTPRINT, /engineering_locations/) &&
      has(DOC_FOOTPRINT, /TwinSpatialReference/) &&
      has(DOC_FOOTPRINT, /TEXT/) &&
      has(DOC_FOOTPRINT, /no dedicated shared spatial package/i),
  );
  push(
    "S",
    "Ownership matrix document",
    exists(DOC_OWNERSHIP) &&
      has(DOC_OWNERSHIP, /OWNS/) &&
      has(DOC_OWNERSHIP, /CONSUMES/) &&
      has(DOC_OWNERSHIP, /MUST_NEVER_OWN/) &&
      has(DOC_OWNERSHIP, /engineering_os_shared_spatial_domain/),
  );
  push(
    "T",
    "Boundary map document",
    exists(DOC_BOUNDARY) &&
      has(DOC_BOUNDARY, /Digital Twin/) &&
      has(DOC_BOUNDARY, /Shared Spatial Domain/),
  );
  push("U", "Spatial ownership ADR", exists(ADR_OWNERSHIP) && has(ADR_OWNERSHIP, /Decision/));
  push("V", "Geometry ownership ADR", exists(ADR_GEOMETRY) && has(ADR_GEOMETRY, /Decision/));
  push("W", "CRS governance ADR", exists(ADR_CRS) && has(ADR_CRS, /Decision/));
  push("X", "Local vs global coordinates ADR", exists(ADR_LOCAL) && has(ADR_LOCAL, /Decision/));
  push("Y", "BIM/GIS/model boundary ADR", exists(ADR_BIM) && has(ADR_BIM, /Decision/));
  push("Z", "Linear referencing boundary ADR", exists(ADR_LINEAR) && has(ADR_LINEAR, /Decision/));
  push(
    "AA",
    "TwinSpatialReference migration ADR",
    exists(ADR_TWIN) &&
      has(ADR_TWIN, /TwinSpatialReference/) &&
      has(ADR_TWIN, /rebinding|migration/i),
  );
  push(
    "AB",
    "Phase 12L discovery overview",
    exists(DOC_PHASE) &&
      has(DOC_PHASE, /0\.1\.0-spatial-discovery/) &&
      has(DOC_PHASE, /spatialOwnershipFullyResolved/),
  );
  push(
    "AC",
    "Draft public contracts document",
    exists(DOC_CONTRACTS) && has(DOC_CONTRACTS, /0\.1\.0-draft/),
  );
  push(
    "AD",
    "Digital Twin remains 0.11.0-digital-thread",
    has(DT_VERSION, /DIGITAL_TWIN_VERSION = "0\.11\.0-digital-thread"/) &&
      has(DT_PKG, /"version": "0\.11\.0-digital-thread"/) &&
      !has(DT_VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/),
  );
  push(
    "AE",
    "Digital Twin is not canonical spatial owner",
    has(VERSION, /DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL = false/) &&
      has(OWNERSHIP_LOCK, /digital_twin_must_not_own_canonical_spatial/) &&
      has(DT_OWNERSHIP, /digital_twin_may_not_own_canonical_spatial_location/),
  );
  push(
    "AF",
    "TwinSpatialReference remains thin wrapper",
    has(DT_SPATIAL, /ownsCanonicalLocation: false/) &&
      has(DT_SPATIAL, /inventsLocationRegistry: false/) &&
      has(DT_SPATIAL, /createTwinSpatialReference/),
  );
  push(
    "AG",
    "No engineering_locations table introduced",
    noEngineeringLocationsCreate &&
      has(VERSION, /ENGINEERING_LOCATIONS_TABLE_EXISTS = false/),
  );
  push("AH", "No PostGIS / GIS runtime", noPostgis && has(VERSION, /POSTGIS_IMPLEMENTED = false/));
  push(
    "AI",
    "No shared spatial product migrations",
    noBatch85 && has(VERSION, /SHARED_SPATIAL_PRODUCT_TABLES_INTRODUCED = false/),
  );
  push(
    "AJ",
    "batch_75–84 digital twin migrations untouched",
    protectedBatchesExist,
    protectedBatchesExist ? "present" : "missing protected batch",
  );
  push(
    "AK",
    "No spatial runtime services in discovery package",
    FORBIDDEN_SSD_DIRECTORIES.every((d) => !exists(d)) &&
      !sourceFiles.some((f) => /\/(runtime|gis|postgis|analytics)\//.test(f)),
  );
  push(
    "AL",
    "No shared spatial product UI",
    has(VERSION, /SHARED_SPATIAL_PRODUCT_UI_IMPLEMENTED = false/) &&
      !exists("apps/web/src/app/(platform)/engineering/apps/shared-spatial"),
  );
  push("AM", "Secret exposure", secretScan.ok, secretScan.detail);
  push(
    "AN",
    "Artifact identity",
    has(GATES_FILE, /PHASE_12L_GATE_COUNT/) &&
      PHASE_12L_GATE_COUNT === PHASE_12L_SHARED_SPATIAL_DOMAIN_DISCOVERY_GATES.length &&
      PHASE_12L_GATE_COUNT === 57,
  );
  push("AO", "phase12MReady is true", has(VERSION, /PHASE_12M_READY = true/) && has(VERSION, /phase12MReady = true/));
  // AP evaluated after all gates
  push(
    "AQ",
    "Digital Twin 12K baseline pin / hosted run",
    has(VERSION, new RegExp(PHASE_12L_DIGITAL_TWIN_CERTIFIED_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_12L_DIGITAL_TWIN_HOSTED_RUN)) &&
      has(VERSION, new RegExp(PHASE_12L_DIGITAL_TWIN_VERSION)) &&
      has(DT_VERSION, /PHASE_12K_READY = true/),
  );
  push(
    "AR",
    "productionDigitalTwinReady remains false",
    has(DT_VERSION, /PRODUCTION_DIGITAL_TWIN_READY = false/) &&
      has(DT_VERSION, /productionDigitalTwinReady = false/),
  );
  push(
    "AS",
    "DT spatialOwnershipFullyResolved remains false",
    has(DT_VERSION, /SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/) &&
      has(DT_VERSION, /spatialOwnershipFullyResolved = false/),
  );
  push(
    "AT",
    "SPATIAL_CANONICAL_OWNERSHIP reconciled",
    has(DT_VERSION, /SPATIAL_CANONICAL_OWNERSHIP =\s*"engineering_os_shared_spatial_domain"/) &&
      has(VERSION, /CANONICAL_SPATIAL_REFERENCE_OWNERSHIP =\s*"engineering_os_shared_spatial_domain"/),
  );
  push(
    "AU",
    "Residual TEXT location fields documented",
    has(DOC_FOOTPRINT, /engineering_assets\.location/) &&
      has(DOC_FOOTPRINT, /engineering_projects\.location/) &&
      has(VERSION, /RESIDUAL_TEXT_LOCATION_FIELDS/) &&
      has(DOC_OWNERSHIP, /spatialOwnershipFullyResolved/),
  );
  push(
    "AV",
    "Inspection Intelligence consumes not owns",
    has(DOC_OWNERSHIP, /inspection_intelligence/) &&
      has(OWNERSHIP_LOCK, /inspection_spatial_vocabulary/) &&
      has(OWNERSHIP_LOCK, /consumes/),
  );
  push(
    "AW",
    "Asset/Project remain identity owners",
    has(VERSION, /CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      has(
        VERSION,
        /CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\s*"engineering_os_shared_project_domain"/,
      ),
  );
  push(
    "AX",
    "Time series stays Asset Intelligence",
    has(VERSION, /ENGINEERING_TIME_SERIES_OWNERSHIP = "asset_intelligence"/) &&
      has(OWNERSHIP_LOCK, /time_series_must_remain_asset_intelligence/),
  );
  push(
    "AY",
    "Knowledge Graph not spatial owner",
    has(VERSION, /KNOWLEDGE_GRAPH_OWNERSHIP = "platform_kernel_knowledge_graph"/) &&
      has(DOC_OWNERSHIP, /MUST_NEVER_OWN/),
  );
  push(
    "AZ",
    "Geometry blobs remain external",
    has(VERSION, /GEOMETRY_BLOB_OWNERSHIP =\s*"external_or_existing_engineering_model_owner"/) &&
      has(OWNERSHIP_LOCK, /geometry_blobs/),
  );
  push(
    "BA",
    "Public contracts draft 0.1.0-draft",
    has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.1\.0-draft"/) &&
      has(CONTRACTS, /SHARED_SPATIAL_PUBLIC_CONTRACT_FAMILIES/) &&
      exists(DOC_CONTRACTS),
  );
  push(
    "BB",
    "Ownership lock assert passes",
    has(OWNERSHIP_LOCK, /export function assertSharedSpatialDomainOwnershipLock/) &&
      has(SSD_TEST, /assertSharedSpatialDomainOwnershipLock/),
  );
  push(
    "BC",
    "Workflow exists",
    exists(WORKFLOW) &&
      has(WORKFLOW, /NODE_VERSION:\s*"22"/) &&
      has(WORKFLOW, /PNPM_VERSION:\s*"9\.15\.0"/) &&
      has(WORKFLOW, /certify:phase12l/),
  );
  push("BD", "Discovery unit tests", unitTests.ok, unitTests.detail);
  push(
    "BE",
    "Phase 12M not started",
    FORBIDDEN_12M_PATHS.every((p) => !exists(p)) &&
      !has(VERSION, /PHASE_12M_IMPLEMENTED = true/) &&
      has(DOC_PHASE, /do not start Phase 12M/i),
  );

  // Evaluate AP after computing other failures (exclude AP itself)
  const preApFailed = results.filter((g) => g.status === "fail");
  const releaseEligible = preApFailed.length === 0 && secretScan.ok && unitTests.ok;
  push("AP", "releaseEligible is true", releaseEligible, releaseEligible ? "eligible" : "blocked");

  const byId = new Map(results.map((g) => [g.id, g]));
  const ordered = PHASE_12L_SHARED_SPATIAL_DOMAIN_DISCOVERY_GATES.map(([id, name]) => {
    return byId.get(id) ?? gate(id, name, false, "not_executed");
  });
  const failed = ordered.filter((g) => g.status === "fail");
  const skipped = ordered.filter((g) => g.status === "skip");
  const notExecuted = ordered.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    phase: "12L",
    product: "Engineering Shared Spatial Domain",
    certification: "shared-spatial-domain-discovery",
    version: PHASE_12L_SHARED_SPATIAL_VERSION,
    status: "discovery",
    commit,
    baselineHead: PHASE_12L_DIGITAL_TWIN_CERTIFIED_COMMIT,
    verdict: pass ? "PASS" : "FAIL",
    SharedSpatialDomainDiscoveryReady: true,
    SharedSpatialDomainOwnershipLocked: true,
    SharedSpatialDomainRuntimeImplemented: false,
    spatialOwnershipFullyResolved: false,
    coordinateTransformationImplemented: false,
    gisRuntimeImplemented: false,
    spatialAnalyticsImplemented: false,
    duplicateSpatialOwnershipDetected: false,
    duplicateGeometryOwnershipDetected: false,
    engineeringLocationsTableExists: false,
    sharedSpatialProductTablesIntroduced: false,
    sharedSpatialProductUiImplemented: false,
    digitalTwinMayOwnCanonicalSpatial: false,
    productionDigitalTwinReady: false,
    digitalTwinVersion: PHASE_12L_DIGITAL_TWIN_VERSION,
    digitalTwin12KCertifiedCommit: PHASE_12L_DIGITAL_TWIN_CERTIFIED_COMMIT,
    digitalTwin12KHostedRun: PHASE_12L_DIGITAL_TWIN_HOSTED_RUN,
    publicContractVersion: "0.1.0-draft",
    projectControlsV1Intact: pcTag === PHASE_12L_PROJECT_CONTROLS_V1_COMMIT,
    projectControlsV1TagMoved: pcTag !== PHASE_12L_PROJECT_CONTROLS_V1_COMMIT,
    projectControlsV1TagTarget: PHASE_12L_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_12L_ASSET_INTELLIGENCE_V1_COMMIT,
    projectIntelligenceV1Intact: piTag === PHASE_12L_PROJECT_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === PHASE_12L_INSPECTION_INTELLIGENCE_V1_COMMIT,
    secretExposureDetected: !secretScan.ok,
    phase12MReady: true,
    releaseEligible: pass,
    requiredGates: ordered.map((g) => ({ id: g.id, name: g.name, status: g.status })),
    gateCount: ordered.length,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => ({ id: g.id, name: g.name, detail: g.detail })),
    protectedBatches: [...PHASE_12L_PROTECTED_BATCH_MIGRATIONS],
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase12l-shared-spatial-domain-discovery-certification.json",
  );
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        failed: failed.length,
        gateCount: ordered.length,
        releaseEligible: artifact.releaseEligible,
        spatialOwnershipFullyResolved: artifact.spatialOwnershipFullyResolved,
        outPath,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main();
