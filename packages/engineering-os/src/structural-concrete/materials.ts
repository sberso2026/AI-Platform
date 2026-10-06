import type { ConcreteGovernedProperty, ConcreteMaterial, ReinforcementMaterial } from "@rtb/types";
import {
  CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES,
  LLM_CONCRETE_NUMERICAL_AUTHORITY,
  UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA,
} from "@rtb/types";

export function assertGovernedConcreteProperty(property: ConcreteGovernedProperty | null, label: string): ConcreteGovernedProperty {
  if (!property || property.value == null || property.value === "") {
    throw new Error(`concrete design fail closed: missing ${label}`);
  }
  if (!property.unit && typeof property.value === "number") {
    throw new Error(`concrete design fail closed: ${label} requires explicit units`);
  }
  if (!property.provenanceRef || !property.sourceAuthority) {
    throw new Error(`concrete design fail closed: ${label} requires source/provenance`);
  }
  if (LLM_CONCRETE_NUMERICAL_AUTHORITY) throw new Error("LLM must not originate concrete numerical properties");
  return property;
}

export function assertGradeDoesNotSynthesizeProperties(material: ConcreteMaterial): void {
  if (CONCRETE_GRADE_AUTOMATICALLY_GENERATES_PROPERTIES) {
    throw new Error("concrete grade must not automatically generate engineering properties");
  }
  if (!material.designation?.trim()) return;
  if (!material.compressiveStrength) {
    throw new Error("concrete design fail closed: missing material");
  }
}

export function requireConcreteMaterialProperties(material: ConcreteMaterial, names: readonly string[]): void {
  assertGradeDoesNotSynthesizeProperties(material);
  const map: Record<string, ConcreteGovernedProperty | null> = {
    compressiveStrength: material.compressiveStrength,
    tensileStrength: material.tensileStrength,
    elasticModulus: material.elasticModulus,
    density: material.density,
    poissonRatio: material.poissonRatio,
    age: material.age,
    strengthReferenceAge: material.strengthReferenceAge,
  };
  for (const name of names) {
    assertGovernedConcreteProperty(map[name] ?? null, `concrete.${name}`);
  }
}

export function requireReinforcementMaterialProperties(material: ReinforcementMaterial, names: readonly string[]): void {
  const map: Record<string, ConcreteGovernedProperty | null> = {
    yieldStrength: material.yieldStrength,
    ultimateStrength: material.ultimateStrength,
    elasticModulus: material.elasticModulus,
  };
  for (const name of names) {
    assertGovernedConcreteProperty(map[name] ?? null, `reinforcement.${name}`);
  }
}

export function assertBarAreaNotInferredFromDesignation(designation: string | null, area: ConcreteGovernedProperty | null): ConcreteGovernedProperty {
  if (UNGOVERNED_BAR_DESIGNATION_GENERATES_AREA) {
    throw new Error("ungoverned bar designation must not generate area");
  }
  if (!area) {
    throw new Error(`concrete design fail closed: missing reinforcement geometry${designation ? ` for ${designation}` : ""}`);
  }
  return assertGovernedConcreteProperty(area, "reinforcement.area");
}
