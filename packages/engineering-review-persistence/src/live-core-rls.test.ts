import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { applyHostedCoreRlsMigration } from "../scripts/apply-hosted-migration";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env";
import { ids, mutationDenied, restFetch } from "./live-http";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";

const mode = liveRlsMode();
const LIVE = mode === "run";

const CORE_TABLES = ["engineering_projects", "engineering_documents"] as const;

describe.skipIf(!LIVE)("ERA-6 Core JWT RLS security gate", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
    return restFetch(url, anonKey, serviceKey, path, options, jwt);
  }

  function ownerId(table: (typeof CORE_TABLES)[number]): string {
    return table === "engineering_projects" ? fixtures.projectA1Id : fixtures.documentA1Id;
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedCoreRlsMigration();
    if (!applied.applied && !applied.reachable) {
      if (mode === "run") {
        throw new Error("ENGINEERING_REVIEW_RLS=1 but Core tables are not reachable");
      }
      environment = "unavailable";
      return;
    }
    fixtures = await provisionReviewRlsFixtures();
    environment = "ready";
  });

  afterAll(async () => {
    if (environment === "ready") {
      await cleanupTransientReviewPackages();
    }
  });

  beforeEach(({ skip }) => {
    if (environment !== "ready") {
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: Core tables are not on hosted Postgres");
    }
  });

  it("Tenant A cannot SELECT Tenant B project/document", async () => {
    const project = await rest(
      `engineering_projects?select=id&id=eq.${fixtures.projectB1Id}`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(project.status).toBe(200);
    expect(ids(project.body)).toEqual([]);

    const document = await rest(
      `engineering_documents?select=id&id=eq.${fixtures.documentB1Id}`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(document.status).toBe(200);
    expect(ids(document.body)).toEqual([]);
  });

  it("Workspace A1 cannot SELECT Workspace A2 project/document in the same tenant", async () => {
    const project = await rest(
      `engineering_projects?select=id&id=eq.${fixtures.projectA2Id}`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(project.status).toBe(200);
    expect(ids(project.body)).toEqual([]);

    const document = await rest(
      `engineering_documents?select=id&id=eq.${fixtures.documentA2Id}`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(document.status).toBe(200);
    expect(ids(document.body)).toEqual([]);
  });

  it("authorized Workspace A1 SELECT succeeds", async () => {
    for (const table of CORE_TABLES) {
      const own = await rest(`${table}?select=id&id=eq.${ownerId(table)}`, {}, fixtures.users.a1.jwt);
      expect(own.status, table).toBe(200);
      expect(ids(own.body), table).toContain(ownerId(table));
    }
  });

  it("unauthorized SELECT of known UUIDs does not bypass authorization", async () => {
    for (const table of CORE_TABLES) {
      const a2 = await rest(`${table}?select=id&id=eq.${ownerId(table)}`, {}, fixtures.users.a2.jwt);
      expect(a2.status).toBe(200);
      expect(ids(a2.body), `${table} A2`).toEqual([]);

      const b1 = await rest(`${table}?select=id&id=eq.${ownerId(table)}`, {}, fixtures.users.b1.jwt);
      expect(b1.status).toBe(200);
      expect(ids(b1.body), `${table} B1`).toEqual([]);

      const anon = await rest(`${table}?select=id&id=eq.${ownerId(table)}`);
      expect(anon.status).toBe(200);
      expect(ids(anon.body), `${table} anon`).toEqual([]);
    }
  });

  it("unauthorized INSERT fails; authorized INSERT succeeds", async () => {
    const projectCode = `ER-A1-${randomUUID().slice(0, 8)}`;
    const authorized = await rest(
      "engineering_projects",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_code: projectCode,
          project_name: "Core RLS insert A1",
          status: "active",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(authorized.status, JSON.stringify(authorized.body)).toBeGreaterThanOrEqual(200);
    expect(authorized.status).toBeLessThan(300);

    const a2 = await rest(
      "engineering_projects",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_code: `ER-HIJACK-${randomUUID().slice(0, 8)}`,
          project_name: "A2 into A1",
          status: "active",
        }),
      },
      fixtures.users.a2.jwt,
    );
    expect(a2.status).toBeGreaterThanOrEqual(400);

    const docA2 = await rest(
      "engineering_documents",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          engineering_project_id: fixtures.projectA1Id,
          document_number: `ER-DOC-HIJACK-${randomUUID().slice(0, 8)}`,
          title: "A2 document into A1",
          revision: "A",
          status: "draft",
        }),
      },
      fixtures.users.a2.jwt,
    );
    expect(docA2.status).toBeGreaterThanOrEqual(400);

    const b1 = await rest(
      "engineering_documents",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          engineering_project_id: fixtures.projectA1Id,
          document_number: `ER-DOC-B-${randomUUID().slice(0, 8)}`,
          title: "Tenant B into A1",
          revision: "A",
          status: "draft",
        }),
      },
      fixtures.users.b1.jwt,
    );
    expect(b1.status).toBeGreaterThanOrEqual(400);
  });

  it("unauthorized UPDATE fails; authorized UPDATE succeeds; ownership mutation fails", async () => {
    const created = await rest(
      "engineering_projects",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_code: `ER-UPD-${randomUUID().slice(0, 8)}`,
          project_name: "Core RLS update target",
          status: "active",
        }),
      },
      fixtures.users.a1.jwt,
    );
    const createdId = Array.isArray(created.body)
      ? (created.body[0] as { id: string }).id
      : (created.body as { id: string }).id;
    expect(createdId).toBeTruthy();

    const ok = await rest(
      `engineering_projects?id=eq.${createdId}`,
      { method: "PATCH", body: JSON.stringify({ project_name: "Core RLS update target patched" }) },
      fixtures.users.a1.jwt,
    );
    expect(ok.status).toBeLessThan(400);

    const a2 = await rest(
      `engineering_projects?id=eq.${createdId}`,
      { method: "PATCH", body: JSON.stringify({ project_name: "hijack" }) },
      fixtures.users.a2.jwt,
    );
    expect(mutationDenied(a2), `A2 PATCH ${a2.status}`).toBe(true);

    const ownership = await rest(
      `engineering_projects?id=eq.${createdId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          tenant_id: fixtures.tenantBId,
          workspace_id: fixtures.workspaceB1Id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(ownership.status).toBeGreaterThanOrEqual(400);

    const docOwnership = await rest(
      `engineering_documents?id=eq.${fixtures.documentA1Id}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          workspace_id: fixtures.workspaceA2Id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(docOwnership.status).toBeGreaterThanOrEqual(400);
  });

  it("unauthorized DELETE fails; execute user cannot delete; admin can delete a disposable row", async () => {
    const created = await rest(
      "engineering_projects",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_code: `ER-DEL-${randomUUID().slice(0, 8)}`,
          project_name: "Core RLS delete target",
          status: "active",
        }),
      },
      fixtures.users.a1.jwt,
    );
    const createdId = Array.isArray(created.body)
      ? (created.body[0] as { id: string }).id
      : (created.body as { id: string }).id;
    expect(createdId).toBeTruthy();

    const executeDelete = await rest(
      `engineering_projects?id=eq.${createdId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(executeDelete.status === 200 ? ids(executeDelete.body) : true);
    const stillThere = await rest(`engineering_projects?id=eq.${createdId}&select=id`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body).length, "execute user must not delete").toBe(1);

    const a2 = await rest(`engineering_projects?id=eq.${createdId}`, { method: "DELETE" }, fixtures.users.a2.jwt);
    expect(mutationDenied(a2)).toBe(true);

    const adminDelete = await rest(
      `engineering_projects?id=eq.${createdId}`,
      { method: "DELETE" },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminDelete.status).toBeLessThan(400);
    const gone = await rest(`engineering_projects?id=eq.${createdId}&select=id`, {}, fixtures.users.a1.jwt);
    expect(ids(gone.body)).toEqual([]);
  });
});

describe("ERA-6 Core RLS environment gate", () => {
  it("distinguishes run, skip, misconfigured", () => {
    if (mode === "skip") {
      console.warn("SKIPPED_ENVIRONMENT_UNAVAILABLE");
    }
    expect(["run", "skip", "misconfigured"]).toContain(mode);
    expect(mode).not.toBe("misconfigured");
  });
});
