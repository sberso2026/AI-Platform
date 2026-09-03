import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { EngineeringDashboardService } from "./supporting-services";
import { EngineeringProjectService } from "./core-services";

type Row = { id: string; tenant_id: string; workspace_id: string; [key: string]: unknown };

function mockSupabase(rows: Row[]) {
  const captured: Array<[string, string]> = [];
  const query: {
    select: () => unknown;
    eq: (col: string, val: string) => unknown;
    order: () => unknown;
    limit: () => unknown;
    or: () => unknown;
    single: () => unknown;
    update: () => unknown;
    then: (resolve: (value: { data: Row[]; error: null }) => void) => void;
  } = {
    select: () => query,
    eq: (col: string, val: string) => {
      captured.push([col, val]);
      return query;
    },
    order: () => query,
    limit: () => query,
    or: () => query,
    single: () => ({
      then: (resolve: (value: { data: Row | null; error: { message: string } | null }) => void) => {
        const tenant = captured.find(([col]) => col === "tenant_id")?.[1];
        const workspace = captured.find(([col]) => col === "workspace_id")?.[1];
        let data = rows.filter((row) => row.tenant_id === tenant);
        if (workspace) data = data.filter((row) => row.workspace_id === workspace);
        resolve({
          data: data[0] ?? null,
          error: data[0] ? null : { message: "not found" },
        });
      },
    }),
    then: (resolve) => {
      const tenant = captured.find(([col]) => col === "tenant_id")?.[1];
      const workspace = captured.find(([col]) => col === "workspace_id")?.[1];
      let data = rows.filter((row) => row.tenant_id === tenant);
      if (workspace) data = data.filter((row) => row.workspace_id === workspace);
      resolve({ data, error: null });
    },
    update: () => query,
  };
  return {
    captured,
    client: {
      from: () => query,
    },
  };
}

const tenant = "tenant-a";
const rows: Row[] = [
  {
    id: "proj-a",
    tenant_id: tenant,
    workspace_id: "workspace-a",
    project_code: "PI-A",
    project_name: "Workspace A Project",
    project_phase: "concept",
    status: "active",
    metadata: {},
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "proj-cert",
    tenant_id: tenant,
    workspace_id: "workspace-a",
    project_code: "WSB-1RC",
    project_name: "Workspace B Isolation",
    project_phase: "concept",
    status: "draft",
    metadata: { certification_fixture: true, hidden_from_pilot_ui: true },
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "proj-b",
    tenant_id: tenant,
    workspace_id: "workspace-b",
    project_code: "PI-B",
    project_name: "Workspace B Project",
    project_phase: "concept",
    status: "active",
    metadata: {},
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
];

function projectPolicy() {
  return {
    productKey: "engineering-os",
    applicationKey: "project_intelligence",
    action: "project.read",
    seatRequired: true,
  };
}

describe("project list workspace scope", () => {
  it("does not return workspace-B project ids or titles to a workspace-A engineer", async () => {
    const { captured, client } = mockSupabase(rows);
    const service = new EngineeringProjectService(client as never);
    const engineerA = createTestCommerceExecutionContext({
      tenantId: tenant,
      workspaceId: "workspace-a",
      policy: projectPolicy(),
    });
    const listed = await service.list(engineerA, tenant);
    expect(captured).toContainEqual(["workspace_id", "workspace-a"]);
    expect(listed.map((p) => p.id)).toEqual(["proj-a"]);
    expect(listed.map((p) => p.project_code)).not.toContain("PI-B");
    expect(listed.map((p) => p.project_name)).not.toContain("Workspace B Project");
    expect(listed.map((p) => p.project_code)).not.toContain("WSB-1RC");
  });

  it("omits certification fixtures from the customer project list in the same workspace", async () => {
    const { client } = mockSupabase(rows);
    const service = new EngineeringProjectService(client as never);
    const engineerA = createTestCommerceExecutionContext({
      tenantId: tenant,
      workspaceId: "workspace-a",
      policy: projectPolicy(),
    });
    const listed = await service.list(engineerA, tenant);
    expect(listed.map((p) => p.id)).toEqual(["proj-a"]);
    expect(listed.map((p) => p.project_name)).not.toContain("Workspace B Isolation");
  });

  it("scopes project metadata updates to the active workspace", async () => {
    const { captured, client } = mockSupabase(rows);
    const service = new EngineeringProjectService(client as never);
    const engineerA = createTestCommerceExecutionContext({
      tenantId: tenant,
      workspaceId: "workspace-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "project.create",
        seatRequired: true,
      },
    });
    await service.update(engineerA, tenant, "proj-a", { clientName: "RTB Engineering" });
    expect(captured).toContainEqual(["workspace_id", "workspace-a"]);
    expect(captured).not.toContainEqual(["workspace_id", "workspace-b"]);
  });

  it("does not return workspace-A project ids or titles to a workspace-B engineer", async () => {
    const { client } = mockSupabase(rows);
    const service = new EngineeringProjectService(client as never);
    const engineerB = createTestCommerceExecutionContext({
      tenantId: tenant,
      workspaceId: "workspace-b",
      policy: projectPolicy(),
    });
    const listed = await service.list(engineerB, tenant);
    expect(listed.map((p) => p.id)).toEqual(["proj-b"]);
    expect(listed.map((p) => p.project_code)).not.toContain("PI-A");
  });

  it("returns no projects when commerce has no workspace (no tenant-wide fallback)", async () => {
    const { captured, client } = mockSupabase(rows);
    const service = new EngineeringProjectService(client as never);
    const unscoped = createTestCommerceExecutionContext({
      tenantId: tenant,
      policy: projectPolicy(),
    });
    const listed = await service.list(unscoped, tenant);
    expect(listed).toEqual([]);
    expect(captured.some(([col]) => col === "workspace_id")).toBe(false);
  });
});

