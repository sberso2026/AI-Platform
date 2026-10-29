# EOS 3.6 Solver Input / Result Provenance

`EOS_3_SOLVER_INPUT_MANIFEST_IMPLEMENTED=YES`

`EOS_3_SOLVER_UNIT_COMPATIBILITY_CHECK=PASS`

`EOS_3_SOLVER_AXIS_COMPATIBILITY_CHECK=PASS`

`EOS_3_SOLVER_RESULT_INGESTION_IMPLEMENTED=YES`

`EOS_3_EXTERNAL_RESULT_CLASSIFICATION=PASS`

`EOS_3_SOLVER_RESULT_IMMUTABILITY=PASS`

`EOS_3_SOLVER_RESULT_VALIDATION=PASS`

`EOS_3_SOLVER_RESULT_QUALIFICATION_METADATA=PASS`

`EOS_3_SOLVER_CALCULATION_LINKAGE=PASS`

`EOS_3_SOLVER_DECISION_EVIDENCE_LINKAGE=PASS`

## Input manifest

Captures project/workspace, analysis type, governing revisions, Engineering Basis, assumptions, parameters, units, axis convention, solver version, input hashes, actor, qualification context.

## Results

- Classification always `RESULT` (never `HUMAN_DECISION`)
- Inherit solver qualification state (unqualified solver → unqualified result)
- Immutable instances; rerun creates new result id
- Technical validation: schema fields, units, axis, finite numerics, analysis id, version match
- May link to Calculation and Decision evidence without auto-finalizing Decision
