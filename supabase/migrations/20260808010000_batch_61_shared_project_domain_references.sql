-- Phase 11B — Engineering Shared Project Domain reference tables (batch_61)
--
-- Identity only. These tables extend the canonical project hierarchy owned by
-- the Engineering Shared Project Domain. `engineering_projects` (batch_20)
-- remains the physical store for project identity and is NOT modified here.
--
-- Nothing in this batch stores intelligence: no progress, no percent complete,
-- no cost, no earned value, no dates derived by scheduling. Consuming modules
-- (Project Controls, Project Intelligence) reference these ids and keep their
-- own advisory records in their own tables.
--
-- Additive only; do not rewrite batch_20.

-- ---------------------------------------------------------------------------
-- Project phases (reference)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_project_phases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'active', 'on_hold', 'complete', 'cancelled')),
  sequence integer,
  parent_phase_id uuid REFERENCES engineering_project_phases(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  identity_owner text NOT NULL DEFAULT 'engineering_os_shared_project_domain'
    CHECK (identity_owner = 'engineering_os_shared_project_domain'),
  contains_progress_measurement boolean NOT NULL DEFAULT false
    CHECK (contains_progress_measurement = false),
  contains_earned_value boolean NOT NULL DEFAULT false
    CHECK (contains_earned_value = false),
  UNIQUE (tenant_id, project_id, code)
);

CREATE INDEX IF NOT EXISTS idx_eng_project_phases_project
  ON engineering_project_phases(tenant_id, project_id, sequence);
CREATE INDEX IF NOT EXISTS idx_eng_project_phases_workspace
  ON engineering_project_phases(tenant_id, workspace_id);

-- ---------------------------------------------------------------------------
-- WBS nodes (reference)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_wbs_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft', 'active', 'superseded', 'archived')),
  level integer,
  parent_wbs_node_id uuid REFERENCES engineering_wbs_nodes(id) ON DELETE SET NULL,
  path text,
  phase_id uuid REFERENCES engineering_project_phases(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  identity_owner text NOT NULL DEFAULT 'engineering_os_shared_project_domain'
    CHECK (identity_owner = 'engineering_os_shared_project_domain'),
  contains_progress_measurement boolean NOT NULL DEFAULT false
    CHECK (contains_progress_measurement = false),
  contains_cost_data boolean NOT NULL DEFAULT false
    CHECK (contains_cost_data = false),
  UNIQUE (tenant_id, project_id, code)
);

CREATE INDEX IF NOT EXISTS idx_eng_wbs_nodes_project
  ON engineering_wbs_nodes(tenant_id, project_id, code);
CREATE INDEX IF NOT EXISTS idx_eng_wbs_nodes_parent
  ON engineering_wbs_nodes(parent_wbs_node_id);

-- ---------------------------------------------------------------------------
-- Work packages (reference)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_work_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  wbs_node_id uuid REFERENCES engineering_wbs_nodes(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'released', 'in_progress', 'complete', 'cancelled')),
  discipline_key text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  identity_owner text NOT NULL DEFAULT 'engineering_os_shared_project_domain'
    CHECK (identity_owner = 'engineering_os_shared_project_domain'),
  contains_progress_measurement boolean NOT NULL DEFAULT false
    CHECK (contains_progress_measurement = false),
  contains_cost_data boolean NOT NULL DEFAULT false
    CHECK (contains_cost_data = false),
  UNIQUE (tenant_id, project_id, code)
);

CREATE INDEX IF NOT EXISTS idx_eng_work_packages_project
  ON engineering_work_packages(tenant_id, project_id, code);
CREATE INDEX IF NOT EXISTS idx_eng_work_packages_wbs
  ON engineering_work_packages(wbs_node_id);

