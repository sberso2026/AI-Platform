-- RTB AI OS Phase 1.5 — Seed Data for Platform Kernel

-- Memory scopes
INSERT INTO memory_scopes (scope_key, label, description, retention_days) VALUES
  ('conversation', 'Conversation', 'Per-conversation memory in Command Centre', 90),
  ('agent', 'Agent', 'Agent-specific learned context', 180),
  ('project', 'Project', 'Project-scoped memory', 365),
  ('workspace', 'Workspace', 'Workspace-level memory', 365),
  ('tenant', 'Tenant', 'Organization-wide memory', NULL),
  ('operating_system', 'Operating System', 'OS-specific memory', NULL)
ON CONFLICT (scope_key) DO NOTHING;

-- System knowledge node types (tenant_id NULL = global)
INSERT INTO knowledge_node_types (tenant_id, type_key, label, description, is_system) VALUES
  (NULL, 'document', 'Document', 'Uploaded or indexed document', TRUE),
  (NULL, 'chunk', 'Chunk', 'Document chunk or segment', TRUE),
  (NULL, 'task', 'Task', 'Work task or action item', TRUE),
  (NULL, 'action', 'Action', 'Executed platform action', TRUE),
  (NULL, 'decision', 'Decision', 'Human or AI decision record', TRUE),
  (NULL, 'risk', 'Risk', 'Identified risk', TRUE),
  (NULL, 'agent_run', 'Agent Run', 'AI agent execution', TRUE),
  (NULL, 'workflow', 'Workflow', 'Workflow instance', TRUE),
  (NULL, 'asset', 'Asset', 'Physical or logical asset', TRUE),
  (NULL, 'person', 'Person', 'Person or user reference', TRUE),
  (NULL, 'organization', 'Organization', 'Organization entity', TRUE),
  (NULL, 'project', 'Project', 'Project entity', TRUE),
  (NULL, 'workspace', 'Workspace', 'Workspace reference', TRUE)
ON CONFLICT DO NOTHING;

-- System knowledge edge types
INSERT INTO knowledge_edge_types (tenant_id, type_key, label, description, is_system) VALUES
  (NULL, 'references', 'References', 'References another entity', TRUE),
  (NULL, 'supports', 'Supports', 'Provides supporting evidence', TRUE),
  (NULL, 'contradicts', 'Contradicts', 'Contradicts another entity', TRUE),
  (NULL, 'created_by', 'Created By', 'Created by entity', TRUE),
  (NULL, 'assigned_to', 'Assigned To', 'Assigned to entity', TRUE),
  (NULL, 'affects', 'Affects', 'Affects another entity', TRUE),
  (NULL, 'belongs_to', 'Belongs To', 'Belongs to parent entity', TRUE),
  (NULL, 'derived_from', 'Derived From', 'Derived from source', TRUE),
  (NULL, 'requires_review', 'Requires Review', 'Requires human review', TRUE),
  (NULL, 'resolved_by', 'Resolved By', 'Resolved by entity', TRUE)
ON CONFLICT DO NOTHING;

-- System digital twin types
INSERT INTO digital_twin_types (tenant_id, type_key, label, description, is_system) VALUES
  (NULL, 'asset', 'Asset', 'Generic asset', TRUE),
  (NULL, 'equipment', 'Equipment', 'Industrial equipment', TRUE),
  (NULL, 'building', 'Building', 'Building structure', TRUE),
  (NULL, 'vehicle', 'Vehicle', 'Fleet vehicle', TRUE),
  (NULL, 'infrastructure', 'Infrastructure', 'Civil infrastructure', TRUE),
  (NULL, 'facility', 'Facility', 'Industrial facility', TRUE),
  (NULL, 'system', 'System', 'Logical system', TRUE),
  (NULL, 'city_zone', 'City Zone', 'Smart city zone', TRUE),
  (NULL, 'robot', 'Robot', 'Autonomous robot', TRUE),
  (NULL, 'sensor', 'Sensor', 'Sensor device', TRUE)
ON CONFLICT DO NOTHING;

-- System mock AI model provider (global)
INSERT INTO ai_model_providers (tenant_id, name, provider_type, config, is_active, is_system)
VALUES (NULL, 'Mock Provider', 'mock', '{"description": "Development mock adapter"}', TRUE, TRUE);

