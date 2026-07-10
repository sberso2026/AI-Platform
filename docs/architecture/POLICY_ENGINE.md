# Policy Engine

## Purpose

Safety and governance gate for RTB AI Platform agent runs and tool use. Evaluates conditions and returns allow / deny / review / approval actions. Simulation mode supported for dry-runs.

## Service Class

`PolicyEngineService` — `@rtb/platform-intelligence`

Primary API: `listPolicies(tenantId)`, `evaluate(context: PolicyEvaluationContext)`.

## Key Tables

| Table | Role |
|-------|------|
| `policies` | Policy header (priority, category, `is_platform`) |
| `policy_versions` | Version markers |
| `policy_conditions` | Condition type + operator + value |
| `policy_actions` | Action type + parameters |
| `policy_evaluations` | Evaluation audit trail |
| `policy_violations` | Recorded violations |

**Condition types:** confidence, risk, role, tenant setting, model provider, tool permission, human review, data classification, OS scope, workflow state.

**Action types:** `allow`, `deny`, `require_review`, `require_approval`, `redact`, `escalate`, `log_only`.

## Seed Platform Policies

- `low_confidence_review` — confidence &lt; 0.7 → review
- `engineering_review_required` — engineering OS scope → review (no autonomous approval)
- `high_risk_tool_approval` — high/critical risk → approval

## API Route

`GET|POST /api/platform/policies`  
→ `kernel.intelligence.policies`

## UI Route

`/platform/policies`

## Integration Points

- **AI Director** — evaluate before/after model completion; set `review_required`
- **Tool Registry** — risk-based tool gates
- **Model Registry** — `model_provider_allowed` conditions
- **Evaluations** — `policy_compliance` dimension
