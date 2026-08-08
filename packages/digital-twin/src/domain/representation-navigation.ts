/**
 * Phase 12F — TwinRepresentationNavigationService (list/reference resolve).
 *
 * No 3D viewer — resolves Twin → reps/elements and entity → elements.
 */

import type { TwinRepresentationElementReference } from "./representation-element";
import type { TwinRepresentationMapping } from "./representation-mapping";
import type { TwinRepresentationSourceReference } from "./representation-source";

export type RepresentationNavigationResult = {
  twinId: string;
  sources: TwinRepresentationSourceReference[];
  elements: TwinRepresentationElementReference[];
  mappings: TwinRepresentationMapping[];
  threeDViewerImplemented: false;
  representationNavigationImplemented: true;
  inspectionMappingReserved?: boolean;
};

export type RepresentationNavigationStore = {
  listSources(twinId: string): TwinRepresentationSourceReference[];
  listElements(twinId: string): TwinRepresentationElementReference[];
  listMappings(twinId: string): TwinRepresentationMapping[];
};

export class TwinRepresentationNavigationService {
  constructor(private readonly store: RepresentationNavigationStore) {}

  resolveTwinRepresentations(twinId: string): RepresentationNavigationResult {
    return {
      twinId,
      sources: this.store.listSources(twinId),
      elements: this.store.listElements(twinId),
      mappings: this.store.listMappings(twinId),
      threeDViewerImplemented: false,
      representationNavigationImplemented: true,
    };
  }

  resolveEntityElements(
    twinId: string,
    targetEntityRef: string,
  ): TwinRepresentationElementReference[] {
    const mappings = this.store
      .listMappings(twinId)
      .filter(
        (m) =>
          m.targetEntityRef === targetEntityRef &&
          (m.lifecycle === "published" || m.lifecycle === "approved"),
      );
    const elementIds = new Set(mappings.map((m) => m.elementRefId));
    return this.store.listElements(twinId).filter((e) => elementIds.has(e.elementRefId));
  }

  resolveStateElement(
    twinId: string,
    stateRef: string,
  ): TwinRepresentationElementReference | null {
    const mapping = this.store
      .listMappings(twinId)
      .find(
        (m) =>
          m.mappingType === "state" &&
          m.targetEntityRef === stateRef &&
          m.lifecycle === "published",
      );
    if (!mapping) return null;
    return (
      this.store.listElements(twinId).find((e) => e.elementRefId === mapping.elementRefId) ??
      null
    );
  }

  resolveTelemetryBindingElement(
    twinId: string,
    bindingRef: string,
  ): TwinRepresentationElementReference | null {
    const mapping = this.store
      .listMappings(twinId)
      .find(
        (m) =>
          m.mappingType === "telemetry" &&
          m.targetEntityRef === bindingRef &&
          m.lifecycle === "published",
      );
    if (!mapping) return null;
    return (
      this.store.listElements(twinId).find((e) => e.elementRefId === mapping.elementRefId) ??
      null
    );
  }

  /**
   * Inspection→element navigation is reserved when II public contracts are insufficient.
   */
  resolveInspectionElement(
    twinId: string,
    inspectionRef: string,
    opts?: { inspectionContractsAvailable?: boolean },
  ): { element: TwinRepresentationElementReference | null; reserved: boolean } {
    if (opts?.inspectionContractsAvailable === false) {
      return { element: null, reserved: true };
    }
    const mapping = this.store
      .listMappings(twinId)
      .find(
        (m) =>
          m.mappingType === "inspection" &&
          m.targetEntityRef === inspectionRef &&
          m.lifecycle === "published",
      );
    if (!mapping) return { element: null, reserved: false };
    return {
      element:
        this.store.listElements(twinId).find((e) => e.elementRefId === mapping.elementRefId) ??
        null,
      reserved: false,
    };
  }
}

export function createTwinRepresentationNavigationService(
  store: RepresentationNavigationStore,
): TwinRepresentationNavigationService {
  return new TwinRepresentationNavigationService(store);
}
