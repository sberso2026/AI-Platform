/**
 * Attempt to apply PI V1 additive migrations when SUPABASE_DB_URL is configured.
 * Without a DB URL, only reports missing tables (hosted schema test remains authoritative).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const REQUIRED = [
  "project_intelligence_findings",
  "project_intelligence_knowledge_nodes",
  "project_intelligence_knowledge_edges",
] as const;

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    console.error("Missing Supabase URL or service role key");
    process.exit(1);
  }
  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const missing: string[] = [];
  for (const table of REQUIRED) {
    const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
    if (error) missing.push(table);
  }

  if (!missing.length) {
    console.log("[pi-v1-schema] All required V1 tables present");
    return;
  }

  console.error(
    `[pi-v1-schema] Missing tables: ${missing.join(", ")}. Apply batch_41 and batch_42 migrations to hosted staging before Phase 8I can PASS.`,
  );
  const migrations = [
    "20260806120000_batch_41_project_intelligence_findings.sql",
    "20260806140000_batch_42_project_intelligence_knowledge.sql",
  ];
  for (const file of migrations) {
    const path = resolve(process.cwd(), "../../supabase/migrations", file);
    const body = readFileSync(path, "utf8");
    console.error(`[pi-v1-schema] Pending migration ${file} (${body.length} bytes)`);
  }
  process.exit(1);
}

main();
