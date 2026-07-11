import { execSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

import {
  HOSTED_PROJECT_REF,
  HOSTED_PRODUCTION_PROJECT_REFS,
  HOSTED_STAGING_PROJECT_REFS,
  REQUIRED_SECRETS,
  resolveSupabaseAnonKey,
  resolveSupabaseUrl,
} from "./env.js";

export type CertificationTarget = "local" | "hosted_staging" | "hosted_production";

export const CERTIFICATION_TARGETS: CertificationTarget[] = [
  "local",
  "hosted_staging",
  "hosted_production",
];

export interface EnvironmentSafetyReport {
  certificationTarget: CertificationTarget;
  allowProductionCertification: boolean;
  releaseCheckMode: boolean;
  supabaseUrlPresent: boolean;
  supabaseAnonKeyPresent: boolean;
  serviceRoleServerSideOnly: boolean;
  noServiceRoleInClientBundle: boolean;
  noServiceRoleInNextPublic: boolean;
  hostedProjectRef: string | null;
  destructiveTestsAllowed: boolean;
  productionProjectBlocked: boolean;
  stagingProjectAllowlisted: boolean;
}

function resolveProjectRefFromUrl(): string | null {
  const url = resolveSupabaseUrl();
  if (!url) return null;
  return url.match(/https:\/\/([^.]+)/)?.[1] ?? null;
}

function assertProjectTargetAlignment(target: CertificationTarget, projectRef: string | null): void {
  if (!projectRef) throw new Error("Unable to resolve Supabase project reference from URL");

  if (target === "hosted_staging") {
    if (!(HOSTED_STAGING_PROJECT_REFS as readonly string[]).includes(projectRef)) {
      throw new Error(
        `Supabase project ${projectRef} is not allowlisted for hosted_staging certification`
      );
    }
  }

  if (target === "hosted_production") {
    if (!(HOSTED_PRODUCTION_PROJECT_REFS as readonly string[]).includes(projectRef)) {
      throw new Error(
        `Supabase project ${projectRef} is not an approved production certification target`
      );
    }
  }

  if (
    (HOSTED_PRODUCTION_PROJECT_REFS as readonly string[]).includes(projectRef) &&
    target !== "hosted_production"
  ) {
    throw new Error(
      `Production Supabase project ${projectRef} cannot be used unless target is hosted_production with explicit approval`
    );
  }
}

function readTarget(): CertificationTarget {
  const raw = process.env.CUSTOMER_ADMIN_CERTIFICATION_TARGET?.trim();
  if (!raw) return "hosted_staging";
  if ((CERTIFICATION_TARGETS as string[]).includes(raw)) return raw as CertificationTarget;
  throw new Error(
    `CUSTOMER_ADMIN_CERTIFICATION_TARGET must be one of: ${CERTIFICATION_TARGETS.join(", ")}`
  );
}

function scanForServiceRoleInNextPublic(): string[] {
  const violations: string[] = [];
  for (const key of Object.keys(process.env)) {
    if (!key.startsWith("NEXT_PUBLIC_")) continue;
    const value = process.env[key] ?? "";
    if (/service_role|service-role|SUPABASE_SERVICE_ROLE/i.test(key + value)) {
      violations.push(key);
    }
  }
  return violations;
}

function scanBuiltClientBundles(webRoot: string): string[] {
  const hits: string[] = [];
  const clientRoots = [
    resolve(webRoot, ".next/static"),
    resolve(webRoot, ".next/browser"),
  ].filter((dir) => existsSync(dir));

  if (clientRoots.length === 0) return hits;

  const queue = [...clientRoots];
  while (queue.length > 0) {
    const dir = queue.pop()!;
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      const stat = statSync(full);
      if (stat.isDirectory()) {
        queue.push(full);
        continue;
      }
      if (!/\.(js|mjs|cjs|json|html)$/.test(entry)) continue;
      try {
        const content = readFileSync(full, "utf8");
        if (/service_role|SUPABASE_SERVICE_ROLE/i.test(content)) hits.push(full);
      } catch {
        // ignore unreadable
      }
    }
  }
  return hits.slice(0, 5);
}

export function assertEnvironmentSafety(root: string): EnvironmentSafetyReport {
  const certificationTarget = readTarget();
  const allowProductionCertification = process.env.ALLOW_PRODUCTION_CERTIFICATION === "true";
  const releaseCheckMode = process.env.CUSTOMER_ADMIN_RELEASE_CHECK === "1";

  if (certificationTarget === "hosted_production" && !allowProductionCertification) {
    throw new Error(
      "Destructive certification against hosted_production is blocked. " +
        "Set ALLOW_PRODUCTION_CERTIFICATION=true only for an approved production verification window."
    );
  }

  const missing = REQUIRED_SECRETS.filter((k) => !process.env[k]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required production env variables: ${missing.join(", ")}`);
  }

  if (!resolveSupabaseUrl()) {
    throw new Error("Supabase URL is required (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL)");
  }
  if (!resolveSupabaseAnonKey()) {
    throw new Error("Supabase anon key is required (NEXT_PUBLIC_SUPABASE_ANON_KEY)");
  }

  const nextPublicViolations = scanForServiceRoleInNextPublic();
  if (nextPublicViolations.length > 0) {
    throw new Error(
      `Service role material must not appear in NEXT_PUBLIC variables: ${nextPublicViolations.join(", ")}`
    );
  }

  const webRoot = resolve(root, "apps/web");
  const bundleHits = scanBuiltClientBundles(webRoot);
  if (bundleHits.length > 0) {
    throw new Error(
      `Service role key pattern detected in client bundle artifacts: ${bundleHits.join(", ")}`
    );
  }

  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceRole) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY must be present for server-side certification fixtures");
  }

  const projectRef = resolveProjectRefFromUrl() ?? HOSTED_PROJECT_REF;
  assertProjectTargetAlignment(certificationTarget, projectRef);

  const productionProjectBlocked =
    certificationTarget === "hosted_production" && !allowProductionCertification;
  const stagingProjectAllowlisted = (HOSTED_STAGING_PROJECT_REFS as readonly string[]).includes(
    projectRef
  );

  return {
    certificationTarget,
    allowProductionCertification,
    releaseCheckMode,
    supabaseUrlPresent: Boolean(resolveSupabaseUrl()),
    supabaseAnonKeyPresent: Boolean(resolveSupabaseAnonKey()),
    serviceRoleServerSideOnly: true,
    noServiceRoleInClientBundle: bundleHits.length === 0,
    noServiceRoleInNextPublic: nextPublicViolations.length === 0,
    hostedProjectRef: projectRef,
    destructiveTestsAllowed:
      certificationTarget !== "hosted_production" || allowProductionCertification,
    productionProjectBlocked,
    stagingProjectAllowlisted,
  };
}

export function assertGitClean(root: string, allowDirty: boolean): { commitSha: string; branch: string } {
  const commitSha = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
  const branch = execSync("git rev-parse --abbrev-ref HEAD", { cwd: root, encoding: "utf8" }).trim();
  if (allowDirty) return { commitSha, branch };

  const status = execSync("git status --porcelain", { cwd: root, encoding: "utf8" }).trim();
  if (status) {
    throw new Error(
      `Working tree must be clean for release check. Uncommitted:\n${status}\n` +
        "Set CUSTOMER_ADMIN_ALLOW_DIRTY=1 in CI only when explicitly approved."
    );
  }
  return { commitSha, branch };
}
