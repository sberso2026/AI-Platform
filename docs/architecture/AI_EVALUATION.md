# AI Evaluation

## Purpose

Regression and quality evaluation framework for RTB AI Platform agents, prompts, and models. Dimensions scored from rubrics; human override supported; compare runs for regressions.

## Service Class

`EvaluationFrameworkService` — `@rtb/platform-intelligence`

Key methods: `listDatasets`, `listRuns`, create run/results, regression report helpers.

## Key Tables

| Table | Role |
|-------|------|
| `eval_datasets` | Dataset catalog (`is_platform` templates) |
| `eval_cases` | Input / expected / dimensions |
| `eval_runs` | Run against agent, prompt version, model |
| `eval_results` | Per-case dimension scores |
| `eval_rubrics` | Dimension criteria + weight |
| `eval_regression_reports` | Baseline vs comparison |

**Dimensions:** factual accuracy, evidence alignment, citation quality, completeness, safety, policy compliance, reasoning quality, format compliance, tool use correctness.

Seed: `platform_smoke` dataset + default rubrics (accuracy, safety, policy, completeness).

## API Route

`GET|POST /api/platform/evaluations`  
→ `kernel.intelligence.evaluations`

## UI Route

`/platform/evaluations`  
Gated by feature `eval_framework` (default enabled).

## Integration Points

- **Prompt Registry** — bind `prompt_version_id`
- **Model Registry** — bind `model_id`
- **Agents** — bind `agent_id`
- **Policy Engine** — policy_compliance dimension
- **Feature Flags** — framework visibility
