-- Phase 6C-2 Production Provider Closure: governed embedding model registry metadata
-- text-embedding-3-small @ 1536 matches project_intelligence_document_embeddings.embedding_vector

INSERT INTO model_providers (id, tenant_id, provider_key, name, provider_type, status, is_system)
VALUES (
  '00000000-0000-4000-8000-0000000000e1',
  NULL,
  'openai',
  'OpenAI',
  'openai',
  'active',
  TRUE
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO model_registry (
  id, tenant_id, provider_id, model_key, display_name, context_window,
  supports_text, supports_tools, supports_json_mode,
  cost_input_per_1k, cost_output_per_1k, latency_class, risk_class, status
) VALUES (
  '00000000-0000-4000-8000-0000000000e2',
  NULL,
  '00000000-0000-4000-8000-0000000000e1',
  'text-embedding-3-small',
  'OpenAI text-embedding-3-small (1536)',
  8191,
  TRUE, FALSE, FALSE,
  0.020000, 0,
  'fast', 'low', 'active'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO model_capabilities (model_id, capability, metadata)
VALUES (
  '00000000-0000-4000-8000-0000000000e2',
  'embedding',
  jsonb_build_object(
    'embedding_dimension', 1536,
    'version', 'text-embedding-3-small@1536',
    'activation_state', 'active',
    'tenant_eligibility', 'all',
    'data_classification_policy', 'engineering-document-content',
    'region', 'provider-default',
    'batch_size', 64,
    'timeout_ms', 60000,
    'retry_policy', jsonb_build_object('max_attempts', 4, 'base_delay_ms', 500, 'max_delay_ms', 8000),
    'cost_per_1k_tokens', 0.02,
    'rate_limit_per_minute', 3000,
    'privacy_terms_ref', 'docs/security/PROJECT_INTELLIGENCE_DOCUMENT_PROVIDER_SECURITY.md',
    'fallback_policy', 'azure-openai-same-model-or-fail-closed',
    'deprecation_state', 'none',
    'database_vector_dimension', 1536
  )
)
ON CONFLICT (model_id, capability) DO UPDATE
SET metadata = EXCLUDED.metadata;
