/**
 * Apply Phase 10B.1 migration to hosted staging when SUPABASE_DB_URL is set.
 * Without DB URL, verifies whether tables already exist via service role.
 * Idempotent: skips re-apply when batch_51 tables already exist.
 */
import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const MIGRATION =
  "20260807120000_batch_51_asset_intelligence_hosted_persistence.sql";
const TABLES = [
  "asset_intelligence_condition_states",
  "asset_intelligence_snapshots",
  "asset_intelligence_timeline",
  "asset_intelligence_source_provenance",
  "asset_intelligence_idempotency",
  "asset_intelligence_outbox_events",
] as const;

async function tablesReady(
  url: string,
  key: string,
): Promise<{ ready: boolean; missing: string[] }> {
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const missing: string[] = [];
  for (const table of TABLES) {
    const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (error) missing.push(`${table}:${error.message || error.code || "unknown"}`);
  }
  return { ready: missing.length === 0, missing };
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  const migrationPath = resolve(root, "supabase/migrations", MIGRATION);
  if (!existsSync(migrationPath)) {
    console.error(`Missing migration ${MIGRATION}`);
    process.exit(1);
  }
  const sql = readFileSync(migrationPath, "utf8");
  const checksum = createHash("sha256").update(sql).digest("hex");
  console.log(JSON.stringify({ migration: MIGRATION, checksum, bytes: sql.length }));

  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for verification");
    process.exit(1);
  }

  const before = await tablesReady(url, key);
  if (before.ready) {
    console.log(JSON.stringify({ applied: false, reason: "already_present", hostedTablesReady: true, tables: TABLES, checksum }));
    return;
  }

  const dbUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
  if (dbUrl) {
    const pg = await import("pg");
    const client = new pg.default.Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    try {
      await client.query(sql);
      console.log(JSON.stringify({ applied: true, via: "SUPABASE_DB_URL" }));
    } finally {
      await client.end();
    }
  }

  const after = await tablesReady(url, key);
  if (!after.ready) {
    console.error(
      JSON.stringify({
        hostedTablesReady: false,
        missing: after.missing,
        hint: "Set SUPABASE_DB_URL and re-run apply-hosted-migration, or apply batch_51 SQL in Supabase SQL editor.",
      }),
    );
    process.exit(1);
  }
  console.log(JSON.stringify({ hostedTablesReady: true, tables: TABLES, checksum }));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
