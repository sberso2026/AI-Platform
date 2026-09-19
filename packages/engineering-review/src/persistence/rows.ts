/**
 * Database row shapes for Engineering Review tables.
 * These are persistence DTOs — they must not leak into domain construction
 * without passing through mappers that validate vocabularies.
 */

export type JsonObject = Record<string, unknown>;

export type ReviewPackageRow = {
  id: string;
  tenant_id: string;
  workspace_id: string;
  project_id: string;
  name: string;
  status: string;
  documents: unknown;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type ReviewRunRow = {
  id: string;
  review_package_id: string;
  tenant_id: string;
  workspace_id: string;
  project_id: string;
  status: string;
  scope: unknown;
  input_documents: unknown;
  rules: unknown;
  provenance: unknown;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewFindingRow = {
  id: string;
  review_package_id: string;
  review_run_id: string;
  tenant_id: string;
  workspace_id: string;
  project_id: string;
  discipline: string | null;
  category: string;
  title: string;
  description: string;
  severity: string;
  confidence_band: string;
  confidence_score: number;
  requirement_references: unknown;
  reasoning_summary: string;
  reasoning_basis: string;
  recommended_action: string;
  status: string;
  verification_state: string;
  human_disposition_id: string | null;
  provenance: unknown;
  created_at: string;
  updated_at: string;
};

export type ReviewEvidenceRow = {
  id: string;
  finding_id: string;
  tenant_id: string;
  workspace_id: string;
  project_id: string;
  document_id: string;
  revision: string | null;
  page: number | null;
  section: string | null;
  chunk_id: string | null;
  span: string | null;
  retrieval_id: string | null;
  source_type: string;
  verification_state: string;
  content_hash: string | null;
  created_at: string;
  updated_at: string;
};

export type ReviewDispositionRow = {
  id: string;
  finding_id: string;
  tenant_id: string;
  workspace_id: string;
  project_id: string;
  action: string;
  previous_status: string;
  new_status: string;
  actor_id: string;
  actor_kind: string;
  reason: string | null;
  assigned_to: string | null;
  occurred_at: string;
  created_at: string;
};
