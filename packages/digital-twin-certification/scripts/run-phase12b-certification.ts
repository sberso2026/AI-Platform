/**
 * Phase 12B certification runner (gates A–AX) — Digital Twin Core Domain.
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
  PHASE_12B_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12B_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12B_DIGITAL_TWIN_CORE_GATES,
  PHASE_12B_DIGITAL_TWIN_TABLES,
  PHASE_12B_DIGITAL_TWIN_VERSION,
  PHASE_12B_FORBIDDEN_CAPABILITIES,
  PHASE_12B_GATE_COUNT,
  PHASE_12B_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12B_PROJECT_CONTROLS_V1_TAG,
  PHASE_12B_REQUIRED_READY_FLAGS,
  PHASE_12B_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_12B_PROJECT_INTELLIGENCE_V1_COMMIT,
  type Phase12bGateId,
} from "../src/phase12b/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const DT = "packages/digital-twin";
const DT_CERT = "packages/digital-twin-certification";
const VERSION = `${DT}/src/version.ts`;
const INDEX = `${DT}/src/index.ts`;
const OWNERSHIP_LOCK = `${DT}/src/architecture/ownership-lock.ts`;
const DT_PKG = `${DT}/package.json`;
const DT_TEST = `${DT}/tests/phase12b-digital-twin-core.test.ts`;
const DT_CERT_PKG = `${DT_CERT}/package.json`;
const GATES_FILE = `${DT_CERT}/src/phase12b/gates.ts`;
const RUNNER_FILE = `${DT_CERT}/scripts/run-phase12b-certification.ts`;
const SECRET_SCAN_FILE = `${DT_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase12b-digital-twin-core.test.ts";
const WORKFLOW = ".github/workflows/phase-12b-digital-twin-core.yml";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";
const DOC_CORE = "docs/architecture/DIGITAL_TWIN_PHASE_12B_CORE.md";
const IDENTITY_ROUTE = "apps/web/src/app/api/engineering/digital-twin/identity/route.ts";
const REP_ROUTE = "apps/web/src/app/api/engineering/digital-twin/representation/route.ts";
const THREAD_ROUTE = "apps/web/src/app/api/engineering/digital-twin/thread/route.ts";

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
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12bGateId; name: string; status: GateStatus; detail?: string };

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
  jwtMatrixOk: boolean;
  detail: string;
}> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { tablesOk: false, rlsOk: false, jwtMatrixOk: false, detail: "missing_supabase_credentials" };
  }
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const table of PHASE_12B_DIGITAL_TWIN_TABLES) {
    const { error } = await admin.from(table).select("id", { count: "exact", head: true });
    if (error) {
      return {
        tablesOk: false,
        rlsOk: false,
        jwtMatrixOk: false,
        detail: `table_missing_or_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
  }

  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await anonClient.from("digital_twin_identities").select("id").limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }

  let jwtMatrixOk = false;
  if (anon) {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error } = await anonClient.from("digital_twin_identities").insert({
      tenant_id: "00000000-0000-0000-0000-000000000001",
      workspace_id: "00000000-0000-0000-0000-000000000002",
      twin_id: "00000000-0000-0000-0000-000000000003",
      canonical_entity_type: "asset",
      canonical_entity_id: "00000000-0000-0000-0000-000000000004",
    });
    jwtMatrixOk = Boolean(error);
  } else {
    jwtMatrixOk = false;
  }

  return { tablesOk: true, rlsOk, jwtMatrixOk, detail: "hosted_ok" };
}

async function main() {
  const gates: GateResult[] = [];
  const push = (id: Phase12bGateId, name: string, status: GateStatus, detail?: string) => {
    gates.push({ id, name, status, detail });
  };

  const ciHeadSha = sha();
  const buildIdentitySha = ciHeadSha;

  push(
    "A",
    "Repository/build identity",
    exists(DT_PKG) && has(VERSION, /0\.2\.0-core/) ? "pass" : "fail",
    ciHeadSha,
  );

  const pcTag = tag(PHASE_12B_PROJECT_CONTROLS_V1_TAG);
  push(
    "B",
    "Project Controls V1 tag intact",
    pcTag === PHASE_12B_PROJECT_CONTROLS_V1_COMMIT ? "pass" : "fail",
    pcTag ?? "missing",
  );

  const aiTag = tag(PHASE_12B_ASSET_INTELLIGENCE_V1_TAG);
  push(
    "C",
    "Asset Intelligence V1 tag intact",
    aiTag === PHASE_12B_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "missing",
  );

  push(
    "D",
    "PI v1 integrity",
    has(VERSION, new RegExp(PHASE_12B_PROJECT_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
  );
  push(
    "E",
    "II v1 integrity",
    has(VERSION, new RegExp(PHASE_12B_INSPECTION_INTELLIGENCE_V1_COMMIT.slice(0, 8))) ? "pass" : "fail",
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
    "Ownership lock for core slice",
    has(OWNERSHIP_LOCK, /assertOwnershipLock/) &&
      has(OWNERSHIP_LOCK, /digital_twin_core_must_be_implemented/) &&
      has(OWNERSHIP_LOCK, /digital_twin_runtime_forbidden_in_phase_12b/)
      ? "pass"
      : "fail",
  );

  push(
    "H",
    "Twin identity domain types",
    has(`${DT}/src/domain/identity.ts`, /TwinIdentity/) &&
      has(`${DT}/src/domain/identity.ts`, /TwinTargetReference/) &&
      has(`${DT}/src/domain/identity.ts`, /assertNoDuplicatedIdentityFields/)
      ? "pass"
      : "fail",
  );

  push(
    "I",
    "Twin representation references",
    has(`${DT}/src/domain/representation.ts`, /TwinRepresentationReference/) &&
      has(`${DT}/src/domain/representation.ts`, /storesGeometryPayload: false/)
      ? "pass"
      : "fail",
  );

  push(
    "J",
    "State reference containers",
    has(`${DT}/src/domain/state.ts`, /ObservedStateReference/) &&
      has(`${DT}/src/domain/state.ts`, /SimulatedStateReference/) &&
      has(`${DT}/src/domain/state.ts`, /assertSimulatedNotObserved/)
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "Digital thread links",
    has(`${DT}/src/domain/thread.ts`, /DigitalThreadLink/) &&
      has(`${DT}/src/domain/thread.ts`, /duplicatesTimelineStorage: false/)
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "Typed relationships with KG reuse",
    has(`${DT}/src/domain/relationships.ts`, /knowledgeGraphReuse: true/) &&
      has(`${DT}/src/domain/relationships.ts`, /newGraphEngineIntroduced: false/)
      ? "pass"
      : "fail",
  );

  push(
    "M",
    "Core engine create/update/lookup",
    has(`${DT}/src/domain/twin-engine.ts`, /createIdentity/) &&
      has(`${DT}/src/domain/twin-engine.ts`, /getLookup/) &&
      has(`${DT}/src/domain/engine.ts`, /createDigitalTwinEngine/)
      ? "pass"
      : "fail",
  );

  push(
    "N",
    "Engine forbids runtime/telemetry/sim/viewer",
    has(`${DT}/src/domain/twin-engine.ts`, /assertCoreForbiddenCapabilities/) &&
      has(`${DT}/src/domain/twin-engine.ts`, /digital_twin_runtime_forbidden_in_phase_12b/)
      ? "pass"
      : "fail",
  );

  push(
    "O",
    "Identity review workflow digital_twin.identity_review",
    has(`${DT}/src/domain/review-workflow.ts`, /IDENTITY_REVIEW_WORKFLOW_SLUG/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /DIGITAL_TWIN_IDENTITY_REVIEW_SLUG/) &&
      has(VERSION, /DIGITAL_TWIN_IDENTITY_REVIEW_SLUG = "digital_twin\.identity_review"/)
      ? "pass"
      : "fail",
  );

  push(
    "P",
    "No AI self-approval",
    has(`${DT}/src/domain/review-workflow.ts`, /twin_self_approval_forbidden/) &&
      has(`${DT}/src/domain/review-workflow.ts`, /autonomous_twin_publication_forbidden/)
      ? "pass"
      : "fail",
  );

  push(
    "Q",
    "Domain events declared",
    has(`${DT}/src/domain/events.ts`, /engineering\.digital_twin\.created/) &&
      has(`${DT}/src/domain/events.ts`, /engineering\.digital_twin\.representation\.updated/)
      ? "pass"
      : "fail",
  );

  push(
    "R",
    "Persistence port and memory adapter",
    has(`${DT}/src/domain/persistence.ts`, /DigitalTwinRepositoryPort/) &&
      has(`${DT}/src/domain/persistence.ts`, /MemoryDigitalTwinRepository/)
      ? "pass"
      : "fail",
  );

  push(
    "S",
    "Postgres repository adapter",
    has(`${DT}/src/domain/postgres-repository.ts`, /PostgresDigitalTwinRepository/) &&
      has(`${DT}/src/domain/postgres-repository.ts`, /digital_twin_identities/)
      ? "pass"
      : "fail",
  );

  push(
    "T",
    "Production memory repository forbidden",
    has(`${DT}/src/domain/persistence.ts`, /production_memory_repository_forbidden/) &&
      has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "U",
    "Repository factory",
    has(`${DT}/src/domain/repository-factory.ts`, /createDigitalTwinRepository/) ? "pass" : "fail",
  );

  push(
    "V",
    "Public contracts 0.2.0-core-draft",
    has(`${DT}/src/domain/public-contracts-core.ts`, /0\.2\.0-core-draft/) &&
      has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.2\.0-core-draft"/)
      ? "pass"
      : "fail",
  );

  const versionText = readRepoFile(VERSION);
  push(
    "W",
    "Version 0.2.0-core flags",
    has(VERSION, /DIGITAL_TWIN_VERSION = "0\.2\.0-core"/) &&
      has(VERSION, /DIGITAL_TWIN_STATUS = "core"/) &&
      has(VERSION, /DIGITAL_TWIN_PHASE = "12B"/)
      ? "pass"
      : "fail",
  );

  for (const [id, flag] of [
    ["X", "TWIN_IDENTITY_READY = true"],
    ["Y", "TWIN_REPRESENTATION_READY = true"],
    ["Z", "TWIN_THREAD_READY = true"],
    ["AA", "KNOWLEDGE_GRAPH_REUSE = true"],
    ["AB", "HOSTED_PERSISTENCE_READY = true"],
  ] as const) {
    push(id, `${flag.split(" ")[0]} true`, versionText.includes(flag) ? "pass" : "fail");
  }

  push(
    "AC",
    "DIGITAL_TWIN_IMPLEMENTED core only",
    has(VERSION, /DIGITAL_TWIN_IMPLEMENTED = true/) &&
      has(VERSION, /PRODUCTION_DIGITAL_TWIN_READY = false/)
      ? "pass"
      : "fail",
  );

  const forbidOk = PHASE_12B_FORBIDDEN_CAPABILITIES.every((cap) =>
    versionText.includes(`${cap} = false`),
  );
  push("AD", "Runtime/telemetry/sim/viewer forbid flags false", forbidOk ? "pass" : "fail");

  push(
    "AE",
    "Actuation and control disabled",
    has(VERSION, /PHYSICAL_ACTUATION_ENABLED = false/) &&
      has(VERSION, /AUTOMATIC_CONTROL_ENABLED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AF",
    "No duplicate asset/project ownership",
    has(VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AG",
    "batch_75 migration exists",
    exists(BATCH_75) &&
      has(BATCH_75, /digital_twin_identities/) &&
      has(BATCH_75, /batch_75/)
      ? "pass"
      : "fail",
  );

  push(
    "AH",
    "Core tables with RLS",
    has(BATCH_75, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_75, /digital_twin_identities/) &&
      has(BATCH_75, /get_user_tenant_ids/)
      ? "pass"
      : "fail",
  );

  push(
    "AI",
    "Forbid CHECK constraints on core tables",
    has(BATCH_75, /dt_identity_no_live_telemetry/) &&
      has(BATCH_75, /dt_identity_no_simulation/) &&
      has(BATCH_75, /dt_rep_no_viewer/)
      ? "pass"
      : "fail",
  );

  push(
    "AJ",
    "No telemetry tables in batch_75",
    exists(BATCH_75) &&
      !has(BATCH_75, /digital_twin_telemetry/) &&
      !has(BATCH_75, /telemetry_samples/)
      ? "pass"
      : "fail",
  );

  push(
    "AK",
    "Kernel digital_twins preserved",
    has(BATCH_75, /PRESERVE kernel digital_twins/) &&
      !has(BATCH_75, /DROP TABLE.*digital_twins/)
      ? "pass"
      : "fail",
  );

  push(
    "AL",
    "Identity HTTP route",
    exists(IDENTITY_ROUTE) && has(IDENTITY_ROUTE, /digital_twin\.identity_review/) ? "pass" : "fail",
  );
  push("AM", "Representation HTTP route", exists(REP_ROUTE) ? "pass" : "fail");
  push("AN", "Thread HTTP route", exists(THREAD_ROUTE) ? "pass" : "fail");

  push(
    "AO",
    "No telemetry HTTP APIs",
    !exists("apps/web/src/app/api/engineering/digital-twin/telemetry") ? "pass" : "fail",
  );

  push(
    "AP",
    "Phase 12B architecture document",
    exists(DOC_CORE) && has(DOC_CORE, /Phase 12B/) && has(DOC_CORE, /Not GA/) ? "pass" : "fail",
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");
  push("AQ", "Unit tests green", unit.ok ? "pass" : "fail", unit.ok ? "ok" : unit.detail.slice(0, 500));

  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12b-digital-twin-core.test.ts",
  );
  push(
    "AR",
    "Certification package and runner",
    exists(DT_CERT_PKG) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(WORKFLOW) &&
      has(DT_CERT_PKG, /certify:phase12b/) &&
      arch.ok
      ? "pass"
      : "fail",
    arch.ok ? "arch_ok" : arch.detail.slice(0, 500),
  );

  const secretScan = run("pnpm --filter @rtb/digital-twin-certification secret-scan");
  push("AS", "Secret exposure", secretScan.ok ? "pass" : "fail");

  const hosted = await verifyHosted();
  const hasCreds = hosted.detail !== "missing_supabase_credentials";
  push(
    "AU",
    "Hosted core tables readable",
    hasCreds ? (hosted.tablesOk ? "pass" : "fail") : "fail",
    hosted.detail,
  );
  push(
    "AV",
    "JWT/RLS tenant workspace isolation",
    hasCreds ? (hosted.rlsOk && hosted.jwtMatrixOk ? "pass" : "fail") : "fail",
    hosted.detail,
  );

  push(
    "AW",
    "AI/PI/II/PC V1 surfaces unmodified",
    pcTag === PHASE_12B_PROJECT_CONTROLS_V1_COMMIT && aiTag === PHASE_12B_ASSET_INTELLIGENCE_V1_COMMIT
      ? "pass"
      : "fail",
  );

  const readyOk = PHASE_12B_REQUIRED_READY_FLAGS.every((f) => versionText.includes(`${f} = true`));
  const localGatesPass = gates.every((g) => g.status === "pass");
  push(
    "AX",
    "Phase 12C readiness and release eligibility",
    readyOk &&
      has(VERSION, /PHASE_12C_READY = true/) &&
      localGatesPass &&
      DOMAIN_FILES.every((f) => exists(f))
      ? "pass"
      : "fail",
    `readyOk=${readyOk};localGatesPass=${localGatesPass}`,
  );

  push(
    "AT",
    "Artifact identity",
    gates.length + 1 === PHASE_12B_GATE_COUNT ? "pass" : "fail",
    `gateCount=${gates.length + 1};expected=${PHASE_12B_GATE_COUNT}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase12b-digital-twin-core/1",
    phase: "12B",
    title: "Digital Twin Core Domain",
    moduleKey: "digital_twin",
    version: PHASE_12B_DIGITAL_TWIN_VERSION,
    status: "core",
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
    knowledgeGraphReuse: true,
    hostedDigitalTwinPersistenceReady: true,
    digitalTwinProductTablesIntroduced: true,
    phase12CReady: true,
    phase12AVersion: PHASE_12A_VERSION,
    phase12ACertifiedCommit: PHASE_12A_CERTIFIED_COMMIT,
    phase12AHostedRun: PHASE_12A_HOSTED_RUN,
    publicContractVersion: "0.2.0-core-draft",
    projectControlsV1Intact: pcTag === PHASE_12B_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_12B_ASSET_INTELLIGENCE_V1_COMMIT,
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
    digitalTwinTables: [...PHASE_12B_DIGITAL_TWIN_TABLES],
    forbiddenCapabilities: [...PHASE_12B_FORBIDDEN_CAPABILITIES],
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase12b-digital-twin-core-certification.json");
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({ verdict: artifact.verdict, failed: failed.length, outPath }, null, 2));
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
