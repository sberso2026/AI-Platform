-- BOS-4 Revenue Execution — supervised commercial preparation
-- Not a send/submit system. No external outreach, proposal submission, CRM writes, or payments.
-- Monetary amounts are integer minor units. Guardrail rates are integer basis points.

CREATE TABLE IF NOT EXISTS business_os_revenue_engagement_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES business_os_growth_opportunities(id) ON DELETE CASCADE,
  objective text NOT NULL,
  stakeholder_summary text,
  value_proposition text,
  key_needs text,
  proposed_approach text,
  next_action text,
  owner text,
  due_at timestamptz,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ready_for_review', 'approved', 'active', 'completed', 'cancelled')),
  source_type text NOT NULL,
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_revenue_engagement_scope
  ON business_os_revenue_engagement_plans (tenant_id, workspace_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_revenue_engagement_source_key
  ON business_os_revenue_engagement_plans (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_os_revenue_communication_drafts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES business_os_growth_opportunities(id) ON DELETE CASCADE,
  engagement_plan_id uuid REFERENCES business_os_revenue_engagement_plans(id) ON DELETE SET NULL,
  type text NOT NULL
    CHECK (type IN ('email', 'follow_up', 'meeting_request', 'call_brief', 'internal_note')),
  recipient_context text,
  subject text NOT NULL,
  body text NOT NULL,
  purpose text NOT NULL,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_by text NOT NULL DEFAULT 'user'
    CHECK (generated_by IN ('user', 'deterministic_rule', 'platform_ai_director')),
  approval_status text NOT NULL DEFAULT 'draft'
    CHECK (approval_status IN ('draft', 'pending_review', 'approved', 'rejected', 'superseded')),
  source_type text NOT NULL,
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_revenue_drafts_scope
  ON business_os_revenue_communication_drafts (tenant_id, workspace_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_revenue_drafts_source_key
  ON business_os_revenue_communication_drafts (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_os_revenue_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES business_os_growth_opportunities(id) ON DELETE CASCADE,
  proposal_number text NOT NULL,
  title text NOT NULL,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'internal_review', 'pricing_review', 'approval_required',
      'approved', 'ready_to_send', 'superseded', 'withdrawn'
    )),
  scope_summary text,
  customer_requirements text,
  assumptions text,
  exclusions text,
  deliverables text,
  commercial_terms_summary text,
  proposed_price_minor bigint,
  estimated_cost_minor bigint,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  target_margin_bps integer CHECK (target_margin_bps IS NULL OR (target_margin_bps >= -10000 AND target_margin_bps <= 10000)),
  owner text,
  approval_decision_id uuid REFERENCES business_os_decisions(id) ON DELETE SET NULL,
  source_type text NOT NULL,
  source_ref text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_revenue_proposals_scope
  ON business_os_revenue_proposals (tenant_id, workspace_id, status, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_revenue_proposals_source_key
  ON business_os_revenue_proposals (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_revenue_proposals_number_version
  ON business_os_revenue_proposals (tenant_id, workspace_id, proposal_number, version);

CREATE TABLE IF NOT EXISTS business_os_revenue_proposal_requirements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  proposal_id uuid NOT NULL REFERENCES business_os_revenue_proposals(id) ON DELETE CASCADE,
  requirement text NOT NULL,
  source_reference text,
  mandatory boolean NOT NULL DEFAULT true,
  response text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'drafted', 'reviewed', 'closed')),
  compliance_status text NOT NULL DEFAULT 'unknown'
    CHECK (compliance_status IN ('satisfied', 'partially_satisfied', 'unsatisfied', 'unknown', 'not_applicable')),
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  generated_by text NOT NULL DEFAULT 'user'
    CHECK (generated_by IN ('user', 'deterministic_rule', 'platform_ai_director')),
  source_type text NOT NULL,
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  CONSTRAINT bos_revenue_requirement_satisfied_needs_evidence CHECK (
    compliance_status <> 'satisfied'
    OR jsonb_typeof(evidence_refs) = 'array' AND jsonb_array_length(evidence_refs) > 0
  )
);

CREATE INDEX IF NOT EXISTS idx_bos_revenue_requirements_scope
  ON business_os_revenue_proposal_requirements (tenant_id, workspace_id, proposal_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_revenue_requirements_source_key
  ON business_os_revenue_proposal_requirements (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_os_revenue_pricing_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES business_os_growth_opportunities(id) ON DELETE CASCADE,
  proposal_id uuid REFERENCES business_os_revenue_proposals(id) ON DELETE SET NULL,
  scenario_name text NOT NULL,
  assumptions text,
  revenue_minor bigint,
  estimated_direct_cost_minor bigint,
  allocated_cost_minor bigint,
  discount_bps integer CHECK (discount_bps IS NULL OR (discount_bps >= 0 AND discount_bps <= 10000)),
  risk_allowance_minor bigint,
  gross_profit_minor bigint,
  gross_margin_bps integer,
  currency char(3) NOT NULL,
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  exception_decision_id uuid REFERENCES business_os_decisions(id) ON DELETE SET NULL,
  source_type text NOT NULL,
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_revenue_pricing_scope
  ON business_os_revenue_pricing_scenarios (tenant_id, workspace_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_revenue_pricing_source_key
  ON business_os_revenue_pricing_scenarios (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_os_revenue_bid_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  opportunity_id uuid NOT NULL REFERENCES business_os_growth_opportunities(id) ON DELETE CASCADE,
  recommendation text NOT NULL
    CHECK (recommendation IN ('pursue', 'pursue_with_conditions', 'review', 'do_not_pursue', 'insufficient_evidence')),
  components jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_inputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  version text NOT NULL DEFAULT 'bid_nobid.v1',
  decision_id uuid REFERENCES business_os_decisions(id) ON DELETE SET NULL,
  source_type text NOT NULL,
  source_ref text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  disclaimer text NOT NULL DEFAULT 'Advisory only. Not a statistical win probability. Final bid/no-bid is a human decision.',
  is_demo boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_bos_revenue_bid_scope
  ON business_os_revenue_bid_evaluations (tenant_id, workspace_id, updated_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_bos_revenue_bid_source_key
  ON business_os_revenue_bid_evaluations (tenant_id, workspace_id, source_type, source_ref)
  WHERE source_ref IS NOT NULL;

CREATE TABLE IF NOT EXISTS business_os_revenue_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  min_target_margin_bps integer NOT NULL DEFAULT 2000,
  max_discount_bps_without_approval integer NOT NULL DEFAULT 1000,
  min_absolute_contribution_minor bigint NOT NULL DEFAULT 0,
  currency char(3),
  scale smallint NOT NULL DEFAULT 2 CHECK (scale >= 0 AND scale <= 6),
  guardrail_version text NOT NULL DEFAULT 'pricing_guardrail.v1',
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
    'business_os_revenue_engagement_plans',
    'business_os_revenue_communication_drafts',
    'business_os_revenue_proposals',
    'business_os_revenue_proposal_requirements',
    'business_os_revenue_pricing_scenarios',
    'business_os_revenue_bid_evaluations',
    'business_os_revenue_settings'
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
