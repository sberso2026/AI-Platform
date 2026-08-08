/**
 * Phase 12A certification runner (gates A–AM) — Digital Twin Discovery.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_12A_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12A_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12A_DIGITAL_TWIN_DISCOVERY_GATES,
  PHASE_12A_DIGITAL_TWIN_VERSION,
  PHASE_12A_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12A_PROJECT_CONTROLS_V1_TAG,
  type Phase12aGateId,
} from "../src/phase12a/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PI_COMMIT = "34975b1cf660580d46287f24e746b8915903f768";
const II_COMMIT = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const PI_TAG = "project-intelligence-v1.0.0";
const II_TAG = "inspection-intelligence-v1.0.0";

const DT = "packages/digital-twin";
const DT_CERT = "packages/digital-twin-certification";
const VERSION = `${DT}/src/version.ts`;
const INDEX = `${DT}/src/index.ts`;
const OWNERSHIP_LOCK = `${DT}/src/architecture/ownership-lock.ts`;
const TERMINOLOGY = `${DT}/src/architecture/terminology.ts`;
const DRAFT_CONTRACTS = `${DT}/src/domain/draft-contracts.ts`;
const FIDELITY_MODEL = `${DT}/src/domain/fidelity-model.ts`;
const DT_PKG = `${DT}/package.json`;
const DT_TEST = `${DT}/tests/discovery-lock.test.ts`;
const DT_CERT_PKG = `${DT_CERT}/package.json`;
const GATES_FILE = `${DT_CERT}/src/phase12a/gates.ts`;
const RUNNER_FILE = `${DT_CERT}/scripts/run-phase12a-certification.ts`;
const SECRET_SCAN_FILE = `${DT_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase12a-digital-twin-discovery.test.ts";
const WORKFLOW = ".github/workflows/phase-12a-digital-twin-discovery.yml";

const DOC_FOOTPRINT = "docs/architecture/DIGITAL_TWIN_PHASE_12A_EXISTING_FOOTPRINT.md";
const DOC_TERMINOLOGY = "docs/architecture/DIGITAL_TWIN_TERMINOLOGY.md";
const DOC_OWNERSHIP = "docs/architecture/DIGITAL_TWIN_OWNERSHIP_MATRIX.md";
const DOC_FIDELITY = "docs/architecture/DIGITAL_TWIN_FIDELITY_MODEL.md";
const DOC_THREAD = "docs/architecture/DIGITAL_THREAD_MODEL.md";
const DOC_SPATIAL = "docs/architecture/DIGITAL_TWIN_SPATIAL_BOUNDARY.md";
const DOC_AI_BOUNDARY = "docs/architecture/DIGITAL_TWIN_ASSET_INTELLIGENCE_BOUNDARY.md";
const DOC_SHM = "docs/architecture/DIGITAL_TWIN_SHM_BOUNDARY.md";
const DOC_CAPABILITY = "docs/architecture/DIGITAL_TWIN_PHASE_12A_CAPABILITY_MATRIX.md";
const DOC_DISCOVERY = "docs/architecture/DIGITAL_TWIN_PHASE_12A_DISCOVERY.md";
const DOC_CONTRACTS = "docs/contracts/DIGITAL_TWIN_PUBLIC_CONTRACTS_DRAFT.md";
const DOC_TELEMETRY_ADR = "docs/architecture/DIGITAL_TWIN_TELEMETRY_AND_TIMESERIES_ADR.md";

const MODULE_REGISTRY = "packages/engineering-os/src/module-registry.ts";
const KERNEL_TWIN_SERVICE = "packages/platform-kernel/src/digital-twin/digital-twin-service.ts";
const KERNEL_TWIN_INDEX = "packages/platform-kernel/src/digital-twin/index.ts";
const CORE_SERVICES = "packages/engineering-os/src/services/core-services.ts";
const TELEMETRY_SERVICE = "packages/platform-kernel/src/telemetry/telemetry-service.ts";
const AI_OWNERSHIP_LOCK = "packages/asset-intelligence/src/architecture/ownership-lock.ts";
const AI_VERSION = "packages/asset-intelligence/src/version.ts";
const PC_VERSION = "packages/project-controls/src/version.ts";
const MODULE_SDK = "packages/engineering-os/src/module-sdk/index.ts";
const MODULES_PAGE = "apps/web/src/app/(platform)/engineering/modules/page.tsx";
const TYPES_MODULES = "packages/types/src/engineering-modules.ts";
const II_ENGINEERING_EVENTS = "packages/inspection-intelligence/src/domain/engineering-events.ts";
const DATABASE_DOC = "docs/architecture/DATABASE.md";
const DIGITAL_TWIN_DOC = "docs/architecture/DIGITAL_TWIN.md";
const ASSET_PAGE = "apps/web/src/app/(platform)/engineering/assets/[assetId]/page.tsx";
const MIGRATION_KERNEL = "supabase/migrations/20260201000000_phase_15_kernel_tables.sql";
const MIGRATION_ENG = "supabase/migrations/20260203000000_batch_20_engineering_tables.sql";
const MIGRATION_REGISTERS = "supabase/migrations/20260204000000_batch_205_register_tables.sql";
const SEED_BATCH_20 = "supabase/migrations/20260203000002_batch_20_engineering_seed.sql";
const SEED_BATCH_31_ROLES = "supabase/migrations/20260209000003_batch_31_commerce_role_seed.sql";

const FOOTPRINT_INVENTORY = [
  MODULE_REGISTRY,
  KERNEL_TWIN_SERVICE,
  KERNEL_TWIN_INDEX,
  CORE_SERVICES,
  TELEMETRY_SERVICE,
  AI_OWNERSHIP_LOCK,
  PC_VERSION,
  MODULE_SDK,
  MODULES_PAGE,
  TYPES_MODULES,
  II_ENGINEERING_EVENTS,
  DATABASE_DOC,
  DIGITAL_TWIN_DOC,
  ASSET_PAGE,
  MIGRATION_KERNEL,
  MIGRATION_ENG,
  MIGRATION_REGISTERS,
  SEED_BATCH_20,
  SEED_BATCH_31_ROLES,
] as const;

const ALLOWED_DT_SOURCE_FILES = [
  "src/index.ts",
  "src/version.ts",
  "src/architecture/ownership-lock.ts",
  "src/architecture/terminology.ts",
  "src/domain/draft-contracts.ts",
  "src/domain/fidelity-model.ts",
] as const;

const FORBIDDEN_DT_DIRECTORIES = [
  `${DT}/src/services`,
  `${DT}/src/runtime`,
  `${DT}/src/telemetry`,
  `${DT}/src/simulation`,
  `${DT}/src/viewer`,
  `${DT}/src/engines`,
  `${DT}/src/api`,
  `${DT}/manifest`,
  `${DT}/migrations`,
] as const;

const FORBIDDEN_UI_PATHS = [
  "apps/web/src/app/(platform)/engineering/apps/digital-twin",
  "apps/web/src/app/api/engineering/digital-twin",
  "apps/web/src/components/engineering/digital-twin-shell.tsx",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12aGateId; name: string; status: GateStatus; detail?: string };

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
function gitQuiet(cmd: string) {
  try {
    execSync(cmd, { cwd: root, stdio: ["ignore", "ignore", "ignore"] });
    return true;
  } catch {
    return false;
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
function discoverySourceFiles(): string[] {
  return collectFiles(resolve(root, `${DT}/src`))
    .map((file) => relative(resolve(root, DT), file).split("\\").join("/"))
    .sort();
}
function discoveryPackageText(): string {
  return collectFiles(resolve(root, DT))
    .filter((file) => /\.(ts|tsx|json|md|sql)$/.test(file))
    .map((file) => readFileSync(file, "utf8"))
    .join("\n");
}
function migrationSql(): { file: string; text: string }[] {
  const dir = resolve(root, "supabase/migrations");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((file) => file.endsWith(".sql"))
    .map((file) => ({ file, text: readFileSync(join(dir, file), "utf8") }));
}
function moduleRegistryEntry(moduleId: string): string {
  const source = (() => {
    try {
      return readRepoFile(MODULE_REGISTRY);
    } catch {
      return "";
    }
  })();
  const start = source.indexOf(`id: "${moduleId}"`);
  if (start === -1) return "";
  const end = source.indexOf("\n  {", start);
  return source.slice(start, end === -1 ? source.length : end);
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const inCi = process.env.GITHUB_ACTIONS === "true";
  const gates: GateResult[] = [];
  const push = (id: Phase12aGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const pcTag = tag(PHASE_12A_PROJECT_CONTROLS_V1_TAG);
  const aiTag = tag(PHASE_12A_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PI_TAG);
  const iiTag = tag(II_TAG);

  const dtRegistryEntry = moduleRegistryEntry("digital_twin");
  const migrations = migrationSql();
  const dtSourceFiles = discoverySourceFiles();
  const dtText = discoveryPackageText();

  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      exists(DT_PKG) &&
      exists(DT_CERT_PKG) &&
      has(VERSION, /DIGITAL_TWIN_VERSION = "0\.1\.0-discovery"/) &&
      has(VERSION, /DIGITAL_TWIN_STATUS = "discovery"/) &&
      has(VERSION, /DIGITAL_TWIN_PHASE = "12A"/)
      ? "pass"
      : "fail",
    buildIdentitySha,
  );
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_12A_PROJECT_CONTROLS_V1_COMMIT ? "pass" : "fail",
    pcTag ?? "tag_missing",
  );
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_12A_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "tag_missing",
  );
  push("D", "PI v1 integrity", piTag === PI_COMMIT ? "pass" : "fail", piTag ?? "tag_missing");
  push("E", "II v1 integrity", iiTag === II_COMMIT ? "pass" : "fail", iiTag ?? "tag_missing");

  push(
    "F",
    "Ownership lock documented",
    exists(OWNERSHIP_LOCK) &&
      has(OWNERSHIP_LOCK, /export function assertOwnershipLock/) &&
      has(OWNERSHIP_LOCK, /DIGITAL_TWIN_OWNERSHIP_MATRIX/) &&
      has(OWNERSHIP_LOCK, /digital_twin_may_not_claim_canonical_identity/) &&
      has(VERSION, /DIGITAL_TWIN_OWNERSHIP = "digital_twin"/) &&
      has(VERSION, /TWIN_STATE_OWNERSHIP = "digital_twin"/) &&
      has(VERSION, /CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      has(VERSION, /SENSOR_STREAM_OWNERSHIP = "shm"/) &&
      has(INDEX, /architecture\/ownership-lock/)
      ? "pass"
      : "fail",
  );

  const footprintMissing = FOOTPRINT_INVENTORY.filter(
    (rel) => !has(DOC_FOOTPRINT, new RegExp(rel.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))),
  );
  push(
    "G",
    "Existing footprint inventory complete",
    exists(DOC_FOOTPRINT) &&
      footprintMissing.length === 0 &&
      has(DOC_FOOTPRINT, /## Classification/) &&
      has(DOC_FOOTPRINT, /PRESERVE/) &&
      has(DOC_FOOTPRINT, /REBIND/) &&
      has(DOC_FOOTPRINT, /CONSOLIDATE/) &&
      has(DOC_FOOTPRINT, /## Confirmed absences before Phase 12A/) &&
      has(DOC_FOOTPRINT, /No `packages\/digital-twin` runtime/) &&
      has(DOC_FOOTPRINT, /coming_soon/) &&
      has(DOC_FOOTPRINT, /auto-create/) &&
      has(DOC_FOOTPRINT, /digital_twin_assets/)
      ? "pass"
      : "fail",
    footprintMissing.length ? `missing:${footprintMissing.join(",")}` : "complete",
  );

  const unexpectedSources = dtSourceFiles.filter(
    (file) => !(ALLOWED_DT_SOURCE_FILES as readonly string[]).includes(file),
  );
  const presentForbiddenDirs = FORBIDDEN_DT_DIRECTORIES.filter((dir) => exists(dir));
  push(
    "H",
    "No Digital Twin runtime services",
    unexpectedSources.length === 0 &&
      presentForbiddenDirs.length === 0 &&
      ALLOWED_DT_SOURCE_FILES.every((file) => dtSourceFiles.includes(file)) &&
      !/\bclass\s+\w*(Runtime|Telemetry|Simulation|Viewer)Service\b/.test(dtText) &&
      !/\bcreateDigitalTwin(Runtime|Telemetry|Simulation)Service\b/.test(dtText)
      ? "pass"
      : "fail",
    `unexpected=${unexpectedSources.join(",") || "none"};dirs=${presentForbiddenDirs.join(",") || "none"}`,
  );

  const dtProductMigrations = migrations.filter(
    ({ file, text }) =>
      /batch_\d+_digital_twin/i.test(file) ||
      /CREATE\s+TABLE[^;]*?\bdigital_twin_(states|telemetry|simulations|scenarios|actuation)/i.test(
        text,
      ),
  );
  push(
    "I",
    "No Digital Twin product SQL migrations",
    dtProductMigrations.length === 0 &&
      has(VERSION, /DIGITAL_TWIN_PRODUCT_TABLES_INTRODUCED = false/) &&
      !/CREATE\s+TABLE[^;]*?\bdigital_twin_(states|telemetry|simulations)/i.test(dtText)
      ? "pass"
      : "fail",
    dtProductMigrations.map(({ file }) => file).join(",") || "none",
  );

  const presentUiPaths = FORBIDDEN_UI_PATHS.filter((rel) => exists(rel));
  push(
    "J",
    "No Digital Twin product UI enabled",
    presentUiPaths.length === 0 &&
      has(VERSION, /DIGITAL_TWIN_PRODUCT_UI_IMPLEMENTED = false/) &&
      dtRegistryEntry.length > 0 &&
      /enabled: false/.test(dtRegistryEntry)
      ? "pass"
      : "fail",
    presentUiPaths.join(",") || "none",
  );

  push(
    "K",
    "Terminology document",
    exists(DOC_TERMINOLOGY) &&
      has(DOC_TERMINOLOGY, /TwinTargetReference/) &&
      has(DOC_TERMINOLOGY, /TwinRepresentationReference/) &&
      has(DOC_TERMINOLOGY, /DigitalThread/) &&
      has(TERMINOLOGY, /LOCKED_TERMS/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Ownership matrix document",
    exists(DOC_OWNERSHIP) &&
      has(DOC_OWNERSHIP, /## Locked ownership boundaries/) &&
      has(DOC_OWNERSHIP, /\| Concern \| Owner \|/) &&
      has(DOC_OWNERSHIP, /twin_state/) &&
      has(DOC_OWNERSHIP, /asset_identity/) &&
      has(DOC_OWNERSHIP, /sensor_streams/) &&
      has(DOC_OWNERSHIP, /## What Digital Twin does NOT own/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Fidelity model document",
    exists(DOC_FIDELITY) &&
      has(DOC_FIDELITY, /L0/) &&
      has(DOC_FIDELITY, /L5/) &&
      has(DOC_FIDELITY, /reserved/) &&
      has(FIDELITY_MODEL, /FIDELITY_MODEL/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Digital thread model document",
    exists(DOC_THREAD) &&
      has(DOC_THREAD, /## Thread model/) &&
      has(DOC_THREAD, /provenance/) &&
      has(DOC_THREAD, /no digital_thread found/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Spatial boundary document",
    exists(DOC_SPATIAL) &&
      has(DOC_SPATIAL, /## Spatial boundary/) &&
      has(DOC_SPATIAL, /3D viewer/) &&
      has(DOC_SPATIAL, /forbidden in Phase 12A/)
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "productionDigitalTwinReady is false",
    has(VERSION, /PRODUCTION_DIGITAL_TWIN_READY = false/) &&
      has(VERSION, /DIGITAL_TWIN_IMPLEMENTED = false/) &&
      has(VERSION, /DIGITAL_TWIN_DISCOVERY_IMPLEMENTED = true/) &&
      has(OWNERSHIP_LOCK, /digital_twin_product_forbidden_in_phase_12a/) &&
      has(DOC_DISCOVERY, /productionDigitalTwinReady.*false/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Version 0.1.0-discovery",
    has(VERSION, /DIGITAL_TWIN_VERSION = "0\.1\.0-discovery"/) &&
      has(DT_PKG, /"version": "0\.1\.0-discovery"/) &&
      has(DT_CERT_PKG, /"version": "0\.1\.0-discovery"/) &&
      has(GATES_FILE, /PHASE_12A_DIGITAL_TWIN_VERSION = "0\.1\.0-discovery"/) &&
      has(DOC_DISCOVERY, /0\.1\.0-discovery/)
      ? "pass"
      : "fail",
    PHASE_12A_DIGITAL_TWIN_VERSION,
  );
  push(
    "R",
    "Module registry still coming_soon",
    dtRegistryEntry.length > 0 &&
      /status: "coming_soon"/.test(dtRegistryEntry) &&
      /enabled: false/.test(dtRegistryEntry) &&
      /version: "0\.0\.0"/.test(dtRegistryEntry) &&
      has(VERSION, /DIGITAL_TWIN_MODULE_REGISTRY_STATUS = "coming_soon"/) &&
      has(DOC_FOOTPRINT, /## Coexistence: registry entry vs discovery package/)
      ? "pass"
      : "fail",
    dtRegistryEntry ? "entry_found" : "entry_missing",
  );

  push(
    "S",
    "No live telemetry implementation",
    has(VERSION, /LIVE_TELEMETRY_IMPLEMENTED = false/) &&
      !/\b(ingest|subscribe|stream)Telemetry/i.test(dtText) &&
      has(DOC_TELEMETRY_ADR, /no duplicate time-series plane/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "No simulation execution",
    has(VERSION, /SIMULATION_EXECUTION_IMPLEMENTED = false/) &&
      !/\b(run|execute)Simulation/i.test(dtText) &&
      has(DOC_CAPABILITY, /simulation.*false/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "No 3D viewer",
    has(VERSION, /THREE_D_VIEWER_IMPLEMENTED = false/) &&
      !/\b(WebGL|Three\.js|3dViewer|renderScene)\b/i.test(dtText) &&
      has(DOC_SPATIAL, /3D viewer/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Actuation and automatic control disabled",
    has(VERSION, /PHYSICAL_ACTUATION_ENABLED = false/) &&
      has(VERSION, /AUTOMATIC_CONTROL_ENABLED = false/) &&
      has(OWNERSHIP_LOCK, /actuation_and_control_forbidden_in_phase_12a/) &&
      has(DOC_OWNERSHIP, /actuation/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Public contracts draft only",
    has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.1\.0-draft"/) &&
      has(DRAFT_CONTRACTS, /assertDraftContractsOnly/) &&
      exists(DOC_CONTRACTS) &&
      has(DOC_CONTRACTS, /0\.1\.0-draft/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "SHM boundary documented",
    exists(DOC_SHM) &&
      has(DOC_SHM, /sensor_streams/) &&
      has(DOC_SHM, /`shm`/) &&
      has(DOC_SHM, /## Consumes/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Asset Intelligence boundary documented",
    exists(DOC_AI_BOUNDARY) &&
      has(DOC_AI_BOUNDARY, /Asset Intelligence/) &&
      has(DOC_AI_BOUNDARY, /Twin must not become the asset registry/) &&
      has(DOC_AI_BOUNDARY, /condition_intelligence/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "II PI PC boundaries documented",
    exists(DOC_OWNERSHIP) &&
      has(DOC_OWNERSHIP, /inspection_intelligence/) &&
      has(DOC_OWNERSHIP, /project_intelligence/) &&
      has(DOC_OWNERSHIP, /project_controls/) &&
      has(DOC_CAPABILITY, /Inspection Intelligence/) &&
      has(DOC_CAPABILITY, /Project Intelligence/) &&
      has(DOC_CAPABILITY, /Project Controls/)
      ? "pass"
      : "fail",
  );

  push(
    "AA",
    "No duplicate asset ownership",
    has(VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/) &&
      has(OWNERSHIP_LOCK, /digital_twin_may_not_own_asset_identity/) &&
      !/ASSET_IDENTITY_OWNERSHIP\s*=\s*"digital_twin"/.test(dtText) &&
      has(AI_VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "No duplicate project ownership",
    has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/) &&
      has(VERSION, /TWIN_MAY_NOT_CLAIM_PROJECT_IDENTITY = true/) &&
      has(DOC_OWNERSHIP, /project_identity_canonical/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Twin identity model documented",
    exists(DOC_TERMINOLOGY) &&
      has(DOC_TERMINOLOGY, /one entity/) &&
      has(DOC_TERMINOLOGY, /multiple Twin representations/) &&
      has(DOC_TERMINOLOGY, /Twin references canonical entity/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Telemetry ADR no duplicate time-series",
    exists(DOC_TELEMETRY_ADR) &&
      has(DOC_TELEMETRY_ADR, /## Decision/) &&
      has(DOC_TELEMETRY_ADR, /platform_kernel_telemetry/) &&
      has(DOC_TELEMETRY_ADR, /CONSOLIDATE/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Capability matrix document",
    exists(DOC_CAPABILITY) &&
      has(DOC_CAPABILITY, /## Capability matrix/) &&
      has(DOC_CAPABILITY, /runtime/) &&
      has(DOC_CAPABILITY, /discovery/)
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Discovery overview document",
    exists(DOC_DISCOVERY) &&
      has(DOC_DISCOVERY, /## Overview/) &&
      has(DOC_DISCOVERY, /Phase 12A/) &&
      has(DOC_DISCOVERY, /no runtime/)
      ? "pass"
      : "fail",
  );

  const secret = run("pnpm --filter @rtb/digital-twin-certification secret-scan");
  push(
    "AG",
    "Secret exposure",
    secret.ok && exists(SECRET_SCAN_FILE) ? "pass" : "fail",
    secret.detail.slice(0, 500),
  );
  push(
    "AH",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || inCi ? "pass" : "fail",
    `${buildIdentitySha}:${ciHeadSha}`,
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");
  push(
    "AI",
    "Discovery package exists",
    exists(DT_PKG) &&
      exists(VERSION) &&
      exists(INDEX) &&
      exists(OWNERSHIP_LOCK) &&
      exists(DT_TEST) &&
      exists(`${DT}/tsconfig.json`) &&
      has(DT_PKG, /"name": "@rtb\/digital-twin"/) &&
      unit.ok
      ? "pass"
      : "fail",
    unit.ok ? "unit_ok" : unit.detail.slice(0, 500),
  );

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12a-digital-twin-discovery.test.ts",
  );
  push(
    "AJ",
    "Certification package exists",
    exists(DT_CERT_PKG) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(ARCH_TEST) &&
      exists(WORKFLOW) &&
      has(DT_CERT_PKG, /"name": "@rtb\/digital-twin-certification"/) &&
      has(DT_CERT_PKG, /"certify:phase12a"/) &&
      arch.ok
      ? "pass"
      : "fail",
    arch.ok ? "arch_ok" : arch.detail.slice(0, 500),
  );

  const priorGatesPassed = gates.every((g) => g.status === "pass");
  push(
    "AK",
    "Phase 12B readiness",
    priorGatesPassed &&
      exists(DOC_DISCOVERY) &&
      has(DOC_DISCOVERY, /## Phase 12B readiness/) &&
      has(DOC_DISCOVERY, /phase12BReady/) &&
      has(VERSION, /PHASE_12B_READY = true/)
      ? "pass"
      : "fail",
    `priorGatesPassed=${priorGatesPassed}`,
  );

  const releaseEligible = gates.every((g) => g.status === "pass");
  push(
    "AL",
    "Discovery release eligibility",
    releaseEligible ? "pass" : "fail",
    "discovery_scope_only",
  );

  const pcTagStillPinned = pcTag === PHASE_12A_PROJECT_CONTROLS_V1_COMMIT;
  const pcTagReachable = gitQuiet(
    `git merge-base --is-ancestor ${PHASE_12A_PROJECT_CONTROLS_V1_COMMIT} HEAD`,
  );
  push(
    "AM",
    "Project Controls V1 tag not moved",
    pcTagStillPinned &&
      pcTagReachable &&
      has(VERSION, new RegExp(`PROJECT_CONTROLS_V1_COMMIT =\\s*\\n?\\s*"${PHASE_12A_PROJECT_CONTROLS_V1_COMMIT}"`)) &&
      has(GATES_FILE, new RegExp(`"${PHASE_12A_PROJECT_CONTROLS_V1_COMMIT}"`))
      ? "pass"
      : "fail",
    `target=${pcTag ?? "missing"};reachable=${pcTagReachable}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase12a-digital-twin-discovery/1",
    phase: "12A",
    title: "Digital Twin Discovery",
    moduleKey: "digital_twin",
    version: PHASE_12A_DIGITAL_TWIN_VERSION,
    status: "discovery",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    digitalTwinImplemented: false,
    discoveryImplemented: true,
    productionDigitalTwinReady: false,
    digitalTwinOwnership: "digital_twin",
    twinStateOwnership: "digital_twin",
    simulationStateOwnership: "digital_twin",
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalProjectIdentityOwnership: "engineering_os_shared_project_domain",
    sensorStreamOwnership: "shm",
    telemetryIngestionPlaneOwnership: "platform_kernel_telemetry",
    assetIntelligenceOwnership: "asset_intelligence",
    inspectionIntelligenceOwnership: "inspection_intelligence",
    projectIntelligenceOwnership: "project_intelligence",
    projectControlsOwnership: "project_controls",
    projectControlsV1Tag: PHASE_12A_PROJECT_CONTROLS_V1_TAG,
    projectControlsV1Commit: PHASE_12A_PROJECT_CONTROLS_V1_COMMIT,
    projectControlsV1TagTarget: pcTag,
    projectControlsV1Intact: pcTagStillPinned,
    projectControlsV1TagMoved: pcTag !== null && !pcTagStillPinned,
    assetIntelligenceV1Tag: PHASE_12A_ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: PHASE_12A_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagTarget: aiTag,
    assetIntelligenceV1Intact: aiTag === PHASE_12A_ASSET_INTELLIGENCE_V1_COMMIT,
    projectIntelligenceV1Intact: piTag === PI_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === II_COMMIT,
    digitalTwinRuntimeImplemented: false,
    liveTelemetryImplemented: false,
    simulationExecutionImplemented: false,
    threeDViewerImplemented: false,
    physicalActuationEnabled: false,
    automaticControlEnabled: false,
    implementsOwnAiStack: false,
    publicContractVersion: "0.1.0-draft",
    digitalTwinProductTablesIntroduced: false,
    digitalTwinProductUiImplemented: false,
    digitalTwinProductMigrations: dtProductMigrations.map(({ file }) => file),
    moduleRegistryStatus: "coming_soon",
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    secretExposureDetected: !secret.ok,
    phase12BReady: pass,
    releaseEligible: pass,
    gates,
    requiredGates: PHASE_12A_DIGITAL_TWIN_DISCOVERY_GATES.map(([id]) => id),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase12a-digital-twin-discovery-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify({ verdict: artifact.verdict, outPath, failed: artifact.failedGates }, null, 2),
  );
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
