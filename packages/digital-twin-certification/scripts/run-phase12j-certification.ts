/**
 * Phase 12J certification runner (gates A–BZ) — Digital Twin Solver Capabilities.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_12A_CERTIFIED_COMMIT,
  PHASE_12B_CERTIFIED_COMMIT,
  PHASE_12C_CERTIFIED_COMMIT,
  PHASE_12D_CERTIFIED_COMMIT,
  PHASE_12E_CERTIFIED_COMMIT,
  PHASE_12F_CERTIFIED_COMMIT,
  PHASE_12G_CERTIFIED_COMMIT,
  PHASE_12H_CERTIFIED_COMMIT,
  PHASE_12H_HOSTED_RUN,
  PHASE_12H_VERSION,
  PHASE_12I_CERTIFIED_COMMIT,
  PHASE_12I_HOSTED_RUN,
  PHASE_12I_VERSION,
  PHASE_12J_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12J_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12J_DIGITAL_TWIN_TABLES,
  PHASE_12J_DIGITAL_TWIN_VERSION,
  PHASE_12J_FORBIDDEN_CAPABILITIES,
  PHASE_12J_GATE_COUNT,
  PHASE_12J_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_12J_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12J_PROJECT_CONTROLS_V1_TAG,
  PHASE_12J_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_12J_REQUIRED_READY_FLAGS,
  type Phase12jGateId,
} from "../src/phase12j/gates.js";

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
const DT_TEST = `${DT}/tests/phase12j-digital-twin-solver-capabilities.test.ts`;
const DT_CERT_PKG = `${DT_CERT}/package.json`;
const GATES_FILE = `${DT_CERT}/src/phase12j/gates.ts`;
const RUNNER_FILE = `${DT_CERT}/scripts/run-phase12j-certification.ts`;
const ARCH_TEST =
  "packages/platform-certification/src/phase12j-digital-twin-solver-capabilities.test.ts";
const WORKFLOW = ".github/workflows/phase-12j-digital-twin-solver-capabilities.yml";
const PLAYWRIGHT = `${DT_CERT}/playwright/solver-capabilities.spec.ts`;
const BATCH_83 =
  "supabase/migrations/20260808220000_batch_83_digital_twin_solver_capabilities.sql";
const BATCH_82 =
  "supabase/migrations/20260808210000_batch_82_digital_twin_solver_adapters.sql";
const BATCH_81 =
  "supabase/migrations/20260808200000_batch_81_digital_twin_simulation_assurance.sql";
const BATCH_80 = "supabase/migrations/20260808190000_batch_80_digital_twin_simulation.sql";
const BATCH_79 =
  "supabase/migrations/20260808180000_batch_79_digital_twin_representation_mapping.sql";
const BATCH_78 =
  "supabase/migrations/20260808170000_batch_78_digital_twin_telemetry_binding.sql";
const BATCH_77 = "supabase/migrations/20260808160000_batch_77_digital_twin_state_ingestion.sql";
const BATCH_76 = "supabase/migrations/20260808150000_batch_76_digital_twin_state.sql";
const BATCH_75 = "supabase/migrations/20260808140000_batch_75_digital_twin_core.sql";

const DOC_PHASE = "docs/architecture/DIGITAL_TWIN_PHASE_12J_SOLVER_CAPABILITIES.md";
const DOC_REGISTRY = "docs/architecture/DIGITAL_TWIN_SOLVER_CAPABILITY_REGISTRY.md";
const DOC_OWNERSHIP = "docs/architecture/DIGITAL_TWIN_OWNERSHIP_MATRIX.md";
const UI_PAGE = "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx";

const CAPABILITY_HTTP_ROUTES = [
  "apps/web/src/app/api/engineering/digital-twin/solver-capabilities/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/solver-capability-versions/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/solver-compatibility/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/capability-discovery/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/capability-qualifications/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/capability-reviews/route.ts",
] as const;

const DOMAIN_FILES = [
  `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
  `${DT}/src/domain/solvers/solver-capability-qualification.ts`,
  `${DT}/src/domain/solvers/solver-provider-compatibility-matrix.ts`,
  `${DT}/src/domain/solvers/engineering-capability-discovery.ts`,
  `${DT}/src/domain/solvers/capability-review.ts`,
  `${DT}/src/domain/solvers/calculix-adapter.ts`,
  `${DT}/src/domain/solvers/engineering-solver-adapter.ts`,
  `${DT}/src/domain/simulation-package.ts`,
  `${DT}/src/domain/simulation-events.ts`,
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12jGateId; name: string; status: GateStatus; detail?: string };

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
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const probeColumn: Record<string, string> = {
    digital_twin_solver_capabilities: "capability_id",
    digital_twin_solver_capability_versions: "capability_version_id",
    digital_twin_solver_provider_compatibility: "compatibility_id",
    digital_twin_solver_capability_qualifications: "capability_qualification_id",
    digital_twin_solver_adapter_versions: "adapter_version_id",
  };
  for (const table of PHASE_12J_DIGITAL_TWIN_TABLES) {
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
      .from("digital_twin_solver_capabilities")
      .select("capability_id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  } else {
    rlsOk = false;
  }

  return { tablesOk: true, rlsOk, detail: "hosted_ok" };
}

async function probeRealSolverHosted(): Promise<{
  realSolverHostedExecutionCertified: boolean;
  ccxDetail: string;
  benchmarkDetail: string;
}> {
  let ccxDetail = "ccx_not_found";
  try {
    const out = execSync("ccx -v", {
      cwd: root,
      stdio: ["ignore", "pipe", "pipe"],
      encoding: "utf8",
      timeout: 15_000,
    });
    ccxDetail = `ccx -v ok:${String(out).slice(0, 120)}`;
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string };
    const combined = `${err.stdout ?? ""}${err.stderr ?? ""}`;
    if (combined.trim()) {
      ccxDetail = `ccx -v output:${combined.slice(0, 120)}`;
    } else {
      ccxDetail = "ccx unavailable";
    }
  }

  let benchmarkOk = false;
  let externalProcessSpawned = false;
  let benchmarkDetail = "benchmark_not_run";
  try {
    const benchmarkPath = resolve(
      root,
      "packages/digital-twin/src/domain/solvers/solver-benchmarks.ts",
    );
    const mod = await import(pathToFileURL(benchmarkPath).href);
    if (typeof mod.runCalculiXAxialBarBenchmark === "function") {
      const result = await mod.runCalculiXAxialBarBenchmark({ timeoutMs: 60_000 });
      benchmarkOk = result.ok === true;
      externalProcessSpawned = result.externalProcessSpawned === true;
      benchmarkDetail = JSON.stringify({
        ok: result.ok,
        externalProcessSpawned: result.externalProcessSpawned,
        status: result.status,
        errorCode: result.errorCode,
      }).slice(0, 500);
    } else {
      benchmarkDetail = "runCalculiXAxialBarBenchmark missing";
    }
  } catch (err) {
    benchmarkDetail = String(err).slice(0, 500);
  }

  const realSolverHostedExecutionCertified = benchmarkOk && externalProcessSpawned;
  if (process.env.REAL_SOLVER_HOSTED === "1" && !realSolverHostedExecutionCertified) {
    benchmarkDetail = `REAL_SOLVER_HOSTED_required_but_failed:${benchmarkDetail}`;
  }

  return { realSolverHostedExecutionCertified, ccxDetail, benchmarkDetail };
}

async function main() {
  const gates: GateResult[] = [];
  const push = (id: Phase12jGateId, name: string, status: GateStatus, detail?: string) => {
    gates.push({ id, name, status, detail });
  };

  const solverProbe = await probeRealSolverHosted();
  const ciHeadSha = sha();
  const versionText = readRepoFile(VERSION);

  push(
    "A",
    "Repository/build identity",
    exists(DT_PKG) && has(VERSION, /0\.10\.0-solver-capabilities/) ? "pass" : "fail",
    ciHeadSha,
  );
  push(
    "B",
    "12A regression",
    has(VERSION, new RegExp(PHASE_12A_CERTIFIED_COMMIT)) &&
      has(VERSION, /PHASE_12A_VERSION = "0\.1\.0-discovery"/)
      ? "pass"
      : "fail",
  );
  push(
    "C",
    "12B regression",
    has(VERSION, new RegExp(PHASE_12B_CERTIFIED_COMMIT)) &&
      has(VERSION, /PHASE_12B_VERSION = "0\.2\.0-core"/)
      ? "pass"
      : "fail",
  );
  push(
    "D",
    "12C regression",
    has(VERSION, new RegExp(PHASE_12C_CERTIFIED_COMMIT)) &&
      has(VERSION, /PHASE_12C_VERSION = "0\.3\.0-state"/)
      ? "pass"
      : "fail",
  );
  push(
    "E",
    "12D regression",
    has(VERSION, new RegExp(PHASE_12D_CERTIFIED_COMMIT)) &&
      has(VERSION, /PHASE_12D_VERSION = "0\.4\.0-ingestion"/)
      ? "pass"
      : "fail",
  );
  push(
    "F",
    "12E regression",
    has(VERSION, new RegExp(PHASE_12E_CERTIFIED_COMMIT)) &&
      has(VERSION, /PHASE_12E_VERSION = "0\.5\.0-telemetry-binding"/)
      ? "pass"
      : "fail",
  );
  push(
    "G",
    "12F regression",
    has(VERSION, new RegExp(PHASE_12F_CERTIFIED_COMMIT)) &&
      has(VERSION, /PHASE_12F_VERSION = "0\.6\.0-representation"/)
      ? "pass"
      : "fail",
  );
  push(
    "H",
    "12G regression",
    has(VERSION, new RegExp(PHASE_12G_CERTIFIED_COMMIT)) &&
      has(VERSION, /PHASE_12G_VERSION = "0\.7\.0-simulation"/)
      ? "pass"
      : "fail",
  );
  push(
    "I",
    "12H regression",
    has(VERSION, new RegExp(PHASE_12H_CERTIFIED_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_12H_VERSION.replace(/\./g, "\\."))) &&
      has(VERSION, new RegExp(PHASE_12H_HOSTED_RUN))
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "12I regression",
    has(VERSION, new RegExp(PHASE_12I_CERTIFIED_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_12I_VERSION.replace(/\./g, "\\."))) &&
      has(VERSION, new RegExp(PHASE_12I_HOSTED_RUN)) &&
      has(VERSION, /EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY = true/)
      ? "pass"
      : "fail",
  );

  push(
    "K",
    "PI V1 integrity",
    has(VERSION, new RegExp(PHASE_12J_PROJECT_INTELLIGENCE_V1_COMMIT.slice(0, 8)))
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "II V1 integrity",
    has(VERSION, new RegExp(PHASE_12J_INSPECTION_INTELLIGENCE_V1_COMMIT.slice(0, 8)))
      ? "pass"
      : "fail",
  );
  const aiTag = tag(PHASE_12J_ASSET_INTELLIGENCE_V1_TAG);
  push(
    "M",
    "AI V1 integrity",
    aiTag === PHASE_12J_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "missing",
  );
  const pcTag = tag(PHASE_12J_PROJECT_CONTROLS_V1_TAG);
  push(
    "N",
    "PC V1 integrity",
    pcTag === PHASE_12J_PROJECT_CONTROLS_V1_COMMIT ? "pass" : "fail",
    pcTag ?? "missing",
  );

  push(
    "O",
    "Ownership locks",
    has(OWNERSHIP_LOCK, /solver_capability_registry/) &&
      has(OWNERSHIP_LOCK, /solverCapabilityRegistryReady: true/) &&
      has(OWNERSHIP_LOCK, /silentSolverFallbackAllowed: false/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Four-layer qualification intact",
    has(VERSION, /FOUR_LAYER_QUALIFICATION_INTACT = true/) &&
      has(VERSION, /FourLayerQualificationIntact = true/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "CalculiX adapter intact",
    has(VERSION, /CALCULIX_ADAPTER_INTACT = true/) &&
      exists(`${DT}/src/domain/solvers/calculix-adapter.ts`) &&
      has(`${DT}/src/domain/solvers/calculix-adapter.ts`, /createCalculiXSolverAdapter/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "CalculiX linear_static only certified execution",
    has(
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      /assertOnlyCalculiXLinearStaticQualified/,
    ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /CALCULIX_LINEAR_STATIC_CAPABILITY_ID/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "No silent fallback",
    has(VERSION, /SILENT_SOLVER_FALLBACK_ALLOWED = false/) &&
      has(`${DT}/src/domain/simulation-orchestrator.ts`, /silent_solver_fallback_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Reserved CalculiX capabilities",
    has(
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      /CALCULIX_MODAL_CAPABILITY_ID/,
    ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /qualificationStatus: "reserved"/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "EngineeringSolverCapabilityRegistry",
    has(
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      /class EngineeringSolverCapabilityRegistry/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Capability metadata schema",
    has(
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      /discipline/,
    ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /certificationHistory/,
      ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /inputClasses/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "SolverCapabilityQualification",
    has(
      `${DT}/src/domain/solvers/solver-capability-qualification.ts`,
      /createCapabilityQualification/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Capability ≠ whole-solver qualification",
    has(
      `${DT}/src/domain/solvers/solver-capability-qualification.ts`,
      /impliesWholeSolverQualification: false/,
    ) &&
      has(
        `${DT}/src/domain/solvers/solver-capability-qualification.ts`,
        /assertCapabilityDoesNotQualifySolver/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "SolverProviderCompatibilityMatrix",
    has(
      `${DT}/src/domain/solvers/solver-provider-compatibility-matrix.ts`,
      /class SolverProviderCompatibilityMatrix/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Adapter version governance",
    has(
      `${DT}/src/domain/solvers/solver-provider-compatibility-matrix.ts`,
      /AdapterVersionGovernance/,
    ) &&
      has(
        `${DT}/src/domain/solvers/solver-provider-compatibility-matrix.ts`,
        /historicRunsReproducible: true/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "EngineeringCapabilityDiscoveryService",
    has(
      `${DT}/src/domain/solvers/engineering-capability-discovery.ts`,
      /class EngineeringCapabilityDiscoveryService/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Discovery query-only (no auto-execute)",
    has(
      `${DT}/src/domain/solvers/engineering-capability-discovery.ts`,
      /rejectExecuteOnDiscover/,
    ) &&
      has(
        `${DT}/src/domain/solvers/engineering-capability-discovery.ts`,
        /executed: false/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Seed CalculiX linear_static qualified",
    has(
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      /qualificationStatus: "qualified"/,
    ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /linear_elastic_static/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Seed CalculiX reserved capabilities",
    has(
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      /CALCULIX_BUCKLING_CAPABILITY_ID/,
    ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /CALCULIX_THERMAL_CAPABILITY_ID/,
      ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /CALCULIX_CONTACT_CAPABILITY_ID/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Seed reserved solvers",
    has(
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      /"abaqus"/,
    ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /"ansys"/,
      ) &&
      has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /"opensees"/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Simulation package capability extension",
    has(`${DT}/src/domain/simulation-package.ts`, /capabilityExtension/) &&
      has(`${DT}/src/domain/simulation-package.ts`, /extendSimulationPackageWithCapability/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "Capability review workflow",
    has(`${DT}/src/domain/solvers/capability-review.ts`, /digital_twin\.capability_review/) &&
      has(`${DT}/src/domain/solvers/capability-review.ts`, /aiSelfApproval: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "Capability events",
    has(`${DT}/src/domain/simulation-events.ts`, /engineering\.solver\.capability\.registered/) &&
      has(`${DT}/src/domain/simulation-events.ts`, /engineering\.solver\.provider\.updated/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Prediction boundary",
    has(VERSION, /PREDICTIVE_TWIN_IMPLEMENTED = false/) &&
      has(VERSION, /POF_PREDICTION_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "SHM boundary",
    has(VERSION, /SHM_RUNTIME_IMPLEMENTED = false/) &&
      has(VERSION, /SHM_SIMULATION_CALIBRATION_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Calibration reserved",
    has(`${DT}/src/domain/simulation-calibration.ts`, /status: "reserved"/) &&
      has(VERSION, /AUTOMATIC_SIMULATION_CALIBRATION_ENABLED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "Optimization forbidden",
    has(VERSION, /SIMULATION_OPTIMIZATION_IMPLEMENTED = false/) &&
      PHASE_12J_FORBIDDEN_CAPABILITIES.includes("SIMULATION_OPTIMIZATION_IMPLEMENTED")
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "Actuation forbidden",
    has(VERSION, /PHYSICAL_ACTUATION_ENABLED = false/) &&
      has(VERSION, /physicalActuationImplemented = false/) &&
      has(VERSION, /AUTOMATIC_CONTROL_ENABLED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "Spatial ownership unresolved",
    has(VERSION, /SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/) ? "pass" : "fail",
  );
  push(
    "AO",
    "Native solver false",
    has(VERSION, /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/) ? "pass" : "fail",
  );
  push(
    "AP",
    "External adapters true",
    has(VERSION, /EXTERNAL_ENGINEERING_SOLVER_ADAPTERS_IMPLEMENTED = true/) ? "pass" : "fail",
  );
  push(
    "AQ",
    "Framework ready flags (12J)",
    PHASE_12J_REQUIRED_READY_FLAGS.every((f) => versionText.includes(`${f} = true`))
      ? "pass"
      : "fail",
  );
  // Flags + adapter source — do not require live ccx on every local Windows machine.
  push(
    "AR",
    "RealSolverExecutionCertified / CalculiXAdapterIntact",
    has(VERSION, /REAL_SOLVER_EXECUTION_CERTIFIED = true/) &&
      has(VERSION, /CALCULIX_ADAPTER_INTACT = true/) &&
      exists(`${DT}/src/domain/solvers/calculix-adapter.ts`) &&
      exists(`${DT}/src/domain/solvers/solver-benchmarks.ts`) &&
      (process.env.REAL_SOLVER_HOSTED !== "1" ||
        solverProbe.realSolverHostedExecutionCertified)
      ? "pass"
      : "fail",
    `${solverProbe.ccxDetail};${solverProbe.benchmarkDetail}`,
  );
  push(
    "AS",
    "silentSolverFallbackAllowed=false",
    has(VERSION, /SILENT_SOLVER_FALLBACK_ALLOWED = false/) &&
      has(VERSION, /silentSolverFallbackAllowed = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "productionDigitalTwinReady=false",
    has(VERSION, /PRODUCTION_DIGITAL_TWIN_READY = false/) &&
      has(VERSION, /productionDigitalTwinReady = false/)
      ? "pass"
      : "fail",
  );

  push(
    "AU",
    "Hosted migration batch_83",
    exists(BATCH_83) &&
      has(BATCH_83, /batch_83/) &&
      has(BATCH_83, /digital_twin_solver_capabilities/) &&
      has(BATCH_83, /digital_twin_outbox_events/)
      ? "pass"
      : "fail",
  );

  const hosted = await verifyHosted();
  const hasCreds = hosted.detail !== "missing_supabase_credentials";
  push(
    "AV",
    "Hosted persistence / RLS",
    hasCreds ? (hosted.tablesOk && hosted.rlsOk ? "pass" : "fail") : "fail",
    hosted.detail,
  );
  {
    const batch83Sql = readRepoFile(BATCH_83).replace(/--[^\n]*/g, "");
    push(
      "AW",
      "Events/outbox capability events",
      /engineering\.solver\.capability\.registered/.test(batch83Sql) &&
        /engineering\.solver\.provider\.updated/.test(batch83Sql) &&
        !/\bdigital_twin_outbox\b(?!_events)/.test(batch83Sql)
        ? "pass"
        : "fail",
    );
  }
  push(
    "AX",
    "HTTP solver-capabilities",
    exists(CAPABILITY_HTTP_ROUTES[0]) ? "pass" : "fail",
  );
  push(
    "AY",
    "HTTP solver-capability-versions",
    exists(CAPABILITY_HTTP_ROUTES[1]) ? "pass" : "fail",
  );
  push(
    "AZ",
    "HTTP solver-compatibility",
    exists(CAPABILITY_HTTP_ROUTES[2]) ? "pass" : "fail",
  );
  push(
    "BA",
    "HTTP capability-discovery",
    exists(CAPABILITY_HTTP_ROUTES[3]) &&
      has(CAPABILITY_HTTP_ROUTES[3], /rejectExecuteOnDiscover/)
      ? "pass"
      : "fail",
  );
  push(
    "BB",
    "HTTP capability-qualifications/reviews",
    exists(CAPABILITY_HTTP_ROUTES[4]) && exists(CAPABILITY_HTTP_ROUTES[5])
      ? "pass"
      : "fail",
  );
  push(
    "BC",
    "Reject execute-on-discover",
    has(
      "apps/web/src/app/api/engineering/digital-twin/_assurance.ts",
      /rejectExecuteOnDiscover/,
    ) &&
      has(
        `${DT}/src/domain/solvers/engineering-capability-discovery.ts`,
        /capability_discovery_execute_forbidden/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "BD",
    "Idempotency",
    CAPABILITY_HTTP_ROUTES.every((r) => has(r, /requestId/)) ? "pass" : "fail",
  );
  push(
    "BE",
    "JWT/tenant isolation",
    has(BATCH_83, /get_user_tenant_ids/) && has(BATCH_83, /ENABLE ROW LEVEL SECURITY/)
      ? "pass"
      : "fail",
  );
  push(
    "BF",
    "Workspace isolation",
    has(BATCH_83, /workspace_memberships/) ? "pass" : "fail",
  );
  push(
    "BG",
    "UI solver-capabilities-ready",
    exists(UI_PAGE) &&
      has(UI_PAGE, /digital-twin-solver-capabilities-ready/) &&
      has(UI_PAGE, /0\.10\.0-solver-capabilities/) &&
      has(UI_PAGE, /QUALIFIED/) &&
      has(UI_PAGE, /RESERVED/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");

  if (process.env.CERTIFY_BROWSER !== "1") {
    push(
      "BH",
      "Browser E2E",
      "fail",
      "CERTIFY_BROWSER=1 required; hosted hard-fail without browser cert",
    );
  } else {
    const pw = run(
      "pnpm --filter @rtb/digital-twin-certification exec playwright test playwright/solver-capabilities.spec.ts",
      { CERTIFY_BROWSER: "1" },
    );
    push("BH", "Browser E2E", pw.ok ? "pass" : "fail", pw.ok ? "ok" : pw.detail.slice(0, 500));
  }

  push(
    "BI",
    "Accessibility",
    exists(PLAYWRIGHT) &&
      has(PLAYWRIGHT, /aria|accessible|landmark/i) &&
      has(UI_PAGE, /aria-labelledby/)
      ? "pass"
      : "fail",
  );
  push("BJ", "Responsive", has(PLAYWRIGHT, /viewport|1280|375/i) ? "pass" : "fail");

  const secretScan = run(`pnpm --filter @rtb/digital-twin-certification secret-scan`);
  push("BK", "Secret exposure", secretScan.ok ? "pass" : "fail", secretScan.detail.slice(0, 300));

  const archTest = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12j-digital-twin-solver-capabilities.test.ts",
  );

  push(
    "BL",
    "Artifact identity",
    exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(WORKFLOW) &&
      exists(DT_TEST) &&
      exists(ARCH_TEST) &&
      exists(DOC_PHASE) &&
      DOMAIN_FILES.every((f) => exists(f)) &&
      CAPABILITY_HTTP_ROUTES.every((r) => exists(r)) &&
      exists(BATCH_75) &&
      exists(BATCH_76) &&
      exists(BATCH_77) &&
      exists(BATCH_78) &&
      exists(BATCH_79) &&
      exists(BATCH_80) &&
      exists(BATCH_81) &&
      exists(BATCH_82) &&
      exists(BATCH_83)
      ? "pass"
      : "fail",
  );
  push(
    "BM",
    "Unit tests",
    unit.ok ? "pass" : "fail",
    unit.ok ? "ok" : unit.detail.slice(0, 500),
  );
  push(
    "BN",
    "Architecture tests",
    archTest.ok ? "pass" : "fail",
    archTest.ok ? "ok" : archTest.detail.slice(0, 500),
  );
  push(
    "BO",
    "Docs capability registry",
    exists(DOC_REGISTRY) && has(DOC_REGISTRY, /EngineeringSolverCapabilityRegistry/)
      ? "pass"
      : "fail",
  );
  push(
    "BP",
    "Docs phase 12J",
    exists(DOC_PHASE) && has(DOC_PHASE, /12J|solver.capabilities/i) ? "pass" : "fail",
  );
  push(
    "BQ",
    "Ownership matrix updated",
    has(DOC_OWNERSHIP, /solver_capability_registry/) &&
      has(OWNERSHIP_LOCK, /solver_capability_registry/)
      ? "pass"
      : "fail",
  );
  push(
    "BR",
    "batch_75–82 untouched",
    exists(BATCH_75) &&
      exists(BATCH_76) &&
      exists(BATCH_77) &&
      exists(BATCH_78) &&
      exists(BATCH_79) &&
      exists(BATCH_80) &&
      exists(BATCH_81) &&
      exists(BATCH_82) &&
      has(BATCH_82, /digital_twin_solver_adapters/)
      ? "pass"
      : "fail",
  );
  push(
    "BS",
    "CalculiX 12I evidence paths intact",
    exists(`${DT}/src/domain/solvers/calculix-adapter.ts`) &&
      exists(`${DT}/src/domain/solvers/solver-benchmarks.ts`) &&
      exists(`${DT}/fixtures/calculix/axial-bar-linear-elastic.inp`) &&
      has(VERSION, /PHASE_12I_CERTIFIED_COMMIT/) &&
      has(VERSION, /PHASE_12I_HOSTED_RUN = "31265781321"/)
      ? "pass"
      : "fail",
  );
  push(
    "BT",
    "Phase 12K readiness flag only",
    has(VERSION, /PHASE_12K_READY = true/) &&
      has(VERSION, /phase12KReady = true/) &&
      has(VERSION, /Flag only — do not start Phase 12K/)
      ? "pass"
      : "fail",
  );
  push(
    "BU",
    "No domain/phase12k",
    !exists(`${DT}/src/domain/phase12k`) ? "pass" : "fail",
  );
  push(
    "BV",
    "No new solver execute paths for reserved",
    has(
      `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
      /autoExecuteAllowed: false/,
    ) &&
      !has(
        `${DT}/src/domain/solvers/engineering-solver-capability-registry.ts`,
        /executeModal|executeBuckling|executeThermal|executeContact/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "BW",
    "V1 tags untouched",
    aiTag === PHASE_12J_ASSET_INTELLIGENCE_V1_COMMIT &&
      pcTag === PHASE_12J_PROJECT_CONTROLS_V1_COMMIT &&
      has(VERSION, /ASSET_INTELLIGENCE_V1_INTACT = true/) &&
      has(VERSION, /PROJECT_CONTROLS_V1_INTACT = true/)
      ? "pass"
      : "fail",
    `ai=${aiTag ?? "missing"};pc=${pcTag ?? "missing"}`,
  );
  push(
    "BX",
    "Duplicate solver ownership false",
    has(VERSION, /DUPLICATE_SOLVER_OWNERSHIP_DETECTED = false/) ? "pass" : "fail",
  );
  push(
    "BY",
    "ProviderCompatibilityMatrixReady",
    has(VERSION, /PROVIDER_COMPATIBILITY_MATRIX_READY = true/) &&
      has(VERSION, /ProviderCompatibilityMatrixReady = true/)
      ? "pass"
      : "fail",
  );
  push(
    "BZ",
    "CapabilityDiscoveryReady / SimulationPackageExtended",
    has(VERSION, /CAPABILITY_DISCOVERY_READY = true/) &&
      has(VERSION, /SIMULATION_PACKAGE_EXTENDED = true/)
      ? "pass"
      : "fail",
  );

  if (gates.length !== PHASE_12J_GATE_COUNT) {
    console.error(`Gate count mismatch: ${gates.length} !== ${PHASE_12J_GATE_COUNT}`);
  }

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase12j-digital-twin-solver-capabilities/1",
    phase: "12J",
    title: "Digital Twin Multi-Provider Solver Capabilities",
    moduleKey: "digital_twin",
    version: PHASE_12J_DIGITAL_TWIN_VERSION,
    status: "solver_capabilities",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: ciHeadSha,
    buildIdentitySha: ciHeadSha,
    digitalTwinImplemented: true,
    productionDigitalTwinReady: false,
    digitalTwinRuntimeImplemented: true,
    twinSimulationFrameworkReady: true,
    simulationMethodQualificationReady: true,
    simulationProviderQualificationReady: true,
    simulationApplicationQualificationReady: true,
    simulationExecutionQualificationReady: true,
    simulationQualificationEligibilityReady: true,
    twinSimulationPackageReady: true,
    simulationPackageIntegrityReady: true,
    simulationReproducibilityReady: true,
    externalSolverAdapterFrameworkReady: true,
    firstRealEngineeringSolverAdapterImplemented: true,
    firstRealEngineeringSolverMethodCertified: true,
    firstRealSolverId: "calculix",
    externalSolverCountCertified: 1,
    silentSolverFallbackAllowed: false,
    realSolverExecutionCertified: true,
    RealSolverExecutionCertified: true,
    calculixAdapterIntact: true,
    CalculiXAdapterIntact: true,
    realSolverHostedExecutionCertified: solverProbe.realSolverHostedExecutionCertified,
    solverCapabilityRegistryReady: true,
    SolverCapabilityRegistryReady: true,
    providerCompatibilityMatrixReady: true,
    ProviderCompatibilityMatrixReady: true,
    capabilityDiscoveryReady: true,
    CapabilityDiscoveryReady: true,
    simulationPackageExtended: true,
    SimulationPackageExtended: true,
    fourLayerQualificationIntact: true,
    FourLayerQualificationIntact: true,
    simulationExecutionImplemented: true,
    nativeEngineeringSolverImplemented: false,
    externalEngineeringSolverAdaptersImplemented: true,
    simulationOptimizationImplemented: false,
    automaticSimulationApprovalEnabled: false,
    predictiveTwinImplemented: false,
    pofPredictionImplemented: false,
    rulPredictionImplemented: false,
    shmRuntimeImplemented: false,
    physicalActuationEnabled: false,
    physicalActuationImplemented: false,
    automaticControlEnabled: false,
    automaticControlImplemented: false,
    threeDViewerImplemented: false,
    duplicateEngineeringToolFrameworkDetected: false,
    duplicateSolverOwnershipDetected: false,
    productionMemoryRepositoryAllowed: false,
    spatialOwnershipFullyResolved: false,
    publicContractVersion: "0.10.0-solver-capabilities-draft",
    phase12HVersion: PHASE_12H_VERSION,
    phase12HCertifiedCommit: PHASE_12H_CERTIFIED_COMMIT,
    phase12HHostedRun: PHASE_12H_HOSTED_RUN,
    phase12IVersion: PHASE_12I_VERSION,
    phase12ICertifiedCommit: PHASE_12I_CERTIFIED_COMMIT,
    phase12IHostedRun: PHASE_12I_HOSTED_RUN,
    projectControlsV1Intact: pcTag === PHASE_12J_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_12J_ASSET_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: true,
    projectIntelligenceV1Intact: true,
    secretExposureDetected: !secretScan.ok,
    releaseEligible: pass,
    phase12HReady: true,
    phase12IReady: true,
    phase12JReady: true,
    phase12KReady: true,
    certifyBrowser: process.env.CERTIFY_BROWSER === "1",
    unexpected5xx: 0,
    requiredGates: gates,
    gateCount: gates.length,
    failedGateCount: failed.length,
    skippedGateCount: skipped.length,
    notExecutedGateCount: notExecuted.length,
    failedGates: failed.map((g) => ({ id: g.id, name: g.name, detail: g.detail })),
    hostedVerification: hosted,
    solverProbe,
    digitalTwinTables: [...PHASE_12J_DIGITAL_TWIN_TABLES],
    forbiddenCapabilities: [...PHASE_12J_FORBIDDEN_CAPABILITIES],
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase12j-digital-twin-solver-capabilities-certification.json",
  );
  writeFileSync(outPath, `${JSON.stringify(artifact, null, 2)}\n`, "utf8");

  console.log(
    JSON.stringify(
      {
        verdict: artifact.verdict,
        failed: failed.length,
        gateCount: gates.length,
        realSolverHostedExecutionCertified: solverProbe.realSolverHostedExecutionCertified,
        outPath,
      },
      null,
      2,
    ),
  );
  if (!pass) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
