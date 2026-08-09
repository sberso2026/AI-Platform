/**
 * Phase 13D.1 certification gates (Controlled Engineering Execution Host Foundation).
 * 70 gates: A–Z (26) + AA–AZ (26) + BA–BR (18) = 70.
 */
export const PHASE_13D1_CONTROLLED_ENGINEERING_EXECUTION_HOST_GATES = [
  ["A", "Repository/build identity"],
  ["B", "Project Controls V1 tag intact"],
  ["C", "Asset Intelligence V1 tag intact"],
  ["D", "Project Intelligence V1 intact"],
  ["E", "Inspection Intelligence V1 intact"],
  ["F", "Digital Twin V1 tag intact"],
  ["G", "Execution host package exists"],
  ["H", "Execution host certification package exists"],
  ["I", "Version 0.1.0-execution-host"],
  ["J", "ControlledEngineeringExecutionHostReady is true"],
  ["K", "EngineeringExecutionHostRegistryReady is true"],
  ["L", "EngineeringExecutionJobReady is true"],
  ["M", "EngineeringExecutionHostHealthReady is true"],
  ["N", "ProviderHostProbeReady is true"],
  ["O", "ExecutionWorkspaceIsolationReady is true"],
  ["P", "EngineeringExecutionArtifactHandlingReady is true"],
  ["Q", "silentSolverFallbackAllowed is false"],
  ["R", "SPACEGASSLiveExecutionCertified is false"],
  ["S", "ETABSAdapterImplemented is false"],
  ["T", "ETABSExecutionCertified is false"],
  ["U", "analysisModelGenerationImplemented is false"],
  ["V", "duplicateToolFrameworkDetected is false"],
  ["W", "DigitalTwinV1Intact is true"],
  ["X", "releaseEligible is true"],
  ["Y", "phase13DReCertificationReady is true"],
  ["Z", "Ownership lock asserts"],
  ["AA", "Public contracts prerelease not 1.0.0"],
  ["AB", "Host contract module present"],
  ["AC", "Host registry module present"],
  ["AD", "Provider installation module present"],
  ["AE", "Generic provider host probe present"],
  ["AF", "SPACE GASS host probe present"],
  ["AG", "ETABS host reservation present"],
  ["AH", "Execution job + status enum present"],
  ["AI", "Execution workspace isolation present"],
  ["AJ", "Sandbox module present"],
  ["AK", "Host health module present"],
  ["AL", "License-state module present"],
  ["AM", "Version pinning module present"],
  ["AN", "Artifacts Platform Files refs only"],
  ["AO", "Events ids-only"],
  ["AP", "Persistence + postgres + memory"],
  ["AQ", "Control vs execution plane separation"],
  ["AR", "batch_88 migration present"],
  ["AS", "batch_86/87 not rewritten"],
  ["AT", "HTTP execution-hosts routes present"],
  ["AU", "UI marker engineering-execution-host-ready"],
  ["AV", "Operations runbook present"],
  ["AW", "SPACE GASS provisioning guide present"],
  ["AX", "Future ETABS architecture doc present"],
  ["AY", "Host contracts architecture doc present"],
  ["AZ", "Public contracts draft present"],
  ["BA", "Unit tests pass"],
  ["BB", "SPACE GASS availability probe runs (no live PASS required)"],
  ["BC", "Job authorization rejects missing metadata"],
  ["BD", "No provider fallback / no CalculiX substitute"],
  ["BE", "Workspace isolation + cleanup"],
  ["BF", "Sandbox baseline (path/timeout/shell/tenant)"],
  ["BG", "Idempotency key support"],
  ["BH", "Concurrency capacity rejection path"],
  ["BI", "Host revocation blocks new jobs"],
  ["BJ", "Provider revocation yields provider_unavailable"],
  ["BK", "Secret exposure scan clean"],
  ["BL", "Browser CERTIFY_BROWSER=1"],
  ["BM", "Workflow present Node 22"],
  ["BN", "Platform certification test present"],
  ["BO", "Interop remains 0.3.0-spacegass certified line"],
  ["BP", "Live probe modules retained non-certified"],
  ["BQ", "Digital Twin package untouched"],
  ["BR", "No Phase 13E / no auto Phase 13D PASS rerun"],
] as const;

export type Phase13d1GateId =
  (typeof PHASE_13D1_CONTROLLED_ENGINEERING_EXECUTION_HOST_GATES)[number][0];

export const PHASE_13D1_GATE_COUNT =
  PHASE_13D1_CONTROLLED_ENGINEERING_EXECUTION_HOST_GATES.length;

