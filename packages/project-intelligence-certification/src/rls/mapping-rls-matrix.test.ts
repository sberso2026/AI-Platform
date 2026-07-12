import { describe, expect, it } from "vitest";
import { requirePiFixturesManifest, type PiFixtureManifest } from "../fixtures/env.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const table = "project_intelligence_project_mappings";
const auditTable = "project_intelligence_mapping_audit";

type RestResult = { status: number; body: unknown };

describe.skipIf(!enabled)("Phase 6C-1 — Project Intelligence real-JWT RLS matrix", () => {
  const manifest: PiFixtureManifest = enabled ? requirePiFixturesManifest() : ({} as PiFixtureManifest);
  const url = process.env.SUPABASE_URL ?? process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_TEST_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const users = manifest.baseline.users;
  const actors = {
    anonymous: undefined,
    viewer: users.viewer.jwt,
    engineerA: users.engineer.jwt,
    engineerB: users.engineerWorkspaceBOnly.jwt,
    admin: users.admin.jwt,
    owner: users.owner.jwt,
    otherTenantOwner: users.otherTenantOwner.jwt,
    service: serviceKey,
  };
  let writableMappingId = "";
  let writableProjectId = "";

  function headers(jwt?: string, json = false): Record<string, string> {
    const isServiceSecret = Boolean(jwt && jwt === serviceKey);
    const apikey = isServiceSecret ? serviceKey! : anonKey!;
    return {
      apikey,
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...(json ? { "Content-Type": "application/json", Prefer: "return=representation" } : {}),
    };
  }

  async function rest(path: string, options: RequestInit = {}, jwt?: string): Promise<RestResult> {
    const response = await fetch(`${url}/rest/v1/${path}`, { ...options, headers: { ...headers(jwt, Boolean(options.body)), ...(options.headers ?? {}) } });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  }

  function ids(body: unknown): string[] {
    return Array.isArray(body) ? body.map((row) => String((row as { id: string }).id)) : [];
  }

  it("has all hosted credentials and a structurally ready fixture", () => {
    expect(url).toBeTruthy();
    expect(anonKey).toBeTruthy();
    expect(serviceKey).toBeTruthy();
    expect(manifest.baseline.mappingId).toBeTruthy();
    expect(manifest.baseline.approvedMappingId).toBeTruthy();
  });

  it("enforces collection and single-row visibility by real JWT actor", async () => {
    const a = manifest.baseline.mappingId;
    const approved = manifest.baseline.approvedMappingId;
    const b = await rest(`${table}?select=id&tenant_id=eq.${manifest.baseline.tenantId}&workspace_id=eq.${manifest.baseline.workspaceBId}`, {}, actors.service);
    expect(b.status).toBe(200);
    const bId = ids(b.body)[0]!;
    const expected: Record<keyof typeof actors, string[]> = {
      anonymous: [], viewer: [a, approved], engineerA: [a, approved], engineerB: [bId],
      admin: [a, approved, bId], owner: [a, approved, bId], otherTenantOwner: [], service: [a, approved, bId],
    };
    for (const [name, jwt] of Object.entries(actors) as [keyof typeof actors, string | undefined][]) {
      const collection = await rest(`${table}?select=id&tenant_id=eq.${manifest.baseline.tenantId}`, {}, jwt);
      expect(collection.status, `${name} collection status`).toBe(200);
      const visible = ids(collection.body);
      for (const id of expected[name]) expect(visible, `${name} should see ${id}`).toContain(id);
      for (const id of [a, approved, bId].filter((id) => !expected[name].includes(id))) expect(visible, `${name} must not see ${id}`).not.toContain(id);
      const single = await rest(`${table}?select=id&id=eq.${a}`, {}, jwt);
      expect(single.status, `${name} single status`).toBe(200);
      expect(ids(single.body)).toEqual(expected[name].includes(a) ? [a] : []);
    }
  });

  it("allows only admin/owner/service to create candidates", async () => {
    const project = await rest("engineering_projects", {
      method: "POST",
      body: JSON.stringify({ tenant_id: manifest.baseline.tenantId, workspace_id: manifest.baseline.workspaceId, project_code: `PI-RLS-${Date.now()}`, project_name: "PI RLS candidate", status: "active", created_by: users.owner.id }),
    }, actors.service);
    expect(project.status).toBe(201);
    writableProjectId = ids(project.body)[0]!;
    const payload = { tenant_id: manifest.baseline.tenantId, workspace_id: manifest.baseline.workspaceId, engineering_project_id: writableProjectId, legacy_project_intelligence_project_id: `rls-${Date.now()}`, mapping_status: "candidate", migration_source: "rls-matrix" };
    for (const [name, jwt] of Object.entries({ viewer: actors.viewer, engineerA: actors.engineerA, admin: actors.admin, owner: actors.owner, otherTenantOwner: actors.otherTenantOwner }) as [string, string][]) {
      const actorProject = await rest("engineering_projects", {
        method: "POST",
        body: JSON.stringify({ tenant_id: manifest.baseline.tenantId, workspace_id: manifest.baseline.workspaceId, project_code: `PI-RLS-${name}-${Date.now()}`, project_name: `PI RLS ${name}`, status: "active", created_by: users.owner.id }),
      }, actors.service);
      expect(actorProject.status).toBe(201);
      const result = await rest(table, { method: "POST", body: JSON.stringify({ ...payload, engineering_project_id: ids(actorProject.body)[0], legacy_project_intelligence_project_id: `${payload.legacy_project_intelligence_project_id}-${name}` }) }, jwt);
      if (name === "admin" || name === "owner") {
        expect(result.status, `${name} create`).toBe(201);
        expect(ids(result.body)).toHaveLength(1);
        if (name === "owner") writableMappingId = ids(result.body)[0]!;
      } else {
        expect(result.status, `${name} create denied`).toBe(403);
        expect(result.body).toMatchObject({ message: expect.any(String) });
      }
    }
  });

  it("permits admin/owner status transitions and denies non-managers", async () => {
    const denied = await rest(`${table}?id=eq.${writableMappingId}`, { method: "PATCH", body: JSON.stringify({ mapping_status: "pending_review" }) }, actors.engineerA);
    expect(denied.status).toBe(200);
    expect(denied.body).toEqual([]);
    for (const [jwt, status] of [[actors.admin, "conflict"], [actors.owner, "approved"]] as const) {
      const result = await rest(`${table}?id=eq.${writableMappingId}`, { method: "PATCH", body: JSON.stringify({ mapping_status: status, ...(status === "approved" && { approved_by: users.owner.id, approved_at: new Date().toISOString() }) }) }, jwt);
      expect(result.status).toBe(200);
      expect((result.body as Array<{ mapping_status: string }>)[0]?.mapping_status).toBe(status);
    }
  });

  it("denies tenant/workspace reassignment and source mutation after approval", async () => {
    for (const patch of [
      { tenant_id: manifest.denial.piNotInstalledTenant.tenantId },
      { workspace_id: manifest.baseline.workspaceBId },
    ]) {
      const result = await rest(`${table}?id=eq.${writableMappingId}`, { method: "PATCH", body: JSON.stringify(patch) }, actors.owner);
      // Identity immutability trigger raises 400; RLS WITH CHECK denials may be 403.
      expect([400, 403], `reassignment status for ${JSON.stringify(patch)}`).toContain(result.status);
      expect(result.body).toMatchObject({ message: expect.any(String) });
      const verify = await rest(`${table}?select=tenant_id,workspace_id&id=eq.${writableMappingId}`, {}, actors.owner);
      expect(verify.status).toBe(200);
      expect((verify.body as Array<{ tenant_id: string; workspace_id: string }>)[0]).toMatchObject({
        tenant_id: manifest.baseline.tenantId,
        workspace_id: manifest.baseline.workspaceId,
      });
    }
    const immutable = await rest(`${table}?id=eq.${writableMappingId}`, { method: "PATCH", body: JSON.stringify({ migration_source: "forbidden-after-approval" }) }, actors.owner);
    expect(immutable.status).toBe(400);
    expect(immutable.body).toMatchObject({ message: expect.stringContaining("immutable after approval") });
  });

  it("enforces retire/delete policy and records a service audit", async () => {
    // Use a fresh approved mapping so prior denied patches cannot poison this assertion.
    const project = await rest("engineering_projects", {
      method: "POST",
      body: JSON.stringify({
        tenant_id: manifest.baseline.tenantId,
        workspace_id: manifest.baseline.workspaceId,
        project_code: `PI-RLS-RETIRE-${Date.now()}`,
        project_name: "PI RLS retire",
        status: "active",
        created_by: users.owner.id,
      }),
    }, actors.service);
    expect(project.status).toBe(201);
    const create = await rest(table, {
      method: "POST",
      body: JSON.stringify({
        tenant_id: manifest.baseline.tenantId,
        workspace_id: manifest.baseline.workspaceId,
        engineering_project_id: ids(project.body)[0],
        legacy_project_intelligence_project_id: `rls-retire-${Date.now()}`,
        mapping_status: "approved",
        migration_source: "rls-matrix-retire",
        approved_by: users.owner.id,
        approved_at: new Date().toISOString(),
      }),
    }, actors.owner);
    expect(create.status).toBe(201);
    const retireId = ids(create.body)[0]!;

    const retire = await rest(`${table}?id=eq.${retireId}`, { method: "PATCH", body: JSON.stringify({ mapping_status: "retired" }) }, actors.owner);
    expect(retire.status).toBe(200);
    expect((retire.body as Array<{ mapping_status: string }>)[0]?.mapping_status).toBe("retired");
    const deleteDenied = await rest(`${table}?id=eq.${retireId}`, { method: "DELETE" }, actors.viewer);
    expect([200, 204]).toContain(deleteDenied.status);
    if (deleteDenied.status === 200) expect(deleteDenied.body).toEqual([]);
    const stillThere = await rest(`${table}?select=id&id=eq.${retireId}`, {}, actors.owner);
    expect(ids(stillThere.body)).toEqual([retireId]);
    const deleted = await rest(`${table}?id=eq.${retireId}`, { method: "DELETE", headers: { Prefer: "return=representation" } }, actors.owner);
    expect([200, 204]).toContain(deleted.status);
    if (deleted.status === 200) expect(ids(deleted.body)).toEqual([retireId]);
    const gone = await rest(`${table}?select=id&id=eq.${retireId}`, {}, actors.owner);
    expect(ids(gone.body)).toEqual([]);

    const audit = await rest(auditTable, { method: "POST", body: JSON.stringify({ tenant_id: manifest.baseline.tenantId, workspace_id: manifest.baseline.workspaceId, mapping_id: manifest.baseline.mappingId, actor_id: users.owner.id, action: "service_mutation", event_id: `pi-rls-${Date.now()}`, details: { source: "rls-matrix" } }) }, actors.service);
    expect(audit.status).toBe(201);
    const auditId = ids(audit.body)[0]!;
    for (const [name, jwt, visible] of [
      ["anonymous", actors.anonymous, false], ["viewer", actors.viewer, true], ["engineerA", actors.engineerA, true],
      ["engineerB", actors.engineerB, false], ["otherTenantOwner", actors.otherTenantOwner, false], ["service", actors.service, true],
    ] as const) {
      const result = await rest(`${auditTable}?select=id&mapping_id=eq.${manifest.baseline.mappingId}`, {}, jwt);
      expect(result.status, `${name} audit collection`).toBe(200);
      expect(ids(result.body).includes(auditId), `${name} audit visibility`).toBe(visible);
    }
  });
});
