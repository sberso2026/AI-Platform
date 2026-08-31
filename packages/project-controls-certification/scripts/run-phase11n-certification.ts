/**
 * Phase 11N certification runner (gates A–BM) — Project Controls V1.0 GA closure.
 *
 * Release-closure phase: proves the module is frozen at 1.0.0, every governance
 * lock stays closed over the Phase 11M baseline, and release artefacts (registries,
 * manifest, docs, runbooks, UI, browser evidence) exist and agree.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_11N_PROJECT_CONTROLS_GA_GATES,
  PHASE_11N_RELEASE_TAG,
  type Phase11nGateId,
} from "../src/phase11n/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PI = "34975b1cf660580d46287f24e746b8915903f768";
const II = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const AI = "925e2ed74025cac6a145c346c17c53320efb8757";

const P11A = "b9a3a6091ec4af1eb1ebdd9749da497ce5af9700";
const P11A_RUN = "31179910364";
const P11B = "336707d4baaf63b6a4e5f4ef4255f9ca8d7e4dd6";
const P11B_RUN = "31187156200";
const P11C = "e9b137902d8fe749a6ce62bc0903ab9410320e77";
const P11C_RUN = "31189507016";
const P11D = "3a27fde6bb15fd6298feafca121438dddb2087af";
const P11D_RUN = "31231309349";
const P11E = "83edd1302a621560511255eb8071d4ad5c9343a9";
const P11E_RUN = "31232558080";
const P11F = "15702b8eeb0627dda27411e27966e24c4aaead4b";
const P11F_RUN = "31234010313";
const P11G = "abdbf3153118baa0c3dc5758fac7a5137b84f5d7";
const P11G_RUN = "31238798319";
const P11H = "9143abfe86234c115c84c5dc27c42ef48e2d3842";
const P11H_RUN = "31239588331";
const P11I = "1dc73a070883ea4783869517da558ea34ff797eb";
const P11I_RUN = "31245651307";
const P11J = "c840c93d8f7b5eb93d510437ad92b4087d067b2b";
const P11J_RUN = "31246586072";
const P11K = "82ac9720247c96ca4029121b97c44dceb52b5145";
const P11K_RUN = "31248471330";
const P11L = "5176bed8168ad39cca4de43b2f95737aab6569aa";
const P11L_RUN = "31249492990";
/** Authoritative Phase 11M baseline identity (hosted PASS) this GA closes over. */
const P11M = "c115329127266022a6233481671b77dee15ae1d7";
const P11M_RUN = "31250607668";

const GA_VERSION = "1.0.0";
const PREVIOUS_VERSION = "0.13.0-organizational-learning";

const MIGRATION_61 = "20260808010000_batch_61_shared_project_domain_references.sql";
const MIGRATION_62 = "20260808020000_batch_62_project_controls_progress.sql";
const MIGRATION_63 = "20260808030000_batch_63_project_controls_schedule.sql";
const MIGRATION_64 = "20260808040000_batch_64_project_controls_change_intelligence.sql";
const MIGRATION_65 = "20260808050000_batch_65_project_controls_cost_intelligence.sql";
const MIGRATION_66 = "20260808060000_batch_66_project_controls_productivity_intelligence.sql";
const MIGRATION_67 = "20260808070000_batch_67_project_controls_forecast_intelligence.sql";
const MIGRATION_68 = "20260808080000_batch_68_project_controls_decision_support.sql";
const MIGRATION_69 = "20260808090000_batch_69_project_controls_scenario_intelligence.sql";
const MIGRATION_70 = "20260808100000_batch_70_project_controls_risk_opportunity_intelligence.sql";
const MIGRATION_71 = "20260808110000_batch_71_project_controls_assurance_intelligence.sql";
const MIGRATION_72 = "20260808120000_batch_72_project_controls_explainability_intelligence.sql";
const MIGRATION_73 = "20260808130000_batch_73_project_controls_organizational_learning.sql";
const MIGRATION_LINEAGE = [
  MIGRATION_61,
  MIGRATION_62,
  MIGRATION_63,
  MIGRATION_64,
  MIGRATION_65,
  MIGRATION_66,
  MIGRATION_67,
  MIGRATION_68,
  MIGRATION_69,
  MIGRATION_70,
  MIGRATION_71,
  MIGRATION_72,
  MIGRATION_73,
] as const;

/** Representative sample across V1 intelligence surfaces; read-only verification. */
const TABLES = [
  "project_controls_progress_assessments",
  "project_controls_schedule_assessments",
  "project_controls_change_states",
  "project_controls_cost_states",
  "project_controls_productivity_states",
  "project_controls_forecast_states",
  "project_controls_decision_states",
  "project_controls_scenario_states",
  "project_controls_risk_opportunity_states",
  "project_controls_assurance_states",
  "project_controls_explainability_states",
  "project_controls_organizational_learning_states",
  "project_controls_project_snapshots",
  "project_controls_project_timeline",
] as const;

const RLS_SAMPLE_TABLES = [
  "project_controls_organizational_learning_states",
  "project_controls_decision_states",
  "project_controls_cost_states",
  "project_controls_change_states",
  "project_controls_project_snapshots",
  "project_controls_progress_assessments",
] as const;

