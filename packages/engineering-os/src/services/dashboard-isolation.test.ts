import { describe, expect, it } from "vitest";
import { createTestCommerceExecutionContext } from "@rtb/platform-commerce/server";
import { workspaceScopeId, isRecordInWorkspace } from "../commerce/workspace-scope";
import {
  emptyEngineeringDashboard,
  resolveDashboardProjectFilter,
} from "./dashboard-scope";
import { EngineeringDashboardService } from "./supporting-services";

describe("dashboard project filter", () => {
  it("treats missing or all as unscoped", () => {
    expect(resolveDashboardProjectFilter(undefined)).toEqual({ forceEmpty: false });
    expect(resolveDashboardProjectFilter("all")).toEqual({ forceEmpty: false });
  });

  it("accepts a UUID project id", () => {
    const id = "11111111-1111-4111-8111-111111111111";
    expect(resolveDashboardProjectFilter(id)).toEqual({ projectId: id, forceEmpty: false });
  });

  it("does not fall back to all-projects for an invalid project id", () => {
    expect(resolveDashboardProjectFilter("not-a-uuid")).toEqual({ forceEmpty: true });
  });
});

describe("workspace scope", () => {
  it("does not fall back to tenant-wide when workspace is missing", () => {
    const commerce = createTestCommerceExecutionContext({ tenantId: "tenant-a" });
    expect(workspaceScopeId(commerce)).toBeNull();
  });

  it("matches only the active workspace", () => {
    const commerce = createTestCommerceExecutionContext({
      tenantId: "tenant-a",
      workspaceId: "workspace-a",
    });
    expect(isRecordInWorkspace("workspace-a", commerce)).toBe(true);
    expect(isRecordInWorkspace("workspace-b", commerce)).toBe(false);
    expect(isRecordInWorkspace(null, commerce)).toBe(false);
  });
});

describe("EngineeringDashboardService isolation", () => {
  const tenant = "tenant-a";
  const projectA = "11111111-1111-4111-8111-111111111111";
  const projectB = "22222222-2222-4222-8222-222222222222";

  function dashboardFor(listProjectIds: string[]) {
    const captured: Array<{ tenantId: string; projectId?: string }> = [];
    const dashboard = new EngineeringDashboardService(
      {
        list: async (_commerce: unknown, tenantId: string) => {
          captured.push({ tenantId });
          return listProjectIds.map((id) => ({ id, status: "active" }));
        },
      } as never,
      {
        list: async (_commerce: unknown, tenantId: string, projectId?: string) => {
          captured.push({ tenantId, projectId });
          return [];
        },
      } as never,
      { list: async () => [] } as never,
      { listApplications: async () => [] } as never,
      undefined,
      {
        actions: { list: async (_c: unknown, tenantId: string, projectId?: string) => {
          captured.push({ tenantId, projectId });
          return [];
        } },
        decisions: { list: async () => [] },
        risks: { list: async () => [] },
        issues: { list: async () => [] },
        technicalQueries: { list: async () => [] },
        lessons: { list: async () => [] },
      },
    );
    return { dashboard, captured };
  }

  function commerce(overrides: { tenantId?: string; workspaceId?: string } = {}) {
    return createTestCommerceExecutionContext({
      tenantId: overrides.tenantId ?? tenant,
      workspaceId: overrides.workspaceId ?? "workspace-a",
      policy: {
        productKey: "engineering-os",
        applicationKey: "project_intelligence",
        action: "dashboard.read",
        seatRequired: true,
      },
    });
  }

  it("rejects a different tenant without returning the other tenant's projects", async () => {
    const { dashboard } = dashboardFor([projectA]);
    await expect(dashboard.getDashboard(commerce({ tenantId: "tenant-b" }), tenant)).rejects.toThrow();
  });

  it("scopes KPI project counts to the selected project", async () => {
    const { dashboard, captured } = dashboardFor([projectA, projectB]);
    const result = await dashboard.getDashboard(commerce(), tenant, { projectId: projectA });
    expect((result.activeProjects as Array<{ id: string }>).map((p) => p.id)).toEqual([projectA]);
    expect((result.activeProjects as Array<{ id: string }>).map((p) => p.id)).not.toContain(projectB);
    expect(captured.some((row) => row.projectId === projectA)).toBe(true);
  });

  it("returns a valid empty JSON state for an unusable project filter", async () => {
    const { dashboard } = dashboardFor([projectA]);
    const result = await dashboard.getDashboard(commerce(), tenant, { projectId: "nope" });
    expect(result).toEqual(emptyEngineeringDashboard());
  });

  it("returns loaded-zero JSON when lists are empty", async () => {
    const { dashboard } = dashboardFor([]);
    const result = await dashboard.getDashboard(commerce(), tenant);
    expect(result.activeProjects).toEqual([]);
    expect(result.openRisksCount).toBe(0);
    expect(result.openTechnicalQueriesCount).toBe(0);
    expect(result.openActionsCount).toBe(0);
  });
});
