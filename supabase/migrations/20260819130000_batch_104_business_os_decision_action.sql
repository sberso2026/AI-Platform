-- Batch 104: Business OS BOS-8 Decision & Action Intelligence
-- Bounded supporting entities for existing BOS-1 decisions/actions.
-- Does not create a second decision or task system.
-- Does not grant autonomous approval or external execution.

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
    'general'
  ));

CREATE TABLE IF NOT EXISTS business_os_decision_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  decision_id uuid NOT NULL REFERENCES business_os_decisions(id) ON DELETE CASCADE,
  question text NOT NULL,
  problem_statement text,
  originating_signal_id uuid REFERENCES business_os_signals(id) ON DELETE SET NULL,
  originating_recommendation_id uuid REFERENCES business_os_recommendations(id) ON DELETE SET NULL,
  domain text NOT NULL DEFAULT 'general' CHECK (domain IN (
    'finance',
    'growth',
    'revenue',
    'customer',
    'profit',
    'operations',
    'signal',
    'kpi',
    'document',
    'general'
  )),
  owner_label text,
  stakeholders jsonb NOT NULL DEFAULT '[]'::jsonb,
  urgency text NOT NULL DEFAULT 'normal' CHECK (urgency IN (
    'low',
    'normal',
    'high',
    'urgent',
    'critical'
  )),
  due_at timestamptz,
  evidence_completeness_bps integer CHECK (
    evidence_completeness_bps IS NULL
    OR (evidence_completeness_bps >= 0 AND evidence_completeness_bps <= 10000)
  ),
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  constraints jsonb NOT NULL DEFAULT '[]'::jsonb,
  selected_option_id uuid,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, decision_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_decision_contexts_source_key
  ON business_os_decision_contexts (tenant_id, workspace_id, source_type, source_ref);

CREATE INDEX IF NOT EXISTS idx_bos_decision_contexts_scope
  ON business_os_decision_contexts (tenant_id, workspace_id, due_at);

CREATE TABLE IF NOT EXISTS business_os_decision_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  decision_id uuid NOT NULL REFERENCES business_os_decisions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'candidate' CHECK (status IN (
    'candidate',
    'preferred',
    'rejected',
    'selected',
    'superseded'
  )),
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  constraints jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_benefits text,
  expected_costs text,
  expected_risks text,
  reversibility text NOT NULL DEFAULT 'unknown' CHECK (reversibility IN (
    'reversible',
    'partially_reversible',
    'irreversible',
    'unknown'
  )),
  generated_by text NOT NULL DEFAULT 'user' CHECK (generated_by IN (
    'deterministic_rule',
    'platform_ai_director',
    'user'
  )),
  ai_generated boolean NOT NULL DEFAULT false,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_decision_options_source_key
  ON business_os_decision_options (tenant_id, workspace_id, source_type, source_ref);

CREATE INDEX IF NOT EXISTS idx_bos_decision_options_decision
  ON business_os_decision_options (tenant_id, workspace_id, decision_id, status);

ALTER TABLE business_os_decision_contexts
  DROP CONSTRAINT IF EXISTS business_os_decision_contexts_selected_option_id_fkey;

ALTER TABLE business_os_decision_contexts
  ADD CONSTRAINT business_os_decision_contexts_selected_option_id_fkey
  FOREIGN KEY (selected_option_id) REFERENCES business_os_decision_options(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS business_os_decision_evidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  decision_id uuid NOT NULL REFERENCES business_os_decisions(id) ON DELETE CASCADE,
  option_id uuid REFERENCES business_os_decision_options(id) ON DELETE SET NULL,
  source_type text NOT NULL,
  source_domain text NOT NULL CHECK (source_domain IN (
    'finance',
    'growth',
    'revenue',
    'customer',
    'profit',
    'operations',
    'signal',
    'kpi',
    'document',
    'general'
  )),
  source_id text,
  source_ref text NOT NULL,
  summary text NOT NULL,
  value_state text NOT NULL DEFAULT 'unknown' CHECK (value_state IN (
    'known',
    'unknown',
    'qualitative'
  )),
  value_text text,
  value_minor bigint,
  currency char(3),
  scale smallint CHECK (scale IS NULL OR (scale >= 0 AND scale <= 6)),
  unit text,
  observed_at timestamptz,
  linked_at timestamptz NOT NULL DEFAULT now(),
  freshness text,
  confidence text NOT NULL DEFAULT 'unavailable' CHECK (confidence IN (
    'high',
    'medium',
    'low',
    'unavailable'
  )),
  evidence_quality text NOT NULL DEFAULT 'unavailable' CHECK (evidence_quality IN (
    'high',
    'medium',
    'low',
    'unavailable'
  )),
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  generated_by text NOT NULL DEFAULT 'user' CHECK (generated_by IN (
    'deterministic_rule',
    'platform_ai_director',
    'user'
  )),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_decision_evidence_source_key
  ON business_os_decision_evidence (tenant_id, workspace_id, decision_id, source_type, source_ref);

CREATE INDEX IF NOT EXISTS idx_bos_decision_evidence_decision
  ON business_os_decision_evidence (tenant_id, workspace_id, decision_id);

CREATE TABLE IF NOT EXISTS business_os_decision_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  option_id uuid NOT NULL REFERENCES business_os_decision_options(id) ON DELETE CASCADE,
  dimension text NOT NULL CHECK (dimension IN (
    'financial',
    'revenue',
    'customer',
    'operational',
    'capacity',
    'profit',
    'risk',
    'timing'
  )),
  quantification text NOT NULL DEFAULT 'unknown' CHECK (quantification IN (
    'quantitative',
    'qualitative',
    'unknown'
  )),
  value_minor bigint,
  currency char(3),
  scale smallint CHECK (scale IS NULL OR (scale >= 0 AND scale <= 6)),
  unit text,
  period text,
  qualitative_label text,
  qualitative_only boolean NOT NULL DEFAULT false,
  source_domain text,
  source_ref text,
  rule_version text,
  source_type text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, option_id, dimension)
);

