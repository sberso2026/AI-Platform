/**
 * Lightweight secret exposure scan for Asset Intelligence discovery packages.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");

const SECRET_ENV_NAMES = [
  "PLATFORM_EMBEDDING_API_KEY",
  "OPENAI_API_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "MICROSOFT_CLIENT_SECRET",
] as const;

const SCAN_ROOTS = [
  resolve(root, "packages/asset-intelligence"),
  resolve(root, "packages/asset-intelligence-certification"),
];

function collectFiles(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (entry === "node_modules" || entry === ".git" || entry === "artifacts") continue;
      collectFiles(full, acc);
    } else if (st.isFile() && st.size < 2_000_000) {
      acc.push(full);
    }
  }
  return acc;
}

function main() {
  const files = SCAN_ROOTS.flatMap((d) => collectFiles(d));
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const name of SECRET_ENV_NAMES) {
      const re = new RegExp(`${name}\\s*=\\s*['\"][^'\"]+['\"]`);
      if (re.test(text)) {
        console.error(`Secret-like assignment found for ${name} in ${file}`);
        process.exit(1);
      }
    }
    if (/BEGIN (RSA |OPENSSH )?PRIVATE KEY/.test(text)) {
      console.error(`Private key material found in ${file}`);
      process.exit(1);
    }
  }
  console.log(JSON.stringify({ secretExposureDetected: false, filesScanned: files.length }));
}

main();
