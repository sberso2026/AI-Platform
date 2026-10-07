/**
 * Read-only hosted inventory against RTB AI Platform production (Engineering OS).
 * Uses a temporary workdir so repo-root .env.local cannot hijack the link.
 * Never prints secret values. Never targets staging or Inspection Intelligence.
 */
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PRODUCTION_REF = "wcydlhqiqdwgoaqrlget";
const STAGING_REF = "rntonzigxwxcjlcsadip";
const INSPECTION_REF = "hlqwihvksjgkshipoacd";
const INTRANET_PRODUCTION_REF = "vspyrlgvkpcsprzvrorb";

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
  console.error("usage: rtb-sec-rls-1b-query-production.ts <sql-file>");
  process.exit(2);
}
const forbidden = new Set<string>([STAGING_REF, INSPECTION_REF, INTRANET_PRODUCTION_REF]);
if (forbidden.has(PRODUCTION_REF)) {
  throw new Error("production query runner refused a non-production project ref");
}

const absSql = resolve(process.cwd(), sqlPath);
const sql = readFileSync(absSql, "utf8");
if (/drop\s+table|truncate|delete\s+from|alter\s+table|create\s+|revoke\s+|grant\s+|insert\s+|update\s+/i.test(sql)) {
  throw new Error("refusing mutating SQL on production query runner");
}

const workdir = mkdtempSync(join(tmpdir(), "rtb-sec-rls-1b-"));
try {
  copyFileSync(absSql, join(workdir, "query.sql"));
  const linked = run(`npx --yes supabase link --project-ref ${PRODUCTION_REF} --yes`, workdir);
  if (linked.status !== 0) {
    console.error(JSON.stringify({ step: "link", target: PRODUCTION_REF, status: linked.status }));
    console.error(linked.redacted);
    throw new Error("supabase link failed");
  }
  const queried = run("npx --yes supabase db query --linked -f query.sql", workdir);
  if (queried.status !== 0) {
    console.error(JSON.stringify({ step: "query", target: PRODUCTION_REF, status: queried.status }));
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
