import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { EngineeringSystemService } from "./system-service";
import { EngineeringInterfaceService } from "./interface-service";

type Row = Record<string, unknown>;

function createStore() {
  return {
    engineering_systems: [] as Row[],
    engineering_interfaces: [] as Row[],
    engineering_object_links: [] as Row[],
    engineering_timeline_events: [] as Row[],
    engineering_activity_events: [] as Row[],
    engineering_audit_links: [] as Row[],
  };
}

function eqFilter(rows: Row[], captured: Array<[string, unknown]>) {
  return rows.filter((row) => captured.every(([col, val]) => row[col] === val));
}

function mockSupabase(tables: Record<string, Row[]>) {
  const from = (table: string) => {
    const captured: Array<[string, unknown]> = [];
    const state: { patch?: Row; insertRow?: Row; deleting?: boolean } = {};
    const query = {
      select: () => query,
      insert: (row: Row) => {
        state.insertRow = { id: row.id ?? `${table}-${(tables[table] ?? []).length + 1}`, ...row };
        return query;
      },
      update: (row: Row) => {
        state.patch = row;
        return query;
      },
      upsert: (row: Row) => {
        state.insertRow = { id: row.id ?? `${table}-link-${(tables[table] ?? []).length + 1}`, ...row };
        return query;
      },
      delete: () => {
        state.deleting = true;
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
          tables[table] = tables[table] ?? [];
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
      then: (resolve: (value: { data: Row[]; error: null; count: number }) => void) => {
        if (state.deleting) {
          tables[table] = eqFilter(tables[table] ?? [], []).filter(
            (row) => !eqFilter([row], captured).length,
          );
          resolve({ data: [], error: null, count: 0 });
          return;
        }
        const rows = eqFilter(tables[table] ?? [], captured);
        resolve({ data: rows, error: null, count: rows.length });
      },
    };
    return query;
  };
  return { from };
}

function commerce(workspaceId = "ws-a") {
  return createTestCommerceExecutionContext({
    tenantId: "tenant-a",
    workspaceId,
    policy: {
      productKey: "engineering-os",
      applicationKey: "project_intelligence",
      action: "asset.write",
      seatRequired: true,
    },
  });
}

describe("EOS-A3 system and interface services", () => {
  it("creates a system in workspace scope and links an asset with CONTAINS", async () => {
    const tables = createStore();
    const systems = new EngineeringSystemService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = await systems.create(ctx, { tenantId: "tenant-a", name: "Primary Crushing", createdBy: "u1" });
    expect(created.system_code).toMatch(/^SYS-/);
    expect(created.workspace_id).toBe("ws-a");
    await systems.linkAsset(ctx, "tenant-a", { systemId: created.id as string, assetId: "asset-1", createdBy: "u1" });
    expect(tables.engineering_object_links[0].relationship).toBe("CONTAINS");
    expect(tables.engineering_object_links[0].relationship_governed).toBe(true);
  });

  it("creates an interface and CONNECTS two endpoints", async () => {
    const tables = createStore();
    const ifaces = new EngineeringInterfaceService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = await ifaces.create(ctx, {
      tenantId: "tenant-a",
      name: "Pump discharge",
      interfaceType: "PIPING",
      createdBy: "u1",
    });
    expect(created.status).toBe("identified");
    await ifaces.addEndpoint(ctx, "tenant-a", {
      interfaceId: created.id as string,
      objectType: "asset",
      objectId: "p-101",
      createdBy: "u1",
    });
    await ifaces.addEndpoint(ctx, "tenant-a", {
      interfaceId: created.id as string,
      objectType: "system",
      objectId: "sys-1",
      createdBy: "u1",
    });
    expect(tables.engineering_object_links).toHaveLength(2);
    expect(tables.engineering_object_links.every((row) => row.relationship === "CONNECTS")).toBe(true);
  });

  it("rejects verified status without two endpoints", async () => {
    const tables = createStore();
    const ifaces = new EngineeringInterfaceService(mockSupabase(tables) as never);
    const ctx = commerce();
    await expect(
      ifaces.create(ctx, {
        tenantId: "tenant-a",
        name: "Too early",
        interfaceType: "PHYSICAL",
        status: "verified",
      }),
    ).rejects.toThrow(/at least two endpoints/);
  });
});
