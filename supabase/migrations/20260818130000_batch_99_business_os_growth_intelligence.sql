-- BOS-3 Growth Intelligence — vendor-neutral lead/opportunity/pipeline model
-- Not a CRM execution system. No outreach, proposals, or external CRM writes.
-- Monetary amounts are integer minor units. Probability is integer basis points (0-10000).

CREATE TABLE IF NOT EXISTS business_os_growth_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  organisation_name text NOT NULL,
  website text,
  domain text,
  industry text,
  geography text,
  company_size_band text,
  services text,
  target_market text,
  contact_name text,
  contact_role text,
  business_email text,
  evidence_of_need boolean,
  relationship_kind text,
  source_type text NOT NULL
    CHECK (source_type IN (
      'manual', 'referral', 'website', 'public_directory', 'public_tender',
      'event', 'campaign', 'csv', 'api', 'demo', 'future_connector'
    )),
  source_ref text,
  source_timestamp timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  enrichment jsonb NOT NULL DEFAULT '{}'::jsonb,
  enrichment_status text NOT NULL DEFAULT 'none'
    CHECK (enrichment_status IN ('none', 'partial', 'complete')),
  qualification_status text NOT NULL DEFAULT 'unqualified'
    CHECK (qualification_status IN ('unqualified', 'researching', 'qualified', 'disqualified', 'converted')),
  score integer,
  score_version text NOT NULL DEFAULT 'lead_score.v1',
  score_detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner text,
  suppressed boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_growth_leads_scope
  ON business_os_growth_leads (tenant_id, workspace_id, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_growth_leads_source_key
  ON business_os_growth_leads (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS business_os_growth_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES business_os_growth_leads(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  stage text NOT NULL DEFAULT 'identified'
    CHECK (stage IN (
      'identified', 'qualified', 'discovery', 'proposal_ready', 'proposal',
      'negotiation', 'won', 'lost', 'on_hold'
    )),
  estimated_value_minor bigint,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  probability_bps integer CHECK (probability_bps IS NULL OR (probability_bps >= 0 AND probability_bps <= 10000)),
  expected_close_date date,
  expected_margin_bps integer CHECK (expected_margin_bps IS NULL OR (expected_margin_bps >= -10000 AND expected_margin_bps <= 10000)),
  source_type text NOT NULL
    CHECK (source_type IN (
      'manual', 'referral', 'website', 'public_directory', 'public_tender',
      'event', 'campaign', 'csv', 'api', 'demo', 'future_connector'
    )),
  source_ref text,
  owner text,
  next_action text,
  strategic_fit text,
  relationship_strength text,
  delivery_capability text,
  commercial_risk text,
  score integer,
  score_version text NOT NULL DEFAULT 'opportunity_score.v1',
  score_detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  suppressed boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_growth_opps_scope
  ON business_os_growth_opportunities (tenant_id, workspace_id, stage, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_growth_opps_source_key
  ON business_os_growth_opportunities (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS business_os_growth_market_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  segment_name text NOT NULL,
  industry text,
  geography text,
  target_customer_profile text,
  attractiveness text NOT NULL DEFAULT 'unknown'
    CHECK (attractiveness IN ('high', 'medium', 'low', 'unknown')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'watch', 'inactive')),
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_type text NOT NULL
    CHECK (source_type IN (
      'manual', 'referral', 'website', 'public_directory', 'public_tender',
      'event', 'campaign', 'csv', 'api', 'demo', 'future_connector'
    )),
  source_ref text,
  source_timestamp timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  suppressed boolean NOT NULL DEFAULT false,
  deleted_at timestamptz,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_growth_market_scope
  ON business_os_growth_market_segments (tenant_id, workspace_id, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_growth_market_source_key
  ON business_os_growth_market_segments (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL AND deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS business_os_growth_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  target_profile jsonb NOT NULL DEFAULT '{}'::jsonb,
  revenue_target_minor bigint,
  revenue_target_currency char(3),
  revenue_target_scale smallint NOT NULL DEFAULT 2 CHECK (revenue_target_scale >= 0 AND revenue_target_scale <= 6),
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
    'business_os_growth_leads',
    'business_os_growth_opportunities',
    'business_os_growth_market_segments',
    'business_os_growth_settings'
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
