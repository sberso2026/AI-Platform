import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { applyRtbM365ServerEnv } from "./review-staging-m365-env.mjs";

const STAGING_REF = "rntonzigxwxcjlcsadip";
const EOS_REF = "wcydlhqiqdwgoaqrlget";
const ENV_KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function parseEnvAssignments(source) {
  const parsed = {};
  for (const raw of source.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!ENV_KEY_RE.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }
  return parsed;
}

function projectRefFromUrl(url) {
  const match = String(url ?? "").trim().match(/^https:\/\/([a-z0-9]+)\.supabase\.co\/?$/i);
  return match ? match[1].toLowerCase() : null;
}

function projectRefFromJwt(token) {
  const raw = String(token ?? "").trim();
  if (!raw || raw.startsWith("sb_")) return null;
  const parts = raw.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
    return typeof payload.ref === "string" && payload.ref ? payload.ref.toLowerCase() : null;
  } catch {
    return null;
  }
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const webRoot = resolve(repoRoot, "apps/web");
const rootEnvPath = resolve(repoRoot, ".env.local");
if (!existsSync(rootEnvPath)) fail("Review staging requires repo-root .env.local with staging credentials.");

const fileEnv = parseEnvAssignments(readFileSync(rootEnvPath, "utf8"));
const url =
  process.env.REVIEW_STAGING_SUPABASE_URL ||
  fileEnv.REVIEW_STAGING_SUPABASE_URL ||
  fileEnv.SUPABASE_URL ||
  fileEnv.SUPABASE_TEST_URL ||
  fileEnv.NEXT_PUBLIC_SUPABASE_URL;
const anon =
  process.env.REVIEW_STAGING_SUPABASE_ANON_KEY ||
  fileEnv.REVIEW_STAGING_SUPABASE_ANON_KEY ||
  fileEnv.SUPABASE_ANON_KEY ||
  fileEnv.SUPABASE_TEST_ANON_KEY ||
  fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service =
  process.env.REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY ||
  fileEnv.REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY ||
  fileEnv.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anon || !service) fail("Review staging credentials are missing.");
const ref = projectRefFromUrl(url);
if (!ref) fail("Review staging Supabase URL is invalid.");
if (ref === EOS_REF) fail("Refusing to start Review staging against the EOS Supabase project.");
if (ref !== STAGING_REF) fail("Review staging project mismatch.");
for (const token of [anon, service]) {
  const keyRef = projectRefFromJwt(token);
  if (!keyRef) continue;
  if (keyRef === EOS_REF) fail("Refusing to start Review staging against the EOS Supabase project.");
  if (keyRef !== STAGING_REF) fail("Review staging project mismatch.");
}

const port = process.env.REVIEW_STAGING_WEB_PORT || "3002";
process.stdout.write(`REVIEW_STAGING_PROJECT_REF=${ref}\n`);
process.stdout.write(`REVIEW_STAGING_WEB_PORT=${port}\n`);
process.stdout.write("RTB_REVIEW_RUNTIME=staging\n");

const childEnv = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: url,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: anon,
  SUPABASE_URL: url,
  SUPABASE_ANON_KEY: anon,
  SUPABASE_SERVICE_ROLE_KEY: service,
  SUPABASE_PROJECT_REF: STAGING_REF,
  RTB_REVIEW_RUNTIME: "staging",
  NEXT_PUBLIC_RTB_REVIEW_RUNTIME: "staging",
};
applyRtbM365ServerEnv(childEnv, process.env, fileEnv);

const child = spawn("pnpm", ["exec", "next", "dev", "--turbopack", "-p", port], {
  cwd: webRoot,
  env: childEnv,
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code) => {
  process.exit(code ?? 1);
});
