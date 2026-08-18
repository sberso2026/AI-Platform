import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = resolve(
  import.meta.dirname,
  "../../../../supabase/migrations/20260818140000_batch_100_business_os_revenue_execution.sql",
);

describe("BOS-4 revenue migration", () => {
  const sql = readFileSync(MIGRATION, "utf8");

  it("creates engagement, proposal, and pricing tables with RLS and no send tables", () => {
    for (const table of [
      "business_os_revenue_engagement_plans",
      "business_os_revenue_communication_drafts",
      "business_os_revenue_proposals",
      "business_os_revenue_proposal_requirements",
      "business_os_revenue_pricing_scenarios",
      "business_os_revenue_bid_evaluations",
      "business_os_revenue_settings",
    ]) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
    expect(sql).toContain("proposed_price_minor bigint");
    expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("FORCE ROW LEVEL SECURITY");
    expect(sql).toContain("get_user_tenant_ids()");
    expect(sql).toContain("workspace_memberships");
    expect(sql).toContain("bos_revenue_requirement_satisfied_needs_evidence");
    expect(sql.toLowerCase()).not.toContain("create table if not exists outbound_messages");
    expect(sql.toLowerCase()).not.toContain("create table if not exists payments");
    expect(sql.toLowerCase()).not.toContain("smtp");
  });
});
