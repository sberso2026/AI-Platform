-- EOS 3.2 canonical object + digital-thread foundation.
-- Additive. Does not mutate EOS 2 tables or EOS 3.1 foundation migration.
-- Apply only to authorized development/staging. Do not activate EOS 3 in Production.

CREATE TABLE IF NOT EXISTS eos3_objects (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id            UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id              TEXT NOT NULL,
  generation              INTEGER NOT NULL DEFAULT 3 CHECK (generation = 3),
  object_type             TEXT NOT NULL,
  stable_object_id        TEXT NOT NULL,
  display_name            TEXT NOT NULL,
  lifecycle_state         TEXT NOT NULL DEFAULT 'concept',
  lifecycle_profile_key   TEXT,
  jurisdiction_profile_ref TEXT,
  source_owner_id         TEXT,
  discipline_type         TEXT,
  current_revision_id     UUID,
  governed_state          TEXT NOT NULL DEFAULT 'CURRENT'
                          CHECK (governed_state IN ('CURRENT','STALE','IMPACT_CANDIDATE','FROZEN','SUPERSEDED')),
  payload                 JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance              JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, project_id, object_type, stable_object_id),
  CHECK (object_type IN (
    'Project','EngineeringBasis','Requirement','System','DisciplineObject','Revision',
    'Interface','Change','Impact','Decision','Assumption','Calculation','Review','Evidence',
    'Deliverable','Baseline','Asset','Inspection','OptimizationRun'
  ))
);

CREATE INDEX IF NOT EXISTS idx_eos3_objects_ws_project
  ON eos3_objects (tenant_id, workspace_id, project_id);

CREATE INDEX IF NOT EXISTS idx_eos3_objects_type
  ON eos3_objects (tenant_id, workspace_id, object_type);

DROP TRIGGER IF EXISTS eos3_objects_updated_at ON eos3_objects;
CREATE TRIGGER eos3_objects_updated_at
  BEFORE UPDATE ON eos3_objects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_objects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_objects_select ON eos3_objects;
CREATE POLICY eos3_objects_select ON eos3_objects
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_objects_insert ON eos3_objects;
CREATE POLICY eos3_objects_insert ON eos3_objects
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_objects_update ON eos3_objects;
CREATE POLICY eos3_objects_update ON eos3_objects
  FOR UPDATE USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_object_revisions (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id         UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id           TEXT NOT NULL,
  object_id            UUID NOT NULL REFERENCES eos3_objects(id) ON DELETE CASCADE,
  revision_identifier  TEXT NOT NULL,
  prior_revision_id    UUID REFERENCES eos3_object_revisions(id) ON DELETE SET NULL,
  is_current           BOOLEAN NOT NULL DEFAULT TRUE,
  actor_id             TEXT,
  authority            TEXT,
  source               TEXT NOT NULL,
  change_rationale     TEXT,
  lifecycle_state      TEXT NOT NULL DEFAULT 'concept',
  payload              JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance           JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (object_id, revision_identifier)
);

CREATE INDEX IF NOT EXISTS idx_eos3_object_revisions_object
  ON eos3_object_revisions (object_id, is_current);

ALTER TABLE eos3_object_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_object_revisions_select ON eos3_object_revisions;
CREATE POLICY eos3_object_revisions_select ON eos3_object_revisions
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_object_revisions_insert ON eos3_object_revisions;
CREATE POLICY eos3_object_revisions_insert ON eos3_object_revisions
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

-- No UPDATE policy for payload mutation: revisions are insert-only historically.
-- Service role may mark is_current via controlled function if needed later.

CREATE TABLE IF NOT EXISTS eos3_object_relationships (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id          TEXT NOT NULL,
  relationship_type   TEXT NOT NULL,
  from_object_id      UUID NOT NULL REFERENCES eos3_objects(id) ON DELETE CASCADE,
  to_object_id        UUID NOT NULL REFERENCES eos3_objects(id) ON DELETE CASCADE,
  from_revision_id    UUID REFERENCES eos3_object_revisions(id) ON DELETE SET NULL,
  to_revision_id      UUID REFERENCES eos3_object_revisions(id) ON DELETE SET NULL,
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_object_relationships_from
  ON eos3_object_relationships (from_object_id, relationship_type);

CREATE INDEX IF NOT EXISTS idx_eos3_object_relationships_to
  ON eos3_object_relationships (to_object_id, relationship_type);

ALTER TABLE eos3_object_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_object_relationships_select ON eos3_object_relationships;
CREATE POLICY eos3_object_relationships_select ON eos3_object_relationships
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_object_relationships_insert ON eos3_object_relationships;
CREATE POLICY eos3_object_relationships_insert ON eos3_object_relationships
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_baseline_members (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id        UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  baseline_object_id  UUID NOT NULL REFERENCES eos3_objects(id) ON DELETE CASCADE,
  member_object_id    UUID NOT NULL REFERENCES eos3_objects(id) ON DELETE CASCADE,
  member_revision_id  UUID NOT NULL REFERENCES eos3_object_revisions(id) ON DELETE RESTRICT,
  frozen_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provenance          JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (baseline_object_id, member_object_id, member_revision_id)
);

ALTER TABLE eos3_baseline_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_baseline_members_select ON eos3_baseline_members;
CREATE POLICY eos3_baseline_members_select ON eos3_baseline_members
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_baseline_members_insert ON eos3_baseline_members;
CREATE POLICY eos3_baseline_members_insert ON eos3_baseline_members
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

-- No UPDATE/DELETE policies: baseline membership is immutable after insert.

CREATE TABLE IF NOT EXISTS eos3_object_audit (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id      TEXT NOT NULL,
  object_id       UUID REFERENCES eos3_objects(id) ON DELETE SET NULL,
  action          TEXT NOT NULL,
  actor_id        TEXT,
  authority_role  TEXT,
  detail          JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_object_audit_ws
  ON eos3_object_audit (tenant_id, workspace_id, created_at DESC);

ALTER TABLE eos3_object_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_object_audit_select ON eos3_object_audit;
CREATE POLICY eos3_object_audit_select ON eos3_object_audit
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_object_audit_insert ON eos3_object_audit;
CREATE POLICY eos3_object_audit_insert ON eos3_object_audit
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_objects IS
  'EOS 3.2 canonical engineering objects (polymorphic). Does not rewrite EOS 2 rows.';
COMMENT ON TABLE eos3_object_revisions IS
  'Immutable historical revisions for EOS 3.2 canonical objects.';
COMMENT ON TABLE eos3_object_relationships IS
  'Typed digital-thread relationships. Structured canonical state is graph authority.';
COMMENT ON TABLE eos3_baseline_members IS
  'Frozen baseline membership. Immutable after insert.';
