-- RTB AI Platform Batch 1.75 — Platform Intelligence Control Layer Tables

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. AI TOOL REGISTRY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE ai_tools (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tool_key            TEXT NOT NULL,
  name                TEXT NOT NULL,
  description         TEXT,
  category            TEXT NOT NULL DEFAULT 'external_api',
  provider            TEXT NOT NULL DEFAULT 'platform',
  version             TEXT NOT NULL DEFAULT '1.0.0',
  status              TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'deprecated', 'disabled')),
  risk_level          TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  required_permissions JSONB NOT NULL DEFAULT '[]',
  input_schema        JSONB NOT NULL DEFAULT '{}',
  output_schema       JSONB NOT NULL DEFAULT '{}',
  plugin_id           UUID REFERENCES plugins(id) ON DELETE SET NULL,
  created_by          UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, tool_key)
);

CREATE INDEX idx_ai_tools_tenant ON ai_tools(tenant_id);
CREATE INDEX idx_ai_tools_category ON ai_tools(tenant_id, category);
CREATE INDEX idx_ai_tools_status ON ai_tools(tenant_id, status);

CREATE TRIGGER ai_tools_updated_at
  BEFORE UPDATE ON ai_tools FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE ai_tool_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id       UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  version       TEXT NOT NULL,
  input_schema  JSONB NOT NULL DEFAULT '{}',
  output_schema JSONB NOT NULL DEFAULT '{}',
  changelog     TEXT,
  status        TEXT NOT NULL DEFAULT 'active',
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, version)
);

CREATE INDEX idx_ai_tool_versions_tool ON ai_tool_versions(tool_id);

CREATE TABLE ai_tool_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tool_id       UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  principal_type TEXT NOT NULL CHECK (principal_type IN ('agent', 'role', 'user', 'plugin')),
  principal_id  UUID NOT NULL,
  permission    TEXT NOT NULL DEFAULT 'execute' CHECK (permission IN ('execute', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, principal_type, principal_id, permission)
);

CREATE INDEX idx_ai_tool_permissions_tenant ON ai_tool_permissions(tenant_id);
CREATE INDEX idx_ai_tool_permissions_tool ON ai_tool_permissions(tool_id);

CREATE TABLE ai_tool_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tool_id       UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  assignee_type TEXT NOT NULL CHECK (assignee_type IN ('agent', 'plugin')),
  assignee_id   UUID NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tool_id, assignee_type, assignee_id)
);

CREATE INDEX idx_ai_tool_assignments_tenant ON ai_tool_assignments(tenant_id);
CREATE INDEX idx_ai_tool_assignments_assignee ON ai_tool_assignments(assignee_type, assignee_id);

CREATE TABLE ai_tool_usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tool_id       UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  agent_id      UUID REFERENCES agents(id) ON DELETE SET NULL,
  run_id        UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  input         JSONB NOT NULL DEFAULT '{}',
  output        JSONB,
  status        TEXT NOT NULL DEFAULT 'completed',
  duration_ms   INTEGER,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_tool_usage_logs_tenant ON ai_tool_usage_logs(tenant_id);
CREATE INDEX idx_ai_tool_usage_logs_tool ON ai_tool_usage_logs(tool_id);
CREATE INDEX idx_ai_tool_usage_logs_created ON ai_tool_usage_logs(created_at DESC);