CREATE INDEX IF NOT EXISTS idx_bos_decision_impacts_option
  ON business_os_decision_impacts (tenant_id, workspace_id, option_id);

CREATE TABLE IF NOT EXISTS business_os_decision_outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  decision_id uuid NOT NULL REFERENCES business_os_decisions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES business_os_decision_options(id) ON DELETE SET NULL,
  expected_outcome text,
  expected_metric_key text,
  expected_value numeric,
  expected_unit text,
  expected_currency char(3),
  expected_scale smallint CHECK (expected_scale IS NULL OR (expected_scale >= 0 AND expected_scale <= 6)),
  expected_period text,
  actual_outcome text,
  actual_metric_key text,
  actual_value numeric,
  actual_unit text,
  actual_currency char(3),
  actual_scale smallint CHECK (actual_scale IS NULL OR (actual_scale >= 0 AND actual_scale <= 6)),
  actual_period text,
  measurement_date date,
  measurement_window_start date,
  measurement_window_end date,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'measuring',
    'achieved',
    'partially_achieved',
    'not_achieved',
    'inconclusive',
    'cancelled'
  )),
  variance_value numeric,
  variance_state text NOT NULL DEFAULT 'unknown' CHECK (variance_state IN ('computed', 'unknown')),
  explanation text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_decision_outcomes_source_key
  ON business_os_decision_outcomes (tenant_id, workspace_id, source_type, source_ref);

CREATE INDEX IF NOT EXISTS idx_bos_decision_outcomes_decision
  ON business_os_decision_outcomes (tenant_id, workspace_id, decision_id, status);

CREATE TABLE IF NOT EXISTS business_os_decision_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  decision_id uuid NOT NULL REFERENCES business_os_decisions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES business_os_decision_options(id) ON DELETE SET NULL,
  assumptions_snapshot jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_outcome text,
  actual_outcome text,
  lesson_text text NOT NULL,
  draft_source text NOT NULL DEFAULT 'user' CHECK (draft_source IN (
    'deterministic_rule',
    'platform_ai_director',
    'user'
  )),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'proposed_ai',
    'accepted',
    'rejected'
  )),
  accepted_at timestamptz,
  accepted_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  memory_id uuid,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN (
    'pending',
    'reviewed',
    'not_required'
  )),
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_decision_lessons_source_key
  ON business_os_decision_lessons (tenant_id, workspace_id, source_type, source_ref);

CREATE INDEX IF NOT EXISTS idx_bos_decision_lessons_decision
  ON business_os_decision_lessons (tenant_id, workspace_id, decision_id, status);

CREATE TABLE IF NOT EXISTS business_os_decision_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  thresholds jsonb NOT NULL DEFAULT '{
    "overdueGraceDays": 0,
    "criticalFinancialImpactMinor": 10000000,
    "highFinancialImpactMinor": 1000000,
    "materialVarianceBps": 2000,
    "outcomeReviewOverdueDays": 0,
    "ineffectiveRepeatSample": 3,
    "comparisonScoringEnabled": false
  }'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
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
    'business_os_decision_contexts',
    'business_os_decision_options',
    'business_os_decision_evidence',
    'business_os_decision_impacts',
    'business_os_decision_outcomes',
    'business_os_decision_lessons',
    'business_os_decision_settings'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON %I', t, t);
    EXECUTE format(
      'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t
    );

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
