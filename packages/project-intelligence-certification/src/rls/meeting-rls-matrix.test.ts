import { describe, expect, it } from "vitest";
import { requirePiFixturesManifest, type PiFixtureManifest } from "../fixtures/env.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

/** Real-JWT RLS actors for meeting foundation: anonymous, owner, other-tenant owner. */
const MEETING_RLS_ACTOR_COUNT = 3;

const tables = [
  "project_intelligence_meeting_sessions",
  "project_intelligence_meeting_participants",
  "project_intelligence_transcript_segments",
  "project_intelligence_transcript_revisions",
  "project_intelligence_meeting_events",
  "project_intelligence_meeting_processing_runs",
  "project_intelligence_meeting_proposals",
  "project_intelligence_meeting_review_items",
  "project_intelligence_meeting_minutes",
  "project_intelligence_meeting_minutes_versions",
  "project_intelligence_meeting_evidence",
  "project_intelligence_meeting_jobs",
  "project_intelligence_meeting_job_attempts",
  "project_intelligence_meeting_worker_leases",
  "project_intelligence_meeting_dead_letters",
  "project_intelligence_meeting_outbox",
] as const;

type RestResult = { status: number; body: unknown };

/**
 * Phase 6C-3B meeting RLS matrix — real JWT row visibility, not JWT non-5xx alone.
 */
describe.skipIf(!enabled)("Phase 6C-3B — Meeting foundation real-JWT RLS matrix", () => {
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

  it("has hosted credentials for meeting RLS checks", () => {
    expect(url).toBeTruthy();
    expect(anonKey).toBeTruthy();
    expect(serviceKey).toBeTruthy();
    expect(users?.owner?.jwt).toBeTruthy();
    expect(users?.otherTenantOwner?.jwt).toBeTruthy();
    expect(MEETING_RLS_ACTOR_COUNT).toBe(3);
  });

  it("denies anonymous reads on every meeting foundation table", async () => {
    for (const table of tables) {
      const result = await rest(`${table}?select=id&limit=5`);
      expect(result.status, `${table} anonymous`).toBe(200);
      expect(ids(result.body), `${table} anonymous must see zero rows`).toEqual([]);
    }
  });

  it("isolates other-tenant JWT from baseline tenant meeting rows", async () => {
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

  it("allows entitled owner to query scoped meeting foundation tables with exact 200", async () => {
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

  it("rejects anonymous inserts into meeting sessions", async () => {
    const result = await rest(
      "project_intelligence_meeting_sessions",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: manifest.baseline.tenantId,
          workspace_id: manifest.baseline.workspaceId,
          title: "Anonymous inject",
          provider: "manual",
          status: "draft",
          state_version: 1,
          recording_notice_required: "unknown",
          consent_status: "not_requested",
          privacy_classification: "internal",
        }),
      },
    );
    expect(result.status).toBeGreaterThanOrEqual(400);
    expect(result.status).toBeLessThan(500);
  });

  it("rejects other-tenant insert attempts into meeting participants", async () => {
    const result = await rest(
      "project_intelligence_meeting_participants",
      {
        method: "POST",
        body: JSON.stringify({
          tenant_id: manifest.baseline.tenantId,
          workspace_id: manifest.baseline.workspaceId,
          meeting_session_id: "00000000-0000-4000-8000-000000000099",
          display_name: "Injection attempt",
          role: "attendee",
          attendance_status: "invited",
          consent_status: "not_requested",
          source: "manual",
        }),
      },
      users.otherTenantOwner.jwt,
    );
    expect(result.status).toBeGreaterThanOrEqual(400);
    expect(result.status).toBeLessThan(500);
  });
});
