-- EOS-A5 — Engineering Optimization Core
-- Additive. Distinct bounded context. Does not rewrite A2–A4 objects.
-- Does not add Value Intelligence, Structural solvers, a new job queue, or a graph store.
-- Does not add selected_optimization_alternative_id to engineering_decisions.
-- Execution composes existing background_jobs / engineering_execution_hosts.

-- ─── Governed taxonomy: SCOPED_TO, CONSTRAINED_BY ────────────────────────────

ALTER TABLE engineering_object_links
  DROP CONSTRAINT IF EXISTS eng_obj_links_governed_taxonomy;

ALTER TABLE engineering_object_links
  ADD CONSTRAINT eng_obj_links_governed_taxonomy CHECK (
    relationship_governed = FALSE
    OR relationship IN (
      'CONTAINS', 'USES', 'DEPENDS_ON', 'ALLOCATED_TO', 'VERIFIED_BY',
      'USED_BY', 'CONNECTS', 'AFFECTS', 'CAUSED_BY', 'SELECTS',
      'SUPPORTED_BY', 'BASED_ON', 'REVIEWS', 'FOUND_IN', 'RESOLVES',
      'BASELINES', 'SUPERSEDES', 'MAPPED_TO', 'REPRESENTED_BY',
      'SCOPED_TO', 'CONSTRAINED_BY'
    )
  );

-- ─── Studies ─────────────────────────────────────────────────────────────────

CREATE TABLE engineering_optimization_studies (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                  UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id               UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                 UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_code                 TEXT NOT NULL,
  title                      TEXT NOT NULL,
  description                TEXT,
  lifecycle_stage            TEXT NOT NULL CHECK (lifecycle_stage IN (
    'CONCEPT', 'PREFEASIBILITY', 'FEASIBILITY', 'FEED', 'DETAILED_DESIGN',
    'CONSTRUCTION', 'COMMISSIONING', 'OPERATIONS', 'MODIFICATION'
  )),
  configuration_baseline_id  UUID REFERENCES engineering_configuration_baselines(id) ON DELETE RESTRICT,
  decision_id                UUID REFERENCES engineering_decisions(id) ON DELETE RESTRICT,
  requirements_context       TEXT NOT NULL DEFAULT 'UNDECLARED' CHECK (requirements_context IN (
    'UNDECLARED', 'DECLARED', 'NONE_APPLICABLE'
  )),
  assumptions_context        TEXT NOT NULL DEFAULT 'UNDECLARED' CHECK (assumptions_context IN (
    'UNDECLARED', 'DECLARED', 'NONE_MATERIAL'
  )),
  interfaces_context         TEXT NOT NULL DEFAULT 'UNDECLARED' CHECK (interfaces_context IN (
    'UNDECLARED', 'DECLARED', 'NONE_APPLICABLE'
  )),
  status                     TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'defined', 'ready', 'running', 'evaluated',
    'reviewed', 'closed', 'superseded', 'cancelled'
  )),
  owner_id                   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_by                 UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata                   JSONB NOT NULL DEFAULT '{}',
  UNIQUE (tenant_id, workspace_id, study_code)
);

CREATE INDEX idx_eng_opt_studies_ws ON engineering_optimization_studies(tenant_id, workspace_id, study_code);
CREATE INDEX idx_eng_opt_studies_project ON engineering_optimization_studies(project_id);
CREATE INDEX idx_eng_opt_studies_status ON engineering_optimization_studies(tenant_id, status);
CREATE INDEX idx_eng_opt_studies_baseline ON engineering_optimization_studies(configuration_baseline_id);
CREATE INDEX idx_eng_opt_studies_decision ON engineering_optimization_studies(decision_id);

CREATE TRIGGER engineering_optimization_studies_updated_at
  BEFORE UPDATE ON engineering_optimization_studies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_optimization_studies IS
  'EOS-A5 Optimization Study. Advisory alternatives/trade-offs. Not Decision authority. Not Value Intelligence.';

-- ─── Objectives ──────────────────────────────────────────────────────────────

CREATE TABLE engineering_optimization_objectives (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id        UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  objective_code  TEXT NOT NULL,
  name            TEXT NOT NULL,
  metric_key      TEXT NOT NULL,
  direction       TEXT NOT NULL CHECK (direction IN ('MINIMIZE', 'MAXIMIZE', 'TARGET')),
  target_value    NUMERIC,
  unit            TEXT,
  priority        INTEGER,
  weight          NUMERIC,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (study_id, objective_code)
);