-- ---------------------------------------------------------------------------
-- Activities (reference)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  work_package_id uuid REFERENCES engineering_work_packages(id) ON DELETE SET NULL,
  wbs_node_id uuid REFERENCES engineering_wbs_nodes(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'released', 'in_progress', 'complete', 'cancelled')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  identity_owner text NOT NULL DEFAULT 'engineering_os_shared_project_domain'
    CHECK (identity_owner = 'engineering_os_shared_project_domain'),
  -- Identity does not schedule. No computed dates, no float, no CPM.
  contains_computed_schedule boolean NOT NULL DEFAULT false
    CHECK (contains_computed_schedule = false),
  contains_progress_measurement boolean NOT NULL DEFAULT false
    CHECK (contains_progress_measurement = false),
  UNIQUE (tenant_id, project_id, code)
);

CREATE INDEX IF NOT EXISTS idx_eng_activities_project
  ON engineering_activities(tenant_id, project_id, code);
CREATE INDEX IF NOT EXISTS idx_eng_activities_work_package
  ON engineering_activities(work_package_id);

-- ---------------------------------------------------------------------------
-- Milestones (reference)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS engineering_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES engineering_projects(id) ON DELETE CASCADE,
  phase_id uuid REFERENCES engineering_project_phases(id) ON DELETE SET NULL,
  code text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'achieved', 'missed', 'cancelled')),
  -- Declared contractual/target date only; never a scheduling engine output.
  target_date date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  identity_owner text NOT NULL DEFAULT 'engineering_os_shared_project_domain'
    CHECK (identity_owner = 'engineering_os_shared_project_domain'),
  contains_computed_schedule boolean NOT NULL DEFAULT false
    CHECK (contains_computed_schedule = false),
  contains_earned_value boolean NOT NULL DEFAULT false
    CHECK (contains_earned_value = false),
  UNIQUE (tenant_id, project_id, code)
);

CREATE INDEX IF NOT EXISTS idx_eng_milestones_project
  ON engineering_milestones(tenant_id, project_id, code);
CREATE INDEX IF NOT EXISTS idx_eng_milestones_phase
  ON engineering_milestones(phase_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'engineering_project_phases',
    'engineering_wbs_nodes',
    'engineering_work_packages',
    'engineering_activities',
    'engineering_milestones'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_trigger WHERE tgname = t || '_updated_at'
    ) THEN
      EXECUTE format(
        'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
        t || '_updated_at', t
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- RLS — mirrors engineering_projects (get_user_tenant_ids + has_permission)
-- ---------------------------------------------------------------------------
ALTER TABLE engineering_project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_wbs_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_work_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE engineering_milestones ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'engineering_project_phases',
    'engineering_wbs_nodes',
    'engineering_work_packages',
    'engineering_activities',
    'engineering_milestones'
  ]
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I', t || '_select', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()))',
      t || '_select', t
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I', t || '_insert', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR INSERT WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND has_permission(''engineering'', ''execute'', tenant_id)
       )',
      t || '_insert', t
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I', t || '_update', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR UPDATE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND has_permission(''engineering'', ''execute'', tenant_id)
       ) WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND has_permission(''engineering'', ''execute'', tenant_id)
       )',
      t || '_update', t
    );
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I', t || '_delete', t
    );
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (has_permission(''engineering'', ''admin'', tenant_id))',
      t || '_delete', t
    );
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);
  END LOOP;
END $$;

COMMENT ON TABLE engineering_project_phases IS
  'Engineering Shared Project Domain phase references. Identity only — no progress, cost or earned value.';
COMMENT ON TABLE engineering_wbs_nodes IS
  'Engineering Shared Project Domain WBS references. Identity only — consuming modules hold their own intelligence.';
COMMENT ON TABLE engineering_work_packages IS
  'Engineering Shared Project Domain work package references. Identity only — no progress measurement.';
COMMENT ON TABLE engineering_activities IS
  'Engineering Shared Project Domain activity references. Identity only — no CPM, float or computed dates.';
COMMENT ON TABLE engineering_milestones IS
  'Engineering Shared Project Domain milestone references. target_date is a declared date, never a scheduling output.';
