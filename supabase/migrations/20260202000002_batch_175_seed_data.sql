-- RTB AI Platform Batch 1.75 — Seed Data

-- Platform capabilities (global templates)
INSERT INTO capabilities (id, tenant_id, capability_key, name, description, category, operating_system, status, is_platform) VALUES
  (gen_random_uuid(), NULL, 'document_search', 'Document Search', 'Search tenant documents and knowledge', 'platform', NULL, 'enabled', TRUE),
  (gen_random_uuid(), NULL, 'agent_orchestration', 'Agent Orchestration', 'Route and execute AI agent tasks', 'platform', NULL, 'enabled', TRUE),
  (gen_random_uuid(), NULL, 'workflow_automation', 'Workflow Automation', 'Execute platform workflows', 'platform', NULL, 'enabled', TRUE),
  (gen_random_uuid(), NULL, 'telemetry_query', 'Telemetry Query', 'Query sensor and telemetry data', 'platform', NULL, 'enabled', TRUE),
  (gen_random_uuid(), NULL, 'digital_twin_query', 'Digital Twin Query', 'Query digital twin state', 'platform', NULL, 'enabled', TRUE);

-- Platform default policies
DO $$
DECLARE
  p_confidence UUID;
  p_engineering UUID;
  p_high_risk UUID;
BEGIN
  INSERT INTO policies (id, tenant_id, policy_key, name, description, category, status, priority, is_platform)
  VALUES (gen_random_uuid(), NULL, 'low_confidence_review', 'Low Confidence Review', 'Outputs below confidence threshold require human review', 'safety', 'active', 10, TRUE)
  RETURNING id INTO p_confidence;

  INSERT INTO policy_conditions (policy_id, condition_type, operator, value)
  VALUES (p_confidence, 'confidence_threshold', 'lt', '{"threshold": 0.7}'::jsonb);

  INSERT INTO policy_actions (policy_id, action_type, parameters)
  VALUES (p_confidence, 'require_review', '{}'::jsonb);

  INSERT INTO policies (id, tenant_id, policy_key, name, description, category, status, priority, is_platform)
  VALUES (gen_random_uuid(), NULL, 'engineering_review_required', 'Engineering Review Required', 'Engineering decisions require qualified reviewer — no autonomous approval', 'safety', 'active', 5, TRUE)
  RETURNING id INTO p_engineering;

  INSERT INTO policy_conditions (policy_id, condition_type, operator, value)
  VALUES (p_engineering, 'operating_system_scope', 'eq', '{"scope": "engineering"}'::jsonb);

  INSERT INTO policy_actions (policy_id, action_type, parameters)
  VALUES (p_engineering, 'require_review', '{"block_autonomous_approval": true}'::jsonb);

  INSERT INTO policies (id, tenant_id, policy_key, name, description, category, status, priority, is_platform)
  VALUES (gen_random_uuid(), NULL, 'high_risk_tool_approval', 'High Risk Tool Approval', 'High-risk tool calls require policy approval', 'safety', 'active', 15, TRUE)
  RETURNING id INTO p_high_risk;

  INSERT INTO policy_conditions (policy_id, condition_type, operator, value)
  VALUES (p_high_risk, 'risk_level', 'in', '{"levels": ["high", "critical"]}'::jsonb);

  INSERT INTO policy_actions (policy_id, action_type, parameters)
  VALUES (p_high_risk, 'require_approval', '{}'::jsonb);
END $$;

-- Platform features
INSERT INTO features (feature_key, name, description, category, default_enabled, is_experimental) VALUES
  ('platform_intelligence', 'Platform Intelligence Layer', 'Enable intelligence control services', 'platform', TRUE, FALSE),
  ('business_os', 'Business OS', 'Business Operating System module', 'operating_system', FALSE, TRUE),
  ('engineering_os', 'Engineering OS', 'Engineering Operating System module', 'operating_system', FALSE, TRUE),
  ('industrial_os', 'Industrial OS', 'Industrial Operating System module', 'operating_system', FALSE, TRUE),
  ('cost_dashboard', 'Cost Dashboard', 'AI cost tracking dashboard', 'platform', TRUE, FALSE),
  ('eval_framework', 'Evaluation Framework', 'AI output evaluation and regression testing', 'platform', TRUE, FALSE);

-- Platform model provider (mock) — global
INSERT INTO model_providers (id, tenant_id, provider_key, name, provider_type, status, is_system)
VALUES ('00000000-0000-4000-8000-000000000001', NULL, 'mock', 'Mock Provider', 'mock', 'active', TRUE);

INSERT INTO model_registry (
  id, tenant_id, provider_id, model_key, display_name, context_window,
  supports_text, supports_tools, supports_json_mode, cost_input_per_1k, cost_output_per_1k,
  latency_class, risk_class, status
) VALUES (
  '00000000-0000-4000-8000-000000000002', NULL,
  '00000000-0000-4000-8000-000000000001',
  'mock-gpt', 'Mock GPT', 8192,
  TRUE, TRUE, TRUE, 0, 0,
  'fast', 'low', 'active'
);

