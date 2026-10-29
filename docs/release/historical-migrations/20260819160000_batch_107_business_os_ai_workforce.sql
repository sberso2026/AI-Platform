-- Batch 107: Business OS BOS-11 AI Workforce
-- Operational metadata for governed workforce installations, tasks, runs, approvals, and handoffs.
-- Kernel agents / agent_runs remain the agent registry and AI Director runtime.
-- Does not create a second agent runtime, model client, memory store, graph, or canonical business record store.

CREATE TABLE IF NOT EXISTS business_os_workforce_settings (
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  max_handoffs integer NOT NULL DEFAULT 2,
  max_tool_calls integer NOT NULL DEFAULT 8,
  max_runtime_ms integer NOT NULL DEFAULT 30000,
  max_tokens integer NOT NULL DEFAULT 4000,
  stale_context_hours integer NOT NULL DEFAULT 24,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, workspace_id),
  CONSTRAINT business_os_workforce_settings_handoff_check CHECK (max_handoffs >= 0 AND max_handoffs <= 2)
);

CREATE TABLE IF NOT EXISTS business_os_workforce_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  catalog_slug text NOT NULL,
  kernel_agent_id uuid REFERENCES agents(id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('installed', 'enabled', 'suspended', 'revoked')),
  authority text NOT NULL CHECK (authority IN ('observe', 'recommend', 'prepare', 'request_execution', 'execute_with_approval')),
  os text NOT NULL DEFAULT 'business' CHECK (os = 'business'),
  module_capability text,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  tool_allowlist jsonb NOT NULL DEFAULT '[]'::jsonb,
  context_scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  prompt_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  model_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  budget jsonb NOT NULL DEFAULT '{}'::jsonb,
  limits jsonb NOT NULL DEFAULT '{}'::jsonb,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  installed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  enabled_at timestamptz,
  suspended_at timestamptz,
  revoked_at timestamptz,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, workspace_id, catalog_slug)
);

CREATE INDEX IF NOT EXISTS business_os_workforce_installations_scope_idx
  ON business_os_workforce_installations (tenant_id, workspace_id, status);

CREATE TABLE IF NOT EXISTS business_os_workforce_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  installation_id uuid NOT NULL REFERENCES business_os_workforce_installations(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  intent text NOT NULL,
  entity_type text,
  entity_id text,
  state text NOT NULL CHECK (state IN (
    'requested', 'policy_check', 'context_assembled', 'planned', 'awaiting_approval',
    'approved', 'executing', 'completed', 'failed', 'blocked', 'cancelled'
  )),
  policy_decision jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_os_workforce_tasks_scope_idx
  ON business_os_workforce_tasks (tenant_id, workspace_id, created_at DESC);

CREATE TABLE IF NOT EXISTS business_os_workforce_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES business_os_workforce_tasks(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  installation_id uuid NOT NULL REFERENCES business_os_workforce_installations(id) ON DELETE CASCADE,
  kernel_run_id uuid,
  state text NOT NULL CHECK (state IN (
    'requested', 'policy_check', 'context_assembled', 'planned', 'awaiting_approval',
    'approved', 'executing', 'completed', 'failed', 'blocked', 'cancelled'
  )),
  authority text NOT NULL,
  tool_calls jsonb NOT NULL DEFAULT '[]'::jsonb,
  context_refs jsonb NOT NULL DEFAULT '[]'::jsonb,
  explanation jsonb NOT NULL DEFAULT '{}'::jsonb,
  budget_used jsonb NOT NULL DEFAULT '{}'::jsonb,
  visited_agents jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  failure_code text,
  blocked_reason text,
  draft jsonb,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_os_workforce_runs_scope_idx
  ON business_os_workforce_runs (tenant_id, workspace_id, started_at DESC);

CREATE TABLE IF NOT EXISTS business_os_workforce_approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES business_os_workforce_runs(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  requested_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  decided_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  decision text NOT NULL CHECK (decision IN ('pending', 'approved', 'rejected')),
  decided_at timestamptz,
  reason text,
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_os_workforce_approvals_scope_idx
  ON business_os_workforce_approvals (tenant_id, workspace_id, decision);

CREATE TABLE IF NOT EXISTS business_os_workforce_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id uuid NOT NULL REFERENCES business_os_workforce_runs(id) ON DELETE CASCADE,
  from_installation_id uuid NOT NULL REFERENCES business_os_workforce_installations(id) ON DELETE CASCADE,
  to_catalog_slug text NOT NULL,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  trimmed_permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  trimmed_tools jsonb NOT NULL DEFAULT '[]'::jsonb,
  trimmed_authority text NOT NULL,
  status text NOT NULL CHECK (status IN ('requested', 'accepted', 'rejected')),
  provenance jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS business_os_workforce_handoffs_scope_idx
  ON business_os_workforce_handoffs (tenant_id, workspace_id, run_id);

DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'business_os_workforce_settings',
    'business_os_workforce_installations',
    'business_os_workforce_tasks',
    'business_os_workforce_runs',
    'business_os_workforce_approvals',
    'business_os_workforce_handoffs'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
    EXECUTE format('GRANT ALL ON %I TO anon, authenticated, service_role', t);

    EXECUTE format('DROP TRIGGER IF EXISTS %I_updated_at ON %I', t, t);
    IF t IN ('business_os_workforce_settings', 'business_os_workforce_installations', 'business_os_workforce_tasks') THEN
      EXECUTE format(
        'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
        t, t
      );
    END IF;

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
       ) WITH CHECK (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_update', t
    );

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', t || '_delete', t);
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR DELETE USING (
         tenant_id = ANY(get_user_tenant_ids())
         AND workspace_id IN (
           SELECT workspace_id FROM workspace_memberships WHERE user_id = auth.uid()
         )
       )',
      t || '_delete', t
    );
  END LOOP;
END $$;

COMMENT ON TABLE business_os_workforce_installations IS
  'BOS-11 governed agent installations. Canonical agent runtime remains Kernel agents; this table stores workspace-scoped install/enable metadata only.';
COMMENT ON TABLE business_os_workforce_tasks IS
  'Operational workforce task metadata for audit/reproducibility. Not a canonical business record store.';
COMMENT ON TABLE business_os_workforce_runs IS
  'Operational workforce run metadata. AI Director agent_runs remain the model-runtime record.';
COMMENT ON TABLE business_os_workforce_approvals IS
  'Human approvals for write-capable workforce execution. Autonomous approval is forbidden.';
COMMENT ON TABLE business_os_workforce_handoffs IS
  'Explicit, bounded, permission-trimmed agent-to-agent handoffs.';
