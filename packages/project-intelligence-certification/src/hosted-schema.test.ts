import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const REQUIRED_TABLES = [
  "project_intelligence_project_mappings",
  "project_intelligence_mapping_audit",
] as const;
const MIGRATION_FILE = "20260712000000_batch_34_project_intelligence_mappings.sql";

describe.skipIf(!enabled)("Gate B — hosted mapping schema verification", () => {
  it("verifies mapping tables exist on hosted staging", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(url, "hosted Supabase URL").toBeTruthy();
    expect(serviceKey, "service role key").toBeTruthy();

    const expectedRef = process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
    const actualRef = url!.match(/https:\/\/([^.]+)/)?.[1];
    expect(actualRef).toBe(expectedRef);

    const migrationPath = resolve(process.cwd(), "../../supabase/migrations", MIGRATION_FILE);
    const checksum = createHash("sha256").update(readFileSync(migrationPath)).digest("hex").slice(0, 16);
    expect(checksum.length).toBe(16);

    const supabase = createClient(url!, serviceKey!, { auth: { persistSession: false, autoRefreshToken: false } });
    for (const table of REQUIRED_TABLES) {
      const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
      expect(error, `${table} must exist`).toBeNull();
    }
  });
});
