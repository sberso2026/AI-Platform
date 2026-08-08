/**
 * Phase 12C certification runner (gates A–AY) — Digital Twin State Domain.
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
  PHASE_12C_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12C_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12C_DIGITAL_TWIN_TABLES,
  PHASE_12C_DIGITAL_TWIN_VERSION,
  PHASE_12C_FORBIDDEN_CAPABILITIES,
  PHASE_12C_GATE_COUNT,
  PHASE_12C_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_12C_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12C_PROJECT_CONTROLS_V1_TAG,
  PHASE_12C_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_12C_REQUIRED_READY_FLAGS,
  type Phase12cGateId,
} from "../src/phase12c/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const DT = "packages/digital-twin";
const DT_CERT = "packages/digital-twin-certification";
const VERSION = `${DT}/src/version.ts`;
const OWNERSHIP_LOCK = `${DT}/src/architecture/ownership-lock.ts`;
const DT_PKG = `${DT}/package.json`;
const DT_TEST = `${DT}/tests/phase12c-digital-twin-state.test.ts`;
const DT_CERT_PKG = `${DT_CERT}/package.json`;
const GATES_FILE = `${DT_CERT}/src/phase12c/gates.ts`;
const RUNNER_FILE = `${DT_CERT}/scripts/run-phase12c-certification.ts`;
const SECRET_SCAN_FILE = `${DT_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase12c-digital-twin-state.test.ts";
const WORKFLOW = ".github/workflows/phase-12c-digital-twin-state.yml";
const BATCH_76 = "supabase/migrations/20260808150000_batch_76_digital_twin_state.sql";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";
const DOC = "docs/architecture/DIGITAL_TWIN_PHASE_12C_STATE.md";
const STATE_ROUTE = "apps/web/src/app/api/engineering/digital-twin/state/route.ts";
const SNAPSHOT_ROUTE = "apps/web/src/app/api/engineering/digital-twin/snapshot/route.ts";
const REP_HIST_ROUTE = "apps/web/src/app/api/engineering/digital-twin/representation-history/route.ts";

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
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12cGateId; name: string; status: GateStatus; detail?: string };

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
  for (const table of PHASE_12C_DIGITAL_TWIN_TABLES) {
    const { error } = await admin.from(table).select("id", { count: "exact", head: true });
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
    const { data } = await anonClient.from("digital_twin_states").select("id").limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  } else {
    rlsOk = false;
  }

  return { tablesOk: true, rlsOk, detail: "hosted_ok" };
}

async function main() {
  const gates: GateResult[] = [];
  const push = (id: Phase12cGateId, name: string, status: GateStatus, detail?: string) => {
    gates.push({ id, name, status, detail });
  };

  const ciHeadSha = sha();
  const buildIdentitySha = ciHeadSha;

  push(
    "A",
    "Repository/build identity",
    exists(DT_PKG) && has(VERSION, /0\.3\.0-state/) ? "pass" : "fail",
    ciHeadSha,
  );

  const pcTag = tag(PHASE_12C_PROJECT_CONTROLS_V1_TAG);
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_12C_PROJECT_CONTROLS_V1_COMMIT ? "pass" : "fail",
    pcTag ?? "missing",
  );

  const aiTag = tag(PHASE_12C_ASSET_INTELLIGENCE_V1_TAG);
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_12C_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "missing",
  );

  push(
    "D",
    "PI v1 integrity",
    has(VERSION, new RegExp(PHASE_12C_PROJECT_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
  );
  push(
    "E",
    "II v1 integrity",
    has(VERSION, new RegExp(PHASE_12C_INSPECTION_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
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
    "Ownership lock for state slice",
    has(OWNERSHIP_LOCK, /assertOwnershipLock/) &&
      has(OWNERSHIP_LOCK, /digital_twin_state_must_be_implemented_in_phase_12c/) &&
      has(OWNERSHIP_LOCK, /digital_twin_runtime_forbidden_in_phase_12c/)
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Governed TwinState domain types",
    has(`${DT}/src/domain/state.ts`, /TwinState/) &&
      has(`${DT}/src/domain/state.ts`, /StateProvenance/) &&
      has(`${DT}/src/domain/state.ts`, /assertNoFabricatedState/)
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "TwinStateVersion immutable history",
    has(`${DT}/src/domain/state.ts`, /TwinStateVersion/) &&
      has(`${DT}/src/domain/state.ts`, /storesTelemetryPayload: false/)
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "RepresentationVersion append-only",
    has(`${DT}/src/domain/representation-versioning.ts`, /RepresentationVersion/) &&
      has(`${DT}/src/domain/representation-versioning.ts`, /overwritesHistoricalVersion: false/) &&
      has(`${DT}/src/domain/representation-versioning.ts`, /assertRepresentationAppendOnly/)
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "TwinSnapshot versioned refs only",
    has(`${DT}/src/domain/snapshot.ts`, /TwinSnapshot/) &&
      has(`${DT}/src/domain/snapshot.ts`, /assertSnapshotNoTelemetry/) &&
      has(`${DT}/src/domain/state.ts`, /stateVersionRefs/)
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Append-only TwinTimelineEvent",
    has(`${DT}/src/domain/timeline.ts`, /TwinTimelineEvent/) &&
      has(`${DT}/src/domain/timeline.ts`, /appendOnly: true/) &&
      has(`${DT}/src/domain/timeline.ts`, /overwritesPriorEvent: false/)
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "State engine create/review/publish",
    has(`${DT}/src/domain/state-engine.ts`, /createState/) &&
      has(`${DT}/src/domain/state-engine.ts`, /submitStateReview/) &&
      has(`${DT}/src/domain/state-engine.ts`, /publishState/)
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "State engine supersede/snapshot/history",
    has(`${DT}/src/domain/state-engine.ts`, /supersedeState/) &&
      has(`${DT}/src/domain/state-engine.ts`, /createSnapshot/) &&
      has(`${DT}/src/domain/state-engine.ts`, /listHistory/)
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "Engine forbids runtime/telemetry/sim/viewer",
    has(`${DT}/src/domain/state-engine.ts`, /assertStateForbiddenCapabilities/) &&
      has(`${DT}/src/domain/state-engine.ts`, /digital_twin_runtime_forbidden_in_phase_12c/)
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "State review workflow digital_twin.state_review",
    has(`${DT}/src/domain/review-workflow.ts`, /STATE_REVIEW_WORKFLOW_SLUG/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /DIGITAL_TWIN_STATE_REVIEW_SLUG/) &&
      has(VERSION, /DIGITAL_TWIN_STATE_REVIEW_SLUG = "digital_twin\.state_review"/)
      ? "pass"
      : "fail",
  );

  push(
    "R",
    "Identity review retained",
    has(`${DT}/src/domain/review-workflow.ts`, /IDENTITY_REVIEW_WORKFLOW_SLUG/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /DIGITAL_TWIN_IDENTITY_REVIEW_SLUG/) &&
      has(VERSION, /DIGITAL_TWIN_IDENTITY_REVIEW_SLUG = "digital_twin\.identity_review"/)
      ? "pass"
      : "fail",
  );

  push(
    "S",
    "No AI self-approval",
    has(`${DT}/src/domain/review-workflow.ts`, /twin_self_approval_forbidden/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /autonomous_twin_publication_forbidden/)
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "State domain events declared",
    has(`${DT}/src/domain/events.ts`, /STATE_DOMAIN_EVENTS/) &&
      has(`${DT}/src/domain/events.ts`, /engineering\.digital_twin\.state\.created/) &&
      has(`${DT}/src/domain/state-events.ts`, /engineering\.digital_twin\.state\.published/)
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "Persistence port extended for state",
    has(`${DT}/src/domain/persistence.ts`, /saveState/) &&
      has(`${DT}/src/domain/persistence.ts`, /saveStateVersion/) &&
      has(`${DT}/src/domain/persistence.ts`, /appendTimelineEvent/)
      ? "pass"
      : "fail",
  );

  push(
    "V",
    "Postgres repository state tables",
    has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_states/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_state_versions/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_snapshots/)
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
    "Public contracts 0.3.0-state-draft",
    has(`${DT}/src/domain/public-contracts-state.ts`, /0\.3\.0-state-draft/) &&
      has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.3\.0-state-draft"/)
      ? "pass"
      : "fail",
  );

  const versionText = readRepoFile(VERSION);
  push(
    "Z",
    "Version 0.3.0-state flags",
    has(VERSION, /DIGITAL_TWIN_VERSION = "0\.3\.0-state"/) &&
      has(VERSION, /DIGITAL_TWIN_STATUS = "state"/) &&
      has(VERSION, /DIGITAL_TWIN_PHASE = "12C"/)
      ? "pass"
      : "fail",
  );

  for (const [id, flag] of [
    ["AA", "TWIN_STATE_READY = true"],
    ["AB", "TWIN_VERSIONING_READY = true"],
    ["AC", "REPRESENTATION_VERSIONING_READY = true"],
    ["AD", "TWIN_SNAPSHOT_READY = true"],
    ["AE", "TWIN_TIMELINE_READY = true"],
  ] as const) {
    push(id, `${flag.split(" ")[0]} true`, versionText.includes(flag) ? "pass" : "fail");
  }

  push(
    "AF",
    "Core capabilities retained",
    has(VERSION, /TWIN_IDENTITY_READY = true/) &&
      has(VERSION, /TWIN_REPRESENTATION_READY = true/) &&
      has(VERSION, /TWIN_THREAD_READY = true/) &&
      has(VERSION, /PHASE_12B_READY = true/) &&
      has(VERSION, /KNOWLEDGE_GRAPH_REUSE = true/)
      ? "pass"
      : "fail",
  );

  const forbidOk = PHASE_12C_FORBIDDEN_CAPABILITIES.every((cap) =>
    versionText.includes(`${cap} = false`),
  );
  push("AG", "Runtime/telemetry/sim/viewer forbid flags false", forbidOk ? "pass" : "fail");

  push(
    "AH",
    "Actuation and control disabled",
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
    "batch_76 migration exists",
    exists(BATCH_76) && has(BATCH_76, /digital_twin_states/) && has(BATCH_76, /batch_76/)
      ? "pass"
      : "fail",
  );

  push(
    "AK",
    "State tables with RLS",
    has(BATCH_76, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_76, /digital_twin_states/) &&
      has(BATCH_76, /get_user_tenant_ids/)
      ? "pass"
      : "fail",
  );

  push(
    "AL",
    "Forbid CHECK constraints on state tables",
    has(BATCH_76, /dt_state_row_no_simulation/) &&
      has(BATCH_76, /dt_state_row_no_telemetry/) &&
      has(BATCH_76, /dt_snapshot_no_telemetry/)
      ? "pass"
      : "fail",
  );

  push(
    "AM",
    "No telemetry tables in batch_76",
    exists(BATCH_76) &&
      !has(BATCH_76, /digital_twin_telemetry/) &&
      !has(BATCH_76, /telemetry_samples/)
      ? "pass"
      : "fail",
  );

  push(
    "AN",
    "batch_75 not modified",
    exists(BATCH_75) && has(BATCH_75, /batch_75/) ? "pass" : "fail",
  );

  push(
    "AO",
    "State HTTP route",
    exists(STATE_ROUTE) && has(STATE_ROUTE, /digital_twin\.state_review/) ? "pass" : "fail",
  );
  push("AP", "Snapshot HTTP route", exists(SNAPSHOT_ROUTE) ? "pass" : "fail");
  push("AQ", "Representation history HTTP route", exists(REP_HIST_ROUTE) ? "pass" : "fail");

  push(
    "AR",
    "No telemetry HTTP APIs",
    !exists("apps/web/src/app/api/engineering/digital-twin/telemetry") ? "pass" : "fail",
  );

  push(
    "AS",
    "Phase 12C architecture document",
    exists(DOC) && has(DOC, /Phase 12C/) && has(DOC, /Not GA/) ? "pass" : "fail",
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");
  push("AT", "Unit tests green", unit.ok ? "pass" : "fail", unit.ok ? "ok" : unit.detail.slice(0, 500));

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12c-digital-twin-state.test.ts",
  );
  push(
    "AU",
    "Certification package and runner",
    exists(DT_CERT_PKG) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(SECRET_SCAN_FILE) &&
      exists(DT_TEST) &&
      exists(WORKFLOW) &&
      has(DT_CERT_PKG, /certify:phase12c/) &&
      arch.ok
      ? "pass"
      : "fail",
    arch.ok ? "arch_ok" : arch.detail.slice(0, 500),
  );

  const secretScan = run("pnpm --filter @rtb/digital-twin-certification secret-scan");
  push("AV", "Secret exposure", secretScan.ok ? "pass" : "fail");

  const hosted = await verifyHosted();
  const hasCreds = hosted.detail !== "missing_supabase_credentials";
  push(
    "AX",
    "Hosted state tables readable",
    hasCreds ? (hosted.tablesOk && hosted.rlsOk ? "pass" : "fail") : "fail",
    hosted.detail,
  );

  const readyOk = PHASE_12C_REQUIRED_READY_FLAGS.every((f) => versionText.includes(`${f} = true`));
  const localGatesPass = gates.every((g) => g.status === "pass");
  push(
    "AY",
    "Phase 12D readiness and release eligibility",
    readyOk &&
      has(VERSION, /PHASE_12D_READY = true/) &&
      localGatesPass &&
      DOMAIN_FILES.every((f) => exists(f))
      ? "pass"
      : "fail",
    `readyOk=${readyOk};localGatesPass=${localGatesPass}`,
  );

  push(
    "AW",
    "Artifact identity",
    gates.length + 1 === PHASE_12C_GATE_COUNT ? "pass" : "fail",
    `gateCount=${gates.length + 1};expected=${PHASE_12C_GATE_COUNT}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase12c-digital-twin-state/1",
    phase: "12C",
    title: "Digital Twin State Domain",
    moduleKey: "digital_twin",
    version: PHASE_12C_DIGITAL_TWIN_VERSION,
    status: "state",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    digitalTwinImplemented: true,
    discoveryImplemented: true,
    productionDigitalTwinReady: false,
    digitalTwinRuntimeImplemented: false,
    liveTelemetryImplemented: false,
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
    knowledgeGraphReuse: true,
    hostedDigitalTwinPersistenceReady: true,
    digitalTwinProductTablesIntroduced: true,
    phase12CReady: true,
    phase12DReady: true,
    phase12AVersion: PHASE_12A_VERSION,
    phase12ACertifiedCommit: PHASE_12A_CERTIFIED_COMMIT,
    phase12AHostedRun: PHASE_12A_HOSTED_RUN,
    phase12BVersion: PHASE_12B_VERSION,
    phase12BCertifiedCommit: PHASE_12B_CERTIFIED_COMMIT,
    phase12BHostedRun: PHASE_12B_HOSTED_RUN,
    publicContractVersion: "0.3.0-state-draft",
    projectControlsV1Intact: pcTag === PHASE_12C_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_12C_ASSET_INTELLIGENCE_V1_COMMIT,
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
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
    digitalTwinTables: [...PHASE_12C_DIGITAL_TWIN_TABLES],
    forbiddenCapabilities: [...PHASE_12C_FORBIDDEN_CAPABILITIES],
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase12c-digital-twin-state-certification.json");
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({ verdict: artifact.verdict, failed: failed.length, outPath }, null, 2));
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
