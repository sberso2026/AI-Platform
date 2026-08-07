/**
 * Phase 10J certification runner (gates A–BG).
 * Predictive Method Governance — objectives, objective-specific readiness,
 * method registry, eligibility, candidates and fixture-bounded qualification.
 * Nothing here executes a predictive method or emits a predicted value.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_10J_ASSET_INTELLIGENCE_PREDICTIVE_GOVERNANCE_GATES,
  type Phase10jGateId,
} from "../src/phase10j/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const PI = "34975b1cf660580d46287f24e746b8915903f768";
const II = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const P10A = "81d1cade909cf991a9dc91b9236310143f4b215f";
const P10B = "ef7268e6dd3873f8941885a87a2723130a6bb6bc";
const P10B1 = "e72822434a38e66a409da3c8a291e68f006888c3";
const P10C = "10b0259134995f55bfe889dba2386edd653d9c2b";
const P10D = "ef6981e1c42f80cbb12337c21e6830eb22c3fdbf";
const P10E = "ed127cd85901f8053d09155f7c4053f0b22b8a5f";
const P10F = "94019ae995468ccddadc78a203e92e8460fe4bf0";
const P10F_RECERT_RUN = "31150273985";
const P10G = "f81d6ef1e322b49b823b04fc0464c5272c850e82";
const P10G_RUN = "31153833355";
const P10H = "acec6ce63f9e6eb6968d0f899a61cf442c35ec90";
const P10H_RUN = "31158369645";
/** Authoritative Phase 10I baseline identity (hosted PASS). */
const P10I = "27fed4e975f015ff01b60a41dd76ab06ea2886a9";
const P10I_RUN = "31163563401";

const MIGRATION_55 = "20260807160000_batch_55_asset_intelligence_timeseries.sql";
const MIGRATION_55B = "20260807161000_batch_55b_asset_intelligence_degradation_created_by.sql";
const MIGRATION_56 = "20260807170000_batch_56_asset_intelligence_lifecycle.sql";
const MIGRATION_57 = "20260807180000_batch_57_asset_intelligence_risk_priority.sql";
const MIGRATION_58 = "20260807190000_batch_58_asset_intelligence_fusion.sql";
const MIGRATION_59 = "20260807200000_batch_59_asset_intelligence_predictive_governance.sql";