CREATE TABLE ai_tool_health_checks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  tool_id       UUID NOT NULL REFERENCES ai_tools(id) ON DELETE CASCADE,
  status        TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  latency_ms    INTEGER,
  message       TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_tool_health_checks_tool ON ai_tool_health_checks(tool_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. CAPABILITY REGISTRY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE capabilities (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID REFERENCES tenants(id) ON DELETE CASCADE,
  capability_key  TEXT NOT NULL,
  name            TEXT NOT NULL,
  description     TEXT,
  category        TEXT NOT NULL DEFAULT 'platform',
  operating_system TEXT,
  status          TEXT NOT NULL DEFAULT 'enabled' CHECK (status IN ('enabled', 'disabled', 'deprecated')),
  is_platform     BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_capabilities_tenant_key ON capabilities(tenant_id, capability_key) WHERE tenant_id IS NOT NULL;
CREATE UNIQUE INDEX idx_capabilities_platform_key ON capabilities(capability_key) WHERE tenant_id IS NULL AND is_platform = TRUE;
CREATE INDEX idx_capabilities_tenant ON capabilities(tenant_id);
CREATE INDEX idx_capabilities_os ON capabilities(operating_system);

CREATE TRIGGER capabilities_updated_at
  BEFORE UPDATE ON capabilities FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE capability_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id   UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  version         TEXT NOT NULL,
  schema          JSONB NOT NULL DEFAULT '{}',
  status          TEXT NOT NULL DEFAULT 'active',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (capability_id, version)
);

CREATE INDEX idx_capability_versions_cap ON capability_versions(capability_id);

CREATE TABLE capability_assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  capability_id   UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  assignee_type   TEXT NOT NULL CHECK (assignee_type IN ('agent', 'plugin', 'tool', 'workflow')),
  assignee_id     UUID NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (capability_id, assignee_type, assignee_id)
);

CREATE INDEX idx_capability_assignments_tenant ON capability_assignments(tenant_id);
CREATE INDEX idx_capability_assignments_assignee ON capability_assignments(assignee_type, assignee_id);

CREATE TABLE capability_dependencies (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capability_id         UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  depends_on_capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  is_required           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (capability_id, depends_on_capability_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. POLICY ENGINE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE policies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  policy_key    TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL DEFAULT 'safety',
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'disabled', 'archived')),
  priority      INTEGER NOT NULL DEFAULT 100,
  is_platform   BOOLEAN NOT NULL DEFAULT FALSE,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_policies_tenant_key ON policies(tenant_id, policy_key) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_policies_tenant ON policies(tenant_id);
CREATE INDEX idx_policies_status ON policies(status);

CREATE TRIGGER policies_updated_at
  BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE policy_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id     UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  version       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (policy_id, version)
);

CREATE TABLE policy_conditions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id     UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL CHECK (condition_type IN (
    'confidence_threshold', 'risk_level', 'role_required', 'tenant_setting',
    'model_provider_allowed', 'tool_permission_required', 'human_review_required',
    'data_classification', 'operating_system_scope', 'workflow_state'
  )),
  operator      TEXT NOT NULL DEFAULT 'eq',
  value         JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_conditions_policy ON policy_conditions(policy_id);

CREATE TABLE policy_actions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  policy_id     UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  action_type   TEXT NOT NULL CHECK (action_type IN (
    'allow', 'deny', 'require_review', 'require_approval', 'redact', 'escalate', 'log_only'
  )),
  parameters    JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_actions_policy ON policy_actions(policy_id);

CREATE TABLE policy_evaluations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  policy_id     UUID REFERENCES policies(id) ON DELETE SET NULL,
  context_type  TEXT NOT NULL,
  context_id    UUID,
  result        TEXT NOT NULL CHECK (result IN ('allow', 'deny', 'review', 'approval', 'log_only')),
  actions       JSONB NOT NULL DEFAULT '[]',
  simulation    BOOLEAN NOT NULL DEFAULT FALSE,
  evaluated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_evaluations_tenant ON policy_evaluations(tenant_id);
CREATE INDEX idx_policy_evaluations_evaluated ON policy_evaluations(evaluated_at DESC);

CREATE TABLE policy_violations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  policy_id     UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
  evaluation_id UUID REFERENCES policy_evaluations(id) ON DELETE SET NULL,
  context_type  TEXT NOT NULL,
  context_id    UUID,
  severity      TEXT NOT NULL DEFAULT 'medium',
  message       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_policy_violations_tenant ON policy_violations(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. PROMPT REGISTRY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE prompts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  prompt_key    TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  agent_type    TEXT,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'review', 'approved', 'active', 'deprecated', 'archived'
  )),
  is_safety_critical BOOLEAN NOT NULL DEFAULT FALSE,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, prompt_key)
);

