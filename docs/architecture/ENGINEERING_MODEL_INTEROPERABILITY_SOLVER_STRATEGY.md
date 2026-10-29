# Engineering Model Interoperability — Solver Strategy (Phase 13A)

Status: interop_discovery · Reuse Digital Twin V1 solver framework

## Decision

**Do NOT create a second solver framework.**

Phase 13A locks reuse of:

1. Digital Twin `EngineeringSolverAdapter`
2. Existing Engineering Tool Framework / Platform Tool Registry (`platform_intelligence`)
3. Four-layer qualification (method / provider / application / execution)

## Qualification honesty

```
solver supported
  ≠ solver qualified
  ≠ project-approved
  ≠ execution-qualified
  ≠ engineering-approved
```

Model accessible ≠ solver executable.

## Project-aware solver policy

- Each project maintains an explicit `projectApprovedProviders` allow-list
- If a requested provider is not approved → **abstain**
- Silent substitute across providers is **forbidden**

## Existing certified path

| Solver | Capability | Status |
| --- | --- | --- |
| CalculiX | `linear_elastic_static` | Digital Twin V1 certified |
| All other reserved stubs | — | reserved / unavailable |

Phase 13A does not expand certified execution.

## CSI family note

Assess whether a shared `CSIInteropCore` reduces duplication for CSI products
(ETABS / SAP2000 / SAFE / CSiBridge), but **product-specific adapters and
qualifications remain separate**.

## Forbidden in 13A

- Production ETABS / SPACE GASS / SAP2000 / ANSYS / Abaqus execution adapters
- Duplicate ETF / solver registry
- Auto-execution / auto-qualification
- Silent fallback to fixture or alternate solver
