/** Inspection Pack registry — industry packs plug into the generic engine. */

export type InspectionPackManifest = {
  packId: string;
  version: string;
  displayName: string;
  taxonomyExtensions: string[];
  checklistItemTypes: string[];
  measurementMethods: string[];
  evidenceTypes: string[];
  targetKinds: string[];
  visionAdapters: string[];
  predictiveAdapters: string[];
};

export const GENERIC_INSPECTION_PACK: InspectionPackManifest = {
  packId: "generic",
  version: "0.2.0",
  displayName: "Generic Inspection Pack",
  taxonomyExtensions: [],
  checklistItemTypes: ["pass_fail", "numeric", "text", "photo_required"],
  measurementMethods: ["manual", "instrument"],
  evidenceTypes: ["photo", "pdf", "document"],
  targetKinds: ["project", "asset", "location", "equipment"],
  visionAdapters: [],
  predictiveAdapters: [],
};

export class InspectionPackRegistry {
  private packs = new Map<string, InspectionPackManifest>();

  constructor(initial: InspectionPackManifest[] = [GENERIC_INSPECTION_PACK]) {
    for (const pack of initial) this.register(pack);
  }

  register(pack: InspectionPackManifest): void {
    if (this.packs.has(pack.packId)) {
      throw new Error(`Duplicate inspection pack: ${pack.packId}`);
    }
    this.packs.set(pack.packId, pack);
  }

  get(packId: string): InspectionPackManifest | undefined {
    return this.packs.get(packId);
  }

  list(): InspectionPackManifest[] {
    return [...this.packs.values()];
  }
}
