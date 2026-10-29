-- Phase 10F — Asset Intelligence Time Series / Trend / Degradation persistence (additive)
-- Heuristic only. Not predictive ML. Not PoF. Not RUL. Advisory until governed review/publish.

CREATE TABLE IF NOT EXISTS asset_intelligence_time_series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  attribute_key text NOT NULL,
  attribute_label text,
  unit text NOT NULL,
  orientation text NOT NULL DEFAULT 'increasing_worse'
    CHECK (orientation IN ('increasing_worse', 'decreasing_worse', 'neutral')),
  points jsonb NOT NULL DEFAULT '[]'::jsonb,
  window_start timestamptz,
  window_end timestamptz,
  sampling_hint text,
  source_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'ingested'
    CHECK (status IN (
      'draft', 'ingested', 'pending_review', 'approved',
      'published', 'superseded', 'archived'
    )),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Not an SHM runtime or sensor registry.
  is_sensor_registry boolean NOT NULL DEFAULT false CHECK (is_sensor_registry = false),
  is_shm_runtime boolean NOT NULL DEFAULT false CHECK (is_shm_runtime = false),
  UNIQUE (tenant_id, workspace_id, asset_id, attribute_key, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_time_series_asset
  ON asset_intelligence_time_series(tenant_id, workspace_id, asset_id, attribute_key, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_change_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  series_id uuid REFERENCES asset_intelligence_time_series(id) ON DELETE SET NULL,
  signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  method text NOT NULL DEFAULT 'change_detection_heuristic_v1',
  trend_confidence_ref uuid,
  abstained boolean NOT NULL DEFAULT false,
  abstention_reason text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Rule-based / heuristic only.
  predictive_ml_used boolean NOT NULL DEFAULT false CHECK (predictive_ml_used = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false)
);

CREATE INDEX IF NOT EXISTS idx_ai_change_detections_asset
  ON asset_intelligence_change_detections(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_trend_confidence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  series_id uuid REFERENCES asset_intelligence_time_series(id) ON DELETE SET NULL,
  scope text NOT NULL DEFAULT 'trend_intelligence'
    CHECK (scope IN ('trend_intelligence', 'degradation_analysis', 'change_detection')),
  score numeric NOT NULL,
  confidence_class text NOT NULL
    CHECK (confidence_class IN ('high', 'moderate', 'low', 'abstain')),
  point_count integer NOT NULL DEFAULT 0,
  window_coverage numeric,
  freshness numeric,
  source_diversity numeric,
  conflict_state text NOT NULL DEFAULT 'none'
    CHECK (conflict_state IN ('none', 'minor', 'major')),
  data_sufficiency text NOT NULL
    CHECK (data_sufficiency IN ('sufficient', 'limited', 'insufficient', 'conflicting', 'stale', 'revoked')),
  abstention_reason text,
  method text NOT NULL DEFAULT 'trend_confidence_v1',
  method_version text NOT NULL DEFAULT '1',
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  predictive_ml_used boolean NOT NULL DEFAULT false CHECK (predictive_ml_used = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false)
);

ALTER TABLE asset_intelligence_change_detections
  ADD CONSTRAINT fk_ai_change_detections_trend_confidence
  FOREIGN KEY (trend_confidence_ref) REFERENCES asset_intelligence_trend_confidence(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_ai_trend_confidence_asset
  ON asset_intelligence_trend_confidence(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_trend_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  series_id uuid REFERENCES asset_intelligence_time_series(id) ON DELETE SET NULL,
  attribute_key text NOT NULL,
  trend_direction text NOT NULL DEFAULT 'indeterminate'
    CHECK (trend_direction IN ('improving', 'stable', 'degrading', 'indeterminate')),
  trend_class text NOT NULL DEFAULT 'qualitative'
    CHECK (trend_class IN ('qualitative', 'semi_quantitative')),
  slope_hint numeric,
  window_start timestamptz,
  window_end timestamptz,
  method text NOT NULL,
  confidence numeric,
  trend_confidence_ref uuid REFERENCES asset_intelligence_trend_confidence(id) ON DELETE SET NULL,
  change_detection_ref uuid REFERENCES asset_intelligence_change_detections(id) ON DELETE SET NULL,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  trend_confidence_snapshot jsonb,
  change_detection_snapshot jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  predictive_ml_used boolean NOT NULL DEFAULT false CHECK (predictive_ml_used = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  accuracy_claims_certified boolean NOT NULL DEFAULT false CHECK (accuracy_claims_certified = false),
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_trend_states_asset
  ON asset_intelligence_trend_states(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_degradation_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  series_id uuid REFERENCES asset_intelligence_time_series(id) ON DELETE SET NULL,
  trend_state_id uuid REFERENCES asset_intelligence_trend_states(id) ON DELETE SET NULL,
  change_detection_id uuid REFERENCES asset_intelligence_change_detections(id) ON DELETE SET NULL,
  -- Optional context from published failure intelligence — never auto-sole source.
  related_failure_mode_codes jsonb NOT NULL DEFAULT '[]'::jsonb,
  degradation_direction text NOT NULL DEFAULT 'indeterminate'
    CHECK (degradation_direction IN ('improving', 'stable', 'degrading', 'indeterminate')),
  degradation_class text NOT NULL DEFAULT 'qualitative'
    CHECK (degradation_class IN ('qualitative', 'semi_quantitative')),
  severity_hint text
    CHECK (severity_hint IN ('none', 'low', 'moderate', 'high', 'indeterminate')),
  mechanism_context text,
  method text NOT NULL,
  confidence numeric,
  trend_confidence_ref uuid REFERENCES asset_intelligence_trend_confidence(id) ON DELETE SET NULL,
  evidence_confidence_ref text,
  evidence_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  source_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  review_status text NOT NULL DEFAULT 'draft'
    CHECK (review_status IN (
      'draft', 'calculated', 'pending_review', 'approved', 'rejected',
      'published', 'superseded', 'archived'
    )),
  review_instance_id text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  supersedes_id uuid REFERENCES asset_intelligence_degradation_states(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  predictive_ml_used boolean NOT NULL DEFAULT false CHECK (predictive_ml_used = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  accuracy_claims_certified boolean NOT NULL DEFAULT false CHECK (accuracy_claims_certified = false),
  -- Distinct from Failure Mode identification.
  is_failure_mode_claim boolean NOT NULL DEFAULT false CHECK (is_failure_mode_claim = false),
  UNIQUE (tenant_id, workspace_id, asset_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_degradation_states_asset
  ON asset_intelligence_degradation_states(tenant_id, workspace_id, asset_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS asset_intelligence_degradation_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  degradation_state_id uuid NOT NULL REFERENCES asset_intelligence_degradation_states(id) ON DELETE CASCADE,
  review_instance_id text,
  action text NOT NULL
    CHECK (action IN ('submit', 'approve', 'reject', 'request_changes', 'resubmit')),
  reviewer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reason text,
  state_version integer NOT NULL,
  content_hash text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_degradation_reviews_state
  ON asset_intelligence_degradation_reviews(tenant_id, workspace_id, degradation_state_id, created_at DESC);

ALTER TABLE asset_intelligence_time_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_change_detections ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_trend_confidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_trend_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_degradation_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_degradation_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_time_series',
    'asset_intelligence_change_detections',
    'asset_intelligence_trend_confidence',
    'asset_intelligence_trend_states',
    'asset_intelligence_degradation_states',
    'asset_intelligence_degradation_reviews'
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

GRANT ALL ON asset_intelligence_time_series TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_change_detections TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_trend_confidence TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_trend_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_degradation_states TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_degradation_reviews TO anon, authenticated, service_role;

COMMENT ON TABLE asset_intelligence_time_series IS
  'Asset Intelligence engineering time series. Not a sensor registry; not an SHM runtime.';
COMMENT ON TABLE asset_intelligence_change_detections IS
  'Asset Intelligence change detection results. Heuristic/rule-based only — not predictive ML.';
COMMENT ON TABLE asset_intelligence_trend_confidence IS
  'Asset Intelligence trend/degradation confidence assessments (data sufficiency gating).';
COMMENT ON TABLE asset_intelligence_trend_states IS
  'Asset Intelligence trend states. Advisory only; probabilityOfFailureCertified must remain false.';
COMMENT ON TABLE asset_intelligence_degradation_states IS
  'Asset Intelligence governed degradation states. Distinct from Failure Mode identification.';
COMMENT ON TABLE asset_intelligence_degradation_reviews IS
  'Governed review actions applied to Asset Intelligence degradation states.';
