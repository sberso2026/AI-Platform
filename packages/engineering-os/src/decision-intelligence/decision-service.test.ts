import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { EngineeringDecisionService } from "../services/register-services";
import { EngineeringAssumptionService } from "./assumption-service";

type Row = Record<string, unknown>;

function createStore() {
  const tables: Record<string, Row[]> = {
    engineering_decisions: [],
    engineering_decision_alternatives: [],
    engineering_decision_approvals: [],
    engineering_assumptions: [],
    engineering_object_links: [],
    engineering_timeline_events: [],
    engineering_activity_events: [],
    engineering_audit_links: [],
    engineering_object_comments: [],
  };
  return tables;
}

function eqFilter(rows: Row[], captured: Array<[string, unknown]>) {
  return rows.filter((row) => captured.every(([col, val]) => row[col] === val));
}

function mockSupabase(tables: Record<string, Row[]>) {
  const from = (table: string) => {
    const captured: Array<[string, unknown]> = [];
    const state: { patch?: Row; insertRow?: Row } = {};
    const query = {
      select: () => query,
      insert: (row: Row) => {
        const created = { id: row.id ?? `${table}-${tables[table].length + 1}`, ...row };
        state.insertRow = created;
        return query;
      },
      update: (row: Row) => {
        state.patch = row;
        return query;
      },
      upsert: (row: Row) => {
        state.insertRow = { id: row.id ?? `${table}-link-${tables[table].length + 1}`, ...row };
        return query;
      },
      eq: (col: string, val: unknown) => {
        captured.push([col, val]);
        return query;
      },
      order: () => query,
      limit: () => query,
      or: () => query,
      maybeSingle: () => {
        const rows = eqFilter(tables[table] ?? [], captured);
        return Promise.resolve({ data: rows[0] ?? null, error: null });
      },
      single: () => {
        if (state.insertRow) {
          tables[table].push(state.insertRow);
          return Promise.resolve({ data: state.insertRow, error: null });
        }
        const rows = eqFilter(tables[table] ?? [], captured);
        if (state.patch && rows[0]) {
          Object.assign(rows[0], state.patch);
          return Promise.resolve({ data: rows[0], error: null });
        }
        return Promise.resolve({
          data: rows[0] ?? null,
          error: rows[0] ? null : { message: "not found" },
        });
      },
      then: (resolve: (value: { data: Row[]; error: null }) => void) => {
        resolve({ data: eqFilter(tables[table] ?? [], captured), error: null });
      },
    };
    return query;
  };
  return { from };
}

const commerce = createTestCommerceExecutionContext({
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  policy: {
    productKey: "engineering-os",
    applicationKey: "project_intelligence",
    action: "decision.write",
    seatRequired: true,
  },
});

const readCommerce = createTestCommerceExecutionContext({
  tenantId: "tenant-a",
  workspaceId: "workspace-a",
  policy: {
    productKey: "engineering-os",
    applicationKey: "project_intelligence",
    action: "decision.read",
    seatRequired: true,
  },
});

describe("EOS-A2 decision service", () => {
  it("creates a decision, identifiable alternative, selects it, and records human approval", async () => {
    const tables = createStore();
    const service = new EngineeringDecisionService(mockSupabase(tables) as never);
    const created = await service.create(commerce, {
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      title: "Select crusher duty",
      decisionQuestion: "Single or dual toggle?",
      rationale: "Throughput vs capex",
      createdBy: "user-a",
    });
    expect(created.decision_number).toMatch(/^DEC-/);
    expect(created.decision_question).toBe("Single or dual toggle?");

    tables.engineering_decisions[0] = created as Row;
    const alt = await service.createAlternative(commerce, {
      tenantId: "tenant-a",
      decisionId: created.id as string,
      name: "Single toggle",
      createdBy: "user-a",
    });
    const selected = await service.selectAlternative(
      commerce,
      "tenant-a",
      created.id as string,
      alt.id as string,
      "user-a",
    );
    expect(selected.selected_alternative_id).toBe(alt.id);

    const approval = await service.recordApproval(commerce, "tenant-a", created.id as string, {
      action: "approved",
      actorId: "user-a",
      comments: "Approved by lead engineer",
    });
    expect(approval.approval.actor_kind).toBe("human");
    expect(approval.decision.approval_status).toBe("approved");
    expect(tables.engineering_decision_approvals).toHaveLength(1);
  });

  it("rejects AI approval actors", async () => {
    const tables = createStore();
    tables.engineering_decisions.push({
      id: "dec-1",
      tenant_id: "tenant-a",
      workspace_id: "workspace-a",
      title: "X",
      decision_number: "DEC-0001",
    });
    const service = new EngineeringDecisionService(mockSupabase(tables) as never);
    await expect(
      service.recordApproval(commerce, "tenant-a", "dec-1", {
        action: "approved",
        actorId: "",
      }),
    ).rejects.toThrow(/authorized human actor/);
  });

  it("does not return another tenant's decision", async () => {
    const tables = createStore();
    tables.engineering_decisions.push({
      id: "dec-b",
      tenant_id: "tenant-b",
      workspace_id: "workspace-b",
      title: "Secret",
      decision_number: "DEC-9999",
    });
    const service = new EngineeringDecisionService(mockSupabase(tables) as never);
    const got = await service.get(readCommerce, "tenant-a", "dec-b");
    expect(got).toBeNull();
  });
});

describe("EOS-A2 assumption service", () => {
  it("creates, validates, and links an assumption with a governed relation", async () => {
    const tables = createStore();
    tables.engineering_decisions.push({
      id: "dec-1",
      tenant_id: "tenant-a",
      workspace_id: "workspace-a",
      title: "Duty",
    });
    const service = new EngineeringAssumptionService(mockSupabase(tables) as never);
    const created = await service.create(commerce, {
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
      title: "Ore UCS",
      statement: "P50 UCS is 120 MPa",
      materiality: "high",
      confidence: 0.6,
      createdBy: "user-a",
    });
    expect(created.assumption_number).toMatch(/^ASM-/);
    expect(created.validation_status).toBe("unvalidated");
    const validated = await service.setValidation(commerce, "tenant-a", created.id as string, "validated", "user-a");
    expect(validated.validation_status).toBe("validated");
    await service.link(commerce, {
      tenantId: "tenant-a",
      assumptionId: created.id as string,
      toType: "decision",
      toId: "dec-1",
      relationship: "BASED_ON",
      createdBy: "user-a",
    });
    expect(tables.engineering_object_links[0].relationship).toBe("BASED_ON");
    expect(tables.engineering_object_links[0].relationship_governed).toBe(true);
  });

  it("scopes list to commerce workspace", async () => {
    const tables = createStore();
    tables.engineering_assumptions.push(
      {
        id: "a1",
        tenant_id: "tenant-a",
        workspace_id: "workspace-a",
        title: "Mine",
        updated_at: "2026-01-02",
      },
      {
        id: "a2",
        tenant_id: "tenant-a",
        workspace_id: "workspace-b",
        title: "Other",
        updated_at: "2026-01-02",
      },
    );
    const service = new EngineeringAssumptionService(mockSupabase(tables) as never);
    const rows = await service.list(readCommerce, "tenant-a");
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("a1");
  });
});
