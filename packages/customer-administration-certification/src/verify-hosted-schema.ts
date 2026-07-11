/**
 * Verifies Batch 33 Growth Credits schema on hosted Supabase.
 */
import { createClient } from "@supabase/supabase-js";

const TABLES = [
  "commercial_growth_credit_accounts",
  "commercial_growth_credit_transactions",
];

async function main(): Promise<void> {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("[phase4:verify-schema] Missing Supabase credentials");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  for (const table of TABLES) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error) {
      console.error(`[phase4:verify-schema] Missing or inaccessible: ${table}`, error.message);
      process.exit(1);
    }
    console.log(`[phase4:verify-schema] Table present: ${table}`);
  }
}

main();
