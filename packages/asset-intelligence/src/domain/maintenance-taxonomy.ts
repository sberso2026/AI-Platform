/**
 * Phase 10H — Maintenance Recommendation taxonomy (not CMMS / work orders).
 */

export type MaintenanceRecommendationCode =
  | "monitor"
  | "reinspect"
  | "condition_reassessment"
  | "engineering_assessment"
  | "repair_assessment"
  | "replacement_assessment"
  | "life_extension_assessment"
  | "operational_restriction_assessment"
  | "shutdown_assessment"
  | "no_action"
  | "insufficient_evidence";

export type MaintenanceTaxonomyEntry = {
  code: MaintenanceRecommendationCode | string;
  name: string;
  description: string;
  category: "assessment" | "monitor" | "restriction" | "none" | "abstain";
  version: string;
  status: "active" | "deprecated" | "superseded";
  applicableAssetClasses: string[];
  packOwner: "engineering_os_shared" | string;
  replacementCode?: string;
  /** Packs must not redefine shared recommendation semantics. */
  redefinesSharedSemantics: false;
};

const SHARED_SEED: MaintenanceTaxonomyEntry[] = [
  {
    code: "monitor",
    name: "Monitor",
    description: "Continue monitoring under current evidence.",
    category: "monitor",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "reinspect",
    name: "Reinspect",
    description: "Recommend reinspection.",
    category: "assessment",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "condition_reassessment",
    name: "Condition reassessment",
    description: "Recommend condition reassessment.",
    category: "assessment",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "engineering_assessment",
    name: "Engineering assessment",
    description: "Recommend engineering assessment.",
    category: "assessment",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "repair_assessment",
    name: "Repair assessment",
    description: "Recommend repair assessment (not a work order).",
    category: "assessment",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "replacement_assessment",
    name: "Replacement assessment",
    description: "Recommend replacement assessment.",
    category: "assessment",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "life_extension_assessment",
    name: "Life extension assessment",
    description: "Recommend life-extension assessment.",
    category: "assessment",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "operational_restriction_assessment",
    name: "Operational restriction assessment",
    description: "Recommend operational restriction assessment.",
    category: "restriction",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "shutdown_assessment",
    name: "Shutdown assessment",
    description: "Recommend shutdown assessment (advisory only).",
    category: "restriction",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "no_action",
    name: "No action",
    description: "No intervention recommended under current evidence.",
    category: "none",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
  {
    code: "insufficient_evidence",
    name: "Insufficient evidence",
    description: "Abstain — insufficient governed evidence.",
    category: "abstain",
    version: "1",
    status: "active",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    redefinesSharedSemantics: false,
  },
];

export class MaintenanceRecommendationTaxonomyRegistry {
  private readonly byCode = new Map<string, MaintenanceTaxonomyEntry>();

  constructor(entries: MaintenanceTaxonomyEntry[] = SHARED_SEED) {
    for (const e of entries) this.byCode.set(e.code, e);
  }

  get(code: string): MaintenanceTaxonomyEntry | undefined {
    return this.byCode.get(code);
  }

  list(): MaintenanceTaxonomyEntry[] {
    return [...this.byCode.values()];
  }

  /** Pack extensions cannot redefine shared codes. */
  registerPackExtension(entry: MaintenanceTaxonomyEntry): void {
    if (entry.redefinesSharedSemantics) {
      throw new Error("pack_must_not_redefine_shared_recommendation_semantics");
    }
    const existing = this.byCode.get(entry.code);
    if (existing && existing.packOwner === "engineering_os_shared") {
      throw new Error("pack_must_not_redefine_shared_recommendation_code");
    }
    this.byCode.set(entry.code, entry);
  }
}

export function createMaintenanceRecommendationTaxonomyRegistry(): MaintenanceRecommendationTaxonomyRegistry {
  return new MaintenanceRecommendationTaxonomyRegistry();
}