describe("dashboard workspace scope", () => {
  it("scopes attention project counts to the active workspace", async () => {
    const emptyQuery = {
      select: () => emptyQuery,
      eq: () => emptyQuery,
      order: () => emptyQuery,
      limit: () => emptyQuery,
      then: (resolve: (value: { data: unknown[]; error: null }) => void) =>
        resolve({ data: [], error: null }),
    };
    const { client } = mockSupabase(rows);
    const supabase = {
      from: (table: string) => (table === "engineering_projects" ? client.from() : emptyQuery),
    };
    const dashboard = new EngineeringDashboardService(
      {
        list: (
          commerce: Parameters<EngineeringProjectService["list"]>[0],
          tenantId: Parameters<EngineeringProjectService["list"]>[1],
          limit: Parameters<EngineeringProjectService["list"]>[2],
          options: Parameters<EngineeringProjectService["list"]>[3],
        ) =>
          new EngineeringProjectService(supabase as never).list(commerce, tenantId, limit, options),
      } as never,
      { list: async () => [] } as never,
      { list: async () => [] } as never,
      { listApplications: async () => [] } as never,
      undefined,
      {
        actions: { list: async () => [] },
        decisions: { list: async () => [] },
        risks: { list: async () => [] },
        issues: { list: async () => [] },
        technicalQueries: { list: async () => [] },
        lessons: { list: async () => [] },
      },
    );
    const engineerA = createTestCommerceExecutionContext({
      tenantId: tenant,
      workspaceId: "workspace-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "dashboard.read",
        seatRequired: true,
      },
    });
    const result = await dashboard.getDashboard(engineerA, tenant);
    const ids = (result.attention?.projects ?? []).map((p: { id?: string }) => p.id);
    expect(ids).toEqual(["proj-a"]);
    expect(ids).not.toContain("proj-b");
    expect(result.activeProjects.map((p) => p.id)).toEqual(["proj-a"]);
  });
});
