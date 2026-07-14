import { createClient } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";

const enabled =
  process.env.PROJECT_INTELLIGENCE_CERTIFICATION === "1" &&
  process.env.PI_TEAMS_PROVIDER_CERTIFICATION === "1";

describe.skipIf(!enabled)("Gate C — Teams provider connection RLS", () => {
  it("anonymous cannot read provider connections", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(url && anon).toBeTruthy();
    const client = createClient(url!, anon!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await client
      .from("project_intelligence_meeting_provider_connections")
      .select("id")
      .limit(5);
    // Either error or empty is acceptable; must not leak cross-tenant rows as service.
    expect(error || (data?.length ?? 0) === 0).toBeTruthy();
  });

  it("service role can probe provider tables", async () => {
    const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const client = createClient(url!, serviceKey!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    for (const table of [
      "project_intelligence_meeting_provider_connections",
      "project_intelligence_meeting_provider_mappings",
      "project_intelligence_meeting_provider_events",
      "project_intelligence_meeting_graph_subscriptions",
    ]) {
      const { error } = await client.from(table).select("id", { count: "exact", head: true });
      expect(error, table).toBeNull();
    }
  });
});
