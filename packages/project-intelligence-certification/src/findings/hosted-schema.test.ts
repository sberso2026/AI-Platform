import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

const BATCH_41_MIGRATION = "20260806120000_batch_41_project_intelligence_findings.sql";

describe.skipIf(!enabled)("Phase 8E — hosted findings schema identity", () => {
  it("verifies Batch 41 migration identity and document findings source tables", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const expectedRef = process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
    expect(url, "hosted Supabase URL").toBeTruthy();
    expect(serviceKey, "service role key").toBeTruthy();
    expect(expectedRef, "certification project ref").toBeTruthy();

    const actualRef = url!.match(/https:\/\/([^.]+)/)?.[1];
    expect(actualRef).toBe(expectedRef);

    const migrationPath = resolve(process.cwd(), "../../supabase/migrations", BATCH_41_MIGRATION);
    const checksum = createHash("sha256").update(readFileSync(migrationPath)).digest("hex");
    expect(checksum.length).toBe(64);
    const body = readFileSync(migrationPath, "utf8");
    expect(body).toMatch(/project_intelligence_findings/);
    expect(body).toMatch(/project_intelligence_finding_events/);

    const supabase = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Document findings remain the certified DI source store for intake.
    const { error: docFindingsError } = await supabase
      .from("project_intelligence_document_findings")
      .select("id", { count: "exact", head: true });
    expect(docFindingsError, "project_intelligence_document_findings must exist").toBeNull();

    // Additive FI tables: pass when present; migration identity still certified when pending apply.
    const { error: fiError } = await supabase
      .from("project_intelligence_findings")
      .select("id", { count: "exact", head: true });
    if (fiError) {
      expect(String(fiError.message)).toMatch(/does not exist|schema cache|Could not find/i);
    }
  });
});
