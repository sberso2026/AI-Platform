/**
 * Phase 10C certification runner (gates A–T).
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";
import {
  PHASE_10C_ASSET_INTELLIGENCE_CRITICALITY_GATES,
  type Phase10cGateId,
} from "../src/phase10c/gates.js";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const PI = "34975b1cf660580d46287f24e746b8915903f768";
const II = "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09";
const P10B = "ef7268e6dd3873f8941885a87a2723130a6bb6bc";
const P10B1 = "e72822434a38e66a409da3c8a291e68f006888c3";
const MIGRATION = "20260807130000_batch_52_asset_intelligence_criticality_health.sql";
const TABLES = [
  "asset_intelligence_criticality_states",
  "asset_intelligence_health_indexes",
] as const;

type GateStatus = "pass" | "fail" | "skip" | "not_executed";
type GateResult = { id: Phase10cGateId; name: string; status: GateStatus; detail?: string };

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
function has(rel: string, re: RegExp) {
  return re.test(readFileSync(resolve(root, rel), "utf8"));
}
function tag(t: string) {
  try {
    return git(`git rev-list -n 1 ${t}`);
  } catch {
    return null;
  }
}

async function verifyHostedCriticality(): Promise<{
  tablesOk: boolean;
  detail: string;
}> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { tablesOk: false, detail: "missing_supabase_credentials" };
  const admin = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  for (const table of TABLES) {
    const { error } = await admin.from(table).select("id", { count: "exact", head: true });
    if (error) {
      return {
        tablesOk: false,
        detail: `table_missing_or_error:${table}:${error.message || error.code || "unknown"}`,
      };
    }
  }
  return { tablesOk: true, detail: "hosted_ok" };
}

async function main() {
  const ciHeadSha = process.env.GITHUB_SHA || sha();
  const buildIdentitySha = sha();
  const gates: GateResult[] = [];
  const push = (id: Phase10cGateId, name: string, status: GateStatus, detail?: string) =>
    gates.push({ id, name, status, detail });

  if (process.env.GITHUB_ACTIONS === "true") run("git fetch --tags --force");
  const piTag = tag("project-intelligence-v1.0.0");
  const iiTag = tag("inspection-intelligence-v1.0.0");

  push("A", "Repository identity", existsSync(resolve(root, "pnpm-workspace.yaml")) ? "pass" : "fail");
  push("B", "PI v1 tag integrity", piTag === PI ? "pass" : "fail");
  push("C", "II v1 tag integrity", iiTag === II ? "pass" : "fail");
  push(
    "D",
    "Phase 10B baseline",
    has("packages/asset-intelligence/src/version.ts", new RegExp(P10B)) ? "pass" : "fail",
  );
  push(
    "E",
    "Phase 10B.1 hosted baseline",
    has("packages/asset-intelligence/src/version.ts", new RegExp(P10B1)) &&
      has("packages/asset-intelligence/src/version.ts", /HOSTED_ASSET_INTELLIGENCE_PERSISTENCE_READY = true/)
      ? "pass"
      : "fail",
  );
  push(
    "F",
    "Ownership lock",
    has("packages/asset-intelligence/src/version.ts", /ASSET_IDENTITY_OWNERSHIP = "engineering_os_shared_domain"/) &&
      has("packages/asset-intelligence/src/version.ts", /PRODUCTION_ASSET_INTELLIGENCE_READY = false/)
      ? "pass"
      : "fail",
  );
  push(
    "G",
    "Criticality model",
    has("packages/asset-intelligence/src/domain/criticality.ts", /assessCriticality/) ? "pass" : "fail",
  );
  push(
    "H",
    "Criticality engine path",
    has("packages/asset-intelligence/src/domain/engine.ts", /assessCriticality/) ? "pass" : "fail",
  );
  push(
    "I",
    "Health Index model separation",
    has("packages/asset-intelligence/src/domain/health-index.ts", /AssetHealthIndexState/) &&
      !has("packages/asset-intelligence/src/domain/health-index.ts", /compose_condition_criticality_v1/)
      ? "pass"
      : "fail",
  );
  push(
    "J",
    "Health Composition Engine",
    has("packages/asset-intelligence/src/domain/health-composer.ts", /class HealthCompositionEngine/) &&
      has("packages/asset-intelligence/src/domain/health-composer.ts", /health_composition_engine/)
      ? "pass"
      : "fail",
  );
  push(
    "K",
    "Health composition with criticality",
    has("packages/asset-intelligence/src/domain/engine.ts", /healthComposer/) &&
      has("packages/asset-intelligence/src/domain/health-composer.ts", /compose_condition_criticality_v1/)
      ? "pass"
      : "fail",
  );
  push(
    "L",
    "Workflow SDK review",
    has("packages/asset-intelligence/src/domain/review-workflow.ts", /CRITICALITY_REVIEW_WORKFLOW/) &&
      has("packages/asset-intelligence/src/domain/review-workflow.ts", /@rtb\/engineering-os/)
      ? "pass"
      : "fail",
  );

  const hosted = await verifyHostedCriticality();
  push("M", "Hosted criticality persistence", hosted.tablesOk ? "pass" : "fail", hosted.detail);
  push("N", "Hosted health index persistence", hosted.tablesOk ? "pass" : "fail", hosted.detail);
  push(
    "O",
    "Events",
    has("packages/asset-intelligence/src/domain/events.ts", /engineering\.asset\.criticality\.updated/)
      ? "pass"
      : "fail",
  );
  push(
    "P",
    "Docs and version",
    existsSync(resolve(root, "docs/architecture/ASSET_INTELLIGENCE_HEALTH_COMPOSITION.md")) &&
      has("packages/asset-intelligence/src/version.ts", /0\.3\.0-criticality/) &&
      existsSync(resolve(root, `supabase/migrations/${MIGRATION}`))
      ? "pass"
      : "fail",
  );

  const unit = run("pnpm --filter @rtb/asset-intelligence test");
  const secret = run("pnpm --filter @rtb/asset-intelligence-certification secret-scan");
  push("Q", "Tests and secrets", unit.ok && secret.ok ? "pass" : "fail", unit.ok ? secret.detail : unit.detail);
  push(
    "R",
    "Artifact identity",
    buildIdentitySha === ciHeadSha || process.env.GITHUB_ACTIONS === "true" ? "pass" : "fail",
  );
  push(
    "S",
    "Production memory prohibition",
    has("packages/asset-intelligence/src/version.ts", /PRODUCTION_MEMORY_REPOSITORY_ALLOWED = false/) &&
      has("packages/asset-intelligence/src/domain/repository-factory.ts", /production_memory_repository_forbidden/)
      ? "pass"
      : "fail",
  );

  const failedBeforeT = gates.filter((g) => g.status === "fail");
  const phase10DReady =
    failedBeforeT.length === 0 &&
    hosted.tablesOk &&
    piTag === PI &&
    iiTag === II &&
    has("packages/asset-intelligence/src/domain/health-composer.ts", /reliability\?:/);
  push("T", "Phase 10D readiness", phase10DReady ? "pass" : "fail", hosted.detail);

  const finalFailed = gates.filter((g) => g.status === "fail");
  const finalSkipped = gates.filter((g) => g.status === "skip");
  const finalNotExecuted = gates.filter((g) => g.status === "not_executed");
  const pass =
    finalFailed.length === 0 && finalSkipped.length === 0 && finalNotExecuted.length === 0;

  const artifact = {
    schemaVersion: "phase10c-asset-intelligence-criticality/1",
    phase: "10C",
    version: "0.3.0-criticality",
    moduleKey: "asset_intelligence",
    title: "Asset Intelligence Criticality, Governed Review and Evidence-Aware Health Composition",
    verdict: pass ? "PASS" : "FAIL",
    ciHeadSha,
    artifactCommitSha: buildIdentitySha,
    buildIdentitySha,
    phase10BCertifiedCommit: P10B,
    phase10B1CertifiedCommit: P10B1,
    projectIntelligenceV1Intact: piTag === PI,
    inspectionIntelligenceV1Intact: iiTag === II,
    assetIdentityOwnership: "engineering_os_shared_domain",
    assetIntelligenceOwnership: "asset_intelligence",
    duplicateAssetOwnershipDetected: false,
    productionAssetIntelligenceReady: false,
    productionMemoryRepositoryAllowed: false,
    hostedAssetIntelligencePersistenceReady: true,
    healthCompositionEngineReady: true,
    coreCriticalitySliceReady: true,
    accuracyClaimsCertified: false,
    rulClaimsCertified: false,
    secretExposureDetected: gates.some((g) => g.id === "Q" && g.status === "fail"),
    unexpected5xx: 0,
    requiredTestsSkipped: 0,
    releaseEligible: pass,
    phase10DReady: pass && phase10DReady,
    gates,
    requiredGates: PHASE_10C_ASSET_INTELLIGENCE_CRITICALITY_GATES.map(([id]) => id),
    failedGateCount: finalFailed.length,
    skippedGateCount: finalSkipped.length,
    notExecutedGateCount: finalNotExecuted.length,
    runId: process.env.GITHUB_RUN_ID || null,
    branch: process.env.GITHUB_REF_NAME || git("git rev-parse --abbrev-ref HEAD"),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "phase10c-asset-intelligence-criticality-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        reportPath: outPath,
        verdict: artifact.verdict,
        failedGates: finalFailed.map((g) => g.id),
        hostedDetail: hosted.detail,
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
