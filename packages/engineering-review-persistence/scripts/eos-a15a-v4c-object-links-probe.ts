/**
 * EOS-A15A-V4C: reproduce engineering_object_links.workspace_id PostgREST error.
 * Never prints secrets, JWTs, or connection strings.
 */
import { randomUUID } from "node:crypto";
import {
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "../src/env";
import { restFetch } from "../src/live-http";

function codeOf(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const row = body as { code?: unknown; message?: unknown; hint?: unknown };
  return typeof row.code === "string" ? row.code : null;
}

function messageOf(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const row = body as { message?: unknown };
  return typeof row.message === "string" ? row.message : null;
}

async function main() {
  loadLocalEnv();
  const url = resolveSupabaseUrl();
  const anon = resolveSupabaseAnonKey();
  const service = resolveServiceRoleKey();
  if (!url || !anon || !service) {
    console.log(JSON.stringify({ ok: false, reason: "hosted_credentials_missing" }));
    process.exit(1);
  }
  const missing = await restFetch(url, anon, service, "engineering_object_links?select=workspace_id&limit=0", {}, service);
  const canonical = await restFetch(
    url,
    anon,
    service,
    "engineering_object_links?select=id,tenant_id,from_type,from_id,to_type,to_id,relationship,relationship_governed,metadata,created_by,created_at&limit=0",
    {},
    service,
  );
  const insertId = randomUUID();
  const tenantProbe = await restFetch(url, anon, service, "tenants?select=id&limit=1", {}, service);
  const tenantId = Array.isArray(tenantProbe.body) ? String((tenantProbe.body[0] as { id?: string })?.id ?? "") : "";
  const badInsert = await restFetch(
    url,
    anon,
    service,
    "engineering_object_links",
    {
      method: "POST",
      body: JSON.stringify({
        id: insertId,
        tenant_id: tenantId || insertId,
        workspace_id: insertId,
        from_type: "mto_snapshot",
        from_id: insertId,
        to_type: "mto_snapshot",
        to_id: randomUUID(),
        relationship: "SUPERSEDES",
        relationship_governed: false,
      }),
    },
    service,
  );
  console.log(JSON.stringify({
    missing_column_select: { status: missing.status, code: codeOf(missing.body), message: messageOf(missing.body) },
    canonical_select: { status: canonical.status, code: codeOf(canonical.body), message: messageOf(canonical.body) },
    insert_with_workspace_id: { status: badInsert.status, code: codeOf(badInsert.body), message: messageOf(badInsert.body) },
  }, null, 2));
}

main().catch((error: unknown) => {
  console.log(JSON.stringify({ ok: false, reason: error instanceof Error ? error.message : "probe_failed" }));
  process.exit(1);
});
