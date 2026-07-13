import {
  checkCertificationPreflight,
  providerSecretPresence,
  resolveEmbeddingSecretRouting,
} from "./provider-preflight.js";

export {
  checkCertificationPreflight,
  providerSecretPresence,
  resolveEmbeddingSecretRouting,
} from "./provider-preflight.js";

const errors = checkCertificationPreflight();
if (errors.length > 0) {
  console.error(`[ci-preflight] FAIL\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exitCode = 1;
} else {
  const presence = providerSecretPresence();
  const routing = resolveEmbeddingSecretRouting();
  console.log("[ci-preflight] PASS");
  console.log(`[ci-preflight] embedding credential source: ${routing.credentialSource}`);
  console.log(`[ci-preflight] embedding provider: ${routing.provider}`);
  console.log(`[ci-preflight] embedding model: ${routing.model}`);
  console.log(`[ci-preflight] secrets present (names only): ${JSON.stringify(presence)}`);
}
