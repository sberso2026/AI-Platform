# EOS 3 — Minimum Viable Input UX

`EOS_MINIMUM_VIABLE_INPUT_PRINCIPLE=ENFORCED`

## Rules

- **ASK_ONCE / REUSE_EVERYWHERE** — do not re-prompt for information EOS already holds.
- **GENERATE_FIRST / ASK_LATER** — create PROPOSED/DRAFT state; engineer reviews exceptions.
- **UNCERTAIN → ASK** — never invent material facts.
- **GENERATED ≠ APPROVED** — human engineering authority unchanged.

## Initial project start (≤3 preferred, ≤5 max)

1. What are you trying to do? (required)
2. Why needed (optional if objective is clear)
3. Owner (defaulted from authenticated user)
4. Optional supporting documents

## Implementation

- Engine: `apps/web/src/lib/engineering/eos3-guided-engineering.ts`
- UI: Guided Engineering panel + overview default CTA
- Field audit: `eos3-field-necessity-audit.ts`
