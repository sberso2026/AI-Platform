import {
  INSPECTION_PROJECT_REF,
  INTRANET_PRODUCTION_PROJECT_REF,
  PRODUCTION_PROJECT_REF,
  STAGING_PROJECT_REF,
  type MigrationRecord,
  type PromotionDecision,
} from "./types";
import { recordById } from "./classify";
import { unsatisfiedDependencies } from "./graph";

export function assertProductionIdentity(projectRef: string): PromotionDecision {
  const ref = projectRef.trim().toLowerCase();
  if (!ref) return { ok: false, code: "identity_missing", detail: "production project ref required" };
  if (ref === STAGING_PROJECT_REF) {
    return { ok: false, code: "identity_mismatch", detail: "refused staging project as production" };
  }
  if (ref === INSPECTION_PROJECT_REF) {
    return { ok: false, code: "identity_mismatch", detail: "refused Inspection Intelligence" };
  }
  if (ref === INTRANET_PRODUCTION_PROJECT_REF) {
    return { ok: false, code: "identity_mismatch", detail: "refused RTB-Intranet-Production" };
  }
  if (ref !== PRODUCTION_PROJECT_REF) {
    return { ok: false, code: "identity_mismatch", detail: `expected ${PRODUCTION_PROJECT_REF}` };
  }
  return { ok: true };
}

export function evaluateProductionPromotion(input: {
  proposed: string[];
  productionProjectRef: string;
  records: MigrationRecord[];
}): PromotionDecision {
  const identity = assertProductionIdentity(input.productionProjectRef);
  if (!identity.ok) return identity;

  const proposed = [...new Set(input.proposed.map((id) => id.trim()).filter(Boolean))];
  if (proposed.length === 0) {
    return { ok: false, code: "empty_proposal", detail: "no migrations proposed" };
  }

  const byId = recordById(input.records);
  const stagingOnly = proposed.filter((id) => byId.get(id)?.releaseState === "STAGING_ONLY");
  if (stagingOnly.length) {
    return { ok: false, code: "staging_only", detail: stagingOnly.join(",") };
  }
  const blocked = proposed.filter((id) => byId.get(id)?.releaseState === "BLOCKED");
  if (blocked.length) {
    return { ok: false, code: "blocked", detail: blocked.join(",") };
  }
  const unknown = proposed.filter((id) => !byId.has(id) || byId.get(id)?.driftClass === "UNKNOWN_DRIFT");
  if (unknown.length) {
    return { ok: false, code: "unknown_state", detail: unknown.join(",") };
  }
  const superseded = proposed.filter((id) => byId.get(id)?.releaseState === "SUPERSEDED");
  if (superseded.length) {
    return { ok: false, code: "superseded", detail: superseded.join(",") };
  }

  for (const id of proposed) {
    const record = byId.get(id);
    if (!record) return { ok: false, code: "unknown_state", detail: id };
    const approved =
      record.releaseState === "PRODUCTION_APPROVED" || record.releaseState === "PRODUCTION_APPLIED";
    if (!approved || !record.productionEligible) {
      return {
        ok: false,
        code: "not_production_approved",
        detail: `${id} is ${record.releaseState}`,
      };
    }
    const missing = unsatisfiedDependencies(record, input.records);
    if (missing.length) {
      return {
        ok: false,
        code: "missing_dependency",
        detail: `${id} -> ${missing.map((row) => `${row.id}:${row.reason}`).join(",")}`,
      };
    }
  }

  const unapprovedBulk = proposed.filter((id) => {
    const record = byId.get(id);
    return record && record.releaseState === "STAGING_VALIDATED";
  });
  if (unapprovedBulk.length) {
    return { ok: false, code: "bulk_sync_refused", detail: unapprovedBulk.join(",") };
  }

  return { ok: true };
}
