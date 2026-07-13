import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

const BATCH_38_MIGRATION = "20260713120000_batch_38_project_intelligence_meeting_foundation.sql";

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

describe.skipIf(!enabled)("Gate B — hosted Batch 38 meeting foundation schema", () => {
  it("verifies Batch 38 meeting tables exist on hosted staging", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const expectedRef = process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
    expect(url, "hosted Supabase URL").toBeTruthy();
    expect(serviceKey, "service role key").toBeTruthy();
    expect(expectedRef, "certification project ref").toBeTruthy();

    const actualRef = url!.match(/https:\/\/([^.]+)/)?.[1];
    expect(actualRef).toBe(expectedRef);

    const migrationPath = resolve(process.cwd(), "../../supabase/migrations", BATCH_38_MIGRATION);
    const checksum = createHash("sha256").update(readFileSync(migrationPath)).digest("hex");
    expect(checksum.length).toBe(64);
    expect(checksum).toMatch(/^[a-f0-9]{64}$/);

    const supabase = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
      expect(error, `${table} must exist`).toBeNull();
    }
  });
});
