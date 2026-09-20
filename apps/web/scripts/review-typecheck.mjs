/**
 * Review-scoped TypeScript gate.
 * Global next.config typescript.ignoreBuildErrors remains for unrelated platform debt.
 * This script fails if any Review-specific path has a TypeScript error.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const webRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(webRoot, "../..");

const REVIEW_PATHS = [
  "apps/web/src/app/(platform)/review/",
  "apps/web/src/app/api/review/",
  "apps/web/src/lib/review/",
  "apps/web/src/__tests__/engineering-review-mup.test.ts",
  "packages/engineering-review/",
  "packages/engineering-review-persistence/",
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

function isReviewPath(filePath) {
  const relative = normalize(filePath);
  return REVIEW_PATHS.some((prefix) => relative.includes(prefix) || relative.endsWith(prefix));
}

packageTypecheck("@rtb/engineering-review");
packageTypecheck("@rtb/engineering-review-persistence");

const tsc = run("pnpm", ["exec", "tsc", "--noEmit", "--pretty", "false"], webRoot);
const output = `${tsc.stdout}\n${tsc.stderr}`;
const errorLines = output
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => /error TS\d+/.test(line));

const reviewErrors = errorLines.filter((line) => isReviewPath(line));
const isolatedDebt = errorLines.filter((line) => !isReviewPath(line));

if (reviewErrors.length > 0) {
  process.stderr.write("REVIEW_TYPESCRIPT_GATE_PASS=false\n");
  process.stderr.write(reviewErrors.slice(0, 80).join("\n") + "\n");
  process.exit(1);
}

process.stdout.write("REVIEW_TYPESCRIPT_GATE_PASS=true\n");
process.stdout.write("IGNORE_BUILD_ERRORS_STILL_REQUIRED_FOR_PLATFORM=true\n");
process.stdout.write(`WEB_TSC_ERROR_COUNT=${errorLines.length}\n`);
process.stdout.write(`ISOLATED_PLATFORM_DEBT_ERROR_COUNT=${isolatedDebt.length}\n`);
process.exit(0);
