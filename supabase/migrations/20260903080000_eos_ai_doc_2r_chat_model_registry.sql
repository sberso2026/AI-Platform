-- EOS-AI-DOC-2R: governed OpenAI chat model for AI Director routing.
-- Embeddings remain a separate model. Credentials stay in platform env / secret management.

INSERT INTO model_registry (
  id, tenant_id, provider_id, model_key, display_name, context_window,
  supports_text, supports_tools, supports_json_mode,
  cost_input_per_1k, cost_output_per_1k, latency_class, risk_class, status
) VALUES (
  '00000000-0000-4000-8000-0000000000e3',
  NULL,
  '00000000-0000-4000-8000-0000000000e1',
  'gpt-4o-mini',
  'OpenAI GPT-4o mini (chat)',
  128000,
  TRUE, TRUE, TRUE,
  0.150000, 0.600000,
  'fast', 'low', 'active'
)
ON CONFLICT (id) DO UPDATE
SET display_name = EXCLUDED.display_name,
    status = 'active',
    supports_text = TRUE,
    supports_tools = TRUE;

INSERT INTO model_capabilities (model_id, capability, metadata)
VALUES (
  '00000000-0000-4000-8000-0000000000e3',
  'chat',
  jsonb_build_object(
    'modality', 'text',
    'activation_state', 'active',
    'tenant_eligibility', 'all',
    'purpose', 'ai_director_generation'
  )
)
ON CONFLICT (model_id, capability) DO UPDATE
SET metadata = EXCLUDED.metadata;

-- Prefer the chat model over seeded mock routes for generation intents.
INSERT INTO model_routes (tenant_id, intent, model_id, priority, is_active)
SELECT t.id, i.intent, '00000000-0000-4000-8000-0000000000e3'::uuid, 50, TRUE
FROM tenants t
CROSS JOIN (
  VALUES ('engineering'), ('general'), ('knowledge'), ('analysis'), ('workflow')
) AS i(intent)
ON CONFLICT (tenant_id, intent, priority) DO NOTHING;
