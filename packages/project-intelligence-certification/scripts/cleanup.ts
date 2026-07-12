import { cleanupPiFixtures } from "../src/fixtures/cleanup-pi-fixtures.js";

cleanupPiFixtures().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
