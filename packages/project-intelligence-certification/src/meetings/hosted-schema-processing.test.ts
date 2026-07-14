import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

const BATCH_38_MIGRATION = "20260713120000_batch_38_project_intelligence_meeting_foundation.sql";
const BATCH_39_MIGRATION = "20260714120000_batch_39_project_intelligence_meeting_processing.sql";

const REQUIRED_TABLES = [
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

describe.skipIf(!enabled)("Gate B — hosted Batch 38+39 meeting processing schema", () => {
  it("verifies Batch 38/39 tables and Batch 39 columns on hosted staging", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const expectedRef = process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
    expect(url, "hosted Supabase URL").toBeTruthy();
    expect(serviceKey, "service role key").toBeTruthy();
    expect(expectedRef, "certification project ref").toBeTruthy();

    const actualRef = url!.match(/https:\/\/([^.]+)/)?.[1];
    expect(actualRef).toBe(expectedRef);

    for (const file of [BATCH_38_MIGRATION, BATCH_39_MIGRATION]) {
      const migrationPath = resolve(process.cwd(), "../../supabase/migrations", file);
      const checksum = createHash("sha256").update(readFileSync(migrationPath)).digest("hex");
      expect(checksum.length).toBe(64);
      expect(checksum).toMatch(/^[a-f0-9]{64}$/);
    }

    const supabase = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
      expect(error, `${table} must exist`).toBeNull();
    }

    const { error: segmentColumnError } = await supabase
      .from("project_intelligence_transcript_segments")
      .select("id,logical_sequence,server_received_at,normalized_text,content_checksum")
      .limit(1);
    expect(segmentColumnError, "Batch 39 transcript columns").toBeNull();

    const { error: jobColumnError } = await supabase
      .from("project_intelligence_meeting_jobs")
      .select("id,idempotency_key,processing_run_id")
      .limit(1);
    expect(jobColumnError, "Batch 39 job columns").toBeNull();

    const { error: claimError } = await supabase.rpc("pi_meeting_claim_jobs", {
      p_worker_id: "schema-verify-probe",
      p_limit: 1,
      p_lease_seconds: 30,
    });
    // RPC must exist; empty claim set is fine. Missing function yields a PostgREST error.
    expect(claimError, `pi_meeting_claim_jobs must exist: ${claimError?.message ?? ""}`).toBeNull();
  });
});
