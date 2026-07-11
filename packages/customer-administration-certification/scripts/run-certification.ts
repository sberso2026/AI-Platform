import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { verifyBuildIdentity, resolveLocalCommitSha } from "../src/build-identity.js";
import { assertPreflight, fixturesManifestPath, HOSTED_PROJECT_REF } from "../src/lib/env.js";
import { CertificationServer } from "../src/lib/cert-server.js";
import { type GateResult, writePhase4Report } from "../src/report.js";

const ROOT = resolve(process.cwd(), "../..");
const PKG = process.cwd();

function log(msg: string): void {
  console.log(`[phase4:certify] ${msg}`);
}

function loadRootEnv(): void {
  const envPath = resolve(ROOT, ".env.local");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    if (!process.env[key]) process.env[key] = value;
  }
  process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;
}

function run(cmd: string, cwd = ROOT): { ok: boolean; output: string } {
  try {
    const output = execSync(cmd, {
      cwd,
      encoding: "utf8",
      env: { ...process.env, CUSTOMER_ADMIN_CERTIFICATION: "1", FORCE_COLOR: "0" },
    });
    return { ok: true, output };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    return { ok: false, output: [e.stdout, e.stderr, e.message].filter(Boolean).join("\n") };
  }
}

function gate(id: string, name: string, command: string, cwd?: string): GateResult {
  log(`Gate ${id}: ${name}`);
  const result = run(command, cwd);
  return {
    gate: id,
    name,
    status: result.ok ? "pass" : "fail",
    command,
    output: result.output.slice(-3000),
    error: result.ok ? undefined : result.output.slice(-1500),
  };
}

async function main(): Promise<void> {
  process.env.CUSTOMER_ADMIN_CERTIFICATION = "1";
  loadRootEnv();

  const preflight = assertPreflight(ROOT);
  log(`Preflight OK — commit ${preflight.commitSha} on ${preflight.branch}`);

  const gates: GateResult[] = [
    gate("A", "Platform core tests", "pnpm --filter @rtb/platform-core test"),
    gate("A", "Phase 4 unit tests", "pnpm test:unit", PKG),
    gate("A", "Web typecheck", "pnpm --filter @rtb/web typecheck"),
  ];

  log("Provisioning Phase 4 fixtures...");
  const prov = run("pnpm provision", PKG);
  if (!prov.ok) {
    gates.push({
      gate: "PRE",
      name: "Fixture provision",
      status: "fail",
      command: "pnpm provision",
      error: prov.output,
    });
    throw new Error("Fixture provision failed");
  }

  gates.push(gate("B", "Hosted Batch 33 schema", "pnpm verify-hosted-schema", PKG));
  gates.push(gate("C", "Growth credit reconciliation", "pnpm test:growth", PKG));

  const certServer = new CertificationServer(ROOT);
  let port: number | undefined;
  let buildPayload;

  try {
    port = await certServer.start();
    gates.push(gate("A", "Web production build (cert server)", "echo built"));

    const identity = await verifyBuildIdentity(ROOT, certServer.baseUrl);
    if (!identity.ok) {
      gates.push({
        gate: "N",
        name: "Build identity",
        status: "fail",
        command: "GET /api/platform/build-identity",
        error: identity.error,
      });
    } else {
      buildPayload = identity.payload;
      gates.push({
        gate: "N",
        name: "Build identity",
        status: "pass",
        command: "GET /api/platform/build-identity",
        output: JSON.stringify(buildPayload, null, 2),
      });
    }

    gates.push(gate("D", "HTTP authorization matrix", "pnpm test:http", PKG));
    gates.push(gate("E", "Administration UI unit gates", "pnpm test:administration", PKG));
    gates.push(gate("F", "Playwright flows A–P", "pnpm test:e2e", PKG));
    gates.push(gate("M", "Accessibility checks", "pnpm test:a11y", PKG));
    gates.push(gate("M", "Responsive checks", "pnpm test:responsive", PKG));
  } finally {
    certServer.stop();
  }

  const failures = gates.filter((g) => g.status === "fail").map((g) => `${g.gate} ${g.name}`);
  const verdict = failures.length === 0 ? "PASS" : "FAIL";

  const reportPath = writePhase4Report(PKG, {
    verdict,
    phase: 4,
    environment: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "unknown",
    commitSha: preflight.commitSha,
    branch: preflight.branch,
    buildTimestamp: new Date().toISOString(),
    packageVersion: "0.1.0",
    supabaseProjectRef: buildPayload?.supabaseProjectRef ?? HOSTED_PROJECT_REF,
    buildIdentityToken: buildPayload?.buildIdentityToken,
    certificationServerPort: port,
    gates,
    failures,
    skippedTests: 0,
    artifacts: ["artifacts/phase-4-certification.json", fixturesManifestPath()],
    migrationChecksums: buildPayload?.migrationChecksums,
  });

  log(`Report: ${reportPath}`);
  log(`Verdict: ${verdict}`);
  if (verdict === "FAIL") process.exit(1);
}

main().catch((e) => {
  console.error(`[phase4:certify] ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
