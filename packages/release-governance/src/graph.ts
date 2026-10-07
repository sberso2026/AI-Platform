import type { MigrationRecord } from "./types";
import { recordById } from "./classify";

function productionSatisfied(dep: MigrationRecord, records: MigrationRecord[]): boolean {
  if (dep.releaseState === "PRODUCTION_APPLIED" || dep.releaseState === "PRODUCTION_APPROVED") return true;
  return records.some(
    (row) =>
      row.backports.includes(dep.id) &&
      (row.releaseState === "PRODUCTION_APPLIED" || row.releaseState === "PRODUCTION_APPROVED"),
  );
}

export function unsatisfiedDependencies(
  record: MigrationRecord,
  records: MigrationRecord[],
): Array<{ id: string; reason: string }> {
  if (record.backports.length > 0) return [];
  const byId = recordById(records);
  const missing: Array<{ id: string; reason: string }> = [];
  for (const depId of record.dependsOn) {
    const dep = byId.get(depId);
    if (!dep) {
      missing.push({ id: depId, reason: "UNKNOWN" });
      continue;
    }
    if (dep.driftClass === "UNKNOWN_DRIFT" || dep.releaseState === "BLOCKED") {
      missing.push({ id: depId, reason: dep.driftClass === "UNKNOWN_DRIFT" ? "UNKNOWN" : "BLOCKED" });
      continue;
    }
    if (!productionSatisfied(dep, records)) {
      missing.push({ id: depId, reason: dep.releaseState });
    }
  }
  return missing;
}

export function productionApprovalAllowed(record: MigrationRecord, records: MigrationRecord[]): boolean {
  if (record.releaseState === "BLOCKED" || record.releaseState === "STAGING_ONLY") return false;
  if (record.releaseState === "SUPERSEDED") return false;
  if (record.driftClass === "UNKNOWN_DRIFT") return false;
  if (!record.file) return false;
  return unsatisfiedDependencies(record, records).length === 0;
}
