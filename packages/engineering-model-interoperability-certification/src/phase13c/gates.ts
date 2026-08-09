/**
 * Phase 13C certification gates (SPACE GASS Native Model Federation +
 * Existing Result Federation + Governed Solver Execution).
 * 75 gates: A–Z (26) + AA–BW (49).
 */
export const PHASE_13C_ENGINEERING_MODEL_SPACEGASS_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "Project Intelligence V1 intact"],
  ["E", "Inspection Intelligence V1 intact"],
  ["F", "Digital Twin V1 tag intact"],
  ["G", "Interop runtime package exists"],
  ["H", "Interop certification package exists"],
  ["I", "Version 0.3.0-spacegass"],
  ["J", "EngineeringModelInteroperabilityRuntimeReady is true"],
  ["K", "IFCFederationReady is true"],
  ["L", "SpaceGassFederationReady is true"],
  ["M", "spacegassProductionAdapterImplemented is true"],
  ["N", "SPACEGASSSolverAdapterReady is true"],
  ["O", "SPACEGASSFirstMethodQualified is true"],
  ["P", "SPACEGASSFirstProviderQualified is true"],
  ["Q", "SPACEGASSFirstApplicationQualified is true"],
  ["R", "SPACEGASSFirstExecutionQualified is true"],
  ["S", "spaceGassHostedExecutionCertified is false"],
  ["T", "silentSolverFallbackAllowed is false"],
  ["U", "additionalExternalSolverExecutionImplemented is true"],
  ["V", "solverExecutionImplemented is false"],
  ["W", "modelMutationImplemented is false"],
  ["X", "analysisModelGenerationImplemented is false"],
  ["Y", "ETABSAdapterImplemented is false"],
  ["Z", "DigitalTwinV1Intact is true"],
  ["AA", "Phase 13C overview + reconciliation docs"],
  ["AB", "Ownership / boundary / contracts updated to 0.3.0-spacegass"],
  ["AC", "SPACE GASS method selection rationale doc"],
  ["AD", "Public contracts 0.3.0-spacegass (not GA)"],
  ["AE", "batch_87 migration exists (additive)"],
  ["AF", "batch_86 untouched (no rewrite)"],
  ["AG", "No PostGIS / binaries in batch_87"],
  ["AH", "HTTP SPACE GASS route under model-interoperability"],
  ["AI", "UI SPACE GASS readiness marker"],
  ["AJ", "Digital Twin remains 1.0.0 / tag not moved"],
  ["AK", "Phase 13A + 13B pins intact"],
  ["AL", "Ownership lock assert passes"],
  ["AM", "Unit tests pass"],
  ["AN", "Secret exposure"],
  ["AO", "Artifact identity / gate count 75"],
  ["AP", "phase13DReady is true (flag only)"],
  ["AQ", "Phase 13D not started"],
  ["AR", "Hosted batch_87 table probes"],
  ["AS", "Hosted RLS probe"],
  ["AT", "V1 tags not moved"],
  ["AU", "releaseEligible"],
  ["AV", "unexpected5xx is 0"],
  ["AW", "Workflow exists"],
  ["AX", "Browser E2E CERTIFY_BROWSER=1"],
  ["AY", "SPACE GASS domain modules present"],
  ["AZ", "SPACE GASS fixture federates"],
  ["BA", "Existing results trust honesty"],
  ["BB", "Fail-closed negative benchmarks"],
  ["BC", "Four-layer qualification records"],
  ["BD", "Capability registry only selected method"],
  ["BE", "Provider matrix SPACE GASS production; ETABS false"],
  ["BF", "IFC coexistence retained"],
  ["BG", "Consumes DT EngineeringSolverAdapter (no second framework)"],
  ["BH", "No DT package modifications"],
  ["BI", "Contracts not GA 1.0.0"],
  ["BJ", "PLATFORM certification arch test"],
  ["BK", "Provider status table PK"],
  ["BL", "Qualification table PK"],
  ["BM", "Execution sessions table PK"],
  ["BN", "SPACE GASS outbox table PK"],
  ["BO", "automaticAnalysisModelCertificationEnabled false"],
  ["BP", "fullBimViewerImplemented false"],
  ["BQ", "productionMemoryRepositoryAllowed false"],
  ["BR", "Reconciliation states no SPACE GASS binary in-repo"],
  ["BS", "certify:phase13c script"],
  ["BT", "bounded method linear_elastic_static"],
  ["BU", "project policy abstain path"],
  ["BV", "nativeSpacegassAdapterImplemented true"],
  ["BW", "IFC UI marker retained"],
] as const;

export type Phase13cGateId =
  (typeof PHASE_13C_ENGINEERING_MODEL_SPACEGASS_GATES)[number][0];

export const PHASE_13C_GATE_COUNT =
  PHASE_13C_ENGINEERING_MODEL_SPACEGASS_GATES.length;

export const PHASE_13C_INTEROP_VERSION = "0.3.0-spacegass" as const;
export const PHASE_13C_DIGITAL_TWIN_VERSION = "1.0.0" as const;
export const PHASE_13C_DIGITAL_TWIN_TAG = "digital-twin-v1.0.0" as const;
export const PHASE_13C_DIGITAL_TWIN_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_13C_PUBLIC_CONTRACT_VERSION = "0.3.0-spacegass" as const;

export const PHASE_13A_PIN_COMMIT =
  "5d238f24a3c61b95011c6c2a0ab2f1bf81540267" as const;
export const PHASE_13A_HOSTED_RUN = "31288157345" as const;
export const PHASE_13A_VERSION = "0.1.0-interop-discovery" as const;

export const PHASE_13B_PIN_COMMIT =
  "1540f806ada0cf70179c3cfdffe4157f29620778" as const;
export const PHASE_13B_VERSION = "0.2.0-ifc-federation" as const;

export const PHASE_13C_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_13C_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_13C_ASSET_INTELLIGENCE_V1_TAG =
  "asset-intelligence-v1.0.0" as const;
export const PHASE_13C_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_13C_PROJECT_INTELLIGENCE_V1_TAG =
  "project-intelligence-v1.0.0" as const;
export const PHASE_13C_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_13C_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_13C_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_13C_HOSTED_TABLES = [
  { table: "engineering_spacegass_provider_status", pk: "provider_status_id" },
  {
    table: "engineering_spacegass_qualification_records",
    pk: "qualification_id",
  },
  { table: "engineering_spacegass_execution_sessions", pk: "execution_session_id" },
  { table: "engineering_spacegass_outbox_events", pk: "outbox_id" },
] as const;

export const PHASE_13C_HTTP_ROUTES = [
  "apps/web/src/app/api/engineering/model-interoperability/models/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/results/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/spacegass/route.ts",
] as const;

export const PHASE_13C_DOMAIN_MODULES = [
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-model-adapter.ts",
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-solver-adapter.ts",
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-input-mapper.ts",
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-output-mapper.ts",
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-qualification.ts",
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-capability-registry.ts",
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-license.ts",
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-version.ts",
  "packages/engineering-model-interoperability/src/domain/spacegass/spacegass-project-policy.ts",
] as const;
