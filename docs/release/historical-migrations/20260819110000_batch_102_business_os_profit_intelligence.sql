-- BOS-6 Profit Intelligence — bounded profit facts, not a ledger or cost-accounting subsystem.
-- Monetary amounts are integer minor units. Allocated cost is never invented.

CREATE TABLE IF NOT EXISTS business_os_profit_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  dimension_type text NOT NULL
    CHECK (dimension_type IN ('customer', 'project', 'service', 'product', 'segment', 'business_unit', 'channel', 'opportunity')),
  dimension_id uuid,
  dimension_ref text,
  dimension_name text NOT NULL,
  revenue_minor bigint,
  direct_cost_minor bigint,
  allocated_cost_minor bigint,
  contribution_minor bigint,
  profit_after_allocated_minor bigint,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  value_state text NOT NULL DEFAULT 'actual'
    CHECK (value_state IN ('actual', 'forecast', 'proposed', 'budget', 'derived')),
  attribution_method text NOT NULL DEFAULT 'unknown'
    CHECK (attribution_method IN ('source_direct', 'customer_fact', 'imported', 'manual', 'derived_from_known_components', 'unknown')),
  attribution_confidence text NOT NULL DEFAULT 'unknown'
    CHECK (attribution_confidence IN ('high', 'medium', 'low', 'unknown')),
  source_type text NOT NULL,
  source_ref text,
  source_timestamp timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_bos_profit_facts_scope
  ON business_os_profit_facts (tenant_id, workspace_id, period_end DESC, dimension_type);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_profit_facts_source_key
  ON business_os_profit_facts (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_os_profit_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  thresholds jsonb NOT NULL DEFAULT '{}'::jsonb,
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
    'business_os_profit_facts',
    'business_os_profit_settings'
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
