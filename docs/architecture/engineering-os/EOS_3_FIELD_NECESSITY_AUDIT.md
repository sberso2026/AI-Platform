# EOS 3 — Field Necessity Audit

`EOS_FIELD_NECESSITY_AUDIT_COMPLETE=YES`  
`EOS_UNJUSTIFIED_REQUIRED_FIELD_COUNT=0`

Source of truth: `apps/web/src/lib/engineering/eos3-field-necessity-audit.ts`

## REQUIRED_HUMAN_INPUT (justified)

| Field | Why EOS cannot safely invent it |
|-------|----------------------------------|
| objective | Engineering intent |
| jurisdiction | Material regulatory applicability |
| standardsApplicability | Uncertain code applicability |
| equipmentMass | Material load — propose then confirm |

All other start/setup fields are DERIVED, DEFAULTED, SYSTEM_MANAGED, OPTIONAL, or ADVANCED_ONLY.
