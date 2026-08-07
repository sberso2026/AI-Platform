-- Phase 10G — Lifecycle Intelligence (additive; do not rewrite batch_55 / batch_55b)

CREATE TABLE IF NOT EXISTS asset_intelligence_lifecycle_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  canonical_lifecycle_stage text NOT NULL,
  canonical_lifecycle_version integer NOT NULL DEFAULT 1,
  canonical_lifecycle_effective_at timestamptz,
  canonical_source_owner text NOT NULL DEFAULT 'engineering_os_shared_domain'
    CHECK (canonical_source_owner = 'engineering_os_shared_domain'),
  lifecycle_context_class text NOT NULL,
  lifecycle_context_code text NOT NULL,
  lifecycle_context_rationale jsonb NOT NULL DEFAULT '[]'::jsonb,
  operating_state text,
  maintenance_state text,
  condition_state_ref text,
  reliability_state_ref text,
  failure_state_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  trend_state_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  degradation_state_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  contributing_slices jsonb NOT NULL DEFAULT '[]'::jsonb,
  missing_slices jsonb NOT NULL DEFAULT '[]'::jsonb,
  conflicting_slices jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  confidence numeric,
  method text NOT NULL,
  method_version text NOT NULL DEFAULT '1',
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_lifecycle_states(id) ON DELETE SET NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  service_age_context jsonb,
  evidence_confidence jsonb,
  trend_confidence jsonb,
  mutates_canonical_lifecycle boolean NOT NULL DEFAULT false
    CHECK (mutates_canonical_lifecycle = false),
  is_health_factor boolean NOT NULL DEFAULT false
    CHECK (is_health_factor = false),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_lifecycle_states_asset
  ON asset_intelligence_lifecycle_states(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_lifecycle_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  lifecycle_state_id uuid REFERENCES asset_intelligence_lifecycle_states(id) ON DELETE SET NULL,
  review_instance_id text NOT NULL,
  action text NOT NULL,
  reviewer_id text NOT NULL,
  reason text,
  state_version integer NOT NULL,
  canonical_lifecycle_version integer,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  content_hash text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS asset_intelligence_lifecycle_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy_id text NOT NULL,
  taxonomy_version text NOT NULL,
  kind text NOT NULL,
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  category text,
  applicable_asset_classes jsonb NOT NULL DEFAULT '["*"]'::jsonb,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deprecated', 'superseded')),
  source_standard text,
  pack_owner text NOT NULL DEFAULT 'engineering_os_shared',
  effective_from timestamptz NOT NULL DEFAULT now(),
  deprecated_at timestamptz,
  replacement_code text,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, code, taxonomy_version)
);

CREATE TABLE IF NOT EXISTS asset_intelligence_lifecycle_transition_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  lifecycle_state_id uuid REFERENCES asset_intelligence_lifecycle_states(id) ON DELETE SET NULL,
  code text NOT NULL,
  label text NOT NULL,
  rationale jsonb NOT NULL DEFAULT '[]'::jsonb,
  recommended_review text,
  status text NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'accepted', 'rejected', 'withdrawn')),
  mutates_canonical_lifecycle boolean NOT NULL DEFAULT false
    CHECK (mutates_canonical_lifecycle = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  decided_by text,
  decision_reason text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE asset_intelligence_lifecycle_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_lifecycle_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_lifecycle_taxonomy ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_lifecycle_transition_candidates ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_lifecycle_states',
    'asset_intelligence_lifecycle_reviews',
    'asset_intelligence_lifecycle_transition_candidates'
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

CREATE POLICY asset_intelligence_lifecycle_taxonomy_select ON asset_intelligence_lifecycle_taxonomy
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

CREATE POLICY asset_intelligence_lifecycle_taxonomy_insert ON asset_intelligence_lifecycle_taxonomy
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

CREATE POLICY asset_intelligence_lifecycle_taxonomy_update ON asset_intelligence_lifecycle_taxonomy
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

GRANT ALL ON asset_intelligence_lifecycle_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_lifecycle_reviews TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_lifecycle_taxonomy TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_lifecycle_transition_candidates TO anon, authenticated, service_role;

COMMENT ON TABLE asset_intelligence_lifecycle_states IS
  'Asset Lifecycle Intelligence — advisory; cannot mutate canonical Shared Domain lifecycle.';
COMMENT ON TABLE asset_intelligence_lifecycle_transition_candidates IS
  'Lifecycle transition candidates only; mutates_canonical_lifecycle must remain false.';
