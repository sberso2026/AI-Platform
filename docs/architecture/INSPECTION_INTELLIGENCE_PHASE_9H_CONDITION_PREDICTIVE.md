# Inspection Intelligence — Phase 9H Condition Rating, Predictive Signals, Pack Expansion

**Version:** `0.8.0-condition-predictive`

## Delivered

1. Governed condition rating model (observed / calculated / human-approved / published)
2. Component-to-asset aggregation with uncertainty, missing data, critical rules, abstention
3. Advisory predictive signals (deterministic + statistical); ML providers fail closed
4. Structural condition inspection pack (`structural_condition@1.0.0`)
5. Reporting continuity via existing preparation models
6. Offline draft publication rules and operational hardening checks
7. UI: Condition and Predictive surfaces; overview marker `inspection-intelligence-condition-predictive-ready`

## Explicit non-claims

- No AI Vision inference
- No Asset Intelligence or Digital Twin ownership
- No remaining useful life product claim
- No production ML accuracy claim
- Predictive signals are advisory and must not auto-mutate governed records

## Performance baselines (certified scenarios)

| Scenario | Baseline |
|----------|----------|
| Happy-path condition+predictive unit | < 2s local vitest |
| Phone viewport 390×844 | Playwright pass |
| Tablet viewport 768×1024 | Playwright pass |
| Large history / packs | Exercised via aggregation + multi-signal generation contracts |
