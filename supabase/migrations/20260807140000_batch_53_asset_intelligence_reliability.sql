-- Phase 10D — Reliability, Evidence Confidence, Health Profiles (additive)

CREATE TABLE IF NOT EXISTS asset_intelligence_reliability_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'calculated'
    CHECK (status IN ('observed', 'calculated', 'reviewed', 'published')),
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  assessment_type text NOT NULL DEFAULT 'qualitative'
    CHECK (assessment_type IN ('qualitative', 'semi_quantitative', 'quantitative')),
  reliability_class text,
  reliability_score numeric,
  reliability_confidence numeric,
  reliability_method text,
  evidence_window text,
  operating_window text,
  source_type text NOT NULL DEFAULT 'manual_engineering_assessment',
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_instance_id text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_reliability_states(id) ON DELETE SET NULL,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  metrics jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence jsonb,
  reliability_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_reliability_tenant_ws_asset
  ON asset_intelligence_reliability_states(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_evidence_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  scope text NOT NULL DEFAULT 'asset_intelligence',
  score numeric NOT NULL,
  confidence_class text NOT NULL,
  confidence numeric NOT NULL,
  source_count integer NOT NULL DEFAULT 0,
  source_diversity numeric NOT NULL DEFAULT 0,
  freshness numeric NOT NULL DEFAULT 0,
  review_completeness numeric NOT NULL DEFAULT 0,
  conflict_state text NOT NULL DEFAULT 'none',
  lineage_integrity text NOT NULL DEFAULT 'unknown',
  data_sufficiency text NOT NULL,
  abstention_reason text,
  method text NOT NULL DEFAULT 'evidence_confidence_v1',
  method_version text NOT NULL DEFAULT '1',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_evidence_conf_asset
  ON asset_intelligence_evidence_confidence(tenant_id, workspace_id, asset_id, assessed_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_health_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  snapshot_id text,
  composition_method text NOT NULL,
  composition_version text NOT NULL,
  condition_state_ref text,
  condition_contribution numeric,
  reliability_state_ref text,
  reliability_contribution numeric,
  reliability_unavailable boolean NOT NULL DEFAULT false,
  evidence_confidence_ref text,
  overall_health numeric,
  overall_health_class text,
  overall_health_confidence numeric,
  criticality_state_ref text,
  criticality_context jsonb,
  criticality_is_health_factor boolean NOT NULL DEFAULT false
    CHECK (criticality_is_health_factor = false),
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'calculated',
  calculated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  evidence_confidence jsonb,
  profile_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_health_profiles_asset
  ON asset_intelligence_health_profiles(tenant_id, workspace_id, asset_id, calculated_at DESC);

ALTER TABLE asset_intelligence_reliability_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_evidence_confidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_health_profiles ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_reliability_states',
    'asset_intelligence_evidence_confidence',
    'asset_intelligence_health_profiles'
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

GRANT ALL ON asset_intelligence_reliability_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_evidence_confidence TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_health_profiles TO anon, authenticated, service_role;

COMMENT ON TABLE asset_intelligence_reliability_states IS
  'Asset Intelligence reliability states. Criticality is not a physical-health factor.';
COMMENT ON TABLE asset_intelligence_health_profiles IS
  'Dimensional health profiles from HealthCompositionEngine; criticality_is_health_factor must remain false.';
