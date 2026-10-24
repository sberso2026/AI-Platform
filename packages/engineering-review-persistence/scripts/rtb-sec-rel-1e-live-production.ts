/**
 * RTB-SEC-REL-1E negative RPC and smoke probes.
 * Dummy IDs only. Does not mutate customer or commercial rows.
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { anonReadDenied, restFetch } from "../src/live-http";

const PRODUCTION_REF = "wcydlhqiqdwgoaqrlget";
const STAGING_REF = "rntonzigxwxcjlcsadip";
const PRODUCTION_URL = `https://${PRODUCTION_REF}.supabase.co`;
const DUMMY_TENANT = "00000000-0000-4000-8000-000000000001";

function rpcDenied(status: number, body: unknown): boolean {
  if (status === 401 || status === 403 || status === 404) return true;
  const text = typeof body === "string" ? body : JSON.stringify(body ?? "");
  return /permission denied|not found|schema cache|could not find/i.test(text);
}

const dir = mkdtempSync(join(tmpdir(), "rtb-sec-rel-1e-live-"));
try {
  const listed = spawnSync("npx", ["--yes", "supabase", "projects", "api-keys", "--project-ref", PRODUCTION_REF, "-o", "json"], {
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (listed.status !== 0) throw new Error("supabase api-keys failed");
  writeFileSync(join(dir, "api-keys.json"), listed.stdout ?? "", { mode: 0o600 });
  const parsed = JSON.parse(listed.stdout ?? "[]") as Array<{ name?: string; api_key?: string }>;
  const anon = parsed.find((row) => row.name === "anon")?.api_key?.trim();
  const service = parsed.find((row) => row.name === "service_role")?.api_key?.trim();
  if (!anon || !service) throw new Error("production keys missing");
  if (anon.includes(STAGING_REF) || service.includes(STAGING_REF)) throw new Error("refused staging credential");

  const rpcs: Array<{ name: string; body: Record<string, unknown> }> = [
    { name: "seed_engineering_os_demo_data", body: { p_tenant_id: DUMMY_TENANT } },
    { name: "reset_engineering_os_demo_data", body: { p_tenant_id: DUMMY_TENANT } },
    { name: "seed_tenant_engineering_os", body: { p_tenant_id: DUMMY_TENANT } },
    { name: "bump_commercial_entitlement_version", body: { p_tenant_id: DUMMY_TENANT } },
    { name: "bump_commercial_installation_version", body: { p_tenant_id: DUMMY_TENANT } },
    { name: "create_default_tenant_roles", body: { p_tenant_id: DUMMY_TENANT } },
    { name: "provision_tenant_kernel_defaults", body: { p_tenant_id: DUMMY_TENANT } },
    { name: "pi_document_release_expired_leases", body: {} },
  ];

  const anonRpc: Record<string, { status: number; denied: boolean }> = {};
  for (const rpc of rpcs) {
    const response = await fetch(`${PRODUCTION_URL}/rest/v1/rpc/${rpc.name}`, {
      method: "POST",
      headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
      body: JSON.stringify(rpc.body),
    });
    const text = await response.text();
    anonRpc[rpc.name] = { status: response.status, denied: rpcDenied(response.status, text) };
  }

  const tables = ["tenants", "profiles", "commercial_subscriptions"];
  const anonTables: Record<string, { status: number; denied: boolean }> = {};
  for (const table of tables) {
    const result = await restFetch(PRODUCTION_URL, anon, service, `${table}?select=id&limit=1`);
    anonTables[table] = { status: result.status, denied: anonReadDenied(result) };
  }
  const serviceTenants = await restFetch(PRODUCTION_URL, anon, service, "tenants?select=id&limit=1", {}, service);

  const anonRpcDenied = Object.values(anonRpc).every((row) => row.denied);
  const anonDenied = Object.values(anonTables).every((row) => row.denied);
  const backendOk = serviceTenants.status === 200;

  console.log(
    JSON.stringify({
      target: PRODUCTION_REF,
      dummy_ids_only: true,
      anon_rpc: anonRpc,
      anon_rpc_denied: anonRpcDenied,
      anon_tables: anonTables,
      anon_denied: anonDenied,
      service_tenants_status: serviceTenants.status,
      backend_ok: backendOk,
      authenticated_rpc: { skipped: "no_safe_production_user" },
    }),
  );

  if (!anonRpcDenied || !anonDenied || !backendOk) process.exit(1);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
