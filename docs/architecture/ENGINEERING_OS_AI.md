# Engineering OS AI

## Purpose

Governed AI workspace for Engineering OS Core on RTB AI Platform. Runs through Platform Kernel AI Director + Intelligence Layer — **no autonomous engineering approval**.

Service: `EngineeringAIService` · UI: `/engineering/ai` · API: `POST /api/engineering/ai`

## Entry Gate

1. Evaluate feature flag `engineering_os_enabled` for tenant/user
2. Resolve agent (default slug `engineering-director`)
3. Call `kernel.aiDirector.run()` with `context.operating_system = "engineering"`
4. Apply review forcing + notifications
5. Attach prompt/model/trace meta from Intelligence services

## Policy Enforcement

Seeded tenant policies (via `seed_tenant_engineering_os`):

| Policy key | Intent |
|------------|--------|
| `engineering_decision_requires_review` | `require_review` + `block_autonomous_approval` |
| `engineering_low_confidence_requires_review` | Low-confidence outputs need humans |
| `engineering_high_risk_asset_requires_approval` | Critical asset actions need approval |
| `engineering_document_review_requires_traceability` | Reviews need evidence / KG linkage |

Decision-language keywords in the AI service (`approve`, `sign off`, `certify`, …) force `requiresReview = true` even if the Director does not.

Agent row: `requires_review = TRUE`. Notifications: `engineering.review.required`.

## Prompts & Tools

| Prompt key | Role |
|------------|------|
| `engineering_ai_director_system_prompt` | Primary director (safety-critical) |
| `engineering_reviewer_prompt` | Review readiness — no approvals |
| `engineering_document_reviewer_prompt` | Controlled document review |
| `engineering_asset_engineer_prompt` | Asset/hierarchy assistance |
| `engineering_risk_reviewer_prompt` | Risk escalation |

Lookup tools (low risk): project / asset / document / knowledge. Medium: `engineering_report_draft_placeholder`.

## Explicit Rules

| Allowed | Forbidden |
|---------|-----------|
| Draft, summarize, lookup, flag risk | Autonomous approve / sign-off / certify |
| Recommend human review | Bypass Policy Engine |
| Cite knowledge/evidence when available | Silent high-risk asset changes |

Eval smoke dataset `engineering_smoke` asserts review required on approval-style prompts.

## Settings

`engineering_settings.ai_review_threshold` (default `0.7`) supports confidence gating; feature flag remains the hard on/off switch.

## Related

- [POLICY_ENGINE.md](./POLICY_ENGINE.md)
- [PROMPT_REGISTRY.md](./PROMPT_REGISTRY.md)
- [ENGINEERING_OS_PERMISSIONS.md](./ENGINEERING_OS_PERMISSIONS.md)
- [AI_DIRECTOR.md](./AI_DIRECTOR.md)
