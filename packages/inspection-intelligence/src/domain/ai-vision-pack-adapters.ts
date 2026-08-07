/**
 * Phase 9I — Pack-aware AI Vision adapters (taxonomy/mappings only; no executable pack code).
 */
export type VisionPackAdapter = {
  adapterId: string;
  packId: string;
  version: string;
  taxonomyLabels: readonly string[];
  requiredEvidenceTypes: readonly string[];
  labelMappings: Readonly<Record<string, string>>;
  executableCodeForbidden: true;
};

export const GENERIC_VISION_ADAPTER: VisionPackAdapter = {
  adapterId: "vision_generic_v1",
  packId: "generic",
  version: "1.0.0",
  taxonomyLabels: ["anomaly", "damage", "obscured"],
  requiredEvidenceTypes: ["photo"],
  labelMappings: { anomaly: "generic_anomaly", damage: "generic_damage" },
  executableCodeForbidden: true,
};

export const COATINGS_VISION_ADAPTER: VisionPackAdapter = {
  adapterId: "vision_coatings_v1",
  packId: "coatings",
  version: "1.0.0",
  taxonomyLabels: ["blister", "rust_bleed", "missing_coating"],
  requiredEvidenceTypes: ["photo", "dft_log"],
  labelMappings: { blister: "coating_blister", rust_bleed: "coating_rust_bleed" },
  executableCodeForbidden: true,
};

export const STRUCTURAL_VISION_ADAPTER: VisionPackAdapter = {
  adapterId: "vision_structural_v1",
  packId: "structural_condition",
  version: "1.0.0",
  taxonomyLabels: ["crack", "corrosion", "spall", "deformation"],
  requiredEvidenceTypes: ["photo", "sketch"],
  labelMappings: { crack: "structural_crack", corrosion: "structural_corrosion" },
  executableCodeForbidden: true,
};

export const CERTIFIED_VISION_PACK_ADAPTERS = [
  GENERIC_VISION_ADAPTER,
  COATINGS_VISION_ADAPTER,
  STRUCTURAL_VISION_ADAPTER,
] as const;

export function getVisionPackAdapter(packId: string): VisionPackAdapter {
  const found = CERTIFIED_VISION_PACK_ADAPTERS.find((a) => a.packId === packId);
  if (!found) throw new Error(`vision_pack_adapter_missing:${packId}`);
  return found;
}

export function mapProviderLabel(
  adapter: VisionPackAdapter,
  providerLabel: string,
): string {
  return adapter.labelMappings[providerLabel] ?? `${adapter.packId}_${providerLabel}`;
}
