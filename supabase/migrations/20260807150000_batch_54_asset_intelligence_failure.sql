-- Phase 10E — Asset Failure Intelligence persistence (additive)
-- Concepts remain distinct: mode / mechanism / cause / effect / consequence / detection / mitigation.
-- Advisory only. probabilityOfFailureCertified = false. Root cause requires governed human approval.

CREATE TABLE IF NOT EXISTS asset_intelligence_failure_modes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  taxonomy_version text NOT NULL,
  failure_mode_code text NOT NULL,
  failure_mode_label text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  assessment_type text NOT NULL DEFAULT 'qualitative'
    CHECK (assessment_type IN ('qualitative', 'semi_quantitative')),
  confidence numeric,
  method text,
  evidence_confidence_ref text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  detection_method_code text,
  review_instance_id text,
  source_type text NOT NULL DEFAULT 'manual_engineering_assessment',
  detected_at timestamptz,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_failure_modes(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_failure_modes_asset
  ON asset_intelligence_failure_modes(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_failure_mechanisms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  taxonomy_version text NOT NULL,
  mechanism_code text NOT NULL,
  mechanism_label text NOT NULL,
  mechanism_category text,
  related_failure_mode_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  method text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence_ref text,
  source_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  source_type text NOT NULL DEFAULT 'manual_engineering_assessment',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_failure_mechanisms(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_failure_mechanisms_asset
  ON asset_intelligence_failure_mechanisms(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_failure_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  taxonomy_version text NOT NULL,
  relationship_type text NOT NULL
    CHECK (relationship_type IN (
      'mode_has_mechanism', 'mode_has_cause', 'mode_has_effect',
      'mode_has_consequence', 'mechanism_has_cause'
    )),
  from_kind text NOT NULL,
  from_code text NOT NULL,
  to_kind text NOT NULL,
  to_code text NOT NULL,
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ai_failure_relationships_asset
  ON asset_intelligence_failure_relationships(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_failure_causes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  taxonomy_version text NOT NULL,
  cause_code text NOT NULL,
  cause_label text NOT NULL,
  classification text NOT NULL DEFAULT 'suspectedCause'
    CHECK (classification IN ('suspectedCause', 'contributingCause', 'confirmedCause', 'rootCause')),
  related_failure_mode_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_mechanism_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  confidence numeric,
  method text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence_ref text,
  alternative_causes jsonb NOT NULL DEFAULT '[]'::jsonb,
  root_cause_confidence numeric,
  root_cause_method text,
  supporting_evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  source_type text NOT NULL DEFAULT 'manual_engineering_assessment',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_failure_causes(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Root cause requires governed human approval; AI must never auto-certify.
  CHECK (NOT (classification = 'rootCause' AND reviewed_at IS NULL))
);

CREATE INDEX IF NOT EXISTS idx_ai_failure_causes_asset
  ON asset_intelligence_failure_causes(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_failure_effects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  taxonomy_version text NOT NULL,
  effect_code text NOT NULL,
  effect_label text NOT NULL,
  effect_kind text NOT NULL DEFAULT 'localEffect'
    CHECK (effect_kind IN ('localEffect', 'systemEffect', 'functionalEffect', 'operationalEffect')),
  related_failure_mode_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  source_type text NOT NULL DEFAULT 'manual_engineering_assessment',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ai_failure_effects_asset
  ON asset_intelligence_failure_effects(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_failure_consequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  taxonomy_version text NOT NULL,
  consequence_code text NOT NULL,
  consequence_label text NOT NULL,
  dimensions jsonb NOT NULL DEFAULT '[]'::jsonb,
  related_failure_mode_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  -- Signal only — never a canonical Engineering Core risk record.
  creates_canonical_risk_record boolean NOT NULL DEFAULT false
    CHECK (creates_canonical_risk_record = false),
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  source_type text NOT NULL DEFAULT 'manual_engineering_assessment',
  assessed_at timestamptz NOT NULL DEFAULT now(),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ai_failure_consequences_asset
  ON asset_intelligence_failure_consequences(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_failure_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  failure_mode_id uuid NOT NULL REFERENCES asset_intelligence_failure_modes(id) ON DELETE CASCADE,
  review_instance_id text,
  action text NOT NULL
    CHECK (action IN ('submit', 'approve', 'reject', 'request_changes', 'resubmit')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  state_version integer NOT NULL,
  taxonomy_version text NOT NULL,
  evidence_confidence jsonb,
  content_hash text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_failure_reviews_mode
  ON asset_intelligence_failure_reviews(tenant_id, workspace_id, failure_mode_id, created_at DESC);

-- Shared + pack-extensible taxonomy registry. Not industry-hardcoded; not tenant-scoped
-- (registry entries are shared reference data — packs register versioned extensions).
CREATE TABLE IF NOT EXISTS asset_intelligence_failure_taxonomy (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  taxonomy_id text NOT NULL,
  taxonomy_version text NOT NULL,
  kind text NOT NULL
    CHECK (kind IN (
      'failure_mode', 'failure_mechanism', 'failure_cause', 'failure_effect',
      'consequence', 'detection_method', 'mitigation'
    )),
  code text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  category text,
  parent_code text,
  applicable_asset_classes jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_standard text,
  pack_owner text NOT NULL DEFAULT 'engineering_os_shared',
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'deprecated', 'superseded')),
  effective_from timestamptz NOT NULL DEFAULT now(),
  deprecated_at timestamptz,
  replacement_code text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, code, taxonomy_version)
);

CREATE INDEX IF NOT EXISTS idx_ai_failure_taxonomy_kind
  ON asset_intelligence_failure_taxonomy(kind, pack_owner);

ALTER TABLE asset_intelligence_failure_modes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_failure_mechanisms ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_failure_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_failure_causes ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_failure_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_failure_consequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_failure_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_failure_taxonomy ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_failure_modes',
    'asset_intelligence_failure_mechanisms',
    'asset_intelligence_failure_relationships',
    'asset_intelligence_failure_causes',
    'asset_intelligence_failure_effects',
    'asset_intelligence_failure_consequences',
    'asset_intelligence_failure_reviews'
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

-- Taxonomy registry has no tenant/workspace columns — shared reference data,
-- readable by all authenticated tenants; writes are pack-registration operations.
CREATE POLICY asset_intelligence_failure_taxonomy_select ON asset_intelligence_failure_taxonomy
  FOR SELECT USING (true);
CREATE POLICY asset_intelligence_failure_taxonomy_insert ON asset_intelligence_failure_taxonomy
  FOR INSERT WITH CHECK (true);
CREATE POLICY asset_intelligence_failure_taxonomy_update ON asset_intelligence_failure_taxonomy
  FOR UPDATE USING (true) WITH CHECK (true);

GRANT ALL ON asset_intelligence_failure_modes TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_failure_mechanisms TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_failure_relationships TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_failure_causes TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_failure_effects TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_failure_consequences TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_failure_reviews TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_failure_taxonomy TO anon, authenticated, service_role;

COMMENT ON TABLE asset_intelligence_failure_modes IS
  'Asset Intelligence failure modes. Advisory only; probabilityOfFailureCertified must remain false.';
COMMENT ON TABLE asset_intelligence_failure_causes IS
  'Asset Intelligence failure causes. Root cause classification requires governed human approval.';
COMMENT ON TABLE asset_intelligence_failure_consequences IS
  'Asset Intelligence failure consequences. Signal only — not a canonical Engineering Core risk record.';
COMMENT ON TABLE asset_intelligence_failure_taxonomy IS
  'Shared + pack-extensible failure taxonomy registry. Not industry-hardcoded.';
