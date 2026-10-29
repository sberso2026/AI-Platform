-- Phase 9B — Inspection Intelligence first vertical slice (additive)
-- Couples via inspection targets JSON; does not own assets/projects.

CREATE TABLE IF NOT EXISTS inspection_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  pack_id text NOT NULL DEFAULT 'generic',
  title text NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  checklist_item_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  template_id uuid NOT NULL REFERENCES inspection_templates(id),
  title text NOT NULL,
  status text NOT NULL DEFAULT 'planned',
  targets jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  plan_id uuid NOT NULL REFERENCES inspection_plans(id),
  status text NOT NULL DEFAULT 'assigned',
  targets jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  checklist_item_type text NOT NULL,
  body text NOT NULL,
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_measurements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  observation_id uuid REFERENCES inspection_observations(id),
  measurement_type text NOT NULL,
  observed_value jsonb NOT NULL,
  expected_value jsonb,
  unit text,
  evaluation_status text NOT NULL DEFAULT 'unknown',
  recorded_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  observation_id uuid REFERENCES inspection_observations(id),
  kind text NOT NULL,
  file_id text,
  external_url text,
  content_hash text NOT NULL,
  hash_algorithm text NOT NULL DEFAULT 'sha256',
  version integer NOT NULL DEFAULT 1,
  previous_evidence_id uuid REFERENCES inspection_evidence(id),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  chain_of_custody jsonb NOT NULL DEFAULT '{}'::jsonb,
  immutable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inspection_evidence_immutable_true CHECK (immutable = true)
);

CREATE TABLE IF NOT EXISTS inspection_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  status text NOT NULL DEFAULT 'requested',
  reviewer_person_id text,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inspection_templates_tenant_ws_idx
  ON inspection_templates (tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS inspection_plans_tenant_ws_idx
  ON inspection_plans (tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS inspection_sessions_tenant_ws_idx
  ON inspection_sessions (tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS inspection_observations_session_idx
  ON inspection_observations (session_id);
CREATE INDEX IF NOT EXISTS inspection_measurements_session_idx
  ON inspection_measurements (session_id);
CREATE INDEX IF NOT EXISTS inspection_evidence_session_idx
  ON inspection_evidence (session_id);
CREATE INDEX IF NOT EXISTS inspection_reviews_session_idx
  ON inspection_reviews (session_id);

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'inspection_templates',
    'inspection_plans',
    'inspection_sessions',
    'inspection_observations',
    'inspection_measurements',
    'inspection_evidence',
    'inspection_reviews'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      tbl || '_select',
      tbl
    );
  END LOOP;
END $$;
