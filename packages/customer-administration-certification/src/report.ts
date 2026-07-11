import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export interface GateResult {
  gate: string;
  name: string;
  status: "pass" | "fail" | "skip";
  command: string;
  output?: string;
  error?: string;
}

export interface Phase4CertificationReport {
  verdict: "PASS" | "FAIL";
  phase: 4;
  environment: string;
  commitSha: string;
  branch: string;
  buildTimestamp: string;
  packageVersion: string;
  supabaseProjectRef: string | null;
  buildIdentityToken?: string;
  certificationServerPort?: number;
  gates: GateResult[];
  failures: string[];
  skippedTests: number;
  artifacts: string[];
  migrationChecksums?: Record<string, string>;
}

export function writePhase4Report(
  pkgDir: string,
  report: Phase4CertificationReport
): string {
  const dir = resolve(pkgDir, "artifacts");
  mkdirSync(dir, { recursive: true });
  const path = resolve(dir, "phase-4-certification.json");
  writeFileSync(path, JSON.stringify(report, null, 2));
  return path;
}