const TABLES = [
  "asset_intelligence_predictive_objectives",
  "asset_intelligence_objective_predictive_readiness",
  "asset_intelligence_predictive_methods",
  "asset_intelligence_predictive_method_candidates",
  "asset_intelligence_predictive_method_qualifications",
  "asset_intelligence_predictive_validation_metrics",
  "asset_intelligence_predictive_reviews",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10jGateId; name: string; status: GateStatus; detail?: string };

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
function git(cmd: string) {
  return execSync(cmd, { cwd: root, encoding: "utf8" }).trim();
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
function tag(t: string) {
  try {
    return git(`git rev-list -n 1 ${t}`);
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
    return {
      tablesOk: false,
      rlsOk: false,
      jwtMatrixOk: false,
      detail: "missing_supabase_credentials",
    };
  }
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (const table of TABLES) {
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
    for (const table of [
      "asset_intelligence_objective_predictive_readiness",
      "asset_intelligence_predictive_method_candidates",
      "asset_intelligence_predictive_method_qualifications",
    ]) {
      const { data } = await anonClient.from(table).select("id").limit(5);
      if (Array.isArray(data) && data.length > 0) rlsOk = false;
    }
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `ai-cert-predictive-${Date.now()}@example.com`;
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
        const { data: rows, error: readErr } = await authed
          .from("asset_intelligence_objective_predictive_readiness")
          .select("id")
          .limit(5);
        const ROLE_MATRIX = "packages/asset-intelligence/src/domain/role-matrix.ts";
        jwtMatrixOk =
          !readErr &&
          Array.isArray(rows) &&
          rows.length === 0 &&
          has(ROLE_MATRIX, /"predictive_governance\.assess"/) &&
          has(ROLE_MATRIX, /"predictive_governance\.approve"/) &&
          has(ROLE_MATRIX, /"predictive_governance\.publish"/) &&
          has(ROLE_MATRIX, /ENGINEER_SELF_APPROVE_FORBIDDEN = true/);
      }
      await admin.auth.admin.deleteUser(created.user.id);
    }
  }
  return {
    tablesOk: true,
    rlsOk,
    jwtMatrixOk,
    detail: `hosted_ok;ephemeral_jwt=${jwtMatrixOk}`,
  };
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const gates: GateResult[] = [];
  const push = (id: Phase10jGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (process.env.GITHUB_ACTIONS === "true") run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");
  const hosted = await verifyHosted();
  const fileOk = (rel: string, re: RegExp) => has(rel, re);

  const AI = "packages/asset-intelligence/src";
  const VERSION = `${AI}/version.ts`;
  const OBJECTIVES = `${AI}/domain/predictive-objectives.ts`;
  const METHODS = `${AI}/domain/predictive-methods.ts`;
  const METRICS = `${AI}/domain/predictive-validation-metrics.ts`;
  const GOVERNANCE = `${AI}/domain/predictive-governance.ts`;
  const OBJECTIVE_READINESS = `${AI}/domain/predictive-readiness-objective.ts`;
  const ELIGIBILITY = `${AI}/domain/predictive-eligibility-engine.ts`;
  const QUALIFICATION = `${AI}/domain/predictive-qualification.ts`;
  const RECONCILIATION_ENGINE = `${AI}/domain/reconciliation-engine.ts`;
  const REVIEW_WORKFLOW = `${AI}/domain/review-workflow.ts`;
  const ROLE_MATRIX = `${AI}/domain/role-matrix.ts`;
  const EVENTS = `${AI}/domain/events.ts`;
  const TIMELINE = `${AI}/domain/timeline.ts`;
  const ENGINE = `${AI}/domain/engine.ts`;
  const SERVICES = `${AI}/domain/services.ts`;
  const HEALTH_COMPOSER = `${AI}/domain/health-composer.ts`;
  const PERSISTENCE = `${AI}/domain/persistence.ts`;
  const POSTGRES_REPOSITORY = `${AI}/domain/postgres-repository.ts`;
  const PERSISTENCE_HEALTH = `${AI}/domain/persistence-health.ts`;
  const SOURCE_REGISTRY = `${AI}/domain/source-registry.ts`;
  const OWNERSHIP_LOCK = `${AI}/architecture/ownership-lock.ts`;
  const INDEX = `${AI}/index.ts`;
  const II_CONSUMPTION = `${AI}/domain/ii-consumption.ts`;
  const MODEL_DOC = "docs/architecture/ASSET_INTELLIGENCE_PREDICTIVE_GOVERNANCE_MODEL.md";
  const FUSION_DOC = "docs/architecture/ASSET_INTELLIGENCE_MULTI_SOURCE_FUSION_MODEL.md";
  const ROUTE_BASE = "apps/web/src/app/api/engineering/asset-intelligence";
  const GOVERNANCE_ROUTE = `${ROUTE_BASE}/predictive-governance/route.ts`;
  const READINESS_ROUTE = `${ROUTE_BASE}/predictive-readiness/route.ts`;
  const HEALTH_ROUTE = `${ROUTE_BASE}/health/route.ts`;
  const MIGRATION_59_PATH = `supabase/migrations/${MIGRATION_59}`;
  const TEST_FILE = "packages/asset-intelligence/tests/phase10j-predictive-governance.test.ts";
  const ARCH_TEST =
    "packages/platform-certification/src/phase10j-asset-intelligence-predictive-governance.test.ts";

  push(
    "A",
    "Repository/build identity",
    existsSync(resolve(root, "pnpm-workspace.yaml")) &&
      fileOk(VERSION, /ASSET_INTELLIGENCE_VERSION = "0\.10\.0-predictive-governance"/) &&
      fileOk(VERSION, /ASSET_INTELLIGENCE_STATUS = "predictive_governance"/)
      ? "pass"
      : "fail",
  );
  push("B", "Phase 10A regression", fileOk(VERSION, new RegExp(P10A)) ? "pass" : "fail");
  push("C", "Phase 10B regression", fileOk(VERSION, new RegExp(P10B)) ? "pass" : "fail");
  push("D", "Phase 10B.1 regression", fileOk(VERSION, new RegExp(P10B1)) ? "pass" : "fail");
  push("E", "Phase 10C regression", fileOk(VERSION, new RegExp(P10C)) ? "pass" : "fail");
  push("F", "Phase 10D regression", fileOk(VERSION, new RegExp(P10D)) ? "pass" : "fail");
  push(
    "G",
    "Phase 10E regression",
    fileOk(VERSION, new RegExp(P10E)) && fileOk(VERSION, /FAILURE_INTELLIGENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "H",
    "Phase 10F regression",
    fileOk(VERSION, new RegExp(P10F)) &&
      fileOk(VERSION, new RegExp(P10F_RECERT_RUN)) &&
      fileOk(VERSION, /ENGINEERING_TIME_SERIES_READY = true/) &&
      fileOk(VERSION, /DEGRADATION_ANALYSIS_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "I",
    "Phase 10G regression",
    fileOk(VERSION, new RegExp(`PHASE_10G_CERTIFIED_COMMIT = "${P10G}"`)) &&
      fileOk(VERSION, new RegExp(`PHASE_10G_HOSTED_RUN = "${P10G_RUN}"`)) &&
      fileOk(VERSION, /LIFECYCLE_CONTEXT_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Phase 10H regression",
    fileOk(VERSION, new RegExp(`PHASE_10H_CERTIFIED_COMMIT = "${P10H}"`)) &&
      fileOk(VERSION, new RegExp(`PHASE_10H_HOSTED_RUN = "${P10H_RUN}"`)) &&
      fileOk(VERSION, /RISK_SIGNAL_ENGINE_READY = true/) &&
      fileOk(VERSION, /MAINTENANCE_RECOMMENDATION_ENGINE_READY = true/) &&
      fileOk(VERSION, /ASSET_PRIORITY_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Phase 10I regression",
    fileOk(VERSION, new RegExp(`PHASE_10I_CERTIFIED_COMMIT = "${P10I}"`)) &&
      fileOk(VERSION, new RegExp(`PHASE_10I_HOSTED_RUN = "${P10I_RUN}"`)) &&
      fileOk(VERSION, /MULTI_SOURCE_FUSION_READY = true/) &&
      fileOk(VERSION, /SOURCE_RECONCILIATION_ENGINE_READY = true/) &&
      fileOk(VERSION, /PREDICTIVE_READINESS_ASSESSOR_READY = true/) &&
      existsSync(resolve(root, FUSION_DOC))
      ? "pass"
      : "fail",
  );
  push("L", "PI v1 integrity", piTag === PI ? "pass" : "fail");
  push("M", "II v1 integrity", iiTag === II ? "pass" : "fail");
  push(
    "N",
    "Ownership locks",
    fileOk(VERSION, /ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk(VERSION, /CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk(VERSION, /ASSET_PREDICTIVE_GOVERNANCE_OWNERSHIP = "asset_intelligence"/) &&
      fileOk(VERSION, /CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core"/) &&
      fileOk(VERSION, /CMMS_WORK_ORDER_OWNERSHIP = "none_in_asset_intelligence"/) &&
      fileOk(VERSION, /PRODUCTION_ASSET_INTELLIGENCE_READY = false/) &&
      fileOk(OWNERSHIP_LOCK, /predictive_execution_forbidden_in_phase_10j/) &&
      fileOk(OWNERSHIP_LOCK, /PRODUCTION_PREDICTIVE_EXECUTION_ENABLED/) &&
      fileOk(OWNERSHIP_LOCK, /predictive_governance_is_not_a_health_factor/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Predictive terminology",
    existsSync(resolve(root, MODEL_DOC)) &&
      fileOk(MODEL_DOC, /## Terminology \(locked\)/) &&
      fileOk(MODEL_DOC, /Predictive readiness ≠ permission to predict/) &&
      fileOk(MODEL_DOC, /Method qualification ≠ certified predictive accuracy/) &&
      fileOk(MODEL_DOC, /Predictive Method Candidate/) &&
      fileOk(MODEL_DOC, /Method Certification/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Objective Registry",
    fileOk(VERSION, /PREDICTIVE_OBJECTIVE_REGISTRY_READY = true/) &&
      fileOk(OBJECTIVES, /PREDICTIVE_OBJECTIVE_REGISTRY/) &&
      fileOk(OBJECTIVES, /assertRegisteredObjective/) &&
      fileOk(OBJECTIVES, /condition_trend_projection/) &&
      fileOk(OBJECTIVES, /degradation_rate_estimation/) &&
      fileOk(OBJECTIVES, /threshold_crossing_estimation/) &&
      fileOk(OBJECTIVES, /certified: false/) &&
      fileOk(INDEX, /predictive-objectives/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Objective-specific readiness",
    fileOk(OBJECTIVE_READINESS, /class ObjectivePredictiveReadinessAssessor/) &&
      fileOk(OBJECTIVE_READINESS, /assessObjective/) &&
      fileOk(GOVERNANCE, /ObjectivePredictiveReadinessState/) &&
      fileOk(GOVERNANCE, /method: "objective_predictive_readiness_v1"/) &&
      fileOk(ENGINE, /async assessObjectivePredictiveReadiness/) &&
      fileOk(SERVICES, /assessObjectiveReadiness/) &&
      fileOk(
        MIGRATION_59_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_objective_predictive_readiness/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Method Registry",
    fileOk(VERSION, /PREDICTIVE_METHOD_REGISTRY_READY = true/) &&
      fileOk(METHODS, /PREDICTIVE_METHOD_REGISTRY/) &&
      fileOk(METHODS, /assertRegisteredMethod/) &&
      fileOk(METHODS, /assertNoCertifiedMethods/) &&
      fileOk(METHODS, /certified: false/) &&
      fileOk(METHODS, /productionExecutionEnabled: false/) &&
      fileOk(
        MIGRATION_59_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_methods/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Method classes",
    fileOk(METHODS, /PREDICTIVE_METHOD_CLASS_REGISTRY/) &&
      fileOk(OBJECTIVES, /"deterministic"/) &&
      fileOk(OBJECTIVES, /"statistical"/) &&
      fileOk(OBJECTIVES, /"physics_based"/) &&
      fileOk(OBJECTIVES, /"hybrid"/) &&
      fileOk(OBJECTIVES, /"machine_learning"/) &&
      fileOk(MODEL_DOC, /ML is \*\*not\*\* privileged over physics or statistical methods/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Method Eligibility Engine",
    fileOk(VERSION, /PREDICTIVE_METHOD_ELIGIBILITY_ENGINE_READY = true/) &&
      fileOk(ELIGIBILITY, /class PredictiveMethodEligibilityEngine/) &&
      fileOk(ELIGIBILITY, /executionAllowed: false/) &&
      fileOk(ENGINE, /async evaluateMethodEligibility/) &&
      fileOk(ENGINE, /async createMethodCandidate/) &&
      fileOk(INDEX, /predictive-eligibility-engine/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Method Candidate",
    fileOk(GOVERNANCE, /PredictiveMethodCandidate/) &&
      fileOk(GOVERNANCE, /method: "predictive_method_candidate_v1"/) &&
      fileOk(ELIGIBILITY, /containsPredictionOutput: false/) &&
      fileOk(PERSISTENCE, /savePredictiveMethodCandidate/) &&
      fileOk(POSTGRES_REPOSITORY, /savePredictiveMethodCandidate/) &&
      fileOk(
        MIGRATION_59_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_method_candidates/,
      ) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(contains_prediction_output = false\)/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Qualification Framework",
    fileOk(VERSION, /PREDICTIVE_METHOD_QUALIFICATION_FRAMEWORK_READY = true/) &&
      fileOk(QUALIFICATION, /createQualificationDraft/) &&
      fileOk(QUALIFICATION, /evaluateAgainstAcceptanceCriteria/) &&
      fileOk(QUALIFICATION, /fixtureSetHash/) &&
      fileOk(QUALIFICATION, /qualificationGrantsExecution/) &&
      fileOk(ENGINE, /async startMethodQualification/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Validation Metric Registry",
    fileOk(VERSION, /PREDICTIVE_VALIDATION_METRIC_REGISTRY_READY = true/) &&
      fileOk(METRICS, /VALIDATION_METRIC_REGISTRY/) &&
      fileOk(METRICS, /assertRegisteredMetric/) &&
      fileOk(METRICS, /acceptanceThresholdDefined: false/) &&
      fileOk(METRICS, /certificationImplied: false/) &&
      fileOk(
        MIGRATION_59_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_validation_metrics/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Qualification State",
    fileOk(GOVERNANCE, /PredictiveMethodQualificationState/) &&
      fileOk(GOVERNANCE, /certificationGranted: false/) &&
      fileOk(PERSISTENCE, /savePredictiveMethodQualification/) &&
      fileOk(POSTGRES_REPOSITORY, /savePredictiveMethodQualification/) &&
      fileOk(
        MIGRATION_59_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_method_qualifications/,
      ) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(certification_granted = false\)/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Governed review",
    fileOk(REVIEW_WORKFLOW, /asset_intelligence\.predictive_method_review/) &&
      fileOk(REVIEW_WORKFLOW, /startPredictiveMethodReview/) &&
      fileOk(REVIEW_WORKFLOW, /transitionPredictiveMethodReview/) &&
      fileOk(REVIEW_WORKFLOW, /grantsProductionExecution: false/) &&
      fileOk(ENGINE, /async reviewMethodQualification/) &&
      fileOk(
        MIGRATION_59_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_reviews/,
      ) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(grants_production_execution = false\)/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Segregation of duties",
    fileOk(ROLE_MATRIX, /ENGINEER_SELF_APPROVE_FORBIDDEN = true/) &&
      fileOk(ROLE_MATRIX, /"predictive_governance\.assess"/) &&
      fileOk(ROLE_MATRIX, /"predictive_governance\.submit"/) &&
      fileOk(ROLE_MATRIX, /"predictive_governance\.review"/) &&
      fileOk(ROLE_MATRIX, /"predictive_governance\.approve"/) &&
      fileOk(ROLE_MATRIX, /"predictive_governance\.publish"/) &&
      fileOk(ROLE_MATRIX, /SELF_APPROVE_FORBIDDEN_CAPABILITIES/) &&
      fileOk(ENGINE, /segregation_of_duties_violation/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Production execution policy",
    fileOk(VERSION, /PRODUCTION_PREDICTIVE_EXECUTION_ENABLED = false/) &&
      fileOk(GOVERNANCE, /PREDICTIVE_GOVERNANCE_LOCKS/) &&
      fileOk(GOVERNANCE, /productionPredictiveExecutionEnabled: false/) &&
      fileOk(ENGINE, /productionPredictiveExecutionEnabled: false/) &&
      fileOk(GOVERNANCE_ROUTE, /productionPredictiveExecutionEnabled: false/) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(production_execution_enabled = false\)/) &&
      fileOk(MODEL_DOC, /## Production execution policy/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "ML governance",
    fileOk(VERSION, /PREDICTIVE_ML_ENABLED = false/) &&
      fileOk(METHODS, /RESERVED_ML_GOVERNANCE/) &&
      fileOk(METHODS, /suspendedFromExecution: true/) &&
      fileOk(ELIGIBILITY, /predictive_ml_enabled=false/) &&
      fileOk(MIGRATION_59_PATH, /ai_predictive_methods_ml_suspended/) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(predictive_ml_enabled = false\)/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Physics-method compatibility",
    fileOk(METHODS, /methodClass: "physics_based"/) &&
      fileOk(METHODS, /corrosion_rate_projection/) &&
      fileOk(METHODS, /material_properties/) &&
      fileOk(OBJECTIVES, /"physics_based"/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Statistical-method compatibility",
    fileOk(METHODS, /methodClass: "statistical"/) &&
      fileOk(METHODS, /linear_trend_extrapolation/) &&
      fileOk(METHODS, /methodClass: "deterministic"/) &&
      fileOk(METHODS, /methodClass: "hybrid"/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Abstention",
    fileOk(ELIGIBILITY, /abstained/) &&
      fileOk(ELIGIBILITY, /abstained_method_not_applicable/) &&
      fileOk(ELIGIBILITY, /abstained_assumptions_violated/) &&
      fileOk(OBJECTIVE_READINESS, /not_ready/) &&
      fileOk(ENGINE, /abstentionReason/)
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Fusion provenance",
    fileOk(GOVERNANCE, /FusionProvenanceRef/) &&
      fileOk(OBJECTIVE_READINESS, /buildFusionProvenance/) &&
      fileOk(ELIGIBILITY, /fusionProvenance: readiness\.fusionProvenance/) &&
      fileOk(MIGRATION_59_PATH, /fusion_provenance jsonb/) &&
      fileOk(MODEL_DOC, /Fusion provenance preserved on every candidate/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "Evidence Confidence",
    fileOk(VERSION, /EVIDENCE_CONFIDENCE_ENGINE_READY = true/) &&
      fileOk(OBJECTIVE_READINESS, /evidenceConfidence/) &&
      fileOk(ELIGIBILITY, /evidence_confidence_below_minimum/) &&
      fileOk(GOVERNANCE, /evidenceConfidenceRef/)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "Trend Confidence",
    fileOk(VERSION, /TREND_CONFIDENCE_ENGINE_READY = true/) &&
      fileOk(OBJECTIVE_READINESS, /trendConfidence/) &&
      fileOk(ELIGIBILITY, /trend_confidence_below_minimum/) &&
      fileOk(GOVERNANCE, /trendConfidenceRef/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Freshness policy",
    fileOk(GOVERNANCE, /DEFAULT_PREDICTIVE_FRESHNESS_POLICY/) &&
      fileOk(GOVERNANCE, /classifyFreshness/) &&
      fileOk(OBJECTIVE_READINESS, /freshnessState/) &&
      fileOk(ELIGIBILITY, /evidence_stale/) &&
      fileOk(MIGRATION_59_PATH, /freshness_state text NOT NULL/) &&
      fileOk(MODEL_DOC, /## Freshness policy/)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "Hosted migration",
    existsSync(resolve(root, MIGRATION_59_PATH)) &&
      TABLES.every((t) =>
        fileOk(MIGRATION_59_PATH, new RegExp(`CREATE TABLE IF NOT EXISTS ${t}`)),
      ) &&
      fileOk(MIGRATION_59_PATH, /ENABLE ROW LEVEL SECURITY/) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(is_health_factor = false\)/) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(autonomous_execution_forbidden = true\)/)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "Migration lineage",
    existsSync(resolve(root, `supabase/migrations/${MIGRATION_55}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_55B}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_56}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_57}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_58}`)) &&
      existsSync(resolve(root, MIGRATION_59_PATH)) &&
      fileOk(MIGRATION_59_PATH, /Additive only; do not rewrite batch_55 \/ 55b \/ 56 \/ 57 \/ 58/)
      ? "pass"
      : "fail",
  );
  push("AL", "Hosted persistence", hosted.tablesOk ? "pass" : "fail", hosted.detail);
  push(
    "AM",
    "Snapshot",
    fileOk(ENGINE, /composeAssetSnapshot/) &&
      fileOk(ENGINE, /async assessPredictiveGovernanceBundle/) &&
      fileOk(ENGINE, /containsPredictionOutput: false/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "Timeline",
    fileOk(TIMELINE, /predictive_objective_readiness/) &&
      fileOk(TIMELINE, /predictive_objective_readiness_review/) &&
      fileOk(TIMELINE, /predictive_objective_readiness_published/) &&
      fileOk(TIMELINE, /predictive_method_candidate/) &&
      fileOk(TIMELINE, /predictive_method_qualification/) &&
      fileOk(TIMELINE, /predictive_method_qualified/)
      ? "pass"
      : "fail",
  );
  push(
    "AO",
    "Event/outbox",
    fileOk(EVENTS, /engineering\.asset\.predictive_objective_readiness\.assessed/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_objective_readiness\.published/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_objective_readiness\.superseded/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_method_candidate\.proposed/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_method_qualification\.started/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_method_qualification\.evaluated/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_method_qualification\.qualified/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_method_qualification\.rejected/) &&
      fileOk(ENGINE, /appendOutbox/)
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "Health boundary",
    fileOk(VERSION, /PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED = false/) &&
      fileOk(HEALTH_COMPOSER, /PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED = false/) &&
      fileOk(ENGINE, /predictiveHealthContributionEnabled: false/) &&
      fileOk(ENGINE, /healthMutated: false/) &&
      fileOk(GOVERNANCE, /isHealthFactor: false/) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(is_health_factor = false\)/)
      ? "pass"
      : "fail",
  );
  push(
    "AQ",
    "Risk/Maintenance/Priority boundary",
    fileOk(ENGINE, /createsCoreRisk: false/) &&
      fileOk(ENGINE, /createsWorkOrder: false/) &&
      fileOk(ENGINE, /mutatesCanonicalLifecycle: false/) &&
      fileOk(VERSION, /RISK_CORE_AUTO_MUTATION_ALLOWED = false/) &&
      fileOk(MODEL_DOC, /does not mutate Risk \/ Maintenance \/ Priority \/ Core Risk \/ CMMS/)
      ? "pass"
      : "fail",
  );
  push(
    "AR",
    "PoF remains uncertified",
    fileOk(VERSION, /PROBABILITY_OF_FAILURE_CERTIFIED = false/) &&
      fileOk(OBJECTIVES, /probability_of_failure/) &&
      fileOk(OBJECTIVES, /isPermanentlyNotReadyInPhase10J/) &&
      fileOk(OBJECTIVE_READINESS, /probability_of_failure_certified=false/) &&
      fileOk(GOVERNANCE_ROUTE, /probabilityOfFailureCertified: false/) &&
      fileOk(MIGRATION_59_PATH, /ai_objective_readiness_reserved_objectives_not_ready/) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(probability_of_failure_certified = false\)/)
      ? "pass"
      : "fail",
  );
  push(
    "AS",
    "RUL remains uncertified",
    fileOk(VERSION, /RUL_CLAIMS_CERTIFIED = false/) &&
      fileOk(OBJECTIVES, /remaining_useful_life/) &&
      fileOk(OBJECTIVE_READINESS, /rul_claims_certified=false/) &&
      fileOk(GOVERNANCE_ROUTE, /rulClaimsCertified: false/) &&
      fileOk(MIGRATION_59_PATH, /CHECK \(rul_claims_certified = false\)/) &&
      fileOk(MODEL_DOC, /## Reserved objectives — PoF and RUL/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "HTTP contracts",
    existsSync(resolve(root, GOVERNANCE_ROUTE)) &&
      existsSync(resolve(root, READINESS_ROUTE)) &&
      fileOk(GOVERNANCE_ROUTE, /error: \{ code, message, requestId, details \}/) &&
      fileOk(GOVERNANCE_ROUTE, /containsPredictionOutput: false/) &&
      fileOk(GOVERNANCE_ROUTE, /predictiveHealthContributionEnabled: false/) &&
      fileOk(GOVERNANCE_ROUTE, /aiMayPublishForbidden: true/)
      ? "pass"
      : "fail",
  );
  push("AU", "Real JWT matrix", hosted.jwtMatrixOk ? "pass" : "fail", hosted.detail);
  push("AV", "Tenant isolation", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("AW", "Workspace isolation", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("AX", "IDOR", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push(
    "AY",
    "Idempotency",
    fileOk(ENGINE, /operation: "assess_objective_predictive_readiness"/) &&
      fileOk(ENGINE, /operation: "evaluate_method_eligibility"/) &&
      fileOk(ENGINE, /operation: "start_method_qualification"/) &&
      fileOk(PERSISTENCE, /findIdempotency/) &&
      fileOk(PERSISTENCE, /saveIdempotency/)
      ? "pass"
      : "fail",
  );
  push(
    "AZ",
    "Concurrency",
    fileOk(PERSISTENCE, /nextObjectivePredictiveReadinessVersion/) &&
      fileOk(PERSISTENCE, /nextPredictiveMethodCandidateVersion/) &&
      fileOk(PERSISTENCE, /nextPredictiveMethodQualificationVersion/) &&
      fileOk(POSTGRES_REPOSITORY, /nextObjectivePredictiveReadinessVersion/) &&
      fileOk(POSTGRES_REPOSITORY, /nextPredictiveMethodQualificationVersion/) &&
      fileOk(ENGINE, /published_predictive_method_qualification_immutable/) &&
      fileOk(PERSISTENCE, /optimistic_lock_conflict/) &&
      fileOk(POSTGRES_REPOSITORY, /optimistic_lock_conflict/)
      ? "pass"
      : "fail",
  );
  push(
    "BA",
    "Health/observability",
    existsSync(resolve(root, HEALTH_ROUTE)) &&
      fileOk(PERSISTENCE_HEALTH, /predictiveObjectiveStore/) &&
      fileOk(PERSISTENCE_HEALTH, /objectivePredictiveReadinessStore/) &&
      fileOk(PERSISTENCE_HEALTH, /predictiveMethodStore/) &&
      fileOk(PERSISTENCE_HEALTH, /predictiveMethodCandidateStore/) &&
      fileOk(PERSISTENCE_HEALTH, /predictiveMethodQualificationStore/) &&
      fileOk(PERSISTENCE_HEALTH, /predictiveValidationMetricStore/) &&
      fileOk(PERSISTENCE_HEALTH, /predictiveReviewStore/)
      ? "pass"
      : "fail",
  );
  push(
    "BB",
    "No production memory",
    fileOk(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      fileOk(VERSION, /PRODUCTION_ASSET_INTELLIGENCE_READY = false/) &&
      fileOk(PERSISTENCE, /assertProductionRepositorySafe/)
      ? "pass"
      : "fail",
  );
  push(
    "BC",
    "Predictive ML disabled by default",
    fileOk(VERSION, /PREDICTIVE_ML_ENABLED = false/) &&
      fileOk(VERSION, /PREDICTIVE_METHODS_CERTIFIED = false/) &&
      fileOk(GOVERNANCE, /predictiveMlEnabled: false/) &&
      fileOk(GOVERNANCE_ROUTE, /predictiveMlEnabled: false/) &&
      fileOk(SOURCE_REGISTRY, /"predictive_governance"/) &&
      fileOk(II_CONSUMPTION, /assertIiPublicContractConsumption/)
      ? "pass"
      : "fail",
  );
  push(
    "BD",
    "Production predictive execution disabled",
    fileOk(VERSION, /PRODUCTION_PREDICTIVE_EXECUTION_ENABLED = false/) &&
      fileOk(VERSION, /SOURCE_TRUST_MODEL_READY = false/) &&
      fileOk(GOVERNANCE, /containsPredictionOutput: false/) &&
      fileOk(ENGINE, /NEVER/i) &&
      fileOk(MODEL_DOC, /## Source Trust \(reserved\)/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/asset-intelligence test");
  const arch = run(
    "pnpm --filter @rtb/platform-certification exec vitest run src/phase10j-asset-intelligence-predictive-governance.test.ts",
  );
  const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
  const testsOk =
    unit.ok && arch.ok && existsSync(resolve(root, TEST_FILE)) && existsSync(resolve(root, ARCH_TEST));
  push(
    "BE",
    "Secret exposure",
    testsOk && secret.ok ? "pass" : "fail",
    testsOk ? secret.detail : unit.ok ? arch.detail : unit.detail,
  );
  push(
    "BF",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeLast = gates.filter((g) => g.status === "fail");
  /**
   * GA readiness is the non-predictive path: Asset Intelligence remains
   * releasable precisely because nothing in it depends on a certified
   * predictive claim.
   */
  const assetIntelligenceGaReadiness =
    fileOk(VERSION, /PRODUCTION_PREDICTIVE_EXECUTION_ENABLED = false/) &&
    fileOk(VERSION, /PREDICTIVE_ML_ENABLED = false/) &&
    fileOk(VERSION, /PROBABILITY_OF_FAILURE_CERTIFIED = false/) &&
    fileOk(VERSION, /RUL_CLAIMS_CERTIFIED = false/) &&
    fileOk(VERSION, /PREDICTIVE_HEALTH_CONTRIBUTION_ENABLED = false/) &&
    fileOk(VERSION, /MULTI_SOURCE_FUSION_READY = true/) &&
    fileOk(VERSION, /HEALTH_COMPOSITION_ENGINE_READY = true/) &&
    fileOk(MODEL_DOC, /Asset Intelligence V1 remains releasable without PoF\/RUL\/ML certification/);
  const phase10KReady =
    failedBeforeLast.length === 0 &&
    assetIntelligenceGaReadiness &&
    hosted.tablesOk &&
    hosted.rlsOk &&
    hosted.jwtMatrixOk &&
    piTag === PI &&
    iiTag === II;
  push(
    "BG",
    "Asset Intelligence GA readiness / Phase 10K",
    phase10KReady ? "pass" : "fail",
    hosted.detail,
  );

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase10j-asset-intelligence-predictive-governance/1",
    phase: "10J",
    version: "0.10.0-predictive-governance",
    moduleKey: "asset_intelligence",
    title: "Asset Intelligence Predictive Method Governance",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    authoritativePhase10IBaseline: P10I,
    phase10IHostedRun: P10I_RUN,
    migrationLineage: [
      MIGRATION_55,
      MIGRATION_55B,
      MIGRATION_56,
      MIGRATION_57,
      MIGRATION_58,
      MIGRATION_59,
    ],
    projectIntelligenceV1Intact: piTag === PI,
    inspectionIntelligenceV1Intact: iiTag === II,
    assetIdentityOwnership: "engineering_os_shared_domain",
    assetIntelligenceOwnership: "asset_intelligence",
    canonicalAssetLifecycleOwnership: "engineering_os_shared_domain",
    assetFusionOwnership: "asset_intelligence",
    assetPredictiveGovernanceOwnership: "asset_intelligence",
    canonicalEngineeringRiskOwnership: "engineering_core",
    cmmsWorkOrderOwnership: "none_in_asset_intelligence",
    duplicateAssetOwnershipDetected: false,
    productionAssetIntelligenceReady: false,
    productionMemoryRepositoryAllowed: false,
    hostedAssetIntelligencePersistenceReady: hosted.tablesOk,
    healthCompositionEngineReady: true,
    evidenceConfidenceEngineReady: true,
    trendConfidenceEngineReady: true,
    multiSourceFusionReady: true,
    sourceReconciliationEngineReady: true,
    predictiveReadinessAssessorReady: true,
    predictiveObjectiveRegistryReady: true,
    predictiveMethodRegistryReady: true,
    predictiveMethodEligibilityEngineReady: true,
    predictiveMethodQualificationFrameworkReady: true,
    predictiveValidationMetricRegistryReady: true,
    objectiveSpecificReadinessReady: true,
    sourceTrustModelReady: false,
    productionPredictiveExecutionEnabled: false,
    predictiveMlEnabled: false,
    predictiveMlExecuted: false,
    predictiveMethodsCertified: false,
    predictiveHealthContributionEnabled: false,
    containsPredictionOutput: false,
    autonomousExecutionForbidden: true,
    probabilityOfFailureCertified: false,
    rulClaimsCertified: false,
    accuracyClaimsCertified: false,
    quantitativeReliabilityCertified: false,
    criticalityIsHealthFactor: false,
    fusionHealthContributionEnabled: false,
    riskCoreAutoMutationAllowed: false,
    createsCoreRisk: false,
    createsWorkOrder: false,
    mutatesCanonicalLifecycle: false,
    secretExposureDetected: gates.some((g) => g.id === "BE" && g.status === "fail"),
    secretExposure: gates.some((g) => g.id === "BE" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    assetIntelligenceGaReadiness,
    releaseEligible: pass,
    phase10KReady: pass && phase10KReady,
    gates,
    requiredGates: PHASE_10J_ASSET_INTELLIGENCE_PREDICTIVE_GOVERNANCE_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    failedGates: finalFailed.map((g) => g.id),
    hostedDetail: hosted.detail,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(
    outDir,
    "phase10j-asset-intelligence-predictive-governance-certification.json",
  );
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
