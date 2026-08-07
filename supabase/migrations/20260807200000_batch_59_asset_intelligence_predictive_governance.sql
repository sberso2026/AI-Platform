-- Phase 10J — Predictive method governance (objectives / methods / candidates /
-- qualifications / validation metrics / reviews)
-- Additive only; do not rewrite batch_55 / 55b / 56 / 57 / 58.
-- Governance records only: no predictive execution, no prediction output.

CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_objectives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  objective_id text NOT NULL,
  objective_version text NOT NULL DEFAULT '1',
  description text NOT NULL,
  required_inputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  minimum_evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  minimum_time_window jsonb NOT NULL DEFAULT '{}'::jsonb,
  required_confidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  required_governance jsonb NOT NULL DEFAULT '{}'::jsonb,
  allowed_method_classes jsonb NOT NULL DEFAULT '[]'::jsonb,
  prohibited_uses jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'reserved'
    CHECK (status IN ('reserved', 'not_certified', 'under_evaluation')),
  certified boolean NOT NULL DEFAULT false CHECK (certified = false),
  production_execution_enabled boolean NOT NULL DEFAULT false
    CHECK (production_execution_enabled = false),
  predictive_ml_enabled boolean NOT NULL DEFAULT false CHECK (predictive_ml_enabled = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  autonomous_execution_forbidden boolean NOT NULL DEFAULT true
    CHECK (autonomous_execution_forbidden = true),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, objective_id, objective_version)
);

