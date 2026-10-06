import { createHash } from "node:crypto";
import type { ConcreteMaterial, RcSectionGeometryInput, ReinforcementLayout, ReinforcementMaterial } from "@rtb/types";

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => [k, stable(v)]));
  }
  return value;
}

export function fingerprintRcSectionConfiguration(input: {
  geometry: RcSectionGeometryInput;
  layout: ReinforcementLayout;
  concreteRef: string;
  reinforcementRef: string;
  unitContext: string;
  displacementTreatment: string;
}): string {
  return createHash("sha256").update(JSON.stringify(stable(input))).digest("hex");
}

export function geometryInvalidationTags(previous: string, current: string): string[] {
  return previous === current ? [] : ["GEOMETRY_CHANGED", "REINFORCEMENT_CHANGED"];
}

export function governedMaterialRefs(concrete: ConcreteMaterial, reinforcement: ReinforcementMaterial): { concreteRef: string; reinforcementRef: string } {
  return { concreteRef: concrete.materialRef, reinforcementRef: reinforcement.materialRef };
}
