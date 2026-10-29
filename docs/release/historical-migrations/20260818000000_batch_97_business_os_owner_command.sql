-- BOS-1 Owner Command Centre — shared management primitives
-- KPI → Signal → Recommendation → Decision → Action
-- Tenant + workspace isolated. No finance/CRM/lead/invoice/ledger tables.
-- Demo rows are marked is_demo; they are not live business feeds.

CREATE TABLE IF NOT EXISTS business_os_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general'
    CHECK (category IN (
      'revenue', 'cash', 'margin', 'receivables', 'pipeline', 'operations', 'general'
    )),
  unit text NOT NULL DEFAULT 'count',
  value numeric,
  target numeric,
  warning_threshold numeric,
  critical_threshold numeric,
  direction text NOT NULL DEFAULT 'higher_is_better'
    CHECK (direction IN ('higher_is_better', 'lower_is_better')),
  status text NOT NULL DEFAULT 'unknown'
    CHECK (status IN ('healthy', 'watch', 'warning', 'critical', 'unknown')),
  measured_at timestamptz,
  source_type text NOT NULL DEFAULT 'manual'
    CHECK (source_type IN ('manual', 'demo', 'derived', 'import')),
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, key)
);

CREATE INDEX IF NOT EXISTS idx_bos_kpis_scope_status
  ON business_os_kpis (tenant_id, workspace_id, status, measured_at DESC);
CREATE INDEX IF NOT EXISTS idx_bos_kpis_category
  ON business_os_kpis (tenant_id, workspace_id, category);

CREATE TABLE IF NOT EXISTS business_os_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity text NOT NULL
    CHECK (severity IN ('info', 'watch', 'warning', 'critical')),
  title text NOT NULL,
  summary text NOT NULL,
  source_type text NOT NULL DEFAULT 'kpi'
    CHECK (source_type IN ('kpi', 'manual', 'demo', 'derived')),
  source_ref text,
  kpi_id uuid REFERENCES business_os_kpis(id) ON DELETE SET NULL,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  detected_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'acknowledged', 'resolved', 'dismissed')),
  business_impact text
    CHECK (business_impact IS NULL OR business_impact IN ('low', 'medium', 'high', 'critical')),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_signals_attention
  ON business_os_signals (tenant_id, workspace_id, status, severity, detected_at DESC);

CREATE TABLE IF NOT EXISTS business_os_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  signal_id uuid REFERENCES business_os_signals(id) ON DELETE SET NULL,
  title text NOT NULL,
  recommendation_text text NOT NULL,
  rationale_summary text NOT NULL,
  expected_impact text,
  confidence text NOT NULL DEFAULT 'medium'
    CHECK (confidence IN ('high', 'medium', 'low', 'unavailable')),
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'accepted', 'rejected', 'superseded')),
  generated_by text NOT NULL DEFAULT 'deterministic_rule'
    CHECK (generated_by IN ('deterministic_rule', 'platform_ai_director', 'user')),
  advisory_only boolean NOT NULL DEFAULT true
    CONSTRAINT bos_rec_advisory_only CHECK (advisory_only = true),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_recommendations_scope
  ON business_os_recommendations (tenant_id, workspace_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS business_os_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  recommendation_id uuid REFERENCES business_os_recommendations(id) ON DELETE SET NULL,
  statement text NOT NULL,
  context text,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'deferred', 'closed')),
  decision text
    CHECK (decision IS NULL OR decision IN ('approve', 'reject', 'defer', 'close')),
  rationale text,
  decided_at timestamptz,
  review_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_decisions_scope
  ON business_os_decisions (tenant_id, workspace_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS business_os_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  decision_id uuid REFERENCES business_os_decisions(id) ON DELETE SET NULL,
  title text NOT NULL,
  owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  due_date date,
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_progress', 'blocked', 'completed', 'cancelled')),
  completion_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_actions_scope
  ON business_os_actions (tenant_id, workspace_id, status, due_date);
CREATE INDEX IF NOT EXISTS idx_bos_actions_due
  ON business_os_actions (tenant_id, workspace_id, due_date)
  WHERE status IN ('open', 'in_progress', 'blocked');

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'business_os_kpis',
    'business_os_signals',
    'business_os_recommendations',
    'business_os_decisions',
    'business_os_actions'
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
