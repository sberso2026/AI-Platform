/**
 * EngineeringIdentityReconciliationService — lightweight, auditable mapping stewardship.
 * No SAP/connectors; native/mock references only.
 */

import type {
  EngineeringMappingStatus,
  EngineeringProvenance,
  ExternalIdentityMapping,
} from "./contracts";

export type ReconciliationListFilter = {
  tenantId: string;
  workspaceId?: string | null;
  statuses?: EngineeringMappingStatus[];
};

export type ReconciliationAction = "confirm" | "reject" | "mark_unresolved";

export type ReconciliationAuditEntry = {
  auditId: string;
  mappingId: string;
  action: ReconciliationAction;
  actorId: string;
  at: string;
  previousStatus: EngineeringMappingStatus;
  nextStatus: EngineeringMappingStatus;
  provenance: EngineeringProvenance;
};

export class EngineeringIdentityReconciliationService {
  private mappings = new Map<string, ExternalIdentityMapping>();
  private audit: ReconciliationAuditEntry[] = [];

  constructor(seed: ExternalIdentityMapping[] = []) {
    for (const m of seed) this.mappings.set(m.mappingId, structuredClone(m));
  }

  upsert(mapping: ExternalIdentityMapping): ExternalIdentityMapping {
    // Never silently merge conflicting identities onto the same external key.
    const conflict = [...this.mappings.values()].find(
      (m) =>
        m.mappingId !== mapping.mappingId &&
        m.tenantId === mapping.tenantId &&
        m.sourceSystem === mapping.sourceSystem &&
        m.externalId === mapping.externalId &&
        (m.canonicalObjectId !== mapping.canonicalObjectId ||
          m.canonicalObjectType !== mapping.canonicalObjectType),
    );
    if (conflict) {
      const conflicting: ExternalIdentityMapping = {
        ...mapping,
        mappingStatus: "CONFLICTING",
        confidence: mapping.confidence ?? null,
        provenance: {
          ...mapping.provenance,
          note: `conflicts with ${conflict.mappingId}`,
        },
      };
      this.mappings.set(conflicting.mappingId, conflicting);
      const prior: ExternalIdentityMapping = {
        ...conflict,
        mappingStatus: "CONFLICTING",
        provenance: {
          ...conflict.provenance,
          note: `conflicts with ${mapping.mappingId}`,
          timestamp: new Date().toISOString(),
        },
      };
      this.mappings.set(prior.mappingId, prior);
      return conflicting;
    }
    this.mappings.set(mapping.mappingId, mapping);
    return mapping;
  }

  list(filter: ReconciliationListFilter): ExternalIdentityMapping[] {
    return [...this.mappings.values()].filter((m) => {
      if (m.tenantId !== filter.tenantId) return false;
      if (
        filter.workspaceId != null &&
        m.workspaceId != null &&
        m.workspaceId !== filter.workspaceId
      ) {
        return false;
      }
      if (filter.statuses?.length && !filter.statuses.includes(m.mappingStatus)) {
        return false;
      }
      return true;
    });
  }

  listUnresolved(filter: Omit<ReconciliationListFilter, "statuses">) {
    return this.list({ ...filter, statuses: ["UNRESOLVED"] });
  }

  listProbable(filter: Omit<ReconciliationListFilter, "statuses">) {
    return this.list({ ...filter, statuses: ["PROBABLE_MATCH"] });
  }

  listConflicting(filter: Omit<ReconciliationListFilter, "statuses">) {
    return this.list({ ...filter, statuses: ["CONFLICTING"] });
  }

  applyAction(input: {
    mappingId: string;
    action: ReconciliationAction;
    actorId: string;
    tenantId: string;
    permitted: boolean;
  }): ExternalIdentityMapping {
    if (!input.permitted) {
      throw new Error("reconciliation_forbidden");
    }
    const existing = this.mappings.get(input.mappingId);
    if (!existing || existing.tenantId !== input.tenantId) {
      throw new Error("mapping_not_found");
    }
    const nextStatus: EngineeringMappingStatus =
      input.action === "confirm"
        ? "MATCHED"
        : input.action === "reject"
          ? "UNRESOLVED"
          : "UNRESOLVED";

    const now = new Date().toISOString();
    const provenance: EngineeringProvenance = {
      sourceType: "reconciliation",
      sourceId: input.mappingId,
      mechanism: "USER",
      actorId: input.actorId,
      ruleOrVersion: "e3-reconciliation-v1",
      timestamp: now,
      note: input.action,
    };
    const updated: ExternalIdentityMapping = {
      ...existing,
      mappingStatus: nextStatus,
      verifiedAt: input.action === "confirm" ? now : existing.verifiedAt,
      verifiedBy: input.action === "confirm" ? input.actorId : existing.verifiedBy,
      // Reject clears fabricated certainty; confirm may keep prior score or omit.
      confidence:
        input.action === "confirm"
          ? existing.confidence ?? null
          : null,
      provenance,
    };
    this.mappings.set(updated.mappingId, updated);
    this.audit.push({
      auditId: `audit:${input.mappingId}:${now}`,
      mappingId: input.mappingId,
      action: input.action,
      actorId: input.actorId,
      at: now,
      previousStatus: existing.mappingStatus,
      nextStatus,
      provenance,
    });
    return updated;
  }

  getAuditTrail(mappingId?: string): ReconciliationAuditEntry[] {
    return mappingId
      ? this.audit.filter((a) => a.mappingId === mappingId)
      : [...this.audit];
  }
}
