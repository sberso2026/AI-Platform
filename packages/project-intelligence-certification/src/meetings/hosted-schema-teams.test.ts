import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const enabled = process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1";
const BATCH_40 = "20260714140000_batch_40_project_intelligence_teams_provider.sql";

const REQUIRED_TABLES = [
  "project_intelligence_meeting_provider_connections",
  "project_intelligence_meeting_provider_mappings",
  "project_intelligence_meeting_graph_subscriptions",
  "project_intelligence_meeting_provider_events",
  "project_intelligence_meeting_provider_health",
] as const;

describe.skipIf(!enabled)("Gate B — hosted Batch 40 Teams provider schema", () => {
  it("verifies Teams provider tables on hosted staging", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const expectedRef = process.env.PROJECT_INTELLIGENCE_CERTIFICATION_PROJECT_REF;
    expect(url).toBeTruthy();
    expect(serviceKey).toBeTruthy();
    expect(expectedRef).toBeTruthy();
    expect(url!.match(/https:\/\/([^.]+)/)?.[1]).toBe(expectedRef);

    const migrationPath = resolve(process.cwd(), "../../supabase/migrations", BATCH_40);
    const checksum = createHash("sha256").update(readFileSync(migrationPath)).digest("hex");
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