CREATE INDEX idx_prompts_tenant ON prompts(tenant_id);

CREATE TRIGGER prompts_updated_at
  BEFORE UPDATE ON prompts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE prompt_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_id     UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  version       TEXT NOT NULL,
  content       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'review', 'approved', 'active', 'deprecated', 'archived'
  )),
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prompt_id, version)
);

CREATE INDEX idx_prompt_versions_prompt ON prompt_versions(prompt_id);
CREATE INDEX idx_prompt_versions_status ON prompt_versions(status);

CREATE TABLE prompt_variables (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_version_id UUID NOT NULL REFERENCES prompt_versions(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  default_value TEXT,
  required      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (prompt_version_id, name)
);

CREATE TABLE prompt_usage_logs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  prompt_id         UUID NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
  prompt_version_id UUID NOT NULL REFERENCES prompt_versions(id) ON DELETE CASCADE,
  agent_id          UUID REFERENCES agents(id) ON DELETE SET NULL,
  run_id            UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prompt_usage_logs_tenant ON prompt_usage_logs(tenant_id);

CREATE TABLE prompt_approvals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prompt_version_id UUID NOT NULL REFERENCES prompt_versions(id) ON DELETE CASCADE,
  reviewer_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status            TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. MODEL REGISTRY
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE model_providers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider_key  TEXT NOT NULL,
  name          TEXT NOT NULL,
  provider_type TEXT NOT NULL CHECK (provider_type IN (
    'mock', 'openai', 'anthropic', 'gemini', 'azure_openai', 'local'
  )),
  config        JSONB NOT NULL DEFAULT '{}',
  status        TEXT NOT NULL DEFAULT 'active',
  is_system     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_model_providers_tenant ON model_providers(tenant_id);

CREATE TRIGGER model_providers_updated_at
  BEFORE UPDATE ON model_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE model_registry (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         UUID REFERENCES tenants(id) ON DELETE CASCADE,
  provider_id       UUID NOT NULL REFERENCES model_providers(id) ON DELETE RESTRICT,
  model_key         TEXT NOT NULL,
  display_name      TEXT NOT NULL,
  context_window    INTEGER NOT NULL DEFAULT 8192,
  supports_text     BOOLEAN NOT NULL DEFAULT TRUE,
  supports_vision   BOOLEAN NOT NULL DEFAULT FALSE,
  supports_audio    BOOLEAN NOT NULL DEFAULT FALSE,
  supports_tools    BOOLEAN NOT NULL DEFAULT FALSE,
  supports_json_mode BOOLEAN NOT NULL DEFAULT FALSE,
  supports_reasoning BOOLEAN NOT NULL DEFAULT FALSE,
  cost_input_per_1k  NUMERIC(12,6) NOT NULL DEFAULT 0,
  cost_output_per_1k NUMERIC(12,6) NOT NULL DEFAULT 0,
  latency_class     TEXT NOT NULL DEFAULT 'standard',
  risk_class        TEXT NOT NULL DEFAULT 'low',
  status            TEXT NOT NULL DEFAULT 'active',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_model_registry_tenant ON model_registry(tenant_id);
CREATE INDEX idx_model_registry_provider ON model_registry(provider_id);

CREATE TRIGGER model_registry_updated_at
  BEFORE UPDATE ON model_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE model_capabilities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id      UUID NOT NULL REFERENCES model_registry(id) ON DELETE CASCADE,
  capability    TEXT NOT NULL,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (model_id, capability)
);

CREATE TABLE model_routes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  intent        TEXT NOT NULL,
  model_id      UUID NOT NULL REFERENCES model_registry(id) ON DELETE RESTRICT,
  priority      INTEGER NOT NULL DEFAULT 100,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, intent, priority)
);

