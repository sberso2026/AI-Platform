/**
 * Read-only hosted inventory against RTB AI Platform Staging.
 * Uses a temporary workdir so repo-root .env.local cannot hijack the link.
 * Never prints secret values.
 */
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const STAGING_REF = "rntonzigxwxcjlcsadip";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function redact(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((line) => !/password|secret|key|token|postgres:\/\//i.test(line))
    .join("\n");
}

function run(command: string, workdir: string) {
  const result = spawnSync(command, {
    cwd: workdir,
    encoding: "utf8",
    shell: true,
    env: {
      ...process.env,
      SUPABASE_WORKDIR: workdir,
    },
  });
  return {
    status: result.status,
    error: result.error?.message,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    redacted: redact(`${result.stdout ?? ""}\n${result.stderr ?? ""}`),
  };
}

const sqlPath = process.argv[2];
if (!sqlPath) {
  console.error("usage: rtb-sec-rls-1-query-staging.ts <sql-file>");
  process.exit(2);
}
const absSql = resolve(process.cwd(), sqlPath);
const sql = readFileSync(absSql, "utf8");
if (/drop\s+table|truncate|delete\s+from/i.test(sql)) {
  throw new Error("refusing destructive SQL");
}

const workdir = mkdtempSync(join(tmpdir(), "rtb-sec-rls-1-"));
try {
  copyFileSync(absSql, join(workdir, "query.sql"));
  const linked = run(`npx --yes supabase link --project-ref ${STAGING_REF} --yes`, workdir);
  if (linked.status !== 0) {
    console.error(JSON.stringify({ step: "link", target: STAGING_REF, status: linked.status }));
    console.error(linked.redacted);
    throw new Error("supabase link failed");
  }
  const queried = run("npx --yes supabase db query --linked -f query.sql", workdir);
  if (queried.status !== 0) {
    console.error(JSON.stringify({ step: "query", target: STAGING_REF, status: queried.status }));
    console.error(queried.redacted);
    throw new Error("hosted query failed");
  }
  const outPath = process.argv[3];
  if (outPath) {
    writeFileSync(resolve(process.cwd(), outPath), queried.stdout, "utf8");
  }
  process.stdout.write(queried.stdout);
} finally {
  rmSync(workdir, { recursive: true, force: true });
}
