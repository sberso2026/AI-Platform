-- Phase 12H — Digital Twin simulation assurance (batch_81)
--
-- ADD module tables for method/provider/application/execution qualifications,
-- simulation packages, integrity, and reproducibility.
-- Do NOT modify batch_75, batch_76, batch_77, batch_78, batch_79, or batch_80.
-- externalEngineeringSolverAdaptersImplemented remains false.
-- No large binaries — Platform Files refs only.

-- ---------------------------------------------------------------------------
-- Method qualifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_method_qualifications (
  method_qualification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  method_id uuid NOT NULL REFERENCES digital_twin_simulation_methods(method_id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'suspended', 'revoked', 'superseded')),
  fixture_qualification_only boolean NOT NULL DEFAULT true
    CONSTRAINT dt_mq_fixture_only CHECK (fixture_qualification_only = true),
  claims_native_solver boolean NOT NULL DEFAULT false
    CONSTRAINT dt_mq_no_native CHECK (claims_native_solver = false),
  claims_universal_accuracy boolean NOT NULL DEFAULT false
    CONSTRAINT dt_mq_no_universal CHECK (claims_universal_accuracy = false),
  required_artifact_classes jsonb NOT NULL DEFAULT '[]'::jsonb,
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  superseded_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, method_id, version)
);

CREATE INDEX IF NOT EXISTS idx_dt_method_qual_ws
  ON digital_twin_method_qualifications(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Provider qualifications (method-specific)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_provider_qualifications (
  provider_qualification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL REFERENCES digital_twin_simulation_providers(provider_id) ON DELETE RESTRICT,
  method_id uuid NOT NULL REFERENCES digital_twin_simulation_methods(method_id) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'suspended', 'revoked', 'superseded')),
  auto_inherits_all_methods boolean NOT NULL DEFAULT false
    CONSTRAINT dt_pq_no_auto_inherit CHECK (auto_inherits_all_methods = false),
  fixture_qualification_only boolean NOT NULL DEFAULT true
    CONSTRAINT dt_pq_fixture_only CHECK (fixture_qualification_only = true),
  claims_native_solver boolean NOT NULL DEFAULT false
    CONSTRAINT dt_pq_no_native CHECK (claims_native_solver = false),
  external_solver_adapter_activated boolean NOT NULL DEFAULT false
    CONSTRAINT dt_pq_no_ext_solver CHECK (external_solver_adapter_activated = false),
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  superseded_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, provider_id, method_id, version)
);

CREATE INDEX IF NOT EXISTS idx_dt_provider_qual_ws
  ON digital_twin_provider_qualifications(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Application qualifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_application_qualifications (
  application_qualification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  method_id uuid NOT NULL REFERENCES digital_twin_simulation_methods(method_id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES digital_twin_simulation_providers(provider_id) ON DELETE RESTRICT,
  application_key text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  version integer NOT NULL DEFAULT 1 CHECK (version >= 1),
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'suspended', 'revoked', 'superseded')),
  claims_universal_accuracy boolean NOT NULL DEFAULT false
    CONSTRAINT dt_aq_no_universal CHECK (claims_universal_accuracy = false),
  engineering_approved boolean NOT NULL DEFAULT false
    CONSTRAINT dt_aq_no_eng_approval CHECK (engineering_approved = false),
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  superseded_by uuid,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, method_id, provider_id, application_key, version)
);

