/**
 * Engineering OS External Tool taxonomy.
 * Catalog of tool *types* — not a second Platform Intelligence tool registry,
 * and not a second EMI solver-capability registry. Bindings reference those.
 */

export const EXTERNAL_TOOL_CATEGORIES = [
  "ANALYSIS_SIMULATION",
  "CAD_BIM",
  "PROJECT_CONTROLS",
  "DOCUMENT_INFORMATION",
  "ERP_COMMERCIAL",
  "DATA_ANALYTICS",
  "ASSET_OPERATIONS",
  "FIELD_INSPECTION",
  "COLLABORATION",
  "DATA_SOURCE",
  "OTHER",
] as const;

export type ExternalToolCategory = (typeof EXTERNAL_TOOL_CATEGORIES)[number];

export const EXTERNAL_TOOL_INTEGRATION_MODES = [
  "EXECUTION_ADAPTER",
  "API_CONNECTOR",
  "MODEL_FILE_INTEROP",
  "DATA_CONNECTOR",
] as const;

export type ExternalToolIntegrationMode = (typeof EXTERNAL_TOOL_INTEGRATION_MODES)[number];

export const EXTERNAL_TOOL_LICENCE_STATUSES = [
  "UNKNOWN",
  "AVAILABLE",
  "UNAVAILABLE",
  "EXPIRED",
  "NOT_REQUIRED",
] as const;

export type ExternalToolLicenceStatus = (typeof EXTERNAL_TOOL_LICENCE_STATUSES)[number];

/** Generic licence class. Not vendor-specific. */
export const EXTERNAL_TOOL_LICENCE_TYPES = [
  "TRIAL",
  "SUBSCRIPTION",
  "PERPETUAL",
  "ENTERPRISE",
  "EDUCATIONAL",
  "OTHER",
  "UNKNOWN",
] as const;

export type ExternalToolLicenceType = (typeof EXTERNAL_TOOL_LICENCE_TYPES)[number];

export function isLicenceType(value: string): value is ExternalToolLicenceType {
  return (EXTERNAL_TOOL_LICENCE_TYPES as readonly string[]).includes(value);
}

export const EXTERNAL_TOOL_AUTOMATION_PERMISSIONS = [
  "UNKNOWN",
  "PERMITTED",
  "NOT_PERMITTED",
  "REQUIRES_CONFIRMATION",
] as const;

export type ExternalToolAutomationPermission = (typeof EXTERNAL_TOOL_AUTOMATION_PERMISSIONS)[number];

export const EXTERNAL_TOOL_CAPABILITY_STATUSES = [
  "NOT_CONFIGURED",
  "AVAILABLE",
  "CERTIFIED",
  "NOT_CERTIFIED",
  "UNSUPPORTED",
  "BLOCKED",
] as const;

export type ExternalToolCapabilityStatus = (typeof EXTERNAL_TOOL_CAPABILITY_STATUSES)[number];

export const EXTERNAL_TOOL_READINESS = [
  "NOT_CONFIGURED",
  "CONFIGURED",
  "VALIDATING",
  "READY",
  "DEGRADED",
  "UNAVAILABLE",
  "BLOCKED",
] as const;

export type ExternalToolReadiness = (typeof EXTERNAL_TOOL_READINESS)[number];

export const EXTERNAL_TOOL_INSTALLATION_STATUSES = [
  "UNKNOWN",
  "NOT_INSTALLED",
  "INSTALLED",
  "INVALID",
] as const;

export type ExternalToolInstallationStatus = (typeof EXTERNAL_TOOL_INSTALLATION_STATUSES)[number];

/** Logical capability keys used on tool profiles. Not a duplicate of `capabilities` table. */
export const EXTERNAL_TOOL_CAPABILITY_KEYS = [
  "MODEL_CREATE",
  "MODEL_IMPORT",
  "LINEAR_STATIC_ANALYSIS",
  "BUCKLING_ANALYSIS",
  "DYNAMIC_ANALYSIS",
  "RESULT_EXTRACTION",
  "DESIGN_CHECK",
  "OPTIMIZATION_EXECUTION",
  "CONNECTION_READ",
  "CONNECTION_WRITE",
  "FILE_IMPORT",
  "FILE_EXPORT",
] as const;

export type ExternalToolCapabilityKey = (typeof EXTERNAL_TOOL_CAPABILITY_KEYS)[number];

export type CatalogCapability = {
  key: ExternalToolCapabilityKey;
  availability: ExternalToolCapabilityStatus;
  certification: ExternalToolCapabilityStatus;
  notes: string;
};

export type ExternalToolCatalogEntry = {
  toolCode: string;
  name: string;
  vendor: string;
  category: ExternalToolCategory;
  integrationModes: ExternalToolIntegrationMode[];
  adapterId: string | null;
  adapterVersion: string | null;
  providerKey: string | null;
  platformToolKey: string | null;
  compatibleToolVersions: string[];
  notCertifiedToolVersions: string[];
  minSupportedVersion: string | null;
  capabilities: CatalogCapability[];
  licenceRequired: boolean;
  notes: string;
};

