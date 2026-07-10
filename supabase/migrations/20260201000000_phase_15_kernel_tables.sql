-- RTB AI OS Phase 1.5 — Platform Kernel Tables
-- AI Director, Event Bus, Jobs, Workflow, Knowledge Graph, Memory,
-- Digital Twin, API Gateway, Notifications, Telemetry, Plugin Lifecycle

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. AI DIRECTOR KERNEL
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE ai_model_providers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN (
    'mock', 'openai', 'anthropic', 'gemini', 'azure_openai', 'local'
  )),
  config        JSONB NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_model_providers_tenant ON ai_model_providers(tenant_id);

CREATE TRIGGER ai_model_providers_updated_at
  BEFORE UPDATE ON ai_model_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE ai_model_routes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  intent        TEXT NOT NULL,
  provider_id   UUID NOT NULL REFERENCES ai_model_providers(id) ON DELETE RESTRICT,
  model_name    TEXT NOT NULL,
  priority      INTEGER NOT NULL DEFAULT 100,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, intent, priority)
);

CREATE INDEX idx_ai_model_routes_tenant ON ai_model_routes(tenant_id);
CREATE INDEX idx_ai_model_routes_intent ON ai_model_routes(tenant_id, intent);

CREATE TRIGGER ai_model_routes_updated_at
  BEFORE UPDATE ON ai_model_routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE agents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL,
  description     TEXT,
  agent_type      TEXT NOT NULL DEFAULT 'general',
  system_prompt   TEXT,
  capabilities    JSONB NOT NULL DEFAULT '[]',
  requires_review BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_agents_tenant ON agents(tenant_id);

CREATE TRIGGER agents_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE agent_tools (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  agent_id      UUID REFERENCES agents(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  tool_schema   JSONB NOT NULL DEFAULT '{}',
  handler_type  TEXT NOT NULL DEFAULT 'internal',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_tools_tenant ON agent_tools(tenant_id);
CREATE INDEX idx_agent_tools_agent ON agent_tools(agent_id);

CREATE TRIGGER agent_tools_updated_at
  BEFORE UPDATE ON agent_tools
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE agent_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  agent_id        UUID NOT NULL REFERENCES agents(id) ON DELETE RESTRICT,
  user_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id      UUID REFERENCES command_centre_sessions(id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed', 'review_required', 'cancelled'
  )),
  intent          TEXT,
  input           JSONB NOT NULL DEFAULT '{}',
  output          JSONB,
  confidence      NUMERIC(5,4),
  evidence_refs   JSONB NOT NULL DEFAULT '[]',
  requires_review BOOLEAN NOT NULL DEFAULT FALSE,
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  review_status   TEXT CHECK (review_status IN ('pending', 'approved', 'rejected')),
  error_message   TEXT,
  model_provider  TEXT,
  model_name      TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_runs_tenant ON agent_runs(tenant_id);
CREATE INDEX idx_agent_runs_agent ON agent_runs(agent_id);
CREATE INDEX idx_agent_runs_status ON agent_runs(status);
CREATE INDEX idx_agent_runs_created ON agent_runs(created_at DESC);

CREATE TRIGGER agent_runs_updated_at
  BEFORE UPDATE ON agent_runs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE agent_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id      UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
  content     TEXT NOT NULL,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_messages_run ON agent_messages(run_id);

CREATE TABLE agent_tool_calls (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  tool_id       UUID REFERENCES agent_tools(id) ON DELETE SET NULL,
  tool_name     TEXT NOT NULL,
  arguments     JSONB NOT NULL DEFAULT '{}',
  result        JSONB,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed'
  )),
  error_message TEXT,
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_tool_calls_run ON agent_tool_calls(run_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. PLATFORM EVENT BUS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  event_type    TEXT NOT NULL,
  source        TEXT NOT NULL DEFAULT 'platform',
  payload       JSONB NOT NULL DEFAULT '{}',
  metadata      JSONB NOT NULL DEFAULT '{}',
  correlation_id UUID,
  causation_id  UUID,
  status        TEXT NOT NULL DEFAULT 'published' CHECK (status IN (
    'published', 'dispatched', 'failed'
  )),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_type ON events(tenant_id, event_type);
CREATE INDEX idx_events_created ON events(created_at DESC);
CREATE INDEX idx_events_correlation ON events(correlation_id);

CREATE OR REPLACE FUNCTION prevent_event_modification()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Events are immutable and cannot be modified or deleted';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_no_update
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION prevent_event_modification();

CREATE TRIGGER events_no_delete
  BEFORE DELETE ON events
  FOR EACH ROW EXECUTE FUNCTION prevent_event_modification();

CREATE TABLE event_subscriptions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  event_type      TEXT NOT NULL,
  subscriber_type TEXT NOT NULL,
  subscriber_id   TEXT,
  handler_config  JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_subscriptions_tenant ON event_subscriptions(tenant_id);
CREATE INDEX idx_event_subscriptions_type ON event_subscriptions(tenant_id, event_type);

CREATE TRIGGER event_subscriptions_updated_at
  BEFORE UPDATE ON event_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE event_dispatch_attempts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id          UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  subscription_id   UUID REFERENCES event_subscriptions(id) ON DELETE SET NULL,
  status            TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed', 'retrying')),
  attempt_number    INTEGER NOT NULL DEFAULT 1,
  error_message     TEXT,
  response          JSONB,
  attempted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_event_dispatch_event ON event_dispatch_attempts(event_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. BACKGROUND JOB FRAMEWORK
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE background_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  job_type        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'queued', 'running', 'completed', 'failed', 'cancelled'
  )),
  priority        INTEGER NOT NULL DEFAULT 100,
  payload         JSONB NOT NULL DEFAULT '{}',
  result          JSONB,
  retry_count     INTEGER NOT NULL DEFAULT 0,
  max_retries     INTEGER NOT NULL DEFAULT 3,
  error_message   TEXT,
  scheduled_for   TIMESTAMPTZ,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_background_jobs_tenant ON background_jobs(tenant_id);
