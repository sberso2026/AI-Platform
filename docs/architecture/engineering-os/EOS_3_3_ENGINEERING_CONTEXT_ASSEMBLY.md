# EOS 3.3 Engineering Context Assembly

`EOS_3_ENGINEERING_CONTEXT_ASSEMBLY_IMPLEMENTED=YES`

`EOS_3_CONTEXT_AUTHORITY_METADATA=PASS`

`EOS_3_CONTEXT_BUDGETING_IMPLEMENTED=YES`

`EOS_3_FACT_INFERENCE_SEPARATION=PASS`

`EOS_3_RETRIEVAL_SOURCE_TRACEABILITY=PASS`

`EOS_3_RETRIEVAL_EVIDENCE_CLASSIFICATION=PASS`

`EOS_3_UNSUPPORTED_ANSWER_ABSTENTION=PASS`

`EOS_3_RETRIEVAL_ABSTENTION_MODEL_IMPLEMENTED=YES`

## Context pack

Assembles bounded items: canonical objects, revisions, requirements, interfaces, changes, assumptions, calculations, evidence, decisions, deliverables, baseline context, controlled document passages.

Each item carries source type, authority, revision, provenance, evidence class, access scope.

## Budgeting

Select by authority, relevance, graph distance, revision status, evidence diversity — not maximum token vanity.

## Evidence classes

`FACT | INFERENCE | ASSUMPTION | RECOMMENDATION | RESULT | HUMAN_DECISION`

Model-derived synthesis remains INFERENCE/RECOMMENDATION. Abstention states: `SUFFICIENT_EVIDENCE | INSUFFICIENT_EVIDENCE | CONFLICTING_EVIDENCE | ACCESS_RESTRICTED`.

## Module

`eos3-context-assembly.ts`
