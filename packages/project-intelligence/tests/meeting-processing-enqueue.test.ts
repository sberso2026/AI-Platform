import { describe, expect, it } from "vitest";
import { MeetingProcessingService } from "../src/meetings/meeting-processing-service";
import { MeetingIntelligenceError } from "../src/meetings/errors";
import type { MeetingQueryBuilder, MeetingSupabaseClient } from "../src/meetings/supabase-types";

type Row = Record<string, unknown>;

function createMemoryClient(seed: {
  session: Row;
  segments?: Row[];
  jobs?: Row[];
  runs?: Row[];
  outbox?: Row[];
  events?: Row[];
}): MeetingSupabaseClient & { store: typeof seed } {
  const store = {
    session: { ...seed.session },
    segments: [...(seed.segments ?? [])],
    jobs: [...(seed.jobs ?? [])],
    runs: [...(seed.runs ?? [])],
    outbox: [...(seed.outbox ?? [])],
    events: [...(seed.events ?? [])],
  };

  function tableRows(table: string): Row[] {
    if (table === "project_intelligence_meeting_sessions") return [store.session];
    if (table === "project_intelligence_transcript_segments") return store.segments;
    if (table === "project_intelligence_meeting_jobs") return store.jobs;
    if (table === "project_intelligence_meeting_processing_runs") return store.runs;
    if (table === "project_intelligence_meeting_outbox") return store.outbox;
    if (table === "project_intelligence_meeting_events") return store.events;
    return [];
  }

  function setTable(table: string, rows: Row[]) {
    if (table === "project_intelligence_meeting_sessions") store.session = rows[0] ?? store.session;
    if (table === "project_intelligence_transcript_segments") store.segments = rows;
    if (table === "project_intelligence_meeting_jobs") store.jobs = rows;
    if (table === "project_intelligence_meeting_processing_runs") store.runs = rows;
    if (table === "project_intelligence_meeting_outbox") store.outbox = rows;
    if (table === "project_intelligence_meeting_events") store.events = rows;
  }

  function builder(table: string): MeetingQueryBuilder {
    let filters: Array<(row: Row) => boolean> = [];
    let orderCol: string | null = null;
    let ascending = true;
    let limitN: number | null = null;
    let pendingInsert: Row | Row[] | null = null;
    let pendingUpdate: Row | null = null;
    let mode: "select" | "insert" | "update" = "select";

    const api = {
      select(_columns?: string) {
        mode = mode === "insert" || mode === "update" ? mode : "select";
        return api;
      },
      insert(values: unknown) {
        mode = "insert";
        pendingInsert = values as Row | Row[];
        return api;
      },
      update(values: unknown) {
        mode = "update";
        pendingUpdate = values as Row;
        return api;
      },
      delete() {
        return api;
      },
      eq(column: string, value: unknown) {
        filters.push((row) => row[column] === value);
        return api;
      },
      neq(column: string, value: unknown) {
        filters.push((row) => row[column] !== value);
        return api;
      },
      is(column: string, value: unknown) {
        filters.push((row) => row[column] === value);
        return api;
      },
      order(column: string, options?: Record<string, unknown>) {
        orderCol = column;
        ascending = options?.ascending !== false;
        return api;
      },
      limit(count: number) {
        limitN = count;
        return api;
      },
      async maybeSingle() {
        const list = await resolveList();
        return { data: list.data?.[0] ?? null, error: list.error };
      },
      async single() {
        const list = await resolveList();
        return { data: list.data?.[0] ?? null, error: list.error };
      },
      then(resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) {
        return resolveList().then(resolve, reject);
      },
    };

    async function resolveList() {
      if (mode === "insert" && pendingInsert) {
        const rows = Array.isArray(pendingInsert) ? pendingInsert : [pendingInsert];
        const existing = tableRows(table);
        // Idempotency collision for jobs
        if (table === "project_intelligence_meeting_jobs") {
          for (const row of rows) {
            if (row.idempotency_key && existing.some((e) => e.idempotency_key === row.idempotency_key)) {
              return { data: null, error: { message: "duplicate", code: "23505" } };
            }
          }
        }
        if (table === "project_intelligence_meeting_processing_runs") {
          for (const row of rows) {
            if (
              ["queued", "claimed", "running", "retry_pending"].includes(String(row.status))
              && existing.some((e) =>
                e.meeting_session_id === row.meeting_session_id
                && ["queued", "claimed", "running", "retry_pending"].includes(String(e.status)),
              )
            ) {
              return { data: null, error: { message: "duplicate active run", code: "23505" } };
            }
          }
        }
        setTable(table, [...existing, ...rows]);
        return { data: rows, error: null };
      }

      let rows = tableRows(table).filter((row) => filters.every((f) => f(row)));
      if (mode === "update" && pendingUpdate) {
        const next = tableRows(table).map((row) => {
          if (!filters.every((f) => f(row))) return row;
          if (table === "project_intelligence_meeting_sessions") {
            store.session = { ...row, ...pendingUpdate };
            return store.session;
          }
          return { ...row, ...pendingUpdate };
        });
        if (table !== "project_intelligence_meeting_sessions") setTable(table, next);
        rows = next.filter((row) => {
          // Re-apply identity filters loosely for returned row
          return true;
        });
        const updated = table === "project_intelligence_meeting_sessions"
          ? [store.session]
          : next.filter((row) => filters.every((f) => {
            // After update, status/version filters may no longer match; return updated session via maybeSingle path
            return Object.keys(pendingUpdate!).every(() => true);
          }));
        return {
          data: table === "project_intelligence_meeting_sessions" ? [store.session] : updated.slice(0, 1),
          error: null,
        };
      }

      if (orderCol) {
        rows = [...rows].sort((a, b) => {
          const av = a[orderCol!] as string | number;
          const bv = b[orderCol!] as string | number;
          if (av === bv) return 0;
          const cmp = av > bv ? 1 : -1;
          return ascending ? cmp : -cmp;
        });
      }
      if (limitN != null) rows = rows.slice(0, limitN);
      return { data: rows, error: null };
    }

    return api as unknown as MeetingQueryBuilder;
  }

  return {
    store,
    from(table: string) {
      return builder(table);
    },
  };
}

