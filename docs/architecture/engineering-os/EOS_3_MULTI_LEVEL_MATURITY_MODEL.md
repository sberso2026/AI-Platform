# EOS-3-WORKFLOW-2 — Multi-Level Maturity Model

`EOS_MULTI_LEVEL_MATURITY_MODEL=PASS`  
`EOS_WORK_PACKAGE_PRIMARY_MATURITY_BOUNDARY=YES`  
`EOS_NEW_ASSET_MATURITY_MODEL_CREATED=NO`

Separates:
- Project maturity profile (reporting)
- Work Package pattern-native stage (primary execution)
- Deliverable maturity (output development)
- Readiness / Approval / Issue purpose / Schedule progress

Module: `eos3-multi-level-maturity.ts`  
API: `/api/engineering/projects/[projectId]/maturity`  
Migration: `20261030230000_eos_3_workflow_2_multi_level_maturity.sql`
