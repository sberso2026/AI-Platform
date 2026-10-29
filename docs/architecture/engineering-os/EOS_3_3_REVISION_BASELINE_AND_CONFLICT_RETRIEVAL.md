# EOS 3.3 Revision, Baseline, and Conflict Retrieval

`EOS_3_REVISION_AWARE_RETRIEVAL=PASS`

`EOS_3_SUPERSEDED_SOURCE_WARNING=PASS`

`EOS_3_BASELINE_AWARE_RETRIEVAL=PASS`

`EOS_3_LIFECYCLE_AWARE_RETRIEVAL=PASS`

`EOS_3_JURISDICTION_AWARE_RETRIEVAL=PASS`

`EOS_3_STANDARD_CONTEXT_PROVENANCE=PASS`

`EOS_3_SOURCE_PRECEDENCE_ENFORCEMENT=PASS`

`EOS_3_CONFLICT_VISIBILITY=PASS`

## Revision states

`CURRENT | SUPERSEDED | HISTORICAL | BASELINE`

Superseded sources surface with explicit warning and cannot silently override canonical current.

## Baseline vs latest

Latest project revision and frozen baseline membership are both valid in context. Retrieval must not substitute latest for baseline membership.

Staging evidence: baseline frozen at Revision A while current is Revision B; conflicts explained.

## Conflict visibility

When documents reference older revisions than canonical current, result state is `CONFLICTING_EVIDENCE` with explicit current vs older explanation — no silent blending.

## Jurisdiction / standards

Sources may carry `jurisdictionContext` and `standardsProfileRef`. Geography alone does not infer governing standard.
