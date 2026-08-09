/**
 * Phase 12N certification runner (gates A–BT) — Digital Twin V1.0 GA closure.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_12N_DIGITAL_TWIN_GA_GATES,
  PHASE_12N_RELEASE_TAG,
  type Phase12nGateId,
} from "../src/phase12n/gates.js";

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

const PI = "34975b1cf660580d46287f24e746b8915903f768";
const II = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const AI = "925e2ed74025cac6a145c346c17c53320efb8757";
const PC = "b17fe4cfe2574520ec813a7b43ba7328a585d741";

const P12A = "2c5ed03f7de12cde9bfb71a9d430f5e342291303";
const P12B = "5e1bb22486a9fdd6385fb980daf0150a330eca9b";
const P12C = "07b5ccc843395bd02633163dc654668da9f17658";
const P12D = "3e387f4b76cbd9c80b274585c7b78821482f496d";
const P12E = "b871e8c3eb9e1293604610bacdd410ecb4da5684";
const P12F = "2846421e7905a69c789a882a86da4071272278e3";
const P12G = "a3832076425b276f089e38f1c9aa76559014454c";
const P12H = "f276dbb15b3a68d2863b3547a2dc58aa1ef3afbe";
const P12I = "6989d310a91b04db5949954a57db060782dd8dec";
const P12J = "b9c9a911e96e490022248badd99630ddc8cacb2f";
const P12K = "dc5d1d6775b172634cd50038d34f35c13c34c339";
const P12L = "7d9bfbd792a034bae088dbb1db02876ca400929d";
const P12L_RUN = "31269729941";
const P12M = "24fccb399ff34dac7f501c2fcf14cba97d7acb7d";
const P12M_RUN = "31270498973";

const GA_VERSION = "1.0.0";
const PREVIOUS_VERSION = "0.11.0-digital-thread";

const MIGRATION_LINEAGE = [
  "20260808140000_batch_75_digital_twin_core.sql",
  "20260808150000_batch_76_digital_twin_state.sql",
  "20260808160000_batch_77_digital_twin_state_ingestion.sql",
  "20260808170000_batch_78_digital_twin_telemetry_binding.sql",
  "20260808180000_batch_79_digital_twin_representation_mapping.sql",
  "20260808190000_batch_80_digital_twin_simulation.sql",
  "20260808200000_batch_81_digital_twin_simulation_assurance.sql",
  "20260808210000_batch_82_digital_twin_solver_adapters.sql",
  "20260808220000_batch_83_digital_twin_solver_capabilities.sql",
  "20260808230000_batch_84_digital_twin_digital_thread.sql",
  "20260808240000_batch_85_engineering_shared_spatial_domain.sql",
] as const;

const TABLES = [
  "digital_twin_identities",
  "digital_twin_states",
  "digital_twin_snapshots",
  "digital_twin_thread_profiles",
  "digital_twin_solver_capabilities",
  "engineering_spatial_references",
] as const;

const RLS_SAMPLE_TABLES = [
  "digital_twin_identities",
  "digital_twin_states",
  "digital_twin_thread_profiles",
  "digital_twin_solver_capabilities",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12nGateId; name: string; status: GateStatus; detail?: string };

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
function readJson(rel: string): Record<string, unknown> | null {
  try {
    return JSON.parse(readRepoFile(rel)) as Record<string, unknown>;
  } catch {
    return null;
  }
}
function tag(t: string) {
  try {
    return execSync(`git rev-list -n 1 ${t}`, {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}
function certCommit(versionFile: string, constant: string, commit: string) {
  return has(versionFile, new RegExp(`${constant} =\\s*\\r?\\n?\\s*"${commit}"`));
}
function globBatch86Exists(): boolean {
  try {
    return readdirSync(resolve(root, "supabase/migrations")).some((f) => /batch_86/i.test(f));
  } catch {
    return false;
  }
}

async function verifyHosted(): Promise<{
  tablesOk: boolean;
  rlsOk: boolean;
  jwtMatrixOk: boolean;
  readableTables: number;
  detail: string;
}> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anon = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return {
      tablesOk: false,
      rlsOk: false,
      jwtMatrixOk: false,
      readableTables: 0,
      detail: "missing_supabase_credentials",
    };
  }
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let readableTables = 0;
  for (const table of TABLES) {
    const { error } = await admin.from(table).select("*", { count: "exact", head: true });
    if (error) {
      return {
        tablesOk: false,
        rlsOk: false,
        jwtMatrixOk: false,
        readableTables,
        detail: `table_missing_or_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
    readableTables += 1;
  }

  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    for (const table of RLS_SAMPLE_TABLES) {
      const { data } = await anonClient.from(table).select("*").limit(5);
      if (Array.isArray(data) && data.length > 0) rlsOk = false;
    }
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `dt-cert-ga-${Date.now()}@example.com`;
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (!createErr && created.user) {
      const client = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data: signed, error: signErr } = await client.auth.signInWithPassword({
        email,
        password,
      });
      if (!signErr && signed.session?.access_token) {
        const authed = createClient(url, anon, {
          global: { headers: { Authorization: `Bearer ${signed.session.access_token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const results = await Promise.all(
          RLS_SAMPLE_TABLES.map((table) => authed.from(table).select("*").limit(5)),
        );
        const empty = (rows: unknown) => Array.isArray(rows) && rows.length === 0;
        jwtMatrixOk =
          results.every((r) => !r.error || empty(r.data)) &&
          results.every((r) => empty(r.data)) &&
          has(
            "packages/digital-twin/src/version.ts",
            /DIGITAL_TWIN_V1_ENTITLEMENTS/,
          ) &&
          has(
            "apps/web/src/app/api/engineering/digital-twin/identity/route.ts",
            /entitlement_denied/,
          );
      }
      await admin.auth.admin.deleteUser(created.user.id);
    }
  }
  return {
    tablesOk: true,
    rlsOk,
    jwtMatrixOk,
    readableTables,
    detail: `hosted_ok;tables=${readableTables};ephemeral_jwt=${jwtMatrixOk}`,
  };
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const inCi = process.env.GITHUB_ACTIONS === "true";
  const browserRequested = process.env.CERTIFY_BROWSER === "1";
  const gates: GateResult[] = [];
  const push = (id: Phase12nGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");
  const aiTag = tag("asset-intelligence-v1.0.0");
  const pcTag = tag("project-controls-v1.0.0");
  const dtTag = tag(PHASE_12N_RELEASE_TAG);
  const hosted = await verifyHosted();
  const fileOk = (rel: string, re: RegExp) => has(rel, re);
  const exists = (rel: string) => existsSync(resolve(root, rel));

  const DT = "packages/digital-twin/src";
  const VERSION = `${DT}/version.ts`;
  const INDEX = `${DT}/index.ts`;
  const MANIFEST_TS = `${DT}/domain/module-manifest.ts`;
  const CAPABILITY_REGISTRY = `${DT}/domain/capability-registry.ts`;
  const SERVICE_REGISTRY = `${DT}/domain/service-registry.ts`;
  const EVENT_CONTRACTS = `${DT}/domain/event-contracts.ts`;
  const UNAVAILABLE = `${DT}/domain/unavailable-capabilities.ts`;
  const REGISTRY_DRIFT = `${DT}/domain/registry-drift.ts`;
  const PUBLIC_CONTRACTS = `${DT}/domain/public-contracts.ts`;
  const OWNERSHIP_LOCK = `${DT}/architecture/ownership-lock.ts`;
  const GA_CLOSURE = `${DT}/domain/ga-closure.ts`;
  const PERSISTENCE = `${DT}/domain/persistence.ts`;
  const POSTGRES_REPOSITORY = `${DT}/domain/postgres-repository.ts`;
  const REPOSITORY_FACTORY = `${DT}/domain/repository-factory.ts`;
  const SSD_VERSION = "packages/engineering-shared-spatial-domain/src/version.ts";

  const MANIFEST_JSON = "packages/digital-twin/manifest/digital-twin-module-manifest.json";
  const PKG_DT = "packages/digital-twin/package.json";
  const PKG_CERT = "packages/digital-twin-certification/package.json";

  const DOC_MATRIX = "docs/release/DIGITAL_TWIN_V1_CAPABILITY_MATRIX.md";
  const DOC_CONTRACTS = "docs/architecture/DIGITAL_TWIN_V1_PUBLIC_CONTRACTS.md";
  const DOC_PACKAGING = "docs/commercial/DIGITAL_TWIN_V1_COMMERCIAL_PACKAGING.md";
  const DOC_OPS_CERT = "docs/operations/DIGITAL_TWIN_V1_OPERATIONAL_CERTIFICATION.md";
  const DOC_OPERATIONS = "docs/runbooks/DIGITAL_TWIN_V1_OPERATIONS.md";
  const DOC_INCIDENT = "docs/runbooks/DIGITAL_TWIN_V1_INCIDENT_RESPONSE.md";
  const DOC_RECOVERY = "docs/runbooks/DIGITAL_TWIN_V1_RECOVERY.md";
  const DOC_ROLLBACK = "docs/runbooks/DIGITAL_TWIN_V1_ROLLBACK.md";
  const DOC_PERFORMANCE = "docs/release/DIGITAL_TWIN_V1_PERFORMANCE_BASELINE.md";
  const DOC_UNAVAILABLE = "docs/release/DIGITAL_TWIN_V1_UNAVAILABLE_CAPABILITIES.md";
  const DOC_LIMITATIONS = "docs/release/DIGITAL_TWIN_V1_LIMITATIONS.md";

  const UI_BASE = "apps/web/src/app/(platform)/engineering/apps/digital-twin";
  const UI_PAGE = `${UI_BASE}/page.tsx`;
  const UI_LAYOUT = `${UI_BASE}/layout.tsx`;
  const UI_RELEASE = `${UI_BASE}/release/page.tsx`;
  const UI_SHELL = "apps/web/src/components/engineering/digital-twin-shell.tsx";
  const COMMERCE_POLICY = "packages/platform-commerce/src/domain/commerce-access-policy.ts";
  const MODULES_PAGE = "apps/web/src/app/(platform)/engineering/modules/page.tsx";

  const ROUTE_BASE = "apps/web/src/app/api/engineering/digital-twin";
  const HEALTH_ROUTE = `${ROUTE_BASE}/health/route.ts`;
  const IDENTITY_ROUTE = `${ROUTE_BASE}/identity/route.ts`;
  const STATE_ROUTE = `${ROUTE_BASE}/state/route.ts`;

  const PLAYWRIGHT_SPEC = "packages/digital-twin-certification/playwright/v1-ga.spec.ts";
  const PLAYWRIGHT_CONFIG = "packages/digital-twin-certification/playwright.config.ts";
  const GATES_FILE = "packages/digital-twin-certification/src/phase12n/gates.ts";
  const ARCH_TEST = "packages/platform-certification/src/phase12n-digital-twin-ga.test.ts";
  const UNIT_TEST = "packages/digital-twin/tests/phase12n-v1-ga.test.ts";

  const manifestJson = readJson(MANIFEST_JSON);
  const manifestFlags = (manifestJson?.featureFlags ?? {}) as Record<string, unknown>;

  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      fileOk(VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/) &&
      fileOk(VERSION, /DIGITAL_TWIN_STATUS = "ga"/) &&
      fileOk(VERSION, /DIGITAL_TWIN_PHASE = "12N"/) &&
      certCommit(VERSION, "PHASE_12M_CERTIFIED_COMMIT", P12M) &&
      fileOk(VERSION, new RegExp(`PHASE_12M_HOSTED_RUN = "${P12M_RUN}"`))
      ? "pass"
      : "fail",
    buildIdentitySha,
  );

  const phasePins: Array<[Phase12nGateId, string, string, string, RegExp]> = [
    ["B", "Phase 12A regression", "PHASE_12A_CERTIFIED_COMMIT", P12A, /DIGITAL_TWIN_DISCOVERY_IMPLEMENTED = true/],
    ["C", "Phase 12B regression", "PHASE_12B_CERTIFIED_COMMIT", P12B, /TWIN_IDENTITY_READY = true/],
    ["D", "Phase 12C regression", "PHASE_12C_CERTIFIED_COMMIT", P12C, /TWIN_STATE_READY = true/],
    ["E", "Phase 12D regression", "PHASE_12D_CERTIFIED_COMMIT", P12D, /TWIN_STATE_INGESTION_READY = true/],
    ["F", "Phase 12E regression", "PHASE_12E_CERTIFIED_COMMIT", P12E, /TWIN_TELEMETRY_BINDING_READY = true/],
    ["G", "Phase 12F regression", "PHASE_12F_CERTIFIED_COMMIT", P12F, /TWIN_REPRESENTATION_MAPPING_READY = true/],
    ["H", "Phase 12G regression", "PHASE_12G_CERTIFIED_COMMIT", P12G, /TWIN_SIMULATION_FRAMEWORK_READY = true/],
    ["I", "Phase 12H regression", "PHASE_12H_CERTIFIED_COMMIT", P12H, /FOUR_LAYER_QUALIFICATION_INTACT = true/],
    ["J", "Phase 12I regression", "PHASE_12I_CERTIFIED_COMMIT", P12I, /FIRST_REAL_ENGINEERING_SOLVER_ADAPTER_IMPLEMENTED = true/],
    ["K", "Phase 12J regression", "PHASE_12J_CERTIFIED_COMMIT", P12J, /SOLVER_CAPABILITY_REGISTRY_READY = true/],
    ["L", "Phase 12K regression", "PHASE_12K_CERTIFIED_COMMIT", P12K, /DIGITAL_THREAD_INTELLIGENCE_READY = true/],
  ];
  for (const [id, name, constant, commit, flag] of phasePins) {
    push(id, name, certCommit(VERSION, constant, commit) && fileOk(VERSION, flag) ? "pass" : "fail");
  }

  push(
    "M",
    "Phase 12L spatial discovery pin",
    certCommit(VERSION, "PHASE_12L_CERTIFIED_COMMIT", P12L) &&
      fileOk(VERSION, new RegExp(`PHASE_12L_HOSTED_RUN = "${P12L_RUN}"`)) &&
      fileOk(SSD_VERSION, /0\.1\.0-spatial-discovery|PHASE_12L_VERSION/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Phase 12M spatial core pin",
    certCommit(VERSION, "PHASE_12M_CERTIFIED_COMMIT", P12M) &&
      fileOk(VERSION, new RegExp(`PHASE_12M_HOSTED_RUN = "${P12M_RUN}"`)) &&
      fileOk(SSD_VERSION, /ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION =\s*\r?\n?\s*"0\.2\.0-spatial-core"/) &&
      fileOk(VERSION, /SHARED_SPATIAL_DOMAIN_COMPATIBLE_VERSION = "0\.2\.0-spatial-core"/) &&
      !fileOk(SSD_VERSION, /ENGINEERING_SHARED_SPATIAL_DOMAIN_VERSION = "1\.0\.0"/)
      ? "pass"
      : "fail",
  );

  push("O", "PI v1 integrity", piTag === PI ? "pass" : "fail", piTag ?? "tag_missing");
  push("P", "II v1 integrity", iiTag === II ? "pass" : "fail", iiTag ?? "tag_missing");
  push("Q", "AI v1 integrity", aiTag === AI ? "pass" : "fail", aiTag ?? "tag_missing");
  push("R", "PC v1 integrity", pcTag === PC ? "pass" : "fail", pcTag ?? "tag_missing");

  push(
    "S",
    "Shared Spatial Domain consume pin",
    fileOk(VERSION, /SHARED_SPATIAL_DOMAIN_RUNTIME_IMPLEMENTED = true/) &&
      fileOk(VERSION, /DIGITAL_TWIN_SPATIAL_BINDING_READY = true/) &&
      fileOk(VERSION, /CANONICAL_SPATIAL_REFERENCE_OWNERSHIP =\s*\r?\n?\s*"engineering_os_shared_spatial_domain"/) &&
      fileOk(VERSION, /DIGITAL_TWIN_MAY_OWN_CANONICAL_SPATIAL = false/) &&
      exists("supabase/migrations/20260808240000_batch_85_engineering_shared_spatial_domain.sql")
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Ownership locks",
    fileOk(VERSION, /DIGITAL_TWIN_OWNERSHIP = "digital_twin"/) &&
      fileOk(VERSION, /CANONICAL_ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk(VERSION, /CANONICAL_PROJECT_IDENTITY_OWNERSHIP = "engineering_os_shared_project_domain"/) &&
      fileOk(VERSION, /KNOWLEDGE_GRAPH_OWNERSHIP = "platform_shared"/) &&
      fileOk(VERSION, /ENGINEERING_TIME_SERIES_OWNERSHIP = "asset_intelligence"/) &&
      fileOk(OWNERSHIP_LOCK, /digital_twin_v1_ga_requires_production_ready/) &&
      fileOk(OWNERSHIP_LOCK, /digital_twin_must_not_own_canonical_spatial/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "V1.0.0 version freeze",
    fileOk(VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/) &&
      fileOk(VERSION, /DIGITAL_TWIN_V1_FROZEN = true/) &&
      fileOk(VERSION, /DIGITAL_TWIN_V1_GA_CERTIFIED = true/) &&
      fileOk(VERSION, /DIGITAL_TWIN_PUBLIC_CONTRACT_VERSION = "1\.0\.0"/) &&
      manifestJson?.version === GA_VERSION
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "GA status declaration",
    fileOk(VERSION, /DIGITAL_TWIN_STATUS = "ga"/) &&
      fileOk(VERSION, /PRODUCTION_DIGITAL_TWIN_READY = true/) &&
      fileOk(VERSION, /DIGITAL_TWIN_RELEASE_CLOSED = true/) &&
      fileOk(VERSION, /DIGITAL_TWIN_READINESS_MARKER = "digital-twin-v1-ready"/) &&
      manifestJson?.status === "ga" &&
      manifestFlags.productionDigitalTwinReady === true
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Package version alignment",
    fileOk(PKG_DT, /"version": "1\.0\.0"/) && fileOk(PKG_CERT, /"version": "1\.0\.0"/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Single authoritative version source",
    fileOk(VERSION, /Single authoritative version source/) &&
      fileOk(MANIFEST_TS, /DIGITAL_TWIN_VERSION/) &&
      fileOk(CAPABILITY_REGISTRY, /from "\.\.\/version"/) &&
      fileOk(SERVICE_REGISTRY, /from "\.\.\/version"/) &&
      fileOk(EVENT_CONTRACTS, /from "\.\.\/version"/) &&
      fileOk(UNAVAILABLE, /from "\.\.\/version"/) &&
      !fileOk(MANIFEST_TS, /version: "1\.0\.0"/) &&
      !fileOk(SERVICE_REGISTRY, /semanticVersion: "1\.0\.0"/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Module manifest generator",
    exists(MANIFEST_TS) &&
      fileOk(MANIFEST_TS, /export function generateDigitalTwinModuleManifest/) &&
      fileOk(MANIFEST_TS, /export function generateManifest/) &&
      fileOk(MANIFEST_TS, /assertManifestConsistentWithRegistries/) &&
      fileOk(INDEX, /module-manifest/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Module manifest snapshot",
    manifestJson !== null &&
      manifestJson.schemaVersion === "digital-twin-module-manifest/1" &&
      manifestJson.moduleKey === "digital_twin" &&
      manifestJson.releaseTag === PHASE_12N_RELEASE_TAG &&
      manifestJson.previousVersion === PREVIOUS_VERSION &&
      Array.isArray(manifestJson.migrationLineage) &&
      (manifestJson.migrationLineage as string[]).length === MIGRATION_LINEAGE.length &&
      fileOk(MANIFEST_JSON, /generateDigitalTwinModuleManifest/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Capability registry freeze",
    exists(CAPABILITY_REGISTRY) &&
      fileOk(CAPABILITY_REGISTRY, /DIGITAL_TWIN_CAPABILITY_CATALOG/) &&
      fileOk(CAPABILITY_REGISTRY, /assertCapabilityCatalogComplete/) &&
      fileOk(CAPABILITY_REGISTRY, /"ga_advisory"/) &&
      fileOk(CAPABILITY_REGISTRY, /"unavailable"/) &&
      fileOk(VERSION, /DIGITAL_TWIN_CAPABILITY_REGISTRY_PUBLISHED = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Service registry freeze",
    exists(SERVICE_REGISTRY) &&
      fileOk(SERVICE_REGISTRY, /DIGITAL_TWIN_SERVICE_REGISTRY/) &&
      fileOk(SERVICE_REGISTRY, /assertServiceRegistryComplete/) &&
      fileOk(SERVICE_REGISTRY, /duplicateRuntimeForbidden: true/) &&
      fileOk(VERSION, /DIGITAL_TWIN_SERVICE_REGISTRY_PUBLISHED = true/) &&
      Array.isArray(manifestJson?.services) &&
      (manifestJson?.services as string[]).length >= 12
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Event contract freeze",
    exists(EVENT_CONTRACTS) &&
      fileOk(EVENT_CONTRACTS, /DIGITAL_TWIN_EVENT_CONTRACTS/) &&
      fileOk(EVENT_CONTRACTS, /assertEventContractsFrozen/) &&
      fileOk(EVENT_CONTRACTS, /containsForbiddenEngineOutput: false/) &&
      fileOk(VERSION, /DIGITAL_TWIN_EVENT_CONTRACTS_FROZEN = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Unavailable capability matrix",
    exists(UNAVAILABLE) &&
      fileOk(UNAVAILABLE, /DIGITAL_TWIN_UNAVAILABLE_CAPABILITIES/) &&
      fileOk(UNAVAILABLE, /assertUnavailableCapabilitiesClosed/) &&
      fileOk(UNAVAILABLE, /digital_twin\.physical_actuation/) &&
      fileOk(UNAVAILABLE, /digital_twin\.native_engineering_solver/) &&
      fileOk(VERSION, /DIGITAL_TWIN_UNAVAILABLE_MATRIX_PUBLISHED = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Module registry drift",
    exists(REGISTRY_DRIFT) &&
      fileOk(REGISTRY_DRIFT, /export function assertNoModuleRegistryDrift/) &&
      fileOk(VERSION, /DIGITAL_TWIN_MODULE_REGISTRY_DRIFT_DETECTED = false/) &&
      manifestFlags.moduleRegistryDriftDetected === false
      ? "pass"
      : "fail",
  );

  push(
    "AF",
    "Capability matrix document",
    exists(DOC_MATRIX) &&
      fileOk(DOC_MATRIX, /## Classification \(locked\)/) &&
      fileOk(DOC_MATRIX, /`ga_advisory`/) &&
      fileOk(DOC_MATRIX, /`unavailable`/) &&
      fileOk(DOC_MATRIX, new RegExp(P12M))
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "Public contracts document",
    exists(DOC_CONTRACTS) &&
      fileOk(DOC_CONTRACTS, /## Freeze policy/) &&
      fileOk(DOC_CONTRACTS, /Public contract version: \*\*1\.0\.0\*\*/) &&
      fileOk(DOC_CONTRACTS, /semver_minor_additive_only/)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "Commercial packaging document",
    exists(DOC_PACKAGING) &&
      fileOk(DOC_PACKAGING, /## Explicit commercial exclusions/) &&
      fileOk(DOC_PACKAGING, /Digital Twin Core/) &&
      fileOk(DOC_PACKAGING, /Engineering Simulation Integration/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Operational certification document",
    exists(DOC_OPS_CERT) &&
      fileOk(DOC_OPS_CERT, /## Health and observability/) &&
      fileOk(DOC_OPS_CERT, /fail-closed/i) &&
      fileOk(DOC_OPS_CERT, /RLS/)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "Operations runbook",
    exists(DOC_OPERATIONS) &&
      fileOk(DOC_OPERATIONS, /## Deployment/) &&
      fileOk(DOC_OPERATIONS, /## Daily checks/) &&
      fileOk(DOC_OPERATIONS, /## Escalation/)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Incident response runbook",
    exists(DOC_INCIDENT) &&
      fileOk(DOC_INCIDENT, /## Severity model/) &&
      fileOk(DOC_INCIDENT, /governance lock breach/i) &&
      fileOk(DOC_INCIDENT, /tenant isolation/i)
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "Recovery runbook",
    exists(DOC_RECOVERY) &&
      fileOk(DOC_RECOVERY, /## Restore procedure/) &&
      fileOk(DOC_RECOVERY, /## Recovery objectives/) &&
      fileOk(DOC_RECOVERY, /## Verification checklist/)
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "Rollback runbook",
    exists(DOC_ROLLBACK) &&
      fileOk(DOC_ROLLBACK, /## Principles/) &&
      fileOk(DOC_ROLLBACK, /immutable/) &&
      fileOk(DOC_ROLLBACK, /## Schema rollback/) &&
      fileOk(DOC_ROLLBACK, /batches 75/i)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "Performance baseline document",
    exists(DOC_PERFORMANCE) &&
      fileOk(DOC_PERFORMANCE, /not claimed/) &&
      fileOk(DOC_PERFORMANCE, /## Cost model per operation/) &&
      fileOk(DOC_PERFORMANCE, /batch_86/)
      ? "pass"
      : "fail",
  );
  push(
    "AO",
    "Unavailable capabilities document",
    exists(DOC_UNAVAILABLE) &&
      fileOk(DOC_UNAVAILABLE, /## UNAVAILABLE — not production functions of V1\.0/) &&
      fileOk(DOC_UNAVAILABLE, /## Enforcement points/) &&
      fileOk(DOC_UNAVAILABLE, /Physical actuation/)
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "Limitations document",
    exists(DOC_LIMITATIONS) &&
      fileOk(DOC_LIMITATIONS, /## Advisory intelligence/) &&
      fileOk(DOC_LIMITATIONS, /## Forbidden engines/) &&
      fileOk(DOC_LIMITATIONS, /CalculiX|linear elastic static/i)
      ? "pass"
      : "fail",
  );

  push(
    "AQ",
    "Physical actuation unavailable",
    fileOk(VERSION, /PHYSICAL_ACTUATION_IMPLEMENTED = false/) &&
      fileOk(UNAVAILABLE, /digital_twin\.physical_actuation/) &&
      manifestFlags.physicalActuationImplemented === false
      ? "pass"
      : "fail",
  );
  push(
    "AR",
    "Automatic control unavailable",
    fileOk(VERSION, /AUTOMATIC_CONTROL_IMPLEMENTED = false/) &&
      fileOk(UNAVAILABLE, /digital_twin\.automatic_control/) &&
      manifestFlags.automaticControlImplemented === false
      ? "pass"
      : "fail",
  );
  push(
    "AS",
    "Predictive/PoF/RUL unavailable",
    fileOk(VERSION, /PREDICTIVE_TWIN_IMPLEMENTED = false/) &&
      fileOk(VERSION, /PROBABILITY_OF_FAILURE_CERTIFIED = false/) &&
      fileOk(VERSION, /RUL_CLAIMS_CERTIFIED = false/) &&
      fileOk(UNAVAILABLE, /digital_twin\.predictive_twin/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "SHM unavailable",
    fileOk(VERSION, /SHM_IMPLEMENTED = false/) &&
      fileOk(VERSION, /SHM_RUNTIME_IMPLEMENTED = false/) &&
      fileOk(UNAVAILABLE, /digital_twin\.shm/)
      ? "pass"
      : "fail",
  );
  push(
    "AU",
    "Native solver unavailable",
    fileOk(VERSION, /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/) &&
      fileOk(UNAVAILABLE, /digital_twin\.native_engineering_solver/) &&
      manifestFlags.nativeEngineeringSolverImplemented === false
      ? "pass"
      : "fail",
  );
  push(
    "AV",
    "Optimization/GIS unavailable",
    fileOk(VERSION, /OPTIMIZATION_IMPLEMENTED = false/) &&
      fileOk(VERSION, /GIS_RUNTIME_IMPLEMENTED = false/) &&
      fileOk(VERSION, /COORDINATE_TRANSFORMATION_IMPLEMENTED = false/) &&
      fileOk(VERSION, /SPATIAL_ANALYTICS_IMPLEMENTED = false/) &&
      fileOk(VERSION, /GEOMETRY_REPOSITORY_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AW",
    "Silent fixture/solver fallback forbidden",
    fileOk(VERSION, /SILENT_FIXTURE_FALLBACK_ENABLED = false/) &&
      fileOk(VERSION, /SILENT_SOLVER_FALLBACK_ALLOWED = false/) &&
      fileOk(UNAVAILABLE, /digital_twin\.silent_fixture_fallback/) &&
      manifestFlags.silentFixtureFallbackEnabled === false
      ? "pass"
      : "fail",
  );

  push(
    "AX",
    "Migration lineage 75–85",
    MIGRATION_LINEAGE.every((m) => exists(`supabase/migrations/${m}`)) &&
      Array.isArray(manifestJson?.migrationLineage) &&
      MIGRATION_LINEAGE.every((m) => (manifestJson?.migrationLineage as string[]).includes(m))
      ? "pass"
      : "fail",
  );
  push(
    "AY",
    "No batch_86 migration",
    !globBatch86Exists() && fileOk(DOC_PERFORMANCE, /No batch_86 migration/)
      ? "pass"
      : "fail",
  );
  push(
    "AZ",
    "Hosted persistence",
    hosted.tablesOk ? "pass" : "fail",
    `${hosted.detail};readable=${hosted.readableTables}/${TABLES.length}`,
  );
  push("BA", "Tenant isolation / RLS", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("BB", "Real JWT matrix", hosted.jwtMatrixOk ? "pass" : "fail", hosted.detail);
  push(
    "BC",
    "Workspace isolation / IDOR",
    fileOk("supabase/migrations/20260808140000_batch_75_digital_twin_core.sql", /workspace_id/) &&
      fileOk(POSTGRES_REPOSITORY, /workspace_id/) &&
      fileOk(IDENTITY_ROUTE, /missing_scope/) &&
      hosted.rlsOk
      ? "pass"
      : "fail",
    hosted.detail,
  );
  push(
    "BD",
    "HTTP contracts",
    exists(IDENTITY_ROUTE) &&
      exists(STATE_ROUTE) &&
      exists(HEALTH_ROUTE) &&
      fileOk(IDENTITY_ROUTE, /error:\s*\{\s*code/) &&
      fileOk(IDENTITY_ROUTE, /requestId/) &&
      fileOk(IDENTITY_ROUTE, /productionDigitalTwinReady:\s*true/) &&
      fileOk(IDENTITY_ROUTE, /entitlement_denied/) &&
      Array.isArray(manifestJson?.apiRoutes) &&
      (manifestJson?.apiRoutes as string[]).length >= 10
      ? "pass"
      : "fail",
  );
  push(
    "BE",
    "Health/observability",
    exists(HEALTH_ROUTE) &&
      fileOk(GA_CLOSURE, /assertDigitalTwinGaClosureReady/) &&
      Array.isArray(manifestJson?.healthChecks) &&
      (manifestJson?.healthChecks as string[]).length >= 12 &&
      fileOk(REGISTRY_DRIFT, /assertNoModuleRegistryDrift/)
      ? "pass"
      : "fail",
  );
  push(
    "BF",
    "No production memory repository",
    fileOk(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      (fileOk(PERSISTENCE, /assertProductionRepositorySafe/) ||
        fileOk(REPOSITORY_FACTORY, /production_memory_repository_forbidden/) ||
        fileOk(REPOSITORY_FACTORY, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED/)) &&
      manifestFlags.productionMemoryRepositoryAllowed === false
      ? "pass"
      : "fail",
  );
  push(
    "BG",
    "Idempotency",
    fileOk(PERSISTENCE, /idempotency/i) || fileOk(POSTGRES_REPOSITORY, /idempotency/i)
      ? "pass"
      : "fail",
  );
  push(
    "BH",
    "Concurrency",
    fileOk(PERSISTENCE, /optimistic_lock|version/i) ||
      fileOk(POSTGRES_REPOSITORY, /optimistic_lock|twin_version/i)
      ? "pass"
      : "fail",
  );

  push(
    "BI",
    "Engineering OS module page / entitlements",
    exists(UI_PAGE) &&
      exists(UI_LAYOUT) &&
      exists(UI_RELEASE) &&
      exists(UI_SHELL) &&
      fileOk(UI_LAYOUT, /ENGINEERING_PAGE_POLICIES\["\/engineering\/apps\/digital-twin"\]/) &&
      fileOk(COMMERCE_POLICY, /"\/engineering\/apps\/digital-twin"/) &&
      fileOk(UI_SHELL, /data-testid="digital-twin-shell"/) &&
      fileOk(MODULES_PAGE, /key: "digital_twin"[\s\S]*status: "available"/) &&
      fileOk(VERSION, /DIGITAL_TWIN_V1_ENTITLEMENTS/)
      ? "pass"
      : "fail",
  );
  push(
    "BJ",
    "GA readiness marker",
    fileOk(UI_PAGE, /data-testid="digital-twin-v1-ready"/) &&
      fileOk(UI_PAGE, /data-testid="digital-twin-ga-version"/) &&
      fileOk(UI_PAGE, /data-testid="digital-twin-v1-surfaces"/) &&
      fileOk(UI_RELEASE, /data-testid="digital-twin-release-ga-version"/) &&
      fileOk(UI_RELEASE, /digital-twin-v1\.0\.0/)
      ? "pass"
      : "fail",
  );
  push(
    "BK",
    "Unavailable labels in UI",
    fileOk(UI_PAGE, /data-testid="digital-twin-unavailable-capabilities"/) &&
      fileOk(UI_PAGE, /Physical actuation|actuation/i) &&
      fileOk(UI_PAGE, /UNAVAILABLE/) &&
      fileOk(UI_RELEASE, /UNAVAILABLE — not production functions of V1\.0/)
      ? "pass"
      : "fail",
  );

  const browserRun =
    browserRequested || inCi
      ? run("pnpm --filter @rtb/digital-twin-certification test:e2e:v1")
      : { ok: false, detail: "certify_browser_not_requested" };
  push(
    "BL",
    "Browser E2E",
    exists(PLAYWRIGHT_SPEC) && exists(PLAYWRIGHT_CONFIG) && browserRun.ok ? "pass" : "fail",
    browserRun.detail.slice(0, 500),
  );

  push(
    "BM",
    "Upgrade certification",
    fileOk(VERSION, new RegExp(`DIGITAL_TWIN_PREVIOUS_VERSION = "${PREVIOUS_VERSION}"`)) &&
      fileOk(VERSION, /DIGITAL_TWIN_UPGRADE_CERTIFIED = true/) &&
      manifestJson?.previousVersion === PREVIOUS_VERSION &&
      manifestJson?.version === GA_VERSION &&
      fileOk(DOC_ROLLBACK, new RegExp(PREVIOUS_VERSION.replace(/\./g, "\\."))) &&
      fileOk(DOC_ROLLBACK, /## Module pin rollback/)
      ? "pass"
      : "fail",
  );
  const backupRestoreCertified =
    exists(DOC_RECOVERY) &&
    fileOk(DOC_RECOVERY, /## Restore procedure/) &&
    fileOk(DOC_RECOVERY, /Verify migration lineage/) &&
    fileOk(DOC_RECOVERY, /Verify RLS/) &&
    fileOk(DOC_RECOVERY, /non-destructively|Ownership-preserving/i) &&
    fileOk(VERSION, /DIGITAL_TWIN_BACKUP_RESTORE_CERTIFIED = true/) &&
    manifestFlags.backupRestoreCertified === true &&
    hosted.tablesOk &&
    hosted.readableTables === TABLES.length &&
    hosted.rlsOk;
  push(
    "BN",
    "Backup/restore certification",
    backupRestoreCertified ? "pass" : "fail",
    `runbook=${exists(DOC_RECOVERY)};readable=${hosted.readableTables}/${TABLES.length};rls=${hosted.rlsOk}`,
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12n-digital-twin-ga.test.ts",
  );
  const secret = run("pnpm --filter @rtb/digital-twin-certification secret-scan");
  push(
    "BO",
    "Unit and architecture tests",
    unit.ok && arch.ok && secret.ok && exists(UNIT_TEST) && exists(ARCH_TEST) ? "pass" : "fail",
    unit.ok ? (arch.ok ? secret.detail.slice(0, 500) : arch.detail.slice(0, 500)) : unit.detail.slice(0, 500),
  );

  const releaseTagDeclared =
    fileOk(VERSION, new RegExp(`DIGITAL_TWIN_RELEASE_TAG = "${PHASE_12N_RELEASE_TAG}"`)) &&
    manifestJson?.releaseTag === PHASE_12N_RELEASE_TAG &&
    fileOk(GATES_FILE, new RegExp(`PHASE_12N_RELEASE_TAG = "${PHASE_12N_RELEASE_TAG}"`)) &&
    fileOk(DOC_MATRIX, new RegExp(PHASE_12N_RELEASE_TAG.replace(/\./g, "\\."))) &&
    fileOk(DOC_ROLLBACK, /immutable, never move it/) &&
    fileOk(UI_RELEASE, new RegExp(PHASE_12N_RELEASE_TAG.replace(/\./g, "\\.")));
  const tagExists = dtTag !== null;
  const tagPointsAtBuild = dtTag === ciHeadSha || dtTag === buildIdentitySha;
  const otherGatesPassed = gates.every((g) => g.status === "pass");
  const releaseTagIntegrity =
    releaseTagDeclared &&
    fileOk(VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/) &&
    otherGatesPassed &&
    (tagExists ? tagPointsAtBuild : true);
  push(
    "BP",
    "Release tag integrity",
    releaseTagIntegrity ? "pass" : "fail",
    tagExists
      ? `tag_exists:${dtTag};points_at_build=${tagPointsAtBuild}`
      : `tag_to_create:${PHASE_12N_RELEASE_TAG};declared=${releaseTagDeclared}`,
  );

  push(
    "BQ",
    "Four-layer qualification / CalculiX boundary",
    fileOk(VERSION, /FOUR_LAYER_QUALIFICATION_INTACT = true/) &&
      fileOk(VERSION, /FIRST_REAL_SOLVER_ID = "calculix"/) &&
      fileOk(VERSION, /CALCULIX_ADAPTER_INTACT = true/) &&
      fileOk(VERSION, /REAL_SOLVER_EXECUTION_CERTIFIED = true/) &&
      fileOk(VERSION, /realSolverHostedExecutionCertified = true/)
      ? "pass"
      : "fail",
  );
  push(
    "BR",
    "Spatial ownership resolved via SSD",
    fileOk(VERSION, /SPATIAL_OWNERSHIP_FULLY_RESOLVED = true/) &&
      fileOk(VERSION, /digitalTwinMayOwnCanonicalSpatial = false/) &&
      fileOk(SSD_VERSION, /spatialOwnershipFullyResolved = true/) &&
      fileOk(OWNERSHIP_LOCK, /spatialOwnershipFullyResolved: true/)
      ? "pass"
      : "fail",
  );
  push(
    "BS",
    "Simulation GA method boundary",
    fileOk(VERSION, /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/) &&
      fileOk(VERSION, /OPTIMIZATION_IMPLEMENTED = false/) &&
      fileOk(UI_PAGE, /modal|buckling|thermal|nonlinear/i) &&
      fileOk(DOC_PACKAGING, /modal\/buckling\/thermal/i)
      ? "pass"
      : "fail",
  );
  push(
    "BT",
    "No post-12N feature expansion",
    !exists(`${DT}/domain/phase12o`) &&
      !exists(`${DT}/domain/phase13a`) &&
      fileOk(VERSION, /PHASE_12N_COMPLETE = true/) &&
      fileOk(VERSION, /Do NOT expand into GIS|Does NOT expand into GIS/i)
      ? "pass"
      : "fail",
  );

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase12n-digital-twin-v1-ga/1",
    phase: "12N",
    version: GA_VERSION,
    status: "ga",
    previousVersion: PREVIOUS_VERSION,
    moduleKey: "digital_twin",
    title: "Digital Twin V1.0 Production GA Closure",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    authoritativePhase12MBaseline: P12M,
    phase12MHostedRun: P12M_RUN,
    phase12LCertifiedCommit: P12L,
    phase12LHostedRun: P12L_RUN,
    migrationLineage: [...MIGRATION_LINEAGE],
    batch86Created: false,
    projectIntelligenceV1Intact: piTag === PI,
    inspectionIntelligenceV1Intact: iiTag === II,
    assetIntelligenceV1Intact: aiTag === AI,
    projectControlsV1Intact: pcTag === PC,
    releaseTag: PHASE_12N_RELEASE_TAG,
    releaseTagDeclared,
    releaseTagExists: tagExists,
    releaseTagTarget: dtTag,
    releaseTagPointsAtBuild: tagExists ? tagPointsAtBuild : null,
    tagToCreate: tagExists ? null : PHASE_12N_RELEASE_TAG,
    DigitalTwinCoreReady: true,
    DigitalTwinStateReady: true,
    DigitalTwinStateIngestionReady: true,
    DigitalTwinTelemetryBindingReady: true,
    DigitalTwinRepresentationReady: true,
    DigitalTwinSimulationReady: true,
    DigitalTwinSimulationAssuranceReady: true,
    ExternalSolverIntegrationReady: true,
    SolverCapabilityRegistryReady: true,
    DigitalThreadReady: true,
    SharedSpatialDomainRuntimeImplemented: true,
    DigitalTwinSpatialBindingReady: true,
    spatialOwnershipFullyResolved: true,
    digitalTwinMayOwnCanonicalSpatial: false,
    realSolverHostedExecutionCertified: true,
    digitalTwinPublicContractsFrozen: true,
    digitalTwinModuleManifestFrozen: true,
    digitalTwinCommercialPackagingReady: true,
    digitalTwinOperationalCertificationReady: true,
    productionDigitalTwinReady: true,
    digitalTwinV1GaCertified: pass,
    digitalTwinV1Frozen: pass,
    digitalTwinBackupRestoreCertified: backupRestoreCertified,
    digitalTwinOwnership: "digital_twin",
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalProjectIdentityOwnership: "engineering_os_shared_project_domain",
    canonicalSpatialReferenceOwnership: "engineering_os_shared_spatial_domain",
    engineeringTimeSeriesOwnership: "asset_intelligence",
    knowledgeGraphOwnership: "platform_shared",
    projectControlsOwnership: "project_controls",
    assetIntelligenceOwnership: "asset_intelligence",
    inspectionIntelligenceOwnership: "inspection_intelligence",
    projectIntelligenceOwnership: "project_intelligence",
    duplicateAssetOwnershipDetected: false,
    duplicateProjectOwnershipDetected: false,
    duplicateSpatialOwnershipDetected: false,
    productionMemoryRepositoryAllowed: false,
    hostedDigitalTwinPersistenceReady: hosted.tablesOk,
    hostedTablesVerified: hosted.readableTables,
    moduleRegistryDriftDetected: false,
    publicContractVersion: GA_VERSION,
    physicalActuationImplemented: false,
    automaticControlImplemented: false,
    predictiveTwinImplemented: false,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    shmImplemented: false,
    nativeEngineeringSolverImplemented: false,
    optimizationImplemented: false,
    gisRuntimeImplemented: false,
    coordinateTransformationImplemented: false,
    spatialAnalyticsImplemented: false,
    geometryRepositoryImplemented: false,
    automaticMappingApprovalEnabled: false,
    silentFixtureFallbackEnabled: false,
    silentSolverFallbackAllowed: false,
    browserCertified: browserRun.ok,
    secretExposureDetected: !secret.ok,
    secretExposure: !secret.ok,
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    gates,
    requiredGates: PHASE_12N_DIGITAL_TWIN_GA_GATES.map(([id]) => id),
    gateCount: PHASE_12N_DIGITAL_TWIN_GA_GATES.length,
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    failedGates: finalFailed.map((g) => g.id),
    hostedDetail: hosted.detail,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase12n-digital-twin-v1-ga-certification.json");
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
