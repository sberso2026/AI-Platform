import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import type { CertFixturesManifest } from "../src/lib/env.js";

export function loadE2EFixtures(): CertFixturesManifest | null {
  const path = resolve(process.cwd(), "artifacts", "cert-fixtures.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as CertFixturesManifest;
}

export function skipE2E(): boolean {
  return process.env.COMMERCE_CERTIFICATION !== "1" && !loadE2EFixtures();
}
