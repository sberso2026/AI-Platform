import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { EngineeringReviewError } from "@rtb/engineering-review";
import { applyHostedReviewMigrations } from "../scripts/apply-hosted-migration";
import { bindPlatformReviewAudit } from "./audit-bind";
import {
  createAuthenticatedReviewClient,
  createServiceReviewClient,
} from "./client";
import {
  liveRlsMode,
  loadLocalEnv,
  resolveServiceRoleKey,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
  REVIEW_TABLES,
} from "./env";
import {
  cleanupTransientReviewPackages,
  provisionReviewRlsFixtures,
  type ReviewRlsFixtures,
} from "./fixtures";
import { createSupabaseEngineeringReviewStore } from "./supabase-store";

const mode = liveRlsMode();
const LIVE = mode === "run";

type RestResult = { status: number; body: unknown };

describe.skipIf(!LIVE)("ERA-3 live JWT RLS security gate", () => {
  loadLocalEnv();
  const url = resolveSupabaseUrl()!;
  const anonKey = resolveSupabaseAnonKey()!;
  const serviceKey = resolveServiceRoleKey()!;
  let fixtures: ReviewRlsFixtures;
  let environment: "ready" | "unavailable" = "unavailable";

  function headers(jwt?: string, json = false): Record<string, string> {
    const isService = Boolean(jwt && jwt === serviceKey);
    return {
      apikey: isService ? serviceKey : anonKey,
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...(json ? { "Content-Type": "application/json", Prefer: "return=representation" } : {}),
    };
  }

  async function rest(path: string, options: RequestInit = {}, jwt?: string): Promise<RestResult> {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: { ...headers(jwt, Boolean(options.body)), ...(options.headers ?? {}) },
    });
    const text = await response.text();
    let body: unknown = null;
    try {
      body = text ? JSON.parse(text) : null;
    } catch {
      body = text;
    }
    return { status: response.status, body };
  }

  function ids(body: unknown): string[] {
    return Array.isArray(body) ? body.map((row) => String((row as { id: string }).id)) : [];
  }

  function mutationDenied(result: RestResult): boolean {
    if (result.status === 204) return true;
    if (result.status === 200) return ids(result.body).length === 0;
    return result.status >= 400 && result.status < 500;
  }

  function ownerId(table: (typeof REVIEW_TABLES)[number]): string {
    switch (table) {
      case "engineering_review_packages":
        return fixtures.packageA1Id;
      case "engineering_review_runs":
        return fixtures.runA1Id;
      case "engineering_review_findings":
        return fixtures.findingA1Id;
      case "engineering_review_evidence":
        return fixtures.evidenceA1Id;
      case "engineering_review_dispositions":
        return fixtures.dispositionA1Id;
    }
  }

  beforeAll(async () => {
    if (mode === "misconfigured") {
      throw new Error("ENGINEERING_REVIEW_RLS=1 but hosted credentials are missing");
    }
    const applied = await applyHostedReviewMigrations();
    if (!applied.hostedTablesReady) {
      if (mode === "run") {
        throw new Error(
          `ENGINEERING_REVIEW_RLS=1 but Review tables are not reachable: ${applied.missing.join("; ")}`,
        );
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
      skip("SKIPPED_ENVIRONMENT_UNAVAILABLE: Review AI tables are not on hosted Postgres");
    }
  });

  it("has distinct tenant/workspace JWT fixtures", () => {
    expect(fixtures.users.a1.jwt).toBeTruthy();
    expect(fixtures.users.a2.jwt).toBeTruthy();
    expect(fixtures.users.b1.jwt).toBeTruthy();
    expect(fixtures.workspaceA1Id).not.toBe(fixtures.workspaceA2Id);
    expect(fixtures.tenantAId).not.toBe(fixtures.tenantBId);
  });

  it("SELECT: User A1 reads A1 review rows and cannot read A2 or Tenant B", async () => {
    for (const table of REVIEW_TABLES) {
      const own = await rest(`${table}?select=id&id=eq.${ownerId(table)}`, {}, fixtures.users.a1.jwt);
      expect(own.status, `${table} A1 status`).toBe(200);
      expect(ids(own.body), `${table} A1 must see seeded row`).toContain(ownerId(table));

      const a2 = await rest(`${table}?select=id&id=eq.${ownerId(table)}`, {}, fixtures.users.a2.jwt);
      expect(a2.status, `${table} A2 status`).toBe(200);
      expect(ids(a2.body), `${table} Workspace A2 must see zero A1 rows`).toEqual([]);

      const b1 = await rest(`${table}?select=id&id=eq.${ownerId(table)}`, {}, fixtures.users.b1.jwt);
      expect(b1.status, `${table} B1 status`).toBe(200);
      expect(ids(b1.body), `${table} Tenant B must see zero Tenant A rows`).toEqual([]);
    }
  });

  it("SELECT: anonymous JWT sees zero review rows", async () => {
    for (const table of REVIEW_TABLES) {
      const result = await rest(`${table}?select=id&limit=5`);
      expect(result.status).toBe(200);
      expect(ids(result.body), table).toEqual([]);
    }
  });

  it("INSERT: authorized A1 insert succeeds; A2/B1 inserts into A1 fail via RLS", async () => {
    const payload = {
      tenant_id: fixtures.tenantAId,
      workspace_id: fixtures.workspaceA1Id,
      project_id: fixtures.projectA1Id,
      name: `ERA-3 insert ${randomUUID()}`,
      status: "draft",
      documents: [],
      created_by: fixtures.users.a1.id,
    };
    const ok = await rest("engineering_review_packages", { method: "POST", body: JSON.stringify(payload) }, fixtures.users.a1.jwt);
    expect(ok.status, JSON.stringify(ok.body)).toBeGreaterThanOrEqual(200);
    expect(ok.status).toBeLessThan(300);

    const a2 = await rest("engineering_review_packages", { method: "POST", body: JSON.stringify(payload) }, fixtures.users.a2.jwt);
    expect(a2.status).toBeGreaterThanOrEqual(400);
    expect(a2.status).toBeLessThan(500);

    const b1 = await rest("engineering_review_packages", { method: "POST", body: JSON.stringify(payload) }, fixtures.users.b1.jwt);
    expect(b1.status).toBeGreaterThanOrEqual(400);
    expect(b1.status).toBeLessThan(500);
  });

  it("UPDATE: A1 can update A1 package; A2/B1 cannot; ownership mutation fails", async () => {
    const created = await rest(
      "engineering_review_packages",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          name: `ERA-3 update-target ${randomUUID()}`,
          documents: [],
          created_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    const createdId = Array.isArray(created.body) ? (created.body[0] as { id: string }).id : (created.body as { id: string }).id;
    expect(createdId).toBeTruthy();

    const patchName = await rest(
      `engineering_review_packages?id=eq.${createdId}`,
      { method: "PATCH", body: JSON.stringify({ name: `ERA-3 update-target ${randomUUID()} patched` }) },
      fixtures.users.a1.jwt,
    );
    expect(patchName.status).toBeLessThan(400);

    const a2 = await rest(
      `engineering_review_packages?id=eq.${createdId}`,
      { method: "PATCH", body: JSON.stringify({ name: "hijack" }) },
      fixtures.users.a2.jwt,
    );
    expect(mutationDenied(a2), `A2 PATCH status ${a2.status}`).toBe(true);

    const ownership = await rest(
      `engineering_review_packages?id=eq.${createdId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          tenant_id: fixtures.tenantBId,
          workspace_id: fixtures.workspaceB1Id,
          project_id: fixtures.projectB1Id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(ownership.status).toBeGreaterThanOrEqual(400);
  });

  it("DELETE: execute user cannot delete; admin can delete a disposable package; dispositions are append-only", async () => {
    const created = await rest(
      "engineering_review_packages",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          name: `ERA-3 delete-target ${randomUUID()}`,
          documents: [],
          created_by: fixtures.users.a1.id,
        }),
      },
      fixtures.users.a1.jwt,
    );
    const createdId = Array.isArray(created.body) ? (created.body[0] as { id: string }).id : (created.body as { id: string }).id;
    expect(createdId).toBeTruthy();

    const executeDelete = await rest(
      `engineering_review_packages?id=eq.${createdId}`,
      { method: "DELETE" },
      fixtures.users.a1.jwt,
    );
    expect(executeDelete.status === 200 ? ids(executeDelete.body) : true);
    const stillThere = await rest(`engineering_review_packages?id=eq.${createdId}&select=id`, {}, fixtures.users.a1.jwt);
    expect(ids(stillThere.body).length, "execute user must not delete").toBe(1);

    const adminDelete = await rest(
      `engineering_review_packages?id=eq.${createdId}`,
      { method: "DELETE" },
      fixtures.users.aAdmin.jwt,
    );
    expect(adminDelete.status).toBeLessThan(400);
    const gone = await rest(`engineering_review_packages?id=eq.${createdId}&select=id`, {}, fixtures.users.a1.jwt);
    expect(ids(gone.body)).toEqual([]);

    const dispUpdate = await rest(
      `engineering_review_dispositions?id=eq.${fixtures.dispositionA1Id}`,
      { method: "PATCH", body: JSON.stringify({ reason: "rewrite history" }) },
      fixtures.users.aAdmin.jwt,
    );
    expect(mutationDenied(dispUpdate), `disposition PATCH status ${dispUpdate.status}`).toBe(true);
    const unchanged = await rest(
      `engineering_review_dispositions?id=eq.${fixtures.dispositionA1Id}&select=id,reason`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(unchanged.status).toBe(200);
    const reasons = Array.isArray(unchanged.body)
      ? unchanged.body.map((row) => String((row as { reason?: string }).reason ?? ""))
      : [];
    expect(reasons).toContain("seed assign");
    expect(reasons).not.toContain("rewrite history");

    const dispDelete = await rest(
      `engineering_review_dispositions?id=eq.${fixtures.dispositionA1Id}`,
      { method: "DELETE" },
      fixtures.users.aAdmin.jwt,
    );
    expect(mutationDenied(dispDelete), `disposition DELETE status ${dispDelete.status}`).toBe(true);
    const stillPresent = await rest(
      `engineering_review_dispositions?id=eq.${fixtures.dispositionA1Id}&select=id`,
      {},
      fixtures.users.a1.jwt,
    );
    expect(ids(stillPresent.body)).toContain(fixtures.dispositionA1Id);
  });

  it("rejects cross-tenant, cross-workspace, and wrong-project evidence laundering at the database", async () => {
    const attempts = [
      { document_id: fixtures.documentB1Id, label: "cross-tenant" },
      { document_id: fixtures.documentA2Id, label: "cross-workspace" },
      {
        document_id: fixtures.documentA1Id,
        project_id: fixtures.projectA2Id,
        label: "cross-project",
      },
    ];
    for (const attempt of attempts) {
      const result = await rest(
        "engineering_review_evidence",
        {
          method: "POST",
          body: JSON.stringify({
            finding_id: fixtures.findingA1Id,
            tenant_id: fixtures.tenantAId,
            workspace_id: fixtures.workspaceA1Id,
            project_id: attempt.project_id ?? fixtures.projectA1Id,
            document_id: attempt.document_id,
            source_type: "extracted_text",
            verification_state: "unverified",
            span: attempt.label,
          }),
        },
        fixtures.users.a1.jwt,
      );
      expect(result.status, attempt.label).toBeGreaterThanOrEqual(400);
    }
  });

  it("document UUID guessing cannot authorize another workspace or tenant", async () => {
    const store = createSupabaseEngineeringReviewStore({
      client: createAuthenticatedReviewClient(url, anonKey, fixtures.users.a1.jwt),
      kind: "authenticated",
    });
    const expected = {
      tenantId: fixtures.tenantAId,
      workspaceId: fixtures.workspaceA1Id,
      projectId: fixtures.projectA1Id,
    };
    await expect(store.loadAuthorizedDocument(fixtures.documentA1Id, expected)).resolves.toMatchObject({
      documentId: fixtures.documentA1Id,
    });
    await expect(store.loadAuthorizedDocument(fixtures.documentA2Id, expected)).rejects.toBeInstanceOf(EngineeringReviewError);
    await expect(store.loadAuthorizedDocument(fixtures.documentB1Id, expected)).rejects.toBeInstanceOf(EngineeringReviewError);
    await expect(store.loadAuthorizedDocument(randomUUID(), expected)).rejects.toBeInstanceOf(EngineeringReviewError);
  });

  it("human authority is retained and AI cannot record disposition", async () => {
    const store = createSupabaseEngineeringReviewStore({
      client: createAuthenticatedReviewClient(url, anonKey, fixtures.users.a1.jwt),
      kind: "authenticated",
      audit: bindPlatformReviewAudit(createAuthenticatedReviewClient(url, anonKey, fixtures.users.a1.jwt)),
    });
    await expect(
      store.recordHumanDisposition({
        findingId: fixtures.findingA1Id,
        action: "accept",
        actorId: "model-1",
        actorKind: "ai",
      }),
    ).rejects.toMatchObject({ code: "ai_cannot_dispose" });

    const finding = await store.loadReviewFinding(fixtures.findingA1Id);
    expect(finding).toBeTruthy();
    const historyBefore = await store.loadDispositionHistory(fixtures.findingA1Id);
    const action =
      finding!.status === "accepted" || finding!.status === "rejected"
        ? "close"
        : finding!.status === "closed"
          ? "reopen"
          : "accept";
    const applied = await store.recordHumanDisposition({
      findingId: fixtures.findingA1Id,
      action,
      actorId: fixtures.users.a1.id,
      actorKind: "human",
      reason: "ERA-3 live human accept/reopen",
    });
    expect(applied.disposition.actorKind).toBe("human");
    expect(applied.disposition.actorId).toBe(fixtures.users.a1.id);
    const history = await store.loadDispositionHistory(fixtures.findingA1Id);
    expect(history.length).toBeGreaterThan(historyBefore.length);

    const aiInsert = await rest(
      "engineering_review_dispositions",
      {
        method: "POST",
        body: JSON.stringify({
          finding_id: fixtures.findingA1Id,
          tenant_id: fixtures.tenantAId,
          workspace_id: fixtures.workspaceA1Id,
          project_id: fixtures.projectA1Id,
          action: "close",
          previous_status: applied.finding.status,
          new_status: "closed",
          actor_id: "system:model",
          actor_kind: "ai",
        }),
      },
      fixtures.users.a1.jwt,
    );
    expect(aiInsert.status).toBeGreaterThanOrEqual(400);
  });

  it("does not treat service-role reads as user RLS proof", async () => {
    const service = createServiceReviewClient(url, serviceKey);
    const { data, error } = await service
      .from("engineering_review_packages")
      .select("id")
      .eq("id", fixtures.packageA1Id)
      .maybeSingle();
    expect(error).toBeNull();
    expect(data?.id).toBe(fixtures.packageA1Id);
    const a2 = await rest(
      `engineering_review_packages?id=eq.${fixtures.packageA1Id}`,
      {},
      fixtures.users.a2.jwt,
    );
    expect(ids(a2.body)).toEqual([]);
  });
});

describe("ERA-3 live RLS environment gate", () => {
  it("distinguishes run, skip, misconfigured, and unavailable schema", () => {
    if (mode === "skip") {
      console.warn("SKIPPED_ENVIRONMENT_UNAVAILABLE");
    }
    expect(["run", "skip", "misconfigured"]).toContain(mode);
    expect(mode).not.toBe("misconfigured");
  });
});