CREATE INDEX idx_model_routes_tenant ON model_routes(tenant_id, intent);

CREATE TRIGGER model_routes_updated_at
  BEFORE UPDATE ON model_routes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE model_usage_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  model_id      UUID NOT NULL REFERENCES model_registry(id) ON DELETE CASCADE,
  run_id        UUID REFERENCES agent_runs(id) ON DELETE SET NULL,
  input_tokens  INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms    INTEGER,
  status        TEXT NOT NULL DEFAULT 'completed',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_model_usage_logs_tenant ON model_usage_logs(tenant_id);

CREATE TABLE tenant_model_policies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  provider_type TEXT,
  model_id      UUID REFERENCES model_registry(id) ON DELETE CASCADE,
  policy_type   TEXT NOT NULL CHECK (policy_type IN ('allow', 'deny')),
  reason        TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_tenant_model_policies_tenant ON tenant_model_policies(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. COST ENGINE
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE cost_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  workspace_id  UUID REFERENCES workspaces(id) ON DELETE SET NULL,
  event_type    TEXT NOT NULL CHECK (event_type IN (
    'model_call', 'tool_call', 'background_job', 'document_processing',
    'embedding_generation', 'telemetry_processing', 'report_generation'
  )),
  amount        NUMERIC(14,6) NOT NULL DEFAULT 0,
  currency      TEXT NOT NULL DEFAULT 'USD',
  quantity      NUMERIC(14,4) NOT NULL DEFAULT 0,
  unit          TEXT NOT NULL DEFAULT 'tokens',
  metadata      JSONB NOT NULL DEFAULT '{}',
  source_type   TEXT,
  source_id     UUID,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_events_tenant ON cost_events(tenant_id);
CREATE INDEX idx_cost_events_type ON cost_events(tenant_id, event_type);
CREATE INDEX idx_cost_events_created ON cost_events(created_at DESC);

CREATE TABLE cost_allocations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cost_event_id UUID NOT NULL REFERENCES cost_events(id) ON DELETE CASCADE,
  dimension     TEXT NOT NULL CHECK (dimension IN (
    'tenant', 'workspace', 'project', 'plugin', 'operating_system', 'agent', 'user'
  )),
  dimension_id  UUID,
  amount        NUMERIC(14,6) NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_allocations_event ON cost_allocations(cost_event_id);

CREATE TABLE cost_rates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  rate_key      TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  unit_cost     NUMERIC(14,6) NOT NULL DEFAULT 0,
  unit          TEXT NOT NULL DEFAULT 'token',
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_rates_tenant ON cost_rates(tenant_id);

CREATE TABLE cost_budgets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  dimension     TEXT NOT NULL,
  dimension_id  UUID,
  amount_limit  NUMERIC(14,2) NOT NULL,
  period        TEXT NOT NULL DEFAULT 'monthly',
  status        TEXT NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_budgets_tenant ON cost_budgets(tenant_id);

CREATE TRIGGER cost_budgets_updated_at
  BEFORE UPDATE ON cost_budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE cost_alerts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  budget_id     UUID REFERENCES cost_budgets(id) ON DELETE CASCADE,
  threshold_pct NUMERIC(5,2) NOT NULL DEFAULT 80,
  status        TEXT NOT NULL DEFAULT 'active',
  triggered_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cost_alerts_tenant ON cost_alerts(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. OBSERVABILITY FRAMEWORK
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE traces (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  trace_key     TEXT NOT NULL,
  name          TEXT NOT NULL,
  source        TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  metadata      JSONB NOT NULL DEFAULT '{}',
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_traces_tenant ON traces(tenant_id);
CREATE INDEX idx_traces_started ON traces(started_at DESC);

CREATE TABLE trace_spans (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id      UUID NOT NULL REFERENCES traces(id) ON DELETE CASCADE,
  parent_id     UUID REFERENCES trace_spans(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  span_type     TEXT NOT NULL DEFAULT 'internal',
  status        TEXT NOT NULL DEFAULT 'running',
  duration_ms   INTEGER,
  metadata      JSONB NOT NULL DEFAULT '{}',
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ
);

CREATE INDEX idx_trace_spans_trace ON trace_spans(trace_id);

CREATE TABLE metric_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  metric_name   TEXT NOT NULL,
  metric_value  NUMERIC(14,4) NOT NULL,
  unit          TEXT,
  dimensions    JSONB NOT NULL DEFAULT '{}',
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_metric_events_tenant ON metric_events(tenant_id);
CREATE INDEX idx_metric_events_name ON metric_events(tenant_id, metric_name);

CREATE TABLE error_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  trace_id      UUID REFERENCES traces(id) ON DELETE SET NULL,
  source        TEXT NOT NULL,
  error_code    TEXT,
  message       TEXT NOT NULL,
  stack         TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_error_events_tenant ON error_events(tenant_id);

CREATE TABLE health_checks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  service_name  TEXT NOT NULL,
  status        TEXT NOT NULL CHECK (status IN ('healthy', 'degraded', 'unhealthy')),
  latency_ms    INTEGER,
  message       TEXT,
  checked_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_checks_service ON health_checks(service_name);

CREATE TABLE service_status (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  service_name  TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'operational',
  last_heartbeat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata      JSONB NOT NULL DEFAULT '{}',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_service_status_service ON service_status(service_name);

CREATE TRIGGER service_status_updated_at
  BEFORE UPDATE ON service_status FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Extend agent_runs with intelligence references
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS prompt_version_id UUID REFERENCES prompt_versions(id) ON DELETE SET NULL;
ALTER TABLE agent_runs ADD COLUMN IF NOT EXISTS trace_id UUID REFERENCES traces(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. FEATURE FLAGS
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE features (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_key   TEXT NOT NULL UNIQUE,
  name          TEXT NOT NULL,
  description   TEXT,
  category      TEXT NOT NULL DEFAULT 'platform',
  default_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  is_experimental BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER features_updated_at
  BEFORE UPDATE ON features FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE feature_flags (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_id    UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  environment   TEXT NOT NULL DEFAULT 'production',
  enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_pct   INTEGER NOT NULL DEFAULT 0 CHECK (rollout_pct >= 0 AND rollout_pct <= 100),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (feature_id, tenant_id, environment)
);

CREATE INDEX idx_feature_flags_tenant ON feature_flags(tenant_id);

CREATE TRIGGER feature_flags_updated_at
  BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE feature_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_flag_id UUID NOT NULL REFERENCES feature_flags(id) ON DELETE CASCADE,
  target_type   TEXT NOT NULL CHECK (target_type IN ('user', 'group', 'role')),
  target_id     UUID NOT NULL,
  enabled       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (feature_flag_id, target_type, target_id)
);

CREATE TABLE feature_evaluations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  feature_key   TEXT NOT NULL,
  user_id       UUID REFERENCES profiles(id) ON DELETE SET NULL,
  result        BOOLEAN NOT NULL,
  reason        TEXT,
  evaluated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feature_evaluations_tenant ON feature_evaluations(tenant_id);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. SECRET MANAGEMENT
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE secrets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  secret_key    TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  scope         TEXT NOT NULL CHECK (scope IN (
    'tenant', 'workspace', 'project', 'plugin', 'integration', 'agent', 'tool'
  )),
  scope_id      UUID,
  storage_type  TEXT NOT NULL DEFAULT 'encrypted' CHECK (storage_type IN ('encrypted', 'external_ref')),
  status        TEXT NOT NULL DEFAULT 'active',
  rotation_due_at TIMESTAMPTZ,
  created_by    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, secret_key)
);

CREATE INDEX idx_secrets_tenant ON secrets(tenant_id);
CREATE INDEX idx_secrets_scope ON secrets(tenant_id, scope);

CREATE TRIGGER secrets_updated_at
  BEFORE UPDATE ON secrets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE secret_versions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id     UUID NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
  version       INTEGER NOT NULL,
  encrypted_value TEXT,
  external_ref  TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  rotated_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (secret_id, version)
);

CREATE TABLE secret_access_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  secret_id     UUID NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
  accessor_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  access_type   TEXT NOT NULL CHECK (access_type IN ('read', 'rotate', 'revoke')),
  success       BOOLEAN NOT NULL DEFAULT TRUE,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_secret_access_logs_secret ON secret_access_logs(secret_id);

CREATE TABLE secret_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  secret_id     UUID NOT NULL REFERENCES secrets(id) ON DELETE CASCADE,
  principal_type TEXT NOT NULL CHECK (principal_type IN ('user', 'role', 'agent', 'plugin')),
  principal_id  UUID NOT NULL,
  permission    TEXT NOT NULL DEFAULT 'read',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (secret_id, principal_type, principal_id)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. AI EVALUATION FRAMEWORK
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE eval_datasets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  dataset_key   TEXT NOT NULL,
  name          TEXT NOT NULL,
  description   TEXT,
  is_platform   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_eval_datasets_tenant_key ON eval_datasets(tenant_id, dataset_key) WHERE tenant_id IS NOT NULL;
CREATE INDEX idx_eval_datasets_tenant ON eval_datasets(tenant_id);

CREATE TRIGGER eval_datasets_updated_at
  BEFORE UPDATE ON eval_datasets FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE eval_cases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dataset_id    UUID NOT NULL REFERENCES eval_datasets(id) ON DELETE CASCADE,
  case_key      TEXT NOT NULL,
  input         JSONB NOT NULL DEFAULT '{}',
  expected      JSONB NOT NULL DEFAULT '{}',
  dimensions    JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (dataset_id, case_key)
);

CREATE INDEX idx_eval_cases_dataset ON eval_cases(dataset_id);

CREATE TABLE eval_runs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  dataset_id    UUID NOT NULL REFERENCES eval_datasets(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  agent_id      UUID REFERENCES agents(id) ON DELETE SET NULL,
  prompt_version_id UUID REFERENCES prompt_versions(id) ON DELETE SET NULL,
  model_id      UUID REFERENCES model_registry(id) ON DELETE SET NULL,
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  started_at    TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eval_runs_tenant ON eval_runs(tenant_id);

CREATE TABLE eval_results (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id        UUID NOT NULL REFERENCES eval_runs(id) ON DELETE CASCADE,
  case_id       UUID NOT NULL REFERENCES eval_cases(id) ON DELETE CASCADE,
  dimension     TEXT NOT NULL,
  score         NUMERIC(5,4),
  passed        BOOLEAN,
  output        JSONB,
  human_score   NUMERIC(5,4),
  reviewer_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eval_results_run ON eval_results(run_id);

CREATE TABLE eval_rubrics (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID REFERENCES tenants(id) ON DELETE CASCADE,
  dimension     TEXT NOT NULL,
  name          TEXT NOT NULL,
  criteria      JSONB NOT NULL DEFAULT '{}',
  weight        NUMERIC(5,2) NOT NULL DEFAULT 1.0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eval_rubrics_tenant ON eval_rubrics(tenant_id);

CREATE TABLE eval_regression_reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  baseline_run_id UUID NOT NULL REFERENCES eval_runs(id) ON DELETE CASCADE,
  comparison_run_id UUID NOT NULL REFERENCES eval_runs(id) ON DELETE CASCADE,
  summary       JSONB NOT NULL DEFAULT '{}',
  regressions   JSONB NOT NULL DEFAULT '[]',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eval_regression_reports_tenant ON eval_regression_reports(tenant_id);
