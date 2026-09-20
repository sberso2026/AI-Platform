/**
 * Configure GitHub REVIEW_STAGING_* from the Staging Supabase project only.
 * Never prints secret values. Never reads EOS project credentials.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { parseEnvAssignments } from "../src/env";

const STAGING_REF = "rntonzigxwxcjlcsadip";
const EOS_REF = "wcydlhqiqdwgoaqrlget";
const STAGING_URL = `https://${STAGING_REF}.supabase.co`;

function fixturePassword(): string {
  if (process.env.REVIEW_STAGING_CERT_USER_PASSWORD?.trim()) return process.env.REVIEW_STAGING_CERT_USER_PASSWORD;
  for (const file of [".env.local", ".env"]) {
    const path = resolve(file);
    if (!existsSync(path)) continue;
    const parsed = parseEnvAssignments(readFileSync(path, "utf8"));
    if (parsed.REVIEW_STAGING_CERT_USER_PASSWORD) return parsed.REVIEW_STAGING_CERT_USER_PASSWORD;
    if (parsed.CERT_USER_PASSWORD) return parsed.CERT_USER_PASSWORD;
  }
  return "CertInstall!Phase3";
}

function run(command: string, args: string[], input?: string) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: true,
    input,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function ghSet(name: string, value: string) {
  const result = run("gh", ["secret", "set", name], value);
  if (result.status !== 0) {
    throw new Error(`failed to set ${name}`);
  }
}

const dir = mkdtempSync(join(tmpdir(), "rtb-review-staging-"));
const keysPath = join(dir, "api-keys.json");
try {
  const listed = run("npx", ["supabase", "projects", "api-keys", "--project-ref", STAGING_REF, "-o", "json"]);
  if (listed.status !== 0) {
    throw new Error("supabase api-keys failed");
  }
  writeFileSync(keysPath, listed.stdout ?? "", { mode: 0o600 });
  const parsed = JSON.parse(readFileSync(keysPath, "utf8")) as Array<{ name?: string; api_key?: string }>;
  const anon = parsed.find((row) => row.name === "anon")?.api_key?.trim();
  const service = parsed.find((row) => row.name === "service_role")?.api_key?.trim();
  if (!anon || !service) throw new Error("staging anon or service_role missing");
  if (anon.includes(EOS_REF) || service.includes(EOS_REF)) throw new Error("refused EOS credential");

  ghSet("REVIEW_STAGING_SUPABASE_URL", STAGING_URL);
  ghSet("REVIEW_STAGING_SUPABASE_ANON_KEY", anon);
  ghSet("REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY", service);
  ghSet("REVIEW_STAGING_CERT_USER_PASSWORD", fixturePassword());

  console.log(
    JSON.stringify({
      target_project: STAGING_REF,
      target_url_host: `${STAGING_REF}.supabase.co`,
      eos_project_used: false,
      secrets_set: [
        "REVIEW_STAGING_SUPABASE_URL",
        "REVIEW_STAGING_SUPABASE_ANON_KEY",
        "REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY",
        "REVIEW_STAGING_CERT_USER_PASSWORD",
      ],
    }),
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
