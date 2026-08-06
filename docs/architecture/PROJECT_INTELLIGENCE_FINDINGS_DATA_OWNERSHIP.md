# Project Intelligence — Findings Data Ownership

**Phase:** 8E  
**Related:** [PROJECT_INTELLIGENCE_FINDINGS_PHASE_8E_RECONCILIATION.md](../migration/PROJECT_INTELLIGENCE_FINDINGS_PHASE_8E_RECONCILIATION.md)

## Product rule

Engineering Core remains authoritative for approved engineering registers.  
Findings Intelligence owns intelligence findings and their review lifecycle.  
A finding is **not** automatically a Core register item.

```text
DI/MI candidate → FI intake → triage/review → accept/reject/defer/duplicate
  → optional conversion proposal → human approve → Core adapter → backlink
```

## Findings Intelligence owns

| Entity | Purpose |
|--------|---------|
| Candidate findings | Intake from DI, MI, manual |
| Accepted intelligence findings | Post-review FI records |
| Finding evidence / citations | Document + transcript lineages |
| Classification / severity suggestions | Advisory until human confirms |
| Conflicts / duplicate groups | Non-destructive dispositions |
| Review items / history | Human review queue |
| Conversion proposals | Pre-Core proposals only |
| Backlinks to Core | After authorised conversion |
| Finding intelligence traces | Observability |
| Pattern summaries | Evidence-grounded patterns |

## Engineering Core owns (approved only)

Decisions, actions, risks, issues, technical queries, lessons, engineering timeline records.

## Boundaries

- Document / Meeting Intelligence emit typed candidates only.
- No AI self-approval.
- No automatic Core mutation.
- No direct Core table writes outside authorised adapters.
- Tenant / workspace / project scoping on all FI rows.
