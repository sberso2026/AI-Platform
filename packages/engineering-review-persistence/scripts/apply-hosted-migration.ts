/**
 * Apply Review and Core RLS migrations to hosted Postgres when a DB URL is set.
 * Never prints secret values. Checksums are of SQL files only.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { loadLocalEnv, resolveServiceRoleKey, resolveSupabaseUrl } from "../src/env";
import { reviewTablesReady } from "../src/fixtures";

const REVIEW_MIGRATIONS = [
  "20260919120000_engineering_review_persistence.sql",
  "20260919133000_engineering_review_persist_functions.sql",
];

const CORE_RLS_MIGRATION = "20260920040000_engineering_core_rls_workspace.sql";

function repoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
}

function checksumSql(sql: string): string {
  return createHash("sha256").update(sql).digest("hex");
}

async function applySqlFile(filePath: string, label: string): Promise<boolean> {
  const sql = readFileSync(filePath, "utf8");
  const dbUrl = process.env.SUPABASE_DB_URL ?? process.env.DATABASE_URL;
  if (dbUrl) {
    const pgMod = await import("pg");
    const Client = (
      pgMod as {
        Client: new (opts: object) => {
          connect(): Promise<void>;
          query(text: string): Promise<unknown>;
          end(): Promise<void>;
        };
      }
    ).Client;
    const client = new Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    try {
      console.log(JSON.stringify({ migration: label, checksum: checksumSql(sql), bytes: sql.length }));
      await client.query(sql);
      return true;
    } finally {
      await client.end();
    }
  }

  const result = spawnSync(
    "npx",
    ["supabase", "db", "query", "--linked", "--workdir", process.env.SUPABASE_WORKDIR || repoRoot(), "-f", filePath],
    {
      cwd: repoRoot(),
      encoding: "utf8",
      shell: true,
    },
  );
  if (result.status === 0) {
    console.log(JSON.stringify({ migration: label, checksum: checksumSql(sql), bytes: sql.length, via: "supabase-cli" }));
    return true;
  }
  if (result.stderr) {
    console.error(result.stderr.split("\n").filter((line) => !/password|secret|key|token/i.test(line)).join("\n"));
  }
  return false;
}

export async function applyHostedReviewMigrations(): Promise<{
  hostedTablesReady: boolean;
  applied: boolean;
  missing: string[];
}> {
  loadLocalEnv();
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();
  if (!url || !key) {
    return { hostedTablesReady: false, applied: false, missing: ["credentials"] };
  }

  const before = await reviewTablesReady(url, key);
  let applied = false;
  if (!before.ready) {
    for (const file of REVIEW_MIGRATIONS) {
      const path = resolve(repoRoot(), "supabase/migrations", file);
      if (!existsSync(path)) throw new Error(`Missing ${file}`);
      applied = (await applySqlFile(path, file)) || applied;
    }
  }

  const after = await reviewTablesReady(url, key);
  return { hostedTablesReady: after.ready, applied, missing: after.missing };
}

export async function applyHostedCoreRlsMigration(): Promise<{
  applied: boolean;
  reachable: boolean;
}> {
  loadLocalEnv();
  const url = resolveSupabaseUrl();
  const key = resolveServiceRoleKey();
  if (!url || !key) return { applied: false, reachable: false };

  const path = resolve(repoRoot(), "supabase/migrations", CORE_RLS_MIGRATION);
  if (!existsSync(path)) throw new Error(`Missing ${CORE_RLS_MIGRATION}`);
  let applied = false;
  try {
    applied = await applySqlFile(path, CORE_RLS_MIGRATION);
  } catch (error) {
    console.error("Core RLS migration apply failed:", error instanceof Error ? error.message : "unknown");
  }

  const response = await fetch(`${url}/rest/v1/engineering_projects?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return { applied, reachable: response.ok };
}

async function main() {
  const review = await applyHostedReviewMigrations();
  const core = await applyHostedCoreRlsMigration();
  console.log(JSON.stringify({ review, core }));
  if (!review.hostedTablesReady || !core.reachable) process.exit(1);
}

const isDirect = process.argv[1]?.includes("apply-hosted-migration");
if (isDirect) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
