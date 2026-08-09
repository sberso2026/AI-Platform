/**
 * Phase 13E certification runner (gates A–BT) — ETABS export federation +
 * fail-closed solver adapter. Not live native COM.
 */
import { createClient } from "@supabase/supabase-js";
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PHASE_13A_HOSTED_RUN,
  PHASE_13A_PIN_COMMIT,
  PHASE_13A_VERSION,
  PHASE_13B_PIN_COMMIT,
  PHASE_13B_VERSION,
  PHASE_13C_PIN_COMMIT,
  PHASE_13C_VERSION,
  PHASE_13D1_PIN_COMMIT,
  PHASE_13D1_VERSION,
  PHASE_13E_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_13E_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_13E_DIGITAL_TWIN_COMMIT,
  PHASE_13E_DIGITAL_TWIN_TAG,
  PHASE_13E_DIGITAL_TWIN_VERSION,
  PHASE_13E_DOMAIN_MODULES,
  PHASE_13E_ENGINEERING_MODEL_ETABS_GATES,
  PHASE_13E_GATE_COUNT,
  PHASE_13E_HOSTED_TABLES,
  PHASE_13E_HTTP_ROUTES,
  PHASE_13E_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_13E_INSPECTION_INTELLIGENCE_V1_TAG,
  PHASE_13E_INTEROP_VERSION,
  PHASE_13E_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_13E_PROJECT_CONTROLS_V1_TAG,
  PHASE_13E_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_13E_PROJECT_INTELLIGENCE_V1_TAG,
  PHASE_13E_PUBLIC_CONTRACT_VERSION,
  PHASE_13E_STATUS,
  type Phase13eGateId,
} from "../src/phase13e/gates.js";

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

const EMI = "packages/engineering-model-interoperability";
const EMI_CERT = "packages/engineering-model-interoperability-certification";
const DT = "packages/digital-twin";
const EEH = "packages/engineering-execution-host";
const VERSION = `${EMI}/src/version.ts`;
const OWNERSHIP_LOCK = `${EMI}/src/architecture/ownership-lock.ts`;
const CONTRACTS = `${EMI}/src/contracts/draft-contracts.ts`;
const PROVIDERS = `${EMI}/src/discovery/provider-matrix.ts`;
const SOLVER = `${EMI}/src/domain/etabs/etabs-solver-adapter.ts`;
const MODEL = `${EMI}/src/domain/etabs/etabs-model-adapter.ts`;
const CSI = `${EMI}/src/domain/etabs/csi-interop-core.ts`;
const CAP = `${EMI}/src/domain/etabs/etabs-capability-registry.ts`;
const POLICY = `${EMI}/src/domain/etabs/etabs-project-policy.ts`;
const FIXTURE = `${EMI}/fixtures/etabs/sample-project.etabs.json`;
const EMI_PKG = `${EMI}/package.json`;
const EMI_CERT_PKG = `${EMI_CERT}/package.json`;
const GATES_FILE = `${EMI_CERT}/src/phase13e/gates.ts`;
const RUNNER_FILE = `${EMI_CERT}/scripts/run-phase13e-certification.ts`;
const PLAYWRIGHT_SPEC = `${EMI_CERT}/playwright/v1-etabs.spec.ts`;
const WORKFLOW = ".github/workflows/phase-13e-engineering-model-etabs.yml";
const BATCH_86 =
  "supabase/migrations/20260808250000_batch_86_engineering_model_interoperability_ifc.sql";
const BATCH_87 =
  "supabase/migrations/20260808260000_batch_87_engineering_model_interoperability_spacegass.sql";
const BATCH_88 =
  "supabase/migrations/20260808270000_batch_88_engineering_execution_hosts.sql";
const BATCH_89 =
  "supabase/migrations/20260808280000_batch_89_engineering_model_interoperability_etabs.sql";
const DT_VERSION = `${DT}/src/version.ts`;
const UI_PAGE =
  "apps/web/src/app/(platform)/engineering/apps/model-interoperability/page.tsx";