CREATE INDEX idx_background_jobs_status ON background_jobs(status);
CREATE INDEX idx_background_jobs_type ON background_jobs(job_type);
CREATE INDEX idx_background_jobs_scheduled ON background_jobs(scheduled_for) WHERE status = 'pending';

CREATE TRIGGER background_jobs_updated_at
  BEFORE UPDATE ON background_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE scheduled_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  job_type        TEXT NOT NULL,
  cron_expression TEXT NOT NULL,
  payload         JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  last_run_at     TIMESTAMPTZ,
  next_run_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE INDEX idx_scheduled_jobs_tenant ON scheduled_jobs(tenant_id);

CREATE TRIGGER scheduled_jobs_updated_at
  BEFORE UPDATE ON scheduled_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE job_attempts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id          UUID NOT NULL REFERENCES background_jobs(id) ON DELETE CASCADE,
  attempt_number  INTEGER NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
  error_message   TEXT,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX idx_job_attempts_job ON job_attempts(job_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. WORKFLOW ENGINE FOUNDATION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE workflow_definitions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL DEFAULT 'general',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, slug)
);

CREATE INDEX idx_workflow_definitions_tenant ON workflow_definitions(tenant_id);

CREATE TRIGGER workflow_definitions_updated_at
  BEFORE UPDATE ON workflow_definitions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE workflow_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  definition_id   UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE CASCADE,
  version         INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  config          JSONB NOT NULL DEFAULT '{}',
  published_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (definition_id, version)
);

CREATE INDEX idx_workflow_versions_definition ON workflow_versions(definition_id);

CREATE TABLE workflow_steps (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id      UUID NOT NULL REFERENCES workflow_versions(id) ON DELETE CASCADE,
  step_key        TEXT NOT NULL,
  step_type       TEXT NOT NULL CHECK (step_type IN (
    'action', 'approval', 'human_review', 'condition', 'notification', 'agent', 'delay'
  )),
  name            TEXT NOT NULL,
  config          JSONB NOT NULL DEFAULT '{}',
  position        INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (version_id, step_key)
);

CREATE INDEX idx_workflow_steps_version ON workflow_steps(version_id);

