/**
 * Run hosted Review security tests against Staging only.
 * Injects REVIEW_STAGING_* from the Staging project API keys.
 * Never prints secret values. Never uses EOS project credentials.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { parseEnvAssignments } from "../src/env";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const STAGING_REF = "rntonzigxwxcjlcsadip";
const EOS_REF = "wcydlhqiqdwgoaqrlget";
const STAGING_URL = `https://${STAGING_REF}.supabase.co`;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function runCapture(command: string, args: string[]) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

const dir = mkdtempSync(join(tmpdir(), "rtb-review-rls-"));
const keysPath = join(dir, "api-keys.json");
try {
  const listed = runCapture("npx", ["--yes", "supabase", "projects", "api-keys", "--project-ref", STAGING_REF, "-o", "json"]);
  if (listed.status !== 0) throw new Error("supabase api-keys failed");
  writeFileSync(keysPath, listed.stdout ?? "", { mode: 0o600 });
  const parsed = JSON.parse(readFileSync(keysPath, "utf8")) as Array<{ name?: string; api_key?: string }>;
  const anon = parsed.find((row) => row.name === "anon")?.api_key?.trim();
  const service = parsed.find((row) => row.name === "service_role")?.api_key?.trim();
  if (!anon || !service) throw new Error("staging keys missing");
  if (anon.includes(EOS_REF) || service.includes(EOS_REF)) throw new Error("refused EOS credential");

  const envFile = resolve(repoRoot, ".env.local");
  const parsedEnv = existsSync(envFile) ? parseEnvAssignments(readFileSync(envFile, "utf8")) : {};
  const certPassword = parsedEnv.CERT_USER_PASSWORD || process.env.CERT_USER_PASSWORD || "CertInstall!Phase3";
  const env = {
    ...process.env,
    ENGINEERING_REVIEW_RLS: "1",
    REVIEW_STAGING_SUPABASE_URL: STAGING_URL,
    REVIEW_STAGING_SUPABASE_ANON_KEY: anon,
    REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY: service,
    SUPABASE_URL: STAGING_URL,
    NEXT_PUBLIC_SUPABASE_URL: STAGING_URL,
    SUPABASE_ANON_KEY: anon,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
    SUPABASE_SERVICE_ROLE_KEY: service,
    CERT_USER_PASSWORD: certPassword,
  };

  const tests = spawnSync("pnpm", ["exec", "vitest", "run", "src/live-rls.test.ts", "src/live-core-rls.test.ts", "src/live-audit.test.ts", "src/live-identity.test.ts", "src/live-schema.test.ts", "src/live-restore.test.ts"], {
    cwd: resolve(repoRoot, "packages/engineering-review-persistence"),
    encoding: "utf8",
    shell: true,
    env,
  });
  const output = `${tests.stdout ?? ""}\n${tests.stderr ?? ""}`;
  const redacted = output
    .split(/\r?\n/)
    .filter((line) => !/eyJ[A-Za-z0-9_-]{20,}|service_role|postgres:\/\//i.test(line))
    .join("\n");
  console.log(redacted);
  process.exit(tests.status ?? 1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
