-- Phase 10H — Risk / Maintenance Recommendation / Priority (additive; do not rewrite 55/55b/56)

CREATE TABLE IF NOT EXISTS asset_intelligence_decision_contexts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  snapshot_id text,
  health_profile_ref text,
  criticality_state_ref text,
  condition_state_ref text,
  reliability_state_ref text,
  failure_state_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  trend_state_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  degradation_state_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  lifecycle_intelligence_ref text,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  available_dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  conflicting_dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  contributing_slices jsonb NOT NULL DEFAULT '[]'::jsonb,
  decision_context_class text NOT NULL,
  method text NOT NULL DEFAULT 'decision_context_compose_v1',
  method_version text NOT NULL DEFAULT '1',
  confidence numeric,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_confidence jsonb,
  trend_confidence jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  autonomous_decision_authority boolean NOT NULL DEFAULT false
    CHECK (autonomous_decision_authority = false),
  creates_core_risk boolean NOT NULL DEFAULT false CHECK (creates_core_risk = false),
  creates_work_order boolean NOT NULL DEFAULT false CHECK (creates_work_order = false),
  calculates_pof boolean NOT NULL DEFAULT false CHECK (calculates_pof = false),
  calculates_rul boolean NOT NULL DEFAULT false CHECK (calculates_rul = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ai_decision_contexts_asset
  ON asset_intelligence_decision_contexts(tenant_id, workspace_id, asset_id, calculated_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_risk_signal_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  risk_signal_class text NOT NULL,
  risk_signal_category text NOT NULL DEFAULT 'advisory_context',
  decision_context_ref text NOT NULL,
  health_context_ref text,
  criticality_context_ref text,
  failure_context_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  degradation_context_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  lifecycle_context_ref text,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  consequence_context text,
  exposure_context text,
  confidence numeric,
  method text NOT NULL,
  method_version text NOT NULL DEFAULT '1',
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_risk_signal_states(id) ON DELETE SET NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence jsonb,
  trend_confidence jsonb,
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  creates_core_risk boolean NOT NULL DEFAULT false CHECK (creates_core_risk = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  mutates_canonical_lifecycle boolean NOT NULL DEFAULT false
    CHECK (mutates_canonical_lifecycle = false),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_risk_signals_asset
  ON asset_intelligence_risk_signal_states(tenant_id, workspace_id, asset_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_risk_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  risk_signal_id uuid REFERENCES asset_intelligence_risk_signal_states(id) ON DELETE SET NULL,
  review_instance_id text NOT NULL,
  action text NOT NULL,
  reviewer_id text NOT NULL,
  reason text,
  state_version integer NOT NULL,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  content_hash text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS asset_intelligence_risk_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  candidate_id text NOT NULL,
  risk_signal_ref text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  consequence_context text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'accepted', 'rejected', 'withdrawn')),
  auto_mutates_core_risk boolean NOT NULL DEFAULT false
    CHECK (auto_mutates_core_risk = false),
  requires_human_gated_adapter boolean NOT NULL DEFAULT true
    CHECK (requires_human_gated_adapter = true),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, candidate_id)
);

CREATE TABLE IF NOT EXISTS asset_intelligence_maintenance_recommendation_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text,
  version text NOT NULL DEFAULT '1',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deprecated', 'superseded')),
  applicable_asset_classes jsonb NOT NULL DEFAULT '["*"]'::jsonb,
  pack_owner text NOT NULL DEFAULT 'engineering_os_shared',
  replacement_code text,
  redefines_shared_semantics boolean NOT NULL DEFAULT false
    CHECK (redefines_shared_semantics = false),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (code, version)
);

