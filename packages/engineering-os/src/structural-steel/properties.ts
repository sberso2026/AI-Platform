import type { SteelGovernedProperty, SteelMaterialDesignProperties, SteelSectionDesignProperties, SteelStabilityContext } from "@rtb/types";
import { SILENT_EFFECTIVE_LENGTH_ASSUMPTION, UNSOURCED_CODE_FORMULA_ALLOWED } from "@rtb/types";

export function assertGovernedProperty(property: SteelGovernedProperty | null, label: string): SteelGovernedProperty {
  if (!property || property.value == null || property.value === "") {
    throw new Error(`steel design fail closed: missing ${label}`);
  }
  if (!property.unit && typeof property.value === "number") {
    throw new Error(`steel design fail closed: ${label} requires explicit units`);
  }
  if (!property.provenanceRef || !property.sourceAuthority) {
    throw new Error(`steel design fail closed: ${label} requires source/provenance`);
  }
  if (UNSOURCED_CODE_FORMULA_ALLOWED) throw new Error("unsourced code formulas are forbidden");
  return property;
}

export function requireMaterialProperties(material: SteelMaterialDesignProperties, names: string[]): void {
  const map: Record<string, SteelGovernedProperty | null> = {
    yieldStrength: material.yieldStrength,
    ultimateStrength: material.ultimateStrength,
    elasticModulus: material.elasticModulus,
    shearModulus: material.shearModulus,
    poissonRatio: material.poissonRatio,
    density: material.density,
  };
  for (const name of names) {
    assertGovernedProperty(map[name] ?? null, `material.${name}`);
  }
}

export function requireSectionProperties(section: SteelSectionDesignProperties, names: string[]): void {
  const map: Record<string, SteelGovernedProperty | null> = {
    area: section.area,
    netArea: section.netArea,
    Iyy: section.Iyy,
    Izz: section.Izz,
    sectionModulusYy: section.sectionModulusYy,
    sectionModulusZz: section.sectionModulusZz,
    plasticModulusYy: section.plasticModulusYy,
    plasticModulusZz: section.plasticModulusZz,
    torsionConstant: section.torsionConstant,
    warpingConstant: section.warpingConstant,
    radiusOfGyrationYy: section.radiusOfGyrationYy,
    radiusOfGyrationZz: section.radiusOfGyrationZz,
    shearArea: section.shearArea ?? null,
    webDepth: section.webDepth ?? null,
    webThickness: section.webThickness ?? null,
  };
  for (const name of names) {
    assertGovernedProperty(map[name] ?? section.geometricDimensions[name] ?? null, `section.${name}`);
  }
}

export function requireStabilityWhenNeeded(
  limitState: string,
  stability: SteelStabilityContext | null,
  options?: { requireEffectiveLength?: boolean },
): void {
  if (SILENT_EFFECTIVE_LENGTH_ASSUMPTION) throw new Error("effective length must not be assumed silently");
  const needsStability = limitState === "COMPRESSION" || limitState === "MEMBER_STABILITY" || limitState === "LOCAL_STABILITY";
  if (!needsStability) return;
  if (!stability) throw new Error("steel design fail closed: missing stability context");
  if (stability.derived) throw new Error("steel design fail closed: stability context must be explicit, not derived silently");
  const requireEffectiveLength = options?.requireEffectiveLength !== false;
  if (limitState === "COMPRESSION" && requireEffectiveLength) {
    const lePresent =
      (stability.effectiveLengthM != null && stability.effectiveLengthM > 0)
      || (stability.effectiveLengthMajorM != null && stability.effectiveLengthMajorM > 0)
      || (stability.effectiveLengthMinorM != null && stability.effectiveLengthMinorM > 0);
    if (!lePresent) throw new Error("steel design fail closed: compression requires explicit governed effective length");
  }
}
