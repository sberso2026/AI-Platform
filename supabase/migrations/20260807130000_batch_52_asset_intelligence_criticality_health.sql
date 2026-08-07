-- Phase 10C — Asset Intelligence criticality + health index hosted persistence
-- Additive only. References canonical engineering_assets; not an asset registry.

CREATE TABLE IF NOT EXISTS asset_intelligence_criticality_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'calculated'
    CHECK (status IN ('observed', 'calculated', 'reviewed', 'published')),
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN ('draft', 'pending_review', 'changes_requested', 'approved', 'rejected')),
  criticality_rating text,
  safety_criticality text,
  production_criticality text,
  environmental_criticality text,
  financial_criticality text,
  operational_criticality text,
  regulatory_criticality text,
  criticality_method text,
  criticality_confidence numeric,
  source_type text NOT NULL DEFAULT 'manual_engineering_assessment',
  source_reference text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_instance_id text,
  reviewed_at timestamptz,
  published_at timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_criticality_states(id) ON DELETE SET NULL,
  criticality_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_criticality_tenant_ws_asset
  ON asset_intelligence_criticality_states(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_health_indexes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'unavailable'
    CHECK (status IN ('unavailable', 'advisory', 'reviewed_advisory')),
  health_index numeric,
  health_class text,
  health_confidence numeric,
  health_trend text,
  health_method text,
  health_source_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  factors_used jsonb NOT NULL DEFAULT '[]'::jsonb,
  composed_by text NOT NULL DEFAULT 'health_composition_engine'
    CHECK (composed_by = 'health_composition_engine'),
  evidence_sufficiency jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  health_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_health_tenant_ws_asset
  ON asset_intelligence_health_indexes(tenant_id, workspace_id, asset_id, recorded_at DESC);

ALTER TABLE asset_intelligence_criticality_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_health_indexes ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_criticality_states',
    'asset_intelligence_health_indexes'
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

GRANT ALL ON asset_intelligence_criticality_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_health_indexes TO anon, authenticated, service_role;

COMMENT ON TABLE asset_intelligence_criticality_states IS
  'Asset Intelligence criticality states. References canonical engineering_assets; not an asset registry.';
COMMENT ON TABLE asset_intelligence_health_indexes IS
  'Health Index states produced by Health Composition Engine. Model storage only; composition lives in application engine.';
