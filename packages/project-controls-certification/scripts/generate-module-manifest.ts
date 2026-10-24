/**
 * Regenerates the checked-in Project Controls V1.0 GA manifest snapshot.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProjectControlsModuleManifest } from "@rtb/project-controls/module-manifest";

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const root = resolve(packageDir, "../..");
const outPath = resolve(
  root,
  "packages/project-controls/manifest/project-controls-module-manifest.json",
);

const manifest = {
  ...generateProjectControlsModuleManifest(),
  generatedBy: "domain/module-manifest.ts#generateProjectControlsModuleManifest",
  note: "Authoritative runtime manifest is generated in TypeScript from version.ts; this file is the checked-in V1.0.0 GA snapshot.",
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(outPath);
