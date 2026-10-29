# EOS 3.2 Canonical Object Model

`EOS_3_CANONICAL_OBJECT_MODEL_IMPLEMENTED=YES`

`EOS_3_STABLE_OBJECT_IDENTITY=PASS`

## Object family status

| Object | Status |
| --- | --- |
| Project | EXTENDED |
| EngineeringBasis | EXTENDED |
| Requirement | EXTENDED |
| System | EXTENDED |
| DisciplineObject | EXTENDED |
| Revision | EXTENDED |
| Interface | EXTENDED |
| Change | EXTENDED |
| Impact | EXTENDED |
| Decision | EXTENDED |
| Assumption | EXTENDED |
| Calculation | EXTENDED |
| Review | EXTENDED |
| Evidence | EXTENDED |
| Deliverable | EXTENDED |
| Baseline | EXTENDED |
| Asset | EXTENDED |
| Inspection | EXTENDED |
| OptimizationRun | NEW_EOS3_OBJECT |

## Identity

Stable identity fields: tenant, workspace, project, generation=3, object type, stable object ID, revision lineage. Display names are not primary identity.

## Schema approach

Polymorphic additive tables (`eos3_objects`, `eos3_object_revisions`, …) extend EOS 2 semantics without duplicating every EOS 2 table solely for a major version. EOS 2 rows are not rewritten.

## Calculation qualification

`IMPLEMENTED != VALIDATED != QUALIFIED` preserved via explicit `qualificationStatus` metadata. Record existence does not imply qualification.
