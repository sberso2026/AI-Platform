import type { ArtifactType } from "./types";
import type { GeneratorWorkType } from "../work-generator/types";
import type { LifecycleStage } from "../lifecycle-intelligence/types";

export const TEMPLATE_SOURCE_CLASSES = ["EOS_DEFAULT", "COMPANY_OFFICIAL", "PROJECT_CLIENT_APPROVED"] as const;
export type TemplateSourceClass = (typeof TEMPLATE_SOURCE_CLASSES)[number];

export const TEMPLATE_FALLBACK_POLICIES = [
  "OFFICIAL_TEMPLATE_REQUIRED",
  "ALLOW_EOS_DEFAULT_IF_OFFICIAL_UNAVAILABLE",
] as const;
export type TemplateFallbackPolicy = (typeof TEMPLATE_FALLBACK_POLICIES)[number];

export const TEMPLATE_PRESENTATION_STATUSES = ["DRAFT", "VALIDATING", "ACTIVE", "RETIRED"] as const;
export type TemplatePresentationStatus = (typeof TEMPLATE_PRESENTATION_STATUSES)[number];

export const TEMPLATE_PRESENTATION_KINDS = ["DEFINITION", "SHELL", "COMBINED"] as const;
export type TemplatePresentationKind = (typeof TEMPLATE_PRESENTATION_KINDS)[number];

export const TEMPLATE_RESOLUTION_STATES = [
  "AVAILABLE",
  "NO_TEMPLATE_CONFIGURED",
  "CONFIGURED_TEMPLATE_UNAVAILABLE",
  "TEMPLATE_UNAVAILABLE",
  "TEMPLATE_RESOLUTION_CONFLICT",
] as const;
export type TemplateResolutionState = (typeof TEMPLATE_RESOLUTION_STATES)[number];

export const DEFAULT_TEMPLATE_FALLBACK_POLICY: TemplateFallbackPolicy = "OFFICIAL_TEMPLATE_REQUIRED";

export type ArtifactBranding = {
  companyName?: string | null;
  address?: string | null;
  documentNumbering?: string | null;
  preparedLabel?: string | null;
  checkedLabel?: string | null;
  approvedLabel?: string | null;
};

export function documentCreator(branding?: ArtifactBranding | null): string {
  const name = branding?.companyName?.trim();
  return name && name.length > 0 ? name : "Engineering OS";
}

export type ArtifactTemplatePolicyRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  projectId: string | null;
  artifactType: ArtifactType;
  templateCode: string;
  templateVersion: string;
  name: string;
  sourceClass: Exclude<TemplateSourceClass, "EOS_DEFAULT">;
  status: TemplatePresentationStatus;
  disciplines: string[];
  workTypes: GeneratorWorkType[];
  lifecycleStages: LifecycleStage[];
  packagedAssetKey: string;
  binarySourceKind?: "PACKAGED" | "SHAREPOINT_MANAGED";
  externalSourceRefId?: string | null;
  presentationKind: Exclude<TemplatePresentationKind, "DEFINITION">;
  branding: ArtifactBranding;
  fallbackPolicy: TemplateFallbackPolicy;
  active: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TenantTemplateFallbackPolicy = {
  id: string;
  tenantId: string;
  workspaceId: string;
  fallbackPolicy: TemplateFallbackPolicy;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export const TEMPLATE_PRECEDENCE: TemplateSourceClass[] = [
  "PROJECT_CLIENT_APPROVED",
  "COMPANY_OFFICIAL",
  "EOS_DEFAULT",
];
