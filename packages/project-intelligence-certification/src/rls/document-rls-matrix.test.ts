import { describe, expect, it } from "vitest";
import { requirePiFixturesManifest, type PiFixtureManifest } from "../fixtures/env.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const tables = [
  "project_intelligence_document_ingestions",
  "project_intelligence_document_processing_runs",
  "project_intelligence_document_chunks",
  "project_intelligence_document_embeddings",
  "project_intelligence_document_extractions",
  "project_intelligence_document_summaries",
  "project_intelligence_document_comparisons",
  "project_intelligence_document_evidence",
  "project_intelligence_document_citations",
  "project_intelligence_document_findings",
  "project_intelligence_document_answer_traces",
  "project_intelligence_document_review_items",
  "project_intelligence_document_audit",
  "project_intelligence_document_jobs",
  "project_intelligence_document_outbox",
  "project_intelligence_document_dead_letters",
  "project_intelligence_document_processing_steps",
] as const;

type RestResult = { status: number; body: unknown };

/**
 * Phase 6C-2 document RLS matrix — real JWT row visibility, not JWT non-5xx alone.
 */
describe.skipIf(!enabled)("Phase 6C-2 — Document intelligence real-JWT RLS matrix", () => {
  const manifest: PiFixtureManifest = enabled ? requirePiFixturesManifest() : ({} as PiFixtureManifest);
  const url = process.env.SUPABASE_URL ?? process.env.SUPABASE_TEST_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.SUPABASE_TEST_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const users = manifest.baseline?.users;

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
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      headers: { ...headers(jwt, Boolean(options.body)), ...(options.headers ?? {}) },
    });
    const text = await response.text();
    return { status: response.status, body: text ? JSON.parse(text) : null };
  }

  function ids(body: unknown): string[] {
    return Array.isArray(body) ? body.map((row) => String((row as { id: string }).id)) : [];
  }

  it("has hosted credentials for document RLS checks", () => {
    expect(url).toBeTruthy();
    expect(anonKey).toBeTruthy();
    expect(serviceKey).toBeTruthy();
    expect(users?.owner?.jwt).toBeTruthy();
    expect(users?.otherTenantOwner?.jwt).toBeTruthy();
  });

  it("denies anonymous reads on every document intelligence table", async () => {
    for (const table of tables) {
      const result = await rest(`${table}?select=id&limit=5`);
      expect(result.status, `${table} anonymous`).toBe(200);
      expect(ids(result.body), `${table} anonymous must see zero rows`).toEqual([]);
    }
  });

  it("isolates other-tenant JWT from baseline tenant document rows", async () => {
    for (const table of tables) {
      const result = await rest(
        `${table}?select=id&tenant_id=eq.${manifest.baseline.tenantId}&limit=20`,
        {},
        users.otherTenantOwner.jwt,
      );
      expect(result.status, `${table} other tenant status`).toBe(200);
      expect(ids(result.body), `${table} other tenant must see zero rows`).toEqual([]);
    }
  });

  it("allows entitled owner to query scoped document intelligence tables with exact 200", async () => {
    for (const table of tables) {
      const result = await rest(
        `${table}?select=id&tenant_id=eq.${manifest.baseline.tenantId}&limit=20`,
        {},
        users.owner.jwt,
      );
      expect(result.status, `${table} owner status`).toBe(200);
      expect(Array.isArray(result.body), `${table} owner body`).toBe(true);
    }
  });

  it("rejects anonymous inserts into document ingestions", async () => {
    const result = await rest(
      "project_intelligence_document_ingestions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: manifest.baseline.tenantId,
          workspace_id: manifest.baseline.workspaceId,
          engineering_document_id: "00000000-0000-4000-8000-000000000099",
          source_revision: "A",
          processing_version: "1",
          status: "registered",
        }),
      },
    );
    expect(result.status).toBeGreaterThanOrEqual(400);
    expect(result.status).toBeLessThan(500);
  });

  it("rejects other-tenant insert attempts into document findings", async () => {
    const result = await rest(
      "project_intelligence_document_findings",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: manifest.baseline.tenantId,
          workspace_id: manifest.baseline.workspaceId,
          engineering_document_id: "00000000-0000-4000-8000-000000000099",
          finding_type: "missing_approval",
          severity: "medium",
          title: "Injection attempt",
          confidence: 0.5,
          review_state: "pending",
        }),
      },
      users.otherTenantOwner.jwt,
    );
    expect(result.status).toBeGreaterThanOrEqual(400);
    expect(result.status).toBeLessThan(500);
  });
});
