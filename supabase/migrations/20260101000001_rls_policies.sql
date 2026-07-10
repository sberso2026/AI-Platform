-- RTB AI OS Row Level Security Policies
-- Enforces multi-tenant isolation at the database level

-- Enable RLS on all platform tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE installed_plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_centre_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE command_centre_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- ─── Helper Functions ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS UUID[] AS $$
  SELECT COALESCE(
    ARRAY_AGG(tenant_id),
    ARRAY[]::UUID[]
  )
  FROM tenant_memberships
  WHERE user_id = auth.uid()
    AND status = 'active';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_tenant_member(p_tenant_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM tenant_memberships
    WHERE tenant_id = p_tenant_id
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION has_permission(
  p_resource TEXT,
  p_action TEXT,
  p_tenant_id UUID
)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM tenant_memberships tm
    JOIN roles r ON r.id = tm.role_id
    WHERE tm.user_id = auth.uid()
      AND tm.tenant_id = p_tenant_id
      AND tm.status = 'active'
      AND (
        r.permissions @> jsonb_build_array(
          jsonb_build_object('resource', p_resource, 'action', p_action)
        )
        OR r.permissions @> jsonb_build_array(
          jsonb_build_object('resource', p_resource, 'action', 'admin')
        )
        OR r.slug = 'owner'
        OR r.slug = 'admin'
      )
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─── Profiles ────────────────────────────────────────────────────────────────

CREATE POLICY profiles_select_own ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY profiles_select_tenant_members ON profiles
  FOR SELECT USING (
    id IN (
      SELECT tm.user_id FROM tenant_memberships tm
      WHERE tm.tenant_id = ANY(get_user_tenant_ids())
        AND tm.status = 'active'
    )
  );

-- ─── Tenants ─────────────────────────────────────────────────────────────────

CREATE POLICY tenants_select_member ON tenants
  FOR SELECT USING (id = ANY(get_user_tenant_ids()));

CREATE POLICY tenants_update_admin ON tenants
  FOR UPDATE USING (has_permission('tenant', 'admin', id));

-- ─── Roles ───────────────────────────────────────────────────────────────────

CREATE POLICY roles_select_member ON roles
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY roles_manage_admin ON roles
  FOR ALL USING (has_permission('role', 'admin', tenant_id));

-- ─── Tenant Memberships ──────────────────────────────────────────────────────

CREATE POLICY tenant_memberships_select ON tenant_memberships
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY tenant_memberships_manage ON tenant_memberships
  FOR ALL USING (has_permission('user', 'admin', tenant_id));

-- ─── Workspaces ──────────────────────────────────────────────────────────────

CREATE POLICY workspaces_select ON workspaces
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY workspaces_manage ON workspaces
  FOR ALL USING (has_permission('workspace', 'admin', tenant_id));

-- ─── Workspace Memberships ───────────────────────────────────────────────────

CREATE POLICY workspace_memberships_select ON workspace_memberships
  FOR SELECT USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w
      WHERE w.tenant_id = ANY(get_user_tenant_ids())
    )
  );

CREATE POLICY workspace_memberships_manage ON workspace_memberships
  FOR ALL USING (
    workspace_id IN (
      SELECT w.id FROM workspaces w
      WHERE has_permission('workspace', 'admin', w.tenant_id)
    )
  );

-- ─── Installed Plugins ───────────────────────────────────────────────────────

CREATE POLICY plugins_select ON installed_plugins
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY plugins_manage ON installed_plugins
  FOR ALL USING (has_permission('plugin', 'admin', tenant_id));

-- ─── Audit Events ────────────────────────────────────────────────────────────

CREATE POLICY audit_select ON audit_events
  FOR SELECT USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('audit', 'read', tenant_id)
  );

CREATE POLICY audit_insert ON audit_events
  FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

-- ─── Command Centre ──────────────────────────────────────────────────────────

CREATE POLICY cc_sessions_select ON command_centre_sessions
  FOR SELECT USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND (user_id = auth.uid() OR has_permission('command_centre', 'admin', tenant_id))
  );

CREATE POLICY cc_sessions_insert ON command_centre_sessions
  FOR INSERT WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND user_id = auth.uid()
  );

CREATE POLICY cc_sessions_update ON command_centre_sessions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY cc_messages_select ON command_centre_messages
  FOR SELECT USING (
    session_id IN (
      SELECT id FROM command_centre_sessions
      WHERE tenant_id = ANY(get_user_tenant_ids())
        AND (user_id = auth.uid() OR has_permission('command_centre', 'admin', tenant_id))
    )
  );

CREATE POLICY cc_messages_insert ON command_centre_messages
  FOR INSERT WITH CHECK (
    session_id IN (
      SELECT id FROM command_centre_sessions
      WHERE user_id = auth.uid()
    )
  );

-- ─── Platform Settings ───────────────────────────────────────────────────────

CREATE POLICY settings_select ON platform_settings
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY settings_manage ON platform_settings
  FOR ALL USING (has_permission('settings', 'admin', tenant_id));
