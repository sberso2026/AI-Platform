# EOS-3-HOTFIX-1 — Guided Engineering Inference Isolation

## Purpose

Targeted engineering-integrity hotfix after manual validation of **PILOT-010 — KGP Compressor Upgrade**.

Does **not** start a new architecture-development phase. Does **not** redesign UI, sidebar, or major layouts. Does **not** add an intelligence layer.

## Defects (HVAL)

| ID | Defect | Fix |
|----|--------|-----|
| HVAL-001 | Cross-project contamination (`pilot-001-template`, PILOT-001) | Project-scoped inference; forbid other-project synthetic sources |
| HVAL-002 | Unsupported numeric fact (`Assume 12 t`) | Extract numerics only when literal in current objective/documents |
| HVAL-003 | Premature Structural Modification classification | Project nature vs WP pattern separation; brownfield process plant upgrade |
| HVAL-004 | Contaminated readiness (mass/drawings bias) | Multidisciplinary applicable Concept Definition denominator |
| HVAL-005 | Premature structural solution options | Finding-before-solution gate; empty options at concept start |
| HVAL-006 | Guided task cross-project examples (`12 t → 15 t`) | Tasks derived from current project state only |

## Inference order

```text
User Objective
  → Project / System Classification
  → Primary Asset / System Context
  → Candidate Affected Disciplines
  → Stakeholders
  → Information Gaps
  → Concept Work Packages
  → Discipline-Specific Engineering
  → Engineering Findings
  → Solution Alternatives
```

## Root causes

1. **Cross-project contamination** — Guided generator hardcoded `source: "pilot-001-template"` and defaulted project identity/examples from PILOT-001.
2. **12 t value** — Generator invented `Assume operating mass 12 t` whenever mass keywords appeared, regardless of objective text.
3. **PILOT-001 template leak** — Reusable/template path injected factual synthetic values and provenance pointing at PILOT-001.
4. **Structural narrowing** — Entire project classified as `Structural Modification` from support/foundation keywords.
5. **Readiness bias** — Denominator dominated by mass confirmation / drawings / structural assumptions.

## Implementation

Primary module: `apps/web/src/lib/engineering/eos3-guided-engineering.ts` (v2 isolated).

- `classifyProjectFromObjective` — project nature separate from WP pattern hint
- `extractSourcedNumericFacts` — literal extraction only
- `conceptInformationGaps` — gaps instead of fake assumptions
- No premature CALC / DEC / structural OPT at concept start
- `resetContaminatedGuidedProposals` — soft-clear PROPOSED generated state for retest
- `auditGuidedInferenceIsolation` — isolation audit flags

UI: readiness percentage only when explainable; otherwise “Readiness cannot yet be reliably calculated” (`guided-panel.tsx`).

## Retest

Prefer preserving PILOT-010 defect evidence. Clean retest via **PILOT-011** using the exact PILOT-010 objective/reason on the normal Guided Engineering path. No seeded corrective state.

## Database

`DATABASE_SCHEMA_CHANGED=NO` · `MIGRATION_COUNT_ADDED=0`

## Qualification / formulas

No qualification boundary change. No engineering formula/result semantics change.
