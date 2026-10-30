# EOS-3-WORKFLOW-1 — Engineering Pattern Engine

`EOS_ENGINEERING_PATTERN_ENGINE=PASS`  
`EOS_ENGINEERING_PATTERN_WORK_PACKAGE_LEVEL=YES`  
`EOS_ONE_PROJECT_ONE_PATTERN_ASSUMPTION=NO`  
`EOS_UNIVERSAL_LIFECYCLE_ASSUMPTION=REMOVED`

Pattern defines how a class of engineering work normally progresses.  
It does **not** approve engineering, grant technical authority, or force one lifecycle per Project.

## Modules

- `eos3-engineering-pattern-registry.ts` — catalog / stages / gates
- `eos3-engineering-pattern-engine.ts` — assignment, suggestion, gates, exceptions
- API: `/api/engineering/projects/[projectId]/engineering-patterns`
- Migration: `20261030220000_eos_3_workflow_1_engineering_patterns.sql`

## UI

Compact **Work Type** on Work Package cockpit only. No sidebar item. No Home evaluation.
