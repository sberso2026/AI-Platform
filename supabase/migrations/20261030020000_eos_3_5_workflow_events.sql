-- EOS 3.5 governed workflow + event foundation.
-- Additive. Staging/development only. EVOLVE_EXISTING — no new broker/engine platform.
-- EVENT != AUTHORITY; WORKFLOW_TRANSITION != ENGINEERING_APPROVAL.

CREATE TABLE IF NOT EXISTS eos3_workflow_definitions (
  workflow_id   TEXT NOT NULL,
  version       TEXT NOT NULL,
  object_type   TEXT NOT NULL,
  definition    JSONB NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workflow_id, version)
);

ALTER TABLE eos3_workflow_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_workflow_definitions_select ON eos3_workflow_definitions;
CREATE POLICY eos3_workflow_definitions_select ON eos3_workflow_definitions
  FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS eos3_workflow_instances (
  instance_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id        TEXT NOT NULL,
  object_id         TEXT NOT NULL,
  object_type       TEXT NOT NULL,
  revision_id       TEXT,
  workflow_id       TEXT NOT NULL,
  workflow_version  TEXT NOT NULL,
  current_state     TEXT NOT NULL,
  pending_actions   JSONB NOT NULL DEFAULT '[]'::jsonb,
  transition_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  provenance        JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eos3_workflow_instances_ws
  ON eos3_workflow_instances (tenant_id, workspace_id, project_id);

DROP TRIGGER IF EXISTS eos3_workflow_instances_updated_at ON eos3_workflow_instances;
CREATE TRIGGER eos3_workflow_instances_updated_at
  BEFORE UPDATE ON eos3_workflow_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

ALTER TABLE eos3_workflow_instances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_workflow_instances_select ON eos3_workflow_instances;
CREATE POLICY eos3_workflow_instances_select ON eos3_workflow_instances
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_workflow_instances_write ON eos3_workflow_instances;
CREATE POLICY eos3_workflow_instances_write ON eos3_workflow_instances
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_governed_events (
  event_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key   TEXT NOT NULL,
  event_type        TEXT NOT NULL,
  category          TEXT NOT NULL,
  schema_version    TEXT NOT NULL DEFAULT '1.0.0',
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id      UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id        TEXT NOT NULL,
  object_id         TEXT,
  revision_id       TEXT,
  actor_id          TEXT,
  authority         TEXT,
  sequence_no       BIGINT NOT NULL,
  correlation_id    TEXT NOT NULL,
  causation_id      TEXT,
  source            TEXT NOT NULL,
  status            TEXT NOT NULL,
  retry_count       INTEGER NOT NULL DEFAULT 0,
  failure_reason    TEXT,
  payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
  provenance        JSONB NOT NULL DEFAULT '{}'::jsonb,
  grants_authority  BOOLEAN NOT NULL DEFAULT FALSE CHECK (grants_authority = FALSE),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, workspace_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idx_eos3_governed_events_ws
  ON eos3_governed_events (tenant_id, workspace_id, created_at DESC);

ALTER TABLE eos3_governed_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_governed_events_select ON eos3_governed_events;
CREATE POLICY eos3_governed_events_select ON eos3_governed_events
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_governed_events_insert ON eos3_governed_events;
CREATE POLICY eos3_governed_events_insert ON eos3_governed_events
  FOR INSERT WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

CREATE TABLE IF NOT EXISTS eos3_work_items (
  work_item_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id   UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  project_id     TEXT NOT NULL,
  object_id      TEXT NOT NULL,
  item_type      TEXT NOT NULL,
  assigned_kind  TEXT NOT NULL,
  assigned_value TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'OPEN',
  due_at         TIMESTAMPTZ,
  priority       TEXT NOT NULL DEFAULT 'normal',
  assignment_grants_authority BOOLEAN NOT NULL DEFAULT FALSE CHECK (assignment_grants_authority = FALSE),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at   TIMESTAMPTZ
);

ALTER TABLE eos3_work_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS eos3_work_items_select ON eos3_work_items;
CREATE POLICY eos3_work_items_select ON eos3_work_items
  FOR SELECT USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

DROP POLICY IF EXISTS eos3_work_items_write ON eos3_work_items;
CREATE POLICY eos3_work_items_write ON eos3_work_items
  FOR ALL USING (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  )
  WITH CHECK (
    tenant_id = ANY (get_user_tenant_ids())
    AND engineering_core_workspace_member(workspace_id)
  );

COMMENT ON TABLE eos3_workflow_instances IS
  'EOS 3.5 workflow instances. Transitions require role authority; AI cannot pass human checkpoints.';
COMMENT ON TABLE eos3_governed_events IS
  'EOS 3.5 governed events. grants_authority always false.';
COMMENT ON TABLE eos3_work_items IS
  'EOS 3.5 work items. Assignment does not grant engineering approval authority.';
