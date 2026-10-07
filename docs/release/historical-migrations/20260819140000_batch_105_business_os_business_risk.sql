-- Batch 105: Business OS BOS-9 Business Risk
-- Canonical risk, versioned assessment, controls, treatments (linking existing actions),
-- obligations, bounded incidents, evidence refs, and lightweight tolerance settings.
-- Does not create a second task system, GRC suite, autonomous acceptance, or regulator writes.

ALTER TABLE public.business_os_kpis
  DROP CONSTRAINT IF EXISTS business_os_kpis_category_check;

ALTER TABLE public.business_os_kpis
  ADD CONSTRAINT business_os_kpis_category_check
  CHECK (category IN (
    'revenue',
    'cash',
    'margin',
    'receivables',
    'pipeline',
    'operations',
    'decision',
    'risk',
    'general'
  ));

ALTER TABLE public.business_os_decision_contexts
  DROP CONSTRAINT IF EXISTS business_os_decision_contexts_domain_check;

ALTER TABLE public.business_os_decision_contexts
  ADD CONSTRAINT business_os_decision_contexts_domain_check
  CHECK (domain IN (
    'finance',
    'growth',
    'revenue',
    'customer',
    'profit',
    'operations',
    'signal',
    'kpi',
    'document',
    'risk',
    'general'
  ));

ALTER TABLE public.business_os_decision_evidence
  DROP CONSTRAINT IF EXISTS business_os_decision_evidence_source_domain_check;

ALTER TABLE public.business_os_decision_evidence
  ADD CONSTRAINT business_os_decision_evidence_source_domain_check
  CHECK (source_domain IN (
    'finance',
    'growth',
    'revenue',
    'customer',
    'profit',
    'operations',
    'signal',
    'kpi',
    'document',
    'risk',
    'general'
  ));

CREATE TABLE IF NOT EXISTS business_os_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  reference text NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'other' CHECK (category IN (
    'strategic',
    'financial',
    'customer',
    'commercial',
    'operational',
    'workforce',
    'supplier',
    'compliance',
    'legal',
    'cyber',
    'technology',
    'reputation',
    'continuity',
    'other'
  )),
  domain text,
  nature text NOT NULL DEFAULT 'threat' CHECK (nature IN ('threat')),
  owner_label text,
  status text NOT NULL DEFAULT 'identified' CHECK (status IN (
    'identified',
    'assessing',
    'open',
    'treating',
    'monitoring',
    'accepted',
    'closed',
    'archived'
  )),
  source_type text NOT NULL,
  source_ref text NOT NULL,
  identified_at timestamptz NOT NULL DEFAULT now(),
  review_at timestamptz,
  closed_at timestamptz,
  accepted_at timestamptz,
  accepted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  linked_decision_id uuid REFERENCES business_os_decisions(id) ON DELETE SET NULL,
  tolerance_exception_at timestamptz,
  tolerance_exception_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  tolerance_exception_rationale text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, reference),
  UNIQUE (tenant_id, workspace_id, source_type, source_ref)
);

CREATE INDEX IF NOT EXISTS idx_bos_risks_scope
  ON business_os_risks (tenant_id, workspace_id, status, review_at);

CREATE TABLE IF NOT EXISTS business_os_risk_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  risk_id uuid NOT NULL REFERENCES business_os_risks(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version >= 1),
  method text NOT NULL DEFAULT 'risk_assessment.v1' CHECK (method = 'risk_assessment.v1'),
  likelihood text NOT NULL CHECK (likelihood IN (
    'rare',
    'unlikely',
    'possible',
    'likely',
    'almost_certain',
    'unknown'
  )),
  impact text NOT NULL CHECK (impact IN (
    'insignificant',
    'minor',
    'moderate',
    'major',
    'severe',
    'unknown'
  )),
  inherent_level text NOT NULL CHECK (inherent_level IN (
    'low',
    'moderate',
    'high',
    'extreme',
    'unknown'
  )),
  residual_level text NOT NULL CHECK (residual_level IN (
    'low',
    'moderate',
    'high',
    'extreme',
    'unknown'
  )),
  inherent_score integer CHECK (inherent_score IS NULL OR (inherent_score >= 1 AND inherent_score <= 25)),
  residual_score integer CHECK (residual_score IS NULL OR (residual_score >= 1 AND residual_score <= 25)),
  assessor_label text,
  rationale text,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  residual_method text NOT NULL DEFAULT 'residual_risk.v1' CHECK (residual_method = 'residual_risk.v1'),
  residual_rationale text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, risk_id, version)
);

CREATE INDEX IF NOT EXISTS idx_bos_risk_assessments_risk
  ON business_os_risk_assessments (tenant_id, workspace_id, risk_id, version DESC);

CREATE TABLE IF NOT EXISTS business_os_risk_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  control_type text NOT NULL DEFAULT 'preventive' CHECK (control_type IN (
    'preventive',
    'detective',
    'corrective',
    'directive'
  )),
  owner_label text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN (
    'planned',
    'implemented',
    'operating',
    'ineffective',
    'suspended',
    'retired'
  )),
  effectiveness text NOT NULL DEFAULT 'untested' CHECK (effectiveness IN (
    'effective',
    'partially_effective',
    'ineffective',
    'untested',
    'unknown'
  )),
  frequency text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  tested_at timestamptz,
  review_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_risk_controls_scope
  ON business_os_risk_controls (tenant_id, workspace_id, status, effectiveness);