describe("meeting processing enqueue (mocked supabase)", () => {
  it("transitions ended→processing and enqueues job + run + outbox without running AI", async () => {
    const client = createMemoryClient({
      session: {
        id: "m1",
        tenant_id: "t1",
        workspace_id: "w1",
        engineering_project_id: null,
        title: "Standup",
        description: null,
        agenda: null,
        provider: "manual",
        status: "ended",
        state_version: 3,
        scheduled_start_at: null,
        scheduled_end_at: null,
        actual_start_at: null,
        actual_end_at: null,
        timezone: null,
        organizer_user_id: "u1",
        recording_notice_required: "unknown",
        recording_notice_text: null,
        consent_policy: null,
        consent_status: "not_requested",
        jurisdiction: null,
        retention_policy_id: null,
        legal_hold: false,
        privacy_classification: "internal",
        metadata: {},
        correlation_id: "c1",
        created_at: "2026-07-14T00:00:00.000Z",
        updated_at: "2026-07-14T00:00:00.000Z",
        archived_at: null,
      },
      segments: [
        {
          id: "s1",
          meeting_session_id: "m1",
          tenant_id: "t1",
          workspace_id: "w1",
          text: "ACTION: Ship",
          logical_sequence: 0,
          revision_number: 1,
          status: "active",
          content_checksum: "abc",
        },
      ],
    });

    const service = new MeetingProcessingService(client);
    const actor = { tenantId: "t1", workspaceId: "w1", userId: "u1", correlationId: "c1" };
    const first = await service.enqueueProcessing(actor, "m1");
    expect(first.accepted).toBe(true);
    expect(first.reused).toBe(false);
    expect(first.jobId).toBeTruthy();
    expect(first.processingRunId).toBeTruthy();
    expect(client.store.session.status).toBe("processing");
    expect(client.store.jobs).toHaveLength(1);
    expect(client.store.runs).toHaveLength(1);
    expect(client.store.outbox).toHaveLength(1);
    expect(client.store.jobs[0]!.job_type).toBe("project_intelligence.meeting.process_transcript");

    const second = await service.enqueueProcessing(actor, "m1");
    expect(second.accepted).toBe(true);
    expect(second.reused).toBe(true);
    expect(second.jobId).toBe(first.jobId);
    expect(client.store.jobs).toHaveLength(1);
  });

  it("rejects enqueue from draft", async () => {
    const client = createMemoryClient({
      session: {
        id: "m2",
        tenant_id: "t1",
        workspace_id: "w1",
        engineering_project_id: null,
        title: "Draft",
        description: null,
        agenda: null,
        provider: "manual",
        status: "draft",
        state_version: 1,
        scheduled_start_at: null,
        scheduled_end_at: null,
        actual_start_at: null,
        actual_end_at: null,
        timezone: null,
        organizer_user_id: "u1",
        recording_notice_required: "unknown",
        recording_notice_text: null,
        consent_policy: null,
        consent_status: "not_requested",
        jurisdiction: null,
        retention_policy_id: null,
        legal_hold: false,
        privacy_classification: "internal",
        metadata: {},
        correlation_id: null,
        created_at: "2026-07-14T00:00:00.000Z",
        updated_at: "2026-07-14T00:00:00.000Z",
        archived_at: null,
      },
    });
    const service = new MeetingProcessingService(client);
    await expect(
      service.enqueueProcessing({ tenantId: "t1", workspaceId: "w1", userId: "u1" }, "m2"),
    ).rejects.toBeInstanceOf(MeetingIntelligenceError);
  });
});
