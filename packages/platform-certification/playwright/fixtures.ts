import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { Platform7bFixturesManifest } from "../src/lib/env.js";
import { fixturesManifestPath } from "../src/lib/env.js";

export function loadManifest(): Platform7bFixturesManifest {
  const path = fixturesManifestPath(resolve(import.meta.dirname, ".."));
  if (!existsSync(path)) throw new Error(`Missing fixtures manifest at ${path}`);
  return JSON.parse(readFileSync(path, "utf8")) as Platform7bFixturesManifest;
}