CREATE INDEX idx_eng_opt_objectives_study ON engineering_optimization_objectives(study_id);

CREATE TRIGGER engineering_optimization_objectives_updated_at
  BEFORE UPDATE ON engineering_optimization_objectives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Constraints ─────────────────────────────────────────────────────────────

CREATE TABLE engineering_optimization_constraints (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id        UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id          UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  constraint_code   TEXT NOT NULL,
  name              TEXT NOT NULL,
  constraint_kind   TEXT NOT NULL CHECK (constraint_kind IN (
    'REQUIREMENT', 'INTERFACE', 'ASSUMPTION', 'RULE', 'ANALYSIS_LIMIT', 'DESIGN_CRITERION'
  )),
  metric_key        TEXT NOT NULL,
  operator          TEXT CHECK (operator IS NULL OR operator IN ('<=', '>=', '=', '<', '>')),
  threshold_value   NUMERIC,
  unit              TEXT,
  hardness          TEXT NOT NULL DEFAULT 'HARD' CHECK (hardness IN ('HARD', 'SOFT')),
  source_object_type TEXT,
  source_object_id  UUID,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (study_id, constraint_code)
);

CREATE INDEX idx_eng_opt_constraints_study ON engineering_optimization_constraints(study_id);

CREATE TRIGGER engineering_optimization_constraints_updated_at
  BEFORE UPDATE ON engineering_optimization_constraints
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON COLUMN engineering_optimization_constraints.operator IS
  'Structured comparison only. Arbitrary SQL/code expressions are forbidden.';

-- ─── Design variables ────────────────────────────────────────────────────────

CREATE TABLE engineering_optimization_design_variables (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id        UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id          UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  variable_code     TEXT NOT NULL,
  name              TEXT NOT NULL,
  variable_type     TEXT NOT NULL CHECK (variable_type IN (
    'CONTINUOUS', 'INTEGER', 'DISCRETE', 'CATEGORICAL', 'BOOLEAN'
  )),
  unit              TEXT,
  lower_bound       NUMERIC,
  upper_bound       NUMERIC,
  allowed_values    JSONB,
  default_value     TEXT,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (study_id, variable_code),
  CONSTRAINT engineering_optimization_design_variables_allowed_values_array
    CHECK (allowed_values IS NULL OR jsonb_typeof(allowed_values) = 'array')
);

CREATE INDEX idx_eng_opt_variables_study ON engineering_optimization_design_variables(study_id);

CREATE TRIGGER engineering_optimization_design_variables_updated_at
  BEFORE UPDATE ON engineering_optimization_design_variables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Scenarios ───────────────────────────────────────────────────────────────

CREATE TABLE engineering_optimization_scenarios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id        UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  scenario_code   TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (study_id, scenario_code)
);

CREATE INDEX idx_eng_opt_scenarios_study ON engineering_optimization_scenarios(study_id);

CREATE TRIGGER engineering_optimization_scenarios_updated_at
  BEFORE UPDATE ON engineering_optimization_scenarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_optimization_scenarios IS
  'EOS-A5 deterministic engineering conditions. Not Monte Carlo / uncertainty simulation.';

-- ─── Alternatives ────────────────────────────────────────────────────────────

CREATE TABLE engineering_optimization_alternatives (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id                  UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  alternative_code          TEXT NOT NULL,
  name                      TEXT NOT NULL,
  description               TEXT,
  status                    TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'active', 'withdrawn', 'evaluated'
  )),
  decision_alternative_id   UUID REFERENCES engineering_decision_alternatives(id) ON DELETE SET NULL,
  created_by                UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (study_id, alternative_code)
);

CREATE INDEX idx_eng_opt_alternatives_study ON engineering_optimization_alternatives(study_id);
CREATE INDEX idx_eng_opt_alternatives_decision_alt ON engineering_optimization_alternatives(decision_alternative_id);

CREATE TRIGGER engineering_optimization_alternatives_updated_at
  BEFORE UPDATE ON engineering_optimization_alternatives
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

COMMENT ON TABLE engineering_optimization_alternatives IS
  'Technical candidate evaluated by Optimization. Distinct from engineering_decision_alternatives. Mapping is optional.';

