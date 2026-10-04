import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canInsertEngineeringM365Connection, hasEngineeringAdminAuthority } from "../../permissions";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../../../");
const sql = readFileSync(join(root, "supabase/migrations/20261001180000_eos_a13a_m365_sharepoint_connector.sql"), "utf8");
const store = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "supabase-store.ts"), "utf8");
const service = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "service.ts"), "utf8");

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const WS_A = "ws-a";
const WS_B = "ws-b";
const ROW_A = { tenantId: TENANT_A, workspaceId: WS_A };

function admin() {
  return {
    userId: "admin-1",
    roleSlug: "admin",
    tenantIds: [TENANT_A],
    workspaceIds: [WS_A],
    permissions: [{ resource: "engineering", action: "admin" }],
  };
}

function engineer() {
  return {
    userId: "eng-1",
    roleSlug: "engineer",
    tenantIds: [TENANT_A],
    workspaceIds: [WS_A],
    permissions: [{ resource: "engineering", action: "execute" }, { resource: "engineering", action: "read" }],
  };
}

describe("EOS-A16C Microsoft connection RLS alignment", () => {
  const insertPolicy = sql.slice(
    sql.indexOf("CREATE POLICY eng_m365_connections_insert"),
    sql.indexOf("CREATE POLICY eng_m365_connections_update"),
  );

  it("keeps INSERT fail-closed on engineering admin, tenant membership, and workspace membership", () => {
    expect(sql).toContain("ALTER TABLE engineering_m365_connections ENABLE ROW LEVEL SECURITY");
    expect(insertPolicy).toContain("tenant_id = ANY (get_user_tenant_ids())");
    expect(insertPolicy).toContain("has_permission('engineering', 'admin', tenant_id)");
    expect(insertPolicy).toContain("engineering_core_workspace_member(workspace_id)");
    expect(insertPolicy).not.toContain("USING (true)");
    expect(insertPolicy).not.toContain("service_role");
    expect(sql).not.toContain("DISABLE ROW LEVEL SECURITY");
  });

  it("allows authorized admin insert and denies engineer, cross-tenant, and cross-workspace", () => {
    expect(canInsertEngineeringM365Connection(admin(), ROW_A)).toBe(true);
    expect(canInsertEngineeringM365Connection(engineer(), ROW_A)).toBe(false);
    expect(canInsertEngineeringM365Connection({ ...admin(), tenantIds: [TENANT_A], workspaceIds: [WS_A] }, { tenantId: TENANT_B, workspaceId: WS_A })).toBe(false);
    expect(canInsertEngineeringM365Connection({ ...admin(), workspaceIds: [WS_A] }, { tenantId: TENANT_A, workspaceId: WS_B })).toBe(false);
    expect(hasEngineeringAdminAuthority(engineer())).toBe(false);
  });

  it("does not persist connection rows through a service-role bypass", () => {
    expect(store).not.toMatch(/createServiceClient|SERVICE_ROLE|bypassRls/);
    expect(service).toContain("this.store.saveConnection(row)");
    expect(service).not.toMatch(/createServiceClient|SERVICE_ROLE/);
  });
});