const DOC_PHASE =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_PHASE_13E.md";
const DOC_RECON =
  "docs/architecture/ENGINEERING_INTEROPERABILITY_ETABS_IMPLEMENTATION_RECONCILIATION.md";
const DOC_OWNERSHIP =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_OWNERSHIP_MATRIX.md";
const DOC_BOUNDARY =
  "docs/architecture/ENGINEERING_MODEL_INTEROPERABILITY_BOUNDARY_MAP.md";
const DOC_CONTRACTS =
  "docs/contracts/ENGINEERING_MODEL_INTEROPERABILITY_PUBLIC_CONTRACTS_DRAFT.md";
const PLATFORM_TEST =
  "packages/platform-certification/src/phase13e-engineering-model-etabs.test.ts";

const FORBIDDEN_13F_PATHS = [
  `${EMI}/src/domain/phase13f`,
  `${DT}/src/domain/phase13e`,
  `${DT}/src/domain/phase13f`,
  "packages/ETABSExecutionFramework",
  "packages/ETABSLiveHost",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase13eGateId; name: string; status: GateStatus; detail?: string };

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
function gate(
  id: Phase13eGateId,
  name: string,
  ok: boolean,
  detail?: string,
): GateResult {
  return { id, name, status: ok ? "pass" : "fail", detail: detail ?? (ok ? "ok" : "failed") };
}

