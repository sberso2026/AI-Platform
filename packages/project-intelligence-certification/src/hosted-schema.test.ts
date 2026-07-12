import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const REQUIRED_TABLES = [
  "project_intelligence_project_mappings",
  "project_intelligence_mapping_audit",
  "project_intelligence_document_ingestions",
  "project_intelligence_document_processing_runs",
  "project_intelligence_document_chunks",
  "project_intelligence_document_embeddings",
  "project_intelligence_document_findings",
  "project_intelligence_document_review_items",
  "project_intelligence_document_jobs",
  "project_intelligence_document_outbox",
  "project_intelligence_document_worker_leases",
  "project_intelligence_document_dead_letters",
  "project_intelligence_document_processing_steps",
] as const;
const MIGRATION_FILES = [
  "20260712000000_batch_34_project_intelligence_mappings.sql",
  "20260712180000_batch_36_project_intelligence_documents.sql",
  "20260712200000_batch_37_project_intelligence_document_runtime.sql",
  "20260712201000_batch_37b_project_intelligence_document_search.sql",
  "20260712202000_batch_37c_enqueue_tenant_guard.sql",
] as const;

describe.skipIf(!enabled)("Gate B — hosted document-intelligence schema verification", () => {
  it("verifies mapping and document intelligence tables exist on hosted staging", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(url, "hosted Supabase URL").toBeTruthy();
    expect(serviceKey, "service role key").toBeTruthy();

    const expectedRef = process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
    const actualRef = url!.match(/https:\/\/([^.]+)/)?.[1];
    expect(actualRef).toBe(expectedRef);

    for (const file of MIGRATION_FILES) {
      const migrationPath = resolve(process.cwd(), "../../supabase/migrations", file);
      const checksum = createHash("sha256").update(readFileSync(migrationPath)).digest("hex").slice(0, 16);
      expect(checksum.length).toBe(16);
    }

    const supabase = createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
      expect(error, `${table} must exist`).toBeNull();
    }
  });
});