CREATE TABLE engineering_optimization_alternative_values (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id        UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  alternative_id  UUID NOT NULL REFERENCES engineering_optimization_alternatives(id) ON DELETE CASCADE,
  variable_id     UUID NOT NULL REFERENCES engineering_optimization_design_variables(id) ON DELETE CASCADE,
  numeric_value   NUMERIC,
  text_value      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (alternative_id, variable_id)
);

CREATE INDEX idx_eng_opt_alt_values_alt ON engineering_optimization_alternative_values(alternative_id);

-- ─── Runs ────────────────────────────────────────────────────────────────────

CREATE TABLE engineering_optimization_runs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id                UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  alternative_id          UUID NOT NULL REFERENCES engineering_optimization_alternatives(id) ON DELETE RESTRICT,
  scenario_id             UUID REFERENCES engineering_optimization_scenarios(id) ON DELETE RESTRICT,
  status                  TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'running', 'succeeded', 'failed', 'cancelled'
  )),
  configuration_baseline_id UUID NOT NULL REFERENCES engineering_configuration_baselines(id) ON DELETE RESTRICT,
  baseline_fingerprint    TEXT NOT NULL,
  execution_ref           TEXT,
  analysis_engine         TEXT,
  adapter_id              TEXT,
  adapter_version         TEXT,
  algorithm_id            TEXT,
  algorithm_version       TEXT,
  random_seed             TEXT,
  failure_reason          TEXT,
  queued_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at              TIMESTAMPTZ,
  completed_at            TIMESTAMPTZ,
  created_by              UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eng_opt_runs_study ON engineering_optimization_runs(study_id, status);
CREATE INDEX idx_eng_opt_runs_alt ON engineering_optimization_runs(alternative_id);
CREATE INDEX idx_eng_opt_runs_baseline ON engineering_optimization_runs(configuration_baseline_id);
CREATE INDEX idx_eng_opt_runs_fingerprint ON engineering_optimization_runs(baseline_fingerprint);

CREATE TRIGGER engineering_optimization_runs_updated_at
  BEFORE UPDATE ON engineering_optimization_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE engineering_optimization_run_inputs (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id                UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  run_id                  UUID NOT NULL REFERENCES engineering_optimization_runs(id) ON DELETE RESTRICT,
  configuration_item_id   UUID NOT NULL REFERENCES engineering_configuration_items(id) ON DELETE RESTRICT,
  object_type             TEXT NOT NULL,
  object_id               UUID NOT NULL,
  revision_ref            TEXT,
  object_code_snapshot    TEXT,
  object_title_snapshot   TEXT,
  effective_state         TEXT,
  artifact_ref            TEXT,
  artifact_hash           TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, configuration_item_id)
);

CREATE INDEX idx_eng_opt_run_inputs_run ON engineering_optimization_run_inputs(run_id);

COMMENT ON TABLE engineering_optimization_run_inputs IS
  'Pinned Configuration Item snapshots at run creation. Historical evaluation must not reread live Core rows.';

CREATE TABLE engineering_optimization_result_metrics (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id      UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id        UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  run_id          UUID NOT NULL REFERENCES engineering_optimization_runs(id) ON DELETE RESTRICT,
  metric_key      TEXT NOT NULL,
  value           NUMERIC NOT NULL,
  unit            TEXT,
  objective_id    UUID REFERENCES engineering_optimization_objectives(id) ON DELETE SET NULL,
  source_kind     TEXT NOT NULL CHECK (source_kind IN ('MANUAL', 'EXECUTION_HOST', 'ADAPTER')),
  provenance      JSONB NOT NULL DEFAULT '{}',
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, metric_key)
);

CREATE INDEX idx_eng_opt_metrics_run ON engineering_optimization_result_metrics(run_id);

CREATE TABLE engineering_optimization_constraint_evaluations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id        UUID REFERENCES engineering_projects(id) ON DELETE RESTRICT,
  study_id          UUID NOT NULL REFERENCES engineering_optimization_studies(id) ON DELETE CASCADE,
  run_id            UUID NOT NULL REFERENCES engineering_optimization_runs(id) ON DELETE RESTRICT,
  constraint_id     UUID NOT NULL REFERENCES engineering_optimization_constraints(id) ON DELETE RESTRICT,
  evaluated_value   NUMERIC,
  passed            BOOLEAN NOT NULL,
  margin            NUMERIC,
  evidence          TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, constraint_id)
);

