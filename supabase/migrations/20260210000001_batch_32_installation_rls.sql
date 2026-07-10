-- Batch 32: Installation lifecycle RLS policies

ALTER TABLE commercial_installation_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_installation_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_installation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_installation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_installation_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_installation_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_installation_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_workspace_product_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_workspace_application_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_provisioning_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_provisioning_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_provisioning_artifacts ENABLE ROW LEVEL SECURITY;

-- Tenant members read own installation data
CREATE POLICY commercial_installation_versions_select ON commercial_installation_versions
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_installation_requests_select ON commercial_installation_requests
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_installation_requests_insert ON commercial_installation_requests
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND (r.slug IN ('owner', 'admin') OR has_permission('commerce', 'admin', tm.tenant_id))
    )
  );

CREATE POLICY commercial_installation_workflows_select ON commercial_installation_workflows
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_installation_steps_select ON commercial_installation_steps
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_installation_failures_select ON commercial_installation_failures
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_installation_health_checks_select ON commercial_installation_health_checks
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_installation_dependencies_select ON commercial_installation_dependencies
  FOR SELECT USING (tenant_id IS NULL OR tenant_id IN (
    SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active'
  ));

CREATE POLICY commercial_ws_product_assign_select ON commercial_workspace_product_assignments
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_ws_product_assign_write ON commercial_workspace_product_assignments
  FOR ALL USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND (r.slug IN ('owner', 'admin') OR has_permission('commerce', 'admin', tm.tenant_id))
    )
  ) WITH CHECK (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND (r.slug IN ('owner', 'admin') OR has_permission('commerce', 'admin', tm.tenant_id))
    )
  );

CREATE POLICY commercial_ws_app_assign_select ON commercial_workspace_application_assignments
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_ws_app_assign_write ON commercial_workspace_application_assignments
  FOR ALL USING (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND (r.slug IN ('owner', 'admin') OR has_permission('commerce', 'admin', tm.tenant_id))
    )
  ) WITH CHECK (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND (r.slug IN ('owner', 'admin') OR has_permission('commerce', 'admin', tm.tenant_id))
    )
  );

CREATE POLICY commercial_provisioning_runs_select ON commercial_provisioning_runs
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_provisioning_steps_select ON commercial_provisioning_steps
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

CREATE POLICY commercial_provisioning_artifacts_select ON commercial_provisioning_artifacts
  FOR SELECT USING (
    tenant_id IN (SELECT tm.tenant_id FROM tenant_memberships tm WHERE tm.user_id = auth.uid() AND tm.status = 'active')
  );

-- Service role bypass for provisioning orchestration (audited at application layer)
GRANT ALL ON commercial_installation_requests TO service_role;
GRANT ALL ON commercial_installation_workflows TO service_role;
GRANT ALL ON commercial_installation_steps TO service_role;
GRANT ALL ON commercial_installation_failures TO service_role;
GRANT ALL ON commercial_installation_health_checks TO service_role;
GRANT ALL ON commercial_provisioning_runs TO service_role;
GRANT ALL ON commercial_provisioning_steps TO service_role;
GRANT ALL ON commercial_provisioning_artifacts TO service_role;
GRANT ALL ON commercial_workspace_product_assignments TO service_role;
GRANT ALL ON commercial_workspace_application_assignments TO service_role;
GRANT ALL ON commercial_installation_versions TO service_role;

GRANT EXECUTE ON FUNCTION bump_commercial_installation_version(UUID) TO service_role, authenticated;
