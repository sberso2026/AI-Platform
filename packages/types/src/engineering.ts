/**
 * Engineering OS types — Batch 2.0 Core
 */

export type EngineeringProjectStatus =
  | "draft"
  | "active"
  | "on_hold"
  | "completed"
  | "cancelled"
  | "archived";

export type EngineeringProjectPhase =
  | "concept"
  | "feasibility"
  | "design"
  | "detailed_design"
  | "procurement"
  | "construction"
  | "commissioning"
  | "operations"
  | "decommissioning";

export type EngineeringAssetCriticality = "low" | "medium" | "high" | "critical";

export type EngineeringDocumentStatus =
  | "draft"
  | "issued"
  | "for_review"
  | "approved"
  | "superseded"
  | "obsolete";

export type EngineeringCompanyType =
  | "owner"
  | "consultant"
  | "contractor"
  | "vendor"
  | "fabricator"
  | "inspector"
  | "regulator"
  | "client";

export interface EngineeringProject {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  project_code: string;
  project_name: string;
  client_name?: string;
  site_name?: string;
  location?: string;
  industry?: string;
  project_type?: string;
  project_phase: EngineeringProjectPhase;
  status: EngineeringProjectStatus;
  start_date?: string;
  end_date?: string;
  metadata: Record<string, unknown>;
  knowledge_node_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EngineeringAsset {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  engineering_project_id?: string;
  asset_tag: string;
  asset_name: string;
  asset_type_id?: string;
  discipline_id?: string;
  parent_asset_id?: string;
  location?: string;
  system?: string;
  subsystem?: string;
  criticality: EngineeringAssetCriticality;
  status: string;
  metadata: Record<string, unknown>;
  digital_twin_id?: string;
  knowledge_node_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface EngineeringDocument {
  id: string;
  tenant_id: string;
  workspace_id?: string;
  engineering_project_id?: string;
  asset_id?: string;
  document_number: string;
  title: string;
  document_type?: string;
  discipline_id?: string;
  revision: string;
  status: EngineeringDocumentStatus;
  file_path?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  source?: string;
  knowledge_node_id?: string;
  uploaded_by?: string;
  uploaded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EngineeringDiscipline {
  id: string;
  tenant_id?: string;
  discipline_key: string;
  name: string;
  description?: string;
  is_system: boolean;
  created_at: string;
}

export interface EngineeringCompany {
  id: string;
  tenant_id: string;
  name: string;
  company_type: EngineeringCompanyType;
  registration_number?: string;
  country?: string;
  status: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface EngineeringApplication {
  id: string;
  app_key: string;
  name: string;
  description?: string;
  status: string;
  version: string;
  required_capabilities: string[];
  required_permissions: string[];
  routes: unknown[];
  enabled: boolean;
  installed_at?: string;
}

export interface EngineeringSettings {
  id: string;
  tenant_id: string;
  document_numbering_format: string;
  asset_tag_format: string;
  ai_review_threshold: number;
  enabled_applications: string[];
  metadata: Record<string, unknown>;
  updated_at: string;
}

export const ENGINEERING_PERMISSIONS = [
  "engineering.view",
  "engineering.admin",
  "engineering.project.create",
  "engineering.project.update",
  "engineering.project.delete",
  "engineering.asset.create",
  "engineering.asset.update",
  "engineering.asset.delete",
  "engineering.document.upload",
  "engineering.document.review",
  "engineering.ai.use",
  "engineering.report.create",
  "engineering.application.install",
  "engineering.settings.manage",
] as const;

export type EngineeringPermission = (typeof ENGINEERING_PERMISSIONS)[number];
