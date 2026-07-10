-- RTB Platform — Batch 32: Installation Lifecycle & Workspace Provisioning (Phase 3)
-- Extends commercial_installations (product_installations) and adds workflow/provisioning tables.

-- ─── Status migration (Phase 2 → Phase 3) ───────────────────────────────────

UPDATE commercial_installations SET status = 'active' WHERE status = 'healthy';
UPDATE commercial_installations SET status = 'provisioning' WHERE status = 'installing';
UPDATE commercial_application_installations SET status = 'active' WHERE status = 'healthy';
UPDATE commercial_application_installations SET status = 'provisioning' WHERE status = 'installing';

ALTER TABLE commercial_installations DROP CONSTRAINT IF EXISTS commercial_installations_status_check;
ALTER TABLE commercial_installations ADD CONSTRAINT commercial_installations_status_check
  CHECK (status IN (
    'not_installed', 'requested', 'awaiting_entitlement', 'awaiting_approval', 'queued',
    'provisioning', 'validating', 'active', 'degraded', 'suspended',
    'upgrade_pending', 'upgrading', 'rollback_pending', 'rolling_back',
    'failed', 'uninstall_pending', 'uninstalling', 'uninstalled'
  ));

ALTER TABLE commercial_application_installations DROP CONSTRAINT IF EXISTS commercial_application_installations_status_check;
ALTER TABLE commercial_application_installations ADD CONSTRAINT commercial_application_installations_status_check
  CHECK (status IN (
    'not_installed', 'requested', 'awaiting_parent', 'awaiting_entitlement', 'queued',
    'provisioning', 'validating', 'active', 'degraded', 'suspended',
    'upgrade_pending', 'upgrading', 'failed',
    'uninstall_pending', 'uninstalling', 'uninstalled'
  ));

-- ─── Extend product installations (commercial_installations) ─────────────────

ALTER TABLE commercial_installations
  ADD COLUMN IF NOT EXISTS licence_id UUID REFERENCES commercial_licenses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requested_version TEXT,
  ADD COLUMN IF NOT EXISTS installed_version TEXT,
  ADD COLUMN IF NOT EXISTS desired_state TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS current_state TEXT,
  ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_health_check_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_code TEXT,
  ADD COLUMN IF NOT EXISTS failure_message TEXT;

UPDATE commercial_installations SET installed_version = version WHERE installed_version IS NULL AND version IS NOT NULL;
UPDATE commercial_installations SET completed_at = installed_at WHERE completed_at IS NULL AND installed_at IS NOT NULL;
UPDATE commercial_installations SET failure_message = health_message WHERE failure_message IS NULL AND health_message IS NOT NULL;
UPDATE commercial_installations SET current_state = status WHERE current_state IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_commercial_installations_tenant_product
  ON commercial_installations(tenant_id, product_id) WHERE deleted_at IS NULL;

-- ─── Extend application installations ────────────────────────────────────────

