import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = resolve(import.meta.dirname, "../../../../supabase/migrations");
const BATCH_103 = resolve(MIGRATIONS_DIR, "20260819120000_batch_103_business_os_work_operations.sql");
const BATCH_99 = resolve(MIGRATIONS_DIR, "20260818130000_batch_99_business_os_growth_intelligence.sql");
const BATCH_100 = resolve(MIGRATIONS_DIR, "20260818140000_batch_100_business_os_revenue_execution.sql");
const LATER_BATCHES = [
  "20260819130000_batch_104_business_os_decision_action.sql",
  "20260819140000_batch_105_business_os_business_risk.sql",
  "20260819150000_batch_106_business_os_business_context.sql",
  "20260819160000_batch_107_business_os_ai_workforce.sql",
  "20260819170000_batch_108_business_os_connectors_hardening.sql",
] as const;

const CREATE_TABLE = /CREATE TABLE IF NOT EXISTS\s+([a-z0-9_]+)/gi;
const PRIMARY_KEY = /CREATE TABLE IF NOT EXISTS\s+([a-z0-9_]+)\s*\(([\s\S]*?)\n\)/gi;
const FK_CLAUSE =
  /([a-z0-9_]+)\s+uuid(?:\s+NOT NULL)?\s+REFERENCES\s+([a-z0-9_]+)\(([a-z0-9_]+)\)/gi;
const STALE_TABLES = ["business_os_opportunities", "business_os_proposals"] as const;

function createdTables(sql: string): Set<string> {
  const names = new Set<string>();
  for (const match of sql.matchAll(CREATE_TABLE)) names.add(match[1]);
  return names;
}

function primaryKeyColumns(sql: string, table: string): string[] {
  for (const match of sql.matchAll(PRIMARY_KEY)) {
    if (match[1] !== table) continue;
    const body = match[2];
    const inline = [...body.matchAll(/^\s*([a-z0-9_]+)\s+\w+[^,\n]*PRIMARY KEY/gim)].map((m) => m[1]);
    const tablePk = [...body.matchAll(/PRIMARY KEY\s*\(([a-z0-9_]+)\)/gi)].map((m) => m[1]);
    return [...inline, ...tablePk];
  }
  return [];
}

function foreignKeys(sql: string): Array<{ column: string; table: string; pk: string }> {
  return [...sql.matchAll(FK_CLAUSE)].map((match) => ({
    column: match[1],
    table: match[2],
    pk: match[3],
  }));
}

function identifierHit(sql: string, name: string): boolean {
  const pattern = new RegExp(`(^|[^a-z0-9_])${name}([^a-z0-9_]|$)`, "i");
  return pattern.test(sql);
}

describe("BOS-7 batch_103 schema contract", () => {
  const batch99 = readFileSync(BATCH_99, "utf8");
  const batch100 = readFileSync(BATCH_100, "utf8");
  const batch103 = readFileSync(BATCH_103, "utf8");
  const earlierSql = readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql") && name < "20260819120000")
    .map((name) => readFileSync(resolve(MIGRATIONS_DIR, name), "utf8"))
    .join("\n");
  const earlierTables = createdTables(earlierSql);
  const sameFileTables = createdTables(batch103);
  const fks = foreignKeys(batch103);

  it("keeps canonical opportunity and proposal tables and primary keys from earlier batches", () => {
    expect(createdTables(batch99).has("business_os_growth_opportunities")).toBe(true);
    expect(primaryKeyColumns(batch99, "business_os_growth_opportunities")).toEqual(["id"]);
    expect(createdTables(batch100).has("business_os_revenue_proposals")).toBe(true);
    expect(primaryKeyColumns(batch100, "business_os_revenue_proposals")).toEqual(["id"]);
  });

  it("points work-item opportunity and proposal FKs at those canonical tables", () => {
    expect(fks).toContainEqual({
      column: "linked_opportunity_id",
      table: "business_os_growth_opportunities",
      pk: "id",
    });
    expect(fks).toContainEqual({
      column: "linked_proposal_id",
      table: "business_os_revenue_proposals",
      pk: "id",
    });
    expect(identifierHit(batch103, "business_os_opportunities")).toBe(false);
    expect(identifierHit(batch103, "business_os_proposals")).toBe(false);
  });

  it("references only tables created in earlier migrations or in batch_103 itself", () => {
    const known = new Set([...earlierTables, ...sameFileTables, "tenants", "workspaces", "profiles"]);
    const bosFks = fks.filter((fk) => fk.table.startsWith("business_os_"));
    expect(bosFks.length).toBeGreaterThan(0);
    for (const fk of bosFks) {
      expect(known.has(fk.table), `unknown FK target ${fk.table}`).toBe(true);
      expect(STALE_TABLES).not.toContain(fk.table);
    }
  });

  it("does not reintroduce stale opportunity/proposal table names in batches 104-108", () => {
    for (const file of LATER_BATCHES) {
      const sql = readFileSync(resolve(MIGRATIONS_DIR, file), "utf8");
      for (const stale of STALE_TABLES) {
        expect(identifierHit(sql, stale), `${file} references ${stale}`).toBe(false);
      }
    }
  });
});
