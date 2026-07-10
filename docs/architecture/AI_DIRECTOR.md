# AI Director Kernel

## Overview

The AI Director is RTB AI OS's foundation orchestration layer. It routes user requests through intent classification, agent selection, model providers, and human review gates.

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| AIDirectorService | `@rtb/platform-kernel` | Orchestrates agent runs |
| KeywordIntentClassifier | `ai-director/intent-classifier.ts` | Intent routing (replaceable) |
| MockModelAdapter | `ai-director/adapters/mock-adapter.ts` | Development model adapter |
| ModelAdapter interface | `@rtb/types` | Provider contract for OpenAI, Anthropic, Gemini, Azure, local |

## Database Tables

- `agents` — Registered agents per tenant
- `agent_runs` — Immutable execution log with confidence, evidence, review status
- `agent_messages` — Per-run conversation messages
- `agent_tools` / `agent_tool_calls` — Tool registry and execution log
- `ai_model_providers` / `ai_model_routes` — Provider and intent routing config

## Flow

```
Command Centre → POST /api/platform/ai-director
  → IntentClassifier.classify()
  → Resolve agent + model route
  → Create agent_run (status: running)
  → Publish agent.run.started event
  → ModelAdapter.complete()
  → Check engineering approval rules
  → Update agent_run (completed | review_required)
  → Publish agent.run.completed / review.required
```

## Safety Rules

1. **No autonomous engineering approval** — engineering intent or keywords trigger `review_required`
2. **Low confidence** (< 0.7) triggers human review
3. **Agent `requires_review` flag** forces review on all outputs
4. Every run logged with model provider, confidence, evidence refs

## Command Centre Integration

The Command Centre calls `POST /api/platform/ai-director` with `{ message }`. Responses include `requiresReview` flag displayed to the user.
