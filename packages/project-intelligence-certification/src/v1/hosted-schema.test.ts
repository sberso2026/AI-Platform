import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

const PI_V1_MIGRATIONS = [
  "20260712000000_batch_34_project_intelligence_mappings.sql",
  "20260712180000_batch_36_project_intelligence_documents.sql",
  "20260712200000_batch_37_project_intelligence_document_runtime.sql",
  "20260712201000_batch_37b_project_intelligence_document_search.sql",
  "20260713120000_batch_38_project_intelligence_meeting_foundation.sql",
  "20260714120000_batch_39_project_intelligence_meeting_processing.sql",
  "20260714140000_batch_40_project_intelligence_teams_provider.sql",
  "20260806120000_batch_41_project_intelligence_findings.sql",
  "20260806140000_batch_42_project_intelligence_knowledge.sql",
] as const;

const REQUIRED_TABLES = [
  "project_intelligence_project_mappings",
  "project_intelligence_document_findings",
  "project_intelligence_findings",
  "project_intelligence_knowledge_nodes",
  "project_intelligence_knowledge_edges",
] as const;

describe.skipIf(!enabled)("Phase 8I — hosted PI V1 schema identity", () => {
  it("verifies migration identity and required tables are physically present", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const expectedRef = process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
    expect(url).toBeTruthy();
    expect(serviceKey).toBeTruthy();
    expect(expectedRef).toBeTruthy();
    expect(url!.match(/https:\/\/([^.]+)/)?.[1]).toBe(expectedRef);

    const checksums: string[] = [];
    for (const file of PI_V1_MIGRATIONS) {
      const path = resolve(process.cwd(), "../../supabase/migrations", file);
      expect(existsSync(path), file).toBe(true);
      checksums.push(createHash("sha256").update(readFileSync(path)).digest("hex"));
    }
    expect(new Set(checksums).size).toBe(checksums.length);

    const supabase = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
      expect(error, `${table} must exist on hosted staging for PI V1.0`).toBeNull();
    }
  });
});