-- Evaluation rubrics (platform defaults)
INSERT INTO eval_rubrics (tenant_id, dimension, name, criteria, weight) VALUES
  (NULL, 'factual_accuracy', 'Factual Accuracy', '{"min_score": 0.8}'::jsonb, 1.0),
  (NULL, 'safety', 'Safety', '{"min_score": 0.9}'::jsonb, 1.5),
  (NULL, 'policy_compliance', 'Policy Compliance', '{"min_score": 1.0}'::jsonb, 1.5),
  (NULL, 'completeness', 'Completeness', '{"min_score": 0.7}'::jsonb, 1.0);

-- Platform evaluation dataset template
INSERT INTO eval_datasets (id, tenant_id, dataset_key, name, description, is_platform)
VALUES ('00000000-0000-4000-8000-000000000010', NULL, 'platform_smoke', 'Platform Smoke Tests', 'Basic platform agent smoke test cases', TRUE);

INSERT INTO eval_cases (dataset_id, case_key, input, expected, dimensions) VALUES
  ('00000000-0000-4000-8000-000000000010', 'greeting', '{"message": "hello"}'::jsonb, '{"contains": "operational"}'::jsonb, '["completeness"]'::jsonb),
  ('00000000-0000-4000-8000-000000000010', 'status_query', '{"message": "platform status"}'::jsonb, '{"contains": "operational"}'::jsonb, '["factual_accuracy", "completeness"]'::jsonb);

-- Per-tenant seed function extension
CREATE OR REPLACE FUNCTION seed_tenant_intelligence(p_tenant_id UUID)
RETURNS VOID AS $$
DECLARE
  v_mock_provider UUID;
  v_mock_model UUID;
  v_tool_id UUID;
  v_prompt_id UUID;
  v_prompt_version_id UUID;
BEGIN
  -- Mock model provider for tenant
  INSERT INTO model_providers (tenant_id, provider_key, name, provider_type, status, is_system)
  VALUES (p_tenant_id, 'mock', 'Mock Provider', 'mock', 'active', TRUE)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_mock_provider;

  IF v_mock_provider IS NULL THEN
    SELECT id INTO v_mock_provider FROM model_providers
    WHERE tenant_id = p_tenant_id AND provider_key = 'mock' LIMIT 1;
  END IF;

  INSERT INTO model_registry (
    tenant_id, provider_id, model_key, display_name, context_window,
    supports_text, supports_tools, cost_input_per_1k, cost_output_per_1k, status
  ) VALUES (
    p_tenant_id, v_mock_provider, 'mock-gpt', 'Mock GPT', 8192,
    TRUE, TRUE, 0, 0, 'active'
  ) ON CONFLICT DO NOTHING
  RETURNING id INTO v_mock_model;

  IF v_mock_model IS NULL THEN
    SELECT id INTO v_mock_model FROM model_registry
    WHERE tenant_id = p_tenant_id AND model_key = 'mock-gpt' LIMIT 1;
  END IF;

  -- Default model routes
  INSERT INTO model_routes (tenant_id, intent, model_id, priority, is_active) VALUES
    (p_tenant_id, 'general', v_mock_model, 100, TRUE),
    (p_tenant_id, 'navigation', v_mock_model, 100, TRUE),
    (p_tenant_id, 'engineering', v_mock_model, 100, TRUE)
  ON CONFLICT DO NOTHING;

  -- Default platform tool
  INSERT INTO ai_tools (tenant_id, tool_key, name, description, category, provider, risk_level, status)
  VALUES (p_tenant_id, 'document_search', 'Document Search', 'Search tenant documents', 'document_search', 'platform', 'low', 'active')
  RETURNING id INTO v_tool_id;

  INSERT INTO ai_tool_versions (tool_id, version, status) VALUES (v_tool_id, '1.0.0', 'active');

  -- Default agent prompt
  INSERT INTO prompts (tenant_id, prompt_key, name, description, agent_type, status, is_safety_critical)
  VALUES (p_tenant_id, 'platform-assistant', 'Platform Assistant', 'Default platform assistant system prompt', 'general', 'active', FALSE)
  RETURNING id INTO v_prompt_id;

  INSERT INTO prompt_versions (prompt_id, version, content, status)
  VALUES (
    v_prompt_id, '1.0.0',
    'You are the RTB AI Platform assistant. Provide accurate, evidence-backed responses. Flag engineering decisions for human review.',
    'active'
  ) RETURNING id INTO v_prompt_version_id;

  -- Enable platform intelligence feature for tenant
  INSERT INTO feature_flags (feature_id, tenant_id, environment, enabled, rollout_pct)
  SELECT f.id, p_tenant_id, 'production', TRUE, 100
  FROM features f WHERE f.feature_key = 'platform_intelligence'
  ON CONFLICT DO NOTHING;

  -- Copy platform capabilities to tenant
  INSERT INTO capabilities (tenant_id, capability_key, name, description, category, operating_system, status, is_platform)
  SELECT p_tenant_id, capability_key, name, description, category, operating_system, status, FALSE
  FROM capabilities WHERE is_platform = TRUE AND tenant_id IS NULL
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hook into tenant creation if function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_tenant') THEN
    -- seed will be called from application layer for existing tenants
    NULL;
  END IF;
END $$;
