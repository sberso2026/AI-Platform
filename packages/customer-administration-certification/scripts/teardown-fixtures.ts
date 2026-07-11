/**
 * Best-effort teardown for customer-administration certification fixtures.
 * Primary fixtures remain namespaced under cert-phase4- and installation-certification provision.
 */
import { execSync } from "node:child_process";
import { resolve } from "node:path";

const ROOT = resolve(process.cwd(), "../..");

function main(): void {
  console.log("[phase4:teardown] Best-effort fixture cleanup");
  try {
    execSync("pnpm --filter @rtb/installation-certification teardown", {
      cwd: ROOT,
      stdio: "inherit",
      env: process.env,
    });
  } catch (err) {
    console.warn("[phase4:teardown] installation teardown failed (continuing)", err);
  }
  console.log("[phase4:teardown] complete");
}

main();
