/**
 * Phase 10G — Lifecycle intelligence taxonomy (shared + pack-extensible).
 */

export type LifecycleTaxonomyKind =
  | "lifecycle_context_class"
  | "transition_candidate"
  | "operating_state"
  | "maintenance_state";

export type LifecycleTaxonomyEntry = {
  taxonomyId: string;
  taxonomyVersion: string;
  kind: LifecycleTaxonomyKind;
  code: string;
  name: string;
  description: string;
  category?: string;
  applicableAssetClasses: string[];
  status: "active" | "deprecated" | "superseded";
  sourceStandard?: string;
  packOwner: "engineering_os_shared" | string;
  effectiveFrom: string;
  deprecatedAt?: string;
  replacementCode?: string;
};

export type PackLifecycleTaxonomyExtension = {
  packKey: string;
  packVersion: string;
  entries: LifecycleTaxonomyEntry[];
};

const SHARED_SEED: LifecycleTaxonomyEntry[] = [
  {
    taxonomyId: "ltx_ctx_normal",
    taxonomyVersion: "1.0.0",
    kind: "lifecycle_context_class",
    code: "LC.NORMAL_OPERATIONAL_CONTEXT",
    name: "Normal operational context",
    description: "Governed evidence supports normal operational lifecycle context.",
    applicableAssetClasses: ["*"],
    status: "active",
    packOwner: "engineering_os_shared",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ltx_ctx_ageing",
    taxonomyVersion: "1.0.0",
    kind: "lifecycle_context_class",
    code: "LC.AGEING_CONTEXT",
    name: "Ageing context",
    description: "Service age/context suggests ageing attention — not a condition claim.",
    applicableAssetClasses: ["*"],
    status: "active",
    packOwner: "engineering_os_shared",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ltx_ctx_degradation",
    taxonomyVersion: "1.0.0",
    kind: "lifecycle_context_class",
    code: "LC.DEGRADATION_ATTENTION",
    name: "Degradation attention",
    description: "Published degradation/trend context warrants lifecycle attention.",
    applicableAssetClasses: ["*"],
    status: "active",
    packOwner: "engineering_os_shared",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ltx_ctx_insufficient",
    taxonomyVersion: "1.0.0",
    kind: "lifecycle_context_class",
    code: "LC.INSUFFICIENT_EVIDENCE",
    name: "Insufficient evidence",
    description: "Lifecycle intelligence abstains due to inadequate evidence.",
    applicableAssetClasses: ["*"],
    status: "active",
    packOwner: "engineering_os_shared",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ltx_ctx_conflict",
    taxonomyVersion: "1.0.0",
    kind: "lifecycle_context_class",
    code: "LC.CONFLICTING_CONTEXT",
    name: "Conflicting context",
    description: "Published slices disagree; human review required.",
    applicableAssetClasses: ["*"],
    status: "active",
    packOwner: "engineering_os_shared",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ltx_tc_life_ext",
    taxonomyVersion: "1.0.0",
    kind: "transition_candidate",
    code: "TC.LIFE_EXTENSION_REVIEW",
    name: "Life-extension review recommended",
    description: "Candidate only — does not mutate canonical lifecycle.",
    applicableAssetClasses: ["*"],
    status: "active",
    packOwner: "engineering_os_shared",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
  {
    taxonomyId: "ltx_tc_replace",
    taxonomyVersion: "1.0.0",
    kind: "transition_candidate",
    code: "TC.REPLACEMENT_ASSESSMENT",
    name: "Replacement assessment recommended",
    description: "Candidate only — Shared Domain governs any canonical stage change.",
    applicableAssetClasses: ["*"],
    status: "active",
    packOwner: "engineering_os_shared",
    effectiveFrom: "2026-08-07T00:00:00.000Z",
  },
];

export class LifecycleTaxonomyRegistry {
  readonly kind = "lifecycle_taxonomy_registry" as const;
  private entries = new Map<string, LifecycleTaxonomyEntry>();

  constructor(seed: LifecycleTaxonomyEntry[] = SHARED_SEED) {
    for (const e of seed) this.register(e);
  }

  register(entry: LifecycleTaxonomyEntry): void {
    if (!entry.taxonomyId || !entry.code || !entry.kind || !entry.taxonomyVersion) {
      throw new Error("lifecycle_taxonomy_schema_invalid");
    }
    this.entries.set(`${entry.kind}:${entry.code}:${entry.taxonomyVersion}`, entry);
  }

  registerPackExtension(pack: PackLifecycleTaxonomyExtension): void {
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
      // Packs must not redefine canonical shared lifecycle stage semantics.
      if (e.kind === "lifecycle_context_class" && e.code.startsWith("CANONICAL.")) {
        throw new Error("pack_cannot_redefine_canonical_lifecycle_stage");
      }
      this.register(e);
    }
  }

  requireActive(kind: LifecycleTaxonomyKind, code: string, version = "1.0.0") {
    const e = this.entries.get(`${kind}:${code}:${version}`);
    if (!e) throw new Error(`lifecycle_taxonomy_not_found:${kind}:${code}`);
    if (e.status !== "active") throw new Error(`lifecycle_taxonomy_not_active:${code}`);
    return e;
  }

  list(kind?: LifecycleTaxonomyKind): LifecycleTaxonomyEntry[] {
    return [...this.entries.values()].filter((e) => !kind || e.kind === kind);
  }

  get taxonomyVersion(): string {
    return "1.0.0";
  }
}

export function createLifecycleTaxonomyRegistry(
  seed?: LifecycleTaxonomyEntry[],
): LifecycleTaxonomyRegistry {
  return new LifecycleTaxonomyRegistry(seed);
}
