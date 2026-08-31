/**
 * II-6R region-close PostgREST diagnostic.
 * Runs in the Engineering OS Supabase project region (ap-southeast-2).
 * Does not serve product traffic or bypass RLS. User JWT required.
 */
const TABLES = [
  "inspection_plans",
  "inspection_sessions",
  "inspection_evidence",
  "inspection_defects",
  "inspection_corrective_actions",
  "inspection_verifications",
  "inspection_condition_ratings",
  "inspection_reporting_outputs",
] as const;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }
  const auth = req.headers.get("Authorization") ?? "";
  if (!auth.startsWith("Bearer ")) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  if (!supabaseUrl || !anon) {
    return Response.json({ error: "runtime_env_missing" }, { status: 500 });
  }

  const rest = async (path: string) => {
    const started = Date.now();
    const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
      headers: {
        apikey: anon,
        Authorization: auth,
        Prefer: "count=exact",
      },
    });
    const body = await response.text();
    return {
      status: response.status,
      ms: Date.now() - started,
      bytes: body.length,
      contentRange: response.headers.get("content-range"),
    };
  };

  const ping = await rest("tenants?select=id&limit=1");
  const ping2 = await rest("tenants?select=id&limit=1");
  const sessions = await rest("inspection_sessions?select=id,status,updated_at&limit=50");
  const parallelStarted = Date.now();
  const parallel = await Promise.all(
    TABLES.map(async (table) => [table, await rest(`${table}?select=id&limit=50`)] as const),
  );
  const parallelMs = Date.now() - parallelStarted;

  return Response.json({
    runtime: "supabase-edge-functions",
    regionHint: "ap-southeast-2",
    ping,
    pingWarm: ping2,
    sessions,
    commandCentreParallelMs: parallelMs,
    commandCentre: Object.fromEntries(parallel),
  });
});