CREATE INDEX idx_eng_opt_ceval_run ON engineering_optimization_constraint_evaluations(run_id);

-- ─── Child scope inheritance ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION engineering_optimization_copy_study_scope()
RETURNS TRIGGER AS $$
DECLARE
  parent RECORD;
BEGIN
  SELECT tenant_id, workspace_id, project_id
    INTO parent
    FROM engineering_optimization_studies
   WHERE id = NEW.study_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'optimization study parent not found';
  END IF;
  NEW.tenant_id := parent.tenant_id;
  NEW.workspace_id := parent.workspace_id;
  NEW.project_id := parent.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_optimization_copy_run_scope()
RETURNS TRIGGER AS $$
DECLARE
  parent RECORD;
BEGIN
  SELECT tenant_id, workspace_id, project_id, study_id
    INTO parent
    FROM engineering_optimization_runs
   WHERE id = NEW.run_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'optimization run parent not found';
  END IF;
  NEW.tenant_id := parent.tenant_id;
  NEW.workspace_id := parent.workspace_id;
  NEW.project_id := parent.project_id;
  NEW.study_id := parent.study_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_optimization_objectives_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_objectives
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_study_scope();
CREATE TRIGGER engineering_optimization_constraints_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_constraints
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_study_scope();
CREATE TRIGGER engineering_optimization_design_variables_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_design_variables
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_study_scope();
CREATE TRIGGER engineering_optimization_scenarios_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_scenarios
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_study_scope();
CREATE TRIGGER engineering_optimization_alternatives_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_alternatives
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_study_scope();
CREATE TRIGGER engineering_optimization_alternative_values_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_alternative_values
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_study_scope();
CREATE TRIGGER engineering_optimization_runs_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_runs
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_study_scope();
CREATE TRIGGER engineering_optimization_run_inputs_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_run_inputs
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_run_scope();
CREATE TRIGGER engineering_optimization_result_metrics_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_result_metrics
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_run_scope();
CREATE TRIGGER engineering_optimization_constraint_evaluations_scope
  BEFORE INSERT OR UPDATE ON engineering_optimization_constraint_evaluations
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_copy_run_scope();

-- ─── Workspace/tenant + ownership immutability ───────────────────────────────

CREATE TRIGGER engineering_optimization_studies_workspace_tenant
  BEFORE INSERT OR UPDATE ON engineering_optimization_studies
  FOR EACH ROW EXECUTE FUNCTION engineering_core_workspace_matches_tenant();
CREATE TRIGGER engineering_optimization_studies_ownership_immutable
  BEFORE UPDATE ON engineering_optimization_studies
  FOR EACH ROW EXECUTE FUNCTION engineering_core_prevent_ownership_mutation();

-- ─── READY requires frozen baseline ──────────────────────────────────────────

CREATE OR REPLACE FUNCTION engineering_optimization_study_context_guard()
RETURNS TRIGGER AS $$
DECLARE
  related_ws UUID;
  related_tenant UUID;
BEGIN
  IF NEW.configuration_baseline_id IS NOT NULL THEN
    SELECT workspace_id, tenant_id INTO related_ws, related_tenant
      FROM engineering_configuration_baselines
     WHERE id = NEW.configuration_baseline_id;
    IF related_ws IS DISTINCT FROM NEW.workspace_id OR related_tenant IS DISTINCT FROM NEW.tenant_id THEN
      RAISE EXCEPTION 'optimization study baseline must belong to the same tenant and workspace';
    END IF;
  END IF;
  IF NEW.decision_id IS NOT NULL THEN
    SELECT workspace_id, tenant_id INTO related_ws, related_tenant
      FROM engineering_decisions
     WHERE id = NEW.decision_id;
    IF related_ws IS DISTINCT FROM NEW.workspace_id OR related_tenant IS DISTINCT FROM NEW.tenant_id THEN
      RAISE EXCEPTION 'optimization study decision must belong to the same tenant and workspace';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_optimization_studies_context_guard
  BEFORE INSERT OR UPDATE ON engineering_optimization_studies
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_study_context_guard();