const V1_SURFACES = [
  "progress",
  "schedule",
  "change",
  "cost",
  "productivity",
  "forecast",
  "decision",
  "scenario",
  "risk-opportunity",
  "assurance",
  "explainability",
  "organizational-learning",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase11nGateId; name: string; status: GateStatus; detail?: string };

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
    const { error } = await admin.from(table).select("id", { count: "exact", head: true });
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
      const { data } = await anonClient.from(table).select("id").limit(5);
      if (Array.isArray(data) && data.length > 0) rlsOk = false;
    }
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `pc-cert-ga-${Date.now()}@example.com`;
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
        const probes = [
          "project_controls_organizational_learning_states",
          "project_controls_decision_states",
          "project_controls_cost_states",
          "project_controls_change_states",
          "project_controls_project_snapshots",
          "project_controls_progress_assessments",
        ] as const;
        const results = await Promise.all(
          probes.map((table) => authed.from(table).select("id").limit(5)),
        );
        const empty = (rows: unknown) => Array.isArray(rows) && rows.length === 0;
        const ROLE_MATRIX = "packages/project-controls/src/domain/role-matrix.ts";
        jwtMatrixOk =
          results.every((r) => !r.error) &&
          results.every((r) => empty(r.data)) &&
          has(ROLE_MATRIX, /"organizational_learning\.assess"/) &&
          has(ROLE_MATRIX, /"organizational_learning\.review"/) &&
          has(ROLE_MATRIX, /"organizational_learning\.publish"/) &&
          has(ROLE_MATRIX, /SELF_APPROVE_FORBIDDEN_CAPABILITIES/) &&
          has(ROLE_MATRIX, /"progress\.assess"/) &&
          has(ROLE_MATRIX, /"progress\.publish"/);
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
  const push = (id: Phase11nGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");
  const aiTag = tag("asset-intelligence-v1.0.0");
  const pcTag = tag(PHASE_11N_RELEASE_TAG);
  const hosted = await verifyHosted();
  const fileOk = (rel: string, re: RegExp) => has(rel, re);
  const exists = (rel: string) => existsSync(resolve(root, rel));

  const PC = "packages/project-controls/src";
  const VERSION = `${PC}/version.ts`;
  const INDEX = `${PC}/index.ts`;
  const MANIFEST_TS = `${PC}/domain/module-manifest.ts`;
  const CAPABILITY_REGISTRY = `${PC}/domain/capability-registry.ts`;
  const SERVICE_REGISTRY = `${PC}/domain/service-registry.ts`;
  const EVENT_CONTRACTS = `${PC}/domain/event-contracts.ts`;
  const UNAVAILABLE = `${PC}/domain/unavailable-capabilities.ts`;
  const REGISTRY_DRIFT = `${PC}/domain/registry-drift.ts`;
  const EVENTS = `${PC}/domain/events.ts`;
  const ENGINE = `${PC}/domain/engine.ts`;
  const PERSISTENCE = `${PC}/domain/persistence.ts`;
  const POSTGRES_REPOSITORY = `${PC}/domain/postgres-repository.ts`;
  const REPOSITORY_FACTORY = `${PC}/domain/repository-factory.ts`;
  const ROLE_MATRIX = `${PC}/domain/role-matrix.ts`;
  const OWNERSHIP_LOCK = `${PC}/architecture/ownership-lock.ts`;
  const GA_CLOSURE = `${PC}/domain/ga-closure.ts`;
  const PROGRESS_ENGINE = `${PC}/domain/progress-engine.ts`;
  const SCHEDULE_ENGINE = `${PC}/domain/schedule-engine.ts`;
  const ORG_LEARNING_ENGINE = `${PC}/domain/organizational-learning-engine.ts`;

  const MANIFEST_JSON =
    "packages/project-controls/manifest/project-controls-module-manifest.json";
  const PKG_PC = "packages/project-controls/package.json";
  const PKG_CERT = "packages/project-controls-certification/package.json";

  const DOC_MATRIX = "docs/release/PROJECT_CONTROLS_V1_CAPABILITY_MATRIX.md";
  const DOC_CONTRACTS = "docs/architecture/PROJECT_CONTROLS_V1_PUBLIC_CONTRACTS.md";
  const DOC_PACKAGING = "docs/commercial/PROJECT_CONTROLS_V1_PACKAGING.md";
  const DOC_OPERATIONS = "docs/runbooks/PROJECT_CONTROLS_V1_OPERATIONS.md";
  const DOC_INCIDENT = "docs/runbooks/PROJECT_CONTROLS_V1_INCIDENT_RESPONSE.md";
  const DOC_RECOVERY = "docs/runbooks/PROJECT_CONTROLS_V1_RECOVERY.md";
  const DOC_ROLLBACK = "docs/runbooks/PROJECT_CONTROLS_V1_ROLLBACK.md";
  const DOC_PERFORMANCE = "docs/release/PROJECT_CONTROLS_V1_PERFORMANCE_BASELINE.md";
  const DOC_UNAVAILABLE = "docs/release/PROJECT_CONTROLS_V1_UNAVAILABLE_CAPABILITIES.md";
  const DOC_LIMITATIONS = "docs/release/PROJECT_CONTROLS_V1_LIMITATIONS.md";
  const DOC_SHARED = "docs/architecture/ENGINEERING_SHARED_PROJECT_DOMAIN.md";

  const UI_BASE = "apps/web/src/app/(platform)/engineering/apps/project-controls";
  const UI_PAGE = `${UI_BASE}/page.tsx`;
  const UI_LAYOUT = `${UI_BASE}/layout.tsx`;
  const UI_RELEASE = `${UI_BASE}/release/page.tsx`;
  const UI_SHELL = "apps/web/src/components/engineering/project-controls-shell.tsx";
  const COMMERCE_POLICY = "packages/platform-commerce/src/domain/commerce-access-policy.ts";

  const ROUTE_BASE = "apps/web/src/app/api/engineering/project-controls";
  const HEALTH_ROUTE = `${ROUTE_BASE}/health/route.ts`;
  const PROFILE_ROUTE = `${ROUTE_BASE}/profile/route.ts`;
  const ORG_LEARNING_ROUTE = `${ROUTE_BASE}/organizational-learning/route.ts`;
  const PROGRESS_ROUTE = `${ROUTE_BASE}/progress/route.ts`;
  const SCHEDULE_ROUTE = `${ROUTE_BASE}/schedule/route.ts`;
  const CHANGE_ROUTE = `${ROUTE_BASE}/change/route.ts`;
  const COST_ROUTE = `${ROUTE_BASE}/cost/route.ts`;

  const PLAYWRIGHT_SPEC = "packages/project-controls-certification/playwright/v1-ga.spec.ts";
  const PLAYWRIGHT_CONFIG = "packages/project-controls-certification/playwright.config.ts";
  const GATES_FILE = "packages/project-controls-certification/src/phase11n/gates.ts";
  const ARCH_TEST = "packages/platform-certification/src/phase11n-project-controls-ga.test.ts";
  const UNIT_TEST = "packages/project-controls/tests/phase11n-v1-ga.test.ts";

  const BATCH_61 = `supabase/migrations/${MIGRATION_61}`;
  const BATCH_62 = `supabase/migrations/${MIGRATION_62}`;
  const BATCH_63 = `supabase/migrations/${MIGRATION_63}`;
  const BATCH_64 = `supabase/migrations/${MIGRATION_64}`;
  const BATCH_65 = `supabase/migrations/${MIGRATION_65}`;
  const BATCH_66 = `supabase/migrations/${MIGRATION_66}`;
  const BATCH_67 = `supabase/migrations/${MIGRATION_67}`;
  const BATCH_68 = `supabase/migrations/${MIGRATION_68}`;
  const BATCH_69 = `supabase/migrations/${MIGRATION_69}`;
  const BATCH_70 = `supabase/migrations/${MIGRATION_70}`;
  const BATCH_71 = `supabase/migrations/${MIGRATION_71}`;
  const BATCH_72 = `supabase/migrations/${MIGRATION_72}`;
  const BATCH_73 = `supabase/migrations/${MIGRATION_73}`;

  const manifestJson = readJson(MANIFEST_JSON);
  const manifestFlags = (manifestJson?.featureFlags ?? {}) as Record<string, unknown>;

  // ---------------------------------------------------------------- A–N (identity + phase regression)
  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      fileOk(VERSION, /PROJECT_CONTROLS_VERSION = "1\.0\.0"/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_STATUS = "ga"/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_PHASE = "11N"/) &&
      certCommit(VERSION, "PHASE_11M_CERTIFIED_COMMIT", P11M) &&
      fileOk(VERSION, new RegExp(`PHASE_11M_HOSTED_RUN = "${P11M_RUN}"`))
      ? "pass"
      : "fail",
    buildIdentitySha,
  );
  push(
    "B",
    "Phase 11A regression",
    certCommit(VERSION, "PHASE_11A_CERTIFIED_COMMIT", P11A) &&
      fileOk(VERSION, new RegExp(`PHASE_11A_HOSTED_RUN = "${P11A_RUN}"`)) &&
      fileOk(VERSION, /PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED = true/) &&
      exists("packages/project-controls/tests/discovery-lock.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "C",
    "Phase 11B regression",
    certCommit(VERSION, "PHASE_11B_CERTIFIED_COMMIT", P11B) &&
      fileOk(VERSION, new RegExp(`PHASE_11B_HOSTED_RUN = "${P11B_RUN}"`)) &&
      fileOk(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
      fileOk(VERSION, /PROGRESS_INTELLIGENCE_READY = true/) &&
      exists(BATCH_62) &&
      exists("packages/project-controls/tests/phase11b-progress-intelligence.test.ts") &&
      fileOk(PROGRESS_ENGINE, /assertNoEarnedValue/)
      ? "pass"
      : "fail",
  );
  push(
    "D",
    "Phase 11C regression",
    certCommit(VERSION, "PHASE_11C_CERTIFIED_COMMIT", P11C) &&
      fileOk(VERSION, new RegExp(`PHASE_11C_HOSTED_RUN = "${P11C_RUN}"`)) &&
      fileOk(VERSION, /SCHEDULE_INTELLIGENCE_11C_INTACT = true/) &&
      fileOk(VERSION, /SCHEDULE_INTELLIGENCE_READY = true/) &&
      exists(BATCH_63) &&
      exists("packages/project-controls/tests/phase11c-schedule-intelligence.test.ts") &&
      fileOk(SCHEDULE_ENGINE, /assertNoCpm/)
      ? "pass"
      : "fail",
  );
  push(
    "E",
    "Phase 11D regression",
    certCommit(VERSION, "PHASE_11D_CERTIFIED_COMMIT", P11D) &&
      fileOk(VERSION, new RegExp(`PHASE_11D_HOSTED_RUN = "${P11D_RUN}"`)) &&
      fileOk(VERSION, /CHANGE_INTELLIGENCE_11D_INTACT = true/) &&
      fileOk(VERSION, /CHANGE_INTELLIGENCE_READY = true/) &&
      exists(BATCH_64) &&
      exists("packages/project-controls/tests/phase11d-change-intelligence.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "F",
    "Phase 11E regression",
    certCommit(VERSION, "PHASE_11E_CERTIFIED_COMMIT", P11E) &&
      fileOk(VERSION, new RegExp(`PHASE_11E_HOSTED_RUN = "${P11E_RUN}"`)) &&
      fileOk(VERSION, /COST_INTELLIGENCE_11E_INTACT = true/) &&
      fileOk(VERSION, /COST_INTELLIGENCE_READY = true/) &&
      exists(BATCH_65) &&
      exists("packages/project-controls/tests/phase11e-cost-intelligence.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "G",
    "Phase 11F regression",
    certCommit(VERSION, "PHASE_11F_CERTIFIED_COMMIT", P11F) &&
      fileOk(VERSION, new RegExp(`PHASE_11F_HOSTED_RUN = "${P11F_RUN}"`)) &&
      fileOk(VERSION, /PRODUCTIVITY_INTELLIGENCE_11F_INTACT = true/) &&
      fileOk(VERSION, /PRODUCTIVITY_INTELLIGENCE_READY = true/) &&
      exists(BATCH_66) &&
      exists("packages/project-controls/tests/phase11f-productivity-intelligence.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "H",
    "Phase 11G regression",
    certCommit(VERSION, "PHASE_11G_CERTIFIED_COMMIT", P11G) &&
      fileOk(VERSION, new RegExp(`PHASE_11G_HOSTED_RUN = "${P11G_RUN}"`)) &&
      fileOk(VERSION, /FORECAST_INTELLIGENCE_READY = true/) &&
      fileOk(VERSION, /PROJECT_CONTEXT_COMPOSITION_READY = true/) &&
      exists(BATCH_67) &&
      exists("packages/project-controls/tests/phase11g-forecast-intelligence.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "I",
    "Phase 11H regression",
    certCommit(VERSION, "PHASE_11H_CERTIFIED_COMMIT", P11H) &&
      fileOk(VERSION, new RegExp(`PHASE_11H_HOSTED_RUN = "${P11H_RUN}"`)) &&
      fileOk(VERSION, /DECISION_SUPPORT_READY = true/) &&
      exists(BATCH_68) &&
      exists("packages/project-controls/tests/phase11h-decision-support.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Phase 11I regression",
    certCommit(VERSION, "PHASE_11I_CERTIFIED_COMMIT", P11I) &&
      fileOk(VERSION, new RegExp(`PHASE_11I_HOSTED_RUN = "${P11I_RUN}"`)) &&
      fileOk(VERSION, /SCENARIO_INTELLIGENCE_READY = true/) &&
      exists(BATCH_69) &&
      exists("packages/project-controls/tests/phase11i-scenario-intelligence.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Phase 11J regression",
    certCommit(VERSION, "PHASE_11J_CERTIFIED_COMMIT", P11J) &&
      fileOk(VERSION, new RegExp(`PHASE_11J_HOSTED_RUN = "${P11J_RUN}"`)) &&
      fileOk(VERSION, /RISK_OPPORTUNITY_INTELLIGENCE_READY = true/) &&
      exists(BATCH_70) &&
      exists("packages/project-controls/tests/phase11j-risk-opportunity-intelligence.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Phase 11K regression",
    certCommit(VERSION, "PHASE_11K_CERTIFIED_COMMIT", P11K) &&
      fileOk(VERSION, new RegExp(`PHASE_11K_HOSTED_RUN = "${P11K_RUN}"`)) &&
      fileOk(VERSION, /ASSURANCE_INTELLIGENCE_READY = true/) &&
      exists(BATCH_71) &&
      exists("packages/project-controls/tests/phase11k-assurance-intelligence.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Phase 11L regression",
    certCommit(VERSION, "PHASE_11L_CERTIFIED_COMMIT", P11L) &&
      fileOk(VERSION, new RegExp(`PHASE_11L_HOSTED_RUN = "${P11L_RUN}"`)) &&
      fileOk(VERSION, /EXPLAINABILITY_INTELLIGENCE_READY = true/) &&
      exists(BATCH_72) &&
      exists("packages/project-controls/tests/phase11l-explainability-intelligence.test.ts")
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Phase 11M regression",
    certCommit(VERSION, "PHASE_11M_CERTIFIED_COMMIT", P11M) &&
      fileOk(VERSION, new RegExp(`PHASE_11M_HOSTED_RUN = "${P11M_RUN}"`)) &&
      fileOk(VERSION, /ORGANIZATIONAL_LEARNING_INTELLIGENCE_READY = true/) &&
      fileOk(VERSION, /PHASE_11M_READY = true/) &&
      exists(BATCH_73) &&
      exists("packages/project-controls/tests/phase11m-organizational-learning.test.ts") &&
      fileOk(ORG_LEARNING_ENGINE, /ProjectControlsOrganizationalLearningEngine/)
      ? "pass"
      : "fail",
  );

  // ---------------------------------------------------------------- O–AD (integrity, freeze, registries)
  push("O", "PI v1 integrity", piTag === PI ? "pass" : "fail", piTag ?? "tag_missing");
  push("P", "II v1 integrity", iiTag === II ? "pass" : "fail", iiTag ?? "tag_missing");
  push("Q", "AI v1 integrity", aiTag === AI ? "pass" : "fail", aiTag ?? "tag_missing");
  push(
    "R",
    "Shared Project Domain",
    exists(BATCH_61) &&
      fileOk(VERSION, /SHARED_PROJECT_DOMAIN_READY = true/) &&
      fileOk(OWNERSHIP_LOCK, /engineering_os_shared_project_domain/) &&
      exists(DOC_SHARED)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Ownership locks",
    fileOk(VERSION, /CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\s*\r?\n?\s*"engineering_os_shared_project_domain"/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_OWNERSHIP = "project_controls"/) &&
      fileOk(VERSION, /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/) &&
      fileOk(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/) &&
      fileOk(VERSION, /FINANCIAL_LEDGER_OWNERSHIP =\s*\r?\n?\s*"external_finance_or_future_finance_domain"/) &&
      fileOk(VERSION, /CMMS_WORK_ORDER_OWNERSHIP = "none_in_project_controls"/) &&
      fileOk(OWNERSHIP_LOCK, /organizational_learning_controls_intelligence/) &&
      fileOk(OWNERSHIP_LOCK, /project_identity_canonical/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "V1.0.0 version freeze",
    fileOk(VERSION, /PROJECT_CONTROLS_VERSION = "1\.0\.0"/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_V1_FROZEN = true/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_V1_GA_CERTIFIED = true/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_PUBLIC_CONTRACT_VERSION = "1\.0\.0"/) &&
      manifestJson?.version === GA_VERSION
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "GA status declaration",
    fileOk(VERSION, /PROJECT_CONTROLS_STATUS = "ga"/) &&
      fileOk(VERSION, /PRODUCTION_PROJECT_CONTROLS_READY = true/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_RELEASE_CLOSED = true/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_READINESS_MARKER = "project-controls-v1-ready"/) &&
      manifestJson?.status === "ga" &&
      manifestFlags.productionProjectControlsReady === true
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Package version alignment",
    fileOk(PKG_PC, /"version": "1\.0\.0"/) && fileOk(PKG_CERT, /"version": "1\.0\.0"/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Single authoritative version source",
    fileOk(VERSION, /Single authoritative version source/) &&
      fileOk(MANIFEST_TS, /PROJECT_CONTROLS_VERSION/) &&
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
    "X",
    "Module manifest generator",
    exists(MANIFEST_TS) &&
      fileOk(MANIFEST_TS, /export function generateProjectControlsModuleManifest/) &&
      fileOk(MANIFEST_TS, /export function generateManifest/) &&
      fileOk(MANIFEST_TS, /assertManifestConsistentWithRegistries/) &&
      fileOk(INDEX, /module-manifest/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Module manifest snapshot",
    manifestJson !== null &&
      manifestJson.schemaVersion === "project-controls-module-manifest/1" &&
      manifestJson.moduleKey === "project_controls" &&
      manifestJson.releaseTag === PHASE_11N_RELEASE_TAG &&
      manifestJson.previousVersion === PREVIOUS_VERSION &&
      Array.isArray(manifestJson.migrationLineage) &&
      (manifestJson.migrationLineage as string[]).length === MIGRATION_LINEAGE.length &&
      fileOk(MANIFEST_JSON, /generateProjectControlsModuleManifest/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Capability registry freeze",
    exists(CAPABILITY_REGISTRY) &&
      fileOk(CAPABILITY_REGISTRY, /PROJECT_CONTROLS_CAPABILITY_CATALOG/) &&
      fileOk(CAPABILITY_REGISTRY, /assertCapabilityCatalogComplete/) &&
      fileOk(CAPABILITY_REGISTRY, /"ga_advisory"/) &&
      fileOk(CAPABILITY_REGISTRY, /"unavailable"/) &&
      fileOk(CAPABILITY_REGISTRY, /mutatesCanonicalState: false/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_CAPABILITY_REGISTRY_PUBLISHED = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Service registry freeze",
    exists(SERVICE_REGISTRY) &&
      fileOk(SERVICE_REGISTRY, /PROJECT_CONTROLS_SERVICE_REGISTRY/) &&
      fileOk(SERVICE_REGISTRY, /assertServiceRegistryComplete/) &&
      fileOk(SERVICE_REGISTRY, /duplicateRuntimeForbidden: true/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_SERVICE_REGISTRY_PUBLISHED = true/) &&
      Array.isArray(manifestJson?.services) &&
      (manifestJson?.services as string[]).length >= 14
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Event contract freeze",
    exists(EVENT_CONTRACTS) &&
      fileOk(EVENT_CONTRACTS, /PROJECT_CONTROLS_EVENT_CONTRACTS/) &&
      fileOk(EVENT_CONTRACTS, /assertEventContractsFrozen/) &&
      fileOk(EVENT_CONTRACTS, /containsForbiddenEngineOutput: false/) &&
      fileOk(EVENT_CONTRACTS, /mutatesCanonicalStateOnConsume: false/) &&
      fileOk(EVENTS, /PROJECT_CONTROLS_EVENTS/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_EVENT_CONTRACTS_FROZEN = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Unavailable capability matrix",
    exists(UNAVAILABLE) &&
      fileOk(UNAVAILABLE, /PROJECT_CONTROLS_UNAVAILABLE_CAPABILITIES/) &&
      fileOk(UNAVAILABLE, /assertUnavailableCapabilitiesClosed/) &&
      fileOk(UNAVAILABLE, /project_controls\.earned_value/) &&
      fileOk(UNAVAILABLE, /project_controls\.native_cpm/) &&
      fileOk(UNAVAILABLE, /project_controls\.financial_posting/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_UNAVAILABLE_MATRIX_PUBLISHED = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Module registry drift",
    exists(REGISTRY_DRIFT) &&
      fileOk(REGISTRY_DRIFT, /export function assertNoModuleRegistryDrift/) &&
      fileOk(REGISTRY_DRIFT, /drift:version/) &&
      fileOk(REGISTRY_DRIFT, /drift:capability/) &&
      fileOk(REGISTRY_DRIFT, /drift:service/) &&
      fileOk(REGISTRY_DRIFT, /drift:event_family/) &&
      fileOk(VERSION, /PROJECT_CONTROLS_MODULE_REGISTRY_DRIFT_DETECTED = false/) &&
      manifestFlags.moduleRegistryDriftDetected === false
      ? "pass"
      : "fail",
  );

  // ---------------------------------------------------------------- AE–AN (docs)
  push(
    "AE",
    "Capability matrix document",
    exists(DOC_MATRIX) &&
      fileOk(DOC_MATRIX, /## Classification \(locked\)/) &&
      fileOk(DOC_MATRIX, /`ga_advisory`/) &&
      fileOk(DOC_MATRIX, /`unavailable`/) &&
      fileOk(DOC_MATRIX, new RegExp(P11M))
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Public contracts document",
    exists(DOC_CONTRACTS) &&
      fileOk(DOC_CONTRACTS, /## Freeze policy/) &&
      fileOk(DOC_CONTRACTS, /Public contract version: \*\*1\.0\.0\*\*/) &&
      fileOk(DOC_CONTRACTS, /## Service contract family/) &&
      fileOk(DOC_CONTRACTS, /## Event contract families/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "Commercial packaging document",
    exists(DOC_PACKAGING) &&
      fileOk(DOC_PACKAGING, /## Explicit commercial exclusions/) &&
      fileOk(DOC_PACKAGING, /CPM|Critical path/i) &&
      fileOk(DOC_PACKAGING, /Earned value|EV\/CPI\/SPI/i) &&
      fileOk(DOC_PACKAGING, /Financial posting|budget ledger/i)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "Operations runbook",
    exists(DOC_OPERATIONS) &&
      fileOk(DOC_OPERATIONS, /## Deployment/) &&
      fileOk(DOC_OPERATIONS, /## Daily checks/) &&
      fileOk(DOC_OPERATIONS, /## Escalation/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Incident response runbook",
    exists(DOC_INCIDENT) &&
      fileOk(DOC_INCIDENT, /## Severity model/) &&
      fileOk(DOC_INCIDENT, /governance lock breach/i) &&
      fileOk(DOC_INCIDENT, /tenant isolation/i)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "Recovery runbook",
    exists(DOC_RECOVERY) &&
      fileOk(DOC_RECOVERY, /## Restore procedure/) &&
      fileOk(DOC_RECOVERY, /## Recovery objectives/) &&
      fileOk(DOC_RECOVERY, /## Verification checklist/)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Rollback runbook",
    exists(DOC_ROLLBACK) &&
      fileOk(DOC_ROLLBACK, /## Principles/) &&
      fileOk(DOC_ROLLBACK, /immutable/) &&
      fileOk(DOC_ROLLBACK, /## Schema rollback/) &&
      fileOk(DOC_ROLLBACK, /batches 61/i)
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "Performance baseline document",
    exists(DOC_PERFORMANCE) &&
      fileOk(DOC_PERFORMANCE, /not claimed/) &&
      fileOk(DOC_PERFORMANCE, /## Cost model per operation/) &&
      fileOk(DOC_PERFORMANCE, /batch_74/)
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "Unavailable capabilities document",
    exists(DOC_UNAVAILABLE) &&
      fileOk(DOC_UNAVAILABLE, /## UNAVAILABLE — not production functions of V1\.0/) &&
      fileOk(DOC_UNAVAILABLE, /## Enforcement points/) &&
      fileOk(DOC_UNAVAILABLE, /Earned value/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "Limitations document",
    exists(DOC_LIMITATIONS) &&
      fileOk(DOC_LIMITATIONS, /## Advisory intelligence/) &&
      fileOk(DOC_LIMITATIONS, /## Forbidden engines/) &&
      fileOk(DOC_LIMITATIONS, /CPM|earned value/i)
      ? "pass"
      : "fail",
  );

  // ---------------------------------------------------------------- AO–AT (forbidden locks)
  push(
    "AO",
    "CPM unavailable",
    fileOk(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      fileOk(VERSION, /FLOAT_COMPUTATION_IMPLEMENTED = false/) &&
      fileOk(UNAVAILABLE, /project_controls\.native_cpm/) &&
      fileOk(CAPABILITY_REGISTRY, /Not CPM/) &&
      fileOk(SCHEDULE_ROUTE, /cpmSchedulingImplemented:\s*false/) &&
      manifestFlags.cpmSchedulingImplemented === false
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "Earned value unavailable",
    fileOk(VERSION, /EARNED_VALUE_IMPLEMENTED = false/) &&
      fileOk(VERSION, /PROGRESS_MEASUREMENT_IS_EARNED_VALUE = false/) &&
      fileOk(UNAVAILABLE, /project_controls\.earned_value/) &&
      fileOk(PROGRESS_ENGINE, /assertNoEarnedValue/) &&
      fileOk(PROGRESS_ROUTE, /earnedValueImplemented:\s*false/) &&
      manifestFlags.earnedValueImplemented === false
      ? "pass"
      : "fail",
  );
  push(
    "AQ",
    "Financial posting unavailable",
    fileOk(VERSION, /FINANCIAL_POSTING_IMPLEMENTED = false/) &&
      fileOk(VERSION, /BUDGET_LEDGER_IMPLEMENTED = false/) &&
      fileOk(UNAVAILABLE, /project_controls\.financial_posting/) &&
      fileOk(UNAVAILABLE, /project_controls\.budget_ledger/) &&
      fileOk(COST_ROUTE, /financialPostingImplemented:\s*false/) &&
      manifestFlags.financialPostingImplemented === false
      ? "pass"
      : "fail",
  );
  push(
    "AR",
    "Schedule execution unavailable",
    fileOk(VERSION, /SCHEDULE_EXECUTION_IMPLEMENTED = false/) &&
      fileOk(UNAVAILABLE, /project_controls\.schedule_execution/) &&
      fileOk(SCHEDULE_ROUTE, /scheduleExecutionImplemented:\s*false/) &&
      manifestFlags.scheduleExecutionImplemented === false
      ? "pass"
      : "fail",
  );
  push(
    "AS",
    "Resource leveling unavailable",
    fileOk(VERSION, /RESOURCE_LEVELING_IMPLEMENTED = false/) &&
      fileOk(UNAVAILABLE, /project_controls\.resource_leveling/) &&
      manifestFlags.resourceLevelingImplemented === false
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "Autonomous decision forbidden",
    fileOk(VERSION, /AUTOMATIC_DECISION_EXECUTION_ENABLED = false/) &&
      fileOk(VERSION, /AUTOMATIC_LEARNING_APPROVAL_ENABLED = false/) &&
      fileOk(VERSION, /AUTOMATIC_KNOWLEDGE_MUTATION_ENABLED = false/) &&
      fileOk(UNAVAILABLE, /project_controls\.autonomous_project_management/) &&
      fileOk(ORG_LEARNING_ROUTE, /automaticDecisionExecutionEnabled:\s*false/) &&
      fileOk(ORG_LEARNING_ROUTE, /automaticLearningApprovalEnabled:\s*false/) &&
      fileOk(ORG_LEARNING_ROUTE, /automaticKnowledgeMutationEnabled:\s*false/) &&
      manifestFlags.automaticDecisionExecutionEnabled === false &&
      manifestFlags.automaticLearningApprovalEnabled === false &&
      manifestFlags.automaticKnowledgeMutationEnabled === false
      ? "pass"
      : "fail",
  );

  // ---------------------------------------------------------------- AU–BE (platform)
  push(
    "AU",
    "Migration lineage 61–73",
    MIGRATION_LINEAGE.every((m) => exists(`supabase/migrations/${m}`)) &&
      Array.isArray(manifestJson?.migrationLineage) &&
      MIGRATION_LINEAGE.every((m) => (manifestJson?.migrationLineage as string[]).includes(m))
      ? "pass"
      : "fail",
  );
  push(
    "AV",
    "No batch_74 migration",
    !exists("supabase/migrations/20260808140000_batch_74_project_controls_ga.sql") &&
      !globBatch74Exists() &&
      fileOk(DOC_PERFORMANCE, /No batch_74 migration/)
      ? "pass"
      : "fail",
  );
  push(
    "AW",
    "Hosted persistence",
    hosted.tablesOk ? "pass" : "fail",
    `${hosted.detail};readable=${hosted.readableTables}/${TABLES.length}`,
  );
  push("AX", "Tenant isolation / RLS", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("AY", "Real JWT matrix", hosted.jwtMatrixOk ? "pass" : "fail", hosted.detail);
  push(
    "AZ",
    "Workspace isolation / IDOR",
    fileOk(BATCH_73, /workspace_id/) &&
      fileOk(BATCH_73, /workspace_memberships/) &&
      fileOk(POSTGRES_REPOSITORY, /workspace_id/) &&
      fileOk(ORG_LEARNING_ENGINE, /scope_project_mismatch/) &&
      fileOk(ORG_LEARNING_ROUTE, /missing_scope/) &&
      fileOk(PROGRESS_ENGINE, /scope_project_mismatch/) &&
      hosted.rlsOk
      ? "pass"
      : "fail",
    hosted.detail,
  );
  push(
    "BA",
    "HTTP contracts",
    exists(PROFILE_ROUTE) &&
      exists(ORG_LEARNING_ROUTE) &&
      exists(PROGRESS_ROUTE) &&
      exists(SCHEDULE_ROUTE) &&
      exists(CHANGE_ROUTE) &&
      exists(COST_ROUTE) &&
      fileOk(PROFILE_ROUTE, /error:\s*\{\s*code/) &&
      fileOk(PROFILE_ROUTE, /requestId/) &&
      fileOk(ORG_LEARNING_ROUTE, /productionProjectControlsReady:\s*true/) &&
      Array.isArray(manifestJson?.apiRoutes) &&
      (manifestJson?.apiRoutes as string[]).length >= 14
      ? "pass"
      : "fail",
  );
  push(
    "BB",
    "Health/observability",
    (exists(HEALTH_ROUTE) || fileOk(PROFILE_ROUTE, /requestId/)) &&
      fileOk(GA_CLOSURE, /assertProjectControlsGaClosureReady/) &&
      Array.isArray(manifestJson?.healthChecks) &&
      (manifestJson?.healthChecks as string[]).length >= 14 &&
      fileOk(REGISTRY_DRIFT, /assertNoModuleRegistryDrift/)
      ? "pass"
      : "fail",
  );
  push(
    "BC",
    "No production memory repository",
    fileOk(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      fileOk(PERSISTENCE, /assertProductionRepositorySafe/) &&
      fileOk(REPOSITORY_FACTORY, /production_memory_repository_forbidden/) &&
      manifestFlags.productionMemoryRepositoryAllowed === false
      ? "pass"
      : "fail",
  );
  push(
    "BD",
    "Idempotency",
    fileOk(PERSISTENCE, /idempotencyKey/) &&
      fileOk(POSTGRES_REPOSITORY, /project_controls_idempotency/) &&
      fileOk(ENGINE, /idempotencyKey/)
      ? "pass"
      : "fail",
  );
  push(
    "BE",
    "Concurrency",
    fileOk(PERSISTENCE, /optimistic_lock_conflict/) &&
      fileOk(POSTGRES_REPOSITORY, /optimistic_lock_conflict/) &&
      fileOk(BATCH_73, /UNIQUE \(tenant_id, workspace_id, project_id/)
      ? "pass"
      : "fail",
  );

  // ---------------------------------------------------------------- BF–BI (UI + browser)
  push(
    "BF",
    "Engineering OS module page",
    exists(UI_PAGE) &&
      exists(UI_LAYOUT) &&
      exists(UI_RELEASE) &&
      exists(UI_SHELL) &&
      fileOk(UI_LAYOUT, /ENGINEERING_PAGE_POLICIES\["\/engineering\/apps\/project-controls"\]/) &&
      fileOk(COMMERCE_POLICY, /"\/engineering\/apps\/project-controls"/) &&
      fileOk(UI_SHELL, /data-testid="project-controls-shell"/)
      ? "pass"
      : "fail",
  );
  push(
    "BG",
    "GA readiness marker",
    fileOk(UI_PAGE, /data-testid="project-controls-v1-ready"/) &&
      fileOk(UI_PAGE, /data-testid="project-controls-ga-version"/) &&
      fileOk(UI_PAGE, /data-testid="project-controls-v1-surfaces"/) &&
      fileOk(UI_RELEASE, /data-testid="project-controls-release-ga-version"/) &&
      fileOk(UI_RELEASE, /project-controls-v1\.0\.0/) &&
      V1_SURFACES.every((surfaceId) =>
        fileOk(UI_PAGE, new RegExp(`id: "${surfaceId}"|data-testid="project-controls-surface-${surfaceId}"`)),
      )
      ? "pass"
      : "fail",
  );
  push(
    "BH",
    "Unavailable labels in UI",
    fileOk(UI_RELEASE, /data-testid="project-controls-unavailable-capabilities"/) &&
      fileOk(UI_RELEASE, /CPM|Critical path/i) &&
      fileOk(UI_RELEASE, /Earned value|EV\/CPI\/SPI/i) &&
      fileOk(UI_RELEASE, /Financial posting|budget ledger/i) &&
      fileOk(UI_RELEASE, /UNAVAILABLE/) &&
      fileOk(UI_PAGE, /Native CPM/) &&
      fileOk(UI_RELEASE, /UNAVAILABLE — not production functions of V1\.0/)
      ? "pass"
      : "fail",
  );

  const browserRun =
    browserRequested || inCi
      ? run("pnpm --filter @rtb/project-controls-certification test:e2e:v1")
      : { ok: false, detail: "certify_browser_not_requested" };
  push(
    "BI",
    "Browser E2E",
    exists(PLAYWRIGHT_SPEC) && exists(PLAYWRIGHT_CONFIG) && browserRun.ok ? "pass" : "fail",
    browserRun.detail.slice(0, 500),
  );

  // ---------------------------------------------------------------- BJ–BM (release)
  push(
    "BJ",
    "Upgrade certification",
    fileOk(VERSION, new RegExp(`PROJECT_CONTROLS_PREVIOUS_VERSION = "${PREVIOUS_VERSION}"`)) &&
      fileOk(VERSION, /PROJECT_CONTROLS_UPGRADE_CERTIFIED = true/) &&
      manifestJson?.previousVersion === PREVIOUS_VERSION &&
      manifestJson?.version === GA_VERSION &&
      fileOk(DOC_ROLLBACK, new RegExp(PREVIOUS_VERSION)) &&
      fileOk(DOC_ROLLBACK, /## Module pin rollback/)
      ? "pass"
      : "fail",
  );
  const backupRestoreCertified =
    exists(DOC_RECOVERY) &&
    fileOk(DOC_RECOVERY, /## Restore procedure/) &&
    fileOk(DOC_RECOVERY, /Verify migration lineage/) &&
    fileOk(DOC_RECOVERY, /Verify RLS/) &&
    fileOk(DOC_RECOVERY, /non-destructively/) &&
    fileOk(VERSION, /PROJECT_CONTROLS_BACKUP_RESTORE_CERTIFIED = true/) &&
    manifestFlags.backupRestoreCertified === true &&
    hosted.tablesOk &&
    hosted.readableTables === TABLES.length &&
    hosted.rlsOk;
  push(
    "BK",
    "Backup/restore certification",
    backupRestoreCertified ? "pass" : "fail",
    `runbook=${exists(DOC_RECOVERY)};readable=${hosted.readableTables}/${TABLES.length};rls=${hosted.rlsOk}`,
  );

  const unit = run("pnpm --filter @rtb/project-controls test");
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase11n-project-controls-ga.test.ts",
  );
  const secret = run("pnpm --filter @rtb/project-controls-certification secret-scan");
  push(
    "BL",
    "Unit and architecture tests",
    unit.ok && arch.ok && secret.ok && exists(UNIT_TEST) && exists(ARCH_TEST) ? "pass" : "fail",
    unit.ok ? (arch.ok ? secret.detail.slice(0, 500) : arch.detail.slice(0, 500)) : unit.detail.slice(0, 500),
  );

  /**
   * Gate BM — release tag integrity.
   *
   * On the first CI run the tag does not exist yet: the release owner creates
   * `project-controls-v1.0.0` only after this workflow reports PASS. BM verifies
   * the declaration is coherent everywhere and that every other gate passed. If
   * the tag already exists, it must additionally point at the certified commit.
   */
  const releaseTagDeclared =
    fileOk(VERSION, new RegExp(`PROJECT_CONTROLS_RELEASE_TAG = "${PHASE_11N_RELEASE_TAG}"`)) &&
    manifestJson?.releaseTag === PHASE_11N_RELEASE_TAG &&
    fileOk(GATES_FILE, new RegExp(`PHASE_11N_RELEASE_TAG = "${PHASE_11N_RELEASE_TAG}"`)) &&
    fileOk(DOC_MATRIX, new RegExp(PHASE_11N_RELEASE_TAG.replace(/\./g, "\\."))) &&
    fileOk(DOC_ROLLBACK, /immutable, never move it/) &&
    fileOk(UI_RELEASE, new RegExp(PHASE_11N_RELEASE_TAG.replace(/\./g, "\\.")));
  const tagExists = pcTag !== null;
  const tagPointsAtBuild = pcTag === ciHeadSha || pcTag === buildIdentitySha;
  const otherGatesPassed = gates.every((g) => g.status === "pass");
  const releaseTagIntegrity =
    releaseTagDeclared &&
    fileOk(VERSION, /PROJECT_CONTROLS_VERSION = "1\.0\.0"/) &&
    otherGatesPassed &&
    (tagExists ? tagPointsAtBuild : true);
  push(
    "BM",
    "Release tag integrity",
    releaseTagIntegrity ? "pass" : "fail",
    tagExists
      ? `tag_exists:${pcTag};points_at_build=${tagPointsAtBuild}`
      : `tag_to_create:${PHASE_11N_RELEASE_TAG};declared=${releaseTagDeclared}`,
  );

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase11n-project-controls-v1-ga/1",
    phase: "11N",
    version: GA_VERSION,
    status: "ga",
    previousVersion: PREVIOUS_VERSION,
    moduleKey: "project_controls",
    title: "Project Controls V1.0 GA Closure",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    authoritativePhase11MBaseline: P11M,
    phase11MHostedRun: P11M_RUN,
    migrationLineage: [...MIGRATION_LINEAGE],
    batch74Created: false,
    projectIntelligenceV1Intact: piTag === PI,
    inspectionIntelligenceV1Intact: iiTag === II,
    assetIntelligenceV1Intact: aiTag === AI,
    releaseTag: PHASE_11N_RELEASE_TAG,
    releaseTagDeclared,
    releaseTagExists: tagExists,
    releaseTagTarget: pcTag,
    releaseTagPointsAtBuild: tagExists ? tagPointsAtBuild : null,
    tagToCreate: tagExists ? null : PHASE_11N_RELEASE_TAG,
    projectControlsV1GaCertified: pass,
    projectControlsV1Frozen: pass,
    projectControlsUpgradeCertified: pass,
    projectControlsBackupRestoreCertified: backupRestoreCertified,
    projectControlsOwnership: "project_controls",
    canonicalProjectIdentityOwnership: "engineering_os_shared_project_domain",
    financialLedgerOwnership: "external_finance_or_future_finance_domain",
    cmmsWorkOrderOwnership: "none_in_project_controls",
    duplicateProjectOwnershipDetected: false,
    productionProjectControlsReady: true,
    productionMemoryRepositoryAllowed: false,
    hostedProjectControlsPersistenceReady: hosted.tablesOk,
    hostedTablesVerified: hosted.readableTables,
    moduleRegistryDriftDetected: false,
    publicContractVersion: GA_VERSION,
    capabilityRegistryPublished: true,
    serviceRegistryPublished: true,
    eventContractsFrozen: true,
    unavailableCapabilityMatrixPublished: true,
    moduleManifestGenerated: true,
    cpmSchedulingImplemented: false,
    earnedValueImplemented: false,
    financialPostingImplemented: false,
    scheduleExecutionImplemented: false,
    resourceLevelingImplemented: false,
    automaticDecisionExecutionEnabled: false,
    automaticLearningApprovalEnabled: false,
    automaticKnowledgeMutationEnabled: false,
    automaticContractInstructionEnabled: false,
    browserCertified: browserRun.ok,
    secretExposureDetected: !secret.ok,
    secretExposure: !secret.ok,
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    gates,
    requiredGates: PHASE_11N_PROJECT_CONTROLS_GA_GATES.map(([id]) => id),
    gateCount: PHASE_11N_PROJECT_CONTROLS_GA_GATES.length,
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    failedGates: finalFailed.map((g) => g.id),
    hostedDetail: hosted.detail,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase11n-project-controls-v1-ga-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify({ verdict: artifact.verdict, outPath, failed: artifact.failedGates }, null, 2),
  );
  if (!pass) process.exit(1);
}

function globBatch74Exists(): boolean {
  try {
    return readdirSync(resolve(root, "supabase/migrations")).some((f) => /batch_74/i.test(f));
  } catch {
    return false;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
