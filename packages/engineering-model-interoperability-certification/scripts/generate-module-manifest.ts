/**
 * Regenerates the checked-in EMI V1.0 GA manifest snapshot.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateEngineeringModelInteroperabilityModuleManifest } from "@rtb/engineering-model-interoperability/module-manifest";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const outPath = resolve(
  root,
  "packages/engineering-model-interoperability/manifest/engineering-model-interoperability-module-manifest.json",
);

const manifest = {
  ...generateEngineeringModelInteroperabilityModuleManifest(),
  generatedBy:
    "domain/module-manifest.ts#generateEngineeringModelInteroperabilityModuleManifest",
  note: "Authoritative runtime manifest is generated in TypeScript from version.ts; this file is the checked-in V1.0.0 GA snapshot.",
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(outPath);
