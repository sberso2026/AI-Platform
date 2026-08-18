import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260818000000_batch_97_business_os_owner_command.sql",
);

const FORBIDDEN = [
  "customers",
  "leads",
  "opportunities",
  "invoices",
  "ledger",
  "suppliers",
  "employees",
  "proposals",
  "pricing",
];

describe("BOS-1 owner command migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates only shared management primitives with tenant and workspace isolation", () => {
    for (const table of [
      "business_os_kpis",
      "business_os_signals",
      "business_os_recommendations",
      "business_os_decisions",
      "business_os_actions",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
      expect(sql).toContain("tenant_id uuid NOT NULL REFERENCES tenants(id)");
      expect(sql).toContain("workspace_id uuid NOT NULL REFERENCES workspaces(id)");
    }
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql).toContain("idx_bos_kpis_scope_status");
    expect(sql).toContain("idx_bos_signals_attention");
    expect(sql).toContain("EXECUTE FUNCTION update_updated_at()");
  });

  it("does not create finance, CRM, or workforce domain tables", () => {
    const lowered = sql.toLowerCase();
    for (const name of FORBIDDEN) {
      expect(lowered).not.toContain(`create table if not exists ${name}`);
      expect(lowered).not.toContain(`create table ${name}`);
    }
  });
});
