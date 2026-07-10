import { cleanupInstallationFixtures } from "../src/cleanup-fixtures.js";

cleanupInstallationFixtures().catch((err) => {
  console.error(`[installation:cleanup] FAIL: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
