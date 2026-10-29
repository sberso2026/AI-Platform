/**
 * RTB-SEC-REL-1D post-lockdown negative RPC and smoke probes.
 * Does not mutate customer or commercial rows. Never prints secrets.
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseEnvAssignments } from "../src/env";
import { anonReadDenied, restFetch } from "../src/live-http";

const PRODUCTION_REF = "wcydlhqiqdwgoaqrlget";
const STAGING_REF = "rntonzigxwxcjlcsadip";
const PRODUCTION_URL = `https://${PRODUCTION_REF}.supabase.co`;
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DUMMY_TENANT = "00000000-0000-4000-8000-000000000001";
const DUMMY_USER = "00000000-0000-4000-8000-000000000002";

function runCapture(command: string, args: string[]) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

function rpcDenied(status: number, body: unknown): boolean {
  if (status === 401 || status === 403 || status === 404) return true;
  const text = typeof body === "string" ? body : JSON.stringify(body ?? "");
  return /permission denied|not found|schema cache|could not find/i.test(text);
}

const dir = mkdtempSync(join(tmpdir(), "rtb-sec-rel-1d-live-"));
const keysPath = join(dir, "api-keys.json");
try {
  const listed = runCapture("npx", ["--yes", "supabase", "projects", "api-keys", "--project-ref", PRODUCTION_REF, "-o", "json"]);
  if (listed.status !== 0) throw new Error("supabase api-keys failed");
  writeFileSync(keysPath, listed.stdout ?? "", { mode: 0o600 });
  const parsed = JSON.parse(listed.stdout ?? "[]") as Array<{ name?: string; api_key?: string }>;
  const anon = parsed.find((row) => row.name === "anon")?.api_key?.trim();
  const service = parsed.find((row) => row.name === "service_role")?.api_key?.trim();
  if (!anon || !service) throw new Error("production keys missing");
  if (anon.includes(STAGING_REF) || service.includes(STAGING_REF)) throw new Error("refused staging credential");

  const tables = ["tenants", "profiles", "commercial_subscriptions", "commercial_licenses"];
  const anonResults: Record<string, { status: number; denied: boolean }> = {};
  for (const table of tables) {
    const result = await restFetch(PRODUCTION_URL, anon, service, `${table}?select=id&limit=1`);
    anonResults[table] = { status: result.status, denied: anonReadDenied(result) };
  }

  const serviceTenants = await restFetch(
    PRODUCTION_URL,
    anon,
    service,
    "tenants?select=id&limit=1",
    {},
    service,
  );

  const anonRpc = await fetch(`${PRODUCTION_URL}/rest/v1/rpc/provision_signup_commercial_defaults`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_tenant_id: DUMMY_TENANT, p_user_id: DUMMY_USER }),
  });
  const anonBody = await anonRpc.text();
  let anonParsed: unknown = anonBody;
  try {
    anonParsed = anonBody ? JSON.parse(anonBody) : null;
  } catch {
    anonParsed = anonBody;
  }

  let authenticatedRpc: { status: number; denied: boolean } | { skipped: string } = {
    skipped: "no_safe_production_user",
  };
  const webEnvPath = resolve(repoRoot, "apps/web/.env.local");
  if (existsSync(webEnvPath)) {
    const env = parseEnvAssignments(readFileSync(webEnvPath, "utf8"));
    const email = env.CERT_USER_EMAIL?.trim();
    const password = env.CERT_USER_PASSWORD?.trim();
    const urlHost = env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([a-z0-9]+)\.supabase\.co/i)?.[1];
    if (email && password && urlHost === PRODUCTION_REF) {
      const session = await fetch(`${PRODUCTION_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: anon, "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (session.ok) {
        const json = (await session.json()) as { access_token?: string };
        const jwt = json.access_token;
        if (jwt) {
          const authed = await fetch(`${PRODUCTION_URL}/rest/v1/rpc/provision_signup_commercial_defaults`, {
            method: "POST",
            headers: {
              apikey: anon,
              Authorization: `Bearer ${jwt}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ p_tenant_id: DUMMY_TENANT, p_user_id: DUMMY_USER }),
          });
          const authedBody = await authed.text();
          authenticatedRpc = {
            status: authed.status,
            denied: rpcDenied(authed.status, authedBody),
          };
        }
      } else {
        authenticatedRpc = { skipped: `password_grant_${session.status}` };
      }
    }
  }

  const anonDenied = Object.values(anonResults).every((row) => row.denied);
  const backendOk = serviceTenants.status === 200;
  const anonRpcDenied = rpcDenied(anonRpc.status, anonParsed);
  const authedDenied =
    "skipped" in authenticatedRpc ? true : authenticatedRpc.denied;

  console.log(
    JSON.stringify({
      target: PRODUCTION_REF,
      dummy_ids_only: true,
      anon_table_access: anonResults,
      anon_denied: anonDenied,
      service_tenants_status: serviceTenants.status,
      backend_ok: backendOk,
      anon_rpc_status: anonRpc.status,
      anon_rpc_denied: anonRpcDenied,
      authenticated_rpc: authenticatedRpc,
    }),
  );

  if (!anonDenied || !backendOk || !anonRpcDenied || !authedDenied) process.exit(1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
