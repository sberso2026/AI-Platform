import { describe, expect, it } from "vitest";
import type { SupabaseClient } from "@rtb/database";
import { createPlatformKernel } from "@rtb/platform-kernel";
import { AuditService } from "@rtb/platform-core";
import { loadCanonicalRecords } from "./catalog";
import { BusinessContextGraphService } from "./service";
import { createMemoryGraphPort } from "./graph-port";
import { STALE_BOS_CATALOG_TABLE_NAMES } from "./catalog";

const SCOPE = {
  tenantId: "11111111-1111-4111-8111-111111111111",
  workspaceId: "22222222-2222-4222-8222-222222222222",
  userId: "33333333-3333-4333-8333-333333333333",
};

type TableSpec = { error?: boolean; rows?: Record<string, unknown>[] };

function fakeSupabase(tables: Record<string, TableSpec>, seen: string[] = []) {
  return {
    from(table: string) {
      seen.push(table);
      const spec = tables[table];
      const result = spec?.error
        ? { data: null, error: { message: "missing" } }
        : { data: spec?.rows ?? [], error: null };
      const builder = {
        select() {
          return builder;
        },
        eq(column: string, value: string) {
          expect(["tenant_id", "workspace_id"]).toContain(column);
          if (column === "tenant_id") expect(value).toBe(SCOPE.tenantId);
          if (column === "workspace_id") expect(value).toBe(SCOPE.workspaceId);
          return builder;
        },
        then(resolve: (value: typeof result) => unknown) {
          return Promise.resolve(result).then(resolve);
        },
      };
      return builder;
    },
  } as unknown as SupabaseClient;
}

const CANONICAL_FIXTURES: Record<string, TableSpec> = {
  business_os_customers: {
    rows: [{ id: "cust-1", organisation_name: "Acme", source_type: "manual", source_ref: "c1", updated_at: "2026-08-19T00:00:00.000Z" }],
  },
  business_os_customer_contacts: {
    rows: [
      {
        id: "con-suppressed",
        full_name: "Hidden Person",
        customer_id: "cust-1",
        source_type: "manual",
        suppressed: true,
        updated_at: "2026-08-19T00:00:00.000Z",
      },
    ],
  },
  business_os_growth_leads: {
    rows: [
      {
        id: "lead-1",
        organisation_name: "Lead Co",
        contact_name: "Pat",
        source_type: "manual",
        suppressed: false,
        deleted_at: null,
        updated_at: "2026-08-19T00:00:00.000Z",
      },
      {
        id: "lead-deleted",
        organisation_name: "Gone Co",
        source_type: "manual",
        suppressed: false,
        deleted_at: "2026-08-01T00:00:00.000Z",
        updated_at: "2026-08-01T00:00:00.000Z",
      },
    ],
  },
  business_os_growth_market_segments: {
    rows: [{ id: "seg-1", segment_name: "Infrastructure", source_type: "manual", updated_at: "2026-08-19T00:00:00.000Z" }],
  },
  business_os_growth_opportunities: {
    rows: [{ id: "opp-1", name: "Bridge bid", opportunity_id: "opp-1", source_type: "manual", updated_at: "2026-08-19T00:00:00.000Z" }],
  },
  business_os_revenue_proposals: {
    rows: [
      {
        id: "prop-1",
        title: "Bridge proposal",
        proposal_number: "P-1",
        opportunity_id: "opp-1",
        source_type: "manual",
        updated_at: "2026-08-19T00:00:00.000Z",
      },
    ],
  },
  business_os_work_items: {
    rows: [{ id: "work-1", name: "Delivery", reference: "W-1", customer_id: "cust-1", source_type: "manual", source_ref: "w1", updated_at: "2026-08-19T00:00:00.000Z" }],
  },
  business_os_profit_facts: {
    rows: [
      {
        id: "pf-1",
        dimension_type: "work",
        dimension_id: "work-1",
        dimension_name: "Delivery margin",
        source_type: "manual",
        source_ref: "pf1",
        updated_at: "2026-08-19T00:00:00.000Z",
      },
    ],
  },
  business_os_risks: {
    rows: [{ id: "risk-1", title: "Delay", reference: "R-1", source_type: "manual", source_ref: "r1", updated_at: "2026-08-19T00:00:00.000Z" }],
  },
  business_os_decisions: {
    rows: [{ id: "dec-1", statement: "Approve crew", source_type: "manual", source_ref: "d1", updated_at: "2026-08-19T00:00:00.000Z" }],
  },
  business_os_actions: {
    rows: [{ id: "act-1", title: "Brief crew", decision_id: "dec-1", source_type: "manual", source_ref: "a1", updated_at: "2026-08-19T00:00:00.000Z" }],
  },
};

