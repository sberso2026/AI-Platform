import { provisionPiFixtures } from "../src/fixtures/provision-pi-fixtures.js";

provisionPiFixtures().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
