-- BOS-5 Customer Intelligence — vendor-neutral Customer 360
-- Not a CRM replacement. No outreach, marketing automation, credit scoring, or external CRM writes.
-- Monetary amounts are integer minor units. Health is deterministic and versioned.

CREATE TABLE IF NOT EXISTS business_os_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  organisation_name text NOT NULL,
  trading_name text,
  external_ids jsonb NOT NULL DEFAULT '{}'::jsonb,
  website text,
  domain text,
  industry text,
  geography text,
  customer_status text NOT NULL DEFAULT 'active'
    CHECK (customer_status IN ('prospect_converted', 'active', 'inactive', 'at_risk', 'former', 'archived')),
  relationship_owner text,
  acquired_at date,
  source_type text NOT NULL,
  source_ref text,
  source_timestamp timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_customers_scope
  ON business_os_customers (tenant_id, workspace_id, updated_at DESC)
  WHERE archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_customers_source_key
  ON business_os_customers (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL AND archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_customers_domain_key
  ON business_os_customers (tenant_id, workspace_id, lower(domain))
  WHERE domain IS NOT NULL AND archived_at IS NULL;

CREATE TABLE IF NOT EXISTS business_os_customer_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES business_os_customers(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  business_email text,
  business_phone text,
  relationship_type text,
  is_primary boolean NOT NULL DEFAULT false,
  suppressed boolean NOT NULL DEFAULT false,
  source_type text NOT NULL,
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_customer_contacts_scope
  ON business_os_customer_contacts (tenant_id, workspace_id, customer_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_customer_contacts_source_key
  ON business_os_customer_contacts (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_os_customer_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES business_os_customers(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('lead', 'opportunity')),
  entity_id uuid NOT NULL,
  source_type text NOT NULL,
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_customer_links_entity
  ON business_os_customer_links (tenant_id, workspace_id, entity_type, entity_id);

CREATE INDEX IF NOT EXISTS idx_bos_customer_links_customer
  ON business_os_customer_links (tenant_id, workspace_id, customer_id);

CREATE TABLE IF NOT EXISTS business_os_customer_financial_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES business_os_customers(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  revenue_minor bigint,
  direct_cost_minor bigint,
  gross_contribution_minor bigint,
  receivable_outstanding_minor bigint,
  receivable_overdue_minor bigint,
  ageing_current_minor bigint,
  ageing_130_minor bigint,
  ageing_3160_minor bigint,
  ageing_6190_minor bigint,
  ageing_90plus_minor bigint,
  due_date date,
  paid_date date,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  source_type text NOT NULL,
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_bos_customer_facts_scope
  ON business_os_customer_financial_facts (tenant_id, workspace_id, customer_id, period_end DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_customer_facts_source_key
  ON business_os_customer_financial_facts (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_os_customer_settings (
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
    'business_os_customers',
    'business_os_customer_contacts',
    'business_os_customer_links',
    'business_os_customer_financial_facts',
    'business_os_customer_settings'
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
