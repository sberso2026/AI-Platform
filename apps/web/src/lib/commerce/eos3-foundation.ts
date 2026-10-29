/**
 * EOS 3.1 foundation surface: coexistence, lifecycle, jurisdiction, retrieval, migration scaffolding.
 */

import { resolveProjectGeneration, type EosProjectGenerationState } from "./eos3-identity";

export const EOS3_RETRIEVAL_PRECEDENCE = [
  "canonical_structured_engineering_state",
  "approved_controlled_documents",
  "indexed_enterprise_knowledge",
  "secondary_references",
  "model_inference",
] as const;

export function retrievalAuthorityRank(source: (typeof EOS3_RETRIEVAL_PRECEDENCE)[number]): number {
  return EOS3_RETRIEVAL_PRECEDENCE.indexOf(source);
}

export function embeddingsAreAuthoritativeSystemOfRecord(): false {
  return false;
}

export type Eos3LifecycleProfile = {
  profileKey: string;
  stages: Array<{ key: string; label: string; order: number }>;
};

/** Scaffolding only — no rewrite of active EOS 2 projects. */
export function defaultLifecycleProfileScaffold(): Eos3LifecycleProfile {
  return {
    profileKey: "configurable_default",
    stages: [
      { key: "concept", label: "Concept", order: 10 },
      { key: "feasibility", label: "Feasibility", order: 20 },
      { key: "feed", label: "FEED", order: 30 },
      { key: "detailed_design", label: "Detailed Design", order: 40 },
      { key: "construction_support", label: "Construction Support", order: 50 },
      { key: "commissioning", label: "Commissioning", order: 60 },
      { key: "operations", label: "Operations", order: 70 },
    ],
  };
}

export type Eos3JurisdictionProfile = {
  regionKey: string | null;
  engineeringStandardsProfile: string | null;
  privacyResidencyProfile: string | null;
  complianceProfile: string | null;
};

export function emptyJurisdictionProfile(): Eos3JurisdictionProfile {
  return {
    regionKey: null,
    engineeringStandardsProfile: null,
    privacyResidencyProfile: null,
    complianceProfile: null,
  };
}

export type Eos3MigrationManifestScaffold = {
  eligibility: "unknown" | "eligible" | "ineligible";
  sourceGeneration: 2;
  targetGeneration: 3;
  preflightRequired: true;
  dryRunRequired: true;
  humanAuthorizationRequired: true;
  executed: false;
};

export function createMigrationManifestScaffold(): Eos3MigrationManifestScaffold {
  return {
    eligibility: "unknown",
    sourceGeneration: 2,
    targetGeneration: 3,
    preflightRequired: true,
    dryRunRequired: true,
    humanAuthorizationRequired: true,
    executed: false,
  };
}

export function eos2AutoMigrationToEos3(): false {
  return false;
}

export function coexistenceContract(projectMeta: Parameters<typeof resolveProjectGeneration>[0]): {
  generationState: EosProjectGenerationState;
  eos2RuntimeCompatible: boolean;
  silentReinterpretationForbidden: true;
} {
  const generationState = resolveProjectGeneration(projectMeta);
  return {
    generationState,
    eos2RuntimeCompatible: generationState === "eos2_compatible",
    silentReinterpretationForbidden: true,
  };
}

/** Evolve-existing workflow: foundation does not replace EOS 2 engine. */
export function eos3WorkflowFoundationCompatibleWithEos2(): true {
  return true;
}

/** AI authority — no broader rights in foundation. */
export function eos3AiMayApproveEngineering(): false {
  return false;
}
export function eos3AiMayFinalizeMateriality(): false {
  return false;
}
export function eos3AiMayReleaseIfc(): false {
  return false;
}
export function eos3AiMayCertifyCompliance(): false {
  return false;
}
export function eos3AiMayAuthorizeProductionReleases(): false {
  return false;
}