CREATE OR REPLACE FUNCTION engineering_optimization_study_ready_guard()
RETURNS TRIGGER AS $$
DECLARE
  baseline_status TEXT;
  baseline_ws UUID;
  baseline_tenant UUID;
BEGIN
  IF NEW.status IN ('ready', 'running') THEN
    IF NEW.configuration_baseline_id IS NULL THEN
      RAISE EXCEPTION 'READY optimization study requires a frozen configuration baseline';
    END IF;
    IF NEW.decision_id IS NULL THEN
      RAISE EXCEPTION 'READY optimization study requires a decision context';
    END IF;
    SELECT status, workspace_id, tenant_id
      INTO baseline_status, baseline_ws, baseline_tenant
      FROM engineering_configuration_baselines
     WHERE id = NEW.configuration_baseline_id;
    IF baseline_status IS DISTINCT FROM 'frozen' THEN
      RAISE EXCEPTION 'optimization study baseline must be frozen; draft baselines cannot execute';
    END IF;
    IF baseline_ws IS DISTINCT FROM NEW.workspace_id OR baseline_tenant IS DISTINCT FROM NEW.tenant_id THEN
      RAISE EXCEPTION 'optimization study baseline must belong to the same tenant and workspace';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_optimization_studies_ready_guard
  BEFORE INSERT OR UPDATE ON engineering_optimization_studies
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_study_ready_guard();

-- ─── Completed run immutability ──────────────────────────────────────────────

CREATE OR REPLACE FUNCTION engineering_optimization_run_immutable()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    IF OLD.status = 'succeeded' THEN
      RAISE EXCEPTION 'succeeded optimization run evidence cannot be deleted';
    END IF;
    RETURN OLD;
  END IF;
  IF OLD.status = 'succeeded' THEN
    IF NEW.baseline_fingerprint IS DISTINCT FROM OLD.baseline_fingerprint
       OR NEW.configuration_baseline_id IS DISTINCT FROM OLD.configuration_baseline_id
       OR NEW.alternative_id IS DISTINCT FROM OLD.alternative_id
       OR NEW.analysis_engine IS DISTINCT FROM OLD.analysis_engine
       OR NEW.adapter_id IS DISTINCT FROM OLD.adapter_id
       OR NEW.adapter_version IS DISTINCT FROM OLD.adapter_version
       OR NEW.status IS DISTINCT FROM OLD.status THEN
      RAISE EXCEPTION 'succeeded optimization run evidence is immutable; create a new run';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_optimization_runs_immutable
  BEFORE UPDATE OR DELETE ON engineering_optimization_runs
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_run_immutable();

CREATE OR REPLACE FUNCTION engineering_optimization_result_immutable()
RETURNS TRIGGER AS $$
DECLARE
  run_status TEXT;
  run_id UUID;
BEGIN
  run_id := COALESCE(NEW.run_id, OLD.run_id);
  SELECT status INTO run_status FROM engineering_optimization_runs WHERE id = run_id;
  IF run_status = 'succeeded' AND TG_OP IN ('UPDATE', 'DELETE') THEN
    RAISE EXCEPTION 'succeeded optimization run results are immutable';
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE TRIGGER engineering_optimization_result_metrics_immutable
  BEFORE UPDATE OR DELETE ON engineering_optimization_result_metrics
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_result_immutable();
CREATE TRIGGER engineering_optimization_constraint_evaluations_immutable
  BEFORE UPDATE OR DELETE ON engineering_optimization_constraint_evaluations
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_result_immutable();
CREATE TRIGGER engineering_optimization_run_inputs_immutable
  BEFORE UPDATE OR DELETE ON engineering_optimization_run_inputs
  FOR EACH ROW EXECUTE FUNCTION engineering_optimization_result_immutable();

-- ─── Resolve + endpoint allow-list ───────────────────────────────────────────

