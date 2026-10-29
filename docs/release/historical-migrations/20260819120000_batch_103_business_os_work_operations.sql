-- Batch 103: Business OS BOS-7 Work & Operations
-- Lightweight operational intelligence (work/jobs, milestones, cost/capacity facts).
-- Does not create scheduling, payroll, engineering, inventory, or dispatch systems.
-- Engineering OS remains authoritative: this stores a stable project reference only.

ALTER TABLE public.business_os_profit_facts
  DROP CONSTRAINT IF EXISTS business_os_profit_facts_dimension_type_check;

ALTER TABLE public.business_os_profit_facts
  ADD CONSTRAINT business_os_profit_facts_dimension_type_check
  CHECK (dimension_type IN (
    'customer',
    'project',
    'service',
    'product',
    'segment',
    'business_unit',
    'channel',
    'opportunity',
    'work'
  ));

ALTER TABLE public.business_os_profit_facts
  DROP CONSTRAINT IF EXISTS business_os_profit_facts_attribution_method_check;

ALTER TABLE public.business_os_profit_facts
  ADD CONSTRAINT business_os_profit_facts_attribution_method_check
  CHECK (attribution_method IN (
    'source_direct',
    'customer_fact',
    'imported',
    'manual',
    'derived_from_known_components',
    'operations_fact',
    'unknown'
  ));

CREATE TABLE IF NOT EXISTS business_os_work_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  reference text NOT NULL,
  name text NOT NULL,
  description text,
  work_type text NOT NULL CHECK (work_type IN (
    'customer_job',
    'service_engagement',
    'internal_initiative',
    'business_project',
    'delivery_package'
  )),
  customer_id uuid REFERENCES business_os_customers(id) ON DELETE SET NULL,
  linked_opportunity_id uuid REFERENCES business_os_opportunities(id) ON DELETE SET NULL,
  linked_proposal_id uuid REFERENCES business_os_proposals(id) ON DELETE SET NULL,
  linked_engineering_project_id text,
  linked_engineering_project_ref text,
  owner_label text,
  status text NOT NULL DEFAULT 'planned' CHECK (status IN (
    'planned',
    'ready',
    'active',
    'on_hold',
    'completed',
    'cancelled'
  )),
  planned_start date,
  planned_finish date,
  actual_start date,
  actual_finish date,
  progress_bps integer CHECK (progress_bps IS NULL OR (progress_bps >= 0 AND progress_bps <= 10000)),
  progress_source text NOT NULL DEFAULT 'unknown' CHECK (progress_source IN (
    'user_supplied',
    'weighted_milestones',
    'unknown'
  )),
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  contracted_value_minor bigint,
  budget_cost_minor bigint,
  actual_cost_minor bigint,
  last_status_at timestamptz NOT NULL DEFAULT now(),
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_work_items_scope
  ON business_os_work_items (tenant_id, workspace_id, status, planned_finish);

CREATE INDEX IF NOT EXISTS idx_bos_work_items_customer
  ON business_os_work_items (tenant_id, workspace_id, customer_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_work_items_source_key
  ON business_os_work_items (tenant_id, workspace_id, source_type, source_ref);

CREATE TABLE IF NOT EXISTS business_os_work_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  work_id uuid NOT NULL REFERENCES business_os_work_items(id) ON DELETE CASCADE,
  name text NOT NULL,
  due_at date,
  completed_at date,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN (
    'not_started',
    'in_progress',
    'blocked',
    'completed',
    'cancelled'
  )),
  weight_bps integer CHECK (weight_bps IS NULL OR (weight_bps >= 0 AND weight_bps <= 10000)),
  owner_label text,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_work_milestones_work
  ON business_os_work_milestones (tenant_id, workspace_id, work_id, due_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_work_milestones_source_key
  ON business_os_work_milestones (tenant_id, workspace_id, source_type, source_ref);

CREATE TABLE IF NOT EXISTS business_os_work_action_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  work_id uuid NOT NULL REFERENCES business_os_work_items(id) ON DELETE CASCADE,
  action_id uuid NOT NULL REFERENCES business_os_actions(id) ON DELETE CASCADE,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, work_id, action_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_work_action_links_source_key
  ON business_os_work_action_links (tenant_id, workspace_id, source_type, source_ref);

CREATE TABLE IF NOT EXISTS business_os_work_cost_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  work_id uuid NOT NULL REFERENCES business_os_work_items(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  cost_type text NOT NULL CHECK (cost_type IN (
    'labour',
    'subcontractor',
    'material',
    'travel',
    'equipment',
    'other_direct'
  )),
  amount_minor bigint NOT NULL,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  value_state text NOT NULL CHECK (value_state IN ('actual', 'forecast', 'budget', 'derived')),
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_bos_work_cost_facts_work
  ON business_os_work_cost_facts (tenant_id, workspace_id, work_id, value_state, period_end);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_work_cost_facts_source_key
  ON business_os_work_cost_facts (tenant_id, workspace_id, source_type, source_ref);

CREATE TABLE IF NOT EXISTS business_os_work_capacity_facts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  dimension_type text NOT NULL CHECK (dimension_type IN ('team', 'role', 'work_item', 'period')),
  dimension_ref text NOT NULL,
  dimension_name text NOT NULL,
  work_id uuid REFERENCES business_os_work_items(id) ON DELETE SET NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  available_hours_minor bigint,
  committed_hours_minor bigint,
  utilization_bps integer CHECK (utilization_bps IS NULL OR utilization_bps >= 0),
  capacity_status text NOT NULL DEFAULT 'unknown' CHECK (capacity_status IN (
    'ok',
    'watch',
    'overcommitted',
    'unknown'
  )),
  source_type text NOT NULL,
  source_ref text NOT NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CHECK (period_end >= period_start)
);

CREATE INDEX IF NOT EXISTS idx_bos_work_capacity_facts_scope
  ON business_os_work_capacity_facts (tenant_id, workspace_id, period_end);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_work_capacity_facts_source_key
  ON business_os_work_capacity_facts (tenant_id, workspace_id, source_type, source_ref);

CREATE TABLE IF NOT EXISTS business_os_work_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  thresholds jsonb NOT NULL DEFAULT '{
    "costProgressVarianceBps": 1500,
    "approachingFinishDays": 14,
    "lowProgressBps": 4000,
    "staleDays": 14,
    "overcommitUtilizationBps": 10000
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
    'business_os_work_items',
    'business_os_work_milestones',
    'business_os_work_action_links',
    'business_os_work_cost_facts',
    'business_os_work_capacity_facts',
    'business_os_work_settings'
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