CREATE TABLE IF NOT EXISTS asset_intelligence_objective_predictive_readiness (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  objective_id text NOT NULL,
  objective_version text NOT NULL DEFAULT '1',
  version integer NOT NULL DEFAULT 1,
  readiness_class text NOT NULL,
  readiness_rationale jsonb NOT NULL DEFAULT '[]'::jsonb,
  satisfied_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  unmet_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  evidence_confidence_ref text,
  trend_confidence_ref text,
  fusion_provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  global_readiness_ref text,
  freshness_policy_ref text NOT NULL DEFAULT 'predictive_freshness_default_v1',
  freshness_state text NOT NULL DEFAULT 'unknown'
    CHECK (freshness_state IN ('fresh', 'aging', 'stale', 'unknown')),
  observation_count integer,
  observation_window_days integer,
  method text NOT NULL DEFAULT 'objective_predictive_readiness_v1',
  method_version text NOT NULL DEFAULT '1',
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid REFERENCES asset_intelligence_objective_predictive_readiness(id) ON DELETE SET NULL,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  predictive_ml_enabled boolean NOT NULL DEFAULT false CHECK (predictive_ml_enabled = false),
  predictive_methods_certified boolean NOT NULL DEFAULT false
    CHECK (predictive_methods_certified = false),
  predictive_ml_executed boolean NOT NULL DEFAULT false CHECK (predictive_ml_executed = false),
  production_execution_enabled boolean NOT NULL DEFAULT false
    CHECK (production_execution_enabled = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  contains_prediction_output boolean NOT NULL DEFAULT false
    CHECK (contains_prediction_output = false),
  autonomous_execution_forbidden boolean NOT NULL DEFAULT true
    CHECK (autonomous_execution_forbidden = true),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Probability of failure and remaining useful life can never be ready in 10J.
  CONSTRAINT ai_objective_readiness_reserved_objectives_not_ready CHECK (
    objective_id NOT IN ('probability_of_failure', 'remaining_useful_life')
    OR readiness_class = 'not_ready'
  ),
  UNIQUE (tenant_id, workspace_id, asset_id, objective_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_objective_pred_readiness_asset
  ON asset_intelligence_objective_predictive_readiness(
    tenant_id, workspace_id, asset_id, objective_id, assessed_at DESC
  );

CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  method_id text NOT NULL,
  method_definition_version text NOT NULL DEFAULT '1',
  name text NOT NULL,
  description text NOT NULL,
  method_class text NOT NULL
    CHECK (method_class IN (
      'deterministic', 'statistical', 'physics_based', 'hybrid', 'machine_learning'
    )),
  applicable_objectives jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_inputs jsonb NOT NULL DEFAULT '[]'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  applicability_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  prohibited_uses jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_metric_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  ml_governance jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'registered', 'under_evaluation', 'qualified',
      'suspended', 'deprecated', 'revoked'
    )),
  suspended_from_execution boolean NOT NULL DEFAULT false,
  qualification_ref text,
  certification_ref text,
  certified boolean NOT NULL DEFAULT false CHECK (certified = false),
  predictive_methods_certified boolean NOT NULL DEFAULT false
    CHECK (predictive_methods_certified = false),
  production_execution_enabled boolean NOT NULL DEFAULT false
    CHECK (production_execution_enabled = false),
  predictive_ml_enabled boolean NOT NULL DEFAULT false CHECK (predictive_ml_enabled = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  autonomous_execution_forbidden boolean NOT NULL DEFAULT true
    CHECK (autonomous_execution_forbidden = true),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- Machine learning methods stay suspended while predictive_ml_enabled is false.
  CONSTRAINT ai_predictive_methods_ml_suspended CHECK (
    method_class <> 'machine_learning' OR suspended_from_execution = true
  ),
  UNIQUE (tenant_id, workspace_id, method_id, method_definition_version)
);

CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_method_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid NOT NULL REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  objective_id text NOT NULL,
  method_id text NOT NULL,
  method_definition_version text NOT NULL DEFAULT '1',
  method_class text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  eligibility text NOT NULL
    CHECK (eligibility IN ('eligible', 'conditionally_eligible', 'ineligible')),
  eligibility_rationale jsonb NOT NULL DEFAULT '[]'::jsonb,
  outstanding_conditions jsonb NOT NULL DEFAULT '[]'::jsonb,
  unmet_requirements jsonb NOT NULL DEFAULT '[]'::jsonb,
  assumptions_asserted jsonb NOT NULL DEFAULT '[]'::jsonb,
  assumptions_violated jsonb NOT NULL DEFAULT '[]'::jsonb,
  readiness_state_id uuid
    REFERENCES asset_intelligence_objective_predictive_readiness(id) ON DELETE SET NULL,
  readiness_state_ref text,
  readiness_class text,
  fusion_provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  freshness_policy_ref text NOT NULL DEFAULT 'predictive_freshness_default_v1',
  freshness_state text NOT NULL DEFAULT 'unknown'
    CHECK (freshness_state IN ('fresh', 'aging', 'stale', 'unknown')),
  qualification_ref text,
  method text NOT NULL DEFAULT 'predictive_method_candidate_v1',
  method_version text NOT NULL DEFAULT '1',
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  proposed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid
    REFERENCES asset_intelligence_predictive_method_candidates(id) ON DELETE SET NULL,
  -- A candidate is a proposal to evaluate a method, never a predicted value.
  contains_prediction_output boolean NOT NULL DEFAULT false
    CHECK (contains_prediction_output = false),
  predictive_ml_executed boolean NOT NULL DEFAULT false CHECK (predictive_ml_executed = false),
  predictive_methods_certified boolean NOT NULL DEFAULT false
    CHECK (predictive_methods_certified = false),
  production_execution_enabled boolean NOT NULL DEFAULT false
    CHECK (production_execution_enabled = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  autonomous_execution_forbidden boolean NOT NULL DEFAULT true
    CHECK (autonomous_execution_forbidden = true),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT ai_predictive_candidates_reserved_objectives_ineligible CHECK (
    objective_id NOT IN ('probability_of_failure', 'remaining_useful_life')
    OR eligibility = 'ineligible'
  ),
  UNIQUE (tenant_id, workspace_id, asset_id, objective_id, method_id, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_predictive_candidates_asset
  ON asset_intelligence_predictive_method_candidates(
    tenant_id, workspace_id, asset_id, objective_id, proposed_at DESC
  );

CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_method_qualifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  method_id text NOT NULL,
  method_definition_version text NOT NULL DEFAULT '1',
  method_class text NOT NULL,
  method_status_at_qualification text NOT NULL,
  objective_id text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  qualification_status text NOT NULL DEFAULT 'draft'
    CHECK (qualification_status IN (
      'draft', 'in_evaluation', 'passed', 'failed', 'inconclusive', 'withdrawn', 'expired'
    )),
  fixture_set_ref text NOT NULL,
  fixture_set_hash text NOT NULL,
  fixture_count integer NOT NULL CHECK (fixture_count > 0),
  applicability_domain jsonb NOT NULL DEFAULT '[]'::jsonb,
  acceptance_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  results jsonb NOT NULL DEFAULT '[]'::jsonb,
  failed_mandatory_metric_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  reproducible boolean NOT NULL DEFAULT false,
  evaluated_at timestamptz,
  evaluator_id text,
  review_status text NOT NULL DEFAULT 'draft',
  review_instance_id text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  supersedes_id uuid
    REFERENCES asset_intelligence_predictive_method_qualifications(id) ON DELETE SET NULL,
  -- Qualification is fixture-bounded acceptability, never certification.
  certification_granted boolean NOT NULL DEFAULT false CHECK (certification_granted = false),
  production_execution_enabled boolean NOT NULL DEFAULT false
    CHECK (production_execution_enabled = false),
  predictive_ml_enabled boolean NOT NULL DEFAULT false CHECK (predictive_ml_enabled = false),
  predictive_methods_certified boolean NOT NULL DEFAULT false
    CHECK (predictive_methods_certified = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  contains_prediction_output boolean NOT NULL DEFAULT false
    CHECK (contains_prediction_output = false),
  autonomous_execution_forbidden boolean NOT NULL DEFAULT true
    CHECK (autonomous_execution_forbidden = true),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, method_id, objective_id, fixture_set_hash, version)
);

CREATE INDEX IF NOT EXISTS idx_ai_predictive_qualifications_method
  ON asset_intelligence_predictive_method_qualifications(
    tenant_id, workspace_id, method_id, objective_id, created_at DESC
  );

CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_validation_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  metric_id text NOT NULL,
  metric_version text NOT NULL DEFAULT '1',
  name text NOT NULL,
  family text NOT NULL,
  description text NOT NULL,
  direction text NOT NULL
    CHECK (direction IN ('lower_is_better', 'higher_is_better', 'target_value')),
  unit text NOT NULL,
  target_value numeric,
  applicable_method_classes jsonb NOT NULL DEFAULT '[]'::jsonb,
  applicability_note text NOT NULL,
  requires_ground_truth boolean NOT NULL DEFAULT true,
  requires_interval_output boolean NOT NULL DEFAULT false,
  requires_probabilistic_output boolean NOT NULL DEFAULT false,
  interpretation_limits jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'reserved')),
  -- Registering a calibration metric does not certify probability of failure.
  acceptance_threshold_defined boolean NOT NULL DEFAULT false
    CHECK (acceptance_threshold_defined = false),
  certification_implied boolean NOT NULL DEFAULT false CHECK (certification_implied = false),
  probability_of_failure_certified boolean NOT NULL DEFAULT false
    CHECK (probability_of_failure_certified = false),
  rul_claims_certified boolean NOT NULL DEFAULT false CHECK (rul_claims_certified = false),
  is_health_factor boolean NOT NULL DEFAULT false CHECK (is_health_factor = false),
  autonomous_execution_forbidden boolean NOT NULL DEFAULT true
    CHECK (autonomous_execution_forbidden = true),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, workspace_id, metric_id, metric_version)
);

