/**
 * Pilot-scoped TypeScript gate.
 * Full `next build` typecheck still uses ignoreBuildErrors because of legacy DT/asset debt.
 * This script fails only when errors land in shipped Engineering OS / identity / auth paths.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(webRoot, "../..");

const PILOT_PATHS = [
  "apps/web/src/app/(auth)/",
  "apps/web/src/app/(platform)/engineering/",
  "apps/web/src/app/(platform)/users/",
  "apps/web/src/app/(platform)/access-denied/",
  "apps/web/src/app/api/engineering/",
  "apps/web/src/app/api/platform/",
  "apps/web/src/lib/commerce/",
  "apps/web/src/lib/engineering/",
  "apps/web/src/lib/kernel.ts",
  "apps/web/src/lib/lifecycle-api.ts",
  "apps/web/src/lib/supabase/",
  "packages/engineering-os/",
  "packages/platform-core/src/membership-admin.ts",
  "packages/platform-core/src/map-auth-error.ts",
  "packages/platform-core/src/invite-auth-error.ts",
  "packages/platform-core/src/canonical-auth-origin.ts",
  "apps/web/src/middleware.ts",
];

function run(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    shell: process.platform === "win32",
    env: process.env,
  });
  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

function packageTypecheck(filter) {
  const result = run("pnpm", ["--filter", filter, "typecheck"], repoRoot);
  if (result.status !== 0) {
    process.stderr.write(result.stdout);
    process.stderr.write(result.stderr);
    throw new Error(`${filter} typecheck failed`);
  }
}

function normalize(filePath) {
  return filePath.replace(/\\/g, "/");
}

function isPilotPath(filePath) {
  const relative = normalize(filePath);
  return PILOT_PATHS.some((prefix) => relative.includes(prefix) || relative.endsWith(prefix));
}

packageTypecheck("@rtb/engineering-os");
packageTypecheck("@rtb/platform-core");

const tsc = run("pnpm", ["exec", "tsc", "--noEmit", "--pretty", "false"], webRoot);
const output = `${tsc.stdout}\n${tsc.stderr}`;
const errorLines = output
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /error TS\d+/.test(line));

const pilotErrors = errorLines.filter((line) => isPilotPath(line));
const isolatedDebt = errorLines.filter((line) => !isPilotPath(line));

if (pilotErrors.length > 0) {
  process.stderr.write("PILOT_SCOPED_TYPECHECK_PASS=false\n");
  process.stderr.write(pilotErrors.slice(0, 80).join("\n") + "\n");
  process.exit(1);
}

process.stdout.write("PILOT_SCOPED_TYPECHECK_PASS=true\n");
process.stdout.write("GLOBAL_TYPECHECK_DEBT_ISOLATED=true\n");
process.stdout.write("FULL_WEB_TYPECHECK_PASS=false\n");
process.stdout.write("IGNORE_BUILD_ERRORS_REQUIRED=true\n");
process.stdout.write(`WEB_TSC_ERROR_COUNT=${errorLines.length}\n`);
process.stdout.write(`ISOLATED_DEBT_ERROR_COUNT=${isolatedDebt.length}\n`);
if (isolatedDebt.length > 0) {
  process.stdout.write(`ISOLATED_DEBT_SAMPLE=${isolatedDebt.slice(0, 12).join(" | ")}\n`);
}
process.exit(0);
