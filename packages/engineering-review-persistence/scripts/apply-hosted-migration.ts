/**
 * Apply ERA-2/ERA-3 Review AI migrations to hosted Postgres when a DB URL is set.
 * Without DB URL, only verifies table presence via service role.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnv, resolveServiceRoleKey, resolveSupabaseUrl } from "../src/env";
import { reviewTablesReady } from "../src/fixtures";

const MIGRATIONS = [
  "20260919120000_engineering_review_persistence.sql",
  "20260919133000_engineering_review_persist_functions.sql",
];

export async function applyHostedReviewMigrations(): Promise<{
  hostedTablesReady: boolean;
  applied: boolean;
  missing: string[];
}> {
  loadLocalEnv();
  const root = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();
  if (!url || !key) {
    return { hostedTablesReady: false, applied: false, missing: ["credentials"] };
  }

  const before = await reviewTablesReady(url, key);
  const dbUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
  let applied = false;
  if (!before.ready && dbUrl) {
    const pgMod = await import("pg");
    const Client = (pgMod as { Client: new (opts: object) => { connect(): Promise<void>; query(sql: string): Promise<unknown>; end(): Promise<void> } }).Client;
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    try {
      for (const file of MIGRATIONS) {
        const path = resolve(root, "supabase/migrations", file);
        if (!existsSync(path)) throw new Error(`Missing ${file}`);
        const sql = readFileSync(path, "utf8");
        const checksum = createHash("sha256").update(sql).digest("hex");
        console.log(JSON.stringify({ migration: file, checksum, bytes: sql.length }));
        await client.query(sql);
      }
      applied = true;
    } finally {
      await client.end();
    }
  }

  const after = await reviewTablesReady(url, key);
  return { hostedTablesReady: after.ready, applied, missing: after.missing };
}

async function main() {
  const result = await applyHostedReviewMigrations();
  console.log(JSON.stringify(result));
  if (!result.hostedTablesReady) process.exit(1);
}

const isDirect = process.argv[1]?.includes("apply-hosted-migration");
if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