CREATE INDEX IF NOT EXISTS idx_dt_app_qual_ws
  ON digital_twin_application_qualifications(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- Execution qualifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_execution_qualifications (
  execution_qualification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  run_id uuid NOT NULL REFERENCES digital_twin_simulation_runs(run_id) ON DELETE RESTRICT,
  result_id uuid NOT NULL REFERENCES digital_twin_simulation_results(result_id) ON DELETE RESTRICT,
  method_qualification_id uuid NOT NULL REFERENCES digital_twin_method_qualifications(method_qualification_id) ON DELETE RESTRICT,
  provider_qualification_id uuid NOT NULL REFERENCES digital_twin_provider_qualifications(provider_qualification_id) ON DELETE RESTRICT,
  application_qualification_id uuid NOT NULL REFERENCES digital_twin_application_qualifications(application_qualification_id) ON DELETE RESTRICT,
  validation_id uuid NOT NULL REFERENCES digital_twin_simulation_validation(validation_id) ON DELETE RESTRICT,
  review_id uuid NOT NULL REFERENCES digital_twin_simulation_reviews(review_id) ON DELETE RESTRICT,
  package_id uuid,
  status text NOT NULL DEFAULT 'not_qualified'
    CHECK (status IN ('not_qualified', 'qualified', 'superseded', 'revoked')),
  engineering_approved boolean NOT NULL DEFAULT false
    CONSTRAINT dt_eq_no_eng_approval CHECK (engineering_approved = false),
  successful_run_implies_qualified boolean NOT NULL DEFAULT false
    CONSTRAINT dt_eq_no_auto_qualify CHECK (successful_run_implies_qualified = false),
  effective_from timestamptz NOT NULL DEFAULT now(),
  effective_to timestamptz,
  revoked_at timestamptz,
  superseded_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_dt_exec_qual_twin
  ON digital_twin_execution_qualifications(tenant_id, workspace_id, twin_id);

-- ---------------------------------------------------------------------------
-- Simulation packages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_packages (
  package_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id uuid NOT NULL REFERENCES digital_twin_identities(id) ON DELETE CASCADE,
  package_key text NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'assembled', 'sealed', 'superseded', 'archived')),
  method_id uuid NOT NULL REFERENCES digital_twin_simulation_methods(method_id) ON DELETE RESTRICT,
  provider_id uuid NOT NULL REFERENCES digital_twin_simulation_providers(provider_id) ON DELETE RESTRICT,
  application_key text,
  current_version integer NOT NULL DEFAULT 1 CHECK (current_version >= 1),
  claims_native_solver boolean NOT NULL DEFAULT false
    CONSTRAINT dt_pkg_no_native CHECK (claims_native_solver = false),
  stores_binary_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_pkg_no_binary CHECK (stores_binary_payload = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  UNIQUE (tenant_id, workspace_id, twin_id, package_key)
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_pkg_twin
  ON digital_twin_simulation_packages(tenant_id, workspace_id, twin_id);

ALTER TABLE digital_twin_execution_qualifications
  ADD CONSTRAINT dt_eq_package_fk
  FOREIGN KEY (package_id) REFERENCES digital_twin_simulation_packages(package_id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- Package versions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_package_versions (
  package_version_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES digital_twin_simulation_packages(package_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version >= 1),
  manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  manifest_hash text,
  sealed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, version)
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_pkg_ver
  ON digital_twin_simulation_package_versions(package_id);

-- ---------------------------------------------------------------------------
-- Package artifacts (Platform Files refs only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_package_artifacts (
  artifact_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES digital_twin_simulation_packages(package_id) ON DELETE CASCADE,
  package_version_id uuid NOT NULL REFERENCES digital_twin_simulation_package_versions(package_version_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  artifact_class text NOT NULL,
  file_id text NOT NULL,
  content_hash text NOT NULL,
  label text,
  stores_binary_payload boolean NOT NULL DEFAULT false
    CONSTRAINT dt_pkg_art_no_binary CHECK (stores_binary_payload = false),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_pkg_art
  ON digital_twin_simulation_package_artifacts(package_id, package_version_id);

-- ---------------------------------------------------------------------------
-- Package integrity
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_package_integrity (
  integrity_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES digital_twin_simulation_packages(package_id) ON DELETE CASCADE,
  package_version_id uuid NOT NULL REFERENCES digital_twin_simulation_package_versions(package_version_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  expected_manifest_hash text NOT NULL,
  observed_manifest_hash text NOT NULL,
  hash_mismatch boolean NOT NULL DEFAULT false,
  checked_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_pkg_integrity
  ON digital_twin_simulation_package_integrity(package_id);

-- ---------------------------------------------------------------------------
-- Reproducibility
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS digital_twin_simulation_reproducibility (
  reproducibility_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES digital_twin_simulation_packages(package_id) ON DELETE CASCADE,
  package_version_id uuid NOT NULL REFERENCES digital_twin_simulation_package_versions(package_version_id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  run_id uuid REFERENCES digital_twin_simulation_runs(run_id) ON DELETE SET NULL,
  outcome text NOT NULL
    CHECK (outcome IN (
      'reproducible_within_bounds', 'conditionally_reproducible',
      'not_reproducible', 'insufficient_evidence', 'unknown'
    )),
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
  environment_id text,
  manifest_hash text,
  claims_bit_exact_universal boolean NOT NULL DEFAULT false
    CONSTRAINT dt_repro_no_universal CHECK (claims_bit_exact_universal = false),
  assessed_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_dt_sim_repro
  ON digital_twin_simulation_reproducibility(package_id);

-- ---------------------------------------------------------------------------
-- Outbox event type extension (assurance lifecycle)
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
    'engineering.digital_twin.simulation.eligibility.assessed'
  ));

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE digital_twin_method_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_provider_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_application_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_execution_qualifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_package_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_package_artifacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_package_integrity ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_simulation_reproducibility ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'digital_twin_method_qualifications',
    'digital_twin_provider_qualifications',
    'digital_twin_application_qualifications',
    'digital_twin_execution_qualifications',
    'digital_twin_simulation_packages',
    'digital_twin_simulation_package_versions',
    'digital_twin_simulation_package_artifacts',
    'digital_twin_simulation_package_integrity',
    'digital_twin_simulation_reproducibility'
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

COMMENT ON TABLE digital_twin_method_qualifications IS
  'Phase 12H method qualification — fixture only; registered ≠ qualified.';
COMMENT ON TABLE digital_twin_provider_qualifications IS
  'Phase 12H provider qualification — method-specific; no auto-inherit; no external solvers.';
COMMENT ON TABLE digital_twin_application_qualifications IS
  'Phase 12H application qualification — context-bounded; not universally accurate.';
COMMENT ON TABLE digital_twin_execution_qualifications IS
  'Phase 12H execution qualification — no auto engineering approval.';
COMMENT ON TABLE digital_twin_simulation_packages IS
  'Phase 12H TwinSimulationPackage — Platform Files refs only; no binaries.';
COMMENT ON TABLE digital_twin_simulation_reproducibility IS
  'Phase 12H reproducibility assessment — not bit-exact universal claims.';