export const PHASE_13D1_EXECUTION_HOST_VERSION = "0.1.0-execution-host" as const;
export const PHASE_13D1_PUBLIC_CONTRACT_VERSION = "0.1.0-execution-host" as const;

export const PHASE_13D1_DIGITAL_TWIN_VERSION = "1.0.0" as const;
export const PHASE_13D1_DIGITAL_TWIN_TAG = "digital-twin-v1.0.0" as const;
export const PHASE_13D1_DIGITAL_TWIN_COMMIT =
  "a94425ed009ca087c2f44c9d3757c0c82bd936b1" as const;

export const PHASE_13C_VERSION = "0.3.0-spacegass" as const;
export const PHASE_13C_CERTIFIED_COMMIT =
  "a1c73721326927b507bb7c2f456d6188dd00e8b9" as const;

export const PHASE_13A_VERSION = "0.1.0-interop-discovery" as const;
export const PHASE_13A_PIN_COMMIT =
  "5d238f24a3c61b95011c6c2a0ab2f1bf81540267" as const;
export const PHASE_13B_VERSION = "0.2.0-ifc-federation" as const;
export const PHASE_13B_PIN_COMMIT =
  "1540f806ada0cf70179c3cfdffe4157f29620778" as const;

export const PHASE_13D1_PROJECT_CONTROLS_V1_TAG = "project-controls-v1.0.0" as const;
export const PHASE_13D1_PROJECT_CONTROLS_V1_COMMIT =
  "b17fe4cfe2574520ec813a7b43ba7328a585d741" as const;
export const PHASE_13D1_ASSET_INTELLIGENCE_V1_TAG =
  "asset-intelligence-v1.0.0" as const;
export const PHASE_13D1_ASSET_INTELLIGENCE_V1_COMMIT =
  "925e2ed74025cac6a145c346c17c53320efb8757" as const;
export const PHASE_13D1_INSPECTION_INTELLIGENCE_V1_TAG =
  "inspection-intelligence-v1.0.0" as const;
export const PHASE_13D1_INSPECTION_INTELLIGENCE_V1_COMMIT =
  "d47c4ffa4c7147d3e2053b0764dfe5c80b56eb09" as const;
export const PHASE_13D1_PROJECT_INTELLIGENCE_V1_TAG =
  "project-intelligence-v1.0.0" as const;
export const PHASE_13D1_PROJECT_INTELLIGENCE_V1_COMMIT =
  "34975b1cf660580d46287f24e746b8915903f768" as const;

export const PHASE_13D1_HOSTED_TABLES = [
  { table: "engineering_execution_hosts", pk: "host_id" },
  { table: "engineering_execution_host_providers", pk: "host_provider_id" },
  { table: "engineering_execution_jobs", pk: "job_id" },
  { table: "engineering_execution_job_artifacts", pk: "artifact_id" },
  { table: "engineering_execution_host_health", pk: "health_id" },
] as const;

export const PHASE_13D1_HTTP_ROUTES = [
  "apps/web/src/app/api/engineering/execution-hosts/route.ts",
  "apps/web/src/app/api/engineering/execution-hosts/providers/route.ts",
  "apps/web/src/app/api/engineering/execution-hosts/jobs/route.ts",
] as const;

export const PHASE_13D1_DOMAIN_MODULES = [
  "packages/engineering-execution-host/src/domain/engineering-execution-host.ts",
  "packages/engineering-execution-host/src/domain/host-registry.ts",
  "packages/engineering-execution-host/src/domain/provider-installation.ts",
  "packages/engineering-execution-host/src/domain/provider-host-probe.ts",
  "packages/engineering-execution-host/src/domain/spacegass-host-probe.ts",
  "packages/engineering-execution-host/src/domain/etabs-host-reservation.ts",
  "packages/engineering-execution-host/src/domain/execution-job.ts",
  "packages/engineering-execution-host/src/domain/execution-workspace.ts",
  "packages/engineering-execution-host/src/domain/sandbox.ts",
  "packages/engineering-execution-host/src/domain/host-health.ts",
  "packages/engineering-execution-host/src/domain/license-state.ts",
  "packages/engineering-execution-host/src/domain/version-pinning.ts",
  "packages/engineering-execution-host/src/domain/artifacts.ts",
  "packages/engineering-execution-host/src/domain/events.ts",
  "packages/engineering-execution-host/src/domain/persistence.ts",
  "packages/engineering-execution-host/src/domain/postgres-repository.ts",
  "packages/engineering-execution-host/src/domain/control-vs-execution-plane.ts",
] as const;
