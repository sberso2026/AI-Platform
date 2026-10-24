/**
 * Regenerates the checked-in Asset Intelligence V1.0 GA manifest snapshot from
 * the TypeScript generator so the JSON can never drift silently.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateAssetIntelligenceModuleManifest } from "@rtb/asset-intelligence/module-manifest";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const outPath = resolve(
  root,
  "packages/asset-intelligence/manifest/asset-intelligence-module-manifest.json",
);

const manifest = {
  ...generateAssetIntelligenceModuleManifest(),
  generatedBy: "domain/module-manifest.ts#generateAssetIntelligenceModuleManifest",
  note: "Authoritative runtime manifest is generated in TypeScript from version.ts; this file is the checked-in V1.0.0 GA snapshot and supersedes the discovery and core drafts.",
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(outPath);
