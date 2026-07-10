/**
 * Orchestrates Installation Phase 3 certification gates A–L and writes evidence artifacts.
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { verifyBuildIdentity, resolveLocalCommitSha } from "../src/build-identity.js";
import { assertCertificationSecrets } from "../src/lib/env.js";
import { CertificationServer } from "../src/lib/cert-server.js";
import { type GateResult, writeCertificationReport } from "../src/report.js";

const ROOT = resolve(process.cwd(), "../..");
const PKG = process.cwd();

function log(msg: string): void {
  console.log(`[installation:certify] ${msg}`);
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
  process.env.SUPABASE_ANON_KEY ??= process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.SUPABASE_TEST_URL ??= process.env.SUPABASE_URL;
  process.env.SUPABASE_TEST_ANON_KEY ??= process.env.SUPABASE_ANON_KEY;
}

function runCommand(label: string, command: string, cwd = ROOT): { ok: boolean; output: string } {
  try {
    const output = execSync(command, {
      cwd,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      env: { ...process.env, INSTALLATION_CERTIFICATION: "1", FORCE_COLOR: "0" },
    });
    return { ok: true, output };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; message?: string };
    const output = [e.stdout, e.stderr, e.message].filter(Boolean).join("\n");
    return { ok: false, output };
  }
}

function gate(id: string, name: string, command: string, cwd?: string): GateResult {
  log(`Gate ${id}: ${name}`);
  const result = runCommand(name, command, cwd);
  return {
    gate: id,
    name,
    status: result.ok ? "pass" : "fail",
    command,
    output: result.output.slice(-4000),
    error: result.ok ? undefined : result.output.slice(-2000),
  };
}

async function gateBuildIdentity(baseUrl?: string): Promise<GateResult> {
  log("Gate L: Build identity verification");
  const result = await verifyBuildIdentity(ROOT, baseUrl);
  return {
    gate: "L",
    name: "Build identity (Git SHA)",
    status: result.ok ? "pass" : "fail",
    command: "GET /api/platform/build-identity",
    output: result.payload ? JSON.stringify(result.payload, null, 2).slice(-4000) : undefined,
    error: result.error,
  };
}

async function main(): Promise<void> {
  process.env.INSTALLATION_CERTIFICATION = "1";
  loadRootEnv();
  assertCertificationSecrets();

  log("Provisioning fresh certification fixtures...");
  const prov = runCommand("provision", "pnpm provision", PKG);
  if (!prov.ok) {
    console.error(prov.output);
    process.exit(1);
  }

  const gates: GateResult[] = [
    gate("A", "Repository tests", "pnpm test"),
    gate("A", "Platform commerce tests", "pnpm --filter @rtb/platform-commerce test"),
    gate("A", "Web typecheck", "pnpm --filter @rtb/web typecheck"),
    gate("A", "Web production build", "pnpm --filter @rtb/web build"),
    gate("B", "Hosted schema verification", "pnpm verify-hosted-schema", PKG),
    gate("C", "Installation backfill verification", "pnpm verify-backfill", PKG),
  ];

  const certServer = new CertificationServer(ROOT);
  let serverPort: number | undefined;
  let buildIdentityPayload;

  try {
    serverPort = await certServer.start({ skipBuild: false });
    log(`Verifying certification server build-identity at ${certServer.baseUrl}`);
    const identityProbe = await verifyBuildIdentity(ROOT);
    if (!identityProbe.ok) {
      gates.push({
        gate: "PRE",
        name: "Certification server build-identity probe",
        status: "fail",
        command: "GET /api/platform/build-identity",
        error: identityProbe.error,
      });
      throw new Error(identityProbe.error ?? "build-identity probe failed");
    }
    buildIdentityPayload = identityProbe.payload;

    gates.push(gate("D", "RLS certification tests", "pnpm test:rls", PKG));
    gates.push(gate("E", "HTTP enforcement tests", "pnpm test:http", PKG));
    gates.push(gate("G", "Scheduler lifecycle tests", "pnpm test:scheduler", PKG));
    gates.push(gate("H", "Cache invalidation tests", "pnpm test:cache", PKG));
    gates.push(gate("I", "Workspace provisioning tests", "pnpm test:workspace", PKG));
    gates.push(gate("J", "Lifecycle transition tests", "pnpm test:lifecycle", PKG));
    gates.push(gate("K", "Dependency enforcement tests", "pnpm test:dependency", PKG));
    gates.push(gate("F", "Browser E2E tests", "pnpm test:e2e", PKG));
    gates.push(await gateBuildIdentity(certServer.baseUrl));
  } finally {
    certServer.stop();
  }

  const failures = gates.filter((g) => g.status === "fail").map((g) => `Gate ${g.gate} ${g.name}`);
  const verdict = failures.length === 0 ? "PASS" : "FAIL";
  const commitSha = resolveLocalCommitSha(ROOT);

  const report = {
    verdict: verdict as "PASS" | "FAIL",
    environment: process.env.SUPABASE_URL ?? "unknown",
    commitSha,
    supabaseProjectRef:
      buildIdentityPayload?.supabaseProjectRef ??
      process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1] ??
      null,
    testDate: new Date().toISOString(),
    certificationServerPort: serverPort,
    gates,
    failures,
    warnings: [],
    skippedTests: 0,
    artifacts: [
      "artifacts/phase-3-certification.json",
      "docs/certification/INSTALLATION_PHASE_3_CERTIFICATION.md",
      "artifacts/cert-fixtures.json",
      "artifacts/installation-backfill-verification.json",
      "artifacts/playwright-report.json",
    ],
    migrationChecksums: buildIdentityPayload?.migrationChecksums,
  };

  const jsonPath = writeCertificationReport(PKG, ROOT, report);
  log(`Wrote ${jsonPath}`);
  log(`Verdict: ${verdict}`);

  if (verdict === "FAIL") {
    for (const f of failures) log(`FAIL: ${f}`);
    process.exit(1);
  }

  log("Cleaning up certification fixtures...");
  const teardown = runCommand("cleanup", "pnpm teardown", PKG);
  if (!teardown.ok) {
    log(`Cleanup warning: ${teardown.output.slice(-500)}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(`[installation:certify] FAIL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