CREATE TABLE IF NOT EXISTS asset_intelligence_maintenance_recommendation_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  recommendation_code text NOT NULL,
  recommendation_class text NOT NULL,
  decision_context_ref text NOT NULL,
  risk_signal_ref text,
  rationale jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  urgency_context text,
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  method text NOT NULL,
  method_version text NOT NULL DEFAULT '1',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_maintenance_recommendation_states(id) ON DELETE SET NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence jsonb,
  trend_confidence jsonb,
  creates_work_order boolean NOT NULL DEFAULT false CHECK (creates_work_order = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  calculates_rul boolean NOT NULL DEFAULT false CHECK (calculates_rul = false),
  mutates_canonical_lifecycle boolean NOT NULL DEFAULT false
    CHECK (mutates_canonical_lifecycle = false),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_maint_rec_asset
  ON asset_intelligence_maintenance_recommendation_states(tenant_id, workspace_id, asset_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_maintenance_recommendation_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  recommendation_id uuid REFERENCES asset_intelligence_maintenance_recommendation_states(id) ON DELETE SET NULL,
  review_instance_id text NOT NULL,
  action text NOT NULL,
  reviewer_id text NOT NULL,
  reason text,
  state_version integer NOT NULL,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  content_hash text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS asset_intelligence_priority_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  snapshot_id text,
  health_ref text,
  criticality_ref text,
  risk_signal_ref text,
  failure_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  degradation_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  lifecycle_ref text,
  maintenance_recommendation_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  decision_context_ref text NOT NULL,
  dimension_states jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  conflicting_dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority_class text NOT NULL,
  priority_rationale jsonb NOT NULL DEFAULT '[]'::jsonb,
  priority_confidence numeric,
  method text NOT NULL,
  method_version text NOT NULL DEFAULT '1',
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_priority_profiles(id) ON DELETE SET NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence jsonb,
  trend_confidence jsonb,
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  implies_pof boolean NOT NULL DEFAULT false CHECK (implies_pof = false),
  creates_work_order boolean NOT NULL DEFAULT false CHECK (creates_work_order = false),
  mutates_canonical_lifecycle boolean NOT NULL DEFAULT false
    CHECK (mutates_canonical_lifecycle = false),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_priority_profiles_asset
  ON asset_intelligence_priority_profiles(tenant_id, workspace_id, asset_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_priority_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  priority_profile_id uuid REFERENCES asset_intelligence_priority_profiles(id) ON DELETE SET NULL,
  review_instance_id text NOT NULL,
  action text NOT NULL,
  reviewer_id text NOT NULL,
  reason text,
  state_version integer NOT NULL,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  content_hash text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE asset_intelligence_decision_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_risk_signal_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_risk_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_risk_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_maintenance_recommendation_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_maintenance_recommendation_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_maintenance_recommendation_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_priority_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_priority_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_decision_contexts',
    'asset_intelligence_risk_signal_states',
    'asset_intelligence_risk_reviews',
    'asset_intelligence_risk_candidates',
    'asset_intelligence_maintenance_recommendation_states',
    'asset_intelligence_maintenance_recommendation_reviews',
    'asset_intelligence_priority_profiles',
    'asset_intelligence_priority_reviews'
  ]
  LOOP
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_select', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_insert', t
    );
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
  END LOOP;
END $$;

CREATE POLICY asset_intelligence_maint_rec_taxonomy_select ON asset_intelligence_maintenance_recommendation_taxonomy
  FOR SELECT USING (
    tenant_id IS NULL
    OR (
      tenant_id = ANY(get_user_tenant_ids())
      AND (
        workspace_id IS NULL
        OR workspace_id IN (
          SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY asset_intelligence_maint_rec_taxonomy_insert ON asset_intelligence_maintenance_recommendation_taxonomy
  FOR INSERT WITH CHECK (
    tenant_id IS NULL
    OR (
      tenant_id = ANY(get_user_tenant_ids())
      AND (
        workspace_id IS NULL
        OR workspace_id IN (
          SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY asset_intelligence_maint_rec_taxonomy_update ON asset_intelligence_maintenance_recommendation_taxonomy
  FOR UPDATE USING (
    tenant_id IS NULL
    OR (
      tenant_id = ANY(get_user_tenant_ids())
      AND (
        workspace_id IS NULL
        OR workspace_id IN (
          SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
        )
      )
    )
  );

GRANT ALL ON asset_intelligence_decision_contexts TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_risk_signal_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_risk_reviews TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_risk_candidates TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_maintenance_recommendation_taxonomy TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_maintenance_recommendation_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_maintenance_recommendation_reviews TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_priority_profiles TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_priority_reviews TO anon, authenticated, service_role;

COMMENT ON TABLE asset_intelligence_risk_signal_states IS
  'Advisory Risk Signals — not canonical Engineering Core risk; PoF uncertified.';
COMMENT ON TABLE asset_intelligence_risk_candidates IS
  'Risk Candidates for human-gated Core adapter only; auto_mutates_core_risk = false.';
COMMENT ON TABLE asset_intelligence_maintenance_recommendation_states IS
  'Advisory maintenance recommendations — not CMMS work orders.';
COMMENT ON TABLE asset_intelligence_priority_profiles IS
  'Dimensional priority context — no opaque universal score; not a Health factor.';
