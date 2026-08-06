# Inspection Intelligence — Schema Plan

**Phase:** 9A · Design only · No production product migration in this phase

## Principles

- Additive, namespaced tables under inspection domain
- Foreign keys / refs to shared-domain IDs; no duplicated Core tables
- RLS: tenant + workspace isolation consistent with Engineering OS
- Empty hosted schema smoke is optional; default for 9A is design-only

## Proposed table families (future batches)

1. `inspection_plans`, `inspection_plan_assets` (asset_id refs)
2. `inspection_templates`, `inspection_template_revisions`, `inspection_checklist_items`
3. `inspection_sessions`, `inspection_assignments`
4. `inspection_observations`, `measurements`
5. `inspection_evidence` (file_id / hash / type)
6. `defects`, `recommendations` (inspection-process scope)
7. `inspection_reviews`, `inspection_approvals`
8. `inspection_report_derivatives`

## Out of scope for 9A apply

Do not ship commercial schema as a product release. Phase 9B introduces the first vertical-slice migration after framework lock.

## Compatibility

- Project Intelligence v1 schema untouched
- Release tag `project-intelligence-v1.0.0` immutable
