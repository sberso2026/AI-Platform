# Feature Flags

## Purpose

Progressive enablement of RTB AI Platform features and domain Operating Systems. Separates catalog (`features`) from tenant/environment rollout (`feature_flags`) and targeted assignments.

## Service Class

`FeatureFlagService` — `@rtb/platform-intelligence`

Key methods: `listFeatures`, `listFlags`, `evaluate(FeatureEvaluationInput)`.

## Key Tables

| Table | Role |
|-------|------|
| `features` | Global feature catalog |
| `feature_flags` | Tenant/env enablement + rollout % |
| `feature_assignments` | User/group/role overrides |
| `feature_evaluations` | Evaluation audit |

## Seeded Features

| Key | Default | Notes |
|-----|---------|-------|
| `platform_intelligence` | on | Control layer |
| `cost_dashboard` | on | Costs UI |
| `eval_framework` | on | Evaluations |
| `business_os` | off | Experimental OS |
| `engineering_os` | off | Experimental OS — not started |
| `industrial_os` | off | Experimental OS |

## API Route

`GET|POST /api/platform/features`  
→ `kernel.intelligence.features`

## UI Route

`/platform/features`

## Integration Points

- **Plugin install / OS catalog** — OS modules require flag before install UX
- **UI navigation** — hide unfinished OS modules
- **ENGINEERING_OS_READINESS** — flag stays off until readiness criteria pass
- **Evaluations / Costs** — optional surfaces tied to flags
