/**
 * In-memory context domain provider for tests and progressive reconciliation demos.
 */

import type {
  ContextDomainProvider,
  AuthorisationGate,
} from "./canonical-context-resolver";
import type { DomainLinkHint, DomainRecordHint } from "./canonical-context-assembler";
import type { ExternalIdentityMapping } from "./contracts";
import { mapDomainTypeToCanonical } from "./contracts";

export class MemoryContextDomainProvider implements ContextDomainProvider {
  constructor(
    private readonly records: DomainRecordHint[],
    private readonly links: DomainLinkHint[] = [],
    private readonly mappings: ExternalIdentityMapping[] = [],
  ) {}

  getRecord(objectType: string, objectId: string): DomainRecordHint | null {
    const canonical = mapDomainTypeToCanonical(objectType);
    return (
      this.records.find(
        (r) =>
          mapDomainTypeToCanonical(r.objectType) === canonical &&
          r.objectId === objectId,
      ) ?? null
    );
  }

  listProjectMembers(projectId: string): DomainRecordHint[] {
    return this.records.filter(
      (r) =>
        (r.belongsToProjectId ?? r.projectId) === projectId &&
        mapDomainTypeToCanonical(r.objectType) !== "PROJECT",
    );
  }

  listObjectLinks(objectType: string, objectId: string): DomainLinkHint[] {
    const canonical = mapDomainTypeToCanonical(objectType);
    return this.links.filter((l) => {
      const from = mapDomainTypeToCanonical(l.fromType);
      const to = mapDomainTypeToCanonical(l.toType);
      return (
        (from === canonical && l.fromId === objectId) ||
        (to === canonical && l.toId === objectId)
      );
    });
  }

  listMappingsForObject(
    objectType: string,
    objectId: string,
  ): ExternalIdentityMapping[] {
    const canonical = mapDomainTypeToCanonical(objectType);
    return this.mappings.filter(
      (m) =>
        mapDomainTypeToCanonical(m.canonicalObjectType) === canonical &&
        m.canonicalObjectId === objectId,
    );
  }
}

export function allowAllAuth(tenantId: string): AuthorisationGate {
  return {
    tenantId,
    canAccessObject: (ref) => ref.tenantId === tenantId,
  };
}

export function denyObjectAuth(
  tenantId: string,
  denied: Array<{ objectType: string; objectId: string }>,
): AuthorisationGate {
  const deniedKeys = new Set(
    denied.map(
      (d) =>
        `${mapDomainTypeToCanonical(d.objectType)}:${d.objectId}`,
    ),
  );
  return {
    tenantId,
    canAccessObject: (ref) => {
      if (ref.tenantId !== tenantId) return false;
      const key = `${mapDomainTypeToCanonical(ref.objectType)}:${ref.objectId}`;
      return !deniedKeys.has(key);
    },
  };
}
