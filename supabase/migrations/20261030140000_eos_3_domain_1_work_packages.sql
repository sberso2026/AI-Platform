-- EOS-3-DOMAIN-1 Work Package execution model.
-- Additive. Preserves existing projects without Work Packages.
-- Does not mutate frozen EOS2/EOS3 GA evidence tables.
-- Rollback: DROP association/dependency tables then work_packages; restore prior object_type CHECK via recreate.

-- Extend canonical object CHECK to allow WorkPackage (compatible identity; WP also has dedicated table).
ALTER TABLE eos3_objects DROP CONSTRAINT IF EXISTS eos3_objects_object_type_check;
ALTER TABLE eos3_objects ADD CONSTRAINT eos3_objects_object_type_check CHECK (object_type IN (
  'Project','WorkPackage','EngineeringBasis','Requirement','System','DisciplineObject','Revision',
  'Interface','Change','Impact','Decision','Assumption','Calculation','Review','Evidence',
  'Deliverable','Baseline','Asset','Inspection','OptimizationRun'
));

CREATE TABLE IF NOT EXISTS eos3_work_packages (
  id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stable_id                     TEXT NOT NULL,
  tenant_id                     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id                  UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                    TEXT NOT NULL,
  title                         TEXT NOT NULL,
  description                   TEXT NOT NULL DEFAULT '',
  work_type                     TEXT,
  engineering_pattern_ref       TEXT,
  status                        TEXT NOT NULL DEFAULT 'ACTIVE'
                                CHECK (status IN ('ACTIVE','ON_HOLD','CLOSED')),
  maturity                      TEXT NOT NULL DEFAULT 'Initiation',
  owner_id                      TEXT,
  owner_name                    TEXT,
  responsible_engineering_lead  TEXT,
  initiating_discipline         TEXT,
  lead_discipline               TEXT,
  participating_disciplines     JSONB NOT NULL DEFAULT '[]'::jsonb,
  reviewing_disciplines         JSONB NOT NULL DEFAULT '[]'::jsonb,
  approving_authority_refs      JSONB NOT NULL DEFAULT '[]'::jsonb,
  affected_assets               JSONB NOT NULL DEFAULT '[]'::jsonb,
  start_date                    DATE,
  target_date                   DATE,
  priority                      TEXT NOT NULL DEFAULT 'medium'
                                CHECK (priority IN ('low','medium','high')),
  risk_state                    TEXT NOT NULL DEFAULT 'UNKNOWN'
                                CHECK (risk_state IN ('UNKNOWN','LOW','MEDIUM','HIGH')),
  active                        BOOLEAN NOT NULL DEFAULT TRUE,
  revision                      TEXT NOT NULL DEFAULT 'A',
  provenance                    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, stable_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_wp_ws_project
  ON eos3_work_packages (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS eos3_work_packages_updated_at ON eos3_work_packages;
CREATE TRIGGER eos3_work_packages_updated_at
  BEFORE UPDATE ON eos3_work_packages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_work_packages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_wp_select ON eos3_work_packages;
CREATE POLICY eos3_wp_select ON eos3_work_packages
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wp_insert ON eos3_work_packages;
CREATE POLICY eos3_wp_insert ON eos3_work_packages
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wp_update ON eos3_work_packages;
CREATE POLICY eos3_wp_update ON eos3_work_packages
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wp_delete ON eos3_work_packages;
CREATE POLICY eos3_wp_delete ON eos3_work_packages
  FOR DELETE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_work_package_associations (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id           TEXT NOT NULL,
  work_package_id      UUID NOT NULL REFERENCES eos3_work_packages(id) ON DELETE CASCADE,
  object_type          TEXT NOT NULL,
  object_stable_id     TEXT NOT NULL,
  object_id            UUID,
  role                 TEXT NOT NULL DEFAULT 'PRIMARY_EXECUTION_CONTEXT'
                       CHECK (role IN (
                         'PRIMARY_EXECUTION_CONTEXT',
                         'RELATED_WORK_PACKAGE',
                         'AFFECTED_WORK_PACKAGE'
                       )),
  confirmation_state   TEXT NOT NULL DEFAULT 'PROPOSED'
                       CHECK (confirmation_state IN (
                         'PROPOSED','CONFIRMED','SUPERSEDED','STALE'
                       )),
  provenance           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (work_package_id, object_stable_id, role)
);

CREATE INDEX IF NOT EXISTS idx_eos3_wp_assoc_wp
  ON eos3_work_package_associations (work_package_id);

ALTER TABLE eos3_work_package_associations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_wp_assoc_select ON eos3_work_package_associations;
CREATE POLICY eos3_wp_assoc_select ON eos3_work_package_associations
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wp_assoc_write ON eos3_work_package_associations;
CREATE POLICY eos3_wp_assoc_write ON eos3_work_package_associations
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_work_package_dependencies (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id              UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id                TEXT NOT NULL,
  source_work_package_id    UUID NOT NULL REFERENCES eos3_work_packages(id) ON DELETE CASCADE,
  target_work_package_id    UUID NOT NULL REFERENCES eos3_work_packages(id) ON DELETE CASCADE,
  dependency_type           TEXT NOT NULL
                            CHECK (dependency_type IN ('REQUIRES','DEPENDS_ON','AFFECTS')),
  status                    TEXT NOT NULL DEFAULT 'ACTIVE'
                            CHECK (status IN ('ACTIVE','RESOLVED','CANCELLED')),
  provenance                JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_work_package_id <> target_work_package_id)
);

CREATE INDEX IF NOT EXISTS idx_eos3_wp_dep_project
  ON eos3_work_package_dependencies (tenant_id, workspace_id, project_id);

ALTER TABLE eos3_work_package_dependencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_wp_dep_select ON eos3_work_package_dependencies;
CREATE POLICY eos3_wp_dep_select ON eos3_work_package_dependencies
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_wp_dep_write ON eos3_work_package_dependencies;
CREATE POLICY eos3_wp_dep_write ON eos3_work_package_dependencies
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_work_packages IS
  'EOS DOMAIN-1: Work Package is engineering execution boundary beneath Project. Maturity is independent of project lifecycle.';
COMMENT ON TABLE eos3_work_package_associations IS
  'Associates existing canonical objects to Work Packages without duplicating object rows. Roles: PRIMARY_EXECUTION_CONTEXT | RELATED_WORK_PACKAGE | AFFECTED_WORK_PACKAGE.';
COMMENT ON TABLE eos3_work_package_dependencies IS
  'Bounded WP dependency foundation (REQUIRES / DEPENDS_ON / AFFECTS). Full graph reasoning is DOMAIN-3.';