CREATE TABLE IF NOT EXISTS business_os_risk_control_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  risk_id uuid NOT NULL REFERENCES business_os_risks(id) ON DELETE CASCADE,
  control_id uuid NOT NULL REFERENCES business_os_risk_controls(id) ON DELETE CASCADE,
  applicable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, risk_id, control_id)
);

CREATE TABLE IF NOT EXISTS business_os_risk_treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  risk_id uuid NOT NULL REFERENCES business_os_risks(id) ON DELETE CASCADE,
  strategy text NOT NULL CHECK (strategy IN (
    'avoid',
    'reduce',
    'transfer',
    'accept',
    'exploit',
    'monitor'
  )),
  decision_id uuid REFERENCES business_os_decisions(id) ON DELETE SET NULL,
  expected_residual_level text CHECK (expected_residual_level IS NULL OR expected_residual_level IN (
    'low',
    'moderate',
    'high',
    'extreme',
    'unknown'
  )),
  actual_residual_level text CHECK (actual_residual_level IS NULL OR actual_residual_level IN (
    'low',
    'moderate',
    'high',
    'extreme',
    'unknown'
  )),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_risk_treatments_risk
  ON business_os_risk_treatments (tenant_id, workspace_id, risk_id);

CREATE TABLE IF NOT EXISTS business_os_risk_action_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  risk_id uuid NOT NULL REFERENCES business_os_risks(id) ON DELETE CASCADE,
  treatment_id uuid REFERENCES business_os_risk_treatments(id) ON DELETE SET NULL,
  action_id uuid NOT NULL REFERENCES business_os_actions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, risk_id, action_id)
);

CREATE TABLE IF NOT EXISTS business_os_risk_obligations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  risk_id uuid REFERENCES business_os_risks(id) ON DELETE SET NULL,
  control_id uuid REFERENCES business_os_risk_controls(id) ON DELETE SET NULL,
  action_id uuid REFERENCES business_os_actions(id) ON DELETE SET NULL,
  title text NOT NULL,
  source_ref text,
  jurisdiction text,
  owner_label text,
  due_at timestamptz,
  review_at timestamptz,
  status text NOT NULL DEFAULT 'identified' CHECK (status IN (
    'identified',
    'applicable',
    'not_applicable',
    'in_progress',
    'compliant',
    'non_compliant',
    'overdue',
    'unknown'
  )),
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  authorized_confirmation boolean NOT NULL DEFAULT false,
  confirmation_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  confirmation_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_risk_obligations_scope
  ON business_os_risk_obligations (tenant_id, workspace_id, status, due_at);

CREATE TABLE IF NOT EXISTS business_os_risk_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  risk_id uuid REFERENCES business_os_risks(id) ON DELETE SET NULL,
  action_id uuid REFERENCES business_os_actions(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  occurred_at timestamptz NOT NULL,
  severity text NOT NULL DEFAULT 'unknown' CHECK (severity IN (
    'low',
    'medium',
    'high',
    'critical',
    'unknown'
  )),
  source_type text NOT NULL,
  source_ref text NOT NULL,
  impact text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, source_type, source_ref)
);

CREATE TABLE IF NOT EXISTS business_os_risk_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  risk_id uuid NOT NULL REFERENCES business_os_risks(id) ON DELETE CASCADE,
  source_type text NOT NULL CHECK (source_type IN (
    'finance',
    'growth',
    'revenue',
    'customer',
    'profit',
    'operations',
    'decision',
    'action',
    'signal',
    'kpi',
    'document',
    'incident',
    'obligation',
    'control'
  )),
  source_ref text NOT NULL,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at timestamptz NOT NULL DEFAULT now(),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, risk_id, source_type, source_ref)
);

CREATE INDEX IF NOT EXISTS idx_bos_risk_evidence_risk
  ON business_os_risk_evidence (tenant_id, workspace_id, risk_id);

CREATE TABLE IF NOT EXISTS business_os_risk_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  effective_at timestamptz NOT NULL DEFAULT now(),
  default_max_acceptable_level text NOT NULL DEFAULT 'high' CHECK (default_max_acceptable_level IN (
    'low',
    'moderate',
    'high',
    'extreme'
  )),
  rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id)
);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'business_os_risks',
    'business_os_risk_assessments',
    'business_os_risk_controls',
    'business_os_risk_control_links',
    'business_os_risk_treatments',
    'business_os_risk_action_links',
    'business_os_risk_obligations',
    'business_os_risk_incidents',
    'business_os_risk_evidence',
    'business_os_risk_settings'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON %I', t, t);
    IF t IN (
      'business_os_risks',
      'business_os_risk_controls',
      'business_os_risk_treatments',
      'business_os_risk_obligations',
      'business_os_risk_settings'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
        t, t
      );
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_select', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_select', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_insert', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_insert', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_update', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       ) WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_update', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_delete', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_delete', t
    );
  END LOOP;
END $$;
