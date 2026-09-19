import { existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const REVIEW_TABLES = [
  "engineering_review_packages",
  "engineering_review_runs",
  "engineering_review_findings",
  "engineering_review_evidence",
  "engineering_review_dispositions",
] as const;

export function loadLocalEnv(): void {
  const roots = [
    process.cwd(),
    resolve(process.cwd(), "../.."),
    resolve(dirname(fileURLToPath(import.meta.url)), "../../.."),
  ];
  for (const root of roots) {
    for (const name of [".env.local", ".env"]) {
      const path = resolve(root, name);
      if (!existsSync(path)) continue;
      for (const raw of readFileSync(path, "utf8").split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith("#")) continue;
        const eq = line.indexOf("=");
        if (eq <= 0) continue;
        const key = line.slice(0, eq).trim();
        let value = line.slice(eq + 1).trim();
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }
        if (process.env[key] === undefined || process.env[key] === "") {
          process.env[key] = value;
        }
      }
    }
  }
}

export function resolveSupabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL ??
    process.env.SUPABASE_TEST_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

export function resolveSupabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY ??
    process.env.SUPABASE_TEST_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function resolveServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function certUserPassword(): string {
  return process.env.CERT_USER_PASSWORD ?? "CertInstall!Phase3";
}

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export type LiveRlsMode = "run" | "skip" | "misconfigured";

export function liveRlsMode(): LiveRlsMode {
  loadLocalEnv();
  if (process.env.ENGINEERING_REVIEW_RLS === "0") return "skip";
  const creds = Boolean(resolveSupabaseUrl() && resolveSupabaseAnonKey() && resolveServiceRoleKey());
  if (process.env.ENGINEERING_REVIEW_RLS === "1") return creds ? "run" : "misconfigured";
  return creds ? "run" : "skip";
}