CREATE OR REPLACE FUNCTION engineering_object_link_resolve(p_type TEXT, p_id UUID)
RETURNS TABLE (tenant_id UUID, workspace_id UUID) AS $$
BEGIN
  CASE p_type
    WHEN 'decision' THEN
      RETURN QUERY SELECT d.tenant_id, d.workspace_id FROM engineering_decisions d WHERE d.id = p_id;
    WHEN 'assumption' THEN
      RETURN QUERY SELECT a.tenant_id, a.workspace_id FROM engineering_assumptions a WHERE a.id = p_id;
    WHEN 'document' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_documents x WHERE x.id = p_id;
    WHEN 'risk' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_risks x WHERE x.id = p_id;
    WHEN 'project' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_projects x WHERE x.id = p_id;
    WHEN 'asset' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_assets x WHERE x.id = p_id;
    WHEN 'alternative' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_decision_alternatives x WHERE x.id = p_id;
    WHEN 'review_package' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_review_packages x WHERE x.id = p_id;
    WHEN 'review_evidence' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_review_evidence x WHERE x.id = p_id;
    WHEN 'system' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_systems x WHERE x.id = p_id;
    WHEN 'interface' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_interfaces x WHERE x.id = p_id;
    WHEN 'requirement' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_requirements x WHERE x.id = p_id;
    WHEN 'change' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_changes x WHERE x.id = p_id;
    WHEN 'impact' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_impacts x WHERE x.id = p_id;
    WHEN 'configuration_baseline' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_configuration_baselines x WHERE x.id = p_id;
    WHEN 'optimization_study' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_optimization_studies x WHERE x.id = p_id;
    WHEN 'optimization_run' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_optimization_runs x WHERE x.id = p_id;
    WHEN 'optimization_alternative' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_optimization_alternatives x WHERE x.id = p_id;
    WHEN 'optimization_constraint' THEN
      RETURN QUERY SELECT x.tenant_id, x.workspace_id FROM engineering_optimization_constraints x WHERE x.id = p_id;
    ELSE
      RETURN;
  END CASE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION engineering_core_link_endpoint_allowed(p_type TEXT, p_id UUID)
RETURNS BOOLEAN AS $$
  SELECT CASE
    WHEN p_type IN (
      'decision', 'assumption', 'document', 'risk', 'project', 'asset',
      'alternative', 'review_package', 'review_evidence', 'system', 'interface',
      'requirement', 'change', 'impact', 'configuration_baseline',
      'optimization_study', 'optimization_run', 'optimization_alternative', 'optimization_constraint'
    ) THEN EXISTS (
      SELECT 1
      FROM engineering_object_link_resolve(p_type, p_id) r
      WHERE engineering_core_workspace_member(r.workspace_id)
    )
    ELSE TRUE
  END;
$$ LANGUAGE sql STABLE SECURITY INVOKER
SET search_path = public, pg_temp;

-- ─── RLS ─────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY[
    'engineering_optimization_studies',
    'engineering_optimization_objectives',
    'engineering_optimization_constraints',
    'engineering_optimization_design_variables',
    'engineering_optimization_scenarios',
    'engineering_optimization_alternatives',
    'engineering_optimization_alternative_values',
    'engineering_optimization_runs',
    'engineering_optimization_run_inputs',
    'engineering_optimization_result_metrics',
    'engineering_optimization_constraint_evaluations'
  ];
  short TEXT;
BEGIN
  FOREACH t IN ARRAY tables LOOP
    short := replace(t, 'engineering_', '');
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()) AND engineering_core_workspace_member(workspace_id))',
      'eng_' || short || '_select', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()) AND has_permission(''engineering'', ''execute'', tenant_id) AND engineering_core_workspace_member(workspace_id))',
      'eng_' || short || '_insert', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (tenant_id = ANY(get_user_tenant_ids()) AND has_permission(''engineering'', ''execute'', tenant_id) AND engineering_core_workspace_member(workspace_id)) WITH CHECK (tenant_id = ANY(get_user_tenant_ids()) AND has_permission(''engineering'', ''execute'', tenant_id) AND engineering_core_workspace_member(workspace_id))',
      'eng_' || short || '_update', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (has_permission(''engineering'', ''admin'', tenant_id) AND engineering_core_workspace_member(workspace_id))',
      'eng_' || short || '_delete', t
    );
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I TO anon, authenticated, service_role', t);
  END LOOP;
END $$;

GRANT EXECUTE ON FUNCTION engineering_optimization_copy_study_scope() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_optimization_copy_run_scope() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_optimization_study_context_guard() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_optimization_study_ready_guard() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_optimization_run_immutable() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_optimization_result_immutable() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_object_link_resolve(TEXT, UUID) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION engineering_core_link_endpoint_allowed(TEXT, UUID) TO anon, authenticated, service_role;
