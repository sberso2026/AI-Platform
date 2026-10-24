-- batch_83: Digital Twin Phase 12J — Multi-Provider Solver Capability Registry
-- Capability metadata only — NO solver binaries; NO new execution paths.
-- Outbox: digital_twin_outbox_events (NOT digital_twin_outbox).
-- Do NOT modify batch_75–82.

-- ---------------------------------------------------------------------------
-- Solver capabilities (per-solver capability registrations)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_solver_capabilities (
  capability_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  solver_id text NOT NULL,
  capability_key text NOT NULL,
  display_name text NOT NULL,
  discipline text NOT NULL,
  analysis_category text NOT NULL,
  unit_system text NOT NULL DEFAULT 'unspecified',
  limitations jsonb NOT NULL DEFAULT '[]'::jsonb,
  assumptions jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_status text NOT NULL CHECK (validation_status IN (
    'draft','registered','reserved','not_qualified','qualified','revoked'
  )),
  qualification_status text NOT NULL CHECK (qualification_status IN (
    'draft','registered','reserved','not_qualified','qualified','revoked'
  )),
  implies_whole_solver_qualification boolean NOT NULL DEFAULT false
    CHECK (implies_whole_solver_qualification = false),
  auto_execute_allowed boolean NOT NULL DEFAULT false CHECK (auto_execute_allowed = false),
  auto_qualify_allowed boolean NOT NULL DEFAULT false CHECK (auto_qualify_allowed = false),
  certified_method_key text,
  adapter_id text,
  input_classes jsonb NOT NULL DEFAULT '[]'::jsonb,
  output_classes jsonb NOT NULL DEFAULT '[]'::jsonb,
  certification_history jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, solver_id, capability_key)
);

CREATE TABLE IF NOT EXISTS digital_twin_solver_capability_versions (
  capability_version_id text PRIMARY KEY,
  capability_id text NOT NULL REFERENCES digital_twin_solver_capabilities(capability_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  version text NOT NULL,
  status text NOT NULL CHECK (status IN (
    'draft','registered','reserved','not_qualified','qualified','revoked'
  )),
  notes text NOT NULL DEFAULT '',
  registered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, capability_id, version)
);

CREATE TABLE IF NOT EXISTS digital_twin_solver_provider_compatibility (
  compatibility_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  method_key text NOT NULL,
  solver_id text NOT NULL,
  solver_version text NOT NULL DEFAULT 'unspecified',
  application_key text NOT NULL DEFAULT 'unspecified',
  project_type text NOT NULL DEFAULT 'unspecified',
  capability_id text NOT NULL,
  capability_version text NOT NULL DEFAULT 'unknown',
  adapter_id text,
  adapter_version text,
  compatible boolean NOT NULL DEFAULT false,
  executable boolean NOT NULL DEFAULT false,
  reason text NOT NULL DEFAULT '',
  queried_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_solver_capability_qualifications (
  capability_qualification_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  capability_id text NOT NULL REFERENCES digital_twin_solver_capabilities(capability_id) ON DELETE CASCADE,
  capability_version_id text NOT NULL,
  solver_id text NOT NULL,
  status text NOT NULL CHECK (status IN (
    'draft','registered','reserved','not_qualified','qualified','revoked'
  )),
  implies_whole_solver_qualification boolean NOT NULL DEFAULT false
    CHECK (implies_whole_solver_qualification = false),
  method_key_ref text,
  provider_id_ref text,
  application_key_ref text,
  execution_qualification_ref text,
  reviewed_by text,
  decided_at timestamptz,
  notes text NOT NULL DEFAULT '',
  historic_immutable boolean NOT NULL DEFAULT true CHECK (historic_immutable = true),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS digital_twin_solver_adapter_versions (
  adapter_version_id text PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  adapter_id text NOT NULL,
  adapter_version text NOT NULL,
  solver_id text NOT NULL,
  supported_solver_versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  deprecated_solver_versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  revoked_solver_versions jsonb NOT NULL DEFAULT '[]'::jsonb,
  compatibility_notes text NOT NULL DEFAULT '',
  historic_runs_reproducible boolean NOT NULL DEFAULT true CHECK (historic_runs_reproducible = true),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, adapter_id, adapter_version)
);

CREATE INDEX IF NOT EXISTS digital_twin_solver_capabilities_tenant_idx
  ON digital_twin_solver_capabilities (tenant_id, workspace_id, solver_id);
CREATE INDEX IF NOT EXISTS digital_twin_solver_capability_versions_cap_idx
  ON digital_twin_solver_capability_versions (capability_id);
CREATE INDEX IF NOT EXISTS digital_twin_solver_provider_compat_query_idx
  ON digital_twin_solver_provider_compatibility (method_key, solver_id, application_key);
CREATE INDEX IF NOT EXISTS digital_twin_solver_capability_quals_cap_idx
  ON digital_twin_solver_capability_qualifications (capability_id);
CREATE INDEX IF NOT EXISTS digital_twin_solver_adapter_versions_adapter_idx
  ON digital_twin_solver_adapter_versions (adapter_id, solver_id);

-- ---------------------------------------------------------------------------
-- Outbox event types (extend digital_twin_outbox_events)
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
    'engineering.digital_twin.solver.benchmark.executed',
    'engineering.solver.capability.registered',
    'engineering.solver.capability.qualified',
    'engineering.solver.capability.revoked',
    'engineering.solver.provider.updated'
  ));

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_solver_capabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_solver_capability_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_solver_provider_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_solver_capability_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_solver_adapter_versions ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_solver_capabilities',
    'digital_twin_solver_capability_versions',
    'digital_twin_solver_provider_compatibility',
    'digital_twin_solver_capability_qualifications',
    'digital_twin_solver_adapter_versions'
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
