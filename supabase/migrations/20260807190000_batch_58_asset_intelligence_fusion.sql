-- Phase 10I — Multi-source fusion / reconciliation / predictive readiness
-- Additive only; do not rewrite batch_55 / 55b / 56 / 57

CREATE TABLE IF NOT EXISTS asset_intelligence_fusion_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  contributing_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  conflicting_sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  reconciliation_ref text,
  predictive_readiness_ref text,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  fusion_class text NOT NULL,
  method text NOT NULL DEFAULT 'multi_source_fusion_v1',
  method_version text NOT NULL DEFAULT '1',
  confidence numeric,
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_fusion_states(id) ON DELETE SET NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence jsonb,
  trend_confidence jsonb,
  predictive_ml_executed boolean NOT NULL DEFAULT false CHECK (predictive_ml_executed = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  creates_core_risk boolean NOT NULL DEFAULT false CHECK (creates_core_risk = false),
  creates_work_order boolean NOT NULL DEFAULT false CHECK (creates_work_order = false),
  mutates_canonical_lifecycle boolean NOT NULL DEFAULT false
    CHECK (mutates_canonical_lifecycle = false),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_fusion_states_asset
  ON asset_intelligence_fusion_states(tenant_id, workspace_id, asset_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_fusion_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  fusion_state_id uuid REFERENCES asset_intelligence_fusion_states(id) ON DELETE SET NULL,
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

CREATE TABLE IF NOT EXISTS asset_intelligence_reconciliation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  fusion_state_ref text NOT NULL,
  conflicts jsonb NOT NULL DEFAULT '[]'::jsonb,
  method text NOT NULL DEFAULT 'source_reconciliation_v1',
  method_version text NOT NULL DEFAULT '1',
  reconciled_at timestamptz NOT NULL DEFAULT now(),
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  autonomous_resolution_forbidden boolean NOT NULL DEFAULT true
    CHECK (autonomous_resolution_forbidden = true),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_readiness_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  fusion_state_ref text NOT NULL,
  reconciliation_ref text,
  readiness_class text NOT NULL,
  readiness_rationale jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  method text NOT NULL DEFAULT 'predictive_readiness_v1',
  method_version text NOT NULL DEFAULT '1',
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_predictive_readiness_states(id) ON DELETE SET NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  predictive_ml_enabled boolean NOT NULL DEFAULT false CHECK (predictive_ml_enabled = false),
  predictive_methods_certified boolean NOT NULL DEFAULT false
    CHECK (predictive_methods_certified = false),
  predictive_ml_executed boolean NOT NULL DEFAULT false CHECK (predictive_ml_executed = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_pred_ready_asset
  ON asset_intelligence_predictive_readiness_states(tenant_id, workspace_id, asset_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_readiness_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  readiness_state_id uuid REFERENCES asset_intelligence_predictive_readiness_states(id) ON DELETE SET NULL,
  review_instance_id text NOT NULL,
  action text NOT NULL,
  reviewer_id text NOT NULL,
  reason text,
  state_version integer NOT NULL,
  evidence_confidence_ref text,
  content_hash text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE asset_intelligence_fusion_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_fusion_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_reconciliation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_predictive_readiness_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_predictive_readiness_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_fusion_states',
    'asset_intelligence_fusion_reviews',
    'asset_intelligence_reconciliation_records',
    'asset_intelligence_predictive_readiness_states',
    'asset_intelligence_predictive_readiness_reviews'
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

GRANT ALL ON asset_intelligence_fusion_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_fusion_reviews TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_reconciliation_records TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_predictive_readiness_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_predictive_readiness_reviews TO anon, authenticated, service_role;

COMMENT ON TABLE asset_intelligence_fusion_states IS
  'Multi-source fusion — published slices only; no predictive ML execution.';
COMMENT ON TABLE asset_intelligence_reconciliation_records IS
  'Source reconciliation — autonomous resolution forbidden.';
COMMENT ON TABLE asset_intelligence_predictive_readiness_states IS
  'Predictive readiness only — predictive_ml_enabled must remain false in Phase 10I.';
