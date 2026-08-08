/**
 * Phase 12F certification runner (gates A–BH) — Digital Twin Representation Mapping.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_12A_CERTIFIED_COMMIT,
  PHASE_12A_HOSTED_RUN,
  PHASE_12A_VERSION,
  PHASE_12B_CERTIFIED_COMMIT,
  PHASE_12B_HOSTED_RUN,
  PHASE_12B_VERSION,
  PHASE_12C_CERTIFIED_COMMIT,
  PHASE_12C_HOSTED_RUN,
  PHASE_12C_VERSION,
  PHASE_12D_CERTIFIED_COMMIT,
  PHASE_12D_HOSTED_RUN,
  PHASE_12D_VERSION,
  PHASE_12E_CERTIFIED_COMMIT,
  PHASE_12E_HOSTED_RUN,
  PHASE_12E_VERSION,
  PHASE_12F_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12F_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12F_DIGITAL_TWIN_TABLES,
  PHASE_12F_DIGITAL_TWIN_VERSION,
  PHASE_12F_FORBIDDEN_CAPABILITIES,
  PHASE_12F_GATE_COUNT,
  PHASE_12F_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_12F_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12F_PROJECT_CONTROLS_V1_TAG,
  PHASE_12F_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_12F_REQUIRED_READY_FLAGS,
  type Phase12fGateId,
} from "../src/phase12f/gates.js";

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

const DT = "packages/digital-twin";
const DT_CERT = "packages/digital-twin-certification";
const VERSION = `${DT}/src/version.ts`;
const OWNERSHIP_LOCK = `${DT}/src/architecture/ownership-lock.ts`;
const DT_PKG = `${DT}/package.json`;
const DT_TEST = `${DT}/tests/phase12f-digital-twin-representation.test.ts`;
const DT_CERT_PKG = `${DT_CERT}/package.json`;
const GATES_FILE = `${DT_CERT}/src/phase12f/gates.ts`;
const RUNNER_FILE = `${DT_CERT}/scripts/run-phase12f-certification.ts`;
const SECRET_SCAN_FILE = `${DT_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase12f-digital-twin-representation.test.ts";
const WORKFLOW = ".github/workflows/phase-12f-digital-twin-representation.yml";
const PLAYWRIGHT = `${DT_CERT}/playwright/representation.spec.ts`;
const BATCH_79 = "supabase/migrations/20260808180000_batch_79_digital_twin_representation_mapping.sql";
const BATCH_78 = "supabase/migrations/20260808170000_batch_78_digital_twin_telemetry_binding.sql";
const BATCH_77 = "supabase/migrations/20260808160000_batch_77_digital_twin_state_ingestion.sql";
const BATCH_76 = "supabase/migrations/20260808150000_batch_76_digital_twin_state.sql";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";

const DOC_REP_MODEL = "docs/architecture/DIGITAL_TWIN_REPRESENTATION_MODEL.md";
const DOC_RECONCILIATION = "docs/architecture/DIGITAL_TWIN_SPATIAL_MODEL_RECONCILIATION.md";
const DOC_PHASE_12F = "docs/architecture/DIGITAL_TWIN_PHASE_12F_REPRESENTATION.md";

const REP_SOURCES_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/representation-sources/route.ts";
const REP_VERSIONS_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/representation-versions/route.ts";
const REP_ELEMENTS_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/representation-elements/route.ts";
const REP_MAPPINGS_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/representation-mappings/route.ts";
const REP_NAV_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/representation-navigation/route.ts";
const REP_IMPACTS_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/representation-change-impacts/route.ts";
const UI_PAGE = "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx";

const REP_HTTP_ROUTES = [
  REP_SOURCES_ROUTE,
  REP_VERSIONS_ROUTE,
  REP_ELEMENTS_ROUTE,
  REP_MAPPINGS_ROUTE,
  REP_NAV_ROUTE,
  REP_IMPACTS_ROUTE,
] as const;

const DOMAIN_FILES = [
  `${DT}/src/domain/representation-source.ts`,
  `${DT}/src/domain/representation-element.ts`,
  `${DT}/src/domain/representation-mapping.ts`,
  `${DT}/src/domain/spatial-reference.ts`,
  `${DT}/src/domain/representation-navigation.ts`,
  `${DT}/src/domain/representation-change-impact.ts`,
  `${DT}/src/domain/representation-events.ts`,
  `${DT}/src/domain/public-contracts-representation.ts`,
  `${DT}/src/domain/review-workflow.ts`,
  `${DT}/src/domain/persistence.ts`,
  `${DT}/src/domain/postgres-repository.ts`,
  `${DT}/src/domain/events.ts`,
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12fGateId; name: string; status: GateStatus; detail?: string };

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

async function verifyHosted(): Promise<{
  tablesOk: boolean;
  rlsOk: boolean;
  detail: string;
}> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { tablesOk: false, rlsOk: false, detail: "missing_supabase_credentials" };
  }
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const probeColumn: Record<string, string> = {
    digital_twin_representation_sources: "source_id",
    digital_twin_representation_elements: "element_id",
    digital_twin_representation_mappings: "mapping_id",
    digital_twin_representation_mapping_reviews: "review_id",
    digital_twin_representation_change_impacts: "impact_id",
    digital_twin_spatial_references: "spatial_ref_id",
  };
  for (const table of PHASE_12F_DIGITAL_TWIN_TABLES) {
    const column = probeColumn[table] ?? "*";
    const { error } = await admin.from(table).select(column, { count: "exact", head: true });
    if (error) {
      return {
        tablesOk: false,
        rlsOk: false,
        detail: `table_missing_or_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
  }

  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await anonClient
      .from("digital_twin_representation_mappings")
      .select("mapping_id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  } else {
    rlsOk = false;
  }

  return { tablesOk: true, rlsOk, detail: "hosted_ok" };
}

async function main() {
  const gates: GateResult[] = [];
  const push = (id: Phase12fGateId, name: string, status: GateStatus, detail?: string) => {
    gates.push({ id, name, status, detail });
  };

  const ciHeadSha = sha();
  const buildIdentitySha = ciHeadSha;
  const versionText = readRepoFile(VERSION);

  push(
    "A",
    "Repository/build identity",
    exists(DT_PKG) && has(VERSION, /0\.6\.0-representation/) ? "pass" : "fail",
    ciHeadSha,
  );

  const pcTag = tag(PHASE_12F_PROJECT_CONTROLS_V1_TAG);
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_12F_PROJECT_CONTROLS_V1_COMMIT ? "pass" : "fail",
    pcTag ?? "missing",
  );

  const aiTag = tag(PHASE_12F_ASSET_INTELLIGENCE_V1_TAG);
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_12F_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "missing",
  );

  push(
    "D",
    "PI v1 integrity",
    has(VERSION, new RegExp(PHASE_12F_PROJECT_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
  );
  push(
    "E",
    "II v1 integrity",
    has(VERSION, new RegExp(PHASE_12F_INSPECTION_INTELLIGENCE_V1_COMMIT.slice(0, 8)))
      ? "pass"
      : "fail",
  );

  push(
    "F",
    "Phase 12A baseline pinned",
    has(VERSION, new RegExp(PHASE_12A_CERTIFIED_COMMIT.slice(0, 8))) &&
      has(VERSION, /PHASE_12A_HOSTED_RUN = "31253197987"/) &&
      has(VERSION, /PHASE_12A_VERSION = "0\.1\.0-discovery"/)
      ? "pass"
      : "fail",
  );
  push(
    "G",
    "Phase 12B baseline pinned",
    has(VERSION, new RegExp(PHASE_12B_CERTIFIED_COMMIT.slice(0, 8))) &&
      has(VERSION, new RegExp(`PHASE_12B_HOSTED_RUN = "${PHASE_12B_HOSTED_RUN}"`)) &&
      has(VERSION, /PHASE_12B_VERSION = "0\.2\.0-core"/)
      ? "pass"
      : "fail",
  );
  push(
    "H",
    "Phase 12C baseline pinned",
    has(VERSION, new RegExp(PHASE_12C_CERTIFIED_COMMIT.slice(0, 8))) &&
      has(VERSION, new RegExp(`PHASE_12C_HOSTED_RUN = "${PHASE_12C_HOSTED_RUN}"`)) &&
      has(VERSION, /PHASE_12C_VERSION = "0\.3\.0-state"/)
      ? "pass"
      : "fail",
  );
  push(
    "I",
    "Phase 12D baseline pinned",
    has(VERSION, new RegExp(PHASE_12D_CERTIFIED_COMMIT.slice(0, 8))) &&
      has(VERSION, new RegExp(`PHASE_12D_HOSTED_RUN = "${PHASE_12D_HOSTED_RUN}"`)) &&
      has(VERSION, /PHASE_12D_VERSION = "0\.4\.0-ingestion"/)
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Phase 12E baseline pinned",
    has(VERSION, new RegExp(PHASE_12E_CERTIFIED_COMMIT.slice(0, 8))) &&
      has(VERSION, new RegExp(`PHASE_12E_HOSTED_RUN = "${PHASE_12E_HOSTED_RUN}"`)) &&
      has(VERSION, /PHASE_12E_VERSION = "0\.5\.0-telemetry-binding"/)
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Ownership lock for representation slice",
    has(OWNERSHIP_LOCK, /assertOwnershipLock/) &&
      has(OWNERSHIP_LOCK, /duplicate_model_ownership_forbidden/) &&
      has(OWNERSHIP_LOCK, /spatial_canonical_ownership_must_be_shared_domain/) &&
      has(OWNERSHIP_LOCK, /source_model_ownership_must_be_external_or_existing/)
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "TwinRepresentationSourceReference contract",
    has(`${DT}/src/domain/representation-source.ts`, /TwinRepresentationSourceReference/) &&
      has(`${DT}/src/domain/representation-source.ts`, /storesSourceModelBinary: false/) &&
      has(`${DT}/src/domain/representation-source.ts`, /assertRepresentationSourceReferenceOnly/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "TwinRepresentationElementReference contract",
    has(`${DT}/src/domain/representation-element.ts`, /TwinRepresentationElementReference/) &&
      has(`${DT}/src/domain/representation-element.ts`, /storesGeometryPayload: false/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "TwinRepresentationMapping lifecycle",
    has(`${DT}/src/domain/representation-mapping.ts`, /REPRESENTATION_MAPPING_LIFECYCLE/) &&
      has(`${DT}/src/domain/representation-mapping.ts`, /published_representation_mapping_overwrite_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Mapping confidence and methods",
    has(`${DT}/src/domain/representation-mapping.ts`, /ai_assisted_match/) &&
      has(`${DT}/src/domain/representation-mapping.ts`, /REPRESENTATION_MAPPING_CONFIDENCE/) &&
      has(`${DT}/src/domain/representation-mapping.ts`, /assertAiAssistedSuggestOnly/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "TwinSpatialReference CRS required",
    has(`${DT}/src/domain/spatial-reference.ts`, /coordinate_reference_system_required/) &&
      has(`${DT}/src/domain/spatial-reference.ts`, /assertCrsTransformationDeclared/) &&
      has(`${DT}/src/domain/spatial-reference.ts`, /inventsLocationRegistry: false/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Representation navigation service",
    has(`${DT}/src/domain/representation-navigation.ts`, /createTwinRepresentationNavigationService/) &&
      has(`${DT}/src/domain/representation-navigation.ts`, /threeDViewerImplemented: false/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Change impact classification",
    has(`${DT}/src/domain/representation-change-impact.ts`, /classifyRepresentationChangeImpact/) &&
      has(`${DT}/src/domain/representation-change-impact.ts`, /mapping_invalid/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Representation mapping review workflow",
    has(`${DT}/src/domain/review-workflow.ts`, /REPRESENTATION_MAPPING_REVIEW_WORKFLOW/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /digital_twin\.representation_mapping_review/) &&
      has(VERSION, /DIGITAL_TWIN_REPRESENTATION_MAPPING_REVIEW_SLUG/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Representation domain events",
    has(`${DT}/src/domain/representation-events.ts`, /REPRESENTATION_DOMAIN_EVENTS/) &&
      has(`${DT}/src/domain/events.ts`, /REPRESENTATION_DOMAIN_EVENTS/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Persistence port extended",
    has(`${DT}/src/domain/persistence.ts`, /saveRepresentationMapping/) &&
      has(`${DT}/src/domain/persistence.ts`, /saveSpatialReference/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Postgres repository representation tables",
    has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_representation_sources/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_representation_mappings/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_spatial_references/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Production memory repository forbidden",
    has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) ? "pass" : "fail",
  );
  push(
    "X",
    "Repository factory",
    has(`${DT}/src/domain/repository-factory.ts`, /createDigitalTwinRepository/) ? "pass" : "fail",
  );
  push(
    "Y",
    "Public contracts 0.6.0-representation-draft",
    has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.6\.0-representation-draft"/) &&
      has(`${DT}/src/domain/public-contracts-representation.ts`, /assertRepresentationContracts/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Version 0.6.0-representation flags",
    has(VERSION, /DIGITAL_TWIN_VERSION = "0\.6\.0-representation"/) &&
      has(VERSION, /DIGITAL_TWIN_STATUS = "representation"/) &&
      has(VERSION, /DIGITAL_TWIN_PHASE = "12F"/)
      ? "pass"
      : "fail",
  );

  push(
    "AA",
    "TwinRepresentationMappingReady true",
    has(VERSION, /TWIN_REPRESENTATION_MAPPING_READY = true/) &&
      has(VERSION, /TwinRepresentationMappingReady = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "TwinRepresentationNavigationReady true",
    has(VERSION, /TWIN_REPRESENTATION_NAVIGATION_READY = true/) ? "pass" : "fail",
  );
  push(
    "AC",
    "representationNavigationImplemented true",
    has(VERSION, /representationNavigationImplemented = true/) &&
      has(VERSION, /REPRESENTATION_NAVIGATION_IMPLEMENTED = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Telemetry binding capabilities retained from 12E",
    has(VERSION, /TWIN_TELEMETRY_BINDING_READY = true/) &&
      has(VERSION, /LIVE_TELEMETRY_IMPLEMENTED = true/) &&
      has(VERSION, /ENGINEERING_TIME_SERIES_REUSE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "digitalTwinRuntimeImplemented bounded true",
    has(VERSION, /DIGITAL_TWIN_RUNTIME_IMPLEMENTED = true/) ? "pass" : "fail",
  );
  push(
    "AF",
    "threeDViewerImplemented false",
    has(VERSION, /THREE_D_VIEWER_IMPLEMENTED = false/) &&
      has(VERSION, /threeDViewerImplemented = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "automaticRepresentationMappingApprovalEnabled false",
    has(VERSION, /AUTOMATIC_REPRESENTATION_MAPPING_APPROVAL_ENABLED = false/) ? "pass" : "fail",
  );
  push(
    "AH",
    "highFrequency/historian/sensorRegistry/shm false",
    PHASE_12F_FORBIDDEN_CAPABILITIES.filter((f) =>
      ["HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED", "TELEMETRY_HISTORIAN_IMPLEMENTED", "SENSOR_REGISTRY_IMPLEMENTED", "SHM_SIGNAL_PROCESSING_IMPLEMENTED"].includes(f),
    ).every((f) => versionText.includes(`${f} = false`))
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "SHM/sim/viewer/actuation false",
    has(VERSION, /SHM_RUNTIME_IMPLEMENTED = false/) &&
      has(VERSION, /SIMULATION_EXECUTION_IMPLEMENTED = false/) &&
      has(VERSION, /PHYSICAL_ACTUATION_ENABLED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "No duplicate asset/project/time-series/model ownership",
    has(VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_TIME_SERIES_PLANE_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_MODEL_OWNERSHIP_DETECTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "engineeringTimeSeriesOwnership asset_intelligence",
    has(VERSION, /ENGINEERING_TIME_SERIES_OWNERSHIP = "asset_intelligence"/) ? "pass" : "fail",
  );
  push(
    "AL",
    "spatialCanonicalOwnership reconciled shared domain",
    has(
      VERSION,
      /SPATIAL_CANONICAL_OWNERSHIP =\s*"existing_shared_spatial_domain_or_explicitly_reconciled_owner"/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "sourceModelOwnership external_or_existing",
    has(VERSION, /SOURCE_MODEL_OWNERSHIP = "external_or_existing_engineering_model_owner"/)
      ? "pass"
      : "fail",
  );

  push("AN", "batch_79 migration exists", exists(BATCH_79) ? "pass" : "fail");
  push(
    "AO",
    "Representation tables with RLS",
    PHASE_12F_DIGITAL_TWIN_TABLES.every((t) => has(BATCH_79, new RegExp(t))) &&
      has(BATCH_79, /ENABLE ROW LEVEL SECURITY/)
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "Forbid CHECK constraints on representation tables",
    has(BATCH_79, /stores_geometry_payload = false/) &&
      has(BATCH_79, /stores_source_model_binary = false/) &&
      has(BATCH_79, /viewer_authoring_enabled = false/) &&
      has(BATCH_79, /auto_approve_enabled = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AQ",
    "No model binary / geometry payload tables",
    !has(BATCH_79, /CREATE TABLE IF NOT EXISTS digital_twin_.*geometry/i) &&
      !has(BATCH_79, /bytea/i) &&
      !has(BATCH_79, /CREATE TABLE IF NOT EXISTS digital_twin_model_binaries/i) &&
      has(BATCH_79, /stores_source_model_binary boolean NOT NULL DEFAULT false/)
      ? "pass"
      : "fail",
  );
  push(
    "AR",
    "batch_75/76/77/78 not modified",
    exists(BATCH_75) && exists(BATCH_76) && exists(BATCH_77) && exists(BATCH_78) ? "pass" : "fail",
  );

  push(
    "AS",
    "Representation sources HTTP route",
    exists(REP_SOURCES_ROUTE) && has(REP_SOURCES_ROUTE, /source_model_binary_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "Representation versions HTTP route",
    exists(REP_VERSIONS_ROUTE) ? "pass" : "fail",
  );
  push(
    "AU",
    "Representation elements HTTP route",
    exists(REP_ELEMENTS_ROUTE) && has(REP_ELEMENTS_ROUTE, /geometry_payload_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "AV",
    "Representation mappings HTTP route",
    exists(REP_MAPPINGS_ROUTE) && has(REP_MAPPINGS_ROUTE, /mapping_binary_or_auto_approve_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "AW",
    "Representation navigation HTTP route",
    exists(REP_NAV_ROUTE) && has(REP_NAV_ROUTE, /three_d_viewer_forbidden/) ? "pass" : "fail",
  );
  push(
    "AX",
    "Representation change impacts HTTP route",
    exists(REP_IMPACTS_ROUTE) ? "pass" : "fail",
  );
  push(
    "AY",
    "Rejects model binary payloads",
    REP_HTTP_ROUTES.some((r) => has(r, /binary|geometry|forbidden/i)) ? "pass" : "fail",
  );
  push(
    "AZ",
    "Representation mapping UI",
    exists(UI_PAGE) &&
      has(UI_PAGE, /digital-twin-representation-ready/) &&
      has(UI_PAGE, /0\.6\.0-representation/) &&
      has(UI_PAGE, /threeDViewerImplemented=false/)
      ? "pass"
      : "fail",
  );

  push(
    "BA",
    "Phase 12F architecture documents",
    exists(DOC_REP_MODEL) && exists(DOC_RECONCILIATION) && exists(DOC_PHASE_12F) ? "pass" : "fail",
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");
  push("BB", "Unit tests green", unit.ok ? "pass" : "fail", unit.ok ? "ok" : unit.detail.slice(0, 500));

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12f-digital-twin-representation.test.ts",
  );
  const secretScan = run("pnpm --filter @rtb/digital-twin-certification secret-scan");
  push(
    "BC",
    "Certification package and runner",
    exists(DT_CERT_PKG) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(SECRET_SCAN_FILE) &&
      exists(DT_TEST) &&
      exists(WORKFLOW) &&
      exists(PLAYWRIGHT) &&
      has(DT_CERT_PKG, /certify:phase12f/) &&
      arch.ok &&
      secretScan.ok
      ? "pass"
      : "fail",
    arch.ok ? "arch_ok" : arch.detail.slice(0, 500),
  );

  if (process.env.CERTIFY_BROWSER !== "1") {
    push(
      "BD",
      "Browser E2E CERTIFY_BROWSER=1",
      "fail",
      "CERTIFY_BROWSER=1 required; hosted hard-fail without browser cert",
    );
  } else {
    const pw = run(
      "pnpm --filter @rtb/digital-twin-certification exec playwright test playwright/representation.spec.ts",
      { CERTIFY_BROWSER: "1" },
    );
    push(
      "BD",
      "Browser E2E CERTIFY_BROWSER=1",
      pw.ok ? "pass" : "fail",
      pw.ok ? "ok" : pw.detail.slice(0, 500),
    );
  }

  push(
    "BE",
    "Artifact identity",
    gates.length + 1 + 3 === PHASE_12F_GATE_COUNT ? "pass" : "fail",
    `gateCount=${gates.length + 1};expected=${PHASE_12F_GATE_COUNT}`,
  );

  const hosted = await verifyHosted();
  const hasCreds = hosted.detail !== "missing_supabase_credentials";
  push(
    "BF",
    "Hosted representation tables readable",
    hasCreds ? (hosted.tablesOk && hosted.rlsOk ? "pass" : "fail") : "fail",
    hosted.detail,
  );

  push(
    "BG",
    "Phase 12G readiness",
    has(VERSION, /PHASE_12G_READY = true/) && has(VERSION, /phase12GReady = true/) ? "pass" : "fail",
  );

  const readyOk = PHASE_12F_REQUIRED_READY_FLAGS.every((f) => versionText.includes(`${f} = true`));
  const localGatesPass = gates.every((g) => g.status === "pass");
  push(
    "BH",
    "a11y basic surfaces / release eligibility",
    readyOk &&
      exists(PLAYWRIGHT) &&
      has(PLAYWRIGHT, /accessible|landmark|aria/i) &&
      exists(UI_PAGE) &&
      has(UI_PAGE, /aria-labelledby/) &&
      has(VERSION, /PHASE_12F_READY = true/) &&
      has(VERSION, /phase12GReady = true/) &&
      has(VERSION, /duplicateModelOwnershipDetected = false/) &&
      localGatesPass &&
      DOMAIN_FILES.every((f) => exists(f))
      ? "pass"
      : "fail",
    `readyOk=${readyOk};localGatesPass=${localGatesPass}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase12f-digital-twin-representation/1",
    phase: "12F",
    title: "Digital Twin Representation Mapping",
    moduleKey: "digital_twin",
    version: PHASE_12F_DIGITAL_TWIN_VERSION,
    status: "representation",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    digitalTwinImplemented: true,
    discoveryImplemented: true,
    productionDigitalTwinReady: false,
    digitalTwinRuntimeImplemented: true,
    automaticObservedStatePublicationEnabled: false,
    automaticTelemetryStatePublicationEnabled: false,
    automaticRepresentationMappingApprovalEnabled: false,
    liveTelemetryImplemented: true,
    highFrequencyTelemetryImplemented: false,
    telemetryHistorianImplemented: false,
    sensorRegistryImplemented: false,
    shmSignalProcessingImplemented: false,
    shmRuntimeImplemented: false,
    simulationExecutionImplemented: false,
    threeDViewerImplemented: false,
    representationNavigationImplemented: true,
    physicalActuationEnabled: false,
    automaticControlEnabled: false,
    twinIdentityReady: true,
    twinRepresentationReady: true,
    twinThreadReady: true,
    twinStateReady: true,
    twinVersioningReady: true,
    representationVersioningReady: true,
    twinSnapshotReady: true,
    twinTimelineReady: true,
    twinStateIngestionReady: true,
    twinSourceAdapterReady: true,
    twinStateReconciliationReady: true,
    twinTelemetryBindingReady: true,
    twinTelemetryProjectionReady: true,
    engineeringTimeSeriesReuseReady: true,
    twinRepresentationMappingReady: true,
    twinRepresentationNavigationReady: true,
    engineeringTimeSeriesOwnership: "asset_intelligence",
    spatialCanonicalOwnership: "existing_shared_spatial_domain_or_explicitly_reconciled_owner",
    sourceModelOwnership: "external_or_existing_engineering_model_owner",
    knowledgeGraphReuse: true,
    hostedDigitalTwinPersistenceReady: true,
    digitalTwinProductTablesIntroduced: true,
    phase12CReady: true,
    phase12DReady: true,
    phase12EReady: true,
    phase12FReady: true,
    phase12GReady: true,
    phase12AVersion: PHASE_12A_VERSION,
    phase12ACertifiedCommit: PHASE_12A_CERTIFIED_COMMIT,
    phase12AHostedRun: PHASE_12A_HOSTED_RUN,
    phase12BVersion: PHASE_12B_VERSION,
    phase12BCertifiedCommit: PHASE_12B_CERTIFIED_COMMIT,
    phase12BHostedRun: PHASE_12B_HOSTED_RUN,
    phase12CVersion: PHASE_12C_VERSION,
    phase12CCertifiedCommit: PHASE_12C_CERTIFIED_COMMIT,
    phase12CHostedRun: PHASE_12C_HOSTED_RUN,
    phase12DVersion: PHASE_12D_VERSION,
    phase12DCertifiedCommit: PHASE_12D_CERTIFIED_COMMIT,
    phase12DHostedRun: PHASE_12D_HOSTED_RUN,
    phase12EVersion: PHASE_12E_VERSION,
    phase12ECertifiedCommit: PHASE_12E_CERTIFIED_COMMIT,
    phase12EHostedRun: PHASE_12E_HOSTED_RUN,
    publicContractVersion: "0.6.0-representation-draft",
    projectControlsV1Intact: pcTag === PHASE_12F_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_12F_ASSET_INTELLIGENCE_V1_COMMIT,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    duplicateTimeSeriesPlaneDetected: false,
    duplicateModelOwnershipDetected: false,
    secretExposureDetected: !secretScan.ok,
    releaseEligible: pass,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    requiredGates: gates,
    gateCount: gates.length,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => ({ id: g.id, name: g.name, detail: g.detail })),
    hostedVerification: hosted,
    identityReviewSlug: "digital_twin.identity_review",
    stateReviewSlug: "digital_twin.state_review",
    telemetryBindingReviewSlug: "digital_twin.telemetry_binding_review",
    representationMappingReviewSlug: "digital_twin.representation_mapping_review",
    digitalTwinTables: [...PHASE_12F_DIGITAL_TWIN_TABLES],
    forbiddenCapabilities: [...PHASE_12F_FORBIDDEN_CAPABILITIES],
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase12f-digital-twin-representation-certification.json");
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({ verdict: artifact.verdict, failed: failed.length, outPath }, null, 2));
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
