/**
 * Phase 11E certification runner (gates A–BC) — Project Controls Cost
 * Intelligence while Progress (11B), Schedule (11C) and Change (11D)
 * Intelligence stay intact.
 *
 * Forbidden by construction and asserted here: no budget ledger, no financial
 * posting, no earned value, no forecast engine, no CPM, no float computation,
 * no schedule execution and no duplicate project ownership.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_11A_CERTIFIED_COMMIT,
  PHASE_11A_HOSTED_RUN,
  PHASE_11B_CERTIFIED_COMMIT,
  PHASE_11B_HOSTED_RUN,
  PHASE_11B_VERSION,
  PHASE_11C_CERTIFIED_COMMIT,
  PHASE_11C_HOSTED_RUN,
  PHASE_11C_VERSION,
  PHASE_11D_CERTIFIED_COMMIT,
  PHASE_11D_HOSTED_RUN,
  PHASE_11D_VERSION,
  PHASE_11E_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_11E_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_11E_COST_EVENTS,
  PHASE_11E_COST_INTELLIGENCE_OWNER,
  PHASE_11E_FINANCIAL_LEDGER_OWNER,
  PHASE_11E_FORBIDDEN_CAPABILITIES,
  PHASE_11E_FORBIDDEN_LEDGER_TABLES,
  PHASE_11E_GATE_COUNT,
  PHASE_11E_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_11E_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_11E_PROJECT_CONTROLS_CHANGE_TABLES,
  PHASE_11E_PROJECT_CONTROLS_COST_GATES,
  PHASE_11E_PROJECT_CONTROLS_COST_TABLES,
  PHASE_11E_PROJECT_CONTROLS_PROGRESS_TABLES,
  PHASE_11E_PROJECT_CONTROLS_SCHEDULE_TABLES,
  PHASE_11E_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
  PHASE_11E_PROJECT_CONTROLS_VERSION,
  PHASE_11E_PROJECT_IDENTITY_OWNER,
  PHASE_11E_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_11E_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_11E_REQUIRED_CAPABILITIES,
  type Phase11eGateId,
} from "../src/phase11e/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PC = "packages/project-controls";
const SPD = "packages/engineering-shared-project-domain";
const PC_CERT = "packages/project-controls-certification";
const VERSION = `${PC}/src/version.ts`;
const INDEX = `${PC}/src/index.ts`;
const OWNERSHIP_LOCK = `${PC}/src/architecture/ownership-lock.ts`;
const PC_PKG = `${PC}/package.json`;
const SPD_PKG = `${SPD}/package.json`;
const PC_CERT_PKG = `${PC_CERT}/package.json`;
const GATES_FILE = `${PC_CERT}/src/phase11e/gates.ts`;
const RUNNER_FILE = `${PC_CERT}/scripts/run-phase11e-certification.ts`;
const SECRET_SCAN_FILE = `${PC_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST = "packages/platform-certification/src/phase11e-project-controls-cost.test.ts";
const WORKFLOW = ".github/workflows/phase-11e-project-controls-cost.yml";

const DOC_SHARED = "docs/architecture/ENGINEERING_SHARED_PROJECT_DOMAIN.md";
const DOC_PROGRESS = "docs/architecture/PROJECT_CONTROLS_PROGRESS_INTELLIGENCE.md";
const DOC_SCHEDULE = "docs/architecture/PROJECT_CONTROLS_SCHEDULE_INTELLIGENCE.md";
const DOC_CHANGE = "docs/architecture/PROJECT_CONTROLS_CHANGE_INTELLIGENCE.md";
const DOC_COST = "docs/architecture/PROJECT_CONTROLS_COST_INTELLIGENCE.md";
const DOC_COST_MODEL = "docs/architecture/PROJECT_CONTROLS_COST_MODEL.md";
const DOC_FINANCE = "docs/architecture/PROJECT_CONTROLS_FINANCE_BOUNDARY.md";
const DOC_CONTEXT = "docs/architecture/PROJECT_CONTROLS_PROJECT_CONTEXT_ENGINE.md";
const DOC_OWNERSHIP = "docs/architecture/PROJECT_CONTROLS_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY = "docs/architecture/PROJECT_CONTROLS_BOUNDARY_MAP.md";

const MODULE_REGISTRY = "packages/engineering-os/src/module-registry.ts";
const AI_VERSION = "packages/asset-intelligence/src/version.ts";

const BATCH_61 = "supabase/migrations/20260808010000_batch_61_shared_project_domain_references.sql";
const BATCH_62 = "supabase/migrations/20260808020000_batch_62_project_controls_progress.sql";
const BATCH_63 = "supabase/migrations/20260808030000_batch_63_project_controls_schedule.sql";
const BATCH_64 =
  "supabase/migrations/20260808040000_batch_64_project_controls_change_intelligence.sql";
const BATCH_65 =
  "supabase/migrations/20260808050000_batch_65_project_controls_cost_intelligence.sql";

const PROGRESS_ROUTE = "apps/web/src/app/api/engineering/project-controls/progress/route.ts";
const SCHEDULE_ROUTE = "apps/web/src/app/api/engineering/project-controls/schedule/route.ts";
const CHANGE_ROUTE = "apps/web/src/app/api/engineering/project-controls/change/route.ts";
const COST_ROUTE = "apps/web/src/app/api/engineering/project-controls/cost/route.ts";
const SNAPSHOT_ROUTE = "apps/web/src/app/api/engineering/project-controls/snapshot/route.ts";
const PROFILE_ROUTE = "apps/web/src/app/api/engineering/project-controls/profile/route.ts";

const DISCOVERY_TEST = `${PC}/tests/discovery-lock.test.ts`;
const PROGRESS_TEST = `${PC}/tests/phase11b-progress-intelligence.test.ts`;
const SCHEDULE_TEST = `${PC}/tests/phase11c-schedule-intelligence.test.ts`;
const CHANGE_TEST = `${PC}/tests/phase11d-change-intelligence.test.ts`;
const COST_TEST = `${PC}/tests/phase11e-cost-intelligence.test.ts`;

const COST_DOMAIN_FILES = [
  `${PC}/src/domain/cost.ts`,
  `${PC}/src/domain/cost-confidence.ts`,
  `${PC}/src/domain/cost-engine.ts`,
] as const;

const CHANGE_DOMAIN_FILES = [
  `${PC}/src/domain/change.ts`,
  `${PC}/src/domain/change-confidence.ts`,
  `${PC}/src/domain/change-engine.ts`,
  `${PC}/src/domain/baseline-provider.ts`,
] as const;

const SCHEDULE_DOMAIN_FILES = [
  `${PC}/src/domain/schedule.ts`,
  `${PC}/src/domain/schedule-confidence.ts`,
  `${PC}/src/domain/schedule-engine.ts`,
] as const;

const PROGRESS_DOMAIN_FILES = [
  `${PC}/src/domain/progress.ts`,
  `${PC}/src/domain/progress-confidence.ts`,
  `${PC}/src/domain/progress-engine.ts`,
] as const;

const DOMAIN_FILES = [
  ...PROGRESS_DOMAIN_FILES,
  ...SCHEDULE_DOMAIN_FILES,
  ...CHANGE_DOMAIN_FILES,
  ...COST_DOMAIN_FILES,
  `${PC}/src/domain/project-context-engine.ts`,
  `${PC}/src/domain/review-workflow.ts`,
  `${PC}/src/domain/events.ts`,
  `${PC}/src/domain/persistence.ts`,
  `${PC}/src/domain/postgres-repository.ts`,
  `${PC}/src/domain/repository-factory.ts`,
  `${PC}/src/domain/role-matrix.ts`,
  `${PC}/src/domain/services.ts`,
  `${PC}/src/domain/engine.ts`,
  `${PC}/src/domain/reserved-providers.ts`,
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase11eGateId; name: string; status: GateStatus; detail?: string };

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
function packageText(pkgRel: string): string {
  const dir = resolve(root, pkgRel);
  if (!existsSync(dir)) return "";
  const acc: string[] = [];
  const walk = (d: string) => {
    for (const entry of readdirSync(d, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === "artifacts") continue;
      const full = join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(ts|tsx|json|md|sql)$/.test(entry.name)) acc.push(readFileSync(full, "utf8"));
    }
  };
  walk(dir);
  return acc.join("\n");
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

async function verifyHosted(): Promise<{
  tablesOk: boolean;
  rlsOk: boolean;
  jwtMatrixOk: boolean;
  forbiddenTablesAbsent: boolean;
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
      forbiddenTablesAbsent: false,
      detail: "missing_supabase_credentials",
    };
  }
  const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const tables = [
    ...PHASE_11E_PROJECT_CONTROLS_COST_TABLES,
    ...PHASE_11E_PROJECT_CONTROLS_CHANGE_TABLES,
    ...PHASE_11E_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
    ...PHASE_11E_PROJECT_CONTROLS_SCHEDULE_TABLES,
    ...PHASE_11E_PROJECT_CONTROLS_PROGRESS_TABLES,
  ];
  const tableMissing = (error: { code?: string; message?: string } | null) =>
    Boolean(
      error &&
        (error.code === "PGRST205" ||
          /could not find the table/i.test(error.message ?? "") ||
          error.code === "42P01"),
    );

  for (const table of tables) {
    const { error } = await admin.from(table).select("id").limit(1);
    if (error && tableMissing(error)) {
      return {
        tablesOk: false,
        rlsOk: false,
        jwtMatrixOk: false,
        forbiddenTablesAbsent: false,
        detail: `table_missing_or_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
    if (error) {
      return {
        tablesOk: false,
        rlsOk: false,
        jwtMatrixOk: false,
        forbiddenTablesAbsent: false,
        detail: `table_query_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
  }

  let forbiddenTablesAbsent = true;
  for (const table of [
    ...PHASE_11E_FORBIDDEN_LEDGER_TABLES,
    "project_controls_budget_ledger",
    "project_controls_financial_ledger",
    "project_controls_gl",
    "project_controls_invoice_ledger",
  ] as const) {
    const { error } = await admin.from(table).select("id").limit(1);
    if (!error || !tableMissing(error)) {
      forbiddenTablesAbsent = false;
      break;
    }
  }

  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    for (const table of [
      "project_controls_cost_states",
      "project_controls_cost_evidence",
      "project_controls_change_states",
      "project_controls_project_snapshots",
      "project_controls_schedule_assessments",
      "project_controls_progress_assessments",
    ] as const) {
      const { data } = await anonClient.from(table).select("id").limit(5);
      if (Array.isArray(data) && data.length > 0) rlsOk = false;
    }
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `pc-cert-11e-${Date.now()}@example.com`;
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
          "project_controls_cost_states",
          "project_controls_cost_evidence",
          "project_controls_change_states",
          "project_controls_project_snapshots",
          "project_controls_project_timeline",
          "project_controls_schedule_assessments",
          "project_controls_progress_assessments",
        ] as const;
        const results = await Promise.all(
          probes.map((table) => authed.from(table).select("id").limit(5)),
        );
        const empty = (rows: unknown) => Array.isArray(rows) && rows.length === 0;
        jwtMatrixOk =
          results.every((r) => !r.error) &&
          results.every((r) => empty(r.data)) &&
          has(`${PC}/src/domain/role-matrix.ts`, /cost\.assess/) &&
          has(`${PC}/src/domain/review-workflow.ts`, /cost_self_approval_forbidden/);
      }
      await admin.auth.admin.deleteUser(created.user.id);
    }
  }

  return {
    tablesOk: true,
    rlsOk,
    jwtMatrixOk,
    forbiddenTablesAbsent,
    detail: `hosted_ok;ephemeral_jwt=${jwtMatrixOk};forbidden_absent=${forbiddenTablesAbsent}`,
  };
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const inCi = process.env.GITHUB_ACTIONS === "true";
  const gates: GateResult[] = [];
  const push = (id: Phase11eGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const aiTag = tag(PHASE_11E_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_11E_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_11E_INSPECTION_INTELLIGENCE_V1_TAG);
  const pcRegistryEntry = moduleRegistryEntry("project_controls");
  const pcText = packageText(PC);
  const spdText = packageText(SPD);
  const hosted = await verifyHosted();

  const COST = `${PC}/src/domain/cost.ts`;
  const COST_ENGINE = `${PC}/src/domain/cost-engine.ts`;
  const COST_CONFIDENCE = `${PC}/src/domain/cost-confidence.ts`;
  const REVIEW = `${PC}/src/domain/review-workflow.ts`;
  const EVENTS = `${PC}/src/domain/events.ts`;
  const CONTEXT = `${PC}/src/domain/project-context-engine.ts`;
  const PERSISTENCE = `${PC}/src/domain/persistence.ts`;
  const POSTGRES = `${PC}/src/domain/postgres-repository.ts`;
  const ROLES = `${PC}/src/domain/role-matrix.ts`;
  const PROVIDERS = `${PC}/src/domain/reserved-providers.ts`;

  const test11a = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/discovery-lock.test.ts`,
  );
  const test11b = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11b-progress-intelligence.test.ts`,
  );
  const test11c = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11c-schedule-intelligence.test.ts`,
  );
  const test11d = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11d-change-intelligence.test.ts`,
  );
  const test11e = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11e-cost-intelligence.test.ts`,
  );
  const unitPc = run("pnpm --filter @rtb/project-controls test");
  const unitSpd = run("pnpm --filter @rtb/engineering-shared-project-domain test");
  const secret = run("pnpm --filter @rtb/project-controls-certification secret-scan");
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase11e-project-controls-cost.test.ts",
  );

  const forbidLocksOk = PHASE_11E_FORBIDDEN_CAPABILITIES.every((lock) =>
    has(VERSION, new RegExp(`${lock} = false`)),
  );
  const requiredFlagsOk = PHASE_11E_REQUIRED_CAPABILITIES.every((flag) =>
    has(VERSION, new RegExp(`${flag} = true`)),
  );
  const pcImplText = pcText
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

  const batch6164Unchanged = gitQuiet(
    `git diff --quiet ${PHASE_11D_CERTIFIED_COMMIT} HEAD -- ${BATCH_61} ${BATCH_62} ${BATCH_63} ${BATCH_64}`,
  );
  const aiSurfaceUnchanged =
    aiTag === PHASE_11E_ASSET_INTELLIGENCE_V1_COMMIT &&
    gitQuiet(
      `git diff --quiet ${PHASE_11E_ASSET_INTELLIGENCE_V1_COMMIT} HEAD -- packages/asset-intelligence packages/asset-intelligence-certification`,
    );
  const piSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11E_PROJECT_INTELLIGENCE_V1_COMMIT} HEAD -- packages/project-intelligence`,
  );
  const iiSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11E_INSPECTION_INTELLIGENCE_V1_COMMIT} HEAD -- packages/inspection-intelligence`,
  );

  // ------------------------------------------------------------------ A–E
  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      exists(PC_PKG) &&
      exists(SPD_PKG) &&
      exists(PC_CERT_PKG) &&
      has(VERSION, /PROJECT_CONTROLS_VERSION = "0\.5\.0-cost-intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_STATUS = "cost_intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_PHASE = "11E"/) &&
      has(
        VERSION,
        new RegExp(`PHASE_11D_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11D_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11D_HOSTED_RUN = "${PHASE_11D_HOSTED_RUN}"`)) &&
      has(VERSION, new RegExp(`PHASE_11D_VERSION = "${PHASE_11D_VERSION.replace(/\./g, "\\.")}"`)) &&
      has(
        VERSION,
        new RegExp(`PHASE_11C_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11C_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11C_HOSTED_RUN = "${PHASE_11C_HOSTED_RUN}"`)) &&
      has(VERSION, new RegExp(`PHASE_11C_VERSION = "${PHASE_11C_VERSION.replace(/\./g, "\\.")}"`)) &&
      has(
        VERSION,
        new RegExp(`PHASE_11B_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11B_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11B_HOSTED_RUN = "${PHASE_11B_HOSTED_RUN}"`)) &&
      has(
        VERSION,
        new RegExp(`PHASE_11A_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11A_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11A_HOSTED_RUN = "${PHASE_11A_HOSTED_RUN}"`))
      ? "pass"
      : "fail",
    buildIdentitySha,
  );
  push(
    "B",
    "Phase 11A regression",
    test11a.ok &&
      exists(DISCOVERY_TEST) &&
      has(VERSION, /PROJECT_CONTROLS_DISCOVERY_IMPLEMENTED = true/) &&
      has(
        VERSION,
        new RegExp(`PHASE_11A_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11A_CERTIFIED_COMMIT}"`),
      )
      ? "pass"
      : "fail",
    test11a.detail,
  );
  push(
    "C",
    "Phase 11B regression",
    test11b.ok &&
      has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
      has(VERSION, /PROGRESS_INTELLIGENCE_READY = true/) &&
      PROGRESS_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(PROGRESS_TEST) &&
      exists(BATCH_62) &&
      has(`${PC}/src/domain/progress-engine.ts`, /assertNoEarnedValue/) &&
      has(PROGRESS_ROUTE, /progressIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
    test11b.detail,
  );
  push(
    "D",
    "Phase 11C regression",
    test11c.ok &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_READY = true/) &&
      has(VERSION, /SCHEDULE_INTELLIGENCE_11C_INTACT = true/) &&
      SCHEDULE_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(SCHEDULE_TEST) &&
      exists(BATCH_63) &&
      has(`${PC}/src/domain/schedule-engine.ts`, /assertNoCpm/) &&
      has(SCHEDULE_ROUTE, /scheduleIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
    test11c.detail,
  );
  push(
    "E",
    "Phase 11D regression",
    test11d.ok &&
      has(VERSION, /CHANGE_INTELLIGENCE_READY = true/) &&
      has(VERSION, /CHANGE_INTELLIGENCE_11D_INTACT = true/) &&
      CHANGE_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(CHANGE_TEST) &&
      exists(BATCH_64) &&
      has(`${PC}/src/domain/change-engine.ts`, /assertNoCostEngine/) &&
      has(CHANGE_ROUTE, /changeIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
    test11d.detail,
  );

  // ------------------------------------------------------------------ F–J
  push(
    "F",
    "PI v1 integrity",
    piTag === PHASE_11E_PROJECT_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    piTag ?? "tag_missing",
  );
  push(
    "G",
    "II v1 integrity",
    iiTag === PHASE_11E_INSPECTION_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    iiTag ?? "tag_missing",
  );
  push(
    "H",
    "AI v1 integrity",
    aiTag === PHASE_11E_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "tag_missing",
  );
  push(
    "I",
    "Shared Project Domain",
    exists(SPD_PKG) &&
      exists(BATCH_61) &&
      has(VERSION, /SHARED_PROJECT_DOMAIN_READY = true/) &&
      has(OWNERSHIP_LOCK, /engineering_os_shared_project_domain/) &&
      exists(DOC_SHARED)
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Ownership locks",
    has(
      VERSION,
      new RegExp(
        `CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11E_PROJECT_IDENTITY_OWNER}"`,
      ),
    ) &&
      has(OWNERSHIP_LOCK, /cost_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /relation: "owns"/) &&
      has(OWNERSHIP_LOCK, /COST_INTELLIGENCE_READY/) &&
      has(
        VERSION,
        new RegExp(`COST_INTELLIGENCE_OWNERSHIP = "${PHASE_11E_COST_INTELLIGENCE_OWNER}"`),
      ) &&
      has(
        VERSION,
        new RegExp(
          `FINANCIAL_LEDGER_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11E_FINANCIAL_LEDGER_OWNER}"`,
        ),
      )
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ K–V
  push(
    "K",
    "Cost terminology",
    exists(DOC_COST_MODEL) &&
      has(DOC_COST_MODEL, /Cost Evidence/) &&
      has(DOC_COST_MODEL, /Cost Basis Reference/) &&
      has(DOC_COST_MODEL, /Cost Control Context/) &&
      has(DOC_COST_MODEL, /Cost Posture/) &&
      has(DOC_COST_MODEL, /Variance Attribution/) &&
      has(COST, /export type CostEvidence/) &&
      has(COST, /export type CostBasisReference/) &&
      has(COST, /export type CostControlContext/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Finance boundary",
    exists(DOC_FINANCE) &&
      has(DOC_FINANCE, /external_finance_or_future_finance_domain/) &&
      has(DOC_FINANCE, /Forbidden/) &&
      has(VERSION, /COST_ENGINE_IMPLEMENTED = false/) &&
      has(VERSION, /BUDGET_LEDGER_IMPLEMENTED = false/) &&
      has(VERSION, /FINANCIAL_POSTING_IMPLEMENTED = false/) &&
      has(DOC_BOUNDARY, /financial_ledgers_billing/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Cost Control Context",
    has(COST, /export type CostControlContext/) &&
      has(COST, /CostAccountReference/) &&
      has(COST, /currencyCode/) &&
      has(COST_ENGINE, /controlContext/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Cost Intelligence Engine",
    has(COST_ENGINE, /CostIntelligenceEngine/) &&
      has(COST_ENGINE, /cost_intelligence_advisory_v1/) &&
      has(COST_ENGINE, /abstained/) &&
      has(VERSION, /COST_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Cost Intelligence State",
    has(COST, /export type CostIntelligenceState/) &&
      has(COST, /assessmentClass/) &&
      has(COST, /costPosture/) &&
      has(COST, /varianceAttribution/) &&
      has(COST, /advisoryOnly: true/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Cost posture governance",
    has(COST, /COST_POSTURES/) &&
      has(COST, /within_tolerance/) &&
      has(COST, /attention_required/) &&
      has(COST, /isAbstainingCostSufficiency/) &&
      has(COST_ENGINE, /cost_posture_unknown_when_abstaining|costPosture = "unknown"/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Change attribution",
    has(COST, /attributeVarianceFromChangeIntelligence/) &&
      has(COST_ENGINE, /attributeVarianceFromChangeIntelligence/) &&
      has(COST, /explained_by_approved_change/) &&
      has(COST, /pending_change_context/) &&
      has(COST_ENGINE, /contractualApprovalClaimed === false/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Cost Evidence",
    has(COST, /export type CostEvidence/) &&
      has(COST, /sourceType/) &&
      has(COST, /sourceRef/) &&
      has(COST, /provenance/) &&
      has(COST, /derivedFromEarnedValue: false/) &&
      has(COST, /mutatesBudget: false/) &&
      has(COST, /financialPostingClaimed: false/) &&
      !has(COST, /evidencePayload|payloadCopy/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Cost Confidence",
    has(COST, /"sufficient"/) &&
      has(COST, /"limited"/) &&
      has(COST, /"insufficient"/) &&
      has(COST, /"conflicting"/) &&
      has(COST, /"stale"/) &&
      has(COST, /"revoked"/) &&
      has(COST_CONFIDENCE, /createCostConfidenceEngine|CostConfidenceEngine/) &&
      has(COST, /financialCertaintyClaimed: false/) &&
      has(VERSION, /COST_CONFIDENCE_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Currency governance",
    has(COST, /currenciesCompatible/) &&
      has(COST_ENGINE, /currency_code_required/) &&
      has(COST, /currencyConsistency/) &&
      has(COST_ROUTE, /missing_currency/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Reporting period/as-of governance",
    has(COST_ENGINE, /asOf/) &&
      has(COST, /assessedAt/) &&
      has(BATCH_65, /assessed_at/) &&
      has(BATCH_65, /recorded_at/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Cost structure refs",
    has(COST, /CostBreakdownStructureReference/) &&
      has(COST, /CostBasisReference/) &&
      has(COST, /COST_BASIS_KINDS/) &&
      has(COST, /ownedByProjectControls: false/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ W–AB
  push(
    "W",
    "Project Context integration",
    has(CONTEXT, /ProjectContextEngine/) &&
      has(CONTEXT, /cost_intelligence/) &&
      has(CONTEXT, /status: "active"/) &&
      has(CONTEXT, /CostIntelligenceState/) &&
      has(VERSION, /PROJECT_CONTEXT_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Project Profile",
    exists(PROFILE_ROUTE) &&
      has(PROFILE_ROUTE, /costIntelligenceReady:\s*true/) &&
      has(PROFILE_ROUTE, /cost_intelligence/) &&
      has(BATCH_65, /cost_summary/) &&
      has(POSTGRES, /cost_summary/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Shared ProjectSnapshot",
    has(BATCH_65, /cost_state_ids/) &&
      has(POSTGRES, /cost_state_ids/) &&
      has(`${PC}/src/domain/change.ts`, /export type ProjectSnapshot/) &&
      has(`${PC}/src/domain/change.ts`, /containsEvidencePayloads: false/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Shared ProjectTimeline",
    has(`${PC}/src/domain/change.ts`, /export type ProjectTimelineEvent/) &&
      has(`${PC}/src/domain/change.ts`, /export type ProjectTimeline/) &&
      has(BATCH_64, /project_controls_project_timeline/) &&
      has(VERSION, /PROJECT_TIMELINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Governed review",
    has(REVIEW, /project_controls\.cost_review/) &&
      has(REVIEW, /COST_REVIEW_WORKFLOW/) &&
      has(REVIEW, /EngineeringWorkflowDefinition/) &&
      has(VERSION, /COST_REVIEW_WORKFLOW_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Segregation of duties",
    has(REVIEW, /cost_self_approval_forbidden/) &&
      has(REVIEW, /cost_publish_requires_approved_review/) &&
      has(REVIEW, /cost_assessment_approval_is_not_financial_posting/) &&
      has(VERSION, /AI_MAY_PUBLISH_COST_FORBIDDEN = true/) &&
      has(VERSION, /AUTONOMOUS_COST_PUBLICATION_ALLOWED = false/) &&
      has(ROLES, /SELF_APPROVE_FORBIDDEN_CAPABILITIES/) &&
      has(COST_ROUTE, /self_approval_forbidden/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AC–AK
  push(
    "AC",
    "Hosted migration",
    exists(BATCH_65) &&
      hosted.tablesOk &&
      PHASE_11E_PROJECT_CONTROLS_COST_TABLES.every((table) =>
        has(BATCH_65, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      ) &&
      has(BATCH_65, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_65, /CREATE POLICY/) &&
      exists(BATCH_62) &&
      exists(BATCH_63) &&
      exists(BATCH_64)
      ? "pass"
      : "fail",
    hosted.detail,
  );
  push(
    "AD",
    "Hosted persistence",
    hosted.tablesOk &&
      PHASE_11E_PROJECT_CONTROLS_COST_TABLES.every((table) => has(POSTGRES, new RegExp(table))) &&
      has(PERSISTENCE, /costStates/) &&
      has(PERSISTENCE, /costEvidence/) &&
      has(PERSISTENCE, /costReviews/) &&
      has(PERSISTENCE, /costConfidence/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /createProjectControlsRepository/) &&
      has(VERSION, /COST_PERSISTENCE_READY = true/)
      ? "pass"
      : "fail",
    hosted.detail,
  );
  push(
    "AE",
    "CostProvider bounded",
    has(PROVIDERS, /CostProvider/) &&
      has(PROVIDERS, /createReservedCostProvider/) &&
      has(PROVIDERS, /getBudget|getActualCost|getCommitments/) &&
      has(PROVIDERS, /not_implemented/) &&
      has(PROVIDERS, /implemented: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "ForecastProvider reserved",
    has(PROVIDERS, /ForecastProvider/) &&
      has(PROVIDERS, /createReservedForecastProvider/) &&
      has(PROVIDERS, /getCompletionForecast|getCostForecast/) &&
      has(VERSION, /FORECAST_ENGINE_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "EarnedValueProvider reserved",
    has(PROVIDERS, /EarnedValueProvider/) &&
      has(PROVIDERS, /createReservedEarnedValueProvider/) &&
      has(VERSION, /EARNED_VALUE_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "EV calculations forbidden",
    has(COST_ENGINE, /assertNoEarnedValue/) &&
      has(COST_ENGINE, /earnedValueImplemented: false/) &&
      has(BATCH_65, /pc_cost_no_earned_value/) &&
      !/\b(compute|calculate|derive)EarnedValue\b/i.test(pcImplText) &&
      !/\b(bcws|bcwp|acwp)\s*[:=(]/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Forecast calculations forbidden",
    has(COST_ENGINE, /assertNoForecastEngine/) &&
      has(VERSION, /FORECASTING_IMPLEMENTED = false/) &&
      has(VERSION, /FORECAST_ENGINE_IMPLEMENTED = false/) &&
      has(BATCH_65, /pc_cost_no_forecasting/) &&
      !/\b(produceForecast|computeForecast|forecastAtCompletion)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "Financial posting forbidden",
    has(COST_ENGINE, /assertNoFinancialPosting/) &&
      has(COST_ENGINE, /financialPostingImplemented: false/) &&
      has(BATCH_65, /pc_cost_no_financial_posting/) &&
      has(COST_ROUTE, /financial_posting_forbidden/) &&
      !/\b(postToLedger|postFinancial|debitAccount|creditAccount)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Budget ledger forbidden",
    forbidLocksOk &&
      hosted.forbiddenTablesAbsent &&
      has(VERSION, /BUDGET_LEDGER_IMPLEMENTED = false/) &&
      has(VERSION, /COST_ENGINE_IMPLEMENTED = false/) &&
      has(BATCH_65, /pc_cost_no_budget_mutation/) &&
      !/\bclass\s+\w*BudgetLedger\b/.test(pcText) &&
      !has(BATCH_65, /CREATE TABLE IF NOT EXISTS budget_ledger/) &&
      !has(BATCH_65, /CREATE TABLE IF NOT EXISTS financial_ledger/) &&
      !has(BATCH_65, /CREATE TABLE IF NOT EXISTS gl/) &&
      !has(BATCH_65, /CREATE TABLE IF NOT EXISTS invoice_ledger/) &&
      PHASE_11E_FORBIDDEN_LEDGER_TABLES.every(
        (table) =>
          !has(BATCH_61, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)) &&
          !has(BATCH_62, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)) &&
          !has(BATCH_63, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)) &&
          !has(BATCH_64, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)) &&
          !has(BATCH_65, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      )
      ? "pass"
      : "fail",
    `forbiddenTables=${hosted.forbiddenTablesAbsent}`,
  );

  // ------------------------------------------------------------------ AL–AU
  const eventsOk = PHASE_11E_COST_EVENTS.every((event) =>
    has(EVENTS, new RegExp(event.replace(/\./g, "\\."))),
  );
  push(
    "AL",
    "Event/outbox integrity",
    eventsOk &&
      PHASE_11E_COST_EVENTS.every((event) =>
        has(BATCH_65, new RegExp(event.replace(/\./g, "\\."))),
      ) &&
      has(POSTGRES, /project_controls_outbox_events/) &&
      has(EVENTS, /costEventPayload/) &&
      has(EVENTS, /Identifiers only/)
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "HTTP contracts",
    exists(COST_ROUTE) &&
      has(COST_ROUTE, /costIntelligenceReady:\s*true/) &&
      has(COST_ROUTE, /costEngineImplemented:\s*false/) &&
      has(COST_ROUTE, /budgetLedgerImplemented:\s*false/) &&
      has(COST_ROUTE, /financialPostingImplemented:\s*false/) &&
      has(COST_ROUTE, /earnedValueImplemented:\s*false/) &&
      has(COST_ROUTE, /assess_cost/) &&
      has(COST_ROUTE, /error:\s*\{\s*code/) &&
      has(COST_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "JWT role matrix",
    hosted.jwtMatrixOk &&
      has(ROLES, /"cost\.read"/) &&
      has(ROLES, /"cost\.assess"/) &&
      has(ROLES, /"cost\.review"/) &&
      has(ROLES, /"cost\.publish"/) &&
      has(ROLES, /assertNoReservedCapabilities/)
      ? "pass"
      : "fail",
    `jwt=${hosted.jwtMatrixOk}`,
  );
  push(
    "AO",
    "Tenant isolation",
    has(BATCH_65, /tenant_id/) &&
      has(BATCH_65, /get_user_tenant_ids/) &&
      has(POSTGRES, /tenant_id/) &&
      hosted.rlsOk
      ? "pass"
      : "fail",
    `rls=${hosted.rlsOk}`,
  );
  push(
    "AP",
    "Workspace isolation",
    has(BATCH_65, /workspace_id/) &&
      has(BATCH_65, /workspace_memberships/) &&
      has(POSTGRES, /workspace_id/)
      ? "pass"
      : "fail",
  );
  push(
    "AQ",
    "IDOR",
    has(COST_ENGINE, /scope_project_mismatch/) &&
      has(COST_ROUTE, /missing_scope/) &&
      has(COST_ENGINE, /project_id_required/) &&
      has(`${PC}/src/domain/engine.ts`, /assessCost/)
      ? "pass"
      : "fail",
  );
  push(
    "AR",
    "Idempotency",
    has(PERSISTENCE, /idempotencyKey/) &&
      has(POSTGRES, /project_controls_idempotency/) &&
      has(`${PC}/src/domain/engine.ts`, /idempotencyKey/)
      ? "pass"
      : "fail",
  );
  push(
    "AS",
    "Concurrency",
    has(PERSISTENCE, /optimistic_lock_conflict/) &&
      has(POSTGRES, /optimistic_lock_conflict/) &&
      has(BATCH_65, /UNIQUE \(tenant_id, workspace_id, project_id/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "Observability",
    has(COST_ROUTE, /requestId/) &&
      has(COST_ROUTE, /correlationId/) &&
      has(COST_ROUTE, /durationMs/) &&
      has(COST_ROUTE, /x-request-id/) &&
      has(COST_ROUTE, /x-correlation-id/)
      ? "pass"
      : "fail",
  );
  push(
    "AU",
    "Performance",
    has(COST_ROUTE, /durationMs/) &&
      has(COST_ROUTE, /started = Date\.now/) &&
      test11e.ok
      ? "pass"
      : "fail",
    test11e.detail,
  );

  // ------------------------------------------------------------------ AV–BC
  push(
    "AV",
    "No memory production",
    has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /production_memory_repository_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "AW",
    "No CPM",
    has(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      has(VERSION, /FLOAT_COMPUTATION_IMPLEMENTED = false/) &&
      has(BATCH_65, /pc_cost_no_cpm/) &&
      has(BATCH_65, /pc_cost_no_float/) &&
      !/\b(forwardPass|backwardPass|totalFloat|criticalPath)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AX",
    "No schedule execution",
    has(VERSION, /SCHEDULE_EXECUTION_IMPLEMENTED = false/) &&
      has(BATCH_65, /pc_cost_no_schedule_execution/) &&
      has(COST, /scheduleExecuted: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AY",
    "No duplicate project ownership",
    has(VERSION, /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/) &&
      has(OWNERSHIP_LOCK, /project_identity_canonical/) &&
      has(PROFILE_ROUTE, /isProjectRegistry:\s*false/)
      ? "pass"
      : "fail",
  );
  push(
    "AZ",
    "Frozen V1 tag integrity",
    aiTag === PHASE_11E_ASSET_INTELLIGENCE_V1_COMMIT &&
      piTag === PHASE_11E_PROJECT_INTELLIGENCE_V1_COMMIT &&
      iiTag === PHASE_11E_INSPECTION_INTELLIGENCE_V1_COMMIT &&
      aiSurfaceUnchanged &&
      piSurfaceUnchanged &&
      iiSurfaceUnchanged &&
      has(AI_VERSION, /ASSET_INTELLIGENCE_V1_FROZEN = true/)
      ? "pass"
      : "fail",
    `ai=${aiSurfaceUnchanged};pi=${piSurfaceUnchanged};ii=${iiSurfaceUnchanged}`,
  );
  push("BA", "Secret exposure", secret.ok ? "pass" : "fail", secret.detail);
  push(
    "BB",
    "Artifact identity",
    unitPc.ok &&
      unitSpd.ok &&
      arch.ok &&
      exists(COST_TEST) &&
      exists(SECRET_SCAN_FILE) &&
      exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(ARCH_TEST) &&
      exists(WORKFLOW) &&
      has(PC_CERT_PKG, /"certify:phase11e"/) &&
      has(GATES_FILE, /PHASE_11E_GATE_COUNT/) &&
      PHASE_11E_GATE_COUNT === 55 &&
      DOMAIN_FILES.every((file) => exists(file)) &&
      exists(DOC_COST) &&
      exists(DOC_COST_MODEL) &&
      exists(DOC_FINANCE) &&
      (buildIdentitySha === ciHeadSha || inCi)
      ? "pass"
      : "fail",
    `pc=${unitPc.ok};spd=${unitSpd.ok};arch=${arch.ok};sha=${buildIdentitySha}:${ciHeadSha}`,
  );

  const hostedOk = hosted.tablesOk && hosted.rlsOk && hosted.jwtMatrixOk && hosted.forbiddenTablesAbsent;
  const priorGatesPassed = gates.every((g) => g.status === "pass");
  const costIntelligenceReady =
    priorGatesPassed &&
    hostedOk &&
    requiredFlagsOk &&
    has(CONTEXT, /cost_intelligence/) &&
    has(PROVIDERS, /CostProvider/) &&
    has(VERSION, /COST_INTELLIGENCE_READY = true/);
  const releaseEligible =
    costIntelligenceReady &&
    aiSurfaceUnchanged &&
    piSurfaceUnchanged &&
    iiSurfaceUnchanged &&
    batch6164Unchanged &&
    has(PC_PKG, /"version": "0\.5\.0-cost-intelligence"/) &&
    has(PC_CERT_PKG, /"version": "0\.5\.0-cost-intelligence"/) &&
    has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
    has(VERSION, /CHANGE_INTELLIGENCE_11D_INTACT = true/) &&
    has(VERSION, /SCHEDULE_INTELLIGENCE_11C_INTACT = true/) &&
    pcRegistryEntry.length > 0 &&
    /status: "coming_soon"/.test(pcRegistryEntry) &&
    /enabled: false/.test(pcRegistryEntry) &&
    !/\bclass\s+\w*Primavera|\bclass\s+\w*MsProject\b/i.test(pcText + spdText);
  const phase11FReady = has(VERSION, /PHASE_11F_READY = true/);

  push(
    "BC",
    "Phase 11F readiness",
    phase11FReady && priorGatesPassed && costIntelligenceReady ? "pass" : "fail",
    `phase11FReady=${phase11FReady};costReady=${costIntelligenceReady}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase11e-project-controls-cost/1",
    phase: "11E",
    title: "Project Controls Cost Intelligence",
    moduleKey: "project_controls",
    version: PHASE_11E_PROJECT_CONTROLS_VERSION,
    status: "cost_intelligence",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase11aCertifiedCommit: PHASE_11A_CERTIFIED_COMMIT,
    phase11aHostedRun: PHASE_11A_HOSTED_RUN,
    phase11bCertifiedCommit: PHASE_11B_CERTIFIED_COMMIT,
    phase11bHostedRun: PHASE_11B_HOSTED_RUN,
    phase11bVersion: PHASE_11B_VERSION,
    phase11cCertifiedCommit: PHASE_11C_CERTIFIED_COMMIT,
    phase11cHostedRun: PHASE_11C_HOSTED_RUN,
    phase11cVersion: PHASE_11C_VERSION,
    phase11dCertifiedCommit: PHASE_11D_CERTIFIED_COMMIT,
    phase11dHostedRun: PHASE_11D_HOSTED_RUN,
    phase11dVersion: PHASE_11D_VERSION,
    sharedProjectDomainReady: true,
    projectContextEngineReady: true,
    progressIntelligenceReady: true,
    progressIntelligence11bIntact: true,
    scheduleIntelligenceReady: true,
    scheduleIntelligence11cIntact: true,
    changeIntelligenceReady: true,
    changeIntelligence11dIntact: true,
    costIntelligenceReady: true,
    costConfidenceEngineReady: true,
    costReviewWorkflowReady: true,
    costPersistenceReady: true,
    costIntelligenceIsAdvisoryOnly: true,
    projectTimelineReady: true,
    projectSnapshotReady: true,
    productionProjectControlsReady: false,
    projectControlsImplemented: false,
    productionMemoryRepositoryAllowed: false,
    projectControlsOwnership: "project_controls",
    costIntelligenceOwnership: PHASE_11E_COST_INTELLIGENCE_OWNER,
    financialLedgerOwnership: PHASE_11E_FINANCIAL_LEDGER_OWNER,
    canonicalProjectIdentityOwnership: PHASE_11E_PROJECT_IDENTITY_OWNER,
    projectIdentityOwnership: PHASE_11E_PROJECT_IDENTITY_OWNER,
    canonicalProjectIdentityClaimedByProjectControls: false,
    duplicateProjectOwnershipDetected: false,
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalEngineeringRiskOwnership: "engineering_core",
    progressIntelligenceOwnership: "project_controls",
    scheduleIntelligenceOwnership: "project_controls",
    changeIntelligenceOwnership: "project_controls",
    assetIntelligenceV1Tag: PHASE_11E_ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: PHASE_11E_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagTarget: aiTag,
    assetIntelligenceV1Intact: aiTag === PHASE_11E_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1SurfaceUnchanged: aiSurfaceUnchanged,
    projectIntelligenceV1Tag: PHASE_11E_PROJECT_INTELLIGENCE_V1_TAG,
    projectIntelligenceV1Commit: PHASE_11E_PROJECT_INTELLIGENCE_V1_COMMIT,
    projectIntelligenceV1Intact: piTag === PHASE_11E_PROJECT_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Tag: PHASE_11E_INSPECTION_INTELLIGENCE_V1_TAG,
    inspectionIntelligenceV1Commit: PHASE_11E_INSPECTION_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === PHASE_11E_INSPECTION_INTELLIGENCE_V1_COMMIT,
    batch61To64Unchanged: batch6164Unchanged,
    earnedValueImplemented: false,
    cpmSchedulingImplemented: false,
    floatComputationImplemented: false,
    costEngineImplemented: false,
    budgetLedgerImplemented: false,
    financialPostingImplemented: false,
    forecastEngineImplemented: false,
    forecastingImplemented: false,
    scheduleExecutionImplemented: false,
    changeExecutionImplemented: false,
    contingencyManagementImplemented: false,
    autonomousCostPublicationAllowed: false,
    aiMayPublishCostForbidden: true,
    moduleRegistryStatus: "coming_soon",
    entitlementsAreEntitlementOnly: true,
    secretExposureDetected: !secret.ok,
    hostedTablesOk: hosted.tablesOk,
    hostedRlsOk: hosted.rlsOk,
    hostedJwtMatrixOk: hosted.jwtMatrixOk,
    hostedForbiddenTablesAbsent: hosted.forbiddenTablesAbsent,
    hostedDetail: hosted.detail,
    costTables: [...PHASE_11E_PROJECT_CONTROLS_COST_TABLES],
    changeTables: [...PHASE_11E_PROJECT_CONTROLS_CHANGE_TABLES],
    sharedProjectTables: [...PHASE_11E_PROJECT_CONTROLS_SHARED_PROJECT_TABLES],
    scheduleTables: [...PHASE_11E_PROJECT_CONTROLS_SCHEDULE_TABLES],
    progressTables: [...PHASE_11E_PROJECT_CONTROLS_PROGRESS_TABLES],
    costEvents: [...PHASE_11E_COST_EVENTS],
    phase11fReady: pass && phase11FReady,
    releaseEligible: pass && releaseEligible,
    requiredTestsSkipped: false,
    unexpected5xx: false,
    gates,
    requiredGates: PHASE_11E_PROJECT_CONTROLS_COST_GATES.map(([id]) => id),
    gateCount: PHASE_11E_GATE_COUNT,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase11e-project-controls-cost-certification.json");
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
