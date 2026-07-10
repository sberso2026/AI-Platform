-- RTB AI OS Phase 1.5 — RLS Policies for Platform Kernel Tables

-- Enable RLS on all kernel tables
ALTER TABLE ai_model_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_model_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_dispatch_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE background_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_transitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_step_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_node_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_edge_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_edges ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_scopes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twins ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_twin_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE external_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE telemetry_alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugins ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plugin_dependencies ENABLE ROW LEVEL SECURITY;

-- ─── AI Director ─────────────────────────────────────────────────────────────

CREATE POLICY ai_providers_select ON ai_model_providers
  FOR SELECT USING (tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY ai_providers_manage ON ai_model_providers
  FOR ALL USING (tenant_id = ANY(get_user_tenant_ids()) AND has_permission('ai_agent', 'admin', tenant_id));

CREATE POLICY ai_routes_select ON ai_model_routes
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY ai_routes_manage ON ai_model_routes
  FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));

CREATE POLICY agents_select ON agents
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY agents_manage ON agents
  FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));

CREATE POLICY agent_tools_select ON agent_tools
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY agent_tools_manage ON agent_tools
  FOR ALL USING (has_permission('ai_agent', 'admin', tenant_id));

CREATE POLICY agent_runs_select ON agent_runs
  FOR SELECT USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND (user_id = auth.uid() OR has_permission('ai_agent', 'read', tenant_id))
  );

CREATE POLICY agent_runs_insert ON agent_runs
  FOR INSERT WITH CHECK (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('ai_agent', 'execute', tenant_id)
  );

CREATE POLICY agent_runs_update ON agent_runs
  FOR UPDATE USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND has_permission('ai_agent', 'execute', tenant_id)
  );

