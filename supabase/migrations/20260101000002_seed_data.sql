-- RTB AI OS Seed Data
-- Default system roles and platform configuration

-- System role permission templates (applied per-tenant on creation)
-- These are reference definitions; actual roles are created per tenant.

CREATE OR REPLACE FUNCTION create_default_tenant_roles(p_tenant_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO roles (tenant_id, name, slug, description, permissions, is_system) VALUES
  (p_tenant_id, 'Owner', 'owner', 'Full platform access', '[]'::jsonb, TRUE),
  (p_tenant_id, 'Administrator', 'admin', 'Administrative access', jsonb_build_array(
    jsonb_build_object('resource', 'tenant', 'action', 'admin'),
    jsonb_build_object('resource', 'workspace', 'action', 'admin'),
    jsonb_build_object('resource', 'user', 'action', 'admin'),
    jsonb_build_object('resource', 'role', 'action', 'admin'),
    jsonb_build_object('resource', 'plugin', 'action', 'admin'),
    jsonb_build_object('resource', 'audit', 'action', 'read'),
    jsonb_build_object('resource', 'settings', 'action', 'admin'),
    jsonb_build_object('resource', 'command_centre', 'action', 'admin')
  ), TRUE),
  (p_tenant_id, 'Member', 'member', 'Standard workspace access', jsonb_build_array(
    jsonb_build_object('resource', 'workspace', 'action', 'read'),
    jsonb_build_object('resource', 'command_centre', 'action', 'execute'),
    jsonb_build_object('resource', 'settings', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Viewer', 'viewer', 'Read-only access', jsonb_build_array(
    jsonb_build_object('resource', 'workspace', 'action', 'read'),
    jsonb_build_object('resource', 'settings', 'action', 'read')
  ), TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-provision tenant on creation
CREATE OR REPLACE FUNCTION handle_new_tenant()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_tenant_roles(NEW.id);

  INSERT INTO workspaces (tenant_id, name, slug, description, type)
  VALUES (NEW.id, 'Default Workspace', 'default', 'Primary workspace', 'default');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_tenant_created
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION handle_new_tenant();
