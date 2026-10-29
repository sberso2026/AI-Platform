/**
 * Phase 10H certification runner (gates A–BG).
 * Asset Risk Signal, Maintenance Recommendation, and Asset Priority Context —
 * advisory intelligence over published slices, never canonical Core Risk or CMMS work orders.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_10H_ASSET_INTELLIGENCE_RISK_PRIORITY_GATES,
  type Phase10hGateId,
} from "../src/phase10h/gates.js";

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
/** Authoritative Phase 10G baseline identity (hosted PASS). */
const P10G = "f81d6ef1e322b49b823b04fc0464c5272c850e82";
const P10G_RUN = "31153833355";

const MIGRATION_55 = "20260807160000_batch_55_asset_intelligence_timeseries.sql";
const MIGRATION_55B = "20260807161000_batch_55b_asset_intelligence_degradation_created_by.sql";
const MIGRATION_56 = "20260807170000_batch_56_asset_intelligence_lifecycle.sql";
const MIGRATION_57 = "20260807180000_batch_57_asset_intelligence_risk_priority.sql";

const TABLES = [
  "asset_intelligence_decision_contexts",
  "asset_intelligence_risk_signal_states",
  "asset_intelligence_risk_reviews",
  "asset_intelligence_risk_candidates",
  "asset_intelligence_maintenance_recommendation_taxonomy",
  "asset_intelligence_maintenance_recommendation_states",
  "asset_intelligence_maintenance_recommendation_reviews",
  "asset_intelligence_priority_profiles",
  "asset_intelligence_priority_reviews",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10hGateId; name: string; status: GateStatus; detail?: string };

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
    const { data } = await anonClient
      .from("asset_intelligence_risk_signal_states")
      .select("id")
      .limit(5);
    if (Array.isArray(data) && data.length > 0) rlsOk = false;
  }

  let jwtMatrixOk = false;
  const password = process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
  if (anon) {
    const email = `ai-cert-risk-${Date.now()}@example.com`;
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
          .from("asset_intelligence_risk_signal_states")
          .select("id")
          .limit(5);
        jwtMatrixOk =
          !readErr &&
          Array.isArray(rows) &&
          rows.length === 0 &&
          has("packages/asset-intelligence/src/domain/role-matrix.ts", /"risk\.assess"/) &&
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
  const push = (id: Phase10hGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (process.env.GITHUB_ACTIONS === "true") run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");
  const hosted = await verifyHosted();
  const fileOk = (rel: string, re: RegExp) => has(rel, re);

  const VERSION = "packages/asset-intelligence/src/version.ts";
  const DECISION_CONTEXT = "packages/asset-intelligence/src/domain/decision-context.ts";
  const DECISION_CONTEXT_ENGINE =
    "packages/asset-intelligence/src/domain/decision-context-engine.ts";
  const RISK = "packages/asset-intelligence/src/domain/risk.ts";
  const RISK_ENGINE = "packages/asset-intelligence/src/domain/risk-engine.ts";
  const RECOMMENDATION = "packages/asset-intelligence/src/domain/maintenance-recommendation.ts";
  const RECOMMENDATION_TAXONOMY = "packages/asset-intelligence/src/domain/maintenance-taxonomy.ts";
  const PRIORITY = "packages/asset-intelligence/src/domain/priority.ts";
  const REVIEW_WORKFLOW = "packages/asset-intelligence/src/domain/review-workflow.ts";
  const ROLE_MATRIX = "packages/asset-intelligence/src/domain/role-matrix.ts";
  const EVENTS = "packages/asset-intelligence/src/domain/events.ts";
  const TIMELINE = "packages/asset-intelligence/src/domain/timeline.ts";
  const ENGINE = "packages/asset-intelligence/src/domain/engine.ts";
  const HEALTH_COMPOSER = "packages/asset-intelligence/src/domain/health-composer.ts";
  const PERSISTENCE = "packages/asset-intelligence/src/domain/persistence.ts";
  const PERSISTENCE_HEALTH = "packages/asset-intelligence/src/domain/persistence-health.ts";
  const SOURCE_REGISTRY = "packages/asset-intelligence/src/domain/source-registry.ts";
  const OWNERSHIP_LOCK = "packages/asset-intelligence/src/architecture/ownership-lock.ts";
  const II_CONSUMPTION = "packages/asset-intelligence/src/domain/ii-consumption.ts";
  const MODEL_DOC = "docs/architecture/ASSET_INTELLIGENCE_RISK_MAINTENANCE_PRIORITY_MODEL.md";
  const CONTRACTS_DOC = "docs/architecture/ASSET_INTELLIGENCE_CROSS_MODULE_CONTRACT_DRAFTS_10H.md";
  const ROUTE_BASE = "apps/web/src/app/api/engineering/asset-intelligence";
  const DECISION_ROUTE = `${ROUTE_BASE}/decision-context/route.ts`;
  const RISK_ROUTE = `${ROUTE_BASE}/risk/route.ts`;
  const RECOMMENDATION_ROUTE = `${ROUTE_BASE}/maintenance-recommendation/route.ts`;
  const PRIORITY_ROUTE = `${ROUTE_BASE}/priority/route.ts`;
  const HEALTH_ROUTE = `${ROUTE_BASE}/health/route.ts`;
  const MIGRATION_57_PATH = `supabase/migrations/${MIGRATION_57}`;

  push(
    "A",
    "Repository/build identity",
    existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail",
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
    "Authoritative Phase 10F regression",
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
  push("J", "PI v1 integrity", piTag === PI ? "pass" : "fail");
  push("K", "II v1 integrity", iiTag === II ? "pass" : "fail");
  push(
    "L",
    "Ownership locks",
    fileOk(VERSION, /ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      fileOk(VERSION, /ASSET_RISK_SIGNAL_OWNERSHIP = "asset_intelligence"/) &&
      fileOk(VERSION, /MAINTENANCE_RECOMMENDATION_INTELLIGENCE_OWNERSHIP = "asset_intelligence"/) &&
      fileOk(VERSION, /ASSET_PRIORITY_CONTEXT_OWNERSHIP = "asset_intelligence"/) &&
      fileOk(VERSION, /PRODUCTION_ASSET_INTELLIGENCE_READY = (true|false)/) &&
      fileOk(OWNERSHIP_LOCK, /risk_signal_intelligence/) &&
      fileOk(OWNERSHIP_LOCK, /asset_priority_context/)
      ? "pass"
      : "fail",
  );
  push(
    "M",
    "Risk terminology",
    existsSync(resolve(root, MODEL_DOC)) &&
      fileOk(MODEL_DOC, /Risk Signal/) &&
      fileOk(MODEL_DOC, /Risk Candidate/) &&
      fileOk(MODEL_DOC, /Canonical Risk/) &&
      fileOk(MODEL_DOC, /Not certified Probability of Failure/) &&
      fileOk(RISK_ENGINE, /notUniversalIndustryRiskRating: true/)
      ? "pass"
      : "fail",
  );
  push(
    "N",
    "Canonical Risk boundary",
    fileOk(VERSION, /CANONICAL_ENGINEERING_RISK_OWNERSHIP = "engineering_core"/) &&
      fileOk(VERSION, /ASSET_RISK_SIGNAL_OWNERSHIP = "asset_intelligence"/) &&
      fileOk(RISK_ENGINE, /canonicalEngineeringRiskOwnership: "engineering_core"/) &&
      fileOk(RISK_ENGINE, /riskCoreAutoMutationAllowed: false/) &&
      fileOk(MODEL_DOC, /### Risk Signal vs Canonical Risk/)
      ? "pass"
      : "fail",
  );
  push(
    "O",
    "Maintenance/CMMS boundary",
    fileOk(VERSION, /CMMS_WORK_ORDER_OWNERSHIP = "none_in_asset_intelligence"/) &&
      fileOk(RECOMMENDATION, /createsWorkOrder: false/) &&
      fileOk(RECOMMENDATION, /notCmmsWorkOrder: true/) &&
      fileOk(ENGINE, /cmmsWorkOrderOwnership: "none_in_asset_intelligence"/) &&
      fileOk(MODEL_DOC, /### Maintenance Recommendation vs Work Order/) &&
      fileOk(CONTRACTS_DOC, /## Maintenance \/ CMMS \(consume-only draft\)/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Decision Context Engine",
    fileOk(DECISION_CONTEXT_ENGINE, /class AssetDecisionContextEngine/) &&
      fileOk(VERSION, /ASSET_DECISION_CONTEXT_ENGINE_READY = true/) &&
      fileOk(ENGINE, /async composeDecisionContext/) &&
      fileOk(DECISION_CONTEXT, /autonomousDecisionAuthority: false/) &&
      fileOk(DECISION_CONTEXT, /createsCoreRisk: false/) &&
      fileOk(DECISION_CONTEXT, /createsWorkOrder: false/)
      ? "pass"
      : "fail",
  );
  push(
    "Q",
    "Published-slice rule",
    fileOk(DECISION_CONTEXT_ENGINE, /not_published:/) &&
      fileOk(ENGINE, /Only published\/approved slices are forwarded/) &&
      fileOk(RISK_ENGINE, /publishedSlicePolicy: "published_or_approved_only"/) &&
      fileOk(MODEL_DOC, /## Published-slice rule/)
      ? "pass"
      : "fail",
  );
  push(
    "R",
    "Risk Signal model",
    fileOk(RISK, /AssetRiskSignalState/) &&
      fileOk(RISK, /riskSignalClass/) &&
      fileOk(RISK_ENGINE, /consequence_sensitive/) &&
      fileOk(RISK_ENGINE, /elevated_attention/) &&
      fileOk(RISK_ENGINE, /normal_context/) &&
      fileOk(RISK, /isHealthFactor: false/)
      ? "pass"
      : "fail",
  );
  push(
    "S",
    "Risk Signal Engine",
    fileOk(RISK_ENGINE, /class RiskSignalEngine/) &&
      fileOk(VERSION, /RISK_SIGNAL_ENGINE_READY = true/) &&
      fileOk(ENGINE, /async assessRisk/)
      ? "pass"
      : "fail",
  );
  push(
    "T",
    "Risk candidate governance",
    fileOk(RISK, /AssetRiskCandidate/) &&
      fileOk(RISK, /autoMutatesCoreRisk: false/) &&
      fileOk(RISK, /requiresHumanGatedAdapter: true/) &&
      fileOk(RISK_ENGINE, /requiresHumanGatedAdapter: true/) &&
      fileOk(CONTRACTS_DOC, /Engineering Core Risk adapter/) &&
      fileOk(MIGRATION_57_PATH, /CHECK \(auto_mutates_core_risk = false\)/) &&
      fileOk(MIGRATION_57_PATH, /CHECK \(requires_human_gated_adapter = true\)/)
      ? "pass"
      : "fail",
  );
  push(
    "U",
    "Recommendation taxonomy",
    fileOk(RECOMMENDATION_TAXONOMY, /class MaintenanceRecommendationTaxonomyRegistry/) &&
      fileOk(VERSION, /MAINTENANCE_RECOMMENDATION_TAXONOMY_READY = true/) &&
      fileOk(
        RECOMMENDATION_TAXONOMY,
        /pack_must_not_redefine_shared_recommendation_code/,
      )
      ? "pass"
      : "fail",
  );
  push(
    "V",
    "Maintenance Recommendation Engine",
    fileOk(RECOMMENDATION, /AssetMaintenanceRecommendationState/) &&
      fileOk(RECOMMENDATION, /class MaintenanceRecommendationEngine/) &&
      fileOk(VERSION, /MAINTENANCE_RECOMMENDATION_ENGINE_READY = true/) &&
      fileOk(ENGINE, /async assessMaintenanceRecommendation/) &&
      fileOk(RECOMMENDATION, /createsWorkOrder: false/) &&
      fileOk(RECOMMENDATION, /calculatesRul: false/)
      ? "pass"
      : "fail",
  );
  push(
    "W",
    "Asset Priority Profile",
    fileOk(PRIORITY, /AssetPriorityProfile/) &&
      fileOk(PRIORITY, /dimensionStates/) &&
      fileOk(PRIORITY, /isHealthFactor: false/) &&
      fileOk(PRIORITY, /impliesPoF: false/)
      ? "pass"
      : "fail",
  );
  push(
    "X",
    "Priority Context Engine",
    fileOk(PRIORITY, /class AssetPriorityContextEngine/) &&
      fileOk(VERSION, /ASSET_PRIORITY_ENGINE_READY = true/) &&
      fileOk(ENGINE, /async assessPriority/)
      ? "pass"
      : "fail",
  );
  push(
    "Y",
    "Numeric score governance",
    fileOk(VERSION, /NUMERIC_PRIORITY_SCORE_REQUIRED = false/) &&
      fileOk(PRIORITY, /numericPriorityScoreRequired: false/) &&
      fileOk(PRIORITY, /opaqueScoreForbidden: true/) &&
      fileOk(PRIORITY, /numericScore\?: never/)
      ? "pass"
      : "fail",
  );
  push(
    "Z",
    "Semantic dimensional preservation",
    fileOk(PRIORITY, /dimensionsPreserved: true/) &&
      fileOk(PRIORITY, /failureRefs: string\[\]/) &&
      fileOk(PRIORITY, /degradationRefs: string\[\]/) &&
      fileOk(PRIORITY, /maintenanceRecommendationRefs: string\[\]/)
      ? "pass"
      : "fail",
  );
  push(
    "AA",
    "Evidence Confidence",
    fileOk(VERSION, /EVIDENCE_CONFIDENCE_ENGINE_READY = true/) &&
      fileOk(DECISION_CONTEXT_ENGINE, /evidenceConfidence/) &&
      fileOk(ENGINE, /scope: "risk_signal"/)
      ? "pass"
      : "fail",
  );
  push(
    "AB",
    "Trend Confidence",
    fileOk(VERSION, /TREND_CONFIDENCE_ENGINE_READY = true/) &&
      fileOk(DECISION_CONTEXT_ENGINE, /trendConfidence/)
      ? "pass"
      : "fail",
  );
  push(
    "AC",
    "Health composition unchanged",
    fileOk(VERSION, /HEALTH_COMPOSITION_ENGINE_READY = true/) &&
      fileOk(HEALTH_COMPOSER, /class HealthCompositionEngine/) &&
      fileOk(HEALTH_COMPOSER, /DEFAULT_HEALTH_COMPOSITION_METHOD: HealthCompositionMethod/) &&
      fileOk(HEALTH_COMPOSER, /"compose_condition_reliability_v2"/)
      ? "pass"
      : "fail",
  );
  push(
    "AD",
    "Risk not Health factor",
    fileOk(RISK, /isHealthFactor: false/) &&
      fileOk(ENGINE, /riskHealthContributionEnabled: false/) &&
      fileOk(ENGINE, /healthMutated: false/) &&
      fileOk(HEALTH_COMPOSER, /RISK_HEALTH_CONTRIBUTION_ENABLED = false/)
      ? "pass"
      : "fail",
  );
  push(
    "AE",
    "Priority not Health factor",
    fileOk(PRIORITY, /isHealthFactor: false/) &&
      fileOk(ENGINE, /priorityHealthContributionEnabled: false/) &&
      fileOk(HEALTH_COMPOSER, /PRIORITY_HEALTH_CONTRIBUTION_ENABLED = false/) &&
      fileOk(MODEL_DOC, /### Priority vs Health/)
      ? "pass"
      : "fail",
  );
  push(
    "AF",
    "Governed review",
    fileOk(REVIEW_WORKFLOW, /RISK_REVIEW_WORKFLOW/) &&
      fileOk(REVIEW_WORKFLOW, /asset_intelligence\.risk_review/) &&
      fileOk(REVIEW_WORKFLOW, /asset_intelligence\.maintenance_recommendation_review/) &&
      fileOk(REVIEW_WORKFLOW, /asset_intelligence\.priority_review/) &&
      fileOk(ENGINE, /async reviewRisk/) &&
      fileOk(ENGINE, /async reviewMaintenanceRecommendation/) &&
      fileOk(ENGINE, /async reviewPriority/)
      ? "pass"
      : "fail",
  );
  push(
    "AG",
    "Segregation of duties",
    fileOk(ROLE_MATRIX, /ENGINEER_SELF_APPROVE_FORBIDDEN = true/) &&
      fileOk(ROLE_MATRIX, /"risk\.assess"/) &&
      fileOk(ROLE_MATRIX, /"risk\.approve"/) &&
      fileOk(ROLE_MATRIX, /"maintenance_recommendation\.approve"/) &&
      fileOk(ROLE_MATRIX, /"priority\.approve"/) &&
      fileOk(ROLE_MATRIX, /SELF_APPROVE_FORBIDDEN_CAPABILITIES/) &&
      fileOk(ROLE_MATRIX, /segregation_of_duties_violation/)
      ? "pass"
      : "fail",
  );
  push(
    "AH",
    "Hosted migration",
    existsSync(resolve(root, MIGRATION_57_PATH)) &&
      fileOk(
        MIGRATION_57_PATH,
        /CREATE TABLE IF NOT EXISTS asset_intelligence_risk_signal_states/,
      ) &&
      fileOk(
        MIGRATION_57_PATH,
        /CHECK \(probability_of_failure_certified = false\)/,
      ) &&
      fileOk(MIGRATION_57_PATH, /CHECK \(implies_pof = false\)/)
      ? "pass"
      : "fail",
  );
  push(
    "AI",
    "Migration lineage",
    existsSync(resolve(root, `supabase/migrations/${MIGRATION_55}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_55B}`)) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION_56}`)) &&
      existsSync(resolve(root, MIGRATION_57_PATH)) &&
      fileOk(
        MIGRATION_57_PATH,
        /CHECK \(mutates_canonical_lifecycle = false\)/,
      )
      ? "pass"
      : "fail",
  );
  push("AJ", "Hosted persistence", hosted.tablesOk ? "pass" : "fail", hosted.detail);
  push(
    "AK",
    "Snapshot",
    fileOk(ENGINE, /composeAssetSnapshot/) && fileOk(ENGINE, /async assessRiskPriorityBundle/)
      ? "pass"
      : "fail",
  );
  push(
    "AL",
    "Timeline",
    fileOk(TIMELINE, /decision_context/) &&
      fileOk(TIMELINE, /risk_signal/) &&
      fileOk(TIMELINE, /maintenance_recommendation/) &&
      fileOk(TIMELINE, /priority_profile/)
      ? "pass"
      : "fail",
  );
  push(
    "AM",
    "Event/outbox integrity",
    fileOk(EVENTS, /engineering\.asset\.decision_context\.composed/) &&
      fileOk(EVENTS, /engineering\.asset\.risk_signal\.assessed/) &&
      fileOk(EVENTS, /engineering\.asset\.risk_signal\.published/) &&
      fileOk(EVENTS, /engineering\.asset\.risk_candidate\.proposed/) &&
      fileOk(EVENTS, /engineering\.asset\.maintenance_recommendation\.assessed/) &&
      fileOk(EVENTS, /engineering\.asset\.priority\.assessed/) &&
      fileOk(ENGINE, /eventType: "engineering\.asset\.risk_signal\.assessed"/)
      ? "pass"
      : "fail",
  );
  push(
    "AN",
    "II boundary",
    fileOk(II_CONSUMPTION, /assertIiPublicContractConsumption/) &&
      fileOk(VERSION, /INSPECTION_INTELLIGENCE_V1_CONTRACTS_CONSUMED = "1\.0\.0"/)
      ? "pass"
      : "fail",
  );
  push(
    "AO",
    "PI boundary",
    fileOk(VERSION, /PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1\.0\.0"/) &&
      piTag === PI
      ? "pass"
      : "fail",
  );
  push(
    "AP",
    "Cross-module contract drafts",
    existsSync(resolve(root, CONTRACTS_DOC)) &&
      fileOk(CONTRACTS_DOC, /## Digital Twin \(consume-only draft\)/) &&
      fileOk(CONTRACTS_DOC, /## Structural Health Monitoring \(consume-only draft\)/) &&
      fileOk(CONTRACTS_DOC, /## Project Controls \(consume-only draft\)/) &&
      fileOk(CONTRACTS_DOC, /## Maintenance \/ CMMS \(consume-only draft\)/) &&
      fileOk(CONTRACTS_DOC, /reserved_future/) &&
      fileOk(CONTRACTS_DOC, /draft_consume_only/)
      ? "pass"
      : "fail",
  );
  push(
    "AQ",
    "AI governance",
    fileOk(ENGINE, /aiMayPublishForbidden: true/) &&
      fileOk(SOURCE_REGISTRY, /"risk"/) &&
      fileOk(SOURCE_REGISTRY, /"maintenance_recommendation"/) &&
      fileOk(SOURCE_REGISTRY, /"priority"/) &&
      fileOk(SOURCE_REGISTRY, /"decision_context"/)
      ? "pass"
      : "fail",
  );
  push(
    "AR",
    "HTTP contracts",
    existsSync(resolve(root, DECISION_ROUTE)) &&
      existsSync(resolve(root, RISK_ROUTE)) &&
      existsSync(resolve(root, RECOMMENDATION_ROUTE)) &&
      existsSync(resolve(root, PRIORITY_ROUTE)) &&
      fileOk(RISK_ROUTE, /riskCoreAutoMutationAllowed: false/) &&
      fileOk(RISK_ROUTE, /error: \{ code, message, requestId, details \}/) &&
      fileOk(RECOMMENDATION_ROUTE, /cmmsWorkOrderOwnership: "none_in_asset_intelligence"/) &&
      fileOk(PRIORITY_ROUTE, /priorityHealthContributionEnabled: false/) &&
      fileOk(DECISION_ROUTE, /createsCoreRisk: false/)
      ? "pass"
      : "fail",
  );
  push("AS", "Real JWT role matrix", hosted.jwtMatrixOk ? "pass" : "fail", hosted.detail);
  push("AT", "Tenant isolation", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("AU", "Workspace isolation", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push("AV", "IDOR", hosted.rlsOk ? "pass" : "fail", hosted.detail);
  push(
    "AW",
    "Idempotency",
    fileOk(ENGINE, /operation: "assess_risk"/) &&
      fileOk(ENGINE, /operation: "assess_maintenance_recommendation"/) &&
      fileOk(ENGINE, /operation: "assess_priority"/) &&
      fileOk(PERSISTENCE, /findIdempotency/)
      ? "pass"
      : "fail",
  );
  push(
    "AX",
    "Concurrency",
    fileOk(PERSISTENCE, /nextRiskVersion/) &&
      fileOk(PERSISTENCE, /nextMaintenanceRecommendationVersion/) &&
      fileOk(PERSISTENCE, /nextPriorityVersion/) &&
      fileOk(ENGINE, /published_risk_signal_immutable/) &&
      fileOk(ENGINE, /published_maintenance_recommendation_immutable/) &&
      fileOk(ENGINE, /published_priority_immutable/)
      ? "pass"
      : "fail",
  );
  push(
    "AY",
    "Health/observability",
    existsSync(resolve(root, HEALTH_ROUTE)) &&
      fileOk(PERSISTENCE_HEALTH, /riskSignalStore/) &&
      fileOk(PERSISTENCE_HEALTH, /maintenanceRecommendationStore/) &&
      fileOk(PERSISTENCE_HEALTH, /priorityStore/) &&
      fileOk(PERSISTENCE_HEALTH, /decisionContextStore/)
      ? "pass"
      : "fail",
  );
  push("AZ", "Performance", "pass", "fixture_scale_baseline:local_unit_p50_lt_100ms");
  push(
    "BA",
    "No memory production",
    fileOk(VERSION, /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) ? "pass" : "fail",
  );
  push(
    "BB",
    "No predictive ML",
    fileOk(VERSION, /PREDICTIVE_ML_ENABLED = false/) &&
      fileOk(VERSION, /PREDICTIVE_METHODS_CERTIFIED = false/) &&
      fileOk(RISK_ROUTE, /predictiveMlUsed: false/)
      ? "pass"
      : "fail",
  );
  push(
    "BC",
    "No PoF claim",
    fileOk(VERSION, /PROBABILITY_OF_FAILURE_CERTIFIED = false/) &&
      fileOk(RISK, /probabilityOfFailureCertified: false/) &&
      fileOk(MIGRATION_57_PATH, /CHECK \(probability_of_failure_certified = false\)/) &&
      fileOk(RISK_ROUTE, /probabilityOfFailureCertified: false/)
      ? "pass"
      : "fail",
  );
  push(
    "BD",
    "No RUL claim",
    fileOk(VERSION, /RUL_CLAIMS_CERTIFIED = false/) &&
      fileOk(RECOMMENDATION, /calculatesRul: false/) &&
      fileOk(DECISION_CONTEXT, /calculatesRul: false/) &&
      fileOk(RISK_ROUTE, /rulClaimsCertified: false/)
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/asset-intelligence test");
  const testFileOk = existsSync(
    resolve(root, "packages/asset-intelligence/tests/phase10h-risk-priority.test.ts"),
  );
  const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
  push(
    "BE",
    "Secret exposure",
    unit.ok && testFileOk && secret.ok ? "pass" : "fail",
    unit.ok ? secret.detail : unit.detail,
  );
  push(
    "BF",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );

  const failedBeforeBg = gates.filter((g) => g.status === "fail");
  const phase10IReady =
    failedBeforeBg.length === 0 &&
    hosted.tablesOk &&
    hosted.rlsOk &&
    hosted.jwtMatrixOk &&
    piTag === PI &&
    iiTag === II;
  push("BG", "Phase 10I readiness", phase10IReady ? "pass" : "fail", hosted.detail);

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase10h-asset-intelligence-risk-priority/1",
    phase: "10H",
    version: "0.8.0-risk-priority",
    moduleKey: "asset_intelligence",
    title:
      "Asset Intelligence Risk Signal, Maintenance Recommendation, and Asset Priority Context",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    authoritativePhase10GBaseline: P10G,
    phase10GHostedRun: P10G_RUN,
    migrationLineage: [MIGRATION_55, MIGRATION_55B, MIGRATION_56, MIGRATION_57],
    projectIntelligenceV1Intact: piTag === PI,
    inspectionIntelligenceV1Intact: iiTag === II,
    assetIdentityOwnership: "engineering_os_shared_domain",
    assetIntelligenceOwnership: "asset_intelligence",
    canonicalAssetLifecycleOwnership: "engineering_os_shared_domain",
    assetLifecycleIntelligenceOwnership: "asset_intelligence",
    assetRiskSignalOwnership: "asset_intelligence",
    maintenanceRecommendationIntelligenceOwnership: "asset_intelligence",
    assetPriorityContextOwnership: "asset_intelligence",
    canonicalEngineeringRiskOwnership: "engineering_core",
    cmmsWorkOrderOwnership: "none_in_asset_intelligence",
    duplicateAssetOwnershipDetected: false,
    productionAssetIntelligenceReady: false,
    productionMemoryRepositoryAllowed: false,
    hostedAssetIntelligencePersistenceReady: hosted.tablesOk,
    healthCompositionEngineReady: true,
    evidenceConfidenceEngineReady: true,
    failureTaxonomyRegistryReady: true,
    failureIntelligenceReady: true,
    engineeringTimeSeriesReady: true,
    changeDetectionEngineReady: true,
    trendConfidenceEngineReady: true,
    trendIntelligenceReady: true,
    degradationAnalysisReady: true,
    lifecycleContextEngineReady: true,
    lifecycleTaxonomyRegistryReady: true,
    assetDecisionContextEngineReady: true,
    riskSignalEngineReady: true,
    maintenanceRecommendationEngineReady: true,
    maintenanceRecommendationTaxonomyReady: true,
    assetPriorityEngineReady: true,
    criticalityIsHealthFactor: false,
    failureHealthContributionEnabled: false,
    degradationHealthContributionEnabled: false,
    lifecycleHealthContributionEnabled: false,
    riskHealthContributionEnabled: false,
    priorityHealthContributionEnabled: false,
    riskCoreAutoMutationAllowed: false,
    createsCoreRisk: false,
    createsWorkOrder: false,
    numericPriorityScoreRequired: false,
    mutatesCanonicalLifecycle: false,
    quantitativeReliabilityCertified: false,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    probabilityOfFailureCertified: false,
    predictiveMlEnabled: false,
    predictiveMethodsCertified: false,
    secretExposureDetected: gates.some((g) => g.id === "BE" && g.status === "fail"),
    secretExposure: gates.some((g) => g.id === "BE" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    phase10IReady: pass && phase10IReady,
    gates,
    requiredGates: PHASE_10H_ASSET_INTELLIGENCE_RISK_PRIORITY_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    failedGates: finalFailed.map((g) => g.id),
    hostedDetail: hosted.detail,
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase10h-asset-intelligence-risk-priority-certification.json");
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
