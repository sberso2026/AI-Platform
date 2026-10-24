-- Phase 12G — Digital Twin simulation governance (batch_80)
--
-- ADD module tables for simulation methods, providers, definitions, scenarios,
-- input sets, runs, results, validation, simulated states, and reviews.
-- Do NOT modify batch_75, batch_76, batch_77, batch_78, or batch_79.
-- Simulated-state plane is SEPARATE from observed/derived/operational (batch_76).
-- Certified provider path: deterministic_fixture ONLY — no native solver artifacts.

-- ---------------------------------------------------------------------------
-- Simulation methods
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_methods (
  method_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  method_key text NOT NULL,
  display_name text NOT NULL,
  simulation_class text NOT NULL
    CHECK (simulation_class IN (
      'structural', 'thermal', 'fluid', 'electrical', 'geotechnical',
      'process', 'operational_scenario', 'other'
    )),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'registered', 'qualified', 'certified', 'suspended', 'deprecated', 'revoked'
    )),
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  applicability_notes text,
  fixture_qualification_only boolean NOT NULL DEFAULT true
    CONSTRAINT dt_sim_method_fixture_only CHECK (fixture_qualification_only = true),
  claims_native_solver boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_method_no_native CHECK (claims_native_solver = false),
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_method_no_artifact CHECK (stores_solver_artifact = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, method_key, version)
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_methods_ws
  ON digital_twin_simulation_methods(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Simulation providers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_providers (
  provider_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_key text NOT NULL,
  display_name text NOT NULL,
  provider_type text NOT NULL
    CHECK (provider_type IN (
      'deterministic_fixture', 'external_solver', 'engineering_tool_adapter',
      'remote_service', 'future_local_solver'
    )),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'registered', 'certified', 'suspended', 'revoked')),
  executable_in_phase_12g boolean NOT NULL DEFAULT false,
  claims_native_engineering_solver boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_provider_no_native CHECK (claims_native_engineering_solver = false),
  engineering_tool_registry_ref text,
  timeout_ms_default integer NOT NULL DEFAULT 5000 CHECK (timeout_ms_default > 0),
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_provider_no_artifact CHECK (stores_solver_artifact = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, provider_key),
  CONSTRAINT dt_sim_provider_executable_fixture CHECK (
    (provider_type = 'deterministic_fixture' AND executable_in_phase_12g = true)
    OR (provider_type <> 'deterministic_fixture' AND executable_in_phase_12g = false)
  )
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_providers_ws
  ON digital_twin_simulation_providers(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Simulation definitions (versioned)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_definitions (
  definition_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  definition_key text NOT NULL,
  display_name text NOT NULL,
  simulation_class text NOT NULL
    CHECK (simulation_class IN (
      'structural', 'thermal', 'fluid', 'electrical', 'geotechnical',
      'process', 'operational_scenario', 'other'
    )),
  method_id uuid NOT NULL REFERENCES digital_twin_simulation_methods(method_id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES digital_twin_simulation_providers(provider_id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'registered', 'versioned', 'superseded', 'retired')),
  simulation_ready_context_declared boolean NOT NULL DEFAULT false,
  claims_representation_fidelity_l4_or_l5 boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_def_no_l4_l5 CHECK (claims_representation_fidelity_l4_or_l5 = false),
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_def_no_artifact CHECK (stores_solver_artifact = false),
  applicability_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, twin_id, definition_key, version)
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_definitions_twin
  ON digital_twin_simulation_definitions(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Simulation scenarios (hypothetical)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_scenarios (
  scenario_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  definition_id uuid NOT NULL REFERENCES digital_twin_simulation_definitions(definition_id) ON DELETE CASCADE,
  scenario_key text NOT NULL,
  display_name text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'registered', 'active', 'archived')),
  hypothesis_notes text,
  may_overwrite_observed_state boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_scenario_no_overwrite CHECK (may_overwrite_observed_state = false),
  is_forecast boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_scenario_not_forecast CHECK (is_forecast = false),
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_scenario_no_artifact CHECK (stores_solver_artifact = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, twin_id, scenario_key)
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_scenarios_twin
  ON digital_twin_simulation_scenarios(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Simulation input sets (immutable after run)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_input_sets (
  input_set_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES digital_twin_simulation_scenarios(scenario_id) ON DELETE CASCADE,
  definition_id uuid NOT NULL REFERENCES digital_twin_simulation_definitions(definition_id) ON DELETE CASCADE,
  content_hash text NOT NULL,
  representation_version_pins jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_state_version_pins jsonb NOT NULL DEFAULT '[]'::jsonb,
  telemetry_window_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  unit_system text,
  unit_code text,
  parameters jsonb NOT NULL DEFAULT '{}'::jsonb,
  simulation_uses_published_state_only boolean NOT NULL DEFAULT true
    CONSTRAINT dt_sim_input_published_only CHECK (simulation_uses_published_state_only = true),
  immutable boolean NOT NULL DEFAULT false,
  frozen_at timestamptz,
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_input_no_artifact CHECK (stores_solver_artifact = false),
  stores_historian_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_input_no_historian CHECK (stores_historian_payload = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_input_sets_twin
  ON digital_twin_simulation_input_sets(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Simulation runs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_runs (
  run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  definition_id uuid NOT NULL REFERENCES digital_twin_simulation_definitions(definition_id) ON DELETE RESTRICT,
  scenario_id uuid NOT NULL REFERENCES digital_twin_simulation_scenarios(scenario_id) ON DELETE RESTRICT,
  input_set_id uuid NOT NULL REFERENCES digital_twin_simulation_input_sets(input_set_id) ON DELETE RESTRICT,
  method_id uuid NOT NULL REFERENCES digital_twin_simulation_methods(method_id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES digital_twin_simulation_providers(provider_id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'timed_out', 'cancelled')),
  started_at timestamptz,
  finished_at timestamptz,
  error_code text,
  result_id uuid,
  publishes_observed_state boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_run_no_observed_publish CHECK (publishes_observed_state = false),
  native_solver_invoked boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_run_no_native CHECK (native_solver_invoked = false),
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_run_no_artifact CHECK (stores_solver_artifact = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_runs_twin
  ON digital_twin_simulation_runs(tenant_id, workspace_id, twin_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Simulation results (immutable)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_results (
  result_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES digital_twin_simulation_runs(run_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES digital_twin_simulation_scenarios(scenario_id) ON DELETE RESTRICT,
  input_set_id uuid NOT NULL REFERENCES digital_twin_simulation_input_sets(input_set_id) ON DELETE RESTRICT,
  method_id uuid NOT NULL REFERENCES digital_twin_simulation_methods(method_id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES digital_twin_simulation_providers(provider_id) ON DELETE RESTRICT,
  content_hash text NOT NULL,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  execution_succeeded boolean NOT NULL DEFAULT false,
  is_engineering_acceptance boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_result_not_acceptance CHECK (is_engineering_acceptance = false),
  is_approval boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_result_not_approval CHECK (is_approval = false),
  claims_native_solver boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_result_no_native CHECK (claims_native_solver = false),
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_result_no_artifact CHECK (stores_solver_artifact = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_results_twin
  ON digital_twin_simulation_results(tenant_id, workspace_id, twin_id);

ALTER TABLE digital_twin_simulation_runs
  DROP CONSTRAINT IF EXISTS digital_twin_simulation_runs_result_id_fkey;
ALTER TABLE digital_twin_simulation_runs
  ADD CONSTRAINT digital_twin_simulation_runs_result_id_fkey
  FOREIGN KEY (result_id) REFERENCES digital_twin_simulation_results(result_id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Simulation validation
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_validation (
  validation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id uuid NOT NULL REFERENCES digital_twin_simulation_results(result_id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES digital_twin_simulation_runs(run_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'not_validated'
    CHECK (status IN ('not_validated', 'pending_validation', 'validated', 'rejected')),
  execution_success_implies_validated boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_val_no_auto CHECK (execution_success_implies_validated = false),
  notes text,
  validated_at timestamptz,
  validated_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_val_no_artifact CHECK (stores_solver_artifact = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_validation_twin
  ON digital_twin_simulation_validation(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Simulated states (SEPARATE plane from batch_76 observed/derived/operational)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulated_states (
  simulated_state_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  category text NOT NULL DEFAULT 'simulated'
    CHECK (category = 'simulated'),
  simulation_result_ref uuid NOT NULL REFERENCES digital_twin_simulation_results(result_id) ON DELETE RESTRICT,
  method_id uuid NOT NULL REFERENCES digital_twin_simulation_methods(method_id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES digital_twin_simulation_providers(provider_id) ON DELETE RESTRICT,
  scenario_id uuid NOT NULL REFERENCES digital_twin_simulation_scenarios(scenario_id) ON DELETE RESTRICT,
  input_set_id uuid NOT NULL REFERENCES digital_twin_simulation_input_sets(input_set_id) ON DELETE RESTRICT,
  validation_id uuid REFERENCES digital_twin_simulation_validation(validation_id) ON DELETE SET NULL,
  review_id uuid,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  lifecycle text NOT NULL DEFAULT 'draft'
    CHECK (lifecycle IN ('draft', 'pending_review', 'published', 'superseded', 'archived')),
  external_ref text NOT NULL,
  replaces_observed_state boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_state_no_replace CHECK (replaces_observed_state = false),
  simulation_executed boolean NOT NULL DEFAULT true
    CONSTRAINT dt_sim_state_executed CHECK (simulation_executed = true),
  claims_physical_truth boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_state_no_truth CHECK (claims_physical_truth = false),
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_state_no_artifact CHECK (stores_solver_artifact = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_dt_simulated_states_twin
  ON digital_twin_simulated_states(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Simulation reviews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_reviews (
  review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  result_id uuid NOT NULL REFERENCES digital_twin_simulation_results(result_id) ON DELETE CASCADE,
  validation_id uuid NOT NULL REFERENCES digital_twin_simulation_validation(validation_id) ON DELETE CASCADE,
  lifecycle text NOT NULL DEFAULT 'draft'
    CHECK (lifecycle IN ('draft', 'pending_review', 'approved', 'rejected', 'published', 'superseded')),
  auto_approved boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_review_no_auto CHECK (auto_approved = false),
  ai_self_approved boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_review_no_ai CHECK (ai_self_approved = false),
  stores_solver_artifact boolean NOT NULL DEFAULT false
    CONSTRAINT dt_sim_review_no_artifact CHECK (stores_solver_artifact = false),
  decided_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_reviews_twin
  ON digital_twin_simulation_reviews(tenant_id, workspace_id, twin_id);

ALTER TABLE digital_twin_simulated_states
  DROP CONSTRAINT IF EXISTS digital_twin_simulated_states_review_id_fkey;
ALTER TABLE digital_twin_simulated_states
  ADD CONSTRAINT digital_twin_simulated_states_review_id_fkey
  FOREIGN KEY (review_id) REFERENCES digital_twin_simulation_reviews(review_id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Extend outbox event types (additive)
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_outbox_events DROP CONSTRAINT IF EXISTS digital_twin_outbox_events_event_type_check;
ALTER TABLE digital_twin_outbox_events ADD CONSTRAINT digital_twin_outbox_events_event_type_check
  CHECK (event_type IN (
    'engineering.digital_twin.created',
    'engineering.digital_twin.updated',
    'engineering.digital_twin.relationship.updated',
    'engineering.digital_twin.representation.updated',
    'engineering.digital_twin.state.created',
    'engineering.digital_twin.state.reviewed',
    'engineering.digital_twin.state.published',
    'engineering.digital_twin.state.superseded',
    'engineering.digital_twin.snapshot.updated',
    'engineering.digital_twin.state_candidate.received',
    'engineering.digital_twin.state_candidate.validated',
    'engineering.digital_twin.state_candidate.rejected',
    'engineering.digital_twin.state.conflict_detected',
    'engineering.digital_twin.telemetry_binding.created',
    'engineering.digital_twin.telemetry_binding.reviewed',
    'engineering.digital_twin.telemetry_binding.published',
    'engineering.digital_twin.telemetry_binding.suspended',
    'engineering.digital_twin.telemetry.projection_created',
    'engineering.digital_twin.telemetry.quality_rejected',
    'engineering.digital_twin.telemetry.stale_detected',
    'engineering.digital_twin.telemetry.source_unavailable',
    'engineering.digital_twin.representation.registered',
    'engineering.digital_twin.representation.versioned',
    'engineering.digital_twin.mapping.created',
    'engineering.digital_twin.mapping.reviewed',
    'engineering.digital_twin.mapping.published',
    'engineering.digital_twin.mapping.superseded',
    'engineering.digital_twin.mapping.review_required',
    'engineering.digital_twin.simulation.method.registered',
    'engineering.digital_twin.simulation.provider.registered',
    'engineering.digital_twin.simulation.definition.versioned',
    'engineering.digital_twin.simulation.scenario.created',
    'engineering.digital_twin.simulation.input_set.frozen',
    'engineering.digital_twin.simulation.run.started',
    'engineering.digital_twin.simulation.run.succeeded',
    'engineering.digital_twin.simulation.run.failed',
    'engineering.digital_twin.simulation.result.persisted',
    'engineering.digital_twin.simulation.validation.updated',
    'engineering.digital_twin.simulation.review.submitted',
    'engineering.digital_twin.simulation.review.decided',
    'engineering.digital_twin.simulated_state.published'
  ));

-- ---------------------------------------------------------------------------
-- RLS — tenant + workspace isolation
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_simulation_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_input_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_validation ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulated_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_reviews ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_simulation_methods',
    'digital_twin_simulation_providers',
    'digital_twin_simulation_definitions',
    'digital_twin_simulation_scenarios',
    'digital_twin_simulation_input_sets',
    'digital_twin_simulation_runs',
    'digital_twin_simulation_results',
    'digital_twin_simulation_validation',
    'digital_twin_simulated_states',
    'digital_twin_simulation_reviews'
  ]
  LOOP
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
       )',
      t || '_update', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE digital_twin_simulation_methods IS
  'Phase 12G simulation method registry — fixture qualification only; claims_native_solver=false.';
COMMENT ON TABLE digital_twin_simulation_providers IS
  'Phase 12G providers — only deterministic_fixture executable; no native solver.';
COMMENT ON TABLE digital_twin_simulated_states IS
  'Phase 12G simulated-state plane — NEVER replaces observed/derived/operational (batch_76).';
COMMENT ON TABLE digital_twin_simulation_reviews IS
  'Phase 12G simulation review — auto_approved=false; no AI self-approval.';
