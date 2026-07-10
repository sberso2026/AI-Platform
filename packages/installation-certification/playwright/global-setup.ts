import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;
    const key = match[1].trim();
    const value = match[2].trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

export default function globalSetup(): void {
  const root = resolve(fileURLToPath(new URL("../../..", import.meta.url)));
  loadEnvFile(resolve(root, ".env.local"));

  process.env.SUPABASE_URL ??= process.env.NEXT_PUBLIC_SUPABASE_URL;
  process.env.SUPABASE_ANON_KEY ??= process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  process.env.SUPABASE_TEST_URL ??= process.env.SUPABASE_URL;
  process.env.SUPABASE_TEST_ANON_KEY ??= process.env.SUPABASE_ANON_KEY;
  process.env.INSTALLATION_CERTIFICATION ??= "1";
}
