import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { DriftClass, ManifestOverride, MigrationRecord, ReleaseManifest, ReleaseState } from "./types";

const ID_RE = /^(\d{14})/;

export function repoRootFromHere(): string {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
}

export function loadManifest(root = repoRootFromHere()): ReleaseManifest {
  const raw = readFileSync(join(root, "docs/release/migration-manifest.json"), "utf8");
  return JSON.parse(raw) as ReleaseManifest;
}

export function domainFromFile(file: string): string {
  const n = file.toLowerCase();
  if (n.includes("rtb_sec_rls")) return "security-rls";
  if (n.includes("security_assurance")) return "security-assurance";
  if (n.includes("engineering_review") || n.includes("engineering_core_rls")) return "engineering-review";
  if (n.includes("eos_")) return "engineering-os";
  if (n.includes("digital_twin")) return "digital-twin";
  if (n.includes("asset_intelligence")) return "asset-intelligence";
  if (n.includes("project_controls")) return "project-controls";
  if (n.includes("inspection")) return "inspection-intelligence";
  if (n.includes("project_intelligence") || n.includes("_pi_")) return "project-intelligence";
  if (n.includes("commerce") || n.includes("installation")) return "commerce";
  if (n.includes("invite") || n.includes("signup") || n.includes("identity") || n.includes("oidc")) return "identity";
  if (n.includes("spatial") || n.includes("interoperability") || n.includes("execution_host")) return "engineering-model";
  if (n.includes("platform") || n.includes("kernel") || n.includes("rls_policies") || n.includes("reference_os")) {
    return "platform-core";
  }
  return "platform";
}

function defaultState(input: {
  file: string | null;
  stagingApplied: boolean;
  productionApplied: boolean;
}): { releaseState: ReleaseState; driftClass: DriftClass; productionEligible: boolean; notes: string } {
  if (!input.file) {
    return {
      releaseState: "BLOCKED",
      driftClass: "UNKNOWN_DRIFT",
      productionEligible: false,
      notes: "Ledger version without repository SQL.",
    };
  }
  if (input.productionApplied) {
    return {
      releaseState: "PRODUCTION_APPLIED",
      driftClass: input.stagingApplied ? "NONE" : "EXPECTED_FEATURE_DRIFT",
      productionEligible: true,
      notes: input.stagingApplied ? "Applied on staging and production." : "Applied on production; not on staging.",
    };
  }
  if (input.stagingApplied) {
    return {
      releaseState: "STAGING_VALIDATED",
      driftClass: "EXPECTED_FEATURE_DRIFT",
      productionEligible: false,
      notes: "Applied on staging. Not production-approved. Staging drift is expected.",
    };
  }
  return {
    releaseState: "DEVELOPMENT",
    driftClass: "EXPECTED_FEATURE_DRIFT",
    productionEligible: false,
    notes: "Repository SQL not recorded on staging or production ledgers.",
  };
}

export function listMigrationFiles(root = repoRootFromHere()): Array<{ id: string; file: string }> {
  const dir = join(root, "supabase/migrations");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .map((file) => {
      const match = file.match(ID_RE);
      if (!match) throw new Error(`migration filename missing timestamp: ${file}`);
      return { id: match[1], file };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function isDestructiveSql(sql: string): boolean {
  return /^\s*DROP TABLE\b/im.test(sql) || /^\s*TRUNCATE\b/im.test(sql) || /^\s*DELETE FROM\b/im.test(sql);
}

export function buildInventory(root = repoRootFromHere()): MigrationRecord[] {
  const manifest = loadManifest(root);
  const staging = new Set(manifest.ledgers.staging);
  const production = new Set(manifest.ledgers.production);
  const files = listMigrationFiles(root);
  const byId = new Map(files.map((row) => [row.id, row.file]));
  const overrideById = new Map(manifest.overrides.map((row) => [row.id, row]));

  const ids = new Set<string>([...byId.keys(), ...staging, ...production, ...overrideById.keys()]);
  const records: MigrationRecord[] = [];

  for (const id of [...ids].sort()) {
    const file = byId.get(id) ?? null;
    const stagingApplied = staging.has(id);
    const productionApplied = production.has(id);
    const defaults = defaultState({ file, stagingApplied, productionApplied });
    const override: ManifestOverride | undefined = overrideById.get(id);
    let destructive = false;
    if (file) {
      const sql = readFileSync(join(root, "supabase/migrations", file), "utf8");
      destructive = isDestructiveSql(sql);
    }
    const merged: MigrationRecord = {
      id,
      file,
      module: override?.module ?? (file ? domainFromFile(file) : "unknown"),
      releaseState: (override?.releaseState ?? defaults.releaseState) as ReleaseState,
      driftClass: (override?.driftClass ?? defaults.driftClass) as DriftClass,
      stagingApplied,
      productionApplied,
      productionEligible: override?.productionEligible ?? defaults.productionEligible,
      securityCritical: override?.securityCritical ?? false,
      destructive: override?.destructive ?? destructive,
      featureDependent: override?.featureDependent ?? false,
      dependsOn: override?.dependsOn ?? [],
      supersededBy: override?.supersededBy ?? null,
      backports: override?.backports ?? [],
      notes: override?.notes ?? defaults.notes,
    };
    records.push(merged);
  }
  return records;
}

export function recordById(records: MigrationRecord[]): Map<string, MigrationRecord> {
  return new Map(records.map((row) => [row.id, row]));
}
