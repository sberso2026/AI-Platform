-- Phase 9D — Inspection Intelligence engineering domain completion (additive)

CREATE TABLE IF NOT EXISTS inspection_defects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  observation_id uuid REFERENCES inspection_observations(id),
  asset_ref jsonb,
  taxonomy jsonb NOT NULL,
  status text NOT NULL DEFAULT 'identified',
  title text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  defect_id uuid REFERENCES inspection_defects(id),
  action text NOT NULL,
  rationale text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_corrective_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  defect_id uuid NOT NULL REFERENCES inspection_defects(id),
  recommendation_id uuid REFERENCES inspection_recommendations(id),
  owner_person_id text NOT NULL,
  due_at timestamptz NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  defect_id uuid REFERENCES inspection_defects(id),
  title text NOT NULL,
  body text NOT NULL,
  ai_generated boolean NOT NULL DEFAULT false,
  ai_run_id text,
  status text NOT NULL DEFAULT 'draft',
  approved_by_person_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  kind text NOT NULL,
  subject_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  verifier_person_id text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_compliance_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  defect_id uuid REFERENCES inspection_defects(id),
  reference jsonb NOT NULL,
  conformity text NOT NULL DEFAULT 'not_assessed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_risk_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  defect_id uuid REFERENCES inspection_defects(id),
  engineering_risk_id text NOT NULL,
  adapter text NOT NULL DEFAULT 'engineering_core_risk_register',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inspection_defects_session_idx ON inspection_defects (session_id);
CREATE INDEX IF NOT EXISTS inspection_recommendations_session_idx ON inspection_recommendations (session_id);
CREATE INDEX IF NOT EXISTS inspection_corrective_actions_session_idx ON inspection_corrective_actions (session_id);
CREATE INDEX IF NOT EXISTS inspection_verifications_session_idx ON inspection_verifications (session_id);
CREATE INDEX IF NOT EXISTS inspection_compliance_links_session_idx ON inspection_compliance_links (session_id);

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'inspection_defects',
    'inspection_recommendations',
    'inspection_corrective_actions',
    'inspection_assessments',
    'inspection_verifications',
    'inspection_compliance_links',
    'inspection_risk_links'
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
