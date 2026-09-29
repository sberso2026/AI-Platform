import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { EngineeringRequirementService } from "./requirement-service";
import { EngineeringChangeService } from "./change-service";
import { EngineeringImpactService, traverseImpactCandidates } from "./impact-service";
import { EngineeringConfigurationService } from "./configuration-service";
import {
  assertChangeTransition,
  assertRequirementType,
  DISCOVERED_DEPENDENCY,
} from "./invariants";

type Row = Record<string, unknown>;

function createStore() {
  return {
    engineering_requirements: [] as Row[],
    engineering_changes: [] as Row[],
    engineering_impacts: [] as Row[],
    engineering_configuration_baselines: [] as Row[],
    engineering_configuration_items: [] as Row[],
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
    const inFilters: Array<[string, unknown[]]> = [];
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
      in: (col: string, vals: unknown[]) => {
        inFilters.push([col, vals]);
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
          tables[table] = (tables[table] ?? []).filter((row) => !eqFilter([row], captured).length);
          resolve({ data: [], error: null, count: 0 });
          return;
        }
        let rows = eqFilter(tables[table] ?? [], captured);
        for (const [col, vals] of inFilters) {
          rows = rows.filter((row) => vals.includes(row[col]));
        }
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

describe("EOS-A4 control intelligence services", () => {
  it("rejects free-text requirement types", () => {
    expect(() => assertRequirementType("nice-to-have")).toThrow(/requirement type/);
  });

  it("creates a requirement, allocates it, and links an assumption with USED_BY", async () => {
    const tables = createStore();
    const requirements = new EngineeringRequirementService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = await requirements.create(ctx, {
      tenantId: "tenant-a",
      title: "Foundation capacity",
      statement: "Foundation shall support equipment load.",
      requirementType: "PERFORMANCE",
      createdBy: "u1",
    });
    expect(created.requirement_code).toMatch(/^REQ-/);
    await requirements.allocate(ctx, "tenant-a", {
      requirementId: created.id as string,
      targetType: "system",
      targetId: "sys-1",
      createdBy: "u1",
    });
    expect(tables.engineering_object_links[0].relationship).toBe("ALLOCATED_TO");
    await requirements.linkAssumption(ctx, "tenant-a", {
      requirementId: created.id as string,
      assumptionId: "asm-1",
      createdBy: "u1",
    });
    expect(tables.engineering_object_links[1].relationship).toBe("USED_BY");
    expect(tables.engineering_object_links[1].from_type).toBe("assumption");
  });

  it("enforces change status transitions and AFFECTS links", async () => {
    const tables = createStore();
    const changes = new EngineeringChangeService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = await changes.create(ctx, {
      tenantId: "tenant-a",
      title: "Revise bearing",
      changeType: "DESIGN",
      createdBy: "u1",
    });
    expect(() => assertChangeTransition("proposed", "verified")).toThrow(/Illegal change status/);
    await changes.update(ctx, "tenant-a", created.id as string, { status: "assessing" }, "u1");
    await changes.linkAffected(ctx, "tenant-a", {
      changeId: created.id as string,
      targetType: "requirement",
      targetId: "req-1",
      createdBy: "u1",
    });
    expect(tables.engineering_object_links[0].relationship).toBe("AFFECTS");
  });

  it("keeps impact candidate distinct from confirmed impact and records CAUSED_BY", async () => {
    const tables = createStore();
    const impacts = new EngineeringImpactService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = await impacts.create(ctx, {
      tenantId: "tenant-a",
      title: "Bearing check required",
      impactType: "TECHNICAL",
      createdBy: "u1",
    });
    expect(created.status).toBe("candidate");
    await impacts.linkCause(ctx, "tenant-a", {
      impactId: created.id as string,
      changeId: "chg-1",
      createdBy: "u1",
    });
    expect(tables.engineering_object_links[0].relationship).toBe("CAUSED_BY");
    const confirmed = await impacts.confirm(ctx, "tenant-a", created.id as string, "u1");
    expect(confirmed.status).toBe("confirmed");
  });

  it("traverses bounded impact candidates without auto-confirming", () => {
    const links = [
      { relationship: "AFFECTS", from_type: "change", from_id: "chg-1", to_type: "requirement", to_id: "req-1" },
      { relationship: "ALLOCATED_TO", from_type: "requirement", from_id: "req-1", to_type: "system", to_id: "sys-1" },
      { relationship: "CONTAINS", from_type: "system", from_id: "sys-1", to_type: "asset", to_id: "a-1" },
      { relationship: "SELECTS", from_type: "decision", from_id: "dec-1", to_type: "alternative", to_id: "alt-1" },
    ];
    const candidates = traverseImpactCandidates(links, { type: "change", id: "chg-1" });
    expect(candidates.every((c) => c.kind === DISCOVERED_DEPENDENCY)).toBe(true);
    expect(candidates.map((c) => c.objectId)).toEqual(["req-1", "sys-1", "a-1"]);
    expect(candidates.find((c) => c.objectId === "alt-1")).toBeUndefined();
  });

  it("freezes a baseline and refuses mutation after freeze", async () => {
    const tables = createStore();
    const config = new EngineeringConfigurationService(mockSupabase(tables) as never);
    const ctx = commerce();
    const created = await config.create(ctx, {
      tenantId: "tenant-a",
      name: "FEED B2",
      baselineType: "FEED",
      createdBy: "u1",
    });
    await config.addItem(ctx, "tenant-a", {
      baselineId: created.id as string,
      objectType: "document",
      objectId: "doc-1",
      revisionRef: "C",
      objectCodeSnapshot: "PFD-001",
      capturedBy: "u1",
    });
    const frozen = await config.freeze(ctx, "tenant-a", created.id as string, "u1");
    expect(frozen.status).toBe("frozen");
    await expect(
      config.addItem(ctx, "tenant-a", {
        baselineId: created.id as string,
        objectType: "document",
        objectId: "doc-2",
        capturedBy: "u1",
      }),
    ).rejects.toThrow(/immutable/);
  });
});
