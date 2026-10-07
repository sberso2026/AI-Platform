/**
 * Non-destructive production authorization probes after RLS-1C.
 * Never prints secret values. Does not create or mutate customer rows.
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

function runCapture(command: string, args: string[]) {
  return spawnSync(command, args, {
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
}

const dir = mkdtempSync(join(tmpdir(), "rtb-sec-rls-1c-live-"));
const keysPath = join(dir, "api-keys.json");
try {
  const listed = runCapture("npx", ["--yes", "supabase", "projects", "api-keys", "--project-ref", PRODUCTION_REF, "-o", "json"]);
  if (listed.status !== 0) throw new Error("supabase api-keys failed");
  writeFileSync(keysPath, listed.stdout ?? "", { mode: 0o600 });
  const parsed = JSON.parse(readFileSync(keysPath, "utf8")) as Array<{ name?: string; api_key?: string }>;
  const anon = parsed.find((row) => row.name === "anon")?.api_key?.trim();
  const service = parsed.find((row) => row.name === "service_role")?.api_key?.trim();
  if (!anon || !service) throw new Error("production keys missing");
  if (anon.includes(STAGING_REF) || service.includes(STAGING_REF)) throw new Error("refused staging credential");

  const tables = [
    "digital_twin_source_adapters",
    "digital_twin_state_schemas",
    "tenants",
    "profiles",
    "asset_intelligence_failure_taxonomy",
  ];
  const anonResults: Record<string, { status: number; denied: boolean }> = {};
  for (const table of tables) {
    const result = await restFetch(PRODUCTION_URL, anon, service, `${table}?select=*&limit=1`);
    anonResults[table] = { status: result.status, denied: anonReadDenied(result) };
  }

  const serviceAdapters = await restFetch(
    PRODUCTION_URL,
    anon,
    service,
    "digital_twin_source_adapters?select=adapter_id&limit=1",
    {},
    service,
  );

  const anonRpc = await fetch(`${PRODUCTION_URL}/rest/v1/rpc/get_user_tenant_ids`, {
    method: "POST",
    headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
    body: "{}",
  });

  let authenticated: { status: number; ok: boolean } | { skipped: string } = {
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
          const adapters = await restFetch(
            PRODUCTION_URL,
            anon,
            service,
            "digital_twin_source_adapters?select=adapter_id&limit=3",
            {},
            jwt,
          );
          authenticated = {
            status: adapters.status,
            ok: adapters.status === 200 && Array.isArray(adapters.body),
          };
        }
      } else {
        authenticated = { skipped: `password_grant_${session.status}` };
      }
    }
  }

  const anonDenied = Object.values(anonResults).every((row) => row.denied);
  const backendOk = serviceAdapters.status === 200;
  const rpcDenied = anonRpc.status === 401 || anonRpc.status === 403;
  console.log(JSON.stringify({
    target: PRODUCTION_REF,
    anon_table_access: anonResults,
    anon_denied: anonDenied,
    service_adapters_status: serviceAdapters.status,
    backend_ok: backendOk,
    anon_rpc_status: anonRpc.status,
    anon_rpc_denied: rpcDenied,
    authenticated,
  }));
  if (!anonDenied || !backendOk || !rpcDenied) process.exit(1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
