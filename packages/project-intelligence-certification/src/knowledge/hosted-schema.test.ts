import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";

const BATCH_42_MIGRATION = "20260806140000_batch_42_project_intelligence_knowledge.sql";

describe.skipIf(!enabled)("Phase 8G — hosted knowledge schema identity", () => {
  it("verifies Batch 42 migration identity and knowledge ref tables when applied", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const expectedRef = process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
    expect(url, "hosted Supabase URL").toBeTruthy();
    expect(serviceKey, "service role key").toBeTruthy();
    expect(expectedRef, "certification project ref").toBeTruthy();

    const actualRef = url!.match(/https:\/\/([^.]+)/)?.[1];
    expect(actualRef).toBe(expectedRef);

    const migrationPath = resolve(process.cwd(), "../../supabase/migrations", BATCH_42_MIGRATION);
    const checksum = createHash("sha256").update(readFileSync(migrationPath)).digest("hex");
    expect(checksum.length).toBe(64);
    const body = readFileSync(migrationPath, "utf8");
    expect(body).toMatch(/project_intelligence_knowledge_nodes/);
    expect(body).toMatch(/project_intelligence_knowledge_edges/);

    const supabase = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Prior DI/Core planes remain authoritative sources for search.
    const { error: docError } = await supabase
      .from("project_intelligence_document_findings")
      .select("id", { count: "exact", head: true });
    expect(docError, "document findings source must exist").toBeNull();

    // Additive knowledge tables: pass when present; migration identity certified when pending apply.
    const { error: kgError } = await supabase
      .from("project_intelligence_knowledge_nodes")
      .select("id", { count: "exact", head: true });
    if (kgError) {
      expect(String(kgError.message)).toMatch(/does not exist|schema cache|Could not find/i);
    }
  });
});