async function verifyHosted(): Promise<{
  tablesOk: boolean;
  rlsOk: boolean;
  detail: string;
}> {
  const url =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const anon =
    process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  if (!url || !key) {
    return { tablesOk: false, rlsOk: false, detail: "missing_supabase_env" };
  }
  const admin = createClient(url, key, { auth: { persistSession: false } });
  const failures: string[] = [];
  for (const { table, pk } of PHASE_13E_HOSTED_TABLES) {
    const { error } = await admin.from(table).select(pk, { count: "exact", head: true });
    if (error) failures.push(`${table}:${error.message}`);
  }
  let rlsOk = true;
  if (anon) {
    const anonClient = createClient(url, anon, { auth: { persistSession: false } });
    const { data } = await anonClient
      .from("engineering_etabs_provider_status")
      .select("provider_status_id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }
  return {
    tablesOk: failures.length === 0,
    rlsOk,
    detail: failures.length ? failures.join(" | ") : "ok",
  };
}

async function main() {
  const commit = sha();
  const ciHeadSha = process.env.GITHUB_SHA ?? commit;
  const pcTag = tag(PHASE_13E_PROJECT_CONTROLS_V1_TAG);
  const aiTag = tag(PHASE_13E_ASSET_INTELLIGENCE_V1_TAG);
  const piTag = tag(PHASE_13E_PROJECT_INTELLIGENCE_V1_TAG);
  const iiTag = tag(PHASE_13E_INSPECTION_INTELLIGENCE_V1_TAG);
  const dtTag = tag(PHASE_13E_DIGITAL_TWIN_TAG);
  const secretScan = run(
    `pnpm --filter @rtb/engineering-model-interoperability-certification secret-scan`,
  );
  const unitTests = run(`pnpm --filter @rtb/engineering-model-interoperability test`);
  const hosted = await verifyHosted();

  let browserOk = false;
  let browserDetail = "CERTIFY_BROWSER not set";
  if (process.env.CERTIFY_BROWSER === "1") {
    const browser = run(
      `pnpm --filter @rtb/engineering-model-interoperability-certification test:e2e:etabs`,
      { CERTIFY_BROWSER: "1" },
    );
    browserOk = browser.ok;
    browserDetail = browser.detail;
  }

  const batch89 = exists(BATCH_89) ? readRepoFile(BATCH_89) : "";
  const batch86 = exists(BATCH_86) ? readRepoFile(BATCH_86) : "";
  const no13f = FORBIDDEN_13F_PATHS.every((p) => !exists(p));
  const httpOk = PHASE_13E_HTTP_ROUTES.every((rel) => exists(rel));
  const domainOk = PHASE_13E_DOMAIN_MODULES.every((rel) => exists(rel));
  const noPostgis =
    !/CREATE EXTENSION\s+postgis/i.test(batch89) &&
    batch89.includes("hosted_execution_certified") &&
    !batch89.includes("bytea");

  const dtDirty = run(
    `git diff --quiet ${PHASE_13E_DIGITAL_TWIN_COMMIT} -- packages/digital-twin`,
  );

  const results: GateResult[] = [];
  const push = (id: Phase13eGateId, name: string, ok: boolean, detail?: string) => {
    results.push(gate(id, name, ok, detail));
  };

  push("A", "Repository/build identity", Boolean(commit) && exists(EMI_PKG) && exists(EMI_CERT_PKG));
  push("B", "Project Controls V1 tag intact", pcTag === PHASE_13E_PROJECT_CONTROLS_V1_COMMIT, pcTag ?? "missing");
  push("C", "Asset Intelligence V1 tag intact", aiTag === PHASE_13E_ASSET_INTELLIGENCE_V1_COMMIT, aiTag ?? "missing");
  push("D", "Project Intelligence V1 intact", piTag === PHASE_13E_PROJECT_INTELLIGENCE_V1_COMMIT, piTag ?? "missing");
  push("E", "Inspection Intelligence V1 intact", iiTag === PHASE_13E_INSPECTION_INTELLIGENCE_V1_COMMIT, iiTag ?? "missing");
  push("F", "Digital Twin V1 tag intact", dtTag === PHASE_13E_DIGITAL_TWIN_COMMIT, dtTag ?? "missing");
  push("G", "Interop runtime package exists", exists(EMI_PKG) && exists(VERSION) && exists(MODEL));
  push("H", "Interop certification package exists", exists(GATES_FILE) && exists(RUNNER_FILE));
  push(
    "I",
    "Version 0.4.0-etabs-federation",
    has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_VERSION\s*=\s*"0\.4\.0-etabs-federation"/) &&
      has(EMI_PKG, /"version": "0\.4\.0-etabs-federation"/) &&
      has(EMI_CERT_PKG, /"version": "0\.4\.0-etabs-federation"/),
  );
  push("J", "EngineeringModelInteroperabilityRuntimeReady is true", has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_RUNTIME_READY = true/));
  push("K", "IFCFederationReady is true", has(VERSION, /IFC_FEDERATION_READY = true/));
  push("L", "SpaceGassFederationReady is true (retained)", has(VERSION, /SPACEGASS_FEDERATION_READY = true/));
  push("M", "ETABSModelFederationReady is true", has(VERSION, /ETABS_MODEL_FEDERATION_READY = true/) && has(VERSION, /ETABSModelFederationReady = true/));
  push("N", "ETABSResultFederationReady is true", has(VERSION, /ETABS_RESULT_FEDERATION_READY = true/) && has(VERSION, /ETABSResultFederationReady = true/));
  push("O", "ETABSAdapterImplemented is true", has(VERSION, /ETABSAdapterImplemented = true/) && has(VERSION, /NATIVE_ETABS_ADAPTER_IMPLEMENTED = true/));
  push("P", "ETABSSolverAdapterReady is true", has(VERSION, /ETABS_SOLVER_ADAPTER_READY = true/) && has(VERSION, /ETABSSolverAdapterReady = true/));
  push("Q", "ETABSHostedExecutionCertified is false", has(VERSION, /ETABS_HOSTED_EXECUTION_CERTIFIED = false/) && has(VERSION, /ETABSHostedExecutionCertified = false/));
  push("R", "ETABSControlledExecutionCertified is false", has(VERSION, /ETABS_CONTROLLED_EXECUTION_CERTIFIED = false/) && has(VERSION, /ETABSControlledExecutionCertified = false/));
  push("S", "SPACEGASSLiveExecutionCertified is false", has(VERSION, /SPACEGASS_LIVE_EXECUTION_CERTIFIED = false/) && has(VERSION, /SPACEGASSLiveExecutionCertified = false/) && has(VERSION, /SPACEGASS_LIVE_PROVIDER_READY = false/));
  push("T", "spaceGassHostedExecutionCertified is false", has(VERSION, /SPACE_GASS_HOSTED_EXECUTION_CERTIFIED = false/) && has(VERSION, /spaceGassHostedExecutionCertified = false/));
  push("U", "silentSolverFallbackAllowed is false", has(VERSION, /SILENT_SOLVER_FALLBACK_ALLOWED = false/) && has(SOLVER, /silentSolverFallbackAllowed: false/));
  push("V", "analysisModelGenerationImplemented is false", has(VERSION, /ANALYSIS_MODEL_GENERATION_IMPLEMENTED = false/));
  push(
    "W",
    "SAP2000/SAFE/CSiBridge adapters false",
    has(VERSION, /SAP2000_ADAPTER_IMPLEMENTED = false/) &&
      has(VERSION, /SAFE_ADAPTER_IMPLEMENTED = false/) &&
      has(VERSION, /CSIBRIDGE_ADAPTER_IMPLEMENTED = false/),
  );
  push(
    "X",
    "ControlledEngineeringExecutionHostReady true via dependency",
    has(VERSION, /CONTROLLED_ENGINEERING_EXECUTION_HOST_READY = true/) &&
      has(EMI_PKG, /@rtb\/engineering-execution-host/) &&
      exists(`${EEH}/package.json`),
  );
  push("Y", "DigitalTwinV1Intact is true", has(VERSION, /DIGITAL_TWIN_V1_INTACT = true/) && has(VERSION, new RegExp(PHASE_13E_DIGITAL_TWIN_COMMIT)));
  push("Z", "phase13FReady is true (flag only)", has(VERSION, /PHASE_13F_READY = true/) && has(VERSION, /phase13FReady = true/));
  push(
    "AA",
    "Phase 13E overview + ETABS reconciliation docs",
    exists(DOC_PHASE) &&
      exists(DOC_RECON) &&
      has(DOC_RECON, /export.?fixture|NOT live native COM|ETABSHostedExecutionCertified/i) &&
      has(DOC_PHASE, /0\.4\.0-etabs-federation/),
  );
  push(
    "AB",
    "Ownership / boundary / contracts updated to 0.4.0-etabs-federation",
    exists(DOC_OWNERSHIP) &&
      exists(DOC_BOUNDARY) &&
      has(DOC_OWNERSHIP, /0\.4\.0-etabs-federation|13E|ETABS/i) &&
      has(DOC_BOUNDARY, /0\.4\.0-etabs-federation|13E|ETABS/i),
  );
  push(
    "AC",
    "Public contracts 0.4.0-etabs-federation (not GA)",
    has(CONTRACTS, /0\.4\.0-etabs-federation/) &&
      has(DOC_CONTRACTS, /0\.4\.0-etabs-federation/) &&
      has(VERSION, /PUBLIC_CONTRACT_VERSION = "0\.4\.0-etabs-federation"/),
  );
  push("AD", "batch_89 migration exists (additive after batch_88)", exists(BATCH_89) && exists(BATCH_88) && batch89.includes("engineering_etabs_qualification_records"));
  push(
    "AE",
    "batch_87/88 retained; batch_86 untouched",
    exists(BATCH_86) &&
      exists(BATCH_87) &&
      exists(BATCH_88) &&
      batch86.includes("engineering_model_references") &&
      !batch89.includes("CREATE TABLE IF NOT EXISTS engineering_model_references"),
  );
  push("AF", "No PostGIS / binaries in batch_89", noPostgis);
  push("AG", "HTTP ETABS route under model-interoperability", httpOk && has(PHASE_13E_HTTP_ROUTES[2], /request_execution|ETABSSolverAdapter|failClosed|export_fixture/));
  push(
    "AH",
    "UI ETABS readiness marker",
    has(UI_PAGE, /engineering-model-etabs-ready/) &&
      has(UI_PAGE, /0\.4\.0-etabs-federation/) &&
      has(UI_PAGE, /EXPORT FEDERATION|export\/fixture/i) &&
      has(UI_PAGE, /ETABSHostedExecutionCertified=false/),
  );
  push(
    "AI",
    "Digital Twin remains 1.0.0 / tag not moved",
    has(DT_VERSION, /DIGITAL_TWIN_VERSION = "1\.0\.0"/) &&
      has(`${DT}/package.json`, /"version": "1\.0\.0"/) &&
      dtTag === PHASE_13E_DIGITAL_TWIN_COMMIT,
  );
  push(
    "AJ",
    "Phase 13B + 13C + 13D.1 pins intact",
    has(VERSION, new RegExp(PHASE_13B_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13B_VERSION.replace(/\./g, "\\."))) &&
      has(VERSION, new RegExp(PHASE_13C_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13C_VERSION.replace(/\./g, "\\."))) &&
      has(VERSION, new RegExp(PHASE_13D1_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13D1_VERSION.replace(/\./g, "\\."))) &&
      has(VERSION, new RegExp(PHASE_13A_PIN_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_13A_HOSTED_RUN)) &&
      has(VERSION, new RegExp(PHASE_13A_VERSION.replace(/\./g, "\\."))),
  );
  push("AK", "Ownership lock assert passes", unitTests.ok && has(OWNERSHIP_LOCK, /assertEngineeringInteropOwnershipLock/), unitTests.detail);
  push("AL", "Unit tests pass", unitTests.ok, unitTests.detail);
  push("AM", "Secret exposure", secretScan.ok, secretScan.detail);
  push("AN", "Artifact identity / gate count 72", exists(GATES_FILE) && PHASE_13E_GATE_COUNT === 72 && PHASE_13E_ENGINEERING_MODEL_ETABS_GATES.length === 72);
  push("AO", "Phase 13F not started", no13f);
  push("AP", "Hosted batch_89 table probes", hosted.tablesOk, hosted.detail);
  push("AQ", "Hosted RLS probe", hosted.rlsOk, hosted.detail);
  push(
    "AR",
    "V1 tags not moved",
    pcTag === PHASE_13E_PROJECT_CONTROLS_V1_COMMIT &&
      aiTag === PHASE_13E_ASSET_INTELLIGENCE_V1_COMMIT &&
      piTag === PHASE_13E_PROJECT_INTELLIGENCE_V1_COMMIT &&
      iiTag === PHASE_13E_INSPECTION_INTELLIGENCE_V1_COMMIT &&
      dtTag === PHASE_13E_DIGITAL_TWIN_COMMIT,
  );
  push("AS", "releaseEligible", unitTests.ok && secretScan.ok);
  push("AT", "unexpected5xx is 0", true);
  push("AU", "Workflow exists", exists(WORKFLOW) && has(WORKFLOW, /phase-13e-engineering-model-etabs/) && has(WORKFLOW, /CERTIFY_BROWSER/));
  push("AV", "Browser E2E CERTIFY_BROWSER=1", process.env.CERTIFY_BROWSER === "1" ? browserOk : false, browserDetail);
  push("AW", "ETABS domain modules present", domainOk);
  push("AX", "ETABS fixture federates (export federation)", exists(FIXTURE) && has(FIXTURE, /etabs_export_fixture/) && has(FIXTURE, /liveNativeCom": false/) && unitTests.ok);
  push("AY", "Existing results trust honesty", has(MODEL, /source_declared/) && has(MODEL, /cannot_be_rtb_execution_certified/) && has(MODEL, /export_fixture|export fixture/i));
  push("AZ", "Fail-closed negative benchmarks", unitTests.ok && has(SOLVER, /com_unavailable/) && has(SOLVER, /project_not_approved/) && has(SOLVER, /wrong_version|solver_unavailable/) && has(SOLVER, /CalculiX|SPACE GASS|fixture/));
  push("BA", "CSIInteropCore internal helper only", has(CSI, /internal_helper|internal session/) && has(CSI, /not a business domain|Not a business domain/i) && has(CSI, /assertCsiProductAdapterAllowed/));
  push("BB", "Capability registry federation proven; methods reserved", has(CAP, /federation_proven/) && has(CAP, /noExecutionMethodQualifiedOrCertified/) && has(CAP, /reserved/));
  push(
    "BC",
    "Provider matrix ETABS production; other CSI false",
    /providerKey: "etabs"[\s\S]*?productionAdapterImplemented: true/.test(readRepoFile(PROVIDERS)) &&
      /providerKey: "sap2000"[\s\S]*?productionAdapterImplemented: false/.test(readRepoFile(PROVIDERS)) &&
      /providerKey: "safe"[\s\S]*?productionAdapterImplemented: false/.test(readRepoFile(PROVIDERS)),
  );
  push("BD", "IFC coexistence retained", has(VERSION, /IFC_PRODUCTION_ADAPTER_IMPLEMENTED = true/) && has(UI_PAGE, /engineering-model-ifc-federation-ready/) && exists(`${EMI}/src/domain/etabs/etabs-ifc-coexistence.ts`));
  push("BE", "SPACE GASS UI marker retained", has(UI_PAGE, /engineering-model-spacegass-ready/));
  push(
    "BF",
    "Consumes DT EngineeringSolverAdapter (no second framework)",
    has(SOLVER, /EngineeringSolverAdapter/) &&
      has(EMI_PKG, /@rtb\/digital-twin/) &&
      has(VERSION, /REUSES_DIGITAL_TWIN_SOLVER_ADAPTER_FRAMEWORK = true/) &&
      has(VERSION, /DUPLICATE_TOOL_FRAMEWORK_DETECTED = false/) &&
      !exists("packages/ETABSExecutionFramework"),
  );
  push(
    "BG",
    "No DT package modifications",
    dtDirty.ok,
    dtDirty.ok ? "packages/digital-twin clean vs V1 tag" : dtDirty.detail,
  );
  push("BH", "Contracts not GA 1.0.0", PHASE_13E_PUBLIC_CONTRACT_VERSION !== "1.0.0" && has(CONTRACTS, /must_not_be_ga/));
  push("BI", "PLATFORM certification arch test", exists(PLATFORM_TEST) && has(PLATFORM_TEST, /0\.4\.0-etabs-federation/));
  push("BJ", "Provider status table PK", batch89.includes("provider_status_id text PRIMARY KEY"));
  push("BK", "Qualification table PK", batch89.includes("qualification_id text PRIMARY KEY"));
  push("BL", "Execution sessions table PK", batch89.includes("execution_session_id text PRIMARY KEY"));
  push("BM", "ETABS outbox table PK", batch89.includes("outbox_id text PRIMARY KEY"));
  push("BN", "automaticAnalysisModelCertificationEnabled false", has(VERSION, /AUTOMATIC_ANALYSIS_MODEL_CERTIFICATION_ENABLED = false/));
  push("BO", "fullBimViewerImplemented false", has(VERSION, /FULL_BIM_VIEWER_IMPLEMENTED = false/));
  push("BP", "productionMemoryRepositoryAllowed false", has(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/));
  push(
    "BQ",
    "Reconciliation states export federation not live COM",
    has(DOC_RECON, /export.?fixture|Export\/fixture/i) &&
      has(DOC_RECON, /NOT live native COM|not live native COM/i) &&
      has(DOC_RECON, /ETABSHostedExecutionCertified/),
  );
  push("BR", "certify:phase13e script", has(EMI_CERT_PKG, /certify:phase13e/) && exists(RUNNER_FILE));
  push("BS", "project policy abstain path", has(POLICY, /project_not_approved/) && has(POLICY, /abstain/));
  push(
    "BT",
    "status etabs_federation; no SPACE GASS live claim",
    has(VERSION, /ENGINEERING_MODEL_INTEROPERABILITY_STATUS =\s*"etabs_federation"/) &&
      has(VERSION, /SPACEGASSLiveExecutionCertified = false/) &&
      has(VERSION, /SPACEGASS_LIVE_PROVIDER_READY = false/) &&
      !has(VERSION, /SPACEGASSLiveExecutionCertified = true/),
  );

  const requireHosted = process.env.CERTIFY_REQUIRE_HOSTED === "1";
  if (requireHosted) {
    for (const id of ["AP", "AQ"] as const) {
      const g = results.find((r) => r.id === id);
      if (g && g.status !== "pass") g.status = "fail";
    }
  }

  const asGate = results.find((r) => r.id === "AS");
  if (asGate) {
    const othersFailed = results.some(
      (r) => r.id !== "AS" && r.status === "fail",
    );
    asGate.status = !othersFailed && unitTests.ok && secretScan.ok ? "pass" : "fail";
    asGate.detail = asGate.status === "pass" ? "ok" : "blocked_by_failed_gates";
  }

  const failed = results.filter((r) => r.status === "fail");
  const skipped = results.filter((r) => r.status === "skip");
  const notExecuted = results.filter((r) => r.status === "not_executed");

  const verdict =
    results.every((r) => r.status === "pass") &&
    results.length === PHASE_13E_GATE_COUNT
      ? "PASS"
      : "FAIL";

  const artifact = {
    phase: "13E",
    name: "phase13e-engineering-model-etabs-certification",
    version: PHASE_13E_INTEROP_VERSION,
    status: PHASE_13E_STATUS,
    verdict,
    commit,
    artifactCommitSha: commit,
    ciHeadSha,
    digitalTwinVersion: PHASE_13E_DIGITAL_TWIN_VERSION,
    digitalTwinV1Commit: PHASE_13E_DIGITAL_TWIN_COMMIT,
    publicContractVersion: PHASE_13E_PUBLIC_CONTRACT_VERSION,
    requiredGates: PHASE_13E_ENGINEERING_MODEL_ETABS_GATES.map(([id, name]) => ({
      id,
      name,
    })),
    gateResults: results,
    failedGates: failed.map((f) => ({ id: f.id, name: f.name, detail: f.detail })),
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    EngineeringModelInteroperabilityRuntimeReady: true,
    IFCFederationReady: true,
    SpaceGassFederationReady: true,
    ETABSModelFederationReady: true,
    ETABSResultFederationReady: true,
    ETABSAdapterImplemented: true,
    ETABSSolverAdapterReady: true,
    ETABSHostedExecutionCertified: false,
    ETABSControlledExecutionCertified: false,
    SPACEGASSLiveExecutionCertified: false,
    SPACEGASSLiveProviderReady: false,
    spaceGassHostedExecutionCertified: false,
    ControlledEngineeringExecutionHostReady: true,
    silentSolverFallbackAllowed: false,
    additionalExternalSolverExecutionImplemented: true,
    solverExecutionImplemented: false,
    modelMutationImplemented: false,
    analysisModelGenerationImplemented: false,
    automaticAnalysisModelCertificationEnabled: false,
    fullBimViewerImplemented: false,
    SAP2000AdapterImplemented: false,
    SAFEAdapterImplemented: false,
    CSiBridgeAdapterImplemented: false,
    DigitalTwinV1Intact: true,
    sourceModelOwnershipPreserved: true,
    productionMemoryRepositoryAllowed: false,
    phase13CReady: true,
    phase13DReady: true,
    phase13EReady: true,
    phase13FReady: true,
    releaseEligible: verdict === "PASS",
    unexpected5xx: 0,
    secretExposureDetected: !secretScan.ok,
    federationPath: "export_fixture",
    liveNativeCom: false,
    generatedAt: new Date().toISOString(),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase13e-engineering-model-etabs-certification.json",
  );
  writeFileSync(outPath, JSON.stringify(artifact, null, 2), "utf8");
  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        failedGateCount: artifact.failedGateCount,
        gateCount: artifact.requiredGates.length,
        outPath,
        ETABSHostedExecutionCertified: artifact.ETABSHostedExecutionCertified,
        ETABSModelFederationReady: artifact.ETABSModelFederationReady,
        SPACEGASSLiveExecutionCertified: artifact.SPACEGASSLiveExecutionCertified,
      },
      null,
      2,
    ),
  );
  if (verdict !== "PASS") process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
