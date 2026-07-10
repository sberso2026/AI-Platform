-- Extend admin role with kernel permissions
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
    jsonb_build_object('resource', 'command_centre', 'action', 'admin'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'admin'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'workflow', 'action', 'admin'),
    jsonb_build_object('resource', 'workflow', 'action', 'execute'),
    jsonb_build_object('resource', 'knowledge', 'action', 'execute'),
    jsonb_build_object('resource', 'digital_twin', 'action', 'execute'),
    jsonb_build_object('resource', 'automation', 'action', 'admin'),
    jsonb_build_object('resource', 'automation', 'action', 'execute')
  ), TRUE),
  (p_tenant_id, 'Member', 'member', 'Standard workspace access', jsonb_build_array(
    jsonb_build_object('resource', 'workspace', 'action', 'read'),
    jsonb_build_object('resource', 'command_centre', 'action', 'execute'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'settings', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Viewer', 'viewer', 'Read-only access', jsonb_build_array(
    jsonb_build_object('resource', 'workspace', 'action', 'read'),
    jsonb_build_object('resource', 'settings', 'action', 'read')
  ), TRUE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
