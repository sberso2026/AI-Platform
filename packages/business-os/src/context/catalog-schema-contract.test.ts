import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  BUSINESS_CONTEXT_CATALOG_SOURCES,
  STALE_BOS_CATALOG_TABLE_NAMES,
  assertBusinessContextCatalogUniqueness,
} from "./catalog";
import { NODE_TYPE_DOMAIN } from "./ontology";
import { BUSINESS_CONTEXT_GRAPH_CONTRACT } from "./extensions";
import { duplicateKnowledgeGraphDetected, implementsOwnAiStack } from "../version";
import type { BusinessCapabilityId, BusinessContextSourceDomain } from "@rtb/types";

const MIGRATIONS_DIR = resolve(import.meta.dirname, "../../../../supabase/migrations");
const BOS_MIGRATION_PREFIXES = [
  "20260818000000_batch_97_",
  "20260818120000_batch_98_",
  "20260818130000_batch_99_",
  "20260818140000_batch_100_",
  "20260819100000_batch_101_",
  "20260819110000_batch_102_",
  "20260819120000_batch_103_",
  "20260819130000_batch_104_",
  "20260819140000_batch_105_",
  "20260819150000_batch_106_",
  "20260819160000_batch_107_",
  "20260819170000_batch_108_",
] as const;

const CREATE_TABLE = /CREATE TABLE IF NOT EXISTS\s+([a-z0-9_]+)/gi;

const EXPECTED_DOMAIN: Record<string, BusinessContextSourceDomain> = {
  customers: "customer",
  contacts: "customer",
  leads: "growth",
  opportunities: "growth",
  proposals: "revenue",
  work: "operations",
  profit: "profit",
  financial: "customer",
  segments: "growth",
  risks: "risk",
  controls: "risk",
  controlLinks: "risk",
  obligations: "risk",
  decisions: "decision",
  evidenceRows: "decision",
  actions: "decision",
  signals: "owner_command",
  recommendations: "owner_command",
  kpis: "owner_command",
};

const EXPECTED_CAPABILITY: Record<string, BusinessCapabilityId> = {
  customers: "customer_intelligence",
  contacts: "customer_intelligence",
  leads: "growth_intelligence",
  opportunities: "growth_intelligence",
  proposals: "revenue_execution",
  work: "work_operations",
  profit: "profit_intelligence",
  financial: "customer_intelligence",
  segments: "growth_intelligence",
  risks: "business_risk",
  controls: "business_risk",
  controlLinks: "business_risk",
  obligations: "business_risk",
  decisions: "decision_action",
  evidenceRows: "decision_action",
  actions: "decision_action",
  signals: "owner_command",
  recommendations: "owner_command",
  kpis: "owner_command",
};

function createdTables(sql: string): Set<string> {
  const names = new Set<string>();
  for (const match of sql.matchAll(CREATE_TABLE)) names.add(match[1]);
  return names;
}

describe("BOS-10 context catalog schema contract", () => {
  const bosFiles = readdirSync(MIGRATIONS_DIR).filter((name) =>
    BOS_MIGRATION_PREFIXES.some((prefix) => name.startsWith(prefix)),
  );
  const tableOwner = new Map<string, string>();
  const bosSql = bosFiles
    .map((name) => {
      const sql = readFileSync(resolve(MIGRATIONS_DIR, name), "utf8");
      for (const table of createdTables(sql)) {
        if (!tableOwner.has(table)) tableOwner.set(table, name);
      }
      return sql;
    })
    .join("\n");
  const catalogSource = readFileSync(resolve(import.meta.dirname, "catalog.ts"), "utf8");

  it("rejects duplicate catalog keys and tables", () => {
    expect(() => assertBusinessContextCatalogUniqueness()).not.toThrow();
    expect(() =>
      assertBusinessContextCatalogUniqueness([
        BUSINESS_CONTEXT_CATALOG_SOURCES[0],
        BUSINESS_CONTEXT_CATALOG_SOURCES[0],
      ]),
    ).toThrow(/duplicate_catalog_key/);
    expect(() =>
      assertBusinessContextCatalogUniqueness([
        { ...BUSINESS_CONTEXT_CATALOG_SOURCES[0], key: "other" },
        BUSINESS_CONTEXT_CATALOG_SOURCES[0],
      ]),
    ).toThrow(/duplicate_catalog_table/);
  });

  it("maps every catalog table to a canonical BOS 97-108 table with id PK", () => {
    expect(bosFiles).toHaveLength(BOS_MIGRATION_PREFIXES.length);
    expect(BUSINESS_CONTEXT_CATALOG_SOURCES.length).toBeGreaterThan(10);
    for (const source of BUSINESS_CONTEXT_CATALOG_SOURCES) {
      expect(tableOwner.has(source.table), `missing canonical table ${source.table}`).toBe(true);
      const ownerSql = readFileSync(resolve(MIGRATIONS_DIR, tableOwner.get(source.table)!), "utf8");
      const pk = new RegExp(
        `CREATE TABLE IF NOT EXISTS\\s+${source.table}\\s*\\(\\s*id uuid PRIMARY KEY`,
        "i",
      );
      expect(pk.test(ownerSql), `${source.table} must use id uuid PRIMARY KEY`).toBe(true);
    }
  });

  it("keeps domain and capability ownership aligned and does not reintroduce stale identifiers", () => {
    expect(Object.keys(EXPECTED_DOMAIN).sort()).toEqual(
      [...BUSINESS_CONTEXT_CATALOG_SOURCES.map((source) => source.key)].sort(),
    );
    for (const source of BUSINESS_CONTEXT_CATALOG_SOURCES) {
      expect(source.domain).toBe(EXPECTED_DOMAIN[source.key]);
      expect(source.capability).toBe(EXPECTED_CAPABILITY[source.key]);
    }
    expect(NODE_TYPE_DOMAIN.lead).toBe("growth");
    expect(NODE_TYPE_DOMAIN.opportunity).toBe("growth");
    expect(NODE_TYPE_DOMAIN.proposal).toBe("revenue");
    expect(NODE_TYPE_DOMAIN.market_segment).toBe("growth");
    const activeTables = BUSINESS_CONTEXT_CATALOG_SOURCES.map((source) => source.table);
    for (const stale of STALE_BOS_CATALOG_TABLE_NAMES) {
      expect(activeTables).not.toContain(stale);
      expect(catalogSource).not.toMatch(new RegExp(`table:\\s*["']${stale}["']`));
      expect(bosSql).not.toMatch(new RegExp(`(^|[^a-z0-9_])${stale}([^a-z0-9_]|$)`, "m"));
    }
  });

  it("does not introduce a second graph or catalog stack", () => {
    expect(implementsOwnAiStack).toBe(false);
    expect(duplicateKnowledgeGraphDetected).toBe(false);
    expect(BUSINESS_CONTEXT_GRAPH_CONTRACT.noSecondGraphRuntime).toBe(true);
    expect(BUSINESS_CONTEXT_GRAPH_CONTRACT.reuses).toContain("platform_kernel_knowledge_graph");
    expect(bosSql.toLowerCase()).not.toContain("create table if not exists business_os_graph_nodes");
  });
});