CREATE TABLE workflow_transitions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id      UUID NOT NULL REFERENCES workflow_versions(id) ON DELETE CASCADE,
  from_step_key   TEXT NOT NULL,
  to_step_key     TEXT NOT NULL,
  condition       JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_transitions_version ON workflow_transitions(version_id);

CREATE TABLE workflow_instances (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  definition_id   UUID NOT NULL REFERENCES workflow_definitions(id) ON DELETE RESTRICT,
  version_id      UUID NOT NULL REFERENCES workflow_versions(id) ON DELETE RESTRICT,
  status          TEXT NOT NULL DEFAULT 'running' CHECK (status IN (
    'running', 'completed', 'failed', 'cancelled', 'waiting_review'
  )),
  current_step_key TEXT,
  context         JSONB NOT NULL DEFAULT '{}',
  started_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_instances_tenant ON workflow_instances(tenant_id);
CREATE INDEX idx_workflow_instances_status ON workflow_instances(status);

CREATE TRIGGER workflow_instances_updated_at
  BEFORE UPDATE ON workflow_instances
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE workflow_step_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id     UUID NOT NULL REFERENCES workflow_instances(id) ON DELETE CASCADE,
  step_key        TEXT NOT NULL,
  step_type       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed', 'skipped', 'waiting_review'
  )),
  input           JSONB NOT NULL DEFAULT '{}',
  output          JSONB,
  assigned_to     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  review_status   TEXT CHECK (review_status IN ('pending', 'approved', 'rejected')),
  error_message   TEXT,
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workflow_step_runs_instance ON workflow_step_runs(instance_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. KNOWLEDGE GRAPH FOUNDATION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE knowledge_node_types (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type_key      TEXT NOT NULL,
  label         TEXT NOT NULL,
  description   TEXT,
  schema        JSONB NOT NULL DEFAULT '{}',
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, type_key)
);

CREATE TABLE knowledge_edge_types (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type_key      TEXT NOT NULL,
  label         TEXT NOT NULL,
  description   TEXT,
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, type_key)
);

CREATE TABLE knowledge_nodes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  node_type     TEXT NOT NULL,
  title         TEXT NOT NULL,
  content       JSONB NOT NULL DEFAULT '{}',
  source_ref    TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_knowledge_nodes_tenant ON knowledge_nodes(tenant_id);
CREATE INDEX idx_knowledge_nodes_type ON knowledge_nodes(tenant_id, node_type);

CREATE TRIGGER knowledge_nodes_updated_at
  BEFORE UPDATE ON knowledge_nodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE knowledge_edges (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_node_id  UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  to_node_id    UUID NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
  edge_type     TEXT NOT NULL,
  weight        NUMERIC(5,4) DEFAULT 1.0,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, from_node_id, to_node_id, edge_type)
);

CREATE INDEX idx_knowledge_edges_tenant ON knowledge_edges(tenant_id);
CREATE INDEX idx_knowledge_edges_from ON knowledge_edges(from_node_id);
CREATE INDEX idx_knowledge_edges_to ON knowledge_edges(to_node_id);

