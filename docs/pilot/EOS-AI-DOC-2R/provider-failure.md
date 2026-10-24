# Provider route repair

## Original failure

```
AI_PROVIDER_FAILURE_LAYER=observability
AI_PROVIDER_FAILURE_CAUSE=complete_span_single_json_coerce
```

Trace:

Engineering AI UI → `/api/engineering/ai` → Engineering OS grounded ask → Kernel AI Director → Prompt Registry → Model Registry → adapter → provider → response parser → span complete.

The generation adapter ran (mock). Observability `completeSpan().single()` then threw `Cannot coerce the result to a single JSON object`, and the Director run was marked failed.

## Why mock was selected

- Director had only `MockModelAdapter` registered.
- Tenant model routes preferred mock-gpt.
- Preview Vercel had no chat provider credential.

## Repair (canonical only)

- Register OpenAI/Azure adapters on the Kernel Director.
- Resolve credentials from existing platform env (`PLATFORM_LLM_API_KEY` / `OPENAI_API_KEY` / `PLATFORM_EMBEDDING_API_KEY`). Secrets are not logged or hardcoded.
- Model Registry skips embedding models and does not silently fall back to mock when a chat route is required.
- Span/event persistence cannot fail a successful generation.
- `tryGenerate` treats `model_provider=mock` as failure (`mock_adapter_selected`) and keeps retrieved evidence.

Live Preview generation: `generationProvider=openai`, `ENGINEERING_AI_PROVIDER_ROUTE_PASS=true`.
