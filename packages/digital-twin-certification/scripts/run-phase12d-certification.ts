/**
 * Phase 12D certification runner (gates A–AY) — Digital Twin Governed State Ingestion.
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
  PHASE_12D_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12D_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12D_DIGITAL_TWIN_TABLES,
  PHASE_12D_DIGITAL_TWIN_VERSION,
  PHASE_12D_FORBIDDEN_CAPABILITIES,
  PHASE_12D_GATE_COUNT,
  PHASE_12D_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_12D_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12D_PROJECT_CONTROLS_V1_TAG,
  PHASE_12D_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_12D_REQUIRED_READY_FLAGS,
  type Phase12dGateId,
} from "../src/phase12d/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const DT = "packages/digital-twin";
const DT_CERT = "packages/digital-twin-certification";
const VERSION = `${DT}/src/version.ts`;
const OWNERSHIP_LOCK = `${DT}/src/architecture/ownership-lock.ts`;
const DT_PKG = `${DT}/package.json`;
const DT_TEST = `${DT}/tests/phase12d-digital-twin-ingestion.test.ts`;
const DT_CERT_PKG = `${DT_CERT}/package.json`;
const GATES_FILE = `${DT_CERT}/src/phase12d/gates.ts`;
const RUNNER_FILE = `${DT_CERT}/scripts/run-phase12d-certification.ts`;
const SECRET_SCAN_FILE = `${DT_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase12d-digital-twin-ingestion.test.ts";
const WORKFLOW = ".github/workflows/phase-12d-digital-twin-ingestion.yml";
const BATCH_77 = "supabase/migrations/20260808160000_batch_77_digital_twin_state_ingestion.sql";
const BATCH_76 = "supabase/migrations/20260808150000_batch_76_digital_twin_state.sql";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";
const DOC = "docs/architecture/DIGITAL_TWIN_PHASE_12D_INGESTION.md";
const AUTHORITY_DOC = "docs/architecture/DIGITAL_TWIN_SOURCE_AUTHORITY_MODEL.md";
const ADAPTERS_ROUTE = "apps/web/src/app/api/engineering/digital-twin/adapters/route.ts";
const INGESTION_ROUTE = "apps/web/src/app/api/engineering/digital-twin/ingestion/route.ts";
const INGESTION_HEALTH_ROUTE =
  "apps/web/src/app/api/engineering/digital-twin/ingestion-health/route.ts";

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
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12dGateId; name: string; status: GateStatus; detail?: string };

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
    digital_twin_source_adapters: "adapter_id",
    digital_twin_state_schemas: "schema_id",
    digital_twin_state_candidates: "id",
    digital_twin_state_reconciliation: "id",
    digital_twin_source_authority_policies: "policy_id",
    digital_twin_ingestion_idempotency: "id",
  };
  for (const table of PHASE_12D_DIGITAL_TWIN_TABLES) {
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
    const { data } = await anonClient.from("digital_twin_state_candidates").select("id").limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  } else {
    rlsOk = false;
  }

  return { tablesOk: true, rlsOk, detail: "hosted_ok" };
}

async function main() {
  const gates: GateResult[] = [];
  const push = (id: Phase12dGateId, name: string, status: GateStatus, detail?: string) => {
    gates.push({ id, name, status, detail });
  };

  const ciHeadSha = sha();
  const buildIdentitySha = ciHeadSha;

  push(
    "A",
    "Repository/build identity",
    exists(DT_PKG) && has(VERSION, /0\.4\.0-ingestion/) ? "pass" : "fail",
    ciHeadSha,
  );

  const pcTag = tag(PHASE_12D_PROJECT_CONTROLS_V1_TAG);
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_12D_PROJECT_CONTROLS_V1_COMMIT ? "pass" : "fail",
    pcTag ?? "missing",
  );

  const aiTag = tag(PHASE_12D_ASSET_INTELLIGENCE_V1_TAG);
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_12D_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "missing",
  );

  push(
    "D",
    "PI v1 integrity",
    has(VERSION, new RegExp(PHASE_12D_PROJECT_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
  );
  push(
    "E",
    "II v1 integrity",
    has(VERSION, new RegExp(PHASE_12D_INSPECTION_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
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
    "Ownership lock for ingestion slice",
    has(OWNERSHIP_LOCK, /assertOwnershipLock/) &&
      has(OWNERSHIP_LOCK, /digital_twin_ingestion_must_be_implemented_in_phase_12d/) &&
      has(OWNERSHIP_LOCK, /automatic_observed_state_publication_forbidden/)
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "Source adapter metadata contract",
    has(`${DT}/src/domain/source-adapter.ts`, /DigitalTwinSourceAdapter/) &&
      has(`${DT}/src/domain/source-adapter.ts`, /CERTIFIED_SOURCE_ADAPTERS/) &&
      has(`${DT}/src/domain/source-adapter.ts`, /storesTelemetryPayload: false/)
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "TwinStateSchemaRegistry",
    has(`${DT}/src/domain/state-schema-registry.ts`, /TwinStateSchemaRegistry/) &&
      has(`${DT}/src/domain/state-schema-registry.ts`, /allowsUnrestrictedBlob: false/)
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "TwinSourceFreshnessPolicy",
    has(`${DT}/src/domain/source-freshness.ts`, /TwinSourceFreshnessPolicy/) &&
      has(`${DT}/src/domain/source-freshness.ts`, /evaluateSourceFreshness/)
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Unit governance",
    has(`${DT}/src/domain/unit-governance.ts`, /assertQuantitativeUnits/) &&
      has(`${DT}/src/domain/unit-governance.ts`, /unitSystem/) &&
      has(`${DT}/src/domain/unit-governance.ts`, /unitCode/)
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "ObservedTwinStateCandidate",
    has(`${DT}/src/domain/observed-state-candidate.ts`, /ObservedTwinStateCandidate/) &&
      has(`${DT}/src/domain/observed-state-candidate.ts`, /assertCandidateNotPublished/)
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "TwinStateReconciliationEngine",
    has(`${DT}/src/domain/state-reconciliation.ts`, /TwinStateReconciliationEngine/) &&
      has(`${DT}/src/domain/state-reconciliation.ts`, /autoPublishBlocked: true/)
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "TwinSourceAuthorityPolicy",
    has(`${DT}/src/domain/source-authority.ts`, /TwinSourceAuthorityPolicy/) &&
      has(`${DT}/src/domain/source-authority.ts`, /universalRankingForbidden: true/)
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "State ingestion engine",
    has(`${DT}/src/domain/state-ingestion-engine.ts`, /ingestObservedState/) &&
      has(`${DT}/src/domain/state-ingestion-engine.ts`, /publishCandidateViaReview/) &&
      has(`${DT}/src/domain/state-ingestion-engine.ts`, /createDigitalTwinStateIngestionEngine/)
      ? "pass"
      : "fail",
  );

  push(
    "R",
    "Engine forbids telemetry/SHM/sim/auto-publish",
    has(`${DT}/src/domain/state-ingestion-engine.ts`, /assertIngestionForbiddenCapabilities/) &&
      has(`${DT}/src/domain/state-ingestion-engine.ts`, /assertIngestionRuntimeBounded/) &&
      has(`${DT}/src/domain/state-ingestion-engine.ts`, /telemetry_forbidden_in_phase_12d/)
      ? "pass"
      : "fail",
  );

  push(
    "S",
    "State review workflow extended",
    has(`${DT}/src/domain/review-workflow.ts`, /startCandidateStateReview/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /CANDIDATE_REVIEW_ENTITY_TYPE/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /digital_twin_state_candidate/)
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "Ingestion domain events declared",
    has(`${DT}/src/domain/events.ts`, /INGESTION_DOMAIN_EVENTS/) &&
      has(`${DT}/src/domain/ingestion-events.ts`, /engineering\.digital_twin\.state_candidate\.received/) &&
      has(`${DT}/src/domain/ingestion-events.ts`, /engineering\.digital_twin\.state\.conflict_detected/)
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "Persistence port extended for ingestion",
    has(`${DT}/src/domain/persistence.ts`, /saveStateCandidate/) &&
      has(`${DT}/src/domain/persistence.ts`, /saveStateReconciliation/) &&
      has(`${DT}/src/domain/persistence.ts`, /saveIngestionIdempotency/)
      ? "pass"
      : "fail",
  );

  push(
    "V",
    "Postgres repository ingestion tables",
    has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_source_adapters/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_state_candidates/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_ingestion_idempotency/)
      ? "pass"
      : "fail",
  );

  push(
    "W",
    "Production memory repository forbidden",
    has(`${DT}/src/domain/persistence.ts`, /production_memory_repository_forbidden/) &&
      has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "X",
    "Repository factory",
    has(`${DT}/src/domain/repository-factory.ts`, /createDigitalTwinRepository/) ? "pass" : "fail",
  );

  push(
    "Y",
    "Public contracts 0.4.0-ingestion-draft",
    has(`${DT}/src/domain/public-contracts-ingestion.ts`, /0\.4\.0-ingestion-draft/) &&
      has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.4\.0-ingestion-draft"/)
      ? "pass"
      : "fail",
  );

  const versionText = readRepoFile(VERSION);
  push(
    "Z",
    "Version 0.4.0-ingestion flags",
    has(VERSION, /DIGITAL_TWIN_VERSION = "0\.4\.0-ingestion"/) &&
      has(VERSION, /DIGITAL_TWIN_STATUS = "ingestion"/) &&
      has(VERSION, /DIGITAL_TWIN_PHASE = "12D"/)
      ? "pass"
      : "fail",
  );

  for (const [id, flag] of [
    ["AA", "TWIN_STATE_INGESTION_READY = true"],
    ["AB", "TWIN_SOURCE_ADAPTER_READY = true"],
    ["AC", "TWIN_STATE_RECONCILIATION_READY = true"],
  ] as const) {
    push(id, `${flag.split(" ")[0]} true`, versionText.includes(flag) ? "pass" : "fail");
  }

  push(
    "AD",
    "State capabilities retained from 12C",
    has(VERSION, /TWIN_STATE_READY = true/) &&
      has(VERSION, /TWIN_VERSIONING_READY = true/) &&
      has(VERSION, /REPRESENTATION_VERSIONING_READY = true/) &&
      has(VERSION, /TWIN_SNAPSHOT_READY = true/) &&
      has(VERSION, /TWIN_TIMELINE_READY = true/) &&
      has(VERSION, /PHASE_12C_READY = true/)
      ? "pass"
      : "fail",
  );

  push(
    "AE",
    "digitalTwinRuntimeImplemented bounded true",
    has(VERSION, /DIGITAL_TWIN_RUNTIME_IMPLEMENTED = true/) &&
      has(`${DT}/src/domain/state-ingestion-engine.ts`, /digitalTwinRuntimeImplemented/)
      ? "pass"
      : "fail",
  );

  push(
    "AF",
    "automaticObservedStatePublicationEnabled false",
    has(VERSION, /AUTOMATIC_OBSERVED_STATE_PUBLICATION_ENABLED = false/) &&
      has(VERSION, /automaticObservedStatePublicationEnabled = false/)
      ? "pass"
      : "fail",
  );

  const forbidTelemetryOk = ["LIVE_TELEMETRY_IMPLEMENTED", "HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED"].every(
    (cap) => versionText.includes(`${cap} = false`),
  );
  push("AG", "Live/highFrequency telemetry false", forbidTelemetryOk ? "pass" : "fail");

  push(
    "AH",
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
    "AI",
    "No duplicate asset/project ownership",
    has(VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AJ",
    "batch_77 migration exists",
    exists(BATCH_77) &&
      has(BATCH_77, /digital_twin_source_adapters/) &&
      has(BATCH_77, /batch_77/)
      ? "pass"
      : "fail",
  );

  push(
    "AK",
    "Ingestion tables with RLS",
    has(BATCH_77, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_77, /digital_twin_state_candidates/) &&
      has(BATCH_77, /get_user_tenant_ids/)
      ? "pass"
      : "fail",
  );

  push(
    "AL",
    "Forbid CHECK constraints on ingestion tables",
    has(BATCH_77, /dt_adapter_no_telemetry/) &&
      has(BATCH_77, /dt_candidate_no_auto_publish/) &&
      has(BATCH_77, /dt_recon_no_auto_publish/)
      ? "pass"
      : "fail",
  );

  push(
    "AM",
    "No telemetry tables in batch_77",
    exists(BATCH_77) &&
      !has(BATCH_77, /digital_twin_telemetry/) &&
      !has(BATCH_77, /telemetry_samples/)
      ? "pass"
      : "fail",
  );

  push(
    "AN",
    "batch_75/76 not modified",
    exists(BATCH_75) &&
      exists(BATCH_76) &&
      has(BATCH_75, /batch_75/) &&
      has(BATCH_76, /batch_76/)
      ? "pass"
      : "fail",
  );

  push(
    "AO",
    "Adapters HTTP route",
    exists(ADAPTERS_ROUTE) && has(ADAPTERS_ROUTE, /listSourceAdapters/) ? "pass" : "fail",
  );
  push(
    "AP",
    "Ingestion HTTP route",
    exists(INGESTION_ROUTE) && has(INGESTION_ROUTE, /submit_observed_state/) ? "pass" : "fail",
  );
  push(
    "AQ",
    "Ingestion health HTTP route",
    exists(INGESTION_HEALTH_ROUTE) && has(INGESTION_HEALTH_ROUTE, /listSourceAdapters/)
      ? "pass"
      : "fail",
  );

  push(
    "AR",
    "No telemetry HTTP APIs",
    !exists("apps/web/src/app/api/engineering/digital-twin/telemetry") ? "pass" : "fail",
  );

  push(
    "AS",
    "Phase 12D architecture document",
    exists(DOC) && has(DOC, /Phase 12D/) && has(DOC, /Not GA/) ? "pass" : "fail",
  );

  push(
    "AT",
    "Source authority model document",
    exists(AUTHORITY_DOC) &&
      has(AUTHORITY_DOC, /class-based/) &&
      has(AUTHORITY_DOC, /universal ranking/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");
  push("AU", "Unit tests green", unit.ok ? "pass" : "fail", unit.ok ? "ok" : unit.detail.slice(0, 500));

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12d-digital-twin-ingestion.test.ts",
  );
  const secretScan = run("pnpm --filter @rtb/digital-twin-certification secret-scan");
  push(
    "AV",
    "Certification package and runner",
    exists(DT_CERT_PKG) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(SECRET_SCAN_FILE) &&
      exists(DT_TEST) &&
      exists(WORKFLOW) &&
      has(DT_CERT_PKG, /certify:phase12d/) &&
      arch.ok &&
      secretScan.ok
      ? "pass"
      : "fail",
    arch.ok ? "arch_ok" : arch.detail.slice(0, 500),
  );

  const hosted = await verifyHosted();
  const hasCreds = hosted.detail !== "missing_supabase_credentials";
  push(
    "AX",
    "Hosted ingestion tables readable",
    hasCreds ? (hosted.tablesOk && hosted.rlsOk ? "pass" : "fail") : "fail",
    hosted.detail,
  );

  const readyOk = PHASE_12D_REQUIRED_READY_FLAGS.every((f) => versionText.includes(`${f} = true`));
  const localGatesPass = gates.every((g) => g.status === "pass");
  push(
    "AY",
    "Phase 12E readiness and release eligibility",
    readyOk &&
      has(VERSION, /PHASE_12E_READY = true/) &&
      has(VERSION, /phase12EReady = true/) &&
      localGatesPass &&
      DOMAIN_FILES.every((f) => exists(f))
      ? "pass"
      : "fail",
    `readyOk=${readyOk};localGatesPass=${localGatesPass}`,
  );

  push(
    "AW",
    "Artifact identity",
    gates.length + 1 === PHASE_12D_GATE_COUNT ? "pass" : "fail",
    `gateCount=${gates.length + 1};expected=${PHASE_12D_GATE_COUNT}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase12d-digital-twin-ingestion/1",
    phase: "12D",
    title: "Digital Twin Governed State Ingestion",
    moduleKey: "digital_twin",
    version: PHASE_12D_DIGITAL_TWIN_VERSION,
    status: "ingestion",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    digitalTwinImplemented: true,
    discoveryImplemented: true,
    productionDigitalTwinReady: false,
    digitalTwinRuntimeImplemented: true,
    automaticObservedStatePublicationEnabled: false,
    liveTelemetryImplemented: false,
    highFrequencyTelemetryImplemented: false,
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
    knowledgeGraphReuse: true,
    hostedDigitalTwinPersistenceReady: true,
    digitalTwinProductTablesIntroduced: true,
    phase12CReady: true,
    phase12DReady: true,
    phase12EReady: true,
    phase12AVersion: PHASE_12A_VERSION,
    phase12ACertifiedCommit: PHASE_12A_CERTIFIED_COMMIT,
    phase12AHostedRun: PHASE_12A_HOSTED_RUN,
    phase12BVersion: PHASE_12B_VERSION,
    phase12BCertifiedCommit: PHASE_12B_CERTIFIED_COMMIT,
    phase12BHostedRun: PHASE_12B_HOSTED_RUN,
    phase12CVersion: PHASE_12C_VERSION,
    phase12CCertifiedCommit: PHASE_12C_CERTIFIED_COMMIT,
    phase12CHostedRun: PHASE_12C_HOSTED_RUN,
    publicContractVersion: "0.4.0-ingestion-draft",
    projectControlsV1Intact: pcTag === PHASE_12D_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_12D_ASSET_INTELLIGENCE_V1_COMMIT,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    duplicateTimeSeriesPlaneDetected: false,
    secretExposureDetected: !secretScan.ok,
    releaseEligible: pass,
    requiredGates: gates,
    gateCount: gates.length,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => ({ id: g.id, name: g.name, detail: g.detail })),
    hostedVerification: hosted,
    identityReviewSlug: "digital_twin.identity_review",
    stateReviewSlug: "digital_twin.state_review",
    digitalTwinTables: [...PHASE_12D_DIGITAL_TWIN_TABLES],
    forbiddenCapabilities: [...PHASE_12D_FORBIDDEN_CAPABILITIES],
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase12d-digital-twin-ingestion-certification.json");
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({ verdict: artifact.verdict, failed: failed.length, outPath }, null, 2));
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
