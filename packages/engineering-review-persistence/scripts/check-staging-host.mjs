import { existsSync, readFileSync } from "node:fs";

const files = [".env.local", ".env", "apps/web/.env.local", "apps/web/.env"];
for (const file of files) {
  if (!existsSync(file)) {
    console.log(`${file}: missing`);
    continue;
  }
  const src = readFileSync(file, "utf8");
  const keys = ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL", "REVIEW_STAGING_SUPABASE_URL"];
  for (const key of keys) {
    const re = new RegExp(`${key}\\s*=\\s*["']?([^"'\\r\\n]+)`);
    const match = src.match(re);
    if (!match) continue;
    try {
      const host = new URL(match[1].trim()).hostname;
      const ref = host.endsWith(".supabase.co") ? host.split(".")[0] : "non_supabase";
      console.log(`${file}:${key}:ref=${ref}:staging=${ref === "rntonzigxwxcjlcsadip"}`);
    } catch {
      console.log(`${file}:${key}:unparseable`);
    }
  }
}
