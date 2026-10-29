/**
 * Apply ONLY RTB-SEC-REL-1D residual DEFINER lockdown to Engineering OS production.
 * Never applies unrelated migrations. Never targets staging.
 * Never prints secret values. Never drops the residual function.
 */
import { copyFileSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createHash } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const PRODUCTION_REF = "wcydlhqiqdwgoaqrlget";
const STAGING_REF = "rntonzigxwxcjlcsadip";
const INSPECTION_REF = "hlqwihvksjgkshipoacd";
const INTRANET_PRODUCTION_REF = "vspyrlgvkpcsprzvrorb";
const ALLOWED = "20261007180000_rtb_sec_rel_1d_residual_signup_commercial_lockdown.sql";

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
    env: { ...process.env, SUPABASE_WORKDIR: workdir },
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    redacted: redact(`${result.stdout ?? ""}\n${result.stderr ?? ""}`),
  };
}

const relative = process.argv[2] ?? `supabase/migrations/${ALLOWED}`;
if (!relative.replace(/\\/g, "/").endsWith(ALLOWED)) {
  throw new Error("rtb-sec-rel-1d apply refuses any file other than the 1D lockdown");
}
const forbidden = new Set<string>([STAGING_REF, INSPECTION_REF, INTRANET_PRODUCTION_REF]);
if (forbidden.has(PRODUCTION_REF)) {
  throw new Error("production apply runner refused a non-production project ref");
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const absSql = resolve(repoRoot, relative);
const sql = readFileSync(absSql, "utf8");
if (/^\s*DROP TABLE\b/im.test(sql) || /^\s*DROP FUNCTION\b/im.test(sql) || /^\s*TRUNCATE\b/im.test(sql) || /^\s*DELETE FROM\b/im.test(sql)) {
  throw new Error("refusing destructive SQL");
}
if (/GRANT EXECUTE[\s\S]{0,120}TO\s+(anon|authenticated|PUBLIC)/i.test(sql)) {
  throw new Error("refusing untrusted EXECUTE grant");
}
if (/EXCEPTION\s+WHEN\s+OTHERS/i.test(sql)) {
  throw new Error("refusing broad error suppression");
}

const checksum = createHash("sha256").update(sql).digest("hex");
console.log(JSON.stringify({ file: relative, target: PRODUCTION_REF, checksum, bytes: sql.length }));

const workdir = mkdtempSync(join(tmpdir(), "rtb-sec-rel-1d-apply-"));
try {
  copyFileSync(absSql, join(workdir, "apply.sql"));
  const linked = run(`npx --yes supabase link --project-ref ${PRODUCTION_REF} --yes`, workdir);
  if (linked.status !== 0) {
    console.error(JSON.stringify({ step: "link", target: PRODUCTION_REF, status: linked.status }));
    console.error(linked.redacted);
    throw new Error("supabase link failed");
  }
  const applied = run("npx --yes supabase db query --linked -f apply.sql", workdir);
  if (applied.status !== 0) {
    console.error(JSON.stringify({ step: "apply", target: PRODUCTION_REF, status: applied.status }));
    console.error(applied.redacted);
    throw new Error("production apply failed");
  }
  console.log(JSON.stringify({ applied: true, target: PRODUCTION_REF, file: relative }));
  process.stdout.write(applied.redacted);
} finally {
  rmSync(workdir, { recursive: true, force: true });
}
