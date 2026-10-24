import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { canInsertSharePointIndexJob, hasEngineeringAdminAuthority, SHAREPOINT_INDEX_JOB_TYPE } from "../../permissions";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../../../../");
const sql = readFileSync(join(root, "supabase/migrations/20261004180000_eos_a16d_sharepoint_sync_job_insert.sql"), "utf8");
const historical = readFileSync(join(root, "supabase/migrations/20260201000001_phase_15_rls_policies.sql"), "utf8");
const jobService = readFileSync(join(root, "packages/platform-kernel/src/jobs/job-service.ts"), "utf8");
const kernel = readFileSync(join(root, "packages/platform-kernel/src/kernel.ts"), "utf8");
const webKernel = readFileSync(join(root, "apps/web/src/lib/kernel.ts"), "utf8");
const service = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "service.ts"), "utf8");
const route = readFileSync(join(root, "apps/web/src/app/api/engineering/work/route.ts"), "utf8");
const page = readFileSync(join(root, "apps/web/src/app/(platform)/engineering/settings/integrations/page.tsx"), "utf8");

const TENANT_A = "tenant-a";
const TENANT_B = "tenant-b";
const WS_A = "ws-a";
const WS_B = "ws-b";
const JOB = SHAREPOINT_INDEX_JOB_TYPE;
const ROW_A = { tenantId: TENANT_A, workspaceId: WS_A, jobType: JOB };

function admin() {
  return {
    userId: "admin-1",
    roleSlug: "admin",
    tenantIds: [TENANT_A],
    workspaceIds: [WS_A],
    permissions: [{ resource: "engineering", action: "admin" }],
  };
}

function owner() {
  return {
    userId: "owner-1",
    roleSlug: "engineering-owner",
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

describe("EOS-A16D SharePoint index job insert authority", () => {
  it("keeps INSERT fail-closed on engineering admin, tenant membership, workspace membership, and job type", () => {
    expect(sql).toContain("ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("CREATE POLICY background_jobs_engineering_m365_sync_insert ON background_jobs");
    expect(sql).toContain("FOR INSERT");
    expect(sql).toContain("job_type = 'engineering.m365.sharepoint.sync'");
    expect(sql).toContain("tenant_id = ANY (get_user_tenant_ids())");
    expect(sql).toContain("workspace_id IS NOT NULL");
    expect(sql).toContain("engineering_core_workspace_member(workspace_id)");
    expect(sql).toContain("has_permission('engineering', 'admin', tenant_id)");
    const insertPolicy = sql.slice(sql.indexOf("CREATE POLICY background_jobs_engineering_m365_sync_insert"));
    expect(insertPolicy).not.toContain("USING (true)");
    expect(insertPolicy).not.toContain("service_role");
    expect(insertPolicy).not.toContain("automation");
    expect(sql).not.toContain("DISABLE ROW LEVEL SECURITY");
    expect(historical).toContain("CREATE POLICY background_jobs_manage ON background_jobs");
    expect(historical).toContain("has_permission('automation', 'execute', tenant_id)");
  });

  it("allows authorized admin insert and denies engineer, cross-tenant, cross-workspace, and malformed job type", () => {
    expect(canInsertSharePointIndexJob(admin(), ROW_A)).toBe(true);
    expect(canInsertSharePointIndexJob(owner(), ROW_A)).toBe(true);
    expect(canInsertSharePointIndexJob(engineer(), ROW_A)).toBe(false);
    expect(canInsertSharePointIndexJob(admin(), { ...ROW_A, tenantId: TENANT_B })).toBe(false);
    expect(canInsertSharePointIndexJob(admin(), { ...ROW_A, workspaceId: WS_B })).toBe(false);
    expect(canInsertSharePointIndexJob(admin(), { ...ROW_A, workspaceId: null })).toBe(false);
    expect(canInsertSharePointIndexJob(admin(), { ...ROW_A, jobType: "engineering.optimization.evaluate" })).toBe(false);
    expect(canInsertSharePointIndexJob({ ...admin(), userId: null }, ROW_A)).toBe(false);
    expect(hasEngineeringAdminAuthority(engineer())).toBe(false);
  });

  it("creates the index job through user-scoped JobService, not a service-role bypass", () => {
    expect(jobService).toContain('.from("background_jobs")');
    expect(jobService).toContain(".insert(");
    expect(jobService).not.toMatch(/createServiceClient|SERVICE_ROLE|bypassRls/);
    expect(kernel).toContain("jobs: new JobService(supabase)");
    expect(kernel).not.toContain("jobs: new JobService(notificationClient");
    expect(webKernel).toContain("createPlatformKernel(supabase, serviceClient)");
    expect(webKernel).not.toMatch(/jobs:\s*new JobService\(serviceClient\)/);
    expect(service).toContain("this.deps.jobs.create");
    expect(service).toContain("jobType: M365_JOB_TYPE");
    expect(service).not.toMatch(/createServiceClient|SERVICE_ROLE/);
    expect(route).toContain('action === "indexSharePointRepository"');
    expect(route).toContain("enqueueSync(");
    expect(page).toContain('disabled={!canConnectMicrosoft} onClick={() => void post("indexSharePointRepository"');
  });
});
