/**
 * Phase 14B — normalized cross-module search (reuses Platform search; no second engine).
 * search result ≠ engineering authority / verified conclusion.
 */

export type EngineeringSearchObjectType =
  | "project"
  | "asset"
  | "document"
  | "inspection"
  | "finding"
  | "project_controls_intelligence"
  | "asset_intelligence_state"
  | "digital_twin"
  | "engineering_model"
  | "simulation_package"
  | "spatial_reference";

export interface EngineeringSearchResult {
  objectType: EngineeringSearchObjectType;
  canonicalRef: string;
  moduleOwner: string;
  title: string;
  summary: string;
  projectRef?: string;
  assetRef?: string;
  spatialRef?: string;
  permissions: string[];
  provenance: string;
  sourceModule: string;
  /** Explicit honesty markers */
  isEngineeringAuthority: false;
  isVerifiedConclusion: false;
}

export interface NormalizedSearchInput {
  objectType: EngineeringSearchObjectType;
  id: string;
  title: string;
  summary?: string;
  moduleOwner: string;
  sourceModule: string;
  projectRef?: string;
  assetRef?: string;
  spatialRef?: string;
  permissions: string[];
  provenance?: string;
}

export function normalizeEngineeringSearchResult(
  input: NormalizedSearchInput,
): EngineeringSearchResult {
  return {
    objectType: input.objectType,
    canonicalRef: `${input.objectType}:${input.id}`,
    moduleOwner: input.moduleOwner,
    title: input.title,
    summary: input.summary ?? input.title,
    projectRef: input.projectRef,
    assetRef: input.assetRef,
    spatialRef: input.spatialRef,
    permissions: [...input.permissions],
    provenance: input.provenance ?? input.sourceModule,
    sourceModule: input.sourceModule,
    isEngineeringAuthority: false,
    isVerifiedConclusion: false,
  };
}

/** Permission filter BEFORE disclosure. */
export function filterSearchResultsByPermission(
  results: EngineeringSearchResult[],
  granted: ReadonlySet<string> | string[],
): EngineeringSearchResult[] {
  const set = granted instanceof Set ? granted : new Set(granted);
  return results.filter((r) =>
    r.permissions.every((p) => set.has(p) || set.has("*") || set.has("engineering.read")),
  );
}

export const ENGINEERING_SEARCH_OBJECT_TYPES: EngineeringSearchObjectType[] = [
  "project",
  "asset",
  "document",
  "inspection",
  "finding",
  "project_controls_intelligence",
  "asset_intelligence_state",
  "digital_twin",
  "engineering_model",
  "simulation_package",
  "spatial_reference",
];