CREATE TABLE evidence_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  node_id       UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  source_type   TEXT NOT NULL,
  source_id     TEXT NOT NULL,
  excerpt       TEXT,
  score         NUMERIC(5,4),
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_evidence_items_tenant ON evidence_items(tenant_id);
CREATE INDEX idx_evidence_items_node ON evidence_items(node_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. AI MEMORY FOUNDATION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE memory_scopes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope_key     TEXT NOT NULL UNIQUE,
  label         TEXT NOT NULL,
  description   TEXT,
  retention_days INTEGER,
  is_system     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE ai_memories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  scope_key       TEXT NOT NULL REFERENCES memory_scopes(scope_key),
  scope_ref_id    TEXT NOT NULL,
  content         TEXT NOT NULL,
  classification  TEXT NOT NULL DEFAULT 'general' CHECK (classification IN (
    'general', 'sensitive', 'confidential', 'public'
  )),
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expires_at      TIMESTAMPTZ,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_memories_tenant ON ai_memories(tenant_id);
CREATE INDEX idx_ai_memories_scope ON ai_memories(tenant_id, scope_key, scope_ref_id);
CREATE INDEX idx_ai_memories_active ON ai_memories(tenant_id) WHERE deleted_at IS NULL;

CREATE TRIGGER ai_memories_updated_at
  BEFORE UPDATE ON ai_memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE memory_links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id     UUID NOT NULL REFERENCES ai_memories(id) ON DELETE CASCADE,
  link_type     TEXT NOT NULL,
  link_ref_id   TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_memory_links_memory ON memory_links(memory_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. DIGITAL TWIN FRAMEWORK
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE digital_twin_types (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  type_key      TEXT NOT NULL,
  label         TEXT NOT NULL,
  description   TEXT,
  schema        JSONB NOT NULL DEFAULT '{}',
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, type_key)
);

CREATE TABLE digital_twins (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id    UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  twin_type       TEXT NOT NULL,
  name            TEXT NOT NULL,
  external_id     TEXT,
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN (
    'active', 'inactive', 'maintenance', 'decommissioned'
  )),
  metadata        JSONB NOT NULL DEFAULT '{}',
  knowledge_node_id UUID REFERENCES knowledge_nodes(id) ON DELETE SET NULL,
  created_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_digital_twins_tenant ON digital_twins(tenant_id);
CREATE INDEX idx_digital_twins_type ON digital_twins(tenant_id, twin_type);

CREATE TRIGGER digital_twins_updated_at
  BEFORE UPDATE ON digital_twins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE digital_twin_relationships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  from_twin_id    UUID NOT NULL REFERENCES digital_twins(id) ON DELETE CASCADE,
  to_twin_id      UUID NOT NULL REFERENCES digital_twins(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, from_twin_id, to_twin_id, relationship_type)
);

CREATE INDEX idx_digital_twin_relationships_tenant ON digital_twin_relationships(tenant_id);

CREATE TABLE digital_twin_attributes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id       UUID NOT NULL REFERENCES digital_twins(id) ON DELETE CASCADE,
  key           TEXT NOT NULL,
  value         JSONB NOT NULL,
  unit          TEXT,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (twin_id, key)
);

CREATE INDEX idx_digital_twin_attributes_twin ON digital_twin_attributes(twin_id);

CREATE TABLE digital_twin_status_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  twin_id       UUID NOT NULL REFERENCES digital_twins(id) ON DELETE CASCADE,
  status        TEXT NOT NULL,
  reason        TEXT,
  changed_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_digital_twin_status_history_twin ON digital_twin_status_history(twin_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. API GATEWAY FOUNDATION
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE api_keys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  key_prefix    TEXT NOT NULL,
  key_hash      TEXT NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at    TIMESTAMPTZ,
  last_used_at  TIMESTAMPTZ,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_keys_tenant ON api_keys(tenant_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(key_prefix);

CREATE TRIGGER api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE api_key_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id    UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  resource      TEXT NOT NULL,
  action        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (api_key_id, resource, action)
);

CREATE INDEX idx_api_key_permissions_key ON api_key_permissions(api_key_id);

CREATE TABLE api_usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  api_key_id    UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint      TEXT NOT NULL,
  method        TEXT NOT NULL,
  status_code   INTEGER,
  latency_ms    INTEGER,
  ip_address    INET,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_api_usage_logs_tenant ON api_usage_logs(tenant_id);
CREATE INDEX idx_api_usage_logs_created ON api_usage_logs(created_at DESC);

CREATE TABLE external_integrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  integration_type TEXT NOT NULL,
  config        JSONB NOT NULL DEFAULT '{}',
  credentials_ref TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE INDEX idx_external_integrations_tenant ON external_integrations(tenant_id);

CREATE TRIGGER external_integrations_updated_at
  BEFORE UPDATE ON external_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE webhooks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  url           TEXT NOT NULL,
  secret_hash   TEXT,
  event_types   JSONB NOT NULL DEFAULT '[]',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_webhooks_tenant ON webhooks(tenant_id);

CREATE TRIGGER webhooks_updated_at
  BEFORE UPDATE ON webhooks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. NOTIFICATION ENGINE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type          TEXT NOT NULL,
  title         TEXT NOT NULL,
  body          TEXT,
  priority      TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  link_target   TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  read_at       TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

CREATE TABLE notification_preferences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  in_app        BOOLEAN NOT NULL DEFAULT TRUE,
  email         BOOLEAN NOT NULL DEFAULT FALSE,
  sms           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id, notification_type)
);

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);

