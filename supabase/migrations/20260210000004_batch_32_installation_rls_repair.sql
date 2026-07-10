-- Batch 32 repair: allow tenant admins to write health checks and enqueue outbox from lifecycle APIs

CREATE POLICY commercial_installation_health_checks_insert ON commercial_installation_health_checks
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND (r.slug IN ('owner', 'admin') OR has_permission('commerce', 'admin', tm.tenant_id))
    )
  );

CREATE POLICY commercial_outbox_events_tenant_insert ON commercial_outbox_events
  FOR INSERT WITH CHECK (
    tenant_id IS NOT NULL
    AND (
      is_platform_admin()
      OR has_permission('commerce', 'admin', tenant_id)
    )
  );

CREATE POLICY commercial_installation_events_insert ON commercial_installation_events
  FOR INSERT WITH CHECK (
    tenant_id IN (
      SELECT tm.tenant_id FROM tenant_memberships tm
      JOIN roles r ON r.id = tm.role_id
      WHERE tm.user_id = auth.uid() AND tm.status = 'active'
        AND (r.slug IN ('owner', 'admin') OR has_permission('commerce', 'admin', tm.tenant_id))
    )
  );
