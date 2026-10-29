import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type {
  DriftClass,
  ManifestOverride,
  MigrationProvenance,
  MigrationRecord,
  ReleaseManifest,
  ReleaseState,
} from "./types";

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
  if (n.includes("business_os") || n.includes("business-os")) return "business-os";
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
  historicalFile: string | null;
  stagingApplied: boolean;
  productionApplied: boolean;
}): { releaseState: ReleaseState; driftClass: DriftClass; productionEligible: boolean; notes: string } {
  if (!input.file && input.historicalFile) {
    return {
      releaseState: "STAGING_ONLY",
      driftClass: "EXPECTED_FEATURE_DRIFT",
      productionEligible: false,
      notes: "Recovered historical artifact. Not a live supabase/migrations file. Not production-executable.",
    };
  }
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

function listTimestampedSql(dir: string, missingDirMessage: string): Array<{ id: string; file: string }> {
  if (!existsSync(dir)) {
    throw new Error(missingDirMessage);
  }
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .map((file) => {
      const match = file.match(ID_RE);
      if (!match) throw new Error(`migration filename missing timestamp: ${file}`);
      return { id: match[1], file };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function listMigrationFiles(root = repoRootFromHere()): Array<{ id: string; file: string }> {
  return listTimestampedSql(
    join(root, "supabase/migrations"),
    "missing supabase/migrations directory",
  );
}

export function listHistoricalMigrationFiles(root = repoRootFromHere()): Array<{ id: string; file: string }> {
  const dir = join(root, "docs/release/historical-migrations");
  if (!existsSync(dir)) return [];
  return listTimestampedSql(dir, "missing docs/release/historical-migrations directory");
}

export function isDestructiveSql(sql: string): boolean {
  return /^\s*DROP TABLE\b/im.test(sql) || /^\s*TRUNCATE\b/im.test(sql) || /^\s*DELETE FROM\b/im.test(sql);
}

export function buildInventory(root = repoRootFromHere()): MigrationRecord[] {
  const manifest = loadManifest(root);
  const staging = new Set(manifest.ledgers.staging);
  const production = new Set(manifest.ledgers.production);
  const files = listMigrationFiles(root);
  const historical = listHistoricalMigrationFiles(root);
  const byId = new Map(files.map((row) => [row.id, row.file]));
  const historicalById = new Map(historical.map((row) => [row.id, row.file]));
  const overrideById = new Map(manifest.overrides.map((row) => [row.id, row]));

  const ids = new Set<string>([
    ...byId.keys(),
    ...historicalById.keys(),
    ...staging,
    ...production,
    ...overrideById.keys(),
  ]);
  const records: MigrationRecord[] = [];

  for (const id of [...ids].sort()) {
    const file = byId.get(id) ?? null;
    const historicalFile = historicalById.get(id) ?? null;
    const stagingApplied = staging.has(id);
    const productionApplied = production.has(id);
    const defaults = defaultState({ file, historicalFile, stagingApplied, productionApplied });
    const override: ManifestOverride | undefined = overrideById.get(id);
    let destructive = false;
    const sqlPath = file
      ? join(root, "supabase/migrations", file)
      : historicalFile
        ? join(root, "docs/release/historical-migrations", historicalFile)
        : null;
    if (sqlPath) {
      destructive = isDestructiveSql(readFileSync(sqlPath, "utf8"));
    }
    const provenance: MigrationProvenance | null = override?.provenance ?? null;
    const moduleSource = file ?? historicalFile;
    const merged: MigrationRecord = {
      id,
      file,
      historicalFile,
      module: override?.module ?? (moduleSource ? domainFromFile(moduleSource) : "unknown"),
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
      provenance,
    };
    records.push(merged);
  }
  return records;
}

export function hasApprovedHistoricalRepresentation(record: MigrationRecord): boolean {
  if (record.file) return true;
  if (record.historicalFile) return true;
  if (record.releaseState === "SUPERSEDED" && Boolean(record.supersededBy)) return true;
  const recovery = record.provenance?.recoveryClass;
  return recovery === "FORMALLY_RETIRED" || recovery === "SUPERSEDED_WITH_EVIDENCE";
}

export function isClassifiedLedgerOnly(record: MigrationRecord): boolean {
  const recovery = record.provenance?.recoveryClass;
  return (
    recovery === "RECOVERED_EXACT" ||
    recovery === "RECOVERED_FROM_TRUSTED_HISTORY" ||
    recovery === "EQUIVALENT_STATE_PROVEN" ||
    recovery === "SUPERSEDED_WITH_EVIDENCE" ||
    recovery === "FORMALLY_RETIRED" ||
    recovery === "UNRESOLVED_BLOCKED"
  );
}

export function isUnclassifiedLedgerOnly(record: MigrationRecord): boolean {
  if (!record.stagingApplied && !record.productionApplied) return false;
  if (hasApprovedHistoricalRepresentation(record)) return false;
  if (isClassifiedLedgerOnly(record)) return false;
  if (record.driftClass === "SECURITY_BACKPORT") return false;
  return true;
}

export function unclassifiedLedgerOnlyVersions(records: MigrationRecord[]): string[] {
  return records.filter(isUnclassifiedLedgerOnly).map((row) => row.id);
}

export function recordById(records: MigrationRecord[]): Map<string, MigrationRecord> {
  return new Map(records.map((row) => [row.id, row]));
}
