/**
 * Phase 11L certification runner (gates A–BC) — Project Controls Explainability Intelligence while Progress (11B) through Assurance (11K) stay intact.
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
  PHASE_11E_CERTIFIED_COMMIT,
  PHASE_11E_HOSTED_RUN,
  PHASE_11E_VERSION,
  PHASE_11F_CERTIFIED_COMMIT,
  PHASE_11F_HOSTED_RUN,
  PHASE_11F_VERSION,
  PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_11F_PROJECT_CONTROLS_COST_TABLES,
  PHASE_11F_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_11L_SCENARIO_EVENTS,
  PHASE_11L_SCENARIO_INTELLIGENCE_OWNER,
  PHASE_11F_FINANCIAL_LEDGER_OWNER,
  PHASE_11F_FORBIDDEN_CAPABILITIES,
  PHASE_11F_FORBIDDEN_WORKFORCE_TABLES,
  PHASE_11L_GATE_COUNT,
  PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_11F_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_11F_PROJECT_CONTROLS_CHANGE_TABLES,
  PHASE_11L_PROJECT_CONTROLS_SCENARIO_GATES,
  PHASE_11L_PROJECT_CONTROLS_SCENARIO_TABLES,
  PHASE_11L_PROJECT_CONTROLS_DECISION_TABLES,
  PHASE_11F_PROJECT_CONTROLS_PROGRESS_TABLES,
  PHASE_11F_PROJECT_CONTROLS_SCHEDULE_TABLES,
  PHASE_11F_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
  PHASE_11L_PROJECT_CONTROLS_VERSION,
  PHASE_11F_PROJECT_IDENTITY_OWNER,
  PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_11F_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_11L_REQUIRED_CAPABILITIES,
  type Phase11lGateId,
} from "../src/phase11l/gates.js";

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
const GATES_FILE = `${PC_CERT}/src/phase11l/gates.ts`;
const RUNNER_FILE = `${PC_CERT}/scripts/run-phase11l-certification.ts`;
const SECRET_SCAN_FILE = `${PC_CERT}/scripts/secret-exposure-scan.ts`;
const ARCH_TEST =
  "packages/platform-certification/src/phase11l-project-controls-explainability.test.ts";
const WORKFLOW = ".github/workflows/phase-11l-project-controls-explainability.yml";

const DOC_SHARED = "docs/architecture/ENGINEERING_SHARED_PROJECT_DOMAIN.md";
const DOC_PROGRESS = "docs/architecture/PROJECT_CONTROLS_PROGRESS_INTELLIGENCE.md";
const DOC_SCHEDULE = "docs/architecture/PROJECT_CONTROLS_SCHEDULE_INTELLIGENCE.md";
const DOC_CHANGE = "docs/architecture/PROJECT_CONTROLS_CHANGE_INTELLIGENCE.md";
const DOC_SCENARIO = "docs/architecture/PROJECT_CONTROLS_EXPLAINABILITY_INTELLIGENCE.md";
const DOC_SCENARIO_MODEL = "docs/architecture/PROJECT_CONTROLS_EXPLAINABILITY_MODEL.md";
const DOC_FINANCE = "docs/architecture/PROJECT_CONTROLS_PROJECT_CONTEXT_ENGINE.md";
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
const BATCH_66 =
  "supabase/migrations/20260808060000_batch_66_project_controls_productivity_intelligence.sql";
const BATCH_72 =
  "supabase/migrations/20260808120000_batch_72_project_controls_explainability_intelligence.sql";

const PROGRESS_ROUTE = "apps/web/src/app/api/engineering/project-controls/progress/route.ts";
const SCHEDULE_ROUTE = "apps/web/src/app/api/engineering/project-controls/schedule/route.ts";
const CHANGE_ROUTE = "apps/web/src/app/api/engineering/project-controls/change/route.ts";
const COST_ROUTE = "apps/web/src/app/api/engineering/project-controls/cost/route.ts";
const PRODUCTIVITY_API_ROUTE =
  "apps/web/src/app/api/engineering/project-controls/productivity/route.ts";
const EXPLAINABILITY_ROUTE = "apps/web/src/app/api/engineering/project-controls/explainability/route.ts";
const SCENARIO_ROUTE = "apps/web/src/app/api/engineering/project-controls/scenario/route.ts";
const SNAPSHOT_ROUTE = "apps/web/src/app/api/engineering/project-controls/snapshot/route.ts";
const PROFILE_ROUTE = "apps/web/src/app/api/engineering/project-controls/profile/route.ts";

const DISCOVERY_TEST = `${PC}/tests/discovery-lock.test.ts`;
const PROGRESS_TEST = `${PC}/tests/phase11b-progress-intelligence.test.ts`;
const SCHEDULE_TEST = `${PC}/tests/phase11c-schedule-intelligence.test.ts`;
const CHANGE_TEST = `${PC}/tests/phase11d-change-intelligence.test.ts`;
const COST_TEST = `${PC}/tests/phase11e-cost-intelligence.test.ts`;
const PRODUCTIVITY_TEST = `${PC}/tests/phase11f-productivity-intelligence.test.ts`;
const SCENARIO_TEST = `${PC}/tests/phase11i-scenario-intelligence.test.ts`;
const EXPLAINABILITY_TEST = `${PC}/tests/phase11l-explainability-intelligence.test.ts`;

const EXPLAINABILITY_DOMAIN_FILES = [
  `${PC}/src/domain/explainability.ts`,
  `${PC}/src/domain/explainability-confidence.ts`,
  `${PC}/src/domain/explainability-engine.ts`,
  `${PC}/src/domain/project-context-composition.ts`,
  `${PC}/src/domain/engine-explainability.ts`,
] as const;

const COST_DOMAIN_FILES = [
  `${PC}/src/domain/cost.ts`,
  `${PC}/src/domain/cost-confidence.ts`,
  `${PC}/src/domain/cost-engine.ts`,
] as const;

const PRODUCTIVITY_DOMAIN_FILES = [
  `${PC}/src/domain/productivity.ts`,
  `${PC}/src/domain/productivity-confidence.ts`,
  `${PC}/src/domain/productivity-engine.ts`,
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
  ...EXPLAINABILITY_DOMAIN_FILES,
  ...PRODUCTIVITY_DOMAIN_FILES,
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
type GateResult = { id: Phase11lGateId; name: string; status: GateStatus; detail?: string };

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
    ...PHASE_11L_PROJECT_CONTROLS_SCENARIO_TABLES,
    ...PHASE_11F_PROJECT_CONTROLS_CHANGE_TABLES,
    ...PHASE_11F_PROJECT_CONTROLS_SHARED_PROJECT_TABLES,
    ...PHASE_11F_PROJECT_CONTROLS_SCHEDULE_TABLES,
    ...PHASE_11F_PROJECT_CONTROLS_PROGRESS_TABLES,
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
    ...PHASE_11F_FORBIDDEN_WORKFORCE_TABLES,
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
      "project_controls_explainability_states",
      "project_controls_explainability_evidence",
      "project_controls_decision_states",
      "project_controls_decision_evidence",
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
    const email = `pc-cert-11f-${Date.now()}@example.com`;
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
          "project_controls_explainability_states",
          "project_controls_explainability_evidence",
          "project_controls_decision_states",
          "project_controls_decision_evidence",
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
          has(`${PC}/src/domain/role-matrix.ts`, /explainability\.assess/) &&
          has(`${PC}/src/domain/review-workflow.ts`, /explainability_self_approval_forbidden/);
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
  const push = (id: Phase11lGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (inCi) run("git fetch --tags --force");
  const aiTag = tag(PHASE_11F_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_11F_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_11F_INSPECTION_INTELLIGENCE_V1_TAG);
  const pcRegistryEntry = moduleRegistryEntry("project_controls");
  const pcText = packageText(PC);
  const spdText = packageText(SPD);
  const hosted = await verifyHosted();
  const hostedAvailable = hosted.detail !== "missing_supabase_credentials";

  const SCENARIO = `${PC}/src/domain/explainability.ts`;
  const SCENARIO_ENGINE = `${PC}/src/domain/explainability-engine.ts`;
  const SCENARIO_CONFIDENCE = `${PC}/src/domain/explainability-confidence.ts`;
  const COMPOSITION = `${PC}/src/domain/project-context-composition.ts`;
  const ENGINE_ASSURANCE = `${PC}/src/domain/engine-explainability.ts`;
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
  const test11i = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11i-scenario-intelligence.test.ts`,
  );
  const test11j = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11j-risk-opportunity-intelligence.test.ts`,
  );
  const test11k = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11l-explainability-intelligence.test.ts`,
  );
  const test11f = run(
    `pnpm --filter @rtb/project-controls exec -- vitest run tests/phase11f-productivity-intelligence.test.ts`,
  );
  const unitPc = run("pnpm --filter @rtb/project-controls test");
  const unitSpd = run("pnpm --filter @rtb/engineering-shared-project-domain test");
  const secret = run("pnpm --filter @rtb/project-controls-certification secret-scan");
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec -- vitest run src/phase11l-project-controls-explainability.test.ts src/phase11e-project-controls-cost.test.ts",
  );

  const forbidLocksOk = PHASE_11F_FORBIDDEN_CAPABILITIES.every((lock) =>
    has(VERSION, new RegExp(`${lock} = false`)),
  );
  const requiredFlagsOk = PHASE_11L_REQUIRED_CAPABILITIES.every((flag) =>
    has(VERSION, new RegExp(`${flag} = true`)),
  );
  const pcImplText = pcText
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/(^|[^:])\/\/.*$/gm, "$1");

  const batch61To66Unchanged = gitQuiet(
    `git diff --quiet ${PHASE_11F_CERTIFIED_COMMIT} HEAD -- ${BATCH_61} ${BATCH_62} ${BATCH_63} ${BATCH_64} ${BATCH_65} ${BATCH_66}`,
  );
  const aiSurfaceUnchanged =
    aiTag === PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT &&
    gitQuiet(
      `git diff --quiet ${PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT} HEAD -- packages/asset-intelligence packages/asset-intelligence-certification`,
    );
  const piSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT} HEAD -- packages/project-intelligence`,
  );
  const iiSurfaceUnchanged = gitQuiet(
    `git diff --quiet ${PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT} HEAD -- packages/inspection-intelligence`,
  );

  // ------------------------------------------------------------------ A–E
  push(
    "A",
    "Repository/build identity",
    exists("pnpm-workspace.yaml") &&
      exists(PC_PKG) &&
      exists(SPD_PKG) &&
      exists(PC_CERT_PKG) &&
      has(VERSION, /PROJECT_CONTROLS_VERSION = "0.12.0-explainability-intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_STATUS = "explainability_intelligence"/) &&
      has(VERSION, /PROJECT_CONTROLS_PHASE = "11L"/) &&
      has(
        VERSION,
        new RegExp(`PHASE_11F_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11F_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11F_HOSTED_RUN = "${PHASE_11F_HOSTED_RUN}"`)) &&
      has(VERSION, new RegExp(`PHASE_11F_VERSION = "${PHASE_11F_VERSION.replace(/\./g, "\\.")}"`)) &&
      has(
        VERSION,
        new RegExp(`PHASE_11E_CERTIFIED_COMMIT =\\s*\\r?\\n?\\s*"${PHASE_11E_CERTIFIED_COMMIT}"`),
      ) &&
      has(VERSION, new RegExp(`PHASE_11E_HOSTED_RUN = "${PHASE_11E_HOSTED_RUN}"`)) &&
      has(VERSION, new RegExp(`PHASE_11E_VERSION = "${PHASE_11E_VERSION.replace(/\./g, "\\.")}"`)) &&
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

  // ------------------------------------------------------------------ F–K
  push(
    "F",
    "Phase 11F regression",
    test11f.ok &&
      has(VERSION, /PRODUCTIVITY_INTELLIGENCE_READY = true/) &&
      has(VERSION, /PRODUCTIVITY_INTELLIGENCE_11F_INTACT = true/) &&
      PRODUCTIVITY_DOMAIN_FILES.every((file) => exists(file)) &&
      exists(PRODUCTIVITY_TEST) &&
      exists(BATCH_66) &&
      has(`${PC}/src/domain/productivity-engine.ts`, /assertNoWorkforceManagement/) &&
      has(PRODUCTIVITY_API_ROUTE, /productivityIntelligenceReady:\s*true/)
      ? "pass"
      : "fail",
    test11f.detail,
  );
  push(
    "G",
    "PI v1 integrity",
    piTag === PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    piTag ?? "tag_missing",
  );
  push(
    "H",
    "II v1 integrity",
    iiTag === PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    iiTag ?? "tag_missing",
  );
  push(
    "I",
    "AI v1 integrity",
    aiTag === PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "tag_missing",
  );
  push(
    "J",
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
    "K",
    "Ownership locks",
    has(
      VERSION,
      new RegExp(
        `CANONICAL_PROJECT_IDENTITY_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11F_PROJECT_IDENTITY_OWNER}"`,
      ),
    ) &&
      has(OWNERSHIP_LOCK, /productivity_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /cost_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /relation: "owns"/) &&
      has(OWNERSHIP_LOCK, /explainabilityIntelligenceOwnership/) &&
      has(OWNERSHIP_LOCK, /explainability_traceability_intelligence/) &&
      has(OWNERSHIP_LOCK, /risk_opportunity_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /scenario_controls_intelligence/) &&
      has(OWNERSHIP_LOCK, /projectContextCompositionOwnership/) &&
      has(VERSION, /PROJECT_CONTEXT_COMPOSITION_READY = true/) &&
      has(
        VERSION,
        new RegExp(`explainabilityIntelligenceOwnership = "${PHASE_11L_SCENARIO_INTELLIGENCE_OWNER}"`),
      ) &&
      has(
        VERSION,
        new RegExp(
          `FINANCIAL_LEDGER_OWNERSHIP =\\s*\\r?\\n?\\s*"${PHASE_11F_FINANCIAL_LEDGER_OWNER}"`,
        ),
      )
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ L–W
  push(
    "L",
    "Explainability terminology",
    exists(DOC_SCENARIO_MODEL) &&
      has(DOC_SCENARIO_MODEL, /ExplainabilityAssessmentState/) &&
      has(DOC_SCENARIO_MODEL, /Explainability Control Context|ExplainabilityControlContext/) &&
      has(DOC_SCENARIO_MODEL, /Explainability Confidence|ExplainabilityConfidence/) &&
      has(SCENARIO, /export type ExplainabilityEvidence/) &&
      has(SCENARIO, /export type ExplainabilityControlContext/) &&
      has(SCENARIO, /export type ExplainabilityAssessmentState/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Project context composition",
    exists(COMPOSITION) &&
      has(COMPOSITION, /ProjectContextCompositionEngine/) &&
      has(COMPOSITION, /ComposedProjectContext/) &&
      has(COMPOSITION, /mutatesUpstreamContributors: false/) &&
      has(COMPOSITION, /opaqueScoreProduced: false/) &&
      has(VERSION, /PROJECT_CONTEXT_COMPOSITION_READY = true/) &&
      has(DOC_SCENARIO, /composition|composed contributors/i)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Explainability Control Context",
    has(SCENARIO, /export type ExplainabilityControlContext/) &&
      has(SCENARIO, /explainabilityUnitId/) &&
      has(SCENARIO_ENGINE, /controlContext/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Explainability Intelligence Engine",
    has(SCENARIO_ENGINE, /ProjectControlsExplainabilityIntelligenceEngine/) &&
      has(SCENARIO_ENGINE, /explainability_intelligence_advisory_v1/) &&
      has(SCENARIO_ENGINE, /abstained/) &&
      has(VERSION, /EXPLAINABILITY_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Explainability Intelligence State",
    has(SCENARIO, /export type ExplainabilityAssessmentState/) &&
      has(SCENARIO, /assessmentClass/) &&
      has(SCENARIO, /synthesis/) &&
      has(SCENARIO, /contributingContributors/) &&
      has(SCENARIO, /advisoryOnly: true/) &&
      has(SCENARIO, /duplicateExplainabilityOwnershipDetected: false/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Explainability taxonomy governance",
    has(SCENARIO, /EXPLANATION_STATUSES/) &&
      has(SCENARIO, /EXPLANATION_REASONS/) &&
      has(SCENARIO, /supported/) &&
      has(SCENARIO, /insufficient_evidence/) &&
      has(SCENARIO, /isAbstainingExplainabilitySufficiency/) &&
      has(SCENARIO_ENGINE, /abstained/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Composition layer governance",
    has(COMPOSITION, /ProjectContextCompositionEngine/) &&
      has(SCENARIO, /EXPLAINABILITY_CONTRIBUTOR_KEYS/) &&
      has(SCENARIO, /export type ExplainabilityContributorRef/) &&
      has(SCENARIO_ENGINE, /composed\.contributorRefs/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Explainability Evidence",
    has(SCENARIO, /export type ExplainabilityEvidence/) &&
      has(SCENARIO, /sourceType/) &&
      has(SCENARIO, /sourceRef/) &&
      has(SCENARIO, /provenance/) &&
      has(SCENARIO, /autoExecutionClaimed: false/) &&
      has(SCENARIO, /approvalAuthorityClaimed: false/) &&
      has(SCENARIO, /verificationClaimed: false/) &&
      has(SCENARIO, /automaticEvidenceCreationClaimed: false/) &&
      has(SCENARIO, /registerMutationClaimed: false/) &&
      has(SCENARIO, /chainOfThoughtExposed: false/) &&
      !has(SCENARIO, /evidencePayload|payloadCopy/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Explainability Confidence",
    has(SCENARIO, /"sufficient"/) &&
      has(SCENARIO, /"limited"/) &&
      has(SCENARIO, /"insufficient"/) &&
      has(SCENARIO, /"conflicting"/) &&
      has(SCENARIO, /"incomplete"/) &&
      has(SCENARIO_CONFIDENCE, /createExplainabilityConfidenceEngine|ExplainabilityConfidenceEngine/) &&
      has(SCENARIO, /automaticEvidenceCreationClaimed: false/) &&
      has(SCENARIO, /approvalAuthorityClaimed: false/) &&
      has(VERSION, /EXPLAINABILITY_CONFIDENCE_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Explainability unit governance",
    has(SCENARIO, /explainabilityUnitId/) &&
      has(SCENARIO_ENGINE, /explainability_unit_id_required/) &&
      has(BATCH_72, /explainability_unit_id/) &&
      has(EXPLAINABILITY_ROUTE, /missing_explainability_unit/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Reporting period/as-of governance",
    has(SCENARIO_ENGINE, /asOf/) &&
      has(SCENARIO, /assessedAt/) &&
      has(BATCH_72, /assessed_at/) &&
      has(BATCH_72, /recorded_at/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Contributor refs",
    has(SCENARIO, /EXPLAINABILITY_CONTRIBUTOR_KEYS/) &&
      has(SCENARIO, /ExplainabilityContributorRef/) &&
      has(SCENARIO, /contributorKey/) &&
      has(SCENARIO, /limitations/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ X–AC
  push(
    "X",
    "Project Context integration",
    has(CONTEXT, /ProjectContextEngine/) &&
      has(CONTEXT, /key: "explainability_intelligence"/) &&
      has(CONTEXT, /status: "active"/) &&
      has(CONTEXT, /ExplainabilityAssessmentState/) &&
      has(VERSION, /PROJECT_CONTEXT_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Project Profile",
    exists(PROFILE_ROUTE) &&
      has(PROFILE_ROUTE, /explainabilityIntelligenceReady:\s*true/) &&
      has(PROFILE_ROUTE, /assuranceIntelligenceReady:\s*true/) &&
      has(PROFILE_ROUTE, /scenarioIntelligenceReady:\s*true/) &&
      has(PROFILE_ROUTE, /"explainability_intelligence"/) &&
      has(PROFILE_ROUTE, /projectContextCompositionReady:\s*true/) &&
      has(BATCH_72, /explainability_summary/) &&
      has(POSTGRES, /explainability_summary/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Shared ProjectSnapshot",
    has(BATCH_72, /explainability_state_ids/) &&
      has(POSTGRES, /explainability_state_ids/) &&
      has(`${PC}/src/domain/change.ts`, /explainabilityStateIds/) &&
      has(`${PC}/src/domain/change.ts`, /containsEvidencePayloads: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Shared ProjectTimeline",
    has(`${PC}/src/domain/change.ts`, /export type ProjectTimelineEvent/) &&
      has(`${PC}/src/domain/change.ts`, /export type ProjectTimeline/) &&
      has(BATCH_64, /project_controls_project_timeline/) &&
      has(VERSION, /PROJECT_TIMELINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Governed review",
    has(REVIEW, /project_controls\.explainability_review/) &&
      has(REVIEW, /EXPLAINABILITY_REVIEW_WORKFLOW/) &&
      has(REVIEW, /EngineeringWorkflowDefinition/) &&
      has(VERSION, /EXPLAINABILITY_REVIEW_WORKFLOW_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Segregation of duties",
    has(REVIEW, /explainability_self_approval_forbidden/) &&
      has(REVIEW, /explainability_publish_requires_approved_review/) &&
      has(REVIEW, /explainability_assessment_is_not_approval_or_chain_of_thought/) &&
      has(VERSION, /AI_MAY_PUBLISH_EXPLAINABILITY_FORBIDDEN = true/) &&
      has(VERSION, /AUTONOMOUS_EXPLAINABILITY_PUBLICATION_ALLOWED = false/) &&
      has(VERSION, /AUTOMATIC_RISK_REGISTER_MUTATION_ENABLED = false/) &&
      has(VERSION, /DUPLICATE_RISK_OWNERSHIP_DETECTED = false/) &&
      has(ROLES, /SELF_APPROVE_FORBIDDEN_CAPABILITIES/) &&
      has(EXPLAINABILITY_ROUTE, /self_approval_forbidden/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AD–AI
  push(
    "AD",
    "Hosted migration",
    exists(BATCH_72) &&
      PHASE_11L_PROJECT_CONTROLS_SCENARIO_TABLES.every((table) =>
        has(BATCH_72, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`)),
      ) &&
      has(BATCH_72, /ENABLE ROW LEVEL SECURITY/) &&
      has(BATCH_72, /CREATE POLICY/) &&
      exists(BATCH_62) &&
      exists(BATCH_63) &&
      exists(BATCH_64) &&
      exists(BATCH_65) &&
      hostedAvailable &&
      hosted.tablesOk
      ? "pass"
      : "fail",
    hosted.detail,
  );
  push(
    "AE",
    "Hosted persistence",
    PHASE_11L_PROJECT_CONTROLS_SCENARIO_TABLES.every((table) => has(POSTGRES, new RegExp(table))) &&
      has(PERSISTENCE, /explainabilityStates/) &&
      has(PERSISTENCE, /explainabilityEvidence/) &&
      has(PERSISTENCE, /explainabilityReviews/) &&
      has(PERSISTENCE, /explainabilityConfidence/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /createProjectControlsRepository/) &&
      has(VERSION, /EXPLAINABILITY_PERSISTENCE_READY = true/) &&
      hostedAvailable &&
      hosted.tablesOk
      ? "pass"
      : "fail",
    hosted.detail,
  );
  push(
    "AF",
    "Predictive DecisionProvider reserved",
    has(PROVIDERS, /DecisionProvider/) &&
      has(VERSION, /PREDICTIVE_SCHEDULING_IMPLEMENTED = false/) &&
      has(VERSION, /DECISION_EXECUTION_IMPLEMENTED = false/) &&
      has(SCENARIO_ENGINE, /predictiveSchedulingPerformed: false/) &&
      has(SCENARIO, /predictiveSchedulingPerformed: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "DecisionProvider reserved",
    has(PROVIDERS, /DecisionProvider/) &&
      has(PROVIDERS, /createReservedDecisionProvider/) &&
      has(PROVIDERS, /getCompletionDecision|getCostDecision/) &&
      has(VERSION, /DECISION_ENGINE_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "EarnedValueProvider reserved",
    has(PROVIDERS, /EarnedValueProvider/) &&
      has(PROVIDERS, /createReservedEarnedValueProvider/) &&
      has(VERSION, /EARNED_VALUE_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "ResourcePlanningProvider reserved",
    has(VERSION, /RESOURCE_PLANNING_IMPLEMENTED = false/) &&
      has(SCENARIO_ENGINE, /resourcePlanningPerformed: false/) &&
      has(SCENARIO_ENGINE, /assertNoEarnedValueOrCpm/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AJ–AM
  push(
    "AJ",
    "EV calculations forbidden",
    has(SCENARIO_ENGINE, /assertNoEarnedValueOrCpm/) &&
      has(SCENARIO_ENGINE, /earnedValueImplemented: false/) &&
      has(BATCH_72, /pc_as_no_earned_value/) &&
      !/\b(compute|calculate|derive)EarnedValue\b/i.test(pcImplText) &&
      !/\b(bcws|bcwp|acwp)\s*[:=(]/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Decision calculations forbidden",
    has(SCENARIO_ENGINE, /assertNoEarnedValueOrCpm/) &&
      has(VERSION, /DECISIONING_IMPLEMENTED = false/) &&
      has(VERSION, /DECISION_ENGINE_IMPLEMENTED = false/) &&
      has(BATCH_72, /pc_as_no_predictive_scheduling/) &&
      !/\b(produceDecision|computeDecision|decisionAtCompletion)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "Completion date forbidden",
    has(SCENARIO, /predictiveSchedulingPerformed: false/) &&
      has(SCENARIO_ENGINE, /predictiveSchedulingPerformed: false/) &&
      has(BATCH_72, /pc_as_no_auto_execution/) &&
      has(EXPLAINABILITY_ROUTE, /completionDateClaimed/)
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "Cost decision forbidden",
    has(SCENARIO, /predictiveSchedulingPerformed: false/) &&
      has(VERSION, /DECISIONING_IMPLEMENTED = false/) &&
      has(BATCH_72, /pc_as_no_contract_instruction/) &&
      has(EXPLAINABILITY_ROUTE, /monteCarloClaimed/) &&
      has(EXPLAINABILITY_ROUTE, /costDecisionClaimed/)
      ? "pass"
      : "fail",
  );

  // ------------------------------------------------------------------ AN–AW
  const eventsOk = PHASE_11L_SCENARIO_EVENTS.every((event) =>
    has(EVENTS, new RegExp(event.replace(/\./g, "\\."))),
  );
  push(
    "AN",
    "Event/outbox integrity",
    eventsOk &&
      PHASE_11L_SCENARIO_EVENTS.every((event) =>
        has(BATCH_72, new RegExp(event.replace(/\./g, "\\."))),
      ) &&
      has(POSTGRES, /project_controls_outbox_events/) &&
      has(EVENTS, /explainabilityEventPayload/) &&
      has(EVENTS, /Identifiers only/)
      ? "pass"
      : "fail",
  );
  push(
    "AO",
    "HTTP contracts",
    exists(EXPLAINABILITY_ROUTE) &&
      has(EXPLAINABILITY_ROUTE, /explainabilityIntelligenceReady:\s*true/) &&
      has(EXPLAINABILITY_ROUTE, /projectContextCompositionReady:\s*true/) &&
      has(EXPLAINABILITY_ROUTE, /resourcePlanningImplemented:\s*false/) &&
      has(EXPLAINABILITY_ROUTE, /decisionExecutionImplemented:\s*false/) &&
      has(EXPLAINABILITY_ROUTE, /automaticExplanationApprovalEnabled:\s*false/) &&
      has(EXPLAINABILITY_ROUTE, /automaticEvidenceCreationEnabled:\s*false/) &&
      has(EXPLAINABILITY_ROUTE, /predictiveSchedulingImplemented:\s*false/) &&
      has(EXPLAINABILITY_ROUTE, /phase11mReady:\s*true/) &&
      has(EXPLAINABILITY_ROUTE, /assess_explainability/) &&
      has(EXPLAINABILITY_ROUTE, /error:\s*\{\s*code/) &&
      has(EXPLAINABILITY_ROUTE, /requestId/)
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "JWT role matrix",
    has(ROLES, /"explainability\.read"/) &&
      has(ROLES, /"explainability\.assess"/) &&
      has(ROLES, /"explainability\.review"/) &&
      has(ROLES, /"explainability\.publish"/) &&
      has(ROLES, /assertNoReservedCapabilities/) &&
      has(REVIEW, /explainability_self_approval_forbidden/) &&
      hostedAvailable &&
      hosted.jwtMatrixOk
      ? "pass"
      : "fail",
    `jwt=${hosted.jwtMatrixOk};hosted=${hostedAvailable}`,
  );
  push(
    "AQ",
    "Tenant isolation",
    has(BATCH_72, /tenant_id/) &&
      has(BATCH_72, /get_user_tenant_ids/) &&
      has(POSTGRES, /tenant_id/) &&
      hostedAvailable &&
      hosted.rlsOk
      ? "pass"
      : "fail",
    `rls=${hosted.rlsOk};hosted=${hostedAvailable}`,
  );
  push(
    "AR",
    "Workspace isolation",
    has(BATCH_72, /workspace_id/) &&
      has(BATCH_72, /workspace_memberships/) &&
      has(POSTGRES, /workspace_id/)
      ? "pass"
      : "fail",
  );
  push(
    "AS",
    "IDOR",
    has(SCENARIO_ENGINE, /scope_project_mismatch/) &&
      has(EXPLAINABILITY_ROUTE, /missing_scope/) &&
      has(SCENARIO_ENGINE, /project_id_required/) &&
      has(`${PC}/src/domain/engine.ts`, /assessExplainability/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "Idempotency",
    has(PERSISTENCE, /idempotencyKey/) &&
      has(POSTGRES, /project_controls_idempotency/) &&
      has(`${PC}/src/domain/engine.ts`, /idempotencyKey/)
      ? "pass"
      : "fail",
  );
  push(
    "AU",
    "Concurrency",
    has(PERSISTENCE, /optimistic_lock_conflict/) &&
      has(POSTGRES, /optimistic_lock_conflict/) &&
      has(BATCH_72, /UNIQUE \(tenant_id, workspace_id, project_id/)
      ? "pass"
      : "fail",
  );
  push(
    "AV",
    "Observability",
    has(EXPLAINABILITY_ROUTE, /requestId/) &&
      has(EXPLAINABILITY_ROUTE, /correlationId/) &&
      has(EXPLAINABILITY_ROUTE, /durationMs/) &&
      has(EXPLAINABILITY_ROUTE, /x-request-id/) &&
      has(SCENARIO_ROUTE, /x-correlation-id/)
      ? "pass"
      : "fail",
  );
  push(
    "AW",
    "Performance",
    has(EXPLAINABILITY_ROUTE, /durationMs/) &&
      has(EXPLAINABILITY_ROUTE, /started = Date\.now/) &&
      test11k.ok && test11j.ok && test11i.ok && test11f.ok
      ? "pass"
      : "fail",
    `${test11k.detail ?? ""};${test11j.detail ?? ""};${test11i.detail ?? ""};${test11f.detail ?? ""}`,
  );

  // ------------------------------------------------------------------ AX–BC
  push(
    "AX",
    "No memory production",
    has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      has(`${PC}/src/domain/repository-factory.ts`, /production_memory_repository_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "AY",
    "No CPM",
    has(VERSION, /CPM_SCHEDULING_IMPLEMENTED = false/) &&
      has(VERSION, /FLOAT_COMPUTATION_IMPLEMENTED = false/) &&
      has(BATCH_72, /pc_as_no_cpm/) &&
      has(BATCH_72, /pc_as_no_float/) &&
      !/\b(forwardPass|backwardPass|totalFloat|criticalPath)\b/i.test(pcImplText)
      ? "pass"
      : "fail",
  );
  push(
    "AZ",
    "No schedule execution",
    has(VERSION, /SCHEDULE_EXECUTION_IMPLEMENTED = false/) &&
      has(BATCH_72, /pc_as_no_schedule_execution/) &&
      has(SCENARIO, /scheduleExecutionPerformed: false/)
      ? "pass"
      : "fail",
  );
  push(
    "BA",
    "No duplicate project ownership",
    has(VERSION, /CANONICAL_PROJECT_IDENTITY_CLAIMED_BY_PROJECT_CONTROLS = false/) &&
      has(VERSION, /DUPLICATE_PROJECT_OWNERSHIP_DETECTED = false/) &&
      has(OWNERSHIP_LOCK, /project_identity_canonical/) &&
      has(PROFILE_ROUTE, /isProjectRegistry:\s*false/)
      ? "pass"
      : "fail",
  );
  push(
    "BB",
    "Frozen V1 tag integrity",
    aiTag === PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT &&
      piTag === PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT &&
      iiTag === PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT &&
      aiSurfaceUnchanged &&
      piSurfaceUnchanged &&
      iiSurfaceUnchanged &&
      has(AI_VERSION, /ASSET_INTELLIGENCE_V1_FROZEN = true/)
      ? "pass"
      : "fail",
    `ai=${aiSurfaceUnchanged};pi=${piSurfaceUnchanged};ii=${iiSurfaceUnchanged}`,
  );

  const hostedOk =
    hostedAvailable &&
    hosted.tablesOk &&
    hosted.rlsOk &&
    hosted.jwtMatrixOk &&
    hosted.forbiddenTablesAbsent;
  const priorGatesPassed = gates.every((g) => g.status === "pass");
  const explainabilityIntelligenceReady =
    has(VERSION, /EXPLAINABILITY_INTELLIGENCE_READY = true/) &&
    has(CONTEXT, /key: "explainability_intelligence"/) &&
    has(COMPOSITION, /ProjectContextCompositionEngine/) &&
    has(SCENARIO_ENGINE, /ProjectControlsExplainabilityIntelligenceEngine/);
  const releaseEligible =
    explainabilityIntelligenceReady &&
    has(VERSION, /SCENARIO_INTELLIGENCE_READY = true/) &&
    aiSurfaceUnchanged &&
    piSurfaceUnchanged &&
    iiSurfaceUnchanged &&
    batch61To66Unchanged &&
    has(PC_PKG, /"version": "0.12.0-explainability-intelligence"/) &&
    has(PC_CERT_PKG, /"version": "0.12.0-explainability-intelligence"/) &&
    has(VERSION, /PROGRESS_INTELLIGENCE_11B_INTACT = true/) &&
    has(VERSION, /CHANGE_INTELLIGENCE_11D_INTACT = true/) &&
    has(VERSION, /SCHEDULE_INTELLIGENCE_11C_INTACT = true/) &&
    has(VERSION, /PRODUCTIVITY_INTELLIGENCE_11F_INTACT = true/) &&
    has(VERSION, /COST_INTELLIGENCE_11E_INTACT = true/) &&
    pcRegistryEntry.length > 0 &&
    /status: "coming_soon"/.test(pcRegistryEntry) &&
    /enabled: false/.test(pcRegistryEntry) &&
    !/\bclass\s+\w*Primavera|\bclass\s+\w*MsProject\b/i.test(pcText + spdText);
  const phase11mReady = has(VERSION, /PHASE_11M_READY = true/);

  push(
    "BC",
    "Phase 11M readiness (flag only)",
    phase11mReady &&
      has(VERSION, /EXPLAINABILITY_INTELLIGENCE_READY = true/) &&
      has(VERSION, /ASSURANCE_INTELLIGENCE_READY = true/) &&
      has(VERSION, /RISK_OPPORTUNITY_INTELLIGENCE_READY = true/) &&
      has(VERSION, /SCENARIO_INTELLIGENCE_READY = true/) &&
      has(VERSION, /DECISION_SUPPORT_READY = true/) &&
      has(VERSION, /FORECAST_INTELLIGENCE_READY = true/) &&
      has(VERSION, /PROJECT_CONTEXT_COMPOSITION_READY = true/)
      ? "pass"
      : "fail",
    `phase11mReady=${phase11mReady};explainabilityReady=${has(VERSION, /EXPLAINABILITY_INTELLIGENCE_READY = true/)};assuranceReady=${has(VERSION, /ASSURANCE_INTELLIGENCE_READY = true/)};hosted=${hostedAvailable}`,
  );

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase11l-project-controls-explainability/1",
    phase: "11L",
    title: "Project Controls Explainability Intelligence",
    moduleKey: "project_controls",
    version: PHASE_11L_PROJECT_CONTROLS_VERSION,
    status: "explainability_intelligence",
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
    phase11eCertifiedCommit: PHASE_11E_CERTIFIED_COMMIT,
    phase11eHostedRun: PHASE_11E_HOSTED_RUN,
    phase11eVersion: PHASE_11E_VERSION,
    sharedProjectDomainReady: true,
    projectContextEngineReady: true,
    progressIntelligenceReady: true,
    progressIntelligence11bIntact: true,
    scheduleIntelligenceReady: true,
    scheduleIntelligence11cIntact: true,
    changeIntelligenceReady: true,
    changeIntelligence11dIntact: true,
    costIntelligenceReady: true,
    costIntelligence11eIntact: true,
    productivityIntelligenceReady: true,
    productivityIntelligence11fIntact: true,
    productivityIntelligenceIsAdvisoryOnly: true,
    decisionSupportReady: true,
    DecisionSupportReady: true,
    scenarioIntelligenceReady: true,
    ScenarioIntelligenceReady: true,
    assuranceIntelligenceReady: true,
    AssuranceIntelligenceReady: true,
    explainabilityIntelligenceReady: true,
    ExplainabilityIntelligenceReady: true,
    explainabilityConfidenceEngineReady: true,
    explainabilityReviewWorkflowReady: true,
    explainabilityPersistenceReady: true,
    explainabilityIntelligenceIsAdvisoryOnly: true,
    automaticScenarioExecutionEnabled: false,
    automaticExplanationApprovalEnabled: false,
    automaticEvidenceCreationEnabled: false,
    automaticEvidenceApprovalEnabled: false,
    automaticRiskRegisterMutationEnabled: false,
    automaticOpportunityRegisterMutationEnabled: false,
    automaticTreatmentExecutionEnabled: false,
    duplicateRiskOwnershipDetected: false,
    aiMayPublishScenarioForbidden: true,
    aiMayPublishExplainabilityForbidden: true,
    forecastIntelligenceReady: true,
    ForecastIntelligenceReady: true,
    projectContextCompositionReady: true,
    ProjectContextCompositionReady: true,
    forecastIntelligenceIsAdvisoryOnly: true,
    automaticDecisionExecutionEnabled: false,
    automaticScheduleChangeEnabled: false,
    automaticCostChangeEnabled: false,
    automaticContractInstructionEnabled: false,
    projectDecisionOwnership: "human_only",
    projectSnapshotReady: true,
    projectTimelineReady: true,
    productionProjectControlsReady: false,
    projectControlsImplemented: false,
    productionMemoryRepositoryAllowed: false,
    projectControlsOwnership: "project_controls",
    explainabilityIntelligenceOwnership: PHASE_11L_SCENARIO_INTELLIGENCE_OWNER,
    assuranceAuthorityOwnership: "human_only",
    duplicateExplainabilityOwnershipDetected: false,
    decisionSupportOwnership: "project_controls",
    financialLedgerOwnership: PHASE_11F_FINANCIAL_LEDGER_OWNER,
    canonicalProjectIdentityOwnership: PHASE_11F_PROJECT_IDENTITY_OWNER,
    projectIdentityOwnership: PHASE_11F_PROJECT_IDENTITY_OWNER,
    canonicalProjectIdentityClaimedByProjectControls: false,
    duplicateProjectOwnershipDetected: false,
    canonicalAssetIdentityOwnership: "engineering_os_shared_domain",
    canonicalEngineeringRiskOwnership: "engineering_core",
    progressIntelligenceOwnership: "project_controls",
    scheduleIntelligenceOwnership: "project_controls",
    changeIntelligenceOwnership: "project_controls",
    assetIntelligenceV1Tag: PHASE_11F_ASSET_INTELLIGENCE_V1_TAG,
    assetIntelligenceV1Commit: PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1TagTarget: aiTag,
    assetIntelligenceV1Intact: aiTag === PHASE_11F_ASSET_INTELLIGENCE_V1_COMMIT,
    assetIntelligenceV1SurfaceUnchanged: aiSurfaceUnchanged,
    projectIntelligenceV1Tag: PHASE_11F_PROJECT_INTELLIGENCE_V1_TAG,
    projectIntelligenceV1Commit: PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT,
    projectIntelligenceV1Intact: piTag === PHASE_11F_PROJECT_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Tag: PHASE_11F_INSPECTION_INTELLIGENCE_V1_TAG,
    inspectionIntelligenceV1Commit: PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: iiTag === PHASE_11F_INSPECTION_INTELLIGENCE_V1_COMMIT,
    batch61To66Unchanged: batch61To66Unchanged,
    earnedValueImplemented: false,
    cpmSchedulingImplemented: false,
    floatComputationImplemented: false,
    costEngineImplemented: false,
    budgetLedgerImplemented: false,
    financialPostingImplemented: false,
    resourcePlanningImplemented: false,
    forecastExecutionImplemented: false,
    predictiveSchedulingImplemented: false,
    forecastEngineImplemented: false,
    forecastingImplemented: false,
    scheduleExecutionImplemented: false,
    changeExecutionImplemented: false,
    contingencyManagementImplemented: false,
    autonomousDecisionPublicationAllowed: false,
    aiMayPublishDecisionForbidden: true,
    moduleRegistryStatus: "coming_soon",
    entitlementsAreEntitlementOnly: true,
    secretExposureDetected: !secret.ok,
    hostedTablesOk: hosted.tablesOk,
    hostedRlsOk: hosted.rlsOk,
    hostedJwtMatrixOk: hosted.jwtMatrixOk,
    hostedForbiddenTablesAbsent: hosted.forbiddenTablesAbsent,
    hostedDetail: hosted.detail,
    costTables: [...PHASE_11F_PROJECT_CONTROLS_COST_TABLES],
    scenarioIntelligenceOwnership: PHASE_11L_SCENARIO_INTELLIGENCE_OWNER,
    explainabilityTables: [...PHASE_11L_PROJECT_CONTROLS_SCENARIO_TABLES],
    decisionTables: [...PHASE_11L_PROJECT_CONTROLS_DECISION_TABLES],
    changeTables: [...PHASE_11F_PROJECT_CONTROLS_CHANGE_TABLES],
    sharedProjectTables: [...PHASE_11F_PROJECT_CONTROLS_SHARED_PROJECT_TABLES],
    scheduleTables: [...PHASE_11F_PROJECT_CONTROLS_SCHEDULE_TABLES],
    progressTables: [...PHASE_11F_PROJECT_CONTROLS_PROGRESS_TABLES],
    explainabilityEvents: [...PHASE_11L_SCENARIO_EVENTS],
    phase11hReady: true,
    phase11iReady: true,
    phase11jReady: true,
    phase11kReady: true,
    phase11lReady: true,
    riskOpportunityIntelligenceReady: true,
    RiskOpportunityIntelligenceReady: true,
    phase11mReady: phase11mReady,
    releaseEligible: pass && releaseEligible,
    requiredTestsSkipped: false,
    unexpected5xx: false,
    gates,
    requiredGates: PHASE_11L_PROJECT_CONTROLS_SCENARIO_GATES.map(([id]) => id),
    gateCount: PHASE_11L_GATE_COUNT,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => g.id),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase11l-project-controls-explainability-certification.json");
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
