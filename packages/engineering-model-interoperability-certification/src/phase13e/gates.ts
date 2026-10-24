/**
 * Phase 13E certification gates (ETABS Export Federation + Fail-Closed Solver).
 * 72 gates: A–Z (26) + AA–AT (20) + AU–BT (26) = 72.
 */
export const PHASE_13E_ENGINEERING_MODEL_ETABS_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "Project Intelligence V1 intact"],
  ["E", "Inspection Intelligence V1 intact"],
  ["F", "Digital Twin V1 tag intact"],
  ["G", "Interop runtime package exists"],
  ["H", "Interop certification package exists"],
  ["I", "Version 0.4.0-etabs-federation"],
  ["J", "EngineeringModelInteroperabilityRuntimeReady is true"],
  ["K", "IFCFederationReady is true"],
  ["L", "SpaceGassFederationReady is true (retained)"],
  ["M", "ETABSModelFederationReady is true"],
  ["N", "ETABSResultFederationReady is true"],
  ["O", "ETABSAdapterImplemented is true"],
  ["P", "ETABSSolverAdapterReady is true"],
  ["Q", "ETABSHostedExecutionCertified is false"],
  ["R", "ETABSControlledExecutionCertified is false"],
  ["S", "SPACEGASSLiveExecutionCertified is false"],
  ["T", "spaceGassHostedExecutionCertified is false"],
  ["U", "silentSolverFallbackAllowed is false"],
  ["V", "analysisModelGenerationImplemented is false"],
  ["W", "SAP2000/SAFE/CSiBridge adapters false"],
  ["X", "ControlledEngineeringExecutionHostReady true via dependency"],
  ["Y", "DigitalTwinV1Intact is true"],
  ["Z", "phase13FReady is true (flag only)"],
  ["AA", "Phase 13E overview + ETABS reconciliation docs"],
  ["AB", "Ownership / boundary / contracts updated to 0.4.0-etabs-federation"],
  ["AC", "Public contracts 0.4.0-etabs-federation (not GA)"],
  ["AD", "batch_89 migration exists (additive after batch_88)"],
  ["AE", "batch_87/88 retained; batch_86 untouched"],
  ["AF", "No PostGIS / binaries in batch_89"],
  ["AG", "HTTP ETABS route under model-interoperability"],
  ["AH", "UI ETABS readiness marker"],
  ["AI", "Digital Twin remains 1.0.0 / tag not moved"],
  ["AJ", "Phase 13B + 13C + 13D.1 pins intact"],
  ["AK", "Ownership lock assert passes"],
  ["AL", "Unit tests pass"],
  ["AM", "Secret exposure"],
  ["AN", "Artifact identity / gate count 72"],
  ["AO", "Phase 13F not started"],
  ["AP", "Hosted batch_89 table probes"],
  ["AQ", "Hosted RLS probe"],
  ["AR", "V1 tags not moved"],
  ["AS", "releaseEligible"],
  ["AT", "unexpected5xx is 0"],
  ["AU", "Workflow exists"],
  ["AV", "Browser E2E CERTIFY_BROWSER=1"],
  ["AW", "ETABS domain modules present"],
  ["AX", "ETABS fixture federates (export federation)"],
  ["AY", "Existing results trust honesty"],
  ["AZ", "Fail-closed negative benchmarks"],
  ["BA", "CSIInteropCore internal helper only"],
  ["BB", "Capability registry federation proven; methods reserved"],
  ["BC", "Provider matrix ETABS production; other CSI false"],
  ["BD", "IFC coexistence retained"],
  ["BE", "SPACE GASS UI marker retained"],
  ["BF", "Consumes DT EngineeringSolverAdapter (no second framework)"],
  ["BG", "No DT package modifications"],
  ["BH", "Contracts not GA 1.0.0"],
  ["BI", "PLATFORM certification arch test"],
  ["BJ", "Provider status table PK"],
  ["BK", "Qualification table PK"],
  ["BL", "Execution sessions table PK"],
  ["BM", "ETABS outbox table PK"],
  ["BN", "automaticAnalysisModelCertificationEnabled false"],
  ["BO", "fullBimViewerImplemented false"],
  ["BP", "productionMemoryRepositoryAllowed false"],
  ["BQ", "Reconciliation states export federation not live COM"],
  ["BR", "certify:phase13e script"],
  ["BS", "project policy abstain path"],
  ["BT", "status etabs_federation; no SPACE GASS live claim"],
] as const;

export type Phase13eGateId =
  (typeof PHASE_13E_ENGINEERING_MODEL_ETABS_GATES)[number][0];

export const PHASE_13E_GATE_COUNT =
  PHASE_13E_ENGINEERING_MODEL_ETABS_GATES.length;

export const PHASE_13E_INTEROP_VERSION = "0.4.0-etabs-federation" as const;
export const PHASE_13E_STATUS = "etabs_federation" as const;
export const PHASE_13E_DIGITAL_TWIN_VERSION = "1.0.0" as const;
export const PHASE_13E_DIGITAL_TWIN_TAG = "digital-twin-v1.0.0" as const;
export const PHASE_13E_DIGITAL_TWIN_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_13E_PUBLIC_CONTRACT_VERSION =
  "0.4.0-etabs-federation" as const;

export const PHASE_13A_PIN_COMMIT =
  "5d238f24a3c61b95011c6c2a0ab2f1bf81540267" as const;
export const PHASE_13A_HOSTED_RUN = "31288157345" as const;
export const PHASE_13A_VERSION = "0.1.0-interop-discovery" as const;

export const PHASE_13B_PIN_COMMIT =
  "1540f806ada0cf70179c3cfdffe4157f29620778" as const;
export const PHASE_13B_VERSION = "0.2.0-ifc-federation" as const;

export const PHASE_13C_PIN_COMMIT =
  "a1c73721326927b507bb7c2f456d6188dd00e8b9" as const;
export const PHASE_13C_VERSION = "0.3.0-spacegass" as const;

export const PHASE_13D1_PIN_COMMIT =
  "0bbe0c7bc686615231167f9d56cad2481c627026" as const;
export const PHASE_13D1_VERSION = "0.1.0-execution-host" as const;

export const PHASE_13E_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_13E_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_13E_ASSET_INTELLIGENCE_V1_TAG =
  "asset-intelligence-v1.0.0" as const;
export const PHASE_13E_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_13E_PROJECT_INTELLIGENCE_V1_TAG =
  "project-intelligence-v1.0.0" as const;
export const PHASE_13E_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_13E_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_13E_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_13E_HOSTED_TABLES = [
  { table: "engineering_etabs_provider_status", pk: "provider_status_id" },
  {
    table: "engineering_etabs_qualification_records",
    pk: "qualification_id",
  },
  { table: "engineering_etabs_execution_sessions", pk: "execution_session_id" },
  { table: "engineering_etabs_outbox_events", pk: "outbox_id" },
] as const;

export const PHASE_13E_HTTP_ROUTES = [
  "apps/web/src/app/api/engineering/model-interoperability/models/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/results/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/etabs/route.ts",
] as const;

export const PHASE_13E_DOMAIN_MODULES = [
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-model-adapter.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-solver-adapter.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-input-mapper.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-output-mapper.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-qualification.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-capability-registry.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-license.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-version.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-project-policy.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/csi-interop-core.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-ifc-coexistence.ts",
  "packages/engineering-model-interoperability/src/domain/etabs/etabs-host-probe.ts",
] as const;
