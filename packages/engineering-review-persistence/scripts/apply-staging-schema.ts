/**
 * Apply the additive ERA-7 security-schema SQL to Staging via Supabase CLI.
 * Uses a temporary workdir so local EOS .env.local cannot hijack the link.
 * Never prints secret values.
 */
import { copyFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const STAGING_REF = "rntonzigxwxcjlcsadip";
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const sqlPath = resolve(repoRoot, "supabase/migrations/20260920120000_engineering_review_security_schema_status.sql");

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
    redacted: redact(`${result.stdout ?? ""}\n${result.stderr ?? ""}`),
  };
}

const workdir = mkdtempSync(join(tmpdir(), "rtb-review-schema-"));
try {
  copyFileSync(sqlPath, join(workdir, "schema.sql"));
  const linked = run(`npx --yes supabase link --project-ref ${STAGING_REF} --yes`, workdir);
  if (linked.status !== 0) {
    console.error(JSON.stringify({ step: "link", status: linked.status, error: linked.error }));
    console.error(linked.redacted);
    throw new Error("supabase link failed");
  }
  const queried = run("npx --yes supabase db query --linked -f schema.sql", workdir);
  if (queried.status !== 0) {
    console.error(JSON.stringify({ step: "query", status: queried.status, error: queried.error }));
    console.error(queried.redacted);
    throw new Error("schema SQL apply failed");
  }
  console.log(
    JSON.stringify({
      target_project: STAGING_REF,
      migration: "20260920120000_engineering_review_security_schema_status.sql",
      applied: true,
    }),
  );
} finally {
  rmSync(workdir, { recursive: true, force: true });
}
