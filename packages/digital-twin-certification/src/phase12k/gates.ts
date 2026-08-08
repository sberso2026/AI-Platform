/**
 * Phase 12K certification gates A–CD (Digital Twin Digital Thread Intelligence).
 * Count: A–Z=26, AA–AZ=26, BA–BZ=26, CA–CD=4 → 82 gates.
 */
export const PHASE_12K_DIGITAL_TWIN_DIGITAL_THREAD_GATES = [
  ["A", "Repository/build identity"],
  ["B", "12A regression"],
  ["C", "12B regression"],
  ["D", "12C regression"],
  ["E", "12D regression"],
  ["F", "12E regression"],
  ["G", "12F regression"],
  ["H", "12G regression"],
  ["I", "12H regression"],
  ["J", "12I regression"],
  ["K", "12J regression"],
  ["L", "PI V1 integrity"],
  ["M", "II V1 integrity"],
  ["N", "AI V1 integrity"],
  ["O", "PC V1 integrity"],
  ["P", "Ownership locks"],
  ["Q", "SolverCapabilityRegistryReady preserved"],
  ["R", "FourLayerQualificationIntact"],
  ["S", "CalculiXAdapterIntact"],
  ["T", "RealSolverExecutionCertified"],
  ["U", "DigitalThreadIntelligenceEngine"],
  ["V", "DigitalThreadSnapshot refs-only"],
  ["W", "DigitalThreadReference typed refs"],
  ["X", "Relationship taxonomy versioned"],
  ["Y", "No causal inference in taxonomy"],
  ["Z", "DigitalThreadProvenance fail-closed"],
  ["AA", "ProvenanceStatus unknown when missing"],
  ["AB", "DigitalThreadTraversalResult"],
  ["AC", "TemporalTraversalReady"],
  ["AD", "DigitalThreadChangeSet"],
  ["AE", "ChangeSetReady"],
  ["AF", "DigitalThreadIntegrityAssessment"],
  ["AG", "Integrity detect-only (no auto-repair)"],
  ["AH", "DigitalThreadProfile"],
  ["AI", "digital_twin.digital_thread_review"],
  ["AJ", "No AI self-approval"],
  ["AK", "Thread events composed|reviewed|published|integrity_changed"],
  ["AL", "KnowledgeGraphReuseReady"],
  ["AM", "duplicateKnowledgeGraphDetected=false"],
  ["AN", "Twin Thread 12B integrated by reference"],
  ["AO", "DigitalThreadSnapshot ≠ TwinSnapshot replacement"],
  ["AP", "Simulation package traversable"],
  ["AQ", "Four-layer qualification traversable"],
  ["AR", "Cross-domain refs ≠ ownership"],
  ["AS", "Simulation ≠ observed state"],
  ["AT", "Traceability ≠ causality"],
  ["AU", "Prediction boundary"],
  ["AV", "SHM boundary"],
  ["AW", "Actuation forbidden"],
  ["AX", "Spatial ownership unresolved"],
  ["AY", "Native solver false"],
  ["AZ", "productionDigitalTwinReady=false"],
  ["BA", "Hosted migration batch_84"],
  ["BB", "Hosted persistence / RLS"],
  ["BC", "Events/outbox thread events"],
  ["BD", "HTTP digital-threads"],
  ["BE", "HTTP digital-thread-as-of"],
  ["BF", "HTTP digital-thread-traversal"],
  ["BG", "HTTP digital-thread-compare"],
  ["BH", "HTTP digital-thread-integrity"],
  ["BI", "HTTP digital-thread-provenance"],
  ["BJ", "JWT/tenant isolation"],
  ["BK", "Workspace isolation"],
  ["BL", "UI digital-thread-ready"],
  ["BM", "Browser E2E"],
  ["BN", "Accessibility"],
  ["BO", "Responsive"],
  ["BP", "Secret exposure"],
  ["BQ", "Artifact identity"],
  ["BR", "Unit tests"],
  ["BS", "Architecture tests"],
  ["BT", "Docs digital thread intelligence"],
  ["BU", "Docs phase 12K"],
  ["BV", "Ownership matrix updated"],
  ["BW", "batch_75–83 untouched"],
  ["BX", "Phase 12L readiness flag only"],
  ["BY", "No domain/phase12l"],
  ["BZ", "V1 tags untouched"],
  ["CA", "Duplicate KG/TS/ownership false"],
  ["CB", "PHASE_12J pins (commit/hosted/version)"],
  ["CC", "Public contract adapters reserved when missing"],
  ["CD", "IntegrityAssessmentReady / DigitalThreadIntelligenceReady"],
] as const;

export type Phase12kGateId =
  (typeof PHASE_12K_DIGITAL_TWIN_DIGITAL_THREAD_GATES)[number][0];

export const PHASE_12K_GATE_COUNT =
  PHASE_12K_DIGITAL_TWIN_DIGITAL_THREAD_GATES.length;

export const PHASE_12K_DIGITAL_TWIN_VERSION = "0.11.0-digital-thread" as const;

export const PHASE_12A_CERTIFIED_COMMIT =
  "2c5ed03f7de12cde9bfb71a9d430f5e342291303" as const;
export const PHASE_12B_CERTIFIED_COMMIT =
  "5e1bb22486a9fdd6385fb980daf0150a330eca9b" as const;
export const PHASE_12C_CERTIFIED_COMMIT =
  "07b5ccc843395bd02633163dc654668da9f17658" as const;
