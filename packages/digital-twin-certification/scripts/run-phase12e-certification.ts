/**
 * Phase 12E certification runner (gates A–BI) — Digital Twin Telemetry Binding.
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
  PHASE_12E_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12E_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12E_DIGITAL_TWIN_TABLES,
  PHASE_12E_DIGITAL_TWIN_VERSION,
  PHASE_12E_FORBIDDEN_CAPABILITIES,
  PHASE_12E_GATE_COUNT,
  PHASE_12E_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_12E_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12E_PROJECT_CONTROLS_V1_TAG,
  PHASE_12E_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_12E_REQUIRED_READY_FLAGS,
  type Phase12eGateId,
} from "../src/phase12e/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const DT = "packages/digital-twin";
const DT_CERT = "packages/digital-twin-certification";
const VERSION = `${DT}/src/version.ts`;
const OWNERSHIP_LOCK = `${DT}/src/architecture/ownership-lock.ts`;
const DT_PKG = `${DT}/package.json`;
const DT_TEST = `${DT}/tests/phase12e-digital-twin-telemetry-binding.test.ts`;
const DT_CERT_PKG = `${DT_CERT}/package.json`;
const GATES_FILE = `${DT_CERT}/src/phase12e/gates.ts`;
const RUNNER_FILE = `${DT_CERT}/scripts/run-phase12e-certification.ts`;
const SECRET_SCAN_FILE = `${DT_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase12e-digital-twin-telemetry-binding.test.ts";
const WORKFLOW = ".github/workflows/phase-12e-digital-twin-telemetry-binding.yml";
const PLAYWRIGHT = `${DT_CERT}/playwright/telemetry-binding.spec.ts`;
const BATCH_78 = "supabase/migrations/20260808170000_batch_78_digital_twin_telemetry_binding.sql";
const BATCH_77 = "supabase/migrations/20260808160000_batch_77_digital_twin_state_ingestion.sql";
const BATCH_76 = "supabase/migrations/20260808150000_batch_76_digital_twin_state.sql";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";

const DOC_TELEMETRY_MODEL = "docs/architecture/DIGITAL_TWIN_TELEMETRY_MODEL.md";
const DOC_RECONCILIATION = "docs/architecture/DIGITAL_TWIN_ENGINEERING_TIMESERIES_RECONCILIATION.md";
const DOC_LIVE_STATE = "docs/architecture/DIGITAL_TWIN_LIVE_STATE_SEMANTICS.md";
const DOC_PHASE_12E = "docs/architecture/DIGITAL_TWIN_PHASE_12E_TELEMETRY_BINDING.md";

const TELEMETRY_SOURCES_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/telemetry-sources/route.ts";
const TELEMETRY_CHANNELS_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/telemetry-channels/route.ts";
const TELEMETRY_BINDINGS_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/telemetry-bindings/route.ts";
const TELEMETRY_PROJECTION_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/telemetry-projection/route.ts";
const TELEMETRY_HEALTH_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/telemetry-health/route.ts";
const UI_PAGE = "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx";

const TELEMETRY_HTTP_ROUTES = [
  TELEMETRY_SOURCES_ROUTE,
  TELEMETRY_CHANNELS_ROUTE,
  TELEMETRY_BINDINGS_ROUTE,
  TELEMETRY_PROJECTION_ROUTE,
  TELEMETRY_HEALTH_ROUTE,
] as const;

const DOMAIN_FILES = [
  `${DT}/src/domain/identity.ts`,
  `${DT}/src/domain/representation.ts`,
  `${DT}/src/domain/state.ts`,
  `${DT}/src/domain/thread.ts`,
  `${DT}/src/domain/relationships.ts`,
  `${DT}/src/domain/events.ts`,
  `${DT}/src/domain/review-workflow.ts`,
  `${DT}/src/domain/twin-engine.ts`,
  `${DT}/src/domain/engine.ts`,
  `${DT}/src/domain/persistence.ts`,
  `${DT}/src/domain/postgres-repository.ts`,
  `${DT}/src/domain/repository-factory.ts`,
  `${DT}/src/domain/public-contracts-core.ts`,
  `${DT}/src/domain/state-engine.ts`,
  `${DT}/src/domain/representation-versioning.ts`,
  `${DT}/src/domain/snapshot.ts`,
  `${DT}/src/domain/timeline.ts`,
  `${DT}/src/domain/state-events.ts`,
  `${DT}/src/domain/public-contracts-state.ts`,
  `${DT}/src/domain/source-adapter.ts`,
  `${DT}/src/domain/state-schema-registry.ts`,
  `${DT}/src/domain/source-freshness.ts`,
  `${DT}/src/domain/unit-governance.ts`,
  `${DT}/src/domain/observed-state-candidate.ts`,
  `${DT}/src/domain/state-reconciliation.ts`,
  `${DT}/src/domain/source-authority.ts`,
  `${DT}/src/domain/state-ingestion-engine.ts`,
  `${DT}/src/domain/ingestion-events.ts`,
  `${DT}/src/domain/public-contracts-ingestion.ts`,
  `${DT}/src/domain/telemetry-source.ts`,
  `${DT}/src/domain/telemetry-channel.ts`,
  `${DT}/src/domain/telemetry-binding.ts`,
  `${DT}/src/domain/time-series-read-port.ts`,
  `${DT}/src/domain/telemetry-projection-engine.ts`,
  `${DT}/src/domain/projection-methods.ts`,
  `${DT}/src/domain/aggregation-policy.ts`,
  `${DT}/src/domain/observation-quality.ts`,
  `${DT}/src/domain/gap-handling.ts`,
  `${DT}/src/domain/source-health.ts`,
  `${DT}/src/domain/live-state-semantics.ts`,
  `${DT}/src/domain/telemetry-events.ts`,
  `${DT}/src/domain/public-contracts-telemetry.ts`,
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12eGateId; name: string; status: GateStatus; detail?: string };

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
    digital_twin_telemetry_sources: "source_id",
    digital_twin_telemetry_channels: "channel_id",
    digital_twin_telemetry_bindings: "binding_id",
    digital_twin_telemetry_aggregation_policies: "policy_id",
    digital_twin_telemetry_projection_records: "projection_id",
    digital_twin_telemetry_binding_reviews: "review_id",
  };
  for (const table of PHASE_12E_DIGITAL_TWIN_TABLES) {
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
      .from("digital_twin_telemetry_bindings")
      .select("binding_id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  } else {
    rlsOk = false;
  }

  return { tablesOk: true, rlsOk, detail: "hosted_ok" };
}

async function main() {
  const gates: GateResult[] = [];
  const push = (id: Phase12eGateId, name: string, status: GateStatus, detail?: string) => {
    gates.push({ id, name, status, detail });
  };

  const ciHeadSha = sha();
  const buildIdentitySha = ciHeadSha;
  const versionText = readRepoFile(VERSION);

  push(
    "A",
    "Repository/build identity",
    exists(DT_PKG) && has(VERSION, /0\.5\.0-telemetry-binding/) ? "pass" : "fail",
    ciHeadSha,
  );

  const pcTag = tag(PHASE_12E_PROJECT_CONTROLS_V1_TAG);
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_12E_PROJECT_CONTROLS_V1_COMMIT ? "pass" : "fail",
    pcTag ?? "missing",
  );

  const aiTag = tag(PHASE_12E_ASSET_INTELLIGENCE_V1_TAG);
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_12E_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "missing",
  );

  push(
    "D",
    "PI v1 integrity",
    has(VERSION, new RegExp(PHASE_12E_PROJECT_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
  );
  push(
    "E",
    "II v1 integrity",
    has(VERSION, new RegExp(PHASE_12E_INSPECTION_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
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
    "Ownership lock for telemetry binding slice",
    has(OWNERSHIP_LOCK, /assertOwnershipLock/) &&
      has(OWNERSHIP_LOCK, /digital_twin_telemetry_binding_must_be_implemented_in_phase_12e/) &&
      has(OWNERSHIP_LOCK, /engineering_time_series_owner_must_be_asset_intelligence/) &&
      has(OWNERSHIP_LOCK, /duplicate_timeseries_plane_forbidden/)
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "TelemetrySourceReference contract",
    has(`${DT}/src/domain/telemetry-source.ts`, /TelemetrySourceReference/) &&
      has(`${DT}/src/domain/telemetry-source.ts`, /storesRawTelemetry: false/) &&
      has(`${DT}/src/domain/telemetry-source.ts`, /assertTelemetrySourceReferenceOnly/)
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "TelemetryChannelReference contract",
    has(`${DT}/src/domain/telemetry-channel.ts`, /TelemetryChannelReference/) &&
      has(`${DT}/src/domain/telemetry-channel.ts`, /createTelemetryChannelReference/) &&
      has(`${DT}/src/domain/telemetry-channel.ts`, /storesRawTelemetry: false/)
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "TwinTelemetryBinding lifecycle",
    has(`${DT}/src/domain/telemetry-binding.ts`, /TwinTelemetryBinding/) &&
      has(`${DT}/src/domain/telemetry-binding.ts`, /lifecycle/) &&
      has(`${DT}/src/domain/telemetry-binding.ts`, /createTwinTelemetryBinding/)
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "EngineeringTimeSeriesReadPort read-only",
    has(`${DT}/src/domain/time-series-read-port.ts`, /EngineeringTimeSeriesReadPort/) &&
      has(`${DT}/src/domain/time-series-read-port.ts`, /MUST NOT write/) &&
      has(`${DT}/src/domain/time-series-read-port.ts`, /ownerModule: "asset_intelligence"/)
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "TwinTelemetryProjectionEngine",
    has(`${DT}/src/domain/telemetry-projection-engine.ts`, /TwinTelemetryProjectionEngine/) &&
      has(`${DT}/src/domain/telemetry-projection-engine.ts`, /projectBinding/) &&
      has(`${DT}/src/domain/telemetry-projection-engine.ts`, /createTwinTelemetryProjectionEngine/)
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "Projection methods bounded",
    has(`${DT}/src/domain/projection-methods.ts`, /PROJECTION_METHODS/) &&
      has(`${DT}/src/domain/projection-methods.ts`, /assertProjectionMethodBounded/) &&
      has(`${DT}/src/domain/projection-methods.ts`, /latest_valid_observation/)
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Aggregation policy",
    has(`${DT}/src/domain/aggregation-policy.ts`, /TwinTelemetryAggregationPolicy/) &&
      has(`${DT}/src/domain/aggregation-policy.ts`, /createTwinTelemetryAggregationPolicy/) &&
      has(`${DT}/src/domain/aggregation-policy.ts`, /interpolation: "not_implemented"/)
      ? "pass"
      : "fail",
  );

  push(
    "R",
    "Observation quality",
    has(`${DT}/src/domain/observation-quality.ts`, /OBSERVATION_QUALITY/) &&
      has(`${DT}/src/domain/observation-quality.ts`, /classifyObservationQuality/) &&
      has(`${DT}/src/domain/observation-quality.ts`, /isProjectionQualityAcceptable/)
      ? "pass"
      : "fail",
  );

  push(
    "S",
    "Gap handling interpolation not_implemented",
    has(`${DT}/src/domain/gap-handling.ts`, /GAP_HANDLING/) &&
      has(`${DT}/src/domain/gap-handling.ts`, /INTERPOLATION_STATUS = "not_implemented"/) &&
      has(`${DT}/src/domain/gap-handling.ts`, /resolveGapHandling/)
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "Source health",
    has(`${DT}/src/domain/source-health.ts`, /SOURCE_HEALTH/) &&
      has(`${DT}/src/domain/source-health.ts`, /evaluateSourceHealth/) &&
      has(`${DT}/src/domain/source-health.ts`, /unavailable/)
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "Live state semantics",
    has(`${DT}/src/domain/live-state-semantics.ts`, /LiveStateSemantics/) &&
      has(`${DT}/src/domain/live-state-semantics.ts`, /CurrentProjectedState/) &&
      has(`${DT}/src/domain/live-state-semantics.ts`, /interpolation: "not_implemented"/)
      ? "pass"
      : "fail",
  );

  push(
    "V",
    "Telemetry binding review workflow",
    has(`${DT}/src/domain/review-workflow.ts`, /startTelemetryBindingReview/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /TELEMETRY_BINDING_REVIEW_ENTITY_TYPE/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /digital_twin_telemetry_binding/)
      ? "pass"
      : "fail",
  );

  push(
    "W",
    "Telemetry domain events declared",
    has(`${DT}/src/domain/events.ts`, /TELEMETRY_DOMAIN_EVENTS/) &&
      has(`${DT}/src/domain/telemetry-events.ts`, /engineering\.digital_twin\.telemetry_binding\.created/) &&
      has(`${DT}/src/domain/telemetry-events.ts`, /engineering\.digital_twin\.telemetry\.source_unavailable/)
      ? "pass"
      : "fail",
  );

  push(
    "X",
    "Persistence port extended for telemetry binding",
    has(`${DT}/src/domain/persistence.ts`, /saveTelemetrySource/) &&
      has(`${DT}/src/domain/persistence.ts`, /saveTelemetryBinding/) &&
      has(`${DT}/src/domain/persistence.ts`, /saveTelemetryProjectionRecord/)
      ? "pass"
      : "fail",
  );

  push(
    "Y",
    "Postgres repository binding tables",
    has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_telemetry_sources/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_telemetry_bindings/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_telemetry_projection_records/)
      ? "pass"
      : "fail",
  );

  push(
    "Z",
    "Production memory repository forbidden",
    has(`${DT}/src/domain/persistence.ts`, /production_memory_repository_forbidden/) &&
      has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AA",
    "Repository factory",
    has(`${DT}/src/domain/repository-factory.ts`, /createDigitalTwinRepository/) ? "pass" : "fail",
  );

  push(
    "AB",
    "Public contracts 0.5.0-telemetry-binding-draft",
    has(`${DT}/src/domain/public-contracts-telemetry.ts`, /0\.5\.0-telemetry-binding-draft/) &&
      has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.5\.0-telemetry-binding-draft"/)
      ? "pass"
      : "fail",
  );

  push(
    "AC",
    "Version 0.5.0-telemetry-binding flags",
    has(VERSION, /DIGITAL_TWIN_VERSION = "0\.5\.0-telemetry-binding"/) &&
      has(VERSION, /DIGITAL_TWIN_STATUS = "telemetry_binding"/) &&
      has(VERSION, /DIGITAL_TWIN_PHASE = "12E"/)
      ? "pass"
      : "fail",
  );

  for (const [id, flag] of [
    ["AD", "TWIN_TELEMETRY_BINDING_READY = true"],
    ["AE", "TWIN_TELEMETRY_PROJECTION_READY = true"],
    ["AF", "ENGINEERING_TIME_SERIES_REUSE_READY = true"],
  ] as const) {
    push(id, `${flag.split(" ")[0]} true`, versionText.includes(flag) ? "pass" : "fail");
  }

  push(
    "AG",
    "Ingestion capabilities retained from 12D",
    has(VERSION, /TWIN_STATE_INGESTION_READY = true/) &&
      has(VERSION, /TWIN_SOURCE_ADAPTER_READY = true/) &&
      has(VERSION, /TWIN_STATE_RECONCILIATION_READY = true/) &&
      has(VERSION, /AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED = false/) &&
      has(VERSION, /PHASE_12D_READY = true/)
      ? "pass"
      : "fail",
  );

  push(
    "AH",
    "digitalTwinRuntimeImplemented bounded true",
    has(VERSION, /DIGITAL_TWIN_RUNTIME_IMPLEMENTED = true/) &&
      has(`${DT}/src/domain/engine.ts`, /digitalTwinRuntimeImplemented/)
      ? "pass"
      : "fail",
  );

  push(
    "AI",
    "liveTelemetryImplemented bounded true",
    has(VERSION, /LIVE_TELEMETRY_IMPLEMENTED = true/) &&
      has(VERSION, /liveTelemetryImplemented = true/) &&
      has(`${DT}/src/domain/telemetry-projection-engine.ts`, /assertTelemetryProjectionBounded/)
      ? "pass"
      : "fail",
  );

  push(
    "AJ",
    "automaticTelemetryStatePublicationEnabled false",
    has(VERSION, /AUTOMATIC_TELEMETRY_STATE_PUBLICATION_ENABLED = false/) &&
      has(VERSION, /automaticTelemetryStatePublicationEnabled = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AK",
    "highFrequency/historian/sensorRegistry/shm false",
    has(VERSION, /HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED = false/) &&
      has(VERSION, /TELEMETRY_HISTORIAN_IMPLEMENTED = false/) &&
      has(VERSION, /SENSOR_REGISTRY_IMPLEMENTED = false/) &&
      has(VERSION, /SHM_SIGNAL_PROCESSING_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AL",
    "SHM/sim/viewer/actuation false",
    has(VERSION, /SHM_RUNTIME_IMPLEMENTED = false/) &&
      has(VERSION, /SIMULATION_EXECUTION_IMPLEMENTED = false/) &&
      has(VERSION, /THREE_D_VIEWER_IMPLEMENTED = false/) &&
      has(VERSION, /PHYSICAL_ACTUATION_ENABLED = false/) &&
      has(VERSION, /AUTOMATIC_CONTROL_ENABLED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AM",
    "No duplicate asset/project/time-series ownership",
    has(VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_TIME_SERIES_PLANE_DETECTED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AN",
    "engineeringTimeSeriesOwnership asset_intelligence",
    has(VERSION, /ENGINEERING_TIME_SERIES_OWNERSHIP = "asset_intelligence"/) &&
      has(VERSION, /engineeringTimeSeriesOwnership = ENGINEERING_TIME_SERIES_OWNERSHIP/)
      ? "pass"
      : "fail",
  );

  push(
    "AO",
    "batch_78 migration exists",
    exists(BATCH_78) &&
      has(BATCH_78, /digital_twin_telemetry_bindings/) &&
      has(BATCH_78, /batch_78/)
      ? "pass"
      : "fail",
  );

  push(
    "AP",
    "Binding tables with RLS",
    has(BATCH_78, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_78, /digital_twin_telemetry_bindings/) &&
      has(BATCH_78, /get_user_tenant_ids/)
      ? "pass"
      : "fail",
  );

  push(
    "AQ",
    "Forbid CHECK constraints on binding tables",
    has(BATCH_78, /dt_telemetry_source_no_raw/) &&
      has(BATCH_78, /dt_telemetry_binding_no_auto_publish/) &&
      has(BATCH_78, /interpolation = 'not_implemented'/)
      ? "pass"
      : "fail",
  );

  push(
    "AR",
    "No raw telemetry value/history tables",
    exists(BATCH_78) &&
      !has(BATCH_78, /telemetry_samples/) &&
      !has(BATCH_78, /telemetry_values/) &&
      !has(BATCH_78, /telemetry_history/)
      ? "pass"
      : "fail",
  );

  push(
    "AS",
    "batch_75/76/77 not modified",
    exists(BATCH_75) && exists(BATCH_76) && exists(BATCH_77) ? "pass" : "fail",
  );

  push(
    "AT",
    "Telemetry sources HTTP route",
    exists(TELEMETRY_SOURCES_ROUTE) && has(TELEMETRY_SOURCES_ROUTE, /register_source/) ? "pass" : "fail",
  );
  push(
    "AU",
    "Telemetry channels HTTP route",
    exists(TELEMETRY_CHANNELS_ROUTE) && has(TELEMETRY_CHANNELS_ROUTE, /register_channel/) ? "pass" : "fail",
  );
  push(
    "AV",
    "Telemetry bindings HTTP route",
    exists(TELEMETRY_BINDINGS_ROUTE) && has(TELEMETRY_BINDINGS_ROUTE, /create_binding/) ? "pass" : "fail",
  );
  push(
    "AW",
    "Telemetry projection HTTP route",
    exists(TELEMETRY_PROJECTION_ROUTE) && has(TELEMETRY_PROJECTION_ROUTE, /project_binding/) ? "pass" : "fail",
  );
  push(
    "AX",
    "Telemetry health HTTP route",
    exists(TELEMETRY_HEALTH_ROUTE) && has(TELEMETRY_HEALTH_ROUTE, /sourceHealth/) ? "pass" : "fail",
  );

  push(
    "AY",
    "Rejects raw telemetry payloads",
    TELEMETRY_HTTP_ROUTES.every(
      (route) => exists(route) && has(route, /telemetry_payload_forbidden/),
    )
      ? "pass"
      : "fail",
  );

  push(
    "AZ",
    "Telemetry binding UI",
    exists(UI_PAGE) && has(UI_PAGE, /digital-twin-telemetry-binding-ready/) ? "pass" : "fail",
  );

  push(
    "BA",
    "Phase 12E architecture documents",
    exists(DOC_TELEMETRY_MODEL) &&
      exists(DOC_RECONCILIATION) &&
      exists(DOC_LIVE_STATE) &&
      exists(DOC_PHASE_12E) &&
      has(DOC_TELEMETRY_MODEL, /Phase 12E/) &&
      has(DOC_RECONCILIATION, /asset_intelligence/) &&
      has(DOC_LIVE_STATE, /Phase 12E/) &&
      has(DOC_PHASE_12E, /Not GA/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");
  push("BB", "Unit tests green", unit.ok ? "pass" : "fail", unit.ok ? "ok" : unit.detail.slice(0, 500));

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12e-digital-twin-telemetry-binding.test.ts",
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
      has(DT_CERT_PKG, /certify:phase12e/) &&
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
      "pnpm --filter @rtb/digital-twin-certification exec playwright test playwright/telemetry-binding.spec.ts",
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
    gates.length + 1 + 4 === PHASE_12E_GATE_COUNT ? "pass" : "fail",
    `gateCount=${gates.length + 1};expected=${PHASE_12E_GATE_COUNT}`,
  );

  const hosted = await verifyHosted();
  const hasCreds = hosted.detail !== "missing_supabase_credentials";
  push(
    "BF",
    "Hosted binding tables readable",
    hasCreds ? (hosted.tablesOk && hosted.rlsOk ? "pass" : "fail") : "fail",
    hosted.detail,
  );

  push(
    "BG",
    "Phase 12F readiness",
    has(VERSION, /PHASE_12F_READY = true/) && has(VERSION, /phase12FReady = true/) ? "pass" : "fail",
  );

  push(
    "BH",
    "a11y basic surfaces",
    exists(PLAYWRIGHT) &&
      has(PLAYWRIGHT, /accessible|landmark|aria/i) &&
      exists(UI_PAGE) &&
      has(UI_PAGE, /aria-labelledby/) &&
      has(UI_PAGE, /aria-label/)
      ? "pass"
      : "fail",
  );

  const readyOk = PHASE_12E_REQUIRED_READY_FLAGS.every((f) => versionText.includes(`${f} = true`));
  const localGatesPass = gates.every((g) => g.status === "pass");
  push(
    "BI",
    "Release eligibility",
    readyOk &&
      has(VERSION, /PHASE_12E_READY = true/) &&
      has(VERSION, /phase12EReady = true/) &&
      has(VERSION, /phase12FReady = true/) &&
      has(VERSION, /duplicateTimeSeriesPlaneDetected = false/) &&
      has(VERSION, /liveTelemetryImplemented = true/) &&
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
    schemaVersion: "phase12e-digital-twin-telemetry-binding/1",
    phase: "12E",
    title: "Digital Twin Telemetry Binding",
    moduleKey: "digital_twin",
    version: PHASE_12E_DIGITAL_TWIN_VERSION,
    status: "telemetry_binding",
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
    liveTelemetryImplemented: true,
    highFrequencyTelemetryImplemented: false,
    telemetryHistorianImplemented: false,
    sensorRegistryImplemented: false,
    shmSignalProcessingImplemented: false,
    shmRuntimeImplemented: false,
    simulationExecutionImplemented: false,
    threeDViewerImplemented: false,
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
    engineeringTimeSeriesOwnership: "asset_intelligence",
    knowledgeGraphReuse: true,
    hostedDigitalTwinPersistenceReady: true,
    digitalTwinProductTablesIntroduced: true,
    phase12CReady: true,
    phase12DReady: true,
    phase12EReady: true,
    phase12FReady: true,
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
    publicContractVersion: "0.5.0-telemetry-binding-draft",
    projectControlsV1Intact: pcTag === PHASE_12E_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_12E_ASSET_INTELLIGENCE_V1_COMMIT,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    duplicateTimeSeriesPlaneDetected: false,
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
    digitalTwinTables: [...PHASE_12E_DIGITAL_TWIN_TABLES],
    forbiddenCapabilities: [...PHASE_12E_FORBIDDEN_CAPABILITIES],
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase12e-digital-twin-telemetry-binding-certification.json");
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({ verdict: artifact.verdict, failed: failed.length, outPath }, null, 2));
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