CREATE POLICY agent_messages_select ON agent_messages
  FOR SELECT USING (
    run_id IN (SELECT id FROM agent_runs WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY agent_messages_insert ON agent_messages
  FOR INSERT WITH CHECK (
    run_id IN (SELECT id FROM agent_runs WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY agent_tool_calls_select ON agent_tool_calls
  FOR SELECT USING (
    run_id IN (SELECT id FROM agent_runs WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY agent_tool_calls_insert ON agent_tool_calls
  FOR INSERT WITH CHECK (
    run_id IN (SELECT id FROM agent_runs WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

-- ─── Event Bus ───────────────────────────────────────────────────────────────

CREATE POLICY events_select ON events
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY events_insert ON events
  FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY event_subscriptions_select ON event_subscriptions
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY event_subscriptions_manage ON event_subscriptions
  FOR ALL USING (has_permission('tenant', 'admin', tenant_id));

CREATE POLICY event_dispatch_select ON event_dispatch_attempts
  FOR SELECT USING (
    event_id IN (SELECT id FROM events WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY event_dispatch_insert ON event_dispatch_attempts
  FOR INSERT WITH CHECK (
    event_id IN (SELECT id FROM events WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

-- ─── Background Jobs ─────────────────────────────────────────────────────────

CREATE POLICY background_jobs_select ON background_jobs
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY background_jobs_manage ON background_jobs
  FOR ALL USING (has_permission('automation', 'execute', tenant_id));

CREATE POLICY scheduled_jobs_select ON scheduled_jobs
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY scheduled_jobs_manage ON scheduled_jobs
  FOR ALL USING (has_permission('automation', 'admin', tenant_id));

CREATE POLICY job_attempts_select ON job_attempts
  FOR SELECT USING (
    job_id IN (SELECT id FROM background_jobs WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY job_attempts_insert ON job_attempts
  FOR INSERT WITH CHECK (
    job_id IN (SELECT id FROM background_jobs WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

-- ─── Workflow Engine ─────────────────────────────────────────────────────────

CREATE POLICY workflow_definitions_select ON workflow_definitions
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY workflow_definitions_manage ON workflow_definitions
  FOR ALL USING (has_permission('workflow', 'admin', tenant_id));

CREATE POLICY workflow_versions_select ON workflow_versions
  FOR SELECT USING (
    definition_id IN (SELECT id FROM workflow_definitions WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY workflow_versions_manage ON workflow_versions
  FOR ALL USING (
    definition_id IN (
      SELECT id FROM workflow_definitions
      WHERE has_permission('workflow', 'admin', tenant_id)
    )
  );

CREATE POLICY workflow_steps_select ON workflow_steps
  FOR SELECT USING (
    version_id IN (
      SELECT wv.id FROM workflow_versions wv
      JOIN workflow_definitions wd ON wd.id = wv.definition_id
      WHERE wd.tenant_id = ANY(get_user_tenant_ids())
    )
  );

CREATE POLICY workflow_steps_manage ON workflow_steps
  FOR ALL USING (
    version_id IN (
      SELECT wv.id FROM workflow_versions wv
      JOIN workflow_definitions wd ON wd.id = wv.definition_id
      WHERE has_permission('workflow', 'admin', wd.tenant_id)
    )
  );

CREATE POLICY workflow_transitions_select ON workflow_transitions
  FOR SELECT USING (
    version_id IN (
      SELECT wv.id FROM workflow_versions wv
      JOIN workflow_definitions wd ON wd.id = wv.definition_id
      WHERE wd.tenant_id = ANY(get_user_tenant_ids())
    )
  );

CREATE POLICY workflow_transitions_manage ON workflow_transitions
  FOR ALL USING (
    version_id IN (
      SELECT wv.id FROM workflow_versions wv
      JOIN workflow_definitions wd ON wd.id = wv.definition_id
      WHERE has_permission('workflow', 'admin', wd.tenant_id)
    )
  );

CREATE POLICY workflow_instances_select ON workflow_instances
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY workflow_instances_manage ON workflow_instances
  FOR ALL USING (has_permission('workflow', 'execute', tenant_id));

CREATE POLICY workflow_step_runs_select ON workflow_step_runs
  FOR SELECT USING (
    instance_id IN (SELECT id FROM workflow_instances WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY workflow_step_runs_manage ON workflow_step_runs
  FOR ALL USING (
    instance_id IN (
      SELECT id FROM workflow_instances
      WHERE has_permission('workflow', 'execute', tenant_id)
    )
  );

-- ─── Knowledge Graph ─────────────────────────────────────────────────────────

CREATE POLICY knowledge_node_types_select ON knowledge_node_types
  FOR SELECT USING (tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY knowledge_edge_types_select ON knowledge_edge_types
  FOR SELECT USING (tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY knowledge_nodes_select ON knowledge_nodes
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY knowledge_nodes_manage ON knowledge_nodes
  FOR ALL USING (has_permission('knowledge', 'execute', tenant_id));

CREATE POLICY knowledge_edges_select ON knowledge_edges
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY knowledge_edges_manage ON knowledge_edges
  FOR ALL USING (has_permission('knowledge', 'execute', tenant_id));

CREATE POLICY evidence_items_select ON evidence_items
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY evidence_items_manage ON evidence_items
  FOR ALL USING (has_permission('knowledge', 'execute', tenant_id));

-- ─── AI Memory ───────────────────────────────────────────────────────────────

CREATE POLICY memory_scopes_select ON memory_scopes FOR SELECT USING (TRUE);

CREATE POLICY ai_memories_select ON ai_memories
  FOR SELECT USING (
    tenant_id = ANY(get_user_tenant_ids())
    AND deleted_at IS NULL
  );

CREATE POLICY ai_memories_manage ON ai_memories
  FOR ALL USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY memory_links_select ON memory_links
  FOR SELECT USING (
    memory_id IN (SELECT id FROM ai_memories WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY memory_links_manage ON memory_links
  FOR ALL USING (
    memory_id IN (SELECT id FROM ai_memories WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

-- ─── Digital Twin ────────────────────────────────────────────────────────────

CREATE POLICY digital_twin_types_select ON digital_twin_types
  FOR SELECT USING (tenant_id IS NULL OR tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY digital_twins_select ON digital_twins
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY digital_twins_manage ON digital_twins
  FOR ALL USING (has_permission('digital_twin', 'execute', tenant_id));

CREATE POLICY digital_twin_relationships_select ON digital_twin_relationships
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY digital_twin_relationships_manage ON digital_twin_relationships
  FOR ALL USING (has_permission('digital_twin', 'execute', tenant_id));

CREATE POLICY digital_twin_attributes_select ON digital_twin_attributes
  FOR SELECT USING (
    twin_id IN (SELECT id FROM digital_twins WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY digital_twin_attributes_manage ON digital_twin_attributes
  FOR ALL USING (
    twin_id IN (
      SELECT id FROM digital_twins
      WHERE has_permission('digital_twin', 'execute', tenant_id)
    )
  );

CREATE POLICY digital_twin_status_select ON digital_twin_status_history
  FOR SELECT USING (
    twin_id IN (SELECT id FROM digital_twins WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY digital_twin_status_insert ON digital_twin_status_history
  FOR INSERT WITH CHECK (
    twin_id IN (
      SELECT id FROM digital_twins
      WHERE has_permission('digital_twin', 'execute', tenant_id)
    )
  );

-- ─── API Gateway ─────────────────────────────────────────────────────────────

CREATE POLICY api_keys_select ON api_keys
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY api_keys_manage ON api_keys
  FOR ALL USING (has_permission('tenant', 'admin', tenant_id));

CREATE POLICY api_key_permissions_select ON api_key_permissions
  FOR SELECT USING (
    api_key_id IN (SELECT id FROM api_keys WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

CREATE POLICY api_key_permissions_manage ON api_key_permissions
  FOR ALL USING (
    api_key_id IN (
      SELECT id FROM api_keys WHERE has_permission('tenant', 'admin', tenant_id)
    )
  );

CREATE POLICY api_usage_logs_select ON api_usage_logs
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY api_usage_logs_insert ON api_usage_logs
  FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY external_integrations_select ON external_integrations
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY external_integrations_manage ON external_integrations
  FOR ALL USING (has_permission('tenant', 'admin', tenant_id));

CREATE POLICY webhooks_select ON webhooks
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY webhooks_manage ON webhooks
  FOR ALL USING (has_permission('tenant', 'admin', tenant_id));

-- ─── Notifications ───────────────────────────────────────────────────────────

CREATE POLICY notifications_select ON notifications
  FOR SELECT USING (user_id = auth.uid() AND tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY notifications_update ON notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY notifications_insert ON notifications
  FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY notification_preferences_select ON notification_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notification_preferences_manage ON notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY notification_deliveries_select ON notification_deliveries
  FOR SELECT USING (
    notification_id IN (
      SELECT id FROM notifications WHERE user_id = auth.uid()
    )
  );

CREATE POLICY notification_deliveries_insert ON notification_deliveries
  FOR INSERT WITH CHECK (
    notification_id IN (SELECT id FROM notifications WHERE tenant_id = ANY(get_user_tenant_ids()))
  );

-- ─── Telemetry ───────────────────────────────────────────────────────────────

CREATE POLICY sensors_select ON sensors
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY sensors_manage ON sensors
  FOR ALL USING (has_permission('digital_twin', 'execute', tenant_id));

CREATE POLICY telemetry_streams_select ON telemetry_streams
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY telemetry_streams_manage ON telemetry_streams
  FOR ALL USING (has_permission('digital_twin', 'execute', tenant_id));

CREATE POLICY telemetry_events_select ON telemetry_events
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY telemetry_events_insert ON telemetry_events
  FOR INSERT WITH CHECK (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY telemetry_alert_rules_select ON telemetry_alert_rules
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY telemetry_alert_rules_manage ON telemetry_alert_rules
  FOR ALL USING (has_permission('digital_twin', 'admin', tenant_id));

-- ─── Plugin Lifecycle ────────────────────────────────────────────────────────

CREATE POLICY plugins_select ON plugins FOR SELECT USING (TRUE);

CREATE POLICY plugin_versions_select ON plugin_versions FOR SELECT USING (TRUE);

CREATE POLICY plugin_installations_select ON plugin_installations
  FOR SELECT USING (tenant_id = ANY(get_user_tenant_ids()));

CREATE POLICY plugin_installations_manage ON plugin_installations
  FOR ALL USING (has_permission('plugin', 'admin', tenant_id));

CREATE POLICY plugin_permissions_select ON plugin_permissions FOR SELECT USING (TRUE);

CREATE POLICY plugin_dependencies_select ON plugin_dependencies FOR SELECT USING (TRUE);
