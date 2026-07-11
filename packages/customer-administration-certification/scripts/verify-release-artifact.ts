import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";

import {
  readCertificationArtifact,
  validateReleaseArtifact,
  type CertificationArtifactV1,
} from "../src/lib/certification-artifact.js";
import { HOSTED_PROJECT_REF } from "../src/lib/env.js";

function parseArgs(argv: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const key = arg.slice(2);
    const value = argv[i + 1];
    if (value && !value.startsWith("--")) {
      out[key] = value;
      i += 1;
    } else {
      out[key] = "true";
    }
  }
  return out;
}

function resolveArtifactPath(pathArg: string): string {
  if (isAbsolute(pathArg)) return pathArg;
  const pkgDir = process.cwd();
  const root = resolve(pkgDir, "../..");
  if (pathArg.startsWith("packages/")) return resolve(root, pathArg);
  return resolve(pkgDir, pathArg);
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const artifactPath = resolveArtifactPath(
    args.artifact ?? "artifacts/generated/customer-administration/phase-4-certification.json"
  );
  const expectedCommitSha = args["commit-sha"];
  const expectedProjectRef = args["project-ref"] ?? HOSTED_PROJECT_REF;
  const expectedTarget = args.target ?? "hosted_staging";

  if (!expectedCommitSha) {
    throw new Error("--commit-sha is required");
  }

  const raw = JSON.parse(readFileSync(artifactPath, "utf8")) as CertificationArtifactV1;
  validateReleaseArtifact(raw, {
    commitSha: expectedCommitSha,
    projectRef: expectedProjectRef,
    certificationTarget: expectedTarget,
  });

  console.log(`[verify-release-artifact] PASS`);
  console.log(`  artifact: ${artifactPath}`);
  console.log(`  commitSha: ${raw.commitSha}`);
  console.log(`  releaseEligible: ${raw.releaseEligible}`);
  console.log(`  gates: ${raw.passedGateCount}/${raw.requiredGateCount}`);
}

main();
