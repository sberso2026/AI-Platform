import type {
  ComplianceMapping,
  ExternalAssuranceReference,
  FrameworkId,
} from "../contracts";
import { SEED_FRAMEWORK_MAPPINGS } from "./seed-controls";

export class FrameworkMappingRegistry {
  readonly kind = "framework_mapping_registry" as const;
  private mappings = new Map<string, ComplianceMapping>();
  private external = new Map<string, ExternalAssuranceReference>();

  constructor(seed: ComplianceMapping[] = SEED_FRAMEWORK_MAPPINGS) {
    for (const m of seed) this.register(m);
  }

  register(mapping: ComplianceMapping): void {
    if (mapping.certified !== false) {
      throw new Error("frameworkMapped ≠ certified — certified must be false");
    }
    if (mapping.frameworkId === "SOC2_TSC_RESERVED") {
      // Reserve only — allow reference registration with certified=false
    }
    this.mappings.set(mapping.mappingId, mapping);
  }

  registerExternal(ref: ExternalAssuranceReference): void {
    if (ref.isExternalOpinion !== true || ref.generatedBySecurityAssurance !== false) {
      throw new Error("External assurance must be external opinion metadata only");
    }
    this.external.set(ref.assuranceId, ref);
  }

  listByControl(controlId: string): ComplianceMapping[] {
    return [...this.mappings.values()].filter((m) => m.controlId === controlId);
  }

  listByFramework(frameworkId: FrameworkId): ComplianceMapping[] {
    return [...this.mappings.values()].filter((m) => m.frameworkId === frameworkId);
  }

  list(): ComplianceMapping[] {
    return [...this.mappings.values()];
  }

  listExternal(): ExternalAssuranceReference[] {
    return [...this.external.values()];
  }

  /** Many-to-many: one control may map to multiple frameworks. */
  frameworksForControl(controlId: string): FrameworkId[] {
    return [...new Set(this.listByControl(controlId).map((m) => m.frameworkId))];
  }
}
