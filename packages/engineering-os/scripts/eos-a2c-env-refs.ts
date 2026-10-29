import { existsSync, readFileSync } from "node:fs";

function parse(src: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    parsed[key] = value;
  }
  return parsed;
}

function refFrom(value: string | undefined): string | null {
  if (!value) return null;
  const http = value.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/i);
  if (http) return http[1];
  const db = value.match(/db\.([a-z0-9]+)\.supabase\.co/i);
  if (db) return db[1];
  if (value.includes("postgresql://") || value.includes("postgres://")) return "HAS_DB_URL";
  return "NON_URL_SET";
}

function report(file: string) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ file, exists: false }));
    return;
  }
  const parsed = parse(readFileSync(file, "utf8"));
  const keys = [
    "REVIEW_STAGING_SUPABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_TEST_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "REVIEW_STAGING_SUPABASE_DB_URL",
    "SUPABASE_DB_URL",
    "DATABASE_URL",
  ];
  const refs: Record<string, string | null> = {};
  for (const key of keys) {
    if (parsed[key]) refs[key] = refFrom(parsed[key]);
  }
  console.log(
    JSON.stringify({
      file,
      exists: true,
      refs,
      has_review_staging_anon: Boolean(parsed.REVIEW_STAGING_SUPABASE_ANON_KEY),
      has_review_staging_service: Boolean(parsed.REVIEW_STAGING_SUPABASE_SERVICE_ROLE_KEY),
      has_service_role: Boolean(parsed.SUPABASE_SERVICE_ROLE_KEY),
      has_anon: Boolean(parsed.SUPABASE_ANON_KEY || parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    }),
  );
}

report(".env.local");
report("apps/web/.env.local");
