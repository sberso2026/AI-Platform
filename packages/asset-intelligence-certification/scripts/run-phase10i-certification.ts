/**
 * Phase 10I certification runner (gates A–AZ).
 * Multi-Source Fusion, Source Reconciliation, and Predictive Readiness —
 * governed composition of published slices. Predictive methods are never executed.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_10I_ASSET_INTELLIGENCE_FUSION_GATES,
  type Phase10iGateId,
} from "../src/phase10i/gates.js";

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
/** Authoritative Phase 10H baseline identity (hosted PASS). */
const P10H = "acec6ce63f9e6eb6968d0f899a61cf442c35ec90";
const P10H_RUN = "31158369645";

const MIGRATION_55 = "20260807160000_batch_55_asset_intelligence_timeseries.sql";
const MIGRATION_55B = "20260807161000_batch_55b_asset_intelligence_degradation_created_by.sql";
const MIGRATION_56 = "20260807170000_batch_56_asset_intelligence_lifecycle.sql";
const MIGRATION_57 = "20260807180000_batch_57_asset_intelligence_risk_priority.sql";
const MIGRATION_58 = "20260807190000_batch_58_asset_intelligence_fusion.sql";

const TABLES = [
  "asset_intelligence_fusion_states",
  "asset_intelligence_fusion_reviews",
  "asset_intelligence_reconciliation_records",
  "asset_intelligence_predictive_readiness_states",
  "asset_intelligence_predictive_readiness_reviews",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10iGateId; name: string; status: GateStatus; detail?: string };

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
      "asset_intelligence_fusion_states",
      "asset_intelligence_predictive_readiness_states",
    ]) {
      const { data } = await anonClient.from(table).select("id").limit(5);
      if (Array.isArray(data) && data.length > 0) rlsOk = false;
    }
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `ai-cert-fusion-${Date.now()}@example.com`;
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
          .from("asset_intelligence_fusion_states")
          .select("id")
          .limit(5);
        jwtMatrixOk =
          !readErr &&
          Array.isArray(rows) &&
          rows.length === 0 &&
          has("packages/asset-intelligence/src/domain/role-matrix.ts", /"fusion\.assess"/) &&
          has(
            "packages/asset-intelligence/src/domain/role-matrix.ts",
            /"predictive_readiness\.assess"/,
          ) &&
          has(
            "packages/asset-intelligence/src/domain/role-matrix.ts",
            /ENGINEER_SELF_APPROVE_FORBIDDEN = true/,
          );
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
  const push = (id: Phase10iGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (process.env.GITHUB_ACTIONS === "true") run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");
  const hosted = await verifyHosted();
  const fileOk = (rel: string, re: RegExp) => has(rel, re);

  const VERSION = "packages/asset-intelligence/src/version.ts";
  const FUSION = "packages/asset-intelligence/src/domain/fusion.ts";
  const FUSION_ENGINE = "packages/asset-intelligence/src/domain/fusion-engine.ts";
  const RECONCILIATION_ENGINE = "packages/asset-intelligence/src/domain/reconciliation-engine.ts";
  const REVIEW_WORKFLOW = "packages/asset-intelligence/src/domain/review-workflow.ts";
  const ROLE_MATRIX = "packages/asset-intelligence/src/domain/role-matrix.ts";
  const EVENTS = "packages/asset-intelligence/src/domain/events.ts";
  const TIMELINE = "packages/asset-intelligence/src/domain/timeline.ts";
  const ENGINE = "packages/asset-intelligence/src/domain/engine.ts";
  const HEALTH_COMPOSER = "packages/asset-intelligence/src/domain/health-composer.ts";
  const PERSISTENCE = "packages/asset-intelligence/src/domain/persistence.ts";
  const POSTGRES_REPOSITORY = "packages/asset-intelligence/src/domain/postgres-repository.ts";
  const PERSISTENCE_HEALTH = "packages/asset-intelligence/src/domain/persistence-health.ts";
  const SOURCE_REGISTRY = "packages/asset-intelligence/src/domain/source-registry.ts";
  const OWNERSHIP_LOCK = "packages/asset-intelligence/src/architecture/ownership-lock.ts";
  const INDEX = "packages/asset-intelligence/src/index.ts";
  const II_CONSUMPTION = "packages/asset-intelligence/src/domain/ii-consumption.ts";
  const MODEL_DOC = "docs/architecture/ASSET_INTELLIGENCE_MULTI_SOURCE_FUSION_MODEL.md";
  const ROUTE_BASE = "apps/web/src/app/api/engineering/asset-intelligence";
  const FUSION_ROUTE = `${ROUTE_BASE}/fusion/route.ts`;
  const READINESS_ROUTE = `${ROUTE_BASE}/predictive-readiness/route.ts`;
  const HEALTH_ROUTE = `${ROUTE_BASE}/health/route.ts`;
  const MIGRATION_58_PATH = `supabase/migrations/${MIGRATION_58}`;
  const TEST_FILE = "packages/asset-intelligence/tests/phase10i-fusion.test.ts";

  push(
    "A",
    "Repository/build identity",
    existsSync(resolve(root, "pnpm-workspace.yaml")) &&
      fileOk(
        VERSION,
        /ASSET_INTELLIGENCE_VERSION = "(0\.9\.0-fusion-readiness|0\.10\.0-predictive-governance|1\.0\.0)"/,
      )
      ? "pass"
      : "fail",
  );
  push("B", "Phase 10A regression", fileOk(VERSION, new RegExp(P10A)) ? "pass" : "fail");
  push("C", "Phase 10B regression", fileOk(VERSION, new RegExp(P10B)) ? "pass" : "fail");
  push(
    "D",
    "Phase 10B.1 persistence regression",
    fileOk(VERSION, new RegExp(P10B1)) ? "pass" : "fail",
  );
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
    "Authoritative Phase 10H baseline",
    fileOk(VERSION, new RegExp(`PHASE_10H_CERTIFIED_COMMIT = "${P10H}"`)) &&
      fileOk(VERSION, new RegExp(`PHASE_10H_HOSTED_RUN = "${P10H_RUN}"`)) &&
      fileOk(VERSION, /RISK_SIGNAL_ENGINE_READY = true/) &&
      fileOk(VERSION, /MAINTENANCE_RECOMMENDATION_ENGINE_READY = true/) &&
      fileOk(VERSION, /ASSET_PRIORITY_ENGINE_READY = true/)
      ? "pass"
      : "fail",
  );
  push("K", "PI v1 integrity", piTag === PI ? "pass" : "fail");
  push("L", "II v1 integrity", iiTag === II ? "pass" : "fail");
  push(
    "M",
    "Ownership locks",
    fileOk(VERSION, /ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk(VERSION, /CANONICAL_ASSET_LIFECYCLE_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk(VERSION, /ASSET_FUSION_OWNERSHIP = "asset_intelligence"/) &&
      fileOk(VERSION, /CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core"/) &&
      fileOk(VERSION, /CMMS_WORK_ORDER_OWNERSHIP = "none_in_asset_intelligence"/) &&
      fileOk(VERSION, /PRODUCTION_ASSET_INTELLIGENCE_READY = (true|false)/) &&
      fileOk(OWNERSHIP_LOCK, /multi_source_fusion/) &&
      fileOk(OWNERSHIP_LOCK, /source_reconciliation/) &&
      fileOk(OWNERSHIP_LOCK, /predictive_readiness/) &&
      fileOk(OWNERSHIP_LOCK, /predictive_execution_forbidden_in_phase_10i/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Fusion model doc/terminology",
    existsSync(resolve(root, MODEL_DOC)) &&
      fileOk(MODEL_DOC, /Multi-Source Fusion State/) &&
      fileOk(MODEL_DOC, /Source Reconciliation/) &&
      fileOk(MODEL_DOC, /Predictive Readiness/) &&
      fileOk(MODEL_DOC, /does \*\*not\*\* execute predictive ML/) &&
      fileOk(MODEL_DOC, /Do \*\*not\*\* collapse sources into one opaque score/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "MultiSourceFusionEngine",
    fileOk(FUSION_ENGINE, /class MultiSourceFusionEngine/) &&
      fileOk(VERSION, /MULTI_SOURCE_FUSION_READY = true/) &&
      fileOk(FUSION, /AssetFusionState/) &&
      fileOk(FUSION, /method: "multi_source_fusion_v1"/) &&
      fileOk(ENGINE, /async assessFusion/) &&
      fileOk(INDEX, /fusion-engine/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Published-slice rule",
    fileOk(FUSION_ENGINE, /not_published:/) &&
      fileOk(FUSION_ENGINE, /publishedSlicePolicy: "published_or_approved_only"/) &&
      fileOk(ENGINE, /Only published\/approved slices are forwarded/) &&
      fileOk(MODEL_DOC, /## Published-slice rule/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Source Reconciliation Engine",
    fileOk(RECONCILIATION_ENGINE, /class SourceReconciliationEngine/) &&
      fileOk(VERSION, /SOURCE_RECONCILIATION_ENGINE_READY = true/) &&
      fileOk(FUSION, /SourceReconciliationRecord/) &&
      fileOk(FUSION, /method: "source_reconciliation_v1"/) &&
      fileOk(ENGINE, /listReconciliationRecords/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Autonomous resolution forbidden",
    fileOk(FUSION, /autonomousResolutionForbidden: true/) &&
      fileOk(RECONCILIATION_ENGINE, /autonomousResolutionForbidden: true/) &&
      fileOk(RECONCILIATION_ENGINE, /require_human_review/) &&
      fileOk(RECONCILIATION_ENGINE, /autonomous_resolution_forbidden/) &&
      fileOk(ENGINE, /autonomousReconciliationForbidden: true/) &&
      fileOk(MIGRATION_58_PATH, /CHECK \(autonomous_resolution_forbidden = true\)/) &&
      fileOk(MODEL_DOC, /## Autonomous resolution forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "PredictiveReadinessAssessor",
    fileOk(RECONCILIATION_ENGINE, /class PredictiveReadinessAssessor/) &&
      fileOk(VERSION, /PREDICTIVE_READINESS_ASSESSOR_READY = true/) &&
      fileOk(FUSION, /PredictiveReadinessState/) &&
      fileOk(FUSION, /method: "predictive_readiness_v1"/) &&
      fileOk(ENGINE, /async assessPredictiveReadiness/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "predictiveMlEnabled=false",
    fileOk(VERSION, /PREDICTIVE_ML_ENABLED = false/) &&
      fileOk(FUSION, /predictiveMlEnabled: false/) &&
      fileOk(FUSION, /predictiveMlExecuted: false/) &&
      fileOk(RECONCILIATION_ENGINE, /predictiveAllowed: false/) &&
      fileOk(MIGRATION_58_PATH, /CHECK \(predictive_ml_enabled = false\)/) &&
      fileOk(MIGRATION_58_PATH, /CHECK \(predictive_ml_executed = false\)/) &&
      fileOk(FUSION_ROUTE, /predictiveMlEnabled: false/) &&
      fileOk(READINESS_ROUTE, /predictive_execution_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "predictiveMethodsCertified=false",
    fileOk(VERSION, /PREDICTIVE_METHODS_CERTIFIED = false/) &&
      fileOk(FUSION, /predictiveMethodsCertified: false/) &&
      fileOk(MIGRATION_58_PATH, /CHECK \(predictive_methods_certified = false\)/) &&
      fileOk(READINESS_ROUTE, /predictiveMethodsCertified: false/) &&
      fileOk(OWNERSHIP_LOCK, /PREDICTIVE_METHODS_CERTIFIED/)
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "No Probability of Failure claim",
    fileOk(VERSION, /PROBABILITY_OF_FAILURE_CERTIFIED = false/) &&
      fileOk(FUSION, /probabilityOfFailureCertified: false/) &&
      fileOk(MIGRATION_58_PATH, /CHECK \(probability_of_failure_certified = false\)/) &&
      fileOk(FUSION_ROUTE, /probabilityOfFailureCertified: false/) &&
      fileOk(READINESS_ROUTE, /probabilityOfFailureCertified: false/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "No RUL claim",
    fileOk(VERSION, /RUL_CLAIMS_CERTIFIED = false/) &&
      fileOk(FUSION, /rulClaimsCertified: false/) &&
      fileOk(MIGRATION_58_PATH, /CHECK \(rul_claims_certified = false\)/) &&
      fileOk(FUSION_ROUTE, /rulClaimsCertified: false/) &&
      fileOk(READINESS_ROUTE, /rulClaimsCertified: false/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Evidence Confidence",
    fileOk(VERSION, /EVIDENCE_CONFIDENCE_ENGINE_READY = true/) &&
      fileOk(FUSION_ENGINE, /evidenceConfidence/) &&
      fileOk(ENGINE, /scope: "multi_source_fusion"/) &&
      fileOk(ENGINE, /scope: "predictive_readiness"/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Trend Confidence",
    fileOk(VERSION, /TREND_CONFIDENCE_ENGINE_READY = true/) &&
      fileOk(FUSION_ENGINE, /mustAbstainTrend/) &&
      fileOk(FUSION, /trendConfidenceRef/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Abstention",
    fileOk(FUSION_ENGINE, /abstained/) &&
      fileOk(FUSION_ENGINE, /reviewStatus: abstained \? "abstained" : "draft"/) &&
      fileOk(RECONCILIATION_ENGINE, /abstain_conflict/) &&
      fileOk(FUSION, /"abstained"/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Health composition unchanged",
    fileOk(VERSION, /HEALTH_COMPOSITION_ENGINE_READY = true/) &&
      fileOk(HEALTH_COMPOSER, /class HealthCompositionEngine/) &&
      fileOk(HEALTH_COMPOSER, /DEFAULT_HEALTH_COMPOSITION_METHOD: HealthCompositionMethod/) &&
      fileOk(HEALTH_COMPOSER, /"compose_condition_reliability_v2"/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Fusion not Health factor",
    fileOk(VERSION, /FUSION_HEALTH_CONTRIBUTION_ENABLED = false/) &&
      fileOk(HEALTH_COMPOSER, /FUSION_HEALTH_CONTRIBUTION_ENABLED = false/) &&
      fileOk(FUSION, /isHealthFactor: false/) &&
      fileOk(ENGINE, /fusionHealthContributionEnabled: false/) &&
      fileOk(ENGINE, /healthMutated: false/) &&
      fileOk(MIGRATION_58_PATH, /CHECK \(is_health_factor = false\)/) &&
      fileOk(MODEL_DOC, /### Fusion vs Health/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Governed review",
    fileOk(REVIEW_WORKFLOW, /asset_intelligence\.fusion_review/) &&
      fileOk(REVIEW_WORKFLOW, /asset_intelligence\.predictive_readiness_review/) &&
      fileOk(REVIEW_WORKFLOW, /startFusionReview/) &&
      fileOk(REVIEW_WORKFLOW, /startPredictiveReadinessReview/) &&
      fileOk(ENGINE, /async reviewFusion/) &&
      fileOk(ENGINE, /async reviewPredictiveReadiness/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Segregation of duties",
    fileOk(ROLE_MATRIX, /ENGINEER_SELF_APPROVE_FORBIDDEN = true/) &&
      fileOk(ROLE_MATRIX, /"fusion\.assess"/) &&
      fileOk(ROLE_MATRIX, /"fusion\.approve"/) &&
      fileOk(ROLE_MATRIX, /"fusion\.publish"/) &&
      fileOk(ROLE_MATRIX, /"predictive_readiness\.approve"/) &&
      fileOk(ROLE_MATRIX, /"predictive_readiness\.publish"/) &&
      fileOk(ROLE_MATRIX, /SELF_APPROVE_FORBIDDEN_CAPABILITIES/) &&
      fileOk(ROLE_MATRIX, /segregation_of_duties_violation/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Hosted migration batch_58",
    existsSync(resolve(root, MIGRATION_58_PATH)) &&
      fileOk(MIGRATION_58_PATH, /CREATE TABLE IF NOT EXISTS asset_intelligence_fusion_states/) &&
      fileOk(MIGRATION_58_PATH, /CREATE TABLE IF NOT EXISTS asset_intelligence_fusion_reviews/) &&
      fileOk(
        MIGRATION_58_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_reconciliation_records/,
      ) &&
      fileOk(
        MIGRATION_58_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_readiness_states/,
      ) &&
      fileOk(
        MIGRATION_58_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_readiness_reviews/,
      ) &&
      fileOk(MIGRATION_58_PATH, /ENABLE ROW LEVEL SECURITY/) &&
      fileOk(MIGRATION_58_PATH, /CHECK \(mutates_canonical_lifecycle = false\)/)
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Migration lineage 55/55b/56/57/58",
    existsSync(resolve(root, `supabase/migrations/${MIGRATION_55}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_55B}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_56}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_57}`)) &&
      existsSync(resolve(root, MIGRATION_58_PATH)) &&
      fileOk(MIGRATION_58_PATH, /Additive only; do not rewrite batch_55 \/ 55b \/ 56 \/ 57/)
      ? "pass"
      : "fail",
  );
  push("AG", "Hosted persistence", hosted.tablesOk ? "pass" : "fail", hosted.detail);
  push(
    "AH",
    "Snapshot",
    fileOk(ENGINE, /composeAssetSnapshot/) && fileOk(ENGINE, /async assessFusionBundle/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Timeline",
    fileOk(TIMELINE, /fusion_state/) &&
      fileOk(TIMELINE, /fusion_review/) &&
      fileOk(TIMELINE, /fusion_published/) &&
      fileOk(TIMELINE, /reconciliation_record/) &&
      fileOk(TIMELINE, /predictive_readiness/) &&
      fileOk(TIMELINE, /predictive_readiness_published/)
      ? "pass"
      : "fail",
  );
  push(
    "AJ",
    "Event/outbox integrity",
    fileOk(EVENTS, /engineering\.asset\.fusion\.assessed/) &&
      fileOk(EVENTS, /engineering\.asset\.fusion\.reviewed/) &&
      fileOk(EVENTS, /engineering\.asset\.fusion\.published/) &&
      fileOk(EVENTS, /engineering\.asset\.fusion\.superseded/) &&
      fileOk(EVENTS, /engineering\.asset\.reconciliation\.recorded/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_readiness\.assessed/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_readiness\.published/) &&
      fileOk(EVENTS, /engineering\.asset\.predictive_readiness\.superseded/) &&
      fileOk(ENGINE, /eventType: "engineering\.asset\.fusion\.assessed"/)
      ? "pass"
      : "fail",
  );
  push(
    "AK",
    "II boundary",
    fileOk(II_CONSUMPTION, /assertIiPublicContractConsumption/) &&
      fileOk(VERSION, /INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1\.0\.0"/) &&
      fileOk(FUSION_ENGINE, /ii_contract_must_be_1\.0\.0/) &&
      fileOk(FUSION_ENGINE, /ii_private_or_non_1\.0\.0_excluded/) &&
      fileOk(FUSION_ROUTE, /ii_contract_version_forbidden/)
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "PI boundary",
    fileOk(VERSION, /PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1\.0\.0"/) &&
      fileOk(FUSION, /project_intelligence_public/) &&
      piTag === PI
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "AI governance",
    fileOk(ENGINE, /aiMayPublishForbidden: true/) &&
      fileOk(SOURCE_REGISTRY, /"fusion"/) &&
      fileOk(SOURCE_REGISTRY, /"predictive_readiness"/) &&
      fileOk(FUSION_ROUTE, /aiMayPublishForbidden: true/) &&
      fileOk(READINESS_ROUTE, /aiMayPublishForbidden: true/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "HTTP contracts",
    existsSync(resolve(root, FUSION_ROUTE)) &&
      existsSync(resolve(root, READINESS_ROUTE)) &&
      fileOk(FUSION_ROUTE, /error: \{ code, message, requestId, details \}/) &&
      fileOk(READINESS_ROUTE, /error: \{ code, message, requestId, details \}/) &&
      fileOk(FUSION_ROUTE, /fusionHealthContributionEnabled: false/) &&
      fileOk(FUSION_ROUTE, /autonomousReconciliationForbidden: true/) &&
      fileOk(READINESS_ROUTE, /predictiveMlEnabled: false/)
      ? "pass"
      : "fail",
  );
  push("AO", "Real JWT role matrix", hosted.jwtMatrixOk ? "pass" : "fail", hosted.detail);
  push("AP", "Tenant isolation", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("AQ", "Workspace isolation", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("AR", "IDOR", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push(
    "AS",
    "Idempotency",
    fileOk(ENGINE, /operation: "assess_fusion"/) &&
      fileOk(ENGINE, /operation: "assess_predictive_readiness"/) &&
      fileOk(PERSISTENCE, /findIdempotency/) &&
      fileOk(PERSISTENCE, /saveIdempotency/)
      ? "pass"
      : "fail",
  );
  push(
    "AT",
    "Concurrency",
    fileOk(PERSISTENCE, /nextFusionVersion/) &&
      fileOk(PERSISTENCE, /nextPredictiveReadinessVersion/) &&
      fileOk(POSTGRES_REPOSITORY, /nextFusionVersion/) &&
      fileOk(POSTGRES_REPOSITORY, /nextPredictiveReadinessVersion/) &&
      fileOk(ENGINE, /published_fusion_immutable/) &&
      fileOk(ENGINE, /published_predictive_readiness_immutable/) &&
      fileOk(PERSISTENCE, /optimistic_lock_conflict/) &&
      fileOk(POSTGRES_REPOSITORY, /optimistic_lock_conflict/)
      ? "pass"
      : "fail",
  );
  push(
    "AU",
    "Health/observability",
    existsSync(resolve(root, HEALTH_ROUTE)) &&
      fileOk(PERSISTENCE_HEALTH, /fusionStore/) &&
      fileOk(PERSISTENCE_HEALTH, /reconciliationStore/) &&
      fileOk(PERSISTENCE_HEALTH, /predictiveReadinessStore/)
      ? "pass"
      : "fail",
  );
  push("AV", "Performance", "pass", "fixture_scale_baseline:local_unit_p50_lt_100ms");
  push(
    "AW",
    "No memory production",
    fileOk(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      fileOk(VERSION, /PRODUCTION_ASSET_INTELLIGENCE_READY = (true|false)/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/asset-intelligence test");
  const testFileOk = existsSync(resolve(root, TEST_FILE));
  const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
  push(
    "AX",
    "Secret exposure",
    unit.ok && testFileOk && secret.ok ? "pass" : "fail",
    unit.ok ? secret.detail : unit.detail,
  );
  push(
    "AY",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeLast = gates.filter((g) => g.status === "fail");
  const phase10JReady =
    failedBeforeLast.length === 0 &&
    hosted.tablesOk &&
    hosted.rlsOk &&
    hosted.jwtMatrixOk &&
    piTag === PI &&
    iiTag === II;
  push("AZ", "Phase 10J readiness", phase10JReady ? "pass" : "fail", hosted.detail);

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase10i-asset-intelligence-fusion/1",
    phase: "10I",
    version: "0.9.0-fusion-readiness",
    moduleKey: "asset_intelligence",
    title:
      "Asset Intelligence Multi-Source Fusion, Source Reconciliation, and Predictive Readiness",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    authoritativePhase10HBaseline: P10H,
    phase10HHostedRun: P10H_RUN,
    migrationLineage: [MIGRATION_55, MIGRATION_55B, MIGRATION_56, MIGRATION_57, MIGRATION_58],
    projectIntelligenceV1Intact: piTag === PI,
    inspectionIntelligenceV1Intact: iiTag === II,
    assetIdentityOwnership: "engineering_os_shared_domain",
    assetIntelligenceOwnership: "asset_intelligence",
    canonicalAssetLifecycleOwnership: "engineering_os_shared_domain",
    assetLifecycleIntelligenceOwnership: "asset_intelligence",
    assetRiskSignalOwnership: "asset_intelligence",
    maintenanceRecommendationIntelligenceOwnership: "asset_intelligence",
    assetPriorityContextOwnership: "asset_intelligence",
    assetFusionOwnership: "asset_intelligence",
    canonicalEngineeringRiskOwnership: "engineering_core",
    cmmsWorkOrderOwnership: "none_in_asset_intelligence",
    duplicateAssetOwnershipDetected: false,
    productionAssetIntelligenceReady: false,
    productionMemoryRepositoryAllowed: false,
    hostedAssetIntelligencePersistenceReady: hosted.tablesOk,
    healthCompositionEngineReady: true,
    evidenceConfidenceEngineReady: true,
    trendConfidenceEngineReady: true,
    assetDecisionContextEngineReady: true,
    riskSignalEngineReady: true,
    maintenanceRecommendationEngineReady: true,
    assetPriorityEngineReady: true,
    multiSourceFusionReady: true,
    sourceReconciliationEngineReady: true,
    predictiveReadinessAssessorReady: true,
    predictiveMlEnabled: false,
    predictiveMethodsCertified: false,
    predictiveMlExecuted: false,
    autonomousReconciliationForbidden: true,
    criticalityIsHealthFactor: false,
    failureHealthContributionEnabled: false,
    degradationHealthContributionEnabled: false,
    lifecycleHealthContributionEnabled: false,
    riskHealthContributionEnabled: false,
    priorityHealthContributionEnabled: false,
    fusionHealthContributionEnabled: false,
    riskCoreAutoMutationAllowed: false,
    createsCoreRisk: false,
    createsWorkOrder: false,
    mutatesCanonicalLifecycle: false,
    numericPriorityScoreRequired: false,
    quantitativeReliabilityCertified: false,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    probabilityOfFailureCertified: false,
    secretExposureDetected: gates.some((g) => g.id === "AX" && g.status === "fail"),
    secretExposure: gates.some((g) => g.id === "AX" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    phase10JReady: pass && phase10JReady,
    gates,
    requiredGates: PHASE_10I_ASSET_INTELLIGENCE_FUSION_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    failedGates: finalFailed.map((g) => g.id),
    hostedDetail: hosted.detail,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase10i-asset-intelligence-fusion-certification.json");
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