ALTER TABLE commercial_application_installations
  ADD COLUMN IF NOT EXISTS parent_product_installation_id UUID REFERENCES commercial_installations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES commercial_products(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES commercial_subscriptions(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS licence_id UUID REFERENCES commercial_licenses(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS requested_version TEXT,
  ADD COLUMN IF NOT EXISTS installed_version TEXT,
  ADD COLUMN IF NOT EXISTS workspace_scope TEXT DEFAULT 'tenant' CHECK (workspace_scope IN ('tenant', 'workspace', 'selected')),
  ADD COLUMN IF NOT EXISTS requested_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failure_code TEXT,
  ADD COLUMN IF NOT EXISTS failure_message TEXT;

UPDATE commercial_application_installations SET installed_version = version WHERE installed_version IS NULL AND version IS NOT NULL;

-- ─── Installation version counter (cache invalidation) ─────────────────────

CREATE TABLE IF NOT EXISTS commercial_installation_versions (
  tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
  version BIGINT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION bump_commercial_installation_version(p_tenant_id UUID)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE v_version BIGINT;
BEGIN
  INSERT INTO commercial_installation_versions (tenant_id, version)
  VALUES (p_tenant_id, 1)
  ON CONFLICT (tenant_id) DO UPDATE
    SET version = commercial_installation_versions.version + 1,
        updated_at = NOW()
  RETURNING version INTO v_version;
  RETURN v_version;
END;
$$;

-- ─── Installation requests ───────────────────────────────────────────────────

CREATE TABLE commercial_installation_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES commercial_products(id) ON DELETE RESTRICT,
  subscription_id UUID REFERENCES commercial_subscriptions(id) ON DELETE SET NULL,
  licence_id UUID REFERENCES commercial_licenses(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  requested_version TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected', 'queued', 'completed', 'failed', 'cancelled')),
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  installation_id UUID REFERENCES commercial_installations(id) ON DELETE SET NULL,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commercial_installation_requests_tenant ON commercial_installation_requests(tenant_id);
CREATE INDEX idx_commercial_installation_requests_status ON commercial_installation_requests(status);

-- ─── Workflows & steps ───────────────────────────────────────────────────────

CREATE TABLE commercial_installation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  installation_id UUID NOT NULL REFERENCES commercial_installations(id) ON DELETE CASCADE,
  workflow_type TEXT NOT NULL DEFAULT 'install'
    CHECK (workflow_type IN ('install', 'upgrade', 'rollback', 'uninstall', 'validate', 'health_check')),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  correlation_id TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE commercial_installation_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workflow_id UUID NOT NULL REFERENCES commercial_installation_workflows(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  step_order INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workflow_id, step_key)
);

CREATE TABLE commercial_installation_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES commercial_installations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES commercial_installation_workflows(id) ON DELETE SET NULL,
  step_id UUID REFERENCES commercial_installation_steps(id) ON DELETE SET NULL,
  failure_code TEXT NOT NULL,
  failure_message TEXT,
  retryable BOOLEAN NOT NULL DEFAULT TRUE,
  resolved_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Health checks ───────────────────────────────────────────────────────────

CREATE TABLE commercial_installation_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  installation_id UUID NOT NULL REFERENCES commercial_installations(id) ON DELETE CASCADE,
  health_state TEXT NOT NULL DEFAULT 'unknown'
    CHECK (health_state IN ('healthy', 'warning', 'degraded', 'failed', 'suspended', 'unknown')),
  checks JSONB NOT NULL DEFAULT '[]',
  summary TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_commercial_installation_health_installation
  ON commercial_installation_health_checks(installation_id, checked_at DESC);

-- ─── Dependencies (catalog) ─────────────────────────────────────────────────

CREATE TABLE commercial_installation_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  depends_on_product_id UUID REFERENCES commercial_products(id) ON DELETE CASCADE,
  depends_on_application_key TEXT,
  dependency_type TEXT NOT NULL DEFAULT 'required'
    CHECK (dependency_type IN ('required', 'optional', 'conflicts_with', 'minimum_version', 'maximum_version', 'requires_feature', 'requires_integration')),
  minimum_version TEXT,
  maximum_version TEXT,
  feature_key TEXT,
  integration_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_commercial_installation_deps_product ON commercial_installation_dependencies(product_id);

-- Seed Project Intelligence → Engineering OS dependency
INSERT INTO commercial_installation_dependencies (
  product_id, depends_on_product_id, dependency_type, minimum_version, metadata
)
SELECT
  (SELECT id FROM commercial_products WHERE slug = 'project-intelligence' AND tenant_id IS NULL LIMIT 1),
  (SELECT id FROM commercial_products WHERE slug = 'engineering-os' AND tenant_id IS NULL LIMIT 1),
  'required',
  '1.0.0',
  '{"source":"batch_32_seed"}'::jsonb
WHERE EXISTS (SELECT 1 FROM commercial_products WHERE slug = 'project-intelligence' AND tenant_id IS NULL)
  AND EXISTS (SELECT 1 FROM commercial_products WHERE slug = 'engineering-os' AND tenant_id IS NULL)
  AND NOT EXISTS (
    SELECT 1 FROM commercial_installation_dependencies d
    JOIN commercial_products p ON p.id = d.product_id AND p.slug = 'project-intelligence'
    WHERE d.tenant_id IS NULL AND d.deleted_at IS NULL
  );

-- ─── Workspace assignments ───────────────────────────────────────────────────

CREATE TABLE commercial_workspace_product_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  installation_id UUID NOT NULL REFERENCES commercial_installations(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES commercial_products(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'removed')),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, installation_id)
);

CREATE TABLE commercial_workspace_application_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  app_installation_id UUID NOT NULL REFERENCES commercial_application_installations(id) ON DELETE CASCADE,
  application_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'removed')),
  assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  removed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, app_installation_id)
);

CREATE INDEX idx_commercial_ws_product_assign_tenant ON commercial_workspace_product_assignments(tenant_id);
CREATE INDEX idx_commercial_ws_app_assign_tenant ON commercial_workspace_application_assignments(tenant_id);

-- ─── Provisioning runs ───────────────────────────────────────────────────────

CREATE TABLE commercial_provisioning_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  installation_id UUID REFERENCES commercial_installations(id) ON DELETE CASCADE,
  workflow_id UUID REFERENCES commercial_installation_workflows(id) ON DELETE SET NULL,
  provisioner_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  idempotency_key TEXT NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_code TEXT,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE commercial_provisioning_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES commercial_provisioning_runs(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_code TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, step_key)
);

CREATE TABLE commercial_provisioning_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES commercial_provisioning_runs(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  artifact_key TEXT NOT NULL,
  artifact_ref TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Immutable installation events ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION prevent_commercial_installation_event_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RAISE EXCEPTION 'commercial_installation_events are immutable';
END;
$$;

DROP TRIGGER IF EXISTS commercial_installation_events_immutable ON commercial_installation_events;
CREATE TRIGGER commercial_installation_events_immutable
  BEFORE UPDATE OR DELETE ON commercial_installation_events
  FOR EACH ROW EXECUTE FUNCTION prevent_commercial_installation_event_mutation();

-- ─── Updated_at triggers for new tables ──────────────────────────────────────

DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'commercial_installation_requests', 'commercial_installation_workflows',
    'commercial_workspace_product_assignments'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS %I_updated_at ON %I; CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()',
      t, t, t, t
    );
  END LOOP;
END $$;
