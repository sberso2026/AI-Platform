/**
 * Phase 13B certification gates (Engineering Model Interoperability IFC Federation).
 * 72 gates: A–Z (26) + AA–BT (46).
 */
export const PHASE_13B_ENGINEERING_MODEL_IFC_FEDERATION_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "Project Intelligence V1 intact"],
  ["E", "Inspection Intelligence V1 intact"],
  ["F", "Digital Twin V1 tag intact"],
  ["G", "Interop runtime package exists"],
  ["H", "Interop certification package exists"],
  ["I", "Version 0.2.0-ifc-federation"],
  ["J", "EngineeringModelInteroperabilityRuntimeReady is true"],
  ["K", "IFCFederationReady is true"],
  ["L", "productionInteroperabilityRuntimeImplemented is true"],
  ["M", "ifcProductionAdapterImplemented is true"],
  ["N", "sourceModelOwnershipPreserved is true"],
  ["O", "digitalTwinMayOwnSourceModel is false"],
  ["P", "duplicateModelOwnershipDetected is false"],
  ["Q", "solverExecutionImplemented is false"],
  ["R", "modelMutationImplemented is false"],
  ["S", "analysisModelGenerationImplemented is false"],
  ["T", "fullBimViewerImplemented is false"],
  ["U", "automaticAnalysisModelCertificationEnabled is false"],
  ["V", "additionalExternalSolverExecutionImplemented is false"],
  ["W", "productionMemoryRepositoryAllowed is false"],
  ["X", "modelBinaryStorageInPostgres is false"],
  ["Y", "native production adapters remain false"],
  ["Z", "DigitalTwinV1Intact is true"],
  ["AA", "Phase 13B overview doc"],
  ["AB", "Ownership / boundary docs updated"],
  ["AC", "IFC strategy updated for runtime"],
  ["AD", "Public contracts 0.2.0-ifc-federation"],
  ["AE", "batch_86 migration exists"],
  ["AF", "batch_85 and prior migrations untouched by model tables"],
  ["AG", "No PostGIS / geometry / model binaries in batch_86"],
  ["AH", "HTTP routes under /api/engineering/model-interoperability"],
  ["AI", "Mapping review slug locked"],
  ["AJ", "Digital Twin remains 1.0.0"],
  ["AK", "Phase 13A pin intact"],
  ["AL", "Ownership lock assert passes"],
  ["AM", "Unit tests pass"],
  ["AN", "Secret exposure"],
  ["AO", "Artifact identity / gate count 72"],
  ["AP", "phase13CReady is true (flag only)"],
  ["AQ", "Phase 13C not started"],
  ["AR", "Hosted table probes (PK columns)"],
  ["AS", "Hosted RLS probe"],
  ["AT", "V1 tags not moved"],
  ["AU", "releaseEligible"],
  ["AV", "unexpected5xx is 0"],
  ["AW", "Workflow exists"],
  ["AX", "Browser E2E CERTIFY_BROWSER=1"],
  ["AY", "Events are ids-only"],
  ["AZ", "IFC parser governance fail-closed"],
  ["BA", "Large-model safety bounds"],
  ["BB", "Thin UI readiness marker"],
  ["BC", "Memory + postgres adapters"],
  ["BD", "IFC fixture federates"],
  ["BE", "Mapping states encoded"],
  ["BF", "Result trust classification honesty"],
  ["BG", "Provider matrix IFC production only"],
  ["BH", "No second interop package"],
  ["BI", "Contracts not GA 1.0.0"],
  ["BJ", "PLATFORM certification arch test"],
  ["BK", "Models table PK model_ref_id"],
  ["BL", "Versions table PK model_version_id"],
  ["BM", "Elements table PK element_ref_id"],
  ["BN", "Mappings table PK mapping_id"],
  ["BO", "Reviews table PK review_id"],
  ["BP", "Change impacts table PK change_impact_id"],
  ["BQ", "Results table PK result_ref_id"],
  ["BR", "Outbox table PK outbox_id"],
  ["BS", "Ownership flags proven in lock"],
  ["BT", "certify:phase13b script"],
] as const;

export type Phase13bGateId =
  (typeof PHASE_13B_ENGINEERING_MODEL_IFC_FEDERATION_GATES)[number][0];

export const PHASE_13B_GATE_COUNT =
  PHASE_13B_ENGINEERING_MODEL_IFC_FEDERATION_GATES.length;

export const PHASE_13B_INTEROP_VERSION = "0.2.0-ifc-federation" as const;
export const PHASE_13B_DIGITAL_TWIN_VERSION = "1.0.0" as const;
export const PHASE_13B_DIGITAL_TWIN_TAG = "digital-twin-v1.0.0" as const;
export const PHASE_13B_DIGITAL_TWIN_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;
export const PHASE_13B_PUBLIC_CONTRACT_VERSION = "0.2.0-ifc-federation" as const;

export const PHASE_13A_PIN_COMMIT =
  "5d238f24a3c61b95011c6c2a0ab2f1bf81540267" as const;
export const PHASE_13A_HOSTED_RUN = "31288157345" as const;
export const PHASE_13A_VERSION = "0.1.0-interop-discovery" as const;

export const PHASE_13B_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_13B_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_13B_ASSET_INTELLIGENCE_V1_TAG =
  "asset-intelligence-v1.0.0" as const;
export const PHASE_13B_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_13B_PROJECT_INTELLIGENCE_V1_TAG =
  "project-intelligence-v1.0.0" as const;
export const PHASE_13B_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_13B_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_13B_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_13B_HOSTED_TABLES = [
  { table: "engineering_model_references", pk: "model_ref_id" },
  { table: "engineering_model_versions", pk: "model_version_id" },
  { table: "engineering_model_elements", pk: "element_ref_id" },
  { table: "engineering_model_mappings", pk: "mapping_id" },
  { table: "engineering_model_mapping_reviews", pk: "review_id" },
  { table: "engineering_model_change_impacts", pk: "change_impact_id" },
  { table: "engineering_model_result_references", pk: "result_ref_id" },
] as const;

export const PHASE_13B_HTTP_ROUTES = [
  "apps/web/src/app/api/engineering/model-interoperability/models/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/versions/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/elements/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/mappings/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/reviews/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/change-impacts/route.ts",
  "apps/web/src/app/api/engineering/model-interoperability/results/route.ts",
] as const;
