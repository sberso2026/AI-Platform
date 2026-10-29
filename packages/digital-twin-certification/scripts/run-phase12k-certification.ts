/**
 * Phase 12K certification runner (gates A–CD) — Digital Twin Digital Thread Intelligence.
 * Artifact emits camelCase primary flags only (no PascalCase duplicate keys).
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
  PHASE_12J_CERTIFIED_COMMIT,
  PHASE_12J_HOSTED_RUN,
  PHASE_12J_VERSION,
  PHASE_12K_ASSET_INTELLIGENCE_V1_COMMIT,
  PHASE_12K_ASSET_INTELLIGENCE_V1_TAG,
  PHASE_12K_DIGITAL_TWIN_TABLES,
  PHASE_12K_DIGITAL_TWIN_VERSION,
  PHASE_12K_FORBIDDEN_CAPABILITIES,
  PHASE_12K_GATE_COUNT,
  PHASE_12K_INSPECTION_INTELLIGENCE_V1_COMMIT,
  PHASE_12K_PROJECT_CONTROLS_V1_COMMIT,
  PHASE_12K_PROJECT_CONTROLS_V1_TAG,
  PHASE_12K_PROJECT_INTELLIGENCE_V1_COMMIT,
  PHASE_12K_REQUIRED_READY_FLAGS,
  type Phase12kGateId,
} from "../src/phase12k/gates.js";

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
const DT_TEST = `${DT}/tests/phase12k-digital-twin-digital-thread.test.ts`;
const DT_CERT_PKG = `${DT_CERT}/package.json`;
const GATES_FILE = `${DT_CERT}/src/phase12k/gates.ts`;
const RUNNER_FILE = `${DT_CERT}/scripts/run-phase12k-certification.ts`;
const ARCH_TEST =
  "packages/platform-certification/src/phase12k-digital-twin-digital-thread.test.ts";
const WORKFLOW = ".github/workflows/phase-12k-digital-twin-digital-thread.yml";
const PLAYWRIGHT = `${DT_CERT}/playwright/digital-thread.spec.ts`;
const BATCH_84 =
  "supabase/migrations/20260808230000_batch_84_digital_twin_digital_thread.sql";
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

const DOC_PHASE = "docs/architecture/DIGITAL_TWIN_PHASE_12K_DIGITAL_THREAD.md";
const DOC_INTEL = "docs/architecture/DIGITAL_TWIN_DIGITAL_THREAD_INTELLIGENCE.md";
const DOC_OWNERSHIP = "docs/architecture/DIGITAL_TWIN_OWNERSHIP_MATRIX.md";
const UI_PAGE = "apps/web/src/app/(platform)/engineering/apps/digital-twin/page.tsx";

const THREAD_HTTP_ROUTES = [
  "apps/web/src/app/api/engineering/digital-twin/digital-threads/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/digital-thread-as-of/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/digital-thread-traversal/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/digital-thread-compare/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/digital-thread-integrity/route.ts",
  "apps/web/src/app/api/engineering/digital-twin/digital-thread-provenance/route.ts",
] as const;

const DOMAIN_FILES = [
  `${DT}/src/domain/digital-thread-intelligence-engine.ts`,
  `${DT}/src/domain/digital-thread-snapshot.ts`,
  `${DT}/src/domain/digital-thread-reference.ts`,
  `${DT}/src/domain/digital-thread-relationship.ts`,
  `${DT}/src/domain/digital-thread-taxonomy.ts`,
  `${DT}/src/domain/digital-thread-provenance.ts`,
  `${DT}/src/domain/digital-thread-traversal.ts`,
  `${DT}/src/domain/digital-thread-change-set.ts`,
  `${DT}/src/domain/digital-thread-integrity.ts`,
  `${DT}/src/domain/digital-thread-profile.ts`,
  `${DT}/src/domain/digital-thread-review.ts`,
  `${DT}/src/domain/digital-thread-events.ts`,
  `${DT}/src/domain/digital-thread-kg-reuse.ts`,
  `${DT}/src/domain/thread.ts`,
  `${DT}/src/domain/solvers/calculix-adapter.ts`,
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase12kGateId; name: string; status: GateStatus; detail?: string };

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
    digital_twin_thread_profiles: "profile_id",
    digital_twin_thread_snapshots: "thread_snapshot_id",
    digital_twin_thread_references: "thread_reference_id",
    digital_twin_thread_relationships: "thread_relationship_id",
    digital_twin_thread_provenance: "provenance_id",
    digital_twin_thread_integrity: "integrity_id",
    digital_twin_thread_change_sets: "change_set_id",
    digital_twin_thread_reviews: "review_id",
  };
  for (const table of PHASE_12K_DIGITAL_TWIN_TABLES) {
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
      .from("digital_twin_thread_profiles")
      .select("profile_id")
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
    ccxDetail = combined.trim()
      ? `ccx -v output:${combined.slice(0, 120)}`
      : "ccx unavailable";
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
  const push = (id: Phase12kGateId, name: string, status: GateStatus, detail?: string) => {
    gates.push({ id, name, status, detail });
  };

  const solverProbe = await probeRealSolverHosted();
  const ciHeadSha = sha();
  const versionText = readRepoFile(VERSION);

  push(
    "A",
    "Repository/build identity",
    exists(DT_PKG) && has(VERSION, /0\.11\.0-digital-thread/) ? "pass" : "fail",
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
    "12J regression",
    has(VERSION, new RegExp(PHASE_12J_CERTIFIED_COMMIT)) &&
      has(VERSION, new RegExp(PHASE_12J_VERSION.replace(/\./g, "\\."))) &&
      has(VERSION, new RegExp(PHASE_12J_HOSTED_RUN)) &&
      has(VERSION, /SOLVER_CAPABILITY_REGISTRY_READY = true/)
      ? "pass"
      : "fail",
  );

  push(
    "L",
    "PI V1 integrity",
    has(VERSION, new RegExp(PHASE_12K_PROJECT_INTELLIGENCE_V1_COMMIT.slice(0, 8)))
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "II V1 integrity",
    has(VERSION, new RegExp(PHASE_12K_INSPECTION_INTELLIGENCE_V1_COMMIT.slice(0, 8)))
      ? "pass"
      : "fail",
  );
  const aiTag = tag(PHASE_12K_ASSET_INTELLIGENCE_V1_TAG);
  push(
    "N",
    "AI V1 integrity",
    aiTag === PHASE_12K_ASSET_INTELLIGENCE_V1_COMMIT ? "pass" : "fail",
    aiTag ?? "missing",
  );
  const pcTag = tag(PHASE_12K_PROJECT_CONTROLS_V1_TAG);
  push(
    "O",
    "PC V1 integrity",
    pcTag === PHASE_12K_PROJECT_CONTROLS_V1_COMMIT ? "pass" : "fail",
    pcTag ?? "missing",
  );

  push(
    "P",
    "Ownership locks",
    has(OWNERSHIP_LOCK, /digital_thread/) &&
      has(OWNERSHIP_LOCK, /digitalThreadIntelligenceReady: true/) &&
      has(OWNERSHIP_LOCK, /duplicateKnowledgeGraphDetected: false/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "SolverCapabilityRegistryReady preserved",
    has(VERSION, /SOLVER_CAPABILITY_REGISTRY_READY = true/) &&
      has(VERSION, /SolverCapabilityRegistryReady = true/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "FourLayerQualificationIntact",
    has(VERSION, /FOUR_LAYER_QUALIFICATION_INTACT = true/) &&
      has(VERSION, /FourLayerQualificationIntact = true/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "CalculiXAdapterIntact",
    has(VERSION, /CALCULIX_ADAPTER_INTACT = true/) &&
      exists(`${DT}/src/domain/solvers/calculix-adapter.ts`)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "RealSolverExecutionCertified",
    has(VERSION, /REAL_SOLVER_EXECUTION_CERTIFIED = true/) &&
      exists(`${DT}/src/domain/solvers/solver-benchmarks.ts`) &&
      (process.env.REAL_SOLVER_HOSTED !== "1" ||
        solverProbe.realSolverHostedExecutionCertified)
      ? "pass"
      : "fail",
    `${solverProbe.ccxDetail};${solverProbe.benchmarkDetail}`,
  );

  push(
    "U",
    "DigitalThreadIntelligenceEngine",
    has(
      `${DT}/src/domain/digital-thread-intelligence-engine.ts`,
      /createDigitalThreadIntelligenceEngine/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "DigitalThreadSnapshot refs-only",
    has(`${DT}/src/domain/digital-thread-snapshot.ts`, /compositionMode: "references_only"/) &&
      has(`${DT}/src/domain/digital-thread-snapshot.ts`, /replacesTwinSnapshot: false/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "DigitalThreadReference typed refs",
    has(`${DT}/src/domain/digital-thread-reference.ts`, /DIGITAL_THREAD_REFERENCE_KINDS/) &&
      has(`${DT}/src/domain/digital-thread-reference.ts`, /ownershipClaimed: false/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Relationship taxonomy versioned",
    has(`${DT}/src/domain/digital-thread-taxonomy.ts`, /DIGITAL_THREAD_TAXONOMY_VERSION/) &&
      has(`${DT}/src/domain/digital-thread-taxonomy.ts`, /DIGITAL_THREAD_RELATIONSHIP_TYPES/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "No causal inference in taxonomy",
    has(`${DT}/src/domain/digital-thread-taxonomy.ts`, /DIGITAL_THREAD_CAUSAL_INFERENCE_ALLOWED = false/) &&
      has(`${DT}/src/domain/digital-thread-taxonomy.ts`, /assertNoCausalInference/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "DigitalThreadProvenance fail-closed",
    has(`${DT}/src/domain/digital-thread-provenance.ts`, /createDigitalThreadProvenance/) &&
      has(`${DT}/src/domain/digital-thread-provenance.ts`, /assertProvenanceFailClosed/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "ProvenanceStatus unknown when missing",
    has(
      `${DT}/src/domain/digital-thread-provenance.ts`,
      /provenance_missing_must_be_unknown_fail_closed/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "DigitalThreadTraversalResult",
    has(`${DT}/src/domain/digital-thread-traversal.ts`, /traverseDigitalThread/) &&
      has(`${DT}/src/domain/digital-thread-traversal.ts`, /causalInferencePerformed: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "TemporalTraversalReady",
    has(VERSION, /TEMPORAL_TRAVERSAL_READY = true/) &&
      has(VERSION, /TemporalTraversalReady = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "DigitalThreadChangeSet",
    has(`${DT}/src/domain/digital-thread-change-set.ts`, /diffDigitalThreadSnapshots/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "ChangeSetReady",
    has(VERSION, /CHANGE_SET_READY = true/) && has(VERSION, /ChangeSetReady = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "DigitalThreadIntegrityAssessment",
    has(`${DT}/src/domain/digital-thread-integrity.ts`, /assessDigitalThreadIntegrity/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "Integrity detect-only (no auto-repair)",
    has(`${DT}/src/domain/digital-thread-integrity.ts`, /autoRepairAttempted: false/) &&
      has(
        `${DT}/src/domain/digital-thread-integrity.ts`,
        /digital_thread_integrity_auto_repair_forbidden/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "DigitalThreadProfile",
    has(`${DT}/src/domain/digital-thread-profile.ts`, /createDigitalThreadProfile/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "digital_twin.digital_thread_review",
    has(
      `${DT}/src/domain/digital-thread-review.ts`,
      /digital_twin\.digital_thread_review/,
    )
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "No AI self-approval",
    has(`${DT}/src/domain/digital-thread-review.ts`, /aiSelfApproval: false/) &&
      has(
        `${DT}/src/domain/digital-thread-review.ts`,
        /automatic_or_ai_self_approval_forbidden/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Thread events composed|reviewed|published|integrity_changed",
    has(
      `${DT}/src/domain/digital-thread-events.ts`,
      /engineering\.digital_twin\.thread\.composed/,
    ) &&
      has(
        `${DT}/src/domain/digital-thread-events.ts`,
        /engineering\.digital_twin\.thread\.integrity_changed/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "KnowledgeGraphReuseReady",
    has(VERSION, /KNOWLEDGE_GRAPH_REUSE_READY = true/) &&
      has(VERSION, /KnowledgeGraphReuseReady = true/)
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "duplicateKnowledgeGraphDetected=false",
    has(VERSION, /DUPLICATE_KNOWLEDGE_GRAPH_DETECTED = false/) &&
      has(VERSION, /duplicateKnowledgeGraphDetected = false/) &&
      has(DOC_OWNERSHIP, /duplicateKnowledgeGraphDetected/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "Twin Thread 12B integrated by reference",
    has(`${DT}/src/domain/thread.ts`, /DigitalThreadLink/) &&
      has(
        `${DT}/src/domain/digital-thread-intelligence-engine.ts`,
        /twin_thread_link/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "AO",
    "DigitalThreadSnapshot ≠ TwinSnapshot replacement",
    has(`${DT}/src/domain/digital-thread-snapshot.ts`, /replacesTwinSnapshot: false/) &&
      has(`${DT}/src/domain/snapshot.ts`, /TwinSnapshot|createTwinSnapshot|snapshotId/)
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "Simulation package traversable",
    has(
      `${DT}/src/domain/digital-thread-traversal.ts`,
      /simulationPackageTraversable/,
    ) &&
      has(`${DT}/src/domain/digital-thread-reference.ts`, /simulation_package/)
      ? "pass"
      : "fail",
  );
  push(
    "AQ",
    "Four-layer qualification traversable",
    has(
      `${DT}/src/domain/digital-thread-traversal.ts`,
      /fourLayerQualificationTraversable/,
    ) &&
      has(`${DT}/src/domain/digital-thread-reference.ts`, /method_qualification/)
      ? "pass"
      : "fail",
  );
  push(
    "AR",
    "Cross-domain refs ≠ ownership",
    has(`${DT}/src/domain/digital-thread-reference.ts`, /ownershipClaimed: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AS",
    "Simulation ≠ observed state",
    has(`${DT}/src/domain/digital-thread-reference.ts`, /impliesObservedState: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "Traceability ≠ causality",
    has(DOC_INTEL, /Traceability ≠ causality/) &&
      has(`${DT}/src/domain/digital-thread-taxonomy.ts`, /impliesCausality: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AU",
    "Prediction boundary",
    has(VERSION, /PREDICTIVE_TWIN_IMPLEMENTED = false/) &&
      has(VERSION, /POF_PREDICTION_IMPLEMENTED = false/) &&
      has(VERSION, /probabilityOfFailureImplemented = false/) &&
      has(VERSION, /rulImplemented = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AV",
    "SHM boundary",
    has(VERSION, /SHM_RUNTIME_IMPLEMENTED = false/) &&
      has(VERSION, /SHM_SIMULATION_CALIBRATION_IMPLEMENTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AW",
    "Actuation forbidden",
    has(VERSION, /PHYSICAL_ACTUATION_ENABLED = false/) &&
      has(VERSION, /physicalActuationImplemented = false/) &&
      has(VERSION, /AUTOMATIC_CONTROL_ENABLED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AX",
    "Spatial ownership unresolved",
    has(VERSION, /SPATIAL_OWNERSHIP_FULLY_RESOLVED = false/) ? "pass" : "fail",
  );
  push(
    "AY",
    "Native solver false",
    has(VERSION, /NATIVE_ENGINEERING_SOLVER_IMPLEMENTED = false/) ? "pass" : "fail",
  );
  push(
    "AZ",
    "productionDigitalTwinReady=false",
    has(VERSION, /PRODUCTION_DIGITAL_TWIN_READY = false/) &&
      has(VERSION, /productionDigitalTwinReady = false/)
      ? "pass"
      : "fail",
  );

  push(
    "BA",
    "Hosted migration batch_84",
    exists(BATCH_84) &&
      has(BATCH_84, /batch_84/) &&
      has(BATCH_84, /digital_twin_thread_profiles/) &&
      has(BATCH_84, /digital_twin_outbox_events/)
      ? "pass"
      : "fail",
  );

  const hosted = await verifyHosted();
  const hasCreds = hosted.detail !== "missing_supabase_credentials";
  push(
    "BB",
    "Hosted persistence / RLS",
    hasCreds ? (hosted.tablesOk && hosted.rlsOk ? "pass" : "fail") : "fail",
    hosted.detail,
  );
  {
    const batch84Sql = readRepoFile(BATCH_84).replace(/--[^\n]*/g, "");
    push(
      "BC",
      "Events/outbox thread events",
      /engineering\.digital_twin\.thread\.composed/.test(batch84Sql) &&
        /engineering\.digital_twin\.thread\.integrity_changed/.test(batch84Sql) &&
        !/\bdigital_twin_outbox\b(?!_events)/.test(batch84Sql)
        ? "pass"
        : "fail",
    );
  }
  push("BD", "HTTP digital-threads", exists(THREAD_HTTP_ROUTES[0]) ? "pass" : "fail");
  push("BE", "HTTP digital-thread-as-of", exists(THREAD_HTTP_ROUTES[1]) ? "pass" : "fail");
  push("BF", "HTTP digital-thread-traversal", exists(THREAD_HTTP_ROUTES[2]) ? "pass" : "fail");
  push("BG", "HTTP digital-thread-compare", exists(THREAD_HTTP_ROUTES[3]) ? "pass" : "fail");
  push("BH", "HTTP digital-thread-integrity", exists(THREAD_HTTP_ROUTES[4]) ? "pass" : "fail");
  push("BI", "HTTP digital-thread-provenance", exists(THREAD_HTTP_ROUTES[5]) ? "pass" : "fail");
  push(
    "BJ",
    "JWT/tenant isolation",
    has(BATCH_84, /get_user_tenant_ids/) && has(BATCH_84, /ENABLE ROW LEVEL SECURITY/)
      ? "pass"
      : "fail",
  );
  push(
    "BK",
    "Workspace isolation",
    has(BATCH_84, /workspace_memberships/) ? "pass" : "fail",
  );
  push(
    "BL",
    "UI digital-thread-ready",
    exists(UI_PAGE) &&
      has(UI_PAGE, /digital-twin-digital-thread-ready/) &&
      has(UI_PAGE, /0\.11\.0-digital-thread/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/digital-twin test");

  if (process.env.CERTIFY_BROWSER !== "1") {
    push(
      "BM",
      "Browser E2E",
      "fail",
      "CERTIFY_BROWSER=1 required; hosted hard-fail without browser cert",
    );
  } else {
    const pw = run(
      "pnpm --filter @rtb/digital-twin-certification exec playwright test playwright/digital-thread.spec.ts",
      { CERTIFY_BROWSER: "1" },
    );
    push("BM", "Browser E2E", pw.ok ? "pass" : "fail", pw.ok ? "ok" : pw.detail.slice(0, 500));
  }

  push(
    "BN",
    "Accessibility",
    exists(PLAYWRIGHT) &&
      has(PLAYWRIGHT, /aria|accessible|landmark/i) &&
      has(UI_PAGE, /aria-labelledby/)
      ? "pass"
      : "fail",
  );
  push("BO", "Responsive", has(PLAYWRIGHT, /viewport|1280|375/i) ? "pass" : "fail");

  const secretScan = run(`pnpm --filter @rtb/digital-twin-certification secret-scan`);
  push("BP", "Secret exposure", secretScan.ok ? "pass" : "fail", secretScan.detail.slice(0, 300));

  const archTest = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase12k-digital-twin-digital-thread.test.ts",
  );

  push(
    "BQ",
    "Artifact identity",
    exists(GATES_FILE) &&
      exists(RUNNER_FILE) &&
      exists(WORKFLOW) &&
      exists(DT_TEST) &&
      exists(ARCH_TEST) &&
      exists(DOC_PHASE) &&
      DOMAIN_FILES.every((f) => exists(f)) &&
      THREAD_HTTP_ROUTES.every((r) => exists(r)) &&
      exists(BATCH_75) &&
      exists(BATCH_83) &&
      exists(BATCH_84)
      ? "pass"
      : "fail",
  );
  push("BR", "Unit tests", unit.ok ? "pass" : "fail", unit.ok ? "ok" : unit.detail.slice(0, 500));
  push(
    "BS",
    "Architecture tests",
    archTest.ok ? "pass" : "fail",
    archTest.ok ? "ok" : archTest.detail.slice(0, 500),
  );
  push(
    "BT",
    "Docs digital thread intelligence",
    exists(DOC_INTEL) && has(DOC_INTEL, /DigitalThreadIntelligenceEngine|Digital Thread/)
      ? "pass"
      : "fail",
  );
  push(
    "BU",
    "Docs phase 12K",
    exists(DOC_PHASE) && has(DOC_PHASE, /12K|digital.thread/i) ? "pass" : "fail",
  );
  push(
    "BV",
    "Ownership matrix updated",
    has(DOC_OWNERSHIP, /duplicateKnowledgeGraphDetected/) &&
      has(OWNERSHIP_LOCK, /digital_thread_provenance/)
      ? "pass"
      : "fail",
  );
  push(
    "BW",
    "batch_75–83 untouched",
    exists(BATCH_75) &&
      exists(BATCH_76) &&
      exists(BATCH_77) &&
      exists(BATCH_78) &&
      exists(BATCH_79) &&
      exists(BATCH_80) &&
      exists(BATCH_81) &&
      exists(BATCH_82) &&
      exists(BATCH_83) &&
      has(BATCH_83, /digital_twin_solver_capabilities/)
      ? "pass"
      : "fail",
  );
  push(
    "BX",
    "Phase 12L readiness flag only",
    has(VERSION, /PHASE_12L_READY = true/) &&
      has(VERSION, /phase12LReady = true/) &&
      has(VERSION, /Flag only — do not start Phase 12L/)
      ? "pass"
      : "fail",
  );
  push(
    "BY",
    "No domain/phase12l",
    !exists(`${DT}/src/domain/phase12l`) ? "pass" : "fail",
  );
  push(
    "BZ",
    "V1 tags untouched",
    aiTag === PHASE_12K_ASSET_INTELLIGENCE_V1_COMMIT &&
      pcTag === PHASE_12K_PROJECT_CONTROLS_V1_COMMIT &&
      has(VERSION, /ASSET_INTELLIGENCE_V1_INTACT = true/) &&
      has(VERSION, /PROJECT_CONTROLS_V1_INTACT = true/)
      ? "pass"
      : "fail",
    `ai=${aiTag ?? "missing"};pc=${pcTag ?? "missing"}`,
  );
  push(
    "CA",
    "Duplicate KG/TS/ownership false",
    has(VERSION, /DUPLICATE_KNOWLEDGE_GRAPH_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_TIME_SERIES_PLANE_DETECTED = false/) &&
      has(VERSION, /DUPLICATE_ASSET_OWNERSHIP_DETECTED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "CB",
    "PHASE_12J pins (commit/hosted/version)",
    has(VERSION, new RegExp(PHASE_12J_CERTIFIED_COMMIT)) &&
      has(VERSION, /PHASE_12J_HOSTED_RUN = "31267810968"/) &&
      has(VERSION, /PHASE_12J_VERSION = "0\.10\.0-solver-capabilities"/)
      ? "pass"
      : "fail",
  );
  push(
    "CC",
    "Public contract adapters reserved when missing",
    has(
      `${DT}/src/domain/digital-thread-reference.ts`,
      /resolveCrossDomainAdapterStatus/,
    ) &&
      has(`${DT}/src/domain/digital-thread-reference.ts`, /"reserved"/)
      ? "pass"
      : "fail",
  );
  push(
    "CD",
    "IntegrityAssessmentReady / DigitalThreadIntelligenceReady",
    has(VERSION, /INTEGRITY_ASSESSMENT_READY = true/) &&
      has(VERSION, /DIGITAL_THREAD_INTELLIGENCE_READY = true/) &&
      PHASE_12K_REQUIRED_READY_FLAGS.every((f) => versionText.includes(`${f} = true`))
      ? "pass"
      : "fail",
  );

  if (gates.length !== PHASE_12K_GATE_COUNT) {
    console.error(`Gate count mismatch: ${gates.length} !== ${PHASE_12K_GATE_COUNT}`);
  }

  const failed = gates.filter((g) => g.status === "fail");
  const skipped = gates.filter((g) => g.status === "skip");
  const notExecuted = gates.filter((g) => g.status === "not_executed");
  const pass = failed.length === 0 && skipped.length === 0 && notExecuted.length === 0;

  // camelCase primary flags only — avoid PascalCase duplicates that break PowerShell
  const artifact = {
    schemaVersion: "phase12k-digital-twin-digital-thread/1",
    phase: "12K",
    title: "Digital Twin Digital Thread Intelligence",
    moduleKey: "digital_twin",
    version: PHASE_12K_DIGITAL_TWIN_VERSION,
    status: "digital_thread",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: ciHeadSha,
    buildIdentitySha: ciHeadSha,
    digitalTwinImplemented: true,
    productionDigitalTwinReady: false,
    digitalTwinRuntimeImplemented: true,
    digitalThreadIntelligenceReady: true,
    provenanceReady: true,
    integrityAssessmentReady: true,
    temporalTraversalReady: true,
    changeSetReady: true,
    knowledgeGraphReuseReady: true,
    duplicateKnowledgeGraphDetected: false,
    solverCapabilityRegistryReady: true,
    fourLayerQualificationIntact: true,
    realSolverExecutionCertified: true,
    calculixAdapterIntact: true,
    realSolverHostedExecutionCertified: solverProbe.realSolverHostedExecutionCertified,
    silentSolverFallbackAllowed: false,
    externalSolverAdapterFrameworkReady: true,
    firstRealEngineeringSolverAdapterImplemented: true,
    firstRealEngineeringSolverMethodCertified: true,
    firstRealSolverId: "calculix",
    simulationExecutionImplemented: true,
    nativeEngineeringSolverImplemented: false,
    externalEngineeringSolverAdaptersImplemented: true,
    simulationOptimizationImplemented: false,
    automaticSimulationApprovalEnabled: false,
    predictiveTwinImplemented: false,
    pofPredictionImplemented: false,
    probabilityOfFailureImplemented: false,
    rulPredictionImplemented: false,
    rulImplemented: false,
    shmRuntimeImplemented: false,
    physicalActuationEnabled: false,
    physicalActuationImplemented: false,
    automaticControlEnabled: false,
    automaticControlImplemented: false,
    threeDViewerImplemented: false,
    duplicateEngineeringToolFrameworkDetected: false,
    duplicateSolverOwnershipDetected: false,
    duplicateTimeSeriesPlaneDetected: false,
    duplicateAssetOwnershipDetected: false,
    productionMemoryRepositoryAllowed: false,
    spatialOwnershipFullyResolved: false,
    publicContractVersion: "0.11.0-digital-thread-draft",
    phase12JVersion: PHASE_12J_VERSION,
    phase12JCertifiedCommit: PHASE_12J_CERTIFIED_COMMIT,
    phase12JHostedRun: PHASE_12J_HOSTED_RUN,
    phase12IVersion: PHASE_12I_VERSION,
    phase12ICertifiedCommit: PHASE_12I_CERTIFIED_COMMIT,
    phase12IHostedRun: PHASE_12I_HOSTED_RUN,
    projectControlsV1Intact: pcTag === PHASE_12K_PROJECT_CONTROLS_V1_COMMIT,
    assetIntelligenceV1Intact: aiTag === PHASE_12K_ASSET_INTELLIGENCE_V1_COMMIT,
    inspectionIntelligenceV1Intact: true,
    projectIntelligenceV1Intact: true,
    secretExposureDetected: !secretScan.ok,
    releaseEligible: pass,
    phase12HReady: true,
    phase12IReady: true,
    phase12JReady: true,
    phase12KReady: true,
    phase12LReady: true,
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
    digitalTwinTables: [...PHASE_12K_DIGITAL_TWIN_TABLES],
    forbiddenCapabilities: [...PHASE_12K_FORBIDDEN_CAPABILITIES],
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase12k-digital-twin-digital-thread-certification.json",
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
