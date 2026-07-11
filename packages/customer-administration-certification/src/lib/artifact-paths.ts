import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

export const GENERATED_ARTIFACT_DIR = "artifacts/generated/customer-administration";
export const PLAYWRIGHT_OUTPUT_DIR = "test-results/customer-administration";
export const TMP_CERT_DIR = ".tmp/customer-administration";

export function generatedArtifactDir(pkgDir: string): string {
  const dir = resolve(pkgDir, GENERATED_ARTIFACT_DIR);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function certificationArtifactPath(pkgDir: string): string {
  return resolve(generatedArtifactDir(pkgDir), "phase-4-certification.json");
}

export function releaseCheckArtifactPath(pkgDir: string): string {
  return resolve(generatedArtifactDir(pkgDir), "phase-5-release-check.json");
}

export function fixturesManifestGeneratedPath(pkgDir: string): string {
  return resolve(generatedArtifactDir(pkgDir), "phase4-cert-fixtures.json");
}

export function playwrightReportDir(pkgDir: string): string {
  const dir = resolve(pkgDir, PLAYWRIGHT_OUTPUT_DIR);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function tmpCertDir(pkgDir: string): string {
  const dir = resolve(pkgDir, TMP_CERT_DIR);
  mkdirSync(dir, { recursive: true });
  return dir;
}
