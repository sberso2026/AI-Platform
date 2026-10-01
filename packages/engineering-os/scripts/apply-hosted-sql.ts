/**
 * Apply SQL files to linked staging without parsing the repository .env.local.
 * Copies supabase/config.toml + supabase/.temp into an isolated workdir (no env file).
 * Never prints secret values. Removes the temporary workdir afterwards.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ENV_KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;

function repoRoot(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
}

function checksum(sql: string): string {
  return createHash("sha256").update(sql).digest("hex");
}

function diagnoseEnvParse(filePath: string): { invalidKeyKinds: string[]; lineCount: number } {
  if (!existsSync(filePath)) return { invalidKeyKinds: [], lineCount: 0 };
  const invalidKeyKinds: string[] = [];
  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) {
      invalidKeyKinds.push("missing_equals_or_empty_key");
      continue;
    }
    const key = line.slice(0, eq).trim();
    if (key.startsWith("export ")) {
      invalidKeyKinds.push("export_prefix");
      continue;
    }
    if (key.includes("-")) invalidKeyKinds.push("hyphenated_key");
    else if (key.includes("$")) invalidKeyKinds.push("dollar_in_key");
    else if (key.includes(".")) invalidKeyKinds.push("dotted_key");
    else if (key.includes(":")) invalidKeyKinds.push("colon_in_key");
    else if (!ENV_KEY_RE.test(key)) invalidKeyKinds.push("non_identifier_key");
  }
  return { invalidKeyKinds: [...new Set(invalidKeyKinds)], lineCount: lines.length };
}

function filterCliText(text: string): string {
  return text
    .split("\n")
    .filter((line) => !/password|secret|key|token|jwt|postgresql:\/\//i.test(line))
    .join("\n");
}

export async function applyHostedSqlFiles(files: string[]): Promise<{
  applied: string[];
  failed: string | null;
  envParse: { invalidKeyKinds: string[]; lineCount: number };
  via: string;
}> {
  const root = repoRoot();
  const envParse = diagnoseEnvParse(join(root, ".env.local"));
  const work = mkdtempSync(join(tmpdir(), "eos-a8bc-"));
  const applied: string[] = [];
  try {
    mkdirSync(join(work, "supabase"), { recursive: true });
    cpSync(join(root, "supabase", "config.toml"), join(work, "supabase", "config.toml"));
    cpSync(join(root, "supabase", ".temp"), join(work, "supabase", ".temp"), { recursive: true });
    writeFileSync(join(work, ".gitignore"), "*\n", "utf8");

    for (const relative of files) {
      const filePath = join(root, relative);
      const sql = readFileSync(filePath, "utf8");
      const staged = join(work, `apply-${applied.length}.sql`);
      writeFileSync(staged, sql, "utf8");
      console.log(JSON.stringify({ file: relative, checksum: checksum(sql), bytes: sql.length }));
      const cmd = `npx --yes supabase@2.119.0 db query --workdir "${work}" --linked -f "${staged}"`;
      const result = spawnSync(cmd, { cwd: work, encoding: "utf8", shell: true });
      if (result.status !== 0) {
        if (result.stderr) console.error(filterCliText(result.stderr));
        if (result.stdout) console.error(filterCliText(result.stdout));
        return { applied, failed: relative, envParse, via: "isolated_supabase_workdir" };
      }
      if (result.stdout) console.log(filterCliText(result.stdout).trim());
      applied.push(relative);
    }
    return { applied, failed: null, envParse, via: "isolated_supabase_workdir" };
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

const isDirect = process.argv[1]?.includes("apply-hosted-sql");
if (isDirect) {
  const files = process.argv.slice(2);
  if (!files.length) {
    console.error(JSON.stringify({ error: "sql_files_required" }));
    process.exit(1);
  }
  applyHostedSqlFiles(files).then((result) => {
    console.log(JSON.stringify({
      applied: result.applied,
      failed: result.failed,
      via: result.via,
      env_parse_invalid_key_kinds: result.envParse.invalidKeyKinds,
      env_parse_line_count: result.envParse.lineCount,
      temporary_env_files_removed: true,
    }));
    process.exit(result.failed ? 1 : 0);
  });
}
