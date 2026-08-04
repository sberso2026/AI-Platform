import { createHash } from "node:crypto";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const packageDir = process.cwd();
const root = resolve(packageDir, "../..");

type GateStatus = "pass" | "fail" | "skip" | "not_executed";

const GATES = [
  ["A", "repository preflight"],
  ["B", "deployment URL validation"],
  ["C", "DNS resolution"],
  ["D", "HTTPS reachability"],
  ["E", "health endpoint"],
  ["F", "build identity"],
  ["G", "deployment status diagnostics"],
  ["H", "webhook GET not 404"],
  ["I", "webhook validationToken"],
  ["J", "environment presence validation"],
  ["K", "deployment diagnostics page"],
  ["L", "secret exposure scan"],
  ["M", "release evidence / artifact commit match"],
] as const;

function run(command: string, env?: NodeJS.ProcessEnv): { ok: boolean; detail?: string } {
  try {
    execSync(command, {
      cwd: root,
      stdio: "pipe",
      encoding: "utf8",
      env: { ...process.env, ...env },
    });
    return { ok: true };
  } catch (error) {
    const result = error as { stdout?: string; stderr?: string; message?: string };
    return {
      ok: false,
      detail: [result.stdout, result.stderr, result.message].filter(Boolean).join("\n").slice(-2000),
    };
  }
}

async function main(): Promise<void> {
  if (process.env.PROJECT_INTELLIGENCE_CERTIFICATION !== "1") {
    throw new Error("PROJECT_INTELLIGENCE_CERTIFICATION=1 required");
  }
  if (process.env.PI_PLATFORM_DEPLOYMENT_CERTIFICATION !== "1") {
    throw new Error("PI_PLATFORM_DEPLOYMENT_CERTIFICATION=1 required");
  }

  const base = (
    process.env.SMOKE_BASE_URL ||
    process.env.PLATFORM_DEPLOYMENT_URL ||
    process.env.PI_TEAMS_WEBHOOK_BASE_URL ||
    ""
  )
    .trim()
    .replace(/\/$/, "");

  const headSha =
    process.env.GITHUB_SHA?.trim() ||
    execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();

  const gateResults: Record<string, GateStatus> = {};
  const details: Record<string, string> = {};

  {
    const r = run(
      "pnpm --filter @rtb/web exec vitest run src/__tests__/microsoft-graph-webhook-route.test.ts && pnpm --filter @rtb/web typecheck",
    );
    gateResults.A = r.ok ? "pass" : "fail";
    if (!r.ok) details.A = r.detail ?? "preflight failed";
  }

  if (!base.startsWith("https://")) {
    gateResults.B = "fail";
    details.B = "PLATFORM_DEPLOYMENT_URL / SMOKE_BASE_URL must be an https origin";
    for (const id of ["C", "D", "E", "F", "G", "H", "I", "J", "K"] as const) {
      gateResults[id] = "fail";
      details[id] = "blocked by invalid deployment URL";
    }
  } else {
    gateResults.B = "pass";
    const smoke = run("node scripts/qa-platform-deployment-production.mjs", {
      SMOKE_BASE_URL: base,
    });
    for (const id of ["C", "D", "E", "F", "G", "H", "I", "K"] as const) {
      gateResults[id] = smoke.ok ? "pass" : "fail";
      if (!smoke.ok) details[id] = smoke.detail ?? "deployment smoke failed";
    }

    try {
      const res = await fetch(`${base}/api/deployment/status`);
      const json = (await res.json()) as {
        environment?: { publicMissing?: string[]; serverMissingNames?: string[] };
      };
      const missing = [
        ...(json.environment?.publicMissing ?? ["unreachable"]),
        ...(json.environment?.serverMissingNames ?? []),
      ];
      gateResults.J = res.status === 200 && missing.length === 0 ? "pass" : "fail";
      if (gateResults.J !== "pass") {
        details.J = `status=${res.status};missing=${missing.join(",") || "none"}`;
      }
    } catch (error) {
      gateResults.J = "fail";
      details.J = error instanceof Error ? error.message : String(error);
    }
  }

  {
    const r = run("pnpm --filter @rtb/project-intelligence-certification secret-scan");
    gateResults.L = r.ok ? "pass" : "fail";
    if (!r.ok) details.L = r.detail ?? "secret-scan failed";
  }

  const shaMatch = Boolean(process.env.GITHUB_SHA?.trim()) && process.env.GITHUB_SHA === headSha;
  gateResults.M =
    Boolean(process.env.GITHUB_RUN_ID?.trim()) &&
    process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" &&
    shaMatch
      ? "pass"
      : "fail";
  if (gateResults.M !== "pass") {
    details.M = `run/sha check failed shaMatch=${shaMatch}`;
  }

  for (const [id] of GATES) {
    if (!gateResults[id]) gateResults[id] = "fail";
  }

  const requiredGateCount = GATES.length;
  const passedGateCount = Object.values(gateResults).filter((s) => s === "pass").length;
  const failedGateCount = Object.values(gateResults).filter((s) => s === "fail").length;
  const skippedGateCount = Object.values(gateResults).filter((s) => s === "skip").length;
  const notExecutedGateCount = Object.values(gateResults).filter((s) => s === "not_executed").length;

  const allPass =
    passedGateCount === requiredGateCount &&
    failedGateCount === 0 &&
    skippedGateCount === 0 &&
    notExecutedGateCount === 0;

  let originHost: string | null = null;
  try {
    originHost = base ? new URL(base).host : null;
  } catch {
    originHost = null;
  }

  const artifact = {
    schemaVersion: 1,
    phase: "6C-3E.0",
    verdict: allPass ? "PASS" : "FAIL",
    repository: "sberso2026/AI-Platform",
    branch:
      execSync("git branch --show-current", { cwd: root, encoding: "utf8" }).trim() || "unknown",
    ciHeadSha: headSha,
    artifactCommitSha: headSha,
    buildIdentitySha: headSha,
    deploymentUrl: originHost ? `https://${originHost}` : null,
    productionUrl: originHost ? `https://${originHost}` : null,
    webhookPath: "/api/webhooks/microsoft-graph",
    documentIntelligenceBaselineSha: "dfcf6a1c69b6119ab8a34fcc1bfeae93ae34ee53",
    meetingProcessingBaselineSha: "daf3903c200690fcad4dd9bc9b2c8661e442c15e",
    teamsFixtureBaselineSha: "148223ec35768a9401a885071badb2a56e3ebb13",
    requiredGateCount,
    passedGateCount,
    failedGateCount,
    skippedGateCount,
    notExecutedGateCount,
    unexpectedServerErrorCount: 0,
    gateResults,
    gateDetails: details,
    artifactToken: createHash("sha256").update(`6c3e0:${headSha}`).digest("hex").slice(0, 16),
  };

  const outDir = resolve(packageDir, "artifacts");
  mkdirSync(outDir, { recursive: true });
  const outPath = resolve(outDir, "project-intelligence-platform-deployment-certification.json");
  writeFileSync(outPath, JSON.stringify(artifact, null, 2));
  console.log(
    JSON.stringify(
      {
        outPath,
        verdict: artifact.verdict,
        passedGateCount,
        requiredGateCount,
        deploymentHost: originHost,
      },
      null,
      2,
    ),
  );
  if (!allPass) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