/** Reuses existing SPACE GASS adapter identity; does not claim hosted certification. */
export const SPACE_GASS_CATALOG_ENTRY: ExternalToolCatalogEntry = {
  toolCode: "spacegass",
  name: "SPACE GASS",
  vendor: "SPACE GASS",
  category: "ANALYSIS_SIMULATION",
  integrationModes: ["EXECUTION_ADAPTER"],
  adapterId: "spacegass_solver_adapter",
  adapterVersion: "0.3.0-spacegass",
  providerKey: "spacegass",
  platformToolKey: null,
  compatibleToolVersions: ["12.0", "13.0", "14.0", "14.1", "14.2"],
  notCertifiedToolVersions: ["15"],
  minSupportedVersion: "12.0",
  capabilities: [
    {
      key: "MODEL_CREATE",
      availability: "NOT_CERTIFIED",
      certification: "NOT_CERTIFIED",
      notes: "Authoring remains client-owned. Not certified for EOS-A5E.",
    },
    {
      key: "MODEL_IMPORT",
      availability: "AVAILABLE",
      certification: "NOT_CERTIFIED",
      notes: "Input mapping exists; hosted import not certified.",
    },
    {
      key: "LINEAR_STATIC_ANALYSIS",
      availability: "AVAILABLE",
      certification: "NOT_CERTIFIED",
      notes: "EMI method linear_elastic_static is qualified; hosted execution certified=false.",
    },
    {
      key: "BUCKLING_ANALYSIS",
      availability: "UNSUPPORTED",
      certification: "UNSUPPORTED",
      notes: "Reserved / not qualified in current adapter.",
    },
    {
      key: "DYNAMIC_ANALYSIS",
      availability: "UNSUPPORTED",
      certification: "UNSUPPORTED",
      notes: "Unavailable in current adapter.",
    },
    {
      key: "RESULT_EXTRACTION",
      availability: "AVAILABLE",
      certification: "NOT_CERTIFIED",
      notes: "Parser path exists; live extraction not certified.",
    },
    {
      key: "DESIGN_CHECK",
      availability: "UNSUPPORTED",
      certification: "UNSUPPORTED",
      notes: "Design-code check not certified.",
    },
    {
      key: "OPTIMIZATION_EXECUTION",
      availability: "AVAILABLE",
      certification: "NOT_CERTIFIED",
      notes: "Optimization may select this tool only after READY + capability CERTIFIED.",
    },
  ],
  licenceRequired: true,
  notes:
    "First governed execution-adapter profile. Intended LOCAL_WINDOWS_EXECUTION_HOST. Discovered Windows installs are recorded by discovery, not assumed from documentation. Do not fabricate READY or production authorization.",
};

export const MICROSOFT_365_CATALOG_ENTRY: ExternalToolCatalogEntry = {
  toolCode: "microsoft-365",
  name: "Microsoft 365",
  vendor: "Microsoft",
  category: "COLLABORATION",
  integrationModes: ["API_CONNECTOR"],
  adapterId: "engineering-e4-microsoft365",
  adapterVersion: null,
  providerKey: "microsoft365",
  platformToolKey: null,
  compatibleToolVersions: [],
  notCertifiedToolVersions: [],
  minSupportedVersion: null,
  capabilities: [
    {
      key: "CONNECTION_READ",
      availability: "AVAILABLE",
      certification: "NOT_CERTIFIED",
      notes: "Reuses Engineering OS E4 connector framework; live connection not implied.",
    },
    {
      key: "CONNECTION_WRITE",
      availability: "AVAILABLE",
      certification: "NOT_CERTIFIED",
      notes: "Write requires authorized scopes via secret reference, not inline credentials.",
    },
  ],
  licenceRequired: true,
  notes: "API connector example. Executable path is not applicable.",
};

export const IFC_CATALOG_ENTRY: ExternalToolCatalogEntry = {
  toolCode: "ifc",
  name: "IFC",
  vendor: "buildingSMART",
  category: "CAD_BIM",
  integrationModes: ["MODEL_FILE_INTEROP"],
  adapterId: "engineering-model-interoperability-ifc",
  adapterVersion: null,
  providerKey: "ifc",
  platformToolKey: null,
  compatibleToolVersions: ["IFC2x3", "IFC4"],
  notCertifiedToolVersions: [],
  minSupportedVersion: null,
  capabilities: [
    {
      key: "FILE_IMPORT",
      availability: "AVAILABLE",
      certification: "NOT_CERTIFIED",
      notes: "Reuses EMI IFC surfaces; not an execution host install.",
    },
    {
      key: "FILE_EXPORT",
      availability: "AVAILABLE",
      certification: "NOT_CERTIFIED",
      notes: "Export mapping is interoperability-owned.",
    },
  ],
  licenceRequired: false,
  notes: "Model-file interop example. No executable_path.",
};

export const EXTERNAL_TOOL_CATALOG: readonly ExternalToolCatalogEntry[] = [
  SPACE_GASS_CATALOG_ENTRY,
  MICROSOFT_365_CATALOG_ENTRY,
  IFC_CATALOG_ENTRY,
];

export function getCatalogEntry(toolCode: string): ExternalToolCatalogEntry | undefined {
  return EXTERNAL_TOOL_CATALOG.find((entry) => entry.toolCode === toolCode.trim().toLowerCase());
}

export function isExternalToolCategory(value: string): value is ExternalToolCategory {
  return (EXTERNAL_TOOL_CATEGORIES as readonly string[]).includes(value);
}

export function isIntegrationMode(value: string): value is ExternalToolIntegrationMode {
  return (EXTERNAL_TOOL_INTEGRATION_MODES as readonly string[]).includes(value);
}
