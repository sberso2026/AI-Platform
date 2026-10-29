/** EOS 3 generation/version identity. Bounded GENERAL_AVAILABILITY under human GO. */

export const EOS3_PRODUCT_KEY = "eos-3" as const;
export const EOS3_VERSION = "3.0.0" as const;
export const EOS3_RELEASE_STATUS = "GENERAL_AVAILABILITY" as const;
/** Canonical activation: entitlement+enrollment, default deny — not uncontrolled public GA. */
export const EOS3_ACTIVATION_STATUS = "ACTIVE_CONTROLLED_GA" as const;
export const EOS3_GENERATION = 3 as const;
export const EOS2_GENERATION = 2 as const;

export type EosGeneration = typeof EOS2_GENERATION | typeof EOS3_GENERATION;

export type EosProjectGenerationState =
  | "eos2_compatible"
  | "eos3_development"
  | "migrating"
  | "migrated";

/** Projects without EOS 3 metadata remain EOS 2 / legacy-compatible. */
export function resolveProjectGeneration(
  metadata: { eos_generation?: unknown; eos3?: unknown } | null | undefined,
): EosProjectGenerationState {
  if (!metadata || typeof metadata !== "object") return "eos2_compatible";
  const gen = metadata.eos_generation;
  if (gen === 3 || gen === "3" || gen === "eos-3") {
    const state = (metadata.eos3 as { state?: unknown } | undefined)?.state;
    if (state === "migrating") return "migrating";
    if (state === "migrated") return "migrated";
    return "eos3_development";
  }
  return "eos2_compatible";
}

export function eos3VersionContext() {
  return {
    productKey: EOS3_PRODUCT_KEY,
    version: EOS3_VERSION,
    releaseStatus: EOS3_RELEASE_STATUS,
    activationStatus: EOS3_ACTIVATION_STATUS,
    generation: EOS3_GENERATION,
  };
}
