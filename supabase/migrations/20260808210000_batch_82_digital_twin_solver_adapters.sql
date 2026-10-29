-- batch_82: Digital Twin Phase 12I — External Engineering Solver Adapter Foundation
-- CalculiX first real adapter metadata only — NO solver binaries in Twin tables.
-- Outbox: digital_twin_outbox_events (NOT digital_twin_outbox).

-- ---------------------------------------------------------------------------
-- Adapter registrations (tool-registry compatible refs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_solver_adapters (
  adapter_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  solver_id text NOT NULL,
  adapter_version text NOT NULL,
  display_name text NOT NULL,
  license_family text NOT NULL CHECK (license_family IN ('open_source_gpl','commercial','unknown','reserved')),
  status text NOT NULL CHECK (status IN ('draft','registered','healthy','degraded','unavailable','revoked')),
  tool_registry_ref text,
  certified_method_keys jsonb NOT NULL DEFAULT '[]'::jsonb,
  implemented boolean NOT NULL DEFAULT false,
  native_solver_claimed boolean NOT NULL DEFAULT false CHECK (native_solver_claimed = false),
  silent_fallback_allowed boolean NOT NULL DEFAULT false CHECK (silent_fallback_allowed = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, solver_id, adapter_version)
);

CREATE TABLE IF NOT EXISTS digital_twin_solver_version_observations (
  observation_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adapter_id text NOT NULL REFERENCES digital_twin_solver_adapters(adapter_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  probed_at timestamptz NOT NULL DEFAULT now(),
  version_text text NOT NULL DEFAULT '',
  version_normalized text,
  probe_command text NOT NULL,
  ok boolean NOT NULL,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_solver_benchmarks (
  benchmark_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  solver_id text NOT NULL,
  method_key text NOT NULL,
  description text NOT NULL,
  expected_displacement_m double precision,
  relative_tolerance double precision NOT NULL DEFAULT 0.05,
  defaults_manifest_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, benchmark_id)
);

CREATE TABLE IF NOT EXISTS digital_twin_solver_benchmark_results (
  result_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id text NOT NULL REFERENCES digital_twin_solver_benchmarks(benchmark_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  adapter_id text REFERENCES digital_twin_solver_adapters(adapter_id),
  ok boolean NOT NULL,
  status text NOT NULL,
  measured_displacement_m double precision,
  expected_displacement_m double precision,
  relative_error double precision,
  error_code text,
  external_process_spawned boolean NOT NULL DEFAULT false,
  silent_fallback_used boolean NOT NULL DEFAULT false CHECK (silent_fallback_used = false),
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_solver_runs (
  solver_run_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  twin_id text,
  adapter_id text NOT NULL,
  solver_id text NOT NULL,
  method_key text NOT NULL,
  request_id text NOT NULL,
  status text NOT NULL CHECK (status IN (
    'completed','completed_with_warnings','non_converged','failed','cancelled','timeout','unknown','running','queued'
  )),
  started_at timestamptz,
  finished_at timestamptz,
  exit_code integer,
  error_code text,
  defaults_manifest_version text,
  unit_system text,
  unit_code text,
  input_artifact_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  output_artifact_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  mapped_summary jsonb,
  native_solver_invoked boolean NOT NULL DEFAULT false CHECK (native_solver_invoked = false),
  external_process_spawned boolean NOT NULL DEFAULT false,
  silent_fallback_used boolean NOT NULL DEFAULT false CHECK (silent_fallback_used = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, request_id)
);

CREATE INDEX IF NOT EXISTS digital_twin_solver_adapters_tenant_idx
  ON digital_twin_solver_adapters (tenant_id, workspace_id);
CREATE INDEX IF NOT EXISTS digital_twin_solver_version_obs_adapter_idx
  ON digital_twin_solver_version_observations (adapter_id);
CREATE INDEX IF NOT EXISTS digital_twin_solver_benchmark_results_benchmark_idx
  ON digital_twin_solver_benchmark_results (benchmark_id);
CREATE INDEX IF NOT EXISTS digital_twin_solver_runs_adapter_idx
  ON digital_twin_solver_runs (adapter_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Outbox event types (extend digital_twin_outbox_events — lesson from 12H)
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
    'engineering.digital_twin.simulated_state.published',
    'engineering.digital_twin.simulation.method_qualification.activated',
    'engineering.digital_twin.simulation.method_qualification.revoked',
    'engineering.digital_twin.simulation.provider_qualification.activated',
    'engineering.digital_twin.simulation.provider_qualification.revoked',
    'engineering.digital_twin.simulation.application_qualification.activated',
    'engineering.digital_twin.simulation.application_qualification.revoked',
    'engineering.digital_twin.simulation.execution_qualification.issued',
    'engineering.digital_twin.simulation.execution_qualification.revoked',
    'engineering.digital_twin.simulation.package.assembled',
    'engineering.digital_twin.simulation.package.sealed',
    'engineering.digital_twin.simulation.package.integrity_checked',
    'engineering.digital_twin.simulation.reproducibility.assessed',
    'engineering.digital_twin.simulation.eligibility.assessed',
    'engineering.digital_twin.solver.adapter.registered',
    'engineering.digital_twin.solver.version.probed',
    'engineering.digital_twin.solver.health.checked',
    'engineering.digital_twin.solver.run.started',
    'engineering.digital_twin.solver.run.completed',
    'engineering.digital_twin.solver.run.failed',
    'engineering.digital_twin.solver.run.timeout',
    'engineering.digital_twin.solver.run.cancelled',
    'engineering.digital_twin.solver.benchmark.executed'
  ));

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_solver_adapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_solver_version_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_solver_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_solver_benchmark_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_solver_runs ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_solver_adapters',
    'digital_twin_solver_version_observations',
    'digital_twin_solver_benchmarks',
    'digital_twin_solver_benchmark_results',
    'digital_twin_solver_runs'
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