describe("BOS-10 catalog canonical lookup and projection", () => {
  it("loads canonical tables, scopes by tenant/workspace, and does not query stale names", async () => {
    const seen: string[] = [];
    const supabase = fakeSupabase(CANONICAL_FIXTURES, seen);
    const { records, missingDomains } = await loadCanonicalRecords(supabase, SCOPE);
    expect(seen.some((name) => (STALE_BOS_CATALOG_TABLE_NAMES as readonly string[]).includes(name))).toBe(false);
    expect(seen).toContain("business_os_growth_leads");
    expect(seen).toContain("business_os_growth_market_segments");
    expect(seen).toContain("business_os_growth_opportunities");
    expect(seen).toContain("business_os_revenue_proposals");
    expect(missingDomains).toEqual([]);
    const types = new Set(records.map((row) => row.identity.entityType));
    expect(types.has("lead")).toBe(true);
    expect(types.has("market_segment")).toBe(true);
    expect(types.has("opportunity")).toBe(true);
    expect(types.has("proposal")).toBe(true);
    expect(types.has("customer")).toBe(true);
    expect(types.has("work")).toBe(true);
    expect(types.has("profit_fact")).toBe(true);
    expect(types.has("risk")).toBe(true);
    expect(types.has("decision")).toBe(true);
    expect(types.has("action")).toBe(true);
    expect(records.find((row) => row.identity.entityType === "market_segment")?.identity.displayName).toBe(
      "Infrastructure",
    );
    expect(records.every((row) => row.identity.tenantId === SCOPE.tenantId)).toBe(true);
    expect(records.every((row) => row.identity.workspaceId === SCOPE.workspaceId)).toBe(true);
  });

  it("treats missing canonical sources as missing rather than fabricating rows", async () => {
    const supabase = fakeSupabase({
      business_os_growth_leads: { error: true },
      business_os_customers: { rows: [{ id: "cust-1", organisation_name: "Acme", source_type: "manual" }] },
    });
    const { records, missingDomains } = await loadCanonicalRecords(supabase, SCOPE);
    expect(missingDomains).toContain("growth");
    expect(records.some((row) => row.identity.entityType === "lead")).toBe(false);
    expect(records.some((row) => row.identity.entityType === "customer")).toBe(true);
  });

  it("projects catalog records through the Kernel graph port without mutating source domains", async () => {
    const graph = createMemoryGraphPort();
    const service = new BusinessContextGraphService(
      fakeSupabase(CANONICAL_FIXTURES),
      createPlatformKernel({} as SupabaseClient),
      new AuditService({} as SupabaseClient),
      graph,
    );
    const loaded = await loadCanonicalRecords(fakeSupabase(CANONICAL_FIXTURES), SCOPE);
    const first = await service.applyRecords(SCOPE, loaded.records);
    const second = await service.applyRecords(SCOPE, loaded.records);
    expect(first.nodesProjected).toBe(second.nodesProjected);
    expect(graph.snapshot.nodes.every((node) => node.tenant_id === SCOPE.tenantId)).toBe(true);
    expect(graph.snapshot.nodes.every((node) => node.workspace_id === SCOPE.workspaceId)).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.lead")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.market_segment")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.opportunity")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.proposal")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.customer")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.profit_fact")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.work")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.risk")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.decision")).toBe(true);
    expect(graph.snapshot.nodes.some((node) => node.node_type === "bos.action")).toBe(true);
    expect(JSON.stringify(graph.snapshot.nodes)).not.toContain("Hidden Person");
    expect(JSON.stringify(graph.snapshot.nodes)).not.toContain("Gone Co");
    expect(() => service.mutateSourceDomain()).toThrow("source_domain_mutation_forbidden");
    expect(() => service.executeRawGraphQuery()).toThrow("unrestricted_graph_query_forbidden");
  });
});