-- Provision kernel defaults per tenant
CREATE OR REPLACE FUNCTION provision_tenant_kernel_defaults(p_tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  v_mock_provider_id UUID;
  v_agent_id UUID;
BEGIN
  -- Mock provider for tenant
  INSERT INTO ai_model_providers (tenant_id, name, provider_type, config, is_active)
  VALUES (p_tenant_id, 'Mock Provider', 'mock', '{}', TRUE)
  RETURNING id INTO v_mock_provider_id;

  -- Default model routes
  INSERT INTO ai_model_routes (tenant_id, intent, provider_id, model_name, priority) VALUES
    (p_tenant_id, 'general', v_mock_provider_id, 'mock-gpt', 100),
    (p_tenant_id, 'navigation', v_mock_provider_id, 'mock-gpt', 100),
    (p_tenant_id, 'analysis', v_mock_provider_id, 'mock-gpt', 100);

  -- Default platform agent
  INSERT INTO agents (tenant_id, name, slug, description, agent_type, system_prompt, requires_review)
  VALUES (
    p_tenant_id,
    'Platform Assistant',
    'platform-assistant',
    'Default RTB AI OS platform assistant',
    'general',
    'You are the RTB AI OS platform assistant. Help users navigate the platform, understand capabilities, and coordinate operations. Never approve engineering decisions autonomously.',
    FALSE
  )
  RETURNING id INTO v_agent_id;

  -- Event subscriptions for notifications
  INSERT INTO event_subscriptions (tenant_id, event_type, subscriber_type, handler_config) VALUES
    (p_tenant_id, 'agent.run.completed', 'notification', '{"template": "agent.completed"}'),
    (p_tenant_id, 'review.required', 'notification', '{"template": "review.required"}'),
    (p_tenant_id, 'workflow.failed', 'notification', '{"template": "workflow.failed"}');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION handle_new_tenant_kernel()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM provision_tenant_kernel_defaults(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_tenant_created_kernel
  AFTER INSERT ON tenants
  FOR EACH ROW EXECUTE FUNCTION handle_new_tenant_kernel();

-- Seed default workflow definitions function
CREATE OR REPLACE FUNCTION seed_tenant_workflows(p_tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  v_def_id UUID;
  v_ver_id UUID;
BEGIN
  -- Human review workflow
  INSERT INTO workflow_definitions (tenant_id, name, slug, description, category)
  VALUES (p_tenant_id, 'Human Review', 'human-review', 'Generic human review workflow', 'approval')
  RETURNING id INTO v_def_id;

  INSERT INTO workflow_versions (definition_id, version, status, config, published_at)
  VALUES (v_def_id, 1, 'published', '{}', NOW())
  RETURNING id INTO v_ver_id;

  INSERT INTO workflow_steps (version_id, step_key, step_type, name, config, position) VALUES
    (v_ver_id, 'submit', 'action', 'Submit for Review', '{}', 0),
    (v_ver_id, 'review', 'human_review', 'Human Review', '{"requires_approval": true}', 1),
    (v_ver_id, 'complete', 'action', 'Complete', '{}', 2);

  INSERT INTO workflow_transitions (version_id, from_step_key, to_step_key) VALUES
    (v_ver_id, 'submit', 'review'),
    (v_ver_id, 'review', 'complete');

  -- Agent answer approval workflow
  INSERT INTO workflow_definitions (tenant_id, name, slug, description, category)
  VALUES (p_tenant_id, 'Agent Answer Approval', 'agent-answer-approval', 'Review AI agent outputs before delivery', 'approval')
  RETURNING id INTO v_def_id;

  INSERT INTO workflow_versions (definition_id, version, status, config, published_at)
  VALUES (v_def_id, 1, 'published', '{}', NOW())
  RETURNING id INTO v_ver_id;

  INSERT INTO workflow_steps (version_id, step_key, step_type, name, config, position) VALUES
    (v_ver_id, 'agent_output', 'agent', 'Agent Generates Output', '{}', 0),
    (v_ver_id, 'review', 'approval', 'Approve Output', '{"no_autonomous_approval": true}', 1),
    (v_ver_id, 'deliver', 'notification', 'Deliver to User', '{}', 2);

  INSERT INTO workflow_transitions (version_id, from_step_key, to_step_key) VALUES
    (v_ver_id, 'agent_output', 'review'),
    (v_ver_id, 'review', 'deliver');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Extend tenant creation to seed workflows
CREATE OR REPLACE FUNCTION handle_new_tenant()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_default_tenant_roles(NEW.id);
  INSERT INTO workspaces (tenant_id, name, slug, description, type)
  VALUES (NEW.id, 'Default Workspace', 'default', 'Primary workspace', 'default');
  PERFORM seed_tenant_workflows(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
