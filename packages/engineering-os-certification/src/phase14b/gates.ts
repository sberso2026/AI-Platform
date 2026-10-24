/**
 * Phase 14B certification gates A–BL (Engineering OS Product Integration).
 * 64 gates.
 */
export const PHASE_14B_ENGINEERING_OS_PRODUCT_INTEGRATION_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Phase 14A baseline intact"],
  ["C", "Project Intelligence V1 tag intact"],
  ["D", "Inspection Intelligence V1 tag intact"],
  ["E", "Asset Intelligence V1 tag intact"],
  ["F", "Project Controls V1 tag intact"],
  ["G", "Digital Twin V1 tag intact"],
  ["H", "Interop V1 tag intact"],
  ["I", "Version 0.10.0-product-integration"],
  ["J", "productionEngineeringOSReady false"],
  ["K", "engineeringOSV1GaCertified false"],
  ["L", "moduleRegistryTruthful"],
  ["M", "Registry has six production modules"],
  ["N", "No coming_soon production modules"],
  ["O", "Launcher completeness"],
  ["P", "EngineeringOSManifestReady"],
  ["Q", "sharedDomainVersionsPinned"],
  ["R", "assetOwnershipAliasEnforced"],
  ["S", "EngineeringContextReady"],
  ["T", "Cross-module search ready"],
  ["U", "AI orchestration ready"],
  ["V", "Health aggregation ready"],
  ["W", "Navigation ready"],
  ["X", "OS Home product-ready marker"],
  ["Y", "Commercial product ready"],
  ["Z", "Entitlement coverage ready"],
  ["AA", "Installability ready"],
  ["AB", "Compatibility resolver ready"],
  ["AC", "Capability aggregation ready"],
  ["AD", "Reporting navigation ready"],
  ["AE", "Event integration ready"],
  ["AF", "Product integration security ready"],
  ["AG", "Duplicate ownership/framework flags false"],
  ["AH", "duplicateUniversalTimelineDetected false"],
  ["AI", "implementsOwnAiStack false"],
  ["AJ", "Gap register REQUIRED_BEFORE_GA closed"],
  ["AK", "Readiness matrix updated"],
  ["AL", "Unit tests"],
  ["AM", "Secret scan"],
  ["AN", "Workflow exists"],
  ["AO", "phase14CReady"],
  ["AP", "releaseEligible"],
  ["AQ", "Aggregate manifest asserts"],
  ["AR", "Ownership normalizer tests"],
  ["AS", "Search object types complete"],
  ["AT", "Commercial solver entitlement ≠ license"],
  ["AU", "Client-owned solver architecture retained"],
  ["AV", "Reports page module routes"],
  ["AW", "No Phase 14B migration rewrite"],
  ["AX", "EngineeringOSProductIntegrationReady"],
  ["AY", "engineeringOsLauncherComplete"],
  ["AZ", "moduleRegistryDriftDetected false"],
  ["BA", "SPACE GASS live remains blocked"],
  ["BB", "ETABS live remains not certified"],
  ["BC", "PoF/RUL unavailable preserved"],
  ["BD", "Silent fallback false"],
  ["BE", "Platform architecture test"],
  ["BF", "Frozen V1 intact flags"],
  ["BG", "Health does not fail OS on solver unavailable"],
  ["BH", "AI discoverable capabilities"],
  ["BI", "Compatibility fail-closed"],
  ["BJ", "Context requires tenant/workspace/user"],
  ["BK", "Artifact identity"],
  ["BL", "No Security & Assurance subsystem started"],
] as const;

export type Phase14bGateId =
  (typeof PHASE_14B_ENGINEERING_OS_PRODUCT_INTEGRATION_GATES)[number][0];

export const PHASE_14B_GATE_COUNT =
  PHASE_14B_ENGINEERING_OS_PRODUCT_INTEGRATION_GATES.length;

export const PHASE_14B_EOS_VERSION = "0.10.0-product-integration" as const;
export const PHASE_14B_EOS_STATUS = "product_integration" as const;
export const PHASE_14A_COMMIT =
  "1542a4973dcf98539eefbf710c500927cb939fa8" as const;

export const PHASE_14B_PI_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_14B_II_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_14B_AI_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_14B_PC_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_14B_DT_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_14B_INTEROP_COMMIT =
  "4e55f32f8b5727ae900915b20492bbdf1d60f6b9" as const;
