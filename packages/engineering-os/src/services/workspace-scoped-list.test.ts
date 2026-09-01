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
    single: () => query,
    then: (resolve) => {
      const tenant = captured.find(([col]) => col === "tenant_id")?.[1];
      const workspace = captured.find(([col]) => col === "workspace_id")?.[1];
      let data = rows.filter((row) => row.tenant_id === tenant);
      if (workspace) data = data.filter((row) => row.workspace_id === workspace);
      resolve({ data, error: null });
    },
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
