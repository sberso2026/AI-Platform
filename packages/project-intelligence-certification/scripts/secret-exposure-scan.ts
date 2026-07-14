import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(process.cwd(), "../..");
const PACKAGE = process.cwd();

const SECRET_ENV_NAMES = [
  "PLATFORM_EMBEDDING_API_KEY",
  "OPENAI_API_KEY",
  "AZURE_DOCUMENT_INTELLIGENCE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "MICROSOFT_CLIENT_SECRET",
  "MICROSOFT_GRAPH_WEBHOOK_SECRET",
  "PI_TEAMS_CLIENT_SECRET",
  "PI_TEAMS_WEBHOOK_CLIENT_STATE",
] as const;

function collectFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git") continue;
      collectFiles(full, acc);
    } else if (st.isFile() && st.size < 5_000_000) {
      acc.push(full);
    }
  }
  return acc;
}

function scan(): { ok: boolean; hits: string[] } {
  const needles = SECRET_ENV_NAMES
    .map((name) => process.env[name]?.trim())
    .filter((value): value is string => Boolean(value) && value.length >= 12)
    .filter(
      (value) =>
        value !== "fixture-secret" &&
        value !== "fixture-webhook-client-state" &&
        !value.startsWith("fixture-"),
    );

  // Never log needle values. Only compare presence of exact substrings in artifacts.
  const targets = [
    resolve(ROOT, "apps/web/.next/static"),
    resolve(PACKAGE, "artifacts"),
    resolve(PACKAGE, "test-results"),
    resolve(PACKAGE, "playwright-report"),
  ];

  const hits: string[] = [];
  for (const target of targets) {
    for (const file of collectFiles(target)) {
      let content: string;
      try {
        content = readFileSync(file, "utf8");
      } catch {
        continue;
      }
      for (const needle of needles) {
        if (content.includes(needle)) {
          hits.push(file.replace(ROOT, "."));
          break;
        }
      }
    }
  }

  return { ok: hits.length === 0, hits };
}

const result = scan();
if (!result.ok) {
  console.error(`[secret-scan] FAIL exposure detected in ${result.hits.length} files (paths only)`);
  for (const hit of result.hits.slice(0, 20)) console.error(`- ${hit}`);
  process.exitCode = 1;
} else {
  const fingerprint = createHash("sha256").update("secret-scan-v1").digest("hex").slice(0, 12);
  console.log(`[secret-scan] PASS scan=${fingerprint} files_checked_roots=4`);
}