CREATE TABLE IF NOT EXISTS asset_intelligence_predictive_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES engineering_assets(id) ON DELETE RESTRICT,
  subject_kind text NOT NULL
    CHECK (subject_kind IN (
      'objective_readiness', 'method_candidate', 'method_qualification'
    )),
  subject_id text NOT NULL,
  subject_version integer NOT NULL DEFAULT 1,
  objective_id text,
  method_id text,
  review_instance_id text NOT NULL,
  action text NOT NULL,
  reviewer_id text NOT NULL,
  reason text,
  evidence_confidence_ref text,
  content_hash text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  -- Review governs the record; it never authorises execution or certification.
  grants_production_execution boolean NOT NULL DEFAULT false
    CHECK (grants_production_execution = false),
  grants_certification boolean NOT NULL DEFAULT false CHECK (grants_certification = false),
  autonomous_execution_forbidden boolean NOT NULL DEFAULT true
    CHECK (autonomous_execution_forbidden = true),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ai_predictive_reviews_subject
  ON asset_intelligence_predictive_reviews(
    tenant_id, workspace_id, subject_kind, subject_id, created_at DESC
  );

ALTER TABLE asset_intelligence_predictive_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_objective_predictive_readiness ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_predictive_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_predictive_method_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_predictive_method_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_predictive_validation_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE asset_intelligence_predictive_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'asset_intelligence_predictive_objectives',
    'asset_intelligence_objective_predictive_readiness',
    'asset_intelligence_predictive_methods',
    'asset_intelligence_predictive_method_candidates',
    'asset_intelligence_predictive_method_qualifications',
    'asset_intelligence_predictive_validation_metrics',
    'asset_intelligence_predictive_reviews'
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

GRANT ALL ON asset_intelligence_predictive_objectives TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_objective_predictive_readiness TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_predictive_methods TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_predictive_method_candidates TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_predictive_method_qualifications TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_predictive_validation_metrics TO anon, authenticated, service_role;
GRANT ALL ON asset_intelligence_predictive_reviews TO anon, authenticated, service_role;

COMMENT ON TABLE asset_intelligence_predictive_objectives IS
  'Registered predictive objectives — reserved/uncertified; no production execution in Phase 10J.';
COMMENT ON TABLE asset_intelligence_objective_predictive_readiness IS
  'Objective-specific predictive readiness; probability_of_failure and remaining_useful_life are always not_ready.';
COMMENT ON TABLE asset_intelligence_predictive_methods IS
  'Registered predictive methods — no method may be certified or executed; ML methods stay suspended.';
COMMENT ON TABLE asset_intelligence_predictive_method_candidates IS
  'Proposals to evaluate a method for an objective — never a predicted value.';
COMMENT ON TABLE asset_intelligence_predictive_method_qualifications IS
  'Fixture-bounded method qualification — does not grant certification or production execution.';
COMMENT ON TABLE asset_intelligence_predictive_validation_metrics IS
  'Validation metric registry — registering calibration metrics does not certify probability of failure.';
COMMENT ON TABLE asset_intelligence_predictive_reviews IS
  'Governed review of predictive governance records; grants neither execution nor certification.';
