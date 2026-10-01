import type { ArtifactOutputFormat } from "../artifact-automation/types";

export const TOOL_ORCHESTRATION_RECON = {
  externalToolGovernance: "REUSE",
  toolRegistry: "REUSE",
  toolCapabilityRegistry: "EXTEND",
  executionHost: "REUSE",
  jobService: "REUSE",
  eventBus: "REUSE",
  managedRepository: "COMPOSE",
  engineeringWorkEvent: "EXTEND",
  artifactAutomation: "COMPOSE",
  documentInfrastructure: "REUSE",
  secureDownload: "REUSE",
  windowsLauncher: "MISSING",
  desktopBridge: "MISSING",
  customProtocol: "CONTRACT_ONLY",
  analysisAdapters: "REUSE",
} as const;

export const HANDOFF_MODES = ["BROWSER_DOWNLOAD", "MANAGED_REPOSITORY_OPEN", "DESKTOP_BRIDGE", "EXECUTION_HOST"] as const;
export type HandoffMode = (typeof HANDOFF_MODES)[number];

export const HANDOFF_STATUSES = [
  "PREPARED",
  "HANDED_OFF",
  "EXTERNAL_WORK_IN_PROGRESS",
  "RETURN_PENDING",
  "RETURNED_TO_MANAGED_REPOSITORY",
  "PUBLISHED",
  "SUPERSEDED",
  "FAILED",
] as const;
export type HandoffStatus = (typeof HANDOFF_STATUSES)[number];

export const HANDOFF_CAPABILITIES = [
  "OPEN_XLSX",
  "EDIT_XLSX",
  "OPEN_DOCX",
  "EDIT_DOCX",
  "OPEN_PPTX",
  "VIEW_PDF",
  "EDIT_DWG",
  "RUN_STRUCTURAL_ANALYSIS",
  "IMPORT_ANALYSIS_RESULTS",
  "EXPORT_MODEL",
] as const;
export type HandoffCapability = (typeof HANDOFF_CAPABILITIES)[number];

export const HANDOFF_FAILURES = [
  "TOOL_NOT_INSTALLED",
  "TOOL_NOT_READY",
  "CAPABILITY_NOT_CERTIFIED",
  "LICENSE_UNAVAILABLE",
  "HANDOFF_EXPIRED",
  "BRIDGE_UNAVAILABLE",
  "UNAUTHORIZED",
  "ARBITRARY_EXECUTABLE_DENIED",
  "COMMAND_INJECTION_DENIED",
  "CROSS_PROJECT_MISMATCH",
  "PERSONAL_FILE_OUTSIDE_EOS",
  "PATH_TRAVERSAL_DENIED",
  "UNSAFE_FILENAME",
  "MALWARE_SCAN_FAILED",
  "MALWARE_INFECTED",
] as const;
export type HandoffFailure = (typeof HANDOFF_FAILURES)[number];

export const DESKTOP_BRIDGE_STATUS = "CONTRACT_ONLY" as const;
export const DESKTOP_PROTOCOL = "rtb-eos";
export const HANDOFF_TOKEN_TTL_MS = 10 * 60 * 1000;
export const MAX_RETURN_BYTES = 15 * 1024 * 1024;
export const ARTIFACT_BINARY_STORE = {
  metadata: "engineering_generated_artifacts + engineering_artifact_generation_runs",
  binary: "ArtifactBinaryStore",
  type: "object_storage_with_legacy_compatibility",
  bucket: "engineering-artifacts",
  risk: "MITIGATED_FOR_PILOT" as const,
  recommendedMigration: "A14A: generated and returned artifacts write to private engineering-artifacts bucket; content_base64 retained for rollback only.",
};

export const TOOL_ORCHESTRATION_PRIVACY = {
  localRecursiveScan: "PROHIBITED",
  downloadMonitoring: false,
  personalFilesOutsideEos: true,
  keystrokeCapture: false,
  applicationDurationMonitoring: false,
  arbitraryExecutableLaunch: false,
  shellCommandExecution: false,
} as const;

export type EngineeringToolHandoff = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string;
  workPlanId: string | null;
  artifactId: string | null;
  sourceRef: string | null;
  toolCode: string;
  capability: HandoffCapability;
  handoffMode: HandoffMode;
  status: HandoffStatus;
  requestedBy: string | null;
  requestedAt: string;
  expiresAt: string;
  tokenHash: string;
  consumedAt: string | null;
  inputFingerprint: string | null;
  failure: HandoffFailure | null;
  explanation: string;
  launchedNativeApplication: false;
  engineeringApproved: false;
  protocolUrl: string | null;
};

export const A11D_HANDOFF = {
  usesWorkPlans: true,
  usesGeneratedAndReturnedArtifacts: true,
  usesAuthoritativeProjectInformation: true,
  usesDigitalThread: true,
  usesEngineeringReviewAi: true,
  autonomousApproval: false,
} as const;

export const OFFICE_HANDOFF_BY_FORMAT: Record<ArtifactOutputFormat, { toolCode: string; capability: HandoffCapability; label: string; mode: HandoffMode }> = {
  XLSX: { toolCode: "microsoft-excel", capability: "OPEN_XLSX", label: "Download and Open in Excel", mode: "BROWSER_DOWNLOAD" },
  DOCX: { toolCode: "microsoft-word", capability: "OPEN_DOCX", label: "Download and Open in Word", mode: "BROWSER_DOWNLOAD" },
  PPTX: { toolCode: "microsoft-powerpoint", capability: "OPEN_PPTX", label: "Download and Open in PowerPoint", mode: "BROWSER_DOWNLOAD" },
};