export const PHASE_12D_CERTIFIED_COMMIT =
  "3e387f4b76cbd9c80b274585c7b78821482f496d" as const;
export const PHASE_12E_CERTIFIED_COMMIT =
  "b871e8c3eb9e1293604610bacdd410ecb4da5684" as const;
export const PHASE_12F_CERTIFIED_COMMIT =
  "2846421e7905a69c789a882a86da4071272278e3" as const;
export const PHASE_12G_CERTIFIED_COMMIT =
  "a3832076425b276f089e38f1c9aa76559014454c" as const;
export const PHASE_12H_CERTIFIED_COMMIT =
  "f276dbb15b3a68d2863b3547a2dc58aa1ef3afbe" as const;
export const PHASE_12H_HOSTED_RUN = "31263802033" as const;
export const PHASE_12H_VERSION = "0.8.0-simulation-assurance" as const;
export const PHASE_12I_CERTIFIED_COMMIT =
  "6989d310a91b04db5949954a57db060782dd8dec" as const;
export const PHASE_12I_HOSTED_RUN = "31265781321" as const;
export const PHASE_12I_VERSION = "0.9.0-external-solver" as const;
export const PHASE_12J_CERTIFIED_COMMIT =
  "b9c9a911e96e490022248badd99630ddc8cacb2f" as const;
export const PHASE_12J_HOSTED_RUN = "31267810968" as const;
export const PHASE_12J_VERSION = "0.10.0-solver-capabilities" as const;

export const PHASE_12K_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_12K_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_12K_ASSET_INTELLIGENCE_V1_TAG = "asset-intelligence-v1.0.0" as const;
export const PHASE_12K_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_12K_PROJECT_INTELLIGENCE_V1_TAG = "project-intelligence-v1.0.0" as const;
export const PHASE_12K_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;
export const PHASE_12K_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_12K_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;

export const PHASE_12K_DIGITAL_TWIN_TABLES = [
  "digital_twin_thread_profiles",
  "digital_twin_thread_snapshots",
  "digital_twin_thread_references",
  "digital_twin_thread_relationships",
  "digital_twin_thread_provenance",
  "digital_twin_thread_integrity",
  "digital_twin_thread_change_sets",
  "digital_twin_thread_reviews",
] as const;

export const PHASE_12K_FORBIDDEN_CAPABILITIES = [
  "NATIVE_ENGINEERING_SOLVER_IMPLEMENTED",
  "SIMULATION_OPTIMIZATION_IMPLEMENTED",
  "AUTOMATIC_SIMULATION_APPROVAL_ENABLED",
  "AUTOMATIC_SIMULATION_CALIBRATION_ENABLED",
  "PREDICTIVE_TWIN_IMPLEMENTED",
  "PROBABILISTIC_PREDICTION_IMPLEMENTED",
  "RUL_PREDICTION_IMPLEMENTED",
  "POF_PREDICTION_IMPLEMENTED",
  "HIGH_FREQUENCY_TELEMETRY_IMPLEMENTED",
  "TELEMETRY_HISTORIAN_IMPLEMENTED",
  "SENSOR_REGISTRY_IMPLEMENTED",
  "SHM_SIGNAL_PROCESSING_IMPLEMENTED",
  "SHM_RUNTIME_IMPLEMENTED",
  "SHM_SIMULATION_CALIBRATION_IMPLEMENTED",
  "THREE_D_VIEWER_IMPLEMENTED",
  "PHYSICAL_ACTUATION_ENABLED",
  "AUTOMATIC_CONTROL_ENABLED",
  "PRODUCTION_DIGITAL_TWIN_READY",
  "DUPLICATE_TIME_SERIES_PLANE_DETECTED",
  "DUPLICATE_MODEL_OWNERSHIP_DETECTED",
  "DUPLICATE_ENGINEERING_TOOL_FRAMEWORK_DETECTED",
  "DUPLICATE_SOLVER_OWNERSHIP_DETECTED",
  "DUPLICATE_KNOWLEDGE_GRAPH_DETECTED",
  "SPATIAL_OWNERSHIP_FULLY_RESOLVED",
  "SILENT_SOLVER_FALLBACK_ALLOWED",
] as const;

export const PHASE_12K_REQUIRED_READY_FLAGS = [
  "TWIN_SIMULATION_FRAMEWORK_READY",
  "SIMULATION_METHOD_QUALIFICATION_READY",
  "SIMULATION_PROVIDER_QUALIFICATION_READY",
  "SIMULATION_APPLICATION_QUALIFICATION_READY",
  "SIMULATION_EXECUTION_QUALIFICATION_READY",
  "TWIN_SIMULATION_PACKAGE_READY",
  "EXTERNAL_SOLVER_ADAPTER_FRAMEWORK_READY",
  "SOLVER_CAPABILITY_REGISTRY_READY",
  "FOUR_LAYER_QUALIFICATION_INTACT",
  "REAL_SOLVER_EXECUTION_CERTIFIED",
  "CALCULIX_ADAPTER_INTACT",
  "DIGITAL_THREAD_INTELLIGENCE_READY",
  "PROVENANCE_READY",
  "INTEGRITY_ASSESSMENT_READY",
  "TEMPORAL_TRAVERSAL_READY",
  "CHANGE_SET_READY",
  "KNOWLEDGE_GRAPH_REUSE_READY",
  "PHASE_12J_READY",
  "PHASE_12K_READY",
  "PHASE_12L_READY",
] as const;
