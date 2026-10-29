# EOS 3.2 EOS 2 → EOS 3 Object Mapping

`EOS_2_TO_EOS3_OBJECT_MAPPING_DEFINED=YES`

`EOS_2_TO_EOS_3_MIGRATION_EXECUTED=NO`

`EOS_2_DATA_REWRITE_PERFORMED=NO`

Mapping lives in `apps/web/src/lib/engineering/eos3-object-mapping.ts`.

| EOS 3 object | Status | Transformation needed | Notes |
| --- | --- | --- | --- |
| Project | EXTENDED | NO | Generation metadata only |
| EngineeringBasis | EXTENDED | NO | Typed relations |
| Requirement | EXTENDED | YES | Deeper SE fields / allocation |
| System | EXTENDED | YES | Hierarchy first-class |
| DisciplineObject | EXTENDED | YES | Neutral envelope |
| Revision | EXTENDED | NO | Immutability + provenance |
| Interface | EXTENDED | NO | Preserve authority |
| Change | EXTENDED | NO | Separate from Impact |
| Impact | EXTENDED | NO | Human materiality |
| Decision | EXTENDED | YES | Human decision-maker |
| Assumption | EXTENDED | YES | First-class |
| Calculation | EXTENDED | NO | Qualification metadata |
| Review | EXTENDED | NO | No AI impersonation |
| Evidence | EXTENDED | NO | Inference ≠ source evidence |
| Deliverable | EXTENDED | NO | Stale + authority |
| Baseline | EXTENDED | NO | Immutable membership |
| Asset | EXTENDED | YES | Continuity foundation |
| Inspection | EXTENDED | YES | Metadata foundation |
| OptimizationRun | NEW_EOS3_OBJECT | YES | Result ≠ decision |

Future migration must be explicit, opt-in, and evidence-backed (EOS-3.9).
