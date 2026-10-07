-- BOS-2 Financial Intelligence — vendor-neutral management model
-- Not a general ledger. Monetary amounts are integer minor units (scale, default 2).
-- Tenant + workspace isolated. No journals, invoices, tax, payroll, or bank tables.

CREATE TABLE IF NOT EXISTS business_os_finance_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('draft', 'open', 'closed', 'superseded')),
  source_type text NOT NULL
    CHECK (source_type IN ('xero', 'myob', 'quickbooks', 'csv', 'excel', 'manual', 'api', 'demo')),
  source_ref text,
  source_timestamp timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CHECK (period_end >= period_start),
  UNIQUE (tenant_id, workspace_id, period_start, period_end, currency)
);

CREATE INDEX IF NOT EXISTS idx_bos_finance_periods_scope
  ON business_os_finance_periods (tenant_id, workspace_id, period_end DESC);

CREATE TABLE IF NOT EXISTS business_os_finance_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_id uuid NOT NULL REFERENCES business_os_finance_periods(id) ON DELETE CASCADE,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  revenue_minor bigint,
  cost_of_sales_minor bigint,
  operating_expenses_minor bigint,
  cash_minor bigint,
  accounts_receivable_minor bigint,
  accounts_payable_minor bigint,
  budget_revenue_minor bigint,
  budget_expenses_minor bigint,
  budget_profit_minor bigint,
  source_type text NOT NULL
    CHECK (source_type IN ('xero', 'myob', 'quickbooks', 'csv', 'excel', 'manual', 'api', 'demo')),
  source_ref text,
  source_timestamp timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (period_id)
);

CREATE INDEX IF NOT EXISTS idx_bos_finance_snapshots_scope
  ON business_os_finance_snapshots (tenant_id, workspace_id, synced_at DESC);

CREATE TABLE IF NOT EXISTS business_os_finance_receivable_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  period_id uuid NOT NULL REFERENCES business_os_finance_periods(id) ON DELETE CASCADE,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  outstanding_minor bigint,
  overdue_minor bigint,
  ageing_current_minor bigint,
  ageing_1_30_minor bigint,
  ageing_31_60_minor bigint,
  ageing_61_90_minor bigint,
  ageing_90_plus_minor bigint,
  source_type text NOT NULL
    CHECK (source_type IN ('xero', 'myob', 'quickbooks', 'csv', 'excel', 'manual', 'api', 'demo')),
  source_ref text,
  source_timestamp timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (period_id)
);

CREATE INDEX IF NOT EXISTS idx_bos_finance_receivables_scope
  ON business_os_finance_receivable_snapshots (tenant_id, workspace_id, synced_at DESC);

CREATE TABLE IF NOT EXISTS business_os_finance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  thresholds jsonb NOT NULL DEFAULT '{}'::jsonb,
  forecast_assumptions jsonb NOT NULL DEFAULT '{}'::jsonb,
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
    'business_os_finance_periods',
    'business_os_finance_snapshots',
    'business_os_finance_receivable_snapshots',
    'business_os_finance_settings'
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
