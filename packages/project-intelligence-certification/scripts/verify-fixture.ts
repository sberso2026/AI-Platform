import { loadPiFixturesManifest } from "../src/fixtures/env.js";
import { validatePiFixtureReadiness } from "../src/fixtures/validate-fixture-readiness.js";

const result = validatePiFixtureReadiness(loadPiFixturesManifest());
console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;
