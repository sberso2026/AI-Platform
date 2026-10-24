import type {
  CatalogCapability,
  ExternalToolAutomationPermission,
  ExternalToolCategory,
  ExternalToolInstallationStatus,
  ExternalToolIntegrationMode,
  ExternalToolLicenceStatus,
  ExternalToolLicenceType,
  ExternalToolReadiness,
} from "./catalog";

export type ExternalToolCapabilityRecord = CatalogCapability;

export type ExternalToolValidationAction =
  | "DETECT_INSTALLATION"
  | "VALIDATE_EXECUTABLE"
  | "DETECT_VERSION"
  | "CHECK_LICENCE_STATUS"
  | "VALIDATE_ADAPTER_COMPATIBILITY"
  | "TEST_CONNECTION_HOST"
  | "TEST_EXECUTION"
  | "VALIDATE_RESULT_PARSER"
  | "VALIDATE_UNITS"
  | "TEST_CONNECTION"
  | "VALIDATE_AUTHENTICATION"
  | "VALIDATE_PERMISSIONS"
  | "TEST_READ"
  | "TEST_WRITE"
  | "VALIDATE_WEBHOOK"
  | "VALIDATE_FORMAT_VERSION"
  | "VALIDATE_MAPPING_RULES";

export type ExternalToolValidationCheck = {
  action: ExternalToolValidationAction;
  status: "NOT_RUN" | "PASS" | "FAIL" | "BLOCKED";
  detail: string;
};

export type ExternalToolLastValidation = {
  ranAt: string | null;
  overall: "NOT_RUN" | "PASS" | "FAIL";
  checks: ExternalToolValidationCheck[];
};

export type ExternalToolProfile = {
  id: string;
  tenantId: string;
  toolCode: string;
  name: string;
  vendor: string;
  category: ExternalToolCategory;
  enabled: boolean;
  status: "draft" | "active" | "disabled";
  environment: "staging" | "production" | "unknown";
  integrationModes: ExternalToolIntegrationMode[];
  adapterId: string | null;
  adapterVersion: string | null;
  providerKey: string | null;
  platformToolKey: string | null;
  compatibleToolVersions: string[];
  notCertifiedToolVersions: string[];
  minSupportedVersion: string | null;
  executionHostId: string | null;
  installedVersion: string | null;
  executablePath: string | null;
  installationStatus: ExternalToolInstallationStatus;
  licenceStatus: ExternalToolLicenceStatus;
  licenceType: ExternalToolLicenceType;
  licenceExpiresAt: string | null;
  apiAvailable: boolean | null;
  productionUsePermitted: boolean;
  developmentEvaluationReadiness: "READY_FOR_DEVELOPMENT_EVALUATION" | "NOT_READY_FOR_DEVELOPMENT_EVALUATION";
  automationPermission: ExternalToolAutomationPermission;
  automationConfirmedBy: string | null;
  automationConfirmedAt: string | null;
  automationBasis: string | null;
  automationReference: string | null;
  /** Secret *reference* only. Never a credential value. */
  credentialSecretId: string | null;
  endpoint: string | null;
  connectorId: string | null;
  authScopes: string[];
  capabilities: ExternalToolCapabilityRecord[];
  lastValidation: ExternalToolLastValidation;
  ownerId: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  readiness: ExternalToolReadiness;
  adapterCompatibilityStatus: "NOT_CONFIGURED" | "CERTIFIED" | "NOT_CERTIFIED" | "INCOMPATIBLE";
};

export type ExternalToolProfileInput = Partial<Omit<ExternalToolProfile, "id" | "tenantId" | "readiness" | "adapterCompatibilityStatus" | "developmentEvaluationReadiness" | "createdAt" | "updatedAt">> & {
  toolCode: string;
  name: string;
  vendor: string;
  category: ExternalToolCategory;
  integrationModes: ExternalToolIntegrationMode[];
};

export type ExternalToolWorkspaceAssignment = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  profileId: string;
  allowed: boolean;
  permittedCapabilities: string[];
  designStandard: string | null;
  unitSystem: string | null;
  analysisProfile: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ExternalToolWorkspaceAssignmentInput = {
  workspaceId: string;
  projectId?: string | null;
  allowed?: boolean;
  permittedCapabilities?: string[];
  designStandard?: string | null;
  unitSystem?: string | null;
  analysisProfile?: string | null;
};
