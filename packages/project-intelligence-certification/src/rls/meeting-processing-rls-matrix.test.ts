import { describe, expect, it } from "vitest";
import { requirePiFixturesManifest, type PiFixtureManifest } from "../fixtures/env.js";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

/**
 * Phase 6C-3C processing RLS — proposals / minutes / jobs select isolation with seeded fixtures.
 */
describe.skipIf(!enabled)("Phase 6C-3C — Meeting processing real-JWT RLS matrix", () => {
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

  async function rest(path: string, options: RequestInit = {}, jwt?: string) {
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

  it("seeds proposal / minutes / job rows and isolates other-tenant JWT", async () => {
    expect(url).toBeTruthy();
    expect(anonKey).toBeTruthy();
    expect(serviceKey).toBeTruthy();
    expect(users?.owner?.jwt).toBeTruthy();
    expect(users?.otherTenantOwner?.jwt).toBeTruthy();

    const tenantId = manifest.baseline.tenantId;
    const workspaceId = manifest.baseline.workspaceId;
    const meetingId = crypto.randomUUID();
    const proposalId = crypto.randomUUID();
    const minutesId = crypto.randomUUID();
    const jobId = crypto.randomUUID();
    const now = new Date().toISOString();

    const sessionInsert = await rest(
      "project_intelligence_meeting_sessions",
      {
        method: "POST",
        body: JSON.stringify({
          id: meetingId,
          tenant_id: tenantId,
          workspace_id: workspaceId,
          title: `Processing RLS ${Date.now()}`,
          provider: "manual",
          status: "ended",
          state_version: 1,
          recording_notice_required: "not_required",
          consent_status: "not_applicable",
          privacy_classification: "internal",
          created_at: now,
          updated_at: now,
        }),
      },
      serviceKey,
    );
    expect(sessionInsert.status, JSON.stringify(sessionInsert.body)).toBeLessThan(300);

    const proposalInsert = await rest(
      "project_intelligence_meeting_proposals",
      {
        method: "POST",
        body: JSON.stringify({
          id: proposalId,
          tenant_id: tenantId,
          workspace_id: workspaceId,
          meeting_session_id: meetingId,
          proposal_type: "action",
          title: "RLS proposal",
          review_state: "proposed",
          confidence: 0.9,
        }),
      },
      serviceKey,
    );
    expect(proposalInsert.status, JSON.stringify(proposalInsert.body)).toBeLessThan(300);

    const minutesInsert = await rest(
      "project_intelligence_meeting_minutes",
      {
        method: "POST",
        body: JSON.stringify({
          id: minutesId,
          tenant_id: tenantId,
          workspace_id: workspaceId,
          meeting_session_id: meetingId,
          status: "draft",
          current_version: 1,
        }),
      },
      serviceKey,
    );
    expect(minutesInsert.status, JSON.stringify(minutesInsert.body)).toBeLessThan(300);

    const jobInsert = await rest(
      "project_intelligence_meeting_jobs",
      {
        method: "POST",
        body: JSON.stringify({
          id: jobId,
          tenant_id: tenantId,
          workspace_id: workspaceId,
          meeting_session_id: meetingId,
          job_type: "project_intelligence.meeting.process_transcript",
          status: "queued",
          attempt_count: 0,
          max_attempts: 5,
          available_at: now,
          idempotency_key: `rls-${jobId}`,
        }),
      },
      serviceKey,
    );
    expect(jobInsert.status, JSON.stringify(jobInsert.body)).toBeLessThan(300);

    for (const [table, id] of [
      ["project_intelligence_meeting_proposals", proposalId],
      ["project_intelligence_meeting_minutes", minutesId],
      ["project_intelligence_meeting_jobs", jobId],
    ] as const) {
      const owner = await rest(`${table}?select=id&id=eq.${id}`, {}, users.owner.jwt);
      expect(owner.status, `${table} owner`).toBe(200);
      expect(ids(owner.body)).toContain(id);

      const other = await rest(`${table}?select=id&id=eq.${id}`, {}, users.otherTenantOwner.jwt);
      expect(other.status, `${table} other tenant`).toBe(200);
      expect(ids(other.body), `${table} other tenant must not see row`).toEqual([]);

      const anon = await rest(`${table}?select=id&id=eq.${id}`);
      expect(anon.status).toBe(200);
      expect(ids(anon.body)).toEqual([]);
    }
  });
});