CREATE TRIGGER notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE notification_deliveries (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id   UUID NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  channel           TEXT NOT NULL CHECK (channel IN ('in_app', 'email', 'sms')),
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'sent', 'failed', 'skipped'
  )),
  error_message     TEXT,
  sent_at           TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notification_deliveries_notification ON notification_deliveries(notification_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. TELEMETRY AND SENSOR FRAMEWORK
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE sensors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  sensor_type     TEXT NOT NULL,
  digital_twin_id UUID REFERENCES digital_twins(id) ON DELETE SET NULL,
  location        JSONB,
  metadata        JSONB NOT NULL DEFAULT '{}',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sensors_tenant ON sensors(tenant_id);
CREATE INDEX idx_sensors_twin ON sensors(digital_twin_id);

CREATE TRIGGER sensors_updated_at
  BEFORE UPDATE ON sensors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE telemetry_streams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  sensor_id     UUID NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  stream_key    TEXT NOT NULL,
  unit          TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (sensor_id, stream_key)
);

CREATE INDEX idx_telemetry_streams_tenant ON telemetry_streams(tenant_id);

CREATE TABLE telemetry_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stream_id     UUID NOT NULL REFERENCES telemetry_streams(id) ON DELETE CASCADE,
  value         JSONB NOT NULL,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ingested_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_telemetry_events_stream ON telemetry_events(stream_id, recorded_at DESC);
CREATE INDEX idx_telemetry_events_tenant ON telemetry_events(tenant_id);

CREATE TABLE telemetry_alert_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  stream_id     UUID REFERENCES telemetry_streams(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  condition     JSONB NOT NULL,
  severity      TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_telemetry_alert_rules_tenant ON telemetry_alert_rules(tenant_id);

CREATE TRIGGER telemetry_alert_rules_updated_at
  BEFORE UPDATE ON telemetry_alert_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. PLUGIN REGISTRY AND LIFECYCLE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE plugins (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id     TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  author        TEXT NOT NULL,
  operating_system TEXT,
  is_official   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER plugins_updated_at
  BEFORE UPDATE ON plugins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE plugin_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_id     UUID NOT NULL REFERENCES plugins(id) ON DELETE CASCADE,
  version       TEXT NOT NULL,
  manifest      JSONB NOT NULL,
  changelog     TEXT,
  status        TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'deprecated')),
  published_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plugin_id, version)
);

CREATE INDEX idx_plugin_versions_plugin ON plugin_versions(plugin_id);

CREATE TABLE plugin_installations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  plugin_id         UUID NOT NULL REFERENCES plugins(id) ON DELETE RESTRICT,
  plugin_version_id UUID NOT NULL REFERENCES plugin_versions(id) ON DELETE RESTRICT,
  status            TEXT NOT NULL DEFAULT 'installed' CHECK (status IN (
    'installed', 'enabled', 'disabled', 'error', 'uninstalled'
  )),
  config            JSONB NOT NULL DEFAULT '{}',
  installed_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  installed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, plugin_id)
);

CREATE INDEX idx_plugin_installations_tenant ON plugin_installations(tenant_id);

CREATE TRIGGER plugin_installations_updated_at
  BEFORE UPDATE ON plugin_installations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE plugin_permissions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_version_id UUID NOT NULL REFERENCES plugin_versions(id) ON DELETE CASCADE,
  resource          TEXT NOT NULL,
  action            TEXT NOT NULL,
  description       TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plugin_version_id, resource, action)
);

CREATE INDEX idx_plugin_permissions_version ON plugin_permissions(plugin_version_id);

CREATE TABLE plugin_dependencies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plugin_version_id     UUID NOT NULL REFERENCES plugin_versions(id) ON DELETE CASCADE,
  depends_on_plugin_id  TEXT NOT NULL,
  min_version           TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_plugin_dependencies_version ON plugin_dependencies(plugin_version_id);
