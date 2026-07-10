import { provisionInstallationFixtures } from "../src/provision-fixtures.js";

provisionInstallationFixtures().catch((err) => {
  console.error(
    `[installation:provision] FAIL: ${err instanceof Error ? err.message : String(err)}`
  );
  process.exit(1);
});
