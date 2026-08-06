/** Inspection Target — inspections couple to targets, not raw project/asset rows. */

export type InspectionTargetKind =
  | "project"
  | "asset"
  | "location"
  | "equipment"
  | "custom"
  | "pack_extension";

export type InspectionTargetSnapshot = {
  capturedAt: string;
  label?: string;
  attributes?: Record<string, string | number | boolean | null>;
};

export type InspectionTarget = {
  id: string;
  kind: InspectionTargetKind;
  /** Canonical shared-domain id when kind maps to Core/shared entities. */
  canonicalId?: string;
  packExtensionKind?: string;
  snapshot?: InspectionTargetSnapshot;
};

export function assertInspectionTarget(target: InspectionTarget): void {
  if (!target.id || !target.kind) {
    throw new Error("InspectionTarget requires id and kind");
  }
  if (target.kind === "pack_extension" && !target.packExtensionKind) {
    throw new Error("pack_extension targets require packExtensionKind");
  }
}
