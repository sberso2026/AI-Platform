-- Phase 9C — Inspection Intelligence enterprise foundation (additive)
-- Extends batch 43 with versioning, targets, approvals, events, pack registry.

CREATE TABLE IF NOT EXISTS inspection_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  template_id uuid NOT NULL REFERENCES inspection_templates(id),
  version integer NOT NULL,
  checklist_item_types jsonb NOT NULL DEFAULT '[]'::jsonb,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  immutable boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inspection_template_versions_immutable_true CHECK (immutable = true),
  UNIQUE (template_id, version)
);

CREATE TABLE IF NOT EXISTS inspection_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  plan_id uuid REFERENCES inspection_plans(id),
  session_id uuid REFERENCES inspection_sessions(id),
  target jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  session_id uuid NOT NULL REFERENCES inspection_sessions(id),
  status text NOT NULL DEFAULT 'pending',
  actor_user_id text,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id),
  workspace_id uuid NOT NULL REFERENCES workspaces(id),
  event_type text NOT NULL,
  entity_id text NOT NULL,
  correlation_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  pipeline_stage text NOT NULL DEFAULT 'platform_event_bus',
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS inspection_pack_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_id text NOT NULL,
  version text NOT NULL,
  manifest jsonb NOT NULL,
  registered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pack_id, version)
);

ALTER TABLE inspection_plans
  ADD COLUMN IF NOT EXISTS template_version_id uuid,
  ADD COLUMN IF NOT EXISTS frequency text,
  ADD COLUMN IF NOT EXISTS next_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS overdue boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS inspection_template_versions_template_idx
  ON inspection_template_versions (template_id);
CREATE INDEX IF NOT EXISTS inspection_targets_plan_idx ON inspection_targets (plan_id);
CREATE INDEX IF NOT EXISTS inspection_targets_session_idx ON inspection_targets (session_id);
CREATE INDEX IF NOT EXISTS inspection_events_tenant_ws_idx
  ON inspection_events (tenant_id, workspace_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS inspection_pack_registry_pack_idx
  ON inspection_pack_registry (pack_id);

DO $$
DECLARE
  tbl text;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'inspection_template_versions',
    'inspection_targets',
    'inspection_approvals',
    'inspection_events'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR SELECT USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      tbl || '_select',
      tbl
    );
  END LOOP;
END $$;

-- Pack registry is global catalog metadata (no tenant RLS); service-role writes only.
ALTER TABLE inspection_pack_registry ENABLE ROW LEVEL SECURITY;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'inspection_pack_registry' AND policyname = 'inspection_pack_registry_select'
  ) THEN
    CREATE POLICY inspection_pack_registry_select ON inspection_pack_registry
      FOR SELECT USING (true);
  END IF;
END $$;
