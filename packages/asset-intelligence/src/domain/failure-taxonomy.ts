/**
 * Phase 10E — Failure Taxonomy Registry (shared + pack-extensible).
 * Not industry-hardcoded. Packs register versioned extensions.
 */

export type TaxonomyEntryKind =
  | "failure_mode"
  | "failure_mechanism"
  | "failure_cause"
  | "failure_effect"
  | "consequence"
  | "detection_method"
  | "mitigation";

export type TaxonomyEntryStatus = "active" | "deprecated" | "superseded";

export type FailureTaxonomyEntry = {
  taxonomyId: string;
  taxonomyVersion: string;
  kind: TaxonomyEntryKind;
  code: string;
  name: string;
  description: string;
  category?: string;
  parentCode?: string;
  applicableAssetClasses: string[];
  sourceStandard?: string;
  /** Shared Engineering OS vs pack owner key. */
  packOwner: "engineering_os_shared" | string;
  status: TaxonomyEntryStatus;
  effectiveFrom: string;
  deprecatedAt?: string;
  replacementCode?: string;
};

export type PackTaxonomyExtension = {
  packKey: string;
  packVersion: string;
  entries: FailureTaxonomyEntry[];
};

const SHARED_SEED: FailureTaxonomyEntry[] = [
  {
    taxonomyId: "ftx_mode_loss_of_function",
    taxonomyVersion: "1.0.0",
    kind: "failure_mode",
    code: "FM.LOSS_OF_FUNCTION",
    name: "Loss of function",
    description: "Asset fails to perform required function.",
    category: "functional",
    applicableAssetClasses: ["*"],
    sourceStandard: "engineering_os.shared_failure_taxonomy",
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ftx_mode_degraded_performance",
    taxonomyVersion: "1.0.0",
    kind: "failure_mode",
    code: "FM.DEGRADED_PERFORMANCE",
    name: "Degraded performance",
    description: "Asset performs below required capability without full loss of function.",
    category: "functional",
    applicableAssetClasses: ["*"],
    sourceStandard: "engineering_os.shared_failure_taxonomy",
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ftx_mech_fatigue",
    taxonomyVersion: "1.0.0",
    kind: "failure_mechanism",
    code: "MECH.FATIGUE",
    name: "Fatigue",
    description: "Progressive structural damage under cyclic loading.",
    category: "mechanical",
    applicableAssetClasses: ["*"],
    sourceStandard: "engineering_os.shared_failure_taxonomy",
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ftx_mech_corrosion",
    taxonomyVersion: "1.0.0",
    kind: "failure_mechanism",
    code: "MECH.CORROSION",
    name: "Corrosion",
    description: "Material degradation via chemical/electrochemical attack.",
    category: "chemical",
    applicableAssetClasses: ["*"],
    sourceStandard: "engineering_os.shared_failure_taxonomy",
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ftx_cause_overload",
    taxonomyVersion: "1.0.0",
    kind: "failure_cause",
    code: "CAUSE.OVERLOAD",
    name: "Overload",
    description: "Loading exceeds design or operating envelope.",
    category: "initiating",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ftx_effect_local",
    taxonomyVersion: "1.0.0",
    kind: "failure_effect",
    code: "EFFECT.LOCAL",
    name: "Local effect",
    description: "Effect confined to the asset or immediate component.",
    category: "local",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ftx_cons_safety",
    taxonomyVersion: "1.0.0",
    kind: "consequence",
    code: "CONS.SAFETY",
    name: "Safety consequence",
    description: "Potential impact on people or safety systems.",
    category: "safety",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ftx_det_visual",
    taxonomyVersion: "1.0.0",
    kind: "detection_method",
    code: "DET.VISUAL_INSPECTION",
    name: "Visual inspection",
    description: "Identification via visual inspection evidence.",
    category: "inspection",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ftx_mit_monitor",
    taxonomyVersion: "1.0.0",
    kind: "mitigation",
    code: "MIT.INCREASE_MONITORING",
    name: "Increase monitoring",
    description: "Increase inspection/monitoring frequency or coverage.",
    category: "control",
    applicableAssetClasses: ["*"],
    packOwner: "engineering_os_shared",
    status: "active",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
];

/** Example pack extension schema only — not a production pack. */
export const EXAMPLE_PACK_KEYS = [
  "structural",
  "rotating_equipment",
  "pressure_equipment",
  "pipelines",
  "buildings",
  "bridges",
  "wind",
  "solar",
  "conveyors",
] as const;

export class FailureTaxonomyRegistry {
  readonly kind = "failure_taxonomy_registry" as const;
  private entries = new Map<string, FailureTaxonomyEntry>();

  constructor(seed: FailureTaxonomyEntry[] = SHARED_SEED) {
    for (const e of seed) this.register(e);
  }

  register(entry: FailureTaxonomyEntry): void {
    assertTaxonomySchema(entry);
    const key = `${entry.kind}:${entry.code}:${entry.taxonomyVersion}`;
    this.entries.set(key, entry);
  }

  registerPackExtension(pack: PackTaxonomyExtension): void {
    if (!pack.packKey || !pack.packVersion) {
      throw new Error("pack_taxonomy_requires_key_and_version");
    }
    for (const e of pack.entries) {
      if (e.packOwner === "engineering_os_shared") {
        throw new Error("pack_cannot_claim_shared_owner");
      }
      if (e.packOwner !== pack.packKey) {
        throw new Error(`pack_owner_mismatch:${e.packOwner}:${pack.packKey}`);
      }
      this.register(e);
    }
  }

  get(
    kind: TaxonomyEntryKind,
    code: string,
    version = "1.0.0",
  ): FailureTaxonomyEntry | undefined {
    return this.entries.get(`${kind}:${code}:${version}`);
  }

  requireActive(
    kind: TaxonomyEntryKind,
    code: string,
    version = "1.0.0",
  ): FailureTaxonomyEntry {
    const e = this.get(kind, code, version);
    if (!e) throw new Error(`taxonomy_not_found:${kind}:${code}:${version}`);
    if (e.status !== "active") {
      throw new Error(`taxonomy_not_active:${kind}:${code}:${e.status}`);
    }
    return e;
  }

  list(kind?: TaxonomyEntryKind, packOwner?: string): FailureTaxonomyEntry[] {
    return [...this.entries.values()].filter(
      (e) =>
        (!kind || e.kind === kind) && (!packOwner || e.packOwner === packOwner),
    );
  }

  get taxonomyVersion(): string {
    return "1.0.0";
  }
}

export function createFailureTaxonomyRegistry(
  seed?: FailureTaxonomyEntry[],
): FailureTaxonomyRegistry {
  return new FailureTaxonomyRegistry(seed);
}

function assertTaxonomySchema(entry: FailureTaxonomyEntry): void {
  if (!entry.taxonomyId || !entry.code || !entry.name || !entry.kind) {
    throw new Error("taxonomy_schema_invalid");
  }
  if (!entry.taxonomyVersion || !entry.packOwner || !entry.status) {
    throw new Error("taxonomy_schema_invalid");
  }
  if (!Array.isArray(entry.applicableAssetClasses)) {
    throw new Error("taxonomy_schema_invalid");
  }
}
