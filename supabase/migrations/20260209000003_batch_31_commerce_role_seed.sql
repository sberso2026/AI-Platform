-- Patch create_default_tenant_roles to include commerce permissions for new tenants

CREATE OR REPLACE FUNCTION public.create_default_tenant_roles(p_tenant_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    jsonb_build_object('resource', 'automation', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'admin'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'commerce', 'action', 'admin'),
    jsonb_build_object('resource', 'commerce', 'action', 'read'),
    jsonb_build_object('resource', 'commerce', 'action', 'manage_subscriptions'),
    jsonb_build_object('resource', 'commerce', 'action', 'manage_licences'),
    jsonb_build_object('resource', 'commerce', 'action', 'manage_seats'),
    jsonb_build_object('resource', 'commerce', 'action', 'manage_trials'),
    jsonb_build_object('resource', 'commerce', 'action', 'manage_billing'),
    jsonb_build_object('resource', 'commerce', 'action', 'manage_overrides'),
    jsonb_build_object('resource', 'commerce', 'action', 'manage_products'),
    jsonb_build_object('resource', 'commerce', 'action', 'manage_marketplace')
  ), TRUE),
  (p_tenant_id, 'Member', 'member', 'Standard workspace access', jsonb_build_array(
    jsonb_build_object('resource', 'workspace', 'action', 'read'),
    jsonb_build_object('resource', 'command_centre', 'action', 'execute'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'settings', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Viewer', 'viewer', 'Read-only access', jsonb_build_array(
    jsonb_build_object('resource', 'workspace', 'action', 'read'),
    jsonb_build_object('resource', 'settings', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE)
  ON CONFLICT (tenant_id, slug) DO NOTHING;

  INSERT INTO roles (tenant_id, name, slug, description, permissions, is_system) VALUES
  (p_tenant_id, 'Engineering Owner', 'engineering-owner', 'Full Engineering OS access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'admin'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'knowledge', 'action', 'execute'),
    jsonb_build_object('resource', 'digital_twin', 'action', 'execute'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Engineering Manager', 'engineering-manager', 'Engineering OS management', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'knowledge', 'action', 'execute'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Lead Engineer', 'lead-engineer', 'Lead engineer access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Engineer', 'engineer', 'Standard engineer access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'ai_agent', 'action', 'execute'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Inspector', 'inspector', 'Inspection access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Document Controller', 'document-controller', 'Document control access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE),
  (p_tenant_id, 'Project Controls User', 'project-controls-user', 'Project controls access', jsonb_build_array(
    jsonb_build_object('resource', 'engineering', 'action', 'read'),
    jsonb_build_object('resource', 'engineering', 'action', 'execute'),
    jsonb_build_object('resource', 'commerce', 'action', 'read')
  ), TRUE)
  ON CONFLICT (tenant_id, slug) DO NOTHING;
END;
$$;
