/**
 * Phase 13F certification gates A–BT (Engineering Model Interoperability V1.0 GA).
 * 72 gates: A–Z (26) + AA–AZ (26) + BA–BT (20).
 */
export const PHASE_13F_ENGINEERING_MODEL_INTEROPERABILITY_GA_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "Project Intelligence V1 intact"],
  ["E", "Inspection Intelligence V1 intact"],
  ["F", "Digital Twin V1 tag intact"],
  ["G", "Phase 13A pin"],
  ["H", "Phase 13B pin"],
  ["I", "Phase 13C pin"],
  ["J", "Phase 13D.1 pin"],
  ["K", "Phase 13E pin"],
  ["L", "Phase 13D blocked_external_dependency"],
  ["M", "V1.0.0 version freeze"],
  ["N", "GA status declaration"],
  ["O", "Runtime / IFC / federation ready flags"],
  ["P", "SPACE GASS model+result federation ready"],
  ["Q", "ETABS model+result federation ready"],
  ["R", "Controlled execution host ready"],
  ["S", "Live SPACE GASS flags false"],
  ["T", "Live ETABS flags false"],
  ["U", "CSI product adapters false"],
  ["V", "Ownership locks"],
  ["W", "DigitalTwinV1Intact"],
  ["X", "Package version alignment"],
  ["Y", "Module manifest generator"],
  ["Z", "Module manifest snapshot"],
  ["AA", "Capability registry freeze"],
  ["AB", "Service registry freeze"],
  ["AC", "Event contract freeze"],
  ["AD", "Unavailable capability matrix"],
  ["AE", "Module registry drift"],
  ["AF", "Capability matrix document"],
  ["AG", "Public contracts document"],
  ["AH", "Commercial packaging document"],
  ["AI", "Operations document"],
  ["AJ", "Unavailable capabilities document"],
  ["AK", "Limitations document"],
  ["AL", "Performance baseline document"],
  ["AM", "Phase 13F overview document"],
  ["AN", "Migration lineage 86–89"],
  ["AO", "No batch_90 migration"],
  ["AP", "Hosted persistence"],
  ["AQ", "Tenant isolation / RLS"],
  ["AR", "Real JWT / entitlement matrix"],
  ["AS", "HTTP contracts / entitlements"],
  ["AT", "UI GA readiness markers"],
  ["AU", "Unavailable labels in UI"],
  ["AV", "Browser E2E"],
  ["AW", "Upgrade certification"],
  ["AX", "Backup/restore certification"],
  ["AY", "Unit and architecture tests"],
  ["AZ", "Release tag integrity"],
  ["BA", "Commerce policy / layout entitlements"],
  ["BB", "Modules page entry"],
  ["BC", "No DT package modifications"],
  ["BD", "No silent solver fallback"],
  ["BE", "Source ownership preserved"],
  ["BF", "Public contracts frozen 1.0.0"],
  ["BG", "Commercial packaging ready"],
  ["BH", "Operational certification ready"],
  ["BI", "Secret scan"],
  ["BJ", "Workflow exists"],
  ["BK", "Idempotency"],
  ["BL", "Concurrency / bounded host"],
  ["BM", "Analysis-model generation false"],
  ["BN", "Automatic mapping approval false"],
  ["BO", "SPACE GASS blocked-live boundary"],
  ["BP", "ETABS unavailable-live boundary"],
  ["BQ", "Result trust honesty"],
  ["BR", "Execution host ≠ solver certification"],
  ["BS", "GA closure assert"],
  ["BT", "No post-13F expansion / releaseEligible"],
] as const;

export type Phase13fGateId =
  (typeof PHASE_13F_ENGINEERING_MODEL_INTEROPERABILITY_GA_GATES)[number][0];

export const PHASE_13F_GATE_COUNT =
  PHASE_13F_ENGINEERING_MODEL_INTEROPERABILITY_GA_GATES.length;

export const PHASE_13F_RELEASE_TAG =
  "engineering-model-interoperability-v1.0.0" as const;
export const PHASE_13F_INTEROP_VERSION = "1.0.0" as const;
export const PHASE_13F_STATUS = "ga" as const;
export const PHASE_13F_PREVIOUS_VERSION = "0.4.0-etabs-federation" as const;

export const PHASE_13F_DIGITAL_TWIN_VERSION = "1.0.0" as const;
export const PHASE_13F_DIGITAL_TWIN_TAG = "digital-twin-v1.0.0" as const;
export const PHASE_13F_DIGITAL_TWIN_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;

export const PHASE_13A_PIN_COMMIT =
  "5d238f24a3c61b95011c6c2a0ab2f1bf81540267" as const;
export const PHASE_13A_HOSTED_RUN = "31288157345" as const;
export const PHASE_13B_PIN_COMMIT =
  "1540f806ada0cf70179c3cfdffe4157f29620778" as const;
export const PHASE_13B_HOSTED_RUN = "31289477885" as const;
export const PHASE_13C_PIN_COMMIT =
  "a1c73721326927b507bb7c2f456d6188dd00e8b9" as const;
export const PHASE_13C_HOSTED_RUN = "31290364364" as const;
export const PHASE_13D1_PIN_COMMIT =
  "0bbe0c7bc686615231167f9d56cad2481c627026" as const;
export const PHASE_13D1_HOSTED_RUN = "31291795232" as const;
export const PHASE_13E_PIN_COMMIT =
  "0d01d970b444f878b63cc655a283279cf0683123" as const;
export const PHASE_13E_HOSTED_RUN = "31292577801" as const;

export const PHASE_13F_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_13F_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_13F_ASSET_INTELLIGENCE_V1_TAG =
  "asset-intelligence-v1.0.0" as const;
export const PHASE_13F_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_13F_PROJECT_INTELLIGENCE_V1_TAG =
  "project-intelligence-v1.0.0" as const;
export const PHASE_13F_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_13F_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_13F_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_13F_HOSTED_TABLES = [
  { table: "engineering_model_references", pk: "model_ref_id" },
  { table: "engineering_etabs_provider_status", pk: "provider_status_id" },
  { table: "engineering_etabs_qualification_records", pk: "qualification_id" },
  { table: "engineering_execution_hosts", pk: "host_id" },
] as const;

export const PHASE_13F_MIGRATION_LINEAGE = [
  "20260808250000_batch_86_engineering_model_interoperability_ifc.sql",
  "20260808260000_batch_87_engineering_model_interoperability_spacegass.sql",
  "20260808270000_batch_88_engineering_execution_hosts.sql",
  "20260808280000_batch_89_engineering_model_interoperability_etabs.sql",
] as const;
